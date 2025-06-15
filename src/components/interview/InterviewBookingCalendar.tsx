// 面談予約カレンダー（50代でも使いやすいUI設計）
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
  currentUserId: string;
  onBookingComplete: (booking: InterviewBooking) => void;
  onCancel: () => void;
}

export const InterviewBookingCalendar: React.FC<InterviewBookingCalendarProps> = ({
  currentUserId,
  onBookingComplete,
  onCancel
}) => {
  // State管理
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [interviewRequest, setInterviewRequest] = useState<Partial<BookingRequest>>({
    employeeId: currentUserId,
    preferredDates: [],
    preferredTimes: [],
    interviewType: 'career',
    interviewCategory: 'career_path',
    requestedTopics: [],
    urgencyLevel: 'medium'
  });
  
  const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestedAlternatives, setSuggestedAlternatives] = useState<TimeSlot[]>([]);

  const bookingService = InterviewBookingService.getInstance();

  // カレンダー用のデータ準備
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // 30日先まで予約可能

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      // 30日分の空き枠を取得
      const slots: Record<string, TimeSlot[]> = {};
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        if (isWorkingDay(date)) {
          const dateKey = formatDateKey(date);
          slots[dateKey] = await getAvailableSlotsForDate(date);
        }
      }
      setAvailableSlots(slots);
    } catch (error) {
      setErrorMessage('予約情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const isWorkingDay = (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // 月曜〜金曜
  };

  const getAvailableSlotsForDate = async (date: Date): Promise<TimeSlot[]> => {
    // 実装では、InterviewBookingServiceから取得
    const defaultSlots = [
      { id: '1', date, startTime: '13:40', endTime: '14:10', isAvailable: true, isBlocked: false },
      { id: '2', date, startTime: '14:20', endTime: '14:50', isAvailable: true, isBlocked: false },
      { id: '3', date, startTime: '15:00', endTime: '15:30', isAvailable: true, isBlocked: false },
      { id: '4', date, startTime: '15:40', endTime: '16:10', isAvailable: true, isBlocked: false },
      { id: '5', date, startTime: '16:20', endTime: '16:50', isAvailable: true, isBlocked: false }
    ];
    
    // ランダムに一部を予約済みにする（デモ用）
    return defaultSlots.filter(() => Math.random() > 0.3);
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    };
    return date.toLocaleDateString('ja-JP', options);
  };

  const handleDateSelect = (date: Date) => {
    const dateKey = formatDateKey(date);
    const hasAvailableSlots = availableSlots[dateKey]?.length > 0;
    
    if (!hasAvailableSlots) {
      setErrorMessage('この日は予約可能な時間がありません');
      return;
    }

    setSelectedDates(prev => {
      const isAlreadySelected = prev.some(d => formatDateKey(d) === dateKey);
      
      if (isAlreadySelected) {
        return prev.filter(d => formatDateKey(d) !== dateKey);
      } else if (prev.length < 3) {
        return [...prev, date];
      } else {
        setErrorMessage('最大3日まで選択できます');
        return prev;
      }
    });
    setErrorMessage('');
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlots(prev => {
      const isAlreadySelected = prev.includes(timeSlot);
      
      if (isAlreadySelected) {
        return prev.filter(t => t !== timeSlot);
      } else {
        return [...prev, timeSlot];
      }
    });
  };

  const handleStepNext = () => {
    if (currentStep === 1) {
      if (selectedDates.length === 0) {
        setErrorMessage('希望日を選択してください');
        return;
      }
      if (selectedTimeSlots.length === 0) {
        setErrorMessage('希望時間を選択してください');
        return;
      }
      setInterviewRequest(prev => ({
        ...prev,
        preferredDates: selectedDates,
        preferredTimes: selectedTimeSlots
      }));
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!interviewRequest.interviewType) {
        setErrorMessage('面談の種類を選択してください');
        return;
      }
      if (!interviewRequest.interviewCategory) {
        setErrorMessage('面談のカテゴリを選択してください');
        return;
      }
      setCurrentStep(3);
    }
    setErrorMessage('');
  };

  const handleSubmitBooking = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await bookingService.requestBooking(
        currentUserId,
        interviewRequest as BookingRequest
      );
      
      if (response.success) {
        // 成功時の処理
        if (response.bookingId) {
          // 予約情報を取得して返す（実装では、bookingServiceから取得）
          const booking: InterviewBooking = {
            id: response.bookingId,
            employeeId: currentUserId,
            employeeName: '現在のユーザー',
            employeeEmail: 'user@hospital.com',
            employeePhone: '090-0000-0000',
            facility: '本院',
            department: '内科',
            position: '看護師',
            bookingDate: selectedDates[0],
            timeSlot: availableSlots[formatDateKey(selectedDates[0])][0],
            interviewType: interviewRequest.interviewType!,
            interviewCategory: interviewRequest.interviewCategory!,
            requestedTopics: interviewRequest.requestedTopics || [],
            description: interviewRequest.description,
            urgencyLevel: interviewRequest.urgencyLevel!,
            status: 'pending',
            createdAt: new Date(),
            createdBy: currentUserId
          };
          
          onBookingComplete(booking);
        }
      } else {
        setErrorMessage(response.message);
        if (response.suggestedAlternatives) {
          setSuggestedAlternatives(response.suggestedAlternatives);
        }
      }
    } catch (error) {
      setErrorMessage('予約申請に失敗しました。しばらく後にお試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className=\"space-y-6\">
      <div className=\"text-center mb-6\">
        <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">📅 希望日時の選択</h2>
        <p className=\"text-gray-600 text-lg\">
          面談を希望する日と時間帯を選択してください<br />
          <span className=\"text-sm text-blue-600\">（最大3日まで、時間は複数選択可能）</span>
        </p>
      </div>

      {/* 日付選択 */}
      <div className=\"bg-blue-50 p-6 rounded-lg border border-blue-200\">
        <h3 className=\"text-xl font-semibold mb-4 text-blue-800\">🗓️ 希望日を選択</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
          {Array.from({ length: 14 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i + 1);
            const dateKey = formatDateKey(date);
            const hasSlots = availableSlots[dateKey]?.length > 0;
            const isSelected = selectedDates.some(d => formatDateKey(d) === dateKey);
            const isWorkingDayFlag = isWorkingDay(date);
            
            if (!isWorkingDayFlag) return null;

            return (
              <button
                key={dateKey}
                onClick={() => handleDateSelect(date)}
                disabled={!hasSlots}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${{
                  [true]: 'border-blue-500 bg-blue-100 text-blue-800 shadow-md',
                  [false]: hasSlots 
                    ? 'border-gray-300 hover:border-blue-300 hover:bg-blue-50' 
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }[String(isSelected)]}`}
              >
                <div className=\"text-lg font-bold\">
                  {date.getDate()}日
                </div>
                <div className=\"text-sm\">
                  {formatDisplayDate(date)}
                </div>
                <div className=\"text-xs mt-1\">
                  {hasSlots ? `空き${availableSlots[dateKey]?.length || 0}枠` : '空きなし'}
                </div>
              </button>
            );
          })}
        </div>
        
        {selectedDates.length > 0 && (
          <div className=\"mt-4 p-3 bg-white rounded border border-blue-200\">
            <p className=\"text-sm font-medium text-blue-800\">選択した日程:</p>
            <div className=\"flex flex-wrap gap-2 mt-2\">
              {selectedDates.map(date => (
                <span key={formatDateKey(date)} className=\"px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm\">
                  {formatDisplayDate(date)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 時間選択 */}
      <div className=\"bg-green-50 p-6 rounded-lg border border-green-200\">
        <h3 className=\"text-xl font-semibold mb-4 text-green-800\">🕐 希望時間を選択</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3\">
          {[
            { value: '13:40-14:10', label: '13:40-14:10', icon: '🕐' },
            { value: '14:20-14:50', label: '14:20-14:50', icon: '🕑' },
            { value: '15:00-15:30', label: '15:00-15:30', icon: '🕒' },
            { value: '15:40-16:10', label: '15:40-16:10', icon: '🕓' },
            { value: '16:20-16:50', label: '16:20-16:50', icon: '🕔' }
          ].map(slot => {
            const isSelected = selectedTimeSlots.includes(slot.value);
            
            return (
              <button
                key={slot.value}
                onClick={() => handleTimeSlotSelect(slot.value)}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${{
                  [true]: 'border-green-500 bg-green-100 text-green-800 shadow-md',
                  [false]: 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                }[String(isSelected)]}`}
              >
                <div className=\"text-2xl mb-1\">{slot.icon}</div>
                <div className=\"font-bold\">{slot.label}</div>
                <div className=\"text-xs text-gray-600\">30分間</div>
              </button>
            );
          })}
        </div>
        
        {selectedTimeSlots.length > 0 && (
          <div className=\"mt-4 p-3 bg-white rounded border border-green-200\">
            <p className=\"text-sm font-medium text-green-800\">選択した時間:</p>
            <div className=\"flex flex-wrap gap-2 mt-2\">
              {selectedTimeSlots.map(time => (
                <span key={time} className=\"px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm\">
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className=\"space-y-6\">
      <div className=\"text-center mb-6\">
        <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">🎯 面談内容の選択</h2>
        <p className=\"text-gray-600 text-lg\">
          どのような面談をご希望ですか？
        </p>
      </div>

      {/* 面談の種類選択 */}
      <div className=\"bg-purple-50 p-6 rounded-lg border border-purple-200\">
        <h3 className=\"text-xl font-semibold mb-4 text-purple-800\">📋 面談の種類</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          {[
            { value: 'career', label: 'キャリア相談', icon: '🚀', description: 'キャリアアップや将来の方向性について' },
            { value: 'concern', label: '悩み相談', icon: '💭', description: '仕事や職場での悩みについて' },
            { value: 'regular', label: '定期面談', icon: '📅', description: '定期的な状況確認' },
            { value: 'development', label: '能力開発', icon: '📚', description: 'スキルアップや研修について' },
            { value: 'evaluation', label: '評価面談', icon: '⭐', description: '人事評価に関する相談' },
            { value: 'other', label: 'その他', icon: '💬', description: 'その他のご相談' }
          ].map(type => {
            const isSelected = interviewRequest.interviewType === type.value;
            
            return (
              <button
                key={type.value}
                onClick={() => setInterviewRequest(prev => ({ ...prev, interviewType: type.value as InterviewType }))}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${{
                  [true]: 'border-purple-500 bg-purple-100 text-purple-800 shadow-md',
                  [false]: 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                }[String(isSelected)]}`}
              >
                <div className=\"flex items-center gap-3 mb-2\">
                  <span className=\"text-2xl\">{type.icon}</span>
                  <span className=\"font-bold text-lg\">{type.label}</span>
                </div>
                <p className=\"text-sm\">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* カテゴリ選択 */}
      <div className=\"bg-orange-50 p-6 rounded-lg border border-orange-200\">
        <h3 className=\"text-xl font-semibold mb-4 text-orange-800\">🏷️ 相談カテゴリ</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-3\">
          {[
            { value: 'career_path', label: 'キャリアパス', icon: '🛤️' },
            { value: 'skill_development', label: 'スキル開発', icon: '🎯' },
            { value: 'work_environment', label: '職場環境', icon: '🏢' },
            { value: 'workload_balance', label: 'ワークライフバランス', icon: '⚖️' },
            { value: 'interpersonal', label: '人間関係', icon: '👥' },
            { value: 'performance', label: 'パフォーマンス', icon: '📊' },
            { value: 'compensation', label: '給与・待遇', icon: '💰' },
            { value: 'training', label: '研修・教育', icon: '🎓' }
          ].map(category => {
            const isSelected = interviewRequest.interviewCategory === category.value;
            
            return (
              <button
                key={category.value}
                onClick={() => setInterviewRequest(prev => ({ ...prev, interviewCategory: category.value as InterviewCategory }))}
                className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${{
                  [true]: 'border-orange-500 bg-orange-100 text-orange-800 shadow-md',
                  [false]: 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                }[String(isSelected)]}`}
              >
                <div className=\"flex items-center gap-2\">
                  <span className=\"text-xl\">{category.icon}</span>
                  <span className=\"font-medium\">{category.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 緊急度選択 */}
      <div className=\"bg-red-50 p-6 rounded-lg border border-red-200\">
        <h3 className=\"text-xl font-semibold mb-4 text-red-800\">⚡ 緊急度</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-3\">
          {[
            { value: 'low', label: '通常', icon: '🟢', description: '1-2週間以内' },
            { value: 'medium', label: '少し急ぎ', icon: '🟡', description: '1週間以内' },
            { value: 'high', label: '急ぎ', icon: '🟠', description: '2-3日以内' },
            { value: 'urgent', label: '緊急', icon: '🔴', description: '至急' }
          ].map(urgency => {
            const isSelected = interviewRequest.urgencyLevel === urgency.value;
            
            return (
              <button
                key={urgency.value}
                onClick={() => setInterviewRequest(prev => ({ ...prev, urgencyLevel: urgency.value as any }))}
                className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${{
                  [true]: 'border-red-500 bg-red-100 text-red-800 shadow-md',
                  [false]: 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                }[String(isSelected)]}`}
              >
                <div className=\"text-2xl mb-1\">{urgency.icon}</div>
                <div className=\"font-bold\">{urgency.label}</div>
                <div className=\"text-xs\">{urgency.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className=\"space-y-6\">
      <div className=\"text-center mb-6\">
        <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">✅ 内容確認・申請</h2>
        <p className=\"text-gray-600 text-lg\">
          以下の内容で面談を申請します
        </p>
      </div>

      {/* 確認内容 */}
      <div className=\"bg-gray-50 p-6 rounded-lg border border-gray-300\">
        <h3 className=\"text-xl font-semibold mb-6 text-gray-800\">📋 申請内容</h3>
        
        <div className=\"space-y-6\">
          {/* 希望日時 */}
          <div className=\"bg-white p-4 rounded border\">
            <h4 className=\"font-bold text-blue-800 mb-2 flex items-center gap-2\">
              📅 希望日時
            </h4>
            <div className=\"space-y-2\">
              <div>
                <span className=\"font-medium\">希望日:</span>
                <div className=\"flex flex-wrap gap-2 mt-1\">
                  {selectedDates.map(date => (
                    <span key={formatDateKey(date)} className=\"px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm\">
                      {formatDisplayDate(date)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className=\"font-medium\">希望時間:</span>
                <div className=\"flex flex-wrap gap-2 mt-1\">
                  {selectedTimeSlots.map(time => (
                    <span key={time} className=\"px-2 py-1 bg-green-100 text-green-800 rounded text-sm\">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 面談内容 */}
          <div className=\"bg-white p-4 rounded border\">
            <h4 className=\"font-bold text-purple-800 mb-2 flex items-center gap-2\">
              🎯 面談内容
            </h4>
            <div className=\"space-y-2\">
              <div><span className=\"font-medium\">種類:</span> {
                {
                  'career': 'キャリア相談',
                  'concern': '悩み相談',
                  'regular': '定期面談',
                  'development': '能力開発',
                  'evaluation': '評価面談',
                  'other': 'その他'
                }[interviewRequest.interviewType || 'career']
              }</div>
              <div><span className=\"font-medium\">カテゴリ:</span> {
                {
                  'career_path': 'キャリアパス',
                  'skill_development': 'スキル開発',
                  'work_environment': '職場環境',
                  'workload_balance': 'ワークライフバランス',
                  'interpersonal': '人間関係',
                  'performance': 'パフォーマンス',
                  'compensation': '給与・待遇',
                  'training': '研修・教育'
                }[interviewRequest.interviewCategory || 'career_path']
              }</div>
              <div><span className=\"font-medium\">緊急度:</span> {
                {
                  'low': '通常',
                  'medium': '少し急ぎ',
                  'high': '急ぎ',
                  'urgent': '緊急'
                }[interviewRequest.urgencyLevel || 'medium']
              }</div>
            </div>
          </div>

          {/* 詳細入力 */}
          <div className=\"bg-white p-4 rounded border\">
            <h4 className=\"font-bold text-gray-800 mb-2\">💭 詳細・備考（任意）</h4>
            <textarea
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              rows={4}
              placeholder=\"相談したい内容や、特別な配慮が必要な場合はご記入ください\"
              value={interviewRequest.description || ''}
              onChange={(e) => setInterviewRequest(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className=\"bg-yellow-50 p-4 rounded-lg border border-yellow-300\">
        <h4 className=\"font-bold text-yellow-800 mb-2 flex items-center gap-2\">
          ⚠️ 申請前の確認事項
        </h4>
        <ul className=\"text-sm text-yellow-700 space-y-1\">
          <li>• 申請後、人財統括本部で内容を確認し、面談者を決定します</li>
          <li>• 確定通知は申請から2営業日以内にお送りします</li>
          <li>• 希望日時で調整できない場合、代替案をご提案します</li>
          <li>• 緊急の場合は直接お電話でもお受けしています</li>
        </ul>
      </div>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className=\"flex justify-between pt-6 border-t bg-white sticky bottom-0 z-10\">
      <div>
        {currentStep > 1 && (
          <button
            type=\"button\"
            onClick={() => setCurrentStep(currentStep - 1)}
            className=\"px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg\"
          >
            ← 前へ
          </button>
        )}
      </div>
      
      <div className=\"flex gap-4\">
        <button
          type=\"button\"
          onClick={onCancel}
          className=\"px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg\"
        >
          キャンセル
        </button>
        
        {currentStep < 3 ? (
          <button
            type=\"button\"
            onClick={handleStepNext}
            className=\"px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg shadow-md\"
          >
            次へ →
          </button>
        ) : (
          <button
            type=\"button\"
            onClick={handleSubmitBooking}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-medium text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isLoading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? '申請中...' : '✅ 面談を申請する'}
          </button>
        )}
      </div>
    </div>
  );

  const renderProgressIndicator = () => (
    <div className=\"mb-8\">
      <div className=\"flex items-center justify-center space-x-4 mb-4\">
        {[1, 2, 3].map(step => (
          <div key={step} className=\"flex items-center\">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className=\"text-center text-lg\">
        <span className=\"font-medium\">
          {currentStep === 1 && '日時選択'}
          {currentStep === 2 && '内容選択'}
          {currentStep === 3 && '確認・申請'}
        </span>
        <span className=\"text-gray-500 ml-2\">({currentStep}/3)</span>
      </div>
    </div>
  );

  const renderErrorMessage = () => {
    if (!errorMessage) return null;
    
    return (
      <div className=\"bg-red-50 border border-red-200 rounded-lg p-4 mb-6\">
        <div className=\"flex items-center gap-2\">
          <span className=\"text-red-600 text-xl\">⚠️</span>
          <span className=\"text-red-800 font-medium\">{errorMessage}</span>
        </div>
        
        {suggestedAlternatives.length > 0 && (
          <div className=\"mt-3\">
            <p className=\"text-red-700 font-medium mb-2\">代替案：</p>
            <div className=\"space-y-1\">
              {suggestedAlternatives.slice(0, 3).map((slot, index) => (
                <div key={index} className=\"text-sm text-red-600\">
                  {formatDisplayDate(slot.date)} {slot.startTime}-{slot.endTime}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading && Object.keys(availableSlots).length === 0) {
    return (
      <div className=\"flex items-center justify-center min-h-96\">
        <div className=\"text-center\">
          <div className=\"text-4xl mb-4\">⏳</div>
          <div className=\"text-xl font-medium text-gray-600\">予約情報を読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className=\"max-w-4xl mx-auto p-6 bg-white min-h-screen\">
      <div className=\"mb-8 text-center\">
        <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">💼 面談予約</h1>
        <p className=\"text-gray-600 text-lg\">
          人財統括本部との面談をオンラインで簡単に予約できます
        </p>
      </div>

      {renderProgressIndicator()}
      {renderErrorMessage()}

      <div className=\"bg-white rounded-lg shadow-sm border border-gray-200 p-6\">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {renderNavigationButtons()}
    </div>
  );
};