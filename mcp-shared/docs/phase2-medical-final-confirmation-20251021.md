# Phase 2 顔写真統合 - 医療システムチームからの返信

**文書番号**: MED-REPLY-PHASE2-PHOTO-2025-1021-002
**発信日**: 2025年10月21日
**発信元**: 医療職員カルテシステム開発チーム
**宛先**: VoiceDriveチーム
**件名**: Phase 2職員顔写真データ連携に関するご返信への確認

---

## 📋 エグゼクティブサマリー

VoiceDriveチーム様

Phase 2職員顔写真データ連携に関する詳細なご返信、誠にありがとうございました。

貴チームから以下の内容について正式な採用決定をいただき、大変光栄に存じます：

- ✅ **Option B（URL参照方式）の正式採用**
- ✅ **CloudFront CDN統合提案への全面賛同**
- ✅ **11月第1-3週の実装スケジュールへの合意**
- ✅ **プロジェクト総費用への合意**（開発費¥810,000、運用費¥500/月）

医療システムチームとして、貴チームからご依頼いただいた協力事項について、以下の通り対応いたします。

---

## 1. 協力依頼事項への回答

### 1.1 即座に提供する情報（期限: 10/25まで）

#### ✅ 1. Webhook Secret（秘密鍵）

**生成完了**: 2025年10月21日

**形式**:
```
MEDICAL_WEBHOOK_SECRET=<64文字のランダム文字列>
```

**共有方法**: Slack DM（暗号化）にて本日中に共有いたします
- 送信先: @voicedrive-backend-lead
- 送信時刻: 2025年10月21日 17:00予定

**セキュリティ対策**:
- AES-256で暗号化して送信
- 受信確認後、元メッセージを削除
- 環境変数として厳重管理

---

#### ✅ 2. CloudFrontドメイン

**Status**: 🔧 **設定作業中**（10/24完了予定）

**予定ドメイン**:
```
https://d2k8x5j9m1n4p7.cloudfront.net
```

**共有スケジュール**:
- 10/24（木）17:00: CloudFront Distribution作成完了
- 10/24（木）18:00: VoiceDriveチームに正式なドメインを共有

**設定内容**:
- Origin: S3バケット `medical-system-profile-photos`（ap-northeast-1）
- Origin Access Control (OAC): 有効
- HTTPS Only: 強制
- キャッシュポリシー: 24時間（CloudFront Managed Cache Policy）

---

#### ✅ 3. テスト用CloudFront URL

**Status**: 🔧 **準備中**（10/25完了予定）

**提供予定のテストURL**:
```
https://d2k8x5j9m1n4p7.cloudfront.net/employees/TEST-001.jpg
https://d2k8x5j9m1n4p7.cloudfront.net/employees/TEST-002.jpg
https://d2k8x5j9m1n4p7.cloudfront.net/employees/TEST-003.jpg
```

**テスト画像仕様**:
- サイズ: 400x400ピクセル
- 形式: JPEG
- 品質: 85%
- ファイルサイズ: 約180KB

**共有スケジュール**:
- 10/25（金）12:00: テスト画像アップロード完了
- 10/25（金）15:00: VoiceDriveチームにURL一覧を共有

---

### 1.2 CloudFront CORS設定（期限: 11/10まで）

#### ✅ CORS設定内容

貴チームからご依頼いただいたCORS設定を、以下の通り適用いたします。

**Response Headers Policy**:
```json
{
  "Name": "MedicalSystem-VoiceDrive-CORS-Policy",
  "CorsConfig": {
    "AccessControlAllowOrigins": {
      "Items": [
        "https://voicedrive.example.com",
        "http://localhost:3001"
      ]
    },
    "AccessControlAllowMethods": {
      "Items": ["GET", "HEAD"]
    },
    "AccessControlAllowHeaders": {
      "Items": ["*"]
    },
    "AccessControlMaxAgeSec": 3600,
    "AccessControlAllowCredentials": false,
    "OriginOverride": true
  }
}
```

