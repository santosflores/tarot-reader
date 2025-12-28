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
    <CollapsibleSection title="Controls" icon="⚙️" defaultExpanded={true}>
      {/* Tab Buttons */}
      <div className="flex gap-1 mb-3 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
