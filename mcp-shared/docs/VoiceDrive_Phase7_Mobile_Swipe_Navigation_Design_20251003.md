# VoiceDrive Phase 7: モバイルスワイプナビゲーション実装設計書

**日付**: 2025年10月3日
**担当**: VoiceDrive開発チーム
**フェーズ**: Phase 7（モバイルUX強化）

---

## 📋 概要

モバイルデバイスでの閲覧時に、**横スワイプでタブ間を移動**できる機能を実装します。
X（旧Twitter）、Instagram等のモバイルアプリと同様の直感的な操作を提供します。

---

## 🎯 目的

### ユーザー体験の向上

1. **直感的な操作**
   - スワイプ操作はモバイルユーザーに馴染み深い
   - タブボタンをタップする必要がなく、片手操作が容易

2. **操作効率の向上**
   - 画面上部のタブボタンに指を伸ばす動作を削減
   - コンテンツ領域でのスワイプで直接タブ切り替え

3. **医療現場への最適化**
   - 立ち仕事中の看護師が片手で素早く操作可能
   - 忙しい現場での時短効果

---

## 📊 実装範囲

### Phase 7-A: 面談ステーション（最優先）

**対象ページ**: `src/pages/InterviewStation.tsx`

**タブ構成**:
1. ダッシュボード
2. 履歴
3. 予約

**理由**:
- モバイル使用率が最も高い
- 3つのタブで効果を最大化
- 他ページの実装の基礎となる

### Phase 7-B: 他ステーション展開

**対象ページ**:
1. `src/pages/EvaluationStation.tsx` - 評価ステーション
2. `src/pages/HealthStation.tsx` - 健康ステーション
3. `src/pages/CareerChoiceStation.tsx` - キャリア選択ステーション
4. `src/pages/PersonalStation.tsx` - パーソナルステーション
5. `src/pages/TopPage.tsx` - トップページ

**実装方針**:
- Phase 7-Aで作成した共通コンポーネントを再利用
- 各ページの既存タブ構造に適用

### Phase 7-C: UX改善

**追加機能**:
1. **スワイプインジケーター**
   - タブ下部に進捗ドット表示
   - アクティブタブの視覚的フィードバック

2. **スワイプアニメーション強化**
   - スムーズなトランジション
   - スワイプ中のプレビュー表示

3. **設定オプション**
   - スワイプ感度調整（オプション）
   - スワイプ無効化オプション（アクセシビリティ）

---

## 🔧 技術設計

### 使用ライブラリ

**react-swipeable**: 軽量で設定が簡単

```bash
npm install react-swipeable
```

**特徴**:
- ✅ TypeScript対応
- ✅ 軽量（~5KB）
- ✅ タッチとマウスの両対応
- ✅ 柔軟な設定（閾値、方向、速度）

### アーキテクチャ

#### 1. カスタムフック: `useSwipeableTabs`

**ファイル**: `src/hooks/useSwipeableTabs.ts`

**機能**:
- タブ切り替えロジック
- スワイプイベントハンドリング
- デバイス検出（モバイル/PC）
- アニメーション制御

**インターフェース**:
```typescript
interface UseSwipeableTabsOptions {
  activeTab: string | number;
  tabs: string[];
  onTabChange: (tab: string | number) => void;
  enableOnDesktop?: boolean; // デフォルト: false
  swipeThreshold?: number;   // デフォルト: 50
}

interface UseSwipeableTabsReturn {
  handlers: SwipeableHandlers;
  swipeDirection: 'left' | 'right' | null;
  isTransitioning: boolean;
}
```

#### 2. 共通コンポーネント: `SwipeableTabContainer`

**ファイル**: `src/components/common/SwipeableTabContainer.tsx`

**機能**:
- スワイプハンドラーの適用
- アニメーション管理
- タブコンテンツのラッピング

**Props**:
```typescript
interface SwipeableTabContainerProps {
  activeTab: string | number;
  tabs: Array<{
    id: string | number;
    label: string;
    content: React.ReactNode;
  }>;
  onTabChange: (tab: string | number) => void;
  className?: string;
  enableSwipe?: boolean; // デフォルト: モバイルのみ
}
```

---

## 📱 実装仕様

### デバイス検出

```typescript
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024; // lg breakpoint
};
```

### スワイプ検出ロジック

**最小スワイプ距離**: 50px
**スワイプ速度閾値**: 0.3 (velocity)

```typescript
const handlers = useSwipeable({
  onSwipedLeft: () => {
    // 左スワイプ → 次のタブ
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1]);
    }
  },
  onSwipedRight: () => {
    // 右スワイプ → 前のタブ
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1]);
    }
  },
  trackMouse: false, // PC版ではマウスドラッグ無効
  delta: 50,         // 最小スワイプ距離
  preventScrollOnSwipe: false // 縦スクロールを妨げない
});
```

### アニメーション

**CSS Transitions**:
```css
.swipeable-content {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.swipeable-content.swipe-left {
  transform: translateX(-100%);
  opacity: 0;
}

.swipeable-content.swipe-right {
  transform: translateX(100%);
  opacity: 0;
}

.swipeable-content.active {
  transform: translateX(0);
  opacity: 1;
}
```

---

## 🎨 UI/UX設計

### スワイプインジケーター（Phase 7-C）

