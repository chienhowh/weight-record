import { Dumbbell, TrendingDown, Calendar } from "lucide-react";
import type { Stats } from "../hooks/useSupabaseRecords";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AllRecordCard({ stats, weightData }: { stats: Stats, weightData: { date: string, weight: number }[] }) {
    const {
        currentWeight,
        targetWeight,
        weightLost,
        remainingWeight,
        consecutiveDays,
        weeklyExerciseCount,
        weeklyWeightChange,
    } = stats;

    return (<>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            {/* 主要數據 - 3欄式 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* 當前體重 - 最大 */}
                <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500 mb-1">當前體重</p>
                    <p className="text-2xl sm:text-4xl font-bold text-gray-800">
                        {currentWeight}
                        <span className="text-xl text-gray-400 ml-1">kg</span>
                    </p>
                </div>

                {/* 已減 */}
                <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500 mb-1">已減</p>
                    <p className="text-2xl sm:text-4xl font-bold text-green-600">
                        {weightLost.toFixed(1)}
                        <span className="text-sm text-gray-400 ml-1">kg</span>
                    </p>
                </div>

                {/* 目標 */}
                <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500 mb-1">目標</p>
                    <p className="text-2xl sm:text-4xl font-bold text-blue-600">
                        {targetWeight}
                        <span className="text-sm text-gray-400 ml-1">kg</span>
                    </p>
                </div>
            </div>

            {/* 本週數據 - 精簡版橫條 */}
            <div className="grid grid-cols-2 gap-3">
                {/* 本週運動 */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                    <Dumbbell className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">本週運動</p>
                        <p className="text-lg font-bold text-gray-800">
                            {weeklyExerciseCount}
                            <span className="text-xs text-gray-500 ml-1">次</span>
                        </p>
                    </div>
                </div>

                {/* 本週變化 */}
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${weeklyWeightChange < 0
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                    : weeklyWeightChange > 0
                        ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                    <TrendingDown className={`w-5 h-5 flex-shrink-0 ${weeklyWeightChange < 0 ? 'text-green-600' :
                        weeklyWeightChange > 0 ? 'text-red-600 rotate-180' :
                            'text-gray-600'
                        }`} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">本週變化</p>
                        <p className={`text-lg font-bold ${weeklyWeightChange < 0 ? 'text-green-600' :
                            weeklyWeightChange > 0 ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                            {weeklyWeightChange > 0 ? '+' : ''}
                            {weeklyWeightChange.toFixed(1)}
                            <span className="text-xs text-gray-500 ml-1">kg</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* 體重趨勢圖 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">體重趨勢</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    近 7 天
                </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                    />
                    <YAxis
                        domain={['dataMin - 1', 'dataMax + 1']}
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value) => [`${value} kg`, '體重']}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </>
    );
}