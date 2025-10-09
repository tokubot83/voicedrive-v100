# InterviewStation DB要件分析

**文書番号**: IS-DB-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**対象ページ**: 面談ステーション (InterviewStation.tsx)
**重要度**: 🔴 超重要
**ステータス**: 詳細分析完了

---

## 📋 エグゼクティブサマリー

### ページ概要
面談ステーションは、医療職員が面談予約・管理・サマリ閲覧を行う**最重要ページ**です。

**主要機能**:
1. **面談予約** - 即時予約 / おまかせ予約（AI調整）
2. **予約管理** - ダッシュボード、履歴、キャンセル、変更
3. **面談サマリ閲覧** - 医療システムからWebhook配信
4. **リマインダー** - 自動通知（雇用状況に応じた定期面談）

**コードサイズ**: 1,436行（InterviewStation.tsx）

### データ管理責任の原則

データ管理責任分界点定義書（DM-DEF-2025-1008-001）に基づき：

| データ項目 | VoiceDrive | 医療システム | 提供方法 |
|-----------|-----------|-------------|---------|
| **面談予約リクエスト** | ✅ マスタ | キャッシュ | Webhook |
| **面談実施記録** | キャッシュ | ✅ マスタ | API |
| **面談AI分析・サマリ** | キャッシュ | ✅ マスタ | Webhook |
| **面談タイプ定義** | ❌ | ✅ マスタ | API |
| **おまかせ予約調整** | ❌ | ✅ マスタ | リアルタイム通知 |

---

## 🎯 現状分析

### A. InterviewStation.tsx 機能詳細

#### 1. タブ構成（4種類）

##### 1-1. ダッシュボードタブ (lines 525-805)

**表示内容**:
- おまかせ予約の調整中面談（優先表示）
- 面談予約カード（新規予約ボタン）
- 予約中の面談一覧
- 前回の面談情報

**データソース**:
```typescript
// おまかせ予約調整中リスト
const [pendingRequests, setPendingRequests] = useState<AssistedBookingRequest[]>([]);

// 予約中の面談
const [upcomingBookings, setUpcomingBookings] = useState<InterviewBooking[]>([]);

// 過去の面談
const [pastBookings, setPastBookings] = useState<InterviewBooking[]>([]);
```

**データ取得処理** (lines 227-288):
```typescript
const loadInterviewData = async () => {
  // 1. 医療システムから面談予約履歴取得
  bookings = await bookingService.getEmployeeInterviewHistory(activeUser!.id);

  // 2. ローカルキャッシュに保存（オフライン対応）
  saveBookingsToCache(bookings);

  // 3. おまかせ予約の調整中リクエスト取得
  const pendingAssistedRequests = await assistedBookingService.getPendingRequests(activeUser!.id);

  // 4. 面談サマリ取得
  await fetchInterviewResults();
};
```

##### 1-2. 履歴タブ (lines 809-1200)

**表示内容**:
- 面談統計（完了数、サマリ受信数、サマリ待ち数）
- フィルタ機能（期間、ステータス、面談タイプ、キーワード）
- 面談履歴一覧（サマリ表示付き）

**フィルタ機能** (lines 811-869):
```typescript
interface InterviewFilters {
  period: 'all' | 'this_month' | 'last_month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  status: 'all' | 'summary_received' | 'summary_waiting';
  interviewType: 'all' | string;
  keyword: string;
}
```

**面談サマリ統合** (lines 820-830):
```typescript
const enhancedBookings: EnhancedBooking[] = pastBookings.map(booking => {
  const summary = interviewResults.find(r => r.interviewId === booking.id);
  return {
    ...booking,
    hasSummary: !!summary,
    summaryData: summary,
    summaryStatus: booking.status === 'completed'
      ? (summary ? 'received' : 'waiting')
      : null
  } as EnhancedBooking;
});
```

##### 1-3. リマインダータブ (lines 1203-1249)

**表示内容**:
- 通知タイミング設定（1日前、1時間前、1週間前）
- 通知方法設定（システム内、メール、SMS）

**現状**: UI実装済み、バックエンド実装は`InterviewReminderService`

##### 1-4. オフラインタブ（オフライン時のみ表示）

