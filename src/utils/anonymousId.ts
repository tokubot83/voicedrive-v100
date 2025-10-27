import crypto from 'crypto';

/**
 * 匿名IDを生成する
 * 形式: ANON-YYYY-XXXXXX
 *
 * @returns 匿名ID（例: ANON-2025-A1B2C3）
 */
export function generateAnonymousId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('base64url');

  // SECRET_SALTがない場合はデフォルト値を使用（開発環境用）
  const salt = process.env.SECRET_SALT || 'default-salt-for-development';

  const hash = crypto
    .createHash('sha256')
    .update(`${timestamp}-${random}-${salt}`)
    .digest('base64url')
    .substring(0, 6);

  return `ANON-${new Date().getFullYear()}-${hash.toUpperCase()}`;
}

/**
 * 匿名IDの形式が正しいか検証する
 *
 * @param anonymousId - 検証する匿名ID
 * @returns 形式が正しい場合true
 */
export function validateAnonymousId(anonymousId: string): boolean {
  const pattern = /^ANON-\d{4}-[A-Z0-9]{6}$/;
  return pattern.test(anonymousId);
}
