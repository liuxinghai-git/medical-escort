import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Activity, LogOut, User as UserIcon, LayoutDashboard, FilePlus, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../App';

export default function Navbar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [lastCaseId, setLastCaseId] = useState<string | null>(null);

  // 获取该用户最新的 Case ID，用于动态显示导航项
  useEffect(() => {
    if (user?.email) {
      fetch(`${API_BASE_URL}/api/cases/lookup/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.found) {
            setLastCaseId(data.id);
          } else {
            setLastCaseId(null);
          }
        })
        .catch(err => console.error("Navbar lookup error:", err));
    } else {
      setLastCaseId(null);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLastCaseId(null);
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 px-6 fixed top-0 w-full z-[100] shadow-sm font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo 部分 */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800 uppercase">
            ChinaMed<span className="text-blue-600">Access</span>
          </span>
        </Link>

        {/* 导航右侧菜单 */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {user ? (
            <>
              {/* 如果已经有 Case，显示 My Case，否则显示 Apply Now */}
              {lastCaseId ? (
                <Link to={`/dashboard/${lastCaseId}`} className="flex items-center text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all">
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  My Case
                </Link>
              ) : (
                <Link to="/apply" className="flex items-center text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-2 transition-all">
                  <FilePlus className="w-4 h-4 mr-1.5" />
                  Apply Now
                </Link>
              )}

              {/* 管理员入口：只有 role 为 admin 时显示 */}
              {role === 'admin' && (
                <Link to="/admin" className="flex items-center text-sm font-black text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl border border-red-100 transition-all">
                  <ShieldAlert className="w-4 h-4 mr-1.5" />
                  ADMIN
                </Link>
              )}
              
              {/* 用户信息与退出 */}
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-100">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Status: {role}</span>
                  <span className="text-xs font-bold text-slate-700">{user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
