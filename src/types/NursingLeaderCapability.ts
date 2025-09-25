/**
 * 看護職リーダー業務能力インターフェース
 * 医療チームとの協議により確定（2025/09/26）
 *
 * リーダー業務とは実際の医療現場での業務遂行能力を指す：
 * - 日勤リーダー：病棟全体の患者状況把握、医師回診同行、他部署調整
 * - 夜勤リーダー：夜間の病棟管理責任、医師への報告・相談判断
 */
export interface NursingLeaderCapability {
  staffId: string;
  canPerformLeaderDuty: boolean;
  certificationDate: Date;        // 初回認定日
  lastReviewDate: Date;           // 最終確認日（年次）
  temporaryRestriction?: {        // 例外的な制限のみ管理
    active: boolean;
    reason: string;
    until?: Date;
  };
}

/**
 * リーダー業務能力の有効性を判定
 */
export function isLeaderCapabilityActive(capability: NursingLeaderCapability): boolean {
  if (!capability.canPerformLeaderDuty) {
    return false;
  }

  if (capability.temporaryRestriction?.active) {
    if (capability.temporaryRestriction.until) {
      const now = new Date();
      if (now > capability.temporaryRestriction.until) {
        return true;
      }
    }
    return false;
  }

  return true;
}

/**
 * 年次レビューが必要かどうかを判定
 */
export function needsAnnualReview(capability: NursingLeaderCapability): boolean {
  const now = new Date();
  const lastReview = new Date(capability.lastReviewDate);
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  return lastReview < oneYearAgo;
}