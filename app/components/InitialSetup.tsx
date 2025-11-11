"use client";

import React, { useEffect, useState } from "react";
import { Target, Scale, Calendar, Bell } from "lucide-react";
import { useSupabaseRecordsContext } from "@/app/providers/SupabaseRecordsProvider";
import { useRouter } from "next/navigation";
import { useToast } from "../providers/ToastProvider";

export default function InitialSetup() {
  const router = useRouter();
  const { settings, saveSettings } = useSupabaseRecordsContext();
  const [targetWeight, setTargetWeight] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: toastError } = useToast();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [time, setTime] = useState('18:00');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (settings) {
      setTargetWeight(settings.targetWeight.toString());
      setStartWeight(settings.startWeight.toString());
      setEnabled(settings.reminderEnabled || false);
      setTime(settings.reminderTime || '18:00');
    }
  }, [settings]);
  

  const handleSubmit = async () => {
    if (!targetWeight || !startWeight) {
      success("請填寫所有欄位");
      return;
    }

    const target = parseFloat(targetWeight);
    const start = parseFloat(startWeight);

    if (target >= start) {
      alert("目標體重應該小於起始體重");
      return;
    }

    try {
      setIsSaving(true);
      await saveSettings({
        targetWeight: target,
        startWeight: start,
        startDate: new Date().toISOString().split("T")[0],
        reminderTime: time,
        reminderEnabled: enabled,
        reminderMessage: "請記住，減重是一場持久戰，持之以恒才能看到成果！",
        timezone: userTimezone,
      });
      success("設定成功");
      router.push("/dashboard");
    } catch (error) {
      toastError("儲存失敗，請重試");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // 設置時間，並確保分鐘是 15 的倍數。
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const [hours, minutes] = value.split(':').map(Number);

    // 限制分鐘數為 00, 15, 30, 45
    const restrictedMinutes = Math.floor(minutes / 15) * 15;

    // 格式化回 HH:MM 字符串
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = restrictedMinutes.toString().padStart(2, '0');

    setTime(`${formattedHours}:${formattedMinutes}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            設定你的目標
          </h1>
          <p className="text-gray-600">
            開始你的減重之旅前，先告訴我們一些資訊
          </p>
        </div>

        <div className="space-y-4">
          {/* Start Weight */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <label className="text-lg font-bold text-gray-800">
                目前體重
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                placeholder="輸入目前體重"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-xl text-center font-bold"
              />
              <span className="text-xl font-bold text-gray-500">kg</span>
            </div>
          </div>

          {/* Target Weight */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <label className="text-lg font-bold text-gray-800">
                目標體重
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="輸入目標體重"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-xl text-center font-bold"
              />
              <span className="text-xl font-bold text-gray-500">kg</span>
            </div>
          </div>

          {/* Summary */}
          {startWeight && targetWeight && (
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
              <p className="text-sm text-purple-900 font-medium mb-1">
                目標設定
              </p>
              <p className="text-2xl font-bold text-purple-600">
                減重{" "}
                {(parseFloat(startWeight) - parseFloat(targetWeight)).toFixed(
                  1
                )}{" "}
                kg
              </p>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${enabled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Bell className={`w-5 h-5 transition-colors ${enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>
                <label
                  className={`text-lg font-bold transition-colors cursor-pointer ${enabled ? 'text-indigo-800' : 'text-gray-500'}`}
                  onClick={() => setEnabled(!enabled)} // 點擊文字也可以切換
                >
                  每日提醒
                </label>
              </div>
              {/* 開關 */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => setEnabled(!enabled)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* 時間選擇器 */}
            {enabled && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-base font-medium text-indigo-700">提醒時間 (15分鐘間隔):</span>
                <input
                  type="time"
                  value={time}
                  // 限制使用者輸入的時間只能是 15 分鐘的倍數
                  step="900"
                  onChange={handleTimeChange}
                  className="px-3 py-1 border border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-lg bg-white"
                />
              </div>
            )}
          </div>
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform ${isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              }`}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                儲存中...
              </span>
            ) : (
              "開始記錄"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
