"use client";

import { useSupabaseRecords } from '@/app/hooks/useSupabaseRecords';
import { createContext, useContext } from 'react';

// 1. 定義 Context 的型別
type SupabaseRecordsContextType = ReturnType<typeof useSupabaseRecords>;

const SupabaseRecordsContext = createContext<SupabaseRecordsContextType | undefined>(undefined);

export function SupabaseRecordsProvider({ children }: { children: React.ReactNode }) {
    const supabaseRecords = useSupabaseRecords();

    return (
        <SupabaseRecordsContext.Provider value={supabaseRecords}>
            {children}
        </SupabaseRecordsContext.Provider>
    );
}

// 4. 創建存取 Hook
export function useSupabaseRecordsContext() {
    const context = useContext(SupabaseRecordsContext);
    if (context === undefined) {
        throw new Error('useSupabaseRecords must be used within <SupabaseRecordsProvider>');
    }
    return context;
}