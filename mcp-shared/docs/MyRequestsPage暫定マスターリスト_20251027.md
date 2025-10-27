# MyRequestsPage 暫定マスターリスト

**文書番号**: ML-2025-1027-004
**作成日**: 2025年10月27日
**対象ページ**: https://voicedrive-v100.vercel.app/career-selection-station/my-requests (MyRequestsPage)
**関連文書**: [MyRequestsPage_DB要件分析_20251027.md](./MyRequestsPage_DB要件分析_20251027.md)

---

## 📋 エグゼクティブサマリー

### 最重要結論

**MyRequestsPageは医療システム側のDB実装が100%必要で、VoiceDrive側の新規テーブル追加は不要です。**

### 実装状態サマリー

| カテゴリ | 医療システム | VoiceDrive | 状態 |
|---------|------------|-----------|------|
| **データベーステーブル** | 3件必要 | 0件（不要） | 🔴 医療システム側未実装 |
| **APIエンドポイント** | 3件必要 | 0件（不要） | 🔴 医療システム側未実装 |
| **Webhook通知** | 2件必要 | 1件必要 | 🟡 両方未実装 |
| **UI実装** | 管理画面必要 | 完成 | 🟢 VoiceDrive側完成 |

---

## 🎯 必要な実装項目一覧

### A. 医療システム側（🔴 最優先）

#### 1. データベーステーブル（3件）

| # | テーブル名 | 用途 | 優先度 | 状態 |
|---|----------|------|-------|------|
| 1 | `career_course_definitions` | コース定義マスタ（A/B/C/D） | 🔴 最高 | ❌ 未実装 |
| 2 | `career_course_selections` | 職員の現在のコース選択状況 | 🔴 最高 | ❌ 未実装 |
| 3 | `career_course_change_requests` | コース変更申請履歴 | 🔴 最高 | ❌ 未実装 |

---

#### 2. APIエンドポイント（3件）

| # | エンドポイント | メソッド | 用途 | 優先度 | 状態 |
|---|-------------|---------|------|-------|------|
| 1 | `/api/career-course/my-requests` | GET | 申請履歴取得 | 🔴 最高 | ❌ 未実装 |
| 2 | `/api/career-course/definitions` | GET | コース定義取得 | 🔴 最高 | ❌ 未実装 |
| 3 | `/api/career-course/change-request` | POST | 申請作成 | 🔴 最高 | ❌ 未実装 |

---

#### 3. Webhook通知（2件）

| # | 通知タイプ | 送信タイミング | 優先度 | 状態 |
|---|----------|--------------|-------|------|
| 1 | `course_change_approved` | 申請承認時 | 🔴 最高 | ❌ 未実装 |
| 2 | `course_change_rejected` | 申請却下時 | 🔴 最高 | ❌ 未実装 |

---

#### 4. 管理画面（1件）

| # | 画面名 | 用途 | 優先度 | 状態 |
|---|-------|------|-------|------|
| 1 | 申請審査画面 | 人事担当者が申請を承認/却下 | 🔴 最高 | ❌ 未実装 |

---

### B. VoiceDrive側

#### 1. データベーステーブル

**結論**: **新規テーブル追加不要**

MyRequestsPageは医療システムAPIからデータを取得して表示するのみで、VoiceDrive側でデータを保存する必要はありません。

---

#### 2. Webhookエンドポイント（1件）

| # | エンドポイント | メソッド | 用途 | 優先度 | 状態 |
|---|-------------|---------|------|-------|------|
| 1 | `/api/webhooks/career-course` | POST | 医療システムからの通知受信 | 🔴 最高 | ❌ 未実装 |

---

#### 3. UI実装

| # | コンポーネント | 状態 | 備考 |
|---|-------------|------|------|
| 1 | MyRequestsPage.tsx | ✅ 完成 | 統計サマリー、申請一覧、詳細モーダル |
| 2 | careerCourseService.ts | ✅ 完成 | API呼び出しサービス |
| 3 | CareerCourseNotificationService.ts | ✅ 完成 | 通知サービス |

---

## 📊 医療システム側テーブル詳細定義

### 1. career_course_definitions（コース定義マスタ）

**目的**: A/B/C/Dコースの定義を管理

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | VARCHAR(50) | NO | - | 主キー |
| course_code | CHAR(1) | NO | - | コースコード ('A', 'B', 'C', 'D') |
| course_name | VARCHAR(100) | NO | - | コース名 |
| description | TEXT | YES | NULL | 説明 |
| department_transfer_available | BOOLEAN | NO | FALSE | 部署異動可否 |
| facility_transfer_available | ENUM | NO | 'none' | 施設間異動レベル |
| relocation_required | BOOLEAN | NO | FALSE | 転居必要性 |
| night_shift_available | ENUM | NO | 'none' | 夜勤対応 |
| management_track | BOOLEAN | NO | FALSE | 管理職登用対象 |
| base_salary_multiplier | DECIMAL(3,2) | NO | 1.00 | 基本給係数 |
| salary_grade | INT | YES | NULL | 給与等級 |
| salary_notes | TEXT | YES | NULL | 給与備考 |
| is_active | BOOLEAN | NO | TRUE | 有効フラグ |
| display_order | INT | NO | 0 | 表示順 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**インデックス**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `course_code`

