/**
 * テスト用JWT生成スクリプト
 * 職員カルテシステムとの統合テスト用のJWTトークンを生成します
 *
 * 使用方法:
 *   npm run generate:jwt
 *   npm run generate:jwt -- --days 30
 *   npm run generate:jwt -- --output mcp-shared/config/test-jwt-token.txt
 *
 * @version 1.0.0
 * @date 2025-10-09
 */

import jwt from 'jsonwebtoken';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// コマンドライン引数の解析
const args = process.argv.slice(2);
const getDaysArg = (): number => {
  const daysIndex = args.indexOf('--days');
  if (daysIndex !== -1 && args[daysIndex + 1]) {
    return parseInt(args[daysIndex + 1], 10);
  }
  return 365; // デフォルト: 365日
};

const getOutputArg = (): string | null => {
  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    return args[outputIndex + 1];
  }
  return null;
};

const days = getDaysArg();
const outputPath = getOutputArg();

// JWT生成設定
const JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret-2025';

// ペイロード（統合テストで使用されたもの）
const payload = {
  staffId: 'analytics-system-test',
  email: 'analytics@test.com',
  accountLevel: 99, // 最高レベル（管理者相当）
  facility: 'medical-staff-system',
  department: 'analytics',
  role: 'system',
  permissions: [
    'analytics:read',
    'analytics:write',
    'analytics:aggregated-stats:read',
    'analytics:group-data:write'
  ]
};

// トークン生成オプション
const options = {
  expiresIn: `${days}d`, // 有効期限（日数指定）
  issuer: 'voicedrive-api',
  audience: 'medical-staff-system'
};

// JWT生成
const token = jwt.sign(payload, JWT_SECRET, options);

// トークン情報の取得
const decoded = jwt.decode(token, { complete: true }) as any;
const expiresAt = new Date(decoded.payload.exp * 1000);
const issuedAt = new Date(decoded.payload.iat * 1000);

// 結果表示
console.log('');
console.log('='.repeat(80));
console.log('🔐 VoiceDrive Analytics API - Test JWT Token');
console.log('='.repeat(80));
console.log('');
console.log('📋 Token Information:');
console.log('  Staff ID:', payload.staffId);
console.log('  Email:', payload.email);
console.log('  Account Level:', payload.accountLevel);
console.log('  Facility:', payload.facility);
console.log('  Department:', payload.department);
console.log('  Role:', payload.role);
console.log('');
console.log('📅 Validity Period:');
console.log('  Issued At:', issuedAt.toISOString());
console.log('  Expires At:', expiresAt.toISOString());
console.log('  Valid Days:', days);
console.log('');
console.log('🔑 JWT Token:');
console.log('  ' + token);
console.log('');
console.log('🔧 Usage Example (curl):');
console.log('');
console.log('  # ヘルスチェック（認証不要）');
console.log('  curl http://localhost:4000/health');
console.log('');
console.log('  # 集計データ取得');
console.log('  curl -H "Authorization: Bearer ' + token.substring(0, 30) + '..." \\');
console.log('    "http://localhost:4000/api/v1/analytics/aggregated-stats?startDate=2025-09-01&endDate=2025-09-30"');
console.log('');
console.log('  # 分析データ送信');
console.log('  curl -X POST -H "Authorization: Bearer ' + token.substring(0, 30) + '..." \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d \'{"analysisDate":"2025-10-09","period":{...}}\' \\');
console.log('    http://localhost:4000/api/v1/analytics/group-data');
console.log('');
console.log('📝 Environment Variable Setup:');
console.log('');
console.log('  # .env.voicedrive.test (職員カルテ側)');
console.log('  VOICEDRIVE_JWT_TOKEN=' + token);
console.log('  VOICEDRIVE_ANALYTICS_API_URL=http://localhost:4000');
console.log('');
console.log('='.repeat(80));
console.log('');

// ファイル出力
if (outputPath) {
  const fullPath = resolve(process.cwd(), outputPath);
  const content = `# VoiceDrive Analytics API - Test JWT Token
# Generated: ${new Date().toISOString()}
# Expires: ${expiresAt.toISOString()}
# Valid Days: ${days}

# Token
${token}

# Usage Example
# curl -H "Authorization: Bearer ${token}" \\
#   "http://localhost:4000/api/v1/analytics/aggregated-stats?startDate=2025-09-01&endDate=2025-09-30"

# Environment Variable
VOICEDRIVE_JWT_TOKEN=${token}
VOICEDRIVE_ANALYTICS_API_URL=http://localhost:4000
`;

  writeFileSync(fullPath, content, 'utf-8');
  console.log('✅ Token saved to:', fullPath);
  console.log('');
}

// トークン検証テスト
try {
  const verified = jwt.verify(token, JWT_SECRET) as any;
  console.log('✅ Token verification: PASSED');
  console.log('   Verified Staff ID:', verified.staffId);
  console.log('   Verified Account Level:', verified.accountLevel);
  console.log('');
} catch (error) {
  console.error('❌ Token verification: FAILED');
  console.error('   Error:', error instanceof Error ? error.message : error);
  console.log('');
  process.exit(1);
}

console.log('🎉 JWT Token generated successfully!');
console.log('');
