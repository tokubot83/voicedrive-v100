import React, { useState } from 'react';

interface FacilityKPI {
  label: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface DepartmentMetrics {
  id: string;
  name: string;
  head: string;
  totalPosts: number;
  adoptionRate: number;
  engagement: number;
  strategicAlignment: number;
  riskScore: number;
  innovation: number;
}

interface ROIProject {
  id: string;
  title: string;
  department: string;
  investment: number;
  expectedROI: number;
  actualROI: number;
  status: 'planning' | 'implementing' | 'completed' | 'measuring';
  timeline: string;
}

interface CriticalIssue {
  id: string;
  title: string;
  departments: string[];
  riskLevel: 'high' | 'medium' | 'low';
  patientSafety: boolean;
  compliance: boolean;
  financial: boolean;
  timeToResolve: number; // days
  escalated: boolean;
}

interface LeadershipMetrics {
  departmentHead: string;
  department: string;
  teamDevelopment: number;
  innovationFostering: number;
  cultureDriving: number;
  strategicAlignment: number;
  overallScore: number;
  promoted: number; // number of team members promoted/developed
}

const FacilityPostingAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [activeView, setActiveView] = useState<'summary' | 'departments' | 'strategy' | 'risks' | 'roi' | 'culture' | 'leadership'>('summary');

  // ダミーデータ
  const facilityKPIs: FacilityKPI[] = [
    {
      label: '全体投稿活性度',
      current: 89,
      target: 85,
      trend: 'up',
      change: '+5.2%',
      status: 'excellent'
    },
    {
      label: '改善実現率',
      current: 73,
      target: 75,
      trend: 'up',
      change: '+2.1%',
      status: 'good'
    },
    {
      label: '職員参加率',
      current: 82,
      target: 90,
      trend: 'stable',
      change: '+0.3%',
      status: 'warning'
    },
    {
      label: '戦略整合性',
      current: 91,
      target: 88,
      trend: 'up',
      change: '+3.8%',
      status: 'excellent'
    }
  ];

  const departmentMetrics: DepartmentMetrics[] = [
    {
      id: '1',
      name: '看護部',
      head: '山田太郎',
      totalPosts: 456,
      adoptionRate: 68,
      engagement: 85,
      strategicAlignment: 92,
      riskScore: 15,
      innovation: 78
    },
    {
      id: '2',
      name: '診療部',
      head: '佐藤花子',
      totalPosts: 324,
      adoptionRate: 74,
      engagement: 82,
      strategicAlignment: 89,
      riskScore: 22,
      innovation: 85
    },
    {
      id: '3',
      name: '医療技術部',
      head: '鈴木一郎',
      totalPosts: 287,
      adoptionRate: 81,
      engagement: 91,
      strategicAlignment: 87,
      riskScore: 8,
      innovation: 92
    },
    {
      id: '4',
      name: '管理部',
      head: '田中美咲',
      totalPosts: 198,
      adoptionRate: 65,
      engagement: 71,
      strategicAlignment: 94,
      riskScore: 18,
      innovation: 69
    },
    {
      id: '5',
      name: 'リハビリ部',
      head: '高橋健太',
      totalPosts: 245,
      adoptionRate: 77,
      engagement: 88,
      strategicAlignment: 85,
      riskScore: 12,
      innovation: 83
    }
  ];

  const roiProjects: ROIProject[] = [
    {
      id: '1',
      title: '電子カルテ効率化システム',
      department: '医療技術部',
      investment: 8500000,
      expectedROI: 320,
      actualROI: 285,
      status: 'measuring',
      timeline: '12ヶ月'
    },
    {
      id: '2',
      title: 'ナースコール最適化',
      department: '看護部',
      investment: 3200000,
      expectedROI: 180,
      actualROI: 220,
      status: 'completed',
      timeline: '6ヶ月'
    },
    {
      id: '3',
      title: '薬剤管理システム改善',
      department: '診療部',
      investment: 5600000,
      expectedROI: 250,
      actualROI: 0,
      status: 'implementing',
      timeline: '9ヶ月'
    },
    {
      id: '4',
      title: '待ち時間短縮プロジェクト',
      department: '管理部',
      investment: 2800000,
      expectedROI: 150,
      actualROI: 0,
      status: 'planning',
      timeline: '4ヶ月'
    }
  ];

  const criticalIssues: CriticalIssue[] = [
    {
      id: '1',
      title: '夜間緊急時スタッフ不足',
      departments: ['看護部', '診療部'],
      riskLevel: 'high',
      patientSafety: true,
      compliance: true,
      financial: false,
      timeToResolve: 30,
      escalated: true
    },
    {
      id: '2',
      title: '医療機器メンテナンス遅延',
      departments: ['医療技術部', '管理部'],
      riskLevel: 'high',
      patientSafety: true,
      compliance: false,
      financial: true,
      timeToResolve: 14,
      escalated: false
    },
    {
      id: '3',
      title: '感染対策プロトコル更新',
      departments: ['看護部', '診療部', '管理部'],
      riskLevel: 'medium',
      patientSafety: true,
      compliance: true,
      financial: false,
      timeToResolve: 21,
      escalated: false
    }
  ];

  const leadershipMetrics: LeadershipMetrics[] = [
    {
      departmentHead: '山田太郎',
      department: '看護部',
      teamDevelopment: 88,
      innovationFostering: 82,
      cultureDriving: 91,
      strategicAlignment: 89,
      overallScore: 87.5,
      promoted: 3
    },
    {
      departmentHead: '佐藤花子',
      department: '診療部',
      teamDevelopment: 85,
      innovationFostering: 89,
      cultureDriving: 84,
      strategicAlignment: 92,
      overallScore: 87.5,
      promoted: 2
    },
    {
      departmentHead: '鈴木一郎',
      department: '医療技術部',
      teamDevelopment: 92,
      innovationFostering: 95,
      cultureDriving: 88,
      strategicAlignment: 86,
      overallScore: 90.3,
      promoted: 4
    },
    {
      departmentHead: '田中美咲',
      department: '管理部',
      teamDevelopment: 78,
      innovationFostering: 72,
      cultureDriving: 85,
      strategicAlignment: 94,
      overallScore: 82.3,
      promoted: 1
    },
    {
      departmentHead: '高橋健太',
      department: 'リハビリ部',
      teamDevelopment: 86,
      innovationFostering: 84,
      cultureDriving: 89,
      strategicAlignment: 83,
      overallScore: 85.5,
      promoted: 2
    }
  ];

