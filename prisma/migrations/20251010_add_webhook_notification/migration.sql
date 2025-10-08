-- CreateTable
CREATE TABLE IF NOT EXISTS "WebhookNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "accountLevel" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WebhookNotification_notificationId_key" ON "WebhookNotification"("notificationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookNotification_notificationId_idx" ON "WebhookNotification"("notificationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookNotification_type_idx" ON "WebhookNotification"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookNotification_accountLevel_idx" ON "WebhookNotification"("accountLevel");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookNotification_read_idx" ON "WebhookNotification"("read");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookNotification_timestamp_idx" ON "WebhookNotification"("timestamp");
