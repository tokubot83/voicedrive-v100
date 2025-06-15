import { ProposalTypeConfig, ProposalType, CommentPrivacyLevel } from '../types';

export const proposalTypeConfigs: Record<ProposalType, ProposalTypeConfig> = {
  operational: {
    type: 'operational',
    label: '業務改善',
    icon: '🏥',
    description: '診療業務・介護業務・事務作業の効率化や品質向上の提案',
    borderColor: 'border-blue-500',
    weights: [
      { category: 'frontline', weight: 0.5, label: '現場スタッフ', description: '実際の業務経験が重要' },
      { category: 'veteran', weight: 0.3, label: 'ベテラン職員', description: '長年の知見を活用' },
      { category: 'management', weight: 0.15, label: '管理職', description: '実現可能性を評価' },
      { category: 'zGen', weight: 0.05, label: 'Z世代', description: '新しい視点を提供' }
    ]
  },
  communication: {
    type: 'communication',
    label: 'コミュニケーション',
    icon: '👥',
    description: '職場環境・福利厚生・人間関係の改善提案',
    borderColor: 'border-yellow-500',
    weights: [
      { category: 'frontline', weight: 0.35, label: '現場スタッフ', description: '日常的な課題認識' },
      { category: 'zGen', weight: 0.35, label: 'Z世代', description: '新しい働き方の視点' },
      { category: 'veteran', weight: 0.2, label: 'ベテラン職員', description: '組織文化の理解' },
      { category: 'management', weight: 0.1, label: '管理職', description: '組織全体への影響' }
    ]
  },
  innovation: {
    type: 'innovation',
    label: 'イノベーション',
    icon: '💡',
    description: '新技術導入・新サービス開発・制度改革などの革新的提案',
    borderColor: 'border-green-500',
    weights: [
      { category: 'zGen', weight: 0.4, label: 'Z世代', description: '新技術への親和性' },
      { category: 'frontline', weight: 0.3, label: '現場スタッフ', description: '実用性の評価' },
      { category: 'management', weight: 0.2, label: '管理職', description: '導入判断' },
      { category: 'veteran', weight: 0.1, label: 'ベテラン職員', description: '変化への適応性' }
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
  communication: 'anonymous',  // 完全匿名（職場環境改善のため）
  innovation: 'partial'        // 部分匿名（技術提案のため）
};

export const getCommentPrivacyLevel = (proposalType: ProposalType): CommentPrivacyLevel => {
  return commentPrivacyConfig[proposalType];
};