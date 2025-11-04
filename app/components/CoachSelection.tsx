"use client";
import { useEffect, useState } from "react";
import { CoachId, COACHES } from "../constants/coaches";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Loading from "./Loading";
import { useSupabaseRecordsContext } from "@/app/providers/SupabaseRecordsProvider";
import { useToast } from "@/app/providers/ToastProvider";

const CoachSelectionPage = () => {
  const router = useRouter();
  const {
    coachId: existingCoachId,
    saveCoach,
    isLoading: dataLoading,
  } = useSupabaseRecordsContext();
  const { success, error: toastError } = useToast();
  const [selectedCoach, setSelectedCoach] = useState<CoachId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"select" | "update">("select");

  useEffect(() => {
    if (!dataLoading && existingCoachId) {
      setSelectedCoach(existingCoachId as CoachId);
      setMode("update");
    }
  }, [existingCoachId, dataLoading]);

  const handleSelectCoach = (coachId: CoachId) => {
    setSelectedCoach(coachId);
  };

  const handleConfirm = async () => {
    if (!selectedCoach) return;

    setIsSaving(true);
    try {
      await saveCoach(selectedCoach);
      if (mode === "select") {
        // 新選擇，導向 setup
        success("教練已儲存，請開始設定目標");
        router.push("/setup");
      } else {
        // 更新教練，返回 dashboard
        success("教練已更新");
        router.push("/dashboard");
      }
    } catch (error) {
      toastError("儲存失敗，請重試");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (dataLoading) {
    return <Loading />;
  }

  const coachList = Object.values(COACHES);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          {/* 模式指示 */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            {mode === "select" ? "選擇你的專屬教練" : "更換專屬教練"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {mode === "select"
              ? "每位教練都有獨特的風格，選擇最能激勵你的那一位，開始你的減重旅程 💪"
              : "選擇新的教練來陪伴你的減重旅程"}
          </p>

          {/* 目前教練提示 */}
          {mode === "update" && existingCoachId && (
            <p className="text-sm text-gray-500 mt-4">
              目前教練：
              <span className="font-bold text-gray-700">
                {COACHES[existingCoachId as CoachId]?.name}
              </span>
            </p>
          )}
        </div>

        {/* Coach Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {coachList.map((coach) => {
            const Icon = coach.icon;
            const isSelected = selectedCoach === coach.id;

            return (
              <div
                key={coach.id}
                onClick={() => handleSelectCoach(coach.id)}
                className={`
                  relative cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${
                    isSelected
                      ? "scale-105 shadow-2xl"
                      : "shadow-lg hover:shadow-xl"
                  }
                `}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 z-10 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                <div
                  className={`
                  bg-white rounded-2xl p-6 h-full border-4 transition-all
                  ${
                    isSelected
                      ? `${coach.borderColor} border-opacity-100`
                      : "border-transparent"
                  }
                `}
                >
                  {/* Icon */}
                  <div
                    className={`
                    w-16 h-16 rounded-full bg-gradient-to-br ${coach.color} 
                    flex items-center justify-center mb-4 mx-auto
                  `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Name & Type */}
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                    {coach.name}
                  </h3>
                  <div
                    className={`
                    inline-block px-3 py-1 rounded-full text-sm font-medium mb-4
                    bg-gradient-to-r ${coach.color} text-white mx-auto block w-fit
                  `}
                  >
                    {coach.personality}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed">
                    {coach.description}
                  </p>

                  {/* Example Speech */}
                  <div
                    className={`
                    bg-gradient-to-br ${coach.bgGradient} rounded-lg p-4 border-l-4 ${coach.borderColor}
                  `}
                  >
                    <p className="text-sm text-gray-700 italic">
                      {coach.examples[0]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center gap-4 pb-8">
          {/* 取消按鈕 (只在更新模式顯示) */}
          {mode === "update" && (
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-8 py-4 rounded-full text-lg font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              取消
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedCoach || isSaving}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold
              transition-all duration-300 transform
              ${
                selectedCoach && !isSaving
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                儲存中...
              </>
            ) : (
              <>
                {mode === "select" ? "開始訓練" : "確認更換"}
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>

        {/* Hint */}
        {!selectedCoach && (
          <p className="text-center text-gray-500 text-sm animate-pulse">
            👆 點擊選擇一位教練開始你的減重計畫
          </p>
        )}

        {/* 變更提示 */}
        {mode === "update" &&
          selectedCoach &&
          selectedCoach !== existingCoachId && (
            <div className="mt-6 max-w-md mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️
                更換教練後，之前的對話記錄不會改變，新的記錄將使用新教練的風格回應
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default CoachSelectionPage;
