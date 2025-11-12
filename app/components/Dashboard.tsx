'use client';

import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getCoach } from '@/app/constants/coaches';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/Loading';
import CoachMsgCard from '@/app/components/CoachMsgCard';
import AllRecordCard from '@/app/components/AllRecordCard';
import { useSupabaseRecordsContext } from '@/app/providers/SupabaseRecordsProvider';

export default function Dashboard() {
    const router = useRouter();
    const { settings, coachId, getStats, getRecentRecords, isLoading } = useSupabaseRecordsContext();
    const currentCoach = getCoach(coachId);

    useEffect(() => {
        // 確保數據載入完成後才進行導航檢查
        if (isLoading) {
            return;
        }

        if (!currentCoach) {
            router.push('/coach');
            return;
        }

        if (!settings) {
            router.push('/setup');
            return;
        }

    }, [isLoading, currentCoach, settings, router]);

    if (isLoading) {
        return <Loading />
    }

    const stats = getStats();

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">資料載入中...</p>
            </div>
        );
    }

    // 準備圖表資料
    const recentRecords = getRecentRecords(7);
    const latestRecord = recentRecords[0] || null; // 取得最新記錄

    const weightData = recentRecords.length > 0
        ? recentRecords.map(record => ({
            date: new Date(record.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
            weight: record.weight,
        })).reverse()
        : [{ date: '今天', weight: stats.startWeight }];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* 🆕 教練訊息卡片 - 放在最上方 */}
                <CoachMsgCard
                    coachId={coachId}
                    latestRecord={latestRecord}
                    stats={stats}
                />
                {/* 核心數據卡片 - 最重要的資訊 */}
                <AllRecordCard stats={stats} weightData={weightData} />
                {/* 快速操作按鈕 */}
                <button
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => router.push('/record')}
                >
                    <div className="flex items-center justify-center gap-3">
                        <Plus className="w-6 h-6" />
                        <span className="text-lg font-bold">記錄今日數據</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
