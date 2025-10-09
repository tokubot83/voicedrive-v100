# ComposeForm（投稿フォーム）DB要件分析 - 2025年10月9日

## 📋 基本情報

### 対象ファイル
- **メインファイル**: `src/components/ComposeForm.tsx` (899行)
- **関連ファイル**:
  - `src/pages/ComposePage.tsx` (84行) - ComposeFormコンポーネントを使用
  - `src/types/index.ts` - Post型定義、ProposalType型定義
  - `src/types/poll.ts` - Poll、CreatePollData型定義
  - `src/types/event.ts` - Event、CreateEventData型定義
  - `src/config/proposalTypes.ts` - 4種類の提案タイプ設定
  - `src/services/MedicalSystemWebhook.ts` - 医療システムへのWebhook通知
  - `src/hooks/useDataConsent.ts` - データ分析同意管理

### ページ分類
- **Group**: 1 (Core Pages - 中核機能ページ)
- **権限レベル**: Level 1.0以上（全職員が利用）
- **重要度**: 🔴 **CRITICAL** - 全ての投稿・提案の作成に使用される中核コンポーネント

### 機能概要
ComposeFormは、VoiceDriveの**最も重要なコンポーネント**で、以下3種類の投稿を作成します：

1. **💡 アイデアボイス (improvement)**
   - 業務改善提案（4段階フロー）
   - 提案タイプ: operational, communication, innovation, strategic
   - 重要度設定、匿名性設定
   - **医療システムへWebhook通知** (`proposal.created` event)

2. **💬 フリーボイス (community)**
   - フリースペース投稿（3段階フロー）
   - カテゴリ: idea_sharing, casual_discussion, event_planning
   - スコープ: team, department, facility, organization
   - 投票機能（Poll）作成オプション
   - イベント企画機能（Event）作成オプション
   - **有効期限設定**（カテゴリ別デフォルト or カスタム）

3. **🚨 コンプライアンス相談 (report)**
   - コンプライアンス窓口（3段階フロー）
   - 匿名性は "完全匿名" 固定
   - 重要度設定

### 主要機能
- **コンテンツモデレーション**: リアルタイム & 投稿前チェック
- **建設性スコア**: 投稿内容の建設性を自動評価
- **季節別キャパシティ管理**: 季節に応じた提案受付制限
- **データ分析同意モーダル**: 初回投稿時に同意確認
- **投稿ガイドライン表示**: モデレーション違反時にガイドライン表示

---

## 🔍 現在の実装状態

### データフロー
1. **ユーザー情報取得**: `useUser()` からユーザー情報とpermissionLevel取得
2. **コンテンツ入力**: テキストエリアで投稿内容入力
3. **リアルタイムモデレーション**: 入力中にClientModerationService.checkContentRealtime()
4. **設定選択**: 提案タイプ/重要度/匿名性/フリースペースオプション選択
5. **投稿前チェック**: ContentModerationService.moderateContent()で最終チェック
6. **同意確認**: 初回投稿時にDataConsentModal表示
7. **投稿実行**: executeSubmission()で投稿処理
8. **Webhook通知**: improvement投稿時に医療システムへ通知

### 主要な状態管理 (useState)
```typescript
// 基本情報
const [step, setStep] = useState(1); // フローのステップ
const [content, setContent] = useState(''); // 投稿内容
const [proposalType, setProposalType] = useState<ProposalType>('operational');
const [priority, setPriority] = useState<Priority>('medium');
const [anonymity, setAnonymity] = useState<AnonymityLevel>('real_name');

// フリースペース用
const [freespaceCategory, setFreespaceCategory] = useState<FreespaceCategory>();
const [freespaceScope, setFreespaceScope] = useState<StakeholderGroup>();
const [pollData, setPollData] = useState<CreatePollData | null>(null);
const [eventData, setEventData] = useState<CreateEventData | null>(null);

// 有効期限
const [useCustomExpiration, setUseCustomExpiration] = useState(false);
const [customExpirationDate, setCustomExpirationDate] = useState('');
const [customExpirationTime, setCustomExpirationTime] = useState('23:59');

// モデレーション
const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
const [realtimeModerationResult, setRealtimeModerationResult] = useState<ModerationResult | null>(null);

// 同意管理
const [showConsentModal, setShowConsentModal] = useState(false);
const [pendingSubmission, setPendingSubmission] = useState(false);
```

### 現在のデータ永続化状態
**🔴 CRITICAL**: 現在、**投稿データはどこにも保存されていません**。

- `executeSubmission()` では以下のみ実行：
  1. キャパシティチェック（`checkCanSubmit()`）
  2. コンテンツモデレーション
  3. 有効期限計算（フリースペースのみ）
  4. データ構造の作成（proposalId生成）
  5. **console.log()でデータ出力**
  6. **Webhook通知（improvement投稿のみ）**
  7. `alert('投稿が完了しました！')`
  8. `onCancel()` で画面を閉じる

**実際のデータベース保存処理は実装されていません。**

---

## 🗄️ 必要なデータベース要件

### 1. 🔴 Postテーブル（必須・緊急）

#### 基本スキーマ
```prisma
model Post {
  id                    String    @id @default(cuid())

  // 基本情報
  type                  String    // 'improvement' | 'community' | 'report'
  content               String    @db.Text
  authorId              String    // User.id FK
  anonymityLevel        String    // AnonymityLevel enum
  status                String    @default("active") // 'active' | 'archived' | 'deleted'

  // improvement投稿専用
  proposalType          String?   // 'operational' | 'communication' | 'innovation' | 'strategic'
  priority              String?   // 'low' | 'medium' | 'high' | 'urgent'

  // community投稿専用（フリースペース）
  freespaceCategory     String?   // 'idea_sharing' | 'casual_discussion' | 'event_planning'
  freespaceScope        String?   // 'team' | 'department' | 'facility' | 'organization'
  expirationDate        DateTime?
  isExpired             Boolean   @default(false)
  extensionRequested    Boolean   @default(false)
  extensionReason       String?   @db.Text

  // メタデータ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // 議題モード用（将来実装）
  agendaScore           Int?      @default(0)
  agendaLevel           String?   // 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA'

  // 季節情報（キャパシティ管理用）
  season                String?   // '春', '夏', '秋', '冬'

  // モデレーション情報
  moderationStatus      String    @default("pending") // 'pending' | 'approved' | 'flagged'
  moderationScore       Int?      // 建設性スコア (0-100)

  // リレーション
  author                User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  votes                 Vote[]
  comments              Comment[]
  poll                  Poll?
  event                 Event?

  @@index([authorId])
  @@index([type])
  @@index([status])
  @@index([proposalType])
  @@index([freespaceCategory])
  @@index([createdAt])
  @@index([expirationDate])
}
```

