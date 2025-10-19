/**
 * 組織開発インサイトページ（Level 16+：戦略企画・統括管理部門員以上）
 *
 * プロジェクトを通じた組織開発の効果測定と分析
 * - 部門間コラボレーション促進効果
 * - リーダーシップ育成効果の測定
 * - イノベーション創出の追跡
 * - 組織文化変革の指標
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network, TrendingUp, Users, Lightbulb, Award, Target, BarChart3 } from 'lucide-react';

type TabType = 'collaboration' | 'leadership' | 'innovation' | 'culture';

interface CollaborationMetric {
  departmentPair: string;
  projectCount: number;
  collaborationScore: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface LeadershipDevelopment {
  name: string;
  currentRole: string;
  projectsLed: number;
  teamSize: number;
  successRate: number; // %
  growthScore: number; // 0-100
}

interface InnovationMetric {
  category: string;
  ideasGenerated: number;
  projectsLaunched: number;
  implementationRate: number; // %
  impactScore: number; // 0-100
}

const ProjectOrgDevelopmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('collaboration');
  const [selectedPeriod, setSelectedPeriod] = useState<'quarter' | 'year' | 'all'>('quarter');

  // デモデータ：部門間コラボレーション
  const collaborationData: CollaborationMetric[] = [
    {
      departmentPair: '看護部 × 医療技術部',
      projectCount: 12,
      collaborationScore: 85,
      trend: 'up',
      trendValue: 15
    },
    {
      departmentPair: '看護部 × 事務部',
      projectCount: 8,
      collaborationScore: 72,
      trend: 'up',
      trendValue: 8
    },
    {
      departmentPair: 'リハビリ部 × 医療技術部',
      projectCount: 6,
      collaborationScore: 78,
      trend: 'stable',
      trendValue: 2
    },
    {
      departmentPair: '事務部 × 医療技術部',
      projectCount: 5,
      collaborationScore: 65,
      trend: 'down',
      trendValue: -5
    }
  ];

  // デモデータ：リーダーシップ育成
  const leadershipData: LeadershipDevelopment[] = [
    {
      name: '山田 次郎',
      currentRole: '副主任',
      projectsLed: 3,
      teamSize: 12,
      successRate: 92,
      growthScore: 88
    },
    {
      name: '佐々木 美穂',
      currentRole: '中堅（8年目）',
      projectsLed: 2,
      teamSize: 8,
      successRate: 85,
      growthScore: 82
    },
    {
      name: '高橋 健太',
      currentRole: '副師長',
      projectsLed: 4,
      teamSize: 15,
      successRate: 95,
      growthScore: 91
    }
  ];

  // デモデータ：イノベーション創出
  const innovationData: InnovationMetric[] = [
    {
      category: '業務効率化',
      ideasGenerated: 45,
      projectsLaunched: 12,
      implementationRate: 26.7,
      impactScore: 78
    },
    {
      category: '医療安全',
      ideasGenerated: 32,
      projectsLaunched: 8,
      implementationRate: 25.0,
      impactScore: 85
    },
    {
      category: '患者サービス',
      ideasGenerated: 28,
      projectsLaunched: 7,
      implementationRate: 25.0,
      impactScore: 72
    },
    {
      category: '働き方改革',
      ideasGenerated: 38,
      projectsLaunched: 10,
      implementationRate: 26.3,
      impactScore: 80
    }
  ];

  // デモデータ：組織文化指標
  const cultureMetrics = {
    participationRate: 72.5, // %
    crossDepartmentProjects: 35,
    employeeEngagement: 78, // 0-100
    innovationIndex: 82, // 0-100
    collaborationScore: 75 // 0-100
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-slate-400';
  };

  const renderCollaborationTab = () => (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Network className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">部門間プロジェクト</span>
          </div>
          <div className="text-3xl font-bold text-white">{cultureMetrics.crossDepartmentProjects}</div>
          <div className="text-xs text-green-400 mt-1">+8件 前期比</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">コラボスコア</span>
          </div>
          <div className="text-3xl font-bold text-white">{cultureMetrics.collaborationScore}</div>
          <div className="text-xs text-slate-400 mt-1">/ 100点</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">参加率</span>
          </div>
          <div className="text-3xl font-bold text-white">{cultureMetrics.participationRate}%</div>
          <div className="text-xs text-green-400 mt-1">+5.2% 前期比</div>
        </div>
      </div>

      {/* 部門間コラボレーション詳細 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          部門間コラボレーション状況
        </h3>
        <div className="space-y-3">
          {collaborationData.map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-medium">{item.departmentPair}</h4>
                  <span className="text-sm text-slate-400">{item.projectCount}件のプロジェクト</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${getTrendColor(item.trend)}`}>
                    {getTrendIcon(item.trend)} {Math.abs(item.trendValue)}%
                  </span>
                  <span className="text-sm text-cyan-400 font-medium">スコア: {item.collaborationScore}</span>
                </div>
              </div>
              {/* スコアバー */}
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${item.collaborationScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* インサイト */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="text-blue-300 font-medium mb-1">組織開発インサイト</div>
            <div className="text-sm text-blue-200/80">
              看護部と医療技術部のコラボレーションが最も活発です。事務部との連携強化により、業務効率化プロジェクトの成功率が向上する可能性があります。
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeadershipTab = () => (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">リーダー候補</div>
          <div className="text-2xl font-bold text-white">23名</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">平均成功率</div>
          <div className="text-2xl font-bold text-green-400">89%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">総プロジェクト</div>
          <div className="text-2xl font-bold text-white">67件</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">平均チーム規模</div>
          <div className="text-2xl font-bold text-white">11.5名</div>
        </div>
      </div>

      {/* リーダー詳細 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          リーダーシップ育成トラッキング
        </h3>
        <div className="space-y-4">
          {leadershipData.map((leader, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-white font-medium">{leader.name}</h4>
                    <span className="text-sm text-slate-400">{leader.currentRole}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span>プロジェクト主導: {leader.projectsLed}件</span>
                    <span>チーム規模: {leader.teamSize}名</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">成長スコア</div>
                  <div className="text-2xl font-bold text-cyan-400">{leader.growthScore}</div>
                </div>
              </div>

              {/* メトリクス */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">成功率</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${leader.successRate}%` }}
                    />
                  </div>
                  <div className="text-xs text-green-400 mt-1">{leader.successRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">成長スコア</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${leader.growthScore}%` }}
                    />
                  </div>
                  <div className="text-xs text-cyan-400 mt-1">{leader.growthScore}/100</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInnovationTab = () => (
    <div className="space-y-6">
      {/* イノベーション指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-sm text-slate-400">イノベーション指数</span>
          </div>
          <div className="text-3xl font-bold text-white">{cultureMetrics.innovationIndex}</div>
          <div className="text-xs text-slate-400 mt-1">/ 100点</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-sm text-slate-400">平均実装率</span>
          </div>
          <div className="text-3xl font-bold text-white">25.8%</div>
          <div className="text-xs text-green-400 mt-1">+3.2% 前期比</div>
        </div>
      </div>

      {/* カテゴリー別イノベーション */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          カテゴリー別イノベーション創出
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">カテゴリー</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">アイデア生成</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">プロジェクト化</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">実装率</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">影響度</th>
              </tr>
            </thead>
            <tbody>
              {innovationData.map((item) => (
                <tr key={item.category} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-white">{item.category}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{item.ideasGenerated}件</td>
                  <td className="py-3 px-4 text-right text-blue-400">{item.projectsLaunched}件</td>
                  <td className="py-3 px-4 text-right text-green-400">{item.implementationRate.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <span
                        className="block h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{ width: `${item.impactScore}%` }}
                      />
                    </span>
                    <span className="ml-2 text-xs text-slate-400">{item.impactScore}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* トレンドグラフプレースホルダー */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">イノベーション創出トレンド</h3>
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>トレンドグラフ（実装予定）</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCultureTab = () => (
    <div className="space-y-6">
      {/* 組織文化指標 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">参加率</div>
          <div className="text-3xl font-bold text-white mb-2">{cultureMetrics.participationRate}%</div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              style={{ width: `${cultureMetrics.participationRate}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">従業員エンゲージメント</div>
          <div className="text-3xl font-bold text-white mb-2">{cultureMetrics.employeeEngagement}</div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              style={{ width: `${cultureMetrics.employeeEngagement}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">コラボスコア</div>
          <div className="text-3xl font-bold text-white mb-2">{cultureMetrics.collaborationScore}</div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${cultureMetrics.collaborationScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 組織文化変革の兆候 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">組織文化変革の兆候</h3>
        <div className="space-y-4">
          {[
            { label: 'オープンなコミュニケーション', value: 82, trend: 'up' },
            { label: '部門間の協力意識', value: 75, trend: 'up' },
            { label: '継続的改善の姿勢', value: 78, trend: 'stable' },
            { label: 'イノベーションへの意欲', value: 80, trend: 'up' },
            { label: '組織への帰属意識', value: 73, trend: 'up' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">{item.label}</span>
                <span className="text-slate-400">
                  {item.value}/100
                  <span className={`ml-2 ${getTrendColor(item.trend)}`}>
                    {getTrendIcon(item.trend)}
                  </span>
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 戦略的提言 */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <div className="text-purple-300 font-medium mb-1">戦略的提言</div>
            <div className="text-sm text-purple-200/80 space-y-2">
              <p>• プロジェクト参加を通じて、組織全体のコラボレーション文化が着実に醸成されています</p>
              <p>• リーダーシップ育成プログラムとの連携により、次世代リーダーの育成が加速しています</p>
              <p>• イノベーション創出のサイクルが確立されつつあり、継続的な改善文化が根付き始めています</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Network className="w-6 h-6 text-cyan-400" />
                組織開発インサイト
              </h1>
              <p className="text-sm text-slate-400">プロジェクトを通じた組織開発の効果測定と戦略的分析</p>
            </div>
          </div>

          {/* 期間選択 */}
          <div className="flex gap-2">
            {(['quarter', 'year', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {period === 'quarter' ? '四半期' : period === 'year' ? '年間' : '全期間'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="p-6">
        {/* タブナビゲーション */}
        <div className="flex gap-2 mb-6 border-b border-slate-700/50">
          {[
            { id: 'collaboration', label: 'コラボレーション', icon: Network },
            { id: 'leadership', label: 'リーダーシップ', icon: Award },
            { id: 'innovation', label: 'イノベーション', icon: Lightbulb },
            { id: 'culture', label: '組織文化', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === id
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'collaboration' && renderCollaborationTab()}
        {activeTab === 'leadership' && renderLeadershipTab()}
        {activeTab === 'innovation' && renderInnovationTab()}
        {activeTab === 'culture' && renderCultureTab()}
      </div>
    </div>
  );
};

export default ProjectOrgDevelopmentPage;
