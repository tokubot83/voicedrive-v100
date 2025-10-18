# CareerSelectionStation - DB要件分析

**作成日**: 2025年10月18日
**対象ページ**: CareerSelectionStationPage (`src/pages/career-selection-station/CareerSelectionStationPage.tsx`)
**目的**: データ管理責任分界点定義書に基づき、必要なDB構造とAPI連携を明確化

---

## 📋 エグゼクティブサマリー

### ページ概要
**キャリア選択ステーション**は、医療機関のキャリアコース選択制度（A/B/C/Dコース）を管理するページです。

- **URL**: `/career-selection-station`
- **権限**: 全職員アクセス可能
- **主要機能**: 現在のコース確認、コース変更申請、申請履歴確認

### キャリアコース制度とは
医療機関では、職員のワークライフバランスとキャリア志向に応じて4つのコースを選択できる制度：

| コース | 正式名称 | 特徴 |
|-------|---------|------|
| **Aコース** | 全面協力型 | 施設間異動あり、管理職登用対象、給与高め |
| **Bコース** | 施設内協力型 | 施設固定、部署異動可、夜勤あり |
| **Cコース** | 専門職型 | 専門性重視、異動制限あり |
| **Dコース** | 時短・制約あり型 | 育児・介護対応、夜勤なし、時短勤務可 |

### データ管理責任
- **🔵 医療システムが責任**: キャリアコースマスタ、選択状況、変更申請、審査プロセス
- **🟢 VoiceDriveが責任**: なし（表示のみ）
- **連携方式**: 医療システムAPI経由でリアルタイム取得 + Webhook通知

---

## 🎯 ページ機能分析

### 1. CareerSelectionStationPage（メインページ）

#### 表示データ
| データ項目 | データソース | 表示場所 |
|-----------|-------------|---------|
| 職員ID | User.employeeId（キャッシュ） | 職員情報カード |
| 氏名 | User.name（キャッシュ） | 職員情報カード |
| 施設名 | User.facility（キャッシュ） | 職員情報カード |
| 部署名 | User.department（キャッシュ） | 職員情報カード |
| 職種 | User.position（キャッシュ） | 職員情報カード |
| 入職日 | **🆕 医療API必要** | 職員情報カード |
| **現在のコース** | **🆕 医療API必要** | キャリアコースカード |
| **コース名** | **🆕 医療API必要** | キャリアコースカード |
| **適用開始日** | **🆕 医療API必要** | キャリアコースカード |
| **適用終了日** | **🆕 医療API必要** | キャリアコースカード |
| **次回変更可能日** | **🆕 医療API必要** | キャリアコースカード |
| **承認状況** | **🆕 医療API必要** | キャリアコースカード |

### 2. ChangeRequestPage（コース変更申請）

#### 入力データ
| 入力項目 | バリデーション | 送信先 |
|---------|--------------|-------|
| 現在のコース | 自動取得（変更不可） | 医療システムAPI |
| 希望コース | 必須、A/B/C/Dから選択 | 医療システムAPI |
| 変更理由 | 必須（年1回定期/特例3種） | 医療システムAPI |
| 理由詳細 | 必須、1000文字以内 | 医療システムAPI |
| 希望適用日 | 必須、今日以降 | 医療システムAPI |
| 添付ファイル | 特例変更時必須 | **🆕 Storage必要** |

#### 変更理由の種類
| 変更理由 | 値 | 添付必須 | 備考 |
|---------|---|---------|------|
| 年1回定期変更 | `annual` | なし | 毎年3月に申請可能 |
| 妊娠・出産 | `special_pregnancy` | あり | 診断書等 |
| 介護 | `special_caregiving` | あり | 介護認定書類等 |
| 疾病 | `special_illness` | あり | 診断書等 |

### 3. MyRequestsPage（申請履歴確認）

#### 表示データ
| データ項目 | データソース | 表示場所 |
|-----------|-------------|---------|
| 申請ID | **🆕 医療API必要** | 申請カード |
| 申請日 | **🆕 医療API必要** | 申請カード |
| 現在のコース | **🆕 医療API必要** | 申請カード |
| 希望コース | **🆕 医療API必要** | 申請カード |
| 変更理由 | **🆕 医療API必要** | 申請カード |
| 理由詳細 | **🆕 医療API必要** | 申請カード |
| 希望適用日 | **🆕 医療API必要** | 申請カード |
| **承認ステータス** | **🆕 医療API必要** | バッジ |
| **審査者名** | **🆕 医療API必要** | 審査コメント |
| **審査日** | **🆕 医療API必要** | 審査コメント |
| **審査コメント** | **🆕 医療API必要** | 審査コメント |
| **却下理由** | **🆕 医療API必要** | 却下通知 |
| 添付ファイル | **🆕 医療API必要** | 添付一覧 |

#### 承認ステータス
| ステータス | 値 | 意味 | 表示 |
|----------|---|------|------|
| 承認待ち | `pending` | 人事審査中 | 🟡 黄色バッジ |
| 承認済み | `approved` | 承認、適用予定 | 🟢 緑バッジ |
| 却下 | `rejected` | 却下、理由あり | 🔴 赤バッジ |
| 取下げ | `withdrawn` | 職員自身が取り下げ | ⚪ グレーバッジ |

---

## 🗄️ データベース要件

### 医療システム側のテーブル（新規作成必要）

#### Table 1: career_course_definitions（コース定義マスタ）

```sql
CREATE TABLE career_course_definitions (
  id VARCHAR(36) PRIMARY KEY,
  course_code ENUM('A', 'B', 'C', 'D') NOT NULL UNIQUE,
  course_name VARCHAR(100) NOT NULL COMMENT 'コース名（例: 全面協力型）',
  description TEXT COMMENT 'コースの詳細説明',

  -- 勤務条件
  department_transfer_available BOOLEAN DEFAULT TRUE COMMENT '部署異動可否',
  facility_transfer_level ENUM('none', 'limited', 'full') DEFAULT 'none' COMMENT '施設間異動レベル',
  relocation_required BOOLEAN DEFAULT FALSE COMMENT '転居必要性',
  night_shift_available ENUM('none', 'selectable', 'required') DEFAULT 'selectable' COMMENT '夜勤対応',

  -- キャリア
  management_track BOOLEAN DEFAULT FALSE COMMENT '管理職登用対象',

  -- 給与
  base_salary_multiplier DECIMAL(3,2) DEFAULT 1.00 COMMENT '基本給係数（例: 1.2倍）',
  salary_grade INT COMMENT '給与グレード',
  salary_notes TEXT COMMENT '給与に関する注意事項',

  -- メタ
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_course_code (course_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='キャリアコース定義マスタ（A/B/C/Dコース）';
```

#### Table 2: career_course_selections（職員のコース選択状況）

```sql
CREATE TABLE career_course_selections (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL COMMENT '職員ID',
  course_code ENUM('A', 'B', 'C', 'D') NOT NULL,

  -- 適用期間
  effective_from DATE NOT NULL COMMENT '適用開始日',
  effective_to DATE COMMENT '適用終了日（nullの場合は無期限）',
  next_change_available_date DATE COMMENT '次回変更可能日（通常は翌年3月1日）',

  -- 特例変更情報
  special_change_reason ENUM('pregnancy', 'caregiving', 'illness') COMMENT '特例変更理由',
  special_change_note TEXT COMMENT '特例変更の詳細メモ',

  -- 承認情報
  change_requested_at TIMESTAMP COMMENT '変更申請日時',
  change_requested_by VARCHAR(50) COMMENT '変更申請者ID（通常は本人）',
  approved_at TIMESTAMP COMMENT '承認日時',
  approved_by VARCHAR(50) COMMENT '承認者ID（人事部長等）',
  approval_status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'approved',
  rejection_reason TEXT COMMENT '却下理由',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_employee_id (employee_id),
  INDEX idx_course_code (course_code),
  INDEX idx_effective_from (effective_from),
  INDEX idx_effective_to (effective_to),
  INDEX idx_approval_status (approval_status),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='職員のキャリアコース選択状況';
```

#### Table 3: career_course_change_requests（コース変更申請）

```sql
CREATE TABLE career_course_change_requests (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL COMMENT '申請職員ID',

  -- 変更内容
  current_course_code ENUM('A', 'B', 'C', 'D') NOT NULL,
  requested_course_code ENUM('A', 'B', 'C', 'D') NOT NULL,

  -- 変更理由
  change_reason ENUM('annual', 'special_pregnancy', 'special_caregiving', 'special_illness') NOT NULL,
  reason_detail TEXT NOT NULL COMMENT '理由詳細（最大1000文字）',
  requested_effective_date DATE NOT NULL COMMENT '希望適用日',

  -- 人事審査
  hr_reviewer_id VARCHAR(50) COMMENT '人事審査者ID',
  reviewed_at TIMESTAMP COMMENT '審査日時',
  review_comment TEXT COMMENT '審査コメント',
  approval_status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  rejection_reason TEXT COMMENT '却下理由',

  -- 取下げ
  withdrawn_at TIMESTAMP COMMENT '取下げ日時',

  -- 添付ファイル（特例変更時必須）
  attachments JSON COMMENT '添付ファイルURL配列（例: ["s3://bucket/file1.pdf"]）',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_employee_id (employee_id),
  INDEX idx_approval_status (approval_status),
  INDEX idx_change_reason (change_reason),
  INDEX idx_requested_effective_date (requested_effective_date),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='キャリアコース変更申請';
```

### VoiceDrive側のテーブル（追加不要）

**結論**: VoiceDriveはキャリアコース情報を**一切DBに保存しない**
- 全てのデータは医療システムAPIからリアルタイム取得
- キャッシュも不要（Personal Stationと異なり、頻繁にアクセスされないため）

---

## 🔗 必要なAPI仕様

### API 1: 職員のキャリアコース情報取得

**エンドポイント**: `GET /api/v2/employees/{employeeId}/career-course`

**目的**: CareerSelectionStationPageで現在のコース情報を表示

**リクエスト**:
```http
GET /api/v2/employees/OH-NS-2024-001/career-course
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "employeeName": "山田 花子",
  "facility": "小原病院",
  "department": "内科",
  "position": "看護師",
  "hireDate": "2024-04-01",
  "currentCourse": {
    "selectionId": "cc-sel-001",
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "effectiveFrom": "2025-04-01",
    "effectiveTo": null,
    "nextChangeAvailableDate": "2026-03-01",
    "approvalStatus": "approved",
    "approvedAt": "2025-03-20T10:00:00Z",
    "approvedBy": "HR-001",
    "approverName": "人事部長"
  }
}
```

**アクセス制御**: 本人 or 上司 or 人事部長（Level 10+）のみ

---

### API 2: コース変更申請送信

**エンドポイント**: `POST /api/v2/career-course/change-request`

**目的**: ChangeRequestPageから申請を送信

**リクエスト**:
```http
POST /api/v2/career-course/change-request
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

```json
{
  "employeeId": "OH-NS-2024-001",
  "currentCourseCode": "B",
  "requestedCourseCode": "A",
  "changeReason": "annual",
  "reasonDetail": "管理職候補として、施設間異動を含む全面協力型コースへの変更を希望します。",
  "requestedEffectiveDate": "2026-04-01",
  "attachments": []
}
```

**レスポンス**:
```json
{
  "requestId": "req-003",
  "employeeId": "OH-NS-2024-001",
  "approvalStatus": "pending",
  "createdAt": "2025-10-18T15:30:00Z",
  "message": "コース変更申請を受け付けました。人事部の審査をお待ちください。"
}
```

**バリデーション**:
- 変更理由が特例（`special_*`）の場合、`attachments`必須
- `requestedEffectiveDate`は今日以降
- 現在承認待ちの申請がある場合はエラー

---

### API 3: 申請履歴取得

**エンドポイント**: `GET /api/v2/career-course/my-requests`

**目的**: MyRequestsPageで申請履歴を表示

**リクエスト**:
```http
GET /api/v2/career-course/my-requests
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "requests": [
    {
      "id": "req-003",
      "employeeId": "OH-NS-2024-001",
      "currentCourseCode": "B",
      "requestedCourseCode": "A",
      "changeReason": "annual",
      "reasonDetail": "管理職候補として...",
      "requestedEffectiveDate": "2026-04-01",
      "approvalStatus": "pending",
      "hrReviewerId": null,
      "hrReviewerName": null,
      "reviewedAt": null,
      "reviewComment": null,
      "rejectionReason": null,
      "withdrawnAt": null,
      "attachments": [],
      "createdAt": "2025-10-18T15:30:00Z",
      "updatedAt": "2025-10-18T15:30:00Z"
    },
    {
      "id": "req-002",
      "employeeId": "OH-NS-2024-001",
      "currentCourseCode": "C",
      "requestedCourseCode": "B",
      "changeReason": "annual",
      "reasonDetail": "部署異動に対応可能となったため...",
      "requestedEffectiveDate": "2025-04-01",
      "approvalStatus": "approved",
      "hrReviewerId": "HR-001",
      "hrReviewerName": "人事部長",
      "reviewedAt": "2025-03-20T15:00:00Z",
      "reviewComment": "職務能力を評価し、承認します。",
      "rejectionReason": null,
      "withdrawnAt": null,
      "attachments": [],
      "createdAt": "2025-03-01T09:00:00Z",
      "updatedAt": "2025-03-20T15:00:00Z"
    }
  ],
  "stats": {
    "total": 3,
    "pending": 1,
    "approved": 1,
    "rejected": 1,
    "withdrawn": 0
  }
}
```

**ソート**: 申請日時降順（最新が先頭）

---

### API 4: コース定義マスタ取得

**エンドポイント**: `GET /api/v2/career-course/definitions`

**目的**: ChangeRequestPageでコース選択肢を表示

**リクエスト**:
```http
GET /api/v2/career-course/definitions
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "courses": [
    {
      "courseCode": "A",
      "courseName": "Aコース（全面協力型）",
      "description": "施設間異動を含む全面的な協力型。管理職登用対象。",
      "departmentTransferAvailable": true,
      "facilityTransferLevel": "full",
      "relocationRequired": true,
      "nightShiftAvailable": "required",
      "managementTrack": true,
      "baseSalaryMultiplier": 1.20,
      "isActive": true,
      "displayOrder": 1
    },
    {
      "courseCode": "B",
      "courseName": "Bコース（施設内協力型）",
      "description": "施設内での部署異動あり。夜勤対応可能。",
      "departmentTransferAvailable": true,
      "facilityTransferLevel": "none",
      "relocationRequired": false,
      "nightShiftAvailable": "selectable",
      "managementTrack": false,
      "baseSalaryMultiplier": 1.10,
      "isActive": true,
      "displayOrder": 2
    },
    {
      "courseCode": "C",
      "courseName": "Cコース（専門職型）",
      "description": "専門性重視。異動制限あり。",
      "departmentTransferAvailable": false,
      "facilityTransferLevel": "none",
      "relocationRequired": false,
      "nightShiftAvailable": "selectable",
      "managementTrack": false,
      "baseSalaryMultiplier": 1.00,
      "isActive": true,
      "displayOrder": 3
    },
    {
      "courseCode": "D",
      "courseName": "Dコース（時短・制約あり型）",
      "description": "育児・介護対応。夜勤なし、時短勤務可。",
      "departmentTransferAvailable": false,
      "facilityTransferLevel": "none",
      "relocationRequired": false,
      "nightShiftAvailable": "none",
      "managementTrack": false,
      "baseSalaryMultiplier": 0.90,
      "isActive": true,
      "displayOrder": 4
    }
  ]
}
```

---

## 🔔 Webhook通知

### Webhook 1: コース変更承認通知

**トリガー**: 人事部がコース変更申請を承認した時

**送信先**: `POST https://voicedrive.ai/api/webhooks/career-course-approved`

**ペイロード**:
```json
{
  "eventType": "career_course.change_approved",
  "timestamp": "2025-10-18T16:00:00Z",
  "data": {
    "requestId": "req-003",
    "employeeId": "OH-NS-2024-001",
    "employeeName": "山田 花子",
    "previousCourseCode": "B",
    "newCourseCode": "A",
    "effectiveDate": "2026-04-01",
    "approvedBy": "HR-001",
    "approverName": "人事部長",
    "approvedAt": "2025-10-18T16:00:00Z",
    "reviewComment": "管理職候補として適切と判断します。"
  },
  "signature": "sha256:abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// 職員に通知を送信
await NotificationService.send({
  userId: data.employeeId,
  title: 'キャリアコース変更承認のお知らせ',
  message: `${data.newCourseCode}コースへの変更申請が承認されました。適用日: ${data.effectiveDate}`,
  type: 'career_course',
  link: '/career-selection-station'
});
```

---

### Webhook 2: コース変更却下通知

**トリガー**: 人事部がコース変更申請を却下した時

**送信先**: `POST https://voicedrive.ai/api/webhooks/career-course-rejected`

**ペイロード**:
```json
{
  "eventType": "career_course.change_rejected",
  "timestamp": "2025-10-18T16:00:00Z",
  "data": {
    "requestId": "req-001",
    "employeeId": "OH-NS-2024-001",
    "employeeName": "山田 花子",
    "requestedCourseCode": "D",
    "rejectedBy": "HR-001",
    "rejectorName": "人事部長",
    "rejectedAt": "2025-10-18T16:00:00Z",
    "rejectionReason": "現在の勤務シフト調整で対応可能と判断しました。",
    "reviewComment": "介護事由を確認しましたが、シフト調整で対応できます。"
  },
  "signature": "sha256:abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// 職員に通知を送信
await NotificationService.send({
  userId: data.employeeId,
  title: 'キャリアコース変更申請の結果',
  message: `${data.requestedCourseCode}コースへの変更申請が却下されました。詳細は申請履歴をご確認ください。`,
  type: 'career_course',
  severity: 'warning',
  link: '/career-selection-station/my-requests'
});
```

---

## 📦 ストレージ要件

### 添付ファイル保存（特例変更時の証明書類）

**保存先**: AWS S3 (医療システム管轄)

**バケット構成**:
```
medical-system-attachments/
  └── career-course-requests/
      └── {requestId}/
          ├── pregnancy-certificate.pdf    (妊娠診断書)
          ├── caregiving-certificate.pdf  (介護認定証)
          └── illness-certificate.pdf     (診断書)
```

**アップロードフロー**:
```typescript
// VoiceDrive → 医療システム
// Step 1: プリサインドURL取得
POST /api/v2/career-course/upload-url
Response: {
  uploadUrl: "https://s3.amazonaws.com/...",
  fileKey: "career-course-requests/req-003/file1.pdf"
}

// Step 2: S3に直接アップロード
PUT {uploadUrl}
Body: <binary file data>

// Step 3: 申請送信時にfileKeyを含める
POST /api/v2/career-course/change-request
Body: {
  ...
  attachments: ["career-course-requests/req-003/file1.pdf"]
}
```

**アクセス制御**:
- 本人のみ閲覧可能
- 人事部（Level 10+）は全員分閲覧可能
- 添付ファイルURLは署名付き一時URL（有効期限1時間）

---

## 🔐 セキュリティ・プライバシー

### 個人情報保護

| データ項目 | 機密レベル | アクセス権限 |
|-----------|----------|------------|
| コース選択状況 | 🟡 中 | 本人 + 上司 + 人事部 |
| 変更申請内容 | 🟡 中 | 本人 + 人事部 |
| 特例変更理由 | 🔴 高 | 本人 + 人事部のみ |
| 添付ファイル（診断書等） | 🔴 高 | 本人 + 人事部のみ |
| 審査コメント | 🟡 中 | 本人 + 人事部 |
| 却下理由 | 🟡 中 | 本人 + 人事部 |

### データ保持期間

| データ | 保持期間 | 削除タイミング |
|-------|---------|-------------|
| 承認待ち申請 | 無期限 | 承認/却下/取下げまで |
| 承認済み申請 | 退職後10年 | 法定保存期間 |
| 却下申請 | 退職後3年 | 記録保持 |
| 添付ファイル | 退職後1年 | 個人情報削除 |

---

## 📊 データフロー図

```
┌────────────────────────────────────────────────────┐
│            医療職員管理システム                      │
│                                                    │
│  ┌─────────────────────────────────────┐         │
│  │ career_course_definitions          │         │
│  │ (A/B/C/Dコース定義マスタ)           │         │
│  └─────────────────────────────────────┘         │
│                    │                               │
│                    │ 参照                          │
│                    ▼                               │
│  ┌─────────────────────────────────────┐         │
│  │ career_course_selections           │         │
│  │ (職員のコース選択状況)              │         │
│  │ - 現在のコース: B                  │         │
│  │ - 適用開始: 2025-04-01             │         │
│  │ - 次回変更可能日: 2026-03-01        │         │
│  └─────────────────────────────────────┘         │
│                    │                               │
│                    │ 変更申請                      │
│                    ▼                               │
│  ┌─────────────────────────────────────┐         │
│  │ career_course_change_requests      │         │
│  │ (コース変更申請)                    │         │
│  │ - 現在: B → 希望: A                │         │
│  │ - 理由: annual                     │         │
│  │ - ステータス: pending              │         │
│  └─────────────────────────────────────┘         │
│         │                    │                     │
│         │ ①API提供          │ ②Webhook通知      │
│         ▼                    ▼                     │
└────────────────────────────────────────────────────┘
         │                    │
         │ HTTPS + JWT        │ HTTPS + HMAC署名
         │                    │
         ▼                    ▼
┌────────────────────────────────────────────────────┐
│                VoiceDrive                          │
│                                                    │
│  ┌─────────────────────────────────────┐         │
│  │ CareerSelectionStationPage         │         │
│  │ - 現在のコース表示                  │         │
│  │ - 次回変更可能日表示                │         │
│  └─────────────────────────────────────┘         │
│                    │                               │
│                    │ コース変更申請                │
│                    ▼                               │
│  ┌─────────────────────────────────────┐         │
│  │ ChangeRequestPage                  │         │
│  │ - 希望コース選択                    │         │
│  │ - 理由入力                         │         │
│  │ - 添付ファイル                     │         │
│  └─────────────────────────────────────┘         │
│                    │                               │
│        POST /api/v2/career-course/change-request  │
│                    │                               │
│                    ▼                               │
│  ┌─────────────────────────────────────┐         │
│  │ MyRequestsPage                     │         │
│  │ - 申請履歴表示                      │         │
│  │ - 審査結果確認                      │         │
│  │ - Webhook通知受信                  │         │
│  └─────────────────────────────────────┘         │
│                                                    │
│  ⚠️ VoiceDrive側DBには保存しない                  │
│  全てAPIでリアルタイム取得                        │
└────────────────────────────────────────────────────┘
```

---

## ✅ 実装チェックリスト

### 医療システム側（新規実装必要）

#### テーブル作成
- [ ] `career_course_definitions` テーブル作成
- [ ] `career_course_selections` テーブル作成
- [ ] `career_course_change_requests` テーブル作成
- [ ] 初期データ投入（A/B/C/Dコース定義）

#### API実装
- [ ] API-1: 職員のキャリアコース情報取得
- [ ] API-2: コース変更申請送信
- [ ] API-3: 申請履歴取得
- [ ] API-4: コース定義マスタ取得
- [ ] 添付ファイルアップロード用プリサインドURL発行API

#### Webhook実装
- [ ] Webhook-1: コース変更承認通知
- [ ] Webhook-2: コース変更却下通知

#### 管理画面（医療システム側）
- [ ] 人事部用コース変更申請審査画面
- [ ] 承認/却下処理機能
- [ ] 添付ファイル閲覧機能
- [ ] 申請一覧・検索機能

### VoiceDrive側

#### API連携
- [ ] `careerCourseService.ts` 実装確認（既存）
- [ ] Webhook受信エンドポイント実装
- [ ] HMAC署名検証実装

#### UI実装
- [ ] CareerSelectionStationPage 実装確認（既存）
- [ ] ChangeRequestPage 実装確認（既存）
- [ ] MyRequestsPage 実装確認（既存）
- [ ] WebhookTestPanel 実装確認（既存）

#### 通知機能
- [ ] 承認通知送信機能
- [ ] 却下通知送信機能
- [ ] リアルタイム通知表示

---

## 📝 補足資料

### 参照ドキュメント

1. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

2. **型定義ファイル**
   `src/types/career-course.ts`

3. **サービス層**
   `src/services/careerCourseService.ts`

4. **通知サービス**
   `src/services/CareerCourseNotificationService.ts`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Express.js (API Server)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js
- NestJS (API Server)

**ストレージ**:
- AWS S3（添付ファイル保存）

---

**作成者**: AI (Claude Code)
**承認待ち**: 医療システムチームからの実装確認
**次のステップ**: 暫定マスターリスト作成 → 医療チームへ送付

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-18 | 初版作成 | AI (Claude Code) |
