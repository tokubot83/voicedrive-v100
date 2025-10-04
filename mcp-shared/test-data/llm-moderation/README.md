# LLMモデレーションAPI テストデータ

## 概要

このディレクトリには、医療チームが開発中の Llama 3.2 8B LLMモデレーションAPIのテストデータが格納されています。

**総テストケース数**: 230件

### 提供目的

1. **整合性検証**: VoiceDriveの MockLLM と医療チームのLlama 3.2 8B の判定結果を比較
2. **精度評価**: 各違反タイプの検出精度を測定
3. **医療文脈理解**: 医療特有の表現を正確に理解できるかを検証
4. **境界値テスト**: 判定が難しい微妙なケースでの挙動確認

## ファイル構成

### 1. normal-cases.json（正常系 100件）

**目的**: モデレーションをパスすべき正常な投稿

**カテゴリ**:
- 建設的なフィードバック（constructive_feedback）
- 業務改善提案（process_improvement）
- ポジティブな意見（positive_feedback）
- 知識共有（knowledge_sharing）
- 施設改善提案（facility_improvement）

**期待結果**: すべて `allowed: true`

### 2. violation-cases.json（異常系 50件）

**目的**: モデレーションでブロックすべき違反投稿

**違反タイプ別件数**:
- `personal_attack`（個人攻撃）: 3件
- `defamation`（誹謗中傷）: 7件
- `harassment`（ハラスメント）: 5件
- `discrimination`（差別）: 5件
- `privacy_violation`（プライバシー侵害）: 5件
- `inappropriate_content`（不適切コンテンツ）: 3件
- `threatening`（脅迫）: 3件
- `hate_speech`（ヘイトスピーチ）: 3件
- `misinformation`（誤情報）: 5件
- `spam`（スパム）: 5件
- `other`（その他）: 6件

**期待結果**: すべて `allowed: false`

### 3. edge-cases.json（境界値 30件）

**目的**: 判定が難しい微妙なケース

**カテゴリ**:
- 批判的だが建設的なフィードバック
- 強い表現だが正当な異議
- 感情的だが違反ではない表現
- 文脈依存の判定が必要なケース

**期待結果**: 文脈と建設性を考慮した適切な判定

### 4. medical-context-cases.json（医療表現 50件）

**目的**: 医療特有の表現の適切な判定

**カテゴリ**:
- 医療専門用語（clinical_description）
- 終末期医療（end_of_life_care）
- 精神科用語（psychiatric_assessment）
- 患者状態評価（patient_capacity_assessment）
- 不適切な患者表現（patient_disrespect）← ブロック対象

**期待結果**: 医療用語と不適切表現を正確に区別

## テストケースのフォーマット

```json
{
  "id": "normal-001",
  "content": "投稿内容のテキスト",
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
  "notes": "テストケースの説明"
}
```

### フィールド説明

| フィールド | 説明 |
|----------|------|
| `id` | テストケース一意識別子 |
| `content` | モデレーション対象のテキスト |
| `expectedResult.allowed` | 期待される判定結果（true/false） |
| `expectedResult.severity` | 期待される重大度（none/low/medium/high/critical） |
| `expectedResult.violations` | 期待される違反リスト |
| `context.postType` | 投稿タイプ（improvement/community/report） |
| `context.authorLevel` | 投稿者の権限レベル（1-18, 0.5刻み, 97-99） |
| `context.department` | 投稿者の部署 |
| `category` | テストケースのカテゴリ |
| `notes` | テスト観点の説明 |

## 使用方法

### 1. 自動テスト実行

```bash
# テストスクリプト実行（医療チーム側）
python test_llm_api.py --test-data ./mcp-shared/test-data/llm-moderation

# 結果比較
python compare_results.py --voicedrive-mock ./results/mock_llm.json \
                          --llama-3.2 ./results/llama_3.2.json
```

### 2. 手動テスト

各ファイルを順番にテスト：

1. **normal-cases.json**: すべて `allowed: true` を確認
2. **violation-cases.json**: すべて `allowed: false` を確認
3. **edge-cases.json**: 微妙なケースの判定精度を確認
4. **medical-context-cases.json**: 医療文脈の理解度を確認

### 3. 精度評価指標

#### 必須指標
- **Accuracy（正解率）**: 85%以上
- **Precision（適合率）**: 90%以上（false positiveを低く）
- **Recall（再現率）**: 95%以上（false negativeを低く）
- **F1 Score**: 92%以上

#### 違反タイプ別精度
各違反タイプで以下を達成：
- `personal_attack`: 90%以上
- `defamation`: 95%以上
- `harassment`: 90%以上
- `privacy_violation`: 100%（最重要）
- `misinformation`: 85%以上

#### 医療文脈理解
- 医療用語の誤判定: 5%以下
- 不適切な患者表現の検出: 95%以上

## テスト実施スケジュール

### Phase 1: 基本機能テスト（Week 5）
- [ ] normal-cases.json: 全件パステスト
- [ ] violation-cases.json: 全件ブロックテスト
- [ ] 基本精度評価

