'use client';

import React, { useState } from 'react';
import {
    ArrowLeft, Calendar, Scale, Dumbbell, MessageCircle,
    Edit2, Trash2, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCoach } from '../constants/coaches';
import Loading from '../components/Loading';
import { EXERCISE } from '../constants/exercises';
import { useSupabaseRecordsContext } from '../providers/SupabaseRecordsProvider';
import { useToast } from '../providers/ToastProvider';

const EXERCISE_TYPES = EXERCISE;

export default function RecordHistory() {
    const router = useRouter();
    const { records, coachId, deleteRecord, isLoading } = useSupabaseRecordsContext();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterMonth, setFilterMonth] = useState<string>('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const { success } = useToast();
    const coach = getCoach(coachId);

    if (isLoading) {
        return <Loading />;
    }

    // 取得所有可用的月份
    const availableMonths = Array.from(
        new Set(records.map(r => r.date.slice(0, 7)))
    ).sort().reverse();

    // 篩選記錄
    const filteredRecords = filterMonth === 'all'
        ? records
        : records.filter(r => r.date.startsWith(filterMonth));

    // 按日期分組（以月份為單位）
    const groupedRecords = filteredRecords.reduce((groups, record) => {
        const month = record.date.slice(0, 7);
        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(record);
        return groups;
    }, {} as { [key: string]: typeof records });

    const handleEdit = (date: string) => {
        router.push(`/record?date=${date}`);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRecord(id);
            setShowDeleteConfirm(null);
            success('刪除成功');
        } catch (error) {
            alert('刪除失敗，請重試');
            console.error(error);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        return {
            day: date.getDate(),
            weekday: weekdays[date.getDay()],
            fullDate: date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
        };
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        return `${year} 年 ${parseInt(month)} 月`;
    };

    // 空狀態
    if (records.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-gray-600 hover:text-gray-800 p-1"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">記錄歷史</h1>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">還沒有記錄</h2>
                        <p className="text-gray-600 mb-8">開始記錄你的減重旅程吧！</p>
                        <button
                            onClick={() => router.push('/record')}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            記錄第一筆數據
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-gray-600 hover:text-gray-800 p-1"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">記錄歷史</h1>
                                <p className="text-sm text-gray-500">共 {filteredRecords.length} 筆記錄</p>
                            </div>
                        </div>

                        {/* Month Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                            >
                                <option value="all">全部月份</option>
                                {availableMonths.map(month => (
                                    <option key={month} value={month}>
                                        {formatMonth(month)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Records List */}
                {Object.entries(groupedRecords)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([month, monthRecords]) => (
                        <div key={month} className="mb-8">
                            {/* Month Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px flex-1 bg-gray-200"></div>
                                <h2 className="text-lg font-bold text-gray-600">
                                    {formatMonth(month)}
                                </h2>
                                <div className="h-px flex-1 bg-gray-200"></div>
                            </div>

                            {/* Records */}
                            <div className="space-y-3">
                                {monthRecords.map((record) => {
                                    const dateInfo = formatDate(record.date);
                                    const isExpanded = expandedId === record.id;
                                    const isDeleting = showDeleteConfirm === record.id;

                                    return (
                                        <div
                                            key={record.id}
                                            className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden transition-all hover:shadow-lg"
                                        >
                                            {/* Main Info */}
                                            <div className="p-4">
                                                <div className="flex items-start gap-4">
                                                    {/* Date Badge */}
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex flex-col items-center justify-center">
                                                            <div className="text-2xl font-bold text-indigo-600">
                                                                {dateInfo.day}
                                                            </div>
                                                            <div className="text-xs text-indigo-500">
                                                                週{dateInfo.weekday}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Scale className="w-4 h-4 text-gray-400" />
                                                            <span className="text-2xl font-bold text-gray-800">
                                                                {record.weight}
                                                            </span>
                                                            <span className="text-sm text-gray-500">kg</span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {record.exercised ? (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                                    {EXERCISE_TYPES.find((type) => type.id === record.exerciseType)?.emoji}
                                                                    {EXERCISE_TYPES.find((type) => type.id === record.exerciseType)?.label}
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                                    未運動
                                                                </span>
                                                            )}

                                                            {record.aiResponse && (
                                                                <button
                                                                    onClick={() => toggleExpand(record.id)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                                                                >
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    教練回饋
                                                                    {isExpanded ?
                                                                        <ChevronUp className="w-3 h-3" /> :
                                                                        <ChevronDown className="w-3 h-3" />
                                                                    }
                                                                </button>
                                                            )}
                                                        </div>

                                                        {record.note && (
                                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                                {record.note}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => handleEdit(record.date)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="編輯"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(record.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="刪除"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded: AI Response */}
                                            {isExpanded && record.aiResponse && coach && (
                                                <div className={`border-t-2 border-gray-100 p-4 bg-gradient-to-br ${coach.bgGradient}`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${coach.color} flex items-center justify-center flex-shrink-0`}>
                                                            {React.createElement(coach.icon, {
                                                                className: "w-5 h-5 text-white"
                                                            })}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                                {coach.name}
                                                            </p>
                                                            <p className="text-gray-800 leading-relaxed">
                                                                {record.aiResponse}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Delete Confirmation */}
                                            {isDeleting && (
                                                <div className="border-t-2 border-red-100 p-4 bg-red-50">
                                                    <p className="text-sm text-red-800 mb-3">
                                                        確定要刪除這筆記錄嗎？此操作無法復原。
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDelete(record.id)}
                                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                                        >
                                                            確定刪除
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(null)}
                                                            className="flex-1 px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                                        >
                                                            取消
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}