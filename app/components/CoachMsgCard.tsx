'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getCoach } from '@/app/constants/coaches';
import type { Stats, WeightRecord } from '@/app/hooks/useSupabaseRecords';
import { useRouter } from 'next/navigation';
import { CoachId } from '@/app/constants/coaches';
import { useSupabaseRecordsContext } from '@/app/providers/SupabaseRecordsProvider';

interface CoachMessageCardProps {
    coachId: CoachId | null;
    latestRecord: WeightRecord | null;
    stats: Stats;
}

export default function CoachMsgCard({ coachId, latestRecord, stats }: CoachMessageCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const coach = getCoach(coachId);
    const { consecutiveDays } = stats;
    const router = useRouter();
    const { generateAIResponseStream } = useSupabaseRecordsContext();
    const [aiResponse, setAiResponse] = useState('');
    // 檢查 AI 回應是否還在生成中
    useEffect(() => {
        if (latestRecord && !latestRecord.aiResponse) {
            handleGenerateAIResponse(latestRecord, coachId!);
        }

    }, [latestRecord?.id]);

    if (!coach) return null;

    const CoachIcon = coach.icon;
    const hasResponse = !!latestRecord?.aiResponse;


    const handleGenerateAIResponse = async (latestRecord: WeightRecord, coachId: CoachId) => {
        setIsLoading(true);
        setAiResponse(''); // 清空上次的回覆
        try {
            // 2. 呼叫前端服務函式，並傳入 setResponse
            await generateAIResponseStream(
                latestRecord,
                coachId,
                setAiResponse // 👈 將狀態更新函式傳遞給它
            );
        } catch (e) {
            // generateAIResponseStream 內部已經處理了錯誤顯示，這裡可以忽略或做其他處理
        } finally {
            setIsLoading(false);
        }
    };
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
                <button
                    onClick={() => router.push('/coach')}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    更換教練
                </button>
            </div>

            {/* Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                {!latestRecord ? <p className="text-gray-600 text-sm">
                    開始記錄你的減重旅程，讓我給你專屬的鼓勵！
                </p> : hasResponse ? (
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
                ) : isLoading ? (
                    // Loading 狀態
                    <div className="flex items-center gap-3 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p className="text-sm">教練正在思考回應...</p>
                    </div>
                ) : <p className="text-gray-800 leading-relaxed">
                    {aiResponse}
                </p>
                }
            </div>
        </div>
    );
}