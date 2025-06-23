import React from 'react';
import { Post } from '../types';
import FreespacePost from './FreespacePost';
import EventPost from './EventPost';
import RegularPost from './Post';
import { Poll, PollVote } from '../types/poll';
import { Event } from '../types/event';

interface FreespacePostRendererProps {
  post: Post;
  currentUserId?: string;
  onVote?: (postId: string, option: string) => void;
  onComment?: (postId: string, comment: any) => void;
  onJoinEvent?: (eventId: string, note?: string) => void;
  onLeaveEvent?: (eventId: string) => void;
  onVoteDate?: (eventId: string, proposedDateId: string, response: any) => void;
  onPollVote?: (pollId: string, optionId: string) => void;
}

const FreespacePostRenderer = ({
  post,
  currentUserId = 'current-user',
  onVote,
  onComment,
  onJoinEvent,
  onLeaveEvent,
  onVoteDate,
  onPollVote
}: FreespacePostRendererProps) => {
  
  // フリースペース投稿でない場合は通常のPost表示
  if (post.type !== 'community') {
    return (
      <RegularPost
        post={post}
        currentUser={{ id: currentUserId || '', name: '', department: '', role: '' }}
        onVote={onVote}
        onComment={onComment}
      />
    );
  }

  // イベント企画機能付き投稿
  if (post.event) {
    return (
      <EventPost
        post={post}
        event={post.event}
        currentUserId={currentUserId}
        onJoinEvent={onJoinEvent}
        onLeaveEvent={onLeaveEvent}
        onVoteDate={onVoteDate}
        onComment={() => onComment?.(post.id, {} as any)}
      />
    );
  }

  // 投票機能付き投稿
  if (post.poll) {
    // ダミーの投票履歴（実際の実装では状態管理から取得）
    const userVote: PollVote | undefined = undefined;
    
    return (
      <FreespacePost
        post={post}
        poll={post.poll}
        userVote={userVote}
        onVote={(optionId) => onPollVote?.(post.poll.id, optionId)}
        onComment={onComment}
      />
    );
  }

  // 通常のフリースペース投稿（投票・イベント機能なし）
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors p-4">
      {/* ヘッダー */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {post.author.department?.slice(0, 2) || '部署'}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <div className="font-medium text-gray-900">
            {post.anonymityLevel === 'real_name' ? post.author.name : `${post.author.department} 職員`}
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
        {post.freespaceCategory && (
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r from-blue-500 to-blue-600">
              {post.freespaceCategory === 'idea_sharing' && '💡 アイデア共有'}
              {post.freespaceCategory === 'casual_discussion' && '💬 雑談'}
              {post.freespaceCategory === 'event_planning' && '🎉 イベント企画'}
            </span>
          </div>
        )}
      </div>

      {/* 投稿内容 */}
      <div className="mb-4">
        <p className="text-gray-900 leading-relaxed">{post.content}</p>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center space-x-6 pt-3 border-t border-gray-200">
        <button 
          onClick={() => console.log('Comment button clicked for post:', post.id)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default FreespacePostRenderer;