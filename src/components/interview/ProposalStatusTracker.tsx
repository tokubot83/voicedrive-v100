import React from 'react';
import { Clock, CheckCircle, AlertCircle, RefreshCw, User, Calendar, MessageSquare } from 'lucide-react';
import { useProposalStatus } from '../../hooks/useProposalStatus';

interface ProposalStatusTrackerProps {
  voicedriveRequestId: string;
  onStatusChange?: (status: any) => void;
  compact?: boolean;
}

const ProposalStatusTracker: React.FC<ProposalStatusTrackerProps> = ({
  voicedriveRequestId,
  onStatusChange,
  compact = false
}) => {
  const { status, loading, error, refresh } = useProposalStatus({
    voicedriveRequestId,
    autoRefresh: true,
    refreshInterval: 3000,
    onStatusChange
  });

  // ステータス表示用の設定
  const getStatusConfig = (proposalStatus: string, bookingStatus: string) => {
    if (bookingStatus === 'confirmed') {
      return {
        icon: CheckCircle,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        label: '予約確定',
        description: '面談予約が正式に確定しました'
      };
    }

    switch (proposalStatus) {
      case 'pending_selection':
        return {
          icon: Clock,
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          label: '選択待ち',
          description: '提案から選択をお待ちしています'
        };
      case 'processing':
        return {
          icon: RefreshCw,
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          label: '処理中',
          description: 'AI最適化処理を実行中です'
        };
      case 'revised_pending_selection':
        return {
          icon: MessageSquare,
          color: 'purple',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          iconColor: 'text-purple-600',
          label: '修正提案中',
          description: '条件変更に基づく新しい提案をご確認ください'
        };
      case 'selected':
        return {
          icon: User,
          color: 'indigo',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          textColor: 'text-indigo-800',
          iconColor: 'text-indigo-600',
          label: '選択済み',
          description: '選択内容を確認中です'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          label: '状態不明',
          description: 'ステータスを確認中です'
        };
    }
  };

  // ローディング表示
  if (loading && !status) {
    return (
      <div className={`${compact ? 'p-3' : 'p-6'} bg-gray-50 rounded-lg border border-gray-200 animate-pulse`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className={`${compact ? 'p-3' : 'p-6'} bg-red-50 border border-red-200 rounded-lg`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">ステータス取得エラー</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const config = getStatusConfig(status.proposalStatus, status.bookingStatus);
  const IconComponent = config.icon;

  // コンパクト表示
  if (compact) {
    return (
      <div className={`p-3 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
        <div className="flex items-center space-x-3">
          <IconComponent className={`w-5 h-5 ${config.iconColor} flex-shrink-0 ${config.icon === RefreshCw ? 'animate-spin' : ''}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${config.textColor} truncate`}>
              {config.label}
            </p>
            <p className={`text-xs ${config.textColor} opacity-75 truncate`}>
              {config.description}
            </p>
          </div>
          {status.lastUpdate && (
            <div className="text-xs text-gray-500">
              {new Date(status.lastUpdate).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 通常表示
  return (
    <div className={`p-6 ${config.bgColor} border ${config.borderColor} rounded-xl`}>
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${config.bgColor} rounded-lg flex items-center justify-center`}>
          <IconComponent className={`w-7 h-7 ${config.iconColor} ${config.icon === RefreshCw ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {config.label}
            </h3>
            <button
              onClick={refresh}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : `hover:bg-${config.color}-100 ${config.textColor}`
              }`}
              title="ステータスを更新"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className={`${config.textColor} opacity-90 mb-3`}>
            {config.description}
          </p>

          {/* 詳細情報 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className={`${config.textColor} opacity-75`}>提案状況:</span>
                <span className={`font-medium ${config.textColor}`}>
                  {status.hasProposals ? '受信済み' : '未受信'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`${config.textColor} opacity-75`}>予約状況:</span>
                <span className={`font-medium ${config.textColor}`}>
                  {status.hasBooking ? '確定済み' : '未確定'}
                </span>
              </div>
            </div>

            {status.lastUpdate && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className={`w-4 h-4 ${config.textColor} opacity-75`} />
                <span className={`${config.textColor} opacity-75`}>
                  最終更新: {new Date(status.lastUpdate).toLocaleString('ja-JP')}
                </span>
              </div>
            )}
          </div>

          {/* プログレスバー（処理中の場合） */}
          {config.icon === RefreshCw && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${config.color}-600 h-2 rounded-full animate-pulse`}
                  style={{ width: '60%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">処理中...</p>
            </div>
          )}
        </div>
      </div>

      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">デバッグ情報</summary>
            <div className="mt-2 space-y-1">
              <div>Request ID: {status.requestId}</div>
              <div>Proposal Status: {status.proposalStatus}</div>
              <div>Booking Status: {status.bookingStatus}</div>
              <div>Has Proposals: {status.hasProposals ? 'Yes' : 'No'}</div>
              <div>Has Booking: {status.hasBooking ? 'Yes' : 'No'}</div>
              <div>Last Update: {status.lastUpdate || 'N/A'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default ProposalStatusTracker;