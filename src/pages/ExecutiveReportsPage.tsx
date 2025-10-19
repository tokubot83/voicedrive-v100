/**
 * エグゼクティブレポートページ（議題モード最適化版）
 * Level 16+（戦略企画・統括管理部門員以上）専用
 *
 * 理事会・経営層向けの議題化プロセスレポート作成
 * 投稿追跡・組織分析データを統合したエグゼクティブサマリー
 * 戦略企画部門員の人事業務サポート機能
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  Building2,
  Target,
  BarChart3,
  Award,
  Clock,
  FileSpreadsheet,
  Presentation,
  Eye,
  Filter
} from 'lucide-react';

const ExecutiveReportsPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // 月次KPIサマリー
  const monthlyKPIs = {
    totalPosts: 342,
    agendaCreated: 85,
    committeeSubmitted: 28,
    resolved: 45,
    participationRate: 68,
    resolutionRate: 53,
    avgResolutionDays: 42
  };

  // レポートテンプレート
  const reportTemplates = [
    {
      id: 'monthly_summary',
      title: '月次議題化プロセスレポート',
      icon: Calendar,
      description: '当月の議題化活動・委員会成果・人事課題を総括',
      pages: 8,
      lastGenerated: '2025-10-01',
      status: 'ready'
    },
    {
      id: 'quarterly_hr',
      title: '四半期人事戦略レポート',
      icon: Users,
      description: '人材育成・組織開発の進捗と次期計画',
      pages: 15,
      lastGenerated: '2025-10-01',
      status: 'ready'
    },
    {
      id: 'board_presentation',
      title: '理事会プレゼンテーション資料',
      icon: Presentation,
      description: '理事会向け要約資料（スライド形式）',
      pages: 12,
      lastGenerated: '2025-09-28',
      status: 'ready'
    },
    {
      id: 'committee_effectiveness',
      title: '委員会活動効果測定レポート',
      icon: Target,
      description: '委員会の意思決定速度・実装率の分析',
      pages: 10,
      lastGenerated: '2025-10-01',
      status: 'ready'
    },
    {
      id: 'dept_performance',
      title: '部門別パフォーマンスレポート',
      icon: Building2,
      description: '声の活性度・議題化率・解決率の部門比較',
      pages: 12,
      lastGenerated: '2025-10-01',
      status: 'ready'
    },
    {
      id: 'strategic_insights',
      title: '戦略的HR課題レポート',
      icon: TrendingUp,
      description: 'AI分析による組織課題と改善提案',
      pages: 14,
      lastGenerated: '2025-09-30',
      status: 'draft'
    }
  ];

  // 最近の重要トピック
  const keyTopics = [
    {
      category: '人事・採用',
      title: '看護師確保策の効果検証',
      priority: 'high',
      status: '委員会承認済み',
      impact: '採用目標達成率20%向上見込み'
    },
    {
      category: '教育・研修',
      title: '新人育成プログラム改善',
      priority: 'medium',
      status: '実装中',
      impact: '離職率3%削減実績'
    },
    {
      category: '業務改善',
      title: '記録業務デジタル化推進',
      priority: 'high',
      status: '審議中',
      impact: '業務時間15%削減見込み'
    },
    {
      category: '労働環境',
      title: '休憩室環境改善プロジェクト',
      priority: 'medium',
      status: '決議済み',
      impact: '職員満足度8ポイント向上'
    }
  ];

  // 次回理事会アジェンダ
  const boardAgenda = [
    { item: '人材確保戦略の進捗報告', duration: '15分', presenter: '人事部門長' },
    { item: '組織風土改善施策の効果検証', duration: '20分', presenter: '戦略企画部門員' },
    { item: '医療安全委員会からの提言事項', duration: '10分', presenter: '医療安全委員長' },
    { item: '次年度予算案（人件費）', duration: '25分', presenter: '事務局長' }
  ];

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'text-red-400 bg-red-500/20';
    if (priority === 'medium') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-blue-400 bg-blue-500/20';
  };

  const getStatusColor = (status: string) => {
    if (status === 'ready') return 'text-green-400';
    if (status === 'draft') return 'text-yellow-400';
    return 'text-gray-400';
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
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">📋 エグゼクティブレポート</h1>
                  <p className="text-slate-400 mt-1">
                    理事会・経営層向け議題化プロセスレポート
                  </p>
                </div>
              </div>
            </div>

            {/* 期間選択 */}
            <div className="flex gap-2">
              {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedPeriod === period
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  {period === 'monthly' && '月次'}
                  {period === 'quarterly' && '四半期'}
                  {period === 'yearly' && '年次'}
                </button>
              ))}
            </div>
          </div>

          {/* レベル16専用バッジ */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-sm text-indigo-300">
            <Award className="w-4 h-4" />
            <span>戦略企画・統括管理部門員専用</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPIサマリー */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">今月のKPIサマリー</h2>
            </div>
            <span className="text-sm text-slate-400">2025年10月</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: '総投稿数', value: monthlyKPIs.totalPosts, icon: FileText, color: 'blue' },
              { label: '議題化', value: monthlyKPIs.agendaCreated, icon: Target, color: 'indigo' },
              { label: '委員会提出', value: monthlyKPIs.committeeSubmitted, icon: Building2, color: 'purple' },
              { label: '決議済み', value: monthlyKPIs.resolved, icon: CheckCircle, color: 'green' },
              { label: '参加率', value: `${monthlyKPIs.participationRate}%`, icon: Users, color: 'teal' },
              { label: '解決率', value: `${monthlyKPIs.resolutionRate}%`, icon: Award, color: 'emerald' },
              { label: '平均解決日数', value: `${monthlyKPIs.avgResolutionDays}日`, icon: Clock, color: 'orange' }
            ].map((kpi, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={`w-5 h-5 text-${kpi.color}-400`} />
                  <span className="text-xs text-slate-400">{kpi.label}</span>
                </div>
                <div className={`text-2xl font-bold text-${kpi.color}-400`}>{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* レポートテンプレート */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">レポートテンプレート</h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm">カスタムレポート作成</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-slate-900/50 rounded-lg p-5 hover:bg-slate-900/70 transition-colors cursor-pointer border border-slate-700 hover:border-indigo-500/50"
                onClick={() => setSelectedReport(template.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <template.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className={`text-xs font-semibold ${getStatusColor(template.status)}`}>
                    {template.status === 'ready' ? '生成可能' : '下書き'}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2">{template.title}</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{template.pages}ページ</span>
                  <span>最終生成: {template.lastGenerated}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg transition-colors text-sm">
                    <Eye className="w-4 h-4" />
                    <span>プレビュー</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>ダウンロード</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 重要トピック */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">最近の重要トピック</h2>
            </div>
            <div className="space-y-3">
              {keyTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(topic.priority)}`}>
                      {topic.category}
                    </div>
                    <span className="text-xs text-slate-400">{topic.status}</span>
                  </div>
                  <h3 className="text-white font-medium mb-2">{topic.title}</h3>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{topic.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 次回理事会アジェンダ */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Presentation className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">次回理事会アジェンダ</h2>
              </div>
              <span className="text-sm text-slate-400">2025年10月15日</span>
            </div>
            <div className="space-y-3">
              {boardAgenda.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium flex-1">{item.item}</h3>
                    <span className="text-sm text-indigo-400 font-semibold ml-2">{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>発表者: {item.presenter}</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors font-medium">
                理事会資料を一括生成
              </button>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">クイックアクション</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-3 p-4 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg transition-colors border border-slate-700">
              <Calendar className="w-8 h-8 text-blue-400" />
              <span className="text-sm font-medium text-white">月次レポート自動生成</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg transition-colors border border-slate-700">
              <Presentation className="w-8 h-8 text-purple-400" />
              <span className="text-sm font-medium text-white">理事会スライド作成</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg transition-colors border border-slate-700">
              <FileSpreadsheet className="w-8 h-8 text-green-400" />
              <span className="text-sm font-medium text-white">Excel集計表出力</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg transition-colors border border-slate-700">
              <Download className="w-8 h-8 text-orange-400" />
              <span className="text-sm font-medium text-white">全レポート一括DL</span>
            </button>
          </div>
        </div>

        {/* 戦略的インサイト */}
        <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 backdrop-blur-xl rounded-xl p-6 border border-indigo-500/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">AI分析による戦略提言</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">成功事例</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    医療療養病棟での議題化プロセスが効果的に機能。
                    提案から実装まで平均35日と法人内最短を記録。
                    他部署への横展開を推奨。
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">改善提案</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    事務部門の声の活性度が低下傾向。
                    部門長との1on1実施と議題化サポート体制の強化を提案。
                    早期介入で改善の見込み。
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

export default ExecutiveReportsPage;
