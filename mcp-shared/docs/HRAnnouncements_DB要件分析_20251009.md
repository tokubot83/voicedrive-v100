# HRAnnouncements（人事お知らせ配信）DB要件分析

**文書番号**: VD-DB-HRANNOUNCEMENTS-2025-1009-001
**作成日**: 2025年10月9日
**対象**: 医療職員管理システムチーム + VoiceDriveチーム
**目的**: 人事お知らせ配信機能のDB要件分析とデータ管理責任分界点の明確化
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [HRAnnouncementsPage.tsx](../../src/components/hr-announcements/HRAnnouncementsPage.tsx)

---

## 📋 エグゼクティブサマリー

### 対象ページ

1. **HRAnnouncementsPage** - 人事部からのお知らせ一覧（全職員向け）
2. **HRManagementDashboard** - 人事統括ダッシュボード（LEVEL_5専用）

### 現状の問題点

| 問題 | 現状 | 影響 |
|------|------|------|
| **DBテーブル未実装** | `HRAnnouncement`モデルが存在しない | ❌ 全データがモック |
| **配信対象管理不明確** | 個人/部署/施設の配信制御が実装されていない | ❌ 全員配信のみ |
| **医療システム連携未定義** | お知らせの作成元・管理責任が不明 | ⚠️ データ重複リスク |
| **統計管理未実装** | 配信数・既読数・アクション数が記録されない | ❌ 効果測定不可 |
| **既読管理未実装** | ユーザーごとの既読状態が管理されていない | ❌ 未読バッジ表示不可 |

### 重要な分析結果

#### 🔵 医療システムが管理すべきデータ

1. **人事お知らせマスター（HRAnnouncement）** - ✅ **医療システム管轄**
   - 理由: 人事部が医療システム側の管理画面から作成・管理
   - VoiceDriveは「配信・閲覧プラットフォーム」として機能
   - 医療システムがAPIでVoiceDriveに配信

2. **部署・施設マスター** - ✅ **医療システム管轄**
   - 配信対象の選択に使用（部署選択、施設選択）

3. **人事統括指標** - ✅ **医療システム管轄**
   - 総従業員数、離職率、採用パイプライン、研修完了数
   - HRManagementDashboardで表示

#### 🟢 VoiceDriveが管理すべきデータ

1. **お知らせ配信記録（AnnouncementDelivery）** - ✅ **VoiceDrive管轄**
   - 誰に配信したか、既読状態、アクション実行状態
   - 個人ごとの配信履歴管理

2. **お知らせ統計（AnnouncementStats）** - ✅ **VoiceDrive管轄**
   - 配信数、既読数、アクション実行数、完了数
   - 医療システムにWebhook送信（日次）

3. **お知らせ既読管理（AnnouncementRead）** - ✅ **VoiceDrive管轄**
   - ユーザーごとの既読タイムスタンプ
   - 未読バッジ表示の基礎データ

4. **アクション実行記録（AnnouncementAction）** - ✅ **VoiceDrive管轄**
   - アンケート回答、面談予約、研修申込みなどの実行記録
   - 医療システムにWebhook送信（即時）

---

## 🎯 データ管理責任分界点

### 原則: お知らせコンテンツは医療システム、配信・閲覧はVoiceDrive

```
┌─────────────────────────────────────────────────────────────┐
│ 医療職員管理システム（お知らせ作成・管理）                        │
├─────────────────────────────────────────────────────────────┤
│ ✅ HRAnnouncement（お知らせマスター）                            │
│   - 作成: 人事部が管理画面から作成                                │
│   - 編集: 人事部のみ可能                                         │
│   - 公開制御: 公開日時、有効期限、対象者設定                       │
│                                                               │
│ ✅ 配信対象マスター                                             │
│   - Department（部署）                                         │
│   - Facility（施設）                                           │
│   - Position（役職）                                           │
│                                                               │
│ ✅ 人事統括指標                                                 │
│   - 総従業員数、離職率、満足度                                   │
│   - 採用パイプライン、研修プログラム状況                          │
└─────────────────────────────────────────────────────────────┘
                          ↓ API配信
┌─────────────────────────────────────────────────────────────┐
│ VoiceDrive（お知らせ配信・閲覧プラットフォーム）                   │
├─────────────────────────────────────────────────────────────┤
│ ✅ AnnouncementCache（お知らせキャッシュ）                       │
│   - 医療システムから受信したお知らせをキャッシュ                   │
│   - 高速表示用、定期同期                                        │
│                                                               │
│ ✅ AnnouncementDelivery（配信記録）                             │
│   - 誰にいつ配信したか                                          │
│   - 既読状態、アクション実行状態                                 │
│                                                               │
│ ✅ AnnouncementRead（既読管理）                                 │
│   - ユーザーごとの既読タイムスタンプ                              │
│   - 未読バッジ表示の基礎                                        │
│                                                               │
│ ✅ AnnouncementAction（アクション実行記録）                      │
│   - アンケート回答、面談予約、研修申込み実行記録                   │
│   - 医療システムにWebhook送信                                   │
│                                                               │
│ ✅ AnnouncementStats（統計サマリー）                            │
│   - お知らせごとの配信数、既読数、アクション実行数                 │
│   - 医療システムにWebhook送信（日次）                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DB設計（VoiceDrive側）

### 1. AnnouncementCache（お知らせキャッシュ）

**目的**: 医療システムから配信されたお知らせをキャッシュし、高速表示を実現

```prisma
model AnnouncementCache {
  id                    String    @id @default(cuid())

  // 医療システム連携
  medicalAnnouncementId String    @unique  // 医療システムのお知らせID

  // 基本情報
  title                 String
  content               String    @db.Text
  category              String    // ANNOUNCEMENT, MEETING, TRAINING, SURVEY, OTHER
  priority              String    // LOW, NORMAL, HIGH, URGENT
  surveySubCategory     String?   // satisfaction, workenv, education, welfare, system, event, other

  // 作成者情報（医療システムから提供）
  authorId              String
  authorName            String
  authorDepartment      String

  // 公開設定
  publishAt             DateTime
  expiresAt             DateTime?
  isActive              Boolean   @default(true)

  // 応答設定
  requireResponse       Boolean   @default(false)
  responseType          String?   // acknowledged, completed, custom
  responseText          String?

  // 対象者設定
  targetType            String    // global, departments, facilities, individuals, positions
  targetDepartments     String?   @db.Text  // JSON配列: ["内科", "外科"]
  targetFacilities      String?   @db.Text  // JSON配列: ["本院", "分院"]
  targetIndividuals     String?   @db.Text  // JSON配列: ["OH-NS-2024-001"]
  targetPositions       String?   @db.Text  // JSON配列: ["主任", "部長"]

  // アクションボタン設定
  hasActionButton       Boolean   @default(false)
  actionButtonText      String?
  actionButtonUrl       String?
  actionButtonType      String?   // internal, external, medical_system

  // 添付ファイル
  attachments           String?   @db.Text  // JSON配列

  // メタデータ
  sourceSystem          String    @default("medical-staff-system")
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  syncedAt              DateTime  @default(now())

  // リレーション
  deliveries            AnnouncementDelivery[]
  reads                 AnnouncementRead[]
  actions               AnnouncementAction[]
  stats                 AnnouncementStats?

  @@index([publishAt])
  @@index([category])
  @@index([priority])
  @@index([isActive])
  @@index([medicalAnnouncementId])
}
```

**キーポイント**:
- `medicalAnnouncementId`: 医療システムとの同期キー（必須）
- `targetType`: 配信対象の種類を明確化
- `targetDepartments`, `targetFacilities`: 部署・施設単位配信
- `targetIndividuals`: 個人単位配信
- `syncedAt`: 医療システムとの最終同期日時

---

### 2. AnnouncementDelivery（配信記録）

**目的**: 誰にいつ配信したかを記録（個人単位）

```prisma
model AnnouncementDelivery {
  id                String   @id @default(cuid())

  // リレーション
  announcementId    String
  announcement      AnnouncementCache @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 配信情報
  deliveredAt       DateTime @default(now())
  deliveryMethod    String   // push, email, in_app

  // ステータス
  isRead            Boolean  @default(false)
  readAt            DateTime?

  hasActioned       Boolean  @default(false)
  actionedAt        DateTime?

  isCompleted       Boolean  @default(false)
  completedAt       DateTime?

  // メタデータ
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([announcementId, userId])
  @@index([userId])
  @@index([isRead])
  @@index([hasActioned])
}
```

**キーポイント**:
- 個人ごとの配信履歴を完全記録
- 既読・アクション実行・完了の3段階ステータス
- `@@unique([announcementId, userId])`: 重複配信防止

---

### 3. AnnouncementRead（既読管理）

**目的**: ユーザーごとの既読状態を高速検索できるように管理

```prisma
model AnnouncementRead {
  id                String   @id @default(cuid())

  // リレーション
  announcementId    String
  announcement      AnnouncementCache @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 既読情報
  readAt            DateTime @default(now())
  readDuration      Int?     // 閲覧時間（秒）

  // メタデータ
  createdAt         DateTime @default(now())

  @@unique([announcementId, userId])
  @@index([userId])
  @@index([readAt])
}
```

**キーポイント**:
- 既読タイムスタンプを正確に記録
- `readDuration`: 平均閲覧時間の分析用
- 未読バッジ表示の基礎データ

---

### 4. AnnouncementAction（アクション実行記録）

**目的**: アンケート回答、面談予約、研修申込みなどのアクション実行を記録

```prisma
model AnnouncementAction {
  id                String   @id @default(cuid())

  // リレーション
  announcementId    String
  announcement      AnnouncementCache @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // アクション情報
  actionType        String   // survey_response, interview_reservation, training_apply, health_check, custom
  actionData        String?  @db.Text  // JSON: アクション詳細データ

  // ステータス
  status            String   @default("pending")  // pending, completed, cancelled
  completedAt       DateTime?

  // 医療システム連携
  sentToMedical     Boolean  @default(false)
  sentAt            DateTime?
  medicalResponseId String?  // 医療システムからの応答ID

  // メタデータ
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([actionType])
  @@index([status])
  @@index([sentToMedical])
}
```

**キーポイント**:
- アクションタイプを明確に分類
- 医療システムへのWebhook送信状態を管理
- `actionData`: 柔軟なJSON形式でアクション詳細を保存

---

### 5. AnnouncementStats（統計サマリー）

**目的**: お知らせごとの統計を集計し、医療システムに日次送信

```prisma
model AnnouncementStats {
  id                String   @id @default(cuid())

  // リレーション
  announcementId    String   @unique
  announcement      AnnouncementCache @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  // 統計情報
  totalDelivered    Int      @default(0)  // 配信総数
  totalRead         Int      @default(0)  // 既読総数
  totalActioned     Int      @default(0)  // アクション実行総数
  totalCompleted    Int      @default(0)  // 完了総数

  // 部門別統計（JSON）
  statsByDepartment String?  @db.Text  // JSON: {"内科": {"read": 45, "actioned": 12}}
  statsByFacility   String?  @db.Text  // JSON: {"本院": {"read": 230, "actioned": 89}}

  // 閲覧統計
  averageReadTime   Float?   // 平均閲覧時間（秒）
  uniqueViewers     Int      @default(0)  // ユニーク閲覧者数

  // 医療システム連携
  lastSyncedToMedical DateTime?
  syncCount         Int      @default(0)

  // メタデータ
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([lastSyncedToMedical])
}
```

**キーポイント**:
- お知らせごとの統計を集計
- 部門別・施設別の詳細統計をJSON保存
- 医療システムへの日次Webhook送信

---

## 🔄 データフロー

### 1. お知らせ作成・配信フロー

```
┌──────────────────────────────────────────────────────────────┐
│ Step 1: 人事部がお知らせ作成（医療システム側）                     │
└──────────────────────────────────────────────────────────────┘
  人事部が管理画面で入力:
  - タイトル、本文、カテゴリ、優先度
  - 配信対象: 全職員 / 特定部署 / 特定施設 / 個人
  - 公開日時、有効期限
  - アクションボタン設定（任意）

  医療システム側で保存:
  - HRAnnouncement テーブルに保存
  - 配信対象の検証（部署・施設・個人の存在確認）

        ↓ API送信

