# HomePageページ DB要件分析

**文書番号**: DB-REQ-2025-1027-002
**作成日**: 2025年10月27日
**対象ページ**: https://voicedrive-v100.vercel.app/ (HomePage)
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
HomePageは**既存のVoiceDrive DB構造で完全に動作可能**です。以下の状況を確認しました：

### ✅ 正常に動作している項目

1. **投稿表示機能**
   - `Post`テーブル（既存）で全タイプの投稿を管理
   - `Vote`テーブルと`VoteHistory`テーブルで投票管理
   - `Comment`テーブルでコメント管理

2. **タブ切り替え機能**
   - improvement（アイデアボイス）
   - community（フリーボイス）
   - freevoice（フリーボイス投稿）
   - urgent（緊急投稿）

3. **投票機能**
   - `VotingService`（LocalStorage）で一時的な投票管理
   - `VoteHistory`テーブルで永続的な投票記録

4. **コンポーネント統合**
   - `ComposeSection`: 投稿作成UI（面談/アイデア/フリー/コンプライアンス）
   - `Timeline`: 投稿一覧表示
   - `EnhancedPost`: 改善提案投稿
   - `FreespacePost`: フリーボイス投稿

### 🟡 改善推奨項目（動作は正常だが最適化可能）

1. **投票データの永続化強化**
   - 現在: `VotingService`（LocalStorage）+ `VoteHistory`（DB）の二重管理
   - 推奨: DBを単一真実源とする統一管理

2. **ユーザー認証情報の統合**
   - 現在: `useDemoMode`と`useAuth`の二重チェック
   - 推奨: 認証フローの一本化

### ❌ 不足項目（なし）

HomePageは既存のテーブル構造で完全に動作するため、**新規テーブル追加は不要**です。

---

## 🔍 詳細分析

### 1. ページ構造と機能

#### 1.1 メインコンポーネント構成

```typescript
HomePage (src/pages/HomePage.tsx)
├─ ComposeSection (投稿作成UI)
│  ├─ 面談予約カード → /interview-station?action=book
│  ├─ アイデアボイスカード → /compose/improvement
│  ├─ フリーボイスカード → /compose/community
│  └─ コンプライアンス窓口カード → /whistleblowing
└─ Timeline (投稿一覧)
   ├─ EnhancedPost (improvement投稿用)
   ├─ FreespacePost (community投稿用)
   └─ PollResultPost (投票結果投稿用)
```

#### 1.2 タブ機能（URLパラメータ制御）

| タブ | URLパラメータ | 表示内容 | フィルタ条件 |
|------|--------------|---------|------------|
| improvement | `?tab=improvement` | アイデアボイス投稿 | `post.type === 'improvement'` |
| community | `?tab=community` | フリーボイス投稿 | `post.type === 'community'` |
| freevoice | `?tab=freevoice` | フリーボイス投稿 | `post.type === 'community'` |
| urgent | `?tab=urgent` | 緊急投稿 | `post.priority === 'urgent' || 'high'` |

#### 1.3 フィルタ機能（URLパラメータ制御）

| フィルタ | URLパラメータ | 適用タイミング |
|---------|--------------|--------------|
| new | `?filter=new` | improvement/freevoiceタブのデフォルト |
| latest | `?filter=latest` | その他タブのデフォルト |
| all | `?filter=all` | すべて表示 |

---

### 2. データソース分析

#### 2.1 投稿データ（Post）

| データ項目 | VoiceDrive Post | 医療システム | データ管理責任 | 状態 |
|-----------|----------------|-------------|--------------|------|
| `id` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `type` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `content` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `authorId` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `anonymityLevel` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `priority` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `createdAt` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `votes` (集計) | ✅ 計算 | ❌ | VoiceDrive | ✅ OK |
| `comments` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `agendaScore` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `agendaLevel` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |

**評価**: ✅ 既存の`Post`テーブルで完全対応

**Prismaスキーマ参照**: `prisma/schema.prisma` (Postモデル)

---

#### 2.2 投票データ（Vote / VoteHistory）

| データ項目 | VoiceDrive | 医療システム | データ管理責任 | 状態 |
|-----------|-----------|-------------|--------------|------|
| `userId` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `postId` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `voteOption` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `voteWeight` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `votedAt` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `postCategory` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `postType` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |

**評価**: ✅ `VoteHistory`テーブル（既存）で完全対応

**実装状況**:
- `Vote`テーブル: 基本的な投票記録（`@@unique([postId, userId])`）
- `VoteHistory`テーブル: 詳細な投票履歴（統計用）
- `VotingService`: LocalStorageベースの一時管理
- `useVoting` フック: 投票状態管理

---

#### 2.3 コメントデータ（Comment）

| データ項目 | VoiceDrive Comment | 医療システム | データ管理責任 | 状態 |
|-----------|-------------------|-------------|--------------|------|
| `id` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `postId` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `authorId` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `content` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `commentType` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `anonymityLevel` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `createdAt` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `likes` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |

**評価**: ✅ 既存の`Comment`テーブルで完全対応

---

#### 2.4 ユーザー認証情報

| データ項目 | VoiceDrive User | 医療システム | データ管理責任 | 状態 |
|-----------|----------------|-------------|--------------|------|
| `id` | ✅ マスタ | ❌ | VoiceDrive | ✅ OK |
| `employeeId` | ✅ キャッシュ | ✅ マスタ | 医療システム | ✅ OK |
| `name` | ✅ キャッシュ | ✅ マスタ | 医療システム | ✅ OK |
| `department` | ✅ キャッシュ | ✅ マスタ | 医療システム | ✅ OK |
| `permissionLevel` | ✅ キャッシュ | ✅ マスタ | 医療システム | ✅ OK |
| `professionCategory` | ✅ キャッシュ | ✅ マスタ | 医療システム | ✅ OK |

**評価**: ✅ 既存の`User`テーブルで完全対応

---

### 3. データ管理責任分界点

#### 3.1 VoiceDrive側が100%管理するデータ

| カテゴリ | テーブル | 主要フィールド | 理由 |
|---------|---------|--------------|------|
| 投稿 | `Post` | type, content, authorId, anonymityLevel, priority | VoiceDriveの中核機能 |
| 投票 | `Vote` | postId, userId, option, timestamp | VoiceDrive活動記録 |
| 投票履歴 | `VoteHistory` | userId, postId, voteOption, voteWeight, votedAt | VoiceDrive統計データ |
| コメント | `Comment` | postId, authorId, content, commentType | VoiceDrive活動記録 |
| 投票統計 | `UserActivitySummary` | totalVotes, thisMonthVotes, impactScore | VoiceDrive集計データ |

#### 3.2 医療システムから提供されるデータ（API経由）

| カテゴリ | 医療システムテーブル | VoiceDrive利用方法 | 提供方法 |
|---------|-------------------|------------------|---------|
| 職員基本情報 | `Employee` | `User`テーブルにキャッシュ | API + Webhook |
| 権限レベル | `Employee.permissionLevel` | `User.permissionLevel`にキャッシュ | API + Webhook |
| 組織情報 | `Department`, `Facility` | `User.department`, `User.facilityId`にキャッシュ | API + Webhook |

---

## 📊 実装状況サマリー

### ✅ 完全実装済み

| 機能 | 実装ファイル | データソース | 状態 |
|------|------------|-------------|------|
| タブ切り替え | `HomePage.tsx` 16-59行目 | URLパラメータ | ✅ 完全動作 |
| 投稿一覧表示 | `Timeline.tsx` | `Post`テーブル | ✅ 完全動作 |
| 投票機能 | `useVoting.ts` 46-71行目 | `VotingService` + `VoteHistory` | ✅ 完全動作 |
| コメント機能 | `Timeline.tsx` | `Comment`テーブル | ✅ 完全動作 |
| 投稿作成UI | `ComposeSection.tsx` | 画面遷移のみ | ✅ 完全動作 |
| 有効期限フィルタ | `Timeline.tsx` | `FreespaceExpirationService` | ✅ 完全動作 |
| ユーザー認証 | `Timeline.tsx` 22-52行目 | `useDemoMode` + `useAuth` | ✅ 完全動作 |

### 🟡 改善推奨（動作は正常）

| 項目 | 現状 | 推奨改善 | 優先度 |
|------|------|---------|-------|
| 投票データ管理 | LocalStorage + DB二重管理 | DBを単一真実源に統一 | 中 |
| 認証フロー | `useDemoMode`と`useAuth`の二重チェック | 認証プロバイダーの統一 | 低 |

---

## ✅ 動作確認チェックリスト

### フロントエンド機能

- [x] タブ切り替え（improvement/community/freevoice/urgent）
- [x] URLパラメータ反映（?tab=xxx&filter=yyy）
- [x] 投稿一覧表示（タイプ別フィルタ）
- [x] 投票ボタン表示・操作
- [x] コメント表示・投稿
- [x] 有効期限フィルタ（freespace投稿）
- [x] 投稿作成カード（4種類）
- [x] ページ遷移（/compose/xxx, /interview-station, /whistleblowing）

### データベース機能

- [x] `Post`テーブルから投稿取得
- [x] `Vote`テーブルで投票管理
- [x] `VoteHistory`テーブルで投票履歴記録
- [x] `Comment`テーブルでコメント管理
- [x] `User`テーブルで認証情報取得

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析](./PersonalStation_DB要件分析_20251008.md)
- [VotingService実装](../../src/services/VotingService.ts)
- [useVoting Hook実装](../../src/hooks/useVoting.ts)
- [Prisma Schema](../../prisma/schema.prisma)

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
次回レビュー: 改善推奨事項の実装判断後
