/**
 * ProjectDetailService
 * プロジェクト詳細情報を統合して取得するサービス
 */

import prisma from '../lib/prisma';
import { ProjectVoteService } from './ProjectVoteService';

export interface ProjectDetailAuthor {
  name: string;
  department: string;
  avatar?: string;
}

export interface ProjectApprovalStep {
  id: string;
  title: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: Date;
  comments?: string;
}

export interface ProjectApprovalFlow {
  currentStep: number;
  totalSteps: number;
  steps: ProjectApprovalStep[];
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'invited' | 'accepted' | 'declined';
}

export interface ProjectTimeline {
  votingDeadline: Date;
  projectStart?: Date;
  projectEnd?: Date;
}

export interface ProjectDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  createdAt: Date;
  author: ProjectDetailAuthor;
  consensusLevel: number;
  upvotes: number;
  downvotes: number;
  approvalFlow: ProjectApprovalFlow;
  selectedMembers: ProjectTeamMember[];
  timeline: ProjectTimeline;
}

export class ProjectDetailService {
  /**
   * プロジェクト詳細情報を取得（統合版）
   */
  static async getProjectDetail(projectId: string): Promise<ProjectDetail> {
    // 1. プロジェクト基本情報を取得
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        proposer: {
          select: {
            name: true,
            department: true,
            avatar: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // 2. 承認フロー取得
    const approvalFlow = await this.getProjectApprovalFlow(projectId);

    // 3. チームメンバー取得
    const teamMembers = await this.getProjectTeamMembers(projectId);

    // 4. 投票サマリ取得
    const voteSummary = await ProjectVoteService.getProjectVoteSummary(
      projectId
    );

    // 5. タイムライン情報
    const timeline: ProjectTimeline = {
      votingDeadline:
        project.votingDeadline ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // デフォルト: 7日後
      projectStart: project.startedAt || undefined,
      projectEnd: project.completedAt || undefined,
    };

    return {
      id: project.id,
      title: project.title,
      content: project.description,
      category: project.category,
      status: project.status as ProjectDetail['status'],
      createdAt: project.createdAt,
      author: {
        name: project.proposer.name,
        department: project.proposer.department || '未設定',
        avatar: project.proposer.avatar || undefined,
      },
      consensusLevel: voteSummary.consensusLevel,
      upvotes: voteSummary.upvotes,
      downvotes: voteSummary.downvotes,
      approvalFlow,
      selectedMembers: teamMembers,
      timeline,
    };
  }

  /**
   * プロジェクト承認フロー取得
   */
  private static async getProjectApprovalFlow(
    projectId: string
  ): Promise<ProjectApprovalFlow> {
    const approvals = await prisma.projectApproval.findMany({
      where: { projectId },
      include: {
        approver: {
          select: { name: true, department: true },
        },
      },
      orderBy: { approvalLevel: 'asc' },
    });

    if (approvals.length === 0) {
      return {
        currentStep: 0,
        totalSteps: 0,
        steps: [],
      };
    }

    const currentStepIndex = approvals.findIndex(
      (a) => a.status === 'pending'
    );
    const currentStep =
      currentStepIndex >= 0 ? currentStepIndex + 1 : approvals.length;

    return {
      currentStep,
      totalSteps: approvals.length,
      steps: approvals.map((a) => ({
        id: a.id,
        title: `Level ${a.approvalLevel} 承認`,
        approver: a.approver.name,
        status: a.status as ProjectApprovalStep['status'],
        approvedAt: a.approvedAt || undefined,
        comments: a.comments || undefined,
      })),
    };
  }

  /**
   * プロジェクトチームメンバー取得
   */
  private static async getProjectTeamMembers(
    projectId: string
  ): Promise<ProjectTeamMember[]> {
    const members = await prisma.projectTeamMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      department: m.user.department || '未設定',
      role: m.role,
      status: m.status as ProjectTeamMember['status'],
    }));
  }
}
