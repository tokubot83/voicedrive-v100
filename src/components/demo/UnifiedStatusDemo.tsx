import React from 'react';
import VotingSection from '../VotingSection';
import { Post } from '../../types';

const UnifiedStatusDemo: React.FC = () => {
  // Sample post data
  const samplePost: Post = {
    id: 'demo-1',
    type: 'improvement',
    content: 'リハビリ室の業務効率化のため、電子カルテシステムと連携した新しいスケジュール管理システムを導入したいです。これにより、患者の予約管理が自動化され、職員の負担が大幅に軽減されると考えています。',
    author: {
      id: 'user-1',
      name: '山田太郎',
      department: 'リハビリテーション科',
      role: '理学療法士'
    },
    anonymityLevel: 'real',
    priority: 'high',
    timestamp: new Date(),
    votes: {
      'strongly-oppose': 5,
      'oppose': 8,
      'neutral': 15,
      'support': 32,
      'strongly-support': 28
    },
    comments: [],
    projectStatus: 'active'
  };

  const handleVote = (postId: string, option: string) => {
    console.log(`Voted ${option} on post ${postId}`);
  };

  const handleComment = (postId: string) => {
    console.log(`Comment on post ${postId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          統一ステータス表示 & 投票UI最適化デモ
        </h1>

        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-6">
            投稿の詳細表示
          </h2>

          {/* Post Content */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {samplePost.author.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{samplePost.author.name}</span>
                  <span className="text-blue-400 text-sm">@{samplePost.author.role}</span>
                </div>
                <div className="text-gray-400 text-sm">{samplePost.author.department}</div>
              </div>
            </div>
            <p className="text-gray-100 leading-relaxed">{samplePost.content}</p>
          </div>

          {/* Voting Section */}
          <VotingSection
            post={samplePost}
            onVote={handleVote}
            onComment={handleComment}
          />
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-3">🔄 合意形成状況</h3>
            <p className="text-gray-400">
              直感的な円形プログレスバーで合意度を表示。専門職支持や世代別の関心度などのインサイトも提供。
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-3">⚡ 承認プロセス</h3>
            <p className="text-gray-400">
              承認フローの進捗状況を視覚的に表示。現在の承認レベルと残り時間を一目で確認可能。
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-3">🚀 プロジェクト進捗</h3>
            <p className="text-gray-400">
              プロジェクト化された案件の進捗状況、予算執行率、チーム情報などを統合表示。
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-semibold text-blue-400 mb-3">✨ 新UIの特徴</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>感情的でわかりやすい5段階の投票ボタン（😠😕😐😊😍）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>投票分布をリアルタイムで可視化するカラフルなプログレスバー</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>展開可能な詳細情報で、必要な時だけ詳しい情報を表示</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>モバイルフレンドリーなレスポンシブデザイン</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnifiedStatusDemo;