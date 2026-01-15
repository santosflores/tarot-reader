/**
 * Login Form Component
 * Email and password login with links to signup and forgot password
 */

import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AuthLayout } from './AuthLayout';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  // Redirect when user becomes authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Don't navigate here - let the useEffect handle it when user state updates
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // If already logged in, show nothing while redirecting
  if (user && !authLoading) {
    return null;
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your mystical journey"
    >
      <div className="mb-8 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl backdrop-blur-md relative overflow-hidden group/demo">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover/demo:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">
              Quick Access
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('test@test.com');
              setPassword('test123');
            }}
            className="text-[10px] font-bold text-slate-500 hover:text-purple-400 uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
          >
            Auto-Fill
          </button>
        </div>
        <div className="text-xs text-slate-400 grid grid-cols-2 gap-4 relative z-10 font-mono">
          <div className="bg-black/20 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] block text-slate-500 mb-1 uppercase tracking-tighter">Email</span>
            <span className="text-slate-200 truncate block">test@test.com</span>
          </div>
          <div className="bg-black/20 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] block text-slate-500 mb-1 uppercase tracking-tighter">Password</span>
            <span className="text-slate-200 block">test123</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-center gap-3 animate-shake">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
            Email Address
          </label>
          <div className="relative group/input">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-base shadow-inner"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative group/input">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-base shadow-inner"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-900/20 uppercase tracking-[0.2em] text-xs relative overflow-hidden group/btn active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          {loading ? (
            <span className="flex items-center justify-center gap-3 relative z-10">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Opening Portal...
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              Enter The Void <span className="text-sm">→</span>
            </span>
          )}
        </button>

        <div className="text-center pt-8 border-t border-white/5">
          <span className="text-slate-500 text-xs">
            New aspirant?{' '}
          </span>
          <Link
            to="/signup"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors ml-1 uppercase tracking-widest"
          >
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
