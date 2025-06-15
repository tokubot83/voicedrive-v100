// 面談管理ダッシュボード（人財統括本部 LEVEL 5-7用）
import React, { useState, useEffect } from 'react';
import { 
  InterviewBooking, 
  TimeSlot, 
  BookingManagementData,
  InterviewStats,
  Interviewer 
} from '../../types/interview';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';
import { InterviewBookingService } from '../../services/InterviewBookingService';

interface InterviewManagementDashboardProps {
  currentUserId: string;
  permissionLevel: PermissionLevel;
}

export const InterviewManagementDashboard: React.FC<InterviewManagementDashboardProps> = ({
  currentUserId,
  permissionLevel
}) => {
  // State管理
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'pending' | 'schedule' | 'stats'>('today');
  const [managementData, setManagementData] = useState<BookingManagementData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<InterviewBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false);
  
  const bookingService = InterviewBookingService.getInstance();

  // 権限チェック
  const canManageBookings = permissionLevel >= PermissionLevel.LEVEL_5;
  const canConductInterviews = permissionLevel >= PermissionLevel.LEVEL_6;
  const canOverrideSettings = permissionLevel >= PermissionLevel.LEVEL_7;

  useEffect(() => {
    loadManagementData();
    
    // 5分ごとにデータを更新
    const interval = setInterval(loadManagementData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadManagementData = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getManagementData(currentUserId, permissionLevel);
      setManagementData(data);
    } catch (error) {
      console.error('Failed to load management data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    setActionInProgress(bookingId);
    try {
      const response = await bookingService.confirmBooking(bookingId, currentUserId, permissionLevel);
      if (response.success) {
        await loadManagementData();
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBlockTimeSlot = async (date: Date, slotId: string, reason: string) => {
    try {
      const response = await bookingService.blockTimeSlot(date, slotId, reason, currentUserId, permissionLevel);
      if (response.success) {
        await loadManagementData();
        setShowBlockTimeModal(false);
      }
    } catch (error) {
      console.error('Failed to block time slot:', error);
    }
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'rescheduled': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string): string => {
    const labels = {
      'pending': '申請中',
      'confirmed': '確定',
      'completed': '完了',
      'cancelled': 'キャンセル',
      'rescheduled': '変更済み'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getUrgencyIcon = (urgency: string): string => {
    const icons = {
      'low': '🟢',
      'medium': '🟡', 
      'high': '🟠',
      'urgent': '🔴'
    };
    return icons[urgency as keyof typeof icons] || '🟡';
  };

  const renderTabNavigation = () => (
    <div className=\"flex border-b border-gray-200 mb-6\">
      {[
        { key: 'today', label: '今日の予約', icon: '📅' },
        { key: 'week', label: '今週の予約', icon: '📆' },
        { key: 'pending', label: '申請待ち', icon: '⏳' },
        { key: 'schedule', label: 'スケジュール管理', icon: '🗓️' },
        { key: 'stats', label: '統計', icon: '📊' }
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key as any)}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
            activeTab === tab.key
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span className=\"mr-2\">{tab.icon}</span>
          {tab.label}
          {tab.key === 'pending' && managementData?.pendingRequests.length ? (
            <span className=\"ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full\">
              {managementData.pendingRequests.length}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );

  const renderBookingList = (bookings: InterviewBooking[], title: string) => (
    <div className=\"bg-white rounded-lg shadow-sm border border-gray-200\">
      <div className=\"px-6 py-4 border-b border-gray-200\">
        <h3 className=\"text-lg font-semibold text-gray-900\">{title}</h3>
        <p className=\"text-sm text-gray-600\">{bookings.length}件の面談予約</p>
      </div>
      
      <div className=\"divide-y divide-gray-200\">
        {bookings.length === 0 ? (
          <div className=\"px-6 py-8 text-center text-gray-500\">
            <div className=\"text-4xl mb-2\">📭</div>
            <p>該当する面談予約はありません</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div
              key={booking.id}
              className=\"px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200\"
              onClick={() => setSelectedBooking(booking)}
            >
              <div className=\"flex items-center justify-between\">
                <div className=\"flex-1\">
                  <div className=\"flex items-center gap-3 mb-2\">
                    <span className=\"text-lg\">{getUrgencyIcon(booking.urgencyLevel)}</span>
                    <h4 className=\"font-medium text-gray-900\">{booking.employeeName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                  
                  <div className=\"text-sm text-gray-600 space-y-1\">
                    <div className=\"flex items-center gap-4\">
                      <span>🏢 {booking.department}</span>
                      <span>👤 {booking.position}</span>
                    </div>
                    <div className=\"flex items-center gap-4\">
                      <span>📅 {formatDateTime(booking.bookingDate)}</span>
                      <span>🕒 {booking.timeSlot.startTime}-{booking.timeSlot.endTime}</span>
                    </div>
                    <div>
                      <span>💼 {booking.interviewType === 'career' ? 'キャリア相談' : booking.interviewType}</span>
                    </div>
                  </div>
                </div>
                
                <div className=\"flex flex-col items-end gap-2\">
                  {booking.status === 'pending' && canManageBookings && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmBooking(booking.id);
                      }}
                      disabled={actionInProgress === booking.id}
                      className=\"px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50\"
                    >
                      {actionInProgress === booking.id ? '処理中...' : '✅ 確定'}
                    </button>
                  )}
                  
                  {booking.interviewerId && (
                    <div className=\"text-xs text-gray-500\">
                      👨‍💼 {booking.interviewerName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderScheduleManagement = () => (
    <div className=\"space-y-6\">
      <div className=\"flex justify-between items-center\">
        <h3 className=\"text-lg font-semibold text-gray-900\">スケジュール管理</h3>
        <div className=\"flex gap-3\">
          {canManageBookings && (
            <button
              onClick={() => setShowBlockTimeModal(true)}
              className=\"px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500\"
            >
              🚫 時間枠をブロック
            </button>
          )}
          <button
            onClick={loadManagementData}
            className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500\"
          >
            🔄 更新
          </button>
        </div>
      </div>

      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        {/* 利用可能時間枠 */}
        <div className=\"bg-white rounded-lg shadow-sm border border-gray-200 p-6\">
          <h4 className=\"font-medium text-gray-900 mb-4\">✅ 利用可能時間枠</h4>
          <div className=\"space-y-2 max-h-64 overflow-y-auto\">
            {managementData?.availableSlots.slice(0, 10).map(slot => (
              <div key={slot.id} className=\"flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded\">
                <div>
                  <div className=\"font-medium\">
                    {slot.date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </div>
                  <div className=\"text-sm text-gray-600\">{slot.startTime}-{slot.endTime}</div>
                </div>
                {canManageBookings && (
                  <button
                    onClick={() => handleBlockTimeSlot(slot.date, slot.id, ' 管理者によるブロック')}
                    className=\"px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded\"
                  >
                    ブロック
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ブロック済み時間枠 */}
        <div className=\"bg-white rounded-lg shadow-sm border border-gray-200 p-6\">
          <h4 className=\"font-medium text-gray-900 mb-4\">🚫 ブロック済み時間枠</h4>
          <div className=\"space-y-2 max-h-64 overflow-y-auto\">
            {managementData?.blockedSlots.length === 0 ? (
              <p className=\"text-gray-500 text-sm\">ブロック済みの時間枠はありません</p>
            ) : (
              managementData?.blockedSlots.map(slot => (
                <div key={slot.id} className=\"p-3 bg-red-50 border border-red-200 rounded\">
                  <div className=\"flex items-center justify-between\">
                    <div>
                      <div className=\"font-medium\">
                        {slot.date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </div>
                      <div className=\"text-sm text-gray-600\">{slot.startTime}-{slot.endTime}</div>
                    </div>
                    {canManageBookings && (
                      <button className=\"px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded\">
                        解除
                      </button>
                    )}
                  </div>
                  {slot.blockedReason && (
                    <div className=\"text-xs text-gray-500 mt-1\">理由: {slot.blockedReason}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 面談者の空き状況 */}
      <div className=\"bg-white rounded-lg shadow-sm border border-gray-200 p-6\">
        <h4 className=\"font-medium text-gray-900 mb-4\">👨‍💼 面談者の空き状況</h4>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          {managementData?.interviewerAvailability.map(({ interviewer, availableSlots }) => (
            <div key={interviewer.id} className=\"p-4 border border-gray-200 rounded-lg\">
              <div className=\"flex items-center gap-3 mb-3\">
                <div className=\"w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center\">
                  👨‍💼
                </div>
                <div>
                  <div className=\"font-medium\">{interviewer.name}</div>
                  <div className=\"text-sm text-gray-600\">{interviewer.title}</div>
                </div>
              </div>
              <div className=\"text-sm\">
                <div className=\"flex justify-between\">
                  <span>今週の空き枠:</span>
                  <span className=\"font-medium\">{availableSlots.length}枠</span>
                </div>
                <div className=\"flex justify-between\">
                  <span>現在の予約:</span>
                  <span className=\"font-medium\">{interviewer.currentBookings}件</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    if (!managementData?.stats) return null;
    
    const stats = managementData.stats;
    
    return (
      <div className=\"space-y-6\">
        <h3 className=\"text-lg font-semibold text-gray-900\">📊 面談統計</h3>
        
        {/* 概要統計 */}
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
          <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center\">
            <div className=\"text-3xl font-bold text-blue-600\">{stats.totalBookings}</div>
            <div className=\"text-sm text-gray-600\">総予約数</div>
          </div>
          <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center\">
            <div className=\"text-3xl font-bold text-green-600\">{stats.completedInterviews}</div>
            <div className=\"text-sm text-gray-600\">完了済み</div>
          </div>
          <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center\">
            <div className=\"text-3xl font-bold text-yellow-600\">{stats.pendingBookings}</div>
            <div className=\"text-sm text-gray-600\">申請中</div>
          </div>
          <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center\">
            <div className=\"text-3xl font-bold text-red-600\">{stats.cancelledBookings}</div>
            <div className=\"text-sm text-gray-600\">キャンセル</div>
          </div>
        </div>

        {/* 期間別統計 */}
        <div className=\"bg-white rounded-lg shadow-sm border border-gray-200 p-6\">
          <h4 className=\"font-medium text-gray-900 mb-4\">期間別面談実績</h4>
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
            <div className=\"text-center p-4 bg-blue-50 rounded-lg\">
              <div className=\"text-2xl font-bold text-blue-600\">{stats.thisMonth}</div>
              <div className=\"text-sm text-gray-600\">今月</div>
            </div>
            <div className=\"text-center p-4 bg-green-50 rounded-lg\">
              <div className=\"text-2xl font-bold text-green-600\">{stats.lastMonth}</div>
              <div className=\"text-sm text-gray-600\">先月</div>
            </div>
            <div className=\"text-center p-4 bg-purple-50 rounded-lg\">
              <div className=\"text-2xl font-bold text-purple-600\">{stats.thisQuarter}</div>
              <div className=\"text-sm text-gray-600\">今四半期</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingModal = () => {
    if (!selectedBooking) return null;
    
    return (
      <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4\">
        <div className=\"bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto\">
          <div className=\"px-6 py-4 border-b border-gray-200 flex justify-between items-center\">
            <h3 className=\"text-lg font-semibold\">面談予約詳細</h3>
            <button
              onClick={() => setSelectedBooking(null)}
              className=\"text-gray-400 hover:text-gray-600 text-2xl\"
            >
              ×
            </button>
          </div>
          
          <div className=\"p-6 space-y-4\">
            <div className=\"grid grid-cols-2 gap-4\">
              <div>
                <label className=\"text-sm font-medium text-gray-600\">申請者</label>
                <div className=\"mt-1\">{selectedBooking.employeeName}</div>
              </div>
              <div>
                <label className=\"text-sm font-medium text-gray-600\">部署・職種</label>
                <div className=\"mt-1\">{selectedBooking.department} / {selectedBooking.position}</div>
              </div>
              <div>
                <label className=\"text-sm font-medium text-gray-600\">面談日時</label>
                <div className=\"mt-1\">
                  {formatDateTime(selectedBooking.bookingDate)}<br />
                  {selectedBooking.timeSlot.startTime}-{selectedBooking.timeSlot.endTime}
                </div>
              </div>
              <div>
                <label className=\"text-sm font-medium text-gray-600\">面談者</label>
                <div className=\"mt-1\">{selectedBooking.interviewerName || '未割り当て'}</div>
              </div>
              <div>
                <label className=\"text-sm font-medium text-gray-600\">面談種類</label>
                <div className=\"mt-1\">{selectedBooking.interviewType}</div>
              </div>
              <div>
                <label className=\"text-sm font-medium text-gray-600\">緊急度</label>
                <div className=\"mt-1 flex items-center gap-2\">
                  {getUrgencyIcon(selectedBooking.urgencyLevel)}
                  {selectedBooking.urgencyLevel}
                </div>
              </div>
            </div>
            
            {selectedBooking.description && (
              <div>
                <label className=\"text-sm font-medium text-gray-600\">詳細・備考</label>
                <div className=\"mt-1 p-3 bg-gray-50 rounded\">{selectedBooking.description}</div>
              </div>
            )}
            
            <div className=\"flex gap-3 pt-4 border-t\">
              {selectedBooking.status === 'pending' && canManageBookings && (
                <button
                  onClick={() => handleConfirmBooking(selectedBooking.id)}
                  disabled={actionInProgress === selectedBooking.id}
                  className=\"px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50\"
                >
                  ✅ 確定
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className=\"px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50\"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-96\">
        <div className=\"text-center\">
          <div className=\"text-4xl mb-4\">⏳</div>
          <div className=\"text-xl font-medium text-gray-600\">管理データを読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!canManageBookings) {
    return (
      <div className=\"text-center py-12\">
        <div className=\"text-4xl mb-4\">🚫</div>
        <div className=\"text-xl font-medium text-gray-900 mb-2\">アクセス権限がありません</div>
        <div className=\"text-gray-600\">面談管理機能にアクセスするには、レベル5以上の権限が必要です。</div>
      </div>
    );
  }

  return (
    <div className=\"max-w-7xl mx-auto p-6\">
      <div className=\"mb-6\">
        <h1 className=\"text-2xl font-bold text-gray-900 mb-2\">💼 面談管理ダッシュボード</h1>
        <p className=\"text-gray-600\">
          面談予約の管理・調整を行います（権限レベル: {permissionLevel}）
        </p>
      </div>

      {renderTabNavigation()}

      <div className=\"space-y-6\">
        {activeTab === 'today' && managementData && 
          renderBookingList(managementData.todaysBookings, '📅 今日の面談予約')
        }
        
        {activeTab === 'week' && managementData && 
          renderBookingList(managementData.weeklyBookings, '📆 今週の面談予約')
        }
        
        {activeTab === 'pending' && managementData && 
          renderBookingList(managementData.pendingRequests, '⏳ 申請待ちの面談予約')
        }
        
        {activeTab === 'schedule' && renderScheduleManagement()}
        
        {activeTab === 'stats' && renderStats()}
      </div>

      {renderBookingModal()}
    </div>
  );
};