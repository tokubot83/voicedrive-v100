import React, { useState } from 'react';
import FreespacePost from '../components/FreespacePost';
import { demoPolls, demoVotes } from '../data/demo/freespacePolls';
import { demoUsers } from '../data/demo/users';
import { Post } from '../types';

const FreespacePollDemoPage = () => {
  const [votes, setVotes] = useState(demoVotes);
  const [polls, setPolls] = useState(demoPolls);

  // デモ用投稿データ
  const demoPosts: Post[] = [
    {
      id: 'post-poll-1',
      type: 'community',
      content: '',
      author: demoUsers[5],
      anonymityLevel: 'department_only',
      timestamp: new Date('2025-01-15T10:00:00'),
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
      id: 'post-poll-2',
      type: 'community',
      content: '',
      author: demoUsers[6],
      anonymityLevel: 'real_name',
      timestamp: new Date('2025-01-12T14:30:00'),
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
      id: 'post-poll-3',
      type: 'community',
      content: '',
      author: demoUsers[2],
      anonymityLevel: 'real_name',
      timestamp: new Date('2025-01-16T12:00:00'),
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

  const handleVote = (pollId: string, optionId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    // 新しい投票を追加
    const newVote = {
      id: `vote-${Date.now()}`,
      pollId,
      optionId,
      userId: 'current-user',
      timestamp: new Date(),
      isAnonymous: false
    };

    setVotes([...votes, newVote]);

    // 投票数を更新
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          options: p.options.map(opt => 
            opt.id === optionId 
              ? { ...opt, votes: opt.votes + 1 }
              : opt
          )
        };
      }
      return p;
    }));
  };

  const getUserVote = (pollId: string) => {
    return votes.find(v => v.pollId === pollId && v.userId === 'current-user');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            フリースペース投票機能デモ
          </h1>
          <p className="text-gray-600">
            投票機能付きのフリースペース投稿をお試しください
          </p>
        </div>

        <div className="space-y-6">
          {demoPosts.map((post, index) => (
            <FreespacePost
              key={post.id}
              post={post}
              poll={polls[index]}
              userVote={getUserVote(polls[index]?.id)}
              onVote={(optionId) => handleVote(polls[index].id, optionId)}
              onComment={() => console.log('Comment clicked')}
            />
          ))}
        </div>

        {/* 機能説明 */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            フリースペース投票機能の特徴
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">2〜4つの選択肢</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">リアルタイム集計</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">視覚的な結果表示</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">30分〜7日間の期間設定</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">カテゴリ別最適化</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                <span className="text-gray-700">コメント機能</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreespacePollDemoPage;