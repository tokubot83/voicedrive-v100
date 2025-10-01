/**
 * careerCourseService.ts
 * キャリア選択制度 API サービス
 *
 * 医療システムAPIとの連携を担当
 */

import { CareerCourseSelection, ChangeRequest, CourseDefinition, ChangeReason } from '../types/career-course';

const API_BASE_URL = process.env.NEXT_PUBLIC_MEDICAL_SYSTEM_API || 'http://localhost:3000';

/**
 * APIエラークラス
 */
export class CareerCourseAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'CareerCourseAPIError';
  }
}

/**
 * 認証トークンを取得
 */
const getAuthToken = (): string => {
  // TODO: 実際の認証トークン取得ロジックに置き換える
  // 現在はlocalStorageから取得（仮実装）
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || '';
  }
  return '';
};

/**
 * API リクエスト共通処理
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // エラーレスポンスの処理
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new CareerCourseAPIError(
        errorData.error || `HTTPエラー: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof CareerCourseAPIError) {
      throw error;
    }

    // ネットワークエラーなど
    throw new CareerCourseAPIError(
      'ネットワークエラーが発生しました。接続を確認してください。',
      undefined,
      error
    );
  }
}

/**
 * マイページデータ取得
 */
export async function getMyPageData(): Promise<{
  id: string;
  name: string;
  position: string;
  department: string;
  facility: string;
  employeeId: string;
  joinDate: string;
  careerCourse?: CareerCourseSelection;
}> {
  return apiRequest('/api/my-page');
}

/**
 * コース定義一覧取得
 */
export async function getCourseDefinitions(): Promise<CourseDefinition[]> {
  return apiRequest('/api/career-courses/definitions');
}

/**
 * コース変更申請送信
 */
export interface SubmitChangeRequestParams {
  currentCourseCode: string;
  requestedCourseCode: string;
  changeReason: ChangeReason;
  reasonDetail: string;
  requestedEffectiveDate: string;
  attachments?: string[];
}

export async function submitChangeRequest(
  params: SubmitChangeRequestParams
): Promise<{
  id: string;
  staffId: string;
  approvalStatus: string;
  createdAt: string;
  message: string;
}> {
  return apiRequest('/api/career-course/change-request', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * 申請履歴取得
 */
export async function getMyRequests(): Promise<ChangeRequest[]> {
  return apiRequest('/api/career-course/my-requests');
}

/**
 * 特例事由の選択肢
 */
export const SPECIAL_CHANGE_REASONS = [
  { value: 'special_pregnancy', label: '妊娠・出産', requiresAttachment: true },
  { value: 'special_caregiving', label: '介護', requiresAttachment: true },
  { value: 'special_illness', label: '疾病', requiresAttachment: true },
] as const;

/**
 * 変更事由のバリデーション
 */
export function validateChangeReason(
  changeReason: string,
  attachments: string[]
): { valid: boolean; error?: string } {
  // 特例事由の場合、添付ファイルが必須
  if (changeReason.startsWith('special_')) {
    if (!attachments || attachments.length === 0) {
      return {
        valid: false,
        error: '特例変更の場合は証明書類の添付が必要です',
      };
    }
  }

  return { valid: true };
}

/**
 * 次回変更可能日のチェック
 */
export function canChangeNow(nextChangeAvailableDate: string): boolean {
  const today = new Date();
  const nextDate = new Date(nextChangeAvailableDate);
  return today >= nextDate;
}

/**
 * 日付フォーマット（YYYY-MM-DD）
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 承認ステータスのラベル取得
 */
export function getApprovalStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: '審査中',
    approved: '承認済み',
    rejected: '却下',
    withdrawn: '取り下げ',
  };
  return statusLabels[status] || status;
}

/**
 * 承認ステータスの色取得（Tailwind CSS）
 */
export function getApprovalStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    withdrawn: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export default {
  getMyPageData,
  getCourseDefinitions,
  submitChangeRequest,
  getMyRequests,
  validateChangeReason,
  canChangeNow,
  formatDate,
  getApprovalStatusLabel,
  getApprovalStatusColor,
};
