// LLM Moderation Service
// Llama 3.2 8B ローカルLLM連携サービス

import {
  LLMModerationRequest,
  LLMModerationResult,
  LLMAPIConfig,
  LLMModerationStats,
  LLMAPIError,
  LLMViolationType
} from '../types/llmModeration';

interface CacheEntry {
  result: LLMModerationResult;
  timestamp: number;
}

export class LLMModerationService {
  private static instance: LLMModerationService;

  // デフォルト設定（医療チーム提案に基づく）
  private config: LLMAPIConfig = {
    endpoint: process.env.REACT_APP_LLM_API_ENDPOINT || 'http://localhost:8000/api/moderate',
    apiKey: process.env.REACT_APP_LLM_API_KEY,
    timeout: 3000,              // 3秒タイムアウト（目標2秒 + マージン）
    retryAttempts: 2,           // 2回リトライ
    fallbackToLocal: true,      // API障害時はローカルチェックにフォールバック
    cacheEnabled: true,         // キャッシュ有効
    cacheDuration: 5 * 60 * 1000  // 5分間キャッシュ
  };

  private cache: Map<string, CacheEntry> = new Map();
  private stats: LLMModerationStats = {
    totalRequests: 0,
    totalViolations: 0,
    averageProcessingTime: 0,
    apiSuccessRate: 100,
    violationsByType: {} as Record<LLMViolationType, number>,
    cacheHitRate: 0
  };

  private successfulRequests = 0;
  private failedRequests = 0;
  private cacheHits = 0;
  private processingTimes: number[] = [];

  private constructor() {
    // 環境変数から設定を読み込み
    this.loadConfigFromEnv();

    // キャッシュクリーンアップタスク（10分ごと）
    setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
  }

  static getInstance(): LLMModerationService {
    if (!LLMModerationService.instance) {
      LLMModerationService.instance = new LLMModerationService();
    }
    return LLMModerationService.instance;
  }

  /**
   * 環境変数から設定を読み込み
   */
  private loadConfigFromEnv(): void {
    if (process.env.REACT_APP_LLM_TIMEOUT) {
      this.config.timeout = parseInt(process.env.REACT_APP_LLM_TIMEOUT);
    }
    if (process.env.REACT_APP_LLM_RETRY_ATTEMPTS) {
      this.config.retryAttempts = parseInt(process.env.REACT_APP_LLM_RETRY_ATTEMPTS);
    }
    if (process.env.REACT_APP_LLM_CACHE_DURATION) {
      this.config.cacheDuration = parseInt(process.env.REACT_APP_LLM_CACHE_DURATION);
    }
  }

