# MyReportsPage 暫定マスターリスト

**作成日**: 2025年10月26日
**対象ページ**: MyReportsPage（コンプライアンス通報履歴）
**バージョン**: 1.0

---

## 📋 目次

1. [WhistleblowingReport テーブル定義](#1-whistleblowingreport-テーブル定義)
2. [InvestigationNote テーブル定義](#2-investigationnote-テーブル定義)
3. [ComplianceAcknowledgement テーブル定義](#3-complianceacknowledgement-テーブル定義既存)
4. [API仕様](#4-api仕様)
5. [データ検証ルール](#5-データ検証ルール)
6. [ビジネスロジック](#6-ビジネスロジック)

---

## 1. WhistleblowingReport テーブル定義

### テーブル概要
職員が送信したコンプライアンス通報の本体データを管理するテーブル。

### フィールド一覧

| # | フィールド名 | 日本語名 | 英語名 | データ型 | デフォルト値 | NULL許可 | 保存場所 | データ責任 | 検証ルール |
|---|------------|---------|--------|---------|-----------|---------|---------|----------|----------|
| 1 | id | 通報ID | Report ID | String | cuid() | ❌ | VoiceDrive DB | 100% VD | - |
| 2 | userId | 送信者ユーザーID | User ID | String? | null | ✅ | VoiceDrive DB | 100% VD | 匿名通報の場合null |
| 3 | anonymousId | 匿名ID | Anonymous ID | String | 自動生成 | ❌ | VoiceDrive DB | 100% VD | ANON-XXXXXX形式（6桁英数字） |
| 4 | category | カテゴリー | Category | String | - | ❌ | VoiceDrive DB | 100% VD | 6種類のenum値 |
| 5 | severity | 緊急度 | Severity | String | 'medium' | ❌ | VoiceDrive DB | 100% VD | 4種類のenum値 |
| 6 | title | タイトル | Title | String | - | ❌ | VoiceDrive DB | 100% VD | 5-200文字 |
| 7 | content | 内容 | Content | String | - | ❌ | VoiceDrive DB | 100% VD | 20-5000文字 |
| 8 | evidenceFiles | 証拠ファイル | Evidence Files | Json? | null | ✅ | VoiceDrive DB | 100% VD | URL配列、最大5ファイル |
| 9 | submittedAt | 送信日時 | Submitted At | DateTime | now() | ❌ | VoiceDrive DB | 100% VD | - |
| 10 | updatedAt | 更新日時 | Updated At | DateTime | now() | ❌ | VoiceDrive DB | 100% VD | - |
| 11 | status | ステータス | Status | String | 'received' | ❌ | VoiceDrive DB | 50% VD, 50% 医療 | 6種類のenum値 |
| 12 | assignedInvestigators | 担当調査員 | Assigned Investigators | Json? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | 調査員役割の配列 |
| 13 | escalationReason | エスカレーション理由 | Escalation Reason | String? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | 0-500文字 |
| 14 | resolutionSummary | 対応結果サマリー | Resolution Summary | String? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | 0-1000文字 |
| 15 | followUpRequired | フォローアップ必要 | Follow Up Required | Boolean | false | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 16 | isAnonymous | 匿名通報フラグ | Is Anonymous | Boolean | true | ❌ | VoiceDrive DB | 100% VD | - |
| 17 | priority | 優先度 | Priority | Int | 5 | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | 1-10の整数 |
| 18 | medicalSystemCaseNumber | 医療システムケース番号 | Medical System Case Number | String? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | MED-YYYY-NNNN形式 |
| 19 | acknowledgementReceived | 受付確認済みフラグ | Acknowledgement Received | Boolean | false | ❌ | VoiceDrive DB | 50% VD, 50% 医療 | - |
| 20 | acknowledgementDate | 受付確認日時 | Acknowledgement Date | DateTime? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 21 | estimatedResponseTime | 対応予定時間 | Estimated Response Time | String? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | 例: "1時間以内", "当日中" |
| 22 | contactMethod | 連絡方法 | Contact Method | String? | null | ✅ | VoiceDrive DB | 100% VD | email/phone/none |
| 23 | contactInfo | 連絡先情報 | Contact Info | String? | null | ✅ | VoiceDrive DB | 100% VD | 暗号化保存推奨 |
| 24 | expectedOutcome | 期待する結果 | Expected Outcome | String? | null | ✅ | VoiceDrive DB | 100% VD | 0-500文字 |
| 25 | createdAt | 作成日時 | Created At | DateTime | now() | ❌ | VoiceDrive DB | 100% VD | - |

### Enum定義

#### ReportCategory（通報カテゴリー）
```typescript
export type ReportCategory =
  | 'harassment'      // ハラスメント
  | 'safety'          // 安全管理
  | 'financial'       // 財務・会計
  | 'compliance'      // コンプライアンス
  | 'discrimination'  // 差別・不公正
  | 'other';          // その他
```

#### ReportSeverity（緊急度）
```typescript
export type ReportSeverity =
  | 'low'      // 軽微
  | 'medium'   // 中程度
  | 'high'     // 重要
  | 'critical'; // 緊急
```

#### ReportStatus（ステータス）
```typescript
export type ReportStatus =
  | 'received'        // 受付完了
  | 'triaging'        // 分類・重要度判定中
  | 'investigating'   // 内部調査中
  | 'escalated'       // 外部専門家へエスカレーション
  | 'resolved'        // 対応完了
  | 'closed';         // 案件終了
```

#### InvestigatorRole（調査員役割）
```typescript
export type InvestigatorRole =
  | 'hr_specialist'     // 人事専門家
  | 'legal_counsel'     // 法務担当
  | 'safety_officer'    // 安全管理者
  | 'external_expert'   // 外部専門家
  | 'management';       // 管理職
```

### インデックス定義
```prisma
@@index([userId])
@@index([anonymousId])
@@index([category])
@@index([status])
@@index([severity])
@@index([medicalSystemCaseNumber])
@@index([submittedAt])
@@index([createdAt])
```

### リレーション定義
```prisma
model WhistleblowingReport {
  // ...fields...

  user              User?               @relation("WhistleblowingReports", fields: [userId], references: [id])
  investigationNotes InvestigationNote[] @relation("ReportInvestigationNotes")

  @@map("whistleblowing_reports")
}
```

---

## 2. InvestigationNote テーブル定義

### テーブル概要
調査員が記録する内部調査ノート。機密情報のため職員には非公開。

### フィールド一覧

| # | フィールド名 | 日本語名 | 英語名 | データ型 | デフォルト値 | NULL許可 | 保存場所 | データ責任 | 検証ルール |
|---|------------|---------|--------|---------|-----------|---------|---------|----------|----------|
| 1 | id | ノートID | Note ID | String | cuid() | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 2 | reportId | 通報ID | Report ID | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | 外部キー |
| 3 | authorRole | 作成者役割 | Author Role | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | InvestigatorRole enum |
| 4 | authorName | 作成者名 | Author Name | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | 1-100文字 |
| 5 | content | 内容 | Content | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | 1-5000文字 |
| 6 | isConfidential | 機密フラグ | Is Confidential | Boolean | true | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 7 | actionItems | アクションアイテム | Action Items | Json? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | 文字列配列 |
| 8 | createdAt | 作成日時 | Created At | DateTime | now() | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 9 | updatedAt | 更新日時 | Updated At | DateTime | now() | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |

### インデックス定義
```prisma
@@index([reportId])
@@index([createdAt])
```

### リレーション定義
```prisma
model InvestigationNote {
  // ...fields...

  report WhistleblowingReport @relation("ReportInvestigationNotes", fields: [reportId], references: [id], onDelete: Cascade)

  @@map("investigation_notes")
}
```

---

## 3. ComplianceAcknowledgement テーブル定義（既存）

### テーブル概要
医療システムからの受付確認通知を保存するテーブル（既存）。

### フィールド一覧

| # | フィールド名 | 日本語名 | 英語名 | データ型 | デフォルト値 | NULL許可 | 保存場所 | データ責任 | 検証ルール |
|---|------------|---------|--------|---------|-----------|---------|---------|----------|----------|
| 1 | id | ID | ID | String | cuid() | ❌ | VoiceDrive DB | 50% VD, 50% 医療 | - |
| 2 | reportId | 通報ID | Report ID | String | - | ❌ | VoiceDrive DB | 50% VD, 50% 医療 | ユニーク制約 |
| 3 | medicalSystemCaseNumber | 医療システムケース番号 | Medical System Case Number | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | ユニーク制約 |
| 4 | anonymousId | 匿名ID | Anonymous ID | String | - | ❌ | VoiceDrive DB | 50% VD, 50% 医療 | - |
| 5 | severity | 緊急度 | Severity | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 6 | category | カテゴリー | Category | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 7 | receivedAt | 受信日時 | Received At | DateTime | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 8 | estimatedResponseTime | 対応予定時間 | Estimated Response Time | String | - | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 9 | requiresImmediateAction | 即時対応必要 | Requires Immediate Action | Boolean | false | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 10 | currentStatus | 現在のステータス | Current Status | String | 'received' | ❌ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 11 | nextSteps | 次のステップ | Next Steps | String? | null | ✅ | VoiceDrive DB | 0% VD, 100% 医療 | - |
| 12 | webhookReceivedAt | Webhook受信日時 | Webhook Received At | DateTime | now() | ❌ | VoiceDrive DB | 100% VD | - |
| 13 | processed | 処理済みフラグ | Processed | Boolean | false | ❌ | VoiceDrive DB | 100% VD | - |
| 14 | processedAt | 処理日時 | Processed At | DateTime? | null | ✅ | VoiceDrive DB | 100% VD | - |
| 15 | createdAt | 作成日時 | Created At | DateTime | now() | ❌ | VoiceDrive DB | 100% VD | - |
| 16 | updatedAt | 更新日時 | Updated At | DateTime | now() | ❌ | VoiceDrive DB | 100% VD | - |

**変更不要** - 現状のまま使用可能

---

## 4. API仕様

### 4.1 通報履歴取得API

**エンドポイント**: `GET /api/whistleblowing/reports`

**認証**: 必須（Bearerトークン）

**クエリパラメータ**:
| パラメータ名 | 型 | 必須 | デフォルト値 | 説明 |
|------------|---|------|------------|------|
| userId | String | ✅ | - | ユーザーID（自分の通報のみ取得） |
| status | String | ❌ | 'all' | ステータスフィルター |
| category | String | ❌ | 'all' | カテゴリーフィルター |
| limit | Int | ❌ | 50 | 取得件数 |
| offset | Int | ❌ | 0 | オフセット |

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "RPT-2025-001",
      "anonymousId": "ANON-8F3A2B",
      "category": "harassment",
      "severity": "high",
      "title": "パワーハラスメントの相談",
      "content": "上司からの不適切な発言が続いています...",
      "submittedAt": "2025-10-01T10:30:00Z",
      "updatedAt": "2025-10-02T14:20:00Z",
      "status": "investigating",
      "medicalSystemCaseNumber": "MED-2025-0001",
      "acknowledgementReceived": true,
      "acknowledgementDate": "2025-10-01T11:00:00Z",
      "estimatedResponseTime": "当日中",
      "followUpRequired": true,
      "isAnonymous": true,
      "priority": 8
    }
  ],
  "count": 3,
  "total": 3
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": "認証エラー",
  "code": "UNAUTHORIZED"
}
```

---

### 4.2 通報詳細取得API

**エンドポイント**: `GET /api/whistleblowing/reports/:reportId`

**認証**: 必須（Bearerトークン）

**パスパラメータ**:
| パラメータ名 | 型 | 必須 | 説明 |
|------------|---|------|------|
| reportId | String | ✅ | 通報ID |

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "RPT-2025-001",
    "anonymousId": "ANON-8F3A2B",
    "category": "harassment",
    "severity": "high",
    "title": "パワーハラスメントの相談",
    "content": "詳細な内容...",
    "evidenceFiles": [
      "https://s3.example.com/evidence/file1.pdf"
    ],
    "submittedAt": "2025-10-01T10:30:00Z",
    "updatedAt": "2025-10-02T14:20:00Z",
    "status": "investigating",
    "assignedInvestigators": ["hr_specialist", "management"],
    "resolutionSummary": null,
    "followUpRequired": true,
    "isAnonymous": true,
    "priority": 8,
    "medicalSystemCaseNumber": "MED-2025-0001",
    "acknowledgementReceived": true,
    "acknowledgementDate": "2025-10-01T11:00:00Z",
    "estimatedResponseTime": "当日中",
    "contactMethod": "email",
    "expectedOutcome": "改善を期待します"
  }
}
```

**注意**:
- `contactInfo`（連絡先情報）は匿名通報の場合は返さない
- `investigationNotes`（調査ノート）は機密情報のため職員には非公開

---

### 4.3 通報送信API

**エンドポイント**: `POST /api/whistleblowing/reports`

**認証**: 必須（Bearerトークン）

**リクエストボディ**:
```json
{
  "category": "harassment",
  "title": "パワーハラスメントの相談",
  "content": "上司からの不適切な発言が続いています...",
  "isAnonymous": true,
  "contactMethod": "email",
  "contactInfo": "example@example.com",
  "evidenceDescription": "証拠の説明",
  "expectedOutcome": "改善を期待します"
}
```

**バリデーション**:
- `category`: 必須、ReportCategory enum値
- `title`: 必須、5-200文字
- `content`: 必須、20-5000文字
- `isAnonymous`: 必須、Boolean
- `contactMethod`: オプション、'email' | 'phone' | 'none'
- `contactInfo`: contactMethod指定時は必須
- `evidenceDescription`: オプション、0-500文字
- `expectedOutcome`: オプション、0-500文字

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "RPT-2025-004",
    "anonymousId": "ANON-9E4C3D",
    "submittedAt": "2025-10-26T15:00:00Z",
    "status": "received"
  },
  "message": "通報を受け付けました。匿名IDを記録してください。"
}
```

**処理フロー**:
1. リクエストバリデーション
2. 匿名ID生成（`ANON-XXXXXX`形式）
3. WhistleblowingReportテーブルに保存
4. 医療システムへWebhook送信
5. レスポンス返却

---

### 4.4 受付確認通知取得API

**エンドポイント**: `GET /api/whistleblowing/acknowledgements`

**認証**: 必須（Bearerトークン）

**クエリパラメータ**:
| パラメータ名 | 型 | 必須 | デフォルト値 | 説明 |
|------------|---|------|------------|------|
| anonymousId | String | ❌ | - | 匿名ID（指定時はその通報のみ） |
| userId | String | ✅ | - | ユーザーID |

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "reportId": "RPT-2025-003",
      "anonymousId": "ANON-2A7F4C",
      "medicalSystemCaseNumber": "MED-2025-0003",
      "severity": "critical",
      "category": "コンプライアンス",
      "receivedAt": "2025-10-03T08:30:00Z",
      "estimatedResponseTime": "1時間以内",
      "requiresImmediateAction": true,
      "currentStatus": "緊急対応チームによる初動調査を開始",
      "nextSteps": "担当者による聞き取り調査を実施予定です。"
    }
  ]
}
```

---

### 4.5 通報統計取得API

**エンドポイント**: `GET /api/whistleblowing/statistics`

**認証**: 必須（Bearerトークン）

**クエリパラメータ**:
| パラメータ名 | 型 | 必須 | デフォルト値 | 説明 |
|------------|---|------|------------|------|
| userId | String | ✅ | - | ユーザーID（自分の統計のみ） |

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "totalReports": 3,
    "byCategory": {
      "harassment": 1,
      "safety": 1,
      "financial": 0,
      "compliance": 1,
      "discrimination": 0,
      "other": 0
    },
    "byStatus": {
      "received": 0,
      "triaging": 1,
      "investigating": 1,
      "escalated": 0,
      "resolved": 1,
      "closed": 0
    },
    "bySeverity": {
      "critical": 1,
      "high": 1,
      "medium": 1,
      "low": 0
    },
    "acknowledgementRate": 100,
    "averageResponseDays": 2.5
  }
}
```

---

## 5. データ検証ルール

### 5.1 通報送信時の検証

#### タイトル検証
```typescript
function validateTitle(title: string): boolean {
  return title.length >= 5 && title.length <= 200;
}
```

#### 内容検証
```typescript
function validateContent(content: string): boolean {
  return content.length >= 20 && content.length <= 5000;
}
```

#### カテゴリー検証
```typescript
const VALID_CATEGORIES = [
  'harassment',
  'safety',
  'financial',
  'compliance',
  'discrimination',
  'other'
] as const;

function validateCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category as any);
}
```

#### 連絡先検証
```typescript
function validateContactInfo(
  contactMethod: string | null,
  contactInfo: string | null
): boolean {
  if (contactMethod === 'none' || !contactMethod) {
    return true; // 連絡不要の場合はOK
  }

  if (!contactInfo) {
    return false; // 連絡方法指定時は連絡先必須
  }

  if (contactMethod === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo);
  }

  if (contactMethod === 'phone') {
    return /^\d{10,11}$/.test(contactInfo.replace(/-/g, ''));
  }

  return false;
}
```

---

### 5.2 匿名ID生成ルール

```typescript
import crypto from 'crypto';

function generateAnonymousId(): string {
  const randomBytes = crypto.randomBytes(3); // 3バイト = 6桁の16進数
  const hexString = randomBytes.toString('hex').toUpperCase();
  return `ANON-${hexString}`;
}

// 例: ANON-8F3A2B
```

**重要**:
- ユーザーIDから推測不可能であること
- 衝突しないこと（crypto.randomBytes使用）
- 6桁英数字で読みやすいこと

---

### 5.3 ステータス遷移ルール

```typescript
const STATUS_TRANSITIONS = {
  received: ['triaging'],
  triaging: ['investigating', 'escalated', 'resolved'],
  investigating: ['escalated', 'resolved', 'closed'],
  escalated: ['investigating', 'resolved', 'closed'],
  resolved: ['closed'],
  closed: [] // 終了状態
};

