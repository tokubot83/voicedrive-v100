// ハイブリッド統合システム用包括的エラーハンドリングサービス
import { errorMessages, getErrorMessageByCode, toUserFriendlyMessage } from '../utils/errorMessages';

// エラー詳細情報
interface ErrorDetails {
  code: string;
  message: string;
  timestamp: Date;
  source: 'mcp' | 'api' | 'hybrid' | 'system';
  operation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  metadata?: Record<string, any>;
}

// 回復戦略
interface RecoveryStrategy {
  shouldRetry: boolean;
  retryDelay: number;
  maxRetries: number;
  fallbackAction?: 'switch_to_api' | 'switch_to_mcp' | 'graceful_degradation' | 'none';
  userMessage: string;
}

// サーキットブレーカー状態
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: Date | null;
  nextRetryTime: Date | null;
}

// エラー統計情報
interface ErrorStats {
  totalErrors: number;
  mcpErrors: number;
  apiErrors: number;
  hybridErrors: number;
  criticalErrors: number;
  lastErrorTime: Date | null;
  errorRate: number; // エラー率（過去1時間）
}

// 設定
interface HybridErrorConfig {
  maxRetries: number;
  retryDelay: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  enableGracefulDegradation: boolean;
  errorTrackingEnabled: boolean;
  notifyOnCriticalErrors: boolean;
}

class HybridErrorHandlingService {
  private config: HybridErrorConfig;
  private circuitBreakers: Map<string, CircuitBreakerState>;
  private errorHistory: ErrorDetails[];
  private errorStats: ErrorStats;
  private maxHistorySize: number = 1000;

  constructor() {
    this.config = {
      maxRetries: parseInt(import.meta.env.VITE_ERROR_RETRY_ATTEMPTS) || 3,
      retryDelay: parseInt(import.meta.env.VITE_ERROR_RETRY_DELAY) || 1000,
      circuitBreakerThreshold: parseInt(import.meta.env.VITE_FAILOVER_THRESHOLD) || 3,
      circuitBreakerTimeout: parseInt(import.meta.env.VITE_CIRCUIT_BREAKER_TIMEOUT) || 30000,
      enableGracefulDegradation: import.meta.env.VITE_ENABLE_GRACEFUL_DEGRADATION !== 'false',
      errorTrackingEnabled: import.meta.env.VITE_ENABLE_ERROR_TRACKING !== 'false',
      notifyOnCriticalErrors: import.meta.env.VITE_NOTIFY_ON_CRITICAL_ERRORS !== 'false'
    };

    this.circuitBreakers = new Map();
    this.errorHistory = [];
    this.errorStats = {
      totalErrors: 0,
      mcpErrors: 0,
      apiErrors: 0,
      hybridErrors: 0,
      criticalErrors: 0,
      lastErrorTime: null,
      errorRate: 0
    };
  }

  // === メインエラーハンドリング ===

  async handleError(
    error: Error | string,
    operation: string,
    source: 'mcp' | 'api' | 'hybrid' | 'system',
    metadata?: Record<string, any>
  ): Promise<RecoveryStrategy> {
    const errorDetails = this.createErrorDetails(error, operation, source, metadata);

    // エラー記録
    if (this.config.errorTrackingEnabled) {
      this.recordError(errorDetails);
    }

    // サーキットブレーカーチェック
    const circuitBreakerKey = `${source}_${operation}`;
    const circuitState = this.getCircuitBreakerState(circuitBreakerKey);

    if (circuitState.isOpen && !this.shouldAllowRequest(circuitState)) {
      return {
        shouldRetry: false,
        retryDelay: 0,
        maxRetries: 0,
        fallbackAction: this.determineFallbackAction(source, errorDetails.severity),
        userMessage: errorMessages.hybrid.circuitBreakerOpen
      };
    }

    // 回復戦略決定
    const recoveryStrategy = this.determineRecoveryStrategy(errorDetails);

    // サーキットブレーカー状態更新
    this.updateCircuitBreakerState(circuitBreakerKey, errorDetails);

    // クリティカルエラー通知
    if (errorDetails.severity === 'critical' && this.config.notifyOnCriticalErrors) {
      await this.notifyCriticalError(errorDetails);
    }

    return recoveryStrategy;
  }

  // === エラー詳細作成 ===

  private createErrorDetails(
    error: Error | string,
    operation: string,
    source: 'mcp' | 'api' | 'hybrid' | 'system',
    metadata?: Record<string, any>
  ): ErrorDetails {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorCode = this.extractErrorCode(errorMessage);
    const severity = this.determineSeverity(errorCode, source, operation);

    return {
      code: errorCode,
      message: errorMessage,
      timestamp: new Date(),
      source,
      operation,
      severity,
      retryable: this.isRetryableError(errorCode, source),
      metadata
    };
  }

  private extractErrorCode(errorMessage: string): string {
    // エラーメッセージからエラーコードを抽出
    const codePatterns = [
      /Error Code: ([A-Z_]+)/i,
      /Code: ([A-Z_]+)/i,
      /([A-Z_]+): /,
      /HTTP (\d+)/
    ];

    for (const pattern of codePatterns) {
      const match = errorMessage.match(pattern);
      if (match) return match[1];
    }

    // デフォルトコード決定
    if (errorMessage.includes('timeout')) return 'TIMEOUT';
    if (errorMessage.includes('network')) return 'NETWORK_ERROR';
    if (errorMessage.includes('authentication')) return 'AUTH_FAILED';
    if (errorMessage.includes('not found')) return 'NOT_FOUND';
    if (errorMessage.includes('rate limit')) return 'RATE_LIMIT';

    return 'UNKNOWN_ERROR';
  }

  private determineSeverity(
    errorCode: string,
    source: string,
    operation: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalOperations = ['booking_creation', 'booking_cancellation', 'audit_logging'];
    const criticalErrors = ['BOTH_FAILED', 'AUDIT_FAILED', 'AUTH_FAILED'];

    if (criticalOperations.includes(operation) || criticalErrors.some(ce => errorCode.includes(ce))) {
      return 'critical';
    }

    if (errorCode.includes('TIMEOUT') || errorCode.includes('CONN_FAILED')) {
      return 'high';
    }

    if (errorCode.includes('RATE_LIMIT') || errorCode.includes('NOT_FOUND')) {
      return 'medium';
    }

    return 'low';
  }

  private isRetryableError(errorCode: string, source: string): boolean {
    const nonRetryableErrors = [
      'AUTH_FAILED', 'FORBIDDEN', 'NOT_FOUND', 'INVALID_REQUEST',
      'RATE_LIMIT', 'CIRCUIT_OPEN'
    ];

    return !nonRetryableErrors.some(nre => errorCode.includes(nre));
  }

  // === 回復戦略決定 ===

  private determineRecoveryStrategy(errorDetails: ErrorDetails): RecoveryStrategy {
    const baseStrategy: RecoveryStrategy = {
      shouldRetry: false,
      retryDelay: this.config.retryDelay,
      maxRetries: this.config.maxRetries,
      fallbackAction: 'none',
      userMessage: toUserFriendlyMessage(errorDetails.message)
    };

    // リトライ可能性チェック
    if (errorDetails.retryable) {
      baseStrategy.shouldRetry = true;
      baseStrategy.retryDelay = this.calculateRetryDelay(errorDetails);
    }

    // フォールバック決定
    baseStrategy.fallbackAction = this.determineFallbackAction(errorDetails.source, errorDetails.severity);

    // ユーザーメッセージ最適化
    baseStrategy.userMessage = this.optimizeUserMessage(errorDetails, baseStrategy.fallbackAction);

    return baseStrategy;
  }

  private calculateRetryDelay(errorDetails: ErrorDetails): number {
    let baseDelay = this.config.retryDelay;

    // 指数バックオフ
    const attemptCount = this.getRecentAttemptCount(errorDetails.operation, errorDetails.source);
    baseDelay *= Math.pow(2, attemptCount - 1);

    // ジッター追加
    const jitter = Math.random() * 0.1 * baseDelay;
    return baseDelay + jitter;
  }

  private determineFallbackAction(
    source: 'mcp' | 'api' | 'hybrid' | 'system',
    severity: string
  ): 'switch_to_api' | 'switch_to_mcp' | 'graceful_degradation' | 'none' {
    if (!this.config.enableGracefulDegradation) return 'none';

    if (source === 'mcp' && severity !== 'low') {
      return 'switch_to_api';
    }

    if (source === 'api' && severity !== 'low') {
      return 'switch_to_mcp';
    }

    if (source === 'hybrid' && severity === 'critical') {
      return 'graceful_degradation';
    }

    return 'none';
  }

  private optimizeUserMessage(errorDetails: ErrorDetails, fallbackAction: string): string {
    const baseMessage = getErrorMessageByCode(errorDetails.code);

    if (fallbackAction !== 'none' && fallbackAction !== 'graceful_degradation') {
      return `${baseMessage}\n${errorMessages.hybrid.fallbackSuccess}`;
    }

    if (fallbackAction === 'graceful_degradation') {
      return `${baseMessage}\n機能を制限して継続します。`;
    }

    return baseMessage;
  }

  // === サーキットブレーカー管理 ===

