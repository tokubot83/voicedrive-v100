// メンバー選定システム用データベーススキーマ設計
// Phase 1: 基本的なメンバー選定機能のためのデータ構造

/**
 * member_selections テーブル
 * メンバー選定の基本情報を格納
 */
export interface MemberSelectionRecord {
  id: string;                    // PRIMARY KEY - 選定ID
  project_id: string;           // プロジェクトID
  selector_id: string;          // 選定権限者のユーザーID
  selection_type: 'BASIC' | 'COLLABORATIVE' | 'AI_ASSISTED' | 'EMERGENCY' | 'STRATEGIC';
  selection_reason?: string;     // 選定理由
  criteria?: string;            // 選定基準（JSON形式）
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'COMPLETED';
  created_at: Date;
  updated_at: Date;
  
  // インデックス
  // INDEX(project_id), INDEX(selector_id), INDEX(status), INDEX(created_at)
}

/**
 * member_assignments テーブル
 * 選定されたメンバーの割り当て情報
 */
export interface MemberAssignmentRecord {
  id: string;                   // PRIMARY KEY - 割り当てID
  selection_id: string;         // FOREIGN KEY - 選定ID
  user_id: string;             // 割り当てられたユーザーID
  role: 'PROJECT_OWNER' | 'PROJECT_SUPERVISOR' | 'PROJECT_LEADER' | 'TEAM_MEMBER' | 'SPECIALIST' | 'ADVISOR' | 'STAKEHOLDER';
  responsibility?: string;      // 責任・役割の詳細
  estimated_workload?: number;  // 推定作業負荷（時間/週）
  start_date?: Date;           // 開始日
  end_date?: Date;             // 終了日
  is_required: boolean;        // 必須メンバーかどうか
  assignment_reason?: string;   // 割り当て理由
  status: 'ASSIGNED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  created_at: Date;
  updated_at: Date;
  
  // インデックス
  // INDEX(selection_id), INDEX(user_id), INDEX(role), INDEX(status)
}

/**
 * member_candidates テーブル
 * メンバー候補者の情報とスコア
 */
export interface MemberCandidateRecord {
  id: string;                   // PRIMARY KEY - 候補者レコードID
  user_id: string;             // ユーザーID
  project_id?: string;         // プロジェクトID（特定プロジェクト用の場合）
  department_id?: string;       // 部門ID
  facility_id?: string;        // 施設ID
  skill_match_score: number;   // スキルマッチスコア (0-100)
  workload_capacity: number;   // 作業負荷容量 (0-100)
  recommendation_score: number; // 推奨スコア (0-100)
  is_available: boolean;       // 利用可能かどうか
  current_projects: number;    // 現在参加プロジェクト数
  workload_percentage: number; // 現在の作業負荷率
  next_available_date?: Date;  // 次回利用可能日
  constraints?: string;        // 制約条件（JSON形式）
  last_updated: Date;
  
  // インデックス
  // INDEX(user_id), INDEX(department_id), INDEX(facility_id), INDEX(recommendation_score)
}

/**
 * selection_history テーブル
 * メンバー選定の履歴・監査ログ
 */
export interface SelectionHistoryRecord {
  id: string;                  // PRIMARY KEY - 履歴ID
  selection_id: string;        // FOREIGN KEY - 選定ID
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'STATUS_CHANGED';
  performed_by: string;        // 実行者のユーザーID
  details?: string;           // 詳細情報（JSON形式）
  old_value?: string;         // 変更前の値
  new_value?: string;         // 変更後の値
  timestamp: Date;
  ip_address?: string;        // IPアドレス
  user_agent?: string;        // ユーザーエージェント
  
  // インデックス
  // INDEX(selection_id), INDEX(performed_by), INDEX(timestamp), INDEX(action)
}

/**
 * selection_permissions テーブル
 * メンバー選定権限の設定
 */
export interface SelectionPermissionRecord {
  id: string;                  // PRIMARY KEY - 権限設定ID
  user_id: string;            // ユーザーID
  permission_level: number;    // 権限レベル (1-8)
  allowed_scopes: string;     // 許可されたスコープ（JSON配列）
  max_team_size?: number;     // 最大チームサイズ
  allowed_roles: string;      // 許可された役割（JSON配列）
  budget_limit?: number;      // 予算制限
  restrictions?: string;      // 制約（JSON形式）
  is_active: boolean;         // アクティブかどうか
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;          // 権限の有効期限
  
  // インデックス
  // INDEX(user_id), INDEX(permission_level), INDEX(is_active)
}

/**
 * selection_criteria_templates テーブル
 * 選定基準のテンプレート
 */
export interface SelectionCriteriaTemplateRecord {
  id: string;                 // PRIMARY KEY - テンプレートID
  name: string;              // テンプレート名
  description?: string;       // 説明
  project_scope: 'TEAM' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'STRATEGIC';
  criteria: string;          // 選定基準（JSON形式）
  created_by: string;        // 作成者
  is_default: boolean;       // デフォルトテンプレートかどうか
  usage_count: number;       // 使用回数
  created_at: Date;
  updated_at: Date;
  
  // インデックス
  // INDEX(project_scope), INDEX(created_by), INDEX(is_default)
}

/**
 * データベーススキーマのSQL定義例（PostgreSQL）
 */
