# InterviewSettingsPage DB要件分析書

**作成日**: 2025-10-28
**対象ページ**: [InterviewSettingsPage.tsx](../src/pages/admin/InterviewSettingsPage.tsx)
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
SystemOperationsPage > 面談設定カード → InterviewSettingsPage
```

### 主要機能
面談システムの業務設定を管理する設定画面

### 3つのタブ構成

| タブID | タブ名 | 機能概要 |
|--------|--------|---------|
| `types` | 面談タイプ | 面談タイプの有効化/無効化管理 |
| `schedule` | スケジュール | 面談時間帯、枠数設定 |
| `restrictions` | 予約制限 | 雇用状況別の予約上限、キャンセル期限設定 |

---

## 🔍 機能分析

### 1. 面談タイプタブ

#### 1-1. 面談タイプ一覧

**現在のハードコーディング値**:
```typescript
const [interviewTypes, setInterviewTypes] = useState([
  { id: 'new_employee_monthly', name: '新入職員月次面談', enabled: true, frequency: '月1回' },
  { id: 'regular_annual', name: '一般職員年次面談', enabled: true, frequency: '年1回' },
  { id: 'management_biannual', name: '管理職半年面談', enabled: true, frequency: '半年1回' },
  { id: 'return_to_work', name: '復職面談', enabled: true, frequency: '復職時' },
  { id: 'incident_followup', name: 'インシデント後面談', enabled: true, frequency: '発生時' },
  { id: 'exit_interview', name: '退職面談', enabled: true, frequency: '退職前' },
  { id: 'feedback', name: 'フィードバック面談', enabled: true, frequency: '随時' },
  { id: 'career_support', name: 'キャリア系面談', enabled: true, frequency: '随時' },
  { id: 'workplace_support', name: '職場環境系面談', enabled: true, frequency: '随時' },
  { id: 'individual_consultation', name: '個別相談面談', enabled: true, frequency: '随時' }
]);
```

**機能**:
- 各面談タイプのON/OFF切り替え
- 実施頻度の表示
- 無効化された面談タイプは予約時に選択不可になる想定

---

### 2. スケジュールタブ

**現在のハードコーディング値**:
```typescript
const [scheduleSettings, setScheduleSettings] = useState<Record<string, InterviewSetting>>({
  startTime: {
    key: 'startTime',
    value: '13:40',
    type: 'time',
    description: '面談開始時刻',
    category: 'schedule'
  },
  endTime: {
    key: 'endTime',
    value: '16:50',
    type: 'time',
    description: '面談終了時刻',
    category: 'schedule'
  },
  slotDuration: {
    key: 'slotDuration',
    value: 30,
    type: 'number',
    description: '1回あたりの面談時間（分）',
    category: 'schedule'
  },
  maxSlotsPerDay: {
    key: 'maxSlotsPerDay',
    value: 6,
    type: 'number',
    description: '1日の最大面談枠数',
    category: 'schedule'
  },
  nightShiftSlots: {
    key: 'nightShiftSlots',
    value: true,
    type: 'boolean',
    description: '夜勤者向け特別時間帯',
    category: 'schedule'
  },
  advanceBookingDays: {
    key: 'advanceBookingDays',
    value: 30,
    type: 'number',
    description: '予約可能期間（日）',
    category: 'schedule'
  }
});
```

**機能**:
- 面談可能時間帯の設定
- 面談枠の時間と数の管理
- 夜勤者対応の特別時間帯設定

---

### 3. 予約制限タブ

**現在のハードコーディング値**:
```typescript
const [restrictionSettings, setRestrictionSettings] = useState<Record<string, InterviewSetting>>({
  newEmployeeRequired: {
    key: 'newEmployeeRequired',
    value: true,
    type: 'boolean',
    description: '新入職員の月次面談を必須にする',
    category: 'restriction'
  },
  newEmployeeMonthlyLimit: {
    key: 'newEmployeeMonthlyLimit',
    value: 1,
    type: 'number',
    description: '新入職員の月間予約上限',
    category: 'restriction'
  },
  regularEmployeeAnnualLimit: {
    key: 'regularEmployeeAnnualLimit',
    value: 1,
    type: 'number',
    description: '一般職員の年間予約上限',
    category: 'restriction'
  },
  managementBiannualLimit: {
    key: 'managementBiannualLimit',
    value: 2,
    type: 'number',
    description: '管理職の年間予約上限',
    category: 'restriction'
  },
  casualInterviewMonthlyLimit: {
    key: 'casualInterviewMonthlyLimit',
    value: 3,
    type: 'number',
    description: '随時面談の月間予約上限',
    category: 'restriction'
  },
  cancellationDeadlineHours: {
    key: 'cancellationDeadlineHours',
    value: 24,
    type: 'number',
    description: 'キャンセル期限（時間前）',
    category: 'restriction'
  }
});
```

**機能**:
- 雇用形態別の予約上限管理
- キャンセルポリシー設定
- 必須面談の強制設定

---

## 📊 データ要件分析

### 必要なデータソース

| データカテゴリ | データ内容 | 用途 |
|--------------|----------|------|
| **面談タイプマスター** | id, name, frequency, enabled, classification | 面談予約時の選択肢 |
| **スケジュール設定** | key-value形式の設定値 | 面談枠の自動生成ルール |
| **予約制限設定** | key-value形式の設定値 | 予約時のバリデーションルール |

### データの特性

| 特性 | 内容 |
|-----|------|
| **更新頻度** | 低頻度（月1回程度、もしくは業務ルール変更時のみ） |
| **データ量** | 小規模（面談タイプ10件、設定値12件） |
| **整合性要件** | 高（無効化された面談タイプを使用している既存予約との整合性が必要） |
| **監査要件** | 高（Level 99による設定変更は全て監査ログに記録） |

---

## 🔀 責任分界点定義

### 重要な発見

**mcp-shared/config/interview-types.json** が存在し、医療システムと共有されています。

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-08-10",
  "classifications": [...],
  "interviewTypes": [
    {
      "id": "new_employee_monthly",
      "name": "新入職員月次面談",
      "classification": "regular",
      "target": "入職1年未満",
      "frequency": "月1回",
      "requiresCategory": false,
      "active": true,
      "sortOrder": 1
    },
    // ... 全10種類
  ]
}
```

### データ管理責任の分担

| データ項目 | 管理責任 | 理由 |
|-----------|---------|------|
| **面談タイプマスター** | 🔴 **医療システム** | mcp-shared/config/interview-types.jsonで管理済み |
| **面談分類（classifications）** | 🔴 **医療システム** | mcp-shared/config/interview-types.jsonで管理済み |
| **面談カテゴリ（categories）** | 🔴 **医療システム** | mcp-shared/config/interview-types.jsonで管理済み |
| **スケジュール設定** | 🟦 **VoiceDrive** | 施設ごとの運用ルール（VoiceDrive独自設定） |
| **予約制限設定** | 🟦 **VoiceDrive** | VoiceDrive独自のビジネスルール |

### 重要な結論

**面談タイプマスターは医療システムが管理責任を持つため、VoiceDrive側でDBテーブルを作成すべきではない**

- ❌ **VoiceDrive側に `InterviewType` テーブルを作成しない**
- ✅ **医療システムから提供されるAPIで取得**
- ✅ **VoiceDriveはON/OFF設定のみを管理**（有効化/無効化フラグ）

---

## ❌ 不足項目の洗い出し

### 1. データベーステーブルの不足

#### 現在のschema.prismaの状態

```prisma
// ✅ 存在するテーブル
model Interview {
  // 面談予約データ（既存）
  type      String  // 面談タイプID（医療システムのIDを参照）
  category  String
  status    String  @default("pending")
}

// ❌ 不足しているテーブル
// - 面談タイプ有効化設定（VoiceDrive独自）
// - スケジュール設定
// - 予約制限設定
```

### 2. 不足テーブル一覧

| テーブル名 | 用途 | 優先度 | 備考 |
|-----------|------|--------|------|
| `InterviewTypeConfig` | 面談タイプの有効化/無効化設定 | 🔴 高 | 医療システムのタイプIDを参照 |
| `InterviewSystemSetting` | スケジュール・予約制限設定（Key-Value） | 🔴 高 | VoiceDrive独自の運用ルール |

**注意**: `InterviewType`マスターテーブルは**作成しない**（医療システム管理）

### 3. 不足APIエンドポイント

#### 3-1. 読み取りAPI

| エンドポイント | メソッド | 用途 |
|--------------|---------|------|
| `/api/interview/settings/types` | GET | 面談タイプ設定一覧取得（医療API + VoiceDrive設定をマージ） |
| `/api/interview/settings/schedule` | GET | スケジュール設定取得 |
| `/api/interview/settings/restrictions` | GET | 予約制限設定取得 |

#### 3-2. 更新API

| エンドポイント | メソッド | 用途 |
|--------------|---------|------|
| `/api/interview/settings/types` | PUT | 面談タイプの有効化/無効化更新 |
| `/api/interview/settings/schedule` | PUT | スケジュール設定更新 |
| `/api/interview/settings/restrictions` | PUT | 予約制限設定更新 |

#### 3-3. 医療システム連携API（必要）

| エンドポイント | メソッド | 用途 | 提供元 |
|--------------|---------|------|--------|
| `/api/medical/interview-types` | GET | 面談タイプマスター取得 | 医療システム |

---

## 🗄️ データベース設計

### 1. InterviewTypeConfig（面談タイプ有効化設定）

```prisma
model InterviewTypeConfig {
  id             String   @id @default(cuid())
  interviewTypeId String  @unique @map("interview_type_id")  // 医療システムのタイプID
  enabled        Boolean  @default(true)
  displayOrder   Int?     @default(0) @map("display_order")
  customName     String?  @map("custom_name")                // 施設独自の呼称（オプション）
  notes          String?                                     // 管理メモ
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@index([enabled])
  @@index([displayOrder])
  @@map("interview_type_configs")
}
```

**初期データ**:
```sql
INSERT INTO interview_type_configs (interview_type_id, enabled, display_order) VALUES
  ('new_employee_monthly', true, 1),
  ('regular_annual', true, 2),
  ('management_biannual', true, 3),
  ('return_to_work', true, 4),
  ('incident_followup', true, 5),
  ('exit_interview', true, 6),
  ('feedback', true, 7),
  ('career_support', true, 8),
  ('workplace_support', true, 9),
  ('individual_consultation', true, 10);
```

---

### 2. InterviewSystemSetting（システム設定Key-Value）

```prisma
model InterviewSystemSetting {
  id           String   @id @default(cuid())
  category     String                                     // 'schedule' or 'restriction'
  settingKey   String   @map("setting_key")               // 'startTime', etc.
  settingValue String   @map("setting_value")             // JSON文字列として保存
  valueType    String   @map("value_type")                // 'string', 'number', 'boolean', 'time'
  description  String                                     // 設定の説明
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@unique([category, settingKey])
  @@index([category])
  @@map("interview_system_settings")
}
```

**初期データ**:
```sql
-- スケジュール設定
INSERT INTO interview_system_settings (category, setting_key, setting_value, value_type, description) VALUES
  ('schedule', 'startTime', '13:40', 'time', '面談開始時刻'),
  ('schedule', 'endTime', '16:50', 'time', '面談終了時刻'),
  ('schedule', 'slotDuration', '30', 'number', '1回あたりの面談時間（分）'),
  ('schedule', 'maxSlotsPerDay', '6', 'number', '1日の最大面談枠数'),
  ('schedule', 'nightShiftSlots', 'true', 'boolean', '夜勤者向け特別時間帯'),
  ('schedule', 'advanceBookingDays', '30', 'number', '予約可能期間（日）');

-- 予約制限設定
INSERT INTO interview_system_settings (category, setting_key, setting_value, value_type, description) VALUES
  ('restriction', 'newEmployeeRequired', 'true', 'boolean', '新入職員の月次面談を必須にする'),
  ('restriction', 'newEmployeeMonthlyLimit', '1', 'number', '新入職員の月間予約上限'),
  ('restriction', 'regularEmployeeAnnualLimit', '1', 'number', '一般職員の年間予約上限'),
  ('restriction', 'managementBiannualLimit', '2', 'number', '管理職の年間予約上限'),
  ('restriction', 'casualInterviewMonthlyLimit', '3', 'number', '随時面談の月間予約上限'),
  ('restriction', 'cancellationDeadlineHours', '24', 'number', 'キャンセル期限（時間前）');
```

---

## 🔌 API設計

### 1. 面談タイプ設定管理API

#### GET `/api/interview/settings/types`

**処理フロー**:
1. 医療システムAPIから面談タイプマスター取得
2. VoiceDriveのInterviewTypeConfigテーブルから有効化設定取得
3. マージして返す

**レスポンス例**:
```json
{
  "types": [
    {
      "id": "new_employee_monthly",
      "name": "新入職員月次面談",
      "frequency": "月1回",
      "classification": "regular",
      "enabled": true,
      "displayOrder": 1
    },
    ...
  ]
}
```

#### PUT `/api/interview/settings/types`

**リクエスト例**:
```json
{
  "types": [
    {
      "interviewTypeId": "exit_interview",
      "enabled": false
    }
  ],
  "userId": "user_xxx"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "updated": 1
}
```

