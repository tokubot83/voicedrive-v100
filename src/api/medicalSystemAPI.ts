// 医療システム API通信基盤
import { InterviewType, InterviewCategory } from '../types/interview';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateNotification, validateBookingData, validateSurveyData } from '../middleware/validationMiddleware';
import { rateLimit, standardRateLimit } from '../middleware/rateLimitMiddleware';

// 医療システム通信用型定義
export interface AssistedBookingRequest {
  staffId: string;
  staffName: string;
  department: string;
  position: string;
  experienceYears: number;
  facility: string;
  type: InterviewType;
  category: InterviewCategory;
  topic: string;
  urgencyLevel: 'this_week' | 'next_week' | 'this_month' | 'urgent';
  timePreference: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    anytime: boolean;
  };
  interviewerPreference: {
    anyAvailable: boolean;
    preferredName?: string;
    genderPreference?: 'male' | 'female' | 'any';
  };
  minDuration: number;
  maxDuration: number;
  notes?: string;
  source: 'voicedrive';
  voicedriveRequestId: string;
}

export interface ChoiceConfirmation {
  requestId: string;
  voicedriveRequestId: string;
  selectedProposalId: string;
  staffFeedback?: string;
  selectedBy: string;
  selectionTimestamp: string;
}

export interface AdjustmentRequest {
  requestId: string;
  voicedriveRequestId: string;
  adjustmentType: 'schedule_change' | 'interviewer_change' | 'duration_change';
  reason: string;
  staffPreferences: {
    alternativeDates?: string[];
    alternativeTimes?: string[];
    interviewerPreference?: 'original' | 'any' | 'specific';
    preferredInterviewer?: string;
    maxDuration?: number;
    notes?: string;
  };
  requestedBy: string;
  requestTimestamp: string;
}

// 医療システムAPI設定
const MEDICAL_SYSTEM_CONFIG = {
  baseURL: 'https://medical.system.local',
  apiVersion: 'v2.1',
  timeout: 30000, // 30秒
  retryAttempts: 3,
  retryDelay: 1000 // 1秒
};

// 現在のBearer Token（実装時に環境変数から取得）
let currentToken = 'vd_prod_A8B9C2D3E4F5G6H7I8J9K0L1M2N3O4P5';

// APIヘッダー生成
const getHeaders = (): Record<string, string> => ({
  'Authorization': `Bearer ${currentToken}`,
  'Content-Type': 'application/json',
  'X-API-Version': MEDICAL_SYSTEM_CONFIG.apiVersion,
  'X-Client-ID': 'voicedrive-system',
  'X-Request-Source': 'voicedrive-web'
});

// APIリクエスト基盤（リトライ機能付き）
async function makeAPIRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  attempt: number = 1
): Promise<T> {
  const url = `${MEDICAL_SYSTEM_CONFIG.baseURL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(MEDICAL_SYSTEM_CONFIG.timeout)
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token期限切れ - 自動更新を試行
        await refreshToken();
        if (attempt < MEDICAL_SYSTEM_CONFIG.retryAttempts) {
          return makeAPIRequest<T>(endpoint, method, data, attempt + 1);
        }
      }

      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed (attempt ${attempt}):`, error);

    if (attempt < MEDICAL_SYSTEM_CONFIG.retryAttempts) {
      await new Promise(resolve => setTimeout(resolve, MEDICAL_SYSTEM_CONFIG.retryDelay * attempt));
      return makeAPIRequest<T>(endpoint, method, data, attempt + 1);
    }

    throw error;
  }
}

// Token自動更新
async function refreshToken(): Promise<void> {
  try {
    const response = await fetch(`${MEDICAL_SYSTEM_CONFIG.baseURL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: 'refresh_vd_X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6'
      })
    });

    if (response.ok) {
      const tokenData = await response.json();
      currentToken = tokenData.accessToken;
      console.log('Token refreshed successfully');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('認証に失敗しました。再度ログインしてください。');
  }
}

// 1. 仮予約申込送信
export async function submitAssistedBooking(request: AssistedBookingRequest): Promise<{
  success: boolean;
  requestId?: string;
  message: string;
}> {
  try {
    const response = await makeAPIRequest<{
      success: boolean;
      requestId: string;
      estimatedProcessingTime: string;
      message: string;
    }>('/api/medical/booking-request', 'POST', request);

    return {
      success: response.success,
      requestId: response.requestId,
      message: response.message || 'AI最適化処理を開始しました'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'システムエラーが発生しました'
    };
  }
}

// 2. 職員選択結果送信
export async function confirmChoice(choice: ChoiceConfirmation): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await makeAPIRequest<{
      success: boolean;
      message: string;
    }>('/api/medical/confirm-choice', 'POST', choice);

    return response;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '選択結果の送信に失敗しました'
    };
  }
}

// 3. 条件調整要求送信
export async function requestScheduleAdjustment(adjustment: AdjustmentRequest): Promise<{
  success: boolean;
  adjustmentId?: string;
  message: string;
}> {
  try {
    const response = await makeAPIRequest<{
      success: boolean;
      adjustmentId: string;
      message: string;
    }>('/api/medical/schedule-change', 'POST', adjustment);

    return response;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '調整要求の送信に失敗しました'
    };
  }
}

// ヘルスチェック
export async function checkMedicalSystemHealth(): Promise<boolean> {
  try {
    await makeAPIRequest<{ status: string }>('/api/health', 'GET');
    return true;
  } catch (error) {
    console.error('Medical system health check failed:', error);
    return false;
  }
}

// Token状態確認
export function getCurrentToken(): string {
  return currentToken;
}

// Token手動設定（開発・テスト用）
export function setToken(token: string): void {
  currentToken = token;
}