import React from 'react';
import { ApprovalStepCardProps } from '../../types/approval';

const ApprovalStepCard = ({ step, isActive, stepNumber }: ApprovalStepCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/30 border-green-700';
      case 'rejected': return 'text-red-400 bg-red-900/30 border-red-700';
      case 'in_progress': return 'text-blue-400 bg-blue-900/30 border-blue-700';
      case 'escalated': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'in_progress': return '🔄';
      case 'escalated': return '⚠️';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '承認済み';
      case 'rejected': return '差し戻し';
      case 'in_progress': return '進行中';
      case 'escalated': return 'エスカレーション';
      default: return '承認待ち';
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-300 ${getStatusColor(step.status)} ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">
            {stepNumber}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{step.title}</h3>
            <p className="text-sm text-gray-300 mt-1">{step.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon(step.status)}</span>
          <span className="text-sm font-medium">{getStatusText(step.status)}</span>
        </div>
      </div>

      {/* 承認者リスト */}
      {step.approvers.length > 0 && (
        <div className="space-y-2 mt-4">
          {step.approvers.map((approver, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {approver.role.includes('院長') || approver.role.includes('施設長') ? '🏥' :
                   approver.role.includes('部長') || approver.role.includes('課長') ? '👔' :
                   approver.role.includes('師長') ? '👩‍⚕️' :
                   approver.role.includes('主任') ? '👨‍💼' : '👤'}
                </div>
                <div>
                  <div className="text-white font-medium">{approver.role}</div>
                  <div className="text-xs text-gray-400">{approver.department}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  approver.status === 'approved' ? 'text-green-400' :
                  approver.status === 'rejected' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {approver.status === 'approved' ? '承認済み' :
                   approver.status === 'rejected' ? '差し戻し' : '承認待ち'}
                </div>
                {approver.timestamp && (
                  <div className="text-xs text-gray-500">
                    {new Date(approver.timestamp).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* コメント表示 */}
      {step.approvers.some(a => a.comment) && (
        <div className="mt-3 p-3 bg-gray-800/30 rounded border-l-4 border-blue-500">
          <h4 className="text-sm font-medium text-blue-300 mb-2">💬 承認者コメント</h4>
          {step.approvers.filter(a => a.comment).map((approver, index) => (
            <div key={index} className="text-sm text-gray-300 mb-1">
              <span className="font-medium text-white">{approver.role}:</span> {approver.comment}
            </div>
          ))}
        </div>
      )}

      {/* 期限情報 */}
      {(step.deadline || step.estimatedDuration) && (
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-gray-400">
            <span className="text-gray-500">予想期間:</span> {step.estimatedDuration}
          </span>
          {step.deadline && (
            <span className="text-gray-400">
              <span className="text-gray-500">期限:</span> {' '}
              {new Date(step.deadline).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </span>
          )}
        </div>
      )}

      {/* アクティブステップのハイライト */}
      {isActive && (
        <div className="mt-3 p-2 bg-blue-600/20 rounded text-center">
          <span className="text-blue-300 text-sm font-medium">現在このステップで承認処理中</span>
        </div>
      )}
    </div>
  );
};

export default ApprovalStepCard;