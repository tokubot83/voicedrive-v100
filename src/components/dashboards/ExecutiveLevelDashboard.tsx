// 経営ダッシュボード - LEVEL_8 (理事長専用)
import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';
import ExecutivePostingAnalytics from '../executive/ExecutivePostingAnalytics';

const ExecutiveLevelDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // ダミーデータ
  const executiveMetrics = {
    groupRevenue: 45000000000,
    marketCap: 120000000000,
    shareholders: 12500,
    roe: 15.8,
    stockPrice: { current: 3850, change: 2.3 },
    dividendYield: 2.8
  };

  const businessUnits = [
    { name: '医療事業', revenue: 18500000000, growth: 8.5, margin: 12.3, contribution: 41 },
    { name: '介護事業', revenue: 8200000000, growth: 12.3, margin: 9.8, contribution: 18 },
    { name: '健康管理事業', revenue: 6800000000, growth: 15.7, margin: 18.5, contribution: 15 },
    { name: '医薬品事業', revenue: 11500000000, growth: 6.2, margin: 22.1, contribution: 26 }
  ];

  const boardAgenda = [
    { item: '中期経営計画(2025-2027)承認', priority: 'critical', date: '2025-01-25' },
    { item: 'M&A案件審議 - AI医療スタートアップ買収', priority: 'high', date: '2025-01-25' },
    { item: '配当政策見直し', priority: 'medium', date: '2025-01-25' },
    { item: 'ESG目標設定', priority: 'high', date: '2025-01-25' }
  ];

  const globalExpansion = [
    { region: 'アジア太平洋', facilities: 8, revenue: 3200000000, growth: 18.5 },
    { region: '北米', facilities: 3, revenue: 2100000000, growth: 12.3 },
    { region: '欧州', facilities: 2, revenue: 980000000, growth: 8.7 }
  ];

  const executiveSummary = {
    achievements: [
      '過去最高収益を達成（前年比+8.5%）',
      '新規事業の黒字化達成',
      'ESGレーティングA評価獲得'
    ],
    challenges: [
      '人材獲得競争の激化',
      '規制環境の変化への対応',
      'デジタル変革の加速'
    ],
    opportunities: [
      'AI/ML技術による医療革新',
      'アジア市場での事業拡大',
      '予防医療市場の成長'
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏛️</span>
          経営ダッシュボード
        </h1>
        <p className="text-gray-300">
          グループ全体の経営戦略と重要意思決定
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
          {/* エグゼクティブサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">グループ売上高</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-white">¥{(executiveMetrics.groupRevenue / 1000000000).toFixed(0)}B</div>
          <div className="text-sm text-green-400 mt-1">前年比 +8.5%</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">時価総額</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold text-white">¥{(executiveMetrics.marketCap / 1000000000).toFixed(0)}B</div>
          <div className="text-sm text-green-400 mt-1">株価 ¥{executiveMetrics.stockPrice.current} (+{executiveMetrics.stockPrice.change}%)</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">ROE</span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-3xl font-bold text-white">{executiveMetrics.roe}%</div>
          <div className="text-sm text-blue-400 mt-1">配当利回り {executiveMetrics.dividendYield}%</div>
        </div>
      </div>

      {/* 事業セグメント別業績 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          事業セグメント別業績
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessUnits.map((unit, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-700/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
              <h3 className="text-white font-medium mb-3">{unit.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">売上高</span>
                  <span className="text-white font-bold">¥{(unit.revenue / 1000000000).toFixed(1)}B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">成長率</span>
                  <span className={`font-bold ${unit.growth > 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                    +{unit.growth}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">利益率</span>
                  <span className="text-white">{unit.margin}%</span>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-1">売上構成比</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full"
                      style={{ width: `${unit.contribution}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 理事会議題 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            次回理事会議題
          </h2>
          <div className="space-y-3">
            {boardAgenda.map((agenda, index) => (
              <div key={index} className={`rounded-lg p-4 border ${getPriorityColor(agenda.priority)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">{agenda.item}</h3>
                    <p className="text-gray-400 text-sm mt-1">開催日: {agenda.date}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                    {agenda.priority === 'critical' ? '最重要' : 
                     agenda.priority === 'high' ? '重要' : '通常'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* グローバル展開 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            グローバル展開状況
          </h2>
          <div className="space-y-4">
            {globalExpansion.map((region, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{region.region}</h3>
                  <span className="text-gray-400">{region.facilities}施設</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">売上高:</span>
                    <span className="text-white ml-2">¥{(region.revenue / 1000000000).toFixed(1)}B</span>
                  </div>
                  <div>
                    <span className="text-gray-400">成長率:</span>
                    <span className="text-green-400 ml-2">+{region.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              🔍 新規市場: 東南アジア3ヶ国で事業展開準備中
            </p>
          </div>
        </div>
      </div>

      {/* エグゼクティブサマリー */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📑</span>
          エグゼクティブサマリー
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-green-400 font-medium mb-3 flex items-center gap-2">
              <span>✅</span> 主要成果
            </h3>
            <ul className="space-y-2">
              {executiveSummary.achievements.map((achievement, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
              <span>⚠️</span> 課題事項
            </h3>
            <ul className="space-y-2">
              {executiveSummary.challenges.map((challenge, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
              <span>🚀</span> 成長機会
            </h3>
            <ul className="space-y-2">
              {executiveSummary.opportunities.map((opportunity, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 株主構成 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          株主構成
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{executiveMetrics.shareholders.toLocaleString()}</div>
            <div className="text-gray-400 mt-1">総株主数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">38.5%</div>
            <div className="text-gray-400 mt-1">機関投資家</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">42.3%</div>
            <div className="text-gray-400 mt-1">個人投資家</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">19.2%</div>
            <div className="text-gray-400 mt-1">外国人投資家</div>
          </div>
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