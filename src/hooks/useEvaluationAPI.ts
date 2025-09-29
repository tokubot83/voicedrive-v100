import { useState, useCallback } from 'react';
import { InterviewBookingService } from '../services/InterviewBookingService';
import AppealServiceV3 from '../services/appealServiceV3';
import { BookingRequest, InterviewType } from '../types/interview';
import { V3AppealRequest } from '../types/appeal-v3';

// サービスインスタンスの取得
const interviewBookingService = InterviewBookingService.getInstance();
const appealService = new AppealServiceV3();

interface FeedbackInterviewData {
  preferredDate: string;
  preferredTime: string;
  preferredDays: string[];
  preferredLocation: string;
  specificInterviewer: string;
  topics: string[];
  additionalNotes: string;
  evaluationId: string;
  evaluationPeriod: string;
  evaluationScore: number;
  evaluationGrade: string;
}

interface AppealData {
  appealReason: string;
  specificPoints: string[];
  evidenceDescription: string;
  desiredOutcome: string;
  supportingDocuments: File[];
  evaluationId: string;
  evaluationPeriod: string;
  evaluationScore: number;
  evaluationGrade: string;
}

export const useEvaluationAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フィードバック面談予約の送信
  const submitFeedbackInterview = useCallback(async (
    employeeId: string,
    data: FeedbackInterviewData
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // データを BookingRequest 形式に変換
      const preferredDates = [new Date(data.preferredDate)];

      // 希望曜日から次の該当日を計算
      const additionalDates = calculateDatesFromWeekdays(data.preferredDays, 4);
      preferredDates.push(...additionalDates);

      // 時間帯をマッピング
      const timeMapping: Record<string, string[]> = {
        'morning': ['09:00', '10:00', '11:00'],
        'afternoon': ['13:40', '14:20', '15:00'],
        'late_afternoon': ['15:40', '16:20', '17:00'],
        'flexible': ['09:00', '10:00', '11:00', '13:40', '14:20', '15:00', '15:40', '16:20']
      };

      const bookingRequest: BookingRequest = {
        employeeId,
        preferredDates,
        preferredTimes: timeMapping[data.preferredTime] || ['13:40'],
        interviewType: 'feedback' as InterviewType,
        interviewCategory: 'performance',
        requestedTopics: data.topics,
        description: `評価期間: ${data.evaluationPeriod}\n` +
                    `評価スコア: ${data.evaluationScore}点 (${data.evaluationGrade})\n` +
                    `${data.additionalNotes}`,
        urgencyLevel: 'medium',
        preferredInterviewer: data.specificInterviewer || undefined,
        preferredLocation: data.preferredLocation
      };

      // API呼び出し
      const response = await interviewBookingService.requestBooking(employeeId, bookingRequest);

      if (!response.success) {
        throw new Error(response.message || '予約に失敗しました');
      }

      return {
        success: true,
        bookingId: response.bookingId,
        message: response.message
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予約処理中にエラーが発生しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 異議申立の送信
  const submitAppeal = useCallback(async (
    employeeId: string,
    employeeName: string,
    data: AppealData
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // 理由カテゴリーのマッピング
      const categoryMapping: Record<string, string> = {
        'calculation_error': 'CALCULATION_ERROR',
        'missing_achievement': 'ACHIEVEMENT_OVERSIGHT',
        'unfair_comparison': 'CRITERIA_MISINTERPRETATION',
        'process_violation': 'CRITERIA_MISINTERPRETATION',
        'new_evidence': 'ACHIEVEMENT_OVERSIGHT',
        'discrimination': 'OTHER',
        'feedback_discrepancy': 'CRITERIA_MISINTERPRETATION',
        'other': 'OTHER'
      };

      // ファイルアップロード処理（実装簡略化）
      const evidenceUrls: string[] = [];
      if (data.supportingDocuments.length > 0) {
        // 実際の実装では、ファイルをサーバーにアップロードしてURLを取得
        console.log('ファイルアップロード:', data.supportingDocuments);
        // evidenceUrls = await uploadFiles(data.supportingDocuments);
      }

      // V3AppealRequest 形式に変換
      const appealRequest: V3AppealRequest = {
        employeeId,
        employeeName,
        evaluationPeriod: data.evaluationPeriod,
        evaluationPeriodId: data.evaluationId,
        appealCategory: categoryMapping[data.appealReason] || 'OTHER',
        appealReason: data.evidenceDescription,
        specificPoints: data.specificPoints,
        originalScore: data.evaluationScore,
        requestedScore: undefined, // 希望スコアは desiredOutcome から解析可能
        evidenceDocuments: evidenceUrls,
        desiredOutcome: data.desiredOutcome,
        preferredContactMethod: 'email',
        departmentId: undefined,
        jobCategory: undefined,
        urgencyLevel: 'high',
        acknowledgement: true
      };

      // 下書き保存
      appealService.saveDraft(appealRequest);

      // API呼び出し
      const response = await appealService.submitAppeal(appealRequest);

      if (!response.success) {
        throw new Error(response.message || '異議申立に失敗しました');
      }

      return {
        success: true,
        appealId: response.appealId,
        message: response.message,
        expectedResponseDate: response.expectedResponseDate
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '異議申立処理中にエラーが発生しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 面談予約のキャンセル
  const cancelInterview = useCallback(async (
    bookingId: string,
    reason: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewBookingService.cancelBooking(
        bookingId,
        'other',
        reason,
        'user' // 実際にはログインユーザーIDを使用
      );

      if (!response.success) {
        throw new Error(response.message || 'キャンセルに失敗しました');
      }

      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'キャンセル処理中にエラーが発生しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 面談予約の変更リクエスト
  const rescheduleInterview = useCallback(async (
    bookingId: string,
    preferredDates: Date[],
    reason: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewBookingService.requestReschedule(
        bookingId,
        preferredDates,
        reason,
        'user' // 実際にはログインユーザーIDを使用
      );

      if (!response.success) {
        throw new Error(response.message || '変更リクエストに失敗しました');
      }

      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '変更リクエスト処理中にエラーが発生しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 異議申立の状態確認
  const checkAppealStatus = useCallback(async (appealId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await appealService.getAppealStatus(appealId);
      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ステータス確認中にエラーが発生しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 異議申立の取り下げ
  const withdrawAppeal = useCallback(async (
    appealId: string,
    reason: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await appealService.withdrawAppeal(appealId, reason);

      if (!response.success) {
        throw new Error(response.message || '取り下げに失敗しました');
      }

      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '取り下げ処理中にエラーが発生しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    submitFeedbackInterview,
    submitAppeal,
    cancelInterview,
    rescheduleInterview,
    checkAppealStatus,
    withdrawAppeal
  };
};

// ユーティリティ関数：曜日から日付を計算
function calculateDatesFromWeekdays(weekdays: string[], weeks: number = 4): Date[] {
  const dates: Date[] = [];
  const dayMapping: Record<string, number> = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };

  const today = new Date();

  for (let w = 0; w < weeks; w++) {
    for (const day of weekdays) {
      const targetDay = dayMapping[day];
      if (targetDay !== undefined) {
        const date = new Date(today);
        date.setDate(today.getDate() + (7 * w) + ((targetDay - today.getDay() + 7) % 7));
        dates.push(date);
      }
    }
  }

  return dates;
}