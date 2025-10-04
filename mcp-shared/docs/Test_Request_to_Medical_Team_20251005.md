# LLMモデレーションAPI 統合テスト実施依頼書

**発行日**: 2025年10月5日
**発行元**: VoiceDrive開発チーム
**宛先**: 医療職員管理システム開発チーム（医療チーム）
**件名**: Llama 3.2 8B モデレーションAPI 統合テスト実施のお願い

---

## 1. 依頼の背景

VoiceDrive SNS機能におけるコンテンツモデレーション強化のため、貴チームにて開発予定のLlama 3.2 8B ローカルLLM APIとの統合を計画しております。

本依頼書は、統合テスト実施に必要なテストデータの提供と、テスト実施の正式な依頼を目的としています。

## 2. テストデータ提供のご報告

### 2.1 提供内容

VoiceDriveチームより、以下のテストデータセットを提供いたします。

**提供場所**: `mcp-shared/test-data/llm-moderation/`

| ファイル名 | テストケース数 | 目的 |
|-----------|--------------|------|
| `normal-cases.json` | 100件 | 正常系テスト（すべて許可すべき投稿） |
| `violation-cases.json` | 50件 | 異常系テスト（すべてブロックすべき投稿） |
| `edge-cases.json` | 30件 | 境界値テスト（判定が難しい微妙なケース） |
| `medical-context-cases.json` | 50件 | 医療文脈テスト（医療特有の表現の適切な判定） |
| `README.md` | - | 使用方法・評価基準の詳細ドキュメント |
| **合計** | **230件** | **包括的なテストカバレッジ** |

### 2.2 テストデータの特徴

#### 正常系100件の構成
- 建設的な改善提案: 40件
- 業務相談・質問: 20件
- ポジティブなフィードバック: 15件
- 知識共有・情報提供: 15件
- 施設・設備改善提案: 10件

#### 異常系50件の違反タイプ別構成
| 違反タイプ | 件数 | 重要度 |
|-----------|------|--------|
| `personal_attack`（個人攻撃） | 3件 | 高 |
| `defamation`（誹謗中傷） | 7件 | 最高 |
| `harassment`（ハラスメント） | 5件 | 高 |
| `discrimination`（差別） | 5件 | 高 |
| `privacy_violation`（プライバシー侵害） | 5件 | 最高 |
| `inappropriate_content`（不適切コンテンツ） | 3件 | 中 |
| `threatening`（脅迫） | 3件 | 最高 |
| `hate_speech`（ヘイトスピーチ） | 3件 | 最高 |
| `misinformation`（誤情報・デマ） | 5件 | 高 |
| `spam`（スパム） | 5件 | 中 |
| `other`（その他） | 6件 | 可変 |

#### 境界値30件の特徴
- 批判的だが建設的なフィードバック
- 強い表現だが正当な異議申し立て
- 感情的だが違反ではない表現
- 文脈依存の判定が必要なケース

#### 医療表現50件の特徴
- 医療専門用語の適切な使用例（40件）
- 不適切な患者表現の検出例（10件）
- 終末期医療、精神科医療の専門用語
- 臨床的記述と攻撃的表現の区別

### 2.3 各テストケースのフォーマット

```json
{
  "id": "normal-001",
  "content": "モデレーション対象のテキスト",
  "expectedResult": {
    "allowed": true,
    "severity": "none",
    "violations": []
  },
  "context": {
    "postType": "improvement",
    "authorLevel": 3,
    "department": "看護部"
  },
  "category": "constructive_feedback",
  "notes": "テスト観点の説明"
}
```

## 3. 依頼内容

### 3.1 実施していただきたいこと

#### Phase 1: API開発（Week 5）
1. **Llama 3.2 8B モデレーションAPIの実装**
   - エンドポイント: `/api/moderate`
   - リクエスト/レスポンス形式: `src/types/llmModeration.ts` に準拠
   - タイムアウト: 3秒以内

2. **基本機能テストの実施**
   - `normal-cases.json`: 全100件でパステスト
   - `violation-cases.json`: 全50件でブロックテスト
   - 初期精度の測定

#### Phase 2: 精度向上（Week 6）
1. **境界値・医療文脈テストの実施**
   - `edge-cases.json`: 30件の判定精度向上
   - `medical-context-cases.json`: 50件の医療文脈理解度向上

2. **Few-shot Learning調整**
   - プロンプトエンジニアリング
   - サンプル追加による精度改善

3. **MockLLMとの整合性検証**
   - VoiceDrive提供のMockLLM結果と比較
   - 判定差異の分析と調整

#### Phase 3: 統合テスト（Week 7）
1. **パフォーマンステスト**
   - 応答時間の計測（目標: 平均1.5秒以下）
   - 負荷テスト（同時リクエスト処理）

2. **キャッシュ機能テスト**
   - キャッシュヒット率の測定（目標: 60%以上）
   - キャッシュ整合性の確認

3. **エラーハンドリングテスト**
   - タイムアウト処理
   - API障害時のフォールバック動作

#### Phase 4: 本番準備（Week 8）
1. **総合評価レポート作成**
   - 精度評価結果
   - パフォーマンス測定結果
   - 残課題と対応方針

2. **デプロイメント準備**
   - 本番環境構築
   - 監視体制の確立

### 3.2 提出していただきたい成果物

#### 必須成果物

| 成果物 | 提出期限 | 形式 |
|--------|---------|------|
| Week 5進捗報告 | 10/12(金) | Markdown |
| 基本機能テスト結果 | 10/12(金) | JSON + レポート |
| Week 6進捗報告 | 10/19(金) | Markdown |
| 精度向上テスト結果 | 10/19(金) | JSON + レポート |
| Week 7進捗報告 | 10/26(金) | Markdown |
| 統合テスト結果 | 10/26(金) | JSON + レポート |
| 最終評価レポート | 11/2(金) | Markdown + PDF |

#### テスト結果JSONフォーマット例

```json
{
  "testDate": "2025-10-12",
  "apiVersion": "1.0.0",
  "modelVersion": "llama-3.2-8b-v1",
  "summary": {
    "totalTests": 230,
    "passed": 195,
    "failed": 35,
    "accuracy": 84.78,
    "precision": 89.2,
    "recall": 92.5,
    "f1Score": 90.8
  },
  "byCategory": {
    "normal-cases": {
      "total": 100,
      "passed": 92,
      "falsePositive": 8,
      "accuracy": 92.0
    },
    "violation-cases": {
      "total": 50,
      "passed": 47,
      "falseNegative": 3,
      "accuracy": 94.0
    }
  },
  "performance": {
    "avgResponseTime": 1420,
    "p95ResponseTime": 2350,
    "p99ResponseTime": 2850,
    "timeouts": 2
  },
  "detailedResults": [
    {
      "testCase": "normal-001",
      "expected": { "allowed": true },
      "actual": { "allowed": true, "confidence": 98 },
      "result": "PASS"
    }
  ]
}
```

## 4. 達成目標

### 4.1 精度目標

| 指標 | 目標値 | 最低ライン |
|------|--------|-----------|
| **Overall Accuracy** | 90%以上 | 85%以上 |
| **Precision（適合率）** | 92%以上 | 90%以上 |
| **Recall（再現率）** | 95%以上 | 95%以上 |
| **F1 Score** | 93%以上 | 92%以上 |

### 4.2 違反タイプ別精度目標

| 違反タイプ | 目標精度 | 優先度 |
|-----------|---------|--------|
| `privacy_violation` | **100%** | 最高（患者情報保護） |
| `defamation` | 95%以上 | 最高 |
| `threatening` | 95%以上 | 最高 |
| `hate_speech` | 95%以上 | 最高 |
| `personal_attack` | 90%以上 | 高 |
| `harassment` | 90%以上 | 高 |
| `discrimination` | 90%以上 | 高 |
| `misinformation` | 85%以上 | 高 |
| `inappropriate_content` | 85%以上 | 中 |
| `spam` | 80%以上 | 中 |

### 4.3 パフォーマンス目標

| 指標 | 目標値 | 計測方法 |
|------|--------|---------|
| **平均応答時間** | 1.5秒以下 | 全230件の平均 |
| **P95応答時間** | 2.5秒以下 | 95パーセンタイル |
| **P99応答時間** | 3.0秒以下 | 99パーセンタイル |
| **タイムアウト率** | 1%以下 | タイムアウト発生率 |
| **キャッシュヒット率** | 60%以上 | 同一コンテンツの2回目以降 |

### 4.4 整合性目標（MockLLM比較）

| カテゴリ | 整合率目標 |
|---------|-----------|
| normal-cases | 95%以上 |
| violation-cases | 98%以上 |
| edge-cases | 80%以上 |
| medical-context | 90%以上 |

## 5. VoiceDrive側のサポート体制

### 5.1 提供するサポート

#### 技術サポート
- **MockLLM実装コードの提供**: 参考実装として全コード公開済み
- **テストデータの追加**: 必要に応じて追加ケース提供
- **判定基準の相談**: 微妙なケースの判定基準すり合わせ
- **統合テスト支援**: VoiceDrive側からのAPI呼び出しテスト

#### リソース提供
- **Slackチャンネル**: `#llm-integration`（質問・相談随時対応）
- **週次ミーティング**: 毎週金曜15:00（進捗確認・課題共有）
- **オンデマンドミーティング**: 緊急課題発生時は随時対応

#### ドキュメント提供
- ✅ `LLM_Implementation_Guide_Medical_Team_20251004.md`（実装ガイド）
- ✅ `Medical_Team_LLM_Implementation_Plan_20251004.md`（実装計画書）
- ✅ `VoiceDrive_Response_to_Medical_Team_20251004.md`（VoiceDrive回答書）
- ✅ `Kickoff_Report_LLM_Integration_20251004.md`（キックオフ報告書）
- ✅ `test-data/llm-moderation/README.md`（テストデータ使用ガイド）

### 5.2 担当者連絡先

| 役割 | 担当部署 | 連絡先 |
|------|---------|--------|
| **プロジェクトリード** | システム開発部 | Slack: #llm-integration |
| **技術サポート** | システム開発部 | Slack: @voicedrive-dev |
| **テストデータ担当** | 品質保証部 | Slack: @voicedrive-qa |
| **緊急連絡** | システム開発部 | 内線: XXX-XXXX |

### 5.3 対応時間

- **平日**: 9:00-18:00（通常対応）
- **緊急時**: 平日18:00-21:00（Slackのみ）
- **週次ミーティング**: 毎週金曜15:00-16:00

### 5.4 医療チーム側の技術スタック確認

VoiceDriveチームで確認させていただきたい技術的な詳細事項です。キックオフミーティング（10/7）またはそれ以前に情報共有をお願いいたします。

#### 必須確認事項

| 項目 | 確認内容 | 備考 |
|------|---------|------|
| **LLMエンジン** | Ollama + Llama 3.2 8B | ✅ 確認済み（`llm_engine.py`） |
| **Webフレームワーク** | FastAPI / Flask / その他？ | APIサーバー実装に使用 |
| **エンドポイントURL** | `http://localhost:8000/api/moderate` | VoiceDrive側の期待値 |
| **ポート番号** | 8000（デフォルト） | 変更の場合は事前通知をお願いします |
| **認証方式** | APIキー / なし | VoiceDrive側で設定が必要な場合 |

#### インフラ環境の確認

**開発環境**:
| 項目 | 確認内容 |
|------|---------|
| OS | Linux / macOS / Windows |
| Python バージョン | 3.10以上推奨 |
| Ollama インストール済み | `ollama --version` |
| モデルダウンロード済み | `ollama list` で llama3.2:8b 確認 |

**本番環境（AWS Lightsail）**:
| 項目 | 確認内容 | 備考 |
|------|---------|------|
| インスタンスタイプ | CPU: ?コア、RAM: ?GB | パフォーマンス目標達成に影響 |
| GPU | あり / なし | Llama 3.2 8BはCPUでも動作可能 |
| ストレージ | ?GB（モデルサイズ: 約5GB） | キャッシュ領域も考慮 |
| ネットワーク | VoiceDriveからアクセス可能か | VPC/セキュリティグループ設定 |

#### 必須パッケージ・依存関係

**Python パッケージ**:
```bash
# 必須
pip install ollama          # Ollamaクライアント
pip install pydantic        # 型定義
pip install fastapi         # APIフレームワーク（推奨）
pip install uvicorn         # ASGIサーバー

# 推奨
pip install redis           # キャッシュ用
pip install prometheus-client  # メトリクス収集
pip install python-dotenv   # 環境変数管理
```

**Ollama セットアップ**:
```bash
# 1. Ollamaインストール（公式サイトから）
# https://ollama.com/

# 2. サーバー起動
ollama serve  # デフォルト: localhost:11434

# 3. モデルダウンロード
ollama pull llama3.2:8b  # 約5GB

# 4. 動作確認
ollama run llama3.2:8b "こんにちは"
```

#### パフォーマンス事前検証のお願い

目標値達成の見込みを事前に確認したいため、以下のベンチマークテストをお願いします：

**シンプルなベンチマーク**:
```python
import time
import ollama

client = ollama.Client()

# 10回の推論時間を計測
times = []
for i in range(10):
    start = time.time()
    client.generate(
        model='llama3.2:8b',
        prompt='この投稿は適切ですか？「電子カルテの操作性を改善してほしいです」',
        options={'temperature': 0.3, 'num_predict': 500}
    )
    elapsed = time.time() - start
    times.append(elapsed * 1000)  # ミリ秒
    print(f"Test {i+1}: {elapsed*1000:.0f}ms")

print(f"\n平均: {sum(times)/len(times):.0f}ms")
print(f"最大: {max(times):.0f}ms")
print(f"最小: {min(times):.0f}ms")
```

**目標値との比較**:
- ✅ 平均が2000ms以下: 目標達成見込み高い
- ⚠️ 平均が2000-3000ms: キャッシュ・最適化で達成可能
- ❌ 平均が3000ms超: インフラ強化が必要

#### API仕様の最終確認

**リクエストフォーマット**:
```typescript
POST /api/moderate
Content-Type: application/json

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

**レスポンスフォーマット**:
```typescript
{
  "allowed": true,
  "severity": "none",
  "confidence": 95,
  "violations": [],
  "explanation": "建設的な改善提案です。問題ありません。",
  "suggestedEdits": null,
  "metadata": {
    "modelVersion": "llama-3.2-8b-v1",
    "processingTime": 1450,
    "timestamp": "2025-10-12T10:30:45.123Z"
  }
}
```

**型定義の完全一致確認**:
- ✅ `src/types/llmModeration.ts` との完全一致
- ✅ Pydantic型定義（`types.py`）との整合性
- ⚠️ 差異がある場合は事前に協議

#### 追加API（医療チーム提案分）

以下のAPIも実装予定でしょうか？Week 5での実装優先度をお知らせください：

| API | エンドポイント | 優先度 |
|-----|--------------|--------|
| **バッチモデレーション** | `POST /api/moderate/batch` | Week 6-7実装でも可 |
| **ヘルスチェック** | `GET /api/health` | Week 5必須（監視用） |
| **メトリクス** | `GET /api/metrics` | Week 6-7実装でも可 |

#### キックオフMTGで確認したい事項

**10/7（月）10:00のミーティングで以下を確認させてください**:

1. ✅ 上記の技術スタック詳細
2. ✅ インフラ環境のスペック
3. ✅ 事前ベンチマーク結果（可能であれば）
4. ✅ Week 5でのAPI実装範囲（基本API + ヘルスチェック）
5. ✅ 開発環境のセットアップ状況
6. ✅ 懸念事項・質問事項

**情報共有の方法**:
- Slack `#llm-integration` に環境情報を投稿
- または、キックオフMTGで口頭説明

お手数をおかけしますが、スムーズな統合のためご協力をお願いいたします。

## 6. スケジュール

### 6.1 詳細スケジュール

| Week | 期間 | マイルストーン | 医療チーム作業 | VoiceDrive支援 |
|------|------|--------------|--------------|---------------|
| **Week 5** | 10/6-10/12 | API開発完了 | - Llama 3.2 8B API実装<br>- 基本機能テスト実施<br>- 初期精度測定 | - 技術質問対応<br>- 判定基準相談<br>- 週次MTG |
| **Week 6** | 10/13-10/19 | 精度向上完了 | - Few-shot調整<br>- 境界値テスト<br>- 医療文脈テスト<br>- MockLLM整合性検証 | - 整合性検証支援<br>- 追加ケース提供<br>- 週次MTG |
| **Week 7** | 10/20-10/26 | 統合テスト完了 | - パフォーマンステスト<br>- キャッシュテスト<br>- エラーハンドリング<br>- 負荷テスト | - 統合テスト実施<br>- パフォーマンス分析<br>- 週次MTG |
| **Week 8** | 10/27-11/2 | 本番準備完了 | - 最終評価レポート<br>- 本番環境構築<br>- 監視体制確立<br>- ドキュメント整備 | - 最終レビュー<br>- デプロイ支援<br>- 週次MTG |

### 6.2 重要期限

| 日付 | イベント |
|------|---------|
| **10/6（日）** | テストデータ提供完了（本日） |
| **10/7（月）** | キックオフミーティング（医療チーム・VoiceDrive合同） |
| **10/12（金）** | Week 5進捗報告・基本機能テスト結果提出 |
| **10/19（金）** | Week 6進捗報告・精度向上テスト結果提出 |
| **10/26（金）** | Week 7進捗報告・統合テスト結果提出 |
| **11/2（金）** | 最終評価レポート提出 |
| **11/5（月）** | 本番デプロイ判定会議 |

## 7. リスクと対応

### 7.1 想定されるリスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 精度目標未達 | 高 | - Week 6で早期検知<br>- Few-shot examples追加<br>- プロンプト調整<br>- 必要に応じてスケジュール調整 |
| パフォーマンス目標未達 | 中 | - モデル最適化<br>- キャッシュ戦略見直し<br>- インフラスケールアップ |
| MockLLMとの整合性低下 | 中 | - 判定基準のすり合わせ<br>- VoiceDrive側のMockLLM調整も検討<br>- 合同レビュー会実施 |
| テストデータ不足 | 低 | - VoiceDriveが追加ケース提供<br>- 本番データからのフィードバック |

### 7.2 エスカレーション基準

以下の状況が発生した場合、即座にVoiceDriveプロジェクトリードへ報告：

1. **精度が目標の80%を下回る**（Week 6時点）
2. **平均応答時間が2.5秒を超える**（Week 7時点）
3. **タイムアウト率が5%を超える**
4. **プライバシー侵害の検出精度が95%を下回る**（最重要）
5. **スケジュール遅延が3日以上発生**

## 8. 品質基準

### 8.1 リリース判定基準

以下のすべてを満たした場合、本番リリース可能と判定：

#### 必須基準（Must）
- ✅ Overall Accuracy ≥ 85%
- ✅ Precision ≥ 90%
- ✅ Recall ≥ 95%
- ✅ F1 Score ≥ 92%
- ✅ プライバシー侵害検出精度 = 100%
- ✅ 平均応答時間 ≤ 1.5秒
- ✅ タイムアウト率 ≤ 1%

#### 推奨基準（Should）
- 🎯 Overall Accuracy ≥ 90%
- 🎯 MockLLM整合率 ≥ 90%（全体）
- 🎯 医療文脈理解度 ≥ 90%
- 🎯 キャッシュヒット率 ≥ 60%

### 8.2 不合格時の対応

