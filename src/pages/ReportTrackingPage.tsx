import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TrackingResult {
  anonymousId: string;
  status: string;
  statusMessage: string;
  progress: number;
  submittedAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
  category?: string;
  severity?: string;
}

const ReportTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [anonymousId, setAnonymousId] = useState('');
  const [tracking, setTracking] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anonymousId.trim()) {
      setError('追跡IDを入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTracking(null);

      const response = await fetch(`/api/whistleblowing/track/${encodeURIComponent(anonymousId.trim())}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('指定された追跡IDに該当する相談が見つかりませんでした');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || '追跡情報の取得に失敗しました');
      }

      const data = await response.json();
      setTracking(data);
    } catch (err) {
      console.error('追跡エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return '📥';
      case 'triaging': return '🔍';
      case 'investigating': return '🕵️';
      case 'escalated': return '⬆️';
      case 'resolved': return '✅';
      case 'closed': return '📁';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'low': return '軽微';
      case 'medium': return '中程度';
      case 'high': return '重要';
      case 'critical': return '緊急';
      default: return '不明';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'harassment': return 'ハラスメント';
      case 'safety': return '安全管理';
      case 'financial': return '財務・会計';
      case 'compliance': return 'コンプライアンス';
      case 'discrimination': return '差別・不公正';
      case 'other': return 'その他';
      default: return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/whistleblowing')}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← コンプライアンス窓口に戻る
            </button>
            <h1 className="text-2xl font-bold text-white mb-2">📋 通報追跡</h1>
            <p className="text-gray-400 text-sm">
              匿名IDを使用して相談の進捗状況を確認できます
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur border border-gray-700/50 mb-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  追跡ID
                </label>
                <input
                  type="text"
                  value={anonymousId}
                  onChange={(e) => setAnonymousId(e.target.value)}
                  placeholder="例: ANON-2025-A1B2C3"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <p className="text-gray-500 text-xs mt-1">
                  相談提出時に発行された追跡IDを入力してください
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                {loading ? '検索中...' : '進捗を確認'}
              </button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="text-red-300 font-bold mb-1">エラー</h3>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Result */}
          {tracking && (
            <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur border border-gray-700/50 space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getStatusIcon(tracking.status)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{tracking.statusMessage}</h2>
                    <p className="text-gray-400 text-sm">追跡ID: {tracking.anonymousId}</p>
                  </div>
                </div>
                {tracking.severity && (
                  <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(tracking.severity)}`}>
                    {getSeverityLabel(tracking.severity)}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm font-medium">処理進捗</span>
                  <span className="text-white font-bold">{tracking.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-500"
                    style={{ width: `${tracking.progress}%` }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tracking.category && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="block text-gray-400 text-xs mb-1">カテゴリ</label>
                    <p className="text-white">{getCategoryLabel(tracking.category)}</p>
                  </div>
                )}

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <label className="block text-gray-400 text-xs mb-1">提出日時</label>
                  <p className="text-white">
                    {new Date(tracking.submittedAt).toLocaleString('ja-JP')}
                  </p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <label className="block text-gray-400 text-xs mb-1">最終更新</label>
                  <p className="text-white">
                    {new Date(tracking.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </div>

                {tracking.estimatedCompletion && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="block text-gray-400 text-xs mb-1">完了予定</label>
                    <p className="text-white">
                      {new Date(tracking.estimatedCompletion).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                )}
              </div>

              {/* Information Box */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                  <span>ℹ️</span>
                  重要なお知らせ
                </h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• 相談内容は適切な担当者により慎重に検討されています</li>
                  <li>• 進捗状況はこのページで随時確認できます</li>
                  <li>• 追加情報が必要な場合は、別途ご連絡する場合があります</li>
                  <li>• 追跡IDは大切に保管してください</li>
                </ul>
              </div>
            </div>
          )}

          {/* Help Section */}
          {!tracking && !error && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>💡</span>
                追跡IDについて
              </h3>
              <div className="text-gray-300 text-sm space-y-2">
                <p>
                  追跡IDは相談を提出した際に発行される固有の識別子です。
                  形式は「ANON-YYYY-XXXXXX」となっています。
                </p>
                <p>
                  このIDを使用することで、匿名性を保ちながら相談の進捗状況を
                  確認することができます。
                </p>
                <p className="text-yellow-400">
                  ⚠️ 追跡IDを紛失した場合、進捗確認ができなくなりますので
                  大切に保管してください。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportTrackingPage;
