import { PostVisibilityLevel } from '../types/visibility';
import { VotingPost } from '../types';
// Simple date utility functions (replacing date-fns)
const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const differenceInHours = (dateLeft: Date, dateRight: Date): number => {
  return Math.abs(dateLeft.getTime() - dateRight.getTime()) / (1000 * 60 * 60);
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

const nextMonday = (date: Date): Date => {
  const result = new Date(date);
  const daysUntilMonday = (8 - result.getDay()) % 7 || 7;
  result.setDate(result.getDate() + daysUntilMonday);
  return result;
};

const setHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(hours, 0, 0, 0);
  return result;
};

export interface VotingDeadlineConfig {
  postType: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  visibilityLevel: PostVisibilityLevel;
  seasonalAdjustment?: boolean;
}

export class VotingDeadlineService {
  private static instance: VotingDeadlineService;

  private constructor() {}

  public static getInstance(): VotingDeadlineService {
    if (!VotingDeadlineService.instance) {
      VotingDeadlineService.instance = new VotingDeadlineService();
    }
    return VotingDeadlineService.instance;
  }

  /**
   * 投票期限を計算
   */
  calculateVotingDeadline(config: VotingDeadlineConfig): Date {
    const now = new Date();
    let deadline: Date;

    // 1. 基本期限の設定（投稿タイプと緊急度による）
    const baseDeadline = this.getBaseDeadline(config.postType, config.urgencyLevel);
    
    // 2. 可視性レベルによる調整
    const visibilityAdjustedDeadline = this.adjustForVisibility(
      baseDeadline, 
      config.visibilityLevel
    );
    
    // 3. 営業時間考慮
    deadline = this.adjustForBusinessHours(now, visibilityAdjustedDeadline);
    
    // 4. 季節調整（繁忙期・閑散期）
    if (config.seasonalAdjustment) {
      deadline = this.adjustForSeason(deadline);
    }
    
    return deadline;
  }

