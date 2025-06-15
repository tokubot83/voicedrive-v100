import React, { useState } from 'react';

interface TeamData {
  id: string;
  name: string;
  leader: string;
  memberCount: number;
  totalPosts: number;
  adoptedPosts: number;
  adoptionRate: number;
  avgEngagement: number;
  lastActivityDays: number;
}

interface TeamLeaderPerformance {
  leaderId: string;
  leaderName: string;
  teamName: string;
  postingCulture: number; // 0-100
  memberDevelopment: number; // 0-100
  innovationScore: number; // 0-100
  bestPractices: string[];
}

interface ProposalQuality {
  category: string;
  count: number;
  adoptionRate: number;
  avgImpactScore: number;
  strategicAlignment: number; // 0-100
}

interface EngagementHealth {
  totalActivePosters: number;
  newPostersThisMonth: number;
  inactiveMembers: number;
  postingDistribution: {
    heavy: number; // >10 posts/month
    moderate: number; // 5-10 posts/month
    light: number; // 1-4 posts/month
    none: number; // 0 posts/month
  };
}

interface CrossTeamIssue {
  id: string;
  issue: string;
  teams: string[];
  mentions: number;
  priority: 'high' | 'medium' | 'low';
  requiresEscalation: boolean;
}

const DepartmentPostingAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [activeView, setActiveView] = useState<'overview' | 'teams' | 'quality' | 'health' | 'issues'>('overview');

  // ダミーデータ
  const teamsData: TeamData[] = [
    {
      id: '1',
      name: '外来看護チーム',
      leader: '山田太郎',
      memberCount: 12,
      totalPosts: 156,
      adoptedPosts: 98,
      adoptionRate: 62.8,
      avgEngagement: 85,
      lastActivityDays: 1
    },
    {
      id: '2',
      name: '病棟看護チーム',
      leader: '佐藤花子',
      memberCount: 18,
      totalPosts: 234,
      adoptedPosts: 156,
      adoptionRate: 66.7,
      avgEngagement: 78,
      lastActivityDays: 0
    },
    {
      id: '3',
      name: '医療技術チーム',
      leader: '鈴木一郎',
      memberCount: 8,
      totalPosts: 89,
      adoptedPosts: 67,
      adoptionRate: 75.3,
      avgEngagement: 92,
      lastActivityDays: 2
    },
    {
      id: '4',
      name: '事務管理チーム',
      leader: '田中美咲',
      memberCount: 6,
      totalPosts: 45,
      adoptedPosts: 23,
      adoptionRate: 51.1,
      avgEngagement: 65,
      lastActivityDays: 5
    }
  ];

  const teamLeaderPerformance: TeamLeaderPerformance[] = [
    {
      leaderId: '1',
      leaderName: '山田太郎',
      teamName: '外来看護チーム',
      postingCulture: 92,
      memberDevelopment: 88,
      innovationScore: 85,
      bestPractices: ['週次アイデア会議', '1on1での投稿フォロー']
    },
    {
      leaderId: '2',
      leaderName: '佐藤花子',
      teamName: '病棟看護チーム',
      postingCulture: 85,
      memberDevelopment: 82,
      innovationScore: 78,
      bestPractices: ['月次表彰制度', 'ペアでの提案作成']
    },
    {
      leaderId: '3',
      leaderName: '鈴木一郎',
      teamName: '医療技術チーム',
      postingCulture: 95,
      memberDevelopment: 90,
      innovationScore: 93,
      bestPractices: ['技術勉強会での共有', '失敗事例の積極的共有']
    },
    {
      leaderId: '4',
      leaderName: '田中美咲',
      teamName: '事務管理チーム',
      postingCulture: 68,
      memberDevelopment: 65,
      innovationScore: 60,
      bestPractices: ['改善提案テンプレート活用']
    }
  ];

  const proposalQuality: ProposalQuality[] = [
    { category: '業務効率化', count: 145, adoptionRate: 72, avgImpactScore: 85, strategicAlignment: 90 },
    { category: '患者サービス', count: 98, adoptionRate: 68, avgImpactScore: 78, strategicAlignment: 95 },
    { category: 'コスト削減', count: 67, adoptionRate: 58, avgImpactScore: 82, strategicAlignment: 88 },
    { category: '職場環境', count: 89, adoptionRate: 65, avgImpactScore: 70, strategicAlignment: 75 },
    { category: 'システム改善', count: 125, adoptionRate: 55, avgImpactScore: 88, strategicAlignment: 85 }
  ];

  const engagementHealth: EngagementHealth = {
    totalActivePosters: 38,
    newPostersThisMonth: 5,
    inactiveMembers: 6,
    postingDistribution: {
      heavy: 8,
      moderate: 15,
      light: 15,
      none: 6
    }
  };

  const crossTeamIssues: CrossTeamIssue[] = [
    {
      id: '1',
      issue: '患者情報システムの入力負荷',
      teams: ['外来看護', '病棟看護', '医療技術'],
      mentions: 12,
      priority: 'high',
      requiresEscalation: true
    },
    {
      id: '2',
      issue: 'シフト調整の非効率性',
      teams: ['外来看護', '病棟看護'],
      mentions: 8,
      priority: 'high',
      requiresEscalation: false
    },
    {
      id: '3',
      issue: '備品管理システムの改善',
      teams: ['医療技術', '事務管理'],
      mentions: 5,
      priority: 'medium',
      requiresEscalation: false
    }
  ];

  // 集計値の計算
  const totalPosts = teamsData.reduce((sum, team) => sum + team.totalPosts, 0);
  const totalAdopted = teamsData.reduce((sum, team) => sum + team.adoptedPosts, 0);
  const overallAdoptionRate = (totalAdopted / totalPosts) * 100;
  const avgTeamEngagement = teamsData.reduce((sum, team) => sum + team.avgEngagement, 0) / teamsData.length;

  return (
    <div className="space-y-6">
      {/* ヘッダーとナビゲーション */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📊</span>
            部門投稿活動分析
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="month">今月</option>
            <option value="quarter">四半期</option>
            <option value="year">年間</option>
          </select>
        </div>

        {/* サブナビゲーション */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'overview', label: '概要', icon: '📈' },
            { id: 'teams', label: 'チーム別', icon: '👥' },
            { id: 'quality', label: '提案品質', icon: '⭐' },
            { id: 'health', label: '健全性', icon: '💚' },
            { id: 'issues', label: '共通課題', icon: '🔍' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeView === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab?.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 概要ビュー */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* KPIカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-blue-400">{totalPosts}</div>
              <div className="text-sm text-gray-400 mt-1">総投稿数</div>
              <div className="text-xs text-green-400 mt-2">前期比 +15%</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-green-400">{overallAdoptionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400 mt-1">採用率</div>
              <div className="text-xs text-green-400 mt-2">目標値: 60%</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-purple-400">{avgTeamEngagement.toFixed(0)}</div>
              <div className="text-sm text-gray-400 mt-1">平均エンゲージメント</div>
              <div className="text-xs text-yellow-400 mt-2">前期比 +3pt</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-yellow-400">{crossTeamIssues.filter(i => i.requiresEscalation).length}</div>
              <div className="text-sm text-gray-400 mt-1">要エスカレーション</div>
              <div className="text-xs text-red-400 mt-2">早急な対応が必要</div>
            </div>
          </div>

          {/* チーム活性度ランキング */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">チーム投稿活性度ランキング</h3>
            <div className="space-y-3">
              {[...teamsData].sort((a, b) => b.avgEngagement - a.avgEngagement).map((team, index) => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{team.name}</div>
                      <div className="text-sm text-gray-400">リーダー: {team.leader}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">{team.avgEngagement}</div>
                    <div className="text-xs text-gray-400">エンゲージメント</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* チーム別詳細ビュー */}
      {activeView === 'teams' && (
        <div className="space-y-6">
          {/* チーム比較テーブル */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 overflow-x-auto">
            <h3 className="text-lg font-bold text-white mb-4">チーム別投稿統計</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">チーム</th>
                  <th className="pb-3 px-4 text-center">メンバー数</th>
                  <th className="pb-3 px-4 text-center">投稿数</th>
                  <th className="pb-3 px-4 text-center">採用率</th>
                  <th className="pb-3 px-4 text-center">エンゲージメント</th>
                  <th className="pb-3 pl-4">投稿/人</th>
                </tr>
              </thead>
              <tbody>
                {teamsData.map(team => (
                  <tr key={team.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-4 pr-4">
                      <div>
                        <div className="font-medium text-white">{team.name}</div>
                        <div className="text-xs text-gray-400">{team.leader}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-white">{team.memberCount}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-white font-medium">{team.totalPosts}</div>
                      <div className="text-xs text-gray-400">採用 {team.adoptedPosts}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`text-lg font-bold ${
                        team.adoptionRate >= 70 ? 'text-green-400' :
                        team.adoptionRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {team.adoptionRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`text-lg font-bold ${
                        team.avgEngagement >= 80 ? 'text-green-400' :
                        team.avgEngagement >= 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {team.avgEngagement}
                      </div>
                    </td>
                    <td className="py-4 pl-4">
                      <div className="text-white">{(team.totalPosts / team.memberCount).toFixed(1)}</div>
                      <div className="text-xs text-gray-400">月平均</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* チームリーダーパフォーマンス */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">チームリーダー育成評価</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamLeaderPerformance.map(leader => (
                <div key={leader.leaderId} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{leader.leaderName}</h4>
                      <p className="text-sm text-gray-400">{leader.teamName}</p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      leader.innovationScore >= 85 ? 'text-green-400' :
                      leader.innovationScore >= 70 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {leader.innovationScore}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">投稿文化醸成</span>
                      <span className="text-white">{leader.postingCulture}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">メンバー育成</span>
                      <span className="text-white">{leader.memberDevelopment}%</span>
                    </div>
                  </div>

                  {leader.bestPractices.length > 0 && (
                    <div className="pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-400 mb-1">ベストプラクティス:</p>
                      <div className="flex flex-wrap gap-1">
                        {leader.bestPractices.map((practice, idx) => (
                          <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            {practice}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 提案品質分析ビュー */}
      {activeView === 'quality' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">カテゴリー別提案品質</h3>
            <div className="space-y-3">
              {proposalQuality.map(quality => (
                <div key={quality.category} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{quality.category}</h4>
                    <span className="text-sm text-gray-400">{quality.count}件</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${
                        quality.adoptionRate >= 65 ? 'text-green-400' :
                        quality.adoptionRate >= 55 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {quality.adoptionRate}%
                      </div>
                      <div className="text-xs text-gray-400">採用率</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${
                        quality.avgImpactScore >= 80 ? 'text-purple-400' :
                        quality.avgImpactScore >= 70 ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {quality.avgImpactScore}
                      </div>
                      <div className="text-xs text-gray-400">影響度</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${
                        quality.strategicAlignment >= 85 ? 'text-cyan-400' :
                        quality.strategicAlignment >= 75 ? 'text-teal-400' : 'text-gray-400'
                      }`}>
                        {quality.strategicAlignment}
                      </div>
                      <div className="text-xs text-gray-400">戦略整合性</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">総合評価</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${
                            i < Math.round((quality.adoptionRate + quality.avgImpactScore + quality.strategicAlignment) / 60)
                              ? 'text-yellow-400' : 'text-gray-600'
                          }`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* エンゲージメント健全性ビュー */}
      {activeView === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-green-400">{engagementHealth.totalActivePosters}</div>
              <div className="text-sm text-gray-400 mt-1">アクティブ投稿者</div>
              <div className="text-xs text-gray-500 mt-2">全体の86%</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-blue-400">{engagementHealth.newPostersThisMonth}</div>
              <div className="text-sm text-gray-400 mt-1">新規投稿者</div>
              <div className="text-xs text-green-400 mt-2">今月増加</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-orange-400">{engagementHealth.inactiveMembers}</div>
              <div className="text-sm text-gray-400 mt-1">長期未投稿者</div>
              <div className="text-xs text-red-400 mt-2">要フォロー</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-purple-400">
                {((engagementHealth.postingDistribution.heavy / 44) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400 mt-1">積極的投稿者率</div>
              <div className="text-xs text-gray-500 mt-2">10件以上/月</div>
            </div>
          </div>

          {/* 投稿分布分析 */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">投稿頻度分布</h3>
            <div className="space-y-3">
              {[
                { label: 'ヘビーユーザー (10件以上/月)', count: engagementHealth.postingDistribution.heavy, color: 'bg-green-400' },
                { label: 'モデレートユーザー (5-9件/月)', count: engagementHealth.postingDistribution.moderate, color: 'bg-blue-400' },
                { label: 'ライトユーザー (1-4件/月)', count: engagementHealth.postingDistribution.light, color: 'bg-yellow-400' },
                { label: '未投稿者 (0件/月)', count: engagementHealth.postingDistribution.none, color: 'bg-red-400' }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className="text-white font-medium">{item.count}名</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`${item.color || 'bg-gray-400'} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(item.count / 44) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ 投稿が特定メンバーに偏っている可能性があります。
                ライトユーザーへの支援強化を推奨します。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 共通課題ビュー */}
      {activeView === 'issues' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">部門横断的な課題</h3>
            <div className="space-y-3">
              {crossTeamIssues.map(issue => (
                <div key={issue.id} className={`rounded-lg p-4 border ${
                  issue.requiresEscalation 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-gray-700/30 border-gray-700/50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white mb-1">{issue.issue}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>関連チーム: {issue.teams.join('、')}</span>
                        <span>言及数: {issue.mentions}回</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        issue.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        issue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {issue.priority === 'high' ? '高' : issue.priority === 'medium' ? '中' : '低'}優先度
                      </span>
                      {issue.requiresEscalation && (
                        <span className="text-xs text-red-400 font-medium">
                          要エスカレーション
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      詳細分析
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      対策検討
                    </button>
                    {issue.requiresEscalation && (
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                        上位承認申請
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 共通課題の早期発見により、部門全体の効率改善が期待できます。
                定期的な課題レビュー会議の開催を推奨します。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPostingAnalytics;