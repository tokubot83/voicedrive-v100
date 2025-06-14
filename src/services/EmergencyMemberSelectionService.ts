// EmergencyMemberSelectionService - Phase 4 緊急オーバーライド選定
// Level 7緊急権限によるクライシス対応・即時メンバー編成システム

import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';
import { HierarchicalUser } from '../types';
import { 
  MemberSelection, 
  MemberCandidate, 
  SelectionCriteria, 
  SelectionResult,
  MemberAssignment,
  MemberRole 
} from '../types/memberSelection';
import AIAssistedMemberSelectionService from './AIAssistedMemberSelectionService';

// 緊急選定関連の型定義
export interface EmergencySelection extends MemberSelection {
  emergencyType: EmergencyType;
  urgencyLevel: UrgencyLevel;
  emergencyContext: EmergencyContext;
  responseTeam: CrisisResponseTeam;
  escalationChain: EscalationRecord[];
  authorityOverride: AuthorityOverride;
  timeConstraints: TimeConstraints;
  postActionReport?: PostActionReport;
}

export type EmergencyType = 
  | 'NATURAL_DISASTER'     // 自然災害
  | 'FACILITY_ACCIDENT'    // 施設事故
  | 'SECURITY_BREACH'      // セキュリティ侵害
  | 'SYSTEM_FAILURE'       // システム障害
  | 'MEDICAL_EMERGENCY'    // 医療緊急事態
  | 'STAFFING_CRISIS'      // 人員危機
  | 'REGULATORY_VIOLATION' // 規制違反
  | 'REPUTATION_CRISIS'    // 評判危機
  | 'CYBER_ATTACK'         // サイバー攻撃
  | 'PANDEMIC_RESPONSE'    // パンデミック対応
  | 'FINANCIAL_CRISIS'     // 財務危機
  | 'SUPPLY_CHAIN_DISRUPTION'; // サプライチェーン混乱

export type UrgencyLevel = 
  | 'CRITICAL'   // 即座対応（1時間以内）
  | 'HIGH'       // 緊急対応（6時間以内）
  | 'MEDIUM'     // 迅速対応（24時間以内）
  | 'LOW';       // 計画的対応（72時間以内）

export interface EmergencyContext {
  incidentId: string;
  description: string;
  affectedAreas: string[];
  affectedPersonnel: number;
  potentialImpact: ImpactAssessment;
  externalFactors: ExternalFactor[];
  timeWindow: number; // 対応可能時間（分）
  resourceConstraints: ResourceConstraint[];
}

export interface ImpactAssessment {
  patient_safety: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  operational_continuity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  financial_impact: number; // 予想損失額
  regulatory_impact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reputation_impact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimated_recovery_time: number; // 回復時間（時間）
}

export interface ExternalFactor {
  type: 'WEATHER' | 'REGULATORY' | 'MEDIA' | 'GOVERNMENT' | 'COMMUNITY';
  description: string;
  impact_level: 'LOW' | 'MEDIUM' | 'HIGH';
  response_required: boolean;
}

export interface ResourceConstraint {
  type: 'BUDGET' | 'PERSONNEL' | 'EQUIPMENT' | 'TIME' | 'FACILITY';
  description: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  workaround?: string;
}

export interface CrisisResponseTeam {
  commandStructure: CommandStructure;
  coreTeam: CrisisTeamMember[];
  supportTeam: CrisisTeamMember[];
  externalContacts: ExternalContact[];
  communicationProtocol: CommunicationProtocol;
  decisionMatrix: DecisionMatrix[];
}

export interface CommandStructure {
  incidentCommander: string; // Level 7執行責任者
  deputyCommander?: string;
  operationsChief: string;
  planningChief: string;
  logisticsChief: string;
  publicInformationOfficer?: string;
}

export interface CrisisTeamMember {
  userId: string;
  emergencyRole: EmergencyRole;
  responseCapability: ResponseCapability;
  contactInfo: EmergencyContactInfo;
  availability: EmergencyAvailability;
  expertise: CrisisExpertise[];
  authorityLevel: number;
}

export type EmergencyRole = 
  | 'INCIDENT_COMMANDER'     // 現場指揮官
  | 'MEDICAL_COORDINATOR'    // 医療調整官
  | 'SAFETY_OFFICER'         // 安全担当官
  | 'COMMUNICATIONS_LEAD'    // 通信責任者
  | 'LOGISTICS_COORDINATOR'  // 後方支援調整官
  | 'PUBLIC_RELATIONS'       // 広報担当
  | 'LEGAL_ADVISOR'          // 法務顧問
  | 'TECHNICAL_SPECIALIST'   // 技術専門家
  | 'LIAISON_OFFICER'        // 連絡調整官
  | 'DOCUMENTATION_LEAD';    // 記録責任者

export interface ResponseCapability {
  immediate_response: boolean; // 即座対応可能
  on_call_availability: boolean; // オンコール対応
  remote_capability: boolean; // 遠隔対応可能
  specialized_equipment: string[]; // 専用機器
  clearance_level: number; // セキュリティクリアランス
  language_skills: string[]; // 言語能力
}

export interface EmergencyContactInfo {
  primary_phone: string;
  secondary_phone?: string;
  emergency_email: string;
  home_address?: string;
  next_of_kin: string;
  alternative_contact: string;
}

export interface EmergencyAvailability {
  current_status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' | 'OFF_DUTY';
  location: string;
  estimated_response_time: number; // 分
  transportation_method: string;
  current_workload: number; // 0-100%
  constraints: string[];
}

export interface CrisisExpertise {
  domain: string;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  certifications: string[];
  recent_experience: boolean;
  leadership_experience: boolean;
}

export interface ExternalContact {
  organization: string;
  contact_name: string;
  role: string;
  phone: string;
  email: string;
  escalation_level: 'IMMEDIATE' | 'SECONDARY' | 'ADVISORY';
}

export interface CommunicationProtocol {
  primary_channel: string;
  backup_channels: string[];
  update_frequency: number; // 分
  notification_matrix: NotificationEntry[];
  escalation_triggers: EscalationTrigger[];
}

export interface NotificationEntry {
  recipient_role: EmergencyRole;
  notification_type: 'IMMEDIATE' | 'URGENT' | 'ROUTINE';
  communication_method: 'PHONE' | 'EMAIL' | 'SMS' | 'RADIO' | 'IN_PERSON';
  template: string;
}

export interface EscalationTrigger {
  condition: string;
  trigger_time: number; // 分
  escalate_to: string;
  auto_escalate: boolean;
}

export interface DecisionMatrix {
  scenario: string;
  decision_points: DecisionPoint[];
  authority_required: PermissionLevel;
  time_limit: number; // 分
  default_action: string;
}

export interface DecisionPoint {
  condition: string;
  action: string;
  resources_required: string[];
  approval_required: boolean;
  documentation_required: boolean;
}

export interface EscalationRecord {
  timestamp: Date;
  from_level: PermissionLevel;
  to_level: PermissionLevel;
  reason: string;
  response_time: number; // 分
  outcome: 'APPROVED' | 'DENIED' | 'PENDING' | 'TIMEOUT';
  notes?: string;
}

export interface AuthorityOverride {
  override_type: 'BUDGET' | 'PERSONNEL' | 'POLICY' | 'PROCEDURE' | 'SYSTEM';
  authorized_by: string;
  authorization_level: PermissionLevel;
  justification: string;
  scope: string[];
  time_limit?: Date;
  reporting_requirement: string;
  approval_chain_bypassed: string[];
}

export interface TimeConstraints {
  response_deadline: Date;
  decision_points: TimeDecisionPoint[];
  critical_milestones: CriticalMilestone[];
  auto_escalation_triggers: AutoEscalationTrigger[];
}

export interface TimeDecisionPoint {
  deadline: Date;
  decision_required: string;
  authority_level: PermissionLevel;
  auto_decision?: string;
}

export interface CriticalMilestone {
  name: string;
  deadline: Date;
  dependencies: string[];
  failure_impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contingency_plan?: string;
}

export interface AutoEscalationTrigger {
  condition: string;
  trigger_time: Date;
  escalate_to: PermissionLevel;
  notification_list: string[];
  auto_action?: string;
}

export interface PostActionReport {
  report_id: string;
  completed_at: Date;
  completed_by: string;
  incident_summary: string;
  response_timeline: ResponseTimelineEntry[];
  effectiveness_assessment: EffectivenessAssessment;
  lessons_learned: string[];
  improvement_recommendations: string[];
  resource_utilization: ResourceUtilization;
  compliance_check: ComplianceCheck;
  stakeholder_feedback: StakeholderFeedback[];
}

export interface ResponseTimelineEntry {
  timestamp: Date;
  action: string;
  responsible_party: string;
  outcome: string;
  duration: number; // 分
}

export interface EffectivenessAssessment {
  overall_rating: number; // 1-10
  response_time_rating: number;
  resource_utilization_rating: number;
  communication_effectiveness: number;
  outcome_achievement: number;
  areas_of_excellence: string[];
  areas_for_improvement: string[];
}

export interface ResourceUtilization {
  personnel_hours: number;
  financial_cost: number;
  equipment_used: string[];
  external_resources: string[];
  efficiency_rating: number; // 1-10
}

export interface ComplianceCheck {
  regulatory_compliance: boolean;
  policy_compliance: boolean;
  procedural_compliance: boolean;
  documentation_completeness: boolean;
  audit_trail_integrity: boolean;
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  type: string;
  description: string;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  corrective_action: string;
  responsible_party: string;
}

export interface StakeholderFeedback {
  stakeholder: string;
  role: string;
  feedback: string;
  rating: number; // 1-10
  suggestions: string[];
}

// 緊急選定テンプレート
export interface EmergencyTemplate {
  id: string;
  name: string;
  emergency_type: EmergencyType;
  description: string;
  pre_configured_team: PreConfiguredTeam;
  response_procedures: ResponseProcedure[];
  resource_requirements: TemplateResourceRequirement[];
  communication_templates: CommunicationTemplate[];
  decision_tree: DecisionTreeNode[];
  last_updated: Date;
  usage_count: number;
  effectiveness_score: number; // 1-10
}

export interface PreConfiguredTeam {
  command_structure: { [role in keyof CommandStructure]: string };
  core_members: { role: EmergencyRole; preferred_users: string[]; minimum_required: number }[];
  support_roles: { role: string; skills_required: string[]; count: number }[];
  external_contacts: string[];
}

export interface ResponseProcedure {
  step: number;
  action: string;
  responsible_role: EmergencyRole;
  time_limit: number; // 分
  dependencies: number[]; // 前提となるステップ
  resources_needed: string[];
  decision_points: string[];
}

export interface TemplateResourceRequirement {
  type: 'PERSONNEL' | 'EQUIPMENT' | 'FACILITY' | 'INFORMATION' | 'EXTERNAL';
  description: string;
  quantity: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  availability_check: boolean;
}

export interface CommunicationTemplate {
  type: 'INITIAL_ALERT' | 'STATUS_UPDATE' | 'ESCALATION' | 'RESOLUTION' | 'POST_ACTION';
  audience: string[];
  channel: string;
  template: string;
  approval_required: boolean;
}

export interface DecisionTreeNode {
  id: string;
  condition: string;
  decision_required: string;
  authority_level: PermissionLevel;
  time_limit: number; // 分
  yes_action: string;
  no_action: string;
  escalation_path?: string;
}

// 緊急選定結果
export interface EmergencySelectionResult extends SelectionResult {
  emergency_team?: EmergencySelection;
  response_time: number; // 選定完了までの時間（秒）
  team_readiness: TeamReadinessAssessment;
  immediate_actions: ImmediateAction[];
  risk_mitigation: EmergencyRiskMitigation[];
}

export interface TeamReadinessAssessment {
  overall_readiness: number; // 0-100%
  availability_score: number;
  capability_score: number;
  response_time_estimate: number; // 分
  potential_gaps: string[];
  mitigation_strategies: string[];
}

export interface ImmediateAction {
  action: string;
  responsible: string;
  deadline: Date;
  priority: 'IMMEDIATE' | 'URGENT' | 'HIGH' | 'MEDIUM';
  resources_required: string[];
}

export interface EmergencyRiskMitigation {
  risk: string;
  mitigation: string;
  responsible: string;
  timeline: string;
  backup_plan: string;
}

/**
 * EmergencyMemberSelectionService
 * Phase 4: 緊急オーバーライド選定機能
 */
export class EmergencyMemberSelectionService extends AIAssistedMemberSelectionService {
  private emergencySelections: Map<string, EmergencySelection> = new Map();
  private emergencyTemplates: Map<string, EmergencyTemplate> = new Map();
  private activeIncidents: Map<string, EmergencyContext> = new Map();

  constructor() {
    super();
    this.initializeEmergencyTemplates();
  }

  /**
   * 緊急選定プロセスの実行 (Level 7権限)
   */
  async executeEmergencySelection(
    projectId: string,
    executiveId: string,
    emergencyType: EmergencyType,
    urgencyLevel: UrgencyLevel,
    context: EmergencyContext
  ): Promise<EmergencySelectionResult> {
    const startTime = Date.now();

    try {
      // Level 7権限の検証
      const authCheck = await this.validateEmergencyAuthority(executiveId);
      if (!authCheck.hasPermission) {
        return {
          success: false,
          errors: [`緊急権限がありません: ${authCheck.reason}`],
          response_time: (Date.now() - startTime) / 1000,
          team_readiness: this.getEmptyReadinessAssessment(),
          immediate_actions: [],
          risk_mitigation: []
        };
      }

      // 緊急テンプレートの選択
      const template = await this.selectEmergencyTemplate(emergencyType, urgencyLevel, context);
      
      // 即座チーム編成
      const responseTeam = await this.assembleEmergencyTeam(
        template,
        context,
        urgencyLevel
      );

      // 緊急選定レコードの作成
      const emergencySelection = await this.createEmergencySelection(
        projectId,
        executiveId,
        emergencyType,
        urgencyLevel,
        context,
        responseTeam,
        template
      );

      // 自動エスカレーション設定
      await this.setupAutoEscalation(emergencySelection);

      // 即時通知の送信
      await this.sendEmergencyNotifications(emergencySelection);

      // 監査ログの記録
      await this.logEmergencyAction(emergencySelection, executiveId);

      this.emergencySelections.set(emergencySelection.id, emergencySelection);
      this.activeIncidents.set(context.incidentId, context);

      const responseTime = (Date.now() - startTime) / 1000;
      const teamReadiness = await this.assessTeamReadiness(responseTeam);
      const immediateActions = this.generateImmediateActions(emergencySelection);
      const riskMitigation = await this.generateRiskMitigation(emergencySelection);

      return {
        success: true,
        emergency_team: emergencySelection,
        response_time: responseTime,
        team_readiness: teamReadiness,
        immediate_actions: immediateActions,
        risk_mitigation: riskMitigation,
        recommendations: [
          `緊急チーム編成完了 (${responseTime.toFixed(1)}秒)`,
          `対応チーム準備度: ${teamReadiness.overall_readiness}%`,
          `推定対応開始: ${teamReadiness.response_time_estimate}分後`
        ]
      };

    } catch (error) {
      return {
        success: false,
        errors: [`緊急選定エラー: ${error}`],
        response_time: (Date.now() - startTime) / 1000,
        team_readiness: this.getEmptyReadinessAssessment(),
        immediate_actions: [],
        risk_mitigation: []
      };
    }
  }

  /**
   * 緊急テンプレートによるワンクリック編成
   */
  async oneClickTeamAssembly(
    templateId: string,
    executiveId: string,
    context: EmergencyContext
  ): Promise<EmergencySelectionResult> {
    const template = this.emergencyTemplates.get(templateId);
    if (!template) {
      return {
        success: false,
        errors: ['指定されたテンプレートが見つかりません'],
        response_time: 0,
        team_readiness: this.getEmptyReadinessAssessment(),
        immediate_actions: [],
        risk_mitigation: []
      };
    }

    return this.executeEmergencySelection(
      `emergency_${Date.now()}`,
      executiveId,
      template.emergency_type,
      'CRITICAL',
      context
    );
  }

  /**
   * 進行中緊急事態のチーム調整
   */
  async adjustEmergencyTeam(
    emergencyId: string,
    adjustments: EmergencyTeamAdjustment[],
    executiveId: string
  ): Promise<EmergencySelectionResult> {
    const emergency = this.emergencySelections.get(emergencyId);
    if (!emergency) {
      return {
        success: false,
        errors: ['緊急事態が見つかりません'],
        response_time: 0,
        team_readiness: this.getEmptyReadinessAssessment(),
        immediate_actions: [],
        risk_mitigation: []
      };
    }

    // 調整の実行
    for (const adjustment of adjustments) {
      await this.executeTeamAdjustment(emergency, adjustment, executiveId);
    }

    // 調整後の準備度評価
    const updatedReadiness = await this.assessTeamReadiness(emergency.responseTeam);

    return {
      success: true,
      emergency_team: emergency,
      response_time: 0,
      team_readiness: updatedReadiness,
      immediate_actions: [],
      risk_mitigation: []
    };
  }

  /**
   * 緊急権限の検証
   */
  private async validateEmergencyAuthority(
    executiveId: string
  ): Promise<{ hasPermission: boolean; reason?: string }> {
    const executive = await this.getUser(executiveId);
    if (!executive) {
      return { hasPermission: false, reason: 'ユーザーが見つかりません' };
    }

    // Level 7以上の権限が必要
    if (executive.permissionLevel < PermissionLevel.LEVEL_7) {
      return { 
        hasPermission: false, 
        reason: 'Level 7以上の緊急権限が必要です（役員・法人本部事務局長）' 
      };
    }

    return { hasPermission: true };
  }

  /**
   * 緊急テンプレートの選択
   */
  private async selectEmergencyTemplate(
    emergencyType: EmergencyType,
    urgencyLevel: UrgencyLevel,
    context: EmergencyContext
  ): Promise<EmergencyTemplate> {
    // 緊急事態の種類に応じた最適テンプレートを選択
    const candidates = Array.from(this.emergencyTemplates.values())
      .filter(template => template.emergency_type === emergencyType)
      .sort((a, b) => b.effectiveness_score - a.effectiveness_score);

    if (candidates.length > 0) {
      return candidates[0];
    }

    // デフォルトテンプレートを返す
    return this.getDefaultEmergencyTemplate(emergencyType);
  }

