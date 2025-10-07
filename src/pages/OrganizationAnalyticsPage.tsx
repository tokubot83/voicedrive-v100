/**
 * 組織分析ページ（議題モード最適化版）
 * Level 15+（人事各部門長以上）専用
 *
 * 議題化プロセスの分析と組織の声の可視化
 * 投稿の追跡・投稿管理との整合性を保ちながら、
 * より高度な戦略的インサイトを提供
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Building2,
  Briefcase,
  Target,
  Activity,
  Award,
  Filter
} from 'lucide-react';

const OrganizationAnalyticsPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 議題化プロセスのデータ
  const agendaProgress = {
    departmentLevel: 45,    // 部署内議題
    facilityLevel: 23,      // 施設議題
    corporateLevel: 12,     // 法人議題
    committeeSubmitted: 8,  // 委員会提出済み
    resolved: 15            // 決議済み
  };

  // 部門別活性度データ
  const departmentActivity = [
    { name: '医療療養病棟', posts: 42, agenda: 8, engagement: 85, trend: 'up' },
    { name: '回復期リハ病棟', posts: 38, agenda: 6, engagement: 78, trend: 'up' },
    { name: '外来・健診センター', posts: 28, agenda: 4, engagement: 72, trend: 'stable' },
    { name: '訪問看護', posts: 25, agenda: 5, engagement: 68, trend: 'up' },
    { name: '事務部門', posts: 18, agenda: 3, engagement: 55, trend: 'down' },
    { name: 'リハビリ部門', posts: 22, agenda: 4, engagement: 62, trend: 'stable' },
  ];

  // 議題カテゴリ別データ
  const categoryData = [
    { id: 'hr', name: '人事・採用', count: 28, resolved: 12, color: 'text-blue-400 bg-blue-500/20' },
    { id: 'education', name: '教育・研修', count: 22, resolved: 10, color: 'text-purple-400 bg-purple-500/20' },
    { id: 'workflow', name: '業務改善', count: 35, resolved: 18, color: 'text-green-400 bg-green-500/20' },
    { id: 'environment', name: '労働環境', count: 18, resolved: 8, color: 'text-orange-400 bg-orange-500/20' },
    { id: 'safety', name: '医療安全', count: 15, resolved: 9, color: 'text-red-400 bg-red-500/20' },
    { id: 'communication', name: 'コミュニケーション', count: 12, resolved: 5, color: 'text-teal-400 bg-teal-500/20' },
  ];

  // 委員会活動の効果測定
  const committeeEffectiveness = {
    submitted: 32,
    reviewed: 28,
    approved: 21,
    implemented: 15,
    avgReviewDays: 12,
    avgImplementDays: 45,
  };

  // 組織健康度指標
  const organizationHealth = {
    voiceActivity: 82,        // 声の活性度
    participationRate: 68,    // 参加率
    resolutionRate: 55,       // 解決率
    engagementScore: 74,      // エンゲージメントスコア
    crossDeptCollaboration: 61 // 部門間連携
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return <ArrowRight className="w-4 h-4 text-gray-400" />;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ヘッダー */}
      <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors"
              >
                <span className="text-xl">←</span>
                <span>ホーム</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600/20 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">📊 組織分析</h1>
                  <p className="text-slate-400 mt-1">
                    議題化プロセスと組織の声の戦略的分析
                  </p>
                </div>
              </div>
            </div>

            {/* 期間選択 */}
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedPeriod === period
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  {period === 'week' && '週次'}
                  {period === 'month' && '月次'}
                  {period === 'quarter' && '四半期'}
                </button>
              ))}
            </div>
          </div>

          {/* レベル15専用バッジ */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
            <Award className="w-4 h-4" />
            <span>人事各部門長専用ダッシュボード</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 組織健康度指標 */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">組織健康度指標</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: '声の活性度', value: organizationHealth.voiceActivity, icon: MessageSquare },
              { label: '参加率', value: organizationHealth.participationRate, icon: Users },
              { label: '解決率', value: organizationHealth.resolutionRate, icon: CheckCircle },
              { label: 'エンゲージメント', value: organizationHealth.engagementScore, icon: Target },
              { label: '部門間連携', value: organizationHealth.crossDeptCollaboration, icon: Building2 },
            ].map((metric, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <metric.icon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-400">{metric.label}</span>
                </div>
                <div className={`text-3xl font-bold ${getHealthColor(metric.value)}`}>
                  {metric.value}
                  <span className="text-lg">%</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      metric.value >= 80 ? 'bg-green-500' :
                      metric.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 議題化プロセス */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 議題進捗フロー */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <ArrowRight className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">議題化プロセスの進捗</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: '部署内議題', value: agendaProgress.departmentLevel, icon: Users, color: 'blue' },
                { label: '施設議題', value: agendaProgress.facilityLevel, icon: Building2, color: 'purple' },
                { label: '法人議題', value: agendaProgress.corporateLevel, icon: Briefcase, color: 'indigo' },
                { label: '委員会提出済み', value: agendaProgress.committeeSubmitted, icon: CheckCircle, color: 'green' },
                { label: '決議済み', value: agendaProgress.resolved, icon: Award, color: 'emerald' },
              ].map((stage, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 bg-${stage.color}-600/20 rounded-lg`}>
                      <stage.icon className={`w-5 h-5 text-${stage.color}-400`} />
                    </div>
                    <span className="text-slate-300">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">{stage.value}</span>
                    <span className="text-sm text-slate-400">件</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 委員会活動の効果測定 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-white">委員会活動の効果測定</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: '提出', value: committeeEffectiveness.submitted, color: 'blue' },
                { label: '審議完了', value: committeeEffectiveness.reviewed, color: 'purple' },
                { label: '承認', value: committeeEffectiveness.approved, color: 'green' },
                { label: '実装済み', value: committeeEffectiveness.implemented, color: 'emerald' },
              ].map((metric, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
                  <div className={`text-3xl font-bold text-${metric.color}-400`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">平均審議期間</span>
                </div>
                <span className="text-white font-semibold">{committeeEffectiveness.avgReviewDays}日</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">平均実装期間</span>
                </div>
                <span className="text-white font-semibold">{committeeEffectiveness.avgImplementDays}日</span>
              </div>
            </div>
          </div>
        </div>

        {/* 議題カテゴリ別分析 */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">議題カテゴリ別分析</h2>
            </div>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              すべて表示
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.map((category) => (
              <div
                key={category.id}
                className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-900/70 transition-colors cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 ${category.color} rounded-full mb-3`}>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white">{category.count}</div>
                    <div className="text-xs text-slate-400">総議題数</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">{category.resolved}</div>
                    <div className="text-xs text-slate-400">解決済み</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>解決率</span>
                    <span>{Math.round((category.resolved / category.count) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(category.resolved / category.count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 部門別活性度 */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-bold text-white">部門別の声の活性度</h2>
          </div>
          <div className="space-y-3">
            {departmentActivity.map((dept, index) => (
              <div
                key={index}
                className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{dept.name}</span>
                    {getTrendIcon(dept.trend)}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-400">投稿数</div>
                      <div className="text-lg font-bold text-white">{dept.posts}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">議題化</div>
                      <div className="text-lg font-bold text-indigo-400">{dept.agenda}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">活性度</div>
                      <div className={`text-lg font-bold ${getHealthColor(dept.engagement)}`}>
                        {dept.engagement}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      dept.engagement >= 80 ? 'bg-green-500' :
                      dept.engagement >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.engagement}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 戦略的インサイト */}
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-xl p-6 border border-indigo-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">戦略的インサイト（AI分析）</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">注目ポイント</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    事務部門の活性度が55%に低下。採用・教育関連の議題が増加傾向にあり、
                    人材確保と育成の課題が表面化している可能性があります。
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">ポジティブな動き</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    医療療養病棟と回復期リハ病棟で活性度が上昇。議題の解決率も向上しており、
                    委員会活動が効果的に機能しています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationAnalyticsPage;
