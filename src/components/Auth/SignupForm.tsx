/**
 * Signup Form Component
 * User registration with email, password, and display name
 */

import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AuthLayout } from './AuthLayout';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp, user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  // Redirect when user becomes authenticated (auto-confirm enabled)
  useEffect(() => {
    if (user && !authLoading && !success) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate, success]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const { error, needsConfirmation } = await signUp(email, password, displayName || undefined);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (needsConfirmation) {
        setSuccess(true);
        setLoading(false);
      }
      // If no confirmation needed, useEffect will handle navigation when user state updates
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // If already logged in, show nothing while redirecting
  if (user && !authLoading && !success) {
    return null;
  }

  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent you a confirmation link"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-purple-200/80">
            We've sent a confirmation email to <strong className="text-white">{email}</strong>.
            Please click the link in the email to verify your account.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 text-purple-300 hover:text-purple-200 transition-colors"
          >
            Return to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Begin Your Journey"
      subtitle="Create an account to unlock the mysteries"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-center gap-3 animate-shake">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label htmlFor="displayName" className="block text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
            Display Name <span className="text-slate-500 font-normal normal-case lowercase">(optional)</span>
          </label>
          <div className="relative group/input">
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-base shadow-inner"
              placeholder="How shall we call you?"
            />
          </div>
        </div>

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
          <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
            Password
          </label>
          <div className="relative group/input">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-base shadow-inner"
              placeholder="Create a strong password"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 ml-1 leading-relaxed">
            8+ characters • Uppercase • Lowercase • Number
          </p>
        </div>

        <div className="space-y-4">
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
            Confirm Password
          </label>
          <div className="relative group/input">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-base shadow-inner"
              placeholder="Confirm your password"
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
              Creating Presence...
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              Begin Journey <span className="text-sm">→</span>
            </span>
          )}
        </button>

        <div className="text-center pt-8 border-t border-white/5">
          <span className="text-slate-500 text-xs">
            Already initiated?{' '}
          </span>
          <Link
            to="/login"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors ml-1 uppercase tracking-widest"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
