-- Migration: Add 25-level permission system (MySQL版)
-- Date: 2025-10-04
-- Description: Change permission_level from TINYINT to DECIMAL(4,1) and add new fields
-- Target: AWS Lightsail MySQL 8.0

-- Step 1: 新しいカラムを追加
ALTER TABLE users ADD COLUMN permission_level_new DECIMAL(4,1);
ALTER TABLE users ADD COLUMN can_perform_leader_duty BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN profession_category VARCHAR(50);

-- Step 2: 既存データを新カラムにコピー（INT → DECIMAL変換）
UPDATE users SET permission_level_new = CAST(permission_level AS DECIMAL(4,1));

-- Step 3: 既存データの権限レベルを新体系に移行
-- 旧13レベルから新18レベルへのマッピング

-- STAFFは暫定Level 1
UPDATE users SET permission_level_new = 1.0 WHERE account_type = 'STAFF';

-- 他の役職は以下のマッピングで更新
UPDATE users SET permission_level_new = 6.0 WHERE account_type = 'SUPERVISOR';  -- 主任
UPDATE users SET permission_level_new = 8.0 WHERE account_type = 'HEAD_NURSE';  -- 師長
UPDATE users SET permission_level_new = 10.0 WHERE account_type = 'DEPARTMENT_HEAD';  -- 部長
UPDATE users SET permission_level_new = 11.0 WHERE account_type = 'ADMINISTRATIVE_DIRECTOR';  -- 事務長
UPDATE users SET permission_level_new = 12.0 WHERE account_type = 'VICE_DIRECTOR';  -- 副院長
UPDATE users SET permission_level_new = 13.0 WHERE account_type = 'HOSPITAL_DIRECTOR';  -- 院長
UPDATE users SET permission_level_new = 14.0 WHERE account_type IN ('HR_ADMIN_STAFF', 'CAREER_SUPPORT_STAFF');  -- 人事部門員
UPDATE users SET permission_level_new = 15.0 WHERE account_type = 'HR_DEPARTMENT_HEAD';  -- 人事部門長
UPDATE users SET permission_level_new = 17.0 WHERE account_type = 'HR_GENERAL_MANAGER';  -- 人事統括部門長
UPDATE users SET permission_level_new = 18.0 WHERE account_type IN ('GENERAL_ADMINISTRATIVE_DIRECTOR', 'CHAIRMAN');  -- 事務局長・理事長

-- Step 4: account_typeを新体系に更新
UPDATE users SET account_type = 'NEW_STAFF' WHERE account_type = 'STAFF';
UPDATE users SET account_type = 'CHIEF' WHERE account_type = 'SUPERVISOR';
UPDATE users SET account_type = 'MANAGER' WHERE account_type = 'HEAD_NURSE';
UPDATE users SET account_type = 'DIRECTOR' WHERE account_type = 'DEPARTMENT_HEAD';
-- ADMINISTRATIVE_DIRECTORは変更なし
UPDATE users SET account_type = 'VICE_PRESIDENT' WHERE account_type = 'VICE_DIRECTOR';
UPDATE users SET account_type = 'PRESIDENT' WHERE account_type = 'HOSPITAL_DIRECTOR';
UPDATE users SET account_type = 'HR_STAFF' WHERE account_type IN ('HR_ADMIN_STAFF', 'CAREER_SUPPORT_STAFF');
UPDATE users SET account_type = 'HR_MANAGER' WHERE account_type = 'HR_DEPARTMENT_HEAD';
UPDATE users SET account_type = 'STRATEGIC_PLANNING_MANAGER' WHERE account_type = 'HR_GENERAL_MANAGER';
UPDATE users SET account_type = 'BOARD_MEMBER' WHERE account_type IN ('GENERAL_ADMINISTRATIVE_DIRECTOR', 'CHAIRMAN');

-- Step 5: 旧カラムを削除し、新カラムをリネーム
ALTER TABLE users DROP COLUMN permission_level;
ALTER TABLE users CHANGE COLUMN permission_level_new permission_level DECIMAL(4,1) NOT NULL;

-- Step 6: CHECK制約を追加（MySQL 8.0以降）
ALTER TABLE users ADD CONSTRAINT chk_permission_level CHECK (
    (permission_level BETWEEN 1 AND 18) OR
    permission_level IN (1.5, 2.5, 3.5, 4.5) OR
    permission_level IN (97, 98, 99)
);

-- Step 7: インデックスを再作成（permission_levelが変更されたため）
-- 既存のインデックスは自動的に更新されるが、念のため確認
ALTER TABLE users DROP INDEX idx_facility_permission;
CREATE INDEX idx_facility_permission ON users(facility_id, permission_level);

-- 完了
-- ⚠️ 注意: このマイグレーション後、医療システムAPIを使用して正確な権限レベルを再計算することを強く推奨

-- ロールバック用SQL（緊急時）
-- ALTER TABLE users ADD COLUMN permission_level_old TINYINT;
-- UPDATE users SET permission_level_old = FLOOR(permission_level);
-- ALTER TABLE users DROP COLUMN permission_level;
-- ALTER TABLE users CHANGE COLUMN permission_level_old permission_level TINYINT NOT NULL;
