import React, { useState, useEffect } from 'react';
import InterviewConfirmationCard from './InterviewConfirmationCard';
import MedicalNotificationService from '../../services/MedicalNotificationService';
import { InterviewConfirmationNotification } from '../../types/medicalNotification';

const InterviewNotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<InterviewConfirmationNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'acknowledged' | 'declined'>('all');
  const [loading, setLoading] = useState(false);
  const notificationService = MedicalNotificationService.getInstance();

  useEffect(() => {
    // 初期データの読み込み
    setNotifications(notificationService.getNotifications());

    // 通知権限のリクエスト
    notificationService.requestNotificationPermission();

    // リスナーの登録
    const handleNotificationsUpdate = (updatedNotifications: InterviewConfirmationNotification[]) => {
      setNotifications(updatedNotifications);
    };

    notificationService.addListener(handleNotificationsUpdate);

    // クリーンアップ
    return () => {
      notificationService.removeListener(handleNotificationsUpdate);
    };
  }, []);

  // フィルタリングされた通知
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return notification.status.userAction === 'none';
      case 'acknowledged':
        return notification.status.userAction === 'acknowledged';
      case 'declined':
        return notification.status.userAction === 'declined';
      default:
        return true;
    }
  });

  const handleAcknowledge = async (notificationId: string) => {
    setLoading(true);
    try {
      notificationService.acknowledgeNotification(notificationId);

      // リマインダーを設定
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notificationService.scheduleReminder(notification);
      }
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
      alert('確認処理でエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (notificationId: string, reason: string) => {
    setLoading(true);
    try {
      notificationService.declineNotification(notificationId, reason);
      alert('面談の辞退が送信されました。');
    } catch (error) {
      console.error('Failed to decline notification:', error);
      alert('辞退処理でエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleContactInterviewer = (contactExtension: string) => {
    // 実際の実装では電話システムとの連携やモーダル表示など
    alert(`連絡先: ${contactExtension}\n\n実際の実装では電話システムと連携して直接発信したり、連絡先の詳細情報を表示します。`);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => n.status.userAction === 'none').length;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">面談確定通知</h2>
          {getUnreadCount() > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {getUnreadCount()} 件未読
            </span>
          )}
        </div>

        {/* フィルター */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            すべて ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            未読 ({notifications.filter(n => n.status.userAction === 'none').length})
          </button>
          <button
            onClick={() => setFilter('acknowledged')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'acknowledged'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            確認済み ({notifications.filter(n => n.status.userAction === 'acknowledged').length})
          </button>
          <button
            onClick={() => setFilter('declined')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'declined'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            辞退済み ({notifications.filter(n => n.status.userAction === 'declined').length})
          </button>
        </div>
      </div>

      {/* 通知リスト */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">処理中...</p>
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? '通知はありません' :
             filter === 'unread' ? '未読の通知はありません' :
             filter === 'acknowledged' ? '確認済みの通知はありません' :
             '辞退済みの通知はありません'}
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? '医療システムからの面談確定通知がここに表示されます。'
              : 'フィルターを変更して他の通知を確認してください。'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredNotifications.map(notification => (
            <InterviewConfirmationCard
              key={notification.id}
              notification={notification}
              onAcknowledge={handleAcknowledge}
              onDecline={handleDecline}
              onContactInterviewer={handleContactInterviewer}
            />
          ))}
        </div>
      )}

      {/* 統計情報 */}
      {notifications.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">📊 通知統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{notifications.length}</div>
              <div className="text-gray-600">総通知数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{getUnreadCount()}</div>
              <div className="text-gray-600">未読</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {notifications.filter(n => n.status.userAction === 'acknowledged').length}
              </div>
              <div className="text-gray-600">確認済み</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">
                {notifications.filter(n => n.status.userAction === 'declined').length}
              </div>
              <div className="text-gray-600">辞退済み</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewNotificationList;