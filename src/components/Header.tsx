import React from 'react';
import { Link } from 'react-router-dom';
import { MainTabs } from './tabs/MainTabs';
import { SubFilters } from './tabs/SubFilters';
import { useTabContext } from './tabs/TabContext';
import { mainTabs } from './tabs/MainTabs';
import { NotificationBell } from './notifications/NotificationBell';
import { useDemoMode } from './demo/DemoModeController';
import { useScrollDirection } from '../hooks/useScrollDirection';

// ユーザー情報コンポーネント
const UserInfo = () => {
  const { currentUser } = useDemoMode();
  
  return (
    <Link to="/profile" className="flex items-center space-x-2 sm:space-x-3 hover:bg-white/5 rounded-lg p-1 sm:p-2 transition-colors">
      <div className="text-right hidden md:block">
        <p className="text-sm font-medium text-white">{currentUser.name}</p>
        <p className="text-xs text-gray-400">{currentUser.department}</p>
      </div>
      <div className="text-right hidden sm:block md:hidden">
        <p className="text-sm font-medium text-white">{currentUser.name}</p>
        <p className="text-xs text-gray-400">Lv.{currentUser.permissionLevel}</p>
      </div>
      <div className="relative">
        <img 
          src={currentUser.avatar} 
          alt={currentUser.name}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-blue-500"
          onError={(e) => {
            e.currentTarget.src = '/default-avatar.svg';
          }}
        />
        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
          {currentUser.permissionLevel}
        </div>
      </div>
    </Link>
  );
};

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
        {/* VoiceDriveロゴ（左側） */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="text-2xl drop-shadow-[0_0_10px_rgba(29,155,240,0.8)]">🚀</div>
          <div>
            <h1 className="text-xl font-bold gradient-text">VoiceDrive</h1>
            <p className="text-xs text-gray-400 hidden sm:block">革新的な合意形成システム</p>
          </div>
        </Link>
        
        {/* ユーザー情報と通知（右側） */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* ユーザー情報 */}
          {isDemoMode ? (
            <UserInfo />
          ) : null}
          
          {/* 通知ベル */}
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