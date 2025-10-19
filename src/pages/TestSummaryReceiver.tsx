/**
 * 面談サマリ受信テストページ
 * 医療システムからのサマリ受信をシミュレート
 */

import React, { useState } from 'react';
import { InterviewSummaryService } from '../services/InterviewSummaryService';
import { mockInterviewSummaries, initializeMockSummaries, resetMockSummaries } from '../utils/mockInterviewSummaries';
import { InterviewSummary } from '../types/interviewSummary';

const TestSummaryReceiver: React.FC = () => {
  const [summaries, setSummaries] = useState<InterviewSummary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<InterviewSummary | null>(null);
  const summaryService = InterviewSummaryService.getInstance();

  const handleLoadSummaries = () => {
    const loaded = summaryService.getSummariesByStaffId('EMP001');
    setSummaries(loaded);
  };

  const handleInitializeMock = () => {
    initializeMockSummaries();
    handleLoadSummaries();
    alert('モックデータを初期化しました');
  };

  const handleResetMock = () => {
    resetMockSummaries();
    handleLoadSummaries();
    alert('モックデータをリセットしました');
  };

  const handleClearAll = () => {
    summaryService.clearAllSummaries();
    setSummaries([]);
    setSelectedSummary(null);
    alert('全サマリを削除しました');
  };

  const handleSimulateSend = async (summary: InterviewSummary) => {
    try {
      // 受信APIをシミュレート
      const response = await fetch('/api/summaries/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summary)
      });

      const result = await response.json();

      if (result.success) {
        alert(`サマリ受信成功！\n受信時刻: ${result.receivedAt}`);
        handleLoadSummaries();
      } else {
        alert(`エラー: ${result.error}`);
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('送信エラーが発生しました');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      regular: '定期面談',
      support: 'サポート面談',
      special: '特別面談'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      regular: 'bg-blue-500',
      support: 'bg-green-500',
      special: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const statistics = summaryService.getStatistics('EMP001');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📋 面談サマリ受信テストページ
          </h1>
          <p className="text-gray-400">
            医療システムからの面談サマリ受信機能のテスト
          </p>
        </div>

        {/* コントロールパネル */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">コントロール</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleInitializeMock}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              モックデータ初期化
            </button>
            <button
              onClick={handleResetMock}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              モックデータリセット
            </button>
            <button
              onClick={handleLoadSummaries}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              サマリ読み込み
            </button>
            <button
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              全削除
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">統計情報</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">総数</p>
              <p className="text-2xl font-bold text-white">{statistics.total}</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
              <p className="text-blue-400 text-sm">定期面談</p>
              <p className="text-2xl font-bold text-white">{statistics.regular}</p>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4">
              <p className="text-green-400 text-sm">サポート</p>
              <p className="text-2xl font-bold text-white">{statistics.support}</p>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-4">
              <p className="text-orange-400 text-sm">特別面談</p>
              <p className="text-2xl font-bold text-white">{statistics.special}</p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4">
              <p className="text-purple-400 text-sm">今年</p>
              <p className="text-2xl font-bold text-white">{statistics.thisYear}</p>
            </div>
          </div>
        </div>

        {/* サンプルデータ送信 */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">サンプルデータ送信テスト</h2>
          <div className="space-y-3">
            {mockInterviewSummaries.map((summary) => (
              <div
                key={summary.summaryId}
                className="bg-slate-700 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${getTypeBadgeColor(summary.interviewType)} text-white text-xs px-2 py-1 rounded-full`}>
                      {getTypeLabel(summary.interviewType)}
                    </span>
                    <span className="text-white font-medium">{summary.interviewDate}</span>
                  </div>
                  <p className="text-gray-400 text-sm">作成者: {summary.createdBy}</p>
                </div>
                <button
                  onClick={() => handleSimulateSend(summary)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  送信シミュレート
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 保存済みサマリ一覧 */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">保存済みサマリ一覧</h2>
          {summaries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              サマリがありません。「モックデータ初期化」または「サマリ読み込み」をクリックしてください。
            </p>
          ) : (
            <div className="space-y-3">
              {summaries.map((summary) => (
                <div
                  key={summary.summaryId}
                  className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => setSelectedSummary(summary)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`${getTypeBadgeColor(summary.interviewType)} text-white text-xs px-2 py-1 rounded-full`}>
                        {getTypeLabel(summary.interviewType)}
                      </span>
                      <span className="text-white font-medium">{summary.interviewDate}</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(summary.createdAt).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">作成者: {summary.createdBy}</p>
                  <p className="text-gray-500 text-xs mt-1">ID: {summary.summaryId}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* サマリ詳細モーダル */}
        {selectedSummary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${getTypeBadgeColor(selectedSummary.interviewType)} text-white text-xs px-2 py-1 rounded-full`}>
                        {getTypeLabel(selectedSummary.interviewType)}
                      </span>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedSummary.interviewDate} の面談サマリ
                      </h2>
                    </div>
                    <p className="text-gray-400">作成者: {selectedSummary.createdBy}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSummary(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">面談実施日</p>
                      <p className="text-white">{selectedSummary.interviewDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">サマリ作成日時</p>
                      <p className="text-white">
                        {new Date(selectedSummary.createdAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">送信日時</p>
                      <p className="text-white">
                        {new Date(selectedSummary.sentAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">ステータス</p>
                      <p className="text-white">{selectedSummary.status}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">サマリ内容</h3>
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {selectedSummary.summary}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSummaryReceiver;
