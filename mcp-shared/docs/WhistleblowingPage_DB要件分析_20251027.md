# WhistleblowingPageページ DB要件分析

**文書番号**: DB-REQ-2025-1027-004
**作成日**: 2025年10月27日
**対象ページ**: https://voicedrive-v100.vercel.app/whistleblowing (WhistleblowingPage)
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [UnauthorizedPage_DB要件分析_20251027.md](./UnauthorizedPage_DB要件分析_20251027.md)

---

## 📋 分析サマリー

### 結論
WhistleblowingPageは**コンプライアンス内部通報窓口**であり、PersonalStationに次ぐ複雑なデータ要件を持つページです。

### ✅ 現在の状態
- **主要機能**: 内部通報受付、案件管理、調査記録、統計表示
- **対象ユーザー**: 全職員（通報者）+ 管理者（調査員、人事、法務）
- **データソース**: デモモード（`demoWhistleblowingReports`配列）
- **データベース連携**: schema.prismaに実装済み（実データ連携は未実装）

### 🎯 ページの性質

| 特性 | 評価 | 詳細 |
|-----|------|------|
| **ページタイプ** | 完全動的 | 通報フォーム + 管理ダッシュボード |
| **データベース要件** | 🟢 実装済み | WhistleblowingReport + InvestigationNote |
| **新規テーブル** | 不要 | 既存テーブルで対応可能 |
| **新規フィールド** | 🟡 一部必要 | 医療システム連携フィールドの追加検討 |
| **API呼び出し** | 必要 | 通報CRUD、統計取得、権限チェック |
| **医療システム依存** | 🟡 中程度 | 権限情報、重大案件の共有 |

---

## 🔍 詳細分析

### 1. ページ構造と機能分類

WhistleblowingPageは**3つの主要モード**を持ちます：

#### A. 一般職員モード（権限レベル <3）

**表示内容**:
- 新規通報ボタン
- 自分の通報履歴へのリンク
- 緊急連絡先情報

**必要なデータ**:
- ユーザーの基本情報（匿名通報の場合不要）
- 通報カテゴリマスタ

#### B. 管理者モード（権限レベル ≥3）

**表示内容**:
- 統計ダッシュボード（総通報数、調査中、解決済み、平均解決日数）
- 通報一覧（フィルタリング可能）
- 通報詳細（クリック時モーダル表示）
- 調査ノート（機密情報）

**必要なデータ**:
- 全通報データ（権限に応じてフィルタリング）
- 統計データ（集計）
- 調査ノート（高権限のみ）

#### C. 通報フォームモード

**入力項目**:
- カテゴリ（6種類）
- 件名
- 詳細内容
- 匿名性選択
- 連絡方法（記名の場合）
- 証拠の説明（任意）
- 期待する結果（任意）

**送信処理**:
- 匿名ID生成
- データベース保存
- 医療システムへの通知（重大案件のみ）

---

### 2. データフロー分析

#### フロー1: 通報提出（匿名）

```
一般職員
  ↓ 1. フォーム入力
WhistleblowingReportForm
  ↓ 2. handleSubmitReport()
WhistleblowingPage
  ↓ 3. POST /api/whistleblowing/reports
VoiceDrive API
  ↓ 4. WhistleblowingReport.create()
  ├── userId: null
  ├── anonymousId: "ANON-2025-XXXXXX"
  ├── category, severity, title, content
  ├── isAnonymous: true
  └── status: "received"
  ↓ 5. 匿名ID返却
WhistleblowingPage
  ↓ 6. alert(追跡ID表示)
一般職員（IDを記録）
```

**データベースアクセス**: 1回（WhistleblowingReport作成）

---

#### フロー2: 通報提出（記名）

```
一般職員
  ↓ 1. フォーム入力（記名選択）
WhistleblowingReportForm
  ↓ 2. handleSubmitReport()
WhistleblowingPage
  ↓ 3. POST /api/whistleblowing/reports
VoiceDrive API
  ↓ 4. WhistleblowingReport.create()
  ├── userId: currentUser.id
  ├── anonymousId: "ANON-2025-XXXXXX"（内部管理用）
  ├── contactMethod, contactInfo
  └── isAnonymous: false
  ↓ 5. 重要度判定（severity = "critical"）
  ↓ 6. Webhook送信（医療システムへ）
POST /medical-system/api/webhooks/whistleblowing-critical
  ↓ 7. 医療システム側でケース番号発行
  ↓ 8. 受付確認Webhook返信
POST /voicedrive/api/webhooks/whistleblowing-acknowledged
  ↓ 9. VoiceDriveでフラグ更新
WhistleblowingReport.update({
  acknowledgementReceived: true,
  medicalSystemCaseNumber: "MED-2025-0001"
})
```

**データベースアクセス**: 2回（作成1回 + 更新1回）

---

#### フロー3: 管理ダッシュボード表示

```
管理者（Level 3+）
  ↓ 1. /whistleblowing アクセス
WhistleblowingDashboard
  ↓ 2. usePermissions()
  ├── userLevel: 4.0
  └── permissions: { canView: true, canViewStatistics: true }
  ↓ 3. GET /api/whistleblowing/reports?userLevel=4.0
VoiceDrive API
  ↓ 4. 権限フィルタリング
  ├── Level 3-3.9: severity <= "medium"
  ├── Level 4-4.9: severity <= "high"
  └── Level 5+: すべて
  ↓ 5. WhistleblowingReport.findMany()
  ↓ 6. GET /api/whistleblowing/statistics
  ↓ 7. 統計集計（SQL）
  ├── COUNT(GROUP BY status)
  ├── COUNT(GROUP BY severity)
  └── AVG(resolutionDays)
  ↓ 8. データ返却
WhistleblowingDashboard
  ↓ 9. レンダリング
管理者（ダッシュボード表示）
```

**データベースアクセス**: 2回（通報一覧 + 統計）

---

#### フロー4: 調査ノート追加（高権限のみ）

```
調査員（Level 5+）
  ↓ 1. 通報詳細モーダル表示
  ↓ 2. 調査ノート追加フォーム入力
  ↓ 3. POST /api/whistleblowing/reports/{id}/notes
VoiceDrive API
  ↓ 4. 権限チェック（canAccessConfidentialNotes）
  ↓ 5. InvestigationNote.create()
  ├── reportId: "report-xxx"
  ├── authorRole: "legal_counsel"
  ├── authorName: currentUser.name
  ├── content: "法的観点から..."
  ├── isConfidential: true
  └── actionItems: ["弁護士相談", "証拠保全"]
  ↓ 6. WhistleblowingReport.update()
  └── status: "investigating"
```

**データベースアクセス**: 2回（InvestigationNote作成 + WhistleblowingReport更新）

---

### 3. データ要件マトリックス

#### A. WhistleblowingReportテーブル（既存）

| フィールド | 型 | 現在の状態 | 必要な変更 | データ管理責任 | 備考 |
|----------|---|-----------|----------|--------------|------|
| `id` | String | ✅ 実装済み | なし | VoiceDrive | cuid() |
| `userId` | String? | ✅ 実装済み | なし | VoiceDrive | 匿名の場合null |
| `anonymousId` | String | ✅ 実装済み | なし | VoiceDrive | ANON-XXXXXX形式 |
| `category` | String | ✅ 実装済み | なし | VoiceDrive | 6種類 |
| `severity` | String | ✅ 実装済み | なし | VoiceDrive | 4段階 |
| `title` | String | ✅ 実装済み | なし | VoiceDrive | 件名 |
| `content` | String | ✅ 実装済み | なし | VoiceDrive | 詳細内容 |
| `evidenceFiles` | Json? | ✅ 実装済み | なし | VoiceDrive | URL配列 |
| `submittedAt` | DateTime | ✅ 実装済み | なし | VoiceDrive | 提出日時 |
| `updatedAt` | DateTime | ✅ 実装済み | なし | VoiceDrive | 更新日時 |
| `status` | String | ✅ 実装済み | なし | VoiceDrive | 6ステータス |
| `assignedInvestigators` | Json? | ✅ 実装済み | なし | VoiceDrive | 調査員配列 |
| `escalationReason` | String? | ✅ 実装済み | なし | VoiceDrive | エスカレーション理由 |
| `resolutionSummary` | String? | ✅ 実装済み | なし | VoiceDrive | 解決要約 |
| `followUpRequired` | Boolean | ✅ 実装済み | なし | VoiceDrive | フォローアップ要否 |
| `isAnonymous` | Boolean | ✅ 実装済み | なし | VoiceDrive | 匿名フラグ |
| `priority` | Int | ✅ 実装済み | なし | VoiceDrive | 1-10 |
| `medicalSystemCaseNumber` | String? | ✅ 実装済み | なし | 🔵 医療システム | MED-2025-0001形式 |
| `acknowledgementReceived` | Boolean | ✅ 実装済み | なし | VoiceDrive | 受付確認済み |
| `acknowledgementDate` | DateTime? | ✅ 実装済み | なし | VoiceDrive | 受付確認日時 |
| `estimatedResponseTime` | String? | ✅ 実装済み | なし | 🔵 医療システム | "1時間以内"等 |
| `contactMethod` | String? | ✅ 実装済み | なし | VoiceDrive | email/phone/none |
| `contactInfo` | String? | ✅ 実装済み | なし | VoiceDrive | 暗号化推奨 |
| `expectedOutcome` | String? | ✅ 実装済み | なし | VoiceDrive | 期待する結果 |
| `createdAt` | DateTime | ✅ 実装済み | なし | VoiceDrive | 作成日時 |

**評価**: ✅ 必要なフィールドはすべて実装済み（追加不要）

---

#### B. InvestigationNoteテーブル（既存）

| フィールド | 型 | 現在の状態 | 必要な変更 | データ管理責任 | 備考 |
|----------|---|-----------|----------|--------------|------|
| `id` | String | ✅ 実装済み | なし | VoiceDrive | cuid() |
| `reportId` | String | ✅ 実装済み | なし | VoiceDrive | 外部キー |
| `authorRole` | String | ✅ 実装済み | なし | VoiceDrive | 5種類 |
| `authorName` | String | ✅ 実装済み | なし | VoiceDrive | 調査員氏名 |
| `content` | String | ✅ 実装済み | なし | VoiceDrive | ノート内容 |
| `isConfidential` | Boolean | ✅ 実装済み | なし | VoiceDrive | 機密フラグ |
| `actionItems` | Json? | ✅ 実装済み | なし | VoiceDrive | アクション配列 |
| `createdAt` | DateTime | ✅ 実装済み | なし | VoiceDrive | 作成日時 |
| `updatedAt` | DateTime | ✅ 実装済み | なし | VoiceDrive | 更新日時 |

**評価**: ✅ 必要なフィールドはすべて実装済み（追加不要）

---

#### C. Userテーブル（既存、権限チェック用）

| フィールド | 使用目的 | データソース | 備考 |
|----------|---------|------------|------|
| `id` | 通報者識別 | VoiceDrive | 記名通報の場合のみ |
| `name` | 調査ノート作成者名 | 医療システム（キャッシュ） | 表示用 |
| `permissionLevel` | 権限チェック | 医療システム（キャッシュ） | アクセス制御 |
| `accountType` | 権限チェック | 医療システム（キャッシュ） | 管理者判定 |

**評価**: ✅ 既存フィールドで対応可能

---

### 4. 権限レベル別アクセス制御

#### 権限マトリックス

| 機能 | Level 1-2 | Level 3-3.9 | Level 4-4.9 | Level 5+ | 備考 |
|-----|----------|------------|------------|---------|------|
| **通報提出** | ✅ | ✅ | ✅ | ✅ | 全職員可能 |
| **自分の通報閲覧** | ✅ | ✅ | ✅ | ✅ | 匿名IDで追跡 |
| **統計閲覧** | ❌ | ✅ | ✅ | ✅ | 集計値のみ |
| **他人の通報閲覧** | ❌ | 🟡 軽微のみ | 🟡 重要まで | ✅ 全て | severity制限 |
| **調査ノート閲覧** | ❌ | ❌ | ❌ | ✅ | 機密情報 |
| **調査ノート作成** | ❌ | ❌ | ❌ | ✅ | 調査員のみ |
| **ステータス変更** | ❌ | ❌ | 🟡 一部 | ✅ | 案件管理 |
| **エスカレーション** | ❌ | ❌ | ✅ | ✅ | 重大案件対応 |
| **解決・終了** | ❌ | ❌ | ❌ | ✅ | 最終判断 |

#### 重要度別アクセス制限

```typescript
// src/data/demo/whistleblowing.ts (74-79行目)
export const getWhistleblowingPermissions = (userLevel: number) => {
  return {
    canView: userLevel >= 3,
    canInvestigate: userLevel >= 4,
    canResolve: userLevel >= 4
  };
};
```

**現在の実装の問題点**:
- `maxSeverityLevel`が未実装
- 調査ノート閲覧権限（`canAccessConfidentialNotes`）が未実装
- エスカレーション権限（`canEscalate`）が未実装

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
      maxSeverityLevel: 'critical' // すべて閲覧可能
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
      maxSeverityLevel: 'high' // criticalは閲覧不可
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
      maxSeverityLevel: 'medium' // highとcriticalは閲覧不可
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
      maxSeverityLevel: 'low' // 自分の通報のみ
    };
  }
};
```

---

### 5. 医療システム連携要件

#### A. VoiceDrive → 医療システム（Webhook通知）

**通知タイミング**: 重大案件（severity = "critical"）の通報時

**Webhook仕様**:
```typescript
POST /medical-system/api/webhooks/whistleblowing-critical
Headers:
  X-VoiceDrive-Signature: HMAC-SHA256署名
  Content-Type: application/json
Body: {
  eventType: "whistleblowing.critical_report",
  timestamp: "2025-10-27T10:30:00Z",
  data: {
    reportId: "wb-2025-001",
    anonymousId: "ANON-2025-XXXXXX",
    category: "safety",
    severity: "critical",
    title: "医療安全に関する緊急案件",
    content: "[内容は機密のため省略]",
    submittedAt: "2025-10-27T10:30:00Z",
    isAnonymous: true,
    requiresImmediateAction: true
  }
}
```

**医療システム側の処理**:
1. ケース番号発行（MED-2025-XXXX）
2. 担当者アサイン（安全管理者、法務担当等）
3. 受付確認Webhook返信

---

#### B. 医療システム → VoiceDrive（受付確認Webhook）

**Webhook仕様**:
```typescript
POST /voicedrive/api/webhooks/whistleblowing-acknowledged
Headers:
  X-Medical-System-Signature: HMAC-SHA256署名
  Content-Type: application/json
Body: {
  eventType: "whistleblowing.acknowledged",
  timestamp: "2025-10-27T10:35:00Z",
  data: {
    reportId: "wb-2025-001",
    anonymousId: "ANON-2025-XXXXXX",
    medicalSystemCaseNumber: "MED-2025-0001",
    severity: "critical",
    category: "safety",
    receivedAt: "2025-10-27T10:35:00Z",
    estimatedResponseTime: "1時間以内",
    requiresImmediateAction: true,
    currentStatus: "専門チームが調査を開始しました",
    nextSteps: "安全管理者が24時間以内に初期対応を実施します"
  }
}
```

**VoiceDrive側の処理**:
```typescript
// WhistleblowingReport更新
await prisma.whistleblowingReport.update({
  where: { id: data.reportId },
  data: {
    acknowledgementReceived: true,
    acknowledgementDate: new Date(data.receivedAt),
    medicalSystemCaseNumber: data.medicalSystemCaseNumber,
    estimatedResponseTime: data.estimatedResponseTime
  }
});
```

---

#### C. 医療システム → VoiceDrive（進捗更新Webhook）

**Webhook仕様**:
```typescript
POST /voicedrive/api/webhooks/whistleblowing-progress-updated
Headers:
  X-Medical-System-Signature: HMAC-SHA256署名
  Content-Type: application/json
Body: {
  eventType: "whistleblowing.progress_updated",
  timestamp: "2025-10-30T15:00:00Z",
  data: {
    reportId: "wb-2025-001",
    medicalSystemCaseNumber: "MED-2025-0001",
    newStatus: "resolved",
    resolutionSummary: "適切な是正措置を実施しました。再発防止策を展開中です。",
    resolvedAt: "2025-10-30T15:00:00Z",
    followUpRequired: true,
    followUpDate: "2025-11-30"
  }
}
```

---

### 6. API設計

#### API 1: 通報提出

**エンドポイント**: `POST /api/whistleblowing/reports`

**リクエスト**:
```http
POST /api/whistleblowing/reports
Authorization: Bearer {jwt_token}  # 記名の場合のみ
Content-Type: application/json
```

```json
{
  "category": "safety",
  "title": "医療安全に関する懸念",
  "content": "詳細内容...",
  "isAnonymous": true,
  "contactMethod": "none",
  "evidenceDescription": "関連する文書があります",
  "expectedOutcome": "適切な改善措置を期待します"
}
```

**レスポンス**:
```json
{
  "success": true,
  "reportId": "wb-2025-001",
  "anonymousId": "ANON-2025-A1B2C3",
  "message": "通報を受け付けました。追跡IDを大切に保管してください。",
  "estimatedResponseTime": "3営業日以内"
}
```

---

#### API 2: 通報一覧取得（管理者用）

**エンドポイント**: `GET /api/whistleblowing/reports`

**リクエスト**:
```http
GET /api/whistleblowing/reports?status=investigating&page=1&limit=20
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "reports": [
    {
      "id": "wb-2025-001",
      "anonymousId": "ANON-2025-A1B2C3",
      "category": "safety",
      "severity": "high",
      "title": "医療安全に関する懸念",
      "content": "[権限に応じて一部マスキング]",
      "status": "investigating",
      "submittedAt": "2025-10-27T10:30:00Z",
      "assignedInvestigators": ["safety_officer", "management"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 45,
    "totalPages": 3
  },
  "filters": {
    "status": "investigating",
    "userLevel": 4.0,
    "maxSeverity": "high"
  }
}
```

---

#### API 3: 統計取得

**エンドポイント**: `GET /api/whistleblowing/statistics`

**リクエスト**:
```http
GET /api/whistleblowing/statistics?period=last30days
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "totalReports": 15,
  "byCategory": {
    "harassment": 3,
    "safety": 5,
    "financial": 2,
    "compliance": 3,
    "discrimination": 1,
    "other": 1
  },
  "byStatus": {
    "received": 2,
    "triaging": 3,
    "investigating": 5,
    "escalated": 1,
    "resolved": 3,
    "closed": 1
  },
  "bySeverity": {
    "low": 3,
    "medium": 7,
    "high": 4,
    "critical": 1
  },
  "averageResolutionDays": 14.5,
  "escalationRate": 6.7,
  "monthlyTrend": [
    { "month": "2025-08", "count": 12, "resolved": 10 },
    { "month": "2025-09", "count": 18, "resolved": 15 },
    { "month": "2025-10", "count": 15, "resolved": 8 }
  ]
}
```

---

#### API 4: 調査ノート追加（高権限のみ）

**エンドポイント**: `POST /api/whistleblowing/reports/{reportId}/notes`

**リクエスト**:
```http
POST /api/whistleblowing/reports/wb-2025-001/notes
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "authorRole": "legal_counsel",
  "content": "法的観点から検討しました。証拠保全が必要です。",
  "isConfidential": true,
  "actionItems": [
    "弁護士相談を実施",
    "関連証拠の保全",
    "関係者へのヒアリング実施"
  ]
}
```

**レスポンス**:
```json
{
  "success": true,
  "noteId": "note-2025-001",
  "reportId": "wb-2025-001",
  "createdAt": "2025-10-27T14:00:00Z"
}
```

---

### 7. セキュリティとプライバシー

#### A. 匿名性の保護

**匿名ID生成ロジック**:
```typescript
// 推奨実装
function generateAnonymousId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('base64url'); // URL-safeなBase64
  const hash = crypto.createHash('sha256')
    .update(`${timestamp}-${random}-${process.env.SECRET_SALT}`)
    .digest('base64url')
    .substring(0, 6);

  return `ANON-${new Date().getFullYear()}-${hash.toUpperCase()}`;
}

// 例: ANON-2025-A1B2C3
```

**匿名性保証**:
- `userId`をnullに設定（匿名通報の場合）
- IPアドレスをログに記録しない
- ブラウザフィンガープリントを記録しない
- 匿名IDからユーザーを逆引きできない設計
- 調査ノートに通報者情報を記載しない

---

#### B. 連絡先情報の暗号化

**推奨実装**:
```typescript
import crypto from 'crypto';

// 暗号化（保存時）
function encryptContactInfo(contactInfo: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32バイトキー
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(contactInfo, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // IV + 暗号文 + 認証タグを連結して保存
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

// 復号化（閲覧時）
function decryptContactInfo(encryptedData: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

  const [ivHex, encryptedHex, authTagHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**データベース保存例**:
```typescript
// 通報提出時
const encryptedContact = contactInfo
  ? encryptContactInfo(contactInfo)
  : null;

await prisma.whistleblowingReport.create({
  data: {
    // ...
    contactInfo: encryptedContact,
    // ...
  }
});

// 閲覧時（高権限のみ）
if (hasPermission && report.contactInfo) {
  report.contactInfo = decryptContactInfo(report.contactInfo);
}
```

---

#### C. アクセス監査ログ

**推奨実装**: WhistleblowingAccessLogテーブル（新規）

```prisma
model WhistleblowingAccessLog {
  id         String   @id @default(cuid())
  reportId   String
  userId     String
  action     String   // viewed, note_added, status_changed, escalated, resolved
  accessedAt DateTime @default(now())
  ipAddress  String?
  userAgent  String?

  user   User                 @relation("WhistleblowingAccessUser", fields: [userId], references: [id])
  report WhistleblowingReport @relation("ReportAccessLogs", fields: [reportId], references: [id])

  @@index([reportId])
  @@index([userId])
  @@index([accessedAt])
  @@map("whistleblowing_access_logs")
}
```

**用途**:
- 機密情報へのアクセス追跡
- 不正アクセスの検知
- 監査証跡の保持
- コンプライアンス対応

---

### 8. データベーススキーマの検証

#### 現在のスキーマ（prisma/schema.prisma 2921-2986行目）

```prisma
model WhistleblowingReport {
  id                      String   @id @default(cuid())
  userId                  String?  // 匿名通報の場合null
  anonymousId             String   // ANON-XXXXXX形式
  category                String   // harassment, safety, financial, compliance, discrimination, other
  severity                String   @default("medium") // low, medium, high, critical
  title                   String
  content                 String
  evidenceFiles           Json?    // 証拠ファイルURL配列
  submittedAt             DateTime @default(now())
  updatedAt               DateTime @updatedAt
  status                  String   @default("received") // received, triaging, investigating, escalated, resolved, closed
  assignedInvestigators   Json?    // 調査員役割の配列
  escalationReason        String?
  resolutionSummary       String?
  followUpRequired        Boolean  @default(false)
  isAnonymous             Boolean  @default(true)
  priority                Int      @default(5) // 1-10

  // 医療システム連携
  medicalSystemCaseNumber String?
  acknowledgementReceived Boolean  @default(false)
  acknowledgementDate     DateTime?
  estimatedResponseTime   String?

  // 連絡先情報
  contactMethod           String?  // email, phone, none
  contactInfo             String?  // 暗号化保存推奨
  expectedOutcome         String?

  createdAt               DateTime @default(now())

  // リレーション
  user                    User?              @relation("WhistleblowingReports", fields: [userId], references: [id])
  investigationNotes      InvestigationNote[] @relation("ReportInvestigationNotes")

  @@index([userId])
  @@index([anonymousId])
  @@index([category])
  @@index([status])
  @@index([severity])
  @@map("whistleblowing_reports")
}

model InvestigationNote {
  id             String   @id @default(cuid())
  reportId       String
  authorRole     String   // hr_specialist, legal_counsel, safety_officer, external_expert, management
  authorName     String
  content        String
  isConfidential Boolean  @default(true)
  actionItems    Json?    // アクションアイテム配列
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // リレーション
  report WhistleblowingReport @relation("ReportInvestigationNotes", fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@index([createdAt])
  @@map("investigation_notes")
}
```

**評価**:
- ✅ **基本要件をすべて満たしている**
- ✅ 医療システム連携フィールドが実装済み
- ✅ 匿名性保護の設計が適切
- 🟡 アクセス監査ログは未実装（追加推奨）
- 🟡 `evidenceDescription`フィールドが未実装（ReportSubmissionFormで使用）

---

### 9. 不足項目と推奨対応

#### A. 不足フィールド

**1. `evidenceDescription` フィールド**

**現状**: ReportSubmissionFormで入力されるが、データベースに保存されていない

**問題点**:
```typescript
// WhistleblowingReportForm.tsx (193-200行目)
<textarea
  value={formData.evidenceDescription || ''}
  onChange={(e) => handleInputChange('evidenceDescription', e.target.value)}
  placeholder="関連する証拠がある場合は、その内容を記載してください..."
/>
```

しかし、schema.prismaには`evidenceDescription`フィールドが存在しない。

**推奨対応**:
```prisma
model WhistleblowingReport {
  // ... 既存フィールド
  evidenceFiles       Json?    // 証拠ファイルURL配列
  evidenceDescription String?  // 🆕 証拠の説明（テキスト）
  // ...
}
```

---

#### B. 不足テーブル

**1. WhistleblowingAccessLog（監査ログ）**

**目的**: 機密情報へのアクセス追跡

**推奨スキーマ**:
```prisma
model WhistleblowingAccessLog {
  id         String   @id @default(cuid())
  reportId   String
  userId     String
  action     String   // viewed, note_added, status_changed, escalated, resolved
  details    String?  // アクション詳細
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

---

#### C. User リレーションの追加

**現状**: Userモデルに`WhistleblowingAccessLog`へのリレーションが未定義

**推奨追加**:
```prisma
model User {
  // ... 既存フィールド

  // 内部通報関連
  whistleblowingReports     WhistleblowingReport[]    @relation("WhistleblowingReports")
  whistleblowingAccessLogs  WhistleblowingAccessLog[] @relation("WhistleblowingAccessUser") // 🆕
}
```

---

### 10. 3ページ比較マトリックス

| 項目 | NotFoundPage | UnauthorizedPage | WhistleblowingPage |
|-----|-------------|-----------------|-------------------|
| **ページタイプ** | 完全静的 | 半動的 | 完全動的 |
| **主要機能** | エラー表示 | 権限エラー表示 | 通報受付+管理 |
| **ユーザー情報表示** | なし | 権限レベルのみ | 記名時は全情報 |
| **既存テーブル使用** | なし | User | WhistleblowingReport + InvestigationNote + User |
| **新規テーブル追加** | 不要 | 不要 | 🟡 1件推奨（AccessLog） |
| **新規フィールド追加** | 不要 | 不要 | 🟡 1件推奨（evidenceDescription） |
| **API呼び出し** | なし | 間接的（認証時） | 4件（CRUD、統計） |
| **医療システム依存** | なし | 低（権限情報のみ） | 🟡 中程度（重大案件共有） |
| **Webhook通知** | なし | なし | 🟡 2件（重大案件、進捗更新） |
| **実装状態** | 完成 | デモモード実装済み | 🟡 部分実装（デモモード） |
| **セキュリティ要件** | 低 | 低 | 🔴 高（匿名性、暗号化） |
| **実装工数** | 0日（完成） | 3週間（認証含む） | 🟠 4-5週間 |

---

## 📊 実装要件サマリー

### Phase 1: スキーマ更新（1日）

#### 必須変更

```prisma
// prisma/schema.prisma

model WhistleblowingReport {
  // ... 既存フィールド
  evidenceDescription String?  // 🆕 追加

  // リレーション追加
  accessLogs WhistleblowingAccessLog[] @relation("ReportAccessLogs") // 🆕
}

// 🆕 新規テーブル
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

model User {
  // ... 既存フィールド

  // リレーション追加
  whistleblowingAccessLogs WhistleblowingAccessLog[] @relation("WhistleblowingAccessUser") // 🆕
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add-whistleblowing-evidence-description-and-access-logs
```

---

### Phase 2: 権限管理の強化（3日）

#### A. 権限チェック関数の実装

**ファイル**: `src/data/demo/whistleblowing.ts`

**現在の問題点**:
```typescript
// 現在の実装（74-79行目）
export const getWhistleblowingPermissions = (userLevel: number) => {
  return {
    canView: userLevel >= 3,
    canInvestigate: userLevel >= 4,
    canResolve: userLevel >= 4
  };
};
```

**推奨実装** (前述のセクション4参照):
- `maxSeverityLevel`の追加
- `canAccessConfidentialNotes`の追加
- `canEscalate`の追加
- `canAssignInvestigators`の追加
- `canViewStatistics`の追加

---

#### B. フィルタリングロジックの実装

**ファイル**: `src/components/whistleblowing/WhistleblowingDashboard.tsx`

**現在の実装** (19-33行目):
```typescript
const getVisibleReports = () => {
  return demoWhistleblowingReports.filter(report => {
    if (!permissions.canView) return false;

    // 重要度による制限
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const maxLevel = severityLevels[permissions.maxSeverityLevel];
    const reportLevel = severityLevels[report.severity];

    return reportLevel <= maxLevel;
  }).filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });
};
```

**評価**: ✅ 基本ロジックは実装済み（デモデータで動作確認可能）

---

### Phase 3: API実装（1週間）

#### 必要なAPI

| API | メソッド | エンドポイント | 権限 | 工数 |
|-----|---------|---------------|------|------|
| 通報提出 | POST | `/api/whistleblowing/reports` | 全職員 | 1日 |
| 通報一覧取得 | GET | `/api/whistleblowing/reports` | Level 3+ | 1日 |
| 通報詳細取得 | GET | `/api/whistleblowing/reports/:id` | Level 3+ | 0.5日 |
| 統計取得 | GET | `/api/whistleblowing/statistics` | Level 3+ | 1日 |
| 調査ノート追加 | POST | `/api/whistleblowing/reports/:id/notes` | Level 5+ | 0.5日 |
| ステータス更新 | PATCH | `/api/whistleblowing/reports/:id/status` | Level 4+ | 0.5日 |
| 匿名ID検索 | GET | `/api/whistleblowing/reports/by-anonymous/:id` | 通報者本人 | 0.5日 |

**合計工数**: 5日

---

### Phase 4: 医療システム連携（1週間）

#### A. Webhook送信（VD → 医療システム）

**トリガー**: 重大案件（severity = "critical"）の通報時

**実装ファイル**: `src/api/whistleblowing/reports.ts`

```typescript
// 通報提出API内
if (report.severity === 'critical') {
  // 医療システムへWebhook送信
  await sendWebhookToMedicalSystem({
    eventType: 'whistleblowing.critical_report',
    data: {
      reportId: report.id,
      anonymousId: report.anonymousId,
      category: report.category,
      severity: report.severity,
      title: report.title,
      submittedAt: report.submittedAt,
      requiresImmediateAction: true
    }
  });
}
```

**工数**: 2日

---

#### B. Webhook受信（医療システム → VD）

**エンドポイント**: `POST /api/webhooks/whistleblowing-acknowledged`

**処理内容**:
1. 署名検証
2. WhistleblowingReport更新（medicalSystemCaseNumber等）
3. 通報者への通知（匿名IDベース）

**工数**: 2日

---

#### C. 進捗更新Webhook受信

**エンドポイント**: `POST /api/webhooks/whistleblowing-progress-updated`

**処理内容**:
1. 署名検証
2. WhistleblowingReport更新（status, resolutionSummary等）
3. 通報者への通知

**工数**: 1日

---

### Phase 5: セキュリティ強化（3日）

#### A. 連絡先情報の暗号化

**実装内容**:
- 暗号化ライブラリの選定（crypto標準モジュール）
- 暗号化/復号化関数の実装
- 環境変数（ENCRYPTION_KEY）の設定
- 既存データのマイグレーション

**工数**: 1.5日

---

#### B. アクセス監査ログの実装

**実装内容**:
- WhistleblowingAccessLogテーブルの作成
- API各エンドポイントでのログ記録
- 監査ログ閲覧API（Level 5+のみ）
- ログ保持期間ポリシーの設定

**工数**: 1.5日

---

### Phase 6: フロントエンド改修（5日）

#### A. デモモードから実データへの切り替え

**現在の問題点**:
- `demoWhistleblowingReports`配列をハードコード使用
- `demoReportStatistics`をハードコード使用
- API呼び出しが未実装（console.logのみ）

**必要な変更**:

**1. WhistleblowingPage.tsx (19-28行目)**

**現在**:
```typescript
const handleSubmitReport = (report: ReportSubmissionForm) => {
  // 実際の実装では、ここでAPIにデータを送信
  console.log('新しい相談:', report);

  // 匿名IDを生成（実際はサーバーサイドで生成）
  const anonymousId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  alert(`相談が正常に提出されました。\n\n追跡ID: ${anonymousId}\n\nこのIDは進捗確認に使用できます。大切に保管してください。`);
  setShowReportForm(false);
};
```

**将来**:
```typescript
const handleSubmitReport = async (report: ReportSubmissionForm) => {
  try {
    const response = await fetch('/api/whistleblowing/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error('通報の提出に失敗しました');
    }

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

**2. WhistleblowingDashboard.tsx (5行目、19-35行目)**

**現在**:
```typescript
import { demoWhistleblowingReports, demoReportStatistics, getWhistleblowingPermissions } from '../../data/demo/whistleblowing';

// ...

const getVisibleReports = () => {
  return demoWhistleblowingReports.filter(/* ... */);
};
```

**将来**:
```typescript
import { getWhistleblowingPermissions } from '../../data/demo/whistleblowing';
import { useState, useEffect } from 'react';

const WhistleblowingDashboard: React.FC<WhistleblowingDashboardProps> = ({ onNewReport }) => {
  const { userLevel } = usePermissions();
  const permissions = getWhistleblowingPermissions(userLevel);

  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportsAndStatistics();
  }, [userLevel, filterStatus]);

  const fetchReportsAndStatistics = async () => {
    try {
      setIsLoading(true);

      // 通報一覧取得
      const reportsResponse = await fetch(`/api/whistleblowing/reports?status=${filterStatus}`);
      const reportsData = await reportsResponse.json();
      setReports(reportsData.reports);

      // 統計取得
      if (permissions.canViewStatistics) {
        const statsResponse = await fetch('/api/whistleblowing/statistics');
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibleReports = () => {
    return reports.filter(report => {
      if (!permissions.canView) return false;

      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const maxLevel = severityLevels[permissions.maxSeverityLevel];
      const reportLevel = severityLevels[report.severity];

      return reportLevel <= maxLevel;
    });
  };

  // ... 残りのコード
};
```

**工数**: 3日

---

#### B. 調査ノート機能の実装

**現在の状態**: 表示のみ（追加機能なし）

**推奨追加**: 調査ノート追加フォーム（Level 5+のみ）

**工数**: 2日

---

### Phase 7: テストとデバッグ（1週間）

#### テスト項目

| テスト種別 | 内容 | 工数 |
|----------|------|------|
| 単体テスト | API各エンドポイント | 2日 |
| 統合テスト | Webhook連携 | 1日 |
| 権限テスト | レベル別アクセス制御 | 1日 |
| セキュリティテスト | 暗号化、匿名性保護 | 1日 |
| E2Eテスト | ユーザーシナリオ | 1日 |
| パフォーマンステスト | 大量データ処理 | 1日 |

**合計工数**: 7日

---

## 📅 実装タイムライン

### 全体工数: 4-5週間

| Phase | 内容 | 工数 | 依存関係 |
|-------|------|------|---------|
| Phase 1 | スキーマ更新 | 1日 | なし |
| Phase 2 | 権限管理強化 | 3日 | Phase 1 |
| Phase 3 | API実装 | 5日 | Phase 1, 2 |
| Phase 4 | 医療システム連携 | 5日 | Phase 3 |
| Phase 5 | セキュリティ強化 | 3日 | Phase 3 |
| Phase 6 | フロントエンド改修 | 5日 | Phase 3 |
| Phase 7 | テストとデバッグ | 7日 | すべて |

**クリティカルパス**: Phase 1 → Phase 2 → Phase 3 → Phase 6 → Phase 7

**並行実行可能**: Phase 4とPhase 5（Phase 3完了後）

---

## ✅ チェックリスト

### 現在の実装確認（デモモード）

- [x] WhistleblowingPageコンポーネントが存在する
- [x] WhistleblowingReportFormが動作する
- [x] WhistleblowingDashboardが表示される
- [x] 権限レベル別の表示制御がある（基本実装）
- [x] デモデータで通報一覧が表示される
- [x] デモデータで統計が表示される
- [x] 通報詳細モーダルが機能する
- [x] 調査ノートが表示される（デモデータ）

### データベース作業

- [x] WhistleblowingReportテーブルが存在する（schema.prisma 2921-2965行目）
- [x] InvestigationNoteテーブルが存在する（schema.prisma 2969-2986行目）
- [ ] **🟡 evidenceDescriptionフィールドを追加**（推奨）
- [ ] **🟡 WhistleblowingAccessLogテーブルを追加**（推奨）
- [ ] マイグレーション実行

### API実装

- [ ] POST /api/whistleblowing/reports（通報提出）
- [ ] GET /api/whistleblowing/reports（一覧取得）
- [ ] GET /api/whistleblowing/reports/:id（詳細取得）
- [ ] GET /api/whistleblowing/statistics（統計取得）
- [ ] POST /api/whistleblowing/reports/:id/notes（ノート追加）
- [ ] PATCH /api/whistleblowing/reports/:id/status（ステータス更新）
- [ ] GET /api/whistleblowing/reports/by-anonymous/:id（匿名ID検索）

### 医療システム連携

- [ ] Webhook送信（重大案件）: VD → 医療システム
- [ ] Webhook受信（受付確認）: 医療システム → VD
- [ ] Webhook受信（進捗更新）: 医療システム → VD
- [ ] Webhook署名検証の実装
- [ ] リトライ機能の実装
- [ ] エラーハンドリング

### セキュリティ

- [ ] 匿名ID生成ロジックの実装
- [ ] 連絡先情報の暗号化
- [ ] アクセス監査ログの記録
- [ ] 権限チェックの厳格化
- [ ] IPアドレス・フィンガープリントの非記録

### フロントエンド改修

- [ ] WhistleblowingPage: API呼び出しに変更
- [ ] WhistleblowingDashboard: デモデータからAPI取得に変更
- [ ] 調査ノート追加フォームの実装
- [ ] エラーハンドリングの改善
- [ ] ローディング状態の表示
- [ ] レスポンシブデザインの確認

### テスト

- [ ] 単体テスト（API）
- [ ] 統合テスト（Webhook）
- [ ] 権限テスト
- [ ] セキュリティテスト
- [ ] E2Eテスト
- [ ] パフォーマンステスト

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [UnauthorizedPage_DB要件分析_20251027.md](./UnauthorizedPage_DB要件分析_20251027.md)

---

## 📌 まとめ

### WhistleblowingPageの特徴

1. **複雑な権限管理**: レベル別・重要度別の多層アクセス制御
2. **高セキュリティ要件**: 匿名性保護、暗号化、監査ログ
3. **医療システム連携**: 重大案件の共有、進捗更新
4. **デュアルモード**: 一般職員（通報）+ 管理者（調査）
5. **スキーマ完成度**: 既存テーブルで80%カバー（一部追加推奨）

### 他ページとの比較

| 要素 | NotFoundPage | UnauthorizedPage | PersonalStation | WhistleblowingPage |
|-----|-------------|-----------------|----------------|-------------------|
| **複雑度** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **新規テーブル** | 0件 | 0件 | 2件 | 🟡 1件推奨 |
| **新規フィールド** | 0件 | 0件 | 1件 | 🟡 1件推奨 |
| **API数** | 0件 | 間接1件 | 5件 | 7件 |
| **Webhook** | 0件 | 0件 | 4件 | 3件 |
| **セキュリティ** | 低 | 低 | 中 | 🔴 高 |
| **実装工数** | 0日 | 3週間 | 6週間 | 🟠 4-5週間 |

### 最終結論

**WhistleblowingPageは既存のデータベーススキーマで基本機能を実装可能ですが、セキュリティとコンプライアンスの観点から以下の追加を強く推奨します：**

1. **必須**: `evidenceDescription`フィールドの追加
2. **推奨**: `WhistleblowingAccessLog`テーブルの追加（監査証跡）
3. **必須**: 連絡先情報の暗号化
4. **推奨**: 医療システム連携（重大案件のみ）

現在はデモモードで基本UI/UXが実装済みであり、実データ対応のための基盤は整っています。

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
次回レビュー: 実装開始時
