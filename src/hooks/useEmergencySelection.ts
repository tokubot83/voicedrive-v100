// useEmergencySelection Hook - 緊急・戦略的オーバーライド選定機能のReactフック
// Phase 4: Level 7-8による緊急権限・戦略的変革メンバー選定

import { useState, useEffect, useCallback } from 'react';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import {
  EmergencyType,
  UrgencyLevel,
  EmergencyContext,
  EmergencySelectionResult,
  EmergencyTemplate,
  CrisisResponseTeam,
  TeamReadinessAssessment
} from '../services/EmergencyMemberSelectionService';
import {
  StrategicObjective,
  TransformationScope,
  StrategicSelectionResult,
  TransformationReadiness,
  ExecutiveAlignment
} from '../services/StrategicOverrideService';
import EmergencyMemberSelectionService from '../services/EmergencyMemberSelectionService';
import StrategicOverrideService from '../services/StrategicOverrideService';

interface UseEmergencySelectionProps {
  projectId: string;
  executiveId: string;
  permissionLevel: PermissionLevel;
}

interface UseEmergencySelectionReturn {
  // 緊急権限 (Level 7)
  emergencyCapability: EmergencyCapability;
  emergencyTemplates: EmergencyTemplate[];
  activeEmergencies: EmergencyContext[];
  
  // 戦略権限 (Level 8)
  strategicCapability: StrategicCapability;
  transformationReadiness: TransformationReadiness | null;
  executiveAlignment: ExecutiveAlignment | null;
  
  // 共通状態
  loading: boolean;
  error: string | null;
  auditLog: OverrideAuditEntry[];
  
  // 緊急選定アクション
  executeEmergencyResponse: (
    emergencyType: EmergencyType,
    urgencyLevel: UrgencyLevel,
    context: EmergencyContext
  ) => Promise<EmergencySelectionResult>;
  
  useEmergencyTemplate: (templateId: string, context: EmergencyContext) => Promise<EmergencySelectionResult>;
  
  adjustEmergencyTeam: (
    emergencyId: string,
    adjustments: EmergencyTeamAdjustment[]
  ) => Promise<EmergencySelectionResult>;
  
  // 戦略選定アクション
  executeStrategicTransformation: (
    objective: StrategicObjective,
    scope: TransformationScope
  ) => Promise<StrategicSelectionResult>;
  
  assessTransformationReadiness: (objective: StrategicObjective) => Promise<TransformationReadiness>;
  
  // 監査・報告
  generatePostActionReport: (selectionId: string) => Promise<PostActionReport>;
  exportAuditTrail: (dateRange?: { start: Date; end: Date }) => Promise<AuditExport>;
  
  // 通知・エスカレーション
  sendEmergencyNotifications: (team: CrisisResponseTeam) => Promise<void>;
  triggerAutoEscalation: (scenario: EscalationScenario) => Promise<void>;
  
  // ユーティリティ
  validateOverrideAuthority: (action: OverrideAction) => boolean;
  calculateResponseTime: (startTime: Date, endTime: Date) => ResponseTimeMetrics;
  getOverrideUsageStatistics: () => OverrideUsageStats;
}

// 緊急権限機能
interface EmergencyCapability {
  hasEmergencyAuthority: boolean;
  authorizedEmergencyTypes: EmergencyType[];
  maxTeamSize: number;
  escalationRequired: boolean;
  reportingDeadline: number; // 時間
  overrideScope: OverrideScope[];
}

// 戦略権限機能
interface StrategicCapability {
  hasStrategicAuthority: boolean;
  unlimitedBudgetAccess: boolean;
  organizationWideScope: boolean;
  boardApprovalRequired: boolean;
  changeManagementRequired: boolean;
  stakeholderNotificationRequired: boolean;
}

