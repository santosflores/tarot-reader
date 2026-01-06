/**
 * UI component
 * Main UI overlay component that combines all UI sub-components
 * Now behaves as a drawer that slides in from the left
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SupabaseTest } from './components/SupabaseTest';
import { ControlsTabs } from './components/ControlsTabs';
import { TarotSimulator } from './components/TarotSimulator';
import { ConversationsList } from './components/ConversationsList';
import { useAuthContext } from '../../hooks/useAuthContext';

export const UI = () => {
  const { user, profile, signOut, loading } = useAuthContext();
  const [signingOut, setSigningOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {/* Toggle Button - Always visible when drawer is closed */}
      {!isOpen && !loading && user && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-4 z-[150] w-14 h-14 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-2 border-purple-400/40 rounded-full shadow-xl shadow-purple-900/50 flex items-center justify-center transition-all hover:scale-110 hover:border-purple-300/60 hover:shadow-2xl hover:shadow-purple-900/60"
          title="Open menu"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-purple-900/50 border border-purple-300/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </button>
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-slate-900/98 via-purple-900/95 to-slate-900/98 backdrop-blur-2xl border-r-2 border-purple-400/40 shadow-2xl shadow-purple-900/50 z-[140] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
        
        {/* Drawer Header */}
        <div className="relative p-5 border-b border-purple-400/30 bg-gradient-to-r from-purple-900/30 to-transparent flex items-center justify-between backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            {!loading && user && (
              <Link
                to="/profile"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-base flex-shrink-0 shadow-lg shadow-purple-900/50 border border-purple-300/30">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 truncate">
                    {displayName}
                  </h2>
                  <p className="text-sm text-purple-300/80 truncate">
                    {user.email}
                  </p>
                </div>
              </Link>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-gray-300 hover:text-white transition-all hover:scale-110 shadow-lg ml-2"
            title="Close drawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="relative overflow-y-auto h-[calc(100vh-100px)] p-5">
          {!loading && user && (
            <>
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="text-center px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-purple-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg"
                  >
                    Edit Profile
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-red-600/80 backdrop-blur-sm border border-purple-400/30 hover:border-red-400/50 text-gray-300 hover:text-white rounded-lg transition-all disabled:opacity-50 hover:scale-[1.02] shadow-lg"
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
              
              {/* Conversations - shown to everyone */}
              <ConversationsList />
              
              {/* Show TarotSimulator, SupabaseTest and Controls only for specific user */}
              {user.email === 'santosflores@gmail.com' && (
                <div className="mt-4 flex flex-col gap-4">
                  <TarotSimulator />
                  <SupabaseTest />
                  <ControlsTabs />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
