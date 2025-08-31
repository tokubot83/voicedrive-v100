# VoiceDrive データベース統合計画書

**作成日**: 2025年8月31日  
**作成者**: VoiceDriveチーム  
**対象**: 医療職員管理システムとの共通データベース構築

---

## 📋 文書概要

この文書は、VoiceDriveシステムの現在のデータ構造を包括的に分析し、医療職員管理システムとの共通データベース設計のために、VoiceDrive側で必要となる全てのデータベース要素を特定・整理したものです。

## 🎯 共通データベース統合目標

### 即時統合対象（Phase 3必須）
- **V3評価通知システム**: 評価データ、異議申立データの完全同期
- **ユーザー認証基盤**: 統一されたユーザー管理・権限システム
- **リアルタイム通信**: MCPサーバー経由のデータ同期

### 段階的統合対象（Phase 4以降）
- **面談予約システム**: 面談スケジュール・結果の統合管理
- **プロジェクト管理**: 提案から実行までの完全ライフサイクル
- **統計・分析**: 統合ダッシュボード・レポート機能

---

## 📊 VoiceDriveデータベース構造分析

## 1. 👥 コアユーザー・組織エンティティ

### 1.1 Users テーブル（最優先統合）
```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL, -- 医療システムとの連携キー
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    facility_id VARCHAR(50),
    role VARCHAR(50),
    avatar VARCHAR(200),
    
    -- 13段階権限システム（医療組織階層対応）
    account_type ENUM('CHAIRMAN', 'GENERAL_ADMINISTRATIVE_DIRECTOR', 'HR_GENERAL_MANAGER', 
                     'HR_DEPARTMENT_HEAD', 'CAREER_SUPPORT_STAFF', 'HR_ADMIN_STAFF',
                     'HOSPITAL_DIRECTOR', 'VICE_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR',
                     'DEPARTMENT_HEAD', 'HEAD_NURSE', 'SUPERVISOR', 'STAFF') NOT NULL,
    permission_level INT NOT NULL CHECK (permission_level BETWEEN 1 AND 13),
    
    -- 階層構造
    parent_id VARCHAR(50), -- 直属上司ID
    children_ids JSON, -- 部下のID配列
    budget_approval_limit DECIMAL(15,2), -- 予算承認限度額
    organization_path JSON, -- 組織パス
    
    -- 医療専門データ
    stakeholder_category ENUM('frontline', 'management', 'veteran', 'zGen'),
    position VARCHAR(100),
    expertise INT,
    hierarchy_level INT,
    
    -- 退職処理
    is_retired BOOLEAN DEFAULT FALSE,
    retirement_date DATE,
    anonymized_id VARCHAR(50),
    retirement_processed_by VARCHAR(50),
    retirement_processed_date DATE,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_facility_permission (facility_id, permission_level),
    INDEX idx_account_type (account_type),
    INDEX idx_parent_id (parent_id)
);
```

### 1.2 組織階層テーブル
```sql
-- 施設テーブル
CREATE TABLE facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type ENUM('acute_care_hospital', 'psychiatric_hospital', 'nursing_home', 
             'rehabilitation_facility', 'clinic', 'daycare_center') NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    capacity INT,
    
    INDEX idx_type (type)
);

-- 部門テーブル
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    facility_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50), -- 上位部門（階層構造）
    department_code VARCHAR(20),
    budget_limit DECIMAL(15,2),
    
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (parent_id) REFERENCES departments(id),
    INDEX idx_facility_id (facility_id),
    INDEX idx_parent_id (parent_id)
);

-- 役職テーブル
CREATE TABLE positions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    permission_level INT NOT NULL,
    department_id VARCHAR(50),
    description TEXT,
    
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

---

## 2. 💬 コンテンツ・ディスカッションエンティティ

### 2.1 Posts テーブル（提案・投稿システム）
```sql
CREATE TABLE posts (
    id VARCHAR(50) PRIMARY KEY,
    
    -- 投稿分類
    type ENUM('improvement', 'community', 'report') NOT NULL,
    proposal_type ENUM('operational', 'communication', 'innovation', 'strategic'),
    category VARCHAR(100),
    
    -- コンテンツ
    content TEXT NOT NULL,
    title VARCHAR(200),
    priority ENUM('low', 'medium', 'high', 'urgent'),
    tags JSON, -- タグ配列
    
    -- 作成者情報
    author_id VARCHAR(50) NOT NULL,
    anonymity_level ENUM('anonymous', 'department_only', 'facility_anonymous', 
                        'facility_department', 'real_name', 'full') NOT NULL,
    
    -- 投票・エンゲージメント
    votes JSON, -- 投票結果 {strongly-oppose: 0, oppose: 0, neutral: 0, support: 0, strongly-support: 0}
    votes_by_stakeholder JSON, -- ステークホルダー別投票結果
    
    -- プロジェクト関連
    project_id VARCHAR(50),
    project_status JSON,
    project_details JSON,
    
    -- 承認フロー
    approval_flow JSON,
    approver_id VARCHAR(50),
    
    -- 緊急エスカレーション
    is_emergency_escalated BOOLEAN DEFAULT FALSE,
    escalated_by VARCHAR(50),
    escalated_date TIMESTAMP,
    escalation_reason TEXT,
    
    -- フリースペース
    freespace_category ENUM('idea_sharing', 'casual_discussion', 'event_planning'),
    freespace_scope ENUM('team', 'department', 'facility', 'organization'),
    expiration_date TIMESTAMP,
    is_expired BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- 投票期限
    voting_deadline TIMESTAMP,
    eligible_voters INT,
    vote_breakdown JSON,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (escalated_by) REFERENCES users(id),
    
    INDEX idx_type_facility (type, author_id),
    INDEX idx_timestamp (created_at DESC),
    INDEX idx_project_status (project_id),
    INDEX idx_voting_deadline (voting_deadline)
);
```

### 2.2 Comments テーブル（コメント・返信システム）
```sql
CREATE TABLE comments (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50), -- 返信の場合の親コメント
    
    -- コンテンツ
    content TEXT NOT NULL,
    comment_type ENUM('proposal', 'question', 'support', 'concern') NOT NULL,
    
    -- プライバシー設定
    anonymity_level ENUM('anonymous', 'department_only', 'facility_anonymous', 
                        'facility_department', 'real_name', 'full') NOT NULL,
    privacy_level ENUM('anonymous', 'partial', 'selective', 'full'),
    
    -- エンゲージメント
    likes INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    
    -- 作成者情報
    author_id VARCHAR(50) NOT NULL,
    
    -- 表示情報（匿名時）
    visible_info JSON, -- {facility, position, experienceYears, isManagement}
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id),
    
    INDEX idx_post_id (post_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_author_timestamp (author_id, created_at)
);
```

### 2.3 Votes テーブル（個別投票記録）
```sql
CREATE TABLE votes (
    user_id VARCHAR(50),
    post_id VARCHAR(50),
    
    -- 投票内容
    vote_option ENUM('strongly-oppose', 'oppose', 'neutral', 'support', 'strongly-support') NOT NULL,
    stakeholder_category ENUM('frontline', 'management', 'veteran', 'zGen') NOT NULL,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    INDEX idx_post_option (post_id, vote_option),
    INDEX idx_stakeholder (stakeholder_category)
);
```

---

## 3. 📂 プロジェクト管理エンティティ

### 3.1 Projects テーブル
```sql
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50) UNIQUE NOT NULL, -- 元の投稿
    
    -- プロジェクト情報
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- ステータス
    stage ENUM('DEPARTMENT_PROJECT', 'FACILITY_PROJECT', 'CORPORATE_PROJECT') NOT NULL,
    level ENUM('DEPARTMENT', 'FACILITY', 'CORPORATE') NOT NULL,
    approval_level ENUM('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_7_OVERRIDE') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed') NOT NULL,
    
    -- リソース
    budget DECIMAL(15,2),
    budget_used DECIMAL(15,2) DEFAULT 0,
    team_size INT,
    completion DECIMAL(5,2) DEFAULT 0, -- 完了率（%）
    
    -- スケジュール
    timeline VARCHAR(200),
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    
    -- マイルストーン
    milestones JSON, -- マイルストーン配列
    
    -- 管理情報
    manager_id VARCHAR(50),
    created_by VARCHAR(50) NOT NULL,
    approved_by VARCHAR(50),
    
    -- ROI情報
    expected_savings DECIMAL(15,2),
    actual_savings DECIMAL(15,2),
    roi_calculation JSON,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (manager_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    
    INDEX idx_status_stage (status, stage),
    INDEX idx_manager_id (manager_id),
    INDEX idx_completion_date (target_completion_date)
);
```

### 3.2 Project Members テーブル
```sql
CREATE TABLE project_members (
    project_id VARCHAR(50),
    user_id VARCHAR(50),
    
    -- 役割情報
    role VARCHAR(100) NOT NULL,
    responsibility TEXT,
    estimated_workload DECIMAL(5,2), -- 工数（人日）
    
    -- 期間
    start_date DATE NOT NULL,
    end_date DATE,
    is_required BOOLEAN DEFAULT TRUE,
    
    -- 選出情報
    selected_by VARCHAR(50),
    selection_reason TEXT,
    selection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (selected_by) REFERENCES users(id)
);
```

---

## 4. 📋 面談システムエンティティ

### 4.1 Interview Types & Categories
```sql
-- 面談タイプ
CREATE TABLE interview_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    classification VARCHAR(50) NOT NULL,
    requires_category BOOLEAN DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_classification (classification)
);

-- 面談カテゴリ
CREATE TABLE interview_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (parent_type) REFERENCES interview_types(id)
);
```

### 4.2 Interview Bookings テーブル
```sql
CREATE TABLE interview_bookings (
    id VARCHAR(50) PRIMARY KEY,
    
    -- 職員情報
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    facility VARCHAR(100),
    department VARCHAR(100),
    
    -- 面談情報
    interview_type_id VARCHAR(50) NOT NULL,
    interview_category_id VARCHAR(50),
    requested_topics JSON, -- 話したい内容の配列
    
    -- 予約情報
    booking_date DATE NOT NULL,
    time_slot JSON NOT NULL, -- {start: "09:00", end: "10:00"}
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    
    -- その他
    urgency_level ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    interviewer_id VARCHAR(50),
    outcome JSON, -- 面談結果
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (interview_type_id) REFERENCES interview_types(id),
    FOREIGN KEY (interview_category_id) REFERENCES interview_categories(id),
    FOREIGN KEY (interviewer_id) REFERENCES users(id),
    
    INDEX idx_employee_date (employee_id, booking_date),
    INDEX idx_booking_date_status (booking_date, status),
    INDEX idx_interviewer_id (interviewer_id)
);
```

### 4.3 Time Slots テーブル
```sql
CREATE TABLE time_slots (
    id VARCHAR(50) PRIMARY KEY,
    
    -- スケジュール
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- 可用性
    is_available BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    booked_by VARCHAR(50), -- 予約したユーザー
    
    -- 面談官情報
    interviewer_id VARCHAR(50),
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booked_by) REFERENCES users(id),
    FOREIGN KEY (interviewer_id) REFERENCES users(id),
    
    UNIQUE INDEX idx_datetime_interviewer (date, start_time, interviewer_id),
    INDEX idx_date_available (date, is_available)
);
```

---

## 5. ⭐ 評価・異議申立システム（V3対応）

### 5.1 Evaluation Notifications テーブル（医療システム連携最優先）
```sql
CREATE TABLE evaluation_notifications (
    id VARCHAR(50) PRIMARY KEY,
    
    -- 職員情報（医療システムとの連携）
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    
    -- V3評価データ
    evaluation_period VARCHAR(50) NOT NULL, -- "2025_winter"
    evaluation_score INT NOT NULL CHECK (evaluation_score BETWEEN 0 AND 100),
    evaluation_grade ENUM('S', 'A+', 'A', 'B+', 'B', 'C', 'D') NOT NULL,
    
    -- 日程
    disclosure_date DATE NOT NULL,
    appeal_deadline DATE NOT NULL,
    
    -- 通知状態
    has_unread_notification BOOLEAN DEFAULT TRUE,
    notification_sent_at TIMESTAMP,
    notification_read_at TIMESTAMP,
    
    -- 異議申立状態
    appeal_submitted BOOLEAN DEFAULT FALSE,
    appeal_id VARCHAR(50),
    
    -- 医療システム連携
    medical_system_url VARCHAR(500), -- 医療システムの評価詳細URL
    additional_message TEXT,
    
    -- トラッキング
    appeal_link_clicked_at TIMESTAMP,
    delivery_methods JSON, -- {email: true, push: true, sms: false}
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES users(employee_id),
    FOREIGN KEY (appeal_id) REFERENCES appeals_v3(appeal_id),
    
    UNIQUE INDEX idx_employee_period (employee_id, evaluation_period),
    INDEX idx_disclosure_date (disclosure_date),
    INDEX idx_appeal_deadline (appeal_deadline),
    INDEX idx_notification_status (has_unread_notification)
);
```

### 5.2 Appeals V3 テーブル
```sql
CREATE TABLE appeals_v3 (
    appeal_id VARCHAR(50) PRIMARY KEY,
    
    -- 申立者情報
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    evaluation_period VARCHAR(50) NOT NULL,
    
    -- 評価情報
    original_score INT NOT NULL CHECK (original_score BETWEEN 0 AND 100),
    original_grade ENUM('S', 'A+', 'A', 'B+', 'B', 'C', 'D') NOT NULL,
    requested_score INT CHECK (requested_score BETWEEN 0 AND 100),
    requested_grade ENUM('S', 'A+', 'A', 'B+', 'B', 'C', 'D'),
    final_score INT CHECK (final_score BETWEEN 0 AND 100),
    final_grade ENUM('S', 'A+', 'A', 'B+', 'B', 'C', 'D'),
    
    -- 申立内容
    appeal_category ENUM('score_discrepancy', 'evaluation_criteria', 'procedural_error', 'other') NOT NULL,
    appeal_reason TEXT NOT NULL,
    detailed_explanation TEXT,
    evidence_documents JSON, -- 証拠資料の配列
    
    -- 処理状況
    status ENUM('submitted', 'under_review', 'additional_info_requested', 'resolved', 'rejected') DEFAULT 'submitted',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- ワークフロー
    workflow_steps JSON, -- 処理ステップの配列
    assigned_reviewer_id VARCHAR(50),
    
    -- 医療チーム回答
    medical_team_response TEXT,
    response_date TIMESTAMP,
    response_by VARCHAR(50),
    
    -- 通信ログ
    communication_log JSON, -- やり取りの履歴
    
    -- 期限管理
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_deadline TIMESTAMP,
    resolution_date TIMESTAMP,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES users(employee_id),
    FOREIGN KEY (assigned_reviewer_id) REFERENCES users(id),
    
    INDEX idx_employee_period (employee_id, evaluation_period),
    INDEX idx_status_priority (status, priority),
    INDEX idx_submission_date (submission_date),
    INDEX idx_review_deadline (review_deadline)
);
```

---

## 6. 📊 アンケート・イベントシステム

### 6.1 Polls テーブル
```sql
CREATE TABLE polls (
    id VARCHAR(50) PRIMARY KEY,
    
    -- 質問内容
    question VARCHAR(500) NOT NULL,
    description TEXT,
    options JSON NOT NULL, -- 選択肢の配列
    
    -- 設定
    allow_multiple BOOLEAN DEFAULT FALSE,
    show_results BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- スコープ
    category VARCHAR(100),
    scope ENUM('team', 'department', 'facility', 'organization') DEFAULT 'department',
    target_participants JSON, -- 対象参加者の条件
    
    -- スケジュール
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP,
    
    -- 作成者
    created_by VARCHAR(50) NOT NULL,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_deadline (deadline),
    INDEX idx_scope_category (scope, category)
);
```

### 6.2 Poll Votes テーブル
```sql
CREATE TABLE poll_votes (
    poll_id VARCHAR(50),
    user_id VARCHAR(50),
    option_id VARCHAR(50),
    
    -- 投票内容
    selected_options JSON, -- 選択した選択肢（複数選択対応）
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (poll_id, user_id, option_id),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6.3 Events テーブル
```sql
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    
    -- イベント情報
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('meeting', 'training', 'social', 'conference', 'other') NOT NULL,
    
    -- 日程（複数候補対応）
    proposed_dates JSON NOT NULL, -- 候補日時の配列
    final_date TIMESTAMP,
    
    -- 会場情報
    venue JSON, -- {name, address, capacity, requirements}
    
    -- 参加者管理
    max_participants INT,
    current_participants INT DEFAULT 0,
    participants JSON, -- 参加者リスト
    
    -- 費用
    cost DECIMAL(10,2) DEFAULT 0,
    cost_per_person DECIMAL(10,2),
    
    -- 設定
    status ENUM('planning', 'open', 'full', 'cancelled', 'completed') DEFAULT 'planning',
    visibility ENUM('public', 'department', 'facility', 'private') DEFAULT 'department',
    allow_date_voting BOOLEAN DEFAULT TRUE,
    
    -- 作成者
    created_by VARCHAR(50) NOT NULL,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_status_visibility (status, visibility),
    INDEX idx_final_date (final_date)
);
```

---

## 7. 🔐 権限・コンプライアンスシステム

### 7.1 Authority Actions テーブル
```sql
CREATE TABLE authority_actions (
    id VARCHAR(50) PRIMARY KEY,
    
    -- アクション情報
    actor_id VARCHAR(50) NOT NULL,
    action_type ENUM('budget_approval', 'project_escalation', 'user_permission_change', 
                    'data_access', 'system_override') NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(50) NOT NULL,
    
    -- 変更内容
    reason TEXT NOT NULL,
    previous_state JSON,
    new_state JSON,
    
    -- 監査情報
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    checksum VARCHAR(256), -- データ整合性チェック
    
    FOREIGN KEY (actor_id) REFERENCES users(id),
    
    INDEX idx_actor_timestamp (actor_id, timestamp),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_action_type (action_type)
);
```

### 7.2 Whistleblowing Reports テーブル
```sql
CREATE TABLE whistleblowing_reports (
    id VARCHAR(50) PRIMARY KEY,
    anonymous_id VARCHAR(100) UNIQUE NOT NULL, -- 匿名ID
    
    -- 報告内容
    category ENUM('harassment', 'safety_violation', 'financial_misconduct', 
                 'patient_safety', 'discrimination', 'other') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    
    -- 処理状況
    status ENUM('submitted', 'acknowledged', 'investigating', 'resolved', 'closed') DEFAULT 'submitted',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_investigators JSON, -- 調査担当者の配列
    
    -- 証拠・資料
    evidence_files JSON, -- 証拠ファイルのメタデータ
    internal_notes JSON, -- 内部調査メモ
    
    -- スケジュール
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledgment_date TIMESTAMP,
    investigation_deadline TIMESTAMP,
    resolution_date TIMESTAMP,
    
    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status_severity (status, severity),
    INDEX idx_category (category),
    INDEX idx_submission_date (submission_date)
);
```

---

## 8. 📈 分析・統計システム

### 8.1 User Analytics テーブル
```sql
CREATE TABLE user_analytics (
    user_id VARCHAR(50),
    period VARCHAR(20), -- "2025-08", "2025-Q3"
    
    -- エンゲージメント指標
    proposal_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    likes_received INT DEFAULT 0,
    voting_participation INT DEFAULT 0,
    
    -- プロジェクト参加
    project_participation INT DEFAULT 0,
    project_leadership INT DEFAULT 0,
    project_completion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- 貢献度
    consensus_contribution DECIMAL(8,4) DEFAULT 0,
    innovation_score DECIMAL(8,4) DEFAULT 0,
    collaboration_score DECIMAL(8,4) DEFAULT 0,
    
    -- 更新日時
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, period),
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX idx_period (period),
    INDEX idx_proposal_count (proposal_count DESC)
);
```

### 8.2 System Statistics テーブル
```sql
CREATE TABLE system_statistics (
    id VARCHAR(50) PRIMARY KEY,
    statistic_type VARCHAR(100) NOT NULL,
    period VARCHAR(20) NOT NULL,
    
    -- 統計データ
    values JSON NOT NULL,
    calculations JSON,
    
    -- メタデータ
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_type_period (statistic_type, period)
);
```

---

## 9. ⚙️ 設定・マスターデータ

### 9.1 設定テーブル群
```sql
-- 提案タイプ設定
CREATE TABLE proposal_type_configs (
    type ENUM('operational', 'communication', 'innovation', 'strategic') PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    weights JSON NOT NULL, -- ステークホルダー重み設定
    border_color VARCHAR(20),
    
    INDEX idx_type (type)
);

-- 通知テンプレート
CREATE TABLE notification_templates (
    type VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    action_text VARCHAR(100),
    action_url VARCHAR(500),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'
);

-- システム設定
CREATE TABLE system_configs (
    key VARCHAR(100) PRIMARY KEY,
    value JSON NOT NULL,
    description TEXT,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### 9.2 マスターデータテーブル群
```sql
-- ステークホルダーカテゴリ
CREATE TABLE stakeholder_categories (
    category ENUM('frontline', 'management', 'veteran', 'zGen') PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    default_weight DECIMAL(5,2) NOT NULL
);

-- 医療専門分野
CREATE TABLE medical_specialties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    multiplier DECIMAL(5,2) DEFAULT 1.0,
    
    INDEX idx_category (category)
);

