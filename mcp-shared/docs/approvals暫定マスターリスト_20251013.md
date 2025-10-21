# approvals (承認・対応管理) 暫定マスターリスト

**文書番号**: MASTER-APPROVALS-20251013-001
**作成日**: 2025年10月13日
**対象ページ**: https://voicedrive-v100.vercel.app/approvals
**参照**: [approvals_DB要件分析_20251013.md](./approvals_DB要件分析_20251013.md)
**重要度**: 🟢 中

---

## 📋 サマリー

### マスター定義の目的
ApprovalsPage（承認・対応管理）で使用する**通知タイプ、アクションタイプ、優先度、緊急度**を体系的に定義し、データベースおよびアプリケーション全体で一貫した値を使用する。

### データ管理責任
- **通知マスター**: 🟢 VoiceDrive管轄（アプリケーション定義）
- **ユーザー権限マスター**: 🔵 医療システム管轄（Permission Level 1-25）

---

## 🔔 通知タイプマスター (NotificationType)

### 定義場所
- TypeScript型定義: `src/services/NotificationService.ts`
- データベース: `Notification.notificationType` (String)

### 一覧

| ID | 値 | 日本語名 | 説明 | カテゴリ | アイコン |
|----|---|---------|------|---------|---------|
| 1 | `APPROVAL_REQUIRED` | 承認待ち | 予算承認、プロジェクト承認等 | approval | 📋 |
| 2 | `MEMBER_SELECTION` | メンバー選定 | プロジェクトメンバー参加依頼 | selection | 👥 |
| 3 | `VOTE_REQUIRED` | 投票依頼 | 議題投票、提案投票 | vote | 🗳️ |
| 4 | `EMERGENCY_ACTION` | 緊急対応 | 緊急承認、緊急判断 | emergency | 🚨 |
| 5 | `ESCALATION` | エスカレーション | 期限切れによる上位承認者への移行 | escalation | ⬆️ |
| 6 | `PROJECT_UPDATE` | プロジェクト更新 | プロジェクト状況変更通知 | project | 📊 |
| 7 | `DEADLINE_REMINDER` | 期限リマインダー | 対応期限接近通知 | reminder | ⏰ |

---

## 🎯 通知アクションタイプマスター (NotificationActionType)

### 定義場所
- データベース: `NotificationAction.actionId` (String)
- UI表示: ApprovalsPageコンポーネント

### 一覧

| ID | actionId | ラベル | actionType | requiresComment | 用途 |
|----|----------|-------|-----------|----------------|------|
| 1 | `approve` | 承認 | primary | false | 承認実行 |
| 2 | `reject` | 却下 | danger | true | 却下実行（理由必須） |
| 3 | `view` | 詳細確認 | secondary | false | 詳細ページへ遷移 |
| 4 | `participate` | 参加する | primary | false | プロジェクトメンバー参加 |
| 5 | `decline` | 辞退する | secondary | true | プロジェクトメンバー辞退 |
| 6 | `vote` | 投票する | primary | false | 投票ページへ遷移 |
| 7 | `escalate` | エスカレート | danger | true | 上位承認者へ移行 |

---

## 📊 優先度マスター (Priority)

### 一覧

| ID | 値 | 日本語名 | 対応期限目安 | 色 |
|----|---|---------|------------|-----|
| 1 | `low` | 低 | 7日以内 | gray |
| 2 | `medium` | 中 | 3日以内 | blue |
| 3 | `high` | 高 | 1日以内 | orange |
| 4 | `urgent` | 緊急 | 6時間以内 | red |

---

## ⚡ 緊急度マスター (Urgency)

### 一覧

| ID | 値 | 日本語名 | 通知チャンネル | 音響アラート |
|----|---|---------|-------------|-----------|
| 1 | `normal` | 通常 | ブラウザ、ストレージ | なし |
| 2 | `high` | 高 | ブラウザ、ストレージ | 1回 |
| 3 | `urgent` | 緊急 | ブラウザ、音響、ストレージ、メール | 3回 |

---

## 🔐 承認権限マスター (ApprovalPermission)

### ApprovalsPageで必要な権限

| 権限ID | 権限名 | 説明 | 必要レベル |
|-------|-------|------|----------|
| 1 | `APPROVAL_MANAGEMENT` | 承認管理権限 | Level 3+ |
| 2 | `EMERGENCY_AUTHORITY` | 緊急対応権限 | Level 5+ |
| 3 | `WEIGHT_ADJUSTMENT` | 重み付け調整権限 | Level 4+ |
| 4 | `PROJECT_MANAGEMENT` | プロジェクト管理権限 | Level 3+ |
| 5 | `MEMBER_SELECTION` | メンバー選定権限 | Level 2+ |

---

## 📅 通知ステータスマスター (NotificationStatus)

### 一覧

| ID | 値 | 日本語名 | 説明 |
|----|---|---------|------|
| 1 | `pending` | 送信待ち | 通知作成済み、送信前 |
| 2 | `sent` | 送信済み | 受信者に送信完了 |
| 3 | `completed` | 完了 | 通知フロー完全終了 |
| 4 | `expired` | 期限切れ | 対応期限を過ぎた |

---

**文書終了**

最終更新: 2025年10月13日
作成者: VoiceDriveチーム
