# ExecutiveFunctionsPage VoiceDrive回答書

**文書番号**: VOICEDRIVE-RESPONSE-2025-1026-002
**作成日**: 2025年10月26日
**対象ページ**: ExecutiveFunctionsPage
**参照文書**:
- [ExecutiveFunctionsPage_DB要件分析_20251026.md](./ExecutiveFunctionsPage_DB要件分析_20251026.md)
- [データ管理責任分界点定義書_20251008.md](../データ管理責任分界点定義書_20251008.md)

---

## 📋 医療システムチームへの回答

### 質問1: データ管理責任の明確化

**医療システムからの確認事項**:
> ExecutiveFunctionsPageの5つのタブ（経営概要、戦略イニシアチブ、組織分析、理事会レポート、ガバナンス機能）について、どのデータをVoiceDriveが管理し、どのデータを医療システムが提供すべきかを明確にしてください。

**VoiceDriveチームの回答**:

#### ✅ **回答1: データ管理責任の分担を以下のように定義します**

| タブ | データ項目 | 管理責任 | 理由 |
|-----|----------|---------|------|
| **経営概要** | 総売上・純利益 | **医療システム 100%** | 財務データは医療システムの管轄 |
| | 患者満足度 | **医療システム 100%** | アンケートDBは医療システム管理 |
| | 総職員数 | **医療システム 100%** | HR DBは医療システム管理 |
| | 組織エンゲージメント | **VoiceDrive 40% + 医療システム 60%** | VoiceDrive活動統計 + 医療システムアンケート |
| | 重要課題管理 | **VoiceDrive 100%** | 組織課題管理はVoiceDrive独自機能 |
| | 月次業績サマリー | **VoiceDrive 60% + 医療システム 40%** | VoiceDrive主導、医療システム財務データ連携 |
| **戦略イニシアチブ** | イニシアチブ登録・進捗 | **VoiceDrive 100%** | プロジェクト管理はVoiceDrive管轄 |
| | 予算情報 | **医療システム 100%** | 予算DBは医療システム管理 |
| | ROI計算 | **医療システム 100%** | 財務データから算出 |
| | リスク管理 | **VoiceDrive 100%** | リスク管理はVoiceDrive内部で完結 |
| **組織分析** | 組織健全度 | **VoiceDrive 50% + 医療システム 50%** | VoiceDrive活動統計 + 医療システムアンケート |
| | イノベーション指数 | **VoiceDrive 100%** | VoiceDrive投稿から算出 |
| | リーダーシップ評価 | **医療システム 100%** | V3評価DBから取得 |
| | 文化適応度 | **医療システム 100%** | アンケートDBから取得 |
| | 組織能力評価 | **医療システム 100%** | 組織分析DBから取得 |
| | キーポジション充足率 | **医療システム 100%** | HR DBから算出 |
| **理事会レポート** | 報告書管理 | **VoiceDrive 100%** | 文書管理はVoiceDrive管轄 |
| | 会議スケジュール | **VoiceDrive 100%** | BoardMeetingテーブルで管理 |
| | 重要決議事項 | **VoiceDrive 100%** | BoardDecisionテーブルで管理 |

**データ管理責任の基本方針**:
- ✅ **財務・経営データ**: 医療システムが100%管理、VoiceDriveは表示のみ
- ✅ **プロジェクト管理データ**: VoiceDriveが100%管理
- ✅ **組織活動データ**: VoiceDrive活動統計 + 医療システムアンケートを統合
- ✅ **理事会・ガバナンスデータ**: VoiceDriveが100%管理

---

### 質問2: 必要なAPIの優先順位

**医療システムからの確認事項**:
> DB要件分析書には5つのAPIが提案されていますが、Phase 1（2025年11月11日〜20日）でどのAPIが必須か、Phase 2以降で問題ないかを明確にしてください。

**VoiceDriveチームの回答**:

#### ✅ **回答2: API提供優先順位を以下のように定義します**

| API | 優先度 | Phase | 理由 |
|-----|-------|------|------|
| **GET /api/medical/executive/kpis** | 🔴 **必須** | Phase 1 | 経営概要タブの基本機能に必要 |
| **GET /api/medical/executive/initiatives/{id}/roi** | 🟡 **推奨** | Phase 2 | 戦略イニシアチブタブで使用、Phase 1では手入力で代替可能 |
| **GET /api/medical/executive/staffing-status** | 🟡 **推奨** | Phase 2 | 組織分析タブで使用、Phase 1では手入力で代替可能 |
| **GET /api/medical/executive/leadership-rating** | 🟢 **任意** | Phase 3+ | リーダーシップ評価、既存V3評価システムと重複の可能性 |
| **GET /api/medical/executive/organization-capabilities** | 🟢 **任意** | Phase 3+ | 組織能力評価、既存アンケートシステムと重複の可能性 |

**Phase 1での最小要件**:
- 🔴 **API 1（経営KPI）のみ必須**
- その他のAPIが提供されない場合、手入力または既存データで代替

**Phase 2以降での実装推奨**:
- 🟡 **API 2（ROI）**: 2025年12月実装推奨
- 🟡 **API 3（充足率）**: 2025年12月実装推奨

---

### 質問3: 新規テーブル追加の承認確認

**医療システムからの確認事項**:
> VoiceDrive側で6つの新規テーブル（ExecutiveKeyIssue, StrategicInitiative, StrategicInitiativeRisk, BoardReport, ExecutiveMonthlySummary, OrganizationAnalyticsMetrics）を追加する計画ですが、医療システム側との連携に問題はないか確認させてください。

**VoiceDriveチームの回答**:

#### ✅ **回答3: 6つの新規テーブルを以下の優先順位で実装します**

| テーブル | 優先度 | Phase | 医療システム連携 |
|---------|-------|------|---------------|
| **ExecutiveKeyIssue** | 🔴 **Phase 1** | Phase 1 | ❌ 連携不要（VoiceDrive独立管理） |
| **ExecutiveMonthlySummary** | 🔴 **Phase 1** | Phase 1 | ⚠️ 医療システムAPI（経営KPI）から一部データ取得 |
| **StrategicInitiative** | 🟡 **Phase 2** | Phase 2 | ⚠️ 医療システムAPI（予算・ROI）から一部データ取得 |
| **StrategicInitiativeRisk** | 🟡 **Phase 2** | Phase 2 | ❌ 連携不要（VoiceDrive独立管理） |
| **OrganizationAnalyticsMetrics** | 🟢 **Phase 3** | Phase 3 | ⚠️ 医療システムAPI（組織評価）から一部データ取得 |
| **BoardReport** | 🟢 **Phase 4** | Phase 4 | ❌ 連携不要（VoiceDrive独立管理） |

**医療システム側への影響**:
- ✅ **Phase 1**: API 1（経営KPI）の提供のみで実装可能
- ✅ **Phase 2以降**: 追加APIが提供されない場合も、VoiceDrive側で代替処理可能
- ✅ **データ整合性**: VoiceDrive側のテーブルは医療システムDBと直接連携せず、API経由のみ

**テーブル追加のスケジュール**:
```
Phase 1（2025年11月11日〜20日）:
├─ ExecutiveKeyIssueテーブル追加
└─ ExecutiveMonthlySummaryテーブル追加

Phase 2（2025年12月）:
├─ StrategicInitiativeテーブル追加
└─ StrategicInitiativeRiskテーブル追加

Phase 3（2026年1月）:
└─ OrganizationAnalyticsMetricsテーブル追加

Phase 4（2026年2月）:
└─ BoardReportテーブル追加
```

---

## 🔄 VoiceDriveチームからの追加質問

### 追加質問1: 既存BoardMeeting/BoardDecisionテーブルの活用

**VoiceDriveからの質問**:
> schema.prismaに既にBoardMeeting（1469-1492行目）、BoardDecision（1673行目以降）、BoardMeetingAgenda（1393-1436行目）が定義されていますが、これらのテーブルは医療システム側でも使用していますか？VoiceDrive側で自由に統合作業を進めて問題ないでしょうか？

**期待する回答形式**:
- A. 医療システムは使用していない → VoiceDrive側で自由に統合可能
- B. 医療システムも使用している → 統合前に調整が必要
- C. 今後医療システムで使用予定 → スケジュール調整が必要

---

### 追加質問2: 組織エンゲージメント算出方式の合意

**VoiceDriveからの質問**:
> 組織エンゲージメント指標は「VoiceDrive活動統計 40% + 医療システムアンケート 60%」で統合計算する予定ですが、この比率および計算方法について医療システムチームと合意を取る必要はありますか？

**提案する計算式**:
```typescript
organizationEngagement = (
  voiceDriveEngagement * 0.4 +
  medicalSystemEngagement * 0.6
)

voiceDriveEngagement = (
  postParticipationRate * 0.4 +
  voteActivityRate * 0.3 +
  averageSentiment * 100 * 0.3
)
```

**期待する回答形式**:
- A. VoiceDrive側で独自に決定可能
- B. 医療システムチームと合意が必要 → 合意形成をサポート
- C. 医療システム側で別途定義済み → 定義を共有

---

### 追加質問3: ExecutiveStrategicInsightテーブルの稼働時期

**VoiceDriveからの質問**:
> schema.prisma 2283-2307行目にExecutiveStrategicInsightテーブルが定義されており、DB要件分析書では「Phase 18.5（2026年1月）で本格稼働予定」とありますが、このテーブルは医療システム側からの戦略分析データ受信用でしょうか？VoiceDrive側での活用方法について確認させてください。

**期待する回答形式**:
- A. 医療システムからの戦略分析データ受信用 → Phase 18.5で連携開始
- B. VoiceDrive独自の戦略分析用 → VoiceDrive側で実装
- C. 現時点では未定 → Phase 18.5まで保留

---

## 📊 実装スケジュール（医療システム側の対応期限）

| 項目 | VoiceDrive実装期限 | 医療システム対応期限 | 備考 |
|-----|------------------|-------------------|------|
| **Phase 1: 経営概要タブ** | 2025年11月20日 | 2025年11月15日 | API 1（経営KPI）提供必須 |
| **Phase 2: 戦略イニシアチブタブ** | 2025年12月31日 | 2025年12月25日 | API 2（ROI）提供推奨 |
| **Phase 3: 組織分析タブ** | 2026年1月31日 | 2026年1月25日 | API 4, 5（組織評価）提供推奨 |
| **Phase 4: 理事会レポートタブ** | 2026年2月28日 | - | 医療システム対応不要 |

**重要なマイルストーン**:
- 🔴 **2025年11月15日**: API 1（経営KPI）提供必須（Phase 1の前提条件）
- 🟡 **2025年12月25日**: API 2（ROI）提供推奨（提供されない場合は手入力で代替）

---

## ✅ 合意事項サマリー

### VoiceDrive側の責任範囲
1. ✅ **6つの新規テーブルを段階的に追加**（Phase 1〜4）
2. ✅ **医療システムAPIの呼び出し機能実装**
3. ✅ **クライアント側での統合計算機能実装**（組織エンゲージメント等）
4. ✅ **既存BoardMeeting/BoardDecisionテーブルとの統合作業**

### 医療システム側への依頼事項
1. 🔴 **Phase 1必須**: API 1（経営KPI）の提供（2025年11月15日まで）
2. 🟡 **Phase 2推奨**: API 2（ROI）、API 3（充足率）の提供（2025年12月25日まで）
3. 🟢 **Phase 3以降**: API 4, 5（組織評価）の提供（2026年1月25日まで）
4. ❓ **追加質問への回答**: 上記3つの追加質問への回答をお願いします

---

## 📝 次のアクションアイテム

### VoiceDriveチーム
- [ ] 医療システムチームからの回答を受領（上記3つの追加質問）
- [ ] Phase 1実装計画の詳細化（2025年11月11日開始）
- [ ] API 1（経営KPI）のモックアップ作成（医療システム提供前のテスト用）

### 医療システムチーム
- [ ] 上記3つの追加質問への回答（2025年11月1日まで）
- [ ] API 1（経営KPI）の仕様確定・実装（2025年11月15日まで）
- [ ] API 2, 3の実装可否・スケジュール確認（2025年11月30日まで）

---

## 🔗 関連ドキュメント

- [ExecutiveFunctionsPage_DB要件分析_20251026.md](./ExecutiveFunctionsPage_DB要件分析_20251026.md)
- [ExecutiveFunctionsPage暫定マスターリスト_20251026.md](./ExecutiveFunctionsPage暫定マスターリスト_20251026.md)
- [データ管理責任分界点定義書_20251008.md](../データ管理責任分界点定義書_20251008.md)
- [StrategicInitiativesPage_VoiceDrive回答書_20251026.md](./StrategicInitiativesPage_VoiceDrive回答書_20251026.md)

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
次回レビュー: 医療システムチーム回答受領後
