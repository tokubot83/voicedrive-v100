# アカウント無効化（EmergencyAccountDeactivation）ページ DB要件分析

**文書番号**: DB-REQ-2025-1010-001
**作成日**: 2025年10月10日
**対象ページ**: https://voicedrive-v100.vercel.app/emergency/account-deactivation
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
アカウント無効化ページは**医療システムとの連携が必須**であり、現在のLocalStorage実装から**完全なDB実装への移行**が必要です。以下の**重大な不足項目**があります。

### 🔴 重大な不足項目（即対応必要）

1. **`EmergencyDeactivation`テーブル不足**
   - EmergencyAccountService.ts 116-136行目: LocalStorageで保存（TODO: Prismaで実装）
   - 緊急停止記録の永続化が未実装
   - 監査要件を満たさない

2. **`StaffSystemSyncQueue`テーブル不足**
   - EmergencyAccountService.ts 183-201行目: LocalStorageでキューイング
   - 医療システム復旧後の同期機能が未実装
   - データ不整合のリスク

3. **医療システム連携Webhook不足**
   - VoiceDrive → 医療システム: アカウント停止通知
   - 医療システム → VoiceDrive: 停止完了確認
   - 双方向連携が未実装

4. **監査ログ強化が必要**
   - AuditLogテーブルは存在するが、緊急停止専用フィールドが不足
   - executorLevel, reason, isEmergency等の情報

---

## 🔍 詳細分析

### 1. ページ概要（EmergencyAccountDeactivation.tsx）

#### ページの目的
- **職員カルテシステム障害時の応急措置**
- 人事部門（レベル14-17）専用のアカウント緊急停止機能
- 監査ログへの記録が必須

#### アクセス権限
```typescript
// EmergencyAccountDeactivation.tsx 21-25行目
const hasPermission = () => {
  const level = currentUser?.permissionLevel || 0;
  return level >= 14 && level <= 17;
};
```

#### 主要機能
1. **権限チェック**: レベル14-17のみアクセス可能
2. **停止フォーム**: ターゲットユーザーID + 停止理由
3. **確認ダイアログ**: 実行前の最終確認
4. **停止実行**: `emergencyAccountService.deactivateAccount()`
5. **結果表示**: 成功/失敗メッセージ

---

### 2. 必要なデータソース

#### 表示・入力データ

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|-----------|-----------|-------------|--------------|---------|------|
| `currentUser` | ✅ キャッシュ | ✅ マスタ | 医療システム | セッション | ✅ OK |
| `permissionLevel` | ✅ キャッシュ | ✅ マスタ | 医療システム | セッション | ✅ OK |
| `targetUserId` | 🟢 入力 | ❌ | VoiceDrive | ユーザー入力 | ✅ OK |
| `reason` | 🟢 入力 | ❌ | VoiceDrive | ユーザー入力 | ✅ OK |

**評価**: ✅ 表示・入力データは現在の実装で対応可能

---

### 3. 停止処理の実装（EmergencyAccountService.ts）

#### 現在の実装状況

**A. 停止記録保存（116-136行目）**
```typescript
// 現状: LocalStorageに保存（仮実装）
localStorage.setItem(key, JSON.stringify(deactivation));

// TODO: Prismaでデータベースに保存
// await prisma.emergencyDeactivation.create({
//   data: { ... }
// });
```

**問題点**:
- LocalStorageはブラウザ依存、サーバー側で確認不可
- 監査要件を満たさない
- データ消失リスク

---

**B. 監査ログ記録（143-177行目）**
```typescript
// 現状: LocalStorageに保存（仮実装）
localStorage.setItem('audit_logs', JSON.stringify(auditLogs));

// TODO: Prismaでデータベースに保存
// await prisma.auditLog.create({
//   data: auditLog
// });
```

**問題点**:
- AuditLogテーブルは既存（schema.prisma 235-247行目）
- しかし、緊急停止専用フィールドが不足
  - `executorLevel`: 実行者の権限レベル
  - `reason`: 停止理由
  - `isEmergency`: 緊急停止フラグ
  - `syncPending`: 同期待ちフラグ

---

**C. 医療システム同期キュー（183-201行目）**
```typescript
// 現状: LocalStorageでキューイング
localStorage.setItem('staff_system_sync_queue', JSON.stringify(syncQueue));

// TODO: 職員カルテシステムのヘルスチェックを定期的に実行し、
//       復旧後に自動同期する機能を実装
```

**問題点**:
- 同期キューが永続化されていない
- ヘルスチェック機能が未実装
- 自動同期機能が未実装

---

### 4. データ管理責任分担

#### VoiceDrive側の責任

| データ項目 | 管理責任 | 理由 |
|-----------|---------|------|
| 緊急停止記録 | 🟢 VoiceDrive | 応急措置の記録 |
| 停止理由 | 🟢 VoiceDrive | VoiceDriveで入力 |
| 監査ログ | 🟢 VoiceDrive | システム操作の記録 |
| 同期キュー | 🟢 VoiceDrive | VoiceDrive→医療システム |

#### 医療システム側の責任

| データ項目 | 管理責任 | 理由 |
|-----------|---------|------|
| アカウント無効化 | 🔵 医療システム | 職員マスタの真実の情報源 |
| `Employee.isRetired` | 🔵 医療システム | 職員ステータス |
| `Employee.accountStatus` | 🔵 医療システム | アカウント状態 |

#### データフロー

```
VoiceDrive                           医療システム
  ├─ 緊急停止要求入力                  │
  ├─ EmergencyDeactivation記録        │
  ├─ AuditLog記録                    │
  ├─ SyncQueue追加                   │
  │                                   │
  └─ Webhook送信 ─────────────────→ │
                                      ├─ Webhook受信
                                      ├─ Employee.accountStatus更新
                                      ├─ Employee.isRetired = true?
                                      │
  ┌──────────────────────────────── └─ 確認Webhook送信
  │
  ├─ 確認Webhook受信
  ├─ EmergencyDeactivation.syncToStaffSystem = true
  └─ User.isRetired = true（キャッシュ更新）
```

---

## 📋 必要な追加テーブル一覧

### 1. VoiceDrive側で追加が必要

#### 🔴 優先度: 高（即対応）

**A. EmergencyDeactivation（緊急停止記録）**
```prisma
model EmergencyDeactivation {
  id                  String    @id @default(cuid())
  targetUserId        String    @map("target_user_id")
  targetEmployeeId    String?   @map("target_employee_id") // User.employeeId（キャッシュ）
  executedBy          String    @map("executed_by")        // User.id
  executorEmployeeId  String?   @map("executor_employee_id") // User.employeeId（キャッシュ）
  executorName        String?   @map("executor_name")      // User.name（キャッシュ）
  executorLevel       Float     @map("executor_level")     // 権限レベル
  reason              String    @db.Text                   // 停止理由
  timestamp           DateTime  @default(now())
  isEmergency         Boolean   @default(true) @map("is_emergency")
  syncToStaffSystem   Boolean   @default(false) @map("sync_to_staff_system")
  syncedAt            DateTime? @map("synced_at")

  // ステータス
  status              String    @default("pending") // 'pending' | 'synced' | 'failed'
  errorMessage        String?   @map("error_message")

  // 監査情報
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  @@index([targetUserId])
  @@index([executedBy])
  @@index([timestamp])
  @@index([status])
  @@index([syncToStaffSystem])
  @@map("emergency_deactivations")
}
```

**理由**:
- EmergencyAccountService.ts 78-85行目で定義されているが、DB保存未実装
- 監査要件を満たすために永続化が必須
- 医療システム同期状態の追跡が必要

**影響範囲**:
- EmergencyAccountService.ts: 116-136行目（保存処理）
- EmergencyAccountDeactivation.tsx: 28-56行目（停止処理）

---

**B. StaffSystemSyncQueue（医療システム同期キュー）**
```prisma
model StaffSystemSyncQueue {
  id                  String    @id @default(cuid())

  // 同期タイプ
  type                String    // 'ACCOUNT_DEACTIVATION' | 'ACCOUNT_REACTIVATION' | 'USER_UPDATE'

  // 対象
  targetUserId        String?   @map("target_user_id")
  targetEmployeeId    String?   @map("target_employee_id")

  // ペイロード
  payload             Json      // 同期データ（type別に内容が異なる）

  // ステータス
  status              String    @default("queued") // 'queued' | 'processing' | 'completed' | 'failed'
  retryCount          Int       @default(0) @map("retry_count")
  maxRetries          Int       @default(3) @map("max_retries")

  // 実行情報
  queuedAt            DateTime  @default(now()) @map("queued_at")
  processedAt         DateTime? @map("processed_at")
  completedAt         DateTime? @map("completed_at")
  nextRetryAt         DateTime? @map("next_retry_at")

  // エラー情報
  errorMessage        String?   @map("error_message")
  errorStack          String?   @db.Text @map("error_stack")

  // 関連レコード
  relatedDeactivationId String? @map("related_deactivation_id")

  // タイムスタンプ
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  @@index([status])
  @@index([type])
  @@index([queuedAt])
  @@index([nextRetryAt])
  @@index([targetUserId])
  @@map("staff_system_sync_queue")
}
```

**理由**:
- EmergencyAccountService.ts 183-201行目でLocalStorageを使用中
- 医療システム復旧後の自動同期に必須
- リトライ機能とエラーハンドリングが必要

**使用例**:
```typescript
// 同期キューに追加
await prisma.staffSystemSyncQueue.create({
  data: {
    type: 'ACCOUNT_DEACTIVATION',
    targetUserId: 'user_123',
    targetEmployeeId: 'EMP2024001',
    payload: {
      reason: '退職処理・職員カルテシステム障害中',
      executedBy: 'user_admin',
      timestamp: new Date().toISOString()
    },
    relatedDeactivationId: 'deactivation_456'
  }
});
```

---

#### 🟡 優先度: 中（推奨）

**C. AuditLogテーブルの拡張**

**現在のAuditLog（schema.prisma 235-247行目）**:
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  entityType String
  entityId   String
  oldValues  Json?
  newValues  Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}
```

**推奨拡張**:
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  entityType String
  entityId   String
  oldValues  Json?
  newValues  Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  // 🆕 緊急停止専用フィールド
  executorLevel      Float?    @map("executor_level")      // 実行者の権限レベル
  targetUserId       String?   @map("target_user_id")      // 対象ユーザーID
  reason             String?   @db.Text                    // 理由（緊急停止等）
  isEmergencyAction  Boolean   @default(false) @map("is_emergency_action")
  syncPending        Boolean   @default(false) @map("sync_pending")

  user       User     @relation(fields: [userId], references: [id])

  // 🆕 インデックス追加
  @@index([action, isEmergencyAction])
  @@index([targetUserId])
}
```

**理由**:
- EmergencyAccountService.ts 149-161行目で監査ログを作成
- 緊急操作の特定とフィルタリングに必要
- コンプライアンス要件を満たすため

---

### 2. 医療システム側で追加が必要

#### 🔴 優先度: 高（即対応）

**D. EmployeeAccountStatusHistoryテーブル（推奨）**

**目的**: 医療システム側でアカウント状態変更履歴を記録

```prisma
// 医療システム: prisma/schema.prisma
model EmployeeAccountStatusHistory {
  id                  String    @id @default(cuid())
  employeeId          String    @map("employee_id")

  // ステータス変更
  previousStatus      String    @map("previous_status")  // 'active' | 'inactive' | 'suspended'
  newStatus           String    @map("new_status")

  // 変更理由
  reason              String    @db.Text
  changedBy           String    @map("changed_by")       // 実行者のemployeeId
  changedByName       String?   @map("changed_by_name")

  // VoiceDrive連携情報
  isEmergencyChange   Boolean   @default(false) @map("is_emergency_change")
  sourceSystem        String    @default("medical_system") // 'medical_system' | 'voicedrive'
  voiceDriveDeactivationId String? @map("voicedrive_deactivation_id")

  // タイムスタンプ
  changedAt           DateTime  @default(now()) @map("changed_at")
  createdAt           DateTime  @default(now()) @map("created_at")

  employee            Employee  @relation(fields: [employeeId], references: [id])

  @@index([employeeId])
  @@index([changedAt])
  @@index([sourceSystem])
  @@index([isEmergencyChange])
  @@map("employee_account_status_history")
}
```

