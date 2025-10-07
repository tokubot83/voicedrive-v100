import React, { useState } from 'react';
import { Building2, TrendingUp, Users, CheckCircle, Clock, AlertTriangle, Activity, BarChart3 } from 'lucide-react';

/**
 * 法人全体議題化ダッシュボード
 *
 * 対象: レベル18（理事長・法人事務局長）
 * 目的: 全10施設の議題化プロセス稼働状況を統合的に把握
 */

interface FacilityStatus {
  id: string;
  name: string;
  type: string;
  totalVoices: number;
  activeVoices: number;
  resolvedVoices: number;
  participationRate: number;
  avgProcessTime: number; // days
  healthScore: number; // 0-100
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

interface KPISummary {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export const CorporateAgendaDashboardPage: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

  // 法人全体KPI
  const corporateKPIs: KPISummary[] = [
    {
      label: '総投稿数（全施設）',
      value: '12,847',
      change: '+8.2%',
      trend: 'up',
      status: 'good'
    },
    {
      label: '平均参加率',
      value: '64.3%',
      change: '+2.1%',
      trend: 'up',
      status: 'good'
    },
    {
      label: '平均解決率',
      value: '58.7%',
      change: '-1.3%',
      trend: 'down',
      status: 'warning'
    },
    {
      label: '平均処理日数',
      value: '26.4日',
      change: '-3.8日',
      trend: 'up',
      status: 'good'
    }
  ];

  // 施設別状況（全10施設）
  const facilities: FacilityStatus[] = [
    {
      id: 'F001',
      name: '中央総合病院',
      type: '総合病院',
      totalVoices: 3247,
      activeVoices: 487,
      resolvedVoices: 1842,
      participationRate: 72,
      avgProcessTime: 24,
      healthScore: 85,
      lastUpdated: '2時間前',
      trend: 'up'
    },
    {
      id: 'F002',
      name: '北部医療センター',
      type: '地域医療センター',
      totalVoices: 1842,
      activeVoices: 321,
      resolvedVoices: 1087,
      participationRate: 68,
      avgProcessTime: 27,
      healthScore: 78,
      lastUpdated: '1時間前',
      trend: 'stable'
    },
    {
      id: 'F003',
      name: '南部クリニック',
      type: 'クリニック',
      totalVoices: 876,
      activeVoices: 124,
      resolvedVoices: 523,
      participationRate: 58,
      avgProcessTime: 31,
      healthScore: 65,
      lastUpdated: '3時間前',
      trend: 'down'
    },
    {
      id: 'F004',
      name: '東部リハビリ病院',
      type: 'リハビリ病院',
      totalVoices: 1234,
      activeVoices: 198,
      resolvedVoices: 745,
      participationRate: 65,
      avgProcessTime: 28,
      healthScore: 72,
      lastUpdated: '2時間前',
      trend: 'up'
    },
    {
      id: 'F005',
      name: '西部介護施設',
      type: '介護施設',
      totalVoices: 654,
      activeVoices: 87,
      resolvedVoices: 398,
      participationRate: 51,
      avgProcessTime: 35,
      healthScore: 58,
      lastUpdated: '5時間前',
      trend: 'down'
    },
    {
      id: 'F006',
      name: '桜ヶ丘総合病院',
      type: '総合病院',
      totalVoices: 2134,
      activeVoices: 342,
      resolvedVoices: 1287,
      participationRate: 69,
      avgProcessTime: 25,
      healthScore: 81,
      lastUpdated: '1時間前',
      trend: 'up'
    },
    {
      id: 'F007',
      name: '青葉台クリニック',
      type: 'クリニック',
      totalVoices: 543,
      activeVoices: 76,
      resolvedVoices: 321,
      participationRate: 54,
      avgProcessTime: 29,
      healthScore: 62,
      lastUpdated: '4時間前',
      trend: 'stable'
    },
    {
      id: 'F008',
      name: '緑の森介護センター',
      type: '介護施設',
      totalVoices: 487,
      activeVoices: 65,
      resolvedVoices: 289,
      participationRate: 48,
      avgProcessTime: 38,
      healthScore: 54,
      lastUpdated: '6時間前',
      trend: 'down'
    },
    {
      id: 'F009',
      name: '海浜医療センター',
      type: '地域医療センター',
      totalVoices: 1342,
      activeVoices: 234,
      resolvedVoices: 812,
      participationRate: 63,
      avgProcessTime: 26,
      healthScore: 75,
      lastUpdated: '2時間前',
      trend: 'stable'
    },
    {
      id: 'F010',
      name: '山手リハビリセンター',
      type: 'リハビリ病院',
      totalVoices: 488,
      activeVoices: 71,
      resolvedVoices: 296,
      participationRate: 56,
      avgProcessTime: 32,
      healthScore: 67,
      lastUpdated: '3時間前',
      trend: 'up'
    }
  ];

  // 施設タイプ別集計
  const facilityTypeStats = [
    {
      type: '総合病院',
      count: 2,
      avgHealthScore: 83,
      avgParticipation: 70.5,
      totalVoices: 5381
    },
    {
      type: '地域医療センター',
      count: 2,
      avgHealthScore: 76.5,
      avgParticipation: 65.5,
      totalVoices: 3184
    },
    {
      type: 'リハビリ病院',
      count: 2,
      avgHealthScore: 69.5,
      avgParticipation: 60.5,
      totalVoices: 1722
    },
    {
      type: 'クリニック',
      count: 2,
      avgHealthScore: 63.5,
      avgParticipation: 56,
      totalVoices: 1419
    },
    {
      type: '介護施設',
      count: 2,
      avgHealthScore: 56,
      avgParticipation: 49.5,
      totalVoices: 1141
    }
  ];

  // アラート・注意事項
  const alerts = [
    {
      id: 'alert-1',
      facility: '西部介護施設',
      type: 'warning',
      message: '参加率が51%に低下（目標60%）',
      timestamp: '2時間前'
    },
    {
      id: 'alert-2',
      facility: '緑の森介護センター',
      type: 'critical',
      message: '平均処理日数が38日に増加（目標30日以内）',
      timestamp: '3時間前'
    },
    {
      id: 'alert-3',
      facility: '南部クリニック',
      type: 'warning',
      message: 'ヘルススコアが65に低下（前月比-8）',
      timestamp: '5時間前'
    }
  ];

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">法人全体議題化ダッシュボード</h1>
              <p className="text-gray-400">全10施設の議題化プロセス稼働状況</p>
            </div>
          </div>
        </div>

        {/* 法人全体KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {corporateKPIs.map((kpi, index) => (
            <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <p className="text-sm text-gray-400 mb-2">{kpi.label}</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">{kpi.value}</span>
                <span className={`text-sm font-medium ${getStatusColor(kpi.status)}`}>
                  {getTrendIcon(kpi.trend)} {kpi.change}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${kpi.status === 'good' ? 'bg-green-400' : kpi.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className={`text-xs ${getStatusColor(kpi.status)}`}>
                  {kpi.status === 'good' ? '良好' : kpi.status === 'warning' ? '要注意' : '要改善'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* アラート */}
        {alerts.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold">注意事項・アラート</h2>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${alert.type === 'critical' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.facility}</span>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-300">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 施設タイプ別統計 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">施設タイプ別統計</h2>
            </div>
            <div className="space-y-4">
              {facilityTypeStats.map((stat, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{stat.type}</span>
                    <span className="text-sm text-gray-400">{stat.count}施設</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">平均スコア</p>
                      <p className="text-lg font-bold">{stat.avgHealthScore}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">平均参加率</p>
                      <p className="text-lg font-bold">{stat.avgParticipation}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 施設別ランキング */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">ヘルススコアランキング</h2>
            </div>
            <div className="space-y-3">
              {facilities
                .sort((a, b) => b.healthScore - a.healthScore)
                .slice(0, 5)
                .map((facility, index) => (
                  <div key={facility.id} className="flex items-center gap-4 bg-slate-900/50 rounded-lg p-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center font-bold text-blue-400">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{facility.name}</span>
                        <span className="text-xs text-gray-500">({facility.type})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>参加率: {facility.participationRate}%</span>
                        <span>処理日数: {facility.avgProcessTime}日</span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-bold ${getHealthScoreColor(facility.healthScore)}`}>
                      {facility.healthScore}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 全施設一覧 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">全施設詳細</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">施設名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">タイプ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">総投稿数</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">対応中</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">解決済</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">参加率</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">処理日数</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">スコア</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">トレンド</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => (
                  <tr
                    key={facility.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedFacility(facility.id)}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-xs text-gray-500">{facility.lastUpdated}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-400">{facility.type}</td>
                    <td className="py-4 px-4 text-right font-medium">{facility.totalVoices.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-yellow-400">{facility.activeVoices.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-green-400">{facility.resolvedVoices.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">{facility.participationRate}%</td>
                    <td className="py-4 px-4 text-right">{facility.avgProcessTime}日</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-3 py-1 rounded-lg font-bold ${getHealthScoreColor(facility.healthScore)}`}>
                        {facility.healthScore}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-xl">{getTrendIcon(facility.trend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
