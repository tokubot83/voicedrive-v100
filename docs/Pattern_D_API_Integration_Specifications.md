# Pattern D API Integration Specifications

**作成日**: 2025年09月13日
**対象**: Pattern D（AI最適化）統合実装

---

## 🔧 API連携仕様詳細

### 1. AI最適化処理要求API

```typescript
// VoiceDrive → 医療システム
POST /api/v1/interview/ai-optimization

interface EnhancedInterviewRequest {
  // 基本情報
  requestId: string;
  staffId: string;
  requestType: 'regular' | 'special' | 'support';

  // 時期希望
  urgencyLevel: 'urgent' | 'this_week' | 'next_week' | 'this_month';
  preferredDates: string[];        // 最大3つ
  unavailableDates: string[];      // 除外日

  // 時間帯希望
  timePreference: {
    morning: boolean;      // 9:00-12:00
    afternoon: boolean;    // 13:00-17:00
    evening: boolean;      // 17:30-19:00
    anytime: boolean;      // いつでも可
  };

  // 担当者希望
  interviewerPreference: {
    specificPerson?: string;
    genderPreference?: 'male' | 'female' | 'no_preference';
    specialtyPreference?: string;
    anyAvailable: boolean;
  };

  // その他
  minDuration: number;     // 最短時間（分）
  maxDuration: number;     // 最長時間（分）
  additionalRequests?: string;

  // 相談内容
  topic: string;
  details: string;
  category: string;
}

// レスポンス（3-10秒後）
interface OptimizationResponse {
  requestId: string;
  status: 'optimized' | 'processing' | 'failed';
  processingTime: number;
  recommendations: InterviewRecommendation[];
  metadata: {
    totalCandidates: number;
    selectedTop: number;
    processingModel: string;
    dataPrivacy: string;
  };
}

interface InterviewRecommendation {
  id: string;
  confidence: number;      // 0-100
  interviewer: {
    name: string;
    title: string;
    department: string;
    experience: string;
    specialties: string[];
  };
  schedule: {
    date: string;
    time: string;
    duration: number;
    location: string;
    format: 'face_to_face' | 'online';
  };
  aiReasoning: {
    matchingFactors: string[];
    alternativeOptions: string[];
  };
}
```

### 2. 推薦候補詳細取得API

```typescript
// VoiceDrive → 医療システム
GET /api/v1/interview/recommendation/{recommendationId}

interface RecommendationDetails {
  recommendation: InterviewRecommendation;
  interviewerProfile: {
    photo?: string;
    detailedExperience: string;
    pastCases: number;
    satisfactionRate: number;
    specialAchievements: string[];
  };
  alternativeSchedules: {
    date: string;
    time: string;
    availability: 'available' | 'limited' | 'unavailable';
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
}
```

### 3. 最終確定・予約作成API

```typescript
// VoiceDrive → 医療システム
POST /api/v1/interview/confirm-ai-optimized

interface BookingConfirmation {
  recommendationId: string;
  staffConfirmation: boolean;
  adjustments?: {
    preferredTime?: string;
    notes?: string;
  };
}

// レスポンス
interface BookingResult {
  reservationId: string;
  status: 'confirmed' | 'pending' | 'failed';
  finalSchedule: {
    date: string;
    time: string;
    duration: number;
    interviewer: string;
    location: string;
  };
  confirmationCode: string;
  calendarInvite?: string;
}
```

---

## 🔐 セキュリティ・認証仕様

### JWT認証拡張

```typescript
interface AIOptimizationJWT {
  // 既存JWT項目
  sub: string;
  iat: number;
  exp: number;

  // AI最適化用追加項目
  aiOptimizationEnabled: boolean;
  processingPermissions: {
    staffDataAccess: boolean;
    aiRecommendation: boolean;
    scheduleOptimization: boolean;
  };
  rateLimits: {
    requestsPerHour: number;
    concurrentRequests: number;
  };
}
```

### タイムアウト・リトライ設定

```typescript
const apiConfig = {
  timeout: 30000,           // 30秒タイムアウト
  retryPolicy: {
    maxRetries: 2,
    backoffMs: 1000,
    retryConditions: ['network_error', 'timeout', '503', '502']
  },
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,    // 5回失敗で回路開放
    resetTimeout: 60000     // 1分後に回路リセット
  }
};
```

---

## 🎨 VoiceDrive側実装コンポーネント

### 1. 詳細希望入力画面

```typescript
// src/components/interview/EnhancedInterviewRequestForm.tsx
interface EnhancedInterviewRequestFormProps {
  onSubmit: (request: EnhancedInterviewRequest) => void;
  staffInfo: StaffInfo;
  availableDates: string[];
}

export const EnhancedInterviewRequestForm: React.FC<EnhancedInterviewRequestFormProps> = ({
  onSubmit,
  staffInfo,
  availableDates
}) => {
  // 実装内容
  // - カレンダーUIでの日付選択
  // - チェックボックスでの時間帯選択
  // - プルダウンでの担当者選択
  // - スライダーでの時間長選択
  // - バリデーション機能
};
```

### 2. AI処理待機画面

```typescript
// src/components/interview/AIProcessingLoader.tsx
interface AIProcessingLoaderProps {
  processingStatus: 'analyzing' | 'matching' | 'optimizing' | 'generating';
  estimatedTime: number;
  onCancel: () => void;
}

export const AIProcessingLoader: React.FC<AIProcessingLoaderProps> = ({
  processingStatus,
  estimatedTime,
  onCancel
}) => {
  const messages = {
    analyzing: "職員プロフィールを分析中...",
    matching: "最適な担当者をマッチング中...",
    optimizing: "スケジュールを最適化中...",
    generating: "推薦候補を生成中..."
  };

  // プログレスバー、推定時間表示、キャンセルボタン実装
};
```

### 3. 推薦結果表示画面

```typescript
// src/components/interview/RecommendationSelector.tsx
interface RecommendationSelectorProps {
  recommendations: InterviewRecommendation[];
  onSelect: (recommendationId: string) => void;
  onRequestDetails: (recommendationId: string) => void;
}

export const RecommendationSelector: React.FC<RecommendationSelectorProps> = ({
  recommendations,
  onSelect,
  onRequestDetails
}) => {
  // カード形式での推薦表示
  // 信頼度バッジ
  // AI推薦理由表示
  // 比較機能
  // 詳細表示モーダル
};
```

---

## 🔄 エラーハンドリング・フォールバック

### 1. AI処理失敗時のフォールバック

```typescript
// src/services/AIOptimizationFallbackService.ts
export class AIOptimizationFallbackService {
  async handleAIFailure(
    originalRequest: EnhancedInterviewRequest,
    errorType: 'timeout' | 'processing_error' | 'no_recommendations'
  ): Promise<FallbackResult> {

    switch (errorType) {
      case 'timeout':
        return {
          action: 'switch_to_manual',
          message: 'AI最適化に時間がかかっています。通常の予約方法に切り替えますか？',
          options: ['待機継続', '通常予約に切り替え']
        };

      case 'processing_error':
        return {
          action: 'retry_or_manual',
          message: 'AI最適化でエラーが発生しました。',
          options: ['再試行', '通常予約に切り替え']
        };

      case 'no_recommendations':
        return {
          action: 'adjust_conditions',
          message: 'ご希望に合う候補が見つかりませんでした。',
          options: ['条件を変更', '人事部に相談', '後日再予約']
        };
    }
  }
}
```

### 2. ネットワークエラー対応

```typescript
// src/utils/aiOptimizationApiClient.ts
export class AIOptimizationApiClient {
  async requestOptimization(request: EnhancedInterviewRequest): Promise<OptimizationResponse> {
    try {
      const response = await this.apiClient.post('/api/v1/interview/ai-optimization', request, {
        timeout: 30000,
        retry: {
          retries: 2,
          retryDelay: 1000
        }
      });

      return response.data;
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new AIOptimizationTimeoutError('AI処理がタイムアウトしました');
      } else if (error.response?.status >= 500) {
        throw new AIOptimizationServerError('AI処理サーバーエラー');
      } else {
        throw new AIOptimizationNetworkError('ネットワークエラー');
      }
    }
  }
}
```

---

## 📊 パフォーマンス最適化

