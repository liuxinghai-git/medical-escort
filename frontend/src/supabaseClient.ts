// 文件路径: frontend/src/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'; 
import type { Session, User } from '@supabase/supabase-js'; // ⬅️ 导入类型用 type 关键字

// 从 VITE 环境变量中读取配置
// VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 必须在 Cloudflare Pages 变量中设置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 避免运行时崩溃
  throw new Error("Supabase URL or Anon Key is missing from VITE environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 导出类型供 AuthContext 使用
export type { Session, User };
