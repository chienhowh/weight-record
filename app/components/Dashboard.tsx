'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Target, Scale, Calendar, Plus, Dumbbell, Flame } from 'lucide-react';
import { getCoach } from '@/app/constants/coaches';
import { useRouter } from 'next/navigation';
import { useSupabaseRecords } from '../hooks/useSupabaseRecords';
import Loading from './Loading';

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
    const weightData = recentRecords.length > 0
        ? recentRecords.map(record => ({
            date: new Date(record.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
            weight: record.weight,
        })).reverse()
        : [{ date: '今天', weight: stats.startWeight }];

    const {
        currentWeight,
        targetWeight,
        weightLost,
        remainingWeight,
        consecutiveDays,
        weeklyExerciseCount,
        weeklyWeightChange,
    } = stats;

    const CoachIcon = currentCoach.icon;

    // TODO: 暫不開放
    const handleChangeCoach = async () => {
        if (confirm('確定要更換教練嗎？')) {
            router.push('/');
        }
    };

    // 運動次數評價
    const getCoachComment = () => {
        if (weeklyExerciseCount >= 5) return {
            text: '🔥 太強了！',
            color: 'text-orange-600',
            bg: 'from-orange-50 to-red-50',
            border: 'border-orange-200'
        };
        if (weeklyExerciseCount >= 3) return {
            text: '💪 維持得很好',
            color: 'text-green-600',
            bg: 'from-green-50 to-emerald-50',
            border: 'border-green-200'
        };
        if (weeklyExerciseCount >= 1) return {
            text: '加油，再多動一點',
            color: 'text-yellow-600',
            bg: 'from-yellow-50 to-amber-50',
            border: 'border-yellow-200'
        };
        return {
            text: '本週還沒運動喔',
            color: 'text-gray-500',
            bg: 'from-gray-50 to-slate-50',
            border: 'border-gray-200'
        };
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

                {/* 核心數據卡片 - 最重要的資訊 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                    {/* 教練資訊 - 精簡版 */}
                    <div className="mb-6 pb-4 border-b">
                        <div className='flex items-center gap-3'>
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentCoach.color} flex items-center justify-center shadow-md`}>
                                <CoachIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">專屬教練</p>
                                <h2 className="text-lg font-bold text-gray-800">{currentCoach.name}</h2>
                            </div>
                            {consecutiveDays > 0 && (
                                <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-full">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-bold text-orange-600">{consecutiveDays}</span>
                                </div>
                            )}
                        </div>
                        <div className={`text-xs pt-4 ${getCoachComment().color}`}>{getCoachComment().text}</div>
                    </div>

                    {/* 主要數據 - 3欄式 */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* 當前體重 - 最大 */}
                        <div className="col-span-3 sm:col-span-1 text-center sm:text-left">
                            <p className="text-sm text-gray-500 mb-1">當前體重</p>
                            <p className="text-4xl font-bold text-gray-800">
                                {currentWeight}
                                <span className="text-xl text-gray-400 ml-1">kg</span>
                            </p>
                        </div>

                        {/* 已減 */}
                        <div className="text-center sm:text-left">
                            <p className="text-sm text-gray-500 mb-1">已減</p>
                            <p className="text-2xl font-bold text-green-600">
                                {weightLost.toFixed(1)}
                                <span className="text-sm text-gray-400 ml-1">kg</span>
                            </p>
                        </div>

                        {/* 目標 */}
                        <div className="text-center sm:text-left">
                            <p className="text-sm text-gray-500 mb-1">目標</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {targetWeight}
                                <span className="text-sm text-gray-400 ml-1">kg</span>
                            </p>
                        </div>
                    </div>

                    {/* 本週數據 - 精簡版橫條 */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* 本週運動 */}
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                            <Dumbbell className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600">本週運動</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {weeklyExerciseCount}
                                    <span className="text-xs text-gray-500 ml-1">次</span>
                                </p>
                            </div>
                        </div>

                        {/* 本週變化 */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${weeklyWeightChange < 0
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                                : weeklyWeightChange > 0
                                    ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'
                                    : 'bg-gray-50 border-gray-100'
                            }`}>
                            <TrendingDown className={`w-5 h-5 flex-shrink-0 ${weeklyWeightChange < 0 ? 'text-green-600' :
                                    weeklyWeightChange > 0 ? 'text-red-600 rotate-180' :
                                        'text-gray-600'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600">本週變化</p>
                                <p className={`text-lg font-bold ${weeklyWeightChange < 0 ? 'text-green-600' :
                                        weeklyWeightChange > 0 ? 'text-red-600' :
                                            'text-gray-600'
                                    }`}>
                                    {weeklyWeightChange > 0 ? '+' : ''}
                                    {weeklyWeightChange.toFixed(1)}
                                    <span className="text-xs text-gray-500 ml-1">kg</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 體重趨勢圖 */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">體重趨勢</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            近 7 天
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={weightData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                style={{ fontSize: '11px' }}
                            />
                            <YAxis
                                domain={['dataMin - 1', 'dataMax + 1']}
                                stroke="#9ca3af"
                                style={{ fontSize: '11px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value) => [`${value} kg`, '體重']}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 快速操作按鈕 - 移到底部 */}
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
