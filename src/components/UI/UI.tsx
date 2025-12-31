/**
 * UI component
 * Main UI overlay component that combines all UI sub-components
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SupabaseTest } from './components/SupabaseTest';
import { ControlsTabs } from './components/ControlsTabs';
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
          <Link
            to="/profile"
            className="block w-full text-center px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
          >
            Edit Profile
          </Link>
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
