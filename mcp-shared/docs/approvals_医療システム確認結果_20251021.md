# 承認・対応管理ページ（Approvals）医療システム確認結果

**文書番号**: APV-MEDICAL-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: 医療職員カルテシステムチーム
**参照**: MASTER-APPROVALS-20251013-001（VoiceDrive側マスターリスト）
**重要度**: 🟢 情報共有
**ステータス**: 確認完了

---

## 📋 エグゼクティブサマリー

### 確認結論

**医療システム側の追加実装は不要** ✅

VoiceDrive側の承認・対応管理ページ（ApprovalsPage）に関する暫定マスターリストを確認しました。**データ管理責任分界点定義書（DM-DEF-2025-1008-001）**に基づき、通知・承認タスクデータは**VoiceDrive 100%管轄**であることを確認しました。

### 責任分界点

| データカテゴリ | VoiceDrive | 医療システム | 連携方法 |
|-------------|-----------|-------------|---------|
| **通知データ** | ✅ 100%管轄 | ❌ | - |
| **承認タスク** | ✅ 100%管轄 | ❌ | - |
| **通知アクション** | ✅ 100%管轄 | ❌ | - |
| **通知受信状態** | ✅ 100%管轄 | ❌ | - |
| **プロジェクト承認** | ✅ 100%管轄 | ❌ | - |
| **投票依頼** | ✅ 100%管轄 | ❌ | - |
| **職員情報** | キャッシュ | ✅ マスタ | API提供（既存） |
| **権限レベル** | キャッシュ | ✅ マスタ | API提供（既存） |
| **組織階層** | キャッシュ | ✅ マスタ | API提供（既存） |

---

## 🎯 医療システム側の対応要否

### A. DB実装：❌ **不要**

#### 理由

承認・対応管理に関連する全データはVoiceDrive側で管理されます。

**VoiceDrive側で実装されるテーブル**:
- ✅ `Notification`（通知データ）
- ✅ `NotificationAction`（通知アクション定義）
- ✅ `NotificationRecipient`（通知受信者状態管理）
- ✅ `ApprovalTask`（承認タスク詳細）
- ✅ `Post`（プロジェクト関連承認）
- ✅ `Poll`（投票依頼）

**医療システム側の対応**:
- ❌ テーブル追加不要
- ❌ スキーマ変更不要
- ❌ マイグレーション不要

### B. API実装：❌ **不要**

#### 既存APIで対応可能

VoiceDrive側では職員の権限レベル、組織階層情報をキャッシュとして保持しますが、最新情報は既存の職員APIから取得可能です。

**既存API**:
- ✅ `GET /api/v2/employees/:employeeId`（既存）- 職員詳細情報取得
- ✅ `GET /api/v2/employees/:employeeId/hierarchy`（既存）- 組織階層情報取得
- ✅ `GET /api/v2/employees`（既存）- 職員一覧取得

**用途**:
- 権限レベル確認（User.permissionLevel）
- 組織階層確認（User.parentId、上位承認者特定）
- 予算承認限度額確認（User.budgetApprovalLimit）

**追加実装**: ❌ 不要

### C. 既存API拡張：❌ **不要**

既存の職員情報APIで必要な全情報を提供可能です。

---

## 📊 承認・対応管理ページの概要

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

### 通知アクションタイプ

| actionId | ラベル | actionType | requiresComment | 用途 |
|----------|-------|-----------|----------------|------|
| `approve` | 承認 | primary | false | 承認実行 |
| `reject` | 却下 | danger | true | 却下実行（理由必須） |
| `view` | 詳細確認 | secondary | false | 詳細ページへ遷移 |
| `participate` | 参加する | primary | false | プロジェクトメンバー参加 |
| `decline` | 辞退する | secondary | true | プロジェクトメンバー辞退 |
| `vote` | 投票する | primary | false | 投票ページへ遷移 |
| `escalate` | エスカレート | danger | true | 上位承認者へ移行 |

---

## 🗂️ データフロー図

### 承認タスク作成フロー

```
VoiceDrive側:
  プロジェクト申請
    ↓
  ApprovalTask作成
    ↓
  NotificationService呼び出し
    ↓
  Notification作成（DB保存）
    ↓
  NotificationAction作成（承認/却下ボタン）
    ↓
  NotificationRecipient作成（承認者宛て）
    ↓
  承認者に通知表示
    ↓
  承認者がアクション実行（承認/却下）
    ↓
  NotificationRecipient更新（isActioned: true）
    ↓
  ApprovalTask更新（status: approved/rejected）

医療システム側:
  - 職員情報API提供（既存）
  - 権限レベルAPI提供（既存）
  - 組織階層API提供（既存）
```

### エスカレーションフロー

```
VoiceDrive側:
  承認期限切れ検出
    ↓
  組織階層情報取得（医療システムAPIから）
    ↓
  上位承認者特定
    ↓
  Notification作成（type: ESCALATION）
    ↓
  上位承認者に通知

医療システム側:
  - 組織階層API提供（既存）
```

---

## 🔍 医療システムが提供する既存データ

### 1. 職員権限レベル

**API**: `GET /api/v2/employees/:employeeId`

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