**表示内容**:
- キャッシュされた予約データの表示

**実装**: `OfflineBookingViewer`コンポーネント

#### 2. リアルタイム通知システム (lines 110-177)

**3種類のイベントリスナー**:

```typescript
// ① おまかせ予約状況更新
window.addEventListener('assistedBookingUpdate', handleAssistedBookingUpdate);
notificationService.addRealtimeListener('assistedBookingUpdate', handleAssistedBookingUpdate);

// ② 提案候補準備完了
window.addEventListener('proposalReady', handleProposalReady);
notificationService.addRealtimeListener('proposalReady', handleProposalReady);

// ③ 面談予約確定通知
window.addEventListener('interviewConfirmed', handleInterviewConfirmed);
notificationService.addRealtimeListener('interviewConfirmed', handleInterviewConfirmed);
```

**処理フロー**:
```
医療システム（AI調整完了）
  ↓ WebSocket / Server-Sent Events
InterviewStation リスナー
  ↓ handleProposalReady()
データ再取得 → モーダル自動表示
```

#### 3. 面談サマリ取得 (lines 192-225)

**API**: `GET /api/my/interview-results`

**処理**:
```typescript
const fetchInterviewResults = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/my/interview-results', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  setInterviewResults(data.data || []);
};
```

**データ構造**:
```typescript
interface InterviewResult {
  id: string;
  requestId: string;
  interviewId: string;
  completedAt: string;
  duration: number;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{ description: string; dueDate?: string }>;
  followUpRequired: boolean;
  followUpDate?: string;
  feedbackToEmployee?: string;
  nextRecommendations?: {
    suggestedNextInterview?: string;
    suggestedTopics?: string[];
  };
  isRead?: boolean;
  readAt?: string;
}
```

---

### B. 面談予約フロー詳細分析

#### フロー1: 即時予約（通常予約）

```
職員
  ↓ SimpleInterviewFlow (10ステップ)
  ① 分類選択 (定期/特別/サポート)
  ② 種類選択 (10種類)
  ③ カテゴリ選択 (必要な場合のみ)
  ④ 希望時期
  ⑤ 時間帯
  ⑥ 希望曜日
  ⑦ 担当者希望
  ⑧ 場所希望
  ⑨ メモ
  ⑩ 確認
  ↓ 送信先: 医療システムAPI
  POST http://localhost:8080/api/interviews/reservations
  ↓ 医療システム
  - 空き時間確認
  - 面談者割り当て
  - Interview (実施記録) テーブルに保存
  ↓ Webhook通知: VoiceDrive
  POST /api/webhooks/interview-booked
  ↓ VoiceDrive
  - Interview (予約情報) テーブルに保存
  - InterviewStation ダッシュボードに表示
```

**SimpleInterviewFlowの送信先** (lines 134-140):
```typescript
const response = await fetch('http://localhost:8080/api/interviews/reservations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody)
});
```

#### フロー2: おまかせ予約（AssistedBooking）

```
職員
  ↓ AssistedBookingService.submitAssistedBookingRequest()
  POST ${baseUrl}/interviews/assisted-booking
  ↓ 医療システム (AI調整)
  - 最適な面談者を選定
  - 3つの提案パターンを生成
  - AssistedBookingRequest.status = 'proposals_ready'
  ↓ リアルタイム通知 (WebSocket / Server-Sent Events)
  Event: 'proposalReady'
  ↓ InterviewStation (リスナー登録済み)
  - PendingBookingCard に「提案候補を見る」ボタン表示
  - handleViewProposals() 実行
  ↓ StaffRecommendationDisplay モーダル表示
  - 3つの推薦候補を表示
  - 職員が1つを選択
  ↓ AssistedBookingService.confirmBookingChoice()
  POST ${baseUrl}/interviews/confirm-choice
  ↓ 医療システム
  - Interview (実施記録) テーブルに確定保存
  ↓ Webhook通知: VoiceDrive
  POST /api/webhooks/interview-confirmed
  ↓ VoiceDrive
  - Interview (予約情報) テーブルに保存
  - InterviewStation ダッシュボードに「予約確定」表示
```

