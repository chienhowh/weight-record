// import OpenAI from 'openai';
import type { CoachId } from '@/app/constants/coaches';
import { GoogleGenAI } from "@google/genai";
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

const ai = new GoogleGenAI({});

// 教練個性設定
const COACH_PERSONALITIES = {
    strict: {
        name: '鐵血教官 Tony',
        tone: '嚴厲、直接、不給藉口',
        style: '用軍事化語氣，要求嚴格，督促用戶',
        examples: [
            '還不給我動起來！你的目標可不會自己實現！',
            '體重下降了？很好，但這只是基本！繼續保持！',
            '今天沒運動？明天給我補回來，沒有藉口！'
        ]
    },
    gentle: {
        name: '暖心導師 Luna',
        tone: '溫柔、鼓勵、陪伴',
        style: '用溫暖的話語，多用鼓勵和肯定，避免責備',
        examples: [
            '你已經很棒了！今天也要好好照顧自己喔～',
            '看到你的努力真的好感動，繼續加油！',
            '沒關係的，每個人都有狀況不好的時候，明天再來吧～'
        ]
    },
    funny: {
        name: '幽默大師 Jay',
        tone: '幽默、輕鬆、搞笑',
        style: '用幽默的方式激勵，可以適當開玩笑，使用emoji',
        examples: [
            '體重又上升了？該不會是昨晚偷吃隱形炸雞吧😏',
            '運動了耶！給你一個虛擬的擊掌 🙌',
            '今天休息？沒問題，連肌肉都需要放假呢 😎'
        ]
    },
    scientific: {
        name: '數據博士 Dr. Chen',
        tone: '理性、科學、數據導向',
        style: '用科學數據和邏輯分析，提供專業建議',
        examples: [
            '根據你的 BMI 變化率，建議調整蛋白質攝取比例',
            '本週減重 0.5kg，符合健康減重速率（0.5-1kg/週）',
            '連續運動 3 天，基礎代謝率預估提升 2-3%'
        ]
    },
    flirty: {
        name: '魅力導師 Minro',
        tone: '撩人、自信、激勵',
        style: '用魅力話語激發自信，適當撩人但不過度',
        examples: [
            '看到你的進步，我的心跳都加速了呢 ❤️',
            '今天的你閃閃發光，繼續保持這份魅力！',
            '運動後的你特別迷人，期待明天更棒的你～'
        ]
    }
};

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

export async function generateCoachResponse(params: CoachResponseParams): Promise<string> {
    const {
        coachId,
        weight,
        exercised,
        exerciseType,
        note,
        weightChange,
        weeklyExerciseCount,
        consecutiveDays,
    } = params;

    const coach = COACH_PERSONALITIES[coachId];

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

請根據以上資訊，用你的個性給予簡短（30-50字）的回應和鼓勵。`;

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


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.8,
            }
        });
        if (!response) {
            throw new Error('AI 回應為空');
        }
        console.log(response)
        return response.text ?? "";
    } catch (error) {
        console.error('AI 生成失敗:', error);

        // 降級處理：回傳預設回應
        return getFallbackResponse(coachId, exercised, weightChange);
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