// ユーザー登録フォーム（面談予約機能統合版）
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
  // フォームステート
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserRegistrationData>>(initialData || {});
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // フォームオプション
  const [formOptions, setFormOptions] = useState<FormOptions>({
    facilities: [],
    departments: [],
    positions: [],
    timeSlots: [],
    languages: [],
    shiftPatterns: []
  });

  // コンポーネント初期化
  useEffect(() => {
    loadFormOptions();
    if (initialData) {
      calculateCompleteness(initialData);
    }
  }, [initialData]);

  const loadFormOptions = async () => {
    // 実際の実装では、APIから取得
    const options: FormOptions = {
      facilities: [
        { id: 'facility_001', name: '本院' },
        { id: 'facility_002', name: '分院' },
        { id: 'facility_003', name: '介護施設' }
      ],
      departments: [
        { id: 'dept_001', name: '内科', facilityId: 'facility_001' },
        { id: 'dept_002', name: '外科', facilityId: 'facility_001' },
        { id: 'dept_003', name: '看護部', facilityId: 'facility_001' },
        { id: 'dept_004', name: '人財統括本部', facilityId: 'facility_001' }
      ],
      positions: [
        { id: 'pos_001', name: '医師', permissionLevel: 3 },
        { id: 'pos_002', name: '看護師', permissionLevel: 1 },
        { id: 'pos_003', name: '看護師長', permissionLevel: 2 },
        { id: 'pos_004', name: '部長', permissionLevel: 9 },
        { id: 'pos_005', name: 'キャリア支援部門員', permissionLevel: 6 },
        { id: 'pos_006', name: '戦略企画部門員', permissionLevel: 5 }
      ],
      timeSlots: [
        { value: '13:40-14:10', label: '13:40-14:10' },
        { value: '14:20-14:50', label: '14:20-14:50' },
        { value: '15:00-15:30', label: '15:00-15:30' },
        { value: '15:40-16:10', label: '15:40-16:10' },
        { value: '16:20-16:50', label: '16:20-16:50' }
      ],
      languages: [
        { value: 'japanese', label: '日本語' },
        { value: 'english', label: '英語' },
        { value: 'both', label: '日本語・英語両方' }
      ],
      shiftPatterns: [
        { value: 'day', label: '日勤', description: '通常の日中勤務' },
        { value: 'night', label: '夜勤', description: '夜間勤務' },
        { value: 'rotating', label: '交代制', description: '日勤・夜勤の交代制' },
        { value: 'flexible', label: '変則', description: '変則的な勤務パターン' }
      ]
    };
    
    setFormOptions(options);
  };

  const calculateCompleteness = (data: Partial<UserRegistrationData>) => {
    // プロフィール完成度を計算
    const sections = {
      basic: calculateSectionCompleteness(data.personalInfo, ['lastName', 'firstName', 'email', 'phoneNumber']),
      organization: calculateSectionCompleteness(data.organizationInfo, ['facilityId', 'departmentId', 'positionId', 'hireDate']),
      interview: calculateSectionCompleteness(data.interviewInfo, ['birthDate', 'careerGoals', 'interviewAvailability']),
      work: calculateSectionCompleteness(data.workInfo, ['regularSchedule']),
      contact: calculateSectionCompleteness(data.contactPreferences, ['preferredContactMethod']),
      accessibility: data.accessibility ? 100 : 0,
      privacy: calculateSectionCompleteness(data.privacySettings, ['profileVisibility', 'dataRetentionConsent'])
    };

    const overall = Math.round(Object.values(sections).reduce((sum, val) => sum + val, 0) / Object.keys(sections).length);

    setCompleteness({
      overall,
      sections,
      missingFields: [], // 実装では詳細な不足フィールドを計算
      recommendations: [] // 実装では改善提案を生成
    });
  };

  const calculateSectionCompleteness = (sectionData: any, requiredFields: string[]): number => {
    if (!sectionData) return 0;
    
    const completedFields = requiredFields.filter(field => {
      const value = sectionData[field];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const validateStep = (step: number): ValidationResult => {
    const errors: any[] = [];
    
    switch (step) {
      case 1:
        if (!formData.personalInfo?.lastName) errors.push({ field: 'lastName', message: '姓を入力してください', code: 'REQUIRED' });
        if (!formData.personalInfo?.firstName) errors.push({ field: 'firstName', message: '名を入力してください', code: 'REQUIRED' });
        if (!formData.personalInfo?.email) errors.push({ field: 'email', message: 'メールアドレスを入力してください', code: 'REQUIRED' });
        if (!formData.authInfo?.employeeId) errors.push({ field: 'employeeId', message: '職員IDを入力してください', code: 'REQUIRED' });
        break;
      
      case 2:
        if (!formData.organizationInfo?.facilityId) errors.push({ field: 'facilityId', message: '施設を選択してください', code: 'REQUIRED' });
        if (!formData.organizationInfo?.departmentId) errors.push({ field: 'departmentId', message: '部署を選択してください', code: 'REQUIRED' });
        break;
        
      case 3:
        if (!formData.interviewInfo?.birthDate) errors.push({ field: 'birthDate', message: '生年月日を入力してください', code: 'REQUIRED' });
        break;
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleStepSubmit = () => {
    const stepValidation = validateStep(currentStep);
    setValidation(stepValidation);
    
    if (stepValidation.isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleFinalSubmit();
      }
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData as UserRegistrationData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = <K extends keyof UserRegistrationData>(
    section: K, 
    data: Partial<UserRegistrationData[K]>
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const renderProgressBar = () => (
    <div className=\"mb-8\">
      <div className=\"flex items-center justify-between mb-2\">
        <span className=\"text-sm font-medium text-gray-600\">登録進捗</span>
        <span className=\"text-sm text-gray-500\">{currentStep}/4 ステップ</span>
      </div>
      <div className=\"w-full bg-gray-200 rounded-full h-2\">
        <div 
          className=\"bg-blue-600 h-2 rounded-full transition-all duration-300\"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
      </div>
      {completeness && (
        <div className=\"mt-2 text-xs text-gray-500\">
          プロフィール完成度: {completeness.overall}%
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className=\"space-y-6\">
      <h2 className=\"text-xl font-bold text-gray-900 mb-6\">基本情報・認証情報</h2>
      
      {/* 基本情報 */}
      <div className=\"bg-gray-50 p-4 rounded-lg\">
        <h3 className=\"text-lg font-semibold mb-4\">基本情報</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              姓 <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"text\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"田中\"
              value={formData.personalInfo?.lastName || ''}
              onChange={(e) => updateFormData('personalInfo', { lastName: e.target.value })}
            />
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              名 <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"text\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"太郎\"
              value={formData.personalInfo?.firstName || ''}
              onChange={(e) => updateFormData('personalInfo', { firstName: e.target.value })}
            />
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              姓（カナ）
            </label>
            <input
              type=\"text\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"タナカ\"
              value={formData.personalInfo?.lastNameKana || ''}
              onChange={(e) => updateFormData('personalInfo', { lastNameKana: e.target.value })}
            />
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              名（カナ）
            </label>
            <input
              type=\"text\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"タロウ\"
              value={formData.personalInfo?.firstNameKana || ''}
              onChange={(e) => updateFormData('personalInfo', { firstNameKana: e.target.value })}
            />
          </div>
          <div className=\"md:col-span-2\">
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              メールアドレス <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"email\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"tanaka@hospital.com\"
              value={formData.personalInfo?.email || ''}
              onChange={(e) => updateFormData('personalInfo', { email: e.target.value })}
            />
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              電話番号 <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"tel\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"090-0000-0000\"
              value={formData.personalInfo?.phoneNumber || ''}
              onChange={(e) => updateFormData('personalInfo', { phoneNumber: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 認証情報 */}
      <div className=\"bg-gray-50 p-4 rounded-lg\">
        <h3 className=\"text-lg font-semibold mb-4\">認証情報</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              職員ID <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"text\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"EMP001\"
              value={formData.authInfo?.employeeId || ''}
              onChange={(e) => updateFormData('authInfo', { employeeId: e.target.value })}
            />
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              パスワード <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"password\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              placeholder=\"8文字以上\"
              value={formData.authInfo?.password || ''}
              onChange={(e) => updateFormData('authInfo', { password: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className=\"space-y-6\">
      <h2 className=\"text-xl font-bold text-gray-900 mb-6\">組織・勤務情報</h2>
      
      {/* 組織情報 */}
      <div className=\"bg-gray-50 p-4 rounded-lg\">
        <h3 className=\"text-lg font-semibold mb-4\">組織情報</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              施設 <span className=\"text-red-500\">*</span>
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.organizationInfo?.facilityId || ''}
              onChange={(e) => {
                const facility = formOptions.facilities.find(f => f.id === e.target.value);
                updateFormData('organizationInfo', { 
                  facilityId: e.target.value,
                  facilityName: facility?.name || ''
                });
              }}
            >
              <option value=\"\">選択してください</option>
              {formOptions.facilities.map(facility => (
                <option key={facility.id} value={facility.id}>{facility.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              部署 <span className=\"text-red-500\">*</span>
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.organizationInfo?.departmentId || ''}
              onChange={(e) => {
                const department = formOptions.departments.find(d => d.id === e.target.value);
                updateFormData('organizationInfo', { 
                  departmentId: e.target.value,
                  departmentName: department?.name || ''
                });
              }}
              disabled={!formData.organizationInfo?.facilityId}
            >
              <option value=\"\">選択してください</option>
              {formOptions.departments
                .filter(dept => dept.facilityId === formData.organizationInfo?.facilityId)
                .map(department => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              職種・役職 <span className=\"text-red-500\">*</span>
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.organizationInfo?.positionId || ''}
              onChange={(e) => {
                const position = formOptions.positions.find(p => p.id === e.target.value);
                updateFormData('organizationInfo', { 
                  positionId: e.target.value,
                  positionName: position?.name || '',
                  permissionLevel: position?.permissionLevel || 1
                });
              }}
            >
              <option value=\"\">選択してください</option>
              {formOptions.positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.name} (権限レベル: {position.permissionLevel})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              入社日 <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"date\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.organizationInfo?.hireDate ? formData.organizationInfo.hireDate.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFormData('organizationInfo', { hireDate: new Date(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* 勤務情報 */}
      <div className=\"bg-gray-50 p-4 rounded-lg\">
        <h3 className=\"text-lg font-semibold mb-4\">勤務情報</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              勤務パターン
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.workInfo?.regularSchedule?.shiftPattern || ''}
              onChange={(e) => updateFormData('workInfo', { 
                regularSchedule: { 
                  ...formData.workInfo?.regularSchedule,
                  shiftPattern: e.target.value as any
                }
              })}
            >
              <option value=\"\">選択してください</option>
              {formOptions.shiftPatterns.map(pattern => (
                <option key={pattern.value} value={pattern.value}>
                  {pattern.label} - {pattern.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              勤務場所
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.workInfo?.workLocation || ''}
              onChange={(e) => updateFormData('workInfo', { workLocation: e.target.value as any })}
            >
              <option value=\"\">選択してください</option>
              <option value=\"onsite\">院内勤務</option>
              <option value=\"remote\">在宅勤務</option>
              <option value=\"hybrid\">ハイブリッド勤務</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className=\"space-y-6\">
      <h2 className=\"text-xl font-bold text-gray-900 mb-6\">面談・連絡先設定</h2>
      
      {/* 面談関連情報 */}
      <div className=\"bg-blue-50 p-4 rounded-lg border border-blue-200\">
        <h3 className=\"text-lg font-semibold mb-4 text-blue-800\">🗣️ 面談関連情報</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              生年月日 <span className=\"text-red-500\">*</span>
            </label>
            <input
              type=\"date\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.interviewInfo?.birthDate ? formData.interviewInfo.birthDate.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFormData('interviewInfo', { birthDate: new Date(e.target.value) })}
            />
          </div>
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              面談希望言語
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.interviewInfo?.preferredInterviewLanguage || 'japanese'}
              onChange={(e) => updateFormData('interviewInfo', { preferredInterviewLanguage: e.target.value as any })}
            >
              {formOptions.languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
          
          <div className=\"md:col-span-2\">
            <label className=\"block text-sm font-medium text-gray-700 mb-2\">
              キャリア目標（複数選択可）
            </label>
            <div className=\"space-y-2\">
              {['スキルアップ', '管理職昇進', '専門資格取得', '部門異動', '新分野挑戦'].map(goal => (
                <label key={goal} className=\"flex items-center\">
                  <input
                    type=\"checkbox\"
                    className=\"mr-2\"
                    checked={formData.interviewInfo?.careerGoals?.includes(goal) || false}
                    onChange={(e) => {
                      const currentGoals = formData.interviewInfo?.careerGoals || [];
                      const newGoals = e.target.checked
                        ? [...currentGoals, goal]
                        : currentGoals.filter(g => g !== goal);
                      updateFormData('interviewInfo', { careerGoals: newGoals });
                    }}
                  />
                  <span className=\"text-sm\">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div className=\"md:col-span-2\">
            <label className=\"block text-sm font-medium text-gray-700 mb-2\">
              面談希望時間帯（複数選択可）
            </label>
            <div className=\"grid grid-cols-2 md:grid-cols-3 gap-2\">
              {formOptions.timeSlots.map(slot => (
                <label key={slot.value} className=\"flex items-center\">
                  <input
                    type=\"checkbox\"
                    className=\"mr-2\"
                    checked={formData.interviewInfo?.interviewAvailability?.preferredTimes?.includes(slot.value) || false}
                    onChange={(e) => {
                      const currentTimes = formData.interviewInfo?.interviewAvailability?.preferredTimes || [];
                      const newTimes = e.target.checked
                        ? [...currentTimes, slot.value]
                        : currentTimes.filter(t => t !== slot.value);
                      updateFormData('interviewInfo', { 
                        interviewAvailability: {
                          ...formData.interviewInfo?.interviewAvailability,
                          preferredTimes: newTimes
                        }
                      });
                    }}
                  />
                  <span className=\"text-sm\">{slot.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 連絡先設定 */}
      <div className=\"bg-gray-50 p-4 rounded-lg\">
        <h3 className=\"text-lg font-semibold mb-4\">連絡先設定</h3>
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              希望連絡方法 <span className=\"text-red-500\">*</span>
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.contactPreferences?.preferredContactMethod || ''}
              onChange={(e) => updateFormData('contactPreferences', { preferredContactMethod: e.target.value as any })}
            >
              <option value=\"\">選択してください</option>
              <option value=\"email\">メール</option>
              <option value=\"phone\">電話</option>
              <option value=\"system\">システム通知</option>
              <option value=\"slack\">Slack</option>
            </select>
          </div>
          
          <div className=\"md:col-span-2\">
            <label className=\"block text-sm font-medium text-gray-700 mb-2\">通知設定</label>
            <div className=\"space-y-2\">
              {[
                { key: 'interviewReminders', label: '面談リマインダー' },
                { key: 'followUpNotifications', label: 'フォローアップ通知' },
                { key: 'systemNotifications', label: 'システム通知' },
                { key: 'emailNotifications', label: 'メール通知' }
              ].map(option => (
                <label key={option.key} className=\"flex items-center\">
                  <input
                    type=\"checkbox\"
                    className=\"mr-2\"
                    checked={(formData.contactPreferences as any)?.[option.key] || false}
                    onChange={(e) => updateFormData('contactPreferences', { [option.key]: e.target.checked })}
                  />
                  <span className=\"text-sm\">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className=\"space-y-6\">
      <h2 className=\"text-xl font-bold text-gray-900 mb-6\">アクセシビリティ・プライバシー設定</h2>
      
      {/* アクセシビリティ設定 */}
      <div className=\"bg-gray-50 p-4 rounded-lg\">
        <h3 className=\"text-lg font-semibold mb-4\">アクセシビリティ設定</h3>
        <div className=\"space-y-4\">
          <label className=\"flex items-center\">
            <input
              type=\"checkbox\"
              className=\"mr-2\"
              checked={formData.accessibility?.requiresSpecialAccommodation || false}
              onChange={(e) => updateFormData('accessibility', { requiresSpecialAccommodation: e.target.checked })}
            />
            <span className=\"text-sm\">特別な配慮が必要</span>
          </label>
          
          {formData.accessibility?.requiresSpecialAccommodation && (
            <div className=\"ml-6 space-y-3\">
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                  配慮内容の詳細
                </label>
                <textarea
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
                  rows={3}
                  placeholder=\"必要な配慮について詳しく記載してください\"
                  value={formData.accessibility?.accommodationDetails || ''}
                  onChange={(e) => updateFormData('accessibility', { accommodationDetails: e.target.value })}
                />
              </div>
              
              <div className=\"space-y-2\">
                {[
                  { key: 'mobilityAssistance', label: '移動支援' },
                  { key: 'hearingAssistance', label: '聴覚支援' },
                  { key: 'visualAssistance', label: '視覚支援' }
                ].map(option => (
                  <label key={option.key} className=\"flex items-center\">
                    <input
                      type=\"checkbox\"
                      className=\"mr-2\"
                      checked={(formData.accessibility as any)?.[option.key] || false}
                      onChange={(e) => updateFormData('accessibility', { [option.key]: e.target.checked })}
                    />
                    <span className=\"text-sm\">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* プライバシー設定 */}
      <div className=\"bg-gray-50 p-4 rounded-lg\">
        <h3 className=\"text-lg font-semibold mb-4\">プライバシー設定</h3>
        <div className=\"space-y-4\">
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-1\">
              プロフィール公開範囲 <span className=\"text-red-500\">*</span>
            </label>
            <select
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base\"
              value={formData.privacySettings?.profileVisibility || ''}
              onChange={(e) => updateFormData('privacySettings', { profileVisibility: e.target.value as any })}
            >
              <option value=\"\">選択してください</option>
              <option value=\"public\">全体公開</option>
              <option value=\"department_only\">部署内のみ</option>
              <option value=\"supervisors_only\">上司のみ</option>
              <option value=\"private\">非公開</option>
            </select>
          </div>

          <div className=\"space-y-2\">
            {[
              { key: 'shareInterviewHistory', label: '面談履歴の共有を許可' },
              { key: 'shareCareerGoals', label: 'キャリア目標の共有を許可' },
              { key: 'allowPeerFeedback', label: '同僚からのフィードバックを許可' }
            ].map(option => (
              <label key={option.key} className=\"flex items-center\">
                <input
                  type=\"checkbox\"
                  className=\"mr-2\"
                  checked={(formData.privacySettings as any)?.[option.key] || false}
                  onChange={(e) => updateFormData('privacySettings', { [option.key]: e.target.checked })}
                />
                <span className=\"text-sm\">{option.label}</span>
              </label>
            ))}
          </div>

          <div className=\"border-t pt-4 mt-4\">
            <label className=\"flex items-center\">
              <input
                type=\"checkbox\"
                className=\"mr-2\"
                checked={formData.privacySettings?.dataRetentionConsent || false}
                onChange={(e) => updateFormData('privacySettings', { dataRetentionConsent: e.target.checked })}
                required
              />
              <span className=\"text-sm\">
                データ保持ポリシーに同意する <span className=\"text-red-500\">*</span>
              </span>
            </label>
            <p className=\"text-xs text-gray-500 mt-1 ml-6\">
              個人情報の取り扱いおよび面談記録の保持に関するポリシーに同意します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className=\"flex justify-between pt-6 border-t\">
      <div>
        {currentStep > 1 && (
          <button
            type=\"button\"
            onClick={() => setCurrentStep(currentStep - 1)}
            className=\"px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500\"
          >
            前へ
          </button>
        )}
      </div>
      
      <div className=\"flex gap-3\">
        <button
          type=\"button\"
          onClick={onCancel}
          className=\"px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500\"
        >
          キャンセル
        </button>
        
        <button
          type=\"button\"
          onClick={handleStepSubmit}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '登録中...' : currentStep === 4 ? '登録完了' : '次へ'}
        </button>
      </div>
    </div>
  );

  const renderValidationErrors = () => {
    if (validation.errors.length === 0) return null;
    
    return (
      <div className=\"bg-red-50 border border-red-200 rounded-md p-4 mb-6\">
        <h4 className=\"text-red-800 font-medium mb-2\">入力エラー</h4>
        <ul className=\"text-red-700 text-sm space-y-1\">
          {validation.errors.map((error, index) => (
            <li key={index}>• {error.message}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className=\"max-w-4xl mx-auto p-6 bg-white\">
      <div className=\"mb-6\">
        <h1 className=\"text-2xl font-bold text-gray-900 mb-2\">
          {mode === 'registration' ? '新規ユーザー登録' : 'プロフィール編集'}
        </h1>
        <p className=\"text-gray-600\">
          面談予約機能を含む、すべてのシステム機能を利用するための情報を入力してください。
        </p>
      </div>

      {renderProgressBar()}
      {renderValidationErrors()}

      <form className=\"space-y-8\">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        
        {renderNavigationButtons()}
      </form>
    </div>
  );
};