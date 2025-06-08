import { useState, useMemo } from 'react';
import EnhancedPost from './EnhancedPost';
import { Post as PostType, VoteOption } from '../types';
import { demoPosts } from '../data/demo/posts';
import { useDemoMode } from './demo/DemoModeController';

interface EnhancedTimelineProps {
  filter?: string;
}

const EnhancedTimeline: React.FC<EnhancedTimelineProps> = ({ filter = 'proposals' }) => {
  const { isDemoMode, currentUser } = useDemoMode();
  
  // Enhanced demo posts with project status
  const enhancedDemoPosts = useMemo(() => {
    if (!isDemoMode) return [];
    
    return demoPosts.map(post => {
      // Calculate total votes and positive percentage
      const totalVotes = Object.values(post.votes).reduce((sum, count) => sum + count, 0);
      const positiveVotes = (post.votes.support || 0) + (post.votes['strongly-support'] || 0);
      const positivePercentage = totalVotes > 0 ? (positiveVotes / totalVotes) : 0;
      
      // Assign project status based on votes and content
      let projectStatus = undefined;
      let projectDetails = undefined;
      
      // High-engagement posts get project status
      if (totalVotes >= 20 && positivePercentage >= 0.6) {
        const baseScore = totalVotes * 5 + positiveVotes * 3;
        projectStatus = {
          stage: 'approaching' as const,
          score: Math.min(baseScore, 380),
          threshold: 400,
          progress: Math.min((baseScore / 400) * 100, 95)
        };
      }
      
      // Some posts are active projects
      if (post.content.includes('AI在庫管理') || post.content.includes('電子カルテ')) {
        projectStatus = {
          stage: 'active' as const,
          score: 420,
          threshold: 400,
          progress: 100
        };
        projectDetails = {
          manager: '佐藤薬剤師',
          team: ['田中SE', '山田看護師', '鈴木事務'],
          milestones: [
            { id: '1', name: '要件定義', completed: true },
            { id: '2', name: 'システム選定', completed: true },
            { id: '3', name: '導入準備', completed: false, current: true },
            { id: '4', name: '本稼働', completed: false }
          ],
          roi: {
            investment: 2500000,
            expectedSavings: 8500000
          }
        };
      }
      
      // Some posts are completed projects
      if (post.content.includes('休憩室') && totalVotes > 30) {
        projectStatus = {
          stage: 'completed' as const,
          score: 450,
          threshold: 400,
          progress: 100
        };
        projectDetails = {
          manager: '山田総務部長',
          team: ['総務部チーム'],
          completedDate: '2024-03-15',
          outcomes: '職員満足度が15%向上、休憩時間の効率的な活用が実現',
          roi: {
            investment: 500000,
            expectedSavings: 1200000
          }
        };
      }
      
      return {
        ...post,
        projectStatus,
        projectDetails
      };
    });
  }, [isDemoMode, demoPosts]);
  
  // Filter posts based on selected filter
  const filteredPosts = useMemo(() => {
    const posts = isDemoMode ? enhancedDemoPosts : [];
    
    switch (filter) {
      case 'proposals':
        return posts.filter(post => 
          !post.projectStatus || 
          (post.projectStatus.stage !== 'active' && post.projectStatus.stage !== 'completed')
        );
      case 'progress':
        return posts.filter(post => 
          post.projectStatus && 
          (post.projectStatus.stage === 'approaching' || post.projectStatus.stage === 'ready')
        );
      case 'active':
        return posts.filter(post => 
          post.projectStatus?.stage === 'active'
        );
      case 'completed':
        return posts.filter(post => 
          post.projectStatus?.stage === 'completed'
        );
      default:
        return posts;
    }
  }, [isDemoMode, enhancedDemoPosts, filter]);

  const handleVote = (postId: string, option: VoteOption) => {
    console.log(`Voted ${option} for post ${postId}`);
  };

  const handleComment = (postId: string) => {
    console.log(`Opening comment modal for post ${postId}`);
  };

  if (filteredPosts.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">
          {filter === 'progress' && '📈 現在プロジェクト化進行中の提案はありません'}
          {filter === 'active' && '🚀 現在アクティブなプロジェクトはありません'}
          {filter === 'completed' && '✅ 完了したプロジェクトはまだありません'}
          {filter === 'proposals' && '📝 新しい提案を投稿してみましょう！'}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {filteredPosts.map((post) => (
        <EnhancedPost
          key={post.id}
          post={post}
        />
      ))}
    </div>
  );
};

export default EnhancedTimeline;