-- 施設タイプマスタ
CREATE TABLE facility_types (
    type VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    multiplier DECIMAL(5,2) DEFAULT 1.0,
    special_requirements JSON
);
```

---

## 🔄 データベース統合設計考慮事項

### 主要キー・関連設計
- **employee_id**: 医療システムとの連携における最重要キー
- **階層関係**: 自己参照テーブルによる組織・コメント階層
- **複合キー**: 多対多関係（投票、プロジェクトメンバー）での利用

### パフォーマンス最適化インデックス
```sql
-- 最重要インデックス（医療システム統合）
CREATE INDEX idx_users_employee_facility ON users(employee_id, facility_id);
CREATE INDEX idx_evaluations_employee_period ON evaluation_notifications(employee_id, evaluation_period);
CREATE INDEX idx_appeals_status_deadline ON appeals_v3(status, review_deadline);

-- VoiceDriveコア機能インデックス
CREATE INDEX idx_posts_type_timestamp ON posts(type, created_at DESC);
CREATE INDEX idx_posts_voting_deadline ON posts(voting_deadline) WHERE voting_deadline IS NOT NULL;
CREATE INDEX idx_comments_post_timestamp ON comments(post_id, created_at);
CREATE INDEX idx_interviews_employee_date ON interview_bookings(employee_id, booking_date);
```

### データ型・制約
- **JSON フィールド**: 複雑なネストデータ（投票結果、プロジェクト詳細、ワークフロー）
- **ENUM 型**: 一貫性のあるステータス値
- **チェック制約**: スコア範囲（0-100）、パーセンテージ値の妥当性
- **外部キー制約**: データ整合性の保証

### 医療データコンプライアンス要件
- **監査証跡**: 全ての機密操作の完全ログ記録
- **データ保持**: 法的要件に基づく保持ポリシー設定
- **匿名化**: 退職者データの適切な匿名化処理
- **暗号化**: 機密フィールドの保存時暗号化（PII、評価データ）
- **アクセス制御**: ロールベースアクセス制御（RBAC）の実装

### 統合要件
- **API バージョニング**: V3評価システム対応、将来のバージョン対応
- **リアルタイム同期**: MCP サーバー経由でのデータ同期
- **バックアップ戦略**: 医療コンプライアンス対応の堅牢なバックアップ
- **パフォーマンス**: API エンドポイント 200ms 以下の応答時間

---

## 📋 統合実装優先順位

### Phase 3 即時対応（必須）
1. **Users テーブル**: 統一ユーザー管理基盤
2. **Evaluation Notifications テーブル**: V3評価通知システム
3. **Appeals V3 テーブル**: 異議申立システム
4. **Authority Actions テーブル**: 権限管理・監査証跡

### Phase 4 段階実装
1. **Posts/Comments/Votes**: コミュニティ機能統合
2. **Interview Bookings**: 面談予約システム統合
3. **Projects/Members**: プロジェクト管理統合

### Phase 5 完全統合
1. **Analytics/Statistics**: 統合分析ダッシュボード
2. **Polls/Events**: コミュニティエンゲージメント
3. **Master Data**: 完全なマスターデータ統合

---

## 📊 医療チーム側との統合ポイント

### 必須連携データ
- **employee_id**: 職員識別キー（医療システム主キー）
- **evaluation_score/grade**: V3評価データ（100点満点・7段階）
- **facility_id/department**: 組織構造データ
- **permission_level**: 13段階権限システム

### API 統合エンドポイント
- **POST /api/evaluation-notifications**: 評価通知受信
- **POST /api/v3/appeals/submit**: 異議申立送信
- **GET /api/users/sync**: ユーザーデータ同期確認
- **POST /api/audit/log**: 監査ログ記録

### データ同期方式
- **リアルタイム**: 評価通知、異議申立、権限変更
- **バッチ**: ユーザーマスタ、組織構造、統計データ
- **イベント駆動**: 重要変更時の即座同期

---

**このVoiceDrive側データベース統合計画書は、医療職員管理システムとの共通データベース設計における、VoiceDrive側要件の完全な仕様書として作成されました。**

**次のステップ**: 医療チーム側のDB統合計画書と合わせて、統一データベース設計書の策定を行います。

---

**VoiceDriveチーム データベース設計委員会**  
**2025年8月31日**