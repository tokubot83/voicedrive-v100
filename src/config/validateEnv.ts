/**
 * 環境変数バリデーション
 *
 * アプリケーション起動時に必須環境変数をチェックし、
 * 設定ミスを早期発見します。
 *
 * @module validateEnv
 */

interface EnvVarConfig {
  required: boolean;
  validate?: (value: string) => boolean;
  description: string;
}

interface EnvConfig {
  [key: string]: EnvVarConfig;
}

/**
 * 環境変数設定
 */
const envConfig: EnvConfig = {
  // データベース接続（必須）
  DATABASE_URL: {
    required: true,
    validate: (value) => {
      // SQLiteまたはMySQLの接続文字列を許可
      return value.startsWith('file:') ||
             value.startsWith('mysql://') ||
             value.startsWith('postgresql://');
    },
    description: 'データベース接続URL（MySQL推奨）'
  },

  // JWT認証（本番環境では必須）
  JWT_SECRET: {
    required: process.env.NODE_ENV === 'production',
    validate: (value) => value.length >= 32,
    description: 'JWT署名用シークレットキー（最低32文字）'
  },

  // Analytics API用（本番環境では必須）
  ANALYTICS_ALLOWED_IPS: {
    required: process.env.NODE_ENV === 'production',
    validate: (value) => {
      const ips = value.split(',').filter(Boolean);
      return ips.length > 0;
    },
    description: '職員カルテシステムのIPホワイトリスト'
  },

  // VoiceDrive API認証（本番環境では必須）
  VOICEDRIVE_API_TOKEN: {
    required: process.env.NODE_ENV === 'production',
    validate: (value) => value.length >= 20,
    description: 'VoiceDrive API認証トークン'
  },

  // LLM API設定（開発環境ではオプショナル）
  LLM_API_ENDPOINT: {
    required: false,
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    description: 'LLMモデレーションAPIエンドポイント'
  }
};

/**
 * 環境変数をバリデーション
 *
 * 問題がある場合は起動を中止します。
 *
 * @throws {Error} 環境変数の設定に問題がある場合
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(envConfig)) {
    const value = process.env[key];

    // 必須チェック
    if (config.required && !value) {
      errors.push(`❌ 必須環境変数が未設定: ${key}\n   説明: ${config.description}`);
      continue;
    }

    // 値が設定されている場合のバリデーション
    if (value && config.validate) {
      if (!config.validate(value)) {
        errors.push(
          `❌ 環境変数の値が不正: ${key}\n   説明: ${config.description}\n   現在値: ${value.substring(0, 20)}...`
        );
      }
    }

    // オプション項目で未設定の場合は警告
    if (!config.required && !value) {
      warnings.push(`⚠️  オプション環境変数が未設定: ${key}\n   説明: ${config.description}`);
    }
  }

  // 警告を表示（起動は継続）
  if (warnings.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  環境変数の警告');
    console.log('='.repeat(80));
    warnings.forEach(warning => console.log(warning));
    console.log('='.repeat(80) + '\n');
  }

  // エラーがあれば起動を中止
  if (errors.length > 0) {
    console.error('\n' + '='.repeat(80));
    console.error('🚨 環境変数の設定に問題があります');
    console.error('='.repeat(80));
    errors.forEach(error => console.error(error));
    console.error('='.repeat(80));
    console.error('📖 .env.example を参考に環境変数を設定してください');
    console.error('='.repeat(80) + '\n');

    throw new Error('環境変数の設定エラー');
  }

  console.log('✅ 環境変数チェック完了');
}

/**
 * 環境変数の状態を取得（デバッグ用）
 */
export function getEnvironmentStatus(): {
  configured: string[];
  missing: string[];
  invalid: string[];
} {
  const configured: string[] = [];
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const [key, config] of Object.entries(envConfig)) {
    const value = process.env[key];

    if (!value) {
      if (config.required) {
        missing.push(key);
      }
      continue;
    }

    if (config.validate && !config.validate(value)) {
      invalid.push(key);
      continue;
    }

    configured.push(key);
  }

  return { configured, missing, invalid };
}

export default validateEnvironment;
