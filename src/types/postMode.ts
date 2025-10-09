/**
 * Post Mode Types
 *
 * アイデアボイス投稿のモード（議題モード / プロジェクト化モード）を
 * 定義・管理するための型定義
 */

/**
 * 投稿のモードを表す列挙型
 * - discussion: 議題モード（アイデア収集、議論促進、合意形成フェーズ）
 * - project: プロジェクト化モード（実行管理、進捗追跡、課題解決フェーズ）
 */
export type PostMode = 'discussion' | 'project';

/**
 * モード判定結果
 */
export interface PostModeInfo {
  /** 現在のモード */
  mode: PostMode;
  /** プロジェクト化されているか */
  isProject: boolean;
  /** 議題モードか */
  isDiscussion: boolean;
  /** プロジェクト進捗率（プロジェクト化モードの場合のみ） */
  projectProgress?: number;
  /** プロジェクトステージ（プロジェクト化モードの場合のみ） */
  projectStage?: string;
  /** 議題レベル（議題モードの場合） */
  agendaLevel?: 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';
  /** 議題スコア（議題モードの場合） */
  agendaScore?: number;
}

/**
 * 議題モード用の分析データ
 */
export interface DiscussionAnalysisData {
  /** 投票分布 */
  voteDistribution: {
    stronglySupport: number;
    support: number;
    neutral: number;
    oppose: number;
    stronglyOppose: number;
    /** 賛成率（strongly-support + support） */
    supportRate: number;
    /** 反対率（strongly-oppose + oppose） */
    opposeRate: number;
  };

  /** スコア情報 */
  scoreInfo: {
    totalScore: number;
    level: string; // '部署レベル', '施設レベル', etc.
    icon: string;
  };

  /** 参加状況 */
  participation: {
    totalVotes: number;
    totalComments: number;
    stage: string; // '初期段階', '活発', etc.
  };

  /** 未参加層の分析 */
  nonParticipantAnalysis?: {
    managementParticipation: {
      participated: number;
      total: number;
      rate: number;
    };
    staffParticipation: {
      participated: number;
      total: number;
      rate: number;
    };
  };

  /** 反対意見のサマリー */
  oppositionSummary?: {
    totalOppositions: number;
    mainConcerns: string[];
  };

  /** 議論促進のための問いかけ */
  discussionPrompts: string[];

  /** 次のマイルストーン */
  nextMilestone: {
    current: string;
    target: number;
    achieved: number;
    progressRate: number;
  };
}

/**
 * プロジェクト化モード用の分析データ
 */
export interface ProjectAnalysisData {
  /** 全体進捗 */
  overallProgress: {
    progressRate: number; // 0-100
    daysElapsed: number;
    totalDays: number;
    daysRemaining: number;
  };

  /** タスクサマリー */
  taskSummary: {
    completed: number;
    total: number;
    inProgress: number;
    delayed: number;
  };

  /** 現在のフェーズ */
  currentPhase: {
    name: string;
    progress: number;
    status: 'completed' | 'active' | 'pending';
  };

  /** フェーズタイムライン */
  phases: Array<{
    name: string;
    status: 'completed' | 'active' | 'pending';
    progress?: number;
  }>;

  /** 課題・ブロッカー */
  issues: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    assignee?: string;
    deadline?: Date;
  }>;

  /** マイルストーン */
  milestones: Array<{
    id: string;
    date: Date;
    title: string;
    daysUntil: number;
    status: 'upcoming' | 'normal' | 'completed';
  }>;

  /** リソース状況 */
  resources: {
    budget: {
      used: number;
      total: number;
      rate: number;
    };
    team: {
      size: number;
      roles: string[];
    };
  };

  /** 更新情報 */
  updateInfo: {
    lastUpdated: Date;
    nextUpdate?: Date;
    updateFrequency: string; // '日次', '週次', etc.
  };
}

/**
 * コメント展開エリアに表示するデータ
 * モードに応じて discussion または project のどちらかが存在する
 */
export interface PostAnalysisPanel {
  mode: PostMode;
  discussionData?: DiscussionAnalysisData;
  projectData?: ProjectAnalysisData;
}
