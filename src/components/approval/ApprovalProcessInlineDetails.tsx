import React from 'react';
import { Post } from '../../types';
import { getApprovalSteps, getEstimatedCompletion } from '../../utils/approvalCalculations';

interface ApprovalProcessInlineDetailsProps {
  post: Post;
}

const ApprovalProcessInlineDetails: React.FC<ApprovalProcessInlineDetailsProps> = ({ post }) => {
  const approvalSteps = getApprovalSteps(post);
  const currentStep = approvalSteps.find(step => step.status === 'in_progress');
  const completedSteps = approvalSteps.filter(step => step.status === 'approved').length;
  
  return (
    <div className="space-y-6">
      {/* 承認ステップ進捗 */}
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          📋 承認ステップ進捗
        </h4>
        <div className="space-y-2">
          {approvalSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step.status === 'approved' ? 'bg-green-600 text-white' :
                step.status === 'in_progress' ? 'bg-blue-600 text-white animate-pulse' :
                step.status === 'rejected' ? 'bg-red-600 text-white' :
                'bg-gray-600 text-gray-300'
              }`}>
                {step.status === 'approved' ? '✓' :
                 step.status === 'rejected' ? '✗' :
                 index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white">{step.title}</div>
                <div className="text-xs text-gray-400">{step.description}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs px-2 py-1 rounded ${
                  step.status === 'approved' ? 'bg-green-900/50 text-green-300' :
                  step.status === 'in_progress' ? 'bg-blue-900/50 text-blue-300' :
                  step.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {step.status === 'approved' ? '承認済み' :
                   step.status === 'in_progress' ? '審査中' :
                   step.status === 'rejected' ? '差戻し' : '待機中'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 承認者情報 */}
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          👤 承認者情報
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {approvalSteps.flatMap(step => step.approvers).map((approver, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {approver.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{approver.name}</div>
                <div className="text-xs text-gray-400">{approver.role} - {approver.department}</div>
                {approver.timestamp && (
                  <div className="text-xs text-gray-500">
                    {new Date(approver.timestamp).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                )}
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                approver.status === 'approved' ? 'bg-green-900/50 text-green-300' :
                approver.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                'bg-gray-700 text-gray-400'
              }`}>
                {approver.status === 'approved' ? '承認' :
                 approver.status === 'rejected' ? '差戻' : '待機'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 承認コメント */}
      {approvalSteps.some(step => step.approvers.some(a => a.comment)) && (
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            💬 承認コメント
          </h4>
          <div className="space-y-2">
            {approvalSteps.flatMap(step => 
              step.approvers.filter(a => a.comment).map((approver, index) => (
                <div key={`${step.id}-${index}`} className="p-3 bg-gray-800/30 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{approver.name}</span>
                    <span className="text-xs text-gray-500">
                      {approver.timestamp && new Date(approver.timestamp).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{approver.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 処理時間の推移 */}
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          📈 処理時間の推移
        </h4>
        <div className="space-y-2">
          {approvalSteps.filter(step => step.status === 'approved').map((step, index) => {
            const duration = Math.floor(Math.random() * 3) + 1; // サンプル期間
            return (
              <div key={step.id} className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                <span className="text-sm text-gray-300">{step.title}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-xs text-green-400">{duration}日</span>
                </div>
              </div>
            );
          })}
          {currentStep && (
            <div className="flex justify-between items-center p-2 bg-blue-900/20 rounded border border-blue-700">
              <span className="text-sm text-blue-300">{currentStep.title} (進行中)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <span className="text-xs text-blue-400">2日経過</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 予想完了情報 */}
      <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400">⏰</span>
          <span className="text-yellow-300 font-medium">予想完了日</span>
        </div>
        <div className="text-sm text-gray-300">
          残り{approvalSteps.filter(step => step.status === 'pending').length}ステップ
          <span className="text-yellow-400 font-bold ml-2">
            {getEstimatedCompletion(approvalSteps).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* 現在のアクション（承認権限がある場合） */}
      {currentStep && (
        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600">
          <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
            💼 現在のアクション
          </h4>
          <p className="text-sm text-gray-300 mb-3">{currentStep.description}</p>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1">
              <span>✅</span> 承認する
            </button>
            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors flex items-center gap-1">
              <span>↩️</span> 差し戻し
            </button>
            <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors flex items-center gap-1">
              <span>📝</span> 追加情報要求
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalProcessInlineDetails;