# NotificationCategoryPage 医療システム確認結果書

**作成日**: 2025-10-28
**対象ページ**: NotificationCategoryPage（VoiceDrive側）
**分析者**: 医療職員カルテシステム開発チーム
**確認結果**: ✅ **医療システム側対応不要（VoiceDrive完全独立）**

---

## 📋 目次

1. [確認概要](#確認概要)
2. [分析結果](#分析結果)
3. [責任分界点の確認](#責任分界点の確認)
4. [医療システム側の役割](#医療システム側の役割)
5. [VoiceDrive側の実装要件](#voicedrive側の実装要件)
6. [連携仕様](#連携仕様)
7. [確認事項と質問](#確認事項と質問)

---

## 1. 確認概要

### VoiceDrive側からの依頼内容

VoiceDriveチームがNotificationCategoryPage（通知カテゴリ管理ページ）のDB構築を計画しており、医療システム側で対応が必要か確認要請を受けました。

**依頼書類**:
- `NotificationCategoryPage_DB要件分析_20251028.md`
- `NotificationCategoryPage暫定マスターリスト_20251028.md`

### 確認結論

✅ **医療システム側で追加実装は一切不要**

**理由**:
1. 通知カテゴリ設定はVoiceDrive内部の通知配信制御ロジック
2. 医療システムは通知の**送信側**であり、配信ルールには関与しない
3. VoiceDrive完全独立で管理すべき設定（医療システムからのデータ依存なし）

---

## 2. 分析結果

### 2-1. データ管理責任の分析

| データカテゴリ | 管理責任 | 医療システム対応 | 理由 |
|--------------|---------|----------------|------|
| **通知カテゴリ設定** | 🟦 **VoiceDrive** | ❌ **不要** | VoiceDrive内部の通知配信ロジック |
| **配信方法設定** | 🟦 **VoiceDrive** | ❌ **不要** | メール/システム内通知の切り替え |
| **優先度設定** | 🟦 **VoiceDrive** | ❌ **不要** | VoiceDrive内部の配信制御 |
| **全般設定** | 🟦 **VoiceDrive** | ❌ **不要** | 保存期間、夜間モード等 |
| **ユーザー認証情報** | 🔴 **医療システム** | ✅ **対応済み** | 既存のUser情報を参照 |

### 2-2. 医療システム依存項目の確認

**依存項目**: 2項目のみ（全体の2.4%）

| 項目 | 管理責任 | 提供方法 | 状態 |
|------|---------|---------|------|
| ユーザーID | 医療システム | useAuth() | ✅ 対応済み |
| 権限レベル（Level 99） | 医療システム | useAuth() | ✅ 対応済み |

**評価**: ✅ **既存の認証システムで対応済み（追加実装不要）**

### 2-3. VoiceDrive独立管理項目

**独立項目**: 80項目（全体の95.2%）

| カテゴリ | 項目数 | 内容 |
|---------|-------|------|
| 通知カテゴリ設定 | 72 | 8カテゴリ × 9項目（有効化、配信方法、優先度等） |
| 全般設定 | 8 | 保存期間、配信ルール、夜間モード設定 |

**評価**: 🟦 **VoiceDrive完全管理（医療システム関与なし）**

---

## 3. 責任分界点の確認

### 3-1. データ管理責任の図解

```
┌─────────────────────────────────────────────────────────────┐
│                   医療システム管理範囲                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ユーザー認証情報（User）                                │   │
│  │  - ユーザーID                                         │   │
│  │  - 権限レベル（Level 99）                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓ 参照（READ ONLY）                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   VoiceDrive管理範囲（完全独立）                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 通知カテゴリ設定（NotificationCategorySettings）       │   │
│  │                                                         │   │
│  │ 【8つの通知カテゴリ】                                  │   │
│  │  1. 面談・予約通知（interview）                        │   │
│  │  2. 人事お知らせ（hr）                                 │   │
│  │  3. 議題・提案通知（agenda）                          │   │
│  │  4. システム通知（system）                            │   │
│  │  5. 研修・教育通知（training）                        │   │
│  │  6. シフト・勤務通知（shift）                         │   │
│  │  7. プロジェクト通知（project）                       │   │
│  │  8. 評価通知（evaluation）                           │   │
│  │                                                         │   │
│  │ 【各カテゴリの設定項目】                               │   │
│  │  - enabled（有効化フラグ）                            │   │
│  │  - emailEnabled（メール通知有効）                     │   │
│  │  - systemEnabled（システム内通知有効）                │   │
│  │  - priority（優先度: low/normal/high/critical）       │   │
│  │  - name, description, color, icon                    │   │
│  │                                                         │   │
│  │ 【全般設定】                                           │   │
│  │  - retentionDays（通知保存期間: 30日）                │   │
│  │  - criticalPriorityImmediate（緊急通知即時配信）      │   │
│  │  - highPriorityImmediate（高優先度即時配信）          │   │
│  │  - normalPriorityBatch（通常優先度バッチ配信）        │   │
│  │  - lowPriorityBatch（低優先度バッチ配信）             │   │
│  │  - nightModeStart（夜間モード開始: 22:00）            │   │
│  │  - nightModeEnd（夜間モード終了: 07:00）              │   │
│  │  - nightModeSilent（夜間モードで通知を抑制）          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3-2. 責任分界点の詳細

#### 医療システムの責任範囲

**範囲**: ユーザー認証情報のみ（既存機能）

| 項目 | 責任内容 | 提供方法 |
|------|---------|---------|
| ユーザーID | 認証済みユーザーのID提供 | useAuth() → user.id |
| 権限レベル | Level 99判定情報提供 | useAuth() → user.permissionLevel |

**評価**: ✅ **既存の認証システムで対応済み（追加実装不要）**

#### VoiceDriveの責任範囲

**範囲**: 通知カテゴリ設定の100%（完全独立管理）

| カテゴリ | 責任内容 |
|---------|---------|
| 通知カテゴリ設定 | 8カテゴリの有効化/無効化、配信方法、優先度管理 |
| 配信方法制御 | メール通知/システム内通知の切り替え |
| 優先度制御 | 4段階優先度（low/normal/high/critical）管理 |
| 全般設定 | 保存期間、配信ルール、夜間モード設定 |
| 通知配信ロジック | 設定に基づいた通知の配信・抑制制御 |

---

## 4. 医療システム側の役割

### 4-1. 現在の役割（変更なし）

✅ **ユーザー認証情報の提供のみ（既存機能）**

```typescript
// VoiceDrive側で既に使用中
const { user } = useAuth();

// 医療システムから取得済みの情報
user.id              // ユーザーID
user.permissionLevel // 権限レベル（Level 99判定用）
```

### 4-2. 追加対応の必要性

❌ **追加対応は一切不要**

**理由**:
1. NotificationCategoryPageはVoiceDrive内部の管理画面
2. 医療システムは通知の**送信側**（配信ルールは関与しない）
3. 通知カテゴリ設定はVoiceDrive内部のロジック制御のみに使用

### 4-3. 医療システムの位置づけ

```
医療システム
  ↓ 通知イベント発生（例: 面談予約確定）
VoiceDrive NotificationService
  ↓ NotificationCategorySettings参照
  ↓ 配信ルール確認（カテゴリ有効化、優先度、夜間モード等）
  ↓ 配信判断
ユーザーへ通知配信（メール/システム内通知）
```

**評価**: 医療システムは通知イベントを送るだけ、配信制御はVoiceDriveが担当

---

## 5. VoiceDrive側の実装要件

### 5-1. 必要なテーブル

#### NotificationCategorySettings（通知カテゴリ設定）

```prisma
model NotificationCategorySettings {
  id            String   @id @default(cuid())

  // カテゴリ設定（JSON形式）
  categories    Json     @map("categories")
  // [
  //   {
  //     id: 'interview',
  //     name: '面談・予約通知',
  //     description: '面談予約、リマインダー、キャンセル通知',
  //     enabled: true,
  //     emailEnabled: true,
  //     systemEnabled: true,
  //     priority: 'high'
  //   },
  //   ... 8カテゴリ
  // ]

  // 全般設定
  retentionDays              Int      @default(30) @map("retention_days")
  criticalPriorityImmediate  Boolean  @default(true) @map("critical_priority_immediate")
  highPriorityImmediate      Boolean  @default(true) @map("high_priority_immediate")
  normalPriorityBatch        Boolean  @default(false) @map("normal_priority_batch")
  lowPriorityBatch           Boolean  @default(true) @map("low_priority_batch")

  // 夜間モード設定
  nightModeStart   String?  @map("night_mode_start")      // '22:00'
  nightModeEnd     String?  @map("night_mode_end")        // '07:00'
  nightModeSilent  Boolean  @default(true) @map("night_mode_silent")

  // メタデータ
  updatedBy  String?   @map("updated_by")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@index([updatedAt])
  @@map("notification_category_settings")
}
```

**新規テーブル数**: 1テーブル
**管理責任**: VoiceDrive 100%

### 5-2. 必要なAPI

| # | エンドポイント | メソッド | 説明 | 権限 |
|---|---------------|---------|------|------|
| 1 | `/api/admin/notification-category-settings` | GET | 通知カテゴリ設定取得 | Level 99 |
| 2 | `/api/admin/notification-category-settings` | PUT | 通知カテゴリ設定保存 | Level 99 |

**新規API数**: 2本
**管理責任**: VoiceDrive 100%

### 5-3. 初期データ

**8つの通知カテゴリのデフォルト設定**:

```json
{
  "categories": [
    {
      "id": "interview",
      "name": "面談・予約通知",
      "description": "面談予約、リマインダー、キャンセル通知",
      "enabled": true,
      "emailEnabled": true,
      "systemEnabled": true,
      "priority": "high"
    },
    {
      "id": "hr",
      "name": "人事お知らせ",
      "description": "人事からの重要なお知らせ、評価通知",
      "enabled": true,
      "emailEnabled": true,
      "systemEnabled": true,
      "priority": "high"
    },
    {
      "id": "agenda",
      "name": "議題・提案通知",
      "description": "議題の新規投稿、コメント、承認通知",
      "enabled": true,
      "emailEnabled": false,
      "systemEnabled": true,
      "priority": "normal"
    },
    {
      "id": "system",
      "name": "システム通知",
      "description": "システムメンテナンス、更新情報",
      "enabled": true,
      "emailEnabled": false,
      "systemEnabled": true,
      "priority": "normal"
    },
    {
      "id": "training",
      "name": "研修・教育通知",
      "description": "研修案内、教育プログラム通知",
      "enabled": true,
      "emailEnabled": true,
      "systemEnabled": true,
      "priority": "normal"
    },
    {
      "id": "shift",
      "name": "シフト・勤務通知",
      "description": "シフト変更、勤務調整の通知",
      "enabled": true,
      "emailEnabled": true,
      "systemEnabled": true,
      "priority": "high"
    },
    {
      "id": "project",
      "name": "プロジェクト通知",
      "description": "プロジェクト更新、タスク通知",
      "enabled": true,
      "emailEnabled": false,
      "systemEnabled": true,
      "priority": "normal"
    },
    {
      "id": "evaluation",
      "name": "評価通知",
      "description": "評価期間、自己評価提出リマインダー",
      "enabled": true,
      "emailEnabled": true,
      "systemEnabled": true,
      "priority": "high"
    }
  ],
  "retentionDays": 30,
  "criticalPriorityImmediate": true,
  "highPriorityImmediate": true,
  "normalPriorityBatch": false,
  "lowPriorityBatch": true,
  "nightModeStart": "22:00",
  "nightModeEnd": "07:00",
  "nightModeSilent": true
}
```

### 5-4. 実装見積もり

| Phase | 作業内容 | 工数 |
|-------|---------|------|
| Phase 1 | データベーステーブル追加 | 1日 |
| Phase 2 | API実装（GET/PUT） | 1-2日 |
| Phase 3 | フロントエンド連携 | 1日 |
| Phase 4 | 通知配信ロジックへの統合 | 1-2日 |
| **合計** | | **4-6日** |

---

## 6. 連携仕様

### 6-1. データ連携フロー

#### フロー1: ページ初期表示

```
Level 99管理者
  ↓ ページアクセス
NotificationCategoryPage
  ↓ GET /api/admin/notification-category-settings
VoiceDrive API
  ↓ NotificationCategorySettings.findFirst()
VoiceDrive DB
  ↓ 設定データ返却
NotificationCategoryPage
  ↓ 画面表示
管理者
```

**医療システム関与**: なし（VoiceDrive完結）

#### フロー2: 設定変更・保存

```
Level 99管理者
  ↓ カテゴリ設定変更
NotificationCategoryPage
  ↓ 「設定を保存」クリック
  ↓ PUT /api/admin/notification-category-settings
VoiceDrive API
  ↓ NotificationCategorySettings.upsert()
VoiceDrive DB
  ↓ 保存完了
AuditService.log()（監査ログ記録）
  ↓ 200 OK
NotificationCategoryPage
  ↓ 「保存しました」表示
管理者
```

**医療システム関与**: なし（VoiceDrive完結）

#### フロー3: 通知配信時の設定参照

```
医療システム（または内部イベント）
  ↓ 通知イベント発生（例: 面談予約確定）
VoiceDrive NotificationService
  ↓ NotificationCategorySettings取得
VoiceDrive DB
  ↓ categories設定返却
NotificationService
  ↓ カテゴリ'interview'の設定確認
  ↓ enabled=true, priority='high', emailEnabled=true
  ↓ 夜間モードチェック（22:00-07:00は抑制）
  ↓ Notification.create()
  ↓ メール送信 + システム内通知
ユーザー
```

**医療システム関与**: イベント送信のみ（配信制御はVoiceDrive）

### 6-2. 通知配信制御ロジック

VoiceDriveのNotificationServiceが以下のロジックで配信制御:

```typescript
// VoiceDrive: NotificationService.ts
export async function sendNotification(
  category: string,
  userId: string,
  title: string,
  content: string
) {
  // 1. 設定取得
  const settings = await prisma.notificationCategorySettings.findFirst();
  const categoryConfig = settings?.categories.find((c: any) => c.id === category);

  // 2. カテゴリ有効化チェック
  if (!categoryConfig || !categoryConfig.enabled) {
    console.log(`カテゴリ ${category} は無効化されています`);
    return; // 配信しない
  }

  // 3. 夜間モードチェック
  if (settings?.nightModeSilent && isNightMode()) {
    console.log('夜間モードのため通知を抑制します');
    return; // 配信しない
  }

  // 4. 通知作成
  const notification = await prisma.notification.create({
    data: {
      category,
      priority: categoryConfig.priority,
      title,
      content,
      senderId: 'system',
      target: `user:${userId}`
    }
  });

  // 5. 配信方法に基づいた送信
  if (categoryConfig.emailEnabled) {
    await sendEmail(userId, title, content);
  }

  if (categoryConfig.systemEnabled) {
    await createNotificationRecipient(notification.id, userId);
  }
}
```

**医療システム関与**: なし（VoiceDrive完結）

---

## 7. 確認事項と質問

### 7-1. VoiceDriveチームへの確認質問

#### 質問1: 通知カテゴリの追加・変更

**質問**: 今後、8つの通知カテゴリに追加や変更が発生する可能性はありますか？

**背景**:
- 現在はJSON形式で8カテゴリを管理
- カテゴリ追加時はJSON更新で対応可能
- 頻繁に追加する場合は別テーブル化も検討可能

**選択肢**:
- **A**: 当面は8カテゴリ固定（JSON管理でOK）
- **B**: 今後カテゴリ追加の可能性あり（JSON管理でOK、柔軟性あり）
- **C**: 頻繁に追加予定（別テーブル化検討）

**推奨**: B（JSON管理で十分柔軟）

---

#### 質問2: 施設ごとの設定

**質問**: 通知カテゴリ設定は全施設共通ですか？それとも施設ごとに個別設定が必要ですか？

**背景**:
- 現在の設計: 全施設共通（単一レコード）
- 施設ごと設定の場合: facilityIdフィールド追加が必要

**選択肢**:
- **A**: 全施設共通設定でOK（現在の設計）
- **B**: 施設ごとに個別設定が必要（facilityId追加）

**推奨**: A（全施設共通、運用がシンプル）

---

#### 質問3: 優先度別の配信タイミング

**質問**: 優先度別の配信タイミング（即時/バッチ）の具体的な運用方針は？

**背景**:
- 現在の設定: 緊急・高優先度は即時、低優先度はバッチ
- バッチ配信の具体的なタイミング（例: 毎時、1日1回等）が未定義

**選択肢**:
- **A**: 緊急・高優先度は即時、通常・低優先度は1日1回バッチ
- **B**: 緊急・高優先度は即時、通常は毎時、低優先度は1日1回
- **C**: すべて即時配信（バッチ配信なし）

**推奨**: A（運用負荷が低い）

---

#### 質問4: 夜間モードの適用範囲

**質問**: 夜間モード（22:00-07:00）はすべての優先度に適用されますか？

**背景**:
- 現在の設計: nightModeSilent=trueですべて抑制
- 緊急通知は夜間でも配信すべきかの判断が必要

**選択肢**:
- **A**: すべての優先度で夜間は配信抑制
- **B**: 緊急（critical）のみ夜間でも配信、他は抑制
- **C**: 緊急・高優先度は夜間でも配信、通常・低優先度は抑制

**推奨**: B（緊急時は夜間でも通知）

---

#### 質問5: カテゴリ無効化時の既存通知

**質問**: カテゴリを無効化した際、既存の未読通知はどう扱いますか？

**背景**:
- カテゴリ無効化 = 新規通知の配信停止
- 既存の未読通知の表示/非表示を決める必要あり

**選択肢**:
- **A**: 既存の未読通知はそのまま表示（過去分は影響なし）
- **B**: 既存の未読通知も非表示にする
- **C**: 既存の未読通知に「このカテゴリは無効化されました」表示

**推奨**: A（過去分は影響なし、シンプル）

---

#### 質問6: 通知保存期間（retentionDays）の適用

**質問**: 通知保存期間30日は、どのタイミングで削除されますか？

**背景**:
- 現在の設定: 30日
- 削除タイミング（例: 毎日深夜バッチ）と削除基準（既読/未読関係なく削除？）が未定義

**選択肢**:
- **A**: 既読/未読関係なく、30日経過した通知を毎日深夜に削除
- **B**: 既読のみ30日経過で削除、未読は削除しない
- **C**: 未読は削除しない、既読は即座に削除可能

**推奨**: A（データ量管理、シンプル）

---

#### 質問7: Level 99以外のユーザーの設定参照

**質問**: Level 99以外のユーザーが通知カテゴリ設定を参照（読み取り専用）する必要はありますか？

**背景**:
- 現在の設計: Level 99のみがGET/PUT可能
- 一般ユーザーが「どのカテゴリが有効か」を知りたい場合の対応

**選択肢**:
- **A**: Level 99のみ参照可能（現在の設計）
- **B**: 一般ユーザーも読み取り専用で参照可能
- **C**: 不要（通知が届くかどうかで判断すれば良い）

**推奨**: C（一般ユーザーは設定を知る必要なし）

---

### 7-2. 確認サマリー

| 質問 | 内容 | 推奨回答 | 影響範囲 |
|------|------|---------|---------|
| 1 | カテゴリの追加・変更 | B（JSON管理で柔軟） | テーブル設計 |
| 2 | 施設ごとの設定 | A（全施設共通） | テーブル設計 |
| 3 | 配信タイミング | A（即時/1日1回） | NotificationService |
| 4 | 夜間モード適用範囲 | B（緊急のみ夜間配信） | NotificationService |
| 5 | 無効化時の既存通知 | A（過去分影響なし） | UI表示ロジック |
| 6 | 保存期間の適用 | A（30日で全削除） | バッチ処理 |
| 7 | 一般ユーザー参照 | C（不要） | API権限設計 |

---

## 📊 実装サマリー

### 医療システム側

- **追加実装**: ❌ **なし**
- **既存機能**: ✅ ユーザー認証情報提供（対応済み）
- **変更**: ❌ **なし**

### VoiceDrive側

- **新規テーブル**: 1テーブル（NotificationCategorySettings）
- **新規API**: 2本（GET/PUT）
- **初期データ**: 8カテゴリ + 全般設定
- **実装工数**: 4-6日

### データ項目数

- **全項目**: 84項目
- **VoiceDrive管理**: 80項目（95.2%）
- **医療システム管理**: 2項目（2.4%、既存）
- **フロントエンドのみ**: 2項目（2.4%）

---

## ✅ 結論

### 医療システムチームへ

✅ **NotificationCategoryPageに関する医療システム側の追加実装は一切不要です。**

**理由**:
1. 通知カテゴリ設定はVoiceDrive内部の配信制御ロジック
2. 医療システムは通知イベントの送信のみ担当
3. 配信ルール（有効化、優先度、夜間モード等）はVoiceDriveが管理

### VoiceDriveチームへ

🟦 **VoiceDrive側で完全独立で実装してください。**

**必要な作業**:
1. NotificationCategorySettingsテーブルの追加
2. 設定取得/保存API（GET/PUT）の実装
3. NotificationCategoryPageのAPI連携
4. NotificationServiceへの設定参照機能追加
5. 上記7つの確認質問への回答

**見積もり**: 4-6日

---

**文書終了**

最終更新: 2025年10月28日
バージョン: 1.0
次回レビュー: VoiceDriveチームの質問回答後
