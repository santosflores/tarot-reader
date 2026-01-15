/**
 * Signup Form Component
 * User registration with email, password, and display name
 */

import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AuthLayout } from './AuthLayout';
import { FormInput, FormButton, FormAlert } from '../UI/Form';

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
        {error && <FormAlert message={error} type="error" />}

        <FormInput
          id="displayName"
          type="text"
          label="Display Name"
          labelHint="(optional)"
          value={displayName}
          onChange={setDisplayName}
          autoComplete="name"
          placeholder="How shall we call you?"
        />

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

        <FormInput
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
          placeholder="Create a strong password"
          hint="8+ characters • Uppercase • Lowercase • Number"
        />

        <FormInput
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          autoComplete="new-password"
          placeholder="Confirm your password"
        />

        <div className="flex gap-3">
          <Link
            to="/"
            className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all duration-300 uppercase tracking-[0.2em] text-xs flex items-center justify-center"
          >
            Cancel
          </Link>
          <div className="flex-1">
            <FormButton loading={loading} loadingText="Creating Presence...">
              Begin Journey
            </FormButton>
          </div>
        </div>

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
