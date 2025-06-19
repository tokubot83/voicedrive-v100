import { Post, PostType, AnonymityLevel, Priority, VoteOption, ProposalType, StakeholderCategory, Comment, CommentPrivacyLevel, CommentType } from '../../types';
import { demoUsers } from './users';
import { generateSampleVotesByStakeholder } from '../../utils/votingCalculations';
import { projectDemoPosts } from './projectDemoData';
import { progressiveVisibilityDemoPosts } from './progressiveVisibilityPosts';
import { freevoiceDemoPosts } from './freevoicePosts';

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
  
  // 元の投稿（期限切れ）
  {
    id: 'freespace-post-expired-1',
    type: 'community',
    category: 'idea_sharing',
    title: '新人研修プログラムに追加したい内容は？',
    content: '来年度の新人研修プログラムを見直しています。現場で必要だと感じるスキルや知識について教えてください。\n\n現在の研修内容：\n・基本的な業務フロー\n・システム操作方法\n・安全管理について\n\n皆さんが「新人時代にもっと学んでおきたかった」と思うことや、「今の新人に身につけてほしい」スキルがあれば、ぜひ投票で教えてください！',
    author: demoUsers[5], // 人事部職員
    timestamp: new Date('2025-01-03T09:00:00'),
    createdDate: new Date('2025-01-03T09:00:00'),
    visibility: 'organization',
    votingDeadline: new Date('2025-01-10T23:59:59'), // 期限切れ
    tags: ['新人研修', '人材育成', '投票終了'],
    comments: [
      {
        id: 'comment-training-1',
        postId: 'freespace-post-expired-1',
        content: '業界特有の専門知識は確実に必要ですね。現場に配属されてから戸惑うことが多いので。',
        author: demoUsers[1],
        commentType: 'support' as CommentType,
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-05T14:20:00'),
        likes: 5,
        hasLiked: false,
        visibleInfo: {
          facility: demoUsers[1].department,
          position: demoUsers[1].position,
          experienceYears: 2,
          isManagement: false
        },
        replies: [
          {
            id: 'comment-training-1-reply-1',
            postId: 'freespace-post-expired-1',
            parentId: 'comment-training-1',
            content: '具体的にはどのような専門知識が必要でしょうか？カリキュラムの参考にしたいです。',
            author: demoUsers[3],
            commentType: 'question' as CommentType,
            privacyLevel: 'full' as CommentPrivacyLevel,
            anonymityLevel: 'full' as AnonymityLevel,
            timestamp: new Date('2025-01-05T15:30:00'),
            likes: 2,
            hasLiked: false,
            visibleInfo: {
              facility: demoUsers[3].department,
              position: demoUsers[3].position,
              experienceYears: 5,
              isManagement: true
            }
          }
        ]
      },
      {
        id: 'comment-training-2',
        postId: 'freespace-post-expired-1',
        content: 'Excel などのデジタルスキルも重要です。データ集計や資料作成で必ず使うので、基礎をしっかり教えてもらえると助かります。',
        author: demoUsers[2],
        commentType: 'proposal' as CommentType,
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-07T10:15:00'),
        likes: 8,
        hasLiked: true,
        visibleInfo: {
          facility: demoUsers[2].department,
          position: demoUsers[2].position,
          experienceYears: 3,
          isManagement: false
        }
      },
      {
        id: 'comment-training-3',
        postId: 'freespace-post-expired-1',
        content: '新人研修の期間が短すぎるのではないでしょうか。実務に必要なスキルを身につけるには、もう少し時間が必要かもしれません。',
        author: demoUsers[4],
        commentType: 'concern' as CommentType,
        privacyLevel: 'anonymous' as CommentPrivacyLevel,
        anonymityLevel: 'anonymous' as AnonymityLevel,
        timestamp: new Date('2025-01-07T16:45:00'),
        likes: 3,
        hasLiked: false
      }
    ]
  },
  
  // 📊 接戦だった投票の結果投稿
  {
    id: 'poll-result-cafe-hours',
    type: 'community',
    category: 'casual_discussion',
    title: '📊 投票結果: 社内カフェの営業時間、どうしたい？',
    content: `## 🏆 投票結果発表

**元の投稿**: 社内カフェの営業時間、どうしたい？
**投票期間**: 2025/1/1 ～ 2025/1/8

### 🥇 最多得票
**朝を早めに（8:00-17:00）** (94票 - 26.7%)

### 📈 詳細結果

🥇 **朝を早めに（8:00-17:00）**: 94票 (26.7%)
🥈 **現状維持（9:00-17:00）**: 89票 (25.3%)
🥉 **夜を遅めに（9:00-19:00）**: 87票 (24.7%)
📊 **朝夜両方延長（8:00-19:00）**: 82票 (23.3%)

### 📊 投票統計
- **総投票数**: 352票
- **参加率**: 70.4%
- **投票方式**: 単一選択

### 💭 分析コメント

📊 **適度な参加率**: 70.4%の参加率でした。より多くの意見を集めるため、今後は告知方法の改善を検討してみてください。

🤝 **接戦の結果**: 1位と2位の差が1.4%と僅差でした。両方の意見を考慮した判断が望ましいかもしれません。

非常に興味深い結果となりました。**朝を早めに**が僅差で1位を獲得しましたが、**現状維持**も25.3%と高い支持を得ています。また、**夜を遅めに**も24.7%と、ほぼ同等の支持があることから、利用者のニーズが多様であることが分かります。

これらの結果を踏まえると、段階的な実施や曜日別の営業時間設定なども検討の価値があるかもしれません。全ての選択肢が20%以上の支持を得ていることから、利用者の生活パターンやワークスタイルの多様性が反映されていると考えられます。

---
*この結果は投票期限終了時に自動生成されました*`,
    author: 'system',
    timestamp: new Date('2025-01-09T00:01:00'),
    createdDate: new Date('2025-01-09T00:01:00'),
    votingDeadline: null,
    isUrgent: false,
    visibility: 'facility',
    tags: ['投票結果', '自動生成', '社内カフェ', '営業時間'],
    comments: [],
    pollResult: {
      totalVotes: 352,
      winnerOption: { id: 'cafe-opt-2', text: '朝を早めに（8:00-17:00）', emoji: '🌅', votes: 94 },
      participationRate: 70.4,
      results: [
        { option: { id: 'cafe-opt-2', text: '朝を早めに（8:00-17:00）', emoji: '🌅', votes: 94 }, votes: 94, percentage: 26.7 },
        { option: { id: 'cafe-opt-1', text: '現状維持（9:00-17:00）', emoji: '⏰', votes: 89 }, votes: 89, percentage: 25.3 },
        { option: { id: 'cafe-opt-3', text: '夜を遅めに（9:00-19:00）', emoji: '🌆', votes: 87 }, votes: 87, percentage: 24.7 },
        { option: { id: 'cafe-opt-4', text: '朝夜両方延長（8:00-19:00）', emoji: '🕐', votes: 82 }, votes: 82, percentage: 23.3 }
      ]
    },
    originalPollId: 'poll-expired-2',
    originalPostId: 'freespace-post-expired-2'
  },
  
  // 元の投稿その2（期限切れ・接戦）
  {
    id: 'freespace-post-expired-2',
    type: 'community',
    category: 'casual_discussion',
    title: '社内カフェの営業時間、どうしたい？',
    content: '社内カフェの営業時間について、皆さんの希望をお聞かせください。現在は9:00-17:00ですが、より利用しやすくするための改善案を検討中です。\n\n【現在の営業時間】\n9:00 - 17:00\n\n【検討中の改善案】\n・朝の時間を早める\n・夜の時間を延長する\n・両方延長する\n\n皆さんの生活パターンや勤務時間を考慮して、最も利用しやすい時間帯を教えてください！',
    author: demoUsers[7], // 事務職員
    timestamp: new Date('2025-01-01T10:00:00'),
    createdDate: new Date('2025-01-01T10:00:00'),
    visibility: 'facility',
    votingDeadline: new Date('2025-01-08T23:59:59'), // 期限切れ
    tags: ['社内カフェ', '営業時間', '投票終了'],
    comments: [
      {
        id: 'comment-cafe-1',
        postId: 'freespace-post-expired-2',
        content: '早朝出勤なので、8時から開いていると助かります。朝のコーヒーが欲しいです！',
        author: demoUsers[2],
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-03T08:30:00'),
        visibleInfo: {
          facility: demoUsers[2].department,
          position: demoUsers[2].position,
          experienceYears: 3,
          isManagement: false
        }
      },
      {
        id: 'comment-cafe-2',
        postId: 'freespace-post-expired-2',
        content: '残業が多いので、19時まで開いていると夕食前の軽食が買えて便利です。',
        author: demoUsers[4],
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-05T16:45:00'),
        visibleInfo: {
          facility: demoUsers[4].department,
          position: demoUsers[4].position,
          experienceYears: 5,
          isManagement: false
        }
      }
    ]
  },
  
  // 更衣時間の勤務時間算入に関する提案（承認フローデモ用）
  {
    id: 'post-uniform-time-proposal',
    type: 'communication',
    proposalType: 'operational' as ProposalType,
    content: '更衣時間も勤務時間に含めるべきか検討すべき\n\n現在、制服の着替え時間は勤務時間に含まれておらず、多くのスタッフが勤務開始前に早めに出勤しています。労働基準法上も「業務に必要な準備時間」として勤務時間に算入することが妥当と考えられます。\n\n【現状の課題】\n・スタッフの実質的な拘束時間が増加\n・早朝出勤による通勤負担\n・更衣室の混雑による待機時間\n\n【提案内容】\n・更衣時間を勤務時間に算入（10分程度）\n・シフト調整による運用開始時間の見直し\n・段階的な導入で運用面の課題を検証\n\nスタッフの働きやすさ向上と法的コンプライアンスの観点から、ぜひご検討いただければと思います。',
    author: demoUsers[1], // 佐藤花子 (看護師)
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2025-01-10T14:30:00'),
    votes: {
      'strongly-oppose': 2,
      'oppose': 5,
      'neutral': 12,
      'support': 28,
      'strongly-support': 25,
    },
    comments: [
      {
        id: 'comment-uniform-1',
        postId: 'post-uniform-time-proposal',
        content: '本当にその通りです。毎日早めに来て着替えていますが、実質的な拘束時間が長くなっています。労働時間に含めていただけると助かります。',
        author: demoUsers[2],
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-10T16:45:00'),
        visibleInfo: {
          facility: demoUsers[2].department,
          position: demoUsers[2].position,
          experienceYears: 3,
          isManagement: false
        }
      },
      {
        id: 'comment-uniform-2',
        postId: 'post-uniform-time-proposal',
        content: '管理者としても賛成です。スタッフの働きやすさとコンプライアンスを両立できる提案です。運用面での調整は必要ですが、段階的に導入していきましょう。',
        author: demoUsers[3],
        privacyLevel: 'full' as CommentPrivacyLevel,
        anonymityLevel: 'real' as AnonymityLevel,
        timestamp: new Date('2025-01-13T10:15:00'),
        visibleInfo: {
          facility: demoUsers[3].department,
          position: demoUsers[3].position,
          experienceYears: 4,
          isManagement: false
        }
      }
    ]
  },
  
  // 面談フィードバック改善提案
  {
    id: 'post-interview-feedback',
    type: 'improvement',
    proposalType: 'communication' as ProposalType,
    content: '面談実施後のフォローアップシステムの改善を提案します。面談で決めたアクションプランの進捗確認や、必要に応じた追加サポートを体系化することで、より効果的なキャリア支援が可能になると考えます。',
    author: demoUsers[16], // 田村智恵 (キャリア支援部門長)
    anonymityLevel: 'real_name',
    priority: 'medium',
    timestamp: new Date('2025-01-11T16:00:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 4,
      'support': 18,
      'strongly-support': 8,
    },
    comments: generateSampleComments('post-interview-feedback', 3),
  },

  // 社内会議効率化の提案
  {
    id: 'post-voting-system-test',
    type: 'improvement',
    // 基本的な改善提案
    content: '社内の会議時間を短縮するため、アジェンダの事前共有と時間制限の導入を提案します。',
    author: demoUsers[4],
    anonymityLevel: 'real_name',
    priority: 'medium',
    timestamp: new Date('2025-01-10T10:00:00'),
    votes: {
      'strongly-oppose': 1,
      'oppose': 2,
      'neutral': 5,
      'support': 8,
      'strongly-support': 3,
    },
    comments: generateSampleComments('post-voting-system-test', 2),
    // シンプルな改善提案
  },
  
  // 部署プロジェクト化された電子カルテ改善提案
  {
    id: 'post-score-test',
    type: 'improvement',
    proposalType: 'operational' as ProposalType,
    content: '電子カルテシステムの入力効率を向上させるため、よく使用する定型文のショートカット機能を追加提案します。現在、同じ内容を何度も入力する作業が多く、1日あたり30分程度の時間短縮が見込めます。',
    author: demoUsers[8], // HR Staff - 確実に権限あり
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2024-05-01T10:00:00'),
    votes: {
      'strongly-oppose': 1,
      'oppose': 2, 
      'neutral': 7,
      'support': 35,
      'strongly-support': 25,
    }, // 高い賛成率でプロジェクト化された改善提案
    votesByStakeholder: generateSampleVotesByStakeholder({
      'strongly-oppose': 1,
      'oppose': 2,
      'neutral': 7, 
      'support': 35,
      'strongly-support': 25,
    }),
    comments: generateSampleComments('post-score-test', 5),
    projectId: 'proj-score-test',
    approver: demoUsers[10],
    projectStatus: {
      stage: 'active',
      score: 650, // 部署レベルを超える高スコア
      threshold: 100,
      progress: 650 // 高い進捗状況
    },
    // プロジェクトの現在のステータス
    enhancedProjectStatus: {
      stage: 'DEPARTMENT_PROJECT',
      level: 'DEPARTMENT',
      approvalLevel: 'LEVEL_2',
      budget: 150000,
      timeline: '3ヶ月プロジェクト (1/3ヶ月経過)',
      milestones: [
        { name: '要件定義', status: 'completed', progress: 100, date: '2024-05-01' },
        { name: '開発', status: 'in_progress', progress: 30, date: '2024-06-01' },
        { name: 'テスト', status: 'pending', progress: 0, date: '2024-07-01' }
      ],
      resources: {
        completion: 30,
        budget_total: 150000,
        budget_used: 45000,
        team_size: 3
      }
    }
  },
  // LED照明への交換提案
  {
    id: 'post-voting-system-test-2',
    type: 'improvement',
    // 基本的な環境改善提案
    content: 'オフィスの照明をLEDに交換して電気代を節約しませんか？環境にも優しく、長期的にコスト削減につながります。',
    author: demoUsers[1],
    anonymityLevel: 'department_only',
    priority: 'low',
    timestamp: new Date('2025-01-09T14:30:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 1,
      'neutral': 3,
      'support': 6,
      'strongly-support': 2,
    },
    comments: [],
  },
  
  // Spring (April-May) - New fiscal year, new employees
  {
    id: 'post-1',
    type: 'improvement',
    proposalType: 'operational' as ProposalType,
    content: '新入社員の研修プログラムについて、もっと実践的な内容を増やしてはどうでしょうか。座学だけでなく、先輩社員とのペアプログラミングやOJTの時間を増やすことで、より早く戦力になれると思います。',
    author: demoUsers[2], // Senior employee
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date('2024-04-15T09:30:00'),
    votes: {
      'strongly-oppose': 2,
      'oppose': 3,
      'neutral': 8,
      'support': 20,
      'strongly-support': 15,
    },
    votesByStakeholder: generateSampleVotesByStakeholder({
      'strongly-oppose': 2,
      'oppose': 3,
      'neutral': 8,
      'support': 20,
      'strongly-support': 15,
    }),
    comments: generateSampleComments('post-1', 3),
    projectId: 'proj-001',
    approver: demoUsers[10],
    projectStatus: {
      stage: 'active',
      score: 420,
      threshold: 400,
      progress: 105
    },
    enhancedProjectStatus: {
      stage: 'FACILITY_PROJECT',
      level: 'FACILITY',
      approvalLevel: 'LEVEL_4',
      budget: 800000,
      timeline: '6ヶ月プロジェクト (3/6ヶ月経過)',
      milestones: [
        { name: '要件定義', status: 'completed', progress: 100, date: '2024-04-01' },
        { name: '設計', status: 'completed', progress: 100, date: '2024-05-01' },
        { name: '実装', status: 'in_progress', progress: 75, date: '2024-06-15' },
        { name: 'テスト', status: 'pending', progress: 0, date: '2024-07-01' }
      ],
      resources: {
        completion: 75,
        budget_total: 800000,
        budget_used: 450000,
        team_size: 12
      }
    }
  },
  {
    id: 'post-2',
    type: 'community',
    content: '新年度の歓迎会を4月26日（金）に開催予定です！新しく入社された皆さんを温かく迎えましょう。場所は会社近くの「さくら」で、19時開始予定です。',
    author: demoUsers[5], // Team lead
    anonymityLevel: 'real_name',
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
    anonymityLevel: 'department_only',
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
    },
    enhancedProjectStatus: {
      stage: 'DEPARTMENT_PROJECT',
      level: 'DEPARTMENT',
      approvalLevel: 'LEVEL_3',
      budget: 300000,
      timeline: '3ヶ月検討期間 (1/3ヶ月経過)',
      milestones: [
        { name: '課題分析', status: 'completed', progress: 100, date: '2024-06-15' },
        { name: '予算確保', status: 'in_progress', progress: 60, date: '2024-07-01' },
        { name: '実施計画', status: 'pending', progress: 0, date: '2024-07-15' }
      ],
      resources: {
        completion: 25,
        budget_total: 300000,
        budget_used: 85000,
        team_size: 6
      }
    }
  },
  {
    id: 'post-4',
    type: 'report',
    content: '夏季の電力使用量削減プロジェクトの進捗報告です。6月の電力使用量は前年同月比で15%削減を達成しました。LED照明への切り替えと、エアコンの効率的な運用が功を奏しています。',
    author: demoUsers[6], // Supervisor
    anonymityLevel: 'real_name',
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
    author: demoUsers[0], // Entry-level employee (田中太郎)
    anonymityLevel: 'anonymous',
    priority: 'high',
    timestamp: new Date('2024-09-10T16:00:00'),
    votes: {
      'strongly-oppose': 2,
      'oppose': 3,
      'neutral': 8,
      'support': 35,
      'strongly-support': 42
    }, // 高いスコア（380点相当）で施設プロジェクトレベル
    comments: [
      {
        id: 'comment-6-1',
        content: '1on1の時間延長は重要な提案です。従業員の成長とエンゲージメント向上に直結します。',
        author: demoUsers[5],
        privacyLevel: 'full' as CommentPrivacyLevel,
        anonymityLevel: 'real' as AnonymityLevel,
        timestamp: new Date('2024-09-11T09:30:00')
      },
      {
        id: 'comment-6-2',
        content: '管理職の負担増加も考慮する必要がありますが、効果的なフィードバックには必要な時間だと思います。',
        author: demoUsers[3],
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2024-09-11T14:20:00')
      }
    ],
    projectId: 'proj-003',
    status: 'member_selection_phase', // メンバー選出フェーズ
    deadline: new Date('2024-12-20T23:59:59'), // 期限切迫状態
    memberSelectionDeadline: new Date('2024-12-22T17:00:00')
  },
  {
    id: 'post-7',
    type: 'report',
    content: '第2四半期の業績報告：売上高は前年同期比112%を達成しました。特に新製品ラインが好調で、計画を上回る成果を出しています。詳細は添付資料をご覧ください。',
    author: demoUsers[11], // Director
    anonymityLevel: 'real_name',
    timestamp: new Date('2024-10-01T09:00:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-8',
    type: 'community',
    content: '社内運動会を11月3日（祝）に開催します！昨年好評だったリレーや綱引きに加えて、今年は新種目も検討中です。ご家族の参加も大歓迎です。',
    author: demoUsers[4], // Team lead
    anonymityLevel: 'real_name',
    timestamp: new Date('2024-10-15T11:30:00'),
    votes: generateVotes(),
    comments: [],
    freespaceCategory: 'event_planning',
    expirationDate: new Date('2024-11-04T23:59:00'), // イベント終了日+1日
    isExpired: true,
    isArchived: false
  },
  
  // Winter (December-March) - Year-end, planning for next year
  {
    id: 'post-9',
    type: 'improvement',
    proposalType: 'strategic' as ProposalType,
    content: '年末年始の休暇取得について、もっと柔軟な制度にできないでしょうか。12月29日から1月3日の一律休業ではなく、個人の事情に合わせて休暇を取得できるようにしてほしいです。',
    author: demoUsers[7], // Manager
    anonymityLevel: 'real_name',
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
    anonymityLevel: 'real_name',
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
    anonymityLevel: 'real_name',
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
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-08T11:00:00'),
    votes: generateVotes(),
    comments: [],
    freespaceCategory: 'event_planning',
    expirationDate: new Date('2025-01-25T23:59:00'), // イベント終了日+1日
    isExpired: false
  },
  {
    id: 'post-13',
    type: 'improvement',
    proposalType: 'operational' as ProposalType,
    content: '会議室の予約システムが使いにくいです。空き状況の確認と予約を同じ画面でできるようにし、定期予約の機能も追加してもらえないでしょうか。',
    author: demoUsers[1], // Entry-level employee
    anonymityLevel: 'department_only',
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
    anonymityLevel: 'real_name',
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
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-05T17:20:00'),
    votes: generateVotes(),
    comments: [],
    freespaceCategory: 'casual_discussion',
    expirationDate: new Date('2025-01-12T17:20:00'), // 7日後
    isExpired: false
  },
  {
    id: 'post-17',
    type: 'improvement',
    proposalType: 'strategic' as ProposalType,
    content: '育児支援制度の拡充について提案があります。時短勤務の期間を小学校3年生まで延長し、在宅勤務との併用も可能にしてはどうでしょうか。',
    author: demoUsers[5], // Team lead
    anonymityLevel: 'real_name',
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
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-03T09:30:00'),
    votes: generateVotes(),
    comments: []
  },
  {
    id: 'post-19',
    type: 'improvement',
    proposalType: 'strategic',
    content: '駐車場の利用ルールについて、エコカー優先スペースを設けてはどうでしょうか。環境への取り組みをアピールできますし、社員のエコカー購入を促進できると思います。',
    author: demoUsers[6], // Supervisor
    anonymityLevel: 'department_only',
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
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-01T09:00:00'),
    votes: generateVotes(),
    comments: [],
    freespaceCategory: 'idea_sharing',
    expirationDate: new Date('2025-01-31T23:59:00'), // 30日後
    isExpired: false
  },
  
  // 期限切れ間近の投稿 (デモ用)
  {
    id: 'post-expiring-soon',
    type: 'community',
    content: 'オフィスのコーヒーマシンの種類を増やしてみませんか？エスプレッソやカプチーノなど、皆さんの希望を聞かせてください。',
    author: demoUsers[0], // 一般社員
    anonymityLevel: 'department_only',
    timestamp: new Date('2025-01-10T15:00:00'),
    votes: generateVotes(),
    comments: [],
    freespaceCategory: 'casual_discussion',
    expirationDate: new Date('2025-01-17T15:00:00'), // 7日後 (間もなく期限切れ)
    isExpired: false
  },
  
  // 延長申請中の投稿 (デモ用)
  {
    id: 'post-extension-requested',
    type: 'community',
    content: '社内ハッカソンのアイデア募集中！今年のテーマは「業務効率化」です。AIやRPAを活用した新しいツールのアイデアをお待ちしています。',
    author: demoUsers[2], // ベテラン社員
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-01T12:00:00'),
    votes: generateVotes(),
    comments: [],
    freespaceCategory: 'idea_sharing',
    expirationDate: new Date('2025-01-31T23:59:00'), // オリジナル期限
    extensionRequested: true,
    extensionReason: 'まだ多くのアイデアが必要で、より多くの意見を集めたいため',
    extensionRequestedDate: new Date('2025-01-12T09:00:00'),
    isExpired: false
  },

  // コメントのみのフリーボイス投稿 (デモ用)
  {
    id: 'post-comment-only-demo',
    type: 'community',
    content: '最近、リモートワークで集中力を保つコツについて悩んでいます。在宅勤務の際に、皆さんはどのような工夫をされていますか？\n\n自分なりに試してみていることはありますが、他の方の経験談や効果的だった方法があれば、ぜひ教えてください。働き方の参考にしたいと思います。',
    author: demoUsers[1], // 一般職員
    anonymityLevel: 'partial',
    timestamp: new Date('2025-01-18T10:30:00'),
    votes: {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 0,
      'support': 0,
      'strongly-support': 0
    },
    comments: [
      {
        id: 'comment-only-demo-1',
        postId: 'post-comment-only-demo',
        content: '私は作業用BGMを流すことで集中力を保っています。特にクラシック音楽やアンビエント系の音楽が効果的でした。',
        author: demoUsers[3],
        commentType: 'proposal' as CommentType,
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'partial' as AnonymityLevel,
        timestamp: new Date('2025-01-18T11:15:00'),
        likes: 4,
        hasLiked: false,
        visibleInfo: {
          position: demoUsers[3].position,
          experienceYears: 3,
          isManagement: false
        }
      },
      {
        id: 'comment-only-demo-2',
        postId: 'post-comment-only-demo',
        content: 'ポモドーロテクニック（25分集中→5分休憩）を試してみてはいかがでしょうか？時間を区切ることで集中力が続きやすくなります。',
        author: demoUsers[4],
        commentType: 'proposal' as CommentType,
        privacyLevel: 'selective' as CommentPrivacyLevel,
        anonymityLevel: 'selective' as AnonymityLevel,
        timestamp: new Date('2025-01-18T14:20:00'),
        likes: 7,
        hasLiked: true,
        visibleInfo: {
          facility: '小原病院',
          position: demoUsers[4].position,
          experienceYears: 5,
          isManagement: false
        }
      }
    ],
    freespaceCategory: 'casual_discussion',
    freespaceScope: 'organization'
  },

  // フリースペース投票機能デモ投稿
  {
    id: 'post-poll-demo-1',
    type: 'community',
    content: '年末調整の書類提出方法について、皆さんはどの方法が便利だと思いますか？',
    author: demoUsers[5], // 人事部職員
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-16T14:00:00'),
    votes: generateVotes(),
    comments: generateSampleComments('post-poll-demo-1', 4),
    freespaceCategory: 'idea_sharing',
    freespaceScope: 'organization',
    poll: {
      id: 'poll-demo-1',
      question: '年末調整書類の提出方法はどれが良い？',
      description: '来年度の年末調整をより効率的にするため、皆さんのご意見をお聞かせください',
      options: [
        { id: 'opt-demo-1', text: '紙での提出（従来通り）', emoji: '📄', votes: 23 },
        { id: 'opt-demo-2', text: 'メール添付での提出', emoji: '📧', votes: 45 },
        { id: 'opt-demo-3', text: '専用Webサイトでの入力', emoji: '💻', votes: 67 },
        { id: 'opt-demo-4', text: 'スマホアプリでの提出', emoji: '📱', votes: 34 }
      ],
      totalVotes: 169,
      deadline: new Date('2025-01-25T23:59:59'),
      isActive: true,
      showResults: 'afterVote',
      category: 'idea_sharing',
      scope: 'organization',
      createdAt: new Date('2025-01-16T14:00:00'),
      createdBy: demoUsers[5]
    }
  },

  {
    id: 'post-poll-demo-2',
    type: 'community',
    content: '今度の部署懇親会、みんなでゲームをやりませんか？',
    author: demoUsers[2], // 一般職員
    anonymityLevel: 'department_only',
    timestamp: new Date('2025-01-15T16:30:00'),
    votes: generateVotes(),
    comments: generateSampleComments('post-poll-demo-2', 3),
    freespaceCategory: 'casual_discussion',
    freespaceScope: 'department',
    poll: {
      id: 'poll-demo-2',
      question: '懇親会でやりたいゲームは？',
      description: '盛り上がること間違いなし！',
      options: [
        { id: 'opt-demo-5', text: 'ビンゴゲーム', emoji: '🎯', votes: 28 },
        { id: 'opt-demo-6', text: 'クイズ大会', emoji: '🧠', votes: 19 },
        { id: 'opt-demo-7', text: 'じゃんけん大会', emoji: '✊', votes: 15 }
      ],
      totalVotes: 62,
      deadline: new Date('2025-01-20T18:00:00'),
      isActive: true,
      showResults: 'afterVote',
      category: 'casual_discussion',
      scope: 'department',
      createdAt: new Date('2025-01-15T16:30:00'),
      createdBy: demoUsers[2]
    }
  },

  // イベント企画機能デモ投稿
  {
    id: 'post-event-demo-1',
    type: 'community',
    content: '',
    author: demoUsers[6], // 管理職
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-14T11:00:00'),
    votes: generateVotes(),
    comments: generateSampleComments('post-event-demo-1', 5),
    freespaceCategory: 'event_planning',
    freespaceScope: 'facility',
    event: {
      id: 'event-demo-1',
      title: '健康増進ウォーキング大会',
      description: '新年の健康増進を目的としたウォーキングイベントを企画しました！職員同士の親睦も深められる楽しいイベントにしたいと思います。',
      type: 'sports',
      proposedDates: [
        {
          id: 'date-demo-1-1',
          date: new Date('2025-02-15T00:00:00'),
          startTime: '09:00',
          endTime: '12:00',
          votes: [
            { id: 'vote-demo-1', proposedDateId: 'date-demo-1-1', userId: 'user-1', response: 'available', timestamp: new Date() },
            { id: 'vote-demo-2', proposedDateId: 'date-demo-1-1', userId: 'user-2', response: 'available', timestamp: new Date() },
            { id: 'vote-demo-3', proposedDateId: 'date-demo-1-1', userId: 'user-3', response: 'maybe', timestamp: new Date() }
          ],
          totalVotes: 23
        },
        {
          id: 'date-demo-1-2',
          date: new Date('2025-02-22T00:00:00'),
          startTime: '09:00',
          endTime: '12:00',
          votes: [
            { id: 'vote-demo-4', proposedDateId: 'date-demo-1-2', userId: 'user-1', response: 'maybe', timestamp: new Date() },
            { id: 'vote-demo-5', proposedDateId: 'date-demo-1-2', userId: 'user-2', response: 'available', timestamp: new Date() }
          ],
          totalVotes: 18
        }
      ],
      organizer: demoUsers[6],
      maxParticipants: 50,
      participants: [
        {
          id: 'participant-demo-1',
          user: demoUsers[1],
          status: 'confirmed',
          joinedAt: new Date('2025-01-14T12:00:00'),
          note: '運動不足解消に参加します！'
        },
        {
          id: 'participant-demo-2',
          user: demoUsers[2],
          status: 'confirmed',
          joinedAt: new Date('2025-01-14T14:30:00')
        },
        {
          id: 'participant-demo-3',
          user: demoUsers[4],
          status: 'confirmed',
          joinedAt: new Date('2025-01-14T15:45:00'),
          note: '家族も参加可能でしょうか？'
        }
      ],
      waitlist: [],
      venue: {
        name: '〇〇公園ウォーキングコース',
        address: '〇〇市××町1-1',
        capacity: 100,
        amenities: ['駐車場あり', '更衣室', '休憩所']
      },
      cost: 0,
      requirements: ['運動しやすい服装', '飲み物持参', '雨天中止'],
      status: 'date_voting',
      visibility: 'facility',
      allowDateVoting: true,
      allowParticipantComments: true,
      sendReminders: true,
      createdAt: new Date('2025-01-14T11:00:00'),
      updatedAt: new Date('2025-01-16T09:00:00'),
      tags: ['健康', 'ウォーキング', '親睦', '運動'],
      registrationDeadline: new Date('2025-02-10T23:59:59')
    }
  },

  {
    id: 'post-event-demo-2',
    type: 'community',
    content: '',
    author: demoUsers[3], // チームリーダー
    anonymityLevel: 'real_name',
    timestamp: new Date('2025-01-13T09:30:00'),
    votes: generateVotes(),
    comments: generateSampleComments('post-event-demo-2', 2),
    freespaceCategory: 'event_planning',
    freespaceScope: 'department',
    event: {
      id: 'event-demo-2',
      title: 'Excel活用スキルアップ講座',
      description: '業務効率化のためのExcel活用講座を開催します。基本操作からピボットテーブル、マクロまで実践的に学べます。',
      type: 'training',
      proposedDates: [],
      finalDate: {
        date: new Date('2025-01-28T00:00:00'),
        startTime: '14:00',
        endTime: '16:00',
        timezone: 'Asia/Tokyo'
      },
      organizer: demoUsers[3],
      maxParticipants: 15,
      participants: [
        {
          id: 'participant-demo-4',
          user: demoUsers[1],
          status: 'confirmed',
          joinedAt: new Date('2025-01-13T10:00:00'),
          note: 'ピボットテーブルを覚えたいです'
        },
        {
          id: 'participant-demo-5',
          user: demoUsers[2],
          status: 'confirmed',
          joinedAt: new Date('2025-01-13T11:15:00')
        }
      ],
      waitlist: [],
      venue: {
        name: '研修室B',
        capacity: 20,
        amenities: ['PC完備', 'プロジェクター', 'ホワイトボード']
      },
      cost: 0,
      requirements: ['Excel基本操作ができること', 'ノートPC持参（貸出可）'],
      status: 'recruiting',
      visibility: 'department',
      allowDateVoting: false,
      allowParticipantComments: true,
      sendReminders: true,
      createdAt: new Date('2025-01-13T09:30:00'),
      updatedAt: new Date('2025-01-13T09:30:00'),
      tags: ['Excel', 'スキルアップ', '業務効率化', '研修'],
      registrationDeadline: new Date('2025-01-25T17:00:00')
    }
  },
  
  // Add freevoice demo posts (医療介護系法人向け)
  ...freevoiceDemoPosts,
  
  // Add project-level demo posts
  ...projectDemoPosts,
  
  // Add progressive visibility demo posts
  ...progressiveVisibilityDemoPosts
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