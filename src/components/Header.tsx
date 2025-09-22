import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MainTabs } from './tabs/MainTabs';
import { SubFilters } from './tabs/SubFilters';
import { useTabContext } from './tabs/TabContext';
import { mainTabs } from './tabs/MainTabs';
import { NotificationBell } from './notifications/NotificationBell';
import { useDemoMode } from './demo/DemoModeController';
import { useScrollDirection } from '../hooks/useScrollDirection';
import NotificationService from '../services/NotificationService';


interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const location = useLocation();
  const { tabState, setActiveMainTab, setActiveSubFilter } = useTabContext();
  const { activeMainTab, activeSubFilter } = tabState;
  const { isDemoMode } = useDemoMode();
  const { isVisible } = useScrollDirection();
  const lastNotificationTime = useRef<{ [key: string]: number }>({});

  // 現在のタブがサブフィルターを持つかチェック
  const currentTab = mainTabs.find(tab => tab.id === activeMainTab);
  const hasSubFilters = currentTab?.hasSubFilters || false;

  // デモ通知を送信（デバウンス付き）
  const sendDemoNotification = (type: 'proposal' | 'reschedule' | 'deadline') => {
    // 連続クリック防止（1秒以内の再実行を防ぐ）
    const now = Date.now();
    if (lastNotificationTime.current[type] && now - lastNotificationTime.current[type] < 1000) {
      console.log(`Debounced ${type} notification`);
      return;
    }
    lastNotificationTime.current[type] = now;

    const notificationService = NotificationService.getInstance();
    switch (type) {
      case 'proposal':
        notificationService.sendDemoProposalNotification();
        break;
      case 'reschedule':
        notificationService.sendDemoRescheduleNotification();
        break;
      case 'deadline':
        notificationService.sendDemoDeadlineWarning();
        break;
    }
  };

  // 設定ページでは非表示
  if (location.pathname === '/settings') {
    return null;
  }

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
        <div className="flex items-center flex-1 justify-end gap-2">
          {/* デモモード時のみデモ通知ボタンを表示 */}
          {isDemoMode && (
            <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4">
              <span className="hidden sm:inline text-xs text-gray-400 mr-2">デモ:</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendDemoNotification('proposal');
                }}
                className="px-2 sm:px-3 py-2 sm:py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
                title="面談提案通知を送信"
              >
                提案
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendDemoNotification('reschedule');
                }}
                className="px-2 sm:px-3 py-2 sm:py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation"
                title="再調整完了通知を送信"
              >
                再調整
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendDemoNotification('deadline');
                }}
                className="px-2 sm:px-3 py-2 sm:py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 active:bg-orange-800 transition-colors touch-manipulation"
                title="期限警告通知を送信"
              >
                期限
              </button>
            </div>
          )}
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