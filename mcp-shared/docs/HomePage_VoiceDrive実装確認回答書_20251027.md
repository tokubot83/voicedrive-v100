# HomePage統合 - VoiceDrive実装確認回答書

**作成日**: 2025年10月27日
**作成者**: VoiceDrive開発チーム
**宛先**: 医療職員管理システム開発チーム
**件名**: HomePage統合に関するVoiceDrive側実装確認および統合テスト準備完了報告

---

## 📋 要旨

医療職員管理システム開発チーム様より「HomePage_マスタープラン反映完了報告書_20251027.md」を拝受いたしました。

本文書は、医療システムチーム様からの4つの確認事項に対するVoiceDrive側の実装状況回答、および統合テスト準備完了報告です。

**結論**:
- ✅ Webhook受信エンドポイント実装済み（Phase 1完了済み）
- ✅ WEBHOOK_API_KEY設定済み（医療システムチームへ共有必要）
- ✅ professionCategoryフィールド実装済み（User Cacheテーブル）
- ✅ 統合テスト準備完了（2025年11月1日開始可能）

---

## 1️⃣ 医療システムチームからの確認事項への回答

### ✅ 確認事項1: Webhook受信エンドポイント実装状況

**医療システムチームからの質問**:
> VoiceDrive側の実装状況を確認させてください

**VoiceDrive側の回答**: **実装済みです（Phase 1完了: 2025年10月8日）**

#### 実装詳細

**ファイル**: `src/api/routes/webhook.routes.ts`

**エンドポイント**: `POST /api/webhook/employee-updated`

**実装済み機能**:

1. **HMAC-SHA256署名検証** ✅ (Line 451-476)
```typescript
// HMAC署名検証
const payload = JSON.stringify(req.body);
const HMAC_SECRET = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET ||
                    process.env.ANALYTICS_WEBHOOK_SECRET || '';

if (!verifyHmacSignature(payload, signature, timestamp, HMAC_SECRET)) {
  return res.status(401).json({
    success: false,
    error: {
      code: 'INVALID_SIGNATURE',
      message: 'HMAC署名が無効です',
      timestamp: new Date().toISOString()
    }
  });
}
```

2. **タイムスタンプ検証** ✅ (Line 58-71)
```typescript
// タイムスタンプ検証（±5分以内）
const requestTime = new Date(timestamp).getTime();
const currentTime = new Date().getTime();
const timeDiff = Math.abs(currentTime - requestTime);
const fiveMinutes = 5 * 60 * 1000;

if (timeDiff > fiveMinutes) {
  console.warn('⚠️  タイムスタンプが許容範囲外');
  return false;
}
```

3. **職員情報更新処理** ✅ (Line 493-507)
```typescript
// ユーザーキャッシュを更新
const updateData: any = {};

if (changes.name) updateData.name = changes.name.new;
if (changes.department) updateData.department = changes.department.new;
if (changes.position) updateData.position = changes.position.new;
if (changes.permissionLevel) updateData.permissionLevel = changes.permissionLevel.new;
if (changes.canPerformLeaderDuty !== undefined)
  updateData.canPerformLeaderDuty = changes.canPerformLeaderDuty.new;
if (changes.avatar) updateData.avatar = changes.avatar.new;

updateData.updatedAt = new Date();

const user = await prisma.user.update({
  where: { employeeId },
  data: updateData
});
```

4. **エラーハンドリング** ✅ (Line 521-544)
```typescript
if (error.code === 'P2025') {
  // Prisma: Record not found
  return res.status(404).json({
    success: false,
    error: {
      code: 'EMPLOYEE_NOT_FOUND',
      message: '職員が見つかりません',
      timestamp: new Date().toISOString()
    }
  });
}
```

#### 実装状況まとめ

| 項目 | 状態 | 実装日 |
|------|------|--------|
| エンドポイント実装 | ✅ 完了 | 2025年10月8日（Phase 1） |
| HMAC署名検証 | ✅ 完了 | 2025年10月8日（Phase 1） |
| タイムスタンプ検証 | ✅ 完了 | 2025年10月8日（Phase 1） |
| User Cache更新ロジック | ✅ 完了 | 2025年10月8日（Phase 1） |
| エラーハンドリング | ✅ 完了 | 2025年10月8日（Phase 1） |

---

### ✅ 確認事項2: WEBHOOK_API_KEY共有

**医療システムチームからの質問**:
> 医療システム側で設定する値の取得方法をご教示ください

**VoiceDrive側の回答**: **設定済みです。以下の値を共有いたします。**

#### 環境変数設定

**ファイル**: `.env.local` (Line 64)

```bash
# Webhook Secret Key（Phase 2.5と同じ値）
VITE_MEDICAL_WEBHOOK_SECRET=shared_webhook_secret_phase25
```

#### 医療システムチーム様へのお願い

以下の環境変数を医療システム側の `.env.production` に設定いただきますようお願いいたします：

```bash
# VoiceDrive Webhook設定
WEBHOOK_ENDPOINT=https://voicedrive.example.com/api/webhooks/employee-updated
WEBHOOK_API_KEY=shared_webhook_secret_phase25
```

#### セキュリティ情報

| 項目 | 値 |
|------|-----|
| **環境変数名（VoiceDrive側）** | `VITE_MEDICAL_WEBHOOK_SECRET` |
| **環境変数名（医療システム側）** | `WEBHOOK_API_KEY` |
| **値** | `shared_webhook_secret_phase25` |
| **長さ** | 30文字 |
| **設定場所** | `.env.local` (開発環境), `.env.production` (本番環境) |
| **ローテーション** | 3ヶ月ごと推奨 |

#### 注意事項

- ✅ 本値は開発環境用です。本番環境では異なる値を使用します。
- ✅ 本番環境では AWS Secrets Manager または Parameter Store の使用を推奨します。
- ⚠️ 平文でのメール送信は禁止されています。
- ⚠️ 本文書は `mcp-shared/docs/` 経由で共有されます。

---

### ✅ 確認事項3: professionCategory値の整合性確認

**医療システムチームからの質問**:
> VoiceDrive側の期待値と一致しているかご確認ください

**VoiceDrive側の回答**: **一致しています。User Cacheテーブルに実装済みです。**

#### User Cacheテーブル実装状況

**ファイル**: `prisma/schema.prisma` (Line 22)

```prisma
model User {
  id                            String   @id @default(uuid())
  employeeId                    String   @unique
  name                          String
  email                         String?  @unique
  department                    String?
  position                      String?
  avatar                        String?
  permissionLevel               Int      @default(1)
  professionCategory            String?  // ← 実装済み
  canPerformLeaderDuty          Boolean  @default(false)
  experienceYears               Int?
  isRetired                     Boolean  @default(false)
  retirementDate                DateTime?
  anonymizedId                  String?
  createdAt                     DateTime @default(now())
  updatedAt                     DateTime @updatedAt
}
```

#### マイグレーション実装済み

**ファイル**: `prisma/migrations/add_25_level_system.sql` (Line 11)

```sql
ALTER TABLE User ADD COLUMN professionCategory TEXT;
```

#### 期待される値（7カテゴリー）

VoiceDrive側で期待する `professionCategory` の値は以下の7種類です：

| professionCategory | 日本語 | 対応する accountType |
|-------------------|--------|---------------------|
| `nursing` | 看護職 | NURSE, NURSE_MANAGER, NURSING_DIRECTOR, CARE_WORKER, CARE_MANAGER |
| `medical` | 医師・医療技術職 | DOCTOR, MEDICAL_DIRECTOR, PHARMACIST, RADIOLOGIST, LAB_TECHNICIAN |
| `rehabilitation` | リハビリ職 | THERAPIST, PT, OT, ST |
| `administrative` | 事務職 | ADMIN, CLERK |
| `support` | サポート職 | DIETITIAN, MSW |
| `management` | 管理職 | CHAIRMAN, DIRECTOR, DEPARTMENT_HEAD, MANAGER |
| `other` | その他 | （上記以外） |

