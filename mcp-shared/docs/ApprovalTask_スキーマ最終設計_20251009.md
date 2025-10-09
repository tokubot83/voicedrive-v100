# ApprovalTask スキーマ最終設計書

**作成日**: 2025年10月9日
**対象**: TeamLeaderDashboard Phase 1実装
**実装予定日**: 2025年11月18日
**ステータス**: 最終設計完了

---

## 📋 概要

ApprovalTaskテーブルは、TeamLeaderDashboard（レベル2: 主任・師長）の承認待ちタスク機能を実装するためのテーブルです。

### 設計方針（医療システムチーム回答反映）

**確認事項への回答**:
- ✅ **承認権限**: VoiceDrive側でpermissionLevel判定（医療システムAPI不要）
- ✅ **承認履歴**: VoiceDrive ApprovalTaskテーブルで管理（Webhook送信不要）
- ✅ **管理責任**: 100% VoiceDrive側（データ管理責任分界点明確化）

**設計ポリシー**:
1. **自己完結型**: 医療システムとの連携なし
2. **柔軟な承認ルール**: permissionLevelとtaskTypeで判定
3. **監査証跡**: 申請・承認の全履歴を保持
4. **パフォーマンス**: インデックス最適化

---

## 🗄️ スキーマ定義

### Prismaスキーマ

```prisma
// 承認タスク（TeamLeaderDashboard専用）
model ApprovalTask {
  id              String    @id @default(cuid())

  // タスク基本情報
  title           String
  description     String?   @db.Text
  taskType        String    // purchase_request, training_request, leave_request, expense_report, etc.
  amount          Float?    // 金額（該当する場合のみ）

  // 申請者情報
  requesterId     String    // User.id（VoiceDrive内部ID）
  requesterName   String?   // キャッシュ用（表示高速化）
  requesterEmployeeId String? // User.employeeId（医療システムID）

  // 承認者情報
  approverId      String?   // User.id（承認後に設定）
  approverName    String?   // キャッシュ用
  approverEmployeeId String? // User.employeeId（承認者の医療システムID）

  // ステータス
  status          String    @default("pending") // pending, approved, rejected, cancelled
  priority        String    @default("medium")  // low, medium, high

  // 組織情報（フィルタリング用）
  department      String?   // 部門コード（例: "medical_care_ward"）
  facilityId      String?   // 施設ID（例: "tategami_hospital"）

  // タイムスタンプ
  submittedAt     DateTime  @default(now())  // 申請日時
  respondedAt     DateTime?                  // 承認/却下日時

  // 承認コメント
  approverComment String?   @db.Text         // 承認者のコメント（承認理由・却下理由）

  // 追加情報（JSON形式で柔軟に拡張可能）
  metadata        Json?     // タスクタイプごとの追加情報

  // 監査情報
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // リレーション
  requester       User      @relation("ApprovalRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  approver        User?     @relation("ApprovalApprover", fields: [approverId], references: [id])

  // インデックス（パフォーマンス最適化）
  @@index([requesterId])          // 申請者で検索
  @@index([approverId])           // 承認者で検索
  @@index([status])               // ステータスで検索（pending一覧など）
  @@index([department])           // 部門で検索
  @@index([facilityId])           // 施設で検索
  @@index([taskType])             // タスクタイプで検索
  @@index([priority])             // 優先度で検索
  @@index([submittedAt])          // 申請日時でソート
  @@index([status, department])   // 複合インデックス（部門×ステータス）
  @@index([status, approverId])   // 複合インデックス（承認者×ステータス）
}
```

### Userモデル修正

```prisma
model User {
  id                   String         @id @default(cuid())
  // ... 既存フィールド（変更なし）

  // 🆕 ApprovalTask リレーション追加
  approvalRequestsSent     ApprovalTask[] @relation("ApprovalRequester")
  approvalTasksReceived    ApprovalTask[] @relation("ApprovalApprover")

  // ... 既存リレーション（変更なし）
}
```

---

## 📊 フィールド詳細仕様

### 基本情報フィールド

#### `title` (String, 必須)
- **説明**: タスクのタイトル
- **例**: "備品購入申請", "研修参加申請", "有給休暇申請"
- **制約**: 最大255文字
- **UI表示**: 一覧表示のメインタイトル

#### `description` (String?, Text型)
- **説明**: タスクの詳細説明
- **例**: "外来用の血圧計を購入したい。現在使用中の機器が故障しているため、至急購入が必要です。"
- **制約**: 最大65,535文字（MySQLのTEXT型）
- **UI表示**: 詳細モーダルで表示

#### `taskType` (String, 必須)
- **説明**: タスクの種類
- **定義値**:
  - `purchase_request`: 備品購入申請
  - `training_request`: 研修参加申請
  - `leave_request`: 休暇申請
  - `expense_report`: 経費精算申請
  - `budget_request`: 予算申請
  - `overtime_request`: 残業申請
  - `other`: その他
- **承認権限判定**: このフィールドを使用して承認可能なpermissionLevelを判定
- **拡張性**: 将来的に新しいtaskTypeを追加可能

#### `amount` (Float?, オプション)
- **説明**: 金額（該当する場合のみ）
- **例**: 50000.0（5万円）
- **制約**: NULL可（金額が関係ないタスクの場合）
- **UI表示**: "¥50,000"のように通貨フォーマットで表示

---

### 申請者情報フィールド

#### `requesterId` (String, 必須)
- **説明**: 申請者のVoiceDrive内部ID（User.id）
- **外部キー**: User.id
- **削除時動作**: CASCADE（申請者が削除されたらタスクも削除）
- **インデックス**: あり

#### `requesterName` (String?, オプション)
- **説明**: 申請者氏名（キャッシュ用）
- **例**: "山田 太郎"
- **更新タイミング**: タスク作成時にUser.nameから取得
- **目的**: 表示高速化（JOIN不要）

#### `requesterEmployeeId` (String?, オプション)
- **説明**: 申請者の医療システムID（User.employeeId）
- **例**: "EMP-2025-001"
- **目的**: 医療システムとの照合、レポート作成時のIDトレーサビリティ

---

### 承認者情報フィールド

#### `approverId` (String?, オプション)
- **説明**: 承認者のVoiceDrive内部ID（User.id）
- **外部キー**: User.id
- **削除時動作**: SET NULL（承認者が削除されても履歴は残す）
- **設定タイミング**: 承認/却下時に設定

#### `approverName` (String?, オプション)
- **説明**: 承認者氏名（キャッシュ用）
- **例**: "佐藤 花子"
- **更新タイミング**: 承認/却下時にUser.nameから取得

#### `approverEmployeeId` (String?, オプション)
- **説明**: 承認者の医療システムID（User.employeeId）
- **例**: "EMP-2025-015"
- **目的**: 承認履歴の監査証跡

---

### ステータスフィールド

#### `status` (String, 必須, デフォルト: "pending")
- **説明**: タスクのステータス
- **定義値**:
  - `pending`: 承認待ち
  - `approved`: 承認済み
  - `rejected`: 却下
  - `cancelled`: 取り下げ（申請者が自分でキャンセル）
- **インデックス**: あり（高頻度検索）
- **状態遷移**:
  ```
  pending → approved  (承認)
  pending → rejected  (却下)
  pending → cancelled (取り下げ)
  ```

#### `priority` (String, 必須, デフォルト: "medium")
- **説明**: タスクの優先度
- **定義値**:
  - `low`: 低優先度（通常の申請）
  - `medium`: 中優先度（標準）
  - `high`: 高優先度（至急）
- **インデックス**: あり
- **ソート順**: 一覧表示時に優先度でソート

---

### 組織情報フィールド

#### `department` (String?, オプション)
- **説明**: 部門コード
- **例**: "medical_care_ward", "nursing_dept"
- **取得元**: User.department（申請者の部門）
- **用途**: 部門ごとのフィルタリング、統計集計
- **インデックス**: あり（高頻度検索）

#### `facilityId` (String?, オプション)
- **説明**: 施設ID
- **例**: "tategami_hospital", "kohara_hospital"
- **取得元**: User.facilityId（申請者の施設）
- **用途**: 施設ごとのフィルタリング、統計集計
- **インデックス**: あり

---

### タイムスタンプフィールド

#### `submittedAt` (DateTime, 必須, デフォルト: now())
- **説明**: 申請日時
- **形式**: ISO8601（例: "2025-10-09T10:00:00Z"）
- **インデックス**: あり（ソート用）
- **用途**: 申請順ソート、待機日数計算

#### `respondedAt` (DateTime?, オプション)
- **説明**: 承認/却下日時
- **設定タイミング**: 承認または却下時に設定
- **用途**: 承認処理時間の分析、SLA計測

---

### 承認コメントフィールド

#### `approverComment` (String?, Text型)
- **説明**: 承認者のコメント
- **例**:
  - 承認時: "緊急性を考慮し、承認します。"
  - 却下時: "予算不足のため、次四半期に再申請してください。"
- **制約**: 最大65,535文字（MySQLのTEXT型）
- **必須性**: 却下時は必須（理由説明）、承認時は任意

---

### 追加情報フィールド

#### `metadata` (Json?, オプション)
- **説明**: タスクタイプごとの追加情報
- **形式**: JSON
- **例**:

**備品購入申請**:
```json
{
  "itemName": "血圧計",
  "quantity": 2,
  "unitPrice": 25000,
  "vendor": "医療機器株式会社",
  "catalogUrl": "https://example.com/products/123",
  "urgencyReason": "現在使用中の機器が故障"
}
```

**研修参加申請**:
```json
{
  "trainingName": "看護技術研修",
  "trainingDate": "2025-11-15",
  "duration": 2,
  "location": "東京会議場",
  "cost": 30000,
  "expectedBenefits": "最新の看護技術を習得"
}
```

**休暇申請**:
```json
{
  "leaveType": "annual_leave",
  "startDate": "2025-10-15",
  "endDate": "2025-10-17",
  "days": 3,
  "reason": "私用"
}
```

**拡張性**: 将来的に新しいフィールドをmetadataに追加可能

---

## 🔐 承認権限判定ロジック

### ApprovalService.ts 実装例

```typescript
/**
 * ユーザーがタスクを承認可能かどうかを判定
 */
export function canApprove(user: User, task: ApprovalTask): boolean {
  const level = Number(user.permissionLevel);

  switch (task.taskType) {
    case 'leave_request':
      // 休暇申請: 主任以上（Level 2.0以上）
      return level >= 2.0;

    case 'purchase_request':
      // 備品購入申請: 金額による判定
      if (!task.amount) return level >= 2.0;
      if (task.amount <= 50000) return level >= 2.0;   // 5万円以下: 主任
      if (task.amount <= 200000) return level >= 5.0;  // 20万円以下: 統括主任
      return level >= 10.0;                            // 20万円超: 課長以上

    case 'training_request':
      // 研修参加申請: 統括主任以上（Level 5.0以上）
      return level >= 5.0;

    case 'expense_report':
      // 経費精算: 統括主任以上（Level 5.0以上）
      return level >= 5.0;

    case 'budget_request':
      // 予算申請: 課長以上（Level 10.0以上）
      return level >= 10.0;

    case 'overtime_request':
      // 残業申請: 主任以上（Level 2.0以上）
      return level >= 2.0;

    default:
      // デフォルト: 統括主任以上（Level 5.0以上）
      return level >= 5.0;
  }
}

/**
 * ユーザーが承認可能なタスク一覧を取得
 */
export async function getPendingApprovalTasks(
  userId: string,
  options?: {
    department?: string;
    taskType?: string;
    priority?: string;
    limit?: number;
  }
): Promise<ApprovalTask[]> {
  const { department, taskType, priority, limit = 20 } = options || {};

  // ユーザー情報取得
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) throw new Error('User not found');

  // 承認待ちタスク取得
  const tasks = await prisma.approvalTask.findMany({
    where: {
      status: 'pending',
      ...(department && { department }),
      ...(taskType && { taskType }),
      ...(priority && { priority })
    },
    include: {
      requester: {
        select: { name: true, avatar: true, position: true }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { submittedAt: 'asc' }
    ],
    take: limit
  });

  // 承認権限でフィルタリング
  return tasks.filter(task => canApprove(user, task));
}
```

---

## 📈 パフォーマンス最適化

### インデックス戦略

#### 単一カラムインデックス
```prisma
@@index([requesterId])    // 申請者で検索（マイページ）
@@index([approverId])     // 承認者で検索（承認履歴）
@@index([status])         // ステータスで検索（pending一覧）
@@index([department])     // 部門で検索（部門統計）
@@index([facilityId])     // 施設で検索（施設統計）
@@index([taskType])       // タスクタイプで検索（種類別集計）
@@index([priority])       // 優先度で検索（高優先度一覧）
@@index([submittedAt])    // 申請日時でソート
```

#### 複合インデックス
```prisma
@@index([status, department])   // 部門×ステータス検索
@@index([status, approverId])   // 承認者×ステータス検索
```

### クエリ最適化例

#### 承認待ちタスク取得（最も頻繁なクエリ）
```sql
-- インデックス使用: status, department
SELECT * FROM ApprovalTask
WHERE status = 'pending' AND department = 'medical_care_ward'
ORDER BY priority DESC, submittedAt ASC
LIMIT 20;
```
**期待パフォーマンス**: < 10ms（1000件中20件取得）

#### 承認者の承認履歴取得
```sql
-- インデックス使用: status, approverId
SELECT * FROM ApprovalTask
WHERE status IN ('approved', 'rejected') AND approverId = 'user-123'
ORDER BY respondedAt DESC
LIMIT 50;
```
**期待パフォーマンス**: < 15ms（5000件中50件取得）

---

## 🧪 テストケース

### ユニットテスト

#### ApprovalService.test.ts

```typescript
describe('ApprovalService', () => {
  describe('canApprove()', () => {
    it('should allow Level 2 user to approve leave_request', () => {
      const user = { permissionLevel: 2.0 };
      const task = { taskType: 'leave_request' };
      expect(canApprove(user, task)).toBe(true);
    });

    it('should deny Level 1 user to approve leave_request', () => {
      const user = { permissionLevel: 1.0 };
      const task = { taskType: 'leave_request' };
      expect(canApprove(user, task)).toBe(false);
    });

    it('should allow Level 2 user to approve purchase_request under 50k', () => {
      const user = { permissionLevel: 2.0 };
      const task = { taskType: 'purchase_request', amount: 30000 };
      expect(canApprove(user, task)).toBe(true);
    });

    it('should deny Level 2 user to approve purchase_request over 50k', () => {
      const user = { permissionLevel: 2.0 };
      const task = { taskType: 'purchase_request', amount: 100000 };
      expect(canApprove(user, task)).toBe(false);
    });
  });

  describe('getPendingApprovalTasks()', () => {
    it('should return only tasks that user can approve', async () => {
      // Level 2 ユーザー
      const user = await prisma.user.create({
        data: { permissionLevel: 2.0, department: 'medical_care_ward' }
      });

      // 承認可能なタスク
      await prisma.approvalTask.create({
        data: {
          taskType: 'leave_request',
          requesterId: 'user-1',
          department: 'medical_care_ward'
        }
      });

      // 承認不可能なタスク
      await prisma.approvalTask.create({
        data: {
          taskType: 'budget_request', // Level 10以上が必要
          requesterId: 'user-2',
          department: 'medical_care_ward'
        }
      });

      const tasks = await getPendingApprovalTasks(user.id, {
        department: 'medical_care_ward'
      });

      expect(tasks.length).toBe(1); // leave_request のみ
      expect(tasks[0].taskType).toBe('leave_request');
    });
  });
});
```

### 統合テスト（11月23日実施予定）

```typescript
describe('ApprovalTask Integration Test', () => {
  it('should complete full approval workflow', async () => {
    // 1. 申請者がタスク作成
    const requester = await createUser({ permissionLevel: 1.0, department: 'medical_care_ward' });
    const task = await prisma.approvalTask.create({
      data: {
        title: '備品購入申請',
        description: '血圧計を購入したい',
        taskType: 'purchase_request',
        amount: 30000,
        requesterId: requester.id,
        requesterName: requester.name,
        department: requester.department,
        status: 'pending'
      }
    });

    // 2. 承認者（Level 2）がタスク承認
    const approver = await createUser({ permissionLevel: 2.0, department: 'medical_care_ward' });
    await approveTask(task.id, approver.id, '緊急性を考慮し承認します');

    // 3. タスクが承認済みになっていることを確認
    const updatedTask = await prisma.approvalTask.findUnique({
      where: { id: task.id }
    });

    expect(updatedTask.status).toBe('approved');
    expect(updatedTask.approverId).toBe(approver.id);
    expect(updatedTask.approverName).toBe(approver.name);
    expect(updatedTask.respondedAt).toBeTruthy();
    expect(updatedTask.approverComment).toBe('緊急性を考慮し承認します');
  });
});
```

---

## 📝 マイグレーション計画

### マイグレーションファイル生成（11月18日実施）

```bash
# 1. schema.prismaにApprovalTaskを追加
# 2. マイグレーションファイル生成
npx prisma migrate dev --name add_approval_task_model

# 3. マイグレーションファイル確認
# prisma/migrations/[timestamp]_add_approval_task_model/migration.sql
```

### 期待されるSQL（自動生成）

```sql
-- CreateTable
CREATE TABLE `ApprovalTask` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `taskType` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `requesterName` VARCHAR(191) NULL,
    `requesterEmployeeId` VARCHAR(191) NULL,
    `approverId` VARCHAR(191) NULL,
    `approverName` VARCHAR(191) NULL,
    `approverEmployeeId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `department` VARCHAR(191) NULL,
    `facilityId` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondedAt` DATETIME(3) NULL,
    `approverComment` TEXT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ApprovalTask_requesterId_idx`(`requesterId`),
    INDEX `ApprovalTask_approverId_idx`(`approverId`),
    INDEX `ApprovalTask_status_idx`(`status`),
    INDEX `ApprovalTask_department_idx`(`department`),
    INDEX `ApprovalTask_facilityId_idx`(`facilityId`),
    INDEX `ApprovalTask_taskType_idx`(`taskType`),
    INDEX `ApprovalTask_priority_idx`(`priority`),
    INDEX `ApprovalTask_submittedAt_idx`(`submittedAt`),
    INDEX `ApprovalTask_status_department_idx`(`status`, `department`),
    INDEX `ApprovalTask_status_approverId_idx`(`status`, `approverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApprovalTask` ADD CONSTRAINT `ApprovalTask_requesterId_fkey`
    FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalTask` ADD CONSTRAINT `ApprovalTask_approverId_fkey`
    FOREIGN KEY (`approverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
```

### ロールバック手順

```bash
# マイグレーション失敗時のロールバック
npx prisma migrate resolve --rolled-back [migration-name]

# または手動SQL実行
DROP TABLE IF EXISTS `ApprovalTask`;
```

---

## 🚀 実装チェックリスト

### 11月18日（月）

- [ ] schema.prismaにApprovalTaskモデル追加
- [ ] schema.prismaのUserモデルにリレーション追加
- [ ] `npx prisma migrate dev --name add_approval_task_model` 実行
- [ ] マイグレーションSQL確認
- [ ] 本番環境用マイグレーションSQL生成（`npx prisma migrate deploy`用）
- [ ] seed.ts にダミーデータ追加（テスト用）

### 11月19日（火）

- [ ] ApprovalService.ts 実装
  - [ ] canApprove() 関数
  - [ ] getPendingApprovalTasks() 関数
  - [ ] approveTask() 関数
  - [ ] rejectTask() 関数
  - [ ] getTeamApprovalStats() 関数

### 11月22日（金）

- [ ] ApprovalService.test.ts 作成
- [ ] ユニットテスト実行（`npm test ApprovalService`）
- [ ] カバレッジ確認（目標: 80%以上）

### 11月23日（土）

- [ ] 統合テスト実施（医療システムチームと共同）
- [ ] パフォーマンステスト（1000件データで < 10ms）

---

## 📚 関連ドキュメント

- [TeamLeaderDashboard_DB要件分析_20251009.md](./TeamLeaderDashboard_DB要件分析_20251009.md)
- [TeamLeaderDashboard暫定マスターリスト_20251009.md](./TeamLeaderDashboard暫定マスターリスト_20251009.md)
- [TeamLeaderDashboard統合実装確認事項回答書（医療システムチーム）](./TeamLeaderDashboard統合実装確認事項回答書_20251009.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

**最終更新**: 2025年10月9日
**作成者**: VoiceDriveチーム (Claude AI Assistant)
**レビュー**: 未実施（11月1日実施予定）
**承認**: 未承認（11月1日承認予定）
