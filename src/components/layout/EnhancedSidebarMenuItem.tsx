import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { MenuItem } from '../../types/sidebar';

interface EnhancedSidebarMenuItemProps {
  item: MenuItem;
  depth: number;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const EnhancedSidebarMenuItem: React.FC<EnhancedSidebarMenuItemProps> = ({
  item,
  depth,
  currentPath,
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentPath === item.path;
  
  // Handle both string icons (emojis) and React components
  const renderIcon = () => {
    if (typeof item.icon === 'string') {
      return <span className="w-4 h-4 flex-shrink-0 text-center">{item.icon}</span>;
    } else {
      const Icon = item.icon;
      return <Icon className="w-4 h-4 flex-shrink-0" />;
    }
  };

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.path) {
      onNavigate(item.path);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-md text-sm
          transition-all duration-150 relative
          ${isActive 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }
          ${depth > 0 ? 'ml-6' : ''}
        `}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <div className="flex items-center gap-3">
          {renderIcon()}
          <span className="text-left">{item.title}</span>
        </div>
        {hasChildren && (
          <span className="ml-auto">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <EnhancedSidebarMenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </>
  );
};