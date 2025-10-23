
import { Flame, Heart, Laugh, Brain, Sparkles } from 'lucide-react';

export const COACHES = {
    strict: {
        id: 'strict',
        name: '鐵血教官 Tony',
        icon: Flame,
        color: 'from-red-500 to-orange-500',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-500',
        textColor: 'text-red-600',
        bgGradient: 'from-red-50 to-orange-50',
        personality: '嚴格督促型',
        description: '不接受任何藉口，用最直接的方式推動你前進',
        example: '「還不給我動起來！你的目標可不會自己實現！」',
    },
    gentle: {
        id: 'gentle',
        name: '暖心導師 Luna',
        icon: Heart,
        color: 'from-pink-500 to-rose-500',
        borderColor: 'border-pink-500',
        bgColor: 'bg-pink-500',
        textColor: 'text-pink-600',
        bgGradient: 'from-pink-50 to-rose-50',
        personality: '溫柔鼓勵型',
        description: '用溫暖的話語陪伴你，每一步進步都值得慶祝',
        example: '「你已經很棒了！今天也要好好照顧自己喔～」',
    },
    funny: {
        id: 'funny',
        name: '幽默大師 Jay',
        icon: Laugh,
        color: 'from-yellow-500 to-amber-500',
        borderColor: 'border-yellow-500',
        bgColor: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        bgGradient: 'from-yellow-50 to-amber-50',
        personality: '搞笑激勵型',
        description: '用笑聲化解壓力，讓減重變成一件有趣的事',
        example: '「體重又上升了？該不會是昨晚偷吃隱形炸雞吧😏」',
    },
    scientific: {
        id: 'scientific',
        name: '數據博士 Dr. Chen',
        icon: Brain,
        color: 'from-blue-500 to-cyan-500',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-600',
        bgGradient: 'from-blue-50 to-cyan-50',
        personality: '科學分析型',
        description: '用數據和邏輯引導你，讓每個決策都有依據',
        example: '「根據你的 BMI 變化率，建議調整蛋白質攝取比例」',
    },
    flirty: {
        id: 'flirty',
        name: '魅力導師 Minro',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        borderColor: 'border-purple-500',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-600',
        bgGradient: 'from-purple-50 to-pink-50',
        personality: '撩人激勵型',
        description: '用魅力話語激發你的自信，讓你越來越迷人',
        example: '「看到你的進步，我的心跳都加速了呢 ❤️」',
    },
} as const;

export type CoachId = keyof typeof COACHES;
export type Coach = typeof COACHES[CoachId];

export function getCoach(coachId: string | null | undefined): Coach | null {
    if (!coachId) return null;

    if (coachId in COACHES) {
        return COACHES[coachId as CoachId];
    }

    return null;
}