### 1. キャッシュ戦略

```typescript
// src/services/AIOptimizationCacheService.ts
export class AIOptimizationCacheService {
  private cache = new Map<string, CacheEntry>();

  async getCachedRecommendations(requestHash: string): Promise<InterviewRecommendation[] | null> {
    const cached = this.cache.get(requestHash);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    return null;
  }

  setCachedRecommendations(requestHash: string, recommendations: InterviewRecommendation[]): void {
    this.cache.set(requestHash, {
      data: recommendations,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000  // 5分間キャッシュ
    });
  }
}
```

### 2. 段階的読み込み

```typescript
// 推薦結果の段階的読み込み
const useRecommendationDetails = (recommendationId: string) => {
  const [details, setDetails] = useState<RecommendationDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!recommendationId || details) return;

    setLoading(true);
    try {
      const response = await apiClient.getRecommendationDetails(recommendationId);
      setDetails(response);
    } catch (error) {
      console.error('Failed to load recommendation details:', error);
    } finally {
      setLoading(false);
    }
  }, [recommendationId, details]);

  return { details, loading, loadDetails };
};
```

---

## 🧪 テスト仕様

### 1. API統合テスト

```typescript
// src/tests/integration/aiOptimizationAPI.test.ts
describe('AI Optimization API Integration', () => {
  test('正常な最適化処理フロー', async () => {
    const request = createMockEnhancedRequest();
    const response = await aiOptimizationService.requestOptimization(request);

    expect(response.status).toBe('optimized');
    expect(response.recommendations).toHaveLength.greaterThan(0);
    expect(response.processingTime).toBeLessThan(10);
  });

  test('タイムアウト時のフォールバック', async () => {
    mockApiDelay(35000); // 35秒遅延

    const request = createMockEnhancedRequest();
    await expect(aiOptimizationService.requestOptimization(request))
      .rejects.toThrow(AIOptimizationTimeoutError);
  });
});
```

### 2. UI/UXテスト

```typescript
// src/tests/components/EnhancedInterviewRequestForm.test.tsx
describe('Enhanced Interview Request Form', () => {
  test('詳細希望入力の完了', async () => {
    render(<EnhancedInterviewRequestForm onSubmit={mockSubmit} staffInfo={mockStaff} />);

    // 日付選択
    fireEvent.click(screen.getByLabelText('希望日選択'));
    fireEvent.click(screen.getByText('2025-09-20'));

    // 時間帯選択
    fireEvent.click(screen.getByLabelText('午後'));

    // 担当者希望
    fireEvent.click(screen.getByLabelText('キャリア支援専門'));

    // 送信
    fireEvent.click(screen.getByText('AI最適化を実行'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          timePreference: { afternoon: true },
          interviewerPreference: { specialtyPreference: 'career_support' }
        })
      );
    });
  });
});
```

---

## 📋 実装チェックリスト

### Week 5: 詳細希望入力機能
- [ ] EnhancedInterviewRequestForm コンポーネント作成
- [ ] カレンダーUI実装（react-datepicker使用）
- [ ] 時間帯選択チェックボックス
- [ ] 担当者希望プルダウン
- [ ] 時間長スライダー（15-90分）
- [ ] バリデーション機能
- [ ] API連携基盤（AIOptimizationApiClient）

### Week 6: AI推薦結果表示システム
- [ ] AIProcessingLoader コンポーネント
- [ ] RecommendationSelector コンポーネント
- [ ] 推薦カード表示
- [ ] 信頼度バッジ
- [ ] AI理由説明表示
- [ ] 詳細モーダル
- [ ] 比較機能

### エラーハンドリング・フォールバック
- [ ] AIOptimizationFallbackService 実装
- [ ] タイムアウト処理
- [ ] ネットワークエラー処理
- [ ] 推薦候補なし処理
- [ ] 通常予約への切り替え

### テスト・品質保証
- [ ] API統合テスト
- [ ] UI/UXテスト
- [ ] エラーシナリオテスト
- [ ] パフォーマンステスト
- [ ] アクセシビリティテスト

---

**作成者**: VoiceDrive開発チーム
**最終更新**: 2025年09月13日