// 監査エントリ
interface OverrideAuditEntry {
  id: string;
  timestamp: Date;
  action: OverrideAction;
  executiveId: string;
  permissionLevel: PermissionLevel;
  justification: string;
  scope: OverrideScope[];
  resourcesUsed: ResourceUsage[];
  outcome: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
  reportSubmitted: boolean;
  reviewStatus: 'PENDING' | 'APPROVED' | 'UNDER_REVIEW' | 'FLAGGED';
}

type OverrideAction = 
  | 'EMERGENCY_TEAM_FORMATION'
  | 'STRATEGIC_TRANSFORMATION'
  | 'CRISIS_ESCALATION'
  | 'ORGANIZATIONAL_RESTRUCTURE'
  | 'BUDGET_OVERRIDE'
  | 'POLICY_OVERRIDE'
  | 'SYSTEM_OVERRIDE';

type OverrideScope = 
  | 'PERSONNEL_ASSIGNMENT'
  | 'BUDGET_ALLOCATION'
  | 'PROCESS_BYPASS'
  | 'POLICY_EXCEPTION'
  | 'EXTERNAL_COMMUNICATION'
  | 'REGULATORY_COORDINATION';

interface ResourceUsage {
  type: 'FINANCIAL' | 'PERSONNEL' | 'EQUIPMENT' | 'EXTERNAL';
  amount: number;
  unit: string;
  justification: string;
}

interface EmergencyTeamAdjustment {
  type: 'ADD_MEMBER' | 'REMOVE_MEMBER' | 'CHANGE_ROLE' | 'REASSIGN_AUTHORITY';
  memberId?: string;
  newRole?: string;
  justification: string;
  urgencyLevel: UrgencyLevel;
}

interface PostActionReport {
  reportId: string;
  incidentId: string;
  executiveId: string;
  reportType: 'EMERGENCY' | 'STRATEGIC';
  completedAt: Date;
  summary: ActionSummary;
  effectiveness: EffectivenessAssessment;
  lessons: LessonsLearned;
  recommendations: Recommendation[];
  compliance: ComplianceAssessment;
}

interface ActionSummary {
  objective: string;
  duration: number; // 分
  teamSize: number;
  resourcesUtilized: ResourceUsage[];
  keyMilestones: Milestone[];
  challengesFaced: string[];
}

interface EffectivenessAssessment {
  overallRating: number; // 1-10
  responseTime: number; // 分
  resourceEfficiency: number; // 1-10
  stakeholderSatisfaction: number; // 1-10
  objectiveAchievement: number; // パーセント
  improvementAreas: string[];
}

interface LessonsLearned {
  whatWorkedWell: string[];
  whatDidntWork: string[];
  unexpectedChallenges: string[];
  keyInsights: string[];
  processImprovements: string[];
}

interface Recommendation {
  category: 'PROCESS' | 'TRAINING' | 'RESOURCES' | 'TECHNOLOGY' | 'POLICY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  implementationTimeline: string;
  expectedBenefit: string;
  resourceRequirements: string[];
}

interface ComplianceAssessment {
  regulatoryCompliance: boolean;
  policyCompliance: boolean;
  auditTrailComplete: boolean;
  reportingRequirementsMet: boolean;
  violations: ComplianceViolation[];
  correctiveActions: CorrectiveAction[];
}

interface ComplianceViolation {
  type: string;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  description: string;
  impact: string;
  discoveryMethod: string;
}

