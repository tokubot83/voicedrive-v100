# LLMコンテンツモデレーション統合 実装キックオフ報告書

**文書番号**: IMPL-KICKOFF-2025-1005-001
**作成日**: 2025年10月5日
**作成者**: 医療職員管理システムチーム
**宛先**: VoiceDriveチーム・医療チーム・経営陣
**重要度**: 🔴 最重要

---

## 📋 エグゼクティブサマリー

VoiceDrive SNS機能の**LLMコンテンツモデレーション統合プロジェクト**が本日（2025年10月5日）正式にキックオフしました。

### 🎯 プロジェクト概要

**目的**: VoiceDriveの投稿コンテンツを、医療システム側のLlama 3.2 8B ローカルLLMで自動検閲し、個人攻撃・誹謗中傷を未然防止

**期間**: 2025年10月5日 〜 11月5日（4週間）

**目標**:
- **精度**: Overall Accuracy ≥ 90%
- **パフォーマンス**: 平均応答時間 ≤ 1.5秒
- **コスト**: 運用費ゼロ（既存LLM基盤活用）

---

## 📊 プロジェクト進捗状況

### Phase 1完了: 設計・仕様確定（10/4-10/5）✅

| 項目 | 状態 | 完了日 |
|------|------|--------|
| 提案書作成 | ✅ 完了 | 10/4 |
| 実装計画策定 | ✅ 完了 | 10/4 |
| TypeScript型定義確認 | ✅ 完了 | 10/4 |
| テストデータ提供（230件） | ✅ 完了 | 10/5 |
| Pydantic型定義作成 | ✅ 完了 | 10/5 |
| プロジェクト構造作成 | ✅ 完了 | 10/5 |
| LLMEngine実装 | ✅ 完了 | 10/5 |
| 違反検出プロンプト作成 | ✅ 完了 | 10/5 |

### Phase 2予定: コア機能実装（10/6-10/12）

| 項目 | 担当 | 期限 | 状態 |
|------|------|------|------|
| /api/moderate エンドポイント実装 | 医療チーム | 10/8 | 🔄 次週 |
| ModerationService実装 | 医療チーム | 10/9 | 🔄 次週 |
| 基本機能テスト（normal-cases 100件） | 医療チーム | 10/10 | 🔄 次週 |
| 違反検出テスト（violation-cases 50件） | 医療チーム | 10/11 | 🔄 次週 |
| Week 5進捗報告 | 医療チーム | 10/12 | 🔄 次週 |

---

## 🎉 本日の成果物

### 1. **Pydantic型定義**（VoiceDrive TypeScript型と完全一致）

**ファイル**: `medical-llm-api/src/api/types.py`

```python
# VoiceDrive TypeScriptの11種類の違反タイプをEnum化
class LLMViolationType(str, Enum):
    PERSONAL_ATTACK = "personal_attack"
    DEFAMATION = "defamation"
    HARASSMENT = "harassment"
    DISCRIMINATION = "discrimination"
    PRIVACY_VIOLATION = "privacy_violation"
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    THREATENING = "threatening"
    HATE_SPEECH = "hate_speech"
    MISINFORMATION = "misinformation"
    SPAM = "spam"
    OTHER = "other"

# リクエスト/レスポンス型も完全一致
class LLMModerationRequest(BaseModel):
    content: str
    context: Optional[ModerationContext]
    options: Optional[ModerationOptions]

class LLMModerationResult(BaseModel):
    allowed: bool
    severity: Literal['none', 'low', 'medium', 'high', 'critical']
    confidence: int  # 0-100
    violations: List[LLMViolation]
    explanation: Optional[str]
    suggestedEdits: Optional[List[str]]
    metadata: ModerationMetadata
```

**対応完了**:
- ✅ 11種類の違反タイプ
- ✅ リクエスト/レスポンス形式
- ✅ バッチ処理型
- ✅ ヘルスチェック型
- ✅ メトリクス型

### 2. **LLMEngine**（Ollama + Llama 3.2 8B統合）

**ファイル**: `medical-llm-api/src/services/llm_engine.py`

```python
class LLMEngine:
    """Llama 3.2 8B推論エンジン"""

    def __init__(
        self,
        model: str = "llama3.2:8b",
        default_temperature: float = 0.3,  # 一貫性重視
        host: str = "http://localhost:11434"
    ):
        self.client = ollama.Client(host=host)

    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Llama 3.2 8Bで推論実行"""
        response = self.client.generate(
            model=self.model,
            prompt=prompt,
            options={
                'temperature': self.default_temperature,
                'num_predict': 1000,
                'top_p': 0.9,
                'top_k': 40
            }
        )
        return response

    def extract_json(self, response_text: str) -> Dict[str, Any]:
        """LLMレスポンスからJSON抽出"""
        # コードブロック除去、JSON部分のみ抽出
        # ...

    def check_health(self) -> bool:
        """Ollamaサーバーの健全性チェック"""
        # ...
```

**機能**:
- ✅ Ollama統合（pip install ollama）
- ✅ JSON抽出（```json ブロック対応）
- ✅ スコア抽出
- ✅ ヘルスチェック
- ✅ モデル情報取得

### 3. **違反検出プロンプト**（11種類の違反タイプ対応）

**ファイル**: `medical-llm-api/src/prompts/violation_detection.py`

```python
VIOLATION_DETECTION_PROMPT = """あなたは医療法人のSNS投稿モデレーターです。
職員の投稿内容を分析し、11種類の違反タイプを検出してください。

【重要】医療現場特有の表現への配慮:
- 「この手技は厳しい」「夜勤は過酷」等は業務の難易度や労働環境の記述として正常と判定
- 「○○医師の指示が不明確」等、個人名を含むが建設的な指摘は警告レベル（medium）

【投稿内容】
{content}

【11種類の違反タイプ】
1. personal_attack（個人攻撃）
2. defamation（誹謗中傷）
3. harassment（ハラスメント）
4. discrimination（差別的表現）
5. privacy_violation（プライバシー侵害）
6. inappropriate_content（不適切なコンテンツ）
7. threatening（脅迫的表現）
8. hate_speech（ヘイトスピーチ）
9. misinformation（誤情報）
10. spam（スパム）
11. other（その他）

【出力形式】
JSON形式で回答（例: {"violations": [...], "constructiveScore": 75, "reasoning": "..."}）
"""
```

**特徴**:
- ✅ 医療現場特有表現への配慮（誤検知防止）
- ✅ Few-shot Learning サンプル5件付属
- ✅ 建設性スコア評価基準明記
- ✅ JSON形式出力指定

### 4. **プロジェクト構造**

```
medical-llm-api/
├── src/
│   ├── api/
│   │   ├── types.py              ✅ 完了
│   │   └── routes/               🔄 次週実装
│   ├── services/
│   │   ├── llm_engine.py         ✅ 完了
│   │   ├── moderation_service.py 🔄 次週実装
│   │   └── violation_detector.py 🔄 次週実装
│   ├── prompts/
│   │   └── violation_detection.py ✅ 完了
│   ├── cache/                    🔄 Week 7実装
│   └── utils/                    🔄 Week 6実装
├── tests/
│   ├── unit/                     🔄 Week 6実装
│   ├── integration/              🔄 Week 7実装
│   └── regression/               🔄 Week 6実装
└── data/
    ├── patterns/                 🔄 Week 6実装
    └── training/                 🔄 Week 6実装
```

---

## 📂 VoiceDriveチーム提供のテストデータ

### テストデータ概要

**場所**: `C:\projects\voicedrive-v100\mcp-shared\test-data\llm-moderation\`

| ファイル名 | テスト件数 | サイズ | 目的 |
|-----------|----------|--------|------|
| `normal-cases.json` | 100件 | 53 KB | 正常系（全て許可すべき投稿） |
| `violation-cases.json` | 50件 | 33 KB | 異常系（全てブロックすべき投稿） |
| `edge-cases.json` | 30件 | 15 KB | 境界値（判定が難しいケース） |
| `medical-context-cases.json` | 50件 | 25 KB | 医療文脈（医療特有の表現） |
| `README.md` | - | 9.6 KB | 使用方法・評価基準 |
| **合計** | **230件** | **137 KB** | **包括的テストカバレッジ** |

### 違反タイプ別内訳（violation-cases 50件）

| 違反タイプ | 件数 | 重要度 |
|-----------|------|--------|
| `defamation`（誹謗中傷） | 7件 | 最高 |
| `privacy_violation`（プライバシー侵害） | 5件 | 最高 |
| `threatening`（脅迫） | 3件 | 最高 |
| `hate_speech`（ヘイトスピーチ） | 3件 | 最高 |
| `harassment`（ハラスメント） | 5件 | 高 |
| `discrimination`（差別） | 5件 | 高 |
| `personal_attack`（個人攻撃） | 3件 | 高 |
| `misinformation`（誤情報） | 5件 | 高 |
| `inappropriate_content`（不適切コンテンツ） | 3件 | 中 |
| `spam`（スパム） | 5件 | 中 |
| `other`（その他） | 6件 | 可変 |

---

## 🎯 達成目標（Week 5-8）

### 精度目標

| 指標 | 目標値 | 最低ライン |
|------|--------|-----------|
| **Overall Accuracy** | 90%以上 | 85%以上 |
| **Precision（適合率）** | 92%以上 | 90%以上 |
| **Recall（再現率）** | 95%以上 | 95%以上 |
| **F1 Score** | 93%以上 | 92%以上 |

### 違反タイプ別精度目標

| 違反タイプ | 目標精度 | 優先度 |
|-----------|---------|--------|
| `privacy_violation` | **100%** | 最高（患者情報保護） |
| `defamation` | 95%以上 | 最高 |
| `threatening` | 95%以上 | 最高 |
| `hate_speech` | 95%以上 | 最高 |
| `personal_attack` | 90%以上 | 高 |
| `harassment` | 90%以上 | 高 |

### パフォーマンス目標

| 指標 | 目標値 |
|------|--------|
| **平均応答時間** | 1.5秒以下 |
| **P95応答時間** | 2.5秒以下 |
| **P99応答時間** | 3.0秒以下 |
| **タイムアウト率** | 1%以下 |
| **キャッシュヒット率** | 60%以上 |

### MockLLM整合性目標

| カテゴリ | 整合率目標 |
|---------|-----------|
| normal-cases | 95%以上 |
| violation-cases | 98%以上 |
| edge-cases | 80%以上 |
| medical-context | 90%以上 |

---

## 📅 詳細スケジュール

### Week 5（10/6-10/12）: コア機能実装

| 日付 | タスク | 担当 | 成果物 |
|------|--------|------|--------|
| 10/6（日） | キックオフMTG | 両チーム | キックオフ資料 |
| 10/7（月） | FastAPI main.py実装 | 医療チーム | FastAPIアプリ |
| 10/8（火） | /api/moderate エンドポイント実装 | 医療チーム | APIエンドポイント |
| 10/9（水） | ModerationService実装 | 医療チーム | モデレーションサービス |
| 10/10（木） | 基本機能テスト（normal-cases） | 医療チーム | テスト結果 |
| 10/11（金） | 違反検出テスト（violation-cases） | 医療チーム | テスト結果 |
| 10/12（土） | Week 5進捗報告作成 | 医療チーム | 進捗レポート |

### Week 6（10/13-10/19）: 精度向上

| 日付 | タスク | 担当 | 成果物 |
|------|--------|------|--------|
| 10/13（日） | Few-shot Learning調整 | 医療チーム | 調整済みプロンプト |
| 10/14（月） | 境界値テスト（edge-cases） | 医療チーム | テスト結果 |
| 10/15（火） | 医療文脈テスト（medical-context） | 医療チーム | テスト結果 |
| 10/16（水） | MockLLM整合性検証 | 医療チーム | 整合性レポート |
| 10/17（木） | プロンプト改善・精度向上 | 医療チーム | 改善版プロンプト |
| 10/18（金） | 全230件総合テスト | 医療チーム | 総合結果 |
| 10/19（土） | Week 6進捗報告作成 | 医療チーム | 進捗レポート |

### Week 7（10/20-10/26）: 統合テスト

| 日付 | タスク | 担当 | 成果物 |
|------|--------|------|--------|
| 10/20（日） | Redisキャッシュ実装 | 医療チーム | キャッシュ機能 |
| 10/21（月） | パフォーマンステスト（応答時間） | 医療チーム | パフォーマンスレポート |
| 10/22（火） | 負荷テスト（同時リクエスト） | 医療チーム | 負荷テストレポート |
| 10/23（水） | VoiceDrive統合テスト | 両チーム | 統合結果 |
| 10/24（木） | エラーハンドリングテスト | 医療チーム | エラー処理確認 |
| 10/25（金） | 統合テスト調整・修正 | 両チーム | 修正完了 |
| 10/26（土） | Week 7進捗報告作成 | 医療チーム | 進捗レポート |

### Week 8（10/27-11/2）: 本番準備

| 日付 | タスク | 担当 | 成果物 |
|------|--------|------|--------|
| 10/27（日） | 最終評価レポート作成開始 | 医療チーム | ドラフト |
| 10/28（月） | 本番環境構築 | 医療チーム | 本番環境 |
| 10/29（火） | 監視体制確立 | 医療チーム | 監視ダッシュボード |
| 10/30（水） | ドキュメント整備 | 医療チーム | 運用マニュアル |
| 10/31（木） | 最終レビュー | 両チーム | レビュー完了 |
| 11/1（金） | 最終評価レポート提出 | 医療チーム | 最終レポート |
| 11/2（土） | リリース判定会議準備 | 両チーム | 判定資料 |

### 11/5（月）: 本番デプロイ判定会議

---

## 💰 期待効果

### コスト削減効果

| 項目 | 従来方式 | 本提案 | 削減効果 |
|------|---------|--------|---------|
| **初期開発費** | 300-500万円 | 0円 | **100%削減** |
| **月額運用費** | 5-10万円 | 0円 | **100%削減** |
| **年間運用費** | 60-120万円 | 0円 | **100%削減** |
| **5年間総コスト** | 600-900万円 | 0円 | **100%削減** |

### 業務効率化効果

| 指標 | 改善前 | 改善後 | 効果 |
|------|--------|--------|------|
| 投稿チェック時間 | 5分/件 | < 2秒/件 | **99.3%短縮** |
| 不適切投稿検知率 | 60%（人力） | 95%（AI） | **58%向上** |
| 24時間対応 | 不可 | 可能 | **常時監視** |

---

## 🤝 両チームの役割分担

### 医療チーム（実装担当）

- ✅ Llama 3.2 8B モデレーションAPI実装
- ✅ Pydantic型定義作成
- ✅ LLMEngine開発
- ✅ プロンプトエンジニアリング
- 🔄 ModerationService実装（次週）
- 🔄 テスト実施・精度検証（次週〜）
- 🔄 パフォーマンス最適化（Week 7）
- 🔄 本番環境構築（Week 8）

### VoiceDriveチーム（サポート・統合担当）

- ✅ テストデータ提供（230件）
- ✅ TypeScript型定義提供
- ✅ MockLLM実装提供
- 🔄 技術質問対応（継続）
- 🔄 週次ミーティング参加（継続）
- 🔄 統合テスト実施（Week 7）
- 🔄 最終レビュー（Week 8）

---

## 📞 サポート体制

### Slackチャンネル

**#llm-integration**
- 質問・相談随時対応
- 対応時間: 平日9:00-18:00
- 初回返信: 30分以内目標

### 週次ミーティング

**毎週金曜15:00-16:00**
- 進捗確認
- 課題共有
- 次週計画

### 緊急連絡

**内線**: XXX-XXXX
**対応時間**: 平日9:00-21:00

---

## 📈 リスク管理

### 想定リスクと対策

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|---------|------|
| 精度目標未達 | 高 | 中 | Week 6で早期検知、プロンプト調整、Few-shot追加 |
| パフォーマンス未達 | 中 | 低 | モデル最適化、キャッシュ戦略、インフラスケールアップ |
| MockLLM整合性低下 | 中 | 中 | 判定基準すり合わせ、合同レビュー会 |
| スケジュール遅延 | 中 | 低 | 早期エスカレーション、リソース追加投入 |

### エスカレーション基準

以下の状況が発生した場合、即座にプロジェクトリードへ報告：

1. **精度が目標の80%を下回る**（Week 6時点）
2. **平均応答時間が2.5秒を超える**（Week 7時点）
3. **タイムアウト率が5%を超える**
4. **プライバシー侵害検出精度が95%を下回る**（最重要）
5. **スケジュール遅延が3日以上発生**

---

## 📝 提出成果物一覧

### Week 5成果物（10/12提出）

- [ ] Week 5進捗報告（Markdown）
- [ ] 基本機能テスト結果（JSON + レポート）
- [ ] normal-cases 100件テスト結果
- [ ] violation-cases 50件テスト結果
- [ ] 初期精度測定レポート

### Week 6成果物（10/19提出）

- [ ] Week 6進捗報告（Markdown）
- [ ] 精度向上テスト結果（JSON + レポート）
- [ ] edge-cases 30件テスト結果
- [ ] medical-context 50件テスト結果
- [ ] MockLLM整合性検証レポート
- [ ] 全230件総合テスト結果

### Week 7成果物（10/26提出）

- [ ] Week 7進捗報告（Markdown）
- [ ] 統合テスト結果（JSON + レポート）
- [ ] パフォーマンステスト結果
- [ ] 負荷テスト結果
- [ ] VoiceDrive統合テスト結果

### Week 8成果物（11/2提出）

- [ ] 最終評価レポート（Markdown + PDF）
- [ ] 運用マニュアル
- [ ] API仕様書
- [ ] 本番環境構築報告書

---

## 🎉 次のアクション

### 医療チーム（今週末〜来週）

| アクション | 期限 | 優先度 |
|-----------|------|--------|
| キックオフMTG参加 | 10/6（日） | 最高 |
| FastAPI main.py実装開始 | 10/7（月） | 高 |
| /api/moderate エンドポイント実装 | 10/8（火） | 高 |
| ModerationService実装 | 10/9（水） | 高 |
| 基本機能テスト実施 | 10/10-11 | 高 |
| Week 5進捗報告提出 | 10/12（金） | 高 |

### VoiceDriveチーム（今週末〜来週）

| アクション | 期限 | 優先度 |
|-----------|------|--------|
| キックオフMTG開催 | 10/6（日） | 最高 |
| MockLLM結果データ提供 | 10/7（月） | 高 |
| 技術質問対応（Slack #llm-integration） | 随時 | 高 |
| 週次MTG参加 | 10/12（金）15:00 | 高 |

---

## 📚 参照ドキュメント

### 既存ドキュメント（VoiceDrive側）

1. **提案書**: `VoiceDrive_Content_Moderation_Proposal_20251004.md`
2. **実装計画**: `LLM_Moderation_API_Implementation_Plan_20251004.md`
3. **実装ガイド**: `Medical_Team_LLM_Implementation_Guide_20251004.md`
4. **統合テスト依頼書**: `Test_Request_to_Medical_Team_20251005.md`

### 新規作成ドキュメント（本日作成）

5. **本ドキュメント**: `Medical_Team_Kickoff_Report_20251005.md`

### 実装ファイル（本日作成）

6. **Pydantic型定義**: `medical-llm-api/src/api/types.py`
7. **LLMEngine**: `medical-llm-api/src/services/llm_engine.py`
8. **違反検出プロンプト**: `medical-llm-api/src/prompts/violation_detection.py`

---

## 📊 プロジェクトKPI（11/5判定時点）

### 必須達成項目（Must）

- ✅ Overall Accuracy ≥ 85%
- ✅ Precision ≥ 90%
- ✅ Recall ≥ 95%
- ✅ F1 Score ≥ 92%
- ✅ プライバシー侵害検出精度 = 100%
- ✅ 平均応答時間 ≤ 1.5秒
- ✅ タイムアウト率 ≤ 1%

### 推奨達成項目（Should）

- 🎯 Overall Accuracy ≥ 90%
- 🎯 MockLLM整合率 ≥ 90%
- 🎯 医療文脈理解度 ≥ 90%
- 🎯 キャッシュヒット率 ≥ 60%

---

## ✅ 本日の達成状況

| 項目 | 状態 | 備考 |
|------|------|------|
| プロジェクト構造作成 | ✅ 完了 | medical-llm-api/ |
| Pydantic型定義 | ✅ 完了 | VoiceDrive TypeScript型と完全一致 |
| LLMEngine実装 | ✅ 完了 | Ollama統合完了 |
| 違反検出プロンプト | ✅ 完了 | 11種類対応、Few-shot 5件 |
| テストデータ確認 | ✅ 完了 | 230件確認済み |
| キックオフ報告書 | ✅ 完了 | 本ドキュメント |

**進捗率**: Phase 1 100%完了 🎉

---

## 🙏 謝辞

VoiceDriveチームの皆様、高品質なテストデータ（230件）とMockLLM実装の提供、誠にありがとうございました。

医療チーム一同、VoiceDriveチームとの協業により、安全で建設的なSNS環境の実現に全力で取り組みます。

---

**発行**: 医療職員管理システムチーム - AI/LLMエンジニアリング部門
**承認**: プロジェクトマネージャー
**版数**: Version 1.0
**最終更新**: 2025年10月5日 01:00

---

**📧 問い合わせ先**

- **Slack**: `#llm-integration`
- **技術サポート**: medical-ai-team@example.com
- **プロジェクトリード**: medical-pm@example.com
- **緊急連絡**: 内線 XXX-XXXX

---

**次回週次ミーティング**: 2025年10月12日（金）15:00-16:00
**議題**: Week 5進捗報告・Week 6計画確認

---

🤖 *医療チーム・VoiceDriveチーム協業による、安全なSNS環境の実現を目指して*
