# CommitteeSettingsPage DB要件分析書

**作成日**: 2025-10-28
**対象ページ**: [CommitteeSettingsPage.tsx](../src/pages/admin/CommitteeSettingsPage.tsx)
**アクセス権限**: Level 99（システム管理者）専用
**作成者**: VoiceDrive開発チーム

---

## 📋 目次

1. [ページ概要](#ページ概要)
2. [機能分析](#機能分析)
3. [データ要件分析](#データ要件分析)
4. [責任分界点定義](#責任分界点定義)
5. [不足項目の洗い出し](#不足項目の洗い出し)
6. [データベース設計](#データベース設計)
7. [API設計](#api設計)
8. [実装優先度](#実装優先度)

---

## 📄 ページ概要

### アクセスパス
```
SystemOperationsPage > 委員会設定カード → CommitteeSettingsPage
```

### 主要機能
委員会システムの業務設定を管理する設定画面

### 3つのタブ構成

| タブID | タブ名 | 機能概要 |
|--------|--------|---------|
| `status` | ステータス・優先度 | 議題ステータス、優先度レベル、議題タイプのマスター設定 |
| `meeting` | 会議スケジュール | デフォルト会議日時、期限設定 |
| `approval` | 承認フロー | 承認必須化、承認者レベル、通知設定 |

---

## 🔍 機能分析

### 1. ステータス・優先度タブ

#### 1-1. 議題ステータス設定

**現在のハードコーディング値**:
```typescript
const [agendaStatuses, setAgendaStatuses] = useState([
  { id: 'pending', name: '審議待ち', color: '#FFA500', enabled: true },
  { id: 'in_review', name: '審議中', color: '#2196F3', enabled: true },
  { id: 'approved', name: '承認', color: '#4CAF50', enabled: true },
  { id: 'rejected', name: '却下', color: '#F44336', enabled: true },
  { id: 'on_hold', name: '保留', color: '#9E9E9E', enabled: true }
]);
```

**機能**:
- 各ステータスのON/OFF切り替え
- 色の視覚的表示
- 無効化されたステータスは議題作成時に選択不可になる想定

#### 1-2. 優先度レベル設定

**現在のハードコーディング値**:
```typescript
const [priorityLevels, setPriorityLevels] = useState([
  { id: 'critical', name: '緊急', color: '#F44336', enabled: true },
  { id: 'high', name: '高', color: '#FF9800', enabled: true },
  { id: 'normal', name: '通常', color: '#2196F3', enabled: true },
  { id: 'low', name: '低', color: '#9E9E9E', enabled: true }
]);
```

**機能**:
- 各優先度レベルのON/OFF切り替え
- 色の視覚的表示

#### 1-3. 議題タイプ設定

**現在のハードコーディング値**:
```typescript
const [agendaTypes, setAgendaTypes] = useState([
  { id: 'committee_proposal', name: '委員会提案', enabled: true },
  { id: 'facility_policy', name: '施設方針', enabled: true },
  { id: 'hr', name: '人事', enabled: true },
  { id: 'budget', name: '予算', enabled: true },
  { id: 'equipment', name: '設備', enabled: true }
]);
```

**機能**:
- 各議題タイプのON/OFF切り替え

---

### 2. 会議スケジュールタブ

**現在のハードコーディング値**:
```typescript
const [meetingSettings, setMeetingSettings] = useState<Record<string, CommitteeSetting>>({
  defaultMeetingDay: {
    key: 'defaultMeetingDay',
    value: '第2木曜日',
    type: 'string',
    description: 'デフォルト会議開催日',
    category: 'meeting'
  },
  defaultMeetingTime: {
    key: 'defaultMeetingTime',
    value: '14:00',
    type: 'string',
    description: 'デフォルト会議開始時刻',
    category: 'meeting'
  },
  meetingDurationMinutes: {
    key: 'meetingDurationMinutes',
    value: 120,
    type: 'number',
    description: '会議時間（分）',
    category: 'meeting'
  },
  agendaSubmissionDeadlineDays: {
    key: 'agendaSubmissionDeadlineDays',
    value: 7,
    type: 'number',
    description: '議題提出期限（会議の何日前）',
    category: 'meeting'
  },
  minutesPublishDeadlineDays: {
    key: 'minutesPublishDeadlineDays',
    value: 3,
    type: 'number',
    description: '議事録公開期限（会議後何日以内）',
    category: 'meeting'
  }
});
```

**機能**:
- 会議スケジュールのデフォルト値設定
- 期限管理のルール設定

---

### 3. 承認フロータブ

**現在のハードコーディング値**:
```typescript
const [approvalSettings, setApprovalSettings] = useState<Record<string, CommitteeSetting>>({
  requireApproval: {
    key: 'requireApproval',
    value: true,
    type: 'boolean',
    description: '議題提出時の承認を必須にする',
    category: 'approval'
  },
  minApproverLevel: {
    key: 'minApproverLevel',
    value: 8,
    type: 'number',
    description: '承認者の最低権限レベル',
    category: 'approval'
  },
  approvalDeadlineHours: {
    key: 'approvalDeadlineHours',
    value: 48,
    type: 'number',
    description: '承認期限（時間）',
    category: 'approval'
  },
  autoApproveAfterDeadline: {
    key: 'autoApproveAfterDeadline',
    value: false,
    type: 'boolean',
    description: '期限超過後の自動承認',
    category: 'approval'
  },
  notifyApproverByEmail: {
    key: 'notifyApproverByEmail',
    value: true,
    type: 'boolean',
    description: '承認者へのメール通知',
    category: 'approval'
  }
});
```

**機能**:
- 承認フローの有効化/無効化
- 承認者の権限レベル制御
- 自動承認ルール設定
- メール通知設定

---

## 📊 データ要件分析

### 必要なデータソース

| データカテゴリ | データ内容 | 用途 |
|--------------|----------|------|
| **議題ステータス** | id, name, color, enabled, displayOrder | 議題作成・管理で使用するステータス選択肢 |
| **優先度レベル** | id, name, color, enabled, displayOrder | 議題作成時の優先度選択肢 |
| **議題タイプ** | id, name, enabled, displayOrder | 議題作成時のタイプ選択肢 |
| **会議スケジュール設定** | key-value形式の設定値 | 会議作成時のデフォルト値 |
| **承認フロー設定** | key-value形式の設定値 | 議題提出時の承認ルール |

### データの特性

| 特性 | 内容 |
|-----|------|
| **更新頻度** | 低頻度（月1回程度、もしくは業務ルール変更時のみ） |
| **データ量** | 小規模（各カテゴリ10件以下） |
| **整合性要件** | 高（無効化されたステータスを使用している既存議題との整合性が必要） |
| **監査要件** | 高（Level 99による設定変更は全て監査ログに記録） |

---

## 🔀 責任分界点定義

### データ管理責任の分担

| データ項目 | 管理責任 | 理由 |
|-----------|---------|------|
| **議題ステータス** | 🟦 VoiceDrive | VoiceDrive独自の委員会ワークフロー設定 |
| **優先度レベル** | 🟦 VoiceDrive | VoiceDrive独自の優先度ルール |
| **議題タイプ** | 🟦 VoiceDrive | VoiceDrive独自の分類体系 |
| **会議スケジュール設定** | 🟦 VoiceDrive | 各施設の運用ルールを反映 |
| **承認フロー設定** | 🟦 VoiceDrive | VoiceDrive独自の権限レベル体系に基づく |

### API連携要件

| 項目 | 連携要否 | 理由 |
|-----|---------|------|
| **マスター同期** | ❌ 不要 | VoiceDrive完結の設定情報 |
| **変更通知** | ❌ 不要 | 医療システムへの影響なし |
| **参照API** | ❌ 不要 | VoiceDrive内部で完結 |

**結論**: CommitteeSettingsPageは **100% VoiceDrive管理** のデータ

---

## ❌ 不足項目の洗い出し

### 1. データベーステーブルの不足

#### 現在のschema.prismaの状態

```prisma
// ✅ 存在するテーブル
model ManagementCommitteeAgenda {
  // 議題データ（statusやpriorityフィールドはString型）
  status    String  @default("pending")
  priority  String  @default("normal")
  agendaType String
}

// ❌ 不足しているテーブル
// - 議題ステータスマスター
// - 優先度レベルマスター
// - 議題タイプマスター
// - 会議スケジュール設定
// - 承認フロー設定
```

### 2. 不足テーブル一覧

| テーブル名 | 用途 | 優先度 |
|-----------|------|--------|
| `CommitteeAgendaStatus` | 議題ステータスマスター | 🔴 高 |
| `CommitteePriorityLevel` | 優先度レベルマスター | 🔴 高 |
| `CommitteeAgendaType` | 議題タイプマスター | 🔴 高 |
| `CommitteeSystemSetting` | 会議・承認フロー設定（Key-Value） | 🔴 高 |

### 3. 不足APIエンドポイント

#### 3-1. 読み取りAPI

| エンドポイント | メソッド | 用途 |
|--------------|---------|------|
| `/api/committee/settings/statuses` | GET | 議題ステータス一覧取得 |
| `/api/committee/settings/priorities` | GET | 優先度レベル一覧取得 |
| `/api/committee/settings/types` | GET | 議題タイプ一覧取得 |
| `/api/committee/settings/meeting` | GET | 会議スケジュール設定取得 |
| `/api/committee/settings/approval` | GET | 承認フロー設定取得 |

#### 3-2. 更新API

| エンドポイント | メソッド | 用途 |
|--------------|---------|------|
| `/api/committee/settings/statuses` | PUT | 議題ステータス一括更新 |
| `/api/committee/settings/priorities` | PUT | 優先度レベル一括更新 |
| `/api/committee/settings/types` | PUT | 議題タイプ一括更新 |
| `/api/committee/settings/meeting` | PUT | 会議スケジュール設定更新 |
| `/api/committee/settings/approval` | PUT | 承認フロー設定更新 |

---

## 🗄️ データベース設計

### 1. CommitteeAgendaStatus（議題ステータスマスター）

```prisma
model CommitteeAgendaStatus {
  id           String   @id @default(cuid())
  statusId     String   @unique @map("status_id")        // 'pending', 'in_review', etc.
  name         String                                     // '審議待ち', '審議中', etc.
  color        String                                     // '#FFA500', etc.
  enabled      Boolean  @default(true)
  displayOrder Int      @default(0) @map("display_order")
  description  String?                                    // 説明文
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([enabled])
  @@index([displayOrder])
  @@map("committee_agenda_statuses")
}
```

**初期データ**:
```sql
INSERT INTO committee_agenda_statuses (status_id, name, color, enabled, display_order) VALUES
  ('pending', '審議待ち', '#FFA500', true, 1),
  ('in_review', '審議中', '#2196F3', true, 2),
  ('approved', '承認', '#4CAF50', true, 3),
  ('rejected', '却下', '#F44336', true, 4),
  ('on_hold', '保留', '#9E9E9E', true, 5);
```

---

### 2. CommitteePriorityLevel（優先度レベルマスター）

```prisma
model CommitteePriorityLevel {
  id           String   @id @default(cuid())
  priorityId   String   @unique @map("priority_id")      // 'critical', 'high', etc.
  name         String                                     // '緊急', '高', etc.
  color        String                                     // '#F44336', etc.
  enabled      Boolean  @default(true)
  displayOrder Int      @default(0) @map("display_order")
  description  String?                                    // 説明文
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([enabled])
  @@index([displayOrder])
  @@map("committee_priority_levels")
}
```

**初期データ**:
```sql
INSERT INTO committee_priority_levels (priority_id, name, color, enabled, display_order) VALUES
  ('critical', '緊急', '#F44336', true, 1),
  ('high', '高', '#FF9800', true, 2),
  ('normal', '通常', '#2196F3', true, 3),
  ('low', '低', '#9E9E9E', true, 4);
```

---

### 3. CommitteeAgendaType（議題タイプマスター）

```prisma
model CommitteeAgendaType {
  id           String   @id @default(cuid())
  typeId       String   @unique @map("type_id")          // 'committee_proposal', etc.
  name         String                                     // '委員会提案', etc.
  enabled      Boolean  @default(true)
  displayOrder Int      @default(0) @map("display_order")
  description  String?                                    // 説明文
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([enabled])
  @@index([displayOrder])
  @@map("committee_agenda_types")
}
```

**初期データ**:
```sql
INSERT INTO committee_agenda_types (type_id, name, enabled, display_order) VALUES
  ('committee_proposal', '委員会提案', true, 1),
  ('facility_policy', '施設方針', true, 2),
  ('hr', '人事', true, 3),
  ('budget', '予算', true, 4),
  ('equipment', '設備', true, 5);
```

---

### 4. CommitteeSystemSetting（システム設定Key-Value）

```prisma
model CommitteeSystemSetting {
  id          String   @id @default(cuid())
  category    String                                     // 'meeting' or 'approval'
  settingKey  String   @map("setting_key")               // 'defaultMeetingDay', etc.
  settingValue String  @map("setting_value")             // JSON文字列として保存
  valueType   String   @map("value_type")                // 'string', 'number', 'boolean'
  description String                                     // 設定の説明
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([category, settingKey])
  @@index([category])
  @@map("committee_system_settings")
}
```

**初期データ**:
```sql
-- 会議スケジュール設定
INSERT INTO committee_system_settings (category, setting_key, setting_value, value_type, description) VALUES
  ('meeting', 'defaultMeetingDay', '第2木曜日', 'string', 'デフォルト会議開催日'),
  ('meeting', 'defaultMeetingTime', '14:00', 'string', 'デフォルト会議開始時刻'),
  ('meeting', 'meetingDurationMinutes', '120', 'number', '会議時間（分）'),
  ('meeting', 'agendaSubmissionDeadlineDays', '7', 'number', '議題提出期限（会議の何日前）'),
  ('meeting', 'minutesPublishDeadlineDays', '3', 'number', '議事録公開期限（会議後何日以内）');

-- 承認フロー設定
INSERT INTO committee_system_settings (category, setting_key, setting_value, value_type, description) VALUES
  ('approval', 'requireApproval', 'true', 'boolean', '議題提出時の承認を必須にする'),
  ('approval', 'minApproverLevel', '8', 'number', '承認者の最低権限レベル'),
  ('approval', 'approvalDeadlineHours', '48', 'number', '承認期限（時間）'),
  ('approval', 'autoApproveAfterDeadline', 'false', 'boolean', '期限超過後の自動承認'),
  ('approval', 'notifyApproverByEmail', 'true', 'boolean', '承認者へのメール通知');
```

---

## 🔌 API設計

### 1. 議題ステータス管理API

#### GET `/api/committee/settings/statuses`
**レスポンス例**:
```json
{
  "statuses": [
    {
      "id": "cuid_xxx",
      "statusId": "pending",
      "name": "審議待ち",
      "color": "#FFA500",
      "enabled": true,
      "displayOrder": 1
    },
    ...
  ]
}
```

#### PUT `/api/committee/settings/statuses`
**リクエスト例**:
```json
{
  "statuses": [
    {
      "statusId": "pending",
      "enabled": false
    },
    ...
  ]
}
```

**レスポンス例**:
```json
{
  "success": true,
  "updated": 5
}
```

---

### 2. 優先度レベル管理API

#### GET `/api/committee/settings/priorities`
**レスポンス例**:
```json
{
  "priorities": [
    {
      "id": "cuid_xxx",
      "priorityId": "critical",
      "name": "緊急",
      "color": "#F44336",
      "enabled": true,
      "displayOrder": 1
    },
    ...
  ]
}
```

#### PUT `/api/committee/settings/priorities`
**リクエスト例**:
```json
{
  "priorities": [
    {
      "priorityId": "low",
      "enabled": false
    },
    ...
  ]
}
```

---

### 3. 議題タイプ管理API

#### GET `/api/committee/settings/types`
**レスポンス例**:
```json
{
  "types": [
    {
      "id": "cuid_xxx",
      "typeId": "committee_proposal",
      "name": "委員会提案",
      "enabled": true,
      "displayOrder": 1
    },
    ...
  ]
}
```

#### PUT `/api/committee/settings/types`
**リクエスト例**:
```json
{
  "types": [
    {
      "typeId": "equipment",
      "enabled": false
    },
    ...
  ]
}
```

---

### 4. 会議スケジュール設定API

#### GET `/api/committee/settings/meeting`
**レスポンス例**:
```json
{
  "settings": {
    "defaultMeetingDay": "第2木曜日",
    "defaultMeetingTime": "14:00",
    "meetingDurationMinutes": 120,
    "agendaSubmissionDeadlineDays": 7,
    "minutesPublishDeadlineDays": 3
  }
}
```

#### PUT `/api/committee/settings/meeting`
**リクエスト例**:
```json
{
  "defaultMeetingDay": "第3金曜日",
  "meetingDurationMinutes": 90
}
```

---

### 5. 承認フロー設定API

#### GET `/api/committee/settings/approval`
**レスポンス例**:
```json
{
  "settings": {
    "requireApproval": true,
    "minApproverLevel": 8,
    "approvalDeadlineHours": 48,
    "autoApproveAfterDeadline": false,
    "notifyApproverByEmail": true
  }
}
```

#### PUT `/api/committee/settings/approval`
**リクエスト例**:
```json
{
  "requireApproval": false,
  "minApproverLevel": 7
}
```

---

## 📈 実装優先度

### Phase 1: マスターデータ基盤（優先度: 🔴 最高）

| タスク | 工数 | 理由 |
|-------|------|------|
| 1. 4つのテーブル作成（Prismaスキーマ） | 2時間 | 基盤となるデータ構造 |
| 2. マイグレーション実行 | 30分 | DB反映 |
| 3. 初期データ投入（シードスクリプト） | 1時間 | 5つのステータス、4つの優先度、5つのタイプ、10個の設定値 |
| 4. 読み取りAPI実装（5エンドポイント） | 3時間 | フロントエンドとの接続 |

**合計**: 約7時間

---

### Phase 2: 更新機能実装（優先度: 🟡 中）

| タスク | 工数 | 理由 |
|-------|------|------|
| 1. 更新API実装（5エンドポイント） | 4時間 | Level 99による設定変更機能 |
| 2. 監査ログ統合 | 1時間 | AuditServiceとの連携 |
| 3. フロントエンド接続 | 2時間 | CommitteeSettingsPageのAPI接続 |

**合計**: 約7時間

---

### Phase 3: 整合性チェック（優先度: 🟡 中）

| タスク | 工数 | 理由 |
|-------|------|------|
| 1. 既存議題データとの整合性検証 | 2時間 | 無効化されたステータスを使用している議題の洗い出し |
| 2. マイグレーション対応 | 2時間 | 既存データの移行処理 |
| 3. バリデーション実装 | 2時間 | 整合性チェック機能 |

**合計**: 約6時間

---

## 📝 まとめ

### 現状
- **データベーステーブル**: 0/4（全て不足）
- **APIエンドポイント**: 0/10（全て不足）
- **データ管理責任**: 100% VoiceDrive（医療システム連携不要）

### 必要な作業
1. ✅ **テーブル設計**: 完了（本文書に記載）
2. ⏳ **Prismaスキーマ更新**: 未実施
3. ⏳ **マイグレーション実行**: 未実施
4. ⏳ **シードデータ作成**: 未実施
5. ⏳ **API実装**: 未実施

### 推定工数
- **Phase 1**: 7時間（マスターデータ基盤）
- **Phase 2**: 7時間（更新機能実装）
- **Phase 3**: 6時間（整合性チェック）
- **合計**: **約20時間**

---

**次のステップ**: `CommitteeSettingsPage暫定マスターリスト_20251028.md` の作成

---

**作成日**: 2025-10-28
**最終更新**: 2025-10-28
