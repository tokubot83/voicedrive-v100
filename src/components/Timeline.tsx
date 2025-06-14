import { useState, useMemo } from 'react';
import EnhancedPost from './EnhancedPost';
import Post from './Post';
import { Post as PostType, VoteOption, Comment } from '../types';
import { demoPosts } from '../data/demo/posts';
import { useDemoMode } from './demo/DemoModeController';

interface TimelineProps {
  activeTab?: string;
  filterByUser?: string;
}

const Timeline = ({ activeTab = 'all', filterByUser }: TimelineProps) => {
  const { isDemoMode, currentUser } = useDemoMode();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Debug logging
  console.log('Timeline component rendered', {
    activeTab,
    filterByUser,
    isDemoMode,
    currentUser
  });
  
  // Use demo posts in demo mode, otherwise use the original posts
  const initialPosts = useMemo(() => {
    if (isDemoMode) {
      // Sort demo posts by timestamp (newest first)
      return [...demoPosts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    
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
        anonymityLevel: 'real' as const,
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
        anonymityLevel: 'real' as const,
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
        anonymityLevel: 'real' as const,
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
        anonymityLevel: 'real' as const,
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
        anonymityLevel: 'real' as const,
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
  }, [isDemoMode]);
  
  const [posts, setPosts] = useState<PostType[]>(initialPosts);

  const handleVote = (postId: string, option: VoteOption) => {
    console.log(`Voted ${option} for post ${postId}`);
  };

  const handleComment = (postId: string) => {
    setSelectedPostId(postId);
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
    
    return filtered;
  }, [posts, activeTab, filterByUser]);

  console.log('Timeline rendering posts:', filteredPosts.length);
  
  return (
    <div className="overflow-y-auto">
      {filteredPosts.map((post) => {
        console.log('Rendering post:', post.id, post.type);
        return (
          <div key={post.id}>
            {selectedPostId === post.id ? (
              <Post
                key={post.id}
                post={post}
                currentUser={currentUser}
                onVote={handleVote}
                onComment={handleCommentSubmit}
                onClose={() => setSelectedPostId(null)}
              />
            ) : (
              <EnhancedPost
                key={post.id}
                post={post}
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