**初期データ（4件）**:
```sql
INSERT INTO career_course_definitions VALUES
('course-a', 'A', 'Aコース（全面協力型）', '施設間異動・転居あり', TRUE, 'full', TRUE, 'required', TRUE, 1.20, NULL, NULL, TRUE, 1, NOW(), NOW()),
('course-b', 'B', 'Bコース（部署異動協力型）', '部署異動あり、施設間異動なし', TRUE, 'none', FALSE, 'selectable', TRUE, 1.10, NULL, NULL, TRUE, 2, NOW(), NOW()),
('course-c', 'C', 'Cコース（限定協力型）', '異動なし、夜勤選択可', FALSE, 'none', FALSE, 'selectable', FALSE, 1.00, NULL, NULL, TRUE, 3, NOW(), NOW()),
('course-d', 'D', 'Dコース（勤務限定型）', '異動なし、夜勤なし', FALSE, 'none', FALSE, 'none', FALSE, 0.90, NULL, NULL, TRUE, 4, NOW(), NOW());
```

---

### 2. career_course_selections（コース選択状況）

**目的**: 職員ごとの現在のコース選択状況を管理

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | VARCHAR(50) | NO | - | 主キー |
| staff_id | VARCHAR(50) | NO | - | 職員ID（FK: employees.employee_id） |
| course_code | CHAR(1) | NO | - | コースコード（FK: career_course_definitions.course_code） |
| effective_from | DATE | NO | - | 適用開始日 |
| effective_to | DATE | YES | NULL | 適用終了日 |
| next_change_available_date | DATE | YES | NULL | 次回変更可能日 |
| special_change_reason | ENUM | YES | NULL | 特例変更理由 |
| special_change_note | TEXT | YES | NULL | 特例変更備考 |
| change_requested_at | TIMESTAMP | YES | NULL | 変更申請日時 |
| change_requested_by | VARCHAR(50) | YES | NULL | 申請者ID |
| approved_at | TIMESTAMP | YES | NULL | 承認日時 |
| approved_by | VARCHAR(50) | YES | NULL | 承認者ID |
| approval_status | ENUM | NO | 'pending' | 承認ステータス |
| rejection_reason | TEXT | YES | NULL | 却下理由 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**ENUM定義**:
- `special_change_reason`: ('pregnancy', 'caregiving', 'illness')
- `approval_status`: ('pending', 'approved', 'rejected', 'withdrawn')

**インデックス**:
- PRIMARY KEY: `id`
- INDEX: `idx_staff_effective` (staff_id, effective_from, effective_to)
- INDEX: `idx_approval_status` (approval_status)

**外部キー**:
- FOREIGN KEY: `staff_id` → `employees.employee_id` ON DELETE CASCADE
- FOREIGN KEY: `course_code` → `career_course_definitions.course_code`

---

### 3. career_course_change_requests（コース変更申請）

**目的**: コース変更申請履歴を管理（MyRequestsPageで表示）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | VARCHAR(50) | NO | - | 主キー |
| staff_id | VARCHAR(50) | NO | - | 職員ID（FK: employees.employee_id） |
| current_course_code | CHAR(1) | NO | - | 現在のコース |
| requested_course_code | CHAR(1) | NO | - | 希望コース |
| change_reason | ENUM | NO | - | 変更理由 |
| reason_detail | TEXT | NO | - | 理由詳細 |
| requested_effective_date | DATE | NO | - | 希望適用日 |
| hr_reviewer_id | VARCHAR(50) | YES | NULL | 人事審査者ID |
| hr_reviewer_name | VARCHAR(100) | YES | NULL | 人事審査者名 |
| reviewed_at | TIMESTAMP | YES | NULL | 審査日時 |
| review_comment | TEXT | YES | NULL | 審査コメント |
| approval_status | ENUM | NO | 'pending' | 承認ステータス |
| rejection_reason | TEXT | YES | NULL | 却下理由 |
| withdrawn_at | TIMESTAMP | YES | NULL | 取下げ日時 |
| attachments | JSON | YES | NULL | 添付ファイルパス配列 |
| created_at | TIMESTAMP | NO | NOW() | 申請日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**ENUM定義**:
- `change_reason`: ('annual', 'special_pregnancy', 'special_caregiving', 'special_illness')
- `approval_status`: ('pending', 'approved', 'rejected', 'withdrawn')

**インデックス**:
- PRIMARY KEY: `id`
- INDEX: `idx_staff_status` (staff_id, approval_status)
- INDEX: `idx_approval_status` (approval_status)
- INDEX: `idx_created_at` (created_at DESC)

**外部キー**:
- FOREIGN KEY: `staff_id` → `employees.employee_id` ON DELETE CASCADE
- FOREIGN KEY: `current_course_code` → `career_course_definitions.course_code`
- FOREIGN KEY: `requested_course_code` → `career_course_definitions.course_code`
- FOREIGN KEY: `hr_reviewer_id` → `employees.employee_id` ON DELETE SET NULL

---

## 🔄 APIエンドポイント詳細定義

### 1. GET /api/career-course/my-requests

**用途**: 現在のユーザーの申請履歴を取得（MyRequestsPageで使用）

**認証**: JWT Bearer Token必須

**リクエスト例**:
```http
GET /api/career-course/my-requests HTTP/1.1
Host: medical-system.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "req-003",
      "staffId": "OH-NS-2021-001",
      "staffName": "山田 花子",
      "facility": "小原病院",
      "department": "内科",
      "position": "看護師",
      "currentCourseCode": "B",
      "requestedCourseCode": "A",
      "changeReason": "annual",
      "reasonDetail": "管理職候補として、施設間異動を含む全面協力型コースへの変更を希望します。",
      "requestedEffectiveDate": "2026-04-01",
      "hrReviewerId": null,
      "hrReviewerName": null,
      "reviewedAt": null,
      "reviewComment": null,
      "approvalStatus": "pending",
      "rejectionReason": null,
      "withdrawnAt": null,
      "attachments": [],
      "createdAt": "2025-09-25T10:30:00Z",
      "updatedAt": "2025-09-25T10:30:00Z"
    }
  ],
  "message": "申請履歴を取得しました"
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": "認証エラー",
  "code": "UNAUTHORIZED"
}
```

**実装サンプル（Node.js + Express + Prisma）**:
```typescript
router.get('/my-requests', authenticateJWT, async (req, res) => {
  const staffId = req.user.employeeId;

  const requests = await prisma.careerCourseChangeRequest.findMany({
    where: { staffId },
    orderBy: { createdAt: 'desc' },
    include: {
      staff: {
        select: {
          name: true,
          facility: true,
          department: true,
          position: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: requests.map(req => ({
      ...req,
      staffName: req.staff.name,
      facility: req.staff.facility,
      department: req.staff.department,
      position: req.staff.position
    })),
    message: '申請履歴を取得しました'
  });
});
```

---

### 2. GET /api/career-course/definitions

**用途**: コース定義（A/B/C/D）を取得

**認証**: JWT Bearer Token必須

**リクエスト例**:
```http
GET /api/career-course/definitions HTTP/1.1
Host: medical-system.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "course-a",
      "courseCode": "A",
      "courseName": "Aコース（全面協力型）",
      "description": "施設間異動・転居を伴う可能性あり",
      "departmentTransferAvailable": true,
      "facilityTransferAvailable": "full",
      "relocationRequired": true,
      "nightShiftAvailable": "required",
      "managementTrack": true,
      "baseSalaryMultiplier": 1.20,
      "isActive": true,
      "displayOrder": 1
    },
    // ... B, C, D
  ]
}
```

---

### 3. POST /api/career-course/change-request

**用途**: コース変更申請を送信

**認証**: JWT Bearer Token必須

**リクエスト例**:
```http
POST /api/career-course/change-request HTTP/1.1
Host: medical-system.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentCourseCode": "B",
  "requestedCourseCode": "A",
  "changeReason": "annual",
  "reasonDetail": "管理職候補として、施設間異動を含む全面協力型コースへの変更を希望します。",
  "requestedEffectiveDate": "2026-04-01",
  "attachments": []
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": "req-004",
    "staffId": "OH-NS-2021-001",
    "approvalStatus": "pending",
    "createdAt": "2025-10-27T10:00:00Z"
  },
  "message": "コース変更申請を受け付けました"
}
```

---

## 🔔 Webhook通知詳細定義

### 1. course_change_approved（申請承認通知）

**送信タイミング**: 人事担当者が申請を承認した時

**送信先**: `https://voicedrive-v100.vercel.app/api/webhooks/career-course`

**認証**: HMAC-SHA256署名（`X-Medical-System-Signature`ヘッダー）

**ペイロード例**:
```json
{
  "type": "course_change_approved",
  "staffId": "OH-NS-2021-001",
  "requestId": "req-003",
  "approvedCourse": "A",
  "effectiveDate": "2026-04-01",
  "reviewComment": "管理職候補として評価し、承認します。"
}
```

**実装サンプル**:
```typescript
// 医療システム側
export async function sendApprovalNotification(requestId: string) {
  const request = await prisma.careerCourseChangeRequest.findUnique({
    where: { id: requestId }
  });

  const payload = {
    type: 'course_change_approved',
    staffId: request.staffId,
    requestId: request.id,
    approvedCourse: request.requestedCourseCode,
    effectiveDate: request.requestedEffectiveDate,
    reviewComment: request.reviewComment
  };

  const signature = generateHMAC(payload, process.env.WEBHOOK_SECRET);

  await fetch('https://voicedrive-v100.vercel.app/api/webhooks/career-course', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Medical-System-Signature': signature
    },
    body: JSON.stringify(payload)
  });
}
```

---

### 2. course_change_rejected（申請却下通知）

**送信タイミング**: 人事担当者が申請を却下した時

**ペイロード例**:
```json
{
  "type": "course_change_rejected",
  "staffId": "OH-NS-2021-001",
  "requestId": "req-001",
  "rejectionReason": "現在の勤務シフト調整で対応可能なため。",
  "reviewComment": "介護事由を確認しましたが、現在の勤務シフト調整で対応可能と判断しました。"
}
```

---

## ✅ 実装チェックリスト

### 医療システム側

#### Phase 1: データベース構築（1週間）
- [ ] `career_course_definitions` テーブル作成
- [ ] `career_course_selections` テーブル作成
- [ ] `career_course_change_requests` テーブル作成
- [ ] マイグレーションスクリプト作成
- [ ] 初期データ投入（A/B/C/Dコース定義）
- [ ] インデックス設定
- [ ] 外部キー制約設定

#### Phase 2: API実装（1週間）
- [ ] JWT認証ミドルウェア実装
- [ ] `GET /api/career-course/my-requests` 実装
- [ ] `GET /api/career-course/definitions` 実装
- [ ] `POST /api/career-course/change-request` 実装
- [ ] エラーハンドリング実装
- [ ] バリデーション実装
- [ ] 単体テスト作成

#### Phase 3: Webhook実装（3日）
- [ ] HMAC署名生成機能実装
- [ ] `sendApprovalNotification()` 実装
- [ ] `sendRejectionNotification()` 実装
- [ ] Webhookリトライ機能実装
- [ ] エラーログ記録機能実装

#### Phase 4: 管理画面実装（1週間）
- [ ] 申請一覧画面（人事担当者向け）
- [ ] 申請詳細画面
- [ ] 承認・却下処理実装
- [ ] コース定義管理画面
- [ ] 統計ダッシュボード

---

### VoiceDrive側

#### Phase 1: Webhook受信実装（2日）
- [ ] `/api/webhooks/career-course` エンドポイント作成
- [ ] HMAC署名検証実装
- [ ] Webhookペイロード処理実装
- [ ] エラーハンドリング実装

#### Phase 2: 統合テスト（2日）
- [ ] API `/my-requests` 呼び出しテスト
- [ ] Webhook通知受信テスト
- [ ] リアルタイム画面更新テスト
- [ ] エラー時のモックデータ表示テスト

#### Phase 3: E2Eテスト（1日）
- [ ] 申請作成→審査→通知→画面更新の一連フロー確認

---

## 📊 工数見積もり

| タスク | 担当 | 工数 | 優先度 |
|-------|------|------|-------|
| 医療システムDB構築 | バックエンド | 5日 | 🔴 最高 |
| 医療システムAPI実装 | バックエンド | 5日 | 🔴 最高 |
| 医療システムWebhook実装 | バックエンド | 2日 | 🔴 最高 |
| 医療システム管理画面 | フロントエンド | 5日 | 🔴 最高 |
| VoiceDrive Webhook受信 | バックエンド | 2日 | 🔴 最高 |
| 統合テスト | QA | 2日 | 🔴 最高 |
| E2Eテスト | QA | 1日 | 🟡 中 |
| **合計** | - | **22日（約4.5週間）** | - |

---

## 🎯 成功指標

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| API応答時間 | <500ms | パフォーマンス監視 |
| Webhook到達率 | >99% | ログ分析 |
| 通知遅延 | <3秒 | タイムスタンプ比較 |
| UI表示速度 | <2秒 | ページロード計測 |
| エラー率 | <0.1% | エラーログ分析 |
| 申請データ整合性 | 100% | 日次検証バッチ |

---

## 🔗 関連ドキュメント

- [MyRequestsPage_DB要件分析_20251027.md](./MyRequestsPage_DB要件分析_20251027.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
承認: 未承認（レビュー待ち）
次回レビュー: 医療システム実装開始時
