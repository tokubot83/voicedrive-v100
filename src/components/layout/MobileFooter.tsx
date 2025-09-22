import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Mail, Bell, Settings } from 'lucide-react';

export function MobileFooter() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isHRPage = location.pathname === '/hr-announcements';
  const isNotifications = location.pathname === '/notifications';
  const isSettings = location.pathname === '/settings';
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  // 未読お知らせ数の取得（モックデータ）
  useEffect(() => {
    // 実際の実装ではAPIから取得
    setUnreadCount(3);
    setNotificationCount(5); // 通知の未読数
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (isHome) {
      // ホームページの場合はページトップにスクロール
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 他のページの場合はLinkの標準動作（ホームページに遷移）
  };

  const handleHRClick = (e: React.MouseEvent) => {
    if (isHRPage) {
      // 人事お知らせページの場合はページトップにスクロール
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 他のページの場合はLinkの標準動作（人事お知らせページに遷移）
  };

  const handleNotificationsClick = (e: React.MouseEvent) => {
    if (isNotifications) {
      // 通知ページの場合はページトップにスクロール
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 他のページの場合はLinkの標準動作（通知ページに遷移）
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50">
      <nav className="flex items-center justify-around h-14">
        {/* ホームボタン */}
        <Link
          to="/"
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center h-full px-4 relative transition-colors duration-200 ${
            isHome ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <Home
            className="w-6 h-6"
            fill={isHome ? 'currentColor' : 'none'}
            strokeWidth={isHome ? 0 : 2}
          />
          <span className="text-xs mt-1 font-medium">ホーム</span>
        </Link>

        {/* 人事お知らせボタン */}
        <Link
          to="/hr-announcements"
          onClick={handleHRClick}
          className={`flex flex-col items-center justify-center h-full px-4 relative transition-colors duration-200 ${
            isHRPage ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <Mail
              className="w-6 h-6"
              fill={isHRPage ? 'currentColor' : 'none'}
              strokeWidth={isHRPage ? 0 : 2}
            />
            {/* 未読バッジ */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1 font-medium">お知らせ</span>
        </Link>

        {/* 通知ボタン */}
        <Link
          to="/notifications"
          onClick={handleNotificationsClick}
          className={`flex flex-col items-center justify-center h-full px-4 relative transition-colors duration-200 ${
            isNotifications ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <Bell
              className="w-6 h-6"
              fill={isNotifications ? 'currentColor' : 'none'}
              strokeWidth={isNotifications ? 0 : 2}
            />
            {/* 未読バッジ */}
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1 font-medium">通知</span>
        </Link>

        {/* 設定ボタン */}
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center h-full px-4 relative transition-colors duration-200 ${
            isSettings ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <Settings
            className="w-6 h-6"
            fill={isSettings ? 'currentColor' : 'none'}
            strokeWidth={isSettings ? 0 : 2}
          />
          <span className="text-xs mt-1 font-medium">設定</span>
        </Link>
      </nav>
    </div>
  );
}