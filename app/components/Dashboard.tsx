'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Target, Scale, Calendar, Plus } from 'lucide-react';
import { COACHES } from '@/app/constants/coaches';
import { useRouter } from 'next/navigation';
import { useCoachSelection } from '@/app/hooks/useCoachSelection';
import { useWeightRecords } from '@/app/hooks/useWeightRecords';

export default function Dashboard() {
    const router = useRouter();
    const { selectedCoach, isLoading: coachLoading, clearCoach } = useCoachSelection();
    const { settings, getStats, getRecentRecords, isLoading: recordsLoading } = useWeightRecords();

    const stats = getStats();
    const recentRecords = getRecentRecords(7);

    if (coachLoading || recordsLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">載入中...</p>
            </div>
        </div>;
    }

    // 如果沒有設定，導向設定頁
    if (!settings) {
        router.push('/setup');
        return null;
    }

    if (!selectedCoach) {
        router.push('/');
        return null;
    }

    // 準備圖表資料
    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">資料載入中...</p>
            </div>
        );
    }

    const weightData = recentRecords.length > 0
        ? recentRecords.map(record => ({
            date: new Date(record.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
            weight: record.weight,
        })).reverse()
        : [{ date: '今天', weight: stats.startWeight }]; // 沒記錄時顯示起始點

    const currentCoach = COACHES[selectedCoach];
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
    const handleChangeCoach = () => {
        clearCoach();
        router.push('/');
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Coach Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentCoach.color} flex items-center justify-center shadow-lg`}>
                            <CoachIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">你的專屬教練</p>
                            <h2 className="text-2xl font-bold text-gray-800">{currentCoach.name}</h2>
                        </div>
                        <button onClick={handleChangeCoach} className="text-gray-400 hover:text-gray-600 text-sm">
                            更換
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Target Weight */}
                    <div className="bg-white rounded-xl shadow p-6 border-2 border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">目標體重</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{targetWeight} <span className="text-lg text-gray-500">kg</span></p>
                    </div>

                    {/* Current Weight */}
                    <div className="bg-white rounded-xl shadow p-6 border-2 border-purple-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Scale className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">當前體重</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{currentWeight} <span className="text-lg text-gray-500">kg</span></p>
                    </div>

                    {/* Weight Lost */}
                    <div className="bg-white rounded-xl shadow p-6 border-2 border-green-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">已減重量</p>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{weightLost.toFixed(1)} <span className="text-lg text-gray-500">kg</span></p>
                    </div>
                </div>

                {/* Weight Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border-2 border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                        <h3 className="text-lg font-bold text-gray-800">體重變化趨勢</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            最近 7 天
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weightData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                domain={[64, 76]}
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
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
                                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-gray-600">還差 <span className="font-bold text-gray-800">{remainingWeight.toFixed(1)} kg</span> 達成目標</span>
                        </div>
                        <div className="text-gray-500">
                            連續記錄 <span className="font-bold text-purple-600">{consecutiveDays}</span> 天 🔥
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => router.push('/record')}
                >
                    <div className="flex items-center justify-center gap-3">
                        <Plus className="w-6 h-6" />
                        <span className="text-xl font-bold">記錄今日數據</span>
                    </div>
                    <p className="text-purple-100 text-sm mt-2">點擊記錄體重和運動狀況</p>
                </button>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-100">
                        <p className="text-sm text-gray-600 mb-1">本週運動</p>
                        <p className="text-2xl font-bold text-gray-800">4 <span className="text-sm text-gray-500">次</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
                        <p className="text-sm text-gray-600 mb-1">本週進度</p>
                        <p className="text-2xl font-bold text-green-600">-0.5 <span className="text-sm text-gray-500">kg</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
