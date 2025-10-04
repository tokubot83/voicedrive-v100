// LLM Moderation API Type Definitions
// Llama 3.2 8B ローカルLLM連携用型定義

/**
 * LLMモデレーションリクエスト
 */
export interface LLMModerationRequest {
  content: string;              // チェック対象テキスト
  context?: {
    postType?: 'improvement' | 'community' | 'report';  // 投稿タイプ
    authorLevel?: number;       // 投稿者の権限レベル
    department?: string;        // 部署情報
  };
  options?: {
    checkSensitivity?: 'low' | 'medium' | 'high';  // 検出感度
    language?: 'ja' | 'en';     // 言語（デフォルト: ja）
    includeExplanation?: boolean;  // 判定理由を含むか
  };
}

/**
 * LLMモデレーション判定結果
 */
export interface LLMModerationResult {
  allowed: boolean;             // 投稿可否
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';  // 重大度
  confidence: number;           // 信頼度（0-100）

  violations: LLMViolation[];   // 検出された違反リスト

  explanation?: string;         // 判定理由の説明
  suggestedEdits?: string[];    // 修正提案

  metadata: {
    modelVersion: string;       // 使用モデルバージョン
    processingTime: number;     // 処理時間（ミリ秒）
    timestamp: Date;
  };
}

/**
 * LLM検出違反項目
 */
export interface LLMViolation {
  type: LLMViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;          // 違反内容の説明
  extractedText?: string;       // 問題のあるテキスト抽出
  startIndex?: number;          // テキスト開始位置
  endIndex?: number;            // テキスト終了位置
  confidence: number;           // この違反の信頼度（0-100）
}

/**
 * LLM検出違反タイプ
 */
export type LLMViolationType =
  | 'personal_attack'           // 個人攻撃
  | 'defamation'                // 誹謗中傷
  | 'harassment'                // ハラスメント（パワハラ・セクハラ等）
  | 'discrimination'            // 差別的表現
  | 'privacy_violation'         // プライバシー侵害
  | 'inappropriate_content'     // 不適切なコンテンツ
  | 'threatening'               // 脅迫的表現
  | 'hate_speech'              // ヘイトスピーチ
  | 'misinformation'           // 誤情報・デマ
  | 'spam'                     // スパム
  | 'other';                   // その他

/**
 * LLM APIエラーレスポンス
 */
export interface LLMAPIError {
  error: {
    code: string;               // エラーコード
    message: string;            // エラーメッセージ
    details?: unknown;          // 詳細情報
  };
  timestamp: Date;
}

/**
 * LLM API設定
 */
export interface LLMAPIConfig {
  endpoint: string;             // APIエンドポイントURL
  apiKey?: string;              // APIキー（認証が必要な場合）
  timeout: number;              // タイムアウト（ミリ秒）
  retryAttempts: number;        // リトライ回数
  fallbackToLocal: boolean;     // API障害時にローカルチェックにフォールバック
  cacheEnabled: boolean;        // レスポンスキャッシュ有効化
  cacheDuration: number;        // キャッシュ保持時間（ミリ秒）
}

/**
 * LLMモデレーション統計
 */
export interface LLMModerationStats {
  totalRequests: number;        // 総リクエスト数
  totalViolations: number;      // 総違反検出数
  averageProcessingTime: number;  // 平均処理時間（ミリ秒）
  apiSuccessRate: number;       // API成功率（%）
  violationsByType: Record<LLMViolationType, number>;  // タイプ別違反数
  cacheHitRate: number;         // キャッシュヒット率（%）
}

/**
 * ハイブリッドモデレーション結果
 * （クライアント側チェック + LLMチェック）
 */
export interface HybridModerationResult {
  finalDecision: boolean;       // 最終判定（投稿可否）

  clientResult: {               // クライアント側結果
    allowed: boolean;
    severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    violations: string[];
  };

  llmResult?: LLMModerationResult;  // LLM結果（API成功時のみ）

  usedLLM: boolean;             // LLMを使用したか
  fallbackReason?: string;      // フォールバック理由（LLM未使用時）

  combinedSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';  // 統合重大度
  recommendedAction: 'allow' | 'warn' | 'block';  // 推奨アクション
}

/**
 * バッチモデレーションリクエスト（医療チーム提案）
 */
export interface LLMBatchModerationRequest {
  posts: Array<{
    postId: string;
    content: string;
    context?: {
      postType?: 'improvement' | 'community' | 'report';
      authorLevel?: number;
      department?: string;
    };
  }>;
  options?: {
    checkSensitivity?: 'low' | 'medium' | 'high';
    language?: 'ja' | 'en';
    includeExplanation?: boolean;
  };
}

/**
 * バッチモデレーション結果（医療チーム提案）
 */
export interface LLMBatchModerationResult {
  results: Array<{
    postId: string;
  } & LLMModerationResult>;
  totalProcessingTime: number;  // ミリ秒
  metadata: {
    batchSize: number;
    successCount: number;
    failureCount: number;
  };
}

/**
 * ヘルスチェック結果（医療チーム提案）
 */
export interface LLMHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    llm: 'ok' | 'error';
    cache: 'ok' | 'error';
    database?: 'ok' | 'error';
  };
  version: string;
  uptime: number;  // 秒
  timestamp: string;  // ISO 8601
}

/**
 * メトリクス結果（医療チーム提案）
 */
export interface LLMMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
  };
  performance: {
    avgResponseTime: number;  // ミリ秒
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  detections: Record<LLMViolationType, number>;
  period: 'last_1h' | 'last_24h' | 'last_7d' | 'last_30d';
}
