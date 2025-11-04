'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowRight, 
    Heart, 
    LineChart, 
    MessageCircle, 
    Sparkles,
    Calendar,
    Trophy,
    Zap
} from 'lucide-react';
import { COACHES } from '../constants/coaches';

export default function IntroPage() {
    const router = useRouter();

    const coaches = Object.values(COACHES);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
                    {/* Logo/Title */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
                            減重教練 AI
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
                        你的專屬 AI 減重夥伴，每天給你客製化的鼓勵與建議
                    </p>
                    <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                        選擇你喜歡的教練風格，記錄體重和運動，讓 AI 陪你一起達成目標 💪
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                    >
                        立即開始
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
                    為什麼選擇減重教練 AI？
                </h2>
                <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                    結合科技與人性化設計，讓減重變得簡單又有趣
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
                            <Heart className="w-7 h-7 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            5 種教練個性
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            從嚴格督促到溫柔鼓勵，從科學分析到幽默激勵，找到最適合你的教練風格
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4">
                            <MessageCircle className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            AI 個性化回饋
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            每次記錄後，AI 教練會根據你的進度給予專屬的鼓勵和建議
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4">
                            <LineChart className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            視覺化追蹤
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            清晰的圖表和統計數據，讓你一目了然地看到自己的進步
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-4">
                            <Calendar className="w-7 h-7 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            簡單記錄
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            每天只需 30 秒，記錄體重和運動狀況，快速調整按鈕讓輸入更輕鬆
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center mb-4">
                            <Trophy className="w-7 h-7 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            成就追蹤
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            連續運動天數、本週進度、累積減重量，每個里程碑都值得慶祝
                        </p>
                    </div>

                    {/* Feature 6 */}
                    {/* <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-7 h-7 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            完全免費
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            無需付費，無廣告干擾，專注於你的減重目標
                        </p>
                    </div> */}
                </div>
            </div>

            {/* Coaches Section */}
            {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
                    認識你的教練團隊
                </h2>
                <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                    5 位獨特個性的 AI 教練，每一位都有自己的風格
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {coaches.map((coach) => {
                        const Icon = coach.icon;
                        return (
                            <div
                                key={coach.id}
                                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all text-center"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${coach.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    {coach.name}
                                </h3>
                                <p className={`text-sm font-medium mb-3 px-3 py-1 rounded-full inline-block bg-gradient-to-r ${coach.color} text-white`}>
                                    {coach.personality}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {coach.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div> */}

            {/* How it works */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
                        如何開始？
                    </h2>
                    <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                        只需 3 個簡單步驟，立即開始你的減重旅程
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                選擇教練
                            </h3>
                            <p className="text-gray-600">
                                從 5 位教練中選擇最適合你個性的那一位
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                設定目標
                            </h3>
                            <p className="text-gray-600">
                                輸入你的目前體重和目標體重
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                開始記錄
                            </h3>
                            <p className="text-gray-600">
                                每天記錄體重和運動，獲得 AI 教練的回饋
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    {/* <div className="text-center mt-12">
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                        >
                            立即免費開始
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div> */}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6" />
                        <h3 className="text-xl font-bold">減重教練 AI</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                        用 AI 科技，讓減重變得更簡單、更有趣
                    </p>
                    <p className="text-gray-500 text-sm">
                        © 2025 減重教練 AI. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}