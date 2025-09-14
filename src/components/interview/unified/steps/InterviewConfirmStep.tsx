import React from 'react';
import { UnifiedInterviewFlowState, SUPPORT_CATEGORIES, REGULAR_TYPES, SPECIAL_TYPES, TIMING_OPTIONS, TIME_SLOTS, WEEKDAYS } from '../../../../types/unifiedInterview';
import { Edit2, AlertCircle } from 'lucide-react';

interface InterviewConfirmStepProps {
  flowState: UnifiedInterviewFlowState;
  onEdit: (step: 1 | 2 | 3 | 4 | 5) => void;
}

const InterviewConfirmStep: React.FC<InterviewConfirmStepProps> = ({
  flowState,
  onEdit
}) => {
  // 面談分類の表示名を取得
  const getClassificationLabel = () => {
    switch (flowState.classification) {
      case 'regular':
        return '定期面談';
      case 'support':
        return 'サポート面談';
      case 'special':
        return '特別面談';
      default:
        return '';
    }
  };

  // 面談種別の表示名を取得
  const getTypeLabel = () => {
    if (flowState.classification === 'regular') {
      return REGULAR_TYPES.find(t => t.id === flowState.type)?.label || '';
    } else if (flowState.classification === 'special') {
      return SPECIAL_TYPES.find(t => t.id === flowState.type)?.label || '';
    } else if (flowState.classification === 'support') {
      switch (flowState.type) {
        case 'career':
          return 'キャリア系面談';
        case 'workplace':
          return '職場環境系面談';
        case 'consultation':
          return '個別相談面談';
        default:
          return '';
      }
    }
    return '';
  };

  // カテゴリの表示名を取得
  const getCategoryLabel = () => {
    if (flowState.category) {
      return SUPPORT_CATEGORIES.find(c => c.id === flowState.category)?.label || '';
    }
    return '';
  };

  // 希望時期の表示名を取得
  const getTimingLabel = () => {
    const timing = TIMING_OPTIONS.find(t => t.value === flowState.preferences?.timing);
    if (timing) {
      if (flowState.preferences?.timing === 'specific' && flowState.preferences?.specificWeek) {
        return `${timing.label}（${flowState.preferences.specificWeek}）`;
      }
      return timing.label;
    }
    return '';
  };

  // 時間帯の表示名を取得
  const getTimeSlotLabel = () => {
    const slot = TIME_SLOTS.find(s => s.value === flowState.preferences?.timeSlot);
    return slot ? `${slot.label}${slot.time ? ` (${slot.time})` : ''}` : '';
  };

  // 曜日の表示名を取得
  const getWeekdaysLabel = () => {
    if (!flowState.preferences?.weekdays || flowState.preferences.weekdays.length === 0) {
      return '指定なし（全曜日OK）';
    }
    return flowState.preferences.weekdays
      .map(day => WEEKDAYS.find(w => w.value === day)?.label)
      .filter(Boolean)
      .join('・');
  };

  // 担当者の表示名を取得
  const getInterviewerLabel = () => {
    switch (flowState.preferences?.interviewer) {
      case 'anyone':
        return '誰でも良い';
      case 'previous':
        return '前回と同じ担当者';
      case 'specific':
        return flowState.preferences?.interviewerId ? `特定の担当者（ID: ${flowState.preferences.interviewerId}）` : '特定の担当者';
      default:
        return '';
    }
  };

  // 場所の表示名を取得
  const getLocationLabel = () => {
    return flowState.preferences?.location === 'inside' ? '所属施設内' : '所属施設外';
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">仮予約として申込みます</p>
            <p>人事部で調整後、1-2営業日以内に本予約確定のご連絡をいたします。</p>
          </div>
        </div>
      </div>

      {/* 面談種別 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">面談種別</h3>
          <button
            onClick={() => onEdit(1)}
            className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span>編集</span>
          </button>
        </div>
        <div className="space-y-2">
          <div className="text-gray-700">
            <span className="font-medium">{getClassificationLabel()}</span>
            {flowState.type && (
              <span className="ml-2">/ {getTypeLabel()}</span>
            )}
          </div>
          {flowState.category && (
            <div className="text-gray-600 text-sm">
              カテゴリ: {getCategoryLabel()}
            </div>
          )}
        </div>
      </div>

      {/* 希望条件 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">希望条件</h3>
          <button
            onClick={() => onEdit(4)}
            className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span>編集</span>
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-sm text-gray-500">希望時期:</span>
              <span className="ml-2 text-gray-700">{getTimingLabel()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">時間帯:</span>
              <span className="ml-2 text-gray-700">{getTimeSlotLabel()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">曜日:</span>
              <span className="ml-2 text-gray-700">{getWeekdaysLabel()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">担当者:</span>
              <span className="ml-2 text-gray-700">{getInterviewerLabel()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">場所:</span>
              <span className="ml-2 text-gray-700">{getLocationLabel()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* その他要望 */}
      {flowState.preferences?.notes && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">その他の要望</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {flowState.preferences.notes}
          </p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="mb-2">• 変更・キャンセルは人事部へご連絡ください</p>
        <p className="mb-2">• 緊急の場合は直接人事部へお電話ください</p>
        <p>• 確定後の日時変更は原則1回までとなります</p>
      </div>
    </div>
  );
};

export default InterviewConfirmStep;