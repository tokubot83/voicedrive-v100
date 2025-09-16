import React, { useState } from 'react';
import { X, Calendar, Clock, User, MessageSquare, Send, AlertCircle } from 'lucide-react';

interface UnsatisfiedOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAdjustment: (adjustmentData: AdjustmentRequest) => Promise<void>;
  currentProposals: {
    voicedriveRequestId: string;
    proposals: Array<{
      id: string;
      schedule: {
        date: string;
        time: string;
        duration: number;
        location: string;
        format: string;
      };
      interviewer: {
        name: string;
        title: string;
        department: string;
      };
    }>;
  };
}

interface AdjustmentRequest {
  voicedriveRequestId: string;
  reason: string;
  adjustmentType: 'schedule_change' | 'interviewer_change' | 'location_change' | 'format_change' | 'other';
  preferredSchedule?: {
    dates: string[];
    times: string[];
    duration?: number;
  };
  preferredInterviewer?: {
    department?: string;
    specialties?: string[];
    experience?: string;
  };
  preferredLocation?: {
    location?: string;
    format?: 'face_to_face' | 'online' | 'phone';
  };
  additionalRequests?: string;
  urgency: 'low' | 'medium' | 'high';
}

const UnsatisfiedOptionsModal: React.FC<UnsatisfiedOptionsModalProps> = ({
  isOpen,
  onClose,
  onSubmitAdjustment,
  currentProposals
}) => {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentRequest['adjustmentType']>('schedule_change');
  const [reason, setReason] = useState('');
  const [preferredDates, setPreferredDates] = useState<string[]>(['']);
  const [preferredTimes, setPreferredTimes] = useState<string[]>(['']);
  const [preferredDuration, setPreferredDuration] = useState<number>(45);
  const [preferredDepartment, setPreferredDepartment] = useState('');
  const [preferredSpecialties, setPreferredSpecialties] = useState<string[]>(['']);
  const [preferredExperience, setPreferredExperience] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferredFormat, setPreferredFormat] = useState<'face_to_face' | 'online' | 'phone'>('face_to_face');
  const [additionalRequests, setAdditionalRequests] = useState('');
  const [urgency, setUrgency] = useState<AdjustmentRequest['urgency']>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateField = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeField = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('変更理由を入力してください');
      return;
    }

    const adjustmentData: AdjustmentRequest = {
      voicedriveRequestId: currentProposals.voicedriveRequestId,
      reason: reason.trim(),
      adjustmentType,
      urgency
    };

    // 調整タイプに応じてデータを設定
    if (adjustmentType === 'schedule_change') {
      adjustmentData.preferredSchedule = {
        dates: preferredDates.filter(d => d.trim()),
        times: preferredTimes.filter(t => t.trim()),
        duration: preferredDuration
      };
    }

    if (adjustmentType === 'interviewer_change') {
      adjustmentData.preferredInterviewer = {
        department: preferredDepartment || undefined,
        specialties: preferredSpecialties.filter(s => s.trim()),
        experience: preferredExperience || undefined
      };
    }

    if (adjustmentType === 'location_change' || adjustmentType === 'format_change') {
      adjustmentData.preferredLocation = {
        location: preferredLocation || undefined,
        format: preferredFormat
      };
    }

    if (additionalRequests.trim()) {
      adjustmentData.additionalRequests = additionalRequests.trim();
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitAdjustment(adjustmentData);
      onClose();
    } catch (err) {
      console.error('Failed to submit adjustment:', err);
      setError('調整依頼の送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">条件変更依頼</h2>
              <p className="text-purple-100">ご希望に合わせて新しい提案を作成します</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* 現在の提案サマリー */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">現在の提案内容</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentProposals.proposals.map((proposal, index) => (
                <div key={proposal.id} className="bg-white rounded-lg p-3 text-sm">
                  <div className="font-medium text-gray-800 mb-1">提案 {index + 1}</div>
                  <div className="text-gray-600">
                    <div>{proposal.schedule.date} {proposal.schedule.time}</div>
                    <div>{proposal.interviewer.name} ({proposal.interviewer.department})</div>
                    <div>{proposal.schedule.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* 変更理由 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              変更理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例：提案された時間はすべて勤務時間と重なるため、休憩時間での面談を希望します"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              required
            />
          </div>

          {/* 調整タイプ選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">調整希望内容</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'schedule_change', label: '⏰ 日時変更', icon: Calendar },
                { value: 'interviewer_change', label: '👤 面談者変更', icon: User },
                { value: 'location_change', label: '📍 場所変更', icon: MessageSquare },
                { value: 'format_change', label: '💻 方式変更', icon: MessageSquare },
                { value: 'other', label: '📝 その他', icon: MessageSquare }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAdjustmentType(option.value as AdjustmentRequest['adjustmentType'])}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 text-sm
                    ${adjustmentType === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 詳細設定 */}
          {adjustmentType === 'schedule_change' && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                希望日時の設定
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望日程</label>
                  {preferredDates.map((date, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => updateField(setPreferredDates, index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      {preferredDates.length > 1 && (
                        <button
                          onClick={() => removeField(setPreferredDates, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addField(setPreferredDates)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 日程を追加
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望時間</label>
                  {preferredTimes.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateField(setPreferredTimes, index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      {preferredTimes.length > 1 && (
                        <button
                          onClick={() => removeField(setPreferredTimes, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addField(setPreferredTimes)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 時間を追加
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">希望時間（分）</label>
                <select
                  value={preferredDuration}
                  onChange={(e) => setPreferredDuration(Number(e.target.value))}
                  className="w-32 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                >
                  <option value={30}>30分</option>
                  <option value={45}>45分</option>
                  <option value={60}>60分</option>
                  <option value={90}>90分</option>
                </select>
              </div>
            </div>
          )}

          {adjustmentType === 'interviewer_change' && (
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                希望面談者の設定
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望部門</label>
                  <input
                    type="text"
                    value={preferredDepartment}
                    onChange={(e) => setPreferredDepartment(e.target.value)}
                    placeholder="例：人事部、看護部、事務部"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望専門分野</label>
                  {preferredSpecialties.map((specialty, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => updateField(setPreferredSpecialties, index, e.target.value)}
                        placeholder="例：キャリア相談、メンタルヘルス、労務相談"
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      {preferredSpecialties.length > 1 && (
                        <button
                          onClick={() => removeField(setPreferredSpecialties, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addField(setPreferredSpecialties)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 専門分野を追加
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望経験レベル</label>
                  <input
                    type="text"
                    value={preferredExperience}
                    onChange={(e) => setPreferredExperience(e.target.value)}
                    placeholder="例：管理職経験者、同世代、若手指導経験豊富"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {(adjustmentType === 'location_change' || adjustmentType === 'format_change') && (
            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                場所・方式の設定
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望場所</label>
                  <input
                    type="text"
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    placeholder="例：相談室A、会議室、外部会場"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望方式</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'face_to_face', label: '対面', emoji: '👥' },
                      { value: 'online', label: 'オンライン', emoji: '💻' },
                      { value: 'phone', label: '電話', emoji: '📞' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPreferredFormat(option.value as typeof preferredFormat)}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200
                          ${preferredFormat === option.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700'
                          }
                        `}
                      >
                        <div className="text-2xl mb-1">{option.emoji}</div>
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 追加要望 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              その他のご要望（任意）
            </label>
            <textarea
              value={additionalRequests}
              onChange={(e) => setAdditionalRequests(e.target.value)}
              placeholder="例：資料を事前に確認したい、同僚と一緒に面談したい、など"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
            />
          </div>

          {/* 緊急度 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">緊急度</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low', label: '通常', color: 'blue', desc: '1-2週間以内' },
                { value: 'medium', label: '重要', color: 'yellow', desc: '数日以内' },
                { value: 'high', label: '緊急', color: 'red', desc: '24時間以内' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUrgency(option.value as typeof urgency)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200
                    ${urgency === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={submitting}
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !reason.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <Send className="w-4 h-4" />
              <span>{submitting ? '送信中...' : '調整依頼を送信'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsatisfiedOptionsModal;