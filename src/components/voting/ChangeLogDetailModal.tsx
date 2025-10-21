import React, { useEffect, useState } from 'react';
import { X, Calendar, User, Target, FileText, GitCompare } from 'lucide-react';
import { fetchChangeLogDetail } from '../../services/votingHistoryService';
import type { ChangeLogDetail } from '../../types/votingHistory';
import { ValueComparisonView } from './ValueComparisonView';

interface ChangeLogDetailModalProps {
  logId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 変更履歴詳細モーダル
 *
 * - 変更内容の詳細表示
 * - 変更前後の値の比較表示
 * - メタデータの表示
 */
export const ChangeLogDetailModal: React.FC<ChangeLogDetailModalProps> = ({
  logId,
  isOpen,
  onClose,
}) => {
  const [detail, setDetail] = useState<ChangeLogDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isOpen && logId) {
      loadDetail();
    }
  }, [isOpen, logId]);

  const loadDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChangeLogDetail(logId);
      setDetail(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      agenda: '議題モード',
      project: 'プロジェクトモード',
      both: '両モード共通',
    };
    return labels[mode] || mode;
  };

  const getModeBadgeColor = (mode: string) => {
    const colors: Record<string, string> = {
      agenda: 'bg-green-600/20 border-green-500/30 text-green-400',
      project: 'bg-purple-600/20 border-purple-500/30 text-purple-400',
      both: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
    };
    return colors[mode] || colors.both;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '有効',
      reverted: '取り消し済み',
      superseded: '無効化済み',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-600/20 border-green-500/30 text-green-400',
      reverted: 'bg-red-600/20 border-red-500/30 text-red-400',
      superseded: 'bg-slate-600/20 border-slate-500/30 text-slate-400',
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>変更履歴詳細</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-slate-400">読み込み中...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-red-400">エラーが発生しました: {error.message}</div>
            </div>
          )}

          {!loading && !error && detail && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5">
                <h3 className="text-sm font-bold text-slate-400 mb-4">基本情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">変更日時</div>
                    <div className="flex items-center space-x-2 text-white">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{detail.date}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">モード</div>
                    <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getModeBadgeColor(detail.mode)}`}>
                      {getModeLabel(detail.mode)}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">カテゴリー</div>
                    <span className="px-3 py-1 bg-slate-700/50 border border-slate-600/30 rounded-full text-xs text-slate-300">
                      {detail.category}
                    </span>
                  </div>
                  {detail.subcategory && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">サブカテゴリー</div>
                      <span className="px-3 py-1 bg-slate-700/50 border border-slate-600/30 rounded-full text-xs text-slate-300">
                        {detail.subcategory}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-500 mb-1">ステータス</div>
                    <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(detail.status)}`}>
                      {getStatusLabel(detail.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 変更内容 */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5">
                <h3 className="text-sm font-bold text-slate-400 mb-3">変更内容</h3>
                <p className="text-white leading-relaxed">{detail.changeDescription}</p>
                {detail.impactDescription && (
                  <div className="mt-3 flex items-start space-x-2">
                    <Target className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500 mb-1">影響範囲</div>
                      <p className="text-yellow-400 text-sm">{detail.impactDescription}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 変更者情報 */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5">
                <h3 className="text-sm font-bold text-slate-400 mb-3">変更者情報</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{detail.user}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded text-blue-400 text-xs">
                    Lv.{detail.userLevel}
                  </span>
                </div>
              </div>

              {/* 変更前後の値 */}
              {(detail.beforeValue || detail.afterValue) && (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center space-x-2">
                    <GitCompare className="w-4 h-4" />
                    <span>変更前後の比較</span>
                  </h3>
                  <ValueComparisonView
                    beforeValue={detail.beforeValue}
                    afterValue={detail.afterValue}
                    category={detail.category}
                  />
                </div>
              )}

              {/* 取り消し情報 */}
              {detail.status === 'reverted' && detail.revertedAt && (
                <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-red-400 mb-3">取り消し情報</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">取り消し日時:</span>
                      <span className="text-white">{detail.revertedAt}</span>
                    </div>
                    {detail.revertedBy && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">取り消し者:</span>
                        <span className="text-white">{detail.revertedBy}</span>
                      </div>
                    )}
                    {detail.revertReason && (
                      <div>
                        <span className="text-slate-400">取り消し理由:</span>
                        <p className="text-white mt-1">{detail.revertReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* メタデータ */}
              {detail.metadata && Object.keys(detail.metadata).length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-slate-400 mb-3">追加情報</h3>
                  <pre className="text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(detail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
