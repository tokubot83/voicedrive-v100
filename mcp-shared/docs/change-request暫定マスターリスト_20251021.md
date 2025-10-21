# career-selection-station/change-request 暫定マスターリスト

**作成日**: 2025年10月21日
**対象ページ**: ChangeRequestPage (`src/pages/career-selection-station/ChangeRequestPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- コース変更申請ページは医療システムのキャリア選択制度と100%連携
- **VoiceDriveはUIのみ提供**し、データは全て医療システムで管理
- 現在はダミー実装（currentCourse、API未接続）

### 必要な対応
1. **医療システムからのAPI提供**: 4件
2. **医療システムでのテーブル追加**: 3件
3. **医療システムでのファイルストレージ**: S3/CloudFront
4. **VoiceDrive DB追加**: **0件（不要）**
5. **確認事項**: 3件

### 優先度
**Priority: HIGH（グループ2: キャリア選択制度統合）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（4件）

#### API-1: コース定義一覧取得API

**エンドポイント**:
```
GET /api/career-courses/definitions
```

**必要な理由**:
- ChangeRequestPage.tsx 181行目で A/B/C/D コースの選択肢を表示
- コース名・説明・特徴を動的に取得
- 制度変更に柔軟に対応

**レスポンス例**:
```json
[
  {
    "id": "cc-def-001",
    "courseCode": "A",
    "courseName": "Aコース（全面協力型）",
    "description": "施設間異動・転居あり、管理職登用対象",
    "departmentTransferAvailable": true,
    "facilityTransferAvailable": "full",
    "relocationRequired": true,
    "nightShiftAvailable": "required",
    "managementTrack": true,
    "baseSalaryMultiplier": 1.2,
    "salaryGrade": 5,
    "salaryNotes": "基本給1.2倍、役職手当別途",
    "isActive": true,
    "displayOrder": 1
  },
  {
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "description": "施設内異動可、転居なし",
    "facilityTransferAvailable": "limited",
    "baseSalaryMultiplier": 1.1,
    ...
  },
  {
    "courseCode": "C",
    "courseName": "Cコース（専門職型）",
    "description": "部署固定、専門性重視",
    "facilityTransferAvailable": "none",
    "baseSalaryMultiplier": 1.05,
    ...
  },
  {
    "courseCode": "D",
    "courseName": "Dコース（時短・制約あり型）",
    "description": "時短勤務、夜勤なし",
    "nightShiftAvailable": "none",
    "baseSalaryMultiplier": 1.0,
    ...
  }
]
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- 公開情報のため全職員アクセス可

---

#### API-2: マイページ情報取得API（現在のコース含む）

**エンドポイント**:
```
GET /api/my-page
```

**必要な理由**:
- ChangeRequestPage.tsx 36行目で現在のコースを表示
- 職員基本情報と現在のコース選択状況を一括取得
- 申請フォームの初期値設定

**レスポンス例**:
```json
{
  "id": "user-2024-001",
  "name": "山田 花子",
  "position": "看護師",
  "department": "内科",
  "facility": "小原病院",
  "employeeId": "OH-NS-2024-001",
  "joinDate": "2024-04-01",
  "careerCourse": {
    "id": "ccs-2024-001",
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "effectiveFrom": "2024-04-01",
    "effectiveTo": null,
    "nextChangeAvailableDate": "2025-04-01",
    "specialChangeReason": null,
    "approvalStatus": "approved"
  }
}
```

**セキュリティ**:
- JWT Bearer Token認証
- 自分の情報のみ取得可能（staffId をトークンから取得）
- Rate Limit: 100 req/min/IP

---

#### API-3: コース変更申請送信API

**エンドポイント**:
```
POST /api/career-course/change-request
```

**必要な理由**:
- ChangeRequestPage.tsx 119行目で申請送信
- フォーム入力内容を医療システムに保存
- 人事部への審査依頼を作成

**リクエスト例**:
```json
{
  "currentCourseCode": "B",
  "requestedCourseCode": "D",
  "changeReason": "special_pregnancy",
  "reasonDetail": "妊娠により夜勤対応が困難なため、Dコースへの変更を希望します。出産予定日は2025年12月15日です。",
  "requestedEffectiveDate": "2025-11-01",
  "attachments": [
    "https://cdn.medical-system.local/attachments/EMP2024001_pregnancy_cert_20251013.pdf"
  ]
}
```

**レスポンス例**:
```json
{
  "id": "ccr-2025-001",
  "staffId": "OH-NS-2024-001",
  "approvalStatus": "pending",
  "createdAt": "2025-10-13T10:30:00Z",
  "message": "コース変更申請を受け付けました。人事部の審査をお待ちください。"
}
```

**処理内容**:
1. `career_course_change_requests` テーブルに新規レコード作成
2. `approvalStatus = "pending"` で初期化
3. 人事部へメール通知送信
4. 申請者へ受付確認メール送信

**バリデーション**:
- 現在のコースと希望コースが異なるか
- 年1回制限（nextChangeAvailableDate）のチェック
- 特例変更の場合、添付ファイル必須チェック
- 理由詳細が1000文字以内

**セキュリティ**:
- JWT Bearer Token認証
- staffId はトークンから取得（改ざん防止）
- Rate Limit: 10 req/min/user（申請乱発防止）

---

#### API-4: 添付ファイルアップロードAPI

**エンドポイント**:
```
POST /api/career-course/upload-attachment
```

**必要な理由**:
- ChangeRequestPage.tsx 115行目のTODO実装
- 特例変更（妊娠・介護・疾病）の証明書類をアップロード
- S3に安全に保存し、署名付きURLを返す

**リクエスト**:
```http
POST /api/career-course/upload-attachment
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="pregnancy_cert.pdf"
Content-Type: application/pdf

<binary data>
------WebKitFormBoundary--
```

**レスポンス例**:
```json
{
  "fileUrl": "https://cdn.medical-system.local/attachments/EMP2024001_pregnancy_cert_20251013.pdf",
  "fileName": "pregnancy_cert.pdf",
  "fileSize": 2048576,
  "uploadedAt": "2025-10-13T10:30:00Z",
  "signedUrl": "https://cdn.medical-system.local/attachments/EMP2024001_pregnancy_cert_20251013.pdf?Expires=1731500000&Signature=...",
  "expiresAt": "2025-11-13T10:30:00Z"
}
```

**処理内容**:
1. ファイル検証（拡張子、サイズ、MIMEタイプ）
2. ファイル名をサニタイズ（employeeId + timestamp + originalName）
3. S3バケットにアップロード（`medical-system-career-attachments`）
4. CloudFront署名付きURL生成（有効期限30日）
5. メタデータをレスポンス

**バリデーション**:
- ファイルサイズ: 最大10MB
- 許可拡張子: .pdf, .jpg, .jpeg, .png
- MIMEタイプチェック
- ウイルススキャン（オプション）

**セキュリティ**:
- JWT Bearer Token認証
- ファイル名にemployeeIdを含める（アクセス制御）
- S3バケットはプライベート
- CloudFront署名付きURL（30日有効）
- Rate Limit: 5 uploads/min/user

**S3バケット設定**:
```yaml
Bucket: medical-system-career-attachments
Region: ap-northeast-1
Encryption: AES-256
Versioning: Enabled
Lifecycle:
  - DeleteAfter: 3 years (保存期間3年後に自動削除)
CORS:
  - AllowedOrigins: ["https://voicedrive-v100.vercel.app"]
  - AllowedMethods: ["POST"]
  - AllowedHeaders: ["*"]
```

---

### B. Webhook通知依頼（オプション）

#### Webhook-1: コース変更承認通知（オプション）

**トリガー**:
- 人事部がコース変更申請を承認した時

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/career-course-changed
```

**ペイロード例**:
```json
{
  "eventType": "career_course.changed",
  "timestamp": "2025-10-15T14:30:00Z",
  "staffId": "OH-NS-2024-001",
  "oldCourseCode": "B",
  "newCourseCode": "D",
  "effectiveDate": "2025-11-01",
  "changeReason": "special_pregnancy",
  "approvedBy": "HR-ADMIN-001",
  "signature": "abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
// VoiceDrive側ではデータ保持不要
// 通知のみ受信してUI更新（オプション）
await prisma.notification.create({
  data: {
    userId: staffId,
    title: "コース変更承認",
    content: `Dコースへの変更が承認されました（適用日: 2025-11-01）`,
    category: "career_course",
    priority: "high"
  }
});
```

**評価**: 🟡 **オプション**
- VoiceDriveではコースデータを保持しないため、Webhookは必須ではない
- 通知機能として実装する場合のみ有用

---

## 🗄️ 医療システムDB構築計画書への追加内容

### C. 新規テーブル追加（3件）

#### Table-1: career_course_definitions（コース定義マスタ）

**優先度**: 🔴 **CRITICAL**

**理由**:
- A/B/C/Dコースの定義を管理
- 制度変更に柔軟に対応
- 給与係数・条件を一元管理

**スキーマ定義**:
```sql
CREATE TABLE career_course_definitions (
  id                             VARCHAR(36) PRIMARY KEY,
  course_code                    CHAR(1) NOT NULL UNIQUE,  -- 'A', 'B', 'C', 'D'
  course_name                    VARCHAR(100) NOT NULL,
  description                    TEXT,
  department_transfer_available  BOOLEAN DEFAULT TRUE,
  facility_transfer_available    ENUM('none', 'limited', 'full') DEFAULT 'none',
  relocation_required            BOOLEAN DEFAULT FALSE,
  night_shift_available          ENUM('none', 'selectable', 'required') DEFAULT 'none',
  management_track               BOOLEAN DEFAULT FALSE,    -- 管理職登用対象
  base_salary_multiplier         DECIMAL(3,2) DEFAULT 1.00,  -- 基本給係数
  salary_grade                   INT,
  salary_notes                   TEXT,
  is_active                      BOOLEAN DEFAULT TRUE,
  display_order                  INT DEFAULT 0,
  created_at                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_course_code (course_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**初期データ**:
```sql
INSERT INTO career_course_definitions (id, course_code, course_name, description, department_transfer_available, facility_transfer_available, relocation_required, night_shift_available, management_track, base_salary_multiplier, display_order) VALUES
('cc-def-A', 'A', 'Aコース（全面協力型）', '施設間異動・転居あり、管理職登用対象', TRUE, 'full', TRUE, 'required', TRUE, 1.20, 1),
('cc-def-B', 'B', 'Bコース（施設内協力型）', '施設内異動可、転居なし', TRUE, 'limited', FALSE, 'selectable', TRUE, 1.10, 2),
('cc-def-C', 'C', 'Cコース（専門職型）', '部署固定、専門性重視', FALSE, 'none', FALSE, 'selectable', FALSE, 1.05, 3),
('cc-def-D', 'D', 'Dコース（時短・制約あり型）', '時短勤務、夜勤なし', FALSE, 'none', FALSE, 'none', FALSE, 1.00, 4);
```

**マイグレーション**:
```bash
# 医療システム側で実行
npx prisma migrate dev --name add_career_course_definitions
```

---

#### Table-2: career_course_selections（現在のコース選択状況）

**優先度**: 🔴 **CRITICAL**

**理由**:
- 職員ごとの現在のコースを管理
- 履歴管理（過去のコースも保持）
- 次回変更可能日の管理（年1回制限）

**スキーマ定義**:
```sql
CREATE TABLE career_course_selections (
  id                          VARCHAR(36) PRIMARY KEY,
  staff_id                    VARCHAR(36) NOT NULL,
  course_code                 CHAR(1) NOT NULL,
  effective_from              DATE NOT NULL,
  effective_to                DATE,                      -- NULL = 現在有効
  next_change_available_date  DATE,                      -- 次回変更可能日
  special_change_reason       ENUM('pregnancy', 'caregiving', 'illness') NULL,
  special_change_note         TEXT,
  change_requested_at         TIMESTAMP,
  change_requested_by         VARCHAR(36),
  approved_at                 TIMESTAMP,
  approved_by                 VARCHAR(36),
  approval_status             ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'approved',
  rejection_reason            TEXT,
  created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (course_code) REFERENCES career_course_definitions(course_code),
  FOREIGN KEY (approved_by) REFERENCES employees(employee_id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_course_code (course_code),
  INDEX idx_effective_dates (effective_from, effective_to),
  INDEX idx_approval_status (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**使用例**:
```typescript
// 現在のコースを取得
const currentCourse = await prisma.careerCourseSelection.findFirst({
  where: {
    staffId: 'OH-NS-2024-001',
    effectiveTo: null  // 現在有効なコース
  }
});

// 履歴を取得
const courseHistory = await prisma.careerCourseSelection.findMany({
  where: { staffId: 'OH-NS-2024-001' },
  orderBy: { effectiveFrom: 'desc' }
});
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_career_course_selections
```

---

#### Table-3: career_course_change_requests（コース変更申請）

**優先度**: 🔴 **CRITICAL**

**理由**:
- コース変更申請の受付・審査・承認を管理
- 申請履歴の保持
- 添付ファイルの管理

**スキーマ定義**:
```sql
CREATE TABLE career_course_change_requests (
  id                         VARCHAR(36) PRIMARY KEY,
  staff_id                   VARCHAR(36) NOT NULL,
  current_course_code        CHAR(1) NOT NULL,
  requested_course_code      CHAR(1) NOT NULL,
  change_reason              ENUM('annual', 'special_pregnancy', 'special_caregiving', 'special_illness') NOT NULL,
  reason_detail              TEXT NOT NULL,
  requested_effective_date   DATE NOT NULL,
  hr_reviewer_id             VARCHAR(36),
  hr_reviewer_name           VARCHAR(100),
  reviewed_at                TIMESTAMP,
  review_comment             TEXT,
  approval_status            ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  rejection_reason           TEXT,
  withdrawn_at               TIMESTAMP,
  attachments                JSON,  -- [{"fileUrl": "...", "fileName": "...", "fileSize": 123, "uploadedAt": "..."}]
  created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (current_course_code) REFERENCES career_course_definitions(course_code),
  FOREIGN KEY (requested_course_code) REFERENCES career_course_definitions(course_code),
  FOREIGN KEY (hr_reviewer_id) REFERENCES employees(employee_id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_approval_status (approval_status),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**attachments フィールドの構造**:
```json
[
  {
    "fileUrl": "https://cdn.medical-system.local/attachments/EMP2024001_pregnancy_cert_20251013.pdf",
    "fileName": "pregnancy_cert.pdf",
    "fileSize": 2048576,
    "uploadedAt": "2025-10-13T10:30:00Z",
    "signedUrl": "https://...",
    "expiresAt": "2025-11-13T10:30:00Z"
  }
]
```

**使用例**:
```typescript
// 申請作成
const request = await prisma.careerCourseChangeRequest.create({
  data: {
    staffId: 'OH-NS-2024-001',
    currentCourseCode: 'B',
    requestedCourseCode: 'D',
    changeReason: 'special_pregnancy',
    reasonDetail: '妊娠により...',
    requestedEffectiveDate: new Date('2025-11-01'),
    attachments: JSON.stringify([{
      fileUrl: 'https://...',
      fileName: 'pregnancy_cert.pdf',
      uploadedAt: new Date()
    }]),
    approvalStatus: 'pending'
  }
});

// 人事部が承認
await prisma.careerCourseChangeRequest.update({
  where: { id: requestId },
  data: {
    approvalStatus: 'approved',
    reviewedAt: new Date(),
    hrReviewerId: 'HR-ADMIN-001',
    reviewComment: '承認します'
  }
});
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_career_course_change_requests
```

---

### D. 既存テーブル修正（0件）

**✅ 既存テーブルへの追加は不要**

理由:
- キャリア選択制度は独立した新規機能
- 既存のEmployeeテーブルへの影響なし
- コース情報は新規テーブルで完結

---

## 🚫 VoiceDrive DB構築計画書への追加内容

### E. VoiceDrive側の新規テーブル追加（0件）

**✅ VoiceDrive側でのDB追加は不要**

**理由**:
- career-selection-stationは**申請フォームのUI**のみ提供
- データは100%医療システムで管理
- VoiceDriveはAPIクライアントとして動作
- キャッシュも不要（リアルタイム性が重要）

**データフロー**:
```
VoiceDrive UI (表示のみ)
  ↓ API呼び出し
  医療システム (データ管理)
  ↓ レスポンス
  VoiceDrive UI (表示)
```

---

## ❓ 医療システムチームへの確認事項

### 確認-1: キャリア選択制度の詳細仕様

**質問**:
> キャリア選択制度（A/B/C/Dコース）について、以下を確認させてください：
>
> 1. コース変更は**年1回のみ**で確定ですか？
> 2. 特例変更（妊娠・介護・疾病）の場合、年1回制限は適用外ですか？
> 3. 承認権限は**人事部のみ**ですか？それとも施設ごとに承認者がいますか？
> 4. 承認フローは**1段階（人事部のみ）**ですか？複数段階ですか？

**期待回答**:
- ✅ 年1回のみ（特例除く）
- ✅ 特例は年1回制限なし（ただし証明書必須）
- ✅ 承認者: 人事部（1段階）
- ✅ 審査期間: 通常2週間以内

---

### 確認-2: 添付ファイルの保存期間とアクセス制御

**質問**:
> 添付ファイル（証明書類）について：
>
> 1. 保存期間は何年ですか？（推奨: 3年）
> 2. 誰がアクセスできますか？
>    - 申請者本人: ○
>    - 人事部: ○
>    - 直属上司: △
>    - 他職員: ×
> 3. ファイルサイズ制限は？（推奨: 10MB）
> 4. 許可する拡張子は？（推奨: .pdf, .jpg, .png）

**期待回答**:
- 保存期間: 3年（法定保存期間）
- アクセス権: 本人 + 人事部のみ
- サイズ制限: 10MB
- 拡張子: .pdf, .jpg, .jpeg, .png

---

### 確認-3: 通知・メール送信の仕様

**質問**:
> 通知・メール送信について：
>
> 1. 申請受付時に申請者へメール送信しますか？
> 2. 新規申請時に人事部へメール送信しますか？
> 3. 承認・却下時に申請者へメール送信しますか？
> 4. VoiceDriveへのWebhook通知は必要ですか？（オプション）

**期待回答**:
- ✅ 申請受付メール: 申請者へ
- ✅ 新規申請通知: 人事部へ
- ✅ 結果通知: 申請者へ
- 🟡 Webhook: オプション（VoiceDrive側では不要）

---

## 📅 想定スケジュール

### Phase 1: 医療システム基盤構築（1週間）
- **Day 1-2**: テーブル設計・作成（3テーブル）
- **Day 3-4**: API実装（4エンドポイント）
- **Day 5**: S3/CloudFront設定
- **Day 6-7**: 単体テスト・API仕様書作成

### Phase 2: VoiceDrive統合（2日）
- **Day 1**: ファイルアップロード処理実装（TODO部分）
- **Day 2**: 統合テスト

### Phase 3: 人事部管理画面（1週間）
- **Day 1-3**: 申請一覧・審査画面実装
- **Day 4-5**: 承認・却下機能実装
- **Day 6-7**: E2Eテスト

### Phase 4: 本番リリース
- **Week 4**: 段階的ロールアウト（10% → 50% → 100%）

---

## 📊 データフロー図

### フロー1: 申請送信（VoiceDrive → 医療システム）

```
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive UI                           │
│                  (ChangeRequestPage)                         │
│                                                               │
│  1. ユーザーがフォーム入力                                     │
│     - 希望コース選択                                          │
│     - 変更理由選択                                            │
│     - 理由詳細入力                                            │
│     - 希望適用日選択                                          │
│     - ファイルアップロード                                     │
│                                                               │
│  2. POST /api/career-course/upload-attachment                │
│     → ファイルをS3にアップロード                               │
│     ← レスポンス: { fileUrl, fileName }                       │
│                                                               │
│  3. POST /api/career-course/change-request                   │
│     Body: {                                                  │
│       currentCourseCode: "B",                                │
│       requestedCourseCode: "D",                              │
│       changeReason: "special_pregnancy",                     │
│       reasonDetail: "...",                                   │
│       requestedEffectiveDate: "2025-11-01",                  │
│       attachments: ["https://cdn.../cert.pdf"]               │
│     }                                                         │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (JWT Auth)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    医療システム API                           │
│                                                               │
│  4. リクエスト検証                                             │
│     - JWT検証                                                 │
│     - バリデーション                                          │
│     - 年1回制限チェック                                        │
│     - 添付ファイル必須チェック（特例の場合）                    │
│                                                               │
│  5. DB保存                                                    │
│     career_course_change_requests.create({                   │
│       staffId: "OH-NS-2024-001",                             │
│       currentCourseCode: "B",                                │
│       requestedCourseCode: "D",                              │
│       approvalStatus: "pending",                             │
│       ...                                                     │
│     })                                                        │
│                                                               │
│  6. メール送信                                                 │
│     - 申請者へ: "申請を受け付けました"                          │
│     - 人事部へ: "新規申請があります（職員: 山田花子）"           │
│                                                               │
│  7. レスポンス返却                                             │
│     { id, staffId, approvalStatus: "pending", message }      │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive UI                           │
│                                                               │
│  8. 成功メッセージ表示                                         │
│     "コース変更申請を受け付けました。人事部の審査をお待ちくださ │
│      い。"                                                     │
│                                                               │
│  9. 画面遷移                                                   │
│     /career-selection-station/my-requests                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### フロー2: 人事部の審査（医療システム内部）

```
┌─────────────────────────────────────────────────────────────┐
│                 医療システム 管理画面                          │
│                  (人事部専用)                                 │
│                                                               │
│  1. 申請一覧表示                                               │
│     GET /api/career-course/all-requests                      │
│     → 全申請をリスト表示（pending/approved/rejected）          │
│                                                               │
│  2. 申請詳細表示                                               │
│     - 申請者情報                                              │
│     - 現在のコース → 希望コース                               │
│     - 変更理由                                                │
│     - 添付ファイル（ダウンロード可）                           │
│                                                               │
│  3. 人事部が判断                                               │
│     - 承認 or 却下                                            │
│     - コメント入力                                            │
│                                                               │
│  4. 承認処理                                                   │
│     PUT /api/career-course/requests/:id/approve               │
│     Body: { reviewComment: "承認します" }                     │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 医療システム バックエンド                       │
│                                                               │
│  5. 承認処理実行                                               │
│     a. career_course_change_requests.update()                │
│        → approvalStatus = "approved"                         │
│     b. career_course_selections.update()                     │
│        → 現在のコースの effective_to を設定                    │
│     c. career_course_selections.create()                     │
│        → 新しいコースを開始                                    │
│     d. メール送信（申請者へ）                                  │
│        "Dコースへの変更が承認されました（適用日: 2025-11-01）" │
│                                                               │
│  6. (オプション) Webhook送信                                   │
│     POST https://voicedrive.ai/api/webhooks/career-course-*  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### 医療システム側作業

#### Phase 1: 基盤構築
- [ ] **確認-1**: キャリア選択制度の詳細仕様確認
- [ ] **確認-2**: 添付ファイルの仕様確認
- [ ] **確認-3**: 通知・メールの仕様確認
- [ ] **テーブル作成**: career_course_definitions
- [ ] **テーブル作成**: career_course_selections
- [ ] **テーブル作成**: career_course_change_requests
- [ ] **初期データ**: A/B/C/Dコース定義投入
- [ ] **API実装**: GET /api/career-courses/definitions
- [ ] **API実装**: GET /api/my-page（careerCourse追加）
- [ ] **API実装**: POST /api/career-course/change-request
- [ ] **API実装**: POST /api/career-course/upload-attachment
- [ ] **S3バケット**: medical-system-career-attachments作成
- [ ] **CloudFront**: CDN配信設定
- [ ] **署名付きURL**: 生成機能実装
- [ ] **メール送信**: 申請受付メール
- [ ] **メール送信**: 新規申請通知（人事部宛）
- [ ] **バリデーション**: 年1回制限チェック
- [ ] **バリデーション**: 特例変更の添付必須チェック
- [ ] **単体テスト**: 全API
- [ ] **API仕様書**: OpenAPI 3.0ドキュメント

#### Phase 2: 申請管理
- [ ] **API実装**: GET /api/career-course/my-requests
- [ ] **API実装**: GET /api/career-course/all-requests（人事部用）
- [ ] **API実装**: PUT /api/career-course/requests/:id/approve
- [ ] **API実装**: PUT /api/career-course/requests/:id/reject
- [ ] **API実装**: DELETE /api/career-course/requests/:id（取り下げ）
- [ ] **メール送信**: 承認通知
- [ ] **メール送信**: 却下通知
- [ ] **承認後処理**: コース自動更新
- [ ] **Webhook**: VoiceDriveへの通知（オプション）

#### Phase 3: 人事部管理画面
- [ ] **UI実装**: 申請一覧画面
- [ ] **UI実装**: 申請詳細画面
- [ ] **UI実装**: 審査・承認画面
- [ ] **E2Eテスト**: 申請～承認フロー

---

### VoiceDrive側作業

#### Phase 1: 基盤構築
- [x] **UI実装**: ChangeRequestPage.tsx（完了）
- [x] **サービス層**: careerCourseService.ts（完了）
- [x] **型定義**: career-course.ts（完了）
- [ ] **TODO実装**: ファイルアップロード処理
  ```typescript
  // src/pages/career-selection-station/ChangeRequestPage.tsx 115-117行目
  // TODO: 添付ファイルのアップロード処理
  // 現在はファイル名のみを送信（実装時はStorageにアップロード）
  const attachmentUrls = attachments.map(f => f.name);
  ```
  ↓
  ```typescript
  // 医療システムのアップロードAPIを呼び出し
  const attachmentUrls = await Promise.all(
    attachments.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/api/career-course/upload-attachment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: formData
      });
      const data = await response.json();
      return data.fileUrl;
    })
  );
  ```

#### Phase 2: 申請管理
- [ ] **UI実装**: MyRequestsPage.tsx（申請履歴表示）
- [ ] **API呼び出し**: getMyRequests()
- [ ] **統合テスト**: VoiceDrive ↔ 医療システム

---

## 📝 補足資料

### 参照ドキュメント

1. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

2. **career-selection-station/change-request DB要件分析**
   `mcp-shared/docs/career-selection-station/change-request_DB要件分析_20251013.md`

3. **PersonalStation 暫定マスターリスト（参考）**
   `mcp-shared/docs/PersonalStation暫定マスターリスト_20251008.md`

### 技術スタック

**VoiceDrive**:
- React + TypeScript
- Vite
- SQLite (開発) → MySQL (本番)
- Vercel (ホスティング)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js
- NestJS (API Server)
- S3 + CloudFront (ファイルストレージ)

---

**作成者**: AI (Claude Code)
**承認待ち**: 医療システムチームからの確認事項回答
**次のステップ**: 医療システム側でテーブル・API実装 → VoiceDrive側でファイルアップロード処理実装

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-21 | 初版作成 | AI (Claude Code) |
