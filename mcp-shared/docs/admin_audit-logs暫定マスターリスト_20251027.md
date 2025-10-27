# admin/audit-logs 暫定マスターリスト

**作成日**: 2025年10月27日
**対象ページ**: admin/audit-logs (`src/pages/AuditLogPage.tsx`)
**目的**: 監査ログ機能の完全実装に向けたDB要件とセキュリティ強化策を明確化

---

## 📋 エグゼクティブサマリー

### 現状
- admin/audit-logsページは監査ログの表示、フィルタリング、CSVエクスポート機能を提供
- 現在は基本的なログ記録のみで、重要度分類・改ざん検知機能が未実装
- セキュリティアラート機能がメモリ管理のみ（DB未保存）

### 必要な対応
1. **VoiceDrive DB追加**: フィールド3件、テーブル2件
2. **医療システムからの連携**: 不要（VoiceDrive完結）
3. **セキュリティ機能実装**: チェックサム、不審アクティビティ検知

### 優先度
**Priority: HIGH（セキュリティ・コンプライアンス重要）**

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### A. 既存テーブル修正（1件）

#### Modify-1: AuditLogテーブルの拡張

**対象テーブル**: `AuditLog`

**追加フィールド**:
```prisma
model AuditLog {
  id                String   @id @default(cuid())
  userId            String
  action            String
  entityType        String
  entityId          String
  oldValues         Json?
  newValues         Json?
  ipAddress         String?
  userAgent         String?

  // 🆕 Phase 1: 重要度分類
  severity          String?  @default("medium")  // low/medium/high/critical

  // 🆕 Phase 2: 改ざん検知
  checksum          String?                     // SHA-256ハッシュ
  previousChecksum  String?  @map("previous_checksum")  // チェーン検証用

  createdAt         DateTime @default(now())
  executorLevel     Float?   @map("executor_level")
  targetUserId      String?  @map("target_user_id")
  reason            String?
  isEmergencyAction Boolean  @default(false) @map("is_emergency_action")
  syncPending       Boolean  @default(false) @map("sync_pending")

  user              User     @relation(fields: [userId], references: [id])

  @@index([action, isEmergencyAction])
  @@index([targetUserId])
  @@index([severity])       // 🆕 重要度検索用
  @@index([createdAt])      // 🆕 日付検索用
}
```

**理由**:
- `severity`: 統計カード、フィルタリング機能に必須（AuditLogPage.tsx 16, 148-154行目）
- `checksum`: ログ改ざん検知機能（AuditLogPanel.tsx 103-105行目）
- `previousChecksum`: ブロックチェーン方式の完全性検証

**マイグレーション**:
```sql
-- VoiceDrive: prisma/migrations/xxx_enhance_audit_log.sql
ALTER TABLE audit_logs ADD COLUMN severity VARCHAR(20) DEFAULT 'medium';
ALTER TABLE audit_logs ADD COLUMN checksum VARCHAR(64) NULL;
ALTER TABLE audit_logs ADD COLUMN previous_checksum VARCHAR(64) NULL;

CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**重要度自動判定ロジック**:
```typescript
// src/services/AuditService.ts
function calculateSeverity(action: string, isEmergencyAction: boolean, executorLevel: number): string {
  if (isEmergencyAction) return 'critical';

  // Level 99（permissionLevel >= 20）の操作は最低でもhigh
  if (executorLevel >= 20) {
    if (action.includes('SYSTEM_MODE') || action.includes('PERMISSION_LEVEL')) {
      return 'critical';
    }
    return 'high';
  }

  if (action.includes('EMERGENCY') || action.includes('OVERRIDE')) {
    return 'high';
  }
  if (action.includes('DELETE') || action.includes('SUSPEND')) {
    return 'medium';
  }
  return 'low';
}
```

**既存ログのバックフィル**:
```typescript
// scripts/backfill-audit-severity.ts
const logs = await prisma.auditLog.findMany();

for (const log of logs) {
  const severity = calculateSeverity(
    log.action,
    log.isEmergencyAction,
    log.executorLevel || 0
  );

  await prisma.auditLog.update({
    where: { id: log.id },
    data: { severity }
  });
}

console.log(`Updated ${logs.length} audit logs with severity`);
```

---

### B. 新規テーブル追加（2件）

#### Table-1: AuditAlert（監査アラート）

**優先度**: 🟡 **RECOMMENDED（セキュリティ強化）**

**理由**:
- AuditLogPanel.tsx 152-181行目でアラート機能を実装済み
- 現在はメモリ管理（Map）でページリロード時に消失
- 不審なアクティビティの追跡・調査に必須

**スキーマ定義**:
```prisma
model AuditAlert {
  id                   String    @id @default(cuid())
  type                 String    // suspicious_activity, policy_violation, access_anomaly, data_tampering
  severity             String    // low, medium, high, critical
  description          String    @db.Text
  relatedLogs          Json      // 関連ログIDの配列: ["log_id_1", "log_id_2"]
  detectedAt           DateTime  @default(now())
  investigationStatus  String    @default("pending")  // pending, investigating, resolved, escalated
  assignedTo           String?
  investigatedBy       String?
  investigatedAt       DateTime?
  resolution           String?   @db.Text
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  assignee             User?     @relation("AlertAssignee", fields: [assignedTo], references: [id])
  investigator         User?     @relation("AlertInvestigator", fields: [investigatedBy], references: [id])

  @@index([type])
  @@index([severity])
  @@index([investigationStatus])
  @@index([detectedAt])
  @@map("audit_alerts")
}
```

**Userモデルへのリレーション追加**:
```prisma
model User {
  // ... 既存フィールド
  assignedAuditAlerts   AuditAlert[]  @relation("AlertAssignee")
  investigatedAlerts    AuditAlert[]  @relation("AlertInvestigator")
}
```

**アラート自動生成ロジック**:
```typescript
// src/services/AuditMonitorService.ts

// 短時間での大量操作検知
async function detectRapidActions(userId: string): Promise<void> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const recentActions = await prisma.auditLog.count({
    where: {
      userId,
      createdAt: { gte: fiveMinutesAgo }
    }
  });

  if (recentActions >= 10) {
    await prisma.auditAlert.create({
      data: {
        type: 'suspicious_activity',
        severity: 'high',
        description: `Rapid actions detected: ${recentActions} actions in 5 minutes by ${userId}`,
        relatedLogs: await getRecentLogIds(userId, fiveMinutesAgo),
        assignedTo: await getSecurityTeamLeader()
      }
    });
  }
}

// 深夜アクセス検知
async function detectUnusualHoursAccess(log: AuditLog): Promise<void> {
  const hour = log.createdAt.getHours();

  if (hour >= 22 || hour <= 6) {
    await prisma.auditAlert.create({
      data: {
        type: 'access_anomaly',
        severity: 'medium',
        description: `Activity during unusual hours (${hour}:00) by ${log.userId}`,
        relatedLogs: [log.id]
      }
    });
  }
}

