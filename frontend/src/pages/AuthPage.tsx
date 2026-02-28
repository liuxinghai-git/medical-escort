import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { 
  LogIn, UserPlus, Loader2, ArrowRight, 
  Activity, ShieldCheck, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🚨 关键点：确保错误信息永远是字符串，防止 React Error #62
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();

  // 如果已经登录，根据角色重定向
  useEffect(() => {
    if (user && role) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(role === 'admin' ? '/admin' : '/apply', { replace: true });
      }
    }
  }, [user, role, navigate, location]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setSuccessMsg("Registration successful! Please check your email for the confirmation link.");
      }
    } catch (err: any) {
      // 🚨 关键修复：将错误对象转换为字符串消息
      console.error("Auth Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* 左侧：品牌展示 (桌面端显示) */}
        <div className="hidden md:flex md:w-5/12 bg-blue-600 p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-40 blur-2xl"></div>
          
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
                <CheckCircle2 size={16} className="mr-2 text-blue-300" /> Secure Escrow Payments
              </li>
              <li className="flex items-center text-sm font-medium text-blue-100">
                <CheckCircle2 size={16} className="mr-2 text-blue-300" /> Bilingual Patient Support
              </li>
              <li className="flex items-center text-sm font-medium text-blue-100">
                <CheckCircle2 size={16} className="mr-2 text-blue-300" /> Tier-1 Hospital Access
              </li>
            </ul>
          </div>

          <div className="z-10 flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            <ShieldCheck size={18} />
            <span>Bank-Level Security</span>
          </div>
        </div>

        {/* 右侧：表单区域 */}
        <div className="flex-1 p-8 md:p-12">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              {isLogin ? 'Access your medical dashboard' : 'Register to start your coordination'}
            </p>
          </div>
          
          {/* 🚨 错误/成功提示框 (确保渲染的是字符串) */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0 mr-3" size={18} />
              <p className="text-red-700 text-xs font-bold leading-relaxed">{errorMsg}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="text-green-500 shrink-0 mr-3" size={18} />
              <p className="text-green-700 text-xs font-bold leading-relaxed">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="e.g. j.doe@example.com"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                onChange={(e) => setEmail(e.target.value)} 
                value={email}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center group disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
              <span>{isLogin ? "Log In" : "Register Now"}</span>
              {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-4 text-slate-300 font-black tracking-widest">or</span></div>
            </div>

            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-blue-600 font-black uppercase tracking-tighter transition-colors"
            >
              {isLogin ? "Need a new account? Join here" : "Already registered? Sign In instead"}
            </button>
          </form>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="fixed bottom-6 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
        ChinaMed Access • Secure Gateway
      </div>
    </div>
  );
}
