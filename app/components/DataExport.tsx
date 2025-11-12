import React, { useMemo, useState } from 'react';
import { Download, Calendar, FileText, Filter } from 'lucide-react';
import { useSupabaseRecordsContext } from '../providers/SupabaseRecordsProvider';
import type { WeightRecord } from '../hooks/useSupabaseRecords';
import { getCoach } from '../constants/coaches';
import dayjs from 'dayjs';
import { fetchRecordsByDateRange } from '../services/weight-records-api';

/**
 * 將 JSON 陣列轉換為 CSV 字串
 * 包含標頭和必要的 CSV 轉義（處理逗號和引號）
 * @param arr JSON 數據陣列
 * @param headers 標頭的中文名稱對應
 * @returns CSV 字串
 */
const convertToCSV = (arr: any[], headers: { key: keyof WeightRecord, label: string }[]): string => {
    if (arr.length === 0) return "";

    // 1. 處理標頭
    const headerRow = headers.map(h => h.label).join(',');
    const keys = headers.map(h => h.key);

    // 2. 處理數據行
    const dataRows = arr.map(row => {
        return keys.map(key => {
            let value = row[key];
            // 確保值是字串
            let stringValue = String(value === null || value === undefined ? '' : value);

            // CSV 轉義：如果值包含逗號或引號，則用雙引號包圍，並將內部雙引號轉義為兩個雙引號
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                stringValue = `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    }).join('\n');

    return headerRow + '\n' + dataRows;
};

/**
 * 觸發瀏覽器下載 CSV 檔案
 * @param csvString CSV 格式字串
 * @param filename 檔案名稱
 */
const downloadCSV = (csvString: string, filename: string) => {
    const BOM = "\ufeff";
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });

    // 創建一個隱藏的下載連結
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function DataExport() {
    const { coachId, user } = useSupabaseRecordsContext();
    const [isExporting, setIsExporting] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    // 預設日期計算 (今天 & 30 天前)
    const defaultEndDate = useMemo(() => dayjs(today).format('YYYY-MM-DD'), []);
    const defaultStartDate = useMemo(() => {
        const d = new Date(today);
        d.setDate(d.getDate() - 30);
        return dayjs(d).format('YYYY-MM-DD');
    }, []);

    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);

    const coach = getCoach(coachId);

    if (!coach) return null;

    // 定義 CSV 導出的欄位和中文標頭
    const exportHeaders: { key: keyof WeightRecord, label: string }[] = [
        { key: 'date', label: '日期' },
        { key: 'weight', label: '體重 (kg)' },
        { key: 'exerciseType', label: '運動類型' },
        { key: 'note', label: '備註' },
        { key: 'date', label: '記錄時間' },
        // 排除不必要的欄位如 id
    ];

    const handleExport = async () => {
        if (!user) {
            alert('請先登入');
            return;
        }

        setIsExporting(true);
        const records = await fetchRecordsByDateRange(user.id, startDate, endDate);

        if (records.length === 0) {
            alert('目前沒有體重記錄可以匯出。');
            return;
        }


        try {
            // 1. 轉換數據
            const csvData = convertToCSV(records, exportHeaders);

            // 2. 創建檔案名稱
            const dateString = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const filename = `weight_log_export_${dateString}.csv`;

            // 3. 觸發下載
            downloadCSV(csvData, filename);

        } catch (error) {
            console.error('匯出數據時發生錯誤:', error);
            alert('匯出失敗，請檢查控制台。');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={`p-4 sm:p-8 max-w-xl mx-auto font-inter bg-gray-50 min-h-screen ${coach.bgGradient}`}>
            <h1 className={`text-3xl font-extrabold ${coach.textColor} mb-6 text-center`}>
                數據與匯出
            </h1>

            <div className={`bg-white rounded-2xl shadow-xl p-6 border-2 ${coach.borderColor} space-y-4`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full ${coach.bgColor} flex items-center justify-center`}>
                        <FileText className={`w-6 h-6 text-white`} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                        體重紀錄匯出 (CSV)
                    </h2>
                </div>
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Filter className="w-4 h-4" />
                        篩選區間
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="start-date" className="block text-xs font-medium text-gray-500 mb-1">起始日期</label>
                            <input
                                id="start-date"
                                type="date"
                                value={startDate}
                                disabled={isExporting}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="end-date" className="block text-xs font-medium text-gray-500 mb-1">結束日期</label>
                            <input
                                id="end-date"
                                type="date"
                                value={endDate}
                                disabled={isExporting}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base"
                                max={defaultEndDate} // 結束日期不能晚於今天
                            />
                        </div>
                    </div>
                </div>
                {/* <div className="flex justify-between items-center text-sm font-medium border-t pt-4">
                    <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> 記錄筆數:</span>
                    <span className="text-gray-800 font-bold">{records.length} 筆</span>
                </div> */}


                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`w-full py-3 rounded-xl font-bold text-lg transition-all transform flex items-center justify-center gap-2 ${isExporting
                        ? "bg-gray-400 cursor-not-allowed text-gray-100"
                        : `${coach.bgColor} text-gray-700 hover:shadow-lg active:scale-[0.99]`
                        }`}
                >
                    {isExporting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            準備中...
                        </span>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            下載所有記錄 (CSV)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
