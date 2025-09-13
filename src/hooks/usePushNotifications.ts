import { useState, useEffect, useCallback } from 'react';
import { mobilePushNotificationService } from '../services/MobilePushNotificationService';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  permission: NotificationPermission;
}

interface PushNotificationHook {
  state: PushNotificationState;
  requestPermission: () => Promise<boolean>;
  subscribe: (employeeId: string) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  testNotification: () => Promise<void>;
}

export const usePushNotifications = (): PushNotificationHook => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    error: null,
    permission: 'default'
  });

  // プッシュ通知サポート確認
  useEffect(() => {
    const checkSupport = () => {
      const isSupported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setState(prev => ({
        ...prev,
        isSupported,
        permission: 'Notification' in window ? Notification.permission : 'denied'
      }));

      if (isSupported) {
        checkSubscriptionStatus();
      }
    };

    checkSupport();
  }, []);

  // 現在の購読状態確認
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState(prev => ({
          ...prev,
          isSubscribed: !!subscription
        }));
      }
    } catch (error) {
      console.error('購読状態確認エラー:', error);
    }
  }, []);

  // 通知許可要求
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'このブラウザはプッシュ通知をサポートしていません'
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();

      setState(prev => ({
        ...prev,
        permission,
        isLoading: false
      }));

      if (permission === 'granted') {
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: '通知の許可が得られませんでした'
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '通知許可の要求に失敗しました'
      }));
      return false;
    }
  }, [state.isSupported]);

  // プッシュ通知購読
  const subscribe = useCallback(async (employeeId: string): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return false;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Service Worker登録確認
      const registration = await navigator.serviceWorker.ready;

      // VAPID公開キー取得
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID公開キーが設定されていません');
      }

      // プッシュ購読作成
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // サーバーにデバイス登録
      const success = await mobilePushNotificationService.registerDevice(employeeId, subscription);

      if (success) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          isLoading: false
        }));

        // 購読状態をローカルストレージに保存
        localStorage.setItem('pushNotificationSubscribed', 'true');
        localStorage.setItem('pushNotificationEmployeeId', employeeId);

        return true;
      } else {
        throw new Error('サーバーへのデバイス登録に失敗しました');
      }
    } catch (error) {
      console.error('プッシュ通知購読エラー:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '購読に失敗しました'
      }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission]);

  // プッシュ通知購読解除
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
        }

        setState(prev => ({
          ...prev,
          isSubscribed: false,
          isLoading: false
        }));

        // ローカルストレージから削除
        localStorage.removeItem('pushNotificationSubscribed');
        localStorage.removeItem('pushNotificationEmployeeId');

        return true;
      }

      return false;
    } catch (error) {
      console.error('プッシュ通知購読解除エラー:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '購読解除に失敗しました'
      }));
      return false;
    }
  }, []);

  // テスト通知送信
  const testNotification = useCallback(async (): Promise<void> => {
    if (state.permission !== 'granted') {
      throw new Error('通知の許可が必要です');
    }

    try {
      // Service Worker経由でテスト通知表示
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification('VoiceDrive面談システム', {
          body: 'プッシュ通知のテストです。正常に動作しています。',
          icon: '/icons/interview-icon-192x192.png',
          badge: '/icons/interview-badge-96x96.png',
          tag: 'test-notification',
          vibrate: [100, 50, 100],
          actions: [
            {
              action: 'close',
              title: '閉じる'
            }
          ],
          data: {
            type: 'test',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // フォールバック: ブラウザ標準通知
        new Notification('VoiceDrive面談システム', {
          body: 'プッシュ通知のテストです。正常に動作しています。',
          icon: '/icons/interview-icon-192x192.png'
        });
      }
    } catch (error) {
      console.error('テスト通知エラー:', error);
      throw new Error('テスト通知の送信に失敗しました');
    }
  }, [state.permission]);

  return {
    state,
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification
  };
};

// VAPID キーをUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// オンライン状態管理フック
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      // オンライン復帰時にService Workerでデータ同期をトリガー
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (registration.sync) {
            registration.sync.register('sync-interview-bookings');
          }
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// プッシュ通知設定コンポーネント用フック
export const usePushNotificationSettings = (employeeId: string) => {
  const pushNotifications = usePushNotifications();
  const [settings, setSettings] = useState({
    bookingConfirmation: true,
    reminder24h: true,
    reminder2h: true,
    cancellationNotice: true,
    rescheduleUpdates: true,
    urgentUpdates: true
  });

  // 設定をローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem(`pushNotificationSettings_${employeeId}`);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('通知設定読み込みエラー:', error);
      }
    }
  }, [employeeId]);

  // 設定を保存
  const updateSettings = useCallback((newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(`pushNotificationSettings_${employeeId}`, JSON.stringify(updated));
  }, [settings, employeeId]);

  // 通知タイプが有効かチェック
  const isNotificationTypeEnabled = useCallback((type: string): boolean => {
    switch (type) {
      case 'INTERVIEW_BOOKING_CONFIRMED':
        return settings.bookingConfirmation;
      case 'INTERVIEW_REMINDER_24H':
        return settings.reminder24h;
      case 'INTERVIEW_REMINDER_2H':
        return settings.reminder2h;
      case 'INTERVIEW_CANCELLED':
        return settings.cancellationNotice;
      case 'INTERVIEW_RESCHEDULE_APPROVED':
      case 'INTERVIEW_RESCHEDULE_REJECTED':
        return settings.rescheduleUpdates;
      case 'URGENT_SCHEDULE_CHANGE':
        return settings.urgentUpdates;
      default:
        return true;
    }
  }, [settings]);

  return {
    ...pushNotifications,
    settings,
    updateSettings,
    isNotificationTypeEnabled
  };
};