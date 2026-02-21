import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck, Activity, Smartphone, Mail, Lock, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // frontend/src/pages/AuthPage.tsx 修改 handleAuth 函数
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const { data, error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
  
    if (error) {
      alert("Auth Error: " + error.message);
    } else {
      if (isLogin && data.user) {
        // ⬇️ 登录成功后，立即检查是否有历史订单 ⬇️
        try {
          const res = await fetch(`${API_BASE_URL}/api/cases/lookup/${email}`);
          const caseInfo = await res.json();
          
          if (caseInfo.id) {
            // 如果有订单，直接去 Dashboard
            navigate(`/dashboard/${caseInfo.id}`);
          } else {
            // 如果没有订单，去登记页
            navigate('/apply');
          }
        } catch (err) {
          navigate('/apply'); // 出错则默认去登记页
        }
      } else {
        alert("Please check your email to verify your account!");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* 左侧：品牌背书区 */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-between text-white relative overflow-hidden" style="
    margin-top: 40px;>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full-mr-32-mt-32 opacity-50"></div>
        <div className="z-10">
          <div className="flex items-center space-x-2 text-2xl font-black italic tracking-tighter mb-12">
            <Activity className="w-8 h-8" />
            <span>CHINAMED CONCIERGE</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Access China's Top-tier <br/> Medical Experts with Ease.
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 text-blue-100">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span>Verified Escrow Payment Protection</span>
            </li>
            <li className="flex items-center space-x-3 text-blue-100">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span>Direct Booking in Beijing & Shanghai</span>
            </li>
          </ul>
        </div>
        <div className="z-10 text-sm text-blue-200">
          Trusted by 500+ international patients annually.
        </div>
      </div>

      {/* 右侧：表单区 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isLogin ? 'Manage your medical requests and payments' : 'Join us to access professional medical assistance'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="email" required placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password" required placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" placeholder="Phone (Optional)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={20}/> : <UserPlus size={20}/>)}
              <span>{isLogin ? 'Login Now' : 'Register Account'}</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {isLogin ? "New to ChinaMed? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