**理由**:
- 医療システム側でもアカウント変更履歴を保持
- VoiceDriveからの緊急停止を識別
- 監査証跡の完全性

---

## 🔗 医療システムへの依頼内容

### A. Webhook提供依頼（2件）

#### Webhook-1: アカウント緊急停止通知（VoiceDrive → 医療システム）

**送信先**:
```
POST https://medical-system.local/api/webhooks/voicedrive-emergency-deactivation
```

**ペイロード例**:
```json
{
  "eventType": "account.emergency_deactivation",
  "timestamp": "2025-10-10T15:30:00Z",
  "deactivationId": "deact_abc123",
  "employeeId": "EMP2024001",
  "targetUserId": "level-1-staff",
  "reason": "退職処理・職員カルテシステム障害中",
  "executedBy": {
    "userId": "admin_user",
    "employeeId": "EMP2020001",
    "name": "人事部長",
    "permissionLevel": 15
  },
  "signature": "HMAC-SHA256署名"
}
```

**医療システム側の処理**:
```typescript
// 医療システム: src/api/webhooks/voicedrive-emergency-deactivation.ts
export async function handleEmergencyDeactivation(payload) {
  // 1. Employee.accountStatus更新
  await prisma.employee.update({
    where: { employeeId: payload.employeeId },
    data: {
      accountStatus: 'inactive',
      // isRetiredは手動で確認後に更新（緊急停止≠退職の可能性）
    }
  });

  // 2. 履歴記録
  await prisma.employeeAccountStatusHistory.create({
    data: {
      employeeId: payload.employeeId,
      previousStatus: 'active',
      newStatus: 'inactive',
      reason: payload.reason,
      changedBy: payload.executedBy.employeeId,
      isEmergencyChange: true,
      sourceSystem: 'voicedrive',
      voiceDriveDeactivationId: payload.deactivationId
    }
  });

  // 3. 確認Webhookを返信
  await sendWebhookToVoiceDrive({
    eventType: 'account.deactivation_confirmed',
    deactivationId: payload.deactivationId,
    employeeId: payload.employeeId,
    status: 'completed'
  });
}
```

---

#### Webhook-2: アカウント停止確認通知（医療システム → VoiceDrive）

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/account-deactivation-confirmed
```

**ペイロード例**:
```json
{
  "eventType": "account.deactivation_confirmed",
  "timestamp": "2025-10-10T15:31:00Z",
  "deactivationId": "deact_abc123",
  "employeeId": "EMP2024001",
  "status": "completed",
  "medicalSystemConfirmedAt": "2025-10-10T15:30:45Z",
  "signature": "HMAC-SHA256署名"
}
```

**VoiceDrive側の処理**:
```typescript
// VoiceDrive: src/api/webhooks/account-deactivation-confirmed.ts
export async function handleDeactivationConfirmed(payload) {
  // 1. EmergencyDeactivation更新
  await prisma.emergencyDeactivation.update({
    where: { id: payload.deactivationId },
    data: {
      syncToStaffSystem: true,
      syncedAt: new Date(payload.medicalSystemConfirmedAt),
      status: 'synced'
    }
  });

  // 2. SyncQueue完了
  await prisma.staffSystemSyncQueue.updateMany({
    where: { relatedDeactivationId: payload.deactivationId },
    data: {
      status: 'completed',
      completedAt: new Date()
    }
  });

  // 3. User.isRetired更新（キャッシュ）
  const user = await prisma.user.findFirst({
    where: { employeeId: payload.employeeId }
  });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isRetired: true,
        retirementDate: new Date()
      }
    });
  }
}
```

---

### B. API提供依頼（1件）

#### API-1: ヘルスチェックAPI（医療システム）

**エンドポイント**:
```
GET /api/health/status
```

**必要な理由**:
- 職員カルテシステムの復旧を検知
- 同期キューの自動処理開始トリガー

**レスポンス例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-10T15:30:00Z",
  "services": {
    "database": "healthy",
    "api": "healthy",
    "webhooks": "healthy"
  },
  "uptime": 86400
}
```

