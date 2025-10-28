# NotificationCategoryPage 暫定マスターリスト

**文書番号**: MLIST-NOTIF-CAT-2025-1028-001
**作成日**: 2025年10月28日
**対象ページ**: https://voicedrive-v100.vercel.app/admin/notification-category
**権限レベル**: Level 99（システムオペレーター専用）
**関連文書**: [NotificationCategoryPage_DB要件分析_20251028.md](./NotificationCategoryPage_DB要件分析_20251028.md)

---

## 📋 ドキュメント概要

### 目的
NotificationCategoryPage（通知カテゴリ管理ページ）で使用される全データ項目を網羅的にカタログ化し、各項目のデータソース、管理責任、実装状態を明確化する。

### 対象範囲
- 通知カテゴリ設定（8カテゴリ）
- カテゴリ別配信方法設定
- カテゴリ別優先度設定
- 全般設定（保存期間、配信ルール、夜間モード）
- UI状態管理

---

## 🎯 データ項目カタログ

### カテゴリ1: 通知カテゴリ設定

#### 1-1. 面談・予約通知カテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 1 | カテゴリID（interview） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 40 |
| 2 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 41 |
| 3 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 42 |
| 4 | アイコン（Calendar） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 43 |
| 5 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 44 |
| 6 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 45 |
| 7 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 46 |
| 8 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 47 |
| 9 | 優先度（high） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 48 |

#### 1-2. 人事お知らせカテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 10 | カテゴリID（hr） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 51 |
| 11 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 52 |
| 12 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 53 |
| 13 | アイコン（Users） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 54 |
| 14 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 55 |
| 15 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 56 |
| 16 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 57 |
| 17 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 58 |
| 18 | 優先度（high） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 59 |

#### 1-3. 議題・提案通知カテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 19 | カテゴリID（agenda） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 62 |
| 20 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 63 |
| 21 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 64 |
| 22 | アイコン（Briefcase） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 65 |
| 23 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 66 |
| 24 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 67 |
| 25 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 68 |
| 26 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 69 |
| 27 | 優先度（normal） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 70 |

#### 1-4. システム通知カテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 28 | カテゴリID（system） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 73 |
| 29 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 74 |
| 30 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 75 |
| 31 | アイコン（Bell） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 76 |
| 32 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 77 |
| 33 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 78 |
| 34 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 79 |
| 35 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 80 |
| 36 | 優先度（normal） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 81 |

#### 1-5. 研修・教育通知カテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 37 | カテゴリID（training） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 84 |
| 38 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 85 |
| 39 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 86 |
| 40 | アイコン（GraduationCap） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 87 |
| 41 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 88 |
| 42 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 89 |
| 43 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 90 |
| 44 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 91 |
| 45 | 優先度（normal） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 92 |

#### 1-6. シフト・勤務通知カテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 46 | カテゴリID（shift） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 95 |
| 47 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 96 |
| 48 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 97 |
| 49 | アイコン（Clock） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 98 |
| 50 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 99 |
| 51 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 100 |
| 52 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 101 |
| 53 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 102 |
| 54 | 優先度（high） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 103 |

#### 1-7. プロジェクト通知カテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 55 | カテゴリID（project） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 106 |
| 56 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 107 |
| 57 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 108 |
| 58 | アイコン（Briefcase） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 109 |
| 59 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 110 |
| 60 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 111 |
| 61 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 112 |
| 62 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 113 |
| 63 | 優先度（normal） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 114 |

#### 1-8. 評価通知カテゴリ

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 64 | カテゴリID（evaluation） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 117 |
| 65 | カテゴリ名 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 118 |
| 66 | カテゴリ説明 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 119 |
| 67 | アイコン（Users） | Component | VoiceDrive | ✅ ハードコード | フロントエンド | 120 |
| 68 | カラーコード | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 121 |
| 69 | 有効化フラグ | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 122 |
| 70 | メール通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 123 |
| 71 | システム内通知有効 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 124 |
| 72 | 優先度（high） | String | VoiceDrive | ❌ React state | NotificationCategorySettings.categories | 125 |

---

### カテゴリ2: 全般設定

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 73 | 通知保存期間（日） | Int | VoiceDrive | ❌ React state | NotificationCategorySettings.retentionDays | 131 |
| 74 | 緊急通知の即時配信 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.criticalPriorityImmediate | 132 |
| 75 | 高優先度通知の即時配信 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.highPriorityImmediate | 133 |
| 76 | 通常優先度のバッチ配信 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.normalPriorityBatch | 134 |
| 77 | 低優先度のバッチ配信 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.lowPriorityBatch | 135 |
| 78 | 夜間モード開始時刻 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.nightModeStart | 136 |
| 79 | 夜間モード終了時刻 | String | VoiceDrive | ❌ React state | NotificationCategorySettings.nightModeEnd | 137 |
| 80 | 夜間モードで通知を抑制 | Boolean | VoiceDrive | ❌ React state | NotificationCategorySettings.nightModeSilent | 138 |

---

### カテゴリ3: UI状態管理

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 81 | 変更有無フラグ | Boolean | VoiceDrive | ✅ React state | フロントエンド | 34 |
| 82 | 保存ステータス | String | VoiceDrive | ✅ React state | フロントエンド | 35 |

---

### カテゴリ4: ユーザー情報

| # | データ項目 | データ型 | 管理責任 | 現在の状態 | 必要なテーブル | ソース行 |
|---|-----------|---------|---------|-----------|-------------|---------|
| 83 | 現在のユーザーID | String | 医療システム | ✅ useAuth | User.id | 33 |
| 84 | ユーザー権限レベル | Decimal | 医療システム | ✅ useAuth | User.permissionLevel | 33 |

---

## 📊 統計サマリー

### データ項目数の内訳

| カテゴリ | 項目数 | VoiceDrive管理 | 医療システム管理 | フロントエンドのみ |
|---------|-------|---------------|----------------|-----------------|
| 通知カテゴリ設定（8カテゴリ） | 72 | 72 (100%) | 0 (0%) | 0 (0%) |
| 全般設定 | 8 | 8 (100%) | 0 (0%) | 0 (0%) |
| UI状態管理 | 2 | 0 (0%) | 0 (0%) | 2 (100%) |
| ユーザー情報 | 2 | 0 (0%) | 2 (100%) | 0 (0%) |
| **合計** | **84** | **80 (95.2%)** | **2 (2.4%)** | **2 (2.4%)** |

### データ管理責任の割合

```
VoiceDrive管理:   95.2% (80項目)
医療システム管理:  2.4% (2項目) ← ユーザー認証情報のみ
フロントエンドのみ: 2.4% (2項目) ← UI状態のみ
```

### 実装状態の内訳

| 実装状態 | 項目数 | 割合 | 備考 |
|---------|-------|------|------|
| ✅ 実装済み | 4 | 4.8% | ユーザー認証、UI状態、アイコン |
| ❌ 未実装（React state） | 80 | 95.2% | **データベース化が必要** |
| **合計** | **84** | **100%** | |

---

## 🔴 不足項目の詳細

### 不足項目1: NotificationCategorySettingsテーブル

**影響範囲**: 80項目（全体の95.2%）

**問題点**:
- 現在は全てReact stateで管理
- ページリロードで設定が消失
- 設定変更が保存されない（モック処理）

**解決策**:
```prisma
model NotificationCategorySettings {
  id                         String   @id @default(cuid())
  categories                 Json     @map("categories")
  retentionDays              Int      @default(30)
  criticalPriorityImmediate  Boolean  @default(true)
  highPriorityImmediate      Boolean  @default(true)
  normalPriorityBatch        Boolean  @default(false)
  lowPriorityBatch           Boolean  @default(true)
  nightModeStart             String?
  nightModeEnd               String?
  nightModeSilent            Boolean  @default(true)
  updatedBy                  String?
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt

  @@map("notification_category_settings")
}
```

**影響するデータ項目**:
- 項目1-72: 通知カテゴリ設定（全8カテゴリ）
- 項目73-80: 全般設定

**実装優先度**: 🔴 **最高**

---

## 🔄 データフロー図

### フロー1: ページ初期表示

```
Level 99管理者
  ↓ アクセス
NotificationCategoryPage
  ↓ GET /api/admin/notification-category-settings
VoiceDrive API
  ↓ NotificationCategorySettings.findFirst()
VoiceDrive DB
  ↓ 設定データ返却
NotificationCategoryPage
  ↓ setCategories(), setGeneralSettings()
画面表示
```

### フロー2: 設定変更・保存

```
Level 99管理者
  ↓ カテゴリ設定変更
NotificationCategoryPage
  ↓ setHasChanges(true)
画面に「未保存の変更があります」表示
  ↓ 管理者が「設定を保存」クリック
NotificationCategoryPage.handleSave()
  ↓ PUT /api/admin/notification-category-settings
VoiceDrive API
  ↓ NotificationCategorySettings.upsert()
VoiceDrive DB
  ↓ 保存完了
AuditService.log()（監査ログ記録）
  ↓ 200 OK
NotificationCategoryPage
  ↓ setSaveStatus('saved')
「保存しました」メッセージ表示
```

### フロー3: 通知配信時の設定参照

```
イベント発生（例: 面談予約確定）
  ↓
NotificationService.sendNotification()
  ↓ NotificationCategorySettings取得
VoiceDrive DB
  ↓ categories設定返却
NotificationService
  ↓ カテゴリ'interview'の設定確認
  ↓ enabled=true, priority='high', emailEnabled=true
NotificationService
  ↓ 夜間モードチェック
  ↓ 22:00-07:00の間は通知抑制
NotificationService
  ↓ Notification.create()
VoiceDrive DB
  ↓ メール送信 + システム内通知
ユーザー
```

---

## 🎯 データソース別項目リスト

### VoiceDrive管理（80項目 = 95.2%）

#### NotificationCategorySettings.categories（JSON）
- 項目1-72: 全8カテゴリの設定（各カテゴリ9項目 × 8 = 72項目）

#### NotificationCategorySettings（個別フィールド）
- 項目73: retentionDays
- 項目74: criticalPriorityImmediate
- 項目75: highPriorityImmediate
- 項目76: normalPriorityBatch
- 項目77: lowPriorityBatch
- 項目78: nightModeStart
- 項目79: nightModeEnd
- 項目80: nightModeSilent

---

### 医療システム管理（2項目 = 2.4%）

#### User（キャッシュ）
- 項目83: id（employeeId同期済み）
- 項目84: permissionLevel

**提供方法**:
- 医療システムのEmployeeテーブルがマスタ
- VoiceDrive UserテーブルにAPI経由でキャッシュ
- useAuth()フックで取得

---

### フロントエンドのみ（2項目 = 2.4%）

#### React State
- 項目81: hasChanges
- 項目82: saveStatus

---

## ✅ 実装チェックリスト

### Phase 1: データベース実装
- [ ] NotificationCategorySettingsテーブル追加
- [ ] マイグレーション実行
- [ ] 初期データ投入（8カテゴリのデフォルト設定）

### Phase 2: API実装
- [ ] GET /api/admin/notification-category-settings
- [ ] PUT /api/admin/notification-category-settings
- [ ] 権限チェック（Level 99）実装

### Phase 3: フロントエンド連携
- [ ] NotificationCategoryPageにuseEffect追加
- [ ] handleSave修正（実際のAPI呼び出し）
- [ ] エラーハンドリング追加

### Phase 4: 通知配信ロジック統合
- [ ] NotificationServiceに設定参照機能追加
- [ ] カテゴリ有効化チェック実装
- [ ] 夜間モードチェック実装
- [ ] 優先度別配信ロジック実装

---

## 🔗 関連ドキュメント

- [NotificationCategoryPage_DB要件分析_20251028.md](./NotificationCategoryPage_DB要件分析_20251028.md)
- [データ管理責任分界点定義書_20251008.md](../mcp-shared/docs/データ管理責任分界点定義書_20251008.md)
- [notifications_DB要件分析_20251022.md](../mcp-shared/docs/notifications_DB要件分析_20251022.md)

---

**文書終了**

最終更新: 2025年10月28日
バージョン: 1.0
ステータス: レビュー待ち
