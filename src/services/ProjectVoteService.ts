/**
 * ProjectVoteService
 * プロジェクト投票管理サービス
 */

import prisma from '../lib/prisma';

export type VoteOption =
  | 'strongly-support'
  | 'support'
  | 'neutral'
  | 'oppose'
  | 'strongly-oppose';

export interface ProjectVoteSummary {
  upvotes: number;
  downvotes: number;
  consensusLevel: number;
  totalVotes: number;
}

export class ProjectVoteService {
  /**
   * プロジェクト投票サマリを取得
   */
  static async getProjectVoteSummary(
    projectId: string
  ): Promise<ProjectVoteSummary> {
    const votes = await prisma.voteHistory.findMany({
      where: { projectId },
    });

    const upvotes = votes.filter(
      (v) => v.voteOption === 'strongly-support' || v.voteOption === 'support'
    ).length;

    const downvotes = votes.filter(
      (v) => v.voteOption === 'oppose' || v.voteOption === 'strongly-oppose'
    ).length;

    const totalVotes = votes.length;
    const consensusLevel =
      totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

    return {
      upvotes,
      downvotes,
      consensusLevel,
      totalVotes,
    };
  }

  /**
   * プロジェクトに投票
   */
  static async voteOnProject(
    projectId: string,
    userId: string,
    voteOption: VoteOption,
    voteWeight: number = 1.0
  ): Promise<void> {
    await prisma.voteHistory.upsert({
      where: {
        userId_projectId: { userId, projectId },
      },
      create: {
        userId,
        projectId,
        voteOption,
        voteWeight,
        votedAt: new Date(),
      },
      update: {
        voteOption,
        voteWeight,
        votedAt: new Date(),
      },
    });

    // ProjectSummaryを更新
    await this.updateProjectVoteSummary(projectId);
  }

  /**
   * ユーザーの投票を取得
   */
  static async getUserVote(
    projectId: string,
    userId: string
  ): Promise<string | null> {
    const vote = await prisma.voteHistory.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    return vote?.voteOption || null;
  }

  /**
   * ProjectSummaryの投票統計を更新
   */
  private static async updateProjectVoteSummary(
    projectId: string
  ): Promise<void> {
    const summary = await this.getProjectVoteSummary(projectId);

    await prisma.projectSummary.upsert({
      where: { projectId },
      create: {
        projectId,
        totalVotes: summary.totalVotes,
        upvotes: summary.upvotes,
        downvotes: summary.downvotes,
        consensusLevel: summary.consensusLevel,
        lastCalculatedAt: new Date(),
      },
      update: {
        totalVotes: summary.totalVotes,
        upvotes: summary.upvotes,
        downvotes: summary.downvotes,
        consensusLevel: summary.consensusLevel,
        lastCalculatedAt: new Date(),
      },
    });
  }
}
