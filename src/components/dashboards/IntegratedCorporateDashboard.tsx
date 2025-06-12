import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../demo/DemoModeController';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { facilities } from '../../data/medical/facilities';
import { departments } from '../../data/medical/departments';
import { staffDashboardData } from '../../data/demo/staffDashboardData';
import { Card, CardContent } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
// 子コンポーネントは段階的にインポート（エラー回避のため一時的にコメントアウト）
// import EngagementMetrics from '../dashboard/EngagementMetrics';
// import DepartmentComparison from '../dashboard/DepartmentComparison';
// import CrossDepartmentProjects from '../dashboard/CrossDepartmentProjects';
// import StaffRankings from '../dashboard/StaffRankings';
// import OrganizationalHealth from '../dashboard/OrganizationalHealth';
// import StrategicInitiatives from '../dashboard/StrategicInitiatives';

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
    <>
      {/* カスタムCSS */}
      <style>{`
        @keyframes slideIn {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-pulse-subtle {
          animation: pulse 2s infinite;
        }
        
        .glass-panel {
          backdrop-filter: blur(12px);
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      
      <div className="space-y-6 min-h-screen animate-fade-in-up"
           style={{
             background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(51, 65, 85, 0.7) 100%)'
           }}>
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

        {/* プログレス概要バー */}
        <div className="bg-gray-800/20 rounded-xl p-4 mt-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">法人全体の進行状況</span>
            <span className="text-sm text-gray-400">
              {Math.round((corporateSummary.averageOccupancy + corporateSummary.averageQualityScore) / 2)}% 達成
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${Math.round((corporateSummary.averageOccupancy + corporateSummary.averageQualityScore) / 2)}%`,
                animation: 'slideIn 1.5s ease-out'
              }}
            />
          </div>
        </div>

        {/* 法人全体サマリー - 退職処理画面風の水平レイアウト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">🏢</div>
            <h4 className="font-bold text-white mb-2">施設管理</h4>
            <div className="text-3xl font-bold text-blue-400 mb-1">{corporateSummary.totalFacilities}</div>
            <p className="text-sm text-gray-400">施設数</p>
            <div className="mt-3 text-xs text-gray-500">
              全8施設を統合管理
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">👥</div>
            <h4 className="font-bold text-white mb-2">人事統計</h4>
            <div className="text-3xl font-bold text-green-400 mb-1">{corporateSummary.totalStaff.toLocaleString()}</div>
            <p className="text-sm text-gray-400">総職員数</p>
            <div className="mt-3 text-xs text-gray-500">
              {corporateSummary.totalDepartments}部門に配属
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-bold text-white mb-2">稼働率</h4>
            <div className="text-3xl font-bold text-cyan-400 mb-1">{corporateSummary.averageOccupancy.toFixed(1)}%</div>
            <p className="text-sm text-gray-400">平均稼働率</p>
            <div className="mt-3 text-xs text-gray-500">
              目標値: 85%
            </div>
          </div>
          
          {canViewFinancials ? (
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold text-white mb-2">予算執行</h4>
              <div className="text-3xl font-bold text-yellow-400 mb-1">{corporateSummary.averageBudgetExecution.toFixed(1)}%</div>
              <p className="text-sm text-gray-400">予算執行率</p>
              <div className="mt-3 text-xs text-gray-500">
                適正範囲: 80-95%
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">⭐</div>
              <h4 className="font-bold text-white mb-2">品質管理</h4>
              <div className="text-3xl font-bold text-purple-400 mb-1">{corporateSummary.averageQualityScore.toFixed(1)}</div>
              <p className="text-sm text-gray-400">品質スコア</p>
              <div className="mt-3 text-xs text-gray-500">
                業界平均: 82.0
              </div>
            </div>
          )}
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
          {/* 施設パフォーマンス概要 */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              施設パフォーマンス概要
            </h2>
            
            {/* 施設別サマリーカード - 水平レイアウト */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {facilityMetrics.slice(0, 4).map((facility, index) => {
                const facilityIcons = ['🏥', '🏥', '🏢', '🏢'];
                const facilityColors = ['blue', 'green', 'purple', 'orange'];
                const currentColor = facilityColors[index % facilityColors.length];
                
                return (
                  <div 
                    key={facility.id} 
                    className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-700/50 hover:border-gray-600/50"
                    onClick={() => {
                      setSelectedFacility(facility.id);
                      setSelectedView('facility');
                    }}
                  >
                    <div className="text-3xl mb-3">{facilityIcons[index] || '🏢'}</div>
                    <h4 className="font-bold text-white mb-2 text-sm">{facility.name}</h4>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">職員</span>
                        <span className={`font-medium ${currentColor === 'blue' ? 'text-blue-400' : 
                                                      currentColor === 'green' ? 'text-green-400' :
                                                      currentColor === 'purple' ? 'text-purple-400' : 'text-orange-400'}`}>
                          {facility.totalStaff}名
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">稼働率</span>
                        <span className="text-cyan-400 font-medium">{facility.occupancyRate.toFixed(1)}%</span>
                      </div>
                      {canViewFinancials && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">予算</span>
                          <span className="text-yellow-400 font-medium">{facility.budgetExecution.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                    
                    {/* プログレスバー風の視覚化 */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            currentColor === 'blue' ? 'bg-blue-400' : 
                            currentColor === 'green' ? 'bg-green-400' :
                            currentColor === 'purple' ? 'bg-purple-400' : 'bg-orange-400'
                          }`}
                          style={{ width: `${Math.min(facility.occupancyRate, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {facility.totalDepartments}部門
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 残りの施設（5施設目以降） */}
            {facilityMetrics.length > 4 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">その他の施設</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {facilityMetrics.slice(4).map((facility, index) => {
                    const facilityIcons = ['🏥', '🚑', '🏠', '🏡'];
                    const facilityColors = ['teal', 'pink', 'indigo', 'emerald'];
                    const currentColor = facilityColors[index % facilityColors.length];
                    
                    return (
                      <div 
                        key={facility.id} 
                        className="bg-gray-800/20 rounded-xl p-4 hover:bg-gray-800/30 transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-700/30 hover:border-gray-600/30"
                        onClick={() => {
                          setSelectedFacility(facility.id);
                          setSelectedView('facility');
                        }}
                      >
                        <div className="text-3xl mb-3">{facilityIcons[index] || '🏢'}</div>
                        <h4 className="font-bold text-white mb-2 text-sm">{facility.name}</h4>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">職員</span>
                            <span className={`font-medium ${
                              currentColor === 'teal' ? 'text-teal-400' : 
                              currentColor === 'pink' ? 'text-pink-400' :
                              currentColor === 'indigo' ? 'text-indigo-400' : 'text-emerald-400'
                            }`}>
                              {facility.totalStaff}名
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">稼働率</span>
                            <span className="text-cyan-400 font-medium">{facility.occupancyRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                currentColor === 'teal' ? 'bg-teal-400' : 
                                currentColor === 'pink' ? 'bg-pink-400' :
                                currentColor === 'indigo' ? 'bg-indigo-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(facility.occupancyRate, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {facility.totalDepartments}部門
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* エンゲージメント指標 - 一時的に無効化 */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-4">エンゲージメント指標</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">提案参加率</h3>
                <div className="text-3xl font-bold text-blue-400">87.3%</div>
                <p className="text-sm text-gray-400">前月比 +2.1%</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">コラボレーション</h3>
                <div className="text-3xl font-bold text-green-400">92.1%</div>
                <p className="text-sm text-gray-400">前月比 +1.8%</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">満足度スコア</h3>
                <div className="text-3xl font-bold text-purple-400">4.2</div>
                <p className="text-sm text-gray-400">5点満点中</p>
              </div>
            </div>
          </div>
          
          {/* 戦略的イニシアチブ（レベル7以上） */}
          {canViewStrategic && (
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-white mb-4">戦略的イニシアチブ</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-2">DX推進プロジェクト</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">進捗率</span>
                    <span className="text-green-400 font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-2">人材育成プログラム</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">進捗率</span>
                    <span className="text-blue-400 font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredDepartments.map(d => (
                  <div key={d.id} className="bg-gray-800/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">{d.name}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">職員数</span>
                        <span className="text-white">{d.staffCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">プロジェクト</span>
                        <span className="text-white">{d.activeProjects}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">パフォーマンス</span>
                        <span className="text-blue-400">{d.performanceScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 部門間プロジェクト */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-4">部門間連携プロジェクト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">患者安全向上プロジェクト</h3>
                <p className="text-sm text-gray-400 mb-2">看護部・医師部・薬剤部が連携</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">進捗</span>
                  <span className="text-green-400 font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">デジタル化推進</h3>
                <p className="text-sm text-gray-400 mb-2">IT部・事務部・各病棟が連携</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">進捗</span>
                  <span className="text-blue-400 font-medium">72%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>
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
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-4">スタッフランキング</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">今月のトップパフォーマー</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-bold">1</span>
                      <span className="text-white">田中 花子</span>
                      <span className="text-gray-400 text-sm">看護部</span>
                    </div>
                    <span className="text-blue-400 font-medium">98.5pt</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-bold">2</span>
                      <span className="text-white">佐藤 太郎</span>
                      <span className="text-gray-400 text-sm">外来</span>
                    </div>
                    <span className="text-blue-400 font-medium">95.2pt</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-bold">3</span>
                      <span className="text-white">山田 美咲</span>
                      <span className="text-gray-400 text-sm">リハビリ</span>
                    </div>
                    <span className="text-blue-400 font-medium">92.8pt</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-3">部門別参加率</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">看護部</span>
                      <span className="text-white">94%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">外来</span>
                      <span className="text-white">89%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '89%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">リハビリ</span>
                      <span className="text-white">86%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-purple-400 h-2 rounded-full" style={{ width: '86%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* 組織健全性 */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white mb-4">組織健全性分析</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">エンゲージメント</h3>
                <div className="text-3xl font-bold text-green-400 mb-2">82.5%</div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '82.5%' }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">前月比 +3.2%</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">コラボレーション</h3>
                <div className="text-3xl font-bold text-blue-400 mb-2">78.3%</div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '78.3%' }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">前月比 +1.8%</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">イノベーション</h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">71.2%</div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: '71.2%' }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">前月比 +2.7%</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-2">定着率</h3>
                <div className="text-3xl font-bold text-cyan-400 mb-2">94.8%</div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '94.8%' }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">前月比 +0.5%</p>
              </div>
            </div>
          </div>

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
    </>
  );
};

export default IntegratedCorporateDashboard;