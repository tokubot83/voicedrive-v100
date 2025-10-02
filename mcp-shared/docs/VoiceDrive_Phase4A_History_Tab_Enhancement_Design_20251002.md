# Phase 4-A: 履歴タブページ基本強化 設計書

**作成日**: 2025年10月2日
**対象システム**: VoiceDrive
**実装フェーズ**: Phase 4-A（履歴タブの基本強化）
**目的**: 面談履歴に特化した多機能ページへの第一歩

---

## 📋 設計概要

### 実装方針

既存の`InterviewStation.tsx`の`HistoryView`コンポーネントを段階的に強化し、面談履歴とサマリを統合表示する多機能ページを実現します。

**Phase 4-A の範囲**（基本強化）:
- ✅ 面談サマリAPI統合
- ✅ カード型UI改善
- ✅ サマリボタン統合
- ✅ サマリ有無の視覚的表示

**Phase 4-B以降**（今後の拡張）:
- フィルタリング機能（期間、ステータス、面談タイプ）
- 検索機能
- 統計・分析機能

---

## 🎨 UI設計

### 1. カード型レイアウト

**現在の問題点**:
- シンプルすぎる表示（面談タイプ、日付、面談者のみ）
- サマリボタンなし
- 視覚的な情報不足

**Phase 4-A での改善**:

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 面談統計                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ • 今年の面談回数: 12回                                       │
│ • サマリ受信済み: 8件                                        │
│ • 予約中: 2件                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 過去の面談                                   🔍 フィルタ     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📝 定期フォローアップ面談              ✅ サマリ受信済   │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│ │
│ │ 📅 2025年9月28日 10:00                                  │ │
│ │ 👤 面談者: 山田 人事部長                                │ │
│ │ ⏱️ 所要時間: 45分                                       │ │
│ │                                                          │ │
│ │ 📌 主なポイント:                                        │ │
│ │ • 業務負荷が高い状況が継続中                            │ │
│ │ • スキルアップ研修希望あり                              │ │
│ │                                                          │ │
│ │        [📝 サマリを見る]           [📄 面談詳細]        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🎯 キャリア開発面談                    ⏳ サマリ待ち    │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│ │
│ │ 📅 2025年9月15日 14:00                                  │ │
│ │ 👤 面談者: 佐藤 キャリアアドバイザー                    │ │
│ │ ⏱️ 所要時間: 60分                                       │ │
│ │                                                          │ │
│ │                              [📄 面談詳細]              │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. サマリステータス表示

**視覚的インジケーター**:

| ステータス | 表示 | 説明 |
|-----------|------|------|
| **サマリ受信済み** | ✅ サマリ受信済 + 緑色バッジ | InterviewResultあり、未読/既読 |
| **サマリ待ち** | ⏳ サマリ待ち + 黄色バッジ | 面談完了、InterviewResultなし |
| **面談予定** | 📅 予定 + 青色バッジ | 予約済み、未実施 |
| **キャンセル** | ❌ キャンセル + 灰色 | キャンセル済み |

### 3. カード内情報構成

**Phase 4-A で表示する情報**:

```typescript
interface EnhancedInterviewCard {
  // 基本情報
  interviewType: string;           // 面談タイプ
  date: string;                    // 日時
  interviewer: string;             // 面談者名
  duration?: number;               // 所要時間（分）

  // ステータス
  status: 'completed' | 'scheduled' | 'cancelled';
  hasSummary: boolean;             // サマリ有無
  summaryStatus?: 'received' | 'waiting';

  // サマリプレビュー（受信済みの場合）
  summaryPreview?: {
    keyPoints: string[];           // 主なポイント（最大2件）
    isRead: boolean;               // 既読/未読
  };

  // アクション
  actions: {
    viewSummary?: () => void;      // サマリを見る
    viewDetails: () => void;        // 面談詳細
  };
}
```

---

## 🔧 技術実装

### 1. APIエンドポイント統合

**使用するAPI**:

```typescript
// 既存API（Phase 1で実装済み）
GET /api/my/interview-results        // サマリ一覧取得
GET /api/my/interview-results/:id    // サマリ詳細取得
POST /api/my/interview-results/:id/read  // 既読マーク
```

**データ統合ロジック**:

```typescript
// 1. 面談一覧を取得
const interviews = await fetchInterviews();

// 2. サマリ一覧を取得
const summaries = await fetch('/api/my/interview-results', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 3. 面談とサマリをマージ
const enhancedInterviews = interviews.map(interview => ({
  ...interview,
  hasSummary: summaries.data.some(s => s.interviewId === interview.id),
  summaryData: summaries.data.find(s => s.interviewId === interview.id),
  summaryStatus: getSummaryStatus(interview, summaries.data)
}));
```

### 2. コンポーネント構造

**Phase 4-A のコンポーネント設計**:

```
InterviewStation.tsx
└── HistoryView
    ├── StatisticsSection (統計表示)
    │   ├── 今年の面談回数
    │   ├── サマリ受信済み件数
    │   └── 予約中件数
    │
    ├── InterviewCardList (面談カード一覧)
    │   └── InterviewCard (各面談カード)
    │       ├── InterviewHeader (ヘッダー: タイプ + ステータス)
    │       ├── InterviewInfo (面談情報: 日時、面談者、所要時間)
    │       ├── SummaryPreview (サマリプレビュー: keyPoints)
    │       └── ActionButtons (アクションボタン)
    │           ├── "📝 サマリを見る" (hasSummary === true)
    │           └── "📄 面談詳細"
    │
    └── InterviewResultModal (サマリモーダル - Phase 1実装済み)
```

### 3. 実装ファイル

**修正対象**:

#### `src/pages/InterviewStation.tsx` (Line 643-749)

**Before** (現在の実装):
```typescript
const HistoryView = () => (
  <div className="space-y-6">
    {/* 統計セクション */}
    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-4">📊 面談統計</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>今年の面談回数:</span>
          <span className="font-bold">{pastBookings.filter(b => b.status === 'completed').length}回</span>
        </div>
        {/* 他の統計 */}
      </div>
    </div>

    {/* 面談履歴 - 基本表示のみ */}
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6">過去の面談</h3>
      {pastBookings.map(booking => (
        <div key={booking.id} className="bg-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-white font-semibold">{booking.interviewType}</h4>
              <p>📅 {formatDate(booking.bookingDate)}</p>
              <p>👤 {booking.interviewerName || '記録なし'}</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300">詳細</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

**After** (Phase 4-A 実装):
```typescript
const HistoryView = () => {
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Phase 4-A: サマリデータ取得
  useEffect(() => {
    fetchInterviewResults();
  }, []);

  const fetchInterviewResults = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/my/interview-results', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInterviewResults(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch interview results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Phase 4-A: 面談にサマリ情報を統合
  const enhancedBookings = pastBookings.map(booking => {
    const summary = interviewResults.find(r => r.interviewId === booking.id);
    return {
      ...booking,
      hasSummary: !!summary,
      summaryData: summary,
      summaryStatus: booking.status === 'completed'
        ? (summary ? 'received' : 'waiting')
        : null
    };
  });

  // Phase 4-A: 統計計算
  const stats = {
    totalInterviews: pastBookings.filter(b => b.status === 'completed').length,
    summariesReceived: interviewResults.length,
    scheduledBookings: pastBookings.filter(b => b.status === 'scheduled').length
  };

  return (
    <div className="space-y-6">
      {/* 統計セクション - 強化版 */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">📊 面談統計</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm opacity-90">今年の面談回数</div>
            <div className="text-2xl font-bold">{stats.totalInterviews}回</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm opacity-90">サマリ受信済み</div>
            <div className="text-2xl font-bold">{stats.summariesReceived}件</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm opacity-90">予約中</div>
            <div className="text-2xl font-bold">{stats.scheduledBookings}件</div>
          </div>
        </div>
      </div>

      {/* 面談履歴 - カード型強化版 */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">過去の面談</h3>
          {/* Phase 4-B でフィルタ追加予定 */}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">読み込み中...</p>
          </div>
        ) : enhancedBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">面談履歴はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enhancedBookings.map(booking => (
              <div key={booking.id} className="bg-slate-700 rounded-lg p-5 hover:bg-slate-600 transition-colors">
                {/* ヘッダー: タイトル + ステータス */}
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                    {getInterviewIcon(booking.interviewType)}
                    {booking.interviewType}
                  </h4>
                  {getSummaryStatusBadge(booking.summaryStatus)}
                </div>

                {/* 面談情報 */}
                <div className="space-y-2 mb-4">
                  <div className="text-gray-300 flex items-center gap-2">
                    <span>📅</span>
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="text-gray-300 flex items-center gap-2">
                    <span>👤</span>
                    <span>{booking.interviewerName || '記録なし'}</span>
                  </div>
                  {booking.duration && (
                    <div className="text-gray-300 flex items-center gap-2">
                      <span>⏱️</span>
                      <span>所要時間: {booking.duration}分</span>
                    </div>
                  )}
                </div>

                {/* サマリプレビュー（受信済みの場合） */}
                {booking.hasSummary && booking.summaryData && (
                  <div className="bg-slate-600 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-300 mb-2">📌 主なポイント:</div>
                    <ul className="space-y-1">
                      {booking.summaryData.keyPoints.slice(0, 2).map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-200">
                          • {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-3">
                  {booking.hasSummary && (
                    <button
                      onClick={() => {
                        setSelectedInterviewId(booking.id);
                        setSummaryModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      <span>📝</span>
                      <span>サマリを見る</span>
                      {!booking.summaryData?.isRead && (
                        <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">未読</span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {/* 面談詳細表示 */}}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-400 text-white rounded-lg transition-colors"
                  >
                    <span>📄</span>
                    <span>面談詳細</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* サマリモーダル - Phase 1実装済みコンポーネント再利用 */}
      {selectedInterviewId && (
        <InterviewResultModal
          isOpen={summaryModalOpen}
          onClose={() => {
            setSummaryModalOpen(false);
            setSelectedInterviewId(null);
            // モーダル閉じたら再取得（既読状態更新のため）
            fetchInterviewResults();
          }}
          interviewId={selectedInterviewId}
        />
      )}
    </div>
  );
};

// ヘルパー関数
const getInterviewIcon = (type: string): string => {
  if (type.includes('定期')) return '📝';
  if (type.includes('キャリア')) return '🎯';
  if (type.includes('メンタル')) return '💚';
  return '💼';
};

const getSummaryStatusBadge = (status: string | null) => {
  if (status === 'received') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
        <span>✅</span>
        <span>サマリ受信済</span>
      </span>
    );
  }
  if (status === 'waiting') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white text-sm rounded-full">
        <span>⏳</span>
        <span>サマリ待ち</span>
      </span>
    );
  }
  return null;
};
```

---

## 📊 データフロー

### Phase 4-A のデータフロー

```
┌─────────────────────────────────────────────────────────┐
│                    HistoryView                          │
│                                                         │
│  1. コンポーネントマウント時                             │
│     ↓                                                   │
│  2. fetchInterviewResults()                             │
│     GET /api/my/interview-results                       │
│     → InterviewResult[] を取得                          │
│     ↓                                                   │
│  3. enhancedBookings 生成                               │
│     pastBookings + interviewResults をマージ            │
│     ↓                                                   │
│  4. カード表示                                          │
│     - hasSummary: サマリ有無判定                        │
│     - summaryStatus: 'received' | 'waiting'            │
│     - summaryData: keyPoints プレビュー表示             │
│     ↓                                                   │
│  5. ユーザーアクション                                   │
│     [📝 サマリを見る] クリック                          │
│     ↓                                                   │
│  6. InterviewResultModal 表示                           │
│     - GET /api/my/interview-results/:id                │
│     - POST /api/my/interview-results/:id/read (自動)   │
│     ↓                                                   │
│  7. モーダル閉じる                                       │
│     fetchInterviewResults() 再実行                      │
│     → 既読状態を更新                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 テスト計画

### Phase 4-A の確認項目

#### 1. API統合確認
- [ ] サマリ一覧取得成功
- [ ] 面談とサマリの正しいマッチング
- [ ] エラーハンドリング（API失敗時）

#### 2. UI表示確認
- [ ] 統計セクションの正確な表示
- [ ] カード型レイアウトの適用
- [ ] サマリステータスバッジの正しい表示
  - [ ] ✅ サマリ受信済（緑）
  - [ ] ⏳ サマリ待ち（黄）
- [ ] keyPoints プレビューの表示（最大2件）

#### 3. インタラクション確認
- [ ] "📝 サマリを見る" ボタンクリック
- [ ] InterviewResultModal 正常表示
- [ ] 自動既読マーク機能
- [ ] モーダル閉じた後の状態更新

#### 4. レスポンシブ対応確認
- [ ] デスクトップ表示
- [ ] タブレット表示
- [ ] モバイル表示

---

## 🚀 実装手順

### Step 1: 型定義追加

**ファイル**: `src/types/interview.ts` (または適切な型定義ファイル)

```typescript
export interface InterviewResult {
  id: string;
  requestId: string;
  interviewId: string;
  completedAt: string;
  duration: number;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    description: string;
    dueDate?: string;
  }>;
  followUpRequired: boolean;
  followUpDate?: string;
  feedbackToEmployee?: string;
  nextRecommendations?: {
    suggestedNextInterview?: string;
    suggestedTopics?: string[];
  };
  isRead?: boolean;
}

export interface EnhancedBooking extends Booking {
  hasSummary: boolean;
  summaryData?: InterviewResult;
  summaryStatus?: 'received' | 'waiting' | null;
}
```

### Step 2: API統合実装

**ファイル**: `src/pages/InterviewStation.tsx`

1. useState追加
2. useEffect でサマリ取得
3. enhancedBookings 生成

### Step 3: UI実装

1. 統計セクション強化
2. カード型レイアウト実装
3. サマリプレビュー表示
4. アクションボタン追加

### Step 4: モーダル統合

1. InterviewResultModal インポート
2. 選択状態管理
3. モーダル表示制御

### Step 5: テスト & 検証

1. 動作確認
2. エラーハンドリング確認
3. レスポンシブ確認

---

## 📝 実装時の注意事項

### 1. パフォーマンス

- サマリAPI呼び出しは1回のみ（useEffect で制御）
- 不要な再レンダリング防止（useMemo/useCallback 検討）

### 2. エラーハンドリング

```typescript
try {
  const response = await fetch('/api/my/interview-results', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch summaries');
  }

  const data = await response.json();
  if (data.success) {
    setInterviewResults(data.data);
  } else {
    console.error('API returned error:', data.error);
  }
} catch (error) {
  console.error('Failed to fetch interview results:', error);
  // ユーザーにエラー通知（Toast等）
}
```

### 3. セキュリティ

- トークン検証（localStorage から取得）
- API呼び出し時の Bearer Token 必須
- 他ユーザーのサマリへのアクセス防止（API側で実装済み）

### 4. UX配慮

- ローディング状態表示
- 空状態の適切なメッセージ
- エラー時のフォールバック表示
- モーダル閉じた後の状態更新（既読反映）

---

## 🎯 期待される成果

### Phase 4-A 完了時の状態

1. **面談履歴とサマリの統合表示**
   - ✅ 面談カードにサマリ情報が統合
   - ✅ サマリ有無が一目で分かる
   - ✅ keyPoints プレビューで内容を把握

2. **改善された統計表示**
   - ✅ 今年の面談回数
   - ✅ サマリ受信済み件数
   - ✅ 予約中件数

3. **スムーズなサマリ閲覧**
   - ✅ "📝 サマリを見る" ボタンから即座にモーダル表示
   - ✅ 自動既読マーク
   - ✅ 未読バッジ表示

4. **Phase 4-B への準備完了**
   - フィルタ機能追加の土台が整う
   - 検索機能追加の準備完了

---

## 📅 次フェーズへの展望

### Phase 4-B: フィルタリング & 検索

**実装予定機能**:
- 期間フィルタ（今月、先月、カスタム）
- ステータスフィルタ（サマリ受信済み、サマリ待ち）
- 面談タイプフィルタ（定期、キャリア、メンタル等）
- キーワード検索（面談者名、サマリ内容）

### Phase 4-C: 統計 & 分析（低優先度）

**実装候補機能**:
- 月別面談回数グラフ
- サマリ閲覧率の可視化
- アクションアイテム完了率
- キャリア開発進捗の可視化

---

**作成者**: VoiceDriveチーム（Claude Code）
**作成日時**: 2025年10月2日
**ファイル**: `mcp-shared/docs/VoiceDrive_Phase4A_History_Tab_Enhancement_Design_20251002.md`

---

*この設計書は Phase 4-A 実装のガイドラインです。実装中に変更が必要な場合は、この設計書を更新してください。*
