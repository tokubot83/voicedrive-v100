import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, MapPin, Users, DollarSign, AlertCircle } from 'lucide-react';
import { CreateEventData, EventType, EventVisibility } from '../types/event';

interface EventCreatorProps {
  onCreateEvent: (eventData: CreateEventData) => void;
  onCancel: () => void;
  visibility: EventVisibility;
}

const EventCreator = ({ onCreateEvent, onCancel, visibility }: EventCreatorProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>(EventType.SOCIAL);
  const [proposedDates, setProposedDates] = useState([
    { date: '', startTime: '', endTime: '' }
  ]);
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(undefined);
  const [venue, setVenue] = useState({ name: '', address: '' });
  const [cost, setCost] = useState<number | undefined>(undefined);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [allowDateVoting, setAllowDateVoting] = useState(true);
  const [allowParticipantComments, setAllowParticipantComments] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [tags, setTags] = useState<string[]>(['']);

  const eventTypes = [
    { value: EventType.SOCIAL, label: '🍻 懇親会・飲み会', color: 'bg-pink-100 text-pink-800' },
    { value: EventType.TRAINING, label: '📚 研修・勉強会', color: 'bg-blue-100 text-blue-800' },
    { value: EventType.MEETING, label: '💼 会議・打ち合わせ', color: 'bg-gray-100 text-gray-800' },
    { value: EventType.SPORTS, label: '⚽ スポーツ・運動', color: 'bg-green-100 text-green-800' },
    { value: EventType.CULTURE, label: '🎨 文化・趣味', color: 'bg-purple-100 text-purple-800' },
    { value: EventType.VOLUNTEER, label: '🤝 ボランティア', color: 'bg-yellow-100 text-yellow-800' },
    { value: EventType.OTHER, label: '📋 その他', color: 'bg-gray-100 text-gray-800' }
  ];

  const addProposedDate = () => {
    setProposedDates([...proposedDates, { date: '', startTime: '', endTime: '' }]);
  };

  const removeProposedDate = (index: number) => {
    if (proposedDates.length > 1) {
      setProposedDates(proposedDates.filter((_, i) => i !== index));
    }
  };

  const updateProposedDate = (index: number, field: string, value: string) => {
    const newDates = [...proposedDates];
    newDates[index] = { ...newDates[index], [field]: value };
    setProposedDates(newDates);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('イベント名を入力してください');
      return;
    }

    const validDates = proposedDates.filter(d => d.date && d.startTime && d.endTime);
    if (validDates.length === 0) {
      alert('少なくとも1つの日程を入力してください');
      return;
    }

    const eventData: CreateEventData = {
      title: title.trim(),
      description: description.trim(),
      type: eventType,
      proposedDates: validDates,
      maxParticipants,
      venue: venue.name.trim() ? {
        name: venue.name.trim(),
        address: venue.address.trim() || undefined
      } : undefined,
      cost,
      requirements: requirements.filter(r => r.trim()).map(r => r.trim()),
      registrationDeadline: registrationDeadline || undefined,
      visibility,
      allowDateVoting,
      allowParticipantComments,
      sendReminders,
      tags: tags.filter(t => t.trim()).map(t => t.trim())
    };

    onCreateEvent(eventData);
  };

  const selectedEventType = eventTypes.find(t => t.value === eventType);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">イベントを企画</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 基本情報 */}
      <div className="space-y-6">
        {/* イベント名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            イベント名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 新年度歓迎会"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={100}
          />
        </div>

        {/* イベントタイプ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            イベントタイプ
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setEventType(type.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  eventType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            詳細説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="イベントの詳細、目的、注意事項などを記載してください"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {description.length}/500
          </div>
        </div>

        {/* 候補日程 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            候補日程 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {proposedDates.map((date, index) => (
              <div key={index} className="flex gap-3 items-center">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={date.date}
                    onChange={(e) => updateProposedDate(index, 'date', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="time"
                    value={date.startTime}
                    onChange={(e) => updateProposedDate(index, 'startTime', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="time"
                    value={date.endTime}
                    onChange={(e) => updateProposedDate(index, 'endTime', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {proposedDates.length > 1 && (
                  <button
                    onClick={() => removeProposedDate(index)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addProposedDate}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>日程を追加</span>
          </button>
        </div>

        {/* 会場情報 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <MapPin className="w-4 h-4 inline mr-1" />
            会場情報
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={venue.name}
              onChange={(e) => setVenue({ ...venue, name: e.target.value })}
              placeholder="会場名（例: 会議室A、居酒屋○○）"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={venue.address}
              onChange={(e) => setVenue({ ...venue, address: e.target.value })}
              placeholder="住所・詳細（任意）"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 参加者・費用設定 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              定員（任意）
            </label>
            <input
              type="number"
              value={maxParticipants || ''}
              onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="定員なしの場合は空欄"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              費用（円）
            </label>
            <input
              type="number"
              value={cost || ''}
              onChange={(e) => setCost(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="無料の場合は空欄"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* 申込締切 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            申込締切日（任意）
          </label>
          <input
            type="date"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 参加条件・注意事項 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            参加条件・注意事項
          </label>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="例: 社員証持参、動きやすい服装"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeRequirement(index)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addRequirement}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>条件を追加</span>
          </button>
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            タグ（検索用）
          </label>
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  placeholder="例: 新人歓迎、部活動、食事会"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeTag(index)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addTag}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>タグを追加</span>
          </button>
        </div>

        {/* 機能設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">機能設定</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allowDateVoting}
                onChange={(e) => setAllowDateVoting(e.target.checked)}
                className="mr-3 rounded"
              />
              <span className="text-sm text-gray-700">日程調整機能を有効にする</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allowParticipantComments}
                onChange={(e) => setAllowParticipantComments(e.target.checked)}
                className="mr-3 rounded"
              />
              <span className="text-sm text-gray-700">参加者のコメントを許可する</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendReminders}
                onChange={(e) => setSendReminders(e.target.checked)}
                className="mr-3 rounded"
              />
              <span className="text-sm text-gray-700">リマインダー通知を送信する</span>
            </label>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          イベントを作成
        </button>
      </div>
    </div>
  );
};

export default EventCreator;