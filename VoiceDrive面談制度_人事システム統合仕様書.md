# VoiceDrive面談制度 - 人事システム統合仕様書

## 1. 概要

本仕様書は、VoiceDriveで実装されている面談予約システムを、別途開発中の職員カルテ＋人材マネジメントシステムに統合するための技術仕様と実装ガイドラインを提供します。

### 対象システム
- **統合元**: VoiceDrive面談予約システム
- **統合先**: 職員カルテ＋人材マネジメントシステム（開発中）
- **データベース**: 共通データベース使用予定

## 2. 面談制度の全体像

### 2.1 面談種類（11種類）

```typescript
type InterviewType = 
  | 'new_employee_monthly'    // 新入職員月次面談（入職1年未満）
  | 'regular_annual'          // 一般職員年次面談
  | 'management_biannual'     // 管理職半年面談
  | 'incident_followup'       // インシデント後面談
  | 'return_to_work'          // 復職面談
  | 'career_development'      // キャリア開発面談
  | 'stress_care'             // ストレスケア面談
  | 'performance_review'      // 人事評価面談
  | 'grievance'               // 苦情・相談面談
  | 'exit_interview'          // 退職面談
  | 'ad_hoc';                 // 随時面談
```

### 2.2 面談カテゴリ（13種類）

```typescript
type InterviewCategory = 
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

## 3. データベース設計

### 3.1 主要テーブル構造

#### interview_bookings（面談予約）
```sql
CREATE TABLE interview_bookings (
  id VARCHAR(50) PRIMARY KEY,
  
  -- 予約者情報
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  employee_email VARCHAR(100) NOT NULL,
  employee_phone VARCHAR(20),
  facility VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  
  -- 予約情報
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- 面談内容
  interview_type VARCHAR(50) NOT NULL,
  interview_category VARCHAR(50) NOT NULL,
  requested_topics TEXT[],
  description TEXT,
  urgency_level VARCHAR(10) NOT NULL,
  
  -- 面談者情報
  interviewer_id VARCHAR(50),
  interviewer_name VARCHAR(100),
  interviewer_level INTEGER,
  
  -- ステータス
  status VARCHAR(20) NOT NULL,
  
  -- メタデータ
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR(50) NOT NULL,
  last_modified TIMESTAMP,
  modified_by VARCHAR(50),
  
  -- 管理情報
  admin_notes TEXT,
  employee_notes TEXT,
  
  -- 面談結果
  conducted_at TIMESTAMP,
  duration INTEGER,
  outcome_summary TEXT,
  outcome_action_items TEXT[],
  outcome_followup_required BOOLEAN,
  outcome_followup_date DATE,
  outcome_referrals TEXT[],
  outcome_confidentiality_level VARCHAR(20),
  
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (interviewer_id) REFERENCES employees(id)
);
```

#### interview_time_slots（時間枠管理）
```sql
CREATE TABLE interview_time_slots (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  blocked_by VARCHAR(50),
  blocked_reason TEXT,
  booked_by VARCHAR(50),
  booking_id VARCHAR(50),
  
  UNIQUE(date, start_time),
  FOREIGN KEY (booking_id) REFERENCES interview_bookings(id)
);
```

#### medical_employee_profiles（医療職員プロファイル）
```sql
CREATE TABLE medical_employee_profiles (
  employee_id VARCHAR(50) PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  employment_status VARCHAR(20) NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  work_pattern VARCHAR(20) NOT NULL,
  
  -- 特別な状況
  is_on_leave BOOLEAN DEFAULT false,
  is_retiring BOOLEAN DEFAULT false,
  is_on_maternity_leave BOOLEAN DEFAULT false,
  return_to_work_date DATE,
  leave_start_date DATE,
  
  -- 面談履歴
  first_interview_date DATE,
  last_interview_date DATE,
  next_scheduled_date DATE,
  total_interviews INTEGER DEFAULT 0,
  mandatory_interviews_completed INTEGER DEFAULT 0,
  last_reminder_sent DATE,
  overdue_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

#### interview_notifications（通知管理）
```sql
CREATE TABLE interview_notifications (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  recipient_id VARCHAR(50) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  is_read BOOLEAN DEFAULT false,
  
  FOREIGN KEY (booking_id) REFERENCES interview_bookings(id),
  FOREIGN KEY (recipient_id) REFERENCES employees(id)
);
```

### 3.2 インデックス設計

```sql
-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_bookings_employee_id ON interview_bookings(employee_id);
CREATE INDEX idx_bookings_interviewer_id ON interview_bookings(interviewer_id);
CREATE INDEX idx_bookings_status ON interview_bookings(status);
CREATE INDEX idx_bookings_date ON interview_bookings(booking_date);
CREATE INDEX idx_timeslots_date ON interview_time_slots(date);
CREATE INDEX idx_timeslots_available ON interview_time_slots(is_available);
CREATE INDEX idx_profiles_employment_status ON medical_employee_profiles(employment_status);
CREATE INDEX idx_notifications_recipient ON interview_notifications(recipient_id);
CREATE INDEX idx_notifications_scheduled ON interview_notifications(scheduled_at);
```

## 4. API仕様

### 4.1 予約管理API

#### 予約作成
```typescript
POST /api/interview/bookings
Request Body: {
  employeeId: string;
  preferredDates: string[]; // ISO 8601形式
  preferredTimes: string[];
  interviewType: InterviewType;
  interviewCategory: InterviewCategory;
  requestedTopics: string[];
  description?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  preferredInterviewer?: string;
}

Response: {
  success: boolean;
  message: string;
  bookingId?: string;
  suggestedAlternatives?: TimeSlot[];
}
```

#### 予約一覧取得
```typescript
GET /api/interview/bookings
Query Parameters: {
  employeeId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

Response: {
  bookings: InterviewBooking[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### 予約詳細取得
```typescript
GET /api/interview/bookings/:bookingId

Response: InterviewBooking
```

#### 予約更新
```typescript
PUT /api/interview/bookings/:bookingId
Request Body: Partial<InterviewBooking>

Response: {
  success: boolean;
  message: string;
  booking?: InterviewBooking;
}
```

#### 予約キャンセル
```typescript
DELETE /api/interview/bookings/:bookingId

Response: {
  success: boolean;
  message: string;
}
```

### 4.2 時間枠管理API

#### 利用可能時間枠取得
```typescript
GET /api/interview/time-slots/available
Query Parameters: {
  dateFrom: string;
  dateTo: string;
  interviewType?: string;
}

Response: {
  slots: TimeSlot[];
}
```

#### 時間枠ブロック（管理者用）
```typescript
POST /api/interview/time-slots/block
Request Body: {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

Response: {
  success: boolean;
  message: string;
}
```

### 4.3 リマインダー管理API

#### リマインダー設定取得
```typescript
GET /api/interview/reminders/config/:employeeId

Response: InterviewReminderConfig
```

#### リマインダースケジュール取得
```typescript
GET /api/interview/reminders/schedule/:employeeId

Response: ReminderSchedule
```

## 5. 権限管理

### 5.1 権限レベル定義

```typescript
enum PermissionLevel {
  LEVEL_1 = 1,  // 一般職員
  LEVEL_2 = 2,  // チーフ・主任
  LEVEL_3 = 3,  // 係長・マネージャー
  LEVEL_4 = 4,  // 課長
  LEVEL_5 = 5,  // 人財統括本部 戦略企画・統括管理部門（面談予約1次窓口）
  LEVEL_6 = 6,  // 人財統括本部 キャリア支援部門員（面談実施者）
  LEVEL_7 = 7,  // 人財統括本部 各部門長（面談実施責任者）
  LEVEL_8 = 8,  // 人財統括本部 統括管理部門長
  LEVEL_9 = 9,  // 部長・本部長級
  LEVEL_10 = 10 // 役員・経営層
}
```

### 5.2 権限別機能マトリクス

| 機能 | L1-4 | L5 | L6 | L7-8 | L9-10 |
|------|------|----|----|------|-------|
| 面談予約申請 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 自分の予約確認 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 予約管理画面 | ❌ | ✅ | ✅ | ✅ | ✅ |
| スケジュール変更 | ❌ | ✅ | ❌ | ✅ | ✅ |
| 時間枠ブロック | ❌ | ✅ | ❌ | ✅ | ❌ |
| 面談実施 | ❌ | ❌ | ✅ | ✅ | ❌ |
| 面談記録作成 | ❌ | ❌ | ✅ | ✅ | ❌ |
| 統計レポート | ❌ | ✅ | ❌ | ✅ | ✅ |
| システム設定 | ❌ | ❌ | ❌ | ✅ | ✅ |

## 6. ビジネスロジック実装

### 6.1 予約制限ルール

```typescript
interface BookingLimits {
  maxAdvanceBookingDays: 30;      // 最大30日先まで予約可能
  minAdvanceBookingHours: 24;     // 最低24時間前まで予約可能
  maxBookingsPerMonth: 2;         // 月間最大2回まで
  minIntervalBetweenBookings: 30; // 前回面談から30日以上
}
```

### 6.2 医療職員向け特別ルール

```typescript
// 雇用形態別の面談頻度
const interviewFrequencyRules = {
  new_employee: {
    type: 'new_employee_monthly',
    intervalDays: 30,
    isMandatory: true
  },
  regular_employee: {
    type: 'regular_annual',
    intervalDays: 365,
    isMandatory: true
  },
  management: {
    type: 'management_biannual',
    intervalDays: 180,
    isMandatory: true
  }
};

// 部署別の特別配慮
const departmentSpecificRules = {
  'ICU': {
    preferredTimeSlots: ['13:40', '14:20'], // 早い時間帯
    maxBookingsPerMonth: 3
  },
  '救急外来': {
    preferredTimeSlots: ['15:30', '16:10'], // 遅い時間帯
    maxBookingsPerMonth: 3
  },
  '手術室': {
    blockedDays: ['月'], // 月曜日は手術集中日
    maxBookingsPerMonth: 2
  }
};
```

### 6.3 自動リマインダー設定

```typescript
const reminderSchedules = {
  new_employee_monthly: {
    reminderDays: [14, 7, 3],        // 2週間前、1週間前、3日前
    overdueReminderDays: [1, 3, 7], // 期限超過後1日、3日、7日
    maxOverdueReminders: 3
  },
  regular_annual: {
    reminderDays: [30, 14, 7],
    overdueReminderDays: [7, 14, 30],
    maxOverdueReminders: 3
  }
};
```

## 7. UI/UX設計ガイドライン

### 7.1 アクセシビリティ要件（50代職員対応）

```css
/* 基本フォントサイズ */
.interview-booking {
  font-size: 16px;
  line-height: 1.8;
}

/* ボタンサイズ */
.booking-button {
  min-height: 44px;
  min-width: 120px;
  padding: 12px 24px;
  font-size: 18px;
}

/* カラーコントラスト */
.primary-text {
  color: #333333; /* WCAG AA準拠 */
}

/* フォーカス表示 */
.focusable:focus {
  outline: 3px solid #0066CC;
  outline-offset: 2px;
}
```

### 7.2 予約フロー（3ステップ）

1. **日時選択**
   - カレンダー形式で直感的に選択
   - 利用可能な時間枠を色分け表示
   - 希望日を3つまで選択可能

2. **内容入力**
   - 面談種類をドロップダウンで選択
   - カテゴリをアイコン付きで表示
   - 相談内容を自由記述

3. **確認・申請**
   - 入力内容の確認画面
   - 修正ボタンを大きく配置
   - 申請完了後にメール通知

## 8. 統合実装手順

### 8.1 Phase 1: データベース準備
1. 共通データベースに面談関連テーブルを作成
2. 既存の職員マスタとの外部キー設定
3. インデックスの作成とパフォーマンステスト

### 8.2 Phase 2: API実装
1. 面談予約APIエンドポイントの実装
2. 権限チェックミドルウェアの実装
3. バリデーション処理の実装

### 8.3 Phase 3: ビジネスロジック移植
1. InterviewBookingServiceのロジック移植
2. InterviewReminderServiceの実装
3. 通知サービスとの連携

### 8.4 Phase 4: UI統合
1. 予約カレンダーコンポーネントの統合
2. 管理ダッシュボードの統合
3. スタイルシートの調整

### 8.5 Phase 5: テストと調整
1. 単体テストの実装
2. 統合テストの実施
3. ユーザビリティテスト（50代職員含む）

## 9. 注意事項とベストプラクティス

### 9.1 データ移行
- VoiceDriveの既存予約データは移行不要（新システムで新規開始）
- 職員マスタは共通データベースを参照

### 9.2 セキュリティ
- 面談内容の機密性レベルに応じたアクセス制御
- 個人情報保護法準拠のデータ管理
- 監査ログの実装

### 9.3 パフォーマンス
- 時間枠検索の最適化（インデックス活用）
- 大量通知送信時のキューイング
- フロントエンドでの適切なキャッシング

### 9.4 運用考慮事項
- 祝日・年末年始の自動判定
- 面談者の休暇管理との連携
- 緊急面談への対応フロー

## 10. 参照実装ファイル

VoiceDriveの以下のファイルを参考に実装してください：

- **型定義**: `/src/types/interview.ts`
- **ビジネスロジック**: `/src/services/InterviewBookingService.ts`
- **リマインダー**: `/src/services/InterviewReminderService.ts`
- **UIコンポーネント**: 
  - `/src/components/interview/InterviewBookingCalendar.tsx`
  - `/src/components/interview/InterviewManagementDashboard.tsx`
- **実装レポート**: `/INTERVIEW_SYSTEM_IMPLEMENTATION_REPORT.md`

これらのファイルには、実装の詳細とベストプラクティスが含まれています。

---

本仕様書は、VoiceDriveの面談制度を人事システムに統合するための完全なガイドです。実装時は、両システム間のデータ整合性と、エンドユーザー（特に50代以上の職員）の使いやすさを最優先に考慮してください。