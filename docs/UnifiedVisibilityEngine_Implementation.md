# UnifiedVisibilityEngine 実装完了報告

**実装日**: 2025年10月8日
**実装者**: VoiceDrive開発チーム
**目的**: システムモード切替時の可視性エンジン自動切替機能実装

---

## 📋 実装概要

### 課題

これまで、2つの可視性エンジンが別々に存在していました：

1. **PostVisibilityEngine** - プロジェクト化モード用
2. **AgendaVisibilityEngine** - 議題モード用

しかし、**どちらを使うかを切り替える仕組みがありませんでした**。

### 解決策

**UnifiedVisibilityEngine**（統合可視性エンジン）を新規作成し、システムモードに応じて適切なエンジンを自動選択する仕組みを実装しました。

---

## 🎯 UnifiedVisibilityEngineの設計

### アーキテクチャ

```
UnifiedVisibilityEngine
  ├─ PostVisibilityEngine (プロジェクト化モード用)
  ├─ AgendaVisibilityEngine (議題モード用)
  └─ SystemModeManager (モード管理)
       ↓
  自動的に適切なエンジンを選択
```

### コア機能

```typescript
export class UnifiedVisibilityEngine {
  private projectEngine: PostVisibilityEngine;
  private agendaEngine: AgendaVisibilityEngine;

  /**
   * システムモードに応じた表示設定を取得
   */
  getDisplayConfig(post: Post, currentUser: User): PostDisplayConfig {
    const currentMode = systemModeManager.getCurrentMode();

    if (currentMode === SystemMode.AGENDA) {
      // 議題モード: AgendaVisibilityEngineを使用
      return this.getAgendaDisplayConfig(post, currentUser);
    } else {
      // プロジェクト化モード: PostVisibilityEngineを使用
      return this.projectEngine.getDisplayConfig(post, currentUser);
    }
  }
}
```

---

## 🔄 モード別の動作

### プロジェクト化モード

| スコア | レベル | 閲覧範囲 | 投票範囲 |
|--------|--------|----------|----------|
| 0-99点 | PENDING/TEAM | 同一部署 + 管理職のみ | 同一部署のみ |
| 100-199点 | TEAM | 同一部署 + 管理職のみ | 同一部署のみ |
| 200-399点 | DEPARTMENT | 同一部署 + 施設内管理職 | 同一部署のみ |
| 400-799点 | FACILITY | **法人内全員** | 施設内のみ |
| 800点以上 | ORGANIZATION | 法人内全員 | 法人内全員 |

### 議題モード

| スコア | レベル | 閲覧範囲 | 投票範囲 |
|--------|--------|----------|----------|
| 0-29点 | PENDING | 同一部署 + 管理職のみ | 同一部署のみ |
| 30-49点 | DEPT_REVIEW | 同一部署 + 施設内管理職 | 同一部署のみ |
| 50-99点 | DEPT_AGENDA | 同一部署 + 施設内管理職 | 同一部署のみ |
| 100-299点 | FACILITY_AGENDA | **法人内全員** | 施設内のみ |
| 300-599点 | CORP_REVIEW | 法人内全員 | 法人内全員 |
| 600点以上 | CORP_AGENDA | 法人内全員 | 法人内全員 |

---

## 🔧 実装詳細

### 1. UnifiedVisibilityEngine.ts

新規ファイル作成：

```typescript
// src/services/UnifiedVisibilityEngine.ts

export class UnifiedVisibilityEngine {
  // モードに応じた表示設定取得
  getDisplayConfig(post: Post, currentUser: User): PostDisplayConfig

  // 議題モード用の表示設定
  private getAgendaDisplayConfig(post: Post, currentUser: User): PostDisplayConfig

  // アクセスレベル判定
  private getAccessLevel(canVote, canComment, canView): AccessLevel

  // 現在のモード取得
  getCurrentMode(): SystemMode

  // モード説明取得
  getModeDescription(): string
}
```

### 2. 既存コンポーネント更新

#### postFilters.ts

```typescript
// 旧実装
import PostVisibilityEngine from '../services/PostVisibilityEngine';
const visibilityEngine = new PostVisibilityEngine();

// 新実装
import { unifiedVisibilityEngine } from '../services/UnifiedVisibilityEngine';
const displayConfig = unifiedVisibilityEngine.getDisplayConfig(post, currentUser);
```

#### Post.tsx

```typescript
// 旧実装
import PostVisibilityEngine from '../services/PostVisibilityEngine';
const visibilityEngine = new PostVisibilityEngine();

// 新実装
import { unifiedVisibilityEngine } from '../services/UnifiedVisibilityEngine';
const displayConfig = unifiedVisibilityEngine.getDisplayConfig(post, currentUser);
```

---

## ✅ テスト結果

### 7テスト全て合格 ✨

```bash
Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

### テストカバレッジ

#### プロジェクト化モード
- ✅ 検討中案件は同一部署のみ閲覧可能
- ✅ 施設レベルでは全員閲覧可能

#### 議題モード
- ✅ 検討中案件は同一部署のみ閲覧可能
- ✅ 施設議題（100-299点）では法人内全員閲覧可能

#### モード切替の動作確認
- ✅ モード切替時に表示設定が変わる

#### モード情報取得
- ✅ 現在のモードを取得できる
- ✅ モード説明を取得できる

---

## 💡 モード切替の具体例

### 同じ150点の投稿が、モードで閲覧範囲が変わる

**投稿**: スコア150点、リハビリテーション科
**ユーザー**: 医療情報部（他施設）

#### プロジェクト化モード時
```typescript
// 150点 → TEAMレベル
// 他施設ユーザー → 閲覧不可
displayConfig.canView = false
displayConfig.viewRestrictionReason = "他施設での検討中案件のため、閲覧できません"
```

#### 議題モード時
```typescript
// 150点 → FACILITY_AGENDAレベル
// 他施設ユーザー → 閲覧可能（投票は不可）
displayConfig.canView = true
displayConfig.showVoteButtons = false
```

---

## 🎯 期待される効果

### 1. シームレスなモード切替

- **管理者がモード変更すると、全ての投稿表示が自動的に切り替わる**
- ユーザーは何も操作不要
- システム全体が新しいモードのルールで動作

### 2. 運用の柔軟性

**導入初期（0-6ヶ月）**
```
議題モード
├─ 委員会提出を目指した段階的議題化
├─ 匿名投票による心理的安全性
└─ シンプルな承認フロー
```

**組織成熟期（12ヶ月以降）**
```
プロジェクト化モード
├─ 自動チーム編成
├─ 部署横断の協働促進
└─ 進捗管理・マイルストーン設定
```

### 3. 一貫性の保証

- 全画面で同じモードのルールが適用される
- 矛盾のない権限制御
- バグの削減

---

## 📁 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/services/UnifiedVisibilityEngine.ts` | **新規作成** - 統合可視性エンジン |
| `src/services/UnifiedVisibilityEngine.test.ts` | **新規作成** - テストスイート（7テスト） |
| `src/utils/postFilters.ts` | UnifiedVisibilityEngineを使用するよう変更 |
| `src/components/Post.tsx` | UnifiedVisibilityEngineを使用するよう変更 |

---

## 🚀 使用方法

### コンポーネントでの使用

```typescript
import { unifiedVisibilityEngine } from '../services/UnifiedVisibilityEngine';

// 自動的に現在のモードに応じた権限チェック
const displayConfig = unifiedVisibilityEngine.getDisplayConfig(post, currentUser);

if (displayConfig.canView === false) {
  // 閲覧不可の場合の処理
  return <AccessDeniedMessage reason={displayConfig.viewRestrictionReason} />;
}

// 投票ボタン表示
{displayConfig.showVoteButtons && <VotingButtons />}

// コメントフォーム表示
{displayConfig.showCommentForm && <CommentForm />}
```

### モード情報の取得

```typescript
// 現在のモードを確認
const currentMode = unifiedVisibilityEngine.getCurrentMode();

// モード説明を取得
const description = unifiedVisibilityEngine.getModeDescription();
// → "📋 議題システムモード: 委員会提出を目指した段階的議題化"
// → "🚀 プロジェクト化モード: チーム編成による協働的実装"
```

---

## 🔄 モード切替フロー

```
管理者（Lv.99）がモード変更
  ↓
SystemModeManager.setMode()
  ↓
LocalStorageに保存
  ↓
他タブ・コンポーネントに通知（storage event）
  ↓
UnifiedVisibilityEngine.getDisplayConfig()
  ↓
現在のモードを確認
  ↓
適切なエンジンを選択
  ├─ 議題モード → AgendaVisibilityEngine
  └─ プロジェクト化モード → PostVisibilityEngine
  ↓
表示設定を返却
  ↓
UI自動更新
```

---

## 📝 まとめ

### 実装完了項目

✅ UnifiedVisibilityEngine新規作成
✅ システムモード自動切替機能実装
✅ 既存コンポーネントの統合
✅ 包括的テストスイート作成（7テスト）
✅ 全テスト合格
✅ LocalStorageモック実装（テスト環境対応）

### 品質保証

- **型安全性**: TypeScript型定義完備
- **テストカバレッジ**: モード切替含む7パターン網羅
- **後方互換性**: 既存機能への影響なし
- **シングルトン**: unifiedVisibilityEngineでグローバルアクセス

### 今後の展開

- [ ] DB統合後のモード設定永続化
- [ ] モード切替時の通知UI
- [ ] 管理画面でのモード切替履歴表示
- [ ] モード別の統計ダッシュボード

---

**実装完了日**: 2025年10月8日
**VoiceDrive開発チーム**

---

## 🎉 結論

これで、**システムモードが切り替わっても、適切な可視性ルールが自動的に適用されます**。

管理者がモードを変更するだけで：
- 全ての投稿の閲覧範囲が変わる
- 投票権限が変わる
- コメント権限が変わる

**完全に動的なモード切替システムが完成しました！** ✨
