import React, { useState, useEffect } from 'react';
import { 
  InterviewBooking, 
  TimeSlot, 
  BookingRequest, 
  InterviewType, 
  InterviewCategory 
} from '../../types/interview';
import { InterviewBookingService } from '../../services/InterviewBookingService';

interface InterviewBookingCalendarProps {
  employeeId?: string;
}

const InterviewBookingCalendar: React.FC<InterviewBookingCalendarProps> = ({ 
  employeeId = 'EMP001' 
}) => {
  const bookingService = new InterviewBookingService();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [interviewType, setInterviewType] = useState<InterviewType>('career');
  const [interviewCategory, setInterviewCategory] = useState<InterviewCategory>('career_path');
  const [description, setDescription] = useState('');
  const [availableSlots, setAvailableSlots] = useState<Map<string, TimeSlot[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingBookings, setExistingBookings] = useState<InterviewBooking[]>([]);

  // 時間枠の定義
  const timeSlots = [
    { id: 'slot1', startTime: '13:40', endTime: '14:10', label: '13:40-14:10' },
    { id: 'slot2', startTime: '14:20', endTime: '14:50', label: '14:20-14:50' },
    { id: 'slot3', startTime: '15:00', endTime: '15:30', label: '15:00-15:30' },
    { id: 'slot4', startTime: '15:40', endTime: '16:10', label: '15:40-16:10' },
    { id: 'slot5', startTime: '16:20', endTime: '16:50', label: '16:20-16:50' }
  ];

  // 面談タイプの選択肢
  const interviewTypes = [
    { value: 'regular', label: '定期面談', icon: '📅' },
    { value: 'career', label: 'キャリア相談', icon: '🎯' },
    { value: 'concern', label: '悩み相談', icon: '💭' },
    { value: 'evaluation', label: '評価面談', icon: '📊' },
    { value: 'development', label: '能力開発', icon: '📚' },
    { value: 'other', label: 'その他', icon: '📝' }
  ];

  // カテゴリの選択肢
  const categoryOptions = {
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

  useEffect(() => {
    loadExistingBookings();
  }, [employeeId]);

  useEffect(() => {
    if (selectedDates.length > 0) {
      loadAvailableSlots();
    }
  }, [selectedDates]);

  const loadExistingBookings = async () => {
    try {
      const bookings = await bookingService.getEmployeeBookings(employeeId);
      setExistingBookings(bookings);
    } catch (err) {
      console.error('Failed to load existing bookings:', err);
    }
  };

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const slotsMap = new Map<string, TimeSlot[]>();
      
      for (const date of selectedDates) {
        const slots = await bookingService.getAvailableSlots(date);
        const dateKey = date.toISOString().split('T')[0];
        slotsMap.set(dateKey, slots);
      }
      
      setAvailableSlots(slotsMap);
    } catch (err) {
      setError('利用可能な時間帯の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (selectedDates.length >= 3 && !selectedDates.some(d => d.getTime() === date.getTime())) {
      setError('選択できる日付は最大3日までです');
      return;
    }
    
    setSelectedDates(prev => {
      const exists = prev.some(d => d.getTime() === date.getTime());
      if (exists) {
        return prev.filter(d => d.getTime() !== date.getTime());
      } else {
        return [...prev, date];
      }
    });
    setError(null);
  };

  const handleSlotSelect = (date: Date, slot: TimeSlot) => {
    const dateKey = date.toISOString().split('T')[0];
    const slotKey = `${dateKey}_${slot.slotId}`;
    
    setSelectedSlots(prev => {
      const exists = prev.some(s => `${s.date}_${s.slotId}` === slotKey);
      if (exists) {
        return prev.filter(s => `${s.date}_${s.slotId}` !== slotKey);
      } else {
        return [...prev, { ...slot, date: dateKey }];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      setError('少なくとも1つの時間帯を選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: BookingRequest = {
        preferredDates: selectedDates,
        preferredSlots: selectedSlots,
        interviewType,
        category: interviewCategory,
        description,
        urgency: 'normal'
      };

      const response = await bookingService.requestBooking(employeeId, request);
      
      if (response.success) {
        alert('面談予約が完了しました！');
        // リセット
        setCurrentStep(1);
        setSelectedDates([]);
        setSelectedSlots([]);
        setDescription('');
        loadExistingBookings();
      } else {
        setError(response.message || '予約に失敗しました');
      }
    } catch (err) {
      setError('予約処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const renderDatePicker = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // 土日を除外
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      dates.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, index) => {
          const isSelected = selectedDates.some(d => d.getTime() === date.getTime());
          const dateStr = date.toLocaleDateString('ja-JP', { 
            month: 'numeric', 
            day: 'numeric',
            weekday: 'short'
          });
          
          return (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`
                p-3 rounded-lg text-center transition-all
                ${isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              <div className="text-sm font-medium">{dateStr}</div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderTimeSlots = () => {
    if (selectedDates.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          まず日付を選択してください
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {selectedDates.map(date => {
          const dateKey = date.toISOString().split('T')[0];
          const dateSlots = availableSlots.get(dateKey) || [];
          
          return (
            <div key={dateKey} className="border rounded-lg p-4">
              <h4 className="font-medium text-lg mb-3">
                {date.toLocaleDateString('ja-JP', { 
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </h4>
              
              <div className="grid grid-cols-5 gap-2">
                {timeSlots.map(slot => {
                  const availableSlot = dateSlots.find(s => s.slotId === slot.id);
                  const isAvailable = availableSlot?.isAvailable || false;
                  const isSelected = selectedSlots.some(
                    s => s.date === dateKey && s.slotId === slot.id
                  );
                  
                  return (
                    <button
                      key={slot.id}
                      onClick={() => isAvailable && handleSlotSelect(date, {
                        slotId: slot.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        isAvailable,
                        date: dateKey
                      })}
                      disabled={!isAvailable}
                      className={`
                        p-3 rounded-lg text-center transition-all text-sm
                        ${!isAvailable 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }
                      `}
                    >
                      <div>{slot.label}</div>
                      {!isAvailable && <div className="text-xs">予約済</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">希望日時の選択</h2>
        <p className="text-gray-600 text-lg">
          面談を希望する日と時間帯を選択してください<br />
          <span className="text-sm text-blue-600">（最大3日まで、時間は複数選択可能）</span>
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-lg mb-4">日付を選択</h3>
        {renderDatePicker()}
      </div>

      {selectedDates.length > 0 && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="font-semibold text-lg mb-4">時間帯を選択</h3>
          {loading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : (
            renderTimeSlots()
          )}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <div className="text-sm text-gray-600">
          選択した日付: {selectedDates.length}日<br />
          選択した時間帯: {selectedSlots.length}枠
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          disabled={selectedSlots.length === 0}
          className={`
            px-6 py-3 rounded-lg font-medium text-lg transition-all
            ${selectedSlots.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          次へ進む
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">面談内容の選択</h2>
        <p className="text-gray-600 text-lg">
          相談したい内容を選択してください
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-lg mb-4">面談の種類</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interviewTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setInterviewType(type.value as InterviewType)}
              className={`
                p-4 rounded-lg text-center transition-all
                ${interviewType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                }
              `}
            >
              {type.icon && <div className="text-2xl mb-1">{type.icon}</div>}
              <div className="font-medium">{type.label || '未設定'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="font-semibold text-lg mb-4">詳細カテゴリ</h3>
        <select
          value={interviewCategory}
          onChange={(e) => setInterviewCategory(e.target.value as InterviewCategory)}
          className="w-full p-3 text-lg border border-gray-300 rounded-lg"
        >
          {Object.entries(categoryOptions).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-lg mb-4">相談内容（任意）</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="相談したい内容を簡単に記入してください（任意）"
          className="w-full p-3 text-lg border border-gray-300 rounded-lg"
          rows={4}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 rounded-lg font-medium text-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all"
        >
          戻る
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 rounded-lg font-medium text-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          確認へ進む
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">予約内容の確認</h2>
        <p className="text-gray-600 text-lg">
          以下の内容で予約を申請します
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
        <h3 className="font-semibold text-lg mb-4">予約内容</h3>
        
        <div className="space-y-3">
          <div>
            <span className="font-medium">面談種類:</span>
            <span className="ml-2">
              {interviewTypes.find(t => t.value === interviewType)?.label}
            </span>
          </div>
          
          <div>
            <span className="font-medium">カテゴリ:</span>
            <span className="ml-2">{categoryOptions[interviewCategory]}</span>
          </div>
          
          <div>
            <span className="font-medium">希望日時:</span>
            <div className="mt-2 space-y-1">
              {selectedSlots.map((slot, index) => (
                <div key={index} className="ml-4 text-sm">
                  • {new Date(slot.date).toLocaleDateString('ja-JP')} {slot.startTime}-{slot.endTime}
                </div>
              ))}
            </div>
          </div>
          
          {description && (
            <div>
              <span className="font-medium">相談内容:</span>
              <div className="mt-1 p-3 bg-white rounded border border-gray-200">
                {description}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-3 rounded-lg font-medium text-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all"
        >
          戻る
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`
            px-6 py-3 rounded-lg font-medium text-lg transition-all
            ${loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
            }
          `}
        >
          {loading ? '予約中...' : '予約を申請'}
        </button>
      </div>
    </div>
  );

  const renderExistingBookings = () => {
    if (existingBookings.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">現在の予約状況</h3>
        <div className="space-y-2">
          {existingBookings.map(booking => (
            <div key={booking.id} className="text-sm">
              • {new Date(booking.bookingDate).toLocaleDateString('ja-JP')} 
              {booking.timeSlot.startTime}-{booking.timeSlot.endTime}
              （{booking.status === 'confirmed' ? '確定' : '申請中'}）
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderExistingBookings()}
      
      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`
                flex items-center justify-center w-12 h-12 rounded-full text-lg font-medium
                ${currentStep === step
                  ? 'bg-blue-600 text-white'
                  : currentStep > step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }
              `}
            >
              {currentStep > step ? '✓' : step}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 space-x-8 text-sm">
          <span className={currentStep === 1 ? 'font-bold' : ''}>日時選択</span>
          <span className={currentStep === 2 ? 'font-bold' : ''}>内容選択</span>
          <span className={currentStep === 3 ? 'font-bold' : ''}>確認</span>
        </div>
      </div>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
};

export default InterviewBookingCalendar;