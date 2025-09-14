import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { InterviewBookingService } from '../services/InterviewBookingService';
import { InterviewBooking } from '../types/interview';
import CancelBookingModal from '../components/interview/CancelBookingModal';
import RescheduleModal from '../components/interview/RescheduleModal';
import OfflineBookingViewer from '../components/interview/OfflineBookingViewer';
import { usePushNotificationSettings, useOnlineStatus } from '../hooks/usePushNotifications';
import NotificationService from '../services/NotificationService';

// Pattern D 統合コンポーネント
import PendingBookingCard from '../components/interview/PendingBookingCard';
import StaffRecommendationDisplay from '../components/interview/StaffRecommendationDisplay';
import AssistedBookingService, { AssistedBookingRequest, StaffFriendlyRecommendation } from '../services/AssistedBookingService';
import InterviewFlowContainer from '../components/interview/InterviewFlowContainer';

const InterviewStation: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // デモモード対応
  let demoUser = null;
  try {
    const demoMode = useDemoMode();
    demoUser = demoMode?.currentUser;
  } catch (error) {
    console.log('Demo mode not available');
  }
  
  const activeUser = demoUser || currentUser;
  const bookingService = InterviewBookingService.getInstance();
  const assistedBookingService = new AssistedBookingService();
  const notificationService = NotificationService.getInstance();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'booking' | 'history' | 'reminder' | 'offline'>('dashboard');
  const [upcomingBookings, setUpcomingBookings] = useState<InterviewBooking[]>([]);
  const [pastBookings, setPastBookings] = useState<InterviewBooking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<InterviewBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);

  // Pattern D 統合用のstate
  const [pendingRequests, setPendingRequests] = useState<AssistedBookingRequest[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState<StaffFriendlyRecommendation[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  // モバイル対応強化
  const isOnline = useOnlineStatus();
  const pushNotifications = usePushNotificationSettings(activeUser?.id || '');

  useEffect(() => {
    if (activeUser) {
      loadInterviewData();
    }
  }, [activeUser]);

  // プッシュ通知サービス登録
  useEffect(() => {
    if (activeUser && isOnline && pushNotifications.state.isSupported) {
      registerForPushNotifications();
    }
  }, [activeUser, isOnline]);

  // Pattern D リアルタイム通知の設定
  useEffect(() => {
    if (!activeUser) return;

    // リアルタイム通知許可の要求
    notificationService.requestRealtimeNotificationPermission();

    // おまかせ予約状況更新のリスナー
    const handleAssistedBookingUpdate = (data: any) => {
      console.log('おまかせ予約状況更新:', data);
      // 調整中リクエストの再取得
      loadInterviewData();
    };

    // 提案候補準備完了のリスナー
    const handleProposalReady = (data: any) => {
      console.log('提案候補準備完了:', data);
      // 調整中リクエストの再取得とモーダル表示
      loadInterviewData();

      // 自動的に推薦候補を表示
      if (data.requestId) {
        setTimeout(() => {
          handleViewProposals(data.requestId);
        }, 1000);
      }
    };

    // カスタムイベントリスナーを登録
    window.addEventListener('assistedBookingUpdate', handleAssistedBookingUpdate as EventListener);
    window.addEventListener('proposalReady', handleProposalReady as EventListener);

    // リアルタイム通知サービスのリスナー登録
    notificationService.addRealtimeListener('assistedBookingUpdate', handleAssistedBookingUpdate);
    notificationService.addRealtimeListener('proposalReady', handleProposalReady);

    // クリーンアップ
    return () => {
      window.removeEventListener('assistedBookingUpdate', handleAssistedBookingUpdate as EventListener);
      window.removeEventListener('proposalReady', handleProposalReady as EventListener);
      notificationService.removeRealtimeListener('assistedBookingUpdate', handleAssistedBookingUpdate);
      notificationService.removeRealtimeListener('proposalReady', handleProposalReady);
    };
  }, [activeUser]);

  const registerForPushNotifications = async () => {
    if (!pushNotifications.state.isSubscribed) {
      try {
        const success = await pushNotifications.subscribe(activeUser!.id);
        if (success) {
          console.log('プッシュ通知に登録しました');
        }
      } catch (error) {
        console.error('プッシュ通知登録エラー:', error);
      }
    }
  };

  const loadInterviewData = async () => {
    setLoading(true);
    try {
      let bookings: InterviewBooking[];

      if (isOnline) {
        // オンライン時：サーバーから最新データ取得
        bookings = await bookingService.getEmployeeInterviewHistory(activeUser!.id);

        // データをローカルキャッシュに保存
        saveBookingsToCache(bookings);

        // Pattern D: おまかせ予約の調整中リクエストも取得
        try {
          const pendingAssistedRequests = await assistedBookingService.getPendingRequests(activeUser!.id);
          setPendingRequests(pendingAssistedRequests);
        } catch (error) {
          console.error('調整中リクエスト取得エラー:', error);
          setPendingRequests([]);
        }
      } else {
        // オフライン時：キャッシュデータ取得
        bookings = loadBookingsFromCache();
      }

      // 予約を分類
      const upcoming = bookings.filter(b =>
        (b.status === 'confirmed' || b.status === 'pending') &&
        new Date(b.bookingDate) >= new Date()
      );
      const past = bookings.filter(b =>
        b.status === 'completed' ||
        b.status === 'cancelled' ||
        new Date(b.bookingDate) < new Date()
      );

      setUpcomingBookings(upcoming);
      setPastBookings(past);
      
      // リマインダー設定を取得（仮実装）
      const mockReminders = upcoming.map(b => ({
        id: b.id,
        bookingId: b.id,
        type: 'email',
        timing: '1日前',
        enabled: true
      }));
      setReminders(mockReminders);
      
    } catch (error) {
      console.error('Failed to load interview data:', error);
    } finally {
      setLoading(false);
    }
  };

  // オフライン対応：データキャッシュ関数
  const saveBookingsToCache = (bookings: InterviewBooking[]) => {
    try {
      const cacheData = {
        data: bookings,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('cachedInterviewBookings', JSON.stringify(cacheData));
    } catch (error) {
      console.error('データキャッシュ保存エラー:', error);
    }
  };

  const loadBookingsFromCache = (): InterviewBooking[] => {
    try {
      const cached = localStorage.getItem('cachedInterviewBookings');
      if (cached) {
        const cacheData = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(cacheData.timestamp).getTime();

        // 24時間以内のキャッシュのみ有効
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return cacheData.data || [];
        }
      }
    } catch (error) {
      console.error('キャッシュデータ読み込みエラー:', error);
    }
    return [];
  };

  const handleSyncRequest = async () => {
    if (isOnline) {
      await loadInterviewData();
    }
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    loadInterviewData();
  };

  // InterviewFlowContainer完了処理
  const handleInterviewFlowComplete = (flowState: any) => {
    console.log('InterviewFlow completed with state:', flowState);
    setShowBookingModal(false);
    loadInterviewData();
  };

  // おまかせ予約の推薦候補確認
  const handleViewProposals = async (requestId: string) => {
    try {
      const recommendations = await assistedBookingService.getBookingProposals(requestId);
      setCurrentRecommendations(recommendations);
      setSelectedRequestId(requestId);
      setShowRecommendations(true);
    } catch (error) {
      console.error('推薦候補取得エラー:', error);
      // エラー処理: 通知表示など
    }
  };

  // 推薦候補から最終選択
  const handleSelectRecommendation = async (recommendationId: string) => {
    try {
      await assistedBookingService.confirmBookingChoice(selectedRequestId, recommendationId);
      setShowRecommendations(false);
      setCurrentRecommendations([]);
      setSelectedRequestId('');
      // 予約完了後のデータ再読み込み
      loadInterviewData();
    } catch (error) {
      console.error('推薦選択エラー:', error);
      // エラー処理
    }
  };

  // おまかせ予約のキャンセル
  const handleCancelAssistedRequest = async (requestId: string) => {
    try {
      await assistedBookingService.cancelAssistedRequest(requestId, 'ユーザーによるキャンセル');
      loadInterviewData();
    } catch (error) {
      console.error('おまかせ予約キャンセルエラー:', error);
    }
  };

  // 人事部への連絡（デモ用）
  const handleContactHR = (requestId: string) => {
    alert('人事部への連絡機能（内線:1234）\n実装予定: 直接電話・メール送信');
  };

  // おまかせ予約フォーム送信処理
  const handleEnhancedRequestSubmit = async (requestData: any) => {
    try {
      // AssistedBookingServiceを使って医療システムに送信
      const response = await assistedBookingService.submitAssistedBookingRequest(requestData);

      // 送信成功後、予約モーダルを閉じて調整中リストを更新
      setShowBookingModal(false);
      loadInterviewData(); // 調整中リクエストを再取得

      // 成功通知
      alert('おまかせ予約を受け付けました。人事部で最適な面談を調整いたします。');
    } catch (error) {
      console.error('おまかせ予約送信エラー:', error);
      alert('申し込みの送信に失敗しました。しばらく後で再度お試しください。');
    }
  };

  const handleCancelClick = (booking: InterviewBooking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleRescheduleClick = (booking: InterviewBooking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const handleModalClose = () => {
    setShowCancelModal(false);
    setShowRescheduleModal(false);
    setSelectedBooking(null);
  };

  const handleActionComplete = () => {
    loadInterviewData();
    handleModalClose();
  };

  const getStatusBadge = (status: InterviewBooking['status']) => {
    const statusConfig = {
      confirmed: { label: '確定', color: 'bg-green-500' },
      pending: { label: '確認中', color: 'bg-yellow-500' },
      cancelled: { label: 'キャンセル', color: 'bg-red-500' },
      completed: { label: '完了', color: 'bg-gray-500' },
      rescheduled: { label: '変更済み', color: 'bg-blue-500' },
      reschedule_pending: { label: '変更申請中', color: 'bg-orange-500' },
      no_show: { label: '無断欠席', color: 'bg-red-700' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`${config.color} text-white text-xs px-2 py-1 rounded-full`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // ダッシュボードビュー
  const DashboardView = () => (
    <div className="space-y-6">
      {/* おまかせ予約の調整中面談（優先表示） */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">⏳</span> 調整中の面談
          </h2>
          {pendingRequests.map(request => (
            <PendingBookingCard
              key={request.id}
              booking={request}
              onViewProposals={handleViewProposals}
              onContactHR={handleContactHR}
              onCancel={handleCancelAssistedRequest}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 次回の面談 */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">📅</span> 次回の面談
        </h3>
        {upcomingBookings.length > 0 ? (
          <div>
            <p className="text-2xl font-bold mb-2">
              {formatDate(upcomingBookings[0].bookingDate)}
            </p>
            <p className="text-lg opacity-90">
              {upcomingBookings[0].timeSlot.startTime} - {upcomingBookings[0].timeSlot.endTime}
            </p>
            <p className="mt-2 opacity-80">
              担当: {upcomingBookings[0].interviewerName || '調整中'}
            </p>
          </div>
        ) : (
          <div>
            <p className="opacity-80 mb-4">予定されている面談はありません</p>
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              面談を予約する
            </button>
          </div>
        )}
      </div>

        {/* 統計情報 */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">📊</span> 面談統計
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>今年の面談回数:</span>
              <span className="font-bold">{pastBookings.filter(b => b.status === 'completed').length}回</span>
            </div>
            <div className="flex justify-between">
              <span>予約中の面談:</span>
              <span className="font-bold">{upcomingBookings.length}件</span>
            </div>
            <div className="flex justify-between">
              <span>キャンセル率:</span>
              <span className="font-bold">
                {pastBookings.length > 0
                  ? Math.round((pastBookings.filter(b => b.status === 'cancelled').length / pastBookings.length) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center">
            <span className="mr-2">⚡</span> クイックアクション
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              <span className="block text-2xl mb-1">➕</span>
              <span className="text-sm">新規予約</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              <span className="block text-2xl mb-1">📋</span>
              <span className="text-sm">履歴確認</span>
            </button>
            <button
              onClick={() => setActiveTab('reminder')}
              className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              <span className="block text-2xl mb-1">🔔</span>
              <span className="text-sm">リマインダー</span>
            </button>
            <button
              onClick={() => navigate('/interview-guide')}
              className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors text-center"
            >
              <span className="block text-2xl mb-1">📖</span>
              <span className="text-sm">ガイド</span>
            </button>
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center">
            <span className="mr-2">🕐</span> 最近の活動
          </h3>
          <div className="space-y-3">
            {[...upcomingBookings, ...pastBookings].slice(0, 3).map(booking => (
              <div key={booking.id} className="bg-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{booking.interviewType}</p>
                    <p className="text-gray-400 text-sm">{formatDate(booking.bookingDate)}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
            {upcomingBookings.length + pastBookings.length === 0 && (
              <p className="text-gray-400">活動履歴はありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 予約一覧ビュー
  const BookingListView = () => (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">予約中の面談</h3>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ 新規予約
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : upcomingBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">予約中の面談はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.map(booking => (
            <div key={booking.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{booking.interviewType}</h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>📅 {formatDate(booking.bookingDate)}</p>
                    <p>⏰ {booking.timeSlot.startTime} - {booking.timeSlot.endTime}</p>
                    <p>👤 {booking.interviewerName || '調整中'}</p>
                    {booking.description && (
                      <p className="text-gray-400 mt-2">📝 {booking.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRescheduleClick(booking)}
                    className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    disabled={booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'reschedule_pending'}
                  >
                    日時変更
                  </button>
                  <button
                    onClick={() => handleCancelClick(booking)}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                    disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 履歴ビュー
  const HistoryView = () => (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6">面談履歴</h3>
      
      {pastBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">面談履歴はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pastBookings.map(booking => (
            <div key={booking.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{booking.interviewType}</h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>📅 {formatDate(booking.bookingDate)}</p>
                    <p>👤 {booking.interviewerName || '記録なし'}</p>
                    {booking.description && (
                      <p className="text-gray-400 mt-2">📝 {booking.description}</p>
                    )}
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300">詳細</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // リマインダー設定ビュー
  const ReminderView = () => (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6">リマインダー設定</h3>
      
      <div className="space-y-4">
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">通知タイミング</h4>
          <div className="space-y-3">
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span>面談の1日前に通知</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span>面談の1時間前に通知</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-3" />
              <span>面談の1週間前に通知</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">通知方法</h4>
          <div className="space-y-3">
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span>システム内通知</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-3" />
              <span>メール通知（開発中）</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-3" />
              <span>SMS通知（開発中）</span>
            </label>
          </div>
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          設定を保存
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3 text-3xl">🗣️</span>
              面談ステーション
            </h1>
            <p className="text-gray-400 text-sm">面談予約の管理・確認・リマインダー設定</p>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-slate-900 border-b border-gray-700">
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'booking'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              予約一覧
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              履歴
            </button>
            <button
              onClick={() => setActiveTab('reminder')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reminder'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              リマインダー
            </button>
            {!isOnline && (
              <button
                onClick={() => setActiveTab('offline')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-1 ${
                  activeTab === 'offline'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-orange-400 hover:text-orange-300'
                }`}
              >
                📱 オフライン
              </button>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'booking' && <BookingListView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'reminder' && <ReminderView />}
          {activeTab === 'offline' && (
            <OfflineBookingViewer
              isOnline={isOnline}
              onSyncRequest={handleSyncRequest}
              currentUserId={activeUser?.id || ''}
            />
          )}
        </div>
      </div>

      {/* 予約モーダル */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="relative">
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
              >
                ✕
              </button>
              <InterviewFlowContainer
                onComplete={handleInterviewFlowComplete}
                employeeId={activeUser?.id || ''}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pattern D: 推薦結果表示モーダル */}
      {showRecommendations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">面談候補の選択</h2>
                <button
                  onClick={() => {
                    setShowRecommendations(false);
                    setCurrentRecommendations([]);
                    setSelectedRequestId('');
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <StaffRecommendationDisplay
                recommendations={currentRecommendations}
                onSelectRecommendation={handleSelectRecommendation}
                onCancel={() => {
                  setShowRecommendations(false);
                  setCurrentRecommendations([]);
                  setSelectedRequestId('');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* キャンセルモーダル */}
      {showCancelModal && selectedBooking && (
        <CancelBookingModal
          booking={selectedBooking}
          isOpen={showCancelModal}
          onClose={handleModalClose}
          onCancelComplete={handleActionComplete}
          currentUserId={activeUser?.id || ''}
        />
      )}

      {/* 日時変更モーダル */}
      {showRescheduleModal && selectedBooking && (
        <RescheduleModal
          booking={selectedBooking}
          isOpen={showRescheduleModal}
          onClose={handleModalClose}
          onRescheduleComplete={handleActionComplete}
          currentUserId={activeUser?.id || ''}
        />
      )}
    </div>
  );
};

export default InterviewStation;