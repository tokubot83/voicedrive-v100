import React, { useState, useEffect } from 'react';
import { 
  InterviewBooking, 
  TimeSlot, 
  BookingRequest, 
  InterviewType, 
  InterviewCategory,
  MedicalEmployeeProfile,
  EmploymentStatus 
} from '../../types/interview';
import { InterviewBookingService } from '../../services/InterviewBookingService';
import InterviewReminderService from '../../services/InterviewReminderService';
import {
  normalizeInterviewType,
  shouldShowCategorySelection,
  getAvailableCategories,
  getInterviewTypeDisplayName,
  INTERVIEW_CLASSIFICATIONS
} from '../../utils/interviewMappingUtils';

interface InterviewBookingCalendarProps {
  employeeId?: string;
  onBookingComplete?: () => void;
}

const InterviewBookingCalendar: React.FC<InterviewBookingCalendarProps> = ({ 
  employeeId = 'EMP001',
  onBookingComplete
}) => {
  const bookingService = InterviewBookingService.getInstance();
  const reminderService = InterviewReminderService.getInstance();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [interviewType, setInterviewType] = useState<InterviewType>('individual_consultation');
  const [interviewCategory, setInterviewCategory] = useState<InterviewCategory | null>(null);
  const [description, setDescription] = useState('');
  const [availableSlots, setAvailableSlots] = useState<Map<string, TimeSlot[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingBookings, setExistingBookings] = useState<InterviewBooking[]>([]);
  
  // 新機能: 雇用状況管理
  const [employeeProfile, setEmployeeProfile] = useState<MedicalEmployeeProfile | null>(null);
  const [availableInterviewTypes, setAvailableInterviewTypes] = useState<InterviewType[]>([]);
  const [reminderStatus, setReminderStatus] = useState<any>(null);

  // 時間枠の定義
  const timeSlots = [
    { id: 'slot1', startTime: '13:40', endTime: '14:10', label: '13:40-14:10' },
    { id: 'slot2', startTime: '14:20', endTime: '14:50', label: '14:20-14:50' },
    { id: 'slot3', startTime: '15:00', endTime: '15:30', label: '15:00-15:30' },
    { id: 'slot4', startTime: '15:40', endTime: '16:10', label: '15:40-16:10' },
    { id: 'slot5', startTime: '16:20', endTime: '16:50', label: '16:20-16:50' }
  ];

  // 面談タイプの選択肢（新体系10種類）
  const interviewTypes = [
    // 定期面談（3種類）
    { value: 'new_employee_monthly', label: '新入職員月次面談', icon: '🩺', description: '新入職員の月次フォローアップ面談', category: 'regular' },
    { value: 'regular_annual', label: '一般職員年次面談', icon: '📅', description: '年1回の定期面談', category: 'regular' },
    { value: 'management_biannual', label: '管理職半年面談', icon: '👔', description: '管理職・リーダー向け半年面談', category: 'regular' },
    // 特別面談（3種類）
    { value: 'return_to_work', label: '復職面談', icon: '🔄', description: '長期休暇からの復職時面談', category: 'special' },
    { value: 'incident_followup', label: 'インシデント後面談', icon: '⚠️', description: '医療事故・インシデント後のフォローアップ', category: 'special' },
    { value: 'exit_interview', label: '退職面談', icon: '👋', description: '退職時の最終面談', category: 'special' },
    // サポート面談（4種類）
    { value: 'feedback', label: 'フィードバック面談', icon: '📊', description: '人事評価後のフィードバック', category: 'support' },
    { value: 'career_support', label: 'キャリア系面談', icon: '🎯', description: 'キャリア形成・スキル開発相談', category: 'support' },
    { value: 'workplace_support', label: '職場環境系面談', icon: '🧘', description: '職場環境・人間関係の相談', category: 'support' },
    { value: 'individual_consultation', label: '個別相談面談', icon: '💬', description: 'その他の個別相談', category: 'support' }
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
    loadEmployeeProfile();
    loadReminderStatus();
  }, [employeeId]);

  useEffect(() => {
    if (selectedDates.length > 0) {
      loadAvailableSlots();
    }
  }, [selectedDates]);

  useEffect(() => {
    if (employeeProfile) {
      updateAvailableInterviewTypes();
    }
  }, [employeeProfile]);

  const loadExistingBookings = async () => {
    try {
      const bookings = await bookingService.getEmployeeInterviewHistory(employeeId);
      setExistingBookings(bookings);
    } catch (err) {
      console.error('Failed to load existing bookings:', err);
    }
  };

  const loadEmployeeProfile = async () => {
    try {
      const profile = reminderService.getEmployeeProfile(employeeId);
      if (!profile) {
        // プロフィールが存在しない場合、デモ用のプロフィールを作成
        const demoProfile: MedicalEmployeeProfile = {
          employeeId,
          employeeName: `職員${employeeId}`,
          hireDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1年前入職と仮定
          employmentStatus: await reminderService.determineEmploymentStatus(employeeId, new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
          department: '内科',
          position: '看護師',
          workPattern: 'day_shift',
          specialCircumstances: {
            isOnLeave: false,
            isRetiring: false,
            isOnMaternityLeave: false
          },
          interviewHistory: {
            totalInterviews: 0,
            mandatoryInterviewsCompleted: 0,
            overdueCount: 0
          }
        };
        await reminderService.updateEmployeeProfile(demoProfile);
        setEmployeeProfile(demoProfile);
      } else {
        setEmployeeProfile(profile);
      }
    } catch (err) {
      console.error('Failed to load employee profile:', err);
    }
  };

  const loadReminderStatus = async () => {
    try {
      const status = await bookingService.getReminderStatus(employeeId);
      setReminderStatus(status);
    } catch (err) {
      console.error('Failed to load reminder status:', err);
    }
  };

  const updateAvailableInterviewTypes = () => {
    if (!employeeProfile) return;

    // 雇用状況に応じて利用可能な面談種別を決定
    let available: InterviewType[] = ['ad_hoc', 'other']; // 基本的に随時面談は常に可能

    switch (employeeProfile.employmentStatus) {
      case 'new_employee':
        available = ['new_employee_monthly', 'ad_hoc', 'stress_care', 'career_development', 'other'];
        break;
      case 'regular_employee':
        available = ['regular_annual', 'ad_hoc', 'career_development', 'stress_care', 'performance_review', 'grievance', 'other'];
        break;
      case 'management':
        available = ['management_biannual', 'ad_hoc', 'career_development', 'performance_review', 'other'];
        break;
      case 'on_leave':
        available = ['return_to_work']; // 休職中は復職面談のみ
        break;
      case 'retiring':
        available = ['exit_interview']; // 退職手続き中は退職面談のみ
        break;
    }

    // 特別面談は状況に応じて追加
    if (employeeProfile.specialCircumstances.isOnMaternityLeave && 
        employeeProfile.specialCircumstances.returnToWorkDate) {
      const oneMonthBefore = new Date(employeeProfile.specialCircumstances.returnToWorkDate);
      oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
      if (new Date() >= oneMonthBefore) {
        available.push('return_to_work');
      }
    }

    setAvailableInterviewTypes(available);

    // デフォルトの面談種別を設定
    if (available.length > 0 && !available.includes(interviewType)) {
      setInterviewType(available[0]);
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
    const slotKey = `${dateKey}_${slot.id}`;
    
    setSelectedSlots(prev => {
      const exists = prev.some(s => `${s.date.toISOString().split('T')[0]}_${s.id}` === slotKey);
      if (exists) {
        return prev.filter(s => `${s.date.toISOString().split('T')[0]}_${s.id}` !== slotKey);
      } else {
        return [...prev, { ...slot, date: date }];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      setError('少なくとも1つの時間帯を選択してください');
      return;
    }

    // カテゴリ選択のバリデーション
    const normalizedType = normalizeInterviewType(interviewType);
    if (shouldShowCategorySelection(normalizedType) && !interviewCategory) {
      setError('この面談種別ではカテゴリの選択が必要です');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: BookingRequest = {
        employeeId,
        preferredDates: selectedDates,
        preferredTimes: selectedSlots.map(slot => `${slot.startTime}-${slot.endTime}`),
        interviewType: normalizedType,
        interviewCategory: interviewCategory || 'other',
        requestedTopics: [],
        description,
        urgencyLevel: 'medium'
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
        
        // 予約完了コールバックを呼び出し
        if (onBookingComplete) {
          onBookingComplete();
        }
      } else {
        setError(response.message || '予約に失敗しました');
      }
    } catch (err) {
      setError('予約処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getEmploymentStatusLabel = (status: EmploymentStatus): string => {
    const labels: Record<EmploymentStatus, string> = {
      'new_employee': '新入職員（1年未満）',
      'regular_employee': '一般職員（1年以上）',
      'management': '管理職・リーダー職',
      'on_leave': '休職中',
      'retiring': '退職手続き中'
    };
    return labels[status] || status;
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
                  const availableSlot = dateSlots.find(s => s.id === slot.id);
                  const isAvailable = availableSlot?.isAvailable || false;
                  const isSelected = selectedSlots.some(
                    s => s.date.toISOString().split('T')[0] === dateKey && s.id === slot.id
                  );
                  
                  return (
                    <button
                      key={slot.id}
                      onClick={() => isAvailable && handleSlotSelect(date, {
                        id: slot.id,
                        date: date,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        isAvailable,
                        isBlocked: slot.isBlocked || false,
                        blockedBy: slot.blockedBy,
                        blockedReason: slot.blockedReason,
                        bookedBy: slot.bookedBy,
                        bookingId: slot.bookingId
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewTypes
            .filter(type => availableInterviewTypes.includes(type.value as InterviewType))
            .map(type => (
            <button
              key={type.value}
              onClick={() => setInterviewType(type.value as InterviewType)}
              className={`
                p-4 rounded-lg text-left transition-all h-auto
                ${interviewType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                }
              `}
            >
              <div className="flex items-center mb-2">
                {type?.icon && <span className="text-2xl mr-2">{type.icon}</span>}
                <div className="font-medium text-sm">{type.label || '未設定'}</div>
              </div>
              {type.description && (
                <div className={`text-xs leading-relaxed ${
                  interviewType === type.value ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {type.description}
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* 雇用状況による制限の説明 */}
        {employeeProfile && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>あなたの雇用状況:</strong> {getEmploymentStatusLabel(employeeProfile.employmentStatus)}
              {employeeProfile.employmentStatus === 'new_employee' && (
                <div className="mt-1 text-xs">
                  入職から{Math.floor((Date.now() - employeeProfile.hireDate.getTime()) / (1000 * 60 * 60 * 24))}日経過
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* カテゴリ選択（条件付き表示） */}
      {shouldShowCategorySelection(interviewType) && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="font-semibold text-lg mb-4">詳細カテゴリ（必須）</h3>
          <p className="text-sm text-gray-600 mb-3">
            {interviewType === 'career_support' && 'キャリアに関する相談内容を選択してください'}
            {interviewType === 'workplace_support' && '職場環境に関する相談内容を選択してください'}
            {interviewType === 'individual_consultation' && '個別相談の内容を選択してください'}
          </p>
          <select
            value={interviewCategory || ''}
            onChange={(e) => setInterviewCategory(e.target.value as InterviewCategory)}
            className="w-full p-3 text-lg border border-gray-300 rounded-lg"
            required={shouldShowCategorySelection(interviewType)}
          >
            <option value="">カテゴリを選択してください</option>
            {getAvailableCategories(interviewType).map((category) => (
              <option key={category} value={category}>
                {categoryOptions[category]}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* カテゴリ不要な面談の説明表示 */}
      {!shouldShowCategorySelection(interviewType) && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>{getInterviewTypeDisplayName(interviewType)}</strong>はカテゴリ選択は不要です。
            直接相談内容をご記入ください。
          </p>
        </div>
      )}

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

  const renderReminderStatus = () => {
    if (!reminderStatus || !employeeProfile) return null;

    const { reminderSchedule, nextInterviewDue, isOverdue } = reminderStatus;

    return (
      <div className={`mb-6 p-4 rounded-lg border ${
        isOverdue 
          ? 'bg-red-50 border-red-200' 
          : nextInterviewDue 
            ? 'bg-blue-50 border-blue-200'
            : 'bg-green-50 border-green-200'
      }`}>
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          {isOverdue ? '⚠️' : nextInterviewDue ? '📅' : '✅'} 面談スケジュール状況
        </h3>
        
        {isOverdue && (
          <div className="text-red-700 font-medium mb-2">
            面談期限が{reminderSchedule?.daysSinceOverdue}日超過しています！
          </div>
        )}
        
        {nextInterviewDue && (
          <div className="space-y-1">
            <div className="text-sm">
              <strong>次回面談予定:</strong> {new Date(nextInterviewDue).toLocaleDateString('ja-JP')}
            </div>
            {employeeProfile.employmentStatus === 'new_employee' && (
              <div className="text-xs text-blue-600">
                新入職員月次面談（入職から{Math.floor((Date.now() - employeeProfile.hireDate.getTime()) / (1000 * 60 * 60 * 24))}日経過）
              </div>
            )}
            {employeeProfile.employmentStatus === 'regular_employee' && (
              <div className="text-xs text-blue-600">
                年次定期面談
              </div>
            )}
          </div>
        )}

        {!nextInterviewDue && !isOverdue && (
          <div className="text-green-700 text-sm">
            現在、定期面談の予定はありません
          </div>
        )}
      </div>
    );
  };

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
              <span className="ml-2 text-xs text-gray-500">
                {interviewTypes.find(t => t.value === booking.interviewType)?.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderReminderStatus()}
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