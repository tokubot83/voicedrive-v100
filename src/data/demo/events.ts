import { Event, EventType, EventStatus, EventVisibility, ParticipantStatus, DateResponse } from '../../types/event';
import { demoUsers } from './users';

// デモ用イベントデータ
export const demoEvents: Event[] = [
  {
    id: 'event-1',
    title: '新年度歓迎会',
    description: '新入社員の皆さんと既存メンバーの親睦を深める歓迎会を開催します！カジュアルな雰囲気で、部署を超えた交流の場にしたいと思います。',
    type: EventType.SOCIAL,
    
    proposedDates: [
      {
        id: 'date-1-1',
        date: new Date('2025-04-26T00:00:00'),
        startTime: '19:00',
        endTime: '21:00',
        votes: [
          { id: 'vote-1-1', proposedDateId: 'date-1-1', userId: 'user-1', response: DateResponse.AVAILABLE, timestamp: new Date() },
          { id: 'vote-1-2', proposedDateId: 'date-1-1', userId: 'user-2', response: DateResponse.AVAILABLE, timestamp: new Date() },
          { id: 'vote-1-3', proposedDateId: 'date-1-1', userId: 'user-3', response: DateResponse.MAYBE, timestamp: new Date() },
        ],
        totalVotes: 15
      },
      {
        id: 'date-1-2',
        date: new Date('2025-04-28T00:00:00'),
        startTime: '18:30',
        endTime: '20:30',
        votes: [
          { id: 'vote-1-4', proposedDateId: 'date-1-2', userId: 'user-1', response: DateResponse.UNAVAILABLE, timestamp: new Date() },
          { id: 'vote-1-5', proposedDateId: 'date-1-2', userId: 'user-2', response: DateResponse.AVAILABLE, timestamp: new Date() },
        ],
        totalVotes: 12
      }
    ],
    
    organizer: demoUsers[5], // 人事部職員
    maxParticipants: 30,
    participants: [
      {
        id: 'participant-1',
        user: demoUsers[1],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-15T10:00:00'),
        note: '楽しみにしています！'
      },
      {
        id: 'participant-2',
        user: demoUsers[2],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-15T11:30:00')
      },
      {
        id: 'participant-3',
        user: demoUsers[3],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-15T14:20:00'),
        note: '新人さんとお話しできるのを楽しみにしています'
      }
    ],
    waitlist: [],
    
    venue: {
      name: '居酒屋「さくら」',
      address: '〇〇市××町1-2-3',
      capacity: 40,
      amenities: ['飲み放題', '座敷席あり', '駅近']
    },
    cost: 4000,
    requirements: ['社員証持参', '当日キャンセル不可'],
    
    status: EventStatus.DATE_VOTING,
    visibility: EventVisibility.FACILITY,
    
    allowDateVoting: true,
    allowParticipantComments: true,
    sendReminders: true,
    
    createdAt: new Date('2025-01-15T09:00:00'),
    updatedAt: new Date('2025-01-16T15:30:00'),
    tags: ['新人歓迎', '懇親会', '部署交流'],
    
    registrationDeadline: new Date('2025-04-20T23:59:59')
  },
  
  {
    id: 'event-2',
    title: 'AI活用セミナー',
    description: 'ChatGPTやCopilotなど、業務で使えるAIツールの実践的な使い方を学ぶセミナーです。初心者向けのハンズオン形式で進めます。',
    type: EventType.TRAINING,
    
    proposedDates: [],
    finalDate: {
      date: new Date('2025-01-24T00:00:00'),
      startTime: '16:00',
      endTime: '17:30',
      timezone: 'Asia/Tokyo'
    },
    
    organizer: demoUsers[2], // 先輩社員
    maxParticipants: 20,
    participants: [
      {
        id: 'participant-4',
        user: demoUsers[1],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-08T12:00:00')
      },
      {
        id: 'participant-5',
        user: demoUsers[4],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-08T14:15:00'),
        note: 'ノートPC持参します'
      }
    ],
    waitlist: [],
    
    venue: {
      name: '会議室A',
      capacity: 25,
      amenities: ['プロジェクター', 'Wi-Fi', 'ホワイトボード']
    },
    cost: 0,
    requirements: ['ノートPC持参', 'Googleアカウント必要'],
    
    status: EventStatus.RECRUITING,
    visibility: EventVisibility.ORGANIZATION,
    
    allowDateVoting: false,
    allowParticipantComments: true,
    sendReminders: true,
    
    createdAt: new Date('2025-01-08T11:00:00'),
    updatedAt: new Date('2025-01-08T11:00:00'),
    tags: ['AI', '勉強会', 'スキルアップ'],
    
    registrationDeadline: new Date('2025-01-22T17:00:00')
  },
  
  {
    id: 'event-3',
    title: '社内バスケットボール大会',
    description: '春の社内運動会の一環として、バスケットボール大会を開催します！チーム編成は当日行います。運動しやすい服装でお越しください。',
    type: EventType.SPORTS,
    
    proposedDates: [
      {
        id: 'date-3-1',
        date: new Date('2025-03-15T00:00:00'),
        startTime: '14:00',
        endTime: '17:00',
        votes: [],
        totalVotes: 0
      },
      {
        id: 'date-3-2',
        date: new Date('2025-03-22T00:00:00'),
        startTime: '14:00',
        endTime: '17:00',
        votes: [],
        totalVotes: 0
      }
    ],
    
    organizer: demoUsers[0], // 田中太郎
    participants: [
      {
        id: 'participant-6',
        user: demoUsers[2],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-05T17:30:00'),
        note: '初心者ですが参加します！'
      }
    ],
    waitlist: [],
    
    venue: {
      name: '近隣体育館',
      address: '〇〇市体育館',
      capacity: 50,
      amenities: ['更衣室', 'シャワー', '駐車場']
    },
    cost: 500,
    requirements: ['運動できる服装', '室内シューズ', '飲み物持参'],
    
    status: EventStatus.PLANNING,
    visibility: EventVisibility.ORGANIZATION,
    
    allowDateVoting: true,
    allowParticipantComments: true,
    sendReminders: true,
    
    createdAt: new Date('2025-01-05T17:20:00'),
    updatedAt: new Date('2025-01-05T17:20:00'),
    tags: ['スポーツ', 'バスケ', '運動会', '健康'],
    
    registrationDeadline: new Date('2025-03-01T23:59:59')
  }
];

// デモ用リマインダーデータ
export const demoReminders = [
  {
    id: 'reminder-1',
    eventId: 'event-1',
    type: 'registration_deadline' as const,
    scheduledFor: new Date('2025-04-19T09:00:00'),
    recipients: ['user-1', 'user-2', 'user-3', 'user-4'],
    sent: false
  },
  {
    id: 'reminder-2',
    eventId: 'event-2',
    type: 'one_day_before' as const,
    scheduledFor: new Date('2025-01-23T18:00:00'),
    recipients: ['user-1', 'user-4'],
    sent: false
  }
];