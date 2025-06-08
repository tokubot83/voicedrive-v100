import { useState } from 'react';
import Post from './Post';
import { Post as PostType, VoteOption } from '../types';

const Timeline = () => {
  const [posts] = useState<PostType[]>([
    // 段階1: スコア50点未満（プロジェクト化表示なし）
    {
      id: '1',
      type: 'improvement',
      content: '休憩室にコーヒーマシンを設置してはどうでしょうか。職員の満足度向上に繋がると思います。',
      author: {
        id: '1',
        name: '山田花子',
        department: '総務部',
        role: '事務職員',
      },
      anonymityLevel: 'real',
      priority: 'low',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 0,
        'oppose': 1,
        'neutral': 3,
        'support': 2,
        'strongly-support': 0,
      },
      comments: [],
    },
    // 段階2: 50-199点（部署内プロジェクト向け）
    {
      id: '2',
      type: 'improvement',
      content: '夜勤シフトの負担を軽減するため、現在の3交代制から2交代制への移行を提案します。職員の生活の質を向上させながら、患者ケアの質も維持できる新しいシフトモデルです。',
      author: {
        id: '2',
        name: '田中太郎',
        department: '看護部',
        role: '看護師',
      },
      anonymityLevel: 'real',
      priority: 'high',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 2,
        'oppose': 3,
        'neutral': 8,
        'support': 12,
        'strongly-support': 5,
      },
      comments: [],
    },
    // 段階3: 200-399点（施設内プロジェクト向け）
    {
      id: '3',
      type: 'improvement',
      content: '電子カルテシステムの操作性改善を提案します。頻繁に使用する機能へのショートカット設定、入力補助機能の強化により、医療スタッフの業務効率を30%向上させることができます。',
      author: {
        id: '3',
        name: '鈴木医師',
        department: '内科',
        role: '医師',
      },
      anonymityLevel: 'real',
      priority: 'urgent',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 1,
        'oppose': 2,
        'neutral': 10,
        'support': 25,
        'strongly-support': 15,
      },
      comments: [],
    },
    // 段階4: 90%以上（あとわずか！）
    {
      id: '4',
      type: 'improvement',
      content: '患者待ち時間短縮のため、AIを活用した診察順番最適化システムの導入を提案します。緊急度、診察内容、医師のスキルセットを考慮して、待ち時間を平均40%削減できます。',
      author: {
        id: '4',
        name: '高橋看護師長',
        department: '外来',
        role: '看護師長',
      },
      anonymityLevel: 'real',
      priority: 'high',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 2,
        'oppose': 3,
        'neutral': 15,
        'support': 35,
        'strongly-support': 30,
      },
      comments: [],
    },
    // 段階5: プロジェクト化完了
    {
      id: '5',
      type: 'improvement',
      content: '薬剤在庫管理にAI予測システムを導入して、適正在庫の維持と廃棄ロス削減を実現したいです。過去のデータを活用して、季節性や流行病などの要因も考慮した予測ができれば、大幅なコスト削減になると思います。 #AI活用 #在庫管理 #コスト削減',
      author: {
        id: '5',
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
        'strongly-support': 45,
      },
      comments: [],
      projectId: 'pharmacy-ai',
      approver: '薬剤部長',
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