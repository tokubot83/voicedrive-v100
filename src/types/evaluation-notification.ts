// V3評価通知システムの型定義
export interface EvaluationNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluationPeriod: string;
  evaluationScore: number;
  evaluationGrade: string;
  // 3軸評価対応
  facilityGrade?: string;      // 施設内評価 (S, A, B, C, D の5段階)
  corporateGrade?: string;     // 法人内評価 (S, A, B, C, D の5段階)
  overallGrade?: string;       // 総合評価 (S, A+, A, B+, B, C, D の7段階)
  overallScore?: number;       // 総合評価点数 (0-100点)
  disclosureDate: string;
  appealDeadline: string;
  hasUnreadNotification: boolean;
  notificationSentAt?: string;
  notificationReadAt?: string;
  appealSubmitted: boolean;
  appealId?: string;
}

// 評価通知の送信リクエスト
export interface EvaluationNotificationRequest {
  employeeId: string;
  employeeName: string;
  evaluationPeriod: string;
  evaluationScore: number;
  evaluationGrade: string;
  // 3軸評価対応
  facilityGrade?: string;      // 施設内評価 (S, A, B, C, D の5段階)
  corporateGrade?: string;     // 法人内評価 (S, A, B, C, D の5段階)
  overallGrade?: string;       // 総合評価 (S, A+, A, B+, B, C, D の7段階)
  overallScore?: number;       // 総合評価点数 (0-100点)
  disclosureDate: string;
  appealDeadline: string;
  medicalSystemUrl?: string;
  additionalMessage?: string;
}

// 評価通知の設定
export interface NotificationSettings {
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSmsNotifications: boolean;
  reminderDaysBefore: number; // 異議申立締切前の通知日数
  autoMarkAsRead: boolean;
}

// 通知テンプレートの種類
export enum NotificationTemplateType {
  EVALUATION_DISCLOSURE = 'evaluation_disclosure',
  APPEAL_DEADLINE_REMINDER = 'appeal_deadline_reminder',
  APPEAL_SUBMITTED_CONFIRMATION = 'appeal_submitted_confirmation',
  APPEAL_RESPONSE_AVAILABLE = 'appeal_response_available'
}

// 通知テンプレート
export interface NotificationTemplate {
  type: NotificationTemplateType;
  title: string;
  body: string;
  actionText: string;
  actionUrl: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// V3評価通知の送信レスポンス
export interface EvaluationNotificationResponse {
  success: boolean;
  notificationId: string;
  message: string;
  deliveryMethods: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  estimatedDeliveryTime: string;
}

// 通知統計
export interface NotificationStats {
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  averageReadTime: number; // 分単位
  appealActionRate: number; // 通知後の異議申立率
}

// 評価通知リストの項目
export interface EvaluationNotificationListItem {
  id: string;
  employeeName: string;
  evaluationPeriod: string;
  score: number;
  grade: string;
  // 3軸評価対応
  facilityGrade?: string;      // 施設内評価 (S, A, B, C, D の5段階)
  corporateGrade?: string;     // 法人内評価 (S, A, B, C, D の5段階)
  overallGrade?: string;       // 総合評価 (S, A+, A, B+, B, C, D の7段階)
  overallScore?: number;       // 総合評価点数 (0-100点)
  disclosureDate: string;
  appealDeadline: string;
  notificationStatus: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  appealStatus: 'none' | 'submitted' | 'in_review' | 'resolved';
  daysUntilDeadline: number;
  isUrgent: boolean;
}

// 評価通知の一括送信リクエスト
export interface BulkEvaluationNotificationRequest {
  evaluationPeriod: string;
  notifications: EvaluationNotificationRequest[];
  scheduledSendTime?: string;
  testMode: boolean;
}

// V3グレード表示用の設定
export interface GradeDisplayConfig {
  grade: string;
  color: string;
  description: string;
  scoreRange: {
    min: number;
    max: number;
  };
}

// 評価通知フィルター
export interface NotificationFilter {
  evaluationPeriod?: string;
  notificationStatus?: string[];
  appealStatus?: string[];
  scoreRange?: {
    min: number;
    max: number;
  };
  deadlineRange?: {
    from: string;
    to: string;
  };
  searchQuery?: string;
}

// 評価通知のバリデーションルール
export const EVALUATION_NOTIFICATION_VALIDATION_RULES = {
  employeeId: {
    required: true,
    pattern: /^[A-Z0-9]{6,12}$/
  },
  evaluationScore: {
    required: true,
    min: 0,
    max: 100,
    integer: true
  },
  evaluationPeriod: {
    required: true,
    minLength: 5,
    maxLength: 50
  },
  disclosureDate: {
    required: true,
    dateFormat: 'YYYY-MM-DD'
  },
  appealDeadline: {
    required: true,
    dateFormat: 'YYYY-MM-DD',
    mustBeAfterDisclosure: true
  }
};

// デフォルトの通知テンプレート
export const DEFAULT_NOTIFICATION_TEMPLATES: Record<NotificationTemplateType, NotificationTemplate> = {
  [NotificationTemplateType.EVALUATION_DISCLOSURE]: {
    type: NotificationTemplateType.EVALUATION_DISCLOSURE,
    title: '評価結果開示のお知らせ',
    body: '{period}の評価結果が開示されました。スコア: {score}点 (グレード: {grade})\n\n評価結果の詳細確認や異議申立はVoiceDriveアプリからお願いします。\n\n異議申立期限: {deadline}',
    actionText: 'VoiceDriveで確認する',
    actionUrl: '/evaluation/notifications/{notificationId}',
    priority: 'high'
  },
  [NotificationTemplateType.APPEAL_DEADLINE_REMINDER]: {
    type: NotificationTemplateType.APPEAL_DEADLINE_REMINDER,
    title: '異議申立期限のリマインダー',
    body: '{period}の評価に対する異議申立期限が{days}日後に迫っています。\n\n必要に応じてVoiceDriveアプリから異議申立をお願いします。',
    actionText: 'VoiceDriveで確認する',
    actionUrl: '/evaluation/notifications/{notificationId}',
    priority: 'medium'
  },
  [NotificationTemplateType.APPEAL_SUBMITTED_CONFIRMATION]: {
    type: NotificationTemplateType.APPEAL_SUBMITTED_CONFIRMATION,
    title: '異議申立受理のお知らせ',
    body: '{period}の評価に対する異議申立を受理しました。\n\n申立ID: {appealId}\n担当者による確認後、回答いたします。',
    actionText: '申立状況を確認する',
    actionUrl: '/appeals/{appealId}',
    priority: 'medium'
  },
  [NotificationTemplateType.APPEAL_RESPONSE_AVAILABLE]: {
    type: NotificationTemplateType.APPEAL_RESPONSE_AVAILABLE,
    title: '異議申立回答のお知らせ',
    body: '{period}の評価異議申立に対する回答が完了しました。\n\nVoiceDriveアプリで回答内容をご確認ください。',
    actionText: '回答を確認する',
    actionUrl: '/appeals/{appealId}',
    priority: 'high'
  }
};

export default EvaluationNotification;