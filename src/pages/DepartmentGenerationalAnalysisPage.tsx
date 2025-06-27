import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenerationalAnalysisService } from '../services/GenerationalAnalysisService';
import { useDemoMode } from '../components/demo/DemoModeController';
import { facilities } from '../data/medical/facilities';
import { departments } from '../data/medical/departments';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

interface AnalysisScope {
  type: 'department';
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

const DepartmentGenerationalAnalysisPage: React.FC = () => {
  const { isDemoMode, currentUser } = useDemoMode();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'metrics' | 'insights'>('overview');
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>({ type: 'department' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'participation' | 'collaboration'>('engagement');

  // レベル3以上のみアクセス可能（部門内分析）
  if (!currentUser || currentUser.permissionLevel < 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-300 mb-6">
            部門内世代間分析にはレベル3以上の権限が必要です。
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
    if (currentUser) {
      // レベル3ユーザーは自分の部門のみ分析可能
      const scope: AnalysisScope = {
        type: 'department',
        departmentId: currentUser.department
      };
      setAnalysisScope(scope);
      performAnalysis(scope);
    }
  }, [currentUser]);

  const performAnalysis = async (scope: AnalysisScope) => {
    setLoading(true);
    try {
      const result = await GenerationalAnalysisService.analyzeGenerations(scope);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGenerationColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500', 
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-yellow-500 to-amber-500'
    ];
    return colors[index % colors.length];
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* スコープ表示 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-2">分析範囲</h3>
        <p className="text-gray-300">
          部門: {currentUser?.department || '不明'} （レベル{currentUser?.permissionLevel}権限）
        </p>
        <p className="text-gray-400 text-sm mt-1">
          部門内のメンバーの世代間特性と傾向を分析します
        </p>
      </div>

      {/* 世代分布 */}
      {analysisResult?.generations && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">世代分布</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisResult.generations.map((generation, index) => (
              <div key={generation.name} className="bg-gray-900/50 rounded-lg p-4">
                <div className={`w-full h-2 bg-gradient-to-r ${getGenerationColor(index)} rounded-full mb-3`} />
                <h4 className="font-semibold text-white">{generation.name}</h4>
                <p className="text-gray-400 text-sm">{generation.ageRange}</p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">{generation.count}</span>
                  <span className="text-gray-400 ml-1">名</span>
                  <span className="text-gray-400 ml-2">({generation.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* インサイト概要 */}
      {analysisResult?.insights && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">分析概要</h3>
          <p className="text-gray-300 mb-4">{analysisResult.insights.summary}</p>
          <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
            <h4 className="font-medium text-blue-300 mb-2">主要な分析結果</h4>
            <p className="text-blue-100 text-sm">{analysisResult.insights.analysis}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      {/* メトリクス選択 */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex gap-4 mb-4">
          {(['engagement', 'participation', 'collaboration'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              {metric === 'engagement' ? 'エンゲージメント' :
               metric === 'participation' ? '参加率' : 'コラボレーション'}
            </button>
          ))}
        </div>

        {/* メトリクス表示 */}
        {analysisResult?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysisResult.metrics[selectedMetric]).map(([generation, value]) => (
              <div key={generation} className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">{generation}</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${typeof value === 'number' ? value : 0}%` }}
                    />
                  </div>
                  <span className="text-white font-medium">
                    {typeof value === 'number' ? value.toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      {analysisResult?.insights && (
        <>
          {/* 推奨事項 */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">推奨事項</h3>
            <div className="space-y-3">
              {analysisResult.insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-green-100 flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 部門特化インサイト */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">部門特化インサイト</h3>
            <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
              <h4 className="font-medium text-purple-300 mb-2">部門内コミュニケーション</h4>
              <p className="text-purple-100 text-sm mb-3">
                {currentUser?.department}における世代間の特徴を活かした効果的なチーム運営のポイントを示します。
              </p>
              <ul className="text-purple-100 text-sm space-y-1">
                <li>• 世代間メンタリング制度の活用</li>
                <li>• 多様性を活かしたプロジェクトチーム編成</li>
                <li>• 世代別コミュニケーション手法の最適化</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 m-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <span className="text-xl">←</span>
              <span>ホーム</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">部門内世代間分析</h1>
              <p className="text-gray-300 text-sm mt-1">部門メンバーの世代間特性分析</p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="px-4">
        <div className="border-b border-gray-700/50 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'metrics', label: 'メトリクス', icon: '📈' },
              { id: 'insights', label: 'インサイト', icon: '💡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-400">分析中...</p>
            </div>
          </div>
        ) : (
          <>
            {selectedTab === 'overview' && renderOverview()}
            {selectedTab === 'metrics' && renderMetrics()}
            {selectedTab === 'insights' && renderInsights()}
          </>
        )}
      </div>

      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default DepartmentGenerationalAnalysisPage;