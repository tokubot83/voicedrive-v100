// テスト実行用スクリプト
import { runIntegrationTests } from './test/integration/appeal-integration-test.js';

// 環境変数設定
process.env.VOICEDRIVE_API = 'http://localhost:5173';
process.env.MEDICAL_API = 'http://localhost:8080';
process.env.AUTH_TOKEN = 'test-token-12345';

console.log('🚀 統合テスト開始');
console.log('VoiceDrive API:', process.env.VOICEDRIVE_API);
console.log('Medical API:', process.env.MEDICAL_API);
console.log('');

runIntegrationTests().catch(console.error);