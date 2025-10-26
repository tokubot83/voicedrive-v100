import React, { useState, useEffect } from 'react';
import {
  AppealStatus,
  APPEAL_STATUS_CONFIG
} from '../../types/appeal';
import {
  V3AppealRecord,
  V3GradeUtils
} from '../../types/appeal-v3';
import { appealServiceV3 } from '../../services/appealServiceV3';
import { toast } from 'react-toastify';

interface AppealStatusListV3Props {
  employeeId?: string;
  refreshTrigger?: number;
}

const AppealStatusListV3: React.FC<AppealStatusListV3Props> = ({
  employeeId,
  refreshTrigger
}) => {
  const [appeals, setAppeals] = useState<V3AppealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<V3AppealRecord | null>(null);

  useEffect(() => {
    loadV3Appeals();
  }, [employeeId, refreshTrigger]);

  const loadV3Appeals = async () => {
    try {
      setLoading(true);

      // 実APIから異議申し立て一覧を取得
      const appeals = await appealServiceV3.getV3Appeals(employeeId);
      setAppeals(appeals);

    } catch (error) {
      console.error('V3異議申し立て一覧の取得に失敗:', error);
      toast.error('V3異議申し立て一覧の取得に失敗しました');

      // エラー時は空配列を設定
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppealClick = async (appeal: V3AppealRecord) => {
    try {
      // V3ステータス詳細を取得
      const statusData = await appealServiceV3.getV3AppealStatus(appeal.appealId);

      if (statusData) {
        setSelectedAppeal({
          ...appeal,
          assignedReviewer: statusData.assignedReviewer
        });
      } else {
        setSelectedAppeal(appeal);
      }
    } catch (error) {
      console.error('V3ステータス詳細の取得に失敗:', error);
      setSelectedAppeal(appeal);
    }
  };

  const renderGradeBadge = (grade: string, score: number) => (
    <div className="flex items-center space-x-2">
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
        style={{ backgroundColor: V3GradeUtils.getGradeColor(grade) }}
      >
        {grade}
      </div>
      <span className="text-sm font-medium">{score}点</span>
    </div>
  );

  const renderPriorityBadge = (priority: string) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
      priority === 'high' ? 'bg-red-100 text-red-800' :
      priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
      'bg-green-100 text-green-800'
    }`}>
      {priority.toUpperCase()}
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">異議申し立てを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          異議申し立て状況
        </h2>
        <button
          onClick={loadV3Appeals}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          更新
        </button>
      </div>

      {appeals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          異議申し立ては見つかりませんでした
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申し立てID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    職員情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    スコア・グレード
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    優先度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申し立て日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appeals.map((appeal) => {
                  const statusConfig = APPEAL_STATUS_CONFIG[appeal.status];
                  return (
                    <tr key={appeal.appealId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                        {appeal.appealId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appeal.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appeal.employeeId}
                          </div>
                          <div className="text-xs text-gray-400">
                            {appeal.evaluationPeriod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appeal.details && (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">現在:</span>
                              {renderGradeBadge(appeal.details.originalGrade, appeal.details.originalScore)}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">希望:</span>
                              {renderGradeBadge(appeal.details.requestedGrade, appeal.details.requestedScore)}
                            </div>
                            <div className="text-xs text-gray-400">
                              スコア差: {appeal.details.scoreDifference}点
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderPriorityBadge(appeal.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(appeal.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleAppealClick(appeal)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* V3詳細モーダル */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  異議申し立て詳細
                </h3>
                <button
                  onClick={() => setSelectedAppeal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">申し立てID</label>
                    <p className="text-sm font-mono">{selectedAppeal.appealId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">職員</label>
                    <p className="text-sm">{selectedAppeal.employeeName} ({selectedAppeal.employeeId})</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">評価期間</label>
                  <p className="text-sm">{selectedAppeal.evaluationPeriod}</p>
                </div>

                {selectedAppeal.details && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">スコア・グレード情報</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">現在の評価</label>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderGradeBadge(selectedAppeal.details.originalGrade, selectedAppeal.details.originalScore)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">希望する評価</label>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderGradeBadge(selectedAppeal.details.requestedGrade, selectedAppeal.details.requestedScore)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>スコア差: <span className="font-semibold">{selectedAppeal.details.scoreDifference}点</span></p>
                      <p>評価システム: <span className="font-semibold">{selectedAppeal.details.evaluationSystem}</span></p>
                      <p>グレードシステム: <span className="font-semibold">{selectedAppeal.details.gradingSystem}</span></p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ステータス</label>
                    <div className="mt-1">
                      {(() => {
                        const statusConfig = APPEAL_STATUS_CONFIG[selectedAppeal.status];
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">優先度</label>
                    <div className="mt-1">
                      {renderPriorityBadge(selectedAppeal.priority)}
                    </div>
                  </div>
                </div>

                {selectedAppeal.assignedReviewer && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">担当審査者</label>
                    <p className="text-sm">
                      {selectedAppeal.assignedReviewer.name} ({selectedAppeal.assignedReviewer.role})
                    </p>
                  </div>
                )}

                {selectedAppeal.expectedResponseDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">予定回答日</label>
                    <p className="text-sm">
                      {new Date(selectedAppeal.expectedResponseDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedAppeal(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealStatusListV3;