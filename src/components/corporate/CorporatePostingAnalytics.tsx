import React, { useState } from 'react';

interface FacilityBenchmark {
  facilityId: string;
  facilityName: string;
  region: string;
  size: 'large' | 'medium' | 'small';
  improvementRank: number;
  revenueContribution: number; // in millions
  profitabilityImpact: number; // percentage
  brandContribution: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  competitiveAdvantage: number; // 0-100
}

interface FinancialImpact {
  category: string;
  investmentAmount: number; // in millions
  realizedSavings: number; // in millions
  roi: number; // percentage
  paybackPeriod: number; // months
  npv: number; // in millions
  riskAdjustedReturn: number; // percentage
}

interface CompetitiveAnalysis {
  metric: string;
  ourPerformance: number;
  industryAverage: number;
  topPerformer: number;
  competitiveGap: number;
  strategicImportance: 'critical' | 'high' | 'medium' | 'low';
}

interface MergerIntegration {
  facilityId: string;
  facilityName: string;
  acquisitionDate: string;
  integrationStage: 'planning' | 'cultural_alignment' | 'system_integration' | 'optimization' | 'completed';
  cultureAssimilation: number; // 0-100
  improvementAdoption: number; // 0-100
  synergiesRealized: number; // in millions
  integrationChallenges: string[];
}

const CorporatePostingAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarter' | 'year' | 'multi_year'>('year');
  const [activeView, setActiveView] = useState<'benchmarking' | 'financial' | 'competitive' | 'integration'>('benchmarking');

  // ダミーデータ
  const facilityBenchmarks: FacilityBenchmark[] = [
    {
      facilityId: '1',
      facilityName: '小原病院',
      region: '九州',
      size: 'large',
      improvementRank: 1,
      revenueContribution: 3200,
      profitabilityImpact: 8.5,
      brandContribution: 92,
      riskLevel: 'low',
      competitiveAdvantage: 88
    },
    {
      facilityId: '2',
      facilityName: '立神リハ温泉病院',
      region: '九州',
      size: 'medium',
      improvementRank: 2,
      revenueContribution: 1800,
      profitabilityImpact: 12.3,
      brandContribution: 89,
      riskLevel: 'low',
      competitiveAdvantage: 94
    },
    {
      facilityId: '3',
      facilityName: 'エスポワール立神',
      region: '九州',
      size: 'small',
      improvementRank: 4,
      revenueContribution: 850,
      profitabilityImpact: 6.7,
      brandContribution: 78,
      riskLevel: 'medium',
      competitiveAdvantage: 71
    },
    {
      facilityId: '4',
      facilityName: '介護医療院',
      region: '九州',
      size: 'small',
      improvementRank: 8,
      revenueContribution: 420,
      profitabilityImpact: 4.2,
      brandContribution: 65,
      riskLevel: 'high',
      competitiveAdvantage: 58
    },
    {
      facilityId: '5',
      facilityName: '宝寿庵',
      region: '九州',
      size: 'small',
      improvementRank: 3,
      revenueContribution: 680,
      profitabilityImpact: 9.1,
      brandContribution: 84,
      riskLevel: 'low',
      competitiveAdvantage: 82
    }
  ];

  const financialImpacts: FinancialImpact[] = [
    {
      category: 'IT・デジタル化改善',
      investmentAmount: 125.5,
      realizedSavings: 289.3,
      roi: 130.4,
      paybackPeriod: 18,
      npv: 156.8,
      riskAdjustedReturn: 124.2
    },
    {
      category: '業務プロセス効率化',
      investmentAmount: 67.2,
      realizedSavings: 178.9,
      roi: 166.2,
      paybackPeriod: 12,
      npv: 98.7,
      riskAdjustedReturn: 158.4
    },
    {
      category: '医療安全・品質向上',
      investmentAmount: 89.1,
      realizedSavings: 134.6,
      roi: 51.1,
      paybackPeriod: 24,
      npv: 45.5,
      riskAdjustedReturn: 48.7
    },
    {
      category: '人材育成・組織開発',
      investmentAmount: 45.8,
      realizedSavings: 98.4,
      roi: 114.8,
      paybackPeriod: 16,
      npv: 52.6,
      riskAdjustedReturn: 109.2
    },
    {
      category: '施設・設備改善',
      investmentAmount: 234.7,
      realizedSavings: 187.2,
      roi: -20.2,
      paybackPeriod: 36,
      npv: -47.5,
      riskAdjustedReturn: -25.1
    }
  ];

  const competitiveAnalysis: CompetitiveAnalysis[] = [
    {
      metric: '改善提案実現率',
      ourPerformance: 73.2,
      industryAverage: 58.1,
      topPerformer: 81.4,
      competitiveGap: 8.2,
      strategicImportance: 'critical'
    },
    {
      metric: '職員エンゲージメント',
      ourPerformance: 84.7,
      industryAverage: 72.3,
      topPerformer: 89.1,
      competitiveGap: 4.4,
      strategicImportance: 'high'
    },
    {
      metric: 'イノベーション創出力',
      ourPerformance: 78.9,
      industryAverage: 65.4,
      topPerformer: 92.3,
      competitiveGap: 13.4,
      strategicImportance: 'critical'
    },
    {
      metric: '組織学習速度',
      ourPerformance: 82.1,
      industryAverage: 69.7,
      topPerformer: 88.6,
      competitiveGap: 6.5,
      strategicImportance: 'high'
    },
    {
      metric: 'ナレッジ共有効率',
      ourPerformance: 75.3,
      industryAverage: 71.2,
      topPerformer: 85.9,
      competitiveGap: 10.6,
      strategicImportance: 'medium'
    }
  ];

  const mergerIntegrations: MergerIntegration[] = [
    {
      facilityId: 'new1',
      facilityName: '福岡中央病院',
      acquisitionDate: '2024-04-01',
      integrationStage: 'system_integration',
      cultureAssimilation: 68,
      improvementAdoption: 45,
      synergiesRealized: 23.4,
      integrationChallenges: ['改善文化の浸透遅れ', 'ITシステム統合課題', '人材流出リスク']
    },
    {
      facilityId: 'new2',
      facilityName: '熊本南病院',
      acquisitionDate: '2024-01-15',
      integrationStage: 'cultural_alignment',
      cultureAssimilation: 42,
      improvementAdoption: 28,
      synergiesRealized: 8.7,
      integrationChallenges: ['組織文化の違い', '管理体制の整備', '改善活動への抵抗']
    }
  ];

  // 集計値
  const totalROI = financialImpacts.reduce((sum, impact) => sum + (impact.realizedSavings - impact.investmentAmount), 0);
  const avgCompetitiveGap = competitiveAnalysis.reduce((sum, comp) => sum + comp.competitiveGap, 0) / competitiveAnalysis.length;
  const totalSynergies = mergerIntegrations.reduce((sum, merger) => sum + merger.synergiesRealized, 0);

  const getRankColor = (rank: number) => {
    if (rank <= 2) return 'text-green-400';
    if (rank <= 5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 100) return 'text-green-400';
    if (roi >= 50) return 'text-blue-400';
    if (roi >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getIntegrationStageColor = (stage: string) => {
    switch (stage) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'optimization': return 'text-blue-400 bg-blue-500/20';
      case 'system_integration': return 'text-purple-400 bg-purple-500/20';
      case 'cultural_alignment': return 'text-yellow-400 bg-yellow-500/20';
      case 'planning': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーとナビゲーション */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            法人統括分析（グループ戦略ビュー）
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="quarter">四半期</option>
            <option value="year">年間</option>
            <option value="multi_year">複数年</option>
          </select>
        </div>

        {/* ナビゲーションタブ */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'benchmarking', label: '施設ベンチマーク', icon: '📊' },
            { id: 'financial', label: '財務インパクト', icon: '💰' },
            { id: 'competitive', label: '競争力分析', icon: '🎯' },
            { id: 'integration', label: 'M&A統合', icon: '🤝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeView === tab.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 法人KPIサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-green-400">¥{totalROI.toFixed(1)}M</div>
          <div className="text-sm text-gray-400 mt-1">改善活動総ROI</div>
          <div className="text-xs text-green-400 mt-2">年間リターン</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-blue-400">{avgCompetitiveGap.toFixed(1)}pt</div>
          <div className="text-sm text-gray-400 mt-1">競合優位性ギャップ</div>
          <div className="text-xs text-blue-400 mt-2">トップパフォーマーとの差</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-purple-400">¥{totalSynergies.toFixed(1)}M</div>
          <div className="text-sm text-gray-400 mt-1">M&Aシナジー実現</div>
          <div className="text-xs text-purple-400 mt-2">統合効果</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-yellow-400">73.2%</div>
          <div className="text-sm text-gray-400 mt-1">グループ実現率</div>
          <div className="text-xs text-green-400 mt-2">業界平均+15.1pt</div>
        </div>
      </div>

      {/* 施設ベンチマーク */}
      {activeView === 'benchmarking' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">施設別競争力ランキング</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                    <th className="pb-3 pr-4">順位</th>
                    <th className="pb-3 px-4">施設名</th>
                    <th className="pb-3 px-4 text-center">規模</th>
                    <th className="pb-3 px-4 text-center">売上貢献</th>
                    <th className="pb-3 px-4 text-center">収益性影響</th>
                    <th className="pb-3 px-4 text-center">ブランド貢献</th>
                    <th className="pb-3 px-4 text-center">競争優位性</th>
                    <th className="pb-3 pl-4 text-center">リスクレベル</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityBenchmarks
                    .sort((a, b) => a.improvementRank - b.improvementRank)
                    .map((facility, index) => (
                    <tr key={facility.facilityId} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-4 pr-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {facility.improvementRank}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{facility.facilityName}</div>
                        <div className="text-xs text-gray-400">{facility.region}地区</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          facility.size === 'large' ? 'bg-blue-500/20 text-blue-400' :
                          facility.size === 'medium' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {facility.size === 'large' ? '大規模' : facility.size === 'medium' ? '中規模' : '小規模'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-white font-medium">¥{facility.revenueContribution}M</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`text-lg font-bold ${getROIColor(facility.profitabilityImpact)}`}>
                          +{facility.profitabilityImpact}%
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-purple-400 font-medium">{facility.brandContribution}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-cyan-400 font-medium">{facility.competitiveAdvantage}</div>
                      </td>
                      <td className="py-4 pl-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(facility.riskLevel)}`}>
                          {facility.riskLevel === 'low' ? '低' : facility.riskLevel === 'medium' ? '中' : '高'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 地域別分析 */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">地域戦略分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-300 mb-3">九州地区パフォーマンス</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">市場シェア</span>
                    <span className="text-green-400 font-bold">15.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">改善文化浸透度</span>
                    <span className="text-blue-400 font-bold">83.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">地域ブランド力</span>
                    <span className="text-purple-400 font-bold">89.2%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-300 mb-3">成長機会</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">●</span>
                    <span>リハビリ特化病院の差別化成功</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">●</span>
                    <span>温泉療法の独自ノウハウ展開可能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">●</span>
                    <span>小規模施設の収益性改善余地</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 財務インパクト */}
      {activeView === 'financial' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">改善カテゴリー別財務インパクト</h3>
            <div className="space-y-4">
              {financialImpacts.map((impact, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{impact.category}</h4>
                    <div className={`text-2xl font-bold ${getROIColor(impact.roi)}`}>
                      {impact.roi > 0 ? '+' : ''}{impact.roi.toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">¥{impact.investmentAmount}M</div>
                      <div className="text-xs text-gray-400">投資額</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">¥{impact.realizedSavings}M</div>
                      <div className="text-xs text-gray-400">実現効果</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{impact.paybackPeriod}ヶ月</div>
                      <div className="text-xs text-gray-400">回収期間</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${impact.npv > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ¥{impact.npv.toFixed(1)}M
                      </div>
                      <div className="text-xs text-gray-400">NPV</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">リスク調整後リターン</span>
                      <span className={`font-medium ${getROIColor(impact.riskAdjustedReturn)}`}>
                        {impact.riskAdjustedReturn > 0 ? '+' : ''}{impact.riskAdjustedReturn.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-2">財務サマリー</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">総投資額: </span>
                  <span className="text-white font-medium">
                    ¥{financialImpacts.reduce((sum, f) => sum + f.investmentAmount, 0).toFixed(1)}M
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">総効果額: </span>
                  <span className="text-green-400 font-medium">
                    ¥{financialImpacts.reduce((sum, f) => sum + f.realizedSavings, 0).toFixed(1)}M
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">純利益: </span>
                  <span className="text-blue-400 font-medium">
                    ¥{totalROI.toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 競争力分析 */}
      {activeView === 'competitive' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">業界ベンチマーク比較</h3>
            <div className="space-y-4">
              {competitiveAnalysis.map((analysis, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{analysis.metric}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getImportanceColor(analysis.strategicImportance)}`}>
                        {analysis.strategicImportance === 'critical' ? '最重要' :
                         analysis.strategicImportance === 'high' ? '重要' :
                         analysis.strategicImportance === 'medium' ? '中程度' : '低'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{analysis.ourPerformance}</div>
                      <div className={`text-sm ${analysis.competitiveGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        差: {analysis.competitiveGap > 0 ? '-' : '+'}{Math.abs(analysis.competitiveGap)}pt
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">当社実績</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${(analysis.ourPerformance / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm w-12">{analysis.ourPerformance}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">業界平均</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${(analysis.industryAverage / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm w-12">{analysis.industryAverage}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">業界トップ</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: `${(analysis.topPerformer / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm w-12">{analysis.topPerformer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* M&A統合 */}
      {activeView === 'integration' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">M&A統合進捗</h3>
            <div className="space-y-4">
              {mergerIntegrations.map(integration => (
                <div key={integration.facilityId} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{integration.facilityName}</h4>
                      <div className="text-sm text-gray-400">
                        買収日: {new Date(integration.acquisitionDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getIntegrationStageColor(integration.integrationStage)}`}>
                      {integration.integrationStage === 'planning' ? '計画段階' :
                       integration.integrationStage === 'cultural_alignment' ? '文化統合' :
                       integration.integrationStage === 'system_integration' ? 'システム統合' :
                       integration.integrationStage === 'optimization' ? '最適化' : '統合完了'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">{integration.cultureAssimilation}%</div>
                      <div className="text-xs text-gray-400">文化同化</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{integration.improvementAdoption}%</div>
                      <div className="text-xs text-gray-400">改善文化導入</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-400">¥{integration.synergiesRealized}M</div>
                      <div className="text-xs text-gray-400">シナジー実現</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">統合課題</h5>
                    <div className="space-y-1">
                      {integration.integrationChallenges.map((challenge, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-yellow-400">⚠️</span>
                          <span className="text-sm text-gray-300">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-600 flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      統合計画詳細
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      シナジー追跡
                    </button>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors">
                      文化統合支援
                    </button>
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

export default CorporatePostingAnalytics;