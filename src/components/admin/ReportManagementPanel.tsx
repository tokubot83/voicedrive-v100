// Report Management Panel
// 通報管理画面（管理者用）
// 注意: 開発環境向け暫定実装

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Report {
  id: string;
  postId: string;
  reporterId: string;
  reporterName?: string;
  reportType: string;
  description?: string;
  status: 'pending' | 'reviewing' | 'actioned' | 'dismissed';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  actionTaken?: string;
  alert?: {
    severity: string;
    reportCount: number;
  };
}

interface ReportManagementPanelProps {
  currentUserId: string;
  userLevel: number;
}

const ReportManagementPanel: React.FC<ReportManagementPanelProps> = ({
  currentUserId,
  userLevel
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 権限チェック（Level 14以上のみアクセス可能）
  const hasAccess = userLevel >= 14;

  const reportTypeLabels: Record<string, { label: string; icon: string }> = {
    personal_attack: { label: '個人攻撃', icon: '💥' },
    defamation: { label: '誹謗中傷', icon: '🗣️' },
    harassment: { label: 'ハラスメント', icon: '⚠️' },
    privacy_violation: { label: 'プライバシー侵害', icon: '🔒' },
    inappropriate_content: { label: '不適切なコンテンツ', icon: '🚫' },
    spam: { label: 'スパム', icon: '📧' },
    other: { label: 'その他', icon: '❓' }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: '確認待ち', color: 'bg-yellow-500' },
    reviewing: { label: '確認中', color: 'bg-blue-500' },
    actioned: { label: '対応済み', color: 'bg-green-500' },
    dismissed: { label: '却下', color: 'bg-gray-500' }
  };

  // 通報一覧取得
  useEffect(() => {
    if (!hasAccess) return;

    fetchReports();
  }, [page, selectedStatus, selectedType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedType !== 'all') params.append('reportType', selectedType);

      const response = await fetch(`/api/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.data.reports);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('通報一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 通報対応処理
  const handleReportAction = async (reportId: string, action: 'actioned' | 'dismissed', notes?: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          reviewerId: currentUserId,
          status: action,
          actionTaken: action === 'actioned' ? '投稿削除・警告送信' : '問題なしと判断',
          reviewNotes: notes
        })
      });

      if (response.ok) {
        alert(`通報を${action === 'actioned' ? '対応済み' : '却下'}にしました`);
        fetchReports();
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('通報対応エラー:', error);
      alert('処理中にエラーが発生しました');
    }
  };

  if (!hasAccess) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <span className="text-4xl">🚫</span>
        <h2 className="text-xl font-bold text-red-700 mt-4">アクセス権限がありません</h2>
        <p className="text-red-600 mt-2">この機能はレベル14以上の管理者のみ利用可能です</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>🚨</span> 通報管理
        </h1>
        <p className="text-gray-600 mt-2">投稿に対する通報を確認・対応します</p>
      </div>

      {/* フィルター */}
      <div className="border-b border-gray-200 p-4 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">ステータス:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border-gray-300 text-sm"
          >
            <option value="all">すべて</option>
            <option value="pending">確認待ち</option>
            <option value="reviewing">確認中</option>
            <option value="actioned">対応済み</option>
            <option value="dismissed">却下</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">通報理由:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border-gray-300 text-sm"
          >
            <option value="all">すべて</option>
            {Object.entries(reportTypeLabels).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchReports}
          className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span>🔄</span> 更新
        </button>
      </div>

      {/* 通報一覧 */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-gray-600 mt-4">読み込み中...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-gray-600 mt-4">通報がありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  重要度
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  通報理由
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  通報日時
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    {report.alert && (
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${report.alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          report.alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          report.alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {report.alert.reportCount}件
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{reportTypeLabels[report.reportType]?.icon}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {reportTypeLabels[report.reportType]?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {report.postId.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(report.createdAt), 'MM/dd HH:mm', { locale: ja })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full text-white
                      ${statusLabels[report.status].color}
                    `}>
                      {statusLabels[report.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      詳細確認
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            前へ
          </button>
          <span className="text-sm text-gray-700">
            {page} / {totalPages} ページ
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center justify-between">
                <span>通報詳細</span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">通報ID</label>
                <p className="text-gray-900">{selectedReport.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">投稿ID</label>
                <p className="text-gray-900">{selectedReport.postId}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">通報理由</label>
                <p className="text-gray-900">
                  {reportTypeLabels[selectedReport.reportType]?.icon} {' '}
                  {reportTypeLabels[selectedReport.reportType]?.label}
                </p>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">詳細説明</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {selectedReport.status === 'pending' && (
                <div className="border-t pt-4 space-y-3">
                  <label className="text-sm font-medium text-gray-500">対応アクション</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'actioned')}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <span>⚠️</span> 対応する
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'dismissed')}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <span>✓</span> 却下する
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagementPanel;