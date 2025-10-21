# career-selection-station/change-request ページ DB要件分析

**文書番号**: DB-REQ-2025-1021-002
**作成日**: 2025年10月21日
**対象ページ**: https://voicedrive-v100.vercel.app/career-selection-station/change-request
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](../データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](../PersonalStation_DB要件分析_20251008.md)
- C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md

---

## 📋 分析サマリー

### 結論
career-selection-station/change-requestページは**医療システムと緊密に連携する申請フォーム**であり、以下の明確な責任分担が必要です。

### 🔵 医療システムが管理するデータ（マスタ）
1. **コース定義マスタ** (A/B/C/Dコース)
2. **現在のコース選択状況** (職員ごとのコース)
3. **コース変更申請レコード** (申請～承認までの履歴)
4. **職員基本情報** (氏名、部署、役職等)

### 🟢 VoiceDriveが管理するデータ（キャッシュ/表示用）
- **なし**（申請フォームのUIのみ）

### 🔴 重大な不足項目（即対応必要）

**医療システム側（100%）**:
1. ❌ `career_course_definitions` テーブル（コースマスタ）
2. ❌ `career_course_selections` テーブル（現在のコース）
3. ❌ `career_course_change_requests` テーブル（変更申請）
4. ❌ GET `/api/career-courses/definitions` API
5. ❌ GET `/api/my-page` API（現在のコース取得）
6. ❌ POST `/api/career-course/change-request` API（申請送信）
7. ❌ 添付ファイルアップロード機能（S3/CloudFront）

**VoiceDrive側**:
- ✅ **VoiceDriveでのDB追加は不要**
- ✅ UIコンポーネントのみ（既に実装済み）
- ✅ API呼び出しサービス（既に実装済み）

---

## 🔍 詳細分析

### 1. 現在のコース表示（156-172行目）

#### 表示内容
```typescript
// ChangeRequestPage.tsx 36行目
const [currentCourse, setCurrentCourse] = useState<CareerCourseCode>('B');

// 162-170行目: 現在のコース表示
<div className={`p-4 rounded-lg bg-gradient-to-r ${COURSE_INFO[currentCourse].gradient}`}>
  <span className="text-3xl">{COURSE_INFO[currentCourse].emoji}</span>
  <div className="text-xl font-bold">{currentCourse}コース</div>
  <div className="text-sm">{COURSE_INFO[currentCourse].name}</div>
</div>
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| `currentCourse` | ❌ | ✅ マスタ | 医療システム | API | 🔴 **要実装** |
| コース名・説明 | ❌ | ✅ マスタ | 医療システム | API | 🔴 **要実装** |

#### データフロー

```
医療システム
  ↓
  CareerCourseSelection テーブル
    - staffId (職員ID)
    - courseCode (A/B/C/D)
    - effectiveFrom (適用開始日)
  ↓
  GET /api/my-page
  ↓
  VoiceDrive UI (表示のみ)
```

#### 解決策: 医療システムにAPIを追加

**医療システム側**:
```typescript
// GET /api/my-page
{
  id: "EMP2024001",
  name: "山田 太郎",
  position: "看護師",
  department: "外科",
  facility: "小原病院",
  employeeId: "OH-NS-2024-001",
  joinDate: "2024-04-01",
  careerCourse: {
    courseCode: "B",
    courseName: "Bコース（施設内協力型）",
    effectiveFrom: "2024-04-01",
    nextChangeAvailableDate: "2025-04-01"
  }
}
```

**VoiceDrive側**:
```typescript
// src/services/careerCourseService.ts (既に実装済み)
const data = await getMyPageData();
setCurrentCourse(data.careerCourse?.courseCode || 'B');
```

---

### 2. 希望コース選択（174-221行目）

#### 表示内容
```typescript
// 181-212行目: A/B/C/Dコースの選択ボタン
{(['A', 'B', 'C', 'D'] as CareerCourseCode[]).map(course => (
  <button onClick={() => setSelectedCourse(course)}>
    <span>{COURSE_INFO[course].emoji}</span>
    <div>{course}コース</div>
    <div>{COURSE_INFO[course].name}</div>
  </button>
))}
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| コース一覧 | ❌ | ✅ マスタ | 医療システム | API | 🔴 **要実装** |
| コース名 | ❌ | ✅ マスタ | 医療システム | API | 🔴 **要実装** |
| コース説明 | ❌ | ✅ マスタ | 医療システム | API | 🔴 **要実装** |
| 選択可否 | 🟡 ローカル計算 | ✅ マスタ | 医療システム | API | 🔴 **要実装** |

#### 解決策: 医療システムにコースマスタAPIを追加

**医療システム側**:
```typescript
// GET /api/career-courses/definitions
[
  {
    courseCode: "A",
    courseName: "Aコース（全面協力型）",
    description: "施設間異動・転居あり、管理職登用対象",
    departmentTransferAvailable: true,
    facilityTransferAvailable: "full",
    relocationRequired: true,
    nightShiftAvailable: "required",
    managementTrack: true,
    baseSalaryMultiplier: 1.2,
    isActive: true,
    displayOrder: 1
  },
  // B, C, D...
]
```

**VoiceDrive側**:
```typescript
// src/services/careerCourseService.ts (既に実装済み)
const courses = await getCourseDefinitions();
// UIでマッピング表示
```

---

### 3. 変更理由選択（223-265行目）

#### 表示内容
```typescript
// 27-32行目: 変更理由の定義
const CHANGE_REASONS = [
  { value: 'annual', label: '年1回定期変更', isSpecial: false },
  { value: 'special_pregnancy', label: '妊娠・出産', isSpecial: true },
  { value: 'special_caregiving', label: '介護', isSpecial: true },
  { value: 'special_illness', label: '疾病', isSpecial: true }
];
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 提供方法 | 状態 |
|---------|-----------|-------------|--------------|---------|------|
| 変更理由選択肢 | 🟡 ハードコード | 🟡 任意 | どちらでも可 | ローカル定義 | ✅ OK |

#### 評価
✅ **現状で問題なし**
- 変更理由は制度上固定（年1回 or 特例3種）
- VoiceDrive側でハードコーディングで問題なし
- 医療システムでマスタ化してもOK（柔軟性向上）

---

### 4. 理由詳細入力（267-290行目）

#### 表示内容
```typescript
// 273-278行目: テキストエリア
<textarea
  value={reasonDetail}
  onChange={(e) => setReasonDetail(e.target.value)}
  placeholder="コース変更を希望する理由を具体的に記入してください（最大1000文字）"
  rows={6}
/>
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 保存先 | 状態 |
|-----------|-----------|-------------|--------------|-------|------|
| 理由詳細テキスト | ❌ | ✅ マスタ | 医療システム | `career_course_change_requests.reasonDetail` | 🔴 **要実装** |

#### データフロー
```
VoiceDrive UI (入力)
  ↓
  POST /api/career-course/change-request
  ↓
  医療システム: career_course_change_requests.reasonDetail に保存
```

---

### 5. 希望適用日選択（292-312行目）

#### 表示内容
```typescript
// 298-303行目: 日付入力
<input
  type="date"
  value={requestedDate}
  onChange={(e) => setRequestedDate(e.target.value)}
  min={new Date().toISOString().split('T')[0]}
/>
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 保存先 | 状態 |
|-----------|-----------|-------------|--------------|-------|------|
| 希望適用日 | ❌ | ✅ マスタ | 医療システム | `career_course_change_requests.requestedEffectiveDate` | 🔴 **要実装** |

---

### 6. 添付ファイル（314-358行目）

#### 表示内容
```typescript
// 323-333行目: ファイルアップロード
<input
  type="file"
  multiple
  onChange={handleFileChange}
/>

// 115-117行目: アップロード処理（TODO）
// TODO: 添付ファイルのアップロード処理
// 現在はファイル名のみを送信（実装時はStorageにアップロード）
const attachmentUrls = attachments.map(f => f.name);
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 保存先 | 状態 |
|-----------|-----------|-------------|--------------|-------|------|
| 添付ファイルURL | ❌ | ✅ マスタ | 医療システム | S3/CloudFront | 🔴 **要実装** |
| ファイルメタデータ | ❌ | ✅ マスタ | 医療システム | `career_course_change_requests.attachments` (JSON) | 🔴 **要実装** |

#### 解決策: 医療システムにファイルアップロードAPIを追加

**医療システム側**:
```typescript
// POST /api/career-course/upload-attachment
// Request: multipart/form-data
{
  file: <binary>
}

// Response:
{
  fileUrl: "https://cdn.medical-system.local/attachments/EMP2024001_pregnancy_cert.pdf",
  fileName: "pregnancy_cert.pdf",
  fileSize: 2048576,
  uploadedAt: "2025-10-13T10:30:00Z"
}
```

**保存先**:
- S3バケット: `medical-system-career-attachments`
- CloudFrontで配信: `https://cdn.medical-system.local/attachments/`
- 暗号化: S3サーバー側暗号化（AES-256）
- アクセス制御: 署名付きURL（有効期限30日）

---

### 7. 申請送信（104-137行目、377-433行目）

#### 表示内容
```typescript
// 119-127行目: 申請送信処理
await submitChangeRequest({
  currentCourseCode: currentCourse,
  requestedCourseCode: selectedCourse!,
  changeReason: changeReason!,
  reasonDetail: reasonDetail.trim(),
  requestedEffectiveDate: requestedDate,
  attachments: attachmentUrls,
});

// 129-130行目: 成功後の処理
alert('コース変更申請を受け付けました。人事部の審査をお待ちください。');
navigate('/career-selection-station/my-requests');
```

#### 必要なデータソース

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 保存先 | 状態 |
|-----------|-----------|-------------|--------------|-------|------|
| 申請レコード全体 | ❌ | ✅ マスタ | 医療システム | `career_course_change_requests` | 🔴 **要実装** |

#### データフロー

```
VoiceDrive UI
  ↓ フォーム送信
  POST /api/career-course/change-request
  ↓
  医療システム
    - career_course_change_requests.create()
    - 初期ステータス: "pending"
    - 人事部へメール通知
  ↓
  レスポンス: { id, staffId, approvalStatus: "pending", message }
  ↓
  VoiceDrive: 成功メッセージ表示 → /my-requests へ遷移
```

---

## 📊 データ管理責任マトリクス

### カテゴリ1: コースマスタデータ

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| コース定義（A/B/C/D） | ❌ | ✅ マスタ | API | career_course_definitions |
| コース名・説明 | ❌ | ✅ マスタ | API | 制度変更に柔軟対応 |
| 給与係数 | ❌ | ✅ マスタ | API | 人事機密情報 |
| 異動・夜勤条件 | ❌ | ✅ マスタ | API | 制度設計 |

**方針**: コースマスタは100%医療システム管轄

---

### カテゴリ2: 現在のコース選択状況

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 現在のコース | ❌ | ✅ マスタ | API | career_course_selections |
| 適用開始日 | ❌ | ✅ マスタ | API | 承認後に確定 |
| 次回変更可能日 | ❌ | ✅ マスタ | API | 年1回制限の管理 |
| 特例変更理由 | ❌ | ✅ マスタ | API | 履歴として保存 |

**方針**: 現在のコース状況は100%医療システム管轄

---

### カテゴリ3: コース変更申請

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 申請ID | ❌ | ✅ マスタ | API | career_course_change_requests |
| 現在のコース | ❌ | ✅ マスタ | API | 申請時点の状態を記録 |
| 希望コース | ❌ | ✅ マスタ | API | |
| 変更理由 | ❌ | ✅ マスタ | API | annual/special_* |
| 理由詳細 | ❌ | ✅ マスタ | API | TEXT型（最大1000文字） |
| 希望適用日 | ❌ | ✅ マスタ | API | DATE型 |
| 添付ファイル | ❌ | ✅ マスタ | S3 + API | JSON配列でURL保存 |
| 承認ステータス | ❌ | ✅ マスタ | API | pending/approved/rejected |
| 人事審査コメント | ❌ | ✅ マスタ | API | 人事部のみ編集可 |
| 審査日時 | ❌ | ✅ マスタ | API | 承認・却下時に記録 |

**方針**: 申請データは100%医療システム管轄

---

### カテゴリ4: 職員基本情報（申請時に表示）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 職員名 | キャッシュ | ✅ マスタ | API | User.name |
| 部署 | キャッシュ | ✅ マスタ | API | User.department |
| 役職 | キャッシュ | ✅ マスタ | API | User.position |
| 施設 | キャッシュ | ✅ マスタ | API | User.facilityId |
| 入社日 | ❌ | ✅ マスタ | API | Employee.hireDate |

**方針**: VoiceDriveは表示用キャッシュのみ、マスタは医療システム

---

## 📋 必要なテーブル一覧

### 医療システム側で追加が必要（3テーブル）

#### 🔴 優先度: 高（即対応）

**A. career_course_definitions（コース定義マスタ）**
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
  management_track               BOOLEAN DEFAULT FALSE,
  base_salary_multiplier         DECIMAL(3,2) DEFAULT 1.00,
  salary_grade                   INT,
  salary_notes                   TEXT,
  is_active                      BOOLEAN DEFAULT TRUE,
  display_order                  INT DEFAULT 0,
  created_at                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_course_code (course_code),
  INDEX idx_is_active (is_active)
);
```

**初期データ**:
```sql
INSERT INTO career_course_definitions (course_code, course_name, description, ...) VALUES
('A', 'Aコース（全面協力型）', '施設間異動・転居あり、管理職登用対象', ...),
('B', 'Bコース（施設内協力型）', '施設内異動可、転居なし', ...),
('C', 'Cコース（専門職型）', '部署固定、専門性重視', ...),
('D', 'Dコース（時短・制約あり型）', '時短勤務、夜勤なし', ...);
```

---

**B. career_course_selections（現在のコース選択状況）**
```sql
CREATE TABLE career_course_selections (
  id                          VARCHAR(36) PRIMARY KEY,
  staff_id                    VARCHAR(36) NOT NULL,
  course_code                 CHAR(1) NOT NULL,
  effective_from              DATE NOT NULL,
  effective_to                DATE,
  next_change_available_date  DATE,
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
  INDEX idx_staff_id (staff_id),
  INDEX idx_course_code (course_code),
  INDEX idx_effective_dates (effective_from, effective_to),
  INDEX idx_approval_status (approval_status)
);
```

---

**C. career_course_change_requests（コース変更申請）**
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
  attachments                JSON,  -- [{"fileUrl": "...", "fileName": "...", "uploadedAt": "..."}]
  created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (current_course_code) REFERENCES career_course_definitions(course_code),
  FOREIGN KEY (requested_course_code) REFERENCES career_course_definitions(course_code),
  FOREIGN KEY (hr_reviewer_id) REFERENCES employees(employee_id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_approval_status (approval_status),
  INDEX idx_created_at (created_at DESC)
);
```

---

### VoiceDrive側で追加が必要（0テーブル）

**✅ VoiceDriveでのDB追加は不要**

理由:
- career-selection-stationは**申請フォームのUI**のみ
- データは全て医療システムで管理
- VoiceDriveはAPIクライアントとして動作

---

## 🎯 実装優先順位

### Phase 1: 医療システム基盤構築（3-4日）

**目標**: コース変更申請が送信できる

**医療システム側**:
1. 🔴 **テーブル作成**
   ```bash
   npx prisma migrate dev --name add_career_course_tables
   ```
   - career_course_definitions
   - career_course_selections
   - career_course_change_requests

