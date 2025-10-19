-- Phase 6 期限到達判断履歴テストデータ
-- エクスポート日時: 2025-10-19T23:41:53.983Z
-- 件数: 10件

-- テーブル作成（既に存在する場合はスキップ）
CREATE TABLE IF NOT EXISTS "expired_escalation_decisions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "post_id" TEXT NOT NULL,
  "decider_id" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "decision_reason" TEXT NOT NULL,
  "current_score" INTEGER NOT NULL,
  "target_score" INTEGER NOT NULL,
  "achievement_rate" REAL NOT NULL,
  "days_overdue" INTEGER NOT NULL,
  "agenda_level" TEXT NOT NULL,
  "proposal_type" TEXT,
  "department" TEXT,
  "facility_id" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS "expired_escalation_decisions_post_id_decider_id_facility_id_created_at_decision_idx" ON "expired_escalation_decisions"("post_id", "decider_id", "facility_id", "created_at", "decision");

-- データ投入
BEGIN TRANSACTION;

INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w390009s530uqxvju7l', 'cmgyc6pwv0009s55k6tuzro20', 'test-consent-user-002', 'approve_at_current_level', '到達率180.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 180, 100, 180, 14, 'escalated_to_facility', 'training', '看護部', NULL, '2025-10-15T23:29:07.682Z', '2025-10-19T23:29:07.702Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w3d000bs530jalwruxl', 'cmgyc6px0000bs55kqd532bh9', 'test-consent-user-003', 'approve_at_current_level', '到達率150.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 150, 100, 150, 8, 'escalated_to_facility', 'new_initiative', '医療技術部', NULL, '2025-10-12T23:29:07.682Z', '2025-10-19T23:29:07.705Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w3s000js530hx02i35s', 'cmgyc6pxm000js55kuudp03ww', 'test-director-1', 'reject', '到達率30.0%と低く、また期限を大幅に超過しているため、今回は不採用とします。別の形での提案を期待します。', 30, 100, 30, 12, 'escalated_to_dept', 'kaizen', '法人本部', 'facility-1', '2025-10-05T23:29:07.682Z', '2025-10-19T23:29:07.720Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w2x0003s530we77mqo5', 'cmgyc6pwd0003s55k1tng046c', 'cmfs8u4i50002s5qsisvztx4f', 'approve_at_current_level', '到達率60.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 60, 100, 60, 3, 'escalated_to_dept', 'kaizen', '人事総務部', 'FACILITY_HQ', '2025-10-05T23:29:07.682Z', '2025-10-19T23:29:07.689Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w340007s5301citb2iy', 'cmgyc6pwp0007s55kmpvingng', 'test-consent-user-001', 'approve_at_current_level', '到達率250.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 250, 100, 250, 10, 'escalated_to_facility', 'kaizen', '看護部', NULL, '2025-09-30T23:29:07.682Z', '2025-10-19T23:29:07.696Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w2s0001s530jgjbe4o9', 'cmgyc6pw10001s55kns3fn8l1', 'cmfs8u4hx0000s5qs2dv42m45', 'approve_at_current_level', '到達率80.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 80, 100, 80, 5, 'escalated_to_dept', 'kaizen', '経営戦略室', 'FACILITY_HQ', '2025-09-26T23:29:07.682Z', '2025-10-19T23:29:07.684Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w3h000ds530faszomj2', 'cmgyc6px5000ds55k94uhku4r', 'test-consent-user-004', 'downgrade', '到達率550.0%で目標に届きませんでしたが、提案内容には価値があるため、下位レベルでの実施を検討します。', 550, 100, 550, 20, 'escalated_to_corp', 'new_initiative', '医療技術部', NULL, '2025-09-24T23:29:07.682Z', '2025-10-19T23:29:07.709Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w3o000hs5308hwbcvc2', 'cmgyc6pxh000hs55kxb18igbp', 'test-deputy-1', 'reject', '到達率420.0%と低く、また期限を大幅に超過しているため、今回は不採用とします。別の形での提案を期待します。', 420, 100, 420, 15, 'escalated_to_corp', 'kaizen', '看護部', 'facility-1', '2025-09-20T23:29:07.682Z', '2025-10-19T23:29:07.717Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w3k000fs530k534u6kc', 'cmgyc6pxc000fs55k0q110f4y', 'test-deletion-user-002', 'downgrade', '到達率480.0%で目標に届きませんでしたが、提案内容には価値があるため、下位レベルでの実施を検討します。', 480, 100, 480, 25, 'escalated_to_corp', 'collaboration', '看護部', NULL, '2025-09-20T23:29:07.682Z', '2025-10-19T23:29:07.713Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgyc8w300005s530y70snckm', 'cmgyc6pwk0005s55kqw538d0h', 'test-affairs-1', 'approve_at_current_level', '到達率45.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 45, 100, 45, 7, 'escalated_to_dept', 'new_initiative', '総務部', 'facility-1', '2025-09-20T23:29:07.682Z', '2025-10-19T23:29:07.693Z');

COMMIT;

-- サマリー統計
-- 総件数: 10件
-- 承認: 6件 (60.0%)
-- ダウングレード: 2件 (20.0%)
-- 不採用: 2件 (20.0%)
-- 平均到達率: 224.5%
-- 平均期限超過日数: 11.9日