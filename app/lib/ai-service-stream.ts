// import OpenAI from 'openai';
import { COACHES, type CoachId } from '@/app/constants/coaches';
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

const ai = new GoogleGenAI({});
const COACHES_TYPE = COACHES;
interface CoachResponseParams {
    coachId: CoachId;
    weight: number;
    exercised: boolean;
    exerciseType: string | null;
    note: string;
    weightChange: number; // 與昨天相比的變化
    weeklyExerciseCount: number;
    consecutiveDays: number;
}

export async function generateCoachResponseStream(params: CoachResponseParams): Promise<Response> {
    const { coachId } = params;

    const coach = COACHES_TYPE[coachId];

    // 建立情境描述
    const userPrompt = `使用者今日記錄：${buildContext(params)}`;


    // 建立 Prompt
    const systemPrompt = `你是「${coach.name}」，一位專業的減重教練。
個性特質：
- 語氣：${coach.tone}
- 風格：${coach.style}

對話範例：
${coach.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

注意事項：
1. 回應控制在 30-50 字以內（繁體中文）
2. 保持你的個性，不要偏離角色
3. 根據使用者的數據給予個性化回應
4. 不要重複使用相同的句子
5. 必須使用繁體中文
6. 避免醫療診斷或極端飲食建議;

請根據以上資訊，用你的個性給予簡短（50-100字）的回應和鼓勵。`;

    try {
        // const completion = await openai.chat.completions.create({
        //     model: 'gpt-4o-mini',
        //     messages: [
        //         { role: 'system', content: systemPrompt },
        //         { role: 'user', content: userPrompt }
        //     ],
        //     max_tokens: 100,
        //     temperature: 0.8, // 增加創意和多樣性
        // });

        // const response = completion.choices[0]?.message?.content?.trim();


        const stream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.8,
            }
        });

        // 核心：將 Gemini Stream 轉換為標準的 Web ReadableStream
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text;
                    // 將每個文字片段編碼並推入 Web Stream
                    controller.enqueue(new TextEncoder().encode(text));
                }
                controller.close();
            },
        });

        // 返回一個 Response Stream 給前端
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Content-Type-Options': 'nosniff', // 安全性考量
            },
        });

    } catch (error) {
        console.error('AI 生成失敗:', error);
        return NextResponse.json(
            { error: 'AI 服務器發生錯誤' },
            { status: 500 }
        );
    }
}

function buildContext(params: CoachResponseParams): string {
    const {
        weight,
        exercised,
        exerciseType,
        note,
        weightChange,
        weeklyExerciseCount,
        consecutiveDays,
    } = params;

    let context = `- 體重：${weight} kg`;

    if (weightChange !== 0) {
        const change = weightChange > 0 ? '增加' : '減少';
        context += `（比昨天${change} ${Math.abs(weightChange).toFixed(1)} kg）`;
    }

    context += `\n- 今天運動：${exercised ? '是' : '否'}`;

    if (exercised && exerciseType) {
        const exerciseNames: Record<string, string> = {
            running: '跑步',
            gym: '重訓',
            yoga: '瑜珈',
            swimming: '游泳',
            cycling: '騎車',
            walking: '走路',
            other: '其他運動'
        };
        context += `（${exerciseNames[exerciseType] || exerciseType}）`;
    }

    context += `\n- 本週運動次數：${weeklyExerciseCount} 次`;
    context += `\n- 連續記錄天數：${consecutiveDays} 天`;

    if (note) {
        context += `\n- 備註：${note}`;
    }

    return context;
}

// 降級處理：AI 失敗時的預設回應
function getFallbackResponse(
    coachId: CoachId,
    exercised: boolean,
    weightChange: number
): string {
    const fallbacks: Record<CoachId, string[]> = {
        strict: [
            '記得保持紀律！持續努力才能看到成果！',
            '不錯！但還不能鬆懈，繼續前進！',
            '今天的表現可以接受，明天要更好！'
        ],
        gentle: [
            '你今天也很努力呢，繼續加油！',
            '每一步都是進步，為自己感到驕傲吧～',
            '你做得很棒，明天也要好好照顧自己喔！'
        ],
        funny: [
            '不錯嘛！繼續這樣下去，你會變超人的 💪',
            '今天的表現給你 8 分！（滿分 10 分啦）',
            '看來你的減重大業進展順利呢 😎'
        ],
        scientific: [
            '記錄完成，數據已收集，請持續追蹤。',
            '根據數據，建議維持目前的運動頻率。',
            '進度正常，建議繼續保持規律運動。'
        ],
        flirty: [
            '今天的你也很棒呢，期待明天更好的你～',
            '看到你的努力，真是讓人心動呢 ❤️',
            '你的進步真的很迷人，繼續加油！'
        ]
    };

    const responses = fallbacks[coachId];
    return responses[Math.floor(Math.random() * responses.length)];
}