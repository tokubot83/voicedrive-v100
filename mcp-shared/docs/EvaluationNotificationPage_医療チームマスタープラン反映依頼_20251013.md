# EvaluationNotificationPage マスタープラン反映依頼

**文書番号**: VD-REQUEST-2025-1013-005
**作成日**: 2025年10月13日
**送信元**: VoiceDrive開発チーム
**送信先**: 医療システム開発チーム
**件名**: EvaluationNotificationPage実装内容のマスタープラン反映依頼

---

## 📋 依頼概要

EvaluationNotificationPage（評価通知ページ）の分析・設計が完了しました。

以下の内容を**医療システムチームのマスタープラン**に反映していただき、DB構築タイミング（2025-11-01開始）に合わせて実装作業を再開できるよう、スケジュール調整をお願いします。

---

## ✅ 完了した作業

### 1. VoiceDrive側の作業完了事項

| 作業項目 | 完了日 | 成果物 |
|---------|--------|--------|
| ページ機能分析 | 2025-10-13 | `EvaluationNotificationPage_DB要件分析_20251013.md` |
| DB要件定義 | 2025-10-13 | 同上（814行） |
| マスター定義 | 2025-10-13 | `EvaluationNotificationPage暫定マスターリスト_20251013.md` |
| schema.prisma更新 | 2025-10-13 | `prisma/schema.prisma` (line 2648-2757) |
| 確認質問への回答 | 2025-10-13 | `EvaluationNotificationPage_VoiceDriveチーム回答書_20251013.md` |

### 2. schema.prisma実装内容

#### ✅ 追加したテーブル（2つ）

1. **EvaluationNotification**（評価通知テーブル）
   - 30フィールド
   - 9個のインデックス
   - V3評価システム対応（3軸評価、7段階グレード）

2. **NotificationSettings**（通知設定テーブル）
   - 12フィールド
   - 職員ごとの通知受信設定

#### ✅ Userモデルへの関連追加

```prisma
// EvaluationNotificationPage統合実装（2025-10-13）
evaluationNotifications       EvaluationNotification[]
notificationSettings          NotificationSettings?
```

---

## 🔄 マスタープランへの反映依頼事項

### 1. 実装スケジュールの登録

以下の3フェーズのスケジュールをマスタープランに登録してください：

| フェーズ | 期間 | 作業内容 | 担当チーム | 状態 |
|---------|------|---------|-----------|------|
| **Phase 1: DB構築** | 2025-11-01～11-10 | • Prisma Migration実行<br>• テーブル作成<br>• 初期データ投入 | VoiceDrive | 🟡 未開始 |
| **Phase 2: Webhook実装** | 2025-11-11～11-20 | • API-11～API-15実装<br>• 認証機能実装<br>• Idempotency保証実装 | 医療システム<br>＋ VoiceDrive | 🟡 未開始 |
| **Phase 3: UI実装** | 2025-11-21～12-11 | • フロントエンド実装<br>• 統合テスト<br>• ステージング検証 | VoiceDrive | 🟡 未開始 |

### 2. API実装タスクの登録

以下の5つのAPIをマスタープランに登録してください：

#### 医療システム側実装（2件）

| API番号 | API名 | メソッド | 説明 | 担当 | Phase |
|--------|-------|---------|------|------|-------|
| **API-11** | 評価結果開示Webhook送信 | POST | VoiceDriveへ評価開示通知 | 医療システム | Phase 2 |
| **API-15** | 異議申立受理Webhook送信 | POST | VoiceDriveへ異議申立通知 | 医療システム | Phase 2 |

#### VoiceDrive側実装（3件）

| API番号 | API名 | メソッド | 説明 | 担当 | Phase |
|--------|-------|---------|------|------|-------|
| **API-12** | Webhook受信エンドポイント | POST | 評価開示・異議申立通知受信 | VoiceDrive | Phase 2 |
| **API-13** | 通知一覧取得 | GET | 職員の通知一覧取得 | VoiceDrive | Phase 2 |
| **API-14** | 通知既読更新 | PUT | 通知の既読状態更新 | VoiceDrive | Phase 2 |

### 3. データ管理責任分界点の確認

以下の責任分担をマスタープランに明記してください：

| データ種類 | マスター管理 | 参照のみ | 備考 |
|----------|------------|---------|------|
| **評価データ** | 🏥 医療システム | 👁️ VoiceDrive | スコア、グレード、評価期間 |
| **通知ステータス** | ✅ VoiceDrive | 👁️ 医療システム | sent, delivered, read, failed |
| **異議申立データ** | 🏥 医療システム | 👁️ VoiceDrive | 申立内容、回答、ステータス |
| **通知設定** | ✅ VoiceDrive | - | 職員の通知受信設定 |

### 4. 技術仕様の確認・登録

#### Webhook認証方式（確定）

```typescript
// 回答書 質問7.2の回答: Option A
認証方式: Bearer Token (JWT)
アルゴリズム: HS256
有効期限: 1時間
共有シークレット: 環境変数で管理
```

#### Idempotency保証（確定）

```typescript
// 回答書 質問7.3の回答: Option A
実装方式: 医療システム側で自動リトライ
重複検出: medicalSystemEventId (webhookId) で判定
VoiceDrive側: 重複を検出したら200 OKで即座に応答
```

#### 異議申立データ管理（確定）

```typescript
// 回答書 質問7.4の回答: Option A
マスター管理: 医療システム
VoiceDrive: appealIdのみ保持（参照用）
異議申立フロー: VoiceDrive → 医療システムへAPI連携
```

#### 多言語対応（確定）

```typescript
// 回答書 質問7.5の回答: Option A
Phase 1-3: 日本語のみ
Phase 4以降: 多言語対応（i18n準備済み）
```

---

## 📦 反映対象ファイル

医療システムチームのマスタープランに以下のファイル内容を反映してください：

### 1. DB要件分析書（814行）
**ファイル**: `mcp-shared/docs/EvaluationNotificationPage_DB要件分析_20251013.md`

**重要セクション**:
- セクション3: データ管理責任分界点の定義
- セクション4: 不足項目の洗い出し（テーブル、API）
- セクション5: テーブル設計（EvaluationNotification, NotificationSettings）
- セクション6: API定義（API-11～API-15）

### 2. 暫定マスターリスト（更新版）
**ファイル**: `mcp-shared/docs/EvaluationNotificationPage暫定マスターリスト_20251013.md`

**重要セクション**:
- 🗄️ データベーススキーマ実装状況（新規追加）
- 実装スケジュール（3フェーズ）
- 次回作業タイミング（Phase 1開始時コマンド）

### 3. VoiceDriveチーム回答書
**ファイル**: `mcp-shared/docs/EvaluationNotificationPage_VoiceDriveチーム回答書_20251013.md`

**重要セクション**:
- 質問7.1～7.5への回答（技術仕様確定）
- 実装方針の明確化

### 4. schema.prisma（VoiceDrive側実装完了）
**ファイル**: `prisma/schema.prisma`

**該当行**: 2648-2757（新規追加110行）

---

## 🎯 Phase 1開始時（2025-11-01）の作業手順

### VoiceDrive側で実施（医療チームは参照のみ）

```bash
# ステップ1: Prismaマイグレーション実行
cd c:\projects\voicedrive-v100
npx prisma migrate dev --name add_evaluation_notification_tables

# ステップ2: Prismaクライアント再生成
npx prisma generate

# ステップ3: 初期データ投入
# mcp-shared/docs/EvaluationNotificationPage暫定マスターリスト_20251013.md
# 799-826行のSQLを実行

# ステップ4: テーブル作成確認
npx prisma studio
# → evaluation_notifications テーブル確認
# → notification_settings テーブル確認
```

### 医療システム側で準備（Phase 2開始前）

1. **Webhook送信機能の設計・実装準備**
   - API-11: 評価結果開示Webhook
   - API-15: 異議申立受理Webhook

2. **認証トークン生成機能の実装**
   - JWT生成（HS256、有効期限1時間）
   - 共有シークレット管理

3. **VoiceDriveのWebhook受信エンドポイント確認**
   - エンドポイントURL: `https://voicedrive.example.com/api/webhooks/evaluation-disclosed`
   - 認証ヘッダー: `Authorization: Bearer <JWT>`

---

## 📞 連絡・確認事項

### 1. マスタープラン反映後の確認依頼

以下を確認後、VoiceDriveチームへご連絡ください（Slack: #phase2-integration）：

- ✅ 実装スケジュール（3フェーズ）がマスタープランに登録された
- ✅ API実装タスク（API-11～API-15）が登録された
- ✅ データ管理責任分界点が明記された
- ✅ Phase 1開始日（2025-11-01）が確定した

### 2. Phase 1開始前の事前調整（10月末まで）

- 🔹 VoiceDriveのWebhook受信エンドポイントURL確定
- 🔹 JWT共有シークレットの交換方法合意
- 🔹 ステージング環境での疎通確認日程調整

### 3. 追加で必要な情報があれば

以下のファイルに詳細が記載されています：

| 情報種類 | 参照ファイル | セクション |
|---------|-----------|-----------|
| テーブル設計詳細 | `EvaluationNotificationPage_DB要件分析_20251013.md` | セクション5 |
| API仕様詳細 | 同上 | セクション6 |
| マスターデータ定義 | `EvaluationNotificationPage暫定マスターリスト_20251013.md` | セクション1-6 |
| 技術仕様確定事項 | `EvaluationNotificationPage_VoiceDriveチーム回答書_20251013.md` | 全体 |

---

## 📌 重要な決定事項（再確認）

| 項目 | 決定内容 | 根拠 |
|------|---------|------|
| **評価グレードマスター** | 医療システムと完全一致 | 回答書 質問7.1 |
| **Webhook認証** | Bearer Token (JWT) | 回答書 質問7.2 |
| **配信失敗処理** | 医療システム自動リトライ | 回答書 質問7.3 |
| **異議申立データ** | 医療システムが管理 | 回答書 質問7.4 |
| **多言語対応** | Phase 1-3は日本語のみ | 回答書 質問7.5 |

---

## 🚀 期待する成果

### マスタープラン反映後

1. ✅ 2025-11-01にPhase 1をスムーズに開始できる
2. ✅ 両チームの役割分担が明確になる
3. ✅ API実装タスクが適切にスケジューリングされる
4. ✅ Phase 2（Webhook実装）の準備が計画的に進む

### Phase 3完了後（2025-12-11）

1. ✅ 評価通知システムが本番稼働
2. ✅ 職員が評価結果をVoiceDriveで確認可能
3. ✅ 異議申立フローが統合システムで完結
4. ✅ 医療システム⇔VoiceDrive間のデータ連携が確立

---

## 📧 お問い合わせ

### VoiceDriveチーム
- **Slack**: #phase2-integration
- **担当者**: システム開発チーム
- **メール**: voicedrive-dev@example.com

### 本依頼書について
- 不明点や追加情報が必要な場合は、上記Slackチャンネルでお知らせください
- マスタープラン反映完了後、確認連絡をお願いします

---

**依頼書終了**

作成日: 2025年10月13日
次回確認: 2025年10月末（Phase 1開始前調整）
マスタープラン反映期限: 2025年10月20日
