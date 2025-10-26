/**
 * Performance Monitoring Utilities
 * ProjectListPage Phase 3実装
 *
 * サービスやAPIのパフォーマンスを測定・記録するユーティリティ
 */

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  totalDuration: number;
  metrics: PerformanceMetric[];
  summary: {
    slowestOperation: string;
    fastestOperation: string;
    averageDuration: number;
  };
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private enabled: boolean = true;

  /**
   * パフォーマンス監視を有効化/無効化
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 計測を開始
   *
   * @param name - 計測対象の名前
   * @param metadata - 追加情報
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  /**
   * 計測を終了
   *
   * @param name - 計測対象の名前
   * @returns 計測時間（ミリ秒）
   */
  end(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`[PerformanceMonitor] No metric found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    this.completedMetrics.push(metric);
    this.metrics.delete(name);

    return duration;
  }

  /**
   * 非同期関数の実行時間を計測
   *
   * @param name - 計測対象の名前
   * @param fn - 実行する関数
   * @param metadata - 追加情報
   * @returns 関数の実行結果
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return await fn();
    }

    this.start(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * 同期関数の実行時間を計測
   *
   * @param name - 計測対象の名前
   * @param fn - 実行する関数
   * @param metadata - 追加情報
   * @returns 関数の実行結果
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    if (!this.enabled) {
      return fn();
    }

    this.start(name, metadata);
    try {
      const result = fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * すべての計測結果をクリア
   */
  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }

  /**
   * 完了した計測結果を取得
   *
   * @returns 計測結果の配列
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }

  /**
   * パフォーマンスレポートを生成
   *
   * @returns パフォーマンスレポート
   */
  getReport(): PerformanceReport {
    const metrics = this.getMetrics();

    if (metrics.length === 0) {
      return {
        totalDuration: 0,
        metrics: [],
        summary: {
          slowestOperation: 'N/A',
          fastestOperation: 'N/A',
          averageDuration: 0
        }
      };
    }

    const totalDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalDuration / metrics.length;

    const sortedByDuration = [...metrics].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    const slowest = sortedByDuration[0];
    const fastest = sortedByDuration[sortedByDuration.length - 1];

    return {
      totalDuration,
      metrics,
      summary: {
        slowestOperation: `${slowest.name} (${slowest.duration?.toFixed(2)}ms)`,
        fastestOperation: `${fastest.name} (${fastest.duration?.toFixed(2)}ms)`,
        averageDuration: parseFloat(averageDuration.toFixed(2))
      }
    };
  }

  /**
   * パフォーマンスレポートをコンソールに出力
   */
  logReport(): void {
    const report = this.getReport();

    console.log('\n=== Performance Report ===');
    console.log(`Total Duration: ${report.totalDuration.toFixed(2)}ms`);
    console.log(`Average Duration: ${report.summary.averageDuration}ms`);
    console.log(`Slowest: ${report.summary.slowestOperation}`);
    console.log(`Fastest: ${report.summary.fastestOperation}`);
    console.log('\nDetailed Metrics:');

    report.metrics.forEach((metric, index) => {
      console.log(`  ${index + 1}. ${metric.name}: ${metric.duration?.toFixed(2)}ms`);
      if (metric.metadata) {
        console.log(`     Metadata:`, metric.metadata);
      }
    });

    console.log('========================\n');
  }

  /**
   * 特定の計測結果を取得
   *
   * @param name - 計測対象の名前
   * @returns 計測結果（見つからない場合はundefined）
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.completedMetrics.find(m => m.name === name);
  }

  /**
   * 計測中の項目数を取得
   *
   * @returns 計測中の項目数
   */
  getActiveCount(): number {
    return this.metrics.size;
  }

  /**
   * 完了した計測の数を取得
   *
   * @returns 完了した計測の数
   */
  getCompletedCount(): number {
    return this.completedMetrics.length;
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor();

/**
 * デコレーター風のヘルパー関数
 */
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    return await performanceMonitor.measure(name, () => fn(...args));
  }) as T;
}

/**
 * キャッシュヒット率を計算するヘルパー
 */
export class CacheMetrics {
  private hits: number = 0;
  private misses: number = 0;

  recordHit(): void {
    this.hits++;
  }

  recordMiss(): void {
    this.misses++;
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return (this.hits / total) * 100;
  }

  getStats(): {
    hits: number;
    misses: number;
    total: number;
    hitRate: number;
  } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: this.getHitRate()
    };
  }

  reset(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

/**
 * クエリパフォーマンス測定ヘルパー
 */
export async function measureQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const result = await queryFn();
  const duration = performance.now() - startTime;

  if (duration > 100) {
    console.warn(`[Performance] Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

export default performanceMonitor;
