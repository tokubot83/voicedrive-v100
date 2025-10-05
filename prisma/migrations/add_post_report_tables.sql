-- 投稿通報テーブル
CREATE TABLE IF NOT EXISTS "PostReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "alertId" TEXT,
    "reporterId" TEXT NOT NULL,
    "reporterName" TEXT,
    "reportType" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "actionTaken" TEXT,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PostReport_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 通報アラートテーブル
CREATE TABLE IF NOT EXISTS "PostReportAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reportCount" INTEGER NOT NULL,
    "dominantReportType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT 0,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "autoModerated" BOOLEAN NOT NULL DEFAULT 0,
    "autoModeratedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostReportAlert_acknowledgedBy_fkey" FOREIGN KEY ("acknowledgedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- PostReportのインデックス
CREATE INDEX IF NOT EXISTS "PostReport_postId_idx" ON "PostReport"("postId");
CREATE INDEX IF NOT EXISTS "PostReport_reporterId_idx" ON "PostReport"("reporterId");
CREATE INDEX IF NOT EXISTS "PostReport_status_idx" ON "PostReport"("status");
CREATE INDEX IF NOT EXISTS "PostReport_reportType_idx" ON "PostReport"("reportType");
CREATE INDEX IF NOT EXISTS "PostReport_alertId_idx" ON "PostReport"("alertId");

-- PostReportAlertのインデックス
CREATE UNIQUE INDEX IF NOT EXISTS "PostReportAlert_postId_key" ON "PostReportAlert"("postId");
CREATE INDEX IF NOT EXISTS "PostReportAlert_postId_idx" ON "PostReportAlert"("postId");
CREATE INDEX IF NOT EXISTS "PostReportAlert_severity_idx" ON "PostReportAlert"("severity");
CREATE INDEX IF NOT EXISTS "PostReportAlert_acknowledged_idx" ON "PostReportAlert"("acknowledged");

-- PostReportとPostReportAlertの関連付け
-- ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "PostReportAlert" ("id") ON DELETE SET NULL ON UPDATE CASCADE;