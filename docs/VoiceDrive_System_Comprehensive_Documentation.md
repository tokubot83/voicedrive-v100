# VoiceDrive システム詳細説明書

**作成日：2025年10月7日**
**バージョン：v1.0.0**
**作成者：VoiceDrive開発チーム**

---

## 目次

1. [システム概要](#1-システム概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [技術スタック](#3-技術スタック)
4. [データベース設計](#4-データベース設計)
5. [主要機能](#5-主要機能)
6. [権限管理システム](#6-権限管理システム)
7. [外部システム連携](#7-外部システム連携)
8. [APIエンドポイント](#8-apiエンドポイント)
9. [フロントエンド構成](#9-フロントエンド構成)
10. [セキュリティ](#10-セキュリティ)
11. [開発・デプロイ](#11-開発デプロイ)
12. [トラブルシューティング](#12-トラブルシューティング)

---

## 1. システム概要

### 1.1 プロジェクト名
**VoiceDrive v100** - 革新的合意形成システム

### 1.2 目的
医療職員の声を集め、組織改善につなげる統合プラットフォーム。
X(Twitter)風のモダンなUIを持つ組織内合意形成システムです。

### 1.3 主要価値提案
- 👥 **職員エンゲージメント向上**：全職員の意見を可視化
- 💡 **改善提案の効率化**：アイデアから実行まで一元管理
- 📊 **データドリブン経営**：組織の声を分析し意思決定を支援
- 🔒 **匿名性の保証**：心理的安全性を担保した投稿環境
- 🏥 **医療システム統合**：職員カルテシステムとシームレス連携

### 1.4 システムユーザー
- **一般職員**（レベル1-4）：意見投稿、投票、面談予約
- **管理職**（レベル5-13）：チーム管理、提案審査、ダッシュボード
- **人事部門**（レベル14-15）：分析、文化開発、通知管理
- **経営層**（レベル16-18）：戦略立案、理事会資料、最終承認

---

## 2. システムアーキテクチャ

### 2.1 全体構成図

```
┌─────────────────────────────────────────────────────────────┐
│                     VoiceDrive System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │              │         │              │                  │
│  │   Frontend   │◄────────┤   Backend    │                  │
│  │   (React)    │  REST   │   (Express)  │                  │
│  │              │   API   │              │                  │
│  └──────────────┘         └───────┬──────┘                  │
│         │                         │                          │
│         │                         ▼                          │
│         │                  ┌──────────────┐                  │
│         │                  │              │                  │
│         │                  │   Database   │                  │
│         │                  │   (SQLite)   │                  │
│         │                  │   +Prisma    │                  │
│         │                  └──────────────┘                  │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────┐                                            │
│  │   Service    │                                            │
│  │   Worker     │                                            │
│  │   (PWA)      │                                            │
│  └──────────────┘                                            │
│                                                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ MCP Server (統合プラットフォーム)
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │  医療職員管理システム                  │
    │  (Medical Staff System)              │
    ├─────────────────────────────────────┤
    │  - 職員カルテ                         │
    │  - 面談管理                           │
    │  - ストレスチェック                    │
    │  - 人事お知らせ配信                    │
    └─────────────────────────────────────┘
```

### 2.2 レイヤー構成

#### プレゼンテーション層（Frontend）
- React 18（関数コンポーネント）
- TypeScript（厳格な型定義）
- Tailwind CSS（スタイリング）
- Vite（ビルドツール）
- PWA対応（オフライン動作）

#### アプリケーション層（Backend API）
- Express.js（Node.js）
- REST API設計
- JWT認証
- レート制限（100req/分）
- CORS対応

#### データアクセス層
- Prisma ORM
- SQLite（開発）
- MySQL対応（本番）

#### ビジネスロジック層
- サービスクラス設計
- 18段階権限管理
- ワークフロー管理
- 分析エンジン

---

## 3. 技術スタック

### 3.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **React** | 18.2.0 | UIライブラリ |
| **TypeScript** | 5.2.2 | 型安全な開発 |
| **Vite** | 5.0.8 | ビルド・開発サーバー |
| **Tailwind CSS** | 3.3.0 | スタイリング |
| **React Router** | 7.6.2 | ルーティング |
| **Lucide React** | 0.513.0 | アイコン |
| **React Toastify** | 11.0.5 | 通知UI |
| **jsPDF** | 3.0.3 | PDF生成 |

### 3.2 バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Node.js** | >=18.0.0 | ランタイム |
| **Express** | 5.1.0 | Webフレームワーク |
| **Prisma** | 6.16.2 | ORM |
| **JWT** | 9.0.2 | 認証トークン |
| **bcryptjs** | 3.0.2 | パスワードハッシュ化 |
| **Helmet** | 8.1.0 | セキュリティヘッダー |
| **CORS** | 2.8.5 | オリジン制御 |
| **express-rate-limit** | 8.1.0 | レート制限 |

### 3.3 開発ツール

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Jest** | 30.1.3 | テストフレームワーク |
| **Supertest** | 7.1.4 | API統合テスト |
| **ESLint** | 8.55.0 | コード品質チェック |
| **Prettier** | - | コードフォーマット |
| **tsx** | 4.20.5 | TypeScript実行 |

---

## 4. データベース設計

### 4.1 主要エンティティ

#### User（職員）
```typescript
model User {
  id: String @id @default(cuid())
  employeeId: String @unique           // 職員ID
  email: String @unique                // メールアドレス
  name: String                         // 氏名
  department: String?                  // 所属部署
  facilityId: String?                  // 施設ID
  role: String?                        // 役職
  accountType: String                  // アカウント種別
  permissionLevel: Decimal             // 権限レベル（1-18, X）
  canPerformLeaderDuty: Boolean        // リーダー業務可否
  professionCategory: String?          // 職種カテゴリ
  position: String?                    // 役職
  parentId: String?                    // 上司ID（階層構造）
  budgetApprovalLimit: Float?          // 予算承認上限
  isRetired: Boolean @default(false)   // 退職フラグ
  retirementDate: DateTime?            // 退職日

  // リレーション
  interviews: Interview[]
  notifications: Notification[]
  projects: Project[]
  feedbackSent: Feedback[]
  feedbackReceived: Feedback[]
  // ...その他
}
```

#### Interview（面談）
```typescript
model Interview {
  id: String @id @default(cuid())
  employeeId: String                   // 職員ID
  category: String                     // カテゴリ（キャリア、メンタル等）
  type: String                         // 種別
  topic: String                        // 面談内容
  preferredDate: DateTime              // 希望日時
  scheduledDate: DateTime?             // 確定日時
  actualDate: DateTime?                // 実施日時
  duration: Int?                       // 所要時間（分）
  interviewerId: String?               // 面談者ID
  interviewerName: String?             // 面談者名
  status: String @default("pending")   // ステータス
  urgencyLevel: String                 // 緊急度
  result: String?                      // 結果
  notes: String?                       // メモ
  followUpRequired: Boolean            // フォローアップ要否
  followUpDate: DateTime?              // フォローアップ日

  employee: User @relation(fields: [employeeId], references: [id])
}
```

#### Notification（通知）
```typescript
model Notification {
  id: String @id @default(cuid())
  category: String                     // カテゴリ
  subcategory: String?                 // サブカテゴリ
  priority: String                     // 優先度
  title: String                        // タイトル
  content: String                      // 内容
  target: String                       // 配信対象
  senderId: String                     // 送信者ID
  status: String @default("pending")   // ステータス
  sentAt: DateTime?                    // 送信日時
  recipientCount: Int @default(0)      // 受信者数
  readCount: Int @default(0)           // 既読数
  clickCount: Int @default(0)          // クリック数

  sender: User @relation(fields: [senderId], references: [id])
}
```

#### Project（プロジェクト）
```typescript
model Project {
  id: String @id @default(cuid())
  title: String                        // タイトル
  description: String                  // 説明
  category: String                     // カテゴリ
  proposerId: String                   // 提案者ID
  objectives: Json                     // 目標
  expectedOutcomes: Json               // 期待される成果
  budget: Float?                       // 予算
  timeline: Json?                      // タイムライン
  status: String @default("proposed")  // ステータス
  priority: String?                    // 優先度
  approvalLevel: Int @default(0)       // 承認レベル
  approvedBy: Json?                    // 承認者
  progressRate: Float @default(0)      // 進捗率
  milestones: Json?                    // マイルストーン
  roi: Float?                          // ROI

  proposer: User @relation(fields: [proposerId], references: [id])
}
```

#### Survey（アンケート）
```typescript
model Survey {
  id: String @id @default(cuid())
  title: String                        // タイトル
  description: String?                 // 説明
  category: String                     // カテゴリ
  createdById: String                  // 作成者ID
  targetAudience: String               // 対象者
  deadline: DateTime                   // 締切
  isAnonymous: Boolean @default(true)  // 匿名フラグ
  questions: Json                      // 質問（JSON）
  responseCount: Int @default(0)       // 回答数
  completionRate: Float?               // 完了率
  averageScore: Float?                 // 平均スコア
  status: String @default("draft")     // ステータス

  createdBy: User @relation(fields: [createdById], references: [id])
  responses: SurveyResponse[]
}
```

#### PostReport（投稿通報）
```typescript
model PostReport {
  id: String @id @default(cuid())
  postId: String                       // 投稿ID
  alertId: String?                     // アラートID
  reporterId: String                   // 通報者ID
  reporterName: String?                // 通報者名（匿名可）
  reportType: String                   // 通報種別
  description: String?                 // 説明
  status: String @default("pending")   // ステータス
  reviewedBy: String?                  // レビュー者ID
  reviewedAt: DateTime?                // レビュー日時
  actionTaken: String?                 // 対応内容
  reviewNotes: String?                 // レビューメモ

  reporter: User @relation("ReportSender", fields: [reporterId], references: [id])
  reviewer: User? @relation("ReportReviewer", fields: [reviewedBy], references: [id])
}
```

### 4.2 データベースER図（簡易版）

```
User ──┬──< Interview
       ├──< Notification
       ├──< Project
       ├──< Survey
       ├──< Feedback (送信)
       ├──< Feedback (受信)
       ├──< PostReport (通報者)
       ├──< PostReport (レビュー者)
       └──< AuditLog

Survey ──< SurveyResponse

Project ──< (承認ワークフロー)

PostReport ──< PostReportAlert
```

---

## 5. 主要機能

### 5.1 投稿システム（3種類）

#### 5.1.1 💡 改善提案（Idea Voice）
**用途**：業務効率化、品質向上、コスト削減のアイデア提案

**機能**：
- 5段階投票（強く反対〜強く賛成）
- リアルタイム合意形成度表示
- プロジェクト化ワークフロー
- 進捗追跡（提案→審査→実行→完了）

**画面**：
- [HomePage.tsx](../src/pages/HomePage.tsx:1) - メイン投稿画面
- [ComposeCard.tsx](../src/components/ComposeCard.tsx:1) - 投稿作成
- [IdeaVoiceTracking.tsx](../src/pages/IdeaVoiceTracking.tsx:1) - 提案追跡

#### 5.1.2 👥 コミュニティ（Free Voice）
**用途**：情報共有、相談、雑談、職場の声

**機能**：
- カジュアルな投稿・コメント
- リアクション機能
- タグ・カテゴリ分類
- トレンド表示

**画面**：
- [HomePage.tsx](../src/pages/HomePage.tsx:1)（タブ切替）
- [FreeVoiceGuide.tsx](../src/pages/FreeVoiceGuide.tsx:1) - ガイド

#### 5.1.3 🚨 公益通報（Whistleblowing）
**用途**：安全、法令、倫理の問題報告

**機能**：
- 完全匿名通報
- 通報種別選択（ハラスメント、安全違反、法令違反等）
- 自動アラート（閾値超過時）
- 管理者レビューフロー
- 医療システム連携（重要案件自動送信）

**画面**：
- [WhistleblowingPage.tsx](../src/pages/WhistleblowingPage.tsx:1) - 通報画面
- [ComplianceGuide.tsx](../src/pages/ComplianceGuide.tsx:1) - ガイド

**セキュリティ**：
- 通報者IDは暗号化
- レビュー権限者のみ閲覧可能
- 監査ログ記録

### 5.2 面談予約システム

#### 3段階選択フロー
1. **分類選択**（Classification）
   - キャリア面談
   - メンタルヘルス
   - 業務相談
   - その他

2. **タイプ選択**（Type）
   - 定期面談
   - 緊急面談
   - フォローアップ

3. **詳細入力**
   - 希望日時
   - 面談内容
   - 緊急度

**実装**：
- [InterviewBookingPage.tsx](../src/pages/InterviewBookingPage.tsx:1)
- [useInterviewFlow.ts](../src/hooks/useInterviewFlow.ts:1)
- [ClassificationSelector.tsx](../src/components/interview/ClassificationSelector.tsx:1)

**医療システム連携**：
- 予約情報を自動送信
- 確定通知を受信
- ステータス同期

### 5.3 ダッシュボード（階層別）

#### 個人ダッシュボード（全職員）
**画面**：[PersonalDashboard.tsx](../src/components/dashboards/PersonalDashboard.tsx:1)

**機能**：
- マイ投稿・コメント
- 面談予定
- 通知センター
- タスク管理

#### チームリーダーダッシュボード（レベル5-7）
**画面**：[TeamLeaderDashboard.tsx](../src/components/dashboards/TeamLeaderDashboard.tsx:1)

**機能**：
- チームメンバー投稿分析
- 面談管理
- タスク配分
- エンゲージメント指標

#### 部門ダッシュボード（レベル8-10）
**画面**：[DepartmentDashboard.tsx](../src/components/dashboards/DepartmentDashboard.tsx:1)

**機能**：
- 部門別分析
- プロジェクト進捗
- 予算執行状況
- 世代別分析

#### 施設ダッシュボード（レベル11-13）
**画面**：[FacilityDashboard.tsx](../src/components/dashboards/FacilityDashboard.tsx:1)

**機能**：
- 施設全体KPI
- 部門間比較
- リスク可視化
- 経営指標

#### 戦略ダッシュボード（レベル16-18）
**画面**：[StrategicDashboard.tsx](../src/components/dashboards/StrategicDashboard.tsx:1)

**機能**：
- 組織全体分析
- 戦略的インサイト
- ROI分析
- 理事会資料生成

### 5.4 人事お知らせシステム（Phase 7）

#### お知らせ受信API
**エンドポイント**：`POST /api/hr-announcements`

**機能**：
- 職員カルテシステムからお知らせ受信
- カテゴリ自動変換（5種類）
- 配信対象フィルタリング（全職員/部門/個人）
- アクションボタン設定（面談予約、アンケート等）

**実装**：
- [hr-announcements.routes.ts](../src/api/routes/hr-announcements.routes.ts:1)
- [hr-announcements.ts](../src/types/hr-announcements.ts:1)

#### 統計送信Webhook
**イベント**：`stats.updated`（リアルタイム）

**送信内容**：
- 配信数
- アクションボタンクリック数
- 完了数
- 部門別統計

**実装**：
- [MedicalIntegrationService.ts](../src/services/MedicalIntegrationService.ts:218)
- HMAC-SHA256署名付き

### 5.5 プロジェクト管理

#### ワークフロー
1. **提案**（Proposed）→ 2. **審査中**（Under Review）→ 3. **承認**（Approved）
   → 4. **実行中**（In Progress）→ 5. **完了**（Completed）

#### 承認プロセス
- 多段階承認（権限レベルに応じた承認者設定）
- 自動エスカレーション
- 予算承認ワークフロー
- ROI計算エンジン

**実装**：
- [ProjectService.ts](../src/api/db/projectService.ts:1)
- [ApprovalProcessInlineDetails.tsx](../src/components/approval/ApprovalProcessInlineDetails.tsx:1)

### 5.6 分析エンジン

#### 世代別分析
**画面**：[GenerationalAnalysisPage.tsx](../src/pages/GenerationalAnalysisPage.tsx:1)

**機能**：
- 世代別エンゲージメント
- トピック傾向
- 満足度推移

#### 階層別分析
**画面**：[HierarchicalAnalysisPage.tsx](../src/pages/HierarchicalAnalysisPage.tsx:1)

**機能**：
- 役職別分析
- コミュニケーション可視化
- リーダーシップ指標

#### 職種別分析
**画面**：[ProfessionalAnalysisPage.tsx](../src/pages/ProfessionalAnalysisPage.tsx:1)

**機能**：
- 看護師・医師・事務等の分析
- 専門性指標
- スキルマッピング

### 5.7 通知システム

**実装**：[NotificationService.ts](../src/services/NotificationService.ts:1)

**配信チャネル**：
- ブラウザプッシュ通知
- アプリ内通知バッジ
- メール通知（オプション）

**通知種別**：
- 面談確定通知
- お知らせ配信
- プロジェクト更新
- 承認依頼
- 緊急アラート

**優先度制御**：
- URGENT：即座に表示
- HIGH：重要マーク
- NORMAL：通常通知
- LOW：バッチ配信

---

## 6. 権限管理システム

### 6.1 18段階権限レベル

| レベル | 役職 | 主な権限 |
|--------|------|---------|
| **1** | 新人（1年目） | 投稿閲覧、投票 |
| **1.5** | 新人看護師（リーダー可） | 上記＋リーダー業務 |
| **2** | 若手（2-3年目） | 投稿閲覧、投票 |
| **2.5** | 若手看護師（リーダー可） | 上記＋リーダー業務 |
| **3** | 中堅（4-10年目） | 投稿閲覧、投票 |
| **3.5** | 中堅看護師（リーダー可） | 上記＋投稿管理 |
| **4** | ベテラン（11年以上） | 投稿閲覧、投票 |
| **4.5** | ベテラン看護師（リーダー可） | 上記＋投稿管理 |
| **5** | 副主任 | チーム管理、提案審査 |
| **6** | 主任 | チーム管理、提案審査 |
| **7** | 副師長・副科長・副課長 | 委員会管理 |
| **8** | 師長・科長・課長・室長 | 部門運営 |
| **9** | 副部長 | 部門運営 |
| **10** | 部長・医局長 | 運営委員会、施設ガバナンス |
| **11** | 事務長 | 施設管理 |
| **12** | 副院長 | 施設ガバナンス |
| **13** | 院長・施設長 | 決定会議 |
| **14** | 人事部門員 | ボイス分析、文化開発 |
| **15** | 人事各部門長 | 組織インサイト |
| **16** | 戦略企画・統括管理部門員 | 戦略HR計画、エグゼクティブ報告 |
| **17** | 戦略企画・統括管理部門長 | 理事会準備 |
| **18** | 理事長・法人事務局長 | 理事会機能、戦略ガバナンス、最終承認 |
| **X** | システム管理者 | 全権限 |

### 6.2 権限チェック実装

**フロントエンド**：
```typescript
// src/permissions/hooks/usePermissions.ts
export function usePermissions() {
  const canAccessRoute = (requiredLevel: number) => {
    return currentUser.permissionLevel >= requiredLevel;
  };

  const canEditProject = (project: Project) => {
    return currentUser.id === project.proposerId
      || currentUser.permissionLevel >= 7;
  };
}
```

**バックエンド**：
```typescript
// src/api/middleware/auth.ts
export function requirePermission(minLevel: number) {
  return (req, res, next) => {
    if (req.user.permissionLevel < minLevel) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### 6.3 議題モードメニュー

**実装**：[agendaMenuConfig.ts](../src/config/agendaMenuConfig.ts:1)

**レベル別表示例**：
- **レベル1**：投稿の追跡
- **レベル7**：投稿管理、委員会管理
- **レベル13**：決定会議
- **レベル18**：理事会機能、最終承認

---

## 7. 外部システム連携

### 7.1 医療職員管理システム統合

#### MCPサーバー
**場所**：`mcp-integration-server/`

**役割**：
- VoiceDrive ⇔ 職員カルテシステム間の中間層
- データ変換・マッピング
- 同期ステータス管理

**起動**：
```bash
cd mcp-integration-server
npm run dev
```

**エンドポイント**：
- `http://localhost:8080` - MCP API
- `http://localhost:8080/dashboard` - 管理画面

#### 共有ファイルフォルダ
**場所**：`mcp-shared/`

```
mcp-shared/
├── docs/               # 報告書、設計書
├── config/             # interview-types.json 等
├── interfaces/         # TypeScript型定義
├── logs/               # テスト結果
└── sync-status.json    # 同期ステータス
```

**自動同期**：
- 職員カルテ側でファイル更新 → MCP経由でVoiceDriveに通知
- `AI_SUMMARY.md`に重要更新を要約

### 7.2 医療システム連携サービス

**実装**：[MedicalIntegrationService.ts](../src/services/MedicalIntegrationService.ts:1)

#### 送信機能
1. **お知らせ送信**
   - VoiceDrive → 医療システム
   - カテゴリ・優先度マッピング
   - アクションボタン設定

2. **面談予約送信**
   - 予約情報の自動転送
   - ステータス同期

3. **統計送信**
   - Webhook経由（HMAC署名付き）
   - リアルタイム統計

#### 受信機能
1. **お知らせ受信**
   - `POST /api/hr-announcements`
   - バリデーション・変換
   - 配信対象フィルタリング

2. **面談結果受信**
   - `POST /api/interview-results`
   - 面談記録保存

3. **通報受信確認**
   - `POST /api/compliance-acknowledgements`
   - 重要通報の処理状況確認

### 7.3 優先度・カテゴリマッピング

#### 優先度マッピング
| VoiceDrive | 医療システム |
|-----------|-------------|
| URGENT | high |
| HIGH | high |
| NORMAL | medium |
| LOW | low |

**実装**：[priorityMapping.ts](../src/utils/priorityMapping.ts:1)

#### カテゴリマッピング
| VoiceDrive | 医療システム |
|-----------|-------------|
| ANNOUNCEMENT | announcement |
| MEETING | interview |
| TRAINING | training |
| SURVEY | survey |
| OTHER | other |

**実装**：[categoryMapping.ts](../src/utils/categoryMapping.ts:1)

---

## 8. APIエンドポイント

### 8.1 認証API

#### `POST /api/auth/login`
**用途**：ログイン

**リクエスト**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**：
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "name": "山田太郎",
    "permissionLevel": 5
  }
}
```

#### `POST /api/auth/logout`
**用途**：ログアウト

### 8.2 ユーザーAPI

#### `GET /api/users/:id`
**用途**：ユーザー情報取得

#### `PUT /api/users/:id`
**用途**：ユーザー情報更新

#### `GET /api/users/:id/dashboard`
**用途**：ダッシュボードデータ取得

### 8.3 面談API

#### `POST /api/interviews`
**用途**：面談予約作成

**リクエスト**：
```json
{
  "employeeId": "user123",
  "category": "career",
  "type": "regular",
  "topic": "キャリアプラン相談",
  "preferredDate": "2025-10-15T10:00:00Z",
  "urgencyLevel": "medium"
}
```

#### `GET /api/interviews`
**用途**：面談一覧取得

#### `PUT /api/interviews/:id`
**用途**：面談更新

### 8.4 通知API

#### `GET /api/notifications`
**用途**：通知一覧取得

#### `POST /api/notifications`
**用途**：通知作成

#### `PUT /api/notifications/:id/read`
**用途**：既読マーク

### 8.5 プロジェクトAPI

#### `GET /api/projects`
**用途**：プロジェクト一覧取得

**クエリパラメータ**：
- `status`: proposed, approved, in_progress, completed
- `category`: efficiency, quality, cost, other
- `proposerId`: 提案者ID

#### `POST /api/projects`
**用途**：プロジェクト作成

#### `PUT /api/projects/:id/approve`
**用途**：プロジェクト承認

### 8.6 人事お知らせAPI（Phase 7）

#### `POST /api/hr-announcements`
**用途**：お知らせ受信（職員カルテシステムから）

**認証**：Bearer Token + X-Source-System ヘッダー

**リクエスト**：
```json
{
  "title": "定期健康診断のお知らせ",
  "content": "2025年10月20日〜31日に実施します。",
  "category": "announcement",
  "priority": "medium",
  "targetType": "all",
  "hasActionButton": true,
  "actionButton": {
    "type": "health_check",
    "label": "予約する",
    "url": "https://medical-system.example.com/health-check"
  },
  "requireResponse": true,
  "autoTrackResponse": true,
  "metadata": {
    "sourceSystem": "medical-staff-system",
    "sourceAnnouncementId": "ann-20251007-001",
    "createdBy": "人事部",
    "createdAt": "2025-10-07T09:00:00Z"
  }
}
```

**レスポンス**：
```json
{
  "success": true,
  "data": {
    "voicedriveAnnouncementId": "vd-ann-123",
    "status": "published",
    "publishedAt": "2025-10-07T09:00:10Z",
    "estimatedDelivery": 150
  }
}
```

**仕様書**：`mcp-shared/docs/VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md`

#### `POST /api/medical/stats` (Webhook)
**用途**：統計送信（VoiceDrive → 職員カルテ）

**認証**：HMAC-SHA256署名（`X-VoiceDrive-Signature`ヘッダー）

**ペイロード**：
```json
{
  "event": "stats.updated",
  "timestamp": "2025-10-07T10:30:00Z",
  "announcement": {
    "id": "vd-ann-123",
    "title": "定期健康診断のお知らせ",
    "category": "announcement",
    "priority": "medium",
    "publishedAt": "2025-10-07T09:00:10Z"
  },
  "stats": {
    "delivered": 150,
    "actions": 45,
    "completions": 30
  },
  "metadata": {
    "source": "voicedrive",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

**仕様書**：`mcp-shared/docs/VoiceDrive_Stats_Webhook_Specification_20251007.md`

### 8.7 権限API

#### `GET /api/permissions/check`
**用途**：権限チェック

**クエリパラメータ**：
- `action`: アクション名
- `resourceId`: リソースID

### 8.8 レート制限
- **100リクエスト/分/IP**
- 超過時：`429 Too Many Requests`
- リトライ：指数バックオフ推奨

---

## 9. フロントエンド構成

### 9.1 ディレクトリ構造

```
src/
├── api/                        # バックエンドAPI
│   ├── routes/                 # ルート定義
│   │   ├── auth.routes.ts
│   │   ├── hr-announcements.routes.ts
│   │   └── ...
│   ├── db/                     # データベースサービス
│   │   ├── userService.ts
│   │   ├── interviewService.ts
│   │   └── ...
│   ├── middleware/             # ミドルウェア
│   │   └── auth.ts
│   └── server.ts               # Expressサーバー
│
├── components/                 # Reactコンポーネント
│   ├── dashboards/             # ダッシュボード
│   │   ├── PersonalDashboard.tsx
│   │   ├── TeamLeaderDashboard.tsx
│   │   └── ...
│   ├── analytics/              # 分析コンポーネント
│   ├── interview/              # 面談関連
│   ├── authority/              # 権限関連
│   ├── ui/                     # 共通UIコンポーネント
│   └── ...
│
├── pages/                      # ページコンポーネント
│   ├── HomePage.tsx            # メインフィード
│   ├── InterviewBookingPage.tsx
│   ├── WhistleblowingPage.tsx
│   ├── DecisionMeetingPage.tsx
│   └── ...
│
├── hooks/                      # カスタムフック
│   ├── usePermissions.ts
│   ├── useInterviewFlow.ts
│   ├── useVoting.ts
│   └── ...
│
├── services/                   # ビジネスロジック
│   ├── MedicalIntegrationService.ts
│   ├── NotificationService.ts
│   ├── VotingService.ts
│   └── ...
│
├── types/                      # TypeScript型定義
│   ├── hr-announcements.ts
│   ├── interview.ts
│   ├── profile.ts
│   ├── authority.ts
│   └── ...
│
├── utils/                      # ユーティリティ
│   ├── priorityMapping.ts
│   ├── categoryMapping.ts
│   ├── dateUtils.ts
│   └── ...
│
├── permissions/                # 権限管理
│   ├── types/
│   ├── hooks/
│   └── components/
│
├── config/                     # 設定ファイル
│   ├── agendaMenuConfig.ts     # 議題モードメニュー
│   └── postingGuidelines.ts
│
├── data/                       # マスターデータ
│   ├── medical/                # 医療系データ
│   │   ├── departments.ts
│   │   ├── professions.ts
│   │   └── ...
│   └── demo/                   # デモデータ
│
└── App.tsx                     # アプリルート
```

### 9.2 ルーティング

**実装**：[App.tsx](../src/App.tsx:1)

```typescript
// 主要ルート（抜粋）
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/interview-booking" element={<InterviewBookingPage />} />
  <Route path="/whistleblowing" element={<WhistleblowingPage />} />

  {/* ダッシュボード */}
  <Route path="/dashboard/personal" element={<PersonalDashboardPage />} />
  <Route path="/dashboard/team-leader" element={<TeamLeaderDashboardPage />} />
  <Route path="/dashboard/department" element={<DepartmentDashboardPage />} />

  {/* 議題モード（権限別） */}
  <Route path="/decision-meeting" element={<DecisionMeetingPage />} />
  <Route path="/facility-governance" element={<FacilityGovernancePage />} />
  <Route path="/strategic-governance" element={<StrategicGovernancePage />} />

  {/* 人事お知らせ（Phase 7） */}
  <Route path="/hr-announcements" element={<HRAnnouncementsPage />} />

  {/* その他 */}
  <Route path="/unauthorized" element={<UnauthorizedPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### 9.3 状態管理

**方針**：コンテキストAPI + カスタムフック

**主要コンテキスト**：
- `AuthContext`：認証状態
- `NotificationContext`：通知管理
- `ThemeContext`：テーマ設定

**例**：
```typescript
// src/contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 9.4 スタイリング

**Tailwind CSS**：ユーティリティファースト

**テーマ**：
- ダークモード（X風）
- グラデーション背景
- ガラスモーフィズム（backdrop-blur）
- グロー/シマーアニメーション

**例**：
```tsx
<div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
  <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl">
    {/* コンテンツ */}
  </div>
</div>
```

---

## 10. セキュリティ

### 10.1 認証・認可

#### JWT認証
**実装**：[auth.ts](../src/api/middleware/auth.ts:1)

```typescript
// トークン生成
const token = jwt.sign(
  { userId: user.id, permissionLevel: user.permissionLevel },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// トークン検証
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### パスワードハッシュ化
```typescript
import bcrypt from 'bcryptjs';

// ハッシュ化
const hashedPassword = await bcrypt.hash(password, 10);

// 検証
const isValid = await bcrypt.compare(password, user.hashedPassword);
```

### 10.2 CORS設定

**実装**：[server.ts](../src/api/server.ts:31)

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',      // 職員カルテ開発環境
    'http://localhost:3001',      // VoiceDrive開発環境
    'https://voicedrive.ohara-hospital.jp',
    'https://staging.voicedrive.ohara-hospital.jp',
    // Phase 7で職員カルテ本番ドメイン追加予定
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### 10.3 セキュリティヘッダー

**Helmet.js**：
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

### 10.4 レート制限

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1分
  max: 100,                 // 100リクエスト/分
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'APIリクエストが多すぎます。'
    }
  }
});

app.use('/api/', apiLimiter);
```

### 10.5 Webhook署名検証

**HMAC-SHA256署名**：

**送信側（VoiceDrive）**：
```typescript
// src/services/MedicalIntegrationService.ts:318
const signature = await crypto.subtle.sign('HMAC', key, messageData);
headers['X-VoiceDrive-Signature'] = signature;
```

**受信側（職員カルテ）**：
```typescript
const expectedSignature = crypto
  .createHmac('sha256', SECRET)
  .update(requestBody)
  .digest('hex');

if (receivedSignature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

### 10.6 匿名性保護（通報システム）

- 通報者IDは暗号化して保存
- レビュー権限者（レベル14+）のみ復号可能
- 監査ログに全アクセス記録
- 通報内容は別テーブルに分離保存

---

## 11. 開発・デプロイ

### 11.1 環境変数

**開発環境**：`.env`ファイル

```bash
# データベース
DATABASE_URL="file:./dev.db"

# JWT認証
JWT_SECRET="your-jwt-secret-key"

# 医療システム統合
REACT_APP_MEDICAL_API_URL="https://api.medical-team.example.com"
REACT_APP_MEDICAL_API_TOKEN="your-medical-api-token"
REACT_APP_MEDICAL_WEBHOOK_SECRET="your-webhook-secret-key"
REACT_APP_MEDICAL_STATS_WEBHOOK_URL="https://medical-system.example.com/api/voicedrive/stats"

# サーバー設定
PORT=4000
NODE_ENV=development
```

**本番環境**：環境変数で設定（Vercel、AWS等）

### 11.2 開発サーバー起動

#### フロントエンド
```bash
npm run dev
# → http://localhost:3001
```

#### バックエンドAPI
```bash
npm run dev:api
# → http://localhost:4000
```

#### MCPサーバー
```bash
cd mcp-integration-server
npm run dev
# → http://localhost:8080
```

### 11.3 ビルド

#### プロダクションビルド
```bash
npm run build
```

#### 厳格モード（型チェック付き）
```bash
npm run build:strict
```

#### Vercel用
```bash
npm run build:vercel
```

### 11.4 テスト

#### 全テスト実行
```bash
npm test
```

#### 統合テスト
```bash
npm run test:integration
```

#### シナリオテスト
```bash
npm run test:scenario1  # シナリオ1
npm run test:scenario2  # シナリオ2
npm run test:all-scenarios  # 全シナリオ
```

#### ウォッチモード
```bash
npm run test:watch
```

### 11.5 データベース管理

#### マイグレーション
```bash
npx prisma migrate dev --name <migration_name>
```

#### シードデータ投入
```bash
npm run db:seed
```

#### 統合テスト用データ投入
```bash
npm run seed:integration-test
```

#### Prismaスキーマ同期
```bash
npx prisma generate
```

### 11.6 デプロイ

#### Vercel（推奨）
```bash
# プロジェクト接続（初回のみ）
vercel login
vercel link

# デプロイ
vercel --prod
```

**設定**：`vercel.json`
```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

#### 環境変数設定
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add REACT_APP_MEDICAL_API_TOKEN
```

---

## 12. トラブルシューティング

### 12.1 データベース関連

#### エラー：`Prisma Client not generated`
**解決**：
```bash
npx prisma generate
```

#### エラー：`Migration failed`
**解決**：
```bash
# マイグレーションリセット（開発環境のみ）
npx prisma migrate reset

# 再マイグレーション
npx prisma migrate dev
```

### 12.2 ビルド関連

#### エラー：`TypeScript errors`
**解決**：
```bash
# 型チェック
npm run type-check

# エラー詳細確認
npx tsc --noEmit --skipLibCheck
```

#### エラー：`Module not found`
**解決**：
```bash
# 依存関係再インストール
rm -rf node_modules package-lock.json
npm install
```

### 12.3 認証関連

#### エラー：`JWT malformed`
**原因**：トークンが無効

**解決**：
1. ブラウザのLocalStorageをクリア
2. 再ログイン
3. JWT_SECREtが正しいか確認

#### エラー：`401 Unauthorized`
**原因**：トークン期限切れ

**解決**：
- トークン有効期限を確認（デフォルト7日）
- リフレッシュトークン機能の実装を検討

### 12.4 医療システム連携

#### エラー：`Webhook signature verification failed`
**原因**：署名不一致

**解決**：
1. `REACT_APP_MEDICAL_WEBHOOK_SECRET`が両システムで一致しているか確認
2. ペイロードが改変されていないか確認
3. タイムスタンプドリフト（5分以内）を確認

#### エラー：`Rate limit exceeded`
**原因**：API呼び出し頻度超過

**解決**：
- リクエスト頻度を100req/分以内に抑制
- 指数バックオフでリトライ実装
- バッチ処理を検討

### 12.5 パフォーマンス

#### 問題：ページロードが遅い
**解決**：
1. ネットワークタブでボトルネック特定
2. 画像最適化（WebP、遅延ロード）
3. コード分割（React.lazy）
4. APIレスポンスキャッシュ

#### 問題：ダッシュボード描画が重い
**解決**：
1. `React.memo`で不要な再レンダリング防止
2. 大量データは仮想スクロール（react-window）
3. グラフライブラリの軽量化
4. Webワーカーで重い計算を移譲

---

## 付録

### A. 主要ドキュメント一覧

| ドキュメント | 場所 | 用途 |
|-------------|------|------|
| **README.md** | `/README.md` | プロジェクト概要 |
| **CLAUDE.md** | `/CLAUDE.md` | Claude Code設定 |
| **お知らせ受信API仕様書** | `mcp-shared/docs/VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md` | Phase 7統合 |
| **統計送信仕様書** | `mcp-shared/docs/VoiceDrive_Stats_Webhook_Specification_20251007.md` | Phase 7統合 |
| **最終確認回答書** | `mcp-shared/docs/Final_Confirmation_Response_To_Medical_Team_20251007.md` | Phase 7質疑応答 |
| **AI要約** | `mcp-shared/docs/AI_SUMMARY.md` | 重要更新要約 |

### B. 参考リンク

- **React公式**：https://react.dev/
- **TypeScript公式**：https://www.typescriptlang.org/
- **Prisma公式**：https://www.prisma.io/
- **Tailwind CSS公式**：https://tailwindcss.com/
- **Express公式**：https://expressjs.com/
- **Vite公式**：https://vitejs.dev/

### C. サポート

#### 技術的な質問
- Slack: `#phase2-integration`
- MCPサーバー: `mcp-shared/docs/`

#### バグ報告
- GitHub Issues（プロジェクトリポジトリ）
- メール: voicedrive-dev@example.com

#### Phase 7統合サポート
- 医療チーム連絡先：（職員カルテチームSlack）
- VoiceDriveチーム連絡先：`#phase2-integration`

---

**最終更新：2025年10月7日**
**作成者：VoiceDrive開発チーム**

本ドキュメントは、VoiceDriveシステムの全体像を理解するための詳細説明書です。
開発・運用・統合作業にご活用ください。

---
