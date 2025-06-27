import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ApprovalRequest } from '../../types/authority';

interface SimpleApprovalCardProps {
  request: ApprovalRequest;
  onApprove?: (requestId: string, reason: string) => void;
  onReject?: (requestId: string, reason: string) => void;
  isActionable?: boolean;
}

const SimpleApprovalCard: React.FC<SimpleApprovalCardProps> = ({
  request,
  onApprove,
  onReject,
  isActionable = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const getCurrentApproverInfo = () => {
    const currentNode = request.approvalChain.find(
      node => node.approverId === request.currentApproverId
    );
    return currentNode;
  };

  const getProgressInfo = () => {
    const completed = request.approvalChain.filter(node => node.status === 'approved').length;
    const total = request.approvalChain.length;
    return { completed, total };
  };

  const handleAction = (type: 'approve' | 'reject') => {
    setActionType(type);
    setShowActionForm(true);
  };

  const confirmAction = () => {
    if (!reason.trim() || !actionType) return;
    
    if (actionType === 'approve' && onApprove) {
      onApprove(request.id, reason);
    } else if (actionType === 'reject' && onReject) {
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

  const currentApprover = getCurrentApproverInfo();
  const { completed, total } = getProgressInfo();

  return (
    <div className="bg-white border border-emerald-300 rounded-xl overflow-hidden hover:border-emerald-400 transition-all">
      {/* コンパクトヘッダー */}
      <div 
        className="p-4 cursor-pointer hover:bg-emerald-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 承認進捗インジケーター */}
            <div className="flex items-center gap-1">
              {request.approvalChain.map((node, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    node.status === 'approved' ? 'bg-green-500' :
                    node.approverId === request.currentApproverId ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div>
              <div className="text-emerald-700 font-medium text-sm">承認プロセス</div>
              <div className="text-emerald-800 font-bold">
                {currentApprover?.role}による承認が必要です
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-500">進捗</div>
              <div className="text-sm font-medium text-emerald-700">
                {completed}/{total}
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* 詳細表示（展開時） */}
      {isExpanded && (
        <div className="border-t border-emerald-200 bg-emerald-50">
          <div className="p-4 space-y-4">
            {/* 承認ステップ詳細 */}
            <div>
              <h4 className="text-emerald-700 font-medium mb-3 flex items-center gap-2">
                📋 承認ステップ進捗
              </h4>
              <div className="space-y-2">
                {request.approvalChain.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.status === 'approved' ? 'bg-green-600 text-white' :
                      step.approverId === request.currentApproverId ? 'bg-blue-600 text-white animate-pulse' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {step.status === 'approved' ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-emerald-800 font-medium">{step.role}</div>
                      <div className="text-xs text-gray-600">{step.department}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded ${
                        step.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                        step.approverId === request.currentApproverId ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {step.status === 'approved' ? '承認済み' :
                         step.approverId === request.currentApproverId ? '審査中' : '待機中'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* アクションボタン */}
            {isActionable && !showActionForm && (
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('approve');
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  承認
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('reject');
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  差し戻し
                </button>
              </div>
            )}

            {/* アクション確認フォーム */}
            {showActionForm && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  {actionType === 'approve' ? '承認' : '差し戻し'}理由を記入してください
                </h4>
                
                <div className="mb-4">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 text-gray-800 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
        </div>
      )}
    </div>
  );
};

export default SimpleApprovalCard;