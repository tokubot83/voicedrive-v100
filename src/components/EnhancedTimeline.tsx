import { useState } from 'react';
import EnhancedPost from './EnhancedPost';
import ActiveProjectCard from './ActiveProjectCard';
import CompletedProjectCard from './CompletedProjectCard';
import { Post, VoteOption, User } from '../types';

interface EnhancedTimelineProps {
  posts: Post[];
  activeTab: string;
  currentUser: User;
  onVote: (postId: string, option: VoteOption) => void;
  onComment: (postId: string) => void;
}

const EnhancedTimeline = ({ posts, activeTab, currentUser, onVote, onComment }: EnhancedTimelineProps) => {
  const [improvementSubTab, setImprovementSubTab] = useState<'proposals' | 'progress' | 'active' | 'completed'>('proposals');

  // 改善提案タブのサブタブ
  const improvementSubTabs = [
    { id: 'proposals' as const, label: '📝 提案中', count: 12 },
    { id: 'progress' as const, label: '📈 プロジェクト化進行中', count: 3 },
    { id: 'active' as const, label: '🚀 アクティブプロジェクト', count: 2 },
    { id: 'completed' as const, label: '✅ 完了プロジェクト', count: 5 }
  ];

  // タブごとの投稿フィルタリング
  const getFilteredPosts = () => {
    if (activeTab === 'all') {
      return posts;
    }
    
    if (activeTab === 'improvement') {
      // 改善提案タブの場合、サブタブに応じてフィルタリング
      const improvementPosts = posts.filter(post => post.type === 'improvement');
      
      switch (improvementSubTab) {
        case 'proposals':
          // プロジェクト化されていない提案のみ
          return improvementPosts.filter(post => !post.projectId);
        case 'progress':
          // プロジェクト化進行中（スコアが閾値の70%以上）
          return improvementPosts.filter(post => {
            // TODO: 実際のスコア計算ロジックを実装
            const totalVotes = Object.values(post.votes).reduce((sum, count) => sum + count, 0);
            const positiveVotes = post.votes.support + post.votes['strongly-support'];
            const positiveRatio = totalVotes > 0 ? positiveVotes / totalVotes : 0;
            return totalVotes >= 5 && positiveRatio >= 0.6 && !post.projectId;
          });
        case 'active':
          // アクティブなプロジェクト
          return improvementPosts.filter(post => post.projectId && !(typeof post.projectStatus === 'string' ? post.projectStatus === 'completed' : post.projectStatus?.stage === 'completed'));
        case 'completed':
          // 完了したプロジェクト
          return improvementPosts.filter(post => post.projectId && (typeof post.projectStatus === 'string' ? post.projectStatus === 'completed' : post.projectStatus?.stage === 'completed'));
        default:
          return improvementPosts;
      }
    }
    
    // その他のタブ
    return posts.filter(post => {
      switch (activeTab) {
        case 'community':
          return post.type === 'community';
        case 'report':
          return post.type === 'report';
        case 'urgent':
          return post.priority === 'urgent' || post.priority === 'high';
        default:
          return true;
      }
    });
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div>
      {/* 改善提案タブの場合のみサブタブを表示 */}
      {activeTab === 'improvement' && (
        <div className="border-b border-gray-800/30 px-5 py-3 bg-gradient-to-b from-gray-900/50 to-transparent">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {improvementSubTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setImprovementSubTab(tab.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${improvementSubTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(29,155,240,0.3)]' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70 hover:text-gray-200'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* コンテンツ表示 */}
      <div>
        {filteredPosts.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <div className="text-4xl mb-4">🔍</div>
            <p>該当する投稿がありません</p>
          </div>
        ) : (
          <>
            {/* 通常の投稿表示 */}
            {(improvementSubTab === 'proposals' || improvementSubTab === 'progress' || activeTab !== 'improvement') && 
              filteredPosts.map((post) => (
                <EnhancedPost
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onVote={onVote}
                  onComment={onComment}
                />
              ))
            }

            {/* アクティブプロジェクト表示 */}
            {activeTab === 'improvement' && improvementSubTab === 'active' && (
              <div className="p-5 space-y-4">
                {filteredPosts.map((post) => (
                  <ActiveProjectCard key={post.id} project={post} />
                ))}
              </div>
            )}

            {/* 完了プロジェクト表示 */}
            {activeTab === 'improvement' && improvementSubTab === 'completed' && (
              <div className="p-5 space-y-4">
                {filteredPosts.map((post) => (
                  <CompletedProjectCard key={post.id} project={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedTimeline;