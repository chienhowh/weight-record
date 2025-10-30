'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { getCoach } from '@/app/constants/coaches';
import { useRouter } from 'next/navigation';
import { useSupabaseRecords } from '../hooks/useSupabaseRecords';
import Loading from './Loading';
import CoachMsgCard from './CoachMsgCard';
import AllRecordCard from './AllRecordCard';

export default function Dashboard() {
    const router = useRouter();
    const { settings, coachId, getStats, getRecentRecords, isLoading, saveCoach } = useSupabaseRecords();

    const currentCoach = getCoach(coachId);
    if (isLoading) {
        return <Loading />
    }

    // 如果沒有設定，導向設定頁
    if (!settings) {
        router.push('/setup');
        return null;
    }

    if (!currentCoach) {
        router.push('/');
        return null;
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

    // TODO: 暫不開放
    const handleChangeCoach = async () => {
        if (confirm('確定要更換教練嗎？')) {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">減重追蹤</h1>
                        <button className="text-gray-600 hover:text-gray-800">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

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