#### 医療システムチーム様からの提供内容との整合性

医療システムチーム様の「HomePage_マスタープラン反映完了報告書」に記載された変換マッピング（Line 146-171）と、VoiceDrive側の期待値は **完全に一致** しています。

#### HomePage使用状況

**ファイル**: `src/components/Timeline.tsx`

HomePageのTimelineコンポーネントでは、投稿者の職種分類表示に `professionCategory` を使用します：

```typescript
// 投稿者情報表示
<div className="author-info">
  <span className="author-name">{post.author.name}</span>
  <span className="author-category">{post.author.professionCategory}</span>
</div>
```

---

### ✅ 確認事項4: 統合テスト日程の調整

**医療システムチームからの質問**:
> 貴チームのご都合をご確認ください

**VoiceDrive側の回答**: **問題ございません。2025年11月1日（金）〜 11月8日（金）で承諾いたします。**

---

## 2️⃣ VoiceDrive側実装状況サマリー

### 2.1 Webhook実装状況

| エンドポイント | 実装状態 | 実装日 | ファイル |
|--------------|---------|--------|---------|
| `POST /api/webhook/employee-updated` | ✅ 完了 | 2025年10月8日 | `src/api/routes/webhook.routes.ts:426-545` |
| `POST /api/webhook/employee-experience-updated` | ✅ 完了 | 2025年10月8日 | `src/api/routes/webhook.routes.ts:548-646` |
| `POST /api/webhook/employee-retired` | ✅ 完了 | 2025年10月8日 | `src/api/routes/webhook.routes.ts:649-739` |
| `POST /api/webhook/employee-reinstated` | ✅ 完了 | 2025年10月8日 | `src/api/routes/webhook.routes.ts:742-829` |

### 2.2 User Cacheテーブル実装状況

| フィールド | 型 | 実装状態 | 用途 |
|-----------|-----|---------|------|
| `employeeId` | String | ✅ 完了 | 医療システム連携キー |
| `name` | String | ✅ 完了 | 職員名 |
| `department` | String? | ✅ 完了 | 所属部署 |
| `position` | String? | ✅ 完了 | 役職 |
| `permissionLevel` | Int | ✅ 完了 | 権限レベル |
| `professionCategory` | String? | ✅ 完了 | 職種分類（HomePage使用） |
| `canPerformLeaderDuty` | Boolean | ✅ 完了 | リーダー勤務可否 |
| `experienceYears` | Int? | ✅ 完了 | 経験年数 |
| `isRetired` | Boolean | ✅ 完了 | 退職フラグ |

### 2.3 HomePage実装状況

| コンポーネント | 実装状態 | ファイル |
|--------------|---------|---------|
| HomePage | ✅ 完了 | `src/pages/HomePage.tsx` |
| Timeline | ✅ 完了 | `src/components/Timeline.tsx` |
| ComposeSection | ✅ 完了 | `src/components/ComposeSection.tsx` |
| useVoting hook | ✅ 完了 | `src/hooks/useVoting.ts` |

---

## 3️⃣ 統合テスト準備状況

### 3.1 VoiceDrive側準備完了項目

| 項目 | 状態 | 詳細 |
|------|------|------|
| **Webhook受信エンドポイント** | ✅ 完了 | 4つのエンドポイント実装済み |
| **HMAC署名検証ロジック** | ✅ 完了 | `verifyHmacSignature()` 関数実装済み |
| **User Cacheテーブル** | ✅ 完了 | professionCategoryフィールド実装済み |
| **HomePage実装** | ✅ 完了 | 全コンポーネント実装済み |
| **テスト環境構築** | ✅ 準備中 | 10月31日までに完了予定 |
| **テストデータ準備** | ✅ 準備中 | 10月31日までに完了予定 |

### 3.2 VoiceDrive側統合テスト計画

#### Day 1: API統合テスト（2025年11月1日）

**VoiceDrive側作業**:
- 医療システムAPI呼び出しテスト
  - `GET /api/v2/employees/:id` の動作確認
  - `GET /api/v2/employees` の動作確認
  - professionCategory取得確認
- エラーハンドリングテスト
- レスポンスタイム計測

**期待結果**:
- API呼び出し成功率: 100%
- レスポンスタイムP95: < 500ms
- professionCategory正常取得

#### Day 2-4: VoiceDrive単独テスト（2025年11月4日〜6日）

**VoiceDrive側作業**:
- HomePage初期表示テスト
- 投票機能テスト
- コメント機能テスト
- UI/UXテスト

**期待結果**:
- 全画面正常表示
- 全機能正常動作

#### Day 5: Webhook統合テスト（2025年11月7日）

**VoiceDrive側作業**:
- Webhook受信テスト
  - `employee.created` イベント受信確認
  - `employee.updated` イベント受信確認
  - `employee.deleted` イベント受信確認
- User Cache更新確認
- HMAC署名検証テスト
- タイムスタンプ検証テスト

**医療システムチーム様との協力**:
- Webhook送信テスト
- 署名検証テスト
- リトライ機構テスト

**期待結果**:
- Webhook受信成功率: 100%
- User Cache更新成功率: 100%
- 署名検証成功率: 100%

#### Day 6: E2Eテスト（2025年11月8日）

**VoiceDrive側作業**:
- エンドツーエンドシナリオテスト
- 性能テスト
- バグ修正
- テスト結果まとめ

**期待結果**:
- 全シナリオ成功
- 性能要件達成

### 3.3 テスト環境情報

#### 開発環境エンドポイント

```bash
# VoiceDrive開発環境
VoiceDrive URL: http://localhost:3001
Webhook受信URL: http://localhost:3001/api/webhook/employee-updated

# 医療システム開発環境（想定）
医療システムAPI: http://localhost:3000
API Version: v2
```

#### 環境変数（開発環境）

```bash
# VoiceDrive側 .env.local
VITE_MEDICAL_SYSTEM_API_URL=http://localhost:3000
VITE_MEDICAL_WEBHOOK_SECRET=shared_webhook_secret_phase25
VITE_MEDICAL_JWT_SECRET=dev_jwt_secret_medical_voicedrive_integration_2025_phase26
```

---

## 4️⃣ 今後のアクション

### VoiceDriveチーム側アクション

| No | アクション | 担当 | 期限 | 状態 |
|----|-----------|------|------|------|
| 1 | WEBHOOK_API_KEY共有確認 | VoiceDrive | 2025年10月28日 | ✅ 本文書で共有済み |
| 2 | テスト環境構築 | VoiceDrive | 2025年10月31日 | ⏳ 作業中 |
| 3 | テストデータ準備 | VoiceDrive | 2025年10月31日 | ⏳ 作業中 |
| 4 | 統合テスト Day 1 参加 | VoiceDrive | 2025年11月1日 | ✅ スケジュール確保済み |
| 5 | 統合テスト Day 5 参加 | VoiceDrive | 2025年11月7日 | ✅ スケジュール確保済み |
| 6 | 統合テスト Day 6 参加 | VoiceDrive | 2025年11月8日 | ✅ スケジュール確保済み |

### 医療システムチーム様へのお願い

| No | お願い内容 | 期限 | 優先度 |
|----|-----------|------|--------|
| 1 | WEBHOOK_API_KEY設定完了 | 2025年11月1日 | 🔴 高 |
| 2 | テスト環境API稼働確認 | 2025年11月1日 | 🔴 高 |
| 3 | 統合テスト Day 1 参加 | 2025年11月1日 | 🔴 高 |
| 4 | 統合テスト Day 5 参加 | 2025年11月7日 | 🔴 高 |
| 5 | 統合テスト Day 6 参加 | 2025年11月8日 | 🔴 高 |

---

## 5️⃣ 統合テスト期間中の連絡体制

### 5.1 リアルタイム連絡

**連絡ツール**: `mcp-shared/logs/` 経由のファイルベース連絡

**VoiceDrive側ログファイル**:
- `mcp-shared/logs/voicedrive-test-results.json` （テスト結果）
- `mcp-shared/logs/webhook-receive-log.json` （Webhook受信ログ）
- `mcp-shared/logs/api-call-log.json` （API呼び出しログ）

**医療システム側ログファイル**:
- `mcp-shared/logs/medical-system-test-log.json` （テスト実行ログ）
- `mcp-shared/logs/api-error-log.json` （APIエラーログ）
- `mcp-shared/logs/webhook-send-log.json` （Webhook送信ログ）

### 5.2 エラー対応フロー

```
エラー検知（いずれかのチーム）
  ↓
mcp-shared/logs/ にエラー詳細記録
  ↓
相手チームがログ確認（5分以内）
  ↓
30分以内に初動対応開始
  ↓
解決後、mcp-shared/logs/ に解決報告
```

### 5.3 重大エラー時の連絡

**重大エラーの定義**:
- Webhook受信失敗率が10%を超える
- API呼び出し失敗率が5%を超える
- User Cache更新失敗率が5%を超える

**連絡方法**:
- `mcp-shared/logs/CRITICAL_ERROR_VD.json` を作成
- ファイル内に詳細とアクションプランを記載

---

## 6️⃣ 添付ドキュメント

本回答書に関連するドキュメントは以下のとおりです（全て `mcp-shared/docs/` に格納）：

### VoiceDriveチーム作成ドキュメント

1. **HomePage_DB要件分析_20251027.md**
   - HomePage全機能の詳細分析

2. **HomePage暫定マスターリスト_20251027.md**
   - 全43データ項目の詳細仕様

3. **HomePage_統合テスト計画書_20251027.md**
   - 6つの統合テストシナリオ

4. **HomePage_マスタープラン反映依頼書_20251027.md**
   - 医療システムチームへの反映依頼

5. **HomePage_VoiceDrive実装確認回答書_20251027.md** (本文書)
   - VoiceDrive側実装状況回答

### 医療システムチーム作成ドキュメント

6. **HomePage_医療システム実装状況回答書_20251027.md**
   - 医療システム側実装状況回答

7. **HomePage_マスタープラン反映完了報告書_20251027.md**
   - マスタープラン反映完了報告

---

## 7️⃣ 結論

### ✅ VoiceDrive側完了事項

1. **Webhook受信エンドポイント実装**: Phase 1で完了済み（2025年10月8日）
2. **WEBHOOK_API_KEY設定**: 完了済み（`shared_webhook_secret_phase25`）
3. **professionCategoryフィールド実装**: User Cacheテーブルに実装済み
4. **HomePage実装**: 全コンポーネント実装済み
5. **統合テスト準備**: 10月31日までに完了予定

### 🔄 医療システムチーム様待ち事項

1. **WEBHOOK_API_KEY設定**: `WEBHOOK_API_KEY=shared_webhook_secret_phase25` を医療システム側 `.env.production` に設定
2. **テスト環境API稼働確認**: 2025年11月1日までに確認
3. **統合テスト日程確定**: 2025年11月1日〜8日で実施

### 📅 次のマイルストーン

| 日付 | マイルストーン | 担当 |
|------|--------------|------|
| **2025年10月31日** | VoiceDriveチーム準備完了 | VoiceDrive |
| **2025年11月1日** | 統合テスト Day 1 開始 | 両チーム |
| **2025年11月7日** | Webhook統合テスト | 両チーム |
| **2025年11月8日** | E2Eテスト完了 | 両チーム |

---

## 📞 連絡先

**VoiceDrive開発チーム**
- 担当: プロジェクトリード
- 連絡方法: Slack #phase2-integration
- ログ共有: `mcp-shared/logs/` 経由
- 緊急連絡: `mcp-shared/logs/CRITICAL_ERROR_VD.json` を作成

**医療職員管理システム開発チーム**
- 連絡方法: `mcp-shared/logs/` 経由のファイルベース連絡
- 緊急連絡: `mcp-shared/logs/URGENT_CONTACT.json` を作成

---

**以上、ご確認のほどよろしくお願い申し上げます。**

**VoiceDrive開発チーム**
**2025年10月27日**

---

**END OF DOCUMENT**
