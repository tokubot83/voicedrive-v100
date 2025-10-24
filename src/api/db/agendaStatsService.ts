/**
 * 議題統計サービス
 * AgendaDecision、AgendaImplementationテーブルを使用して議題モードの統計を計算
 */

import prisma from '../../lib/prisma';

export interface AgendaStats {
  // 議題提出関連
  submittedAgendas: number;          // 議題として提出された数
  adoptedAgendas: number;            // 委員会で採択された数
  rejectedAgendas: number;           // 委員会で却下された数
  pendingAgendas: number;            // 審議待ちの数

  // 実施状況
  implementingAgendas: number;       // 実施中の改善活動
  completedAgendas: number;          // 完了した改善活動
  pausedAgendas: number;             // 一時停止中の改善活動

  // 委員会別統計
  committeeBreakdown: {
    committeeType: string;
    committeeLevel: string;
    submittedCount: number;
    adoptedCount: number;
    adoptionRate: number;            // 採択率（%）
  }[];

  // スコア
  committeeScore: number;            // 委員会での貢献度スコア（0-100）
  adoptionRate: number;              // 全体採択率（%）
  implementationRate: number;        // 実施完了率（%）

  // 詳細メトリクス
  averageImplementationDays: number; // 平均実施日数
  totalImpactScore: number;          // 総インパクトスコア
}

export class AgendaStatsService {
  /**
   * ユーザーの議題統計を取得
   */
  static async getUserAgendaStats(userId: string): Promise<{
    success: boolean;
    data?: AgendaStats;
    error?: string;
  }> {
    try {
      // ユーザーの投稿を取得
      const userPosts = await prisma.post.findMany({
        where: { authorId: userId },
        select: { id: true }
      });

      const postIds = userPosts.map(p => p.id);

      if (postIds.length === 0) {
        // 投稿がない場合は0統計を返す
        return {
          success: true,
          data: this.getEmptyStats()
        };
      }

      // AgendaDecisionデータを取得
      const agendaDecisions = await prisma.agendaDecision.findMany({
        where: { postId: { in: postIds } },
        include: {
          implementations: true
        }
      });

      // 統計を計算
      const stats = this.calculateStats(agendaDecisions, postIds.length);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Failed to get agenda stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get agenda stats'
      };
    }
  }

  /**
   * 統計を計算
   */
  private static calculateStats(
    decisions: any[],
    totalPosts: number
  ): AgendaStats {
    // 提出された議題数（AgendaDecisionが存在するもの）
    const submittedAgendas = decisions.length;

    // 採択・却下・審議待ち
    const adoptedAgendas = decisions.filter(d => d.isAdopted === true).length;
    const rejectedAgendas = decisions.filter(d => d.isAdopted === false && d.decidedBy).length;
    const pendingAgendas = decisions.filter(d => !d.decidedBy).length;

    // 実施状況の集計
    const allImplementations = decisions.flatMap(d => d.implementations || []);
    const implementingAgendas = allImplementations.filter(i => i.status === 'in_progress').length;
    const completedAgendas = allImplementations.filter(i => i.status === 'completed').length;
    const pausedAgendas = allImplementations.filter(i => i.status === 'paused').length;

    // 委員会別統計
    const committeeBreakdown = this.calculateCommitteeBreakdown(decisions);

    // 採択率
    const adoptionRate = submittedAgendas > 0
      ? Math.round((adoptedAgendas / submittedAgendas) * 100)
      : 0;

    // 実施完了率
    const implementationRate = allImplementations.length > 0
      ? Math.round((completedAgendas / allImplementations.length) * 100)
      : 0;

    // 平均実施日数
    const averageImplementationDays = this.calculateAverageImplementationDays(allImplementations);

    // 委員会貢献度スコア（0-100）
    const committeeScore = this.calculateCommitteeScore({
      submittedAgendas,
      adoptedAgendas,
      completedAgendas,
      implementationRate,
      adoptionRate,
      totalPosts
    });

    // 総インパクトスコア（仮実装）
    const totalImpactScore = adoptedAgendas * 10 + completedAgendas * 15;

    return {
      submittedAgendas,
      adoptedAgendas,
      rejectedAgendas,
      pendingAgendas,
      implementingAgendas,
      completedAgendas,
      pausedAgendas,
      committeeBreakdown,
      committeeScore,
      adoptionRate,
      implementationRate,
      averageImplementationDays,
      totalImpactScore
    };
  }

  /**
   * 委員会別統計を計算
   */
  private static calculateCommitteeBreakdown(decisions: any[]): AgendaStats['committeeBreakdown'] {
    const breakdown = new Map<string, {
      committeeType: string;
      committeeLevel: string;
      submittedCount: number;
      adoptedCount: number;
    }>();

    for (const decision of decisions) {
      const key = `${decision.committeeType}_${decision.committeeLevel}`;

      if (!breakdown.has(key)) {
        breakdown.set(key, {
          committeeType: decision.committeeType,
          committeeLevel: decision.committeeLevel,
          submittedCount: 0,
          adoptedCount: 0
        });
      }

      const stats = breakdown.get(key)!;
      stats.submittedCount++;
      if (decision.isAdopted) {
        stats.adoptedCount++;
      }
    }

    return Array.from(breakdown.values()).map(stats => ({
      ...stats,
      adoptionRate: stats.submittedCount > 0
        ? Math.round((stats.adoptedCount / stats.submittedCount) * 100)
        : 0
    }));
  }

  /**
   * 平均実施日数を計算
   */
  private static calculateAverageImplementationDays(implementations: any[]): number {
    const completedImplementations = implementations.filter(
      i => i.status === 'completed' && i.actualStartDate && i.actualEndDate
    );

    if (completedImplementations.length === 0) return 0;

    const totalDays = completedImplementations.reduce((sum, impl) => {
      const start = new Date(impl.actualStartDate);
      const end = new Date(impl.actualEndDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / completedImplementations.length);
  }

  /**
   * 委員会貢献度スコアを計算（0-100）
   *
   * 計算ロジック：
   * - 議題提出数: 20点（最大5件で満点）
   * - 採択率: 30点
   * - 実施完了率: 30点
   * - 完了した改善活動数: 20点（最大5件で満点）
   */
  private static calculateCommitteeScore(params: {
    submittedAgendas: number;
    adoptedAgendas: number;
    completedAgendas: number;
    implementationRate: number;
    adoptionRate: number;
    totalPosts: number;
  }): number {
    const {
      submittedAgendas,
      adoptedAgendas,
      completedAgendas,
      implementationRate,
      adoptionRate
    } = params;

    // 議題提出数スコア（最大20点）
    const submissionScore = Math.min((submittedAgendas / 5) * 20, 20);

    // 採択率スコア（最大30点）
    const adoptionScore = (adoptionRate / 100) * 30;

    // 実施完了率スコア（最大30点）
    const implementationScore = (implementationRate / 100) * 30;

    // 完了した改善活動数スコア（最大20点）
    const completionScore = Math.min((completedAgendas / 5) * 20, 20);

    const totalScore = submissionScore + adoptionScore + implementationScore + completionScore;

    return Math.round(totalScore);
  }

  /**
   * 空の統計を返す
   */
  private static getEmptyStats(): AgendaStats {
    return {
      submittedAgendas: 0,
      adoptedAgendas: 0,
      rejectedAgendas: 0,
      pendingAgendas: 0,
      implementingAgendas: 0,
      completedAgendas: 0,
      pausedAgendas: 0,
      committeeBreakdown: [],
      committeeScore: 0,
      adoptionRate: 0,
      implementationRate: 0,
      averageImplementationDays: 0,
      totalImpactScore: 0
    };
  }

  /**
   * 部署全体の議題統計を取得（比較用）
   */
  static async getDepartmentAgendaStats(department: string): Promise<{
    success: boolean;
    data?: {
      averageCommitteeScore: number;
      averageAdoptionRate: number;
      averageImplementationRate: number;
      totalSubmittedAgendas: number;
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
            averageCommitteeScore: 0,
            averageAdoptionRate: 0,
            averageImplementationRate: 0,
            totalSubmittedAgendas: 0
          }
        };
      }

      // 各ユーザーの統計を取得
      const allStats = await Promise.all(
        userIds.map(userId => this.getUserAgendaStats(userId))
      );

      const validStats = allStats
        .filter(result => result.success && result.data)
        .map(result => result.data!);

      if (validStats.length === 0) {
        return {
          success: true,
          data: {
            averageCommitteeScore: 0,
            averageAdoptionRate: 0,
            averageImplementationRate: 0,
            totalSubmittedAgendas: 0
          }
        };
      }

      // 平均を計算
      const averageCommitteeScore = Math.round(
        validStats.reduce((sum, s) => sum + s.committeeScore, 0) / validStats.length
      );

      const averageAdoptionRate = Math.round(
        validStats.reduce((sum, s) => sum + s.adoptionRate, 0) / validStats.length
      );

      const averageImplementationRate = Math.round(
        validStats.reduce((sum, s) => sum + s.implementationRate, 0) / validStats.length
      );

      const totalSubmittedAgendas = validStats.reduce(
        (sum, s) => sum + s.submittedAgendas,
        0
      );

      return {
        success: true,
        data: {
          averageCommitteeScore,
          averageAdoptionRate,
          averageImplementationRate,
          totalSubmittedAgendas
        }
      };
    } catch (error) {
      console.error('Failed to get department agenda stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get department stats'
      };
    }
  }
}
