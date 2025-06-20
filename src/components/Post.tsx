import { useState, useEffect } from 'react';
import VotingSystem from './VotingSystem';
import EnhancedVotingSystem from './EnhancedVotingSystem';
import EnhancedConsensusChart from './EnhancedConsensusChart';
import ThreadedCommentSystem from './comments/ThreadedCommentSystem';
import { Post as PostType, VoteOption, Comment, User } from '../types';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { generateSampleVotesByStakeholder } from '../utils/votingCalculations';
import { proposalTypeConfigs } from '../config/proposalTypes';
import { FACILITIES } from '../data/medical/facilities';
import PostVisibilityEngine from '../services/PostVisibilityEngine';

interface PostProps {
  post: PostType;
  currentUser: User;
  onVote: (postId: string, option: VoteOption) => void;
  onComment: (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onClose?: () => void;
}

const Post = ({ post, currentUser, onVote, onComment, onClose }: PostProps) => {
  console.log('🎯 Post component rendering:', post.id, post.type, post.content.slice(0, 50));
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { calculateScore, getStatusConfig, convertVotesToEngagements } = useProjectScoring();
  
  console.log('Post component rendered:', post.id, post.content.substring(0, 50));
  
  // PostVisibilityEngineを使用して権限を確認
  const visibilityEngine = new PostVisibilityEngine();
  const displayConfig = visibilityEngine.getDisplayConfig(post, currentUser);
  
  // 施設名を取得するヘルパー関数
  const getFacilityName = (facilityId: string) => {
    return FACILITIES[facilityId as keyof typeof FACILITIES]?.name || '';
  };
  
  // プロジェクトスコアを計算してワークフロー表示を判定
  useEffect(() => {
    if (post.type === 'improvement') {
      const engagements = convertVotesToEngagements(post.votes);
      const score = calculateScore(engagements, post.proposalType);
      const status = getStatusConfig(score, post.type);
      
      // 閾値を達成していればワークフローを表示
      setShowWorkflow(status.achieved && !!post.projectId);
    }
  }, [post, calculateScore, getStatusConfig, convertVotesToEngagements]);

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

  const handleCommentSubmit = (postId: string, comment: Partial<Comment>) => {
    onComment(postId, comment as Omit<Comment, 'id' | 'timestamp'>);
  };

  const handleCommentLike = (commentId: string) => {
    // TODO: Implement comment like functionality
    console.log('Like comment:', commentId);
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  return (
    <div className={`rounded-xl border transition-colors mb-4 ${getBackgroundStyle()}`}>
      {onClose && (
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
      )}
      
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
          <div className={`
            px-3 py-1.5 rounded-lg text-xs font-medium text-white
            bg-gradient-to-r ${getTypeStyle()}
            shadow-sm border border-white/10
            flex items-center gap-1.5
          `}>
            <span className="text-sm">
              {post.type === 'improvement' ? '💡' : 
               post.type === 'community' ? '💬' : 
               '🚨'}
            </span>
            <span>
              {post.type === 'improvement' ? 'アイデアボイス' : 
               post.type === 'community' ? 'フリーボイス' : 
               'コンプライアンス窓口'}
            </span>
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
      {post.type === 'improvement' && displayConfig.showVoteButtons && (
        <div className="px-4 pb-4">
          {post.enhancedProjectStatus ? (
            <EnhancedConsensusChart
              votes={post.votes}
              currentScore={calculateScore(convertVotesToEngagements(post.votes), post.proposalType)}
              currentLevel={post.enhancedProjectStatus.level}
              postId={post.id}
            />
          ) : post.proposalType ? (
            <EnhancedVotingSystem
              postId={post.id}
              votes={post.votes}
              votesByStakeholder={post.votesByStakeholder || generateSampleVotesByStakeholder(post.votes)}
              proposalType={post.proposalType}
              selectedVote={selectedVote}
              onVote={handleVote}
            />
          ) : (
            <VotingSystem
              postId={post.id}
              votes={post.votes}
              selectedVote={selectedVote}
              onVote={handleVote}
              proposalType={post.proposalType}
              showScore={true}
            />
          )}
        </div>
      )}
      
      {/* 投票権限がない場合のメッセージ */}
      {post.type === 'improvement' && !displayConfig.showVoteButtons && displayConfig.upgradeNotification && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm">{displayConfig.upgradeNotification}</p>
          </div>
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

Post.displayName = 'Post';

export default Post;