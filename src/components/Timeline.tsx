import { useState, useMemo, useEffect } from 'react';
import EnhancedPost from './EnhancedPost';
import Post from './Post';
import FreespacePost from './FreespacePost';
import PollResultPost from './PollResultPost';
import { Post as PostType, VoteOption, Comment } from '../types';
import { demoPosts } from '../data/demo/posts';
import { useDemoMode } from './demo/DemoModeController';
import { FreespaceExpirationService } from '../services/FreespaceExpirationService';
import { useAuth } from '../hooks/useAuth';
import FreespaceExpirationNotification from './FreespaceExpirationNotification';
import { demoPolls } from '../data/demo/freespacePolls';
import { useVoting } from '../hooks/useVoting';

interface TimelineProps {
  activeTab?: string;
  filterByUser?: string;
}

const Timeline = ({ activeTab = 'all', filterByUser }: TimelineProps) => {
  // Safe demo mode hook usage with fallback
  let isDemoMode = false;
  let demoUser = null;
  
  try {
    const demoModeData = useDemoMode();
    isDemoMode = demoModeData.isDemoMode;
    demoUser = demoModeData.currentUser;
  } catch (error) {
    // useDemoMode hook is not available, use defaults
    console.log('DemoMode not available, using defaults');
  }
  
  const { currentUser: authUser } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [polls, setPolls] = useState(demoPolls);
  
  // Define activeUser safely with fallback
  const activeUser = demoUser || authUser || null;
  const currentUser = activeUser; // For backward compatibility
  
  // Early return if no user is available
  if (!activeUser) {
    console.log('No user available, rendering empty timeline');
    return (
      <div className="overflow-y-auto p-4">
        <div className="text-center text-gray-500">
          <p>ユーザー情報を読み込み中...</p>
        </div>
      </div>
    );
  }
  
  // Debug logging
  console.log('Timeline component rendered', {
    activeTab,
    filterByUser,
    isDemoMode,
    currentUser
  });

  // 初期データの設定
  useEffect(() => {
    // 初期投稿データの設定
    const initialPostsData = isDemoMode ? 
      [...demoPosts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) :
      getOriginalPosts();
    
    setPosts(initialPostsData);
  }, [isDemoMode]);
  
  // Use demo posts in demo mode, otherwise use the original posts
  const getOriginalPosts = (): PostType[] => {
    // Original posts for non-demo mode
    return [
      // Post 4: スコア30点（プロジェクト化表示なし）
      {
        id: '1',
        type: 'improvement' as const,
        content: '休憩室にコーヒーマシンを設置してはどうでしょうか。職員の満足度向上に繋がると思います。',
        author: {
          id: '1',
          name: '山田花子',
          department: '総務部',
          role: '事務職員',
        },
        anonymityLevel: 'real_name' as const,
        priority: 'low' as const,
        timestamp: new Date(),
        votes: {
          'strongly-oppose': 0,
          'oppose': 0,
          'neutral': 1,
          'support': 2,
          'strongly-support': 1,
        },
        comments: [],
      },
      // Post 2: スコア150点（部署内プロジェクト向け - 75%）
      {
        id: '2',
        type: 'improvement' as const,
        content: '夜勤シフトの負担を軽減するため、現在の3交代制から2交代制への移行を提案します。職員の生活の質を向上させながら、患者ケアの質も維持できる新しいシフトモデルです。',
        author: {
          id: '2',
          name: '田中太郎',
          department: '看護部',
          role: '看護師',
        },
        anonymityLevel: 'real_name' as const,
        priority: 'high' as const,
        timestamp: new Date(),
        votes: {
          'strongly-oppose': 0,
          'oppose': 1,
          'neutral': 6,
          'support': 10,
          'strongly-support': 5,
        },
        comments: [],
      },
      // Post 3: スコア320点（施設内プロジェクト向け - 80%）
      {
        id: '3',
        type: 'improvement' as const,
        content: '電子カルテシステムの操作性改善を提案します。頻繁に使用する機能へのショートカット設定、入力補助機能の強化により、医療スタッフの業務効率を30%向上させることができます。',
        author: {
          id: '3',
          name: '鈴木医師',
          department: '内科',
          role: '医師',
        },
        anonymityLevel: 'real_name' as const,
        priority: 'urgent' as const,
        timestamp: new Date(),
        votes: {
          'strongly-oppose': 1,
          'oppose': 2,
          'neutral': 13,
          'support': 21,
          'strongly-support': 10,
        },
        comments: [],
      },
      // Post 1: スコア387.5点（施設内プロジェクト向け - 96.9% あとわずか！）
      {
        id: '4',
        type: 'improvement' as const,
        content: '夜勤シフトの負担軽減について議論したいと思います。現在の3交代制から2交代制への移行についてご意見をお聞かせください。職員の皆さんの生活の質向上と、患者ケアの質の両立を目指したいと思います。 #シフト改善 #働き方改革',
        author: {
          id: '4',
          name: '山田看護師長',
          department: '看護部',
          role: '看護師長',
        },
        anonymityLevel: 'real_name' as const,
        priority: 'high' as const,
        timestamp: new Date(),
        votes: {
          'strongly-oppose': 1,
          'oppose': 3,
          'neutral': 15,
          'support': 25,
          'strongly-support': 13,
        },
        comments: [],
      },
      // 患者報告情報システム
      {
        id: '5',
        type: 'improvement' as const,
        content: '患者報告情報をリアルタイムで職種間共有できるシステムを導入したいです。患者状態の変化や治療方針の変更などを即座に全スタッフが把握でき、医療の質と安全性が向上します。',
        author: {
          id: '5',
          name: '田中医師',
          department: '内科',
          role: '医師',
        },
        anonymityLevel: 'real_name' as const,
        priority: 'medium' as const,
        timestamp: new Date(),
        votes: {
          'strongly-oppose': 4,
          'oppose': 9,
          'neutral': 19,
          'support': 37,
          'strongly-support': 22,
        },
        comments: [],
      },
    ] as PostType[];
  };

  const { submitVote, hasVoted, getUserVote } = useVoting();

  const handleVote = async (postId: string, option: VoteOption) => {
    try {
      // 投票を実行
      const success = await submitVote(postId, option);
      
      if (success) {
        // 投票が成功した場合、投稿データの投票数を更新
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                votes: {
                  ...post.votes,
                  [option]: post.votes[option] + 1
                }
              };
            }
            return post;
          })
        );
        
        console.log(`✅ Vote submitted successfully: ${option} for post ${postId}`);
      } else {
        console.warn(`⚠️ Vote submission failed: User may have already voted for post ${postId}`);
        alert('既に投票済みです。');
      }
    } catch (error) {
      console.error('❌ Error submitting vote:', error);
      alert('投票の送信中にエラーが発生しました。');
    }
  };

  const handleComment = (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    handleCommentSubmit(postId, comment);
  };

  const handleFreespaceComment = (postId: string, comment: Partial<Comment>) => {
    handleCommentSubmit(postId, comment as Omit<Comment, 'id' | 'timestamp'>);
  };

  const handleCommentSubmit = (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newComment = {
            id: Date.now().toString(),
            ...comment,
            timestamp: new Date(),
            likes: 0
          };
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

  // Filter posts based on activeTab and user
  const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    // Filter by user if specified
    if (filterByUser) {
      filtered = filtered.filter(post => post.author.id === filterByUser);
    }
    
    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(post => {
        switch (activeTab) {
          case 'improvement':
            return post.type === 'improvement';
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
    }
    
    // Apply expiration filtering for freespace posts
    const currentUserId = activeUser?.id || '';
    const userPermissionLevel = activeUser?.permissionLevel || 1;
    
    filtered = FreespaceExpirationService.filterVisiblePosts(
      filtered, 
      userPermissionLevel, 
      currentUserId
    );
    
    return filtered;
  }, [posts, activeTab, filterByUser, activeUser]);

  console.log('Timeline rendering posts:', filteredPosts.length);
  
  const handleExtensionRequest = (postId: string, reason: string) => {
    console.log('Extension requested for post:', postId, 'Reason:', reason);
    // TODO: Implement extension request logic
    alert('延長申請が送信されました。HR部門による承認をお待ちください。');
  };

  return (
    <div className="overflow-y-auto">
      {/* Freespace Expiration Notifications */}
      {activeUser?.id && (
        <FreespaceExpirationNotification
          posts={posts}
          currentUserId={activeUser.id}
          onExtensionRequest={handleExtensionRequest}
        />
      )}
      
      {filteredPosts.map((post) => {
        console.log('Rendering post:', post.id, post.type);
        
        // 投票結果投稿の場合は専用コンポーネントを使用
        if (post.pollResult && post.originalPollId) {
          return (
            <div key={post.id} className="mb-6">
              <PollResultPost post={post} />
            </div>
          );
        }
        
        // ユーザーの投票状態を含むpostオブジェクトを作成
        const postWithVote = {
          ...post,
          userVote: getUserVote(post.id),
          hasUserVoted: hasVoted(post.id)
        };
        
        return (
          <div key={post.id}>
            {post.type === 'community' ? (
              <FreespacePost
                key={post.id}
                post={postWithVote}
                poll={post.poll}
                userVote={post.poll ? { optionId: getUserVote(post.id) || '', userId: currentUser?.id || '' } : undefined}
                onVote={(optionId) => handleVote(post.id, optionId as VoteOption)}
                onComment={handleFreespaceComment}
              />
            ) : (
              <EnhancedPost
                key={post.id}
                post={postWithVote}
                currentUser={currentUser}
                onVote={handleVote}
                onComment={handleComment}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

Timeline.displayName = 'Timeline';

export default Timeline;