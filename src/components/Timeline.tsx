import { useState } from 'react';
import Post from './Post';
import { Post as PostType, VoteOption } from '../types';

const Timeline = () => {
  const [posts] = useState<PostType[]>([
    {
      id: '1',
      type: 'improvement',
      content: '夜勤シフトの負担を軽減するため、現在の3交代制から2交代制への移行を提案します。職員の生活の質を向上させながら、患者ケアの質も維持できる新しいシフトモデルです。',
      author: {
        id: '1',
        name: '田中太郎',
        department: '看護部',
        role: '看護師',
      },
      anonymityLevel: 'real',
      priority: 'high',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 3,
        'oppose': 7,
        'neutral': 12,
        'support': 28,
        'strongly-support': 15,
      },
      comments: [],
    },
    {
      id: '2',
      type: 'community',
      content: '新しい医療機器の操作研修会を来週開催します。参加希望の方は、このスレッドでお知らせください。実践的な内容を予定しています。',
      author: {
        id: '2',
        name: '医療技術部職員',
        department: '医療技術部',
        role: '臨床工学技士',
      },
      anonymityLevel: 'department',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 0,
        'oppose': 0,
        'neutral': 1,
        'support': 4,
        'strongly-support': 4,
      },
      comments: [],
    },
  ]);

  const handleVote = (postId: string, option: VoteOption) => {
    console.log(`Voted ${option} for post ${postId}`);
  };

  const handleComment = (postId: string) => {
    console.log(`Opening comment modal for post ${postId}`);
  };

  return (
    <div className="overflow-y-auto">
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          onVote={handleVote}
          onComment={handleComment}
        />
      ))}
    </div>
  );
};

export default Timeline;