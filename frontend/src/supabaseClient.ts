import { createClient } from '@supabase/supabase-js';
import type { Session, User } from '@supabase/supabase-js';

// 从环境变量读取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { Session, User };
