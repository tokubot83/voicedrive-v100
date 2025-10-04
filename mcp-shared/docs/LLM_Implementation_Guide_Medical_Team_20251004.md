# 医療チーム向け LLM API実装ガイド - VoiceDrive MockLLM準拠版

**文書番号**: IMPL-GUIDE-2025-1004-006
**作成日**: 2025年10月4日
**作成者**: 医療職員管理システムチーム
**参照元**: VoiceDriveチーム MockLLMAPIServer実装
**対象読者**: 医療チームLLMエンジニア・API開発者
**重要度**: 🔴 最重要

---

## 📋 エグゼクティブサマリー

VoiceDriveチームのMockLLMサーバー実装を詳細に解析し、**医療チームが実装すべきLlama 3.2 8B API**の仕様を確定しました。

MockLLM実装は非常に高品質であり、これを**実装のゴールデンスタンダード**として、医療チームは以下を達成します：

1. **動作一貫性**: MockLLMと実LLMの応答が90%以上一致
2. **パフォーマンス**: MockLLM（300-800ms）より高速な1.5秒以内
3. **精度向上**: 信頼度スコア75-95%を安定的に達成

本ガイドでは、VoiceDrive MockLLMの優れた設計を踏襲しつつ、Llama 3.2 8Bの強力な文脈理解能力を活用する実装方法を示します。

---

## 目次

