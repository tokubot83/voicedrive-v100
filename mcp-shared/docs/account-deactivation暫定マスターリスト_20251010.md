# アカウント無効化（Emergency Account Deactivation） 暫定マスターリスト

**作成日**: 2025年10月10日
**対象ページ**: EmergencyAccountDeactivation (`src/pages/EmergencyAccountDeactivation.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- 緊急アカウント停止ページは人事部門（レベル14-17）専用機能
- 職員カルテシステム障害時の応急措置として使用
- 現在はLocalStorageで仮実装（監査要件を満たさない）
- 医療システムとの連携が未実装

### 必要な対応
1. **医療システムへのWebhook通知**: 2件（送信1件、受信1件）
2. **医療システムからのAPI提供**: 1件（ヘルスチェック）
3. **VoiceDrive DB追加**: テーブル3件（新規2件、拡張1件）
4. **確認事項**: 3件

### 優先度
**Priority: CRITICAL（グループ0: 緊急機能）**

**理由**:
- 人事部門の業務継続に直結
- 監査要件（コンプライアンス）を満たす必要がある
- 職員カルテシステム障害時の唯一の応急措置

---

## 🔗 医療システムへの依頼内容

### A. Webhook通知依頼（2件）

#### Webhook-1: アカウント緊急停止通知の受信（医療システム側）

**トリガー**:
- VoiceDriveで緊急アカウント停止が実行された時

**受信先（医療システム）**:
```
POST /api/webhooks/voicedrive-emergency-deactivation
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
  "signature": "abc123..."  // HMAC-SHA256署名
}
```

**医療システム側の処理**:
```typescript
// 医療システム: src/api/webhooks/voicedrive-emergency-deactivation.ts
export async function handleEmergencyDeactivation(payload) {
  // 1. 署名検証
  const isValid = verifyHMAC(payload, signature);
  if (!isValid) throw new Error('Invalid signature');

  // 2. Employee.accountStatus更新
  await prisma.employee.update({
    where: { employeeId: payload.employeeId },
    data: {
      accountStatus: 'inactive',
      lastModifiedBy: payload.executedBy.employeeId,
      lastModifiedAt: new Date()
    }
  });

  // 3. 履歴記録
  await prisma.employeeAccountStatusHistory.create({
    data: {
      employeeId: payload.employeeId,
      previousStatus: 'active',
      newStatus: 'inactive',
      reason: payload.reason,
      changedBy: payload.executedBy.employeeId,
      changedByName: payload.executedBy.name,
      isEmergencyChange: true,
      sourceSystem: 'voicedrive',
      voiceDriveDeactivationId: payload.deactivationId
    }
  });

  // 4. 確認Webhookを返信
  await sendWebhookToVoiceDrive({
    eventType: 'account.deactivation_confirmed',
    deactivationId: payload.deactivationId,
    employeeId: payload.employeeId,
    status: 'completed',
    medicalSystemConfirmedAt: new Date().toISOString()
  });

  return { status: 'ok' };
}
```

---

#### Webhook-2: アカウント停止確認通知の送信（医療システム側）

**トリガー**:
- 医療システムがアカウント停止処理を完了した時

**送信先（VoiceDrive）**:
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
  "signature": "abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// VoiceDrive: src/api/webhooks/account-deactivation-confirmed.ts
export async function POST(request: Request) {
  const payload = await request.json();

  // 1. 署名検証
  const isValid = verifyHMAC(
    payload,
    request.headers.get('X-Medical-System-Signature')
  );
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 2. EmergencyDeactivation更新
  await prisma.emergencyDeactivation.update({
    where: { id: payload.deactivationId },
    data: {
      syncToStaffSystem: true,
      syncedAt: new Date(payload.medicalSystemConfirmedAt),
      status: 'synced'
    }
  });

  // 3. SyncQueue完了
  await prisma.staffSystemSyncQueue.updateMany({
    where: { relatedDeactivationId: payload.deactivationId },
    data: {
      status: 'completed',
      completedAt: new Date()
    }
  });

  // 4. User.isRetired更新（キャッシュ）
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

  return Response.json({ status: 'ok' });
}
```

---

### B. API提供依頼（1件）

#### API-1: ヘルスチェックAPI

**エンドポイント**:
```
GET /api/health/status
```

**必要な理由**:
- 職員カルテシステムの障害復旧を検知
- VoiceDriveの同期キュー処理を自動開始するトリガー
- システム間連携の信頼性向上

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
  "uptime": 86400,
  "version": "1.0.0"
}
```

**エラーレスポンス**:
```json
{
  "status": "unhealthy",
  "timestamp": "2025-10-10T15:30:00Z",
  "services": {
    "database": "healthy",
    "api": "degraded",
    "webhooks": "unhealthy"
  },
  "errors": [
    {
      "service": "webhooks",
      "message": "Webhook queue full"
    }
  ]
}
```

**セキュリティ**:
- 認証不要（パブリックエンドポイント）
- Rate Limit: 10 req/min/IP
- 詳細情報は含めない（セキュリティリスク）

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### C. 新規テーブル追加（2件）

#### Table-1: EmergencyDeactivation（緊急停止記録）

**優先度**: 🔴 **CRITICAL**

**理由**:
- EmergencyAccountService.ts 78-85, 116-136行目で定義されているが、DB保存未実装
- 現在はLocalStorageで仮実装（ブラウザ依存、サーバー側で確認不可）
- 監査要件を満たすために永続化が必須
- 医療システムとの同期状態追跡に必要

**スキーマ定義**:
```prisma
model EmergencyDeactivation {
  id                  String    @id @default(cuid())
  targetUserId        String    @map("target_user_id")
  targetEmployeeId    String?   @map("target_employee_id") // User.employeeId（キャッシュ）
  executedBy          String    @map("executed_by")        // User.id
  executorEmployeeId  String?   @map("executor_employee_id") // User.employeeId（キャッシュ）
  executorName        String?   @map("executor_name")      // User.name（キャッシュ）
  executorLevel       Float     @map("executor_level")     // 権限レベル（14-17）
  reason              String    @db.Text                   // 停止理由（必須）
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

**マイグレーション**:
```bash
# VoiceDrive側で実行
npx prisma migrate dev --name add_emergency_deactivation
```

**使用例**:
```typescript
// EmergencyAccountService.ts 116-136行目を修正
private async saveDeactivationRecord(deactivation: EmergencyDeactivation): Promise<void> {
  await prisma.emergencyDeactivation.create({
    data: {
      targetUserId: deactivation.targetUserId,
      targetEmployeeId: user.employeeId,  // User.employeeIdから取得
      executedBy: deactivation.executedBy,
      executorEmployeeId: executorUser.employeeId,
      executorName: executorUser.name,
      executorLevel: executorUser.permissionLevel,
      reason: deactivation.reason,
      timestamp: deactivation.timestamp,
      isEmergency: deactivation.isEmergency,
      syncToStaffSystem: deactivation.syncToStaffSystem
    }
  });
}
```

---

#### Table-2: StaffSystemSyncQueue（医療システム同期キュー）

**優先度**: 🔴 **CRITICAL**

**理由**:
- EmergencyAccountService.ts 183-201行目でLocalStorageを使用中
- 職員カルテシステム復旧後の自動同期に必須
- リトライ機能とエラーハンドリングが必要
- データ不整合を防ぐため

**スキーマ定義**:
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

**マイグレーション**:
```bash
npx prisma migrate dev --name add_staff_system_sync_queue
```

**使用例**:
```typescript
// EmergencyAccountService.ts 183-201行目を修正
private async notifyStaffSystemWhenAvailable(targetUserId: string): Promise<void> {
  await prisma.staffSystemSyncQueue.create({
    data: {
      type: 'ACCOUNT_DEACTIVATION',
      targetUserId,
      targetEmployeeId: user.employeeId,
      payload: {
        reason: reason,
        executedBy: executorUser.id,
        timestamp: new Date().toISOString()
      },
      relatedDeactivationId: deactivationId
    }
  });
}
```

---

### D. 既存テーブル修正（1件）

#### Modify-1: AuditLogテーブルの拡張

**対象テーブル**: `AuditLog`（既存: schema.prisma 235-247行目）

**現在のスキーマ**:
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

**推奨追加フィールド**:
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

**マイグレーション**:
```sql
-- VoiceDrive: prisma/migrations/xxx_extend_audit_log_for_emergency.sql
ALTER TABLE audit_logs ADD COLUMN executor_level DECIMAL(4,1) NULL;
ALTER TABLE audit_logs ADD COLUMN target_user_id VARCHAR(255) NULL;
ALTER TABLE audit_logs ADD COLUMN reason TEXT NULL;
ALTER TABLE audit_logs ADD COLUMN is_emergency_action BOOLEAN DEFAULT FALSE;
ALTER TABLE audit_logs ADD COLUMN sync_pending BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_audit_logs_action_emergency ON audit_logs(action, is_emergency_action);
CREATE INDEX idx_audit_logs_target_user ON audit_logs(target_user_id);
```

**使用例**:
```typescript
// EmergencyAccountService.ts 143-177行目を修正
private async logAuditAction(
  deactivation: EmergencyDeactivation,
  executorUser: User
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: executorUser.id,
      action: 'EMERGENCY_ACCOUNT_DEACTIVATION',
      entityType: 'User',
      entityId: deactivation.targetUserId,

      // 🆕 拡張フィールド使用
      executorLevel: executorUser.permissionLevel,
      targetUserId: deactivation.targetUserId,
      reason: deactivation.reason,
      isEmergencyAction: true,
      syncPending: !deactivation.syncToStaffSystem,

      newValues: {
        isRetired: true,
        deactivatedBy: executorUser.name,
        deactivationReason: deactivation.reason
      }
    }
  });
}
```

---

## 📋 医療システム側で追加が必要

### E. EmployeeAccountStatusHistoryテーブル（推奨）

**優先度**: 🟡 **RECOMMENDED**

**理由**:
- 医療システム側でもアカウント状態変更履歴を保持
- VoiceDriveからの緊急停止を識別可能
- 監査証跡の完全性を担保

**スキーマ定義**:
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

---

## ❓ 医療システムチームへの確認事項

### 確認-1: アカウント無効化の処理方針

**質問**:
> VoiceDriveから緊急アカウント停止通知を受けた場合、医療システム側では以下のどの処理を行いますか？
>
> **Option A**: `Employee.accountStatus`を`'inactive'`に更新のみ
> - `isRetired`は手動確認後に更新（緊急停止≠退職の可能性）
>
> **Option B**: `Employee.accountStatus`と`isRetired`を両方とも即時更新
> - 緊急停止 = 退職とみなす
>
> **Option C**: カスタム処理
> - 独自の業務ロジックに基づいて処理

**VoiceDrive側の推奨**: **Option A**
- 緊急停止は応急措置であり、必ずしも退職を意味しない
- 人事部門が後から正式な退職処理を実施できる

---

### 確認-2: Webhook送信頻度とリトライポリシー

**質問**:
> Webhook送信失敗時のリトライポリシーについて：
>
> 1. VoiceDrive → 医療システムのWebhook送信失敗時：
>    - VoiceDrive側でリトライする回数と間隔は？
>    - **推奨**: 3回リトライ（1分間隔）、その後は同期キューに蓄積
>
> 2. 医療システム → VoiceDriveの確認Webhook送信失敗時：
>    - 医療システム側でリトライする回数と間隔は？
>    - **推奨**: 3回リトライ（1分間隔）、失敗時はアラート通知
>
> 3. Webhook受信タイムアウト：
>    - 何秒でタイムアウトとみなすか？
>    - **推奨**: 30秒

**VoiceDrive側の実装方針**:
```typescript
const WEBHOOK_RETRY_CONFIG = {
  maxRetries: 3,
  retryInterval: 60000, // 1分
  timeout: 30000        // 30秒
};
```

---

### 確認-3: セキュリティとHMAC署名

**質問**:
> Webhook署名検証について：
>
> 1. HMAC-SHA256署名を使用することで問題ありませんか？
> 2. 共有シークレットキーの管理方法は？
>    - **提案**: 環境変数で管理（`.env`ファイル）
>    - VoiceDrive: `MEDICAL_SYSTEM_WEBHOOK_SECRET`
>    - 医療システム: `VOICEDRIVE_WEBHOOK_SECRET`
> 3. 署名検証失敗時の処理は？
>    - **提案**: 401 Unauthorized返却、ログ記録、アラート通知

**署名生成例**:
```typescript
// VoiceDrive側
import crypto from 'crypto';

function generateHMAC(payload: any): string {
  const secret = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}
```

**署名検証例**:
```typescript
// 医療システム側
function verifyHMAC(payload: any, signature: string): boolean {
  const secret = process.env.VOICEDRIVE_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 📅 想定スケジュール

### Phase 1: DB実装（2-3日）

**目標**: LocalStorageからDB保存への移行

- **Day 1**: テーブル追加
  - EmergencyDeactivationテーブル追加
  - StaffSystemSyncQueueテーブル追加
  - AuditLogテーブル拡張
  - マイグレーション実行

- **Day 2-3**: サービス実装修正
  - EmergencyAccountService.ts修正
  - 単体テスト作成
  - E2Eテスト（UI操作）

---

### Phase 2: Webhook連携（3-5日）

**目標**: 医療システムとの双方向連携

- **Day 4-5**: VoiceDrive側実装
  - MedicalSystemWebhookService.ts実装（送信）
  - /api/webhooks/account-deactivation-confirmed.ts実装（受信）
  - HMAC署名生成・検証実装
  - 統合テスト（モック使用）

- **Day 6-8**: 医療システム側実装（医療チーム作業）
  - Webhook受信エンドポイント実装
  - Employee更新ロジック
  - EmployeeAccountStatusHistory記録
  - 確認Webhook送信実装
  - 統合テスト（VoiceDrive連携）

---

### Phase 3: 自動同期機能（2-3日）

**目標**: 医療システム復旧後の自動同期

- **Day 9-10**: ヘルスチェック・同期処理実装
  - checkMedicalSystemHealth.ts実装
  - processSyncQueue.ts実装
  - cronジョブ設定

- **Day 11**: テスト・検証
  - リトライロジックテスト
  - 負荷テスト
  - エラーハンドリング確認

---

### Phase 4: 統合テスト・本番リリース（1週間）

- **Day 12-13**: 統合テスト
  - 障害シミュレーション
  - 復旧シミュレーション
  - 同期キュー処理確認

- **Day 14-15**: ドキュメント整備
  - API仕様書
  - 運用手順書
  - トラブルシューティングガイド

- **Day 16-18**: 段階的ロールアウト
  - テスト環境デプロイ
  - ステージング環境デプロイ
  - 本番環境デプロイ（段階的）

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  EmergencyAccountDeactivation.tsx          │             │
│  │  （レベル14-17のみアクセス可能）            │             │
│  └────────────────────────────────────────────┘             │
│         │ ①停止実行                                          │
│         ▼                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │  EmergencyAccountService.ts                │             │
│  └────────────────────────────────────────────┘             │
│         │                                                     │
│         ├─ ②Prisma保存                                      │
│         │  ├─ EmergencyDeactivation                        │
│         │  ├─ AuditLog                                     │
│         │  └─ StaffSystemSyncQueue                         │
│         │                                                     │
│         └─ ③Webhook送信                                     │
│            POST /api/webhooks/voicedrive-emergency-deactivation
└─────────────────────────────────────────────────────────────┘
               │ HTTPS + HMAC-SHA256
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  医療職員管理システム                         │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  Webhook受信: /api/webhooks/               │             │
│  │  voicedrive-emergency-deactivation         │             │
│  └────────────────────────────────────────────┘             │
│         │                                                     │
│         ├─ ④Employee更新                                    │
│         │  └─ accountStatus: 'inactive'                     │
│         │                                                     │
│         ├─ ⑤履歴記録                                        │
│         │  └─ EmployeeAccountStatusHistory                 │
│         │                                                     │
│         └─ ⑥確認Webhook送信                                │
│            POST /api/webhooks/account-deactivation-confirmed│
└─────────────────────────────────────────────────────────────┘
               │ HTTPS + HMAC-SHA256
               ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  Webhook受信: /api/webhooks/               │             │
│  │  account-deactivation-confirmed            │             │
│  └────────────────────────────────────────────┘             │
│         │                                                     │
│         ├─ ⑦EmergencyDeactivation更新                       │
│         │  └─ syncToStaffSystem: true                       │
│         │                                                     │
│         ├─ ⑧SyncQueue完了                                   │
│         │  └─ status: 'completed'                           │
│         │                                                     │
│         └─ ⑨User更新（キャッシュ）                          │
│            └─ isRetired: true                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### VoiceDrive側作業

#### Phase 1: DB実装
- [ ] **Table-1**: EmergencyDeactivationテーブル追加（schema.prisma）
- [ ] **Table-2**: StaffSystemSyncQueueテーブル追加（schema.prisma）
- [ ] **Modify-1**: AuditLogテーブル拡張（schema.prisma）
- [ ] マイグレーション実行
- [ ] EmergencyAccountService.ts修正
  - [ ] saveDeactivationRecord() → Prisma実装
  - [ ] logAuditAction() → Prisma実装
  - [ ] notifyStaffSystemWhenAvailable() → Prisma実装
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
- [ ] cronジョブ設定（5分ごと）
- [ ] リトライロジック実装
- [ ] 負荷テスト

---

### 医療システム側作業

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

---

### ドキュメント

- [ ] API仕様書（OpenAPI 3.0）
- [ ] Webhookペイロード仕様書
- [ ] エラーコード一覧
- [ ] 運用手順書
  - [ ] 緊急停止手順
  - [ ] 停止解除手順
  - [ ] 障害時の対応
- [ ] トラブルシューティングガイド

---

## 📝 補足資料

### 参照ドキュメント

1. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

2. **account-deactivation DB要件分析**
   `mcp-shared/docs/account-deactivation_DB要件分析_20251010.md`

3. **PersonalStation DB要件分析**
   `mcp-shared/docs/PersonalStation_DB要件分析_20251008.md`

4. **共通DB構築後統合作業再開計画書**
   `mcp-shared/docs/共通DB構築後統合作業再開計画書_20251008.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB) → SQLite（開発環境）
- Prisma ORM
- TypeScript + React
- Vite

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
| 2025-10-10 | 初版作成 | AI (Claude Code) |
