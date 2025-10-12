import React, { useState } from 'react';

/**
 * プロジェクトモード設定ページ
 * - プロジェクト化閾値設定
 * - チーム編成ルール設定
 * - 進捗管理設定
 */
export const ProjectModeSettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'threshold' | 'team' | 'progress'>('threshold');

  return (
    <div className="space-y-6">
      {/* セクション選択タブ */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSection('threshold')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${activeSection === 'threshold'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">📊</span>
              <span>プロジェクト化閾値</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('team')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${activeSection === 'team'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">👥</span>
              <span>チーム編成ルール</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('progress')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${activeSection === 'progress'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">📈</span>
              <span>進捗管理設定</span>
            </div>
          </button>
        </div>
      </div>

      {/* プロジェクト化閾値設定 */}
      {activeSection === 'threshold' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-2">
              <span className="text-2xl">📊</span>
              <span>プロジェクト化閾値設定</span>
            </h2>
            <p className="text-sm text-slate-400">
              アイデアボイスがプロジェクト化される条件を設定します
            </p>
          </div>

          {/* スコア閾値設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">スコア閾値</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">部署プロジェクト化</div>
                  <div className="text-xs text-slate-400 mt-1">部署内でプロジェクトチームを編成</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={200}
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">点以上</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">施設プロジェクト化</div>
                  <div className="text-xs text-slate-400 mt-1">施設横断でプロジェクトチームを編成</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={400}
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">点以上</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">法人プロジェクト化</div>
                  <div className="text-xs text-slate-400 mt-1">法人全体でプロジェクトチームを編成</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={800}
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">点以上</span>
                </div>
              </div>
            </div>
          </div>

          {/* 緊急昇格設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white mb-4">緊急昇格設定</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">緊急昇格を有効化</div>
                  <div className="text-xs text-slate-400 mt-1">管理職が重要案件を即座にプロジェクト化</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">最低必要レベル</div>
                  <div className="text-xs text-slate-400 mt-1">緊急昇格を実行できる最低権限レベル</div>
                </div>
                <select className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white">
                  <option value="8">Level 8 (部長)</option>
                  <option value="10">Level 10 (施設長)</option>
                  <option value="12">Level 12 (経営幹部)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* チーム編成ルール */}
      {activeSection === 'team' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-2">
              <span className="text-2xl">👥</span>
              <span>チーム編成ルール設定</span>
            </h2>
            <p className="text-sm text-slate-400">
              プロジェクトチームの自動編成ルールを設定します
            </p>
          </div>

          {/* チームサイズ設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">チームサイズ</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">最小チームサイズ</div>
                  <div className="text-xs text-slate-400 mt-1">プロジェクトチームの最小人数</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={3}
                    min={2}
                    max={10}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">名</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">推奨チームサイズ</div>
                  <div className="text-xs text-slate-400 mt-1">効率的なプロジェクト運営のための推奨人数</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={5}
                    min={3}
                    max={15}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">名</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">最大チームサイズ</div>
                  <div className="text-xs text-slate-400 mt-1">プロジェクトチームの最大人数</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={12}
                    min={5}
                    max={30}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">名</span>
                </div>
              </div>
            </div>
          </div>

          {/* 役割自動割り当て */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">役割自動割り当て</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600/30 rounded">
                <div>
                  <div className="text-sm font-medium text-slate-300">プロジェクトリーダー</div>
                  <div className="text-xs text-slate-400 mt-1">Level 5以上から自動選出</div>
                </div>
                <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-xs text-green-400">
                  有効
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600/30 rounded">
                <div>
                  <div className="text-sm font-medium text-slate-300">サブリーダー</div>
                  <div className="text-xs text-slate-400 mt-1">Level 3以上から自動選出</div>
                </div>
                <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-xs text-green-400">
                  有効
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600/30 rounded">
                <div>
                  <div className="text-sm font-medium text-slate-300">記録係</div>
                  <div className="text-xs text-slate-400 mt-1">全レベルから自動選出</div>
                </div>
                <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-xs text-green-400">
                  有効
                </span>
              </div>
            </div>
          </div>

          {/* 専門性考慮設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white mb-4">専門性考慮設定</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">職種バランスを考慮</div>
                  <div className="text-xs text-slate-400 mt-1">多様な職種でチームを編成</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">関連部署を優先</div>
                  <div className="text-xs text-slate-400 mt-1">議題に関連する部署のメンバーを優先</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 進捗管理設定 */}
      {activeSection === 'progress' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-2">
              <span className="text-2xl">📈</span>
              <span>進捗管理設定</span>
            </h2>
            <p className="text-sm text-slate-400">
              プロジェクトの進捗管理とマイルストーン設定
            </p>
          </div>

          {/* マイルストーン設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">デフォルトマイルストーン</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600/30 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="text-sm font-medium text-slate-300">キックオフ</div>
                    <div className="text-xs text-slate-400 mt-1">プロジェクト開始後 3日以内</div>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600/30 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <div className="text-sm font-medium text-slate-300">計画書作成</div>
                    <div className="text-xs text-slate-400 mt-1">キックオフ後 7日以内</div>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600/30 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <div className="text-sm font-medium text-slate-300">中間報告</div>
                    <div className="text-xs text-slate-400 mt-1">プロジェクト期間の50%時点</div>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600/30 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="text-sm font-medium text-slate-300">最終報告</div>
                    <div className="text-xs text-slate-400 mt-1">プロジェクト終了前 7日</div>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
              </div>
            </div>
          </div>

          {/* 通知設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white mb-4">進捗通知設定</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">期限前通知</div>
                  <div className="text-xs text-slate-400 mt-1">マイルストーン期限の何日前に通知</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={3}
                    min={1}
                    max={14}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">日前</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">遅延アラート</div>
                  <div className="text-xs text-slate-400 mt-1">期限超過時に管理者に自動通知</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">週次進捗レポート</div>
                  <div className="text-xs text-slate-400 mt-1">チームリーダーに週次で進捗状況を通知</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex items-center justify-end space-x-3">
        <button className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 transition-colors">
          キャンセル
        </button>
        <button className="px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors">
          プレビュー
        </button>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors">
          設定を保存
        </button>
      </div>
    </div>
  );
};
