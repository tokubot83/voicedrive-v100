# admin/audit-logsページ DB要件分析

**文書番号**: DB-REQ-2025-1027-002
**作成日**: 2025年10月27日
**対象ページ**: https://voicedrive-v100.vercel.app/admin/audit-logs
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- PersonalStation_DB要件分析_20251008.md

---

## 📋 分析サマリー

### 結論
admin/audit-logsページは**現行のAuditLogテーブルで基本動作可能**ですが、以下の**不足項目**と**推奨追加項目**があります。

### 🔴 重大な不足項目（即対応必要）

1. **`severity`フィールド不足**
   - AuditLogPage.tsx 16行目: `selectedSeverity`
   - 現行schema.prisma AuditLogモデルに`severity`フィールドなし
   - 重要度フィルタリング機能が動作しない

2. **`targetId`フィールド名の不一致**
   - AuditLogPage.tsx 133行目: `log.targetId`
   - schema.prisma 389-408行目: `entityId`として存在
   - フィールド名の統一が必要

3. **チェックサム・完全性検証機能の不足**
   - AuditLogPanel.tsx 103-105行目: `verifyAuditIntegrity(logId)`
   - schema.prismaに`checksum`フィールドなし
   - ログ改ざん検知機能が未実装

---

## 🔍 詳細分析

### 1. 統計カード表示（AuditLogPage.tsx 148-154行目）

#### 表示内容
```typescript
const stats = {
  total: filteredLogs.length,
  critical: filteredLogs.filter(log => log.severity === 'critical').length,
  high: filteredLogs.filter(log => log.severity === 'high').length,
  users: new Set(filteredLogs.map(log => log.userId)).size
};
```

#### 必要なデータソース

| 表示項目 | 現行AuditLog | 必要なフィールド | データ管理責任 | 状態 |
|---------|-------------|----------------|--------------|------|
| 総ログ数 | ✅ 集計可能 | `id` (既存) | VoiceDrive | ✅ OK |
| 重大イベント数 | ❌ **不足** | `severity` | VoiceDrive | 🔴 **要追加** |
| 高重要度数 | ❌ **不足** | `severity` | VoiceDrive | 🔴 **要追加** |
| アクティブユーザー | ✅ 集計可能 | `userId` (既存) | VoiceDrive | ✅ OK |

---

### 2. フィルタリング機能（AuditLogPage.tsx 33-87行目）

#### 必要なデータソース

| フィルタ項目 | 現行AuditLog | 必要なフィールド | 状態 |
|------------|-------------|----------------|------|
| 重要度 | ❌ **不足** | `severity` | 🔴 **要追加** |
| アクション | ✅ 動作可能 | `action` (既存) | ✅ OK |
| 日付範囲 | ✅ 動作可能 | `createdAt` (既存) | ✅ OK |
| ユーザーID | ✅ 動作可能 | `userId` (既存) | ✅ OK |
| Level 99操作 | ⚠️ 一部可能 | `action`, `severity`, `executorLevel` | 🟡 **要強化** |

---

### 3. ログテーブル表示（AuditLogPage.tsx 280-357行目）

#### 必要なデータソース

| 表示項目 | 現行AuditLog | フィールド名 | 状態 |
|---------|-------------|-------------|------|
| タイムスタンプ | ✅ `createdAt` | `createdAt` | ✅ OK |
| ユーザーID | ✅ `userId` | `userId` | ✅ OK |
| アクション | ✅ `action` | `action` | ✅ OK |
| 対象 | ⚠️ **名前不一致** | `entityId` (schema) vs `targetId` (UI) | 🟡 **要統一** |
| 重要度 | ❌ **不足** | `severity` | 🔴 **要追加** |
| 詳細 | ✅ `oldValues`, `newValues` | `oldValues`, `newValues` | ✅ OK |

---

## 📋 必要な追加テーブル・フィールド一覧

### 1. AuditLogテーブルの拡張

#### 🔴 優先度: 高（即対応）

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

  // 🆕 追加フィールド
  severity          String?  @default("medium")  // low/medium/high/critical
  checksum          String?                     // SHA-256ハッシュ（改ざん検知）
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
  @@index([severity])       // 🆕 追加
  @@index([createdAt])      // 🆝 追加（日付検索用）
}
```

**重要度の自動判定ロジック**:
```typescript
function calculateSeverity(action: string, isEmergencyAction: boolean): string {
  if (isEmergencyAction) return 'critical';
  if (action.includes('SYSTEM_MODE') || action.includes('PERMISSION_LEVEL')) {
    return 'critical';
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

---

### 2. AuditAlertテーブル（新規）

#### 🟡 優先度: 中（推奨）

```prisma
model AuditAlert {
  id                   String    @id @default(cuid())
  type                 String    // suspicious_activity, policy_violation, etc.
  severity             String    // low, medium, high, critical
  description          String    @db.Text
  relatedLogs          Json      // 関連ログIDの配列
  detectedAt           DateTime  @default(now())
  investigationStatus  String    @default("pending")
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

**更新が必要**: Userモデルにリレーション追加
```prisma
model User {
  // ... 既存フィールド
  assignedAuditAlerts   AuditAlert[]  @relation("AlertAssignee")
  investigatedAlerts    AuditAlert[]  @relation("AlertInvestigator")
}
```

---

### 3. AuditReportSummary（日次集計）

#### 🟡 優先度: 中（パフォーマンス向上）

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
  actionTypeCounts   Json

  // トップアクター
  topActors          Json

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

---

## 🎯 実装優先順位

### Phase 1: 基本機能の完全化（2-3日）

1. 🔴 AuditLogテーブルに`severity`フィールド追加
2. 🔴 重要度自動判定ロジック実装
3. 🔴 既存ログの重要度バックフィル
4. 🔴 フィールド名の統一（entityId → targetId検討）

**動作する機能**:
- ✅ 統計カード（重要度別集計）
- ✅ 重要度フィルター
- ✅ Level 99操作フィルター
- ✅ CSVエクスポート

---

### Phase 2: セキュリティ機能強化（3-4日）

1. 🔴 AuditLogに`checksum`, `previousChecksum`追加
2. 🔴 チェックサム生成・検証機能実装
3. 🟡 AuditAlertテーブル追加
4. 🟡 不審なアクティビティ検知機能実装

**動作する機能**:
- ✅ ログ改ざん検知
- ✅ 完全性検証
- ✅ アラート生成・管理

---

### Phase 3: パフォーマンス最適化（2-3日）

1. 🟡 AuditReportSummaryテーブル追加
2. 🟡 日次集計バッチ実装
3. 🟡 ページネーション機能追加

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1
- [ ] AuditLogテーブルに`severity`フィールド追加
- [ ] マイグレーション実行
- [ ] 重要度自動判定ロジック実装
- [ ] 既存ログの重要度バックフィル
- [ ] フィールド名統一対応
- [ ] AuditLogPageのフィルタ機能確認
- [ ] CSVエクスポート機能確認

#### Phase 2
- [ ] チェックサム関連フィールド追加
- [ ] 完全性検証機能実装
- [ ] AuditAlertテーブル追加
- [ ] 不審なアクティビティ検知実装

#### Phase 3
- [ ] AuditReportSummaryテーブル追加
- [ ] 日次集計バッチ実装
- [ ] パフォーマンス最適化

### テスト
- [ ] 重要度フィルタリングの単体テスト
- [ ] チェックサム生成・検証テスト
- [ ] アラート生成テスト
- [ ] パフォーマンステスト

---

## 📝 追加メモ

### 医療システムとの連携方針

admin/audit-logsは**VoiceDrive内部の操作ログ**であり、医療システムとの直接的なデータ連携は不要です。

ただし、ユーザー情報（名前、部署等）は医療システムから取得したキャッシュを使用します。

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
