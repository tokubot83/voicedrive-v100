export type PostCategory = 
  // 改善提案カテゴリ
  | 'system_improvement'      // システム改善
  | 'process_efficiency'      // プロセス効率化
  | 'business_improvement'    // 業務改善
  | 'cost_reduction'         // コスト削減
  // 戦略提案カテゴリ
  | 'new_business'           // 新規事業
  | 'market_strategy'        // 市場戦略
  | 'organizational_change'  // 組織変革
  | 'long_term_planning'     // 長期計画
  // コミュニケーション（人事関連）カテゴリ
  | 'recruitment_placement'  // 採用・配置
  | 'evaluation_promotion'   // 評価・昇進
  | 'welfare_benefits'       // 福利厚生
  | 'labor_issues'          // 労務問題
  | 'team_building'         // チームビルディング
  // フリースペースカテゴリ
  | 'idea_sharing'          // アイデア共有
  | 'casual_discussion'     // 雑談
  | 'event_planning'        // イベント企画
  // 緊急対応
  | 'emergency';            // 緊急案件

export interface CategoryInfo {
  id: PostCategory;
  name: string;
  description: string;
  mainTab: 'improvement' | 'strategic' | 'communication' | 'community' | 'emergency';
  icon: string;
  requiresCarefulConsideration: boolean;
}

export const POST_CATEGORIES: Record<PostCategory, CategoryInfo> = {
  // 改善提案カテゴリ
  system_improvement: {
    id: 'system_improvement',
    name: 'システム改善',
    description: 'ITシステムやツールの改善提案',
    mainTab: 'improvement',
    icon: '💻',
    requiresCarefulConsideration: false
  },
  process_efficiency: {
    id: 'process_efficiency',
    name: 'プロセス効率化',
    description: '業務プロセスの効率化・自動化提案',
    mainTab: 'improvement',
    icon: '⚡',
    requiresCarefulConsideration: false
  },
  business_improvement: {
    id: 'business_improvement',
    name: '業務改善',
    description: '日常業務の改善・最適化提案',
    mainTab: 'improvement',
    icon: '📈',
    requiresCarefulConsideration: false
  },
  cost_reduction: {
    id: 'cost_reduction',
    name: 'コスト削減',
    description: '経費削減・コスト最適化の提案',
    mainTab: 'improvement',
    icon: '💰',
    requiresCarefulConsideration: true // 予算への影響
  },
  
  // 戦略提案カテゴリ（すべて慎重な検討が必要）
  new_business: {
    id: 'new_business',
    name: '新規事業',
    description: '新規事業・新サービスの提案',
    mainTab: 'strategic',
    icon: '🚀',
    requiresCarefulConsideration: true
  },
  market_strategy: {
    id: 'market_strategy',
    name: '市場戦略',
    description: '市場開拓・競争戦略の提案',
    mainTab: 'strategic',
    icon: '🎯',
    requiresCarefulConsideration: true
  },
  organizational_change: {
    id: 'organizational_change',
    name: '組織変革',
    description: '組織構造・体制変更の提案',
    mainTab: 'strategic',
    icon: '🏢',
    requiresCarefulConsideration: true
  },
  long_term_planning: {
    id: 'long_term_planning',
    name: '長期計画',
    description: '中長期的な戦略・計画の提案',
    mainTab: 'strategic',
    icon: '📅',
    requiresCarefulConsideration: true
  },
  
  // コミュニケーション（人事関連）カテゴリ（すべて慎重な検討が必要）
  recruitment_placement: {
    id: 'recruitment_placement',
    name: '採用・配置',
    description: '人材採用・人員配置に関する提案',
    mainTab: 'communication',
    icon: '👥',
    requiresCarefulConsideration: true
  },
  evaluation_promotion: {
    id: 'evaluation_promotion',
    name: '評価・昇進',
    description: '評価制度・昇進基準に関する提案',
    mainTab: 'communication',
    icon: '📊',
    requiresCarefulConsideration: true
  },
  welfare_benefits: {
    id: 'welfare_benefits',
    name: '福利厚生',
    description: '福利厚生・労働環境の改善提案',
    mainTab: 'communication',
    icon: '🎁',
    requiresCarefulConsideration: true
  },
  labor_issues: {
    id: 'labor_issues',
    name: '労務問題',
    description: '労働条件・労務管理に関する提案',
    mainTab: 'communication',
    icon: '⚖️',
    requiresCarefulConsideration: true
  },
  team_building: {
    id: 'team_building',
    name: 'チームビルディング',
    description: 'チーム強化・コミュニケーション改善',
    mainTab: 'communication',
    icon: '🤝',
    requiresCarefulConsideration: false
  },
  
  // フリースペースカテゴリ
  idea_sharing: {
    id: 'idea_sharing',
    name: 'アイデア共有',
    description: '自由なアイデア・提案の共有',
    mainTab: 'community',
    icon: '💡',
    requiresCarefulConsideration: false
  },
  casual_discussion: {
    id: 'casual_discussion',
    name: '雑談',
    description: 'カジュアルな話題・情報共有',
    mainTab: 'community',
    icon: '💬',
    requiresCarefulConsideration: false
  },
  event_planning: {
    id: 'event_planning',
    name: 'イベント企画',
    description: '社内イベント・交流会の企画',
    mainTab: 'community',
    icon: '🎉',
    requiresCarefulConsideration: false
  },
  
  // 緊急対応
  emergency: {
    id: 'emergency',
    name: '緊急対応',
    description: '緊急性の高い案件・対応',
    mainTab: 'emergency',
    icon: '🚨',
    requiresCarefulConsideration: false // 迅速な対応が優先
  }
};

// カテゴリ選択用のグループ定義
export const CATEGORY_GROUPS = {
  improvement: {
    name: '改善提案',
    categories: ['system_improvement', 'process_efficiency', 'business_improvement', 'cost_reduction']
  },
  strategic: {
    name: '戦略提案（慎重検討）',
    categories: ['new_business', 'market_strategy', 'organizational_change', 'long_term_planning']
  },
  communication: {
    name: 'コミュニケーション（人事関連・慎重検討）',
    categories: ['recruitment_placement', 'evaluation_promotion', 'welfare_benefits', 'labor_issues', 'team_building']
  },
  community: {
    name: 'フリースペース',
    categories: ['idea_sharing', 'casual_discussion', 'event_planning']
  }
};