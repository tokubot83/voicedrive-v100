// 戦略企画ダッシュボード - LEVEL_6 (人財統括本部統括管理部門長)
import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';
import StrategicPostingAnalytics from '../strategic/StrategicPostingAnalytics';

const StrategicDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // ダミーデータ
  const strategicMetrics = {
    initiatives: { active: 12, completed: 8, planned: 15 },
    budget: { allocated: 250000000, utilized: 180000000, roi: 285 },
    transformation: { progress: 68, milestones: 24, completed: 16 },
    innovation: { ideas: 156, implemented: 34, savings: 45000000 }
  };

  const strategicInitiatives = [
    { 
      name: 'デジタル変革プログラム', 
      status: 'active', 
      progress: 72, 
      budget: 50000000,
      impact: 'high',
      deadline: '2025-06-30'
    },
    { 
      name: '人材育成システム刷新', 
      status: 'active', 
      progress: 45, 
      budget: 30000000,
      impact: 'high',
      deadline: '2025-09-30'
    },
    { 
      name: '業務プロセス最適化', 
      status: 'planning', 
      progress: 15, 
      budget: 20000000,
      impact: 'medium',
      deadline: '2025-12-31'
    }
  ];

  const riskMatrix = [
    { risk: '人材流出リスク', probability: 'medium', impact: 'high', mitigation: '報酬体系見直し実施中' },
    { risk: 'システム老朽化', probability: 'high', impact: 'medium', mitigation: '段階的更新計画策定' },
    { risk: '競合他社動向', probability: 'low', impact: 'high', mitigation: '市場分析強化' },
    { risk: 'コンプライアンス違反', probability: 'low', impact: 'very_high', mitigation: '監査体制強化済み' }
  ];

  const organizationalHealth = [
    { metric: '組織効率性', current: 82, target: 90, trend: 'up' },
    { metric: '従業員エンゲージメント', current: 78, target: 85, trend: 'stable' },
    { metric: 'イノベーション指数', current: 71, target: 80, trend: 'up' },
    { metric: '顧客満足度', current: 88, target: 90, trend: 'up' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'planning': return 'text-blue-400 bg-blue-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'very_high': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getProbabilityPosition = (probability: string) => {
    switch (probability) {
      case 'high': return 'col-start-3';
      case 'medium': return 'col-start-2';
      case 'low': return 'col-start-1';
      default: return 'col-start-1';
    }
  };

  const getImpactPosition = (impact: string) => {
    switch (impact) {
      case 'very_high': return 'row-start-1';
      case 'high': return 'row-start-2';
      case 'medium': return 'row-start-3';
      case 'low': return 'row-start-4';
      default: return 'row-start-4';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-violet-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          戦略企画ダッシュボード
        </h1>
        <p className="text-gray-300">
          組織全体の戦略的イニシアチブと変革プログラムの統括管理
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>📊</span>
            <span>戦略概要</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>🎯</span>
            <span>戦略分析</span>
          </button>
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'overview' ? (
        <>
          {/* 戦略指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">実施中施策</span>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="text-3xl font-bold text-white">{strategicMetrics.initiatives.active}</div>
          <div className="text-sm text-green-400 mt-1">完了 {strategicMetrics.initiatives.completed}</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">変革進捗</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold text-white">{strategicMetrics.transformation.progress}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${strategicMetrics.transformation.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">ROI</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-white">{strategicMetrics.budget.roi}%</div>
          <div className="text-sm text-blue-400 mt-1">投資効果</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">コスト削減</span>
            <span className="text-2xl">💵</span>
          </div>
          <div className="text-3xl font-bold text-white">¥{(strategicMetrics.innovation.savings / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-green-400 mt-1">年間削減額</div>
        </div>
      </div>

      {/* 戦略的イニシアチブ */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          戦略的イニシアチブ
        </h2>
        <div className="space-y-4">
          {strategicInitiatives.map((initiative, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-medium text-lg">{initiative.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(initiative.status)}`}>
                      {initiative.status === 'active' ? '実施中' : '計画中'}
                    </span>
                    <span className="text-gray-400">期限: {initiative.deadline}</span>
                    <span className="text-gray-400">予算: ¥{(initiative.budget / 1000000).toFixed(0)}M</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{initiative.progress}%</div>
                  <div className="text-xs text-gray-400">進捗率</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full relative"
                  style={{ width: `${initiative.progress}%` }}
                >
                  <span className="absolute right-2 top-0 text-xs text-white leading-3">
                    {initiative.progress}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* リスクマトリックス */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            リスクマトリックス
          </h2>
          <div className="relative">
            <div className="grid grid-cols-3 grid-rows-4 gap-2 h-64">
              {/* 背景グリッド */}
              <div className="col-span-3 row-span-4 grid grid-cols-3 grid-rows-4 gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-700/20 rounded"></div>
                ))}
              </div>
              
              {/* リスクポイント */}
              {riskMatrix.map((risk, index) => (
                <div
                  key={index}
                  className={`absolute w-4 h-4 rounded-full ${getImpactColor(risk.impact)} 
                    ${getProbabilityPosition(risk.probability)} ${getImpactPosition(risk.impact)}
                    cursor-pointer hover:scale-125 transition-transform`}
                  title={`${risk.risk}: ${risk.mitigation}`}
                />
              ))}
            </div>
            
            {/* 軸ラベル */}
            <div className="mt-2 text-center text-sm text-gray-400">発生確率 →</div>
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-400">
              影響度 →
            </div>
          </div>
          
          {/* リスク詳細 */}
          <div className="mt-4 space-y-2">
            {riskMatrix.map((risk, index) => (
              <div key={index} className="text-sm flex items-start gap-2">
                <div className={`w-3 h-3 rounded-full mt-0.5 ${getImpactColor(risk.impact)}`} />
                <div className="flex-1">
                  <span className="text-white">{risk.risk}</span>
                  <span className="text-gray-400 text-xs block">{risk.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 組織健全性指標 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            組織健全性指標
          </h2>
          <div className="space-y-4">
            {organizationalHealth.map((metric, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{metric.current}%</span>
                    <span className="text-sm text-gray-400">/ {metric.target}%</span>
                    <span className="text-lg">
                      {metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${metric.current}%` }}
                    />
                  </div>
                  <div 
                    className="absolute top-0 h-3 w-0.5 bg-white"
                    style={{ left: `${metric.target}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* イノベーション & 改善 */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          イノベーション & 継続的改善
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{strategicMetrics.innovation.ideas}</div>
            <div className="text-gray-400 mt-1">提案されたアイデア</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400">{strategicMetrics.innovation.implemented}</div>
            <div className="text-gray-400 mt-1">実装済み</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">22%</div>
            <div className="text-gray-400 mt-1">実装率</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">¥{(strategicMetrics.innovation.savings / 1000000).toFixed(1)}M</div>
            <div className="text-gray-400 mt-1">創出価値</div>
          </div>
        </div>
      </div>
        </>
      ) : (
        <StrategicPostingAnalytics />
      )}
    </div>
  );
};

export default StrategicDashboard;