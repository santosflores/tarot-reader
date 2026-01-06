/**
 * UI component
 * Main UI overlay component that combines all UI sub-components
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

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="absolute top-2.5 left-[11px] z-[100] bg-white transition-all duration-300 rounded-lg shadow-lg overflow-hidden flex flex-col w-auto p-2 hover:w-[300px] hover:p-[15px] hover:max-h-[calc(100vh-20px)] group">
      {/* User Info - Always visible */}
      {!loading && user && (
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
      )}

      {/* Expanded Content - Only visible on hover */}
      <div className="overflow-y-auto flex flex-col max-h-0 opacity-0 group-hover:max-h-[calc(100vh-100px)] group-hover:opacity-100 transition-all duration-300 overflow-hidden">
        {!loading && user && (
          <div className="mb-0 p-0 flex flex-col mt-2" style={{ boxSizing: 'content-box', borderBottom: 'none', borderImage: 'none' }}>
            <div className="flex flex-col gap-2 mb-2">
              <Link
                to="/profile"
                className="text-center px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
              >
                Edit Profile
              </Link>
            </div>
            <ConversationsList />
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        )}
        
        {/* Show SupabaseTest and Controls only for specific user */}
        {user?.email === 'santosflores@gmail.com' && (
          <>
            <TarotSimulator />
            <SupabaseTest />
            <ControlsTabs />
          </>
        )}
      </div>
    </div>
  );
};
