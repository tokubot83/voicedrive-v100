import { Poll, PollVote } from '../../types/poll';
import { demoUsers } from './users';

// デモ用投票データ
export const demoPolls: Poll[] = [
  // 期限切れの投票（結果投稿の対象）
  {
    id: 'poll-expired-1',
    question: '新人研修プログラムに追加したい内容は？',
    description: '来年度の新人研修プログラムを見直しています。現場で必要だと感じるスキルや知識について教えてください。',
    options: [
      { id: 'exp-opt-1', text: 'デジタル基礎スキル（Excel、PowerPoint等）', emoji: '💻', votes: 85 },
      { id: 'exp-opt-2', text: 'コミュニケーション研修', emoji: '💬', votes: 67 },
      { id: 'exp-opt-3', text: '業界特有の専門知識', emoji: '📚', votes: 102 },
      { id: 'exp-opt-4', text: 'チームワーク・協調性研修', emoji: '🤝', votes: 43 },
      { id: 'exp-opt-5', text: 'ビジネスマナー研修', emoji: '👔', votes: 28 }
    ],
    totalVotes: 325,
    deadline: new Date('2025-01-10T23:59:59'), // 期限切れ
    isActive: false,
    showResults: 'afterDeadline',
    category: 'idea_sharing',
    scope: 'organization',
    createdAt: new Date('2025-01-03T09:00:00'),
    createdBy: demoUsers[5], // 人事部職員
    postId: 'freespace-post-expired-1'
  },
  
  // 期限切れの投票その2（接戦の例）
  {
    id: 'poll-expired-2',
    question: '社内カフェの営業時間、どうしたい？',
    description: '社内カフェの営業時間について、皆さんの希望をお聞かせください。現在は9:00-17:00ですが、より利用しやすくするための改善案を検討中です。',
    options: [
      { id: 'cafe-opt-1', text: '現状維持（9:00-17:00）', emoji: '⏰', votes: 89 },
      { id: 'cafe-opt-2', text: '朝を早めに（8:00-17:00）', emoji: '🌅', votes: 94 },
      { id: 'cafe-opt-3', text: '夜を遅めに（9:00-19:00）', emoji: '🌆', votes: 87 },
      { id: 'cafe-opt-4', text: '朝夜両方延長（8:00-19:00）', emoji: '🕐', votes: 82 }
    ],
    totalVotes: 352,
    deadline: new Date('2025-01-08T23:59:59'), // 期限切れ
    isActive: false,
    showResults: 'afterDeadline',
    category: 'casual_discussion',
    scope: 'facility',
    createdAt: new Date('2025-01-01T10:00:00'),
    createdBy: demoUsers[7], // 事務職員
    postId: 'freespace-post-expired-2'
  },
  {
    id: 'poll-1',
    question: '今年の忘年会、どこでやりたい？',
    description: '年末も近づいてきましたね！皆さんの希望を聞かせてください 🎊',
    options: [
      { id: 'opt-1', text: 'ホテルの宴会場', emoji: '🏨', votes: 76 },
      { id: 'opt-2', text: '居酒屋', emoji: '🍻', votes: 32 },
      { id: 'opt-3', text: 'カジュアルレストラン', emoji: '🍕', votes: 19 }
    ],
    totalVotes: 127,
    deadline: new Date('2025-01-20T23:59:59'),
    isActive: true,
    showResults: 'afterVote',
    category: 'event_planning',
    scope: 'facility',
    createdAt: new Date('2025-01-15T10:00:00'),
    createdBy: demoUsers[5] // 人事部職員
  },
  {
    id: 'poll-2',
    question: '夏のクールビズ期間はいつからがいい？',
    description: '今年の夏も暑くなりそうです。働きやすい環境づくりのために、皆さんの意見をお聞かせください。',
    options: [
      { id: 'opt-4', text: '5月1日から', emoji: '🌸', votes: 45 },
      { id: 'opt-5', text: '6月1日から', emoji: '☀️', votes: 62 },
      { id: 'opt-6', text: '7月1日から', emoji: '🌻', votes: 23 },
      { id: 'opt-7', text: '気温に応じて柔軟に', emoji: '🌡️', votes: 38 }
    ],
    totalVotes: 168,
    deadline: new Date('2025-02-28T23:59:59'),
    isActive: true,
    showResults: 'afterVote',
    category: 'idea_sharing',
    scope: 'organization',
    createdAt: new Date('2025-01-12T14:30:00'),
    createdBy: demoUsers[6] // 管理職
  },
  {
    id: 'poll-3',
    question: 'お昼休みの時間、どう過ごしてる？',
    description: 'みんなのランチタイムの過ごし方を知りたいです！',
    options: [
      { id: 'opt-8', text: '外食', emoji: '🍽️', votes: 34 },
      { id: 'opt-9', text: 'お弁当', emoji: '🍱', votes: 89 },
      { id: 'opt-10', text: 'コンビニ', emoji: '🏪', votes: 45 }
    ],
    totalVotes: 168,
    deadline: new Date('2025-01-18T17:00:00'),
    isActive: true,
    showResults: 'always',
    category: 'casual_discussion',
    scope: 'department',
    createdAt: new Date('2025-01-16T12:00:00'),
    createdBy: demoUsers[2] // 一般職員
  }
];

// デモ用投票履歴
export const demoVotes: PollVote[] = [
  {
    id: 'vote-1',
    pollId: 'poll-1',
    optionId: 'opt-1',
    userId: 'user-1',
    timestamp: new Date('2025-01-16T09:30:00'),
    isAnonymous: false
  },
  {
    id: 'vote-2',
    pollId: 'poll-2',
    optionId: 'opt-5',
    userId: 'user-1',
    timestamp: new Date('2025-01-13T11:15:00'),
    isAnonymous: true
  },
  {
    id: 'vote-3',
    pollId: 'poll-3',
    optionId: 'opt-9',
    userId: 'user-1',
    timestamp: new Date('2025-01-16T12:30:00'),
    isAnonymous: false
  }
];