function isValidStatusTransition(
  currentStatus: ReportStatus,
  newStatus: ReportStatus
): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}
```

**ステータス遷移図**:
```
received → triaging → investigating → resolved → closed
                ↓           ↓
              escalated ----┘
```

---

## 6. ビジネスロジック

### 6.1 通報送信処理

```typescript
async function submitWhistleblowingReport(
  userId: string,
  data: ReportSubmissionForm
): Promise<WhistleblowingReport> {
  // 1. バリデーション
  validateTitle(data.title);
  validateContent(data.content);
  validateCategory(data.category);
  validateContactInfo(data.contactMethod, data.contactInfo);

  // 2. 匿名ID生成
  const anonymousId = generateAnonymousId();

  // 3. 緊急度自動判定（キーワードベース）
  const severity = detectSeverity(data.content, data.category);

  // 4. DB保存
  const report = await prisma.whistleblowingReport.create({
    data: {
      userId: data.isAnonymous ? null : userId,
      anonymousId,
      category: data.category,
      severity,
      title: data.title,
      content: data.content,
      isAnonymous: data.isAnonymous,
      contactMethod: data.contactMethod || null,
      contactInfo: data.contactInfo ? encrypt(data.contactInfo) : null,
      expectedOutcome: data.expectedOutcome || null,
      status: 'received',
      priority: calculatePriority(severity, data.category)
    }
  });

  // 5. 医療システムへWebhook送信
  await sendReportToMedicalSystem(report);

  // 6. 通知送信（管理者へ）
  await notifyAdmins(report);

  return report;
}
```

---

### 6.2 緊急度自動判定

```typescript
function detectSeverity(
  content: string,
  category: ReportCategory
): ReportSeverity {
  const lowerContent = content.toLowerCase();

  // 緊急キーワード
  const criticalKeywords = [
    '殺す', '自殺', '暴力', '脅迫', '即座', '緊急',
    '危険', '生命', '重大', '深刻'
  ];

  // 重要キーワード
  const highKeywords = [
    'ハラスメント', 'いじめ', '差別', '不正',
    '横領', '改ざん', '隠蔽'
  ];

  // 緊急キーワードが含まれる場合
  if (criticalKeywords.some(kw => lowerContent.includes(kw))) {
    return 'critical';
  }

  // 重要キーワードが含まれる場合
  if (highKeywords.some(kw => lowerContent.includes(kw))) {
    return 'high';
  }

  // カテゴリーベースの判定
  if (category === 'compliance' || category === 'financial') {
    return 'high';
  }

  return 'medium';
}
```

---

### 6.3 優先度計算

```typescript
function calculatePriority(
  severity: ReportSeverity,
  category: ReportCategory
): number {
  let basePriority = 5;

  // 緊急度による加点
  switch (severity) {
    case 'critical': basePriority += 5; break;
    case 'high': basePriority += 3; break;
    case 'medium': basePriority += 1; break;
    case 'low': basePriority += 0; break;
  }

  // カテゴリーによる加点
  if (category === 'compliance' || category === 'financial') {
    basePriority += 2;
  }

  return Math.min(basePriority, 10); // 最大10
}
```

---

### 6.4 医療システムへのWebhook送信

```typescript
async function sendReportToMedicalSystem(
  report: WhistleblowingReport
): Promise<void> {
  const webhookUrl = process.env.MEDICAL_SYSTEM_WEBHOOK_URL ||
    'http://localhost:8080/api/webhooks/voicedrive/whistleblowing/report';

  const payload = {
    reportId: report.id,
    anonymousId: report.anonymousId,
    category: report.category,
    severity: report.severity,
    title: report.title,
    submittedAt: report.submittedAt.toISOString(),
    isAnonymous: report.isAnonymous,
    priority: report.priority
  };

  const signature = generateWebhookSignature(payload);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VoiceDrive-Signature': signature,
        'X-VoiceDrive-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook送信失敗: ${response.status}`);
    }

    const result = await response.json();

    // 医療システムから返されたケース番号を保存
    if (result.caseNumber) {
      await prisma.whistleblowingReport.update({
        where: { id: report.id },
        data: {
          medicalSystemCaseNumber: result.caseNumber,
          estimatedResponseTime: result.estimatedResponseTime
        }
      });
    }

    console.log(`[Webhook] 通報送信成功: reportId=${report.id}`);
  } catch (error) {
    console.error('[Webhook] 通報送信エラー:', error);
    // エラーでもVoiceDrive側の処理は継続
  }
}
```

---

### 6.5 受付確認Webhook受信処理

```typescript
async function handleAcknowledgementWebhook(
  payload: AcknowledgementNotification
): Promise<void> {
  // 1. ComplianceAcknowledgementテーブルに保存
  await prisma.complianceAcknowledgement.create({
    data: {
      reportId: payload.reportId,
      medicalSystemCaseNumber: payload.medicalSystemCaseNumber,
      anonymousId: payload.anonymousId,
      severity: payload.severity,
      category: payload.category,
      receivedAt: payload.receivedAt,
      estimatedResponseTime: payload.estimatedResponseTime,
      requiresImmediateAction: payload.requiresImmediateAction,
      currentStatus: payload.currentStatus,
      nextSteps: payload.nextSteps || null,
      processed: false
    }
  });

  // 2. WhistleblowingReportテーブルを更新
  await prisma.whistleblowingReport.update({
    where: { id: payload.reportId },
    data: {
      acknowledgementReceived: true,
      acknowledgementDate: payload.receivedAt,
      medicalSystemCaseNumber: payload.medicalSystemCaseNumber,
      estimatedResponseTime: payload.estimatedResponseTime
    }
  });

  // 3. ユーザーへ通知（プッシュ通知 or メール）
  await notifyUserAboutAcknowledgement(payload);

  console.log(`[Webhook] 受付確認処理完了: reportId=${payload.reportId}`);
}
```

---

### 6.6 ステータス更新Webhook受信処理

```typescript
interface StatusUpdatePayload {
  reportId: string;
  caseNumber: string;
  status: ReportStatus;
  assignedInvestigators?: InvestigatorRole[];
  updatedAt: string;
  nextSteps?: string;
}

async function handleStatusUpdateWebhook(
  payload: StatusUpdatePayload
): Promise<void> {
  // 1. ステータス遷移検証
  const report = await prisma.whistleblowingReport.findUnique({
    where: { id: payload.reportId }
  });

  if (!report) {
    throw new Error(`通報が見つかりません: ${payload.reportId}`);
  }

  if (!isValidStatusTransition(report.status as ReportStatus, payload.status)) {
    throw new Error(`不正なステータス遷移: ${report.status} → ${payload.status}`);
  }

  // 2. WhistleblowingReportテーブルを更新
  await prisma.whistleblowingReport.update({
    where: { id: payload.reportId },
    data: {
      status: payload.status,
      assignedInvestigators: payload.assignedInvestigators || null,
      updatedAt: new Date(payload.updatedAt)
    }
  });

  // 3. ユーザーへ通知
  await notifyUserAboutStatusUpdate(report, payload);

  console.log(`[Webhook] ステータス更新完了: reportId=${payload.reportId}, status=${payload.status}`);
}
```

---

### 6.7 調査完了通知Webhook受信処理

```typescript
interface ResolutionPayload {
  reportId: string;
  caseNumber: string;
  status: 'resolved' | 'closed';
  resolutionSummary: string;
  resolvedAt: string;
}

