import React, { useState, useMemo } from 'react';
import { NotificationCategory } from '../types/notification';

// 通知データの型定義
interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  icon: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

// カテゴリー設定
const categoryConfigs = [
  { key: 'all', label: 'すべて', icon: '📋', color: '#6b7280' },
  { key: 'interview', label: '面談・予約', icon: '📅', color: '#3b82f6' },
  { key: 'evaluation', label: 'V3評価', icon: '📊', color: '#8b5cf6' },
  { key: 'project', label: 'プロジェクト', icon: '🚀', color: '#ec4899' },
  { key: 'feedback', label: 'フィードバック', icon: '💬', color: '#10b981' },
  { key: 'shift', label: 'シフト・勤務', icon: '⏰', color: '#f59e0b' },
  { key: 'training', label: '研修・教育', icon: '🎓', color: '#6366f1' },
  { key: 'hr_announcement', label: '人事お知らせ', icon: '📢', color: '#ef4444' },
  { key: 'system', label: 'システム', icon: '⚙️', color: '#6b7280' },
];

const NotificationsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      category: 'interview',
      title: '面談予約確定のお知らせ',
      content: '1月25日（土）14:00からの面談予約が確定しました',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      icon: '📅',
      priority: 'high'
    },
    {
      id: '2',
      category: 'evaluation',
      title: 'V3評価期間開始のお知らせ',
      content: '2025年第1四半期のV3評価が開始されました。期限は2月15日までです',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      icon: '📊',
      priority: 'high'
    },
    {
      id: '3',
      category: 'project',
      title: '新規プロジェクトメンバー選出',
      content: 'あなたが「業務改善プロジェクト」のメンバーに選出されました',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      icon: '🚀',
      priority: 'medium'
    },
    {
      id: '4',
      category: 'feedback',
      title: '新しいフィードバックが届いています',
      content: '山田太郎さんからフィードバックが届きました',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: false,
      icon: '💬',
      priority: 'low'
    },
    {
      id: '5',
      category: 'training',
      title: '必須研修のリマインダー',
      content: 'コンプライアンス研修の受講期限が近づいています（残り3日）',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      icon: '🎓',
      priority: 'high'
    },
    {
      id: '6',
      category: 'hr_announcement',
      title: '賞与支給日のお知らせ',
      content: '冬季賞与は12月10日に支給予定です',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: true,
      icon: '📢',
      priority: 'medium'
    },
    {
      id: '7',
      category: 'system',
      title: 'システムメンテナンスのお知らせ',
      content: '1月30日 2:00-4:00にメンテナンスを実施します',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true,
      icon: '⚙️',
      priority: 'low'
    }
  ]);

  // フィルタリングされた通知
  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'all') return notifications;
    return notifications.filter(n => n.category === selectedCategory);
  }, [selectedCategory, notifications]);

  // 時間表示のフォーマット
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 固定ヘッダー */}
      <div
        className="sticky top-0 z-40 bg-black/80 backdrop-blur"
        style={{
          borderBottom: '3px solid transparent',
          borderImage: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
          borderImageSlice: 1
        }}
      >
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔔</div>
            <div>
              <h1 className="text-2xl font-bold text-white">通知センター</h1>
              <p className="text-gray-400 text-sm mt-1">すべての通知を一元管理</p>
            </div>
          </div>
        </div>

        {/* カテゴリーフィルター */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categoryConfigs.map((category) => {
              const isActive = selectedCategory === category.key;
              const count = category.key === 'all'
                ? notifications.filter(n => !n.isRead).length
                : notifications.filter(n => n.category === category.key && !n.isRead).length;

              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
                    }
                  `}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                  {count > 0 && (
                    <span className={`
                      px-1.5 py-0.5 text-xs rounded-full font-bold
                      ${isActive ? 'bg-white/20' : 'bg-red-500 text-white'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* 通知リスト */}
      <div className="p-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-400">このカテゴリーの通知はありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const categoryConfig = categoryConfigs.find(c => c.key === notification.category) || categoryConfigs[0];

                return (
                  <div
                    key={notification.id}
                    className={`
                      bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border
                      ${notification.isRead ? 'border-slate-700/50' : 'border-blue-500/50'}
                      hover:bg-slate-700/50 transition-colors cursor-pointer
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${categoryConfig.color}20` }}
                      >
                        <span className="text-xl">{notification.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${
                            notification.isRead ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          {notification.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-gray-500 text-xs">
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.priority === 'critical' && (
                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                              緊急
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                              重要
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 未読通知数のサマリー */}
          {selectedCategory === 'all' && notifications.filter(n => !n.isRead).length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                未読の通知が{notifications.filter(n => !n.isRead).length}件あります
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;