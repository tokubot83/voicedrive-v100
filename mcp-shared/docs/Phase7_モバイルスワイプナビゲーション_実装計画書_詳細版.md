# Phase 7: モバイルスワイプナビゲーション 実装計画書（詳細版）

**作成日**: 2025年10月20日
**対象**: VoiceDrive Phase 7 - モバイルUX強化
**ステータス**: 未着手

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
**見積もり**: 2日

**対象ページ**: `src/pages/InterviewStation.tsx`

**タブ構成**:
1. ダッシュボード
2. 履歴
3. 予約

**理由**:
- モバイル使用率が最も高い
- 3つのタブで効果を最大化
- 他ページの実装の基礎となる

**実装内容**:
1. react-swipeableライブラリインストール
2. useSwipeableTabsカスタムフック作成
3. InterviewStationへの適用
4. モバイルデバイステスト

---

### Phase 7-B: 他ステーション展開
**見積もり**: 3日

**対象ページ**:
1. `src/pages/EvaluationStation.tsx` - 評価ステーション
2. `src/pages/HealthStation.tsx` - 健康ステーション
3. `src/pages/CareerSelectionStationPage.tsx` - キャリア選択ステーション
4. `src/pages/PersonalStation.tsx` - パーソナルステーション
5. `src/pages/HomePage.tsx` - トップページ（ホーム）

**実装方針**:
- Phase 7-Aで作成した共通コンポーネントを再利用
- 各ページの既存タブ構造に適用

**実装内容**:
1. SwipeableTabContainerコンポーネント作成
2. 各ステーションページへの適用
3. 一括テスト

---

### Phase 7-C: UX改善
**見積もり**: 2日

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

---

## 📝 詳細実装内容

### Phase 7-A: 面談ステーション（2日）

#### Step 1: ライブラリインストール（10分）

```bash
npm install react-swipeable
npm install --save-dev @types/react-swipeable
```

**確認事項**:
- [ ] package.jsonに追加されたか確認
- [ ] TypeScript型定義がインストールされたか確認

---

#### Step 2: カスタムフック作成（3時間）

**ファイル**: `src/hooks/useSwipeableTabs.ts`（新規作成）

**実装内容**:
```typescript
import { useState, useCallback } from 'react';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';

interface UseSwipeableTabsOptions<T extends string | number> {
  activeTab: T;
  tabs: T[];
  onTabChange: (tab: T) => void;
  enableOnDesktop?: boolean; // デフォルト: false
  swipeThreshold?: number;   // デフォルト: 50
  swipeVelocity?: number;    // デフォルト: 0.3
}

interface UseSwipeableTabsReturn {
  handlers: SwipeableHandlers;
  swipeDirection: 'left' | 'right' | null;
  isTransitioning: boolean;
  isMobile: boolean;
}

/**
 * タブスワイプ機能を提供するカスタムフック
 */
export function useSwipeableTabs<T extends string | number>({
  activeTab,
  tabs,
  onTabChange,
  enableOnDesktop = false,
  swipeThreshold = 50,
  swipeVelocity = 0.3
}: UseSwipeableTabsOptions<T>): UseSwipeableTabsReturn {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // モバイルデバイス判定
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024; // lg breakpoint
  }, []);

  // 左スワイプ: 次のタブへ
  const handleSwipeLeft = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setSwipeDirection('left');
      setIsTransitioning(true);

      // アニメーション完了後にタブ切り替え
      setTimeout(() => {
        onTabChange(tabs[currentIndex + 1]);
        setIsTransitioning(false);
        setSwipeDirection(null);
      }, 300);
    }
  }, [activeTab, tabs, onTabChange]);

  // 右スワイプ: 前のタブへ
  const handleSwipeRight = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setSwipeDirection('right');
      setIsTransitioning(true);

      // アニメーション完了後にタブ切り替え
      setTimeout(() => {
        onTabChange(tabs[currentIndex - 1]);
        setIsTransitioning(false);
        setSwipeDirection(null);
      }, 300);
    }
  }, [activeTab, tabs, onTabChange]);

  // スワイプハンドラー設定
  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    trackMouse: enableOnDesktop, // PC版でのマウスドラッグ
    delta: swipeThreshold,        // 最小スワイプ距離
    preventScrollOnSwipe: false,  // 縦スクロールを妨げない
    swipeDuration: 500,           // スワイプ認識の最大時間
    touchEventOptions: { passive: true } // パフォーマンス最適化
  });

  // デスクトップでスワイプ無効の場合
  if (!isMobile() && !enableOnDesktop) {
    return {
      handlers: {} as SwipeableHandlers,
      swipeDirection: null,
      isTransitioning: false,
      isMobile: false
    };
  }

  return {
    handlers,
    swipeDirection,
    isTransitioning,
    isMobile: isMobile()
  };
}
```

**テスト項目**:
- [ ] モバイルデバイス判定が正しく動作するか
- [ ] 左スワイプで次のタブに移動するか
- [ ] 右スワイプで前のタブに移動するか
- [ ] 最初/最後のタブで端の挙動が正しいか
- [ ] デスクトップでスワイプが無効化されるか

---

#### Step 3: InterviewStationへの適用（4時間）

**ファイル**: `src/pages/InterviewStation.tsx`（既存ファイル修正）

**変更前の構造確認**:
```typescript
// 既存のタブ状態管理を確認
const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'booking'>('dashboard');
```

**変更内容**:
```typescript
import { useSwipeableTabs } from '../hooks/useSwipeableTabs';

const InterviewStation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'booking'>('dashboard');

  // スワイプ機能を追加
  const { handlers, swipeDirection, isTransitioning, isMobile } = useSwipeableTabs({
    activeTab,
    tabs: ['dashboard', 'history', 'booking'],
    onTabChange: setActiveTab
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* タブボタン（既存） */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={/* ... */}
          >
            ダッシュボード
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={/* ... */}
          >
            履歴
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={/* ... */}
          >
            予約
          </button>
        </div>

        {/* スワイプインジケーター（モバイルのみ） */}
        {isMobile && (
          <div className="flex justify-center gap-2 py-2">
            {['dashboard', 'history', 'booking'].map((tab) => (
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
        )}
      </div>

      {/* タブコンテンツ（スワイプハンドラー適用） */}
      <div {...handlers} className="relative overflow-hidden">
        <div
          className={`transition-all duration-300 ${
            isTransitioning
              ? swipeDirection === 'left'
                ? '-translate-x-4 opacity-90'
                : 'translate-x-4 opacity-90'
              : 'translate-x-0 opacity-100'
          }`}
        >
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'booking' && <BookingTab />}
        </div>
      </div>
    </div>
  );
};
```

**テスト項目**:
- [ ] 横スワイプでタブが切り替わるか
- [ ] タブボタンのクリックも引き続き動作するか
- [ ] インジケーターがアクティブタブを正しく示すか
- [ ] アニメーションがスムーズか
- [ ] 縦スクロールを妨げないか

---

#### Step 4: モバイルデバイステスト（1時間）

**テストデバイス**:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari) - タブレット確認
- Desktop (Chrome) - スワイプ無効確認

**テストシナリオ**:
1. 左スワイプでタブ切り替え
2. 右スワイプでタブ切り替え
3. 最初のタブで右スワイプ（無反応）
4. 最後のタブで左スワイプ（無反応）
5. 縦スクロールの動作確認
6. タブボタンクリックとの併用確認

---

### Phase 7-B: 他ステーション展開（3日）

#### Step 1: 共通コンポーネント作成（4時間）

**ファイル**: `src/components/common/SwipeableTabContainer.tsx`（新規作成）

**実装内容**:
```typescript
import React from 'react';
import { useSwipeableTabs } from '../../hooks/useSwipeableTabs';

interface Tab<T extends string | number> {
  id: T;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface SwipeableTabContainerProps<T extends string | number> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  enableSwipe?: boolean; // デフォルト: モバイルのみ
  showIndicator?: boolean; // デフォルト: true
}

export function SwipeableTabContainer<T extends string | number>({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  enableSwipe = true,
  showIndicator = true
}: SwipeableTabContainerProps<T>) {
  const { handlers, swipeDirection, isTransitioning, isMobile } = useSwipeableTabs({
    activeTab,
    tabs: tabs.map(t => t.id),
    onTabChange
  });

  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className={`swipeable-tab-container ${className}`}>
      {/* タブボタン */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={String(tab.id)}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* スワイプインジケーター */}
        {isMobile && showIndicator && (
          <div className="flex justify-center gap-2 py-2">
            {tabs.map((tab) => (
              <div
                key={String(tab.id)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'w-8 bg-purple-500'
                    : 'w-1.5 bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* タブコンテンツ */}
      <div {...(enableSwipe ? handlers : {})} className="relative overflow-hidden">
        <div
          className={`transition-all duration-300 ${
            isTransitioning
              ? swipeDirection === 'left'
                ? '-translate-x-4 opacity-90'
                : 'translate-x-4 opacity-90'
              : 'translate-x-0 opacity-100'
          }`}
        >
          {activeTabContent}
        </div>
      </div>
    </div>
  );
}
```

**テスト項目**:
- [ ] 汎用的に使えるか
- [ ] アイコン付きタブが正しく表示されるか
- [ ] インジケーターの表示/非表示が切り替えられるか

---

#### Step 2: 各ページへの適用（2日）

各ページごとに既存のタブ構造を`SwipeableTabContainer`に置き換え。

**対象ページ**:
1. EvaluationStation.tsx
2. HealthStation.tsx
3. CareerSelectionStationPage.tsx
4. PersonalStation.tsx
5. HomePage.tsx

**適用パターン**:
```typescript
// Before
const [activeTab, setActiveTab] = useState('tab1');

return (
  <div>
    <div className="tabs">
      <button onClick={() => setActiveTab('tab1')}>Tab 1</button>
      <button onClick={() => setActiveTab('tab2')}>Tab 2</button>
    </div>
    <div>
      {activeTab === 'tab1' && <Tab1Content />}
      {activeTab === 'tab2' && <Tab2Content />}
    </div>
  </div>
);

// After
import { SwipeableTabContainer } from '../components/common/SwipeableTabContainer';

const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');

const tabs = [
  { id: 'tab1', label: 'Tab 1', content: <Tab1Content /> },
  { id: 'tab2', label: 'Tab 2', content: <Tab2Content /> }
];

return (
  <SwipeableTabContainer
    tabs={tabs}
    activeTab={activeTab}
    onTabChange={setActiveTab}
  />
);
```

**テスト項目**:
- [ ] 全6ページでスワイプ動作確認
- [ ] 既存機能が破壊されていないか確認

---

### Phase 7-C: UX改善（2日）

#### 1. スワイプ中のプレビュー表示（1日）

**実装内容**:
- スワイプ中に次のタブが少し見える効果
- 3D変換を使った視覚効果

```typescript
// useSwipeableTabs.ts に追加
const [swipeOffset, setSwipeOffset] = useState(0);

const handlers = useSwipeable({
  onSwiping: (eventData) => {
    // スワイプ中のオフセット計算
    setSwipeOffset(eventData.deltaX);
  },
  // ... 既存の設定
});
```

**CSS追加**:
```css
.swipeable-content {
  transform: translateX(${swipeOffset}px);
  transition: transform 0.1s linear;
}
```

---

#### 2. 設定オプション実装（1日）

**ファイル**: `src/utils/swipeSettings.ts`（新規作成）

**実装内容**:
```typescript
export interface SwipeSettings {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  showIndicator: boolean;
}

const SETTINGS_KEY = 'voicedrive_swipe_settings';

const DEFAULT_SETTINGS: SwipeSettings = {
  enabled: true,
  sensitivity: 'medium',
  showIndicator: true
};

export function getSwipeSettings(): SwipeSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
  return DEFAULT_SETTINGS;
}

export function setSwipeSettings(settings: Partial<SwipeSettings>): void {
  const current = getSwipeSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

export function getSensitivityThreshold(sensitivity: string): number {
  switch (sensitivity) {
    case 'low': return 80;
    case 'medium': return 50;
    case 'high': return 30;
    default: return 50;
  }
}
```

**設定画面追加** (SettingsPage.tsx):
```typescript
// スワイプ設定セクション追加
<div className="setting-section">
  <h3>スワイプナビゲーション</h3>

  <label>
    <input
      type="checkbox"
      checked={swipeSettings.enabled}
      onChange={(e) => updateSwipeSetting('enabled', e.target.checked)}
    />
    スワイプ機能を有効化
  </label>

  <label>
    感度:
    <select
      value={swipeSettings.sensitivity}
      onChange={(e) => updateSwipeSetting('sensitivity', e.target.value)}
    >
      <option value="low">低</option>
      <option value="medium">中</option>
      <option value="high">高</option>
    </select>
  </label>

  <label>
    <input
      type="checkbox"
      checked={swipeSettings.showIndicator}
      onChange={(e) => updateSwipeSetting('showIndicator', e.target.checked)}
    />
    インジケーター表示
  </label>
</div>
```

---

## 📅 実装スケジュール

### Week 1: Phase 7-A（2日）
| 日 | タスク | 見積 |
|----|--------|------|
| Day 1 AM | ライブラリインストール + カスタムフック作成 | 0.5日 |
| Day 1 PM - Day 2 | InterviewStation適用 + モバイルテスト | 1.5日 |

### Week 2: Phase 7-B（3日）
| 日 | タスク | 見積 |
|----|--------|------|
| Day 3 | 共通コンポーネント作成 | 0.5日 |
| Day 4-5 | 各ページへの適用（5ページ） | 2.5日 |

### Week 3: Phase 7-C（2日）
| 日 | タスク | 見積 |
|----|--------|------|
| Day 6 | スワイプ中プレビュー実装 | 1日 |
| Day 7 | 設定オプション実装 | 1日 |

**合計見積もり**: 7日

---

## ✅ 完了条件

### Phase 7-A
- [ ] 面談ステーションで横スワイプ動作
- [ ] モバイルでのみ有効化
- [ ] 既存のタブボタンも引き続き使用可能
- [ ] 縦スクロールを妨げない

### Phase 7-B
- [ ] 全6ページでスワイプ対応
- [ ] 共通コンポーネント化
- [ ] コード重複の最小化

### Phase 7-C
- [ ] スワイプインジケーター表示
- [ ] スムーズなアニメーション
- [ ] 設定オプション（ON/OFF、感度）
- [ ] アクセシビリティ対応

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

**最終更新**: 2025年10月20日
**バージョン**: 2.0
**ステータス**: 未着手
