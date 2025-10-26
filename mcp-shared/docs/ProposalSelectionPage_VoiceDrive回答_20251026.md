# ProposalSelectionPage VoiceDriveチーム回答書

**文書番号**: VD-RESP-2025-1026-010
**作成日**: 2025年10月26日
**作成者**: VoiceDriveチーム
**件名**: 医療システムチームからの確認事項への回答

---

## 📋 エグゼクティブサマリー

医療システムチームから頂いた「ProposalSelectionPage 医療システム確認結果報告書」の3つの確認事項に回答します。

### 回答サマリー

| 確認事項 | VoiceDriveの回答 | 実装状況 |
|---------|----------------|---------|
| 1. requestId管理方法 | **メモリ内のみ（React状態管理）** | ✅ 実装方針決定 |
| 2. getCurrentEmployeeId()実装 | **JWT認証から取得** | ❌ 未実装（0.5日で実装可） |
| 3. キャッシュ有効期限 | **1分で適切** | ✅ 既存実装で対応 |

### 次のステップ
- VoiceDrive側実装: getCurrentEmployeeId()関数実装（0.5日）
- 医療システム側実装: 3つのAPI実装（1.5日）
- 統合テスト: 2025年11月7日-8日予定

---

## 質問1: ProposalResponseのrequestId管理

### 医療システムチームからの質問

> VoiceDrive側では、医療システムの`requestId`（ProposalResponse.requestId）をどこに保存しますか？
>
> **背景**:
> - submitChoice()関数で`requestId`が必要
> - ProposalResponseに含まれているが、VoiceDrive側で永続化するか？
>
> **選択肢**:
> 1. **メモリ内のみ**（推奨）: React状態管理（useState）で保持、ページリロード時に再取得
> 2. **LocalStorage**: ブラウザに一時保存（セキュリティリスクあり）
> 3. **VoiceDrive DB**: InterviewReservationテーブルに追加フィールド（データ重複）

### VoiceDriveチームの回答

**選択**: **オプション1（メモリ内のみ）**

#### 理由

1. **データ管理責任分界点の原則に従う**
   - 医療システムが Single Source of Truth
   - VoiceDriveはUIレイヤーのみ
   - データ重複を避ける

2. **セキュリティリスク回避**
   - LocalStorageはXSS攻撃のリスクあり
   - メモリ内管理でセキュアに保つ

3. **実装シンプル性**
   - React状態管理で十分
   - ページリロード時はAPIから再取得（許容可能）

#### 実装方針

```typescript
// ProposalSelectionPage.tsx
const ProposalSelectionPage: React.FC = () => {
  const { voicedriveRequestId } = useParams<{ voicedriveRequestId: string }>();

  // ProposalResponseをメモリ内で保持
  const [proposalData, setProposalData] = useState<ProposalResponse | null>(null);

  useEffect(() => {
    const loadProposals = async () => {
      const data = await fetchProposalsWithCache(voicedriveRequestId);
      setProposalData(data); // requestIdを含むProposalResponse全体を保持
    };
    loadProposals();
  }, [voicedriveRequestId]);

  const handleSelectProposal = async (selectedProposalId: string, feedback?: string) => {
    if (!proposalData) {
      throw new Error('提案データが見つかりません');
    }

    // submitChoice()にproposalDataを渡す
    await submitChoice({
      voicedriveRequestId,
      selectedProposalId,
      feedback,
      requestId: proposalData.requestId // メモリから取得
    });
  };
};
```

#### submitChoice()関数の実装

```typescript
// src/api/medicalSystemAPI.ts
export async function submitChoice(params: {
  voicedriveRequestId: string;
  selectedProposalId: string;
  feedback?: string;
  requestId: string; // ProposalSelectionPageから渡される
}): Promise<{
  success: boolean;
  message: string;
  bookingId?: string;
}> {
  const confirmation: ChoiceConfirmation = {
    requestId: params.requestId, // 医療システムrequestId
    voicedriveRequestId: params.voicedriveRequestId,
    selectedProposalId: params.selectedProposalId,
    staffFeedback: params.feedback,
    selectedBy: getCurrentEmployeeId(), // 質問2で実装
    selectionTimestamp: new Date().toISOString()
  };

  return await confirmChoice(confirmation);
}
```

#### ページリロード時の挙動

**シナリオ**: ユーザーがProposalSelectionPageを開いた後、ブラウザをリロード

**挙動**:
1. メモリ内の状態がクリアされる
2. `useEffect`が再実行される
3. `fetchProposalsWithCache()`でAPIから再取得
4. ProposalResponseが再度メモリに保存される

**許容理由**:
- ページリロードは稀（通常のフローでは発生しない）
- APIキャッシュ（1分）で再取得は高速
- データ整合性が保たれる

#### 実装スケジュール

- **submitChoice()関数修正**: 0.5日
- **ProposalSelectionPage修正**: 含まれる（既存コードの微調整のみ）

**ステータス**: ✅ 実装方針決定、すぐに実装可能

---

## 質問2: getCurrentEmployeeId()の実装

### 医療システムチームからの質問

> 現在ログイン中の職員IDを取得する関数は実装済みですか？
>
> **必要な場面**:
> - submitChoice()で`selectedBy`パラメータ
> - requestScheduleAdjustment()で`requestedBy`パラメータ
>
> **医療システムの想定**:
> ```typescript
> // JWT認証から取得
> export function getCurrentEmployeeId(): string {
>   const token = getAuthToken();
>   const decoded = jwt.decode(token);
>   return decoded.employeeId;
> }
> ```

### VoiceDriveチームの回答

**実装状況**: ❌ **未実装**

**実装方針**: 医療システムの想定通り、JWT認証から取得

#### 実装内容

```typescript
// src/utils/auth.ts（新規）
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  employeeId: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * 現在ログイン中の職員IDを取得
 * @returns employeeId
 * @throws Error - トークンが存在しない、または無効な場合
 */
export function getCurrentEmployeeId(): string {
  const token = getAuthToken();

  if (!token) {
    throw new Error('認証トークンが見つかりません。ログインしてください。');
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token);

    // トークン有効期限チェック
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      throw new Error('認証トークンの有効期限が切れています。再ログインしてください。');
    }

    return decoded.employeeId;
  } catch (error) {
    console.error('JWT decode error:', error);
    throw new Error('認証トークンの解析に失敗しました。');
  }
}

/**
 * localStorage/sessionStorageから認証トークンを取得
 * @returns JWT token or null
 */
function getAuthToken(): string | null {
  // sessionStorageを優先（セキュリティ向上）
  let token = sessionStorage.getItem('authToken');

  if (!token) {
    // フォールバック: localStorage
    token = localStorage.getItem('authToken');
  }

  return token;
}

/**
 * 現在ログイン中のユーザー情報全体を取得
 * @returns JWTPayload
 */
export function getCurrentUser(): JWTPayload | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}
```

#### medicalSystemAPI.tsでの利用

```typescript
// src/api/medicalSystemAPI.ts
import { getCurrentEmployeeId } from '../utils/auth';

export async function submitChoice(params: {
  voicedriveRequestId: string;
  selectedProposalId: string;
  feedback?: string;
  requestId: string;
}): Promise<{
  success: boolean;
  message: string;
  bookingId?: string;
}> {
  const confirmation: ChoiceConfirmation = {
    requestId: params.requestId,
    voicedriveRequestId: params.voicedriveRequestId,
    selectedProposalId: params.selectedProposalId,
    staffFeedback: params.feedback,
    selectedBy: getCurrentEmployeeId(), // ← ここで使用
    selectionTimestamp: new Date().toISOString()
  };

  return await confirmChoice(confirmation);
}

export async function requestScheduleAdjustmentSimple(params: {
  voicedriveRequestId: string;
  reason: string;
  adjustmentType: 'schedule_change';
  requestId: string;
}): Promise<{
  success: boolean;
  adjustmentId?: string;
  message: string;
}> {
  const fullRequest: AdjustmentRequest = {
    requestId: params.requestId,
    voicedriveRequestId: params.voicedriveRequestId,
    adjustmentType: params.adjustmentType,
    reason: params.reason,
    staffPreferences: {},
    requestedBy: getCurrentEmployeeId(), // ← ここで使用
    requestTimestamp: new Date().toISOString()
  };

  return await requestScheduleAdjustment(fullRequest);
}
```