┌──────────────────────────────────────────────────────────────┐
│ Step 2: VoiceDriveがお知らせを受信                              │
└──────────────────────────────────────────────────────────────┘
  POST /api/v1/hr-announcements/receive

  VoiceDrive側で処理:
  1. AnnouncementCache テーブルに保存
  2. 配信対象者を解決（targetType に基づく）
     - global → 全ユーザー
     - departments → 指定部署のユーザー取得（医療API呼び出し）
     - facilities → 指定施設のユーザー取得（医療API呼び出し）
     - individuals → 指定個人
  3. AnnouncementDelivery レコード作成（配信対象者分）
  4. プッシュ通知送信（優先度に応じて）

        ↓ 配信完了

┌──────────────────────────────────────────────────────────────┐
│ Step 3: 職員がお知らせを閲覧                                    │
└──────────────────────────────────────────────────────────────┘
  HRAnnouncementsPage でお知らせ一覧表示

  ユーザーがお知らせをクリック:
  1. AnnouncementRead レコード作成（既読記録）
  2. AnnouncementDelivery.isRead = true に更新
  3. AnnouncementStats.totalRead += 1

  ユーザーがアクションボタンをクリック:
  1. AnnouncementAction レコード作成
  2. AnnouncementDelivery.hasActioned = true に更新
  3. AnnouncementStats.totalActioned += 1
  4. 医療システムにWebhook送信（即時）

        ↓ 統計更新

┌──────────────────────────────────────────────────────────────┐
│ Step 4: 統計情報を医療システムに送信（日次バッチ）                 │
└──────────────────────────────────────────────────────────────┘
  日次バッチ（深夜2:00）:
  1. AnnouncementStats から統計を集計
  2. 医療システムにWebhook送信:
     - 配信数、既読数、アクション実行数、完了数
     - 部門別統計、施設別統計
  3. AnnouncementStats.lastSyncedToMedical 更新
```

---

### 2. 配信対象の解決ロジック

#### A. 全職員配信（targetType: "global"）

```typescript
// 全ユーザーに配信
const allUsers = await prisma.user.findMany({
  where: { isRetired: false }
});

for (const user of allUsers) {
  await prisma.announcementDelivery.create({
    data: {
      announcementId: announcement.id,
      userId: user.id,
      deliveryMethod: 'in_app'
    }
  });
}
```

#### B. 部署単位配信（targetType: "departments"）

```typescript
// 医療システムAPIから部署メンバーを取得
const targetDepartments = JSON.parse(announcement.targetDepartments);

for (const dept of targetDepartments) {
  // 医療システムAPI呼び出し
  const deptMembers = await medicalSystemAPI.getDepartmentMembers(dept);

  for (const member of deptMembers.members) {
    // VoiceDrive Userテーブルから該当ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { employeeId: member.employeeId }
    });

    if (user) {
      await prisma.announcementDelivery.create({
        data: {
          announcementId: announcement.id,
          userId: user.id,
          deliveryMethod: 'in_app'
        }
      });
    }
  }
}
```

#### C. 施設単位配信（targetType: "facilities"）

```typescript
// 医療システムAPIから施設メンバーを取得
const targetFacilities = JSON.parse(announcement.targetFacilities);

for (const facility of targetFacilities) {
  // 医療システムAPI呼び出し
  const facilityMembers = await medicalSystemAPI.getFacilityMembers(facility);

  for (const member of facilityMembers.members) {
    const user = await prisma.user.findUnique({
      where: { employeeId: member.employeeId }
    });

    if (user) {
      await prisma.announcementDelivery.create({
        data: {
          announcementId: announcement.id,
          userId: user.id,
          deliveryMethod: 'in_app'
        }
      });
    }
  }
}
```

#### D. 個人単位配信（targetType: "individuals"）

```typescript
// 指定個人に配信
const targetIndividuals = JSON.parse(announcement.targetIndividuals);

for (const employeeId of targetIndividuals) {
  const user = await prisma.user.findUnique({
    where: { employeeId }
  });

  if (user) {
    await prisma.announcementDelivery.create({
      data: {
        announcementId: announcement.id,
        userId: user.id,
        deliveryMethod: 'in_app'
      }
    });
  }
}
```

---

## 🔌 医療システムとのAPI連携

### 1. VoiceDrive → 医療システム（統計送信）

#### エンドポイント

```
POST https://medical-system.example.com/api/v1/hr-announcements/{announcementId}/stats
```

#### リクエスト例

```json
{
  "event": "stats.daily",
  "timestamp": "2025-10-09T02:00:00Z",
  "announcement": {
    "id": "ann_12345",
    "medicalAnnouncementId": "HR-2025-1009-001",
    "title": "【アンケート】職場環境改善に関する意識調査のお願い",
    "category": "survey",
    "priority": "medium",
    "publishedAt": "2025-10-08T09:00:00Z"
  },
  "stats": {
    "totalDelivered": 450,
    "totalRead": 189,
    "totalActioned": 89,
    "totalCompleted": 67,
    "readRate": 42.0,
    "actionRate": 19.8,
    "completionRate": 14.9,
    "averageReadTime": 125.3,
    "uniqueViewers": 189,
    "departmentStats": {
      "内科": {
        "delivered": 45,
        "read": 23,
        "actioned": 12,
        "completed": 8
      },
      "外科": {
        "delivered": 38,
        "read": 19,
        "actioned": 7,
        "completed": 5
      }
    },
    "facilityStats": {
      "本院": {
        "delivered": 230,
        "read": 112,
        "actioned": 56,
        "completed": 42
      },
      "分院": {
        "delivered": 220,
        "read": 77,
        "actioned": 33,
        "completed": 25
      }
    }
  },
  "metadata": {
    "source": "voicedrive",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

#### レスポンス例

```json
{
  "success": true,
  "message": "統計情報を受信しました",
  "receivedAt": "2025-10-09T02:00:15Z"
}
```

---

### 2. 医療システム → VoiceDrive（お知らせ配信）

#### エンドポイント

```
POST https://voicedrive.example.com/api/v1/hr-announcements/receive
```

#### リクエスト例

```json
{
  "medicalAnnouncementId": "HR-2025-1009-001",
  "title": "【アンケート】職場環境改善に関する意識調査のお願い",
  "content": "医療チームと人事部の連携により、職場環境改善のためのアンケート調査を実施いたします。\n\n📊 調査目的：働きやすい職場環境の構築\n⏱ 所要時間：約10分\n📅 回答期限：1月31日（金）まで",
  "category": "survey",
  "priority": "medium",
  "surveySubCategory": "workenv",
  "authorId": "hr_survey",
  "authorName": "アンケート管理チーム",
  "authorDepartment": "人事部 × 医療チーム",
  "publishAt": "2025-10-08T09:00:00Z",
  "expiresAt": "2025-01-31T23:59:59Z",
  "targetType": "global",
  "requireResponse": false,
  "responseType": "acknowledged",
  "actionButton": {
    "text": "�� アンケートフォームへ",
    "url": "/survey/workplace-improvement",
    "type": "internal"
  },
  "metadata": {
    "sourceSystem": "medical-staff-system",
    "createdBy": "hr_admin_001",
    "createdAt": "2025-10-08T08:30:00Z"
  }
}
```

#### レスポンス例

```json
{
  "success": true,
  "data": {
    "voicedriveAnnouncementId": "ann_12345",
    "status": "published",
    "publishedAt": "2025-10-08T09:00:00Z",
    "estimatedDelivery": 450,
    "targetedUsers": [
      {
        "department": "内科",
        "count": 45
      },
      {
        "department": "外科",
        "count": 38
      }
    ]
  }
}
```

---

### 3. 医療システム → VoiceDrive（アクション通知受信）

#### エンドポイント

```
POST https://medical-system.example.com/api/v1/hr-announcements/actions
```

#### リクエスト例（即時送信）

```json
{
  "event": "action.executed",
  "timestamp": "2025-10-09T10:15:30Z",
  "announcement": {
    "medicalAnnouncementId": "HR-2025-1009-001",
    "title": "【アンケート】職場環境改善に関する意識調査のお願い"
  },
  "action": {
    "actionId": "act_67890",
    "userId": "OH-NS-2024-001",
    "userName": "山田 太郎",
    "department": "内科",
    "actionType": "survey_response",
    "actionData": {
      "surveyId": "survey_workplace_2025",
      "completedAt": "2025-10-09T10:15:30Z",
      "duration": 612
    },
    "status": "completed"
  },
  "metadata": {
    "source": "voicedrive",
    "version": "1.0.0"
  }
}
```

---

## 📊 HRManagementDashboard（人事統括ダッシュボード）のデータソース

### 現状の問題

HRManagementDashboard.tsxは**全てハードコードされたダミーデータ**を使用しています。

### データソース定義

| 指標 | データソース | API | 備考 |
|------|------------|-----|------|
| **総従業員数** | 🔵 医療システム | `GET /api/employees/count` | Employee テーブル |
| **新規採用数** | 🔵 医療システム | `GET /api/employees/new-hires` | Employee.hireDate |
| **離職率** | 🔵 医療システム | `GET /api/employees/turnover-rate` | Employee.terminationDate |
| **従業員満足度** | 🔵 医療システム | `GET /api/surveys/employee-satisfaction` | Survey結果 |
| **研修完了数** | 🔵 医療システム | `GET /api/training/completion-stats` | Training テーブル |
| **タレントパイプライン** | 🔵 医療システム | `GET /api/talent/pipeline` | SuccessionPlan テーブル |
| **部門別人材状況** | 🔵 医療システム | `GET /api/departments/hr-stats` | Department + Employee |
| **採用パイプライン** | 🔵 医療システム | `GET /api/recruitment/pipeline` | Recruitment テーブル |
| **研修プログラム状況** | 🔵 医療システム | `GET /api/training/programs` | TrainingProgram テーブル |

**結論**: HRManagementDashboardの全指標は**医療システムが管理**し、VoiceDriveはAPIで取得して表示するのみ。

---

## ✅ 実装チェックリスト

### Phase 1: DB実装（VoiceDrive側）

- [ ] AnnouncementCache モデル実装
- [ ] AnnouncementDelivery モデル実装
- [ ] AnnouncementRead モデル実装
- [ ] AnnouncementAction モデル実装
- [ ] AnnouncementStats モデル実装
- [ ] Prisma Migration実行

### Phase 2: API実装（VoiceDrive側）

- [ ] お知らせ受信API実装
  - `POST /api/v1/hr-announcements/receive`
- [ ] お知らせ一覧取得API実装
  - `GET /api/v1/hr-announcements`
- [ ] 既読登録API実装
  - `POST /api/v1/hr-announcements/{id}/read`
- [ ] アクション実行API実装
  - `POST /api/v1/hr-announcements/{id}/actions`
- [ ] 統計送信Webhook実装（日次バッチ）

### Phase 3: 配信対象解決ロジック実装

- [ ] 全職員配信（global）
- [ ] 部署単位配信（departments）
  - 医療システムAPI連携: `GET /api/employees/department/{deptId}`
- [ ] 施設単位配信（facilities）
  - 医療システムAPI連携: `GET /api/employees/facility/{facilityId}`
- [ ] 個人単位配信（individuals）
- [ ] 役職単位配信（positions）
  - 医療システムAPI連携: `GET /api/employees/position/{positionId}`

### Phase 4: 医療システム側実装（確認事項）

- [ ] HRAnnouncement マスターテーブル実装
- [ ] お知らせ作成管理画面実装
- [ ] VoiceDriveへの配信API実装
  - `POST https://voicedrive/api/v1/hr-announcements/receive`
- [ ] 統計受信Webhook実装
  - `POST /api/v1/hr-announcements/{id}/stats`
- [ ] アクション通知受信Webhook実装
  - `POST /api/v1/hr-announcements/actions`
- [ ] 人事統括指標API実装（9種類）

### Phase 5: フロントエンド修正

- [ ] HRAnnouncementsPage.tsx修正
  - モックデータ削除
  - API呼び出し実装
  - 既読管理実装
  - アクション実行実装
- [ ] HRManagementDashboard.tsx修正
  - ダミーデータ削除
  - 医療システムAPI呼び出し実装

---

## 📝 重要な確認事項

### 医療システムチームへの質問

1. **お知らせ作成権限**
   - 人事部のどの役職がお知らせを作成できますか？
   - 承認フローは必要ですか？（例: 部長承認後に配信）

2. **配信対象の粒度**
   - 部署・施設・役職・個人以外に必要な配信対象はありますか？
   - 例: 勤続年数別、年齢層別、専門分野別など

3. **統計データの用途**
   - VoiceDriveから送信する統計データをどのように活用しますか？
   - 人事部のダッシュボードで表示？レポート作成？

4. **アクション通知の緊急度**
   - 面談予約、ストレスチェックなどのアクションは即時通知が必要ですか？
   - それとも日次バッチで問題ないですか？

5. **HRManagementDashboardの実装時期**
   - 人事統括指標API（9種類）の実装スケジュールは？
   - VoiceDrive側の実装を先に進めて良いですか？

---

**文書終了**

最終更新: 2025年10月9日
次回更新予定: 医療システムチームからの回答受領後
