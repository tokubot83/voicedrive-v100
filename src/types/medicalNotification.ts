// 面談変更・キャンセル通知の型定義
export interface InterviewChangeNotification {
  // 基本情報
  staffId: string;
  staffName: string;
  reservationId: string;

  // 変更タイプ
  changeType: 'cancelled' | 'rescheduled' | 'location_changed' | 'interviewer_changed';

  // 元の情報
  originalData: {
    scheduledDate: string;
    scheduledTime: string;
    location: string;
    interviewer: {
      name: string;
      title: string;
      department: string;
      contactExtension: string;
    };
  };

  // 新しい情報（変更の場合）
  newData?: {
    scheduledDate?: string;
    scheduledTime?: string;
    location?: string;
    interviewer?: {
      name: string;
      title: string;
      department: string;
      contactExtension: string;
    };
  };

  // 変更理由・詳細
  changeReason: string;
  isUrgent: boolean;
  requiresAcknowledgement: boolean;

  // システム情報
  changedBy: string;
  changedAt: string;
  notificationType: 'interview_change';
  sourceSystem: 'medical_system';
}

// 面談キャンセル要求（VoiceDrive → 医療システム）
export interface InterviewCancellationRequest {
  reservationId: string;
  staffId: string;
  cancellationType: 'advance' | 'same_day' | 'emergency';
  cancellationReason: string;
  requestedBy: string;
  requestedAt: string;
  contactMethod?: 'phone' | 'email' | 'in_person';
}

// 医療システムからの面談確定通知の型定義
export interface InterviewConfirmationData {
  // 基本情報
  staffId: string;
  staffName: string;
  department: string;
  position: string;

  // 面談詳細
  interviewType: 'regular' | 'special' | 'support';
  urgency: 'urgent' | 'high' | 'medium' | 'low';
  preferredDates: string[];

  // 確定情報
  finalScheduledDate: string;
  finalScheduledTime: string;
  duration: number; // 分
  location: string;
  format: 'face_to_face' | 'online' | 'hybrid';

  // 担当者情報
  interviewer: {
    name: string;
    title: string;
    department: string;
    contactExtension: string;
  };

  // 承認情報
  confirmedBy: string;
  confirmedAt: string;

  // システム情報
  reservationId: string;
  notificationType: 'interview_confirmed';
  sourceSystem: 'medical_system';
}

// 通知ステータス管理
export interface NotificationStatus {
  notificationStatus: 'sent' | 'delivered' | 'read' | 'acknowledged';
  userAction: 'none' | 'read' | 'acknowledged' | 'declined';
  reminder1Sent: boolean;
  reminder2Sent: boolean;
  attendanceConfirmed: boolean;
  lastUpdated: string;
}

// 面談確定通知の完全な型
export interface InterviewConfirmationNotification {
  id: string;
  data: InterviewConfirmationData;
  status: NotificationStatus;
  receivedAt: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// 緊急度の表示設定
export const urgencyConfig = {
  urgent: { label: '緊急', color: 'bg-red-500', textColor: 'text-red-800', bgColor: 'bg-red-50' },
  high: { label: '高', color: 'bg-orange-500', textColor: 'text-orange-800', bgColor: 'bg-orange-50' },
  medium: { label: '中', color: 'bg-yellow-500', textColor: 'text-yellow-800', bgColor: 'bg-yellow-50' },
  low: { label: '低', color: 'bg-green-500', textColor: 'text-green-800', bgColor: 'bg-green-50' }
};

// 面談タイプの表示設定
export const interviewTypeConfig = {
  regular: { label: '定期面談', icon: '📅' },
  special: { label: '特別面談', icon: '🎯' },
  support: { label: 'サポート面談', icon: '🤝' }
};