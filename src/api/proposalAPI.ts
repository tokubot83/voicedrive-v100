// VoiceDrive 提案管理API
// MCPサーバーとの通信を管理し、医療システムからの提案データを取得

// 医療システムからの提案データ型定義
export interface InterviewProposal {
  id: string;
  rank: 1 | 2 | 3;
  confidence: number; // 適合度（0-100）
  interviewer: {
    id: string;
    name: string;
    title: string;
    department: string;
    experience: string;
    specialties?: string[];
    photo?: string;
  };
  schedule: {
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    duration: number; // 分
    location: string;
    format: 'face_to_face' | 'online' | 'phone';
  };
  staffFriendlyDisplay: {
    title: string;
    summary: string;
    highlights: string[];
  };
  rankingReason: string;
}

export interface ProposalResponse {
  voicedriveRequestId: string;
  requestId: string;
  proposals: InterviewProposal[];
  expiresAt: string;
  contactInfo: {
    urgentPhone: string;
    email: string;
  };
  metadata?: {
    processingModel: string;
    totalCandidates: number;
    selectedTop: number;
    dataPrivacy: string;
  };
  receivedAt?: string;
  status?: 'pending_selection' | 'confirmed' | 'revised_pending_selection';
  revisedProposals?: InterviewProposal[];
  adjustmentId?: string;
  adjustmentSummary?: string;
}

export interface BookingConfirmation {
  voicedriveRequestId: string;
  requestId: string;
  bookingId: string;
  status: 'confirmed';
  confirmedBy: string;
  confirmedAt: string;
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

export interface ProposalStatus {
  requestId: string;
  hasProposals: boolean;
  proposalStatus: string;
  hasBooking: boolean;
  bookingStatus: string;
  lastUpdate: string | null;
}

// MCP統合サーバー設定
const MCP_SERVER_CONFIG = {
  baseURL: process.env.REACT_APP_MCP_SERVER_URL || 'http://localhost:8080',
  timeout: 10000, // 10秒
};

// APIエラーハンドリング
class ProposalAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ProposalAPIError';
  }
}

// APIリクエスト基盤
async function makeRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${MCP_SERVER_CONFIG.baseURL}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MCP_SERVER_CONFIG.timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ProposalAPIError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();

    if (data.success === false) {
      throw new ProposalAPIError(
        data.error || 'Unknown error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ProposalAPIError) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ProposalAPIError('Request timeout', 408);
      }
      throw new ProposalAPIError(error.message);
    }
    throw new ProposalAPIError('Unknown error occurred');
  }
}

// 1. 提案データ取得（VoiceDriveリクエストID指定）
export async function fetchProposals(
  voicedriveRequestId: string
): Promise<ProposalResponse> {
  try {
    const response = await makeRequest<{ success: boolean; data: ProposalResponse }>(
      `/api/medical/proposals/${voicedriveRequestId}`,
      { method: 'GET' }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    throw error;
  }
}

// 2. 予約確定データ取得
export async function fetchBookingConfirmation(
  voicedriveRequestId: string
): Promise<BookingConfirmation> {
  try {
    const response = await makeRequest<{ success: boolean; data: BookingConfirmation }>(
      `/api/medical/booking/${voicedriveRequestId}`,
      { method: 'GET' }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking confirmation:', error);
    throw error;
  }
}

// 3. ステータス確認
export async function checkProposalStatus(
  voicedriveRequestId: string
): Promise<ProposalStatus> {
  try {
    const response = await makeRequest<{ success: boolean; status: ProposalStatus }>(
      `/api/medical/status/${voicedriveRequestId}`,
      { method: 'GET' }
    );

    return response.status;
  } catch (error) {
    console.error('Failed to check proposal status:', error);
    throw error;
  }
}

// 4. 提案データポーリング（リアルタイム更新用）
export function pollProposals(
  voicedriveRequestId: string,
  onUpdate: (proposals: ProposalResponse) => void,
  onError?: (error: Error) => void,
  interval: number = 5000 // デフォルト5秒
): () => void {
  let isPolling = true;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const proposals = await fetchProposals(voicedriveRequestId);
      onUpdate(proposals);
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    }

    if (isPolling) {
      timeoutId = setTimeout(poll, interval);
    }
  };

  // 初回実行
  poll();

  // 停止関数を返す
  return () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

// 5. ステータスポーリング（状態変化監視用）
export function pollStatus(
  voicedriveRequestId: string,
  onStatusChange: (status: ProposalStatus) => void,
  onError?: (error: Error) => void,
  interval: number = 3000 // デフォルト3秒
): () => void {
  let isPolling = true;
  let lastStatus: ProposalStatus | null = null;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const status = await checkProposalStatus(voicedriveRequestId);

      // ステータスが変化した場合のみコールバック実行
      if (!lastStatus ||
          lastStatus.proposalStatus !== status.proposalStatus ||
          lastStatus.bookingStatus !== status.bookingStatus) {
        onStatusChange(status);
        lastStatus = status;
      }
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    }

    if (isPolling) {
      timeoutId = setTimeout(poll, interval);
    }
  };

  // 初回実行
  poll();

  // 停止関数を返す
  return () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

// 6. 提案データキャッシュ管理
class ProposalCache {
  private cache: Map<string, { data: ProposalResponse; timestamp: number }> = new Map();
  private cacheTimeout: number = 60000; // 1分

  set(requestId: string, data: ProposalResponse): void {
    this.cache.set(requestId, {
      data,
      timestamp: Date.now()
    });
  }

  get(requestId: string): ProposalResponse | null {
    const cached = this.cache.get(requestId);

    if (!cached) return null;

    // キャッシュ有効期限チェック
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(requestId);
      return null;
    }

    return cached.data;
  }

  clear(requestId?: string): void {
    if (requestId) {
      this.cache.delete(requestId);
    } else {
      this.cache.clear();
    }
  }
}

export const proposalCache = new ProposalCache();

// 7. キャッシュ付き提案データ取得
export async function fetchProposalsWithCache(
  voicedriveRequestId: string,
  forceRefresh: boolean = false
): Promise<ProposalResponse> {
  // キャッシュチェック
  if (!forceRefresh) {
    const cached = proposalCache.get(voicedriveRequestId);
    if (cached) {
      console.log('Returning cached proposals for:', voicedriveRequestId);
      return cached;
    }
  }

  // APIから取得
  const proposals = await fetchProposals(voicedriveRequestId);

  // キャッシュに保存
  proposalCache.set(voicedriveRequestId, proposals);

  return proposals;
}

// エクスポート
export { ProposalAPIError };