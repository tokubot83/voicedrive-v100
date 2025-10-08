import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import axios from 'axios';

interface WebhookNotification {
  id: string;
  notificationId: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: {
    processedRecords?: number;
    startTime?: string;
    endTime?: string;
    processingDuration?: number;
    errorCode?: string;
    errorMessage?: string;
    failedAt?: string;
  };
  accountLevel: number;
  timestamp: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

interface WebhookNotificationResponse {
  success: boolean;
  data: WebhookNotification[];
  unreadCount: number;
  totalCount: number;
}

const WebhookNotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<WebhookNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'warning' | 'info'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // 30秒ごとにポーリング
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter, showUnreadOnly]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showUnreadOnly) params.append('unreadOnly', 'true');
      if (filter !== 'all') params.append('type', filter);
      params.append('limit', '50');

      const response = await axios.get<WebhookNotificationResponse>(
        `/api/webhook/notifications?${params.toString()}`
      );

      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('通知取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`/api/webhook/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error('既読更新エラー:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/webhook/notifications/read-all');
      loadNotifications();
    } catch (error) {
      console.error('全既読更新エラー:', error);
    }
  };

  const getNotificationIcon = (type: WebhookNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: WebhookNotification['type'], isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-orange-50';
      case 'info':
        return 'bg-blue-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    }
    return `${seconds}秒`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Analytics処理通知
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                すべて既読にする
              </button>
            )}
          </div>

          {/* フィルター */}
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilter('success')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  filter === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                成功
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  filter === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                エラー
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  filter === 'warning'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                警告
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  filter === 'info'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                情報
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded"
              />
              未読のみ
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* 通知リスト */}
        <div className="divide-y divide-gray-200">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              読み込み中...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              通知はありません
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 ${getBgColor(notification.type, notification.read)} transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          title="既読にする"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>

                    {/* 詳細情報 */}
                    {notification.details && (
                      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          詳細情報
                        </h4>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          {notification.details.processedRecords !== undefined && (
                            <>
                              <dt className="text-gray-600">処理レコード数:</dt>
                              <dd className="font-medium">{notification.details.processedRecords}件</dd>
                            </>
                          )}
                          {notification.details.processingDuration !== undefined && (
                            <>
                              <dt className="text-gray-600">処理時間:</dt>
                              <dd className="font-medium">
                                {formatDuration(notification.details.processingDuration)}
                              </dd>
                            </>
                          )}
                          {notification.details.startTime && (
                            <>
                              <dt className="text-gray-600">開始時刻:</dt>
                              <dd className="font-medium">
                                {formatDate(notification.details.startTime)}
                              </dd>
                            </>
                          )}
                          {notification.details.endTime && (
                            <>
                              <dt className="text-gray-600">終了時刻:</dt>
                              <dd className="font-medium">
                                {formatDate(notification.details.endTime)}
                              </dd>
                            </>
                          )}
                          {notification.details.errorCode && (
                            <>
                              <dt className="text-gray-600">エラーコード:</dt>
                              <dd className="font-medium text-red-600">
                                {notification.details.errorCode}
                              </dd>
                            </>
                          )}
                          {notification.details.errorMessage && (
                            <>
                              <dt className="text-gray-600">エラー詳細:</dt>
                              <dd className="font-medium text-red-600 col-span-2">
                                {notification.details.errorMessage}
                              </dd>
                            </>
                          )}
                        </dl>
                      </div>
                    )}

                    {/* タイムスタンプ */}
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <span>通知時刻: {formatDate(notification.timestamp)}</span>
                      <span>•</span>
                      <span>ID: {notification.notificationId}</span>
                      {notification.read && notification.readAt && (
                        <>
                          <span>•</span>
                          <span>既読: {formatDate(notification.readAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WebhookNotificationPanel;
