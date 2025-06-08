import { useState } from 'react';
import Post from './Post';
import { Post as PostType, VoteOption } from '../types';

const Timeline = () => {
  const [posts] = useState<PostType[]>([
    // Post 4: スコア30点（プロジェクト化表示なし）
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
        'oppose': 2,
        'neutral': 5,
        'support': 3,
        'strongly-support': 0,
      },
      comments: [],
    },
    // Post 2: スコア150点（部署内プロジェクト向け - 75%）
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
        'strongly-oppose': 1,
        'oppose': 3,
        'neutral': 15,
        'support': 18,
        'strongly-support': 8,
      },
      comments: [],
    },
    // Post 3: スコア320点（施設内プロジェクト向け - 80%）
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
        'strongly-oppose': 2,
        'oppose': 5,
        'neutral': 25,
        'support': 35,
        'strongly-support': 18,
      },
      comments: [],
    },
    // Post 1: スコア387.5点（施設内プロジェクト向け - 96.9% あとわずか！）
    {
      id: '4',
      type: 'improvement',
      content: '夜勤シフトの負担軽減について議論したいと思います。現在の3交代制から2交代制への移行についてご意見をお聞かせください。職員の皆さんの生活の質向上と、患者ケアの質の両立を目指したいと思います。 #シフト改善 #働き方改革',
      author: {
        id: '4',
        name: '山田看護師長',
        department: '看護部',
        role: '看護師長',
      },
      anonymityLevel: 'real',
      priority: 'high',
      timestamp: new Date(),
      votes: {
        'strongly-oppose': 2,
        'oppose': 8,
        'neutral': 30,
        'support': 45,
        'strongly-support': 20,
      },
      comments: [],
    },
    // 患者報告情報システム
    {
      id: '5',
      type: 'improvement',
      content: '患者報告情報をリアルタイムで職種間共有できるシステムを導入したいです。患者状態の変化や治療方針の変更などを即座に全スタッフが把握でき、医療の質と安全性が向上します。',
      author: {
        id: '5',
        name: '田中医師',
        department: '内科',
        role: '医師',
      },
      anonymityLevel: 'real',
      priority: 'medium',
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