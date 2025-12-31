/**
 * UI component
 * Main UI overlay component that combines all UI sub-components
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SupabaseTest } from './components/SupabaseTest';
import { ControlsTabs } from './components/ControlsTabs';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useOnboardingStore } from './OnboardingTooltip';
import { useOverlayStore } from '../ElevenLabs/overlayStore';

export const UI = () => {
  const { user, profile, signOut, loading } = useAuthContext();
  const [signingOut, setSigningOut] = useState(false);
  const requestShowHelp = useOnboardingStore((state) => state.requestShow);
  const requestExpandOverlay = useOverlayStore((state) => state.requestExpand);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="absolute top-2.5 left-2.5 z-[100] bg-white p-[15px] rounded-lg shadow-lg w-[300px] max-h-[calc(100vh-20px)] overflow-y-auto">
      {/* User Section */}
      {!loading && user && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 ml-2"
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
          <div className="flex gap-2">
            <Link
              to="/profile"
              className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
            >
              Edit Profile
            </Link>
            <button
              onClick={requestShowHelp}
              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="How to use"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Help
            </button>
          </div>
          
          {/* Microphone button - always visible */}
          {!loading && user && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={requestExpandOverlay}
                className="w-full flex items-center justify-center p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md"
                title="Start voice conversation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Show SupabaseTest and Controls only for specific user */}
      {user?.email === 'santosflores@gmail.com' && (
        <>
          <SupabaseTest />
          <ControlsTabs />
        </>
      )}
    </div>
  );
};
