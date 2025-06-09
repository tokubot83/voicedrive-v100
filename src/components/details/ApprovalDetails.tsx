import React from 'react';
import { CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

interface ApprovalDetailsProps {
  data: any;
}

const ApprovalDetails: React.FC<ApprovalDetailsProps> = ({ data }) => {
  const approvalSteps = [
    { level: 1, title: '発案者', status: 'completed', approver: '山田太郎', date: '2024/06/10' },
    { level: 2, title: '現場リーダー', status: 'completed', approver: '佐藤花子', date: '2024/06/11' },
    { level: 3, title: '部門長', status: 'completed', approver: '鈴木一郎', date: '2024/06/12' },
    { level: 4, title: '施設長', status: 'pending', approver: '田中次郎', date: '-' },
    { level: 5, title: '経営企画', status: 'waiting', approver: '-', date: '-' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'waiting':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 承認フロー */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">承認フロー</h4>
        <div className="space-y-3">
          {approvalSteps.map((step, index) => (
            <div key={step.level} className="relative">
              {index < approvalSteps.length - 1 && (
                <div className={`absolute left-2.5 top-8 w-0.5 h-12 ${
                  step.status === 'completed' ? 'bg-green-400' : 'bg-gray-600'
                }`} />
              )}
              <div className="flex items-center gap-3">
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-white' : 
                      step.status === 'pending' ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      LEVEL_{step.level} - {step.title}
                    </span>
                    <span className="text-xs text-gray-500">{step.date}</span>
                  </div>
                  {step.approver !== '-' && (
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {step.approver}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 承認条件 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">承認条件</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
            <div>
              <span className="text-gray-300">合意度 60%以上</span>
              <span className="text-green-400 ml-2">✓ 達成 (75%)</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
            <div>
              <span className="text-gray-300">参加率 50%以上</span>
              <span className="text-green-400 ml-2">✓ 達成 (68%)</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div>
              <span className="text-gray-300">予算承認</span>
              <span className="text-yellow-400 ml-2">審査中</span>
            </div>
          </div>
        </div>
      </div>

      {/* 次のアクション */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-400 mb-2">次のアクション</h4>
        <p className="text-sm text-gray-300">
          施設長による最終承認待ちです。承認後、経営企画部での予算審査に進みます。
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>予定完了日: 2024年6月15日</span>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetails;