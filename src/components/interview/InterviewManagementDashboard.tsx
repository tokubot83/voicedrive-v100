import React, { useState, useEffect } from 'react';
import { 
  InterviewBooking, 
  TimeSlot,
  InterviewStatus,
  DailySchedule,
  WeeklyStatistics
} from '../../types/interview';
import { InterviewBookingService } from '../../services/InterviewBookingService';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

interface InterviewManagementDashboardProps {
  managerId?: string;
}

const InterviewManagementDashboard: React.FC<InterviewManagementDashboardProps> = ({ 
  managerId = 'MGR001' 
}) => {
  const bookingService = new InterviewBookingService();
  const { metadata } = usePermissions(managerId);
  
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<InterviewBooking[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<InterviewBooking | null>(null);

  // 権限レベルによる機能制限
  const canManageSchedule = metadata?.level && metadata.level >= PermissionLevel.LEVEL_5;
  const canConductInterview = metadata?.level && 
    (metadata.level === PermissionLevel.LEVEL_6 || metadata.level === PermissionLevel.LEVEL_7);
  const canViewStatistics = metadata?.level && metadata.level >= PermissionLevel.LEVEL_7;

  useEffect(() => {
    loadData();
  }, [activeTab, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'today':
          await loadTodayBookings();
          break;
        case 'weekly':
          await loadWeeklySchedule();
          break;
        case 'pending':
          await loadPendingBookings();
          break;
        case 'schedule':
          await loadScheduleManagement();
          break;
        case 'statistics':
          await loadStatistics();
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayBookings = async () => {
    const today = new Date();
    const todayBookings = await bookingService.getBookingsByDate(today);
    setBookings(todayBookings);
  };

  const loadWeeklySchedule = async () => {
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4); // Friday
    
    const weeklyBookings = await bookingService.getBookingsByDateRange(startDate, endDate);
    setBookings(weeklyBookings);
  };

  const loadPendingBookings = async () => {
    const pending = await bookingService.getPendingBookings();
    setBookings(pending);
  };

  const loadScheduleManagement = async () => {
    // スケジュール管理用のデータを読み込む
    const schedule = await bookingService.getAvailableSlots(selectedDate);
    // ここでは簡略化
  };

  const loadStatistics = async () => {
    const stats = await bookingService.getWeeklyStatistics(new Date());
    setWeeklyStats(stats);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: InterviewStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus, managerId);
      loadData(); // リロード
      alert('ステータスを更新しました');
    } catch (error) {
      alert('ステータス更新に失敗しました');
    }
  };

  const handleScheduleBlock = async (date: Date, slotId: string) => {
    if (!canManageSchedule) {
      alert('スケジュール管理の権限がありません');
      return;
    }

    try {
      await bookingService.blockTimeSlot(date, slotId, 'maintenance', managerId);
      alert('時間枠をブロックしました');
      loadData();
    } catch (error) {
      alert('ブロックに失敗しました');
    }
  };

  const renderTabNavigation = () => (
    <div className="flex border-b border-gray-200 mb-6">
      {[
        { key: 'today', label: '今日の予約', icon: '📅' },
        { key: 'weekly', label: '週間スケジュール', icon: '📆' },
        { key: 'pending', label: '承認待ち', icon: '⏳' },
        canManageSchedule && { key: 'schedule', label: 'スケジュール管理', icon: '⚙️' },
        canViewStatistics && { key: 'statistics', label: '統計', icon: '📊' }
      ].filter(Boolean).map((tab: any) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`
            px-6 py-3 font-medium text-sm transition-colors
            ${activeTab === tab.key
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {tab?.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label || '未設定'}
        </button>
      ))}
    </div>
  );

  const renderTodayBookings = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {new Date().toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}の予約
      </h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          本日の予約はありません
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => (
            <div 
              key={booking.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                  </h3>
                  <p className="text-gray-600">
                    社員ID: {booking.employeeId} | {booking.employeeName}
                  </p>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {booking.status === 'confirmed' ? '確定' : 
                   booking.status === 'pending' ? '申請中' : 
                   booking.status === 'completed' ? '完了' : 'キャンセル'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <p>種類: {booking.interviewType} | カテゴリ: {booking.category}</p>
                {booking.description && (
                  <p className="mt-1">相談内容: {booking.description}</p>
                )}
              </div>
              
              {canConductInterview && booking.status === 'confirmed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    面談完了
                  </button>
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    詳細表示
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWeeklySchedule = () => {
    const weekDays = ['月', '火', '水', '木', '金'];
    const timeSlots = [
      '13:40-14:10',
      '14:20-14:50', 
      '15:00-15:30',
      '15:40-16:10',
      '16:20-16:50'
    ];

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">週間スケジュール</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border-b text-left">時間</th>
                {weekDays.map(day => (
                  <th key={day} className="p-3 border-b text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, slotIndex) => (
                <tr key={slot} className="hover:bg-gray-50">
                  <td className="p-3 border-b font-medium">{slot}</td>
                  {weekDays.map((day, dayIndex) => {
                    const booking = bookings.find(b => {
                      const bookingDate = new Date(b.bookingDate);
                      return bookingDate.getDay() === dayIndex + 1 && 
                             b.timeSlot.startTime === slot.split('-')[0];
                    });
                    
                    return (
                      <td key={day} className="p-3 border-b text-center">
                        {booking ? (
                          <div className="bg-blue-100 text-blue-800 p-2 rounded text-xs">
                            {booking.employeeName}
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPendingBookings = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">承認待ち予約</h2>
      
      {bookings.filter(b => b.status === 'pending').length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          承認待ちの予約はありません
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.filter(b => b.status === 'pending').map(booking => (
            <div 
              key={booking.id}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">
                    {booking.employeeName} ({booking.employeeId})
                  </h3>
                  <p className="text-sm text-gray-600">
                    申請日: {new Date(booking.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              
              <div className="text-sm mb-3">
                <p>希望日時:</p>
                <ul className="ml-4">
                  {booking.preferredSlots?.map((slot, index) => (
                    <li key={index}>
                      • {new Date(slot.date).toLocaleDateString('ja-JP')} {slot.startTime}-{slot.endTime}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  承認
                </button>
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  却下
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScheduleManagement = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">スケジュール管理</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">時間枠ブロック設定</h3>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">日付</label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">時間枠</label>
            <select className="px-3 py-2 border rounded-lg">
              <option value="slot1">13:40-14:10</option>
              <option value="slot2">14:20-14:50</option>
              <option value="slot3">15:00-15:30</option>
              <option value="slot4">15:40-16:10</option>
              <option value="slot5">16:20-16:50</option>
            </select>
          </div>
          <button
            onClick={() => handleScheduleBlock(selectedDate, 'slot1')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            ブロック
          </button>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">面談者アサイン</h3>
        <p className="text-sm text-gray-600">
          Level 6-7のスタッフに面談を割り当てることができます
        </p>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">統計情報</h2>
      
      {weeklyStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">今週の面談数</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {weeklyStats.totalBookings}
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">完了率</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {weeklyStats.completionRate}%
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">平均面談時間</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {weeklyStats.averageDuration}分
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">カテゴリ別集計</h3>
        <div className="space-y-2">
          {weeklyStats?.categoryBreakdown && Object.entries(weeklyStats.categoryBreakdown).map(([category, count]) => (
            <div key={category} className="flex justify-between">
              <span>{category}</span>
              <span className="font-medium">{count}件</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 権限表示 */}
      <div className="mb-4 text-sm text-gray-600">
        ログイン: {metadata?.name} (Level {metadata?.level})
      </div>
      
      {/* タブナビゲーション */}
      {renderTabNavigation()}
      
      {/* コンテンツエリア */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      ) : (
        <div>
          {activeTab === 'today' && renderTodayBookings()}
          {activeTab === 'weekly' && renderWeeklySchedule()}
          {activeTab === 'pending' && renderPendingBookings()}
          {activeTab === 'schedule' && canManageSchedule && renderScheduleManagement()}
          {activeTab === 'statistics' && canViewStatistics && renderStatistics()}
        </div>
      )}
      
      {/* 詳細モーダル */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">面談詳細</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">社員:</span> {selectedBooking.employeeName}
              </div>
              <div>
                <span className="font-medium">日時:</span> 
                {new Date(selectedBooking.bookingDate).toLocaleDateString('ja-JP')} 
                {selectedBooking.timeSlot.startTime}-{selectedBooking.timeSlot.endTime}
              </div>
              <div>
                <span className="font-medium">種類:</span> {selectedBooking.interviewType}
              </div>
              <div>
                <span className="font-medium">カテゴリ:</span> {selectedBooking.category}
              </div>
              {selectedBooking.description && (
                <div>
                  <span className="font-medium">相談内容:</span>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedBooking.description}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewManagementDashboard;