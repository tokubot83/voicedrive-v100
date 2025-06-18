import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GenerationalAnalysisService } from '../services/GenerationalAnalysisService';
import { useDemoMode } from '../components/demo/DemoModeController';

interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

interface GenerationData {
  name: string;
  ageRange: string;
  count: number;
  percentage: number;
  characteristics: string[];
}

interface AnalysisResult {
  scope: AnalysisScope;
  generations: GenerationData[];
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
  };
}

const GenerationalAnalysisPage: React.FC = () => {
  const { isDemoMode, currentUser } = useDemoMode();
  const navigate = useNavigate();
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>({ type: 'facility' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'participation' | 'collaboration'>('engagement');

  // レベル7以上のみアクセス可能
  if (!currentUser || currentUser.permissionLevel < 7) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-300 mb-6">
            世代間分析にはレベル7以上の権限が必要です。
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

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const result = await GenerationalAnalysisService.getGenerationalAnalysis(analysisScope);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to load generational analysis:', error);
    } finally {
      setLoading(false);
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
        return '参加率 (%)';
      case 'collaboration':
        return 'コラボレーション指数';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full h-full">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">世代間分析を実行中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full h-full">
        {/* ヘッダー */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all duration-200 backdrop-blur-sm border border-gray-700/30"
                >
                  <ArrowLeft size={18} />
                  戻る
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">👥</span>
                    世代間分析（全体）
                  </h1>
                  <p className="text-gray-400 mt-1">
                    ユーザーの投票行動・投稿・コメント・プロジェクト参加データに基づく世代間特性分析
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">権限レベル</div>
                <div className="text-xl font-bold text-blue-400">Level {currentUser.permissionLevel}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">

          {/* スコープ選択 */}
          <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-2xl mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">分析範囲</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleScopeChange({ type: 'facility', facilityId: currentUser.facilityId })}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium ${
                    analysisScope.type === 'facility'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/30'
                  }`}
                >
                  🏥 施設全体
                </button>
                <button
                  onClick={() => handleScopeChange({ type: 'department', departmentId: currentUser.departmentId })}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium ${
                    analysisScope.type === 'department'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/30'
                  }`}
                >
                  📊 部署別
                </button>
                <button
                  onClick={() => handleScopeChange({ type: 'corporate' })}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium ${
                    analysisScope.type === 'corporate'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/30'
                  }`}
                >
                  🏢 法人全体
                </button>
              </div>
            </div>
          </div>

        {analysisResult && (
          <>
            {/* 世代構成 */}
            <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-2xl mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">世代構成</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analysisResult.generations.map((gen, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                      <h3 className="font-semibold text-white mb-2">{gen.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{gen.ageRange}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-blue-400">{gen.count}</span>
                        <span className="text-sm text-gray-300">{gen.percentage}%</span>
                      </div>
                      <div className="space-y-1">
                        {gen.characteristics.map((char, charIndex) => (
                          <div key={charIndex} className="text-xs text-gray-400 bg-gray-700/50 rounded px-2 py-1">
                            {char}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* メトリクス可視化 */}
            <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-2xl mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">世代別メトリクス</h2>
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
                      参加率
                    </button>
                    <button
                      onClick={() => setSelectedMetric('collaboration')}
                      className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
                        selectedMetric === 'collaboration'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/30'
                      }`}
                    >
                      コラボレーション
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(getMetricData()).map(([generation, value]) => (
                    <div key={generation} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-300">{generation}</div>
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
            </div>

            {/* 分析結果 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* サマリー */}
              <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-2xl">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>📋</span>
                    分析概要
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">{analysisResult.insights.summary}</p>
                  </div>
                </div>
              </div>

              {/* 詳細分析 */}
              <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-2xl">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🔍</span>
                    詳細分析
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">{analysisResult.insights.analysis}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 推奨事項 */}
            <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-2xl mt-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💡</span>
                  推奨事項
                </h2>
                <div className="space-y-3">
                  {analysisResult.insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-semibold mt-0.5 backdrop-blur-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default GenerationalAnalysisPage;