import React, { useState } from 'react';

/**
 * 投票設定変更履歴ページ
 * - 設定変更の履歴を時系列で表示
 * - 変更内容の詳細確認
 * - ロールバック機能（将来実装）
 */
export const VotingHistoryPage: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'all' | 'agenda' | 'project'>('all');

  // ダミーデータ
  const historyItems = [
    {
      id: 1,
      date: '2025-10-13 14:30',
      mode: 'agenda' as const,
      category: '投票スコープ設定',
      user: '山田 太郎',
      userLevel: 99,
      action: '看護部-看護科の投票パターンをパターンCからパターンAに変更',
      impact: '約80名に影響',
      status: 'active' as const
    },
    {
      id: 2,
      date: '2025-10-12 16:15',
      mode: 'project' as const,
      category: 'チーム編成ルール',
      user: '山田 太郎',
      userLevel: 99,
      action: '推奨チームサイズを7名から5名に変更',
      impact: '今後のプロジェクト編成に影響',
      status: 'active' as const
    },
    {
      id: 3,
      date: '2025-10-11 10:20',
      mode: 'agenda' as const,
      category: '投票グループ管理',
      user: '山田 太郎',
      userLevel: 99,
      action: '「小規模事務部門グループ」を新規作成（総務科、経理科、人事科）',
      impact: '22名が新グループに統合',
      status: 'active' as const
    },
    {
      id: 4,
      date: '2025-10-10 09:45',
      mode: 'agenda' as const,
      category: '主承認者設定',
      user: '山田 太郎',
      userLevel: 99,
      action: 'リハ専門職グループのローテーション期間を月次から四半期に変更',
      impact: '3名の承認者に影響',
      status: 'active' as const
    },
    {
      id: 5,
      date: '2025-10-09 15:30',
      mode: 'project' as const,
      category: 'プロジェクト化閾値',
      user: '山田 太郎',
      userLevel: 99,
      action: '施設プロジェクト化の閾値を500点から400点に引き下げ',
      impact: 'プロジェクト化しやすくなる',
      status: 'active' as const
    },
    {
      id: 6,
      date: '2025-10-08 11:20',
      mode: 'project' as const,
      category: '進捗管理設定',
      user: '山田 太郎',
      userLevel: 99,
      action: '週次進捗レポートを有効化',
      impact: 'すべてのプロジェクトリーダーに通知',
      status: 'active' as const
    }
  ];

  const filteredHistory = historyItems.filter(item => {
    if (filterMode === 'all') return true;
    return item.mode === filterMode;
  });

  const getModeLabel = (mode: 'agenda' | 'project') => {
    return mode === 'agenda' ? '議題モード' : 'プロジェクトモード';
  };

  const getModeBadgeColor = (mode: 'agenda' | 'project') => {
    return mode === 'agenda'
      ? 'bg-green-600/20 border-green-500/30 text-green-400'
      : 'bg-purple-600/20 border-purple-500/30 text-purple-400';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span className="text-2xl">📜</span>
              <span>投票設定変更履歴</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              投票設定の変更履歴を時系列で確認できます
            </p>
          </div>

          {/* フィルター */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">表示モード:</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as 'all' | 'agenda' | 'project')}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm"
            >
              <option value="all">すべて</option>
              <option value="agenda">議題モードのみ</option>
              <option value="project">プロジェクトモードのみ</option>
            </select>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">総変更回数</div>
          <div className="text-2xl font-bold text-white">{historyItems.length}回</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">議題モード変更</div>
          <div className="text-2xl font-bold text-green-400">
            {historyItems.filter(item => item.mode === 'agenda').length}回
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">プロジェクトモード変更</div>
          <div className="text-2xl font-bold text-purple-400">
            {historyItems.filter(item => item.mode === 'project').length}回
          </div>
        </div>
      </div>

      {/* 変更履歴タイムライン */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">変更履歴</h3>

        <div className="space-y-4">
          {filteredHistory.map((item, index) => (
            <div
              key={item.id}
              className="relative bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 hover:border-slate-600/50 transition-colors"
            >
              {/* タイムライン線 */}
              {index !== filteredHistory.length - 1 && (
                <div className="absolute left-[2.4rem] top-[3.5rem] bottom-[-1rem] w-[2px] bg-slate-700/50" />
              )}

              <div className="flex items-start space-x-4">
                {/* タイムラインドット */}
                <div className="relative flex-shrink-0 w-10 h-10 bg-blue-600/20 border-2 border-blue-500/50 rounded-full flex items-center justify-center">
                  <span className="text-lg">📝</span>
                </div>

                {/* 変更内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getModeBadgeColor(item.mode)}`}>
                      {getModeLabel(item.mode)}
                    </span>
                    <span className="px-3 py-1 bg-slate-700/50 border border-slate-600/30 rounded-full text-xs text-slate-300">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500">{item.date}</span>
                  </div>

                  <div className="text-sm text-white font-medium mb-2">
                    {item.action}
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">変更者:</span>
                      <span className="text-slate-300">{item.user}</span>
                      <span className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded text-blue-400">
                        Lv.{item.userLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">影響範囲:</span>
                      <span className="text-slate-300">{item.impact}</span>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="mt-3 flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded text-xs text-slate-300 transition-colors">
                      詳細を表示
                    </button>
                    <button className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded text-xs text-yellow-400 transition-colors">
                      この設定を確認
                    </button>
                    {/* ロールバック機能は将来実装
                    <button className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-xs text-red-400 transition-colors">
                      この時点に戻す
                    </button>
                    */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 履歴が空の場合 */}
        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <div className="text-slate-400">
              {filterMode === 'all'
                ? '変更履歴がありません'
                : `${getModeLabel(filterMode as 'agenda' | 'project')}の変更履歴がありません`
              }
            </div>
          </div>
        )}
      </div>

      {/* ページネーション（将来実装） */}
      <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="text-sm text-slate-400">
          全{filteredHistory.length}件を表示中
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded text-sm text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            前へ
          </button>
          <span className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded text-sm text-blue-400">
            1
          </span>
          <button className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded text-sm text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            次へ
          </button>
        </div>
      </div>

      {/* エクスポート機能 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            変更履歴をエクスポートして監査証跡として保存できます
          </div>
          <button className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors">
            CSV形式でエクスポート
          </button>
        </div>
      </div>
    </div>
  );
};
