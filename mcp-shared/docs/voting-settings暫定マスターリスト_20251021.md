# 投票設定ページ 暫定マスターリスト

**文書番号**: MASTER-LIST-2025-1021-005
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**対象ページ**: 投票設定ページ（/admin/voting-settings）
**作成者**: VoiceDriveチーム

---

## 📋 概要

本文書は、投票設定ページ全体（議題モード・プロジェクトモード・履歴）の実装に必要なAPI、DB変更、および工数の暫定マスターリストです。

### ページ構成

| タブ | 機能 | API数 | 推定工数 |
|------|------|------|---------|
| 🗳️ 議題モード設定 | 投票スコープ・グループ・承認者ローテーション設定 | 8本 | 10.5日 |
| 📋 プロジェクトモード設定 | 閾値・チーム編成・進捗管理設定 | 8本 | 10.5日 |
| 📜 設定変更履歴 | 変更履歴表示・エクスポート | 4本 | 8日 |
| 🔗 自動ログ記録統合 | 既存APIへの統合 | - | 3日 |
| **合計** | - | **20本** | **32日** |

---

## 1. 必要なAPI一覧

### 1.1 議題モード設定API（8本）

#### API-A1: 投票スコープ設定一覧取得

**エンドポイント**: `GET /api/agenda-mode/voting-scopes`

**目的**: 全部署の投票スコープ設定を取得

**リクエスト**:
```http
GET /api/agenda-mode/voting-scopes
Authorization: Bearer {jwt}
```

**レスポンス例**:
```json
{
  "scopes": [
    {
      "departmentId": "DEPT-001",
      "departmentName": "看護部-看護科",
      "votingPattern": "A",
      "agendaUpgradeThreshold": 200,
      "votingScopeRules": {
        "pattern": "A",
        "patternLabel": "パターンA（配置単位別）",
        "grouping": "placement"
      }
    }
  ]
}
```

**データソース**:
- `AgendaModeConfig` テーブル
- `OrganizationStructure` テーブル（部署情報）

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-A2: 投票スコープ設定更新

**エンドポイント**: `PUT /api/agenda-mode/voting-scopes/{departmentId}`

**目的**: 特定部署の投票スコープ設定を更新

**リクエスト**:
```http
PUT /api/agenda-mode/voting-scopes/DEPT-001
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "votingPattern": "A",
  "agendaUpgradeThreshold": 200,
  "votingScopeRules": {
    "pattern": "A",
    "grouping": "placement"
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "updated": {
    "departmentId": "DEPT-001",
    "votingPattern": "A",
    "agendaUpgradeThreshold": 200
  }
}
```

**データソース**:
- `AgendaModeConfig` テーブル

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-A3: 投票グループ一覧取得

**エンドポイント**: `GET /api/agenda-mode/voting-groups`

**目的**: 全投票グループの一覧を取得

**リクエスト**:
```http
GET /api/agenda-mode/voting-groups
Authorization: Bearer {jwt}
```

**レスポンス例**:
```json
{
  "groups": [
    {
      "groupId": "GROUP-2024-001",
      "groupName": "小規模事務部門グループ",
      "groupType": "small_department",
      "memberDepartments": ["総務科", "経理科", "人事科"],
      "totalMembers": 22,
      "approverRotation": {
        "enabled": true,
        "type": "monthly",
        "currentApprover": "USER-010"
      }
    }
  ]
}
```

**データソース**:
- `VotingGroup` テーブル

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-A4: 投票グループ作成

**エンドポイント**: `POST /api/agenda-mode/voting-groups`

**目的**: 新しい投票グループを作成

**リクエスト**:
```http
POST /api/agenda-mode/voting-groups
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "groupName": "小規模事務部門グループ",
  "groupType": "small_department",
  "memberDepartmentIds": ["DEPT-010", "DEPT-011", "DEPT-012"],
  "approverRotation": {
    "enabled": true,
    "type": "monthly"
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "groupId": "GROUP-2024-001",
  "created": { /* グループ情報 */ }
}
```

**データソース**:
- `VotingGroup` テーブル

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-A5: 投票グループ更新

**エンドポイント**: `PUT /api/agenda-mode/voting-groups/{groupId}`

**目的**: 既存の投票グループを更新

