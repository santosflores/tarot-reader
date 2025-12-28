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
    <div className={`mb-4 border-b pb-4 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
          {!isExpanded && statusIndicator && (
            <span
              className={`w-2 h-2 rounded-full ${getStatusColor(statusIndicator)}`}
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
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  );
}
