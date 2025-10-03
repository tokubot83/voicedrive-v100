-- CreateTable
CREATE TABLE "ComplianceAcknowledgement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "medicalSystemCaseNumber" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL,
    "estimatedResponseTime" TEXT NOT NULL,
    "requiresImmediateAction" BOOLEAN NOT NULL DEFAULT false,
    "currentStatus" TEXT NOT NULL DEFAULT 'received',
    "nextSteps" TEXT,
    "webhookReceivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceAcknowledgement_reportId_key" ON "ComplianceAcknowledgement"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceAcknowledgement_medicalSystemCaseNumber_key" ON "ComplianceAcknowledgement"("medicalSystemCaseNumber");

-- CreateIndex
CREATE INDEX "ComplianceAcknowledgement_reportId_idx" ON "ComplianceAcknowledgement"("reportId");

-- CreateIndex
CREATE INDEX "ComplianceAcknowledgement_anonymousId_idx" ON "ComplianceAcknowledgement"("anonymousId");

-- CreateIndex
CREATE INDEX "ComplianceAcknowledgement_medicalSystemCaseNumber_idx" ON "ComplianceAcknowledgement"("medicalSystemCaseNumber");
