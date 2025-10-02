// 面談予約システム型定義

export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string; // "13:40"
  endTime: string;   // "14:10"
  isAvailable: boolean;
  isBlocked: boolean;
  blockedBy?: string;
  blockedReason?: string;
  bookedBy?: string;
  bookingId?: string;
}

// 医療チームからの提案パターン
export interface ProposalPattern {
  id: string;
  proposalNumber: 1 | 2 | 3;
  date: Date;
  startTime: string;
  endTime: string;
  interviewer: {
    id: string;
    name: string;
    title: string;
    department: string;
    specialties?: string[];
  };
  location: {
    type: 'online' | 'onsite';
    place?: string;
    roomNumber?: string;
    meetingUrl?: string;
  };
  matchingScore?: number; // AI分析のマッチング度
  isRecommended?: boolean;
  notes?: string;
}

// 再調整依頼
export interface RescheduleRequest {
  id?: string;
  bookingId?: string;
  reason: 'time_preference' | 'location_preference' | 'other';
  preferredDates?: Date[];
  preferredTimeSlots?: string[];
  avoidDates?: Date[];
  requestedBy?: string;
  requestedAt?: Date;
  status?: 'pending' | 'processing' | 'completed';
  newProposals?: ProposalPattern[];
}

export interface InterviewBooking {
  id: string;

  // 予約者情報
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeePhone: string;
  facility: string;
  department: string;
  position: string;

  // 予約情報
  bookingDate: Date;
  timeSlot: TimeSlot;

  // 面談内容
  interviewType: InterviewType;
  interviewCategory: InterviewCategory;
  requestedTopics: string[];
  description?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';

  // 面談者情報
  interviewerId?: string;
  interviewerName?: string;
  interviewerLevel?: number; // 権限レベル

  // ステータス管理
  status: InterviewStatus;

  // 提案パターン（医療チームから）
  proposalPatterns?: ProposalPattern[];
  selectedProposalId?: string;
  rescheduleRequests?: RescheduleRequest[];

  // 履歴・メタデータ
  createdAt: Date;
  createdBy: string;
  lastModified?: Date;
  modifiedBy?: string;

  // 管理者メモ・コメント
  adminNotes?: string;
  employeeNotes?: string;

  // キャンセル・変更履歴
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  rescheduleRequests?: RescheduleRequest[];

  // 面談結果（面談後）
  conductedAt?: Date;
  duration?: number; // 実際の面談時間（分）
  outcome?: InterviewOutcome;
}

export type InterviewType = 
  // === 新体系（10種類）===
  // 定期面談（3種類）- カテゴリ選択不要
  | 'new_employee_monthly'    // 新入職員月次面談
  | 'regular_annual'          // 一般職員年次面談
  | 'management_biannual'     // 管理職半年面談
  // 特別面談（3種類）- カテゴリ選択不要
  | 'return_to_work'          // 復職面談
  | 'incident_followup'       // インシデント後面談
  | 'exit_interview'          // 退職面談
  // サポート面談（4種類）
  | 'feedback'                // フィードバック面談 - カテゴリ選択不要
  | 'career_support'          // キャリア系面談 - カテゴリ選択必要
  | 'workplace_support'       // 職場環境系面談 - カテゴリ選択必要
  | 'individual_consultation' // 個別相談面談 - カテゴリ選択必要
  
  // === 旧体系（後方互換性のため保持）===
  | 'ad_hoc'                  // → individual_consultationに移行
  | 'career_development'      // → career_supportに移行
  | 'stress_care'             // → workplace_supportに移行
  | 'performance_review'      // → feedbackに移行
  | 'grievance'               // → workplace_supportに移行
  | 'regular'                 // 定期面談（旧）
  | 'career'                  // キャリア相談（旧）
  | 'concern'                 // 悩み相談（旧）
  | 'evaluation'              // 評価面談（旧）
  | 'development'             // 能力開発（旧）
  | 'exit'                    // 退職面談（旧）
  | 'other';                  // その他

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

export type InterviewStatus =
  | 'pending'             // 予約申請中
  | 'confirmed'           // 予約確定
  | 'rescheduled'         // 変更済み
  | 'reschedule_pending'  // 変更申請中
  | 'completed'           // 面談完了
  | 'cancelled'           // キャンセル
  | 'no_show';            // 無断欠席

export interface InterviewOutcome {
  summary: string;
  actionItems: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  referrals?: string[]; // 他部門・専門家への紹介
  confidentialityLevel: 'open' | 'restricted' | 'confidential';
}

// 面談予約統計
export interface InterviewStats {
  totalBookings: number;
  completedInterviews: number;
  pendingBookings: number;
  cancelledBookings: number;
  noShowCount: number;
  
  // カテゴリ別統計
  byType: Record<InterviewType, number>;
  byCategory: Record<InterviewCategory, number>;
  byStatus: Record<InterviewStatus, number>;
  
  // 期間別統計
  thisMonth: number;
  lastMonth: number;
  thisQuarter: number;
  
  // 人気の時間帯
  popularTimeSlots: Array<{
    time: string;
    bookingCount: number;
  }>;
  
  // 面談者別統計
  byInterviewer: Array<{
    interviewerId: string;
    interviewerName: string;
    interviewCount: number;
    averageRating?: number;
  }>;
}

// 面談スケジュール設定
export interface InterviewScheduleConfig {
  // 基本設定
  slotDuration: number; // 分
  breakDuration: number; // 分
  
  // 営業時間
  workingHours: {
    start: string; // "13:40"
    end: string;   // "17:00"
  };
  
  // 営業日設定
  workingDays: string[]; // ['月', '火', '水', '木', '金']
  
  // 祝日・休業日
  holidays: Date[];
  closedDates: Date[];
  
  // 予約制限
  maxAdvanceBookingDays: number; // 最大何日先まで予約可能
  minAdvanceBookingHours: number; // 最低何時間前まで予約可能
  
  // 同一人物の予約制限
  maxBookingsPerMonth: number;
  minIntervalBetweenBookings: number; // 日
}

// 面談者情報
export interface Interviewer {
  id: string;
  name: string;
  title: string;
  department: string;
  permissionLevel: number;
  
  // 専門分野
  specialties: InterviewCategory[];
  
  // 利用可能性
  isActive: boolean;
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  
  // 予約状況
  currentBookings: number;
  maxBookingsPerDay: number;
  maxBookingsPerWeek: number;
  
  // 連絡先
  email: string;
  phone?: string;
  
  // 統計
  totalInterviews: number;
  averageRating?: number;
  bio?: string;
}

// 面談予約要求
export interface BookingRequest {
  employeeId: string;
  preferredDates: Date[]; // 希望日（最大3日）
  preferredTimes: string[]; // 希望時間帯
  interviewType: InterviewType;
  interviewCategory: InterviewCategory;
  requestedTopics: string[];
  description?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  preferredInterviewer?: string; // 希望面談者ID
}

// 管理画面用データ
export interface BookingManagementData {
  // 今日の予約
  todaysBookings: InterviewBooking[];
  
  // 今週の予約
  weeklyBookings: InterviewBooking[];
  
  // 待機中の予約申請
  pendingRequests: InterviewBooking[];
  
  // 利用可能な時間枠
  availableSlots: TimeSlot[];
  
  // ブロック済み時間枠
  blockedSlots: TimeSlot[];
  
  // 面談者の空き状況
  interviewerAvailability: Array<{
    interviewer: Interviewer;
    availableSlots: TimeSlot[];
  }>;
  
  // 統計情報
  stats: InterviewStats;
}

// レスポンス型
export interface BookingResponse {
  success: boolean;
  message: string;
  bookingId?: string;
  suggestedAlternatives?: TimeSlot[];
}

export interface CancellationResponse {
  success: boolean;
  message: string;
  refundEligible?: boolean;
}

// 通知関連
export interface InterviewNotification {
  id: string;
  bookingId: string;
  recipientId: string;
  type: NotificationType;
  message: string;
  scheduledAt: Date;
  sentAt?: Date;
  isRead: boolean;
}

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_reminder_24h'
  | 'booking_reminder_2h'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'interviewer_assigned'
  | 'follow_up_required'
  | 'interview_reminder_first'      // 新入職員初回面談リマインダー
  | 'interview_reminder_monthly'    // 新入職員月次面談リマインダー
  | 'interview_reminder_annual'     // 一般職員年次面談リマインダー
  | 'interview_overdue'             // 面談期限超過通知
  | 'interview_auto_scheduled';     // 自動スケジュール面談通知

// フィルター・検索
export interface BookingFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: InterviewStatus[];
  interviewType?: InterviewType[];
  interviewCategory?: InterviewCategory[];
  interviewerId?: string;
  facility?: string;
  department?: string;
  urgencyLevel?: ('low' | 'medium' | 'high' | 'urgent')[];
}

export interface BookingSearchCriteria {
  employeeName?: string;
  employeeId?: string;
  bookingId?: string;
  interviewerName?: string;
  description?: string;
}

// 日次スケジュール
export interface DailySchedule {
  date: Date;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  blockedSlots: number;
  interviews: InterviewBooking[];
  interviewerSchedules: Array<{
    interviewer: Interviewer;
    slots: TimeSlot[];
    bookings: InterviewBooking[];
  }>;
}

// 週次統計
export interface WeeklyStatistics {
  weekStart: Date;
  weekEnd: Date;
  totalBookings: number;
  completedInterviews: number;
  cancelledBookings: number;
  noShowCount: number;
  utilizationRate: number; // 利用率（%）
  averageRating: number;
  popularTimeSlots: Array<{
    timeSlot: string;
    bookingCount: number;
  }>;
  categoryBreakdown: Array<{
    category: InterviewCategory;
    count: number;
    percentage: number;
  }>;
  departmentBreakdown: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
}

// 医療従事者の雇用状況と面談履歴
export interface MedicalEmployeeProfile {
  employeeId: string;
  employeeName: string;
  hireDate: Date;
  employmentStatus: EmploymentStatus;
  department: string;
  position: string;
  workPattern: WorkPattern;
  
