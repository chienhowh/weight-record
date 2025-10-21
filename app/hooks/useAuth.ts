'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 檢查是否已登入
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);

            // 如果沒有 session，自動建立匿名使用者
            if (!session) {
                supabase.auth.signInAnonymously().then(({ data }) => {
                    setUser(data.user);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        // 監聽認證狀態變化
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}