interface CorrectiveAction {
  violation: string;
  action: string;
  responsible: string;
  deadline: Date;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

interface Milestone {
  name: string;
  targetTime: Date;
  actualTime: Date;
  achieved: boolean;
  variance: number; // 分
}

interface AuditExport {
  exportId: string;
  generatedAt: Date;
  dateRange: { start: Date; end: Date };
  executiveId: string;
  entries: OverrideAuditEntry[];
  summary: AuditSummary;
  integrity: IntegrityCheck;
}

interface AuditSummary {
  totalOverrides: number;
  emergencyOverrides: number;
  strategicOverrides: number;
  successRate: number;
  averageResponseTime: number;
  complianceRate: number;
  flaggedActions: number;
}

interface IntegrityCheck {
  checksumValid: boolean;
  tamperedEntries: string[];
  missingEntries: string[];
  integrityScore: number; // 0-100
}

interface EscalationScenario {
  trigger: string;
  condition: string;
  escalateTo: PermissionLevel;
  timeline: number; // 分
  notificationList: string[];
  autoAction?: string;
}

interface ResponseTimeMetrics {
  decisionTime: number; // 分
  mobilizationTime: number; // 分
  firstResponseTime: number; // 分
  totalResponseTime: number; // 分
  efficiency: number; // 0-100
  benchmark: number; // 分
}

interface OverrideUsageStats {
  totalUsage: number;
  emergencyUsage: number;
  strategicUsage: number;
  successRate: number;
  averageTeamSize: number;
  mostCommonTypes: string[];
  seasonalTrends: SeasonalTrend[];
}

interface SeasonalTrend {
  period: string;
  usage: number;
  types: string[];
  effectiveness: number;
}

/**
 * 緊急・戦略的オーバーライド選定機能のカスタムフック
 */
export const useEmergencySelection = ({
  projectId,
  executiveId,
  permissionLevel
}: UseEmergencySelectionProps): UseEmergencySelectionReturn => {
  
  // 基本状態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<OverrideAuditEntry[]>([]);
  
  // 緊急関連状態
  const [emergencyTemplates, setEmergencyTemplates] = useState<EmergencyTemplate[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyContext[]>([]);
  const [emergencyCapability, setEmergencyCapability] = useState<EmergencyCapability>({
    hasEmergencyAuthority: false,
    authorizedEmergencyTypes: [],
    maxTeamSize: 0,
    escalationRequired: false,
    reportingDeadline: 0,
    overrideScope: []
  });
  
  // 戦略関連状態
  const [strategicCapability, setStrategicCapability] = useState<StrategicCapability>({
    hasStrategicAuthority: false,
    unlimitedBudgetAccess: false,
    organizationWideScope: false,
    boardApprovalRequired: false,
    changeManagementRequired: false,
    stakeholderNotificationRequired: false
  });
  const [transformationReadiness, setTransformationReadiness] = useState<TransformationReadiness | null>(null);
  const [executiveAlignment, setExecutiveAlignment] = useState<ExecutiveAlignment | null>(null);
  
  // サービス
  const emergencyService = new EmergencyMemberSelectionService();
  const strategicService = new StrategicOverrideService();

  // 初期化
  useEffect(() => {
    initializeOverrideCapabilities();
    loadEmergencyTemplates();
    loadAuditLog();
  }, [permissionLevel]);

  /**
   * オーバーライド権限の初期化
   */
  const initializeOverrideCapabilities = async () => {
    // Level 7緊急権限の設定
    if (permissionLevel >= PermissionLevel.LEVEL_7) {
      setEmergencyCapability({
        hasEmergencyAuthority: true,
        authorizedEmergencyTypes: [
          'NATURAL_DISASTER',
          'FACILITY_ACCIDENT',
          'MEDICAL_EMERGENCY',
          'SYSTEM_FAILURE',
          'SECURITY_BREACH',
          'STAFFING_CRISIS'
        ],
        maxTeamSize: 50,
        escalationRequired: false,
        reportingDeadline: 48, // 48時間以内
        overrideScope: [
          'PERSONNEL_ASSIGNMENT',
          'PROCESS_BYPASS',
          'EXTERNAL_COMMUNICATION'
        ]
      });
    }

    // Level 8戦略権限の設定
    if (permissionLevel >= PermissionLevel.LEVEL_8) {
      setStrategicCapability({
        hasStrategicAuthority: true,
        unlimitedBudgetAccess: true,
        organizationWideScope: true,
        boardApprovalRequired: false, // CEO権限では不要
        changeManagementRequired: true,
        stakeholderNotificationRequired: true
      });
    }
  };

  /**
   * 緊急テンプレートの読み込み
   */
  const loadEmergencyTemplates = async () => {
    // 実装では、データベースから取得
    const templates: EmergencyTemplate[] = [
      // デモテンプレート
    ];
    setEmergencyTemplates(templates);
  };

  /**
   * 監査ログの読み込み
   */
  const loadAuditLog = async () => {
    // 実装では、監査データベースから取得
    const log: OverrideAuditEntry[] = [];
    setAuditLog(log);
  };

  /**
   * 緊急対応の実行
   */
  const executeEmergencyResponse = useCallback(async (
    emergencyType: EmergencyType,
    urgencyLevel: UrgencyLevel,
    context: EmergencyContext
  ): Promise<EmergencySelectionResult> => {
    if (!emergencyCapability.hasEmergencyAuthority) {
      throw new Error('緊急権限がありません');
    }

    if (!emergencyCapability.authorizedEmergencyTypes.includes(emergencyType)) {
      throw new Error('この緊急事態タイプに対する権限がありません');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await emergencyService.executeEmergencySelection(
        projectId,
        executiveId,
        emergencyType,
        urgencyLevel,
        context
      );

      if (result.success) {
        // 監査ログに記録
        await recordOverrideAction({
          action: 'EMERGENCY_TEAM_FORMATION',
          justification: context.description,
          scope: ['PERSONNEL_ASSIGNMENT', 'PROCESS_BYPASS'],
          resourcesUsed: [
            {
              type: 'PERSONNEL',
              amount: result.emergency_team?.selectedMembers.length || 0,
              unit: '名',
              justification: '緊急対応チーム編成'
            }
          ]
        });

        // アクティブな緊急事態リストを更新
        setActiveEmergencies(prev => [...prev, context]);
      }

      return result;

    } catch (err) {
      setError(`緊急対応実行エラー: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [emergencyCapability, projectId, executiveId]);

  /**
   * 緊急テンプレートの使用
   */
  const useEmergencyTemplate = useCallback(async (
    templateId: string,
    context: EmergencyContext
  ): Promise<EmergencySelectionResult> => {
    if (!emergencyCapability.hasEmergencyAuthority) {
      throw new Error('緊急権限がありません');
    }

    setLoading(true);
    try {
      const result = await emergencyService.oneClickTeamAssembly(
        templateId,
        executiveId,
        context
      );

      if (result.success) {
        await recordOverrideAction({
          action: 'EMERGENCY_TEAM_FORMATION',
          justification: `テンプレート${templateId}による緊急対応`,
          scope: ['PERSONNEL_ASSIGNMENT'],
          resourcesUsed: []
        });
      }

      return result;
    } finally {
      setLoading(false);
    }
  }, [emergencyCapability, executiveId]);

  /**
   * 緊急チームの調整
   */
  const adjustEmergencyTeam = useCallback(async (
    emergencyId: string,
    adjustments: EmergencyTeamAdjustment[]
  ): Promise<EmergencySelectionResult> => {
    setLoading(true);
    try {
      const result = await emergencyService.adjustEmergencyTeam(
        emergencyId,
        adjustments,
        executiveId
      );

      if (result.success) {
        await recordOverrideAction({
          action: 'EMERGENCY_TEAM_FORMATION',
          justification: `緊急チーム調整: ${adjustments.length}件`,
          scope: ['PERSONNEL_ASSIGNMENT'],
          resourcesUsed: []
        });
      }

      return result;
    } finally {
      setLoading(false);
    }
  }, [executiveId]);

  /**
   * 戦略的変革の実行
   */
  const executeStrategicTransformation = useCallback(async (
    objective: StrategicObjective,
    scope: TransformationScope
  ): Promise<StrategicSelectionResult> => {
    if (!strategicCapability.hasStrategicAuthority) {
      throw new Error('戦略的権限がありません');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await strategicService.executeStrategicOverride(
        projectId,
        executiveId,
        objective,
        scope
      );

      if (result.success) {
        setTransformationReadiness(result.transformation_readiness);
        setExecutiveAlignment(result.executive_alignment);

        await recordOverrideAction({
          action: 'STRATEGIC_TRANSFORMATION',
          justification: objective.vision,
          scope: [
            'PERSONNEL_ASSIGNMENT',
            'BUDGET_ALLOCATION',
            'PROCESS_BYPASS',
            'POLICY_EXCEPTION'
          ],
          resourcesUsed: [
            {
              type: 'FINANCIAL',
              amount: result.resource_commitment.total_investment,
              unit: '円',
              justification: '戦略的変革投資'
            }
          ]
        });
      }

      return result;

    } catch (err) {
      setError(`戦略的変革実行エラー: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [strategicCapability, projectId, executiveId]);

  /**
   * 変革準備度の評価
   */
  const assessTransformationReadiness = useCallback(async (
    objective: StrategicObjective
  ): Promise<TransformationReadiness> => {
    // 実装では、詳細な組織分析を実行
    return {
      organizational_readiness: 75,
      leadership_commitment: 85,
      resource_availability: 70,
      change_capability: 65,
      stakeholder_support: 80,
      readiness_gaps: ['変革管理スキル', 'プロジェクト管理能力'],
      acceleration_opportunities: ['チャンピオン活用', 'クイックウィン実現']
    };
  }, []);

  /**
   * 事後報告書の生成
   */
  const generatePostActionReport = useCallback(async (
    selectionId: string
  ): Promise<PostActionReport> => {
    // 実装では、詳細な分析と報告書生成
    return {
      reportId: `report_${Date.now()}`,
      incidentId: selectionId,
      executiveId,
      reportType: 'EMERGENCY',
      completedAt: new Date(),
      summary: {
        objective: '緊急事態への対応',
        duration: 120,
        teamSize: 10,
        resourcesUtilized: [],
        keyMilestones: [],
        challengesFaced: []
      },
      effectiveness: {
        overallRating: 8,
        responseTime: 15,
        resourceEfficiency: 7,
        stakeholderSatisfaction: 8,
        objectiveAchievement: 85,
        improvementAreas: ['コミュニケーション強化', 'リソース調整']
      },
      lessons: {
        whatWorkedWell: ['迅速な意思決定', 'チーム連携'],
        whatDidntWork: ['初期コミュニケーション'],
        unexpectedChallenges: ['外部調整の複雑さ'],
        keyInsights: ['事前準備の重要性'],
        processImprovements: ['テンプレート改善', '訓練強化']
      },
      recommendations: [],
      compliance: {
        regulatoryCompliance: true,
        policyCompliance: true,
        auditTrailComplete: true,
        reportingRequirementsMet: true,
        violations: [],
        correctiveActions: []
      }
    };
  }, [executiveId]);

  /**
   * 監査証跡のエクスポート
   */
  const exportAuditTrail = useCallback(async (
    dateRange?: { start: Date; end: Date }
  ): Promise<AuditExport> => {
    const now = new Date();
    const filteredEntries = auditLog.filter(entry => {
      if (!dateRange) return true;
      return entry.timestamp >= dateRange.start && entry.timestamp <= dateRange.end;
    });

    return {
      exportId: `audit_${Date.now()}`,
      generatedAt: now,
      dateRange: dateRange || { start: new Date(0), end: now },
      executiveId,
      entries: filteredEntries,
      summary: {
        totalOverrides: filteredEntries.length,
        emergencyOverrides: filteredEntries.filter(e => 
          e.action === 'EMERGENCY_TEAM_FORMATION'
        ).length,
        strategicOverrides: filteredEntries.filter(e => 
          e.action === 'STRATEGIC_TRANSFORMATION'
        ).length,
        successRate: filteredEntries.filter(e => e.outcome === 'SUCCESS').length / filteredEntries.length * 100,
        averageResponseTime: 15,
        complianceRate: 100,
        flaggedActions: 0
      },
      integrity: {
        checksumValid: true,
        tamperedEntries: [],
        missingEntries: [],
        integrityScore: 100
      }
    };
  }, [auditLog, executiveId]);

  /**
   * 緊急通知の送信
   */
  const sendEmergencyNotifications = useCallback(async (
    team: CrisisResponseTeam
  ): Promise<void> => {
    // 実装では、通知サービスを使用
    console.log('緊急通知送信:', team);
  }, []);

  /**
   * 自動エスカレーションのトリガー
   */
  const triggerAutoEscalation = useCallback(async (
    scenario: EscalationScenario
  ): Promise<void> => {
    // 実装では、エスカレーション処理
    console.log('自動エスカレーション:', scenario);
  }, []);

  /**
   * オーバーライド権限の検証
   */
  const validateOverrideAuthority = useCallback((action: OverrideAction): boolean => {
    switch (action) {
      case 'EMERGENCY_TEAM_FORMATION':
      case 'CRISIS_ESCALATION':
        return emergencyCapability.hasEmergencyAuthority;
      case 'STRATEGIC_TRANSFORMATION':
      case 'ORGANIZATIONAL_RESTRUCTURE':
      case 'BUDGET_OVERRIDE':
        return strategicCapability.hasStrategicAuthority;
      default:
        return false;
    }
  }, [emergencyCapability, strategicCapability]);

  /**
   * 応答時間の計算
   */
  const calculateResponseTime = useCallback((
    startTime: Date,
    endTime: Date
  ): ResponseTimeMetrics => {
    const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    return {
      decisionTime: 5,      // 決定時間
      mobilizationTime: 10, // 動員時間
      firstResponseTime: 15, // 初回対応時間
      totalResponseTime: totalMinutes,
      efficiency: totalMinutes <= 30 ? 100 : Math.max(0, 100 - (totalMinutes - 30) * 2),
      benchmark: 30 // ベンチマーク30分
    };
  }, []);

  /**
   * オーバーライド使用統計の取得
   */
  const getOverrideUsageStatistics = useCallback((): OverrideUsageStats => {
    return {
      totalUsage: auditLog.length,
      emergencyUsage: auditLog.filter(e => e.action === 'EMERGENCY_TEAM_FORMATION').length,
      strategicUsage: auditLog.filter(e => e.action === 'STRATEGIC_TRANSFORMATION').length,
      successRate: auditLog.filter(e => e.outcome === 'SUCCESS').length / auditLog.length * 100,
      averageTeamSize: 12,
      mostCommonTypes: ['NATURAL_DISASTER', 'SYSTEM_FAILURE'],
      seasonalTrends: []
    };
  }, [auditLog]);

  /**
   * オーバーライドアクションの記録
   */
  const recordOverrideAction = async (actionData: {
    action: OverrideAction;
    justification: string;
    scope: OverrideScope[];
    resourcesUsed: ResourceUsage[];
  }) => {
    const entry: OverrideAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: actionData.action,
      executiveId,
      permissionLevel,
      justification: actionData.justification,
      scope: actionData.scope,
      resourcesUsed: actionData.resourcesUsed,
      outcome: 'SUCCESS',
      reportSubmitted: false,
      reviewStatus: 'PENDING'
    };

    setAuditLog(prev => [...prev, entry]);
  };

  return {
    // 権限機能
    emergencyCapability,
    emergencyTemplates,
    activeEmergencies,
    strategicCapability,
    transformationReadiness,
    executiveAlignment,
    
    // 状態
    loading,
    error,
    auditLog,
    
    // 緊急選定アクション
    executeEmergencyResponse,
    useEmergencyTemplate,
    adjustEmergencyTeam,
    
    // 戦略選定アクション
    executeStrategicTransformation,
    assessTransformationReadiness,
    
    // 監査・報告
    generatePostActionReport,
    exportAuditTrail,
    
    // 通知・エスカレーション
    sendEmergencyNotifications,
    triggerAutoEscalation,
    
    // ユーティリティ
    validateOverrideAuthority,
    calculateResponseTime,
    getOverrideUsageStatistics
  };
};

export default useEmergencySelection;