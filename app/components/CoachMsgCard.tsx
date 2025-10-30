'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Sparkles, Loader2, Flame } from 'lucide-react';
import { getCoach } from '@/app/constants/coaches';
import type { WeightRecord } from '@/app/hooks/useSupabaseRecords';
import type { Stats } from '@/app/hooks/useSupabaseRecords';

interface CoachMessageCardProps {
    coachId: string | null;
    latestRecord: WeightRecord | null;
    stats: Stats;
}

export default function CoachMsgCard({ coachId, latestRecord, stats }: CoachMessageCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const coach = getCoach(coachId);
    const { consecutiveDays } = stats;
    // 檢查 AI 回應是否還在生成中
    useEffect(() => {
        if (latestRecord && !latestRecord.aiResponse) {
            setIsLoading(true);

            // 30 秒後停止 loading
            const timeout = setTimeout(() => {
                setIsLoading(false);
            }, 30000);

            return () => clearTimeout(timeout);
        } else {
            setIsLoading(false);
        }
    }, [latestRecord]);

    if (!coach || !latestRecord) return null;

    const CoachIcon = coach.icon;
    const hasResponse = !!latestRecord.aiResponse;

    return (
        <div className={`bg-gradient-to-br ${coach.bgGradient} rounded-2xl p-5 border-2 ${coach.borderColor} shadow-lg`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${coach.color} flex items-center justify-center shadow-md`}>
                    <CoachIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{coach.name}</h3>
                </div>

                {consecutiveDays > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-full">
                        💪
                        <span className={`text-sm font-bold ${coach.textColor}`}>{consecutiveDays}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                {isLoading ? (
                    // Loading 狀態
                    <div className="flex items-center gap-3 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p className="text-sm">教練正在思考回應...</p>
                    </div>
                ) : hasResponse ? (
                    // 有 AI 回應
                    <div className="space-y-2">
                        <p className="text-gray-800 leading-relaxed">
                            {latestRecord.aiResponse}
                        </p>
                        <p className="text-xs text-gray-400">
                            {new Date(latestRecord.createdAt).toLocaleString('zh-TW', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                ) : (
                    // 沒有回應（預設訊息）
                    <p className="text-gray-600 text-sm">
                        開始記錄你的減重旅程，讓我給你專屬的鼓勵！
                    </p>
                )}
            </div>
        </div>
    );
}