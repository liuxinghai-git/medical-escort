import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, Session, User } from './supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null; // 确保是字符串
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 找到 fetchUserProfile 函数，确保 catch 和 error 处理如下：
const fetchUserProfile = async (currentUser: User) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();
    
    if (error) {
      console.error("Profile error:", error);
      setRole('user'); // 🚨 强制设为字符串，绝不传 error 对象
      return;
    }
    
    // 确保赋值的是字符串
    setRole(String(data?.role || 'user')); 
  } catch (err) {
    console.error("Auth crash:", err);
    setRole('user'); // 🚨 强制设为字符串
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
