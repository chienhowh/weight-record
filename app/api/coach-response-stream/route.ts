import { NextRequest, NextResponse } from "next/server";
import type { CoachId } from '@/app/constants/coaches';
import { generateCoachResponseStream } from "@/app/lib/ai-service-stream";

export const dynamic = 'force-dynamic'; // 避免 cache
// Rate Limiting (簡易版)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const limit = 10; // 每小時 10 次
    const windowMs = 60 * 60 * 1000; // 1 小時

    const userLimit = requestCounts.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        // 重置計數
        requestCounts.set(userId, {
            count: 1,
            resetTime: now + windowMs,
        });
        return true;
    }

    if (userLimit.count >= limit) {
        return false; // 超過限制
    }

    // 增加計數
    userLimit.count += 1;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            userId,
            coachId,
            weight,
            exercised,
            exerciseType,
            note,
            weightChange,
            weeklyExerciseCount,
            consecutiveDays,
        } = body;

        // 驗證必要欄位
        if (!userId || !coachId || weight === undefined) {
            return NextResponse.json(
                { error: '缺少必要參數' },
                { status: 400 }
            );
        }

        // 檢查 Rate Limit
        if (!checkRateLimit(userId)) {
            return NextResponse.json(
                { error: '請求次數過多，請稍後再試' },
                { status: 429 }
            );
        }

        // 驗證 coachId
        const validCoachIds: CoachId[] = ['strict', 'gentle', 'funny', 'scientific', 'flirty'];
        if (!validCoachIds.includes(coachId as CoachId)) {
            return NextResponse.json(
                { error: '無效的教練 ID' },
                { status: 400 }
            );
        }

        // 生成 AI 回應
        const response = await generateCoachResponseStream({
            coachId: coachId as CoachId,
            weight,
            exercised: exercised ?? false,
            exerciseType: exerciseType ?? null,
            note: note ?? '',
            weightChange: weightChange ?? 0,
            weeklyExerciseCount: weeklyExerciseCount ?? 0,
            consecutiveDays: consecutiveDays ?? 0,
        });
        console.log("🚀 ~ POST ~ response:", response)

        return response;

    } catch (error) {
        console.error('Coach response API error:', error);

        return NextResponse.json(
            {
                error: 'AI 回應生成失敗',
                message: error instanceof Error ? error.message : '未知錯誤'
            },
            { status: 500 }
        );
    }
}
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'coach-response-stream',
        timestamp: new Date().toISOString(),
    });
}
