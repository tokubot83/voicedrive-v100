import { useState } from 'react';
import VotingSection from './VotingSection';
import FreespacePostRenderer from './FreespacePostRenderer';
import ThreadedCommentSystem from './comments/ThreadedCommentSystem';
import Avatar from './common/Avatar';
import { generateAvatarByAnonymity, getDisplayName } from '../utils/avatarGenerator';
import { Post as PostType, VoteOption, User, Comment } from '../types';
import { proposalTypeConfigs } from '../config/proposalTypes';
import { FACILITIES } from '../data/medical/facilities';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';

interface EnhancedPostProps {
  post: PostType;
  currentUser: User;
  onVote: (postId: string, option: VoteOption) => void;
  onComment: (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
}

const EnhancedPost = ({ post, currentUser, onVote, onComment }: EnhancedPostProps) => {
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
  const [showComments, setShowComments] = useState(false);
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // プロジェクトレベルの計算（改善提案のみ）
  const currentScore = post.type === 'improvement' && post.votes
    ? calculateScore(convertVotesToEngagements(post.votes), post.proposalType)
    : 0;

  const getProjectLevel = (score: number) => {
    if (score >= 1200) return 'STRATEGIC';
    if (score >= 600) return 'ORGANIZATION';
    if (score >= 300) return 'FACILITY';
    if (score >= 100) return 'DEPARTMENT';
    if (score >= 50) return 'TEAM';
    return 'PENDING';
  };

  // コメント関連の処理
  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const handleCommentSubmit = (postId: string, comment: Partial<Comment>) => {
    onComment(postId, comment as Omit<Comment, 'id' | 'timestamp'>);
  };

  // Generate avatar based on anonymity level
  const avatarData = generateAvatarByAnonymity(
    post.anonymityLevel || 'full',
    post.author,
    post.id
  );
  
  const displayName = getDisplayName(
    post.anonymityLevel || 'full',
    post.author
  );


  const getTypeStyle = () => {
    switch (post.type) {
      case 'improvement':
        return 'from-amber-500 to-orange-500';
      case 'community':
        return 'from-blue-500 to-cyan-500';
      case 'report':
        return 'from-rose-500 to-pink-500';
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
          <div className="flex items-center gap-2">
          {/* プロジェクトレベルバッジ（改善提案で高レベルの場合のみ表示） */}
          {post.type === 'improvement' && currentScore >= 100 && (
            <div className={`
              px-2 py-1 rounded-full text-xs font-bold text-white shadow-md
              bg-gradient-to-r ${
                currentScore >= 600 ? 'from-orange-400 to-orange-600' :
                currentScore >= 300 ? 'from-purple-400 to-purple-600' :
                'from-blue-400 to-blue-600'
              }
              flex items-center gap-1
            `}>
              <span className="text-xs">
                {currentScore >= 600 ? '🏛️' :
                 currentScore >= 300 ? '🏥' : '🏢'}
              </span>
              <span>
                {currentScore >= 600 ? '法人' :
                 currentScore >= 300 ? '施設' : '部署'}
              </span>
            </div>
          )}
          
          {/* メインタイプバッジ */}
          <div className={`
            px-3 py-1.5 rounded-lg text-xs font-medium text-white
            bg-gradient-to-r ${getTypeStyle()}
            shadow-sm border border-white/10
            flex items-center gap-1.5
          `}>
            <span className="text-sm">
              {post.type === 'improvement' ? '💡' : 
               post.type === 'community' ? '💬' : 
               post.type === 'report' ? '🚨' : ''}
            </span>
            <span>
              {post.type === 'improvement' ? 'アイデアボイス' : 
               post.type === 'community' ? 'フリーボイス' : 
               post.type === 'report' ? 'コンプライアンス窓口' : ''}
            </span>
          </div>
        </div>
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
            onClick={handleCommentClick}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg">💬</span>
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* コメントセクション - X方式のスレッド形式 */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
          <ThreadedCommentSystem
            post={post}
            comments={post.comments}
            currentUser={currentUser}
            onComment={handleCommentSubmit}
          />
        </div>
      )}
    </div>
  );
};

EnhancedPost.displayName = 'EnhancedPost';

export default EnhancedPost;