  // 集計値計算
  const totalPosts = departmentMetrics.reduce((sum, dept) => sum + dept.totalPosts, 0);
  const avgAdoptionRate = departmentMetrics.reduce((sum, dept) => sum + dept.adoptionRate, 0) / departmentMetrics.length;
  const criticalRisks = criticalIssues.filter(issue => issue.riskLevel === 'high').length;
  const totalROI = roiProjects.reduce((sum, project) => sum + (project.actualROI || project.expectedROI), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHeatmapColor = (value: number, max: number = 100) => {
    const intensity = value / max;
    if (intensity >= 0.8) return 'bg-green-500';
    if (intensity >= 0.6) return 'bg-yellow-500';
    if (intensity >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーとナビゲーション */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            施設全体投稿分析（エグゼクティブビュー）
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="month">今月</option>
            <option value="quarter">四半期</option>
            <option value="year">年間</option>
          </select>
        </div>

        {/* ナビゲーションタブ */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'summary', label: 'エグゼクティブサマリー', icon: '📊' },
            { id: 'departments', label: '部門比較', icon: '🏢' },
            { id: 'strategy', label: '戦略整合性', icon: '🎯' },
            { id: 'risks', label: 'リスクアラート', icon: '⚠️' },
            { id: 'roi', label: 'ROI追跡', icon: '💰' },
            { id: 'culture', label: '組織文化', icon: '🤝' },
            { id: 'leadership', label: 'リーダーシップ', icon: '👑' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                activeView === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* エグゼクティブサマリー */}
      {activeView === 'summary' && (
        <div className="space-y-6">
          {/* 主要KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {facilityKPIs.map((kpi, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">{kpi.label}</span>
                  <span className="text-lg">
                    {kpi.trend === 'up' ? '📈' : kpi.trend === 'down' ? '📉' : '➡️'}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <div className={`text-3xl font-bold ${getStatusColor(kpi.status)}`}>
                    {kpi.current}%
                  </div>
                  <span className={`text-sm ${getStatusColor(kpi.status)}`}>
                    {kpi.change}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  目標: {kpi.target}%
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      kpi.status === 'excellent' ? 'bg-green-400' :
                      kpi.status === 'good' ? 'bg-blue-400' :
                      kpi.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 重要指標サマリー */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">施設パフォーマンス概要</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">{totalPosts}</div>
                <div className="text-sm text-gray-400">総投稿数</div>
                <div className="text-xs text-green-400 mt-1">前期比 +12%</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">{avgAdoptionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">平均採用率</div>
                <div className="text-xs text-green-400 mt-1">目標値達成</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400 mb-2">{criticalRisks}</div>
                <div className="text-sm text-gray-400">高リスク課題</div>
                <div className="text-xs text-red-400 mt-1">要即座対応</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{totalROI}%</div>
                <div className="text-sm text-gray-400">総合ROI</div>
                <div className="text-xs text-green-400 mt-1">期待値超過</div>
              </div>
            </div>
          </div>

          {/* 月次ハイライト */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">今月のハイライト</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-green-400 font-medium mb-2">🎉 成功事例</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• ナースコール効率化でROI 220%達成</li>
                  <li>• 医療技術部の革新的提案が5件採用</li>
                  <li>• 職員満足度が3ポイント向上</li>
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-medium mb-2">⚠️ 要注意事項</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 夜間スタッフ不足の深刻化</li>
                  <li>• 医療機器メンテナンス遅延</li>
                  <li>• 管理部の投稿活動低下</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2">📋 来月の重点</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 人員配置最適化プロジェクト開始</li>
                  <li>• 予防保全システム導入検討</li>
                  <li>• 部門横断改善活動強化</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 部門比較ヒートマップ */}
      {activeView === 'departments' && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">部門パフォーマンス比較</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">部門</th>
                  <th className="pb-3 px-4 text-center">投稿数</th>
                  <th className="pb-3 px-4 text-center">採用率</th>
                  <th className="pb-3 px-4 text-center">エンゲージメント</th>
                  <th className="pb-3 px-4 text-center">戦略整合性</th>
                  <th className="pb-3 px-4 text-center">リスクスコア</th>
                  <th className="pb-3 pl-4 text-center">イノベーション度</th>
                </tr>
              </thead>
              <tbody>
                {departmentMetrics.map(dept => (
                  <tr key={dept.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-4 pr-4">
                      <div>
                        <div className="font-medium text-white">{dept.name}</div>
                        <div className="text-xs text-gray-400">{dept.head}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-white font-medium">{dept.totalPosts}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`w-12 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getHeatmapColor(dept.adoptionRate)}`}>
                        {dept.adoptionRate}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`w-12 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getHeatmapColor(dept.engagement)}`}>
                        {dept.engagement}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`w-12 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getHeatmapColor(dept.strategicAlignment)}`}>
                        {dept.strategicAlignment}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`w-12 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getHeatmapColor(100 - dept.riskScore)}`}>
                        {dept.riskScore}
                      </div>
                    </td>
                    <td className="py-4 pl-4 text-center">
                      <div className={`w-12 h-8 rounded mx-auto flex items-center justify-center text-white text-sm font-medium ${getHeatmapColor(dept.innovation)}`}>
                        {dept.innovation}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
            <span>ヒートマップ:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>優秀 (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>良好 (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>要改善 (40-59%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>要対策 (40%未満)</span>
            </div>
          </div>
        </div>
      )}

      {/* 戦略整合性分析 */}
      {activeView === 'strategy' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">経営戦略との整合性分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-300 mb-3">戦略目標別投稿分布</h4>
                <div className="space-y-3">
                  {[
                    { goal: '患者満足度向上', posts: 124, alignment: 95 },
                    { goal: '医療安全強化', posts: 89, alignment: 88 },
                    { goal: '業務効率化', posts: 156, alignment: 92 },
                    { goal: 'コスト最適化', posts: 67, alignment: 78 },
                    { goal: 'DX推進', posts: 98, alignment: 85 }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm">{item.goal}</span>
                        <span className="text-gray-400 text-sm">{item.posts}件</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHeatmapColor(item.alignment)}`}
                            style={{ width: `${item.alignment}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium">{item.alignment}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-300 mb-3">戦略実現への貢献度</h4>
                <div className="space-y-4">
                  {departmentMetrics.map(dept => (
                    <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{dept.name}</div>
                        <div className="text-xs text-gray-400">戦略貢献スコア</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getStatusColor(dept.strategicAlignment >= 90 ? 'excellent' : dept.strategicAlignment >= 80 ? 'good' : 'warning')}`}>
                          {dept.strategicAlignment}
                        </div>
                        <div className="text-xs text-gray-400">/100</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* リスクアラート */}
      {activeView === 'risks' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              クリティカル課題アラート
            </h3>
            <div className="space-y-4">
              {criticalIssues.map(issue => (
                <div key={issue.id} className={`rounded-lg p-4 border ${
                  issue.riskLevel === 'high' ? 'bg-red-500/10 border-red-500/30' :
                  issue.riskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white mb-1">{issue.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>関連部門: {issue.departments.join('、')}</span>
                        <span>解決予定: {issue.timeToResolve}日以内</span>
                        {issue.escalated && (
                          <span className="text-red-400 font-medium">エスカレーション済</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        issue.riskLevel === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        issue.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {issue.riskLevel === 'high' ? '高' : issue.riskLevel === 'medium' ? '中' : '低'}リスク
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    {issue.patientSafety && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        🏥 患者安全
                      </span>
                    )}
                    {issue.compliance && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                        📋 コンプライアンス
                      </span>
                    )}
                    {issue.financial && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        💰 財務影響
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      詳細確認
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      対策会議設定
                    </button>
                    {!issue.escalated && issue.riskLevel === 'high' && (
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                        緊急エスカレーション
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROI追跡 */}
      {activeView === 'roi' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">改善提案ROI追跡</h3>
            <div className="space-y-4">
              {roiProjects.map(project => (
                <div key={project.id} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{project.title}</h4>
                      <div className="text-sm text-gray-400 mt-1">
                        {project.department} • 期間: {project.timeline}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'measuring' ? 'bg-blue-500/20 text-blue-400' :
                      project.status === 'implementing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {project.status === 'completed' ? '完了' :
                       project.status === 'measuring' ? '効果測定中' :
                       project.status === 'implementing' ? '実装中' : '計画中'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        ¥{(project.investment / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-gray-400">投資額</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {project.expectedROI}%
                      </div>
                      <div className="text-xs text-gray-400">期待ROI</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        project.actualROI > project.expectedROI ? 'text-green-400' :
                        project.actualROI > 0 ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {project.actualROI > 0 ? `${project.actualROI}%` : '測定中'}
                      </div>
                      <div className="text-xs text-gray-400">実績ROI</div>
                    </div>
                  </div>

                  {project.actualROI > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">ROI達成度</span>
                        <span className={`text-sm font-medium ${
                          project.actualROI >= project.expectedROI ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {((project.actualROI / project.expectedROI) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            project.actualROI >= project.expectedROI ? 'bg-green-400' : 'bg-yellow-400'
                          }`}
                          style={{ width: `${Math.min((project.actualROI / project.expectedROI) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 組織文化メトリクス */}
      {activeView === 'culture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-blue-400 mb-2">82%</div>
              <div className="text-sm text-gray-400 mb-1">職員参加率</div>
              <div className="text-xs text-green-400">前期比 +5%</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-green-400 mb-2">24</div>
              <div className="text-sm text-gray-400 mb-1">新規投稿者</div>
              <div className="text-xs text-green-400">今月</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl font-bold text-purple-400 mb-2">78%</div>
              <div className="text-sm text-gray-400 mb-1">多職種連携率</div>
              <div className="text-xs text-blue-400">目標値達成</div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">世代別・職種別参加状況</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-300 mb-3">世代別参加率</h4>
                <div className="space-y-3">
                  {[
                    { generation: '20代', participation: 89, count: 45 },
                    { generation: '30代', participation: 85, count: 78 },
                    { generation: '40代', participation: 78, count: 124 },
                    { generation: '50代以上', participation: 72, count: 73 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm w-20">{item.generation}</span>
                      <div className="flex-1 mx-4 bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${item.participation}%` }}
                        />
                      </div>
                      <span className="text-white text-sm w-16">{item.participation}% ({item.count}名)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-300 mb-3">職種別参加率</h4>
                <div className="space-y-3">
                  {[
                    { profession: '看護師', participation: 92, count: 156 },
                    { profession: '医師', participation: 78, count: 34 },
                    { profession: '技師', participation: 88, count: 67 },
                    { profession: '事務', participation: 65, count: 43 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm w-20">{item.profession}</span>
                      <div className="flex-1 mx-4 bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full"
                          style={{ width: `${item.participation}%` }}
                        />
                      </div>
                      <span className="text-white text-sm w-16">{item.participation}% ({item.count}名)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* リーダーシップ開発 */}
      {activeView === 'leadership' && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">部門長リーダーシップ評価</h3>
          <div className="space-y-4">
            {leadershipMetrics.map((leader, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{leader.departmentHead}</h4>
                    <p className="text-sm text-gray-400">{leader.department}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      leader.overallScore >= 85 ? 'text-green-400' : 
                      leader.overallScore >= 75 ? 'text-blue-400' : 'text-yellow-400'
                    }`}>
                      {leader.overallScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">総合スコア</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{leader.teamDevelopment}</div>
                    <div className="text-xs text-gray-400">チーム育成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{leader.innovationFostering}</div>
                    <div className="text-xs text-gray-400">革新推進</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{leader.cultureDriving}</div>
                    <div className="text-xs text-gray-400">文化醸成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{leader.strategicAlignment}</div>
                    <div className="text-xs text-gray-400">戦略実行</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-600 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    人材育成実績: {leader.promoted}名昇進・配置転換
                  </span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      詳細評価
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      開発計画
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityPostingAnalytics;