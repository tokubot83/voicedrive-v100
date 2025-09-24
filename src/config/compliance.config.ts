/**
 * コンプライアンス窓口設定
 * 医療職員管理システムとの統合設定
 * @version 2.0.0
 * @date 2025-09-24
 */

// ==================== API接続設定 ====================

export const MEDICAL_SYSTEM_API = {
  // 基本設定
  BASE_URL: process.env.MEDICAL_SYSTEM_API_BASE || 'https://voicedrive.ai/api/v2',
  ENDPOINT: process.env.MEDICAL_SYSTEM_API_ENDPOINT || '/compliance',
  API_KEY: process.env.COMPLIANCE_API_KEY || '',
  VERSION: process.env.API_VERSION || 'v2',

  // 接続設定
  TIMEOUT: 30000,  // 30秒
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3'),
  RETRY_BACKOFF: process.env.RETRY_BACKOFF || 'exponential',

  // 同期設定
  SYNC_INTERVAL: parseInt(process.env.SYNC_INTERVAL || '15') * 60 * 1000,  // 分をミリ秒に変換

  // ヘッダー設定
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Client-Version': '2.0.0',
    'X-Client-Type': 'VoiceDrive'
  }
};

// ==================== 暗号化設定 ====================

export const ENCRYPTION_CONFIG = {
  ALGORITHM: process.env.ENCRYPTION_ALGORITHM || 'AES-256-GCM',
  KEY: process.env.ENCRYPTION_KEY || '',
  KEY_ID: process.env.ENCRYPTION_KEY_ID || 'voicedrive_key_2025',
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  SALT_LENGTH: 64,
  KEY_ROTATION_DAYS: 90
};

// ==================== セキュリティ設定 ====================

export const SECURITY_CONFIG = {
  // JWT設定
  JWT: {
    SECRET: process.env.JWT_SECRET || '',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    ALGORITHM: 'RS256' as const
  },

  // MFA設定
  MFA: {
    ENABLED: process.env.MFA_ENABLED === 'true',
    TIMEOUT: 300000  // 5分
  },

  // セッション設定
  SESSION: {
    MAX_AGE: 3600000,  // 1時間
    REFRESH_THRESHOLD: 900000  // 15分
  },

  // アクセス制御
  ACCESS_LEVELS: ['none', 'summary', 'details', 'identity', 'full'] as const,

  // 役職権限
  ROLE_PERMISSIONS: {
    admin: {
      accessLevel: 'full',
      canEdit: true,
      canExport: true,
      canShare: true
    },
    manager: {
      accessLevel: 'identity',
      canEdit: true,
      canExport: true,
      canShare: false
    },
    investigator: {
      accessLevel: 'details',
      canEdit: true,
      canExport: false,
      canShare: false
    },
    viewer: {
      accessLevel: 'summary',
      canEdit: false,
      canExport: false,
      canShare: false
    }
  }
};

// ==================== 監査ログ設定 ====================

export const AUDIT_CONFIG = {
  RETENTION_DAYS: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '2555'),  // 7年間
  HASH_ALGORITHM: process.env.AUDIT_LOG_HASH_ALGORITHM || 'SHA-512',

  // 重要アクション
  CRITICAL_ACTIONS: [
    'IDENTITY_ACCESSED',
    'DATA_EXPORTED',
    'PERMISSION_GRANTED',
    'REPORT_DELETED',
    'ENCRYPTION_KEY_ROTATED'
  ],

  // ログレベル
  LOG_LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    CRITICAL: 4
  }
};

// ==================== 通知設定 ====================

