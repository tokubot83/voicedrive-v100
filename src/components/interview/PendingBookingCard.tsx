import React from 'react';
import { AssistedBookingRequest, AssistedBookingStatus } from '../../services/AssistedBookingService';

interface PendingBookingCardProps {
  booking: AssistedBookingRequest;
  onViewProposals?: (requestId: string) => void;
  onContactHR?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

const PendingBookingCard: React.FC<PendingBookingCardProps> = ({
  booking,
  onViewProposals,
  onContactHR,
  onCancel
}) => {
  const getStatusMessage = (status: AssistedBookingStatus): { message: string; icon: string; color: string } => {
    const statusConfig = {
      'pending_review': {
        message: '人事部にて調整中...',
        icon: '📋',
        color: 'blue'
      },
      'proposals_ready': {
        message: '面談候補をご用意しました！',
        icon: '💡',
        color: 'green'
      },
      'awaiting_selection': {
        message: 'あなたの選択をお待ちしています',
        icon: '⚡',
        color: 'purple'
      },
      'confirmed': {
        message: '予約が確定しました',
        icon: '✅',
        color: 'green'
      },
      'failed': {
        message: '調整が困難でした',
        icon: '⚠️',
        color: 'red'
      },
      'expired': {
        message: '選択期限が過ぎました',
        icon: '⏰',
        color: 'orange'
      }
    };

    return statusConfig[status];
  };

  const getProgressColor = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    if (percentage >= 100) return 'bg-green-400';
    if (percentage >= 66) return 'bg-blue-400';
    if (percentage >= 33) return 'bg-yellow-400';
    return 'bg-gray-400';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElapsedTime = (requestDate: string) => {
    const now = new Date();
    const request = new Date(requestDate);
    const diffMs = now.getTime() - request.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}時間${diffMinutes}分前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分前`;
    } else {
      return '今送信';
    }
  };

  const statusInfo = getStatusMessage(booking.status);

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">
            {booking.interviewType}
          </h3>
          <span className="text-sm opacity-75">
            申込: {formatDate(booking.requestDate)}
          </span>
        </div>

        <div className="text-sm opacity-90 mb-1">
          {getElapsedTime(booking.requestDate)} •
          緊急度: {booking.urgencyLevel === 'urgent' ? '至急' :
                   booking.urgencyLevel === 'this_week' ? '今週中' :
                   booking.urgencyLevel === 'next_week' ? '来週中' : '今月中'}
        </div>
      </div>

      {/* 現在のステータス */}
      <div className="bg-indigo-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3">{statusInfo.icon}</span>
          <div>
            <div className="font-medium text-white">
              {statusInfo.message}
            </div>
            {booking.estimatedCompletion && booking.status === 'pending_review' && (
              <div className="text-sm opacity-80">
                完了予定: {booking.estimatedCompletion}
              </div>
            )}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-3">
          <div className="flex justify-between text-xs opacity-75 mb-1">
            {booking.progress.labels.map((label, index) => (
              <span
                key={index}
                className={booking.progress.current > index ? 'text-white' : 'text-indigo-300'}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: booking.progress.total }, (_, index) => (
              <div
                key={index}
                className={`
                  flex-1 h-2 rounded-full transition-all duration-500
                  ${booking.progress.current > index
                    ? getProgressColor(booking.progress.current, booking.progress.total)
                    : 'bg-indigo-900'
                  }
                  ${booking.progress.current === index + 1 ? 'animate-pulse' : ''}
                `}
              />
            ))}
          </div>
        </div>

        {/* ロードアニメーション（処理中の場合） */}
        {booking.status === 'pending_review' && (
          <div className="flex items-center justify-center py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="ml-3 text-sm opacity-75">調整中</span>
          </div>
        )}
      </div>

      {/* 提案候補数表示（準備完了時） */}
      {booking.proposals && booking.proposals.length > 0 && (
        <div className="bg-indigo-800/30 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-yellow-300 mr-2">🎯</span>
            <span className="text-sm">
              {booking.proposals.length}つの候補をご用意しました
            </span>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        {booking.actions.viewProposals && onViewProposals && (
          <button
            onClick={() => onViewProposals(booking.id)}
            className="flex-1 bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            📋 候補を確認
          </button>
        )}

        {booking.actions.contactHR && onContactHR && (
          <button
            onClick={() => onContactHR(booking.id)}
            className="bg-indigo-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors border border-indigo-600"
          >
            📞 人事部に連絡
          </button>
        )}

        {booking.actions.canCancel && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="px-4 py-2 text-indigo-200 hover:text-white transition-colors text-sm"
          >
            キャンセル
          </button>
        )}
      </div>

      {/* 詳細情報（展開可能） */}
      {booking.status === 'failed' && (
        <div className="mt-4 bg-red-800/30 rounded-lg p-3">
          <div className="flex items-start">
            <span className="text-red-300 mr-2">💡</span>
            <div className="text-sm text-red-100">
              <p className="font-medium mb-1">代替案のご提案</p>
              <p>• 即時予約で空いている時間から選択</p>
              <p>• 人事部に直接ご相談（内線:1234）</p>
              <p>• 希望条件を変更して再申請</p>
            </div>
          </div>
        </div>
      )}

      {booking.status === 'expired' && (
        <div className="mt-4 bg-orange-800/30 rounded-lg p-3">
          <div className="flex items-start">
            <span className="text-orange-300 mr-2">🔄</span>
            <div className="text-sm text-orange-100">
              <p>選択期限が過ぎましたが、候補は引き続き有効です。</p>
              <p>人事部までご連絡いただければ調整いたします。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingBookingCard;