'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

// 1. 定義 Context 的型別
type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

// 4. 創建存取 Hook
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within <AuthProvider>');
    }
    return context;
}