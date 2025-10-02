// 面談結果受信サービス（医療システムからのデータ保存）
import prisma from '../../lib/prisma';

// 医療システムから受信する面談結果データ型
export interface InterviewResultData {
  requestId: string;              // VoiceDrive側の申込ID
  interviewId: string;            // 医療システム側の面談ID
  completedAt: Date;              // 面談実施日時
  duration: number;               // 実施時間（分）

  // 面談内容
  summary: string;                // 面談サマリ
  keyPoints: string[];            // 重要ポイント（配列）
  actionItems: Array<{            // アクションアイテム
    description: string;
    dueDate?: Date;
  }>;

  // フォローアップ情報
  followUpRequired: boolean;      // フォローアップ要否
  followUpDate?: Date;            // フォローアップ予定日

  // 職員フィードバック
  feedbackToEmployee: string;     // 職員向けフィードバック文

  // 次回推奨事項
  nextRecommendations: {
    suggestedNextInterview?: Date;
    suggestedTopics: string[];
  };
}

export class InterviewResultService {
  /**
   * 面談結果を受信・保存
   */
  static async receiveResult(data: InterviewResultData) {
    try {
      console.log('[InterviewResultService] Receiving interview result:', {
        requestId: data.requestId,
        interviewId: data.interviewId,
        completedAt: data.completedAt,
      });

      // 重複チェック（既に受信済みのデータは上書き）
      const existing = await prisma.interviewResult.findUnique({
        where: { interviewId: data.interviewId },
      });

      let result;
      if (existing) {
        console.log('[InterviewResultService] Updating existing record:', existing.id);
        result = await prisma.interviewResult.update({
          where: { interviewId: data.interviewId },
          data: {
            completedAt: new Date(data.completedAt),
            duration: data.duration,
            summary: data.summary,
            keyPoints: data.keyPoints,
            actionItems: data.actionItems,
            followUpRequired: data.followUpRequired,
            followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
            feedbackToEmployee: data.feedbackToEmployee,
            nextRecommendations: data.nextRecommendations,
            processedAt: new Date(),
            status: 'processed',
            errorMessage: null,
          },
        });
      } else {
        console.log('[InterviewResultService] Creating new record');
        result = await prisma.interviewResult.create({
          data: {
            requestId: data.requestId,
            interviewId: data.interviewId,
            completedAt: new Date(data.completedAt),
            duration: data.duration,
            summary: data.summary,
            keyPoints: data.keyPoints,
            actionItems: data.actionItems,
            followUpRequired: data.followUpRequired,
            followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
            feedbackToEmployee: data.feedbackToEmployee,
            nextRecommendations: data.nextRecommendations,
            status: 'received',
          },
        });
      }

      console.log('[InterviewResultService] Successfully saved:', result.id);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('[InterviewResultService] Failed to save interview result:', error);

      // エラー記録（可能な場合）
      try {
        if (data.interviewId) {
          const existing = await prisma.interviewResult.findUnique({
            where: { interviewId: data.interviewId },
          });

          if (existing) {
            await prisma.interviewResult.update({
              where: { interviewId: data.interviewId },
              data: {
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
              },
            });
          }
        }
      } catch (updateError) {
        console.error('[InterviewResultService] Failed to update error status:', updateError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save interview result',
      };
    }
  }

  /**
   * 面談結果をrequestIdで取得
   */
  static async getByRequestId(requestId: string) {
    try {
      const result = await prisma.interviewResult.findUnique({
        where: { requestId },
      });

      if (!result) {
        return {
          success: false,
          error: 'Interview result not found',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('[InterviewResultService] Failed to fetch interview result:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch interview result',
      };
    }
  }

  /**
   * 面談結果をinterviewIdで取得
   */
  static async getByInterviewId(interviewId: string) {
    try {
      const result = await prisma.interviewResult.findUnique({
        where: { interviewId },
      });

      if (!result) {
        return {
          success: false,
          error: 'Interview result not found',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('[InterviewResultService] Failed to fetch interview result:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch interview result',
      };
    }
  }

  /**
   * 面談結果リスト取得
   */
  static async list(filters?: {
    status?: string;
    followUpRequired?: boolean;
    limit?: number;
  }) {
    try {
      const results = await prisma.interviewResult.findMany({
        where: {
          ...(filters?.status && { status: filters.status }),
          ...(filters?.followUpRequired !== undefined && {
            followUpRequired: filters.followUpRequired,
          }),
        },
        orderBy: {
          receivedAt: 'desc',
        },
        take: filters?.limit || 100,
      });

      return {
        success: true,
        data: results,
        count: results.length,
      };
    } catch (error) {
      console.error('[InterviewResultService] Failed to fetch interview results:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch interview results',
        data: [],
      };
    }
  }

  /**
   * 統計情報取得
   */
  static async getStatistics() {
    try {
      const [total, received, processed, error, followUpCount] = await Promise.all([
        prisma.interviewResult.count(),
        prisma.interviewResult.count({ where: { status: 'received' } }),
        prisma.interviewResult.count({ where: { status: 'processed' } }),
        prisma.interviewResult.count({ where: { status: 'error' } }),
        prisma.interviewResult.count({ where: { followUpRequired: true } }),
      ]);

      return {
        success: true,
        data: {
          total,
          received,
          processed,
          error,
          followUpCount,
          processRate: total > 0 ? ((processed / total) * 100).toFixed(1) : '0',
        },
      };
    } catch (error) {
      console.error('[InterviewResultService] Failed to fetch statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }
}
