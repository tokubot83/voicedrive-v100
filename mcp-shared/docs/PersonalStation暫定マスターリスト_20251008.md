# パーソナルステーション 暫定マスターリスト

**作成日**: 2025年10月8日
**対象ページ**: PersonalStationPage (`src/pages/PersonalStationPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- パーソナルステーションページは職員個人の活動統計、プロフィール、投票履歴を表示
- 現在はダミーデータで動作（experienceYears、vote statistics）
- 医療システムからの職員マスタデータ受信が必要

### 必要な対応
1. **医療システムからのAPI提供**: 2件
2. **医療システムからのWebhook通知**: 4件
3. **VoiceDrive DB追加**: テーブル2件、フィールド1件
4. **確認事項**: 3件

### 優先度
**Priority: HIGH（グループ1: コアページ）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（2件）

#### API-1: 職員基本情報取得API

**エンドポイント**:
```
GET /api/v2/employees/{employeeId}
```

**必要な理由**:
- パーソナルステーションの基本プロフィール表示（名前、部署、役職、アバター等）
- VoiceDriveの`User`テーブルはキャッシュ専用、真実の情報源は医療システム

**レスポンス例**:
```json
{
  "employeeId": "EMP2024001",
  "name": "山田 太郎",
  "email": "yamada.taro@hospital.local",
  "department": "外科",
  "facilityId": "FAC001",
  "role": "看護師",
  "avatar": "https://cdn.hospital.local/avatars/emp2024001.jpg",
  "accountType": "STAFF",
  "permissionLevel": 3.5,
  "canPerformLeaderDuty": false,
  "professionCategory": "nursing",
  "position": "主任",
  "expertise": 8,
  "hierarchyLevel": 3,
  "isRetired": false
}
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- 個人情報（電話番号、生年月日、住所等）は含めない

---

#### API-2: 職員経験年数サマリーAPI

**エンドポイント**:
```
GET /api/v2/employees/{employeeId}/experience-summary
```

**必要な理由**:
- PersonalStationPage.tsx 157行目で`experienceYears`を表示
- 現在VoiceDrive・医療システム双方に該当フィールドが存在しない
- 医療システムの`WorkExperience`テーブルから計算可能

**レスポンス例**:
```json
{
  "employeeId": "EMP2024001",
  "yearsOfService": 4.5,              // 勤続年数（当法人）
  "totalExperienceYears": 8.2,        // 総職務経験年数（前職含む）
  "currentPositionYears": 2.1,        // 現職での年数
  "specialtyExperienceYears": 6.5,    // 専門分野経験年数
  "calculatedAt": "2025-10-08T10:30:00Z"
}
```

**計算ロジック（医療システム側で実装）**:
```typescript
// WorkExperienceテーブルから集計
const experiences = await prisma.workExperience.findMany({
  where: { employeeId },
  orderBy: { startDate: 'asc' }
});

const yearsOfService = calculateYears(
  experiences.filter(e => e.organizationId === currentOrgId)
);
const totalExperienceYears = calculateYears(experiences);
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP

---

### B. Webhook通知依頼（4件）

#### Webhook-1: 職員情報更新通知

**トリガー**:
- 医療システムの`Employee`テーブル更新時（名前、部署、役職、権限レベル等）

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/employee-updated
```

**ペイロード例**:
```json
{
  "eventType": "employee.updated",
  "timestamp": "2025-10-08T10:30:00Z",
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
  },
  "signature": "abc123..."  // HMAC-SHA256署名
}
```

**VoiceDrive側の処理**:
```typescript
// Userテーブルのキャッシュを更新
await prisma.user.update({
  where: { employeeId },
  data: {
    department: changes.department.new,
    permissionLevel: changes.permissionLevel.new,
    updatedAt: new Date()
  }
});
```

---

#### Webhook-2: 職員経験年数更新通知

**トリガー**:
- `WorkExperience`テーブル更新時（新規追加、修正、削除）
- 月次バッチで経験年数再計算時

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/employee-experience-updated
```

**ペイロード例**:
```json
{
  "eventType": "employee.experience.updated",
  "timestamp": "2025-10-08T10:30:00Z",
  "employeeId": "EMP2024001",
  "experienceSummary": {
    "yearsOfService": 4.5,
    "totalExperienceYears": 8.2,
    "currentPositionYears": 2.1,
    "specialtyExperienceYears": 6.5
  },
  "signature": "abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// Userテーブルのキャッシュを更新
await prisma.user.update({
  where: { employeeId },
  data: {
    experienceYears: experienceSummary.totalExperienceYears,
    updatedAt: new Date()
  }
});
```

---

#### Webhook-3: 職員退職通知

**トリガー**:
- `Employee.isRetired`が`true`に変更された時

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/employee-retired
```

**ペイロード例**:
```json
{
  "eventType": "employee.retired",
  "timestamp": "2025-10-08T10:30:00Z",
  "employeeId": "EMP2024001",
  "retirementDate": "2025-09-30",
  "anonymizedId": "ANON_1234567890",
  "signature": "abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// Userを退職状態に更新（データ保持）
await prisma.user.update({
  where: { employeeId },
  data: {
    isRetired: true,
    retirementDate: new Date(retirementDate),
    anonymizedId: anonymizedId,
    // 個人情報を匿名化
    name: anonymizedId,
    email: `${anonymizedId}@anonymized.local`,
    avatar: null
  }
});
```

---

#### Webhook-4: 職員復職通知

**トリガー**:
- `Employee.isRetired`が`false`に戻った時（復職）

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/employee-reinstated
```

**ペイロード例**:
```json
{
  "eventType": "employee.reinstated",
  "timestamp": "2025-10-08T10:30:00Z",
  "employeeId": "EMP2024001",
  "signature": "abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// 退職フラグを解除、最新情報をAPI取得
await prisma.user.update({
  where: { employeeId },
  data: {
    isRetired: false,
    retirementDate: null,
    anonymizedId: null
  }
});

// API-1を呼び出して最新情報を取得
const employeeData = await fetchEmployeeData(employeeId);
await updateUserCache(employeeData);
```

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### C. 新規テーブル追加（2件）

#### Table-1: VoteHistory（投票履歴）

**優先度**: 🔴 **CRITICAL**

**理由**:
- PersonalStationPage.tsx 600-729行目で投票履歴機能を実装済み
- 現在は永続化されておらず、ページリロードで消失
- 「今月の投票数」「総投票数」統計に必須

**スキーマ定義**:
```prisma
model VoteHistory {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  postId        String    @map("post_id")
  voteOption    String    @map("vote_option")    // "agree", "disagree", "neutral"
  voteWeight    Float     @default(1.0) @map("vote_weight")  // 権限レベルによる重み
  votedAt       DateTime  @default(now()) @map("voted_at")
  postCategory  String?   @map("post_category")  // "改善提案", "質問相談" etc.
  postType      String?   @map("post_type")      // "personal", "department", "organization"

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])  // 1人1投稿1回のみ投票可能
  @@index([userId])
  @@index([postId])
  @@index([votedAt])
  @@map("vote_history")
}
```

**使用例**:
```typescript
// PersonalStationPage.tsx 76-81行目のダミーデータを置き換え
const voteStats = await prisma.voteHistory.groupBy({
  by: ['userId'],
  where: { userId: currentUser.id },
  _count: { id: true }
});

const thisMonthVotes = await prisma.voteHistory.count({
  where: {
    userId: currentUser.id,
    votedAt: { gte: startOfMonth(new Date()) }
  }
});
```

**マイグレーション**:
```bash
# VoiceDrive側で実行
npx prisma migrate dev --name add_vote_history
```

---

#### Table-2: UserActivitySummary（ユーザー活動サマリー）

**優先度**: 🟡 **RECOMMENDED（パフォーマンス最適化）**

**理由**:
- PersonalStationPage.tsxで複数の統計情報を表示（投稿数、投票数、フィードバック数等）
- 毎回集計クエリを実行するとパフォーマンス低下
- 事前集計テーブルでレスポンス時間を改善

**スキーマ定義**:
```prisma
model UserActivitySummary {
  id                    String    @id @default(cuid())
  userId                String    @unique @map("user_id")
  totalPosts            Int       @default(0) @map("total_posts")
  totalVotes            Int       @default(0) @map("total_votes")
  thisMonthVotes        Int       @default(0) @map("this_month_votes")
  impactScore           Float     @default(0) @map("impact_score")
  feedbackReceived      Int       @default(0) @map("feedback_received")
  feedbackSent          Int       @default(0) @map("feedback_sent")
  projectsProposed      Int       @default(0) @map("projects_proposed")
  surveysCompleted      Int       @default(0) @map("surveys_completed")
  loginDays             Int       @default(0) @map("login_days")
  lastCalculatedAt      DateTime  @default(now()) @map("last_calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([impactScore])
  @@map("user_activity_summary")
}
```

**更新ロジック**:
```typescript
// 日次バッチで更新（午前2時実行）
async function updateActivitySummaries() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const summary = {
      totalPosts: await prisma.post.count({ where: { authorId: user.id } }),
      totalVotes: await prisma.voteHistory.count({ where: { userId: user.id } }),
      thisMonthVotes: await prisma.voteHistory.count({
        where: {
          userId: user.id,
          votedAt: { gte: startOfMonth(new Date()) }
        }
      }),
      feedbackReceived: await prisma.feedback.count({ where: { receiverId: user.id } }),
      feedbackSent: await prisma.feedback.count({ where: { senderId: user.id } }),
      // ... 他の集計
    };

    await prisma.userActivitySummary.upsert({
      where: { userId: user.id },
      update: { ...summary, lastCalculatedAt: new Date() },
      create: { userId: user.id, ...summary }
    });
  }
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_user_activity_summary
```

---

### D. 既存テーブル修正（1件）

#### Modify-1: UserテーブルにexperienceYears追加

**対象テーブル**: `User`

**追加フィールド**:
```prisma
model User {
  // ... 既存フィールド
  experienceYears       Float?    @map("experience_years")  // 🆕 総職務経験年数（キャッシュ）

  // 🆕 新規リレーション
  voteHistory           VoteHistory[]
  activitySummary       UserActivitySummary?
}
```

**データソース**:
- 医療システムAPI-2（`/api/v2/employees/{employeeId}/experience-summary`）から取得
- Webhook-2で更新通知を受け取り、キャッシュを更新

**マイグレーション**:
```sql
-- VoiceDrive: prisma/migrations/xxx_add_experience_years.sql
ALTER TABLE users ADD COLUMN experience_years DECIMAL(4,1) NULL;
CREATE INDEX idx_users_experience_years ON users(experience_years);
```

**初期データ投入**:
```typescript
// 全ユーザーの経験年数を医療システムAPIから取得して更新
const users = await prisma.user.findMany();
for (const user of users) {
  const expData = await medicalSystemAPI.getExperienceSummary(user.employeeId);
  await prisma.user.update({
    where: { id: user.id },
    data: { experienceYears: expData.totalExperienceYears }
  });
}
```

---

## ❓ 医療システムチームへの確認事項

### 確認-1: WorkExperienceテーブルの存在確認

**質問**:
> DB構築計画書（`C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md`）には`WorkExperience`テーブルが記載されていると認識していますが、以下を確認させてください：
>
> 1. `WorkExperience`テーブルは確実に実装予定ですか？
> 2. 以下のフィールドは含まれますか？
>    - `employeeId` (外部キー)
>    - `startDate` (開始日)
>    - `endDate` (終了日、null=現在も継続中)
>    - `organizationId` (当法人かどうか判定用)
>    - `positionType` (職種)
> 3. API-2（経験年数サマリーAPI）の実装は可能ですか？

**期待回答**:
- ✅ WorkExperienceテーブル実装確定
- ✅ 必要フィールド全て含まれる
- ✅ API-2実装可能

---

### 確認-2: Webhook送信頻度とバッチ処理

**質問**:
> Webhook-2（職員経験年数更新通知）について：
>
> 1. `WorkExperience`が更新されるたびにリアルタイム送信すると頻繁すぎる可能性があります。以下のどちらの方式を希望しますか？
>    - **Option A**: リアルタイム送信（WorkExperience更新時に即座にWebhook）
>    - **Option B**: バッチ送信（日次または週次で経験年数を再計算し、変更があった職員のみWebhook送信）
>
> 2. VoiceDrive側では**Option B（日次バッチ）**を推奨しますが、医療システム側の負荷やポリシーに合わせます。

**推奨回答**:
- Option B: 日次バッチ（毎日午前1時に全職員の経験年数を再計算、前日から変更があった職員のみWebhook送信）

---

### 確認-3: API認証とセキュリティポリシー

**質問**:
> API-1、API-2の認証方式について：
>
> 1. JWT Bearer Token認証で問題ありませんか？
> 2. トークン発行方法は以下を想定していますが、変更が必要ですか？
>    ```
>    POST /api/v2/auth/token
>    Body: { "clientId": "voicedrive", "clientSecret": "xxx" }
>    Response: { "accessToken": "jwt_token", "expiresIn": 3600 }
>    ```
> 3. Rate Limitは100 req/min/IPで十分ですか？もっと緩和が必要ですか？

**期待回答**:
- ✅ JWT認証でOK
- ✅ トークン発行方法でOK（またはOAuth 2.0等の代替案）
- ✅ Rate Limit調整案（例: 300 req/min）

---

## 📅 想定スケジュール

### Phase 1: 要件確認（1週間）
- **Week 1**: 医療システムチームからの回答受領、仕様確定

### Phase 2: 医療システム側実装（2週間）
- **Week 2**: API-1, API-2実装
- **Week 3**: Webhook-1~4実装、テスト環境構築

### Phase 3: VoiceDrive側実装（1週間）
- **Week 4**: VoteHistory, UserActivitySummary追加、Webhook受信実装

### Phase 4: 統合テスト（1週間）
- **Week 5**: E2Eテスト、負荷テスト、セキュリティ監査

### Phase 5: 本番リリース
- **Week 6**: 段階的ロールアウト（10% → 50% → 100%）

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Employee   │      │WorkExperience│                    │
│  │   (Master)   │──────│   (履歴)     │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                      │                             │
│         │ ①API提供             │ ②経験年数計算              │
│         ▼                      ▼                             │
│  ┌─────────────────────────────────────┐                   │
│  │  API-1: 職員基本情報                 │                   │
│  │  API-2: 経験年数サマリー             │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                     │
│         │ ③Webhook通知（変更時）                            │
│         ▼                                                     │
└─────────────────────────────────────────────────────────────┘
         │
         │ HTTPS + JWT Auth
         │ HMAC-SHA256 Signature
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  Webhook受信: /api/webhooks/employee-*   │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ④キャッシュ更新                                    │
│         ▼                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     User     │  │ VoteHistory  │  │ ActivitySum  │     │
│  │  (キャッシュ) │  │  (VD専用)    │  │   (VD専用)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                   │
│                           │ ⑤統計表示                        │
│                           ▼                                   │
│                ┌──────────────────────┐                      │
│                │ PersonalStationPage  │                      │
│                │  - プロフィール      │                      │
│                │  - 活動統計          │                      │
│                │  - 投票履歴          │                      │
│                └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### 医療システム側作業

- [ ] **確認-1**: WorkExperienceテーブル仕様確認
- [ ] **確認-2**: Webhook送信頻度決定
- [ ] **確認-3**: API認証方式確認
- [ ] **API-1**: 職員基本情報取得API実装
- [ ] **API-2**: 経験年数サマリーAPI実装
- [ ] **Webhook-1**: 職員情報更新通知実装
- [ ] **Webhook-2**: 経験年数更新通知実装
- [ ] **Webhook-3**: 職員退職通知実装
- [ ] **Webhook-4**: 職員復職通知実装
- [ ] テスト環境でのAPI動作確認
- [ ] Webhook署名検証テスト

### VoiceDrive側作業

- [ ] **Table-1**: VoteHistoryテーブル追加
- [ ] **Table-2**: UserActivitySummaryテーブル追加
- [ ] **Modify-1**: User.experienceYears追加
- [ ] Webhook受信エンドポイント実装（4件）
- [ ] HMAC-SHA256署名検証実装
- [ ] API呼び出しクライアント実装（2件）
- [ ] PersonalStationPageのダミーデータ削除、実データ接続
- [ ] 統合テスト実装
- [ ] パフォーマンステスト（1000ユーザー想定）

---

## 📝 補足資料

### 参照ドキュメント

1. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

2. **PersonalStation DB要件分析**
   `mcp-shared/docs/PersonalStation_DB要件分析_20251008.md`

3. **医療システムDB構築計画書**
   `C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md`

4. **共通DB構築後統合作業再開計画書**
   `mcp-shared/docs/共通DB構築後統合作業再開計画書_20251008.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Express.js (API Server)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js
- NestJS (API Server)

---

**作成者**: AI (Claude Code)
**承認待ち**: 医療システムチームからの確認事項回答
**次のステップ**: VoiceDrive schema.prisma更新 → 医療チームへ送付

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-08 | 初版作成 | AI (Claude Code) |
