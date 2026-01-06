/**
 * AudioPlayer component
 * Provides controls for playing audio files
 */

import { memo, useCallback } from 'react';
import { useChatbot } from '../../../hooks/useChatbot';
import { AUDIO_PATHS } from '../../../config/constants';
import { logError } from '../../../utils/errors';

export const AudioPlayer = memo(() => {
  const playAudio = useChatbot((state) => state.playAudio);

  const handlePlayAudio = useCallback(
    (audioPath: string) => {
      try {
        playAudio(audioPath);
      } catch (error) {
        logError(error, { audioPath, context: 'Audio playback' });
      }
    },
    [playAudio]
  );

  const handleWelcomeAudio = useCallback(() => {
    handlePlayAudio(`/${AUDIO_PATHS.WELCOME}`);
  }, [handlePlayAudio]);

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200">Audio Controls</h3>
      <button
        onClick={handleWelcomeAudio}
        className="w-full px-4 py-2 bg-slate-800/90 hover:bg-blue-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-blue-300/50 text-purple-200 hover:text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg text-sm font-medium"
      >
        Play Audio
      </button>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

