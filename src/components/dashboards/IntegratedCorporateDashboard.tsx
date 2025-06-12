import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../demo/DemoModeController';

const IntegratedCorporateDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  
  // デバッグ用ログ
  console.log('IntegratedCorporateDashboard - Current User:', currentUser);
  console.log('IntegratedCorporateDashboard - Permission Level:', currentUser?.permissionLevel);
  
  // 権限レベルに応じた表示制御
  const canViewFinancials = currentUser.permissionLevel >= 6;
  const canViewStrategic = currentUser.permissionLevel >= 7;
  const canViewExecutive = currentUser.permissionLevel >= 8;

  // まずシンプルなテストバージョンを表示
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">法人統合ダッシュボード</h1>
        <p className="text-gray-400">全施設・全部門の統合管理ビュー（テスト版）</p>
        <div className="mt-4 text-right">
          <div className="text-sm text-gray-400">権限レベル</div>
          <div className="text-2xl font-bold text-blue-400">Lv.{currentUser.permissionLevel}</div>
          <div className="text-sm text-gray-400">{currentUser.name}</div>
        </div>
      </div>

      {/* 法人全体サマリー - 退職処理画面風の水平レイアウト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-3">🏢</div>
          <h4 className="font-bold text-white mb-2">施設管理</h4>
          <div className="text-3xl font-bold text-blue-400 mb-1">8</div>
          <p className="text-sm text-gray-400">施設数</p>
          <div className="mt-3 text-xs text-gray-500">
            全8施設を統合管理
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-3">👥</div>
          <h4 className="font-bold text-white mb-2">人事統計</h4>
          <div className="text-3xl font-bold text-green-400 mb-1">1,250</div>
          <p className="text-sm text-gray-400">総職員数</p>
          <div className="mt-3 text-xs text-gray-500">
            25部門に配属
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-3">📊</div>
          <h4 className="font-bold text-white mb-2">稼働率</h4>
          <div className="text-3xl font-bold text-cyan-400 mb-1">82.5%</div>
          <p className="text-sm text-gray-400">平均稼働率</p>
          <div className="mt-3 text-xs text-gray-500">
            目標値: 85%
          </div>
        </div>
        
        {canViewFinancials ? (
          <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">💰</div>
            <h4 className="font-bold text-white mb-2">予算執行</h4>
            <div className="text-3xl font-bold text-yellow-400 mb-1">78.2%</div>
            <p className="text-sm text-gray-400">予算執行率</p>
            <div className="mt-3 text-xs text-gray-500">
              適正範囲: 80-95%
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">⭐</div>
            <h4 className="font-bold text-white mb-2">品質管理</h4>
            <div className="text-3xl font-bold text-purple-400 mb-1">85.7</div>
            <p className="text-sm text-gray-400">品質スコア</p>
            <div className="mt-3 text-xs text-gray-500">
              業界平均: 82.0
            </div>
          </div>
        )}
      </div>

      {/* タブナビゲーション風の簡易版 */}
      <div className="mt-8 bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          施設一覧（全8施設）
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: '小原病院', staff: 450, rate: 85.2, color: 'blue' },
            { name: '立神リハ温泉病院', staff: 320, rate: 78.9, color: 'green' },
            { name: 'エスポワール立神', staff: 180, rate: 82.1, color: 'purple' },
            { name: '介護医療院', staff: 95, rate: 79.8, color: 'orange' },
            { name: '宝寿庵', staff: 85, rate: 88.5, color: 'teal' },
            { name: '訪問看護ステーション', staff: 45, rate: 91.2, color: 'pink' },
            { name: '訪問介護事業所', staff: 35, rate: 86.7, color: 'indigo' },
            { name: '居宅介護支援事業所', staff: 40, rate: 84.3, color: 'emerald' }
          ].map((facility, index) => (
            <div 
              key={index} 
              className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-600/50 hover:border-gray-500/50"
            >
              <div className="text-2xl mb-2">🏥</div>
              <h4 className="font-bold text-white mb-2 text-sm">{facility.name}</h4>
              
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">職員</span>
                  <span className={`font-medium text-${facility.color}-400`}>
                    {facility.staff}名
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">稼働率</span>
                  <span className="text-cyan-400 font-medium">{facility.rate}%</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 bg-${facility.color}-400`}
                    style={{ width: `${Math.min(facility.rate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 権限レベル別の追加情報 */}
      {canViewStrategic && (
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
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

      {canViewExecutive && (
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">経営戦略分析 (Level 8)</h2>
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
    </div>
  );
};

export default IntegratedCorporateDashboard;