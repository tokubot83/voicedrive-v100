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
  
  // 履歴・メタデータ
  createdAt: Date;
  createdBy: string;
  lastModified?: Date;
  modifiedBy?: string;
  
  // 管理者メモ・コメント
  adminNotes?: string;
  employeeNotes?: string;
  
  // 面談結果（面談後）
  conductedAt?: Date;
  duration?: number; // 実際の面談時間（分）
  outcome?: InterviewOutcome;
}

export type InterviewType = 
  | 'regular'        // 定期面談
  | 'career'         // キャリア相談
  | 'concern'        // 悩み相談
  | 'evaluation'     // 評価面談
  | 'development'    // 能力開発
  | 'grievance'      // 苦情・不満
  | 'exit'           // 退職面談
  | 'other';         // その他

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
  | 'pending'       // 予約申請中
  | 'confirmed'     // 予約確定
  | 'rescheduled'   // 変更済み
  | 'completed'     // 面談完了
  | 'cancelled'     // キャンセル
  | 'no_show';      // 無断欠席

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
  | 'follow_up_required';

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