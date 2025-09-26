/**
 * 医療システム → VoiceDrive Webhook受信ハンドラー
 * Phase 3統合 - 施設別権限リアルタイム連携
 */

import { facilityPermissionService } from './FacilityPermissionService';
import { medicalSystemAPI } from './MedicalSystemAPI';
import { authTokenService } from './AuthTokenService';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  signature?: string; // 署名検証用
}

interface StaffUpdatePayload extends WebhookPayload {
  event: 'staff.updated';
  data: {
    staffId: string;
    facilityId: string;
    changes: {
      position?: string;
      accountLevel?: number;
      department?: string;
      effectiveDate?: string;
    };
  };
}

interface FacilityMappingUpdatePayload extends WebhookPayload {
  event: 'facility.mapping_updated';
  data: {
    facilityId: string;
    updatedAt: string;
  };
}

interface StaffTransferPayload extends WebhookPayload {
  event: 'staff.transferred';
  data: {
    staffId: string;
    fromFacilityId: string;
    toFacilityId: string;
    newPosition: string;
    effectiveDate: string;
  };
}

class MedicalSystemWebhookHandler {
  private retryAttempts: Map<string, number> = new Map();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private webhookSecret: string | null = null;

  /**
   * Webhookシークレット設定
   */
  setWebhookSecret(secret: string): void {
    this.webhookSecret = secret;
  }

  /**
   * Webhookエントリポイント
   */
  async handleWebhook(payload: WebhookPayload): Promise<void> {
    console.log(`[医療システムWebhook受信] イベント: ${payload.event}`);

    // ペイロード検証
    if (!this.validatePayload(payload)) {
      throw new Error('無効なWebhookペイロード');
    }

    // 署名検証（本番環境のみ）
    if (import.meta.env.MODE === 'production' && !this.verifySignature(payload)) {
      throw new Error('Webhook署名検証失敗');
    }

    try {
      switch (payload.event) {
        case 'permission.updated':
          await this.handlePermissionUpdate(payload);
          break;
        case 'staff.created':
          await this.handleStaffCreation(payload);
          break;
        case 'staff.updated':
          await this.handleStaffUpdate(payload as StaffUpdatePayload);
          break;
        case 'staff.transferred':
          await this.handleStaffTransfer(payload as StaffTransferPayload);
          break;
        case 'facility.mapping_updated':
          await this.handleFacilityMappingUpdate(payload as FacilityMappingUpdatePayload);
          break;
        default:
          console.warn(`未対応のWebhookイベント: ${payload.event}`);
      }
    } catch (error) {
      await this.handleError(payload, error);
    }
  }

  /**
   * 権限レベル更新
   */
  private async handlePermissionUpdate(payload: WebhookPayload): Promise<void> {
    const { staffId, newLevel, facilityId } = payload.data;
    console.log(`[権限更新] ${staffId}: Level ${newLevel} @ ${facilityId || '法人共通'}`);

    // キャッシュ無効化
    facilityPermissionService.invalidateStaffCache(staffId, facilityId);

    // イベント発火
    window.dispatchEvent(
      new CustomEvent('permission-updated', {
        detail: { staffId, newLevel, facilityId }
      })
    );
  }

  /**
   * 職員作成
   */
  private async handleStaffCreation(payload: WebhookPayload): Promise<void> {
    const { staffId, facilityId, position } = payload.data;
    console.log(`[職員作成] ${staffId}: ${position} @ ${facilityId}`);

    // 新規職員の権限レベル取得
    try {
      const token = authTokenService.getToken() || authTokenService.generateMockToken();
      medicalSystemAPI.setAuthToken(token);

      const response = await medicalSystemAPI.calculatePermissionLevel(staffId, facilityId);
      console.log(`[職員作成] 権限レベル設定: ${response.permissionLevel}`);

      // 新規職員作成イベント発火
      window.dispatchEvent(
        new CustomEvent('staff-created', {
          detail: {
            staffId,
            facilityId,
            position,
            permissionLevel: response.permissionLevel
          }
        })
      );
    } catch (error) {
      console.error('[職員作成] 権限取得エラー:', error);
    }
  }

  /**
   * 職員情報更新（施設別権限対応）
   */
  private async handleStaffUpdate(payload: StaffUpdatePayload): Promise<void> {
    const { staffId, facilityId, changes } = payload.data;
    console.log(`[職員更新] ${staffId} @ ${facilityId}:`, changes);

    // 1. 権限キャッシュ無効化
    facilityPermissionService.invalidateStaffCache(staffId, facilityId);

    // 2. 新しい権限レベルを取得
    if (changes.accountLevel !== undefined || changes.position !== undefined) {
      try {
        const token = authTokenService.getToken() || authTokenService.generateMockToken();
        medicalSystemAPI.setAuthToken(token);

        const response = await medicalSystemAPI.calculatePermissionLevel(staffId, facilityId);
        console.log(`[職員更新] 新権限レベル: ${response.permissionLevel}`);

        // 3. UserContext更新イベントを発火
        window.dispatchEvent(
          new CustomEvent('staff-updated', {
            detail: {
              staffId,
              facilityId,
              newLevel: response.permissionLevel,
              position: changes.position,
              department: changes.department
            }
          })
        );
      } catch (error) {
        console.error(`[職員更新] 権限取得エラー:`, error);
      }
    }
  }

  /**
   * 職員の施設間異動
   */
  private async handleStaffTransfer(payload: StaffTransferPayload): Promise<void> {
    const { staffId, fromFacilityId, toFacilityId, newPosition, effectiveDate } = payload.data;
    console.log(`[職員異動] ${staffId}: ${fromFacilityId} → ${toFacilityId}`);

    // 両施設のキャッシュ無効化
    facilityPermissionService.invalidateStaffCache(staffId, fromFacilityId);
    facilityPermissionService.invalidateStaffCache(staffId, toFacilityId);

    // 新施設での権限レベル取得
    try {
      const token = authTokenService.getToken() || authTokenService.generateMockToken();
      medicalSystemAPI.setAuthToken(token);

      const response = await medicalSystemAPI.calculatePermissionLevel(staffId, toFacilityId);
      const adjustedLevel = facilityPermissionService.translatePermissionLevel(
        response.permissionLevel,
        fromFacilityId,
        toFacilityId
      );

      console.log(`[職員異動] 権限レベル調整: ${response.permissionLevel} → ${adjustedLevel}`);

      // 異動イベント発火
      window.dispatchEvent(
        new CustomEvent('staff-transferred', {
          detail: {
            staffId,
            fromFacilityId,
            toFacilityId,
            newPosition,
            newLevel: adjustedLevel,
            effectiveDate
          }
        })
      );
    } catch (error) {
      console.error('[職員異動] エラー:', error);
    }
  }

  /**
   * 施設マッピング更新
   */
  private async handleFacilityMappingUpdate(payload: FacilityMappingUpdatePayload): Promise<void> {
    const { facilityId, updatedAt } = payload.data;
    console.log(`[施設マッピング更新] ${facilityId} @ ${updatedAt}`);

    // 施設マッピングを再同期
    await facilityPermissionService.syncFacilityMappings();

    // マッピング更新イベント発火
    window.dispatchEvent(
      new CustomEvent('facility-mapping-updated', {
        detail: { facilityId, updatedAt }
      })
    );
  }

  /**
   * ペイロード検証
   */
  private validatePayload(payload: WebhookPayload): boolean {
    if (!payload.event || !payload.timestamp || !payload.data) {
      return false;
    }

    // タイムスタンプ検証（24時間以内）
    const timestamp = new Date(payload.timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (Math.abs(diffHours) > 24) {
      console.warn('Webhookペイロードが古すぎます');
      return false;
    }

    return true;
  }

  /**
   * 署名検証
   */
  private verifySignature(payload: WebhookPayload): boolean {
    if (!this.webhookSecret || !payload.signature) {
      return false;
    }

    // TODO: HMAC-SHA256による署名検証実装
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.webhookSecret)
    //   .update(JSON.stringify(payload.data))
    //   .digest('hex');
    // return payload.signature === expectedSignature;

    return true; // 暫定的に常にtrue
  }

  /**
   * エラーハンドリングとリトライ
   */
  private async handleError(payload: WebhookPayload, error: any): Promise<void> {
    const eventKey = `${payload.event}-${payload.timestamp}`;
    const attempts = (this.retryAttempts.get(eventKey) || 0) + 1;

    console.error(`[Webhookエラー] ${payload.event} (試行${attempts}回目):`, error);

    if (attempts < this.MAX_RETRY_ATTEMPTS) {
      this.retryAttempts.set(eventKey, attempts);

      // リトライ
      setTimeout(() => {
        this.handleWebhook(payload);
      }, this.RETRY_DELAY_MS * attempts);
    } else {
      console.error(`[Webhookエラー] リトライ上限に達しました: ${payload.event}`);
      this.retryAttempts.delete(eventKey);

      // エラーログを記録
      this.logWebhookError(payload, error);
    }
  }

  /**
   * Webhookエラーログ記録
   */
  private logWebhookError(payload: WebhookPayload, error: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      event: payload.event,
      payload,
      error: error.message || error,
      stack: error.stack
    };

    // LocalStorageに一時保存（将来的にはAPI送信）
    const logs = JSON.parse(localStorage.getItem('webhook_errors') || '[]');
    logs.push(errorLog);

    // 最大50件まで保持
    if (logs.length > 50) {
      logs.shift();
    }

    localStorage.setItem('webhook_errors', JSON.stringify(logs));
  }

  /**
   * エラーログ取得（デバッグ用）
   */
  getErrorLogs(): any[] {
    return JSON.parse(localStorage.getItem('webhook_errors') || '[]');
  }

  /**
   * エラーログクリア
   */
  clearErrorLogs(): void {
    localStorage.removeItem('webhook_errors');
  }
}

// シングルトンインスタンス
export const webhookHandler = new MedicalSystemWebhookHandler();

// Webhook受信用エンドポイント（Express等で実装）
export function setupWebhookEndpoint(app: any): void {
  app.post('/api/webhook/medical-system', async (req: any, res: any) => {
    try {
      await webhookHandler.handleWebhook(req.body);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Webhook処理エラー:', error);
      res.status(400).json({ error: error.message });
    }
  });
}