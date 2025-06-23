// イベント企画機能の型定義
// Forward declaration to avoid circular dependency
export interface User {
  id: string;
  name: string;
  department: string;
  role?: string;
  avatar?: string;
  facility_id?: string;
  stakeholderCategory?: string;
  position?: string;
  expertise?: number;
  hierarchyLevel?: number;
  permissionLevel?: number;
  isRetired?: boolean;
  retirementDate?: Date;
  anonymizedId?: string;
  retirementProcessedBy?: string;
  retirementProcessedDate?: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  
  // 日程情報
  proposedDates: ProposedDate[];
  finalDate?: EventDate;
  registrationDeadline?: Date;
  
  // 参加者情報
  organizer: User;
  maxParticipants?: number;
  participants: Participant[];
  waitlist: Participant[];
  
  // 会場・詳細
  venue?: Venue;
  cost?: number;
  requirements?: string[];
  
  // ステータス
  status: EventStatus;
  visibility: EventVisibility;
  
  // 機能設定
  allowDateVoting: boolean;
  allowParticipantComments: boolean;
  sendReminders: boolean;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export enum EventType {
  SOCIAL = 'social',           // 懇親会・飲み会
  TRAINING = 'training',       // 研修・勉強会
  MEETING = 'meeting',         // 会議・打ち合わせ
  SPORTS = 'sports',           // スポーツ・運動
  CULTURE = 'culture',         // 文化・趣味
  VOLUNTEER = 'volunteer',     // ボランティア
  OTHER = 'other'              // その他
}

export enum EventStatus {
  PLANNING = 'planning',       // 企画中
  DATE_VOTING = 'date_voting', // 日程調整中
  RECRUITING = 'recruiting',   // 参加者募集中
  CONFIRMED = 'confirmed',     // 開催決定
  ONGOING = 'ongoing',         // 開催中
  COMPLETED = 'completed',     // 終了
  CANCELLED = 'cancelled'      // 中止
}

export enum EventVisibility {
  TEAM = 'team',
  DEPARTMENT = 'department',
  FACILITY = 'facility',
  ORGANIZATION = 'organization'
}

export interface ProposedDate {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  votes: DateVote[];
  totalVotes: number;
}

export interface DateVote {
  id: string;
  proposedDateId: string;
  userId: string;
  response: DateResponse;
  timestamp: Date;
}

export enum DateResponse {
  AVAILABLE = 'available',     // 参加可能
  MAYBE = 'maybe',            // 参加できるかも
  UNAVAILABLE = 'unavailable' // 参加不可
}

export interface EventDate {
  date: Date;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface Participant {
  id: string;
  user: User;
  status: ParticipantStatus;
  joinedAt: Date;
  note?: string;
  dietaryRequirements?: string[];
}

export enum ParticipantStatus {
  CONFIRMED = 'confirmed',     // 参加確定
  TENTATIVE = 'tentative',     // 仮参加
  DECLINED = 'declined',       // 不参加
  WAITLISTED = 'waitlisted'    // キャンセル待ち
}

export interface Venue {
  name: string;
  address?: string;
  capacity?: number;
  amenities?: string[];
  cost?: number;
  contactInfo?: string;
}

export interface EventReminder {
  id: string;
  eventId: string;
  type: ReminderType;
  scheduledFor: Date;
  recipients: string[]; // User IDs
  sent: boolean;
  sentAt?: Date;
}

export enum ReminderType {
  REGISTRATION_DEADLINE = 'registration_deadline',
  ONE_WEEK_BEFORE = 'one_week_before',
  ONE_DAY_BEFORE = 'one_day_before',
  DAY_OF_EVENT = 'day_of_event'
}

// イベント作成データ
export interface CreateEventData {
  title: string;
  description: string;
  type: EventType;
  proposedDates: {
    date: string; // ISO date string
    startTime: string;
    endTime: string;
  }[];
  maxParticipants?: number;
  venue?: Omit<Venue, 'capacity'>;
  cost?: number;
  requirements?: string[];
  registrationDeadline?: string; // ISO date string
  visibility: EventVisibility;
  allowDateVoting: boolean;
  allowParticipantComments: boolean;
  sendReminders: boolean;
  tags?: string[];
}

// 日程調整結果
export interface DateVotingResult {
  proposedDate: ProposedDate;
  availableCount: number;
  maybeCount: number;
  unavailableCount: number;
  percentage: number;
  isTopChoice: boolean;
}

// イベント統計
export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalParticipants: number;
  averageParticipation: number;
  popularEventTypes: { type: EventType; count: number }[];
}