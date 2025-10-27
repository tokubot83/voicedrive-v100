# admin/audit-logs 最終実装計画書

**文書番号**: VD-PLAN-2025-1027-010
**作成日**: 2025年10月27日
**作成者**: VoiceDriveチーム（ClaudeCode）
**件名**: admin/audit-logs実装計画（医療システム返信反映版）
**参照書類**:
- admin/audit-logs VoiceDrive確認回答書への返信（MED-RESP-2025-1027-009）
- admin/audit-logs VoiceDrive側確認回答書（VD-RESP-2025-1027-009）

---

## 📋 エグゼクティブサマリー

医療システムチームからの詳細な返信を受領し、admin/audit-logsの最終実装計画を策定します。

### 主要な決定事項

| 項目 | 決定内容 | 根拠 |
|------|---------|------|
| **保存期間** | **3年**（アーカイブ: 1年後） | VoiceDriveは法令要件準拠、医療システムとは異なる |
| **アーカイブ方式** | 1年経過後に別テーブル移動 | パフォーマンス最適化 |
| **削除ポリシー** | 3年経過後に自動削除 | 法令要件準拠 |
| **インシデント通知** | **Slack + メール**（critical, highのみ） | 医療システムと連携強化 |

### 実装スケジュール

| Phase | 期間 | 状態 | 内容 |
|-------|------|------|------|
| **Phase 1** | 10/27（完了） | ✅ 100% | 基本機能（severity追加） |
| **Phase 2** | 10/28-11/1（4日） | 🔴 0% | セキュリティ機能強化 |
| **Phase 3** | 11/4-11/7（4日） | 🔴 0% | パフォーマンス最適化 + 通知実装 |
| **Phase 4** | 11/8-11/10（3日） | 🔴 0% | テスト・調整 |

**合計工数**: 11日（約2週間）

---

## ✅ 医療システム返信の確認

### 確認-1: ユーザー情報参照

**医療システム回答**: ✅ **問題なし**（キャッシュデータ利用で十分）

**VoiceDrive側の対応**:
- ✅ **合意**・継続実装
- Userテーブルキャッシュを積極的に活用
- Webhook同期（employee.updated）を継続

**実装不要**: この項目は既存実装で対応済み

---

### 確認-2: Level 99操作定義

**医療システム回答**: ✅ **問題なし**（VoiceDrive独自基準で十分）

**VoiceDrive側の対応**:
- ✅ **合意**・継続実装
- Level 99定義を継続
  - permissionLevel >= 20の操作は最低でもhigh
  - SYSTEM_MODE, PERMISSION_LEVEL: critical
  - EMERGENCY, OVERRIDE: high

**実装不要**: この項目は既存実装で対応済み（AuditService.calculateSeverity）

---

### 確認-3: 監査ログ保存期間

**医療システム回答**: ✅ **永続保存**（医療システム）、**3年推奨**（VoiceDrive）

**VoiceDrive側の決定**:

| 項目 | VoiceDrive | 医療システム | 理由 |
|------|-----------|------------|------|
| **保存期間** | **3年** | 永続保存 | VoiceDriveは法令要件準拠 |
| **アーカイブ時期** | **1年後** | 3年後 | パフォーマンス最適化 |
| **削除時期** | **3年後** | 削除しない | 法令要件準拠 |

**実装必要**: Phase 3で実装

---

### 確認-4: セキュリティインシデント連携

**医療システム回答**: ✅ **推奨実施**（critical, highのみ、Slack + メール）

**VoiceDrive側の決定**:
- ✅ **実施**
- 通知対象: critical, highのみ
- 通知方法: Slack（優先）+ メール（バックアップ）
- criticalの場合は二重通知（Slack + メール）

**実装必要**: Phase 3で実装

---

## 🎯 Phase 2: セキュリティ機能強化（10/28-11/1）

### 目標
ログ改ざん検知とアラート機能の実装

### 実装タスク

#### 1. チェックサム生成機能（1日）

**実装ファイル**: `src/services/AuditService.ts`

**実装内容**:
```typescript
// 既存のgenerateChecksumメソッドを強化
private async generateChecksum(entry: Partial<AuditLog>): Promise<string> {
  // 前回のログのチェックサムを取得
  const previousLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { checksum: true }
  });

  const content = JSON.stringify({
    id: entry.id,
    timestamp: entry.createdAt,
    userId: entry.userId,
    action: entry.action,
    entityId: entry.entityId,
    oldValues: entry.oldValues,
    newValues: entry.newValues,
    previousChecksum: previousLog?.checksum || null
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// logActionメソッドを修正してDB保存時にチェックサム生成
async logAction(actionData: {
  userId: string;
  action: string;
  targetId: string;
  details: any;
  executorLevel?: number;
}): Promise<string> {
  const severity = AuditService.calculateSeverityFromAction(
    actionData.action,
    false,
    actionData.executorLevel
  );

  // 前回のチェックサム取得
  const previousLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { checksum: true }
  });

  // 仮エントリ作成
  const tempEntry = {
    id: cuid(),
    userId: actionData.userId,
    action: actionData.action,
    entityType: 'user_action',
    entityId: actionData.targetId,
    oldValues: null,
    newValues: actionData.details,
    createdAt: new Date(),
    previousChecksum: previousLog?.checksum || null
  };

  // チェックサム生成
  const checksum = await this.generateChecksum(tempEntry);

  // DB保存
  const entry = await prisma.auditLog.create({
    data: {
      ...tempEntry,
      checksum,
      severity,
      isEmergencyAction: actionData.action.includes('EMERGENCY')
    }
  });

  return entry.id;
}
```

**工数**: 1日

---

#### 2. 完全性検証機能（0.5日）

**実装ファイル**: `src/services/AuditService.ts`

**実装内容**:
```typescript
// 既存のverifyAuditIntegrityメソッドを強化
async verifyAuditIntegrity(logId: string): Promise<boolean> {
  const entry = await prisma.auditLog.findUnique({
    where: { id: logId }
  });

  if (!entry || !entry.checksum) {
    return false;
  }

  const expectedChecksum = await this.generateChecksum(entry);
  return entry.checksum === expectedChecksum;
}

// 全ログの完全性検証
async verifyAllAuditIntegrity(): Promise<{
  total: number;
  valid: number;
  invalid: number;
  invalidIds: string[];
}> {
  const logs = await prisma.auditLog.findMany({
    where: { checksum: { not: null } },
    orderBy: { createdAt: 'asc' }
  });

  const invalidIds: string[] = [];

  for (const log of logs) {
    const isValid = await this.verifyAuditIntegrity(log.id);
    if (!isValid) {
      invalidIds.push(log.id);
    }
  }

  return {
    total: logs.length,
    valid: logs.length - invalidIds.length,
    invalid: invalidIds.length,
    invalidIds
  };
}
```

**工数**: 0.5日

---

#### 3. 不審なアクティビティ検知（1.5日）

**実装ファイル**: `src/services/AuditMonitorService.ts`（新規）

**実装内容**:
```typescript
// src/services/AuditMonitorService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditMonitorService {
  // 短時間での大量操作検知
  async detectRapidActions(userId: string): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentActions = await prisma.auditLog.count({
      where: {
        userId,
        createdAt: { gte: fiveMinutesAgo }
      }
    });

    if (recentActions >= 10) {
      await this.createAlert({
        type: 'suspicious_activity',
        severity: 'high',
        description: `短時間での大量操作を検知: ${recentActions}件/5分 by ${userId}`,
        relatedLogs: await this.getRecentLogIds(userId, fiveMinutesAgo)
      });
    }
  }

  // 深夜アクセス検知
  async detectUnusualHoursAccess(userId: string, timestamp: Date): Promise<void> {
    const hour = timestamp.getHours();

    if (hour >= 22 || hour <= 6) {
      await this.createAlert({
        type: 'access_anomaly',
        severity: 'medium',
        description: `深夜のアクセスを検知: ${hour}時台 by ${userId}`,
        relatedLogs: await this.getRecentLogIds(userId, timestamp)
      });
    }
  }

  // 高権限操作の異常検知
  async detectHighPrivilegeAnomalies(
    userId: string,
    action: string,
    executorLevel: number
  ): Promise<void> {
    if (executorLevel >= 20) {
      if (action.includes('SYSTEM_MODE') || action.includes('PERMISSION_LEVEL')) {
        await this.createAlert({
          type: 'policy_violation',
          severity: 'critical',
          description: `Level 99重要操作を検知: ${action} by ${userId}`,
          relatedLogs: await this.getUserRecentLogs(userId, 10)
        });
      }
    }
  }

  // アラート作成
  private async createAlert(data: {
    type: string;
    severity: string;
    description: string;
    relatedLogs: string[];
  }): Promise<void> {
    await prisma.auditAlert.create({
      data: {
        type: data.type,
        severity: data.severity,
        description: data.description,
        relatedLogs: data.relatedLogs,
        investigationStatus: 'pending'
      }
    });
  }

  // ヘルパーメソッド
  private async getRecentLogIds(userId: string, since: Date): Promise<string[]> {
    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: since }
      },
      select: { id: true },
      take: 20
    });

    return logs.map(log => log.id);
  }

  private async getUserRecentLogs(userId: string, limit: number): Promise<string[]> {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
      take: limit
    });

    return logs.map(log => log.id);
  }
}
```

**工数**: 1.5日

---

#### 4. AuditServiceのメモリ管理をDB連携に変更（0.5日）

**実装ファイル**: `src/services/AuditService.ts`

**実装内容**:
- Map管理（this.auditLogs, this.auditAlerts）をPrisma経由のDB管理に変更
- getRecentLogs, getAuditAlerts等をPrisma queryに変更

**工数**: 0.5日

---

### Phase 2合計工数: 3.5日 → **4日**（バッファ含む）

---

## 🎯 Phase 3: パフォーマンス最適化 + 通知実装（11/4-11/7）

### 目標
- アーカイブ機能実装
- セキュリティアラート通知実装
- 日次集計レポート実装

### 実装タスク

#### 1. AuditLogArchiveテーブル追加（0.5日）

**実装ファイル**: `prisma/schema.prisma`

**実装内容**:
```prisma
model AuditLogArchive {
  id                String   @id
  userId            String
  action            String
  entityType        String
  entityId          String
  oldValues         Json?
  newValues         Json?
  ipAddress         String?
  userAgent         String?
  severity          String?
  checksum          String?
  previousChecksum  String?  @map("previous_checksum")
  executorLevel     Float?   @map("executor_level")
  targetUserId      String?  @map("target_user_id")
  reason            String?
  isEmergencyAction Boolean  @map("is_emergency_action")

  createdAt         DateTime // 元のログ作成日時
  archivedAt        DateTime @default(now())

  @@index([createdAt])
  @@index([userId])
  @@index([archivedAt])
  @@map("audit_logs_archive")
}
```

**マイグレーション**:
```bash
npx prisma db push
```

**工数**: 0.5日

---

#### 2. アーカイブ・削除バッチ実装（1日）

**実装ファイル**: `src/jobs/archiveAuditLogs.ts`（新規）

**実装内容**:
```typescript
// src/jobs/archiveAuditLogs.ts

import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

// 1年経過後にアーカイブ
export async function archiveOldAuditLogs() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  console.log(`🗄️  アーカイブ対象: ${oneYearAgo.toISOString()} 以前のログ`);

  // 1年以上前のログを取得
  const oldLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: { lt: oneYearAgo }
    }
  });

  console.log(`  📝 ${oldLogs.length}件のログをアーカイブします...`);

  if (oldLogs.length === 0) {
    console.log('  ✨ アーカイブ対象のログはありません');
    return;
  }

  // アーカイブテーブルに移動
  await prisma.auditLogArchive.createMany({
    data: oldLogs.map(log => ({
      ...log,
      archivedAt: new Date()
    }))
  });

  // 元のテーブルから削除
  await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: oneYearAgo }
    }
  });

  console.log(`  ✅ ${oldLogs.length}件のログをアーカイブしました`);
}

// 3年経過後に削除
export async function deleteOldArchivedLogs() {
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  console.log(`🗑️  削除対象: ${threeYearsAgo.toISOString()} 以前のアーカイブログ`);

  const result = await prisma.auditLogArchive.deleteMany({
    where: {
      createdAt: { lt: threeYearsAgo }
    }
  });

  console.log(`  ✅ ${result.count}件のアーカイブログを削除しました`);
}

// cron設定（毎月1日午前2時: アーカイブ）
cron.schedule('0 2 1 * *', async () => {
  console.log('\n📅 月次アーカイブバッチ開始...');
  await archiveOldAuditLogs();
});

// cron設定（毎月1日午前3時: 削除）
cron.schedule('0 3 1 * *', async () => {
  console.log('\n📅 月次削除バッチ開始...');
  await deleteOldArchivedLogs();
});
```

**工数**: 1日

---

#### 3. セキュリティアラート通知実装（1.5日）

**実装ファイル**:
- `src/services/SecurityNotificationService.ts`（新規）
- `src/services/SlackNotificationService.ts`（新規）
- `src/services/EmailNotificationService.ts`（新規）

**実装内容**:

**A. Slack通知**:
```typescript
// src/services/SlackNotificationService.ts

export async function sendSlackAlert(alert: AuditAlert) {
  const webhookUrl = process.env.MEDICAL_SYSTEM_SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('⚠️  Slack Webhook URLが設定されていません');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: alert.userId },
    select: { name: true, department: true, facilityId: true }
  });

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: process.env.SLACK_ALERT_CHANNEL || '#security-alerts',
      username: "VoiceDrive Security Bot",
      icon_emoji: ":rotating_light:",
      attachments: [
        {
          color: alert.severity === 'critical' ? 'danger' : 'warning',
          title: `🚨 ${alert.type}`,
          fields: [
            { title: '発生時刻', value: alert.detectedAt.toLocaleString('ja-JP'), short: true },
            { title: '重要度', value: alert.severity.toUpperCase(), short: true },
            { title: 'ユーザー', value: user?.name || '不明', short: true },
            { title: '施設', value: user?.facilityId || '不明', short: true },
            { title: '詳細', value: alert.description, short: false }
          ],
          footer: 'VoiceDrive 監査ログシステム',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    })
  });

  console.log(`✅ Slack通知送信: ${alert.type} (${alert.severity})`);
}
```

**B. メール通知**:
```typescript
// src/services/EmailNotificationService.ts

import nodemailer from 'nodemailer';

export async function sendEmailAlert(alert: AuditAlert) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: alert.userId },
    select: { name: true, department: true, facilityId: true }
  });

  await transporter.sendMail({
    to: process.env.SECURITY_EMAIL,
    from: 'VoiceDrive Security <noreply@voicedrive.example.com>',
    subject: `🚨 [VoiceDrive] セキュリティアラート (${alert.severity})`,
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>🚨 VoiceDrive セキュリティアラート</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><th>アラートタイプ</th><td>${alert.type}</td></tr>
          <tr><th>重要度</th><td><strong>${alert.severity.toUpperCase()}</strong></td></tr>
          <tr><th>発生時刻</th><td>${alert.detectedAt.toLocaleString('ja-JP')}</td></tr>
          <tr><th>ユーザー</th><td>${user?.name || '不明'}</td></tr>
          <tr><th>施設</th><td>${user?.facilityId || '不明'}</td></tr>
          <tr><th>詳細</th><td>${alert.description}</td></tr>
        </table>
        <hr>
        <p>このメールはVoiceDrive監査ログシステムから自動送信されています。</p>
      </body>
      </html>
    `
  });

  console.log(`✅ メール通知送信: ${alert.type} (${alert.severity})`);
}
```

**C. 統合通知サービス**:
```typescript
// src/services/SecurityNotificationService.ts

export async function notifySecurityIncident(alert: AuditAlert) {
  // critical, highのみ通知
  if (alert.severity !== 'critical' && alert.severity !== 'high') {
    return;
  }

  // Slack通知（優先）
  try {
    await sendSlackAlert(alert);
  } catch (error) {
    console.error(`❌ Slack通知失敗: ${error}`);
    // Slack失敗時はメールで通知
    await sendEmailAlert(alert);
  }

  // criticalの場合はメールも送信（二重通知）
  if (alert.severity === 'critical') {
    try {
      await sendEmailAlert(alert);
    } catch (error) {
      console.error(`❌ メール通知失敗: ${error}`);
    }
  }
}
```

**工数**: 1.5日

---

#### 4. 日次集計レポート実装（1日）

**実装ファイル**: `src/jobs/calculateAuditSummary.ts`（新規）

**実装内容**: 医療システム返信の実装例を参考に実装

**工数**: 1日

---

### Phase 3合計工数: 4日

---

## 🎯 Phase 4: テスト・調整（11/8-11/10）

### テストタスク

#### 1. チェックサム機能テスト（0.5日）

**テスト内容**:
- チェックサム生成の正確性確認
- ログ改ざん検知の動作確認
- 完全性検証の精度確認

**テストスクリプト**:
```bash
npx tsx scripts/test-checksum-integrity.ts
```

---

#### 2. アラート検知テスト（0.5日）

**テスト内容**:
- 短時間大量操作検知
- 深夜アクセス検知
- Level 99操作検知

**テストスクリプト**:
```bash
npx tsx scripts/test-alert-detection.ts
```

---

#### 3. 通知機能テスト（1日）

**テスト内容**:
- Slack通知の送信確認
- メール通知の送信確認
- 二重通知の確認（critical）

**テスト手順**:
1. 医療システムチームからWebhook URL受領
2. 環境変数設定
3. テスト通知送信
4. 医療システムチームで受信確認

---

#### 4. アーカイブ・削除テスト（0.5日）

**テスト内容**:
- 1年経過ログのアーカイブ確認
- 3年経過ログの削除確認
- データ整合性確認

**テストスクリプト**:
```bash
npx tsx scripts/test-archive-process.ts
```

---

#### 5. パフォーマンステスト（0.5日）

**テスト内容**:
- 100万ログ想定のデータ生成
- フィルタリング速度確認
- ページネーション動作確認

---

### Phase 4合計工数: 3日

---

## 📅 実装スケジュール（最終版）

| Phase | 期間 | 工数 | 主要タスク |
|-------|------|------|----------|
| **Phase 1** | 10/27 | 1日 | ✅ severity追加、スキーマ更新 |
| **Phase 2** | 10/28-10/31 | 4日 | チェックサム、アラート検知 |
| **Phase 3** | 11/1-11/4 | 4日 | アーカイブ、通知、日次集計 |
| **Phase 4** | 11/5-11/7 | 3日 | テスト、調整 |
| **監視期間** | 11/8-11/14 | 7日 | 本番運用・誤検知調整 |

**合計工数**: 12日（実装） + 7日（監視）= **約3週間**

---

## ✅ 医療システムチームへの依頼事項

### 依頼-1: Slack Webhook URL発行

**期日**: 2025年10月28日（明日）

**内容**:
1. Slack Incoming Webhook URLの発行
2. チャンネル名: `#security-alerts`（推奨）
3. URLをVoiceDriveチームへ共有

**共有方法**:
```bash
# mcp-shared/logs/ 経由
echo "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/..." > mcp-shared/logs/slack-webhook-url.txt
```

---

### 依頼-2: セキュリティメールアドレス設定

**期日**: 2025年10月28日（明日）

**内容**:
1. メーリングリスト作成: `security-team@medical-system.example.com`
2. セキュリティチームメンバーを登録
3. メールアドレスをVoiceDriveチームへ共有

---

### 依頼-3: セキュリティインシデント対応フロー策定

**期日**: 2025年11月1日

**内容**:
1. 通知受信後の対応手順書作成
2. エスカレーション基準の策定
3. 対応責任者の明確化

---

## 📝 環境変数設定（VoiceDrive側）

### 必要な環境変数

```env
# .env ファイルに追加

# Slack通知設定
MEDICAL_SYSTEM_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... # 医療システムから受領
SLACK_ALERT_CHANNEL=#security-alerts

# メール通知設定
SECURITY_EMAIL=security-team@medical-system.example.com # 医療システムから受領

# SMTP設定（Gmail推奨）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=voicedrive-alerts@example.com
SMTP_PASS=your-app-password # Gmailアプリパスワード

# アーカイブ設定
ARCHIVE_AFTER_YEARS=1  # 1年後にアーカイブ
DELETE_AFTER_YEARS=3   # 3年後に削除
```

---

## 🔗 まとめ

### 実装完了後の機能

| 機能 | Phase | 状態 |
|------|-------|------|
| 重要度分類 | Phase 1 | ✅ 完了 |
| チェックサム生成 | Phase 2 | 🔴 未実装 |
| 完全性検証 | Phase 2 | 🔴 未実装 |
| アラート検知 | Phase 2 | 🔴 未実装 |
| アーカイブ | Phase 3 | 🔴 未実装 |
| 通知（Slack/メール） | Phase 3 | 🔴 未実装 |
| 日次集計 | Phase 3 | 🔴 未実装 |

### 最終成果物

- ✅ 完全な監査ログシステム
- ✅ ログ改ざん検知機能
- ✅ セキュリティアラート機能
- ✅ 医療システムとの通知連携
- ✅ 3年間の監査証跡保存
- ✅ パフォーマンス最適化

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
次回レビュー: Phase 2開始時（2025年10月28日）
