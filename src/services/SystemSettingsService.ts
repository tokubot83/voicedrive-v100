// システム設定サービス
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

interface SystemSetting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
  updatedAt?: string;
}

interface SettingsData {
  general: Record<string, SystemSetting>;
  security: Record<string, SystemSetting>;
  notification: Record<string, SystemSetting>;
  database: Record<string, SystemSetting>;
  api: Record<string, SystemSetting>;
  advanced: Record<string, SystemSetting>;
}

interface SettingsMetadata {
  lastUpdated: string;
  updatedBy: string;
  version: number;
}

export class SystemSettingsService {
  /**
   * システム設定を取得
   */
  static async getSettings(category?: string): Promise<{
    success: boolean;
    data?: SettingsData;
    metadata?: SettingsMetadata;
    error?: string;
  }> {
    try {
      // データベースから設定を取得
      const configs = await prisma.systemConfig.findMany({
        where: category ? { category } : {},
        orderBy: { configKey: 'asc' },
        include: {
          updatedByUser: {
            select: {
              id: true,
              employeeId: true,
              name: true
            }
          }
        }
      });

      // カテゴリごとに整理
      const settings: SettingsData = {
        general: {},
        security: {},
        notification: {},
        database: {},
        api: {},
        advanced: {}
      };

      let lastUpdated = new Date(0);
      let lastUpdatedBy = 'system';
      let version = 0;

      for (const config of configs) {
        const category = config.category as keyof SettingsData;
        if (!settings[category]) continue;

        const value = config.configValue as any;
        const settingValue = typeof value === 'object' && value !== null && 'value' in value
          ? value.value
          : value;

        settings[category][config.configKey] = {
          key: config.configKey,
          value: settingValue,
          type: this.inferType(settingValue),
          description: config.description || '',
          updatedAt: config.updatedAt.toISOString()
        };

        if (config.updatedAt > lastUpdated) {
          lastUpdated = config.updatedAt;
          lastUpdatedBy = config.updatedBy;
        }
        version++;
      }

      // デフォルト設定でマージ（DBに存在しない設定をデフォルト値で補完）
      const defaultSettings = this.getDefaultSettings();
      for (const [cat, catSettings] of Object.entries(defaultSettings)) {
        const category = cat as keyof SettingsData;
        for (const [key, setting] of Object.entries(catSettings)) {
          if (!settings[category][key]) {
            settings[category][key] = setting as SystemSetting;
          }
        }
      }

      return {
        success: true,
        data: settings,
        metadata: {
          lastUpdated: lastUpdated.toISOString(),
          updatedBy: lastUpdatedBy,
          version
        }
      };
    } catch (error) {
      console.error('[SystemSettingsService] 設定取得エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '設定の取得に失敗しました'
      };
    }
  }

  /**
   * システム設定を更新
   */
  static async updateSettings(
    settings: Record<string, Record<string, any>>,
    userId: string
  ): Promise<{
    success: boolean;
    data?: {
      updatedCount: number;
      updatedSettings: string[];
      timestamp: string;
    };
    errors?: Array<{ key: string; error: string }>;
    error?: string;
  }> {
    try {
      const updatedSettings: string[] = [];
      const errors: Array<{ key: string; error: string }> = [];

      for (const [category, categorySettings] of Object.entries(settings)) {
        for (const [key, value] of Object.entries(categorySettings)) {
          try {
            // 設定を更新または作成
            await prisma.systemConfig.upsert({
              where: {
                configKey: key
              },
              update: {
                configValue: value,
                category,
                updatedBy: userId,
                updatedAt: new Date()
              },
              create: {
                configKey: key,
                configValue: value,
                category,
                description: `${category} - ${key}`,
                isActive: true,
                updatedBy: userId
              }
            });

            updatedSettings.push(key);
          } catch (error) {
            console.error(`[SystemSettingsService] 設定更新エラー (${key}):`, error);
            errors.push({
              key,
              error: error instanceof Error ? error.message : '更新に失敗しました'
            });
          }
        }
      }

      return {
        success: errors.length === 0,
        data: {
          updatedCount: updatedSettings.length,
          updatedSettings,
          timestamp: new Date().toISOString()
        },
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('[SystemSettingsService] 設定更新エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '設定の更新に失敗しました'
      };
    }
  }

  /**
   * データベースバックアップを作成
   */
  static async createDatabaseBackup(userId: string): Promise<{
    success: boolean;
    data?: {
      backupId: string;
      fileName: string;
      size: number;
      timestamp: string;
      status: 'completed' | 'failed';
    };
    error?: string;
  }> {
    try {
      // TODO: 実際のバックアップ処理を実装
      // 現在はシミュレーション
      const backupId = `backup-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const fileName = `voicedrive-backup-${new Date().toISOString().split('T')[0]}.sql`;

      // シミュレーション: バックアップ作成
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        data: {
          backupId,
          fileName,
          size: 1024 * 1024 * 50, // 50MB（仮）
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      };
    } catch (error) {
      console.error('[SystemSettingsService] バックアップ作成エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'バックアップの作成に失敗しました'
      };
    }
  }

  /**
   * データベースを復元
   */
  static async restoreDatabaseBackup(
    backupId: string,
    userId: string,
    confirmationToken: string
  ): Promise<{
    success: boolean;
    data?: {
      restoreId: string;
      backupId: string;
      timestamp: string;
      status: 'completed' | 'failed';
      recordsRestored: number;
    };
    error?: string;
  }> {
    try {
      // TODO: 確認トークン検証
      // TODO: 実際の復元処理を実装
      // 現在はシミュレーション

      const restoreId = `restore-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      // シミュレーション: データベース復元
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        data: {
          restoreId,
          backupId,
          timestamp: new Date().toISOString(),
          status: 'completed',
          recordsRestored: 10000 // 仮
        }
      };
    } catch (error) {
      console.error('[SystemSettingsService] データベース復元エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'データベースの復元に失敗しました'
      };
    }
  }

