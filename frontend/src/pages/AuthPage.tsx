import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { 
  Loader2, ArrowRight, Activity, ShieldCheck, 
  AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🚨 关键修复：显式定义类型或初始化为 null，确保只存储字符串
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth(); // 获取当前用户状态

  // 🔄 自动重定向：如果用户已登录，直接踢到对应页面
  useEffect(() => {
    if (user) {
      // 如果有之前的跳转意图（比如从受保护页面跳过来的），则返回那里
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // 否则根据角色跳转
        navigate(role === 'admin' ? '/admin' : '/apply', { replace: true });
      }
    }
  }, [user, role, navigate, location]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null); // 清空之前的错误
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // --- 登录逻辑 ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // 登录成功后，useEffect 会自动处理跳转
      } else {
        // --- 注册逻辑 ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // 确保验证邮件跳回正确的地址
            emailRedirectTo: window.location.origin 
          }
        });
        if (error) throw error;
        setSuccessMsg("Registration successful! Check your email to confirm.");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      // 🚨 关键修复：这里必须提取 .message 字符串，不能直接 set(err)
      // Supabase 的错误对象通常包含 message 属性
      const message = err.message || "An unexpected error occurred.";
      
      // 针对常见错误的汉化/优化提示（可选）
      if (message.includes("Invalid login credentials")) {
        setErrorMsg("Incorrect email or password.");
      } else if (message.includes("already registered")) {
        setErrorMsg("User already exists. Please log in.");
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* 左侧：品牌展示 (桌面端显示) */}
        <div className="hidden md:flex md:w-5/12 bg-blue-600 p-10 flex-col justify-between text-white relative overflow-hidden">
          {/* 装饰背景圆圈 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 rounded-full -ml-20 -mb-20 opacity-30 blur-2xl"></div>
          
          <div className="z-10">
            <div className="flex items-center space-x-2 text-2xl font-black italic tracking-tighter mb-10">
              <Activity size={28} />
              <span>CHINAMED<span className="text-blue-200">ACCESS</span></span>
            </div>
            
            <h2 className="text-3xl font-bold leading-tight mb-6">
              Connect to China's <br/>Elite Medical <br/>Network.
            </h2>
            
            <ul className="space-y-4">
              <li className="flex items-center text-sm font-medium text-blue-100">
                <CheckCircle2 size={16} className="mr-3 text-blue-300" /> Secure Escrow Payments
              </li>
              <li className="flex items-center text-sm font-medium text-blue-100">
                <CheckCircle2 size={16} className="mr-3 text-blue-300" /> Bilingual Patient Support
              </li>
              <li className="flex items-center text-sm font-medium text-blue-100">
                <CheckCircle2 size={16} className="mr-3 text-blue-300" /> Tier-1 Hospital Access
              </li>
            </ul>
          </div>

          <div className="z-10 flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 opacity-80">
            <ShieldCheck size={16} />
            <span>Bank-Level Security</span>
          </div>
        </div>

        {/* 右侧：表单区域 */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              {isLogin ? 'Sign in to access your medical dashboard' : 'Register to start your consultation'}
            </p>
          </div>
          
          {/* 错误提示框 */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start animate-pulse">
              <AlertCircle className="text-red-500 shrink-0 mr-3 mt-0.5" size={18} />
              <p className="text-red-700 text-sm font-semibold">{errorMsg}</p>
            </div>
          )}
          
          {/* 成功提示框 */}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start">
              <CheckCircle2 className="text-green-500 shrink-0 mr-3 mt-0.5" size={18} />
              <p className="text-green-700 text-sm font-semibold">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email</label>
              <input 
                type="email" 
                required 
                placeholder="name@example.com"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                onChange={(e) => setEmail(e.target.value)} 
                value={email}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20}/> : null}
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
              {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            {/* 分割线 */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-300 font-bold">or</span></div>
            </div>

            {/* 切换模式按钮 */}
            <div className="text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-sm text-slate-500 hover:text-blue-600 font-bold transition-colors"
              >
                {isLogin ? (
                  <span>New here? <span className="text-blue-600 underline decoration-2 underline-offset-4">Create an account</span></span>
                ) : (
                  <span>Already have an account? <span className="text-blue-600 underline decoration-2 underline-offset-4">Sign in</span></span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* 底部版权 - 移动端显示 */}
      <div className="fixed bottom-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">
        ChinaMed Access
      </div>
    </div>
  );
}
