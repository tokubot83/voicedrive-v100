import React, { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
}

interface PostingStats {
  memberId: string;
  totalPosts: number;
  adoptedPosts: number;
  adoptionRate: number;
  lastPostDate: string;
  engagementScore: number; // 0-100
  categories: {
    improvement: number;
    community: number;
    report: number;
  };
}

interface PendingProposal {
  id: string;
  title: string;
  author: string;
  submittedDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  daysWaiting: number;
}

const TeamMemberPostingAnalytics: React.FC = () => {
  // ダミーデータ
  const teamMembers: TeamMember[] = [
    { id: '1', name: '山田太郎', position: '看護師', department: '外来' },
    { id: '2', name: '佐藤花子', position: '看護師', department: '外来' },
    { id: '3', name: '鈴木一郎', position: '医療事務', department: '外来' },
    { id: '4', name: '田中美咲', position: '薬剤師', department: '外来' },
    { id: '5', name: '高橋健太', position: '看護助手', department: '外来' },
  ];

  const postingStats: PostingStats[] = [
    {
      memberId: '1',
      totalPosts: 24,
      adoptedPosts: 18,
      adoptionRate: 75,
      lastPostDate: '2025-01-10',
      engagementScore: 92,
      categories: { improvement: 15, community: 7, report: 2 }
    },
    {
      memberId: '2',
      totalPosts: 18,
      adoptedPosts: 12,
      adoptionRate: 67,
      lastPostDate: '2025-01-08',
      engagementScore: 85,
      categories: { improvement: 10, community: 6, report: 2 }
    },
    {
      memberId: '3',
      totalPosts: 12,
      adoptedPosts: 6,
      adoptionRate: 50,
      lastPostDate: '2025-01-05',
      engagementScore: 68,
      categories: { improvement: 8, community: 3, report: 1 }
    },
    {
      memberId: '4',
      totalPosts: 8,
      adoptedPosts: 3,
      adoptionRate: 38,
      lastPostDate: '2024-12-28',
      engagementScore: 45,
      categories: { improvement: 5, community: 2, report: 1 }
    },
    {
      memberId: '5',
      totalPosts: 4,
      adoptedPosts: 1,
      adoptionRate: 25,
      lastPostDate: '2024-12-15',
      engagementScore: 32,
      categories: { improvement: 2, community: 2, report: 0 }
    }
  ];

  const pendingProposals: PendingProposal[] = [
    {
      id: '1',
      title: '夜勤シフトの効率化提案',
      author: '山田太郎',
      submittedDate: '2025-01-08',
      category: '業務改善',
      priority: 'high',
      daysWaiting: 5
    },
    {
      id: '2',
      title: '患者案内システムの改善',
      author: '佐藤花子',
      submittedDate: '2025-01-06',
      category: 'システム改善',
      priority: 'medium',
      daysWaiting: 7
    },
    {
      id: '3',
      title: '休憩室の環境改善について',
      author: '鈴木一郎',
      submittedDate: '2025-01-03',
      category: '職場環境',
      priority: 'low',
      daysWaiting: 10
    }
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'improvement' | 'community' | 'report'>('all');

  // カテゴリー別統計の計算
  const categoryTotals = postingStats.reduce((acc, stat) => {
    acc.improvement += stat.categories.improvement;
    acc.community += stat.categories.community;
    acc.report += stat.categories.report;
    return acc;
  }, { improvement: 0, community: 0, report: 0 });

  const totalPosts = categoryTotals.improvement + categoryTotals.community + categoryTotals.report;

  // エンゲージメントスコアの色を取得
  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // 採用率の色を取得
  const getAdoptionRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    if (rate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  // 優先度の色を取得
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーとフィルター */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📊</span>
            チームメンバー投稿分析
          </h2>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="week">今週</option>
              <option value="month">今月</option>
              <option value="quarter">四半期</option>
              <option value="year">年間</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="all">全カテゴリー</option>
              <option value="improvement">改善提案</option>
              <option value="community">フリースペース</option>
              <option value="report">報告</option>
            </select>
          </div>
        </div>

        {/* サマリー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{totalPosts}</div>
            <div className="text-sm text-gray-400 mt-1">総投稿数</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {Math.round((postingStats.reduce((sum, s) => sum + s.adoptedPosts, 0) / totalPosts) * 100)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">平均採用率</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Math.round(postingStats.reduce((sum, s) => sum + s.engagementScore, 0) / postingStats.length)}
            </div>
            <div className="text-sm text-gray-400 mt-1">平均エンゲージメント</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{pendingProposals.length}</div>
            <div className="text-sm text-gray-400 mt-1">未対応提案</div>
          </div>
        </div>

        {/* カテゴリー別傾向 */}
        <div className="bg-gray-700/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">カテゴリー別投稿傾向</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span className="text-sm text-gray-300">改善提案</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(categoryTotals.improvement / totalPosts) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {Math.round((categoryTotals.improvement / totalPosts) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="text-sm text-gray-300">フリースペース</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(categoryTotals.community / totalPosts) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {Math.round((categoryTotals.community / totalPosts) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <span className="text-sm text-gray-300">報告</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(categoryTotals.report / totalPosts) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {Math.round((categoryTotals.report / totalPosts) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メンバー別投稿統計 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">👥</span>
          メンバー別投稿統計
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3 pr-4">メンバー</th>
                <th className="pb-3 px-4 text-center">投稿数</th>
                <th className="pb-3 px-4 text-center">採用率</th>
                <th className="pb-3 px-4 text-center">エンゲージメント</th>
                <th className="pb-3 px-4">最終投稿</th>
                <th className="pb-3 pl-4">カテゴリー分布</th>
              </tr>
            </thead>
            <tbody>
              {postingStats.map((stat) => {
                const member = teamMembers.find(m => m.id === stat.memberId);
                if (!member) return null;
                
                return (
                  <tr key={stat.memberId} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="py-4 pr-4">
                      <div>
                        <div className="font-medium text-white">{member.name}</div>
                        <div className="text-xs text-gray-400">{member.position}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-white font-medium">{stat.totalPosts}</div>
                      <div className="text-xs text-gray-400">
                        採用 {stat.adoptedPosts}件
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`text-lg font-bold ${getAdoptionRateColor(stat.adoptionRate)}`}>
                        {stat.adoptionRate}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`text-lg font-bold ${getEngagementColor(stat.engagementScore)}`}>
                        {stat.engagementScore}
                      </div>
                      <div className="text-xs text-gray-400">/ 100</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-300">
                        {new Date(stat.lastPostDate).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor((new Date().getTime() - new Date(stat.lastPostDate).getTime()) / (1000 * 60 * 60 * 24))}日前
                      </div>
                    </td>
                    <td className="py-4 pl-4">
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          改善 {stat.categories.improvement}
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                          交流 {stat.categories.community}
                        </span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                          報告 {stat.categories.report}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 未対応の提案リスト */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">⏳</span>
          未対応の提案リスト
        </h3>
        <div className="space-y-3">
          {pendingProposals.map((proposal) => (
            <div key={proposal.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{proposal.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>投稿者: {proposal.author}</span>
                    <span>カテゴリー: {proposal.category}</span>
                    <span>投稿日: {new Date(proposal.submittedDate).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(proposal.priority)}`}>
                    {proposal.priority === 'high' ? '高' : proposal.priority === 'medium' ? '中' : '低'}優先度
                  </span>
                  <span className="text-xs text-orange-400">
                    {proposal.daysWaiting}日間待機中
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                  詳細確認
                </button>
                <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                  フィードバック
                </button>
                <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                  承認推薦
                </button>
              </div>
            </div>
          ))}
          
          {pendingProposals.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              現在、未対応の提案はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberPostingAnalytics;