import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, Session, User } from './supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 初始化检查 Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        // 如果已登录，去获取用户角色
        fetchUserProfile(session.user);
      } else {
        // ⬇️⬇️⬇️ 关键修复：如果没有登录，也要停止 Loading！ ⬇️⬇️⬇️
        setLoading(false); 
      }
    });

    // 2. 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          fetchUserProfile(session.user);
        } else {
          setRole(null);
          // ⬇️⬇️⬇️ 关键修复：登出时也要停止 Loading ⬇️⬇️⬇️
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("DB Error:", error.message);
        setRole('user'); // 报错了也设为普通用户，防止页面挂掉
        return;
      }
      
      setRole(data?.role as 'user' | 'admin' || 'user');
    } catch (error) {
      console.error("Crash Error:", err);
      setRole('user'); // 🚨 关键：这里必须传字符串 'user'，绝不能传 err 对象！
    } finally {
      // 无论成功失败，都要停止 Loading
     setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
            {/* 一个简单的加载动画 */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className='text-lg text-gray-600 font-medium'>Loading Session...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
