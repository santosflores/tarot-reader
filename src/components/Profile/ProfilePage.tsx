/**
 * Profile Page Component
 * Allows users to view and edit their profile information
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AuthLayout } from '../Auth/AuthLayout';

export function ProfilePage() {
  const { user, profile, updateProfile, refreshProfile, loading } = useAuthContext();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [preferences, setPreferences] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile data when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setBirthdate(profile.birthdate || '');
      setPreferences(
        profile.preferences && typeof profile.preferences === 'object'
          ? JSON.stringify(profile.preferences, null, 2)
          : ''
      );
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      // Parse preferences JSON if provided
      let parsedPreferences = {};
      if (preferences.trim()) {
        try {
          parsedPreferences = JSON.parse(preferences);
        } catch {
          setError('Invalid JSON format in preferences field');
          setSaving(false);
          return;
        }
      }

      const updates = {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        birthdate: birthdate || null,
        preferences: Object.keys(parsedPreferences).length > 0 ? parsedPreferences : null,
      };

      const { error: updateError } = await updateProfile(updates);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        await refreshProfile();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout title="Loading Profile..." subtitle="Please wait">
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-purple-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <AuthLayout
      title="Edit Profile"
      subtitle="Update your profile information"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm">
            Profile updated successfully!
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={user.email || ''}
            disabled
            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white/60 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-purple-300/50">
            Email cannot be changed
          </p>
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-purple-200 mb-2">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
            placeholder="How shall we call you?"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-purple-200 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-purple-200 mb-2">
            Date of Birth
          </label>
          <input
            id="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="preferences" className="block text-sm font-medium text-purple-200 mb-2">
            Preferences <span className="text-purple-400/60">(JSON)</span>
          </label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none font-mono text-xs"
            placeholder='{"theme": "dark", "notifications": true}'
          />
          <p className="mt-1 text-xs text-purple-300/50">
            Enter preferences as valid JSON format
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
