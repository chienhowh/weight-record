'use client';

import { useState, useEffect } from 'react';
import { CoachId } from '@/app/constants/coaches';

const STORAGE_KEY = 'selected-coach';

export function useCoachSelection() {
  const [selectedCoach, setSelectedCoach] = useState<CoachId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 從 localStorage 讀取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidCoachId(stored)) {
      setSelectedCoach(stored as CoachId);
    }
    setIsLoading(false);
  }, []);

  // 儲存到 localStorage
  const saveCoach = (coachId: CoachId) => {
    setSelectedCoach(coachId);
    localStorage.setItem(STORAGE_KEY, coachId);
  };

  // 清除選擇
  const clearCoach = () => {
    setSelectedCoach(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    selectedCoach,
    saveCoach,
    clearCoach,
    isLoading,
  };
}

// 驗證是否為有效的教練 ID
function isValidCoachId(id: string): boolean {
  return ['strict', 'gentle', 'funny', 'scientific', 'flirty'].includes(id);
}