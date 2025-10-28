# InterviewSettingsPage 暫定マスターリスト

**作成日**: 2025-10-28
**目的**: InterviewSettingsPageで使用する初期マスターデータ定義
**データ管理**: 面談タイプマスターは医療システム管理、設定値はVoiceDrive管理

---

## 📋 目次

1. [面談タイプ有効化設定](#面談タイプ有効化設定)
2. [スケジュール設定](#スケジュール設定)
3. [予約制限設定](#予約制限設定)
4. [データ投入SQL](#データ投入sql)
5. [医療システム連携仕様](#医療システム連携仕様)

---

## 1. 面談タイプ有効化設定

### テーブル: `interview_type_configs`

⚠️ **重要**: 面談タイプマスターは医療システムが管理（mcp-shared/config/interview-types.json）

VoiceDriveは**有効化/無効化設定のみ**を管理

| interviewTypeId | enabled | displayOrder | customName | notes |
|-----------------|---------|--------------|------------|-------|
| `new_employee_monthly` | ✅ | 1 | null | 新入職員の定着支援 |
| `regular_annual` | ✅ | 2 | null | 年次評価との連動 |
| `management_biannual` | ✅ | 3 | null | 管理職の目標管理 |
| `return_to_work` | ✅ | 4 | null | 復職支援プログラム |
| `incident_followup` | ✅ | 5 | null | メンタルケア重視 |
| `exit_interview` | ✅ | 6 | null | 退職理由の分析 |
| `feedback` | ✅ | 7 | null | 評価への納得感向上 |
| `career_support` | ✅ | 8 | null | キャリア形成支援 |
| `workplace_support` | ✅ | 9 | null | 職場環境改善 |
| `individual_consultation` | ✅ | 10 | null | 個別相談窓口 |

### 面談タイプ分類（医療システム管理）

| classification | name | icon | color | description |
|---------------|------|------|-------|-------------|
| `regular` | 定期面談 | 📅 | `#4CAF50` | 月次・年次・半期などの定期的な面談 |
| `special` | 特別面談 | ⚠️ | `#FF9800` | 特定の状況で実施する面談 |
| `support` | サポート面談 | 💬 | `#2196F3` | 職員の希望に応じて実施する支援面談 |

### 面談タイプ詳細（医療システム管理）

#### 定期面談（regular）

| タイプID | 名称 | 対象 | 頻度 | カテゴリ要否 |
|---------|------|------|------|-------------|
| `new_employee_monthly` | 新入職員月次面談 | 入職1年未満 | 月1回 | 不要 |
| `regular_annual` | 一般職員年次面談 | 全職員 | 年1回 | 不要 |
| `management_biannual` | 管理職半年面談 | 管理職 | 半年1回 | 不要 |

#### 特別面談（special）

| タイプID | 名称 | 対象 | トリガー | カテゴリ要否 |
|---------|------|------|---------|-------------|
| `return_to_work` | 復職面談 | 休職からの復職者 | 復職時 | 不要 |
| `incident_followup` | インシデント後面談 | 当事者職員 | インシデント発生後 | 不要 |
| `exit_interview` | 退職面談 | 退職予定者 | 退職前 | 不要 |

#### サポート面談（support）

| タイプID | 名称 | 対象 | カテゴリ要否 | カテゴリ例 |
|---------|------|------|-------------|----------|
| `feedback` | フィードバック面談 | 評価開示後の希望者 | 不要 | - |
| `career_support` | キャリア系面談 | 全職員 | **必要** | キャリアプラン相談、資格取得支援、異動・転職相談、スキルアップ相談 |
| `workplace_support` | 職場環境系面談 | 全職員 | **必要** | 人間関係の悩み、ハラスメント相談、業務負荷相談、職場改善提案、勤務体制相談 |
| `individual_consultation` | 個別相談面談 | 全職員 | **必要** | プライベート相談、健康相談、その他の相談 |

---

## 2. スケジュール設定

### テーブル: `interview_system_settings`（category = 'schedule'）

| settingKey | settingValue | valueType | description | 設定根拠 |
|-----------|--------------|-----------|-------------|---------|
| `startTime` | `13:40` | `time` | 面談開始時刻 | 午後の業務が落ち着く時間帯 |
| `endTime` | `16:50` | `time` | 面談終了時刻 | 退勤時刻前に終了 |
| `slotDuration` | `30` | `number` | 1回あたりの面談時間（分） | 標準的な面談時間 |
| `maxSlotsPerDay` | `6` | `number` | 1日の最大面談枠数 | 13:40-16:50の時間帯で30分×6枠 |
| `nightShiftSlots` | `true` | `boolean` | 夜勤者向け特別時間帯 | 夜勤者も面談を受けられる配慮 |
| `advanceBookingDays` | `30` | `number` | 予約可能期間（日） | 1ヶ月先まで予約可能 |

### スケジュール例

**通常時間帯**: 13:40-16:50（30分×6枠）
```
1枠目: 13:40-14:10
2枠目: 14:10-14:40
3枠目: 14:40-15:10
4枠目: 15:10-15:40
5枠目: 15:40-16:10
6枠目: 16:10-16:40
```

**夜勤者特別時間帯**: 例えば 9:00-11:00（オプション）

### 設定値の調整ガイドライン

| 設定項目 | 推奨範囲 | 調整の考え方 |
|---------|---------|-------------|
| **開始時刻** | 13:00〜15:00 | 午後の業務が落ち着く時間帯 |
| **終了時刻** | 16:00〜17:00 | 退勤時刻の1時間前までに終了 |
| **1回の時間** | 20〜60分 | 短い: 効率重視、長い: 深い対話 |
| **1日の枠数** | 4〜10枠 | 少ない: 余裕重視、多い: 処理能力重視 |
| **予約期間** | 14〜60日 | 短い: 柔軟性、長い: 計画性 |

---

## 3. 予約制限設定

### テーブル: `interview_system_settings`（category = 'restriction'）

| settingKey | settingValue | valueType | description | 設定根拠 |
|-----------|--------------|-----------|-------------|---------|
| `newEmployeeRequired` | `true` | `boolean` | 新入職員の月次面談を必須にする | 新入職員の定着支援を強化 |
| `newEmployeeMonthlyLimit` | `1` | `number` | 新入職員の月間予約上限 | 月1回の定期面談 |
| `regularEmployeeAnnualLimit` | `1` | `number` | 一般職員の年間予約上限 | 年1回の年次面談 |
| `managementBiannualLimit` | `2` | `number` | 管理職の年間予約上限 | 半年に1回×2回=年2回 |
| `casualInterviewMonthlyLimit` | `3` | `number` | 随時面談の月間予約上限 | 多すぎる予約を防止 |
| `cancellationDeadlineHours` | `24` | `number` | キャンセル期限（時間前） | 直前キャンセル防止 |

### 予約制限の運用パターン

#### パターンA: 厳格な制限（デフォルト）
```
newEmployeeRequired: true
newEmployeeMonthlyLimit: 1
casualInterviewMonthlyLimit: 3
cancellationDeadlineHours: 24
```
- **用途**: 面談の質を重視、計画的な運用
- **メリット**: 予約枠の適正配分
- **デメリット**: 緊急時の柔軟性が低い

#### パターンB: 柔軟な制限
```
newEmployeeRequired: false
casualInterviewMonthlyLimit: 5
cancellationDeadlineHours: 12
```
- **用途**: 職員の利用しやすさ重視
- **メリット**: 職員の希望に柔軟に対応
- **デメリット**: 予約枠が埋まりやすい

#### パターンC: 段階的制限解除（緊急時）
```
newEmployeeRequired: false
casualInterviewMonthlyLimit: 10
cancellationDeadlineHours: 6
```
- **用途**: 危機管理時（ハラスメント多発など）
- **メリット**: 緊急相談に迅速対応
- **デメリット**: 通常業務への影響

### 雇用形態別の予約ルール

| 雇用形態 | 定期面談 | 随時面談上限 | 備考 |
|---------|---------|------------|------|
| **新入職員**（1年未満） | 月1回必須 | +月3回 | 定着支援を手厚く |
| **一般職員** | 年1回 | 月3回 | 標準的な運用 |
| **管理職** | 半年1回×2 | 月3回 | 目標管理との連動 |

---

## 4. データ投入SQL

### 4-1. 面談タイプ有効化設定

```sql
-- InterviewTypeConfig
INSERT INTO interview_type_configs (
  id, interview_type_id, enabled, display_order, notes, created_at, updated_at
) VALUES
  (
    'itc_new_employee_monthly',
    'new_employee_monthly',
    true,
    1,
    '新入職員の定着支援',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_regular_annual',
    'regular_annual',
    true,
    2,
    '年次評価との連動',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_management_biannual',
    'management_biannual',
    true,
    3,
    '管理職の目標管理',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_return_to_work',
    'return_to_work',
    true,
    4,
    '復職支援プログラム',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_incident_followup',
    'incident_followup',
    true,
    5,
    'メンタルケア重視',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_exit_interview',
    'exit_interview',
    true,
    6,
    '退職理由の分析',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_feedback',
    'feedback',
    true,
    7,
    '評価への納得感向上',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_career_support',
    'career_support',
    true,
    8,
    'キャリア形成支援',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_workplace_support',
    'workplace_support',
    true,
    9,
    '職場環境改善',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'itc_individual_consultation',
    'individual_consultation',
    true,
    10,
    '個別相談窓口',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

### 4-2. スケジュール設定

```sql
-- InterviewSystemSetting (schedule)
INSERT INTO interview_system_settings (
  id, category, setting_key, setting_value, value_type, description, created_at, updated_at
) VALUES
  (
    'iss_start_time',
    'schedule',
    'startTime',
    '13:40',
    'time',
    '面談開始時刻',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_end_time',
    'schedule',
    'endTime',
    '16:50',
    'time',
    '面談終了時刻',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_slot_duration',
    'schedule',
    'slotDuration',
    '30',
    'number',
    '1回あたりの面談時間（分）',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_max_slots',
    'schedule',
    'maxSlotsPerDay',
    '6',
    'number',
    '1日の最大面談枠数',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_night_shift',
    'schedule',
    'nightShiftSlots',
    'true',
    'boolean',
    '夜勤者向け特別時間帯',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_advance_days',
    'schedule',
    'advanceBookingDays',
    '30',
    'number',
    '予約可能期間（日）',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

### 4-3. 予約制限設定

```sql
-- InterviewSystemSetting (restriction)
INSERT INTO interview_system_settings (
  id, category, setting_key, setting_value, value_type, description, created_at, updated_at
) VALUES
  (
    'iss_new_required',
    'restriction',
    'newEmployeeRequired',
    'true',
    'boolean',
    '新入職員の月次面談を必須にする',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_new_monthly',
    'restriction',
    'newEmployeeMonthlyLimit',
    '1',
    'number',
    '新入職員の月間予約上限',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_regular_annual',
    'restriction',
    'regularEmployeeAnnualLimit',
    '1',
    'number',
    '一般職員の年間予約上限',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_management_biannual',
    'restriction',
    'managementBiannualLimit',
    '2',
    'number',
    '管理職の年間予約上限',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_casual_monthly',
    'restriction',
    'casualInterviewMonthlyLimit',
    '3',
    'number',
    '随時面談の月間予約上限',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'iss_cancel_deadline',
    'restriction',
    'cancellationDeadlineHours',
    '24',
    'number',
    'キャンセル期限（時間前）',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

---

## 5. 医療システム連携仕様

### 面談タイプマスターの取得方法

#### 方式A: mcp-shared/config/interview-types.jsonから直接読み込み（推奨）

```typescript
import interviewConfig from '../../../mcp-shared/config/interview-types.json';

// 面談タイプ一覧
const interviewTypes = interviewConfig.interviewTypes;

// 分類一覧
const classifications = interviewConfig.classifications;

// カテゴリ一覧
const categories = interviewConfig.categories;
```

#### 方式B: 医療システムAPIから取得（将来実装）

```typescript
// GET /api/medical/interview-types
const response = await fetch('/api/medical/interview-types');
const data = await response.json();
```

### データマージロジック

```typescript
// VoiceDriveの有効化設定を取得
const configs = await prisma.interviewTypeConfig.findMany();

// 医療システムのマスターとマージ
const mergedTypes = interviewTypes.map((type) => {
  const config = configs.find((c) => c.interviewTypeId === type.id);
  return {
    ...type,
    enabled: config?.enabled ?? true,
    displayOrder: config?.displayOrder ?? type.sortOrder,
    customName: config?.customName,
  };
});
```

---

## 📊 データサマリー

### 投入データ件数

| テーブル | 件数 | カテゴリ |
|---------|------|---------|
| `interview_type_configs` | 10件 | 面談タイプ有効化設定 |
| `interview_system_settings` | 12件 | システム設定（スケジュール6件 + 予約制限6件） |
| **合計** | **22件** | - |

### データ更新頻度

| テーブル | 更新頻度 | 更新者 |
|---------|---------|--------|
| `interview_type_configs` | 月1回程度 | Level 99 |
| `interview_system_settings` | 週1回程度 | Level 99 |

---

## 🔄 メンテナンス計画

### 定期レビュー

| レビュー項目 | 頻度 | チェック内容 |
|------------|------|------------|
| **タイプ有効性** | 月次 | 無効化されたタイプの使用状況確認 |
| **予約枠充足率** | 週次 | スケジュール設定の妥当性確認 |
| **予約上限** | 月次 | 制限値が適切か確認 |
| **キャンセル率** | 月次 | キャンセル期限の妥当性確認 |

### 医療システムとの同期

| 同期項目 | 頻度 | 方法 |
|---------|------|------|
| **面談タイプマスター** | リアルタイム | mcp-shared/config/interview-types.json監視 |
| **分類・カテゴリ** | リアルタイム | 同上 |

---

## 📝 まとめ

### データ特性
- **管理責任**:
  - 面談タイプマスター: 医療システム管理
  - 有効化設定・運用設定: VoiceDrive管理
- **医療システム連携**: mcp-shared経由で必要
- **初期データ件数**: 22件
- **推定レコード増加**: なし（固定）

### 次のステップ
1. ✅ **マスターデータ定義**: 完了（本文書）
2. ⏳ **医療システム連携確認**: 必要（重要！）
3. ⏳ **Prismaスキーマ更新**: 次タスク
4. ⏳ **シードスクリプト作成**: 次タスク
5. ⏳ **API実装**: 次タスク

---

**作成日**: 2025-10-28
**最終更新**: 2025-10-28
**関連文書**: [InterviewSettingsPage_DB要件分析_20251028.md](./InterviewSettingsPage_DB要件分析_20251028.md)
