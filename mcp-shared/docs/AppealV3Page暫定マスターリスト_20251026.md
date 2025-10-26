# AppealV3Page 暫定マスターリスト

**作成日**: 2025年10月26日
**対象ページ**: AppealV3Page (評価システム異議申し立てページ)
**URL**: https://voicedrive-v100.vercel.app/appeal-v3

---

## 📋 目次

1. [データ項目一覧](#データ項目一覧)
2. [テーブル定義](#テーブル定義)
3. [API仕様](#api仕様)
4. [ビジネスロジック](#ビジネスロジック)
5. [バリデーションルール](#バリデーションルール)
6. [実装チェックリスト](#実装チェックリスト)

---

## データ項目一覧

### 1. 異議申し立て基本情報（V3AppealRequest）

| No | 項目名 | フィールド名 | 型 | 必須 | デフォルト値 | 説明 | 管理者 |
|----|--------|------------|-----|------|------------|------|--------|
| 1 | 申し立てID | appealId | string | - | 自動生成 | V3-APPEAL-XXXXX形式 | 医療システム |
| 2 | 職員ID | employeeId | string | ○ | - | VoiceDriveの職員ID | VoiceDrive |
| 3 | 職員名 | employeeName | string | ○ | - | 職員の氏名 | VoiceDrive |
| 4 | 評価期間 | evaluationPeriod | string | ○ | - | 評価期間ID（例: 2025-H1-V3） | 医療システム |
| 5 | 申し立てカテゴリ | appealCategory | AppealCategory | ○ | - | CALCULATION_ERROR等 | VoiceDrive |
| 6 | 申し立て理由 | appealReason | string | ○ | - | 100-2000文字 | VoiceDrive |
| 7 | 現在のスコア | originalScore | number | ○ | - | 0-100の整数 | VoiceDrive |
| 8 | 希望するスコア | requestedScore | number | ○ | - | 0-100の整数 | VoiceDrive |
| 9 | 現在のグレード | originalGrade | string | - | 自動計算 | S, A+, A, B+, B, C, D | VoiceDrive（計算） |
| 10 | 希望するグレード | requestedGrade | string | - | 自動計算 | S, A+, A, B+, B, C, D | VoiceDrive（計算） |
| 11 | 施設内グレード | facilityGrade | string | - | - | 施設内相対評価グレード | 医療システム |
| 12 | 法人内グレード | corporateGrade | string | - | - | 法人内相対評価グレード | 医療システム |
| 13 | 総合グレード | overallGrade | string | - | - | 総合評価グレード | 医療システム |
| 14 | 総合スコア | overallScore | number | - | - | 総合評価スコア（0-100） | 医療システム |
| 15 | 証拠書類 | evidenceDocuments | array | - | [] | アップロードファイル情報 | VoiceDrive |

### 2. 証拠書類情報（EvidenceDocument）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 16 | ファイルID | fileId | string | ○ | FILE-V3-XXXXX形式 | 医療システム |
| 17 | ファイル名 | filename | string | ○ | 保存時のファイル名 | VoiceDrive |
| 18 | 元のファイル名 | originalName | string | ○ | ユーザーがアップロードした元のファイル名 | VoiceDrive |
| 19 | ファイルサイズ | size | number | ○ | バイト単位 | VoiceDrive |
| 20 | コンテンツタイプ | contentType | string | - | application/pdf等 | VoiceDrive |
| 21 | アップロード日時 | uploadedAt | string | - | ISO8601形式 | 医療システム |
| 22 | ファイルURL | url | string | - | ストレージURL | 医療システム |

### 3. スコア詳細情報（Scores）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 23 | 現在の総合スコア | currentTotal | number | ○ | 0-100 | VoiceDrive |
| 24 | 異議項目リスト | disputedItems | array | - | 個別項目ごとの異議 | VoiceDrive |

### 4. 相対評価情報（RelativeEvaluation）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 25 | 施設内グレード | facilityGrade | string | - | S, A, B, C, D | 医療システム |
| 26 | 法人内グレード | corporateGrade | string | - | S, A, B, C, D | 医療システム |
| 27 | 異議理由 | disputeReason | string | - | 相対評価に対する異議理由 | VoiceDrive |

### 5. デバイス情報（DeviceInfo）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 28 | プラットフォーム | platform | string | ○ | desktop/mobile/tablet | VoiceDrive（自動検出） |
| 29 | バージョン | version | string | ○ | アプリバージョン（3.2.1） | VoiceDrive |
| 30 | ユーザーエージェント | userAgent | string | ○ | navigator.userAgent | VoiceDrive（自動取得） |

### 6. 送信メタデータ

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 31 | VoiceDriveユーザーID | voiceDriveUserId | string | ○ | LocalStorageまたはemployeeId | VoiceDrive |
| 32 | 送信日時 | submittedAt | string | ○ | ISO8601形式 | VoiceDrive（自動生成） |
| 33 | APIバージョン | apiVersion | string | ○ | "v3.0.0" | VoiceDrive（固定） |

### 7. 異議申し立てレスポンス情報（V3AppealResponse）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 34 | 成功フラグ | success | boolean | ○ | true/false | 医療システム |
| 35 | 申し立てID | appealId | string | ○ | V3-APPEAL-XXXXX | 医療システム（生成） |
| 36 | バージョン | version | string | ○ | "v3.0.0" | 医療システム |
| 37 | メッセージ | message | string | ○ | "V3異議申し立てを受理しました" | 医療システム |

### 8. レスポンス詳細情報（Details）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 38 | ステータス | status | AppealStatus | ○ | submitted等 | 医療システム |
| 39 | 優先度 | priority | string | ○ | high/medium/low | 医療システム（自動判定） |
| 40 | 処理日時 | processedAt | string | ○ | ISO8601形式 | 医療システム |
| 41 | 担当者ID | assignedTo | string | ○ | 担当審査者ID | 医療システム（自動割り当て） |
| 42 | 評価システム | evaluationSystem | string | ○ | "100-point" | 医療システム（固定） |
| 43 | グレードシステム | gradingSystem | string | ○ | "7-tier" | 医療システム（固定） |
| 44 | スコア差 | scoreDifference | number | ○ | 絶対値 | 医療システム（計算） |
| 45 | 現在のグレード | grade.current | string | ○ | S, A+, A等 | 医療システム |
| 46 | 希望するグレード | grade.requested | string | ○ | S, A+, A等 | 医療システム |

### 9. 異議申し立て一覧情報（V3AppealRecord）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 47 | 作成日時 | createdAt | string | ○ | ISO8601形式 | 医療システム |
| 48 | 予定回答日 | expectedResponseDate | string | - | ISO8601形式 | 医療システム（計算） |
| 49 | 担当審査者ID | assignedReviewer.id | string | - | 審査者ID | 医療システム |
| 50 | 担当審査者名 | assignedReviewer.name | string | - | 審査者氏名 | 医療システム |
| 51 | 担当審査者役割 | assignedReviewer.role | string | - | department_head_v3等 | 医療システム |

### 10. 評価期間情報（V3EvaluationPeriod）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 52 | 評価期間ID | id | string | ○ | 2025-H1-V3等 | 医療システム |
| 53 | 評価期間名 | name | string | ○ | "2025年度上期（V3）" | 医療システム |
| 54 | 期間開始日 | startDate | string | ○ | YYYY-MM-DD | 医療システム |
| 55 | 期間終了日 | endDate | string | ○ | YYYY-MM-DD | 医療システム |
| 56 | 評価開始日 | evaluationStartDate | string | ○ | YYYY-MM-DD | 医療システム |
| 57 | 評価終了日 | evaluationEndDate | string | ○ | YYYY-MM-DD | 医療システム |
| 58 | 開示日 | disclosureDate | string | ○ | YYYY-MM-DD | 医療システム |
| 59 | 申立期限 | appealDeadline | string | ○ | YYYY-MM-DD | 医療システム |
| 60 | ステータス | status | string | ○ | active/closed | 医療システム |

### 11. 下書きデータ（LocalStorage）

| No | 項目名 | フィールド名 | 型 | 必須 | 説明 | 管理者 |
|----|--------|------------|-----|------|------|--------|
| 61 | 下書き保存日時 | savedAt | string | ○ | ISO8601形式 | VoiceDrive（自動生成） |
| 62 | バージョン | version | string | ○ | "v3.0.0" | VoiceDrive（固定） |

---

## テーブル定義

### VoiceDrive側テーブル

#### ❌ 新規テーブル不要

**理由**:
- データ管理責任分界点の原則に従い、医療システムがSingle Source of Truth
- VoiceDriveは表示・送信のUIレイヤーのみ
- 下書き機能はLocalStorageで実装

### 医療システム側テーブル（推定）

#### V3Appeal テーブル

```sql
CREATE TABLE V3Appeal (
  appeal_id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  evaluation_period_id VARCHAR(50) NOT NULL,
  appeal_category VARCHAR(50) NOT NULL,
  appeal_reason TEXT NOT NULL,
  original_score INT NOT NULL CHECK (original_score >= 0 AND original_score <= 100),
  requested_score INT NOT NULL CHECK (requested_score >= 0 AND requested_score <= 100),
  original_grade VARCHAR(3),
  requested_grade VARCHAR(3),
  facility_grade VARCHAR(3),
  corporate_grade VARCHAR(3),
  overall_grade VARCHAR(3),
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  priority VARCHAR(10) NOT NULL,
  score_difference INT NOT NULL,
  assigned_reviewer_id VARCHAR(50),
  expected_response_date TIMESTAMP,
  voicedrive_user_id VARCHAR(50),
  device_platform VARCHAR(20),
  device_version VARCHAR(20),
  device_user_agent TEXT,
  submitted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_comment TEXT,
  final_score INT CHECK (final_score >= 0 AND final_score <= 100),
  final_grade VARCHAR(3),
  api_version VARCHAR(10) DEFAULT 'v3.0.0',
  INDEX idx_employee_id (employee_id),
  INDEX idx_evaluation_period (evaluation_period_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  FOREIGN KEY (evaluation_period_id) REFERENCES V3EvaluationPeriod(id),
  FOREIGN KEY (assigned_reviewer_id) REFERENCES MedicalSystemUser(id)
);
```

#### V3AppealAttachment テーブル

```sql
CREATE TABLE V3AppealAttachment (
  attachment_id VARCHAR(50) PRIMARY KEY,
  appeal_id VARCHAR(50) NOT NULL,
  file_id VARCHAR(50) NOT NULL UNIQUE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  content_type VARCHAR(100),
  url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_appeal_id (appeal_id),
  INDEX idx_file_id (file_id),
  FOREIGN KEY (appeal_id) REFERENCES V3Appeal(appeal_id) ON DELETE CASCADE
);
```

#### V3AppealAuditLog テーブル

```sql
CREATE TABLE V3AppealAuditLog (
  log_id VARCHAR(50) PRIMARY KEY,
  appeal_id VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id VARCHAR(50) NOT NULL,
  actor_name VARCHAR(100) NOT NULL,
  comment TEXT,
  old_status VARCHAR(30),
  new_status VARCHAR(30),
  old_priority VARCHAR(10),
  new_priority VARCHAR(10),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_appeal_id (appeal_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (appeal_id) REFERENCES V3Appeal(appeal_id) ON DELETE CASCADE
);
```

#### V3EvaluationPeriod テーブル

```sql
CREATE TABLE V3EvaluationPeriod (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  evaluation_start_date DATE NOT NULL,
  evaluation_end_date DATE NOT NULL,
  disclosure_date DATE NOT NULL,
  appeal_deadline DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  max_score INT DEFAULT 100,
  min_score INT DEFAULT 0,
  grade_system VARCHAR(20) DEFAULT '7-tier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_appeal_deadline (appeal_deadline)
);
```

---

## API仕様

### 1. GET /api/v3/evaluation/periods

**目的**: 申立可能な評価期間一覧を取得

**エンドポイント**: `http://localhost:8080/api/v3/evaluation/periods`

**メソッド**: GET

**認証**: Bearer Token

**レスポンス**:
```json
{
  "success": true,
  "version": "v3.0.0",
  "systemType": "100-point-7-tier",
  "periods": [
    {
      "id": "2025-H1-V3",
      "name": "2025年度上期（V3）",
      "startDate": "2025-04-01",
      "endDate": "2025-09-30",
      "evaluationStartDate": "2025-10-01",
      "evaluationEndDate": "2025-10-15",
      "disclosureDate": "2025-10-16",
      "appealDeadline": "2025-10-30",
      "status": "active",
      "evaluationSystem": {
        "maxScore": 100,
        "minScore": 0,
        "gradeSystem": "7-tier",
        "gradeBoundaries": [90, 80, 70, 60, 50, 40, 0],
        "gradeLabels": ["S", "A+", "A", "B+", "B", "C", "D"]
      }
    }
  ]
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

---

### 2. POST /api/v3/appeals/submit

**目的**: 異議申し立てを送信

**エンドポイント**: `http://localhost:8080/api/v3/appeals/submit`

**メソッド**: POST

**認証**: Bearer Token

**タイムアウト**: 10秒

**リクエストボディ**:
```json
{
  "employeeId": "V3-TEST-E001",
  "employeeName": "V3テスト太郎",
  "evaluationPeriod": "2025-H1-V3",
  "appealCategory": "CALCULATION_ERROR",
  "appealReason": "評価スコアの計算に誤りがあると考えます。...",
  "originalScore": 68,
  "requestedScore": 94,
  "evidenceDocuments": [
    {
      "fileId": "FILE-V3-00001",
      "filename": "evidence_2025_01.pdf",
      "originalName": "評価資料.pdf",
      "size": 1048576
    }
  ],
  "scores": {
    "currentTotal": 68,
    "disputedItems": []
  },
  "relativeEvaluation": {
    "facilityGrade": "B+",
    "corporateGrade": "B+",
    "disputeReason": "評価スコアの計算に誤りがあると考えます"
  },
  "voiceDriveUserId": "V3-TEST-E001",
  "deviceInfo": {
    "platform": "desktop",
    "version": "3.2.1",
    "userAgent": "Mozilla/5.0..."
  },
  "attachments": [],
  "submittedAt": "2025-10-26T10:30:00.000Z",
  "apiVersion": "v3.0.0"
}
```

**成功レスポンス**:
```json
{
  "success": true,
  "appealId": "V3-APPEAL-00001",
  "version": "v3.0.0",
  "message": "V3異議申し立てを受理しました",
  "details": {
    "status": "submitted",
    "priority": "high",
    "processedAt": "2025-10-26T10:30:05.000Z",
    "assignedTo": "DEPT_HEAD_V3_001",
    "evaluationSystem": "100-point",
    "gradingSystem": "7-tier",
    "scoreDifference": 26,
    "grade": {
      "current": "B+",
      "requested": "S"
    }
  }
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "申し立て理由は100文字以上入力してください",
    "details": {
      "field": "appealReason",
      "currentLength": 50,
      "requiredMinLength": 100
    }
  }
}
```

---

### 3. GET /api/v3/appeals

**目的**: 異議申し立て一覧を取得

**エンドポイント**: `http://localhost:8080/api/v3/appeals?employeeId={employeeId}`

**メソッド**: GET

**認証**: Bearer Token

**クエリパラメータ**:
- `employeeId` (optional): 職員IDでフィルタリング

**成功レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "appealId": "V3-APPEAL-00001",
      "employeeId": "V3-TEST-E001",
      "employeeName": "V3テスト太郎",
      "evaluationPeriod": "2025年度上期（V3）",
      "appealCategory": "点数計算の誤り",
      "status": "under_review",
      "priority": "high",
      "createdAt": "2025-08-20T14:55:00Z",
      "expectedResponseDate": "2025-08-27T14:55:00Z",
      "details": {
        "originalScore": 68,
        "requestedScore": 94,
        "originalGrade": "B+",
        "requestedGrade": "S",
        "scoreDifference": 26,
        "evaluationSystem": "100-point",
        "gradingSystem": "7-tier"
      },
      "assignedReviewer": {
        "id": "DEPT_HEAD_V3_001",
        "name": "V3部門長テスト",
        "role": "department_head_v3"
      }
    }
  ]
}
```

---

### 4. GET /api/v3/appeals/:appealId/status

**目的**: 異議申し立ての詳細ステータスを取得

**エンドポイント**: `http://localhost:8080/api/v3/appeals/:appealId/status`

**メソッド**: GET

**認証**: Bearer Token

**成功レスポンス**:
```json
{
  "success": true,
  "status": {
    "appealId": "V3-APPEAL-00001",
    "status": "under_review",
    "priority": "high",
    "assignedReviewer": {
      "id": "DEPT_HEAD_V3_001",
      "name": "V3部門長テスト",
      "role": "department_head_v3"
    },
    "expectedResponseDate": "2025-08-27T14:55:00Z",
    "lastUpdatedAt": "2025-08-21T09:00:00Z",
    "lastUpdatedBy": "SYSTEM"
  },
  "message": "審査中です"
}
```

---

### 5. POST /api/v3/appeals/upload

**目的**: 証拠書類をアップロード

**エンドポイント**: `http://localhost:8080/api/v3/appeals/upload`

**メソッド**: POST

**認証**: Bearer Token

**Content-Type**: multipart/form-data

**リクエストボディ**:
```
FormData:
  - file: <File> (最大15MB)
  - apiVersion: "v3.0.0"
  - appealId: "V3-APPEAL-00001" (optional)
```

**成功レスポンス**:
```json
{
  "success": true,
  "fileId": "FILE-V3-00001",
  "url": "https://storage.example.com/appeals/v3/FILE-V3-00001.pdf"
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "ファイルサイズは15MB以下にしてください",
    "details": {
      "fileSize": 20971520,
      "maxSize": 15728640
    }
  }
}
```

---

## ビジネスロジック

### 1. グレード計算（V3GradeUtils.getGradeFromScore）

**目的**: スコアから7段階グレードを計算

**実装**: src/types/appeal-v3.ts Line 72-80

```typescript
static getGradeFromScore(score: number): string {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A+';
  if (score >= 70) return 'A';
  if (score >= 60) return 'B+';
  if (score >= 50) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
```

**テストケース**:
- 100点 → S
- 90点 → S
- 89点 → A+
- 80点 → A+
- 79点 → A
- 70点 → A
- 69点 → B+
- 60点 → B+
- 59点 → B
- 50点 → B
- 49点 → C
- 40点 → C
- 39点 → D
- 0点 → D

---

### 2. 優先度判定（V3GradeUtils.determineV3Priority）

**目的**: 申し立てカテゴリとスコア差から優先度を判定

**実装**: src/types/appeal-v3.ts Line 117-134

```typescript
static determineV3Priority(request: V3AppealRequest): 'high' | 'medium' | 'low' {
  // 計算誤りは最優先
  if (request.appealCategory === AppealCategory.CALCULATION_ERROR) {
    return 'high';
  }

  // スコア差による判定
  const scoreDiff = this.calculateScoreDifference(request.originalScore, request.requestedScore);
  if (scoreDiff >= 15) return 'high';    // 15点以上
  if (scoreDiff >= 8) return 'medium';   // 8-14点

  // 成果見落としは中優先度
  if (request.appealCategory === AppealCategory.ACHIEVEMENT_OVERSIGHT) {
    return 'medium';
  }

  return 'low';
}
```

**判定ロジック**:
1. **計算誤り（CALCULATION_ERROR）**: 必ずHIGH
2. **スコア差15点以上**: HIGH
3. **スコア差8-14点**: MEDIUM
4. **成果見落とし（ACHIEVEMENT_OVERSIGHT）**: MEDIUM
5. **その他、スコア差1-7点**: LOW

**テストケース**:
- カテゴリ: CALCULATION_ERROR、スコア差: 5点 → HIGH
- カテゴリ: OTHER、スコア差: 20点 → HIGH
- カテゴリ: OTHER、スコア差: 10点 → MEDIUM
- カテゴリ: ACHIEVEMENT_OVERSIGHT、スコア差: 5点 → MEDIUM
- カテゴリ: OTHER、スコア差: 3点 → LOW

---

### 3. スコア差計算（V3GradeUtils.calculateScoreDifference）

**目的**: 現在のスコアと希望するスコアの絶対値差を計算

**実装**: src/types/appeal-v3.ts Line 113-115

```typescript
static calculateScoreDifference(original: number, requested: number): number {
  return Math.abs(requested - original);
}
```

**テストケース**:
- 原点: 68、希望: 94 → 26
- 原点: 80、希望: 75 → 5
- 原点: 50、希望: 50 → 0

---

### 4. グレード範囲取得（V3GradeUtils.getScoreRangeForGrade）

**目的**: グレードからスコア範囲を取得

**実装**: src/types/appeal-v3.ts Line 86-94

```typescript
static getScoreRangeForGrade(grade: string): { min: number; max: number } {
  const index = this.GRADE_LABELS.indexOf(grade);
  if (index === -1) return { min: 0, max: 0 };

  const min = this.GRADE_BOUNDARIES[index + 1] || 0;
  const max = index === 0 ? 100 : this.GRADE_BOUNDARIES[index] - 1;

  return { min, max };
}
```

**テストケース**:
- S → { min: 90, max: 100 }
- A+ → { min: 80, max: 89 }
- A → { min: 70, max: 79 }
- B+ → { min: 60, max: 69 }
- B → { min: 50, max: 59 }
- C → { min: 40, max: 49 }
- D → { min: 0, max: 39 }

---

### 5. グレード変更メッセージ（V3GradeUtils.getGradeProgressionMessage）

**目的**: グレード変更をわかりやすいメッセージで表示

**実装**: src/types/appeal-v3.ts Line 136-147

```typescript
static getGradeProgressionMessage(currentGrade: string, requestedGrade: string): string {
  const current = this.GRADE_LABELS.indexOf(currentGrade);
  const requested = this.GRADE_LABELS.indexOf(requestedGrade);

  if (requested < current) {
    return `グレードアップを希望（${currentGrade} → ${requestedGrade}）`;
  } else if (requested > current) {
    return `グレードダウン（${currentGrade} → ${requestedGrade}）`;
  } else {
    return `現在のグレード維持（${currentGrade}）`;
  }
}
```

**テストケース**:
- B+ → S → "グレードアップを希望（B+ → S）"
- A → B → "グレードダウン（A → B）"
- A → A → "現在のグレード維持（A）"

---

### 6. プラットフォーム検出（appealServiceV3.detectPlatform）

**目的**: デバイスタイプを自動検出

**実装**: src/services/appealServiceV3.ts Line 418-423

```typescript
private detectPlatform(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mobile')) return 'mobile';
  if (userAgent.includes('tablet')) return 'tablet';
  return 'desktop';
}
```

---

## バリデーションルール

### 1. スコアバリデーション

**ルール**: `V3_APPEAL_VALIDATION_RULES.originalScore`

```typescript
{
  min: 0,
  max: 100,
  required: true,
  integer: true
}
```

**検証関数**: `V3GradeUtils.validateV3Score(score)`

```typescript
static validateV3Score(score: number): boolean {
  return score >= 0 && score <= 100 && Number.isInteger(score);
}
```

**エラーメッセージ**:
- "現在のスコアは0-100の整数で入力してください"
- "希望スコアは0-100の整数で入力してください"

---

### 2. 申し立て理由バリデーション

**ルール**: `V3_APPEAL_VALIDATION_RULES.appealReason`

```typescript
{
  minLength: 100,
  maxLength: 2000,
  required: true
}
```

**検証**:
```typescript
if (formData.appealReason.length < 100) {
  newErrors.appealReason = '申し立て理由は100文字以上入力してください';
}
if (formData.appealReason.length > 2000) {
  newErrors.appealReason = '申し立て理由は2000文字以内で入力してください';
}
```

---

### 3. スコア差バリデーション

**ルール**: `V3_APPEAL_VALIDATION_RULES.scoreDifference`

```typescript
{
  min: 1,  // 最低1点以上の差が必要
  max: 100
}
```

**検証**:
```typescript
if (formData.originalScore === formData.requestedScore) {
  newErrors.requestedScore = '希望スコアは現在のスコアと異なる値を入力してください';
}
```

---

### 4. ファイルアップロードバリデーション

**ルール**: `V3_APPEAL_VALIDATION_RULES.evidenceDocuments`

```typescript
{
  maxFiles: 5,
  maxSizePerFile: 15 * 1024 * 1024, // 15MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
}
```

**検証**:
```typescript
if (file.size > 15 * 1024 * 1024) {
  throw new Error('ファイルサイズは15MB以下にしてください');
}
```

---

### 5. 評価期間バリデーション

**検証**:
```typescript
if (!formData.evaluationPeriod) {
  newErrors.evaluationPeriod = '評価期間を選択してください';
}

// 申立期限チェック
const activePeriods = data.periods.filter((p: V3EvaluationPeriod) =>
  new Date(p.appealDeadline) > new Date()
);
```

---

## 実装チェックリスト

### VoiceDrive側実装

#### ✅ 完了項目

- [x] AppealV3Page: 2タブUI実装
- [x] AppealFormV3: フォーム実装
- [x] AppealStatusListV3: 一覧実装
- [x] V3GradeUtils: グレード計算ロジック
- [x] V3_APPEAL_VALIDATION_RULES: バリデーションルール
- [x] appealServiceV3: API統合サービス
- [x] 下書き機能（LocalStorage）
- [x] リトライ機能（最大3回、指数バックオフ）
- [x] 評価期間取得API統合
- [x] 異議申し立て送信API統合
- [x] 異議申し立て一覧API統合
- [x] ステータス詳細取得API統合
- [x] ディープリンク対応（URLパラメータ）

#### ❌ 未完了項目

- [ ] AppealFormV3: ファイルアップロードUI実装
- [ ] AppealStatusListV3: デモデータから実APIへ切り替え
- [ ] V3AppealRecord型定義追加
- [ ] V3AppealStatus型定義追加

### 医療システム側実装（推定）

#### ✅ 完了項目（想定）

- [x] GET /api/v3/evaluation/periods
- [x] POST /api/v3/appeals/submit
- [x] GET /api/v3/appeals
- [x] GET /api/v3/appeals/:appealId/status
- [x] POST /api/v3/appeals/upload
- [x] V3Appealテーブル
- [x] V3AppealAttachmentテーブル
- [x] V3EvaluationPeriodテーブル
- [x] 優先度自動判定ロジック
- [x] 担当審査者割り当てロジック

---

## まとめ

### データ管理責任

| データ種別 | 管理者 | VoiceDrive役割 |
|---------|-------|---------------|
| 評価データ | 医療システム | 表示のみ |
| 異議申し立てデータ | 医療システム | 送信・取得・表示 |
| 審査プロセス | 医療システム | 表示のみ |
| 証拠書類 | 医療システム | アップロード・表示 |
| 下書きデータ | VoiceDrive | LocalStorage管理 |
| UI状態 | VoiceDrive | メモリ内管理 |

### 次のアクションアイテム

#### 高優先度
1. ❌ AppealFormV3にファイルアップロードUI実装
2. ❌ AppealStatusListV3のデモデータを実APIへ切り替え
3. ❌ V3AppealRecord、V3AppealStatus型定義を追加

#### 中優先度
4. schema.prisma更新不要（確認済み）
5. エラーハンドリング強化

---

**最終更新**: 2025年10月26日
**担当**: VoiceDrive開発チーム
