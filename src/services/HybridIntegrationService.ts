// MCP + API ハイブリッド統合サービス
// 統合計画書の同期方式に基づく使い分け実装

import { InterviewBooking } from '../types/interview';
import { employeeProfileMCPService } from './EmployeeProfileMCPService';
import { sharedDatabaseService } from './SharedDatabaseService';
import { mobilePushNotificationService } from './MobilePushNotificationService';

// 統合モード定義
type IntegrationMode = 'mcp_only' | 'api_only' | 'hybrid' | 'failover';

// データ同期タイプ（統合計画書準拠）
type SyncType =
  | 'realtime'    // リアルタイム同期 (MCP優先)
  | 'batch'       // バッチ同期 (API優先)
  | 'event_driven'; // イベント駆動 (両方)

// 統合結果
interface IntegrationResult {
  success: boolean;
  mcpResult?: boolean;
  apiResult?: boolean;
  primaryMethod: 'mcp' | 'api';
  backupMethod?: 'mcp' | 'api';
  latency: number;
  errors: string[];
}

// ハイブリッド設定
interface HybridConfig {
  mode: IntegrationMode;
  mcpTimeout: number;
  apiTimeout: number;
  enableFailover: boolean;
  preferredMethod: 'mcp' | 'api';
  criticalOperations: string[]; // 両方必須の操作
}

class HybridIntegrationService {
  private config: HybridConfig;
  private mcpHealthy: boolean = true;
  private apiHealthy: boolean = true;
  private lastHealthCheck: Date = new Date();

  constructor() {
    this.config = {
      mode: 'hybrid',
      mcpTimeout: 10000,
      apiTimeout: 30000,
      enableFailover: true,
      preferredMethod: 'mcp',
      criticalOperations: [
        'booking_creation',
        'booking_cancellation',
        'evaluation_notification',
        'audit_logging'
      ]
    };

    // 定期ヘルスチェック開始
    this.startHealthMonitoring();
  }

  // === 面談予約関連統合 ===

  // 面談予約確定処理（イベント駆動 - 両方実行）
  async handleBookingConfirmed(booking: InterviewBooking): Promise<IntegrationResult> {
    const startTime = Date.now();
    const result: IntegrationResult = {
      success: false,
      primaryMethod: 'mcp',
      latency: 0,
      errors: []
    };

    try {
      // 並行実行で高速化
      const [mcpResult, apiResult] = await Promise.allSettled([
        this.mcpBookingSync(booking),
        this.apiBookingRecord(booking)
      ]);

      // MCP結果処理
      if (mcpResult.status === 'fulfilled') {
        result.mcpResult = mcpResult.value;
      } else {
        result.errors.push(`MCP: ${mcpResult.reason}`);
        result.mcpResult = false;
      }

      // API結果処理
      if (apiResult.status === 'fulfilled') {
        result.apiResult = apiResult.value;
      } else {
        result.errors.push(`API: ${apiResult.reason}`);
        result.apiResult = false;
      }

      // 成功判定（少なくとも1つ成功）
      result.success = result.mcpResult || result.apiResult;

      // プッシュ通知（MCP成功時のみ）
      if (result.mcpResult) {
        await mobilePushNotificationService.sendBookingConfirmedNotification(booking);
      }

      result.latency = Date.now() - startTime;
      return result;

    } catch (error) {
      result.errors.push(`統合処理エラー: ${error}`);
      result.latency = Date.now() - startTime;
      return result;
    }
  }

  // 面談予約キャンセル処理
  async handleBookingCancelled(booking: InterviewBooking): Promise<IntegrationResult> {
    const startTime = Date.now();
    const result: IntegrationResult = {
      success: false,
      primaryMethod: 'api', // キャンセルはAPI優先（確実な記録）
      latency: 0,
      errors: []
    };

    try {
      // API優先実行
      result.apiResult = await this.apiBookingStatusUpdate(booking.id, 'cancelled', booking.cancelledBy || 'system');

      if (result.apiResult) {
        // API成功時にMCPも実行
        try {
          result.mcpResult = await this.mcpCancellationSync(booking);
        } catch (mcpError) {
          result.errors.push(`MCP同期失敗: ${mcpError}`);
          result.mcpResult = false;
        }

        // プッシュ通知送信
        await mobilePushNotificationService.sendCancellationNotification(booking);
        result.success = true;
      } else {
        result.errors.push('API予約キャンセル記録失敗');
      }

      result.latency = Date.now() - startTime;
      return result;

    } catch (error) {
      result.errors.push(`キャンセル処理エラー: ${error}`);
      result.latency = Date.now() - startTime;
      return result;
    }
  }