---

### 2. スケジュール設定管理API

#### GET `/api/interview/settings/schedule`

**レスポンス例**:
```json
{
  "settings": {
    "startTime": "13:40",
    "endTime": "16:50",
    "slotDuration": 30,
    "maxSlotsPerDay": 6,
    "nightShiftSlots": true,
    "advanceBookingDays": 30
  }
}
```

#### PUT `/api/interview/settings/schedule`

**リクエスト例**:
```json
{
  "settings": {
    "startTime": "14:00",
    "slotDuration": 45
  },
  "userId": "user_xxx"
}
```

---

### 3. 予約制限設定管理API

#### GET `/api/interview/settings/restrictions`

**レスポンス例**:
```json
{
  "settings": {
    "newEmployeeRequired": true,
    "newEmployeeMonthlyLimit": 1,
    "regularEmployeeAnnualLimit": 1,
    "managementBiannualLimit": 2,
    "casualInterviewMonthlyLimit": 3,
    "cancellationDeadlineHours": 24
  }
}
```

#### PUT `/api/interview/settings/restrictions`

**リクエスト例**:
```json
{
  "settings": {
    "cancellationDeadlineHours": 48
  },
  "userId": "user_xxx"
}
```

---

## 📈 実装優先度

### Phase 1: 基盤構築（優先度: 🔴 最高）

| タスク | 工数 | 理由 |
|-------|------|------|
| 1. 2つのテーブル作成（Prismaスキーマ） | 1時間 | 基盤となるデータ構造 |
| 2. マイグレーション実行 | 30分 | DB反映 |
| 3. 初期データ投入（シードスクリプト） | 1時間 | 10タイプ + 12設定値 |
| 4. 医療システムAPI統合確認 | 2時間 | mcp-shared経由で取得可能か確認 |

**合計**: 約4.5時間

---

### Phase 2: API実装（優先度: 🟡 中）

| タスク | 工数 | 理由 |
|-------|------|------|
| 1. 読み取りAPI実装（3エンドポイント） | 2時間 | フロントエンドとの接続 |
| 2. 更新API実装（3エンドポイント） | 3時間 | Level 99による設定変更機能 |
| 3. 医療システムAPIとのマージロジック | 2時間 | 面談タイプマスターとの統合 |
| 4. 監査ログ統合 | 1時間 | AuditServiceとの連携 |

**合計**: 約8時間

---

### Phase 3: フロントエンド統合（優先度: 🟡 中）

| タスク | 工数 | 理由 |
|-------|------|------|
| 1. InterviewSettingsPageのAPI接続 | 2時間 | 既存UIとの統合 |
| 2. ローディング・エラーハンドリング | 1時間 | UX改善 |
| 3. 整合性チェック | 2時間 | 既存予約データとの検証 |

**合計**: 約5時間

---

## 📝 まとめ

### 現状
- **データベーステーブル**: 0/2（全て不足）
- **APIエンドポイント**: 0/6（全て不足）
- **データ管理責任**:
  - 面談タイプマスター: 医療システム管理
  - スケジュール・予約制限設定: VoiceDrive管理

### 必要な作業
1. ✅ **テーブル設計**: 完了（本文書に記載）
2. ⏳ **医療システム連携確認**: 未実施（重要！）
3. ⏳ **Prismaスキーマ更新**: 未実施
4. ⏳ **マイグレーション実行**: 未実施
5. ⏳ **シードデータ作成**: 未実施
6. ⏳ **API実装**: 未実施

### 推定工数
- **Phase 1**: 4.5時間（基盤構築）
- **Phase 2**: 8時間（API実装）
- **Phase 3**: 5時間（フロントエンド統合）
- **合計**: **約17.5時間**

### 重要な注意点

⚠️ **医療システムとの連携が必須**

面談タイプマスターは医療システムが管理しているため、以下の確認が必要です：

1. **医療システムAPIの仕様確認**
   - エンドポイント: `/api/medical/interview-types` が存在するか
   - mcp-shared経由でアクセス可能か

2. **データ同期方法の確認**
   - リアルタイム取得 vs キャッシュ
   - 更新通知の仕組み

3. **医療チームへの連絡**
   - mcp-shared/docs/AI_SUMMARY.mdへの記載
   - 医療チームからの回答待ち

---

**次のステップ**: `InterviewSettingsPage暫定マスターリスト_20251028.md` の作成

---

**作成日**: 2025-10-28
**最終更新**: 2025-10-28
