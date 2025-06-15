import React, { useState, useEffect } from 'react';
import { 
  UserRegistrationData, 
  RegistrationStep1Data,
  RegistrationStep2Data, 
  RegistrationStep3Data,
  RegistrationStep4Data,
  ValidationResult,
  FormOptions,
  ProfileCompleteness
} from '../../types/userRegistration';

interface UserRegistrationFormProps {
  onSubmit: (data: UserRegistrationData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<UserRegistrationData>;
  mode?: 'registration' | 'edit';
}

export const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  mode = 'registration'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserRegistrationData>>(initialData || {});
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formOptions, setFormOptions] = useState<FormOptions>({
    facilities: [],
    departments: [],
    positions: [],
    timeSlots: [],
    languages: [],
    shiftPatterns: []
  });

  useEffect(() => {
    loadFormOptions();
    if (initialData) {
      calculateCompleteness(initialData);
    }
  }, [initialData]);

  const loadFormOptions = async () => {
    // 実際のアプリケーションではAPIから取得
    setFormOptions({
      facilities: [
        { id: 'F001', name: '本院' },
        { id: 'F002', name: '東病棟' },
        { id: 'F003', name: '西病棟' }
      ],
      departments: [
        { id: 'D001', name: '内科' },
        { id: 'D002', name: '外科' },
        { id: 'D003', name: '小児科' },
        { id: 'D004', name: '看護部' }
      ],
      positions: [
        { id: 'P001', name: '医師' },
        { id: 'P002', name: '看護師' },
        { id: 'P003', name: '技師' },
        { id: 'P004', name: '事務職' }
      ],
      timeSlots: [
        { id: 'TS001', label: '午前（9:00-12:00）' },
        { id: 'TS002', label: '午後（13:00-17:00）' },
        { id: 'TS003', label: '夕方（16:00-19:00）' }
      ],
      languages: [
        { code: 'ja', name: '日本語' },
        { code: 'en', name: '英語' },
        { code: 'zh', name: '中国語' }
      ],
      shiftPatterns: [
        { id: 'SP001', name: '日勤のみ' },
        { id: 'SP002', name: '2交代制' },
        { id: 'SP003', name: '3交代制' }
      ]
    });
  };

  const calculateCompleteness = (data: Partial<UserRegistrationData>) => {
    const basicScore = data.employeeId && data.name && data.email ? 25 : 0;
    const profileScore = data.department && data.position ? 25 : 0;
    const skillsScore = data.skills && data.skills.length > 0 ? 25 : 0;
    const interviewScore = data.interviewPreferences ? 25 : 0;
    
    const totalScore = basicScore + profileScore + skillsScore + interviewScore;
    
    setCompleteness({
      basicInfo: basicScore === 25,
      profileInfo: profileScore === 25,
      skillsInterests: skillsScore === 25,
      interviewSettings: interviewScore === 25,
      overallPercentage: totalScore
    });
  };

  const validateStep = (step: number): ValidationResult => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!formData.employeeId) errors.push('社員IDは必須です');
        if (!formData.name) errors.push('氏名は必須です');
        if (!formData.email) errors.push('メールアドレスは必須です');
        break;
      case 2:
        if (!formData.department) errors.push('所属部署は必須です');
        if (!formData.position) errors.push('職位は必須です');
        break;
      case 3:
        // スキル・興味は任意
        break;
      case 4:
        // 面談設定も任意
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleNext = () => {
    const validation = validateStep(currentStep);
    setValidation(validation);
    
    if (validation.isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const finalValidation = validateStep(4);
    if (!finalValidation.isValid) {
      setValidation(finalValidation);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as UserRegistrationData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">基本情報</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          社員ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.employeeId || ''}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="例: EMP12345"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          氏名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="山田 太郎"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          フリガナ
        </label>
        <input
          type="text"
          value={formData.nameKana || ''}
          onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="ヤマダ タロウ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="yamada@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          電話番号
        </label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="090-1234-5678"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">プロフィール情報</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          所属施設 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.facility || ''}
          onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {formOptions.facilities.map(facility => (
            <option key={facility.id} value={facility.id}>{facility.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          所属部署 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.department || ''}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {formOptions.departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          職位 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.position || ''}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {formOptions.positions.map(pos => (
            <option key={pos.id} value={pos.id}>{pos.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          入職年月
        </label>
        <input
          type="month"
          value={formData.joinDate || ''}
          onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          勤務形態
        </label>
        <select
          value={formData.shiftPattern || ''}
          onChange={(e) => setFormData({ ...formData, shiftPattern: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {formOptions.shiftPatterns.map(pattern => (
            <option key={pattern.id} value={pattern.id}>{pattern.name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">スキル・興味関心</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          保有スキル・資格
        </label>
        <textarea
          value={formData.skills?.join('\n') || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            skills: e.target.value.split('\n').filter(s => s.trim()) 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="例：看護師免許&#10;認定看護師（感染管理）&#10;BLS資格"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          興味のある分野
        </label>
        <div className="space-y-2">
          {['管理職', '専門職', 'スキルアップ', '教育・指導', '研究', 'その他'].map(interest => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.interests?.includes(interest) || false}
                onChange={(e) => {
                  const interests = formData.interests || [];
                  if (e.target.checked) {
                    setFormData({ ...formData, interests: [...interests, interest] });
                  } else {
                    setFormData({ ...formData, interests: interests.filter(i => i !== interest) });
                  }
                }}
                className="mr-2"
              />
              {interest}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          キャリア目標
        </label>
        <textarea
          value={formData.careerGoals || ''}
          onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="今後のキャリアで実現したいことを記入してください"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          使用可能言語
        </label>
        <div className="space-y-2">
          {formOptions.languages.map(lang => (
            <label key={lang.code} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.languages?.includes(lang.code) || false}
                onChange={(e) => {
                  const languages = formData.languages || [];
                  if (e.target.checked) {
                    setFormData({ ...formData, languages: [...languages, lang.code] });
                  } else {
                    setFormData({ ...formData, languages: languages.filter(l => l !== lang.code) });
                  }
                }}
                className="mr-2"
              />
              {lang.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">面談設定</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          面談希望頻度
        </label>
        <select
          value={formData.interviewPreferences?.preferredFrequency || ''}
          onChange={(e) => setFormData({
            ...formData,
            interviewPreferences: {
              ...formData.interviewPreferences,
              preferredFrequency: e.target.value
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          <option value="monthly">月1回</option>
          <option value="quarterly">3ヶ月に1回</option>
          <option value="semi-annual">半年に1回</option>
          <option value="annual">年1回</option>
          <option value="as-needed">必要時のみ</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          希望時間帯
        </label>
        <div className="space-y-2">
          {formOptions.timeSlots.map(slot => (
            <label key={slot.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.interviewPreferences?.preferredTimeSlots?.includes(slot.id) || false}
                onChange={(e) => {
                  const slots = formData.interviewPreferences?.preferredTimeSlots || [];
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      interviewPreferences: {
                        ...formData.interviewPreferences,
                        preferredTimeSlots: [...slots, slot.id]
                      }
                    });
                  } else {
                    setFormData({
                      ...formData,
                      interviewPreferences: {
                        ...formData.interviewPreferences,
                        preferredTimeSlots: slots.filter(s => s !== slot.id)
                      }
                    });
                  }
                }}
                className="mr-2"
              />
              {slot.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          希望する面談形式
        </label>
        <div className="space-y-2">
          {[
            { value: 'in-person', label: '対面' },
            { value: 'online', label: 'オンライン' },
            { value: 'phone', label: '電話' }
          ].map(format => (
            <label key={format.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.interviewPreferences?.preferredFormats?.includes(format.value) || false}
                onChange={(e) => {
                  const formats = formData.interviewPreferences?.preferredFormats || [];
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      interviewPreferences: {
                        ...formData.interviewPreferences,
                        preferredFormats: [...formats, format.value]
                      }
                    });
                  } else {
                    setFormData({
                      ...formData,
                      interviewPreferences: {
                        ...formData.interviewPreferences,
                        preferredFormats: formats.filter(f => f !== format.value)
                      }
                    });
                  }
                }}
                className="mr-2"
              />
              {format.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.interviewPreferences?.emailNotifications || false}
            onChange={(e) => setFormData({
              ...formData,
              interviewPreferences: {
                ...formData.interviewPreferences,
                emailNotifications: e.target.checked
              }
            })}
            className="mr-2"
          />
          面談予約に関するメール通知を受け取る
        </label>
      </div>
    </div>
  );

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`flex-1 text-center ${
              step <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
              step < currentStep ? 'bg-blue-600 text-white' :
              step === currentStep ? 'bg-blue-600 text-white' :
              'bg-gray-300 text-gray-600'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            <div className="text-xs mt-1">
              {step === 1 && '基本情報'}
              {step === 2 && 'プロフィール'}
              {step === 3 && 'スキル・興味'}
              {step === 4 && '面談設定'}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-200 h-2 rounded-full">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">
        {mode === 'registration' ? 'ユーザー登録' : 'プロフィール編集'}
      </h1>

      {renderProgressBar()}

      {validation.errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">{error}</p>
          ))}
        </div>
      )}

      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="flex justify-between">
        <button
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          {currentStep === 1 ? 'キャンセル' : '戻る'}
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            次へ
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting ? '登録中...' : '登録完了'}
          </button>
        )}
      </div>

      {completeness && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">プロフィール完成度: {completeness.overallPercentage}%</h3>
          <div className="space-y-1 text-sm">
            <div className={completeness.basicInfo ? 'text-green-600' : 'text-gray-400'}>
              ✓ 基本情報
            </div>
            <div className={completeness.profileInfo ? 'text-green-600' : 'text-gray-400'}>
              ✓ プロフィール情報
            </div>
            <div className={completeness.skillsInterests ? 'text-green-600' : 'text-gray-400'}>
              ✓ スキル・興味関心
            </div>
            <div className={completeness.interviewSettings ? 'text-green-600' : 'text-gray-400'}>
              ✓ 面談設定
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRegistrationForm;