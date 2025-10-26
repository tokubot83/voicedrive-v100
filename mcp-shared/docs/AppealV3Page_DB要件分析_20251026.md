# AppealV3Page DB要件分析

**作成日**: 2025年10月26日
**対象ページ**: AppealV3Page (評価システム異議申し立てページ)
**URL**: https://voicedrive-v100.vercel.app/appeal-v3

---

## 📋 目次

1. [ページ概要](#ページ概要)
2. [主要機能](#主要機能)
3. [データフロー](#データフロー)
4. [データ管理責任分界点](#データ管理責任分界点)
5. [現在のDB実装状況](#現在のdb実装状況)
6. [不足項目の洗い出し](#不足項目の洗い出し)
7. [API要件](#api要件)
8. [セキュリティ要件](#セキュリティ要件)
9. [パフォーマンス要件](#パフォーマンス要件)

---

## ページ概要

### 目的
医療職員が評価システム（100点満点・7段階グレードシステム）による評価結果に対して異議申し立てを行い、その進捗状況を確認するページ。

### 評価システム仕様
- **評価方式**: 100点満点（0-100点）
- **グレード**: 7段階（S, A+, A, B+, B, C, D）
- **グレード基準**:
  - S: 90-100点（最優秀）
  - A+: 80-89点（優秀+）
  - A: 70-79点（優秀）
  - B+: 60-69点（良好+）
  - B: 50-59点（良好）
  - C: 40-49点（可）
  - D: 0-39点（要改善）

### ユーザー
- **対象**: 全医療職員（評価を受けるすべての職員）
- **権限**: 自分自身の評価に対する異議申し立てのみ可能
- **アクセス**: 評価開示後14日以内

### ページ構成
```
AppealV3Page
├── 新規申し立てタブ（AppealFormV3）
│   ├── 基本情報入力（職員ID、職員名）
│   ├── 評価期間選択
│   ├── スコア入力（現在/希望）
│   ├── グレード自動計算・表示
│   ├── 申し立てカテゴリ選択
│   ├── 申し立て理由入力（100-2000文字）
│   ├── 証拠書類アップロード（最大5ファイル、15MB）
│   ├── 変更プレビュー（スコア差、グレード変更、優先度）
│   └── 下書き機能（30秒自動保存）
└── 申し立て状況タブ（AppealStatusListV3）
    ├── 異議申し立て一覧表示
    ├── ステータス表示（受付中、審査中、追加情報要請、解決済み等）
    ├── 優先度表示（HIGH/MEDIUM/LOW）
    ├── スコア・グレード変更表示
    └── 詳細モーダル表示
```

---

## 主要機能

### 1. 新規異議申し立て（AppealFormV3）

#### 1.1 基本情報入力
- **職員ID**: 自動入力（ログイン中ユーザー）または手動入力
- **職員名**: 自動入力（ログイン中ユーザー）または手動入力
- **評価期間選択**: 医療システムから取得した申立可能期間のドロップダウン

**データソース**:
- `useAuth()` hook: 現在ログイン中のユーザー情報
- `GET /api/v3/evaluation/periods`: 評価期間一覧（医療システムAPI）

#### 1.2 評価期間取得
- **API**: `GET http://localhost:8080/api/v3/evaluation/periods`
- **実装**: AppealFormV3.tsx Line 137-152
- **フィルタリング**:
  - `status === 'active'`
  - `new Date(appealDeadline) > new Date()` (申立期限内のみ)

#### 1.3 スコア・グレード入力
- **現在のスコア**: 0-100の整数
- **希望するスコア**: 0-100の整数
- **グレード自動計算**: スコア変更時にリアルタイム計算（V3GradeUtils.getGradeFromScore()）

**変更プレビュー**:
- スコア差: Math.abs(requestedScore - originalScore)
- グレード変更メッセージ: 「グレードアップを希望（A → S）」
- 推定優先度: スコア差15点以上 → HIGH、8-14点 → MEDIUM、1-7点 → LOW

#### 1.4 申し立てカテゴリ選択
- 点数計算の誤り（最優先）
- 成果の見落とし（中優先度）
- 評価基準の不明瞭
- 手続きの誤り
- データ入力ミス
- その他

#### 1.5 申し立て理由入力
- **最小文字数**: 100文字
- **最大文字数**: 2000文字
- **リアルタイム文字数カウント**: 表示

#### 1.6 証拠書類アップロード
- **最大ファイル数**: 5ファイル
- **最大ファイルサイズ**: 15MB
- **許可形式**: PDF, JPEG, PNG, GIF
- **アップロードAPI**: `POST /api/v3/appeals/upload`

#### 1.7 下書き機能
- **自動保存**: 30秒ごと
- **保存先**: LocalStorage（`v3_appeal_draft` key）
- **バックアップ**: 最新10件保持
- **削除**: 送信成功時に自動削除

#### 1.8 異議申し立て送信
- **API**: `POST /api/v3/appeals/submit`
- **実装**: appealServiceV3.submitAppealV3()
- **リトライ**: 最大3回、指数バックオフ（1秒、2秒、4秒）

### 2. 申し立て状況確認（AppealStatusListV3）

#### 2.1 異議申し立て一覧取得
- **API**: `GET /api/v3/appeals?employeeId={employeeId}`
- **表示内容**: 申し立てID、職員情報、スコア・グレード、ステータス、優先度、申し立て日

#### 2.2 ステータス種別
- SUBMITTED: 受付完了
- UNDER_REVIEW: 審査中
- ADDITIONAL_INFO: 追加情報要請
- APPROVED: 承認
- PARTIALLY_APPROVED: 一部承認
- REJECTED: 却下
- WITHDRAWN: 取り下げ
- RESOLVED: 解決済み

#### 2.3 詳細表示
- **API**: `GET /api/v3/appeals/:appealId/status`
- **表示**: 担当審査者、予定回答日、詳細情報

### 3. 医療システムからのディープリンク対応

#### 3.1 URLパラメータ
- `?period=2025-H1-V3`: 評価期間ID自動入力
- `?employee=V3-TEST-E001`: 職員ID自動入力
- `?from=medical`: 医療システムからの遷移フラグ

---

## データフロー

### 全体フロー

```
職員 → VoiceDrive AppealV3Page
  ↓
  1. 評価期間取得（GET /api/v3/evaluation/periods）
  2. フォーム入力（スコア、理由等）
  3. 下書き自動保存（LocalStorage、30秒ごと）
  4. 証拠書類アップロード（POST /api/v3/appeals/upload）
  5. 異議申し立て送信（POST /api/v3/appeals/submit）
  ↓
医療システムAPI
  ↓
  6. 申し立てID生成（V3-APPEAL-XXXXX）
  7. 優先度判定、担当審査者割り当て
  8. ステータス管理開始
  ↓
職員 → 申し立て状況確認
  ↓
  9. 一覧取得（GET /api/v3/appeals）
  10. 詳細取得（GET /api/v3/appeals/:appealId/status）
```

---

## データ管理責任分界点

### 医療システム管理データ（100%）

#### 1. 評価データ
- 評価期間マスタ
- 評価スコア（職員ごとの0-100点）
- 評価グレード（S, A+, A, B+, B, C, D）
- 評価者情報

#### 2. 異議申し立てマスタ
- 申し立てID生成（V3-APPEAL-XXXXX）
- ステータス管理
- 優先度判定
- 担当審査者割り当て

#### 3. 審査プロセス
- 審査履歴
- 審査コメント
- スコア変更結果
- 予定回答日

#### 4. 証拠書類管理
- ファイルストレージ
- ファイルメタデータ
- アクセス制御

### VoiceDrive管理データ（一時保存のみ）

#### 1. 下書きデータ（LocalStorage）
- フォーム入力内容
- 保存日時
- バックアップ履歴（最新10件）

#### 2. UIセッション状態（メモリ）
- 現在のタブ（form/status）
- フォーム入力状態
- エラー状態
- 送信中フラグ

#### 3. APIキャッシュ（メモリ）
- 評価期間キャッシュ（ページリロードまで）
- 申し立て一覧キャッシュ（refreshTriggerまで）

### データ同期不要

**理由**:
- データはすべて医療システムで管理（Single Source of Truth）
- VoiceDrive側は下書き機能のみ提供（LocalStorage）
- 送信成功後は医療システムが唯一のデータソース

---

## 現在のDB実装状況

### VoiceDrive側テーブル

#### ❌ Appealテーブル: **存在しない**

**検証結果**:
- `prisma/schema.prisma`を検索 → Appealモデル見つからず
- 異議申し立てデータを保存するテーブルが存在しない

**影響**:
- VoiceDrive側ではデータベースに異議申し立てを保存していない
- すべて医療システムAPIに直接送信・取得している
- LocalStorageの下書き機能のみ提供

### 医療システム側テーブル（推定）

#### V3Appeal（推定）
- appeal_id (PK)
- employee_id
- employee_name
- evaluation_period_id
- appeal_category
- appeal_reason
- original_score (0-100)
- requested_score (0-100)
- original_grade
- requested_grade
- status
- priority
- assigned_reviewer_id
- created_at
- updated_at

#### V3AppealAttachment（推定）
- attachment_id (PK)
- appeal_id (FK)
- file_id
- filename
- size
- uploaded_at

---

## 不足項目の洗い出し

### 1. VoiceDrive側データベーステーブル

#### ❌ 新規テーブル不要（推奨）

**理由**:
- データ管理責任分界点の原則に従う
- 医療システムがSingle Source of Truth
- VoiceDriveは表示・送信のUIレイヤーのみ
- 下書き機能はLocalStorageで十分

### 2. API実装

#### ✅ すべて実装済み

**現状**: すべて医療システムAPIに直接アクセス
- `appealServiceV3.submitAppealV3()` → `POST /api/v3/appeals/submit`
- `appealServiceV3.getV3Appeals()` → `GET /api/v3/appeals`
- `appealServiceV3.getV3AppealStatus()` → `GET /api/v3/appeals/:appealId/status`
- `appealServiceV3.uploadV3Evidence()` → `POST /api/v3/appeals/upload`

**VoiceDrive側プロキシAPI**: 不要（直接医療システムAPIを呼び出し）

### 3. 型定義

#### ✅ 既存型定義（完全実装済み）
- V3EvaluationSystem
- V3EvaluationPeriod
- V3AppealRequest
- V3AppealResponse
- V3GradeUtils
- V3_APPEAL_VALIDATION_RULES
- V3AppealFormData

#### ⚠️ 部分的に不足
```typescript
// src/types/appeal-v3.ts に追加推奨

export interface V3AppealRecord {
  appealId: string;
  employeeId: string;
  employeeName: string;
  evaluationPeriod: string;
  appealCategory: string;
  status: AppealStatus;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  expectedResponseDate?: string;
  details?: {
    originalScore: number;
    requestedScore: number;
    originalGrade: string;
    requestedGrade: string;
    scoreDifference: number;
    evaluationSystem: string;
    gradingSystem: string;
  };
  assignedReviewer?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface V3AppealStatus {
  appealId: string;
  status: AppealStatus;
  priority: 'high' | 'medium' | 'low';
  assignedReviewer?: {
    id: string;
    name: string;
    role: string;
  };
  expectedResponseDate?: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}
```

---

## API要件

### 1. GET /api/v3/evaluation/periods

#### エンドポイント
- **URL**: `http://localhost:8080/api/v3/evaluation/periods`
- **Method**: GET
- **認証**: Bearer Token

#### レスポンス
```typescript
{
  success: true,
  version: "v3.0.0",
  systemType: "100-point-7-tier",
  periods: V3EvaluationPeriod[]
}
```

#### 実装状況
- ✅ クライアント側: 実装済み
- ✅ 医療システム側: 実装済み（想定）

---

### 2. POST /api/v3/appeals/submit

#### エンドポイント
- **URL**: `http://localhost:8080/api/v3/appeals/submit`
- **Method**: POST
- **認証**: Bearer Token
- **タイムアウト**: 10秒

#### リクエスト
```typescript
{
  employeeId: string,
  employeeName: string,
  evaluationPeriod: string,
  appealCategory: AppealCategory,
  appealReason: string,
  originalScore: number,  // 0-100
  requestedScore: number, // 0-100
  evidenceDocuments: [...],
  scores: {...},
  relativeEvaluation: {...},
  voiceDriveUserId: string,
  deviceInfo: {...},
  submittedAt: string,
  apiVersion: "v3.0.0"
}
```

#### レスポンス
```typescript
{
  success: true,
  appealId: "V3-APPEAL-XXXXX",
  version: "v3.0.0",
  message: "V3異議申し立てを受理しました",
  details: {
    status: "submitted",
    priority: "high" | "medium" | "low",
    processedAt: string,
    assignedTo: string,
    evaluationSystem: "100-point",
    gradingSystem: "7-tier",
    scoreDifference: number,
    grade: {
      current: string,
      requested: string
    }
  }
}
```

#### 実装状況
- ✅ クライアント側: 実装済み（appealServiceV3.ts）
- ✅ リトライ機能: 実装済み（最大3回）
- ✅ 医療システム側: 実装済み（想定）

---

### 3. GET /api/v3/appeals

#### エンドポイント
- **URL**: `http://localhost:8080/api/v3/appeals?employeeId={employeeId}`
- **Method**: GET
- **認証**: Bearer Token

#### レスポンス
```typescript
{
  success: true,
  data: V3AppealRecord[]
}
```

#### 実装状況
- ✅ クライアント側: 実装済み
- ⚠️ AppealStatusListV3: デモデータ使用中（要実APIへ切り替え）
- ✅ 医療システム側: 実装済み（想定）

---

### 4. GET /api/v3/appeals/:appealId/status

#### エンドポイント
- **URL**: `http://localhost:8080/api/v3/appeals/:appealId/status`
- **Method**: GET
- **認証**: Bearer Token

#### レスポンス
```typescript
{
  success: true,
  status: V3AppealStatus,
  message?: string
}
```

#### 実装状況
- ✅ クライアント側: 実装済み
- ✅ AppealStatusListV3: 実装済み
- ✅ 医療システム側: 実装済み（想定）

---

### 5. POST /api/v3/appeals/upload

#### エンドポイント
- **URL**: `http://localhost:8080/api/v3/appeals/upload`
- **Method**: POST
- **認証**: Bearer Token
- **Content-Type**: multipart/form-data

#### リクエスト
```typescript
FormData {
  file: File,  // 最大15MB
  apiVersion: "v3.0.0",
  appealId?: string
}
```

#### レスポンス
```typescript
{
  success: true,
  fileId: "FILE-V3-XXXXX",
  url: "https://storage.example.com/appeals/v3/..."
}
```

#### 実装状況
- ✅ クライアント側: 実装済み（appealServiceV3.ts）
- ❌ AppealFormV3: UIファイルアップロード機能未実装
- ✅ 医療システム側: 実装済み（想定）

---

## セキュリティ要件

### 1. 認証・認可
- **認証**: JWT Bearer Token
- **認可**: 自分自身の異議申し立てのみアクセス可能

### 2. データ保護
- **転送中**: HTTPS（本番環境）
- **保存中**: 医療システム側で暗号化
- **下書きデータ**: LocalStorage（クライアントサイド）

### 3. ファイルアップロード
- **最大サイズ**: 15MB
- **許可形式**: PDF, JPEG, PNG, GIF
- **ウイルススキャン**: 医療システム側で実施（推奨）

### 4. タイムアウト・リトライ
- **APIタイムアウト**: 10秒
- **リトライ回数**: 最大3回
- **リトライ間隔**: 指数バックオフ（1秒、2秒、4秒）

---

## パフォーマンス要件

### 1. レスポンスタイム
- **初期ローディング**: < 3秒
- **送信完了**: < 10秒（リトライ含む）
- **一覧表示**: < 2秒

### 2. キャッシュ戦略
- **評価期間**: ページリロードまでキャッシュ
- **申し立て一覧**: refreshTriggerまでキャッシュ
- **下書きデータ**: 永続化（LocalStorage）

### 3. リアルタイム更新
- **下書き自動保存**: 30秒間隔
- **文字数カウント**: リアルタイム
- **グレード計算**: リアルタイム

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

### 実装優先度

#### 🔴 高優先度（必須）
1. ✅ 評価期間取得API統合（実装済み）
2. ✅ 異議申し立て送信API統合（実装済み）
3. ✅ 異議申し立て一覧API統合（実装済み）
4. ✅ 下書き機能（実装済み）
5. ✅ リトライ機能（実装済み）

#### 🟡 中優先度（推奨）
6. ❌ **ファイルアップロードUI実装**（AppealFormV3.tsx）
7. ❌ **デモデータから実APIへ切り替え**（AppealStatusListV3.tsx）
8. ❌ **V3AppealRecord、V3AppealStatus型定義追加**

#### 🟢 低優先度（オプション）
9. VoiceDrive側プロキシAPI実装（現状不要）
10. VoiceDrive側DBテーブル作成（現状不要）

---

**次のステップ**: AppealV3Page暫定マスターリスト作成
