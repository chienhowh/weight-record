'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from './useAuth';

export interface WeightRecord {
    id: string;
    date: string;
    weight: number;
    exercised: boolean;
    exerciseType: string | null;
    note: string;
    aiResponse?: string | null;
    createdAt: string;
}

export interface UserSettings {
    targetWeight: number;
    startWeight: number;
    startDate: string;
}

export interface Stats {
    currentWeight: number;
    targetWeight: number;
    startWeight: number;
    weightLost: number;
    remainingWeight: number;
    consecutiveDays: number;
    weeklyExerciseCount: number;
    weeklyWeightChange: number;
    totalRecords: number;
}

export function useSupabaseRecords() {
    const { user, loading: authLoading } = useAuth();
    const [records, setRecords] = useState<WeightRecord[]>([]);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [coachId, setCoachId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 載入資料
    useEffect(() => {
        if (!user) return;

        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // 載入設定
            const { data: settingsData } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (settingsData) {
                setSettings({
                    targetWeight: settingsData.target_weight,
                    startWeight: settingsData.start_weight,
                    startDate: settingsData.start_date,
                });
            }

            // 載入教練選擇
            const { data: coachData } = await supabase
                .from('user_coaches')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (coachData) {
                setCoachId(coachData.coach_id);
            }

            // 載入記錄
            const { data: recordsData } = await supabase
                .from('weight_records')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (recordsData) {
                setRecords(
                    recordsData.map((r) => ({
                        id: r.id,
                        date: r.date,
                        weight: r.weight,
                        exercised: r.exercised,
                        exerciseType: r.exercise_type,
                        note: r.note || '',
                        aiResponse: r.ai_response,
                        createdAt: r.created_at,
                    }))
                );
            }
        } catch (error) {
            console.error('載入資料失敗:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 儲存設定
    const saveSettings = async (newSettings: UserSettings) => {
        if (!user) return;

        try {
            const { error } = await supabase.from('user_settings').upsert({
                user_id: user.id,
                target_weight: newSettings.targetWeight,
                start_weight: newSettings.startWeight,
                start_date: newSettings.startDate,
            }, { onConflict: 'user_id' });

            if (error) throw error;

            setSettings(newSettings);
        } catch (error) {
            console.error('儲存設定失敗:', error);
            throw error;
        }
    };

    // 儲存教練選擇
    const saveCoach = async (newCoachId: string) => {
        if (!user) return;

        try {
            const { error } = await supabase.from('user_coaches').upsert({
                user_id: user.id,
                coach_id: newCoachId,
            }, { onConflict: 'user_id' });

            if (error) throw error;

            setCoachId(newCoachId);
        } catch (error) {
            console.error('儲存教練選擇失敗:', error);
            throw error;
        }
    };

    // 新增記錄
    const addRecord = async (record: Omit<WeightRecord, 'id' | 'createdAt' | 'aiResponse'>) => {
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from('weight_records')
                .insert({
                    user_id: user.id,
                    date: record.date,
                    weight: record.weight,
                    exercised: record.exercised,
                    exercise_type: record.exerciseType,
                    note: record.note,
                })
                .select()
                .single();

            if (error) throw error;

            const newRecord: WeightRecord = {
                id: data.id,
                date: data.date,
                weight: data.weight,
                exercised: data.exercised,
                exerciseType: data.exercise_type,
                note: data.note || '',
                aiResponse: data.ai_response,
                createdAt: data.created_at,
            };

            setRecords([newRecord, ...records]);
            return newRecord;
        } catch (error) {
            console.error('新增記錄失敗:', error);
            throw error;
        }
    };

    // 更新記錄（例如加上 AI 回應）
    const updateRecord = async (id: string, updates: Partial<WeightRecord>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('weight_records')
                .update({
                    weight: updates.weight,
                    exercised: updates.exercised,
                    exercise_type: updates.exerciseType,
                    note: updates.note,
                    ai_response: updates.aiResponse,
                })
                .eq('id', id);

            if (error) throw error;

            setRecords(
                records.map((r) => (r.id === id ? { ...r, ...updates } : r))
            );
        } catch (error) {
            console.error('更新記錄失敗:', error);
            throw error;
        }
    };

    // 刪除記錄
    const deleteRecord = async (id: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('weight_records')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRecords(records.filter((r) => r.id !== id));
        } catch (error) {
            console.error('刪除記錄失敗:', error);
            throw error;
        }
    };

    // 取得特定日期的記錄
    const getRecordByDate = (date: string) => {
        return records.find((record) => record.date === date);
    };

    // 取得最近 N 天的記錄
    const getRecentRecords = (days: number) => {
        return records.slice(0, days);
    };

    //  從DB
    const fetchRecordByDate = async (date: string) => {
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from('weight_records')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', date)
                .maybeSingle(); // 使用 maybeSingle 避免找不到時拋錯

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching record by date:', error);
            return null;
        }
    };

    // 計算統計
    const getStats = (): Stats | null => {
        if (!settings) {
            return null;
        }

        if (records.length === 0) {
            return {
                currentWeight: settings.startWeight,
                targetWeight: settings.targetWeight,
                startWeight: settings.startWeight,
                weightLost: 0,
                remainingWeight: settings.startWeight - settings.targetWeight,
                consecutiveDays: 0,
                weeklyExerciseCount: 0,
                weeklyWeightChange: 0,
                totalRecords: 0,
            };
        }

        const sortedRecords = [...records].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const latestRecord = sortedRecords[sortedRecords.length - 1];
        const currentWeight = latestRecord.weight;
        const weightLost = settings.startWeight - currentWeight;
        const remainingWeight = currentWeight - settings.targetWeight;

        // 計算連續運動天數
        let consecutiveDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            const record = records.find((r) => r.date === dateStr);

            if (record && record.exercised) {
                consecutiveDays++;
            } else if (i > 0) {
                break;
            }
        }

        // 本週運動次數
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyExerciseCount = records.filter(
            (r) => new Date(r.date) >= oneWeekAgo && r.exercised
        ).length;

        // 本週體重變化
        const weekRecords = records
            .filter((r) => new Date(r.date) >= oneWeekAgo)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let weeklyWeightChange = 0;
        if (weekRecords.length >= 2) {
            weeklyWeightChange =
                weekRecords[weekRecords.length - 1].weight - weekRecords[0].weight;
        }

        return {
            currentWeight,
            targetWeight: settings.targetWeight,
            startWeight: settings.startWeight,
            weightLost,
            remainingWeight,
            consecutiveDays,
            weeklyExerciseCount,
            weeklyWeightChange,
            totalRecords: records.length,
        };
    };

    return {
        user,
        records,
        settings,
        coachId,
        isLoading: authLoading || isLoading,
        addRecord,
        updateRecord,
        deleteRecord,
        saveSettings,
        saveCoach,
        getRecordByDate,
        fetchRecordByDate,
        getRecentRecords,
        getStats,
    };
}