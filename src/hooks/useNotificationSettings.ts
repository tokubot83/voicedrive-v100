import { useState, useEffect, useCallback } from 'react';
import {
  UserNotificationSettings,
  NotificationCategory,
  CategorySettings,
  NOTIFICATION_PRESETS,
  NotificationPriority
} from '../types/notification';

const STORAGE_KEY = 'voicedrive_notification_settings';

// デフォルト設定
const defaultSettings: UserNotificationSettings = {
  userId: '',
  globalEnabled: true,
  quickSetting: 'important',
  categories: NOTIFICATION_PRESETS.recommended.categories,
  permission: 'default',
  updatedAt: new Date()
};

export const useNotificationSettings = (userId: string) => {
  const [settings, setSettings] = useState<UserNotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({
            ...parsed,
            updatedAt: new Date(parsed.updatedAt)
          });
        } else {
          // 初回は推奨設定を適用
          setSettings({
            ...defaultSettings,
            userId,
            categories: NOTIFICATION_PRESETS.recommended.categories
          });
        }
      } catch (error) {
        console.error('設定の読み込みに失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  // 通知権限の状態を取得
  useEffect(() => {
    if ('Notification' in window) {
      setSettings(prev => ({
        ...prev,
        permission: Notification.permission
      }));
    }
  }, []);

  // 設定の保存
  const saveSettings = useCallback(() => {
    try {
      const toSave = {
        ...settings,
        updatedAt: new Date()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('設定の保存に失敗:', error);
      return false;
    }
  }, [settings]);

  // グローバル設定の切り替え
  const toggleGlobalEnabled = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      globalEnabled: !prev.globalEnabled
    }));
    setHasUnsavedChanges(true);
  }, []);

  // かんたん設定の変更
  const setQuickSetting = useCallback((setting: 'all' | 'important' | 'none') => {
    setSettings(prev => {
      let newCategories = { ...prev.categories };

      switch (setting) {
        case 'all':
          // すべての通知をON
          Object.keys(newCategories).forEach(key => {
            newCategories[key as NotificationCategory] = {
              ...newCategories[key as NotificationCategory],
              enabled: true
            };
          });
          break;

        case 'important':
          // 重要な通知のみON（推奨設定を適用）
          newCategories = NOTIFICATION_PRESETS.recommended.categories;
          break;

        case 'none':
          // すべての通知をOFF
          Object.keys(newCategories).forEach(key => {
            newCategories[key as NotificationCategory] = {
              ...newCategories[key as NotificationCategory],
              enabled: false
            };
          });
          break;
      }

      return {
        ...prev,
        quickSetting: setting,
        categories: newCategories
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // カテゴリ別設定の切り替え
  const toggleCategory = useCallback((category: NotificationCategory) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          enabled: !prev.categories[category]?.enabled
        }
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // カテゴリの詳細設定を更新
  const updateCategorySettings = useCallback(
    (category: NotificationCategory, updates: Partial<CategorySettings>) => {
      setSettings(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: {
            ...prev.categories[category],
            ...updates
          }
        }
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // サブタイプの設定を切り替え
  const toggleSubType = useCallback(
    (category: NotificationCategory, subTypeId: string) => {
      setSettings(prev => {
        const categorySettings = prev.categories[category] || {};
        const currentSubTypes = categorySettings.subTypes || {};

        return {
          ...prev,
          categories: {
            ...prev.categories,
            [category]: {
              ...categorySettings,
              subTypes: {
                ...currentSubTypes,
                [subTypeId]: !currentSubTypes[subTypeId]
              }
            }
          }
        };
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  // 通知権限をリクエスト
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.error('このブラウザは通知をサポートしていません');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({
        ...prev,
        permission
      }));
      return permission === 'granted';
    } catch (error) {
      console.error('通知権限のリクエストに失敗:', error);
      return false;
    }
  }, []);

  // 静音時間の設定
  const setQuietHours = useCallback((enabled: boolean, startTime?: string, endTime?: string) => {
    setSettings(prev => ({
      ...prev,
      quietHours: enabled
        ? {
            enabled: true,
            startTime: startTime || '22:00',
            endTime: endTime || '07:00'
          }
        : undefined
    }));
    setHasUnsavedChanges(true);
  }, []);

  // 現在静音時間中かチェック
  const isInQuietHours = useCallback(() => {
    if (!settings.quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const { startTime, endTime } = settings.quietHours;

    if (startTime <= endTime) {
      // 同じ日の範囲（例: 09:00 - 17:00）
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 日をまたぐ範囲（例: 22:00 - 07:00）
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [settings.quietHours]);

  // 設定をリセット
  const resetSettings = useCallback(() => {
    setSettings({
      ...defaultSettings,
      userId,
      categories: NOTIFICATION_PRESETS.recommended.categories
    });
    setHasUnsavedChanges(true);
  }, [userId]);

  return {
    settings,
    isLoading,
    hasUnsavedChanges,
    saveSettings,
    toggleGlobalEnabled,
    setQuickSetting,
    toggleCategory,
    updateCategorySettings,
    toggleSubType,
    requestPermission,
    setQuietHours,
    isInQuietHours,
    resetSettings
  };
};