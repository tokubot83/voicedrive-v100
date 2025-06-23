import React, { useState } from 'react';
import { MessageCircle, Clock, Users, Vote } from 'lucide-react';
import { Poll, PollOption, PollVote } from '../types/poll';
import { Post, Comment } from '../types';
import ThreadedCommentSystem from './comments/ThreadedCommentSystem';
import Avatar from './common/Avatar';
import { generateAvatarByAnonymity, getDisplayName } from '../utils/avatarGenerator';
import { useDemoMode } from './demo/DemoModeController';
import { safeTotalValues } from '../utils/safeObjectHelpers';

interface FreespacePostProps {
  post: Post;
  poll?: Poll;
  userVote?: PollVote;
  onVote?: (optionId: string) => void;
  onComment?: (postId: string, comment: Partial<Comment>) => void;
}

const FreespacePost = ({ post, poll, userVote, onVote, onComment }: FreespacePostProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVote?.optionId || null);
  const [showComments, setShowComments] = useState(false);
  const hasVoted = !!userVote;
  const { currentUser } = useDemoMode();

  // Generate avatar based on anonymity level
  const avatarData = generateAvatarByAnonymity(
    post.anonymityLevel || 'real_name',
    post.author,
    post.id
  );
  
  const displayName = getDisplayName(
    post.anonymityLevel || 'real_name',
    post.author
  );

  const handleVote = (optionId: string) => {
    if (hasVoted || !poll?.isActive) return;
    setSelectedOption(optionId);
    onVote?.(optionId);
  };


  const getPercentage = (votes: number) => {
    if (!poll || poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  // 投票データの安全な初期化
  const safeVotes = post.votes || {
    'strongly-oppose': 0,
    'oppose': 0,
    'neutral': 0,
    'support': 0,
    'strongly-support': 0
  };

  const getTimeLeft = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return '終了';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}日 ${hours}時間`;
    if (hours > 0) return `${hours}時間 ${minutes}分`;
    return `${minutes}分`;
  };

  const categoryInfo = {
    idea_sharing: { label: '💡 アイデア共有', color: 'from-yellow-500 to-orange-500' },
    casual_discussion: { label: '💬 雑談', color: 'from-blue-500 to-blue-600' },
    event_planning: { label: '🎉 イベント企画', color: 'from-purple-500 to-pink-500' }
  };

  const category = poll?.category || 'casual_discussion';

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors mb-4">
      {/* ヘッダー */}
      <div className="flex items-center p-4 pb-3">
        <Avatar 
          avatarData={avatarData}
          size="md"
          className="shadow-md"
        />
        <div className="ml-3 flex-1">
          <div className="font-bold text-gray-900">
            {displayName}
          </div>
          <div className="text-gray-500 text-sm">
            {new Date(post.timestamp).toLocaleString('ja-JP', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <div className="ml-auto">
          <div className={`
            px-3 py-1.5 rounded-lg text-xs font-medium text-white
            bg-gradient-to-r from-blue-500 to-cyan-500
            shadow-sm border border-white/10
            flex items-center gap-1.5
          `}>
            <span className="text-sm">💬</span>
            <span>フリーボイス</span>
          </div>
        </div>
      </div>

      {/* 投稿内容 */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 leading-relaxed">{post.content}</p>
      </div>

      {/* 投票セクション */}
      {poll && (
        <div className="px-4 pb-4">
          {poll.question && (
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{poll.question}</h3>
              {poll.description && (
                <p className="text-gray-600 text-sm">{poll.description}</p>
              )}
            </div>
          )}

          {/* 投票オプション */}
          <div className="space-y-3 mb-4">
            {poll.options.map((option) => {
              const percentage = getPercentage(option.votes);
              const isSelected = selectedOption === option.id;
              const showResults = hasVoted || poll.showResults === 'always' || !poll.isActive;
              
              return (
                <div 
                  key={option.id}
                  className={`relative cursor-pointer rounded-lg border transition-all duration-200 ${
                    !poll.isActive || hasVoted
                      ? 'border-gray-300 cursor-default' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  } ${isSelected && hasVoted ? 'ring-2 ring-blue-400 border-blue-400' : ''}`}
                  onClick={() => handleVote(option.id)}
                >
                  {/* 背景バー（結果表示時のみ） */}
                  {showResults && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-lg transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  
                  <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {option.emoji && <span className="text-lg">{option.emoji}</span>}
                      <span className="font-medium text-gray-900">{option.text}</span>
                    </div>
                    {showResults && (
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 font-bold">{percentage}%</span>
                        <span className="text-gray-500 text-sm">({option.votes}票)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 投票情報 */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{poll.totalVotes}票</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{getTimeLeft(poll.deadline)}で終了</span>
              </div>
            </div>
            {hasVoted && (
              <div className="text-green-600 font-medium text-sm">
                投票完了 ✓
              </div>
            )}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex space-x-6">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
        {poll && (
          <button 
            onClick={() => {}}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Vote className="w-5 h-5" />
            <span className="text-sm">投票</span>
          </button>
        )}
      </div>

      {/* コメントシステム */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
          <ThreadedCommentSystem
            post={post}
            comments={post.comments || []}
            currentUser={currentUser}
            onComment={onComment || (() => {})}
          />
        </div>
      )}

    </div>
  );
};

export default FreespacePost;