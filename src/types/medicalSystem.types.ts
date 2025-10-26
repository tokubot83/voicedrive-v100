/**
 * 医療システムAPI連携用の型定義
 * Phase 2.5で使用
 *
 * 最終更新: 2025-10-26
 * 参照: SystemMonitorPage_VoiceDrive回答書_20251026.md
 */

/**
 * 医療システム側のWebhook送信統計
 * API 1: GET /api/voicedrive/webhook-stats
 */
export interface MedicalSystemWebhookStats {
  /** 過去24時間の送信件数 */
  sent24h: number;
  /** 成功件数 */
  succeeded: number;
  /** 失敗件数 */
  failed: number;
  /** リトライ中の件数 */
  retried: number;
  /** 最終送信日時（ISO 8601） */
  lastSentAt: string;

  /** イベントタイプ別統計 */
  byEventType: {
    [eventType: string]: {
      sent: number;
      succeeded: number;
      failed: number;
      avgResponseTime: number;  // ミリ秒
    };
  };

  /** リトライキューの状態 */
  queueStatus: {
    pending: number;    // 送信待ち
    processing: number; // 処理中
    failed: number;     // 失敗（リトライ上限超過）
  };

  /** リトライポリシー情報 */
  retryPolicy: {
    maxRetries: number;        // 最大リトライ回数
    retryIntervals: number[];  // リトライ間隔（秒）
    currentRetrying: number;   // 現在リトライ中の件数
  };
}

/**
 * 医療システム側の面談実施統計
 * API 2: GET /api/voicedrive/interview-completion-stats
 */
export interface MedicalSystemInterviewStats {
  /** 予定された面談の総数 */
  totalScheduled: number;
  /** 実際に完了した面談数 */
  actuallyCompleted: number;
  /** 実施率（%） */
  completionRate: number;
  /** 無断欠席率（%） */
  noShowRate: number;
  /** 再予約された件数 */
  rescheduledCount: number;
  /** 平均所要時間（分） */
  avgDuration: number;

  /** 面談タイプ別統計 */
  byInterviewType: {
    [type: string]: {
      scheduled: number;
      completed: number;
      completionRate: number;
      avgDuration: number;
    };
  };

  /** 直近完了面談リスト（最大5件） */
  recentCompletions: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;     // ISO 8601
    completedAt: string;     // ISO 8601
    duration: number;        // 分
    status: 'completed';
  }>;

  /** 未完了面談リスト */
  pendingInterviews: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;
    status: 'scheduled';
    isPastDue: boolean;      // 予定時刻を過ぎているか
  }>;

  /** 欠席・キャンセル面談リスト */
  missedInterviews: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;
    status: 'no_show' | 'cancelled';
    reason: string | null;
  }>;
}

/**
 * 拡張された連携メトリクス（VoiceDrive + 医療システム）
 */
export interface EnhancedIntegrationMetrics {
  /** VoiceDrive側のWebhook受信統計 */
  webhook: {
    received24h: number;
    byEventType: {
      [eventType: string]: {
        count: number;
        successRate: number;
        avgProcessingTime: number;
      };
    };
    signatureFailures: number;
    processingErrors: number;
    duplicateEvents: number;
    lastReceived: string | null;
    avgProcessingTime: number;
  };

  /** VoiceDrive側のデータ同期統計 */
  dataSync: {
    totalUsers: number;
    usersWithPhoto: number;
    photoSyncRate: number;
    syncedLast24h: number;
    syncErrors: number;
    lastSyncAt: string | null;
  };

  /** VoiceDrive側の接続性監視 */
  connectivity: {
    webhookEndpointStatus: 'healthy' | 'warning' | 'critical';
    lastWebhookReceived: string | null;
    timeSinceLastWebhook: number | null;
    errorRateTrend: 'improving' | 'stable' | 'degrading';
    recentErrors: Array<{
      timestamp: string;
      eventType: string;
      errorMessage: string;
    }>;
  };

  /** 医療システム側のデータ */
  medicalSystem: {
    webhookStats: MedicalSystemWebhookStats;
    interviewStats: MedicalSystemInterviewStats;

    /** 送信 vs 受信の差分 */
    syncDiscrepancy: number;

    /** 連携の健全性 */
    syncHealth: 'healthy' | 'warning' | 'critical';
  } | null;  // 医療システムAPIがエラーの場合はnull
}

/**
 * 医療システムAPIのエラーレスポンス
 */
export interface MedicalSystemApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * 医療システムAPIの成功レスポンス（共通）
 */
export interface MedicalSystemApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
