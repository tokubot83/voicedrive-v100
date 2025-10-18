/**
 * 退職処理・緊急アカウント停止 Webhook送信サービス
 *
 * VoiceDrive → 医療システムへの退職関連イベント通知
 * HMAC-SHA256署名付きリクエストで安全に通信
 */

import { generateWebhookHeaders } from './webhookVerifier';

/**
 * Webhookペイロードの基本型
 */
interface BaseWebhookPayload {
  event: string;
  timestamp: string;
  source: 'voicedrive';
  data: any;
}

/**
 * 緊急アカウント停止通知データ
 */
interface EmergencyDeactivationData {
  deactivationId: string;
  targetUserId: string;
  targetEmployeeId?: string;
  targetUserName?: string;
  executedBy: string;
  executorEmployeeId?: string;
  executorName?: string;
  executorLevel: number;
  reason: string;
  timestamp: string;
  isEmergency: boolean;
}

/**
 * 退職処理通知データ
 */
interface RetirementProcessData {
  processId: string;
  targetUserId: string;
  targetEmployeeId?: string;
  targetUserName?: string;
  initiatedBy: string;
  initiatorEmployeeId?: string;
  initiatorName?: string;
  initiatorLevel: number;
  currentStep: number;
  totalSteps: number;
  preserveAnonymousContent: boolean;
  anonymizationLevel: string;
  timestamp: string;
}

/**
 * Webhook送信結果
 */
interface WebhookSendResult {
  success: boolean;
  statusCode?: number;
  message: string;
  retryable: boolean;
}

/**
 * 退職処理Webhookサービス
 */
export class RetirementWebhookService {
  private static instance: RetirementWebhookService;
  private webhookUrl: string;
  private webhookSecret: string;
  private timeout: number = 10000; // 10秒タイムアウト
  private maxRetries: number = 3;

  private constructor() {
    // 環境変数から医療システムのWebhook URLとシークレットを取得
    this.webhookUrl = process.env.MEDICAL_SYSTEM_WEBHOOK_URL ||
                      import.meta.env?.VITE_MEDICAL_WEBHOOK_URL ||
                      'http://localhost:3000/api/webhooks/voicedrive';

    this.webhookSecret = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET ||
                         import.meta.env?.VITE_MEDICAL_WEBHOOK_SECRET ||
                         'default-development-secret-key';
  }

  static getInstance(): RetirementWebhookService {
    if (!this.instance) {
      this.instance = new RetirementWebhookService();
    }
    return this.instance;
  }

  /**
   * 緊急アカウント停止通知を送信
   */
  async notifyEmergencyDeactivation(
    data: EmergencyDeactivationData
  ): Promise<WebhookSendResult> {
    const payload: BaseWebhookPayload = {
      event: 'account.emergency_deactivation',
      timestamp: new Date().toISOString(),
      source: 'voicedrive',
      data
    };

    return this.sendWebhookWithRetry(payload, '/emergency-deactivation');
  }

  /**
   * 退職処理開始通知を送信
   */
  async notifyRetirementProcessStarted(
    data: RetirementProcessData
  ): Promise<WebhookSendResult> {
    const payload: BaseWebhookPayload = {
      event: 'retirement.process_started',
      timestamp: new Date().toISOString(),
      source: 'voicedrive',
      data
    };

    return this.sendWebhookWithRetry(payload, '/retirement-process');
  }

  /**
   * 退職処理ステップ完了通知を送信
   */
  async notifyRetirementStepCompleted(
    processId: string,
    step: number,
    stepName: string
  ): Promise<WebhookSendResult> {
    const payload: BaseWebhookPayload = {
      event: 'retirement.step_completed',
      timestamp: new Date().toISOString(),
      source: 'voicedrive',
      data: {
        processId,
        step,
        stepName,
        completedAt: new Date().toISOString()
      }
    };

    return this.sendWebhookWithRetry(payload, '/retirement-process');
  }

