# 承認・対応管理ページ（Approvals）分析完了報告＆医療システム確認依頼書

**文書番号**: APV-ANALYSIS-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDriveチーム
**宛先**: 医療職員カルテシステムチーム
**重要度**: 🟡 中優先度（Phase 1準備）
**ステータス**: 分析完了、実装準備中

---

## 📋 エグゼクティブサマリー

### 分析完了報告

**VoiceDrive側のApprovalsPage（承認・対応管理）の要件分析が完了しました** ✅

PersonalStationページと同様の詳細分析を実施し、以下の3つの文書を作成しました：

**作成文書**:
1. ✅ **approvals_DB要件分析_20251013.md**（DB要件分析書）
2. ✅ **approvals暫定マスターリスト_20251013.md**（マスターリスト）
3. ✅ **approvals_医療システム確認結果_20251021.md**（貴チームからの確認結果）

### 医療システム側からの回答（更新版）

**結論: 医療システム側の追加実装は最小限（合計0.8日）** 🟡

データ管理責任分界点定義書（DM-DEF-2025-1008-001）に基づき、通知・承認タスクデータは**VoiceDrive 100%管轄**であることを確認しました。

**医療システム側で必要な実装**:
1. 🟡 **組織階層API** - `GET /api/v2/employees/:employeeId/hierarchy`（推定工数: 0.5日）
   - エスカレーション機能に必要
   - Employee.supervisorIdフィールドを使用（既存）
2. 🟡 **budgetApprovalLimitフィールド** - Employeeテーブルに追加（推定工数: 0.3日）
   - 予算承認機能に必要
   - 権限レベルに応じた初期値設定

**合計推定工数**: 0.8日（約6-7時間）

**実装時期**: Phase 3（VoiceDrive側のAPI実装と並行）

---

## 📊 分析結果サマリー

### ApprovalsPageの概要

**ページ名**: 承認・対応管理 (Approvals)
**URL**: `/approvals`
**主な機能**: ユーザーの対応が必要な承認タスク・通知を一元管理

### 表示される通知カテゴリ

| カテゴリ | NotificationType | 説明 | データソース |
|---------|-----------------|------|-------------|
| 承認待ち | `APPROVAL_REQUIRED` | 予算承認、プロジェクト承認 | VoiceDrive |
| メンバー選定 | `MEMBER_SELECTION` | プロジェクトメンバー参加依頼 | VoiceDrive |
| 投票依頼 | `VOTE_REQUIRED` | 議題投票、提案投票 | VoiceDrive |
| 緊急対応 | `EMERGENCY_ACTION` | 緊急承認、緊急判断 | VoiceDrive |
| エスカレーション | `ESCALATION` | 期限切れによる上位承認者への移行 | VoiceDrive |
| プロジェクト更新 | `PROJECT_UPDATE` | プロジェクト状況変更通知 | VoiceDrive |
| 期限リマインダー | `DEADLINE_REMINDER` | 対応期限接近通知 | VoiceDrive |

---

## 📐 データ管理責任分界点

### VoiceDrive 100%管轄

| データカテゴリ | VoiceDrive | 医療システム | 連携方法 |
|-------------|-----------|-------------|---------|
| **通知データ** | ✅ 100%管轄 | ❌ | - |
| **承認タスク** | ✅ 100%管轄 | ❌ | - |
| **通知アクション** | ✅ 100%管轄 | ❌ | - |
| **通知受信状態** | ✅ 100%管轄 | ❌ | - |
| **プロジェクト承認** | ✅ 100%管轄 | ❌ | - |
| **投票依頼** | ✅ 100%管轄 | ❌ | - |

### 医療システムから取得（キャッシュ）

| データカテゴリ | VoiceDrive | 医療システム | 連携方法 |
|-------------|-----------|-------------|---------|
| **職員情報** | キャッシュ | ✅ マスタ | API提供（既存） |
| **権限レベル** | キャッシュ | ✅ マスタ | API提供（既存） |
| **組織階層** | キャッシュ | ✅ マスタ | API提供（既存） |
| **予算承認限度額** | キャッシュ | ✅ マスタ | API提供（既存） |