**EnhancedInterviewRequest詳細** (AssistedBookingService.ts lines 4-37):
```typescript
export interface EnhancedInterviewRequest {
  // 基本情報
  staffId: string;
  requestType: 'regular' | 'special' | 'support';
  topic: string;
  details: string;
  category: string;

  // 時期希望
  urgencyLevel: 'urgent' | 'this_week' | 'next_week' | 'this_month';
  preferredDates?: string[];        // 最大3つ
  unavailableDates?: string[];      // 除外日

  // 時間帯希望
  timePreference: {
    morning: boolean;      // 9:00-12:00
    afternoon: boolean;    // 13:00-17:00
    evening: boolean;      // 17:30-19:00
    anytime: boolean;      // いつでも可
  };

  // 担当者希望
  interviewerPreference: {
    specificPerson?: string;
    genderPreference?: 'male' | 'female' | 'no_preference';
    specialtyPreference?: string;
    anyAvailable: boolean;
  };

  // その他
  minDuration: number;     // 最短時間（分）
  maxDuration: number;     // 最長時間（分）
  additionalRequests?: string;
}
```

#### フロー3: 面談実施 → サマリ配信

```
医療システム
  ↓ 面談実施
  ↓ AI分析 (NotebookLM)
  ↓ サマリ生成
  ↓ Interview.status = 'completed'
  ↓ Interview.feedbackSummary = {...}
  ↓ Webhook通知: VoiceDrive
  POST /api/webhooks/interview-result
  Body: {
    requestId, interviewId, completedAt, duration,
    summary, keyPoints, actionItems, followUpRequired,
    feedbackToEmployee, nextRecommendations
  }
  ↓ VoiceDrive
  - InterviewResult テーブルに保存
  ↓ InterviewStation 履歴タブ
  - 面談履歴に「サマリ受信済み」バッジ表示
  - 「サマリを見る」ボタン表示
  ↓ 職員がクリック
  InterviewResultModal 表示
    - サマリ全文
    - 主なポイント
    - アクションアイテム
    - フィードバック
    - 次回推奨テーマ
```

**サマリAPI実装** (myInterviewRoutes.ts lines 11-90):
```typescript
router.get('/interview-results', async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // ユーザーの職員IDを取得
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { employeeId: true }
  });

  // 該当職員の面談申込を取得
  const interviews = await prisma.interview.findMany({
    where: { employeeId: userId },
    select: { id: true }
  });

  // requestIdに紐づく面談サマリを取得
  const results = await prisma.interviewResult.findMany({
    where: { requestId: { in: interviews.map(i => i.id) } },
    orderBy: { completedAt: 'desc' }
  });

  res.json({ success: true, data: results });
});
```

#### フロー4: リマインダー自動送信

```
InterviewReminderService (バッチ処理)
  ↓ 職員の雇用状況を判定
    - new_employee → 月次面談 (30日間隔)
    - regular_employee → 年次面談 (365日間隔)
    - management → 半年面談 (182日間隔)
  ↓ 次回面談予定日を計算
  ↓ リマインダー送信日を計算
    - 14日前、7日前、3日前 (新入職員/管理職)
    - 30日前、14日前、7日前 (一般職員)
  ↓ NotificationService 経由で通知
  ↓ 職員
    - システム内通知
    - プッシュ通知 (モバイル)
  ↓ InterviewStation ダッシュボード
    - 「面談を予約する」ボタンが強調表示
```

**リマインダー設定** (InterviewReminderService.ts lines 31-76):
```typescript
// 新入職員（月次面談）
this.reminderConfigs.set('new_employee', {
  employmentStatus: 'new_employee',
  frequencyRules: {
    mandatoryInterviewType: 'new_employee_monthly',
    intervalDays: 30,
    reminderSchedule: [14, 7, 3],
    overdueReminderSchedule: [1, 3, 7],
    maxOverdueReminders: 3
  }
});

// 一般職員（年次面談）
this.reminderConfigs.set('regular_employee', {
  employmentStatus: 'regular_employee',
  frequencyRules: {
    mandatoryInterviewType: 'regular_annual',
    intervalDays: 365,
    reminderSchedule: [30, 14, 7],
    overdueReminderSchedule: [7, 14, 30],
    maxOverdueReminders: 3
  }
});

// 管理職（半年面談）
this.reminderConfigs.set('management', {
  employmentStatus: 'management',
  frequencyRules: {
    mandatoryInterviewType: 'management_biannual',
    intervalDays: 182,
    reminderSchedule: [14, 7, 3],
    overdueReminderSchedule: [3, 7, 14],
    maxOverdueReminders: 3
  }
});
```

