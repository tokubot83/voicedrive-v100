# 施設ガバナンスページ DB要件分析

**文書番号**: FG-DB-REQ-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**目的**: 施設ガバナンスページのDB要件を明確化し、医療システムとの責任分界を定義
**重要度**: 🔴 最重要
**関連文書**: データ管理責任分界点定義書_20251008.md

---

## 📋 エグゼクティブサマリー

### 背景
- 施設ガバナンスページは**既に実装完了**（4タブ、デモデータ、権限制御Level 10+）
- 現在は**デモデータのみ**でDB未統合
- CommitteeManagement方式と同様のDB構築とAPI連携が必要

### 実装状況
- ✅ UI完全実装（[FacilityGovernancePage.tsx](src/pages/FacilityGovernancePage.tsx):428行）
- ✅ 権限制御実装（Level 10+: 部長・医局長以上）
- ✅ 4タブ構成（方針・規則、コンプライアンス、リスク管理、透明性レポート）
- ❌ DB未構築（schema.prismaにガバナンス関連テーブル無し）
- ❌ 医療システムAPI連携未実装

### DB構築方針
1. **VoiceDrive管轄データ**: 方針、コンプライアンスチェック、リスク、監査ログ
2. **医療システム連携**: 職員情報（方針管理者、リスク担当者等）
3. **データ管理責任**: データ管理責任分界点定義書に準拠

---

## 🎯 ページ機能分析

### 対象URL
- **本番URL**: https://voicedrive-v100.vercel.app/facility-governance
- **権限レベル**: Level 10+（部長・医局長以上）
- **ソースファイル**: [src/pages/FacilityGovernancePage.tsx](src/pages/FacilityGovernancePage.tsx)

### ヘッダー統計サマリー

**表示項目**:
1. **運用中の方針** (activePolicies): `status === 'active'` のPolicy数
2. **平均遵守率** (avgCompliance): ComplianceCheckのスコア平均
3. **管理中リスク** (activeRisks): `status !== 'resolved'` のRisk数
4. **コンプライアンス課題** (complianceIssues): ComplianceCheckのissues合計

**データソース**:
- ✅ VoiceDrive管轄: 全て集計値（DB集計またはキャッシュ）

---

### タブ1: 方針・規則（Policies）

**画面機能**:
- 方針・規則の一覧表示
- 各方針のステータス表示（運用中、草案、審査中）
- 遵守率の進捗バー表示
- 方針ダウンロード機能

**必要データ**:
```typescript
Policy {
  id: string
  title: string                      // 方針タイトル
  category: string                   // カテゴリ（コンプライアンス、安全管理、人事等）
  version: string                    // バージョン（例: v2.1）
  lastUpdated: Date                  // 最終更新日
  status: 'active' | 'draft' | 'review'
  compliance: number                 // 遵守率（%）

  // 拡張情報
  description?: string               // 方針説明
  content?: string                   // 方針本文（PDF URL or テキスト）
  owner?: string                     // 管理責任者名（医療システムから取得）
  ownerId?: string                   // User.id
  approvedBy?: string                // 承認者名（医療システムから取得）
  approvedDate?: Date                // 承認日
  nextReviewDate?: Date              // 次回見直し日
  relatedPolicies?: string[]         // 関連方針ID
  applicableScope?: string           // 適用範囲（全施設、部門限定等）
}
```

**データソース**:
- ✅ VoiceDrive管轄:
  - 方針内容: title, description, content, category, version
  - ステータス: status, lastUpdated, approvedDate, nextReviewDate
  - 関連情報: relatedPolicies, applicableScope
  - 遵守率: compliance（VoiceDrive計算）
- 🔵 医療システム連携:
  - 職員情報: owner, approvedBy（API取得）

**UI表示項目**:
- タイトル、ステータスバッジ
- カテゴリ、バージョン
- 更新日
- 遵守率（プログレスバー）
- ダウンロードボタン

---

### タブ2: コンプライアンス（Compliance）

**画面機能**:
- コンプライアンスチェック結果の一覧表示
- 各項目のステータス表示（遵守、警告、違反）
- スコア表示（プログレスバー）
- 課題数表示

**必要データ**:
```typescript
ComplianceCheck {
  id: string
  area: string                       // チェック領域（医療安全管理、個人情報保護、労働基準等）
  status: 'compliant' | 'warning' | 'non_compliant'
  score: number                      // スコア（0-100）
  lastCheck: Date                    // 最終チェック日
  issues: number                     // 検出課題数

  // 拡張情報
  checkType?: string                 // チェックタイプ（定期、臨時、監査等）
  checker?: string                   // チェック担当者名（医療システムから取得）
  checkerId?: string                 // User.id
  issueDetails?: Json                // 課題詳細（配列）
  correctiveActions?: string         // 是正措置
  nextCheckDate?: Date               // 次回チェック予定日
  responsible?: string               // 責任者名（医療システムから取得）
  responsibleId?: string             // User.id
}
```

**データソース**:
- ✅ VoiceDrive管轄:
  - チェック結果: area, status, score, issues, lastCheck
  - 是正措置: correctiveActions, issueDetails
  - スケジュール: nextCheckDate
- 🔵 医療システム連携:
  - 職員情報: checker, responsible（API取得）

**UI表示項目**:
- チェック領域、ステータスアイコン
- 最終チェック日
- スコア（プログレスバー、色分け）
- 課題数（issues > 0の場合）

---

### タブ3: リスク管理（Risks）

**画面機能**:
- リスク一覧表示
- リスクレベル表示（高、中、低）
- ステータス表示（特定済、対策中、解決済）
- 発生確率・担当部署表示

**必要データ**:
```typescript
Risk {
  id: string
  title: string                      // リスクタイトル
  category: string                   // カテゴリ（医療安全、情報セキュリティ、人事等）
  severity: 'high' | 'medium' | 'low'
  probability: 'high' | 'medium' | 'low'
  status: 'identified' | 'mitigating' | 'resolved'
  owner: string                      // 担当部署（医療システムから取得）
  ownerId?: string                   // User.id or 部署ID

  // 拡張情報
  description?: string               // リスク説明
  impactDescription?: string         // 影響説明
  identifiedDate?: Date              // 特定日
  mitigationPlan?: string            // 対策計画
  mitigationStatus?: string          // 対策状況
  resolvedDate?: Date                // 解決日
  responsible?: string               // 責任者名（医療システムから取得）
  responsibleId?: string             // User.id
  relatedIncidents?: string[]        // 関連インシデントID
  reviewDate?: Date                  // 次回レビュー日
}
```

**データソース**:
- ✅ VoiceDrive管轄:
  - リスク情報: title, description, category, severity, probability
  - ステータス: status, identifiedDate, resolvedDate
  - 対策: mitigationPlan, mitigationStatus
  - 関連情報: relatedIncidents, reviewDate
- 🔵 医療システム連携:
  - 職員・部署情報: owner, responsible（API取得）

**UI表示項目**:
- タイトル、重大度バッジ、ステータスバッジ
- カテゴリ
- 発生確率
- 担当部署

---

### タブ4: 透明性レポート（Transparency）

**画面機能**:
- 透明性レポート機能（開発中）
- 予定機能: 監査ログ、意思決定履歴、透明性スコア

**必要データ（将来実装）**:
```typescript
TransparencyReport {
  id: string
  reportType: 'audit_log' | 'decision_history' | 'transparency_score'
  period: string                     // 対象期間
  generatedDate: Date
  generatedBy: string                // 作成者名（医療システムから取得）
  generatedById: string              // User.id

  // 監査ログサマリー
  auditLogSummary?: {
    totalActions: number
    actionsByCategory: Record<string, number>
    criticalActions: number
  }

  // 意思決定履歴
  decisionHistory?: {
    totalDecisions: number
    decisionsByType: Record<string, number>
    transparencyScore: number
  }

  // レポートファイル
  reportUrl?: string                 // レポートファイルURL
  reportData?: Json                  // レポートデータ
}
```

**データソース**:
- ✅ VoiceDrive管轄: 全てのレポートデータ（監査ログ、意思決定履歴等）
- 🔵 医療システム連携: generatedBy（API取得）

**実装状況**: ❌ 未実装（将来実装予定）

---

## 📊 データ管理責任マトリクス

データ管理責任分界点定義書に基づく詳細分析:

### カテゴリ1: 方針・規則（Policy）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 方針ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| タイトル・説明（title, description） | ✅ マスタ | - | - | VoiceDrive管轄 |
| カテゴリ（category） | ✅ マスタ | - | - | VoiceDrive定義 |
| バージョン（version） | ✅ マスタ | - | - | VoiceDrive管理 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive管理 |
| 遵守率（compliance） | ✅ マスタ | - | - | VoiceDrive計算 |
| 方針本文（content） | ✅ マスタ | - | - | VoiceDrive管理 |
| 管理責任者（owner） | キャッシュ | ✅ マスタ | API | 職員名取得 |
| 承認者（approvedBy） | キャッシュ | ✅ マスタ | API | 職員名取得 |
| 日時（lastUpdated, approvedDate） | ✅ マスタ | - | - | VoiceDrive管理 |

**方針**:
- 方針の内容・バージョン・遵守率は**VoiceDriveが管轄**
- 職員情報（管理責任者、承認者）は**医療システムからAPI取得**してキャッシュ

---

### カテゴリ2: コンプライアンスチェック（ComplianceCheck）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| チェックID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| チェック領域（area） | ✅ マスタ | - | - | VoiceDrive定義 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive判定 |
| スコア（score） | ✅ マスタ | - | - | VoiceDrive計算 |
| 課題数（issues） | ✅ マスタ | - | - | VoiceDrive集計 |
| チェック日（lastCheck） | ✅ マスタ | - | - | VoiceDrive管理 |
| チェック担当者（checker） | キャッシュ | ✅ マスタ | API | 職員名取得 |
| 責任者（responsible） | キャッシュ | ✅ マスタ | API | 職員名取得 |
| 是正措置（correctiveActions） | ✅ マスタ | - | - | VoiceDrive管理 |

**方針**:
- チェック結果・スコア・是正措置は**VoiceDriveが管轄**
- 職員情報（チェック担当者、責任者）は**医療システムからAPI取得**

---

### カテゴリ3: リスク管理（Risk）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| リスクID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| タイトル・説明（title, description） | ✅ マスタ | - | - | VoiceDrive管轄 |
| カテゴリ（category） | ✅ マスタ | - | - | VoiceDrive定義 |
| 重大度（severity） | ✅ マスタ | - | - | VoiceDrive判定 |
| 発生確率（probability） | ✅ マスタ | - | - | VoiceDrive判定 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive管理 |
| 担当部署（owner） | キャッシュ | ✅ マスタ | API | 部署名取得 |
| 責任者（responsible） | キャッシュ | ✅ マスタ | API | 職員名取得 |
| 対策計画（mitigationPlan） | ✅ マスタ | - | - | VoiceDrive管理 |
| 関連インシデント（relatedIncidents） | ✅ マスタ | - | - | VoiceDrive管理 |

**方針**:
- リスク情報・対策計画は**VoiceDriveが管轄**
- 職員・部署情報は**医療システムからAPI取得**

---

### カテゴリ4: 透明性レポート（TransparencyReport）- 将来実装

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| レポートID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| レポートタイプ（reportType） | ✅ マスタ | - | - | VoiceDrive定義 |
| 対象期間（period） | ✅ マスタ | - | - | VoiceDrive指定 |
| 監査ログデータ（auditLogSummary） | ✅ マスタ | - | - | VoiceDrive集計 |
| 意思決定履歴（decisionHistory） | ✅ マスタ | - | - | VoiceDrive集計 |
| 作成者（generatedBy） | キャッシュ | ✅ マスタ | API | 職員名取得 |

**方針**:
- レポートデータは**VoiceDriveが管轄**（監査ログ、意思決定履歴等）
- 作成者情報は**医療システムからAPI取得**

---

## 🏗️ 必要なDBテーブル設計

### テーブル1: FacilityPolicy（方針・規則）

```prisma
model FacilityPolicy {
  id               String    @id @default(cuid())

  // 基本情報
  title            String
  description      String?
  category         String    // 'コンプライアンス' | '安全管理' | '人事' | '医療安全' | 'その他'
  version          String    // バージョン（例: v2.1）

  // ステータス
  status           String    @default("draft") // 'active' | 'draft' | 'review'

  // 遵守率
  compliance       Float     @default(0) // 遵守率（%）

  // 方針本文
  content          String?   // 方針本文（テキスト）
  contentUrl       String?   // 方針ファイルURL（PDF等）

  // 管理情報
  owner            String?   // 管理責任者名（キャッシュ）
  ownerId          String?   // User.id
  approvedBy       String?   // 承認者名（キャッシュ）
  approverId       String?   // User.id

  // 日時
  lastUpdated      DateTime  @updatedAt
  approvedDate     DateTime?
  nextReviewDate   DateTime?

  // 関連情報
  relatedPolicies  Json?     // string[] - 関連方針ID
  applicableScope  String?   // 適用範囲（全施設、部門限定等）

  // タイムスタンプ
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // リレーション
  ownerUser        User?     @relation("PolicyOwner", fields: [ownerId], references: [id])
  approverUser     User?     @relation("PolicyApprover", fields: [approverId], references: [id])

  @@index([ownerId])
  @@index([approverId])
  @@index([status])
  @@index([category])
  @@index([nextReviewDate])
}
```

---

### テーブル2: ComplianceCheck（コンプライアンスチェック）

```prisma
model ComplianceCheck {
  id                  String    @id @default(cuid())

  // 基本情報
  area                String    // チェック領域（医療安全管理、個人情報保護、労働基準等）
  checkType           String?   // チェックタイプ（定期、臨時、監査等）

  // ステータス
  status              String    // 'compliant' | 'warning' | 'non_compliant'
  score               Float     // スコア（0-100）
  issues              Int       @default(0) // 検出課題数

  // チェック情報
  lastCheck           DateTime
  checker             String?   // チェック担当者名（キャッシュ）
  checkerId           String?   // User.id

  // 課題詳細
  issueDetails        Json?     // 課題詳細（配列）
  correctiveActions   String?   // 是正措置

  // 責任者
  responsible         String?   // 責任者名（キャッシュ）
  responsibleId       String?   // User.id

  // スケジュール
  nextCheckDate       DateTime?

  // タイムスタンプ
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // リレーション
  checkerUser         User?     @relation("ComplianceChecker", fields: [checkerId], references: [id])
  responsibleUser     User?     @relation("ComplianceResponsible", fields: [responsibleId], references: [id])

  @@index([checkerId])
  @@index([responsibleId])
  @@index([status])
  @@index([area])
  @@index([lastCheck])
  @@index([nextCheckDate])
}
```

---

### テーブル3: FacilityRisk（リスク管理）

```prisma
model FacilityRisk {
  id                  String    @id @default(cuid())

  // 基本情報
  title               String
  description         String?
  category            String    // '医療安全' | '情報セキュリティ' | '人事' | 'その他'

  // リスク評価
  severity            String    // 'high' | 'medium' | 'low'
  probability         String    // 'high' | 'medium' | 'low'
  impactDescription   String?   // 影響説明

  // ステータス
  status              String    @default("identified") // 'identified' | 'mitigating' | 'resolved'

  // 担当情報
  owner               String    // 担当部署（キャッシュ）
  ownerId             String?   // User.id or 部署ID
  responsible         String?   // 責任者名（キャッシュ）
  responsibleId       String?   // User.id

  // 対策情報
  identifiedDate      DateTime  @default(now())
  mitigationPlan      String?   // 対策計画
  mitigationStatus    String?   // 対策状況
  resolvedDate        DateTime?

  // 関連情報
  relatedIncidents    Json?     // string[] - 関連インシデントID
  reviewDate          DateTime?

  // タイムスタンプ
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // リレーション
  responsibleUser     User?     @relation("RiskResponsible", fields: [responsibleId], references: [id])

  @@index([responsibleId])
  @@index([status])
  @@index([severity])
  @@index([category])
  @@index([identifiedDate])
  @@index([reviewDate])
}
```

---

### テーブル4: TransparencyReport（透明性レポート）- 将来実装

```prisma
model TransparencyReport {
  id                  String    @id @default(cuid())

  // 基本情報
  reportType          String    // 'audit_log' | 'decision_history' | 'transparency_score'
  period              String    // 対象期間（例: '2025年10月'）

  // 作成者
  generatedBy         String    // 作成者名（キャッシュ）
  generatedById       String    // User.id
  generatedDate       DateTime  @default(now())

  // レポートデータ
  auditLogSummary     Json?     // 監査ログサマリー
  decisionHistory     Json?     // 意思決定履歴
  reportData          Json?     // その他レポートデータ

  // レポートファイル
  reportUrl           String?   // レポートファイルURL（PDF等）

  // タイムスタンプ
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // リレーション
  generator           User      @relation("ReportGenerator", fields: [generatedById], references: [id])

  @@index([generatedById])
  @@index([reportType])
  @@index([generatedDate])
}
```

---

## 🔗 医療システムAPI連携要件

### API 1: 職員情報取得

**エンドポイント**: `GET /api/employees/{employeeId}`

**用途**:
- 方針の管理責任者・承認者情報取得
- コンプライアンスチェックの担当者・責任者情報取得
- リスクの責任者情報取得

