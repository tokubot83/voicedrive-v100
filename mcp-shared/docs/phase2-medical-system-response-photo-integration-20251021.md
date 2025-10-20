# Phase 2 職員顔写真データ連携 - 医療システム確認結果

**文書番号**: MED-RESPONSE-PHASE2-PHOTO-2025-1021-001
**発信日**: 2025年10月21日
**発信元**: 医療職員カルテシステム開発チーム
**宛先**: VoiceDriveチーム
**件名**: Phase 2職員顔写真データ連携の仕様確認への回答

---

## 📋 確認事項への回答

VoiceDriveチーム様

Phase 2実装における職員顔写真データ連携の確認依頼をいただき、ありがとうございます。
各確認事項について、以下の通り回答いたします。

---

### 確認-1: 顔写真データの管理状況 🔴 **CRITICAL**

#### 質問1: 医療職員カルテシステムのデータベースに、職員の顔写真データは保存されていますか？

**回答**: ✅ **Option A: YES - すでに保存されている**

**詳細情報**:
- **テーブル名**: `Employee`
- **カラム名**: `profilePhotoUrl`
- **データ型**: `VARCHAR(500)` - **AWS S3のURLを保存**
- **画像形式**: `JPEG`（統一）
- **平均ファイルサイズ**: 約 **150-200KB**（400x400ピクセル、品質85%で圧縮済み）

**現在の保存方式**:
```
医療システム（入職時）
  ↓
AWS S3バケット（medical-system-profile-photos）に画像アップロード
  ↓
Employee.profilePhotoUrl = "https://s3-ap-northeast-1.amazonaws.com/.../EMP-2025-001.jpg"
```

**補足**:
- 現在、約300名の職員の顔写真がS3に保存されています
- すべて400x400ピクセル、JPEG形式で統一済み
- S3バケットはプライベート設定（署名付きURLでのみアクセス可能）

---

#### 質問2: 顔写真は誰が登録しますか？

**回答**: ✅ **人事部が入職時に撮影・登録**

**運用フロー**:
1. 入職日当日に人事部が職員証用写真を撮影
2. 医療システムの管理画面から画像をアップロード
3. 自動でリサイズ・圧縮処理（400x400、JPEG、85%品質）
4. AWS S3に保存、URLをEmployee.profilePhotoUrlに記録

**備考**:
- 職員による自己登録機能は現在未実装
- 将来的には職員自身での更新を検討中（Phase 4以降）

---

#### 質問3: 顔写真の更新頻度は？

**回答**: ✅ **複合運用**

- **入職時**: 必須（人事部が撮影・登録）
- **年1回の定期撮影**: 職員証更新時（毎年4月）
- **職員からの申請時**: 人事部への申請により随時更新可能

**更新統計**（過去1年間）:
- 入職時登録: 50件
- 定期更新: 280件（年1回）
- 申請による更新: 20件

---

### 確認-2: 共通DB（unified_staff_master）への保存方式

#### 質問1: 顔写真データを共通DBに追加することは可能ですか？

**回答**: ✅ **Option B: 外部URL方式を推奨します**

**理由**:

| 項目 | Option A (BLOB) | Option B (URL) | 判定 |
|------|----------------|---------------|------|
| **実装難易度** | 中（画像データ移行必要） | 低（URL参照のみ） | ✅ Option B |
| **パフォーマンス** | △（画像取得時にDB負荷） | ✅（CDN配信可能） | ✅ Option B |
| **バックアップ** | ✅（DB内で完結） | △（S3バックアップ別途必要） | △ 引き分け |
| **アクセス制御** | ✅（DB権限で管理） | ✅（S3署名付きURL） | △ 引き分け |
| **コスト** | ✅（Object Storage不要） | △（S3費用 ¥500/月） | ✅ Option A |
| **既存システムとの整合性** | △（既存S3から移行必要） | ✅（既存S3をそのまま活用） | ✅ **Option B** |

**最も重要な判断基準**: **既存システムとの整合性**
- 既にAWS S3に300名分の顔写真が保存されている
- BLOBに移行すると、既存S3データの移行作業が発生（約3-5日の追加工数）
- URLをそのまま参照する方式なら、移行作業不要

**推奨実装**:
```sql
ALTER TABLE unified_staff_master ADD COLUMN (
    profile_photo_url VARCHAR(500),        -- AWS S3のURL
    photo_uploaded_at TIMESTAMP,           -- アップロード日時
    photo_last_updated_at TIMESTAMP        -- 最終更新日時
);
```

**S3署名付きURL生成方式**:
```typescript
// 医療システム側でWebhook送信時に署名付きURL生成（有効期限24時間）
const signedUrl = s3.getSignedUrl('getObject', {
  Bucket: 'medical-system-profile-photos',
  Key: `employees/${employeeId}.jpg`,
  Expires: 86400 // 24時間
});
```

**VoiceDrive側での保存**:
- Webhook受信時に署名付きURLを受け取る
- VoiceDrive側で画像をダウンロードしてBase64に変換、User.avatarに保存
- または、署名付きURLを定期的に更新する仕組みを実装

**代替案（Option Bの改良版）**:
- 医療システム側でCloudFrontディストリビューションを設定
- 署名付きURLではなく、パブリックアクセス可能なCDN URLを使用
- アクセス制御はCloudFrontの署名付きCookieで実施
- この場合、署名付きURL再生成の手間が不要

---

### 確認-3: Webhook連携の仕様

#### 質問1: Webhook "employee.created" に顔写真データを追加することは可能ですか？

**回答**: ✅ **YES - 以下の形式で送信可能**

**提案1: 署名付きURL方式（推奨）**

```json
{
  "eventType": "employee.created",
  "timestamp": "2025-04-01T09:00:00Z",
  "data": {
    "staffId": "EMP-2025-001",
    "fullName": "山田太郎",
    "facilityId": "obara-hospital",
    "departmentId": "nursing-dept-01",
    "profilePhotoUrl": "https://s3-ap-northeast-1.amazonaws.com/medical-system-profile-photos/employees/EMP-2025-001.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "profilePhotoExpires": "2025-04-02T09:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 180000,
    "photoUploadedAt": "2025-04-01T09:00:00Z"
  }
}
```

**提案2: Base64エンコード方式（代替案）**

```json
{
  "eventType": "employee.created",
  "timestamp": "2025-04-01T09:00:00Z",
  "data": {
    "staffId": "EMP-2025-001",
    "fullName": "山田太郎",
    "profilePhotoBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 180000,
    "photoUploadedAt": "2025-04-01T09:00:00Z"
  }
}
```

**医療システムチームの推奨**: **提案1（署名付きURL方式）**

**理由**:
- ✅ Webhookペイロードサイズが小さい（URL文字列のみ）
- ✅ 既存S3インフラをそのまま活用
- ✅ 実装が容易（Base64エンコード不要）
- ✅ VoiceDrive側で画像ダウンロードのタイミングを制御可能

---

#### 質問2: Webhook ペイロードサイズの制限はありますか？

**回答**: ✅ **問題なし**

**現在の設定**:
- Webhookペイロード最大サイズ: **1MB**
- 顔写真Base64エンコード後: 約**270KB**（200KB × 1.37）
- **余裕あり**（1MB - 270KB = 730KB余剰）

**補足**:
- 提案1（署名付きURL方式）を採用する場合、ペイロードサイズは約**5KB**のみ
- Base64方式でも全く問題ありませんが、URL方式の方が効率的

---

#### 質問3: 新規Webhook "employee.photo.updated" の追加は可能ですか？

**回答**: ✅ **YES - 実装可能**

**実装方針**:
```json
{
  "eventType": "employee.photo.updated",
  "timestamp": "2025-10-21T10:00:00Z",
  "data": {
    "staffId": "EMP-2025-001",
    "profilePhotoUrl": "https://s3-ap-northeast-1.amazonaws.com/medical-system-profile-photos/employees/EMP-2025-001.jpg?X-Amz-Algorithm=...",
    "profilePhotoExpires": "2025-10-22T10:00:00Z",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 190000,
    "photoUploadedAt": "2025-10-21T10:00:00Z"
  }
}
```

**実装タイミング**:
- 人事部が医療システムで顔写真を更新した直後に自動送信
- リアルタイム通知（30秒以内）

**実装工数**: 1日（0.5日: Webhook送信処理、0.5日: テスト）

---

### 確認-4: 画像処理の実装

#### 質問1: 医療システム側で画像リサイズ処理は実装可能ですか？

**回答**: ✅ **YES - すでに実装済み**

**現在の実装**:
- **使用ライブラリ**: Sharp（Node.js）
- **処理仕様**:
  - サイズ: **400x400ピクセル**（アスペクト比維持、中央トリミング）
  - 形式: **JPEG**
  - 品質: **85%**
  - 最大ファイルサイズ: **200KB**（圧縮処理で調整）

**処理フロー**:
```typescript
import sharp from 'sharp';

const processProfilePhoto = async (inputBuffer: Buffer): Promise<Buffer> => {
  return await sharp(inputBuffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 85 })
    .toBuffer();
};
```

**補足**:
- すべての職員写真は既にこの仕様で統一されています
- VoiceDrive側で追加のリサイズ処理は不要です

---

#### 質問2: 使用可能な画像処理ライブラリはありますか？

**回答**: ✅ **Sharp（Node.js）**

**詳細**:
- バージョン: `sharp@0.33.5`
- パフォーマンス: 1枚あたり約50-100ms（400x400リサイズ + JPEG圧縮）
- メモリ使用量: 約10-20MB/枚

**その他の選択肢**:
- ImageMagick: 利用可能（ただしSharpより遅い）
- Pillow（Python）: 医療システムはNode.js環境のため未使用

---

### 確認-5: プライバシー・セキュリティ

#### 質問1: 顔写真データの取り扱いに関する社内規定はありますか？

**回答**: ✅ **YES - 規定あり**

**規定名**: 『医療法人厚生会 個人情報保護規程』（第3章 個人情報の取扱い、第15条 画像情報の管理）

**VoiceDriveチームが確認すべき内容**:
1. **保存期間**: 退職後5年間保持（労働基準法に準拠）
2. **アクセス権限**: 本人・人事部門・直属の上司のみ
3. **削除要求**: 本人からの削除要求があった場合、14日以内に削除
4. **第三者提供**: 禁止（本人の書面同意がある場合のみ例外）

**VoiceDrive側での遵守事項**:
- VoiceDrive User.avatar に保存された顔写真も、同じ保存期間・アクセス権限を適用
- 退職時のWebhook "employee.retired" を受信したら、5年後に自動削除するスケジュール設定
- 顔写真の外部サービス（OpenAI、Claude等）への送信は禁止

---

#### 質問2: 退職時の顔写真削除は自動実装されますか？

**回答**: ✅ **YES - Webhook "employee.retired" 送信時に共通DBから自動削除**

**実装方針**:

**医療システム側**:
```typescript
// 退職処理時（即時実行）
await db.employee.update({
  where: { employeeId },
  data: {
    employmentStatus: 'retired',
    retiredAt: new Date()
  }
});

// Webhook送信
await sendWebhook('employee.retired', {
  staffId: employeeId,
  retiredAt: new Date().toISOString()
});

// 5年後の削除スケジュール設定（労働基準法準拠）
await scheduleTask('delete_profile_photo', {
  employeeId,
  executeAt: addYears(new Date(), 5)
});
```

**VoiceDrive側**:
```typescript
// Webhook受信
webhookHandler.on('employee.retired', async (data) => {
  // 即座には削除しない（5年間保持）
  await db.user.update({
    where: { employeeId: data.staffId },
    data: {
      employmentStatus: 'retired',
      retiredAt: new Date(data.retiredAt),
      // avatar は保持（5年後に自動削除）
    }
  });

  // 5年後の削除スケジュール設定
  await scheduleTask('delete_avatar', {
    userId: user.id,
    executeAt: addYears(new Date(), 5)
  });
});
```

**補足**:
- 5年後の削除は、医療システム・VoiceDrive両方で自動実行
- 削除前に監査ログに記録

---

#### 質問3: GDPR・個人情報保護法への対応方針は？

**回答**: ✅ **以下の通り対応します**

**顔写真保持期間**:
- **現職職員**: 無期限（在職中）
- **退職職員**: **5年間**（退職日から起算）
- **削除要求時**: **14日以内**（本人からの要求があった場合）

**本人からの削除要求への対応**:
1. 職員が人事部に書面で削除要求を提出
2. 人事部が医療システムで削除処理を実行
3. 医療システムがAWS S3から画像を削除
4. Webhook "employee.photo.deleted" をVoiceDriveに送信
   ```json
   {
     "eventType": "employee.photo.deleted",
     "timestamp": "2025-10-21T10:00:00Z",
     "data": {
       "staffId": "EMP-2025-001",
       "deletionReason": "user_request",
       "deletedAt": "2025-10-21T10:00:00Z"
     }
   }
   ```
5. VoiceDrive側で User.avatar を即座に削除

**GDPR対応**:
- 現在、海外籍職員はいないが、将来的にEU国籍職員が在籍する場合はGDPR準拠
- データポータビリティ権の保障（職員が自分の顔写真データをダウンロード可能）

---

### 確認-6: 実装スケジュール

#### 質問1: Phase 2（11月実施予定）での顔写真連携実装は可能ですか？

**回答**: ✅ **YES - 以下のスケジュールで実装可能**

**実装スケジュール**:

| Week | 期間 | 医療システム側作業 | VoiceDrive側作業 |
|------|------|------------------|-----------------|
| **Week 1** | 11/4-11/8 | 共通DBテーブル拡張（`profile_photo_url` 追加）<br>S3署名付きURL生成機能実装<br>Webhook "employee.created" 修正 | User テーブル拡張（`avatar`, `avatarSource`）<br>Webhook受信処理修正（画像ダウンロード） |
| **Week 2** | 11/11-11/15 | Webhook "employee.photo.updated" 実装<br>Webhook "employee.photo.deleted" 実装 | Avatar コンポーネント修正（Base64画像表示）<br>画像ダウンロード処理実装 |
| **Week 3** | 11/18-11/22 | 統合テスト（300名の既存職員データ移行テスト）<br>パフォーマンステスト | 統合テスト（全UI表示確認）<br>パフォーマンステスト（画像読み込み速度） |

**備考**:
- Week 1で基本機能を実装完了
- Week 2で更新・削除機能を追加
- Week 3で既存300名分のデータ移行を実施

---

#### 質問2: 実装工数の見積もり

**回答**:

**医療システム側**:

| 作業項目 | 工数 | 内容 |
|---------|------|------|
| 共通DBテーブル拡張 | 0.5日 | `profile_photo_url` カラム追加、インデックス設定 |
| S3署名付きURL生成機能 | 1日 | AWS SDK実装、有効期限24時間設定 |
| Webhook "employee.created" 修正 | 1日 | 署名付きURLを追加 |
| Webhook "employee.photo.updated" | 1日 | 新規実装 |
| Webhook "employee.photo.deleted" | 0.5日 | 新規実装 |
| 統合テスト | 1日 | 300名分のデータ移行テスト |
| **合計** | **5日** | |

**VoiceDrive側** (VoiceDriveチーム見積もりを尊重):

| 作業項目 | 工数 | 内容 |
|---------|------|------|
| User テーブル拡張 | 0.5日 | `avatar`, `avatarSource`, `avatarMimeType` 追加 |
| Webhook受信処理修正 | 1日 | 顔写真ダウンロード、Base64保存 |
| Avatar コンポーネント修正 | 0.5日 | Base64画像を表示 |
| 統合テスト | 0.5日 | 全UI表示確認 |
| **合計** | **2.5日** | |

**総工数**: **7.5日**（医療システム5日 + VoiceDrive2.5日）

**必要な追加リソース**:
- 医療システム側: なし（既存チームで対応可能）
- VoiceDrive側: VoiceDriveチームの判断に委ねます

---

## 🎯 医療システムチームからの提案

### 提案1: CloudFrontディストリビューションの導入（推奨） 🆕

**背景**:
- 現在、S3署名付きURLは有効期限24時間
- VoiceDrive側で定期的にURL再生成が必要（運用負荷）

**提案内容**:
AWS CloudFrontディストリビューションを設定し、パブリックアクセス可能なCDN URLを使用する方式に変更します。

**メリット**:
- ✅ 署名付きURL再生成の運用負荷がゼロ
- ✅ 画像配信速度が向上（CDNキャッシュ）
- ✅ S3への直接アクセス削減（コスト削減）
- ✅ VoiceDrive側の実装がシンプル化

**実装方式**:
```
医療システム（入職時）
  ↓
AWS S3バケット（プライベート）に画像アップロード
  ↓
CloudFront経由でパブリックアクセス可能なURL生成
  ↓
Employee.profilePhotoUrl = "https://d1234567890.cloudfront.net/employees/EMP-2025-001.jpg"
  ↓
Webhook送信（署名付きURLではなく、CloudFront URL）
  ↓
VoiceDrive側で永続的に使用可能
```

**アクセス制御**:
- CloudFrontのOrigin Access Control (OAC)でS3バケットを保護
- 特定のIPアドレスからのアクセスのみ許可（医療システム + VoiceDrive）
- または、CloudFront署名付きCookieで認証（より厳格）

**実装工数**:
- CloudFront設定: 0.5日
- 既存S3バケットのCloudFront統合: 0.5日
- Webhook修正: 0.5日
- **合計**: 1.5日（医療システム側の追加工数）

