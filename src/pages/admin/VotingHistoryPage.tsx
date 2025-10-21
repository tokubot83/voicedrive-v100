import React, { useState } from 'react';
import { useVotingHistory } from '../../hooks/useVotingHistory';
import { exportChangeLogs } from '../../services/votingHistoryService';
import { Download } from 'lucide-react';

/**
 * 投票設定変更履歴ページ
 * - 設定変更の履歴を時系列で表示
 * - 変更内容の詳細確認
 * - ロールバック機能（将来実装）
 */
export const VotingHistoryPage: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'all' | 'agenda' | 'project'>('all');
  const [page, setPage] = useState(1);

  // APIからデータ取得
  const { logs, statistics, pagination, loading, error } = useVotingHistory({
    mode: filterMode,
    page,
    limit: 50,
  });

  // CSVエクスポート
  const handleExport = async () => {
    try {
      await exportChangeLogs({ mode: filterMode });
    } catch (err) {
      console.error('Export failed:', err);
      alert('エクスポートに失敗しました');
    }
  };

  // 表示用データ（APIデータを使用）
  const displayLogs = logs;

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
          <div className="text-2xl font-bold text-white">
            {statistics?.totalCount || 0}回
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">議題モード変更</div>
          <div className="text-2xl font-bold text-green-400">
            {statistics?.agendaModeCount || 0}回
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">プロジェクトモード変更</div>
          <div className="text-2xl font-bold text-purple-400">
            {statistics?.projectModeCount || 0}回
          </div>
        </div>
      </div>

      {/* 変更履歴タイムライン */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">変更履歴</h3>

        {/* ローディング状態 */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-slate-400">読み込み中...</div>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-red-400">エラーが発生しました: {error.message}</div>
          </div>
        )}

        {/* データ表示 */}
        {!loading && !error && (
          <div className="space-y-4">
            {displayLogs.map((item, index) => (
            <div
              key={item.id}
              className="relative bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 hover:border-slate-600/50 transition-colors"
            >
              {/* タイムライン線 */}
              {index !== displayLogs.length - 1 && (
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

          {/* 履歴が空の場合 */}
          {displayLogs.length === 0 && (
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
        )}
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="text-sm text-slate-400">
          全{statistics?.totalCount || 0}件中 {displayLogs.length}件を表示中
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination?.hasPrevious}
            className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded text-sm text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          <span className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded text-sm text-blue-400">
            {pagination?.page || 1}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination?.hasNext}
            className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded text-sm text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV形式でエクスポート
          </button>
        </div>
      </div>
    </div>
  );
};
