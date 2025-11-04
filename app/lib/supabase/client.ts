// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
import { createBrowserClient } from '@supabase/ssr'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables not loaded.');
}
export const supabaseClient = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)

// 資料庫類型定義（對應我們的 schema）
export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          target_weight: number;
          start_weight: number;
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          target_weight: number;
          start_weight: number;
          start_date: string;
        };
        Update: {
          target_weight?: number;
          start_weight?: number;
          start_date?: string;
        };
      };
      user_coaches: {
        Row: {
          id: string;
          user_id: string;
          coach_id: string;
          selected_at: string;
        };
        Insert: {
          user_id: string;
          coach_id: string;
        };
        Update: {
          coach_id?: string;
        };
      };
      weight_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          exercised: boolean;
          exercise_type: string | null;
          note: string | null;
          ai_response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          weight: number;
          exercised: boolean;
          exercise_type?: string | null;
          note?: string | null;
          ai_response?: string | null;
        };
        Update: {
          weight?: number;
          exercised?: boolean;
          exercise_type?: string | null;
          note?: string | null;
          ai_response?: string | null;
        };
      };
    };
  };
}