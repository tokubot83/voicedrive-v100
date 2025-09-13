import React, { useState } from 'react';
import { X, Calendar, Clock, User, ChevronRight, AlertCircle } from 'lucide-react';
import { InterviewBooking } from '../../types/interview';
import { InterviewBookingService } from '../../services/InterviewBookingService';

interface RescheduleModalProps {
  booking: InterviewBooking;
  isOpen: boolean;
  onClose: () => void;
  onRescheduleComplete: () => void;
  currentUserId: string;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  isOpen,
  onClose,
  onRescheduleComplete,
  currentUserId
}) => {
  const [step, setStep] = useState<'reason' | 'dates' | 'confirm'>('reason');
  const [reason, setReason] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingService = InterviewBookingService.getInstance();

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

  const canReschedule = () => {
    if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'reschedule_pending') {
      return false;
    }

    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);
    const timeDiff = bookingDate.getTime() - now.getTime();
    const daysUntilBooking = timeDiff / (1000 * 60 * 60 * 24);

    return daysUntilBooking >= 1; // 1日前まで
  };

  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();

    // 明日から14日後まで
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // 平日のみ（月〜金）
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        dates.push(date);
      }
    }

    return dates;
  };

  const handleDateToggle = (date: Date) => {
    const dateKey = date.getTime();
    const isSelected = selectedDates.some(d => d.getTime() === dateKey);

    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.getTime() !== dateKey));
    } else if (selectedDates.length < 3) {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSubmit = async () => {
    if (!canReschedule()) {
      setError('この面談は変更できません');
      return;
    }

    if (!reason.trim()) {
      setError('変更理由を入力してください');
      return;
    }

    if (selectedDates.length === 0) {
      setError('希望日時を選択してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await bookingService.requestReschedule(
        booking.id,
        selectedDates,
        reason,
        currentUserId
      );

      if (response.success) {
        onRescheduleComplete();
        onClose();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('変更リクエスト処理中にエラーが発生しました');
      console.error('Reschedule request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'reason' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          1
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'dates' ? 'bg-blue-600 text-white' : step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
        }`}>
          2
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
        }`}>
          3
        </div>
      </div>
    </div>
  );

  const renderReasonStep = () => (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">変更理由を入力してください</h3>
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          変更理由 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="日時変更が必要な理由を詳しく入力してください"
          className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
        <h4 className="text-blue-400 font-medium mb-2">💡 変更申請について</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• 変更には管理者の承認が必要です</li>
          <li>• 承認結果は通知でお知らせします</li>
          <li>• 緊急の場合は直接担当者までご連絡ください</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={() => setStep('dates')}
          disabled={!reason.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ
        </button>
      </div>
    </div>
  );

  const renderDatesStep = () => (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">希望日時を選択してください（最大3つ）</h3>

      <div className="mb-4">
        <p className="text-gray-300 text-sm">
          選択済み: {selectedDates.length}/3
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 max-h-60 overflow-y-auto">
        {generateAvailableDates().map((date, index) => {
          const isSelected = selectedDates.some(d => d.getTime() === date.getTime());
          const isDisabled = !isSelected && selectedDates.length >= 3;

          return (
            <button
              key={index}
              onClick={() => handleDateToggle(date)}
              disabled={isDisabled}
              className={`
                p-3 rounded-lg text-left transition-colors text-sm
                ${isSelected
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : isDisabled
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-700 text-gray-300 border border-transparent hover:bg-slate-600'
                }
              `}
            >
              <div className="font-medium">{formatDate(date)}</div>
              <div className="text-xs opacity-75">13:40 - 16:50の間</div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep('reason')}
          className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={() => setStep('confirm')}
          disabled={selectedDates.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          確認
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">変更内容を確認してください</h3>

      {/* 現在の予約 */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-2">現在の予約</h4>
        <div className="space-y-1 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(booking.bookingDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(booking.timeSlot)}</span>
          </div>
        </div>
      </div>

      {/* 希望日時 */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-2">希望日時（優先順）</h4>
        <div className="space-y-2">
          {selectedDates.map((date, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <Calendar className="w-4 h-4" />
              <span>{formatDate(date)}</span>
              <span className="text-gray-400">13:40 - 16:50の間</span>
            </div>
          ))}
        </div>
      </div>

      {/* 変更理由 */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-2">変更理由</h4>
        <p className="text-gray-300 text-sm">{reason}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep('dates')}
          className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '送信中...' : '変更申請する'}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white">面談日時変更</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 変更不可の警告 */}
          {!canReschedule() && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">変更不可</span>
              </div>
              <p className="text-red-300 text-sm mt-2">
                面談前日以降、または既に変更申請中・完了・キャンセル済みの面談は変更できません。
              </p>
            </div>
          )}

          {canReschedule() && (
            <>
              {renderStepIndicator()}
              {step === 'reason' && renderReasonStep()}
              {step === 'dates' && renderDatesStep()}
              {step === 'confirm' && renderConfirmStep()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;