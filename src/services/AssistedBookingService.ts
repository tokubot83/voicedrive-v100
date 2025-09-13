import { ApiClient } from '../api/apiClient';

// おまかせ予約用の詳細リクエスト
export interface EnhancedInterviewRequest {
  // 基本情報
  staffId: string;
  requestType: 'regular' | 'special' | 'support';
  topic: string;
  details: string;
  category: string;

  // 時期希望
  urgencyLevel: 'urgent' | 'this_week' | 'next_week' | 'this_month';
  preferredDates?: string[];        // 最大3つ
  unavailableDates?: string[];      // 除外日

  // 時間帯希望
  timePreference: {
    morning: boolean;      // 9:00-12:00
    afternoon: boolean;    // 13:00-17:00
    evening: boolean;      // 17:30-19:00
    anytime: boolean;      // いつでも可
  };

  // 担当者希望
  interviewerPreference: {
    specificPerson?: string;
    genderPreference?: 'male' | 'female' | 'no_preference';
    specialtyPreference?: string;
    anyAvailable: boolean;
  };

  // その他
  minDuration: number;     // 最短時間（分）
  maxDuration: number;     // 最長時間（分）
  additionalRequests?: string;
}

// 職員向け簡素化された推薦結果
export interface StaffFriendlyRecommendation {
  id: string;
  candidate: {
    name: string;
    title: string;
    department: string;
    experience?: string;
    schedule: {
      date: string;
      time: string;
      duration: number;
      location: string;
      format?: 'face_to_face' | 'online';
    };
  };

  // 簡潔な推薦理由（技術用語なし）
  whyRecommended: {
    summary: string;  // 例: "あなたの相談内容に詳しい担当者です"
    points: string[]; // 例: ["同じ部署出身", "キャリア相談専門", "都合の良い時間"]
  };

  // 代替案
  alternatives?: {
    timeOptions?: string[];
    notes?: string;
  };
}

// おまかせ予約のステータス
export type AssistedBookingStatus =
  | 'pending_review'      // 人事部にて調整中
  | 'proposals_ready'     // 面談候補をご用意しました
  | 'awaiting_selection'  // あなたの選択をお待ちしています
  | 'confirmed'           // 予約確定
  | 'failed'              // 調整失敗
  | 'expired';            // 期限切れ

export interface AssistedBookingRequest {
  id: string;
  status: AssistedBookingStatus;
  requestDate: string;
  estimatedCompletion?: string;
  interviewType: string;
  urgencyLevel: string;
  lastUpdated: string;

  // 進捗情報
  progress: {
    current: number;
    total: number;
    labels: string[];
  };

  // アクション
  actions: {
    viewProposals?: boolean;
    contactHR?: boolean;
    canCancel?: boolean;
  };

  // 提案候補（準備完了時）
  proposals?: StaffFriendlyRecommendation[];
}