**リクエスト**:
```http
PUT /api/agenda-mode/voting-groups/GROUP-2024-001
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "groupName": "小規模事務部門グループ（更新）",
  "memberDepartmentIds": ["DEPT-010", "DEPT-011", "DEPT-012", "DEPT-013"]
}
```

**レスポンス例**:
```json
{
  "success": true,
  "updated": { /* 更新後のグループ情報 */ }
}
```

**データソース**:
- `VotingGroup` テーブル

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-A6: 投票グループ削除

**エンドポイント**: `DELETE /api/agenda-mode/voting-groups/{groupId}`

**目的**: 投票グループを削除（ソフトデリート）

**リクエスト**:
```http
DELETE /api/agenda-mode/voting-groups/GROUP-2024-001
Authorization: Bearer {jwt}
```

**レスポンス例**:
```json
{
  "success": true,
  "deletedGroupId": "GROUP-2024-001"
}
```

**データソース**:
- `VotingGroup` テーブル

**優先度**: 🟡 **中**
**推定工数**: **1日**

---

#### API-A7: 主承認者ローテーション設定取得

**エンドポイント**: `GET /api/agenda-mode/voting-groups/{groupId}/approver-rotation`

**目的**: 投票グループの主承認者ローテーション設定を取得

**リクエスト**:
```http
GET /api/agenda-mode/voting-groups/GROUP-2024-001/approver-rotation
Authorization: Bearer {jwt}
```

**レスポンス例**:
```json
{
  "groupId": "GROUP-2024-001",
  "rotation": {
    "enabled": true,
    "type": "monthly",
    "approvers": [
      { "userId": "USER-010", "name": "佐藤 太郎", "level": 5 },
      { "userId": "USER-011", "name": "鈴木 花子", "level": 5 }
    ],
    "currentApprover": "USER-010",
    "nextRotationDate": "2025-11-01"
  }
}
```

**データソース**:
- `VotingGroup` テーブル
- `User` テーブル（承認者情報）

**優先度**: 🔴 **高**
**推定工数**: **1日**

---

#### API-A8: 主承認者ローテーション設定更新

**エンドポイント**: `PUT /api/agenda-mode/voting-groups/{groupId}/approver-rotation`

**目的**: 主承認者ローテーション設定を更新

**リクエスト**:
```http
PUT /api/agenda-mode/voting-groups/GROUP-2024-001/approver-rotation
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "enabled": true,
  "type": "quarterly",
  "approverUserIds": ["USER-010", "USER-011", "USER-012"]
}
```

**レスポンス例**:
```json
{
  "success": true,
  "updated": { /* 更新後のローテーション設定 */ }
}
```

**データソース**:
- `VotingGroup` テーブル

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

**議題モードAPI小計**: **10.5日**

---

### 1.2 プロジェクトモード設定API（8本）

#### API-P1: プロジェクトモード設定一覧取得

**エンドポイント**: `GET /api/project-mode/configs`

**目的**: 全部署のプロジェクトモード設定を取得

**リクエスト**:
```http
GET /api/project-mode/configs
Authorization: Bearer {jwt}
```

**レスポンス例**:
```json
{
  "configs": [
    {
      "id": "CONFIG-001",
      "departmentId": "DEPT-001",
      "departmentName": "看護部-看護科",
      "projectUpgradeThreshold": 200,
      "teamFormationRules": {
        "teamSize": { "min": 3, "recommended": 5, "max": 12 },
        "roleAssignment": {
          "autoAssignLeader": true,
          "leaderMinLevel": 5
        },
        "diversityRules": {
          "considerSpecialtyBalance": true,
          "prioritizeRelatedDepartments": true
        }
      },
      "metadata": {
        "thresholds": { "department": 200, "facility": 400, "corporate": 800 },
        "emergencyEscalation": { "enabled": true, "requiredLevel": 8 },
        "milestones": [ /* ... */ ],
        "notifications": { /* ... */ }
      }
    }
  ]
}
```

**データソース**:
- `ProjectModeConfig` テーブル
- `OrganizationStructure` テーブル（部署情報）

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-P2: プロジェクトモード設定詳細取得

**エンドポイント**: `GET /api/project-mode/configs/{departmentId}`

**目的**: 特定部署のプロジェクトモード設定を取得

**リクエスト**:
```http
GET /api/project-mode/configs/DEPT-001
Authorization: Bearer {jwt}
```

**レスポンス例**: （API-P1と同じ構造の単一オブジェクト）

**データソース**:
- `ProjectModeConfig` テーブル

**優先度**: 🔴 **高**
**推定工数**: **1日**

---

#### API-P3: 閾値設定更新

**エンドポイント**: `PUT /api/project-mode/configs/{departmentId}/thresholds`

**目的**: プロジェクト化閾値を更新

**リクエスト**:
```http
PUT /api/project-mode/configs/DEPT-001/thresholds
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "thresholds": {
    "department": 200,
    "facility": 400,
    "corporate": 800
  },
  "emergencyEscalation": {
    "enabled": true,
    "requiredLevel": 8
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "config": { /* 更新後の設定 */ }
}
```

**データソース**:
- `ProjectModeConfig` テーブル（metadata.thresholds, metadata.emergencyEscalation）

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-P4: チーム編成ルール更新

**エンドポイント**: `PUT /api/project-mode/configs/{departmentId}/team-formation-rules`

**目的**: チーム編成ルールを更新

**リクエスト**:
```http
PUT /api/project-mode/configs/DEPT-001/team-formation-rules
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "teamFormationRules": {
    "teamSize": {
      "min": 3,
      "recommended": 5,
      "max": 12
    },
    "roleAssignment": {
      "autoAssignLeader": true,
      "autoAssignSubLeader": true,
      "autoAssignRecorder": true,
      "leaderMinLevel": 5,
      "subLeaderMinLevel": 3
    },
    "diversityRules": {
      "considerSpecialtyBalance": true,
      "prioritizeRelatedDepartments": true
    }
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "config": { /* 更新後の設定 */ }
}
```

**データソース**:
- `ProjectModeConfig` テーブル（teamFormationRules）

**優先度**: 🔴 **高**
**推定工数**: **1.5日**

---

#### API-P5: 進捗管理設定更新

**エンドポイント**: `PUT /api/project-mode/configs/{departmentId}/progress-management`

**目的**: 進捗管理とマイルストーン設定を更新

**リクエスト**:
```http
PUT /api/project-mode/configs/DEPT-001/progress-management
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "milestoneRequired": true,
  "progressReportFrequency": "weekly",
  "milestones": [
    { "key": "kickoff", "label": "キックオフ", "daysAfterStart": 3 },
    { "key": "plan", "label": "計画書作成", "daysAfterKickoff": 7 },
    { "key": "midreport", "label": "中間報告", "percentagePoint": 50 },
    { "key": "final", "label": "最終報告", "daysBeforeEnd": 7 }
  ],
  "notifications": {
    "deadlineReminder": true,
    "deadlineReminderDays": 3,
    "delayAlert": true,
    "weeklyReport": true
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "config": { /* 更新後の設定 */ }
}
```

**データソース**:
- `ProjectModeConfig` テーブル（milestoneRequired, progressReportFrequency, metadata.milestones, metadata.notifications）

**優先度**: 🔴 **高**
**推定工数**: **2日**

---

#### API-P6: プロジェクトモードグループ設定一覧取得

**エンドポイント**: `GET /api/project-mode/group-configs`

**目的**: 投票グループ別のプロジェクトモード設定を取得

**リクエスト**:
```http
GET /api/project-mode/group-configs
Authorization: Bearer {jwt}
```

**レスポンス例**: （API-P1と同様の構造、ProjectModeGroupConfigのリスト）

**データソース**:
- `ProjectModeGroupConfig` テーブル

**優先度**: 🟡 **中**
**推定工数**: **1日**

---

#### API-P7: プロジェクトモードグループ設定更新

**エンドポイント**: `PUT /api/project-mode/group-configs/{groupId}`

**目的**: 投票グループ別の設定を更新

**リクエスト**: （API-P3〜P5と同様の構造）

**データソース**:
- `ProjectModeGroupConfig` テーブル

**優先度**: 🟡 **中**
**推定工数**: **1.5日**

---

#### API-P8: デフォルト値取得

**エンドポイント**: `GET /api/project-mode/defaults`

**目的**: 新規部署作成時のデフォルト設定値を取得

**リクエスト**:
```http
GET /api/project-mode/defaults
Authorization: Bearer {jwt}
```

**レスポンス例**:
```json
{
  "defaultThresholds": { "department": 200, "facility": 400, "corporate": 800 },
  "defaultTeamFormationRules": {
    "teamSize": { "min": 3, "recommended": 5, "max": 12 },
    "roleAssignment": { "autoAssignLeader": true },
    "diversityRules": { "considerSpecialtyBalance": true }
  },
  "defaultMilestones": [ /* ... */ ],
  "defaultNotifications": { "deadlineReminder": true, "delayAlert": true }
}
```

**データソース**:
- システムデフォルト値（ハードコード or 設定ファイル）

**優先度**: 🟢 **低**
**推定工数**: **0.5日**

---

**プロジェクトモードAPI小計**: **10.5日**

---

### 1.3 設定変更履歴API（4本）

#### API-H1: 変更履歴一覧取得

**エンドポイント**: `GET /api/voting-settings/change-logs`

**目的**: 変更履歴の一覧を取得

**リクエスト**:
```http
GET /api/voting-settings/change-logs?mode=all&page=1&limit=50
Authorization: Bearer {jwt}
```

**クエリパラメータ**:
- `mode`: `all` | `agenda` | `project`
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 50）
- `startDate`: 開始日（オプション）
- `endDate`: 終了日（オプション）

**レスポンス例**:
```json
{
  "logs": [
    {
      "id": "LOG-2025-001",
      "date": "2025-10-13T14:30:00Z",
      "mode": "agenda",
      "category": "投票スコープ設定",
      "user": "山田 太郎",
      "userLevel": 99,
      "action": "看護部-看護科の投票パターンをパターンCからパターンAに変更",
      "impact": "約80名に影響",
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
    "hasNext": false
  }
}
```

**データソース**:
- `VotingSettingChangeLog` テーブル
- `User` テーブル（変更者情報）

**優先度**: 🔴 **高**
**推定工数**: **2.5日**

---

#### API-H2: 変更履歴詳細取得

**エンドポイント**: `GET /api/voting-settings/change-logs/{logId}`

**目的**: 特定の変更履歴の詳細を取得

**リクエスト**:
```http
GET /api/voting-settings/change-logs/LOG-2025-001
Authorization: Bearer {jwt}
```

**レスポンス例**:
```json
{
  "id": "LOG-2025-001",
  "mode": "agenda",
  "category": "投票スコープ設定",
  "subcategory": "パターン変更",
  "changeDescription": "看護部-看護科の投票パターンをパターンCからパターンAに変更",
  "impactDescription": "約80名に影響",
  "beforeValue": {
    "departmentId": "DEPT-001",
    "departmentName": "看護部-看護科",
    "votingPattern": "C"
  },
  "afterValue": {
    "departmentId": "DEPT-001",
    "departmentName": "看護部-看護科",
    "votingPattern": "A"
  },
  "changedBy": {
    "id": "USER-001",
    "name": "山田 太郎",
    "permissionLevel": 99
  },
  "changedAt": "2025-10-13T14:30:00Z",
  "status": "active",
  "metadata": {
    "affectedUserCount": 80,
    "affectedDepartments": ["看護部-看護科"]
  }
}
```

**データソース**:
- `VotingSettingChangeLog` テーブル
- `User` テーブル（変更者情報）

**優先度**: 🟡 **中**
**推定工数**: **2日**

---

#### API-H3: 変更履歴記録（内部API）

**エンドポイント**: `POST /api/voting-settings/change-logs`

**目的**: 設定変更時に自動的に履歴を記録

**リクエスト**:
```http
POST /api/voting-settings/change-logs
Authorization: Bearer {jwt}
Content-Type: application/json
```

```json
{
  "mode": "agenda",
  "category": "voting_scope_setting",
  "subcategory": "pattern_change",
  "changeDescription": "看護部-看護科の投票パターンをパターンCからパターンAに変更",
  "impactDescription": "約80名に影響",
  "beforeValue": { /* ... */ },
  "afterValue": { /* ... */ },
  "relatedEntityType": "AgendaModeConfig",
  "relatedEntityId": "CONFIG-001",
  "metadata": { /* ... */ }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "logId": "LOG-2025-001",
  "createdAt": "2025-10-13T14:30:00Z"
}
```

**データソース**:
- `VotingSettingChangeLog` テーブル

**優先度**: 🔴 **高**
**推定工数**: **2日**

**呼び出しタイミング**:
- API-A2, A4, A5, A6, A8（議題モード設定変更時）
- API-P3, P4, P5, P7（プロジェクトモード設定変更時）

---

#### API-H4: 履歴エクスポート

**エンドポイント**: `GET /api/voting-settings/change-logs/export`

**目的**: CSV形式で履歴をエクスポート

**リクエスト**:
```http
GET /api/voting-settings/change-logs/export?mode=all&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {jwt}
```

**レスポンス**: CSV形式
```csv
変更日時,モード,カテゴリ,変更者,権限レベル,変更内容,影響範囲,ステータス
2025-10-13 14:30,議題モード,投票スコープ設定,山田 太郎,99,看護部-看護科の投票パターンをパターンCからパターンAに変更,約80名に影響,active
2025-10-11 10:20,議題モード,投票グループ管理,山田 太郎,99,「小規模事務部門グループ」を新規作成（総務科、経理科、人事科）,22名が新グループに統合,active
```

**データソース**:
- `VotingSettingChangeLog` テーブル
- `User` テーブル（変更者情報）

**優先度**: 🟢 **低**
**推定工数**: **1.5日**

---

**設定変更履歴API小計**: **8日**

---

### 1.4 自動ログ記録の統合

**作業内容**: 既存の投票設定変更APIに、自動ログ記録処理（API-H3呼び出し）を統合

**統合が必要なAPI**:
1. API-A2, A4, A5, A6, A8（議題モード: 5本）
2. API-P3, P4, P5, P7（プロジェクトモード: 4本）

**実装例**:
```typescript
// 例: src/api/routes/agenda-mode.routes.ts

router.put('/voting-scopes/:departmentId', async (req, res) => {
  const { departmentId } = req.params;
  const { votingPattern, votingScopeRules } = req.body;
  const userId = req.user.id;

  // 変更前の値を取得
  const beforeConfig = await prisma.agendaModeConfig.findUnique({
    where: { departmentId },
    include: { department: true }
  });

  // 設定を更新
  const afterConfig = await prisma.agendaModeConfig.update({
    where: { departmentId },
    data: { votingScopeRules }
  });

  // 🆕 変更履歴を記録
  await prisma.votingSettingChangeLog.create({
    data: {
      mode: 'agenda',
      category: 'voting_scope_setting',
      subcategory: 'pattern_change',
      changeDescription: `${beforeConfig.department.departmentName}の投票パターンを${beforeConfig.votingScopeRules.pattern}から${votingPattern}に変更`,
      impactDescription: `約${beforeConfig.department.memberCount}名に影響`,
      beforeValue: beforeConfig.votingScopeRules,
      afterValue: votingScopeRules,
      changedBy: userId,
      changedByLevel: req.user.permissionLevel,
      relatedEntityType: 'AgendaModeConfig',
      relatedEntityId: departmentId,
      metadata: {
        affectedUserCount: beforeConfig.department.memberCount,
        affectedDepartments: [beforeConfig.department.departmentName]
      }
    }
  });

  res.json({ success: true, updated: afterConfig });
});
```

**優先度**: 🔴 **高**
**推定工数**: **3日**

---

## 2. 必要なDB変更

### 2.1 新規テーブル追加

#### VotingSettingChangeLog（設定変更履歴）

**必要性**: 🔴 **必須**

**Prismaスキーマ**:
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

---

### 2.2 既存モデル更新

#### Userモデル

**必要な変更**:
```prisma
model User {
  // ... 既存フィールド

  // 🆕 投票設定変更履歴 Relations
  settingChanges      VotingSettingChangeLog[]  @relation("SettingChangeUser")
  settingReverts      VotingSettingChangeLog[]  @relation("SettingRevertUser")
}
```

---

### 2.3 既存テーブルのJSON拡張

#### ProjectModeConfig

**拡張するJSONフィールド**:

1. **metadata.thresholds**:
```json
{
  "department": 200,
  "facility": 400,
  "corporate": 800
}
```

2. **metadata.emergencyEscalation**:
```json
{
  "enabled": true,
  "requiredLevel": 8
}
```

