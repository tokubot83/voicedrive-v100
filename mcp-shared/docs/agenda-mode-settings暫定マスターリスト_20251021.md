# 議題モード設定ページ 暫定マスターリスト

**文書番号**: API-LIST-2025-1021-003
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**対象**: 議題モード設定ページ（/admin/agenda-mode-settings）
**作成者**: VoiceDriveチーム

---

## 📋 エグゼクティブサマリー

### 対象ページ
- **URL**: `/admin/agenda-mode-settings`
- **機能**: 議題モードの投票スコープ・投票グループ・主承認者ローテーション設定

### 重要な結論

| 項目 | 状態 | 詳細 |
|------|------|------|
| **データ管理責任** | 🟢 VoiceDrive 100% | 医療システムは関与しない |
| **DB実装** | ✅ 完了 | VotingGroup, AgendaModeConfig等が実装済み |
| **API実装** | ⏳ 要実装 | 7つのエンドポイントを新規実装 |
| **医療システム連携** | ❌ 不要 | 組織マスタ参照のみ（既存APIで対応済み） |

---

## 1. 必要なAPI一覧

### 1.1 VoiceDrive内部API（新規実装必要）

#### API-1: 投票スコープ設定一覧取得

**エンドポイント**: `GET /api/agenda-mode/voting-scopes`

**目的**: 投票スコープ設定ページの一覧表示