  /**
   * 緊急チームの編成
   */
  private async assembleEmergencyTeam(
    template: EmergencyTemplate,
    context: EmergencyContext,
    urgencyLevel: UrgencyLevel
  ): Promise<CrisisResponseTeam> {
    // 指揮構造の設定
    const commandStructure = await this.assignCommandStructure(
      template.pre_configured_team.command_structure,
      urgencyLevel
    );

    // コアチームの編成
    const coreTeam = await this.assembleCoreTeam(
      template.pre_configured_team.core_members,
      context,
      urgencyLevel
    );

    // サポートチームの編成
    const supportTeam = await this.assembleSupportTeam(
      template.pre_configured_team.support_roles,
      context
    );

    // 外部連絡先の設定
    const externalContacts = await this.setupExternalContacts(
      template.pre_configured_team.external_contacts,
      context
    );

    // 通信プロトコルの設定
    const communicationProtocol = this.setupCommunicationProtocol(
      template.communication_templates
    );

    // 意思決定マトリックスの設定
    const decisionMatrix = this.setupDecisionMatrix(template.decision_tree);

    return {
      commandStructure,
      coreTeam,
      supportTeam,
      externalContacts,
      communicationProtocol,
      decisionMatrix
    };
  }

  /**
   * 緊急選定レコードの作成
   */
  private async createEmergencySelection(
    projectId: string,
    executiveId: string,
    emergencyType: EmergencyType,
    urgencyLevel: UrgencyLevel,
    context: EmergencyContext,
    responseTeam: CrisisResponseTeam,
    template: EmergencyTemplate
  ): Promise<EmergencySelection> {
    const id = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // メンバー割り当ての作成
    const selectedMembers: MemberAssignment[] = [];

    // コマンド構造から必須メンバーを追加
    Object.entries(responseTeam.commandStructure).forEach(([role, userId]) => {
      if (userId && userId !== '') {
        selectedMembers.push({
          userId,
          role: 'PROJECT_LEADER',
          isRequired: true,
          assignmentReason: `緊急時${role}として指名`,
          responsibility: role
        });
      }
    });

    // コアチームメンバーを追加
    responseTeam.coreTeam.forEach(member => {
      selectedMembers.push({
        userId: member.userId,
        role: 'SPECIALIST',
        isRequired: true,
        assignmentReason: `緊急対応${member.emergencyRole}として選出`,
        responsibility: member.emergencyRole
      });
    });

    // サポートチームメンバーを追加
    responseTeam.supportTeam.forEach(member => {
      selectedMembers.push({
        userId: member.userId,
        role: 'TEAM_MEMBER',
        isRequired: false,
        assignmentReason: `緊急支援${member.emergencyRole}として選出`,
        responsibility: member.emergencyRole
      });
    });

    // 時間制約の設定
    const timeConstraints: TimeConstraints = {
      response_deadline: new Date(now.getTime() + context.timeWindow * 60 * 1000),
      decision_points: [
        {
          deadline: new Date(now.getTime() + 15 * 60 * 1000), // 15分後
          decision_required: '初期対応方針の決定',
          authority_level: PermissionLevel.LEVEL_7
        }
      ],
      critical_milestones: [
        {
          name: 'チーム集結完了',
          deadline: new Date(now.getTime() + 60 * 60 * 1000), // 1時間後
          dependencies: ['メンバー通知'],
          failure_impact: 'CRITICAL'
        }
      ],
      auto_escalation_triggers: [
        {
          condition: '初期対応開始遅延',
          trigger_time: new Date(now.getTime() + 30 * 60 * 1000), // 30分後
          escalate_to: PermissionLevel.LEVEL_8,
          notification_list: [executiveId]
        }
      ]
    };

    // 権限オーバーライドの記録
    const authorityOverride: AuthorityOverride = {
      override_type: 'PERSONNEL',
      authorized_by: executiveId,
      authorization_level: PermissionLevel.LEVEL_7,
      justification: `${emergencyType}緊急事態への対応`,
      scope: ['通常選定プロセスの迂回', '即時メンバー召集'],
      reporting_requirement: '48時間以内に事後報告書提出',
      approval_chain_bypassed: ['Level 2-6 承認プロセス']
    };

    return {
      id,
      projectId,
      selectorId: executiveId,
      selectionType: 'EMERGENCY',
      selectedMembers,
      selectionReason: `緊急事態対応: ${context.description}`,
      createdAt: now,
      updatedAt: now,
      status: 'ACTIVE',
      emergencyType,
      urgencyLevel,
      emergencyContext: context,
      responseTeam,
      escalationChain: [],
      authorityOverride,
      timeConstraints
    };
  }

