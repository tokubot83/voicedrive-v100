import React, { useState } from 'react';
import {
  InterviewConfirmationNotification,
  urgencyConfig,
  interviewTypeConfig
} from '../../types/medicalNotification';

interface InterviewConfirmationCardProps {
  notification: InterviewConfirmationNotification;
  onAcknowledge: (notificationId: string) => void;
  onDecline: (notificationId: string, reason: string) => void;
  onContactInterviewer: (contactExtension: string) => void;
}

const InterviewConfirmationCard: React.FC<InterviewConfirmationCardProps> = ({
  notification,
  onAcknowledge,
  onDecline,
  onContactInterviewer
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  const { data, status } = notification;
  const urgencySettings = urgencyConfig[data.urgency];
  const typeSettings = interviewTypeConfig[data.interviewType];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleDeclineSubmit = () => {
    if (declineReason.trim()) {
      onDecline(notification.id, declineReason);
      setShowDeclineForm(false);
      setDeclineReason('');
    }
  };

  return (
    <div className={`border rounded-xl shadow-lg overflow-hidden ${urgencySettings.bgColor} border-l-4 ${urgencySettings.color}`}>
      {/* メインヘッダー */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">面談予約が確定しました！</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencySettings.color} text-white`}>
                  ⚠️ 緊急度: {urgencySettings.label}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {typeSettings.icon} {typeSettings.label}
                </span>
              </div>
            </div>
          </div>

          {status.userAction === 'none' && (
            <div className="flex gap-2">
              <button
                onClick={() => onAcknowledge(notification.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                ✅ 確認
              </button>
              <button
                onClick={() => setShowDeclineForm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                ❌ 辞退
              </button>
            </div>
          )}
        </div>

        {/* メイン情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <div>
                <div className="font-semibold text-gray-900">面談日時</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatDate(data.finalScheduledDate)}
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {formatTime(data.finalScheduledTime)} - {getEndTime(data.finalScheduledTime, data.duration)}
                  <span className="text-sm text-gray-600 ml-2">({data.duration}分)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <div>
                <div className="font-semibold text-gray-900">場所</div>
                <div className="text-gray-700">{data.location}</div>
                <div className="text-sm text-gray-600">
                  {data.format === 'face_to_face' ? '対面' :
                   data.format === 'online' ? 'オンライン' : 'ハイブリッド'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <div>
                <div className="font-semibold text-gray-900">担当者</div>
                <div className="text-gray-700">{data.interviewer.name}</div>
                <div className="text-sm text-gray-600">{data.interviewer.title}</div>
                <div className="text-sm text-gray-600">{data.interviewer.department}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg">📞</span>
              <div>
                <div className="font-semibold text-gray-900">連絡先</div>
                <button
                  onClick={() => onContactInterviewer(data.interviewer.contactExtension)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {data.interviewer.contactExtension}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ステータス表示 */}
        {status.userAction !== 'none' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">ステータス:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status.userAction === 'acknowledged' ? 'bg-green-100 text-green-800' :
                status.userAction === 'declined' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {status.userAction === 'acknowledged' ? '✅ 確認済み' :
                 status.userAction === 'declined' ? '❌ 辞退済み' :
                 '👁️ 既読'}
              </span>
            </div>
          </div>
        )}

        {/* 詳細情報トグル */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          {showDetails ? '▼' : '▶'} 詳細情報を{showDetails ? '閉じる' : '表示'}
        </button>

        {/* 詳細情報 */}
        {showDetails && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold mb-3">📋 詳細情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-600">予約ID</div>
                <div className="text-gray-900">{data.reservationId}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">承認者</div>
                <div className="text-gray-900">{data.confirmedBy}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">承認日時</div>
                <div className="text-gray-900">
                  {new Date(data.confirmedAt).toLocaleString('ja-JP')}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-600">職員情報</div>
                <div className="text-gray-900">{data.department} {data.position}</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 準備事項</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 職員証をお持ちください</li>
                <li>• 相談したい内容をまとめておいてください</li>
                <li>• 遅刻・欠席の場合は事前連絡をお願いします</li>
              </ul>
            </div>

            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📞 連絡先</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 担当者直通: {data.interviewer.contactExtension}</li>
                <li>• 緊急連絡: 管理室（内線1234）</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 辞退フォーム */}
      {showDeclineForm && (
        <div className="border-t bg-red-50 p-4">
          <h4 className="font-medium text-red-800 mb-3">面談辞退の理由をお聞かせください</h4>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="辞退の理由を入力してください..."
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDeclineSubmit}
              disabled={!declineReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              辞退を送信
            </button>
            <button
              onClick={() => setShowDeclineForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewConfirmationCard;