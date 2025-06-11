import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Filter, Download, RefreshCw, TrendingUp, Building2 } from 'lucide-react';
import StrategicInitiatives from '../components/dashboard/StrategicInitiatives';
import OrganizationalHealthComponent from '../components/dashboard/OrganizationalHealth';
import DepartmentComparison from '../components/dashboard/DepartmentComparison';
import EngagementMetrics from '../components/dashboard/EngagementMetrics';
import { 
  corporateAnalytics,
  strategicInitiatives,
  organizationalHealth,
  nursingDepartmentAnalytics,
  facilityAnalytics
} from '../data/demo/staffDashboardData';
import { DashboardFilters, CorporateAnalytics, AggregatedMetrics } from '../types/staffDashboard';

// デフォルトデータの定義
const defaultCorporateData: CorporateAnalytics = {
  organizationId: 'default-org',
  organizationName: '医療法人社団',
  organizationRanking: 1,
  facilityAnalytics: [],
  corporateMetrics: {
    totalStaff: 0,
    activeStaff: 0,
    averageProposals: 0,
    averageParticipation: 0,
    averageEngagement: 0,
    topPerformers: [],
    improvementOpportunities: []
  },
  organizationMetrics: {
    totalStaff: 0,
    activeStaff: 0,
    averageProposals: 0,
    averageParticipation: 0,
    averageEngagement: 0,
    topPerformers: [],
    improvementOpportunities: []
  },
  strategicInitiatives: [],
  organizationalHealth: {
    engagementScore: 0,
    collaborationIndex: 0,
    innovationRate: 0,
    retentionRate: 0,
    satisfactionScore: 0,
    cultureAlignment: 0,
    trends: {
      engagement: [],
      collaboration: [],
      innovation: []
    }
  },
  investmentAnalysis: {
    totalInvestment: 0,
    measuredReturns: 0,
    roiPercentage: 0,
    paybackPeriod: 0,
    costSavings: 0,
    productivityGains: 0,
    qualityImprovements: 0
  },
  strategicMetrics: {
    marketCompetitiveness: 0,
    growthPotential: 0,
    governanceScore: 0,
    digitalTransformation: 0
  },
  departmentAnalytics: []
};

const CorporateStaffDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: 'quarter',
    metric: 'overall'
  });
  
  const [dashboardData, setDashboardData] = useState<CorporateAnalytics>(defaultCorporateData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データロード関数
  const loadCorporateData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 実際のデータロード（現在はデモデータを使用）
      const data = corporateAnalytics;
      
      // データの安全性確認
      if (!data || typeof data !== 'object') {
        throw new Error('Corporate analytics data is invalid');
      }
      
      // 安全なデータ設定
      setDashboardData({
        ...defaultCorporateData,
        ...data,
        organizationMetrics: data.organizationMetrics || data.corporateMetrics || defaultCorporateData.organizationMetrics,
        organizationName: data.organizationName || defaultCorporateData.organizationName,
        organizationRanking: data.organizationRanking || defaultCorporateData.organizationRanking,
        strategicMetrics: data.strategicMetrics || defaultCorporateData.strategicMetrics,
        departmentAnalytics: data.departmentAnalytics || defaultCorporateData.departmentAnalytics
      });
      
    } catch (err) {
      console.error('Error loading corporate staff data:', err);
      setError('データの読み込みに失敗しました。デフォルトデータを表示します。');
      setDashboardData(defaultCorporateData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorporateData();
  }, []);

  const handleRefresh = () => {
    setLastUpdated(new Date());
    loadCorporateData();
  };

  const handleExport = () => {
    // TODO: Implement data export functionality
    console.log('Exporting corporate staff data...');
  };

  const timeRangeOptions = [
    { value: 'month', label: '月間' },
    { value: 'quarter', label: '四半期' },
    { value: 'year', label: '年間' },
    { value: 'all', label: '全期間' }
  ];

  // 安全なデータアクセス関数
  const safeGetProperty = <T,>(obj: any, key: string, defaultValue: T): T => {
    return obj && typeof obj === 'object' && obj[key] !== undefined ? obj[key] : defaultValue;
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-lg">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">ホームに戻る</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Globe className="w-7 h-7 text-cyan-400" />
                法人職員ダッシュボード
              </h1>
              <p className="text-gray-400 text-sm">
                {safeGetProperty(dashboardData, 'organizationName', '医療法人社団')} - 全施設統合管理
              </p>
              {error && (
                <p className="text-orange-400 text-xs mt-1">
                  ⚠️ {error}
                </p>
              )}
            </div>
          </div>
          
          {/* ヘッダーアクション */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">更新</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg transition-colors text-cyan-400"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">エクスポート</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="p-6 space-y-6">
        {/* フィルターバー */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300 font-medium">フィルター:</span>
              
              {/* 期間選択 */}
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 法人情報 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-400">
                法人ランキング: <span className="text-yellow-400 font-semibold">#{safeGetProperty(dashboardData, 'organizationRanking', 1)}</span>
              </div>
              <div className="text-gray-400">
                総職員数: <span className="text-cyan-400 font-semibold">{safeGetProperty(safeGetProperty(dashboardData, 'organizationMetrics', defaultCorporateData.organizationMetrics!), 'totalStaff', 0)}名</span>
              </div>
              <div className="text-gray-400">
                施設数: <span className="text-blue-400 font-semibold">{safeGetProperty(dashboardData, 'facilityAnalytics', []).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 法人レベルエンゲージメント指標 */}
        <EngagementMetrics 
          metrics={safeGetProperty(dashboardData, 'organizationMetrics', defaultCorporateData.organizationMetrics!)}
          scope="corporate"
        />

        {/* 組織健康度指標 */}
        <OrganizationalHealthComponent healthData={safeGetProperty(dashboardData, 'organizationalHealth', defaultCorporateData.organizationalHealth)} />

        {/* 戦略的イニシアチブ */}
        <StrategicInitiatives initiatives={safeGetProperty(dashboardData, 'strategicInitiatives', [])} />

        {/* 施設間比較 */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">施設間比較</h3>
            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
              法人内
            </span>
          </div>

          <div className="space-y-4">
            {safeGetProperty(dashboardData, 'facilityAnalytics', []).map((facility: any, index: number) => {
              const rank = index + 1;
              const facilityMetrics = safeGetProperty(facility, 'facilityMetrics', defaultCorporateData.organizationMetrics!);
              const engagement = safeGetProperty(facilityMetrics, 'averageEngagement', 0) * 100;
              
              return (
                <div
                  key={safeGetProperty(facility, 'facilityId', `facility-${index}`)}
                  className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                      rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      rank === 2 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                      'bg-orange-600/20 text-orange-400 border-orange-600/30'
                    }`}>
                      {rank}
                    </div>
                    <div className="min-w-[120px]">
                      <div className="text-white font-medium">{safeGetProperty(facility, 'facilityName', `施設${rank}`)}</div>
                      <div className="text-xs text-gray-400">総職員数: {safeGetProperty(facilityMetrics, 'totalStaff', 0)}名</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">提案数/月</div>
                      <div className="text-white font-semibold">{safeGetProperty(facilityMetrics, 'averageProposals', 0).toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">参加率/月</div>
                      <div className="text-white font-semibold">{safeGetProperty(facilityMetrics, 'averageParticipation', 0).toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">エンゲージメント</div>
                      <div className={`text-lg font-bold ${
                        engagement >= 85 ? 'text-green-400' :
                        engagement >= 75 ? 'text-blue-400' :
                        engagement >= 65 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {engagement.toFixed(1)}%
                      </div>
                    </div>
                    <div className="min-w-[100px]">
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            engagement >= 85 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                            engagement >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                            engagement >= 65 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                            'bg-gradient-to-r from-orange-500 to-orange-400'
                          }`}
                          style={{ width: `${Math.min(100, engagement)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 部署間統合比較 */}
        <DepartmentComparison 
          departments={safeGetProperty(dashboardData, 'departmentAnalytics', [])}
          scope="corporate"
        />

        {/* 法人レベル戦略指標 */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            法人戦略指標
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 市場競争力 */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-green-400 text-sm font-medium">市場競争力</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {(safeGetProperty(safeGetProperty(dashboardData, 'strategicMetrics', defaultCorporateData.strategicMetrics!), 'marketCompetitiveness', 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">業界平均比</div>
            </div>

            {/* 成長ポテンシャル */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-blue-400 text-sm font-medium">成長ポテンシャル</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {(safeGetProperty(safeGetProperty(dashboardData, 'strategicMetrics', defaultCorporateData.strategicMetrics!), 'growthPotential', 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">前年同期比</div>
            </div>

            {/* ガバナンススコア */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-purple-400 text-sm font-medium">ガバナンス</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {(safeGetProperty(safeGetProperty(dashboardData, 'strategicMetrics', defaultCorporateData.strategicMetrics!), 'governanceScore', 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">コンプライアンス</div>
            </div>

            {/* デジタル変革度 */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <span className="text-cyan-400 text-sm font-medium">DX推進度</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {(safeGetProperty(safeGetProperty(dashboardData, 'strategicMetrics', defaultCorporateData.strategicMetrics!), 'digitalTransformation', 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">デジタル化率</div>
            </div>
          </div>
        </div>

        {/* 経営改善アクション */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">法人レベル経営改善アクション</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-2">🚀 戦略的イニシアチブ強化</h4>
              <p className="text-gray-300 text-sm">
                高ROIイニシアチブの横展開と新規戦略プロジェクトの立ち上げにより、
                法人全体の競争力向上を推進。
              </p>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2">📊 データ駆動経営強化</h4>
              <p className="text-gray-300 text-sm">
                各施設の分析データを統合し、エビデンスベースの意思決定プロセスを
                全法人に導入。
              </p>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">🤝 施設間連携促進</h4>
              <p className="text-gray-300 text-sm">
                優秀施設のベストプラクティスを共有し、法人全体での
                知識・ノウハウの水平展開を加速。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateStaffDashboardPage;