/**
 * Auth Layout Component
 * Shared layout for authentication pages with a minimalist indie-hacker theme
 */

import { ReactNode } from 'react';
import { Background } from '../UI/Background';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative text-slate-200 font-mono flex items-center justify-center p-6 selection:bg-purple-500/30 overflow-hidden">
      <Background />

      <div className="w-full max-w-md relative z-10">
        {/* Auth Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />

          <div className="mb-8 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight font-serif">{title}</h2>
            {subtitle && (
              <p className="text-slate-400 text-sm font-medium">{subtitle}</p>
            )}
          </div>

          <div className="relative z-10">
            {children}
          </div>
        </div>

        {/* Footer Panel */}
        <div className="mt-6 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl shadow-2xl relative overflow-hidden group text-center">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />

          <p className="text-slate-500 text-xs relative z-10">
            © {new Date().getFullYear()} Tarot Reader. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
