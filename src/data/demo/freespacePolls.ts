import { Poll, PollVote } from '../../types/poll';
import { demoUsers } from './users';

// デモ用投票データ
export const demoPolls: Poll[] = [
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