// Content Moderation Service for post filtering and emergency deletion
import { HierarchicalUser } from '../types';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { EmergencyAuthorityService } from './EmergencyAuthorityService';
import { ReportCategory } from '../types/whistleblowing';
import { v4 as uuidv4 } from 'uuid';

// Content filter severity levels
export type ContentSeverity = 'low' | 'medium' | 'high' | 'critical';

// Content violation types
export type ViolationType = 
  | 'harassment'
  | 'personal_attack'
  | 'privacy_violation'
  | 'legal_risk'
  | 'organizational_risk'
  | 'inappropriate_language'
  | 'spam';

// Prohibited phrases database
interface ProhibitedPhrase {
  id: string;
  phrase: string;
  severity: ContentSeverity;
  violationType: ViolationType;
  description: string;
  isRegex?: boolean;
  category: 'exact' | 'partial' | 'pattern';
}

// Content violation result
interface ContentViolation {
  id: string;
  violationType: ViolationType;
  severity: ContentSeverity;
  matchedPhrases: string[];
  description: string;
  actionRequired: boolean;
}

// Emergency deletion record
interface EmergencyDeletion {
  id: string;
  postId: string;
  deletedBy: string;
  deletionReason: string;
  violations: ContentViolation[];
  scope: 'team' | 'department' | 'facility' | 'organization';
  deletedAt: Date;
  reportedToCompliance: boolean;
  complianceReportId?: string;
  requiredFollowUp: string[];
  deadline: Date;
}

// Content moderation result
export interface ModerationResult {
  allowed: boolean;
  violations: ContentViolation[];
  recommendedAction: 'allow' | 'warn' | 'block' | 'escalate';
  moderationNotes?: string;
}

// Emergency deletion authority
interface DeletionAuthority {
  level: PermissionLevel;
  scope: 'team' | 'department' | 'facility' | 'organization';
  description: string;
}

export class ContentModerationService {
  private static instance: ContentModerationService;
  private prohibitedPhrases: ProhibitedPhrase[] = [];
  private emergencyDeletions: Map<string, EmergencyDeletion> = new Map();
  private emergencyService: EmergencyAuthorityService;

  // Deletion authority mapping
  private readonly DELETION_AUTHORITIES: DeletionAuthority[] = [
    { level: PermissionLevel.LEVEL_2, scope: 'team', description: 'チーム内投稿の緊急削除' },
    { level: PermissionLevel.LEVEL_3, scope: 'department', description: '部門内投稿の緊急削除' },
    { level: PermissionLevel.LEVEL_4, scope: 'facility', description: '施設内投稿の緊急削除' },
    { level: PermissionLevel.LEVEL_6, scope: 'facility', description: '施設内投稿の緊急削除' },
    { level: PermissionLevel.LEVEL_7, scope: 'organization', description: '全投稿の緊急削除' }
  ];

  private constructor() {
    this.emergencyService = EmergencyAuthorityService.getInstance();
    this.initializeProhibitedPhrases();
    this.startDeletionMonitor();
  }

  static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }

  // Initialize prohibited phrases database
  private initializeProhibitedPhrases(): void {
    this.prohibitedPhrases = [
      // ハラスメント・個人攻撃
      {
        id: '1',
        phrase: '無能',
        severity: 'high',
        violationType: 'personal_attack',
        description: '個人の能力への直接的攻撃',
        category: 'exact'
      },
      {
        id: '2',
        phrase: 'やめろ',
        severity: 'high',
        violationType: 'harassment',
        description: '退職強要に関連する表現',
        category: 'exact'
      },
      {
        id: '3',
        phrase: '向いてない',
        severity: 'medium',
        violationType: 'personal_attack',
        description: '職業適性への否定的評価',
        category: 'partial'
      },
      {
        id: '4',
        phrase: '管理職.*向いてない',
        severity: 'high',
        violationType: 'personal_attack',
        description: '管理職適性への否定的評価',
        category: 'pattern',
        isRegex: true
      },
      {
        id: '5',
        phrase: 'クビ',
        severity: 'critical',
        violationType: 'harassment',
        description: '解雇を示唆する表現',
        category: 'exact'
      },
      {
        id: '6',
        phrase: '役に立たない',
        severity: 'high',
        violationType: 'personal_attack',
        description: '個人の価値を否定する表現',
        category: 'exact'
      },
      {
        id: '7',
        phrase: 'バカ',
        severity: 'high',
        violationType: 'personal_attack',
        description: '知的能力への侮辱',
        category: 'exact'
      },
      {
        id: '8',
        phrase: 'アホ',
        severity: 'high',
        violationType: 'personal_attack',
        description: '知的能力への侮辱',
        category: 'exact'
      },
      {
        id: '9',
        phrase: '.*は.*に向いてない',
        severity: 'high',
        violationType: 'personal_attack',
        description: '特定個人の職業適性否定',
        category: 'pattern',
        isRegex: true
      },
      {
        id: '10',
        phrase: '.*の責任.*追及',
        severity: 'medium',
        violationType: 'organizational_risk',
        description: '個人責任追及の可能性',
        category: 'pattern',
        isRegex: true
      },

      // プライバシー関連
      {
        id: '20',
        phrase: '住所',
        severity: 'critical',
        violationType: 'privacy_violation',
        description: '個人情報（住所）への言及',
        category: 'partial'
      },
      {
        id: '21',
        phrase: '電話番号',
        severity: 'critical',
        violationType: 'privacy_violation',
        description: '個人情報（電話番号）への言及',
        category: 'partial'
      },
      {
        id: '22',
        phrase: '病歴',
        severity: 'critical',
        violationType: 'privacy_violation',
        description: '機密医療情報への言及',
        category: 'partial'
      },
      {
        id: '23',
        phrase: '給与',
        severity: 'high',
        violationType: 'privacy_violation',
        description: '個人の給与情報への言及',
        category: 'partial'
      },

      // 法的リスク
      {
        id: '30',
        phrase: '訴える',
        severity: 'high',
        violationType: 'legal_risk',
        description: '法的措置を示唆する表現',
        category: 'partial'
      },
      {
        id: '31',
        phrase: '告発',
        severity: 'high',
        violationType: 'legal_risk',
        description: '告発を示唆する表現',
        category: 'partial'
      },
      {
        id: '32',
        phrase: '証拠',
        severity: 'medium',
        violationType: 'legal_risk',
        description: '法的証拠への言及',
        category: 'partial'
      },

      // 組織リスク
      {
        id: '40',
        phrase: 'マスコミ',
        severity: 'critical',
        violationType: 'organizational_risk',
        description: 'メディア関与の示唆',
        category: 'partial'
      },
      {
        id: '41',
        phrase: '外部告発',
        severity: 'critical',
        violationType: 'organizational_risk',
        description: '外部機関への告発示唆',
        category: 'partial'
      },
      {
        id: '42',
        phrase: '内部告発',
        severity: 'high',
        violationType: 'organizational_risk',
        description: '内部告発の示唆',
        category: 'partial'
      }
    ];
  }

  // Content moderation check
  public moderateContent(content: string, title?: string): ModerationResult {
    const fullText = title ? `${title} ${content}` : content;
    const violations: ContentViolation[] = [];

    // Check against prohibited phrases
    for (const phrase of this.prohibitedPhrases) {
      const matches = this.checkPhrase(fullText, phrase);
      if (matches.length > 0) {
        violations.push({
          id: uuidv4(),
          violationType: phrase.violationType,
          severity: phrase.severity,
          matchedPhrases: matches,
          description: phrase.description,
          actionRequired: phrase.severity === 'high' || phrase.severity === 'critical'
        });
      }
    }

    // Determine overall action
    const highestSeverity = this.getHighestSeverity(violations);
    const recommendedAction = this.determineAction(highestSeverity, violations.length);

    return {
      allowed: recommendedAction === 'allow',
      violations,
      recommendedAction,
      moderationNotes: violations.length > 0 
        ? `${violations.length}件の潜在的問題を検出` 
        : undefined
    };
  }

  // Emergency deletion with authority check
  public async executeEmergencyDeletion(
    postId: string,
    actor: HierarchicalUser,
    reason: string,
    postScope: 'team' | 'department' | 'facility' | 'organization',
    violations?: ContentViolation[]
  ): Promise<{
    success: boolean;
    deletionId?: string;
    message: string;
    complianceReportId?: string;
  }> {
    // Check deletion authority
    const hasAuthority = this.checkDeletionAuthority(actor, postScope);
    if (!hasAuthority) {
      return {
        success: false,
        message: `${postScope}レベルの投稿削除権限がありません`
      };
    }

    // Create deletion record
    const deletionId = uuidv4();
    const deletion: EmergencyDeletion = {
      id: deletionId,
      postId,
      deletedBy: actor.id,
      deletionReason: reason,
      violations: violations || [],
      scope: postScope,
      deletedAt: new Date(),
      reportedToCompliance: false,
      requiredFollowUp: this.generateFollowUpTasks(violations || []),
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };

    // Store deletion record
    this.emergencyDeletions.set(deletionId, deletion);

    // Auto-report to compliance if critical violations
    let complianceReportId: string | undefined;
    if (this.shouldAutoReportToCompliance(violations || [])) {
      complianceReportId = await this.autoReportToCompliance(deletion, actor);
      deletion.reportedToCompliance = true;
      deletion.complianceReportId = complianceReportId;
    }

    // Log with Emergency Authority Service for high-level deletions
    if (actor.permissionLevel >= PermissionLevel.LEVEL_7) {
      await this.emergencyService.declareEmergency(
        actor,
        'FACILITY',
        'content_violation',
        'EMERGENCY_DELETION',
        [postId],
        `緊急投稿削除: ${reason}`
      );
    }

    // Notify stakeholders
    await this.notifyDeletionStakeholders(deletion, actor);

    return {
      success: true,
      deletionId,
      message: '投稿が緊急削除されました',
      complianceReportId
    };
  }

  // Check if user has deletion authority for scope
  private checkDeletionAuthority(user: HierarchicalUser, scope: string): boolean {
    const userLevel = user.permissionLevel;
    
    for (const authority of this.DELETION_AUTHORITIES) {
      if (userLevel >= authority.level && 
          (authority.scope === scope || authority.scope === 'organization')) {
        return true;
      }
    }

    return false;
  }

  // Check phrase match
  private checkPhrase(text: string, phrase: ProhibitedPhrase): string[] {
    const matches: string[] = [];
    const normalizedText = text.toLowerCase();
    const normalizedPhrase = phrase.phrase.toLowerCase();

    switch (phrase.category) {
      case 'exact':
        if (normalizedText.includes(normalizedPhrase)) {
          matches.push(phrase.phrase);
        }
        break;
      
      case 'partial':
        if (normalizedText.includes(normalizedPhrase)) {
          matches.push(phrase.phrase);
        }
        break;
      
      case 'pattern':
        if (phrase.isRegex) {
          try {
            const regex = new RegExp(normalizedPhrase, 'gi');
            const regexMatches = normalizedText.match(regex);
            if (regexMatches) {
              matches.push(...regexMatches);
            }
          } catch (error) {
            console.warn(`Invalid regex pattern: ${phrase.phrase}`);
          }
        }
        break;
    }

    return matches;
  }

  // Get highest severity from violations
  private getHighestSeverity(violations: ContentViolation[]): ContentSeverity | null {
    if (violations.length === 0) return null;

    const severityOrder: ContentSeverity[] = ['low', 'medium', 'high', 'critical'];
    let highest: ContentSeverity = 'low';

    for (const violation of violations) {
      const currentIndex = severityOrder.indexOf(violation.severity);
      const highestIndex = severityOrder.indexOf(highest);
      if (currentIndex > highestIndex) {
        highest = violation.severity;
      }
    }

    return highest;
  }

  // Determine recommended action
  private determineAction(severity: ContentSeverity | null, violationCount: number): 'allow' | 'warn' | 'block' | 'escalate' {
    if (!severity) return 'allow';

    switch (severity) {
      case 'low':
        return violationCount > 3 ? 'warn' : 'allow';
      case 'medium':
        return violationCount > 1 ? 'warn' : 'allow';
      case 'high':
        return 'block';
      case 'critical':
        return 'escalate';
      default:
        return 'allow';
    }
  }

  // Generate follow-up tasks based on violations
  private generateFollowUpTasks(violations: ContentViolation[]): string[] {
    const tasks: string[] = [];
    const violationTypes = new Set(violations.map(v => v.violationType));

    if (violationTypes.has('harassment') || violationTypes.has('personal_attack')) {
      tasks.push('ハラスメント調査の実施');
      tasks.push('関係者面談の実施');
    }

    if (violationTypes.has('privacy_violation')) {
      tasks.push('個人情報漏洩調査');
      tasks.push('情報セキュリティ対策の確認');
    }

    if (violationTypes.has('legal_risk')) {
      tasks.push('法務部門への相談');
      tasks.push('リスク評価の実施');
    }

    if (violationTypes.has('organizational_risk')) {
      tasks.push('広報部門への報告');
      tasks.push('危機管理対応の検討');
    }

    tasks.push('削除理由の48時間以内詳細報告');
    
    return tasks;
  }

  // Check if should auto-report to compliance
  private shouldAutoReportToCompliance(violations: ContentViolation[]): boolean {
    return violations.some(v => 
      v.severity === 'critical' || 
      v.violationType === 'harassment' ||
      v.violationType === 'privacy_violation' ||
      v.violationType === 'legal_risk'
    );
  }

  // Auto-report to compliance
  private async autoReportToCompliance(
    deletion: EmergencyDeletion, 
    actor: HierarchicalUser
  ): Promise<string> {
    // Determine report category
    const category = this.determineComplianceCategory(deletion.violations);
    
    // Create auto-report (would integrate with actual whistleblowing system)
    const reportId = uuidv4();
    
    console.log(`自動コンプライアンス通報作成:`, {
      reportId,
      category,
      deletionId: deletion.id,
      deletedBy: actor.name,
      reason: deletion.deletionReason
    });

    // In production, this would call the actual WhistleblowingReportForm submission
    return reportId;
  }

  // Determine compliance report category
  private determineComplianceCategory(violations: ContentViolation[]): ReportCategory {
    for (const violation of violations) {
      switch (violation.violationType) {
        case 'harassment':
        case 'personal_attack':
          return 'harassment';
        case 'privacy_violation':
        case 'legal_risk':
          return 'compliance';
        case 'organizational_risk':
          return 'other';
      }
    }
    return 'other';
  }

  // Notify stakeholders of deletion
  private async notifyDeletionStakeholders(deletion: EmergencyDeletion, actor: HierarchicalUser): Promise<void> {
    console.log(`緊急削除通知:`, {
      deletionId: deletion.id,
      scope: deletion.scope,
      deletedBy: actor.name,
      reason: deletion.deletionReason,
      complianceReport: deletion.reportedToCompliance
    });

    // In production, send actual notifications to:
    // - HR department
    // - Compliance team
    // - Direct supervisors
    // - Emergency authority reviewers
  }

  // Monitor deletion deadlines
  private startDeletionMonitor(): void {
    setInterval(() => {
      const now = new Date();
      
      this.emergencyDeletions.forEach((deletion, deletionId) => {
        if (!deletion.reportedToCompliance && now > deletion.deadline) {
          this.sendDeletionReminder(deletionId, deletion);
        }
      });
    }, 60 * 60 * 1000); // Check every hour
  }

  // Send deletion follow-up reminder
  private sendDeletionReminder(deletionId: string, deletion: EmergencyDeletion): void {
    console.log(`削除報告期限超過:`, {
      deletionId,
      deletedBy: deletion.deletedBy,
      deadline: deletion.deadline,
      requiredFollowUp: deletion.requiredFollowUp
    });

    // In production, escalate to higher management
  }

  // Get moderation statistics
  public getModerationStats(): {
    totalDeletions: number;
    byScope: Record<string, number>;
    byViolationType: Record<ViolationType, number>;
    pendingReports: number;
    overdueReports: number;
  } {
    const deletions = Array.from(this.emergencyDeletions.values());
    const now = new Date();

    const byScope: Record<string, number> = {};
    const byViolationType: Record<ViolationType, number> = {} as Record<ViolationType, number>;

    deletions.forEach(deletion => {
      byScope[deletion.scope] = (byScope[deletion.scope] || 0) + 1;
      
      deletion.violations.forEach(violation => {
        byViolationType[violation.violationType] = (byViolationType[violation.violationType] || 0) + 1;
      });
    });

    const pendingReports = deletions.filter(d => !d.reportedToCompliance).length;
    const overdueReports = deletions.filter(d => !d.reportedToCompliance && now > d.deadline).length;

    return {
      totalDeletions: deletions.length,
      byScope,
      byViolationType,
      pendingReports,
      overdueReports
    };
  }

  // Add new prohibited phrase
  public addProhibitedPhrase(phrase: Omit<ProhibitedPhrase, 'id'>): void {
    this.prohibitedPhrases.push({
      ...phrase,
      id: uuidv4()
    });
  }

  // Get all emergency deletions
  public getEmergencyDeletions(filters?: {
    scope?: string;
    deletedBy?: string;
    startDate?: Date;
    endDate?: Date;
  }): EmergencyDeletion[] {
    let deletions = Array.from(this.emergencyDeletions.values());

    if (filters) {
      if (filters.scope) {
        deletions = deletions.filter(d => d.scope === filters.scope);
      }
      if (filters.deletedBy) {
        deletions = deletions.filter(d => d.deletedBy === filters.deletedBy);
      }
      if (filters.startDate) {
        deletions = deletions.filter(d => d.deletedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        deletions = deletions.filter(d => d.deletedAt <= filters.endDate!);
      }
    }

    return deletions.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
  }
}