// Weight Adjustment Service for managing stakeholder weight modifications

import {
  WeightAdjustment,
  WeightAdjustmentConfig,
  WEIGHT_ADJUSTMENT_AUTHORITIES,
  DepartmentSpecialty,
  CrossDepartmentReview,
  AuthorityActionResult
} from '../types/authority';
import { 
  ProposalType, 
  StakeholderCategory, 
  HierarchicalUser,
  ProposalTypeConfig,
  StakeholderWeight
} from '../types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { AuthorityManagementService } from './AuthorityManagementService';
import { AuditService } from './AuditService';
import { NotificationService } from './NotificationService';
import { v4 as uuidv4 } from 'uuid';

export class WeightAdjustmentService {
  private static instance: WeightAdjustmentService;
  private adjustments: Map<string, WeightAdjustment> = new Map();
  private crossReviews: Map<string, CrossDepartmentReview[]> = new Map();
  private weightHistory: Map<string, WeightAdjustment[]> = new Map();
  private authorityService: AuthorityManagementService;

  // Current weight configurations (would be in database in production)
  private currentWeights: Map<string, number> = new Map();

  private auditService: AuditService;
  private constructor() {
    this.authorityService = AuthorityManagementService.getInstance();
    this.auditService = AuditService.getInstance();
    this.initializeDefaultWeights();
  }

  static getInstance(): WeightAdjustmentService {
    if (!WeightAdjustmentService.instance) {
      WeightAdjustmentService.instance = new WeightAdjustmentService();
    }
    return WeightAdjustmentService.instance;
  }

  private initializeDefaultWeights(): void {
    // Initialize with default weights from proposal type configs
    // In production, this would load from database
    const defaultConfigs = this.getDefaultProposalConfigs();
    
    defaultConfigs.forEach(config => {
      config.weights.forEach(weight => {
        const key = this.getWeightKey(config.type, weight.category);
        this.currentWeights.set(key, weight.weight);
      });
    });
  }

  // Request weight adjustment
  async requestWeightAdjustment(
    requester: HierarchicalUser,
    departmentSpecialty: DepartmentSpecialty,
    proposalType: ProposalType,
    stakeholderCategory: StakeholderCategory,
    newWeight: number,
    reason: string
  ): Promise<AuthorityActionResult> {
    // Validate requester has base authority
    const hasAuthority = await this.authorityService.checkAuthority(
      requester,
      'WEIGHT_ADJUSTMENT',
      { departmentSpecialty }
    );

    if (!hasAuthority) {
      return {
        success: false,
        actionId: '',
        message: 'You do not have authority to adjust weights for this department specialty',
        auditLogId: ''
      };
    }

    // Validate adjustment range
    const config = WEIGHT_ADJUSTMENT_AUTHORITIES[departmentSpecialty];
    const currentWeight = this.getCurrentWeight(proposalType, stakeholderCategory);
    const adjustment = newWeight - currentWeight;

    if (Math.abs(adjustment) > config.adjustmentRange) {
      return {
        success: false,
        actionId: '',
        message: `Adjustment exceeds allowed range of ±${config.adjustmentRange}`,
        auditLogId: ''
      };
    }

    // Create weight adjustment request
    const adjustmentRequest: WeightAdjustment = {
      id: uuidv4(),
      requesterId: requester.id,
      departmentSpecialty,
      proposalType,
      stakeholderCategory,
      previousWeight: currentWeight,
      newWeight,
      adjustment,
      reason,
      status: 'pending',
      requestedAt: new Date(),
      affectedDepartments: await this.getAffectedDepartments(proposalType, stakeholderCategory)
    };

    // If requester is HR Director (LEVEL_6), auto-approve
    if (requester.permissionLevel === PermissionLevel.LEVEL_6) {
      adjustmentRequest.status = 'approved';
      adjustmentRequest.reviewedAt = new Date();
      adjustmentRequest.reviewedBy = requester.id;
      adjustmentRequest.supervisorId = requester.id;
      
      // Apply the adjustment immediately
      await this.applyWeightAdjustment(adjustmentRequest);
    } else {
      // Otherwise, requires HR Director supervision
      adjustmentRequest.supervisorId = await this.getHRDirectorId();
      
      // Initiate cross-department reviews if needed
      if (adjustmentRequest.affectedDepartments && adjustmentRequest.affectedDepartments.length > 0) {
        await this.initiateCrossDepartmentReviews(adjustmentRequest);
      }
    }

    this.adjustments.set(adjustmentRequest.id, adjustmentRequest);
    
    // Record in authority management
    const result = await this.authorityService.executeAuthorityAction(
      requester,
      'WEIGHT_ADJUSTMENT',
      {
        resourceType: 'weight_adjustment',
        resourceId: adjustmentRequest.id,
        previousState: { weight: currentWeight },
        newState: { weight: newWeight },
        departmentSpecialty,
        proposalType,
        stakeholderCategory
      },
      reason
    );

    return {
      ...result,
      actionId: adjustmentRequest.id,
      message: requester.permissionLevel === PermissionLevel.LEVEL_6 
        ? 'Weight adjustment applied successfully'
        : 'Weight adjustment request submitted for review'
    };
  }

  // Initiate cross-department reviews
  private async initiateCrossDepartmentReviews(adjustment: WeightAdjustment): Promise<void> {
    const reviews: CrossDepartmentReview[] = [];
    const vetoDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    for (const departmentId of adjustment.affectedDepartments!) {
      const review: CrossDepartmentReview = {
        id: uuidv4(),
        adjustmentId: adjustment.id,
        departmentId,
        reviewerId: await this.getDepartmentHeadId(departmentId),
        decision: 'pending',
        vetoDeadline
      };
      reviews.push(review);
    }

    this.crossReviews.set(adjustment.id, reviews);
  }

  // Process cross-department review
  async processCrossDepartmentReview(
    reviewer: HierarchicalUser,
    reviewId: string,
    decision: 'approve' | 'veto',
    reason?: string
  ): Promise<AuthorityActionResult> {
    // Find the review
    let targetReview: CrossDepartmentReview | undefined;
    let adjustmentId: string | undefined;

    for (const [adjId, reviews] of this.crossReviews.entries()) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        targetReview = review;
        adjustmentId = adjId;
        break;
      }
    }

    if (!targetReview || !adjustmentId) {
      return {
        success: false,
        actionId: '',
        message: 'Review not found',
        auditLogId: ''
      };
    }

    // Verify reviewer authority
    const hasAuthority = await this.authorityService.checkAuthority(
      reviewer,
      'CROSS_DEPARTMENT_REVIEW',
      { affectedDepartments: [targetReview.departmentId] }
    );

    if (!hasAuthority) {
      return {
        success: false,
        actionId: '',
        message: 'You do not have authority to review this adjustment',
        auditLogId: ''
      };
    }

    // Check deadline
    if (new Date() > targetReview.vetoDeadline) {
      return {
        success: false,
        actionId: '',
        message: 'Review deadline has passed',
        auditLogId: ''
      };
    }

    // Update review
    targetReview.decision = decision;
    targetReview.reason = reason;
    targetReview.reviewedAt = new Date();

    // If vetoed, reject the adjustment
    const adjustment = this.adjustments.get(adjustmentId);
    if (adjustment && decision === 'veto') {
      adjustment.status = 'rejected';
      adjustment.reviewedAt = new Date();
      adjustment.reviewedBy = reviewer.id;
    }

    // Check if all reviews are complete
    await this.checkAndProcessAdjustment(adjustmentId);

    // Record in authority management
    return await this.authorityService.executeAuthorityAction(
      reviewer,
      'CROSS_DEPARTMENT_REVIEW',
      {
        resourceType: 'cross_department_review',
        resourceId: reviewId,
        adjustmentId,
        decision,
        reason
      },
      reason || 'Cross-department review decision'
    );
  }

  // Check if adjustment can be processed
  private async checkAndProcessAdjustment(adjustmentId: string): Promise<void> {
    const adjustment = this.adjustments.get(adjustmentId);
    if (!adjustment || adjustment.status !== 'pending') return;

    const reviews = this.crossReviews.get(adjustmentId) || [];
    
    // Check if any review vetoed
    const hasVeto = reviews.some(r => r.decision === 'veto');
    if (hasVeto) {
      adjustment.status = 'rejected';
      adjustment.reviewedAt = new Date();
      return;
    }

    // Check if all reviews are complete or past deadline
    const now = new Date();
    const allReviewsComplete = reviews.every(r => 
      r.decision !== 'pending' || now > r.vetoDeadline
    );

    if (allReviewsComplete) {
      // Apply the adjustment
      adjustment.status = 'approved';
      adjustment.reviewedAt = new Date();
      await this.applyWeightAdjustment(adjustment);
    }
  }

  // Apply weight adjustment
  private async applyWeightAdjustment(adjustment: WeightAdjustment): Promise<void> {
    const key = this.getWeightKey(adjustment.proposalType, adjustment.stakeholderCategory);
    
    // Store in history
    if (!this.weightHistory.has(key)) {
      this.weightHistory.set(key, []);
    }
    this.weightHistory.get(key)!.push(adjustment);

    // Update current weight
    this.currentWeights.set(key, adjustment.newWeight);

    // In production, persist to database
    console.log(`Weight adjusted: ${key} from ${adjustment.previousWeight} to ${adjustment.newWeight}`);
  }

  // Get current weight
  getCurrentWeight(proposalType: ProposalType, stakeholderCategory: StakeholderCategory): number {
    const key = this.getWeightKey(proposalType, stakeholderCategory);
    return this.currentWeights.get(key) || 1.0;
  }

  // Get weight adjustment history
  getWeightHistory(
    proposalType?: ProposalType,
    stakeholderCategory?: StakeholderCategory
  ): WeightAdjustment[] {
    if (proposalType && stakeholderCategory) {
      const key = this.getWeightKey(proposalType, stakeholderCategory);
      return this.weightHistory.get(key) || [];
    }

    // Return all history
    const allHistory: WeightAdjustment[] = [];
    this.weightHistory.forEach(history => {
      allHistory.push(...history);
    });
    return allHistory.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  // Get pending adjustments for supervisor
  getPendingAdjustments(supervisorId: string): WeightAdjustment[] {
    return Array.from(this.adjustments.values())
      .filter(adj => adj.status === 'pending' && adj.supervisorId === supervisorId);
  }

  // Get pending reviews for department head
  getPendingReviews(reviewerId: string): CrossDepartmentReview[] {
    const allReviews: CrossDepartmentReview[] = [];
    
    this.crossReviews.forEach(reviews => {
      const pending = reviews.filter(r => 
        r.reviewerId === reviewerId && 
        r.decision === 'pending' &&
        new Date() <= r.vetoDeadline
      );
      allReviews.push(...pending);
    });

    return allReviews;
  }

  // Helper methods
  private getWeightKey(proposalType: ProposalType, stakeholderCategory: StakeholderCategory): string {
    return `${proposalType}_${stakeholderCategory}`;
  }

  private async getAffectedDepartments(
    proposalType: ProposalType,
    stakeholderCategory: StakeholderCategory
  ): Promise<string[]> {
    // In production, this would query the database for departments
    // that would be affected by this weight change
    const affected: string[] = [];

    // Example logic: certain proposal types affect specific departments
    if (proposalType === 'operational' && stakeholderCategory === 'frontline') {
      affected.push('operations', 'quality_control');
    } else if (proposalType === 'strategic' && stakeholderCategory === 'management') {
      affected.push('planning', 'finance');
    }

    return affected;
  }

  private async getHRDirectorId(): Promise<string> {
    // In production, query database for HR Director
    return 'hr_director_001';
  }

  private async getDepartmentHeadId(departmentId: string): Promise<string> {
    // In production, query database for department head
    return `head_${departmentId}`;
  }

  private getDefaultProposalConfigs(): ProposalTypeConfig[] {
    // Default configurations - in production, load from database
    return [
      {
        type: 'operational',
        label: '業務改善',
        icon: '⚙️',
        description: '日常業務の効率化・改善',
        borderColor: 'border-blue-500',
        weights: [
          { category: 'frontline', weight: 1.5, label: '現場スタッフ', description: '実務経験重視' },
          { category: 'management', weight: 1.0, label: '管理職', description: '組織影響評価' },
          { category: 'veteran', weight: 1.3, label: 'ベテラン', description: '経験則活用' },
          { category: 'zGen', weight: 0.8, label: 'Z世代', description: '新しい視点' }
        ]
      },
      {
        type: 'strategic',
        label: '戦略的提案',
        icon: '🎯',
        description: '組織戦略・長期計画',
        borderColor: 'border-purple-500',
        weights: [
          { category: 'frontline', weight: 0.8, label: '現場スタッフ', description: '現場視点' },
          { category: 'management', weight: 1.5, label: '管理職', description: '戦略立案経験' },
          { category: 'veteran', weight: 1.2, label: 'ベテラン', description: '組織理解' },
          { category: 'zGen', weight: 0.7, label: 'Z世代', description: '将来視点' }
        ]
      },
      {
        type: 'innovation',
        label: 'イノベーション',
        icon: '💡',
        description: '新技術・新手法の導入',
        borderColor: 'border-green-500',
        weights: [
          { category: 'frontline', weight: 1.0, label: '現場スタッフ', description: '実装可能性' },
          { category: 'management', weight: 0.9, label: '管理職', description: '投資判断' },
          { category: 'veteran', weight: 0.7, label: 'ベテラン', description: '実績重視' },
          { category: 'zGen', weight: 1.5, label: 'Z世代', description: '技術親和性' }
        ]
      }
    ];
  }

  // Calculate weighted score for a proposal
  calculateWeightedScore(
    proposalType: ProposalType,
    votesByStakeholder: Record<StakeholderCategory, Record<string, number>>
  ): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(votesByStakeholder).forEach(([category, votes]) => {
      const weight = this.getCurrentWeight(proposalType, category as StakeholderCategory);
      const categoryScore = this.calculateCategoryScore(votes);
      
      totalWeightedScore += categoryScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }

  private calculateCategoryScore(votes: Record<string, number>): number {
    const voteValues = {
      'strongly-oppose': -2,
      'oppose': -1,
      'neutral': 0,
      'support': 1,
      'strongly-support': 2
    };

    let totalScore = 0;
    let totalVotes = 0;

    Object.entries(votes).forEach(([voteType, count]) => {
      const value = voteValues[voteType as keyof typeof voteValues] || 0;
      totalScore += value * count;
      totalVotes += count;
    });

    return totalVotes > 0 ? totalScore / totalVotes : 0;
  }
}