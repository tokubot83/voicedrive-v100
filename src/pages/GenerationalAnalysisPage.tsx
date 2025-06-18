import React, { useState, useEffect } from 'react';
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
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>({ type: 'facility' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'participation' | 'collaboration'>('engagement');

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
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">世代間分析を実行中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">👥</span>
            世代間分析（全体）
          </h1>
          <p className="text-gray-400">
            ユーザーの投票行動・投稿・コメント・プロジェクト参加データに基づく世代間特性分析
          </p>
        </div>

        {/* スコープ選択 */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">分析範囲</h2>
            <div className="flex gap-4">
              <Button
                variant={analysisScope.type === 'facility' ? 'primary' : 'secondary'}
                onClick={() => handleScopeChange({ type: 'facility', facilityId: currentUser.facilityId })}
              >
                🏥 施設全体
              </Button>
              <Button
                variant={analysisScope.type === 'department' ? 'primary' : 'secondary'}
                onClick={() => handleScopeChange({ type: 'department', departmentId: currentUser.departmentId })}
              >
                📊 部署別
              </Button>
              <Button
                variant={analysisScope.type === 'corporate' ? 'primary' : 'secondary'}
                onClick={() => handleScopeChange({ type: 'corporate' })}
              >
                🏢 法人全体
              </Button>
            </div>
          </div>
        </Card>

        {analysisResult && (
          <>
            {/* 世代構成 */}
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">世代構成</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analysisResult.generations.map((gen, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4">
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
            </Card>

            {/* メトリクス可視化 */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">世代別メトリクス</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedMetric === 'engagement' ? 'primary' : 'secondary'}
                      onClick={() => setSelectedMetric('engagement')}
                    >
                      エンゲージメント
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedMetric === 'participation' ? 'primary' : 'secondary'}
                      onClick={() => setSelectedMetric('participation')}
                    >
                      参加率
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedMetric === 'collaboration' ? 'primary' : 'secondary'}
                      onClick={() => setSelectedMetric('collaboration')}
                    >
                      コラボレーション
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(getMetricData()).map(([generation, value]) => (
                    <div key={generation} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-300">{generation}</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
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
            </Card>

            {/* 分析結果 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* サマリー */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>📋</span>
                    分析概要
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">{analysisResult.insights.summary}</p>
                  </div>
                </div>
              </Card>

              {/* 詳細分析 */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🔍</span>
                    詳細分析
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">{analysisResult.insights.analysis}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 推奨事項 */}
            <Card className="mt-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
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
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerationalAnalysisPage;