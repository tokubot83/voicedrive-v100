import { Project, ProjectStatus, ProjectPriority, ProjectCategory } from '../../types';
import { demoPosts } from './posts';

export const demoProjects: Project[] = [
  // 非常勤職員の慶弔休暇制度プロジェクト（施設内投票フェーズ）
  {
    id: 'proj-1',
    title: '非常勤職員の慶弔休暇取得制度の導入',
    description: `非常勤職員にも慶弔休暇制度を適用し、全職員が安心して働ける環境を整備するプロジェクト。

【背景】
現在、非常勤職員には慶弔休暇の制度がなく、親族の葬儀等でも通常の欠勤扱いまたは有給休暇を使用している状況。常勤職員との待遇差により、職場の一体感や非常勤職員の定着率に影響が出ている。

【目的】
1. 非常勤職員の福利厚生向上
2. 職員間の待遇格差の是正
3. 優秀な非常勤職員の定着率向上
4. 職場全体のモチベーション向上

【実施内容】
- 慶弔休暇規程の改定
- 対象：勤続6ヶ月以上の非常勤職員
- 適用範囲：配偶者、子、父母の死亡時（3日間）
- 労務管理システムの更新`,
    status: 'approved',
    priority: 'high',
    category: 'employee-welfare',
    originalPostId: 'post-1',
    relatedPostIds: ['post-1'],
    createdBy: 'user-7',
    createdByName: '渡辺 由美',
    createdAt: new Date('2025-05-15T10:00:00'),
    updatedAt: new Date('2025-06-15T14:30:00'),
    startDate: new Date('2025-07-01'),
    targetDate: new Date('2025-09-01'),
    actualEndDate: null,
    budget: 500000,
    actualCost: 0,
    roi: 0,
    teamMembers: [
      {
        userId: 'user-7',
        userName: '渡辺 由美',
        role: 'プロジェクトリーダー',
        joinedAt: new Date('2025-05-15'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-3',
        userName: '鈴木 美香',
        role: '監督者',
        joinedAt: new Date('2025-05-20'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-4',
        userName: '田中 恵子',
        role: 'アドバイザー',
        joinedAt: new Date('2025-05-20'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-2',
        userName: '佐藤 花子',
        role: '承認者',
        joinedAt: new Date('2025-06-01'),
        contribution: 0,
        isProvisional: false
      }
    ],
    milestones: [
      {
        id: 'ms-1',
        title: '現状調査・他施設事例収集',
        description: '非常勤職員の勤務実態調査と他医療機関の事例収集',
        dueDate: new Date('2025-05-31'),
        completed: true,
        completedDate: new Date('2025-05-28'),
        assignedTo: ['user-7']
      },
      {
        id: 'ms-2',
        title: '制度案の作成と部門内協議',
        description: '具体的な制度内容の検討と看護部内での合意形成',
        dueDate: new Date('2025-06-10'),
        completed: true,
        completedDate: new Date('2025-06-08'),
        assignedTo: ['user-7', 'user-4']
      },
      {
        id: 'ms-3',
        title: '人事部門との調整',
        description: '就業規則改定案の作成と人事部門との協議',
        dueDate: new Date('2025-06-20'),
        completed: true,
        completedDate: new Date('2025-06-18'),
        assignedTo: ['user-3', 'user-2']
      },
      {
        id: 'ms-4',
        title: '施設内投票の実施',
        description: '全職員による投票（現在実施中）',
        dueDate: new Date('2025-06-30'),
        completed: false,
        assignedTo: ['user-3']
      },
      {
        id: 'ms-5',
        title: '規程改定と周知',
        description: '就業規則の改定と全職員への周知徹底',
        dueDate: new Date('2025-07-31'),
        completed: false,
        assignedTo: ['user-2']
      }
    ],
    currentPhase: 'facility_voting',
    workflowStages: [
      {
        id: 'wf-1',
        name: '提案',
        status: 'completed',
        completedAt: new Date('2025-05-15'),
        approver: 'user-7',
        approverName: '渡辺 由美',
        comments: '非常勤職員の立場から切実な問題提起'
      },
      {
        id: 'wf-2',
        name: '部門検討',
        status: 'completed',
        completedAt: new Date('2025-06-10'),
        approver: 'user-3',
        approverName: '鈴木 美香',
        comments: '看護部として全面的に支援'
      },
      {
        id: 'wf-3',
        name: '施設承認',
        status: 'in_progress',
        approver: 'user-2',
        approverName: '佐藤 花子',
        comments: '施設内投票実施中（6/30まで）'
      },
      {
        id: 'wf-4',
        name: '法人承認',
        status: 'pending',
        approver: null,
        approverName: null
      }
    ],
    tags: ['福利厚生', '非常勤職員', '働き方改革', '慶弔休暇'],
    visibility: 'facility',
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    impactScore: 85,
    feasibilityScore: 90,
    alignmentScore: 95,
    totalScore: 90,
    votingDeadline: new Date('2025-06-30T23:59:59'),
    requiredVotes: 50,
    currentVotes: 32,
    approvalPercentage: 94
  },

  // 音声入力システム導入プロジェクト（部門検討中）
  {
    id: 'proj-2',
    title: '音声入力を活用した申し送り業務の効率化',
    description: `申し送り記録作成の効率化を図るため、音声入力システムを導入するプロジェクト。

【期待効果】
- 記録作成時間を15-20分から5分程度に短縮
- 記載漏れリスクの低減
- 残業時間の削減（月間20時間削減見込み）`,
    status: 'reviewing',
    priority: 'medium',
    category: 'innovation',
    originalPostId: 'post-4',
    relatedPostIds: ['post-4'],
    createdBy: 'user-4',
    createdByName: '田中 恵子',
    createdAt: new Date('2025-06-08T16:45:00'),
    updatedAt: new Date('2025-06-13T10:00:00'),
    startDate: new Date('2025-08-01'),
    targetDate: new Date('2025-10-31'),
    actualEndDate: null,
    budget: 1200000,
    actualCost: 0,
    roi: 0,
    teamMembers: [
      {
        userId: 'user-4',
        userName: '田中 恵子',
        role: 'プロジェクトリーダー',
        joinedAt: new Date('2025-06-08'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'user-3',
        userName: '鈴木 美香',
        role: 'スポンサー',
        joinedAt: new Date('2025-06-10'),
        contribution: 0,
        isProvisional: false
      }
    ],
    milestones: [
      {
        id: 'ms-1',
        title: 'システム要件定義',
        description: '必要な機能と仕様の明確化',
        dueDate: new Date('2025-07-15'),
        completed: false,
        assignedTo: ['user-4']
      },
      {
        id: 'ms-2',
        title: 'ベンダー選定',
        description: 'システム提供業者の選定と見積もり取得',
        dueDate: new Date('2025-07-31'),
        completed: false,
        assignedTo: ['user-3', 'user-4']
      }
    ],
    currentPhase: 'department_discussion',
    workflowStages: [
      {
        id: 'wf-1',
        name: '提案',
        status: 'completed',
        completedAt: new Date('2025-06-08'),
        approver: 'user-4',
        approverName: '田中 恵子'
      },
      {
        id: 'wf-2',
        name: '部門検討',
        status: 'in_progress',
        approver: 'user-3',
        approverName: '鈴木 美香'
      }
    ],
    tags: ['業務効率化', 'IT化', '音声入力', '残業削減'],
    visibility: 'department',
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    impactScore: 75,
    feasibilityScore: 70,
    alignmentScore: 80,
    totalScore: 75
  },

  // 委員会運営効率化プロジェクト（アイデア段階）
  {
    id: 'proj-3',
    title: '各種委員会の運営方法見直しによる業務効率化',
    description: `委員会運営の効率化により、月間約20時間の業務時間削減を目指すプロジェクト。

【実施内容】
- オンライン会議システムの活用
- 資料の電子化と事前共有
- 議事録作成の効率化
- 決定事項の即時共有システム構築`,
    status: 'draft',
    priority: 'medium',
    category: 'improvement',
    originalPostId: 'post-2',
    relatedPostIds: ['post-2'],
    createdBy: 'user-6',
    createdByName: '伊藤 麻衣',
    createdAt: new Date('2025-06-10T14:30:00'),
    updatedAt: new Date('2025-06-10T14:30:00'),
    budget: 800000,
    teamMembers: [
      {
        userId: 'user-6',
        userName: '伊藤 麻衣',
        role: '提案者',
        joinedAt: new Date('2025-06-10'),
        contribution: 0,
        isProvisional: true
      }
    ],
    milestones: [],
    workflowStages: [
      {
        id: 'wf-1',
        name: '提案',
        status: 'in_progress',
        approver: 'user-6',
        approverName: '伊藤 麻衣'
      }
    ],
    tags: ['業務効率化', '会議改善', 'DX推進'],
    visibility: 'department',
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    impactScore: 70,
    feasibilityScore: 85,
    alignmentScore: 75,
    totalScore: 77
  },

  // === 小原病院看護部デモプロジェクト ===

  // 夜勤看護師の安全対策強化プロジェクト
  {
    id: 'kohara-proj-1',
    title: '夜勤看護師安全対策強化システム導入',
    description: `夜勤時の安全性向上と看護師の負担軽減を目的とした包括的な安全対策システムの導入プロジェクト。

【背景】
全国的に医療施設での夜勤時インシデント発生が課題視される中、当院でも予防的対策の強化が急務。夜勤時間帯での緊急対応時の人員配置不足、一人夜勤による孤立感、緊急時連絡体制の見直しが必要。

【目的】
1. 夜勤時の医療安全性向上
2. 看護師の働きやすさ改善
3. 緊急時対応力の強化
4. 職員のメンタルヘルス向上

【実施内容】
- 緊急通報システム導入（ナースコール連動型）
- 夜勤複数名体制への段階的移行
- 夜勤時安全研修プログラム策定
- 夜勤専従看護師処遇改善`,
    status: 'approved',
    priority: 'high',
    category: 'safety',
    originalPostId: 'kohara-post-1',
    relatedPostIds: ['kohara-post-1'],
    createdBy: 'kohara-nursing-director',
    createdByName: '田中 美津子',
    createdAt: new Date('2025-06-10T09:00:00'),
    updatedAt: new Date('2025-06-18T15:30:00'),
    startDate: new Date('2025-07-15'),
    targetDate: new Date('2025-12-31'),
    actualEndDate: null,
    budget: 2500000,
    actualCost: 0,
    roi: 0,
    teamMembers: [
      {
        userId: 'kohara-nursing-director',
        userName: '田中 美津子',
        role: 'プロジェクトリーダー',
        joinedAt: new Date('2025-06-10'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-3f-head',
        userName: '加藤 理恵',
        role: '3階病棟代表',
        joinedAt: new Date('2025-06-12'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-4f-head',
        userName: '後藤 美智子',
        role: '4階病棟代表',
        joinedAt: new Date('2025-06-12'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-5f-head',
        userName: '斉藤 かおり',
        role: '5階病棟代表',
        joinedAt: new Date('2025-06-12'),
        contribution: 0,
        isProvisional: false
      }
    ],
    milestones: [
      {
        id: 'kohara-ms-1',
        title: 'システム要件定義と業者選定',
        description: '緊急通報システムの仕様策定と導入業者の選定',
        dueDate: new Date('2025-07-31'),
        completed: false,
        assignedTo: ['kohara-nursing-director']
      },
      {
        id: 'kohara-ms-2',
        title: '夜勤体制見直し計画策定',
        description: '各病棟の夜勤体制分析と複数名配置計画の作成',
        dueDate: new Date('2025-08-15'),
        completed: false,
        assignedTo: ['kohara-3f-head', 'kohara-4f-head', 'kohara-5f-head']
      },
      {
        id: 'kohara-ms-3',
        title: '研修プログラム開発',
        description: '夜勤時安全研修カリキュラムと教材の作成',
        dueDate: new Date('2025-09-30'),
        completed: false,
        assignedTo: ['kohara-nursing-director']
      },
      {
        id: 'kohara-ms-4',
        title: 'システム導入と試験運用',
        description: '緊急通報システム設置と1ヶ月間の試験運用',
        dueDate: new Date('2025-11-30'),
        completed: false,
        assignedTo: ['kohara-nursing-director']
      }
    ],
    currentPhase: 'facility_voting',
    workflowStages: [
      {
        id: 'kohara-wf-1',
        name: '提案',
        status: 'completed',
        completedAt: new Date('2025-06-10'),
        approver: 'kohara-nursing-director',
        approverName: '田中 美津子',
        comments: '看護部長として安全対策の重要性を提起'
      },
      {
        id: 'kohara-wf-2',
        name: '部門検討',
        status: 'completed',
        completedAt: new Date('2025-06-18'),
        approver: 'kohara-nursing-director',
        approverName: '田中 美津子',
        comments: '看護部全体での合意形成完了'
      },
      {
        id: 'kohara-wf-3',
        name: '施設承認',
        status: 'in_progress',
        approver: 'kohara-nursing-director',
        approverName: '田中 美津子',
        comments: '施設内投票実施中（6/30まで）'
      },
      {
        id: 'kohara-wf-4',
        name: '法人承認',
        status: 'pending',
        approver: null,
        approverName: null
      }
    ],
    tags: ['安全対策', '夜勤業務', '働き方改革', 'システム導入'],
    visibility: 'facility',
    department: '看護部',
    facility_id: 'kohara_hospital',
    impactScore: 92,
    feasibilityScore: 85,
    alignmentScore: 95,
    totalScore: 91,
    votingDeadline: new Date('2025-06-30T23:59:59'),
    requiredVotes: 21,
    currentVotes: 18,
    approvalPercentage: 93
  },

  // 病棟間看護師交流研修プログラム
  {
    id: 'kohara-proj-2',
    title: '病棟間看護師交流研修プログラム',
    description: `各病棟の専門性を活かした看護技術共有とキャリア開発を目的とした交流研修プログラムの導入。

【背景】
各病棟で蓄積された専門知識や技術の共有不足、看護師のキャリア開発機会の必要性、病棟間連携強化による患者ケア質向上が課題。

【目的】
1. 看護技術の標準化と向上
2. 職員のモチベーション向上
3. 病棟間コミュニケーション強化
4. 新人看護師の早期戦力化

【実施内容】
- 月1回の病棟間ローテーション研修
- 四半期毎の看護技術発表会
- 新人向け病棟見学プログラム
- ベテラン看護師による指導技術共有`,
    status: 'planning',
    priority: 'medium',
    category: 'training',
    originalPostId: 'kohara-post-2',
    relatedPostIds: ['kohara-post-2'],
    createdBy: 'kohara-3f-head',
    createdByName: '加藤 理恵',
    createdAt: new Date('2025-06-08T14:30:00'),
    updatedAt: new Date('2025-06-15T11:20:00'),
    startDate: new Date('2025-08-01'),
    targetDate: new Date('2025-03-31'),
    actualEndDate: null,
    budget: 300000,
    actualCost: 0,
    roi: 0,
    teamMembers: [
      {
        userId: 'kohara-3f-head',
        userName: '加藤 理恵',
        role: 'プロジェクトリーダー',
        joinedAt: new Date('2025-06-08'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-education-director',
        userName: '佐藤 恵子',
        role: '教育統括',
        joinedAt: new Date('2025-06-10'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-5f-head',
        userName: '斉藤 かおり',
        role: '5階病棟代表',
        joinedAt: new Date('2025-06-11'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-outpatient-head',
        userName: '高橋 愛子',
        role: '外来代表',
        joinedAt: new Date('2025-06-12'),
        contribution: 0,
        isProvisional: false
      }
    ],
    milestones: [
      {
        id: 'kohara-tr-ms-1',
        title: '研修プログラム詳細設計',
        description: 'ローテーション研修の具体的スケジュールと内容の策定',
        dueDate: new Date('2025-07-15'),
        completed: false,
        assignedTo: ['kohara-3f-head', 'kohara-education-director']
      },
      {
        id: 'kohara-tr-ms-2',
        title: '各病棟協力体制構築',
        description: '病棟間の研修受け入れ体制と指導者の選定',
        dueDate: new Date('2025-07-31'),
        completed: false,
        assignedTo: ['kohara-5f-head', 'kohara-outpatient-head']
      },
      {
        id: 'kohara-tr-ms-3',
        title: 'プログラム試験実施',
        description: '2ヶ月間の試験実施と効果測定',
        dueDate: new Date('2025-10-31'),
        completed: false,
        assignedTo: ['kohara-3f-head']
      }
    ],
    currentPhase: 'department_review',
    workflowStages: [
      {
        id: 'kohara-tr-wf-1',
        name: '提案',
        status: 'completed',
        completedAt: new Date('2025-06-08'),
        approver: 'kohara-3f-head',
        approverName: '加藤 理恵',
        comments: '3階病棟師長として交流研修の必要性を提起'
      },
      {
        id: 'kohara-tr-wf-2',
        name: '部門検討',
        status: 'in_progress',
        approver: 'kohara-education-director',
        approverName: '佐藤 恵子',
        comments: '教育プログラムとの連携を検討中'
      },
      {
        id: 'kohara-tr-wf-3',
        name: '施設承認',
        status: 'pending',
        approver: 'kohara-nursing-director',
        approverName: '田中 美津子'
      }
    ],
    tags: ['研修', '交流', 'スキルアップ', '病棟連携'],
    visibility: 'facility',
    department: '3階病棟',
    facility_id: 'kohara_hospital',
    impactScore: 78,
    feasibilityScore: 88,
    alignmentScore: 85,
    totalScore: 84,
    votingDeadline: new Date('2025-06-25T23:59:59'),
    requiredVotes: 18,
    currentVotes: 12,
    approvalPercentage: 86
  },

  // 透析室患者教育資材充実プロジェクト
  {
    id: 'kohara-proj-3',
    title: '透析患者教育資材充実プロジェクト',
    description: `透析患者の療養指導効果向上のための教育資材導入と活用システム構築。

【背景】
既存の教育パンフレットの古さ、視覚的教材の不足、患者年齢層に応じた教材の必要性が課題。患者のQOL向上と自己管理能力向上が急務。

【目的】
1. 患者の透析治療に対する理解度向上
2. セルフケア能力の向上
3. 医療事故の予防
4. 患者満足度の向上

【実施内容】
- デジタル教育用タブレット導入
- 3D説明モデルと食品サンプル購入
- 血管アクセス管理指導教材整備
- 教育効果測定システム構築`,
    status: 'approved',
    priority: 'medium',
    category: 'equipment',
    originalPostId: 'kohara-post-3',
    relatedPostIds: ['kohara-post-3'],
    createdBy: 'kohara-dialysis-supervisor',
    createdByName: '藤田 千代',
    createdAt: new Date('2025-06-07T11:15:00'),
    updatedAt: new Date('2025-06-16T09:45:00'),
    startDate: new Date('2025-07-01'),
    targetDate: new Date('2025-09-30'),
    actualEndDate: null,
    budget: 260000,
    actualCost: 0,
    roi: 0,
    teamMembers: [
      {
        userId: 'kohara-dialysis-supervisor',
        userName: '藤田 千代',
        role: 'プロジェクトリーダー',
        joinedAt: new Date('2025-06-07'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-dialysis-nurse',
        userName: '西田 あずさ',
        role: '教材活用担当',
        joinedAt: new Date('2025-06-10'),
        contribution: 0,
        isProvisional: false
      },
      {
        userId: 'kohara-nursing-director',
        userName: '田中 美津子',
        role: '承認者',
        joinedAt: new Date('2025-06-15'),
        contribution: 0,
        isProvisional: false
      }
    ],
    milestones: [
      {
        id: 'kohara-ed-ms-1',
        title: '教材選定と発注',
        description: 'タブレット、3Dモデル、食品サンプルの選定と発注手続き',
        dueDate: new Date('2025-07-15'),
        completed: false,
        assignedTo: ['kohara-dialysis-supervisor']
      },
      {
        id: 'kohara-ed-ms-2',
        title: '教育プログラム作成',
        description: '新教材を活用した指導プログラムの作成',
        dueDate: new Date('2025-08-15'),
        completed: false,
        assignedTo: ['kohara-dialysis-nurse']
      },
      {
        id: 'kohara-ed-ms-3',
        title: '効果測定開始',
        description: '教材導入前後の患者理解度比較調査開始',
        dueDate: new Date('2025-09-30'),
        completed: false,
        assignedTo: ['kohara-dialysis-supervisor']
      }
    ],
    currentPhase: 'approved',
    workflowStages: [
      {
        id: 'kohara-ed-wf-1',
        name: '提案',
        status: 'completed',
        completedAt: new Date('2025-06-07'),
        approver: 'kohara-dialysis-supervisor',
        approverName: '藤田 千代',
        comments: '透析室での患者教育課題の改善提案'
      },
      {
        id: 'kohara-ed-wf-2',
        name: '部門検討',
        status: 'completed',
        completedAt: new Date('2025-06-12'),
        approver: 'kohara-nursing-director',
        approverName: '田中 美津子',
        comments: '患者教育重要性を考慮し承認'
      },
      {
        id: 'kohara-ed-wf-3',
        name: '施設承認',
        status: 'completed',
        completedAt: new Date('2025-06-16'),
        approver: 'kohara-nursing-director',
        approverName: '田中 美津子',
        comments: '予算確保済み、実施承認'
      }
    ],
    tags: ['患者教育', '透析', '教材', 'QOL向上'],
    visibility: 'facility',
    department: '人工透析室',
    facility_id: 'kohara_hospital',
    impactScore: 85,
    feasibilityScore: 95,
    alignmentScore: 90,
    totalScore: 90,
    votingDeadline: new Date('2025-06-28T23:59:59'),
    requiredVotes: 12,
    currentVotes: 10,
    approvalPercentage: 92
  }
];

// Helper functions
export const getDemoProjectById = (id: string): Project | undefined => {
  return demoProjects.find(project => project.id === id);
};

export const getDemoProjectsByStatus = (status: ProjectStatus): Project[] => {
  return demoProjects.filter(project => project.status === status);
};

export const getDemoProjectsByDepartment = (department: string): Project[] => {
  return demoProjects.filter(project => project.department === department);
};

export const getDemoProjectsByFacility = (facilityId: string): Project[] => {
  return demoProjects.filter(project => project.facility_id === facilityId);
};

export const getDemoProjectsByMember = (userId: string): Project[] => {
  return demoProjects.filter(project => 
    project.teamMembers.some(member => member.userId === userId)
  );
};

export { demoProjects as projects };
export default demoProjects;