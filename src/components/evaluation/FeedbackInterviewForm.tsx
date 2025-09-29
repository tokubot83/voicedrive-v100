import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, MessageSquare, Send, CheckCircle } from 'lucide-react';

interface FeedbackInterviewFormProps {
  evaluationData: {
    id: string;
    period: string;
    score: number;
    grade: string;
    disclosureDate: string;
  };
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const FeedbackInterviewForm: React.FC<FeedbackInterviewFormProps> = ({
  evaluationData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: 'morning',
    preferredDays: [] as string[],
    preferredLocation: 'meeting_room_a',
    specificInterviewer: '',
    topics: [] as string[],
    additionalNotes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const timeSlots = [
    { value: 'morning', label: '午前（9:00-12:00）', icon: '🌅' },
    { value: 'afternoon', label: '午後（13:00-17:00）', icon: '☀️' },
    { value: 'late_afternoon', label: '夕方（17:00-19:00）', icon: '🌆' },
    { value: 'flexible', label: '調整可能', icon: '🔄' }
  ];

  const weekDays = [
    { value: 'monday', label: '月曜日' },
    { value: 'tuesday', label: '火曜日' },
    { value: 'wednesday', label: '水曜日' },
    { value: 'thursday', label: '木曜日' },
    { value: 'friday', label: '金曜日' }
  ];

  const locations = [
    { value: 'meeting_room_a', label: '会議室A（本館2F）' },
    { value: 'meeting_room_b', label: '会議室B（本館3F）' },
    { value: 'counseling_room', label: 'カウンセリングルーム' },
    { value: 'online', label: 'オンライン面談' },
    { value: 'other', label: 'その他（備考欄に記載）' }
  ];

  const topicOptions = [
    { value: 'score_details', label: '評価スコアの詳細説明' },
    { value: 'improvement_areas', label: '改善すべき点の具体的なアドバイス' },
    { value: 'strengths', label: '強みと良かった点の確認' },
    { value: 'career_plan', label: '今後のキャリアプラン相談' },
    { value: 'skill_development', label: 'スキル開発の方向性' },
    { value: 'team_feedback', label: 'チーム内での評価について' },
    { value: 'appeal_consultation', label: '異議申立の相談' },
    { value: 'other', label: 'その他の相談事項' }
  ];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      evaluationId: evaluationData.id,
      evaluationPeriod: evaluationData.period,
      evaluationScore: evaluationData.score,
      evaluationGrade: evaluationData.grade,
      requestedAt: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(submissionData);
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">予約リクエスト送信完了</h3>
        <p className="text-gray-400 mb-4">
          フィードバック面談の予約リクエストを送信しました。<br />
          担当者から2営業日以内に連絡いたします。
        </p>
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
          <h4 className="text-sm font-medium text-gray-300 mb-2">予約内容</h4>
          <div className="space-y-1 text-sm text-gray-400">
            <p>評価期間: {evaluationData.period}</p>
            <p>希望時間帯: {timeSlots.find(t => t.value === formData.preferredTime)?.label}</p>
            <p>希望場所: {locations.find(l => l.value === formData.preferredLocation)?.label}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          新しい予約を作成
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-400 mb-2">対象評価情報</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>評価期間: {evaluationData.period}</p>
          <p>評価スコア: {evaluationData.score}点 （{evaluationData.grade}）</p>
          <p>開示日: {evaluationData.disclosureDate}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          希望開始日
        </label>
        <input
          type="date"
          value={formData.preferredDate}
          onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          希望時間帯
        </label>
        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => setFormData({...formData, preferredTime: slot.value})}
              className={`p-3 rounded-lg border transition-all ${
                formData.preferredTime === slot.value
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <span className="text-lg mr-2">{slot.icon}</span>
              <span className="text-sm">{slot.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          都合の良い曜日（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {weekDays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => handleDayToggle(day.value)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                formData.preferredDays.includes(day.value)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          希望場所
        </label>
        <select
          value={formData.preferredLocation}
          onChange={(e) => setFormData({...formData, preferredLocation: e.target.value})}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
        >
          {locations.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          希望する面談官（任意）
        </label>
        <input
          type="text"
          value={formData.specificInterviewer}
          onChange={(e) => setFormData({...formData, specificInterviewer: e.target.value})}
          placeholder="特定の面談官を希望する場合は入力"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          相談したい内容（複数選択可）
        </label>
        <div className="space-y-2">
          {topicOptions.map((topic) => (
            <label
              key={topic.value}
              className="flex items-center p-3 bg-gray-800 border border-gray-600 rounded-lg hover:border-gray-500 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={formData.topics.includes(topic.value)}
                onChange={() => handleTopicToggle(topic.value)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-300">{topic.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          その他のご要望（任意）
        </label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
          rows={3}
          placeholder="その他、面談に関するご要望があれば記入してください"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!formData.preferredDate || formData.preferredDays.length === 0}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          予約リクエストを送信
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};

export default FeedbackInterviewForm;