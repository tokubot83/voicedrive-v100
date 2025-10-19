// エグゼクティブダッシュボード - 組織全体の健康状態と戦略的意思決定
import React, { useState } from 'react';
import ExecutivePostingAnalytics from '../executive/ExecutivePostingAnalytics';

const ExecutiveLevelDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // 月次KPIサマリー
  const monthlyKPIs = {
    totalPosts: 342,
    agendaCreated: 85,
    committeeSubmitted: 28,
    resolved: 45,
    participationRate: 68,
    resolutionRate: 55,
    avgResolutionDays: 42
  };

  // 重要アラート
  const criticalAlerts = [
    {
      type: 'risk',
      severity: 'high',
      title: '看護部でネガティブ投稿急増',
      description: 'シフト調整に関する不満が3件連続で投稿されています',
      department: '看護部',
      affectedCount: 12
    },
    {
      type: 'engagement',
      severity: 'medium',
      title: '事務部門の活性度低下',
      description: '投稿数が前月比40%減少、参加率55%に低下',
      department: '事務部',
      affectedCount: 8
    },
    {
      type: 'delay',
      severity: 'high',
      title: '記録業務デジタル化プロジェクト遅延',
      description: '予定より2週間遅延、委員会承認待ち',
      department: '医療情報部',
      affectedCount: 5
    }
  ];

  // 部門別パフォーマンス
  const departmentPerformance = [
    { name: '看護部', posts: 128, agendas: 32, activeScore: 85, trend: 'up', status: 'good' },
    { name: '医療療養病棟', posts: 98, agendas: 28, activeScore: 82, trend: 'up', status: 'good' },
    { name: 'リハビリ部', posts: 76, agendas: 18, activeScore: 78, trend: 'stable', status: 'good' },
    { name: '医療安全部', posts: 52, agendas: 12, activeScore: 74, trend: 'stable', status: 'good' },
    { name: '事務部', posts: 18, agendas: 4, activeScore: 55, trend: 'down', status: 'warning' }
  ];

  // プロジェクト進捗
  const projectProgress = {
    inProgress: 12,
    completed: 8,
    delayed: 3,
    avgProgress: 65
  };

  // 重要トピックTOP5
  const keyTopics = [
    {
      title: '看護師確保策の効果検証',
      status: '委員会承認済み',
      impact: '採用目標達成率20%向上見込み',
      priority: 'high'
    },
    {
      title: '新人育成プログラム改善',
      status: '実装中',
      impact: '離職率3%削減実績',
      priority: 'high'
    },
    {
      title: '記録業務デジタル化推進',
      status: '審議中',
      impact: '業務時間15%削減見込み',
      priority: 'medium'
    },
    {
      title: '休憩室環境改善プロジェクト',
      status: '決議済み',
      impact: '職員満足度8ポイント向上',
      priority: 'medium'
    },
    {
      title: 'シフト調整改善（看護部）',
      status: '提案段階',
      impact: 'ワークライフバランス改善',
      priority: 'high'
    }
  ];

  // 次回理事会アジェンダ
  const boardAgenda = [
    { item: '人材確保戦略の進捗報告', duration: '15分', presenter: '人事部門長', priority: 'high' },
    { item: '組織風土改善施策の効果検証', duration: '20分', presenter: '戦略企画部門員', priority: 'high' },
    { item: '医療安全委員会からの提言事項', duration: '10分', presenter: '医療安全委員長', priority: 'medium' },
    { item: '次年度予算案（人件費）', duration: '25分', presenter: '事務局長', priority: 'high' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏛️</span>
          エグゼクティブダッシュボード
        </h1>
        <p className="text-gray-300">
          組織全体の健康状態と戦略的意思決定 - ボイス分析・プロジェクト進捗・施設別比較
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>🏛️</span>
            <span>経営概要</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>📊</span>
            <span>戦略分析</span>
          </button>
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'overview' ? (
        <>
          {/* 月次KPIサマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">総投稿数</span>
            <span className="text-xl">📝</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{monthlyKPIs.totalPosts}</div>
          <div className="text-xs text-green-400 mt-1">前月比 +4.3%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">議題化</span>
            <span className="text-xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-indigo-400">{monthlyKPIs.agendaCreated}</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">委員会提出</span>
            <span className="text-xl">📋</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{monthlyKPIs.committeeSubmitted}</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">決議済み</span>
            <span className="text-xl">✅</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{monthlyKPIs.resolved}</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">参加率</span>
            <span className="text-xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-teal-400">{monthlyKPIs.participationRate}%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">解決率</span>
            <span className="text-xl">🏆</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{monthlyKPIs.resolutionRate}%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">平均解決日数</span>
            <span className="text-xl">⏱️</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{monthlyKPIs.avgResolutionDays}日</div>
        </div>
      </div>

      {/* 重要アラート */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          重要アラート
        </h2>
        <div className="space-y-3">
          {criticalAlerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 border ${
                alert.severity === 'high'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className={`font-bold mb-1 ${
                    alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {alert.title}
                  </h3>
                  <p className="text-sm text-gray-300">{alert.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  alert.severity === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {alert.severity === 'high' ? '緊急' : '注意'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>部門: {alert.department}</span>
                <span>影響: {alert.affectedCount}名</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 部門別パフォーマンス */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🏢</span>
          部門別パフォーマンス
        </h2>
        <div className="space-y-3">
          {departmentPerformance.map((dept, index) => (
            <div key={index} className={`rounded-lg p-4 border ${
              dept.status === 'warning'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-gray-700/30 border-gray-600/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-medium">{dept.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    dept.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                    dept.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {dept.trend === 'up' ? '↗ 上昇' : dept.trend === 'down' ? '↘ 下降' : '→ 安定'}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    dept.activeScore >= 80 ? 'text-green-400' :
                    dept.activeScore >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {dept.activeScore}
                  </div>
                  <div className="text-xs text-gray-400">活性度スコア</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">投稿数:</span>
                  <span className="text-white ml-2 font-bold">{dept.posts}</span>
                </div>
                <div>
                  <span className="text-gray-400">議題化:</span>
                  <span className="text-white ml-2 font-bold">{dept.agendas}</span>
                </div>
                <div>
                  <span className="text-gray-400">議題化率:</span>
                  <span className="text-white ml-2 font-bold">{Math.round((dept.agendas / dept.posts) * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* プロジェクト進捗状況 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          プロジェクト進捗状況
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">{projectProgress.inProgress}</div>
            <div className="text-sm text-gray-400 mt-1">進行中</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">{projectProgress.completed}</div>
            <div className="text-sm text-gray-400 mt-1">完了</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-400">{projectProgress.delayed}</div>
            <div className="text-sm text-gray-400 mt-1">遅延</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">{projectProgress.avgProgress}%</div>
            <div className="text-sm text-gray-400 mt-1">平均進捗率</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 重要トピックTOP5 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            重要トピックTOP5
          </h2>
          <div className="space-y-3">
            {keyTopics.map((topic, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{topic.title}</h3>
                    <p className="text-sm text-gray-400">{topic.status}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    topic.priority === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {topic.priority === 'high' ? '重要' : '通常'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">📊</span>
                  <span className="text-gray-300">{topic.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 次回理事会アジェンダ */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            次回理事会アジェンダ
          </h2>
          <div className="space-y-3">
            {boardAgenda.map((agenda, index) => (
              <div key={index} className={`rounded-lg p-4 border ${
                agenda.priority === 'high'
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'bg-gray-700/30 border-gray-600/30'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{agenda.item}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>⏱️ {agenda.duration}</span>
                      <span>👤 {agenda.presenter}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
            理事会資料を一括生成
          </button>
        </div>
      </div>
        </>
      ) : (
        <ExecutivePostingAnalytics />
      )}
    </div>
  );
};

export default ExecutiveLevelDashboard;