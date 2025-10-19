import React, { useState } from 'react';
import EventPost from '../components/EventPost';
import { demoEvents } from '../data/demo/events';
import { demoUsers } from '../data/demo/users';
import { Post } from '../types';
import { DateResponse, ParticipantStatus } from '../types/event';

const EventDemoPage = () => {
  const [events, setEvents] = useState(demoEvents);
  const currentUserId = 'current-user';

  // デモ用投稿データ
  const demoPosts: Post[] = [
    {
      id: 'post-event-1',
      type: 'community',
      content: '',
      author: demoUsers[5],
      anonymityLevel: 'real_name',
      timestamp: new Date('2025-01-15T09:00:00'),
      votes: {
        'strongly-oppose': 0,
        'oppose': 0,
        'neutral': 0,
        'support': 0,
        'strongly-support': 0,
      },
      comments: []
    },
    {
      id: 'post-event-2',
      type: 'community',
      content: '',
      author: demoUsers[2],
      anonymityLevel: 'real_name',
      timestamp: new Date('2025-01-08T11:00:00'),
      votes: {
        'strongly-oppose': 0,
        'oppose': 0,
        'neutral': 0,
        'support': 0,
        'strongly-support': 0,
      },
      comments: []
    },
    {
      id: 'post-event-3',
      type: 'community',
      content: '',
      author: demoUsers[0],
      anonymityLevel: 'real_name',
      timestamp: new Date('2025-01-05T17:20:00'),
      votes: {
        'strongly-oppose': 0,
        'oppose': 0,
        'neutral': 0,
        'support': 0,
        'strongly-support': 0,
      },
      comments: []
    }
  ];

  const handleJoinEvent = (eventId: string, note?: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const isFull = event.maxParticipants ? event.participants.length >= event.maxParticipants : false;
        const newParticipant = {
          id: `participant-${Date.now()}`,
          user: { id: currentUserId, name: '現在のユーザー', department: 'デモ部署', position: '職員', role: '一般職員' },
          status: isFull ? ParticipantStatus.WAITLISTED : ParticipantStatus.CONFIRMED,
          joinedAt: new Date(),
          note
        };

        if (isFull) {
          return { ...event, waitlist: [...event.waitlist, newParticipant] };
        } else {
          return { ...event, participants: [...event.participants, newParticipant] };
        }
      }
      return event;
    }));
  };

  const handleLeaveEvent = (eventId: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          participants: event.participants.filter(p => p.user.id !== currentUserId),
          waitlist: event.waitlist.filter(p => p.user.id !== currentUserId)
        };
      }
      return event;
    }));
  };

  const handleVoteDate = (eventId: string, proposedDateId: string, response: DateResponse) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          proposedDates: event.proposedDates.map(date => {
            if (date.id === proposedDateId) {
              // 既存の投票を削除
              const filteredVotes = date.votes.filter(v => v.userId !== currentUserId);
              // 新しい投票を追加
              const newVote = {
                id: `vote-${Date.now()}`,
                proposedDateId,
                userId: currentUserId,
                response,
                timestamp: new Date()
              };
              return {
                ...date,
                votes: [...filteredVotes, newVote],
                totalVotes: filteredVotes.length + 1
              };
            }
            return date;
          })
        };
      }
      return event;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            イベント企画機能デモ
          </h1>
          <p className="text-gray-600">
            日程調整・参加者募集・リマインダー機能をお試しください
          </p>
        </div>

        <div className="space-y-6">
          {demoPosts.map((post, index) => (
            <EventPost
              key={post.id}
              post={post}
              event={events[index]}
              currentUserId={currentUserId}
              onJoinEvent={handleJoinEvent}
              onLeaveEvent={handleLeaveEvent}
              onVoteDate={handleVoteDate}
              onComment={() => console.log('Comment clicked')}
            />
          ))}
        </div>

        {/* 機能説明 */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            💫 イベント企画機能の特徴
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">日程調整（◯△×投票）</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">参加者募集・管理</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">定員・キャンセル待ち</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">会場・費用情報</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">参加条件・注意事項</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">リマインダー通知</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">イベントタイプ別管理</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">タグ・検索機能</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">✨ 期待効果</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🤝</div>
                <div className="font-medium text-gray-900">リアルな交流促進</div>
                <div className="text-sm text-gray-600">対面でのコミュニケーション機会創出</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💡</div>
                <div className="font-medium text-gray-900">企画力の発揮</div>
                <div className="text-sm text-gray-600">職員の企画・運営スキル向上</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-medium text-gray-900">コミュニティ形成</div>
                <div className="text-sm text-gray-600">部署を超えた関係性構築</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDemoPage;