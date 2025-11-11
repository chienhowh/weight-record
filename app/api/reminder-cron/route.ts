import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface UserSettings {
    user_id: string;
    reminder_time: string | null;      // HH:MM:SS 格式 (用戶本地時間)
    reminder_enabled: boolean;
    timezone: string | null;           // IANA 時區名稱，e.g., 'Asia/Taipei'
    last_reminder_sent: string | null; // ISO 8601 Timestamp (UTC)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const CRON_INTERVAL_MINUTES = 15; 
// ⭐ Hobby：一小時才會跑一次，所以時間窗也設 60 分鐘
const CRON_INTERVAL_MINUTES = 60;


// 創建一個擁有管理員權限的 Supabase 客戶端
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false } // 確保這是後端服務
});

/**
 * 檢查提醒是否已在今天發送過
 * @param lastSent ISO 8601 Timestamp 字串
 * @returns boolean
 */
const isSentToday = (lastSent: string | null): boolean => {
    if (!lastSent) return false;

    // 將 lastSent 視為 UTC 時間
    const lastSentDay = dayjs.utc(lastSent).startOf('day');
    const todayUtc = dayjs.utc().startOf('day');

    // 如果上次發送時間（UTC）與今天的 UTC 時間相同，則表示已發送過
    return lastSentDay.isSame(todayUtc, 'day');
};

/**
 * 模擬發送通知 (在實際應用中，這裡可能是 FCM, Email 或 Slack 等)
 * @param userId 用戶 ID
 * @param message 提醒訊息
 */
const sendNotification = async (userId: string, message: string) => {
    // ⭐️ 待辦事項: 這裡替換成你實際的通知服務 (例如 Email, Push Notification) ⭐️

    console.log(`[Notification Sent] User: ${userId} | Message: ${message}`);

    // 模擬實際發送的延遲
    await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Vercel Cron Job 處理函式
 */
export default async function handler(req: NextRequest, res: NextResponse) {
    // 確保只有 POST 請求才能觸發 (Vercel Cron Job 發送的是 POST 請求)
    if (req.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
    }

    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        console.warn('[CRON] Unauthorized call');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('--- Starting Reminder Cron Job Scan ---');

    try {
        // 1. 查詢所有啟用的提醒
        const { data: usersToRemind, error } = await supabaseAdmin
            .from('user_settings')
            .select('user_id, reminder_time, timezone, last_reminder_sent')
            .eq('reminder_enabled', true)
            .not('reminder_time', 'is', null) // 確保時間欄位有值
            .not('timezone', 'is', null);      // 確保時區欄位有值

        if (error) {
            console.error('Supabase 查詢錯誤:', error);
            return NextResponse.json({ message: 'Database query failed' }, { status: 500 });
        }

        const nowUtc = dayjs.utc(); // 伺服器當前時間 (UTC)
        let remindersProcessed = 0;

        // 2. 遍歷用戶，檢查是否需要發送提醒
        for (const userSetting of usersToRemind as UserSettings[]) {
            const { user_id, reminder_time, timezone, last_reminder_sent } = userSetting;

            // a) 檢查今天是否已發送過
            if (isSentToday(last_reminder_sent)) {
                continue;
            }

            // b) 構建用戶在他們時區的「今天」的提醒時間
            // 格式：YYYY-MM-DD HH:MM:SS
            const todayDate = dayjs().tz(timezone!).format('YYYY-MM-DD');
            const reminderDateTimeStr = `${todayDate} ${reminder_time}`;

            // c) 將用戶的本地提醒時間轉換成 UTC
            // 這是我們判斷發送的目標 UTC 時間點
            const targetUtcTime = dayjs.tz(reminderDateTimeStr, timezone!).utc();

            // d) 判斷當前 UTC 時間是否落入發送窗口 (目標時間 ± CRON_INTERVAL_MINUTES / 2)
            // 為了防止漏發，我們使用一個略大的窗口。
            const startTimeWindow = targetUtcTime.subtract(CRON_INTERVAL_MINUTES / 2, 'minute');
            const endTimeWindow = targetUtcTime.add(CRON_INTERVAL_MINUTES / 2, 'minute');

            const isReadyToSend = nowUtc.isAfter(startTimeWindow) &&
                nowUtc.isBefore(endTimeWindow);

            if (isReadyToSend) {
                // 3. 發送通知
                // 訊息暫定為一個通用訊息，你可以讓用戶在前端自定義
                const message = "👋 提醒您該記錄體重了！讓我們繼續朝目標邁進 💪";
                await sendNotification(user_id, message);

                // 4. 更新 last_reminder_sent 狀態
                // 儲存當前 UTC 時間，作為下次判斷是否已發送的依據
                const { error: updateError } = await supabaseAdmin
                    .from('user_settings')
                    .update({ last_reminder_sent: nowUtc.toISOString() })
                    .eq('user_id', user_id);

                if (updateError) {
                    console.error(`更新用戶 ${user_id} 的提醒狀態失敗:`, updateError);
                } else {
                    remindersProcessed++;
                }
            }
        }

        console.log(`--- Cron Job Scan Finished. Total Reminders Sent: ${remindersProcessed} ---`);
        return NextResponse.json({
            message: 'Reminder scan complete.',
            processed: remindersProcessed,
            scanTimeUtc: nowUtc.toISOString()
        }, { status: 200 });

    } catch (e) {
        console.error('Cron Job 發生意外錯誤:', e);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}