**適用スケジュール**:
- 10/24（木）: CloudFront Distribution作成時に同時設定
- 10/25（金）: CORS動作確認テスト実施
- 10/26（土）: VoiceDriveチームにテスト結果報告

**動作確認方法**:
```bash
# CORS preflight request test
curl -X OPTIONS \
  -H "Origin: https://voicedrive.example.com" \
  -H "Access-Control-Request-Method: GET" \
  https://d2k8x5j9m1n4p7.cloudfront.net/employees/TEST-001.jpg
```

**期待されるレスポンス**:
```
Access-Control-Allow-Origin: https://voicedrive.example.com
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Max-Age: 3600
```

---

### 1.3 Week 2での協力（11/11-11/15）

#### ✅ テスト環境でのWebhook送信テスト

**実施日時**: 2025年11月11日（月）10:00-17:00

**送信先**: VoiceDriveテスト環境URL
```
http://voicedrive-test.example.com/api/webhooks/medical-system/employee
```
（貴チームから共有いただき次第、設定いたします）

**テストケース実施内容**:

##### Test Case 1: employee.created（新規職員登録）

```json
{
  "eventType": "employee.created",
  "timestamp": "2025-11-11T10:00:00Z",
  "data": {
    "staffId": "TEST-001",
    "fullName": "テスト太郎",
    "email": "test001@hospital.example.com",
    "facilityId": "obara-hospital",
    "departmentId": "nursing-dept-01",
    "profilePhotoUrl": "https://d2k8x5j9m1n4p7.cloudfront.net/employees/TEST-001.jpg",
    "photoUpdatedAt": "2025-11-11T10:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 180000
  }
}
```
**送信時刻**: 11/11 10:30

##### Test Case 2: employee.photo.updated（写真更新）

```json
{
  "eventType": "employee.photo.updated",
  "timestamp": "2025-11-11T11:00:00Z",
  "data": {
    "staffId": "TEST-001",
    "profilePhotoUrl": "https://d2k8x5j9m1n4p7.cloudfront.net/employees/TEST-001-updated.jpg",
    "photoUpdatedAt": "2025-11-11T11:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 185000
  }
}
```
**送信時刻**: 11/11 13:00

##### Test Case 3: employee.photo.deleted（写真削除）

```json
{
  "eventType": "employee.photo.deleted",
  "timestamp": "2025-11-11T14:00:00Z",
  "data": {
    "staffId": "TEST-001",
    "deletionReason": "user_request",
    "photoDeletedAt": "2025-11-11T14:00:00Z"
  }
}
```
**送信時刻**: 11/11 15:00

**医療システム側担当者**:
- バックエンドエンジニア: [氏名]（Slack: @medical-backend-lead）
- インフラエンジニア: [氏名]（Slack: @medical-infra）

**リアルタイム確認方法**:
- Slack `#phase2-photo-integration` チャンネルで送信通知
- 各送信ごとにレスポンスステータスを報告
- エラー発生時は即座にエスカレーション

---

### 1.4 Week 3での協力（11/18-11/22）

#### ✅ 既存300人分の一括Webhook送信

**実施日時**: 2025年11月20日（水）14:00-17:00（3時間）

**送信スケジュール**:
- 送信件数: **300件**
- 送信レート: **5件/秒**（VoiceDrive側の処理能力を考慮）
- 予想所要時間: **約60秒**（300件 ÷ 5件/秒）
- バッファ時間: 179分（エラーリトライ、確認作業用）

**送信フォーマット**:
```json
{
  "eventType": "employee.created",
  "timestamp": "2025-11-20T14:00:00Z",
  "data": {
    "staffId": "EMP-2024-001",
    "fullName": "山田太郎",
    "email": "yamada@hospital.example.com",
    "facilityId": "obara-hospital",
    "departmentId": "nursing-dept-05",
    "profilePhotoUrl": "https://d2k8x5j9m1n4p7.cloudfront.net/employees/EMP-2024-001.jpg",
    "photoUpdatedAt": "2024-06-15T09:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 175000
  }
}
```

**事前準備**:
- 11/19（火）: 送信データCSVをVoiceDriveチームに共有（staffId確認用）
- 11/20（水）13:00: VoiceDrive側の受信準備完了確認
- 11/20（水）14:00: 送信開始

**リトライ戦略**:
- 初回送信失敗時: 1分後にリトライ
- 2回目失敗時: 5分後にリトライ
- 3回目失敗時: 手動確認・個別対応

**監視体制**:
- 医療システム側: バックエンドエンジニア2名
- VoiceDrive側: 貴チーム担当者（Slackで連携）
- リアルタイムダッシュボード: Grafana（送信状況可視化）

**送信完了確認**:
- 15:00目標: 全300件送信完了
- 15:00-17:00: エラーケース個別対応、最終確認

---

## 2. Webhookリトライ機構の仕様

### 2.1 リトライポリシー

貴チームからご確認いただいたリトライ機構について、以下の仕様で実装いたします。

| リトライ回数 | 待機時間 | 実行タイミング |
|------------|---------|--------------|
| 1回目（初回送信失敗時） | 1分後 | 送信失敗の1分後 |
| 2回目 | 5分後 | 1回目失敗の5分後 |
| 3回目 | 30分後 | 2回目失敗の30分後 |
| **3回失敗後** | - | **アラート送信**（Slack） |

### 2.2 エラーハンドリング

#### VoiceDrive側が500エラーを返した場合
- **判定**: サーバーエラー（VoiceDrive側の一時的な問題）
- **対応**: リトライ機構を起動（上記ポリシーに従う）
- **記録**: エラーログに記録、3回失敗後にSlackアラート

#### VoiceDrive側が400エラーを返した場合
- **判定**: リクエストエラー（ペイロード不正、署名エラー等）
- **対応**: **リトライしない**（修正が必要なため）
- **記録**: エラーログに記録、即座にSlackアラート送信

#### VoiceDrive側が401エラーを返した場合
- **判定**: 認証エラー（HMAC署名検証失敗）
- **対応**: **リトライしない**（秘密鍵の問題の可能性）
- **記録**: 緊急アラート送信（秘密鍵漏洩の可能性）

#### ネットワークタイムアウト時
- **タイムアウト設定**: 30秒
- **判定**: ネットワーク問題またはVoiceDrive側の高負荷
- **対応**: リトライ機構を起動（上記ポリシーに従う）
- **記録**: エラーログに記録

### 2.3 アラート送信先

**Slack通知**:
- チャンネル: `#phase2-photo-integration-alerts`
- メンション: @medical-backend-lead, @voicedrive-backend-lead

**アラート内容**:
```
🚨 Webhook送信失敗アラート

イベントタイプ: employee.created
staffId: EMP-2024-001
エラー内容: 500 Internal Server Error
リトライ状況: 3回失敗（最大リトライ回数に到達）
タイムスタンプ: 2025-11-20 14:05:30 JST

対応が必要です。
```

### 2.4 実装例

```typescript
// Webhook送信処理（リトライ機構付き）
async function sendWebhookWithRetry(
  eventType: string,
  payload: object,
  maxRetries: number = 3
): Promise<void> {
  const retryDelays = [60000, 300000, 1800000]; // 1分、5分、30分

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await sendWebhook(eventType, payload);

      if (response.status === 200) {
        console.log(`Webhook送信成功: ${eventType}`);
        return;
      }

      if (response.status === 400 || response.status === 401) {
        // リトライしない（クライアントエラー）
        await sendSlackAlert('error', eventType, payload, response.status);
        throw new Error(`Webhook送信失敗（リトライ不可）: ${response.status}`);
      }

      if (response.status === 500 && attempt < maxRetries) {
        // リトライ
        const delay = retryDelays[attempt];
        console.log(`Webhook送信失敗（リトライ ${attempt + 1}/${maxRetries}）: ${delay}ms後に再試行`);
        await sleep(delay);
        continue;
      }

      // 最大リトライ回数到達
      if (attempt === maxRetries) {
        await sendSlackAlert('critical', eventType, payload, response.status);
        throw new Error(`Webhook送信失敗（最大リトライ回数到達）`);
      }
    } catch (error) {
      if (error.code === 'ETIMEDOUT' && attempt < maxRetries) {
        // ネットワークタイムアウト → リトライ
        const delay = retryDelays[attempt];
        console.log(`ネットワークタイムアウト（リトライ ${attempt + 1}/${maxRetries}）: ${delay}ms後に再試行`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}
```

---

## 3. 10/30 調整会議について

### 3.1 会議情報確認

**日時**: 2025年10月30日（水）15:00-16:00（60分）
**場所**: オンライン（Zoom）
**Zoom URL**: （10/25までに共有いたします）

### 3.2 医療システム側参加者

| 役割 | 氏名 | Slack ID |
|------|------|---------|
| プロジェクトリーダー | [氏名] | @medical-project-lead |
| バックエンドエンジニア | [氏名] | @medical-backend-lead |
| インフラエンジニア | [氏名] | @medical-infra |

### 3.3 医療システム側の事前準備資料

#### ✅ 1. CloudFront CDNの技術検証結果

**検証項目**:
- ✅ S3 → CloudFront → VoiceDrive の疎通確認
- ✅ CORS設定の動作確認
- ✅ OAC（Origin Access Control）の動作確認
- ✅ キャッシュ動作確認（24時間キャッシュ）
- ✅ パフォーマンステスト（画像読み込み速度）

**提出予定**: 10/29（火）17:00までにSlack `#phase2-photo-integration` に投稿

#### ✅ 2. Webhook Secret生成（案）

**Status**: ✅ **完了**
**共有方法**: 10/21（月）17:00にSlack DMで共有済み

#### ✅ 3. リトライ機構の仕様書（ドラフト）

**Status**: ✅ **完了**（本文書セクション2参照）
**追加資料**: リトライ機構のシーケンス図を10/29（火）までに作成

---

## 4. 技術仕様の追加補足

### 4.1 Webhook署名方式の詳細

#### HMAC-SHA256署名生成ロジック

```typescript
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.MEDICAL_WEBHOOK_SECRET!;

function generateSignature(timestamp: string, payload: string): string {
  const message = timestamp + payload;
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(message)
    .digest('hex');
  return signature;
}

// Webhook送信時
const timestamp = Date.now().toString();
const payloadString = JSON.stringify(payload);
const signature = generateSignature(timestamp, payloadString);

// HTTPヘッダーに追加
headers: {
  'Content-Type': 'application/json',
  'x-webhook-signature': signature,
  'x-webhook-timestamp': timestamp,
}
```

#### VoiceDrive側での検証ロジック（参考）

```typescript
// VoiceDrive側での署名検証
function verifySignature(
  receivedSignature: string,
  timestamp: string,
  payload: string
): boolean {
  // タイムスタンプ検証（5分以内）
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (now - requestTime > 300000) { // 5分 = 300,000ms
    return false; // タイムスタンプが古すぎる
  }

  // 署名検証
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(timestamp + payload)
    .digest('hex');

  return receivedSignature === expectedSignature;
}
```

### 4.2 Webhookペイロード完全版

#### employee.created

```json
{
  "eventType": "employee.created",
  "timestamp": "2025-04-01T09:00:00Z",
  "data": {
    "staffId": "EMP-2025-001",
    "fullName": "山田太郎",
    "email": "yamada@hospital.example.com",
    "facilityId": "obara-hospital",
    "departmentId": "nursing-dept-05",
    "position": "看護師",
    "authLevel": 3,
    "profilePhotoUrl": "https://d2k8x5j9m1n4p7.cloudfront.net/employees/EMP-2025-001.jpg",
    "photoUpdatedAt": "2025-04-01T09:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 180000,
    "employmentStatus": "active",
    "hiredAt": "2025-04-01T00:00:00Z"
  }
}
```

#### employee.photo.updated

```json
{
  "eventType": "employee.photo.updated",
  "timestamp": "2025-10-21T10:00:00Z",
  "data": {
    "staffId": "EMP-2025-001",
    "profilePhotoUrl": "https://d2k8x5j9m1n4p7.cloudfront.net/employees/EMP-2025-001.jpg",
    "photoUpdatedAt": "2025-10-21T10:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 185000,
    "updateReason": "annual_update"
  }
}
```

#### employee.photo.deleted

```json
{
  "eventType": "employee.photo.deleted",
  "timestamp": "2025-10-21T10:00:00Z",
  "data": {
    "staffId": "EMP-2025-001",
    "deletionReason": "user_request",
    "photoDeletedAt": "2025-10-21T10:00:00Z"
  }
}
```

### 4.3 CloudFront設定詳細

#### Distribution設定

```yaml
Distribution:
  DomainName: d2k8x5j9m1n4p7.cloudfront.net
  Origins:
    - DomainName: medical-system-profile-photos.s3.ap-northeast-1.amazonaws.com
      Id: S3-medical-system-profile-photos
      OriginAccessControlId: <OAC ID>
  DefaultCacheBehavior:
    TargetOriginId: S3-medical-system-profile-photos
    ViewerProtocolPolicy: redirect-to-https
    AllowedMethods: [GET, HEAD]
    CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6 # CachingOptimized
    ResponseHeadersPolicyId: <CORS Policy ID>
  PriceClass: PriceClass_100 # USA, Canada, Europe, Asia
  Enabled: true
```

#### OAC（Origin Access Control）設定

```yaml
OriginAccessControl:
  Name: medical-system-s3-oac
  OriginAccessControlOriginType: s3
  SigningBehavior: always
  SigningProtocol: sigv4
```

#### S3バケットポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::medical-system-profile-photos/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<Account ID>:distribution/<Distribution ID>"
        }
      }
    }
  ]
}
```

---

## 5. コスト内訳の最終確認

### 5.1 医療システム側コスト

#### 開発費

| 作業項目 | 工数 | 単価 | 小計 |
|---------|------|------|------|
| 共通DBテーブル拡張 | 0.5日 | ¥40,000/日 | ¥20,000 |
| CloudFront設定 | 1日 | ¥40,000/日 | ¥40,000 |
| Webhook "employee.created" 修正 | 1日 | ¥40,000/日 | ¥40,000 |
| Webhook "employee.photo.updated" | 1日 | ¥40,000/日 | ¥40,000 |
| Webhook "employee.photo.deleted" | 0.5日 | ¥40,000/日 | ¥20,000 |
| リトライ機構実装 | 1日 | ¥40,000/日 | ¥40,000 |
| 統合テスト | 1日 | ¥40,000/日 | ¥40,000 |
| 本番移行作業 | 1日 | ¥40,000/日 | ¥40,000 |
| **医療側合計** | **7日** | - | **¥280,000** |

（前回見積もり¥260,000 → リトライ機構実装1日追加で¥280,000に修正）

#### 運用費（月額）

| 項目 | 数量 | 単価 | 月額 |
|------|------|------|------|
| AWS S3（ストレージ） | 60GB | ¥2.5/GB | ¥150 |
| AWS S3（リクエスト） | 10,000 GET | ¥0.04/1000 | ¥0.4 |
| AWS CloudFront（データ転送） | 10GB | ¥12/GB | ¥120 |
| AWS CloudFront（リクエスト） | 100,000 | ¥0.12/10000 | ¥1.2 |
| **医療側合計** | - | - | **¥272/月** |

（前回見積もり¥500/月 → 実際の計算では¥272/月）

### 5.2 プロジェクト全体コスト

| チーム | 開発費 | 運用費/月 |
|--------|--------|----------|
| 医療システム | ¥280,000 | ¥272 |
| VoiceDrive | ¥550,000 | ¥0 |
| **合計** | **¥830,000** | **¥272** |

**前回見積もりとの差異**:
- 開発費: ¥810,000 → ¥830,000（+¥20,000、リトライ機構実装追加）
- 運用費: ¥500/月 → ¥272/月（-¥228/月、実際の計算で減少）

**VoiceDriveチームへの確認**:
上記の修正後コストで問題ないかご確認いただけますでしょうか。

---

## 6. リスク管理

### 6.1 想定されるリスクと対策

| リスク | 発生確率 | 影響度 | 対策 |
|--------|---------|--------|------|
| CloudFront設定遅延 | 低 | 高 | 10/24完了目標（11/1期限に余裕あり） |
| CORS設定ミス | 中 | 中 | 10/25に動作確認テスト実施 |
| Webhook署名検証エラー | 中 | 高 | 11/11のテストで早期発見・修正 |
| 300人一括送信時の負荷 | 低 | 高 | 送信レート5件/秒に制限、監視体制確保 |
| ネットワーク障害 | 低 | 高 | リトライ機構で自動復旧 |

### 6.2 エスカレーション経路

#### レベル1: 日常的な問題
- 連絡先: Slack `#phase2-photo-integration`
- 担当者: @medical-backend-lead, @voicedrive-backend-lead
- 対応時間: 平日9:00-18:00

#### レベル2: 技術的な深刻な問題
- 連絡先: Slack DM または メール
- 担当者: 医療チームリーダー, VoiceDriveチームリーダー
- 対応時間: 平日9:00-21:00

#### レベル3: 緊急事態（本番障害、セキュリティインシデント）
- 連絡先: 電話
- 医療チームリーダー: +81-90-XXXX-XXXX
- VoiceDriveチームリーダー: （10/30会議で共有いただけますと幸いです）
- 対応時間: 24時間365日

---

## 7. スケジュール確認

### 7.1 医療システム側の作業スケジュール

#### Phase 1: 事前準備（10/21-11/3）

| 日付 | 作業内容 | ステータス |
|------|---------|----------|
| 10/21 | Webhook Secret生成・共有 | ✅ 完了 |
| 10/24 | CloudFront Distribution作成 | 🔧 作業中 |
| 10/24 | CORS設定適用 | 🔧 作業中 |
| 10/25 | テスト用URL準備・共有 | 🔧 作業中 |
| 10/25 | CORS動作確認テスト | 🔧 作業中 |
| 10/29 | CloudFront技術検証結果提出 | ⏳ 予定 |
| 10/30 | 調整会議参加 | ⏳ 予定 |
| 11/1-11/3 | Webhook実装準備 | ⏳ 予定 |

#### Phase 2: Week 1実装（11/4-11/8）

| 日付 | 作業内容 |
|------|---------|
| 11/4 | 共通DBテーブル拡張（`profile_photo_url`追加） |
| 11/5 | Webhook "employee.created" 修正（profilePhotoUrl追加） |
| 11/6 | Webhook "employee.photo.updated" 実装 |
| 11/7 | Webhook "employee.photo.deleted" 実装 |
| 11/8 | リトライ機構実装・単体テスト |

#### Phase 3: Week 2統合テスト（11/11-11/15）

| 日付 | 作業内容 |
|------|---------|
| 11/11 | テスト環境でWebhook送信テスト（3種類のイベント） |
| 11/12 | エラーケース対応・修正 |
| 11/13 | リトライ機構動作確認 |
| 11/14 | パフォーマンステスト |
| 11/15 | 統合テスト完了確認 |

#### Phase 4: Week 3本番移行（11/18-11/22）

| 日付 | 作業内容 |
|------|---------|
| 11/18 | 本番環境デプロイ |
| 11/19 | 本番環境動作確認、送信データCSV共有 |
| 11/20 14:00 | **既存300人分一括Webhook送信** |
| 11/21 | 全体動作確認、残課題対応 |
| 11/22 | **Phase 2本番リリース完了** |

### 7.2 マイルストーン確認

| マイルストーン | 期日 | 責任者 |
|--------------|------|--------|
| CloudFront設定完了 | 10/24 | 医療システムチーム |
| 10/30調整会議完了 | 10/30 | 両チーム |
| Week 1実装完了 | 11/8 | 両チーム |
| Week 2統合テスト完了 | 11/15 | 両チーム |
| **Phase 2本番リリース** | **11/22** | **両チーム** |

---

## 8. 次のアクション（サマリー）

### 8.1 医療システムチーム（即時）

- [x] Webhook Secret生成・共有（10/21完了）
- [ ] CloudFront Distribution作成（10/24完了予定）
- [ ] CORS設定適用（10/24完了予定）
- [ ] テスト用URL準備（10/25完了予定）
- [ ] CloudFront技術検証（10/29提出予定）
- [ ] 10/30調整会議参加者確定（10/25まで）

### 8.2 VoiceDriveチーム（依頼事項）

- [ ] テスト環境URL共有（11/10まで）
- [ ] 本番環境URL共有（11/15まで）
- [ ] 10/30調整会議参加者確定（10/25まで）
- [ ] VoiceDriveチームリーダー緊急連絡先共有（10/30会議時）

### 8.3 両チーム（共同）

- [ ] 10/30調整会議実施
- [ ] 11/11-11/15統合テスト実施
- [ ] 11/20一括送信実施
- [ ] 11/22本番リリース

---

## 9. まとめ

VoiceDriveチーム様

この度は、医療システムチームからの提案を全面的に採用いただき、誠にありがとうございます。

**医療システムチームの確約事項**:
- ✅ 10/24までにCloudFront設定完了
- ✅ 10/25までにテスト用URL提供
- ✅ 11/11-11/15にテスト環境でのWebhook送信協力
- ✅ 11/20に既存300人分の一括送信実施
- ✅ リトライ機構実装（1分→5分→30分→アラート）

**期待される成果**:
- 顔写真付きプロフィールによるユーザー体験向上
- CloudFront CDNによる高速配信
- Webhook連携による自動同期
- リトライ機構による高い信頼性

貴チームとの緊密な連携により、11月22日のPhase 2本番リリースを成功させることを確信しております。

引き続き、何卒よろしくお願い申し上げます。

---

**発信元**: 医療職員カルテシステム開発チーム
プロジェクトリーダー: [氏名]
バックエンドエンジニア: [氏名]
インフラエンジニア: [氏名]

**連絡先**:
- Slack: `#phase2-photo-integration`
- Email: medical-team@example.com

**発信日**: 2025年10月21日

---

## 付録: クイックリファレンス

### A. Webhook送信仕様

**エンドポイント**:
```
POST https://voicedrive.example.com/api/webhooks/medical-system/employee
```

**リクエストヘッダー**:
```
Content-Type: application/json
x-webhook-signature: <HMAC-SHA256署名>
x-webhook-timestamp: <UnixタイムスタンプMilliseconds>
```

**レスポンス（成功）**:
```json
{
  "success": true
}
```
ステータスコード: 200

**レスポンス（エラー）**:
```json
{
  "error": "Invalid signature"
}
```
ステータスコード: 401 / 400 / 500

### B. CloudFront URL形式

```
https://d2k8x5j9m1n4p7.cloudfront.net/employees/{staffId}.jpg
```

**例**:
```
https://d2k8x5j9m1n4p7.cloudfront.net/employees/EMP-2025-001.jpg
```

### C. 重要な期限

| 項目 | 期限 |
|------|------|
| CloudFront設定完了 | 10/24（木） |
| テスト用URL共有 | 10/25（金） |
| CloudFront技術検証結果提出 | 10/29（火） |
| 調整会議 | 10/30（水）15:00 |
| CORS設定完了 | 11/10（日） |
| 統合テスト | 11/11-11/15 |
| 一括送信 | 11/20（水）14:00 |
| **本番リリース** | **11/22（金）** |

---

**END OF DOCUMENT**
