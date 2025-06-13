import { Post } from '../../types';
import { hierarchicalDemoUsers } from './hierarchicalUsers';

// 段階的投稿公開システムのデモ用投稿データ
// 各施設・部署レベルで投票権限が明確に分かれている例

export const progressiveVisibilityDemoPosts: Post[] = [
  // 1. 立神リハ温泉病院の部署プロジェクト（DEPARTMENT レベル）
  // 他施設から見ると「閲覧のみ」、同施設内の他部署は「投票可能」
  {
    id: 'progressive-dept-001',
    type: 'improvement',
    proposalType: 'operational',
    content: 'リハビリテーション科からの提案：音声認識システムを活用した記録業務効率化。患者とのコミュニケーション時間を25%増加させ、記録時間を40%短縮します。立神リハ温泉病院内の他部署からもご意見をお聞かせください。',
    author: {
      id: 'user-rehab-001',
      name: '山田 理学療法士',
      department: 'リハビリテーション科',
      role: '理学療法士',
      position: '理学療法士',
      expertise: 4,
      hierarchyLevel: 2,
      permissionLevel: 2,
      stakeholderCategory: 'frontline'
    },
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2024-12-15T10:30:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 1,
      'neutral': 3,
      'support': 8,
      'strongly-support': 4
    },
    enhancedProjectStatus: {
      stage: 'DEPARTMENT_PROJECT',
      level: 'DEPARTMENT',
      approvalLevel: 'LEVEL_2',
      budget: 1500000,
      timeline: '4ヶ月',
      milestones: [
        { name: '企画・合意形成', status: 'completed', date: '2024-12-10' },
        { name: '部署内プロジェクト化', status: 'completed', date: '2024-12-15' },
        { name: '他部署への投票公開', status: 'in_progress', progress: 100, date: '2024-12-15' },
        { name: '実装開始', status: 'pending', date: '2025-01-15' },
        { name: '効果測定', status: 'pending', date: '2025-05-15' }
      ],
      resources: {
        budget_used: 0,
        budget_total: 1500000,
        team_size: 6,
        completion: 0
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_2',
      status: 'approved',
      history: [
        { level: 'LEVEL_1', approver: 'リハ科主任', status: 'approved', date: '2024-12-12' },
        { level: 'LEVEL_2', approver: 'リハ科長', status: 'approved', date: '2024-12-15' }
      ]
    },
    tags: ['音声認識', 'リハビリ', '部署プロジェクト', '立神リハ温泉病院'],
    comments: [
      {
        id: 'comment-prog-001-1',
        postId: 'progressive-dept-001',
        content: '音声認識の精度が気になります。医療用語の認識率はどの程度でしょうか？',
        author: {
          id: 'user-onsen-001',
          name: '佐藤 温泉療法士',
          department: '温泉療法科',
          role: '温泉療法士',
          stakeholderCategory: 'frontline'
        },
        anonymityLevel: 'real_name',
        timestamp: new Date('2024-12-16T09:00:00')
      }
    ]
  },

  // 2. 小原病院の部署プロジェクト（DEPARTMENT レベル）
  // 立神リハ温泉病院から見ると「閲覧のみ」
  {
    id: 'progressive-dept-002',
    type: 'improvement',
    proposalType: 'innovation',
    content: '看護部からの提案：IoTセンサーを活用した患者見守りシステム導入。夜間の巡回業務を30%効率化し、患者安全性も向上させます。小原病院内の医療情報部、事務部の皆様からもご意見をいただきたいです。',
    author: {
      id: 'user-nursing-001',
      name: '田中 看護師長',
      department: '看護部',
      role: '看護師長',
      position: '看護師長',
      expertise: 5,
      hierarchyLevel: 3,
      permissionLevel: 3,
      stakeholderCategory: 'management'
    },
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2024-12-14T14:20:00'),
    votes: {
      'strongly-oppose': 1,
      'oppose': 2,
      'neutral': 4,
      'support': 12,
      'strongly-support': 7
    },
    enhancedProjectStatus: {
      stage: 'DEPARTMENT_PROJECT',
      level: 'DEPARTMENT',
      approvalLevel: 'LEVEL_3',
      budget: 2800000,
      timeline: '6ヶ月',
      milestones: [
        { name: '企画・合意形成', status: 'completed', date: '2024-12-01' },
        { name: '部署内プロジェクト化', status: 'completed', date: '2024-12-14' },
        { name: '他部署への投票公開', status: 'in_progress', progress: 100, date: '2024-12-14' },
        { name: '予算申請', status: 'pending', date: '2025-01-01' },
        { name: '実装開始', status: 'pending', date: '2025-02-01' }
      ],
      resources: {
        budget_used: 0,
        budget_total: 2800000,
        team_size: 8,
        completion: 5
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_3',
      status: 'approved',
      history: [
        { level: 'LEVEL_1', approver: '看護師長', status: 'approved', date: '2024-12-05' },
        { level: 'LEVEL_2', approver: '副看護部長', status: 'approved', date: '2024-12-10' },
        { level: 'LEVEL_3', approver: '看護部長', status: 'approved', date: '2024-12-14' }
      ]
    },
    tags: ['IoT', '見守り', '看護', '部署プロジェクト', '小原病院'],
    comments: [
      {
        id: 'comment-prog-002-1',
        postId: 'progressive-dept-002',
        content: 'セキュリティ面での検討も重要ですね。患者情報保護の観点から慎重に進めたいです。',
        author: {
          id: 'user-it-001',
          name: '鈴木 システム管理者',
          department: '医療情報部',
          role: 'システム管理者',
          stakeholderCategory: 'management'
        },
        anonymityLevel: 'real_name',
        timestamp: new Date('2024-12-15T11:30:00')
      }
    ]
  },

  // 3. 施設プロジェクト化された例（FACILITY レベル）
  // 組織全体から閲覧可能、同じ施設内は投票可能
  {
    id: 'progressive-facility-001',
    type: 'improvement',
    proposalType: 'strategic',
    content: '小原病院全体のDX推進プロジェクト：電子カルテ統合システムによる診療効率化。全部署の業務フローを見直し、年間1200時間の業務時間削減を目指します。現在、施設レベルプロジェクトとして小原病院内全職員が投票可能です。',
    author: {
      id: 'user-it-director-001',
      name: '佐々木 情報部長',
      department: '医療情報部',
      role: '部長',
      position: '部長',
      expertise: 6,
      hierarchyLevel: 5,
      permissionLevel: 5,
      stakeholderCategory: 'management'
    },
    anonymityLevel: 'real_name',
    priority: 'urgent',
    timestamp: new Date('2024-12-10T09:00:00'),
    votes: {
      'strongly-oppose': 3,
      'oppose': 5,
      'neutral': 8,
      'support': 25,
      'strongly-support': 15
    },
    enhancedProjectStatus: {
      stage: 'FACILITY_PROJECT',
      level: 'FACILITY',
      approvalLevel: 'LEVEL_4',
      budget: 15000000,
      timeline: '18ヶ月',
      milestones: [
        { name: '部署内合意', status: 'completed', date: '2024-11-15' },
        { name: '部署プロジェクト化', status: 'completed', date: '2024-11-25' },
        { name: '施設プロジェクト化', status: 'completed', date: '2024-12-10' },
        { name: '予算承認', status: 'in_progress', progress: 70, date: '2024-12-25' },
        { name: '実装フェーズ1', status: 'pending', date: '2025-02-01' }
      ],
      resources: {
        budget_used: 500000,
        budget_total: 15000000,
        team_size: 20,
        completion: 10
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_4',
      status: 'in_progress',
      history: [
        { level: 'LEVEL_1', approver: '医療情報課長', status: 'approved', date: '2024-11-20' },
        { level: 'LEVEL_2', approver: '医療情報部長', status: 'approved', date: '2024-11-28' },
        { level: 'LEVEL_3', approver: '副院長', status: 'approved', date: '2024-12-05' },
        { level: 'LEVEL_4', approver: '院長', status: 'pending', date: null }
      ]
    },
    tags: ['DX', '電子カルテ', '施設プロジェクト', '小原病院', '全部署'],
    comments: [
      {
        id: 'comment-prog-003-1',
        postId: 'progressive-facility-001',
        content: '現場での操作性向上を重視してください。使いやすいシステムでないと定着しません。',
        author: {
          id: 'user-nurse-002',
          name: '山本 看護師',
          department: '看護部',
          role: '看護師',
          stakeholderCategory: 'frontline'
        },
        anonymityLevel: 'real_name',
        timestamp: new Date('2024-12-12T16:45:00')
      },
      {
        id: 'comment-prog-003-2',
        postId: 'progressive-facility-001',
        content: '研修体制も重要です。段階的な導入スケジュールを検討していただきたいです。',
        author: {
          id: 'user-admin-001',
          name: '高橋 事務長',
          department: '事務部',
          role: '事務長',
          stakeholderCategory: 'management'
        },
        anonymityLevel: 'real_name',
        timestamp: new Date('2024-12-13T10:20:00')
      }
    ]
  },

  // 4. 法人プロジェクト化された例（CORPORATE レベル）
  // 全組織で投票可能
  {
    id: 'progressive-corporate-001',
    type: 'improvement',
    proposalType: 'strategic',
    content: '医療法人全体の働き方改革プロジェクト：全施設でのワークライフバランス向上施策。フレックスタイム制度、在宅勤務拡充、福利厚生充実により職員満足度30%向上を目指します。法人プロジェクトとして全施設・全職員が投票可能です。',
    author: {
      id: 'user-hr-director-001',
      name: '石川 人事部長',
      department: '人事部',
      role: '部長',
      position: '部長',
      expertise: 7,
      hierarchyLevel: 6,
      permissionLevel: 6,
      stakeholderCategory: 'management'
    },
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2024-12-05T11:00:00'),
    votes: {
      'strongly-oppose': 5,
      'oppose': 8,
      'neutral': 15,
      'support': 45,
      'strongly-support': 32
    },
    enhancedProjectStatus: {
      stage: 'CORPORATE_PROJECT',
      level: 'CORPORATE',
      approvalLevel: 'LEVEL_5',
      budget: 50000000,
      timeline: '24ヶ月',
      milestones: [
        { name: '施設別合意形成', status: 'completed', date: '2024-11-01' },
        { name: '施設プロジェクト化', status: 'completed', date: '2024-11-20' },
        { name: '法人プロジェクト化', status: 'completed', date: '2024-12-05' },
        { name: '理事会承認', status: 'in_progress', progress: 80, date: '2024-12-25' },
        { name: '実施フェーズ1', status: 'pending', date: '2025-04-01' }
      ],
      resources: {
        budget_used: 2000000,
        budget_total: 50000000,
        team_size: 35,
        completion: 15
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_5',
      status: 'in_progress',
      history: [
        { level: 'LEVEL_1', approver: '人事課長', status: 'approved', date: '2024-11-10' },
        { level: 'LEVEL_2', approver: '人事部長', status: 'approved', date: '2024-11-18' },
        { level: 'LEVEL_3', approver: '事務局長', status: 'approved', date: '2024-11-25' },
        { level: 'LEVEL_4', approver: '理事長', status: 'approved', date: '2024-12-02' },
        { level: 'LEVEL_5', approver: '理事会', status: 'pending', date: null }
      ]
    },
    tags: ['働き方改革', 'ワークライフバランス', '法人プロジェクト', '全施設'],
    comments: [
      {
        id: 'comment-prog-004-1',
        postId: 'progressive-corporate-001',
        content: 'リハビリ科としても在宅勤務は魅力的ですが、患者対応との兼ね合いが課題ですね。',
        author: {
          id: 'user-rehab-002',
          name: '立神リハ 作業療法士',
          department: 'リハビリテーション科',
          role: '作業療法士',
          stakeholderCategory: 'frontline'
        },
        anonymityLevel: 'facility_department',
        timestamp: new Date('2024-12-08T14:30:00')
      },
      {
        id: 'comment-prog-004-2',
        postId: 'progressive-corporate-001',
        content: '小原病院でも同様の課題があります。部署ごとに実施可能な範囲を検討していきましょう。',
        author: {
          id: 'user-kohara-nurse-001',
          name: '小原病院 看護師',
          department: '看護部',
          role: '看護師',
          stakeholderCategory: 'frontline'
        },
        anonymityLevel: 'facility_department',
        timestamp: new Date('2024-12-09T09:15:00')
      }
    ]
  },

  // 5. PENDING状態の投稿（同じ部署内でのみ投票可能）
  {
    id: 'progressive-pending-001',
    type: 'improvement',
    proposalType: 'operational',
    content: '温泉療法科内での提案：温泉の成分分析データをデジタル化し、患者に最適な温泉療法プログラムを自動提案するシステム。まずは科内での合意形成を図りたいと思います。',
    author: {
      id: 'user-onsen-002',
      name: '中村 温泉療法士',
      department: '温泉療法科',
      role: '温泉療法士',
      position: '温泉療法士',
      expertise: 3,
      hierarchyLevel: 2,
      permissionLevel: 2,
      stakeholderCategory: 'frontline'
    },
    anonymityLevel: 'real_name',
    priority: 'medium',
    timestamp: new Date('2024-12-18T13:45:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 2,
      'support': 4,
      'strongly-support': 2
    },
    enhancedProjectStatus: {
      stage: 'DEPARTMENT_PROJECT',
      level: 'DEPARTMENT',
      approvalLevel: 'LEVEL_1',
      budget: 800000,
      timeline: '3ヶ月',
      milestones: [
        { name: '科内合意形成', status: 'in_progress', progress: 75, date: '2024-12-25' },
        { name: '部署プロジェクト化判定', status: 'pending', date: '2025-01-05' },
        { name: '他部署公開', status: 'pending', date: '2025-01-10' },
        { name: '実装検討', status: 'pending', date: '2025-02-01' }
      ],
      resources: {
        budget_used: 0,
        budget_total: 800000,
        team_size: 4,
        completion: 0
      }
    },
    tags: ['温泉療法', 'デジタル化', '科内提案', '立神リハ温泉病院'],
    comments: [
      {
        id: 'comment-prog-005-1',
        postId: 'progressive-pending-001',
        content: '面白いアイデアですね！患者データとの連携も考えられそうです。',
        author: {
          id: 'user-onsen-003',
          name: '温泉療法科 主任',
          department: '温泉療法科',
          role: '主任',
          stakeholderCategory: 'management'
        },
        anonymityLevel: 'real_name',
        timestamp: new Date('2024-12-19T10:30:00')
      }
    ]
  },

  // 6. Level 7による緊急エスカレーション事例
  {
    id: 'progressive-emergency-001',
    type: 'improvement',
    proposalType: 'riskManagement',
    content: '【緊急エスカレーション】感染症対策強化プロジェクト：新型感染症の流行に備えた緊急体制整備。Level 7権限により施設プロジェクトに緊急昇格されました。全施設での即座な対応が必要です。',
    author: {
      id: 'user-infection-001',
      name: '感染管理看護師',
      department: '看護部',
      role: '感染管理看護師',
      position: '感染管理看護師',
      expertise: 5,
      hierarchyLevel: 4,
      permissionLevel: 4,
      stakeholderCategory: 'management'
    },
    anonymityLevel: 'real_name',
    priority: 'urgent',
    timestamp: new Date('2024-12-17T08:00:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 1,
      'neutral': 2,
      'support': 18,
      'strongly-support': 25
    },
    enhancedProjectStatus: {
      stage: 'FACILITY_PROJECT',
      level: 'FACILITY',
      approvalLevel: 'LEVEL_4',
      budget: 5000000,
      timeline: '緊急対応',
      milestones: [
        { name: '初期提案', status: 'completed', date: '2024-12-16' },
        { name: '緊急エスカレーション', status: 'completed', date: '2024-12-17' },
        { name: '緊急予算承認', status: 'in_progress', progress: 90, date: '2024-12-18' },
        { name: '即時実装開始', status: 'pending', date: '2024-12-20' }
      ],
      resources: {
        budget_used: 1000000,
        budget_total: 5000000,
        team_size: 15,
        completion: 20
      }
    },
    approvalFlow: {
      currentLevel: 'LEVEL_4',
      status: 'approved',
      history: [
        { level: 'LEVEL_7_OVERRIDE', approver: '執行役員秘書', status: 'approved', date: '2024-12-17' },
        { level: 'LEVEL_4', approver: '院長', status: 'approved', date: '2024-12-17' }
      ]
    },
    isEmergencyEscalated: true,
    escalatedBy: '執行役員秘書（Level 7）',
    escalatedDate: '2024-12-17',
    escalationReason: '新型感染症の急速な拡大に対する緊急対応',
    tags: ['感染症対策', '緊急エスカレーション', 'Level7権限', '全施設対応'],
    comments: [
      {
        id: 'comment-prog-006-1',
        postId: 'progressive-emergency-001',
        content: '緊急対応として適切な判断だと思います。各部署で即座に対応体制を整えましょう。',
        author: {
          id: 'user-admin-002',
          name: '事務部 課長',
          department: '事務部',
          role: '課長',
          stakeholderCategory: 'management'
        },
        anonymityLevel: 'real_name',
        timestamp: new Date('2024-12-17T09:30:00')
      }
    ]
  }
];

// ユーザーの所属に基づく投票権限の状態を示すメタデータ
export const votingPermissionExamples = {
  // 立神リハ温泉病院のリハビリテーション科職員の場合
  'user-rehab-001': {
    'progressive-dept-001': { canVote: false, reason: '投稿者の所属部署のため投票不可', accessLevel: 'limited' },
    'progressive-dept-002': { canVote: false, reason: '他施設のため閲覧のみ', accessLevel: 'view_only' },
    'progressive-facility-001': { canVote: false, reason: '他施設のため閲覧のみ', accessLevel: 'view_only' },
    'progressive-corporate-001': { canVote: true, reason: '法人プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-pending-001': { canVote: false, reason: '他部署のPENDING状態のため閲覧不可', accessLevel: 'hidden' },
    'progressive-emergency-001': { canVote: true, reason: '緊急エスカレーション、施設レベルのため投票可能', accessLevel: 'full' }
  },
  
  // 立神リハ温泉病院の温泉療法科職員の場合
  'user-onsen-002': {
    'progressive-dept-001': { canVote: true, reason: '同施設内の他部署プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-dept-002': { canVote: false, reason: '他施設のため閲覧のみ', accessLevel: 'view_only' },
    'progressive-facility-001': { canVote: false, reason: '他施設のため閲覧のみ', accessLevel: 'view_only' },
    'progressive-corporate-001': { canVote: true, reason: '法人プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-pending-001': { canVote: true, reason: '同じ部署内のPENDING状態のため投票可能', accessLevel: 'full' },
    'progressive-emergency-001': { canVote: true, reason: '緊急エスカレーション、施設レベルのため投票可能', accessLevel: 'full' }
  },
  
  // 小原病院の看護部職員の場合
  'user-nursing-001': {
    'progressive-dept-001': { canVote: false, reason: '他施設のため閲覧のみ', accessLevel: 'view_only' },
    'progressive-dept-002': { canVote: false, reason: '投稿者の所属部署のため投票不可', accessLevel: 'limited' },
    'progressive-facility-001': { canVote: true, reason: '同施設内の施設プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-corporate-001': { canVote: true, reason: '法人プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-pending-001': { canVote: false, reason: '他施設・他部署のPENDING状態のため閲覧不可', accessLevel: 'hidden' },
    'progressive-emergency-001': { canVote: true, reason: '緊急エスカレーション、施設レベルのため投票可能', accessLevel: 'full' }
  },
  
  // 小原病院の医療情報部職員の場合
  'user-it-001': {
    'progressive-dept-001': { canVote: false, reason: '他施設のため閲覧のみ', accessLevel: 'view_only' },
    'progressive-dept-002': { canVote: true, reason: '同施設内の他部署プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-facility-001': { canVote: true, reason: '同施設内の施設プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-corporate-001': { canVote: true, reason: '法人プロジェクトのため投票可能', accessLevel: 'full' },
    'progressive-pending-001': { canVote: false, reason: '他施設・他部署のPENDING状態のため閲覧不可', accessLevel: 'hidden' },
    'progressive-emergency-001': { canVote: true, reason: '緊急エスカレーション、施設レベルのため投票可能', accessLevel: 'full' }
  }
};

// アクセスレベルの説明
export const accessLevelDescriptions = {
  'full': '投票・コメント可能',
  'limited': 'コメントのみ可能（同部署は投票済みのため）',
  'view_only': '閲覧のみ（他施設のため投票権限なし）',
  'hidden': '閲覧不可（権限外）'
};

export default progressiveVisibilityDemoPosts;