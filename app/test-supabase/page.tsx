'use client';

import { useState, useEffect } from 'react';
import { supabaseClient as supabase } from '@/app/lib/supabase/client';
import { notFound } from 'next/navigation';

export default function TestSupabase() {
    if (process.env.NODE_ENV === 'production') {
        notFound(); // 直接回 404
    }


    const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [testResults, setTestResults] = useState<string[]>([]);

    const addLog = (log: string) => {
        setTestResults(prev => [...prev, `✓ ${log}`]);
    };

    const addError = (log: string) => {
        setTestResults(prev => [...prev, `✗ ${log}`]);
    };

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            setStatus('testing');
            setTestResults([]);

            // Test 1: 檢查環境變數
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                addError('環境變數 NEXT_PUBLIC_SUPABASE_URL 未設定');
                setStatus('error');
                setMessage('請檢查 .env.local 檔案');
                return;
            }
            addLog('環境變數載入成功');

            // Test 2: 測試 Supabase 連線
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            addLog('Supabase 連線成功');

            // Test 3: 建立匿名使用者
            if (!data.session) {
                addLog('沒有現有 session，建立匿名使用者...');
                const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();

                if (signInError) throw signInError;

                setUser(signInData.user);
                addLog(`匿名使用者建立成功！User ID: ${signInData.user?.id}`);
            } else {
                setUser(data.session.user);
                addLog(`已有現有 session！User ID: ${data.session.user.id}`);
            }

            // Test 4: 測試資料庫寫入（user_settings）
            const testSettings = {
                user_id: data.session?.user.id || user?.id,
                target_weight: 65.0,
                start_weight: 75.0,
                start_date: new Date().toISOString().split('T')[0],
            };

            const { data: insertData, error: insertError } = await supabase
                .from('user_settings')
                .upsert(testSettings, { onConflict: 'user_id' })
                .select();

            if (insertError) throw insertError;
            addLog('資料庫寫入測試成功');

            // Test 5: 測試資料庫讀取
            const { data: readData, error: readError } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', testSettings.user_id)
                .single();

            if (readError) throw readError;
            addLog('資料庫讀取測試成功');
            addLog(`讀取到的資料: 目標 ${readData.target_weight}kg, 起始 ${readData.start_weight}kg`);

            // Test 6: 測試教練選擇表
            const testCoach = {
                user_id: testSettings.user_id,
                coach_id: 'gentle',
            };

            const { error: coachError } = await supabase
                .from('user_coaches')
                .upsert(testCoach, { onConflict: 'user_id' });

            if (coachError) throw coachError;
            addLog('教練選擇表測試成功');

            // Test 7: 測試體重記錄表
            const testRecord = {
                user_id: testSettings.user_id,
                date: new Date().toISOString().split('T')[0],
                weight: 72.5,
                exercised: true,
                exercise_type: 'running',
                note: '測試記錄',
            };

            const { error: recordError } = await supabase
                .from('weight_records')
                .upsert(testRecord, { onConflict: 'user_id,date' });

            if (recordError) throw recordError;
            addLog('體重記錄表測試成功');

            setStatus('success');
            setMessage('所有測試通過！✨');

        } catch (error: any) {
            console.error('測試失敗:', error);
            addError(`錯誤: ${error.message}`);
            setStatus('error');
            setMessage(`測試失敗: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Supabase 連線測試
                    </h1>

                    {/* Status */}
                    <div className={`p-4 rounded-lg mb-6 ${status === 'testing' ? 'bg-blue-50 border-2 border-blue-200' :
                        status === 'success' ? 'bg-green-50 border-2 border-green-200' :
                            'bg-red-50 border-2 border-red-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            {status === 'testing' && (
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            )}
                            {status === 'success' && (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                            )}
                            {status === 'error' && (
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">✗</div>
                            )}
                            <p className={`font-medium ${status === 'testing' ? 'text-blue-800' :
                                status === 'success' ? 'text-green-800' :
                                    'text-red-800'
                                }`}>
                                {message || '測試中...'}
                            </p>
                        </div>
                    </div>

                    {/* Test Results */}
                    <div className="space-y-2 mb-6">
                        <h2 className="font-bold text-gray-700 mb-3">測試結果：</h2>
                        {testResults.map((result, index) => (
                            <div key={index} className={`p-2 rounded ${result.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {result}
                            </div>
                        ))}
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-bold text-gray-700 mb-2">使用者資訊：</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>User ID:</strong> {user.id}</p>
                                <p><strong>建立時間:</strong> {new Date(user.created_at).toLocaleString('zh-TW')}</p>
                            </div>
                        </div>
                    )}

                    {/* Retry Button */}
                    <button
                        onClick={testConnection}
                        disabled={status === 'testing'}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        {status === 'testing' ? '測試中...' : '重新測試'}
                    </button>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                        <h3 className="font-bold text-yellow-800 mb-2">💡 如果測試失敗：</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>1. 檢查 .env.local 檔案是否正確設定</li>
                            <li>2. 確認 Supabase 專案的 API keys 是否正確</li>
                            <li>3. 檢查 SQL Schema 是否都執行成功</li>
                            <li>4. 確認 RLS Policies 是否正確設定</li>
                            <li>5. 重新啟動開發伺服器 (pnpm dev)</li>
                        </ul>
                    </div>
                </div>

                {/* Next Steps */}
                {status === 'success' && (
                    <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                        <h3 className="font-bold text-green-800 mb-3">🎉 測試通過！下一步：</h3>
                        <ul className="text-sm text-green-700 space-y-2">
                            <li>✓ Supabase 連線正常</li>
                            <li>✓ 匿名認證可用</li>
                            <li>✓ 資料庫讀寫正常</li>
                            <li className="font-bold mt-3">→ 可以開始整合到實際功能了！</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}