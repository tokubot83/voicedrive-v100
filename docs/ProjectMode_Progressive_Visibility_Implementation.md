# プロジェクト化モード 段階的閲覧制御 実装完了報告

**実装日**: 2025年10月8日
**実装者**: VoiceDrive開発チーム
**目的**: プロジェクトレベルに応じた段階的な閲覧範囲拡大の実装

---

## 📋 実装概要

### 背景

プロジェクト化モードでは、以前は**全ての投稿が法人内全員に閲覧可能**でした。
これにより以下の問題がありました：

- ❌ 検討中（PENDING）の案件が他部署・他施設に見えてしまう
- ❌ 部署内での繊細な議論が筒抜け
- ❌ 投稿者が躊躇する可能性

### 改善内容

**プロジェクトレベルに応じて閲覧範囲を段階的に拡大**する仕組みを実装しました。

---

## 🎯 新しい閲覧制御ルール

### レベル別閲覧権限

| プロジェクトレベル | スコア範囲 | 閲覧可能ユーザー | 投票可能ユーザー | コメント可能ユーザー |
|------------------|----------|---------------|---------------|-----------------|
| **PENDING** | 0-99点 | 同一部署 + 管理職（Lv.8以上） | 同一部署のみ | 同一部署のみ |
| **TEAM** | 100-199点 | 同一部署 + 管理職（Lv.8以上） | 同一部署のみ | 同一部署のみ |
| **DEPARTMENT** | 200-399点 | 同一部署 + 施設内管理職 | 同一部署のみ | 同一部署のみ |
| **FACILITY** | 400-799点 | **法人内全員** ✨ | 施設内のみ | 施設内のみ |
| **ORGANIZATION** | 800点以上 | 法人内全員 | 法人内全員 | 法人内全員 |

### 特徴

✅ **心理的安全性**: 検討中は狭い範囲で議論できる
✅ **段階的公開**: 支持が集まると徐々に公開範囲拡大
✅ **管理職の早期発見**: 管理職（Lv.8以上）は検討中でも閲覧可能
✅ **議題モードと統一**: 2つのモードで同じ設計思想

---

## 🔧 実装詳細

### 1. PostVisibilityEngine.ts

#### 新規メソッド追加

```typescript
/**
 * 閲覧権限をチェック（プロジェクトレベルに応じた段階的公開）
 */
private checkViewEligibility(
  postLevel: ProjectLevel,
  userScope: StakeholderGroup,
  isManager: boolean
): boolean {
  switch (postLevel) {
    case 'PENDING':
    case 'TEAM':
      // 検討中・チームレベル：同一部署 + 管理職のみ
      return userScope === StakeholderGroup.SAME_TEAM ||
             userScope === StakeholderGroup.SAME_DEPARTMENT ||
             isManager;

    case 'DEPARTMENT':
      // 部署プロジェクト：同一部署 + 施設内管理職のみ
      return userScope === StakeholderGroup.SAME_TEAM ||
             userScope === StakeholderGroup.SAME_DEPARTMENT ||
             (userScope === StakeholderGroup.SAME_FACILITY && isManager);

    case 'FACILITY':
    case 'ORGANIZATION':
    case 'STRATEGIC':
      // 施設レベル以上：全員閲覧可能
      return true;
  }
}
```

#### getDisplayConfig更新

閲覧権限チェックを追加し、権限がない場合は専用の設定を返すように変更：

```typescript
// 閲覧できない場合は制限付き設定を返す
if (!canView) {
  return {
    showVoteButtons: false,
    showCommentForm: false,
    showProjectStatus: false,
    showEmergencyOverride: false,
    accessLevel: 'no_access',
    canView: false,
    viewRestrictionReason: this.getViewRestrictionReason(postLevel, userScope)
  };
}
```

### 2. PostDisplayConfig型定義更新

```typescript
// src/types/visibility.ts
export interface PostDisplayConfig {
  showVoteButtons: boolean;
  showCommentForm: boolean;
  showProjectStatus: boolean;
  showEmergencyOverride: boolean;
  accessLevel: 'full' | 'limited' | 'view_only' | 'no_access'; // 'no_access'追加
  upgradeNotification?: string;
  emergencyOverrideOptions?: EmergencyOverrideOption[];
  canView?: boolean; // 新規追加
  viewRestrictionReason?: string; // 新規追加
}
```

### 3. postFilters.ts更新

```typescript
// 旧実装（全員に表示）
return userScope === StakeholderGroup.SAME_TEAM ||
       userScope === StakeholderGroup.SAME_DEPARTMENT ||
       userScope === StakeholderGroup.SAME_FACILITY ||
       userScope === StakeholderGroup.SAME_ORGANIZATION;

// 新実装（PostVisibilityEngineの閲覧権限チェックを使用）
const displayConfig = visibilityEngine.getDisplayConfig(post, currentUser);

if (displayConfig.canView === false) {
  return false; // 閲覧不可の投稿は非表示
}

return true;
```

### 4. Post.tsx UI更新

閲覧制限時の専用UIを追加：

