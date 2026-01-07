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
      <div className="mb-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wide">
            🧪 Demo Credentials
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail('test@test.com');
              setPassword('test123');
            }}
            className="text-xs text-slate-500 hover:text-purple-400 underline transition-colors cursor-pointer"
          >
            Use Credentials
          </button>
        </div>
        <div className="text-xs text-slate-400 space-y-1 font-mono">
          <p className="flex justify-between">
            <span>User:</span>
            <span className="text-slate-200">test@test.com</span>
          </p>
          <p className="flex justify-between">
            <span>Pass:</span>
            <span className="text-slate-200">test123</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all font-mono"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all font-mono"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wide"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-slate-200 hover:bg-white text-slate-900 font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/10 uppercase tracking-wide text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="text-center pt-6 border-t border-slate-800">
          <span className="text-slate-500 text-sm">
            New here?{' '}
          </span>
          <Link
            to="/signup"
            className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors ml-1"
          >
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