---

## 🗂️ 必要なデータベーステーブル（VoiceDrive側で実装）

### 1. Notificationテーブル拡張

**現状**: 既存テーブルあり（17フィールド）
**必要な追加フィールド**: 6フィールド

| フィールド | 型 | 説明 |
|-----------|------|------|
| `notificationType` | String? | APPROVAL_REQUIRED, MEMBER_SELECTION等 |
| `urgency` | String | normal, high, urgent |
| `actionRequired` | Boolean | アクション必須フラグ |
| `dueDate` | DateTime? | 対応期限 |
| `metadata` | Json? | { projectId, requestId, postId等 } |

**リレーション追加**:
- `actions` → NotificationAction[]
- `recipients` → NotificationRecipient[]

---

### 2. NotificationActionテーブル（新規作成）

**概要**: 通知ごとの実行可能アクションを定義

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | String | プライマリキー |
| `notificationId` | String | 通知ID（外部キー） |
| `actionId` | String | approve, reject, view等 |
| `label` | String | 承認、却下、詳細確認 |
| `actionType` | String | primary, secondary, danger |
| `requiresComment` | Boolean | コメント必須フラグ |
| `order` | Int | 表示順序 |

**Prismaスキーマ案**:
```prisma
model NotificationAction {
  id              String       @id @default(cuid())
  notificationId  String
  actionId        String
  label           String
  actionType      String
  requiresComment Boolean      @default(false)
  order           Int          @default(0)
  createdAt       DateTime     @default(now())

  notification    Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)

  @@index([notificationId])
  @@unique([notificationId, actionId])
}
```

---

### 3. NotificationRecipientテーブル（新規作成）

**概要**: 通知受信者ごとの状態管理

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | String | プライマリキー |
| `notificationId` | String | 通知ID（外部キー） |
| `recipientId` | String | 受信者ID（外部キー） |
| `isRead` | Boolean | 既読フラグ |
| `isActioned` | Boolean | アクション実行済みフラグ |
| `actionType` | String? | approved, rejected等 |
| `actionComment` | String? | アクションコメント |
| `readAt` | DateTime? | 既読日時 |
| `actionedAt` | DateTime? | アクション実行日時 |

**Prismaスキーマ案**:
```prisma
model NotificationRecipient {
  id             String       @id @default(cuid())
  notificationId String
  recipientId    String

  isRead         Boolean      @default(false)
  isActioned     Boolean      @default(false)
  actionType     String?
  actionComment  String?

  readAt         DateTime?
  actionedAt     DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  notification   Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  recipient      User         @relation("NotificationRecipient", fields: [recipientId], references: [id], onDelete: Cascade)

  @@unique([notificationId, recipientId])
  @@index([recipientId, isRead])
  @@index([recipientId, isActioned])
}
```

---

### 4. ApprovalTaskテーブル（既存活用）

**現状**: 既存テーブルあり（19フィールド）

**主要フィールド**:
- `title` - タスクタイトル
- `taskType` - タスク種別
- `amount` - 予算額
- `requesterId` - 申請者ID
- `approverId` - 承認者ID
- `status` - pending, approved, rejected
- `priority` - low, medium, high, urgent

**用途**: 承認タスクのビジネスデータ保持、通知システムと連携

---

## 📊 暫定マスターリスト

### 通知タイプマスター

| ID | 値 | 日本語名 | アイコン |
|----|---|---------|---------|
| 1 | `APPROVAL_REQUIRED` | 承認待ち | 📋 |
| 2 | `MEMBER_SELECTION` | メンバー選定 | 👥 |
| 3 | `VOTE_REQUIRED` | 投票依頼 | 🗳️ |
| 4 | `EMERGENCY_ACTION` | 緊急対応 | 🚨 |
| 5 | `ESCALATION` | エスカレーション | ⬆️ |
| 6 | `PROJECT_UPDATE` | プロジェクト更新 | 📊 |
| 7 | `DEADLINE_REMINDER` | 期限リマインダー | ⏰ |

### 通知アクションタイプマスター

| ID | actionId | ラベル | actionType | requiresComment |
|----|----------|-------|-----------|----------------|
| 1 | `approve` | 承認 | primary | false |
| 2 | `reject` | 却下 | danger | true |
| 3 | `view` | 詳細確認 | secondary | false |
| 4 | `participate` | 参加する | primary | false |
| 5 | `decline` | 辞退する | secondary | true |
| 6 | `vote` | 投票する | primary | false |
| 7 | `escalate` | エスカレート | danger | true |

### 優先度マスター

| ID | 値 | 日本語名 | 対応期限目安 |
|----|---|---------|------------|
| 1 | `low` | 低 | 7日以内 |
| 2 | `medium` | 中 | 3日以内 |
| 3 | `high` | 高 | 1日以内 |
| 4 | `urgent` | 緊急 | 6時間以内 |

### 緊急度マスター

| ID | 値 | 日本語名 | 音響アラート |
|----|---|---------|-----------|
| 1 | `normal` | 通常 | なし |
| 2 | `high` | 高 | 1回 |
| 3 | `urgent` | 緊急 | 3回 |

---

## 🔍 医療システムが提供する既存データ

### 1. 職員権限レベル

**API**: `GET /api/v2/employees/:employeeId`（既存）

**Response例**:
```json
{
  "id": "OH-NS-2024-020",
  "name": "田中看護師長",
  "permissionLevel": 8.0,
  "accountType": "DEPARTMENT_HEAD",
  "department": "医療療養病棟",
  "budgetApprovalLimit": 500000
}
```

**VoiceDrive側の利用**:
- `permissionLevel`: 承認権限判定（Level 3+で承認管理権限）
- `budgetApprovalLimit`: 予算承認可能金額判定
- `accountType`: 緊急対応権限判定（DEPARTMENT_HEAD以上）

### 2. 組織階層情報

**API**: `GET /api/v2/employees/:employeeId/hierarchy`（既存）

**Response例**:
```json
{
  "employee": {
    "id": "OH-NS-2024-020",
    "name": "田中看護師長",
    "permissionLevel": 8.0
  },
  "parent": {
    "id": "OH-NS-2024-030",
    "name": "山田部長",
    "permissionLevel": 10.0
  }
}
```

**VoiceDrive側の利用**:
- エスカレーション時の上位承認者特定
- 緊急介入可能な上位者の特定

---

## 🎯 VoiceDrive側の実装計画

### Phase 1: データベース拡張（1-2日）

| 作業内容 | 状態 |
|---------|------|
| Notificationモデル拡張 | ⏳ 準備中 |
| NotificationActionモデル作成 | ⏳ 準備中 |
| NotificationRecipientモデル作成 | ⏳ 準備中 |
| Userモデルリレーション追加 | ⏳ 準備中 |
| Prismaマイグレーション実行 | ⏳ 準備中 |

### Phase 2: NotificationService実装（2-3日）

| 作業内容 | 状態 |
|---------|------|
| createActionableNotification() 実装 | ⏳ 準備中 |
| executeNotificationAction() 実装 | ⏳ 準備中 |
| registerActionCallback() 実装 | ⏳ 準備中 |
| データベース永続化対応 | ⏳ 準備中 |

### Phase 3: API実装（2-3日）

| 作業内容 | 状態 |
|---------|------|
| GET /api/notifications 実装 | ⏳ 準備中 |
| POST /api/notifications/:id/action 実装 | ⏳ 準備中 |
| PATCH /api/notifications/:id/read 実装 | ⏳ 準備中 |
| 権限チェックロジック実装 | ⏳ 準備中 |

### Phase 4: 統合テスト（1-2日）

| 作業内容 | 状態 |
|---------|------|
| フロントエンド・バックエンド統合 | ⏳ 準備中 |
| 承認フロー動作確認 | ⏳ 準備中 |
| エスカレーション動作確認 | ⏳ 準備中 |
| パフォーマンステスト | ⏳ 準備中 |

