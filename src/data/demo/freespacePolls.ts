import { FreespacePost, PollOption } from '../../types';

export const demoPolls: FreespacePost[] = [
  {
    id: 'poll-1',
    type: 'poll',
    title: '病棟の休憩室BGM、どんな音楽がお好みですか？',
    content: '休憩時間をより快適に過ごすため、BGMの導入を検討しています。皆さんのご意見をお聞かせください🎵',
    author: {
      id: 'user-4',
      name: '田中 恵子',
      avatar: '/api/placeholder/150/150',
      position: '看護主任'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'casual_discussion',
    scope: 'department',
    createdAt: new Date('2025-06-08T15:00:00'),
    deadline: new Date('2025-06-22T23:59:59'),
    totalVotes: 8,
    allowMultipleChoices: false,
    showResults: true,
    isExpired: false,
    pollOptions: [
      {
        id: 'opt-1',
        text: 'クラシック音楽 🎼',
        emoji: '🎼',
        votes: 3,
        voters: ['user-6', 'user-8', 'user-10']
      },
      {
        id: 'opt-2',
        text: 'ジャズ 🎷',
        emoji: '🎷',
        votes: 2,
        voters: ['user-7', 'user-9']
      },
      {
        id: 'opt-3',
        text: '自然音（鳥のさえずり、波音など） 🌊',
        emoji: '🌊',
        votes: 2,
        voters: ['user-3', 'user-5']
      },
      {
        id: 'opt-4',
        text: 'BGMなし（静かな環境） 🤫',
        emoji: '🤫',
        votes: 1,
        voters: ['user-2']
      }
    ],
    comments: [
      {
        id: 'comment-poll-1-1',
        userId: 'user-6',
        userName: '伊藤 麻衣',
        content: 'クラシックは心が落ち着いて良いですね。バッハがおすすめです！',
        timestamp: new Date('2025-06-08T16:30:00'),
        likes: 4,
        isAnonymous: false
      },
      {
        id: 'comment-poll-1-2',
        userId: 'user-7',
        userName: '渡辺 由美',
        content: 'ジャズは疲れた心を癒してくれます🎵 音量は小さめで',
        timestamp: new Date('2025-06-09T12:00:00'),
        likes: 2,
        isAnonymous: false
      }
    ]
  },
  {
    id: 'poll-2',
    type: 'poll',
    title: '夏祭りイベント、どの時期が参加しやすいですか？',
    content: '今年も職員とご家族向けの夏祭りを開催予定です。皆さんの都合の良い時期を教えてください🏮',
    author: {
      id: 'user-3',
      name: '鈴木 美香',
      avatar: '/api/placeholder/150/150',
      position: '医療療養病棟師長'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'idea_sharing',
    scope: 'facility',
    createdAt: new Date('2025-06-05T10:00:00'),
    deadline: new Date('2025-06-20T23:59:59'),
    totalVotes: 12,
    allowMultipleChoices: true,
    showResults: true,
    isExpired: false,
    pollOptions: [
      {
        id: 'opt-5',
        text: '7月中旬（海の日の連休） 🌊',
        emoji: '🌊',
        votes: 5,
        voters: ['user-4', 'user-6', 'user-8', 'user-9', 'user-10']
      },
      {
        id: 'opt-6',
        text: '7月下旬 ☀️',
        emoji: '☀️',
        votes: 3,
        voters: ['user-2', 'user-5', 'user-7']
      },
      {
        id: 'opt-7',
        text: '8月上旬（お盆前） 🎋',
        emoji: '🎋',
        votes: 2,
        voters: ['user-1', 'user-3']
      },
      {
        id: 'opt-8',
        text: '8月下旬 🌻',
        emoji: '🌻',
        votes: 2,
        voters: ['user-4', 'user-6']
      }
    ],
    comments: [
      {
        id: 'comment-poll-2-1',
        userId: 'user-8',
        userName: '中村 さゆり',
        content: '子供の夏休み期間なので、7月中旬が助かります！',
        timestamp: new Date('2025-06-05T14:00:00'),
        likes: 3,
        isAnonymous: false
      },
      {
        id: 'comment-poll-2-2',
        userId: 'user-2',
        userName: '佐藤 花子',
        content: 'どの時期でも楽しいイベントになりそうですね。準備お疲れ様です',
        timestamp: new Date('2025-06-06T09:00:00'),
        likes: 5,
        isAnonymous: false
      }
    ]
  },
  {
    id: 'poll-3',
    type: 'poll',
    title: '研修の開催時間、どちらが参加しやすいですか？',
    content: '来月の院内研修会の時間設定で迷っています。皆さんのご都合をお聞かせください📚',
    author: {
      id: 'user-5',
      name: '高橋 真理',
      avatar: '/api/placeholder/150/150',
      position: '介護看護補助者主任'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'idea_sharing',
    scope: 'department',
    createdAt: new Date('2025-06-12T11:00:00'),
    deadline: new Date('2025-06-19T23:59:59'),
    totalVotes: 6,
    allowMultipleChoices: false,
    showResults: true,
    isExpired: false,
    pollOptions: [
      {
        id: 'opt-9',
        text: '午前中（10:00-12:00） 🌅',
        emoji: '🌅',
        votes: 4,
        voters: ['user-6', 'user-7', 'user-9', 'user-10']
      },
      {
        id: 'opt-10',
        text: '午後（14:00-16:00） ☀️',
        emoji: '☀️',
        votes: 2,
        voters: ['user-4', 'user-8']
      }
    ],
    comments: [
      {
        id: 'comment-poll-3-1',
        userId: 'user-7',
        userName: '渡辺 由美',
        content: '午前中の方が集中できそうです。午後は眠くなってしまって😅',
        timestamp: new Date('2025-06-12T12:30:00'),
        likes: 2,
        isAnonymous: false
      }
    ]
  },
  {
    id: 'poll-4',
    type: 'poll',
    title: '制服のカラーバリエーション、どう思いますか？',
    content: '現在白一色の制服ですが、部署ごとに色分けするアイデアがあります。ご意見をお聞かせください👗',
    author: {
      id: 'user-6',
      name: '伊藤 麻衣',
      avatar: '/api/placeholder/150/150',
      position: '看護師'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    category: 'casual_discussion',
    scope: 'facility',
    createdAt: new Date('2025-06-01T09:00:00'),
    deadline: new Date('2025-06-15T23:59:59'),
    totalVotes: 9,
    allowMultipleChoices: false,
    showResults: true,
    isExpired: true,
    pollOptions: [
      {
        id: 'opt-11',
        text: '賛成！部署が分かりやすくて良い 👍',
        emoji: '👍',
        votes: 6,
        voters: ['user-3', 'user-4', 'user-7', 'user-8', 'user-9', 'user-10']
      },
      {
        id: 'opt-12',
        text: '現在の白一色で良い 👔',
        emoji: '👔',
        votes: 2,
        voters: ['user-2', 'user-5']
      },
      {
        id: 'opt-13',
        text: 'どちらでも良い 🤷‍♀️',
        emoji: '🤷‍♀️',
        votes: 1,
        voters: ['user-1']
      }
    ],
    comments: [
      {
        id: 'comment-poll-4-1',
        userId: 'user-4',
        userName: '田中 恵子',
        content: '患者さんにも職種が分かりやすくて良いアイデアですね！',
        timestamp: new Date('2025-06-01T15:00:00'),
        likes: 4,
        isAnonymous: false
      },
      {
        id: 'comment-poll-4-2',
        userId: 'user-10',
        userName: '加藤 健太',
        content: 'リハビリ部門は動きやすさも重要なので、デザインも考慮してもらえると嬉しいです',
        timestamp: new Date('2025-06-02T10:00:00'),
        likes: 3,
        isAnonymous: false
      }
    ]
  }
];

// Helper functions
// エイリアスとしてfreespacePostsもエクスポート
export const freespacePolls = demoPolls;

// 投票データもエクスポート（後方互換性のため）
export const demoVotes = demoPolls.map(poll => ({
  pollId: poll.id,
  votes: poll.pollOptions?.reduce((total, option) => total + option.votes, 0) || 0
}));

export const getFreespacePostById = (id: string): FreespacePost | undefined => {
  return demoPolls.find(post => post.id === id);
};

export const getFreespacePostsByDepartment = (department: string): FreespacePost[] => {
  return demoPolls.filter(post => post.department === department);
};

export const getFreespacePostsByFacility = (facilityId: string): FreespacePost[] => {
  return demoPolls.filter(post => post.facility_id === facilityId);
};

export const getActiveFreespacePolls = (): FreespacePost[] => {
  return demoPolls.filter(post => !post.isExpired);
};

export const getExpiredFreespacePolls = (): FreespacePost[] => {
  return demoPolls.filter(post => post.isExpired);
};