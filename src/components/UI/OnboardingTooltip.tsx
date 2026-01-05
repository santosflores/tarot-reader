/**
 * Onboarding Tooltip Component
 * Shows first-time users how to interact with the tarot reader
 */

import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';

const STORAGE_KEY = 'tarot-onboarding-seen';

// Store to control tooltip visibility from outside
interface OnboardingStore {
  showRequested: boolean;
  requestShow: () => void;
  clearRequest: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  showRequested: false,
  requestShow: () => set({ showRequested: true }),
  clearRequest: () => set({ showRequested: false }),
}));

export function OnboardingTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const { showRequested, clearRequest } = useOnboardingStore();

  useEffect(() => {
    // Check if user has already seen the onboarding
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle external show requests (from help button)
  useEffect(() => {
    if (showRequested) {
      setIsVisible(true);
      clearRequest();
    }
  }, [showRequested, clearRequest]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[190] animate-fade-in"
        onClick={handleDismiss}
      />
      
      {/* Tooltip card - always centered */}
      <div className="fixed bottom-28 inset-x-0 flex justify-center z-[195] animate-slide-up">
        <div className="relative w-[calc(100vw-2rem)] max-w-72 mx-auto bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-md rounded-2xl border border-purple-400/30 shadow-2xl shadow-purple-900/50 overflow-hidden">
          {/* Mystical glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
          
          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-lg font-semibold text-purple-100 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              How to Use the Voice Agent
            </h3>
            <p className="text-purple-300/80 text-sm mt-1">
              Learn how to interact with the reader
            </p>
          </div>

          {/* Steps */}
          <div className="px-5 pb-4 space-y-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
                <span className="text-purple-200 text-sm font-medium">1</span>
              </div>
              <div className="pt-0.5">
                <p className="text-purple-100 text-sm font-medium">Click the microphone</p>
                <p className="text-purple-300/70 text-xs mt-0.5">The purple button below</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
                <span className="text-purple-200 text-sm font-medium">2</span>
              </div>
              <div className="pt-0.5">
                <p className="text-purple-100 text-sm font-medium">Allow microphone access</p>
                <p className="text-purple-300/70 text-xs mt-0.5">So the reader can hear you</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
                <span className="text-purple-200 text-sm font-medium">3</span>
              </div>
              <div className="pt-0.5">
                <p className="text-purple-100 text-sm font-medium">Watch the glowing ring</p>
                <p className="text-purple-300/70 text-xs mt-0.5">It shows the conversation state</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
                <span className="text-purple-200 text-sm font-medium">4</span>
              </div>
              <div className="pt-0.5">
                <p className="text-purple-100 text-sm font-medium">Start chatting</p>
                <p className="text-purple-300/70 text-xs mt-0.5">Ask about your future!</p>
              </div>
            </div>
          </div>

          {/* Glowing Ring Guide */}
          <div className="px-5 pb-4 border-t border-purple-400/20 pt-4">
            <p className="text-purple-200 text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">💫</span>
              Ring Colors Guide
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-yellow-500 mt-1 animate-pulse" />
                <div>
                  <p className="text-purple-100 text-xs font-medium">Yellow (Pulsing)</p>
                  <p className="text-purple-300/70 text-xs mt-0.5">Connecting to the reader...</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 mt-1" />
                <div>
                  <p className="text-purple-100 text-xs font-medium">Green (Solid)</p>
                  <p className="text-purple-300/70 text-xs mt-0.5">Listening - speak now!</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-purple-500 mt-1 animate-pulse" />
                <div>
                  <p className="text-purple-100 text-xs font-medium">Purple (Pulsing)</p>
                  <p className="text-purple-300/70 text-xs mt-0.5">Reader is speaking...</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-red-500 mt-1 animate-pulse" />
                <div>
                  <p className="text-purple-100 text-xs font-medium">Red (Pulsing)</p>
                  <p className="text-purple-300/70 text-xs mt-0.5">Error occurred</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hang Up Guide */}
          <div className="px-5 pb-4 border-t border-purple-400/20 pt-4">
            <p className="text-purple-200 text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">📞</span>
              Ending a Conversation
            </p>
            <p className="text-purple-300/70 text-xs">
              When the button turns <span className="text-red-300 font-medium">red with an X icon</span>, click it to hang up and end the conversation.
            </p>
          </div>

          {/* Dismiss button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-purple-900/50"
            >
              Got it!
            </button>
          </div>

          {/* Arrow pointing to mic button - always centered */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rotate-45 border-r border-b border-purple-400/30" />
        </div>

        {/* Pulsing indicator pointing to the mic - always centered */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping" />
          <div className="absolute w-2 h-2 bg-purple-300 rounded-full" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}
