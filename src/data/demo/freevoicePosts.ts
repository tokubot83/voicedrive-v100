import { FreevoicePost, FreevoiceComment } from '../../types';

export const freevoicePosts: FreevoicePost[] = [
  {
    id: 'fv-1',
    content: '夜勤明けの帰り道、桜が満開でした🌸 疲れも吹き飛びます。皆さんもお疲れ様です！',
    author: {
      id: 'user-6',
      name: '伊藤 麻衣',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    filterCategory: 'facility', // 施設内投稿
    timestamp: new Date('2025-06-14T06:30:00'),
    likes: 12,
    isAnonymous: false,
    comments: [
      {
        id: 'fvc-1',
        userId: 'user-8',
        userName: '中村 さゆり',
        content: '本当に綺麗でしたよね！写真撮りました📸',
        timestamp: new Date('2025-06-14T07:00:00'),
        likes: 3,
        isAnonymous: false
      },
      {
        id: 'fvc-2',
        userId: 'user-7',
        userName: '渡辺 由美',
        content: '夜勤お疲れ様でした。桜、見に行きたいです！',
        timestamp: new Date('2025-06-14T08:15:00'),
        likes: 2,
        isAnonymous: false
      }
    ]
  },
  {
    id: 'fv-2',
    content: '今日の昼食、何食べました？私は食堂のカレーライス🍛 最近味が良くなった気がします',
    author: {
      id: 'user-9',
      name: '小林 千恵',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    filterCategory: 'facility', // 施設内投稿
    timestamp: new Date('2025-06-13T12:45:00'),
    likes: 8,
    isAnonymous: false,
    comments: [
      {
        id: 'fvc-3',
        userId: 'user-10',
        userName: '加藤 健太',
        content: '私も同じです！スパイスが効いてて美味しかったです',
        timestamp: new Date('2025-06-13T13:00:00'),
        likes: 1,
        isAnonymous: false
      },
      {
        id: 'fvc-4',
        userId: 'user-6',
        userName: '伊藤 麻衣',
        content: '今度食べてみます😊 いつもお弁当なので新鮮！',
        timestamp: new Date('2025-06-13T13:30:00'),
        likes: 2,
        isAnonymous: false
      }
    ]
  },
  {
    id: 'fv-3',
    content: '患者さんから「ありがとう」って言われると、本当に嬉しいですね。今日も一日頑張ろう💪',
    author: {
      id: 'user-8',
      name: '中村 さゆり',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    filterCategory: 'facility', // 施設内投稿
    timestamp: new Date('2025-06-12T09:00:00'),
    likes: 15,
    isAnonymous: false,
    comments: [
      {
        id: 'fvc-5',
        userId: 'user-7',
        userName: '渡辺 由美',
        content: 'それが一番のやりがいですよね！私も昨日嬉しいことがありました',
        timestamp: new Date('2025-06-12T09:30:00'),
        likes: 4,
        isAnonymous: false
      },
      {
        id: 'fvc-6',
        userId: 'user-4',
        userName: '田中 恵子',
        content: '皆さんの笑顔が患者さんにも伝わっています。いつもありがとう',
        timestamp: new Date('2025-06-12T10:00:00'),
        likes: 6,
        isAnonymous: false
      }
    ]
  },
  {
    id: 'fv-4',
    content: '研修で学んだ新しいリハビリ技術、明日から実践してみます。患者さんの回復に少しでも役立てば嬉しいです',
    author: {
      id: 'user-10',
      name: '加藤 健太',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    filterCategory: 'facility', // 施設内投稿
    timestamp: new Date('2025-06-11T17:30:00'),
    likes: 9,
    isAnonymous: false,
    comments: [
      {
        id: 'fvc-7',
        userId: 'user-3',
        userName: '鈴木 美香',
        content: '学んだことをすぐに実践する姿勢、素晴らしいですね！',
        timestamp: new Date('2025-06-11T18:00:00'),
        likes: 3,
        isAnonymous: false
      }
    ]
  },
  {
    id: 'fv-5',
    content: '匿名で失礼します。最近疲れが溜まって...皆さんはどうやってリフレッシュしてますか？😔',
    author: {
      id: 'user-7',
      name: '匿名',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    filterCategory: 'facility', // 施設内投稿
    timestamp: new Date('2025-06-10T22:00:00'),
    likes: 11,
    isAnonymous: true,
    comments: [
      {
        id: 'fvc-8',
        userId: 'user-6',
        userName: '伊藤 麻衣',
        content: '私は温泉に行きます♨️ 近くに良い日帰り温泉がありますよ',
        timestamp: new Date('2025-06-11T07:00:00'),
        likes: 5,
        isAnonymous: false
      },
      {
        id: 'fvc-9',
        userId: 'user-8',
        userName: '中村 さゆり',
        content: '散歩がおすすめです🚶‍♀️ 自然を見ると心が落ち着きます',
        timestamp: new Date('2025-06-11T08:30:00'),
        likes: 3,
        isAnonymous: false
      },
      {
        id: 'fvc-10',
        userId: 'user-4',
        userName: '田中 恵子',
        content: '無理しないでくださいね。何かあれば相談してください',
        timestamp: new Date('2025-06-11T09:00:00'),
        likes: 7,
        isAnonymous: false
      }
    ]
  },
  // 投票対象の投稿
  {
    id: 'fv-6',
    content: '勤務シフトの希望提出方法について投票をお願いします📝 現在の紙ベースから変更を検討中です。皆さんのご意見をお聞かせください！',
    author: {
      id: 'user-4',
      name: '田中 恵子',
      avatar: '/api/placeholder/150/150'
    },
    department: '医療療養病棟',
    facility_id: 'tategami_hospital',
    filterCategory: 'voting', // 投票対象
    hasVoting: true,
    votingDeadline: new Date('2025-06-28T23:59:59'),
    timestamp: new Date('2025-06-15T10:00:00'),
    likes: 6,
    isAnonymous: false,
    comments: [
      {
        id: 'fvc-11',
        userId: 'user-6',
        userName: '伊藤 麻衣',
        content: 'デジタル化に賛成です！スマホから入力できると便利ですね',
        timestamp: new Date('2025-06-15T11:00:00'),
        likes: 3,
        isAnonymous: false
      }
    ]
  },
  // 全体表示の投稿（他施設からの情報）
  {
    id: 'fv-7',
    content: '法人内の他施設です。新しい介護技術の研修会を開催します🏥 興味のある方はご参加ください。オンライン参加も可能です！',
    author: {
      id: 'user-14',
      name: '佐々木 健',
      avatar: '/api/placeholder/150/150'
    },
    department: '介護部',
    facility_id: 'other_facility',
    filterCategory: 'all', // 全体表示
    timestamp: new Date('2025-06-13T15:00:00'),
    likes: 8,
    isAnonymous: false,
    comments: [
      {
        id: 'fvc-12',
        userId: 'user-5',
        userName: '高橋 真理',
        content: '立神リハビリテーション温泉病院からも参加させていただきたいです！',
        timestamp: new Date('2025-06-13T16:00:00'),
        likes: 2,
        isAnonymous: false
      }
    ]
  }
];

// Helper functions
export const getFreevoicePostById = (id: string): FreevoicePost | undefined => {
  return freevoicePosts.find(post => post.id === id);
};

export const getFreevoicePostsByDepartment = (department: string): FreevoicePost[] => {
  return freevoicePosts.filter(post => post.department === department);
};

export const getFreevoicePostsByFacility = (facilityId: string): FreevoicePost[] => {
  return freevoicePosts.filter(post => post.facility_id === facilityId);
};

export const getFreevoicePostsByUser = (userId: string): FreevoicePost[] => {
  return freevoicePosts.filter(post => post.author.id === userId && !post.isAnonymous);
};

// 新しいフィルター対応のヘルパー関数
export const getFreevoicePostsByFilter = (filter: 'voting' | 'facility' | 'all', userFacilityId: string = 'tategami_hospital'): FreevoicePost[] => {
  switch (filter) {
    case 'voting':
      return freevoicePosts.filter(post => 
        post.filterCategory === 'voting' || 
        post.hasVoting === true ||
        (post.votingDeadline && post.votingDeadline > new Date())
      );
    case 'facility':
      return freevoicePosts.filter(post => 
        post.filterCategory === 'facility' && 
        post.facility_id === userFacilityId
      );
    case 'all':
      return freevoicePosts.filter(post => 
        post.filterCategory === 'all' || 
        post.facility_id !== userFacilityId ||
        post.filterCategory === undefined // 既存投稿の後方互換性
      );
    default:
      return freevoicePosts;
  }
};