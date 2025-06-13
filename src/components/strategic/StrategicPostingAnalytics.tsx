import React, { useState } from 'react';

interface FacilityCultureMetrics {
  facilityId: string;
  facilityName: string;
  maturityLevel: number; // 0-100
  innovationIndex: number; // 0-100
  engagementRate: number; // 0-100
  knowledgeSharing: number; // 0-100
  changeReadiness: number; // 0-100
  totalPosts: number;
  adoptionRate: number;
  riskScore: number;
}

interface TalentDevelopment {
  employeeId: string;
  name: string;
  currentLevel: number;
  facility: string;
  department: string;
  potentialRating: 'high' | 'medium' | 'low';
  innovationContribution: number;
  leadershipIndicators: number;
  mentorshipActivity: number;
  promotionReadiness: number;
  successorFor?: string;
}

interface KnowledgeAsset {
  category: string;
  assetCount: number;
  utilizationRate: number;
  qualityScore: number;
  businessValue: number; // in millions
  trendDirection: 'up' | 'down' | 'stable';
}

interface OrganizationalChange {
  initiativeId: string;
  name: string;
  scope: string[];
  stage: 'planning' | 'piloting' | 'rolling_out' | 'embedding' | 'completed';
  resistance: number; // 0-100
  adoption: number; // 0-100
  impact: number; // 0-100
  facilitySupportScore: { [key: string]: number };
}

const StrategicPostingAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'quarter' | 'year' | 'multi_year'>('year');
  const [activeView, setActiveView] = useState<'culture' | 'talent' | 'knowledge' | 'transformation'>('culture');

  // ダミーデータ
  const facilityCultureMetrics: FacilityCultureMetrics[] = [
    {
      facilityId: '1',
      facilityName: '小原病院',
      maturityLevel: 92,
      innovationIndex: 88,
      engagementRate: 85,
      knowledgeSharing: 91,
      changeReadiness: 89,
      totalPosts: 456,
      adoptionRate: 68,
      riskScore: 12
    },
    {
      facilityId: '2',
      facilityName: '立神リハ温泉病院',
      maturityLevel: 87,
      innovationIndex: 94,
      engagementRate: 89,
      knowledgeSharing: 86,
      changeReadiness: 92,
      totalPosts: 324,
      adoptionRate: 74,
      riskScore: 8
    },
    {
      facilityId: '3',
      facilityName: 'エスポワール立神',
      maturityLevel: 78,
      innovationIndex: 82,
      engagementRate: 76,
      knowledgeSharing: 79,
      changeReadiness: 81,
      totalPosts: 287,
      adoptionRate: 65,
      riskScore: 18
    },
    {
      facilityId: '4',
      facilityName: '介護医療院',
      maturityLevel: 71,
      innovationIndex: 69,
      engagementRate: 68,
      knowledgeSharing: 72,
      changeReadiness: 74,
      totalPosts: 198,
      adoptionRate: 58,
      riskScore: 25
    },
    {
      facilityId: '5',
      facilityName: '宝寿庵',
      maturityLevel: 85,
      innovationIndex: 87,
      engagementRate: 83,
      knowledgeSharing: 88,
      changeReadiness: 86,
      totalPosts: 245,
      adoptionRate: 71,
      riskScore: 14
    }
  ];

  const talentDevelopment: TalentDevelopment[] = [
    {
      employeeId: '1',
      name: '山田太郎',
      currentLevel: 4,
      facility: '小原病院',
      department: '外来看護',
      potentialRating: 'high',
      innovationContribution: 92,
      leadershipIndicators: 88,
      mentorshipActivity: 85,
      promotionReadiness: 90,
      successorFor: '看護部長'
    },
    {
      employeeId: '2',
      name: '佐藤花子',
      currentLevel: 3,
      facility: '立神リハ温泉病院',
      department: 'リハビリテーション',
      potentialRating: 'high',
      innovationContribution: 95,
      leadershipIndicators: 89,
      mentorshipActivity: 91,
      promotionReadiness: 87,
      successorFor: 'リハビリ部長'
    },
    {
      employeeId: '3',
      name: '鈴木一郎',
      currentLevel: 5,
      facility: '小原病院',
      department: '医療技術',
      potentialRating: 'high',
      innovationContribution: 89,
      leadershipIndicators: 94,
      mentorshipActivity: 87,
      promotionReadiness: 92,
      successorFor: '医療技術部長'
    }
  ];

  const knowledgeAssets: KnowledgeAsset[] = [
    {
      category: '医療安全プロトコル',
      assetCount: 156,
      utilizationRate: 89,
      qualityScore: 92,
      businessValue: 45.2,
      trendDirection: 'up'
    },
    {
      category: '業務効率化手法',
      assetCount: 234,
      utilizationRate: 82,
      qualityScore: 87,
      businessValue: 67.8,
      trendDirection: 'up'
    },
    {
      category: '患者ケア改善策',
      assetCount: 187,
      utilizationRate: 85,
      qualityScore: 90,
      businessValue: 52.3,
      trendDirection: 'stable'
    },
    {
      category: 'IT・DX改善事例',
      assetCount: 98,
      utilizationRate: 76,
      qualityScore: 88,
      businessValue: 123.5,
      trendDirection: 'up'
    },
    {
      category: 'コスト削減アイデア',
      assetCount: 145,
      utilizationRate: 78,
      qualityScore: 84,
      businessValue: 89.1,
      trendDirection: 'stable'
    }
  ];

  const organizationalChanges: OrganizationalChange[] = [
    {
      initiativeId: '1',
      name: 'デジタル変革プログラム',
      scope: ['小原病院', '立神リハ温泉病院', 'エスポワール立神'],
      stage: 'rolling_out',
      resistance: 25,
      adoption: 72,
      impact: 85,
      facilitySupportScore: {
        '小原病院': 88,
        '立神リハ温泉病院': 92,
        'エスポワール立神': 65
      }
    },
    {
      initiativeId: '2',
      name: '人材育成制度改革',
      scope: ['全施設'],
      stage: 'embedding',
      resistance: 18,
      adoption: 84,
      impact: 78,
      facilitySupportScore: {
        '小原病院': 89,
        '立神リハ温泉病院': 87,
        'エスポワール立神': 72,
        '介護医療院': 68,
        '宝寿庵': 81
      }
    },
    {
      initiativeId: '3',
      name: '品質管理システム統一',
      scope: ['小原病院', '宝寿庵', '介護医療院'],
      stage: 'piloting',
      resistance: 32,
      adoption: 58,
      impact: 92,
      facilitySupportScore: {
        '小原病院': 85,
        '宝寿庵': 78,
        '介護医療院': 62
      }
    }
  ];

  // 集計値
  const avgMaturityLevel = facilityCultureMetrics.reduce((sum, f) => sum + f.maturityLevel, 0) / facilityCultureMetrics.length;
  const avgInnovationIndex = facilityCultureMetrics.reduce((sum, f) => sum + f.innovationIndex, 0) / facilityCultureMetrics.length;
  const totalKnowledgeValue = knowledgeAssets.reduce((sum, k) => sum + k.businessValue, 0);
  const highPotentialTalent = talentDevelopment.filter(t => t.potentialRating === 'high').length;

  const getMaturityColor = (level: number) => {
    if (level >= 85) return 'bg-green-500';
    if (level >= 70) return 'bg-yellow-500';
    if (level >= 55) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPotentialColor = (rating: string) => {
    switch (rating) {
      case 'high': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'embedding': return 'text-blue-400 bg-blue-500/20';
      case 'rolling_out': return 'text-purple-400 bg-purple-500/20';
      case 'piloting': return 'text-yellow-400 bg-yellow-500/20';
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
            <span className="text-2xl">🎯</span>
            戦略実行支援分析（全施設統合ビュー）
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
            { id: 'culture', label: '改善文化分析', icon: '🌟' },
            { id: 'talent', label: '人材開発', icon: '👑' },
            { id: 'knowledge', label: 'ナレッジ資産', icon: '📚' },
            { id: 'transformation', label: '組織変革', icon: '🔄' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeView === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 戦略KPIサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-green-400">{avgMaturityLevel.toFixed(1)}</div>
          <div className="text-sm text-gray-400 mt-1">平均改善文化成熟度</div>
          <div className="text-xs text-green-400 mt-2">前年比 +5.2pt</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-blue-400">{avgInnovationIndex.toFixed(1)}</div>
          <div className="text-sm text-gray-400 mt-1">イノベーション指数</div>
          <div className="text-xs text-blue-400 mt-2">業界平均 +8.3pt</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-purple-400">{totalKnowledgeValue.toFixed(1)}M</div>
          <div className="text-sm text-gray-400 mt-1">ナレッジ資産価値</div>
          <div className="text-xs text-purple-400 mt-2">¥{totalKnowledgeValue.toFixed(1)}億円</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="text-3xl font-bold text-yellow-400">{highPotentialTalent}</div>
          <div className="text-sm text-gray-400 mt-1">高ポテンシャル人材</div>
          <div className="text-xs text-yellow-400 mt-2">次世代リーダー候補</div>
        </div>
      </div>

      {/* 改善文化分析 */}
      {activeView === 'culture' && (
        <div className="space-y-6">
          {/* 施設別文化成熟度ヒートマップ */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">施設別改善文化成熟度マトリックス</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                    <th className="pb-3 pr-4">施設名</th>
                    <th className="pb-3 px-4 text-center">成熟度</th>
                    <th className="pb-3 px-4 text-center">イノベーション</th>
                    <th className="pb-3 px-4 text-center">エンゲージメント</th>
                    <th className="pb-3 px-4 text-center">知識共有</th>
                    <th className="pb-3 px-4 text-center">変革適応力</th>
                    <th className="pb-3 pl-4 text-center">総合評価</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityCultureMetrics.map(facility => {
                    const overallScore = (facility.maturityLevel + facility.innovationIndex + facility.engagementRate + facility.knowledgeSharing + facility.changeReadiness) / 5;
                    return (
                      <tr key={facility.facilityId} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-white">{facility.facilityName}</div>
                          <div className="text-xs text-gray-400">{facility.totalPosts}投稿 • {facility.adoptionRate}%採用</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`w-16 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getMaturityColor(facility.maturityLevel)}`}>
                            {facility.maturityLevel}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`w-16 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getMaturityColor(facility.innovationIndex)}`}>
                            {facility.innovationIndex}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`w-16 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getMaturityColor(facility.engagementRate)}`}>
                            {facility.engagementRate}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`w-16 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getMaturityColor(facility.knowledgeSharing)}`}>
                            {facility.knowledgeSharing}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`w-16 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getMaturityColor(facility.changeReadiness)}`}>
                            {facility.changeReadiness}
                          </div>
                        </td>
                        <td className="py-4 pl-4 text-center">
                          <div className="text-2xl font-bold text-white">{overallScore.toFixed(1)}</div>
                          <div className="text-xs text-gray-400">
                            {overallScore >= 85 ? 'S級' : overallScore >= 70 ? 'A級' : overallScore >= 55 ? 'B級' : 'C級'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-4">
              <span>評価基準:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>85+ (優秀)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>70-84 (良好)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>55-69 (要改善)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>54以下 (要対策)</span>
              </div>
            </div>
          </div>

          {/* ベスト・ワーストプラクティス */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <h3 className="text-lg font-bold text-green-400 mb-4">🏆 ベストプラクティス</h3>
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-1">立神リハ温泉病院</h4>
                  <p className="text-sm text-gray-300">イノベーション指数94点 - AI活用リハビリ改善提案を全施設展開</p>
                  <div className="text-xs text-green-400 mt-1">💡 月平均18件の革新的提案</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-1">小原病院</h4>
                  <p className="text-sm text-gray-300">知識共有91点 - メンター制度による組織学習促進</p>
                  <div className="text-xs text-green-400 mt-1">📚 改善事例の96%が他部門で活用</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <h3 className="text-lg font-bold text-orange-400 mb-4">⚠️ 改善要対象</h3>
              <div className="space-y-3">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-1">介護医療院</h4>
                  <p className="text-sm text-gray-300">成熟度71点 - 投稿活動の活性化とリーダーシップ強化が必要</p>
                  <div className="text-xs text-orange-400 mt-1">📋 改善計画: メンター派遣・研修強化</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 人材開発 */}
      {activeView === 'talent' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">次世代リーダー候補</h3>
            <div className="space-y-4">
              {talentDevelopment.map(talent => (
                <div key={talent.employeeId} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{talent.name}</h4>
                      <div className="text-sm text-gray-400">
                        {talent.facility} • {talent.department} • Level {talent.currentLevel}
                      </div>
                      {talent.successorFor && (
                        <div className="text-xs text-blue-400 mt-1">
                          後継候補: {talent.successorFor}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPotentialColor(talent.potentialRating)}`}>
                      {talent.potentialRating === 'high' ? '高ポテンシャル' :
                       talent.potentialRating === 'medium' ? '中ポテンシャル' : '標準'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{talent.innovationContribution}</div>
                      <div className="text-xs text-gray-400">革新貢献</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{talent.leadershipIndicators}</div>
                      <div className="text-xs text-gray-400">リーダーシップ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{talent.mentorshipActivity}</div>
                      <div className="text-xs text-gray-400">メンター活動</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{talent.promotionReadiness}</div>
                      <div className="text-xs text-gray-400">昇進準備度</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-600 flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      育成計画詳細
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      アセスメント履歴
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ナレッジ資産 */}
      {activeView === 'knowledge' && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">組織ナレッジ資産ポートフォリオ</h3>
          <div className="space-y-4">
            {knowledgeAssets.map((asset, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{asset.category}</h4>
                    <div className="text-sm text-gray-400">{asset.assetCount}件のナレッジ資産</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-400">¥{asset.businessValue}M</span>
                    <span className="text-lg">
                      {asset.trendDirection === 'up' ? '📈' : 
                       asset.trendDirection === 'down' ? '📉' : '➡️'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{asset.utilizationRate}%</div>
                    <div className="text-xs text-gray-400">活用率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{asset.qualityScore}</div>
                    <div className="text-xs text-gray-400">品質スコア</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{asset.assetCount}</div>
                    <div className="text-xs text-gray-400">資産数</div>
                  </div>
                </div>

                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      asset.utilizationRate >= 85 ? 'bg-green-400' :
                      asset.utilizationRate >= 70 ? 'bg-yellow-400' : 'bg-orange-400'
                    }`}
                    style={{ width: `${asset.utilizationRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 組織変革 */}
      {activeView === 'transformation' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">戦略的変革イニシアチブ進捗</h3>
            <div className="space-y-4">
              {organizationalChanges.map(change => (
                <div key={change.initiativeId} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{change.name}</h4>
                      <div className="text-sm text-gray-400">
                        対象: {change.scope.join('、')}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(change.stage)}`}>
                      {change.stage === 'planning' ? '計画中' :
                       change.stage === 'piloting' ? 'パイロット' :
                       change.stage === 'rolling_out' ? '展開中' :
                       change.stage === 'embedding' ? '定着化' : '完了'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{change.adoption}%</div>
                      <div className="text-xs text-gray-400">採用率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-400">{change.resistance}%</div>
                      <div className="text-xs text-gray-400">抵抗度</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">{change.impact}%</div>
                      <div className="text-xs text-gray-400">インパクト</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">施設別サポートスコア</h5>
                    <div className="space-y-1">
                      {Object.entries(change.facilitySupportScore).map(([facility, score]) => (
                        <div key={facility} className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{facility}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-sm text-white w-8">{score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-600 flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      詳細進捗
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      リスク分析
                    </button>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors">
                      アクションプラン
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

export default StrategicPostingAnalytics;