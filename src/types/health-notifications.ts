/**
 * 健康通知システムの型定義
 * 医療職員管理システムとの連携用
 */

/**
 * 通知タイプ
 */
export type HealthNotificationType =
  | 'health_risk_assessment'      // リスク評価完了通知
  | 'health_checkup_result'        // 健診結果通知
  | 'stress_check_result'          // ストレスチェック結果通知
  | 'reexamination_required';      // 要再検査通知

/**
 * リスクレベル
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'very-high';

/**
 * 通知優先度
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * リスクカテゴリー詳細
 */
export interface HighRiskCategory {
  category: string;          // カテゴリー名（例: '代謝リスク', '心血管リスク'）
  score: number;             // スコア（0-100）
  level: RiskLevel;          // リスクレベル
}

/**
 * 健康評価データ
 */
export interface HealthAssessment {
  overallScore: number;                  // 総合健康スコア（0-100）
  overallLevel: RiskLevel;               // 総合リスクレベル
  highRiskCategories: HighRiskCategory[]; // 高リスクカテゴリー一覧
  priorityActions: string[];             // 優先対応事項
  nextCheckup: string;                   // 次回検診推奨日（ISO 8601形式）
}

/**
 * 健康推奨事項
 */
export interface HealthRecommendations {
  lifestyle: string[];        // 生活習慣改善提案
  diet: string[];             // 食事改善提案
  exercise: string[];         // 運動改善提案
  medicalFollowUp: string[];  // 医療フォローアップ提案
}

/**
 * 通知メタデータ
 */
export interface NotificationMetadata {
  source: string;                    // 送信元システム（例: 'staff-medical-system'）
  version: string;                   // バージョン（例: '1.0.0'）
  priority: NotificationPriority;    // 優先度
}

/**
 * 健康データ通知
 */
export interface HealthNotification {
  type: HealthNotificationType;       // 通知タイプ
  staffId: string;                    // 職員ID
  timestamp: string;                  // 通知日時（ISO 8601形式）
  assessment?: HealthAssessment;      // 健康評価データ（オプション）
  recommendations?: HealthRecommendations; // 推奨事項（オプション）
  metadata: NotificationMetadata;     // メタデータ
}

/**
 * 健康レポート
 */
export interface HealthReport {
  reportId: string;                   // レポートID
  staffId: string;                    // 職員ID
  reportType: 'individual' | 'department' | 'organization'; // レポートタイプ
  period: {
    start: string;                    // 期間開始（ISO 8601形式）
    end: string;                      // 期間終了（ISO 8601形式）
  };
  summary: {
    totalStaff: number;               // 対象職員数
    averageScore: number;             // 平均健康スコア
    highRiskCount: number;            // 高リスク者数
    actionRequiredCount: number;      // 要対応者数
  };
  data: any;                          // レポートデータ（型は柔軟に対応）
  generatedAt: string;                // 生成日時（ISO 8601形式）
  format: 'json' | 'markdown';        // フォーマット
}

/**
 * 通知処理結果
 */
export interface NotificationProcessResult {
  success: boolean;                   // 処理成功フラグ
  notificationId: string;             // 通知ID
  staffId: string;                    // 職員ID
  processedAt: string;                // 処理日時（ISO 8601形式）
  actions: string[];                  // 実行されたアクション
  error?: string;                     // エラーメッセージ（オプション）
}

/**
 * レポートスケジュール設定
 */
export interface ReportSchedule {
  scheduleId: string;                 // スケジュールID
  reportType: 'individual' | 'department' | 'organization';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];               // 受信者リスト
  nextRun: string;                    // 次回実行日時（ISO 8601形式）
  enabled: boolean;                   // 有効フラグ
}

/**
 * 健康データ検査結果
 */
export interface HealthCheckupData {
  bmi?: number;                       // BMI
  bloodPressureSystolic?: number;     // 収縮期血圧
  bloodPressureDiastolic?: number;    // 拡張期血圧
  ldlCholesterol?: number;            // LDLコレステロール
  hdlCholesterol?: number;            // HDLコレステロール
  triglycerides?: number;             // 中性脂肪
  bloodGlucose?: number;              // 血糖値
  hba1c?: number;                     // HbA1c
  ast?: number;                       // AST
  alt?: number;                       // ALT
  gammaGtp?: number;                  // γ-GTP
  age?: number;                       // 年齢
  gender?: 'male' | 'female';         // 性別
  smokingStatus?: 'never' | 'past' | 'current'; // 喫煙状況
  drinkingFrequency?: 'none' | 'occasional' | 'regular'; // 飲酒頻度
}

/**
 * 通知ファイル情報
 */
export interface NotificationFile {
  filename: string;                   // ファイル名
  path: string;                       // ファイルパス
  createdAt: Date;                    // 作成日時
  processed: boolean;                 // 処理済みフラグ
}

/**
 * 優先度別アクション設定
 */
export interface PriorityAction {
  priority: NotificationPriority;     // 優先度
  condition: string;                  // 条件説明
  actions: string[];                  // 推奨アクション
  timeframe: string;                  // 対応期限
}