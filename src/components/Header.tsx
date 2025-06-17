import React from 'react';
import { Link } from 'react-router-dom';
import { MainTabs } from './tabs/MainTabs';
import { SubFilters } from './tabs/SubFilters';
import { useTabContext } from './tabs/TabContext';
import { mainTabs } from './tabs/MainTabs';
import { NotificationBell } from './notifications/NotificationBell';
import { useDemoMode } from './demo/DemoModeController';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { tabState, setActiveMainTab, setActiveSubFilter } = useTabContext();
  const { activeMainTab, activeSubFilter } = tabState;
  const { isDemoMode } = useDemoMode();
  const { isVisible } = useScrollDirection();
  
  // 現在のタブがサブフィルターを持つかチェック
  const currentTab = mainTabs.find(tab => tab.id === activeMainTab);
  const hasSubFilters = currentTab?.hasSubFilters || false;

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 bg-black/80 backdrop-blur border-b border-gray-800 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="flex items-center justify-between relative">
        {/* 中央ロゴ（モバイル・デスクトップ共通） */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-bold gradient-text">VoiceDrive</span>
            <span className="text-xs md:text-sm text-gray-400 mt-1">厚生会 人材統括本部</span>
          </div>
        </div>
        
        {/* 通知ベル（右側に配置） */}
        <div className="ml-auto flex items-center space-x-3 p-4">
          <NotificationBell className="text-white" />
        </div>
      </div>
      
      {/* メインタブ */}
      <MainTabs activeTab={activeMainTab} onTabChange={setActiveMainTab} />
      
      {/* 動的サブフィルター */}
      {hasSubFilters && (
        <SubFilters 
          parentTab={activeMainTab} 
          activeFilter={activeSubFilter} 
          onFilterChange={setActiveSubFilter} 
        />
      )}
    </header>
  );
};

export default Header;