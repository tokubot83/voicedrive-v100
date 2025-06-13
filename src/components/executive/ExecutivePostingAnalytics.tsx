import React, { useState } from 'react';

interface StrategicKPI {
  metric: string;
  current: number;
  target: number;
  improvement: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  boardImportance: 'critical' | 'high' | 'medium';
}

interface ESGMetrics {
  category: string;
  score: number;
  industry_benchmark: number;
  target: number;
  initiatives: number;
  impact_areas: string[];
  stakeholder_rating: number;
}

interface InvestmentDecision {
  id: string;
  initiative: string;
  investment_amount: number; // in millions
  expected_roi: number;
  strategic_alignment: number;
  innovation_potential: number;
  market_opportunity: number;
  risk_level: 'low' | 'medium' | 'high';
  priority_ranking: number;
}

interface StakeholderValue {
  stakeholder: string;
  value_metrics: {
    satisfaction: number;
    engagement: number;
    trust: number;
  };
  key_concerns: string[];
  improvement_impact: number;
  reporting_requirements: string[];
}

interface MarketPosition {
  region: string;
  market_share: number;
  growth_rate: number;
  competitive_position: number;
  innovation_leadership: number;
  brand_strength: number;
  improvement_contribution: number;
}

const ExecutivePostingAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarter' | 'year' | 'strategy_period'>('year');
  const [activeView, setActiveView] = useState<'strategic' | 'esg' | 'investment' | 'stakeholders' | 'market'>('strategic');

  // ダミーデータ
  const strategicKPIs: StrategicKPI[] = [
    {
      metric: '中期経営計画達成率',
      current: 89.2,
      target: 95.0,
      improvement: 12.5,
      unit: '%',
      trend: 'up',
      boardImportance: 'critical'
    },
    {
      metric: '株主総利回り(TSR)',
      current: 18.7,
      target: 20.0,
      improvement: 8.3,
      unit: '%',
      trend: 'up',
      boardImportance: 'critical'
    },
    {
      metric: 'EVA (経済付加価値)',
      current: 2.4,
      target: 3.2,
      improvement: 15.7,
      unit: '億円',
      trend: 'up',
      boardImportance: 'critical'
    },
    {
      metric: 'イノベーション指数',
      current: 78.9,
      target: 85.0,
      improvement: 22.1,
      unit: 'pt',
      trend: 'up',
      boardImportance: 'high'
    },
    {
      metric: 'デジタル変革成熟度',
      current: 72.3,
      target: 80.0,
      improvement: 18.9,
      unit: 'pt',
      trend: 'up',
      boardImportance: 'high'
    },
    {
      metric: '従業員エンゲージメント',
      current: 84.1,
      target: 90.0,
      improvement: 9.8,
      unit: 'pt',
      trend: 'up',
      boardImportance: 'medium'
    }
  ];

  const esgMetrics: ESGMetrics[] = [
    {
      category: '環境 (Environmental)',
      score: 87,
      industry_benchmark: 74,
      target: 90,
      initiatives: 24,
      impact_areas: ['カーボンニュートラル', '廃棄物削減', '省エネルギー'],
      stakeholder_rating: 89
    },
    {
      category: '社会 (Social)',
      score: 92,
      industry_benchmark: 78,
      target: 95,
      initiatives: 31,
      impact_areas: ['地域医療貢献', '人材育成', 'ダイバーシティ'],
      stakeholder_rating: 94
    },
    {
      category: 'ガバナンス (Governance)',
      score: 88,
      industry_benchmark: 82,
      target: 92,
      initiatives: 18,
      impact_areas: ['透明性向上', 'リスク管理', 'コンプライアンス'],
      stakeholder_rating: 86
    }
  ];

  const investmentDecisions: InvestmentDecision[] = [
    {
      id: '1',
      initiative: 'AI診断支援システム全社展開',
      investment_amount: 45.8,
      expected_roi: 285,
      strategic_alignment: 95,
      innovation_potential: 92,
      market_opportunity: 88,
      risk_level: 'medium',
      priority_ranking: 1
    },
    {
      id: '2',
      initiative: '次世代リハビリ機器導入',
      investment_amount: 28.3,
      expected_roi: 198,
      strategic_alignment: 89,
      innovation_potential: 85,
      market_opportunity: 91,
      risk_level: 'low',
      priority_ranking: 2
    },
    {
      id: '3',
      initiative: 'テレメディシン基盤構築',
      investment_amount: 67.2,
      expected_roi: 156,
      strategic_alignment: 92,
      innovation_potential: 89,
      market_opportunity: 94,
      risk_level: 'high',
      priority_ranking: 3
    },
    {
      id: '4',
      initiative: '人材育成プラットフォーム刷新',
      investment_amount: 15.7,
      expected_roi: 142,
      strategic_alignment: 78,
      innovation_potential: 74,
      market_opportunity: 65,
      risk_level: 'low',
      priority_ranking: 4
    }
  ];

  const stakeholderValues: StakeholderValue[] = [
    {
      stakeholder: '株主・投資家',
      value_metrics: {
        satisfaction: 89,
        engagement: 87,
        trust: 92
      },
      key_concerns: ['ROI向上', '持続的成長', 'ESG対応'],
      improvement_impact: 15.3,
      reporting_requirements: ['四半期業績', 'ESGレポート', '統合報告書']
    },
    {
      stakeholder: '患者・利用者',
      value_metrics: {
        satisfaction: 94,
        engagement: 91,
        trust: 96
      },
      key_concerns: ['医療の質', 'アクセス向上', '安全性'],
      improvement_impact: 22.7,
      reporting_requirements: ['満足度調査', '品質指標', '安全報告']
    },
    {
      stakeholder: '従業員',
      value_metrics: {
        satisfaction: 85,
        engagement: 84,
        trust: 88
      },
      key_concerns: ['働き方改革', 'キャリア開発', '待遇改善'],
      improvement_impact: 18.9,
      reporting_requirements: ['従業員サーベイ', '人材開発報告', 'ダイバーシティレポート']
    },
    {
      stakeholder: '地域社会',
      value_metrics: {
        satisfaction: 91,
        engagement: 89,
        trust: 93
      },
      key_concerns: ['地域貢献', '雇用創出', '環境配慮'],
      improvement_impact: 12.4,
      reporting_requirements: ['地域貢献活動報告', '環境報告', 'CSRレポート']
    },
    {
      stakeholder: '監督官庁',
      value_metrics: {
        satisfaction: 87,
        engagement: 85,
        trust: 89
      },
      key_concerns: ['法令遵守', '医療安全', '情報開示'],
      improvement_impact: 8.7,
      reporting_requirements: ['法令遵守報告', '医療安全報告', 'ガバナンス報告']
    }
  ];

  const marketPositions: MarketPosition[] = [
    {
      region: '九州',
      market_share: 15.8,
      growth_rate: 8.5,
      competitive_position: 2,
      innovation_leadership: 88,
      brand_strength: 92,
      improvement_contribution: 28.3
    },
    {
      region: '関西',
      market_share: 4.2,
      growth_rate: 12.7,
      competitive_position: 5,
      innovation_leadership: 74,
      brand_strength: 67,
      improvement_contribution: 12.1
    },
    {
      region: '関東',
      market_share: 2.1,
      growth_rate: 15.3,
      competitive_position: 8,
      innovation_leadership: 65,
      brand_strength: 58,
      improvement_contribution: 8.9
    }
  ];

  // 集計値
  const avgStrategicProgress = strategicKPIs.reduce((sum, kpi) => sum + (kpi.current / kpi.target * 100), 0) / strategicKPIs.length;
  const totalInvestment = investmentDecisions.reduce((sum, inv) => sum + inv.investment_amount, 0);
  const avgESGScore = esgMetrics.reduce((sum, esg) => sum + esg.score, 0) / esgMetrics.length;
  const totalImprovementValue = stakeholderValues.reduce((sum, sv) => sum + sv.improvement_impact, 0);

  const getKPIColor = (current: number, target: number) => {
    const progress = (current / target) * 100;
    if (progress >= 95) return 'text-green-400';
    if (progress >= 85) return 'text-blue-400';
    if (progress >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーとナビゲーション */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            経営戦略ダッシュボード（理事長・取締役会）
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="quarter">四半期</option>
            <option value="year">年間</option>
            <option value="strategy_period">中期戦略期間</option>
          </select>
        </div>

        {/* ナビゲーションタブ */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'strategic', label: '戦略KPI', icon: '🎯' },
            { id: 'esg', label: 'ESG指標', icon: '🌱' },
            { id: 'investment', label: '投資判断', icon: '💎' },
            { id: 'stakeholders', label: 'ステークホルダー', icon: '🤝' },
            { id: 'market', label: '市場ポジション', icon: '🗺️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeView === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* エグゼクティブサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-green-400">{avgStrategicProgress.toFixed(1)}%</div>
          <div className="text-sm text-gray-400 mt-1">戦略目標達成率</div>
          <div className="text-xs text-green-400 mt-2">中期計画順調</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-blue-400">{avgESGScore.toFixed(0)}</div>
          <div className="text-sm text-gray-400 mt-1">ESG総合スコア</div>
          <div className="text-xs text-blue-400 mt-2">業界トップ水準</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-purple-400">¥{totalInvestment.toFixed(1)}B</div>
          <div className="text-sm text-gray-400 mt-1">戦略投資額</div>
          <div className="text-xs text-purple-400 mt-2">改善提案ベース</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-yellow-400">{totalImprovementValue.toFixed(1)}%</div>
          <div className="text-sm text-gray-400 mt-1">ステークホルダー価値向上</div>
          <div className="text-xs text-yellow-400 mt-2">全方位的改善</div>
        </div>
      </div>

      {/* 戦略KPI */}
      {activeView === 'strategic' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">中期経営計画 戦略KPI進捗</h3>
            <div className="space-y-4">
              {strategicKPIs.map((kpi, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{kpi.metric}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getImportanceColor(kpi.boardImportance)}`}>
                        {kpi.boardImportance === 'critical' ? '最重要' :
                         kpi.boardImportance === 'high' ? '重要' : '監視'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getKPIColor(kpi.current, kpi.target)}`}>
                        {kpi.current}{kpi.unit}
                      </div>
                      <div className="text-sm text-gray-400">
                        目標: {kpi.target}{kpi.unit}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-400">達成率</span>
                      <div className="text-lg font-bold text-white">
                        {((kpi.current / kpi.target) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">改善寄与</span>
                      <div className="text-lg font-bold text-green-400">
                        +{kpi.improvement}%
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        (kpi.current / kpi.target) >= 0.95 ? 'bg-green-400' :
                        (kpi.current / kpi.target) >= 0.85 ? 'bg-blue-400' :
                        (kpi.current / kpi.target) >= 0.75 ? 'bg-yellow-400' : 'bg-orange-400'
                      }`}
                      style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 取締役会向けサマリー */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">取締役会向けエグゼクティブサマリー</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-green-400 font-medium mb-2">🎉 主要成果</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• TSR 18.7%達成（目標20%に対し93%）</li>
                  <li>• EVA 2.4億円で前年比15.7%向上</li>
                  <li>• イノベーション指数が業界平均を13pt上回る</li>
                </ul>
              </div>
              <div>
                <h4 className="text-yellow-400 font-medium mb-2">⚠️ 注意事項</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• デジタル変革の遅れ（72%、目標80%）</li>
                  <li>• 中期計画達成率89%（残り10%の加速必要）</li>
                  <li>• 従業員エンゲージメント90%まで6pt不足</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2">📈 次期重点</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• AI診断支援システム展開加速</li>
                  <li>• ESGスコア90点台への向上</li>
                  <li>• 九州外市場での競争力強化</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESG指標 */}
      {activeView === 'esg' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">ESG経営指標</h3>
            <div className="space-y-4">
              {esgMetrics.map((esg, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{esg.category}</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{esg.score}</div>
                      <div className="text-sm text-gray-400">業界平均: {esg.industry_benchmark}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{esg.target}</div>
                      <div className="text-xs text-gray-400">目標値</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{esg.initiatives}</div>
                      <div className="text-xs text-gray-400">施策数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{esg.stakeholder_rating}</div>
                      <div className="text-xs text-gray-400">評価スコア</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">
                        +{(esg.score - esg.industry_benchmark)}pt
                      </div>
                      <div className="text-xs text-gray-400">業界差</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">重点領域</h5>
                    <div className="flex flex-wrap gap-2">
                      {esg.impact_areas.map((area, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-green-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(esg.score / 100) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 投資判断 */}
      {activeView === 'investment' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">戦略投資ポートフォリオ（改善提案ベース）</h3>
            <div className="space-y-4">
              {investmentDecisions
                .sort((a, b) => a.priority_ranking - b.priority_ranking)
                .map(investment => (
                <div key={investment.id} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          investment.priority_ranking === 1 ? 'bg-yellow-500 text-black' :
                          investment.priority_ranking === 2 ? 'bg-gray-400 text-black' :
                          investment.priority_ranking === 3 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {investment.priority_ranking}
                        </span>
                        <h4 className="font-medium text-white">{investment.initiative}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(investment.risk_level)}`}>
                        {investment.risk_level === 'low' ? '低リスク' :
                         investment.risk_level === 'medium' ? '中リスク' : '高リスク'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {investment.expected_roi}%
                      </div>
                      <div className="text-sm text-gray-400">期待ROI</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">¥{investment.investment_amount}M</div>
                      <div className="text-xs text-gray-400">投資額</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{investment.strategic_alignment}</div>
                      <div className="text-xs text-gray-400">戦略整合性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{investment.innovation_potential}</div>
                      <div className="text-xs text-gray-400">革新性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{investment.market_opportunity}</div>
                      <div className="text-xs text-gray-400">市場機会</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-600 flex gap-2">
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                      承認検討
                    </button>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      詳細分析
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      リスク評価
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ステークホルダー */}
      {activeView === 'stakeholders' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">ステークホルダー価値創造</h3>
            <div className="space-y-4">
              {stakeholderValues.map((stakeholder, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{stakeholder.stakeholder}</h4>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">
                        +{stakeholder.improvement_impact}%
                      </div>
                      <div className="text-xs text-gray-400">改善効果</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {stakeholder.value_metrics.satisfaction}
                      </div>
                      <div className="text-xs text-gray-400">満足度</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {stakeholder.value_metrics.engagement}
                      </div>
                      <div className="text-xs text-gray-400">エンゲージメント</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">
                        {stakeholder.value_metrics.trust}
                      </div>
                      <div className="text-xs text-gray-400">信頼度</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">主要関心事</h5>
                      <ul className="space-y-1">
                        {stakeholder.key_concerns.map((concern, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                            <span className="text-yellow-400">•</span>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">報告要件</h5>
                      <div className="flex flex-wrap gap-1">
                        {stakeholder.reporting_requirements.map((req, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {req}
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

      {/* 市場ポジション */}
      {activeView === 'market' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">地域別市場ポジション</h3>
            <div className="space-y-4">
              {marketPositions.map((market, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{market.region}地区</h4>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-400">
                        #{market.competitive_position}
                      </div>
                      <div className="text-xs text-gray-400">市場地位</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{market.market_share}%</div>
                      <div className="text-xs text-gray-400">市場シェア</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{market.growth_rate}%</div>
                      <div className="text-xs text-gray-400">成長率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{market.innovation_leadership}</div>
                      <div className="text-xs text-gray-400">革新性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{market.brand_strength}</div>
                      <div className="text-xs text-gray-400">ブランド力</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-400">{market.improvement_contribution}%</div>
                      <div className="text-xs text-gray-400">改善寄与</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">競争優位性スコア</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              market.competitive_position <= 3 ? 'bg-green-400' :
                              market.competitive_position <= 5 ? 'bg-yellow-400' : 'bg-orange-400'
                            }`}
                            style={{ width: `${100 - (market.competitive_position - 1) * 20}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">
                          {100 - (market.competitive_position - 1) * 20}pt
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutivePostingAnalytics;