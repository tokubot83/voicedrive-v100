import React from 'react';
import { Post as PostType } from '../types';
import Post from './Post';
import ProjectStatusIndicator from './ProjectStatusIndicator';
import ProjectProgressCard from './ProjectProgressCard';
import ActiveProjectCard from './ActiveProjectCard';
import CompletedProjectCard from './CompletedProjectCard';

interface EnhancedPostProps {
  post: PostType;
}

const EnhancedPost: React.FC<EnhancedPostProps> = ({ post }) => {
  // プロジェクト化ステータス表示条件の判定
  const shouldShowProjectStatus = () => {
    const totalVotes = Object.values(post.votes).reduce((sum, count) => sum + count, 0);
    const positiveVotes = (post.votes.support || 0) + (post.votes['strongly-support'] || 0);
    const score = post.projectStatus?.score || 0;
    const threshold = post.projectStatus?.threshold || 400;
    
    // 表示条件:
    // 1. 投票が5票以上 AND 賛成票が60%以上
    // 2. OR プロジェクト化スコアが閾値の70%以上
    return (totalVotes >= 5 && (positiveVotes / totalVotes) >= 0.6) || 
           (score >= (threshold * 0.7));
  };

  // プロジェクト表示段階の判定
  const getProjectDisplayCondition = () => {
    const totalVotes = Object.values(post.votes).reduce((sum, count) => sum + count, 0);
    const positiveVotes = (post.votes.support || 0) + (post.votes['strongly-support'] || 0);
    const score = post.projectStatus?.score || 0;
    const threshold = post.projectStatus?.threshold || 400;
    
    if (totalVotes === 0) return 'hidden';
    
    if (totalVotes >= 5 && (positiveVotes / totalVotes) >= 0.6) {
      if (score >= threshold) return 'completed';
      if (score >= threshold * 0.9) return 'approaching';
      if (score >= threshold * 0.7) return 'progressing';
      return 'early';
    }
    
    return 'hidden';
  };

  const condition = getProjectDisplayCondition();
  const projectStage = post.projectStatus?.stage;

  // プロジェクト化完了後の表示
  if (projectStage === 'active') {
    return <ActiveProjectCard project={post} />;
  }

  if (projectStage === 'completed') {
    return <CompletedProjectCard project={post} />;
  }

  // 通常の投稿表示
  return (
    <div>
      <Post post={post} />
      
      {/* プロジェクト化ステータス（条件付き表示） */}
      {shouldShowProjectStatus() && post.projectStatus && (
        <>
          {/* 初期段階のヒント */}
          {condition === 'early' && (
            <div className="mx-4 mb-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-300">
                💡 この提案に注目が集まっています！さらに支持が集まればプロジェクト化の可能性があります。
              </p>
            </div>
          )}

          {/* 進行中の表示 */}
          {condition === 'progressing' && (
            <div className="mx-4 mb-4">
              <ProjectProgressCard 
                score={post.projectStatus.score}
                threshold={post.projectStatus.threshold}
                progress={post.projectStatus.progress}
              />
            </div>
          )}

          {/* 間近アラート */}
          {(condition === 'approaching' || condition === 'completed') && (
            <div className="mx-4 mb-4">
              <ProjectStatusIndicator 
                score={post.projectStatus.score}
                threshold={post.projectStatus.threshold}
                status={condition === 'completed' ? 'ready' : 'approaching'}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedPost;