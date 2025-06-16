import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, DollarSign, MessageCircle, Check, X, AlertCircle } from 'lucide-react';
import { Event, Participant, ParticipantStatus, DateResponse, ProposedDate } from '../types/event';
import { Post } from '../types';

interface EventPostProps {
  post: Post;
  event: Event;
  currentUserId: string;
  onJoinEvent?: (eventId: string, note?: string) => void;
  onLeaveEvent?: (eventId: string) => void;
  onVoteDate?: (eventId: string, proposedDateId: string, response: DateResponse) => void;
  onComment?: () => void;
}

const EventPost = ({ 
  post, 
  event, 
  currentUserId, 
  onJoinEvent, 
  onLeaveEvent, 
  onVoteDate, 
  onComment 
}: EventPostProps) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinNote, setJoinNote] = useState('');
  const [showDateVoting, setShowDateVoting] = useState(false);

  const currentParticipant = event.participants.find(p => p.user.id === currentUserId);
  const isParticipating = currentParticipant?.status === ParticipantStatus.CONFIRMED;
  const isWaitlisted = event.waitlist.some(p => p.user.id === currentUserId);
  const isFull = event.maxParticipants ? event.participants.length >= event.maxParticipants : false;

  const eventTypeInfo = {
    social: { icon: '🍻', label: '懇親会・飲み会', color: 'bg-pink-100 text-pink-800' },
    training: { icon: '📚', label: '研修・勉強会', color: 'bg-blue-100 text-blue-800' },
    meeting: { icon: '💼', label: '会議・打ち合わせ', color: 'bg-gray-100 text-gray-800' },
    sports: { icon: '⚽', label: 'スポーツ・運動', color: 'bg-green-100 text-green-800' },
    culture: { icon: '🎨', label: '文化・趣味', color: 'bg-purple-100 text-purple-800' },
    volunteer: { icon: '🤝', label: 'ボランティア', color: 'bg-yellow-100 text-yellow-800' },
    other: { icon: '📋', label: 'その他', color: 'bg-gray-100 text-gray-800' }
  };

  const statusInfo = {
    planning: { icon: '📝', label: '企画中', color: 'text-gray-600' },
    date_voting: { icon: '🗳️', label: '日程調整中', color: 'text-blue-600' },
    recruiting: { icon: '📢', label: '参加者募集中', color: 'text-green-600' },
    confirmed: { icon: '✅', label: '開催決定', color: 'text-purple-600' },
    ongoing: { icon: '🔄', label: '開催中', color: 'text-orange-600' },
    completed: { icon: '✓', label: '終了', color: 'text-gray-500' },
    cancelled: { icon: '❌', label: '中止', color: 'text-red-600' }
  };

  const typeConfig = eventTypeInfo[event.type] || eventTypeInfo.other;
  const statusConfig = statusInfo[event.status] || statusInfo.planning;

  const handleJoin = () => {
    if (isFull && !isWaitlisted) {
      // キャンセル待ちに追加
      onJoinEvent?.(event.id, joinNote);
    } else {
      onJoinEvent?.(event.id, joinNote);
    }
    setShowJoinForm(false);
    setJoinNote('');
  };

  const getDateVotingResults = (proposedDate: ProposedDate) => {
    const available = proposedDate.votes.filter(v => v.response === DateResponse.AVAILABLE).length;
    const maybe = proposedDate.votes.filter(v => v.response === DateResponse.MAYBE).length;
    const unavailable = proposedDate.votes.filter(v => v.response === DateResponse.UNAVAILABLE).length;
    const total = proposedDate.totalVotes;
    
    return {
      available,
      maybe,
      unavailable,
      availablePercentage: total > 0 ? Math.round((available / total) * 100) : 0,
      maybePercentage: total > 0 ? Math.round((maybe / total) * 100) : 0,
      unavailablePercentage: total > 0 ? Math.round((unavailable / total) * 100) : 0
    };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    }).format(date);
  };

  const formatDateTime = (date: Date, startTime: string, endTime: string) => {
    return `${formatDate(date)} ${startTime}〜${endTime}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
      {/* ヘッダー */}
      <div className="flex items-center p-4 pb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {event.organizer.department?.slice(0, 2) || '企画'}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <div className="font-bold text-gray-900">
            {post.anonymityLevel === 'real_name' ? event.organizer.name : `${event.organizer.department} 職員`}
          </div>
          <div className="text-gray-500 text-sm">
            {new Date(post.timestamp).toLocaleString('ja-JP', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
            {typeConfig?.icon || '📋'} {typeConfig?.label || 'イベント'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${statusConfig.color}`}>
            {statusConfig?.icon || '📝'} {statusConfig?.label || '企画中'}
          </span>
        </div>
      </div>

      {/* イベント詳細 */}
      <div className="px-4 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
        {event.description && (
          <p className="text-gray-700 mb-4 leading-relaxed">{event.description}</p>
        )}

        {/* 基本情報 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* 日程 */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>日程</span>
              </div>
              {event.finalDate ? (
                <div className="text-sm text-gray-600">
                  {formatDateTime(event.finalDate.date, event.finalDate.startTime, event.finalDate.endTime)}
                </div>
              ) : event.proposedDates.length > 0 ? (
                <div className="space-y-1">
                  {event.proposedDates.slice(0, 2).map((date, index) => (
                    <div key={date.id} className="text-sm text-gray-600">
                      候補{index + 1}: {formatDateTime(new Date(date.date), date.startTime, date.endTime)}
                    </div>
                  ))}
                  {event.proposedDates.length > 2 && (
                    <div className="text-xs text-gray-500">
                      他{event.proposedDates.length - 2}件の候補日
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">日程未定</div>
              )}
            </div>

            {/* 会場 */}
            {event.venue && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>会場</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>{event.venue.name}</div>
                  {event.venue.address && (
                    <div className="text-xs text-gray-500">{event.venue.address}</div>
                  )}
                </div>
              </div>
            )}

            {/* 参加者 */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                <span>参加者</span>
              </div>
              <div className="text-sm text-gray-600">
                {event.participants.length}名参加
                {event.maxParticipants && ` / 定員${event.maxParticipants}名`}
                {event.waitlist.length > 0 && (
                  <span className="text-yellow-600"> (待機中{event.waitlist.length}名)</span>
                )}
              </div>
            </div>

            {/* 費用 */}
            {event.cost !== undefined && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>費用</span>
                </div>
                <div className="text-sm text-gray-600">
                  {event.cost === 0 ? '無料' : `${event.cost.toLocaleString()}円`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 日程調整 */}
        {event.allowDateVoting && event.status === 'date_voting' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">日程調整</h3>
              <button
                onClick={() => setShowDateVoting(!showDateVoting)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showDateVoting ? '閉じる' : '投票する'}
              </button>
            </div>
            
            {showDateVoting && (
              <div className="space-y-3">
                {event.proposedDates.map((proposedDate) => {
                  const results = getDateVotingResults(proposedDate);
                  const userVote = proposedDate.votes.find(v => v.userId === currentUserId);
                  
                  return (
                    <div key={proposedDate.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {formatDateTime(new Date(proposedDate.date), proposedDate.startTime, proposedDate.endTime)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {proposedDate.totalVotes}票
                        </span>
                      </div>
                      
                      {/* 投票結果バー */}
                      <div className="flex mb-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500"
                          style={{ width: `${results.availablePercentage}%` }}
                        />
                        <div 
                          className="bg-yellow-500"
                          style={{ width: `${results.maybePercentage}%` }}
                        />
                        <div 
                          className="bg-red-500"
                          style={{ width: `${results.unavailablePercentage}%` }}
                        />
                      </div>
                      
                      {/* 投票ボタン */}
                      <div className="flex gap-2">
                        {[
                          { response: DateResponse.AVAILABLE, label: '◯', color: 'text-green-600 border-green-600' },
                          { response: DateResponse.MAYBE, label: '△', color: 'text-yellow-600 border-yellow-600' },
                          { response: DateResponse.UNAVAILABLE, label: '×', color: 'text-red-600 border-red-600' }
                        ].map(({ response, label, color }) => (
                          <button
                            key={response}
                            onClick={() => onVoteDate?.(event.id, proposedDate.id, response)}
                            className={`flex-1 py-2 text-sm font-medium border rounded-lg transition-colors ${
                              userVote?.response === response
                                ? `${color} bg-gray-50`
                                : 'text-gray-600 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 参加条件・注意事項 */}
        {event.requirements && event.requirements.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>参加条件・注意事項</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {event.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 参加ボタン */}
        {event.status === 'recruiting' && (
          <div className="mb-4">
            {isParticipating ? (
              <div className="flex gap-3">
                <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <Check className="w-4 h-4" />
                    <span>参加予定</span>
                  </div>
                  {currentParticipant?.note && (
                    <div className="mt-1 text-sm text-green-600">
                      メモ: {currentParticipant.note}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onLeaveEvent?.(event.id)}
                  className="px-4 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  キャンセル
                </button>
              </div>
            ) : isWaitlisted ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>キャンセル待ち中</span>
                </div>
              </div>
            ) : (
              <div>
                {showJoinForm ? (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <textarea
                      value={joinNote}
                      onChange={(e) => setJoinNote(e.target.value)}
                      placeholder="メッセージ（任意）&#10;例: アレルギー情報、質問など"
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowJoinForm(false)}
                        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleJoin}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        {isFull ? 'キャンセル待ちで参加' : '参加する'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className={`w-full px-4 py-3 rounded-lg font-medium ${
                      isFull
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isFull ? 'キャンセル待ちで参加' : '参加する'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* タグ */}
        {event.tags && event.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex space-x-6">
          <button 
            onClick={onComment}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
        <div className="text-sm text-gray-500">
          イベント企画
        </div>
      </div>
    </div>
  );
};

export default EventPost;