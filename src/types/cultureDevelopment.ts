/**
 * 組織文化開発型定義
 * Level 14-17（人事部門）専用
 *
 * 組織文化の診断、改善施策管理、効果測定を行う
 */

/**
 * 文化診断結果
 */
export interface CultureAssessment {
  id: string;
  assessmentDate: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };

  // 総合スコア
  overallScore: number;          // 0-100
  previousScore?: number;        // 前回スコア
  trend: 'improving' | 'stable' | 'declining';

  // 文化次元別スコア
  dimensions: CultureDimension[];

  // 部門別スコア
  byDepartment: DepartmentCultureScore[];

  // 強み・弱み
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];

  // 参加データ
  participantCount: number;
  responseRate: number;          // %

  createdAt: Date;
  updatedAt: Date;
}

/**
 * 文化次元（組織文化の各側面）
 */
export interface CultureDimension {
  id: string;
  name: string;
  description: string;
  score: number;                 // 0-100
  previousScore?: number;
  change: number;                // 前回からの変化
  indicators: CultureIndicator[];
  recommendedActions: string[];
}

/**
 * 文化指標
 */
export interface CultureIndicator {
  name: string;
  value: number;                 // 0-100
  target: number;                // 目標値
  achievement: number;           // 達成率 %
  trend: 'up' | 'down' | 'stable';
}

/**
 * 部門別文化スコア
 */
export interface DepartmentCultureScore {
  department: string;
  overallScore: number;
  dimensionScores: {
    dimension: string;
    score: number;
  }[];
  rank: number;                  // 部門ランキング
  participationRate: number;
}

/**
 * 文化改善施策
 */
export interface CultureInitiative {
  id: string;
  title: string;
  description: string;
  objective: string;

  // ステータス
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // ターゲット
  targetDimensions: string[];    // 対象とする文化次元
  targetDepartments: string[];   // 対象部門（全体の場合は空配列）
  targetAudience: string;        // 対象者（例：「全職員」「管理職」）

  // スケジュール
  startDate: Date;
  endDate: Date;
  milestones: InitiativeMilestone[];

  // 責任者
  owner: string;
  ownerName: string;
  team: string[];

  // KPI
  kpis: InitiativeKPI[];

  // 進捗
  progress: number;              // 0-100
  currentPhase: string;

  // 予算
  budget?: number;
  actualSpending?: number;

  // 成果
  outcomes?: {
    description: string;
    metrics: {
      name: string;
      before: number;
      after: number;
      improvement: number;       // %
    }[];
  };

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * 施策マイルストーン
 */
export interface InitiativeMilestone {
  id: string;
  name: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  deliverables: string[];
}

/**
 * 施策KPI
 */
export interface InitiativeKPI {
  name: string;
  baseline: number;              // ベースライン値
  target: number;                // 目標値
  current: number;               // 現在値
  unit: string;
  achievement: number;           // 達成率 %
}

/**
 * 文化変革トラッキング
 */
export interface CultureChangeTracking {
  dimension: string;
  timeline: {
    date: Date;
    score: number;
    events: string[];            // その時点での主要イベント
  }[];
  initiatives: {
    initiativeId: string;
    title: string;
    impact: number;              // 推定影響度（-100〜+100）
  }[];
}

/**
 * 文化診断サマリー
 */
export interface CultureSummary {
  // 最新スコア
  currentScore: number;
  previousScore: number;
  scoreChange: number;
  trend: 'improving' | 'stable' | 'declining';

  // 施策
  totalInitiatives: number;
  activeInitiatives: number;
  completedInitiatives: number;
  initiativesOnTrack: number;
  initiativesDelayed: number;

  // 効果測定
  averageImprovement: number;    // 施策による平均改善率 %
  highImpactInitiatives: number; // 高影響施策数

  // アラート
  criticalDimensions: string[];  // 要注意次元
  improvingDimensions: string[]; // 改善中の次元
}

/**
 * 文化次元タイプ
 */
export type CultureDimensionType =
  | 'psychological_safety'       // 心理的安全性
  | 'collaboration'              // 協働性
  | 'innovation'                 // イノベーション志向
  | 'learning'                   // 学習文化
  | 'diversity'                  // 多様性・包摂性
  | 'transparency'               // 透明性
  | 'accountability'             // 説明責任
  | 'employee_voice'             // 職員の声の尊重
  | 'work_life_balance'          // ワークライフバランス
  | 'recognition';               // 承認文化

/**
 * フィルタオプション
 */
export interface CultureFilter {
  status?: CultureInitiative['status'][];
  priority?: CultureInitiative['priority'][];
  targetDimensions?: string[];
  targetDepartments?: string[];
}

/**
 * ヘルパー関数：スコアから評価を取得
 */
export const getCultureScoreInfo = (score: number): { label: string; color: string; icon: string } => {
  if (score >= 80) return { label: '優秀', color: 'text-emerald-400 bg-emerald-900/30', icon: '🌟' };
  if (score >= 70) return { label: '良好', color: 'text-green-400 bg-green-900/30', icon: '✨' };
  if (score >= 60) return { label: '普通', color: 'text-blue-400 bg-blue-900/30', icon: '📊' };
  if (score >= 50) return { label: '要改善', color: 'text-yellow-400 bg-yellow-900/30', icon: '⚠️' };
  if (score >= 40) return { label: '改善が必要', color: 'text-orange-400 bg-orange-900/30', icon: '📉' };
  return { label: '緊急対応', color: 'text-red-400 bg-red-900/30', icon: '🚨' };
};

/**
 * ヘルパー関数：トレンドから表示情報を取得
 */
export const getCultureTrendInfo = (trend: 'improving' | 'stable' | 'declining'): { label: string; color: string; icon: string } => {
  const info: Record<'improving' | 'stable' | 'declining', { label: string; color: string; icon: string }> = {
    improving: { label: '改善中', color: 'text-emerald-400', icon: '📈' },
    stable: { label: '安定', color: 'text-blue-400', icon: '➡️' },
    declining: { label: '悪化中', color: 'text-red-400', icon: '📉' }
  };
  return info[trend];
};

/**
 * ヘルパー関数：施策ステータスから表示情報を取得
 */
export const getInitiativeStatusInfo = (status: CultureInitiative['status']): { label: string; color: string; icon: string } => {
  const info: Record<CultureInitiative['status'], { label: string; color: string; icon: string }> = {
    planning: { label: '計画中', color: 'text-blue-400 bg-blue-900/30', icon: '📋' },
    active: { label: '実施中', color: 'text-emerald-400 bg-emerald-900/30', icon: '⚡' },
    completed: { label: '完了', color: 'text-purple-400 bg-purple-900/30', icon: '✅' },
    on_hold: { label: '保留中', color: 'text-yellow-400 bg-yellow-900/30', icon: '⏸️' },
    cancelled: { label: '中止', color: 'text-gray-400 bg-gray-800/30', icon: '❌' }
  };
  return info[status];
};

/**
 * ヘルパー関数：優先度から表示情報を取得
 */
export const getInitiativePriorityInfo = (priority: CultureInitiative['priority']): { label: string; color: string; icon: string } => {
  const info: Record<CultureInitiative['priority'], { label: string; color: string; icon: string }> = {
    low: { label: '低', color: 'text-gray-400 bg-gray-800/30', icon: '📝' },
    medium: { label: '中', color: 'text-blue-400 bg-blue-900/30', icon: '📋' },
    high: { label: '高', color: 'text-orange-400 bg-orange-900/30', icon: '⚠️' },
    critical: { label: '緊急', color: 'text-red-400 bg-red-900/30', icon: '🚨' }
  };
  return info[priority];
};

/**
 * ヘルパー関数：文化次元名を日本語化
 */
export const getCultureDimensionLabel = (type: CultureDimensionType): string => {
  const labels: Record<CultureDimensionType, string> = {
    psychological_safety: '心理的安全性',
    collaboration: '協働性',
    innovation: 'イノベーション志向',
    learning: '学習文化',
    diversity: '多様性・包摂性',
    transparency: '透明性',
    accountability: '説明責任',
    employee_voice: '職員の声の尊重',
    work_life_balance: 'ワークライフバランス',
    recognition: '承認文化'
  };
  return labels[type];
};

/**
 * ヘルパー関数：達成率から色を取得
 */
export const getAchievementColor = (achievement: number): string => {
  if (achievement >= 100) return 'text-emerald-400';
  if (achievement >= 80) return 'text-green-400';
  if (achievement >= 60) return 'text-blue-400';
  if (achievement >= 40) return 'text-yellow-400';
  if (achievement >= 20) return 'text-orange-400';
  return 'text-red-400';
};