#### フィールド詳細仕様

| フィールド | 型 | NULL | デフォルト | 説明 | ComposeForm内での使用箇所 |
|----------|------|------|-----------|------|--------------------------|
| `id` | String | NO | cuid() | 投稿ID | `proposalId = \`proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}\`` (line 240) |
| `type` | String | NO | - | 投稿タイプ | `selectedType: PostType` prop (line 22) |
| `content` | Text | NO | - | 投稿内容 | `content` state (line 28) |
| `authorId` | String | NO | - | 投稿者ID | `user.id` from useUser() (line 35) |
| `anonymityLevel` | String | NO | - | 匿名性レベル | `anonymity` state (line 31), 初期値はtypeに応じて設定 (lines 83-89) |
| `status` | String | NO | 'active' | 投稿ステータス | 新規投稿時は 'active' |
| `proposalType` | String | YES | NULL | 提案タイプ | `proposalType` state (line 29), improvement時のみ使用 |
| `priority` | String | YES | NULL | 重要度 | `priority` state (line 30), improvement/report時のみ使用 |
| `freespaceCategory` | String | YES | NULL | フリースペースカテゴリ | `freespaceCategory` state (line 39), community時のみ使用 |
| `freespaceScope` | String | YES | NULL | フリースペーススコープ | `freespaceScope` state (line 40), community時のみ使用 |
| `expirationDate` | DateTime | YES | NULL | 有効期限 | `expirationDate` 計算 (lines 222-237) |
| `isExpired` | Boolean | NO | false | 期限切れフラグ | サーバー側バッチ処理で更新 |
| `extensionRequested` | Boolean | NO | false | 延長リクエスト | 将来実装（UI未実装） |
| `extensionReason` | Text | YES | NULL | 延長理由 | 将来実装（UI未実装） |
| `createdAt` | DateTime | NO | now() | 作成日時 | 自動設定 |
| `updatedAt` | DateTime | NO | now() | 更新日時 | 自動更新 |
| `agendaScore` | Int | YES | 0 | 議題スコア | 将来実装（投票・コメントで加点） |
| `agendaLevel` | String | YES | NULL | 議題レベル | 将来実装（スコア閾値で判定） |
| `season` | String | YES | NULL | 季節 | `currentSeason` from useSeasonalCapacity() (line 50) |
| `moderationStatus` | String | NO | 'pending' | モデレーションステータス | `moderationResult` (line 61) から判定 |
| `moderationScore` | Int | YES | NULL | 建設性スコア | `clientModerationService.assessConstructiveness(content)` (lines 553-565) |

#### 重要な実装ノート

##### 1. 有効期限の計算ロジック（community投稿）
```typescript
// lines 222-237
let expirationDate: Date | undefined;
if (selectedType === 'community') {
  if (useCustomExpiration && customExpirationDate) {
    // カスタム期限
    const customDate = new Date(`${customExpirationDate}T${customExpirationTime}`);
    expirationDate = customDate;
  } else {
    // デフォルト期限
    const categoryKey = freespaceCategory === FreespaceCategory.IDEA_SHARING ? 'idea_sharing' :
                       freespaceCategory === FreespaceCategory.CASUAL_DISCUSSION ? 'casual_discussion' :
                       'event_planning';
    expirationDate = FreespaceExpirationService.getDefaultExpirationDate(
      categoryKey,
      eventData?.proposedDates?.[0] ? new Date(eventData.proposedDates[0].date) : undefined
    );
  }
}
```

**デフォルト有効期限**:
- `idea_sharing`: 30日後
- `casual_discussion`: 7日後
- `event_planning`: イベント終了日+1日

##### 2. 匿名性レベルの初期設定
```typescript
// lines 82-90
if (selectedType === 'improvement') {
  setAnonymity('real_name');
} else if (selectedType === 'community') {
  setAnonymity('department_only');
} else if (selectedType === 'report') {
  setAnonymity('anonymous'); // report時は完全匿名固定
}
```

##### 3. ProposalTypeの選択肢（improvement投稿）
```typescript
// src/config/proposalTypes.ts
const proposalTypes = [
  {
    type: 'operational',
    label: '業務改善',
    icon: '🏥',
    description: '診療業務・介護業務・事務作業の効率化や品質向上の提案',
    weights: [...] // ステークホルダー重み付け
  },
  {
    type: 'communication',
    label: 'コミュニケーション',
    icon: '👥',
    description: '職場環境・福利厚生・人間関係の改善提案',
    weights: [...]
  },
  {
    type: 'innovation',
    label: 'イノベーション',
    icon: '💡',
    description: '技術革新（AI・DX導入）・制度革新・働き方革新',
    weights: [...]
  },
  {
    type: 'strategic',
    label: '戦略提案',
    icon: '🎯',
    description: '組織運営・経営戦略・事業展開に関する管理職向け提案',
    weights: [...]
  }
];
```

---

### 2. 🔴 Pollテーブル（必須）

フリースペース投稿（community）で投票機能を使用する場合に必要。

#### 基本スキーマ
```prisma
model Poll {
  id              String        @id @default(cuid())
  postId          String        @unique
  question        String
  description     String?       @db.Text
  totalVotes      Int           @default(0)
  deadline        DateTime
  isActive        Boolean       @default(true)
  allowMultiple   Boolean       @default(false)
  showResults     String        // 'afterVote' | 'afterDeadline' | 'always'
  category        String        // 'idea_sharing' | 'casual_discussion' | 'event_planning'
  scope           String        // 'team' | 'department' | 'facility' | 'organization'
  createdAt       DateTime      @default(now())
  createdById     String

  post            Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdBy       User          @relation(fields: [createdById], references: [id])
  options         PollOption[]
  votes           PollVote[]

  @@index([postId])
  @@index([deadline])
  @@index([isActive])
}

model PollOption {
  id        String      @id @default(cuid())
  pollId    String
  text      String
  emoji     String?
  votes     Int         @default(0)
  sortOrder Int         @default(0)

  poll      Poll        @relation(fields: [pollId], references: [id], onDelete: Cascade)
  pollVotes PollVote[]

  @@index([pollId])
}

model PollVote {
  id           String    @id @default(cuid())
  pollId       String
  optionId     String
  userId       String
  isAnonymous  Boolean   @default(false)
  timestamp    DateTime  @default(now())

  poll         Poll      @relation(fields: [pollId], references: [id], onDelete: Cascade)
  option       PollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([pollId, userId, optionId])
  @@index([pollId])
  @@index([userId])
}
```

