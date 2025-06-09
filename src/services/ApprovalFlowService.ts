// Hierarchical Approval Flow Service

import {
  ApprovalFlowConfig,
  ApprovalRequest,
  ApprovalNode,
  AuthorityActionResult
} from '../types/authority';
import { HierarchicalUser } from '../types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { AuthorityManagementService } from './AuthorityManagementService';
import { v4 as uuidv4 } from 'uuid';

export class ApprovalFlowService {
  private static instance: ApprovalFlowService;
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private authorityService: AuthorityManagementService;

  // Budget tier configurations with auto-approval and manual approval thresholds
  private readonly APPROVAL_TIERS: ApprovalFlowConfig[] = [
    {
      budgetTier: { min: 0, max: 500000 },
      requiredApprovers: [
        { level: PermissionLevel.LEVEL_3, role: 'Department Head', mandatory: true }
      ],
      escalationThreshold: 48,
      deadlineHours: 72
    },
    {
      budgetTier: { min: 500001, max: 2000000 },
      requiredApprovers: [
        { level: PermissionLevel.LEVEL_3, role: 'Department Head', mandatory: true },
        { level: PermissionLevel.LEVEL_4, role: 'Facility Head', mandatory: true }
      ],
      escalationThreshold: 48,
      deadlineHours: 72
    },
    {
      budgetTier: { min: 2000001, max: 5000000 },
      requiredApprovers: [
        { level: PermissionLevel.LEVEL_4, role: 'Facility Head', mandatory: true },
        { level: PermissionLevel.LEVEL_5, role: 'HR Department Head', mandatory: true }
      ],
      escalationThreshold: 36,
      deadlineHours: 72
    },
    {
      budgetTier: { min: 5000001, max: 10000000 },
      requiredApprovers: [
        { level: PermissionLevel.LEVEL_5, role: 'HR Department Head', mandatory: true },
        { level: PermissionLevel.LEVEL_6, role: 'HR Director', mandatory: true }
      ],
      escalationThreshold: 24,
      deadlineHours: 72
    },
    {
      budgetTier: { min: 10000001, max: 20000000 },
      requiredApprovers: [
        { level: PermissionLevel.LEVEL_6, role: 'HR Director', mandatory: true },
        { level: PermissionLevel.LEVEL_7, role: 'Executive Secretary', mandatory: true }
      ],
      escalationThreshold: 12,
      deadlineHours: 72
    },
    {
      budgetTier: { min: 20000001, max: Number.MAX_SAFE_INTEGER },
      requiredApprovers: [
        { level: PermissionLevel.LEVEL_7, role: 'Executive Secretary', mandatory: true },
        { level: PermissionLevel.LEVEL_8, role: 'Chairman', mandatory: true }
      ],
      escalationThreshold: 12,
      deadlineHours: 72
    }
  ];

  private constructor() {
    this.authorityService = AuthorityManagementService.getInstance();
    this.startEscalationMonitor();
  }

  static getInstance(): ApprovalFlowService {
    if (!ApprovalFlowService.instance) {
      ApprovalFlowService.instance = new ApprovalFlowService();
    }
    return ApprovalFlowService.instance;
  }

