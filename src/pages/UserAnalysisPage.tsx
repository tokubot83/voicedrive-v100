import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAnalysisService } from '../services/UserAnalysisService';
import { useDemoMode } from '../components/demo/DemoModeController';
import { facilities } from '../data/medical/facilities';
import { departments } from '../data/medical/departments';
import { MobileFooter } from '../components/layout/MobileFooter';

interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

interface UserMetrics {
  totalUsers: number;
  totalGenerations: number;
  totalHierarchies: number;
  engagementScore: number;
  participationRate: number;
  collaborationIndex: number;
  satisfactionScore: number;
}

interface CrossAnalysisData {
  generation: string;
  hierarchy: string;
  count: number;
  avgEngagement: number;
  avgParticipation: number;
  characteristics: string[];
}

interface UserRanking {
  id: string;
  name: string;
  position: string;
  facility: string;
  department: string;
  permissionLevel: number;
  experienceYears: number;
  directReports: number;
  budgetAuthority: number;
  rankingScore: number;
  generation: string;
  hierarchy: string;
  engagementScore: number;
  participationRate: number;
}

interface FacilityUserStats {
  facilityId: string;
  facilityName: string;
  totalUsers: number;
  avgPermissionLevel: number;
  avgExperienceYears: number;
  generationDistribution: { [key: string]: number };
  hierarchyDistribution: { [key: string]: number };
  topPerformers: UserRanking[];
}

interface UserAnalysisResult {
  scope: AnalysisScope;
  metrics: UserMetrics;
  crossAnalysis: CrossAnalysisData[];
  userRankings: UserRanking[];
  facilityStats: FacilityUserStats[];
  departmentStats: any[];
  insights: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
  };
}

const UserAnalysisPage: React.FC = () => {
  const { isDemoMode, currentUser } = useDemoMode();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'generations' | 'hierarchies' | 'rankings' | 'facilities'>('overview');
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>(() => {
    // レベル3ユーザーは部門スコープ、レベル7以上は法人スコープをデフォルトに
    return currentUser?.permissionLevel >= 7 ? { type: 'corporate' } : { type: 'department' };
  });
  const [analysisResult, setAnalysisResult] = useState<UserAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | 'all'>('all');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | 'all'>('all');

  // レベル3以上のみアクセス可能
  if (!currentUser || currentUser.permissionLevel < 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-300 mb-6">
            ユーザー分析にはレベル3以上の権限が必要です。
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
      const result = await UserAnalysisService.getUserAnalysis(analysisScope);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to load user analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScopeChange = (newScope: AnalysisScope) => {
    setAnalysisScope(newScope);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">ユーザー分析を実行中...</p>
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
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">ユーザー分析（全体）</h1>
              <p className="text-gray-400 text-sm">包括的人材分析・世代間・階層間・パフォーマンス統合分析</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">権限レベル</div>
              <div className="text-2xl font-bold text-blue-400">Lv.{currentUser?.permissionLevel || 1}</div>
              <div className="text-sm text-gray-500">{currentUser?.name || 'ゲスト'}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">

          {/* 統計カードレイアウト */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 総ユーザー数カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="font-bold text-white mb-2">総ユーザー数</h4>
              <div className="text-3xl font-bold text-blue-400 mb-1">{analysisResult?.metrics.totalUsers || 0}</div>
              <p className="text-sm text-gray-400">法人全体</p>
              <div className="mt-3 text-xs text-gray-500">
                {analysisResult?.metrics.totalGenerations || 0}世代 × {analysisResult?.metrics.totalHierarchies || 0}階層
              </div>
            </div>

            {/* エンゲージメントカード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">💡</div>
              <h4 className="font-bold text-white mb-2">エンゲージメント</h4>
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {analysisResult?.metrics.engagementScore.toFixed(1) || '0.0'}
              </div>
              <p className="text-sm text-gray-400">活動指数</p>
              <div className="mt-3 text-xs text-gray-500">
                投稿・コメント・プロジェクト
              </div>
            </div>

            {/* 参加率カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-bold text-white mb-2">参加率</h4>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {analysisResult?.metrics.participationRate.toFixed(1) || '0.0'}%
              </div>
              <p className="text-sm text-gray-400">平均参加率</p>
              <div className="mt-3 text-xs text-gray-500">
                意思決定・提案参加
              </div>
            </div>

            {/* 満足度カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">⭐</div>
              <h4 className="font-bold text-white mb-2">満足度</h4>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {analysisResult?.metrics.satisfactionScore.toFixed(1) || '0.0'}
              </div>
              <p className="text-sm text-gray-400">5点満点</p>
              <div className="mt-3 text-xs text-gray-500">
                組織満足度指数
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
              { id: 'generations', label: '世代分析', icon: '👥' },
              { id: 'hierarchies', label: '階層分析', icon: '⚡' },
              { id: 'rankings', label: 'ランキング', icon: '🏆' },
              { id: 'facilities', label: '施設部門', icon: '🏥' }
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
              {/* 世代×階層クロス分析 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎭</span>
                  世代×階層クロス分析
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisResult.crossAnalysis.slice(0, 9).map((cross, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white text-sm">
                          {cross.generation} × {cross.hierarchy}
                        </h4>
                        <span className="text-blue-400 font-bold">{cross.count}名</span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">エンゲージメント</span>
                          <span className="text-cyan-400">{cross.avgEngagement.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">参加率</span>
                          <span className="text-yellow-400">{cross.avgParticipation.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {cross.characteristics.slice(0, 2).map((char, charIndex) => (
                          <div key={charIndex} className="text-xs text-gray-400 bg-gray-600/50 rounded px-2 py-1">
                            {char}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 組織健全性指標 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">組織健全性指標</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">エンゲージメント</h3>
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {analysisResult.metrics.engagementScore.toFixed(1)}
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (analysisResult.metrics.engagementScore / 10) * 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">前月比 +{(Math.random() * 3).toFixed(1)}%</p>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">コラボレーション</h3>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {analysisResult.metrics.collaborationIndex.toFixed(1)}%
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.metrics.collaborationIndex}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">前月比 +{(Math.random() * 2).toFixed(1)}%</p>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">満足度スコア</h3>
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {analysisResult.metrics.satisfactionScore.toFixed(1)}
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(analysisResult.metrics.satisfactionScore / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">5点満点</p>
                  </div>
                </div>
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
                    主要発見事項
                  </h2>
                  <div className="space-y-2">
                    {analysisResult.insights.keyFindings.slice(0, 3).map((finding, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-semibold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{finding}</p>
                      </div>
                    ))}
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

          {selectedTab === 'generations' && analysisResult && (
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">世代別詳細分析</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(
                  analysisResult.crossAnalysis.reduce((acc, item) => {
                    if (!acc[item.generation]) {
                      acc[item.generation] = { count: 0, engagement: 0, participation: 0, items: 0 };
                    }
                    acc[item.generation].count += item.count;
                    acc[item.generation].engagement += item.avgEngagement;
                    acc[item.generation].participation += item.avgParticipation;
                    acc[item.generation].items += 1;
                    return acc;
                  }, {} as any)
                ).map(([generation, data]: [string, any]) => (
                  <div key={generation} className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-2">{generation}</h3>
                    <div className="text-2xl font-bold text-blue-400 mb-1">{data.count}名</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">エンゲージメント</span>
                        <span className="text-cyan-400">{(data.engagement / data.items).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">参加率</span>
                        <span className="text-yellow-400">{(data.participation / data.items).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'hierarchies' && analysisResult && (
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">階層別詳細分析</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(
                  analysisResult.crossAnalysis.reduce((acc, item) => {
                    if (!acc[item.hierarchy]) {
                      acc[item.hierarchy] = { count: 0, engagement: 0, participation: 0, items: 0 };
                    }
                    acc[item.hierarchy].count += item.count;
                    acc[item.hierarchy].engagement += item.avgEngagement;
                    acc[item.hierarchy].participation += item.avgParticipation;
                    acc[item.hierarchy].items += 1;
                    return acc;
                  }, {} as any)
                ).map(([hierarchy, data]: [string, any]) => (
                  <div key={hierarchy} className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-2 text-sm">{hierarchy}</h3>
                    <div className="text-2xl font-bold text-blue-400 mb-1">{data.count}名</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">エンゲージメント</span>
                        <span className="text-cyan-400">{(data.engagement / data.items).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">参加率</span>
                        <span className="text-yellow-400">{(data.participation / data.items).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'rankings' && analysisResult && (
            <div className="space-y-6">
              {/* ユーザーランキング */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  ユーザーランキング
                  <span className="text-sm text-gray-400 font-normal">
                    (権限レベル・在籍期間・管理職責任・予算権限による総合評価)
                  </span>
                </h2>
                
                <div className="space-y-3">
                  {analysisResult.userRankings.slice(0, 20).map((user, index) => (
                    <div key={user.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* ランキング順位 */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          
                          {/* ユーザー情報 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-medium text-white">{user.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.permissionLevel >= 7 ? 'bg-purple-500/20 text-purple-400' :
                                user.permissionLevel >= 5 ? 'bg-blue-500/20 text-blue-400' :
                                user.permissionLevel >= 3 ? 'bg-green-500/20 text-green-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                Lv.{user.permissionLevel}
                              </span>
                              <span className="text-sm text-gray-400">{user.position}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-sm">
                              <div>
                                <span className="text-gray-400">施設: </span>
                                <span className="text-white">{user.facility}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">世代: </span>
                                <span className="text-cyan-400">{user.generation}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">階層: </span>
                                <span className="text-purple-400">{user.hierarchy}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">経験: </span>
                                <span className="text-green-400">{user.experienceYears}年</span>
                              </div>
                              {user.directReports > 0 && (
                                <div>
                                  <span className="text-gray-400">部下: </span>
                                  <span className="text-yellow-400">{user.directReports}名</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* スコア表示 */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">
                            {user.rankingScore}
                          </div>
                          <div className="text-xs text-gray-400">総合スコア</div>
                          <div className="w-24 bg-gray-600/50 rounded-full h-2 mt-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                user.rankingScore >= 80 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                user.rankingScore >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                user.rankingScore >= 40 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                'bg-gradient-to-r from-gray-400 to-gray-500'
                              }`}
                              style={{ width: `${Math.min((user.rankingScore / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {analysisResult.userRankings.length > 20 && (
                    <div className="text-center py-4 text-gray-400">
                      上位20名を表示中（全{analysisResult.userRankings.length}名）
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'facilities' && analysisResult && (
            <div className="space-y-6">
              {/* 施設別ユーザー統計 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏥</span>
                  施設別ユーザー統計
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analysisResult.facilityStats.map((facility) => (
                    <div key={facility.facilityId} className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="font-bold text-white mb-3 text-sm">{facility.facilityName}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">総ユーザー</span>
                          <span className="text-white font-medium">{facility.totalUsers}名</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">平均レベル</span>
                          <span className="text-blue-400">{facility.avgPermissionLevel.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">平均経験</span>
                          <span className="text-green-400">{facility.avgExperienceYears.toFixed(1)}年</span>
                        </div>
                      </div>
                      
                      {/* 世代分布 */}
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-1">世代分布</div>
                        <div className="space-y-1">
                          {Object.entries(facility.generationDistribution).map(([gen, count]) => (
                            <div key={gen} className="flex justify-between text-xs">
                              <span className="text-gray-500">{gen}</span>
                              <span className="text-cyan-400">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* モバイルフッター */}
      <MobileFooter />
    </div>
  );
};

export default UserAnalysisPage;