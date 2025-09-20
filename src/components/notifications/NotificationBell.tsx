import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, Check, X, Clock, AlertTriangle, Calendar, MessageSquare } from 'lucide-react';
import NotificationService, { ActionableNotification, NotificationStats } from '../../services/NotificationService';
import { useAuth } from '../../hooks/useAuth';
import { useDemoMode } from '../demo/DemoModeController';
import ProposalSelectionModal from '../interview/ProposalSelectionModal';
import { ProposalPattern, RescheduleRequest } from '../../types/interview';
// Simple date formatter (replacing date-fns)
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<ActionableNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'pending'>('pending');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalPatterns, setProposalPatterns] = useState<ProposalPattern[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationService = NotificationService.getInstance();

  // デモモードの場合はdemo-userを使用
  const activeUserId = isDemoMode ? 'demo-user' : currentUser?.id;

  useEffect(() => {
    if (!activeUserId || !notificationService) return;

    // 初回読み込み
    loadNotifications();

    // リアルタイム更新を購読
    const unsubscribe = notificationService.subscribeToNotifications((userId) => {
      if (userId === activeUserId) {
        loadNotifications();
      }
    });

    return () => unsubscribe();
  }, [activeUserId, filter]);

  useEffect(() => {
    // クリックアウトサイドで閉じる
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = () => {
    if (!activeUserId) return;

    const filterOptions = {
      unreadOnly: filter === 'unread',
      pendingOnly: filter === 'pending'
    };

    const userNotifications = notificationService.getUserNotifications(
      activeUserId,
      filter === 'all' ? undefined : filterOptions
    );

    setNotifications(userNotifications);
    setStats(notificationService.getUserNotificationStats(activeUserId));
  };

  const handleAction = async (notification: ActionableNotification, actionId: string) => {
    if (!activeUserId) return;

    // プロジェクト詳細ページへのナビゲーション処理
    const action = notification.actions?.find(a => a.id === actionId);
    if (action?.action === 'view' || action?.action === 'view_project') {
      if (notification.metadata?.projectId) {
        navigate(`/project/${notification.metadata.projectId}`);
        setShowDropdown(false);
        return;
      }
    }

    const result = await notificationService.executeNotificationAction(
      activeUserId,
      notification.id,
      actionId
    );

    if (result.success) {
      loadNotifications();
    }
  };

  // 面談提案通知のクリックハンドラー
  const handleProposalNotificationClick = (notification: ActionableNotification) => {
    if (notification.data?.action === 'view_proposals') {
      // 提案パターンを生成（実際はAPIから取得）
      const mockProposals: ProposalPattern[] = [
        {
          id: 'p1',
          proposalNumber: 1,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          startTime: '14:00',
          endTime: '15:00',
          interviewer: {
            id: 'i1',
            name: '山田 花子',
            title: 'シニアカウンセラー',
            department: '人事部メンタルヘルス課',
            specialties: ['キャリア相談', 'ストレス管理']
          },
          location: {
            type: 'onsite',
            place: '本部ビル',
            roomNumber: '3F 相談室A'
          },
          matchingScore: 95,
          isRecommended: true,
          notes: 'ご希望の時間帯と合致しています'
        },
        {
          id: 'p2',
          proposalNumber: 2,
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          startTime: '10:00',
          endTime: '11:00',
          interviewer: {
            id: 'i2',
            name: '田中 太郎',
            title: '人事部主任',
            department: '人事部'
          },
          location: {
            type: 'onsite',
            place: '本部ビル',
            roomNumber: '5F 会議室B'
          },
          matchingScore: 78
        },
        {
          id: 'p3',
          proposalNumber: 3,
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          startTime: '15:30',
          endTime: '16:30',
          interviewer: {
            id: 'i3',
            name: '鈴木 次郎',
            title: '人事課長',
            department: '人事部'
          },
          location: {
            type: 'online',
            meetingUrl: 'https://meet.example.com/abc123'
          },
          matchingScore: 82
        }
      ];

      setProposalPatterns(mockProposals);
      setShowProposalModal(true);
      setShowDropdown(false);

      // 通知を既読にする
      notificationService.markAsRead(notification.id);
      loadNotifications();
    }
  };

  const handleSelectProposal = (proposalId: string) => {
    console.log('選択された提案:', proposalId);
    setShowProposalModal(false);
    alert('面談予約が確定しました！詳細はメールでお送りします。');
  };

  const handleRequestReschedule = (request: RescheduleRequest) => {
    console.log('再調整依頼:', request);
    setShowProposalModal(false);
    alert('再調整を依頼しました。医療チームから新しい提案が届きましたらお知らせします。');
  };

  const markAsRead = (notificationId: string) => {
    if (!activeUserId) return;
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const getNotificationIcon = (type: ActionableNotification['type'] | string) => {
    switch (type) {
      case 'EMERGENCY_ACTION':
      case 'ESCALATION':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'DEADLINE_REMINDER':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'proposal_received':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'revised_proposal':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'selection_deadline_warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const hasUrgentNotifications = stats && (stats.overdue > 0 || 
    (stats.byType.EMERGENCY_ACTION || 0) > 0 || 
    (stats.byType.ESCALATION || 0) > 0);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="通知"
      >
        {hasUrgentNotifications ? (
          <BellRing className="w-6 h-6 text-red-500 animate-pulse" />
        ) : (
          <Bell className="w-6 h-6 text-gray-700" />
        )}
        
        {stats && stats.pending > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {stats.pending > 99 ? '99+' : stats.pending}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">通知</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'pending' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                未対応 {stats?.pending ? `(${stats.pending})` : ''}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'unread' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                未読 {stats?.unread ? `(${stats.unread})` : ''}
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                通知はありません
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    // 面談提案通知の場合は専用処理
                    if (notification.type === 'proposal_received' ||
                        notification.type === 'revised_proposal' ||
                        notification.data?.action === 'view_proposals') {
                      handleProposalNotificationClick(notification);
                    } else if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        {notification.title}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {notification.message.split('\n').map((line, index) => {
                          // 選出理由セクションをハイライト
                          if (line.includes('【選出理由】')) {
                            return (
                              <div key={index} className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                                <div className="font-semibold text-blue-800 text-xs mb-1">選出理由</div>
                                <div className="text-blue-700">{line.replace('【選出理由】', '')}</div>
                              </div>
                            );
                          }
                          return (
                            <div key={index}>
                              {line}
                              {index < notification.message.split('\n').length - 1 && <br />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.dueDate && (
                          <>
                            <span>•</span>
                            <span className={
                              notification.dueDate < new Date() ? 'text-red-500 font-semibold' : ''
                            }>
                              期限: {formatDate(notification.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {notification.actions && !notification.isActioned && (
                        <div className="flex gap-2 mt-3">
                          {notification.actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(notification, action.id);
                              }}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                action.type === 'primary' 
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : action.type === 'danger'
                                  ? 'bg-red-500 text-white hover:bg-red-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {notification.isActioned && (
                        <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          <span>対応済み</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 text-center border-t border-gray-200">
              <a
                href="/notifications"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                すべての通知を見る
              </a>
            </div>
          )}
        </div>
      )}

      {/* 提案選択モーダル */}
      <ProposalSelectionModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        proposals={proposalPatterns}
        onSelectProposal={handleSelectProposal}
        onRequestReschedule={handleRequestReschedule}
        employeeName={isDemoMode ? 'デモユーザー' : (currentUser?.name || '職員')}
        bookingId="temp-booking"
      />
    </div>
  );
};