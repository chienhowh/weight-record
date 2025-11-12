import { CoachId } from "../constants/coaches";

export interface WeightRecord {
    id: string;
    date: string;
    weight: number;
    exercised: boolean;
    exerciseType: string | null;
    note: string;
    aiResponse?: string | null;
    createdAt: string;
    coachId: CoachId | null;
}

export interface UserSettings {
    targetWeight: number;
    startWeight: number;
    startDate: string;
    reminderTime: string | null;      // 儲存時間字符串，例如 "18:30:00"
    reminderEnabled: boolean;
    reminderMessage: string | null;
    lastReminderSent?: string; // ISO 8601 Timestamp
    timezone: string;
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