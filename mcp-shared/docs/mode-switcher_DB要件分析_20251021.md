# mode-switcher（システムモード管理）ページ - DB要件分析

**文書番号**: MS-DB-REQ-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDrive開発チーム
**対象ページ**: https://voicedrive-v100.vercel.app/mode-switcher
**分析基準**: データ管理責任分界点定義書 (DM-DEF-2025-1008-001)

---

## 📋 エグゼクティブサマリー

### ページ概要
**システムモード管理（ModeSwitcher）ページ**は、レベル99（システム管理者）専用のページであり、VoiceDriveのシステム全体の動作モードを**議題モード（AGENDA_MODE）**と**プロジェクト化モード（PROJECT_MODE）**の間で切り替える管理画面です。

### 主要機能
1. **現在のシステムモード表示** - 議題モードまたはプロジェクト化モードの表示
2. **モード切り替え実行** - システム管理者による全社的なモード変更
3. **移行準備状況表示** - プロジェクト化モードへの移行準備の進捗確認
4. **統計ダッシュボード** - 月間投稿数、委員会提出数、職員参加率の表示
5. **監査ログ記録** - モード変更操作の記録

### データ管理責任の結論

| データカテゴリ | VoiceDrive | 医療システム | 判定理由 |
|--------------|-----------|-------------|---------|
| システムモード設定 | ✅ **マスタ** | ❌ | VoiceDrive内部の動作制御 |
| モード変更履歴 | ✅ **マスタ** | ❌ | 監査ログとして記録 |
| 移行準備統計（投稿数・委員会提出数） | ✅ **マスタ** | ❌ | Postテーブルから算出 |
| 職員参加率（lastLoginAt） | ✅ **マスタ** | キャッシュ | Userテーブルから算出 |
| 総職員数 | キャッシュ | ✅ **マスタ** | 医療システムから同期 |

**重要な発見**:
- このページは**100% VoiceDrive内部データのみ**で動作
- 医療システムへのAPI呼び出しは不要
- ただし、統計計算のためにDB永続化が必要（現在はLocalStorageのみ）

---

## 🎯 ページ機能の詳細分析

### 1. 現在のシステムモード表示

**表示内容**:
- 現在のモード名（議題モード / プロジェクト化モード）
- モード説明文
- モードアイコン

**データソース**:
```typescript
// systemMode.ts (L68-83)
getCurrentMode(): SystemMode {
  const savedConfig = localStorage.getItem('voicedrive_system_mode');
  if (savedConfig) {
    const config: SystemModeConfig = JSON.parse(savedConfig);
    return config.mode;
  }
  return SystemMode.AGENDA; // デフォルト
}
```

**現状**: LocalStorageのみ
**必要な改善**: **SystemConfig** テーブルに永続化

---

### 2. モード切り替え機能

**処理フロー**:
1. レベル99権限チェック（`user.permissionLevel === 99`）
2. 確認ダイアログ表示
3. `systemModeManager.setMode(targetMode, user)` 実行
4. 監査ログ記録（`AuditService.log()`）
5. LocalStorageに保存
6. 画面更新

**データソース**:
```typescript
// systemMode.ts (L132-172)
async setMode(mode: SystemMode, adminUser: User): Promise<void> {
  // 権限チェック
  if (adminUser.permissionLevel !== 99) {
    throw new Error('システム管理者（レベル99）のみモード変更可能です');
  }

  const config: SystemModeConfig = {
    mode,
    enabledAt: new Date(),
    enabledBy: adminUser.id,
    description: ...,
    migrationStatus: 'in_progress'
  };

  // LocalStorageに保存
  localStorage.setItem('voicedrive_system_mode', JSON.stringify(config));

  // TODO: Prismaでsystem_configテーブルに保存
}
```

**現状**: LocalStorageのみ
**必要な改善**:
- **SystemConfig** テーブルに永続化
- **AuditLog** テーブルに監査ログ記録

---

### 3. 移行準備状況の統計表示

**表示統計**:

| 統計項目 | 目標値 | 計算方法 | データソース |
|---------|-------|---------|-------------|
| **月間投稿数** | 30件 | 過去1ヶ月のPost件数 | `Post.createdAt >= oneMonthAgo` |
| **委員会提出数** | 10件 | スコア100点以上の投稿件数 | `Post.score >= 100 AND createdAt >= oneMonthAgo` |
| **職員参加率** | 60% | アクティブユーザー / 総ユーザー | `User.lastLoginAt >= oneMonthAgo` |
| **アクティブユーザー数** | - | 月間1回以上ログイン | `User.lastLoginAt >= oneMonthAgo` |
| **総ユーザー数** | - | 全ユーザー数 | `User.count()` |

**データソース**:
```typescript
// SystemModeStatsService.ts (L48-97)
async getMigrationStats(): Promise<MigrationStats> {
  // TODO: 本番環境では以下のPrismaクエリを使用
  /*
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  // 月間投稿数
  const monthlyPosts = await prisma.post.count({
    where: { createdAt: { gte: oneMonthAgo } }
  });

  // 委員会提出数（スコア100点以上）
  const committeeSubmissions = await prisma.post.count({
    where: {
      score: { gte: 100 },
      createdAt: { gte: oneMonthAgo }
    }
  });

  // アクティブユーザー数
  const activeUsers = await prisma.user.count({
    where: { lastLoginAt: { gte: oneMonthAgo } }
  });

  // 総ユーザー数
  const totalUsers = await prisma.user.count();
  */

  // 現状: デモ用のLocalStorageデータ
  return this.getDemoStats();
}
```

**現状**: デモ用のLocalStorageデータ
**必要な改善**: Prismaクエリ実装

---

### 4. 移行準備判定ロジック

**判定基準**:
```typescript
// SystemModeStatsService.ts (L123-172)
async checkMigrationReadiness(): Promise<MigrationReadiness> {
  const stats = await this.getMigrationStats();

  const postsProgress = (stats.monthlyPosts / 30) * 100;
  const submissionsProgress = (stats.committeeSubmissions / 10) * 100;
  const participationProgress = (stats.participationRate / 60) * 100;

  const overallProgress = Math.round(
    postsProgress * 0.4 +
    submissionsProgress * 0.3 +
    participationProgress * 0.3
  );

  const isReady =
    stats.monthlyPosts >= 30 &&
    stats.committeeSubmissions >= 10 &&
    stats.participationRate >= 60;

  return {
    isReady,
    progress: overallProgress,
    message: isReady ? '✅ 準備完了' : '⏳ 準備中',
    details: { ... }
  };
}
```

**重み付け**:
- 月間投稿数: 40%
- 委員会提出数: 30%
- 職員参加率: 30%

---

## 📊 必要なデータベーステーブル分析

### ❌ 不足テーブル1: SystemConfig

**目的**: システム全体設定の永続化

| フィールド | 型 | 説明 | 例 |
|-----------|---|------|---|
| id | String (cuid) | 主キー | ckxyz123... |
| configKey | String (unique) | 設定キー | "system_mode" |
| configValue | Json | 設定値（JSON） | `{"mode": "AGENDA_MODE", ...}` |
| category | String | カテゴリ | "system" / "feature" / "ui" |
| description | String? | 説明 | "システムモード設定" |
| isActive | Boolean | 有効フラグ | true |
| updatedBy | String | 更新者ID | "user_123" |
| createdAt | DateTime | 作成日時 | 2025-10-21T10:00:00Z |
| updatedAt | DateTime | 更新日時 | 2025-10-21T15:30:00Z |

**リレーション**:
```prisma
model SystemConfig {
  id          String   @id @default(cuid())
  configKey   String   @unique
  configValue Json
  category    String   // "system", "feature", "ui"
  description String?
  isActive    Boolean  @default(true)
  updatedBy   String
  updatedByUser User   @relation("SystemConfigUpdater", fields: [updatedBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([configKey])
  @@index([category])
  @@index([updatedAt])
  @@map("system_configs")
}
```

**使用例**:
```typescript
// システムモード保存
await prisma.systemConfig.upsert({
  where: { configKey: 'system_mode' },
  update: {
    configValue: {
      mode: 'PROJECT_MODE',
      enabledAt: new Date(),
      enabledBy: 'user_123',
      description: 'プロジェクト化モード',
      migrationStatus: 'completed'
    },
    updatedBy: 'user_123'
  },
  create: {
    configKey: 'system_mode',
    configValue: { ... },
    category: 'system',
    description: 'システムモード設定',
    updatedBy: 'user_123'
  }
});
```

---

### ✅ 既存テーブル確認: AuditLog

**目的**: モード変更の監査記録

**確認**: `schema.prisma`の既存AuditLogテーブル構造:

```prisma
model AuditLog {
  id                String   @id @default(cuid())
  userId            String
  action            String   // "SYSTEM_MODE_CHANGED"
  entityType        String
  entityId          String
  oldValues         Json?    // 変更前の値
  newValues         Json?    // 変更後の値
  ipAddress         String?
  userAgent         String?
  createdAt         DateTime @default(now())
  executorLevel     Float?
  targetUserId      String?
  reason            String?
  isEmergencyAction Boolean  @default(false)
  syncPending       Boolean  @default(false)
  user              User     @relation(fields: [userId], references: [id])

  @@index([action, isEmergencyAction])
  @@index([targetUserId])
}
```

**使用例**:
```typescript
// ModeSwitcherPage.tsx でのモード変更記録
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'SYSTEM_MODE_CHANGED',
    entityType: 'SystemConfig',
    entityId: 'system_mode',
    oldValues: { mode: 'AGENDA_MODE' },
    newValues: { mode: 'PROJECT_MODE' },
    executorLevel: user.permissionLevel,
    isEmergencyAction: false
  }
});
```

---

### ✅ 既存テーブル確認: Post

**目的**: 移行準備統計の計算

**必要フィールド**:
- `createdAt`: 月間集計用
- `score`: 委員会提出判定用（100点以上）

**クエリ例**:
```typescript
// 月間投稿数
const monthlyPosts = await prisma.post.count({
  where: {
    createdAt: {
      gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
    }
  }
});

// 委員会提出数
const committeeSubmissions = await prisma.post.count({
  where: {
    score: { gte: 100 },
    createdAt: { gte: oneMonthAgo }
  }
});
```

**推奨インデックス**:
```prisma
model Post {
  // ... 既存フィールド

  @@index([createdAt])
  @@index([score, createdAt]) // 委員会提出数クエリ高速化
}
```

---

### ✅ 既存テーブル確認: User

**目的**: 職員参加率の計算

**必要フィールド**:
- `lastLoginAt`: アクティブユーザー判定用
- `permissionLevel`: システム管理者権限チェック用（99）

**クエリ例**:
```typescript
// アクティブユーザー数
const activeUsers = await prisma.user.count({
  where: {
    lastLoginAt: {
      gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
    }
  }
});

// 総ユーザー数
const totalUsers = await prisma.user.count();

// 参加率
const participationRate = (activeUsers / totalUsers) * 100;
```

**推奨インデックス**:
```prisma
model User {
  // ... 既存フィールド

  @@index([lastLoginAt])
  @@index([permissionLevel])
}
```

---

## 🔍 データ管理責任分界点の適用

### カテゴリ分類

#### ✅ VoiceDrive 100%管轄
| データ項目 | テーブル | 理由 |
|-----------|---------|------|
| システムモード設定 | SystemConfig | VoiceDrive内部の動作制御 |
| モード変更履歴 | AuditLog | 監査ログ |
| 月間投稿数 | Post | VoiceDrive活動データ |
| 委員会提出数 | Post | VoiceDrive活動データ |
| アクティブユーザー数 | User | ログイン履歴はVoiceDrive管理 |

#### ⚠️ 医療システムから同期（キャッシュ）
| データ項目 | テーブル | 理由 |
|-----------|---------|------|
| 総職員数 | User | 医療システムのEmployeeテーブルが真実の情報源 |
| 職員基本情報 | User | 氏名・メール等はキャッシュ |

---

## 📝 不足項目の洗い出し

### ❌ 不足テーブル

#### 1. SystemConfig テーブル
**優先度**: 🔴 **最重要**

**理由**:
- 現在はLocalStorageのみで管理されており、サーバー再起動やブラウザキャッシュクリアで設定が失われる
- 全ユーザーに影響するシステム全体設定であるため、DB永続化が必須
- 監査性の観点から、設定変更履歴をトレースできる必要がある

**影響範囲**:
- システムモード設定の永続化
- モード変更履歴の追跡
- 他タブ・他デバイスでの設定同期

**実装優先度**: Phase 1（即時実装）

---

### ✅ 既存テーブルで対応可能

#### 1. AuditLog テーブル
**確認項目**:
- ✅ `schema.prisma`に既存のAuditLogテーブルが定義されている
- ✅ モード変更操作を記録できる構造

**使用方法**:
- `action`: "SYSTEM_MODE_CHANGED"
- `oldValues`: 変更前のモード情報
- `newValues`: 変更後のモード情報
- `executorLevel`: 変更者の権限レベル

---

#### 2. Post テーブル
**確認項目**:
- ✅ `createdAt` フィールドが存在
- ✅ `score` フィールドが存在

**推奨改善**:
```prisma
model Post {
  // ... 既存フィールド

  @@index([createdAt])
  @@index([score, createdAt]) // 委員会提出数クエリ高速化
}
```

---

#### 3. User テーブル
**確認項目**:
- ✅ `lastLoginAt` フィールドが存在
- ✅ `permissionLevel` フィールドが存在

**推奨改善**:
```prisma
model User {
  // ... 既存フィールド

  @@index([lastLoginAt])
  @@index([permissionLevel])
}
```

---

## 🔄 医療システムとの連携

### ❌ 医療システムAPI不要

**結論**: mode-switcherページは**医療システムとの連携が一切不要**

**理由**:
1. システムモード設定はVoiceDrive内部の動作制御
2. 移行準備統計はVoiceDriveのPost/Userテーブルのみで算出可能
3. 総職員数は既にUserテーブルにキャッシュされている

### ✅ VoiceDrive内部で完結

**データフロー**:
```
ModeSwitcherPage
  ↓
systemModeManager.setMode()
  ↓
SystemConfig テーブル保存
  ↓
AuditLog テーブル記録
  ↓
LocalStorage更新（キャッシュ）
  ↓
全ユーザーに反映
```

---

## 📋 実装推奨事項

### Phase 1: 緊急対応（1-2日）

#### ✅ SystemConfig テーブル作成
```prisma
model SystemConfig {
  id          String   @id @default(cuid())
  configKey   String   @unique
  configValue Json
  category    String
  description String?
  isActive    Boolean  @default(true)
  updatedBy   String
  updatedByUser User   @relation("SystemConfigUpdater", fields: [updatedBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([configKey])
  @@index([category])
  @@index([updatedAt])
  @@map("system_configs")
}
```

#### ✅ systemMode.ts 修正
```typescript
private async saveModeConfig(config: SystemModeConfig): Promise<void> {
  // LocalStorageに保存
  localStorage.setItem('voicedrive_system_mode', JSON.stringify(config));

  // 🆕 Prismaで永続化
  await prisma.systemConfig.upsert({
    where: { configKey: 'system_mode' },
    update: {
      configValue: config,
      updatedBy: config.enabledBy
    },
    create: {
      configKey: 'system_mode',
      configValue: config,
      category: 'system',
      description: 'システムモード設定（議題モード/プロジェクト化モード）',
      updatedBy: config.enabledBy
    }
  });
}
```

#### ✅ AuditLog 記録実装
```typescript
// モード変更時の監査ログ
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'SYSTEM_MODE_CHANGED',
    entityType: 'SystemConfig',
    entityId: 'system_mode',
    oldValues: { mode: previousMode },
    newValues: { mode: newMode },
    executorLevel: user.permissionLevel,
    isEmergencyAction: false
  }
});
```

---

### Phase 2: 統計機能の実装（3-5日）

#### ✅ SystemModeStatsService 実装
```typescript
async getMigrationStats(): Promise<MigrationStats> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // 月間投稿数
  const monthlyPosts = await prisma.post.count({
    where: { createdAt: { gte: oneMonthAgo } }
  });

  // 委員会提出数
  const committeeSubmissions = await prisma.post.count({
    where: {
      score: { gte: 100 },
      createdAt: { gte: oneMonthAgo }
    }
  });

  // アクティブユーザー数
  const activeUsers = await prisma.user.count({
    where: { lastLoginAt: { gte: oneMonthAgo } }
  });

  // 総ユーザー数
  const totalUsers = await prisma.user.count();

  const participationRate = totalUsers > 0
    ? (activeUsers / totalUsers) * 100
    : 0;

  return {
    monthlyPosts,
    committeeSubmissions,
    participationRate,
    activeUsers,
    totalUsers
  };
}
```

#### ✅ インデックス最適化
```prisma
// Post テーブル
@@index([score, createdAt]) // 委員会提出数クエリ高速化

// User テーブル
@@index([lastLoginAt]) // アクティブユーザー数クエリ高速化
```

---

### Phase 3: 監視・運用改善（1週間）

#### ✅ 統計キャッシュ機能
- 統計計算結果を一定期間キャッシュ（1時間程度）
- 頻繁な集計クエリによるDB負荷軽減

#### ✅ モード変更通知機能
- 全ユーザーにモード変更を通知
- WebSocket または Server-Sent Events で即時反映

#### ✅ ロールバック機能
- モード変更の取り消し機能
- 変更履歴からの復元

---

## 🎯 優先度まとめ

| 項目 | 優先度 | 工数 | 理由 |
|-----|-------|------|------|
| SystemConfig テーブル作成 | 🔴 最重要 | 0.5日 | 設定永続化の基盤 |
| systemMode.ts のDB永続化実装 | 🔴 最重要 | 0.5日 | LocalStorageからの脱却 |
| AuditLog 記録実装 | 🟠 重要 | 0.3日 | 監査ログ記録 |
| SystemModeStatsService実装 | 🟠 重要 | 1日 | 統計機能の実装 |
| インデックス最適化 | 🟡 推奨 | 0.2日 | パフォーマンス向上 |
| 統計キャッシュ機能 | 🟢 任意 | 0.5日 | 運用改善 |

**合計工数**: 3日（Phase 1-2のみ）

---

## 📌 次のステップ

1. ✅ **mode-switcher_DB要件分析_20251021.md** を作成（完了）
2. ⏭️ **mode-switcher暫定マスターリスト_20251021.md** を作成
3. ⏭️ **schema.prisma** にSystemConfigテーブルを追加
4. ⏭️ **医療チームへの連絡** - 医療システム側の対応は不要であることを通知

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
ステータス: レビュー待ち
