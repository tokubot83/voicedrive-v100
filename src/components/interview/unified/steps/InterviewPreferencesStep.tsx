import React, { useState, useEffect } from 'react';
import {
  InterviewPreferences,
  TIMING_OPTIONS,
  TIME_SLOTS,
  WEEKDAYS
} from '../../../../types/unifiedInterview';
import { Calendar, Clock, User, MapPin } from 'lucide-react';

interface InterviewPreferencesStepProps {
  preferences?: InterviewPreferences;
  onChange: (value: InterviewPreferences) => void;
}

const InterviewPreferencesStep: React.FC<InterviewPreferencesStepProps> = ({
  preferences,
  onChange
}) => {
  const [formData, setFormData] = useState<InterviewPreferences>(
    preferences || {
      timing: 'this_week',
      timeSlot: 'anytime',
      weekdays: [],
      interviewer: 'anyone',
      location: 'inside',
      notes: ''
    }
  );

  const [showSpecificWeek, setShowSpecificWeek] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const handleTimingChange = (value: InterviewPreferences['timing']) => {
    setFormData({ ...formData, timing: value });
    setShowSpecificWeek(value === 'specific');
  };

  const handleWeekdayToggle = (day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri') => {
    const newWeekdays = formData.weekdays || [];
    if (newWeekdays.includes(day)) {
      setFormData({
        ...formData,
        weekdays: newWeekdays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        weekdays: [...newWeekdays, day]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 希望時期 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          希望時期
          <span className="text-red-500 ml-1">*</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIMING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimingChange(option.value as InterviewPreferences['timing'])}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${formData.timing === option.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium">{option.label}</div>
              {option.description && (
                <div className="text-xs text-gray-500 mt-1">
                  {option.description}
                </div>
              )}
            </button>
          ))}
        </div>
        {showSpecificWeek && (
          <div className="mt-4">
            <input
              type="week"
              value={formData.specificWeek || ''}
              onChange={(e) => setFormData({ ...formData, specificWeek: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* 時間帯 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          時間帯
          <span className="text-red-500 ml-1">*</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot.value}
              onClick={() => setFormData({ ...formData, timeSlot: slot.value as InterviewPreferences['timeSlot'] })}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${formData.timeSlot === slot.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-2xl mb-1">{slot.icon}</div>
              <div className="text-sm font-medium">{slot.label}</div>
              {slot.time && (
                <div className="text-xs text-gray-500 mt-1">{slot.time}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 曜日希望 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          曜日希望
          <span className="text-sm text-gray-500 ml-2">（オプション）</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              onClick={() => handleWeekdayToggle(day.value as any)}
              className={`
                px-6 py-3 rounded-lg border-2 transition-all min-w-[60px]
                ${formData.weekdays?.includes(day.value as any)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {day.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          ※選択なしの場合は全曜日OK
        </p>
      </div>

      {/* 担当者希望 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          担当者の希望
          <span className="text-red-500 ml-1">*</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="interviewer"
              value="anyone"
              checked={formData.interviewer === 'anyone'}
              onChange={(e) => setFormData({ ...formData, interviewer: e.target.value as any })}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-gray-700">誰でも良い</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="interviewer"
              value="previous"
              checked={formData.interviewer === 'previous'}
              onChange={(e) => setFormData({ ...formData, interviewer: e.target.value as any })}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-gray-700">前回と同じ担当者</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="interviewer"
              value="specific"
              checked={formData.interviewer === 'specific'}
              onChange={(e) => setFormData({ ...formData, interviewer: e.target.value as any })}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-gray-700">特定の担当者</span>
          </label>
          {formData.interviewer === 'specific' && (
            <div className="ml-7">
              <select
                value={formData.interviewerId || ''}
                onChange={(e) => setFormData({ ...formData, interviewerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">担当者を選択してください</option>
                <option value="INT-001">山田太郎（人事部）</option>
                <option value="INT-002">佐藤花子（人事部）</option>
                <option value="INT-003">鈴木一郎（管理部）</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 面談場所 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          面談場所
          <span className="text-red-500 ml-1">*</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="location"
              value="inside"
              checked={formData.location === 'inside'}
              onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-gray-700">所属施設内</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="location"
              value="outside"
              checked={formData.location === 'outside'}
              onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-gray-700">所属施設外</span>
          </label>
        </div>
      </div>

      {/* その他の要望 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          その他の要望
          <span className="text-sm text-gray-500 ml-2">（オプション）</span>
        </h3>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="面談に関する特別な要望があればお書きください..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-2">
          例：休憩時間中は避けてほしい、夜勤明けの日は避けたい
        </p>
      </div>
    </div>
  );
};

export default InterviewPreferencesStep;