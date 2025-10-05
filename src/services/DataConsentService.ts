/**
 * データ分析同意管理サービス
 *
 * VoiceDrive活動データの職員カルテシステム連携における
 * 同意取得・管理機能を提供
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConsentStatus {
  userId: string;
  analyticsConsent: boolean;
  analyticsConsentDate: Date | null;
  personalFeedbackConsent: boolean;
  personalFeedbackConsentDate: Date | null;
  isRevoked: boolean;
  revokeDate: Date | null;
  dataDeletionRequested: boolean;
  dataDeletionRequestedAt: Date | null;
  dataDeletionCompletedAt: Date | null;
}

export interface ConsentUpdateData {
  analyticsConsent?: boolean;
  personalFeedbackConsent?: boolean;
}

export interface ConsentServiceResult {
  success: boolean;
  message: string;
  data?: ConsentStatus;
}

/**
 * データ分析同意管理サービス
 */
export class DataConsentService {
  private static instance: DataConsentService;

  private constructor() {}

  static getInstance(): DataConsentService {
    if (!this.instance) {
      this.instance = new DataConsentService();
    }
    return this.instance;
  }

  /**
   * ユーザーの同意状態を取得
   * @param userId ユーザーID
   * @returns 同意状態（未登録の場合はデフォルト値を返す）
   */
  async getConsentStatus(userId: string): Promise<ConsentStatus> {
    try {
      const consent = await prisma.dataConsent.findUnique({
        where: { userId }
      });

      if (!consent) {
        // 未登録の場合はデフォルト値を返す
        return {
          userId,
          analyticsConsent: false,
          analyticsConsentDate: null,
          personalFeedbackConsent: false,
          personalFeedbackConsentDate: null,
          isRevoked: false,
          revokeDate: null,
          dataDeletionRequested: false,
          dataDeletionRequestedAt: null,
          dataDeletionCompletedAt: null
        };
      }

      return {
        userId: consent.userId,
        analyticsConsent: consent.analyticsConsent,
        analyticsConsentDate: consent.analyticsConsentDate,
        personalFeedbackConsent: consent.personalFeedbackConsent,
        personalFeedbackConsentDate: consent.personalFeedbackConsentDate,
        isRevoked: !!consent.revokeDate,
        revokeDate: consent.revokeDate,
        dataDeletionRequested: consent.dataDeletionRequested,
        dataDeletionRequestedAt: consent.dataDeletionRequestedAt,
        dataDeletionCompletedAt: consent.dataDeletionCompletedAt
      };
    } catch (error) {
      console.error('[同意状態取得エラー]', error);
      throw new Error('同意状態の取得に失敗しました。');
    }
  }

  /**
   * 同意状態を保存・更新
   * @param userId ユーザーID
   * @param consentData 更新する同意情報
   * @returns 更新結果
   */
  async updateConsent(
    userId: string,
    consentData: ConsentUpdateData
  ): Promise<ConsentServiceResult> {
    try {
      const now = new Date();
      const updateData: any = {
        updatedAt: now
      };

      // Analytics同意が更新される場合
      if (consentData.analyticsConsent !== undefined) {
        updateData.analyticsConsent = consentData.analyticsConsent;
        if (consentData.analyticsConsent) {
          updateData.analyticsConsentDate = now;
          // 同意した場合は取り消しフラグをクリア
          updateData.revokeDate = null;
        }
      }

      // 個人フィードバック同意が更新される場合（Phase 2）
      if (consentData.personalFeedbackConsent !== undefined) {
        updateData.personalFeedbackConsent = consentData.personalFeedbackConsent;
        if (consentData.personalFeedbackConsent) {
          updateData.personalFeedbackConsentDate = now;
        }
      }

      // Upsert: 存在すれば更新、なければ作成
      const consent = await prisma.dataConsent.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          analyticsConsent: consentData.analyticsConsent ?? false,
          analyticsConsentDate: consentData.analyticsConsent ? now : null,
          personalFeedbackConsent: consentData.personalFeedbackConsent ?? false,
          personalFeedbackConsentDate: consentData.personalFeedbackConsent ? now : null
        }
      });

      const status = await this.getConsentStatus(userId);

      console.log(`[同意更新] ユーザー ${userId} の同意状態を更新しました:`, consentData);

      return {
        success: true,
        message: '同意状態を保存しました。',
        data: status
      };
    } catch (error) {
      console.error('[同意更新エラー]', error);
      return {
        success: false,
        message: '同意状態の保存に失敗しました。'
      };
    }
  }

  /**
   * 同意を取り消す
   * @param userId ユーザーID
   * @returns 取り消し結果
   */
  async revokeConsent(userId: string): Promise<ConsentServiceResult> {
    try {
      const now = new Date();

      const consent = await prisma.dataConsent.update({
        where: { userId },
        data: {
          analyticsConsent: false,
          personalFeedbackConsent: false,
          revokeDate: now,
          updatedAt: now
        }
      });

      const status = await this.getConsentStatus(userId);

      console.log(`[同意取り消し] ユーザー ${userId} が同意を取り消しました`);

      return {
        success: true,
        message: '同意を取り消しました。今後のデータは分析対象外となります。',
        data: status
      };
    } catch (error) {
      console.error('[同意取り消しエラー]', error);
      return {
        success: false,
        message: '同意の取り消しに失敗しました。'
      };
    }
  }

  /**
   * データ削除をリクエスト
   * @param userId ユーザーID
   * @returns リクエスト結果
   */
  async requestDataDeletion(userId: string): Promise<ConsentServiceResult> {
    try {
      const now = new Date();

      const consent = await prisma.dataConsent.update({
        where: { userId },
        data: {
          dataDeletionRequested: true,
          dataDeletionRequestedAt: now,
          updatedAt: now
        }
      });

      const status = await this.getConsentStatus(userId);

      console.log(`[データ削除リクエスト] ユーザー ${userId} がデータ削除をリクエストしました`);

      // TODO: 職員カルテシステムへの削除通知
      // await this.notifyStaffSystemForDeletion(userId);

      return {
        success: true,
        message: 'データ削除リクエストを受け付けました。処理完了まで数日かかる場合があります。',
        data: status
      };
    } catch (error) {
      console.error('[データ削除リクエストエラー]', error);
      return {
        success: false,
        message: 'データ削除リクエストの受付に失敗しました。'
      };
    }
  }

  /**
   * データ削除を完了としてマーク（管理者用）
   * @param userId ユーザーID
   * @returns 完了結果
   */
  async markDeletionCompleted(userId: string): Promise<ConsentServiceResult> {
    try {
      const now = new Date();

      const consent = await prisma.dataConsent.update({
        where: { userId },
        data: {
          dataDeletionCompletedAt: now,
          updatedAt: now
        }
      });

      const status = await this.getConsentStatus(userId);

      console.log(`[データ削除完了] ユーザー ${userId} のデータ削除が完了しました`);

      return {
        success: true,
        message: 'データ削除を完了しました。',
        data: status
      };
    } catch (error) {
      console.error('[データ削除完了エラー]', error);
      return {
        success: false,
        message: 'データ削除完了のマークに失敗しました。'
      };
    }
  }

  /**
   * 初回投稿かどうかをチェック（同意モーダル表示判定用）
   * @param userId ユーザーID
   * @returns true: 初回投稿（モーダル表示必要）, false: 既に同意済み or 拒否済み
   */
  async shouldShowConsentModal(userId: string): Promise<boolean> {
    try {
      const consent = await prisma.dataConsent.findUnique({
        where: { userId }
      });

      // レコードが存在しない = 初回投稿
      if (!consent) {
        return true;
      }

      // 同意日または取り消し日が存在する = 既に意思表示済み
      if (consent.analyticsConsentDate || consent.revokeDate) {
        return false;
      }

      // レコードは存在するが同意も拒否もしていない = モーダル表示
      return true;
    } catch (error) {
      console.error('[モーダル表示判定エラー]', error);
      // エラー時は安全側に倒してモーダルを表示
      return true;
    }
  }

  /**
   * 同意済みユーザーの一覧を取得（管理者用・統計用）
   * @returns 同意済みユーザー数
   */
  async getConsentStatistics(): Promise<{
    totalUsers: number;
    analyticsConsentCount: number;
    personalFeedbackConsentCount: number;
    revokedCount: number;
    deletionRequestedCount: number;
  }> {
    try {
      const total = await prisma.dataConsent.count();
      const analyticsConsent = await prisma.dataConsent.count({
        where: { analyticsConsent: true }
      });
      const personalFeedbackConsent = await prisma.dataConsent.count({
        where: { personalFeedbackConsent: true }
      });
      const revoked = await prisma.dataConsent.count({
        where: { revokeDate: { not: null } }
      });
      const deletionRequested = await prisma.dataConsent.count({
        where: { dataDeletionRequested: true, dataDeletionCompletedAt: null }
      });

      return {
        totalUsers: total,
        analyticsConsentCount: analyticsConsent,
        personalFeedbackConsentCount: personalFeedbackConsent,
        revokedCount: revoked,
        deletionRequestedCount: deletionRequested
      };
    } catch (error) {
      console.error('[統計取得エラー]', error);
      throw new Error('統計情報の取得に失敗しました。');
    }
  }

  /**
   * 職員カルテシステムへの削除通知（将来実装）
   * @param userId ユーザーID
   */
  private async notifyStaffSystemForDeletion(userId: string): Promise<void> {
    // TODO: 職員カルテシステムのAPIを呼び出してデータ削除を依頼
    console.log(`[職員カルテシステム通知] ユーザー ${userId} のデータ削除を通知予定`);
  }
}

// シングルトンインスタンスをエクスポート
export const dataConsentService = DataConsentService.getInstance();

// デフォルトエクスポート
export default dataConsentService;
