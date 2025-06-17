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
    <header className={`fixed left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-gray-800 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${isDemoMode ? 'top-[80px] md:top-[60px]' : 'top-0'}`}>
      <div className="flex items-center justify-between">
        {/* モバイルロゴ */}
        <div className="flex items-center p-4 md:hidden">
          <span className="text-xl font-bold gradient-text">VoiceDrive</span>
        </div>
        
        {/* デスクトップロゴ */}
        <div className="hidden md:flex items-center p-4">
          <span className="text-xl font-bold gradient-text">VoiceDrive</span>
        </div>
        
        {/* 通知ベル */}
        <div className="flex items-center space-x-3 pr-4">
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