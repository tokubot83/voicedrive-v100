// プロジェクト段階的昇格エンジン
import { 
  ProjectLevel, 
  ProjectUpgradeCondition, 
  StakeholderGroup,
  EmergencyEscalationConfig,
  EscalationResult
} from '../types/visibility';
import { Post, User } from '../types';
import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';
import { ProjectScoringEngine } from '../utils/ProjectScoring';
import { PostVisibilityEngine } from './PostVisibilityEngine';
import { NotificationService } from './NotificationService';
import { AuditService } from './AuditService';

export class ProjectUpgradeEngine {
  private scoringEngine: ProjectScoringEngine;
  private visibilityEngine: PostVisibilityEngine;
  private notificationService: NotificationService;
  private auditService: AuditService;

  constructor() {
    this.scoringEngine = new ProjectScoringEngine();
    this.visibilityEngine = new PostVisibilityEngine();
    this.notificationService = NotificationService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  /**
   * 投稿の自動昇格チェック
   */
  async checkForAutoUpgrade(
    post: Post, 
    organizationSize: number = 400
  ): Promise<{ 
    shouldUpgrade: boolean; 
    targetLevel?: ProjectLevel; 
    newVisibilityScope?: StakeholderGroup;
    notification?: string;
  }> {
    const currentLevel = this.visibilityEngine.getPostCurrentLevel(post);
    const currentScore = this.getCurrentScore(post);
    
    // 昇格条件をチェック
    const upgradeCondition = this.getUpgradeCondition(currentLevel, currentScore, organizationSize);
    
    if (!upgradeCondition) {
      return { shouldUpgrade: false };
    }

    return {
      shouldUpgrade: true,
      targetLevel: upgradeCondition.targetLevel,
      newVisibilityScope: upgradeCondition.newVisibilityScope,
      notification: this.generateUpgradeNotification(upgradeCondition)
    };
  }

  /**
   * 緊急昇格の実行
   */
  async executeEmergencyEscalation(
    post: Post,
    targetScope: ProjectScope,
    executorUser: User,
    justification?: string
  ): Promise<EscalationResult> {
    const currentLevel = this.visibilityEngine.getPostCurrentLevel(post);
    const executorLevel = executorUser.permissionLevel || 1;
    
    // 権限チェック
    if (!this.canExecuteEmergencyEscalation(executorLevel, targetScope)) {
      throw new Error('緊急昇格権限が不足しています');
    }

    // 昇格実行
    const escalationConfig = this.getEscalationConfig(executorLevel, targetScope);
    const newLevel = this.projectScopeToLevel(targetScope);
    const newScope = this.getVisibilityScopeForLevel(newLevel);
    
    // 監査ログ記録
    const auditId = await this.auditService.logAuditEntry(
      executorUser.id,
      'EMERGENCY_ESCALATION' as any,
      'POST',
      post.id,
      {
        reason: justification,
        previousState: { level: currentLevel },
        newState: { level: newLevel, scope: targetScope },
        ipAddress: '127.0.0.1' // 実際の実装では取得する
      }
    );

    // 緊急通知送信
    if (escalationConfig.immediateVisibilityChange.emergencyNotification) {
      await this.notificationService.sendNotification({
        recipientId: executorUser.id,
        type: 'emergency_escalation',
        title: `緊急プロジェクト昇格: ${newLevel}`,
        message: `投稿「${post.content.slice(0, 50)}...」が緊急昇格されました`,
        priority: 'CRITICAL',
        data: {
          postId: post.id,
          executor: executorUser.name,
          fromLevel: currentLevel,
          toLevel: newLevel,
          timestamp: new Date()
        }
      });
    }

    return {
      success: true,
      postId: post.id,
      fromLevel: currentLevel,
      toLevel: newLevel,
      newScope,
      executorId: executorUser.id,
      executorLevel: executorLevel as PermissionLevel,
      justification,
      timestamp: new Date(),
      auditId
    };
  }

  /**
   * 昇格条件の判定
   */
  private getUpgradeCondition(
    currentLevel: ProjectLevel, 
    currentScore: number, 
    organizationSize: number
  ): ProjectUpgradeCondition | null {
    const projectStatus = this.scoringEngine.getProjectStatus(
      currentScore, 
      'improvement', 
      organizationSize
    );

    // 各レベルの昇格条件
    const upgradeConditions: Record<ProjectLevel, ProjectUpgradeCondition | null> = {
      'PENDING': projectStatus.level === 'TEAM' ? {
        currentLevel: 'PENDING',
        targetLevel: 'TEAM',
        scoreThreshold: 50,
        organizationSizeMultiplier: this.calculateSizeMultiplier(organizationSize),
        newVisibilityScope: StakeholderGroup.SAME_DEPARTMENT,
        notificationRequired: true
      } : null,
      
      'TEAM': projectStatus.level === 'DEPARTMENT' ? {
        currentLevel: 'TEAM',
        targetLevel: 'DEPARTMENT',
        scoreThreshold: 100,
        organizationSizeMultiplier: this.calculateSizeMultiplier(organizationSize),
        newVisibilityScope: StakeholderGroup.SAME_FACILITY,
        notificationRequired: true
      } : null,
      
      'DEPARTMENT': projectStatus.level === 'FACILITY' ? {
        currentLevel: 'DEPARTMENT',
        targetLevel: 'FACILITY',
        scoreThreshold: 300,
        organizationSizeMultiplier: this.calculateSizeMultiplier(organizationSize),
        newVisibilityScope: StakeholderGroup.SAME_ORGANIZATION,
        notificationRequired: true
      } : null,
      
      'FACILITY': projectStatus.level === 'ORGANIZATION' ? {
        currentLevel: 'FACILITY',
        targetLevel: 'ORGANIZATION',
        scoreThreshold: 600,
        organizationSizeMultiplier: this.calculateSizeMultiplier(organizationSize),
        newVisibilityScope: StakeholderGroup.SAME_ORGANIZATION,
        notificationRequired: true
      } : null,
      
      'ORGANIZATION': null, // 法人レベルは最終段階
      'STRATEGIC': null     // 戦略レベルは最終段階
    };

    return upgradeConditions[currentLevel];
  }

  /**
   * 緊急昇格権限チェック
   */
  private canExecuteEmergencyEscalation(
    executorLevel: number, 
    targetScope: ProjectScope
  ): boolean {
    const requiredLevels: Record<ProjectScope, PermissionLevel> = {
      [ProjectScope.TEAM]: PermissionLevel.LEVEL_2,
      [ProjectScope.DEPARTMENT]: PermissionLevel.LEVEL_4,
      [ProjectScope.FACILITY]: PermissionLevel.LEVEL_7,
      [ProjectScope.ORGANIZATION]: PermissionLevel.LEVEL_8,
      [ProjectScope.STRATEGIC]: PermissionLevel.LEVEL_8
    };

    return executorLevel >= requiredLevels[targetScope];
  }

  /**
   * 緊急昇格設定の取得
   */
  private getEscalationConfig(
    executorLevel: number, 
    targetScope: ProjectScope
  ): EmergencyEscalationConfig {
    const isLevel7 = executorLevel >= PermissionLevel.LEVEL_7;
    const isLevel8 = executorLevel >= PermissionLevel.LEVEL_8;

    return {
      triggerAuthority: isLevel8 ? PermissionLevel.LEVEL_8 : PermissionLevel.LEVEL_7,
      escalationType: isLevel8 ? 'executive_override' : 'workflow_override',
      immediateVisibilityChange: {
        newScope: this.getVisibilityScopeForLevel(this.projectScopeToLevel(targetScope)),
        bypassNormalProcess: true,
        emergencyNotification: true
      },
      auditRequirements: {
        justificationRequired: !isLevel8, // レベル8は説明不要
        postActionReportRequired: !isLevel8,
        approvalChainDocumentation: true
      }
    };
  }

  /**
   * ヘルパーメソッド群
   */
  private getCurrentScore(post: Post): number {
    if (post.projectStatus && typeof post.projectStatus === 'object') {
      return post.projectStatus.score || 0;
    }
    return 0;
  }

  private calculateSizeMultiplier(organizationSize: number): number {
    const baseSize = 400;
    return Math.round((organizationSize / baseSize) * 100) / 100;
  }

  private projectScopeToLevel(scope: ProjectScope): ProjectLevel {
    const mapping: Record<ProjectScope, ProjectLevel> = {
      [ProjectScope.TEAM]: 'TEAM',
      [ProjectScope.DEPARTMENT]: 'DEPARTMENT',
      [ProjectScope.FACILITY]: 'FACILITY',
      [ProjectScope.ORGANIZATION]: 'ORGANIZATION',
      [ProjectScope.STRATEGIC]: 'STRATEGIC'
    };
    return mapping[scope];
  }

  private getVisibilityScopeForLevel(level: ProjectLevel): StakeholderGroup {
    const mapping: Record<ProjectLevel, StakeholderGroup> = {
      'PENDING': StakeholderGroup.SAME_DEPARTMENT,
      'TEAM': StakeholderGroup.SAME_DEPARTMENT,
      'DEPARTMENT': StakeholderGroup.SAME_FACILITY,
      'FACILITY': StakeholderGroup.SAME_ORGANIZATION,
      'ORGANIZATION': StakeholderGroup.SAME_ORGANIZATION,
      'STRATEGIC': StakeholderGroup.SAME_ORGANIZATION
    };
    return mapping[level];
  }

  private getAffectedStakeholders(scope: StakeholderGroup): string[] {
    // 実装時に適切なステークホルダーリストを返す
    return [];
  }

  private generateUpgradeNotification(condition: ProjectUpgradeCondition): string {
    const levelNames = {
      'PENDING': '検討中',
      'TEAM': 'チームプロジェクト',
      'DEPARTMENT': '部署プロジェクト',
      'FACILITY': '施設プロジェクト',
      'ORGANIZATION': '法人プロジェクト',
      'STRATEGIC': '戦略プロジェクト'
    };

    return `🎉 ${levelNames[condition.targetLevel]}に昇格しました！より多くの職員が投票できるようになります。`;
  }
}

export default ProjectUpgradeEngine;