  /**
   * LLM APIでコンテンツをチェック
   * @param request モデレーションリクエスト
   * @returns モデレーション結果（Promise）
   */
  public async moderateContent(
    request: LLMModerationRequest
  ): Promise<LLMModerationResult | null> {
    this.stats.totalRequests++;

    // キャッシュチェック
    if (this.config.cacheEnabled) {
      const cached = this.getCachedResult(request.content);
      if (cached) {
        this.cacheHits++;
        this.updateCacheHitRate();
        console.log('✅ LLMキャッシュヒット:', request.content.slice(0, 30));
        return cached;
      }
    }

    // API呼び出し（リトライ付き）
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = await this.callLLMAPI(request);

        // 成功時の処理
        const processingTime = Date.now() - startTime;
        this.processingTimes.push(processingTime);
        this.successfulRequests++;
        this.updateStats(result);
        this.updateSuccessRate();

        // キャッシュに保存
        if (this.config.cacheEnabled) {
          this.cacheResult(request.content, result);
        }

        console.log(`✅ LLM API成功 (${processingTime}ms):`, {
          allowed: result.allowed,
          severity: result.severity,
          violations: result.violations.length
        });

        return result;

      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ LLM APIエラー (試行 ${attempt + 1}/${this.config.retryAttempts + 1}):`, error);

        // 最後の試行でない場合は待機してリトライ
        if (attempt < this.config.retryAttempts) {
          await this.delay(500 * (attempt + 1)); // 指数バックオフ
        }
      }
    }

    // 全試行失敗
    this.failedRequests++;
    this.updateSuccessRate();
    console.error('❌ LLM API完全失敗:', lastError);

    // フォールバック設定に応じてnullを返す
    if (this.config.fallbackToLocal) {
      console.log('🔄 ローカルチェックにフォールバック');
      return null;
    }

    throw lastError;
  }

  /**
   * LLM APIを呼び出し
   * @param request リクエスト
   * @returns レスポンス
   */
  private async callLLMAPI(
    request: LLMModerationRequest
  ): Promise<LLMModerationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          content: request.content,
          context: request.context || {},
          options: request.options || { checkSensitivity: 'medium', language: 'ja' }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: LLMAPIError = await response.json();
        throw new Error(`API Error: ${errorData.error.message}`);
      }

      const result: LLMModerationResult = await response.json();

      // タイムスタンプを設定
      result.metadata.timestamp = new Date();

      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`LLM API Timeout after ${this.config.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * キャッシュから結果を取得
   * @param content コンテンツ
   * @returns キャッシュされた結果（存在しない、または期限切れの場合はnull）
   */
  private getCachedResult(content: string): LLMModerationResult | null {
    const cacheKey = this.generateCacheKey(content);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    // キャッシュ期限切れ
    if (age > this.config.cacheDuration) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.result;
  }

  /**
   * 結果をキャッシュに保存
   * @param content コンテンツ
   * @param result 結果
   */
  private cacheResult(content: string, result: LLMModerationResult): void {
    const cacheKey = this.generateCacheKey(content);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * キャッシュキー生成
   * @param content コンテンツ
   * @returns キャッシュキー
   */
  private generateCacheKey(content: string): string {
    // シンプルなハッシュ関数（実運用ではcrypto.subtle.digestを使用推奨）
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return hash.toString(36);
  }

  /**
   * 古いキャッシュエントリをクリーンアップ
   */
  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.cacheDuration) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 LLMキャッシュクリーンアップ: ${keysToDelete.length}件削除`);
    }
  }

  /**
   * 統計情報を更新
   * @param result モデレーション結果
   */
  private updateStats(result: LLMModerationResult): void {
    // 違反数カウント
    if (result.violations.length > 0) {
      this.stats.totalViolations += result.violations.length;

      result.violations.forEach(violation => {
        this.stats.violationsByType[violation.type] =
          (this.stats.violationsByType[violation.type] || 0) + 1;
      });
    }

    // 平均処理時間を更新
    if (this.processingTimes.length > 0) {
      const sum = this.processingTimes.reduce((a, b) => a + b, 0);
      this.stats.averageProcessingTime = Math.round(sum / this.processingTimes.length);
    }
  }

  /**
   * API成功率を更新
   */
  private updateSuccessRate(): void {
    const totalAPIRequests = this.successfulRequests + this.failedRequests;
    if (totalAPIRequests > 0) {
      this.stats.apiSuccessRate = Math.round(
        (this.successfulRequests / totalAPIRequests) * 100
      );
    }
  }

  /**
   * キャッシュヒット率を更新
   */
  private updateCacheHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.cacheHitRate = Math.round(
        (this.cacheHits / this.stats.totalRequests) * 100
      );
    }
  }

  /**
   * 待機処理
   * @param ms ミリ秒
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 統計情報を取得
   * @returns 統計データ
   */
  public getStats(): LLMModerationStats {
    return { ...this.stats };
  }

  /**
   * 設定を取得
   * @returns 現在の設定
   */
  public getConfig(): LLMAPIConfig {
    return { ...this.config };
  }

  /**
   * 設定を更新
   * @param newConfig 新しい設定（部分的な更新可）
   */
  public updateConfig(newConfig: Partial<LLMAPIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 LLM API設定更新:', newConfig);
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.updateCacheHitRate();
    console.log('🗑️ LLMキャッシュクリア完了');
  }

  /**
   * 統計情報をリセット
   */
  public resetStats(): void {
    this.stats = {
      totalRequests: 0,
      totalViolations: 0,
      averageProcessingTime: 0,
      apiSuccessRate: 100,
      violationsByType: {} as Record<LLMViolationType, number>,
      cacheHitRate: 0
    };
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.cacheHits = 0;
    this.processingTimes = [];
    console.log('📊 LLM統計情報リセット完了');
  }

  /**
   * ヘルスチェック
   * @returns API接続状態
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    message: string;
  }> {
    const startTime = Date.now();

    try {
      const testRequest: LLMModerationRequest = {
        content: 'ヘルスチェックテスト',
        options: { checkSensitivity: 'low' }
      };

      await this.callLLMAPI(testRequest);

      const latency = Date.now() - startTime;

      return {
        status: latency < 2000 ? 'healthy' : 'degraded',
        latency,
        message: latency < 2000
          ? `正常 (${latency}ms)`
          : `遅延あり (${latency}ms)`
      };

    } catch (error) {
      return {
        status: 'down',
        latency: Date.now() - startTime,
        message: `接続不可: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  }
}
