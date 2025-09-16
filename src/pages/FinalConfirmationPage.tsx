import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, User, MapPin, Calendar, Phone, Mail, AlertTriangle, RefreshCw, Edit } from 'lucide-react';
import { fetchBookingConfirmation, BookingConfirmation } from '../api/proposalAPI';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const FinalConfirmationPage: React.FC = () => {
  const { voicedriveRequestId } = useParams<{ voicedriveRequestId: string }>();
  const navigate = useNavigate();

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 確定データ取得
  useEffect(() => {
    const loadConfirmation = async () => {
      if (!voicedriveRequestId) {
        setError('リクエストIDが見つかりません');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchBookingConfirmation(voicedriveRequestId);
        setConfirmation(data);
      } catch (err) {
        console.error('Failed to load booking confirmation:', err);
        setError('確定データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadConfirmation();

    // リアルタイム更新のためのポーリング（30秒間隔）
    const pollInterval = setInterval(() => {
      if (!loading) {
        loadConfirmation();
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [voicedriveRequestId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }),
      time: dateObj.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">面談予約の確定状況を確認中...</p>
          <p className="mt-2 text-sm text-gray-500">医療システムからの応答をお待ちください</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">確認エラー</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>再試行</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">確定処理中</h2>
          <p className="text-gray-600 mb-6">
            面談予約の確定処理が進行中です。<br />
            しばらくお待ちください。
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>状況を更新</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(
    confirmation.finalReservation.scheduledDate,
    confirmation.finalReservation.scheduledTime
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 成功ヘッダー */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 面談予約が確定しました！
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            ご選択いただいた面談の予約が正式に確定いたしました。
          </p>
          <div className="bg-green-50 rounded-lg p-4 inline-block">
            <p className="text-green-800 font-medium">
              予約ID: <span className="font-mono">{confirmation.bookingId}</span>
            </p>
            <p className="text-sm text-green-600 mt-1">
              確定日時: {new Date(confirmation.confirmedAt).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>

        {/* 面談詳細 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            📅 面談詳細
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 日時・場所情報 */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">日時</h3>
                  <p className="text-gray-600">{date}</p>
                  <p className="text-lg font-medium text-gray-800">{time}</p>
                  <p className="text-sm text-gray-500">
                    所要時間: {confirmation.finalReservation.duration}分
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">場所</h3>
                  <p className="text-gray-800">{confirmation.finalReservation.location}</p>
                  <p className="text-sm text-gray-500">
                    方式: {confirmation.finalReservation.type}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">面談担当者</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {confirmation.finalReservation.interviewerName}
                  </p>
                  <p className="text-gray-600">
                    {confirmation.finalReservation.interviewerTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* 通知状況 */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">📢 通知状況</h3>
              <div className="space-y-3">
                <div className={`
                  flex items-center space-x-3 p-3 rounded-lg
                  ${confirmation.notifications.interviewerNotified
                    ? 'bg-green-50 text-green-800'
                    : 'bg-yellow-50 text-yellow-800'
                  }
                `}>
                  <CheckCircle className={`w-5 h-5 ${confirmation.notifications.interviewerNotified ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm">
                    面談担当者への通知
                    {confirmation.notifications.interviewerNotified ? ' ✓' : ' (処理中)'}
                  </span>
                </div>

                <div className={`
                  flex items-center space-x-3 p-3 rounded-lg
                  ${confirmation.notifications.calendarUpdated
                    ? 'bg-green-50 text-green-800'
                    : 'bg-yellow-50 text-yellow-800'
                  }
                `}>
                  <CheckCircle className={`w-5 h-5 ${confirmation.notifications.calendarUpdated ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm">
                    カレンダー更新
                    {confirmation.notifications.calendarUpdated ? ' ✓' : ' (処理中)'}
                  </span>
                </div>

                <div className={`
                  flex items-center space-x-3 p-3 rounded-lg
                  ${confirmation.notifications.reminderScheduled
                    ? 'bg-green-50 text-green-800'
                    : 'bg-yellow-50 text-yellow-800'
                  }
                `}>
                  <CheckCircle className={`w-5 h-5 ${confirmation.notifications.reminderScheduled ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm">
                    リマインダー設定
                    {confirmation.notifications.reminderScheduled ? ' ✓' : ' (処理中)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メッセージ */}
        {confirmation.message && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              💬 人事部からのメッセージ
            </h3>
            <p className="text-blue-800 leading-relaxed">{confirmation.message}</p>
          </div>
        )}

        {/* 次のステップ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            🚀 次のステップ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">📧 確認メール</h3>
              <p className="text-gray-600 text-sm mb-4">
                面談詳細の確認メールが送信されます。メールが届かない場合は人事部までご連絡ください。
              </p>
              <div className="text-sm text-gray-500">
                送信先: {confirmation.finalReservation.staffName}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">⏰ リマインダー</h3>
              <p className="text-gray-600 text-sm mb-4">
                面談の1日前と1時間前にリマインダーメールが送信されます。
              </p>
              <div className="text-sm text-gray-500">
                システムによる自動送信
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">📋 事前準備</h3>
              <p className="text-gray-600 text-sm mb-4">
                面談で話したい内容を事前に整理しておくことをお勧めします。
              </p>
              <div className="text-sm text-gray-500">
                キャリア相談、悩み事など
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">🔄 変更・キャンセル</h3>
              <p className="text-gray-600 text-sm mb-4">
                予定変更が必要な場合は、できるだけ早めにご連絡ください。
              </p>
              <div className="text-sm text-gray-500">
                最低24時間前まで
              </div>
            </div>
          </div>
        </div>

        {/* 緊急連絡先 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            📞 緊急連絡先
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">緊急時電話</div>
                <div className="font-medium text-gray-800">
                  内線1234 (人事部直通)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">メール</div>
                <div className="font-medium text-gray-800">
                  hr-support@koiseikai.or.jp
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>ホームに戻る</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <Edit className="w-5 h-5" />
            <span>印刷して保存</span>
          </button>
        </div>

        {/* デバッグ情報（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <h4 className="font-medium mb-2">デバッグ情報</h4>
            <p>Booking ID: {confirmation.bookingId}</p>
            <p>Request ID: {confirmation.requestId}</p>
            <p>Confirmed By: {confirmation.confirmedBy}</p>
            <p>Confirmed At: {new Date(confirmation.confirmedAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalConfirmationPage;