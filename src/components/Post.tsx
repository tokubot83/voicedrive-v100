import { useState, useEffect } from 'react';
import VotingSystem from './VotingSystem';
import EnhancedVotingSystem from './EnhancedVotingSystem';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { Post as PostType, VoteOption, Comment, User } from '../types';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { generateSampleVotesByStakeholder } from '../utils/votingCalculations';
import { proposalTypeConfigs } from '../config/proposalTypes';
import { FACILITIES } from '../data/medical/facilities';

interface PostProps {
  post: PostType;
  currentUser: User;
  onVote: (postId: string, option: VoteOption) => void;
  onComment: (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onClose?: () => void;
}

const Post = ({ post, currentUser, onVote, onComment, onClose }: PostProps) => {
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { calculateScore, getStatusConfig, convertVotesToEngagements } = useProjectScoring();
  
  // 施設名を取得するヘルパー関数
  const getFacilityName = (facilityId: string) => {
    return FACILITIES[facilityId as keyof typeof FACILITIES]?.name || '';
  };
  
  // プロジェクトスコアを計算してワークフロー表示を判定
  useEffect(() => {
    if (post.type === 'improvement') {
      const engagements = convertVotesToEngagements(post.votes);
      const score = calculateScore(engagements, post.id);
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
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'community':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'report':
        return 'bg-gradient-to-r from-red-500 to-red-600';
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

  const handleCommentSubmit = (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    onComment(post.id, comment);
    setShowCommentForm(false);
  };

  const handleCommentClick = () => {
    if (post.comments.length > 0) {
      setShowComments(!showComments);
    } else {
      setShowCommentForm(true);
    }
  };

  return (
    <div className="border-b border-gray-800/30 p-5 transition-all duration-300 hover:bg-white/2 hover:shadow-[inset_0_0_20px_rgba(29,155,240,0.1)]">
      {onClose && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {getAvatarInitial()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-1 rounded-xl text-xs font-bold text-white ${getTypeStyle()}`}>
              {post.type === 'improvement' ? '💡 改善提案' : 
               post.type === 'community' ? '💬 フリースペース' : 
               '🚨 公益通報'}
            </span>
            
            {post.type === 'improvement' && post.proposalType && (
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${proposalTypeConfigs[post.proposalType].borderColor.replace('border-', 'bg-').replace('500', '500/20')} ${proposalTypeConfigs[post.proposalType].borderColor.replace('border-', 'text-')}`}>
                {proposalTypeConfigs[post.proposalType].icon} {proposalTypeConfigs[post.proposalType].label}
              </span>
            )}
            
            {post.priority && (
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getPriorityStyle()}`}>
                {post.priority === 'urgent' ? '緊急' : 
                 post.priority === 'high' ? '高優先度' : 
                 post.priority === 'medium' ? '中優先度' : 
                 '低優先度'}
              </span>
            )}
            
            <span className="font-bold text-gray-100">{getAuthorDisplay()}</span>
            {post.anonymityLevel === 'real_name' && (
              <span className="text-blue-400 text-sm font-medium">@{post.author.role}</span>
            )}
            <span className="text-gray-500 text-sm">・5分前</span>
          </div>
          
          <div className="text-gray-100 mb-4 leading-relaxed">
            {post.content}
          </div>
          
          {post.type === 'improvement' && (
            <>
              {post.proposalType ? (
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
                />
              )}
            </>
          )}
          
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleCommentClick}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-blue-500/8 to-purple-500/8 border border-blue-500/20 text-blue-400 rounded-2xl transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-500/15 hover:to-purple-500/15 hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(29,155,240,0.2)] group"
              >
                <span className="text-xl drop-shadow-[0_0_8px_rgba(29,155,240,0.5)] group-hover:animate-float">
                  💬
                </span>
                <span className="font-medium">
                  {post.comments.length > 0 ? 'コメントを見る' : 'コメントする'}
                </span>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-xl font-bold text-sm">
                  {post.comments.length}
                </span>
              </button>
              
              {post.comments.length > 0 && !showCommentForm && (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                >
                  + 新しいコメント
                </button>
              )}
            </div>

            {showCommentForm && (
              <div className="mb-4">
                <CommentForm
                  postId={post.id}
                  proposalType={post.proposalType}
                  currentUser={currentUser}
                  onSubmit={handleCommentSubmit}
                  onCancel={() => setShowCommentForm(false)}
                />
              </div>
            )}

            {showComments && post.comments.length > 0 && (
              <div className="mt-4">
                <CommentList
                  comments={post.comments}
                  currentUser={currentUser}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;