  /**
   * 自動エスカレーション設定
   */
  private async setupAutoEscalation(emergency: EmergencySelection): Promise<void> {
    emergency.timeConstraints.auto_escalation_triggers.forEach(trigger => {
      // 実際の実装では、タイマーやジョブキューを使用してエスカレーションをスケジュール
      console.log(`自動エスカレーション設定: ${trigger.condition} at ${trigger.trigger_time}`);
    });
  }

  /**
   * 緊急通知の送信
   */
  private async sendEmergencyNotifications(emergency: EmergencySelection): Promise<void> {
    const notifications = [];

    // チームメンバーへの緊急召集通知
    emergency.selectedMembers.forEach(member => {
      notifications.push({
        recipient: member.userId,
        type: 'EMERGENCY_MOBILIZATION',
        urgency: emergency.urgencyLevel,
        message: this.generateEmergencyNotificationMessage(emergency, member)
      });
    });

    // 上位管理者への状況報告
    notifications.push({
      recipient: 'LEVEL_8_EXECUTIVES',
      type: 'EMERGENCY_DECLARED',
      urgency: 'HIGH',
      message: this.generateExecutiveNotificationMessage(emergency)
    });

    // 実際の実装では、通知サービスを使用して送信
    console.log(`${notifications.length}件の緊急通知を送信`);
  }

  /**
   * 緊急行動の監査ログ記録
   */
  private async logEmergencyAction(
    emergency: EmergencySelection,
    executiveId: string
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      action: 'EMERGENCY_SELECTION_EXECUTED',
      actor: executiveId,
      emergency_type: emergency.emergencyType,
      urgency_level: emergency.urgencyLevel,
      team_size: emergency.selectedMembers.length,
      authority_override: emergency.authorityOverride,
      incident_id: emergency.emergencyContext.incidentId,
      checksum: this.calculateLogChecksum(emergency)
    };

