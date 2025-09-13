/**
 * 評価通知インターフェース
 * 医療職員管理システム → VoiceDrive の通知連携用
 */

export interface EvaluationNotification {
  // 基本情報
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  
  // 通知タイプ
  notificationType: 'summer_provisional' | 'winter_provisional' | 'annual_final';
  evaluationYear: number;
  createdAt: string;
  scheduledSendAt?: string; // 送信予定日時
  
  // 評価データ
  evaluationData: {
    // 組織貢献度（夏季・冬季）
    facilityContribution?: {
      points: number;
      maxPoints: number;
      grade: 'S' | 'A' | 'B' | 'C' | 'D';
      ranking?: {
        position: number;
        total: number;
      };
    };
    
    corporateContribution?: {
      points: number;
      maxPoints: number;
      grade: 'S' | 'A' | 'B' | 'C' | 'D';
      ranking?: {
        position: number;
        total: number;
      };
    };
    
    // 総合評価（3月確定時）
    finalEvaluation?: {
      totalPoints: number;
      finalGrade: string;
      technicalScore?: number;
      comments?: string;
    };
    
    // 暫定評価（夏季・冬季）
    provisionalData?: {
      estimatedTotalScore: {
        min: number;
        max: number;
        current: number;
      };
      confidence: 'low' | 'medium' | 'high';
    };
  };
  
  // メッセージ設定
  message: {
    title: string;
    body: string;
    actionText?: string; // 「詳細を確認」など
    actionUrl?: string;  // 面談予約リンクなど
  };
  
  // 送信状態
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
  sentAt?: string;
  readAt?: string;
  errorMessage?: string;
  
  // メタデータ
  metadata?: {
    appealDeadline?: string; // 異議申し立て期限
    feedbackInterviewAvailable?: boolean;
    relatedDocuments?: string[];
  };
}

export interface EvaluationNotificationRequest {
  staffIds: string[]; // 複数職員への一括送信対応
  notificationType: EvaluationNotification['notificationType'];
  evaluationYear: number;
  scheduledSendAt?: string;
  
  // テンプレート設定
  messageTemplate?: {
    useDefaultTemplate: boolean;
    customTitle?: string;
    customBody?: string;
  };
  
  // 送信オプション
  sendOptions?: {
    immediate: boolean;
    batchSize?: number; // 一括送信時のバッチサイズ
    retryCount?: number;
  };
}

export interface EvaluationNotificationResponse {
  success: boolean;
  notificationIds: string[];
  message: string;
  errors?: Array<{
    staffId: string;
    error: string;
  }>;
}

// VoiceDrive側での通知受信インターフェース
export interface VoiceDriveNotificationHandler {
  onEvaluationNotificationReceived(notification: EvaluationNotification): Promise<void>;
  onBulkNotificationsReceived(notifications: EvaluationNotification[]): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
  getNotificationHistory(staffId: string): Promise<EvaluationNotification[]>;
}