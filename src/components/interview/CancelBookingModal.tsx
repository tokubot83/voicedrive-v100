import React, { useState } from 'react';
import { X, AlertTriangle, Clock, Calendar, User } from 'lucide-react';
import { InterviewBooking, CancellationReason } from '../../types/interview';
import { InterviewBookingService } from '../../services/InterviewBookingService';

interface CancelBookingModalProps {
  booking: InterviewBooking;
  isOpen: boolean;
  onClose: () => void;
  onCancelComplete: () => void;
  currentUserId: string;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCancelComplete,
  currentUserId
}) => {
  const [selectedReason, setSelectedReason] = useState<CancellationReason>('other');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingService = InterviewBookingService.getInstance();

  const cancellationReasons = [
    { value: 'emergency', label: '緊急事態のため', icon: '🚨' },
    { value: 'illness', label: '体調不良のため', icon: '😷' },
    { value: 'work_conflict', label: '業務都合のため', icon: '💼' },
    { value: 'schedule_change', label: 'スケジュール変更のため', icon: '📅' },
    { value: 'personal', label: '個人的事情のため', icon: '👤' },
    { value: 'other', label: 'その他の理由', icon: '📝' }
  ] as const;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const getTimeUntilInterview = () => {
    const now = new Date();
    const bookingTime = new Date(booking.bookingDate);
    const [hours, minutes] = booking.timeSlot.startTime.split(':').map(Number);
    bookingTime.setHours(hours, minutes, 0, 0);

    const timeDiff = bookingTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
    const daysUntil = Math.floor(hoursUntil / 24);

    if (daysUntil > 0) {
      return `${daysUntil}日${hoursUntil % 24}時間後`;
    } else if (hoursUntil > 0) {
      return `${hoursUntil}時間後`;
    } else {
      return '間もなく';
    }
  };

  const canCancel = () => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }

    const now = new Date();
    const bookingTime = new Date(booking.bookingDate);
    const [hours, minutes] = booking.timeSlot.startTime.split(':').map(Number);
    bookingTime.setHours(hours, minutes, 0, 0);

    const timeDiff = bookingTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDiff / (1000 * 60 * 60);

    return hoursUntilBooking >= 2; // 2時間前まで
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canCancel()) {
      setError('この面談はキャンセルできません');
      return;
    }

    if (selectedReason === 'other' && !customReason.trim()) {
      setError('キャンセル理由を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await bookingService.cancelBooking(
        booking.id,
        selectedReason,
        selectedReason === 'other' ? customReason : undefined,
        currentUserId
      );

      if (response.success) {
        onCancelComplete();
        onClose();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('キャンセル処理中にエラーが発生しました');
      console.error('Cancel booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">面談キャンセル</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 面談情報 */}
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">キャンセル対象の面談</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(booking.bookingDate)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{formatTime(booking.timeSlot)}</span>
                <span className="text-orange-400">（{getTimeUntilInterview()}）</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <User className="w-4 h-4" />
                <span>{booking.interviewType}</span>
              </div>
              {booking.interviewerName && (
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="w-4 h-4 text-center">👤</span>
                  <span>担当: {booking.interviewerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* キャンセル不可の警告 */}
          {!canCancel() && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">キャンセル不可</span>
              </div>
              <p className="text-red-300 text-sm mt-2">
                面談開始2時間前以降、または既に完了・キャンセル済みの面談はキャンセルできません。
              </p>
            </div>
          )}

          {/* キャンセル理由選択 */}
          {canCancel() && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">
                  キャンセル理由を選択してください <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {cancellationReasons.map((reason) => (
                    <label
                      key={reason.value}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                        ${selectedReason === reason.value
                          ? 'bg-blue-600/20 border border-blue-500'
                          : 'bg-slate-700 border border-transparent hover:bg-slate-600'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="cancellationReason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value as CancellationReason)}
                        className="sr-only"
                      />
                      <span className="text-xl">{reason.icon}</span>
                      <span className="text-white">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* カスタム理由入力 */}
              {selectedReason === 'other' && (
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">
                    詳細な理由 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="キャンセルの理由を詳しく入力してください"
                    className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              )}

              {/* エラーメッセージ */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* 注意事項 */}
              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
                <h4 className="text-yellow-400 font-medium mb-2">⚠️ キャンセル時の注意事項</h4>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• キャンセル後、同じ時間枠での再予約はできません</li>
                  <li>• 面談者および関係者に自動で通知されます</li>
                  <li>• 必要に応じて代替日時を提案させていただきます</li>
                  <li>• 緊急性の高い場合は直接担当者までご連絡ください</li>
                </ul>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !canCancel()}
                  className={`
                    flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                    ${canCancel()
                      ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isSubmitting ? '処理中...' : 'キャンセルする'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;