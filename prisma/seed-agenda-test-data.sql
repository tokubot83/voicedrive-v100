-- 議題モードテストデータ投入スクリプト
-- 実行方法: sqlite3 prisma/dev.db < prisma/seed-agenda-test-data.sql

-- 既存のテストデータを削除（クリーンスタート）
DELETE FROM Post WHERE id LIKE 'test-post-%';
DELETE FROM User WHERE id LIKE 'test-%';

-- テストユーザー作成
-- 投稿者
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-author-1', 'AUT001', 'author@test.com', 'テスト投稿者', '看護部A病棟', 'facility-1', 1, 'staff', 0, datetime('now'), datetime('now'));

-- 主任（Level 3.5）
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-supervisor-1', 'SUP001', 'supervisor@test.com', '主任テスト太郎', '看護部A病棟', 'facility-1', 3.5, 'staff', 0, datetime('now'), datetime('now'));

-- 師長（Level 7）
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-manager-1', 'MGR001', 'manager@test.com', '師長テスト花子', '看護部A病棟', 'facility-1', 7, 'staff', 0, datetime('now'), datetime('now'));

-- 副看護部長（Level 8）
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-deputy-1', 'DEP001', 'deputy@test.com', '副看護部長テスト', '看護部', 'facility-1', 8, 'staff', 0, datetime('now'), datetime('now'));

-- 事務長（Level 11）
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-affairs-1', 'AFF001', 'affairs@test.com', '事務長テスト', '総務部', 'facility-1', 11, 'staff', 0, datetime('now'), datetime('now'));

-- 法人統括事務局長（Level 18）
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-director-1', 'DIR001', 'director@test.com', '法人統括事務局長テスト', '法人本部', 'facility-1', 18, 'executive', 0, datetime('now'), datetime('now'));

-- 部署メンバー（3名）
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-member-1', 'MEM001', 'member1@test.com', 'メンバー1', '看護部A病棟', 'facility-1', 1, 'staff', 0, datetime('now'), datetime('now')),
  ('test-member-2', 'MEM002', 'member2@test.com', 'メンバー2', '看護部A病棟', 'facility-1', 1, 'staff', 0, datetime('now'), datetime('now')),
  ('test-member-3', 'MEM003', 'member3@test.com', 'メンバー3', '看護部A病棟', 'facility-1', 1, 'staff', 0, datetime('now'), datetime('now'));

-- 他施設メンバー（法人通知テスト用）
INSERT INTO User (id, employeeId, email, name, department, facilityId, permissionLevel, accountType, isRetired, createdAt, updatedAt)
VALUES
  ('test-member-f2-1', 'MEM101', 'member-f2-1@test.com', '施設2メンバー1', '看護部', 'facility-2', 1, 'staff', 0, datetime('now'), datetime('now')),
  ('test-member-f2-2', 'MEM102', 'member-f2-2@test.com', '施設2メンバー2', '看護部', 'facility-2', 1, 'staff', 0, datetime('now'), datetime('now'));

-- テスト投稿を作成

-- 50点の投稿（主任判断待ち）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-50', 'proposal', 'テスト投稿：50点到達 - 業務効率化のための新システム導入提案。現在の業務フローを見直し、電子化を進めることで業務時間を30%削減できると考えます。', 'test-author-1', 'full', 'active', 50, 'DEPT_AGENDA', 'pending', datetime('now'), datetime('now'));

-- 主任推薦済みの投稿（師長判断待ち）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-50-rec', 'proposal', 'テスト投稿：主任推薦済み - 患者サービス向上提案。待ち時間短縮のため、予約システムを改善します。', 'test-author-1', 'full', 'active', 52, 'DEPT_AGENDA', 'recommended_to_manager', datetime('now'), datetime('now'));

-- 100点の投稿（副看護部長判断待ち）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-100', 'proposal', 'テスト投稿：100点到達 - 医療安全改善提案。インシデント報告システムを強化し、再発防止策を体系化します。', 'test-author-1', 'full', 'active', 100, 'FACILITY_AGENDA', 'pending_deputy_director_review', datetime('now'), datetime('now'));

-- 300点の投稿（事務長判断待ち）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-300', 'proposal', 'テスト投稿：300点到達 - 施設横断的な業務改善。各施設の成功事例を共有するプラットフォームを構築します。', 'test-author-1', 'full', 'active', 300, 'CORP_REVIEW', 'pending_general_affairs_review', datetime('now'), datetime('now'));

-- 600点の投稿（法人統括事務局長判断待ち）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-600', 'proposal', 'テスト投稿：600点到達 - 法人全体の経営改革提案。法人内全施設の経営指標をダッシュボード化し、リアルタイムで経営状況を可視化します。', 'test-author-1', 'full', 'active', 600, 'CORP_AGENDA', 'pending_general_affairs_director_review', datetime('now'), datetime('now'));

-- スコア到達テスト用投稿

-- 29点の投稿（30点到達テスト用）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-29', 'proposal', 'テスト投稿：29点 - 30点到達テスト用。休憩室の環境改善提案。', 'test-author-1', 'full', 'active', 29, 'DEPT_REVIEW', 'pending', datetime('now'), datetime('now'));

-- 49点の投稿（50点到達テスト用）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-49', 'proposal', 'テスト投稿：49点 - 50点到達テスト用。業務マニュアルの整備提案。', 'test-author-1', 'full', 'active', 49, 'DEPT_REVIEW', 'pending_supervisor_review', datetime('now'), datetime('now'));

-- 99点の投稿（100点到達テスト用）
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-99', 'proposal', 'テスト投稿：99点 - 100点到達テスト用。患者満足度向上施策。', 'test-author-1', 'full', 'active', 99, 'DEPT_AGENDA', 'escalated_to_facility', datetime('now'), datetime('now'));

-- 却下テスト用投稿
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-50-reject', 'proposal', 'テスト投稿：50点 - 却下テスト用。実現可能性の低い提案。', 'test-author-1', 'full', 'active', 50, 'DEPT_AGENDA', 'pending', datetime('now'), datetime('now'));

-- 救済フローテスト用投稿
INSERT INTO Post (id, type, content, authorId, anonymityLevel, status, agendaScore, agendaLevel, agendaStatus, createdAt, updatedAt)
VALUES
  ('test-post-100-rescue', 'proposal', 'テスト投稿：100点 - 救済フローテスト用。部署レベルでは重要だが施設レベルでは優先度が低い提案。', 'test-author-1', 'full', 'active', 100, 'FACILITY_AGENDA', 'pending_rescue_by_manager', datetime('now'), datetime('now'));

-- 確認用クエリ
SELECT '=== テストユーザー一覧 ===' as info;
SELECT id, name, department, permissionLevel FROM User WHERE id LIKE 'test-%' ORDER BY permissionLevel;

SELECT '=== テスト投稿一覧 ===' as info;
SELECT id, SUBSTR(content, 1, 50) as content, agendaScore, agendaLevel, agendaStatus FROM Post WHERE id LIKE 'test-post-%' ORDER BY agendaScore;