**レスポンス例**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "name": "山田 花子",
  "department": "内科",
  "position": "看護部長",
  "permissionLevel": 10.0
}
```

---

### API 2: 部署マスタ取得

**エンドポイント**: `GET /api/departments`

**用途**:
- リスクの担当部署（owner）検証

**レスポンス例**:
```json
{
  "departments": [
    { "id": "medical_care_ward", "name": "内科", "facilityId": "obara-hospital" },
    { "id": "surgical_ward", "name": "外科", "facilityId": "obara-hospital" }
  ]
}
```

---

### API 3: 複数職員情報一括取得（パフォーマンス最適化）

**エンドポイント**: `POST /api/employees/batch`

**用途**:
- 方針一覧の管理責任者・承認者情報を一括取得
- コンプライアンスチェック一覧の担当者情報を一括取得

**リクエスト例**:
```json
{
  "employeeIds": ["OH-NS-2024-001", "OH-NS-2024-002", "OH-NS-2024-003"]
}
```

**レスポンス例**:
```json
{
  "employees": [
    { "employeeId": "OH-NS-2024-001", "name": "山田 花子", "department": "内科", "position": "看護部長" },
    { "employeeId": "OH-NS-2024-002", "name": "佐藤 太郎", "department": "外科", "position": "医師" }
  ]
}
```

---

## 🚧 不足項目まとめ

### A. DBテーブル（schema.prisma）
1. ❌ `FacilityPolicy` - 方針・規則
2. ❌ `ComplianceCheck` - コンプライアンスチェック
3. ❌ `FacilityRisk` - リスク管理
4. ❌ `TransparencyReport` - 透明性レポート（将来実装）

### B. Userモデルへの追加リレーション
```prisma
model User {
  // 既存フィールド...

  // 施設ガバナンス追加リレーション
  policiesOwned              FacilityPolicy[]      @relation("PolicyOwner")
  policiesApproved           FacilityPolicy[]      @relation("PolicyApprover")
  complianceChecksPerformed  ComplianceCheck[]     @relation("ComplianceChecker")
  complianceResponsibilities ComplianceCheck[]     @relation("ComplianceResponsible")
  risksResponsible           FacilityRisk[]        @relation("RiskResponsible")
  transparencyReportsGenerated TransparencyReport[] @relation("ReportGenerator")
}
```

### C. 医療システムAPI
1. ❌ 職員情報取得API（単体）
2. ❌ 職員情報一括取得API（バッチ）
3. ❌ 部署マスタ取得API

### D. VoiceDrive API（医療システム向け提供）
- なし（施設ガバナンスは内部機能のため外部提供不要）

---

## 📅 実装ロードマップ

### Phase 1: DB構築（2日）

**Day 1**:
- [ ] schema.prisma更新（4テーブル追加）
- [ ] Prisma Migration実行
- [ ] Prisma Client再生成

**Day 2**:
- [ ] デモデータ投入スクリプト作成
- [ ] サービス層実装（FacilityGovernanceService.ts）
- [ ] 統合テスト（CRUD操作）

---

### Phase 2: 医療システムAPI連携（1日）

**Day 3**:
- [ ] 医療システムAPI仕様書作成
- [ ] VoiceDrive側API呼び出しロジック実装
- [ ] キャッシュ戦略実装（職員情報）
- [ ] 統合テスト（API連携）

---

### Phase 3: UI統合（1日）

**Day 4**:
- [ ] FacilityGovernancePage.tsxをDB版に接続
- [ ] リアルタイムデータ表示確認
- [ ] E2Eテスト

---

## ✅ 成功基準

### 機能要件
- [x] 4タブ全て動作（方針・規則、コンプライアンス、リスク管理、透明性レポート）
- [ ] 統計サマリー正確表示（運用中の方針、平均遵守率、管理中リスク、課題数）
- [ ] 方針ダウンロード機能動作
- [ ] リスクステータス更新機能動作

### 非機能要件
- [ ] ページ読み込み時間 < 2秒
- [ ] API応答時間 < 500ms
- [ ] データ整合性100%（医療システムと）

### データ管理
- [ ] VoiceDrive/医療システム責任分界明確
- [ ] 職員情報キャッシュ戦略確立
- [ ] 部署マスタ同期確認

---

## 📞 医療チームへの質問事項

### 質問1: 方針・規則の初期データ提供
施設ガバナンスページ稼働には以下の初期データが必要です：

1. **現行方針リスト**（個人情報保護方針、労働安全衛生規則、ハラスメント防止規定等）
2. **各方針の管理責任者**（employeeId）
3. **各方針の承認者**（employeeId）

これらは医療システムから提供可能ですか？それともVoiceDrive側で手動入力しますか？

---

### 質問2: コンプライアンスチェックの実施主体
コンプライアンスチェックは：

- VoiceDrive側で実施（チェックリスト機能実装）
- 医療システム側で実施（結果のみVoiceDriveに連携）
- 外部監査機関が実施（結果の手動入力）

どの方式を想定していますか？

---

### 質問3: リスク管理の連携範囲
リスク管理は：

- VoiceDrive独自のリスク管理機能（新規構築）
- 既存のリスク管理システムとの連携
- インシデント報告システムとの連携

どの方式を想定していますか？既存システムがある場合、API連携可能ですか？

---

## 📚 関連文書

- [データ管理責任分界点定義書_20251008.md](mcp-shared/docs/データ管理責任分界点定義書_20251008.md)
- [FacilityGovernancePage.tsx](src/pages/FacilityGovernancePage.tsx)
- [CommitteeManagement_DB要件分析_20251009.md](mcp-shared/docs/CommitteeManagement_DB要件分析_20251009.md)

---

**文書終了**

最終更新: 2025年10月9日
バージョン: 1.0
承認: 未承認（レビュー待ち）
