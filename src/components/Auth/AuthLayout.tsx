/**
 * Auth Layout Component
 * Shared layout for authentication pages with a mystical tarot theme
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-4xl mb-2">🔮</div>
            <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200">
              Tarot Reader
            </h1>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-900/20 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
            {subtitle && (
              <p className="text-purple-200/70 text-sm">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-purple-200/40 text-xs mt-8">
          The cards reveal what the heart already knows
        </p>
      </div>
    </div>
  );
}