#### CreatePollData型（ComposeForm内で使用）
```typescript
// src/types/poll.ts
export interface CreatePollData {
  question: string;
  description?: string;
  options: { text: string; emoji?: string }[];
  duration: number; // 分単位
  allowMultiple?: boolean;
  showResults: 'afterVote' | 'afterDeadline' | 'always';
  category: 'idea_sharing' | 'casual_discussion' | 'event_planning';
  scope: 'team' | 'department' | 'facility' | 'organization';
}
```

ComposeForm内での使用:
```typescript
// line 41
const [pollData, setPollData] = useState<CreatePollData | null>(null);

// FreespaceOptionsコンポーネントから設定
<FreespaceOptions
  showPollOption={true}
  onCreatePoll={setPollData}
/>
```

---

### 3. 🔴 Eventテーブル（必須）

フリースペース投稿（community）でイベント企画機能を使用する場合に必要。

#### 基本スキーマ
```prisma
model Event {
  id                    String          @id @default(cuid())
  postId                String          @unique
  title                 String
  description           String          @db.Text
  type                  String          // EventType enum

  // 日程情報
  registrationDeadline  DateTime?
  finalDate             DateTime?
  finalStartTime        String?
  finalEndTime          String?

  // 参加者情報
  organizerId           String
  maxParticipants       Int?

  // 会場・詳細
  venueName             String?
  venueAddress          String?
  cost                  Float?
  requirements          Json?           // string[]

  // ステータス
  status                String          @default("planning") // EventStatus enum
  visibility            String          // EventVisibility enum

  // 機能設定
  allowDateVoting       Boolean         @default(true)
  allowComments         Boolean         @default(true)
  sendReminders         Boolean         @default(true)

  // メタデータ
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  tags                  Json?           // string[]

  post                  Post            @relation(fields: [postId], references: [id], onDelete: Cascade)
  organizer             User            @relation(fields: [organizerId], references: [id])
  proposedDates         ProposedDate[]
  participants          Participant[]

  @@index([postId])
  @@index([organizerId])
  @@index([status])
}

model ProposedDate {
  id          String      @id @default(cuid())
  eventId     String
  date        DateTime
  startTime   String
  endTime     String
  totalVotes  Int         @default(0)
  sortOrder   Int         @default(0)

  event       Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  votes       DateVote[]

  @@index([eventId])
}

model DateVote {
  id              String        @id @default(cuid())
  proposedDateId  String
  userId          String
  response        String        // 'available' | 'maybe' | 'unavailable'
  timestamp       DateTime      @default(now())

  proposedDate    ProposedDate  @relation(fields: [proposedDateId], references: [id], onDelete: Cascade)
  user            User          @relation(fields: [userId], references: [id])

  @@unique([proposedDateId, userId])
  @@index([proposedDateId])
  @@index([userId])
}

model Participant {
  id                  String    @id @default(cuid())
  eventId             String
  userId              String
  status              String    // 'confirmed' | 'tentative' | 'declined' | 'waitlisted'
  joinedAt            DateTime  @default(now())
  note                String?   @db.Text
  dietaryRequirements Json?     // string[]

  event               Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user                User      @relation(fields: [userId], references: [id])

  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
}
```

#### CreateEventData型（ComposeForm内で使用）
```typescript
// src/types/event.ts
export interface CreateEventData {
  title: string;
  description: string;
  type: EventType;
  proposedDates: {
    date: string; // ISO date string
    startTime: string;
    endTime: string;
  }[];
  maxParticipants?: number;
  venue?: { name: string; address?: string; cost?: number };
  cost?: number;
  requirements?: string[];
  registrationDeadline?: string; // ISO date string
  visibility: EventVisibility;
  allowDateVoting: boolean;
  allowParticipantComments: boolean;
  sendReminders: boolean;
  tags?: string[];
}
```

ComposeForm内での使用:
```typescript
// line 42
const [eventData, setEventData] = useState<CreateEventData | null>(null);

// FreespaceOptionsコンポーネントから設定
<FreespaceOptions
  showEventOption={freespaceCategory === FreespaceCategory.EVENT_PLANNING}
  onCreateEvent={setEventData}
/>
```

---

### 4. 🟡 DataConsentテーブル（推奨）

データ分析同意管理用。初回投稿時に同意モーダルを表示し、同意状態を保存。

#### 基本スキーマ
```prisma
model DataConsent {
  id                        String    @id @default(cuid())
  userId                    String    @unique

  // 同意状態
  analyticsConsent          Boolean   @default(false)
  personalFeedbackConsent   Boolean   @default(false)

  // 同意日時
  consentedAt               DateTime?
  revokedAt                 DateTime?

  // 取り消し・削除
  isRevoked                 Boolean   @default(false)
  dataDeletionRequested     Boolean   @default(false)
  dataDeletionRequestedAt   DateTime?

  // メタデータ
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  user                      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

#### useDataConsent()フックの動作
```typescript
// ComposeForm lines 71-75
const {
  shouldShowConsentModal,
  updateConsent,
  refreshConsentStatus
} = useDataConsent(user?.id || 'demo-user');

// 初回投稿時の処理 (lines 150-156)
const handleSubmit = async () => {
  if (shouldShowConsentModal) {
    setShowConsentModal(true);
    setPendingSubmission(true);
    return;
  }
  await executeSubmission();
};

// 同意処理 (lines 165-185)
const handleConsent = async (consented: boolean) => {
  await updateConsent({ analyticsConsent: consented });
  setShowConsentModal(false);
  await refreshConsentStatus();
  if (pendingSubmission) {
    setPendingSubmission(false);
    await executeSubmission();
  }
};
```

**同意モーダル表示条件**:
- ユーザーの初回投稿時
- DataConsentレコードが存在しない、または `analyticsConsent = false` の場合

---

### 5. 🟡 Voteテーブル（推奨・将来実装）

投稿に対する5段階投票機能。現在ComposeFormでは使用していないが、投稿表示時に必要。

#### 基本スキーマ
```prisma
model Vote {
  id        String    @id @default(cuid())
  postId    String
  userId    String
  option    String    // 'strongly-oppose' | 'oppose' | 'neutral' | 'support' | 'strongly-support'
  timestamp DateTime  @default(now())

  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}
```

---

### 6. 🟡 Commentテーブル（推奨・将来実装）

投稿に対するコメント機能。現在ComposeFormでは使用していないが、投稿表示時に必要。

#### 基本スキーマ
```prisma
model Comment {
  id              String    @id @default(cuid())
  postId          String
  parentId        String?   // 返信の場合、親コメントID
  authorId        String
  content         String    @db.Text
  commentType     String    // 'proposal' | 'question' | 'support' | 'concern'
  anonymityLevel  String
  privacyLevel    String?
  likes           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent          Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies         Comment[] @relation("CommentReplies")
  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([parentId])
  @@index([authorId])
}
```

---

## 🔗 医療システム統合要件

### Webhook通知（VoiceDrive → 医療システム）

#### 1. proposal.created イベント

**送信タイミング**: improvement投稿作成時（lines 256-280）

**送信条件**:
- `user` が存在
- `userPermissionLevel` が存在
- `selectedType === 'improvement'`

**ペイロード**:
```typescript
{
  event: 'proposal.created',
  timestamp: '2025-10-09T12:34:56.789Z',
  data: {
    proposalId: 'proposal_1728467696789_abc123def',
    staffId: 'staff_001',
    staffName: '田中太郎',
    department: '看護部',
    title: '夜勤シフトの負担軽減のため、3交代制から2交代制への移行を提案します。', // 最初の50文字
    content: '夜勤シフトの負担軽減のため、3交代制から2交代制への移行を提案します。これにより...',
    proposalType: 'operational',
    priority: 'medium',
    permissionLevel: 2.0,
    expectedAgendaLevel: '部署検討レベル（30点以上で部署内検討対象）'
  }
}
```

**医療システム側の処理**:
1. 議題作成ログを記録
2. 職員カルテに「提案活動」を記録
3. permissionLevelに基づいて上位承認者に通知
4. expectedAgendaLevelに基づいて委員会提出可否を判定

**エラーハンドリング**:
```typescript
// lines 272-279
if (webhookSuccess) {
  console.log(`[Phase 3] 医療システムに議題作成を通知しました: ${proposalId}`);
} else {
  console.warn(`[Phase 3] 医療システムへの通知に失敗しましたが、投稿は継続します: ${proposalId}`);
}
```
- Webhook送信失敗しても投稿処理は継続
- タイムアウト: 5秒（MedicalSystemWebhook.timeout）

#### 議題レベル自動判定ロジック
```typescript
// lines 126-133
const getExpectedAgendaLevel = (permissionLevel: number): string => {
  if (permissionLevel >= 8) return '施設議題レベル（100点以上で委員会提出可能）';
  if (permissionLevel >= 5) return '部署議題レベル（50点以上で部署課題として扱われます）';
  if (permissionLevel >= 3) return '部署検討レベル（30点以上で部署内検討対象）';
  return '検討中レベル（まずは関係者から意見を集めます）';
};
```

### API要件（医療システム → VoiceDrive）

ComposeFormでは**医療システムからのAPIは使用していません**。

使用しているデータは全てVoiceDrive側で管理:
- ユーザー情報: `useUser()` フック経由
- 権限レベル: `user.calculatedLevel` または `user.accountLevel`
- 部署情報: `user.department`

---

## 🎯 実装タスク

### Phase 1: データベーススキーマ実装（🔴 CRITICAL）

**期限**: 2025年10月11日（金）まで

#### タスク1.1: Postテーブル作成
- [ ] Prismaスキーマに `Post` モデル追加
- [ ] 必須フィールド: id, type, content, authorId, anonymityLevel, status, createdAt, updatedAt
- [ ] improvement専用: proposalType, priority
- [ ] community専用: freespaceCategory, freespaceScope, expirationDate, isExpired
- [ ] メタデータ: season, moderationStatus, moderationScore
- [ ] インデックス: authorId, type, status, proposalType, freespaceCategory, createdAt, expirationDate
- [ ] Foreign Key: author → User

#### タスク1.2: Pollテーブル作成
- [ ] `Poll`, `PollOption`, `PollVote` モデル追加
- [ ] Post ↔ Poll の1:1リレーション設定
- [ ] インデックス設定

#### タスク1.3: Eventテーブル作成
- [ ] `Event`, `ProposedDate`, `DateVote`, `Participant` モデル追加
- [ ] Post ↔ Event の1:1リレーション設定
- [ ] インデックス設定

#### タスク1.4: DataConsentテーブル作成
- [ ] `DataConsent` モデル追加
- [ ] User ↔ DataConsent の1:1リレーション設定
- [ ] userId uniqueインデックス

#### タスク1.5: マイグレーション実行
```bash
npx prisma migrate dev --name add_post_poll_event_consent_tables
```

---

### Phase 2: API実装（🔴 CRITICAL）

**期限**: 2025年10月15日（火）まで

#### API-5: 投稿作成API（POST）

**エンドポイント**: `POST /api/posts`

**リクエストボディ**:
```typescript
{
  // 基本情報
  type: 'improvement' | 'community' | 'report',
  content: string,
  anonymityLevel: AnonymityLevel,

  // improvement専用（optional）
  proposalType?: 'operational' | 'communication' | 'innovation' | 'strategic',
  priority?: 'low' | 'medium' | 'high' | 'urgent',

  // community専用（optional）
  freespaceCategory?: 'idea_sharing' | 'casual_discussion' | 'event_planning',
  freespaceScope?: 'team' | 'department' | 'facility' | 'organization',
  expirationDate?: string, // ISO 8601
  pollData?: CreatePollData,
  eventData?: CreateEventData,

  // メタデータ
  season?: string,
  moderationScore?: number
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    id: 'post_abc123',
    type: 'improvement',
    content: '...',
    authorId: 'user_123',
    createdAt: '2025-10-09T12:34:56.789Z',
    // ... 全フィールド
  }
}
```

**バリデーション**:
- `content`: 10文字以上、500文字以下
- `type`: 'improvement' | 'community' | 'report' のみ
- `anonymityLevel`: 有効なAnonymityLevel値
- improvement時: proposalType必須
- community時: freespaceCategory, freespaceScope必須
- report時: anonymityLevel = 'anonymous' 強制

**ビジネスロジック**:
1. コンテンツモデレーションチェック
2. 季節別キャパシティチェック（`useSeasonalCapacity`）
3. Postレコード作成
4. Pollデータがあれば Poll, PollOption作成
5. Eventデータがあれば Event, ProposedDate作成
6. improvement時は医療システムへWebhook通知
7. DataConsent未同意の場合はエラー（クライアント側で制御）

#### API-6: データ同意状態取得API（GET）

**エンドポイント**: `GET /api/consent/:userId`

**レスポンス**:
```typescript
{
  success: true,
  data: {
    userId: 'user_123',
    analyticsConsent: false,
    personalFeedbackConsent: false,
    consentedAt: null,
    isRevoked: false,
    dataDeletionRequested: false
  }
}
```

#### API-7: データ同意更新API（POST）

**エンドポイント**: `POST /api/consent/:userId`

**リクエストボディ**:
```typescript
{
  analyticsConsent: boolean,
  personalFeedbackConsent?: boolean
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    userId: 'user_123',
    analyticsConsent: true,
    personalFeedbackConsent: false,
    consentedAt: '2025-10-09T12:34:56.789Z',
    isRevoked: false
  }
}
```

---

### Phase 3: ComposeForm統合実装（🔴 CRITICAL）

**期限**: 2025年10月18日（金）まで

#### タスク3.1: executeSubmission()実装

**現在の状態** (lines 198-284):
```typescript
const executeSubmission = async () => {
  // 1. キャパシティチェック
  if (!checkCanSubmit(currentProposalCount + 1)) {
    alert(`${capacityInfo.label}期の提案受付上限に達しています。`);
    return;
  }

  // 2. モデレーションチェック
  const modResult = await handleContentModeration(content);
  if (!modResult.allowed) {
    alert('投稿内容にガイドライン違反の可能性があります。');
    return;
  }

  // 3. 有効期限計算
  let expirationDate: Date | undefined;
  if (selectedType === 'community') {
    // ... 計算ロジック
  }

  // 4. proposalId生成
  const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 5. console.log() 🔴 ここをAPI呼び出しに変更
  console.log('Submitting:', { ... });

  // 6. Webhook通知（improvement時）
  if (user && userPermissionLevel && selectedType === 'improvement') {
    await medicalSystemWebhook.notifyProposalCreated({ ... });
  }

  // 7. 完了通知
  alert('投稿が完了しました！');
  onCancel();
};
```

**変更内容**:

```typescript
const executeSubmission = async () => {
  // 1. キャパシティチェック（既存）
  if (!checkCanSubmit(currentProposalCount + 1)) {
    alert(`${capacityInfo.label}期の提案受付上限に達しています。`);
    return;
  }

  // 2. モデレーションチェック（既存）
  const modResult = await handleContentModeration(content);
  if (!modResult.allowed) {
    alert('投稿内容にガイドライン違反の可能性があります。');
    return;
  }

  // 3. 有効期限計算（既存）
  let expirationDate: Date | undefined;
  if (selectedType === 'community') {
    if (useCustomExpiration && customExpirationDate) {
      expirationDate = new Date(`${customExpirationDate}T${customExpirationTime}`);
    } else {
      const categoryKey = freespaceCategory === FreespaceCategory.IDEA_SHARING ? 'idea_sharing' :
                         freespaceCategory === FreespaceCategory.CASUAL_DISCUSSION ? 'casual_discussion' :
                         'event_planning';
      expirationDate = FreespaceExpirationService.getDefaultExpirationDate(
        categoryKey,
        eventData?.proposedDates?.[0] ? new Date(eventData.proposedDates[0].date) : undefined
      );
    }
  }

  // 🆕 4. API呼び出し: POST /api/posts
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}` // JWT認証
      },
      body: JSON.stringify({
        // 基本情報
        type: selectedType,
        content,
        anonymityLevel: anonymity,

        // improvement専用
        proposalType: selectedType === 'improvement' ? proposalType : undefined,
        priority: selectedType !== 'community' ? priority : undefined,

        // community専用
        freespaceCategory: selectedType === 'community' ? freespaceCategory : undefined,
        freespaceScope: selectedType === 'community' ? freespaceScope : undefined,
        expirationDate: expirationDate?.toISOString(),
        pollData: selectedType === 'community' ? pollData : undefined,
        eventData: selectedType === 'community' ? eventData : undefined,

        // メタデータ
        season: currentSeason,
        moderationScore: clientModerationService.assessConstructiveness(content)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '投稿の作成に失敗しました。');
    }

    const result = await response.json();
    const createdPost = result.data;

    // 🆕 5. Webhook通知（improvement時）
    // サーバー側で実行するため、クライアント側では不要
    // if (selectedType === 'improvement') {
    //   await medicalSystemWebhook.notifyProposalCreated({ ... });
    // }

    // 6. 成功通知
    alert('投稿が完了しました！');

    // 🆕 7. 作成した投稿ページにリダイレクト
    navigate(`/posts/${createdPost.id}`);

  } catch (error) {
    console.error('[投稿作成エラー]', error);
    alert(error instanceof Error ? error.message : '投稿の作成中にエラーが発生しました。');
  }
};
```

