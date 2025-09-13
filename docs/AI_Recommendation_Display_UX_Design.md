# AI推薦表示 UI/UXデザイン仕様書

**作成日**: 2025年09月13日
**対象**: Pattern D AI最適化機能のUI/UX設計

---

## 🎨 全体デザインコンセプト

### デザイン原則
1. **信頼性**: AI推薦の根拠を明確に表示
2. **比較しやすさ**: 複数候補を並べて比較可能
3. **決定支援**: 職員が自信を持って選択できる情報提供
4. **直感性**: 医療職員にとって分かりやすいUI

### カラーパレット（VoiceDriveテーマ継続）
```css
:root {
  /* プライマリー */
  --ai-primary: #2563eb;        /* 信頼性を表すブルー */
  --ai-primary-light: #dbeafe;  /* 背景用薄いブルー */

  /* 信頼度表示 */
  --confidence-high: #059669;   /* 90%以上：緑 */
  --confidence-medium: #d97706; /* 70-89%：オレンジ */
  --confidence-low: #dc2626;    /* 70%未満：赤 */

  /* 既存VoiceDriveカラー */
  --voicedrive-primary: #3b82f6;
  --voicedrive-secondary: #64748b;
  --voicedrive-success: #10b981;
  --voicedrive-warning: #f59e0b;
}
```

---

## 📱 画面構成・フロー

### 1. AI処理待機画面（AIProcessingLoader）

```tsx
// 画面レイアウト
┌─────────────────────────────────────┐
│  🤖 AI最適化処理中...                │
│                                   │
│  ████████████░░░░░░ 65%           │
│  Step 3/4: スケジュールを最適化中... │
│                                   │
│  ⏱️ 推定残り時間: 約2秒              │
│                                   │
│  [⏸️ 処理をキャンセル]                │
│  [📝 通常予約に切り替え]              │
└─────────────────────────────────────┘
```

#### UI詳細
- **プログレスバー**: 段階的進行表示（4段階）
- **現在ステップ表示**: 処理内容の可視化
- **推定時間**: リアルタイム更新
- **キャンセルオプション**: 待機が長い場合の代替手段

### 2. 推薦結果一覧画面（RecommendationSelector）

```tsx
// メインレイアウト
┌─────────────────────────────────────┐
│ 🎯 AI推薦結果 (処理時間: 4.2秒)       │
│                                   │
│ 📊 3つの候補から最適な2つを選出        │
│                                   │
│ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │候補 A │ │候補 B │ │比較表 │      │
│ │⭐92% │ │⭐87% │ │📊    │      │
│ └───────┘ └───────┘ └───────┘      │
│                                   │
│ [✅ 候補Aを選択] [🔄 条件を変更]        │
└─────────────────────────────────────┘
```

#### レスポンシブデザイン
- **デスクトップ**: 3列並び（推薦2つ + 比較表）
- **タブレット**: 2列並び（推薦カード中心）
- **モバイル**: 1列縦並び（スワイプ対応）

---

## 🃏 推薦カードデザイン

### カード構造

```tsx
// 推薦カード詳細レイアウト
┌─────────────────────────────────────┐
│ 🏆 推薦候補A     信頼度 ⭐92%         │
├─────────────────────────────────────┤
│ 👤 田中美香子 師長                    │
│ 🏥 キャリア支援室 (看護師15年)         │
│ 🎯 専門: キャリア開発・資格取得支援     │
│                                   │
│ 📅 2025年9月20日 (木)               │
│ 🕐 14:30-15:15 (45分)              │
│ 📍 相談室A (3F)                     │
│                                   │
│ 🤖 AI推薦理由:                      │
│ ✓ 内科病棟出身で業務環境を理解        │
│ ✓ キャリア相談専門家 (5年経験)        │
│ ✓ 希望時間帯に完全一致               │
│ ✓ 同様ケース95%満足度               │
│                                   │
│ [📋 詳細を見る] [⚡ この候補を選択]   │
└─────────────────────────────────────┘
```

### 信頼度バッジ

```css
/* 信頼度バッジのスタイル */
.confidence-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.confidence-high {
  background-color: var(--confidence-high);
  color: white;
}

.confidence-medium {
  background-color: var(--confidence-medium);
  color: white;
}

.confidence-low {
  background-color: var(--confidence-low);
  color: white;
}
```

### カードアニメーション

```css
.recommendation-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.recommendation-card.selected {
  border: 2px solid var(--ai-primary);
  background: var(--ai-primary-light);
}
```

---

## 📊 比較表示機能

### 横並び比較

```tsx
// 比較表レイアウト
┌─────────────────────────────────────┐
│ 📊 候補比較                          │
├─────────────────────────────────────┤
│          │ 候補A    │ 候補B          │
├─────────────────────────────────────┤
│ 信頼度    │ ⭐92%   │ ⭐87%          │
│ 日時     │ 9/20 14:30│ 9/21 16:00   │
│ 時間     │ 45分     │ 30分          │
│ 専門性    │ ⭐⭐⭐   │ ⭐⭐⭐         │
│ 相性     │ ⭐⭐⭐⭐  │ ⭐⭐⭐         │
│ アクセス   │ 3F相談室 │ 2F面談室      │
├─────────────────────────────────────┤
│ [候補A選択] │ [候補B選択]             │
└─────────────────────────────────────┘
```

### フィルタリング機能

```tsx
// フィルタオプション
┌─────────────────────────────────────┐
│ 🔍 候補絞り込み                      │
│                                   │
│ 📅 日時: [今週 ▼] [午後 ▼]           │
│ 👤 担当者: [キャリア専門 ▼]          │
│ ⏰ 時間: [30分以上 ▼]               │
│ 📍 場所: [3F以上 ▼]                 │
│                                   │
│ [🗑️ フィルタクリア] [🔄 再検索]       │
└─────────────────────────────────────┘
```

---

## 💡 AI推薦理由の表示

### 階層構造での情報表示

```tsx
// AI推薦理由セクション
┌─────────────────────────────────────┐
│ 🤖 なぜこの候補がおすすめ？            │
│                                   │
│ 📈 マッチング要因 (詳細表示可能):      │
│                                   │
│ ▼ 専門性の適合 (重要度: 高)           │
│   ✓ キャリア相談の専門資格保有         │
│   ✓ 内科病棟での実務経験あり          │
│   ✓ 同年代職員の相談実績豊富          │
│                                   │
│ ▼ スケジュールの最適性 (重要度: 中)     │
│   ✓ 希望時間帯に完全一致             │
│   ✓ 十分な面談時間を確保可能          │
│   ✓ アクセスしやすい場所             │
│                                   │
│ ▼ 過去の成功実績 (重要度: 高)         │
│   ✓ 類似ケースで95%の満足度          │
│   ✓ キャリアプラン策定率85%           │
│   ✓ フォローアップ実施率90%           │
│                                   │
│ 🔮 代替案:                         │
│ • 9/21(金) 15:00でも対応可能        │
│ • 30分版での実施も選択可能           │
│                                   │
│ [❓ AI判断について質問]               │
└─────────────────────────────────────┘
```

### プログレッシブ開示

```tsx
// 初期表示（要約版）
🤖 推薦理由: 専門性が高く、希望時間に対応可能
[📖 詳しく見る ▼]

// 展開後（詳細版）
🤖 詳細な推薦理由:
▼ 専門性マッチング (92点)
  ✓ キャリア相談専門 (5年経験)
  ✓ 内科病棟出身で環境理解
  ✓ 資格取得支援の実績多数

▼ スケジュール最適化 (88点)
  ✓ 希望日時に完全一致
  ✓ 45分枠で十分な時間確保
  ✓ アクセスの良い相談室

[📚 さらに詳しく ▼] [🔼 要約に戻る]
```

---

## 🔧 インタラクティブ要素

### 1. 候補選択のマイクロインタラクション

```css
/* 選択時のアニメーション */
@keyframes selectCard {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 20px 25px rgba(37, 99, 235, 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 20px 25px rgba(37, 99, 235, 0.2);
    border-color: var(--ai-primary);
  }
}

.recommendation-card.selecting {
  animation: selectCard 0.6s ease-out;
}
```

### 2. 詳細表示モーダル

```tsx
// モーダルレイアウト
┌─────────────────────────────────────┐
│ ❌                     田中美香子 詳細 │
├─────────────────────────────────────┤
│ 👤 プロフィール                      │
│ • 看護師長 (15年経験)                │
│ • キャリア支援室 配属 5年             │
│ • 専門資格: キャリアコンサルタント    │
│                                   │
│ 📊 実績・評価                        │
│ • 面談実施数: 234件 (過去2年)        │
│ • 平均満足度: 4.7/5.0               │
│ • キャリアプラン策定率: 85%           │
│                                   │
│ 🎯 専門分野                          │
│ • キャリア開発・転職相談             │
│ • 資格取得支援                      │
│ • メンタルヘルスケア                │
│                                   │
│ 💬 過去の相談者コメント               │
│ "具体的なアドバイスで目標が明確に"    │
│ "親身になって相談に乗ってくれた"      │
│                                   │
│ [📅 この担当者で予約] [❌ 閉じる]      │
└─────────────────────────────────────┘
```

---

## ⚡ パフォーマンス最適化

### 1. 遅延読み込み

```tsx
// 推薦カードの段階的読み込み
const RecommendationCard = React.lazy(() =>
  import('./RecommendationCard')
);

// プロフィール写真の遅延読み込み
const InterviewerPhoto = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="interviewer-photo">
      {!loaded && <div className="photo-skeleton" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </div>
  );
};
```

### 2. スケルトン表示

```css
/* スケルトンアニメーション */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.card-skeleton {
  height: 300px;
  border-radius: 8px;
}

.avatar-skeleton {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
```

---

## 📱 レスポンシブデザイン

### ブレークポイント

```css
/* デスクトップファースト */
.recommendation-container {
  display: grid;
  grid-template-columns: 1fr 1fr 300px; /* 推薦2つ + 比較表 */
  gap: 1.5rem;
}

/* タブレット */
@media (max-width: 1024px) {
  .recommendation-container {
    grid-template-columns: 1fr 1fr; /* 推薦カード2列 */
  }

  .comparison-table {
    grid-column: 1 / -1; /* 全幅表示 */
  }
}

/* モバイル */
@media (max-width: 768px) {
  .recommendation-container {
    grid-template-columns: 1fr; /* 1列縦並び */
  }

  .recommendation-card {
    margin-bottom: 1rem;
  }
}
```

### タッチ操作対応

```css
/* タッチデバイス用のボタンサイズ */
@media (hover: none) {
  .recommendation-card .action-button {
    min-height: 44px; /* タッチターゲット最小サイズ */
    font-size: 1rem;
  }

  .confidence-badge {
    padding: 8px 16px; /* より大きなタッチエリア */
  }
}
```

---

## ♿ アクセシビリティ対応

### 1. キーボードナビゲーション

```tsx
// キーボード操作対応
const RecommendationSelector = () => {
  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div
      className="recommendation-card"
      tabIndex={0}
      role="button"
      aria-label={`推薦候補: ${interviewer.name}, 信頼度${confidence}%`}
      onKeyDown={(e) => handleKeyDown(e, () => selectRecommendation(id))}
    >
      {/* カード内容 */}
    </div>
  );
};
```

### 2. スクリーンリーダー対応

```tsx
// ARIA属性とセマンティクス
<section aria-label="AI推薦結果一覧">
  <h2 id="recommendations-title">おすすめの面談候補</h2>

  <div role="list" aria-labelledby="recommendations-title">
    {recommendations.map((rec, index) => (
      <article
        key={rec.id}
        role="listitem"
        aria-label={`推薦候補${index + 1}: ${rec.interviewer.name}`}
      >
        <header>
          <h3>{rec.interviewer.name}</h3>
          <span
            aria-label={`信頼度${rec.confidence}パーセント`}
            className="confidence-badge"
          >
            {rec.confidence}%
          </span>
        </header>

        <dl>
          <dt>スケジュール</dt>
          <dd>{rec.schedule.date} {rec.schedule.time}</dd>

          <dt>推薦理由</dt>
          <dd>{rec.aiReasoning.summary}</dd>
        </dl>
      </article>
    ))}
  </div>
</section>
```

---

## 🎯 実装チェックリスト

### コンポーネント開発
- [ ] AIProcessingLoader コンポーネント
- [ ] RecommendationSelector メインコンテナ
- [ ] RecommendationCard 推薦カード
- [ ] ComparisonTable 比較表
- [ ] InterviewerProfileModal 詳細モーダル
- [ ] ConfidenceBadge 信頼度バッジ
- [ ] AIReasoningDisplay 推薦理由表示

### スタイリング
- [ ] CSS-in-JS スタイル定義
- [ ] レスポンシブグリッドレイアウト
- [ ] カードホバー・選択エフェクト
- [ ] プログレスバーアニメーション
- [ ] スケルトンローディング
- [ ] ダークモード対応

### インタラクション
- [ ] カード選択・比較機能
- [ ] フィルタリング機能
- [ ] 詳細表示モーダル
- [ ] キーボードナビゲーション
- [ ] タッチジェスチャー対応

### アクセシビリティ
- [ ] ARIA属性設定
- [ ] セマンティクHTML
- [ ] キーボード操作対応
- [ ] スクリーンリーダーテスト
- [ ] コントラスト比チェック

### パフォーマンス
- [ ] 遅延読み込み実装
- [ ] 画像最適化
- [ ] バンドルサイズ最適化
- [ ] レンダリング最適化

---

**作成者**: VoiceDrive開発チーム
**最終更新**: 2025年09月13日