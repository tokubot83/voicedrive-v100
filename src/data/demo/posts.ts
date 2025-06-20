import { Post, PostStatus, PostType, AnonymityLevel, Priority } from '../../types';
import { getDemoUserById } from './users';

// Helper function to generate comments
const generateComments = (postId: string, comments: Array<{
  userId: string;
  content: string;
  isAnonymous?: boolean;
  timestamp?: Date;
}>) => {
  return comments.map((comment, index) => ({
    id: `comment-${postId}-${index + 1}`,
    userId: comment.userId,
    userName: comment.isAnonymous ? '匿名' : getDemoUserById(comment.userId)?.name || '不明',
    content: comment.content,
    timestamp: comment.timestamp || new Date(Date.now() - (comments.length - index) * 24 * 60 * 60 * 1000),
    likes: Math.floor(Math.random() * 10),
    privacyLevel: 'public' as const,
    isAnonymous: comment.isAnonymous || false
  }));
};

// Helper function to generate votes
const generateVotes = (postId: string, voteData: Array<{
  userId: string;
  value: number;
  comment?: string;
}>) => {
  return voteData.map((vote, index) => ({
    id: `vote-${postId}-${index + 1}`,
    userId: vote.userId,
    userName: getDemoUserById(vote.userId)?.name || '不明',
    value: vote.value,
    comment: vote.comment,
    timestamp: new Date(Date.now() - index * 12 * 60 * 60 * 1000),
    stakeholderCategory: getDemoUserById(vote.userId)?.stakeholderCategory || 'staff'
  }));
};

