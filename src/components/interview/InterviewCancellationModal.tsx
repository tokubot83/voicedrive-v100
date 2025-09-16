import React, { useState } from 'react';
import { InterviewBooking } from '../../types/interview';
import { InterviewCancellationRequest } from '../../types/medicalNotification';

interface InterviewCancellationModalProps {
  booking: InterviewBooking;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (cancellationRequest: InterviewCancellationRequest) => void;
  currentUserId: string;
}

const InterviewCancellationModal: React.FC<InterviewCancellationModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCancel,
  currentUserId
}) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'in_person'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // 面談が今日かどうかを判定
  const isToday = () => {
    const today = new Date().toDateString();
    const bookingDate = new Date(booking.bookingDate).toDateString();
    return today === bookingDate;
  };

  // 面談までの時間を計算
  const getTimeUntilInterview = () => {
    const now = new Date();
    const interviewDateTime = new Date(`${booking.bookingDate}T${booking.timeSlot.startTime}`);
    const diffInHours = Math.ceil((interviewDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    return diffInHours;
  };

  // キャンセルタイプを決定
  const getCancellationType = (): 'advance' | 'same_day' | 'emergency' => {
    const hoursUntil = getTimeUntilInterview();

    if (hoursUntil < 2) {
      return 'emergency';
    } else if (isToday()) {
      return 'same_day';
    } else {
      return 'advance';
    }
  };

  const cancellationType = getCancellationType();
  const hoursUntil = getTimeUntilInterview();

  const handleSubmit = async () => {
    if (!cancellationReason.trim()) {
      alert('キャンセル理由を入力してください。');
      return;
    }

    if (cancellationType === 'emergency' && cancellationReason.trim().length < 10) {
      alert('緊急キャンセルの場合は、詳細な理由を入力してください（10文字以上）。');
      return;
    }

    setIsSubmitting(true);

    try {
      const cancellationRequest: InterviewCancellationRequest = {
        reservationId: booking.id,
        staffId: currentUserId,
        cancellationType,
        cancellationReason: cancellationReason.trim(),
        requestedBy: currentUserId,
        requestedAt: new Date().toISOString(),
        contactMethod
      };

      await onCancel(cancellationRequest);
      onClose();
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('キャンセル処理でエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyInfo = () => {
    switch (cancellationType) {
      case 'emergency':
        return {
          title: '⚠️ 緊急キャンセル',
          message: '面談開始まで2時間を切っています。緊急対応が必要です。',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800'
        };
      case 'same_day':
        return {
          title: '🚨 当日キャンセル',
          message: '本日の面談をキャンセルします。担当者への連絡が必要です。',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-800'
        };
      default:
        return {
          title: '📝 事前キャンセル',
          message: '面談をキャンセルします。',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-800'
        };
    }
  };

  const urgencyInfo = getUrgencyInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">面談のキャンセル</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 緊急度表示 */}
          <div className={`p-4 rounded-lg border-l-4 ${urgencyInfo.bgColor} ${urgencyInfo.borderColor}`}>
            <h3 className={`font-semibold mb-2 ${urgencyInfo.textColor}`}>
              {urgencyInfo.title}
            </h3>
            <p className={`text-sm ${urgencyInfo.textColor}`}>
              {urgencyInfo.message}
            </p>
            {hoursUntil > 0 && (
              <p className={`text-xs mt-1 ${urgencyInfo.textColor}`}>
                面談開始まで約 {hoursUntil} 時間
              </p>
            )}
          </div>

          {/* 面談情報 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-900">キャンセル対象の面談</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">日時:</span>
                <span className="text-gray-900">
                  {new Date(booking.bookingDate).toLocaleDateString('ja-JP')}
                  {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">種類:</span>
                <span className="text-gray-900">{booking.interviewType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">担当者:</span>
                <span className="text-gray-900">{booking.interviewerName || '調整中'}</span>
              </div>
              {booking.description && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">内容:</span>
                  <span className="text-gray-900">{booking.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* キャンセル理由入力 */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              キャンセル理由 <span className="text-red-500">*</span>
              {cancellationType === 'emergency' && (
                <span className="text-red-600 text-sm ml-2">（詳細な理由を入力してください）</span>
              )}
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder={
                cancellationType === 'emergency'
                  ? '緊急キャンセルの詳細な理由を入力してください（体調不良の詳細、緊急事態の内容など）'
                  : 'キャンセルの理由を入力してください'
              }
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={cancellationType === 'emergency' ? 5 : 3}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {cancellationReason.length} / {cancellationType === 'emergency' ? '10文字以上必須' : '入力済み'}
            </div>
          </div>

          {/* 連絡方法選択 */}
          {(cancellationType === 'same_day' || cancellationType === 'emergency') && (
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                担当者への連絡方法 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={contactMethod === 'phone'}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <span>📞 電話で連絡（推奨）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="in_person"
                    checked={contactMethod === 'in_person'}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <span>🏃 直接訪問して連絡</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={contactMethod === 'email'}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <span>📧 メールで連絡</span>
                </label>
              </div>
            </div>
          )}

          {/* 注意事項 */}
          {cancellationType === 'emergency' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ 緊急キャンセルの注意事項</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• 担当者に直接連絡することを強く推奨します</li>
                <li>• 次回の面談予約が制限される場合があります</li>
                <li>• 緊急時は管理室（内線1234）にもご連絡ください</li>
              </ul>
            </div>
          )}

          {cancellationType === 'same_day' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">📋 当日キャンセルの注意事項</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• 担当者への連絡をお願いします</li>
                <li>• 可能な限り代替日程をご提案ください</li>
                <li>• 頻繁な当日キャンセルは避けてください</li>
              </ul>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            disabled={isSubmitting}
          >
            取り消し
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !cancellationReason.trim()}
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              cancellationType === 'emergency'
                ? 'bg-red-600 hover:bg-red-700'
                : cancellationType === 'same_day'
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '送信中...' : 'キャンセルを確定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCancellationModal;