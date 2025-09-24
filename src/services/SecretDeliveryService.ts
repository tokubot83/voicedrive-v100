/**
 * 秘密情報配信サービス
 * お知らせ配信機能を活用した安全な秘密情報共有
 * @version 1.0.0
 * @date 2025-09-25
 */

import crypto from 'crypto';
import { promisify } from 'util';

// ==================== 型定義 ====================

interface DeliveryOptions {
  expiresIn: number;  // 秒単位
  requiresMFA: boolean;
  ipRestrictions?: string[];
  maxAccessAttempts?: number;
}

interface DeliveryResult {
  deliveryId: string;
  token: string;
  status: 'delivered' | 'failed';
  expiresAt: Date;
  accessUrl: string;
}

interface SecretDelivery {
  deliveryId: string;
  recipient: string;
  encrypted: string;
  iv: string;
  authTag: string;
  salt: string;
  token: string;
  tokenHash: string;
  expiresAt: Date;
  requiresMFA: boolean;
  ipRestrictions?: string[];
  maxAccessAttempts: number;
  accessAttempts: number;
  accessed: boolean;
  accessedAt?: Date;
  accessedBy?: string;
  accessedFrom?: string;
  createdAt: Date;
  createdBy: string;
}

interface NotificationOptions {
  email?: string;
  slack?: string;
  teams?: string;
}

// ==================== メインクラス ====================