**リクエスト**:
```http
GET /api/agenda-mode/voting-scopes?facilityCode=obara-hospital
Authorization: Bearer {jwt_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `facilityCode` | string | ✅ | 施設コード |
| `isActive` | boolean | ❌ | 有効な設定のみ取得（デフォルト: true） |

**レスポンス**:
```json
{
  "scopes": [
    {
      "configId": "CONFIG-001",
      "departmentId": "DEPT-001",
      "departmentName": "看護部",
      "divisionName": "看護科",
      "votingPattern": "A",
      "votingPatternLabel": "パターンA（配置単位）",
      "votingScopeRules": {
        "pattern": "A",
        "description": "パターンA（配置単位）",
        "scopeDefinition": {
          "type": "placement",
          "rules": {
            "groupBy": "assignment",
            "minMembers": 5,
            "allowCrossDepartment": false
          }
        }
      },
      "targetMemberCount": 80,
      "isActive": true,
      "updatedAt": "2025-10-21T10:00:00Z"
    }
  ],
  "totalCount": 15
}
```

**データベース操作**:
```typescript
const configs = await prisma.agendaModeConfig.findMany({
  where: {
    department: {
      facilityCode: facilityCode,
    },
    isActive: isActive ?? true,
  },
  include: {
    department: {
      select: {
        departmentId: true,
        departmentName: true,
        divisionName: true,
      },
    },
  },
  orderBy: {
    department: {
      departmentName: 'asc',
    },
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-scopes/route.ts`

**実装優先度**: 🔴 **高** - ページ表示に必須

**予定工数**: 0.5日

---

#### API-2: 投票グループ一覧取得

**エンドポイント**: `GET /api/agenda-mode/voting-groups`

**目的**: 投票グループ管理ページの一覧表示

**リクエスト**:
```http
GET /api/agenda-mode/voting-groups?facilityCode=obara-hospital
Authorization: Bearer {jwt_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `facilityCode` | string | ✅ | 施設コード |
| `isActive` | boolean | ❌ | 有効なグループのみ取得（デフォルト: true） |

**レスポンス**:
```json
{
  "groups": [
    {
      "id": "VG-001",
      "groupId": "GROUP-2024-001",
      "groupName": "小規模事務部門グループ",
      "totalMembers": 22,
      "isActive": true,
      "agendaModeEnabled": true,
      "projectModeEnabled": true,
      "departments": [
        {
          "departmentId": "DEPT-001",
          "departmentName": "総務科",
          "memberCount": 8
        },
        {
          "departmentId": "DEPT-002",
          "departmentName": "経理科",
          "memberCount": 7
        },
        {
          "departmentId": "DEPT-003",
          "departmentName": "人事科",
          "memberCount": 7
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2025-10-21T10:00:00Z"
    }
  ],
  "totalCount": 5
}
```

**データベース操作**:
```typescript
const groups = await prisma.votingGroup.findMany({
  where: {
    facilityCode: facilityCode,
    isActive: isActive ?? true,
  },
  include: {
    members: {
      select: {
        departmentId: true,
        departmentName: true,
      },
    },
  },
  orderBy: {
    groupName: 'asc',
  },
});

// メンバー数を集計
for (const group of groups) {
  const memberCounts = await prisma.organizationStructure.groupBy({
    by: ['departmentId'],
    where: {
      departmentId: { in: group.memberDepartmentIds as string[] },
    },
    _count: {
      departmentId: true,
    },
  });
  // ...レスポンス整形
}
```

**実装ファイル**: `src/app/api/agenda-mode/voting-groups/route.ts`

**実装優先度**: 🔴 **高** - ページ表示に必須

**予定工数**: 1日

---

#### API-3: 主承認者設定一覧取得

**エンドポイント**: `GET /api/agenda-mode/approvers`

**目的**: 主承認者設定ページの一覧表示

**リクエスト**:
```http
GET /api/agenda-mode/approvers?facilityCode=obara-hospital
Authorization: Bearer {jwt_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `facilityCode` | string | ✅ | 施設コード |

**レスポンス**:
```json
{
  "approvers": [
    {
      "groupId": "GROUP-2024-001",
      "groupName": "小規模事務部門グループ",
      "rotationType": "monthly",
      "rotationLabel": "月次ローテーション",
      "approverCount": 3,
      "current": {
        "approverId": "USER-001",
        "userId": "user_abc123",
        "name": "山田 太郎",
        "position": "総務科長",
        "departmentName": "総務科",
        "period": "2025年10月担当",
        "startDate": "2025-10-01",
        "endDate": "2025-10-31"
      },
      "next": {
        "approverId": "USER-002",
        "userId": "user_def456",
        "name": "佐藤 花子",
        "position": "経理科長",
        "departmentName": "経理科",
        "period": "2025年11月担当",
        "startDate": "2025-11-01",
        "endDate": "2025-11-30"
      },
      "waiting": {
        "approverId": "USER-003",
        "userId": "user_ghi789",
        "name": "鈴木 次郎",
        "position": "人事科長",
        "departmentName": "人事科",
        "period": "2025年12月担当",
        "startDate": "2025-12-01",
        "endDate": "2025-12-31"
      }
    }
  ],
  "totalCount": 5
}
```

**データベース操作**:
```typescript
const groups = await prisma.votingGroup.findMany({
  where: {
    facilityCode: facilityCode,
    isActive: true,
    primaryApproverId: { not: null },
  },
  include: {
    primaryApprover: {
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
      },
    },
  },
});

// approverRotation JSON から現在・次回・待機の承認者を特定
for (const group of groups) {
  const rotation = group.approverRotation as ApproverRotation;
  // 現在日付から該当する承認者を特定
  // ...ロジック実装
}
```

**実装ファイル**: `src/app/api/agenda-mode/approvers/route.ts`

**実装優先度**: 🔴 **高** - ページ表示に必須

**予定工数**: 1日

---

#### API-4: 投票スコープ設定更新

**エンドポイント**: `PUT /api/agenda-mode/voting-scopes/{departmentId}`

**目的**: 投票スコープ設定の編集

**リクエスト**:
```http
PUT /api/agenda-mode/voting-scopes/DEPT-001
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "votingPattern": "B",
  "votingScopeRules": {
    "pattern": "B",
    "description": "パターンB（職種単位）",
    "scopeDefinition": {
      "type": "profession",
      "rules": {
        "groupBy": "occupationCode",
        "minMembers": 5,
        "allowCrossDepartment": true
      }
    }
  }
}
```

**バリデーション**:
| 項目 | ルール |
|------|--------|
| `votingPattern` | "A", "B", "C" のいずれか |
| `votingScopeRules` | 必須、有効なJSON |
| `scopeDefinition.type` | "placement", "profession", "department" のいずれか |
| `scopeDefinition.rules.minMembers` | 1以上の整数 |

**レスポンス**:
```json
{
  "success": true,
  "updated": {
    "configId": "CONFIG-001",
    "departmentId": "DEPT-001",
    "votingPattern": "B",
    "votingScopeRules": { ... },
    "updatedAt": "2025-10-21T10:30:00Z"
  }
}
```

**データベース操作**:
```typescript
const updated = await prisma.agendaModeConfig.update({
  where: {
    departmentId: departmentId,
  },
  data: {
    votingScopeRules: votingScopeRules,
    updatedAt: new Date(),
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-scopes/[departmentId]/route.ts`

**実装優先度**: 🟡 **中** - 編集機能

**予定工数**: 0.5日

---

#### API-5: 投票グループ作成

**エンドポイント**: `POST /api/agenda-mode/voting-groups`

**目的**: 新規投票グループの作成

**リクエスト**:
```http
POST /api/agenda-mode/voting-groups
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "groupName": "新規グループ",
  "memberDepartmentIds": ["DEPT-001", "DEPT-002", "DEPT-003"],
  "facilityCode": "obara-hospital",
  "primaryApproverId": "user_abc123",
  "approverRotation": {
    "type": "monthly",
    "schedule": [
      {
        "approverId": "user_abc123",
        "period": "2025-10",
        "startDate": "2025-10-01",
        "endDate": "2025-10-31"
      },
      {
        "approverId": "user_def456",
        "period": "2025-11",
        "startDate": "2025-11-01",
        "endDate": "2025-11-30"
      }
    ]
  },
  "agendaModeEnabled": true,
  "projectModeEnabled": true
}
```

**バリデーション**:
| 項目 | ルール |
|------|--------|
| `groupName` | 必須、3-50文字、同一施設内で重複不可 |
| `memberDepartmentIds` | 必須、最低1部署以上、同一施設内の部署のみ |
| `facilityCode` | 必須、存在する施設コード |
| `primaryApproverId` | 必須、選択部署のいずれかに所属、permissionLevel >= 10 |
| `approverRotation.schedule` | 最低2名以上、同じ承認者の重複不可 |

**レスポンス**:
```json
{
  "success": true,
  "group": {
    "id": "VG-003",
    "groupId": "GROUP-2024-003",
    "groupName": "新規グループ",
    "totalMembers": 18,
    "createdAt": "2025-10-21T10:30:00Z"
  }
}
```

**データベース操作**:
```typescript
// トランザクション内で実行
const group = await prisma.votingGroup.create({
  data: {
    groupId: generateGroupId(),  // GROUP-YYYY-NNN形式
    groupName: groupName,
    memberDepartmentIds: memberDepartmentIds,
    facilityCode: facilityCode,
    primaryApproverId: primaryApproverId,
    approverRotation: approverRotation,
    agendaModeEnabled: agendaModeEnabled ?? true,
    projectModeEnabled: projectModeEnabled ?? true,
    isActive: true,
  },
});

// AgendaModeGroupConfigも同時作成
await prisma.agendaModeGroupConfig.create({
  data: {
    groupId: group.groupId,
    // デフォルト値を設定
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-groups/route.ts`

**実装優先度**: 🟡 **中** - グループ作成機能

**予定工数**: 1日

---

#### API-6: 投票グループ更新

**エンドポイント**: `PUT /api/agenda-mode/voting-groups/{groupId}`

**目的**: 既存投票グループの編集

**リクエスト**:
```http
PUT /api/agenda-mode/voting-groups/GROUP-2024-001
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "groupName": "更新後のグループ名",
  "memberDepartmentIds": ["DEPT-001", "DEPT-002", "DEPT-003", "DEPT-004"],
  "agendaModeEnabled": true,
  "projectModeEnabled": false
}
```

**バリデーション**: API-5と同様

**レスポンス**:
```json
{
  "success": true,
  "updated": {
    "groupId": "GROUP-2024-001",
    "groupName": "更新後のグループ名",
    "totalMembers": 25,
    "updatedAt": "2025-10-21T10:30:00Z"
  }
}
```

**データベース操作**:
```typescript
const updated = await prisma.votingGroup.update({
  where: {
    groupId: groupId,
  },
  data: {
    groupName: groupName,
    memberDepartmentIds: memberDepartmentIds,
    agendaModeEnabled: agendaModeEnabled,
    projectModeEnabled: projectModeEnabled,
    updatedAt: new Date(),
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-groups/[groupId]/route.ts`

**実装優先度**: 🟡 **中** - グループ編集機能

**予定工数**: 0.5日

---

#### API-7: 主承認者ローテーション設定更新

**エンドポイント**: `PUT /api/agenda-mode/voting-groups/{groupId}/approver-rotation`

**目的**: 承認者ローテーション設定の変更

**リクエスト**:
```http
PUT /api/agenda-mode/voting-groups/GROUP-2024-001/approver-rotation
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "rotationType": "quarterly",
  "schedule": [
    {
      "approverId": "user_abc123",
      "period": "Q4 2025",
      "startDate": "2025-10-01",
      "endDate": "2025-12-31"
    },
    {
      "approverId": "user_def456",
      "period": "Q1 2026",
      "startDate": "2026-01-01",
      "endDate": "2026-03-31"
    },
    {
      "approverId": "user_ghi789",
      "period": "Q2 2026",
      "startDate": "2026-04-01",
      "endDate": "2026-06-30"
    }
  ]
}
```

**バリデーション**:
| 項目 | ルール |
|------|--------|
| `rotationType` | "monthly", "quarterly", "project-based" のいずれか |
| `schedule` | 必須、最低2名以上 |
| `schedule[].approverId` | グループメンバー内の職員、permissionLevel >= 10 |
| `schedule[].startDate` | 有効な日付、前の期間のendDateと連続 |
| `schedule[].endDate` | startDateより後の日付 |

**レスポンス**:
```json
{
  "success": true,
  "updated": {
    "groupId": "GROUP-2024-001",
    "rotationType": "quarterly",
    "approverCount": 3,
    "updatedAt": "2025-10-21T10:30:00Z"
  }
}
```

**データベース操作**:
```typescript
const updated = await prisma.votingGroup.update({
  where: {
    groupId: groupId,
  },
  data: {
    approverRotation: {
      type: rotationType,
      schedule: schedule,
      updatedAt: new Date(),
    },
    updatedAt: new Date(),
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-groups/[groupId]/approver-rotation/route.ts`

**実装優先度**: 🟡 **中** - ローテーション設定機能

**予定工数**: 0.5日

---

#### API-8: 投票グループ削除

**エンドポイント**: `DELETE /api/agenda-mode/voting-groups/{groupId}`

**目的**: 不要なグループの削除

**リクエスト**:
```http
DELETE /api/agenda-mode/voting-groups/GROUP-2024-001
Authorization: Bearer {jwt_token}
```

**バリデーション**:
| 項目 | ルール |
|------|--------|
| 権限チェック | permissionLevel >= 20（経営層のみ） |
| グループ使用状況 | アクティブなプロジェクト・議題がないこと |

**レスポンス**:
```json
{
  "success": true,
  "deleted": {
    "groupId": "GROUP-2024-001",
    "groupName": "削除されたグループ",
    "deletedAt": "2025-10-21T10:30:00Z"
  }
}
```

**データベース操作**:
```typescript
// 論理削除（isActiveをfalseに設定）
const deleted = await prisma.votingGroup.update({
  where: {
    groupId: groupId,
  },
  data: {
    isActive: false,
    updatedAt: new Date(),
  },
});

// 関連する AgendaModeGroupConfig も無効化
await prisma.agendaModeGroupConfig.update({
  where: {
    groupId: groupId,
  },
  data: {
    isActive: false,
    updatedAt: new Date(),
  },
});
```

**実装ファイル**: `src/app/api/agenda-mode/voting-groups/[groupId]/route.ts`

**実装優先度**: 🟢 **低** - 削除機能

**予定工数**: 0.5日

---

## 2. 外部API（医療システムからの取得）

### 結論: ❌ **外部API不要**

理由:
- 投票グループ・投票スコープ・主承認者ローテーションは**VoiceDrive独自機能**
- 医療システムは組織構造マスタ（部署・科情報）を提供するのみ
- 組織構造データは既に`OrganizationStructure`テーブルにキャッシュ済み
- ページ表示・編集時に医療システムAPIを新規呼び出す必要なし

**既存の医療システム連携**（参照のみ）:
- 部署・科マスタ: 既存の同期バッチでキャッシュ済み
- 職員情報: 既存の同期バッチでキャッシュ済み

---

## 3. データベーステーブル

### 3.1 既存テーブル（変更不要）

#### テーブル1: `VotingGroup`

**目的**: 投票グループマスタ

**スキーマ**: `prisma/schema.prisma` 1845-1869行

**主要フィールド**:
| フィールド | 型 | 説明 |
|-----------|---|------|
| `groupId` | String | グループID（ユニーク） |
| `groupName` | String | グループ名 |
| `memberDepartmentIds` | Json | 所属部署IDの配列 |
| `primaryApproverId` | String? | 主承認者ID |
| `approverRotation` | Json? | ローテーション設定 |
| `agendaModeEnabled` | Boolean | 議題モード有効フラグ |
| `isActive` | Boolean | 有効フラグ |

**評価**: ✅ **変更不要**

---

#### テーブル2: `AgendaModeConfig`

**目的**: 部署ごとの議題モード設定

**スキーマ**: `prisma/schema.prisma` 1871-1891行

**主要フィールド**:
| フィールド | 型 | 説明 |
|-----------|---|------|
| `departmentId` | String | 部署ID（ユニーク） |
| `votingScopeRules` | Json | 投票スコープ設定 |
| `isActive` | Boolean | 有効フラグ |

**評価**: ✅ **変更不要**

---

#### テーブル3: `AgendaModeGroupConfig`

**目的**: グループごとの議題モード設定

**スキーマ**: `prisma/schema.prisma` 1893-1913行

**主要フィールド**:
| フィールド | 型 | 説明 |
|-----------|---|------|
| `groupId` | String | グループID（ユニーク） |
| `votingScopeRules` | Json | 投票スコープ設定 |
| `isActive` | Boolean | 有効フラグ |

**評価**: ✅ **変更不要**

---

### 3.2 参照テーブル（既存・変更不要）

- `OrganizationStructure`: 部署・科情報
- `User`: 職員情報（承認者の氏名・役職）
- `Facility`: 施設情報

---

### 3.3 結論

❌ **テーブル追加・変更不要** - 既存テーブルで全機能実装可能

---

## 4. 型定義

### 4.1 ApproverRotation型

**ファイル**: `src/types/agendaMode.ts`（新規作成）

```typescript
export type RotationType = 'monthly' | 'quarterly' | 'project-based';

export interface ApproverSchedule {
  approverId: string;
  period: string;        // "2025-10", "Q4 2025", "PJ-001"
  startDate: string;     // ISO 8601
  endDate: string;       // ISO 8601
}

export interface ApproverRotation {
  type: RotationType;
  schedule: ApproverSchedule[];
  updatedAt?: string;
}
```

---

### 4.2 VotingScopeRules型

```typescript
export type VotingPattern = 'A' | 'B' | 'C';
export type ScopeType = 'placement' | 'profession' | 'department';

export interface VotingScopeRules {
  pattern: VotingPattern;
  description: string;
  scopeDefinition: {
    type: ScopeType;
    rules: {
      groupBy: string;                // "assignment", "occupationCode", "departmentId"
      minMembers: number;             // 最小投票成立人数
      allowCrossDepartment: boolean;  // 部署横断投票許可
    };
  };
}
```

---

### 4.3 VotingGroupWithDetails型

```typescript
export interface VotingGroupWithDetails {
  id: string;
  groupId: string;
  groupName: string;
  totalMembers: number;
  isActive: boolean;
  agendaModeEnabled: boolean;
  projectModeEnabled: boolean;
  departments: {
    departmentId: string;
    departmentName: string;
    memberCount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. フロントエンド実装

### 5.1 カスタムフック

#### useAgendaModeSettings

**ファイル**: `src/hooks/useAgendaModeSettings.ts`（新規作成）

```typescript
import { useState, useEffect } from 'react';
import { fetchVotingScopes, fetchVotingGroups, fetchApprovers } from '@/services/agendaModeService';

export function useAgendaModeSettings(facilityCode: string) {
  const [scopes, setScopes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [scopesData, groupsData, approversData] = await Promise.all([
          fetchVotingScopes(facilityCode),
          fetchVotingGroups(facilityCode),
          fetchApprovers(facilityCode),
        ]);
        setScopes(scopesData.scopes);
        setGroups(groupsData.groups);
        setApprovers(approversData.approvers);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [facilityCode]);

  return { scopes, groups, approvers, loading, error };
}
```

**実装優先度**: 🔴 **高**

**予定工数**: 0.5日

---

### 5.2 サービス

#### agendaModeService

**ファイル**: `src/services/agendaModeService.ts`（新規作成）

```typescript
export async function fetchVotingScopes(facilityCode: string) {
  const response = await fetch(`/api/agenda-mode/voting-scopes?facilityCode=${facilityCode}`);
  if (!response.ok) throw new Error('Failed to fetch voting scopes');
  return await response.json();
}

export async function fetchVotingGroups(facilityCode: string) {
  const response = await fetch(`/api/agenda-mode/voting-groups?facilityCode=${facilityCode}`);
  if (!response.ok) throw new Error('Failed to fetch voting groups');
  return await response.json();
}

export async function fetchApprovers(facilityCode: string) {
  const response = await fetch(`/api/agenda-mode/approvers?facilityCode=${facilityCode}`);
  if (!response.ok) throw new Error('Failed to fetch approvers');
  return await response.json();
}

export async function createVotingGroup(data: CreateVotingGroupRequest) {
  const response = await fetch('/api/agenda-mode/voting-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create voting group');
  return await response.json();
}

// ... 他のCRUD操作
```

**実装優先度**: 🔴 **高**

**予定工数**: 0.5日

---

## 6. 実装スケジュール

### Phase 1: 表示機能（2-3日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-1実装 | `src/app/api/agenda-mode/voting-scopes/route.ts` | 0.5日 |
| API-2実装 | `src/app/api/agenda-mode/voting-groups/route.ts` | 1日 |
| API-3実装 | `src/app/api/agenda-mode/approvers/route.ts` | 1日 |
| サービス実装 | `src/services/agendaModeService.ts` | 0.5日 |
| カスタムフック実装 | `src/hooks/useAgendaModeSettings.ts` | 0.5日 |
| ページ修正 | `src/pages/admin/AgendaModeSettingsPage.tsx` | 0.5日 |

**合計**: 4日

---

### Phase 2: 編集機能（3-4日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-4実装 | `src/app/api/agenda-mode/voting-scopes/[id]/route.ts` | 0.5日 |
| API-5実装 | `src/app/api/agenda-mode/voting-groups/route.ts` (POST) | 1日 |
| API-6実装 | `src/app/api/agenda-mode/voting-groups/[id]/route.ts` | 0.5日 |
| API-7実装 | `src/app/api/agenda-mode/.../approver-rotation/route.ts` | 0.5日 |
| 編集モーダル実装 | `src/components/agenda/VotingScopeEditModal.tsx` | 1日 |
| グループ作成モーダル | `src/components/agenda/VotingGroupCreateModal.tsx` | 1日 |
| ローテーション設定モーダル | `src/components/agenda/ApproverRotationModal.tsx` | 0.5日 |

**合計**: 5日

---

### Phase 3: 削除機能（1日）

| タスク | ファイル | 工数 |
|-------|---------|------|
| API-8実装 | `src/app/api/agenda-mode/voting-groups/[id]/route.ts` (DELETE) | 0.5日 |
| 削除確認ダイアログ | `src/components/agenda/DeleteGroupDialog.tsx` | 0.5日 |

**合計**: 1日

---

## 7. まとめ

### 7.1 実装必要項目

| カテゴリ | 項目数 | 優先度 | 予定工数 |
|---------|-------|--------|---------|
| **API実装** | 8エンドポイント | 🔴 高 | 5日 |
| **フロントエンド** | 5コンポーネント | 🔴 高 | 5日 |
| **型定義** | 3ファイル | 🔴 高 | 0.5日 |
| **テーブル追加** | 0 | - | 0日 |

**総工数**: 約10.5日

---

### 7.2 医療システム連携

| 項目 | 必要性 | 理由 |
|------|-------|------|
| **新規API開発依頼** | ❌ 不要 | VoiceDrive独自機能 |
| **DB変更依頼** | ❌ 不要 | 医療システムDB不使用 |
| **確認質問** | ❌ 不要 | VoiceDrive内部で完結 |

**結論**: 医療システムチームへの連絡・依頼は**一切不要**

---

### 7.3 次のステップ

1. ✅ DB要件分析完了
2. ✅ 暫定マスターリスト作成完了
3. ⏳ Phase 1: 表示機能実装（API-1, 2, 3 + フロントエンド）
4. ⏳ Phase 2: 編集機能実装（API-4, 5, 6, 7 + モーダル）
5. ⏳ Phase 3: 削除機能実装（API-8 + ダイアログ）

---

**文書終了**

**作成者**: VoiceDriveチーム
**承認**: 未承認（レビュー待ち）
**最終更新**: 2025年10月21日
