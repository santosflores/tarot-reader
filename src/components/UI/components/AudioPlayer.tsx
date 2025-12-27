/**
 * AudioPlayer component
 * Provides controls for playing audio files
 */

import { useChatbot } from '../../../hooks/useChatbot';
import { AUDIO_PATHS } from '../../../config/constants';
import { logError } from '../../../utils/errors';

export const AudioPlayer = () => {
  const playAudio = useChatbot((state) => state.playAudio);

  const handlePlayAudio = (audioPath: string) => {
    try {
      playAudio(audioPath);
    } catch (error) {
      logError(error, { audioPath, context: 'Audio playback' });
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">Audio Controls</h3>
      <button
        onClick={() => handlePlayAudio(`/${AUDIO_PATHS.HI_MESSAGE}`)}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-sm font-medium"
      >
        Play Audio
      </button>
    </div>
  );
};

