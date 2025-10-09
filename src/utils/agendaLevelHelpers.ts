/**
 * Agenda Level Helpers
 *
 * 6段階議題レベルシステムのヘルパー関数と定義
 */

import { AgendaLevel } from '../types/committee';

/**
 * 議題レベル情報
 */
export interface AgendaLevelInfo {
  level: AgendaLevel;
  display: string;
  icon: string;
  scoreRange: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  responsible: {
    level: number;
    role: string;
  };
  nextAction: string;
  description: string;
}

/**
 * 議題レベル情報マッピング
 */
export const AGENDA_LEVEL_INFO: Record<AgendaLevel, AgendaLevelInfo> = {
  PENDING: {
    level: 'PENDING',
    display: '検討中',
    icon: '👤',
    scoreRange: '0-29点',
    color: {
      bg: 'bg-gray-900/20',
      text: 'text-gray-400',
      border: 'border-gray-500/20',
    },
    responsible: {
      level: 5,
      role: '副主任',
    },
    nextAction: '投票継続中 - 様子見段階',
    description: '投票が集まり始めている段階。部署内での認知を高めましょう。',
  },

  DEPT_REVIEW: {
    level: 'DEPT_REVIEW',
    display: '部署検討',
    icon: '🏢',
    scoreRange: '30-49点',
    color: {
      bg: 'bg-blue-900/20',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    responsible: {
      level: 6,
      role: '主任',
    },
    nextAction: '部署ミーティングでの検討',
    description: '部署内で議論する段階。主任が提案書を作成し、部署ミーティングで検討します。',
  },

  DEPT_AGENDA: {
    level: 'DEPT_AGENDA',
    display: '部署議題',
    icon: '🏢🏢',
    scoreRange: '50-99点',
    color: {
      bg: 'bg-green-900/20',
      text: 'text-green-400',
      border: 'border-green-500/20',
    },
    responsible: {
      level: 8,
      role: '師長・科長・課長',
    },
    nextAction: '施設運営委員会への提出判断',
    description: '施設レベルで検討する段階。師長が委員会への提出を判断します。',
  },

  FACILITY_AGENDA: {
    level: 'FACILITY_AGENDA',
    display: '施設議題',
    icon: '🏢🏢🏢',
    scoreRange: '100-299点',
    color: {
      bg: 'bg-purple-900/20',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
    },
    responsible: {
      level: 10,
      role: '部長・医局長',
    },
    nextAction: '法人運営委員会への提出判断',
    description: '法人レベルで検討する段階。部長が法人への提出を判断します。',
  },

  CORP_REVIEW: {
    level: 'CORP_REVIEW',
    display: '法人検討',
    icon: '🏢🏢🏢🏢',
    scoreRange: '300-599点',
    color: {
      bg: 'bg-orange-900/20',
      text: 'text-orange-400',
      border: 'border-orange-500/20',
    },
    responsible: {
      level: 12,
      role: '副院長',
    },
    nextAction: '理事会への提出判断',
    description: '理事会で検討する段階。副院長が理事会への提出を判断します。',
  },

  CORP_AGENDA: {
    level: 'CORP_AGENDA',
    display: '法人議題',
    icon: '🏢🏢🏢🏢🏢',
    scoreRange: '600点以上',
    color: {
      bg: 'bg-red-900/20',
      text: 'text-red-400',
      border: 'border-red-500/20',
    },
    responsible: {
      level: 13,
      role: '院長',
    },
    nextAction: '理事会での最終決定',
    description: '最終決定段階。院長が理事会での審議を主導します。',
  },
};

/**
 * 議題レベル情報を取得
 *
 * @param level - 議題レベル
 * @returns 議題レベル情報
 */
export function getAgendaLevelInfo(level: AgendaLevel | null | undefined): AgendaLevelInfo {
  if (!level) {
    return AGENDA_LEVEL_INFO.PENDING;
  }
  return AGENDA_LEVEL_INFO[level] || AGENDA_LEVEL_INFO.PENDING;
}

/**
 * スコアから議題レベルを計算
 *
 * @param score - 投票スコア
 * @returns 議題レベル
 */
export function calculateAgendaLevel(score: number): AgendaLevel {
  if (score >= 600) return 'CORP_AGENDA';      // 法人議題（理事会提出）
  if (score >= 300) return 'CORP_REVIEW';      // 法人検討
  if (score >= 100) return 'FACILITY_AGENDA';  // 施設議題（委員会提出）
  if (score >= 50) return 'DEPT_AGENDA';       // 部署議題
  if (score >= 30) return 'DEPT_REVIEW';       // 部署検討
  return 'PENDING';                             // 検討中
}

/**
 * 次のレベルまでの必要スコアを計算
 *
 * @param currentScore - 現在のスコア
 * @returns 次のレベルまでの必要スコア
 */
export function getScoreToNextLevel(currentScore: number): {
  nextLevel: AgendaLevel;
  requiredScore: number;
  remainingScore: number;
  progressRate: number;
} {
  const thresholds: Array<{ level: AgendaLevel; score: number }> = [
    { level: 'DEPT_REVIEW', score: 30 },
    { level: 'DEPT_AGENDA', score: 50 },
    { level: 'FACILITY_AGENDA', score: 100 },
    { level: 'CORP_REVIEW', score: 300 },
    { level: 'CORP_AGENDA', score: 600 },
  ];

  // 次のレベルを見つける
  const nextThreshold = thresholds.find(t => currentScore < t.score);

  if (!nextThreshold) {
    // 最高レベル到達
    return {
      nextLevel: 'CORP_AGENDA',
      requiredScore: 600,
      remainingScore: 0,
      progressRate: 100,
    };
  }

  // 前のレベルのスコアを取得
  const currentThresholdIndex = thresholds.findIndex(t => t.level === nextThreshold.level);
  const previousScore = currentThresholdIndex > 0
    ? thresholds[currentThresholdIndex - 1].score
    : 0;

  const remainingScore = nextThreshold.score - currentScore;
  const scoreRange = nextThreshold.score - previousScore;
  const currentProgress = currentScore - previousScore;
  const progressRate = Math.min(Math.round((currentProgress / scoreRange) * 100), 100);

  return {
    nextLevel: nextThreshold.level,
    requiredScore: nextThreshold.score,
    remainingScore,
    progressRate,
  };
}

/**
 * ユーザーの権限レベルが議題レベルの責任者以上かチェック
 *
 * @param userLevel - ユーザーの権限レベル
 * @param agendaLevel - 議題レベル
 * @returns 責任者以上の場合 true
 */
export function isResponsibleOrHigher(
  userLevel: number | undefined,
  agendaLevel: AgendaLevel
): boolean {
  if (!userLevel) return false;

  const levelInfo = getAgendaLevelInfo(agendaLevel);
  return userLevel >= levelInfo.responsible.level;
}

/**
 * 議題レベルの進捗バーの色を取得
 *
 * @param level - 議題レベル
 * @returns Tailwind CSS クラス
 */
export function getProgressBarColor(level: AgendaLevel): string {
  const levelInfo = getAgendaLevelInfo(level);

  switch (level) {
    case 'PENDING':
      return 'bg-gray-400';
    case 'DEPT_REVIEW':
      return 'bg-blue-400';
    case 'DEPT_AGENDA':
      return 'bg-green-400';
    case 'FACILITY_AGENDA':
      return 'bg-purple-400';
    case 'CORP_REVIEW':
      return 'bg-orange-400';
    case 'CORP_AGENDA':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
}

/**
 * 議題レベルの一覧を取得（順番付き）
 *
 * @returns 議題レベルの配列
 */
export function getAllLevels(): AgendaLevel[] {
  return [
    'PENDING',
    'DEPT_REVIEW',
    'DEPT_AGENDA',
    'FACILITY_AGENDA',
    'CORP_REVIEW',
    'CORP_AGENDA',
  ];
}

/**
 * 議題レベルの順序番号を取得
 *
 * @param level - 議題レベル
 * @returns 順序番号 (0-5)
 */
export function getLevelOrder(level: AgendaLevel): number {
  return getAllLevels().indexOf(level);
}