1. [VoiceDrive MockLLM実装の分析](#voicedrive-mockllm実装の分析)
2. [医療チーム実装アーキテクチャ](#医療チーム実装アーキテクチャ)
3. [Llama 3.2 8Bプロンプトエンジニアリング](#llama-32-8bプロンプトエンジニアリング)
4. [違反検出ロジックの実装](#違反検出ロジックの実装)
5. [信頼度スコア計算](#信頼度スコア計算)
6. [修正提案生成](#修正提案生成)
7. [パフォーマンス最適化](#パフォーマンス最適化)
8. [テスト戦略](#テスト戦略)
9. [実装チェックリスト](#実装チェックリスト)

---

## VoiceDrive MockLLM実装の分析

### 1.1 優れている点

#### ✅ 検出パターンの網羅性

**MockLLM実装**:
```typescript
private readonly MOCK_PATTERNS = {
  personal_attack: [
    /バカ|馬鹿|アホ|無能|役立たず/gi,
    /使えない|ダメ人間|クズ/gi
  ],
  defamation: [
    /悪口|中傷|嘘つき|詐欺師/gi,
    /信用できない|疑わしい/gi
  ],
  harassment: [
    /パワハラ|セクハラ|いじめ/gi,
    /辞めろ|クビ|追い出す/gi
  ],
  // ...
};
```

**学び**:
- 各違反タイプに複数の正規表現パターン
- 日本語の多様な表現を網羅
- 段階的な検出（軽微→重度）

**医療チームでの活用**:
```python
# これらのパターンをLlama 3.2 8Bの学習データとして活用
# Few-shot Learningのサンプル生成に利用
MOCK_PATTERNS_FOR_TRAINING = {
    'personal_attack': [
        "この投稿には「バカ」という個人攻撃的な表現が含まれています → personal_attack",
        "「無能」という言葉は特定個人への攻撃です → personal_attack",
        # VoiceDrive MockLLMのパターンから100件生成
    ]
}
```

#### ✅ 建設性スコアの計算

**MockLLM実装**:
```typescript
private calculateConstructiveScore(content: string): number {
  let score = 50;

  // ポジティブパターンでスコアアップ
  this.CONSTRUCTIVE_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      score += matches.length * 10;
    }
  });

  // 違反パターンでスコアダウン
  Object.values(this.MOCK_PATTERNS).forEach(patterns => {
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        score -= matches.length * 15;
      }
    });
  });

  return Math.max(0, Math.min(100, score));
}
```

**学び**:
- ベーススコア50から加減算
- ポジティブ +10点、ネガティブ -15点
- 0-100の範囲で正規化

**医療チームでの活用**:
```python
# Llama 3.2 8Bでの実装
def calculate_constructive_score_llm(content: str) -> int:
    """
    LLMを使った高度な建設性スコア計算
    MockLLMの単純パターンマッチングより精度向上
    """
    prompt = f"""
以下の投稿の建設性スコアを0-100で評価してください。

評価基準:
- 具体的な改善提案 +15点
- 協力的な姿勢 +10点
- 感謝の表現 +10点
- 個人攻撃 -20点
- 否定的表現 -15点
- 非建設的な批判 -10点

投稿内容:
{content}

スコア（0-100の数値のみ）:
"""

    response = ollama.generate(
        model='llama-3.2-8b',
        prompt=prompt,
        temperature=0.3  # 一貫性重視
    )

    # LLMからスコア抽出
    score = int(re.search(r'\d+', response['response']).group())
    return max(0, min(100, score))
```

#### ✅ 重大度の段階的判定

**MockLLM実装**:
```typescript
private calculateSeverity(
  violations: LLMViolation[],
  constructiveScore: number
): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  if (violations.length === 0 && constructiveScore >= 60) {
    return 'none';
  }

  if (violations.length === 0 && constructiveScore >= 40) {
    return 'low';
  }

  const hasCritical = violations.some(v => v.severity === 'critical');
  if (hasCritical) return 'critical';

  const hasHigh = violations.some(v => v.severity === 'high');
  if (hasHigh || violations.length >= 3) return 'high';

  const hasMedium = violations.some(v => v.severity === 'medium');
  if (hasMedium || violations.length >= 2) return 'medium';

  return 'low';
}
```

**学び**:
- 違反の有無と建設性スコアを総合判定
- 違反数による重大度エスカレーション
- 最も重い違反に引きずられる設計

**医療チームでの活用**:
```python
# 完全にMockLLMと同じロジックを実装
# 一貫性を最優先
def calculate_severity(
    violations: List[ViolationDetail],
    constructive_score: int
) -> str:
    """
    VoiceDrive MockLLMと完全一致するロジック
    """
    if len(violations) == 0 and constructive_score >= 60:
        return 'none'

    if len(violations) == 0 and constructive_score >= 40:
        return 'low'

    has_critical = any(v.severity == 'critical' for v in violations)
    if has_critical:
        return 'critical'

    has_high = any(v.severity == 'high' for v in violations)
    if has_high or len(violations) >= 3:
        return 'high'

    has_medium = any(v.severity == 'medium' for v in violations)
    if has_medium or len(violations) >= 2:
        return 'medium'

    return 'low'
```

#### ✅ 修正提案の具体性

**MockLLM実装**:
```typescript
private generateSuggestedEdits(content: string, violations: LLMViolation[]): string[] {
  const replacements: Record<string, string> = {
    'バカ': '改善の余地がある',
    '馬鹿': '検討が必要',
    'アホ': '再考が必要',
    '無能': '能力向上の機会がある',
    '役立たず': 'スキルアップが期待される',
    '使えない': '改善が必要',
    'ダメ人間': '成長の余地がある',
    'クズ': '改善が必要な点がある'
  };

  violations.forEach(violation => {
    if (violation.extractedText) {
      const replacement = replacements[violation.extractedText];
      if (replacement) {
        const newContent = content.replace(violation.extractedText, replacement);
        if (!suggestions.includes(newContent)) {
          suggestions.push(newContent);
        }
      }
    }
  });

  return suggestions.slice(0, 3);  // 最大3つの提案
}
```

**学び**:
- 具体的な置き換え表現の辞書
- 攻撃的表現を建設的表現に変換
- 最大3つの提案（過度にならない）

**医療チームでの活用**:
```python
# Llama 3.2 8Bでの高度な修正提案
def generate_suggested_edits_llm(
    content: str,
    violations: List[ViolationDetail]
) -> List[str]:
    """
    LLMを使った文脈を考慮した修正提案
    MockLLMの辞書ベースより自然
    """
    prompt = f"""
以下の投稿には問題のある表現が含まれています。
より建設的で尊重的な表現に書き換えてください。

元の投稿:
{content}

検出された問題:
{', '.join([v.description for v in violations])}

修正提案（最大3つ、各行に1つずつ）:
"""

    response = ollama.generate(
        model='llama-3.2-8b',
        prompt=prompt,
        temperature=0.7  # 創造性重視
    )

    suggestions = response['response'].strip().split('\n')
    return [s.strip() for s in suggestions if s.strip()][:3]
```

#### ✅ リアルな処理時間シミュレーション

**MockLLM実装**:
```typescript
private async simulateProcessingTime(): Promise<void> {
  const delay = 300 + Math.random() * 500;  // 300-800ms
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

**学び**:
- 実LLMの処理時間（300-800ms）を正確にシミュレート
- VoiceDriveチームのタイムアウト設定（3秒）の根拠

**医療チームの目標**:
```python
# 目標: MockLLMより高速
# 平均1.5秒（MockLLMの平均550msの約2.7倍）
# これは十分許容範囲（VoiceDrive要求は2秒以内）

# 実測値の期待値
EXPECTED_PROCESSING_TIMES = {
    'cache_hit': 50,        # キャッシュヒット時: 50ms
    'simple_content': 800,  # 単純な内容: 800ms
    'complex_content': 1500, # 複雑な内容: 1.5秒
    'edge_case': 2500       # エッジケース: 2.5秒（P95）
}
```

### 1.2 MockLLMとの一貫性テスト戦略

#### 回帰テスト

```python
# tests/regression_test_mock_vs_real.py

import pytest
from medical_llm_api import ModerationService
from voicedrive_mock import MockLLMAPIServer

@pytest.fixture
def mock_llm():
    return MockLLMAPIServer.getInstance()

@pytest.fixture
def real_llm():
    return ModerationService()

def test_consistency_with_mock(mock_llm, real_llm):
    """
    MockLLMと実LLMの一貫性テスト
    230件のテストケース全てで90%以上の一致率を目指す
    """
    test_cases = load_voicedrive_test_cases()  # 230件

    consistency_scores = []

    for case in test_cases:
        mock_result = mock_llm.moderate(case.content)
        real_result = real_llm.moderate(case.content)

        # 一貫性スコア計算
        consistency = calculate_consistency(mock_result, real_result)
        consistency_scores.append(consistency)

        # 重要な項目の一致を確認
        assert mock_result['allowed'] == real_result['allowed'], \
            f"allowed判定が不一致: {case.content}"

        assert abs(mock_result['confidence'] - real_result['confidence']) < 15, \
            f"信頼度スコアが15%以上乖離: {case.content}"

    # 全体の一貫性
    avg_consistency = sum(consistency_scores) / len(consistency_scores)
    assert avg_consistency >= 0.90, \
        f"一貫性スコアが90%未満: {avg_consistency:.2%}"

def calculate_consistency(mock_result, real_result) -> float:
    """
    2つの結果の一貫性スコアを計算（0.0-1.0）
    """
    score = 0.0

    # allowed判定が一致（30点）
    if mock_result['allowed'] == real_result['allowed']:
        score += 0.3

    # severity判定が一致（25点）
    if mock_result['severity'] == real_result['severity']:
        score += 0.25

    # confidence差が10%以内（25点）
    confidence_diff = abs(mock_result['confidence'] - real_result['confidence'])
    if confidence_diff <= 10:
        score += 0.25
    elif confidence_diff <= 20:
        score += 0.15

    # violations数が一致（20点）
    mock_violations = len(mock_result['violations'])
    real_violations = len(real_result['violations'])
    if mock_violations == real_violations:
        score += 0.20
    elif abs(mock_violations - real_violations) <= 1:
        score += 0.10

    return score
```

---

## 医療チーム実装アーキテクチャ

### 2.1 全体構成

```
┌─────────────────────────────────────────────┐
│         FastAPI Application                 │
├─────────────────────────────────────────────┤
│                                             │
│  🔌 API Endpoints                           │
│  ├─ POST /api/moderate                      │
│  ├─ POST /api/moderate/batch                │
│  ├─ GET  /api/health                        │
│  └─ GET  /api/metrics                       │
│                                             │
│  🧠 Moderation Service                      │
│  ├─ LLM Engine (Ollama + Llama 3.2 8B)     │
│  ├─ Prompt Templates                        │
│  ├─ Violation Detector                     │
│  ├─ Confidence Calculator                  │
│  └─ Suggestion Generator                   │
│                                             │
│  💾 Cache Layer (Redis)                     │
│  ├─ Response Cache (5min)                  │
│  ├─ Pattern Cache                          │
│  └─ Statistics Cache                       │
│                                             │
│  📊 Metrics & Logging                       │
│  ├─ Prometheus Metrics                     │
│  ├─ CloudWatch Logs                        │
│  └─ Performance Monitoring                 │
└─────────────────────────────────────────────┘
```

### 2.2 ファイル構成

```
medical-llm-api/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app
│   │   ├── routes/
│   │   │   ├── moderate.py            # POST /api/moderate
│   │   │   ├── batch.py               # POST /api/moderate/batch
│   │   │   ├── health.py              # GET /api/health
│   │   │   └── metrics.py             # GET /api/metrics
│   │   └── types.py                   # Pydantic models
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── moderation_service.py      # メインサービス
│   │   ├── llm_engine.py              # Ollama統合
│   │   ├── violation_detector.py     # 違反検出
│   │   ├── confidence_calculator.py  # 信頼度計算
│   │   └── suggestion_generator.py   # 修正提案生成
│   │
│   ├── prompts/
│   │   ├── __init__.py
│   │   ├── violation_detection.py    # 違反検出プロンプト
│   │   ├── constructive_score.py     # 建設性スコア
│   │   └── suggestion_generation.py  # 修正提案
│   │
│   ├── cache/
│   │   ├── __init__.py
│   │   └── redis_cache.py            # Redisキャッシュ
│   │
│   └── utils/
│       ├── __init__.py
│       ├── text_processor.py         # テキスト処理
│       └── medical_patterns.py       # 医療表現辞書
│
├── tests/
│   ├── unit/                          # 単体テスト
│   ├── integration/                   # 統合テスト
│   └── regression/                    # MockLLM一貫性テスト
│
├── data/
│   ├── patterns/
│   │   ├── voicedrive_mock_patterns.json  # MockLLMパターン
│   │   └── medical_expressions.json       # 医療表現1000件
│   └── training/
│       └── few_shot_samples.json          # Few-shot 100件
│
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## Llama 3.2 8Bプロンプトエンジニアリング

### 3.1 違反検出プロンプト

```python
# src/prompts/violation_detection.py

VIOLATION_DETECTION_PROMPT = """
あなたは医療法人のSNS投稿モデレーターです。
職員の投稿内容を分析し、11種類の違反タイプを検出してください。

医療現場特有の表現の考慮:
- 「この手技は厳しい」「夜勤は過酷」等は業務の難易度や労働環境の記述として正常と判定
- 「○○医師の指示が不明確」等、個人名を含むが建設的な指摘は警告レベル

投稿内容:
{content}

コンテキスト:
- 投稿タイプ: {post_type}
- 投稿者レベル: {author_level}
- 部署: {department}

11種類の違反タイプ:
1. personal_attack（個人攻撃）: 特定個人への攻撃的表現
2. defamation（誹謗中傷）: 根拠のない悪評
3. harassment（ハラスメント）: パワハラ・セクハラ等
4. discrimination（差別的表現）: 性別・年齢・国籍等による差別
5. privacy_violation（プライバシー侵害）: 個人情報の不適切な記載
6. inappropriate_content（不適切なコンテンツ）: 職場に不適切な内容
7. threatening（脅迫的表現）: 脅迫・威嚇
8. hate_speech（ヘイトスピーチ）: 憎悪・敵意の表現
9. misinformation（誤情報）: 虚偽情報・デマ
10. spam（スパム）: 宣伝・広告
11. other（その他）: 上記に該当しない問題

以下のJSON形式で回答してください（JSON以外の文章は不要）:
{{
  "violations": [
    {{
      "type": "personal_attack",
      "severity": "high",
      "description": "「バカ」という個人攻撃的な表現",
      "extractedText": "バカ",
      "startIndex": 10,
      "endIndex": 12,
      "confidence": 92
    }}
  ],
  "constructiveScore": 25,
  "reasoning": "個人攻撃的な表現が含まれています"
}}
"""

def create_violation_detection_prompt(
    content: str,
    post_type: str = 'improvement',
    author_level: int = 3,
    department: str = '看護部'
) -> str:
    """
    違反検出プロンプトを生成
    """
    return VIOLATION_DETECTION_PROMPT.format(
        content=content,
        post_type=post_type,
        author_level=author_level,
        department=department
    )
```

### 3.2 Few-shot Learning

```python
# data/training/few_shot_samples.json

FEW_SHOT_SAMPLES = [
    {
        "input": "夜勤のシフト調整方法を改善すべきです。現状は負担が大きいです。",
        "output": {
            "violations": [],
            "constructiveScore": 75,
            "reasoning": "建設的な改善提案です。業務負担の指摘は正常な表現です。"
        }
    },
    {
        "input": "○○さんはバカだから仕事ができない。",
        "output": {
            "violations": [
                {
                    "type": "personal_attack",
                    "severity": "high",
                    "description": "「バカ」という個人攻撃的な表現",
                    "extractedText": "バカ",
                    "startIndex": 5,
                    "endIndex": 7,
                    "confidence": 95
                }
            ],
            "constructiveScore": 10,
            "reasoning": "特定個人への攻撃的な表現が含まれています。"
        }
    },
    # ... 100件のサンプル
]

# Few-shot Learningを使ったプロンプト強化
def create_few_shot_prompt(content: str, num_examples: int = 5) -> str:
    """
    Few-shot サンプルを含むプロンプト生成
    """
    examples = random.sample(FEW_SHOT_SAMPLES, num_examples)

    examples_text = "\n\n".join([
        f"例{i+1}:\n入力: {ex['input']}\n出力: {json.dumps(ex['output'], ensure_ascii=False)}"
        for i, ex in enumerate(examples)
    ])

    return f"""
{examples_text}

実際の投稿を分析してください:
入力: {content}
出力:
"""
```

---

## 違反検出ロジックの実装

### 4.1 LLMエンジン

```python
# src/services/llm_engine.py

import ollama
import json
from typing import Dict, Any

class LLMEngine:
    def __init__(self):
        self.model = 'llama-3.2-8b'
        self.default_temperature = 0.3  # 一貫性重視

    def generate(
        self,
        prompt: str,
        temperature: float = None,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Llama 3.2 8Bで推論実行
        """
        response = ollama.generate(
            model=self.model,
            prompt=prompt,
            options={
                'temperature': temperature or self.default_temperature,
                'num_predict': max_tokens,
                'top_p': 0.9,
                'top_k': 40
            }
        )

        return response

    def extract_json(self, response_text: str) -> Dict[str, Any]:
        """
        LLMレスポンスからJSON抽出
        """
        # コードブロックを削除
        text = response_text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]

        # JSON部分のみ抽出
        start = text.find('{')
        end = text.rfind('}') + 1
        json_text = text[start:end]

        return json.loads(json_text)
```

### 4.2 違反検出サービス

```python
# src/services/violation_detector.py

from src.services.llm_engine import LLMEngine
from src.prompts.violation_detection import create_violation_detection_prompt
from src.api.types import ViolationDetail
from typing import List, Tuple

class ViolationDetector:
    def __init__(self):
        self.llm = LLMEngine()

    def detect(
        self,
        content: str,
        post_type: str = 'improvement',
        author_level: int = 3,
        department: str = '看護部'
    ) -> Tuple[List[ViolationDetail], int, str]:
        """
        違反検出を実行

        Returns:
            violations: 検出された違反リスト
            constructive_score: 建設性スコア（0-100）
            reasoning: 判定理由
        """
        # プロンプト生成
        prompt = create_violation_detection_prompt(
            content, post_type, author_level, department
        )

        # LLM推論
        response = self.llm.generate(prompt)
        result = self.llm.extract_json(response['response'])

        # 違反リスト構築
        violations = [
            ViolationDetail(**v)
            for v in result.get('violations', [])
        ]

        # 建設性スコア
        constructive_score = result.get('constructiveScore', 50)

        # 判定理由
        reasoning = result.get('reasoning', '')

        return violations, constructive_score, reasoning
```

---

## 信頼度スコア計算

### 5.1 VoiceDrive MockLLM準拠の実装

```python
# src/services/confidence_calculator.py

from typing import List
from src.api.types import ViolationDetail

class ConfidenceCalculator:
    """
    VoiceDrive MockLLMと完全一致するロジック
    """

    def calculate(
        self,
        violations: List[ViolationDetail],
        content: str
    ) -> int:
        """
        信頼度スコアを計算（0-100）

        MockLLMと同じロジック:
        - 違反なし: テキスト長に応じて70-95%
        - 違反あり: 違反の平均信頼度
        """
        if len(violations) == 0:
            # 違反なしの場合、テキストが長いほど信頼度が高い
            base_confidence = 70
            length_bonus = min(25, (len(content) // 50) * 5)
            return base_confidence + length_bonus

        # 違反ありの場合、違反の平均信頼度
        avg_confidence = sum(v.confidence for v in violations) / len(violations)
        return round(avg_confidence)

    def calculate_pattern_confidence(self, matched_text: str) -> int:
        """
        パターンマッチの信頼度を計算

        MockLLMと同じロジック:
        - ベース信頼度75%
        - マッチ文字列が長いほど +20%まで
        """
        base_confidence = 75
        length_bonus = min(20, len(matched_text) * 2)
        return min(95, base_confidence + length_bonus)
```

---

## 修正提案生成

### 6.1 LLMベースの高度な提案

```python
# src/services/suggestion_generator.py

from src.services.llm_engine import LLMEngine
from src.api.types import ViolationDetail
from typing import List

class SuggestionGenerator:
    def __init__(self):
        self.llm = LLMEngine()

    def generate(
        self,
        content: str,
        violations: List[ViolationDetail]
    ) -> List[str]:
        """
        修正提案を生成（最大3つ）

        MockLLMの辞書ベースより文脈を考慮した自然な提案
        """
        if len(violations) == 0:
            return []

        # 違反内容をまとめる
        violation_descriptions = [
            f"- {v.description}（「{v.extractedText}」）"
            for v in violations
            if v.extractedText
        ]

        prompt = f"""
以下の投稿には問題のある表現が含まれています。
より建設的で尊重的な表現に書き換えた修正案を3つ提案してください。

元の投稿:
{content}

検出された問題:
{chr(10).join(violation_descriptions)}

修正提案のルール:
1. 元の投稿の意図を保持する
2. 攻撃的表現を建設的表現に置き換える
3. 個人名は「担当者」「関係者」等に一般化
4. 具体的な改善提案を含める

修正提案（最大3つ、各行に1つずつ、番号不要）:
"""

        response = self.llm.generate(
            prompt,
            temperature=0.7  # 創造性重視
        )

        # 提案を抽出
        suggestions = [
            line.strip()
            for line in response['response'].strip().split('\n')
            if line.strip() and not line.strip().startswith('#')
        ]

        return suggestions[:3]  # 最大3つ
```

---

## パフォーマンス最適化

### 7.1 レスポンスキャッシュ

```python
# src/cache/redis_cache.py

import redis
import hashlib
import json
from typing import Optional, Dict, Any

class ResponseCache:
    def __init__(self):
        self.redis_client = redis.Redis(
            host='localhost',
            port=6379,
            db=0,
            decode_responses=True
        )
        self.ttl = 300  # 5分間（VoiceDrive仕様）

    def get_cache_key(self, content: str) -> str:
        """
        コンテンツのハッシュ値をキャッシュキーとする
        """
        return f"llm:moderation:{hashlib.sha256(content.encode()).hexdigest()}"

    def get(self, content: str) -> Optional[Dict[str, Any]]:
        """
        キャッシュから取得
        """
        key = self.get_cache_key(content)
        cached = self.redis_client.get(key)

        if cached:
            return json.loads(cached)
        return None

    def set(self, content: str, result: Dict[str, Any]) -> None:
        """
        キャッシュに保存（5分間）
        """
        key = self.get_cache_key(content)
        self.redis_client.setex(
            key,
            self.ttl,
            json.dumps(result, ensure_ascii=False)
        )

    def clear_old_entries(self) -> None:
        """
        古いキャッシュエントリを削除（自動実行）
        """
        # Redisの自動期限切れに任せる
        pass
```

### 7.2 バッチ処理

```python
# src/services/batch_moderation_service.py

from typing import List, Dict, Any
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from src.services.moderation_service import ModerationService

class BatchModerationService:
    def __init__(self):
        self.moderation_service = ModerationService()
        self.max_workers = 5  # 最大5件の並列処理

    def moderate_batch(
        self,
        requests: List[Dict[str, Any]],
        max_batch_size: int = 10
    ) -> Dict[str, Any]:
        """
        バッチ処理（最大10件）

        並列化により処理時間を60-70%に短縮
        """
        if len(requests) > max_batch_size:
            raise ValueError(f"バッチサイズは{max_batch_size}件以下にしてください")

        start_time = time.time()
        results = []

        # 並列処理
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_req = {
                executor.submit(
                    self.moderation_service.moderate,
                    req['content'],
                    req.get('context'),
                    req.get('options')
                ): req['postId']
                for req in requests
            }

            for future in as_completed(future_to_req):
                post_id = future_to_req[future]
                try:
                    result = future.result()
                    results.append({
                        'postId': post_id,
                        **result
                    })
                except Exception as e:
                    results.append({
                        'postId': post_id,
                        'error': str(e)
                    })

        total_time = (time.time() - start_time) * 1000  # ミリ秒

        return {
            'results': results,
            'totalProcessingTime': total_time,
            'metadata': {
                'batchSize': len(requests),
                'successCount': len([r for r in results if 'error' not in r]),
                'failureCount': len([r for r in results if 'error' in r])
            }
        }
```

---

## テスト戦略

### 8.1 MockLLM一貫性テスト

```python
# tests/regression/test_mock_consistency.py

import pytest
from src.services.moderation_service import ModerationService

# VoiceDriveのテストケース230件をロード
VOICEDRIVE_TEST_CASES = load_test_cases('voicedrive_230_cases.json')

@pytest.mark.parametrize("test_case", VOICEDRIVE_TEST_CASES)
def test_consistency_with_mock(test_case):
    """
    各テストケースでMockLLMとの一貫性を確認
    """
    service = ModerationService()

    # 実LLMで判定
    result = service.moderate(test_case.content)

    # MockLLMの期待値と比較
    mock_expected = test_case.mock_result

    # 重要項目の一致確認
    assert result['allowed'] == mock_expected['allowed'], \
        f"allowed判定が不一致"

    # 信頼度スコアの許容誤差15%
    confidence_diff = abs(result['confidence'] - mock_expected['confidence'])
    assert confidence_diff < 15, \
        f"信頼度スコアが15%以上乖離: {confidence_diff}%"

    # 一貫性スコア計算
    consistency = calculate_consistency(result, mock_expected)
    assert consistency >= 0.85, \
        f"一貫性スコアが85%未満: {consistency:.2%}"
```

### 8.2 パフォーマンステスト

```python
# tests/performance/test_response_time.py

import pytest
import time
from src.services.moderation_service import ModerationService

def test_average_response_time():
    """
    平均応答時間が1.5秒以内
    """
    service = ModerationService()
    test_contents = load_test_contents(100)  # 100件

    times = []
    for content in test_contents:
        start = time.time()
        service.moderate(content)
        elapsed = (time.time() - start) * 1000  # ミリ秒
        times.append(elapsed)

    avg_time = sum(times) / len(times)
    assert avg_time < 1500, \
        f"平均応答時間が1.5秒を超過: {avg_time:.1f}ms"

def test_p95_response_time():
    """
    P95応答時間が2.5秒以内
    """
    service = ModerationService()
    test_contents = load_test_contents(100)

    times = []
    for content in test_contents:
        start = time.time()
        service.moderate(content)
        elapsed = (time.time() - start) * 1000
        times.append(elapsed)

    times.sort()
    p95_time = times[int(len(times) * 0.95)]
    assert p95_time < 2500, \
        f"P95応答時間が2.5秒を超過: {p95_time:.1f}ms"
```

---

## 実装チェックリスト

### Week 5-6: 基盤・コア機能

- [ ] FastAPIプロジェクト初期化
- [ ] Ollama + Llama 3.2 8Bインストール
- [ ] `/api/moderate` エンドポイント実装
- [ ] Pydantic型定義（VoiceDrive TypeScript型と一致）
- [ ] LLMEngine実装
- [ ] 違反検出プロンプト作成（11種類）
- [ ] ViolationDetector実装
- [ ] ConfidenceCalculator実装（MockLLM準拠）
- [ ] SuggestionGenerator実装
- [ ] 医療現場特有表現辞書作成（1000パターン）
- [ ] Few-shot Learningサンプル作成（100件）

### Week 7: 最適化

- [ ] Redisキャッシュ実装
- [ ] バッチ処理API実装
- [ ] パフォーマンステスト実施
  - [ ] 平均応答時間 < 1.5秒
  - [ ] P95応答時間 < 2.5秒
- [ ] キャッシュヒット率測定（> 30%目標）

### Week 8: セキュリティ・ドキュメント

- [ ] API Key認証実装
- [ ] IPアドレス制限実装
- [ ] データ即時削除ポリシー実装
- [ ] ヘルスチェックAPI実装
- [ ] メトリクスAPI実装
- [ ] API仕様書作成
- [ ] 運用マニュアル作成

### Week 9-12: テスト

- [ ] MockLLM一貫性テスト（230件）
  - [ ] 一貫性スコア > 90%
- [ ] パフォーマンステスト合格
- [ ] 負荷テスト合格（24時間稼働）
- [ ] セキュリティ監査合格

---

## 📞 サポート・質問

### VoiceDriveチームへの質問

- MockLLMの特定パターンの意図確認
- テストケースの追加依頼
- 一貫性テストの結果共有

### 医療チーム内連絡

- LLMエンジニア: 鈴木一郎（llm@medical-team.local）
- API開発責任者: 佐藤花子（api@medical-team.local）

---

**文書終了**

*VoiceDriveチームの優れたMockLLM実装を参考に、より高精度なLlama 3.2 8B APIを実装します。*
*両チームの協力により、安全で建設的なSNS環境を実現しましょう！*

**🤖 医療職員管理システムチーム - LLMエンジニアリング部門**
**作成日**: 2025年10月4日
**参照**: VoiceDriveチーム MockLLMAPIServer実装