#### エラーハンドリング

```typescript
// ProposalSelectionPage.tsx
const handleSelectProposal = async (selectedProposalId: string, feedback?: string) => {
  try {
    if (!proposalData) {
      throw new Error('提案データが見つかりません');
    }

    await submitChoice({
      voicedriveRequestId,
      selectedProposalId,
      feedback,
      requestId: proposalData.requestId
    });

    // 成功時の処理
    navigate(`/interview/confirmation/${voicedriveRequestId}`);
  } catch (error) {
    if (error.message.includes('認証トークン')) {
      // 認証エラー → ログインページへリダイレクト
      setError('セッションが期限切れです。再度ログインしてください。');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      // その他のエラー
      setError('選択の送信に失敗しました。もう一度お試しください。');
    }
  }
};
```

#### 必要な依存関係

```json
// package.json
{
  "dependencies": {
    "jwt-decode": "^4.0.0"
  }
}
```

#### 実装スケジュール

- **auth.ts作成**: 0.25日（2時間）
- **medicalSystemAPI.ts修正**: 0.25日（2時間）
- **エラーハンドリング追加**: 含まれる
- **テスト**: 含まれる

**合計**: 0.5日（4時間）

**ステータス**: ❌ 未実装、11/1-11/2に実装予定

---

## 質問3: キャッシュ有効期限

### 医療システムチームからの質問

> ProposalResponseのキャッシュ有効期限は1分で適切ですか？
>
> **背景**:
> - カウントダウン中の再読み込み対策
> - API負荷軽減

### VoiceDriveチームの回答

**回答**: ✅ **1分で適切**

#### 理由

1. **カウントダウン中の再読み込み対策**
   - ユーザーがページをリロードする可能性は低い
   - リロードしても1分以内ならキャッシュヒット
   - API負荷を軽減できる

2. **データ鮮度とのバランス**
   - 提案データは静的（変更されない）
   - expiresAtカウントダウンはクライアント側で計算
   - 1分のキャッシュでデータ整合性に問題なし

3. **既存実装の活用**
   - ProposalCacheクラス（proposalAPI.ts 304-361行目）で実装済み
   - 動作確認済み

#### 既存実装の確認

```typescript
// src/api/proposalAPI.ts (304-361行目)
class ProposalCache {
  private cache: Map<string, { data: ProposalResponse; timestamp: number }> = new Map();
  private cacheTimeout: number = 60000; // 1分 = 60000ミリ秒

  set(requestId: string, data: ProposalResponse): void {
    this.cache.set(requestId, {
      data,
      timestamp: Date.now()
    });
  }

  get(requestId: string): ProposalResponse | null {
    const cached = this.cache.get(requestId);

    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheTimeout) {
      // 期限切れ → 削除
      this.cache.delete(requestId);
      return null;
    }

    return cached.data;
  }

  clear(requestId: string): void {
    this.cache.delete(requestId);
  }

  clearAll(): void {
    this.cache.clear();
  }
}

const proposalCache = new ProposalCache();

export async function fetchProposalsWithCache(
  voicedriveRequestId: string
): Promise<ProposalResponse> {
  // キャッシュチェック
  const cached = proposalCache.get(voicedriveRequestId);
  if (cached) {
    console.log('[ProposalAPI] Cache hit:', voicedriveRequestId);
    return cached;
  }

  // キャッシュミス → API呼び出し
  console.log('[ProposalAPI] Cache miss, fetching from API:', voicedriveRequestId);
  const data = await fetchProposals(voicedriveRequestId);

  // キャッシュに保存
  proposalCache.set(voicedriveRequestId, data);

  return data;
}
```

#### キャッシュ無効化タイミング

```typescript
// 選択確定後にキャッシュクリア
const handleSelectProposal = async (selectedProposalId: string, feedback?: string) => {
  try {
    await submitChoice({
      voicedriveRequestId,
      selectedProposalId,
      feedback,
      requestId: proposalData.requestId
    });

    // キャッシュクリア
    proposalCache.clear(voicedriveRequestId);

    navigate(`/interview/confirmation/${voicedriveRequestId}`);
  } catch (error) {
    // エラーハンドリング
  }
};

// 再調整依頼後にキャッシュクリア
const handleRequestAdjustment = async (reason: string) => {
  try {
    await requestScheduleAdjustmentSimple({
      voicedriveRequestId,
      reason,
      adjustmentType: 'schedule_change',
      requestId: proposalData.requestId
    });

    // キャッシュクリア
    proposalCache.clear(voicedriveRequestId);

    navigate(`/interview/adjustment-requested/${voicedriveRequestId}`);
  } catch (error) {
    // エラーハンドリング
  }
};
```

#### 代替案の検討（却下）

| 代替案 | メリット | デメリット | 判定 |
|-------|---------|----------|------|
| 5秒 | データ鮮度が高い | API負荷増加、過剰 | ❌ 不採用 |
| 5分 | API負荷軽減 | データ鮮度低下、カウントダウンずれ | ❌ 不採用 |
| キャッシュなし | 常に最新データ | API負荷大、ユーザー体験悪化 | ❌ 不採用 |
| **1分（現状）** | **バランスが良い** | **なし** | ✅ **採用** |

**ステータス**: ✅ 既存実装で対応済み、変更不要

---

## まとめ

### 回答一覧

| 確認事項 | VoiceDriveの回答 | 実装スケジュール |
|---------|----------------|---------------|
| 1. requestId管理 | メモリ内のみ（React状態管理） | ✅ 方針決定済み |
| 2. getCurrentEmployeeId() | JWT認証から取得、auth.ts実装 | ❌ 11/1-11/2実装予定（0.5日） |
| 3. キャッシュ有効期限 | 1分で適切（既存実装維持） | ✅ 変更不要 |

### VoiceDrive側実装タスク

| タスク | 推定工数 | スケジュール | 担当 |
|-------|---------|------------|------|
| getCurrentEmployeeId()実装 | 0.5日 | 11/1-11/2 | VoiceDrive |
| submitChoice()修正 | 0.5日 | 11/1-11/2 | VoiceDrive |
| requestScheduleAdjustmentSimple()実装 | 含まれる | 11/1-11/2 | VoiceDrive |
| エラーハンドリング強化 | 含まれる | 11/1-11/2 | VoiceDrive |

**合計**: 0.5日（4時間）

### 医療システム側実装タスク（確認）

| タスク | 推定工数 | スケジュール | 担当 |
|-------|---------|------------|------|
| API-1実装（提案取得） | 0.5日 | 11/1-11/4 | 医療システム |
| API-2実装（選択確定） | 0.5日 | 11/1-11/4 | 医療システム |
| API-3実装（再調整依頼） | 0.5日 | 11/1-11/4 | 医療システム |

**合計**: 1.5日（12時間）

### 統合テストスケジュール

| 日付 | 作業内容 | 担当 |
|------|---------|------|
| 11/1 | API仕様最終確認 | 両チーム |
| 11/1-11/2 | VoiceDrive側実装 | VoiceDrive |
| 11/1-11/4 | 医療システム側API実装 | 医療システム |
| 11/5-11/6 | 個別単体テスト | 各チーム |
| 11/7-11/8 | 統合テスト | 両チーム |

### 次のアクション

**VoiceDriveチーム**:
1. ✅ 本回答書をレビュー
2. ⏳ getCurrentEmployeeId()実装開始（11/1）
3. ⏳ submitChoice()修正（11/1）

**医療システムチーム**:
1. ⏳ 本回答書を確認
2. ⏳ API実装開始（11/1）
3. ⏳ API仕様最終確認（11/1）

---

## 関連ドキュメント

1. [ProposalSelectionPage_DB要件分析_20251026.md](./ProposalSelectionPage_DB要件分析_20251026.md) - VoiceDrive側DB分析
2. [ProposalSelectionPage暫定マスターリスト_20251026.md](./ProposalSelectionPage暫定マスターリスト_20251026.md) - データ項目カタログ
3. [ProposalSelectionPage_医療システム確認結果_20251026.md](./ProposalSelectionPage_医療システム確認結果_20251026.md) - 医療システムからの確認事項（本回答の元文書）
4. [AI_SUMMARY.md](./AI_SUMMARY.md) - 最新更新要約

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
承認: VoiceDriveチーム承認済み
次回アクション: 医療システムチームの確認待ち
