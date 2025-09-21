// 通知の重要度レベル
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

// 通知カテゴリ
export type NotificationCategory =
  | 'hr_announcement'      // 人事お知らせ
  | 'interview'            // 面談予約
  | 'evaluation'           // V3評価
  | 'project'              // プロジェクト
  | 'survey'               // アンケート
  | 'feedback'             // フィードバック
  | 'shift'                // シフト・勤務
  | 'training'             // 研修・教育
  | 'system';              // システム

// 通知タイプの詳細
export interface NotificationType {
  id: string;
  category: NotificationCategory;
  name: string;
  description: string;
  defaultPriority: NotificationPriority;
  canDisable: boolean;  // 無効化可能かどうか
}

// ユーザーの通知設定
export interface UserNotificationSettings {
  userId: string;
  globalEnabled: boolean;  // 通知全体のON/OFF
  quickSetting: 'all' | 'important' | 'none';  // かんたん設定

  // カテゴリ別設定
  categories: {
    [key in NotificationCategory]?: CategorySettings;
  };

  // 通知権限の状態
  permission: NotificationPermission;

  // 通知時間の設定
  quietHours?: {
    enabled: boolean;
    startTime: string;  // "22:00"
    endTime: string;    // "07:00"
  };

  // デバイス設定
  deviceTokens?: string[];

  updatedAt: Date;
}

// カテゴリ別設定
export interface CategorySettings {
  enabled: boolean;
  priority: NotificationPriority;
  sound: boolean;
  vibration: boolean;

  // 詳細設定
  subTypes?: {
    [typeId: string]: boolean;
  };
}

// 通知設定のプリセット
export const NOTIFICATION_PRESETS = {
  recommended: {
    quickSetting: 'important' as const,
    categories: {
      hr_announcement: {
        enabled: true,
        priority: 'high',
        sound: true,
        vibration: true
      },
      interview: {
        enabled: true,
        priority: 'high',
        sound: true,
        vibration: false
      },
      evaluation: {
        enabled: true,
        priority: 'medium',
        sound: false,
        vibration: false
      },
      project: {
        enabled: true,
        priority: 'medium',
        sound: false,
        vibration: false
      },
      survey: {
        enabled: false,
        priority: 'low',
        sound: false,
        vibration: false
      },
      feedback: {
        enabled: true,
        priority: 'low',
        sound: false,
        vibration: false
      },
      shift: {
        enabled: true,
        priority: 'high',
        sound: true,
        vibration: true
      },
      training: {
        enabled: true,
        priority: 'medium',
        sound: false,
        vibration: false
      },
      system: {
        enabled: true,
        priority: 'low',
        sound: false,
        vibration: false
      }
    }
  },

  minimal: {
    quickSetting: 'important' as const,
    categories: {
      hr_announcement: {
        enabled: true,
        priority: 'critical',
        sound: true,
        vibration: true
      },
      interview: {
        enabled: true,
        priority: 'high',
        sound: false,
        vibration: false
      },
      shift: {
        enabled: true,
        priority: 'high',
        sound: true,
        vibration: false
      }
    }
  }
};

// 通知カテゴリの表示情報
export const NOTIFICATION_CATEGORIES_INFO = {
  hr_announcement: {
    name: '人事・お知らせ',
    icon: '📢',
    description: '人事部からの重要なお知らせや連絡事項',
    subTypes: [
      { id: 'emergency', name: '緊急連絡', mandatory: true },
      { id: 'important', name: '重要なお知らせ' },
      { id: 'general', name: '一般的なお知らせ' }
    ]
  },
  interview: {
    name: '面談・予約',
    icon: '📅',
    description: '面談の予約確認やリマインダー',
    subTypes: [
      { id: 'confirmation', name: '予約確定通知' },
      { id: 'reminder_day', name: '前日リマインダー' },
      { id: 'reminder_hour', name: '1時間前リマインダー' },
      { id: 'change', name: '変更・キャンセル通知' }
    ]
  },
  evaluation: {
    name: 'V3評価',
    icon: '📊',
    description: '評価期間の通知や結果のお知らせ',
    subTypes: [
      { id: 'period_start', name: '評価期間開始' },
      { id: 'deadline', name: '締切リマインダー' },
      { id: 'complete', name: '評価完了通知' },
      { id: 'appeal', name: '異議申立関連' }
    ]
  },
  project: {
    name: 'プロジェクト',
    icon: '🚀',
    description: 'プロジェクトへの招集や進捗連絡',
    subTypes: [
      { id: 'invitation', name: 'メンバー選出通知' },
      { id: 'emergency', name: '緊急招集' },
      { id: 'progress', name: '進捗更新要請' },
      { id: 'complete', name: '完了通知' }
    ]
  },
  survey: {
    name: 'アンケート',
    icon: '📋',
    description: 'アンケートや調査への協力依頼',
    subTypes: [
      { id: 'new', name: '新規アンケート' },
      { id: 'reminder', name: '回答リマインダー' },
      { id: 'mandatory', name: '必須アンケート' }
    ]
  },
  feedback: {
    name: 'フィードバック',
    icon: '💬',
    description: 'フィードバックや承認依頼',
    subTypes: [
      { id: 'received', name: 'フィードバック受信' },
      { id: 'approval', name: '承認依頼' },
      { id: 'approved', name: '承認完了' }
    ]
  },
  shift: {
    name: 'シフト・勤務',
    icon: '📅',
    description: 'シフト変更や勤務に関する通知',
    subTypes: [
      { id: 'change', name: 'シフト変更' },
      { id: 'cover', name: '代替要請' },
      { id: 'overtime', name: '超過勤務アラート' }
    ]
  },
  training: {
    name: '研修・教育',
    icon: '🎓',
    description: '研修案内や資格更新のお知らせ',
    subTypes: [
      { id: 'invitation', name: '研修案内' },
      { id: 'mandatory', name: '必須研修リマインダー' },
      { id: 'license', name: '資格更新通知' }
    ]
  },
  system: {
    name: 'システム',
    icon: '⚙️',
    description: 'システムメンテナンスやアップデート情報',
    subTypes: [
      { id: 'maintenance', name: 'メンテナンス予告' },
      { id: 'update', name: 'アップデート情報' },
      { id: 'error', name: 'エラー通知' }
    ]
  }
};