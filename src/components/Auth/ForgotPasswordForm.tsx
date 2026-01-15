/**
 * Forgot Password Form Component
 * Request password reset email
 */

import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AuthLayout } from './AuthLayout';
import { FormInput, FormButton, FormAlert } from '../UI/Form';

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
        {error && <FormAlert message={error} type="error" />}

        <FormInput
          id="email"
          type="email"
          label="Email Address"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />

        <FormButton loading={loading} loadingText="Calling Oracle...">
          Send Instructions
        </FormButton>

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