  // Create approval request
  async createApprovalRequest(
    requester: HierarchicalUser,
    projectId: string,
    budgetAmount: number,
    reason: string
  ): Promise<AuthorityActionResult> {
    // Get appropriate approval flow config
    const flowConfig = this.getApprovalFlowConfig(budgetAmount);
    if (!flowConfig) {
      return {
        success: false,
        actionId: '',
        message: 'No approval flow configured for this budget amount',
        auditLogId: ''
      };
    }

    // Build approval chain
    const approvalChain = await this.buildApprovalChain(requester, flowConfig);
    if (approvalChain.length === 0) {
      return {
        success: false,
        actionId: '',
        message: 'Unable to build approval chain',
        auditLogId: ''
      };
    }

    // Create approval request
    const request: ApprovalRequest = {
      id: uuidv4(),
      projectId,
      requesterId: requester.id,
      budgetAmount,
      currentApproverId: approvalChain[0].approverId,
      approvalChain,
      status: 'pending',
      reason,
      createdAt: new Date(),
      deadline: new Date(Date.now() + flowConfig.deadlineHours * 60 * 60 * 1000)
    };

    this.approvalRequests.set(request.id, request);

    // Record in authority management
    const result = await this.authorityService.executeAuthorityAction(
      requester,
      'BUDGET_APPROVAL',
      {
        resourceType: 'approval_request',
        resourceId: request.id,
        projectId,
        budgetAmount,
        approvalChain: approvalChain.map(node => ({
          approverId: node.approverId,
          level: node.level,
          role: node.role
        }))
      },
      reason
    );

    // Send notification to first approver
    await this.notifyApprover(approvalChain[0].approverId, request);

    return {
      ...result,
      actionId: request.id,
      message: `Approval request created. Budget: ¥${budgetAmount.toLocaleString()}`
    };
  }

  // Process approval decision
  async processApproval(
    approver: HierarchicalUser,
    requestId: string,
    decision: 'approved' | 'rejected',
    reason: string
  ): Promise<AuthorityActionResult> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      return {
        success: false,
        actionId: '',
        message: 'Approval request not found',
        auditLogId: ''
      };
    }

    // Verify approver is current
    if (request.currentApproverId !== approver.id) {
      return {
        success: false,
        actionId: '',
        message: 'You are not the current approver for this request',
        auditLogId: ''
      };
    }

    // Check if approver has sufficient budget authority
    const hasAuthority = await this.authorityService.checkAuthority(
      approver,
      'BUDGET_APPROVAL',
      { budgetAmount: request.budgetAmount }
    );

    if (!hasAuthority) {
      return {
        success: false,
        actionId: '',
        message: 'Insufficient budget approval authority',
        auditLogId: ''
      };
    }

    // Find current node in approval chain
    const currentNodeIndex = request.approvalChain.findIndex(
      node => node.approverId === approver.id && node.status === 'pending'
    );

    if (currentNodeIndex === -1) {
      return {
        success: false,
        actionId: '',
        message: 'Invalid approval state',
        auditLogId: ''
      };
    }

    // Update approval node
    const currentNode = request.approvalChain[currentNodeIndex];
    currentNode.status = decision;
    currentNode.decision = decision;
    currentNode.reason = reason;
    currentNode.decidedAt = new Date();

    if (decision === 'rejected') {
      // Request rejected, update status
      request.status = 'rejected';
      request.completedAt = new Date();
    } else {
      // Check if more approvals needed
      const nextPendingIndex = request.approvalChain.findIndex(
        (node, index) => index > currentNodeIndex && node.status === 'pending'
      );

      if (nextPendingIndex !== -1) {
        // Move to next approver
        request.currentApproverId = request.approvalChain[nextPendingIndex].approverId;
        await this.notifyApprover(request.currentApproverId, request);
      } else {
        // All approvals complete
        request.status = 'approved';
        request.completedAt = new Date();
      }
    }

    // Record in authority management
    const result = await this.authorityService.executeAuthorityAction(
      approver,
      'BUDGET_APPROVAL',
      {
        resourceType: 'approval_decision',
        resourceId: request.id,
        decision,
        budgetAmount: request.budgetAmount,
        previousState: { status: 'pending' },
        newState: { status: request.status }
      },
      reason
    );

    return {
      ...result,
      actionId: request.id,
      message: `Approval ${decision}. ${request.status === 'approved' ? 'All approvals complete.' : ''}`
    };
  }

  // Auto-escalate overdue approvals
  private async escalateApproval(request: ApprovalRequest): Promise<void> {
    if (request.status !== 'pending' || request.escalatedAt) return;

    const flowConfig = this.getApprovalFlowConfig(request.budgetAmount);
    if (!flowConfig) return;

    const currentNode = request.approvalChain.find(
      node => node.approverId === request.currentApproverId
    );
    if (!currentNode) return;

    const hoursElapsed = (Date.now() - request.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed < flowConfig.escalationThreshold) return;

    // Find next level approver
    const nextLevelApprover = await this.findNextLevelApprover(currentNode.level);
    if (!nextLevelApprover) return;

    // Skip current approver
    currentNode.status = 'skipped';
    currentNode.decidedAt = new Date();
    currentNode.reason = 'Auto-escalated due to timeout';

    // Add escalation approver
    const escalationNode: ApprovalNode = {
      approverId: nextLevelApprover.id,
      level: nextLevelApprover.permissionLevel,
      role: nextLevelApprover.role,
      status: 'pending'
    };

    request.approvalChain.push(escalationNode);
    request.currentApproverId = nextLevelApprover.id;
    request.escalatedAt = new Date();
    request.status = 'escalated';

    // Notify escalation approver
    await this.notifyApprover(nextLevelApprover.id, request, true);

    console.log(`Approval ${request.id} escalated to ${nextLevelApprover.name}`);
  }

  // Monitor for escalations
  private startEscalationMonitor(): void {
    setInterval(() => {
      this.approvalRequests.forEach(request => {
        if (request.status === 'pending' && !request.escalatedAt) {
          this.escalateApproval(request);
        }
      });
    }, 60 * 60 * 1000); // Check every hour
  }

  // Build approval chain based on configuration
  private async buildApprovalChain(
    requester: HierarchicalUser,
    config: ApprovalFlowConfig
  ): Promise<ApprovalNode[]> {
    const chain: ApprovalNode[] = [];

    for (const approverConfig of config.requiredApprovers) {
      const approver = await this.findApprover(requester, approverConfig.level);
      if (approver) {
        chain.push({
          approverId: approver.id,
          level: approver.permissionLevel,
          role: approver.role,
          status: 'pending'
        });
      }
    }

    return chain;
  }

  // Find appropriate approver
  private async findApprover(
    requester: HierarchicalUser,
    requiredLevel: PermissionLevel
  ): Promise<HierarchicalUser | null> {
    // In production, this would traverse organizational hierarchy
    // For now, return mock approver based on level
    const mockApprovers: Record<PermissionLevel, HierarchicalUser> = {
      [PermissionLevel.LEVEL_2]: {
        id: 'chief_001',
        name: 'Chief Tanaka',
        department: 'Operations',
        role: 'Chief',
        accountType: 'SUPERVISOR',
        permissionLevel: PermissionLevel.LEVEL_2,
        budgetApprovalLimit: 100000
      },
      [PermissionLevel.LEVEL_3]: {
        id: 'manager_001',
        name: 'Manager Suzuki',
        department: 'Operations',
        role: 'Manager',
        accountType: 'DEPARTMENT_HEAD',
        permissionLevel: PermissionLevel.LEVEL_3,
        budgetApprovalLimit: 500000
      },
      [PermissionLevel.LEVEL_4]: {
        id: 'section_chief_001',
        name: 'Section Chief Sato',
        department: 'Operations',
        role: 'Section Chief',
        accountType: 'FACILITY_HEAD',
        permissionLevel: PermissionLevel.LEVEL_4,
        budgetApprovalLimit: 2000000
      },
      [PermissionLevel.LEVEL_5]: {
        id: 'hr_dept_head_001',
        name: 'HR Head Yamamoto',
        department: 'Human Resources',
        role: 'HR Department Head',
        accountType: 'HR_DEPARTMENT_HEAD',
        permissionLevel: PermissionLevel.LEVEL_5,
        budgetApprovalLimit: 5000000
      },
      [PermissionLevel.LEVEL_6]: {
        id: 'hr_gm_001',
        name: 'HR GM Takahashi',
        department: 'Human Resources',
        role: 'HR General Manager',
        accountType: 'HR_DIRECTOR',
        permissionLevel: PermissionLevel.LEVEL_6,
        budgetApprovalLimit: 10000000
      },
      [PermissionLevel.LEVEL_7]: {
        id: 'director_001',
        name: 'Director Watanabe',
        department: 'Executive',
        role: 'Director',
        accountType: 'EXECUTIVE_SECRETARY',
        permissionLevel: PermissionLevel.LEVEL_7,
        budgetApprovalLimit: 20000000
      },
      [PermissionLevel.LEVEL_8]: {
        id: 'executive_001',
        name: 'Executive Ito',
        department: 'Executive',
        role: 'Executive',
        accountType: 'CHAIRMAN',
        permissionLevel: PermissionLevel.LEVEL_8,
        budgetApprovalLimit: undefined
      }
    } as any;

    return mockApprovers[requiredLevel] || null;
  }

  private async findNextLevelApprover(currentLevel: PermissionLevel): Promise<HierarchicalUser | null> {
    const nextLevel = currentLevel + 1;
    if (nextLevel > PermissionLevel.LEVEL_8) return null;
    
    return this.findApprover({} as HierarchicalUser, nextLevel);
  }

  // Get approval flow configuration
  private getApprovalFlowConfig(budgetAmount: number): ApprovalFlowConfig | null {
    return this.APPROVAL_TIERS.find(tier => 
      budgetAmount >= tier.budgetTier.min && budgetAmount <= tier.budgetTier.max
    ) || null;
  }

  // Send notification to approver
  private async notifyApprover(
    approverId: string, 
    request: ApprovalRequest,
    isEscalation: boolean = false
  ): Promise<void> {
    // In production, this would send actual notifications
    console.log(`Notification sent to ${approverId} for approval ${request.id}`);
    if (isEscalation) {
      console.log('This is an ESCALATED approval request');
    }
  }

  // Get pending approvals for user
  getPendingApprovals(userId: string): ApprovalRequest[] {
    return Array.from(this.approvalRequests.values())
      .filter(req => 
        req.status === 'pending' && 
        req.currentApproverId === userId
      );
  }

  // Get approval history
  getApprovalHistory(filters?: {
    requesterId?: string;
    approverId?: string;
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
  }): ApprovalRequest[] {
    let requests = Array.from(this.approvalRequests.values());

    if (filters) {
      if (filters.requesterId) {
        requests = requests.filter(req => req.requesterId === filters.requesterId);
      }
      if (filters.approverId) {
        requests = requests.filter(req => 
          req.approvalChain.some(node => node.approverId === filters.approverId)
        );
      }
      if (filters.projectId) {
        requests = requests.filter(req => req.projectId === filters.projectId);
      }
      if (filters.startDate) {
        requests = requests.filter(req => req.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        requests = requests.filter(req => req.createdAt <= filters.endDate!);
      }
    }

    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get approval metrics
  getApprovalMetrics(): {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    escalatedRequests: number;
    averageApprovalTime: number;
  } {
    const requests = Array.from(this.approvalRequests.values());
    const completedRequests = requests.filter(req => req.completedAt);

    const totalApprovalTime = completedRequests.reduce((sum, req) => {
      return sum + (req.completedAt!.getTime() - req.createdAt.getTime());
    }, 0);

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(req => req.status === 'pending').length,
      approvedRequests: requests.filter(req => req.status === 'approved').length,
      rejectedRequests: requests.filter(req => req.status === 'rejected').length,
      escalatedRequests: requests.filter(req => req.status === 'escalated').length,
      averageApprovalTime: completedRequests.length > 0 
        ? totalApprovalTime / completedRequests.length / (1000 * 60 * 60) // in hours
        : 0
    };
  }
}