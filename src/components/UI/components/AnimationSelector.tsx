/**
 * AnimationSelector component
 * Allows users to select which animation the character should play
 */

import { memo, useCallback } from 'react';
import { useAnimation } from '../../../hooks/useAnimation';
import type { AnimationName } from '../../../types';

export const AnimationSelector = memo(() => {
  const { currentAnimation, availableAnimations, setCurrentAnimation } = useAnimation();

  const handleAnimationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentAnimation(e.target.value as AnimationName);
    },
    [setCurrentAnimation]
  );

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200">Animation Controls</h3>
      <div className="mb-2">
        <label className="block text-xs mb-1 text-purple-200/90">
          Current Animation: <span className="font-medium text-purple-100">{currentAnimation}</span>
        </label>
        <select
          value={currentAnimation}
          onChange={handleAnimationChange}
          className="w-full px-2 py-1 text-sm border border-purple-400/30 rounded-lg bg-slate-800/90 backdrop-blur-sm text-purple-200 focus:border-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {availableAnimations.map((animation) => (
            <option key={animation} value={animation} className="bg-slate-800 text-purple-200">
              {animation}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

AnimationSelector.displayName = 'AnimationSelector';