**コスト**:
- CloudFront費用: 約¥300/月（300名 × 200KB × 10回/月 = 600MB転送）
- S3費用: 約¥200/月（既存と同じ）
- **合計**: 約¥500/月（元の見積もりと同じ）

**VoiceDriveチームへの確認事項**:
- CloudFront方式の採用可否
- 採用する場合、Week 1に医療システム側で実装完了

---

### 提案2: 段階的実装（代替案）

万が一、Week 1-3での実装が難しい場合の代替案です。

**Phase 2（11月）**: URL参照のみ実装
- 共通DBに `profile_photo_url` 追加
- Webhook "employee.created" にURL追加
- VoiceDrive側で署名付きURLをそのまま保存（24時間で期限切れ）

**Phase 3（12月）**: 画像ダウンロード・保存実装
- VoiceDrive側で画像をダウンロードしてBase64保存
- Avatar コンポーネントでBase64画像を表示

**Phase 4（1月）**: CloudFront統合（提案1を採用する場合）
- 医療システム側でCloudFront設定
- VoiceDrive側で永続的なCDN URL使用

---

## 📊 コスト見積もり（最終版）

### 開発コスト

| 項目 | 医療システム | VoiceDrive | 合計 |
|------|------------|-----------|------|
| **基本実装（Week 1-3）** | ¥200,000（5日） | ¥100,000（2.5日） | ¥300,000 |
| **CloudFront統合（提案1採用時）** | ¥60,000（1.5日） | ¥0 | ¥60,000 |
| **合計** | **¥260,000** | **¥100,000** | **¥360,000** |

### 運用コスト

| 項目 | 月額 |
|------|------|
| AWS S3（300名 × 200KB） | ¥200 |
| AWS CloudFront（600MB転送/月） | ¥300 |
| **合計** | **¥500/月** |

---

## 🎯 次のステップ

### 1. VoiceDriveチームからの回答（期限: 10月28日）

以下の点についてご回答をお願いします：

1. **Option B（外部URL方式）の採用可否** ✅ or ❌
2. **提案1（CloudFront統合）の採用可否** ✅ or ❌
3. **実装スケジュール（Week 1-3）の承認** ✅ or ❌

### 2. 合意形成ミーティング（提案）

**日時**: 2025年10月30日（水）15:00-16:00（1時間）

**参加者**:
- VoiceDriveチーム: プロジェクトリーダー、技術担当
- 医療職員カルテシステムチーム: プロジェクトリーダー、技術担当、インフラ担当

**議題**:
1. Option B（外部URL方式）の最終確認
2. CloudFront統合の採用可否
3. 実装スケジュールの確定
4. プライバシー・セキュリティ方針の合意
5. 300名の既存データ移行計画

### 3. 実装開始（承認後）

**Week 1（11/4-11/8）**: 基本実装
**Week 2（11/11-11/15）**: Webhook統合
**Week 3（11/18-11/22）**: 統合テスト + データ移行

---

## 📎 参考資料

### 医療システム側作成ドキュメント

1. **個人情報保護規程**
   - 『医療法人厚生会 個人情報保護規程』第3章 第15条

2. **AWS S3バケット仕様**
   - バケット名: `medical-system-profile-photos`
   - リージョン: `ap-northeast-1`（東京）
   - 暗号化: SSE-S3（AES-256）
   - バージョニング: 有効

3. **Sharpライブラリ実装例**
   - `src/utils/imageProcessor.ts`

4. **Webhook実装例**
   - `src/webhooks/employeeWebhooks.ts`

---

## 🙏 まとめ

VoiceDriveチーム様

Phase 2実装における職員顔写真データ連携について、詳細な確認結果をお送りいたします。

**主要な回答サマリー**:
- ✅ 顔写真データは既にAWS S3に保存済み（300名分）
- ✅ **Option B（外部URL方式）を推奨** - 既存S3インフラをそのまま活用
- ✅ **CloudFront統合を提案** - 署名付きURL再生成の運用負荷を削減
- ✅ Webhook "employee.photo.updated" / "employee.photo.deleted" 実装可能
- ✅ Week 1-3での実装スケジュール対応可能
- ✅ 総開発工数: 7.5日、開発費: ¥360,000、運用費: ¥500/月

ご不明点やご要望がございましたら、いつでもお知らせください。

引き続き、よろしくお願いいたします。

---

**医療職員カルテシステム開発チーム**
**連絡先**: Slack `#phase2-integration`
**発信日**: 2025年10月21日
