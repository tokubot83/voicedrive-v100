-- ====================================================
-- VoiceDrive MySQL データベース初期化スクリプト
-- 医療職員カルテシステムとの共通データベース構築用
--
-- 作成日: 2025年9月21日
-- 対象: AWS Lightsail MySQL 8.0
-- データベース名: voicedrive_medical_integrated
-- ====================================================

-- データベース設定
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ====================================================
-- 1. 基本テーブル作成
-- ====================================================

-- ユーザーテーブル（医療職員）
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE COMMENT '職員ID（医療システム連携キー）',
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    facility_id VARCHAR(50) COMMENT '施設ID',
    role VARCHAR(50),
    avatar TEXT,

    -- 13段階権限システム
    account_type VARCHAR(50) NOT NULL COMMENT 'CHAIRMAN, GENERAL_ADMINISTRATIVE_DIRECTOR, etc.',
    permission_level TINYINT NOT NULL COMMENT '1-13の権限レベル',

    -- 階層構造
    parent_id VARCHAR(50) COMMENT '直属上司ID',
    budget_approval_limit DECIMAL(15,2) COMMENT '予算承認限度額',

    -- 医療専門データ
    stakeholder_category VARCHAR(50) COMMENT 'frontline, management, veteran, zGen',
    position VARCHAR(100),
    expertise SMALLINT,
    hierarchy_level TINYINT,

    -- 退職処理
    is_retired BOOLEAN DEFAULT FALSE,
    retirement_date DATE,
    anonymized_id VARCHAR(50),

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_employee_id (employee_id),
    INDEX idx_facility_permission (facility_id, permission_level),
    INDEX idx_account_type (account_type),
    INDEX idx_stakeholder_category (stakeholder_category),
    CONSTRAINT fk_user_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='医療職員マスタテーブル';

-- 面談予約テーブル
CREATE TABLE IF NOT EXISTS interviews (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,

    -- 3段階25タイプ分類
    category VARCHAR(50) NOT NULL COMMENT 'BASIC, SUPPORT, SPECIAL',
    type VARCHAR(100) NOT NULL COMMENT '25タイプの面談種別',
    topic TEXT NOT NULL,

    -- スケジュール管理
    preferred_date DATE NOT NULL,
    preferred_time_slot VARCHAR(20),
    scheduled_date DATETIME,
    actual_date DATETIME,

    -- ステータス管理
    urgency_level VARCHAR(20) NOT NULL COMMENT 'low, medium, high, urgent',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, scheduled, in_progress, completed, cancelled',

    -- 面談詳細
    duration SMALLINT COMMENT '面談時間（分）',
    notes TEXT,
    result TEXT,
    interviewer_name VARCHAR(100),
    follow_up_required BOOLEAN DEFAULT FALSE,

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_employee_date (employee_id, preferred_date),
    INDEX idx_status_urgency (status, urgency_level),
    INDEX idx_category_type (category, type),
    INDEX idx_scheduled_date (scheduled_date),
    CONSTRAINT fk_interview_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面談予約管理テーブル';

-- V3評価テーブル
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    evaluation_period VARCHAR(20) NOT NULL COMMENT '評価期間（例：2025_Q1）',
    evaluation_type VARCHAR(50) NOT NULL COMMENT '評価タイプ（年次、半期、プロジェクト等）',

    -- 評価スコア（0-100）
    performance_score TINYINT NOT NULL CHECK (performance_score >= 0 AND performance_score <= 100),
    teamwork_score TINYINT NOT NULL CHECK (teamwork_score >= 0 AND teamwork_score <= 100),
    initiative_score TINYINT NOT NULL CHECK (initiative_score >= 0 AND initiative_score <= 100),
    overall_score TINYINT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

    -- 評価詳細
    strengths TEXT,
    improvements TEXT,
    goals TEXT,
    comments TEXT,

    -- ステータス管理
    status VARCHAR(20) DEFAULT 'draft' COMMENT 'draft, submitted, approved, disputed',
    evaluator_id VARCHAR(50) NOT NULL,
    evaluator_name VARCHAR(100) NOT NULL,

    -- 承認プロセス
    submitted_at DATETIME,
    approved_at DATETIME,
    approved_by VARCHAR(100),

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_employee_period (employee_id, evaluation_period),
    INDEX idx_status (status),
    INDEX idx_evaluation_type (evaluation_type),
    CONSTRAINT fk_evaluation_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='V3評価管理テーブル';

-- 評価異議申立テーブル
CREATE TABLE IF NOT EXISTS evaluation_objections (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    evaluation_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,

    -- 異議内容
    objection_type VARCHAR(50) NOT NULL COMMENT 'score, process, bias, other',
    objection_reason TEXT NOT NULL,
    requested_changes TEXT NOT NULL,

    -- 添付資料
    supporting_docs TEXT COMMENT 'JSON形式でファイルパスを保存',

    -- ステータス管理
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, under_review, resolved, rejected',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT 'low, normal, high, urgent',

    -- 審査プロセス
    reviewer_id VARCHAR(50),
    reviewer_name VARCHAR(100),
    review_started_at DATETIME,
    review_completed_at DATETIME,
    resolution TEXT,

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_evaluation (evaluation_id),
    INDEX idx_employee (employee_id),
    INDEX idx_status_priority (status, priority),
    CONSTRAINT fk_objection_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    CONSTRAINT fk_objection_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='評価異議申立管理テーブル';

-- アンケートテーブル
CREATE TABLE IF NOT EXISTS surveys (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL COMMENT 'satisfaction, feedback, pulse, annual',

    -- アンケート設定
    questions JSON NOT NULL COMMENT '質問構造をJSON形式で保存',
    target_departments JSON COMMENT '対象部門リスト',
    target_roles JSON COMMENT '対象役職リスト',

    -- 期間管理
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deadline DATETIME,

    -- ステータス管理
    status VARCHAR(20) DEFAULT 'draft' COMMENT 'draft, active, closed, archived',
    is_anonymous BOOLEAN DEFAULT TRUE,
    is_required BOOLEAN DEFAULT FALSE,

    -- 作成者情報
    created_by VARCHAR(50) NOT NULL,
    created_by_name VARCHAR(100) NOT NULL,

    -- 統計情報
    total_responses INT DEFAULT 0,
    response_rate FLOAT,

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_type (type),
    CONSTRAINT fk_survey_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='アンケート管理テーブル';

-- アンケート回答テーブル
CREATE TABLE IF NOT EXISTS survey_responses (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    survey_id VARCHAR(50) NOT NULL,
    respondent_id VARCHAR(50) COMMENT '匿名の場合はNULL',

    -- 回答データ
    answers JSON NOT NULL COMMENT '回答をJSON形式で保存',

    -- 回答者属性（匿名化された統計用）
    department_group VARCHAR(50),
    role_group VARCHAR(50),
    tenure_group VARCHAR(20) COMMENT '0-1, 1-3, 3-5, 5-10, 10+',

    -- 完了状態
    is_complete BOOLEAN DEFAULT FALSE,
    completion_time INT COMMENT '回答時間（秒）',

    -- メタデータ
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) COMMENT 'IPv4/IPv6対応',
    user_agent TEXT,

    INDEX idx_survey (survey_id),
    INDEX idx_respondent (respondent_id),
    INDEX idx_submitted_at (submitted_at),
    CONSTRAINT fk_response_survey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    CONSTRAINT fk_response_respondent FOREIGN KEY (respondent_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='アンケート回答テーブル';

-- プロジェクトテーブル
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'improvement, innovation, cost_reduction, etc.',

    -- 提案者情報
    proposer_id VARCHAR(50) NOT NULL,
    proposer_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,

    -- プロジェクト詳細
    objectives JSON COMMENT '目標リストをJSON形式で保存',
    expected_outcomes TEXT,
    estimated_budget DECIMAL(15,2),
    actual_budget DECIMAL(15,2),

    -- タイムライン
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,

    -- ステータス管理
    status VARCHAR(30) DEFAULT 'proposed' COMMENT 'proposed, under_review, approved, in_progress, completed, cancelled',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT 'low, normal, high, critical',
    approval_level TINYINT DEFAULT 1 COMMENT '1-13の承認レベル',

    -- 承認プロセス
    current_approver_id VARCHAR(50),
    approval_history JSON COMMENT '承認履歴をJSON形式で保存',

    -- 成果測定
    kpi_metrics JSON COMMENT 'KPI定義をJSON形式で保存',
    progress_percentage TINYINT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status_priority (status, priority),
    INDEX idx_proposer (proposer_id),
    INDEX idx_approval_level (approval_level),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='プロジェクト管理テーブル';

-- プロジェクトメンバーテーブル
CREATE TABLE IF NOT EXISTS project_members (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,

    -- メンバー役割
    role VARCHAR(50) NOT NULL COMMENT 'owner, manager, member, viewer',
    responsibilities TEXT,

    -- 参加期間
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME,

    -- アクティブ状態
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE KEY unique_project_user (project_id, user_id),
    INDEX idx_user (user_id),
    INDEX idx_project (project_id),
    CONSTRAINT fk_member_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='プロジェクトメンバー管理テーブル';

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    recipient_id VARCHAR(50) NOT NULL,

    -- 通知内容
    type VARCHAR(50) NOT NULL COMMENT 'announcement, reminder, alert, approval_request, etc.',
    category VARCHAR(50) NOT NULL COMMENT 'interview, evaluation, survey, project, system',
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    -- 優先度と状態
    priority VARCHAR(20) DEFAULT 'normal' COMMENT 'low, normal, high, urgent',
    status VARCHAR(20) DEFAULT 'unread' COMMENT 'unread, read, archived',

    -- アクション関連
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    action_deadline DATETIME,

    -- 送信者情報
    sender_id VARCHAR(50),
    sender_name VARCHAR(100),

    -- 配信管理
    delivery_method VARCHAR(50) DEFAULT 'in_app' COMMENT 'in_app, email, sms, push',
    delivered_at DATETIME,
    read_at DATETIME,

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,

    INDEX idx_recipient_status (recipient_id, status),
    INDEX idx_type_category (type, category),
    INDEX idx_priority_action (priority, action_required),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知管理テーブル';

-- フィードバックテーブル
CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    from_user_id VARCHAR(50) NOT NULL,
    to_user_id VARCHAR(50) COMMENT 'NULLの場合は一般的なフィードバック',

    -- フィードバック内容
    type VARCHAR(50) NOT NULL COMMENT 'appreciation, suggestion, concern, complaint',
    category VARCHAR(50) NOT NULL COMMENT 'work, behavior, process, system',
    content TEXT NOT NULL,

    -- 関連コンテキスト
    context_type VARCHAR(50) COMMENT 'project, evaluation, interview, general',
    context_id VARCHAR(50) COMMENT '関連エンティティのID',

    -- プライバシー設定
    is_anonymous BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'private' COMMENT 'private, managers, public',

    -- ステータス管理
    status VARCHAR(20) DEFAULT 'submitted' COMMENT 'submitted, acknowledged, in_progress, resolved',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT 'low, normal, high, urgent',

    -- レスポンス管理
    response_required BOOLEAN DEFAULT FALSE,
    responded_at DATETIME,
    response TEXT,
    responder_id VARCHAR(50),

    -- メタデータ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_status_priority (status, priority),
    INDEX idx_type_category (type, category),
    CONSTRAINT fk_feedback_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='フィードバック管理テーブル';

-- ユーザー分析テーブル
CREATE TABLE IF NOT EXISTS user_analytics (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    period VARCHAR(20) NOT NULL COMMENT '期間（例：2025_Q1, 2025_W12）',
    period_type VARCHAR(20) NOT NULL COMMENT 'daily, weekly, monthly, quarterly, yearly',

    -- エンゲージメント指標
    login_count INT DEFAULT 0,
    active_minutes INT DEFAULT 0,
    interviews_scheduled INT DEFAULT 0,
    interviews_completed INT DEFAULT 0,
    surveys_completed INT DEFAULT 0,
    feedbacks_given INT DEFAULT 0,
    feedbacks_received INT DEFAULT 0,
    projects_participated INT DEFAULT 0,

    -- パフォーマンス指標
    average_response_time FLOAT COMMENT '平均応答時間（分）',
    task_completion_rate FLOAT COMMENT 'タスク完了率（0-100）',

    -- 満足度指標
    satisfaction_score FLOAT COMMENT '満足度スコア（0-10）',
    nps_score SMALLINT COMMENT 'NPSスコア（-100 to 100）',

    -- メタデータ
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_period (user_id, period, period_type),
    INDEX idx_period_type (period, period_type),
    INDEX idx_user (user_id),
    CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ユーザー分析データテーブル';

-- ====================================================
-- 2. システム管理テーブル
-- ====================================================

-- データベース移行履歴
CREATE TABLE IF NOT EXISTS migration_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INT,
    checksum VARCHAR(64)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='データベース移行履歴';

-- システム設定
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='システム設定管理';

-- 監査ログ
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_action (user_id, action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='監査ログ';

-- ====================================================
-- 3. 初期データ投入
-- ====================================================

-- システム設定初期値
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('system.version', '1.0.0', 'version', 'システムバージョン'),
('database.schema_version', '2025.09.21.001', 'version', 'データベーススキーマバージョン'),
('integration.voicedrive.enabled', 'true', 'feature', 'VoiceDrive統合機能'),
('integration.medical_system.enabled', 'false', 'feature', '医療職員カルテシステム統合（準備中）'),
('security.password_min_length', '12', 'security', 'パスワード最小文字数'),
('security.password_expire_days', '90', 'security', 'パスワード有効期限（日）'),
('security.max_login_attempts', '5', 'security', '最大ログイン試行回数'),
('security.lockout_duration_minutes', '30', 'security', 'アカウントロック時間（分）'),
('notification.email.enabled', 'true', 'notification', 'メール通知機能'),
('notification.sms.enabled', 'false', 'notification', 'SMS通知機能'),
('data.retention_years', '7', 'data', 'データ保持期間（年）'),
('data.anonymize_retired_after_days', '30', 'data', '退職後匿名化期間（日）'),
('backup.enabled', 'true', 'backup', '自動バックアップ'),
('backup.retention_days', '30', 'backup', 'バックアップ保持期間（日）'),
('maintenance.mode', 'false', 'system', 'メンテナンスモード');

-- 初期移行記録
INSERT INTO migration_history (version, description, checksum) VALUES
('2025.09.21.001', 'Initial VoiceDrive MySQL schema for medical staff integration', SHA2('initial_schema', 256));

-- ====================================================
-- 4. ビュー作成
-- ====================================================

-- アクティブユーザービュー
CREATE OR REPLACE VIEW active_users_view AS
SELECT
    u.*,
    COUNT(DISTINCT i.id) as pending_interviews,
    COUNT(DISTINCT e.id) as pending_evaluations,
    COUNT(DISTINCT n.id) as unread_notifications
FROM users u
LEFT JOIN interviews i ON u.id = i.employee_id AND i.status = 'pending'
LEFT JOIN evaluations e ON u.id = e.employee_id AND e.status = 'draft'
LEFT JOIN notifications n ON u.id = n.recipient_id AND n.status = 'unread'
WHERE u.is_retired = FALSE
GROUP BY u.id;

-- 部門別統計ビュー
CREATE OR REPLACE VIEW department_statistics_view AS
SELECT
    department,
    COUNT(DISTINCT id) as total_employees,
    AVG(permission_level) as avg_permission_level,
    COUNT(DISTINCT CASE WHEN is_retired = TRUE THEN id END) as retired_count,
    COUNT(DISTINCT facility_id) as facility_count
FROM users
GROUP BY department;

-- ====================================================
-- 5. ストアドプロシージャ
-- ====================================================

DELIMITER //

-- ユーザー退職処理
CREATE PROCEDURE retire_user(
    IN p_user_id VARCHAR(50),
    IN p_retirement_date DATE
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User retirement process failed';
    END;

    START TRANSACTION;

    -- ユーザーを退職状態に更新
    UPDATE users
    SET
        is_retired = TRUE,
        retirement_date = p_retirement_date,
        anonymized_id = CONCAT('RETIRED_', MD5(CONCAT(id, NOW())))
    WHERE id = p_user_id;

    -- 進行中の面談をキャンセル
    UPDATE interviews
    SET status = 'cancelled'
    WHERE employee_id = p_user_id AND status IN ('pending', 'scheduled');

    -- 通知をアーカイブ
    UPDATE notifications
    SET status = 'archived'
    WHERE recipient_id = p_user_id AND status = 'unread';

    -- 監査ログに記録
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
    VALUES (p_user_id, 'USER_RETIRED', 'user', p_user_id);

    COMMIT;
END//

-- 月次統計計算
CREATE PROCEDURE calculate_monthly_statistics(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    DECLARE v_period VARCHAR(20);
    SET v_period = CONCAT(p_year, '_M', LPAD(p_month, 2, '0'));

    -- ユーザーごとの月次統計を集計
    INSERT INTO user_analytics (
        id, user_id, period, period_type,
        interviews_scheduled, interviews_completed,
        surveys_completed, feedbacks_given, feedbacks_received
    )
    SELECT
        UUID() as id,
        u.id as user_id,
        v_period as period,
        'monthly' as period_type,
        COUNT(DISTINCT i_sched.id) as interviews_scheduled,
        COUNT(DISTINCT i_comp.id) as interviews_completed,
        COUNT(DISTINCT sr.id) as surveys_completed,
        COUNT(DISTINCT f_given.id) as feedbacks_given,
        COUNT(DISTINCT f_received.id) as feedbacks_received
    FROM users u
    LEFT JOIN interviews i_sched ON u.id = i_sched.employee_id
        AND YEAR(i_sched.scheduled_date) = p_year
        AND MONTH(i_sched.scheduled_date) = p_month
    LEFT JOIN interviews i_comp ON u.id = i_comp.employee_id
        AND i_comp.status = 'completed'
        AND YEAR(i_comp.actual_date) = p_year
        AND MONTH(i_comp.actual_date) = p_month
    LEFT JOIN survey_responses sr ON u.id = sr.respondent_id
        AND YEAR(sr.submitted_at) = p_year
        AND MONTH(sr.submitted_at) = p_month
    LEFT JOIN feedbacks f_given ON u.id = f_given.from_user_id
        AND YEAR(f_given.created_at) = p_year
        AND MONTH(f_given.created_at) = p_month
    LEFT JOIN feedbacks f_received ON u.id = f_received.to_user_id
        AND YEAR(f_received.created_at) = p_year
        AND MONTH(f_received.created_at) = p_month
    GROUP BY u.id
    ON DUPLICATE KEY UPDATE
        interviews_scheduled = VALUES(interviews_scheduled),
        interviews_completed = VALUES(interviews_completed),
        surveys_completed = VALUES(surveys_completed),
        feedbacks_given = VALUES(feedbacks_given),
        feedbacks_received = VALUES(feedbacks_received),
        calculated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- ====================================================
-- 6. トリガー
-- ====================================================

DELIMITER //

-- 評価提出時の通知作成
CREATE TRIGGER after_evaluation_submit
AFTER UPDATE ON evaluations
FOR EACH ROW
BEGIN
    IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
        INSERT INTO notifications (
            id, recipient_id, type, category, title, content,
            priority, sender_id, sender_name
        ) VALUES (
            UUID(),
            NEW.employee_id,
            'announcement',
            'evaluation',
            'V3評価が提出されました',
            CONCAT('評価期間 ', NEW.evaluation_period, ' の評価が提出されました。内容を確認してください。'),
            'high',
            NEW.evaluator_id,
            NEW.evaluator_name
        );
    END IF;
END//

-- プロジェクト承認時のメンバー追加
CREATE TRIGGER after_project_approval
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'under_review' THEN
        -- 提案者をオーナーとして追加
        INSERT INTO project_members (
            id, project_id, user_id, role, responsibilities
        ) VALUES (
            UUID(),
            NEW.id,
            NEW.proposer_id,
            'owner',
            'プロジェクトオーナー'
        );
    END IF;
END//

DELIMITER ;

-- ====================================================
-- 7. 権限設定
-- ====================================================

-- 読み取り専用ユーザー用ビュー権限
-- (実際の権限付与はLightsailセットアップスクリプトで実行)

-- ====================================================
-- 完了メッセージ
-- ====================================================

SELECT
    'VoiceDrive MySQL Database Initialization Complete!' as Message,
    COUNT(*) as Tables_Created,
    DATABASE() as Database_Name,
    VERSION() as MySQL_Version
FROM information_schema.tables
WHERE table_schema = DATABASE();