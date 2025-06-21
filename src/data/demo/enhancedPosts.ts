// 新マッピング対応の投稿デモデータ - 13段階権限レベルと新スコアリング対応
import { enhancedDemoUsers } from './enhancedUsers';

export interface EnhancedPostDemo {
  id: string;
  title: string;
  content: string;
  author: string;
  authorLevel: number;
  facility: string;
  department: string;
  category: 'operational' | 'communication' | 'innovation' | 'strategic';
  postType: 'improvement' | 'community' | 'report' | 'operational' | 'communication' | 'innovation' | 'strategic';
  estimatedBudget?: number;
  expectedScope: 'TEAM' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'STRATEGIC';
  currentScore: number;
  voteCount: number;
  supportLevel: {
    stronglySupport: number;
    support: number;
    neutral: number;
    oppose: number;
    stronglyOppose: number;
  };
  createdAt: Date;
  tags: string[];
  isProjectified?: boolean;
  projectId?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  implementationComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'VERY_COMPLEX';
  expectedImpact: 'LOCAL' | 'DEPARTMENTAL' | 'FACILITY_WIDE' | 'ORGANIZATION_WIDE' | 'STRATEGIC';
  isHRRelated?: boolean;
  hrCategory?: 'interview-system' | 'training-career' | 'hr-policy' | 'strategic-hr';
}

