/**
 * Controls Tabs Component
 * Tabbed interface for Audio, Animation, and Camera controls
 */

import { useState, ReactNode } from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { AudioPlayer } from './AudioPlayer';
import { AnimationSelector } from './AnimationSelector';
import { CameraControls } from './CameraControls';

type TabType = 'audio' | 'animation' | 'camera';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
  content: ReactNode;
}

const tabs: Tab[] = [
  { id: 'audio', label: 'Audio', icon: '🔊', content: <AudioPlayer /> },
  { id: 'animation', label: 'Animation', icon: '🎬', content: <AnimationSelector /> },
  { id: 'camera', label: 'Camera', icon: '📷', content: <CameraControls /> },
];

export function ControlsTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('audio');

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <CollapsibleSection title="Controls" icon="⚙️" defaultExpanded={false}>
      {/* Tab Buttons */}
      <div className="flex gap-1 mb-3 border-b border-purple-400/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-400 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-purple-900/30'
                : 'border-transparent text-purple-300/80 hover:text-purple-200 hover:bg-purple-900/20'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px]">
        {activeTabContent}
      </div>
    </CollapsibleSection>
  );
}
