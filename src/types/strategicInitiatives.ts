/**
 * 戦略イニシアチブ（プロジェクト化モード専用）
 * 院長主導の戦略プロジェクト管理
 */

export type StrategicProjectStatus = 'planning' | 'in_progress' | 'at_risk' | 'on_hold' | 'completed' | 'cancelled';

export type StrategicProjectPriority = 'critical' | 'high' | 'medium' | 'low';

export type ProjectPhase = 'initiation' | 'planning' | 'execution' | 'monitoring' | 'closure';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface StrategicKPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  completionRate: number;
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
  status: 'identified' | 'mitigating' | 'resolved';
  owner: string;
}

export interface ProjectBudget {
  total: number;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationRate: number; // %
}

export interface ProjectTeamMember {
  userId: string;
  name: string;
  role: string;
  department: string;
  commitment: number; // % of time
}

export interface StrategicProject {
  id: string;
  title: string;
  description: string;
  objective: string;
  status: StrategicProjectStatus;
  priority: StrategicProjectPriority;
  phase: ProjectPhase;

  // 期間
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // months

  // 進捗
  overallProgress: number; // %
  milestones: ProjectMilestone[];

  // 予算
  budget: ProjectBudget;

  // チーム
  owner: string; // 責任者
  teamMembers: ProjectTeamMember[];
  teamSize: number;

  // KPI
  kpis: StrategicKPI[];

  // リスク
  risks: ProjectRisk[];

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;

  // 理事会連携
  boardApprovalRequired: boolean;
  boardApprovalStatus?: 'pending' | 'approved' | 'rejected';
  boardPresentationDate?: Date;

  // タグ・カテゴリ
  tags: string[];
  category: 'facility' | 'hr' | 'digital' | 'quality' | 'community' | 'finance' | 'other';
}

export interface StrategicInitiativeStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  atRiskProjects: number;
  totalBudget: number;
  budgetUtilization: number; // %
  averageProgress: number; // %
  onTimeRate: number; // %
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: StrategicProject['category'];
  defaultDuration: number; // months
  suggestedMilestones: string[];
  suggestedKPIs: string[];
  estimatedBudget: number;
}
