/**
 * Forgot Password Form Component
 * Request password reset email
 */

import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AuthLayout } from './AuthLayout';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuthContext();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Password reset instructions sent"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-purple-200/80">
            We've sent password reset instructions to <strong className="text-white">{email}</strong>.
            Please check your inbox and follow the link to reset your password.
          </p>
          <p className="text-purple-300/60 text-sm">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setSuccess(false)}
              className="text-purple-300 hover:text-purple-200 underline"
            >
              try again
            </button>
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
      title="Reset Password"
      subtitle="We'll send you instructions to reset your password"
    >
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
              Calling Oracle...
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              Send Instructions <span className="text-sm">→</span>
            </span>
          )}
        </button>

        <div className="text-center pt-8 border-t border-white/5">
          <Link
            to="/login"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest"
          >
            ← Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
