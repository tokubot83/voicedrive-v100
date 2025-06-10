import { ProposalTypeConfig, ProposalType, CommentPrivacyLevel } from '../types';

export const proposalTypeConfigs: Record<ProposalType, ProposalTypeConfig> = {
  operational: {
    type: 'operational',
    label: '業務改善',
    icon: '⚙️',
    description: '日常業務の効率化・改善に関する提案',
    borderColor: 'border-blue-500',
    weights: [
      { category: 'frontline', weight: 0.5, label: '現場スタッフ', description: '実際の業務経験が重要' },
      { category: 'veteran', weight: 0.3, label: 'ベテラン職員', description: '長年の知見を活用' },
      { category: 'management', weight: 0.15, label: '管理職', description: '実現可能性を評価' },
      { category: 'zGen', weight: 0.05, label: 'Z世代', description: '新しい視点を提供' }
    ]
  },
  strategic: {
    type: 'strategic',
    label: '戦略提案',
    icon: '🎯',
    description: '組織の方向性や戦略に関する提案',
    borderColor: 'border-purple-500',
    weights: [
      { category: 'management', weight: 0.5, label: '管理職', description: '戦略的判断が必要' },
      { category: 'veteran', weight: 0.3, label: 'ベテラン職員', description: '組織理解が重要' },
      { category: 'frontline', weight: 0.15, label: '現場スタッフ', description: '実行可能性の視点' },
      { category: 'zGen', weight: 0.05, label: 'Z世代', description: '将来性の観点' }
    ]
  },
  innovation: {
    type: 'innovation',
    label: 'イノベーション',
    icon: '💡',
    description: '新技術やDX推進に関する提案',
    borderColor: 'border-green-500',
    weights: [
      { category: 'zGen', weight: 0.4, label: 'Z世代', description: '新技術への親和性' },
      { category: 'frontline', weight: 0.3, label: '現場スタッフ', description: '実用性の評価' },
      { category: 'management', weight: 0.2, label: '管理職', description: '導入判断' },
      { category: 'veteran', weight: 0.1, label: 'ベテラン職員', description: '変化への適応性' }
    ]
  },
  riskManagement: {
    type: 'riskManagement',
    label: 'リスク管理',
    icon: '🛡️',
    description: '安全性や品質管理に関する提案',
    borderColor: 'border-red-500',
    weights: [
      { category: 'veteran', weight: 0.4, label: 'ベテラン職員', description: '経験に基づくリスク認識' },
      { category: 'management', weight: 0.3, label: '管理職', description: 'リスク管理責任' },
      { category: 'frontline', weight: 0.25, label: '現場スタッフ', description: '現場のリスク把握' },
      { category: 'zGen', weight: 0.05, label: 'Z世代', description: '新しいリスクの発見' }
    ]
  },
  communication: {
    type: 'communication',
    label: 'コミュニケーション',
    icon: '💬',
    description: '職場環境や人間関係の改善提案',
    borderColor: 'border-yellow-500',
    weights: [
      { category: 'frontline', weight: 0.35, label: '現場スタッフ', description: '日常的な課題認識' },
      { category: 'zGen', weight: 0.35, label: 'Z世代', description: '新しい働き方の視点' },
      { category: 'veteran', weight: 0.2, label: 'ベテラン職員', description: '組織文化の理解' },
      { category: 'management', weight: 0.1, label: '管理職', description: '組織全体への影響' }
    ]
  }
};

export const getProposalTypeConfig = (type: ProposalType): ProposalTypeConfig => {
  return proposalTypeConfigs[type];
};

export const proposalTypes = Object.values(proposalTypeConfigs);

// Comment privacy level configuration for each proposal type
export const commentPrivacyConfig: Record<ProposalType, CommentPrivacyLevel> = {
  operational: 'partial',      // 部分匿名（所属施設・職種・経験年数）
  strategic: 'selective',      // 段階的実名（管理職は実名、その他は部分匿名）
  innovation: 'partial',       // 選択式（デフォルトは部分匿名）
  riskManagement: 'full',      // 実名制
  communication: 'anonymous'   // 完全匿名
};

export const getCommentPrivacyLevel = (proposalType: ProposalType): CommentPrivacyLevel => {
  return commentPrivacyConfig[proposalType];
};