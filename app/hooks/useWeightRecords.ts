'use client';

import { useState, useEffect } from 'react';

export interface WeightRecord {
    id: string;
    date: string;
    weight: number;
    exercised: boolean;
    exerciseType: string | null;
    note: string;
    createdAt: string;
}

export interface UserSettings {
    targetWeight: number;
    startWeight: number;
    startDate: string;
}

const RECORDS_KEY = 'weight-records';
const SETTINGS_KEY = 'user-settings';

export function useWeightRecords() {
    const [records, setRecords] = useState<WeightRecord[]>([]);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 從 localStorage 讀取
    useEffect(() => {
        const storedRecords = localStorage.getItem(RECORDS_KEY);
        const storedSettings = localStorage.getItem(SETTINGS_KEY);

        if (storedRecords) {
            setRecords(JSON.parse(storedRecords));
        }

        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }

        setIsLoading(false);
    }, []);

    // 新增記錄
    const addRecord = (record: Omit<WeightRecord, 'id' | 'createdAt'>) => {
        const newRecord: WeightRecord = {
            ...record,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };

        const updatedRecords = [...records, newRecord];
        setRecords(updatedRecords);
        localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));

        return newRecord;
    };

    // 更新記錄
    const updateRecord = (id: string, updates: Partial<WeightRecord>) => {
        const updatedRecords = records.map((record) =>
            record.id === id ? { ...record, ...updates } : record
        );
        setRecords(updatedRecords);
        localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
    };

    // 刪除記錄
    const deleteRecord = (id: string) => {
        const updatedRecords = records.filter((record) => record.id !== id);
        setRecords(updatedRecords);
        localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
    };

    // 儲存設定
    const saveSettings = (newSettings: UserSettings) => {
        setSettings(newSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    };

    // 取得特定日期的記錄
    const getRecordByDate = (date: string) => {
        return records.find((record) => record.date === date);
    };

    // 取得最近 N 天的記錄
    const getRecentRecords = (days: number) => {
        return records
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, days);
    };

    // 計算統計
    const getStats = () => {
        if (!settings) {
            return null;
        }

        // 有設定但沒記錄 → 回傳初始狀態
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

            const record = records.find(r => r.date === dateStr);

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
        const weekRecords = records.filter(
            (r) => new Date(r.date) >= oneWeekAgo
        );
        let weeklyWeightChange = 0;
        if (weekRecords.length > 1) {
            const weekStart = weekRecords[0].weight;
            const weekEnd = weekRecords[weekRecords.length - 1].weight;
            weeklyWeightChange = weekEnd - weekStart;
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
        records,
        settings,
        isLoading,
        addRecord,
        updateRecord,
        deleteRecord,
        saveSettings,
        getRecordByDate,
        getRecentRecords,
        getStats,
    };
}