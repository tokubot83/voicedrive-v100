-- Phase 6 期限到達判断履歴テストデータ
-- エクスポート日時: 2025-10-20T00:25:03.482Z
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

INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zid000js5d0bv8dn40w', 'cmgyc6pxm000js55kuudp03ww', 'test-director-1', 'reject', '到達率30.0%と低く、また期限を大幅に超過しているため、今回は不採用とします。別の形での提案を期待します。', 30, 100, 30, 12, 'escalated_to_dept', 'kaizen', '法人本部', 'facility-1', '2025-10-17T00:24:24.675Z', '2025-10-20T00:24:24.709Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zia000hs5d02jmlab54', 'cmgyc6pxh000hs55kxb18igbp', 'test-deputy-1', 'reject', '到達率70.0%と低く、また期限を大幅に超過しているため、今回は不採用とします。別の形での提案を期待します。', 420, 600, 70, 15, 'escalated_to_corp', 'kaizen', '看護部', 'facility-1', '2025-10-17T00:24:24.675Z', '2025-10-20T00:24:24.706Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zi2000ds5d073bvcua5', 'cmgyc6px5000ds55k94uhku4r', 'test-consent-user-004', 'downgrade', '到達率91.7%で目標に届きませんでしたが、提案内容には価値があるため、下位レベルでの実施を検討します。', 550, 600, 91.66666666666666, 20, 'escalated_to_corp', 'new_initiative', '医療技術部', NULL, '2025-10-16T00:24:24.675Z', '2025-10-20T00:24:24.698Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zhr0007s5d0uo5x048t', 'cmgyc6pwp0007s55kmpvingng', 'test-consent-user-001', 'approve_at_current_level', '到達率83.3%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 250, 300, 83.33333333333334, 10, 'escalated_to_facility', 'kaizen', '看護部', NULL, '2025-10-15T00:24:24.675Z', '2025-10-20T00:24:24.688Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zhk0003s5d0dm5o0fal', 'cmgyc6pwd0003s55k1tng046c', 'cmfs8u4i50002s5qsisvztx4f', 'approve_at_current_level', '到達率60.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 60, 100, 60, 3, 'escalated_to_dept', 'kaizen', '人事総務部', 'FACILITY_HQ', '2025-10-15T00:24:24.675Z', '2025-10-20T00:24:24.681Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zhg0001s5d0oj626ske', 'cmgyc6pw10001s55kns3fn8l1', 'cmfs8u4hx0000s5qs2dv42m45', 'approve_at_current_level', '到達率80.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 80, 100, 80, 5, 'escalated_to_dept', 'kaizen', '経営戦略室', 'FACILITY_HQ', '2025-10-12T00:24:24.675Z', '2025-10-20T00:24:24.677Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zi7000fs5d0alyvoz9t', 'cmgyc6pxc000fs55k0q110f4y', 'test-deletion-user-002', 'downgrade', '到達率80.0%で目標に届きませんでしたが、提案内容には価値があるため、下位レベルでの実施を検討します。', 480, 600, 80, 25, 'escalated_to_corp', 'collaboration', '看護部', NULL, '2025-10-11T00:24:24.675Z', '2025-10-20T00:24:24.703Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zhy000bs5d0zyqims57', 'cmgyc6px0000bs55kqd532bh9', 'test-consent-user-003', 'approve_at_current_level', '到達率50.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 150, 300, 50, 8, 'escalated_to_facility', 'new_initiative', '医療技術部', NULL, '2025-10-05T00:24:24.675Z', '2025-10-20T00:24:24.694Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zhu0009s5d0esio034a', 'cmgyc6pwv0009s55k6tuzro20', 'test-consent-user-002', 'approve_at_current_level', '到達率60.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 180, 300, 60, 14, 'escalated_to_facility', 'training', '看護部', NULL, '2025-10-05T00:24:24.675Z', '2025-10-20T00:24:24.691Z');
INSERT INTO "expired_escalation_decisions" ("id", "post_id", "decider_id", "decision", "decision_reason", "current_score", "target_score", "achievement_rate", "days_overdue", "agenda_level", "proposal_type", "department", "facility_id", "created_at", "updated_at") VALUES ('cmgye7zho0005s5d061v6a8a0', 'cmgyc6pwk0005s55kqw538d0h', 'test-affairs-1', 'approve_at_current_level', '到達率45.0%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。', 45, 100, 45, 7, 'escalated_to_dept', 'new_initiative', '総務部', 'facility-1', '2025-09-28T00:24:24.675Z', '2025-10-20T00:24:24.684Z');

COMMIT;

-- サマリー統計
-- 総件数: 10件
-- 承認: 6件 (60.0%)
-- ダウングレード: 2件 (20.0%)
-- 不採用: 2件 (20.0%)
-- 平均到達率: 65.0%
-- 平均期限超過日数: 11.9日