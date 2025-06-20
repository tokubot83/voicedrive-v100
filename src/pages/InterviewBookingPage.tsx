import React, { useState, useEffect } from 'react';
import { InterviewBooking } from '../types/interview';
import { InterviewBookingService } from '../services/InterviewBookingService';
import InterviewBookingCalendar from '../components/interview/InterviewBookingCalendar';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MobileFooter } from '../components/layout/MobileFooter';

const InterviewBookingPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Safe demo mode hook usage
  let demoUser = null;
  try {
    const demoMode = useDemoMode();
    demoUser = demoMode?.currentUser;
  } catch (error) {
    // Demo mode provider not available, use auth user only
    console.log('Demo mode not available, using auth user');
  }
  
  const bookingService = InterviewBookingService.getInstance();
  const [existingBookings, setExistingBookings] = useState<InterviewBooking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const activeUser = demoUser || currentUser;

  useEffect(() => {
    loadUserBookings();
  }, [activeUser]);

  const loadUserBookings = async () => {
    if (!activeUser) return;
    
    setLoading(true);
    try {
      const bookings = await bookingService.getEmployeeInterviewHistory(activeUser.id);
      setExistingBookings(bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    loadUserBookings(); // 予約完了後にリストを更新
  };

  const getStatusBadge = (status: InterviewBooking['status']) => {
    const statusConfig = {
      confirmed: { label: '確定', className: 'bg-green-100 text-green-800' },
      pending: { label: '確認中', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
      completed: { label: '完了', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getInterviewTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      // 新しい医療介護系面談種別
      new_employee_monthly: '新入職員月次面談',
      regular_annual: '年次定期面談',
      management_biannual: '管理職面談',
      ad_hoc: '随時面談',
      incident_followup: 'インシデント後面談',
      return_to_work: '復職面談',
      career_development: 'キャリア開発面談',
      stress_care: 'ストレスケア面談',
      performance_review: '人事評価面談',
      grievance: '苦情・相談面談',
      exit_interview: '退職面談',
      // 旧システム互換
      regular: '定期面談',
      career: 'キャリア相談',
      concern: '悩み相談',
      evaluation: '評価面談',
      development: '能力開発',
      other: 'その他'
    };
    return typeLabels[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      career_path: 'キャリアパス',
      skill_development: 'スキル開発',
      work_environment: '職場環境',
      workload_balance: '業務量調整',
      interpersonal: '人間関係',
      performance: '業績改善',
      compensation: '待遇・処遇',
      training: '研修・教育',
      promotion: '昇進・昇格',
      transfer: '異動希望',
      health_safety: '健康・安全',
      other: 'その他'
    };
    return categoryLabels[category] || category;
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('この予約をキャンセルしますか？')) return;
    
    try {
      // TODO: cancelBookingメソッドを実装
      // await bookingService.cancelBooking(bookingId);
      alert('キャンセル機能は準備中です');
      // loadUserBookings();
    } catch (error) {
      alert('キャンセルに失敗しました');
    }
  };

  const upcomingBookings = existingBookings.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  );
  const pastBookings = existingBookings.filter(b => 
    b.status === 'completed' || b.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">面談予約・予約情報確認</h1>
            <p className="text-gray-400 text-sm">人財統括本部との面談予約と、あなたの予約状況を確認できます</p>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 予約情報確認セクション */}
            <div className="lg:col-span-2 space-y-6">
              {/* 予約中の面談 */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">📅 予約中の面談</h2>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    ➕ 新しい面談を予約
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-400">読み込み中...</p>
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400 mb-4">予約中の面談はありません</p>
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      初回面談を予約する
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border border-slate-600/50 bg-slate-700/30 rounded-lg p-4 hover:bg-slate-600/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">
                                {getInterviewTypeLabel(booking.interviewType)}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-300">
                              <p>📅 {new Date(booking.bookingDate).toLocaleDateString('ja-JP')} {booking.timeSlot.startTime}-{booking.timeSlot.endTime}</p>
                              <p>📂 カテゴリ: {getCategoryLabel(booking.interviewCategory)}</p>
                              <p>👤 担当者: {booking.interviewerName || '調整中'}</p>
                              {booking.description && (
                                <p className="text-gray-400 mt-2">📝 {booking.description}</p>
                              )}
                            </div>
                          </div>
                          
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="ml-4 px-3 py-1 text-red-400 hover:bg-red-900/20 rounded border border-red-700/50 text-sm"
                            >
                              キャンセル
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 過去の面談履歴 */}
              {pastBookings.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">📋 過去の面談履歴</h2>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {pastBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="border border-slate-600/50 bg-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">
                                {getInterviewTypeLabel(booking.interviewType)}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-sm text-gray-300">
                              {new Date(booking.bookingDate).toLocaleDateString('ja-JP')} - {getCategoryLabel(booking.interviewCategory)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 利用案内サイドバー */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4">
                  📋 利用案内
                </h2>
                <div className="space-y-4 text-sm text-gray-300">
                  <div>
                    <h3 className="font-semibold mb-2">⏰ 面談時間</h3>
                    <ul className="space-y-1">
                      <li>• 平日 13:40〜16:50</li>
                      <li>• 1回30分間</li>
                      <li>• 5枠/日（最大）</li>
                      <li>• 夜勤者：午前中も対応可</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">📅 予約制限（雇用状況別）</h3>
                    <ul className="space-y-1">
                      <li>• 新入職員：月1回必須</li>
                      <li>• 一般職員：年1回定期</li>
                      <li>• 管理職：半年1回</li>
                      <li>• 随時面談：四半期2回まで</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">🩺 医療従事者向け面談</h3>
                    <ul className="space-y-1">
                      <li>• ストレスケア相談</li>
                      <li>• インシデント後フォロー</li>
                      <li>• キャリア開発支援</li>
                      <li>• 復職時面談</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">📞 お問い合わせ</h3>
                    <ul className="space-y-1">
                      <li>• 人財統括本部</li>
                      <li>• 内線: 2200</li>
                      <li>• 受付: 9:00-17:00</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 月の利用状況 */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">📊 今月の利用状況</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">利用回数</span>
                    <span className="font-medium text-white">{upcomingBookings.length + pastBookings.filter(b => new Date(b.bookingDate).getMonth() === new Date().getMonth()).length}/2回</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(((upcomingBookings.length + pastBookings.filter(b => new Date(b.bookingDate).getMonth() === new Date().getMonth()).length) / 2) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    月2回までご利用いただけます
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 新規予約モーダル */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">新しい面談を予約</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <InterviewBookingCalendar 
                employeeId={activeUser?.id}
                onBookingComplete={handleBookingComplete}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
};

export default InterviewBookingPage;