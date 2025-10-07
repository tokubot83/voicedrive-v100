/**
 * コンプライアンスセキュリティサービス
 * 暗号化、アクセス制御、監査ログ管理
 * @version 1.0.0
 * @date 2025-09-24
 */

import crypto from 'crypto';
import { ComplianceReport, AccessControlInfo } from '../types/compliance-enhanced';

// ==================== 型定義 ====================

interface EncryptedFile {
  id: string;
  originalName: string;
  encryptedPath: string;
  mimeType: string;
  size: number;
  checksum: string;
  encryptionKeyId: string;
  metadata: {
    uploadedAt: Date;
    uploadedBy?: string;
    verified: boolean;
  };
}

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  reportId?: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  previousHash?: string;
  currentHash: string;
}

type AccessLevel = 'none' | 'summary' | 'details' | 'identity' | 'full';

interface UserPermissions {
  userId: string;
  role: string;
  accessLevel: AccessLevel;
  canEdit: boolean;
  canExport: boolean;
  canShare: boolean;
  restrictions?: string[];
}

// ==================== メインクラス ====================

export class ComplianceSecurityService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;
  private readonly TAG_LENGTH = 16;
  private readonly SALT_LENGTH = 64;

  // 暗号化キー管理
  private encryptionKeys: Map<string, Buffer> = new Map();
  private currentKeyId: string = '';

  // テスト用メモリストレージ
  private fileStorage: Map<string, Buffer> = new Map();

  constructor() {
    this.initializeEncryption();
  }

  /**
   * 暗号化の初期化
   */
  private initializeEncryption(): void {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encryption key not configured');
    }

    const keyId = process.env.ENCRYPTION_KEY_ID || 'default';
    this.encryptionKeys.set(keyId, Buffer.from(key, 'hex'));
    this.currentKeyId = keyId;
  }

  // ==================== ファイル暗号化 ====================

  /**
   * ファイルの暗号化と保存
   */
  async encryptAndStoreFile(
    file: File | Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy?: string
  ): Promise<EncryptedFile> {
    try {
      // ファイルデータの取得
      const buffer = file instanceof File
        ? Buffer.from(await file.arrayBuffer())
        : file;

      // チェックサム生成（暗号化前）
      const checksum = this.calculateChecksum(buffer);

      // ファイルの暗号化
      const encrypted = await this.encryptBuffer(buffer);

      // 安全なファイル名生成
      const fileId = crypto.randomUUID();
      const encryptedPath = this.generateSecurePath(fileId);

      // メタデータ
      const metadata: EncryptedFile = {
        id: fileId,
        originalName,
        encryptedPath,
        mimeType,
        size: buffer.length,
        checksum,
        encryptionKeyId: this.currentKeyId,
        metadata: {
          uploadedAt: new Date(),
          uploadedBy,
          verified: true
        }
      };

      // ファイルシステムまたはクラウドストレージに保存
      await this.saveEncryptedFile(encryptedPath, encrypted);

      // 監査ログ記録
      await this.auditLog('FILE_ENCRYPTED', uploadedBy || 'system', {
        fileId,
        originalName,
        size: buffer.length
      });

      return metadata;

    } catch (error) {
      console.error('File encryption failed:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  /**
   * ファイルの復号化
   */
  async decryptFile(encryptedFile: EncryptedFile): Promise<Buffer> {
    try {
      // 暗号化ファイルの読み込み
      const encryptedData = await this.loadEncryptedFile(encryptedFile.encryptedPath);

      // 復号化
      const decrypted = await this.decryptBuffer(
        encryptedData,
        encryptedFile.encryptionKeyId
      );

      // チェックサム検証
      const checksum = this.calculateChecksum(decrypted);
      if (checksum !== encryptedFile.checksum) {
        throw new Error('Checksum verification failed');
      }

      return decrypted;

    } catch (error) {
      console.error('File decryption failed:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  // ==================== データ暗号化 ====================

  /**
   * バッファの暗号化
   */
  private async encryptBuffer(buffer: Buffer): Promise<Buffer> {
    const key = this.encryptionKeys.get(this.currentKeyId);
    if (!key) {
      throw new Error('Encryption key not found');
    }

    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // IV + AuthTag + 暗号化データを結合
    return Buffer.concat([iv, authTag, encrypted]);
  }

  /**
   * バッファの復号化
   */
  private async decryptBuffer(encryptedBuffer: Buffer, keyId?: string): Promise<Buffer> {
    const key = this.encryptionKeys.get(keyId || this.currentKeyId);
    if (!key) {
      throw new Error('Decryption key not found');
    }

    // IV、AuthTag、暗号化データを分離
    const iv = encryptedBuffer.slice(0, this.IV_LENGTH);
    const authTag = encryptedBuffer.slice(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
    const encrypted = encryptedBuffer.slice(this.IV_LENGTH + this.TAG_LENGTH);

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }

  // ==================== アクセス制御 ====================

  /**
   * ユーザーの権限チェック
   */
  async checkUserPermissions(
    userId: string,
    reportId: string,
    requiredLevel: AccessLevel = 'summary'
  ): Promise<UserPermissions> {
    // ユーザー情報の取得（実際はDBから）
    const userRole = await this.getUserRole(userId);

    // 役職による基本権限
    const basePermissions = this.getRolePermissions(userRole);

    // 特別な権限の確認
    const specialPermissions = await this.getSpecialPermissions(userId, reportId);

    // 権限の統合
    const permissions: UserPermissions = {
      userId,
      role: userRole,
      accessLevel: this.mergeAccessLevels(
        basePermissions.accessLevel,
        specialPermissions?.accessLevel
      ),
      canEdit: basePermissions.canEdit || specialPermissions?.canEdit || false,
      canExport: basePermissions.canExport || specialPermissions?.canExport || false,
      canShare: basePermissions.canShare || false,
      restrictions: [...(basePermissions.restrictions || []), ...(specialPermissions?.restrictions || [])]
    };

    // 権限レベルのチェック
    if (!this.hasRequiredAccessLevel(permissions.accessLevel, requiredLevel)) {
      throw new Error('Insufficient permissions');
    }

    // アクセスログ記録
    await this.auditAccess(userId, reportId, 'ACCESS_GRANTED', {
      requiredLevel,
      grantedLevel: permissions.accessLevel
    });

    return permissions;
  }

  /**
   * データマスキング
   */
  maskSensitiveData(data: ComplianceReport, accessLevel: AccessLevel): Partial<ComplianceReport> {
    const masked: any = { ...data };

    switch (accessLevel) {
      case 'none':
        return {};

      case 'summary':
        // 基本情報のみ
        return {
          reportId: masked.reportId,
          anonymousId: masked.anonymousId,
          category: masked.category,
          assessment: {
            severity: masked.assessment.severity,
            requiresImmediateAction: masked.assessment.requiresImmediateAction
          },
          tracking: {
            currentStatus: masked.tracking.currentStatus,
            progressPercentage: masked.tracking.progressPercentage
          }
        } as Partial<ComplianceReport>;

      case 'details':
        // 個人情報以外
        delete masked.reporter.attributes;
        delete masked.reporter.contactInfo;
        delete masked.incident.accused?.name;
        delete masked.incident.location.specific;
        break;

      case 'identity':
        // 調査に必要な情報（条件付き）
        if (masked.reporter.disclosureLevel === 'full_anonymous') {
          delete masked.reporter.attributes;
          delete masked.reporter.contactInfo;
        }
        break;

      case 'full':
        // 全情報アクセス可能
        break;
    }

    return masked;
  }

  // ==================== 監査ログ ====================

  /**
   * 監査ログの記録
   */
  async auditLog(
    action: string,
    userId: string,
    details?: any,
    reportId?: string
  ): Promise<void> {
    try {
      // 前のログのハッシュ値を取得
      const previousLog = await this.getLastAuditLog();
      const previousHash = previousLog?.currentHash || '0';

      // ログデータの構築
      const logData = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId,
        userRole: await this.getUserRole(userId),
        reportId,
        action,
        details,
        ipAddress: this.getCurrentIP(),
        userAgent: this.getUserAgent(),
        sessionId: this.getSessionId(),
        previousHash
      };

      // ハッシュチェーン（改ざん防止）
      const currentHash = this.calculateHash(logData);

      const auditLog: AuditLog = {
        ...logData,
        currentHash
      };

      // データベースに保存
      await this.saveAuditLog(auditLog);

      // 重要なアクションの通知
      if (this.isCriticalAction(action)) {
        await this.notifySecurityTeam(auditLog);
      }

    } catch (error) {
      console.error('Audit log failed:', error);
      // 監査ログの失敗は致命的なので、別の方法で記録
      await this.emergencyLog(action, userId, error);
    }
  }

  /**
   * アクセス監査
   */
  async auditAccess(
    userId: string,
    reportId: string,
    action: string,
    details?: any
  ): Promise<void> {
    await this.auditLog(`ACCESS_${action}`, userId, {
      reportId,
      ...details,
      timestamp: new Date().toISOString()
    }, reportId);
  }

  /**
   * 監査ログの整合性検証
   */
  async verifyAuditLogIntegrity(
    fromDate: Date,
    toDate: Date
  ): Promise<{ valid: boolean; brokenAt?: string }> {
    const logs = await this.getAuditLogs(fromDate, toDate);
    let previousHash = '0';

    for (const log of logs) {
      // ハッシュチェーンの検証
      if (log.previousHash !== previousHash) {
        return {
          valid: false,
          brokenAt: log.id
        };
      }

      // ハッシュ値の再計算と検証
      const recalculatedHash = this.calculateHash({
        ...log,
        currentHash: undefined
      });

      if (recalculatedHash !== log.currentHash) {
        return {
          valid: false,
          brokenAt: log.id
        };
      }

      previousHash = log.currentHash;
    }

    return { valid: true };
  }

  // ==================== ヘルパーメソッド ====================

  /**
   * チェックサムの計算
   */
  private calculateChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * ハッシュ値の計算
   */
  private calculateHash(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * 安全なファイルパスの生成
   */
  private generateSecurePath(fileId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `compliance/${year}/${month}/${day}/${fileId}`;
  }

  /**
   * 役職による権限の取得
   */
  private getRolePermissions(role: string): Partial<UserPermissions> {
    const permissions: Record<string, Partial<UserPermissions>> = {
      admin: {
        accessLevel: 'full',
        canEdit: true,
        canExport: true,
        canShare: true
      },
      manager: {
        accessLevel: 'identity',
        canEdit: true,
        canExport: true,
        canShare: false
      },
      investigator: {
        accessLevel: 'details',
        canEdit: true,
        canExport: false,
        canShare: false
      },
      viewer: {
        accessLevel: 'summary',
        canEdit: false,
        canExport: false,
        canShare: false
      }
    };

    return permissions[role] || permissions.viewer;
  }

  /**
   * アクセスレベルの統合
   */
  private mergeAccessLevels(level1?: AccessLevel, level2?: AccessLevel): AccessLevel {
    const levels: AccessLevel[] = ['none', 'summary', 'details', 'identity', 'full'];
    const index1 = levels.indexOf(level1 || 'none');
    const index2 = levels.indexOf(level2 || 'none');

    return levels[Math.max(index1, index2)];
  }

  /**
   * 必要なアクセスレベルの確認
   */
  private hasRequiredAccessLevel(userLevel: AccessLevel, requiredLevel: AccessLevel): boolean {
    const levels: AccessLevel[] = ['none', 'summary', 'details', 'identity', 'full'];
    return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
  }

  /**
   * 重要なアクションの判定
   */
  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      'IDENTITY_ACCESSED',
      'DATA_EXPORTED',
      'PERMISSION_GRANTED',
      'REPORT_DELETED',
      'ENCRYPTION_KEY_ROTATED'
    ];

    return criticalActions.includes(action);
  }

  // ==================== スタブメソッド（実装が必要） ====================

  private async getUserRole(userId: string): Promise<string> {
    // TODO: 実際のユーザーロール取得
    return 'investigator';
  }

  private async getSpecialPermissions(userId: string, reportId: string): Promise<Partial<UserPermissions> | null> {
    // TODO: 特別権限の取得
    return null;
  }

  private async saveEncryptedFile(path: string, data: Buffer): Promise<void> {
    // メモリストレージに保存（テスト用）
    this.fileStorage.set(path, data);
    console.log(`Saving encrypted file to: ${path}`);
  }

  private async loadEncryptedFile(path: string): Promise<Buffer> {
    // メモリストレージから読み込み（テスト用）
    const data = this.fileStorage.get(path);
    if (!data) {
      throw new Error(`File not found: ${path}`);
    }
    return data;
  }

  private async getLastAuditLog(): Promise<AuditLog | null> {
    // TODO: 最新の監査ログ取得
    return null;
  }

  private async saveAuditLog(log: AuditLog): Promise<void> {
    // TODO: 監査ログの保存
    console.log('Saving audit log:', log);
  }

  private async getAuditLogs(fromDate: Date, toDate: Date): Promise<AuditLog[]> {
    // TODO: 監査ログの取得
    return [];
  }

  private async notifySecurityTeam(log: AuditLog): Promise<void> {
    // TODO: セキュリティチームへの通知
    console.log('Security notification:', log);
  }

  private async emergencyLog(action: string, userId: string, error: any): Promise<void> {
    // TODO: 緊急ログ記録
    console.error('Emergency log:', { action, userId, error });
  }

  private getCurrentIP(): string {
    // TODO: 実際のIPアドレス取得
    return '127.0.0.1';
  }

  private getUserAgent(): string {
    // TODO: 実際のUser-Agent取得
    return 'VoiceDrive/1.0';
  }

  private getSessionId(): string {
    // TODO: 実際のセッションID取得
    return crypto.randomUUID();
  }
}

// シングルトンインスタンスをエクスポート
export const complianceSecurityService = new ComplianceSecurityService();