---

## ✅ 医療システムチーム確認事項

### 即時確認事項

- [ ] VoiceDrive側の分析内容を確認
- [ ] データ管理責任分界点の確認（VoiceDrive 100%管轄で問題ないか）
- [ ] 既存職員情報APIで必要な情報が提供可能か確認

### 確認済み事項（貴チームからの確認結果より）

- [x] ✅ DB実装不要を確認
- [x] ✅ API実装不要を確認
- [x] ✅ 既存API拡張不要を確認
- [x] ✅ 既存APIで必要なデータ提供可能を確認

---

## 🔗 関連ドキュメント

### VoiceDrive側

- **[approvals_DB要件分析_20251013.md](./approvals_DB要件分析_20251013.md)** - DB要件分析書
- **[approvals暫定マスターリスト_20251013.md](./approvals暫定マスターリスト_20251013.md)** - マスターリスト
- **[DM-DEF-2025-1008-001](./データ管理責任分界点定義書_20251008.md)** - データ管理責任分界点定義書

### 医療システム側

- **[approvals_医療システム確認結果_20251021.md](./approvals_医療システム確認結果_20251021.md)** - 貴チームからの確認結果

---

## 🎯 次のアクション

### VoiceDriveチーム

1. ✅ **分析完了** - DB要件分析、マスターリスト作成
2. ⏳ **Phase 1開始準備** - schema.prisma更新準備
3. ⏳ **医療チーム回答待ち** - 既存APIで問題ないか最終確認

### 医療システムチーム

1. ⏳ **本文書のレビュー** - 分析内容の確認
2. ⏳ **既存API仕様の確認** - 必要な情報が提供可能か確認
3. ⏳ **データ管理責任分界点の承認** - VoiceDrive 100%管轄で問題ないか確認

---

## 📊 まとめ

### VoiceDrive側の対応状況

| カテゴリ | 分析 | Phase 1 | Phase 2-4 |
|---------|------|---------|----------|
| **DB要件分析** | ✅ 完了 | ⏳ 準備中 | - |
| **マスターリスト** | ✅ 完了 | ⏳ 準備中 | - |
| **スキーマ設計** | ✅ 完了 | ⏳ 準備中 | - |
| **実装** | - | ⏳ 準備中 | ⏳ 予定 |

### 医療システム側の対応要否

| カテゴリ | 対応要否 | 優先度 | 推定工数 | 実装時期 |
|---------|---------|-------|---------|---------|
| **DB拡張** | 🟡 必要 | 中 | 0.3日 | Phase 3 |
| **API実装** | 🟡 必要 | 中 | 0.5日 | Phase 3 |
| **既存API拡張** | 🟡 必要 | 中 | 0.3日 | Phase 3 |
| **既存API提供** | ✅ 継続 | - | - | 既存 |
| **合計推定工数** | - | - | **0.8日** | - |

#### 必要な実装詳細

1. **組織階層API** - `GET /api/v2/employees/:employeeId/hierarchy`
   - 推定工数: 0.5日（4時間）
   - Employee.supervisorIdフィールドを使用（既存）

2. **budgetApprovalLimitフィールド** - Employeeテーブルに追加
   - 推定工数: 0.3日（2-3時間）
   - 権限レベルに応じた初期値設定

### 結論

**VoiceDrive側の承認・対応管理ページ分析が完了しました。**

医療システム側の追加実装は最小限（合計0.8日）です。組織階層APIとbudgetApprovalLimitフィールドをPhase 3で実装していただくことで、VoiceDrive側の承認・エスカレーション機能を実現できます。

---

**文書終了**

---

**次のステップ**:
1. 医療システムチームによる本文書のレビュー
2. 既存API仕様の最終確認
3. VoiceDrive側のPhase 1実装開始

**連絡先**: VoiceDriveチーム
**最終更新**: 2025年10月21日