export const DATABASE_SCHEMA_SQL = `
-- member_selections テーブル
CREATE TABLE member_selections (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  selector_id VARCHAR(255) NOT NULL,
  selection_type VARCHAR(50) NOT NULL CHECK (selection_type IN ('BASIC', 'COLLABORATIVE', 'AI_ASSISTED', 'EMERGENCY', 'STRATEGIC')),
  selection_reason TEXT,
  criteria JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_selections_project_id ON member_selections(project_id);
CREATE INDEX idx_member_selections_selector_id ON member_selections(selector_id);
CREATE INDEX idx_member_selections_status ON member_selections(status);
CREATE INDEX idx_member_selections_created_at ON member_selections(created_at);

-- member_assignments テーブル
CREATE TABLE member_assignments (
  id VARCHAR(255) PRIMARY KEY,
  selection_id VARCHAR(255) NOT NULL REFERENCES member_selections(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('PROJECT_OWNER', 'PROJECT_SUPERVISOR', 'PROJECT_LEADER', 'TEAM_MEMBER', 'SPECIALIST', 'ADVISOR', 'STAKEHOLDER')),
  responsibility TEXT,
  estimated_workload INTEGER,
  start_date DATE,
  end_date DATE,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  assignment_reason TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'ACCEPTED', 'DECLINED', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_assignments_selection_id ON member_assignments(selection_id);
CREATE INDEX idx_member_assignments_user_id ON member_assignments(user_id);
CREATE INDEX idx_member_assignments_role ON member_assignments(role);
CREATE INDEX idx_member_assignments_status ON member_assignments(status);

-- member_candidates テーブル
CREATE TABLE member_candidates (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  project_id VARCHAR(255),
  department_id VARCHAR(255),
  facility_id VARCHAR(255),
  skill_match_score INTEGER NOT NULL DEFAULT 0 CHECK (skill_match_score >= 0 AND skill_match_score <= 100),
  workload_capacity INTEGER NOT NULL DEFAULT 0 CHECK (workload_capacity >= 0 AND workload_capacity <= 100),
  recommendation_score INTEGER NOT NULL DEFAULT 0 CHECK (recommendation_score >= 0 AND recommendation_score <= 100),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  current_projects INTEGER NOT NULL DEFAULT 0,
  workload_percentage INTEGER NOT NULL DEFAULT 0 CHECK (workload_percentage >= 0 AND workload_percentage <= 100),
  next_available_date DATE,
  constraints JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_candidates_user_id ON member_candidates(user_id);
CREATE INDEX idx_member_candidates_department_id ON member_candidates(department_id);
CREATE INDEX idx_member_candidates_facility_id ON member_candidates(facility_id);
CREATE INDEX idx_member_candidates_recommendation_score ON member_candidates(recommendation_score DESC);

-- selection_history テーブル
CREATE TABLE selection_history (
  id VARCHAR(255) PRIMARY KEY,
  selection_id VARCHAR(255) NOT NULL REFERENCES member_selections(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'APPROVED', 'REJECTED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'STATUS_CHANGED')),
  performed_by VARCHAR(255) NOT NULL,
  details JSONB,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_selection_history_selection_id ON selection_history(selection_id);
CREATE INDEX idx_selection_history_performed_by ON selection_history(performed_by);
CREATE INDEX idx_selection_history_timestamp ON selection_history(timestamp);
CREATE INDEX idx_selection_history_action ON selection_history(action);

-- selection_permissions テーブル
CREATE TABLE selection_permissions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  permission_level INTEGER NOT NULL CHECK (permission_level >= 1 AND permission_level <= 8),
  allowed_scopes JSONB NOT NULL,
  max_team_size INTEGER,
  allowed_roles JSONB NOT NULL,
  budget_limit BIGINT,
  restrictions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_selection_permissions_user_id ON selection_permissions(user_id);
CREATE INDEX idx_selection_permissions_permission_level ON selection_permissions(permission_level);
CREATE INDEX idx_selection_permissions_is_active ON selection_permissions(is_active);

-- selection_criteria_templates テーブル
CREATE TABLE selection_criteria_templates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_scope VARCHAR(50) NOT NULL CHECK (project_scope IN ('TEAM', 'DEPARTMENT', 'FACILITY', 'ORGANIZATION', 'STRATEGIC')),
  criteria JSONB NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_selection_criteria_templates_project_scope ON selection_criteria_templates(project_scope);
CREATE INDEX idx_selection_criteria_templates_created_by ON selection_criteria_templates(created_by);
CREATE INDEX idx_selection_criteria_templates_is_default ON selection_criteria_templates(is_default);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_member_selections_updated_at BEFORE UPDATE ON member_selections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_assignments_updated_at BEFORE UPDATE ON member_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_selection_permissions_updated_at BEFORE UPDATE ON selection_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_selection_criteria_templates_updated_at BEFORE UPDATE ON selection_criteria_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * インデックス最適化のための追加インデックス
 */
export const PERFORMANCE_INDEXES_SQL = `
-- 複合インデックス（よく使われるクエリパターン用）
CREATE INDEX idx_member_selections_project_status ON member_selections(project_id, status);
CREATE INDEX idx_member_assignments_selection_user ON member_assignments(selection_id, user_id);
CREATE INDEX idx_member_candidates_facility_available ON member_candidates(facility_id, is_available);
CREATE INDEX idx_selection_history_selection_timestamp ON selection_history(selection_id, timestamp);

-- 部分インデックス（条件付きクエリ用）
CREATE INDEX idx_member_selections_active ON member_selections(project_id) WHERE status = 'ACTIVE';
CREATE INDEX idx_member_candidates_available ON member_candidates(recommendation_score DESC) WHERE is_available = TRUE;
CREATE INDEX idx_selection_permissions_active ON selection_permissions(user_id, permission_level) WHERE is_active = TRUE;
`;