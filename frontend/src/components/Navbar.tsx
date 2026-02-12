import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Activity, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg"><Activity className="text-white w-5 h-5" /></div>
          <span className="text-xl font-black tracking-tight text-slate-800 uppercase">ChinaMed</span>
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/apply" className="text-sm font-bold text-slate-600 hover:text-blue-600">Register Case</Link>
              {role === 'admin' && <Link to="/admin" className="text-sm font-bold text-red-500">Admin</Link>}
              
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-100 text-slate-400">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:block">{user.email?.split('@')[0]}</span>
                <button onClick={() => supabase.auth.signOut()} className="hover:text-red-500"><LogOut className="w-4 h-4"/></button>
              </div>
            </>
          ) : (
            <Link to="/auth" className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}