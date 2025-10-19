/**
 * プロジェクト人材分析ページ（Level 14+：人事部門員以上）
 *
 * プロジェクトを通じた人材育成・活用状況の可視化
 * - プロジェクトメンバーの職種・世代・階層分布
 * - プロジェクト参加率（部門別、職種別、世代別）
 * - 人材育成効果の測定
 * - チーム構成の多様性分析
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, BarChart3, PieChart, Award, Target } from 'lucide-react';

type TabType = 'overview' | 'distribution' | 'participation' | 'development';

interface TalentMetrics {
  totalParticipants: number;
  averageProjectsPerPerson: number;
  diversityScore: number; // 0-100
  growthRate: number; // %
}

interface DepartmentParticipation {
  department: string;
  totalMembers: number;
  activeParticipants: number;
  participationRate: number;
  averageProjects: number;
}

const ProjectTalentAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');

  // デモデータ
  const metrics: TalentMetrics = {
    totalParticipants: 487,
    averageProjectsPerPerson: 2.3,
    diversityScore: 78,
    growthRate: 12.5
  };

  const departmentData: DepartmentParticipation[] = [
    { department: '看護部', totalMembers: 320, activeParticipants: 245, participationRate: 76.6, averageProjects: 2.5 },
    { department: '医療技術部', totalMembers: 180, activeParticipants: 128, participationRate: 71.1, averageProjects: 2.1 },
    { department: '事務部', totalMembers: 95, activeParticipants: 58, participationRate: 61.1, averageProjects: 1.8 },
    { department: 'リハビリ部', totalMembers: 75, activeParticipants: 56, participationRate: 74.7, averageProjects: 2.4 },
  ];

  const professionData = [
    { profession: '看護師', count: 245, percentage: 50.3 },
    { profession: '医師', count: 42, percentage: 8.6 },
    { profession: '薬剤師', count: 38, percentage: 7.8 },
    { profession: '理学療法士', count: 35, percentage: 7.2 },
    { profession: '作業療法士', count: 28, percentage: 5.7 },
    { profession: 'その他', count: 99, percentage: 20.4 },
  ];

  const generationData = [
    { generation: '20代', count: 142, percentage: 29.2, growth: '+15%' },
    { generation: '30代', count: 189, percentage: 38.8, growth: '+8%' },
    { generation: '40代', count: 112, percentage: 23.0, growth: '+5%' },
    { generation: '50代以上', count: 44, percentage: 9.0, growth: '+22%' },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* メトリクスカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">総参加者数</span>
          </div>
          <div className="text-3xl font-bold text-white">{metrics.totalParticipants}</div>
          <div className="text-xs text-green-400 mt-1">+{metrics.growthRate}% 前期比</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">平均参加数</span>
          </div>
          <div className="text-3xl font-bold text-white">{metrics.averageProjectsPerPerson}</div>
          <div className="text-xs text-slate-400 mt-1">プロジェクト/人</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <PieChart className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-sm text-slate-400">多様性スコア</span>
          </div>
          <div className="text-3xl font-bold text-white">{metrics.diversityScore}</div>
          <div className="text-xs text-slate-400 mt-1">/ 100点</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">成長率</span>
          </div>
          <div className="text-3xl font-bold text-white">+{metrics.growthRate}%</div>
          <div className="text-xs text-slate-400 mt-1">前期比</div>
        </div>
      </div>

      {/* 職種別分布 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          職種別プロジェクト参加状況
        </h3>
        <div className="space-y-3">
          {professionData.map((item) => (
            <div key={item.profession}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{item.profession}</span>
                <span className="text-slate-400">{item.count}名 ({item.percentage}%)</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 世代別参加状況 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          世代別プロジェクト参加状況
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {generationData.map((item) => (
            <div key={item.generation} className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-2">{item.generation}</div>
              <div className="text-2xl font-bold text-white mb-1">{item.count}名</div>
              <div className="text-xs text-slate-400">{item.percentage}%</div>
              <div className="text-xs text-green-400 mt-2">{item.growth} 前期比</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDistributionTab = () => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">部門別プロジェクト参加状況</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">部門</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">総人数</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">参加者数</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">参加率</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">平均参加数</th>
            </tr>
          </thead>
          <tbody>
            {departmentData.map((dept) => (
              <tr key={dept.department} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-4 text-white">{dept.department}</td>
                <td className="py-3 px-4 text-right text-slate-300">{dept.totalMembers}</td>
                <td className="py-3 px-4 text-right text-blue-400">{dept.activeParticipants}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-medium ${dept.participationRate >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {dept.participationRate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-slate-300">{dept.averageProjects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderParticipationTab = () => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">プロジェクト参加トレンド</h3>
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>参加トレンドグラフ（実装予定）</p>
        </div>
      </div>
    </div>
  );

  const renderDevelopmentTab = () => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">人材育成効果</h3>
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>育成効果分析（実装予定）</p>
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
                <Users className="w-6 h-6 text-blue-400" />
                プロジェクト人材分析
              </h1>
              <p className="text-sm text-slate-400">プロジェクトを通じた人材育成・活用状況の可視化</p>
            </div>
          </div>

          {/* 期間選択 */}
          <div className="flex gap-2">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {period === 'month' ? '今月' : period === 'quarter' ? '四半期' : '年間'}
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
            { id: 'overview', label: '概要', icon: BarChart3 },
            { id: 'distribution', label: '部門別分布', icon: PieChart },
            { id: 'participation', label: '参加トレンド', icon: TrendingUp },
            { id: 'development', label: '育成効果', icon: Award },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'distribution' && renderDistributionTab()}
        {activeTab === 'participation' && renderParticipationTab()}
        {activeTab === 'development' && renderDevelopmentTab()}
      </div>
    </div>
  );
};

export default ProjectTalentAnalyticsPage;
