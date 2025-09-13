import React, { useState } from 'react';
import { EnhancedInterviewRequest } from '../../services/AssistedBookingService';

interface EnhancedInterviewRequestFormProps {
  employeeId: string;
  employeeName: string;
  department: string;
  onSubmit: (request: EnhancedInterviewRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EnhancedInterviewRequestForm: React.FC<EnhancedInterviewRequestFormProps> = ({
  employeeId,
  employeeName,
  department,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Partial<EnhancedInterviewRequest>>({
    staffId: employeeId,
    requestType: 'regular',
    urgencyLevel: 'next_week',
    timePreference: {
      morning: false,
      afternoon: true,
      evening: false,
      anytime: false
    },
    interviewerPreference: {
      anyAvailable: true,
      genderPreference: 'no_preference'
    },
    minDuration: 30,
    maxDuration: 60,
    topic: '',
    details: '',
    category: 'general'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const newErrors: Record<string, string> = {};

    if (!formData.topic?.trim()) {
      newErrors.topic = '相談したい内容を入力してください';
    }

    if (!formData.details?.trim()) {
      newErrors.details = '詳細な内容を入力してください';
    }

    const timeSelected = Object.values(formData.timePreference || {}).some(Boolean);
    if (!timeSelected) {
      newErrors.timePreference = '希望時間帯を少なくとも1つ選択してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData as EnhancedInterviewRequest);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleTimePreferenceChange = (timeSlot: keyof EnhancedInterviewRequest['timePreference']) => {
    setFormData(prev => ({
      ...prev,
      timePreference: {
        ...prev.timePreference!,
        [timeSlot]: !prev.timePreference![timeSlot],
        // "いつでも可"選択時は他を無効化
        ...(timeSlot === 'anytime' && !prev.timePreference!.anytime ? {
          morning: false,
          afternoon: false,
          evening: false
        } : {}),
        // 他選択時は"いつでも可"を無効化
        ...(timeSlot !== 'anytime' ? { anytime: false } : {})
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 面談タイプに応じたカテゴリ選択肢を取得
  const getCategoryOptions = () => {
    const requestType = formData.requestType;

    if (requestType === 'regular') {
      return [
        { value: 'performance', label: '業績・評価について' },
        { value: 'goal_setting', label: '目標設定・進捗確認' },
        { value: 'skill_dev', label: 'スキル向上・研修' },
        { value: 'general_check', label: '一般的な状況確認' }
      ];
    } else if (requestType === 'support') {
      return [
        { value: 'workplace_stress', label: '職場でのストレス' },
        { value: 'interpersonal', label: '人間関係の悩み' },
        { value: 'workload', label: '業務負荷・時間管理' },
        { value: 'mental_health', label: 'メンタルヘルス' },
        { value: 'work_life_balance', label: 'ワークライフバランス' },
        { value: 'personal_issues', label: '個人的な問題' }
      ];
    } else if (requestType === 'special') {
      return [
        { value: 'incident_followup', label: 'インシデント後面談' },
        { value: 'harassment', label: 'ハラスメント相談' },
        { value: 'urgent_issue', label: '緊急の問題・トラブル' },
        { value: 'disciplinary', label: '人事・処分に関する相談' },
        { value: 'resignation', label: '退職・転職相談' },
        { value: 'conflict', label: '深刻な対人トラブル' },
        { value: 'legal_matter', label: '法的事項・コンプライアンス' },
        { value: 'return_to_work', label: '復職面談' },
        { value: 'performance_issue', label: '業績改善面談' }
      ];
    }

    return [{ value: 'general', label: '一般的な相談' }];
  };

  // Step 1: 基本情報・相談内容
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">👤 基本情報</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong>お名前:</strong> {employeeName}</p>
          <p><strong>所属:</strong> {department}</p>
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          面談の種類 <span className="text-red-400">*</span>
        </label>
        <div className="space-y-2">
          {[
            { id: 'regular', label: '定期面談', description: '通常の定期的な面談・業績評価' },
            { id: 'support', label: 'サポート面談', description: '悩み相談・支援が必要な場合' },
            { id: 'special', label: '特別面談', description: '緊急・特別な事情がある場合' }
          ].map(type => (
            <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="requestType"
                value={type.id}
                checked={formData.requestType === type.id}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  requestType: e.target.value as any,
                  category: '' // 面談タイプ変更時にカテゴリをリセット
                }))}
                className="mt-1"
              />
              <div>
                <div className="text-white font-medium">{type.label}</div>
                <div className="text-gray-400 text-sm">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          相談したい内容 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.topic || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
          placeholder="例: キャリアプランについて相談したい"
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.topic && <p className="text-red-400 text-sm mt-1">{errors.topic}</p>}
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          詳細な内容・背景 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.details || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
          placeholder="どのようなことで悩んでいるか、どんな支援が必要かなど、詳しく教えてください"
          rows={4}
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.details && <p className="text-red-400 text-sm mt-1">{errors.details}</p>}
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          相談カテゴリ <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.category || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500"
          required
        >
          <option value="">選択してください</option>
          {getCategoryOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-gray-400 text-sm mt-1">
          面談の種類に応じた相談内容を選択してください
        </p>
      </div>
    </div>
  );

  // Step 2: 時期・時間の希望
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-medium mb-3">
          希望時期 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'urgent', label: '至急', icon: '🚨', description: '緊急' },
            { id: 'this_week', label: '今週中', icon: '📅', description: '1週間以内' },
            { id: 'next_week', label: '来週中', icon: '📆', description: '2週間以内' },
            { id: 'this_month', label: '今月中', icon: '🗓️', description: '1ヶ月以内' }
          ].map(urgency => (
            <label
              key={urgency.id}
              className={`
                flex flex-col items-center p-3 rounded-lg cursor-pointer border-2 transition-all
                ${formData.urgencyLevel === urgency.id
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                  : 'border-slate-600 bg-slate-700 text-gray-300 hover:border-slate-500'
                }
              `}
            >
              <input
                type="radio"
                name="urgencyLevel"
                value={urgency.id}
                checked={formData.urgencyLevel === urgency.id}
                onChange={(e) => setFormData(prev => ({ ...prev, urgencyLevel: e.target.value as any }))}
                className="sr-only"
              />
              <span className="text-2xl mb-1">{urgency.icon}</span>
              <span className="font-medium text-sm text-center">{urgency.label}</span>
              <span className="text-xs opacity-75">{urgency.description}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-3">
          希望時間帯 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'morning', label: '午前', icon: '🌅', time: '9:00-12:00' },
            { id: 'afternoon', label: '午後', icon: '☀️', time: '13:00-17:00' },
            { id: 'evening', label: '夕方', icon: '🌆', time: '17:30-19:00' },
            { id: 'anytime', label: 'いつでも', icon: '🕐', time: 'お任せ' }
          ].map(time => (
            <label
              key={time.id}
              className={`
                flex flex-col items-center p-3 rounded-lg cursor-pointer border-2 transition-all
                ${formData.timePreference![time.id as keyof typeof formData.timePreference]
                  ? 'border-green-500 bg-green-600/20 text-green-300'
                  : 'border-slate-600 bg-slate-700 text-gray-300 hover:border-slate-500'
                }
              `}
            >
              <input
                type="checkbox"
                checked={formData.timePreference![time.id as keyof typeof formData.timePreference]}
                onChange={() => handleTimePreferenceChange(time.id as keyof typeof formData.timePreference)}
                className="sr-only"
              />
              <span className="text-2xl mb-1">{time.icon}</span>
              <span className="font-medium text-sm">{time.label}</span>
              <span className="text-xs opacity-75">{time.time}</span>
            </label>
          ))}
        </div>
        {errors.timePreference && <p className="text-red-400 text-sm mt-2">{errors.timePreference}</p>}
      </div>

      <div>
        <label className="block text-white font-medium mb-3">面談時間の希望</label>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">最短時間</label>
            <select
              value={formData.minDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, minDuration: Number(e.target.value) }))}
              className="bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
            >
              {[15, 30, 45, 60].map(duration => (
                <option key={duration} value={duration}>{duration}分</option>
              ))}
            </select>
          </div>
          <span className="text-gray-400">〜</span>
          <div>
            <label className="block text-sm text-gray-400 mb-1">最長時間</label>
            <select
              value={formData.maxDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: Number(e.target.value) }))}
              className="bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
            >
              {[30, 45, 60, 90].map(duration => (
                <option key={duration} value={duration}>{duration}分</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: 担当者の希望
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-medium mb-3">担当者の希望</label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="interviewerChoice"
              checked={formData.interviewerPreference?.anyAvailable}
              onChange={() => setFormData(prev => ({
                ...prev,
                interviewerPreference: {
                  ...prev.interviewerPreference!,
                  anyAvailable: true,
                  specificPerson: undefined
                }
              }))}
            />
            <div>
              <div className="text-white font-medium">おまかせ（推奨）</div>
              <div className="text-gray-400 text-sm">AIが最適な担当者を選びます</div>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="interviewerChoice"
              checked={!formData.interviewerPreference?.anyAvailable}
              onChange={() => setFormData(prev => ({
                ...prev,
                interviewerPreference: {
                  ...prev.interviewerPreference!,
                  anyAvailable: false
                }
              }))}
            />
            <div>
              <div className="text-white font-medium">詳細な希望を指定</div>
              <div className="text-gray-400 text-sm">担当者の条件を細かく指定します</div>
            </div>
          </label>
        </div>
      </div>

      {!formData.interviewerPreference?.anyAvailable && (
        <div className="space-y-4 ml-6 pl-4 border-l-2 border-slate-600">
          <div>
            <label className="block text-white font-medium mb-2">専門分野の希望</label>
            <select
              value={formData.interviewerPreference?.specialtyPreference || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                interviewerPreference: {
                  ...prev.interviewerPreference!,
                  specialtyPreference: e.target.value
                }
              }))}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600"
            >
              <option value="">指定なし</option>
              <option value="career_support">キャリア支援・相談</option>
              <option value="workplace_issues">職場環境・人間関係</option>
              <option value="workload_management">業務負荷・ストレス管理</option>
              <option value="education_training">教育・研修</option>
              <option value="mental_health">メンタルヘルス</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">性別の希望</label>
            <div className="space-y-2">
              {[
                { id: 'no_preference', label: '指定なし' },
                { id: 'male', label: '男性の担当者' },
                { id: 'female', label: '女性の担当者' }
              ].map(gender => (
                <label key={gender.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="genderPreference"
                    value={gender.id}
                    checked={formData.interviewerPreference?.genderPreference === gender.id}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      interviewerPreference: {
                        ...prev.interviewerPreference!,
                        genderPreference: e.target.value as any
                      }
                    }))}
                  />
                  <span className="text-white">{gender.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-white font-medium mb-2">その他のご要望</label>
        <textarea
          value={formData.additionalRequests || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, additionalRequests: e.target.value }))}
          placeholder="特別な配慮や要望があれば記入してください（任意）"
          rows={3}
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full">
      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🎯 おまかせ予約</h2>
        <p className="text-gray-400 text-sm">
          あなたの希望を詳しくお聞きして、最適な面談をご提案します
        </p>
      </div>

      {/* プログレス */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-gray-400'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>基本情報</span>
          <span>時期・時間</span>
          <span>担当者希望</span>
        </div>
        <div className="w-full bg-slate-600 h-1 rounded-full mt-2">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* フォーム内容 */}
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* ボタン */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-600">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                ← 戻る
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              キャンセル
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                次へ →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '送信中...' : '🎯 おまかせ予約を申し込む'}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* 注意事項 */}
      <div className="mt-6 bg-slate-700 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-blue-400 mr-3 text-lg">💡</span>
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">おまかせ予約について</p>
            <ul className="space-y-1 text-xs">
              <li>• 送信後、人事部にて最適な担当者・時間を検討いたします</li>
              <li>• 通常3-5分で候補をご提案します</li>
              <li>• 最終的な選択はあなたが決定できます</li>
              <li>• 緊急の場合は人事部（内線:1234）まで直接ご連絡ください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInterviewRequestForm;