# Phase 4-B: フィルタリング & 検索機能 設計書

**作成日**: 2025年10月2日
**対象システム**: VoiceDrive
**実装フェーズ**: Phase 4-B（履歴タブのフィルタリング & 検索機能）
**前提**: Phase 4-A完了（基本強化）

---

## 📋 設計概要

### 目的

Phase 4-Aで実装した履歴タブに、ユーザーが効率的に目的の面談を見つけられるよう、フィルタリングと検索機能を追加します。

**Phase 4-Bの範囲**:
- ✅ 期間フィルタ（今月、先月、カスタム）
- ✅ ステータスフィルタ（サマリ受信済み、サマリ待ち、全て）
- ✅ 面談タイプフィルタ（定期、キャリア、メンタル等）
- ✅ キーワード検索（面談者名、サマリ内容）

---

## 🎨 UI設計

### 1. フィルタUIレイアウト

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 面談統計                                                 │
│ （Phase 4-Aで実装済み）                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 過去の面談                                   🔍 フィルタ     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🔍 フィルタ & 検索                                      │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│ │
│ │                                                          │ │
│ │ 📅 期間:     [今月 ▼]                                   │ │
│ │ 📝 ステータス: [全て ▼]                                 │ │
│ │ 💼 面談タイプ: [全て ▼]                                 │ │
│ │ 🔎 キーワード: [___________________]  [検索]            │ │
│ │                                                          │ │
│ │              [フィルタクリア]                           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ 📋 検索結果: 5件                                            │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📝 定期フォローアップ面談              ✅ サマリ受信済   │ │
│ │ ...                                                      │ │
│ └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. フィルタボタン（折りたたみ式）

**デフォルト状態（閉じている）**:
```
過去の面談                    🔍 フィルタ (5件の絞り込み中)
```

**展開状態（開いている）**:
```
過去の面談                    🔍 フィルタを閉じる
┌────────────────────────────────────────────────────────┐
│ 🔍 フィルタ & 検索                                      │
│ ...                                                      │
└────────────────────────────────────────────────────────┘
```

---

## 🔧 技術実装

### 1. 型定義追加

```typescript
// src/types/interview.ts に追加

export interface InterviewFilters {
  period: 'all' | 'this_month' | 'last_month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  status: 'all' | 'summary_received' | 'summary_waiting';
  interviewType: 'all' | string; // 'all' or specific type
  keyword: string;
}

export interface InterviewSearchResult {
  bookings: EnhancedBooking[];
  totalCount: number;
  filteredCount: number;
  activeFilters: string[]; // 'period: 今月', 'status: サマリ受信済み' など
}
```

### 2. フィルタロジック実装

```typescript
// src/pages/InterviewStation.tsx

const HistoryView = () => {
  // Phase 4-B: フィルタ関連のstate
  const [filters, setFilters] = useState<InterviewFilters>({
    period: 'all',
    status: 'all',
    interviewType: 'all',
    keyword: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Phase 4-A: 既存のenhancedBookings
  const enhancedBookings: EnhancedBooking[] = pastBookings.map(/* ... */);

  // Phase 4-B: フィルタリング処理
  const filteredBookings = useMemo(() => {
    let result = [...enhancedBookings];

    // 1. 期間フィルタ
    if (filters.period !== 'all') {
      result = applyPeriodFilter(result, filters);
    }

    // 2. ステータスフィルタ
    if (filters.status !== 'all') {
      result = result.filter(b => {
        if (filters.status === 'summary_received') {
          return b.hasSummary;
        } else if (filters.status === 'summary_waiting') {
          return !b.hasSummary && b.status === 'completed';
        }
        return true;
      });
    }

    // 3. 面談タイプフィルタ
    if (filters.interviewType !== 'all') {
      result = result.filter(b => b.interviewType === filters.interviewType);
    }

    // 4. キーワード検索
    if (filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(b =>
        b.interviewerName?.toLowerCase().includes(keyword) ||
        b.summaryData?.summary.toLowerCase().includes(keyword) ||
        b.summaryData?.keyPoints.some(kp => kp.toLowerCase().includes(keyword))
      );
    }

    return result;
  }, [enhancedBookings, filters]);

  // アクティブなフィルタのラベル生成
  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.period !== 'all') {
      labels.push(`期間: ${getPeriodLabel(filters.period)}`);
    }
    if (filters.status !== 'all') {
      labels.push(`ステータス: ${getStatusLabel(filters.status)}`);
    }
    if (filters.interviewType !== 'all') {
      labels.push(`タイプ: ${filters.interviewType}`);
    }
    if (filters.keyword.trim()) {
      labels.push(`キーワード: "${filters.keyword}"`);
    }
    return labels;
  }, [filters]);

  // ...
};
```

### 3. 期間フィルタロジック

```typescript
const applyPeriodFilter = (
  bookings: EnhancedBooking[],
  filters: InterviewFilters
): EnhancedBooking[] => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return bookings.filter(b => {
    const bookingDate = new Date(b.bookingDate);

    switch (filters.period) {
      case 'this_month':
        return bookingDate >= thisMonthStart;
      case 'last_month':
        return bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd;
      case 'custom':
        if (filters.customStartDate && filters.customEndDate) {
          const start = new Date(filters.customStartDate);
          const end = new Date(filters.customEndDate);
          return bookingDate >= start && bookingDate <= end;
        }
        return true;
      default:
        return true;
    }
  });
};
```

### 4. フィルタUIコンポーネント

```typescript
const FilterPanel = () => (
  <div className="bg-slate-700 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-white font-semibold">🔍 フィルタ & 検索</h4>
      {activeFilterLabels.length > 0 && (
        <button
          onClick={() => setFilters({
            period: 'all',
            status: 'all',
            interviewType: 'all',
            keyword: ''
          })}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          フィルタクリア
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 期間フィルタ */}
      <div>
        <label className="text-sm text-gray-300 mb-1 block">📅 期間</label>
        <select
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
          className="w-full bg-slate-600 text-white rounded px-3 py-2"
        >
          <option value="all">全期間</option>
          <option value="this_month">今月</option>
          <option value="last_month">先月</option>
          <option value="custom">カスタム</option>
        </select>
      </div>

      {/* ステータスフィルタ */}
      <div>
        <label className="text-sm text-gray-300 mb-1 block">📝 ステータス</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          className="w-full bg-slate-600 text-white rounded px-3 py-2"
        >
          <option value="all">全て</option>
          <option value="summary_received">サマリ受信済み</option>
          <option value="summary_waiting">サマリ待ち</option>
        </select>
      </div>

      {/* 面談タイプフィルタ */}
      <div>
        <label className="text-sm text-gray-300 mb-1 block">💼 面談タイプ</label>
        <select
          value={filters.interviewType}
          onChange={(e) => setFilters({ ...filters, interviewType: e.target.value })}
          className="w-full bg-slate-600 text-white rounded px-3 py-2"
        >
          <option value="all">全て</option>
          {getUniqueInterviewTypes(enhancedBookings).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* キーワード検索 */}
      <div>
        <label className="text-sm text-gray-300 mb-1 block">🔎 キーワード</label>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          placeholder="面談者名、内容等"
          className="w-full bg-slate-600 text-white rounded px-3 py-2"
        />
      </div>
    </div>

    {/* カスタム期間選択（period='custom'の時のみ表示） */}
    {filters.period === 'custom' && (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-gray-300 mb-1 block">開始日</label>
          <input
            type="date"
            value={filters.customStartDate || ''}
            onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })}
            className="w-full bg-slate-600 text-white rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-1 block">終了日</label>
          <input
            type="date"
            value={filters.customEndDate || ''}
            onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })}
            className="w-full bg-slate-600 text-white rounded px-3 py-2"
          />
        </div>
      </div>
    )}
  </div>
);
```

### 5. アクティブフィルタ表示

```typescript
const ActiveFiltersDisplay = () => {
  if (activeFilterLabels.length === 0) return null;

  return (
    <div className="bg-slate-700 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-300">🏷️ 絞り込み中:</span>
        {activeFilterLabels.map((label, idx) => (
          <span
            key={idx}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
          >
            {label}
          </span>
        ))}
        <button
          onClick={() => setFilters({
            period: 'all',
            status: 'all',
            interviewType: 'all',
            keyword: ''
          })}
          className="text-sm text-red-400 hover:text-red-300 ml-2"
        >
          ✕ クリア
        </button>
      </div>
    </div>
  );
};
```

### 6. 検索結果カウント表示

