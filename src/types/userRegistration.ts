// ユーザー登録・プロフィール型定義（面談予約機能統合版）

export interface UserRegistrationData {
  // === 基本情報 ===
  personalInfo: {
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    email: string;
    phoneNumber: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
  };
  
  // === 認証情報 ===
  authInfo: {
    employeeId: string;
    password: string;
    confirmPassword: string;
  };
  
  // === 組織情報 ===
  organizationInfo: {
    facilityId: string;
    facilityName: string;
    departmentId: string;
    departmentName: string;
    positionId: string;
    positionName: string;
    permissionLevel: number; // 1-10
    hireDate: Date;
    directSupervisorId?: string;
  };
  
  // === 面談関連情報 ===
  interviewInfo: {
    birthDate: Date;
    previousInterviewDate?: Date;
    careerGoals: string[];
    currentChallenges: string[];
    skillDevelopmentAreas: string[];
    preferredInterviewLanguage: 'japanese' | 'english' | 'both';
    interviewAvailability: {
      preferredDays: string[]; // ['月', '火', '水', '木', '金']
      preferredTimes: string[]; // ['13:40-14:10', '14:20-14:50', ...]
      unavailableDates?: Date[];
    };
  };
  
  // === 勤務情報（面談スケジュール調整用） ===
  workInfo: {
    regularSchedule: {
      workingDays: string[];
      shiftPattern: 'day' | 'night' | 'rotating' | 'flexible';
      regularStartTime?: string;
      regularEndTime?: string;
    };
    workLocation: 'onsite' | 'remote' | 'hybrid';
    nightShiftFrequency?: 'none' | 'occasional' | 'regular' | 'primary';
  };
  
  // === 連絡先設定 ===
  contactPreferences: {
    preferredContactMethod: 'email' | 'phone' | 'system' | 'slack';
    systemNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    interviewReminders: boolean;
    followUpNotifications: boolean;
  };
  
  // === アクセシビリティ・特別配慮 ===
  accessibility?: {
    requiresSpecialAccommodation: boolean;
    accommodationDetails?: string;
    languageSupport?: 'none' | 'interpreter' | 'written_translation';
    mobilityAssistance?: boolean;
    hearingAssistance?: boolean;
    visualAssistance?: boolean;
  };
  
  // === プライバシー設定 ===
  privacySettings: {
    profileVisibility: 'public' | 'department_only' | 'supervisors_only' | 'private';
    shareInterviewHistory: boolean;
    shareCareerGoals: boolean;
    allowPeerFeedback: boolean;
    dataRetentionConsent: boolean;
  };
}

// フォーム用の段階的入力データ
export interface RegistrationStep1Data {
  personalInfo: UserRegistrationData['personalInfo'];
  authInfo: UserRegistrationData['authInfo'];
}

export interface RegistrationStep2Data {
  organizationInfo: UserRegistrationData['organizationInfo'];
  workInfo: UserRegistrationData['workInfo'];
}

export interface RegistrationStep3Data {
  interviewInfo: UserRegistrationData['interviewInfo'];
  contactPreferences: UserRegistrationData['contactPreferences'];
}

export interface RegistrationStep4Data {
  accessibility?: UserRegistrationData['accessibility'];
  privacySettings: UserRegistrationData['privacySettings'];
}

// バリデーション結果
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// プロフィール完成度
export interface ProfileCompleteness {
  overall: number; // 0-100%
  sections: {
    basic: number;
    organization: number;
    interview: number;
    work: number;
    contact: number;
    accessibility: number;
    privacy: number;
  };
  missingFields: string[];
  recommendations: string[];
}

// 面談予約に影響する設定変更
export interface InterviewImpactingChanges {
  scheduleChanges: boolean;
  availabilityChanges: boolean;
  contactMethodChanges: boolean;
  accommodationChanges: boolean;
  affectedBookings?: string[]; // 影響を受ける予約ID
}

// 管理者向け登録承認データ
export interface RegistrationApprovalData {
  registrationId: string;
  applicantData: UserRegistrationData;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  
  // 承認プロセス
  reviewedBy?: string;
  reviewedAt?: Date;
  approvalComments?: string;
  rejectionReason?: string;
  
  // 自動チェック結果
  autoValidation: {
    employeeIdValid: boolean;
    facilityExists: boolean;
    departmentExists: boolean;
    positionExists: boolean;
    supervisorExists: boolean;
    duplicateCheck: boolean;
  };
  
  // 手動レビューが必要な項目
  manualReviewRequired: string[];
  
  // 権限レベル妥当性
  permissionLevelCheck: {
    requested: number;
    suggested: number;
    requiresEscalation: boolean;
    escalationReason?: string;
  };
}

// 既存ユーザーのプロフィール更新
export interface ProfileUpdateData {
  userId: string;
  updates: Partial<UserRegistrationData>;
  updateReason: string;
  requestedBy: string;
  
  // 面談予約への影響
  interviewImpact: InterviewImpactingChanges;
  
  // 承認が必要な変更
  requiresApproval: boolean;
  approvalLevel?: number; // 必要な承認権限レベル
}

// 一括登録用（CSV等からの大量登録）
export interface BulkRegistrationData {
  registrations: UserRegistrationData[];
  uploadedBy: string;
  uploadedAt: Date;
  
  // 処理結果
  results?: {
    successful: number;
    failed: number;
    skipped: number;
    errors: Array<{
      row: number;
      employeeId: string;
      error: string;
    }>;
  };
}

// システム設定（管理者用）
export interface RegistrationSystemConfig {
  // 自動承認設定
  autoApproval: {
    enabled: boolean;
    maxPermissionLevel: number; // この以下は自動承認
    requireEmailVerification: boolean;
    requireSupervisorConfirmation: boolean;
  };
  
  // 必須フィールド設定
  requiredFields: {
    basic: string[];
    organization: string[];
    interview: string[];
    work: string[];
  };
  
  // 面談関連デフォルト設定
  interviewDefaults: {
    defaultInterviewAvailability: string[];
    defaultPreferredTimes: string[];
    autoScheduleFirstInterview: boolean;
    firstInterviewDelay: number; // 入社後何日で初回面談
  };
  
  // データ保持ポリシー
  dataRetention: {
    inactiveUserDataRetentionDays: number;
    deletedUserDataRetentionDays: number;
    interviewRecordRetentionYears: number;
  };
}

// フォーム表示用のオプション
export interface FormOptions {
  facilities: Array<{ id: string; name: string; }>;
  departments: Array<{ id: string; name: string; facilityId: string; }>;
  positions: Array<{ id: string; name: string; permissionLevel: number; }>;
  timeSlots: Array<{ value: string; label: string; }>;
  languages: Array<{ value: string; label: string; }>;
  shiftPatterns: Array<{ value: string; label: string; description: string; }>;
}