// テスト環境変数の設定
const { config } = require('dotenv');
const { join } = require('path');

// テスト用環境変数を読み込み
config({ path: join(__dirname, '.env.test') });