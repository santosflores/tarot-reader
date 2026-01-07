/**
 * Auth Layout Component
 * Shared layout for authentication pages with a minimalist indie-hacker theme
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
    <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex items-center justify-center p-6 selection:bg-purple-500/30">
      <div className="w-full max-w-md">

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center group">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 ring-2 ring-slate-700 group-hover:ring-purple-500/50 transition-all duration-200">
              <span className="text-3xl">🔮</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">
              Tarot Reader
            </h1>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-6 md:p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-slate-400 text-sm">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          © {new Date().getFullYear()} Tarot Reader. All rights reserved.
        </p>
      </div>
    </div>
  );
}
