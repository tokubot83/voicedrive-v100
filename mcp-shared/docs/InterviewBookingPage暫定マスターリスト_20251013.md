# InterviewBookingPage 暫定マスターリスト

**文書番号**: VD-MASTER-2025-1013-002
**作成日**: 2025年10月13日
**対象ページ**: InterviewBookingPage
**目的**: 面談予約システムに必要なマスターデータを定義

---

## 📋 目次

1. [面談タイプマスター](#面談タイプマスター)
2. [面談カテゴリマスター](#面談カテゴリマスター)
3. [面談者マスター](#面談者マスター)
4. [時間枠マスター](#時間枠マスター)
5. [スケジュール設定マスター](#スケジュール設定マスター)
6. [キャンセル理由マスター](#キャンセル理由マスター)
7. [ステータスマスター](#ステータスマスター)
8. [緊急度マスター](#緊急度マスター)

---

## 1. 面談タイプマスター

### マスター名: `InterviewTypeMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 面談予約時のタイプ選択、予約制限ルール判定

### マスターデータ

| ID | typeCode | typeName | typeCategory | カテゴリ選択 | 頻度 | 対象者 | 表示順 | 備考 |
|----|----------|----------|--------------|-----------|------|--------|-------|------|
| 1 | new_employee_monthly | 新入職員月次面談 | 定期面談 | 不要 | 月1回必須 | 新入職員（1年未満） | 1 | 入社後12ヶ月間 |
| 2 | regular_annual | 年次定期面談 | 定期面談 | 不要 | 年1回 | 一般職員（1年以上） | 2 | 年1回実施 |
| 3 | management_biannual | 管理職面談 | 定期面談 | 不要 | 半年1回 | 管理職・リーダー職 | 3 | 半年ごと |
| 4 | return_to_work | 復職面談 | 特別面談 | 不要 | 都度 | 復職者 | 4 | 休職後の復職時 |
| 5 | incident_followup | インシデント後面談 | 特別面談 | 不要 | 都度 | インシデント関係者 | 5 | 医療事故後フォロー |
| 6 | exit_interview | 退職面談 | 特別面談 | 不要 | 都度 | 退職予定者 | 6 | 退職手続き時 |
| 7 | feedback | フィードバック面談 | サポート面談 | 不要 | 随時 | 全職員 | 7 | 評価・パフォーマンス |
| 8 | career_support | キャリア系面談 | サポート面談 | **必要** | 随時 | 全職員 | 8 | キャリア・スキル開発 |
| 9 | workplace_support | 職場環境系面談 | サポート面談 | **必要** | 随時 | 全職員 | 9 | 職場環境・人間関係 |
| 10 | individual_consultation | 個別相談面談 | サポート面談 | **必要** | 随時 | 全職員 | 10 | その他相談事項 |

### 旧体系（後方互換性）

| ID | typeCode | typeName | 移行先 | 非推奨 |
|----|----------|----------|--------|-------|
| 11 | ad_hoc | 随時面談 | individual_consultation | ✅ |
| 12 | career_development | キャリア開発面談 | career_support | ✅ |
| 13 | stress_care | ストレスケア面談 | workplace_support | ✅ |
| 14 | performance_review | 人事評価面談 | feedback | ✅ |
| 15 | grievance | 苦情・相談面談 | workplace_support | ✅ |
| 16 | regular | 定期面談（旧） | regular_annual | ✅ |
| 17 | career | キャリア相談（旧） | career_support | ✅ |
| 18 | concern | 悩み相談（旧） | workplace_support | ✅ |
| 19 | evaluation | 評価面談（旧） | feedback | ✅ |
| 20 | development | 能力開発（旧） | career_support | ✅ |
| 21 | exit | 退職面談（旧） | exit_interview | ✅ |
| 22 | other | その他 | individual_consultation | ✅ |

### TypeScript型定義

```typescript
export type InterviewType =
  // 新体系（10種類）
  | 'new_employee_monthly'    // 新入職員月次面談
  | 'regular_annual'          // 一般職員年次面談
  | 'management_biannual'     // 管理職半年面談
  | 'return_to_work'          // 復職面談
  | 'incident_followup'       // インシデント後面談
  | 'exit_interview'          // 退職面談
  | 'feedback'                // フィードバック面談
  | 'career_support'          // キャリア系面談
  | 'workplace_support'       // 職場環境系面談
  | 'individual_consultation' // 個別相談面談

  // 旧体系（後方互換性）
  | 'ad_hoc'
  | 'career_development'
  | 'stress_care'
  | 'performance_review'
  | 'grievance'
  | 'regular'
  | 'career'
  | 'concern'
  | 'evaluation'
  | 'development'
  | 'exit'
  | 'other';
```

### 表示ラベル定義

```typescript
const interviewTypeLabels: Record<InterviewType, string> = {
  // 新体系
  new_employee_monthly: '新入職員月次面談',
  regular_annual: '年次定期面談',
  management_biannual: '管理職面談',
  return_to_work: '復職面談',
  incident_followup: 'インシデント後面談',
  exit_interview: '退職面談',
  feedback: 'フィードバック面談',
  career_support: 'キャリア系面談',
  workplace_support: '職場環境系面談',
  individual_consultation: '個別相談面談',

  // 旧体系
  ad_hoc: '随時面談',
  career_development: 'キャリア開発面談',
  stress_care: 'ストレスケア面談',
  performance_review: '人事評価面談',
  grievance: '苦情・相談面談',
  regular: '定期面談',
  career: 'キャリア相談',
  concern: '悩み相談',
  evaluation: '評価面談',
  development: '能力開発',
  exit: '退職面談',
  other: 'その他'
};
```

---

## 2. 面談カテゴリマスター

### マスター名: `InterviewCategoryMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 面談予約時のカテゴリ選択（一部面談タイプのみ）

### マスターデータ

| ID | categoryCode | categoryName | 説明 | 表示順 | アイコン |
|----|--------------|-------------|------|-------|---------|
| 1 | career_path | キャリアパス | 将来のキャリア計画・昇進について | 1 | 🎯 |
| 2 | skill_development | スキル開発 | 専門スキル・資格取得について | 2 | 📚 |
| 3 | work_environment | 職場環境 | 職場の雰囲気・設備について | 3 | 🏥 |
| 4 | workload_balance | 業務負荷調整 | 業務量・ワークライフバランス | 4 | ⚖️ |
| 5 | interpersonal | 人間関係 | チーム内・上司との関係について | 5 | 🤝 |
| 6 | performance | パフォーマンス | 業績評価・改善点について | 6 | 📊 |
| 7 | compensation | 給与・待遇 | 給与・福利厚生について | 7 | 💰 |
| 8 | training | 研修・教育 | 研修プログラム・OJTについて | 8 | 🎓 |
| 9 | promotion | 昇進・昇格 | 昇進試験・役職について | 9 | 🔝 |
| 10 | transfer | 異動・転勤 | 部署異動・施設異動について | 10 | 🔄 |
| 11 | health_safety | 健康・安全 | 労働安全・メンタルヘルスについて | 11 | 🩺 |
| 12 | compliance | コンプライアンス | 規則・倫理問題について | 12 | 📋 |
| 13 | other | その他 | 上記に当てはまらない事項 | 13 | 💬 |

### カテゴリ選択が必要な面談タイプ

- ✅ career_support（キャリア系面談）
- ✅ workplace_support（職場環境系面談）
- ✅ individual_consultation（個別相談面談）

### TypeScript型定義

```typescript
export type InterviewCategory =
  | 'career_path'           // キャリアパス
  | 'skill_development'     // スキル開発
  | 'work_environment'      // 職場環境
  | 'workload_balance'      // 業務負荷・ワークライフバランス
  | 'interpersonal'         // 人間関係
  | 'performance'           // パフォーマンス
  | 'compensation'          // 給与・待遇
  | 'training'              // 研修・教育
  | 'promotion'             // 昇進・昇格
  | 'transfer'              // 異動・転勤
  | 'health_safety'         // 健康・安全
  | 'compliance'            // コンプライアンス
  | 'other';                // その他
```

---

## 3. 面談者マスター

### マスター名: `Interviewer`（DBテーブル）

**データソース**: VoiceDrive独自管理（DB）

**用途**: 面談者の割り当て、スケジュール管理

### 初期データ（デモ環境）

| ID | name | title | department | permissionLevel | specialties | isActive |
|----|------|-------|-----------|----------------|-------------|----------|
| interviewer_001 | 田中 キャリア支援部門長 | キャリア支援部門長 | 人財統括本部 | PermissionLevel.LEVEL_7 (7.0) | ["career_path", "skill_development", "promotion"] | ✅ |
| interviewer_002 | 佐藤 キャリア相談員 | キャリア支援部門員 | 人財統括本部 | PermissionLevel.LEVEL_6 (6.0) | ["work_environment", "interpersonal", "training"] | ✅ |
| interviewer_003 | 鈴木 メンタルヘルス相談員 | メンタルヘルス相談員 | 人財統括本部 | PermissionLevel.LEVEL_6 (6.0) | ["health_safety", "workload_balance", "interpersonal"] | ✅ |

**⚠️ 重要**: permissionLevelは**18レベルシステム（PermissionLevel列挙型）**を使用します。
- LEVEL_6 = 6.0（キャリア相談員・メンタルヘルス相談員）
- LEVEL_7 = 7.0（キャリア支援部門長）
- 数値直接指定は旧13階層の名残のため、コードでは`PermissionLevel.LEVEL_X`形式を使用

### 詳細フィールド

```typescript
interface Interviewer {
  id: string;                           // "interviewer_001"
  name: string;                         // "田中 キャリア支援部門長"
  title: string;                        // "キャリア支援部門長"
  department: string;                   // "人財統括本部"
  permissionLevel: number;              // 6.0 or 7.0

  // 専門分野（JSON配列）
  specialties: InterviewCategory[];     // ["career_path", "skill_development"]

  // 利用可能性
  isActive: boolean;                    // true
  workingDays: string[];                // ['月', '火', '水', '木', '金']
  workingHours: {
    start: string;                      // "13:40"
    end: string;                        // "17:00"
  };

  // 予約制限
  maxBookingsPerDay: number;            // 4
  maxBookingsPerWeek: number;           // 15

  // 連絡先
  email: string;                        // "tanaka.career@hospital.com"
  phone?: string;                       // "内線2200"

  // 統計
  totalInterviews: number;              // 150
  averageRating?: number;               // 4.8
  bio?: string;                         // "キャリア支援の専門家として10年の経験"
}
```

### 本番環境データ

本番環境では人財統括本部の実際の職員情報を設定：

```sql
INSERT INTO interviewers (id, name, title, department, permission_level, specialties, is_active, working_days, working_hours_start, working_hours_end, max_bookings_per_day, max_bookings_per_week, email, total_interviews, bio)
VALUES
  ('interviewer_001', '[実名]', 'キャリア支援部門長', '人財統括本部', 7.0, '["career_path","skill_development","promotion"]', true, '["月","火","水","木","金"]', '13:40', '17:00', 4, 15, '[実メールアドレス]', 0, 'キャリア支援の専門家'),
  ('interviewer_002', '[実名]', 'キャリア相談員', '人財統括本部', 6.0, '["work_environment","interpersonal","training"]', true, '["月","火","水","木","金"]', '13:40', '16:10', 3, 12, '[実メールアドレス]', 0, '職場環境改善とコミュニケーション支援が専門'),
  ('interviewer_003', '[実名]', 'メンタルヘルス相談員', '人財統括本部', 6.0, '["health_safety","workload_balance","interpersonal"]', true, '["月","火","水","木","金"]', '13:40', '16:10', 3, 12, '[実メールアドレス]', 0, 'メンタルヘルスケアの専門家');
```

---

## 4. 時間枠マスター

### マスター名: `TimeSlot`（DBテーブル）

**データソース**: VoiceDrive独自管理（DB）

**用途**: 予約可能な時間枠の管理

### 時間枠パターン（平日）

| スロットID | startTime | endTime | 時間帯 |
|----------|-----------|---------|--------|
| 1 | 13:40 | 14:10 | 午後1枠目 |
| 2 | 14:20 | 14:50 | 午後2枠目 |
| 3 | 15:00 | 15:30 | 午後3枠目 |
| 4 | 15:40 | 16:10 | 午後4枠目 |
| 5 | 16:20 | 16:50 | 午後5枠目 |

**合計**: 1日5枠（30分/枠、10分休憩）

### 自動生成ロジック

```typescript
// 今日から30日分の時間枠を自動生成
function generateTimeSlots(startDate: Date, days: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const slotTimes = [
    { start: "13:40", end: "14:10" },
    { start: "14:20", end: "14:50" },
    { start: "15:00", end: "15:30" },
    { start: "15:40", end: "16:10" },
    { start: "16:20", end: "16:50" }
  ];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // 平日のみ（土日祝日は除外）
    if (isWorkingDay(date)) {
      slotTimes.forEach((time, index) => {
        slots.push({
          id: `slot_${formatDate(date)}_${index}`,
          date: date,
          startTime: time.start,
          endTime: time.end,
          isAvailable: true,
          isBlocked: false
        });
      });
    }
  }

  return slots;
}
```

### 特殊時間枠（夜勤者対応）

夜勤者向けに午前中の時間枠も提供可能：

| スロットID | startTime | endTime | 対象者 |
|----------|-----------|---------|--------|
| 6 | 09:00 | 09:30 | 夜勤者専用 |
| 7 | 09:40 | 10:10 | 夜勤者専用 |
| 8 | 10:20 | 10:50 | 夜勤者専用 |

**条件**: 夜勤者からの申請のみ、管理者承認制

---

## 5. スケジュール設定マスター

### マスター名: `InterviewScheduleConfig`（DBテーブル）

**データソース**: VoiceDrive独自管理（DB）

**用途**: 営業時間・予約制限等のシステム設定

### デフォルト設定

```typescript
interface InterviewScheduleConfig {
  id: string;

  // 基本設定
  slotDuration: number;                 // 30分
  breakDuration: number;                // 10分

  // 営業時間
  workingHoursStart: string;            // "13:40"
  workingHoursEnd: string;              // "17:00"

  // 営業日設定
  workingDays: string[];                // ['月', '火', '水', '木', '金']

  // 祝日・休業日（JSON配列）
  holidays: Date[];                     // 国民の祝日
  closedDates: Date[];                  // 臨時休業日

  // 予約制限
  maxAdvanceBookingDays: number;        // 30日先まで予約可能
  minAdvanceBookingHours: number;       // 24時間前まで予約可能
  maxBookingsPerMonth: number;          // 月2回まで
  minIntervalBetweenBookings: number;   // 30日間隔

  // 設定有効性
  isActive: boolean;                    // true
  effectiveFrom?: Date;                 // 有効開始日
  effectiveTo?: Date;                   // 有効終了日
}
```

### 初期設定データ

```sql
INSERT INTO interview_schedule_configs (
  id, slot_duration, break_duration, working_hours_start, working_hours_end,
  working_days, holidays, closed_dates, max_advance_booking_days,
  min_advance_booking_hours, max_bookings_per_month, min_interval_between_bookings,
  is_active
)
VALUES (
  'config_default',
  30,
  10,
  '13:40',
  '17:00',
  '["月","火","水","木","金"]',
  '[]',
  '[]',
  30,
  24,
  2,
  30,
  true
);
```

### 予約制限ルール詳細

#### ルール1: 雇用状況別の頻度制限

| 雇用状況 | 面談タイプ | 頻度制限 | 備考 |
|---------|-----------|---------|------|
| 新入職員（1年未満） | new_employee_monthly | 月1回必須 | 12ヶ月間継続 |
| 新入職員（1年未満） | ad_hoc（随時面談） | 月1回まで | 必須面談とは別枠 |
| 一般職員（1年以上） | regular_annual | 年1回 | 年度面談 |
| 一般職員（1年以上） | ad_hoc（随時面談） | 四半期2回まで | 3ヶ月で2回 |
| 管理職・リーダー職 | management_biannual | 半年1回 | 6ヶ月ごと |
| 管理職・リーダー職 | ad_hoc（随時面談） | 四半期2回まで | 一般職員と同様 |

#### ルール2: 特別面談の制限なし

以下の面談タイプは頻度制限の対象外：

- return_to_work（復職面談）
- incident_followup（インシデント後面談）
- exit_interview（退職面談）

#### ルール3: キャンセル期限

- 面談開始**2時間前まで**キャンセル可能
- 2時間前以降はキャンセル不可
- 無断キャンセルは記録され、次回予約に影響

#### ルール4: 変更期限

- 面談**1日前まで**変更リクエスト可能
- 1日前以降は変更不可（キャンセル後の再予約が必要）
- 変更は管理者承認制

---

## 6. キャンセル理由マスター

### マスター名: `CancellationReasonMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 予約キャンセル時の理由選択

### マスターデータ

| ID | reasonCode | reasonName | 説明 | 表示順 |
|----|-----------|-----------|------|-------|
| 1 | emergency | 緊急事態 | 急な業務対応・緊急呼び出し | 1 |
| 2 | illness | 体調不良 | 本人・家族の体調不良 | 2 |
| 3 | work_conflict | 業務都合 | 勤務シフト変更・業務調整 | 3 |
| 4 | schedule_change | スケジュール変更 | 予定の変更・調整ミス | 4 |
| 5 | personal | 個人的事情 | プライベートな理由 | 5 |
| 6 | other | その他 | 上記に当てはまらない理由 | 6 |

### TypeScript型定義

```typescript
export type CancellationReason =
  | 'emergency'        // 緊急事態
  | 'illness'          // 体調不良
  | 'work_conflict'    // 業務都合
  | 'schedule_change'  // スケジュール変更
  | 'personal'         // 個人的事情
  | 'other';           // その他
```

### 表示ラベル

```typescript
const cancellationReasonLabels: Record<CancellationReason, string> = {
  emergency: '緊急事態のため',
  illness: '体調不良のため',
  work_conflict: '業務都合のため',
  schedule_change: 'スケジュール変更のため',
  personal: '個人的事情のため',
  other: 'その他の理由'
};
```

---

## 7. ステータスマスター

### マスター名: `InterviewStatusMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 予約のライフサイクル管理

### マスターデータ

| ID | statusCode | statusName | 説明 | フロー順 | 表示色 |
|----|-----------|-----------|------|---------|--------|
| 1 | pending | 予約申請中 | 職員が予約申請、管理者確認待ち | 1 | 🟡 黄色 |
| 2 | confirmed | 予約確定 | 管理者が予約を確定、面談実施待ち | 2 | 🟢 緑色 |
| 3 | reschedule_pending | 変更申請中 | 職員が変更申請、管理者承認待ち | 3 | 🟠 オレンジ |
| 4 | rescheduled | 変更済み | 変更が承認され、新日時で確定 | 4 | 🔵 青色 |
| 5 | completed | 面談完了 | 面談が実施完了 | 5 | ⚫ グレー |
| 6 | cancelled | キャンセル | 予約がキャンセルされた | 6 | 🔴 赤色 |
| 7 | no_show | 無断欠席 | 予約時間に来なかった | 7 | ⚫ 黒色 |

### ステータス遷移図

```
pending (申請中)
  ├─→ confirmed (確定)
  │     ├─→ reschedule_pending (変更申請中)
  │     │     ├─→ confirmed (再確定)
  │     │     └─→ cancelled (キャンセル)
  │     ├─→ completed (完了)
  │     ├─→ cancelled (キャンセル)
  │     └─→ no_show (無断欠席)
  └─→ cancelled (キャンセル)
```

### TypeScript型定義

```typescript
export type InterviewStatus =
  | 'pending'             // 予約申請中
  | 'confirmed'           // 予約確定
  | 'rescheduled'         // 変更済み
  | 'reschedule_pending'  // 変更申請中
  | 'completed'           // 面談完了
  | 'cancelled'           // キャンセル
  | 'no_show';            // 無断欠席
```

---

## 8. 緊急度マスター

### マスター名: `UrgencyLevelMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 予約の優先度判定、面談者割り当て

### マスターデータ

| ID | urgencyCode | urgencyName | 説明 | 優先度 | 表示色 |
|----|------------|------------|------|-------|--------|
| 1 | urgent | 緊急 | 即座の対応が必要 | 1 | 🔴 赤色 |
| 2 | high | 高 | できるだけ早く対応が必要 | 2 | 🟠 オレンジ |
| 3 | medium | 中 | 通常の対応 | 3 | 🟡 黄色 |
| 4 | low | 低 | 時間がある時に対応 | 4 | 🟢 緑色 |

### TypeScript型定義

```typescript
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';
```

### 緊急度別の対応目安

| 緊急度 | 対応目安 | 適用例 |
|-------|---------|--------|
| urgent | 当日～翌日 | インシデント後面談、緊急メンタルケア |
| high | 1週間以内 | 復職面談、重要なキャリア相談 |
| medium | 2週間以内 | 通常の定期面談、一般的な相談 |
| low | 1ヶ月以内 | 情報提供、軽い相談事項 |

---

## 📊 マスターデータ管理方針

### コード定義マスター（JSON/TypeScript）

以下のマスターはコード内で定義し、バージョン管理：

- ✅ 面談タイプマスター
- ✅ 面談カテゴリマスター
- ✅ キャンセル理由マスター
- ✅ ステータスマスター
- ✅ 緊急度マスター

**理由**:
- 変更頻度が低い
- システム全体に影響する
- コードレビュー・デプロイプロセスで管理

### DBテーブルマスター

以下のマスターはDBテーブルで管理し、管理画面から編集可能：

- ✅ 面談者マスター（Interviewer）
- ✅ 時間枠マスター（TimeSlot）
- ✅ スケジュール設定マスター（InterviewScheduleConfig）

**理由**:
- 変更頻度が高い
- 管理者が柔軟に設定変更したい
- リアルタイムに反映する必要がある

---

## 🔄 データ同期

### 医療システムとの同期が必要なマスター

| マスター | 同期方向 | 同期方法 | 頻度 |
|---------|---------|---------|------|
| 職員マスター | 医療システム → VoiceDrive | API | リアルタイム |
| 施設マスター | 医療システム → VoiceDrive | API | 日次 |
| 部署マスター | 医療システム → VoiceDrive | API | 日次 |
| 役職マスター | 医療システム → VoiceDrive | API | 週次 |

**面談関連マスターは同期不要**（VoiceDrive独自管理）

---

## 📝 初期データ投入SQL

### 面談者マスター（デモ環境）

```sql
INSERT INTO interviewers (
  id, name, title, department, permission_level, specialties, is_active,
  working_days, working_hours_start, working_hours_end,
  max_bookings_per_day, max_bookings_per_week, email,
  total_interviews, average_rating, bio, created_at, updated_at
)
VALUES
  (
    'interviewer_001',
    '田中 キャリア支援部門長',
    'キャリア支援部門長',
    '人財統括本部',
    7.0,
    '["career_path", "skill_development", "promotion"]',
    true,
    '["月", "火", "水", "木", "金"]',
    '13:40',
    '17:00',
    4,
    15,
    'tanaka.career@hospital.com',
    150,
    4.8,
    'キャリア支援の専門家として10年の経験',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'interviewer_002',
    '佐藤 キャリア相談員',
    'キャリア支援部門員',
    '人財統括本部',
    6.0,
    '["work_environment", "interpersonal", "training"]',
    true,
    '["月", "火", "水", "木", "金"]',
    '13:40',
    '16:10',
    3,
    12,
    'sato.counselor@hospital.com',
    89,
    4.6,
    '職場環境改善とコミュニケーション支援が専門',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'interviewer_003',
    '鈴木 メンタルヘルス相談員',
    'メンタルヘルス相談員',
    '人財統括本部',
    6.0,
    '["health_safety", "workload_balance", "interpersonal"]',
    true,
    '["月", "火", "水", "木", "金"]',
    '13:40',
    '16:10',
    3,
    12,
    'suzuki.mental@hospital.com',
    67,
    4.7,
    'メンタルヘルスケアの専門家',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
```

### スケジュール設定マスター

```sql
INSERT INTO interview_schedule_configs (
  id, slot_duration, break_duration, working_hours_start, working_hours_end,
  working_days, holidays, closed_dates, max_advance_booking_days,
  min_advance_booking_hours, max_bookings_per_month, min_interval_between_bookings,
  is_active, created_at, updated_at
)
VALUES (
  'config_default',
  30,
  10,
  '13:40',
  '17:00',
  '["月", "火", "水", "木", "金"]',
  '[]',
  '[]',
  30,
  24,
  2,
  30,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

---

## 🧪 マスターデータ検証

### 検証項目

1. ✅ 面談タイプマスターの網羅性
   - 10種類の新体系が定義されているか
   - 旧体系との互換性が保たれているか

2. ✅ 面談カテゴリマスターの十分性
   - 13種類のカテゴリが定義されているか
   - 各カテゴリの説明が明確か

3. ✅ 面談者マスターの実用性
   - 3名以上の面談者が登録されているか
   - 専門分野が分散しているか

4. ✅ 時間枠マスターの適切性
   - 1日5枠が確保されているか
   - 休憩時間が設定されているか

5. ✅ スケジュール設定の妥当性
   - 予約制限が適切に設定されているか
   - 営業時間が現実的か

---

## 📞 連絡先

**VoiceDriveチーム**
- Slack: #voicedrive-integration
- 担当: システム開発チーム

**医療システムチーム**
- Slack: #medical-system-integration
- 担当: システム開発チーム

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
承認: 未承認（レビュー待ち）