  private getCircuitBreakerState(key: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: null,
        nextRetryTime: null
      });
    }
    return this.circuitBreakers.get(key)!;
  }

  private updateCircuitBreakerState(key: string, errorDetails: ErrorDetails): void {
    const state = this.getCircuitBreakerState(key);

    state.failureCount++;
    state.lastFailureTime = new Date();

    if (state.failureCount >= this.config.circuitBreakerThreshold) {
      state.isOpen = true;
      state.nextRetryTime = new Date(Date.now() + this.config.circuitBreakerTimeout);
    }

    this.circuitBreakers.set(key, state);
  }

  private shouldAllowRequest(state: CircuitBreakerState): boolean {
    if (!state.isOpen) return true;

    const now = new Date();
    return state.nextRetryTime ? now >= state.nextRetryTime : false;
  }

  // === エラー記録・統計 ===

  private recordError(errorDetails: ErrorDetails): void {
    this.errorHistory.push(errorDetails);

    // 履歴サイズ制限
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }

    // 統計更新
    this.updateErrorStats(errorDetails);
  }

  private updateErrorStats(errorDetails: ErrorDetails): void {
    this.errorStats.totalErrors++;
    this.errorStats.lastErrorTime = errorDetails.timestamp;

    switch (errorDetails.source) {
      case 'mcp':
        this.errorStats.mcpErrors++;
        break;
      case 'api':
        this.errorStats.apiErrors++;
        break;
      case 'hybrid':
        this.errorStats.hybridErrors++;
        break;
    }

    if (errorDetails.severity === 'critical') {
      this.errorStats.criticalErrors++;
    }

    // エラー率計算（過去1時間）
    this.calculateErrorRate();
  }

  private calculateErrorRate(): void {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentErrors = this.errorHistory.filter(e => e.timestamp >= oneHourAgo);

    // 簡易エラー率計算（実際の総リクエスト数が必要）
    this.errorStats.errorRate = recentErrors.length;
  }

  private getRecentAttemptCount(operation: string, source: string): number {
    const fiveMinutesAgo = new Date(Date.now() - 300000);
    return this.errorHistory.filter(e =>
      e.operation === operation &&
      e.source === source &&
      e.timestamp >= fiveMinutesAgo
    ).length;
  }

  // === クリティカルエラー通知 ===

  private async notifyCriticalError(errorDetails: ErrorDetails): Promise<void> {
    try {
      console.error('CRITICAL ERROR DETECTED:', {
        code: errorDetails.code,
        message: errorDetails.message,
        operation: errorDetails.operation,
        source: errorDetails.source,
        timestamp: errorDetails.timestamp,
        metadata: errorDetails.metadata
      });

      // 実装時: アラート送信、管理者通知など
    } catch (notificationError) {
      console.error('Critical error notification failed:', notificationError);
    }
  }

  // === パブリックメソッド ===

  // サーキットブレーカー手動リセット
  resetCircuitBreaker(key: string): void {
    if (this.circuitBreakers.has(key)) {
      const state = this.circuitBreakers.get(key)!;
      state.isOpen = false;
      state.failureCount = 0;
      state.lastFailureTime = null;
      state.nextRetryTime = null;
      this.circuitBreakers.set(key, state);
    }
  }

  // エラー統計取得
  getErrorStats(): ErrorStats {
    this.calculateErrorRate();
    return { ...this.errorStats };
  }

  // 最近のエラー取得
  getRecentErrors(limit: number = 10): ErrorDetails[] {
    return this.errorHistory
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // システム健康状態チェック
  getSystemHealthStatus(): {
    overall: 'healthy' | 'degraded' | 'critical';
    mcp: 'healthy' | 'degraded' | 'critical';
    api: 'healthy' | 'degraded' | 'critical';
    circuitBreakers: Array<{ key: string; isOpen: boolean; failureCount: number }>;
  } {
    const recentErrors = this.errorHistory.filter(e =>
      e.timestamp >= new Date(Date.now() - 300000) // 過去5分
    );

    const mcpErrors = recentErrors.filter(e => e.source === 'mcp');
    const apiErrors = recentErrors.filter(e => e.source === 'api');

    const getHealthLevel = (errorCount: number) => {
      if (errorCount === 0) return 'healthy';
      if (errorCount < 5) return 'degraded';
      return 'critical';
    };

    const mcpHealth = getHealthLevel(mcpErrors.length);
    const apiHealth = getHealthLevel(apiErrors.length);

    const overall = mcpHealth === 'critical' || apiHealth === 'critical' ? 'critical' :
                   mcpHealth === 'degraded' || apiHealth === 'degraded' ? 'degraded' : 'healthy';

    const circuitBreakerStatus = Array.from(this.circuitBreakers.entries()).map(([key, state]) => ({
      key,
      isOpen: state.isOpen,
      failureCount: state.failureCount
    }));

    return {
      overall,
      mcp: mcpHealth,
      api: apiHealth,
      circuitBreakers: circuitBreakerStatus
    };
  }

  // 設定更新
  updateConfig(newConfig: Partial<HybridErrorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const hybridErrorHandlingService = new HybridErrorHandlingService();
export default hybridErrorHandlingService;