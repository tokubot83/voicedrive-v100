import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * 暗号化キーを取得する
 * 環境変数から取得、なければデフォルト値（開発環境用）
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;

  if (!keyHex) {
    console.warn('ENCRYPTION_KEY環境変数が設定されていません。デフォルトキーを使用します（開発環境のみ）');
    // 開発環境用のデフォルトキー（32バイト = 64文字の16進数）
    const defaultKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    return Buffer.from(defaultKey, 'hex');
  }

  if (keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEYは64文字の16進数である必要があります');
  }

  return Buffer.from(keyHex, 'hex');
}

/**
 * 連絡先情報を暗号化する
 *
 * @param contactInfo - 暗号化する連絡先情報
 * @returns 暗号化されたデータ（形式: iv:encrypted:authTag）
 */
export function encryptContactInfo(contactInfo: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(contactInfo, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // IV + 暗号文 + 認証タグを連結して返す
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

/**
 * 暗号化された連絡先情報を復号化する
 *
 * @param encryptedData - 暗号化されたデータ
 * @returns 復号化された連絡先情報
 */
export function decryptContactInfo(encryptedData: string): string {
  const key = getEncryptionKey();
  const [ivHex, encryptedHex, authTagHex] = encryptedData.split(':');

  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error('暗号化データの形式が正しくありません');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * 暗号化キーを生成する（セットアップ用）
 * コマンドラインで実行: node -e "require('./src/utils/encryption').generateEncryptionKey()"
 */
export function generateEncryptionKey(): void {
  const key = crypto.randomBytes(32).toString('hex');
  console.log('生成された暗号化キー（.envに設定してください）:');
  console.log(`ENCRYPTION_KEY=${key}`);
}
