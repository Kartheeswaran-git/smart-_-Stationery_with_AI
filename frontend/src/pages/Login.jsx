import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { PenLine, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dots-paper flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative stationery elements */}
      <div className="absolute top-10 left-10 opacity-10 -rotate-12 animate-float-pencil">
        <PenLine size={120} className="text-amber-900" />
      </div>

      <div className="max-w-md w-full glass-paper rounded-3xl shadow-2xl border border-amber-100 overflow-hidden relative z-10 transition-all hover:shadow-amber-900/5">
        {/* Header */}
        <div className="bg-ink-900 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500"></div>
          <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-md border border-white/20 shadow-lg rotate-3">
            <PenLine size={40} className="text-amber-400 translate-x-1" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
            Smart Fancy
          </h1>
          <p className="text-amber-200/60 text-xs font-bold uppercase tracking-[0.2em]">Admin Portal</p>
        </div>

        {/* Form */}
        <div className="p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white/50 border border-amber-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all font-medium text-slate-900 placeholder:text-slate-300 shadow-inner"
                placeholder="admin@smartfancy.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white/50 border border-amber-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all font-medium text-slate-900 placeholder:text-slate-300 shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl font-bold flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-900 hover:bg-black text-white py-4.5 rounded-2xl font-bold transition-all transform active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-ink-900/20 group"
              style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-amber-400" />
                  <span className="text-amber-100">Verifying...</span>
                </>
              ) : (
                <>
                  <span className="text-white">Enter Workspace</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-amber-400" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-amber-100/50 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Smart Fancy Proprietary System
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center space-y-3 z-10 px-6">
        <p className="text-slate-500 text-sm font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
          Exclusive Stationery & Fine Writing
        </p>
        <div className="flex items-center justify-center gap-4 text-slate-300">
          <div className="h-[1px] w-8 bg-current"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} Smart Fancy</p>
          <div className="h-[1px] w-8 bg-current"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;