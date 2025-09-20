// 人事お知らせシステムの型定義

export interface HRAnnouncement {
  id: string;
  title: string;
  content: string;

  // カテゴリ・優先度
  category: 'URGENT' | 'MEETING' | 'TRAINING' | 'HEALTH' | 'SURVEY' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  // アンケートサブカテゴリ（SURVEYカテゴリの場合のみ）
  surveySubCategory?: 'satisfaction' | 'workenv' | 'education' | 'welfare' | 'system' | 'event' | 'other';

  // 作成者情報
  authorId: string;
  authorName: string;
  authorDepartment: string;

  // 公開設定
  publishAt: Date;
  isActive: boolean;

  // 応答設定（カスタマイズ機能）
  requireResponse: boolean;
  responseType?: 'acknowledged' | 'completed' | 'custom';
  responseText?: string;
  responseRequired?: boolean;

  // 対象者設定
  targetAudience: {
    departments?: string[];
    roles?: string[];
    individuals?: string[];
    isGlobal: boolean;
  };

  // 添付ファイル
  attachments?: {
    id: string;
    name: string;
    url: string;
    size: number;
  }[];

  // アクション設定（ストレスチェック、面談予約など）
  actionButton?: {
    text: string;
    url: string;
    type: 'internal' | 'external' | 'medical_system';
  };

  // 統計情報
  stats?: {
    delivered: number;
    responses: number;
    completions: number;
  };

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

// カテゴリ表示設定
export interface CategoryConfig {
  key: HRAnnouncement['category'];
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

// 応答データ
export interface HRResponse {
  announcementId: string;
  userId: string;
  responseType: 'acknowledged' | 'completed' | 'custom';
  responseText?: string;
  respondedAt: Date;
}

// 通知設定
export interface HRNotificationSettings {
  userId: string;
  categories: {
    [K in HRAnnouncement['category']]: boolean;
  };
  deliveryMethods: {
    push: boolean;
    email: boolean;
  };
  quietHours?: {
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}

// フィルター設定
export interface HRAnnouncementFilter {
  categories?: HRAnnouncement['category'][];
  priorities?: HRAnnouncement['priority'][];
  departments?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  requiresResponse?: boolean;
  hasResponded?: boolean;
}