class AssistedBookingService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor() {
    this.apiClient = new ApiClient();
    // 医療システムのAPIエンドポイント
    this.baseUrl = process.env.REACT_APP_MEDICAL_SYSTEM_API || 'http://localhost:8080/api/v1';
  }

  // おまかせ予約申込送信
  async submitAssistedBookingRequest(
    request: EnhancedInterviewRequest
  ): Promise<{ requestId: string; estimatedTime: string; status: string }> {
    try {
      const response = await this.apiClient.post(`${this.baseUrl}/interview/assisted-booking`, {
        ...request,
        source: 'voicedrive',
        timestamp: new Date().toISOString()
      });

      return {
        requestId: response.data.requestId,
        estimatedTime: response.data.estimatedCompletionTime || '1時間以内',
        status: 'accepted'
      };
    } catch (error: any) {
      console.error('おまかせ予約申込エラー:', error);

      // エラー時は即時予約へのフォールバック提案
      throw new Error(
        error.response?.data?.message ||
        '申込の送信に失敗しました。即時予約をお試しください。'
      );
    }
  }

  // 調整中リクエストの取得
  async getPendingRequests(staffId: string): Promise<AssistedBookingRequest[]> {
    try {
      const response = await this.apiClient.get(
        `${this.baseUrl}/interview/pending-requests/${staffId}`
      );

      return response.data.map((req: any) => this.formatForStaffView(req));
    } catch (error) {
      console.error('調整中リクエスト取得エラー:', error);
      return [];
    }
  }

  // 提案候補取得
  async getBookingProposals(requestId: string): Promise<StaffFriendlyRecommendation[]> {
    try {
      const response = await this.apiClient.get(
        `${this.baseUrl}/interview/proposals/${requestId}`
      );

      // 職員向けに情報を簡素化
      return this.simplifyProposalsForStaff(response.data.proposals || []);
    } catch (error) {
      console.error('提案候補取得エラー:', error);
      throw new Error('提案候補の取得に失敗しました');
    }
  }

  // 最終選択送信
  async confirmBookingChoice(
    requestId: string,
    selectedProposalId: string,
    staffFeedback?: string
  ): Promise<any> {
    try {
      const response = await this.apiClient.post(`${this.baseUrl}/interview/confirm-choice`, {
        requestId,
        selectedProposalId,
        staffFeedback,
        confirmationSource: 'staff_selection',
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('選択確定エラー:', error);
      throw new Error('選択の確定に失敗しました');
    }
  }

  // おまかせ予約のキャンセル
  async cancelAssistedRequest(requestId: string, reason?: string): Promise<void> {
    try {
      await this.apiClient.post(`${this.baseUrl}/interview/cancel-assisted`, {
        requestId,
        reason,
        cancelledBy: 'staff',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('おまかせ予約キャンセルエラー:', error);
      throw new Error('キャンセルに失敗しました');
    }
  }

  // 職員向けの表示形式に変換
  private formatForStaffView(rawRequest: any): AssistedBookingRequest {
    const statusLabels = {
      'pending_review': '人事部にて調整中...',
      'proposals_ready': '面談候補をご用意しました！',
      'awaiting_selection': 'あなたの選択をお待ちしています',
      'confirmed': '予約が確定しました',
      'failed': '調整が困難でした',
      'expired': '選択期限が過ぎました'
    };

    return {
      id: rawRequest.id,
      status: rawRequest.status,
      requestDate: rawRequest.createdAt,
      estimatedCompletion: rawRequest.estimatedCompletion,
      interviewType: rawRequest.interviewType,
      urgencyLevel: rawRequest.urgencyLevel,
      lastUpdated: rawRequest.updatedAt,
      progress: this.calculateProgress(rawRequest.status),
      actions: this.determineAvailableActions(rawRequest.status),
      proposals: rawRequest.proposals ? this.simplifyProposalsForStaff(rawRequest.proposals) : undefined
    };
  }

  // 進捗計算
  private calculateProgress(status: AssistedBookingStatus) {
    const progressMap = {
      'pending_review': { current: 1, total: 3 },
      'proposals_ready': { current: 2, total: 3 },
      'awaiting_selection': { current: 2, total: 3 },
      'confirmed': { current: 3, total: 3 },
      'failed': { current: 1, total: 3 },
      'expired': { current: 2, total: 3 }
    };

    return {
      ...progressMap[status],
      labels: ['申込', '調整', '完了']
    };
  }

  // 利用可能なアクション決定
  private determineAvailableActions(status: AssistedBookingStatus) {
    return {
      viewProposals: status === 'proposals_ready' || status === 'awaiting_selection',
      contactHR: status === 'failed' || status === 'pending_review',
      canCancel: status === 'pending_review' || status === 'proposals_ready' || status === 'awaiting_selection'
    };
  }

  // 提案を職員向けに簡素化
  private simplifyProposalsForStaff(proposals: any[]): StaffFriendlyRecommendation[] {
    return proposals.map(proposal => ({
      id: proposal.id,
      candidate: {
        name: proposal.interviewer.name,
        title: proposal.interviewer.title,
        department: proposal.interviewer.department,
        experience: proposal.interviewer.experience,
        schedule: {
          date: proposal.schedule.date,
          time: proposal.schedule.time,
          duration: proposal.schedule.duration,
          location: proposal.schedule.location,
          format: proposal.schedule.format
        }
      },
      whyRecommended: {
        summary: this.generateSimpleSummary(proposal.aiReasoning?.matchingFactors || []),
        points: this.simplifyReasoningPoints(proposal.aiReasoning?.matchingFactors || [])
      },
      alternatives: proposal.aiReasoning?.alternativeOptions ? {
        timeOptions: proposal.aiReasoning.alternativeOptions,
        notes: proposal.aiReasoning.notes
      } : undefined
    }));
  }

  // AI理由を自然な日本語に変換
  private generateSimpleSummary(factors: string[]): string {
    if (factors.length === 0) return 'あなたの相談内容に適した担当者です';

    if (factors.some(f => f.includes('専門') || f.includes('expertise'))) {
      return 'あなたの相談内容に詳しい専門担当者です';
    }
    if (factors.some(f => f.includes('時間') || f.includes('schedule'))) {
      return 'ご希望の時間に対応可能な担当者です';
    }
    if (factors.some(f => f.includes('部署') || f.includes('department'))) {
      return 'あなたの職場環境をよく理解している担当者です';
    }

    return '総合的にあなたに適した担当者です';
  }

  // 理由を職員向けのポイントに変換
  private simplifyReasoningPoints(factors: string[]): string[] {
    return factors.map(factor => {
      // AI用語を職員向けの表現に変換
      if (factor.includes('専門') || factor.includes('expertise')) {
        return '相談内容の専門知識が豊富';
      }
      if (factor.includes('経験') || factor.includes('experience')) {
        return '豊富な面談経験あり';
      }
      if (factor.includes('時間') || factor.includes('schedule')) {
        return 'ご希望の時間に対応可能';
      }
      if (factor.includes('部署') || factor.includes('department')) {
        return '同じ職場環境の理解あり';
      }

      // そのまま使えそうな場合はそのまま返す
      return factor.length > 50 ? factor.substring(0, 47) + '...' : factor;
    }).slice(0, 4); // 最大4つまで
  }
}

export default AssistedBookingService;