**VoiceDrive側の使用方法**:
```typescript
// VoiceDrive: 定期ヘルスチェック（5分ごと）
setInterval(async () => {
  try {
    const health = await fetch('https://medical-system.local/api/health/status');
    if (health.ok) {
      // 医療システム復旧 → 同期キューを処理
      await processSyncQueue();
    }
  } catch (error) {
    console.log('医療システム未復旧:', error);
  }
}, 5 * 60 * 1000);
```

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（2-3日）

**目標**: LocalStorageからDB保存への移行

1. 🔴 **EmergencyDeactivationテーブル追加**
   ```bash
   npx prisma migrate dev --name add_emergency_deactivation
   ```

2. 🔴 **EmergencyAccountService.tsの修正**
   - `saveDeactivationRecord()`をPrisma実装に変更（116-136行目）
   - `logAuditAction()`をPrisma実装に変更（143-177行目）

3. 🔴 **StaffSystemSyncQueueテーブル追加**
   ```bash
   npx prisma migrate dev --name add_staff_system_sync_queue
   ```

4. 🔴 **同期キューロジック実装**
   - `notifyStaffSystemWhenAvailable()`をDB保存に変更（183-201行目）

**このPhaseで動作する機能**:
- ✅ 緊急停止記録の永続化
- ✅ 監査ログの永続化
- ✅ 同期キューの永続化
- ⚠️ 医療システムへの通知（未実装）

---

### Phase 2: 医療システム連携（3-5日）

**目標**: Webhook経由の双方向連携

1. 🔴 **VoiceDrive Webhook送信実装**
   ```typescript
   // src/services/MedicalSystemWebhookService.ts
   export async function sendEmergencyDeactivationNotification(
     deactivation: EmergencyDeactivation
   ) {
     const payload = {
       eventType: 'account.emergency_deactivation',
       timestamp: new Date().toISOString(),
       deactivationId: deactivation.id,
       employeeId: deactivation.targetEmployeeId,
       reason: deactivation.reason,
       executedBy: { ... }
     };

     const signature = generateHMAC(payload);
     await fetch('https://medical-system.local/api/webhooks/voicedrive-emergency-deactivation', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-VoiceDrive-Signature': signature
       },
       body: JSON.stringify(payload)
     });
   }
   ```

2. 🔴 **VoiceDrive Webhook受信実装**
   ```typescript
   // src/api/webhooks/account-deactivation-confirmed.ts
   export async function POST(request: Request) {
     const payload = await request.json();

     // 署名検証
     const isValid = verifyHMAC(payload, request.headers.get('X-Medical-System-Signature'));
     if (!isValid) {
       return Response.json({ error: 'Invalid signature' }, { status: 401 });
     }

     await handleDeactivationConfirmed(payload);
     return Response.json({ status: 'ok' });
   }
   ```

3. 🔴 **医療システム側実装（医療チーム作業）**
   - Webhook受信エンドポイント実装
   - Employee.accountStatus更新
   - EmployeeAccountStatusHistory記録
   - 確認Webhook送信

**このPhaseで動作する機能**:
- ✅ VoiceDrive → 医療システム通知
- ✅ 医療システム → VoiceDrive確認
- ✅ 双方向連携完了

---

### Phase 3: 自動同期機能（2-3日）

**目標**: 医療システム復旧後の自動同期

1. 🟡 **ヘルスチェック実装**
   ```typescript
   // src/jobs/medicalSystemHealthCheck.ts
   export async function checkMedicalSystemHealth() {
     try {
       const response = await fetch('https://medical-system.local/api/health/status');
       if (response.ok) {
         // 復旧検知 → 同期キュー処理
         await processSyncQueue();
       }
     } catch (error) {
       console.log('医療システム未復旧');
     }
   }
   ```

2. 🟡 **同期キュー処理実装**
   ```typescript
   // src/jobs/processSyncQueue.ts
   export async function processSyncQueue() {
     const queuedItems = await prisma.staffSystemSyncQueue.findMany({
       where: {
         status: { in: ['queued', 'failed'] },
         retryCount: { lt: prisma.staffSystemSyncQueue.fields.maxRetries }
       },
       orderBy: { queuedAt: 'asc' }
     });

     for (const item of queuedItems) {
       await processQueueItem(item);
     }
   }
   ```

3. 🟡 **定期ジョブ設定**
   ```typescript
   // VoiceDrive: cron設定（5分ごと）
   cron.schedule('*/5 * * * *', checkMedicalSystemHealth);
   ```

**このPhaseで動作する機能**:
- ✅ 医療システム復旧の自動検知
- ✅ 同期キューの自動処理
- ✅ リトライ機能

---

## 📊 データフロー図

### 現在の状態（Phase 0）
```
EmergencyAccountDeactivation.tsx
  ↓ 停止実行
EmergencyAccountService.ts
  ↓ LocalStorage保存（仮実装）
  - emergency_deactivation_{userId}
  - audit_logs
  - staff_system_sync_queue

⚠️ データ永続化なし
⚠️ 医療システム連携なし
```

### Phase 1完了後
```
EmergencyAccountDeactivation.tsx
  ↓ 停止実行
EmergencyAccountService.ts
  ↓ Prisma保存
  ├─ EmergencyDeactivation テーブル
  ├─ AuditLog テーブル
  └─ StaffSystemSyncQueue テーブル

✅ データ永続化完了
⚠️ 医療システム連携未実装
```

### Phase 2完了後
```
EmergencyAccountDeactivation.tsx
  ↓ 停止実行
EmergencyAccountService.ts
  ↓ Prisma保存 + Webhook送信
  ├─ EmergencyDeactivation テーブル
  ├─ AuditLog テーブル
  ├─ StaffSystemSyncQueue テーブル
  └─ Webhook → 医療システム
                  ↓
               Employee.accountStatus更新
               EmployeeAccountStatusHistory記録
                  ↓
               確認Webhook → VoiceDrive
                              ↓
                           EmergencyDeactivation.syncToStaffSystem = true
                           User.isRetired = true

✅ 双方向連携完了
```

### Phase 3完了後
```
定期ヘルスチェック（5分ごと）
  ↓ 医療システム復旧検知
processSyncQueue()
  ↓ 未処理キュー取得
StaffSystemSyncQueue（status='queued'）
  ↓ 自動送信
医療システム
  ↓ 処理完了
StaffSystemSyncQueue.status = 'completed'

✅ 完全自動化
```

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1: DB移行
- [ ] EmergencyDeactivationテーブル追加（schema.prisma）
- [ ] StaffSystemSyncQueueテーブル追加（schema.prisma）
- [ ] AuditLogテーブル拡張（schema.prisma）
- [ ] マイグレーション実行
- [ ] EmergencyAccountService.ts修正（Prisma実装）
  - [ ] saveDeactivationRecord()
  - [ ] logAuditAction()
  - [ ] notifyStaffSystemWhenAvailable()
- [ ] 単体テスト作成
- [ ] E2Eテスト（UI操作）

#### Phase 2: Webhook連携
- [ ] MedicalSystemWebhookService.ts実装（送信）
- [ ] /api/webhooks/account-deactivation-confirmed.ts実装（受信）
- [ ] HMAC署名生成・検証実装
- [ ] Webhook送信エラーハンドリング
- [ ] 統合テスト（モック使用）

#### Phase 3: 自動同期
- [ ] checkMedicalSystemHealth.ts実装
- [ ] processSyncQueue.ts実装
- [ ] cronジョブ設定
- [ ] リトライロジック実装
- [ ] 負荷テスト

### 医療システム側の実装

#### API実装
- [ ] GET /api/health/status 実装
- [ ] POST /api/webhooks/voicedrive-emergency-deactivation 実装
- [ ] HMAC署名検証実装
- [ ] Employee.accountStatus更新ロジック
- [ ] EmployeeAccountStatusHistory記録
- [ ] 確認Webhook送信実装

#### テスト
- [ ] Webhook受信テスト
- [ ] Employee更新テスト
- [ ] 履歴記録テスト
- [ ] 統合テスト（VoiceDrive連携）

### ドキュメント

- [ ] API仕様書（OpenAPI 3.0）
- [ ] Webhookペイロード仕様書
- [ ] エラーコード一覧
- [ ] 運用手順書
- [ ] トラブルシューティングガイド

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [共通DB構築後統合作業再開計画書](./共通DB構築後統合作業再開計画書_20251008.md)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
次回レビュー: Phase 1実装後
