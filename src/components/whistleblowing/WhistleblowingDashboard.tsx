import React, { useState } from 'react';
import { WhistleblowingReport, ReportStatus, ReportSeverity } from '../../types/whistleblowing';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { demoWhistleblowingReports, demoReportStatistics, getWhistleblowingPermissions } from '../../data/demo/whistleblowing';

interface WhistleblowingDashboardProps {
  onNewReport: () => void;
}

const WhistleblowingDashboard: React.FC<WhistleblowingDashboardProps> = ({ onNewReport }) => {
  const { userLevel } = usePermissions();
  const permissions = getWhistleblowingPermissions(userLevel);
  const [selectedReport, setSelectedReport] = useState<WhistleblowingReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');

  // 権限に応じて表示可能な通報をフィルタリング
  const getVisibleReports = () => {
    return demoWhistleblowingReports.filter(report => {
      if (!permissions.canView) return false;
      
      // 重要度による制限
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const maxLevel = severityLevels[permissions.maxSeverityLevel];
      const reportLevel = severityLevels[report.severity];
      
      return reportLevel <= maxLevel;
    }).filter(report => {
      if (filterStatus === 'all') return true;
      return report.status === filterStatus;
    });
  };

  const visibleReports = getVisibleReports();

  const getStatusIcon = (status: ReportStatus) => {
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

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'received': return '受付完了';
      case 'triaging': return '分類中';
      case 'investigating': return '調査中';
      case 'escalated': return 'エスカレーション';
      case 'resolved': return '対応完了';
      case 'closed': return '終了';
      default: return '不明';
    }
  };

  const getSeverityColor = (severity: ReportSeverity) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSeverityLabel = (severity: ReportSeverity) => {
    switch (severity) {
      case 'low': return '軽微';
      case 'medium': return '中程度';
      case 'high': return '重要';
      case 'critical': return '緊急';
      default: return '不明';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'harassment': return '⚠️';
      case 'safety': return '🛡️';
      case 'financial': return '💰';
      case 'compliance': return '📋';
      case 'discrimination': return '⚖️';
      case 'other': return '📝';
      default: return '📋';
    }
  };

  const getCategoryLabel = (category: string) => {
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

  // 権限がない場合の表示
  if (!permissions.canView && !permissions.canViewStatistics) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold text-white mb-4">公益通報システム</h2>
          <p className="text-gray-300 mb-6">
            重要な問題を安全に報告するためのシステムです。<br />
            あなたの通報は専門チームが適切に処理し、匿名性を最高レベルで保護します。
          </p>
          <button
            onClick={onNewReport}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-lg"
          >
            新しい通報を作成
          </button>
          <div className="mt-8 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
            <h3 className="text-blue-300 font-bold mb-2">📞 緊急時の連絡先</h3>
            <p className="text-blue-200 text-sm">
              生命に関わる緊急事態の場合は、このシステムと併せて<br />
              直接関係部署または外部機関にもご連絡ください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-2xl p-6 backdrop-blur border border-red-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-4xl">🚨</span>
              公益通報管理システム
            </h1>
            <p className="text-gray-300">レベル{userLevel}管理者画面</p>
          </div>
          <button
            onClick={onNewReport}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            新しい通報
          </button>
        </div>
      </div>

      {/* 統計概要（権限がある場合のみ） */}
      {permissions.canViewStatistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">総通報数</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white">{demoReportStatistics.totalReports}</div>
            <div className="text-sm text-blue-400 mt-1">今月: 6件</div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">調査中</span>
              <span className="text-2xl">🕵️</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">{demoReportStatistics.byStatus.investigating}</div>
            <div className="text-sm text-gray-400 mt-1">要対応</div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">解決済み</span>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{demoReportStatistics.byStatus.resolved}</div>
            <div className="text-sm text-gray-400 mt-1">今月: 2件</div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">平均解決日数</span>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-3xl font-bold text-white">{demoReportStatistics.averageResolutionDays}</div>
            <div className="text-sm text-gray-400 mt-1">日</div>
          </div>
        </div>
      )}

      {/* 通報一覧（閲覧権限がある場合のみ） */}
      {permissions.canView && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">通報一覧</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'all')}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">すべて</option>
              <option value="received">受付完了</option>
              <option value="triaging">分類中</option>
              <option value="investigating">調査中</option>
              <option value="escalated">エスカレーション</option>
              <option value="resolved">対応完了</option>
              <option value="closed">終了</option>
            </select>
          </div>

          <div className="space-y-4">
            {visibleReports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-700/30 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getCategoryIcon(report.category)}</span>
                      <span className="text-white font-medium">{report.title}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(report.severity)}`}>
                        {getSeverityLabel(report.severity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{getCategoryLabel(report.category)}</span>
                      <span>•</span>
                      <span>{report.submittedAt.toLocaleDateString('ja-JP')}</span>
                      <span>•</span>
                      <span>ID: {report.anonymousId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(report.status)}</span>
                    <span className="text-gray-300 text-sm">{getStatusLabel(report.status)}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {report.content.substring(0, 150)}...
                </p>
              </div>
            ))}
          </div>

          {visibleReports.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-400">該当する通報はありません。</p>
            </div>
          )}
        </div>
      )}

      {/* 通報詳細モーダル */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">通報詳細</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">カテゴリ</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(selectedReport.category)}</span>
                    <span className="text-white">{getCategoryLabel(selectedReport.category)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">重要度</label>
                  <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(selectedReport.severity)}`}>
                    {getSeverityLabel(selectedReport.severity)}
                  </span>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">ステータス</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(selectedReport.status)}</span>
                    <span className="text-white">{getStatusLabel(selectedReport.status)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">通報日時</label>
                  <span className="text-white">{selectedReport.submittedAt.toLocaleString('ja-JP')}</span>
                </div>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">件名</label>
                <p className="text-white text-lg">{selectedReport.title}</p>
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">詳細内容</label>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-white whitespace-pre-wrap">{selectedReport.content}</p>
                </div>
              </div>

              {/* 調査ノート（権限がある場合のみ） */}
              {permissions.canAccessConfidentialNotes && selectedReport.internalNotes && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">調査ノート（機密）</label>
                  <div className="space-y-3">
                    {selectedReport.internalNotes.map((note) => (
                      <div key={note.id} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-300 font-medium">{note.authorName}</span>
                          <span className="text-gray-400 text-sm">({note.authorRole})</span>
                          <span className="text-gray-500 text-sm ml-auto">
                            {note.createdAt.toLocaleString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-blue-100">{note.content}</p>
                        {note.actionItems && note.actionItems.length > 0 && (
                          <div className="mt-3">
                            <p className="text-blue-300 text-sm font-medium mb-1">アクション項目:</p>
                            <ul className="list-disc list-inside text-blue-200 text-sm space-y-1">
                              {note.actionItems.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* エスカレーション理由 */}
              {selectedReport.escalationReason && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">エスカレーション理由</label>
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-orange-100">{selectedReport.escalationReason}</p>
                  </div>
                </div>
              )}

              {/* 解決要約 */}
              {selectedReport.resolutionSummary && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">解決要約</label>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-100">{selectedReport.resolutionSummary}</p>
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

export default WhistleblowingDashboard;