# エグゼクティブダッシュボード 認証情報連絡書

**文書番号**: ED-AUTH-2025-1019-001
**作成日**: 2025年10月19日
**作成者**: VoiceDriveチーム
**宛先**: 医療職員管理システムチーム
**件名**: エグゼクティブダッシュボードAPI認証情報の提供
**重要度**: 🔴 最高機密
**ステータス**: 認証情報発行完了

---

## 🔐 エグゼクティブサマリー

受領確認書（ED-RECEIPT-2025-1019-001）でご要望いただいた認証情報を発行しました。

本文書は**最高機密情報**を含むため、取り扱いには十分ご注意ください。

---

## 📋 認証情報一覧

### 1. Bearer Token（データ提供API用）

**用途**: データ提供API（`GET /api/v1/executive/dashboard-data`）の認証

**環境変数名**: `VOICEDRIVE_BEARER_TOKEN`

**トークン値**:
```
ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9
```

**使用方法**:
```typescript
// src/batch/executive-dashboard-fetch.ts

const response = await axios.get(
  `${process.env.VOICEDRIVE_API_URL}/api/v1/executive/dashboard-data`,
  {
    params: {
      period: currentPeriod,
      facilities: ['obara-hospital', 'tategami-rehabilitation']
    },
    headers: {
      'Authorization': `Bearer ${process.env.VOICEDRIVE_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  }
);
```

**セキュリティ要件**:
- ✅ 環境変数として設定（`.env.local`, AWS Secrets Manager）
- ✅ Gitリポジトリにコミットしない
- ✅ ローテーション: 3ヶ月ごと（次回: 2026年1月19日）

---

### 2. HMAC秘密鍵（分析結果受信API用）

**用途**: 分析結果受信API（`POST /api/v1/executive/strategic-insights`）の署名生成

**環境変数名**: `VOICEDRIVE_HMAC_SECRET`

**秘密鍵値**:
```
c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816
```

**使用方法**:
```typescript
// src/batch/executive-dashboard-send.ts

import crypto from 'crypto';

function generateHMACSignature(timestamp: number, body: string): string {
  const secret = process.env.VOICEDRIVE_HMAC_SECRET || '';
  const message = `${timestamp}.${body}`;

  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

// リクエスト送信
const timestamp = Math.floor(Date.now() / 1000);
const body = JSON.stringify(analysisData);
const signature = generateHMACSignature(timestamp, body);

await axios.post(
  `${process.env.VOICEDRIVE_API_URL}/api/v1/executive/strategic-insights`,
  analysisData,
  {
    headers: {
      'Content-Type': 'application/json',
      'X-HMAC-Signature': signature,
      'X-Timestamp': timestamp.toString()
    }
  }
);
```

**セキュリティ要件**:
- ✅ 環境変数として設定（`.env.local`, AWS Secrets Manager）
- ✅ Gitリポジトリにコミットしない
- ✅ ローテーション: 6ヶ月ごと（次回: 2026年4月19日）

---

### 3. エンドポイントURL

#### 開発環境

**URL**: `http://localhost:3001`

**用途**: ローカル開発・単体テスト

**起動方法**:
```bash
# VoiceDrive開発サーバー起動
cd /path/to/voicedrive-v100
npm run dev
```

**アクセス可能時間**: 開発時のみ（VoiceDriveチームが起動している間）

---

#### ステージング環境

**URL**: `https://voicedrive-staging.lightsail.aws`

**用途**: 統合テスト・Phase 3実施時

**稼働状況**: ⏳ Phase 1.6（Lightsail統合）完了後に稼働予定

**利用開始日**: 2025年11月15日（予定）

**注意事項**:
- ステージング環境は本番環境と同じデータベースを使用します
- テストデータの投入は慎重に行ってください

---

#### 本番環境

**URL**: `https://voicedrive.obara-hospital.jp`

**用途**: Phase 4暫定リリース以降の本番運用

**稼働開始日**: 2025年12月23日（予定）

**SLA**:
- 稼働率: 99.9%
- API応答時間: < 500ms（95%）

---

## 🔧 環境変数設定方法

### 開発環境（`.env.local`）

**ファイル**: `medical-system/.env.local`

```bash
# エグゼクティブダッシュボードAPI認証情報
VOICEDRIVE_API_URL=http://localhost:3001
VOICEDRIVE_BEARER_TOKEN=ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9
VOICEDRIVE_HMAC_SECRET=c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816
```

**セキュリティチェック**:
```bash
# .gitignoreに.env.localが含まれていることを確認
grep ".env.local" .gitignore
# 出力: .env.local
```

---

### ステージング環境（AWS Secrets Manager）

**手順**:

1. **AWS Secrets Managerにシークレット作成**

```bash
# AWS CLIでシークレット作成
aws secretsmanager create-secret \
  --name medical-system/executive-dashboard/staging \
  --description "エグゼクティブダッシュボードAPI認証情報（ステージング）" \
  --secret-string '{
    "VOICEDRIVE_API_URL": "https://voicedrive-staging.lightsail.aws",
    "VOICEDRIVE_BEARER_TOKEN": "ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9",
    "VOICEDRIVE_HMAC_SECRET": "c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816"
  }' \
  --region ap-northeast-1
```

2. **Lambda関数でシークレット取得**

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'ap-northeast-1' });

async function getSecrets() {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: 'medical-system/executive-dashboard/staging'
    })
  );

  const secrets = JSON.parse(response.SecretString || '{}');

  process.env.VOICEDRIVE_API_URL = secrets.VOICEDRIVE_API_URL;
  process.env.VOICEDRIVE_BEARER_TOKEN = secrets.VOICEDRIVE_BEARER_TOKEN;
  process.env.VOICEDRIVE_HMAC_SECRET = secrets.VOICEDRIVE_HMAC_SECRET;
}

// Lambda関数の最初に実行
await getSecrets();
```

---

### 本番環境（AWS Secrets Manager）

**手順**:

```bash
# AWS CLIでシークレット作成
aws secretsmanager create-secret \
  --name medical-system/executive-dashboard/production \
  --description "エグゼクティブダッシュボードAPI認証情報（本番）" \
  --secret-string '{
    "VOICEDRIVE_API_URL": "https://voicedrive.obara-hospital.jp",
    "VOICEDRIVE_BEARER_TOKEN": "ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9",
    "VOICEDRIVE_HMAC_SECRET": "c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816"
  }' \
  --region ap-northeast-1
```

**IAMポリシー**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:ap-northeast-1:*:secret:medical-system/executive-dashboard/*"
      ]
    }
  ]
}
```

---

## 🧪 テスト方法

### 1. データ提供APIのテスト

**cURL例**:

```bash
# 開発環境テスト
curl -X GET \
  'http://localhost:3001/api/v1/executive/dashboard-data?period=2025-10' \
  -H 'Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9' \
  -H 'Content-Type: application/json'
```

**期待レスポンス**:
```json
{
  "period": "2025-10",
  "generatedAt": "2025-10-19T10:30:00Z",
  "facilities": [
    {
      "facilityCode": "obara-hospital",
      "facilityName": "小原病院",
      "stats": {
        "totalPosts": 342,
        "agendaCreated": 85,
        ...
      }
    }
  ]
}
```

**エラーケース**:

```bash
# 認証エラー（トークン不正）
curl -X GET \
  'http://localhost:3001/api/v1/executive/dashboard-data?period=2025-10' \
  -H 'Authorization: Bearer invalid-token'

# レスポンス:
# {
#   "success": false,
#   "error": "Unauthorized",
#   "details": "Invalid authentication token"
# }
```

---

### 2. 分析結果受信APIのテスト

**Node.js例**:

```javascript
const crypto = require('crypto');
const axios = require('axios');

async function testStrategicInsightsAPI() {
  const HMAC_SECRET = 'c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816';
  const API_URL = 'http://localhost:3001';

  const data = {
    period: '2025-10',
    generatedAt: new Date().toISOString(),
    insights: [
      {
        insightType: 'priority_action',
        severity: 'high',
        title: 'テスト分析結果',
        analysis: 'これはテスト用の分析結果です。',
        rootCause: 'テスト',
        recommendedActions: ['テストアクション1', 'テストアクション2']
      }
    ]
  };

  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify(data);
  const message = `${timestamp}.${body}`;
  const signature = crypto.createHmac('sha256', HMAC_SECRET).update(message).digest('hex');

  try {
    const response = await axios.post(
      `${API_URL}/api/v1/executive/strategic-insights`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-HMAC-Signature': signature,
          'X-Timestamp': timestamp.toString()
        }
      }
    );

    console.log('✅ テスト成功:', response.data);
  } catch (error) {
    console.error('❌ テスト失敗:', error.response?.data || error.message);
  }
}

testStrategicInsightsAPI();
```

**期待レスポンス**:
```json
{
  "success": true,
  "message": "戦略分析結果を正常に受信しました",
  "receivedAt": "2025-10-19T10:30:00Z",
  "data": {
    "insightIds": ["insight-cuid-001"],
    "count": 1
  }
}
```

---

## 🔒 セキュリティガイドライン

### 認証情報の取り扱い

**禁止事項**:
- ❌ Gitリポジトリにコミット
- ❌ Slackパブリックチャンネルに投稿
- ❌ メールで送信
- ❌ ローカルファイルに平文保存（本番環境）

**推奨事項**:
- ✅ 環境変数として設定
- ✅ AWS Secrets Manager等のシークレット管理サービス使用
- ✅ アクセス権限を最小限に制限（担当者のみ）
- ✅ 定期的なローテーション（Bearer Token: 3ヶ月、HMAC: 6ヶ月）

---

### ローテーションスケジュール

| 認証情報 | 初回発行日 | 次回ローテーション日 | 頻度 |
|---------|----------|------------------|------|
| **Bearer Token** | 2025年10月19日 | 2026年1月19日 | 3ヶ月 |
| **HMAC秘密鍵** | 2025年10月19日 | 2026年4月19日 | 6ヶ月 |

**ローテーション手順**:

1. VoiceDriveチームが新しい認証情報を生成
2. 医療システムチームに通知（Slack DM）
3. 医療システムチームが新しい認証情報を設定
4. 動作確認後、旧認証情報を無効化

---

### アクセス権限管理

**アクセス許可対象者**:
- 医療システムチーム バックエンド担当（2名）
- 医療システムチーム インフラ担当（1名）

**AWS Secrets Manager IAMポリシー**:
- ユーザーグループ: `medical-system-backend-team`
- 許可アクション: `secretsmanager:GetSecretValue`
- リソース: `medical-system/executive-dashboard/*`

---

## 📞 サポート体制

### 認証エラー時の対応

**エラーケース1: 401 Unauthorized（Bearer Token不正）**

```json
{
  "success": false,
  "error": "Unauthorized",
  "details": "Invalid authentication token"
}
```

**対処法**:
1. 環境変数 `VOICEDRIVE_BEARER_TOKEN` が正しく設定されているか確認
2. トークン値が本文書の値と一致しているか確認
3. リクエストヘッダーが `Authorization: Bearer <token>` 形式か確認

---

**エラーケース2: 401 Unauthorized（HMAC署名不正）**

```json
{
  "success": false,
  "error": "Unauthorized",
  "details": "Invalid HMAC signature"
}
```

**対処法**:
1. 環境変数 `VOICEDRIVE_HMAC_SECRET` が正しく設定されているか確認
2. 署名計算方法が正しいか確認（`${timestamp}.${body}`）
3. タイムスタンプが5分以内か確認

---

**エラーケース3: 401 Unauthorized（タイムスタンプ期限切れ）**

```json
{
  "success": false,
  "error": "Unauthorized",
  "details": "Request timestamp is too old or invalid"
}
```

**対処法**:
1. サーバー時刻が正確か確認（NTP同期）
2. タイムスタンプ生成ロジックが正しいか確認（秒単位）

---

### 連絡先

**技術的な質問**:
- Slack: `#phase2-integration`
- 担当: VoiceDriveチーム プロジェクトリード

**緊急時**:
- Slack DM: VoiceDriveチーム担当者
- 対応時間: 平日 9:00-18:00

---

## 📝 ファイル保存場所

### MCPサーバー共有ファイル

**ファイルパス**:
```
mcp-shared/secrets/executive-dashboard-bearer-token.txt
mcp-shared/secrets/executive-dashboard-hmac-secret.txt
```

**アクセス方法**:
```bash
# 医療システムチーム側からアクセス
cat mcp-shared/secrets/executive-dashboard-bearer-token.txt
cat mcp-shared/secrets/executive-dashboard-hmac-secret.txt
```

**注意事項**:
- これらのファイルは `.gitignore` に追加済みのため、Gitにコミットされません
- ローカルファイルとして保持されます

---

## ✅ 受領確認

本認証情報連絡書を受領し、認証情報を安全に設定したことを確認してください。

**確認事項**:
- [ ] Bearer Token を環境変数に設定（開発環境）
- [ ] HMAC秘密鍵を環境変数に設定（開発環境）
- [ ] エンドポイントURLを環境変数に設定
- [ ] データ提供APIのテスト成功
- [ ] 分析結果受信APIのテスト成功
- [ ] `.env.local` が `.gitignore` に含まれていることを確認
- [ ] 認証情報をSlackパブリックチャンネルに投稿していないことを確認

**受領確認返信**:

以下のフォーマットでSlack `#phase2-integration` に返信してください。

```
✅ エグゼクティブダッシュボード認証情報を受領しました

- Bearer Token設定完了: ✅
- HMAC秘密鍵設定完了: ✅
- データ提供APIテスト: ✅ 成功
- 分析結果受信APIテスト: ✅ 成功
- セキュリティチェック: ✅ 完了

実装開始予定日: 2025年11月11日（月）
```

---

## 🎯 次のアクション

### 医療システムチーム（即座実行）

**期限**: 2025年10月26日（土）

**作業内容**:
1. [ ] 認証情報を開発環境に設定
2. [ ] データ提供APIのテスト実行
3. [ ] 分析結果受信APIのテスト実行
4. [ ] 受領確認をSlackに返信

---

### 両チーム合同（11月8日）

**キックオフミーティング**:
- 日時: 2025年11月8日（金）15:00-15:30
- 場所: Slack通話
- 議題: Phase 2実装開始前の最終確認

---

**認証情報を安全に管理し、2025年11月11日からの実装作業をスムーズに開始できるようご準備ください。**

**VoiceDriveチーム**
2025年10月19日

---

## 📎 付録

### A. 環境変数設定例（全環境）

#### 開発環境（`.env.local`）

```bash
# エグゼクティブダッシュボードAPI認証情報
VOICEDRIVE_API_URL=http://localhost:3001
VOICEDRIVE_BEARER_TOKEN=ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9
VOICEDRIVE_HMAC_SECRET=c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816
```

#### ステージング環境（AWS Secrets Manager）

**シークレット名**: `medical-system/executive-dashboard/staging`

```json
{
  "VOICEDRIVE_API_URL": "https://voicedrive-staging.lightsail.aws",
  "VOICEDRIVE_BEARER_TOKEN": "ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9",
  "VOICEDRIVE_HMAC_SECRET": "c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816"
}
```

#### 本番環境（AWS Secrets Manager）

**シークレット名**: `medical-system/executive-dashboard/production`

```json
{
  "VOICEDRIVE_API_URL": "https://voicedrive.obara-hospital.jp",
  "VOICEDRIVE_BEARER_TOKEN": "ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9",
  "VOICEDRIVE_HMAC_SECRET": "c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816"
}
```

---

### B. テストスクリプト完全版

**ファイル**: `test-executive-dashboard-api.js`

```javascript
const crypto = require('crypto');
const axios = require('axios');

// 認証情報（.env.localから取得）
const API_URL = process.env.VOICEDRIVE_API_URL || 'http://localhost:3001';
const BEARER_TOKEN = process.env.VOICEDRIVE_BEARER_TOKEN;
const HMAC_SECRET = process.env.VOICEDRIVE_HMAC_SECRET;

async function testDataFetchAPI() {
  console.log('\n📊 テスト1: データ提供API（GET /api/v1/executive/dashboard-data）\n');

  try {
    const response = await axios.get(
      `${API_URL}/api/v1/executive/dashboard-data`,
      {
        params: {
          period: '2025-10',
          facilities: ['obara-hospital']
        },
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ データ取得成功');
    console.log(`   - 期間: ${response.data.period}`);
    console.log(`   - 施設数: ${response.data.facilities.length}`);
    console.log(`   - 総投稿数: ${response.data.facilities.reduce((sum, f) => sum + f.stats.totalPosts, 0)}`);
    console.log(`   - レスポンス時間: ${response.headers['x-response-time'] || 'N/A'}`);

    return true;
  } catch (error) {
    console.error('❌ データ取得失敗');
    console.error(`   - ステータスコード: ${error.response?.status}`);
    console.error(`   - エラー: ${error.response?.data?.error || error.message}`);
    console.error(`   - 詳細: ${error.response?.data?.details || 'N/A'}`);

    return false;
  }
}

async function testStrategicInsightsAPI() {
  console.log('\n🧠 テスト2: 分析結果受信API（POST /api/v1/executive/strategic-insights）\n');

  const data = {
    period: '2025-10',
    generatedAt: new Date().toISOString(),
    insights: [
      {
        insightType: 'priority_action',
        severity: 'high',
        title: 'テスト分析結果',
        analysis: 'これはテスト用の分析結果です。医療システム側のバッチ処理が正常に動作していることを確認します。',
        rootCause: 'テスト実行',
        recommendedActions: [
          'テストアクション1: データ取得バッチの動作確認',
          'テストアクション2: HMAC署名の正常性確認'
        ]
      }
    ]
  };

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify(data);
    const message = `${timestamp}.${body}`;
    const signature = crypto.createHmac('sha256', HMAC_SECRET).update(message).digest('hex');

    const response = await axios.post(
      `${API_URL}/api/v1/executive/strategic-insights`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-HMAC-Signature': signature,
          'X-Timestamp': timestamp.toString()
        },
        timeout: 30000
      }
    );

    console.log('✅ 分析結果送信成功');
    console.log(`   - 受信ID: ${response.data.data.insightIds[0]}`);
    console.log(`   - 件数: ${response.data.data.count}`);
    console.log(`   - 受信日時: ${response.data.receivedAt}`);

    return true;
  } catch (error) {
    console.error('❌ 分析結果送信失敗');
    console.error(`   - ステータスコード: ${error.response?.status}`);
    console.error(`   - エラー: ${error.response?.data?.error || error.message}`);
    console.error(`   - 詳細: ${error.response?.data?.details || 'N/A'}`);

    return false;
  }
}

async function runAllTests() {
  console.log('🚀 エグゼクティブダッシュボードAPI統合テスト開始\n');
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Bearer Token: ${BEARER_TOKEN ? '設定済み' : '未設定'}`);
  console.log(`   HMAC Secret: ${HMAC_SECRET ? '設定済み' : '未設定'}`);

  if (!BEARER_TOKEN || !HMAC_SECRET) {
    console.error('\n❌ 環境変数が設定されていません');
    console.error('   .env.localに以下を設定してください:');
    console.error('   - VOICEDRIVE_BEARER_TOKEN');
    console.error('   - VOICEDRIVE_HMAC_SECRET');
    process.exit(1);
  }

  const test1 = await testDataFetchAPI();
  const test2 = await testStrategicInsightsAPI();

  console.log('\n📊 テスト結果サマリー\n');
  console.log(`   データ提供API: ${test1 ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`   分析結果受信API: ${test2 ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`   総合結果: ${test1 && test2 ? '✅ 全テスト成功' : '❌ テスト失敗'}\n`);

  process.exit(test1 && test2 ? 0 : 1);
}

runAllTests();
```

**実行方法**:

```bash
# 環境変数設定
export VOICEDRIVE_API_URL=http://localhost:3001
export VOICEDRIVE_BEARER_TOKEN=ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9
export VOICEDRIVE_HMAC_SECRET=c341228b46f528632f6ee02177dbef84ce836d632e9813652128d0c3bc52113f9291b6418bccd169ae2aa95a41bd6ccab71cbc01807d411b91f295bf91a27816

# テスト実行
node test-executive-dashboard-api.js
```

---

**本文書は最高機密情報を含みます。認証情報の取り扱いには十分ご注意ください。**
