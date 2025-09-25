# Phase 2 画面統合タスクリスト

## Day 1 (10/1) - ダッシュボード統合

### 実装ファイル一覧
- [ ] `src/pages/Dashboard.tsx` - 権限レベル表示統合
- [ ] `src/hooks/useUserPermission.ts` - ユーザー権限カスタムフック
- [ ] `src/contexts/UserContext.tsx` - ユーザーコンテキスト
- [ ] `src/components/dashboard/PermissionSummary.tsx` - 権限サマリーWidget

### タスク詳細
```typescript
// 1. Dashboard.tsx更新内容
- PermissionLevelBadgeの表示
- 権限レベルによるダッシュボードカスタマイズ
- アクセス可能機能の一覧表示

// 2. useUserPermission.ts
const useUserPermission = () => {
  - ユーザーの権限レベル取得
  - メニュー表示権限判定
  - 機能アクセス権限チェック
}

// 3. UserContext.tsx
interface UserContextValue {
  user: User | null;
  permissionLevel: PermissionLevel | SpecialPermissionLevel | null;
  metadata: PermissionMetadata | null;
  isLoading: boolean;
}
```

## Day 2 (10/2) - 議題投稿画面統合

### 実装ファイル一覧
- [ ] `src/components/ideaVoice/IdeaVoiceForm.tsx` - フォーム更新
- [ ] `src/components/proposal/ProposalSubmission.tsx` - 議題提出コンポーネント
- [ ] `src/components/voting/VoteWeightPreview.tsx` - 投票重みプレビュー
- [ ] `src/components/proposal/CategorySelector.tsx` - カテゴリ選択UI

### タスク詳細
```typescript
// 1. IdeaVoiceForm.tsx更新
- ProposalEscalationEngine統合
- カテゴリ別重み付け表示
- 提出前の予想スコア表示

// 2. ProposalSubmission.tsx
- 議題タイトル入力
- カテゴリ選択（医療安全/感染対策/業務改善/戦略提案）
- ファイル添付機能
- 部署サイズ自動取得

// 3. VoteWeightPreview.tsx
- リアルタイム投票重み計算
- 3層計算の内訳表示
- 予想される影響範囲表示
```

## Day 3 (10/3) - 投票画面統合

### 実装ファイル一覧
- [ ] `src/pages/VotingPage.tsx` - 投票ページメイン
- [ ] `src/components/voting/VotingInterface.tsx` - 投票インターフェース更新
- [ ] `src/components/voting/VotingPermissionCheck.tsx` - 権限チェックコンポーネント
- [ ] `src/components/voting/VotingScopeIndicator.tsx` - 投票範囲表示

### タスク詳細
```typescript
// 1. VotingInterface.tsx更新
- VotingPermissionMatrix統合
- 部署/施設/法人レベル投票の切り替え
- 投票不可理由の表示

// 2. VotingPermissionCheck.tsx
- ユーザー権限と議題レベルの照合
- 投票可否判定ロジック
- 権限不足時のメッセージ表示

// 3. VotingScopeIndicator.tsx
- 現在の投票範囲表示（部署/施設/法人）
- 次の閾値までの進捗表示
- 参加可能人数の表示
```

## Day 4 (10/4) - 進捗管理画面統合

### 実装ファイル一覧
- [ ] `src/pages/ProposalProgress.tsx` - 議題進捗ページ
- [ ] `src/components/proposal/CommitteeSubmissionStatus.tsx` - 委員会提出状況
- [ ] `src/components/proposal/EscalationTimeline.tsx` - エスカレーションタイムライン
- [ ] `src/components/proposal/ProposalMetrics.tsx` - 議題メトリクス

### タスク詳細
```typescript
// 1. ProposalProgress.tsx
- ProposalLevelIndicator統合
- 議題ステータス一覧
- フィルタリング機能（部署/施設/状態）

// 2. CommitteeSubmissionStatus.tsx
- 委員会提出対象議題の表示
- 委員会別の分類
- 提出書類生成機能

// 3. EscalationTimeline.tsx
- スコア推移のグラフ表示
- エスカレーション履歴
- マイルストーン表示（30→50→100→300→600）

// 4. ProposalMetrics.tsx
- 部署別の議題統計
- カテゴリ別の分布
- 投票参加率
```

## 共通コンポーネント更新

### ナビゲーション更新
- [ ] `src/components/Layout/Navigation.tsx`
  - 権限レベルによるメニュー制御
  - 新機能へのリンク追加

### 通知システム統合
- [ ] `src/components/notification/NotificationCenter.tsx`
  - 議題エスカレーション通知
  - 委員会提出通知
  - 投票開始/終了通知

### エラーハンドリング
- [ ] `src/components/error/PermissionError.tsx`
  - 権限エラーページ
  - 権限不足時の案内

## チェックリスト

### 各画面共通確認項目
- [ ] レスポンシブデザイン対応
- [ ] ローディング状態の表示
- [ ] エラーハンドリング
- [ ] アクセシビリティ（ARIA属性）
- [ ] キーボードナビゲーション

### パフォーマンス確認
- [ ] 不要な再レンダリング防止
- [ ] API呼び出しの最適化
- [ ] 画像・アセットの最適化
- [ ] コード分割（Code Splitting）

### テスト作成
- [ ] ユニットテスト
- [ ] 統合テスト
- [ ] E2Eテストシナリオ

## 実装優先順位

1. **Critical（必須）**
   - ダッシュボード権限表示
   - 投票権限チェック
   - 議題提出基本機能

2. **High（高）**
   - エスカレーション表示
   - 投票重み計算表示
   - 委員会連携

3. **Medium（中）**
   - 統計・メトリクス表示
   - 詳細なプログレス表示
   - 通知機能

4. **Low（低）**
   - アニメーション効果
   - 高度なフィルタリング
   - データエクスポート機能

## 完了条件

### Day 1完了条件
- [ ] ユーザーログイン後、権限レベルが表示される
- [ ] 権限に応じたメニューが表示される
- [ ] ダッシュボードに権限情報が表示される

### Day 2完了条件
- [ ] 議題投稿フォームが動作する
- [ ] カテゴリ選択が可能
- [ ] 投票重みプレビューが表示される

### Day 3完了条件
- [ ] 投票権限チェックが動作する
- [ ] 投票範囲が正しく表示される
- [ ] 投票が実行できる

### Day 4完了条件
- [ ] 議題の進捗が確認できる
- [ ] エスカレーション状況が表示される
- [ ] 委員会提出状況が確認できる

---
最終更新: 2025年9月25日