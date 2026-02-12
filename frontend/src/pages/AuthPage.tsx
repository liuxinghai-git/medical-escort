import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let error = null;

    if (isLogin) {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      error = loginError;
    } else {
      const { error: registerError } = await supabase.auth.signUp({ email, password });
      error = registerError;
    }

    if (error) {
      alert(`Error: ${error.message}`);
    } else if (isLogin) {
        // 登录成功后，Context会自行更新，并决定跳转
        if (role === 'admin') navigate('/admin');
        else navigate('/');
    } else {
      alert("Registration successful! Please check your email for confirmation.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. yourname@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 6 characters"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
            {isLogin ? <LogIn className='w-5 h-5 ml-2'/> : <UserPlus className='w-5 h-5 ml-2'/>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