  /**
   * データベースを最適化
   */
  static async optimizeDatabase(
    operations: string[],
    userId: string
  ): Promise<{
    success: boolean;
    data?: {
      optimizationId: string;
      operations: Array<{
        operation: string;
        status: 'completed' | 'failed';
        duration: number;
      }>;
      timestamp: string;
    };
    error?: string;
  }> {
    try {
      const optimizationId = `optimize-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const results = [];

      for (const operation of operations) {
        const startTime = Date.now();

        try {
          // TODO: 実際の最適化処理を実装
          // PostgreSQL: VACUUM, ANALYZE, REINDEX
          // 現在はシミュレーション
          await new Promise(resolve => setTimeout(resolve, 500));

          results.push({
            operation,
            status: 'completed' as const,
            duration: Date.now() - startTime
          });
        } catch (error) {
          results.push({
            operation,
            status: 'failed' as const,
            duration: Date.now() - startTime
          });
        }
      }

      return {
        success: true,
        data: {
          optimizationId,
          operations: results,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[SystemSettingsService] データベース最適化エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'データベースの最適化に失敗しました'
      };
    }
  }

  /**
   * APIキーを再生成
   */
  static async regenerateApiKey(
    userId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    data?: {
      newApiKey: string;
      expiresAt: string;
      generatedAt: string;
    };
    error?: string;
  }> {
    try {
      // 新しいAPIキーを生成
      const newApiKey = `vd_${crypto.randomBytes(32).toString('hex')}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // 90日後に期限切れ

      // TODO: APIキーをデータベースに保存
      // 現在はシミュレーション

      return {
        success: true,
        data: {
          newApiKey,
          expiresAt: expiresAt.toISOString(),
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[SystemSettingsService] APIキー再生成エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'APIキーの再生成に失敗しました'
      };
    }
  }

  /**
   * キャッシュをクリア
   */
  static async clearCache(
    cacheTypes: string[],
    userId: string
  ): Promise<{
    success: boolean;
    data?: {
      clearedCaches: string[];
      timestamp: string;
    };
    error?: string;
  }> {
    try {
      const clearedCaches: string[] = [];

      for (const cacheType of cacheTypes) {
        // TODO: 実際のキャッシュクリア処理を実装
        // Redis, Memory, CDN等
        // 現在はシミュレーション
        clearedCaches.push(cacheType);
      }

      return {
        success: true,
        data: {
          clearedCaches,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[SystemSettingsService] キャッシュクリアエラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'キャッシュのクリアに失敗しました'
      };
    }
  }

  /**
   * ログをエクスポート
   */
  static async exportLogs(params: {
    logTypes: string[];
    startDate: Date;
    endDate: Date;
    format: 'json' | 'csv';
    userId: string;
  }): Promise<{
    success: boolean;
    data?: {
      exportId: string;
      fileName: string;
      downloadUrl: string;
      size: number;
      recordCount: number;
      expiresAt: string;
    };
    error?: string;
  }> {
    try {
      const exportId = `export-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const fileName = `voicedrive-logs-${params.startDate.toISOString().split('T')[0]}-to-${params.endDate.toISOString().split('T')[0]}.${params.format}`;

      // TODO: 実際のログエクスポート処理を実装
      // AuditLog, ErrorLog等をエクスポート
      // 現在はシミュレーション

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24時間後に期限切れ

      return {
        success: true,
        data: {
          exportId,
          fileName,
          downloadUrl: `/api/system/logs/download/${exportId}`,
          size: 1024 * 1024 * 5, // 5MB（仮）
          recordCount: 1000, // 仮
          expiresAt: expiresAt.toISOString()
        }
      };
    } catch (error) {
      console.error('[SystemSettingsService] ログエクスポートエラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ログのエクスポートに失敗しました'
      };
    }
  }

  /**
   * デフォルト設定を取得
   */
  private static getDefaultSettings(): SettingsData {
    return {
      general: {
        siteName: { key: 'siteName', value: 'VoiceDrive', type: 'string', description: 'システム名称' },
        maintenanceMode: { key: 'maintenanceMode', value: false, type: 'boolean', description: 'メンテナンスモード' },
        defaultLanguage: { key: 'defaultLanguage', value: 'ja', type: 'select', options: ['ja', 'en', 'zh'], description: 'デフォルト言語' },
        sessionTimeout: { key: 'sessionTimeout', value: 30, type: 'number', description: 'セッションタイムアウト（分）' }
      },
      security: {
        passwordMinLength: { key: 'passwordMinLength', value: 8, type: 'number', description: 'パスワード最小文字数' },
        passwordRequireNumbers: { key: 'passwordRequireNumbers', value: true, type: 'boolean', description: '数字必須' },
        passwordRequireSymbols: { key: 'passwordRequireSymbols', value: true, type: 'boolean', description: '記号必須' },
        twoFactorAuth: { key: 'twoFactorAuth', value: false, type: 'boolean', description: '2要素認証有効化' },
        maxLoginAttempts: { key: 'maxLoginAttempts', value: 5, type: 'number', description: 'ログイン試行回数上限' }
      },
      notification: {
        emailNotifications: { key: 'emailNotifications', value: true, type: 'boolean', description: 'メール通知' },
        systemNotifications: { key: 'systemNotifications', value: true, type: 'boolean', description: 'システム通知' },
        notificationFrequency: { key: 'notificationFrequency', value: 'realtime', type: 'select', options: ['realtime', 'hourly', 'daily'], description: '通知頻度' }
      },
      database: {
        autoBackup: { key: 'autoBackup', value: true, type: 'boolean', description: '自動バックアップ' },
        backupFrequency: { key: 'backupFrequency', value: 'daily', type: 'select', options: ['daily', 'weekly', 'monthly'], description: 'バックアップ頻度' },
        backupRetentionDays: { key: 'backupRetentionDays', value: 30, type: 'number', description: 'バックアップ保持日数' },
        dataRetentionDays: { key: 'dataRetentionDays', value: 365, type: 'number', description: 'データ保持日数' },
        compressionEnabled: { key: 'compressionEnabled', value: true, type: 'boolean', description: 'データ圧縮有効化' }
      },
      api: {
        apiEnabled: { key: 'apiEnabled', value: true, type: 'boolean', description: 'API有効化' },
        apiRateLimit: { key: 'apiRateLimit', value: 100, type: 'number', description: 'APIレート制限（リクエスト/分）' },
        apiKeyRotationDays: { key: 'apiKeyRotationDays', value: 90, type: 'number', description: 'APIキー更新間隔（日）' },
        apiLogging: { key: 'apiLogging', value: true, type: 'boolean', description: 'APIログ記録' },
        corsEnabled: { key: 'corsEnabled', value: false, type: 'boolean', description: 'CORS有効化' }
      },
      advanced: {
        logLevel: { key: 'logLevel', value: 'info', type: 'select', options: ['error', 'warn', 'info', 'debug'], description: 'ログレベル' },
        cacheEnabled: { key: 'cacheEnabled', value: true, type: 'boolean', description: 'キャッシュ有効化' },
        cacheTTL: { key: 'cacheTTL', value: 3600, type: 'number', description: 'キャッシュTTL（秒）' },
        debugMode: { key: 'debugMode', value: false, type: 'boolean', description: 'デバッグモード' },
        performanceMonitoring: { key: 'performanceMonitoring', value: true, type: 'boolean', description: 'パフォーマンス監視' }
      }
    };
  }

  /**
   * 値の型を推測
   */
  private static inferType(value: any): 'string' | 'number' | 'boolean' | 'select' {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    return 'string';
  }
}