  // 特別な状況
  specialCircumstances: {
    isOnLeave: boolean;           // 休職中
    isRetiring: boolean;          // 退職手続き中
    isOnMaternityLeave: boolean;  // 産休・育休中
    returnToWorkDate?: Date;      // 復職予定日
    leaveStartDate?: Date;        // 休職開始日
  };
  
  // 面談履歴
  interviewHistory: {
    firstInterviewDate?: Date;      // このシステムでの初回面談日
    lastInterviewDate?: Date;       // 最終面談日
    nextScheduledDate?: Date;       // 次回予定面談日
    totalInterviews: number;        // 総面談回数
    mandatoryInterviewsCompleted: number; // 必須面談完了数
    lastReminderSent?: Date;        // 最終リマインダー送信日
    overdueCount: number;           // 期限超過回数
  };
}

export type EmploymentStatus = 
  | 'new_employee'      // 新入職員（1年未満）
  | 'regular_employee'  // 一般職員（1年以上）
  | 'management'        // 管理職・リーダー職
  | 'on_leave'          // 休職中
  | 'retiring';         // 退職手続き中

export type WorkPattern = 
  | 'day_shift'         // 日勤
  | 'night_shift'       // 夜勤
  | 'rotating_shift'    // 交代勤務
  | 'on_call';          // オンコール

// 面談リマインダー設定
export interface InterviewReminderConfig {
  employmentStatus: EmploymentStatus;
  department: string;
  workPattern: WorkPattern;
  
  // 面談頻度ルール
  frequencyRules: {
    mandatoryInterviewType: InterviewType;
    intervalDays: number;           // 面談間隔（日）
    reminderSchedule: number[];     // リマインダー送信日（面談日の何日前）
    overdueReminderSchedule: number[]; // 期限超過後のリマインダー（何日後）
    maxOverdueReminders: number;    // 最大督促回数
  };
  
  // 除外条件
  excludeFromReminders: boolean;
  excludeReason?: string;
  excludeUntil?: Date;
}

// 自動リマインダーのスケジュール計算結果
export interface ReminderSchedule {
  employeeId: string;
  nextInterviewDue: Date;
  reminderDates: Array<{
    date: Date;
    type: NotificationType;
    message: string;
  }>;
  isOverdue: boolean;
  daysSinceOverdue?: number;
}

// キャンセル・変更関連の型定義
export interface CancellationRequest {
  bookingId: string;
  reason: CancellationReason;
  customReason?: string;
  cancelledAt: Date;
  cancelledBy: string;
}

export type CancellationReason =
  | 'emergency'        // 緊急事態
  | 'illness'          // 体調不良
  | 'work_conflict'    // 業務都合
  | 'schedule_change'  // スケジュール変更
  | 'personal'         // 個人的事情
  | 'other';           // その他

export interface RescheduleRequest {
  id: string;
  bookingId: string;
  requestedBy: string;
  requestedAt: Date;
  currentDateTime: Date;
  preferredDates: Date[];          // 複数の希望日時
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  approvedDateTime?: Date;         // 承認された日時
}

export interface BookingCancellationResponse {
  success: boolean;
  message: string;
  refundEligible?: boolean;
  alternativeSuggestions?: TimeSlot[];
}

export interface BookingRescheduleResponse {
  success: boolean;
  message: string;
  requestId?: string;
  requiresApproval: boolean;
  suggestedAlternatives?: TimeSlot[];
}

// Phase 4-A: 面談サマリ関連の型定義

export interface InterviewResult {
  id: string;
  requestId: string;
  interviewId: string;
  completedAt: string;
  duration: number;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    description: string;
    dueDate?: string;
  }>;
  followUpRequired: boolean;
  followUpDate?: string;
  feedbackToEmployee?: string;
  nextRecommendations?: {
    suggestedNextInterview?: string;
    suggestedTopics?: string[];
  };
  isRead?: boolean;
  readAt?: string;
}

export interface Booking {
  id: string;
  interviewType: string;
  bookingDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  interviewerName?: string;
  duration?: number;
  // 他の面談予約関連フィールド
}

export interface EnhancedBooking extends Booking {
  hasSummary: boolean;
  summaryData?: InterviewResult;
  summaryStatus?: 'received' | 'waiting' | null;
}

export interface InterviewHistoryStats {
  totalInterviews: number;
  summariesReceived: number;
  scheduledBookings: number;
}

// Phase 4-B: フィルタリング & 検索機能の型定義

export interface InterviewFilters {
  period: 'all' | 'this_month' | 'last_month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  status: 'all' | 'summary_received' | 'summary_waiting';
  interviewType: 'all' | string; // 'all' or specific type
  keyword: string;
}

export interface InterviewSearchResult {
  bookings: EnhancedBooking[];
  totalCount: number;
  filteredCount: number;
  activeFilters: string[]; // 'period: 今月', 'status: サマリ受信済み' など
}