// メンバー選定関連の型定義
// BasicMemberSelectionService で使用される型定義

export interface MemberSelection {
  id: string;
  projectId: string;
  selectorId: string; // 選定権限者のID
  selectionType: 'BASIC' | 'COLLABORATIVE' | 'AI_ASSISTED' | 'EMERGENCY' | 'STRATEGIC';
  selectedMembers: MemberAssignment[];
  selectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'COMPLETED';
}

export interface MemberAssignment {
  userId: string;
  role: MemberRole;
  responsibility?: string;
  estimatedWorkload?: number; // 時間/週
  startDate?: Date;
  endDate?: Date;
  isRequired: boolean; // 必須メンバー（提案者・承認者）かどうか
  assignmentReason?: string;
}

export type MemberRole = 
  | 'PROJECT_OWNER'      // プロジェクト提案者
  | 'PROJECT_SUPERVISOR' // プロジェクト承認者・監督役
  | 'PROJECT_LEADER'     // プロジェクトリーダー
  | 'TEAM_MEMBER'        // チームメンバー
  | 'SPECIALIST'         // 専門家
  | 'ADVISOR'            // アドバイザー
  | 'STAKEHOLDER';       // ステークホルダー

export interface MemberCandidate {
  user: import('./index').HierarchicalUser;
  availability: AvailabilityStatus;
  skillMatch: number; // 0-100のスコア
  workloadCapacity: number; // 現在の作業負荷（％）
  departmentMatch: boolean;
  facilityMatch: boolean;
  recommendationScore: number;
}

export interface AvailabilityStatus {
  isAvailable: boolean;
  currentProjects: number;
  workloadPercentage: number;
  nextAvailableDate?: Date;
  constraints?: string[];
}

export interface SelectionCriteria {
  projectScope: import('../permissions/types/PermissionTypes').ProjectScope;
  requiredSkills?: string[];
  preferredDepartments?: string[];
  maxTeamSize?: number;
  budgetConstraints?: number;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SelectionResult {
  success: boolean;
  selection?: MemberSelection;
  errors?: string[];
  warnings?: string[];
  recommendations?: string[];
}

// メンバー選定履歴
export interface SelectionHistory {
  id: string;
  selectionId: string;
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED';
  performedBy: string;
  details?: string;
  timestamp: Date;
}

// メンバー選定統計
export interface SelectionStats {
  totalSelections: number;
  successfulSelections: number;
  averageTeamSize: number;
  mostSelectedRoles: MemberRole[];
  averageSelectionTime: number; // 分
  topCandidates: string[]; // よく選ばれるメンバーのID
}

// メンバー選定フィルター
export interface SelectionFilter {
  status?: MemberSelection['status'][];
  selectionType?: MemberSelection['selectionType'][];
  selectorId?: string;
  projectId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// メンバー選定権限設定
export interface SelectionPermission {
  userId: string;
  scope: import('../permissions/types/PermissionTypes').ProjectScope[];
  maxTeamSize?: number;
  allowedRoles: MemberRole[];
  restrictions?: string[];
}