export const enhancedPostDemos: EnhancedPostDemo[] = [
  // レベル1（一般スタッフ）からの投稿
  {
    id: 'post_001',
    title: '夜勤時の患者コール対応の効率化',
    content: '夜勤中の患者からのコールに対する対応時間を短縮するため、各部屋に優先度表示システムを導入してはどうでしょうか。緊急度の高いコールを視覚的に判別できれば、より迅速な対応が可能になります。',
    author: 'staff_001',
    authorLevel: 1,
    facility: '小原病院本院',
    department: '内科病棟',
    category: 'operational',
    postType: 'improvement',
    estimatedBudget: 25000,
    expectedScope: 'TEAM',
    currentScore: 58.5,
    voteCount: 24,
    supportLevel: {
      stronglySupport: 8,
      support: 12,
      neutral: 3,
      oppose: 1,
      stronglyOppose: 0
    },
    createdAt: new Date('2024-01-10T14:30:00'),
    tags: ['夜勤', '患者ケア', '効率化', 'システム'],
    urgency: 'MEDIUM',
    implementationComplexity: 'SIMPLE',
    expectedImpact: 'LOCAL'
  },
  {
    id: 'post_002',
    title: '薬剤在庫管理のバーコード化提案',
    content: '現在の薬剤在庫管理は目視確認が中心ですが、バーコードシステムを導入することで在庫の正確性向上と確認時間短縮が期待できます。特に期限管理の面で大きな改善が見込まれます。',
    author: 'staff_002',
    authorLevel: 1,
    facility: '小原病院本院',
    department: '薬剤部',
    category: 'operational',
    postType: 'improvement',
    estimatedBudget: 42000,
    expectedScope: 'TEAM',
    currentScore: 48.2,
    voteCount: 18,
    supportLevel: {
      stronglySupport: 6,
      support: 9,
      neutral: 2,
      oppose: 1,
      stronglyOppose: 0
    },
    createdAt: new Date('2024-01-12T09:15:00'),
    tags: ['薬剤管理', 'バーコード', '在庫管理', '効率化'],
    urgency: 'MEDIUM',
    implementationComplexity: 'MODERATE',
    expectedImpact: 'DEPARTMENTAL'
  },

  // レベル2（チーフ・主任）からの投稿
  {
    id: 'post_003',
    title: '看護スタッフのシフト調整システム改善',
    content: '現在の手動シフト作成は時間がかかり、スタッフの希望も反映しにくい状況です。デジタルツールを活用したシフト管理システムを導入し、公平性と効率性を向上させたいと考えています。',
    author: 'supervisor_001',
    authorLevel: 2,
    facility: '小原病院本院',
    department: '内科病棟',
    category: 'operational',
    postType: 'improvement',
    estimatedBudget: 85000,
    expectedScope: 'DEPARTMENT',
    currentScore: 92.3,
    voteCount: 31,
    supportLevel: {
      stronglySupport: 15,
      support: 12,
      neutral: 3,
      oppose: 1,
      stronglyOppose: 0
    },
    createdAt: new Date('2024-01-08T16:45:00'),
    tags: ['シフト管理', 'デジタル化', 'スタッフ満足度', '公平性'],
    urgency: 'HIGH',
    implementationComplexity: 'MODERATE',
    expectedImpact: 'DEPARTMENTAL'
  },
  {
    id: 'post_004',
    title: '放射線科の検査予約システム最適化',
    content: '検査予約の重複や空き時間の発生を減らすため、AIを活用した予約最適化システムの導入を提案します。患者の待ち時間短縮と検査効率の向上が期待できます。',
    author: 'supervisor_002',
    authorLevel: 2,
    facility: '小原病院本院',
    department: '放射線科',
    category: 'innovation',
    postType: 'improvement',
    estimatedBudget: 120000,
    expectedScope: 'DEPARTMENT',
    currentScore: 105.7,
    voteCount: 28,
    supportLevel: {
      stronglySupport: 12,
      support: 13,
      neutral: 2,
      oppose: 1,
      stronglyOppose: 0
    },
    createdAt: new Date('2024-01-05T11:20:00'),
    tags: ['AI', '予約システム', '検査効率', '患者満足度'],
    urgency: 'MEDIUM',
    implementationComplexity: 'COMPLEX',
    expectedImpact: 'FACILITY_WIDE'
  },

  // レベル3（係長・マネージャー）からの投稿
  {
    id: 'post_005',
    title: '部門間連携強化のための情報共有プラットフォーム構築',
    content: '看護部と医事課、薬剤部間での患者情報共有をより迅速かつ正確に行うため、統合情報プラットフォームの構築を提案します。入退院から服薬指導まで一連の流れをスムーズにできます。',
    author: 'dept_head_001',
    authorLevel: 3,
    facility: '小原病院本院',
    department: '内科病棟',
    category: 'operational',
    postType: 'improvement',
    estimatedBudget: 175000,
    expectedScope: 'DEPARTMENT',
    currentScore: 138.4,
    voteCount: 42,
    supportLevel: {
      stronglySupport: 18,
      support: 16,
      neutral: 6,
      oppose: 2,
      stronglyOppose: 0
    },
    createdAt: new Date('2024-01-03T13:10:00'),
    tags: ['部門連携', '情報共有', 'プラットフォーム', '患者ケア'],
    urgency: 'HIGH',
    implementationComplexity: 'COMPLEX',
    expectedImpact: 'FACILITY_WIDE'
  },

  // レベル4（課長）からの投稿
  {
    id: 'post_006',
    title: '病院全体のペーパーレス化推進プロジェクト',
    content: '医事課主導で病院全体のペーパーレス化を推進したいと考えています。電子化により業務効率の大幅向上と環境負荷軽減、コスト削減が期待できます。段階的な実装計画を立てて進めます。',
    author: 'facility_head_001',
    authorLevel: 4,
    facility: '小原病院本院',
    department: '医事課',
    category: 'innovation',
    postType: 'improvement',
    estimatedBudget: 3200000,
    expectedScope: 'FACILITY',
    currentScore: 285.6,
    voteCount: 67,
    supportLevel: {
      stronglySupport: 32,
      support: 25,
      neutral: 8,
      oppose: 2,
      stronglyOppose: 0
    },
    createdAt: new Date('2024-01-01T10:00:00'),
    tags: ['ペーパーレス', 'DX', '環境', 'コスト削減'],
    urgency: 'MEDIUM',
    implementationComplexity: 'VERY_COMPLEX',
    expectedImpact: 'FACILITY_WIDE',
    isProjectified: true,
    projectId: 'facility_002'
  },
  {
    id: 'post_007',
    title: '看護師の働き方改革とメンタルヘルス支援体制強化',
    content: '看護師の離職率改善と働きがい向上のため、勤務体制の見直しとメンタルヘルス支援体制の強化を提案します。シフト自由度の向上、カウンセリング体制の整備、キャリア支援の充実を図ります。',
    author: 'facility_head_002',
    authorLevel: 4,
    facility: '小原病院本院',
    department: '看護部',
    category: 'strategic',
    postType: 'improvement',
    estimatedBudget: 2800000,
    expectedScope: 'FACILITY',
    currentScore: 378.9,
    voteCount: 89,
    supportLevel: {
      stronglySupport: 45,
      support: 32,
      neutral: 9,
      oppose: 2,
      stronglyOppose: 1
    },
    createdAt: new Date('2023-12-28T14:20:00'),
    tags: ['働き方改革', 'メンタルヘルス', '離職率改善', 'キャリア支援'],
    urgency: 'HIGH',
    implementationComplexity: 'COMPLEX',
    expectedImpact: 'ORGANIZATION_WIDE',
    isHRRelated: true,
    hrCategory: 'hr-policy'
  },

  // レベル5（人財統括本部 戦略企画）からの投稿
  {
    id: 'post_008',
    title: '全職員のキャリア開発支援システム構築',
    content: '組織全体の人材育成力強化のため、個別キャリア支援システムの構築を提案します。面談記録管理、スキル評価、研修推奨機能を統合し、職員の成長と組織の発展を同時に実現します。',
    author: 'hr_strategic_001',
    authorLevel: 5,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    postType: 'strategic',
    estimatedBudget: 4200000,
    expectedScope: 'ORGANIZATION',
    currentScore: 485.2,
    voteCount: 96,
    supportLevel: {
      stronglySupport: 52,
      support: 28,
      neutral: 12,
      oppose: 3,
      stronglyOppose: 1
    },
    createdAt: new Date('2023-12-25T09:30:00'),
    tags: ['キャリア開発', '人材育成', 'システム構築', '組織発展'],
    urgency: 'MEDIUM',
    implementationComplexity: 'VERY_COMPLEX',
    expectedImpact: 'ORGANIZATION_WIDE',
    isHRRelated: true,
    hrCategory: 'training-career',
    isProjectified: true,
    projectId: 'hr_special_001'
  },

  // レベル6（キャリア支援部門員）からの投稿
  {
    id: 'post_009',
    title: '新人看護師のメンター制度体系化',
    content: '新人看護師の早期戦力化と定着率向上のため、先輩看護師によるメンター制度を体系化したいと考えています。メンター研修、定期面談システム、評価制度を含む包括的な支援体制を構築します。',
    author: 'career_staff_001',
    authorLevel: 6,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    postType: 'strategic',
    estimatedBudget: 1800000,
    expectedScope: 'ORGANIZATION',
    currentScore: 425.8,
    voteCount: 78,
    supportLevel: {
      stronglySupport: 42,
      support: 24,
      neutral: 9,
      oppose: 2,
      stronglyOppose: 1
    },
    createdAt: new Date('2023-12-22T15:45:00'),
    tags: ['メンター制度', '新人研修', '定着率', '人材育成'],
    urgency: 'HIGH',
    implementationComplexity: 'COMPLEX',
    expectedImpact: 'ORGANIZATION_WIDE',
    isHRRelated: true,
    hrCategory: 'training-career'
  },

  // レベル9（部長・本部長）からの投稿
  {
    id: 'post_010',
    title: '地域医療連携ネットワーク構築による診療体制強化',
    content: '内科部として地域の医療機関との連携ネットワークを構築し、患者の継続的ケア体制を強化したいと考えています。紹介患者の受け入れ体制整備と逆紹介システムの充実により、地域医療の質向上に貢献します。',
    author: 'director_001',
    authorLevel: 9,
    facility: '小原病院本院',
    department: '内科',
    category: 'strategic',
    postType: 'strategic',
    estimatedBudget: 12000000,
    expectedScope: 'ORGANIZATION',
    currentScore: 675.3,
    voteCount: 125,
    supportLevel: {
      stronglySupport: 68,
      support: 38,
      neutral: 15,
      oppose: 3,
      stronglyOppose: 1
    },
    createdAt: new Date('2023-12-20T11:00:00'),
    tags: ['地域医療', '医療連携', 'ネットワーク', '診療体制'],
    urgency: 'MEDIUM',
    implementationComplexity: 'VERY_COMPLEX',
    expectedImpact: 'STRATEGIC',
    isProjectified: true,
    projectId: 'org_001'
  },

  // レベル12（CEO）からの投稿
  {
    id: 'post_011',
    title: '次世代医療人材育成のための戦略的教育プログラム',
    content: '医療業界の将来を担う人材育成のため、包括的な教育プログラムを構築します。最新医療技術の習得、リーダーシップ開発、地域医療への貢献意識醸成を柱とした長期的な人材育成戦略です。',
    author: 'ceo_001',
    authorLevel: 12,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    postType: 'strategic',
    estimatedBudget: 15000000,
    expectedScope: 'STRATEGIC',
    currentScore: 1024.7,
    voteCount: 187,
    supportLevel: {
      stronglySupport: 98,
      support: 56,
      neutral: 25,
      oppose: 6,
      stronglyOppose: 2
    },
    createdAt: new Date('2023-12-18T08:30:00'),
    tags: ['人材育成', '戦略的教育', 'リーダーシップ', '次世代'],
    urgency: 'MEDIUM',
    implementationComplexity: 'VERY_COMPLEX',
    expectedImpact: 'STRATEGIC',
    isHRRelated: true,
    hrCategory: 'strategic-hr',
    isProjectified: true,
    projectId: 'hr_special_004'
  },

  // レベル13（理事長）からの投稿
  {
    id: 'post_012',
    title: '小原グループ全体の医療DX推進とデジタル変革',
    content: '小原グループ全体でのデジタル変革を推進し、医療の質向上と効率化を同時に実現します。AI診断支援、遠隔医療、電子カルテ統合、IoT活用による包括的なDX戦略により、次世代の医療組織を目指します。',
    author: 'chairman_001',
    authorLevel: 13,
    facility: '本部',
    department: '理事会',
    category: 'strategic',
    postType: 'strategic',
    estimatedBudget: 80000000,
    expectedScope: 'STRATEGIC',
    currentScore: 1456.8,
    voteCount: 234,
    supportLevel: {
      stronglySupport: 128,
      support: 72,
      neutral: 28,
      oppose: 5,
      stronglyOppose: 1
    },
    createdAt: new Date('2023-12-15T10:15:00'),
    tags: ['DX', 'デジタル変革', 'AI', '次世代医療'],
    urgency: 'CRITICAL',
    implementationComplexity: 'VERY_COMPLEX',
    expectedImpact: 'STRATEGIC',
    isProjectified: true,
    projectId: 'strategic_001'
  },

  // 中間レベル（レベル7, 8, 10, 11）からの追加投稿
  {
    id: 'post_013',
    title: '職員満足度向上のための総合的働き方改革',
    content: 'キャリア支援部門として、全職員の働きがい向上と生産性向上を両立する働き方改革を提案します。柔軟な勤務制度、スキルアップ支援、ワークライフバランス改善を包括的に推進します。',
    author: 'career_head_001',
    authorLevel: 7,
    facility: '本部',
    department: '人財統括本部',
    category: 'strategic',
    postType: 'strategic',
    estimatedBudget: 6500000,
    expectedScope: 'ORGANIZATION',
    currentScore: 587.4,
    voteCount: 103,
    supportLevel: {
      stronglySupport: 58,
      support: 32,
      neutral: 11,
      oppose: 2,
      stronglyOppose: 0
    },
    createdAt: new Date('2023-12-12T13:25:00'),
    tags: ['働き方改革', '職員満足度', 'ワークライフバランス', '生産性'],
    urgency: 'HIGH',
    implementationComplexity: 'COMPLEX',
    expectedImpact: 'ORGANIZATION_WIDE',
    isHRRelated: true,
    hrCategory: 'hr-policy'
  }
];

// 投稿カテゴリ別統計
export const postCategoryStatistics = {
  operational: {
    totalPosts: 6,
    averageScore: 128.3,
    averageBudget: 1425000,
    projectificationRate: 0.33
  },
  communication: {
    totalPosts: 0,
    averageScore: 0,
    averageBudget: 0,
    projectificationRate: 0
  },
  innovation: {
    totalPosts: 2,
    averageScore: 196.2,
    averageBudget: 1660000,
    projectificationRate: 0.50
  },
  strategic: {
    totalPosts: 5,
    averageScore: 783.9,
    averageBudget: 18440000,
    projectificationRate: 0.80
  }
};

// 権限レベル別投稿統計
export const permissionLevelPostingStatistics = {
  1: { totalPosts: 2, averageScore: 53.4, projectificationRate: 0.0 },
  2: { totalPosts: 2, averageScore: 99.0, projectificationRate: 0.0 },
  3: { totalPosts: 1, averageScore: 138.4, projectificationRate: 0.0 },
  4: { totalPosts: 2, averageScore: 332.3, projectificationRate: 1.0 },
  5: { totalPosts: 1, averageScore: 485.2, projectificationRate: 1.0 },
  6: { totalPosts: 1, averageScore: 425.8, projectificationRate: 0.0 },
  7: { totalPosts: 1, averageScore: 587.4, projectificationRate: 0.0 },
  9: { totalPosts: 1, averageScore: 675.3, projectificationRate: 1.0 },
  12: { totalPosts: 1, averageScore: 1024.7, projectificationRate: 1.0 },
  13: { totalPosts: 1, averageScore: 1456.8, projectificationRate: 1.0 }
};

export default enhancedPostDemos;