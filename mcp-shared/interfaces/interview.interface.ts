/**
 * 面談システムの抽象インターフェース定義
 * 将来的な拡張を考慮した汎用的な型定義
 */

// 基本的な識別子の型
export type ID = string | number;

// 汎用的な分類インターフェース
export interface IClassification {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  metadata?: Record<string, any>;
}

// 汎用的な面談タイプインターフェース
export interface IInterviewType {
  id: string;
  name: string;
  classification: string;
  target?: string;
  frequency?: string;
  trigger?: string;
  requiresCategory: boolean;
  active: boolean;
  sortOrder?: number;
  validFrom?: Date;
  validUntil?: Date;
  metadata?: Record<string, any>;
}

// カテゴリインターフェース
export interface ICategory {
  id: string;
  name: string;
  parentType: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
}

// 予約インターフェース
export interface IBooking {
  id: ID;
  interviewType: string;
  category?: string;
  staffId: ID;
  bookingDate: Date;
  bookingTime: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// 予約ステータス（拡張可能）
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

// 設定管理インターフェース
export interface IInterviewConfig {
  version: string;
  lastUpdated: string;
  classifications: IClassification[];
  interviewTypes: IInterviewType[];
  categories: Record<string, string[]>;
  settings?: ISystemSettings;
}

// システム設定インターフェース
export interface ISystemSettings {
  maxBookingsPerDay?: number;
  advanceBookingDays?: number;
  cancellationDeadlineHours?: number;
  enableNotifications?: boolean;
  enableAutoReminders?: boolean;
  features?: IFeatureFlags;
}

// フィーチャーフラグインターフェース
export interface IFeatureFlags {
  enableAIAssistant?: boolean;
  enableVideoConference?: boolean;
  enableTranscription?: boolean;
  enableMultiLanguage?: boolean;
  enableMobileApp?: boolean;
  [key: string]: boolean | undefined;
}

// APIレスポンスの汎用インターフェース
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IApiError;
  metadata?: IResponseMetadata;
}

// APIエラーインターフェース
export interface IApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: Date;
}

// レスポンスメタデータ
export interface IResponseMetadata {
  timestamp: Date;
  version: string;
  requestId?: string;
  pagination?: IPagination;
}

// ページネーション
export interface IPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

// ユーザー権限インターフェース（将来の拡張用）
export interface IUserPermissions {
  canCreateBooking: boolean;
  canEditBooking: boolean;
  canDeleteBooking: boolean;
  canViewAllBookings: boolean;
  canManageTypes: boolean;
  canManageCategories: boolean;
  customPermissions?: Record<string, boolean>;
}

// イベントインターフェース（将来のイベント駆動設計用）
export interface IInterviewEvent {
  eventType: InterviewEventType;
  timestamp: Date;
  userId: ID;
  data: any;
  metadata?: Record<string, any>;
}

export enum InterviewEventType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  BOOKING_CANCELLED = 'booking_cancelled',
  INTERVIEW_COMPLETED = 'interview_completed',
  REMINDER_SENT = 'reminder_sent',
  TYPE_ADDED = 'type_added',
  TYPE_UPDATED = 'type_updated',
  CATEGORY_ADDED = 'category_added'
}