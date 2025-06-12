import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../demo/DemoModeController';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { facilities } from '../../data/medical/facilities';
import { departments } from '../../data/medical/departments';
import { staffDashboardData } from '../../data/demo/staffDashboardData';
import { Card, CardContent } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import EngagementMetrics from '../analytics/EngagementMetrics';
import DepartmentComparison from '../dashboard/DepartmentComparison';
import CrossDepartmentProjects from '../dashboard/CrossDepartmentProjects';
import StaffRankings from '../dashboard/StaffRankings';
import OrganizationalHealth from '../dashboard/OrganizationalHealth';
import StrategicInitiatives from '../dashboard/StrategicInitiatives';

interface FacilityMetrics {
  id: string;
  name: string;
  totalStaff: number;
  totalDepartments: number;
  occupancyRate: number;
  budgetExecution: number;
  qualityScore: number;
  staffSatisfaction: number;
  patientSatisfaction?: number;
}

interface DepartmentMetrics {
  id: string;
  name: string;
  facilityId: string;
  facilityName: string;
  staffCount: number;
  activeProjects: number;
  budgetStatus: number;
  performanceScore: number;
}

const IntegratedCorporateDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions(currentUser.id);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'overview' | 'facility' | 'department' | 'analytics'>('overview');
  
  // 権限レベルに応じた表示制御
  const canViewFinancials = currentUser.permissionLevel >= 6;
  const canViewStrategic = currentUser.permissionLevel >= 7;
  const canViewExecutive = currentUser.permissionLevel >= 8;

  // 施設メトリクスの集計
  const facilityMetrics: FacilityMetrics[] = facilities.map(facility => {
    const facilityDepartments = departments.filter(dept => dept.facility === facility.id);
    const staffCount = facilityDepartments.reduce((sum, dept) => {
      const deptData = staffDashboardData.departmentStaff.find(d => d.department === dept.name);
      return sum + (deptData?.totalStaff || 10);
    }, 0);

    return {
      id: facility.id,
      name: facility.name,
      totalStaff: staffCount,
      totalDepartments: facilityDepartments.length,
      occupancyRate: 75 + Math.random() * 20,
      budgetExecution: 70 + Math.random() * 25,
      qualityScore: 80 + Math.random() * 15,
      staffSatisfaction: 70 + Math.random() * 20,
      patientSatisfaction: facility.type === 'hospital' ? 75 + Math.random() * 20 : undefined
    };
  });

  // 部門メトリクスの集計
  const departmentMetrics: DepartmentMetrics[] = departments.map(dept => {
    const facility = facilities.find(f => f.id === dept.facility);
    const deptData = staffDashboardData.departmentStaff.find(d => d.department === dept.name);
    
    return {
      id: dept.id,
      name: dept.name,
      facilityId: dept.facility,
      facilityName: facility?.name || '',
      staffCount: deptData?.totalStaff || 10,
      activeProjects: Math.floor(Math.random() * 10) + 1,
      budgetStatus: 70 + Math.random() * 25,
      performanceScore: 75 + Math.random() * 20
    };
  });

  // 全法人の集計データ
  const corporateSummary = {
    totalFacilities: facilities.length,
    totalDepartments: departments.length,
    totalStaff: facilityMetrics.reduce((sum, f) => sum + f.totalStaff, 0),
    averageOccupancy: facilityMetrics.reduce((sum, f) => sum + f.occupancyRate, 0) / facilityMetrics.length,
    averageBudgetExecution: facilityMetrics.reduce((sum, f) => sum + f.budgetExecution, 0) / facilityMetrics.length,
    averageQualityScore: facilityMetrics.reduce((sum, f) => sum + f.qualityScore, 0) / facilityMetrics.length
  };

  // フィルタリングされたデータ
  const filteredDepartments = selectedFacility === 'all' 
    ? departmentMetrics 
    : departmentMetrics.filter(d => d.facilityId === selectedFacility);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">法人統合ダッシュボード</h1>
            <p className="text-gray-400">全施設・全部門の統合管理ビュー</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">権限レベル</div>
            <div className="text-2xl font-bold text-blue-400">Lv.{currentUser.permissionLevel}</div>
          </div>
        </div>

        {/* 法人全体サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{corporateSummary.totalFacilities}</div>
            <div className="text-sm text-gray-400">施設数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{corporateSummary.totalDepartments}</div>
            <div className="text-sm text-gray-400">部門数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{corporateSummary.totalStaff.toLocaleString()}</div>
            <div className="text-sm text-gray-400">総職員数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{corporateSummary.averageOccupancy.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">平均稼働率</div>
          </div>
          {canViewFinancials && (
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{corporateSummary.averageBudgetExecution.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">予算執行率</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{corporateSummary.averageQualityScore.toFixed(1)}</div>
            <div className="text-sm text-gray-400">品質スコア</div>
          </div>
        </div>
      </div>

      {/* ビュー切替タブ */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList className="grid grid-cols-4 w-full glass-panel p-1">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="facility">施設別</TabsTrigger>
          <TabsTrigger value="department">部門別</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 施設別サマリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilityMetrics.map(facility => (
              <Card key={facility.id} className="glass-panel hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => {
                      setSelectedFacility(facility.id);
                      setSelectedView('facility');
                    }}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">{facility.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">職員数</span>
                      <span className="text-white font-medium">{facility.totalStaff}名</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">部門数</span>
                      <span className="text-white font-medium">{facility.totalDepartments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">稼働率</span>
                      <span className="text-green-400 font-medium">{facility.occupancyRate.toFixed(1)}%</span>
                    </div>
                    {canViewFinancials && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">予算執行</span>
                        <span className="text-yellow-400 font-medium">{facility.budgetExecution.toFixed(1)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">品質スコア</span>
                      <span className="text-blue-400 font-medium">{facility.qualityScore.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* エンゲージメント指標 */}
          <EngagementMetrics />
          
          {/* 戦略的イニシアチブ（レベル7以上） */}
          {canViewStrategic && <StrategicInitiatives />}
        </TabsContent>

        <TabsContent value="facility" className="space-y-6">
          {/* 施設フィルター */}
          <div className="glass-panel p-4">
            <select 
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">全施設</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* 施設詳細 */}
          {selectedFacility !== 'all' && (
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {facilities.find(f => f.id === selectedFacility)?.name}
              </h2>
              <DepartmentComparison 
                departments={filteredDepartments.map(d => ({
                  name: d.name,
                  productivity: d.performanceScore,
                  quality: d.performanceScore * 0.9,
                  collaboration: d.performanceScore * 0.85,
                  innovation: d.performanceScore * 0.8
                }))} 
              />
            </div>
          )}

          {/* 部門間プロジェクト */}
          <CrossDepartmentProjects />
        </TabsContent>

        <TabsContent value="department" className="space-y-6">
          {/* 部門一覧テーブル */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-4">部門パフォーマンス一覧</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">部門名</th>
                    <th className="text-left py-3 px-4 text-gray-400">施設</th>
                    <th className="text-right py-3 px-4 text-gray-400">職員数</th>
                    <th className="text-right py-3 px-4 text-gray-400">プロジェクト</th>
                    {canViewFinancials && (
                      <th className="text-right py-3 px-4 text-gray-400">予算状況</th>
                    )}
                    <th className="text-right py-3 px-4 text-gray-400">パフォーマンス</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentMetrics.map(dept => (
                    <tr key={dept.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-white">{dept.name}</td>
                      <td className="py-3 px-4 text-gray-400">{dept.facilityName}</td>
                      <td className="py-3 px-4 text-right text-white">{dept.staffCount}</td>
                      <td className="py-3 px-4 text-right text-white">{dept.activeProjects}</td>
                      {canViewFinancials && (
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${
                            dept.budgetStatus >= 90 ? 'text-green-400' :
                            dept.budgetStatus >= 70 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {dept.budgetStatus.toFixed(1)}%
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${
                          dept.performanceScore >= 85 ? 'text-green-400' :
                          dept.performanceScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {dept.performanceScore.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* スタッフランキング */}
          <StaffRankings />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* 組織健全性 */}
          <OrganizationalHealth />

          {/* 経営層向け分析（レベル8） */}
          {canViewExecutive && (
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-white mb-4">経営戦略分析</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">成長機会</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">●</span>
                      <span className="text-gray-300">訪問看護事業の拡大余地あり（稼働率60%）</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">●</span>
                      <span className="text-gray-300">リハビリ部門の需要増加傾向</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">改善必要領域</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-400">●</span>
                      <span className="text-gray-300">介護医療院の職員満足度向上が必要</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-400">●</span>
                      <span className="text-gray-300">部門間連携の強化余地あり</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedCorporateDashboard;