/**
 * 投票統計サービス
 * VoteHistoryテーブルを使用してユーザーの投票履歴と傾向を分析
 */

import prisma from '../../lib/prisma';

export interface VoteStats {
  // 投票総数
  totalVotes: number;

  // 投票オプション別集計
  voteDistribution: {
    stronglySupport: number;    // 強く賛成
    support: number;            // 賛成
    neutral: number;            // 中立
    oppose: number;             // 反対
    stronglyOppose: number;     // 強く反対
  };

  // 投票傾向スコア（-100 ~ +100）
  // -100: 完全な反対派、0: 中立、+100: 完全な賛成派
  voteTendencyScore: number;

  // カテゴリ別投票数
  categoryBreakdown: {
    category: string;
    voteCount: number;
    averageTendency: number;
  }[];

  // 最近の投票（直近10件）
  recentVotes: {
    postId: string;
    voteOption: string;
    votedAt: string;
    postCategory: string | null;
    postType: string | null;
  }[];

  // 月別投票数（直近6ヶ月）
  monthlyVotes: {
    month: string;
    voteCount: number;
  }[];

  // 詳細メトリクス
  averageVoteWeight: number;     // 平均投票重み
  mostActiveCategory: string | null;  // 最も投票が多いカテゴリ
  votingFrequency: number;       // 投票頻度（票/日）
}

export class VoteStatsService {
  /**
   * ユーザーの投票統計を取得
   */
  static async getUserVoteStats(userId: string): Promise<{
    success: boolean;
    data?: VoteStats;
    error?: string;
  }> {
    try {
      // VoteHistoryから全投票履歴を取得
      const voteHistory = await prisma.voteHistory.findMany({
        where: { userId },
        orderBy: { votedAt: 'desc' },
        select: {
          id: true,
          postId: true,
          voteOption: true,
          voteWeight: true,
          votedAt: true,
          postCategory: true,
          postType: true,
        }
      });

      if (voteHistory.length === 0) {
        return {
          success: true,
          data: this.getEmptyStats()
        };
      }

      // 統計を計算
      const stats = this.calculateStats(voteHistory);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Failed to get vote stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get vote stats'
      };
    }
  }

  /**
   * 統計を計算
   */
  private static calculateStats(voteHistory: any[]): VoteStats {
    const totalVotes = voteHistory.length;

    // 投票オプション別集計
    const voteDistribution = {
      stronglySupport: this.countVoteOption(voteHistory, 'strongly-support'),
      support: this.countVoteOption(voteHistory, 'support'),
      neutral: this.countVoteOption(voteHistory, 'neutral'),
      oppose: this.countVoteOption(voteHistory, 'oppose'),
      stronglyOppose: this.countVoteOption(voteHistory, 'strongly-oppose'),
    };

    // 投票傾向スコアを計算（-100 ~ +100）
    const voteTendencyScore = this.calculateVoteTendencyScore(voteDistribution, totalVotes);

    // カテゴリ別投票数
    const categoryBreakdown = this.calculateCategoryBreakdown(voteHistory);

    // 最近の投票（直近10件）
    const recentVotes = voteHistory.slice(0, 10).map(vote => ({
      postId: vote.postId,
      voteOption: vote.voteOption,
      votedAt: vote.votedAt.toISOString(),
      postCategory: vote.postCategory,
      postType: vote.postType,
    }));

    // 月別投票数（直近6ヶ月）
    const monthlyVotes = this.calculateMonthlyVotes(voteHistory);

    // 平均投票重み
    const averageVoteWeight = voteHistory.reduce((sum, v) => sum + v.voteWeight, 0) / totalVotes;

    // 最も投票が多いカテゴリ
    const mostActiveCategory = categoryBreakdown.length > 0
      ? categoryBreakdown.sort((a, b) => b.voteCount - a.voteCount)[0].category
      : null;

    // 投票頻度（票/日）
    const votingFrequency = this.calculateVotingFrequency(voteHistory);

    return {
      totalVotes,
      voteDistribution,
      voteTendencyScore,
      categoryBreakdown,
      recentVotes,
      monthlyVotes,
      averageVoteWeight,
      mostActiveCategory,
      votingFrequency,
    };
  }

  /**
   * 特定のオプションの投票数をカウント
   */
  private static countVoteOption(voteHistory: any[], option: string): number {
    return voteHistory.filter(v => v.voteOption === option).length;
  }

  /**
   * 投票傾向スコアを計算（-100 ~ +100）
   *
   * スコア計算ロジック：
   * - 強く賛成: +2点
   * - 賛成: +1点
   * - 中立: 0点
   * - 反対: -1点
   * - 強く反対: -2点
   *
   * 総合スコア = (合計点 / 最大可能点) * 100
   */
  private static calculateVoteTendencyScore(
    distribution: VoteStats['voteDistribution'],
    totalVotes: number
  ): number {
    if (totalVotes === 0) return 0;

    const score =
      distribution.stronglySupport * 2 +
      distribution.support * 1 +
      distribution.neutral * 0 +
      distribution.oppose * (-1) +
      distribution.stronglyOppose * (-2);

    // 最大可能点は全て「強く賛成」の場合
    const maxScore = totalVotes * 2;

    return Math.round((score / maxScore) * 100);
  }

  /**
   * カテゴリ別投票数を計算
   */
  private static calculateCategoryBreakdown(voteHistory: any[]): VoteStats['categoryBreakdown'] {
    const categoryMap = new Map<string, { votes: any[], count: number }>();

    for (const vote of voteHistory) {
      const category = vote.postCategory || 'その他';

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { votes: [], count: 0 });
      }

      const stats = categoryMap.get(category)!;
      stats.votes.push(vote);
      stats.count++;
    }

    return Array.from(categoryMap.entries()).map(([category, stats]) => {
      // カテゴリごとの平均傾向を計算
      const categoryDistribution = {
        stronglySupport: this.countVoteOption(stats.votes, 'strongly-support'),
        support: this.countVoteOption(stats.votes, 'support'),
        neutral: this.countVoteOption(stats.votes, 'neutral'),
        oppose: this.countVoteOption(stats.votes, 'oppose'),
        stronglyOppose: this.countVoteOption(stats.votes, 'strongly-oppose'),
      };

      const averageTendency = this.calculateVoteTendencyScore(categoryDistribution, stats.count);

      return {
        category,
        voteCount: stats.count,
        averageTendency,
      };
    }).sort((a, b) => b.voteCount - a.voteCount);
  }

  /**
   * 月別投票数を計算（直近6ヶ月）
   */
  private static calculateMonthlyVotes(voteHistory: any[]): VoteStats['monthlyVotes'] {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyMap = new Map<string, number>();

    // 直近6ヶ月の月を初期化
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, 0);
    }

    // 投票を集計
    for (const vote of voteHistory) {
      const voteDate = new Date(vote.votedAt);
      if (voteDate >= sixMonthsAgo) {
        const monthKey = `${voteDate.getFullYear()}-${String(voteDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
      }
    }

    return Array.from(monthlyMap.entries())
      .map(([month, voteCount]) => ({ month, voteCount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 投票頻度を計算（票/日）
   */
  private static calculateVotingFrequency(voteHistory: any[]): number {
    if (voteHistory.length === 0) return 0;

    const firstVote = voteHistory[voteHistory.length - 1];
    const lastVote = voteHistory[0];

    const firstDate = new Date(firstVote.votedAt);
    const lastDate = new Date(lastVote.votedAt);

    const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return voteHistory.length; // 同じ日に全て投票

    return Math.round((voteHistory.length / daysDiff) * 10) / 10; // 小数点1桁
  }

  /**
   * 空の統計を返す
   */
  private static getEmptyStats(): VoteStats {
    return {
      totalVotes: 0,
      voteDistribution: {
        stronglySupport: 0,
        support: 0,
        neutral: 0,
        oppose: 0,
        stronglyOppose: 0,
      },
      voteTendencyScore: 0,
      categoryBreakdown: [],
      recentVotes: [],
      monthlyVotes: [],
      averageVoteWeight: 0,
      mostActiveCategory: null,
      votingFrequency: 0,
    };
  }

  /**
   * 投票傾向の説明テキストを取得
   */
  static getVoteTendencyLabel(score: number): string {
    if (score >= 70) return '積極的な賛成派';
    if (score >= 30) return '賛成派';
    if (score >= -30) return '中立派';
    if (score >= -70) return '反対派';
    return '積極的な反対派';
  }

  /**
   * 部署全体の投票傾向を取得（比較用）
   */
  static async getDepartmentVoteTendency(department: string): Promise<{
    success: boolean;
    data?: {
      averageTendencyScore: number;
      totalVotes: number;
      averageVotesPerUser: number;
    };
    error?: string;
  }> {
    try {
      // 部署のユーザーを取得
      const users = await prisma.user.findMany({
        where: { department },
        select: { id: true }
      });

      const userIds = users.map(u => u.id);

      if (userIds.length === 0) {
        return {
          success: true,
          data: {
            averageTendencyScore: 0,
            totalVotes: 0,
            averageVotesPerUser: 0,
          }
        };
      }

      // 各ユーザーの投票統計を取得
      const allStats = await Promise.all(
        userIds.map(userId => this.getUserVoteStats(userId))
      );

      const validStats = allStats
        .filter(result => result.success && result.data)
        .map(result => result.data!);

      if (validStats.length === 0) {
        return {
          success: true,
          data: {
            averageTendencyScore: 0,
            totalVotes: 0,
            averageVotesPerUser: 0,
          }
        };
      }

      const averageTendencyScore = Math.round(
        validStats.reduce((sum, s) => sum + s.voteTendencyScore, 0) / validStats.length
      );

      const totalVotes = validStats.reduce((sum, s) => sum + s.totalVotes, 0);

      const averageVotesPerUser = Math.round(totalVotes / validStats.length);

      return {
        success: true,
        data: {
          averageTendencyScore,
          totalVotes,
          averageVotesPerUser,
        }
      };
    } catch (error) {
      console.error('Failed to get department vote tendency:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get department stats'
      };
    }
  }
}
