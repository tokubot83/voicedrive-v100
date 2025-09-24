/**
 * コンプライアンス通報転送サービス
 * 医療職員管理システムへの安全な通報データ転送を管理
 * @version 1.0.0
 * @date 2025-09-24
 */

import crypto from 'crypto';
import { ComplianceReport, TransferStatus } from '../types/compliance-enhanced';

// ==================== 型定義 ====================

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
  algorithm: string;
  keyId?: string;
}

interface TransferRequest {
  version: string;
  source: string;
  timestamp: string;
  payload: EncryptedData;
  checksum: string;
  metadata: {
    reportId: string;
    anonymousId: string;
    severity: string;
    category: string;
    requiresImmediateAction: boolean;
  };
}

interface TransferResponse {
  success: boolean;
  caseNumber?: string;
  acknowledgementId?: string;
  receivedAt?: string;
  message: string;
  estimatedResponseTime?: {
    value: number;
    unit: 'hours' | 'days';
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface TransferResult {
  status: TransferStatus;
  response?: TransferResponse;
  error?: Error;
  attempts: number;
  duration: number;
}

// ==================== メインクラス ====================

export class ComplianceTransferService {
  private readonly API_BASE: string;
  private readonly API_KEY: string;
  private readonly ENCRYPTION_KEY: Buffer;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;  // ミリ秒
  private readonly TIMEOUT = 30000;     // 30秒

  constructor() {
    // 環境変数から設定を取得（医療システムチーム提供のエンドポイントに更新）
    this.API_BASE = process.env.MEDICAL_SYSTEM_API_BASE || 'https://voicedrive.ai/api/v2';
    this.API_KEY = process.env.COMPLIANCE_API_KEY || '';

    // 暗号化キーの取得
    const encKey = process.env.ENCRYPTION_KEY;
    if (!encKey) {
      throw new Error('ENCRYPTION_KEY is not configured');
    }
    this.ENCRYPTION_KEY = Buffer.from(encKey, 'hex');
  }

  /**
   * 通報データを医療システムへ転送
   */
  async transferReport(report: ComplianceReport): Promise<TransferResult> {
    const startTime = Date.now();
    let attempts = 0;
    let lastError: Error | undefined;

    try {
      // 1. ペイロードの準備
      const payload = this.preparePayload(report);

      // 2. 暗号化
      const encryptedPayload = await this.encryptData(payload);

      // 3. チェックサム生成
      const checksum = this.generateChecksum(encryptedPayload);

      // 4. 転送リクエスト構築
      const transferRequest = this.buildTransferRequest(
        report,
        encryptedPayload,
        checksum
      );

      // 5. リトライ付きAPI送信
      for (attempts = 1; attempts <= this.MAX_RETRIES; attempts++) {
        try {
          const response = await this.sendRequest(transferRequest, attempts);

          if (response.success) {
            // 成功時の処理
            await this.logSuccess(report.reportId, response, attempts);

            return {
              status: 'acknowledged',
              response,
              attempts,
              duration: Date.now() - startTime
            };
          }

          // エラーレスポンスの処理
          lastError = new Error(response.error?.message || 'Transfer failed');

        } catch (error) {
          lastError = error as Error;

          // リトライ可能なエラーか判定
          if (!this.isRetryableError(error) || attempts === this.MAX_RETRIES) {
            break;
          }

          // 指数バックオフで待機
          await this.delay(this.RETRY_DELAY * Math.pow(2, attempts - 1));
        }
      }

      // 失敗時の処理
      await this.logFailure(report.reportId, lastError!, attempts);

      return {
        status: 'failed',
        error: lastError,
        attempts,
        duration: Date.now() - startTime
      };

    } catch (error) {
      // 予期しないエラー
      console.error('Unexpected error in transferReport:', error);

      return {
        status: 'failed',
        error: error as Error,
        attempts,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * ペイロードの準備
   */
  private preparePayload(report: ComplianceReport): object {
    // センシティブ情報を含む完全なペイロード
    return {
      report: {
        reportId: report.reportId,
        anonymousId: report.anonymousId,
        submittedAt: report.submittedAt,

        reporter: {
          disclosureLevel: report.reporter.disclosureLevel,
          consentToDisclose: report.reporter.consentToDisclose,
          attributes: report.reporter.attributes
        },

        category: report.category,
        incident: report.incident,
        evidence: {
          hasEvidence: report.evidence.hasEvidence,
          types: report.evidence.types,
          files: report.evidence.files.map(f => ({
            id: f.id,
            fileName: f.fileName,
            mimeType: f.mimeType,
            size: f.size,
            checksum: f.checksum,
            encryptedUrl: f.encryptedPath
          })),
          witnessCount: report.evidence.witnesses?.count
        },

        assessment: report.assessment
      }
    };
  }

  /**
   * データの暗号化（AES-256-GCM）
   */
  private async encryptData(data: any): Promise<EncryptedData> {
    return new Promise((resolve, reject) => {
      try {
        const algorithm = 'aes-256-gcm';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, this.ENCRYPTION_KEY, iv);

        const jsonData = JSON.stringify(data);
        let encrypted = cipher.update(jsonData, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        resolve({
          encrypted,
          iv: iv.toString('hex'),
          authTag: authTag.toString('hex'),
          algorithm,
          keyId: process.env.ENCRYPTION_KEY_ID
        });

      } catch (error) {
        reject(new Error(`Encryption failed: ${error}`));
      }
    });
  }

  /**
   * チェックサムの生成
   */
  private generateChecksum(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * 転送リクエストの構築
   */
  private buildTransferRequest(
    report: ComplianceReport,
    encryptedPayload: EncryptedData,
    checksum: string
  ): TransferRequest {
    return {
      version: '1.0',
      source: 'voicedrive',
      timestamp: new Date().toISOString(),
      payload: encryptedPayload,
      checksum,
      metadata: {
        reportId: report.reportId,
        anonymousId: report.anonymousId,
        severity: report.assessment.severity,
        category: report.category.main,
        requiresImmediateAction: report.assessment.requiresImmediateAction
      }
    };
  }

  /**
   * HTTPリクエストの送信
   */
  private async sendRequest(
    request: TransferRequest,
    attemptNumber: number
  ): Promise<TransferResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      const response = await fetch(`${this.API_BASE}/compliance/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'X-Request-ID': crypto.randomUUID(),
          'X-Timestamp': new Date().toISOString(),
          'X-Retry-Count': attemptNumber.toString(),
          'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const responseData = await response.json();

      if (!response.ok) {
        // HTTPエラーステータス
        return {
          success: false,
          message: 'Transfer failed',
          error: {
            code: `HTTP_${response.status}`,
            message: responseData.message || response.statusText,
            details: responseData
          }
        };
      }

      return responseData;

    } catch (error: any) {
      clearTimeout(timeout);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  /**
   * アクセストークンの取得
   */
  private async getAccessToken(): Promise<string> {
    // 本番環境ではOAuth2.0やJWT生成を実装
    // ここでは環境変数から直接取得
    if (process.env.NODE_ENV === 'development') {
      return this.API_KEY;
    }

    // TODO: 実際のトークン取得ロジックを実装
    return this.API_KEY;
  }

  /**
   * リトライ可能なエラーか判定
   */
  private isRetryableError(error: any): boolean {
    // ネットワークエラー
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // HTTPステータスによる判定
    const retryableStatuses = [429, 500, 502, 503, 504];
    if (error.status && retryableStatuses.includes(error.status)) {
      return true;
    }

    // タイムアウト
    if (error.message === 'Request timeout') {
      return true;
    }

    return false;
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 成功ログ記録
   */
  private async logSuccess(
    reportId: string,
    response: TransferResponse,
    attempts: number
  ): Promise<void> {
    console.log('Transfer successful:', {
      reportId,
      caseNumber: response.caseNumber,
      attempts,
      timestamp: new Date().toISOString()
    });

    // TODO: 監査ログDBへの記録
  }

  /**
   * 失敗ログ記録
   */
  private async logFailure(
    reportId: string,
    error: Error,
    attempts: number
  ): Promise<void> {
    console.error('Transfer failed:', {
      reportId,
      error: error.message,
      attempts,
      timestamp: new Date().toISOString()
    });

    // TODO: 監査ログDBへの記録
  }

  /**
   * 転送ステータスの更新
   */
  async updateTransferStatus(
    reportId: string,
    status: TransferStatus,
    details?: any
  ): Promise<void> {
    // TODO: データベースのステータス更新
    console.log('Updating transfer status:', {
      reportId,
      status,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 転送履歴の取得
   */
  async getTransferHistory(reportId: string): Promise<any[]> {
    // TODO: データベースから履歴取得
    return [];
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`
        }
      });

      return response.ok;

    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const complianceTransferService = new ComplianceTransferService();