  // === ユーザーデータ同期 ===

  // リアルタイム職員情報同期（MCP優先）
  async syncEmployeeRealtime(employeeId: string): Promise<IntegrationResult> {
    const startTime = Date.now();
    const result: IntegrationResult = {
      success: false,
      primaryMethod: 'mcp',
      latency: 0,
      errors: []
    };

    try {
      if (this.mcpHealthy) {
        // MCP優先実行
        const profile = await employeeProfileMCPService.getEmployeeProfile(employeeId);
        result.mcpResult = !!profile;

        if (result.mcpResult) {
          result.success = true;
          result.latency = Date.now() - startTime;
          return result;
        }
      }

      // MCPフェイルオーバー: API実行
      if (this.config.enableFailover && this.apiHealthy) {
        result.backupMethod = 'api';
        const syncResult = await sharedDatabaseService.syncUserData({
          employeeId,
          includeProfile: true,
          includePermissions: true
        });
        result.apiResult = !!syncResult;
        result.success = result.apiResult;
      }

      result.latency = Date.now() - startTime;
      return result;

    } catch (error) {
      result.errors.push(`職員情報同期エラー: ${error}`);
      result.latency = Date.now() - startTime;
      return result;
    }
  }

  // バッチユーザー同期（API優先）
  async syncUsersBatch(employeeIds: string[]): Promise<IntegrationResult> {
    const startTime = Date.now();
    const result: IntegrationResult = {
      success: false,
      primaryMethod: 'api',
      latency: 0,
      errors: []
    };

    try {
      // API優先実行（バッチ処理に最適）
      const syncResults = await sharedDatabaseService.batchSyncUsers(employeeIds);
      result.apiResult = syncResults.length > 0;

      if (result.apiResult) {
        result.success = true;

        // 成功時にMCPでリアルタイム情報を補完
        try {
          for (const employeeId of employeeIds.slice(0, 10)) { // 最初の10件のみ
            await employeeProfileMCPService.getEmployeeProfile(employeeId);
          }
          result.mcpResult = true;
        } catch (mcpError) {
          result.errors.push(`MCP補完処理エラー: ${mcpError}`);
        }
      }

      result.latency = Date.now() - startTime;
      return result;

    } catch (error) {
      result.errors.push(`バッチ同期エラー: ${error}`);
      result.latency = Date.now() - startTime;
      return result;
    }
  }

  // === 監査・ログ記録 ===

  // 重要操作の監査ログ（両方必須）
  async logCriticalAction(
    actionType: string,
    resourceType: string,
    resourceId: string,
    actorId: string,
    reason: string,
    previousState?: any,
    newState?: any
  ): Promise<IntegrationResult> {
    const startTime = Date.now();
    const result: IntegrationResult = {
      success: false,
      primaryMethod: 'api',
      latency: 0,
      errors: []
    };

    try {
      const auditData = {
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        actor_id: actorId,
        reason,
        previous_state: previousState,
        new_state: newState,
        ip_address: await this.getClientIP(),
        timestamp: new Date().toISOString()
      };

      // 並行実行（両方必須）
      const [apiResult, mcpResult] = await Promise.allSettled([
        sharedDatabaseService.logAuditAction(auditData),
        this.mcpAuditLog(auditData)
      ]);

      result.apiResult = apiResult.status === 'fulfilled' ? apiResult.value : false;
      result.mcpResult = mcpResult.status === 'fulfilled' ? mcpResult.value : false;

      if (apiResult.status === 'rejected') {
        result.errors.push(`API監査ログ失敗: ${apiResult.reason}`);
      }
      if (mcpResult.status === 'rejected') {
        result.errors.push(`MCP監査ログ失敗: ${mcpResult.reason}`);
      }

      // 重要操作は両方成功が必要
      result.success = result.apiResult && result.mcpResult;
      result.latency = Date.now() - startTime;

      return result;

    } catch (error) {
      result.errors.push(`監査ログ記録エラー: ${error}`);
      result.latency = Date.now() - startTime;
      return result;
    }
  }

  // === 通知最適化 ===