2. 🔴 **初期データ投入**
   ```sql
   INSERT INTO career_course_definitions ...
   ```

3. 🔴 **API実装**
   - `GET /api/career-courses/definitions` (コース一覧)
   - `GET /api/my-page` (現在のコース含む)
   - `POST /api/career-course/change-request` (申請送信)
   - `POST /api/career-course/upload-attachment` (ファイルアップロード)

4. 🔴 **S3バケット作成**
   - バケット名: `medical-system-career-attachments`
   - CloudFront配信設定
   - 署名付きURL生成機能

**VoiceDrive側**:
- ✅ **既に実装済み**（ChangeRequestPage.tsx, careerCourseService.ts）
- 🟡 ファイルアップロード処理のTODOを実装
   ```typescript
   // Before: attachmentUrls = attachments.map(f => f.name);
   // After: 実際のアップロード処理
   ```

**このPhaseで動作する機能**:
- ✅ コース変更申請フォーム表示
- ✅ 現在のコース表示
- ✅ 希望コース選択
- ✅ 申請送信
- ✅ ファイルアップロード

---

### Phase 2: 申請管理機能（2-3日）

**目標**: 申請履歴の表示と管理

**医療システム側**:
1. 🔴 **API実装**
   - `GET /api/career-course/my-requests` (自分の申請履歴)
   - `GET /api/career-course/all-requests` (人事部用: 全申請)
   - `PUT /api/career-course/requests/:id/approve` (承認)
   - `PUT /api/career-course/requests/:id/reject` (却下)
   - `DELETE /api/career-course/requests/:id` (取り下げ)

2. 🔴 **通知機能**
   - 申請受付メール（申請者へ）
   - 新規申請通知メール（人事部へ）
   - 承認・却下通知メール（申請者へ）

**VoiceDrive側**:
- `MyRequestsPage.tsx` 実装（申請履歴表示）

---

### Phase 3: 承認フロー自動化（1-2日）

**目標**: 承認後のコース更新を自動化

**医療システム側**:
1. 🔴 **承認後処理**
   ```typescript
   // 承認時の処理
   async function approveChangeRequest(requestId: string, reviewerId: string) {
     const request = await getChangeRequest(requestId);

     // 1. 現在のコースを終了
     await closeCurrentCourseSelection(request.staffId);

     // 2. 新しいコースを開始
     await createCourseSelection({
       staffId: request.staffId,
       courseCode: request.requestedCourseCode,
       effectiveFrom: request.requestedEffectiveDate,
       approvedBy: reviewerId,
       approvalStatus: 'approved'
     });

     // 3. 申請ステータスを更新
     await updateChangeRequest(requestId, {
       approvalStatus: 'approved',
       reviewedAt: new Date(),
       hrReviewerId: reviewerId
     });

     // 4. 通知送信
     await sendApprovalNotification(request.staffId);
   }
   ```

---

## 📊 データフロー図

### フロー1: 申請送信

```
VoiceDrive UI (ChangeRequestPage)
  ↓ ユーザー入力
  ↓ フォーム送信
  POST /api/career-course/change-request
    Body: {
      currentCourseCode: "B",
      requestedCourseCode: "D",
      changeReason: "special_pregnancy",
      reasonDetail: "妊娠により...",
      requestedEffectiveDate: "2025-11-01",
      attachments: ["https://cdn.../cert.pdf"]
    }
  ↓
医療システム
  ↓ career_course_change_requests.create()
  ↓ approvalStatus = "pending"
  ↓ 人事部へメール通知
  ↓
  Response: { id, staffId, approvalStatus: "pending" }
  ↓
VoiceDrive UI
  ↓ 成功メッセージ表示
  ↓ /my-requests へ遷移
```

---

### フロー2: 人事部の審査

```
人事部
  ↓ 医療システム管理画面
  ↓ GET /api/career-course/all-requests
  ↓ 申請一覧表示
  ↓ 審査・判断
  ↓
  PUT /api/career-course/requests/:id/approve
    Body: { reviewComment: "承認します" }
  ↓
医療システム
  ↓ career_course_change_requests.update()
  ↓ career_course_selections.create() (新コース)
  ↓ career_course_selections.update() (旧コース終了)
  ↓ 申請者へメール通知
  ↓
  (オプション) Webhook → VoiceDrive
    POST /api/webhooks/career-course-changed
    Body: { staffId, newCourse: "D", effectiveDate: "2025-11-01" }
```

---

### フロー3: 現在のコース取得

```
VoiceDrive UI (ChangeRequestPage)
  ↓ ページ表示時
  ↓ GET /api/my-page
  ↓
医療システム
  ↓ employees.findOne()
  ↓ career_course_selections.findOne({ where: { effective_to: null } })
  ↓
  Response: {
    name: "山田 太郎",
    careerCourse: {
      courseCode: "B",
      courseName: "Bコース（施設内協力型）",
      effectiveFrom: "2024-04-01",
      nextChangeAvailableDate: "2025-04-01"
    }
  }
  ↓
VoiceDrive UI
  ↓ setCurrentCourse("B")
  ↓ 現在のコース表示
```

---

## ✅ チェックリスト

### 医療システム側の実装

#### Phase 1: 基盤構築
- [ ] **テーブル作成**: career_course_definitions
- [ ] **テーブル作成**: career_course_selections
- [ ] **テーブル作成**: career_course_change_requests
- [ ] **初期データ**: A/B/C/Dコース定義投入
- [ ] **API実装**: GET /api/career-courses/definitions
- [ ] **API実装**: GET /api/my-page（careerCourse追加）
- [ ] **API実装**: POST /api/career-course/change-request
- [ ] **API実装**: POST /api/career-course/upload-attachment
- [ ] **S3バケット**: career-attachments作成
- [ ] **CloudFront**: CDN配信設定
- [ ] **署名付きURL**: 生成機能実装
- [ ] **単体テスト**: API全エンドポイント
- [ ] **API仕様書**: OpenAPI 3.0ドキュメント作成

#### Phase 2: 申請管理
- [ ] **API実装**: GET /api/career-course/my-requests
- [ ] **API実装**: GET /api/career-course/all-requests（人事部用）
- [ ] **API実装**: PUT /api/career-course/requests/:id/approve
- [ ] **API実装**: PUT /api/career-course/requests/:id/reject
- [ ] **API実装**: DELETE /api/career-course/requests/:id（取り下げ）
- [ ] **メール通知**: 申請受付
- [ ] **メール通知**: 新規申請（人事部宛）
- [ ] **メール通知**: 承認・却下（申請者宛）

#### Phase 3: 自動化
- [ ] **承認後処理**: コース自動更新
- [ ] **Webhook**: VoiceDriveへの通知（オプション）
- [ ] **バリデーション**: 年1回制限チェック
- [ ] **バリデーション**: 特例変更の添付必須チェック

---

### VoiceDrive側の実装

#### Phase 1: 基盤構築
- [x] **UI実装**: ChangeRequestPage.tsx（完了）
- [x] **サービス層**: careerCourseService.ts（完了）
- [x] **型定義**: career-course.ts（完了）
- [ ] **TODO実装**: ファイルアップロード処理
  ```typescript
  // src/pages/career-selection-station/ChangeRequestPage.tsx 115-117行目
  // TODO: 添付ファイルのアップロード処理
  ```

#### Phase 2: 申請管理
- [ ] **UI実装**: MyRequestsPage.tsx（申請履歴表示）
- [ ] **API呼び出し**: getMyRequests()

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](../データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](../PersonalStation_DB要件分析_20251008.md)
- [共通DB構築後統合作業再開計画書](../共通DB構築後統合作業再開計画書_20251008.md)

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
次回レビュー: Phase 1実装後