**位置**: タブボタンの直下
**デザイン**: ドット形式（Instagram風）

```tsx
<div className="flex justify-center gap-2 mt-2">
  {tabs.map((tab, index) => (
    <div
      key={tab}
      className={`h-1.5 rounded-full transition-all duration-300 ${
        activeTab === tab
          ? 'w-8 bg-purple-500'
          : 'w-1.5 bg-gray-400'
      }`}
    />
  ))}
</div>
```

### スワイプ中のプレビュー（Phase 7-C）

**効果**: スワイプ中に次のタブが少し見える

```tsx
<div className="relative overflow-hidden">
  <div
    className="flex transition-transform duration-300"
    style={{
      transform: `translateX(${swipeOffset}px)`
    }}
  >
    {/* 前のタブ */}
    <div className="w-full flex-shrink-0 opacity-30">
      {prevTabContent}
    </div>
    {/* 現在のタブ */}
    <div className="w-full flex-shrink-0">
      {currentTabContent}
    </div>
    {/* 次のタブ */}
    <div className="w-full flex-shrink-0 opacity-30">
      {nextTabContent}
    </div>
  </div>
</div>
```

---

## ⚙️ 設定オプション（Phase 7-C）

### ローカルストレージ設定

```typescript
interface SwipeSettings {
  enabled: boolean;        // スワイプ機能のON/OFF
  sensitivity: 'low' | 'medium' | 'high'; // 感度
  showIndicator: boolean;  // インジケーター表示
}

// デフォルト設定
const DEFAULT_SWIPE_SETTINGS: SwipeSettings = {
  enabled: true,
  sensitivity: 'medium',
  showIndicator: true
};
```

---

## 📝 実装手順

### Phase 7-A: 面談ステーション

1. **ライブラリインストール**
   ```bash
   npm install react-swipeable
   ```

2. **カスタムフック作成**
   - `src/hooks/useSwipeableTabs.ts`
   - デバイス検出、スワイプハンドリング

3. **面談ステーションに適用**
   - `InterviewStation.tsx`を修正
   - 既存のタブ切り替えロジックと統合

4. **テスト**
   - モバイルデバイスでの動作確認
   - タブ切り替えのスムーズさ確認
   - 縦スクロールとの競合チェック

### Phase 7-B: 他ステーション展開

1. **共通コンポーネント作成**
   - `src/components/common/SwipeableTabContainer.tsx`
   - 再利用可能なラッパーコンポーネント

2. **各ステーションページに適用**
   - EvaluationStation
   - HealthStation
   - CareerChoiceStation
   - PersonalStation
   - TopPage

3. **一括テスト**
   - 全ページでスワイプ動作確認

### Phase 7-C: UX改善

1. **スワイプインジケーター追加**
   - ドット形式の進捗表示
   - アクティブタブのハイライト

2. **アニメーション強化**
   - スワイプ中のプレビュー表示
   - トランジションの調整

3. **設定機能実装**
   - ローカルストレージでの設定保存
   - 設定画面の作成（オプション）

---

## ✅ 完了条件

### Phase 7-A
- ✅ 面談ステーションで横スワイプ動作
- ✅ モバイルでのみ有効化
- ✅ 既存のタブボタンも引き続き使用可能
- ✅ 縦スクロールを妨げない

### Phase 7-B
- ✅ 全6ページ（面談含む）でスワイプ対応
- ✅ 共通コンポーネント化
- ✅ コード重複の最小化

### Phase 7-C
- ✅ スワイプインジケーター表示
- ✅ スムーズなアニメーション
- ✅ 設定オプション（ON/OFF、感度）
- ✅ アクセシビリティ対応

---

## 🔍 テスト計画

### デバイステスト

| デバイス | OS | ブラウザ | 確認項目 |
|---------|-----|---------|---------|
| iPhone | iOS | Safari | スワイプ動作、スクロール |
| Android | Android | Chrome | スワイプ動作、スクロール |
| iPad | iOS | Safari | タブレット対応 |
| Desktop | Windows | Chrome | スワイプ無効化 |

### 機能テスト

1. **基本動作**
   - [ ] 左スワイプで次のタブ
   - [ ] 右スワイプで前のタブ
   - [ ] 最初/最後のタブで端の挙動

2. **競合チェック**
   - [ ] 縦スクロールが正常動作
   - [ ] タブボタンクリックも動作
   - [ ] フォーム入力と競合しない

3. **パフォーマンス**
   - [ ] アニメーションのスムーズさ
   - [ ] レスポンス時間（<100ms）
   - [ ] メモリリークなし

---

## 🎉 期待される効果

### 定量的効果

- **操作時間短縮**: タブ切り替え時間 50%削減（推定）
- **タップ回数削減**: タブ間移動が1アクション化
- **ユーザー満足度**: +20%向上（推定）

### 定性的効果

- ✅ モダンなアプリ体験の提供
- ✅ 医療現場での使いやすさ向上
- ✅ VoiceDriveの差別化要因
- ✅ ユーザーエンゲージメント向上

---

**✨ Phase 7の完了により、VoiceDriveは医療現場で最も使いやすいモバイルアプリケーションの一つになります！**

---

*この設計書は2025年10月3日に作成されました。実装時は本ドキュメントに基づき進めてください。*