  /**
   * 基本期限を取得（カテゴリ別）
   */
  private getBaseDeadline(postType: string, urgencyLevel: string): number {
    const deadlineMap: Record<string, Record<string, number>> = {
      // === 改善提案カテゴリ（医療・介護系法人向け） ===
      // 業務改善
      business_improvement: {
        low: 168,      // 7日（診療・介護業務の改善）
        medium: 72,    // 3日
        high: 24,      // 1日
        critical: 6    // 6時間（患者様への影響考慮）
      },
      // コミュニケーション
      communication: {
        low: 120,      // 5日（多職種連携・チーム改善）
        medium: 48,    // 2日
        high: 24,      // 1日
        critical: 4    // 4時間（緊急時対応）
      },
      // イノベーション
      innovation: {
        low: 336,      // 14日（新技術・制度改革は慎重に）
        medium: 168,   // 7日
        high: 72,      // 3日
        critical: 24   // 1日
      },
      // 戦略提案（管理職向け）
      strategic: {
        low: 504,      // 21日（組織運営・経営戦略は十分検討）
        medium: 336,   // 14日
        high: 168,     // 7日
        critical: 72   // 3日（緊急戦略でも慎重に）
      },
      
      // === 戦略提案カテゴリ（より慎重に） ===
      // 新規事業
      new_business: {
        low: 720,      // 30日（重大な経営判断）
        medium: 504,   // 21日
        high: 336,     // 14日
        critical: 168  // 7日
      },
      // 市場戦略
      market_strategy: {
        low: 504,      // 21日
        medium: 336,   // 14日
        high: 168,     // 7日
        critical: 72   // 3日
      },
      // 組織変革
      organizational_change: {
        low: 720,      // 30日（組織への影響大）
        medium: 504,   // 21日
        high: 336,     // 14日
        critical: 168  // 7日
      },
      // 長期計画
      long_term_planning: {
        low: 1080,     // 45日（長期的影響を熟考）
        medium: 720,   // 30日
        high: 504,     // 21日
        critical: 336  // 14日
      },
      
      // === コミュニケーション（人事関連）カテゴリ（より慎重に） ===
      // 採用・配置
      recruitment_placement: {
        low: 504,      // 21日（人の人生に関わる）
        medium: 336,   // 14日
        high: 168,     // 7日
        critical: 72   // 3日
      },
      // 評価・昇進
      evaluation_promotion: {
        low: 720,      // 30日（公平性を重視）
        medium: 504,   // 21日
        high: 336,     // 14日
        critical: 168  // 7日
      },
      // 福利厚生
      welfare_benefits: {
        low: 504,      // 21日（職員全体への影響）
        medium: 336,   // 14日
        high: 168,     // 7日
        critical: 72   // 3日
      },
      // 労務問題
      labor_issues: {
        low: 336,      // 14日（慎重な対応必要）
        medium: 168,   // 7日
        high: 72,      // 3日
        critical: 24   // 1日
      },
      // チームビルディング
      team_building: {
        low: 240,      // 10日
        medium: 120,   // 5日
        high: 72,      // 3日
        critical: 24   // 1日
      },
      
      // === フリースペースカテゴリ ===
      // アイデア共有
      idea_sharing: {
        low: 336,      // 14日（自由な議論を促進）
        medium: 168,   // 7日
        high: 72,      // 3日
        critical: 24   // 1日
      },
      // 雑談
      casual_discussion: {
        low: 168,      // 7日
        medium: 72,    // 3日
        high: 24,      // 1日
        critical: 12   // 12時間
      },
      // イベント企画
      event_planning: {
        low: 336,      // 14日（参加者調整のため）
        medium: 168,   // 7日
        high: 72,      // 3日
        critical: 24   // 1日
      },
      
      // === 緊急対応カテゴリ ===
      emergency: {
        low: 12,       // 12時間
        medium: 6,     // 6時間
        high: 3,       // 3時間
        critical: 1    // 1時間
      }
    };

    return deadlineMap[postType]?.[urgencyLevel] || 72; // デフォルト3日
  }

  /**
   * 可視性レベルによる期限調整
   */
  private adjustForVisibility(baseHours: number, visibilityLevel: PostVisibilityLevel): number {
    // 可視性が広いほど期限を延長（より多くの人の意見を集める必要があるため）
    const visibilityMultiplier: Record<PostVisibilityLevel, number> = {
      TEAM: 1.0,         // 基準
      DEPARTMENT: 1.2,   // 20%延長
      FACILITY: 1.5,     // 50%延長
      STRATEGIC: 1.8,    // 80%延長
      EXECUTIVE: 2.0,    // 100%延長
      CORPORATE: 2.5     // 150%延長
    };

    return Math.ceil(baseHours * (visibilityMultiplier[visibilityLevel] || 1.0));
  }

  /**
   * 営業時間を考慮した期限調整
   */
  private adjustForBusinessHours(startDate: Date, hours: number): Date {
    let deadline = addHours(startDate, hours);
    
    // 短期限（24時間以内）の場合は営業時間を考慮しない
    if (hours <= 24) {
      return deadline;
    }

    // 週末をスキップ
    if (isWeekend(deadline)) {
      deadline = nextMonday(deadline);
      deadline = setHours(deadline, 9); // 月曜9時に設定
    }

    // 営業時間外の調整（17時以降は翌朝9時に）
    const deadlineHour = deadline.getHours();
    if (deadlineHour >= 17 || deadlineHour < 9) {
      if (deadlineHour >= 17) {
        deadline = addDays(deadline, 1);
      }
      deadline = setHours(deadline, 9);
      deadline.setMinutes(0);
      deadline.setSeconds(0);
    }

    return deadline;
  }

  /**
   * 季節による期限調整
   */
  private adjustForSeason(deadline: Date): Date {
    const month = deadline.getMonth();
    
    // 繁忙期（3月末、9月末、12月）
    const busyMonths = [2, 8, 11]; // 0-indexed
    if (busyMonths.includes(month)) {
      // 繁忙期は期限を短縮（迅速な意思決定が必要）
      return addHours(deadline, -Math.ceil(differenceInHours(deadline, new Date()) * 0.2));
    }
    
    // 閑散期（8月、年末年始）
    const quietMonths = [7]; // August
    if (quietMonths.includes(month) || (month === 11 && deadline.getDate() > 25)) {
      // 閑散期は期限を延長（参加者が少ない可能性）
      return addHours(deadline, Math.ceil(differenceInHours(deadline, new Date()) * 0.3));
    }
    
    return deadline;
  }

  /**
   * 動的期限延長の判定
   */
  shouldExtendDeadline(post: VotingPost): { extend: boolean; reason?: string; newDeadline?: Date } {
    const now = new Date();
    const deadline = new Date(post.votingDeadline);
    const totalVoters = post.eligibleVoters || 100; // デフォルト値
    const currentVotes = post.voteBreakdown.agree + post.voteBreakdown.disagree + post.voteBreakdown.hold;
    const participationRate = currentVotes / totalVoters;
    const hoursRemaining = differenceInHours(deadline, now);

    // 1. 参加率が低い場合の自動延長
    if (hoursRemaining <= 24 && participationRate < 0.3) {
      return {
        extend: true,
        reason: '参加率が30%未満のため、期限を48時間延長します',
        newDeadline: addHours(deadline, 48)
      };
    }

    // 2. 議論が活発な場合の延長
    if (hoursRemaining <= 12 && this.isActiveDiscussion(post)) {
      return {
        extend: true,
        reason: '活発な議論が続いているため、期限を24時間延長します',
        newDeadline: addHours(deadline, 24)
      };
    }

    // 3. 賛否が拮抗している場合
    if (hoursRemaining <= 6 && this.isCloseVote(post)) {
      return {
        extend: true,
        reason: '賛否が拮抗しているため、期限を12時間延長します',
        newDeadline: addHours(deadline, 12)
      };
    }

    return { extend: false };
  }

  /**
   * 活発な議論かどうかを判定
   */
  private isActiveDiscussion(post: VotingPost): boolean {
    // 実装例：最近のコメント数やエンゲージメント率で判定
    // ここでは簡略化
    return false;
  }

  /**
   * 賛否が拮抗しているかを判定
   */
  private isCloseVote(post: VotingPost): boolean {
    const { agree, disagree } = post.voteBreakdown;
    const total = agree + disagree;
    if (total === 0) return false;
    
    const agreeRate = agree / total;
    return agreeRate >= 0.45 && agreeRate <= 0.55; // 45-55%の範囲
  }

  /**
   * リマインダー送信タイミングを計算
   */
  getReminderSchedule(deadline: Date): Date[] {
    const now = new Date();
    const totalHours = differenceInHours(deadline, now);
    const reminders: Date[] = [];

    if (totalHours > 168) { // 1週間以上
      reminders.push(addHours(deadline, -168)); // 1週間前
      reminders.push(addHours(deadline, -72));  // 3日前
      reminders.push(addHours(deadline, -24));  // 1日前
      reminders.push(addHours(deadline, -2));   // 2時間前
    } else if (totalHours > 72) { // 3日以上
      reminders.push(addHours(deadline, -72));  // 3日前
      reminders.push(addHours(deadline, -24));  // 1日前
      reminders.push(addHours(deadline, -2));   // 2時間前
    } else if (totalHours > 24) { // 1日以上
      reminders.push(addHours(deadline, -24));  // 1日前
      reminders.push(addHours(deadline, -6));   // 6時間前
      reminders.push(addHours(deadline, -1));   // 1時間前
    } else { // 24時間未満
      reminders.push(addHours(deadline, -Math.floor(totalHours / 2))); // 半分の時点
      reminders.push(addHours(deadline, -1));   // 1時間前
    }

    // 過去の時刻を除外
    return reminders.filter(date => date > now);
  }
}