export const NOTIFICATION_CONFIG = {
  CHANNELS: {
    EMAIL: process.env.NOTIFICATION_EMAIL_ENABLED === 'true',
    TEAMS: process.env.NOTIFICATION_TEAMS_ENABLED === 'true',
    SLACK: process.env.NOTIFICATION_SLACK_ENABLED === 'true'
  },

  // エスカレーションルール
  ESCALATION: {
    IMMEDIATE: {
      delay: 0,
      channels: ['email', 'teams'],
      recipients: ['compliance-urgent@hospital.jp']
    },
    HIGH: {
      delay: 3600000,  // 1時間
      channels: ['email'],
      recipients: ['compliance-high@hospital.jp']
    },
    MEDIUM: {
      delay: 86400000,  // 24時間
      channels: ['email'],
      recipients: ['compliance@hospital.jp']
    },
    LOW: {
      delay: 604800000,  // 7日
      channels: ['email'],
      recipients: ['compliance@hospital.jp']
    }
  }
};

// ==================== ステータス管理 ====================

export const STATUS_CONFIG = {
  // 転送ステータス
  TRANSFER_STATUS: {
    PENDING: 'pending',
    ACKNOWLEDGED: 'acknowledged',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },

  // 調査ステータス
  INVESTIGATION_STATUS: {
    NOT_STARTED: 'not_started',
    INITIAL_REVIEW: 'initial_review',
    INVESTIGATION: 'investigation',
    COMMITTEE_REVIEW: 'committee_review',
    ACTION_PLANNING: 'action_planning',
    IMPLEMENTATION: 'implementation',
    MONITORING: 'monitoring',
    CLOSED: 'closed'
  },

  // SLA設定（時間単位）
  SLA: {
    ACKNOWLEDGEMENT: 1,  // 1時間以内に受理確認
    INITIAL_REVIEW: 24,  // 24時間以内に初期レビュー
    INVESTIGATION_START: 72,  // 72時間以内に調査開始
    RESOLUTION: 720  // 30日以内に解決
  }
};

// ==================== バリデーション設定 ====================

export const VALIDATION_CONFIG = {
  // ファイル制限
  FILE: {
    MAX_SIZE: 10485760,  // 10MB
    MAX_COUNT: 10,
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'video/mp4'
    ]
  },

  // テキスト制限
  TEXT: {
    DESCRIPTION_MAX: 5000,
    TITLE_MAX: 200,
    NAME_MAX: 100
  },

  // 日付制限
  DATE: {
    MAX_PAST_DAYS: 365,  // 過去1年まで
    MAX_FUTURE_DAYS: 30  // 未来30日まで
  }
};

// ==================== 環境別設定 ====================

export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // 開発環境用モック設定
  useMockServer: process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API,
  mockServerPort: 3002,

  // デバッグ設定
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    logRequests: process.env.LOG_REQUESTS === 'true',
    logResponses: process.env.LOG_RESPONSES === 'true'
  }
};

// ==================== 統合ポイント設定 ====================

export const INTEGRATION_CONFIG = {
  // VoiceDrive連携設定（医療システムチーム提供）
  VOICEDRIVE: {
    endpoint: 'https://voicedrive.ai/api/v2/compliance',
    authType: 'Bearer Token',
    encryption: 'AES-256-GCM',
    syncInterval: 15,  // minutes
    retryPolicy: {
      maxAttempts: 3,
      backoff: 'exponential'
    }
  },

  // データマッピング
  FIELD_MAPPING: {
    reportId: 'case_number',
    anonymousId: 'anonymous_identifier',
    submittedAt: 'received_at',
    category: 'incident_type',
    severity: 'priority_level'
  },

  // ステータスマッピング
  STATUS_MAPPING: {
    pending: 'awaiting_review',
    acknowledged: 'received',
    processing: 'under_investigation',
    completed: 'resolved',
    failed: 'error'
  }
};

// ==================== エクスポート ====================

export default {
  MEDICAL_SYSTEM_API,
  ENCRYPTION_CONFIG,
  SECURITY_CONFIG,
  AUDIT_CONFIG,
  NOTIFICATION_CONFIG,
  STATUS_CONFIG,
  VALIDATION_CONFIG,
  ENV_CONFIG,
  INTEGRATION_CONFIG
};