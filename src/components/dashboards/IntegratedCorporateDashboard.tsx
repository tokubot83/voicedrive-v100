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
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">部門別パフォーマンス</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: '看護部', staff: 380, performance: 94.2, projects: 12 },
                  { name: '医師部', staff: 156, performance: 91.8, projects: 8 },
                  { name: 'リハビリ部', staff: 94, performance: 89.5, projects: 6 },
                  { name: '薬剤部', staff: 32, performance: 92.1, projects: 4 },
                  { name: '事務部', staff: 87, performance: 86.3, projects: 9 },
                  { name: 'IT部', staff: 25, performance: 95.7, projects: 15 }
                ].map((dept, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-2">{dept.name}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">職員数</span>
                        <span className="text-white">{dept.staff}名</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">プロジェクト</span>
                        <span className="text-white">{dept.projects}件</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">パフォーマンス</span>
                        <span className="text-blue-400">{dept.performance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegratedCorporateDashboard;