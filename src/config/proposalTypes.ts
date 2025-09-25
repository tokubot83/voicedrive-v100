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
    description: '技術革新（AI・DX導入）・制度革新（人事制度・評価制度）・働き方革新（シフト改善・業務効率化）',
    borderColor: 'border-green-500',
    weights: [
      { category: 'zGen', weight: 0.4, label: 'Z世代', description: '新技術への親和性' },
      { category: 'frontline', weight: 0.3, label: '現場スタッフ', description: '実用性の評価' },
      { category: 'management', weight: 0.2, label: '管理職', description: '導入判断' },
      { category: 'veteran', weight: 0.1, label: 'ベテラン職員', description: '変化への適応性' }
    ]
  },
  strategic: {
    type: 'strategic',
    label: '戦略提案',
    icon: '🎯',
    description: '組織運営・経営戦略・事業展開に関する管理職向け提案',
    borderColor: 'border-purple-500',
    weights: [
      { category: 'management', weight: 0.6, label: '管理職（レベル2-4）', description: '戦略的判断と実行責任' },
      { category: 'veteran', weight: 0.25, label: 'ベテラン職員', description: '組織理解と経験' },
      { category: 'frontline', weight: 0.1, label: '現場スタッフ', description: '実行可能性の視点' },
      { category: 'zGen', weight: 0.05, label: 'Z世代', description: '将来性の観点' }
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
  innovation: 'partial',       // 部分匿名（技術提案のため）
  strategic: 'selective'       // 段階的実名（管理職は実名、その他は部分匿名）
};

export const getCommentPrivacyLevel = (proposalType: ProposalType): CommentPrivacyLevel => {
  return commentPrivacyConfig[proposalType];
};