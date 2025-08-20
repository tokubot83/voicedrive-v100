// V3統合テスト実行用スクリプト
import { runV3IntegrationTests } from './test/integration/appeal-integration-test-v3.js';

// V3環境変数設定
process.env.VOICEDRIVE_API = 'http://localhost:5173';
process.env.MEDICAL_API = 'http://localhost:8080';  // MCPサーバー経由でV3 API
process.env.AUTH_TOKEN = 'test-token-12345';

console.log('🚀 V3統合テスト開始');
console.log('システム: V3評価システム（100点満点・7段階グレード）');
console.log('VoiceDrive API:', process.env.VOICEDRIVE_API);
console.log('Medical V3 API:', process.env.MEDICAL_API);
console.log('');

runV3IntegrationTests().catch(console.error);