---

## 📊 データ管理責任分界点（面談ステーション専用）

### カテゴリA: 面談予約リクエスト

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 予約申込ID (requestId) | ✅ 生成 | 受信 | VoiceDrive → 医療 | cuid()生成 |
| 職員ID (employeeId) | ✅ 保持 | ✅ マスタ | 双方向 | - |
| 面談タイプ (interviewType) | 選択 | ✅ マスタ | 医療 → VoiceDrive | API経由取得 |
| 面談カテゴリ (interviewCategory) | 選択 | ✅ マスタ | 医療 → VoiceDrive | API経由取得 |
| 希望日時 (preferredDates) | ✅ 収集 | 受信 | VoiceDrive → 医療 | - |
| 緊急度 (urgencyLevel) | ✅ 収集 | 受信 | VoiceDrive → 医療 | - |
| トピック (requestedTopics) | ✅ 収集 | 受信 | VoiceDrive → 医療 | - |
| 詳細メモ (description) | ✅ 収集 | 受信 | VoiceDrive → 医療 | - |
| 予約ステータス (status) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | Webhook更新 |

**原則**:
- VoiceDriveが予約リクエストを収集
- 医療システムが予約を確定・管理
- ステータス更新はWebhook経由

### カテゴリB: おまかせ予約（AI調整）

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 調整リクエスト (EnhancedInterviewRequest) | ✅ 収集 | 受信・処理 | VoiceDrive → 医療 | - |
| AI調整進捗 (progress) | 表示のみ | ✅ 管理 | 医療 → VoiceDrive | リアルタイム通知 |
| 提案パターン (proposals) | 表示のみ | ✅ 生成 | 医療 → VoiceDrive | API経由取得 |
| AI推薦理由 (aiReasoning) | ❌ | ✅ 保持 | 非提供 | 内部ロジック |
| 職員向け説明 (staffFriendlyDisplay) | 表示 | ✅ 生成 | 医療 → VoiceDrive | 簡素化済み |
| 最終選択 (selectedProposalId) | ✅ 送信 | 受信・確定 | VoiceDrive → 医療 | - |

**原則**:
- 医療システムがAI調整を100%管轄
- VoiceDriveは表示・選択UIのみ提供
- AI理由は職員向けに簡素化された情報のみ取得

### カテゴリC: 面談実施記録

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 面談ID (interviewId) | キャッシュ | ✅ 生成 | 医療 → VoiceDrive | UUID |
| 実施日時 (conductedAt) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | Webhook |
| 面談者ID (interviewerId) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | Webhook |
| 面談者名 (interviewerName) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | Webhook |
| 実施時間 (duration) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | Webhook |
| 面談場所 (location) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | Webhook |
| 形式 (format) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | face_to_face / online |

**原則**:
- 医療システムが実施記録を100%管轄
- VoiceDriveはWebhook経由でキャッシュ
- VoiceDriveでは**編集不可**

### カテゴリD: 面談サマリ・AI分析

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| サマリ本文 (summary) | キャッシュ | ✅ 生成 | 医療 → VoiceDrive | NotebookLM |
| 主要ポイント (keyPoints) | キャッシュ | ✅ 生成 | 医療 → VoiceDrive | AI分析 |
| アクションアイテム (actionItems) | キャッシュ | ✅ 生成 | 医療 → VoiceDrive | AI分析 |
| フィードバック (feedbackToEmployee) | キャッシュ | ✅ 生成 | 医療 → VoiceDrive | AI分析 |
| 次回推奨テーマ (nextRecommendations) | キャッシュ | ✅ 生成 | 医療 → VoiceDrive | AI分析 |
| NotebookLM URL (notebookLmUrl) | ❌ | ✅ 保持 | 非提供 | 医療システム内部リンク |
| フォローアップ (followUpRequired) | キャッシュ | ✅ 判定 | 医療 → VoiceDrive | AI判定 |
| 既読状態 (isRead) | ✅ 管理 | ❌ | VoiceDrive管轄 | 職員の既読管理 |

**原則**:
- 医療システムがAI分析・サマリ生成を100%管轄
- VoiceDriveはWebhook経由で受信・キャッシュ
- 既読管理のみVoiceDriveが管理

### カテゴリE: 面談タイプ・マスタデータ

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 面談タイプマスタ (InterviewTypeMaster) | ❌ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| カテゴリマスタ (InterviewCategoryMaster) | ❌ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 面談者マスタ (InterviewerMaster) | ❌ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| スケジュール設定 (InterviewScheduleConfig) | ❌ | ✅ マスタ | 医療 → VoiceDrive | API経由 |

**原則**:
- 全マスタデータは医療システムが管理
- VoiceDriveはAPI経由で取得・表示のみ

### カテゴリF: リマインダー

| データ項目 | VoiceDrive | 医療システム | データフロー | 備考 |
|-----------|-----------|-------------|------------|------|
| 雇用状況 (employmentStatus) | ❌ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 入職日 (hireDate) | ❌ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 最終面談日 (lastInterviewDate) | キャッシュ | ✅ マスタ | 医療 → VoiceDrive | API経由 |
| 次回予定日 (nextScheduledDate) | ✅ 計算 | 参照 | VoiceDrive管轄 | InterviewReminderService |
| リマインダー設定 (reminderConfig) | ✅ 保持 | 参照 | VoiceDrive管轄 | ローカル設定 |
| 通知履歴 (notificationHistory) | ✅ 管理 | ❌ | VoiceDrive管轄 | NotificationService |

**原則**:
- 雇用状況・面談履歴は医療システムから取得
- 次回予定日計算・リマインダー送信はVoiceDrive管轄

---

## 🗄️ VoiceDrive側のDB要件

### 必要なテーブル（Prisma Schema）

#### 1. Interview（面談予約）- **既存テーブル（拡張必要）**

**現状** (prisma/schema.prisma lines 87-108):
```prisma
model Interview {
  id               String    @id @default(cuid())
  employeeId       String
  category         String
  type             String
  topic            String
  preferredDate    DateTime
  scheduledDate    DateTime?
  actualDate       DateTime?
  duration         Int?
  interviewerId    String?
  interviewerName  String?
  status           String    @default("pending")
  urgencyLevel     String
  result           String?
  notes            String?
  followUpRequired Boolean   @default(false)
  followUpDate     DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  employee         User      @relation(fields: [employeeId], references: [id])
}
```

**必要な拡張**:
```prisma
model Interview {
  id                      String    @id @default(cuid())
  employeeId              String
  employeeName            String    // 追加
  employeeEmail           String    // 追加
  facility                String    // 追加
  department              String    // 追加
  position                String    // 追加

  // 面談内容
  interviewType           String    // 既存: type → 改名
  interviewCategory       String    // 既存: category
  requestedTopics         Json      // 追加: string[]
  description             String?   // 既存: notes → 改名
  urgencyLevel            String    // 既存

  // 予約情報
  preferredDate           DateTime  // 既存
  bookingDate             DateTime? // 追加: 確定日時
  timeSlot                Json?     // 追加: { startTime, endTime }

  // 面談者情報
  interviewerId           String?   // 既存
  interviewerName         String?   // 既存
  interviewerLevel        Int?      // 追加: 権限レベル

  // ステータス管理
  status                  String    @default("pending") // 既存
  // pending, confirmed, rescheduled, reschedule_pending, completed, cancelled, no_show

  // おまかせ予約関連
  isAssistedBooking       Boolean   @default(false) // 追加
  assistedBookingRequestId String?  @unique         // 追加
  proposalPatterns        Json?                     // 追加: ProposalPattern[]
  selectedProposalId      String?                   // 追加

  // 実施記録（医療システムからキャッシュ）
  conductedAt             DateTime? // 追加
  actualDuration          Int?      // 追加
  location                String?   // 追加
  format                  String?   // 追加: face_to_face / online

  // 履歴・メタデータ
  createdAt               DateTime  @default(now())  // 既存
  updatedAt               DateTime  @updatedAt       // 既存
  lastModified            DateTime? // 追加
  modifiedBy              String?   // 追加

  // キャンセル・変更履歴
  cancellationReason      String?   // 追加
  cancelledAt             DateTime? // 追加
  cancelledBy             String?   // 追加
  rescheduleRequests      Json?     // 追加: RescheduleRequest[]

  // リレーション
  employee                User      @relation(fields: [employeeId], references: [id])

  @@index([employeeId])
  @@index([status])
  @@index([bookingDate])
  @@index([assistedBookingRequestId])
}
```

