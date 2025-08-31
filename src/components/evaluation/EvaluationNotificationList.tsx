import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Bell, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import EvaluationNotificationCard from './EvaluationNotificationCard';
import { 
  EvaluationNotificationListItem,
  NotificationFilter,
  NotificationStats 
} from '../../types/evaluation-notification';
import { evaluationNotificationService } from '../../services/evaluationNotificationService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const EvaluationNotificationList: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<EvaluationNotificationListItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<EvaluationNotificationListItem[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'score'>('newest');

  // フィルタリング関数
  const applyFilters = useCallback(() => {
    let filtered = [...notifications];

    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.evaluationPeriod.toLowerCase().includes(query) ||
        notification.employeeName.toLowerCase().includes(query)
      );
    }

    // ステータスフィルタリング
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(n => n.notificationStatus !== 'read');
        break;
      case 'urgent':
        filtered = filtered.filter(n => n.isUrgent);
        break;
      case 'no_appeal':
        filtered = filtered.filter(n => n.appealStatus === 'none');
        break;
      case 'appeal_submitted':
        filtered = filtered.filter(n => n.appealStatus === 'submitted');
        break;
      default:
        // 'all' - フィルタリングなし
        break;
    }

    // ソート
    switch (sortBy) {
      case 'deadline':
        filtered.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
        break;
      case 'score':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.disclosureDate).getTime() - new Date(a.disclosureDate).getTime());
        break;
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, selectedFilter, sortBy]);

  // データ取得
  const fetchNotifications = useCallback(async () => {
    if (!user?.employeeId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [notificationsData, statsData] = await Promise.all([
        evaluationNotificationService.getEvaluationNotifications(user.employeeId),
        evaluationNotificationService.getNotificationStats()
      ]);

      setNotifications(notificationsData);
      setStats(statsData);
    } catch (err) {
      console.error('評価通知データ取得エラー:', err);
      setError('評価通知データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 異議申立ボタンクリック
  const handleAppealClick = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      // AppealFormV3に遷移
      window.location.href = `/appeals/new?notificationId=${notificationId}&evaluationPeriod=${encodeURIComponent(notification.evaluationPeriod)}&score=${notification.score}`;
    }
  };

  // 既読マーク
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, notificationStatus: 'read' as const }
          : notification
      )
    );
  };

  // 統計表示
  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">総通知数</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalSent}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">既読率</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(stats.readRate * 100)}%</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">未読</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalUnread}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">異議申立率</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(stats.appealActionRate * 100)}%</div>
        </div>
      </div>
    );
  };

  // フィルタオプション
  const filterOptions = [
    { value: 'all', label: 'すべて', count: notifications.length },
    { value: 'unread', label: '未読', count: notifications.filter(n => n.notificationStatus !== 'read').length },
    { value: 'urgent', label: '緊急', count: notifications.filter(n => n.isUrgent).length },
    { value: 'no_appeal', label: '未申立', count: notifications.filter(n => n.appealStatus === 'none').length },
    { value: 'appeal_submitted', label: '申立済', count: notifications.filter(n => n.appealStatus === 'submitted').length }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">評価通知を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">エラーが発生しました</span>
        </div>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">評価通知</h2>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          更新
        </button>
      </div>

      {renderStats()}

      {/* 検索・フィルタバー */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 検索 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="評価期間や担当者名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* ソート */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">最新順</option>
            <option value="deadline">締切順</option>
            <option value="score">スコア順</option>
          </select>
        </div>

        {/* フィルタタブ */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${selectedFilter === option.value
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {option.label}
              {option.count > 0 && (
                <span className="ml-1 text-xs opacity-75">({option.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 通知リスト */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notifications.length === 0 ? '評価通知がありません' : '条件に一致する通知がありません'}
            </h3>
            <p className="text-gray-500">
              {notifications.length === 0 
                ? '新しい評価結果が開示されると、ここに通知が表示されます。'
                : '検索条件やフィルタを調整してみてください。'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <EvaluationNotificationCard
              key={notification.id}
              notification={notification}
              onAppealClick={handleAppealClick}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>

      {/* ページネーション（必要に応じて実装） */}
      {filteredNotifications.length > 10 && (
        <div className="flex justify-center py-6">
          <div className="text-sm text-gray-500">
            {filteredNotifications.length}件の通知を表示中
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationNotificationList;