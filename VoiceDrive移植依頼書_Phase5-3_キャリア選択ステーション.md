# VoiceDrive移植依頼書: Phase 5-3 キャリア選択ステーション実装

**作成日**: 2025年10月1日
**作成者**: 医療システムチーム（Claude Code）
**依頼先**: VoiceDriveチーム
**優先度**: 高
**期限**: 2025年10月末

---

## 📋 目次

1. [依頼概要](#1-依頼概要)
2. [背景・目的](#2-背景目的)
3. [システム統合構成](#3-システム統合構成)
4. [実装済みコード提供](#4-実装済みコード提供)
5. [VoiceDrive側実装手順](#5-voicedrive側実装手順)
6. [API仕様書](#6-api仕様書)
7. [画面遷移図](#7-画面遷移図)
8. [テストデータ](#8-テストデータ)

---

## 1. 依頼概要

### 依頼内容

**Phase 5-3「キャリア選択ステーション」をVoiceDriveに実装してください。**

医療システム側で実装済みの職員向けキャリアコース機能（3画面 + 4 API）を、VoiceDriveの左サイドバーに「キャリア選択ステーション」として統合する。

### 提供物

- ✅ 完全実装済みのReact/TypeScriptコード（3画面、1,200行）
- ✅ APIエンドポイント仕様書（4エンドポイント）
- ✅ モックデータ
- ✅ バリデーションロジック
- ✅ UIコンポーネント（shadcn/ui使用）

### 期待される成果物

- VoiceDrive左サイドバーに「キャリア選択ステーション」メニュー追加
- マイキャリア情報表示画面
- コース変更申請フォーム画面
- 申請状況確認画面
- 医療システムAPIとの連携

---

## 2. 背景・目的

### Phase 5 キャリア選択制度とは

川畑法人統括事務局長の指示により、2025年9月から実装開始した新しい人事制度。

**A～D 4コース体系**:
- **Aコース（全面協力型）**: 施設間異動可、管理職候補、基本給係数1.2倍
- **Bコース（施設内協力型）**: 施設内の部署異動のみ、管理職候補、基本給係数1.1倍
- **Cコース（専門職型）**: 異動なし、夜勤選択可、基本給係数1.0倍
- **Dコース（時短・制約あり型）**: 育児・介護対応、夜勤なし、基本給係数0.9倍

### なぜVoiceDriveに実装するのか

**理由1: 職員向けSNSとしての位置づけ**
- VoiceDriveは既に職員向けアプリとして稼働中
- 左サイドバーで「ホーム」「タイムライン」「メッセージ」「通知」「面談予約」等を提供
- キャリア選択も職員向け機能のため、VoiceDriveに統合するのが自然

**理由2: 人事部の業務分離**
- 医療システム = 人事部が管理・審査する機能
- VoiceDrive = 職員が自分で使う機能

**理由3: ユーザー体験の一貫性**
- 職員は1つのアプリで全ての自己サービスを完結できる
- 認証も1回で済む

---

## 3. システム統合構成

### 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                      VoiceDrive System                           │
│                  (職員向けSNS・自己サービス)                      │
├─────────────────────────────────────────────────────────────────┤
│ 左サイドバー                                                      │
│  ├── ホーム                                                       │
│  ├── タイムライン                                                 │
│  ├── メッセージ                                                   │
│  ├── 通知                                                         │
│  ├── 面談予約 ← 既存機能                                         │
│  ├── 🆕 キャリア選択ステーション ← NEW (Phase 5-3)               │
│  │    ├── マイキャリア情報                                       │
│  │    ├── コース変更申請                                         │
│  │    └── 申請状況確認                                           │
│  └── 設定                                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓ API連携
┌─────────────────────────────────────────────────────────────────┐
│                    Medical HR System                             │
│                  (人事部向け管理システム)                         │
├─────────────────────────────────────────────────────────────────┤
│ トップナビゲーション                                              │
│  ├── お知らせ配信                                                 │
│  ├── 人事ステーション                                             │
│  ├── カルテ                                                       │
│  ├── 採用                                                         │
│  ├── 面談                                                         │
│  ├── 教育・研修                                                   │
│  ├── 目標                                                         │
│  ├── 健康                                                         │
│  ├── 勤怠                                                         │
│  ├── 🆕 キャリア選択 ← NEW (Phase 5-2)                          │
│  │    └── /admin/career-courses                                  │
│  │         ├── コース概要                                         │
│  │         ├── 変更申請審査 ← VoiceDriveからの申請を受信         │
│  │         ├── コース定義管理                                     │
│  │         └── 統計・分析                                         │
│  └── 評価                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### データフロー

```
職員（VoiceDrive）                  医療システム
     │                                    │
     │  1. マイキャリア情報を表示           │
     │ ──────────────────────────────────>│
     │      GET /api/my-page              │
     │ <──────────────────────────────────│
     │    (現在のコース情報を返却)          │
     │                                    │
     │  2. コース変更申請を送信            │
     │ ──────────────────────────────────>│
     │ POST /api/career-course/change-request │
     │ <──────────────────────────────────│
     │    (申請受付完了)                   │
     │                                    │
     │                                    │
     │                                    ↓
     │                          人事部が審査・承認/却下
     │                    (/admin/career-courses → 変更申請審査タブ)
     │                                    │
     │  3. 承認/却下通知（Webhook）         │
     │ <──────────────────────────────────│
     │  POST /voicedrive/career-course/notify │
     │                                    │
     │  4. 申請状況確認                    │
     │ ──────────────────────────────────>│
     │ GET /api/career-course/my-requests │
     │ <──────────────────────────────────│
     │    (申請履歴・審査結果を返却)        │
```

---

## 4. 実装済みコード提供

### 提供ファイル一覧

#### フロントエンド（3画面）

**1. マイキャリア情報表示**
- ファイルパス: `src/app/my-page/page.tsx` (270行)
- 機能:
  - 職員基本情報カード
  - 現在のキャリアコース表示（CareerCourseCardコンポーネント）
  - クイックアクション（コース変更申請、申請状況確認）
- 使用コンポーネント: Card, Badge, lucide-react icons
- レスポンシブ: lg:3カラムレイアウト

**2. コース変更申請フォーム**
- ファイルパス: `src/app/my-page/career-course/change-request/page.tsx` (400行)
- 機能:
  - 現在のコース表示
  - コース選択カード（A/B/C/D、色分け、クリックで選択）
  - 変更理由選択（年1回定期 / 妊娠・出産 / 介護 / 疾病）
  - 変更理由詳細入力（textarea）
  - 希望適用日選択（date picker）
  - ファイル添付（特例変更時必須、複数ファイル対応）
  - 確認モーダル（申請内容の最終確認）
  - バリデーション完備
- バリデーション:
  - コース選択必須
  - 変更理由必須
  - 特例変更の場合は添付ファイル必須
  - 希望適用日は今日以降

**3. 申請状況確認画面**
- ファイルパス: `src/app/my-page/career-course/my-requests/page.tsx` (500行)
- 機能:
  - 統計サマリーカード（総申請数、承認待ち、承認済み、却下）
  - 申請履歴一覧（コース変更内容、事由、日付、ステータスバッジ）
  - 詳細表示モード（申請ID、変更内容、事由、添付ファイル、審査結果）
  - 審査コメント・却下理由表示
  - 申請取下げボタン（承認待ちのみ、UI実装済み）
- モックデータ: 3件の申請例

#### バックエンド（4 API）

**1. GET /api/my-page**
- ファイルパス: `src/app/api/my-page/route.ts`
- 機能: 職員基本情報 + キャリアコース情報取得
- レスポンス: StaffDetail型（careerCourseフィールド含む）

**2. GET /api/career-courses/definitions**
- ファイルパス: `src/app/api/career-courses/definitions/route.ts`
- 機能: A～D コース定義一覧取得
- レスポンス: CourseDefinition[] 配列

**3. POST /api/career-course/change-request**
- ファイルパス: `src/app/api/career-course/change-request/route.ts`
- 機能: コース変更申請送信
- リクエスト: currentCourseCode, requestedCourseCode, changeReason, reasonDetail, requestedEffectiveDate, attachments
- バリデーション: コース情報、変更事由、適用日、添付ファイル必須判定

**4. GET /api/career-course/my-requests**
- ファイルパス: `src/app/api/career-course/my-requests/route.ts`
- 機能: 申請履歴取得
- レスポンス: CareerCourseChangeRequest[] 配列（新しい順ソート）

#### 共通コンポーネント

**CareerCourseCard.tsx**
- ファイルパス: `src/components/career-course/CareerCourseCard.tsx` (280行)
- 機能:
  - 現在のコース表示（A/B/C/D、色分け）
  - 部署異動・施設間異動・夜勤・管理職登用の条件表示
  - 基本給係数表示
  - 次回変更可能日と残日数表示
  - 特例変更事由の表示（妊娠・介護・疾病）
  - コース変更申請ボタン（将来実装用UI）

#### TypeScript型定義

**src/types/staff.ts** からの抜粋:

```typescript
export type CareerCourseCode = 'A' | 'B' | 'C' | 'D'
export type FacilityTransferLevel = 'none' | 'limited' | 'full'
export type NightShiftAvailability = 'none' | 'selectable' | 'required'
export type CourseChangeReason =
  | 'annual'
  | 'special_pregnancy'
  | 'special_caregiving'
  | 'special_illness'
export type SpecialChangeReason =
  | 'pregnancy'
  | 'caregiving'
  | 'illness'
  | null

export interface CourseDefinition {
  id: string
  courseCode: CareerCourseCode
  courseName: string
  description: string
  departmentTransferAvailable: boolean
  facilityTransferAvailable: FacilityTransferLevel
  relocationRequired: boolean
  nightShiftAvailable: NightShiftAvailability
  managementTrack: boolean
  baseSalaryMultiplier: number
  salaryGrade: number | null
  salaryNotes: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CareerCourseSelection {
  id: string
  staffId: string
  courseCode: CareerCourseCode
  courseName?: string
  effectiveFrom: string
  effectiveTo: string | null
  nextChangeAvailableDate: string | null
  specialChangeReason: SpecialChangeReason
  specialChangeNote: string | null
  changeRequestedAt: string | null
  changeRequestedBy: string | null
  approvedAt: string | null
  approvedBy: string | null
  approvalStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CareerCourseChangeRequest {
  id: string
  staffId: string
  staffName?: string
  facility?: string
  department?: string
  position?: string
  currentCourseCode: CareerCourseCode
  requestedCourseCode: CareerCourseCode
  changeReason: CourseChangeReason
  reasonDetail: string
  requestedEffectiveDate: string
  hrReviewerId: string | null
  hrReviewerName: string | null
  reviewedAt: string | null
  reviewComment: string | null
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  rejectionReason: string | null
  withdrawnAt: string | null
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export interface StaffDetail {
  // ... 既存フィールド
  careerCourse?: CareerCourseSelection // 追加
}
```

---

## 5. VoiceDrive側実装手順

### Step 1: 左サイドバーにメニュー追加

**ファイル**: `components/Sidebar.tsx` (または相当するファイル)

```typescript
const menuItems = [
  { icon: HomeIcon, label: 'ホーム', href: '/home' },
  { icon: TimelineIcon, label: 'タイムライン', href: '/timeline' },
  { icon: MessageIcon, label: 'メッセージ', href: '/messages' },
  { icon: BellIcon, label: '通知', href: '/notifications' },
  { icon: CalendarIcon, label: '面談予約', href: '/interviews' },
  // 🆕 追加
  {
    icon: TrendingUpIcon,
    label: 'キャリア選択ステーション',
    href: '/career-selection-station',
    badge: pendingRequestsCount // 承認待ち申請がある場合にバッジ表示
  },
  { icon: SettingsIcon, label: '設定', href: '/settings' },
]
```

### Step 2: ルーティング設定

**VoiceDrive側のルーティング構成**:

```
/career-selection-station                          ← マイキャリア情報
/career-selection-station/change-request          ← コース変更申請フォーム
/career-selection-station/my-requests              ← 申請状況確認
```

### Step 3: 既存コードの移植

**移植手順**:

1. **ファイルコピー**:
   ```
   医療システム側                     VoiceDrive側
   ────────────────────────────────────────────────────────
   src/app/my-page/page.tsx        → pages/career-selection-station/index.tsx
   src/app/my-page/career-course/
     change-request/page.tsx       → pages/career-selection-station/change-request.tsx
   src/app/my-page/career-course/
     my-requests/page.tsx          → pages/career-selection-station/my-requests.tsx

   src/components/career-course/
     CareerCourseCard.tsx          → components/career-course/CareerCourseCard.tsx

   src/types/staff.ts (抜粋)       → types/career-course.ts (新規作成)
   ```

2. **認証の統合**:
   - VoiceDriveの既存認証システム（useAuth() など）に置き換え
   - 医療システムのコメントアウトされた認証コードを削除
   - VoiceDriveのユーザーIDを staffId として使用

3. **API接続の変更**:
   - 医療システムのAPIエンドポイントを呼び出し
   - 環境変数で医療システムのベースURLを設定
   ```typescript
   const MEDICAL_SYSTEM_API = process.env.NEXT_PUBLIC_MEDICAL_SYSTEM_API || 'https://medical.system.local'

   // マイページデータ取得
   const response = await fetch(`${MEDICAL_SYSTEM_API}/api/my-page`, {
     headers: {
       'Authorization': `Bearer ${voiceDriveToken}`,
       'Content-Type': 'application/json'
     }
   })
   ```

4. **デザインシステムの調整**:
   - VoiceDriveのUIコンポーネントライブラリに合わせる
   - 医療システムは shadcn/ui を使用しているため、VoiceDriveも同じなら変更不要
   - カラースキーム・フォント・スペーシングをVoiceDrive仕様に調整

5. **エラーハンドリング**:
   - VoiceDriveの共通エラートーストに統合
   - 医療システムAPIとの通信エラー時の適切な表示

### Step 4: Webhook受信エンドポイント実装

**VoiceDrive側に実装が必要**:

```typescript
// pages/api/career-course/notify.ts (VoiceDrive側)
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 医療システムからの認証
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.MEDICAL_SYSTEM_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { type, staffId, requestId, approvedCourse, rejectionReason } = req.body

  // VoiceDrive内部の通知システムに送信
  if (type === 'course_change_approved') {
    await sendNotificationToStaff(staffId, {
      title: 'コース変更申請が承認されました',
      body: `${approvedCourse}コースへの変更が承認されました。`,
      link: '/career-selection-station/my-requests'
    })
  } else if (type === 'course_change_rejected') {
    await sendNotificationToStaff(staffId, {
      title: 'コース変更申請が却下されました',
      body: `理由: ${rejectionReason}`,
      link: '/career-selection-station/my-requests'
    })
  }

  res.status(200).json({ success: true })
}
```

### Step 5: テスト

**テスト項目**:

1. ✅ 左サイドバーに「キャリア選択ステーション」が表示される
2. ✅ マイキャリア情報画面で現在のコースが表示される
3. ✅ コース変更申請フォームで A/B/C/D コースを選択できる
4. ✅ 特例変更選択時に添付ファイルが必須になる
5. ✅ 申請送信後、医療システムに申請が届く
6. ✅ 医療システム側で承認/却下処理を行う
7. ✅ VoiceDrive側に通知が届く
8. ✅ 申請状況確認画面で審査結果が確認できる

---

## 6. API仕様書

### 認証

**医療システムAPIへのアクセス**:
- VoiceDriveのJWTトークンを `Authorization: Bearer <token>` ヘッダーで送信
- 医療システム側でVoiceDriveトークンを検証

**環境変数（VoiceDrive側）**:
```env
NEXT_PUBLIC_MEDICAL_SYSTEM_API=https://medical.system.local
MEDICAL_SYSTEM_API_KEY=vd_prod_key_A8B9C2D3E4F5G6H7I8J9K0L1M2N3O4P5
```

### API 1: マイページデータ取得

**エンドポイント**: `GET /api/my-page`

**リクエストヘッダー**:
```
Authorization: Bearer <VoiceDrive JWT Token>
```

**レスポンス** (200 OK):
```json
{
  "id": "OH-NS-2021-001",
  "name": "山田 花子",
  "facility": "小原病院",
  "department": "3階病棟",
  "position": "看護師",
  "joinDate": "2021-04-01",
  "careerCourse": {
    "id": "cc-001",
    "staffId": "OH-NS-2021-001",
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "effectiveFrom": "2025-04-01",
    "effectiveTo": null,
    "nextChangeAvailableDate": "2026-03-01",
    "approvalStatus": "approved"
  }
}
```

### API 2: コース定義一覧取得

**エンドポイント**: `GET /api/career-courses/definitions`

**リクエストヘッダー**:
```
Authorization: Bearer <VoiceDrive JWT Token>
```

**レスポンス** (200 OK):
```json
[
  {
    "id": "course-def-a",
    "courseCode": "A",
    "courseName": "Aコース（全面協力型）",
    "description": "部署・施設間異動に全面協力し、管理職候補として育成対象。転居を伴う転勤も受諾。夜勤あり。",
    "departmentTransferAvailable": true,
    "facilityTransferAvailable": "full",
    "nightShiftAvailable": "required",
    "managementTrack": true,
    "baseSalaryMultiplier": 1.2,
    "isActive": true
  },
  {
    "id": "course-def-b",
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "description": "同一施設内の部署異動（病棟移動等）に対応。施設間異動なし。管理職登用対象。夜勤あり。",
    "departmentTransferAvailable": true,
    "facilityTransferAvailable": "none",
    "nightShiftAvailable": "required",
    "managementTrack": true,
    "baseSalaryMultiplier": 1.1,
    "isActive": true
  }
]
```

### API 3: コース変更申請送信

**エンドポイント**: `POST /api/career-course/change-request`

**リクエストヘッダー**:
```
Authorization: Bearer <VoiceDrive JWT Token>
Content-Type: application/json
```

**リクエストボディ**:
```json
{
  "currentCourseCode": "B",
  "requestedCourseCode": "A",
  "changeReason": "annual",
  "reasonDetail": "管理職候補として、施設間異動を含む全面協力型コースへの変更を希望します。",
  "requestedEffectiveDate": "2026-04-01",
  "attachments": []
}
```

**バリデーション**:
- `currentCourseCode`: 必須、A/B/C/Dのいずれか
- `requestedCourseCode`: 必須、A/B/C/Dのいずれか
- `changeReason`: 必須、annual | special_pregnancy | special_caregiving | special_illness
- `reasonDetail`: 必須、最大1000文字
- `requestedEffectiveDate`: 必須、ISO 8601形式、今日以降の日付
- `attachments`: 配列、特例変更の場合は必須（1ファイル以上）

**レスポンス** (201 Created):
```json
{
  "id": "req-20251001-001",
  "staffId": "OH-NS-2021-001",
  "approvalStatus": "pending",
  "createdAt": "2025-10-01T10:30:00Z",
  "message": "申請を受け付けました。人事部の審査をお待ちください。"
}
```

**エラーレスポンス** (400 Bad Request):
```json
{
  "error": "特例変更の場合は証明書類の添付が必要です"
}
```

### API 4: 申請履歴取得

**エンドポイント**: `GET /api/career-course/my-requests`

**リクエストヘッダー**:
```
Authorization: Bearer <VoiceDrive JWT Token>
```

**レスポンス** (200 OK):
```json
[
  {
    "id": "req-003",
    "staffId": "OH-NS-2021-001",
    "currentCourseCode": "B",
    "requestedCourseCode": "A",
    "changeReason": "annual",
    "reasonDetail": "管理職候補として...",
    "requestedEffectiveDate": "2026-04-01",
    "hrReviewerId": null,
    "hrReviewerName": null,
    "reviewedAt": null,
    "reviewComment": null,
    "approvalStatus": "pending",
    "rejectionReason": null,
    "createdAt": "2025-09-25T10:30:00Z",
    "updatedAt": "2025-09-25T10:30:00Z"
  },
  {
    "id": "req-002",
    "staffId": "OH-NS-2021-001",
    "currentCourseCode": "C",
    "requestedCourseCode": "B",
    "changeReason": "annual",
    "reasonDetail": "部署異動に対応可能となったため...",
    "requestedEffectiveDate": "2025-04-01",
    "hrReviewerId": "HR-001",
    "hrReviewerName": "人事部長",
    "reviewedAt": "2024-03-20T15:00:00Z",
    "reviewComment": "職務能力を評価し、承認します。",
    "approvalStatus": "approved",
    "rejectionReason": null,
    "createdAt": "2024-03-01T09:00:00Z",
    "updatedAt": "2024-03-20T15:00:00Z"
  }
]
```

### API 5: Webhook通知受信（VoiceDrive側実装）

**エンドポイント**: `POST /api/career-course/notify` (VoiceDrive側)

**リクエストヘッダー** (医療システムから):
```
Authorization: Bearer <Medical System API Key>
Content-Type: application/json
```

**リクエストボディ（承認時）**:
```json
{
  "type": "course_change_approved",
  "staffId": "OH-NS-2021-001",
  "requestId": "req-003",
  "approvedCourse": "A",
  "effectiveDate": "2026-04-01",
  "reviewComment": "管理職候補として適性を認めます。"
}
```

**リクエストボディ（却下時）**:
```json
{
  "type": "course_change_rejected",
  "staffId": "OH-NS-2021-001",
  "requestId": "req-003",
  "rejectionReason": "現在の勤務状況から、来年度の変更が望ましいと判断しました。",
  "reviewComment": "再度、2027年4月での変更申請をご検討ください。"
}
```

**VoiceDrive側の処理**:
1. 認証確認（Medical System API Key）
2. staffId の職員にプッシュ通知送信
3. 通知センターに追加
4. メール通知（オプション）

**レスポンス** (200 OK):
```json
{
  "success": true,
  "notificationSent": true
}
```

---

## 7. 画面遷移図

```
┌──────────────────────────────────────────────────────────────┐
│                   VoiceDrive ホーム画面                       │
│                                                              │
│  左サイドバー:                                                │
│   ├── ホーム                                                  │
│   ├── タイムライン                                            │
│   ├── メッセージ                                              │
│   ├── 通知                                                    │
│   ├── 面談予約                                                │
│   ├── 🆕 キャリア選択ステーション ← クリック                  │
│   └── 設定                                                    │
└──────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────┐
│           キャリア選択ステーション トップ画面                  │
│           (/career-selection-station)                        │
├──────────────────────────────────────────────────────────────┤
│   山田 花子                                                   │
│   小原病院 3階病棟 / 看護師                                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │          CareerCourseCard                            │      │
│  │  ┌─────────────────────────────────────────────┐   │      │
│  │  │ B  Bコース（施設内協力型）                    │   │      │
│  │  │ 適用開始: 2025-04-01                          │   │      │
│  │  ├─────────────────────────────────────────────┤   │      │
│  │  │ □ 部署異動: 可                                │   │      │
│  │  │ □ 施設間異動: 施設内のみ                      │   │      │
│  │  │ □ 夜勤: 必須                                  │   │      │
│  │  │ □ 管理職登用: 対象                            │   │      │
│  │  │ □ 基本給係数: 1.10倍                          │   │      │
│  │  │                                               │   │      │
│  │  │ 次回変更可能日: 2026-03-01 (あと150日)        │   │      │
│  │  └─────────────────────────────────────────────┘   │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
│  【クイックアクション】                                        │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │ 📋 コース変更申請│  │ 📊 申請状況確認 │                     │
│  │      →          │  │      →          │                     │
│  └────────────────┘  └────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
       │                            │
       ↓                            ↓
┌──────────────────────────────┐  ┌───────────────────────────────┐
│   コース変更申請フォーム       │  │   申請状況確認画面             │
│   (/career-selection-station/ │  │   (/career-selection-station/ │
│    change-request)            │  │    my-requests)               │
├──────────────────────────────┤  ├───────────────────────────────┤
│                              │  │  【統計サマリー】               │
│  【現在のコース】              │  │  総申請数: 3件                 │
│  B  Bコース（施設内協力型）    │  │  承認待ち: 1件                 │
│                              │  │  承認済み: 1件                 │
│  【希望するコース】            │  │  却下: 1件                     │
│  ┌────┐ ┌────┐ ┌────┐      │  │                               │
│  │ A  │ │ C  │ │ D  │      │  │  【申請一覧】                   │
│  │全面│ │専門│ │時短│      │  │  ┌──────────────────────┐   │
│  └────┘ └────┘ └────┘      │  │  │ B → A  定期変更        │   │
│         ↑ 選択              │  │  │ 2025-09-25             │   │
│                              │  │  │ ⏳ 承認待ち            │   │
│  【変更理由】                  │  │  └──────────────────────┘   │
│  ○ 年1回定期変更              │  │  ┌──────────────────────┐   │
│  ○ 妊娠・出産                 │  │  │ C → B  定期変更        │   │
│  ○ 介護                      │  │  │ 2024-03-01             │   │
│  ○ 疾病                      │  │  │ ✅ 承認済み            │   │
│                              │  │  │ 人事部長:              │   │
│  【理由詳細】                  │  │  │ 職務能力を             │   │
│  ┌────────────────────┐      │  │  │ 評価し、承認します。   │   │
│  │管理職候補として、    │      │  │  └──────────────────────┘   │
│  │施設間異動を含む...   │      │  │  ┌──────────────────────┐   │
│  └────────────────────┘      │  │  │ C → D  特例(介護)      │   │
│                              │  │  │ 2023-09-10             │   │
│  【希望適用日】                │  │  │ ❌ 却下                │   │
│  2026-04-01                  │  │  │ 却下理由: 勤務調整で   │   │
│                              │  │  │ 対応可能なため         │   │
│  【添付ファイル】              │  │  └──────────────────────┘   │
│  (特例変更の場合は必須)        │  └───────────────────────────────┘
│                              │
│  [確認画面へ]                 │
└──────────────────────────────┘
           │
           ↓ POST /api/career-course/change-request
           │
┌──────────────────────────────┐
│  送信完了画面                 │
│                              │
│  ✓ 申請を受け付けました       │
│                              │
│  人事部の審査をお待ちください  │
│                              │
│  [申請状況を確認] → /my-requests
└──────────────────────────────┘
```

---

## 8. テストデータ

### モックユーザー（VoiceDrive側テスト用）

```json
{
  "id": "OH-NS-2021-001",
  "name": "山田 花子",
  "nameInitial": "YH",
  "facility": "小原病院",
  "department": "3階病棟",
  "position": "看護師",
  "email": "yamada.hanako@example.com",
  "careerCourse": {
    "id": "cc-001",
    "staffId": "OH-NS-2021-001",
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "effectiveFrom": "2025-04-01",
    "effectiveTo": null,
    "nextChangeAvailableDate": "2026-03-01",
    "approvalStatus": "approved"
  }
}
```

### モック申請データ（3パターン）

**1. 承認待ち申請（年1回定期変更）**:
```json
{
  "id": "req-003",
  "staffId": "OH-NS-2021-001",
  "currentCourseCode": "B",
  "requestedCourseCode": "A",
  "changeReason": "annual",
  "reasonDetail": "管理職候補として、施設間異動を含む全面協力型コースへの変更を希望します。転居を伴う異動も受諾可能です。",
  "requestedEffectiveDate": "2026-04-01",
  "approvalStatus": "pending",
  "attachments": [],
  "createdAt": "2025-09-25T10:30:00Z"
}
```

**2. 承認済み申請**:
```json
{
  "id": "req-002",
  "staffId": "OH-NS-2021-001",
  "currentCourseCode": "C",
  "requestedCourseCode": "B",
  "changeReason": "annual",
  "reasonDetail": "部署異動に対応可能となったため、Bコースへの変更を希望します。",
  "requestedEffectiveDate": "2025-04-01",
  "hrReviewerId": "HR-001",
  "hrReviewerName": "人事部長",
  "reviewedAt": "2024-03-20T15:00:00Z",
  "reviewComment": "職務能力を評価し、承認します。",
  "approvalStatus": "approved",
  "createdAt": "2024-03-01T09:00:00Z"
}
```

**3. 却下済み申請（特例変更）**:
```json
{
  "id": "req-001",
  "staffId": "OH-NS-2021-001",
  "currentCourseCode": "C",
  "requestedCourseCode": "D",
  "changeReason": "special_caregiving",
  "reasonDetail": "親の介護のため、夜勤なしのDコースへの変更を希望します。",
  "requestedEffectiveDate": "2023-10-01",
  "hrReviewerId": "HR-001",
  "hrReviewerName": "人事部長",
  "reviewedAt": "2023-09-15T14:00:00Z",
  "reviewComment": "介護事由を確認しましたが、現在の勤務シフト調整で対応可能と判断しました。",
  "approvalStatus": "rejected",
  "rejectionReason": "現在の勤務シフト調整で対応可能なため。",
  "attachments": ["介護状況証明書.pdf"],
  "createdAt": "2023-09-10T10:00:00Z"
}
```

---

## 9. スケジュール

| 項目 | 担当 | 期限 | 状態 |
|------|------|------|------|
| 実装コード提供 | 医療システムチーム | 2025-10-01 | ✅ 完了 |
| 依頼書作成 | 医療システムチーム | 2025-10-01 | ✅ 完了 |
| VoiceDrive側実装開始 | VoiceDriveチーム | 2025-10-07 | ⏳ 待機中 |
| VoiceDrive側実装完了 | VoiceDriveチーム | 2025-10-25 | 📅 予定 |
| 統合テスト | 両チーム | 2025-10-26-27 | 📅 予定 |
| 本番デプロイ | VoiceDriveチーム | 2025-10-31 | 📅 予定 |

---

## 10. 連絡先

### 医療システムチーム

- **担当**: Claude Code（AI開発チーム）
- **連絡方法**: `mcp-shared/docs/` フォルダにファイルを配置
- **緊急連絡**: `mcp-shared/EMERGENCY_SYNC_BYPASS.md` を作成

### 質問・問題報告

**質問がある場合**:
1. `mcp-shared/docs/VoiceDrive_Phase5-3_Questions_YYYYMMDD.md` を作成
2. 質問内容を記載
3. 医療システムチームが24時間以内に回答

**問題が発生した場合**:
1. `mcp-shared/docs/VoiceDrive_Phase5-3_Issues_YYYYMMDD.md` を作成
2. エラー内容・再現手順を記載
3. 医療システムチームがサポート

---

## 11. 参考資料

### ドキュメント

- `docs/Phase5_キャリア選択制度_実装計画書.md` - 全体実装計画
- `docs/20250919_【川畑法人統括事務局長】コース別雇用制度労基資料.pdf` - 法的根拠資料
- `supabase/migrations/20250930_001_create_career_course_tables.sql` - DBスキーマ

### コード格納場所

**医療システム側**:
```
C:\projects\staff-medical-system\
├── src\
│   ├── app\
│   │   ├── my-page\page.tsx
│   │   └── my-page\career-course\
│   │       ├── change-request\page.tsx
│   │       └── my-requests\page.tsx
│   ├── components\
│   │   └── career-course\CareerCourseCard.tsx
│   └── types\staff.ts
```

**VoiceDrive側（移植先）**:
```
（VoiceDriveのプロジェクト構造に合わせて配置）
```

---

## 付録A: UIスクリーンショット（概念図）

### マイキャリア情報画面

```
┌─────────────────────────────────────────────────┐
│  山田 花子                               [設定]  │
│  小原病院 3階病棟 / 看護師                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ キャリアコース [Phase 5]                   │  │
│  ├───────────────────────────────────────────┤  │
│  │  B  Bコース（施設内協力型）                 │  │
│  │  適用開始: 2025-04-01                      │  │
│  │                                           │  │
│  │  □ 部署異動: 可                            │  │
│  │  □ 施設間異動: 施設内のみ                  │  │
│  │  □ 夜勤: 必須                              │  │
│  │  □ 管理職登用: 対象                        │  │
│  │  □ 基本給係数: 1.10倍                      │  │
│  │                                           │  │
│  │  次回変更可能日: 2026-03-01 (あと150日)    │  │
│  │                                           │  │
│  │  ℹ️ コース変更について                     │  │
│  │  ・年1回の定期変更が可能です               │  │
│  │  ・妊娠・育児・介護等の特例事由の場合は     │  │
│  │    即時変更可能                            │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  【クイックアクション】                           │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │ 📋 コース変更申請 │  │ 📊 申請状況確認   │     │
│  │      →          │  │      →          │     │
│  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

**以上、VoiceDrive移植依頼書 Phase 5-3 キャリア選択ステーション実装**

---

**確認事項**:
- [ ] VoiceDriveチームが本依頼書を確認
- [ ] 実装スケジュールの合意
- [ ] 技術スタックの互換性確認（shadcn/ui、TypeScript等）
- [ ] API認証方式の合意
- [ ] Webhook受信エンドポイントの実装計画確認

**次のアクション**:
1. VoiceDriveチームが本依頼書を確認
2. 質問がある場合は `mcp-shared/docs/VoiceDrive_Phase5-3_Questions_YYYYMMDD.md` を作成
3. 実装開始予定日を確認・合意
4. 定期進捗報告（週1回、月曜日）

---

*この依頼書は医療システムチーム（Claude Code）により2025年10月1日に作成されました。*