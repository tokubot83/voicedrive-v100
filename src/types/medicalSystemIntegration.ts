// 医療システム統合用型定義

// AI提案データ構造
export interface AIProposal {
  id: string;
  rank: 1 | 2 | 3;
  confidence: number; // 92, 87, 82 等のパーセンテージ
  interviewer: {
    id: string;
    name: string;
    title: string;
    department: string;
    experience: string;
    specialties: string[];
    photo?: string;
  };
  schedule: {
    date: string; // "2025-09-20"
    time: string; // "14:30"
    duration: number; // 45 (分)
    location: string; // "相談室A"
    format: 'face_to_face' | 'online' | 'hybrid';
  };
  staffFriendlyDisplay: {
    title: string;
    summary: string;
    highlights: string[];
  };
  rankingReason: string;
}

// AI提案受信データ
export interface ProposalResponse {
  voicedriveRequestId: string;
  requestId: string;
  proposals: AIProposal[];
  expiresAt: string; // ISO 8601 format
  contactInfo: {
    urgentPhone: string;
    email: string;
  };
  metadata: {
    processingModel: string;
    totalCandidates: number;
    selectedTop: number;
    dataPrivacy: string;
  };
}

// 予約確定通知データ
export interface BookingConfirmedResponse {
  voicedriveRequestId: string;
  requestId: string;
  bookingId: string;
  status: 'confirmed';
  confirmedBy: string;
  confirmedAt: string; // ISO 8601 format
  finalReservation: {
    staffId: string;
    staffName: string;
    interviewerId: string;
    interviewerName: string;
    interviewerTitle: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    location: string;
    type: string;
    category: string;
  };
  notifications: {
    interviewerNotified: boolean;
    calendarUpdated: boolean;
    reminderScheduled: boolean;
  };
  message: string;
}

// 再提案データ
export interface RevisedProposalResponse {
  voicedriveRequestId: string;
  requestId: string;
  adjustmentId: string;
  revisedProposals: AIProposal[];
  adjustmentSummary: string;
  expiresAt: string;
  changes: {
    originalRequest: string;
    adjustedRequest: string;
    changeReason: string;
  };
}

// 変更承認・拒否通知
export interface RescheduleApprovalResponse {
  voicedriveRequestId: string;
  bookingId: string;
  requestId: string;
  approvalStatus: 'approved' | 'rejected';
  newBookingDetails?: {
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    location: string;
    interviewerName: string;
  };
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  message: string;
}

// キャンセル受付完了通知
export interface CancellationConfirmedResponse {
  voicedriveRequestId: string;
  bookingId: string;
  cancellationStatus: 'confirmed';
  cancellationType: 'emergency' | 'same_day' | 'advance';
  processedBy: string;
  processedAt: string;
  refundEligible: boolean;
  alternativeSuggestions?: Array<{
    date: string;
    time: string;
    interviewer: string;
  }>;
  message: string;
}

// 通知メッセージ
export interface NotificationMessage {
  type: 'proposal_received' | 'booking_confirmed' | 'reschedule_approved' | 'reschedule_rejected' | 'cancellation_confirmed';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired?: boolean;
}

// WebSocket接続状態
export interface WebSocketConnectionState {
  isConnected: boolean;
  connectionId?: string;
  lastHeartbeat?: string;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// API送信状態追跡
export interface RequestTrackingState {
  voicedriveRequestId: string;
  status: 'sending' | 'processing' | 'completed' | 'failed' | 'timeout';
  createdAt: string;
  lastUpdatedAt: string;
  processingStartedAt?: string;
  completedAt?: string;
  estimatedCompletionTime?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

// Token管理状態
export interface TokenState {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  refreshThreshold: string; // 2時間前
  isValid: boolean;
  lastRefreshed?: string;
  autoRefreshEnabled: boolean;
}

// 負荷制御状態
export interface LoadControlState {
  currentConnections: number;
  maxConnections: number; // 50
  requestsPerMinute: number;
  maxRequestsPerMinute: number; // 100
  isThrottled: boolean;
  lastThrottleTime?: string;
  queuedRequests: number;
}

// エラー状態
export interface ErrorState {
  hasError: boolean;
  errorType?: 'network' | 'auth' | 'timeout' | 'server' | 'validation';
  errorMessage?: string;
  errorCode?: string;
  timestamp?: string;
  retryable: boolean;
  suggestedAction?: string;
}

// 統合システム全体状態
export interface MedicalSystemIntegrationState {
  connection: WebSocketConnectionState;
  requests: Record<string, RequestTrackingState>;
  token: TokenState;
  loadControl: LoadControlState;
  error: ErrorState;
  notifications: NotificationMessage[];
  lastSync?: string;
}