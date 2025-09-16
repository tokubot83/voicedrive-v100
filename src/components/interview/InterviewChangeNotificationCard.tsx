import React, { useState } from 'react';
import { InterviewChangeNotification } from '../../types/medicalNotification';

interface InterviewChangeNotificationCardProps {
  notification: InterviewChangeNotification;
  onAcknowledge: (notificationId: string) => void;
  onContactSupport: () => void;
}

const InterviewChangeNotificationCard: React.FC<InterviewChangeNotificationCardProps> = ({
  notification,
  onAcknowledge,
  onContactSupport
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const getChangeTypeInfo = (changeType: string) => {
    switch (changeType) {
      case 'cancelled':
        return {
          icon: '❌',
          title: '面談がキャンセルされました',
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500'
        };
      case 'rescheduled':
        return {
          icon: '📅',
          title: '面談の日時が変更されました',
          color: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500'
        };
      case 'location_changed':
        return {
          icon: '📍',
          title: '面談の場所が変更されました',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500'
        };
      case 'interviewer_changed':
        return {
          icon: '👤',
          title: '面談担当者が変更されました',
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-500'
        };
      default:
        return {
          icon: '📝',
          title: '面談情報が変更されました',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500'
        };
    }
  };

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

  const handleAcknowledge = () => {
    setAcknowledged(true);
    onAcknowledge(notification.reservationId);
  };

  const changeInfo = getChangeTypeInfo(notification.changeType);

  return (
    <div className={`border rounded-xl shadow-lg overflow-hidden ${changeInfo.bgColor} border-l-4 ${changeInfo.borderColor}`}>
      {/* 緊急バナー */}
      {notification.isUrgent && (
        <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium flex items-center animate-pulse">
          <span className="mr-2">🚨</span>
          緊急通知 - 至急確認してください
        </div>
      )}

      {/* メインヘッダー */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{changeInfo.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{changeInfo.title}</h2>
              <div className="text-sm text-gray-600 mt-1">
                予約ID: {notification.reservationId} |
                変更日時: {new Date(notification.changedAt).toLocaleString('ja-JP')}
              </div>
            </div>
          </div>

          {!acknowledged && notification.requiresAcknowledgement && (
            <button
              onClick={handleAcknowledge}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              ✅ 確認済み
            </button>
          )}
        </div>

        {/* 変更内容 */}
        <div className="space-y-4 mb-4">
          {/* キャンセルの場合 */}
          {notification.changeType === 'cancelled' && (
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">キャンセルされた面談</h3>
              <div className="text-sm text-gray-700">
                <p>📅 予定日時: {formatDate(notification.originalData.scheduledDate)} {formatTime(notification.originalData.scheduledTime)}</p>
                <p>📍 場所: {notification.originalData.location}</p>
                <p>👤 担当者: {notification.originalData.interviewer.name}</p>
              </div>
              <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-400">
                <p className="text-sm text-red-800">
                  <span className="font-medium">キャンセル理由:</span> {notification.changeReason}
                </p>
              </div>
            </div>
          )}

          {/* 日時変更の場合 */}
          {notification.changeType === 'rescheduled' && notification.newData && (
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-3">日時変更の詳細</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">変更前</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>📅 {formatDate(notification.originalData.scheduledDate)}</p>
                    <p>⏰ {formatTime(notification.originalData.scheduledTime)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">変更後</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>📅 {formatDate(notification.newData.scheduledDate!)}</p>
                    <p>⏰ {formatTime(notification.newData.scheduledTime!)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <p className="text-sm text-orange-800">
                  <span className="font-medium">変更理由:</span> {notification.changeReason}
                </p>
              </div>
            </div>
          )}

          {/* 場所変更の場合 */}
          {notification.changeType === 'location_changed' && notification.newData && (
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">場所変更の詳細</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">変更前</h4>
                  <p className="text-sm text-gray-700">📍 {notification.originalData.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">変更後</h4>
                  <p className="text-sm text-gray-700">📍 {notification.newData.location}</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">変更理由:</span> {notification.changeReason}
                </p>
              </div>
            </div>
          )}

          {/* 担当者変更の場合 */}
          {notification.changeType === 'interviewer_changed' && notification.newData && (
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3">担当者変更の詳細</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">変更前</h4>
                  <div className="text-sm text-gray-700">
                    <p>👤 {notification.originalData.interviewer.name}</p>
                    <p>{notification.originalData.interviewer.title}</p>
                    <p>📞 {notification.originalData.interviewer.contactExtension}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">変更後</h4>
                  <div className="text-sm text-gray-700">
                    <p>👤 {notification.newData.interviewer!.name}</p>
                    <p>{notification.newData.interviewer!.title}</p>
                    <p>📞 {notification.newData.interviewer!.contactExtension}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">変更理由:</span> {notification.changeReason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 mt-6">
          {notification.changeType !== 'cancelled' && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📋 詳細確認
            </button>
          )}

          <button
            onClick={onContactSupport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            📞 サポートに連絡
          </button>

          {notification.isUrgent && (
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              🚨 緊急対応要請
            </button>
          )}
        </div>

        {/* 確認済みステータス */}
        {acknowledged && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-medium text-green-800">確認済み</span>
              <span className="text-xs text-green-600">
                {new Date().toLocaleString('ja-JP')}
              </span>
            </div>
          </div>
        )}

        {/* 詳細情報 */}
        {showDetails && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h4 className="font-semibold mb-3">📋 詳細情報</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">変更者:</span>
                <span className="text-gray-900">{notification.changedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">変更日時:</span>
                <span className="text-gray-900">
                  {new Date(notification.changedAt).toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">予約ID:</span>
                <span className="text-gray-900">{notification.reservationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">対象職員:</span>
                <span className="text-gray-900">{notification.staffName} ({notification.staffId})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewChangeNotificationCard;