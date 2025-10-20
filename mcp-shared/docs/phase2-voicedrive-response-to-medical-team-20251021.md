# Phase 2 顔写真統合 - VoiceDriveチームからの返信

**文書ID**: VD-RES-PHOTO-2025-001
**作成日**: 2025年10月21日
**宛先**: 医療職員管理システム（職位カルテシステム）開発チーム
**差出人**: VoiceDrive開発チーム
**件名**: 顔写真統合に関するご回答への返信と協力依頼

---

## 1. エグゼクティブサマリー

医療システムチーム様

顔写真統合に関する詳細なご回答、誠にありがとうございました。
貴チームからご提案いただいた**Option B（URL参照方式）**および**CloudFront CDN統合**について、VoiceDriveチームとして正式に採用することを決定いたしました。

本文書では以下の内容をご報告いたします：

1. ✅ Option B（URL参照方式）の正式採用
2. ✅ CloudFront CDN統合提案への賛同
3. ✅ VoiceDrive側の実装計画とスケジュール
4. 📝 貴チームへの協力依頼事項
5. 📅 10/30調整会議の議題確認

---

## 2. Option B（URL参照方式）の正式採用

### 2.1 採用理由

貴チームからのご回答を踏まえ、以下の理由により**Option B（URL参照方式）**を正式に採用いたします。

#### 理由1: 既存インフラの有効活用
- 既に300人分の顔写真がAWS S3に保存済み
- BLOB方式への移行は3-5日の追加工数が発生
- 既存のSharp処理ロジック（400x400 JPEG）をそのまま活用可能

#### 理由2: 運用コストの最適化
- CloudFront CDN導入により署名URL再生成の負荷を削減
- 永続的なURLで管理がシンプル
- 画像配信パフォーマンスの向上

#### 理由3: スケーラビリティ
- 将来的な職員数増加に柔軟に対応可能
- S3ストレージの拡張性
- CDNによる高速配信

### 2.2 データフロー確認

以下のデータフローで実装することを確認いたしました：

```
HR部門（入職時撮影）
  ↓
医療システム（Sharp処理: 400x400 JPEG, 品質85）
  ↓
AWS S3保存（medical-system-profile-photos Bucket）
  ↓
CloudFront CDN（永続URL生成）
  ↓
Webhook送信（profilePhotoUrl）
  ↓
VoiceDrive（URL保存 → Prisma User.profilePhotoUrl）
  ↓
Avatar表示（プロフィール、投稿UI、ヘッダー等）
```

### 2.3 VoiceDrive側のデータ保存方式

```typescript
// Prisma Userテーブルに以下のフィールドを追加
model User {
  // 既存フィールド...
  profilePhotoUrl       String?   // CloudFront CDN URL
  profilePhotoUpdatedAt DateTime? // 写真更新日時
}
```

**保存例**:
```
profilePhotoUrl: "https://d1234567890.cloudfront.net/employees/EMP-2025-001.jpg"
profilePhotoUpdatedAt: "2025-04-01T09:00:00Z"
```

---

## 3. CloudFront CDN統合提案への賛同

### 3.1 CloudFront導入のメリット確認

貴チームからご提案いただいたCloudFront CDN統合について、VoiceDriveチームとして以下のメリットを確認し、全面的に賛同いたします。

| メリット | 詳細 |
|---------|------|
| **永続的なURL** | 署名URL再生成（24時間ごと）が不要 |
| **配信パフォーマンス** | エッジロケーションからの高速配信 |
| **運用コスト削減** | 署名URL再生成処理の廃止 |
| **シンプルな管理** | URL更新不要、キャッシュ最適化 |

### 3.2 CORS設定について

VoiceDriveからCloudFront CDN経由で画像を読み込むため、以下のCORS設定をお願いいたします。

#### 必要なCORS設定（CloudFront Origin設定）

```json
{
  "AllowedOrigins": [
    "https://voicedrive.example.com",
    "http://localhost:3001"  // 開発環境用（テスト時のみ）
  ],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600,
  "ExposeHeaders": ["ETag"]
}
```

**開発環境URL**: `http://localhost:3001`（統合テスト時に使用）
**本番環境URL**: `https://voicedrive.example.com`（決定次第共有いたします）

### 3.3 Origin Access Control (OAC) 設定

貴チームが言及されていたOAC設定について、以下の点を確認させてください：

- ✅ CloudFront → S3間はOACで保護（一般公開なし）
- ✅ VoiceDrive → CloudFront間はHTTPS通信
- ✅ 不正アクセス防止のため、S3直接アクセスは拒否

この設定により、セキュリティとパフォーマンスの両立が実現できることを確認いたしました。

---

## 4. VoiceDrive側の実装計画

### 4.1 実装スケジュール

貴チームからご提示いただいた11月第1-3週のスケジュールに合わせ、VoiceDrive側も以下の計画で進めます。

#### Week 1（11月第1週: 11/4-11/8）
**VoiceDrive側の実装**

| 日程 | 作業内容 |
|-----|---------|
| 11/4-11/5 | Prismaスキーマ拡張、マイグレーション実行 |
| 11/6-11/7 | Webhook受信エンドポイント実装（HMAC署名検証） |
| 11/8 | Avatarコンポーネント修正（画像URL対応） |

#### Week 2（11月第2週: 11/11-11/15）
**統合テスト**

| 日程 | 作業内容 |
|-----|---------|
| 11/11-11/12 | Webhook疎通確認テスト（開発環境） |
| 11/13-11/14 | 3種類のWebhookイベントテスト |
| 11/15 | 既存300人のアカウントマッピング確認 |

**貴チームへの協力依頼**: 11/11-11/15にテスト環境でのWebhook送信をお願いいたします。

#### Week 3（11月第3週: 11/18-11/22）
**本番移行**

| 日程 | 作業内容 |
|-----|---------|
| 11/18-11/19 | 本番データベースマイグレーション |
| 11/20 | 既存300人分の一括Webhook受信 |
| 11/21 | 全ページでのAvatar表示確認 |
| 11/22 | 本番リリース |

**貴チームへの協力依頼**: 11/20に既存300人分の一括Webhook送信をお願いいたします。

### 4.2 実装内容詳細

#### 4.2.1 データベース拡張
**ファイル**: `prisma/schema.prisma`

```prisma
model User {
  id                    Int       @id @default(autoincrement())
  staffId               String    @unique
  fullName              String
  email                 String    @unique

  // 🆕 顔写真関連フィールド
  profilePhotoUrl       String?   // CloudFront CDN URL
  profilePhotoUpdatedAt DateTime? // 写真更新日時

  // その他既存フィールド...
}
```

#### 4.2.2 Webhook受信エンドポイント
**エンドポイント**: `POST /api/webhooks/medical-system/employee`

**セキュリティ実装**:
- ✅ HMAC-SHA256署名検証
- ✅ タイムスタンプ検証（5分以内のリクエストのみ受付）
- ✅ 環境変数での秘密鍵管理

**対応イベント**:
- `employee.created` - 新規アカウント作成 + 写真URL設定
- `employee.photo.updated` - 写真URL更新
- `employee.photo.deleted` - 写真URL削除（null設定）

#### 4.2.3 Avatarコンポーネント
**ファイル**: `src/components/common/Avatar.tsx`

**機能**:
- CloudFront URLから画像表示
- 画像読み込み失敗時はイニシャル表示にフォールバック
- レスポンシブサイズ対応（sm/md/lg/xl）

**使用箇所**:
- プロフィールページ
- 投稿カード（投稿者アイコン）
- ヘッダー（ユーザーアイコン）
- 設定ページ

### 4.3 コスト分析

#### VoiceDrive側の開発コスト
| 項目 | 工数 | 単価 | 小計 |
|-----|------|------|------|
| データベース拡張 | 2日 | ¥50,000/日 | ¥100,000 |
| Webhook実装 | 3日 | ¥50,000/日 | ¥150,000 |
| Avatarコンポーネント修正 | 1日 | ¥50,000/日 | ¥50,000 |
| 統合テスト | 3日 | ¥50,000/日 | ¥150,000 |
| 本番移行 | 2日 | ¥50,000/日 | ¥100,000 |
| **VD合計** | **11日** | - | **¥550,000** |

#### プロジェクト全体コスト
| チーム | 開発費 | 運用費/月 |
|--------|--------|----------|
| 医療システム | ¥260,000 | ¥500 |
| VoiceDrive | ¥550,000 | ¥0 |
| **合計** | **¥810,000** | **¥500** |

**VoiceDrive側の運用コスト**: ¥0/月
（理由: URL文字列のみ保存、300人 × 200バイト = 60KBで無視できるレベル）

---

## 5. 貴チームへの協力依頼事項

### 5.1 即座にご共有いただきたい情報

#### 1. Webhook Secret（秘密鍵）
**用途**: HMAC-SHA256署名検証用
**形式**: 64文字以上のランダム文字列推奨
**共有方法**: セキュアなチャネル（Slack DM、暗号化メール等）

**例**:
```
MEDICAL_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### 2. CloudFrontドメイン
**用途**: CORS設定、ホワイトリスト登録
**形式**: `https://d1234567890.cloudfront.net`

**期限**: 11/1（金）まで
**理由**: Week 1開始前に開発環境設定を完了させるため

#### 3. テスト用CloudFront URL
**用途**: 統合テスト時のサンプル画像URL
**形式**: `https://d1234567890.cloudfront.net/employees/TEST-001.jpg`

**期限**: 11/10（日）まで
**理由**: 11/11からの統合テストに使用するため

### 5.2 Week 2での協力依頼（11/11-11/15）

#### テスト環境でのWebhook送信
以下の3種類のイベントを、VoiceDriveのテスト環境に送信していただきたく存じます。

**VoiceDriveテスト環境URL**: `http://voicedrive-test.example.com/api/webhooks/medical-system/employee`
（決定次第共有いたします）

**テストケース**:

1. **employee.created** - 新規職員登録
```json
{
  "eventType": "employee.created",
  "staffId": "TEST-001",
  "fullName": "テスト太郎",
  "email": "test001@hospital.example.com",
  "profilePhotoUrl": "https://d1234567890.cloudfront.net/employees/TEST-001.jpg",
  "photoUpdatedAt": "2025-11-11T10:00:00Z"
}
```

2. **employee.photo.updated** - 写真更新
```json
{
  "eventType": "employee.photo.updated",
  "staffId": "TEST-001",
  "profilePhotoUrl": "https://d1234567890.cloudfront.net/employees/TEST-001-updated.jpg",
  "photoUpdatedAt": "2025-11-12T14:00:00Z"
}
```

3. **employee.photo.deleted** - 写真削除
```json
{
  "eventType": "employee.photo.deleted",
  "staffId": "TEST-001",
  "photoDeletedAt": "2025-11-13T09:00:00Z"
}
```

**協力依頼日時**: 11/11（月）10:00-17:00の間で数回送信
**VD側担当者**: Slackで立ち会い、リアルタイムで動作確認

### 5.3 Week 3での協力依頼（11/18-11/22）

#### 既存300人分の一括Webhook送信
**送信日時**: 11/20（水）14:00-17:00
**送信件数**: 約300件（全職員）
**送信間隔**: 1秒あたり5件程度（VoiceDrive側の処理能力を考慮）

**送信形式**:
```json
{
  "eventType": "employee.created",
  "staffId": "EMP-2024-001",
  "fullName": "山田太郎",
  "email": "yamada@hospital.example.com",
  "profilePhotoUrl": "https://d1234567890.cloudfront.net/employees/EMP-2024-001.jpg",
  "photoUpdatedAt": "2024-06-15T09:00:00Z"
}
```

**確認事項**:
- 既存のstaffIdとVoiceDriveのUserテーブルのstaffIdが一致することを事前確認
- 重複送信防止（VoiceDrive側でupsert処理を実装します）
- 送信エラー時のリトライ機構の動作確認

### 5.4 CloudFront CORS設定

以下のCORS設定を、CloudFront Distributionに適用していただきたく存じます。

**Origin Response Policy**:
```json
{
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
    "OriginOverride": true
  }
}
```

**設定完了期限**: 11/10（日）まで
**理由**: 11/11からの統合テストで画像読み込みを確認するため

### 5.5 Webhookリトライ機構の確認

貴チームのご回答では「リトライ機構を実装予定」とのことでしたが、以下の仕様を確認させてください。

**推奨仕様**:
- 初回送信失敗時: 1分後にリトライ
- 2回目失敗時: 5分後にリトライ
- 3回目失敗時: 30分後にリトライ
- 3回失敗後: アラート送信（Slack/メール）

**確認事項**:
- VoiceDrive側が500エラーを返した場合の処理
- ネットワークタイムアウト時の処理
- リトライ回数の上限

---

## 6. 10/30 調整会議の議題

### 6.1 会議情報
**日時**: 2025年10月30日（水）15:00-16:00
**場所**: オンライン（Zoom/Teams）
**参加者**:
- 医療システムチーム: リーダー、バックエンド担当者
- VoiceDriveチーム: リーダー、フロントエンド担当者、バックエンド担当者

### 6.2 議題

#### 1. Option B採用の最終確認（10分）
- データフロー確認
- CloudFront CDN統合の最終決定
- 費用負担の確認（¥810,000開発費、¥500/月運用費）

#### 2. 技術仕様の詳細確認（20分）
- Webhook仕様の最終確認（ペイロード形式、署名方式）
- CloudFront URL形式の確認
- CORS設定の詳細
- エラーハンドリング（リトライ機構、タイムアウト処理）

#### 3. スケジュール調整（15分）
- Week 1: 11/4-11/8の各チーム作業内容確認
- Week 2: 11/11-11/15の統合テスト日程調整
- Week 3: 11/20の一括送信日時確定

#### 4. 協力事項の確認（10分）
- Webhook Secret共有方法
- CloudFrontドメイン共有
- テスト用URL準備
- 統合テスト時の立ち会い担当者

#### 5. リスク管理（5分）
- スケジュール遅延時の対応
- 技術的問題発生時のエスカレーション経路
- 緊急連絡先の共有

### 6.3 事前準備依頼

**医療チーム様**:
- [ ] CloudFront CDNの技術検証結果
- [ ] Webhook Secret生成（案）
- [ ] リトライ機構の仕様書（ドラフト）

**VoiceDriveチーム**:
- [ ] Webhook受信エンドポイント仕様書
- [ ] テスト環境URL
- [ ] 統合テストシナリオ（ドラフト）

---

## 7. セキュリティ・プライバシー対応

### 7.1 HMAC署名検証（VoiceDrive側実装）

**実装内容**:
```typescript
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.MEDICAL_WEBHOOK_SECRET!;

function verifySignature(signature: string, timestamp: string, payload: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(timestamp + payload)
    .digest('hex');

  return signature === expectedSignature;
}
```

**検証項目**:
- ✅ HMAC-SHA256署名の照合
- ✅ タイムスタンプ検証（5分以内のリクエストのみ受付）
- ✅ 不正な署名は401エラーを返却

### 7.2 HTTPS通信の徹底

**通信経路**:
1. 医療システム → VoiceDrive Webhook: HTTPS
2. VoiceDrive → CloudFront CDN: HTTPS
3. CloudFront → S3: AWS内部（OAC保護）

**証明書**:
- VoiceDrive側: Let's Encrypt / AWS Certificate Manager
- CloudFront: AWS Certificate Manager（貴チーム管理）

### 7.3 GDPR/プライバシー対応（貴チーム実装内容の確認）

貴チームからのご回答で以下の対応を確認いたしました：

- ✅ 退職後5年間の保持期間
- ✅ 削除依頼から14日以内の削除
- ✅ 同意取得プロセス（入職時に顔写真使用同意書）

VoiceDrive側でも以下を実施いたします：
- ✅ `employee.photo.deleted` Webhook受信時の即時削除
- ✅ プライバシーポリシーへの顔写真使用明記
- ✅ ユーザーによる写真非表示設定機能（Phase 3で実装予定）

---

## 8. 期待される成果

### 8.1 ユーザー体験の向上

| 項目 | 改善内容 |
|-----|---------|
| **アカウント作成** | 入職時に顔写真付きアカウントが自動作成 |
| **プロフィール** | リアルな顔写真でユーザー識別が容易 |
| **投稿UI** | 投稿者の顔写真表示で親近感向上 |
| **組織の一体感** | 顔の見えるコミュニケーション促進 |

### 8.2 運用効率の向上

| 項目 | 改善内容 |
|-----|---------|
| **データ一元管理** | 医療システムが単一ソース、VDは参照のみ |
| **自動同期** | Webhook経由で手動更新不要 |
| **写真更新** | 医療側で更新すればVD側も自動反映 |

### 8.3 技術的メリット

| 項目 | 詳細 |
|-----|------|
| **パフォーマンス** | CloudFront CDNでグローバル高速配信 |
| **スケーラビリティ** | S3 + CloudFrontで職員数増加に柔軟対応 |
| **セキュリティ** | HMAC署名 + HTTPS + OACで多層防御 |

---

## 9. 次のアクション

### 9.1 即座に実施（10/21-10/25）

**医療チーム様**:
- [ ] Webhook Secret生成・共有
- [ ] CloudFrontドメイン共有
- [ ] 10/30調整会議の参加者確定

**VoiceDriveチーム**:
- [ ] テスト環境URL決定・共有
- [ ] Webhook受信エンドポイント仕様書の最終化
- [ ] 10/30調整会議の議題最終確認

### 9.2 10/30調整会議

- [ ] Option B採用の最終承認
- [ ] CloudFront統合の最終決定
- [ ] 技術仕様の詳細確認
- [ ] スケジュール確定
- [ ] 協力事項の合意

### 9.3 Week 1開始前（11/1-11/3）

**医療チーム様**:
- [ ] CloudFront CORS設定完了
- [ ] テスト用CloudFront URL準備
- [ ] Webhookリトライ機構実装完了

**VoiceDriveチーム**:
- [ ] 開発環境準備完了
- [ ] Prismaマイグレーション準備
- [ ] Webhook受信エンドポイント実装開始

---

## 10. 連絡先・エスカレーション経路

### 10.1 日常的な連絡
**Slack**: `#phase2-photo-integration`チャンネル
- 医療チーム担当者: @medical-backend-lead
- VoiceDriveチーム担当者: @voicedrive-backend-lead

### 10.2 技術的な質問
**メール**: tech-support@voicedrive.example.com
**対応時間**: 平日9:00-18:00（土日祝除く）
**応答時間**: 24時間以内

### 10.3 緊急時のエスカレーション
**重大障害時**:
- VoiceDriveチームリーダー: +81-90-XXXX-XXXX
- 医療チームリーダー: （10/30会議で共有）

**緊急時の定義**:
- 本番環境でのWebhook配信停止
- セキュリティインシデント発生
- データ損失の危険性

---

## 11. 添付資料

### 11.1 関連文書
1. ✅ [phase2-profile-photo-integration-inquiry-20251021.md](./phase2-profile-photo-integration-inquiry-20251021.md) - VDからの問い合わせ
2. ✅ [phase2-medical-system-response-photo-integration-20251021.md](./phase2-medical-system-response-photo-integration-20251021.md) - 医療チームからの回答
3. ✅ [phase2-voicedrive-implementation-plan-photo-integration-20251021.md](./phase2-voicedrive-implementation-plan-photo-integration-20251021.md) - VD側実装計画書（本文書と同時提出）

### 11.2 技術仕様書
- Webhook API仕様書（別紙）
- Prismaスキーマ変更仕様（別紙）
- Avatar コンポーネント仕様（別紙）

---

## 12. まとめ

医療システムチーム様からの詳細なご回答により、顔写真統合プロジェクトの実現可能性が大幅に向上いたしました。

**VoiceDriveチームの意思表明**:
- ✅ **Option B（URL参照方式）を正式採用**
- ✅ **CloudFront CDN統合に全面賛同**
- ✅ **11月第1-3週スケジュールに合意**
- ✅ **プロジェクト総費用（¥810,000開発費、¥500/月運用費）に合意**

**今後の進め方**:
1. 10/30調整会議で最終確認
2. 11月第1週から実装開始
3. 11月第2週に統合テスト
4. 11月第3週に本番リリース

貴チームとの緊密な連携により、医療職員にとって真に価値のある機能を実現できることを確信しております。

引き続き、何卒よろしくお願い申し上げます。

---

**差出人**:
VoiceDrive開発チーム
プロジェクトリーダー: [氏名]
バックエンド担当: [氏名]
フロントエンド担当: [氏名]

**連絡先**:
Email: team@voicedrive.example.com
Slack: #phase2-photo-integration

**作成日**: 2025年10月21日

---

## 付録: Webhook仕様クイックリファレンス

### エンドポイント
```
POST https://voicedrive.example.com/api/webhooks/medical-system/employee
```

### リクエストヘッダー
```
Content-Type: application/json
x-webhook-signature: <HMAC-SHA256 署名>
x-webhook-timestamp: <UnixタイムスタンプMilliseconds>
```

### employee.created ペイロード
```json
{
  "eventType": "employee.created",
  "staffId": "EMP-2025-001",
  "fullName": "山田太郎",
  "email": "yamada@hospital.example.com",
  "profilePhotoUrl": "https://d1234567890.cloudfront.net/employees/EMP-2025-001.jpg",
  "photoUpdatedAt": "2025-04-01T09:00:00Z"
}
```

### レスポンス（成功）
```json
{
  "success": true
}
```
**ステータスコード**: 200

### レスポンス（エラー）
```json
{
  "error": "Invalid signature"
}
```
**ステータスコード**: 401 / 400 / 500

---

**END OF DOCUMENT**
