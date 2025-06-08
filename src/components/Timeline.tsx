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
      type: 'improvement',
      content: '薬剤在庫管理にAI予測システムを導入して、適正在庫の維持と廃棄ロス削減を実現したいです。過去のデータを活用して、季節性や流行病などの要因も考慮した予測ができれば、大幅なコスト削減になると思います。 #AI活用 #在庫管理 #コスト削減',
      author: {
        id: '2',
        name: '佐藤薬剤師',
        department: '薬剤部',
        role: '薬剤師',
      },
      anonymityLevel: 'real',
      priority: 'medium',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 1,
        'oppose': 2,
        'neutral': 5,
        'support': 22,
        'strongly-support': 18,
      },
      comments: [],
      projectId: 'pharmacy-ai',
      approver: '薬剤部長',
    },
    {
      id: '3',
      type: 'community',
      content: '新しい医療機器の操作研修会を来週開催します。参加希望の方は、このスレッドでお知らせください。実践的な内容を予定しています。',
      author: {
        id: '3',
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