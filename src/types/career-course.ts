/**
 * キャリア選択制度 - 型定義
 * Phase 5-3: VoiceDrive統合用
 *
 * 医療システムと共有する型定義
 */

// コースコード (A/B/C/D)
export type CareerCourseCode = 'A' | 'B' | 'C' | 'D';

// 施設間異動レベル
export type FacilityTransferLevel = 'none' | 'limited' | 'full';

// 夜勤対応状況
export type NightShiftAvailability = 'none' | 'selectable' | 'required';

// 変更理由 (年1回定期 or 特例)
export type CourseChangeReason =
  | 'annual'                  // 年1回定期変更
  | 'special_pregnancy'       // 特例: 妊娠・出産
  | 'special_caregiving'      // 特例: 介護
  | 'special_illness';        // 特例: 疾病

// 特例変更理由
export type SpecialChangeReason =
  | 'pregnancy'     // 妊娠・出産
  | 'caregiving'    // 介護
  | 'illness'       // 疾病
  | null;

// 承認ステータス
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

/**
 * コース定義 (A～Dコース)
 * 医療システムの career_course_definitions テーブル
 */
export interface CourseDefinition {
  id: string;
  courseCode: CareerCourseCode;
  courseName: string;
  description: string;
  departmentTransferAvailable: boolean;       // 部署異動可否
  facilityTransferAvailable: FacilityTransferLevel; // 施設間異動レベル
  relocationRequired: boolean;                // 転居必要性
  nightShiftAvailable: NightShiftAvailability;// 夜勤対応
  managementTrack: boolean;                   // 管理職登用対象
  baseSalaryMultiplier: number;               // 基本給係数 (例: 1.2倍)
  salaryGrade: number | null;
  salaryNotes: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * キャリアコース選択状況
 * 医療システムの career_course_selections テーブル
 */
export interface CareerCourseSelection {
  id: string;
  staffId: string;
  courseCode: CareerCourseCode;
  courseName?: string;                        // コース名（UI表示用）
  effectiveFrom: string;                      // 適用開始日
  effectiveTo: string | null;                 // 適用終了日
  nextChangeAvailableDate: string | null;     // 次回変更可能日
  specialChangeReason: SpecialChangeReason;   // 特例変更理由
  specialChangeNote: string | null;
  changeRequestedAt: string | null;
  changeRequestedBy: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * コース変更申請
 * 医療システムの career_course_change_requests テーブル
 */
export interface CareerCourseChangeRequest {
  id: string;
  staffId: string;
  staffName?: string;                         // 職員名（UI表示用）
  facility?: string;                          // 施設名
  department?: string;                        // 部署名
  position?: string;                          // 役職名
  currentCourseCode: CareerCourseCode;        // 現在のコース
  requestedCourseCode: CareerCourseCode;      // 希望コース
  changeReason: CourseChangeReason;           // 変更理由
  reasonDetail: string;                       // 理由詳細
  requestedEffectiveDate: string;             // 希望適用日
  hrReviewerId: string | null;                // 人事審査者ID
  hrReviewerName: string | null;              // 人事審査者名
  reviewedAt: string | null;                  // 審査日時
  reviewComment: string | null;               // 審査コメント
  approvalStatus: ApprovalStatus;             // 承認ステータス
  rejectionReason: string | null;             // 却下理由
  withdrawnAt: string | null;                 // 取下げ日時
  attachments: string[];                      // 添付ファイル（特例変更時必須）
  createdAt: string;
  updatedAt: string;
}

/**
 * コース変更申請フォーム用
 */
export interface CareerCourseChangeRequestForm {
  currentCourseCode: CareerCourseCode;
  requestedCourseCode: CareerCourseCode;
  changeReason: CourseChangeReason;
  reasonDetail: string;
  requestedEffectiveDate: string;
  attachments: File[];
}

/**
 * コース変更申請統計
 */
export interface CareerCourseRequestStats {
  totalRequests: number;          // 総申請数
  pendingRequests: number;        // 承認待ち
  approvedRequests: number;       // 承認済み
  rejectedRequests: number;       // 却下
  withdrawnRequests: number;      // 取下げ
}

/**
 * UI表示用のコース情報
 */
export interface CourseDisplayInfo {
  code: CareerCourseCode;
  name: string;
  shortName: string;
  emoji: string;
  color: string;                  // Tailwind CSSクラス (例: 'from-blue-500 to-purple-500')
  bgColor: string;                // 背景色 (例: 'bg-blue-50')
  textColor: string;              // テキスト色 (例: 'text-blue-700')
  borderColor: string;            // ボーダー色 (例: 'border-blue-300')
}

/**
 * コース変更理由の表示情報
 */
export interface ChangeReasonDisplayInfo {
  value: CourseChangeReason;
  label: string;
  isSpecial: boolean;             // 特例変更かどうか
  requiresAttachment: boolean;    // 添付ファイル必須かどうか
}

/**
 * Webhook通知用 (医療システム → VoiceDrive)
 */
export interface CareerCourseNotification {
  type: 'course_change_approved' | 'course_change_rejected';
  staffId: string;
  requestId: string;
  approvedCourse?: CareerCourseCode;
  effectiveDate?: string;
  rejectionReason?: string;
  reviewComment?: string;
}

/**
 * API レスポンス型
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}