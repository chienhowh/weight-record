'use client';

import React, { useState } from 'react';
import { Target, Scale, Calendar } from 'lucide-react';
import { useSupabaseRecords } from '../hooks/useSupabaseRecords';

interface InitialSetupProps {
    onComplete: () => void;
}

export default function InitialSetup({ onComplete }: InitialSetupProps) {
    const { saveSettings } = useSupabaseRecords();
    const [targetWeight, setTargetWeight] = useState('');
    const [startWeight, setStartWeight] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const handleSubmit = async () => {
        if (!targetWeight || !startWeight) {
            alert('請填寫所有欄位');
            return;
        }

        const target = parseFloat(targetWeight);
        const start = parseFloat(startWeight);

        if (target >= start) {
            alert('目標體重應該小於起始體重');
            return;
        }

        try {
            await saveSettings({
                targetWeight: target,
                startWeight: start,
                startDate: new Date().toISOString().split('T')[0],
            });
            onComplete();
        } catch (error) {
            alert('儲存失敗，請重試');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">設定你的目標</h1>
                    <p className="text-gray-600">開始你的減重之旅前，先告訴我們一些資訊</p>
                </div>

                <div className="space-y-4">
                    {/* Start Weight */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Scale className="w-5 h-5 text-blue-600" />
                            </div>
                            <label className="text-lg font-bold text-gray-800">目前體重</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                step="0.1"
                                value={startWeight}
                                onChange={(e) => setStartWeight(e.target.value)}
                                placeholder="輸入目前體重"
                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-xl text-center font-bold"
                            />
                            <span className="text-xl font-bold text-gray-500">kg</span>
                        </div>
                    </div>

                    {/* Target Weight */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Target className="w-5 h-5 text-green-600" />
                            </div>
                            <label className="text-lg font-bold text-gray-800">目標體重</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                step="0.1"
                                value={targetWeight}
                                onChange={(e) => setTargetWeight(e.target.value)}
                                placeholder="輸入目標體重"
                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-xl text-center font-bold"
                            />
                            <span className="text-xl font-bold text-gray-500">kg</span>
                        </div>
                    </div>

                    {/* Summary */}
                    {startWeight && targetWeight && (
                        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                            <p className="text-sm text-purple-900 font-medium mb-1">目標設定</p>
                            <p className="text-2xl font-bold text-purple-600">
                                減重 {(parseFloat(startWeight) - parseFloat(targetWeight)).toFixed(1)} kg
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform ${isSaving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                儲存中...
                            </span>
                        ) : (
                            '開始記錄'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}