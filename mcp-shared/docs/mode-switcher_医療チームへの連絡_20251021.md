# mode-switcher（システムモード管理）分析完了連絡書

**文書番号**: INFO-2025-1021-003
**作成日**: 2025年10月21日
**送信元**: VoiceDriveチーム
**送信先**: 医療職員管理システムチーム
**件名**: mode-switcherページ分析完了のご連絡（医療システム側の対応は不要です）

---

## 📋 エグゼクティブサマリー

### 結論

**mode-switcher（システムモード管理）ページの分析が完了しました。**

✅ **重要**: 医療システムチーム様への**依頼事項は一切ございません**。

| 項目 | 状態 | 詳細 |
|------|------|------|
| **医療システム側の実装** | ❌ **不要** | VoiceDrive内部で完結 |
| **新規API開発依頼** | ❌ **不要** | VoiceDrive独自機能 |
| **DB変更依頼** | ❌ **不要** | 医療システムDB不使用 |
| **確認質問** | ❌ **不要** | データ管理責任明確 |
| **VoiceDrive側実装** | ✅ **進行中** | 8日で完了予定 |

---

## 🎯 ページ概要

### 対象ページ
- **URL**: `/mode-switcher`
- **機能**: システムモード管理（レベル99専用）
- **目的**: 議題モード⇄プロジェクト化モードの切り替え管理

### 主要機能
1. **現在のシステムモード表示** - 議題モードまたはプロジェクト化モードの表示
2. **モード切り替え実行** - システム管理者による全社的なモード変更
3. **移行準備状況表示** - プロジェクト化モードへの移行準備の進捗確認
4. **統計ダッシュボード** - 月間投稿数、委員会提出数、職員参加率の表示
5. **監査ログ記録** - モード変更操作の記録

---

## 📊 データ管理責任の分析結果

### データ管理責任分界点の適用

**データ管理責任分界点定義書 (DM-DEF-2025-1008-001)** に基づき分析した結果、このページで使用する全データは**VoiceDrive 100%管轄**と判定されました。

| データ項目 | VoiceDrive | 医療システム | 判定理由 |
|-----------|-----------|-------------|---------|
| システムモード設定 | ✅ **マスタ** | ❌ | VoiceDrive内部の動作制御 |
| モード変更履歴 | ✅ **マスタ** | ❌ | 監査ログ |
| 月間投稿数 | ✅ **マスタ** | ❌ | Postテーブル（VoiceDrive活動データ） |
| 委員会提出数 | ✅ **マスタ** | ❌ | Postテーブル（スコア100点以上） |
| アクティブユーザー数 | ✅ **マスタ** | ❌ | User.lastLoginAt（VoiceDrive管理） |
| 総職員数 | キャッシュ | ✅ **マスタ** | 既にUserテーブルにキャッシュ済み |

### 判定根拠

1. **システムモード設定**: VoiceDrive内部の動作制御であり、医療システムは関与しない
2. **移行準備統計**: VoiceDriveのPost/Userテーブルのみで算出可能
3. **総職員数**: 既にUserテーブルにキャッシュされており、新規API不要

---

## 🔄 医療システムとの連携

### ❌ 新規API開発依頼: **不要**

**理由**:
- システムモード設定はVoiceDrive内部で完結
- 移行準備統計はVoiceDrive内のデータのみで計算可能
- 総職員数は既にUserテーブルにキャッシュ済み

### ❌ DB変更依頼: **不要**

**理由**:
- 医療システムのDBにはテーブル追加・変更なし
- VoiceDrive側のみで`SystemConfig`テーブルを新規作成

### ❌ 確認質問: **不要**

**理由**:
- データ管理責任が明確に分離されている
- VoiceDrive独自機能であり、医療システムは関与しない

---

## 💼 VoiceDrive側の実装計画

### 実装スケジュール

#### Phase 1: DB・基本API実装（2-3日）

| タスク | 工数 |
|-------|------|
| SystemConfigテーブル追加 | 0.5日 |
| User Relation追加 | 0.1日 |
| AuditLog確認・修正 | 0.2日 |
| マイグレーション実行 | 0.2日 |
| API-1実装（モード取得） | 0.5日 |
| API-2実装（モード変更） | 1日 |

**Phase 1合計**: 2.5日

---

#### Phase 2: 統計API・フロントエンド実装（2-3日）

| タスク | 工数 |
|-------|------|
| API-3実装（移行準備統計） | 1日 |
| systemModeService修正 | 0.5日 |
| useSystemMode実装 | 0.5日 |
| useMigrationStats実装 | 0.5日 |
| ModeSwitcherPage修正 | 1日 |

**Phase 2合計**: 3.5日

---

#### Phase 3: 履歴機能（オプション、1-2日）

| タスク | 工数 |
|-------|------|
| API-4実装（モード変更履歴） | 0.5日 |
| 履歴表示UI実装 | 0.5日 |
| テスト | 0.5日 |

**Phase 3合計**: 1.5日

---

#### Phase 4: インデックス最適化・テスト（1日）

| タスク | 工数 |
|-------|------|
| Postテーブルインデックス | 0.2日 |
| Userテーブルインデックス | 0.2日 |
| 統合テスト | 0.6日 |

**Phase 4合計**: 1日

---

**総工数**: 約8日（Phase 1-2のみで6日）

---

## 📝 新規追加テーブル

### SystemConfig テーブル

**目的**: システム全体設定の永続化（現在はLocalStorageのみ）

```prisma
model SystemConfig {
  id          String   @id @default(cuid())
  configKey   String   @unique
  configValue Json
  category    String   // "system", "feature", "ui"
  description String?
  isActive    Boolean  @default(true)
  updatedBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  updatedByUser User @relation("SystemConfigUpdater", fields: [updatedBy], references: [id])

  @@index([configKey])
  @@index([category])
  @@index([updatedAt])
  @@map("system_configs")
}
```

**保存データ例**:
```json
{
  "mode": "AGENDA_MODE",
  "enabledAt": "2025-10-21T10:00:00Z",
  "enabledBy": "user_abc123",
  "description": "議題システムモード - 委員会活性化・声を上げる文化の醸成",
  "migrationStatus": "completed"
}
```

---

## 🔍 新規実装API一覧

### VoiceDrive内部API（全て新規実装）

| エンドポイント | メソッド | 目的 | 優先度 |
|--------------|--------|------|--------|
| `/api/system/mode` | GET | システムモード取得 | 🔴 高 |
| `/api/system/mode` | PUT | システムモード変更 | 🔴 高 |
| `/api/system/mode/migration-stats` | GET | 移行準備統計取得 | 🟠 中 |
| `/api/system/mode/history` | GET | モード変更履歴取得 | 🟢 低 |

**重要**: 全てVoiceDrive内部APIであり、医療システムAPIは使用しません。

---

## 📌 データフロー図

```
ModeSwitcherPage (フロントエンド)
  ↓
VoiceDrive API (/api/system/mode)
  ↓
SystemConfig テーブル（VoiceDrive DB）
  ↓
AuditLog テーブル（VoiceDrive DB）
  ↓
LocalStorage更新（キャッシュ）
  ↓
全ユーザーに反映
```

**医療システムは一切関与しません**

---

## ✅ 確認事項

### 医療システムチーム様へ

以下の点をご確認ください：

1. ✅ mode-switcherページは**VoiceDrive内部で完結**することを確認
2. ✅ 医療システム側の**新規API開発は不要**であることを確認
3. ✅ 医療システム側の**DB変更は不要**であることを確認
4. ✅ 今後の**質問・依頼は発生しない**ことを確認

### VoiceDriveチームの次のステップ

1. ✅ DB要件分析完了（mode-switcher_DB要件分析_20251021.md）
2. ✅ 暫定マスターリスト作成完了（mode-switcher暫定マスターリスト_20251021.md）
3. ✅ schema.prisma更新完了（SystemConfigテーブル追加）
4. ⏳ Phase 1: DB・基本API実装（開始予定）
5. ⏳ Phase 2: 統計API・フロントエンド実装
6. ⏳ Phase 3: 履歴機能実装（オプション）
7. ⏳ Phase 4: インデックス最適化・テスト

---

## 📞 連絡先

### VoiceDriveチーム
- Slack: #voicedrive-dev
- 担当: システム開発チーム

### 質問がある場合
本件に関してご質問がございましたら、上記Slackチャンネルまでお気軽にお問い合わせください。

---

## 📎 添付ドキュメント

1. **mode-switcher_DB要件分析_20251021.md** - 詳細な分析レポート
2. **mode-switcher暫定マスターリスト_20251021.md** - API・テーブル定義書

---

**以上、mode-switcherページ分析完了のご連絡でした。**

医療システムチーム様への依頼事項はございませんが、情報共有として本連絡書をお送りいたします。

今後ともよろしくお願いいたします。

---

**文書終了**

**作成者**: VoiceDriveチーム
**承認**: 未承認（レビュー待ち）
**最終更新**: 2025年10月21日
