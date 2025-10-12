import React, { useState } from 'react';

/**
 * 議題モード設定ページ
 * - 投票スコープ設定（部署/科ごとのパターン設定）
 * - 投票グループ設定（小規模部署の統合）
 * - 主承認者設定（グループ代表者のローテーション）
 */
export const AgendaModeSettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'scope' | 'groups' | 'approvers'>('scope');

  return (
    <div className="space-y-6">
      {/* セクション選択タブ */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSection('scope')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${activeSection === 'scope'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🎯</span>
              <span>投票スコープ設定</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('groups')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${activeSection === 'groups'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">👥</span>
              <span>投票グループ管理</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('approvers')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${activeSection === 'approvers'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">✅</span>
              <span>主承認者設定</span>
            </div>
          </button>
        </div>
      </div>

      {/* 投票スコープ設定 */}
      {activeSection === 'scope' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <span>投票スコープ設定</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                各部署・科ごとの投票範囲パターンを設定します
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors">
              新規設定追加
            </button>
          </div>

          {/* パターン説明 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 border border-slate-600/30 rounded-lg p-4">
              <div className="text-lg font-bold text-green-400 mb-2">パターンA: 配置単位</div>
              <p className="text-sm text-slate-400">病棟・部門など配置場所単位の投票</p>
              <div className="mt-3 text-xs text-slate-500">
                例: 3F病棟看護師、リハ温泉PT
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-600/30 rounded-lg p-4">
              <div className="text-lg font-bold text-yellow-400 mb-2">パターンB: 職種単位</div>
              <p className="text-sm text-slate-400">同じ職種全体での投票</p>
              <div className="mt-3 text-xs text-slate-500">
                例: PT全体、看護師全体
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-600/30 rounded-lg p-4">
              <div className="text-lg font-bold text-purple-400 mb-2">パターンC: 部署全体</div>
              <p className="text-sm text-slate-400">部署・科の全職員での投票</p>
              <div className="mt-3 text-xs text-slate-500">
                例: リハビリテーション科全体
              </div>
            </div>
          </div>

          {/* 設定テーブル */}
          <div className="bg-slate-900/30 border border-slate-700/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">部署名</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">科名</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">投票パターン</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">対象人数</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-300">看護部</td>
                  <td className="px-4 py-3 text-sm text-slate-300">看護科</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-xs text-green-400">
                      パターンA（配置単位）
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">約80名（病棟別）</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-300">リハビリテーション部</td>
                  <td className="px-4 py-3 text-sm text-slate-300">理学療法科</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded-full text-xs text-yellow-400">
                      パターンB（職種単位）
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">約15名</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-300">経営管理部</td>
                  <td className="px-4 py-3 text-sm text-slate-300">総務科</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-400">
                      パターンC（部署全体）
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">約8名</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 投票グループ管理 */}
      {activeSection === 'groups' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <span>投票グループ管理</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                小規模部署を統合して統計的信頼性を確保します
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors">
              新規グループ作成
            </button>
          </div>

          {/* グループカード */}
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">小規模事務部門グループ</h3>
                  <p className="text-sm text-slate-400 mt-1">合計人数: 22名</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-xs text-green-400">
                    有効
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-3">
                  <div className="text-sm text-slate-300 font-medium">総務科</div>
                  <div className="text-xs text-slate-400 mt-1">8名</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-3">
                  <div className="text-sm text-slate-300 font-medium">経理科</div>
                  <div className="text-xs text-slate-400 mt-1">7名</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-3">
                  <div className="text-sm text-slate-300 font-medium">人事科</div>
                  <div className="text-xs text-slate-400 mt-1">7名</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">リハ専門職グループ</h3>
                  <p className="text-sm text-slate-400 mt-1">合計人数: 28名</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-xs text-green-400">
                    有効
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">編集</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-3">
                  <div className="text-sm text-slate-300 font-medium">理学療法科</div>
                  <div className="text-xs text-slate-400 mt-1">15名</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-3">
                  <div className="text-sm text-slate-300 font-medium">作業療法科</div>
                  <div className="text-xs text-slate-400 mt-1">8名</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-3">
                  <div className="text-sm text-slate-300 font-medium">言語聴覚科</div>
                  <div className="text-xs text-slate-400 mt-1">5名</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主承認者設定 */}
      {activeSection === 'approvers' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <span>主承認者設定</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                投票グループの代表承認者とローテーション設定
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">小規模事務部門グループ</h3>
                  <p className="text-sm text-slate-400 mt-1">承認者数: 3名（月次ローテーション）</p>
                </div>
                <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-sm text-blue-400 transition-colors">
                  ローテーション設定
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 border border-green-500/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-green-400 font-medium">現在担当</span>
                    <span className="text-xs text-slate-500">総務科長</span>
                  </div>
                  <div className="text-sm text-white font-medium">山田 太郎</div>
                  <div className="text-xs text-slate-400 mt-1">2025年10月担当</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">次回担当</span>
                    <span className="text-xs text-slate-500">経理科長</span>
                  </div>
                  <div className="text-sm text-slate-300 font-medium">佐藤 花子</div>
                  <div className="text-xs text-slate-400 mt-1">2025年11月担当</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">待機</span>
                    <span className="text-xs text-slate-500">人事科長</span>
                  </div>
                  <div className="text-sm text-slate-300 font-medium">鈴木 次郎</div>
                  <div className="text-xs text-slate-400 mt-1">2025年12月担当</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">リハ専門職グループ</h3>
                  <p className="text-sm text-slate-400 mt-1">承認者数: 3名（四半期ローテーション）</p>
                </div>
                <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-sm text-blue-400 transition-colors">
                  ローテーション設定
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 border border-green-500/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-green-400 font-medium">現在担当</span>
                    <span className="text-xs text-slate-500">PT科長</span>
                  </div>
                  <div className="text-sm text-white font-medium">田中 一郎</div>
                  <div className="text-xs text-slate-400 mt-1">Q4 2025担当</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">次回担当</span>
                    <span className="text-xs text-slate-500">OT科長</span>
                  </div>
                  <div className="text-sm text-slate-300 font-medium">高橋 美咲</div>
                  <div className="text-xs text-slate-400 mt-1">Q1 2026担当</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">待機</span>
                    <span className="text-xs text-slate-500">ST科長</span>
                  </div>
                  <div className="text-sm text-slate-300 font-medium">伊藤 健太</div>
                  <div className="text-xs text-slate-400 mt-1">Q2 2026担当</div>
                </div>
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
