import type { ChatbotState } from './index';


export interface OverlayStore {
    expandRequested: boolean;
    requestExpand: () => void;
    clearRequest: () => void;
}

export interface ChatbotStore extends ChatbotState {
    lipsyncManagerInitialized: boolean;
    webrtcLipsyncInitialized: boolean;
    isAgentSpeaking: boolean;
    activeReplayId: string | null;
    setAgentSpeaking: (speaking: boolean) => void;
    setActiveReplayId: (id: string | null) => void;
}