```typescript
const SearchResultCount = () => (
  <div className="text-gray-300 text-sm mb-4">
    📋 検索結果: {filteredBookings.length}件
    {filteredBookings.length < enhancedBookings.length && (
      <span className="text-gray-400 ml-2">
        （全{enhancedBookings.length}件中）
      </span>
    )}
  </div>
);
```

---

## 📊 ヘルパー関数

### 1. ユニーク面談タイプ取得

```typescript
const getUniqueInterviewTypes = (bookings: EnhancedBooking[]): string[] => {
  const types = new Set(bookings.map(b => b.interviewType));
  return Array.from(types).sort();
};
```

### 2. ラベル生成

```typescript
const getPeriodLabel = (period: string): string => {
  switch (period) {
    case 'this_month': return '今月';
    case 'last_month': return '先月';
    case 'custom': return 'カスタム';
    default: return '全期間';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'summary_received': return 'サマリ受信済み';
    case 'summary_waiting': return 'サマリ待ち';
    default: return '全て';
  }
};
```

---

## 🎯 UX改善ポイント

### 1. リアルタイムフィルタリング

- フィルタ変更時に即座に結果を更新
- `useMemo`で最適化

### 2. フィルタ状態の保存（オプション）

```typescript
// localStorageにフィルタ状態を保存
useEffect(() => {
  localStorage.setItem('interview_history_filters', JSON.stringify(filters));
}, [filters]);

// 初期化時に復元
useEffect(() => {
  const saved = localStorage.getItem('interview_history_filters');
  if (saved) {
    setFilters(JSON.parse(saved));
  }
}, []);
```

### 3. レスポンシブデザイン

- モバイル: 縦1列表示
- タブレット: 2列表示
- デスクトップ: 4列表示

### 4. 空状態の表示

```typescript
{filteredBookings.length === 0 && (
  <div className="text-center py-8">
    <p className="text-gray-400 mb-2">該当する面談が見つかりませんでした</p>
    <button
      onClick={() => setFilters({
        period: 'all',
        status: 'all',
        interviewType: 'all',
        keyword: ''
      })}
      className="text-blue-400 hover:text-blue-300"
    >
      フィルタをクリア
    </button>
  </div>
)}
```

---

## 🧪 テスト計画

### テストケース

1. **期間フィルタ**
   - [ ] 今月の面談のみ表示
   - [ ] 先月の面談のみ表示
   - [ ] カスタム期間で絞り込み

2. **ステータスフィルタ**
   - [ ] サマリ受信済みのみ表示
   - [ ] サマリ待ちのみ表示

3. **面談タイプフィルタ**
   - [ ] 特定タイプのみ表示
   - [ ] 全タイプ表示

4. **キーワード検索**
   - [ ] 面談者名で検索
   - [ ] サマリ内容で検索
   - [ ] keyPointsで検索

5. **複合フィルタ**
   - [ ] 複数フィルタ組み合わせ
   - [ ] フィルタクリア動作

6. **UX**
   - [ ] フィルタ開閉動作
   - [ ] アクティブフィルタ表示
   - [ ] 検索結果カウント表示
   - [ ] 空状態表示

---

## 📅 実装スケジュール

### Step 1: 型定義 & State管理（15分）
- InterviewFilters型追加
- useState, useMemo実装

### Step 2: フィルタロジック実装（30分）
- 期間フィルタ
- ステータスフィルタ
- 面談タイプフィルタ
- キーワード検索

### Step 3: UI実装（30分）
- FilterPanel コンポーネント
- ActiveFiltersDisplay
- SearchResultCount
- 折りたたみ機能

### Step 4: テスト & 調整（15分）
- 動作確認
- UX調整

**合計**: 約1.5時間

---

## 🚀 Phase 4-C への展望

Phase 4-Bの完了後、以下の機能を検討できます：

### 統計 & 分析機能
- 月別面談回数グラフ
- サマリ閲覧率の可視化
- アクションアイテム完了率
- キャリア開発進捗

### エクスポート機能
- PDF出力
- Excel出力
- 印刷最適化

---

**作成者**: VoiceDriveチーム（Claude Code）
**作成日時**: 2025年10月2日
**ファイル**: `mcp-shared/docs/VoiceDrive_Phase4B_Filtering_Search_Design_20251002.md`

---

*この設計書はPhase 4-B実装のガイドラインです。*
