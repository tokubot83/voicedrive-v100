// VoiceDrive側の異議申し立て型定義
import { 
  AppealRequest, 
  AppealResponse, 
  AppealStatus, 
  AppealCategory,
  AppealRecord
} from '../../mcp-shared/interfaces/appeal.interface';

// フロントエンド用の拡張型
export interface AppealFormData extends Partial<AppealRequest> {
  step?: number;
  isSubmitting?: boolean;
  validationErrors?: Record<string, string>;
}

export interface AppealListItem {
  appealId: string;
  evaluationPeriod: string;
  appealCategory: AppealCategory;
  status: AppealStatus;
  statusLabel: string;
  statusColor: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canWithdraw: boolean;
}

export interface AppealNotification {
  id: string;
  appealId: string;
  type: 'status_update' | 'info_request' | 'resolution';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}

// カテゴリーのラベル定義
export const APPEAL_CATEGORY_LABELS: Record<AppealCategory, string> = {
  [AppealCategory.CRITERIA_MISINTERPRETATION]: '評価基準の誤解釈',
  [AppealCategory.ACHIEVEMENT_OVERSIGHT]: '成果の見落とし',
  [AppealCategory.PERIOD_ERROR]: '評価期間の誤り',
  [AppealCategory.CALCULATION_ERROR]: '点数計算の誤り',
  [AppealCategory.OTHER]: 'その他'
};

// ステータスのラベルと色定義
export const APPEAL_STATUS_CONFIG: Record<AppealStatus, { label: string; color: string; icon: string }> = {
  [AppealStatus.RECEIVED]: {
    label: '受理済み',
    color: 'blue',
    icon: '📝'
  },
  [AppealStatus.UNDER_REVIEW]: {
    label: '審査中',
    color: 'orange',
    icon: '🔍'
  },
  [AppealStatus.ADDITIONAL_INFO]: {
    label: '追加情報待ち',
    color: 'yellow',
    icon: '📋'
  },
  [AppealStatus.RESOLVED]: {
    label: '解決済み',
    color: 'green',
    icon: '✅'
  },
  [AppealStatus.WITHDRAWN]: {
    label: '取り下げ',
    color: 'gray',
    icon: '↩️'
  },
  [AppealStatus.REJECTED]: {
    label: '却下',
    color: 'red',
    icon: '❌'
  }
};

// バリデーションルール
export const APPEAL_VALIDATION_RULES = {
  appealReason: {
    minLength: 100,
    maxLength: 2000,
    required: true
  },
  evidenceDocuments: {
    maxFiles: 5,
    maxSizePerFile: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
  },
  submissionDeadline: 14 // 評価開示後14日以内
};

// Re-export from MCP shared
export { AppealRequest, AppealResponse, AppealStatus, AppealCategory, AppealRecord };