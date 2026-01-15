/**
 * AnimationSelector component
 * Allows users to select which animation the character should play
 */

import { memo, useCallback } from "react";
import { useAnimation } from "../../../hooks/useAnimation";
import type { AnimationName } from "../../../types";

export const AnimationSelector = memo(() => {
  const currentAnimation = useAnimation((state) => state.currentAnimation);
  const availableAnimations = useAnimation(
    (state) => state.availableAnimations,
  );
  const setCurrentAnimation = useAnimation(
    (state) => state.setCurrentAnimation,
  );

  const handleAnimationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentAnimation(e.target.value as AnimationName);
    },
    [setCurrentAnimation],
  );

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200">
        Animation Controls
      </h3>
      <div className="mb-2">
        <label className="block text-xs mb-1 text-purple-200/90">
          Current Animation:{" "}
          <span className="font-medium text-purple-100">
            {currentAnimation}
          </span>
        </label>
        <select
          value={currentAnimation}
          onChange={handleAnimationChange}
          className="w-full px-2 py-1 text-sm border border-purple-400/30 rounded-lg bg-slate-800/90 backdrop-blur-sm text-purple-200 focus:border-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {availableAnimations.map((animation) => (
            <option
              key={animation}
              value={animation}
              className="bg-slate-800 text-purple-200"
            >
              {animation}
            </option>
          ))}
        </select>
      </div>

      <AnimationPlayer />
    </div>
  );
});

const AnimationPlayer = () => {
  const { isPaused, duration, currentTime, setPaused, seek } = useAnimation();

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className="bg-slate-900/50 rounded-lg p-2 border border-purple-400/20 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPaused(!isPaused)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600/80 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 transition-all border border-purple-400/30"
        >
          {isPaused ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 ml-0.5"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-slate-700/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
          />
          <div className="flex justify-between text-[10px] text-purple-300/60 font-mono mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

AnimationSelector.displayName = "AnimationSelector";
