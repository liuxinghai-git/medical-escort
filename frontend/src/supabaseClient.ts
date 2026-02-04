import { createClient } from '@supabase/supabase-js';

// 从 VITE 环境变量中读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from VITE environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);