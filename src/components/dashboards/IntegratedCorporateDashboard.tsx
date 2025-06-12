import React, { useState } from 'react';
import { useDemoMode } from '../demo/DemoModeController';

const IntegratedCorporateDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'facilities' | 'departments' | 'analytics'>('overview');
  
  // 権限レベルに応じた表示制御
  const canViewFinancials = currentUser.permissionLevel >= 6;
  const canViewStrategic = currentUser.permissionLevel >= 7;
  const canViewExecutive = currentUser.permissionLevel >= 8;

  // 施設データ（8施設）
  const facilities = [
    { id: 1, name: '小原病院', staff: 450, occupancy: 85.2, budget: 78.5, quality: 92.1 },
    { id: 2, name: '立神リハ温泉病院', staff: 320, occupancy: 78.9, budget: 82.3, quality: 89.7 },
    { id: 3, name: 'エスポワール立神', staff: 180, occupancy: 82.1, budget: 76.8, quality: 87.9 },
    { id: 4, name: '介護医療院', staff: 95, occupancy: 79.8, budget: 84.2, quality: 85.3 },
    { id: 5, name: '宝寿庵', staff: 85, occupancy: 88.5, budget: 79.1, quality: 91.2 },
    { id: 6, name: '訪問看護ステーション', staff: 45, occupancy: 91.2, budget: 88.7, quality: 94.5 },
    { id: 7, name: '訪問介護事業所', staff: 35, occupancy: 86.7, budget: 83.4, quality: 88.8 },
    { id: 8, name: '居宅介護支援事業所', staff: 40, occupancy: 84.3, budget: 81.6, quality: 89.1 }
  ];

  // 施設別部門データ
  const departmentsByFacility = [
    {
      facilityId: 1,
      facilityName: '小原病院',
      departments: [
        { name: '地域包括医療病棟', staff: 95, performance: 94.2, projects: 8, budget: 82.1 },
        { name: '地域包括ケア病棟', staff: 88, performance: 91.8, projects: 6, budget: 78.5 },
        { name: '回復期リハビリ病棟', staff: 76, performance: 89.5, projects: 5, budget: 85.3 },
        { name: '外来', staff: 124, performance: 92.1, projects: 12, budget: 79.8 },
        { name: 'その他', staff: 67, performance: 87.3, projects: 7, budget: 81.2 }
      ]
    },
    {
      facilityId: 2,
      facilityName: '立神リハ温泉病院',
      departments: [
        { name: '医療療養病棟', staff: 145, performance: 88.7, projects: 9, budget: 83.4 },
        { name: 'リハビリテーション部', staff: 94, performance: 95.2, projects: 11, budget: 87.1 },
        { name: '温泉療法部', staff: 45, performance: 92.3, projects: 4, budget: 85.6 },
        { name: 'その他', staff: 36, performance: 86.1, projects: 3, budget: 79.2 }
      ]
    },
    {
      facilityId: 3,
      facilityName: 'エスポワール立神',
      departments: [
        { name: '介護サービス部', staff: 87, performance: 89.4, projects: 7, budget: 76.8 },
        { name: 'デイサービス部', staff: 52, performance: 91.2, projects: 5, budget: 82.3 },
        { name: '生活支援部', staff: 41, performance: 87.6, projects: 4, budget: 74.9 }
      ]
    },
    {
      facilityId: 4,
      facilityName: '介護医療院',
      departments: [
        { name: '介護療養部', staff: 56, performance: 84.1, projects: 4, budget: 83.7 },
        { name: '医療管理部', staff: 23, performance: 87.9, projects: 3, budget: 86.2 },
        { name: '生活支援部', staff: 16, performance: 83.5, projects: 2, budget: 81.8 }
      ]
    },
    {
      facilityId: 5,
      facilityName: '宝寿庵',
      departments: [
        { name: '特別養護老人ホーム', staff: 48, performance: 91.8, projects: 5, budget: 78.4 },
        { name: 'デイサービス', staff: 22, performance: 89.6, projects: 3, budget: 81.1 },
        { name: 'ショートステイ', staff: 15, performance: 88.2, projects: 2, budget: 76.9 }
      ]
    },
    {
      facilityId: 6,
      facilityName: '訪問看護ステーション',
      departments: [
        { name: '訪問看護部', staff: 32, performance: 95.1, projects: 6, budget: 89.3 },
        { name: '在宅支援部', staff: 13, performance: 92.7, projects: 3, budget: 87.8 }
      ]
    },
    {
      facilityId: 7,
      facilityName: '訪問介護事業所',
      departments: [
        { name: '訪問介護部', staff: 24, performance: 88.9, projects: 4, budget: 84.1 },
        { name: 'ヘルパー管理部', staff: 11, performance: 85.3, projects: 2, budget: 81.7 }
      ]
    },
    {
      facilityId: 8,
      facilityName: '居宅介護支援事業所',
      departments: [
        { name: 'ケアプラン作成部', staff: 28, performance: 90.4, projects: 5, budget: 82.9 },
        { name: '相談支援部', staff: 12, performance: 87.1, projects: 2, budget: 79.3 }
      ]
    }
  ];

  // 部門別タブのフィルター状態
  const [selectedFacilityForDept, setSelectedFacilityForDept] = useState<number | 'all'>('all');

  // 集計データ
  const totalStaff = facilities.reduce((sum, f) => sum + f.staff, 0);
  const avgOccupancy = facilities.reduce((sum, f) => sum + f.occupancy, 0) / facilities.length;
  const avgBudget = facilities.reduce((sum, f) => sum + f.budget, 0) / facilities.length;
  const avgQuality = facilities.reduce((sum, f) => sum + f.quality, 0) / facilities.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ヘッダー */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🏢</span>
                法人統合ダッシュボード
              </h1>
              <p className="text-gray-400 mt-2">全8施設・25部門の統合管理ビュー</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">権限レベル</div>
              <div className="text-2xl font-bold text-blue-400">Lv.{currentUser.permissionLevel}</div>
              <div className="text-sm text-gray-500">{currentUser.name}</div>
            </div>
          </div>

          {/* 退職処理画面風の水平4カードレイアウト */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 施設管理カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🏢</div>
              <h4 className="font-bold text-white mb-2">施設管理</h4>
              <div className="text-3xl font-bold text-blue-400 mb-1">8</div>
              <p className="text-sm text-gray-400">施設数</p>
              <div className="mt-3 text-xs text-gray-500">
                全8施設を統合管理
              </div>
            </div>

            {/* 人事統計カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="font-bold text-white mb-2">人事統計</h4>
              <div className="text-3xl font-bold text-green-400 mb-1">{totalStaff.toLocaleString()}</div>
              <p className="text-sm text-gray-400">総職員数</p>
              <div className="mt-3 text-xs text-gray-500">
                25部門に配属
              </div>
            </div>

            {/* 稼働率カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-bold text-white mb-2">稼働率</h4>
              <div className="text-3xl font-bold text-cyan-400 mb-1">{avgOccupancy.toFixed(1)}%</div>
              <p className="text-sm text-gray-400">平均稼働率</p>
              <div className="mt-3 text-xs text-gray-500">
                目標値: 85%
              </div>
            </div>

            {/* 予算執行/品質管理カード（権限レベル別） */}
            {canViewFinancials ? (
              <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-3">💰</div>
                <h4 className="font-bold text-white mb-2">予算執行</h4>
                <div className="text-3xl font-bold text-yellow-400 mb-1">{avgBudget.toFixed(1)}%</div>
                <p className="text-sm text-gray-400">予算執行率</p>
                <div className="mt-3 text-xs text-gray-500">
                  適正範囲: 80-95%
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-3">⭐</div>
                <h4 className="font-bold text-white mb-2">品質管理</h4>
                <div className="text-3xl font-bold text-purple-400 mb-1">{avgQuality.toFixed(1)}</div>
                <p className="text-sm text-gray-400">品質スコア</p>
                <div className="mt-3 text-xs text-gray-500">
                  業界平均: 82.0
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'facilities', label: '施設別', icon: '🏥' },
              { id: 'departments', label: '部門別', icon: '👥' },
              { id: 'analytics', label: '分析', icon: '📈' }
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
        <div className="max-w-7xl mx-auto">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* 施設一覧グリッド */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏥</span>
                  施設パフォーマンス概要
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {facilities.map((facility, index) => (
                    <div key={facility.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all duration-300 hover:scale-105">
                      <div className="text-2xl mb-2">🏥</div>
                      <h4 className="font-bold text-white mb-2 text-sm">{facility.name}</h4>
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">職員</span>
                          <span className="text-blue-400 font-medium">{facility.staff}名</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">稼働率</span>
                          <span className="text-cyan-400 font-medium">{facility.occupancy.toFixed(1)}%</span>
                        </div>
                        {canViewFinancials && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">予算</span>
                            <span className="text-yellow-400 font-medium">{facility.budget.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(facility.occupancy, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* エンゲージメント指標 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">エンゲージメント指標</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">提案参加率</h3>
                    <div className="text-3xl font-bold text-blue-400">87.3%</div>
                    <p className="text-sm text-gray-400">前月比 +2.1%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">コラボレーション</h3>
                    <div className="text-3xl font-bold text-green-400">92.1%</div>
                    <p className="text-sm text-gray-400">前月比 +1.8%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">満足度スコア</h3>
                    <div className="text-3xl font-bold text-purple-400">4.2</div>
                    <p className="text-sm text-gray-400">5点満点中</p>
                  </div>
                </div>
              </div>

              {/* 戦略的イニシアチブ（レベル7以上） */}
              {canViewStrategic && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">戦略的イニシアチブ (Level 7+)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-2">DX推進プロジェクト</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">進捗率</span>
                        <span className="text-green-400 font-medium">78%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
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

              {/* 経営戦略分析（レベル8） */}
              {canViewExecutive && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">経営戦略分析 (Level 8)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-300 mb-3">成長機会</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">●</span>
                          <span className="text-gray-300">訪問看護事業の拡大余地あり（稼働率91%）</span>
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
            </div>
          )}

          {selectedTab === 'facilities' && (
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">施設別詳細</h2>
              <div className="space-y-4">
                {facilities.map((facility) => (
                  <div key={facility.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">{facility.name}</h3>
                      <span className="text-sm text-gray-400">{facility.staff}名</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">稼働率</div>
                        <div className="text-xl font-bold text-cyan-400">{facility.occupancy.toFixed(1)}%</div>
                      </div>
                      {canViewFinancials && (
                        <div>
                          <div className="text-sm text-gray-400">予算執行率</div>
                          <div className="text-xl font-bold text-yellow-400">{facility.budget.toFixed(1)}%</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-gray-400">品質スコア</div>
                        <div className="text-xl font-bold text-purple-400">{facility.quality.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'departments' && (
            <div className="space-y-6">
              {/* 施設フィルター */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <label className="text-white font-medium">施設フィルター:</label>
                  <select 
                    value={selectedFacilityForDept}
                    onChange={(e) => setSelectedFacilityForDept(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="all">全施設</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>{facility.name}</option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-400">
                    {selectedFacilityForDept === 'all' 
                      ? `全${departmentsByFacility.reduce((sum, f) => sum + f.departments.length, 0)}部門を表示中`
                      : `${departmentsByFacility.find(f => f.facilityId === selectedFacilityForDept)?.departments.length || 0}部門を表示中`
                    }
                  </div>
                </div>
              </div>

              {/* 部門データ表示 */}
              {selectedFacilityForDept === 'all' ? (
                // 全施設の部門を施設別にグループ表示
                <div className="space-y-6">
                  {departmentsByFacility.map((facilityDept) => (
                    <div key={facilityDept.facilityId} className="bg-gray-800/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <span className="text-2xl">🏥</span>
                          {facilityDept.facilityName}
                        </h3>
                        <span className="text-sm text-gray-400">
                          {facilityDept.departments.length}部門 • {facilityDept.departments.reduce((sum, d) => sum + d.staff, 0)}名
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {facilityDept.departments.map((dept, index) => (
                          <div key={index} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all duration-300">
                            <h4 className="text-lg font-medium text-white mb-3">{dept.name}</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">職員数</span>
                                <span className="text-white font-medium">{dept.staff}名</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">プロジェクト</span>
                                <span className="text-white font-medium">{dept.projects}件</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">パフォーマンス</span>
                                <span className={`font-medium ${
                                  dept.performance >= 90 ? 'text-green-400' :
                                  dept.performance >= 85 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {dept.performance.toFixed(1)}%
                                </span>
                              </div>
                              {canViewFinancials && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">予算執行</span>
                                  <span className={`font-medium ${
                                    dept.budget >= 85 ? 'text-green-400' :
                                    dept.budget >= 75 ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {dept.budget.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* パフォーマンス可視化バー */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-600/50 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    dept.performance >= 90 ? 'bg-green-400' :
                                    dept.performance >= 85 ? 'bg-yellow-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${Math.min(dept.performance, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 特定施設の部門詳細表示
                (() => {
                  const selectedFacilityDept = departmentsByFacility.find(f => f.facilityId === selectedFacilityForDept);
                  if (!selectedFacilityDept) return null;
                  
                  return (
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <span className="text-2xl">🏥</span>
                          {selectedFacilityDept.facilityName} 部門詳細
                        </h3>
                        <div className="text-sm text-gray-400">
                          {selectedFacilityDept.departments.length}部門 • 
                          {selectedFacilityDept.departments.reduce((sum, d) => sum + d.staff, 0)}名 • 
                          {selectedFacilityDept.departments.reduce((sum, d) => sum + d.projects, 0)}プロジェクト
                        </div>
                      </div>

                      {/* 部門パフォーマンス比較チャート風 */}
                      <div className="mb-6 bg-gray-700/20 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-white mb-4">部門パフォーマンス比較</h4>
                        <div className="space-y-3">
                          {selectedFacilityDept.departments
                            .sort((a, b) => b.performance - a.performance)
                            .map((dept, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-32 text-sm text-white truncate">{dept.name}</div>
                              <div className="flex-1 bg-gray-600/50 rounded-full h-3 relative">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-1000 ${
                                    index === 0 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                    index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                    index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                                    'bg-gradient-to-r from-gray-400 to-gray-500'
                                  }`}
                                  style={{ width: `${dept.performance}%` }}
                                />
                                <span className="absolute right-2 top-0 text-xs text-white leading-3">
                                  {dept.performance.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-16 text-xs text-gray-400">{dept.staff}名</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 詳細部門カード */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedFacilityDept.departments.map((dept, index) => (
                          <div key={index} className="bg-gray-700/30 rounded-lg p-6 hover:bg-gray-700/40 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-white">{dept.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                dept.performance >= 90 ? 'bg-green-500/20 text-green-400' :
                                dept.performance >= 85 ? 'bg-yellow-500/20 text-yellow-400' : 
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {dept.performance >= 90 ? '優秀' : dept.performance >= 85 ? '良好' : '要改善'}
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">職員数</div>
                                  <div className="text-xl font-bold text-white">{dept.staff}名</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">プロジェクト</div>
                                  <div className="text-xl font-bold text-blue-400">{dept.projects}件</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">パフォーマンス</div>
                                  <div className="text-xl font-bold text-cyan-400">{dept.performance.toFixed(1)}%</div>
                                </div>
                                {canViewFinancials && (
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">予算執行</div>
                                    <div className="text-xl font-bold text-yellow-400">{dept.budget.toFixed(1)}%</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* 部門横断比較（全施設表示時のみ） */}
              {selectedFacilityForDept === 'all' && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    部門タイプ別比較分析
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* リハビリ系部門比較 */}
                    <div className="bg-gray-700/20 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">リハビリ系部門</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">回復期リハビリ病棟</span>
                          <span className="text-green-400">89.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">リハビリテーション部</span>
                          <span className="text-green-400">95.2%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          平均: 92.4%
                        </div>
                      </div>
                    </div>

                    {/* 介護系部門比較 */}
                    <div className="bg-gray-700/20 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">介護系部門</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">介護サービス部</span>
                          <span className="text-yellow-400">89.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">介護療養部</span>
                          <span className="text-yellow-400">84.1%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          平均: 86.8%
                        </div>
                      </div>
                    </div>

                    {/* 訪問系部門比較 */}
                    <div className="bg-gray-700/20 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">訪問系部門</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">訪問看護部</span>
                          <span className="text-green-400">95.1%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">訪問介護部</span>
                          <span className="text-yellow-400">88.9%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          平均: 92.0%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">組織健全性分析</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">エンゲージメント</h3>
                    <div className="text-3xl font-bold text-green-400 mb-2">82.5%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '82.5%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">前月比 +3.2%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">コラボレーション</h3>
                    <div className="text-3xl font-bold text-blue-400 mb-2">78.3%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '78.3%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">前月比 +1.8%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">イノベーション</h3>
                    <div className="text-3xl font-bold text-purple-400 mb-2">71.2%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-purple-400 h-2 rounded-full" style={{ width: '71.2%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">前月比 +2.7%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">定着率</h3>
                    <div className="text-3xl font-bold text-cyan-400 mb-2">94.8%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '94.8%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">前月比 +0.5%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegratedCorporateDashboard;