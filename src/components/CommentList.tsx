import React from 'react';
import { Comment, CommentPrivacyLevel, User } from '../types';

interface CommentListProps {
  comments: Comment[];
  currentUser: User;
}

interface CommentItemProps {
  comment: Comment;
  currentUser: User;
}

function CommentItem({ comment, currentUser }: CommentItemProps) {
  const formatDisplayName = (comment: Comment): { name: string; subtitle?: string } => {
    const { privacyLevel, author, visibleInfo } = comment;

    switch (privacyLevel) {
      case 'anonymous':
        return { name: '匿名' };
      
      case 'partial':
        if (visibleInfo) {
          return {
            name: `${visibleInfo.facility || '不明'} ${visibleInfo.position || '職員'}`,
            subtitle: `経験${visibleInfo.experienceYears || 0}年`
          };
        }
        return { name: '職員' };
      
      case 'selective':
        if (visibleInfo?.isManagement) {
          return {
            name: author.name,
            subtitle: `${visibleInfo.facility} ${visibleInfo.position} (経験${visibleInfo.experienceYears}年)`
          };
        } else if (visibleInfo) {
          return {
            name: `${visibleInfo.facility} ${visibleInfo.position}`,
            subtitle: `経験${visibleInfo.experienceYears}年`
          };
        }
        return { name: '職員' };
      
      case 'full':
        return {
          name: author.name,
          subtitle: visibleInfo ? 
            `${visibleInfo.facility} ${visibleInfo.position} (経験${visibleInfo.experienceYears}年)` :
            `${author.department} ${author.role}`
        };
      
      default:
        return { name: '不明' };
    }
  };

  const getPrivacyBadge = (privacy: CommentPrivacyLevel) => {
    const badges = {
      anonymous: { label: '匿名', color: 'bg-gray-100 text-gray-700' },
      partial: { label: '部分', color: 'bg-blue-100 text-blue-700' },
      selective: { label: '段階', color: 'bg-purple-100 text-purple-700' },
      full: { label: '実名', color: 'bg-green-100 text-green-700' }
    };
    return badges[privacy];
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayInfo = formatDisplayName(comment);
  const privacyBadge = getPrivacyBadge(comment.privacyLevel);
  const isOwnComment = comment.author.id === currentUser.id;

  return (
    <div className={`p-4 border-l-4 ${isOwnComment ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} rounded-r-lg`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {displayInfo.name}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${privacyBadge.color}`}>
              {privacyBadge.label}
            </span>
            {isOwnComment && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                自分
              </span>
            )}
          </div>
        </div>
        <time className="text-xs text-gray-500">
          {formatTimestamp(comment.timestamp)}
        </time>
      </div>
      
      {displayInfo.subtitle && (
        <div className="text-xs text-gray-600 mb-2">
          {displayInfo.subtitle}
        </div>
      )}
      
      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </div>
    </div>
  );
}

export default function CommentList({ comments, currentUser }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-sm">
          まだコメントはありません
        </div>
        <div className="text-xs mt-1">
          最初のコメントを投稿してみましょう
        </div>
      </div>
    );
  }

  // コメントを新しい順にソート
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">
          コメント ({comments.length})
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-100 rounded-full"></div>
            <span>部分匿名</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-100 rounded-full"></div>
            <span>実名</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-100 rounded-full"></div>
            <span>匿名</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}