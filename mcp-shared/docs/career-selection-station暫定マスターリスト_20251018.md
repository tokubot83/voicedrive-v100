# キャリア選択ステーション 暫定マスターリスト

**作成日**: 2025年10月18日
**対象ページ**: キャリア選択ステーション (career-selection-station)
**データ管理責任**: 医療職員管理システム（単一真実の源）
**VoiceDrive役割**: リアルタイム表示・申請フォーム提供のみ

---

## 1. 医療職員管理システムへの実装依頼事項

### 1.1 データベーステーブル新規作成（3テーブル）

#### 1.1.1 career_course_definitions（キャリアコース定義マスタ）
```sql
CREATE TABLE career_course_definitions (
  id VARCHAR(36) PRIMARY KEY,
  course_code ENUM('A', 'B', 'C', 'D') NOT NULL UNIQUE,
  course_name VARCHAR(100) NOT NULL,
  description TEXT,
  department_transfer_available BOOLEAN DEFAULT TRUE,
  facility_transfer_level ENUM('none', 'limited', 'full') DEFAULT 'none',
  night_shift_available BOOLEAN DEFAULT TRUE,
  holiday_work_available BOOLEAN DEFAULT TRUE,
  management_track BOOLEAN DEFAULT FALSE,
  base_salary_multiplier DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_course_code (course_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**初期データ投入SQL**:
```sql
INSERT INTO career_course_definitions (id, course_code, course_name, description, department_transfer_available, facility_transfer_level, night_shift_available, holiday_work_available, management_track, base_salary_multiplier) VALUES
(UUID(), 'A', 'Aコース（全面協力型）', '施設間異動・管理職昇進・夜勤あり', TRUE, 'full', TRUE, TRUE, TRUE, 1.20),
(UUID(), 'B', 'Bコース（施設内協力型）', '施設内での部署異動・夜勤あり', TRUE, 'none', TRUE, TRUE, FALSE, 1.10),
(UUID(), 'C', 'Cコース（専門職型）', '異動なし・専門性重視・夜勤あり', FALSE, 'none', TRUE, TRUE, FALSE, 1.00),
(UUID(), 'D', 'Dコース（時短・制約あり型）', '育児・介護等の制約あり・夜勤なし', FALSE, 'none', FALSE, FALSE, FALSE, 0.90);
```

#### 1.1.2 career_course_selections（キャリアコース選択履歴）
```sql
CREATE TABLE career_course_selections (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_code ENUM('A', 'B', 'C', 'D') NOT NULL,
  effective_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  is_current BOOLEAN DEFAULT TRUE,
  selection_reason TEXT,
  approved_by VARCHAR(36),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_effective_date (effective_date),
  INDEX idx_is_current (is_current),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.1.3 career_course_change_requests（キャリアコース変更申請）
```sql
CREATE TABLE career_course_change_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  current_course_code ENUM('A', 'B', 'C', 'D') NOT NULL,
  requested_course_code ENUM('A', 'B', 'C', 'D') NOT NULL,
  change_reason ENUM('annual', 'special_pregnancy', 'special_caregiving', 'special_illness') NOT NULL,
  reason_detail TEXT NOT NULL,
  requested_effective_date DATE NOT NULL,
  attachment_url VARCHAR(512),
  status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  reviewed_by VARCHAR(36),
  review_comment TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 API エンドポイント実装（4エンドポイント）

#### API 1: マイページデータ取得
**エンドポイント**: `GET /api/v1/career-course/my-page`
**認証**: JWT Bearer Token（医療職員管理システム発行）
**権限**: 全職員（自身のデータのみ）

**レスポンス例**:
```json
{
  "staffInfo": {
    "userId": "staff-123",
    "name": "山田 太郎",
    "facilityName": "さくら総合病院",
    "departmentName": "内科病棟",
    "positionName": "看護師",
    "hireDate": "2020-04-01"
  },
  "currentCourse": {
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "effectiveDate": "2024-04-01",
    "salaryMultiplier": 1.10,
    "features": {
      "departmentTransfer": true,
      "facilityTransfer": false,
      "nightShift": true,
      "holidayWork": true,
      "managementTrack": false
    }
  },
  "canChangeThisYear": false,
  "nextChangeAvailableDate": "2025-03-01",
  "lastChangeDate": "2024-03-15"
}
```

#### API 2: コース定義一覧取得
**エンドポイント**: `GET /api/v1/career-course/definitions`
**認証**: JWT Bearer Token
**権限**: 全職員

**レスポンス例**:
```json
{
  "courses": [
    {
      "courseCode": "A",
      "courseName": "Aコース（全面協力型）",
      "description": "施設間異動・管理職昇進・夜勤あり",
      "salaryMultiplier": 1.20,
      "features": {
        "departmentTransfer": true,
        "facilityTransfer": "full",
        "nightShift": true,
        "holidayWork": true,
        "managementTrack": true
      }
    },
    {
      "courseCode": "B",
      "courseName": "Bコース（施設内協力型）",
      "description": "施設内での部署異動・夜勤あり",
      "salaryMultiplier": 1.10,
      "features": {
        "departmentTransfer": true,
        "facilityTransfer": "none",
        "nightShift": true,
        "holidayWork": true,
        "managementTrack": false
      }
    }
  ]
}
```

#### API 3: コース変更申請送信
**エンドポイント**: `POST /api/v1/career-course/change-requests`
**認証**: JWT Bearer Token
**権限**: 全職員（自身の申請のみ）

**リクエストボディ**:
```json
{
  "requestedCourseCode": "D",
  "changeReason": "special_pregnancy",
  "reasonDetail": "第一子妊娠のため、夜勤および休日勤務の免除を希望します。産前産後休暇後も育児のため時短勤務を継続予定です。",
  "requestedEffectiveDate": "2025-05-01",
  "attachmentFile": "<base64エンコードされたPDFファイル>",
  "attachmentFileName": "母子健康手帳.pdf"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "requestId": "req-456",
  "message": "コース変更申請を受け付けました。人事部門の承認をお待ちください。",
  "estimatedReviewDate": "2025-04-25",
  "attachmentUrl": "https://s3.ap-northeast-1.amazonaws.com/medical-system/career-course-attachments/staff-123/req-456/母子健康手帳.pdf"
}
```

#### API 4: 自分の申請履歴取得
**エンドポイント**: `GET /api/v1/career-course/my-requests`
**認証**: JWT Bearer Token
**権限**: 全職員（自身の申請のみ）

**クエリパラメータ**:
- `status`: pending | approved | rejected | withdrawn（省略時: 全て）
- `limit`: 取得件数（デフォルト: 20）
- `offset`: オフセット（デフォルト: 0）

**レスポンス例**:
```json
{
  "requests": [
    {
      "requestId": "req-456",
      "currentCourse": "B",
      "requestedCourse": "D",
      "changeReason": "special_pregnancy",
      "reasonDetail": "第一子妊娠のため...",
      "requestedEffectiveDate": "2025-05-01",
      "status": "pending",
      "createdAt": "2025-04-10T10:30:00Z",
      "attachmentUrl": "https://s3.ap-northeast-1.amazonaws.com/..."
    },
    {
      "requestId": "req-123",
      "currentCourse": "C",
      "requestedCourse": "B",
      "changeReason": "annual",
      "reasonDetail": "部署異動を希望するため...",
      "requestedEffectiveDate": "2024-04-01",
      "status": "approved",
      "createdAt": "2024-03-01T09:15:00Z",
      "reviewedBy": "HR担当者名",
      "reviewComment": "承認します。",
      "reviewedAt": "2024-03-05T14:20:00Z"
    }
  ],
  "total": 2,
  "statistics": {
    "totalRequests": 2,
    "pendingRequests": 1,
    "approvedRequests": 1,
    "rejectedRequests": 0
  }
}
```

### 1.3 Webhook通知実装（2種類）

#### Webhook 1: 申請承認通知
**送信タイミング**: 人事担当者が申請を承認した時
**送信先**: `https://voicedrive-api.example.com/webhooks/career-course/approved`
**HTTPメソッド**: POST
**認証**: HMAC-SHA256署名（X-Webhook-Signatureヘッダー）

**ペイロード例**:
```json
{
  "eventType": "career_course_request_approved",
  "timestamp": "2025-04-25T15:30:00Z",
  "data": {
    "requestId": "req-456",
    "userId": "staff-123",
    "requestedCourse": "D",
    "effectiveDate": "2025-05-01",
    "reviewedBy": "hr-001",
    "reviewComment": "承認します。産休・育休取得後も安心して働けるよう配慮します。",
    "reviewedAt": "2025-04-25T15:30:00Z"
  }
}
```

#### Webhook 2: 申請却下通知
**送信タイミング**: 人事担当者が申請を却下した時
**送信先**: `https://voicedrive-api.example.com/webhooks/career-course/rejected`
**HTTPメソッド**: POST
**認証**: HMAC-SHA256署名（X-Webhook-Signatureヘッダー）

**ペイロード例**:
```json
{
  "eventType": "career_course_request_rejected",
  "timestamp": "2025-04-25T15:30:00Z",
  "data": {
    "requestId": "req-789",
    "userId": "staff-456",
    "requestedCourse": "A",
    "reviewedBy": "hr-002",
    "reviewComment": "現在の部署で専門性を深めることを優先してください。来年度再度申請いただけます。",
    "reviewedAt": "2025-04-25T15:30:00Z"
  }
}
```

### 1.4 ファイルストレージ設定

**ストレージ種類**: AWS S3
**バケット名**: `medical-system-career-course-attachments`
**リージョン**: ap-northeast-1（東京）

**フォルダ構造**:
```
s3://medical-system-career-course-attachments/
  └── {user_id}/
      └── {request_id}/
          └── {filename}
```

**アクセス権限**:
- 職員本人: 自分のファイルのみ読み取り可能
- 人事担当者（レベル9以上）: 全ファイル読み取り可能
- システム管理者（レベル6以上）: 全ファイル読み書き可能

**ファイル保持期間**: 申請承認・却下後5年間

**許可ファイル形式**: PDF, PNG, JPG, JPEG（最大5MB）

### 1.5 セキュリティ要件

1. **認証**: JWT Bearer Token（有効期限24時間）
2. **認可**: 職員は自分のデータのみアクセス可能
3. **通信暗号化**: TLS 1.3以上必須
4. **個人情報保護**:
   - 添付ファイルは暗号化保存（AES-256）
   - アクセスログ記録（誰がいつどのファイルにアクセスしたか）
5. **CSRF対策**: APIはCORS設定で`https://voicedrive.example.com`のみ許可
6. **Webhook署名検証**: HMAC-SHA256で改ざん防止

---

## 2. VoiceDrive実装事項

### 2.1 既存実装の確認

以下のファイルは既に実装済み：

#### 2.1.1 ページコンポーネント
- ✅ `src/pages/career-selection-station/CareerSelectionStationPage.tsx`（マイキャリアページ）
- ✅ `src/pages/career-selection-station/ChangeRequestPage.tsx`（コース変更申請ページ）
- ✅ `src/pages/career-selection-station/MyRequestsPage.tsx`（申請履歴ページ）

#### 2.1.2 型定義
- ✅ `src/types/career-course.ts`（全型定義完備）

#### 2.1.3 サービスレイヤー
- ✅ `src/services/careerCourseService.ts`（API連携サービス）

#### 2.1.4 ルーティング
- ✅ `src/router/AppRouter.tsx`（3ページのルート設定済み）

#### 2.1.5 メニュー設定
- ✅ `src/config/menuConfig.ts`（ステーションメニューに登録済み）

### 2.2 必要な実装修正・追加

#### 2.2.1 環境変数設定
**ファイル**: `.env.production`

```env
# 医療職員管理システムAPI
VITE_MEDICAL_SYSTEM_API_URL=https://medical-system-api.example.com
VITE_MEDICAL_SYSTEM_JWT_SECRET=<医療システムから提供されるシークレット>

# Webhook検証用
VITE_WEBHOOK_SECRET=<医療システムと共有するHMACシークレット>

# AWS S3（添付ファイル表示用）
VITE_S3_REGION=ap-northeast-1
VITE_S3_BUCKET=medical-system-career-course-attachments
```

#### 2.2.2 Webhook受信エンドポイント実装
**新規ファイル**: `src/api/webhooks/career-course.ts`

```typescript
import { Request, Response } from 'express';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.VITE_WEBHOOK_SECRET!;

// Webhook署名検証
const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const hash = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  return signature === hash;
};

// 承認通知受信
export const handleApproved = async (req: Request, res: Response) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { requestId, userId, reviewComment } = req.body.data;

  // リアルタイム通知をフロントエンドに送信（WebSocket経由）
  // 実装はWebSocket統合時に追加

  res.status(200).json({ received: true });
};

// 却下通知受信
export const handleRejected = async (req: Request, res: Response) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { requestId, userId, reviewComment } = req.body.data;

  // リアルタイム通知をフロントエンドに送信（WebSocket経由）
  // 実装はWebSocket統合時に追加

  res.status(200).json({ received: true });
};
```

#### 2.2.3 APIサービスの認証トークン設定
**ファイル**: `src/services/careerCourseService.ts`

現在はモックデータを返しているが、実際のAPI呼び出しに変更：

```typescript
// 修正前（モック）
export const getMyPageData = async (): Promise<CareerCourseMyPageData> => {
  return mockData;
};

// 修正後（実API呼び出し）
export const getMyPageData = async (): Promise<CareerCourseMyPageData> => {
  const token = localStorage.getItem('medical_system_jwt'); // 医療システムから取得したトークン

  const response = await fetch(`${import.meta.env.VITE_MEDICAL_SYSTEM_API_URL}/api/v1/career-course/my-page`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new CareerCourseAPIError('マイページデータの取得に失敗しました');
  }

  return await response.json();
};
```

#### 2.2.4 ファイルアップロード処理の改善
**ファイル**: `src/pages/career-selection-station/ChangeRequestPage.tsx`

現在のBase64エンコード処理は実装済みだが、医療システムAPIのレスポンスに応じた処理を追加：

```typescript
// submitChangeRequest実行後のレスポンス処理
const response = await careerCourseService.submitChangeRequest(requestData);

if (response.success) {
  // 成功メッセージ表示
  toast.success(`申請を受け付けました（申請ID: ${response.requestId}）`);
  toast.info(`予定審査日: ${response.estimatedReviewDate}`);

  // 申請履歴ページへ遷移
  navigate('/career-selection-station/my-requests');
}
```

### 2.3 テスト実装

#### 2.3.1 単体テスト
**新規ファイル**: `src/services/__tests__/careerCourseService.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as careerCourseService from '../careerCourseService';

describe('careerCourseService', () => {
  it('マイページデータを正常取得できる', async () => {
    const data = await careerCourseService.getMyPageData();
    expect(data).toHaveProperty('staffInfo');
    expect(data).toHaveProperty('currentCourse');
  });

  it('コース定義一覧を正常取得できる', async () => {
    const courses = await careerCourseService.getCourseDefinitions();
    expect(courses).toHaveLength(4);
    expect(courses[0].courseCode).toBe('A');
  });

  it('変更申請を正常送信できる', async () => {
    const requestData = {
      requestedCourseCode: 'D' as const,
      changeReason: 'special_pregnancy' as const,
      reasonDetail: 'テスト理由',
      requestedEffectiveDate: '2025-05-01',
      attachmentFile: 'data:application/pdf;base64,JVBERi0xLjQK...'
    };

    const response = await careerCourseService.submitChangeRequest(requestData);
    expect(response.success).toBe(true);
    expect(response.requestId).toBeDefined();
  });
});
```

#### 2.3.2 統合テスト
**新規ファイル**: `tests/integration/career-course.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('キャリア選択ステーション統合テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    // ログイン処理
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/personal-station');
  });

  test('マイキャリアページが正常に表示される', async ({ page }) => {
    await page.goto('http://localhost:3001/career-selection-station');
    await expect(page.locator('h1')).toContainText('キャリア選択ステーション');
    await expect(page.locator('text=Bコース（施設内協力型）')).toBeVisible();
  });

  test('コース変更申請が正常に送信できる', async ({ page }) => {
    await page.goto('http://localhost:3001/career-selection-station/change-request');

    // コース選択
    await page.click('button:has-text("Dコース（時短・制約あり型）")');

    // 変更理由選択
    await page.selectOption('select[name="changeReason"]', 'special_pregnancy');

    // 理由詳細入力
    await page.fill('textarea[name="reasonDetail"]', 'テスト申請理由');

    // 希望適用日選択
    await page.fill('input[name="requestedEffectiveDate"]', '2025-05-01');

    // ファイル添付（モック）
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test-certificate.pdf');

    // 送信
    await page.click('button:has-text("申請内容を確認")');
    await page.click('button:has-text("申請を送信")');

    // 成功メッセージ確認
    await expect(page.locator('text=申請を受け付けました')).toBeVisible();
  });

  test('申請履歴ページが正常に表示される', async ({ page }) => {
    await page.goto('http://localhost:3001/career-selection-station/my-requests');
    await expect(page.locator('h2')).toContainText('申請履歴');
    await expect(page.locator('text=総申請数')).toBeVisible();
  });
});
```

---

## 3. 統合タイムライン

### Phase 1: DB・API開発（医療職員管理システム側）
**期間**: 2週間
**担当**: 医療システム開発チーム

- [ ] Week 1: データベーステーブル作成・初期データ投入
- [ ] Week 1: API 4エンドポイント開発
- [ ] Week 2: Webhook 2種類実装
- [ ] Week 2: AWS S3バケット設定・アクセス権限設定
- [ ] Week 2: 単体テスト・セキュリティテスト

### Phase 2: API統合（VoiceDrive側）
**期間**: 1週間
**担当**: VoiceDriveフロントエンド チーム

- [ ] Day 1-2: 環境変数設定・認証トークン連携実装
- [ ] Day 3-4: APIサービスのモック削除・実API呼び出し実装
- [ ] Day 5: Webhook受信エンドポイント実装
- [ ] Day 6-7: 単体テスト・統合テスト

### Phase 3: 統合テスト
**期間**: 1週間
**担当**: 両チーム合同

- [ ] Day 1-2: API接続テスト（全4エンドポイント）
- [ ] Day 3: Webhook送受信テスト
- [ ] Day 4: ファイルアップロード・ダウンロードテスト
- [ ] Day 5: セキュリティ・認証テスト
- [ ] Day 6-7: ユーザー受け入れテスト（UAT）

### Phase 4: 本番リリース
**期間**: 3日間
**担当**: 両チーム合同

- [ ] Day 1: ステージング環境デプロイ・最終確認
- [ ] Day 2: 本番環境デプロイ
- [ ] Day 3: 監視・問題対応

---

## 4. セキュリティチェックリスト

### 4.1 医療職員管理システム側
- [ ] JWT有効期限を24時間に設定
- [ ] トークンリフレッシュ機能実装
- [ ] APIレート制限設定（100リクエスト/分/ユーザー）
- [ ] SQLインジェクション対策（プリペアドステートメント使用）
- [ ] XSS対策（入力値サニタイズ）
- [ ] CSRF対策（CORS設定）
- [ ] S3バケット暗号化設定（AES-256）
- [ ] S3アクセスログ記録
- [ ] Webhook署名検証実装（HMAC-SHA256）
- [ ] 個人情報アクセスログ記録

### 4.2 VoiceDrive側
- [ ] JWT保存場所をLocalStorageからHttpOnly Cookieに変更（XSS対策）
- [ ] APIリクエストにCSRFトークン追加
- [ ] ファイルアップロード時の拡張子・MIMEタイプ検証
- [ ] ファイルサイズ制限（5MB）
- [ ] Webhook署名検証実装
- [ ] エラーメッセージに機密情報を含めない
- [ ] HTTPS通信強制（HSTSヘッダー）

---

## 5. 運用監視項目

### 5.1 パフォーマンス監視
- [ ] API応答時間（目標: 500ms以下）
- [ ] ファイルアップロード成功率（目標: 99%以上）
- [ ] Webhook配信成功率（目標: 99%以上）
- [ ] S3ストレージ使用量（月次）

### 5.2 エラー監視
- [ ] API 5xx エラー率（目標: 0.1%以下）
- [ ] 認証失敗回数（異常検知: 10回/分/ユーザー）
- [ ] ファイルアップロード失敗回数
- [ ] Webhook配信失敗回数

### 5.3 セキュリティ監視
- [ ] 不正アクセス試行検知（401/403エラー急増）
- [ ] 大量ファイルアップロード検知（DoS対策）
- [ ] 個人情報アクセスログ異常検知
- [ ] JWT有効期限切れエラー頻度

---

## 6. ロールバック計画

### 6.1 データベース
**ロールバック方法**: マイグレーションスクリプト作成済み

```sql
-- ロールバックSQL
DROP TABLE IF EXISTS career_course_change_requests;
DROP TABLE IF EXISTS career_course_selections;
DROP TABLE IF EXISTS career_course_definitions;
```

### 6.2 API
**ロールバック方法**: 前バージョンのDockerイメージにロールバック

```bash
# 医療システムAPI
docker pull medical-system-api:v2.3.1  # 前バージョン
docker-compose up -d
```

### 6.3 VoiceDrive
**ロールバック方法**: Vercelデプロイメント履歴から前バージョンに切り替え

```bash
# Vercel CLI
vercel rollback
```

### 6.4 S3バケット
**ロールバック方法**: バケットバージョニング有効化済み

```bash
# AWS CLI
aws s3api list-object-versions --bucket medical-system-career-course-attachments
aws s3api delete-object --bucket ... --key ... --version-id ...
```

---

## 7. 担当者連絡先

### 7.1 医療職員管理システム
- **開発リード**: 田中太郎（tanaka@medical-system.example.com）
- **バックエンドエンジニア**: 佐藤花子（sato@medical-system.example.com）
- **インフラエンジニア**: 鈴木一郎（suzuki@medical-system.example.com）

### 7.2 VoiceDrive
- **開発リード**: 山田次郎（yamada@voicedrive.example.com）
- **フロントエンドエンジニア**: 高橋美咲（takahashi@voicedrive.example.com）
- **QAエンジニア**: 伊藤健太（ito@voicedrive.example.com）

### 7.3 プロジェクトマネージャー
- **統合PM**: 中村由美（nakamura@example.com）
- **Slackチャンネル**: #career-course-integration

---

## 8. 補足資料

### 8.1 関連ドキュメント
- [データ管理責任分界点定義書](./データ管理責任分界点定義書.md)
- [キャリア選択ステーションDB要件分析](./career-selection-station_DB要件分析_20251018.md)
- [医療職員管理システムAPI仕様書](https://medical-system-docs.example.com/api/v1/)

### 8.2 技術スタック
- **医療職員管理システム**: TypeScript + Next.js + Prisma + MySQL 8.0
- **VoiceDrive**: TypeScript + React + Vite + TailwindCSS
- **インフラ**: AWS (EC2, RDS, S3, CloudFront)
- **認証**: JWT (HS256)
- **通信**: HTTPS/TLS 1.3

---

**作成者**: Claude (AI Assistant)
**最終更新日**: 2025年10月18日
**バージョン**: 1.0
