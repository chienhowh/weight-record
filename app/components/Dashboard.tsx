'use client';

import React, { useEffect, useState } from 'react';
import { Plus, LogOut, User } from 'lucide-react';
import { getCoach } from '@/app/constants/coaches';
import { useRouter } from 'next/navigation';
import { useSupabaseRecords } from '../hooks/useSupabaseRecords';
import Loading from './Loading';
import CoachMsgCard from './CoachMsgCard';
import AllRecordCard from './AllRecordCard';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
    const router = useRouter();
    const { settings, coachId, getStats, getRecentRecords, isLoading, saveCoach } = useSupabaseRecords();
    const { user, signOut } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const currentCoach = getCoach(coachId);

    useEffect(() => {
        const handleClickOutside = () => setShowMenu(false);
        if (showMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMenu]);

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

    const handleLogout = async () => {
        if (confirm('確定要登出嗎？')) {
            await signOut();
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">減重追蹤</h1>

                        {/* 使用者選單 */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 hidden sm:block">
                                    {user?.email?.split('@')[0]}
                                </span>
                            </button>

                            {/* 下拉選單 */}
                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-xs text-gray-500">登入身份</p>
                                        <p className="text-sm font-medium text-gray-700 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        登出
                                    </button>
                                </div>
                            )}
                        </div>
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