**重要な変更点**:
1. `console.log()` → `fetch('/api/posts')` に変更
2. Webhook通知はサーバー側で実行（クライアント側から削除）
3. 成功時は投稿詳細ページにリダイレクト
4. エラーハンドリング追加

#### タスク3.2: useDataConsent統合確認
- [ ] DataConsentModal表示確認
- [ ] 同意/拒否処理確認
- [ ] API-6, API-7との統合確認

#### タスク3.3: テスト実装
```typescript
// tests/integration/compose-form.test.ts
describe('ComposeForm - 投稿作成', () => {
  it('improvement投稿を作成できる', async () => {
    // 1. ユーザーログイン
    // 2. ComposeFormを開く
    // 3. proposalType選択
    // 4. 内容入力
    // 5. priority, anonymity選択
    // 6. 投稿ボタンクリック
    // 7. データ同意モーダル表示確認
    // 8. 同意して投稿
    // 9. Postレコード作成確認
    // 10. Webhook送信確認
  });

  it('community投稿（Poll付き）を作成できる', async () => {
    // 1. ユーザーログイン（2回目投稿なので同意済み）
    // 2. ComposeFormを開く（type: community）
    // 3. freespaceCategory, freespaceScope選択
    // 4. Poll作成
    // 5. 内容入力
    // 6. 投稿ボタンクリック
    // 7. Post + Poll + PollOptionレコード作成確認
  });

  it('community投稿（Event付き）を作成できる', async () => {
    // 同様のテストケース
  });

  it('report投稿を作成できる', async () => {
    // 同様のテストケース（anonymity固定確認）
  });

  it('モデレーション違反時は投稿できない', async () => {
    // NGワード含む内容で投稿
    // エラーメッセージ表示確認
  });

  it('キャパシティ上限時は投稿できない', async () => {
    // 上限に達した状態をモック
    // エラーメッセージ表示確認
  });
});
```

