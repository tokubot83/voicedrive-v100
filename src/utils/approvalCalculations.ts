import { Post } from '../types';
import { ApprovalStep } from '../types/approval';

/**
 * 投稿タイプに基づいて承認ステップを生成
 */
export const getApprovalSteps = (post: Post): ApprovalStep[] => {
  // プロジェクト化された投稿の場合、既存の承認フローを使用
  if (post.enhancedProjectStatus && post.approvalFlow) {
    return convertExistingApprovalFlow(post);
  }

  // 公益通報の場合（report typeで proposalType が公益通報関連の場合）
  if (post.type === 'report' && post.proposalType === 'strategic') {
    return getWhistleblowingSteps(post);
  }

  // 高額予算の場合
  if (post.enhancedProjectStatus?.budget && post.enhancedProjectStatus.budget > 10000000) {
    return getHighBudgetSteps(post);
  }

  // デフォルトの承認ステップ
  return getDefaultApprovalSteps(post);
};

/**
 * 既存の承認フローをApprovalStep形式に変換
 */
const convertExistingApprovalFlow = (post: Post): ApprovalStep[] => {
  const steps: ApprovalStep[] = [];
  const flow = post.approvalFlow;

  if (!flow) return getDefaultApprovalSteps(post);

  // 承認履歴から情報を抽出
  flow.history?.forEach((item, index) => {
    steps.push({
      id: `level${index + 1}`,
      level: item.level as any,
      title: getLevelTitle(item.level),
      description: getLevelDescription(item.level),
      status: item.status === 'approved' ? 'approved' : 
              item.status === 'pending' ? 'pending' : 'rejected',
      approvers: [{
        name: item.approver,
        role: getApproverRole(item.level),
        department: getApproverDepartment(item.level),
        status: item.status === 'approved' ? 'approved' : 
                item.status === 'pending' ? 'pending' : 'rejected',
        timestamp: item.date ? new Date(item.date) : undefined,
        comment: getApprovalComment(item.level, item.status)
      }],
      deadline: getDeadline(item.level, post.timestamp),
      estimatedDuration: getEstimatedDuration(item.level)
    });
  });

  // 現在のレベルが進行中の場合
  if (flow.status === 'in_progress' && flow.currentLevel) {
    const currentIndex = steps.findIndex(s => s.level === flow.currentLevel);
    if (currentIndex >= 0) {
      steps[currentIndex].status = 'in_progress';
    }
  }

  return steps;
};

/**
 * デフォルトの承認ステップ
 */
const getDefaultApprovalSteps = (post: Post): ApprovalStep[] => {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'level1',
      level: 'LEVEL_1',
      title: '直属上司承認',
      description: '提案内容の妥当性と部署内での実行可能性を確認',
      status: 'approved',
      approvers: [{
        name: '田中 太郎',
        role: '課長',
        department: post.author.department || '所属部署',
        status: 'approved',
        timestamp: new Date(now.getTime() - 2 * dayMs),
        comment: '優れた改善提案です。次のレベルで検討してください。'
      }],
      deadline: new Date(now.getTime() + 3 * dayMs),
      estimatedDuration: '2-3日'
    },
    {
      id: 'level2',
      level: 'LEVEL_2',
      title: '部門長承認',
      description: '予算配分と他部署への影響を評価',
      status: 'in_progress',
      approvers: [{
        name: '佐藤 花子',
        role: '部長',
        department: post.author.department || '所属部署',
        status: 'pending'
      }],
      deadline: new Date(now.getTime() + 7 * dayMs),
      estimatedDuration: '3-5日'
    },
    {
      id: 'level3',
      level: 'LEVEL_3',
      title: '事業部承認',
      description: '事業計画との整合性と戦略的価値を検討',
      status: 'pending',
      approvers: [{
        name: '山田 次郎',
        role: '事業部長',
        department: '事業企画部',
        status: 'pending'
      }],
      deadline: new Date(now.getTime() + 14 * dayMs),
      estimatedDuration: '5-7日'
    }
  ];
};

/**
 * 公益通報用の承認ステップ
 */
const getWhistleblowingSteps = (post: Post): ApprovalStep[] => {
  const now = new Date();
  const hourMs = 60 * 60 * 1000;

  return [
    {
      id: 'confidential_review',
      level: 'LEVEL_1',
      title: '機密性確認',
      description: '通報内容の機密性レベルと緊急度を評価',
      status: 'approved',
      approvers: [{
        name: 'コンプライアンス担当',
        role: '法務部',
        department: 'コンプライアンス',
        status: 'approved',
        timestamp: new Date(now.getTime() - 6 * hourMs),
        comment: '重要案件として上位レベルでの検討が必要です。'
      }],
      deadline: new Date(now.getTime() + 24 * hourMs),
      estimatedDuration: '即日'
    },
    {
      id: 'legal_review',
      level: 'LEVEL_2',
      title: '法務確認',
      description: '法的リスクと対応方針の検討',
      status: 'in_progress',
      approvers: [{
        name: '法務責任者',
        role: '法務部長',
        department: '法務部',
        status: 'pending'
      }],
      deadline: new Date(now.getTime() + 48 * hourMs),
      estimatedDuration: '1-2日'
    },
    {
      id: 'executive_decision',
      level: 'LEVEL_5',
      title: '経営判断',
      description: '組織としての対応方針決定',
      status: 'pending',
      approvers: [{
        name: '代表取締役',
        role: 'CEO',
        department: '経営層',
        status: 'pending'
      }],
      deadline: new Date(now.getTime() + 72 * hourMs),
      estimatedDuration: '2-3日'
    }
  ];
};

/**
 * 高額予算案件用の承認ステップ
 */
const getHighBudgetSteps = (post: Post): ApprovalStep[] => {
  const steps = getDefaultApprovalSteps(post);
  
  // 財務部門の承認を追加
  steps.splice(2, 0, {
    id: 'finance_review',
    level: 'LEVEL_3',
    title: '財務部門承認',
    description: '予算確保と投資対効果の精査',
    status: 'pending',
    approvers: [{
      name: '財務責任者',
      role: 'CFO',
      department: '財務部',
      status: 'pending'
    }],
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    estimatedDuration: '5-7日'
  });

  // 理事会承認を追加
  steps.push({
    id: 'board_approval',
    level: 'LEVEL_5',
    title: '理事会承認',
    description: '最終的な投資判断',
    status: 'pending',
    approvers: [{
      name: '理事会',
      role: '意思決定機関',
      department: '経営層',
      status: 'pending'
    }],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    estimatedDuration: '2-4週間'
  });

  return steps;
};

/**
 * 全体の進捗率を計算
 */
export const getOverallProgress = (steps: ApprovalStep[]): number => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.status === 'approved').length;
  const inProgressSteps = steps.filter(step => step.status === 'in_progress').length;
  
  return Math.round((completedSteps + inProgressSteps * 0.5) / totalSteps * 100);
};

/**
 * 次の承認者を取得
 */
export const getNextApprover = (steps: ApprovalStep[]) => {
  const currentStep = steps.find(step => step.status === 'in_progress');
  return currentStep?.approvers.find(approver => approver.status === 'pending');
};

/**
 * 予想完了日を計算
 */
export const getEstimatedCompletion = (steps: ApprovalStep[]): Date => {
  const remainingSteps = steps.filter(step => 
    step.status === 'pending' || step.status === 'in_progress'
  );
  
  const totalDays = remainingSteps.reduce((total, step) => {
    const days = parseInt(step.estimatedDuration.split('-')[1] || '3');
    return total + days;
  }, 0);
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + totalDays);
  return completionDate;
};

// ヘルパー関数
const getLevelTitle = (level: string): string => {
  const titles: Record<string, string> = {
    'LEVEL_1': '直属上司承認',
    'LEVEL_2': '部門長承認',
    'LEVEL_3': '事業部承認',
    'LEVEL_4': '役員承認',
    'LEVEL_5': '理事会承認'
  };
  return titles[level] || '承認';
};

const getLevelDescription = (level: string): string => {
  const descriptions: Record<string, string> = {
    'LEVEL_1': '提案内容の妥当性と部署内での実行可能性を確認',
    'LEVEL_2': '予算配分と他部署への影響を評価',
    'LEVEL_3': '事業計画との整合性と戦略的価値を検討',
    'LEVEL_4': '経営方針との整合性確認',
    'LEVEL_5': '最終的な組織決定'
  };
  return descriptions[level] || '承認プロセス';
};

const getApproverRole = (level: string): string => {
  const roles: Record<string, string> = {
    'LEVEL_1': '課長',
    'LEVEL_2': '部長',
    'LEVEL_3': '事業部長',
    'LEVEL_4': '役員',
    'LEVEL_5': '理事'
  };
  return roles[level] || '承認者';
};

const getApproverDepartment = (level: string): string => {
  const departments: Record<string, string> = {
    'LEVEL_1': '所属部署',
    'LEVEL_2': '部門',
    'LEVEL_3': '事業部',
    'LEVEL_4': '経営企画',
    'LEVEL_5': '理事会'
  };
  return departments[level] || '組織';
};

const getApprovalComment = (level: string, status: string): string | undefined => {
  if (status !== 'approved') return undefined;
  
  const comments: Record<string, string> = {
    'LEVEL_1': '部署内での実現可能性を確認しました。',
    'LEVEL_2': '予算配分に問題ありません。承認します。',
    'LEVEL_3': '事業戦略に合致しています。',
    'LEVEL_4': '経営方針に沿った提案です。',
    'LEVEL_5': '組織として実施を決定しました。'
  };
  return comments[level];
};

const getDeadline = (level: string, baseDate: Date | string): Date => {
  const base = new Date(baseDate);
  const daysToAdd: Record<string, number> = {
    'LEVEL_1': 3,
    'LEVEL_2': 7,
    'LEVEL_3': 14,
    'LEVEL_4': 21,
    'LEVEL_5': 30
  };
  
  const days = daysToAdd[level] || 7;
  const deadline = new Date(base);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
};

const getEstimatedDuration = (level: string): string => {
  const durations: Record<string, string> = {
    'LEVEL_1': '2-3日',
    'LEVEL_2': '3-5日',
    'LEVEL_3': '5-7日',
    'LEVEL_4': '7-10日',
    'LEVEL_5': '2-4週間'
  };
  return durations[level] || '3-5日';
};