# MyRequestsPage (申請状況確認) DB要件分析

**文書番号**: DB-REQ-2025-1027-004
**作成日**: 2025年10月27日
**対象ページ**: https://voicedrive-v100.vercel.app/career-selection-station/my-requests (MyRequestsPage)
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [NotFoundPage_DB要件分析_20251027.md](./NotFoundPage_DB要件分析_20251027.md)

---

## 📋 分析サマリー

### 結論
MyRequestsPageは**キャリア選択制度のコース変更申請履歴を表示するページ**であり、**医療システムが管理するキャリアコースデータ**に完全に依存しています。

### ✅ 現在の状態
- **主要機能**: 自分のコース変更申請履歴と審査結果の表示
- **動的要素**: 申請一覧、統計サマリー、申請詳細モーダル
- **データソース**: 医療システムAPI（`getMyRequests`）+ モックデータ（エラー時フォールバック）
- **データベース連携**: 医療システム側のDBが必須（VoiceDrive側は表示のみ）

### 🎯 ページの性質

| 特性 | PersonalStation | MyRequestsPage |
|-----|----------------|----------------|
| **ページタイプ** | 完全動的（VoiceDrive活動中心） | 完全動的（医療システムデータ中心） |
| **データ管理責任** | VoiceDrive（一部医療システム） | 医療システム（100%） |
| **データベース要否** | 両方必要 | 医療システムのみ |
| **VoiceDrive側DB** | 多数のテーブル | **不要（表示のみ）** |
| **医療システムAPI** | 一部（職員情報等） | **必須（全データ）** |

---

## 🔍 詳細分析

### 1. ページ構造とデータフロー（99-372行目）

#### 実装内容

```typescript
export const MyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<CareerCourseChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();  // 申請履歴取得

    // リアルタイム通知のリスナーを登録
    const notificationService = CareerCourseNotificationService.getInstance();
    const unsubscribe = notificationService.subscribeToCareerCourseUpdates((data) => {
      console.log('📥 キャリアコース更新通知:', data);
      fetchRequests();  // 更新があれば再取得
    });

    return () => { unsubscribe(); };
  }, []);

  const fetchRequests = async () => {
    try {
      const { getMyRequests } = await import('../../services/careerCourseService');
      const data = await getMyRequests();  // 医療システムAPI呼び出し
      setRequests(data);
    } catch (error) {
      console.error('申請履歴の取得に失敗しました', error);
      setRequests(MOCK_REQUESTS);  // エラー時はモックデータ
    }
  };

  // 統計サマリー計算
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.approvalStatus === 'pending').length,
    approved: requests.filter(r => r.approvalStatus === 'approved').length,
    rejected: requests.filter(r => r.approvalStatus === 'rejected').length
  };

  return (
    <div>
      {/* 統計サマリー表示（176-201行目） */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>総申請数: {stats.total}</Card>
        <Card>承認待ち: {stats.pending}</Card>
        <Card>承認済み: {stats.approved}</Card>
        <Card>却下: {stats.rejected}</Card>
      </div>

      {/* 申請一覧表示（204-278行目） */}
      <Card>
        {requests.map(request => (
          <div key={request.id}>
            {/* 申請情報表示 */}
            {request.currentCourseCode} → {request.requestedCourseCode}
            <Badge>{STATUS_INFO[request.approvalStatus].label}</Badge>
            {request.reviewComment && <div>{request.reviewComment}</div>}
            {request.rejectionReason && <div>{request.rejectionReason}</div>}
          </div>
        ))}
      </Card>

      {/* 詳細モーダル（290-369行目） */}
      {selectedRequest && (
        <Card>申請詳細表示</Card>
      )}
    </div>
  );
};
```

#### 必要なデータソース

| 表示項目 | データソース | 医療システムDB | VoiceDriveDB | データ管理責任 | 状態 |
|---------|------------|--------------|-------------|--------------|------|
| 申請ID | `request.id` | `CareerCourseChangeRequest.id` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 職員ID | `request.staffId` | `CareerCourseChangeRequest.staffId` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 現在のコース | `request.currentCourseCode` | `CareerCourseChangeRequest.currentCourseCode` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 希望コース | `request.requestedCourseCode` | `CareerCourseChangeRequest.requestedCourseCode` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 変更理由 | `request.changeReason` | `CareerCourseChangeRequest.changeReason` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 理由詳細 | `request.reasonDetail` | `CareerCourseChangeRequest.reasonDetail` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 希望適用日 | `request.requestedEffectiveDate` | `CareerCourseChangeRequest.requestedEffectiveDate` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 審査者ID | `request.hrReviewerId` | `CareerCourseChangeRequest.hrReviewerId` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 審査者名 | `request.hrReviewerName` | `CareerCourseChangeRequest.hrReviewerName` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 審査日時 | `request.reviewedAt` | `CareerCourseChangeRequest.reviewedAt` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 審査コメント | `request.reviewComment` | `CareerCourseChangeRequest.reviewComment` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 承認ステータス | `request.approvalStatus` | `CareerCourseChangeRequest.approvalStatus` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 却下理由 | `request.rejectionReason` | `CareerCourseChangeRequest.rejectionReason` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 取下げ日時 | `request.withdrawnAt` | `CareerCourseChangeRequest.withdrawnAt` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 添付ファイル | `request.attachments` | `CareerCourseChangeRequest.attachments` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 申請日時 | `request.createdAt` | `CareerCourseChangeRequest.createdAt` | ❌ 不要 | 医療システム | 🟡 **要実装** |
| 更新日時 | `request.updatedAt` | `CareerCourseChangeRequest.updatedAt` | ❌ 不要 | 医療システム | 🟡 **要実装** |

**評価**: 🟡 全データが医療システム側で管理されるため、VoiceDrive側のDB追加は不要

---

### 2. APIサービス分析（careerCourseService.ts）

#### 現在の実装（141-143行目）

```typescript
/**
 * 申請履歴取得
 */
export async function getMyRequests(): Promise<ChangeRequest[]> {
  return apiRequest('/api/career-course/my-requests');
}
```

#### データフロー（現在）

```
MyRequestsPage
  ↓ fetchRequests()
careerCourseService.getMyRequests()
  ↓ API呼び出し
GET /api/career-course/my-requests
  ↓ 医療システムAPI
医療システムDB: career_course_change_requests テーブル
  ↓ フィルタリング（staffId = 現在のユーザー）
申請履歴（JSON配列）
  ↓
MyRequestsPageで表示
```

#### エラー時のフォールバック

```typescript
catch (error) {
  console.error('申請履歴の取得に失敗しました', error);
  setRequests(MOCK_REQUESTS);  // モックデータ（39-97行目）
}
```

**モックデータ**:
- `req-003`: 承認待ち（pending）
- `req-002`: 承認済み（approved）
- `req-001`: 却下（rejected）

**評価**: ✅ モックデータは開発用フォールバックとして機能

---

### 3. リアルタイム通知の分析（CareerCourseNotificationService）

#### Webhook通知の仕組み（108-120行目）

```typescript
useEffect(() => {
  // リアルタイム通知のリスナーを登録
  const notificationService = CareerCourseNotificationService.getInstance();
  const unsubscribe = notificationService.subscribeToCareerCourseUpdates((data) => {
    console.log('📥 キャリアコース更新通知:', data);
    fetchRequests();  // 申請履歴を再取得
  });

  return () => { unsubscribe(); };
}, []);
```

#### 通知サービスの実装

**CareerCourseNotificationService.ts**:
- `handleWebhookNotification()`: 医療システムからのWebhook受信
- `handleApprovalNotification()`: 承認通知処理
- `handleRejectionNotification()`: 却下通知処理
- `subscribeToCareerCourseUpdates()`: リアルタイム通知リスナー登録

**通知タイプ**:
1. `course_change_approved`: コース変更承認
2. `course_change_rejected`: コース変更却下

**評価**: ✅ 通知システムは実装済み（医療システム側のWebhook送信が必要）

---

## 📊 データ要件マトリックス

### 必要なデータベーステーブル

#### A. 医療システム側（必須）

| テーブル名 | 用途 | 状態 | 優先度 |
|----------|------|------|-------|
| `career_course_definitions` | コース定義（A/B/C/D） | 🟡 要実装 | 🔴 高 |
| `career_course_selections` | 現在のコース選択状況 | 🟡 要実装 | 🔴 高 |
| `career_course_change_requests` | コース変更申請履歴 | 🟡 要実装 | 🔴 高 |

#### B. VoiceDrive側

**結論**: **新規テーブル追加不要**

MyRequestsPageは医療システムAPIから取得したデータを表示するのみで、VoiceDrive側でデータを保存する必要はありません。

---

### 医療システム側テーブル定義

#### 1. career_course_definitions（コース定義マスタ）

```sql
-- 医療システムDB
CREATE TABLE career_course_definitions (
  id VARCHAR(50) PRIMARY KEY,
  course_code CHAR(1) NOT NULL,  -- 'A', 'B', 'C', 'D'
  course_name VARCHAR(100) NOT NULL,
  description TEXT,
  department_transfer_available BOOLEAN DEFAULT FALSE,
  facility_transfer_available ENUM('none', 'limited', 'full') DEFAULT 'none',
  relocation_required BOOLEAN DEFAULT FALSE,
  night_shift_available ENUM('none', 'selectable', 'required') DEFAULT 'none',
  management_track BOOLEAN DEFAULT FALSE,
  base_salary_multiplier DECIMAL(3, 2) DEFAULT 1.00,
  salary_grade INT,
  salary_notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (course_code)
);
```

**初期データ**:
```sql
INSERT INTO career_course_definitions (id, course_code, course_name, description, ...) VALUES
('course-a', 'A', 'Aコース（全面協力型）', '施設間異動・転居を伴う可能性あり', ...),
('course-b', 'B', 'Bコース（部署異動協力型）', '部署異動はあるが施設間異動なし', ...),
('course-c', 'C', 'Cコース（限定協力型）', '部署・施設異動なし、夜勤選択可能', ...),
('course-d', 'D', 'Dコース（勤務限定型）', '夜勤なし、異動なし', ...);
```

#### 2. career_course_selections（コース選択状況）

```sql
-- 医療システムDB
CREATE TABLE career_course_selections (
  id VARCHAR(50) PRIMARY KEY,
  staff_id VARCHAR(50) NOT NULL,
  course_code CHAR(1) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  next_change_available_date DATE,
  special_change_reason ENUM('pregnancy', 'caregiving', 'illness'),
  special_change_note TEXT,
  change_requested_at TIMESTAMP,
  change_requested_by VARCHAR(50),
  approved_at TIMESTAMP,
  approved_by VARCHAR(50),
  approval_status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (course_code) REFERENCES career_course_definitions(course_code),
  INDEX idx_staff_effective (staff_id, effective_from, effective_to),
  INDEX idx_approval_status (approval_status)
);
```

#### 3. career_course_change_requests（コース変更申請）

```sql
-- 医療システムDB
CREATE TABLE career_course_change_requests (
  id VARCHAR(50) PRIMARY KEY,
  staff_id VARCHAR(50) NOT NULL,
  current_course_code CHAR(1) NOT NULL,
  requested_course_code CHAR(1) NOT NULL,
  change_reason ENUM('annual', 'special_pregnancy', 'special_caregiving', 'special_illness') NOT NULL,
  reason_detail TEXT NOT NULL,
  requested_effective_date DATE NOT NULL,
  hr_reviewer_id VARCHAR(50),
  hr_reviewer_name VARCHAR(100),
  reviewed_at TIMESTAMP,
  review_comment TEXT,
  approval_status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  rejection_reason TEXT,
  withdrawn_at TIMESTAMP,
  attachments JSON,  -- ファイルパスの配列
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (current_course_code) REFERENCES career_course_definitions(course_code),
  FOREIGN KEY (requested_course_code) REFERENCES career_course_definitions(course_code),
  FOREIGN KEY (hr_reviewer_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
  INDEX idx_staff_status (staff_id, approval_status),
  INDEX idx_approval_status (approval_status),
  INDEX idx_created_at (created_at DESC)
);
```

---

## 🔄 API要件

### 必要なAPIエンドポイント（医療システム側）

#### 1. GET /api/career-course/my-requests

**用途**: 現在のユーザーのコース変更申請履歴を取得

**リクエスト**:
```http
GET /api/career-course/my-requests
Authorization: Bearer {jwt_token}
```

**レスポンス**:
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
    },
    // ... その他の申請履歴
  ],
  "message": "申請履歴を取得しました"
}
```

**実装例**:
```typescript
// 医療システム: src/api/career-course.routes.ts
router.get('/my-requests', authenticateJWT, async (req, res) => {
  const staffId = req.user.employeeId;  // JWT から取得

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

#### 2. GET /api/career-course/definitions

**用途**: コース定義（A/B/C/D）を取得

**リクエスト**:
```http
GET /api/career-course/definitions
Authorization: Bearer {jwt_token}
```

**レスポンス**:
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
    // ... B, C, D コース
  ]
}
```

---

#### 3. POST /api/career-course/change-request

**用途**: コース変更申請を送信

**リクエスト**:
```http
POST /api/career-course/change-request
Authorization: Bearer {jwt_token}
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

**レスポンス**:
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

## 🔔 Webhook通知要件（医療システム → VoiceDrive）

### 通知タイミング

| イベント | Webhook送信タイミング | 通知内容 |
|---------|-------------------|---------|
| 申請承認 | 人事担当者が承認した時 | `course_change_approved` |
| 申請却下 | 人事担当者が却下した時 | `course_change_rejected` |

### Webhook送信実装例

```typescript
// 医療システム: src/services/CareerCourseWebhookService.ts

export async function sendApprovalNotification(requestId: string) {
  const request = await prisma.careerCourseChangeRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) return;

  const webhookPayload = {
    type: 'course_change_approved',
    staffId: request.staffId,
    requestId: request.id,
    approvedCourse: request.requestedCourseCode,
    effectiveDate: request.requestedEffectiveDate,
    reviewComment: request.reviewComment
  };

  // VoiceDrive Webhook エンドポイントに送信
  await fetch('https://voicedrive-v100.vercel.app/api/webhooks/career-course', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Medical-System-Signature': generateHMAC(webhookPayload)
    },
    body: JSON.stringify(webhookPayload)
  });
}
```

### VoiceDrive側Webhookエンドポイント

```typescript
// VoiceDrive: src/pages/api/webhooks/career-course.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // HMAC署名検証
  const signature = req.headers['x-medical-system-signature'];
  if (!verifyHMAC(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const notification: CareerCourseNotification = req.body;

  // 通知サービスに転送
  const notificationService = CareerCourseNotificationService.getInstance();
  await notificationService.handleWebhookNotification(notification);

  res.status(200).json({ success: true });
}
```

---

## 📋 実装チェックリスト

### 医療システム側の実装

#### データベース
- [ ] `career_course_definitions` テーブル作成
- [ ] `career_course_selections` テーブル作成
- [ ] `career_course_change_requests` テーブル作成
- [ ] 初期データ投入（A/B/C/Dコース定義）

#### API実装
- [ ] `GET /api/career-course/my-requests` 実装
- [ ] `GET /api/career-course/definitions` 実装
- [ ] `POST /api/career-course/change-request` 実装
- [ ] JWT認証機能実装
- [ ] エラーハンドリング実装

#### Webhook実装
- [ ] `sendApprovalNotification()` 実装
- [ ] `sendRejectionNotification()` 実装
- [ ] HMAC署名生成機能
- [ ] Webhookリトライ機能

#### 管理画面
- [ ] 申請審査画面（人事担当者向け）
- [ ] 承認・却下処理
- [ ] コース定義管理画面

---

### VoiceDrive側の実装

#### API連携
- [x] `careerCourseService.ts` 実装済み
- [x] `getMyRequests()` 実装済み
- [x] API認証トークン管理実装済み
- [ ] エラーハンドリング強化

#### Webhook受信
- [x] `CareerCourseNotificationService.ts` 実装済み
- [ ] `/api/webhooks/career-course` エンドポイント実装
- [ ] HMAC署名検証実装
- [x] リアルタイム通知リスナー実装済み

#### UI
- [x] `MyRequestsPage.tsx` 実装済み
- [x] 統計サマリー表示実装済み
- [x] 申請一覧表示実装済み
- [x] 申請詳細モーダル実装済み
- [x] リアルタイム更新実装済み

---

### テスト

#### 単体テスト
- [ ] API `/my-requests` のテスト
- [ ] Webhook通知処理のテスト
- [ ] 統計計算のテスト

#### 統合テスト
- [ ] MyRequestsPage全体の動作確認
- [ ] Webhook通知→画面更新のフロー確認
- [ ] エラー時のモックデータ表示確認

#### E2Eテスト
- [ ] 申請作成→審査→通知→画面更新の一連のフロー

---

## 🎯 実装優先度

### Priority: 🔴 HIGH（キャリア選択制度の中核機能）

MyRequestsPageは以下の理由により、**最高優先度**です:

1. **キャリア選択制度の中核**: 職員が自分の申請状況を確認する唯一の手段
2. **医療システム依存度100%**: 医療システムDBとAPIの実装が前提
3. **人事業務に直結**: 申請審査プロセスの透明性確保に必須
4. **VoiceDrive側DB不要**: VoiceDrive側の追加実装は最小限

---

## 📊 データフロー図

### 完全なデータフロー（実装後）

```
【申請作成フロー】
ChangeRequestPage
  ↓ submitChangeRequest()
POST /api/career-course/change-request
  ↓
医療システムDB: career_course_change_requests
  ↓ INSERT
申請レコード作成（status: pending）
  ↓
MyRequestsPage
  ↓ fetchRequests()
GET /api/career-course/my-requests
  ↓ 申請履歴取得
画面更新（新規申請が表示される）

【承認フロー】
医療システム管理画面
  ↓ 人事担当者が承認
UPDATE career_course_change_requests
  SET approval_status = 'approved'
  ↓
Webhook送信
  POST https://voicedrive-v100.vercel.app/api/webhooks/career-course
  ↓
VoiceDrive: CareerCourseNotificationService
  ↓ handleApprovalNotification()
通知表示（ブラウザ通知 + 画面内通知）
  ↓
MyRequestsPage
  ↓ リアルタイム更新リスナー
fetchRequests() 再実行
  ↓
画面更新（承認済みステータスに変更）
```

---

## ✅ 成功指標

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| API応答時間 | <500ms | パフォーマンス監視 |
| Webhook到達率 | >99% | ログ分析 |
| 通知遅延 | <3秒 | タイムスタンプ比較 |
| UI表示速度 | <2秒 | ページロード計測 |
| エラー率 | <0.1% | エラーログ分析 |

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [NotFoundPage_DB要件分析_20251027.md](./NotFoundPage_DB要件分析_20251027.md)
- [UnauthorizedPage_DB要件分析_20251027.md](./UnauthorizedPage_DB要件分析_20251027.md)

---

## 📌 まとめ

### MyRequestsPageの特徴

1. **完全に医療システム依存**: 全データが医療システムDBに保存される
2. **VoiceDrive側は表示のみ**: 新規テーブル追加不要
3. **リアルタイム通知対応**: Webhook経由で即座に画面更新
4. **モックデータでフォールバック**: 開発環境でも動作確認可能

### 4ページの比較サマリー

| 要素 | NotFoundPage | UnauthorizedPage | PersonalStation | MyRequestsPage |
|-----|-------------|-----------------|----------------|----------------|
| **新規テーブル** | 不要 | 不要 | 2件必要 | **不要** |
| **新規フィールド** | 不要 | 不要 | 1件必要 | **不要** |
| **医療システムDB** | 不要 | 不要 | 一部必要 | **3件必要** |
| **API呼び出し** | なし | 間接的（認証） | 複数（直接） | **1件（必須）** |
| **Webhook通知** | 不要 | 不要 | 不要 | **2件必要** |
| **実装工数** | 0日（完成） | 3週間（認証含む） | 4-6週間 | **2-3週間（医療システム実装含む）** |

### 最終結論

**MyRequestsPageはVoiceDrive側の新規テーブルやフィールド追加が不要ですが、医療システム側の完全な実装が必須です。**

現在はモックデータで動作しており、医療システム側の3つのテーブル（`career_course_definitions`, `career_course_selections`, `career_course_change_requests`）とAPIエンドポイント（`GET /my-requests`）が実装されれば、すぐに実データ対応が完了します。

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
次回レビュー: 医療システム実装開始時
