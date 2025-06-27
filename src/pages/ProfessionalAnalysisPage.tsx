import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalAnalysisService } from '../services/ProfessionalAnalysisService';
import { useDemoMode } from '../components/demo/DemoModeController';
import { facilities } from '../data/medical/facilities';
import { departments } from '../data/medical/departments';
import { MobileFooter } from '../components/layout/MobileFooter';
import { getAnalysisTitle, getAnalysisScopeByPermission, getDepartmentDisplayName, getFacilityDisplayName, getPositionByLevel } from '../utils/analysisUtils';

interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

interface ProfessionData {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
  avgVotingWeight: number;
  avgExperience: number;
  avgPermissionLevel: number;
  characteristics: string[];
  licenseBased: boolean;
  approvalAuthority: 'high' | 'medium' | 'low';
}

interface ProfessionInteraction {
  profession1: string;
  profession2: string;
  collaborationIndex: number;
  conflictLevel: number;
  communicationFrequency: number;
  projects: number;
}

interface AnalysisResult {
  scope: AnalysisScope;
  professions: ProfessionData[];
  interactions: ProfessionInteraction[];
  insights: {
    summary: string;
    analysis: string;
    recommendations: string[];
  };
  metrics: {
    engagement: { [key: string]: number };
    participation: { [key: string]: number };
    votingPatterns: { [key: string]: any };
    collaborationIndex: { [key: string]: number };
    approvalEfficiency: { [key: string]: number };
  };
  categoryDistribution: {
    medical: number;
    nursing: number;
    rehabilitation: number;
    care: number;
    administrative: number;
    [key: string]: number;
  };
}

const ProfessionalAnalysisPage: React.FC = () => {
  const { isDemoMode, currentUser } = useDemoMode();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'categories' | 'interactions' | 'analytics'>('overview');
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>({ type: 'corporate' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'participation' | 'collaboration' | 'approval'>('engagement');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | 'all'>('all');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | 'all'>('all');
  const [facilityAnalysisResults, setFacilityAnalysisResults] = useState<{[key: string]: AnalysisResult}>({});
  const [departmentAnalysisResults, setDepartmentAnalysisResults] = useState<{[key: string]: AnalysisResult}>({});

  // レベル7以上のみアクセス可能
  if (!currentUser || currentUser.permissionLevel < 7) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-300 mb-6">
            職種間分析にはレベル7以上の権限が必要です。
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            ホーム
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadAnalysis();
  }, [analysisScope]);

  useEffect(() => {
    // 初回ロード時に全施設のデータも取得
    if (selectedTab === 'categories') {
      facilities.forEach(facility => {
        loadFacilityAnalysis(facility.id);
      });
    }
  }, [selectedTab]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const result = await ProfessionalAnalysisService.getProfessionalAnalysis(analysisScope);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to load professional analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFacilityAnalysis = async (facilityId: string) => {
    try {
      const result = await ProfessionalAnalysisService.getProfessionalAnalysis({
        type: 'facility',
        facilityId
      });
      setFacilityAnalysisResults(prev => ({
        ...prev,
        [facilityId]: result
      }));
    } catch (error) {
      console.error('Failed to load facility analysis:', error);
    }
  };

  const loadDepartmentAnalysis = async (departmentId: string) => {
    try {
      const result = await ProfessionalAnalysisService.getProfessionalAnalysis({
        type: 'department',
        departmentId
      });
      setDepartmentAnalysisResults(prev => ({
        ...prev,
        [departmentId]: result
      }));
    } catch (error) {
      console.error('Failed to load department analysis:', error);
    }
  };

  const handleScopeChange = (newScope: AnalysisScope) => {
    setAnalysisScope(newScope);
  };

  const getMetricData = () => {
    if (!analysisResult) return {};
    switch (selectedMetric) {
      case 'engagement':
        return analysisResult.metrics.engagement;
      case 'participation':
        return analysisResult.metrics.participation;
      case 'collaboration':
        return analysisResult.metrics.collaborationIndex;
      case 'approval':
        return analysisResult.metrics.approvalEfficiency;
      default:
        return {};
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'engagement':
        return 'エンゲージメント指数';
      case 'participation':
        return '参加率 (%)';
      case 'collaboration':
        return 'コラボレーション指数';
      case 'approval':
        return '承認効率 (%)';
      default:
        return '';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'medical': 'bg-red-500/20 text-red-400',
      'nursing': 'bg-blue-500/20 text-blue-400',
      'nursing_support': 'bg-cyan-500/20 text-cyan-400',
      'rehabilitation': 'bg-green-500/20 text-green-400',
      'care': 'bg-purple-500/20 text-purple-400',
      'administrative': 'bg-gray-500/20 text-gray-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      'medical': '医療職',
      'nursing': '看護職',
      'nursing_support': '看護補助',
      'rehabilitation': 'リハビリ職',
      'care': '介護職',
      'administrative': '事務職'
    };
    return names[category] || category;
  };

  const renderAnalysisResult = (result: AnalysisResult) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {result.professions.slice(0, 8).map((profession, index) => (
          <div key={index} className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white">{profession.name}</h4>
              <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(profession.category)}`}>
                {getCategoryName(profession.category)}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{profession.count}名</div>
            <div className="text-sm text-gray-400 mb-2">{profession.percentage}%</div>
            {profession.licenseBased && (
              <div className="text-xs text-green-400">有資格者</div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              投票重み: {profession.avgVotingWeight.toFixed(1)} | 経験: {profession.avgExperience.toFixed(1)}年
            </div>
          </div>
        ))}
      </div>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300">{result.insights.summary}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">職種間分析を実行中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-16 md:pb-0">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getAnalysisTitle('professional', currentUser?.permissionLevel || 1, getDepartmentDisplayName(currentUser?.department || ''), getFacilityDisplayName(currentUser?.facility_id || ''))}
            </h1>
            <p className="text-gray-400 text-sm">
              {getAnalysisScopeByPermission(currentUser?.permissionLevel || 1, getDepartmentDisplayName(currentUser?.department || ''), getFacilityDisplayName(currentUser?.facility_id || '')).description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">役職</div>
              <div className="text-lg font-bold text-blue-400">{getPositionByLevel(currentUser?.permissionLevel || 1)}</div>
              <div className="text-sm text-gray-500">Lv.{currentUser?.permissionLevel || 1} • {currentUser?.name || 'ゲスト'}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">

          {/* 統計カードレイアウト */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 職種数カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">👩‍⚕️</div>
              <h4 className="font-bold text-white mb-2">職種数</h4>
              <div className="text-3xl font-bold text-blue-400 mb-1">{analysisResult?.professions.length || 0}</div>
              <p className="text-sm text-gray-400">医療専門職種</p>
              <div className="mt-3 text-xs text-gray-500">
                有資格職種: {analysisResult?.professions.filter(p => p.licenseBased).length || 0}
              </div>
            </div>

            {/* 総職員数カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🏥</div>
              <h4 className="font-bold text-white mb-2">総職員数</h4>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {analysisResult?.professions.reduce((sum, p) => sum + p.count, 0) || 0}
              </div>
              <p className="text-sm text-gray-400">全職種合計</p>
              <div className="mt-3 text-xs text-gray-500">
                法人全体
              </div>
            </div>

            {/* 協働指数カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🤝</div>
              <h4 className="font-bold text-white mb-2">職種間協働</h4>
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {analysisResult ? Math.max(...Object.values(analysisResult.metrics.collaborationIndex)).toFixed(1) : '0.0'}
              </div>
              <p className="text-sm text-gray-400">最高協働指数</p>
              <div className="mt-3 text-xs text-gray-500">
                多職種連携
              </div>
            </div>

            {/* 承認効率カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-white mb-2">承認効率</h4>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {analysisResult ? Math.max(...Object.values(analysisResult.metrics.approvalEfficiency)).toFixed(1) : '0.0'}%
              </div>
              <p className="text-sm text-gray-400">最高効率</p>
              <div className="mt-3 text-xs text-gray-500">
                専門性重み付け
              </div>
            </div>
          </div>

      {/* タブナビゲーション */}
      <div className="bg-gray-800/50 p-4">
        <div className="px-6">
          <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'categories', label: '職種別', icon: '👩‍⚕️' },
              { id: 'interactions', label: '職種間関係', icon: '🤝' },
              { id: 'analytics', label: '詳細分析', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        <div className="">
          {selectedTab === 'overview' && analysisResult && (
            <div className="space-y-6">
              {/* 職種構成グリッド */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">👩‍⚕️</span>
                  職種構成概要
                </h2>
                {renderAnalysisResult(analysisResult)}
              </div>

              {/* カテゴリ分布 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  職種カテゴリ分布
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(analysisResult.categoryDistribution).map(([category, count]) => (
                    <div key={category} className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className={`px-2 py-1 rounded mb-2 ${getCategoryColor(category)}`}>
                        {getCategoryName(category)}
                      </div>
                      <div className="text-2xl font-bold text-white">{count}</div>
                      <div className="text-sm text-gray-400">名</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* インサイト */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  分析インサイト
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">概要</h3>
                    <p className="text-gray-300">{analysisResult.insights.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">詳細分析</h3>
                    <p className="text-gray-300">{analysisResult.insights.analysis}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">推奨事項</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {analysisResult.insights.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'categories' && analysisResult && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">職種別詳細分析</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisResult.professions.map((profession, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">{profession.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(profession.category)}`}>
                          {getCategoryName(profession.category)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">{profession.count}</div>
                          <div className="text-xs text-gray-400">職員数</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">{profession.percentage}%</div>
                          <div className="text-xs text-gray-400">構成比</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">投票重み:</span>
                          <span className="text-cyan-400">{profession.avgVotingWeight.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">平均経験:</span>
                          <span className="text-yellow-400">{profession.avgExperience.toFixed(1)}年</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">権限レベル:</span>
                          <span className="text-purple-400">{profession.avgPermissionLevel.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">資格要件:</span>
                          <span className={profession.licenseBased ? "text-green-400" : "text-gray-500"}>
                            {profession.licenseBased ? "必要" : "不要"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs text-gray-500 mb-2">特徴:</div>
                        <div className="flex flex-wrap gap-1">
                          {profession.characteristics.map((char, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-600/30 rounded text-xs text-gray-300">
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'interactions' && analysisResult && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">職種間協働関係</h2>
                <div className="space-y-4">
                  {analysisResult.interactions.slice(0, 10).map((interaction, index) => {
                    const prof1 = analysisResult.professions.find(p => p.id === interaction.profession1);
                    const prof2 = analysisResult.professions.find(p => p.id === interaction.profession2);
                    return (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">{prof1?.name}</span>
                            <span className="text-gray-400">↔</span>
                            <span className="text-white font-medium">{prof2?.name}</span>
                          </div>
                          <div className="text-cyan-400 font-bold">
                            {(interaction.collaborationIndex * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">コミュニケーション頻度</div>
                            <div className="text-yellow-400">{(interaction.communicationFrequency * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">共同プロジェクト</div>
                            <div className="text-green-400">{interaction.projects}件</div>
                          </div>
                          <div>
                            <div className="text-gray-400">競合レベル</div>
                            <div className="text-red-400">{(interaction.conflictLevel * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${interaction.collaborationIndex * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && analysisResult && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">詳細メトリクス分析</h2>
                
                <div className="flex gap-4 mb-6">
                  {[
                    { id: 'engagement', label: 'エンゲージメント', icon: '💡' },
                    { id: 'participation', label: '参加率', icon: '🎯' },
                    { id: 'collaboration', label: '協働指数', icon: '🤝' },
                    { id: 'approval', label: '承認効率', icon: '⚡' }
                  ].map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => setSelectedMetric(metric.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        selectedMetric === metric.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50'
                      }`}
                    >
                      <span>{metric.icon}</span>
                      <span>{metric.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">{getMetricLabel()}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(getMetricData()).map(([profession, value]) => (
                      <div key={profession} className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">{profession}</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-blue-400">
                            {typeof value === 'number' ? value.toFixed(1) : '---'}
                          </div>
                          <div className="w-20 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                              style={{ width: `${Math.min((typeof value === 'number' ? value : 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
};

export default ProfessionalAnalysisPage;