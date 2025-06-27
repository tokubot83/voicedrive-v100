import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { ApprovalRequest } from '../../types/authority';

interface CurrentApprovalCardProps {
  request: ApprovalRequest;
  onApprove: (requestId: string, reason: string) => void;
  onReject: (requestId: string, reason: string) => void;
  currentApproverRole?: string;
  isActionable?: boolean;
}

const CurrentApprovalCard: React.FC<CurrentApprovalCardProps> = ({
  request,
  onApprove,
  onReject,
  currentApproverRole,
  isActionable = true
}) => {
  const [showActionForm, setShowActionForm] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [actionType, setActionType] = React.useState<'approve' | 'reject' | null>(null);

  const handleAction = (type: 'approve' | 'reject') => {
    setActionType(type);
    setShowActionForm(true);
  };

  const confirmAction = () => {
    if (!reason.trim()) return;
    
    if (actionType === 'approve') {
      onApprove(request.id, reason);
    } else if (actionType === 'reject') {
      onReject(request.id, reason);
    }
    
    setShowActionForm(false);
    setReason('');
    setActionType(null);
  };

  const cancelAction = () => {
    setShowActionForm(false);
    setReason('');
    setActionType(null);
  };

  const getCurrentApproverInfo = () => {
    const currentNode = request.approvalChain.find(
      node => node.approverId === request.currentApproverId
    );
    return currentNode;
  };

  const currentApprover = getCurrentApproverInfo();

  return (
    <div className="space-y-4">
      {/* メインカード */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-90">承認待ち</div>
              <div className="text-xl font-bold">プロジェクト {request.projectId}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">予算</div>
            <div className="text-lg font-bold">¥{request.budgetAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-white/90 text-sm">{request.reason}</p>
        </div>

        {/* 現在の承認者情報 */}
        {currentApprover && (
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm opacity-90">承認権限者</span>
            </div>
            <div className="text-lg font-bold">{currentApprover.role}による承認が必要です</div>
            {currentApprover.department && (
              <div className="text-sm opacity-80 mt-1">{currentApprover.department}</div>
            )}
          </div>
        )}

        {/* 承認チェーンインジケーター */}
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-90">承認進捗:</span>
          <div className="flex items-center gap-1">
            {request.approvalChain.map((node, index) => {
              const isCurrent = node.approverId === request.currentApproverId;
              const statusColors = {
                approved: 'bg-green-400',
                rejected: 'bg-red-400',
                skipped: 'bg-yellow-400',
                pending: isCurrent ? 'bg-white animate-pulse' : 'bg-white/30'
              };

              return (
                <React.Fragment key={node.approverId}>
                  <div
                    className={`w-3 h-3 rounded-full ${statusColors[node.status]} transition-all duration-300`}
                    title={`${node.role} - ${node.status}`}
                  />
                  {index < request.approvalChain.length - 1 && (
                    <div className="w-2 h-0.5 bg-white/40" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      {isActionable && !showActionForm && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAction('approve')}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            承認
          </button>
          <button
            onClick={() => handleAction('reject')}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            差し戻し
          </button>
        </div>
      )}

      {/* アクション確認フォーム */}
      {showActionForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <h4 className="font-medium text-gray-800 mb-3">
            {actionType === 'approve' ? '承認' : '差し戻し'}理由を記入してください
          </h4>
          
          <div className="mb-4">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                actionType === 'approve' 
                  ? '承認理由を記入してください...' 
                  : '差し戻し理由を記入してください...'
              }
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={confirmAction}
              disabled={!reason.trim()}
              className={`
                flex-1 py-2 rounded-lg font-medium transition-colors
                ${reason.trim()
                  ? actionType === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {actionType === 'approve' ? '承認実行' : '差し戻し実行'}
            </button>
            <button
              onClick={cancelAction}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentApprovalCard;