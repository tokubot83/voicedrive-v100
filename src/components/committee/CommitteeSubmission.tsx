import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Send, X, FileText } from 'lucide-react';
import { User, Post } from '../../types';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

// 小原病院の委員会リスト
const OBARA_COMMITTEES = [
  // 医療安全・品質系
  { id: 'medical-safety', name: '医療安全管理委員会', category: '医療安全・品質' },
  { id: 'infection-control', name: '院内感染対策委員会', category: '医療安全・品質' },
  { id: 'medical-records', name: '診療録管理委員会', category: '医療安全・品質' },

  // 業務改善系
  { id: 'hospital-improvement', name: '病院機能向上委員会', category: '業務改善' },
  { id: 'nursing-improvement', name: '看護業務改善委員会', category: '業務改善' },
  { id: 'workload-reduction', name: '業務負担軽減委員会', category: '業務改善' },
  { id: 'patient-service', name: '患者サービス向上委員会', category: '業務改善' },

  // 人事・労務系
  { id: 'occupational-health', name: '労働衛生委員会', category: '人事・労務' },
  { id: 'welfare', name: '福利厚生委員会', category: '人事・労務' },

  // 経営・運営系
  { id: 'hospital-management', name: '病院運営委員会', category: '経営・運営' },

  // その他
  { id: 'other', name: 'その他の委員会', category: 'その他' },
  { id: 'multiple', name: '複数委員会への同時提出', category: 'その他' }
];

interface CommitteeSubmissionProps {
  post: Post;
  currentUser: User;
  currentScore: number;
  onStatusUpdate: (status: string, data?: any) => void;
}

export const CommitteeSubmission: React.FC<CommitteeSubmissionProps> = ({
  post,
  currentUser,
  currentScore,
  onStatusUpdate
}) => {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedCommittees, setSelectedCommittees] = useState<string[]>([]);
  const [submissionNote, setSubmissionNote] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'return' | 'reject' | null>(null);
  const [reviewReason, setReviewReason] = useState('');

  // 権限チェック（Lv.8以上）
  const hasSubmissionAuthority = currentUser.permissionLevel &&
    currentUser.permissionLevel >= PermissionLevel.LEVEL_8;

  // 現在のステータス
  const currentStatus = post.committeeStatus || 'pending';

  // 施設議題レベル（100点以上）に達しているか
  const hasReachedThreshold = currentScore >= 100;

  // 提出判断の処理
  const handleSubmissionDecision = () => {
    if (!hasSubmissionAuthority) return;

    if (reviewDecision === 'approve' && selectedCommittees.length > 0) {
      // 承認：委員会提出
      onStatusUpdate('committee_submitted', {
        committees: selectedCommittees,
        submittedBy: currentUser,
        submissionDate: new Date(),
        note: submissionNote
      });

      setShowSubmissionModal(false);
      resetForm();
    } else if (reviewDecision === 'return') {
      // 差し戻し
      onStatusUpdate('returned_for_improvement', {
        reason: reviewReason,
        reviewedBy: currentUser,
        reviewDate: new Date()
      });

      setShowSubmissionModal(false);
      resetForm();
    } else if (reviewDecision === 'reject') {
      // 却下
      onStatusUpdate('rejected', {
        reason: reviewReason,
        reviewedBy: currentUser,
        reviewDate: new Date()
      });

      setShowSubmissionModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedCommittees([]);
    setSubmissionNote('');
    setReviewDecision(null);
    setReviewReason('');
  };

  // ステータス表示
  const getStatusDisplay = () => {
    const statusMap: Record<string, { label: string; icon: JSX.Element; color: string }> = {
      'pending': {
        label: '委員会提出待ち',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-yellow-600'
      },
      'under_review': {
        label: '施設議題（審査中）',
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-blue-600'
      },
      'committee_submitted': {
        label: '委員会へ提出済み',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600'
      },
      'committee_reviewing': {
        label: '委員会で審議中',
        icon: <Clock className="w-4 h-4" />,
        color: 'text-blue-600'
      },
      'implementation_decided': {
        label: '委員会決定：実施予定',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600'
      },
      'escalated_to_corp': {
        label: '委員会決定：法人検討へ',
        icon: <Send className="w-4 h-4" />,
        color: 'text-purple-600'
      },
      'returned_for_improvement': {
        label: '要改善',
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-orange-600'
      },
      'rejected': {
        label: '施設議題却下',
        icon: <X className="w-4 h-4" />,
        color: 'text-red-600'
      }
    };

    const status = statusMap[currentStatus] || statusMap['pending'];

    return (
      <div className={`flex items-center gap-2 ${status.color}`}>
        {status.icon}
        <span className="font-medium">{status.label}</span>
      </div>
    );
  };

  if (!hasReachedThreshold) {
    return null; // 100点未満は表示しない
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          委員会提出管理
        </h3>
        {getStatusDisplay()}
      </div>

      {/* 権限者用の提出ボタン */}
      {hasSubmissionAuthority && currentStatus === 'pending' && (
        <button
          onClick={() => setShowSubmissionModal(true)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          委員会提出の判断
        </button>
      )}

      {/* 提出済み情報の表示 */}
      {post.committeeInfo && (
        <div className="mt-4 space-y-2 text-sm">
          {post.committeeInfo.committees && (
            <div>
              <span className="text-gray-600">提出先：</span>
              <span className="text-gray-900 font-medium ml-1">
                {post.committeeInfo.committees.join('、')}
              </span>
            </div>
          )}
          {post.committeeInfo.submissionDate && (
            <div>
              <span className="text-gray-600">提出日：</span>
              <span className="text-gray-900 ml-1">
                {new Date(post.committeeInfo.submissionDate).toLocaleDateString('ja-JP')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 提出モーダル */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                委員会提出の判断
              </h2>

              {/* 判断選択 */}
              <div className="space-y-3 mb-6">
                <label className="block">
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={reviewDecision === 'approve'}
                    onChange={() => setReviewDecision('approve')}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">承認 - 委員会へ提出</span>
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="decision"
                    value="return"
                    checked={reviewDecision === 'return'}
                    onChange={() => setReviewDecision('return')}
                    className="mr-2"
                  />
                  <span className="text-orange-600 font-medium">差し戻し - 要改善</span>
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={reviewDecision === 'reject'}
                    onChange={() => setReviewDecision('reject')}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">却下 - 委員会提出不適</span>
                </label>
              </div>

              {/* 承認時：委員会選択 */}
              {reviewDecision === 'approve' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提出先委員会を選択
                  </label>
                  <div className="space-y-4">
                    {['医療安全・品質', '業務改善', '人事・労務', '経営・運営', 'その他'].map(category => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">{category}</h4>
                        <div className="space-y-2 ml-4">
                          {OBARA_COMMITTEES
                            .filter(c => c.category === category)
                            .map(committee => (
                              <label key={committee.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedCommittees.includes(committee.name)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCommittees([...selectedCommittees, committee.name]);
                                    } else {
                                      setSelectedCommittees(selectedCommittees.filter(c => c !== committee.name));
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm">{committee.name}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      備考（任意）
                    </label>
                    <textarea
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="委員会への申し送り事項など"
                    />
                  </div>
                </div>
              )}

              {/* 差し戻し・却下時：理由入力 */}
              {(reviewDecision === 'return' || reviewDecision === 'reject') && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {reviewDecision === 'return' ? '差し戻し理由' : '却下理由'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="投稿者へフィードバックする内容を記入してください"
                    required
                  />
                </div>
              )}

              {/* ボタン */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSubmissionModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmissionDecision}
                  disabled={
                    !reviewDecision ||
                    (reviewDecision === 'approve' && selectedCommittees.length === 0) ||
                    ((reviewDecision === 'return' || reviewDecision === 'reject') && !reviewReason)
                  }
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    reviewDecision === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    reviewDecision === 'return' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-red-600 hover:bg-red-700'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  決定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeSubmission;