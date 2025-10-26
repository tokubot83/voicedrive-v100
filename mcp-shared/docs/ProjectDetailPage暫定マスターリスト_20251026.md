# ProjectDetailPage 暫定マスターリスト

**文書番号**: MST-2025-1026-002
**作成日**: 2025年10月26日
**対象ページ**: https://voicedrive-v100.vercel.app/project/:projectId
**参照文書**: [ProjectDetailPage_DB要件分析_20251026.md](./ProjectDetailPage_DB要件分析_20251026.md)

---

## 📋 概要

ProjectDetailPageで使用するマスターデータを整理し、医療システムとVoiceDriveの責任分担を明確化します。

---

## 🔵 医療システムが管理するマスター

### 1. 職員マスター（Employee）

| フィールド | 用途 | 使用箇所 |
|-----------|------|---------|
| employeeId | 職員ID | 著者・承認者・メンバーID |
| name | 氏名 | 名前表示 |
| department | 部署名 | 部署表示 |
| position | 役職 | 承認者役職 |
| avatar | アバター | 画像表示 |

**提供方法**: API + Webhook
**使用場所**: 著者情報、承認者、メンバー

---

### 2. 施設マスター（Facility）

| フィールド | 用途 |
|-----------|------|
| facilityId | 施設ID |
| facilityName | 施設名 |

**提供方法**: API（日次同期）

---

### 3. 部署マスター（Department）

| フィールド | 用途 |
|-----------|------|
| departmentId | 部署ID |
| departmentName | 部署名 |

**提供方法**: API（日次同期）

---

## 🟢 VoiceDriveが管理するマスター

### 1. プロジェクトステータス

| 値 | 表示 | 色 |
|----|------|-----|
| `pending` | 承認待ち | yellow |
| `approved` | 承認済み | green |
| `rejected` | 却下 | red |
| `in_progress` | 進行中 | blue |
| `completed` | 完了 | green |

---

### 2. プロジェクトカテゴリ

| 値 | 表示 |
|----|------|
| `system-improvement` | システム改善 |
| `workflow-improvement` | 業務フロー改善 |
| `environment-improvement` | 環境改善 |
| `cost-reduction` | コスト削減 |
| `quality-improvement` | 品質向上 |
| `other` | その他 |

---

### 3. 承認ステータス

| 値 | 表示 | 色 |
|----|------|-----|
| `pending` | 承認待ち | yellow |
| `approved` | 承認済み | green |
| `rejected` | 却下 | red |
| `skipped` | スキップ | gray |

---

### 4. メンバーステータス

| 値 | 表示 | 色 |
|----|------|-----|
| `invited` | 招待中 | yellow |
| `accepted` | 参加済み | green |
| `declined` | 辞退 | red |

---

### 5. 投票オプション

| 値 | 表示 | 重み |
|----|------|------|
| `strongly-support` | 強く賛成 | +2 |
| `support` | 賛成 | +1 |
| `neutral` | 中立 | 0 |
| `oppose` | 反対 | -1 |
| `strongly-oppose` | 強く反対 | -2 |

---

### 6. プロジェクト役割

| 値 | 表示 |
|----|------|
| `owner` | オーナー |
| `leader` | リーダー |
| `member` | メンバー |
| `advisor` | アドバイザー |
| `observer` | オブザーバー |

---

## 🔄 同期戦略

### 職員マスター
- **タイミング**: Webhook即時通知
- **イベント**: 入社、退職、異動、権限変更

### 施設・部署マスター
- **タイミング**: 日次バッチ（深夜2:00）
- **方法**: API差分取得

### VoiceDrive内部マスター
- **管理**: コード内定数定義
- **更新**: デプロイ時

---

## ✅ チェックリスト

### 医療システム側
- [ ] 職員情報API提供
- [ ] 施設マスターAPI提供
- [ ] 部署マスターAPI提供
- [ ] Webhook実装

### VoiceDrive側
- [ ] マスターキャッシュ機能
- [ ] Webhook受信
- [ ] 定数定義実装
- [ ] 整合性確認バッチ

---

**文書終了**

最終更新: 2025年10月26日