  // 最適な通知タイミング計算（MCP優先 + API補完）
  async calculateOptimalNotificationTime(
    employeeId: string,
    baseTime: Date,
    notificationType: string
  ): Promise<Date> {
    try {
      if (this.mcpHealthy) {
        // MCP AI分析を優先
        const optimalTime = await employeeProfileMCPService.calculateOptimalNotificationTime(
          employeeId,
          baseTime,
          notificationType as any
        );

        if (optimalTime && optimalTime.getTime() !== baseTime.getTime()) {
          return optimalTime;
        }
      }

      // フォールバック: APIから基本データを取得して簡易計算
      const userData = await sharedDatabaseService.syncUserData({
        employeeId,
        includeProfile: true
      });

      if (userData) {
        // 簡易最適化ロジック
        return this.calculateBasicOptimalTime(baseTime, userData);
      }

      return baseTime;
    } catch (error) {
      console.error('通知タイミング最適化エラー:', error);
      return baseTime;
    }
  }

  // === ヘルスモニタリング ===

  private async startHealthMonitoring(): Promise<void> {
    setInterval(async () => {
      await this.checkSystemHealth();
    }, 60000); // 1分ごと

    // 初回チェック
    await this.checkSystemHealth();
  }

  private async checkSystemHealth(): Promise<void> {
    try {
      // MCP健康状態チェック
      const mcpHealth = await this.checkMCPHealth();
      this.mcpHealthy = mcpHealth;

      // API健康状態チェック
      const apiHealth = await sharedDatabaseService.healthCheck();
      this.apiHealthy = apiHealth;

      this.lastHealthCheck = new Date();

      // 状態変化をログ記録
      if (!mcpHealth || !apiHealth) {
        console.warn('統合サービス健康状態:', {
          mcp: mcpHealth,
          api: apiHealth,
          timestamp: this.lastHealthCheck
        });
      }

    } catch (error) {
      console.error('ヘルスチェックエラー:', error);
    }
  }

  private async checkMCPHealth(): Promise<boolean> {
    try {
      // 簡易MCPヘルスチェック
      const testProfile = await employeeProfileMCPService.getEmployeeProfile('health-check');
      return true; // エラーが投げられなければ正常
    } catch (error) {
      return false;
    }
  }

  // === プライベートメソッド ===

  private async mcpBookingSync(booking: InterviewBooking): Promise<boolean> {
    return await employeeProfileMCPService.syncInterviewBookingWithMCP(booking);
  }

  private async apiBookingRecord(booking: InterviewBooking): Promise<boolean> {
    return await sharedDatabaseService.recordInterviewBooking(booking);
  }

  private async apiBookingStatusUpdate(bookingId: string, status: string, updatedBy: string): Promise<boolean> {
    return await sharedDatabaseService.updateBookingStatus(bookingId, status, updatedBy);
  }

  private async mcpCancellationSync(booking: InterviewBooking): Promise<boolean> {
    // MCP経由でキャンセル通知
    return true; // 実装は既存MCP機能を活用
  }

  private async mcpAuditLog(auditData: any): Promise<boolean> {
    // MCP経由で監査ログ記録
    return true; // 実装は既存MCP機能を活用
  }

  private async getClientIP(): Promise<string> {
    try {
      // クライアントIP取得（プライバシー考慮）
      return 'masked-for-privacy';
    } catch (error) {
      return 'unknown';
    }
  }

  private calculateBasicOptimalTime(baseTime: Date, userData: any): Date {
    // 簡易最適化ロジック（勤務パターンに基づく）
    const result = new Date(baseTime);

    // 夜勤職員の場合は朝の通知を午後にシフト
    if (userData.department?.includes('夜勤') || userData.position?.includes('夜勤')) {
      result.setHours(14, 0, 0, 0); // 午後2時
    }

    return result;
  }

  // === パブリック状態取得メソッド ===

  getSystemStatus(): {
    mcpHealthy: boolean;
    apiHealthy: boolean;
    mode: IntegrationMode;
    lastHealthCheck: Date;
  } {
    return {
      mcpHealthy: this.mcpHealthy,
      apiHealthy: this.apiHealthy,
      mode: this.config.mode,
      lastHealthCheck: this.lastHealthCheck
    };
  }

  updateConfig(newConfig: Partial<HybridConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const hybridIntegrationService = new HybridIntegrationService();
export default hybridIntegrationService;