export class SecretDeliveryService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;
  private readonly SALT_LENGTH = 32;
  private readonly TOKEN_LENGTH = 32;
  private readonly PBKDF2_ITERATIONS = 100000;

  // ストレージ（実際はデータベース）
  private deliveries: Map<string, SecretDelivery> = new Map();

  // ==================== 秘密情報の配信 ====================

  /**
   * 秘密情報を暗号化して配信
   */
  async deliverSecrets(
    recipient: string,
    secrets: Record<string, string>,
    options: DeliveryOptions,
    notification?: NotificationOptions
  ): Promise<DeliveryResult> {
    try {
      // 配信IDとトークンの生成
      const deliveryId = this.generateDeliveryId();
      const token = this.generateToken();
      const tokenHash = this.hashToken(token);

      // 秘密情報の暗号化
      const encrypted = await this.encryptSecrets(secrets, token);

      // 配信情報の保存
      const delivery: SecretDelivery = {
        deliveryId,
        recipient,
        ...encrypted,
        token: '',  // トークンは保存しない
        tokenHash,  // ハッシュのみ保存
        expiresAt: new Date(Date.now() + options.expiresIn * 1000),
        requiresMFA: options.requiresMFA,
        ipRestrictions: options.ipRestrictions,
        maxAccessAttempts: options.maxAccessAttempts || 3,
        accessAttempts: 0,
        accessed: false,
        createdAt: new Date(),
        createdBy: 'system'
      };

      this.deliveries.set(deliveryId, delivery);

      // 自動削除のスケジューリング
      this.scheduleAutoDeletion(deliveryId, options.expiresIn * 1000);

      // アクセスURLの生成
      const accessUrl = this.generateAccessUrl(deliveryId);

      // 通知の送信
      if (notification) {
        await this.sendNotification(recipient, {
          deliveryId,
          token,
          accessUrl,
          expiresAt: delivery.expiresAt,
          ...notification
        });
      }

      // 監査ログ
      await this.auditLog('SECRET_DELIVERED', {
        deliveryId,
        recipient,
        expiresAt: delivery.expiresAt
      });

      return {
        deliveryId,
        token,
        status: 'delivered',
        expiresAt: delivery.expiresAt,
        accessUrl
      };

    } catch (error) {
      console.error('Failed to deliver secrets:', error);
      throw new Error('Secret delivery failed');
    }
  }

  // ==================== 秘密情報の取得 ====================

  /**
   * 配信された秘密情報を取得
   */
  async retrieveSecrets(
    deliveryId: string,
    token: string,
    mfaCode?: string,
    clientInfo?: {
      ip?: string;
      userAgent?: string;
      fingerprint?: string;
    }
  ): Promise<Record<string, string>> {
    try {
      // 配信情報の取得
      const delivery = this.deliveries.get(deliveryId);
      if (!delivery) {
        throw new Error('Delivery not found');
      }

      // アクセス済みチェック
      if (delivery.accessed) {
        await this.auditLog('ACCESS_DENIED_ALREADY_ACCESSED', {
          deliveryId,
          attemptFrom: clientInfo?.ip
        });
        throw new Error('Secrets already accessed');
      }

      // 有効期限チェック
      if (new Date() > delivery.expiresAt) {
        await this.auditLog('ACCESS_DENIED_EXPIRED', {
          deliveryId,
          expiredAt: delivery.expiresAt
        });
        throw new Error('Delivery expired');
      }

      // アクセス試行回数チェック
      delivery.accessAttempts++;
      if (delivery.accessAttempts > delivery.maxAccessAttempts) {
        await this.auditLog('ACCESS_DENIED_MAX_ATTEMPTS', {
          deliveryId,
          attempts: delivery.accessAttempts
        });
        await this.secureDelete(deliveryId);
        throw new Error('Maximum access attempts exceeded');
      }

      // トークン検証
      const tokenHash = this.hashToken(token);
      if (tokenHash !== delivery.tokenHash) {
        await this.auditLog('ACCESS_DENIED_INVALID_TOKEN', {
          deliveryId,
          attemptFrom: clientInfo?.ip
        });
        throw new Error('Invalid token');
      }

      // IP制限チェック
      if (delivery.ipRestrictions && clientInfo?.ip) {
        if (!this.isIpAllowed(clientInfo.ip, delivery.ipRestrictions)) {
          await this.auditLog('ACCESS_DENIED_IP_RESTRICTION', {
            deliveryId,
            attemptFrom: clientInfo.ip
          });
          throw new Error('Access denied from this IP');
        }
      }

      // MFA検証
      if (delivery.requiresMFA) {
        if (!mfaCode) {
          throw new Error('MFA code required');
        }
        const isMfaValid = await this.verifyMFA(delivery.recipient, mfaCode);
        if (!isMfaValid) {
          await this.auditLog('ACCESS_DENIED_INVALID_MFA', {
            deliveryId,
            recipient: delivery.recipient
          });
          throw new Error('Invalid MFA code');
        }
      }

      // 秘密情報の復号化
      const secrets = await this.decryptSecrets({
        encrypted: delivery.encrypted,
        iv: delivery.iv,
        authTag: delivery.authTag,
        salt: delivery.salt
      }, token);

      // アクセス記録を更新
      delivery.accessed = true;
      delivery.accessedAt = new Date();
      delivery.accessedBy = delivery.recipient;
      delivery.accessedFrom = clientInfo?.ip;

      // 即座に削除
      await this.secureDelete(deliveryId);

      // 監査ログ
      await this.auditLog('SECRET_RETRIEVED', {
        deliveryId,
        recipient: delivery.recipient,
        accessedFrom: clientInfo?.ip,
        timestamp: new Date()
      });

      return secrets;

    } catch (error) {
      console.error('Failed to retrieve secrets:', error);
      throw error;
    }
  }

  // ==================== 暗号化・復号化 ====================

  /**
   * 秘密情報の暗号化
   */
  private async encryptSecrets(
    secrets: Record<string, string>,
    token: string
  ): Promise<{
    encrypted: string;
    iv: string;
    authTag: string;
    salt: string;
  }> {
    // ソルトとIVの生成
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    // トークンから暗号化キーを導出
    const key = await this.deriveKey(token, salt);

    // 暗号化
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const jsonData = JSON.stringify(secrets);

    let encrypted = cipher.update(jsonData, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      salt: salt.toString('base64')
    };
  }

  /**
   * 秘密情報の復号化
   */
  private async decryptSecrets(
    encryptedData: {
      encrypted: string;
      iv: string;
      authTag: string;
      salt: string;
    },
    token: string
  ): Promise<Record<string, string>> {
    // バッファに変換
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');

    // トークンから暗号化キーを導出
    const key = await this.deriveKey(token, salt);

    // 復号化
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * キー導出関数
   */
  private async deriveKey(token: string, salt: Buffer): Promise<Buffer> {
    const pbkdf2 = promisify(crypto.pbkdf2);
    return await pbkdf2(token, salt, this.PBKDF2_ITERATIONS, this.KEY_LENGTH, 'sha256');
  }

  // ==================== トークン管理 ====================

  /**
   * 配信IDの生成
   */
  private generateDeliveryId(): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `SEC-${timestamp}-${random}`;
  }

  /**
   * ワンタイムトークンの生成
   */
  private generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * トークンのハッシュ化
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * アクセスURLの生成
   */
  private generateAccessUrl(deliveryId: string): string {
    const baseUrl = process.env.SECRET_DELIVERY_BASE_URL ||
                   'https://secure.medical-system.kosei-kai.jp';
    return `${baseUrl}/secrets/${deliveryId}`;
  }

  // ==================== セキュリティ機能 ====================

  /**
   * IP制限チェック
   */
  private isIpAllowed(clientIp: string, allowedIps: string[]): boolean {
    // CIDR表記対応を含むIP制限チェック
    // 実装簡略化のため、完全一致のみ
    return allowedIps.includes(clientIp);
  }

  /**
   * MFA検証（実際の実装では外部サービス連携）
   */
  private async verifyMFA(recipient: string, code: string): Promise<boolean> {
    // TODO: 実際のMFA検証実装
    console.log(`Verifying MFA for ${recipient} with code ${code}`);
    return true;  // 開発環境では常にtrue
  }

  // ==================== データ管理 ====================

  /**
   * 安全な削除
   */
  async secureDelete(deliveryId: string): Promise<void> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) return;

    // メモリから削除
    this.deliveries.delete(deliveryId);

    // 監査ログ
    await this.auditLog('SECRET_DELETED', {
      deliveryId,
      deletedAt: new Date(),
      reason: delivery.accessed ? 'accessed' : 'expired'
    });

    console.log(`Securely deleted delivery: ${deliveryId}`);
  }

  /**
   * 自動削除のスケジューリング
   */
  private scheduleAutoDeletion(deliveryId: string, delayMs: number): void {
    setTimeout(async () => {
      const delivery = this.deliveries.get(deliveryId);
      if (delivery && !delivery.accessed) {
        await this.secureDelete(deliveryId);
        console.log(`Auto-deleted expired delivery: ${deliveryId}`);
      }
    }, delayMs);
  }

  // ==================== 通知 ====================

  /**
   * 通知送信
   */
  private async sendNotification(
    recipient: string,
    details: any
  ): Promise<void> {
    // TODO: 実際の通知実装（Email/Slack/Teams）
    console.log(`Notification sent to ${recipient}:`, details);

    // Email通知のシミュレーション
    const emailContent = `
【重要】本番環境秘密情報の配信通知

${recipient}様

医療システムチームより本番環境の秘密情報が配信されました。

配信ID: ${details.deliveryId}
有効期限: ${details.expiresAt}
取得URL: ${details.accessUrl}

【取得方法】
1. 上記URLにアクセス
2. MFA認証を完了
3. トークンを入力: ${details.token}
4. 秘密情報をダウンロード

※このURLは1回のみアクセス可能です
※有効期限を過ぎると自動削除されます
    `;

    console.log('Email notification:', emailContent);
  }

  // ==================== 監査ログ ====================

  /**
   * 監査ログ記録
   */
  private async auditLog(action: string, details: any): Promise<void> {
    const log = {
      timestamp: new Date(),
      action,
      details,
      hash: crypto.randomBytes(16).toString('hex')
    };

    // TODO: データベースに保存
    console.log('Audit log:', log);
  }

  // ==================== 管理機能 ====================

  /**
   * 配信状態の取得
   */
  getDeliveryStatus(deliveryId: string): {
    exists: boolean;
    accessed?: boolean;
    expiresAt?: Date;
    accessAttempts?: number;
  } {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      return { exists: false };
    }

    return {
      exists: true,
      accessed: delivery.accessed,
      expiresAt: delivery.expiresAt,
      accessAttempts: delivery.accessAttempts
    };
  }

  /**
   * 全配信のクリーンアップ（テスト用）
   */
  async cleanupAll(): Promise<void> {
    const deliveryIds = Array.from(this.deliveries.keys());
    for (const id of deliveryIds) {
      await this.secureDelete(id);
    }
  }
}

// ==================== シングルトンインスタンス ====================

export const secretDeliveryService = new SecretDeliveryService();