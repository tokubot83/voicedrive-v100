# 投票設定変更履歴ページ 暫定マスターリスト

**文書番号**: API-LIST-2025-1021-004
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**対象**: 投票設定変更履歴ページ（/admin/voting-settings/history）
**作成者**: VoiceDriveチーム

---

## 📋 エグゼクティブサマリー

### 対象ページ
- **URL**: `/admin/voting-settings/history`
- **機能**: 投票設定（議題モード・プロジェクトモード）の変更履歴を時系列で表示

### 重要な結論

| 項目 | 状態 | 詳細 |
|------|------|------|
| **データ管理責任** | 🟢 VoiceDrive 100% | 医療システムは関与しない |
| **DB実装** | 🔴 未実装 | VotingSettingChangeLogテーブルが必要 |
| **API実装** | ⏳ 要実装 | 4つのエンドポイントを新規実装 |
| **既存API統合** | 🔴 必要 | 設定変更API に自動ログ記録を追加 |
| **医療システム連携** | ❌ 不要 | VoiceDrive独自の監査ログ |

---

## 1. 必要なテーブル

### 1.1 新規テーブル: `VotingSettingChangeLog`

**目的**: 投票設定の変更履歴を記録

**スキーマ**:
```prisma
model VotingSettingChangeLog {
  id                  String    @id @default(cuid())

  // 変更基本情報
  mode                String    // 'agenda' | 'project' | 'both'
  category            String    // 変更カテゴリ
  subcategory         String?   // サブカテゴリ（詳細分類）

  // 変更内容
  changeDescription   String    @db.Text  // 変更内容の説明
  impactDescription   String?   @db.Text  // 影響範囲の説明

  // 変更前後の値（JSON）
  beforeValue         Json?     // 変更前の設定値
  afterValue          Json?     // 変更後の設定値

  // 変更者情報
  changedBy           String    // 変更者ユーザーID
  changedByLevel      Decimal   // 変更時の権限レベル
  changedAt           DateTime  @default(now())

  // ステータス
  status              String    @default("active")  // 'active' | 'reverted' | 'superseded'
  revertedAt          DateTime?
  revertedBy          String?
  revertReason        String?   @db.Text

  // 関連エンティティ
  relatedEntityType   String?   // 'VotingGroup' | 'AgendaModeConfig' | 'ProjectModeConfig'
  relatedEntityId     String?   // 関連エンティティのID

  // メタデータ
  metadata            Json?     // 追加情報（影響人数、関連部署など）

  // Relations
  user                User      @relation("SettingChangeUser", fields: [changedBy], references: [id])
  revertedByUser      User?     @relation("SettingRevertUser", fields: [revertedBy], references: [id])

  @@index([changedAt])
  @@index([mode])
  @@index([category])
  @@index([changedBy])
  @@index([status])
  @@index([mode, changedAt])
  @@index([relatedEntityType, relatedEntityId])
  @@map("voting_setting_change_logs")
}
```

**主要フィールド説明**:

| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| `mode` | String | 変更モード | "agenda", "project", "both" |
| `category` | String | 変更カテゴリ | "voting_scope_setting", "voting_group_management" |
| `subcategory` | String? | サブカテゴリ | "pattern_change", "group_created" |
| `changeDescription` | String | 変更内容 | "看護部-看護科の投票パターンをパターンCからパターンAに変更" |
| `impactDescription` | String? | 影響範囲 | "約80名に影響" |
| `beforeValue` | Json? | 変更前の値 | {"votingPattern": "C", ...} |
| `afterValue` | Json? | 変更後の値 | {"votingPattern": "A", ...} |
| `changedBy` | String | 変更者ID | "user_abc123" |
| `changedByLevel` | Decimal | 変更者権限 | 99 |
| `status` | String | ステータス | "active", "reverted", "superseded" |

---

### 1.2 Userモデル更新

**追加が必要なRelation**:

```prisma
model User {
  // ... 既存フィールド

  // 🆕 投票設定変更履歴 Relations
  settingChanges      VotingSettingChangeLog[]  @relation("SettingChangeUser")
  settingReverts      VotingSettingChangeLog[]  @relation("SettingRevertUser")
}
```

---

### 1.3 カテゴリ定義

#### 議題モード (`mode: 'agenda'`)

| カテゴリ | 値 | 説明 |
|---------|---|------|
| 投票スコープ設定 | `voting_scope_setting` | パターンA/B/C変更 |
| 投票グループ管理 | `voting_group_management` | グループ作成・編集・削除 |
| 主承認者設定 | `primary_approver_setting` | 承認者・ローテーション変更 |
| 委員会提出設定 | `committee_submission_setting` | 委員会提出閾値変更 |
| 議題昇格閾値設定 | `agenda_threshold_setting` | 部署議題・施設議題の閾値変更 |

#### プロジェクトモード (`mode: 'project'`)

| カテゴリ | 値 | 説明 |
|---------|---|------|
| チーム編成ルール | `team_formation_rule` | 推奨サイズ・多様性要件変更 |
| プロジェクト化閾値 | `project_threshold_setting` | 施設・法人プロジェクト化閾値 |
| 進捗管理設定 | `progress_management_setting` | レポート頻度・マイルストーン設定 |
| リソース配分ルール | `resource_allocation_rule` | 予算・人員配分ルール |
| マイルストーン設定 | `milestone_setting` | デフォルトマイルストーン定義 |

---

## 2. 必要なAPI一覧

### 2.1 VoiceDrive内部API（新規実装必要）

#### API-1: 変更履歴一覧取得

**エンドポイント**: `GET /api/voting-settings/change-logs`

**目的**: 変更履歴の一覧を取得（統計情報含む）

