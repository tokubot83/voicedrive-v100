import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { InterviewBookingService } from '../services/InterviewBookingService';
import { InterviewBooking, InterviewResult, EnhancedBooking, InterviewFilters } from '../types/interview';
import CancelBookingModal from '../components/interview/CancelBookingModal';
import RescheduleModal from '../components/interview/RescheduleModal';
import OfflineBookingViewer from '../components/interview/OfflineBookingViewer';
import { usePushNotificationSettings, useOnlineStatus } from '../hooks/usePushNotifications';
import NotificationService from '../services/NotificationService';
import { MobileFooter } from '../components/layout/MobileFooter';

// Pattern D 統合コンポーネント
import PendingBookingCard from '../components/interview/PendingBookingCard';
import StaffRecommendationDisplay from '../components/interview/StaffRecommendationDisplay';
import AssistedBookingService, { AssistedBookingRequest, StaffFriendlyRecommendation } from '../services/AssistedBookingService';
import SimpleInterviewFlow from '../components/interview/simple/SimpleInterviewFlow';
import ProposalNotificationDemo from '../components/demo/ProposalNotificationDemo';

// Phase 4-A: 面談サマリモーダル統合
import { InterviewResultModal } from '../components/interview-results/InterviewResultModal';

// Phase 6: 面談タイプ表示名マッピング
import { getInterviewTypeLabel, getInterviewTypeIcon } from '../utils/interviewTypeMapper';

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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'reminder' | 'offline'>('dashboard');
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

  // Phase 4-A: 面談サマリ統合用のstate
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
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

    // 面談予約確定通知のリスナー
    const handleInterviewConfirmed = (data: any) => {
      console.log('面談予約確定通知:', data);

      // データ更新
      loadInterviewData();

      // 確定通知を表示
      notificationService.showInAppNotification({
        title: '🎉 面談予約が確定しました！',
        message: `${data.date} ${data.time}の面談が正式に予約されました。`,
        type: 'success',
        duration: 6000,
        action: {
          label: '詳細確認',
          callback: () => setActiveTab('booking')
        }
      });
    };

    // カスタムイベントリスナーを登録
    window.addEventListener('assistedBookingUpdate', handleAssistedBookingUpdate as EventListener);
    window.addEventListener('proposalReady', handleProposalReady as EventListener);
    window.addEventListener('interviewConfirmed', handleInterviewConfirmed as EventListener);

    // リアルタイム通知サービスのリスナー登録
    notificationService.addRealtimeListener('assistedBookingUpdate', handleAssistedBookingUpdate);
    notificationService.addRealtimeListener('proposalReady', handleProposalReady);
    notificationService.addRealtimeListener('interviewConfirmed', handleInterviewConfirmed);

    // クリーンアップ
    return () => {
      window.removeEventListener('assistedBookingUpdate', handleAssistedBookingUpdate as EventListener);
      window.removeEventListener('proposalReady', handleProposalReady as EventListener);
      window.removeEventListener('interviewConfirmed', handleInterviewConfirmed as EventListener);
      notificationService.removeRealtimeListener('assistedBookingUpdate', handleAssistedBookingUpdate);
      notificationService.removeRealtimeListener('proposalReady', handleProposalReady);
      notificationService.removeRealtimeListener('interviewConfirmed', handleInterviewConfirmed);
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

  // Phase 4-A: 面談サマリ取得関数
  const fetchInterviewResults = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token not found - skipping interview results fetch');
      return;
    }

    try {
      setSummaryLoading(true);
      const response = await fetch('/api/my/interview-results', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview results');
      }

      const data = await response.json();
      if (data.success) {
        setInterviewResults(data.data || []);
      } else {
        console.error('API returned error:', data.error);
        setInterviewResults([]);
      }
    } catch (error) {
      console.error('Failed to fetch interview results:', error);
      setInterviewResults([]);
    } finally {
      setSummaryLoading(false);
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

        // Phase 4-A: 面談サマリ取得
        try {
          await fetchInterviewResults();
        } catch (error) {
          console.error('面談サマリ取得エラー:', error);
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

  // SimpleInterviewFlow完了処理
  const handleInterviewFlowComplete = (flowState: any) => {
    console.log('SimpleInterviewFlow completed with state:', flowState);
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

  // Phase 4-A: ヘルパー関数
  const getSummaryStatusBadge = (status: 'received' | 'waiting' | null) => {
    if (status === 'received') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
          <span>✅</span>
          <span>サマリ受信済</span>
        </span>
      );
    }
    if (status === 'waiting') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white text-sm rounded-full">
          <span>⏳</span>
          <span>サマリ待ち</span>
        </span>
      );
    }
    return null;
  };

  // Phase 4-B: フィルタ用ヘルパー関数
  const applyPeriodFilter = (
    bookings: EnhancedBooking[],
    filters: InterviewFilters
  ): EnhancedBooking[] => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);

      switch (filters.period) {
        case 'this_month':
          return bookingDate >= thisMonthStart;
        case 'last_month':
          return bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd;
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            const start = new Date(filters.customStartDate);
            const end = new Date(filters.customEndDate);
            return bookingDate >= start && bookingDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
  };

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case 'this_month': return '今月';
      case 'last_month': return '先月';
      case 'custom': return 'カスタム';
      default: return '全期間';
    }
  };

  const getStatusFilterLabel = (status: string): string => {
    switch (status) {
      case 'summary_received': return 'サマリ受信済み';
      case 'summary_waiting': return 'サマリ待ち';
      default: return '全て';
    }
  };

  const getUniqueInterviewTypes = (bookings: EnhancedBooking[]): string[] => {
    const types = new Set(bookings.map(b => b.interviewType));
    return Array.from(types).sort();
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

      {/* 面談予約カードボタン */}
      <div className="mb-6">
        <div
          onClick={() => setShowBookingModal(true)}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white cursor-pointer hover:from-green-500 hover:to-green-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <span className="mr-3">🎯</span> 面談を予約する
              </h3>
              <p className="opacity-90 text-sm">
                新しい面談の予約申込みを行います
              </p>
            </div>
            <div className="text-3xl opacity-80">
              ➕
            </div>
          </div>
        </div>
      </div>

      {/* 予約中の面談 */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center">
              <span className="mr-2">📅</span> 予約中の面談
            </h3>
            {upcomingBookings.length > 0 && (
              <span className="bg-blue-800/50 px-3 py-1 rounded-full text-sm">
                {upcomingBookings.length}件
              </span>
            )}
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {/* メイン予約（最も近い予約） */}
              <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatDate(upcomingBookings[0].bookingDate)}
                    </p>
                    <p className="text-lg opacity-90 mt-1">
                      {upcomingBookings[0].timeSlot.startTime} - {upcomingBookings[0].timeSlot.endTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {upcomingBookings[0].status === 'confirmed' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                        ✓ 本予約確定
                      </span>
                    )}
                    {upcomingBookings[0].status === 'pending' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                        📝 仮予約中（承認待ち）
                      </span>
                    )}
                    {upcomingBookings[0].status === 'reschedule_pending' && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center">
                        📅 変更申請中
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-80">
                      <span className="inline-block mr-2">👤</span>
                      担当: {upcomingBookings[0].interviewerName || '調整中'}
                    </p>
                    {upcomingBookings[0].description && (
                      <p className="text-sm opacity-70 mt-1">
                        <span className="inline-block mr-2">📝</span>
                        {upcomingBookings[0].description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRescheduleClick(upcomingBookings[0])}
                      className="text-sm bg-blue-700/50 hover:bg-blue-700/70 px-3 py-1 rounded-lg transition-colors"
                      disabled={upcomingBookings[0].status === 'cancelled' || upcomingBookings[0].status === 'completed' || upcomingBookings[0].status === 'reschedule_pending'}
                    >
                      日時変更
                    </button>
                    <button
                      onClick={() => handleCancelClick(upcomingBookings[0])}
                      className="text-sm bg-red-700/50 hover:bg-red-700/70 px-3 py-1 rounded-lg transition-colors"
                      disabled={upcomingBookings[0].status === 'cancelled' || upcomingBookings[0].status === 'completed'}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>

                {upcomingBookings[0].status === 'pending' && (
                  <div className="mt-3 text-sm bg-blue-900/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">📋 承認フロー</span>
                      <span className="text-xs opacity-75">通常1-2営業日</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="text-xs">① 申込完了</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        <span className="text-xs">② 人事部確認中</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span className="text-xs opacity-60">③ 本予約確定</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-700/30">
                      <p className="text-xs opacity-80">
                        💡 確定通知が届き次第、自動で更新されます
                      </p>
                    </div>
                  </div>
                )}
                {upcomingBookings[0].status === 'confirmed' && (
                  <div className="mt-3 text-sm bg-green-800/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400">🎉</span>
                      <span className="font-medium text-green-300">面談予約が確定しました</span>
                    </div>
                    <div className="space-y-1 text-xs opacity-90">
                      <p>• 予約確定通知を送信済み</p>
                      <p>• 面談前日にリマインダーをお送りします</p>
                      <p>• 変更が必要な場合は24時間前までにご連絡ください</p>
                    </div>
                  </div>
                )}
              </div>

              {/* その他の予約がある場合は下部にリンク表示 */}
              {upcomingBookings.length > 1 && (
                <div className="mt-4 pt-4 border-t border-blue-800/30">
                  <p className="text-sm text-gray-400 mb-2">
                    他に{upcomingBookings.length - 1}件の予約があります
                  </p>
                  <button
                    onClick={() => window.scrollTo({ top: document.getElementById('all-bookings')?.offsetTop || 0, behavior: 'smooth' })}
                    className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1"
                  >
                    すべての予約を見る →
                  </button>
                </div>
              )}
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
      </div>

      {/* すべての予約済み面談 */}
      {upcomingBookings.length > 0 && (
        <div id="all-bookings" className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center">
            <span className="mr-2">📅</span> すべての予約済み面談
          </h3>
          <div className="space-y-4">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold">{getInterviewTypeLabel(booking.interviewType)}</h4>
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
        </div>
      )}

      {/* 前回の面談情報 */}
      <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center">
            <span className="mr-2">📋</span> 前回の面談情報
          </h3>
          {pastBookings.length > 0 ? (
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{pastBookings[0].interviewType}</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>📅 {formatDate(pastBookings[0].bookingDate)}</p>
                    <p>⏰ {pastBookings[0].timeSlot.startTime} - {pastBookings[0].timeSlot.endTime}</p>
                    <p>👤 {pastBookings[0].interviewerName}</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  ✅ 完了
                </span>
              </div>
              {pastBookings[0].notes && (
                <div className="mt-3 p-3 bg-slate-600 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">記録:</span> {pastBookings[0].notes}
                  </p>
                </div>
              )}
              <div className="mt-3 flex justify-between text-sm text-gray-400">
                <span>実施済み面談総数: {pastBookings.length}回</span>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  詳細を確認 →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🆕</div>
              <p className="text-gray-400 mb-2">まだ面談履歴がありません</p>
              <p className="text-sm text-gray-500">初回面談をぜひご予約ください</p>
            </div>
          )}
        </div>
    </div>
  );


  // 履歴ビュー
  const HistoryView = () => {
    // Phase 4-B: フィルタ関連のstate
    const [filters, setFilters] = useState<InterviewFilters>({
      period: 'all',
      status: 'all',
      interviewType: 'all',
      keyword: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Phase 4-A: 面談履歴とサマリをマージ
    const enhancedBookings: EnhancedBooking[] = pastBookings.map(booking => {
      const summary = interviewResults.find(r => r.interviewId === booking.id);
      return {
        ...booking,
        hasSummary: !!summary,
        summaryData: summary,
        summaryStatus: booking.status === 'completed'
          ? (summary ? 'received' : 'waiting')
          : null
      } as EnhancedBooking;
    });

    // Phase 4-B: フィルタリング処理
    const filteredBookings = useMemo(() => {
      let result = [...enhancedBookings];

      // 1. 期間フィルタ
      if (filters.period !== 'all') {
        result = applyPeriodFilter(result, filters);
      }

      // 2. ステータスフィルタ
      if (filters.status !== 'all') {
        result = result.filter(b => {
          if (filters.status === 'summary_received') {
            return b.hasSummary;
          } else if (filters.status === 'summary_waiting') {
            return !b.hasSummary && b.status === 'completed';
          }
          return true;
        });
      }

      // 3. 面談タイプフィルタ
      if (filters.interviewType !== 'all') {
        result = result.filter(b => b.interviewType === filters.interviewType);
      }

      // 4. キーワード検索
      if (filters.keyword.trim()) {
        const keyword = filters.keyword.toLowerCase();
        result = result.filter(b =>
          b.interviewerName?.toLowerCase().includes(keyword) ||
          b.summaryData?.summary.toLowerCase().includes(keyword) ||
          b.summaryData?.keyPoints.some(kp => kp.toLowerCase().includes(keyword))
        );
      }

      return result;
    }, [enhancedBookings, filters]);

    // Phase 4-B: アクティブなフィルタのラベル生成
    const activeFilterLabels = useMemo(() => {
      const labels: string[] = [];
      if (filters.period !== 'all') {
        labels.push(`期間: ${getPeriodLabel(filters.period)}`);
      }
      if (filters.status !== 'all') {
        labels.push(`ステータス: ${getStatusFilterLabel(filters.status)}`);
      }
      if (filters.interviewType !== 'all') {
        labels.push(`タイプ: ${getInterviewTypeLabel(filters.interviewType)}`);
      }
      if (filters.keyword.trim()) {
        labels.push(`キーワード: "${filters.keyword}"`);
      }
      return labels;
    }, [filters]);

    // Phase 4-A & Phase 5: 統計計算（履歴タブ用）
    const stats = {
      totalInterviews: pastBookings.filter(b => b.status === 'completed').length,
      summariesReceived: interviewResults.length,
      summaryWaiting: pastBookings.filter(b =>
        b.status === 'completed' &&
        !interviewResults.find(r => r.interviewId === b.id)
      ).length
    };

    return (
      <div className="space-y-6">
        {/* 面談統計 - Phase 4-A & Phase 5 強化版 */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">📊</span> 面談履歴統計
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">完了した面談</div>
              <div className="text-2xl font-bold">{stats.totalInterviews}回</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">サマリ受信済み</div>
              <div className="text-2xl font-bold">{stats.summariesReceived}件</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-90">サマリ待ち</div>
              <div className="text-2xl font-bold">{stats.summaryWaiting}件</div>
            </div>
          </div>
        </div>

      {/* 面談履歴 - Phase 4-A & 4-B 強化版 */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">過去の面談</h3>
          {/* Phase 4-B: フィルタボタン */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <span>🔍</span>
            <span>{showFilters ? 'フィルタを閉じる' : 'フィルタ'}</span>
            {activeFilterLabels.length > 0 && (
              <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">
                {activeFilterLabels.length}
              </span>
            )}
          </button>
        </div>

        {/* Phase 4-B: フィルタパネル */}
        {showFilters && (
          <div className="bg-slate-700 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-semibold">🔍 フィルタ & 検索</h4>
              {activeFilterLabels.length > 0 && (
                <button
                  onClick={() => setFilters({
                    period: 'all',
                    status: 'all',
                    interviewType: 'all',
                    keyword: ''
                  })}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  フィルタクリア
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 期間フィルタ */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">📅 期間</label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
                  className="w-full bg-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="all">全期間</option>
                  <option value="this_month">今月</option>
                  <option value="last_month">先月</option>
                  <option value="custom">カスタム</option>
                </select>
              </div>

              {/* ステータスフィルタ */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">📝 ステータス</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full bg-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="all">全て</option>
                  <option value="summary_received">サマリ受信済み</option>
                  <option value="summary_waiting">サマリ待ち</option>
                </select>
              </div>

              {/* 面談タイプフィルタ */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">💼 面談タイプ</label>
                <select
                  value={filters.interviewType}
                  onChange={(e) => setFilters({ ...filters, interviewType: e.target.value })}
                  className="w-full bg-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="all">全て</option>
                  {getUniqueInterviewTypes(enhancedBookings).map(type => (
                    <option key={type} value={type}>{getInterviewTypeLabel(type)}</option>
                  ))}
                </select>
              </div>

              {/* キーワード検索 */}
              <div>
                <label className="text-sm text-gray-300 mb-1 block">🔎 キーワード</label>
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  placeholder="面談者名、内容等"
                  className="w-full bg-slate-600 text-white rounded px-3 py-2"
                />
              </div>
            </div>

            {/* カスタム期間選択 */}
            {filters.period === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">開始日</label>
                  <input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })}
                    className="w-full bg-slate-600 text-white rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">終了日</label>
                  <input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })}
                    className="w-full bg-slate-600 text-white rounded px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 4-B: アクティブフィルタ表示 */}
        {activeFilterLabels.length > 0 && (
          <div className="bg-slate-700 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-300">🏷️ 絞り込み中:</span>
              {activeFilterLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
                >
                  {label}
                </span>
              ))}
              <button
                onClick={() => setFilters({
                  period: 'all',
                  status: 'all',
                  interviewType: 'all',
                  keyword: ''
                })}
                className="text-sm text-red-400 hover:text-red-300 ml-2"
              >
                ✕ クリア
              </button>
            </div>
          </div>
        )}

        {/* Phase 4-B: 検索結果カウント */}
        <div className="text-gray-300 text-sm mb-4">
          📋 検索結果: {filteredBookings.length}件
          {filteredBookings.length < enhancedBookings.length && (
            <span className="text-gray-400 ml-2">
              （全{enhancedBookings.length}件中）
            </span>
          )}
        </div>

        {summaryLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">読み込み中...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            {enhancedBookings.length === 0 ? (
              <p className="text-gray-400">面談履歴はありません</p>
            ) : (
              <>
                <p className="text-gray-400 mb-2">該当する面談が見つかりませんでした</p>
                <button
                  onClick={() => setFilters({
                    period: 'all',
                    status: 'all',
                    interviewType: 'all',
                    keyword: ''
                  })}
                  className="text-blue-400 hover:text-blue-300"
                >
                  フィルタをクリア
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-slate-700 rounded-lg p-5 hover:bg-slate-600 transition-colors">
                {/* ヘッダー: タイトル + ステータス */}
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                    {getInterviewTypeIcon(booking.interviewType)}
                    {getInterviewTypeLabel(booking.interviewType)}
                  </h4>
                  {getSummaryStatusBadge(booking.summaryStatus)}
                </div>

                {/* 面談情報 */}
                <div className="space-y-2 mb-4">
                  <div className="text-gray-300 flex items-center gap-2">
                    <span>📅</span>
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="text-gray-300 flex items-center gap-2">
                    <span>👤</span>
                    <span>{booking.interviewerName || '記録なし'}</span>
                  </div>
                  {booking.duration && (
                    <div className="text-gray-300 flex items-center gap-2">
                      <span>⏱️</span>
                      <span>所要時間: {booking.duration}分</span>
                    </div>
                  )}
                </div>

                {/* サマリプレビュー（受信済みの場合） */}
                {booking.hasSummary && booking.summaryData && (
                  <div className="bg-slate-600 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-300 mb-2">📌 主なポイント:</div>
                    <ul className="space-y-1">
                      {booking.summaryData.keyPoints.slice(0, 2).map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-200">
                          • {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-3">
                  {booking.hasSummary && (
                    <button
                      onClick={() => {
                        setSelectedInterviewId(booking.id);
                        setSummaryModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      <span>📝</span>
                      <span>サマリを見る</span>
                      {booking.summaryData && !booking.summaryData.isRead && (
                        <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">未読</span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {/* 面談詳細表示 */}}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-400 text-white rounded-lg transition-colors"
                  >
                    <span>📄</span>
                    <span>面談詳細</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* サマリモーダル - Phase 1実装済みコンポーネント再利用 */}
      {selectedInterviewId && (
        <InterviewResultModal
          isOpen={summaryModalOpen}
          onClose={() => {
            setSummaryModalOpen(false);
            setSelectedInterviewId(null);
            // モーダル閉じたら再取得（既読状態更新のため）
            fetchInterviewResults();
          }}
          interviewId={selectedInterviewId}
        />
      )}
    </div>
  );
};

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
        {/* 固定ヘッダーコンテナ */}
        <div className="sticky top-0 z-30">
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
        </div>

        {/* コンテンツエリア */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
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
                <SimpleInterviewFlow
                  onComplete={handleInterviewFlowComplete}
                  employeeId={activeUser?.id || ''}
                  onCancel={() => {
                    console.log('onCancel called - closing modal');
                    setShowBookingModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* デモ通知コンポーネント */}
        <ProposalNotificationDemo />

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
      <MobileFooter />
    </>
  );
};

export default InterviewStation;