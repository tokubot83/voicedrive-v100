import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDemoMode } from '../demo/DemoModeController';
import { demoUsers, getDemoUsersByFacility } from '../../data/demo/users';

const IntegratedCorporateDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'facilities' | 'departments' | 'analytics' | 'financials'>('overview');
  
  // 権限レベルに応じた表示制御
  const canViewFinancials = currentUser?.permissionLevel >= 6;
  const canViewStrategic = currentUser?.permissionLevel >= 7;
  const canViewExecutive = currentUser?.permissionLevel >= 8;

  // 施設データ（8施設）品質スコアの詳細付き
  const facilities = [
    { 
      id: 1, 
      name: '小原病院', 
      staff: 450, 
      occupancy: 85.2, 
      budget: 78.5, 
      quality: 92.1,
      qualityDetails: {
        patientSatisfaction: 94.5,  // 患者満足度
        medicalSafety: 91.2,        // 医療安全指標
        staffRetention: 89.8,       // 職員定着率
        efficiency: 92.3,           // 業務効率性
        communityCollaboration: 91.7 // 地域連携度
      }
    },
    { 
      id: 2, 
      name: '立神リハ温泉病院', 
      staff: 320, 
      occupancy: 78.9, 
      budget: 82.3, 
      quality: 89.7,
      qualityDetails: {
        patientSatisfaction: 91.3,
        medicalSafety: 89.5,
        staffRetention: 86.2,
        efficiency: 90.1,
        communityCollaboration: 91.4
      }
    },
    { 
      id: 3, 
      name: 'エスポワール立神', 
      staff: 180, 
      occupancy: 82.1, 
      budget: 76.8, 
      quality: 87.9,
      qualityDetails: {
        patientSatisfaction: 89.2,
        medicalSafety: 88.1,
        staffRetention: 84.7,
        efficiency: 87.5,
        communityCollaboration: 89.8
      }
    },
    { 
      id: 4, 
      name: '介護医療院', 
      staff: 95, 
      occupancy: 79.8, 
      budget: 84.2, 
      quality: 85.3,
      qualityDetails: {
        patientSatisfaction: 87.1,
        medicalSafety: 85.8,
        staffRetention: 82.3,
        efficiency: 84.9,
        communityCollaboration: 86.4
      }
    },
    { 
      id: 5, 
      name: '宝寿庵', 
      staff: 85, 
      occupancy: 88.5, 
      budget: 79.1, 
      quality: 91.2,
      qualityDetails: {
        patientSatisfaction: 93.8,
        medicalSafety: 90.5,
        staffRetention: 88.9,
        efficiency: 91.2,
        communityCollaboration: 91.6
      }
    },
    { 
      id: 6, 
      name: '訪問看護ステーション', 
      staff: 45, 
      occupancy: 91.2, 
      budget: 88.7, 
      quality: 94.5,
      qualityDetails: {
        patientSatisfaction: 96.2,
        medicalSafety: 94.8,
        staffRetention: 92.1,
        efficiency: 94.3,
        communityCollaboration: 95.1
      }
    },
    { 
      id: 7, 
      name: '訪問介護事業所', 
      staff: 35, 
      occupancy: 86.7, 
      budget: 83.4, 
      quality: 88.8,
      qualityDetails: {
        patientSatisfaction: 90.3,
        medicalSafety: 88.2,
        staffRetention: 86.5,
        efficiency: 89.1,
        communityCollaboration: 89.8
      }
    },
    { 
      id: 8, 
      name: '居宅介護支援事業所', 
      staff: 40, 
      occupancy: 84.3, 
      budget: 81.6, 
      quality: 89.1,
      qualityDetails: {
        patientSatisfaction: 91.5,
        medicalSafety: 88.9,
        staffRetention: 86.8,
        efficiency: 88.7,
        communityCollaboration: 89.6
      }
    }
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

  // currentUserのnullチェック
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">ユーザー情報を読み込み中...</h2>
          <p className="text-gray-400">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Custom Header with Back Button */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">運営分析ダッシュボード</h1>
            <p className="text-gray-400 text-sm">施設運営・予算・品質・稼働率の総合分析</p>
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
        <div className="max-w-7xl mx-auto">

          {/* 運営分析統計カードレイアウト */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 施設数カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">🏢</div>
              <h4 className="font-bold text-white mb-2">施設数</h4>
              <div className="text-3xl font-bold text-blue-400 mb-1">8</div>
              <p className="text-sm text-gray-400">運営施設</p>
              <div className="mt-3 text-xs text-gray-500">
                病院・介護・訪問事業
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

            {/* 予算執行カード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold text-white mb-2">予算執行</h4>
              <div className="text-3xl font-bold text-yellow-400 mb-1">{avgBudget.toFixed(1)}%</div>
              <p className="text-sm text-gray-400">執行率</p>
              <div className="mt-3 text-xs text-gray-500">
                適正範囲: 80-95%
              </div>
            </div>

            {/* 品質スコアカード */}
            <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105 relative group">
              <div className="text-4xl mb-3">⭐</div>
              <h4 className="font-bold text-white mb-2">品質スコア</h4>
              <div className="text-3xl font-bold text-purple-400 mb-1">{avgQuality.toFixed(1)}</div>
              <p className="text-sm text-gray-400">100点満点</p>
              <div className="mt-3 text-xs text-gray-500">
                業界平均: 82.0
              </div>
              
              {/* ホバー時の詳細説明 */}
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 border border-gray-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="text-xs text-white mb-2 font-semibold">品質スコア構成要素:</div>
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>• 患者満足度</span>
                    <span className="text-purple-400">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 医療安全指標</span>
                    <span className="text-purple-400">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 職員定着率</span>
                    <span className="text-purple-400">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 業務効率性</span>
                    <span className="text-purple-400">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• 地域連携度</span>
                    <span className="text-purple-400">10%</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                  100点満点の総合評価
                </div>
              </div>
            </div>
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
              { id: 'financials', label: '財務分析', icon: '💰' },
              { id: 'analytics', label: '品質分析', icon: '📈' }
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
                <span>{tab?.icon}</span>
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
                      <div className="relative group">
                        <div className="text-sm text-gray-400">品質スコア</div>
                        <div className="text-xl font-bold text-purple-400 cursor-help">{facility.quality.toFixed(1)}</div>
                        
                        {/* 品質スコア詳細ホバー */}
                        <div className="absolute bottom-full right-0 mb-2 w-56 bg-gray-900 border border-gray-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                          <div className="text-xs text-white mb-2 font-semibold">品質スコア内訳</div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-300">患者満足度</span>
                              <span className={`font-medium ${
                                facility.qualityDetails.patientSatisfaction >= 90 ? 'text-green-400' :
                                facility.qualityDetails.patientSatisfaction >= 85 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {facility.qualityDetails.patientSatisfaction.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-300">医療安全</span>
                              <span className={`font-medium ${
                                facility.qualityDetails.medicalSafety >= 90 ? 'text-green-400' :
                                facility.qualityDetails.medicalSafety >= 85 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {facility.qualityDetails.medicalSafety.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-300">職員定着率</span>
                              <span className={`font-medium ${
                                facility.qualityDetails.staffRetention >= 90 ? 'text-green-400' :
                                facility.qualityDetails.staffRetention >= 85 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {facility.qualityDetails.staffRetention.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-300">業務効率</span>
                              <span className={`font-medium ${
                                facility.qualityDetails.efficiency >= 90 ? 'text-green-400' :
                                facility.qualityDetails.efficiency >= 85 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {facility.qualityDetails.efficiency.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-300">地域連携</span>
                              <span className={`font-medium ${
                                facility.qualityDetails.communityCollaboration >= 90 ? 'text-green-400' :
                                facility.qualityDetails.communityCollaboration >= 85 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {facility.qualityDetails.communityCollaboration.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
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

          {selectedTab === 'financials' && (
            <div className="space-y-6">
              {/* 財務サマリー */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  財務分析サマリー
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">総予算執行率</h3>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">{avgBudget.toFixed(1)}%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${avgBudget}%` }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">適正範囲: 80-95%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">収益効率</h3>
                    <div className="text-3xl font-bold text-green-400 mb-2">92.3%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '92.3%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">前年比 +3.2%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">コスト管理</h3>
                    <div className="text-3xl font-bold text-blue-400 mb-2">87.8%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '87.8%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">目標達成率</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-2">投資効果</h3>
                    <div className="text-3xl font-bold text-purple-400 mb-2">15.2%</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-purple-400 h-2 rounded-full" style={{ width: '76%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">ROI指標</p>
                  </div>
                </div>
              </div>

              {/* 施設別財務パフォーマンス */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">施設別財務パフォーマンス</h2>
                <div className="space-y-4">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-white">{facility.name}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">予算執行率</span>
                          <span className={`text-lg font-bold ${
                            facility.budget >= 90 ? 'text-red-400' :
                            facility.budget >= 80 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {facility.budget.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-600/50 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            facility.budget >= 90 ? 'bg-red-400' :
                            facility.budget >= 80 ? 'bg-yellow-400' :
                            'bg-green-400'
                          }`}
                          style={{ width: `${facility.budget}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              
              {/* 品質管理詳細分析 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  品質管理分析
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 品質指標の説明 */}
                  <div className="bg-gray-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">品質スコアとは？</h3>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-purple-400 pl-3">
                        <h4 className="font-medium text-white mb-1">総合的な医療・介護サービスの質を評価</h4>
                        <p className="text-gray-300">
                          各施設の医療・介護サービスの質を5つの観点から総合的に評価した指標です。
                          100点満点で、業界平均は82.0点です。
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">📊</span>
                          <div>
                            <div className="text-white font-medium">患者満足度 (30%)</div>
                            <div className="text-gray-400 text-xs">患者アンケート、口コミ評価、リピート率</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">🛡️</span>
                          <div>
                            <div className="text-white font-medium">医療安全指標 (25%)</div>
                            <div className="text-gray-400 text-xs">インシデント発生率、感染対策、安全管理体制</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">👥</span>
                          <div>
                            <div className="text-white font-medium">職員定着率 (20%)</div>
                            <div className="text-gray-400 text-xs">離職率、職員満足度、教育研修体制</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">⚡</span>
                          <div>
                            <div className="text-white font-medium">業務効率性 (15%)</div>
                            <div className="text-gray-400 text-xs">ベッド回転率、待ち時間、業務改善活動</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">🤝</span>
                          <div>
                            <div className="text-white font-medium">地域連携度 (10%)</div>
                            <div className="text-gray-400 text-xs">紹介率、地域活動参加、他機関との連携</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 施設別品質ランキング */}
                  <div className="bg-gray-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">施設別品質ランキング</h3>
                    <div className="space-y-2">
                      {[...facilities]
                        .sort((a, b) => b.quality - a.quality)
                        .map((facility, index) => (
                          <div key={facility.id} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              index === 2 ? 'bg-orange-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="text-white text-sm">{facility.name}</span>
                                <span className={`font-bold text-sm ${
                                  facility.quality >= 90 ? 'text-green-400' :
                                  facility.quality >= 85 ? 'text-yellow-400' :
                                  'text-orange-400'
                                }`}>
                                  {facility.quality.toFixed(1)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-600/50 rounded-full h-1.5 mt-1">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    facility.quality >= 90 ? 'bg-green-400' :
                                    facility.quality >= 85 ? 'bg-yellow-400' :
                                    'bg-orange-400'
                                  }`}
                                  style={{ width: `${facility.quality}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-400">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span>90点以上: 優秀</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span>85-89点: 良好</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                          <span>85点未満: 改善推奨</span>
                        </div>
                      </div>
                    </div>
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