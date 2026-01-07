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
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
            Display Name <span className="text-slate-600 font-normal normal-case">(optional)</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all font-mono"
            placeholder="How shall we call you?"
          />
        </div>

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
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all font-mono"
            placeholder="Create a strong password"
          />
          <p className="mt-2 text-xs text-slate-500">
            At least 8 characters with uppercase, lowercase, and a number
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all font-mono"
            placeholder="Confirm your password"
          />
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
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="text-center pt-6 border-t border-slate-800">
          <span className="text-slate-500 text-sm">
            Already have an account?{' '}
          </span>
          <Link
            to="/login"
            className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors ml-1"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
