/**
 * MyRequestsPage.tsx
 * 申請状況確認画面
 *
 * 自分のコース変更申請履歴と審査結果を表示
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CareerCourseChangeRequest, ApprovalStatus } from '../../types/career-course';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS_INFO: Record<ApprovalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: '承認待ち',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: <Clock className="w-4 h-4" />
  },
  approved: {
    label: '承認済み',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: <CheckCircle className="w-4 h-4" />
  },
  rejected: {
    label: '却下',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: <XCircle className="w-4 h-4" />
  },
  withdrawn: {
    label: '取下げ',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: <AlertCircle className="w-4 h-4" />
  }
};

const MOCK_REQUESTS: CareerCourseChangeRequest[] = [
  {
    id: 'req-003',
    staffId: 'OH-NS-2021-001',
    currentCourseCode: 'B',
    requestedCourseCode: 'A',
    changeReason: 'annual',
    reasonDetail: '管理職候補として、施設間異動を含む全面協力型コースへの変更を希望します。',
    requestedEffectiveDate: '2026-04-01',
    hrReviewerId: null,
    hrReviewerName: null,
    reviewedAt: null,
    reviewComment: null,
    approvalStatus: 'pending',
    rejectionReason: null,
    withdrawnAt: null,
    attachments: [],
    createdAt: '2025-09-25T10:30:00Z',
    updatedAt: '2025-09-25T10:30:00Z'
  },
  {
    id: 'req-002',
    staffId: 'OH-NS-2021-001',
    currentCourseCode: 'C',
    requestedCourseCode: 'B',
    changeReason: 'annual',
    reasonDetail: '部署異動に対応可能となったため、Bコースへの変更を希望します。',
    requestedEffectiveDate: '2025-04-01',
    hrReviewerId: 'HR-001',
    hrReviewerName: '人事部長',
    reviewedAt: '2024-03-20T15:00:00Z',
    reviewComment: '職務能力を評価し、承認します。',
    approvalStatus: 'approved',
    rejectionReason: null,
    withdrawnAt: null,
    attachments: [],
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-20T15:00:00Z'
  },
  {
    id: 'req-001',
    staffId: 'OH-NS-2021-001',
    currentCourseCode: 'C',
    requestedCourseCode: 'D',
    changeReason: 'special_caregiving',
    reasonDetail: '親の介護のため、夜勤なしのDコースへの変更を希望します。',
    requestedEffectiveDate: '2023-10-01',
    hrReviewerId: 'HR-001',
    hrReviewerName: '人事部長',
    reviewedAt: '2023-09-15T14:00:00Z',
    reviewComment: '介護事由を確認しましたが、現在の勤務シフト調整で対応可能と判断しました。',
    approvalStatus: 'rejected',
    rejectionReason: '現在の勤務シフト調整で対応可能なため。',
    withdrawnAt: null,
    attachments: ['介護状況証明書.pdf'],
    createdAt: '2023-09-10T10:00:00Z',
    updatedAt: '2023-09-15T14:00:00Z'
  }
];

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CareerCourseChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CareerCourseChangeRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      // TODO: 実際のAPIエンドポイントに置き換える
      // const response = await fetch('/api/career-course/my-requests');
      // const data = await response.json();
      // setRequests(data);

      // モックデータ
      setTimeout(() => {
        setRequests(MOCK_REQUESTS);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('申請履歴の取得に失敗しました', error);
      setIsLoading(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.approvalStatus === 'pending').length,
    approved: requests.filter(r => r.approvalStatus === 'approved').length,
    rejected: requests.filter(r => r.approvalStatus === 'rejected').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/career-selection-station')}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">申請状況確認</h1>
            <p className="text-slate-400 mt-1">コース変更申請の履歴と審査結果</p>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-sm text-slate-600">総申請数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-slate-600">承認待ち</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-slate-600">承認済み</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-slate-600">却下</div>
            </CardContent>
          </Card>
        </div>

        {/* 申請一覧 */}
        <Card>
          <CardHeader className="bg-slate-700">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              申請履歴
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">申請履歴がありません</p>
                <button
                  onClick={() => navigate('/career-selection-station/change-request')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  コース変更を申請する
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(request => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {request.currentCourseCode} → {request.requestedCourseCode}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {request.currentCourseCode}コース → {request.requestedCourseCode}コース
                          </div>
                          <div className="text-sm text-slate-600">
                            {new Date(request.createdAt).toLocaleDateString('ja-JP')} 申請
                          </div>
                        </div>
                      </div>
                      <Badge className={STATUS_INFO[request.approvalStatus].color}>
                        {STATUS_INFO[request.approvalStatus].icon}
                        <span className="ml-1">{STATUS_INFO[request.approvalStatus].label}</span>
                      </Badge>
                    </div>

                    <div className="text-sm text-slate-600 mb-2">
                      {request.reasonDetail}
                    </div>

                    {request.reviewComment && (
                      <div className="mt-3 p-3 bg-slate-100 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">審査コメント</div>
                        <div className="text-sm text-slate-700">{request.reviewComment}</div>
                        {request.hrReviewerName && (
                          <div className="text-xs text-slate-500 mt-1">
                            審査者: {request.hrReviewerName}
                          </div>
                        )}
                      </div>
                    )}

                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-xs text-red-700 mb-1">却下理由</div>
                        <div className="text-sm text-red-800">{request.rejectionReason}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 新規申請ボタン */}
        <button
          onClick={() => navigate('/career-selection-station/change-request')}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          新しいコース変更を申請する
        </button>
      </div>

      {/* 詳細モーダル（オプション） */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>申請詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">申請ID</div>
                  <div className="font-semibold">{selectedRequest.id}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">ステータス</div>
                  <Badge className={STATUS_INFO[selectedRequest.approvalStatus].color}>
                    {STATUS_INFO[selectedRequest.approvalStatus].label}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">申請日</div>
                  <div className="font-semibold">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">希望適用日</div>
                  <div className="font-semibold">
                    {new Date(selectedRequest.requestedEffectiveDate).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-600 mb-1">変更内容</div>
                <div className="font-semibold">
                  {selectedRequest.currentCourseCode}コース → {selectedRequest.requestedCourseCode}コース
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-600 mb-1">理由詳細</div>
                <div className="text-slate-800">{selectedRequest.reasonDetail}</div>
              </div>

              {selectedRequest.attachments.length > 0 && (
                <div>
                  <div className="text-sm text-slate-600 mb-1">添付ファイル</div>
                  <div className="space-y-1">
                    {selectedRequest.attachments.map((file, index) => (
                      <div key={index} className="text-sm text-blue-600">{file}</div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.reviewComment && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">審査コメント</div>
                  <div className="text-slate-800">{selectedRequest.reviewComment}</div>
                  {selectedRequest.hrReviewerName && (
                    <div className="text-sm text-slate-600 mt-2">
                      審査者: {selectedRequest.hrReviewerName}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                閉じる
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};