
import { supabaseClient as supabase } from '@/app/lib/supabase/client';
import type { WeightRecord } from '@/app/hooks/useSupabaseRecords';


//fetchRecordsByDateRange from supabase
export const fetchRecordsByDateRange = async (userId: string, start: string, end: string): Promise<WeightRecord[]> => {

    const { data: recordsData } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .order('date');

    if (!recordsData) return [];

    return recordsData.map((r) => ({
        id: r.id,
        date: r.date,
        weight: r.weight,
        exercised: r.exercised,
        exerciseType: r.exercise_type,
        note: r.note || '',
        aiResponse: r.ai_response,
        createdAt: r.created_at,
        coachId: r.coach_id,
    }))
};

