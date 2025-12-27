/**
 * AnimationSelector component
 * Allows users to select which animation the character should play
 */

import { useAnimation } from '../../../hooks/useAnimation';
import type { AnimationName } from '../../../types';

export const AnimationSelector = () => {
  const { currentAnimation, availableAnimations, setCurrentAnimation } = useAnimation();

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">Animation Controls</h3>
      <div className="mb-2">
        <label className="block text-xs mb-1">
          Current Animation: <span className="font-medium">{currentAnimation}</span>
        </label>
        <select
          value={currentAnimation}
          onChange={(e) => setCurrentAnimation(e.target.value as AnimationName)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
        >
          {availableAnimations.map((animation) => (
            <option key={animation} value={animation}>
              {animation}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

