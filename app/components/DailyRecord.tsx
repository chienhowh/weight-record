'use client';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Scale, Dumbbell, StickyNote, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabaseRecordsContext } from '@/app/providers/SupabaseRecordsProvider';
import { EXERCISE } from '@/app/constants/exercises';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/app/providers/ToastProvider';

const EXERCISE_TYPES = EXERCISE;
const DailyRecord = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date().toISOString().split('T')[0];
    const {
        updateRecord,
        addRecord,
        fetchRecordByDate,
        isLoading,
        user,
        coachId,
        getRecentRecords,
        settings
    } = useSupabaseRecordsContext();
    const urlDate = searchParams.get('date');
    const [date, setDate] = useState(urlDate || today);
    const [weight, setWeight] = useState('');
    const [exercised, setExercised] = useState(false);
    const [exerciseType, setExerciseType] = useState('');
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
    const { success } = useToast();
    const recentRecords = getRecentRecords(7);
    const latestRecord = recentRecords[0] || null; // 取得最新記錄

    useEffect(() => {
        loadRecordForDate(date);
    }, [date, user]);

    useEffect(() => {
        if (!existingRecordId) {
            setWeight(latestRecord?.weight.toString() || settings?.startWeight.toString() || '');
        }
    }, [settings, latestRecord, existingRecordId]);


    const loadRecordForDate = async (selectedDate: string) => {
        try {
            const data = await fetchRecordByDate(selectedDate);
            if (data) {
                // 有現有記錄，填入表單
                setWeight(data.weight.toString());
                setExercised(data.exercised);
                setExerciseType(data.exercise_type || '');
                setNote(data.note || '');
                setExistingRecordId(data.id);
            } else {
                setExercised(false);
                setExerciseType('');
                setNote('');
                setExistingRecordId(null);
            }
        } catch (error) {
            console.error('載入記錄失敗:', error);
            alert('載入記錄失敗，請重試');
        }
    };

    // 快速調整體重
    const adjustWeight = (delta: number) => {
        const current = parseFloat(weight) || 0;
        setWeight((current + delta).toFixed(1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!weight) {
            alert('請輸入體重');
            return;
        }

        if (exercised && !exerciseType) {
            alert('請選擇運動類型');
            return;
        }

        setIsSaving(true);

        try {
            const recordData = {
                date,
                weight: parseFloat(weight),
                exercised,
                exerciseType: exercised ? exerciseType : null,
                note: note.trim(),
                coachId,
            };

            if (existingRecordId) {
                // 更新現有記錄
                updateRecord(existingRecordId, recordData)
                success('記錄更新成功！');
            } else {
                addRecord(recordData)
                success('記錄新增成功！');
            }

            router.push('/dashboard');
        } catch (error: any) {
            console.error('儲存失敗:', error);

            // 處理重複記錄錯誤
            if (error.code === '23505') {
                alert('此日期已有記錄，請重新整理頁面後再試');
            } else {
                alert(`儲存失敗: ${error.message || '請重試'}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        {existingRecordId ? '此日期已有記錄，儲存後將會更新現有資料' : '記錄今日數據'}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Date Picker */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <label className="text-lg font-bold text-gray-800">日期</label>
                        </div>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={today}
                            disabled={isLoading || isSaving}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                        />
                    </div>

                    {/* Weight Input */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Scale className="w-5 h-5 text-blue-600" />
                            </div>
                            <label className="text-lg font-bold text-gray-800">體重</label>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="輸入體重"
                                disabled={isLoading || isSaving}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-2xl text-center font-bold"
                            />
                            <span className="text-2xl font-bold text-gray-500">kg</span>
                        </div>

                        {/* Quick Adjust Buttons */}
                        <div className="flex gap-2">
                            {[-0.5, -0.1, 0.1, 0.5].map((delta) => (
                                <button
                                    key={delta}
                                    type="button"
                                    onClick={() => adjustWeight(delta)}
                                    disabled={isLoading || isSaving}
                                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {delta > 0 ? '+' : ''}{delta}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Exercise Toggle */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Dumbbell className="w-5 h-5 text-green-600" />
                                </div>
                                <label className="text-lg font-bold text-gray-800">今天有運動嗎？</label>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setExercised(!exercised);
                                    if (exercised) setExerciseType('');
                                }}
                                className={`
                  relative w-14 h-8 rounded-full transition-colors
                  ${exercised ? 'bg-green-500' : 'bg-gray-300'}
                `}
                            >
                                <div className={`
                  absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform
                  ${exercised ? 'translate-x-6' : 'translate-x-0'}
                `} />
                            </button>
                        </div>

                        {/* Exercise Type Selection */}
                        {exercised && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-600 mb-3">選擇運動類型</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {EXERCISE_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setExerciseType(type.id)}
                                            className={`
                        p-3 rounded-xl border-2 transition-all text-left
                        ${exerciseType === type.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }
                      `}
                                        >
                                            <div className="text-2xl mb-1">{type.emoji}</div>
                                            <div className="text-sm font-medium text-gray-700">{type.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <StickyNote className="w-5 h-5 text-yellow-600" />
                            </div>
                            <label className="text-lg font-bold text-gray-800">備註（選填）</label>
                        </div>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="今天的感想、飲食狀況或其他想記錄的事..."
                            rows={4}
                            disabled={isLoading || isSaving}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2 text-right">
                            {note.length} / 500
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSaving || isLoading}
                        className={`
              w-full py-4 rounded-2xl font-bold text-lg shadow-xl
              transition-all transform
              ${isSaving || isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                            }
            `}
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                儲存中...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Check className="w-6 h-6" />
                                儲存記錄
                            </span>
                        )}
                    </button>
                </form>

                {/* Tips */}
                <div className="mt-6 bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                    <p className="text-sm text-purple-900 font-medium mb-2">💡 小提示</p>
                    <ul className="text-sm text-purple-700 space-y-1">
                        <li>• 建議每天固定時間量體重，數據會更準確</li>
                        <li>• 體重波動是正常的，關注整體趨勢而非單日變化</li>
                        <li>• 運動後體重可能因為水分而暫時增加</li>
                        {existingRecordId && (
                            <li className="font-bold text-blue-700">• 此日期已有記錄，儲存將會更新原有資料</li>
                        )}

                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DailyRecord;