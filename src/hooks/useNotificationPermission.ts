import { useState, useEffect, useCallback } from 'react';

interface UseNotificationPermissionReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => void;
}

export const useNotificationPermission = (): UseNotificationPermissionReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  // 初期化時に通知サポートと権限状態をチェック
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // 権限状態を再チェック
  const checkPermission = useCallback(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // 通知権限をリクエスト
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('このブラウザは通知をサポートしていません');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Service Worker の準備を待つ
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.ready;
        }

        // テスト通知を送信（オプション）
        if (result === 'granted') {
          showWelcomeNotification();
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('通知権限リクエストエラー:', error);
      return false;
    }
  }, [isSupported]);

  // ウェルカム通知を表示
  const showWelcomeNotification = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification('VoiceDrive 通知設定完了', {
        body: '通知を正常に受信できるようになりました',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'welcome-notification',
        requireInteraction: false,
        vibrate: [200]
      });
    } catch (error) {
      console.error('ウェルカム通知表示エラー:', error);
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    checkPermission
  };
};