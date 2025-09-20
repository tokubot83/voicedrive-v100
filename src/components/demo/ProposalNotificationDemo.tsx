import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Calendar, AlertCircle, X, ChevronRight } from 'lucide-react';
import NotificationService from '../../services/NotificationService';
import ProposalSelectionModal from '../interview/ProposalSelectionModal';
import { ProposalPattern, RescheduleRequest } from '../../types/interview';
import { ActionableNotification } from '../../types/notification';

const ProposalNotificationDemo: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<ActionableNotification[]>([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalPatterns, setProposalPatterns] = useState<ProposalPattern[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // 通知リスナーを設定
    const unsubscribe = notificationService.addListener((notification) => {
      loadNotifications();
    });

    // 初期通知を読み込み
    loadNotifications();

    return unsubscribe;
  }, []);

  const loadNotifications = () => {
    const userNotifications = notificationService.getUserNotifications('demo-user', {
      unreadOnly: true
    });
    setNotifications(userNotifications);
    setNotificationCount(userNotifications.filter(n => !n.isRead).length);
  };

  // デモ通知を送信
  const sendDemoNotification = (type: 'proposal' | 'reschedule' | 'deadline') => {
    switch (type) {
      case 'proposal':
        notificationService.sendDemoProposalNotification();
        break;
      case 'reschedule':
        notificationService.sendDemoRescheduleNotification();
        break;
      case 'deadline':
        notificationService.sendDemoDeadlineWarning();
        break;
    }

    // 通知を更新
    setTimeout(loadNotifications, 100);
    setShowNotifications(true);
  };

  // 通知をクリックして提案モーダルを開く
  const handleNotificationClick = (notification: ActionableNotification) => {
    // 通知を既読にする
    notificationService.markAsRead(notification.id);

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
      setShowNotifications(false);
    }

    loadNotifications();
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    return '今';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'proposal_received':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'revised_proposal':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'selection_deadline_warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      {/* デモトリガーバー */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-30">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="text-sm font-semibold text-gray-600 self-center">
            デモ通知:
          </div>
          <button
            onClick={() => sendDemoNotification('proposal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            面談提案通知
          </button>
          <button
            onClick={() => sendDemoNotification('reschedule')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            再調整完了通知
          </button>
          <button
            onClick={() => sendDemoNotification('deadline')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            期限警告通知
          </button>
        </div>
      </div>

      {/* 通知ベルアイコン */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* 通知パネル */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 z-40">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">通知</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>新しい通知はありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.actionRequired && (
                            <span className="text-xs text-orange-600 font-medium flex items-center">
                              アクション必要
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </span>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 提案選択モーダル */}
      <ProposalSelectionModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        proposals={proposalPatterns}
        onSelectProposal={handleSelectProposal}
        onRequestReschedule={handleRequestReschedule}
        employeeName="デモユーザー"
        bookingId="demo-booking"
      />
    </>
  );
};

export default ProposalNotificationDemo;