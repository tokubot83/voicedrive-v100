# PersonalStation VoiceDrive側実装完了報告

**文書番号**: IMPL-PS-VD-2025-1009-001
**作成日**: 2025年10月9日
**対象**: PersonalStationページ Phase 1-3 準備実装
**状態**: ✅ 実装完了（マイグレーション実行待ち）

---

## 📋 エグゼクティブサマリー

医療システムチームからの回答書（RESPONSE-PS-DB-2025-1009-001）に基づき、VoiceDrive側で今すぐ実装可能な全てのコードを完成させました。

### ✅ 実装完了項目

1. **schema.prisma更新**: VoteHistory、UserActivitySummary、User.experienceYears追加
2. **MedicalSystemAPI拡張**: API-2（経験年数サマリ）呼び出しメソッド追加
3. **VoteService実装**: 投票記録・取得サービス（新規）
4. **UserActivityService実装**: ユーザー活動統計サービス（新規）
5. **Webhook受信エンドポイント**: 4種類のWebhook受信実装

### ⏳ 次のステップ

- **11月4日（月）**: Prismaマイグレーション実行（医療システムAPI-2実装開始と同時）
- **11月5日〜7日**: PersonalStationページ修正（実データ接続）
- **11月9日（土）**: Phase 1統合テスト

---

## 🗂️ 実装ファイル一覧

### 1. データベーススキーマ

#### ファイル: `prisma/schema.prisma`

**追加内容**:

```prisma
model User {
  // ... 既存フィールド
  experienceYears      Float?                   // 🆕 総職務経験年数
  voteHistory          VoteHistory[]            // 🆕 投票履歴
  activitySummary      UserActivitySummary?     // 🆕 活動サマリー
}

model VoteHistory {
  id            String    @id @default(cuid())
  userId        String
  postId        String
  voteOption    String    // "agree", "disagree", "neutral"
  voteWeight    Float     @default(1.0)
  votedAt       DateTime  @default(now())
  postCategory  String?
  postType      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@index([votedAt])
}

model UserActivitySummary {
  id                    String    @id @default(cuid())
  userId                String    @unique
  totalPosts            Int       @default(0)
  totalVotes            Int       @default(0)
  thisMonthVotes        Int       @default(0)
  impactScore           Float     @default(0)
  feedbackReceived      Int       @default(0)
  feedbackSent          Int       @default(0)
  projectsProposed      Int       @default(0)
  surveysCompleted      Int       @default(0)
  loginDays             Int       @default(0)
  lastCalculatedAt      DateTime  @default(now())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([impactScore])
}
```

**マイグレーション実行コマンド**:
```bash
# 11月4日（月）に実行予定
npx prisma migrate dev --name add_personal_station_features
```

---

### 2. 医療システムAPI拡張

#### ファイル: `src/services/MedicalSystemAPI.ts`

**追加内容**:

```typescript
// 🆕 型定義追加
interface ExperienceSummaryResponse {
  employeeId: string;
  yearsOfService: number;
  totalExperienceYears: number;
  currentPositionYears: number;
  priorExperience: number;
  specialtyExperienceYears: number;
  calculatedAt: string;
}

// 🆕 メソッド追加
async getExperienceSummary(employeeId: string): Promise<ExperienceSummaryResponse>
async getExperienceSummaryWithFallback(employeeId: string, useFallback: boolean = true): Promise<ExperienceSummaryResponse>
```

**使用例**:
```typescript
import { medicalSystemAPI } from './services/MedicalSystemAPI';

// JWTトークン設定
medicalSystemAPI.setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// 経験年数サマリ取得
const experience = await medicalSystemAPI.getExperienceSummary('EMP001');
console.log(experience.totalExperienceYears); // 8.2

// フォールバック付き（医療システムAPI障害時は0を返す）
const experienceSafe = await medicalSystemAPI.getExperienceSummaryWithFallback('EMP001');
```

**エンドポイント**:
- `GET /api/v2/employees/{employeeId}/experience-summary`
- 認証: JWT Bearer Token
- 実装時期: 11月4日〜8日（医療システム側）

---

### 3. 投票サービス（新規）

#### ファイル: `src/services/VoteService.ts`（新規作成）

**提供機能**:

```typescript
// 投票記録
recordVote(params: RecordVoteParams): Promise<void>

// 投票済みチェック
hasUserVoted(userId: string, postId: string): Promise<boolean>

// ユーザーの投票内容取得
getUserVote(userId: string, postId: string): Promise<VoteOption | null>

// 投票削除
deleteVote(userId: string, postId: string): Promise<void>

// 複数投稿の投票状況一括取得
getUserVotesForPosts(userId: string, postIds: string[]): Promise<Map<string, VoteOption>>

// 投稿の全投票取得
getPostVotes(postId: string)

// 投稿の投票サマリー
getPostVoteSummary(postId: string)
```