    // 実際の実装では、改ざん防止機能付きログシステムに記録
    console.log('緊急行動監査ログ:', logEntry);
  }

  /**
   * チーム準備度の評価
   */
  private async assessTeamReadiness(team: CrisisResponseTeam): Promise<TeamReadinessAssessment> {
    let totalAvailability = 0;
    let totalCapability = 0;
    let maxResponseTime = 0;
    const gaps: string[] = [];

    const allMembers = [...team.coreTeam, ...team.supportTeam];

    for (const member of allMembers) {
      // 可用性評価
      const availabilityScore = member.availability.current_status === 'AVAILABLE' ? 100 :
                               member.availability.current_status === 'BUSY' ? 60 :
                               member.availability.current_status === 'OFF_DUTY' ? 30 : 0;
      totalAvailability += availabilityScore;

      // 能力評価
      const capabilityScore = member.expertise.reduce((sum, exp) => {
        const levelScore = exp.level === 'EXPERT' ? 100 : 
                          exp.level === 'ADVANCED' ? 80 :
                          exp.level === 'INTERMEDIATE' ? 60 : 40;
        return sum + levelScore;
      }, 0) / member.expertise.length;
      totalCapability += capabilityScore;

      // 応答時間
      maxResponseTime = Math.max(maxResponseTime, member.availability.estimated_response_time);

      // ギャップの特定
      if (!member.availability.immediate_response) {
        gaps.push(`${member.emergencyRole}: 即座対応不可`);
      }
    }

    const averageAvailability = allMembers.length > 0 ? totalAvailability / allMembers.length : 0;
    const averageCapability = allMembers.length > 0 ? totalCapability / allMembers.length : 0;
    const overallReadiness = (averageAvailability + averageCapability) / 2;

    return {
      overall_readiness: Math.round(overallReadiness),
      availability_score: Math.round(averageAvailability),
      capability_score: Math.round(averageCapability),
      response_time_estimate: maxResponseTime,
      potential_gaps: gaps,
      mitigation_strategies: this.generateMitigationStrategies(gaps)
    };
  }

  /**
   * 緊急テンプレートの初期化
   */
  private initializeEmergencyTemplates(): void {
    // デフォルト緊急テンプレートの設定
    const templates: EmergencyTemplate[] = [
      {
        id: 'natural_disaster_response',
        name: '自然災害対応チーム',
        emergency_type: 'NATURAL_DISASTER',
        description: '地震、台風、洪水等の自然災害への対応',
        pre_configured_team: {
          command_structure: {
            incidentCommander: 'executive_001',
            operationsChief: 'manager_001',
            planningChief: 'manager_002',
            logisticsChief: 'manager_003'
          },
          core_members: [
            { role: 'SAFETY_OFFICER', preferred_users: ['safety_001', 'safety_002'], minimum_required: 1 },
            { role: 'MEDICAL_COORDINATOR', preferred_users: ['medical_001'], minimum_required: 1 },
            { role: 'COMMUNICATIONS_LEAD', preferred_users: ['comm_001'], minimum_required: 1 }
          ],
          support_roles: [
            { role: '施設点検', skills_required: ['設備管理'], count: 3 },
            { role: '避難誘導', skills_required: ['患者対応'], count: 5 }
          ],
          external_contacts: ['fire_department', 'police', 'city_hall']
        },
        response_procedures: [
          {
            step: 1,
            action: '安全確認と被害状況の把握',
            responsible_role: 'SAFETY_OFFICER',
            time_limit: 15,
            dependencies: [],
            resources_needed: ['通信機器', '点検チェックリスト'],
            decision_points: ['避難の必要性判断']
          }
        ],
        resource_requirements: [
          {
            type: 'EQUIPMENT',
            description: '緊急通信機器',
            quantity: 10,
            priority: 'CRITICAL',
            source: '設備管理',
            availability_check: true
          }
        ],
        communication_templates: [
          {
            type: 'INITIAL_ALERT',
            audience: ['全職員'],
            channel: '院内放送',
            template: '緊急事態発生。指示があるまで現在位置で待機してください。',
            approval_required: false
          }
        ],
        decision_tree: [
          {
            id: 'evacuation_decision',
            condition: '建物の安全性に問題がある',
            decision_required: '避難実施の判断',
            authority_level: PermissionLevel.LEVEL_7,
            time_limit: 10,
            yes_action: '避難プロトコル開始',
            no_action: '現地での安全確保',
            escalation_path: 'Level 8エスカレーション'
          }
        ],
        last_updated: new Date(),
        usage_count: 0,
        effectiveness_score: 8.5
      },
      // 他のテンプレートも同様に定義...
    ];

    templates.forEach(template => {
      this.emergencyTemplates.set(template.id, template);
    });
  }

  // ヘルパーメソッド
  private getDefaultEmergencyTemplate(emergencyType: EmergencyType): EmergencyTemplate {
    return {
      id: 'default_emergency',
      name: 'デフォルト緊急対応',
      emergency_type: emergencyType,
      description: '基本的な緊急対応テンプレート',
      pre_configured_team: {
        command_structure: {
          incidentCommander: '',
          operationsChief: '',
          planningChief: '',
          logisticsChief: ''
        },
        core_members: [],
        support_roles: [],
        external_contacts: []
      },
      response_procedures: [],
      resource_requirements: [],
      communication_templates: [],
      decision_tree: [],
      last_updated: new Date(),
      usage_count: 0,
      effectiveness_score: 5.0
    };
  }

  private async assignCommandStructure(
    structure: any,
    urgencyLevel: UrgencyLevel
  ): Promise<CommandStructure> {
    // 実際の実装では、可用性と能力に基づいて最適な人材を割り当て
    return {
      incidentCommander: structure.incidentCommander || 'default_commander',
      operationsChief: structure.operationsChief || 'default_operations',
      planningChief: structure.planningChief || 'default_planning',
      logisticsChief: structure.logisticsChief || 'default_logistics'
    };
  }

  private async assembleCoreTeam(
    coreRoles: any[],
    context: EmergencyContext,
    urgencyLevel: UrgencyLevel
  ): Promise<CrisisTeamMember[]> {
    const team: CrisisTeamMember[] = [];

    for (const role of coreRoles) {
      // 各役割に最適な人材を選出
      const member = await this.selectBestMemberForRole(role, urgencyLevel);
      if (member) {
        team.push(member);
      }
    }

    return team;
  }

  private async assembleSupportTeam(
    supportRoles: any[],
    context: EmergencyContext
  ): Promise<CrisisTeamMember[]> {
    // サポートチームの編成
    return [];
  }

  private async setupExternalContacts(
    contactIds: string[],
    context: EmergencyContext
  ): Promise<ExternalContact[]> {
    // 外部連絡先の設定
    return [];
  }

  private setupCommunicationProtocol(
    templates: CommunicationTemplate[]
  ): CommunicationProtocol {
    return {
      primary_channel: '院内システム',
      backup_channels: ['電話', 'メール'],
      update_frequency: 15,
      notification_matrix: [],
      escalation_triggers: []
    };
  }

  private setupDecisionMatrix(decisionTree: DecisionTreeNode[]): DecisionMatrix[] {
    return decisionTree.map(node => ({
      scenario: node.condition,
      decision_points: [{
        condition: node.condition,
        action: node.yes_action,
        resources_required: [],
        approval_required: node.authority_level >= PermissionLevel.LEVEL_7,
        documentation_required: true
      }],
      authority_required: node.authority_level,
      time_limit: node.time_limit,
      default_action: node.no_action
    }));
  }

  private async selectBestMemberForRole(
    role: any,
    urgencyLevel: UrgencyLevel
  ): Promise<CrisisTeamMember | null> {
    // 実際の実装では、データベースから最適な人材を検索
    return {
      userId: role.preferred_users[0] || 'default_user',
      emergencyRole: role.role,
      responseCapability: {
        immediate_response: true,
        on_call_availability: true,
        remote_capability: false,
        specialized_equipment: [],
        clearance_level: 5,
        language_skills: ['日本語']
      },
      contactInfo: {
        primary_phone: '000-0000-0000',
        emergency_email: 'emergency@example.com',
        next_of_kin: '緊急連絡先',
        alternative_contact: '代替連絡先'
      },
      availability: {
        current_status: 'AVAILABLE',
        location: '施設内',
        estimated_response_time: 5,
        transportation_method: '徒歩',
        current_workload: 20,
        constraints: []
      },
      expertise: [
        {
          domain: role.role,
          level: 'ADVANCED',
          certifications: [],
          recent_experience: true,
          leadership_experience: true
        }
      ],
      authorityLevel: 5
    };
  }

  private getEmptyReadinessAssessment(): TeamReadinessAssessment {
    return {
      overall_readiness: 0,
      availability_score: 0,
      capability_score: 0,
      response_time_estimate: 0,
      potential_gaps: [],
      mitigation_strategies: []
    };
  }

  private generateImmediateActions(emergency: EmergencySelection): ImmediateAction[] {
    return [
      {
        action: 'チームメンバーへの緊急召集',
        responsible: emergency.responseTeam.commandStructure.incidentCommander,
        deadline: new Date(Date.now() + 15 * 60 * 1000),
        priority: 'IMMEDIATE',
        resources_required: ['通信手段']
      },
      {
        action: '状況把握と初期評価',
        responsible: emergency.responseTeam.commandStructure.operationsChief,
        deadline: new Date(Date.now() + 30 * 60 * 1000),
        priority: 'URGENT',
        resources_required: ['現地調査', '報告書']
      }
    ];
  }

  private async generateRiskMitigation(emergency: EmergencySelection): Promise<EmergencyRiskMitigation[]> {
    return [
      {
        risk: 'メンバー不足',
        mitigation: '代替要員の確保と外部応援の要請',
        responsible: emergency.responseTeam.commandStructure.logisticsChief,
        timeline: '2時間以内',
        backup_plan: '他施設からの応援要請'
      }
    ];
  }

  private generateMitigationStrategies(gaps: string[]): string[] {
    return gaps.map(gap => {
      if (gap.includes('即座対応不可')) {
        return '代替要員の確保または遠隔対応手段の準備';
      }
      return '要員の追加確保';
    });
  }

  private generateEmergencyNotificationMessage(
    emergency: EmergencySelection,
    member: MemberAssignment
  ): string {
    return `【緊急召集】${emergency.emergencyType}により、${member.responsibility}として緊急参集してください。` +
           `対応期限: ${emergency.timeConstraints.response_deadline.toLocaleString()}`;
  }

  private generateExecutiveNotificationMessage(emergency: EmergencySelection): string {
    return `【緊急事態発生】${emergency.emergencyType}が発生し、Level 7権限による緊急チーム編成を実施しました。` +
           `チーム規模: ${emergency.selectedMembers.length}名`;
  }

  private calculateLogChecksum(emergency: EmergencySelection): string {
    // 実際の実装では、SHA-256等を使用してチェックサムを計算
    return `checksum_${emergency.id}_${Date.now()}`;
  }

  private async executeTeamAdjustment(
    emergency: EmergencySelection,
    adjustment: EmergencyTeamAdjustment,
    executiveId: string
  ): Promise<void> {
    // チーム調整の実行
    console.log('チーム調整実行:', adjustment);
  }
}

// 追加の型定義
interface EmergencyTeamAdjustment {
  type: 'ADD_MEMBER' | 'REMOVE_MEMBER' | 'CHANGE_ROLE' | 'REASSIGN_RESPONSIBILITY';
  memberId?: string;
  newRole?: EmergencyRole;
  justification: string;
}

export default EmergencyMemberSelectionService;