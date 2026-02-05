//import { createClient } from '@supabase/supabase-js';
//import { createClient, Session, User } from '@supabase/supabase-js'; // ⬅️ 从这里引入 Session 和 User
//import { createClient } from '@supabase/supabase-js'; 
//import { Session, User } from '@supabase/supabase-js'; 
// ⬇️⬇️⬇️ 关键修改在这里 ⬇️⬇️⬇️
// 运行时会加载这个库，但不会在打包时尝试解析其内部结构
const { createClient, Session, User } = await import('@supabase/supabase-js');
// ⬆️⬆️⬆️ 关键修改在这里 ⬆️⬆️⬆️

// 从 VITE 环境变量中读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from VITE environment variables.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type { Session, User }; // 导出类型供 AuthContext 使用