// 高権限操作の異常検知
async function detectHighValueChanges(log: AuditLog): Promise<void> {
  if (log.action.includes('SYSTEM_MODE') || log.action.includes('PERMISSION_LEVEL')) {
    await prisma.auditAlert.create({
      data: {
        type: 'policy_violation',
        severity: 'critical',
        description: `Critical system change: ${log.action} by ${log.userId}`,
        relatedLogs: [log.id],
        assignedTo: await getSystemAdministrator()
      }
    });
  }
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_audit_alerts
```

---

#### Table-2: AuditReportSummary（監査レポート日次集計）

**優先度**: 🟡 **RECOMMENDED（パフォーマンス最適化）**

**理由**:
- AuditLogPanel.tsx 184-214行目で30日間レポートを表示
- リアルタイム集計は大量ログ環境でパフォーマンス低下
- 日次集計でレスポンス時間を改善

**スキーマ定義**:
```prisma
model AuditReportSummary {
  id                 String    @id @default(cuid())
  reportDate         DateTime  @unique

  // 集計データ
  totalActions       Int       @default(0)
  totalUsers         Int       @default(0)
  criticalActions    Int       @default(0)
  highActions        Int       @default(0)
  mediumActions      Int       @default(0)
  lowActions         Int       @default(0)

  // アクションタイプ別
  actionTypeCounts   Json      // { "USER_LOGIN": 150, "POST_CREATE": 45, ... }

  // トップアクター（上位10名）
  topActors          Json      // [{ userId: "...", count: 45 }, ...]

  // アラート統計
  totalAlerts        Int       @default(0)
  pendingAlerts      Int       @default(0)
  resolvedAlerts     Int       @default(0)

  // 完全性チェック
  integrityIssues    Int       @default(0)

  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@index([reportDate])
  @@map("audit_report_summaries")
}
```

**日次集計バッチ**:
```typescript
// src/jobs/calculateAuditSummary.ts

export async function calculateDailyAuditSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 当日のログを集計
  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  // アクションタイプ別集計
  const actionTypeCounts: Record<string, number> = {};
  const actorCounts: Record<string, number> = {};
  let integrityIssues = 0;

  for (const log of logs) {
    actionTypeCounts[log.action] = (actionTypeCounts[log.action] || 0) + 1;
    actorCounts[log.userId] = (actorCounts[log.userId] || 0) + 1;

    // 完全性検証
    if (log.checksum) {
      const isValid = await verifyChecksum(log);
      if (!isValid) integrityIssues++;
    }
  }

  // トップアクター（上位10名）
  const topActors = Object.entries(actorCounts)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // アラート統計
  const alerts = await prisma.auditAlert.findMany({
    where: {
      detectedAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  const summary = {
    reportDate: today,
    totalActions: logs.length,
    totalUsers: new Set(logs.map(l => l.userId)).size,
    criticalActions: logs.filter(l => l.severity === 'critical').length,
    highActions: logs.filter(l => l.severity === 'high').length,
    mediumActions: logs.filter(l => l.severity === 'medium').length,
    lowActions: logs.filter(l => l.severity === 'low').length,
    actionTypeCounts,
    topActors,
    totalAlerts: alerts.length,
    pendingAlerts: alerts.filter(a => a.investigationStatus === 'pending').length,
    resolvedAlerts: alerts.filter(a => a.investigationStatus === 'resolved').length,
    integrityIssues
  };

  await prisma.auditReportSummary.upsert({
    where: { reportDate: today },
    create: summary,
    update: summary
  });

  console.log(`Audit summary calculated for ${today.toISOString().split('T')[0]}`);
}
```

**cron設定**:
```typescript
// src/jobs/scheduler.ts
import cron from 'node-cron';

// 毎日午前2時に実行
cron.schedule('0 2 * * *', async () => {
  console.log('Starting daily audit summary calculation...');
  await calculateDailyAuditSummary();
});
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_audit_report_summary
```

---

## 🎯 実装優先順位とPhase計画

### Phase 1: 基本機能の完全化（2-3日）

**目標**: admin/audit-logsページの全機能が動作する

**作業内容**:
1. 🔴 AuditLogテーブルに`severity`フィールド追加
2. 🔴 重要度自動判定ロジック実装
3. 🔴 既存ログの重要度バックフィル（スクリプト実行）
4. 🔴 フィールド名統一対応（entityId → targetId検討）
5. 🔴 AuditLogPageのフィルタ機能動作確認
6. 🔴 CSVエクスポート機能テスト

**完了後に動作する機能**:
- ✅ 統計カード（総ログ数、重大イベント数、高重要度数、アクティブユーザー）
- ✅ 重要度フィルター（低/中/高/重大）
- ✅ アクションタイプフィルター
- ✅ 日付範囲フィルター
- ✅ Level 99操作フィルター
- ✅ CSVエクスポート

---

### Phase 2: セキュリティ機能強化（3-4日）

**目標**: ログ改ざん検知とアラート機能の実装

**作業内容**:
1. 🔴 AuditLogに`checksum`, `previousChecksum`追加
2. 🔴 チェックサム生成機能実装（SHA-256）
3. 🔴 完全性検証機能実装
4. 🟡 AuditAlertテーブル追加
5. 🟡 Userモデルにリレーション追加
6. 🟡 不審なアクティビティ検知機能実装
   - 短時間での大量操作検知
   - 深夜アクセス検知
   - 高権限操作の異常検知
7. 🟡 AuditServiceのメモリ管理をDB連携に変更

**完了後に動作する機能**:
- ✅ ログ改ざん検知（チェックサムベース）
- ✅ ブロックチェーン方式の完全性検証
- ✅ 自動アラート生成
- ✅ アラート管理画面（AuditLogPanel）
- ✅ セキュリティチームへの通知

**チェックサム生成実装例**:
```typescript
// src/services/AuditService.ts

async function generateChecksum(entry: AuditLog): Promise<string> {
  const content = JSON.stringify({
    id: entry.id,
    timestamp: entry.createdAt,
    userId: entry.userId,
    action: entry.action,
    entityId: entry.entityId,
    oldValues: entry.oldValues,
    newValues: entry.newValues,
    previousChecksum: entry.previousChecksum || null
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function logAuditEntryWithChecksum(data: AuditLogData): Promise<string> {
  // 前回のログのチェックサムを取得
  const previousLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { checksum: true }
  });

  // 仮エントリ作成（checksum計算用）
  const tempEntry = {
    ...data,
    previousChecksum: previousLog?.checksum || null
  };

  // チェックサム生成
  const checksum = await generateChecksum(tempEntry);

  // DB保存
  const entry = await prisma.auditLog.create({
    data: {
      ...data,
      checksum,
      previousChecksum: previousLog?.checksum || null
    }
  });

  return entry.id;
}
```

---

### Phase 3: パフォーマンス最適化（2-3日）

**目標**: 大量ログでも高速動作

**作業内容**:
1. 🟡 AuditReportSummaryテーブル追加
2. 🟡 日次集計バッチ実装
3. 🟡 cron設定（毎日午前2時実行）
4. 🟡 AuditLogPanelを最適化（集計テーブル利用）
5. 🟡 ページネーション機能追加（カーソルベース）
6. 🟡 パフォーマンステスト（100万ログ）

**完了後の改善**:
- ✅ 30日間レポートが高速表示（リアルタイム集計 → 事前集計）
- ✅ 大量ログでもスムーズなスクロール
- ✅ フィルタリング結果の高速表示

---

## ✅ チェックリスト

### VoiceDrive側作業

#### Phase 1
- [ ] AuditLogテーブルに`severity`フィールド追加
- [ ] マイグレーション実行
- [ ] 重要度自動判定ロジック実装（`calculateSeverity`）
- [ ] 既存ログのバックフィルスクリプト作成・実行
- [ ] フィールド名統一対応（entityId → targetId検討）
- [ ] AuditLogPageのフィルタ機能確認
- [ ] 統計カードの動作確認
- [ ] CSVエクスポート機能確認
- [ ] E2Eテスト（フィルタリング）

#### Phase 2
- [ ] AuditLogに`checksum`, `previousChecksum`追加
- [ ] マイグレーション実行
- [ ] チェックサム生成機能実装（`generateChecksum`）
- [ ] 完全性検証機能実装（`verifyAuditIntegrity`）
- [ ] AuditAlertテーブル追加
- [ ] Userモデルにリレーション追加
- [ ] マイグレーション実行
- [ ] 不審なアクティビティ検知実装
  - [ ] 短時間大量操作検知
  - [ ] 深夜アクセス検知
  - [ ] 高権限操作異常検知
- [ ] AuditServiceのMap管理をDB連携に変更
- [ ] AuditLogPanelのアラート機能確認
- [ ] セキュリティテスト（改ざん検知）

#### Phase 3
- [ ] AuditReportSummaryテーブル追加
- [ ] マイグレーション実行
- [ ] 日次集計バッチ実装（`calculateDailyAuditSummary`）
- [ ] cron設定（毎日午前2時）
- [ ] AuditLogPanelを最適化（集計テーブル利用）
- [ ] ページネーション機能追加
- [ ] パフォーマンステスト（100万ログ）
- [ ] 負荷テスト
- [ ] 本番環境デプロイ

### テスト
- [ ] 重要度フィルタリングの単体テスト
- [ ] チェックサム生成・検証の単体テスト
- [ ] アラート生成の統合テスト
- [ ] 日次集計バッチの精度テスト
- [ ] パフォーマンステスト
- [ ] E2Eテスト（admin/audit-logs全機能）
- [ ] セキュリティテスト（改ざん検知）

---

## 🔐 セキュリティ考慮事項

### Level 99操作の特別扱い

admin/audit-logsページには「Level 99」フィルタボタンがあり、システム管理者の重要操作を追跡します:
- `SYSTEM_MODE`変更
- `PERMISSION_LEVEL`変更
- `EMERGENCY`操作
- `OVERRIDE`操作
- `severity`が`high`または`critical`

**推奨実装**:
```typescript
// Level 99（permissionLevel >= 20）の操作は自動的にhigh以上
if (executorLevel >= 20) {
  severity = severity === 'critical' ? 'critical' : 'high';
}
```

---

### ログ改ざん防止策

1. **チェックサム方式**: SHA-256ハッシュで各ログの完全性を検証
2. **ブロックチェーン方式**: 前回ログのチェックサムを含めることで、改ざんが連鎖的に検出可能
3. **定期検証**: 日次バッチでログの完全性を自動チェック

```typescript
// 改ざん検出例
async function detectTampering(): Promise<void> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'asc' }
  });

  let previousChecksum: string | null = null;

  for (const log of logs) {
    if (log.checksum) {
      // チェックサム検証
      const expectedChecksum = await generateChecksum(log);
      if (expectedChecksum !== log.checksum) {
        await createAlert('data_tampering', 'critical', `Log ${log.id} checksum mismatch`);
      }

      // チェーン検証
      if (log.previousChecksum !== previousChecksum) {
        await createAlert('data_tampering', 'critical', `Log ${log.id} chain broken`);
      }

      previousChecksum = log.checksum;
    }
  }
}
```

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌────────────────────────────────────────┐                 │
│  │  ユーザー操作（投稿、投票、設定変更等） │                 │
│  └────────────────────────────────────────┘                 │
│                    │                                          │
│                    │ ①操作実行                               │
│                    ▼                                          │
│  ┌─────────────────────────────────────────┐                │
│  │  AuditService.logAuditEntry()            │                │
│  │  - 重要度自動判定                         │                │
│  │  - チェックサム生成                       │                │
│  │  - 不審アクティビティ検知                 │                │
│  └─────────────────────────────────────────┘                │
│         │                      │                              │
│         │ ②DB保存              │ ③アラート検知              │
│         ▼                      ▼                              │
│  ┌─────────────┐      ┌─────────────┐                      │
│  │  AuditLog   │      │ AuditAlert  │                      │
│  │  + severity │      │ (新規)      │                      │
│  │  + checksum │      └─────────────┘                      │
│  └─────────────┘                                             │
│         │                                                     │
│         │ ④日次集計（午前2時）                              │
│         ▼                                                     │
│  ┌──────────────────────┐                                   │
│  │ AuditReportSummary   │                                   │
│  │ (日次集計)           │                                   │
│  └──────────────────────┘                                   │
│         │                                                     │
│         │ ⑤表示                                              │
│         ▼                                                     │
│  ┌──────────────────────┐                                   │
│  │ admin/audit-logs     │                                   │
│  │ - 統計カード         │                                   │
│  │ - フィルタリング     │                                   │
│  │ - ログテーブル       │                                   │
│  │ - CSVエクスポート    │                                   │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 補足資料

### 参照ドキュメント

1. **admin/audit-logs DB要件分析**
   `mcp-shared/docs/admin_audit-logs_DB要件分析_20251027.md`

2. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

3. **AuditLogPage.tsx**
   `src/pages/AuditLogPage.tsx`

4. **AuditLogPanel.tsx**
   `src/components/authority/AuditLogPanel.tsx`

5. **AuditService.ts**
   `src/services/AuditService.ts`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Web Crypto API（SHA-256ハッシュ）

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-27 | 初版作成 | AI (Claude Code) |

---

**作成者**: AI (Claude Code)
**次のステップ**: Phase 1実装開始 → schema.prisma更新 → マイグレーション実行
