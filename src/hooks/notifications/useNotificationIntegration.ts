import { useState } from 'react';

export const useNotificationIntegration = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  // 一時的に無効化 - 完全にシンプルな実装
  console.log('useNotificationIntegration: temporarily simplified');

  return {
    unreadCount: 0,
    markAsRead: () => {},
    markAllAsRead: () => {},
    refreshNotifications: () => {},
    createNotification: () => {},
    clearAll: () => {}
  };
};

export default useNotificationIntegration;