#### 2. InterviewResult（面談サマリ）- **既存テーブル（OK）**

**現状** (prisma/schema.prisma lines 232-251):
```prisma
model InterviewResult {
  id                  String    @id @default(cuid())
  requestId           String    @unique
  interviewId         String    @unique
  completedAt         DateTime
  duration            Int
  summary             String
  keyPoints           Json
  actionItems         Json
  followUpRequired    Boolean   @default(false)
  followUpDate        DateTime?
  feedbackToEmployee  String
  nextRecommendations Json
  receivedAt          DateTime  @default(now())
  processedAt         DateTime?
  status              String    @default("received")
  errorMessage        String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

**判定**: ✅ 既存スキーマで十分

**追加推奨フィールド**:
```prisma
model InterviewResult {
  // ... 既存フィールド ...

  // 既読管理
  isRead              Boolean   @default(false) // 追加推奨
  readAt              DateTime? // 追加推奨

  @@index([requestId])
  @@index([interviewId])
}
```

#### 3. AssistedBookingRequest（おまかせ予約）- **新規テーブル（必須）**

```prisma
model AssistedBookingRequest {
  id                    String    @id @default(cuid())
  staffId               String

  // リクエスト内容
  requestType           String    // regular, special, support
  topic                 String
  details               String    @db.Text
  category              String

  // 時期希望
  urgencyLevel          String    // urgent, this_week, next_week, this_month
  preferredDates        Json?     // string[]
  unavailableDates      Json?     // string[]

  // 時間帯希望
  timePreference        Json      // { morning, afternoon, evening, anytime }

  // 担当者希望
  interviewerPreference Json      // { specificPerson?, genderPreference?, specialtyPreference?, anyAvailable }

  // その他
  minDuration           Int
  maxDuration           Int
  additionalRequests    String?   @db.Text

  // ステータス管理
  status                String    @default("pending_review")
  // pending_review, proposals_ready, awaiting_selection, confirmed, failed, expired

  // 医療システムからの情報
  medicalRequestId      String?   @unique  // 医療システム側のID
  estimatedCompletion   DateTime?

  // 提案候補（医療システムから受信）
  proposals             Json?     // StaffFriendlyRecommendation[]
  selectedProposalId    String?

  // メタデータ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  confirmedAt           DateTime?

  @@index([staffId])
  @@index([status])
  @@index([medicalRequestId])
}
```

#### 4. InterviewReminder（リマインダー）- **新規テーブル（必須）**

```prisma
model InterviewReminder {
  id                    String    @id @default(cuid())
  employeeId            String

  // リマインダー種別
  reminderType          String    // interview_due, interview_overdue
  interviewType         String    // new_employee_monthly, regular_annual, management_biannual

  // スケジュール
  nextInterviewDue      DateTime
  reminderDate          DateTime
  sent                  Boolean   @default(false)
  sentAt                DateTime?

  // 雇用状況（キャッシュ）
  employmentStatus      String    // new_employee, regular_employee, management
  lastInterviewDate     DateTime?

  // メタデータ
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([employeeId])
  @@index([sent])
  @@index([reminderDate])
}
```

---

## 🔌 医療システムへのAPI要求

VoiceDriveチームから医療職員管理システムチームへの**API要求リスト**は、
別ドキュメント「**InterviewStation暫定マスターリスト_20251009.md**」に記載します。

本文書では、データ管理責任分界点とDB要件分析に焦点を当てています。

---

**文書終了**
