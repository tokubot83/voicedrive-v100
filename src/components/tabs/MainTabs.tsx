import React from 'react';
import { MainTab } from '../../types/tabs';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// メインタブの定義
export const mainTabs: MainTab[] = [
  { id: 'home', label: 'ホーム', icon: '🏠', hasSubFilters: false },
  { id: 'improvement', label: '改善提案', icon: '💡', hasSubFilters: true },
  { id: 'community', label: 'コミュニティ', icon: '👥', hasSubFilters: true },
  { id: 'whistleblowing', label: '公益通報', icon: '🚨', hasSubFilters: true },
  { id: 'urgent', label: '緊急', icon: '🔥', hasSubFilters: false },
  { id: 'projects', label: 'プロジェクト', icon: '🚀', hasSubFilters: true }
];

export const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center items-center">
      <div className="flex overflow-x-auto scrollbar-hide">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 
              whitespace-nowrap transition-all duration-200
              relative group
              ${activeTab === tab.id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline font-medium">{tab.label}</span>
            
            {/* アクティブインジケーター */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
            
            {/* ホバーエフェクト */}
            <div className={`
              absolute bottom-0 left-0 right-0 h-0.5 
              bg-gray-600 transform scale-x-0 
              group-hover:scale-x-100 transition-transform duration-200
              ${activeTab === tab.id ? 'hidden' : ''}
            `} />
          </button>
        ))}
      </div>
    </div>
  );
};