import React, { useState } from 'react';
import { Plus, X, Clock, Users, Settings } from 'lucide-react';
import { CreatePollData } from '../types/poll';

interface PollCreatorProps {
  onCreatePoll: (pollData: CreatePollData) => void;
  onCancel: () => void;
  category: 'idea_sharing' | 'casual_discussion' | 'event_planning';
  scope: 'team' | 'department' | 'facility' | 'organization';
}

const PollCreator = ({ onCreatePoll, onCancel, category, scope }: PollCreatorProps) => {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    { text: '', emoji: '' },
    { text: '', emoji: '' }
  ]);
  const [duration, setDuration] = useState(1440); // 1日（分）
  const [showResults, setShowResults] = useState<'afterVote' | 'afterDeadline' | 'always'>('afterVote');
  const [allowMultiple, setAllowMultiple] = useState(false);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, { text: '', emoji: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: 'text' | 'emoji', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const validOptions = options.filter(opt => opt.text.trim().length > 0);
    
    if (question.trim().length === 0) {
      alert('質問を入力してください');
      return;
    }
    
    if (validOptions.length < 2) {
      alert('少なくとも2つの選択肢を入力してください');
      return;
    }

    const pollData: CreatePollData = {
      question: question.trim(),
      description: description.trim() || undefined,
      options: validOptions.map(opt => ({
        text: opt.text.trim(),
        emoji: opt.emoji.trim() || undefined
      })),
      duration,
      allowMultiple,
      showResults,
      category,
      scope
    };

    onCreatePoll(pollData);
  };

  const durationOptions = [
    { value: 30, label: '30分' },
    { value: 60, label: '1時間' },
    { value: 180, label: '3時間' },
    { value: 360, label: '6時間' },
    { value: 720, label: '12時間' },
    { value: 1440, label: '1日' },
    { value: 2880, label: '2日' },
    { value: 4320, label: '3日' },
    { value: 10080, label: '7日' }
  ];

  const categoryInfo = {
    idea_sharing: { label: '💡 アイデア共有', color: 'from-yellow-500 to-orange-500' },
    casual_discussion: { label: '💬 雑談', color: 'from-blue-500 to-blue-600' },
    event_planning: { label: '🎉 イベント企画', color: 'from-purple-500 to-pink-500' }
  };

  const scopeInfo = {
    team: { label: '👥 チーム内', icon: '👥' },
    department: { label: '🏢 部署内', icon: '🏢' },
    facility: { label: '🏥 施設内', icon: '🏥' },
    organization: { label: '🌐 法人内', icon: '🌐' }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">投票を作成</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* カテゴリと公開範囲の表示 */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
        <span className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${categoryInfo[category]?.color || 'from-gray-500 to-gray-600'}`}>
          {categoryInfo[category]?.label || '📊 投票'}
        </span>
        <span className="text-gray-400">•</span>
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <span>{scopeInfo[scope]?.icon || '👥'}</span>
          <span>{scopeInfo[scope]?.label || '範囲未設定'}</span>
        </span>
      </div>

      {/* 質問入力 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          質問 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例: 今年の忘年会、どこでやりたい？"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={100}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {question.length}/100
        </div>
      </div>

      {/* 説明文（オプション） */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          説明文（オプション）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="投票の詳細や背景を説明してください"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={2}
          maxLength={200}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {description.length}/200
        </div>
      </div>

      {/* 選択肢 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          選択肢 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={option.emoji}
                  onChange={(e) => updateOption(index, 'emoji', e.target.value)}
                  placeholder="😊"
                  className="w-16 p-3 border border-gray-300 rounded-lg text-center"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder={`選択肢 ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={50}
                />
              </div>
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {options.length < 4 && (
          <button
            onClick={addOption}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>選択肢を追加</span>
          </button>
        )}
      </div>

      {/* 設定 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">投票設定</span>
        </div>
        
        <div className="space-y-4">
          {/* 期間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投票期間
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 結果表示 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結果表示タイミング
            </label>
            <select
              value={showResults}
              onChange={(e) => setShowResults(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="afterVote">投票後に表示</option>
              <option value="afterDeadline">期間終了後に表示</option>
              <option value="always">常に表示</option>
            </select>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          投票を作成
        </button>
      </div>
    </div>
  );
};

export default PollCreator;