**使用例**:
```typescript
import { recordVote, getUserVote } from './services/VoteService';

// 投票記録
await recordVote({
  userId: 'user123',
  postId: 'post456',
  voteOption: 'support',
  voteWeight: 1.5,  // 権限レベルに応じた重み
  postCategory: 'improvement',
  postType: 'improvement'
});

// 投票内容確認
const vote = await getUserVote('user123', 'post456');
console.log(vote); // "support"
```

---

### 4. ユーザー活動統計サービス（新規）

#### ファイル: `src/services/UserActivityService.ts`（新規作成）

**提供機能**:

```typescript
// 投票統計取得
getUserVoteStats(userId: string): Promise<VoteStats>

// カテゴリ別投票統計
getVoteStatsByCategory(userId: string): Promise<CategoryStats>

// 投票済み投稿一覧
getUserVotedPosts(userId: string, limit?: number)

// 投稿統計
getUserPostStats(userId: string)

// フィードバック統計
getUserFeedbackStats(userId: string)

// 全活動統計一括取得
getUserActivitySummary(userId: string)

// 活動サマリーテーブル更新（日次バッチ用）
updateUserActivitySummaryRecord(userId: string)

// 全ユーザー一括更新（日次バッチ用）
updateAllUserActivitySummaries(batchSize?: number)
```

**使用例**:
```typescript
import { getUserVoteStats, getVoteStatsByCategory } from './services/UserActivityService';

// PersonalStationページで使用
const voteStats = await getUserVoteStats('user123');
console.log(voteStats);
// { total: 89, thisMonth: 12, impactScore: 76 }

const categoryStats = await getVoteStatsByCategory('user123');
console.log(categoryStats);
// { improvement: 23, communication: 15, innovation: 8, strategy: 5 }
```

**日次バッチ実装例**:
```typescript
import { updateAllUserActivitySummaries } from './services/UserActivityService';

// 毎日深夜2時に実行
cron.schedule('0 2 * * *', async () => {
  console.log('📊 全ユーザー活動統計更新開始');
  const result = await updateAllUserActivitySummaries(100);
  console.log(`✅ 更新完了: 成功${result.processed}件, エラー${result.errors}件`);
});
```

---

### 5. Webhook受信エンドポイント

#### ファイル: `src/api/routes/webhook.routes.ts`（既存ファイルに追加）

**追加エンドポイント**:

#### Webhook-1: 職員情報更新通知

```
POST /api/webhook/employee-updated
```

**ペイロード例**:
```json
{
  "eventType": "employee.updated",
  "timestamp": "2025-10-09T10:30:00Z",
  "employeeId": "EMP2024001",
  "changes": {
    "department": {
      "old": "内科",
      "new": "外科"
    },
    "permissionLevel": {
      "old": 3.0,
      "new": 3.5
    }
  }
}
```

**処理内容**:
- HMAC-SHA256署名検証
- タイムスタンプ検証（±5分）
- Userテーブルのキャッシュ更新

---

#### Webhook-2: 経験年数更新通知

```
POST /api/webhook/employee-experience-updated
```

**ペイロード例**:
```json
{
  "eventType": "employee.experience.updated",
  "timestamp": "2025-11-12T02:00:00.000Z",
  "employeeId": "EMP2024001",
  "experienceSummary": {
    "yearsOfService": 4.5,
    "totalExperienceYears": 8.2,
    "currentPositionYears": 2.1,
    "specialtyExperienceYears": 6.5
  }
}
```

**処理内容**:
- User.experienceYearsを更新
- 日次バッチ（毎日02:00 JST）で送信される想定

---

#### Webhook-3: 職員退職通知

```
POST /api/webhook/employee-retired
```

**ペイロード例**:
```json
{
  "eventType": "employee.retired",
  "timestamp": "2025-10-09T10:30:00Z",
  "employeeId": "EMP2024001",
  "retirementDate": "2025-09-30",
  "anonymizedId": "ANON_1234567890"
}
```

**処理内容**:
- User.isRetired = true
- 個人情報を匿名化（name、email、avatar）
- 投稿・投票履歴は保持

---

#### Webhook-4: 職員復職通知

```
POST /api/webhook/employee-reinstated
```

**ペイロード例**:
```json
{
  "eventType": "employee.reinstated",
  "timestamp": "2025-10-09T10:30:00Z",
  "employeeId": "EMP2024001"
}
```

**処理内容**:
- User.isRetired = false
- 匿名化フラグ解除
- 最新情報は医療システムAPI-1から再取得が必要

---

## 🔧 環境変数設定

### .env ファイルに追加が必要

```bash
# 医療システムAPI
VITE_MEDICAL_API_URL=http://localhost:3000/api/v2

# Webhook署名検証用秘密鍵
MEDICAL_SYSTEM_WEBHOOK_SECRET=your_hmac_secret_key_here

# 既存（Analytics用）
ANALYTICS_WEBHOOK_SECRET=your_analytics_secret_key
```

**セキュリティ**:
- `MEDICAL_SYSTEM_WEBHOOK_SECRET`は医療システムチームと共有
- 本番環境では環境変数で管理（`.env.production`にコミット不可）

---

## 📅 実装スケジュール（再確認）

### Phase 1: 最小限の動作（11月4日〜8日）

| 日付 | VoiceDrive側タスク | 状態 |
|------|------------------|------|
| 11月4日（月） | Prismaマイグレーション実行 | ⏳ 予定 |
| 11月5日〜7日 | PersonalStationPage修正（experienceYears表示） | ⏳ 予定 |
| 11月7日〜8日 | MedicalSystemAPI統合テスト | ⏳ 予定 |
| 11月9日（土） | Phase 1統合テスト（医療システムと合同） | ⏳ 予定 |

**Phase 1完了時の動作範囲**:
- ✅ 経験年数表示（実データ）
- ✅ Webhook-1, 3受信（職員情報更新、退職）
- ⚠️ 統計カード（ダミーデータのまま）

---

### Phase 2: 投票履歴の正確化（11月11日〜18日）

| 日付 | VoiceDrive側タスク | 状態 |
|------|------------------|------|
| 11月11日（月） | VoteHistoryマイグレーション実行 | ⏳ 予定 |
| 11月12日〜14日 | 投票処理にVoteService統合 | ⏳ 予定 |
| 11月14日〜16日 | PersonalStation統計表示修正（実データ） | ⏳ 予定 |
| 11月16日〜18日 | 投票履歴表示修正（VoteHistory使用） | ⏳ 予定 |

**Phase 2完了時の動作範囲**:
- ✅ 統計カード（実データ）
- ✅ カテゴリ別投票実績（実データ）
- ✅ 投票履歴（正確）

---

### Phase 3: パフォーマンス最適化（11月18日〜22日）

| 日付 | VoiceDrive側タスク | 状態 |
|------|------------------|------|
| 11月18日（月） | UserActivitySummaryマイグレーション実行 | ⏳ 予定 |
| 11月19日〜21日 | 日次バッチ実装 | ⏳ 予定 |
| 11月21日〜22日 | PersonalStation最適化（サマリーテーブル使用） | ⏳ 予定 |

**Phase 3完了時の動作範囲**:
- ✅ 高速統計表示（事前集計）
- ✅ スケーラビリティ向上（1000ユーザー対応）

---

## ✅ 実装完了チェックリスト

### VoiceDrive側実装（今回完了分）

- [x] **schema.prisma**: User.experienceYears追加
- [x] **schema.prisma**: VoteHistoryテーブル追加
- [x] **schema.prisma**: UserActivitySummaryテーブル追加
- [x] **MedicalSystemAPI.ts**: getExperienceSummary()追加
- [x] **MedicalSystemAPI.ts**: getExperienceSummaryWithFallback()追加
- [x] **VoteService.ts**: 新規作成（全機能実装）
- [x] **UserActivityService.ts**: 新規作成（全機能実装）
- [x] **webhook.routes.ts**: Webhook-1（職員情報更新）実装
- [x] **webhook.routes.ts**: Webhook-2（経験年数更新）実装
- [x] **webhook.routes.ts**: Webhook-3（退職）実装
- [x] **webhook.routes.ts**: Webhook-4（復職）実装

### 次のステップ（11月4日以降）

- [ ] Prismaマイグレーション実行
- [ ] PersonalStationPage修正（ダミーデータ削除）
- [ ] 統合テスト実装
- [ ] 環境変数設定（本番環境）
- [ ] 日次バッチスケジューラ設定

---

## 🔗 関連ドキュメント

1. [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)
2. [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
3. [PersonalStation_医療システム回答反映_20251009.md](./PersonalStation_医療システム回答反映_20251009.md)
4. [医療システム回答書] RESPONSE-PS-DB-2025-1009-001

---

## 📊 コード統計

| ファイル | 行数 | 新規/修正 | 主要機能 |
|---------|------|---------|---------|
| `prisma/schema.prisma` | +60行 | 修正 | VoteHistory、UserActivitySummary、User.experienceYears |
| `src/services/MedicalSystemAPI.ts` | +80行 | 修正 | API-2呼び出しメソッド |
| `src/services/VoteService.ts` | 190行 | 新規 | 投票記録・取得 |
| `src/services/UserActivityService.ts` | 240行 | 新規 | 活動統計集計 |
| `src/api/routes/webhook.routes.ts` | +410行 | 修正 | Webhook-1〜4受信 |
| **合計** | **約980行** | - | - |

---

## 🎉 まとめ

医療システムチームからの回答書に基づき、VoiceDrive側で今すぐ実装可能な全てのコードを完成させました。

### 実装済み（✅）
- データベーススキーマ定義
- 医療システムAPI呼び出しクライアント
- 投票サービス（Phase 2用）
- ユーザー活動統計サービス（Phase 2-3用）
- Webhook受信エンドポイント（Phase 1-2用）

### 11月4日から実施（⏳）
- Prismaマイグレーション実行
- PersonalStationページ修正
- 統合テスト
- 本番環境デプロイ

引き続き、医療システムチームとの協力により、PersonalStationページの成功を目指します。

---

**作成者**: AI (Claude Code)
**次のアクション**: 11月4日（月）にマイグレーション実行

---

## 📝 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-09 | 初版作成 | AI (Claude Code) |