async function handleResolutionWebhook(
  payload: ResolutionPayload
): Promise<void> {
  // 1. WhistleblowingReportテーブルを更新
  await prisma.whistleblowingReport.update({
    where: { id: payload.reportId },
    data: {
      status: payload.status,
      resolutionSummary: payload.resolutionSummary,
      followUpRequired: false,
      updatedAt: new Date(payload.resolvedAt)
    }
  });

  // 2. ユーザーへ完了通知
  await notifyUserAboutResolution(payload);

  console.log(`[Webhook] 調査完了処理完了: reportId=${payload.reportId}`);
}
```

---

## 📊 データフロー図

### 通報送信フロー

```
職員（MyReportsPage）
  ↓ POST /api/whistleblowing/reports
VoiceDrive API
  ↓ 1. バリデーション
  ↓ 2. 匿名ID生成
  ↓ 3. 緊急度判定
  ↓ 4. DB保存（WhistleblowingReport）
  ↓ 5. Webhook送信
医療システム
  ↓ ケース番号発行
  ↓ POST /api/webhooks/medical-system/whistleblowing/acknowledgement
VoiceDrive Webhook受信
  ↓ 1. ComplianceAcknowledgement作成
  ↓ 2. WhistleblowingReport更新
  ↓ 3. ユーザーへ通知
