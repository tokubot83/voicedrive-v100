import { Post, PostType, AnonymityLevel, Priority, VoteOption, ProposalType, StakeholderCategory, Comment, CommentPrivacyLevel } from '../../types';
import { demoUsers } from './users';
import { generateSampleVotesByStakeholder } from '../../utils/votingCalculations';
import { projectDemoPosts } from './projectDemoData';

// Helper function to generate random votes
const generateVotes = (): Record<VoteOption, number> => {
  const baseVotes = Math.floor(Math.random() * 20) + 5;
  return {
    'strongly-oppose': Math.floor(Math.random() * baseVotes * 0.1),
    'oppose': Math.floor(Math.random() * baseVotes * 0.15),
    'neutral': Math.floor(Math.random() * baseVotes * 0.3),
    'support': Math.floor(Math.random() * baseVotes * 0.3),
    'strongly-support': Math.floor(Math.random() * baseVotes * 0.15),
  };
};

// Helper function to generate sample comments
const generateSampleComments = (postId: string, count: number = 2): Comment[] => {
  const sampleComments = [
    {
      content: '素晴らしい提案だと思います。特に新入社員の早期戦力化は重要な課題です。実施時期はいつ頃を想定されていますか？',
      author: demoUsers[5], // HR staff
      privacyLevel: 'partial' as CommentPrivacyLevel,
      anonymityLevel: 'department' as AnonymityLevel,
    },
    {
      content: 'ペアプログラミングは確かに効果的ですが、先輩社員の負担も考慮する必要があります。専用の研修担当者の配置も検討してはどうでしょうか。',
      author: demoUsers[3], // Team leader
      privacyLevel: 'full' as CommentPrivacyLevel,
      anonymityLevel: 'real' as AnonymityLevel,
    },
    {
      content: '予算的な観点から見ると、OJTの時間を増やすことで業務効率が一時的に下がる可能性があります。ROIの試算はありますか？',
      author: demoUsers[6], // Manager
      privacyLevel: 'selective' as CommentPrivacyLevel,
      anonymityLevel: 'real' as AnonymityLevel,
    },
    {
      content: '現場の声として、新入社員のスキルアップは確実に必要です。座学よりも実践的な研修を支持します。',
      author: demoUsers[1], // Staff
      privacyLevel: 'anonymous' as CommentPrivacyLevel,
      anonymityLevel: 'anonymous' as AnonymityLevel,
    },
    {
      content: '他社での同様の取り組み事例も参考にしてはいかがでしょうか。ベンチマーキングを行うことで、より効果的な研修プログラムが作れると思います。',
      author: demoUsers[8], // Senior staff
      privacyLevel: 'partial' as CommentPrivacyLevel,
      anonymityLevel: 'department' as AnonymityLevel,
    },
    {
      content: '参加します！新しいメンバーとの交流を楽しみにしています。',
      author: demoUsers[2], // Staff
      privacyLevel: 'full' as CommentPrivacyLevel,
      anonymityLevel: 'real' as AnonymityLevel,
    },
    {
      content: '私も同じ問題を感じていました。特に午後3時以降が暑すぎて集中できません。ぜひ改善していただきたいです。',
      author: demoUsers[4], // Staff
      privacyLevel: 'partial' as CommentPrivacyLevel,
      anonymityLevel: 'department' as AnonymityLevel,
    },
    {
      content: '技術的な観点から、ゾーン制御は可能ですが初期費用がかかります。段階的な実施も検討してはいかがでしょうか。',
      author: demoUsers[7], // Technical staff
      privacyLevel: 'full' as CommentPrivacyLevel,
      anonymityLevel: 'real' as AnonymityLevel,
    },
    {
      content: '環境改善は生産性向上に直結します。コスト面での詳細な検討資料があれば判断しやすくなります。',
      author: demoUsers[9], // Manager
      privacyLevel: 'selective' as CommentPrivacyLevel,
      anonymityLevel: 'real' as AnonymityLevel,
    },
    {
      content: 'データを収集して効果を測定することも重要だと思います。温度ログと生産性指標の相関を調べてみてはどうでしょうか。',
      author: demoUsers[11], // Analyst
      privacyLevel: 'partial' as CommentPrivacyLevel,
      anonymityLevel: 'department' as AnonymityLevel,
    },
  ];

  return sampleComments.slice(0, count).map((comment, index) => ({
    id: `comment-${postId}-${index + 1}`,
    postId: postId,
    content: comment.content,
    author: comment.author,
    anonymityLevel: comment.anonymityLevel,
    privacyLevel: comment.privacyLevel,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
    visibleInfo: comment.privacyLevel !== 'anonymous' ? {
      facility: comment.author.department,
      position: comment.author.role,
      experienceYears: comment.author.expertise || Math.floor(Math.random() * 15) + 1,
      isManagement: comment.author.role.includes('管理') || comment.author.role.includes('主任') || comment.author.role.includes('長')
    } : undefined,
  }));
};

// Seasonal posts based on Japanese fiscal year and seasons
export const demoPosts: Post[] = [
  // Spring (April-May) - New fiscal year, new employees
  {
    id: 'post-1',
    type: 'improvement',
    proposalType: 'operational' as ProposalType,
    content: '新入社員の研修プログラムについて、もっと実践的な内容を増やしてはどうでしょうか。座学だけでなく、先輩社員とのペアプログラミングやOJTの時間を増やすことで、より早く戦力になれると思います。',
    author: demoUsers[2], // Senior employee
    anonymityLevel: 'real',
    priority: 'high',
    timestamp: new Date('2024-04-15T09:30:00'),
    votes: {
      'strongly-oppose': 1,
      'oppose': 2,
      'neutral': 5,
      'support': 15,
      'strongly-support': 8,
    },
    votesByStakeholder: generateSampleVotesByStakeholder({
      'strongly-oppose': 1,
      'oppose': 2,
      'neutral': 5,
      'support': 15,
      'strongly-support': 8,
    }),
    comments: generateSampleComments('post-1', 3),
    projectId: 'proj-001',
    approver: demoUsers[10],
    projectStatus: {
      stage: 'active',
      score: 420,
      threshold: 400,
      progress: 105
    }
  },
  {
    id: 'post-2',
    type: 'community',
    content: '新年度の歓迎会を4月26日（金）に開催予定です！新しく入社された皆さんを温かく迎えましょう。場所は会社近くの「さくら」で、19時開始予定です。',
    author: demoUsers[5], // Team lead
    anonymityLevel: 'real',
    timestamp: new Date('2024-04-10T14:20:00'),
    votes: generateVotes(),
    comments: generateSampleComments('post-2', 2)
  },
  
  // Summer (June-August) - Heat measures, productivity
  {
    id: 'post-3',
    type: 'improvement',
    proposalType: 'operational' as ProposalType,
    content: 'オフィスの空調設定について提案があります。現在28度設定ですが、午後の西日が強い部屋では暑すぎます。エリアごとに温度設定を調整できるようにしていただけないでしょうか。',
    author: demoUsers[1], // Entry-level employee
    anonymityLevel: 'department',
    priority: 'medium',
    timestamp: new Date('2024-06-20T11:45:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 1,
      'neutral': 3,
      'support': 12,
      'strongly-support': 6,
    },
    votesByStakeholder: generateSampleVotesByStakeholder({
      'strongly-oppose': 0,
      'oppose': 1,
      'neutral': 3,
      'support': 12,
      'strongly-support': 6,
    }),
    comments: generateSampleComments('post-3', 2),
    projectStatus: {
      stage: 'approaching',
      score: 185,
      threshold: 200,
      progress: 92.5
    }
  },
  {
    id: 'post-4',
    type: 'report',
    content: '夏季の電力使用量削減プロジェクトの進捗報告です。6月の電力使用量は前年同月比で15%削減を達成しました。LED照明への切り替えと、エアコンの効率的な運用が功を奏しています。',
    author: demoUsers[6], // Supervisor
    anonymityLevel: 'real',
    priority: 'high',
    timestamp: new Date('2024-07-05T10:00:00'),
    votes: generateVotes(),
    comments: generateSampleComments('post-4', 2)
  },
  {
    id: 'post-5',
    type: 'improvement',
    proposalType: 'strategic' as ProposalType,
    content: '夏季のリモートワーク推奨日を増やすのはどうでしょうか。通勤時の熱中症リスク軽減と、オフィスの電力消費削減の両方に効果があると思います。',
    author: demoUsers[3], // Senior employee
    anonymityLevel: 'anonymous',
    priority: 'medium',
    timestamp: new Date('2024-07-25T13:30:00'),
    votes: generateVotes(),
    comments: generateSampleComments('post-5', 3)
  },
  
  // Autumn (September-November) - Mid-year reviews, planning
  {
    id: 'post-6',
    type: 'improvement',
    proposalType: 'communication' as ProposalType,
    content: '半期評価のフィードバック方法について、1on1の時間をもっと増やしてほしいです。現在15分では短すぎて、具体的な改善点について深く話し合えません。',
    author: demoUsers[0], // Entry-level employee
    anonymityLevel: 'anonymous',
    priority: 'high',
    timestamp: new Date('2024-09-10T16:00:00'),
    votes: generateVotes(),
    comments: [],
    projectId: 'proj-003'
  },
  {
    id: 'post-7',
    type: 'report',
    content: '第2四半期の業績報告：売上高は前年同期比112%を達成しました。特に新製品ラインが好調で、計画を上回る成果を出しています。詳細は添付資料をご覧ください。',
    author: demoUsers[11], // Director
    anonymityLevel: 'real',
    timestamp: new Date('2024-10-01T09:00:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-8',
    type: 'community',
    content: '社内運動会を11月3日（祝）に開催します！昨年好評だったリレーや綱引きに加えて、今年は新種目も検討中です。ご家族の参加も大歓迎です。',
    author: demoUsers[4], // Team lead
    anonymityLevel: 'real',
    timestamp: new Date('2024-10-15T11:30:00'),
    votes: generateVotes(),
    comments: []
  },
  
  // Winter (December-March) - Year-end, planning for next year
  {
    id: 'post-9',
    type: 'improvement',
    proposalType: 'strategic' as ProposalType,
    content: '年末年始の休暇取得について、もっと柔軟な制度にできないでしょうか。12月29日から1月3日の一律休業ではなく、個人の事情に合わせて休暇を取得できるようにしてほしいです。',
    author: demoUsers[7], // Manager
    anonymityLevel: 'real',
    priority: 'medium',
    timestamp: new Date('2024-11-20T14:00:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-10',
    type: 'report',
    content: '忘年会の参加率が昨年より20%向上しました。オンライン参加オプションの導入と、複数日程での開催が効果的だったようです。来年も継続したいと思います。',
    author: demoUsers[8], // Manager
    anonymityLevel: 'real',
    timestamp: new Date('2024-12-25T10:30:00'),
    votes: generateVotes(),
    comments: []
  },
  
  // Current period posts (more recent)
  {
    id: 'post-11',
    type: 'improvement',
    proposalType: 'innovation' as ProposalType,
    content: '社内のナレッジ共有システムの改善提案です。現在のWikiは検索機能が弱く、必要な情報を見つけるのに時間がかかります。AIを活用した検索機能の導入を検討してください。',
    author: demoUsers[9], // Manager
    anonymityLevel: 'real',
    priority: 'high',
    timestamp: new Date('2025-01-05T09:15:00'),
    votes: generateVotes(),
    comments: [],
    projectId: 'proj-004',
    approver: demoUsers[11]
  },
  {
    id: 'post-12',
    type: 'community',
    content: '社内勉強会「AI活用セミナー」を1月24日（金）16時から開催します。ChatGPTやCopilotなど、業務で使えるAIツールの実践的な使い方を紹介します。',
    author: demoUsers[2], // Senior employee
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-08T11:00:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-13',
    type: 'improvement',
    proposalType: 'operational' as ProposalType,
    content: '会議室の予約システムが使いにくいです。空き状況の確認と予約を同じ画面でできるようにし、定期予約の機能も追加してもらえないでしょうか。',
    author: demoUsers[1], // Entry-level employee
    anonymityLevel: 'department',
    priority: 'low',
    timestamp: new Date('2025-01-06T14:30:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-14',
    type: 'report',
    content: 'リモートワーク環境改善プロジェクトの最終報告：VPN接続の安定性が95%以上に改善、平均接続速度が2倍に向上しました。社員満足度も85%と高評価でした。',
    author: demoUsers[10], // Senior Manager
    anonymityLevel: 'real',
    priority: 'high',
    timestamp: new Date('2025-01-07T10:00:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-15',
    type: 'improvement',
    proposalType: 'communication' as ProposalType,
    content: '社員食堂のメニューについて、ベジタリアン・ビーガン対応のオプションを増やしてほしいです。健康志向や多様性への配慮として重要だと思います。',
    author: demoUsers[3], // Senior employee
    anonymityLevel: 'anonymous',
    priority: 'low',
    timestamp: new Date('2025-01-06T12:45:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-16',
    type: 'community',
    content: '社内バスケットボールチームのメンバー募集中！毎週水曜日の19時から近くの体育館で練習しています。初心者も大歓迎です。',
    author: demoUsers[0], // Entry-level employee
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-05T17:20:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-17',
    type: 'improvement',
    proposalType: 'strategic' as ProposalType,
    content: '育児支援制度の拡充について提案があります。時短勤務の期間を小学校3年生まで延長し、在宅勤務との併用も可能にしてはどうでしょうか。',
    author: demoUsers[5], // Team lead
    anonymityLevel: 'real',
    priority: 'high',
    timestamp: new Date('2025-01-04T11:00:00'),
    votes: generateVotes(),
    comments: [],
    projectId: 'proj-005'
  },
  {
    id: 'post-18',
    type: 'report',
    content: '社内DXプロジェクトの進捗：業務自動化により月間40時間の工数削減を達成。ROIは初年度で150%を見込んでいます。',
    author: demoUsers[12], // Director
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-03T09:30:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-19',
    type: 'improvement',
    proposalType: 'riskManagement' as ProposalType,
    content: '駐車場の利用ルールについて、エコカー優先スペースを設けてはどうでしょうか。環境への取り組みをアピールできますし、社員のエコカー購入を促進できると思います。',
    author: demoUsers[6], // Supervisor
    anonymityLevel: 'department',
    priority: 'medium',
    timestamp: new Date('2025-01-02T15:00:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-20',
    type: 'community',
    content: '新年あけましておめでとうございます！今年もVoiceDriveを通じて、より良い職場環境を一緒に作っていきましょう。皆様のご意見・ご提案をお待ちしています。',
    author: demoUsers[13], // Executive
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-01T09:00:00'),
    votes: generateVotes(),
    comments: []
  },
  
  // Add project-level demo posts
  ...projectDemoPosts
];

// Helper functions
export const getDemoPostById = (id: string): Post | undefined => {
  return demoPosts.find(post => post.id === id);
};

export const getDemoPostsByType = (type: PostType): Post[] => {
  return demoPosts.filter(post => post.type === type);
};

export const getDemoPostsByAuthor = (authorId: string): Post[] => {
  return demoPosts.filter(post => post.author.id === authorId);
};

export const getDemoPostsByDateRange = (startDate: Date, endDate: Date): Post[] => {
  return demoPosts.filter(post => 
    post.timestamp >= startDate && post.timestamp <= endDate
  );
};