**API**: `GET /api/v2/employees/:employeeId/hierarchy`

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
  },
  "grandparent": {
    "id": "OH-NS-2024-040",
    "name": "佐藤事務長",
    "permissionLevel": 11.0
  }
}
```

**VoiceDrive側の利用**:
- エスカレーション時の上位承認者特定
- 緊急介入可能な上位者の特定

---

## 📐 VoiceDrive側の実装スケジュール提案

### Phase 1: データベース拡張（1-2日）

| 作業内容 | 状態 |
|---------|------|
| Notificationモデル拡張 | ⏳ VoiceDrive実装待ち |
| NotificationActionモデル作成 | ⏳ VoiceDrive実装待ち |
| NotificationRecipientモデル作成 | ⏳ VoiceDrive実装待ち |
| マイグレーション実行 | ⏳ VoiceDrive実装待ち |

### Phase 2: NotificationService実装（2-3日）

| 作業内容 | 状態 |
|---------|------|
| createActionableNotification() 実装 | ⏳ VoiceDrive実装待ち |
| executeNotificationAction() 実装 | ⏳ VoiceDrive実装待ち |
| registerActionCallback() 実装 | ⏳ VoiceDrive実装待ち |
| データベース永続化対応 | ⏳ VoiceDrive実装待ち |

### Phase 3: API実装（2-3日）

| 作業内容 | 状態 |
|---------|------|
| GET /api/notifications 実装 | ⏳ VoiceDrive実装待ち |
| POST /api/notifications/:id/action 実装 | ⏳ VoiceDrive実装待ち |
| PATCH /api/notifications/:id/read 実装 | ⏳ VoiceDrive実装待ち |
| 権限チェックロジック実装 | ⏳ VoiceDrive実装待ち |

### Phase 4: 統合テスト（1-2日）

| 作業内容 | 状態 |
|---------|------|
| フロントエンド・バックエンド統合 | ⏳ VoiceDrive実装待ち |
| 承認フロー動作確認 | ⏳ VoiceDrive実装待ち |
| エスカレーション動作確認 | ⏳ VoiceDrive実装待ち |
| パフォーマンステスト | ⏳ VoiceDrive実装待ち |

---

## 🔗 関連ドキュメント

### VoiceDrive側

- **MASTER-APPROVALS-20251013-001** - 承認・対応管理暫定マスターリスト（本分析の元資料）
- **DB-REQ-APPROVALS-20251013-001** - 承認・対応管理DB要件分析
- **DM-DEF-2025-1008-001** - データ管理責任分界点定義書

### 医療システム側

- **organization-analytics_医療システム確認結果_20251010.md** - 参考文書
- **project-approval_医療システム確認結果_20251011.md** - 参考文書
- **ProposalDocument_医療システム確認結果_20251021.md** - 参考文書
- **共通DB構築後_作業再開指示書_20250928.md** - マスタープラン

---

## ✅ 確認事項チェックリスト

### VoiceDriveチーム確認事項

- [ ] データ管理責任分界点の確認（VoiceDrive 100%管轄で問題ないか）
- [ ] 既存職員情報APIで必要な情報が取得可能か確認
- [ ] エスカレーション時の組織階層API仕様の確認
- [ ] 実装スケジュールの確認

### 医療システムチーム確認事項

- [x] ✅ DB実装不要を確認
- [x] ✅ API実装不要を確認
- [x] ✅ 既存API拡張不要を確認
- [x] ✅ 既存APIで必要なデータ提供可能を確認

---

## 🎯 次のアクション

### 医療システムチーム

1. ✅ **確認完了** - VoiceDrive側の暫定マスターリストを確認
2. ✅ **確認結果作成** - 本文書の作成
3. ⏳ **VoiceDriveチーム承認待ち** - 既存APIで問題ないか確認
4. ⏳ **待機** - VoiceDrive側の実装完了待ち

### VoiceDriveチーム

1. ⏳ **本文書のレビュー** - 医療システム側の確認結果を確認
2. ⏳ **既存API仕様の確認** - 必要な情報が取得可能か確認
3. ⏳ **Phase 1実装開始** - データベース拡張（1-2日）
4. ⏳ **Phase 2実装開始** - NotificationService実装（2-3日）
5. ⏳ **Phase 3実装開始** - API実装（2-3日）
6. ⏳ **Phase 4統合テスト** - 動作確認（1-2日）

---

## 📊 まとめ

### 医療システム側の対応範囲

| カテゴリ | 対応要否 | 優先度 | 実装時期 |
|---------|---------|-------|---------|
| **DB実装** | ❌ 不要 | - | - |
| **API実装** | ❌ 不要 | - | - |
| **既存API拡張** | ❌ 不要 | - | - |
| **既存API提供** | ✅ 継続 | - | 既存 |

### 結論

**VoiceDrive側の承認・対応管理ページ実装に対して、医療システム側の追加実装は一切不要です。**

データ管理責任分界点定義書に基づき、通知・承認タスクデータは全てVoiceDrive側で管理されるため、医療システム側でのDB実装、API実装、既存API拡張は不要です。

既存の職員情報API（権限レベル、組織階層）を継続提供することで、VoiceDrive側の承認・対応管理機能を支援します。

---

**文書終了**

---

**次のステップ**:
1. VoiceDriveチームによる本文書のレビュー
2. 既存API仕様の最終確認
3. VoiceDrive側の実装開始（Phase 1-4）

**連絡先**: 医療職員カルテシステムチーム
**最終更新**: 2025年10月21日