職員（MyReportsPage）
  ↓ 受付確認通知を表示
```

---

## ✅ 実装チェックリスト

### データベース
- [ ] WhistleblowingReportテーブル作成
- [ ] InvestigationNoteテーブル作成
- [ ] リレーション定義
- [ ] インデックス作成
- [ ] マイグレーション実行

### API実装
- [ ] POST /api/whistleblowing/reports
- [ ] GET /api/whistleblowing/reports
- [ ] GET /api/whistleblowing/reports/:id
- [ ] GET /api/whistleblowing/acknowledgements
- [ ] GET /api/whistleblowing/statistics
- [ ] POST /api/webhooks/medical-system/whistleblowing/status-update
- [ ] POST /api/webhooks/medical-system/whistleblowing/resolution

### バリデーション
- [ ] タイトル検証
- [ ] 内容検証
- [ ] カテゴリー検証
- [ ] 連絡先検証
- [ ] ステータス遷移検証

### ビジネスロジック
- [ ] 匿名ID生成
- [ ] 緊急度自動判定
- [ ] 優先度計算
- [ ] Webhook送信（VD→医療システム）
- [ ] Webhook受信処理（医療システム→VD）

### フロントエンド
- [ ] API統合（通報履歴一覧）
- [ ] API統合（受付確認通知）
- [ ] API統合（統計情報）
- [ ] 通報詳細ページ実装

---

**作成者**: VoiceDrive開発チーム
**最終更新**: 2025年10月26日
**バージョン**: 1.0