```typescript
// 閲覧権限がない場合は制限表示を返す
if (displayConfig.canView === false) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 mb-4">
      <div className="flex items-center justify-center flex-col text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="font-bold text-gray-700 mb-2">閲覧制限</h3>
        <p className="text-gray-500 text-sm">
          {displayConfig.viewRestrictionReason || 'この投稿を表示する権限がありません'}
        </p>
      </div>
    </div>
  );
}
```

---

## ✅ テスト結果

### テストカバレッジ

**12テスト全て合格** ✨

```bash
Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```

### テスト項目

#### PENDING/TEAMレベル（0-99点）
- ✅ 同一部署のユーザーは閲覧可能
- ✅ 他部署の一般ユーザーは閲覧不可
- ✅ 管理職（Lv.8以上）は他部署でも閲覧可能

#### DEPARTMENTレベル（100-299点）
- ✅ 同一部署のユーザーは閲覧・投票可能
- ✅ 同一施設の一般ユーザーは閲覧不可
- ✅ 同一施設の管理職は閲覧可能（投票不可）

#### FACILITYレベル以上（300点以上）
- ✅ 施設レベルでは全員閲覧可能
- ✅ 同一施設のユーザーは投票可能
- ✅ 他施設のユーザーは閲覧のみ

#### ORGANIZATIONレベル（800点以上）
- ✅ 法人レベルでは全員が閲覧・投票可能

#### 権限制限メッセージ
- ✅ PENDING時の他部署ユーザーへのメッセージ
- ✅ DEPARTMENT時の他施設ユーザーへのメッセージ

---

## 📊 閲覧制限メッセージ

### ユーザーへの表示メッセージ

| 状況 | 表示メッセージ |
|-----|-------------|
| PENDING/TEAM時、他部署（同一施設） | 他部署での検討中案件のため、閲覧できません |
| PENDING/TEAM時、他施設 | 他施設での検討中案件のため、閲覧できません |
| DEPARTMENT時、他部署（同一施設） | 他部署のプロジェクトのため、閲覧できません（管理職のみ閲覧可） |
| DEPARTMENT時、他施設 | 他施設のプロジェクトのため、閲覧できません |

---

## 🎯 議題モードとの比較

### 設計思想の統一

両モードで同じ段階的公開の思想を採用：

| 項目 | 議題モード | プロジェクト化モード |
|-----|----------|------------------|
| **検討中の閲覧** | 部署内 + 管理職のみ | 部署内 + 管理職のみ ✅ |
| **部署レベルの閲覧** | 部署内 + 施設内管理職 | 部署内 + 施設内管理職 ✅ |
| **施設レベルの閲覧** | 法人内全員 | 法人内全員 ✅ |
| **法人レベルの閲覧** | 法人内全員 | 法人内全員 ✅ |
| **管理職の特権** | Lv.8以上で早期閲覧 | Lv.8以上で早期閲覧 ✅ |

---

## 💡 期待される効果

### 1. 心理的安全性の向上

- 検討中の案件が限られた範囲で議論できる
- 「他部署に見られている」という不安の軽減
- 投稿のハードルが下がる

### 2. 段階的な情報共有

- 支持が集まった案件から徐々に公開範囲拡大
- 自然な情報伝播
- 組織全体での認知度向上

### 3. 管理職による早期発見・支援

- 検討中でも管理職は閲覧可能
- 問題の早期キャッチ
- 適切なタイミングでの支援・介入

### 4. システムの一貫性向上

- 議題モードと同じ設計思想
- ユーザーの混乱防止
- 保守性の向上

---

## 📁 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/services/PostVisibilityEngine.ts` | 閲覧権限チェックメソッド追加 |
| `src/types/visibility.ts` | PostDisplayConfig型定義更新 |
| `src/utils/postFilters.ts` | フィルター処理を閲覧権限ベースに変更 |
| `src/components/Post.tsx` | 閲覧制限UI追加 |
| `src/services/PostVisibilityEngine.test.ts` | テストスイート作成（12テスト） |

---

## 🚀 今後の展望

### Phase 2: DB統合後の拡張

- [ ] 閲覧履歴の記録
- [ ] 閲覧制限解除通知
- [ ] 管理職閲覧ログの監査

### Phase 3: 機能拡張

- [ ] 部署間コラボレーション機能
- [ ] 早期フィードバック機能（管理職限定）
- [ ] プロジェクト化予兆検知

---

## 📝 まとめ

### 実装完了項目

✅ プロジェクトレベル別閲覧制御実装
✅ 管理職特権（早期閲覧）実装
✅ 閲覧制限UI実装
✅ 議題モードとの設計統一
✅ 包括的テストスイート作成
✅ 全テスト合格（12/12）

### 品質保証

- **型安全性**: TypeScript型定義完備
- **テストカバレッジ**: 主要シナリオ12パターン網羅
- **後方互換性**: 既存機能への影響なし
- **UI/UX**: わかりやすい制限メッセージ

---

**実装完了日**: 2025年10月8日
**VoiceDrive開発チーム**
