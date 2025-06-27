import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HierarchicalAnalysisService } from '../services/HierarchicalAnalysisService';
import { useDemoMode } from '../components/demo/DemoModeController';
import { facilities } from '../data/medical/facilities';
import { departments } from '../data/medical/departments';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { getAnalysisTitle, getAnalysisScopeByPermission, getDepartmentDisplayName, getFacilityDisplayName, getPositionByLevel } from '../utils/analysisUtils';

interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

interface HierarchyData {
  name: string;
  levelRange: string;
  count: number;
  percentage: number;
  characteristics: string[];
  averageExperience: number;
  averageDirectReports: number;
}

interface AnalysisResult {
  scope: AnalysisScope;
  hierarchies: HierarchyData[];
  insights: {
    summary: string;
    analysis: string;
    recommendations: string[];
  };
  metrics: {
    engagement: { [key: string]: number };
    participation: { [key: string]: number };
    decisionMaking: { [key: string]: any };
    collaborationIndex: { [key: string]: number };
  };
}

const HierarchicalAnalysisPage: React.FC = () => {
  const { isDemoMode, currentUser } = useDemoMode();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'facilities' | 'departments' | 'analytics'>('overview');
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>({ type: 'corporate' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'participation' | 'collaboration'>('engagement');
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
            階層間分析にはレベル7以上の権限が必要です。
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
    if (selectedTab === 'facilities') {
      facilities.forEach(facility => {
        loadFacilityAnalysis(facility.id);
      });
    }
  }, [selectedTab]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const result = await HierarchicalAnalysisService.getHierarchicalAnalysis(analysisScope);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to load hierarchical analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFacilityAnalysis = async (facilityId: string) => {
    try {
      const result = await HierarchicalAnalysisService.getHierarchicalAnalysis({
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
      const result = await HierarchicalAnalysisService.getHierarchicalAnalysis({
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
      default:
        return {};
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'engagement':
        return 'エンゲージメント指数';
      case 'participation':
        return '意思決定参加率 (%)';
      case 'collaboration':
        return '階層間コラボレーション指数';
      default:
        return '';
    }
  };

  const renderAnalysisResult = (result: AnalysisResult) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {result.hierarchies.map((hier, index) => (
          <div key={index} className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-bold text-white mb-2">{hier.name}</h4>
            <div className="text-2xl font-bold text-blue-400 mb-1">{hier.count}名</div>
            <div className="text-sm text-gray-400">{hier.percentage}%</div>
            <div className="text-xs text-gray-500 mt-2">
              平均経験: {hier.averageExperience}年 | 平均部下: {hier.averageDirectReports}名
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
            <p className="text-gray-400">階層間分析を実行中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-16 md:pb-0">
      {/* カスタムヘッダー（法人統合ダッシュボードと同じ構造） */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getAnalysisTitle('hierarchical', currentUser?.permissionLevel || 1, getDepartmentDisplayName(currentUser?.department || ''), getFacilityDisplayName(currentUser?.facility_id || ''))}
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

      {/* 統計カードレイアウト（法人統合ダッシュボードと同じ） */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 分析対象カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-white mb-2">分析対象</h4>
              <div className="text-3xl font-bold text-blue-400 mb-1">{analysisResult?.hierarchies.reduce((sum, h) => sum + h.count, 0) || 0}</div>
              <p className="text-sm text-gray-400">総ユーザー数</p>
              <div className="mt-3 text-xs text-gray-500">
                全階層・全部門
              </div>
            </div>

            {/* 階層数カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🏗️</div>
              <h4 className="font-bold text-white mb-2">階層数</h4>
              <div className="text-3xl font-bold text-green-400 mb-1">{analysisResult?.hierarchies.length || 0}</div>
              <p className="text-sm text-gray-400">組織階層</p>
              <div className="mt-3 text-xs text-gray-500">
                経営層～一般職員
              </div>
            </div>

            {/* エンゲージメントカード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">📈</div>
              <h4 className="font-bold text-white mb-2">エンゲージメント</h4>
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {analysisResult ? Math.max(...Object.values(analysisResult.metrics.engagement)).toFixed(1) : '0.0'}
              </div>
              <p className="text-sm text-gray-400">最高スコア</p>
              <div className="mt-3 text-xs text-gray-500">
                階層別最高値
              </div>
            </div>

            {/* 意思決定参加率カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-bold text-white mb-2">意思決定参加</h4>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {analysisResult ? Math.max(...Object.values(analysisResult.metrics.participation)).toFixed(1) : '0.0'}%
              </div>
              <p className="text-sm text-gray-400">最高参加率</p>
              <div className="mt-3 text-xs text-gray-500">
                提案・承認・決定
              </div>
            </div>
          </div>
        </div>

      {/* タブナビゲーション */}
      <div className="bg-gray-800/50 p-4">
        <div className="px-6">
          <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'facilities', label: '施設別', icon: '🏥' },
              { id: 'departments', label: '部門別', icon: '👥' },
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
              {/* 階層構成グリッド */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  階層構成（法人全体）
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {analysisResult.hierarchies.map((hier, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all duration-300 hover:scale-105">
                      <div className="text-2xl mb-2">
                        {hier.name === '経営層' ? '👔' : 
                         hier.name === '上級管理職' ? '🎖️' :
                         hier.name === '中間管理職' ? '📋' :
                         hier.name === '主任・リーダー' ? '🔧' : '👤'}
                      </div>
                      <h4 className="font-bold text-white mb-2 text-sm">{hier.name}</h4>
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">レベル</span>
                          <span className="text-blue-400 font-medium">{hier.levelRange}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">人数</span>
                          <span className="text-cyan-400 font-medium">{hier.count}名</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">割合</span>
                          <span className="text-yellow-400 font-medium">{hier.percentage}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">経験</span>
                          <span className="text-green-400 font-medium">{hier.averageExperience}年</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${hier.percentage}%` }}
                        />
                      </div>
                      <div className="mt-3 space-y-1">
                        {hier.characteristics.slice(0, 2).map((char, charIndex) => (
                          <div key={charIndex} className="text-xs text-gray-400 bg-gray-600/50 rounded px-2 py-1">
                            {char}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* メトリクス可視化 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">階層別メトリクス</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMetric('engagement')}
                      className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                        selectedMetric === 'engagement'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/30'
                      }`}
                    >
                      エンゲージメント
                    </button>
                    <button
                      onClick={() => setSelectedMetric('participation')}
                      className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                        selectedMetric === 'participation'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/30'
                      }`}
                    >
                      意思決定参加
                    </button>
                    <button
                      onClick={() => setSelectedMetric('collaboration')}
                      className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                        selectedMetric === 'collaboration'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/30'
                      }`}
                    >
                      階層間連携
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(getMetricData()).map(([hierarchy, value]) => (
                    <div key={hierarchy} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-300">{hierarchy}</div>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-4 relative backdrop-blur-sm">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20"
                          style={{ width: `${Math.min(100, (value / Math.max(...Object.values(getMetricData()))) * 100)}%` }}
                        />
                      </div>
                      <div className="w-16 text-sm text-gray-300 text-right">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                        {selectedMetric === 'participation' ? '%' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{getMetricLabel()}</p>
              </div>

              {/* 分析サマリー */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>📋</span>
                    分析概要
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">{analysisResult.insights.summary}</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🔍</span>
                    詳細分析
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">{analysisResult.insights.analysis}</p>
                  </div>
                </div>
              </div>

              {/* 推奨事項 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>💡</span>
                  推奨事項
                </h2>
                <div className="space-y-3">
                  {analysisResult.insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'facilities' && (
            <div className="space-y-6">
              {/* 施設フィルター */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <label className="text-white font-medium">施設選択:</label>
                  <select 
                    value={selectedFacilityId}
                    onChange={(e) => {
                      setSelectedFacilityId(e.target.value);
                      if (e.target.value !== 'all') {
                        loadFacilityAnalysis(e.target.value);
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="all">全施設比較</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>{facility.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedFacilityId === 'all' ? (
                /* 全施設比較ビュー */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {facilities.map(facility => {
                    const facilityResult = facilityAnalysisResults[facility.id];
                    return (
                      <div key={facility.id} className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">{facility.name}</h3>
                        {facilityResult ? (
                          <div className="space-y-3">
                            <div className="text-sm">
                              <span className="text-gray-400">総人数:</span>
                              <span className="text-white ml-2">{facilityResult.hierarchies.reduce((sum, h) => sum + h.count, 0)}名</span>
                            </div>
                            <div className="space-y-2">
                              {facilityResult.hierarchies.map((hier, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span className="text-gray-400">{hier.name}</span>
                                  <span className="text-cyan-400">{hier.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">データ読み込み中...</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 個別施設詳細ビュー */
                facilityAnalysisResults[selectedFacilityId] && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h2 className="text-xl font-bold text-white mb-4">
                        {facilities.find(f => f.id === selectedFacilityId)?.name} - 階層間分析
                      </h2>
                      {renderAnalysisResult(facilityAnalysisResults[selectedFacilityId])}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {selectedTab === 'departments' && (
            <div className="space-y-6">
              {/* 部署フィルター */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <label className="text-white font-medium">部署選択:</label>
                  <select 
                    value={selectedDepartmentId}
                    onChange={(e) => {
                      setSelectedDepartmentId(e.target.value);
                      if (e.target.value !== 'all') {
                        loadDepartmentAnalysis(e.target.value);
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="all">全部署比較</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({facilities.find(f => f.id === dept.facility)?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 部署別分析結果表示 */}
              {selectedDepartmentId !== 'all' && departmentAnalysisResults[selectedDepartmentId] && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    {departments.find(d => d.id === selectedDepartmentId)?.name} - 階層間分析
                  </h2>
                  {renderAnalysisResult(departmentAnalysisResults[selectedDepartmentId])}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'analytics' && analysisResult && (
            <div className="space-y-6">
              {/* 階層間意思決定パターン分析 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">階層別意思決定パターン</h2>
                <div className="space-y-4">
                  {analysisResult.hierarchies.map((hier, index) => {
                    const decisionPattern = analysisResult.metrics.decisionMaking[hier.name];
                    return (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-white mb-3">{hier.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-400">参加率</div>
                            <div className="text-xl font-bold text-blue-400">
                              {decisionPattern?.participationRate?.toFixed(1) || '0.0'}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">承認率</div>
                            <div className="text-xl font-bold text-green-400">
                              {decisionPattern?.approvalRate?.toFixed(1) || '0.0'}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">提案開始率</div>
                            <div className="text-xl font-bold text-purple-400">
                              {decisionPattern?.initiationRate?.toFixed(1) || '0.0'}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">影響力スコア</div>
                            <div className="text-xl font-bold text-yellow-400">
                              {decisionPattern?.influenceScore?.toFixed(0) || '0'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 階層間コラボレーション分析 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">階層間コラボレーション分析</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisResult.hierarchies.map((hier, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-xl p-4">
                      <h3 className="text-lg font-medium text-white mb-2">{hier.name}</h3>
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {analysisResult.metrics.collaborationIndex[hier.name]?.toFixed(1) || '0.0'}%
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-purple-400 h-2 rounded-full"
                          style={{ width: `${analysisResult.metrics.collaborationIndex[hier.name] || 0}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-2">階層横断プロジェクト参加率</p>
                      <div className="text-xs text-gray-500 mt-1">
                        平均部下数: {hier.averageDirectReports}名
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Footer */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default HierarchicalAnalysisPage;