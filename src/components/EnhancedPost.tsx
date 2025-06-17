import { useState } from 'react';
import VotingSection from './VotingSection';
import FreespacePostRenderer from './FreespacePostRenderer';
import { Post as PostType, VoteOption, User } from '../types';
import { proposalTypeConfigs } from '../config/proposalTypes';
import { FACILITIES } from '../data/medical/facilities';

interface EnhancedPostProps {
  post: PostType;
  currentUser: User;
  onVote: (postId: string, option: VoteOption) => void;
  onComment: (postId: string) => void;
}

const EnhancedPost = ({ post, currentUser, onVote, onComment }: EnhancedPostProps) => {
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);

  // 施設名を取得するヘルパー関数
  const getFacilityName = (facilityId: string) => {
    return FACILITIES[facilityId as keyof typeof FACILITIES]?.name || '';
  };

  const getAuthorDisplay = () => {
    const facilityName = post.author.facility_id ? getFacilityName(post.author.facility_id) : '';
    switch (post.anonymityLevel) {
      case 'real_name':
        return post.author.name;
      case 'facility_department':
        return `${facilityName} ${post.author.department}職員`;
      case 'facility_anonymous':
        return `${facilityName} 匿名職員`;
      case 'department_only':
        return `${post.author.department}職員`;
      case 'anonymous':
        return '匿名職員';
      default:
        return '匿名職員';
    }
  };

  const getAvatarInitial = () => {
    switch (post.anonymityLevel) {
      case 'real_name':
        return post.author.name.charAt(0);
      case 'facility_department':
      case 'department_only':
        return post.author.department.charAt(0);
      case 'facility_anonymous':
      case 'anonymous':
        return '?';
      default:
        return '?';
    }
  };

  const getTypeStyle = () => {
    switch (post.type) {
      case 'improvement':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'community':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'report':
        return 'bg-gradient-to-r from-red-500 to-red-600';
    }
  };

  const getBackgroundStyle = () => {
    switch (post.type) {
      case 'improvement':
        return 'bg-green-50 border-green-200 hover:border-green-300';
      case 'community':
        return 'bg-white border-gray-200 hover:border-gray-300';
      case 'report':
        return 'bg-red-50 border-red-200 hover:border-red-300';
      default:
        return 'bg-white border-gray-200 hover:border-gray-300';
    }
  };

  const getPriorityStyle = () => {
    switch (post.priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return '';
    }
  };

  const handleVote = (option: VoteOption) => {
    setSelectedVote(option);
    onVote(post.id, option);
  };


  // フリースペース投稿の場合は専用レンダラーを使用
  if (post.type === 'community') {
    return (
      <div className="mb-6">
        <FreespacePostRenderer
          post={post}
          currentUserId={currentUser.id}
          onVote={onVote}
          onComment={onComment}
        />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border transition-colors mb-4 ${getBackgroundStyle()}`}>
      {/* ヘッダー */}
      <div className="flex items-center p-4 pb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {getAvatarInitial()}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <div className="font-bold text-gray-900">
            {getAuthorDisplay()}
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
          <span className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${getTypeStyle()}`}>
            {post.type === 'improvement' ? '💡 改善提案' : 
             post.type === 'community' ? '💬 フリースペース' : 
             post.type === 'report' ? '🚨 公益通報' : ''}
          </span>
        </div>
      </div>

      {/* 投稿内容 */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 leading-relaxed">{post.content}</p>
        
        {/* 提案タイプと優先度のタグ */}
        {(post.proposalType || post.priority) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {post.type === 'improvement' && post.proposalType && (
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${proposalTypeConfigs[post.proposalType].borderColor.replace('border-', 'bg-').replace('500', '500/20')} ${proposalTypeConfigs[post.proposalType].borderColor.replace('border-', 'text-')}`}>
                {proposalTypeConfigs[post.proposalType]?.icon || '📝'} {proposalTypeConfigs[post.proposalType]?.label}
              </span>
            )}
            
            {post.priority && (
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityStyle()}`}>
                {post.priority === 'urgent' ? '🔴 緊急' : 
                 post.priority === 'high' ? '🟠 高優先度' : 
                 post.priority === 'medium' ? '🟡 中優先度' : 
                 '🟢 低優先度'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 投票・合意システム */}
      {post.type === 'improvement' && (
        <div className="px-4 pb-4">
          <VotingSection
            post={post}
            currentUser={currentUser}
            onVote={onVote}
            userVote={selectedVote}
          />
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex space-x-6">
          <button 
            onClick={() => onComment(post.id)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg">💬</span>
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

EnhancedPost.displayName = 'EnhancedPost';

export default EnhancedPost;