必須基準を1つでも満たさない場合：
1. リリース延期を決定
2. 追加開発期間（1-2週間）を設定
3. 原因分析と改善計画を作成
4. 再テスト実施

## 9. 次のアクション

### 9.1 医療チーム側

| アクション | 期限 | 担当者 |
|-----------|------|--------|
| テストデータの受領確認 | 10/6（日） | プロジェクトリード |
| キックオフMTG参加 | 10/7（月）10:00 | 全員 |
| 開発環境構築完了 | 10/8（火） | インフラ担当 |
| API開発開始 | 10/9（水） | 開発担当 |
| Week 5進捗報告 | 10/12（金） | プロジェクトリード |

### 9.2 VoiceDrive側

| アクション | 期限 | 担当者 |
|-----------|------|--------|
| テストデータ提供完了 | 10/5（土）✅ | システム開発部 |
| キックオフMTG開催 | 10/7（月）10:00 | プロジェクトリード |
| MockLLM結果データ提供 | 10/8（火） | 品質保証部 |
| 週次MTG開催 | 毎週金曜15:00 | プロジェクトリード |

## 10. 問い合わせ先

### 技術的な質問
- **Slack**: `#llm-integration`チャンネル
- **対応時間**: 平日9:00-18:00（30分以内に初回返信）

### 進捗・スケジュールに関する質問
- **担当**: VoiceDriveプロジェクトリード
- **Slack**: `@voicedrive-pm`
- **対応時間**: 平日9:00-18:00

### 緊急連絡
- **内線**: XXX-XXXX
- **対応時間**: 平日9:00-21:00

---

## 付録A: テストデータアクセス方法

### Gitリポジトリからの取得

```bash
# VoiceDriveリポジトリをクローン（既にアクセス権がある場合）
git clone https://github.com/your-org/voicedrive-v100.git
cd voicedrive-v100

# 最新のテストデータを取得
git pull origin main

# テストデータの場所
cd mcp-shared/test-data/llm-moderation/
ls -la
# normal-cases.json
# violation-cases.json
# edge-cases.json
# medical-context-cases.json
# README.md
```

### MCPサーバー経由でのアクセス

MCPサーバーの共有フォルダから自動同期：

```bash
# MCPサーバーの共有ディレクトリ
/mcp-shared/test-data/llm-moderation/
```

## 付録B: サンプルテストコード

### Python実装例

```python
import json
import requests
from typing import Dict, List

def test_llm_api(test_data_path: str, api_endpoint: str) -> Dict:
    """
    LLM APIのテストを実行
    """
    # テストデータ読み込み
    with open(test_data_path, 'r', encoding='utf-8') as f:
        test_data = json.load(f)

    results = []
    for test_case in test_data['testCases']:
        # API呼び出し
        response = requests.post(
            api_endpoint,
            json={
                'content': test_case['content'],
                'context': test_case['context']
            },
            timeout=3
        )

        result = response.json()

        # 期待結果と比較
        passed = (
            result['allowed'] == test_case['expectedResult']['allowed']
        )

        results.append({
            'testCase': test_case['id'],
            'expected': test_case['expectedResult'],
            'actual': result,
            'result': 'PASS' if passed else 'FAIL'
        })

    return {
        'total': len(results),
        'passed': sum(1 for r in results if r['result'] == 'PASS'),
        'failed': sum(1 for r in results if r['result'] == 'FAIL'),
        'results': results
    }

# 実行例
if __name__ == '__main__':
    result = test_llm_api(
        'normal-cases.json',
        'http://localhost:8000/api/moderate'
    )
    print(f"Passed: {result['passed']}/{result['total']}")
```

---

**本依頼書についてご不明点がございましたら、お気軽にお問い合わせください。**

**VoiceDrive開発チーム一同、貴チームとの協業を心よりお待ちしております。**

---

**発行**: VoiceDriveシステム開発部
**承認**: プロジェクトマネージャー
**版数**: Version 1.0
**最終更新**: 2025年10月5日
