import os from 'os';
import { prisma } from '../lib/prisma';
import type { SystemHealth } from '@prisma/client';

/**
 * システムヘルスサービス
 * システムの稼働状態を監視・記録する
 */
export class SystemHealthService {
  /**
   * システムヘルス情報を記録
   */
  async recordHealth(): Promise<SystemHealth> {
    const status = await this.checkSystemStatus();
    const metrics = await this.collectMetrics();

    return await prisma.systemHealth.create({
      data: {
        status,
        uptime: Math.floor(process.uptime()),
        serverStartedAt: new Date(Date.now() - process.uptime() * 1000),
        lastHealthCheck: new Date(),
        ...metrics,
      },
    });
  }

  /**
   * 最新のヘルス情報を取得
   */
  async getLatestHealth(): Promise<SystemHealth | null> {
    return await prisma.systemHealth.findFirst({
      orderBy: { lastHealthCheck: 'desc' },
    });
  }

  /**
   * サーバー稼働率を計算
   * @param period 期間（day, week, month）
   */
  async calculateUptime(period: 'day' | 'week' | 'month'): Promise<number> {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const healthRecords = await prisma.systemHealth.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (healthRecords.length === 0) return 100;

    const totalRecords = healthRecords.length;
    const healthyRecords = healthRecords.filter((r) => r.status === 'healthy').length;

    return (healthyRecords / totalRecords) * 100;
  }

  /**
   * システムステータスをチェック
   */
  private async checkSystemStatus(): Promise<'healthy' | 'warning' | 'critical'> {
    const errorRate = await this.calculateErrorRate();
    const memoryUsage = await this.getMemoryUsage();

    // Critical条件
    if (errorRate > 5 || memoryUsage > 90) {
      return 'critical';
    }

    // Warning条件
    if (errorRate > 1 || memoryUsage > 75) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * メトリクス収集
   */
  private async collectMetrics() {
    return {
      cpuUsage: await this.getCpuUsage(),
      memoryUsage: await this.getMemoryUsage(),
      diskUsage: 38.5, // TODO: 実装（OS依存のため外部ライブラリ推奨）
      apiResponseTime: 125.3, // TODO: 実装（APIログから計算）
      errorRate: await this.calculateErrorRate(),
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }

  /**
   * CPU使用率を取得
   */
  private async getCpuUsage(): Promise<number> {
    const cpus = os.cpus();
    const usage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0);
    return Math.round((usage / cpus.length) * 10) / 10;
  }

  /**
   * メモリ使用率を取得
   */
  private async getMemoryUsage(): Promise<number> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    return Math.round(((totalMemory - freeMemory) / totalMemory) * 1000) / 10;
  }

  /**
   * エラー率を計算
   */
  private async calculateErrorRate(): Promise<number> {
    // 過去1時間のエラー率を計算
    const oneHourAgo = new Date(Date.now() - 3600000);

    const totalLogs = await prisma.auditLog.count({
      where: { createdAt: { gte: oneHourAgo } },
    });

    if (totalLogs === 0) return 0;

    const errorLogs = await prisma.auditLog.count({
      where: {
        createdAt: { gte: oneHourAgo },
        action: { contains: 'ERROR' },
      },
    });

    return Math.round((errorLogs / totalLogs) * 1000) / 10;
  }

  /**
   * 古いヘルスデータをクリーンアップ
   * @param daysToKeep 保持日数（デフォルト: 30日）
   */
  async cleanupOldData(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.systemHealth.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}

// シングルトンインスタンス
export const systemHealthService = new SystemHealthService();
