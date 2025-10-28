# CommitteeSettingsPage 暫定マスターリスト

**作成日**: 2025-10-28
**目的**: CommitteeSettingsPageで使用する初期マスターデータ定義
**データ管理**: 100% VoiceDrive管理（医療システム連携不要）

---

## 📋 目次

1. [議題ステータスマスター](#議題ステータスマスター)
2. [優先度レベルマスター](#優先度レベルマスター)
3. [議題タイプマスター](#議題タイプマスター)
4. [会議スケジュール設定](#会議スケジュール設定)
5. [承認フロー設定](#承認フロー設定)
6. [データ投入SQL](#データ投入sql)

---

## 1. 議題ステータスマスター

### テーブル: `committee_agenda_statuses`

| statusId | name | color | enabled | displayOrder | description |
|----------|------|-------|---------|--------------|-------------|
| `pending` | 審議待ち | `#FFA500` | ✅ | 1 | 委員会での審議を待っている状態 |
| `in_review` | 審議中 | `#2196F3` | ✅ | 2 | 委員会で現在審議中の状態 |
| `approved` | 承認 | `#4CAF50` | ✅ | 3 | 委員会で承認された状態 |
| `rejected` | 却下 | `#F44336` | ✅ | 4 | 委員会で却下された状態 |
| `on_hold` | 保留 | `#9E9E9E` | ✅ | 5 | 判断を保留している状態 |

### カラーコード詳細

| color | 色名 | 用途 |
|-------|------|------|
| `#FFA500` | オレンジ | 審議待ち（アクション必要） |
| `#2196F3` | 青 | 審議中（進行中） |
| `#4CAF50` | 緑 | 承認（成功） |
| `#F44336` | 赤 | 却下（拒否） |
| `#9E9E9E` | グレー | 保留（中立） |

### ステータス遷移フロー

```
[pending]
   ↓
[in_review] ─→ [approved]
   │            [rejected]
   └────────→  [on_hold]
```

---

## 2. 優先度レベルマスター

### テーブル: `committee_priority_levels`

| priorityId | name | color | enabled | displayOrder | description |
|------------|------|-------|---------|--------------|-------------|
| `critical` | 緊急 | `#F44336` | ✅ | 1 | 即座に対応が必要な最優先事項 |
| `high` | 高 | `#FF9800` | ✅ | 2 | 早期の対応が必要な重要事項 |
| `normal` | 通常 | `#2196F3` | ✅ | 3 | 通常の優先度で対応する事項 |
| `low` | 低 | `#9E9E9E` | ✅ | 4 | 時間に余裕がある事項 |

### カラーコード詳細

| color | 色名 | 用途 |
|-------|------|------|
| `#F44336` | 赤 | 緊急（最優先） |
| `#FF9800` | オレンジ | 高（重要） |
| `#2196F3` | 青 | 通常（標準） |
| `#9E9E9E` | グレー | 低（後回し可） |

### 優先度による処理目安

| 優先度 | 対応期限目安 | 例 |
|-------|-------------|-----|
| **緊急** | 24時間以内 | 医療安全に関わる重大事項、法令対応 |
| **高** | 1週間以内 | 施設方針の重要決定、予算承認 |
| **通常** | 1ヶ月以内 | 通常の委員会提案、設備更新 |
| **低** | 3ヶ月以内 | 長期計画、改善提案の検討 |

---

## 3. 議題タイプマスター

### テーブル: `committee_agenda_types`

| typeId | name | enabled | displayOrder | description |
|--------|------|---------|--------------|-------------|
| `committee_proposal` | 委員会提案 | ✅ | 1 | 委員会メンバーからの提案事項 |
| `facility_policy` | 施設方針 | ✅ | 2 | 施設の運営方針に関する事項 |
| `hr` | 人事 | ✅ | 3 | 人事異動・採用・評価に関する事項 |
| `budget` | 予算 | ✅ | 4 | 予算申請・承認に関する事項 |
| `equipment` | 設備 | ✅ | 5 | 設備導入・更新に関する事項 |

### 議題タイプ別の特性

| タイプ | 想定される議題例 | 関連部署 | 承認レベル |
|-------|----------------|---------|-----------|
| **委員会提案** | 業務改善提案、新規プロジェクト | 全部門 | Level 8+ |
| **施設方針** | 経営方針、組織再編 | 経営企画、総務 | Level 9+ |
| **人事** | 採用計画、昇進・異動 | 人事部 | Level 9+ |
| **予算** | 設備投資、部門予算 | 経理部、各部門 | Level 9+ |
| **設備** | 医療機器導入、システム更新 | 医療機器管理、情報システム | Level 8+ |

---

## 4. 会議スケジュール設定

### テーブル: `committee_system_settings`（category = 'meeting'）

| settingKey | settingValue | valueType | description | 設定根拠 |
|-----------|--------------|-----------|-------------|---------|
| `defaultMeetingDay` | `第2木曜日` | `string` | デフォルト会議開催日 | 多くの医療機関で木曜日が定例会議日 |
| `defaultMeetingTime` | `14:00` | `string` | デフォルト会議開始時刻 | 午後の業務が比較的落ち着く時間帯 |
| `meetingDurationMinutes` | `120` | `number` | 会議時間（分） | 標準的な委員会は2時間程度 |
| `agendaSubmissionDeadlineDays` | `7` | `number` | 議題提出期限（会議の何日前） | 委員が事前確認する時間を確保 |
| `minutesPublishDeadlineDays` | `3` | `number` | 議事録公開期限（会議後何日以内） | 記憶が新しいうちに公開 |

### 設定値の調整ガイドライン

| 設定項目 | 推奨範囲 | 調整の考え方 |
|---------|---------|-------------|
| **議題提出期限** | 3〜14日 | 短い: 機動性重視、長い: 検討時間重視 |
| **議事録公開期限** | 1〜7日 | 短い: 速報性重視、長い: 精度重視 |
| **会議時間** | 60〜180分 | 短い: 効率重視、長い: 議論の質重視 |

---

## 5. 承認フロー設定

### テーブル: `committee_system_settings`（category = 'approval'）

| settingKey | settingValue | valueType | description | 設定根拠 |
|-----------|--------------|-----------|-------------|---------|
| `requireApproval` | `true` | `boolean` | 議題提出時の承認を必須にする | 議題の質を担保するため |
| `minApproverLevel` | `8` | `number` | 承認者の最低権限レベル | Level 8以上は部門長クラス |
| `approvalDeadlineHours` | `48` | `number` | 承認期限（時間） | 業務日2日分（土日除く） |
| `autoApproveAfterDeadline` | `false` | `boolean` | 期限超過後の自動承認 | 安全のため手動承認を推奨 |
| `notifyApproverByEmail` | `true` | `boolean` | 承認者へのメール通知 | 見落とし防止 |

### 承認フロー運用パターン

#### パターンA: 厳格な承認運用（デフォルト）
```
requireApproval: true
minApproverLevel: 8
autoApproveAfterDeadline: false
```
- **用途**: 人事・予算など重要議題
- **メリット**: 議題の質を担保
- **デメリット**: 承認待ちで遅延の可能性

#### パターンB: 柔軟な承認運用
```
requireApproval: true
minApproverLevel: 7
autoApproveAfterDeadline: true
```
- **用途**: 通常の委員会提案
- **メリット**: スピード重視
- **デメリット**: 質のチェックが甘い可能性

#### パターンC: 承認不要（緊急時のみ）
```
requireApproval: false
```
- **用途**: 緊急議題のみ
- **メリット**: 即座に提出可能
- **デメリット**: 質の担保なし

---

## 6. データ投入SQL

### 6-1. 議題ステータスマスター

```sql
-- CommitteeAgendaStatus
INSERT INTO committee_agenda_statuses (
  id, status_id, name, color, enabled, display_order, description, created_at, updated_at
) VALUES
  (
    'cas_pending',
    'pending',
    '審議待ち',
    '#FFA500',
    true,
    1,
    '委員会での審議を待っている状態',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cas_in_review',
    'in_review',
    '審議中',
    '#2196F3',
    true,
    2,
    '委員会で現在審議中の状態',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cas_approved',
    'approved',
    '承認',
    '#4CAF50',
    true,
    3,
    '委員会で承認された状態',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cas_rejected',
    'rejected',
    '却下',
    '#F44336',
    true,
    4,
    '委員会で却下された状態',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cas_on_hold',
    'on_hold',
    '保留',
    '#9E9E9E',
    true,
    5,
    '判断を保留している状態',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

### 6-2. 優先度レベルマスター

```sql
-- CommitteePriorityLevel
INSERT INTO committee_priority_levels (
  id, priority_id, name, color, enabled, display_order, description, created_at, updated_at
) VALUES
  (
    'cpl_critical',
    'critical',
    '緊急',
    '#F44336',
    true,
    1,
    '即座に対応が必要な最優先事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cpl_high',
    'high',
    '高',
    '#FF9800',
    true,
    2,
    '早期の対応が必要な重要事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cpl_normal',
    'normal',
    '通常',
    '#2196F3',
    true,
    3,
    '通常の優先度で対応する事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cpl_low',
    'low',
    '低',
    '#9E9E9E',
    true,
    4,
    '時間に余裕がある事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

### 6-3. 議題タイプマスター

```sql
-- CommitteeAgendaType
INSERT INTO committee_agenda_types (
  id, type_id, name, enabled, display_order, description, created_at, updated_at
) VALUES
  (
    'cat_committee_proposal',
    'committee_proposal',
    '委員会提案',
    true,
    1,
    '委員会メンバーからの提案事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cat_facility_policy',
    'facility_policy',
    '施設方針',
    true,
    2,
    '施設の運営方針に関する事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cat_hr',
    'hr',
    '人事',
    true,
    3,
    '人事異動・採用・評価に関する事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cat_budget',
    'budget',
    '予算',
    true,
    4,
    '予算申請・承認に関する事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cat_equipment',
    'equipment',
    '設備',
    true,
    5,
    '設備導入・更新に関する事項',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

### 6-4. 会議スケジュール設定

```sql
-- CommitteeSystemSetting (meeting)
INSERT INTO committee_system_settings (
  id, category, setting_key, setting_value, value_type, description, created_at, updated_at
) VALUES
  (
    'css_meeting_day',
    'meeting',
    'defaultMeetingDay',
    '第2木曜日',
    'string',
    'デフォルト会議開催日',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_meeting_time',
    'meeting',
    'defaultMeetingTime',
    '14:00',
    'string',
    'デフォルト会議開始時刻',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_meeting_duration',
    'meeting',
    'meetingDurationMinutes',
    '120',
    'number',
    '会議時間（分）',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_agenda_deadline',
    'meeting',
    'agendaSubmissionDeadlineDays',
    '7',
    'number',
    '議題提出期限（会議の何日前）',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_minutes_deadline',
    'meeting',
    'minutesPublishDeadlineDays',
    '3',
    'number',
    '議事録公開期限（会議後何日以内）',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

### 6-5. 承認フロー設定

```sql
-- CommitteeSystemSetting (approval)
INSERT INTO committee_system_settings (
  id, category, setting_key, setting_value, value_type, description, created_at, updated_at
) VALUES
  (
    'css_require_approval',
    'approval',
    'requireApproval',
    'true',
    'boolean',
    '議題提出時の承認を必須にする',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_min_approver_level',
    'approval',
    'minApproverLevel',
    '8',
    'number',
    '承認者の最低権限レベル',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_approval_deadline',
    'approval',
    'approvalDeadlineHours',
    '48',
    'number',
    '承認期限（時間）',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_auto_approve',
    'approval',
    'autoApproveAfterDeadline',
    'false',
    'boolean',
    '期限超過後の自動承認',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'css_notify_email',
    'approval',
    'notifyApproverByEmail',
    'true',
    'boolean',
    '承認者へのメール通知',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

---

## 📊 データサマリー

### 投入データ件数

| テーブル | 件数 | カテゴリ |
|---------|------|---------|
| `committee_agenda_statuses` | 5件 | 議題ステータス |
| `committee_priority_levels` | 4件 | 優先度レベル |
| `committee_agenda_types` | 5件 | 議題タイプ |
| `committee_system_settings` | 10件 | システム設定（会議5件 + 承認5件） |
| **合計** | **24件** | - |

### データ更新頻度

| テーブル | 更新頻度 | 更新者 |
|---------|---------|--------|
| `committee_agenda_statuses` | 月1回程度 | Level 99 |
| `committee_priority_levels` | 月1回程度 | Level 99 |
| `committee_agenda_types` | 月1回程度 | Level 99 |
| `committee_system_settings` | 週1回程度 | Level 99 |

---

## 🔄 メンテナンス計画

### 定期レビュー

| レビュー項目 | 頻度 | チェック内容 |
|------------|------|------------|
| **ステータス妥当性** | 四半期ごと | 無効化されたステータスが適切か |
| **優先度分布** | 月次 | 各優先度の使用率が偏っていないか |
| **議題タイプ分布** | 月次 | 新しいタイプの追加が必要か |
| **会議設定** | 月次 | デフォルト値が実態に合っているか |
| **承認フロー** | 月次 | 承認期限が適切か |

### 追加・削除ルール

#### ステータス追加時の考慮事項
- 既存のワークフローとの整合性
- 新ステータスの必要性（既存で代用不可か）
- カラーコードの視認性

#### 優先度追加時の考慮事項
- 4段階で不足しているか
- 新優先度の明確な定義

#### 議題タイプ追加時の考慮事項
- 既存タイプで分類不可能か
- 年間10件以上の利用が見込まれるか

---

## 📝 まとめ

### データ特性
- **管理責任**: 100% VoiceDrive
- **医療システム連携**: 不要
- **初期データ件数**: 24件
- **推定レコード増加**: 年間+5件程度（新タイプ追加）

### 次のステップ
1. ✅ **マスターデータ定義**: 完了（本文書）
2. ⏳ **Prismaスキーマ更新**: 次タスク
3. ⏳ **シードスクリプト作成**: 次タスク
4. ⏳ **API実装**: 次タスク

---

**作成日**: 2025-10-28
**最終更新**: 2025-10-28
**関連文書**: [CommitteeSettingsPage_DB要件分析_20251028.md](./CommitteeSettingsPage_DB要件分析_20251028.md)
