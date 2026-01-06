/**
 * Collapsible Section Component
 * Reusable component for expandable/collapsible sections
 */

import { useState, ReactNode } from 'react';

type StatusIndicator = 'success' | 'error' | 'warning' | null;

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  statusIndicator?: StatusIndicator;
}

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultExpanded = false,
  className = '',
  statusIndicator = null,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusColor = (status: StatusIndicator): string => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return '';
    }
  };

  return (
    <div className={`border-t border-b border-purple-400/30 pt-4 pb-4 mb-4 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 hover:from-purple-100 hover:via-white hover:to-indigo-100 transition-all"
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-lg drop-shadow-lg">{icon}</span>}
          <span className="text-left">{title}</span>
          {!isExpanded && statusIndicator && (
            <span
              className={`w-2 h-2 rounded-full ${getStatusColor(statusIndicator)} shadow-lg`}
              title={
                statusIndicator === 'success'
                  ? 'Connected'
                  : statusIndicator === 'error'
                  ? 'Connection Error'
                  : 'Checking...'
              }
            />
          )}
        </span>
        <svg
          className={`w-4 h-4 text-purple-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && <div className="mt-3">{children}</div>}
    </div>
  );
}
