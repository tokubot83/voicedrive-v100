-- Migration: Add 25-level permission system
-- Date: 2025-10-04
-- Description: Change permission_level from INT to DECIMAL(4,1) and add new fields

-- SQLite version (for development)
-- SQLiteはALTER COLUMN直接サポートしていないため、テーブル再作成方式を使用

-- Step 1: 新しいカラムを追加
ALTER TABLE User ADD COLUMN permissionLevel_new REAL;
ALTER TABLE User ADD COLUMN canPerformLeaderDuty INTEGER NOT NULL DEFAULT 0;
ALTER TABLE User ADD COLUMN professionCategory TEXT;

-- Step 2: 既存データを新カラムにコピー（INT → DECIMAL変換）
UPDATE User SET permissionLevel_new = CAST(permissionLevel AS REAL);

-- Step 3: 旧カラムを削除（SQLiteの制限により、一時テーブル方式を使用）
-- 注意: 本番環境では慎重に実施すること

-- 一時テーブル作成
CREATE TABLE User_new (
    id TEXT PRIMARY KEY NOT NULL,
    employeeId TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    facilityId TEXT,
    role TEXT,
    avatar TEXT,
    accountType TEXT NOT NULL,
    permissionLevel REAL NOT NULL,  -- INT → REAL (SQLiteのDECIMAL相当)
    canPerformLeaderDuty INTEGER NOT NULL DEFAULT 0,  -- Boolean (SQLite)
    professionCategory TEXT,
    parentId TEXT,
    budgetApprovalLimit REAL,
    stakeholderCategory TEXT,
    position TEXT,
    expertise INTEGER,
    hierarchyLevel INTEGER,
    isRetired INTEGER NOT NULL DEFAULT 0,
    retirementDate DATETIME,
    anonymizedId TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastLoginAt DATETIME,
    loginCount INTEGER NOT NULL DEFAULT 0
);

-- データコピー
INSERT INTO User_new SELECT
    id,
    employeeId,
    email,
    name,
    department,
    facilityId,
    role,
    avatar,
    accountType,
    permissionLevel_new,  -- 新しいDECIMAL型カラム
    0,  -- canPerformLeaderDuty（既存データはfalse）
    NULL,  -- professionCategory（既存データはNULL）
    parentId,
    budgetApprovalLimit,
    stakeholderCategory,
    position,
    expertise,
    hierarchyLevel,
    isRetired,
    retirementDate,
    anonymizedId,
    createdAt,
    updatedAt,
    lastLoginAt,
    loginCount
FROM User;

-- 旧テーブル削除
DROP TABLE User;

-- 新テーブルをUserにリネーム
ALTER TABLE User_new RENAME TO User;

-- インデックス再作成
CREATE UNIQUE INDEX User_employeeId_key ON User(employeeId);
CREATE UNIQUE INDEX User_email_key ON User(email);

-- Step 4: 既存データの権限レベルを新体系に移行
-- 注意: 旧13レベルから新18レベルへのマッピング
-- 詳細な経験年数が不明なため、暫定的なレベルを設定
-- 後で医療システムAPIで正確なレベルに更新することを推奨

-- STAFFは暫定Level 1
UPDATE User SET permissionLevel = 1.0 WHERE accountType = 'STAFF';

-- 他の役職は以下のマッピングで更新
UPDATE User SET permissionLevel = 6.0 WHERE accountType = 'SUPERVISOR';  -- 主任
UPDATE User SET permissionLevel = 8.0 WHERE accountType = 'HEAD_NURSE';  -- 師長
UPDATE User SET permissionLevel = 10.0 WHERE accountType = 'DEPARTMENT_HEAD';  -- 部長
UPDATE User SET permissionLevel = 11.0 WHERE accountType = 'ADMINISTRATIVE_DIRECTOR';  -- 事務長
UPDATE User SET permissionLevel = 12.0 WHERE accountType = 'VICE_DIRECTOR';  -- 副院長
UPDATE User SET permissionLevel = 13.0 WHERE accountType = 'HOSPITAL_DIRECTOR';  -- 院長
UPDATE User SET permissionLevel = 14.0 WHERE accountType IN ('HR_ADMIN_STAFF', 'CAREER_SUPPORT_STAFF');  -- 人事部門員
UPDATE User SET permissionLevel = 15.0 WHERE accountType = 'HR_DEPARTMENT_HEAD';  -- 人事部門長
UPDATE User SET permissionLevel = 17.0 WHERE accountType = 'HR_GENERAL_MANAGER';  -- 人事統括部門長
UPDATE User SET permissionLevel = 18.0 WHERE accountType IN ('GENERAL_ADMINISTRATIVE_DIRECTOR', 'CHAIRMAN');  -- 事務局長・理事長

-- Step 5: accountTypeを新体系に更新
UPDATE User SET accountType = 'NEW_STAFF' WHERE accountType = 'STAFF';
UPDATE User SET accountType = 'CHIEF' WHERE accountType = 'SUPERVISOR';
UPDATE User SET accountType = 'MANAGER' WHERE accountType = 'HEAD_NURSE';
UPDATE User SET accountType = 'DIRECTOR' WHERE accountType = 'DEPARTMENT_HEAD';
UPDATE User SET accountType = 'ADMINISTRATIVE_DIRECTOR' WHERE accountType = 'ADMINISTRATIVE_DIRECTOR';  -- 変更なし
UPDATE User SET accountType = 'VICE_PRESIDENT' WHERE accountType = 'VICE_DIRECTOR';
UPDATE User SET accountType = 'PRESIDENT' WHERE accountType = 'HOSPITAL_DIRECTOR';
UPDATE User SET accountType = 'HR_STAFF' WHERE accountType IN ('HR_ADMIN_STAFF', 'CAREER_SUPPORT_STAFF');
UPDATE User SET accountType = 'HR_MANAGER' WHERE accountType = 'HR_DEPARTMENT_HEAD';
UPDATE User SET accountType = 'STRATEGIC_PLANNING_MANAGER' WHERE accountType = 'HR_GENERAL_MANAGER';
UPDATE User SET accountType = 'BOARD_MEMBER' WHERE accountType IN ('GENERAL_ADMINISTRATIVE_DIRECTOR', 'CHAIRMAN');

-- 完了
-- ⚠️ 注意: このマイグレーション後、医療システムAPIを使用して正確な権限レベルを再計算することを強く推奨