export const demoPosts: Post[] = [
  // 1. 非常勤職員の慶弔休暇制度（施設内投票フェーズ）
  {
    id: 'post-1',
    type: 'proposal',
    status: 'in_voting',
    title: '非常勤職員の慶弔休暇取得制度の導入提案',
    content: `現在、非常勤職員には慶弔休暇の制度がありません。実際の現場では、非常勤職員が常勤職員に気を使って、親族の葬儀等でも通常の欠勤扱いで休暇を取得している状況が見受けられます。

【現状の課題】
・非常勤職員が慶弔時に有給休暇を使用するか、欠勤扱いになる
・常勤職員との待遇差により、職場の一体感が損なわれる
・優秀な非常勤職員の定着率に影響

【提案内容】
1. 非常勤職員にも慶弔休暇制度を適用
2. 適用範囲：配偶者、子、父母の死亡時（3日間）
3. 勤続6ヶ月以上の非常勤職員を対象

この提案により、全ての職員が安心して働ける環境を整備できると考えます。`,
    author: {
      id: 'user-7',
      name: '渡辺 由美',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'employee-welfare',
    priority: 'high',
    anonymityLevel: 'non_anonymous',
    timestamp: new Date('2025-05-15T10:00:00'),
    likes: 45,
    views: 289,
    hasRead: true,
    projectPhase: 'facility_voting',
    votingDeadline: new Date('2025-06-30T23:59:59'),
    comments: generateComments('post-1', [
      {
        userId: 'user-4',
        content: '現場の声を形にしてくださり、ありがとうございます。看護主任として、この提案を全面的に支持します。実際に非常勤の方が遠慮されている場面を何度も見てきました。'
      },
      {
        userId: 'user-9',
        content: '非常勤の立場から、本当にありがたい提案です。先月、祖母が亡くなった際も有給を使いました。常勤の方に申し訳なくて...',
        isAnonymous: true
      },
      {
        userId: 'user-3',
        content: '病棟師長として、この提案の重要性を認識しています。人事部門と協議を進めており、前向きな検討をいただいています。'
      },
      {
        userId: 'user-8',
        content: '私も非常勤から常勤になりましたが、当時はとても苦労しました。後輩たちのためにも実現してほしいです。'
      }
    ]),
    votes: generateVotes('post-1', [
      { userId: 'user-2', value: 5, comment: '病院全体の働きやすさ向上に繋がる重要な提案です' },
      { userId: 'user-3', value: 5 },
      { userId: 'user-4', value: 5 },
      { userId: 'user-5', value: 5 },
      { userId: 'user-6', value: 5 },
      { userId: 'user-8', value: 5 },
      { userId: 'user-10', value: 4, comment: '基本的に賛成ですが、財務面の検討も必要かと' }
    ])
  },

  // 2. 委員会運営の効率化提案
  {
    id: 'post-2',
    type: 'proposal',
    status: 'active',
    title: '各種委員会の運営方法見直しによる業務効率化',
    content: `当院では医療安全、感染対策、褥瘡対策など多数の委員会が運営されていますが、会議時間の長期化や資料作成の負担が課題となっています。

【現状の問題点】
・月1回の定例会議が2時間以上かかることが多い
・紙資料の印刷・配布に時間がかかる
・議事録作成に担当者が残業している
・決定事項の周知に時間差がある

【改善提案】
1. オンライン会議システムの活用（現場から参加可能に）
2. 資料の電子化と事前共有システムの導入
3. 議事録のテンプレート化と音声記録の活用
4. 決定事項の院内ポータルでの即時共有

これにより、月間約20時間の業務時間削減が見込まれます。`,
    author: {
      id: 'user-6',
      name: '伊藤 麻衣',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'improvement',
    priority: 'medium',
    anonymityLevel: 'non_anonymous',
    timestamp: new Date('2025-06-10T14:30:00'),
    likes: 32,
    views: 156,
    hasRead: true,
    comments: generateComments('post-2', [
      {
        userId: 'user-3',
        content: '素晴らしい提案です。特に音声記録の活用は、議事録作成の負担を大幅に軽減できそうですね。'
      },
      {
        userId: 'user-5',
        content: 'オンライン参加ができれば、病棟を離れられない時でも参加できます。ぜひ実現してほしいです。'
      }
    ])
  },

  // 3. 休憩室の環境改善
  {
    id: 'post-3',
    type: 'idea',
    status: 'active',
    title: '職員休憩室の環境改善について',
    content: `療養病棟の休憩室が手狭で、昼食時に座れないスタッフがいます。

【提案】
・休憩時間の分散化（11:30〜、12:00〜、12:30〜の3グループ制）
・立ち食いカウンターの設置
・休憩室の換気扇増設

快適な休憩は午後の業務効率にも影響します。ご検討をお願いします。`,
    author: {
      id: 'user-8',
      name: '中村 さゆり',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'employee-welfare',
    priority: 'low',
    anonymityLevel: 'non_anonymous',
    timestamp: new Date('2025-06-12T09:15:00'),
    likes: 28,
    views: 98,
    hasRead: false,
    comments: generateComments('post-3', [
      {
        userId: 'user-9',
        content: '私も同感です。特に金曜日は人が多くて大変です。',
        isAnonymous: true
      },
      {
        userId: 'user-4',
        content: '休憩時間の分散化は良いアイデアですね。シフト調整と合わせて検討してみます。'
      }
    ])
  },

  // 4. 申し送り方法の改善
  {
    id: 'post-4',
    type: 'proposal',
    status: 'department_review',
    title: '音声入力を活用した申し送り業務の効率化',
    content: `毎日の申し送り記録作成に多くの時間を費やしています。

【現状】
・手書きメモから電子カルテへの転記に15-20分
・重要事項の記載漏れリスク
・字が読みにくく確認に時間がかかる

【提案】
音声入力システムの導入により：
・記録時間を5分程度に短縮
・リアルタイムでの記録が可能
・検索可能なテキストデータ化

初期投資は必要ですが、年間の残業時間削減効果を考えると十分な費用対効果が見込めます。`,
    author: {
      id: 'user-4',
      name: '田中 恵子',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'innovation',
    priority: 'medium',
    anonymityLevel: 'non_anonymous',
    timestamp: new Date('2025-06-08T16:45:00'),
    likes: 41,
    views: 178,
    hasRead: true,
    projectPhase: 'department_discussion',
    comments: generateComments('post-4', [
      {
        userId: 'user-6',
        content: '音声入力は個人情報保護の観点から、セキュリティ面での検討も必要ですね。'
      },
      {
        userId: 'user-3',
        content: 'IT部門に相談したところ、院内ネットワーク内で完結するシステムなら導入可能とのことでした。'
      },
      {
        userId: 'user-10',
        content: 'リハビリ部門でも同様の課題があります。病院全体での導入を検討してはどうでしょうか。'
      }
    ])
  },

  // 5. 新人教育プログラムの改善
  {
    id: 'post-5',
    type: 'discussion',
    status: 'active',
    title: '新人看護師・介護職員の教育プログラム改善案',
    content: `来年度の新人受け入れに向けて、教育プログラムの見直しを提案します。

【現行の課題】
・OJT依存で指導者により差がある
・夜勤導入時期の判断基準が不明確
・メンタルフォローが不十分

【改善案】
1. チェックリスト式の技術習得確認表の導入
2. メンター制度の確立（1年目職員に2-3年目の先輩を配置）
3. 月1回の新人面談の実施
4. 夜勤導入の客観的基準の設定

皆様のご意見をお聞かせください。`,
    author: {
      id: 'user-5',
      name: '高橋 真理',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'improvement',
    priority: 'high',
    anonymityLevel: 'non_anonymous',
    timestamp: new Date('2025-06-11T11:00:00'),
    likes: 38,
    views: 145,
    hasRead: true,
    comments: generateComments('post-5', [
      {
        userId: 'user-7',
        content: '私が新人の頃、メンターがいたらもっと安心できたと思います。ぜひ実現してください。'
      },
      {
        userId: 'user-6',
        content: 'チェックリストは良いですね。到達度が見える化されると、新人も指導者も安心です。'
      },
      {
        userId: 'user-3',
        content: '看護部として、この提案を前向きに検討します。特にメンタルフォローは重要課題です。'
      }
    ])
  },

  // 6. 感染対策の効率化（匿名投稿）
  {
    id: 'post-6',
    type: 'idea',
    status: 'active',
    title: '手指消毒剤の配置場所最適化の提案',
    content: `感染対策は重要ですが、現在の消毒剤配置に改善の余地があります。

・病室入口にはあるが、ナースステーション内が不足
・詰め替え作業が非効率（月2回、計3時間）
・使用期限管理が煩雑

センサー式ディスペンサーの増設と、配置マップの作成を提案します。`,
    author: {
      id: 'user-6',
      name: '匿名',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'improvement',
    priority: 'medium',
    anonymityLevel: 'anonymous',
    timestamp: new Date('2025-06-13T13:20:00'),
    likes: 19,
    views: 67,
    hasRead: false,
    comments: generateComments('post-6', [
      {
        userId: 'user-4',
        content: '感染対策委員会でも同様の意見が出ていました。来月の会議で検討します。'
      }
    ])
  }
];

// Export helper functions
export const getDemoPostById = (id: string): Post | undefined => {
  return demoPosts.find(post => post.id === id);
};

export const getDemoPostsByDepartment = (department: string): Post[] => {
  return demoPosts.filter(post => post.department === department);
};

export const getDemoPostsByFacility = (facilityId: string): Post[] => {
  return demoPosts.filter(post => post.facility_id === facilityId);
};

export const getDemoPostsByType = (type: PostType): Post[] => {
  return demoPosts.filter(post => post.type === type);
};

export const getDemoPostsByStatus = (status: PostStatus): Post[] => {
  return demoPosts.filter(post => post.status === status);
};