**リクエスト**:
```http
GET /api/voting-settings/change-logs?mode=all&page=1&limit=50
Authorization: Bearer {jwt_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 | デフォルト |
|-----------|---|------|------|----------|
| `mode` | string | ❌ | フィルタモード: "all", "agenda", "project" | "all" |
| `page` | number | ❌ | ページ番号 | 1 |
| `limit` | number | ❌ | 1ページあたりの件数 | 50 |
| `startDate` | string | ❌ | 開始日（ISO 8601） | - |
| `endDate` | string | ❌ | 終了日（ISO 8601） | - |
| `category` | string | ❌ | カテゴリフィルタ | - |

**レスポンス**:
```json
{
  "logs": [
    {
      "id": "LOG-2025-001",
      "date": "2025-10-13T14:30:00Z",
      "mode": "agenda",
      "modeLabel": "議題モード",
      "category": "投票スコープ設定",
      "user": "山田 太郎",
      "userLevel": 99,
      "action": "看護部-看護科の投票パターンをパターンCからパターンAに変更",
      "impact": "約80名に影響",
      "status": "active"
    },
    {
      "id": "LOG-2025-002",
      "date": "2025-10-11T10:20:00Z",
      "mode": "agenda",
      "modeLabel": "議題モード",
      "category": "投票グループ管理",
      "user": "山田 太郎",
      "userLevel": 99,
      "action": "「小規模事務部門グループ」を新規作成（総務科、経理科、人事科）",
      "impact": "22名が新グループに統合",
      "status": "active"
    }
  ],
  "statistics": {
    "totalCount": 6,
    "agendaModeCount": 4,
    "projectModeCount": 2
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

**データベース操作**:
```typescript
const where: Prisma.VotingSettingChangeLogWhereInput = {
  status: 'active',
};

// モードフィルタ
if (mode && mode !== 'all') {
  where.mode = mode;
}

// 日付フィルタ
if (startDate || endDate) {
  where.changedAt = {
    gte: startDate ? new Date(startDate) : undefined,
    lte: endDate ? new Date(endDate) : undefined,
  };
}

// カテゴリフィルタ
if (category) {
  where.category = category;
}

const [logs, totalCount] = await prisma.$transaction([
  prisma.votingSettingChangeLog.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          permissionLevel: true,
        },
      },
    },
    orderBy: {
      changedAt: 'desc',
    },
    skip: (page - 1) * limit,
    take: limit,
  }),
  prisma.votingSettingChangeLog.count({ where }),
]);

// 統計計算
const agendaModeCount = await prisma.votingSettingChangeLog.count({
  where: { ...where, mode: 'agenda' },
});

const projectModeCount = await prisma.votingSettingChangeLog.count({
  where: { ...where, mode: 'project' },
});
```

**実装ファイル**: `src/app/api/voting-settings/change-logs/route.ts`

**実装優先度**: 🔴 **高** - ページ表示に必須

**予定工数**: 1日

---

#### API-2: 変更履歴詳細取得

**エンドポイント**: `GET /api/voting-settings/change-logs/{logId}`

**目的**: 特定の変更履歴の詳細を取得

**リクエスト**:
```http
GET /api/voting-settings/change-logs/LOG-2025-001
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "id": "LOG-2025-001",
  "mode": "agenda",
  "modeLabel": "議題モード",
  "category": "投票スコープ設定",
  "subcategory": "パターン変更",
  "changeDescription": "看護部-看護科の投票パターンをパターンCからパターンAに変更",
  "impactDescription": "約80名に影響",
  "beforeValue": {
    "departmentId": "DEPT-001",
    "departmentName": "看護部-看護科",
    "votingPattern": "C",
    "votingPatternLabel": "パターンC（部署全体）"
  },
  "afterValue": {
    "departmentId": "DEPT-001",
    "departmentName": "看護部-看護科",
    "votingPattern": "A",
    "votingPatternLabel": "パターンA（配置単位）"
  },
  "changedBy": {
    "id": "user_abc123",
    "name": "山田 太郎",
    "permissionLevel": 99
  },
  "changedAt": "2025-10-13T14:30:00Z",
  "status": "active",
  "relatedEntity": {
    "type": "AgendaModeConfig",
    "id": "CONFIG-001"
  },
  "metadata": {
    "affectedUserCount": 80,
    "affectedDepartments": ["看護部-看護科"],
    "changeReason": "配置場所ごとの意見を反映するため"
  }
}
```

**データベース操作**:
```typescript
const log = await prisma.votingSettingChangeLog.findUnique({
  where: { id: logId },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        permissionLevel: true,
      },
    },
    revertedByUser: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

if (!log) {
  throw new Error('Change log not found');
}
```

**実装ファイル**: `src/app/api/voting-settings/change-logs/[logId]/route.ts`

**実装優先度**: 🟡 **中** - 詳細モーダル表示用

**予定工数**: 0.5日

---

#### API-3: 変更履歴記録（内部API）

**エンドポイント**: `POST /api/voting-settings/change-logs`

**目的**: 設定変更時に自動的に履歴を記録

**リクエスト**:
```http
POST /api/voting-settings/change-logs
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "mode": "agenda",
  "category": "voting_scope_setting",
  "subcategory": "pattern_change",
  "changeDescription": "看護部-看護科の投票パターンをパターンCからパターンAに変更",
  "impactDescription": "約80名に影響",
  "beforeValue": {
    "departmentId": "DEPT-001",
    "votingPattern": "C"
  },
  "afterValue": {
    "departmentId": "DEPT-001",
    "votingPattern": "A"
  },
  "relatedEntityType": "AgendaModeConfig",
  "relatedEntityId": "CONFIG-001",
  "metadata": {
    "affectedUserCount": 80,
    "affectedDepartments": ["看護部-看護科"],
    "changeReason": "配置場所ごとの意見を反映するため"
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "logId": "LOG-2025-001",
  "createdAt": "2025-10-13T14:30:00Z"
}
```

**データベース操作**:
```typescript
const log = await prisma.votingSettingChangeLog.create({
  data: {
    mode,
    category,
    subcategory,
    changeDescription,
    impactDescription,
    beforeValue,
    afterValue,
    changedBy: userId,
    changedByLevel: user.permissionLevel,
    status: 'active',
    relatedEntityType,
    relatedEntityId,
    metadata,
  },
});
```

**呼び出しタイミング**:
このAPIは、以下の設定変更API実行時に**自動的に呼び出される**必要があります：

1. `PUT /api/agenda-mode/voting-scopes/{id}` の成功後
2. `POST /api/agenda-mode/voting-groups` の成功後
3. `PUT /api/agenda-mode/voting-groups/{id}` の成功後
4. `PUT /api/agenda-mode/voting-groups/{id}/approver-rotation` の成功後
5. `DELETE /api/agenda-mode/voting-groups/{id}` の成功後
6. プロジェクトモード設定API（全て）

**実装ファイル**: `src/app/api/voting-settings/change-logs/route.ts`

**実装優先度**: 🔴 **高** - 自動ログ記録に必須

**予定工数**: 0.5日

---

#### API-4: 履歴エクスポート

**エンドポイント**: `GET /api/voting-settings/change-logs/export`

**目的**: CSV形式で履歴をエクスポート

**リクエスト**:
```http
GET /api/voting-settings/change-logs/export?mode=all&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {jwt_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `mode` | string | ❌ | フィルタモード: "all", "agenda", "project" |
| `startDate` | string | ❌ | 開始日（ISO 8601） |
| `endDate` | string | ❌ | 終了日（ISO 8601） |

**レスポンス**: CSV形式
```csv
変更日時,モード,カテゴリ,変更者,権限レベル,変更内容,影響範囲,ステータス
2025-10-13 14:30,議題モード,投票スコープ設定,山田 太郎,99,看護部-看護科の投票パターンをパターンCからパターンAに変更,約80名に影響,active
2025-10-11 10:20,議題モード,投票グループ管理,山田 太郎,99,「小規模事務部門グループ」を新規作成（総務科、経理科、人事科）,22名が新グループに統合,active
```

**データベース操作**:
```typescript
const logs = await prisma.votingSettingChangeLog.findMany({
  where: {
    mode: mode !== 'all' ? mode : undefined,
    changedAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
  },
  include: {
    user: true,
  },
  orderBy: {
    changedAt: 'desc',
  },
});

// CSV生成
const csv = generateCSV(logs);
```

**実装ファイル**: `src/app/api/voting-settings/change-logs/export/route.ts`

**実装優先度**: 🟢 **低** - エクスポート機能

**予定工数**: 1日

---

## 3. 既存API統合（自動ログ記録）

### 3.1 統合が必要なAPI

以下の既存APIに、変更履歴の自動記録処理を追加する必要があります：

#### API-A: 投票スコープ設定更新

**エンドポイント**: `PUT /api/agenda-mode/voting-scopes/{departmentId}`

**追加処理**:
```typescript
// 変更前の値を取得
const beforeConfig = await prisma.agendaModeConfig.findUnique({
  where: { departmentId },
  include: { department: true },
});

// 設定を更新
const afterConfig = await prisma.agendaModeConfig.update({
  where: { departmentId },
  data: { votingScopeRules },
});

// 🆕 変更履歴を記録
await logSettingChange({
  mode: 'agenda',
  category: 'voting_scope_setting',
  subcategory: 'pattern_change',
  changeDescription: `${beforeConfig.department.departmentName}の投票パターンを${beforeConfig.votingScopeRules.pattern}から${votingPattern}に変更`,
  impactDescription: `約${beforeConfig.department.memberCount}名に影響`,
  beforeValue: beforeConfig.votingScopeRules,
  afterValue: votingScopeRules,
  userId: req.user.id,
  relatedEntityType: 'AgendaModeConfig',
  relatedEntityId: departmentId,
  metadata: {
    affectedUserCount: beforeConfig.department.memberCount,
    affectedDepartments: [beforeConfig.department.departmentName],
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-scopes/[departmentId]/route.ts`

**予定工数**: 0.5日

---

#### API-B: 投票グループ作成

**エンドポイント**: `POST /api/agenda-mode/voting-groups`

**追加処理**:
```typescript
// グループを作成
const group = await prisma.votingGroup.create({
  data: { ... },
});

// 🆕 変更履歴を記録
await logSettingChange({
  mode: 'agenda',
  category: 'voting_group_management',
  subcategory: 'group_created',
  changeDescription: `「${groupName}」を新規作成（${departmentNames.join('、')}）`,
  impactDescription: `${totalMembers}名が新グループに統合`,
  beforeValue: null,
  afterValue: {
    groupId: group.groupId,
    groupName: group.groupName,
    memberDepartments: departmentNames,
    totalMembers,
  },
  userId: req.user.id,
  relatedEntityType: 'VotingGroup',
  relatedEntityId: group.groupId,
  metadata: {
    affectedUserCount: totalMembers,
    affectedDepartments: departmentNames,
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-groups/route.ts`

**予定工数**: 0.5日

---

#### API-C: 主承認者ローテーション設定更新

**エンドポイント**: `PUT /api/agenda-mode/voting-groups/{groupId}/approver-rotation`

**追加処理**:
```typescript
// 変更前の値を取得
const beforeGroup = await prisma.votingGroup.findUnique({
  where: { groupId },
});

// 設定を更新
const afterGroup = await prisma.votingGroup.update({
  where: { groupId },
  data: { approverRotation },
});

// 🆕 変更履歴を記録
await logSettingChange({
  mode: 'agenda',
  category: 'primary_approver_setting',
  subcategory: 'rotation_period_changed',
  changeDescription: `${beforeGroup.groupName}のローテーション期間を${beforeRotation.type}から${rotationType}に変更`,
  impactDescription: `${approverCount}名の承認者に影響`,
  beforeValue: beforeGroup.approverRotation,
  afterValue: approverRotation,
  userId: req.user.id,
  relatedEntityType: 'VotingGroup',
  relatedEntityId: groupId,
  metadata: {
    approverCount,
    affectedApprovers: schedule.map(s => s.approverId),
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-groups/[groupId]/approver-rotation/route.ts`

**予定工数**: 0.5日

---

#### API-D: プロジェクトモード設定API（将来実装）

**エンドポイント**: `PUT /api/project-mode/...`（複数）

**追加処理**: 各プロジェクトモード設定変更時にも同様のログ記録を実装

**予定工数**: 1日

---

### 3.2 共通ログ記録関数

**ファイル**: `src/services/votingSettingLogService.ts`（新規作成）

```typescript
export interface LogSettingChangeParams {
  mode: 'agenda' | 'project' | 'both';
  category: string;
  subcategory?: string;
  changeDescription: string;
  impactDescription?: string;
  beforeValue?: any;
  afterValue?: any;
  userId: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: any;
}

export async function logSettingChange(params: LogSettingChangeParams) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return await prisma.votingSettingChangeLog.create({
    data: {
      mode: params.mode,
      category: params.category,
      subcategory: params.subcategory,
      changeDescription: params.changeDescription,
      impactDescription: params.impactDescription,
      beforeValue: params.beforeValue,
      afterValue: params.afterValue,
      changedBy: params.userId,
      changedByLevel: user.permissionLevel,
      status: 'active',
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
      metadata: params.metadata,
    },
  });
}
```

**予定工数**: 0.5日

---

## 4. 外部API（医療システムからの取得）

### 結論: ❌ **外部API不要**

理由:
- 投票設定変更履歴はVoiceDrive独自機能の監査ログ
- 医療システムは関与しない
- 変更者情報は既にUserテーブルにキャッシュ済み
- 新規API開発・DB変更は医療システム側で不要

---

## 5. フロントエンド実装

### 5.1 カスタムフック

#### useVotingHistory

**ファイル**: `src/hooks/useVotingHistory.ts`（新規作成）

```typescript
import { useState, useEffect } from 'react';
import { fetchChangeLogList } from '@/services/votingHistoryService';

export function useVotingHistory(mode: 'all' | 'agenda' | 'project' = 'all') {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await fetchChangeLogList({ mode, page: 1, limit: 50 });
        setLogs(data.logs);
        setStatistics(data.statistics);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [mode]);

  return { logs, statistics, loading, error };
}
```

**実装優先度**: 🔴 **高**

**予定工数**: 0.5日

---

### 5.2 サービス

#### votingHistoryService

**ファイル**: `src/services/votingHistoryService.ts`（新規作成）

```typescript
export async function fetchChangeLogList(params: {
  mode?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/voting-settings/change-logs?${queryString}`);
  if (!response.ok) throw new Error('Failed to fetch change logs');
  return await response.json();
}

export async function fetchChangeLogDetail(logId: string) {
  const response = await fetch(`/api/voting-settings/change-logs/${logId}`);
  if (!response.ok) throw new Error('Failed to fetch change log detail');
  return await response.json();
}

export async function exportChangeLogs(params: {
  mode?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/voting-settings/change-logs/export?${queryString}`);
  if (!response.ok) throw new Error('Failed to export change logs');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voting-history-${new Date().toISOString()}.csv`;
  a.click();
}
```

**実装優先度**: 🔴 **高**

**予定工数**: 0.5日

---

### 5.3 コンポーネント

#### ChangeLogDetailModal

**ファイル**: `src/components/voting/ChangeLogDetailModal.tsx`（新規作成）

**目的**: 変更履歴の詳細を表示するモーダル

**機能**:
- 変更前後の値を比較表示
- メタデータ表示
- 関連設定ページへのリンク

**実装優先度**: 🟡 **中**

**予定工数**: 1日

---

## 6. 型定義

### 6.1 ChangeLog型

**ファイル**: `src/types/votingHistory.ts`（新規作成）

```typescript
export type ChangeMode = 'agenda' | 'project' | 'both';
export type ChangeStatus = 'active' | 'reverted' | 'superseded';

export interface ChangeLog {
  id: string;
  date: string;
  mode: ChangeMode;
  modeLabel: string;
  category: string;
  user: string;
  userLevel: number;
  action: string;
  impact?: string;
  status: ChangeStatus;
}

export interface ChangeLogDetail extends ChangeLog {
  subcategory?: string;
  changeDescription: string;
  impactDescription?: string;
  beforeValue?: any;
  afterValue?: any;
  changedBy: {
    id: string;
    name: string;
    permissionLevel: number;
  };
  changedAt: string;
  relatedEntity?: {
    type: string;
    id: string;
  };
  metadata?: any;
}

export interface ChangeLogStatistics {
  totalCount: number;
  agendaModeCount: number;
  projectModeCount: number;
}
```

---

## 7. 実装スケジュール

### Phase 1: 基本表示機能（2-3日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| テーブル追加 | `prisma/schema.prisma` | 0.5日 |
| マイグレーション実行 | - | 0.5日 |
| API-1実装 | `src/app/api/voting-settings/change-logs/route.ts` | 1日 |
| サービス実装 | `src/services/votingHistoryService.ts` | 0.5日 |
| カスタムフック実装 | `src/hooks/useVotingHistory.ts` | 0.5日 |
| ページ修正 | `src/pages/admin/VotingHistoryPage.tsx` | 0.5日 |

**合計**: 3.5日

---

### Phase 2: 自動ログ記録（3-4日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-3実装 | `src/app/api/voting-settings/change-logs/route.ts` (POST) | 0.5日 |
| 共通ログ関数 | `src/services/votingSettingLogService.ts` | 0.5日 |
| API-A統合 | 投票スコープ設定更新API | 0.5日 |
| API-B統合 | 投票グループ作成API | 0.5日 |
| API-C統合 | ローテーション設定API | 0.5日 |
| API-D統合 | プロジェクトモード設定API | 1日 |
| テスト | 統合テスト | 1日 |

**合計**: 4.5日

---

### Phase 3: 詳細表示機能（1-2日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-2実装 | `src/app/api/voting-settings/change-logs/[logId]/route.ts` | 0.5日 |
| 詳細モーダル実装 | `src/components/voting/ChangeLogDetailModal.tsx` | 1日 |
| 比較表示UI | モーダル内の変更前後比較 | 0.5日 |

**合計**: 2日

---

### Phase 4: エクスポート機能（1-2日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-4実装 | `src/app/api/voting-settings/change-logs/export/route.ts` | 1日 |
| CSV生成処理 | CSV生成ユーティリティ | 0.5日 |
| ダウンロード機能 | エクスポートボタン | 0.5日 |

**合計**: 2日

---

## 8. まとめ

### 8.1 実装必要項目

| カテゴリ | 項目数 | 優先度 | 予定工数 |
|---------|-------|--------|---------|
| **テーブル追加** | 1テーブル | 🔴 高 | 1日 |
| **API実装** | 4エンドポイント | 🔴 高 | 3日 |
| **既存API統合** | 6API | 🔴 高 | 2.5日 |
| **フロントエンド** | 3コンポーネント | 🔴 高 | 2.5日 |
| **型定義** | 1ファイル | 🔴 高 | 0.5日 |

**総工数**: 約12日

---

### 8.2 医療システム連携

| 項目 | 必要性 | 理由 |
|------|-------|------|
| **新規API開発依頼** | ❌ 不要 | VoiceDrive独自の監査ログ |
| **DB変更依頼** | ❌ 不要 | 医療システムDB不使用 |
| **確認質問** | ❌ 不要 | VoiceDrive内部で完結 |

**結論**: 医療システムチームへの連絡・依頼は**一切不要**

---

### 8.3 次のステップ

1. ✅ DB要件分析完了
2. ✅ 暫定マスターリスト作成完了
3. ⏳ schema.prisma更新 - `VotingSettingChangeLog`モデル追加
4. ⏳ マイグレーション実行
5. ⏳ Phase 1: 基本表示機能実装
6. ⏳ Phase 2: 自動ログ記録実装
7. ⏳ Phase 3: 詳細表示機能実装
8. ⏳ Phase 4: エクスポート機能実装
9. ⏳ 統合テスト - 全機能の動作確認

---

**文書終了**

**作成者**: VoiceDriveチーム
**承認**: 未承認（レビュー待ち）
**最終更新**: 2025年10月21日
