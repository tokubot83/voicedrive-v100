# Phase 2: LLM統合実装ガイド

## 📋 概要

Phase 2では、医療チームが開発中のLlama 3.2 8B ローカルLLM APIとVoiceDriveコンテンツモデレーションシステムを統合します。

**実装期間**: Week 5-12 (Phase 1完了後)
**担当**: VoiceDriveチーム + 医療職員管理システムチーム

---

## 🏗️ アーキテクチャ

### ハイブリッドモデレーションシステム

```
ユーザー投稿
    ↓
[クライアント側チェック] (即座・300ms debounce)
    ↓
[LLM APIチェック] (詳細分析・2秒以内)
    ↓
[統合判定] (最終決定)
    ↓
投稿可否の決定
```

### 3層モデレーション

1. **Layer 1: クライアント側チェック (Phase 1)**
   - 禁止フレーズ検出
   - 代替表現提案
   - 建設性スコア算出
   - **処理時間**: 即座（デバウンス300ms）
   - **サーバー負荷**: ゼロ

2. **Layer 2: LLM API詳細分析 (Phase 2)**
   - Llama 3.2 8Bによる文脈理解
   - 微妙なニュアンス検出
   - 高精度な違反判定
   - **処理時間**: 2秒以内（目標）
   - **信頼度**: 70-95%

3. **Layer 3: 統合判定**
   - 両結果を統合
   - より厳しい判定を採用
   - フォールバック機能

---

## 🔧 実装済みコンポーネント

### 1. 型定義 (`src/types/llmModeration.ts`)

```typescript
// リクエスト型
interface LLMModerationRequest {
  content: string;
  context?: {
    postType?: 'improvement' | 'community' | 'report';
    authorLevel?: number;
    department?: string;
  };
  options?: {
    checkSensitivity?: 'low' | 'medium' | 'high';
    language?: 'ja' | 'en';
    includeExplanation?: boolean;
  };
}

// レスポンス型
interface LLMModerationResult {
  allowed: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;  // 0-100
  violations: LLMViolation[];
  explanation?: string;
  suggestedEdits?: string[];
  metadata: {
    modelVersion: string;
    processingTime: number;
    timestamp: Date;
  };
}
```

### 2. LLM APIサービス (`src/services/LLMModerationService.ts`)

**主な機能**:
- ✅ API呼び出し（タイムアウト・リトライ付き）
- ✅ レスポンスキャッシュ（5分間）
- ✅ 統計情報収集
- ✅ ヘルスチェック
- ✅ フォールバック機能

**設定**:
```typescript
{
  endpoint: 'http://localhost:8000/api/moderate',
  timeout: 3000,           // 3秒
  retryAttempts: 2,        // 2回リトライ
  fallbackToLocal: true,   // API障害時はクライアント側のみ
  cacheEnabled: true,      // キャッシュ有効
  cacheDuration: 300000    // 5分間
}
```

### 3. ハイブリッドサービス (`src/services/HybridModerationService.ts`)

**判定ロジック**:
1. クライアント側で即座チェック
2. クライアント側でブロック → LLM不要（効率化）
3. クライアント側OK → LLMで詳細チェック
4. 両結果を統合して最終判定

**フォールバック戦略**:
- LLM API障害 → クライアント側結果を使用
- LLMタイムアウト → クライアント側結果を使用
- LLM無効化設定 → クライアント側のみ動作

### 4. モックLLM (`src/services/MockLLMAPIServer.ts`)

**開発用モック機能**:
- ✅ Llama 3.2 8Bの動作をシミュレート
- ✅ 300-800msの処理時間再現
- ✅ 違反検出パターン実装
- ✅ 建設性スコア計算
- ✅ 修正提案生成

---

## 🚀 医療チーム API実装要件

### エンドポイント仕様

**URL**: `POST /api/moderate`

**リクエスト**:
```json
{
  "content": "チェック対象テキスト",
  "context": {
    "postType": "improvement",
    "authorLevel": 3,
    "department": "看護部"
  },
  "options": {
    "checkSensitivity": "medium",
    "language": "ja",
    "includeExplanation": true
  }
}
```

**レスポンス**:
```json
{
  "allowed": false,
  "severity": "high",
  "confidence": 87,
  "violations": [
    {
      "type": "personal_attack",
      "severity": "high",
      "description": "特定の個人への攻撃的な表現が検出されました",
      "extractedText": "バカ",
      "startIndex": 10,
      "endIndex": 12,
      "confidence": 92
    }
  ],
  "explanation": "以下の理由により投稿をブロックしました：特定の個人への攻撃的な表現が検出されました。",
  "suggestedEdits": [
    "改善の余地があると考えます"
  ],
  "metadata": {
    "modelVersion": "llama-3.2-8b-v1.0",
    "processingTime": 1847,
    "timestamp": "2025-10-04T12:34:56Z"
  }
}
```

### パフォーマンス要件

| 指標 | 目標値 |
|------|--------|
| 平均応答時間 | 2秒以内 |
| P95応答時間 | 3秒以内 |
| タイムアウト | 3秒 |
| 信頼度 | 70-95% |
| 可用性 | 99% |

### 違反タイプ

```typescript
type LLMViolationType =
  | 'personal_attack'       // 個人攻撃
  | 'defamation'            // 誹謗中傷
  | 'harassment'            // ハラスメント
  | 'discrimination'        // 差別的表現
  | 'privacy_violation'     // プライバシー侵害
  | 'inappropriate_content' // 不適切なコンテンツ
  | 'threatening'           // 脅迫的表現
  | 'hate_speech'          // ヘイトスピーチ
  | 'misinformation'       // 誤情報・デマ
  | 'spam'                 // スパム
  | 'other';               // その他
```

---

## 🧪 テスト手順

### 1. モックLLMでのテスト（現在）

```bash
# 環境変数設定
cp .env.example .env
# REACT_APP_USE_MOCK_LLM=true に設定

# 開発サーバー起動
npm run dev

# ブラウザでテスト
# 1. 投稿作成画面で「バカ」などの禁止語を入力
# 2. リアルタイム警告が表示されることを確認
# 3. コンソールでモックLLM動作を確認
```

### 2. 医療チームAPI統合テスト

```bash
# 環境変数を医療チームAPIに設定
REACT_APP_LLM_API_ENDPOINT=http://medical-team-server:8000/api/moderate
REACT_APP_USE_MOCK_LLM=false

# 統合テスト実行
npm run test:llm-integration

# ヘルスチェック
curl http://localhost:3001/api/llm/health
```

### 3. 統計情報確認

```typescript
import { HybridModerationService } from './services/HybridModerationService';

const service = HybridModerationService.getInstance();
const stats = service.getLLMStats();

console.log('LLM統計:', {
  totalRequests: stats.totalRequests,
  apiSuccessRate: stats.apiSuccessRate,
  averageProcessingTime: stats.averageProcessingTime,
  cacheHitRate: stats.cacheHitRate
});
```

---

## 📊 監視・運用

### キャッシュ戦略

- **キャッシュ有効期間**: 5分間
- **キャッシュキー**: コンテンツのハッシュ値
- **自動クリーンアップ**: 10分ごと

### 統計情報

```typescript
interface LLMModerationStats {
  totalRequests: number;
  totalViolations: number;
  averageProcessingTime: number;  // ミリ秒
  apiSuccessRate: number;         // %
  violationsByType: Record<LLMViolationType, number>;
  cacheHitRate: number;           // %
}
```

### アラート設定（推奨）

| 条件 | アクション |
|------|-----------|
| API成功率 < 90% | 警告通知 |
| 平均応答時間 > 2.5秒 | 警告通知 |
| API成功率 < 50% | LLM無効化（クライアント側のみ） |
| タイムアウト連続5回 | LLM無効化 |

---

## 🔐 セキュリティ

### API認証

```bash
# APIキー設定（医療チームから提供）
REACT_APP_LLM_API_KEY=your-secret-api-key
```

### データプライバシー

- ✅ 投稿内容は一時的にLLM APIに送信
- ✅ 医療チームのローカルLLMで処理（外部送信なし）
- ✅ API側でのデータ保存なし（医療チーム仕様に準拠）
- ✅ 通信は全てHTTPS（本番環境）

---

## 📅 統合スケジュール

### Week 5-8: 医療チーム実装
- [ ] Llama 3.2 8B APIエンドポイント実装
- [ ] AWS Lightsailデプロイ
- [ ] パフォーマンスチューニング

### Week 9-10: VoiceDrive統合
- [ ] モックからリアルAPI切り替え
- [ ] 統合テスト実施
- [ ] パフォーマンス検証

### Week 11-12: 本番リリース準備
- [ ] 負荷テスト
- [ ] セキュリティ監査
- [ ] ドキュメント整備
- [ ] 本番環境デプロイ

---

## 🐛 トラブルシューティング

### Q1: LLM APIに接続できない

**確認事項**:
1. 環境変数 `REACT_APP_LLM_API_ENDPOINT` が正しいか
2. 医療チームのAPIサーバーが起動しているか
3. ネットワーク接続が正常か

**対処**:
```bash
# ヘルスチェック実行
npm run llm:health

# フォールバックモード強制有効化
REACT_APP_DISABLE_LLM=true npm run dev
```

### Q2: 応答が遅い（3秒以上）

**確認事項**:
1. 医療チームAPIのパフォーマンス
2. キャッシュが有効か
3. ネットワークレイテンシ

**対処**:
```bash
# タイムアウト延長（一時的）
REACT_APP_LLM_TIMEOUT=5000 npm run dev

# キャッシュ期間延長
REACT_APP_LLM_CACHE_DURATION=600000  # 10分
```

### Q3: キャッシュヒット率が低い

**原因**: 同じ内容の投稿が少ない

**対処**:
- キャッシュ期間を延長
- キャッシュキー生成ロジックの見直し

---

## 📞 連絡先

- **VoiceDriveチーム**: voicedrive-dev@example.com
- **医療システムチーム**: medical-system@example.com
- **統合テスト窓口**: integration@example.com

---

**最終更新**: 2025年10月4日
**ドキュメントバージョン**: Phase 2 v1.0
