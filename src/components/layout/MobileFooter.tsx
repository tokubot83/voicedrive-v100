import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell } from 'lucide-react';
import { useNotificationIntegration } from '../../hooks/notifications/useNotificationIntegration';

export function MobileFooter() {
  const location = useLocation();
  const { unreadCount } = useNotificationIntegration();
  const isHome = location.pathname === '/';
  const isNotifications = location.pathname === '/notifications';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50">
      <nav className="flex items-center justify-around h-14">
        {/* ホームボタン */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            isHome ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <Home 
            className="w-6 h-6" 
            fill={isHome ? 'currentColor' : 'none'}
            strokeWidth={isHome ? 0 : 2}
          />
        </Link>

        {/* 通知ボタン */}
        <Link
          to="/notifications"
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            isNotifications ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <Bell 
              className="w-6 h-6" 
              fill={isNotifications ? 'currentColor' : 'none'}
              strokeWidth={isNotifications ? 0 : 2}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Link>
      </nav>
    </div>
  );
}