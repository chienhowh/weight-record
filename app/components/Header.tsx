'use client';

import { User, History, LogOut } from "lucide-react";
import { useAuthContext } from "../providers/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
    const { user, signOut } = useAuthContext();
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = () => setShowMenu(false);
        if (showMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMenu]);
    const handleLogout = async () => {
        if (confirm('確定要登出嗎？')) {
            await signOut();
        }
    };
    
    return (
        < div className="bg-white shadow-sm border-b" >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">減重追蹤</h1>

                    {/* 使用者選單 */}
                    {user && <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm text-gray-700 hidden sm:block">
                                {user?.email?.split('@')[0]}
                            </span>
                        </button>

                        {/* 下拉選單 */}
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs text-gray-500">登入身份</p>
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                        {user?.email}
                                    </p>
                                </div>


                                <button
                                    onClick={() => router.push('/history')}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <History className="w-4 h-4" />
                                    歷史紀錄
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    登出
                                </button>
                            </div>
                        )}
                    </div>}
                </div>
            </div>
        </div >)

}