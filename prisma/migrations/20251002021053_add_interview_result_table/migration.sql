-- CreateTable
CREATE TABLE "InterviewResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "keyPoints" JSONB NOT NULL,
    "actionItems" JSONB NOT NULL,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" DATETIME,
    "feedbackToEmployee" TEXT NOT NULL,
    "nextRecommendations" JSONB NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'received',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewResult_requestId_key" ON "InterviewResult"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewResult_interviewId_key" ON "InterviewResult"("interviewId");
