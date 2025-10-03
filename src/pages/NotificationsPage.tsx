import React, { useState, useMemo, useEffect } from 'react';
import { NotificationCategory } from '../types/notification';
import AppBadgeService from '../services/AppBadgeService';
import { InterviewResultModal } from '../components/interview-results/InterviewResultModal';

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
  { key: 'evaluation', label: '評価', icon: '📊', color: '#8b5cf6' },
  { key: 'proposal', label: '議題・提案', icon: '💡', color: '#f59e0b' },
  { key: 'project', label: 'プロジェクト', icon: '🚀', color: '#ec4899' },
  { key: 'feedback', label: 'フィードバック', icon: '💬', color: '#10b981' },
  { key: 'shift', label: 'シフト・勤務', icon: '⏰', color: '#f59e0b' },
  { key: 'training', label: '研修・教育', icon: '🎓', color: '#6366f1' },
  { key: 'hr_announcement', label: '人事お知らせ', icon: '📢', color: '#ef4444' },
  { key: 'system', label: 'システム', icon: '⚙️', color: '#6b7280' },
];

const NotificationsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
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
      title: '評価期間開始のお知らせ',
      content: '2025年第1四半期の評価が開始されました。期限は2月15日までです',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      icon: '📊',
      priority: 'high'
    },
    {
      id: '3',
      category: 'proposal',
      title: '議題が正式採用されました',
      content: 'あなたの提案「業務改善システム導入」が経営会議で採択され、正式議題として進行します',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      icon: '💡',
      priority: 'high'
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

  // バッジサービスの初期化と既読処理
  useEffect(() => {
    const badgeService = AppBadgeService.getInstance();

    // 未読数を計算してバッジを更新
    const updateBadge = () => {
      const unreadCount = notifications.filter(n => !n.isRead).length;

      // localStorageに保存（AppBadgeServiceが参照）
      localStorage.setItem('notifications', JSON.stringify(notifications));

      // バッジを更新
      badgeService.updateBadge(unreadCount);
    };

    // 初回更新
    updateBadge();

    // 通知が変更されるたびに更新
    return () => {
      // クリーンアップ不要
    };
  }, [notifications]);

  // 通知を既読にする関数
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );

    // バッジサービスに通知
    AppBadgeService.getInstance().onNotificationRead();
  };

  // 全て既読にする関数
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );

    // バッジをクリア
    AppBadgeService.getInstance().clearBadge();
  };

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

  // 通知コンテンツからinterviewIdを抽出
  const extractInterviewId = (content: string): string | null => {
    const match = content.match(/\[INTERVIEW_ID:([^\]]+)\]/);
    return match ? match[1] : null;
  };

  // サマリボタンクリック
  const handleViewSummary = (interviewId: string) => {
    setSelectedInterviewId(interviewId);
    setSummaryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      {/* 固定ヘッダーコンテナ */}
      <div className="sticky top-0 z-30">
        {/* タイトルヘッダー */}
        <div className="hr-title-header">
          <div className="hr-title-content">
            <div className="hr-title-icon">🔔</div>
            <h1 className="hr-title-text">
              通知センター
            </h1>
          </div>
        </div>

        {/* カテゴリーフィルター */}
        <div className="hr-category-filter">
          <div className="hr-category-container">
            {categoryConfigs.map((category) => {
              const isActive = selectedCategory === category.key;
              const count = category.key === 'all'
                ? notifications.filter(n => !n.isRead).length
                : notifications.filter(n => n.category === category.key && !n.isRead).length;

              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`hr-category-btn ${isActive ? 'active' : ''}`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
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
      <div className="hr-messages-container">
        <div className="max-w-7xl mx-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-400">このカテゴリーの通知はありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const categoryConfig = categoryConfigs.find(c => c.key === notification.category) || categoryConfigs[0];

                return (
                  <div key={notification.id} className="hr-message">
                    <div
                      className="hr-message-icon"
                      style={{
                        background: `linear-gradient(135deg, ${categoryConfig.color} 0%, ${categoryConfig.color}dd 100%)`
                      }}
                    >
                      {notification.icon}
                    </div>
                    <div className="hr-message-content">
                      <div className={`hr-message-bubble ${!notification.isRead ? 'border-blue-400 border-l-4' : ''}`}>
                        <div className="hr-message-header">
                          <span className="hr-category-tag" style={{
                            background: `${categoryConfig.color}20`,
                            color: categoryConfig.color,
                            border: `1px solid ${categoryConfig.color}40`
                          }}>
                            {categoryConfig.icon} {categoryConfig.label}
                          </span>
                          <span className="hr-time-label">{formatTime(notification.timestamp)}</span>
                        </div>

                        <h3 className="hr-message-title flex items-center justify-between">
                          {notification.title}
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-2"></span>
                          )}
                        </h3>

                        <p className="hr-message-text">
                          {notification.content.replace(/\[INTERVIEW_ID:[^\]]+\]/, '')}
                        </p>

                        {(notification.priority === 'critical' || notification.priority === 'high') && (
                          <div className="hr-message-info">
                            <span>
                              {notification.priority === 'critical' ? '🚨' : '⚠️'}
                            </span>
                            <span>
                              {notification.priority === 'critical' ? '緊急の通知です' : '重要な通知です'}
                            </span>
                          </div>
                        )}

                        {/* Phase 2: 面談サマリ通知の場合、サマリボタンを表示 */}
                        {extractInterviewId(notification.content) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const interviewId = extractInterviewId(notification.content);
                              if (interviewId) handleViewSummary(interviewId);
                            }}
                            className="hr-action-button meeting"
                          >
                            <span>📝</span>
                            <span>サマリを見る</span>
                          </button>
                        )}
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

      {/* Phase 2: サマリモーダル */}
      {selectedInterviewId && (
        <InterviewResultModal
          isOpen={summaryModalOpen}
          onClose={() => {
            setSummaryModalOpen(false);
            setSelectedInterviewId(null);
          }}
          interviewId={selectedInterviewId}
        />
      )}
    </div>
  );
};

export default NotificationsPage;