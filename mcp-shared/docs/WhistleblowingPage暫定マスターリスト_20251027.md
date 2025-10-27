# WhistleblowingPage 暫定マスターリスト

**文書番号**: MASTER-2025-1027-004
**作成日**: 2025年10月27日
**対象ページ**: https://voicedrive-v100.vercel.app/whistleblowing (WhistleblowingPage)
**参照文書**:
- [WhistleblowingPage_DB要件分析_20251027.md](./WhistleblowingPage_DB要件分析_20251027.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

## 📋 実装サマリー

### 結論
WhistleblowingPageは**既存のデータベーススキーマでほぼ実装可能**ですが、セキュリティとコンプライアンスの観点から**2つの追加項目を推奨**します。

### ステータス

| 項目 | 状態 | 評価 |
|-----|------|------|
| **データベーステーブル** | ✅ 実装済み | WhistleblowingReport + InvestigationNote |
| **必須フィールド** | 🟡 1件追加推奨 | evidenceDescription |
| **推奨テーブル** | 🟡 1件追加推奨 | WhistleblowingAccessLog（監査ログ） |
| **API実装** | ❌ 未実装 | 7件のAPIが必要 |
| **医療システム連携** | ❌ 未実装 | 3件のWebhook |
| **フロントエンド** | 🟡 デモモード実装済み | 実データ対応が必要 |
| **セキュリティ** | ❌ 未実装 | 暗号化、監査ログ |

---

## 📊 データベース要件

### A. 既存テーブル（schema.prisma内）

#### 1. WhistleblowingReport（2921-2965行目）

**状態**: ✅ 実装済み（ほぼ完成）

**フィールド数**: 23フィールド

**評価**: すべての基本機能に必要なフィールドが揃っている

**推奨追加**: `evidenceDescription` フィールド（1件）

---

#### 2. InvestigationNote（2969-2986行目）

**状態**: ✅ 実装済み（完全）

**フィールド数**: 8フィールド

**評価**: 調査ノート機能に必要なフィールドが完備

**追加不要**: すべて実装済み

---

#### 3. User（既存）

**使用フィールド**:
- `id`: 通報者識別（記名通報の場合）
- `name`: 調査員名表示
- `permissionLevel`: 権限チェック
- `accountType`: 管理者判定

**状態**: ✅ 既存フィールドで対応可能

---

### B. 推奨追加テーブル

#### 1. WhistleblowingAccessLog（新規）

**目的**: 機密情報へのアクセス監査

**優先度**: 🟡 MEDIUM（セキュリティ強化のため推奨）

**理由**:
- コンプライアンス対応（アクセス記録の保持）
- 不正アクセスの検知
- 監査証跡の提供

**スキーマ案**:
```prisma
model WhistleblowingAccessLog {
  id         String   @id @default(cuid())
  reportId   String
  userId     String
  action     String   // viewed, note_added, status_changed, escalated, resolved
  details    String?  // アクション詳細（JSON）
  accessedAt DateTime @default(now())
  ipAddress  String?
  userAgent  String?

  user   User                 @relation("WhistleblowingAccessUser", fields: [userId], references: [id])
  report WhistleblowingReport @relation("ReportAccessLogs", fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@index([userId])
  @@index([accessedAt])
  @@map("whistleblowing_access_logs")
}
```

**影響範囲**:
- Userモデルへのリレーション追加
- WhistleblowingReportモデルへのリレーション追加
- API各エンドポイントでのログ記録処理追加

---

## 🔧 必要な実装作業

### Phase 1: スキーマ更新

#### 優先度: 🔴 HIGH

**作業内容**:

1. **WhistleblowingReportテーブルへのフィールド追加**

```prisma
model WhistleblowingReport {
  // ... 既存フィールド（2921-2950行目）
  evidenceFiles       Json?    // 証拠ファイルURL配列
  evidenceDescription String?  // 🆕 証拠の説明（テキスト）
  // ... 既存フィールド（2930-2952行目）

  // リレーション追加
  accessLogs WhistleblowingAccessLog[] @relation("ReportAccessLogs") // 🆕
}
```

**理由**: WhistleblowingReportFormで`evidenceDescription`を入力できるが、保存先がない

**ファイル**: `prisma/schema.prisma`（2929行目付近に追加）

---

2. **WhistleblowingAccessLogテーブルの追加**

```prisma
// 🆕 新規テーブル（WhistleblowingReport定義の後に追加）
model WhistleblowingAccessLog {
  id         String   @id @default(cuid())
  reportId   String
  userId     String
  action     String
  details    String?
  accessedAt DateTime @default(now())
  ipAddress  String?
  userAgent  String?

  user   User                 @relation("WhistleblowingAccessUser", fields: [userId], references: [id])
  report WhistleblowingReport @relation("ReportAccessLogs", fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@index([userId])
  @@index([accessedAt])
  @@map("whistleblowing_access_logs")
}
```

**ファイル**: `prisma/schema.prisma`（InvestigationNoteモデルの後、2987行目付近に追加）

---

3. **Userモデルへのリレーション追加**

```prisma
model User {
  // ... 既存フィールド

  // 内部通報関連
  whistleblowingReports     WhistleblowingReport[]    @relation("WhistleblowingReports")
  whistleblowingAccessLogs  WhistleblowingAccessLog[] @relation("WhistleblowingAccessUser") // 🆕
}
```

**ファイル**: `prisma/schema.prisma`（Userモデルのリレーション定義エリア）

---

**マイグレーション実行**:
```bash
npx prisma migrate dev --name add-whistleblowing-evidence-description-and-access-logs
```

**工数**: 0.5日

---

### Phase 2: データ型定義の改善

#### 優先度: 🟠 MEDIUM

**作業内容**:

**1. 型定義の統一**

現在、2つの異なるWhistleblowingReport型定義が存在します：

- `src/types/whistleblowing.ts` (1-146行目): 詳細な型定義（UI用）
- `src/data/demo/whistleblowing.ts` (2-13行目): 簡易な型定義（デモ用）

**問題点**: 型の不一致により、実データ対応時にバグが発生する可能性

**推奨対応**:
```typescript
// src/types/whistleblowing.ts
// Prisma生成型をベースに拡張
import { WhistleblowingReport as PrismaWhistleblowingReport } from '@prisma/client';

export type WhistleblowingReport = PrismaWhistleblowingReport & {
  // フロントエンド専用の追加プロパティ
  internalNotes?: InvestigationNote[];
};

// デモデータファイルから簡易型を削除し、上記型を使用
```

**ファイル**:
- `src/types/whistleblowing.ts`（修正）
- `src/data/demo/whistleblowing.ts`（型定義削除、importに変更）

**工数**: 0.5日

---

### Phase 3: 権限管理の実装

#### 優先度: 🔴 HIGH

**作業内容**:

**1. 権限チェック関数の拡張**

**現在の実装** (`src/data/demo/whistleblowing.ts` 73-79行目):
```typescript
export const getWhistleblowingPermissions = (userLevel: number) => {
  return {
    canView: userLevel >= 3,
    canInvestigate: userLevel >= 4,
    canResolve: userLevel >= 4
  };
};
```

**問題点**:
- `maxSeverityLevel`が未実装
- `canAccessConfidentialNotes`が未実装
- `canEscalate`が未実装
- 詳細な権限制御ができない

**推奨実装**:
```typescript
export const getWhistleblowingPermissions = (userLevel: number): WhistleblowingPermissions => {
  if (userLevel >= 5) {
    return {
      canView: true,
      canInvestigate: true,
      canEscalate: true,
      canResolve: true,
      canViewStatistics: true,
      canAccessConfidentialNotes: true,
      canAssignInvestigators: true,
      maxSeverityLevel: 'critical'
    };
  } else if (userLevel >= 4) {
    return {
      canView: true,
      canInvestigate: true,
      canEscalate: true,
      canResolve: false,
      canViewStatistics: true,
      canAccessConfidentialNotes: false,
      canAssignInvestigators: false,
      maxSeverityLevel: 'high'
    };
  } else if (userLevel >= 3) {
    return {
      canView: true,
      canInvestigate: false,
      canEscalate: false,
      canResolve: false,
      canViewStatistics: true,
      canAccessConfidentialNotes: false,
      canAssignInvestigators: false,
      maxSeverityLevel: 'medium'
    };
  } else {
    return {
      canView: false,
      canInvestigate: false,
      canEscalate: false,
      canResolve: false,
      canViewStatistics: false,
      canAccessConfidentialNotes: false,
      canAssignInvestigators: false,
      maxSeverityLevel: 'low'
    };
  }
};
```

**ファイル**: `src/data/demo/whistleblowing.ts`（73-79行目を置き換え）

**工数**: 0.5日

---

### Phase 4: API実装

#### 優先度: 🔴 HIGH

**必要なAPI**: 7件

| # | メソッド | エンドポイント | 権限 | 用途 | 工数 |
|---|---------|---------------|------|------|------|
| 1 | POST | `/api/whistleblowing/reports` | 全職員 | 通報提出 | 1日 |
| 2 | GET | `/api/whistleblowing/reports` | Level 3+ | 通報一覧取得 | 1日 |
| 3 | GET | `/api/whistleblowing/reports/:id` | Level 3+ | 通報詳細取得 | 0.5日 |
| 4 | GET | `/api/whistleblowing/statistics` | Level 3+ | 統計取得 | 1日 |
| 5 | POST | `/api/whistleblowing/reports/:id/notes` | Level 5+ | 調査ノート追加 | 0.5日 |
| 6 | PATCH | `/api/whistleblowing/reports/:id/status` | Level 4+ | ステータス更新 | 0.5日 |
| 7 | GET | `/api/whistleblowing/reports/by-anonymous/:id` | 通報者本人 | 匿名ID検索 | 0.5日 |

**合計工数**: 5日

---

#### API 1: 通報提出

**エンドポイント**: `POST /api/whistleblowing/reports`

**ファイル**: `src/api/whistleblowing/reports.ts`（新規作成）

**主要機能**:
- フォームデータのバリデーション
- 匿名ID生成（サーバーサイド）
- WhistleblowingReport作成
- 重大案件の場合、医療システムへWebhook送信
- 通報者への確認通知

**サンプル実装**:
```typescript
// src/api/whistleblowing/reports.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateAnonymousId, sendCriticalReportWebhook } from './utils';

export async function submitReport(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, title, content, isAnonymous, contactMethod, contactInfo, evidenceDescription, expectedOutcome } = req.body;

  // バリデーション
  if (!category || !title || !content) {
    return res.status(400).json({ error: '必須項目が入力されていません' });
  }

  // 匿名ID生成
  const anonymousId = generateAnonymousId();

  // 重要度判定（簡易版、実際はより複雑なロジック）
  const severity = determineSeverity(category, content);

  try {
    // 通報作成
    const report = await prisma.whistleblowingReport.create({
      data: {
        userId: isAnonymous ? null : req.session?.userId,
        anonymousId,
        category,
        severity,
        title,
        content,
        isAnonymous,
        contactMethod: contactMethod || 'none',
        contactInfo: contactInfo ? encryptContactInfo(contactInfo) : null,
        evidenceDescription,
        expectedOutcome,
        status: 'received',
        priority: calculatePriority(severity, category)
      }
    });

    // 重大案件の場合、医療システムへ通知
    if (severity === 'critical') {
      await sendCriticalReportWebhook(report);
    }

    return res.status(201).json({
      success: true,
      reportId: report.id,
      anonymousId: report.anonymousId,
      message: '通報を受け付けました。追跡IDを大切に保管してください。',
      estimatedResponseTime: getEstimatedResponseTime(severity)
    });
  } catch (error) {
    console.error('通報提出エラー:', error);
    return res.status(500).json({ error: '通報の提出に失敗しました' });
  }
}
```

---

#### API 2: 通報一覧取得

**エンドポイント**: `GET /api/whistleblowing/reports`

**主要機能**:
- ユーザーの権限レベルに応じたフィルタリング
- ステータスによるフィルタリング
- ページネーション
- 重要度制限（maxSeverityLevel）の適用

**サンプル実装**:
```typescript
export async function getReports(req: NextApiRequest, res: NextApiResponse) {
  const { status, page = 1, limit = 20 } = req.query;
  const userLevel = req.session?.user?.permissionLevel || 1;

  // 権限チェック
  const permissions = getWhistleblowingPermissions(userLevel);
  if (!permissions.canView) {
    return res.status(403).json({ error: 'アクセス権限がありません' });
  }

  // 重要度フィルタ
  const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
  const maxLevel = severityLevels[permissions.maxSeverityLevel];

  const where = {
    ...(status && status !== 'all' ? { status } : {}),
    severity: {
      in: Object.entries(severityLevels)
        .filter(([_, level]) => level <= maxLevel)
        .map(([severity]) => severity)
    }
  };

  try {
    const reports = await prisma.whistleblowingReport.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { submittedAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        },
        investigationNotes: permissions.canAccessConfidentialNotes
      }
    });

    const totalCount = await prisma.whistleblowingReport.count({ where });

    return res.json({
      reports: reports.map(report => ({
        ...report,
        contactInfo: undefined // 機密情報を除外
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      },
      filters: {
        status,
        userLevel,
        maxSeverity: permissions.maxSeverityLevel
      }
    });
  } catch (error) {
    console.error('通報一覧取得エラー:', error);
    return res.status(500).json({ error: 'データの取得に失敗しました' });
  }
}
```

---

#### API 3: 統計取得

**エンドポイント**: `GET /api/whistleblowing/statistics`

**主要機能**:
- カテゴリ別集計
- ステータス別集計
- 重要度別集計
- 平均解決日数の計算
- 月次トレンド

**サンプル実装**:
```typescript
export async function getStatistics(req: NextApiRequest, res: NextApiResponse) {
  const { period = 'last30days' } = req.query;
  const userLevel = req.session?.user?.permissionLevel || 1;

  const permissions = getWhistleblowingPermissions(userLevel);
  if (!permissions.canViewStatistics) {
    return res.status(403).json({ error: 'アクセス権限がありません' });
  }

  const startDate = getStartDate(period as string);

  try {
    // 総通報数
    const totalReports = await prisma.whistleblowingReport.count({
      where: { submittedAt: { gte: startDate } }
    });

    // カテゴリ別
    const byCategory = await prisma.whistleblowingReport.groupBy({
      by: ['category'],
      where: { submittedAt: { gte: startDate } },
      _count: true
    });

    // ステータス別
    const byStatus = await prisma.whistleblowingReport.groupBy({
      by: ['status'],
      where: { submittedAt: { gte: startDate } },
      _count: true
    });

    // 重要度別
    const bySeverity = await prisma.whistleblowingReport.groupBy({
      by: ['severity'],
      where: { submittedAt: { gte: startDate } },
      _count: true
    });

    // 平均解決日数（resolved案件のみ）
    const resolvedReports = await prisma.whistleblowingReport.findMany({
      where: {
        status: 'resolved',
        submittedAt: { gte: startDate }
      },
      select: { submittedAt: true, updatedAt: true }
    });

    const averageResolutionDays = resolvedReports.length > 0
      ? resolvedReports.reduce((sum, r) => {
          const days = (r.updatedAt.getTime() - r.submittedAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / resolvedReports.length
      : 0;

    return res.json({
      totalReports,
      byCategory: Object.fromEntries(byCategory.map(c => [c.category, c._count])),
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])),
      bySeverity: Object.fromEntries(bySeverity.map(s => [s.severity, s._count])),
      averageResolutionDays: Math.round(averageResolutionDays * 10) / 10,
      escalationRate: calculateEscalationRate(byStatus),
      monthlyTrend: await getMonthlyTrend(startDate)
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    return res.status(500).json({ error: '統計の取得に失敗しました' });
  }
}
```

---

### Phase 5: 医療システム連携（Webhook）

#### 優先度: 🟠 MEDIUM

**必要なWebhook**: 3件

| # | 方向 | エンドポイント | トリガー | 用途 | 工数 |
|---|------|--------------|---------|------|------|
| 1 | VD → 医療 | `/medical/api/webhooks/whistleblowing-critical` | 重大案件提出時 | 緊急通知 | 2日 |
| 2 | 医療 → VD | `/voicedrive/api/webhooks/whistleblowing-acknowledged` | 受付確認時 | ケース番号登録 | 1.5日 |
| 3 | 医療 → VD | `/voicedrive/api/webhooks/whistleblowing-progress-updated` | 進捗更新時 | ステータス同期 | 1.5日 |

**合計工数**: 5日

---

#### Webhook 1: 重大案件通知（VD → 医療システム）

**エンドポイント**: `POST /medical-system/api/webhooks/whistleblowing-critical`

**ファイル**: `src/api/webhooks/sendCriticalReportWebhook.ts`（新規作成）

**サンプル実装**:
```typescript
import crypto from 'crypto';

export async function sendCriticalReportWebhook(report: WhistleblowingReport) {
  const webhookUrl = process.env.MEDICAL_SYSTEM_WEBHOOK_URL!;
  const secret = process.env.WEBHOOK_SECRET!;

  const payload = {
    eventType: 'whistleblowing.critical_report',
    timestamp: new Date().toISOString(),
    data: {
      reportId: report.id,
      anonymousId: report.anonymousId,
      category: report.category,
      severity: report.severity,
      title: report.title,
      content: '[機密情報のため省略]', // 詳細は医療システム側でAPI取得
      submittedAt: report.submittedAt.toISOString(),
      isAnonymous: report.isAnonymous,
      requiresImmediateAction: true
    }
  };

  // HMAC-SHA256署名
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VoiceDrive-Signature': `sha256=${signature}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Webhook送信失敗:', response.statusText);
      // リトライキューに追加
      await enqueueWebhookRetry(webhookUrl, payload);
    }
  } catch (error) {
    console.error('Webhook送信エラー:', error);
    await enqueueWebhookRetry(webhookUrl, payload);
  }
}
```

---

#### Webhook 2: 受付確認（医療システム → VD）

**エンドポイント**: `POST /api/webhooks/whistleblowing-acknowledged`

**ファイル**: `src/pages/api/webhooks/whistleblowing-acknowledged.ts`（新規作成）

**サンプル実装**:
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from './utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 署名検証
  const signature = req.headers['x-medical-system-signature'] as string;
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: '署名検証に失敗しました' });
  }

  const { eventType, data } = req.body;

  if (eventType !== 'whistleblowing.acknowledged') {
    return res.status(400).json({ error: '無効なイベントタイプです' });
  }

  const { reportId, medicalSystemCaseNumber, estimatedResponseTime, receivedAt } = data;

  try {
    // WhistleblowingReport更新
    await prisma.whistleblowingReport.update({
      where: { id: reportId },
      data: {
        acknowledgementReceived: true,
        acknowledgementDate: new Date(receivedAt),
        medicalSystemCaseNumber,
        estimatedResponseTime
      }
    });

    // 通報者への通知（匿名IDベース）
    // TODO: 通知機能の実装

    return res.status(200).json({ success: true, message: '受付確認を記録しました' });
  } catch (error) {
    console.error('受付確認処理エラー:', error);
    return res.status(500).json({ error: '処理に失敗しました' });
  }
}
```

---

### Phase 6: セキュリティ実装

#### 優先度: 🔴 HIGH

**必要な実装**: 3件

| # | 機能 | 目的 | 工数 |
|---|------|------|------|
| 1 | 匿名ID生成 | 逆引き不可能なID生成 | 0.5日 |
| 2 | 連絡先暗号化 | 機密情報の保護 | 1日 |
| 3 | アクセス監査ログ | コンプライアンス対応 | 1.5日 |

**合計工数**: 3日

---

#### 1. 匿名ID生成

**ファイル**: `src/utils/anonymousId.ts`（新規作成）

```typescript
import crypto from 'crypto';

export function generateAnonymousId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('base64url');
  const hash = crypto
    .createHash('sha256')
    .update(`${timestamp}-${random}-${process.env.SECRET_SALT}`)
    .digest('base64url')
    .substring(0, 6);

  return `ANON-${new Date().getFullYear()}-${hash.toUpperCase()}`;
}

// 例: ANON-2025-A1B2C3
```

---

#### 2. 連絡先情報の暗号化

**ファイル**: `src/utils/encryption.ts`（新規作成）

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32バイト（64文字の16進数）

export function encryptContactInfo(contactInfo: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(contactInfo, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export function decryptContactInfo(encryptedData: string): string {
  const [ivHex, encryptedHex, authTagHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**環境変数追加** (`.env`):
```
# 暗号化キー（32バイト = 64文字の16進数）
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

**キー生成コマンド**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

#### 3. アクセス監査ログ

**ファイル**: `src/utils/auditLog.ts`（新規作成）

```typescript
import { prisma } from '@/lib/prisma';

export async function logWhistleblowingAccess(
  reportId: string,
  userId: string,
  action: string,
  details?: string,
  req?: { headers: any; socket: any }
) {
  const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress;
  const userAgent = req?.headers['user-agent'];

  try {
    await prisma.whistleblowingAccessLog.create({
      data: {
        reportId,
        userId,
        action,
        details,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('監査ログ記録エラー:', error);
  }
}
```

**使用例**:
```typescript
// API内で使用
await logWhistleblowingAccess(
  report.id,
  req.session.user.id,
  'viewed',
  JSON.stringify({ severity: report.severity, category: report.category }),
  req
);
```

---

### Phase 7: フロントエンド改修

#### 優先度: 🔴 HIGH

**必要な変更**: 2ファイル

| ファイル | 変更内容 | 工数 |
|---------|---------|------|
| WhistleblowingPage.tsx | デモ → API呼び出し | 1日 |
| WhistleblowingDashboard.tsx | デモ → API呼び出し | 2日 |

**合計工数**: 3日

---

#### 変更1: WhistleblowingPage.tsx

**現在** (19-28行目):
```typescript
const handleSubmitReport = (report: ReportSubmissionForm) => {
  console.log('新しい相談:', report);
  const anonymousId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  alert(`相談が正常に提出されました。\n\n追跡ID: ${anonymousId}`);
  setShowReportForm(false);
};
```

**変更後**:
```typescript
const handleSubmitReport = async (report: ReportSubmissionForm) => {
  try {
    const response = await fetch('/api/whistleblowing/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });

    if (!response.ok) throw new Error('提出失敗');

    const data = await response.json();
    alert(`相談が正常に提出されました。\n\n追跡ID: ${data.anonymousId}\n\nこのIDは進捗確認に使用できます。大切に保管してください。`);
    setShowReportForm(false);
  } catch (error) {
    console.error('通報提出エラー:', error);
    alert('通報の提出中にエラーが発生しました。もう一度お試しください。');
  }
};
```

---

#### 変更2: WhistleblowingDashboard.tsx

**現在** (5, 19-35行目):
```typescript
import { demoWhistleblowingReports, demoReportStatistics, getWhistleblowingPermissions } from '../../data/demo/whistleblowing';

const getVisibleReports = () => {
  return demoWhistleblowingReports.filter(/* ... */);
};
```

**変更後**:
```typescript
import { getWhistleblowingPermissions } from '../../data/demo/whistleblowing';
import { useState, useEffect } from 'react';

const WhistleblowingDashboard: React.FC<WhistleblowingDashboardProps> = ({ onNewReport }) => {
  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [reportsRes, statsRes] = await Promise.all([
        fetch(`/api/whistleblowing/reports?status=${filterStatus}`),
        permissions.canViewStatistics ? fetch('/api/whistleblowing/statistics') : null
      ]);

      const reportsData = await reportsRes.json();
      setReports(reportsData.reports);

      if (statsRes) {
        const statsData = await statsRes.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... 残りのコード
};
```

---

## 📅 実装スケジュール

### 全体工数: 19.5日（約4週間）

| Phase | 内容 | 工数 | 依存関係 | 優先度 |
|-------|------|------|---------|--------|
| Phase 1 | スキーマ更新 | 0.5日 | なし | 🔴 HIGH |
| Phase 2 | 型定義改善 | 0.5日 | Phase 1 | 🟠 MEDIUM |
| Phase 3 | 権限管理実装 | 0.5日 | Phase 1 | 🔴 HIGH |
| Phase 4 | API実装 | 5日 | Phase 1, 3 | 🔴 HIGH |
| Phase 5 | 医療システム連携 | 5日 | Phase 4 | 🟠 MEDIUM |
| Phase 6 | セキュリティ実装 | 3日 | Phase 4 | 🔴 HIGH |
| Phase 7 | フロントエンド改修 | 3日 | Phase 4 | 🔴 HIGH |
| Phase 8 | テスト・デバッグ | 2日 | すべて | 🔴 HIGH |

**クリティカルパス**: Phase 1 → Phase 3 → Phase 4 → Phase 7 → Phase 8

**並行実行可能**:
- Phase 2（型定義改善）は独立して実施可能
- Phase 5（医療システム連携）とPhase 6（セキュリティ）はPhase 4完了後に並行実施可能

---

### Week 1: 基盤整備

**Day 1-2**:
- [ ] Phase 1: スキーマ更新（0.5日）
- [ ] Phase 2: 型定義改善（0.5日）
- [ ] Phase 3: 権限管理実装（0.5日）
- [ ] Phase 4開始: API 1-2実装（0.5日）

**Day 3-5**:
- [ ] Phase 4続き: API 3-7実装（4.5日）

---

### Week 2: 連携とセキュリティ

**Day 6-8**:
- [ ] Phase 5: 医療システム連携（3日）

**Day 9-10**:
- [ ] Phase 6: セキュリティ実装（2日）

---

### Week 3: フロントエンド改修

**Day 11-13**:
- [ ] Phase 7: フロントエンド改修（3日）

**Day 14-15**:
- [ ] Phase 8: テスト・デバッグ（2日）

**Day 15**:
- [ ] Phase 5残り: Webhook実装（2日）
- [ ] Phase 6残り: セキュリティ強化（1日）

---

### Week 4: 総合テストとデプロイ準備

**Day 16-17**:
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] セキュリティテスト

**Day 18-19**:
- [ ] パフォーマンステスト
- [ ] ドキュメント整備
- [ ] デプロイ準備

**Day 19.5**:
- [ ] 最終レビュー
- [ ] 本番環境デプロイ

---

## ✅ 最終チェックリスト

### データベース

- [ ] WhistleblowingReportテーブル確認（schema.prisma 2921-2965行目）
- [ ] InvestigationNoteテーブル確認（schema.prisma 2969-2986行目）
- [ ] `evidenceDescription`フィールド追加
- [ ] WhistleblowingAccessLogテーブル追加
- [ ] Userモデルへのリレーション追加
- [ ] マイグレーション実行
- [ ] 本番環境への反映

### API実装

- [ ] POST /api/whistleblowing/reports
- [ ] GET /api/whistleblowing/reports
- [ ] GET /api/whistleblowing/reports/:id
- [ ] GET /api/whistleblowing/statistics
- [ ] POST /api/whistleblowing/reports/:id/notes
- [ ] PATCH /api/whistleblowing/reports/:id/status
- [ ] GET /api/whistleblowing/reports/by-anonymous/:id
- [ ] エラーハンドリング実装
- [ ] バリデーション実装
- [ ] API ドキュメント作成

### 医療システム連携

- [ ] Webhook送信実装（VD → 医療システム）
- [ ] Webhook受信実装（医療システム → VD）×2
- [ ] 署名検証実装
- [ ] リトライ機能実装
- [ ] エラー通知機能
- [ ] 連携テスト

### セキュリティ

- [ ] 匿名ID生成関数実装
- [ ] 連絡先暗号化実装
- [ ] 監査ログ記録実装
- [ ] 環境変数設定（ENCRYPTION_KEY）
- [ ] IPアドレス非記録の確認
- [ ] セキュリティテスト

### フロントエンド

- [ ] WhistleblowingPage改修（API呼び出し）
- [ ] WhistleblowingDashboard改修（API呼び出し）
- [ ] 調査ノート追加機能実装
- [ ] エラー表示改善
- [ ] ローディング表示実装
- [ ] レスポンシブ確認

### テスト

- [ ] 単体テスト（API）
- [ ] 統合テスト（Webhook）
- [ ] 権限テスト（レベル別）
- [ ] セキュリティテスト
- [ ] E2Eテスト
- [ ] パフォーマンステスト
- [ ] ブラウザ互換性テスト

### ドキュメント

- [ ] API仕様書
- [ ] Webhook仕様書
- [ ] セキュリティガイドライン
- [ ] 運用マニュアル
- [ ] トラブルシューティングガイド

---

## 📊 リスク管理

### 高リスク項目

| リスク | 影響 | 対策 |
|-------|------|------|
| 匿名性の漏洩 | 🔴 Critical | 暗号化、監査ログ、定期セキュリティレビュー |
| 医療システム連携の遅延 | 🟠 High | Phase 5を後回し、VoiceDrive単独動作を優先 |
| 権限制御の不備 | 🔴 Critical | 徹底した権限テスト、多層防御 |
| データ漏洩 | 🔴 Critical | 暗号化、アクセスログ、定期監査 |

### 中リスク項目

| リスク | 影響 | 対策 |
|-------|------|------|
| パフォーマンス低下 | 🟠 Medium | キャッシュ、インデックス最適化 |
| 統合テストの遅延 | 🟠 Medium | 早期テスト開始、継続的テスト |
| API仕様変更 | 🟠 Medium | バージョニング、後方互換性維持 |

---

## 📌 重要な注意事項

### セキュリティ

1. **匿名性の保証**
   - `userId`をnullに設定（匿名通報）
   - IPアドレス・フィンガープリントを記録しない
   - 匿名IDから逆引きできない設計

2. **機密情報の保護**
   - 連絡先情報は必ず暗号化
   - 調査ノートは高権限のみ閲覧可能
   - アクセス監査ログを必ず記録

3. **コンプライアンス**
   - すべてのアクセスをログに記録
   - ログ保持期間を設定（推奨: 5年）
   - 定期的な監査実施

### データ管理

1. **データ管理責任**
   - 通報データ: 🟢 VoiceDrive管轄
   - 職員権限情報: 🔵 医療システム管轄（キャッシュ）
   - 重大案件: 🟡 両システムで共有

2. **医療システムとの役割分担**
   - VoiceDrive: 通報受付、初期対応
   - 医療システム: 詳細調査、人事対応

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
次回レビュー: 実装開始時
