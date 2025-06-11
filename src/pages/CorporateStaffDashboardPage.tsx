import React, { useState } from 'react';
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
import { DashboardFilters } from '../types/staffDashboard';

const CorporateStaffDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: 'quarter',
    metric: 'overall'
  });
  
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // TODO: Implement actual data refresh
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

  // デモ用に複数施設・部署のデータを作成
  const demoCorporateAnalytics = {
    ...corporateAnalytics,
    facilityAnalytics: [
      facilityAnalytics,
      {
        ...facilityAnalytics,
        facilityId: 'facility-002',
        facilityName: '第二病院',
        facilityRanking: 2,
        facilityMetrics: {
          ...facilityAnalytics.facilityMetrics,
          totalStaff: 180,
          activeStaff: 165,
          averageProposals: 3.8,
          averageParticipation: 2.4,
          averageEngagement: 0.78
        }
      },
      {
        ...facilityAnalytics,
        facilityId: 'facility-003',
        facilityName: '介護センター',
        facilityRanking: 3,
        facilityMetrics: {
          ...facilityAnalytics.facilityMetrics,
          totalStaff: 85,
          activeStaff: 75,
          averageProposals: 3.2,
          averageParticipation: 1.9,
          averageEngagement: 0.72
        }
      }
    ],
    departmentAnalytics: [
      nursingDepartmentAnalytics,
      {
        ...nursingDepartmentAnalytics,
        departmentId: 'dept-medical-002',
        departmentName: '医師部',
        facilityName: '第一病院',
        departmentRanking: 1,
        aggregatedMetrics: {
          ...nursingDepartmentAnalytics.aggregatedMetrics,
          totalStaff: 45,
          activeStaff: 42,
          averageProposals: 5.8,
          averageParticipation: 3.4,
          averageEngagement: 0.91
        }
      },
      {
        ...nursingDepartmentAnalytics,
        departmentId: 'dept-pharmacy-002',
        departmentName: '薬剤部',
        facilityName: '第二病院',
        departmentRanking: 4,
        aggregatedMetrics: {
          ...nursingDepartmentAnalytics.aggregatedMetrics,
          totalStaff: 28,
          activeStaff: 24,
          averageProposals: 3.4,
          averageParticipation: 2.1,
          averageEngagement: 0.75
        }
      },
      {
        ...nursingDepartmentAnalytics,
        departmentId: 'dept-care-001',
        departmentName: '介護部',
        facilityName: '介護センター',
        departmentRanking: 5,
        aggregatedMetrics: {
          ...nursingDepartmentAnalytics.aggregatedMetrics,
          totalStaff: 42,
          activeStaff: 35,
          averageProposals: 2.9,
          averageParticipation: 1.7,
          averageEngagement: 0.68
        }
      }
    ]
  };

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
                {demoCorporateAnalytics.organizationName} - 全施設統合管理
              </p>
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
                法人ランキング: <span className="text-yellow-400 font-semibold">#{demoCorporateAnalytics.organizationRanking}</span>
              </div>
              <div className="text-gray-400">
                総職員数: <span className="text-cyan-400 font-semibold">{demoCorporateAnalytics.organizationMetrics.totalStaff}名</span>
              </div>
              <div className="text-gray-400">
                施設数: <span className="text-blue-400 font-semibold">{demoCorporateAnalytics.facilityAnalytics.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 法人レベルエンゲージメント指標 */}
        <EngagementMetrics 
          metrics={demoCorporateAnalytics.organizationMetrics}
          scope="corporate"
        />

        {/* 組織健康度指標 */}
        <OrganizationalHealthComponent healthData={organizationalHealth} />

        {/* 戦略的イニシアチブ */}
        <StrategicInitiatives initiatives={strategicInitiatives} />

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
            {demoCorporateAnalytics.facilityAnalytics.map((facility, index) => {
              const rank = index + 1;
              const engagement = facility.facilityMetrics.averageEngagement * 100;
              
              return (
                <div
                  key={facility.facilityId}
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
                      <div className="text-white font-medium">{facility.facilityName}</div>
                      <div className="text-xs text-gray-400">総職員数: {facility.facilityMetrics.totalStaff}名</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">提案数/月</div>
                      <div className="text-white font-semibold">{facility.facilityMetrics.averageProposals.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">参加率/月</div>
                      <div className="text-white font-semibold">{facility.facilityMetrics.averageParticipation.toFixed(1)}</div>
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
                          style={{ width: `${engagement}%` }}
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
          departments={demoCorporateAnalytics.departmentAnalytics}
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
                {(demoCorporateAnalytics.strategicMetrics.marketCompetitiveness * 100).toFixed(1)}%
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
                {(demoCorporateAnalytics.strategicMetrics.growthPotential * 100).toFixed(1)}%
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
                {(demoCorporateAnalytics.strategicMetrics.governanceScore * 100).toFixed(1)}%
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
                {(demoCorporateAnalytics.strategicMetrics.digitalTransformation * 100).toFixed(1)}%
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