  /**
   * 退職処理完了通知を送信
   */
  async notifyRetirementProcessCompleted(
    processId: string,
    targetEmployeeId?: string
  ): Promise<WebhookSendResult> {
    const payload: BaseWebhookPayload = {
      event: 'retirement.process_completed',
      timestamp: new Date().toISOString(),
      source: 'voicedrive',
      data: {
        processId,
        targetEmployeeId,
        completedAt: new Date().toISOString()
      }
    };

    return this.sendWebhookWithRetry(payload, '/retirement-process');
  }

  /**
   * 医療システムヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    const payload: BaseWebhookPayload = {
      event: 'system.health_check',
      timestamp: new Date().toISOString(),
      source: 'voicedrive',
      data: {
        version: '2.0.0',
        status: 'active'
      }
    };

    const result = await this.sendWebhook(payload, '/health');
    return result.success;
  }

  /**
   * リトライ機能付きWebhook送信
   */
  private async sendWebhookWithRetry(
    payload: BaseWebhookPayload,
    endpoint: string
  ): Promise<WebhookSendResult> {
    let lastResult: WebhookSendResult | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      lastResult = await this.sendWebhook(payload, endpoint);

      if (lastResult.success) {
        console.log(`[Webhook送信成功] ${payload.event} (試行: ${attempt}/${this.maxRetries})`);
        return lastResult;
      }

      // リトライ可能なエラーでない場合は即座に終了
      if (!lastResult.retryable) {
        console.error(`[Webhook送信失敗 - リトライ不可] ${payload.event}`);
        return lastResult;
      }

      // 最後の試行でない場合は待機
      if (attempt < this.maxRetries) {
        const waitTime = Math.pow(2, attempt - 1) * 1000; // 指数バックオフ: 1s, 2s, 4s
        console.warn(`[Webhookリトライ待機] ${payload.event} - ${waitTime}ms後に再試行 (${attempt}/${this.maxRetries})`);
        await this.sleep(waitTime);
      }
    }

    console.error(`[Webhook送信失敗 - 最大試行回数到達] ${payload.event}`);
    return lastResult || {
      success: false,
      message: 'Maximum retry attempts reached',
      retryable: false
    };
  }

  /**
   * Webhook送信の実装
   */
  private async sendWebhook(
    payload: BaseWebhookPayload,
    endpoint: string
  ): Promise<WebhookSendResult> {
    const url = `${this.webhookUrl}${endpoint}`;

    try {
      console.log(`[Webhook送信] ${payload.event} -> ${url}`);

      // HMAC-SHA256署名付きヘッダーを生成
      const headers = generateWebhookHeaders(payload, this.webhookSecret);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          message: 'Webhook sent successfully',
          retryable: false
        };
      }

      // ステータスコードによってリトライ可否を判定
      const retryable = this.isRetryableStatusCode(response.status);

      return {
        success: false,
        statusCode: response.status,
        message: `HTTP ${response.status}: ${response.statusText}`,
        retryable
      };

    } catch (error: any) {
      console.error(`[Webhook送信エラー] ${payload.event}`, error);

      // タイムアウトやネットワークエラーはリトライ可能
      const retryable = error.name === 'AbortError' ||
                       error.message?.includes('fetch') ||
                       error.message?.includes('network');

      return {
        success: false,
        message: error.message || 'Unknown error',
        retryable
      };
    }
  }

  /**
   * リトライ可能なHTTPステータスコードかを判定
   */
  private isRetryableStatusCode(statusCode: number): boolean {
    // 500番台のサーバーエラーとレート制限はリトライ可能
    return statusCode >= 500 || statusCode === 429;
  }

  /**
   * 待機（指数バックオフ用）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Webhook URL を取得（テスト用）
   */
  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  /**
   * Webhook URLを動的に設定（テスト用）
   */
  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }
}

// シングルトンインスタンスをエクスポート
export const retirementWebhookService = RetirementWebhookService.getInstance();

// デフォルトエクスポート
export default retirementWebhookService;
