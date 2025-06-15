import React from 'react';
import { Link } from 'react-router-dom';
import { MainTabs } from './tabs/MainTabs';
import { SubFilters } from './tabs/SubFilters';
import { useTabContext } from './tabs/TabContext';
import { mainTabs } from './tabs/MainTabs';
import { NotificationBell } from './notifications/NotificationBell';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { tabState, setActiveMainTab, setActiveSubFilter } = useTabContext();
  const { activeMainTab, activeSubFilter } = tabState;
  
  // 現在のタブがサブフィルターを持つかチェック
  const currentTab = mainTabs.find(tab => tab.id === activeMainTab);
  const hasSubFilters = currentTab?.hasSubFilters || false;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-gray-800">
      <div className="flex items-center justify-between">
        {/* モバイルメニューボタン */}
        <div className="flex items-center p-4 md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-4 text-xl font-bold gradient-text">VoiceDrive</span>
        </div>
        
        {/* デスクトップロゴ */}
        <div className="hidden md:flex items-center p-4">
          <span className="text-xl font-bold gradient-text">VoiceDrive</span>
        </div>
        
        {/* 通知ベル & 面談予約ボタン */}
        <div className="flex items-center space-x-3 pr-4">
          <NotificationBell className="text-white" />
          
          {/* 面談予約ボタン（デスクトップのみ表示） */}
          <div className="hidden md:block">
            <Link
              to="/interview-booking"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              title="面談予約"
            >
              <span className="mr-2">💬</span>
              <span>面談予約</span>
            </Link>
          </div>
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