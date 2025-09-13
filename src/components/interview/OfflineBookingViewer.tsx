import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Calendar, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InterviewBooking } from '../../types/interview';

interface OfflineBookingViewerProps {
  isOnline: boolean;
  onSyncRequest: () => void;
  currentUserId: string;
}

interface CachedBookingData {
  data: InterviewBooking[];
  timestamp: string;
  version: string;
}

const OfflineBookingViewer: React.FC<OfflineBookingViewerProps> = ({
  isOnline,
  onSyncRequest,
  currentUserId
}) => {
  const [offlineBookings, setOfflineBookings] = useState<InterviewBooking[]>([]);
  const [cacheInfo, setCacheInfo] = useState<{
    timestamp: string;
    isExpired: boolean;
    itemCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOfflineData();
  }, []);

  useEffect(() => {
    // オンライン復帰時の自動同期
    if (isOnline && cacheInfo?.isExpired) {
      handleSyncData();
    }
  }, [isOnline, cacheInfo]);

  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('cachedInterviewBookings');
      if (cached) {
        const cachedData: CachedBookingData = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();
        const isExpired = cacheAge > 24 * 60 * 60 * 1000; // 24時間

        setOfflineBookings(cachedData.data || []);
        setCacheInfo({
          timestamp: cachedData.timestamp,
          isExpired,
          itemCount: cachedData.data?.length || 0
        });
      } else {
        setCacheInfo({
          timestamp: '',
          isExpired: true,
          itemCount: 0
        });
      }
    } catch (error) {
      console.error('オフラインデータ読み込みエラー:', error);
      setOfflineBookings([]);
    }
  };

  const handleSyncData = async () => {
    if (!isOnline) {
      return;
    }

    setIsLoading(true);
    try {
      await onSyncRequest();

      // 同期完了後にデータを再読み込み
      setTimeout(() => {
        loadOfflineData();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('データ同期エラー:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const getInterviewTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'new_employee_monthly': '新入職員月次面談',
      'regular_annual': '年次面談',
      'management_biannual': '管理職面談',
      'feedback': 'フィードバック面談',
      'career_support': 'キャリア相談',
      'workplace_support': '職場環境相談',
      'individual_consultation': '個別相談',
      'return_to_work': '復職面談',
      'exit_interview': '退職面談'
    };
    return typeMap[type] || '面談';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: '申請中', color: 'bg-yellow-600' },
      'confirmed': { label: '確定', color: 'bg-green-600' },
      'rescheduled': { label: '変更済み', color: 'bg-blue-600' },
      'reschedule_pending': { label: '変更申請中', color: 'bg-orange-600' },
      'completed': { label: '完了', color: 'bg-gray-600' },
      'cancelled': { label: 'キャンセル', color: 'bg-red-600' },
      'no_show': { label: '無断欠席', color: 'bg-red-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isBookingToday = (booking: InterviewBooking) => {
    const today = new Date();
    const bookingDate = new Date(booking.bookingDate);
    return today.toDateString() === bookingDate.toDateString();
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return offlineBookings
      .filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= now &&
               (booking.status === 'confirmed' || booking.status === 'rescheduled');
      })
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  };

  const todaysBookings = offlineBookings.filter(isBookingToday);
  const upcomingBookings = getUpcomingBookings();

  return (
    <div className="space-y-6">
      {/* オフライン状態バナー */}
      {!isOnline && (
        <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <WifiOff className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-medium">オフライン状態</span>
          </div>
          <p className="text-orange-200 text-sm">
            インターネット接続がありません。キャッシュされた予約情報を表示しています。
            オンライン復帰後に最新情報に自動更新されます。
          </p>
        </div>
      )}

      {/* キャッシュ情報 */}
      {cacheInfo && (
        <div className={`border rounded-lg p-4 ${
          cacheInfo.isExpired
            ? 'bg-red-900/30 border-red-500'
            : 'bg-blue-900/30 border-blue-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {cacheInfo.isExpired ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              )}
              <span className={`text-sm font-medium ${
                cacheInfo.isExpired ? 'text-red-400' : 'text-blue-400'
              }`}>
                キャッシュデータ
              </span>
            </div>

            {isOnline && (
              <button
                onClick={handleSyncData}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? '同期中...' : '更新'}
              </button>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-300">
            <p>保存日時: {cacheInfo.timestamp ? new Date(cacheInfo.timestamp).toLocaleString('ja-JP') : '不明'}</p>
            <p>予約件数: {cacheInfo.itemCount}件</p>
            {cacheInfo.isExpired && (
              <p className="text-red-400">⚠️ データが古くなっています</p>
            )}
          </div>
        </div>
      )}

      {/* 本日の予約 */}
      {todaysBookings.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            本日の面談予約
          </h3>
          <div className="space-y-3">
            {todaysBookings.map((booking) => (
              <OfflineBookingCard
                key={booking.id}
                booking={booking}
                isToday={true}
                isOffline={!isOnline}
              />
            ))}
          </div>
        </div>
      )}

      {/* 今後の予約 */}
      {upcomingBookings.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">今後の面談予約</h3>
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <OfflineBookingCard
                key={booking.id}
                booking={booking}
                isToday={false}
                isOffline={!isOnline}
              />
            ))}
          </div>

          {upcomingBookings.length > 5 && (
            <p className="text-gray-400 text-sm mt-4 text-center">
              他 {upcomingBookings.length - 5}件の予約があります
            </p>
          )}
        </div>
      )}

      {/* データがない場合 */}
      {offlineBookings.length === 0 && (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {!isOnline ? 'オフラインデータがありません' : '予約データがありません'}
          </h3>
          <p className="text-gray-500 text-sm">
            {!isOnline
              ? 'オンライン時に一度アプリを利用してからご使用ください'
              : '面談予約を作成してください'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// オフライン用予約カードコンポーネント
interface OfflineBookingCardProps {
  booking: InterviewBooking;
  isToday: boolean;
  isOffline: boolean;
}

const OfflineBookingCard: React.FC<OfflineBookingCardProps> = ({
  booking,
  isToday,
  isOffline
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const getInterviewTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'new_employee_monthly': '新入職員月次面談',
      'regular_annual': '年次面談',
      'management_biannual': '管理職面談',
      'feedback': 'フィードバック面談',
      'career_support': 'キャリア相談',
      'workplace_support': '職場環境相談',
      'individual_consultation': '個別相談',
      'return_to_work': '復職面談',
      'exit_interview': '退職面談'
    };
    return typeMap[type] || '面談';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: '申請中', color: 'bg-yellow-600' },
      'confirmed': { label: '確定', color: 'bg-green-600' },
      'rescheduled': { label: '変更済み', color: 'bg-blue-600' },
      'reschedule_pending': { label: '変更申請中', color: 'bg-orange-600' },
      'completed': { label: '完了', color: 'bg-gray-600' },
      'cancelled': { label: 'キャンセル', color: 'bg-red-600' },
      'no_show': { label: '無断欠席', color: 'bg-red-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isToday
        ? 'border-blue-500 bg-blue-900/20'
        : 'border-slate-600 bg-slate-700/50'
    } ${isOffline ? 'opacity-90' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-medium">{getInterviewTypeDisplay(booking.interviewType)}</h4>
          <p className="text-gray-400 text-sm">{booking.description || '詳細なし'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">
              オフライン
            </span>
          )}
          {getStatusBadge(booking.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(booking.bookingDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{formatTime(booking.timeSlot)}</span>
        </div>
        {booking.interviewerName && (
          <div className="flex items-center gap-2 text-gray-300 col-span-2">
            <MapPin className="w-4 h-4" />
            <span>面談者: {booking.interviewerName}</span>
          </div>
        )}
      </div>

      {/* オフライン時の機能制限表示 */}
      {isOffline && (
        <div className="mt-3 p-2 bg-orange-900/30 border border-orange-600 rounded text-sm">
          <p className="text-orange-300">
            オフライン中は予約の変更・キャンセルができません。
            オンライン復帰後にご利用ください。
          </p>
        </div>
      )}
    </div>
  );
};

export default OfflineBookingViewer;