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
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左側のスペーサー */}
        <div className="flex-1"></div>
        
        {/* VoiceDriveロゴ（中央） */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="text-2xl drop-shadow-[0_0_10px_rgba(29,155,240,0.8)] animate-pulse">🚀</div>
          <div className="text-center">
            <h1 className="text-xl font-bold gradient-text">VoiceDrive</h1>
            <p className="text-xs text-gray-400">厚生会人財統括本部</p>
          </div>
        </Link>
        
        {/* 通知ベル（右側） */}
        <div className="flex items-center flex-1 justify-end">
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