### Phase 2: 精度向上（Week 6）
- [ ] edge-cases.json: 境界値精度テスト
- [ ] medical-context-cases.json: 医療文脈テスト
- [ ] Few-shot learning調整

### Phase 3: 統合テスト（Week 7）
- [ ] MockLLMとの整合性検証
- [ ] パフォーマンステスト（1.5s以下）
- [ ] キャッシュ効果検証

### Phase 4: 本番準備（Week 8）
- [ ] 総合評価
- [ ] 最終調整
- [ ] デプロイメント

## 期待される結果

### MockLLM vs Llama 3.2 8B 整合性

| カテゴリ | 目標整合率 |
|---------|-----------|
| normal-cases | 95%以上 |
| violation-cases | 98%以上 |
| edge-cases | 80%以上 |
| medical-context | 90%以上 |

### パフォーマンス要件

- **平均応答時間**: 1.5秒以下
- **P95応答時間**: 2.5秒以下
- **タイムアウト**: 3秒
- **キャッシュヒット率**: 60%以上

## 不整合時の対応

### 判定結果の差異が発生した場合

1. **医療チーム側で調整**:
   - プロンプトエンジニアリング
   - Few-shot examplesの追加
   - 温度パラメータ調整

2. **VoiceDrive側で確認**:
   - MockLLMの判定ロジック見直し
   - テストケース自体の妥当性確認

3. **協議が必要なケース**:
   - edge-casesでの判定基準すり合わせ
   - 医療文脈の解釈確認
   - 新しい違反パターンの追加

## テストデータの更新

### 追加が推奨されるケース

1. **本番で誤検出が発生**: 即座にテストケースに追加
2. **新しい違反パターン発見**: violation-casesに追加
3. **医療用語の拡充**: medical-context-casesに追加

### 更新手順

```bash
# 1. 新規テストケース追加
vim mcp-shared/test-data/llm-moderation/{category}-cases.json

# 2. バリデーション
python validate_test_data.py

# 3. コミット
git add mcp-shared/test-data/llm-moderation/
git commit -m "test: 新規テストケース追加"

# 4. 医療チームへ通知
# Slack #llm-integration チャンネルに投稿
```

## サンプル実行結果

### 正常系テスト結果例

```json
{
  "testCase": "normal-001",
  "content": "電子カルテの入力画面で...",
  "expected": {
    "allowed": true,
    "severity": "none"
  },
  "actual": {
    "allowed": true,
    "severity": "none",
    "confidence": 98,
    "processingTime": 450
  },
  "result": "PASS"
}
```

### 異常系テスト結果例

```json
{
  "testCase": "violation-001",
  "content": "○○さんは本当に無能だと...",
  "expected": {
    "allowed": false,
    "severity": "high",
    "violations": ["personal_attack"]
  },
  "actual": {
    "allowed": false,
    "severity": "high",
    "confidence": 95,
    "violations": [
      {
        "type": "personal_attack",
        "severity": "high",
        "confidence": 95
      }
    ],
    "processingTime": 680
  },
  "result": "PASS"
}
```

## トラブルシューティング

### よくある問題

#### 1. 正常投稿が誤ってブロックされる（False Positive）

**原因**:
- 医療用語を攻撃的表現と誤認識
- 文脈理解の不足

**対策**:
- Few-shot examplesに医療用語例を追加
- システムプロンプトで医療文脈を強調

#### 2. 違反投稿を見逃す（False Negative）

**原因**:
- 間接的・婉曲的な表現の検出失敗
- 日本語特有のニュアンス理解不足

**対策**:
- 違反パターンのバリエーション拡充
- 温度パラメータ調整（より保守的に）

#### 3. 境界値ケースの判定がばらつく

**原因**:
- LLMの非決定性
- 判定基準の曖昧さ

**対策**:
- 温度パラメータを下げる（0.3以下）
- 明確な判定基準をプロンプトに組み込む

## 連絡先

### VoiceDrive開発チーム
- **Slack**: #llm-integration
- **担当**: システム開発部
- **対応時間**: 平日 9:00-18:00

### 医療チーム
- **Slack**: #medical-ai-team
- **担当**: 医療情報システム部
- **対応時間**: 平日 10:00-17:00

## 関連ドキュメント

- [LLM実装ガイド](../docs/LLM_Implementation_Guide_Medical_Team_20251004.md)
- [実装計画書](../docs/Medical_Team_LLM_Implementation_Plan_20251004.md)
- [VoiceDrive回答書](../docs/VoiceDrive_Response_to_Medical_Team_20251004.md)
- [キックオフ報告書](../docs/Kickoff_Report_LLM_Integration_20251004.md)
- [Phase 2統合ガイド](../../../docs/PHASE2_LLM_INTEGRATION.md)

---

**最終更新**: 2025年10月5日
**バージョン**: 1.0.0
**作成者**: VoiceDrive開発チーム
