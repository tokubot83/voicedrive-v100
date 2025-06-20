import { Post, CommentType, CommentPrivacyLevel, AnonymityLevel, Comment, Poll, Event } from '../../types';
import { EventType, EventStatus, EventVisibility, ParticipantStatus } from '../../types/event';
import { demoUsers } from './users';

// 医療介護系法人向けフリーボイス投稿のデモデータ
export const freevoiceDemoPosts: Post[] = [
  // 🗳️ 投票投稿1: 進行中の投票（高い参加率、接戦）
  {
    id: 'freevoice-poll-1',
    type: 'community',
    category: 'casual_discussion',
    title: '🏥 夜勤時の休憩時間の改善について',
    content: `夜勤従事者の皆さんにお聞きします。現在の夜勤時の休憩時間について改善案を検討中です。

**現状の課題**
・16時間夜勤での休憩が2時間のみ
・休憩室が狭く、十分にリフレッシュできない
・仮眠時間の確保が困難

**検討中の改善案**
どの案が最も効果的だと思いますか？皆さんの実体験に基づくご意見をお聞かせください。`,
    author: demoUsers[5], // 人事部職員
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-15T14:00:00'),
    createdDate: new Date('2025-01-15T14:00:00'),
    visibility: 'organization',
    votingDeadline: new Date('2025-01-22T23:59:59'), // 1週間後
    tags: ['夜勤', '勤務改善', '投票進行中'],
    poll: {
      id: 'poll-night-1',
      question: '夜勤時の休憩時間の改善について',
      description: '現在の夜勤時の休憩時間について改善案を検討中です。どの案が最も効果的だと思いますか？',
      options: [
        { id: 'night-opt-1', text: '休憩時間を3時間に延長', emoji: '⏰', votes: 34 },
        { id: 'night-opt-2', text: '休憩室を拡張・個室化', emoji: '🛏️', votes: 32 },
        { id: 'night-opt-3', text: '仮眠専用時間を1時間確保', emoji: '😴', votes: 29 },
        { id: 'night-opt-4', text: '夜勤手当の増額', emoji: '💰', votes: 20 },
        { id: 'night-opt-5', text: '夜勤回数の上限設定', emoji: '📅', votes: 12 }
      ],
      totalVotes: 127,
      deadline: new Date('2025-01-22T23:59:59'),
      isActive: true,
      allowMultiple: false,
      showResults: 'afterVote' as const,
      category: 'casual_discussion' as const,
      scope: 'organization' as const,
      createdAt: new Date('2025-01-15T14:00:00'),
      createdBy: demoUsers[5]
    },
    pollResult: {
      totalVotes: 127,
      participationRate: 73.4,
      results: [
        { option: { id: 'night-opt-1', text: '休憩時間を3時間に延長', emoji: '⏰', votes: 34 }, votes: 34, percentage: 26.8 },
        { option: { id: 'night-opt-2', text: '休憩室を拡張・個室化', emoji: '🛏️', votes: 32 }, votes: 32, percentage: 25.2 },
        { option: { id: 'night-opt-3', text: '仮眠専用時間を1時間確保', emoji: '😴', votes: 29 }, votes: 29, percentage: 22.8 },
        { option: { id: 'night-opt-4', text: '夜勤手当の増額', emoji: '💰', votes: 20 }, votes: 20, percentage: 15.7 },
        { option: { id: 'night-opt-5', text: '夜勤回数の上限設定', emoji: '📅', votes: 12 }, votes: 12, percentage: 9.4 }
      ]
    },
    comments: [
      {
        id: 'comment-night-1',
        postId: 'freevoice-poll-1',
        content: '休憩時間の延長は確実に必要です。16時間は本当にきつくて、患者さんの安全にも関わってきます。',
        author: demoUsers[1],
        commentType: 'support' as CommentType,
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-16T08:30:00'),
        likes: 8,
        hasLiked: false,
        visibleInfo: {
          facility: '第一病棟',
          position: '看護師',
          experienceYears: 3,
          isManagement: false
        }
      }
    ]
  },

  // 🗳️ 投票投稿2: 参加率が低い投票（投票促進が必要）
  {
    id: 'freevoice-poll-2',
    type: 'community',
    category: 'idea_sharing',
    title: '🍽️ 職員食堂のメニュー改善アンケート',
    content: `栄養科より職員食堂のメニュー改善についてお伺いします。

**現在検討中の新メニュー**
健康的で美味しい食事を提供するため、新しいメニューの導入を検討しています。どのようなメニューがあると嬉しいですか？

**導入予定時期**: 4月〜
**予算**: 1食あたり50円の価格調整可能`,
    author: demoUsers[7], // 栄養士
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-18T10:00:00'),
    createdDate: new Date('2025-01-18T10:00:00'),
    visibility: 'facility',
    votingDeadline: new Date('2025-01-25T23:59:59'),
    tags: ['職員食堂', 'メニュー改善', '投票参加率低'],
    poll: {
      id: 'poll-menu-1',
      question: '職員食堂のメニュー改善アンケート',
      description: '健康的で美味しい食事を提供するため、新しいメニューの導入を検討しています。',
      options: [
        { id: 'menu-opt-1', text: 'ヘルシーサラダバー', emoji: '🥗', votes: 8 },
        { id: 'menu-opt-2', text: '低糖質メニュー', emoji: '🍚', votes: 6 },
        { id: 'menu-opt-3', text: '夜勤者向け軽食', emoji: '🥪', votes: 5 },
        { id: 'menu-opt-4', text: '季節の郷土料理', emoji: '🍲', votes: 4 }
      ],
      totalVotes: 23,
      deadline: new Date('2025-01-25T23:59:59'),
      isActive: true,
      allowMultiple: false,
      showResults: 'afterVote' as const,
      category: 'idea_sharing' as const,
      scope: 'facility' as const,
      createdAt: new Date('2025-01-18T10:00:00'),
      createdBy: demoUsers[7]
    },
    pollResult: {
      totalVotes: 23,
      participationRate: 28.4,
      results: [
        { option: { id: 'menu-opt-1', text: 'ヘルシーサラダバー', emoji: '🥗', votes: 8 }, votes: 8, percentage: 34.8 },
        { option: { id: 'menu-opt-2', text: '低糖質メニュー', emoji: '🍚', votes: 6 }, votes: 6, percentage: 26.1 },
        { option: { id: 'menu-opt-3', text: '夜勤者向け軽食', emoji: '🥪', votes: 5 }, votes: 5, percentage: 21.7 },
        { option: { id: 'menu-opt-4', text: '季節の郷土料理', emoji: '🍲', votes: 4 }, votes: 4, percentage: 17.4 }
      ]
    },
    comments: []
  },

  // 🎉 イベント投稿1: 人気イベント（満席間近）
  {
    id: 'freevoice-event-1',
    type: 'community',
    category: 'casual_discussion',
    title: '🌸 第3回 院内お花見会開催のお知らせ',
    content: `毎年恒例の院内お花見会を今年も開催いたします！

**開催概要**
・日時: 4月5日（土）12:00-15:00
・場所: 病院中庭 桜広場
・参加費: 500円（飲み物・軽食付き）
・雨天時: 1階ホールにて室内開催

**企画内容**
🌸 桜の下でのランチ会
🎵 職員による音楽演奏
🎮 ビンゴ大会（豪華景品あり！）
📸 プロカメラマンによる記念撮影

毎年大好評のイベントです。部署を超えた交流の場として、ぜひご参加ください！`,
    author: demoUsers[4], // イベント企画担当
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-20T09:00:00'),
    createdDate: new Date('2025-01-20T09:00:00'),
    visibility: 'organization',
    tags: ['お花見', 'イベント開催', '申込受付中'],
    event: {
      id: 'event-hanami-1',
      title: '第3回 院内お花見会',
      description: '毎年恒例の院内お花見会を今年も開催いたします！',
      type: EventType.SOCIAL,
      proposedDates: [{
        id: 'date-hanami-1',
        date: new Date('2025-04-05T12:00:00'),
        startTime: '12:00',
        endTime: '15:00',
        votes: [],
        totalVotes: 0
      }],
      finalDate: {
        date: new Date('2025-04-05T12:00:00'),
        startTime: '12:00',
        endTime: '15:00',
        timezone: 'Asia/Tokyo'
      },
      registrationDeadline: new Date('2025-03-28T23:59:59'),
      organizer: demoUsers[4],
      maxParticipants: 80,
      participants: Array(74).fill(null).map((_, i) => ({
        id: `participant-${i}`,
        user: demoUsers[0],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-20T09:00:00')
      })),
      waitlist: [],
      venue: {
        name: '病院中庭 桜広場',
        capacity: 80
      },
      cost: 500,
      status: EventStatus.RECRUITING,
      visibility: EventVisibility.ORGANIZATION,
      allowDateVoting: false,
      allowParticipantComments: true,
      sendReminders: true,
      createdAt: new Date('2025-01-20T09:00:00'),
      updatedAt: new Date('2025-01-20T09:00:00'),
      tags: ['お花見', 'イベント開催', '申込受付中']
    },
    comments: [
      {
        id: 'comment-hanami-1',
        postId: 'freevoice-event-1',
        content: '毎年楽しみにしています！今年は桜の開花が早そうなので、当日晴れることを祈ってます🌸',
        author: demoUsers[2],
        commentType: 'support' as CommentType,
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-20T15:30:00'),
        likes: 12,
        hasLiked: true,
        visibleInfo: {
          facility: '外来',
          position: '事務職',
          experienceYears: 2,
          isManagement: false
        }
      }
    ]
  },

  // 🎉 イベント投稿2: 申込開始したばかり
  {
    id: 'freevoice-event-2',
    type: 'community',
    category: 'idea_sharing',
    title: '📚 第1回 院内勉強会「感染対策の最新動向」',
    content: `感染対策委員会主催の勉強会を開催いたします。

**テーマ**: 「感染対策の最新動向と実践のポイント」
**講師**: 感染症専門医 田中先生（県立大学病院）
**対象**: 全職種（医師、看護師、薬剤師、技師、事務職等）

**開催詳細**
・日時: 2月15日（土）14:00-16:00
・場所: 大会議室A
・定員: 50名（先着順）
・参加費: 無料
・資料: 当日配布 + 後日共有フォルダにアップ

**学習内容**
✅ 最新の感染対策ガイドライン
✅ 実践的な手指衛生技術
✅ PPE（個人防護具）の正しい使用法
✅ 部署別感染対策のポイント

質疑応答の時間も十分に設けていますので、日頃の疑問をぜひお聞かせください。`,
    author: demoUsers[6], // 感染対策委員
    anonymityLevel: 'real',
    timestamp: new Date('2025-01-21T08:00:00'),
    createdDate: new Date('2025-01-21T08:00:00'),
    visibility: 'organization',
    tags: ['勉強会', '感染対策', '申込開始'],
    event: {
      id: 'event-study-1',
      title: '第1回 院内勉強会「感染対策の最新動向」',
      description: '感染対策委員会主催の勉強会を開催いたします。',
      type: EventType.TRAINING,
      proposedDates: [{
        id: 'date-study-1',
        date: new Date('2025-02-15T14:00:00'),
        startTime: '14:00',
        endTime: '16:00',
        votes: [],
        totalVotes: 0
      }],
      finalDate: {
        date: new Date('2025-02-15T14:00:00'),
        startTime: '14:00',
        endTime: '16:00',
        timezone: 'Asia/Tokyo'
      },
      registrationDeadline: new Date('2025-02-12T23:59:59'),
      organizer: demoUsers[6],
      maxParticipants: 50,
      participants: Array(7).fill(null).map((_, i) => ({
        id: `participant-study-${i}`,
        user: demoUsers[0],
        status: ParticipantStatus.CONFIRMED,
        joinedAt: new Date('2025-01-21T08:00:00')
      })),
      waitlist: [],
      venue: {
        name: '大会議室A',
        capacity: 50
      },
      cost: 0,
      status: EventStatus.RECRUITING,
      visibility: EventVisibility.ORGANIZATION,
      allowDateVoting: false,
      allowParticipantComments: true,
      sendReminders: true,
      createdAt: new Date('2025-01-21T08:00:00'),
      updatedAt: new Date('2025-01-21T08:00:00'),
      tags: ['勉強会', '感染対策', '申込開始']
    },
    comments: []
  },

  // 💭 雑談投稿1: 通常のコミュニティ投稿
  {
    id: 'freevoice-chat-1',
    type: 'community',
    category: 'casual_discussion',
    title: '☕ 最近のマイブーム、教えてください！',
    content: `寒い日が続きますが、皆さんいかがお過ごしですか？

最近私は在宅時間が増えたこともあり、コーヒーにハマっています。
豆から挽いて飲むようになったら、もう市販のインスタントには戻れません😅

仕事の合間のちょっとした楽しみや、最近始めたこと、ハマっていることがあれば、
ぜひ教えてください！

皆さんの息抜き方法を参考にさせていただきたいです✨`,
    author: demoUsers[3],
    anonymityLevel: 'partial',
    timestamp: new Date('2025-01-19T12:30:00'),
    createdDate: new Date('2025-01-19T12:30:00'),
    visibility: 'facility',
    tags: ['雑談', '趣味', 'リフレッシュ'],
    comments: [
      {
        id: 'comment-hobby-1',
        postId: 'freevoice-chat-1',
        content: '私も最近コーヒーにハマってます！豆の種類によって全然味が違うのが面白いですよね。おすすめの豆があったら教えてください😊',
        author: demoUsers[8],
        commentType: 'support' as CommentType,
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-19T13:45:00'),
        likes: 3,
        hasLiked: false,
        visibleInfo: {
          facility: 'リハビリ科',
          position: '理学療法士',
          experienceYears: 4,
          isManagement: false
        }
      },
      {
        id: 'comment-hobby-2',
        postId: 'freevoice-chat-1',
        content: '私は最近ヨガを始めました！夜勤後の疲労回復にとても良いです。YouTubeで無料でレッスンできるのが嬉しいポイントです🧘‍♀️',
        author: demoUsers[1],
        commentType: 'proposal' as CommentType,
        privacyLevel: 'anonymous' as CommentPrivacyLevel,
        anonymityLevel: 'anonymous' as AnonymityLevel,
        timestamp: new Date('2025-01-19T16:20:00'),
        likes: 7,
        hasLiked: true
      }
    ]
  },

  // 💭 雑談投稿2: 職場あるある
  {
    id: 'freevoice-chat-2',
    type: 'community',
    category: 'casual_discussion',
    title: '🏥 医療現場あるある、ありませんか？',
    content: `お疲れ様です！

日々の業務の中で「あー、これあるある！」と思うことってありませんか？
ちょっとした共感できるエピソードで、みんなで笑って息抜きしませんか？😄

私は最近、
「エレベーターに乗ろうとしたら、急患で呼ばれて結局階段で走る」
というのを3日連続でやってしまいました💦

皆さんの「あるある」もぜひ聞かせてください！`,
    author: demoUsers[2],
    anonymityLevel: 'department',
    timestamp: new Date('2025-01-17T20:15:00'),
    createdDate: new Date('2025-01-17T20:15:00'),
    visibility: 'facility',
    tags: ['雑談', 'あるある', '息抜き'],
    comments: [
      {
        id: 'comment-aruaru-1',
        postId: 'freevoice-chat-2',
        content: 'ポケットに入れたペンライトを探しながら、別のペンライトで照らしてるという😅 これ結構やってしまいます！',
        author: demoUsers[5],
        commentType: 'support' as CommentType,
        privacyLevel: 'partial' as CommentPrivacyLevel,
        anonymityLevel: 'department' as AnonymityLevel,
        timestamp: new Date('2025-01-17T21:30:00'),
        likes: 15,
        hasLiked: true,
        visibleInfo: {
          facility: 'ICU',
          position: '看護師',
          experienceYears: 6,
          isManagement: false
        }
      },
      {
        id: 'comment-aruaru-2',
        postId: 'freevoice-chat-2',
        content: '休憩時間に「ちょっと横になろう」と思ったら、気づいたら30分経ってて慌てて戻る...というのが私の定番です😴',
        author: demoUsers[7],
        commentType: 'support' as CommentType,
        privacyLevel: 'anonymous' as CommentPrivacyLevel,
        anonymityLevel: 'anonymous' as AnonymityLevel,
        timestamp: new Date('2025-01-18T07:45:00'),
        likes: 12,
        hasLiked: false
      }
    ]
  }
];