---

### Phase 4: サーバー側実装（🔴 CRITICAL）

**期限**: 2025年10月20日（日）まで

#### タスク4.1: POST /api/posts エンドポイント実装

**ファイル**: `src/api/routes/post.routes.ts`

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';
import { medicalSystemWebhook } from '../services/MedicalSystemWebhook.server';

const router = Router();
const prisma = new PrismaClient();

router.post('/posts', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id; // JWT認証ミドルウェアから取得
    const {
      type,
      content,
      anonymityLevel,
      proposalType,
      priority,
      freespaceCategory,
      freespaceScope,
      expirationDate,
      pollData,
      eventData,
      season,
      moderationScore
    } = req.body;

    // 1. バリデーション
    if (!type || !content || !anonymityLevel) {
      return res.status(400).json({
        success: false,
        message: '必須フィールドが不足しています。'
      });
    }

    if (content.length < 10 || content.length > 500) {
      return res.status(400).json({
        success: false,
        message: '投稿内容は10文字以上、500文字以下で入力してください。'
      });
    }

    // 2. Postレコード作成
    const post = await prisma.post.create({
      data: {
        type,
        content,
        authorId: userId,
        anonymityLevel,
        proposalType,
        priority,
        freespaceCategory,
        freespaceScope,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        season,
        moderationScore,
        status: 'active',
        moderationStatus: 'pending'
      }
    });

    // 3. Pollデータがあれば作成
    if (pollData) {
      const poll = await prisma.poll.create({
        data: {
          postId: post.id,
          question: pollData.question,
          description: pollData.description,
          deadline: new Date(Date.now() + pollData.duration * 60 * 1000),
          allowMultiple: pollData.allowMultiple || false,
          showResults: pollData.showResults,
          category: pollData.category,
          scope: pollData.scope,
          createdById: userId
        }
      });

      // PollOption作成
      for (let i = 0; i < pollData.options.length; i++) {
        await prisma.pollOption.create({
          data: {
            pollId: poll.id,
            text: pollData.options[i].text,
            emoji: pollData.options[i].emoji,
            sortOrder: i
          }
        });
      }
    }

    // 4. Eventデータがあれば作成
    if (eventData) {
      const event = await prisma.event.create({
        data: {
          postId: post.id,
          title: eventData.title,
          description: eventData.description,
          type: eventData.type,
          organizerId: userId,
          maxParticipants: eventData.maxParticipants,
          venueName: eventData.venue?.name,
          venueAddress: eventData.venue?.address,
          cost: eventData.cost,
          requirements: eventData.requirements,
          registrationDeadline: eventData.registrationDeadline
            ? new Date(eventData.registrationDeadline)
            : undefined,
          status: 'planning',
          visibility: eventData.visibility,
          allowDateVoting: eventData.allowDateVoting,
          allowComments: eventData.allowParticipantComments,
          sendReminders: eventData.sendReminders,
          tags: eventData.tags
        }
      });

      // ProposedDate作成
      for (let i = 0; i < eventData.proposedDates.length; i++) {
        await prisma.proposedDate.create({
          data: {
            eventId: event.id,
            date: new Date(eventData.proposedDates[i].date),
            startTime: eventData.proposedDates[i].startTime,
            endTime: eventData.proposedDates[i].endTime,
            sortOrder: i
          }
        });
      }
    }

    // 5. Webhook通知（improvement投稿時）
    if (type === 'improvement') {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user) {
        const permissionLevel = user.calculatedLevel || user.accountLevel;

        await medicalSystemWebhook.notifyProposalCreated({
          proposalId: post.id,
          staffId: user.staffId,
          staffName: user.name,
          department: user.department,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          content,
          proposalType: proposalType || 'operational',
          priority: priority || 'medium',
          permissionLevel,
          expectedAgendaLevel: getExpectedAgendaLevel(permissionLevel)
        });
      }
    }

    // 6. レスポンス返却
    return res.status(201).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('[POST /api/posts] エラー:', error);
    return res.status(500).json({
      success: false,
      message: '投稿の作成中にエラーが発生しました。'
    });
  }
});

function getExpectedAgendaLevel(permissionLevel: number): string {
  if (permissionLevel >= 8) return '施設議題レベル（100点以上で委員会提出可能）';
  if (permissionLevel >= 5) return '部署議題レベル（50点以上で部署課題として扱われます）';
  if (permissionLevel >= 3) return '部署検討レベル（30点以上で部署内検討対象）';
  return '検討中レベル（まずは関係者から意見を集めます）';
}

export default router;
```

#### タスク4.2: GET /api/consent/:userId エンドポイント実装

**ファイル**: `src/api/routes/consent.routes.ts`

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/consent/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;

    // 権限チェック: 自分の同意状態のみ取得可能
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: '他のユーザーの同意状態は取得できません。'
      });
    }

    let consent = await prisma.dataConsent.findUnique({
      where: { userId }
    });

    // レコードが存在しない場合は初期値を返す
    if (!consent) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          analyticsConsent: false,
          personalFeedbackConsent: false,
          consentedAt: null,
          isRevoked: false,
          dataDeletionRequested: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: consent
    });

  } catch (error) {
    console.error('[GET /api/consent/:userId] エラー:', error);
    return res.status(500).json({
      success: false,
      message: '同意状態の取得中にエラーが発生しました。'
    });
  }
});

export default router;
```

#### タスク4.3: POST /api/consent/:userId エンドポイント実装

```typescript
router.post('/consent/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const { analyticsConsent, personalFeedbackConsent } = req.body;

    // 権限チェック
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: '他のユーザーの同意状態は更新できません。'
      });
    }

    const consent = await prisma.dataConsent.upsert({
      where: { userId },
      update: {
        analyticsConsent,
        personalFeedbackConsent: personalFeedbackConsent !== undefined
          ? personalFeedbackConsent
          : undefined,
        consentedAt: analyticsConsent ? new Date() : undefined,
        isRevoked: false
      },
      create: {
        userId,
        analyticsConsent,
        personalFeedbackConsent: personalFeedbackConsent || false,
        consentedAt: analyticsConsent ? new Date() : null
      }
    });

    return res.status(200).json({
      success: true,
      data: consent
    });

  } catch (error) {
    console.error('[POST /api/consent/:userId] エラー:', error);
    return res.status(500).json({
      success: false,
      message: '同意状態の更新中にエラーが発生しました。'
    });
  }
});
```

#### タスク4.4: サーバー側Webhook実装

**ファイル**: `src/api/services/MedicalSystemWebhook.server.ts`

```typescript
import fetch from 'node-fetch';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

interface ProposalCreatedData {
  proposalId: string;
  staffId: string;
  staffName: string;
  department: string;
  title: string;
  content: string;
  proposalType: string;
  priority: string;
  permissionLevel: number;
  expectedAgendaLevel: string;
}

export class MedicalSystemWebhook {
  private webhookUrl: string;
  private timeout: number = 5000;
  private apiKey: string;

  constructor() {
    this.webhookUrl = process.env.MEDICAL_WEBHOOK_URL || 'http://localhost:3000/api/webhook/voicedrive';
    this.apiKey = process.env.MEDICAL_API_KEY || '';
  }

  async notifyProposalCreated(data: ProposalCreatedData): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'proposal.created',
      timestamp: new Date().toISOString(),
      data
    };

    return this.sendWebhook(payload);
  }

  private async sendWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      console.log(`[Phase 3] Webhook送信: ${payload.event} -> ${this.webhookUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VoiceDrive-Source': 'webapp',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[Phase 3] Webhook送信成功: ${payload.event}`);
        return true;
      } else {
        console.warn(`[Phase 3] Webhook送信失敗: ${payload.event} - ${response.status}`);
        return false;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`[Phase 3] Webhookタイムアウト: ${payload.event}`);
      } else {
        console.error(`[Phase 3] Webhook送信エラー: ${payload.event}`, error);
      }
      return false;
    }
  }
}

export const medicalSystemWebhook = new MedicalSystemWebhook();
```

---

## 📊 医療システム側で必要な対応

### Webhook受信エンドポイント実装

**エンドポイント**: `POST /api/webhook/voicedrive`

**受信するイベント**:
1. **proposal.created** - VoiceDriveで議題が作成された

**処理内容**:
```typescript
// 医療システム側実装（参考）
router.post('/webhook/voicedrive', authenticateWebhook, async (req, res) => {
  const { event, timestamp, data } = req.body;

  switch (event) {
    case 'proposal.created':
      // 1. 議題作成ログを記録
      await db.insert('proposal_logs', {
        proposalId: data.proposalId,
        staffId: data.staffId,
        staffName: data.staffName,
        department: data.department,
        title: data.title,
        proposalType: data.proposalType,
        priority: data.priority,
        permissionLevel: data.permissionLevel,
        expectedAgendaLevel: data.expectedAgendaLevel,
        createdAt: timestamp
      });

      // 2. 職員カルテに活動記録
      await db.insert('staff_activity_log', {
        staffId: data.staffId,
        activityType: '提案活動',
        activityDetail: `${data.proposalType}提案「${data.title}」を作成`,
        permissionLevel: data.permissionLevel,
        timestamp
      });

      // 3. 上位承認者に通知（permissionLevelに応じて）
      if (data.permissionLevel >= 5) {
        await notifySupervisor(data.staffId, data.proposalId, data.title);
      }

      // 4. 委員会提出可否判定
      if (data.permissionLevel >= 8) {
        await markAsCommitteeCandidate(data.proposalId);
      }

      break;

    default:
      console.warn(`Unknown event: ${event}`);
  }

  res.status(200).json({ received: true });
});
```

---

## 🔍 確認事項（医療システムチームへ）

### Q1. Webhook受信エンドポイントのURL確認
- **質問**: `POST /api/webhook/voicedrive` エンドポイントは実装済みですか？
- **現在の設定**:
  - 開発環境: `http://localhost:3000/api/webhook/voicedrive`
  - 本番環境: 未確認
- **必要な対応**: 本番環境のWebhook URLを教えてください

### Q2. Webhook認証方式の確認
- **質問**: Webhook受信時の認証方式は何ですか？
- **現在の実装**:
  - `X-VoiceDrive-Source: webapp` ヘッダー
  - `X-API-Key` ヘッダー（環境変数 `MEDICAL_API_KEY`）
- **必要な対応**:
  - HMAC-SHA256署名が必要ですか？
  - API Keyは何を使用すべきですか？

### Q3. proposal.created イベントの処理確認
- **質問**: `proposal.created` イベント受信時の処理内容を確認してください
- **期待する動作**:
  1. 議題作成ログを `proposal_logs` テーブルに記録
  2. 職員カルテに「提案活動」を記録
  3. permissionLevel >= 5 の場合、上位承認者に通知
  4. permissionLevel >= 8 の場合、委員会提出候補としてマーク
- **必要な対応**: 上記の処理は実装可能ですか？追加要件はありますか？

### Q4. エラー時のリトライポリシー
- **質問**: Webhook送信失敗時のリトライは必要ですか？
- **現在の実装**:
  - タイムアウト: 5秒
  - リトライ: なし（失敗しても投稿処理は継続）
- **必要な対応**:
  - リトライが必要な場合、回数と間隔を教えてください
  - Dead Letter Queue (DLQ) の実装が必要ですか？

### Q5. テスト環境の準備
- **質問**: 統合テスト用のWebhook受信エンドポイントは準備されていますか？
- **必要な対応**: テスト環境のURL、認証情報を共有してください

---

## 📅 実装スケジュール

| Phase | タスク | 担当 | 期限 | ステータス |
|-------|-------|------|------|----------|
| **Phase 1** | データベーススキーマ実装 | VoiceDrive | 2025/10/11 (金) | 🟡 未着手 |
| - | Post, Poll, Event, DataConsent テーブル作成 | | | |
| - | マイグレーション実行 | | | |
| **Phase 2** | API実装 | VoiceDrive | 2025/10/15 (火) | 🟡 未着手 |
| - | POST /api/posts エンドポイント | | | |
| - | GET /api/consent/:userId エンドポイント | | | |
| - | POST /api/consent/:userId エンドポイント | | | |
| **Phase 3** | ComposeForm統合実装 | VoiceDrive | 2025/10/18 (金) | 🟡 未着手 |
| - | executeSubmission() API呼び出し実装 | | | |
| - | useDataConsent統合確認 | | | |
| - | 統合テスト実装 | | | |
| **Phase 4** | サーバー側実装 | VoiceDrive | 2025/10/20 (日) | 🟡 未着手 |
| - | post.routes.ts 実装 | | | |
| - | consent.routes.ts 実装 | | | |
| - | MedicalSystemWebhook.server.ts 実装 | | | |
| **Phase 5** | 医療システム側実装 | 医療システムチーム | 2025/10/22 (火) | 🟡 未着手 |
| - | POST /api/webhook/voicedrive 実装 | | | |
| - | proposal.created イベント処理実装 | | | |
| **Phase 6** | 統合テスト | 両チーム | 2025/10/25 (金) | 🟡 未着手 |
| - | E2Eテスト実施 | | | |
| - | Webhook疎通確認 | | | |
| - | パフォーマンステスト | | | |
| **Phase 7** | 本番リリース | 両チーム | 2025/10/28 (月) | 🟡 未着手 |

---

## 🚨 リスクと懸念事項

### 🔴 CRITICAL リスク

#### 1. Postテーブルが存在しない
- **影響**: 全ての投稿機能が動作しない
- **対応**: Phase 1を最優先で実施（10/11まで）

#### 2. API実装が未完了
- **影響**: ComposeFormからの投稿が保存されない
- **対応**: Phase 2を10/15までに完了

#### 3. Webhook疎通未確認
- **影響**: 医療システムに議題作成が通知されない
- **対応**: 医療システムチームと早急に調整（Q1-Q5確認事項）

### 🟡 MEDIUM リスク

#### 4. モデレーションロジックの性能
- **懸念**: リアルタイムモデレーションが重い場合、入力がカクつく
- **対応**: debounce処理が実装済み（300ms、line 452）

#### 5. 有効期限バッチ処理の実装
- **懸念**: 有効期限切れ投稿の自動更新処理が未実装
- **対応**: Phase 2で cron job 実装

#### 6. Poll/Event機能の複雑性
- **懸念**: Poll, Event作成UIが未確認
- **対応**: FreespaceOptionsコンポーネントの確認が必要

---

## 📝 補足情報

### ComposeFormの使用箇所

ComposeFormは以下のページから使用されます:

1. **ComposePage** (`src/pages/ComposePage.tsx`)
   - 直接ComposeFormコンポーネントを使用
   - selectedTypeを指定

2. **Personal Station** (予想)
   - 「投稿する」ボタンからComposePageにリダイレクト

3. **その他の投稿作成画面** (予想)
   - Dashboard、DepartmentStationなどから使用される可能性

### 関連する既存機能

1. **季節別キャパシティ管理**
   - `useSeasonalCapacity()` フック
   - 季節ごとの提案受付上限を管理
   - キャパシティ警告表示

2. **コンテンツモデレーション**
   - `ContentModerationService` - サーバーサイド最終チェック
   - `ClientModerationService` - クライアントサイドリアルタイムチェック
   - NGワード検出、建設性スコア算出

3. **データ分析同意管理**
   - `useDataConsent()` フック
   - `DataConsentModal` コンポーネント
   - 初回投稿時に同意確認

4. **医療システムWebhook通知**
   - `MedicalSystemWebhook` サービス（クライアント版）
   - `MedicalSystemWebhook.server` サービス（サーバー版・実装必要）
   - improvement投稿時に通知

---

## ✅ チェックリスト

### VoiceDrive側（Phase 1-4）

- [ ] Postテーブル作成（Prismaスキーマ）
- [ ] Pollテーブル作成（Poll, PollOption, PollVote）
- [ ] Eventテーブル作成（Event, ProposedDate, DateVote, Participant）
- [ ] DataConsentテーブル作成
- [ ] マイグレーション実行
- [ ] POST /api/posts エンドポイント実装
- [ ] GET /api/consent/:userId エンドポイント実装
- [ ] POST /api/consent/:userId エンドポイント実装
- [ ] ComposeForm executeSubmission() API呼び出し実装
- [ ] useDataConsent統合確認
- [ ] 統合テスト実装・実行
- [ ] MedicalSystemWebhook.server.ts 実装
- [ ] エラーハンドリング実装
- [ ] ローディング状態実装

### 医療システム側（Phase 5）

- [ ] POST /api/webhook/voicedrive エンドポイント実装
- [ ] proposal.created イベント処理実装
- [ ] 議題作成ログ記録機能実装
- [ ] 職員カルテ活動記録機能実装
- [ ] 上位承認者通知機能実装
- [ ] 委員会提出候補マーク機能実装
- [ ] Webhook認証実装
- [ ] エラーハンドリング実装

### 統合テスト（Phase 6）

- [ ] improvement投稿 E2Eテスト
- [ ] community投稿（Poll付き）E2Eテスト
- [ ] community投稿（Event付き）E2Eテスト
- [ ] report投稿 E2Eテスト
- [ ] Webhook疎通確認
- [ ] データ同意フロー確認
- [ ] モデレーション機能確認
- [ ] キャパシティ制限確認
- [ ] パフォーマンステスト

---

## 📞 連絡先

- **VoiceDriveチーム**: Slack #voicedrive-dev
- **医療システムチーム**: Slack #medical-system-dev
- **統合作業チャンネル**: Slack #phase3-integration

---

**最終更新**: 2025年10月9日
**作成者**: Claude Code
**レビュー**: 未実施