3. **metadata.milestones**:
```json
[
  { "key": "kickoff", "label": "キックオフ", "daysAfterStart": 3 },
  { "key": "plan", "label": "計画書作成", "daysAfterKickoff": 7 },
  { "key": "midreport", "label": "中間報告", "percentagePoint": 50 },
  { "key": "final", "label": "最終報告", "daysBeforeEnd": 7 }
]
```

4. **metadata.notifications**:
```json
{
  "deadlineReminder": true,
  "deadlineReminderDays": 3,
  "delayAlert": true,
  "weeklyReport": true
}
```

5. **teamFormationRules**:
```json
{
  "teamSize": { "min": 3, "recommended": 5, "max": 12 },
  "roleAssignment": {
    "autoAssignLeader": true,
    "autoAssignSubLeader": true,
    "autoAssignRecorder": true,
    "leaderMinLevel": 5,
    "subLeaderMinLevel": 3
  },
  "diversityRules": {
    "considerSpecialtyBalance": true,
    "prioritizeRelatedDepartments": true
  }
}
```

**注**: スキーマ変更は不要（既存のJson型フィールドを活用）

---

## 3. フロントエンド実装

### 3.1 議題モード設定ページ

**ファイル**: `src/pages/admin/AgendaModeSettingsPage.tsx`

| 項目 | 状態 | 推定工数 |
|------|------|---------|
| ページUI | ✅ 完了 | - |
| データ取得ロジック | 🔴 未実装 | 1日 |
| 投票スコープ設定更新 | 🔴 未実装 | 1日 |
| 投票グループCRUD | 🔴 未実装 | 1日 |

**小計**: **3日**

---

### 3.2 プロジェクトモード設定ページ

**ファイル**: `src/pages/admin/ProjectModeSettingsPage.tsx`

| 項目 | 状態 | 推定工数 |
|------|------|---------|
| ページUI | ✅ 完了 | - |
| データ取得ロジック | 🔴 未実装 | 1日 |
| 閾値設定更新 | 🔴 未実装 | 0.5日 |
| チーム編成ルール更新 | 🔴 未実装 | 0.5日 |
| 進捗管理設定更新 | 🔴 未実装 | 0.5日 |
| バリデーション処理 | 🔴 未実装 | 0.5日 |

**小計**: **3日**

---

### 3.3 設定変更履歴ページ

**ファイル**: `src/pages/admin/VotingHistoryPage.tsx`

| 項目 | 状態 | 推定工数 |
|------|------|---------|
| ページUI | ✅ 完了 | - |
| データ取得ロジック | 🔴 未実装 | 1日 |
| 詳細モーダル | 🔴 未実装 | 0.5日 |
| エクスポート機能 | 🔴 未実装 | 0.5日 |

**小計**: **2日**

---

**フロントエンド総工数**: **8日**

---

## 4. TypeScript型定義

### 4.1 プロジェクトモード設定型定義

**新規ファイル**: `src/types/project-mode-config.ts`

**推定工数**: **0.5日**

---

## 5. 総工数見積もり

### 5.1 API実装

| カテゴリ | API数 | 推定工数 |
|---------|------|---------|
| 議題モード設定 | 8本 | 10.5日 |
| プロジェクトモード設定 | 8本 | 10.5日 |
| 設定変更履歴 | 4本 | 8日 |
| 自動ログ記録統合 | - | 3日 |
| **API実装小計** | **20本** | **32日** |

---

### 5.2 DB・スキーマ作業

| 作業項目 | 推定工数 |
|---------|---------|
| VotingSettingChangeLog テーブル追加 | 0.5日 |
| User Relations追加 | 0.5日 |
| マイグレーション実行 | 0.5日 |
| TypeScript型定義追加 | 0.5日 |
| **DB作業小計** | **2日** |

---

### 5.3 フロントエンド実装

| ページ | 推定工数 |
|--------|---------|
| 議題モード設定 | 3日 |
| プロジェクトモード設定 | 3日 |
| 設定変更履歴 | 2日 |
| **フロントエンド小計** | **8日** |

---

### 5.4 テスト・最適化

| 作業項目 | 推定工数 |
|---------|---------|
| E2Eテスト実装 | 2日 |
| 単体テスト実装 | 2日 |
| 性能最適化 | 0.5日 |
| ドキュメント整備 | 0.5日 |
| **テスト小計** | **5日** |

---

### 5.5 総合計

| カテゴリ | 推定工数 |
|---------|---------|
| API実装 | 32日 |
| DB・スキーマ作業 | 2日 |
| フロントエンド実装 | 8日 |
| テスト・最適化 | 5日 |
| **総工数** | **47日** |

**並行開発を考慮した総期間**: 約 **34日**（6.8週間）

---

## 6. 実装フェーズ

### Phase 1: 基盤整備（2日）

- VotingSettingChangeLog テーブル追加
- User Relations追加
- マイグレーション実行
- TypeScript型定義追加

---

### Phase 2: 議題モード設定機能（13.5日）

- 議題モード設定API実装（8本）
- AgendaModeSettingsPageのデータ取得・更新ロジック実装

---

### Phase 3: プロジェクトモード設定機能（13.5日）

- プロジェクトモード設定API実装（8本）
- ProjectModeSettingsPageのデータ取得・更新ロジック実装

---

### Phase 4: 設定変更履歴機能（13日）

- 変更履歴API実装（4本）
- 既存APIに自動ログ記録統合
- VotingHistoryPageのデータ取得ロジック実装

---

### Phase 5: テスト・最適化（5日）

- E2Eテスト実装
- 単体テスト実装
- 性能最適化
- ドキュメント整備

---

## 7. 優先度マトリクス

| API/機能 | 優先度 | 理由 |
|---------|--------|------|
| API-A1〜A3, A4, A5, A7, A8 | 🔴 高 | 議題モード設定の基本機能 |
| API-P1〜P5 | 🔴 高 | プロジェクトモード設定の基本機能 |
| API-H1, H3 | 🔴 高 | 履歴表示と自動記録 |
| 自動ログ記録統合 | 🔴 高 | 監査証跡として必須 |
| API-A6 | 🟡 中 | グループ削除機能 |
| API-P6, P7 | 🟡 中 | グループ別設定 |
| API-H2 | 🟡 中 | 履歴詳細表示 |
| API-P8 | 🟢 低 | デフォルト値取得 |
| API-H4 | 🟢 低 | エクスポート機能 |

---

## 8. 依存関係

### 8.1 前提条件

- ✅ VotingGroup テーブル実装済み
- ✅ AgendaModeConfig テーブル実装済み
- ✅ ProjectModeConfig テーブル実装済み
- ✅ User テーブル実装済み

### 8.2 実装順序

1. **Phase 1（基盤整備）**を最初に実施
2. **Phase 2（議題モード）**と**Phase 3（プロジェクトモード）**は並行開発可能
3. **Phase 4（履歴）**はPhase 2, 3の後に実施（自動ログ記録統合のため）
4. **Phase 5（テスト）**は全Phase完了後に実施

---

## 9. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| JSON拡張の複雑性 | 中 | TypeScript型定義を明確化、バリデーション処理を強化 |
| 自動ログ記録の統合漏れ | 高 | チェックリストを作成、E2Eテストで全パターン確認 |
| 設定変更の影響範囲計算 | 中 | 影響範囲計算ロジックを関数化、テストを充実 |
| 大量履歴データのパフォーマンス | 低 | インデックス最適化、ページネーション実装 |

---

## 10. まとめ

### 10.1 必要なAPI

- **議題モード設定API**: 8本（10.5日）
- **プロジェクトモード設定API**: 8本（10.5日）
- **設定変更履歴API**: 4本（8日）
- **自動ログ記録統合**: 3日
- **合計**: 20本、32日

### 10.2 必要なDB変更

- 🔴 **新規テーブル**: VotingSettingChangeLog
- 🔴 **User Relations追加**: settingChanges, settingReverts
- ✅ **既存テーブル**: 変更不要（JSON拡張で対応）

### 10.3 フロントエンド実装

- **議題モード設定ページ**: 3日
- **プロジェクトモード設定ページ**: 3日
- **設定変更履歴ページ**: 2日
- **合計**: 8日

### 10.4 総工数

- **総工数**: 47日
- **並行開発考慮**: 約34日（6.8週間）

---

**文書終了**

**作成者**: VoiceDriveチーム
**承認**: 未承認（レビュー待ち）
**最終更新**: 2025年10月21日
