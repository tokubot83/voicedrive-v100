# VoiceAnalytics 暫定マスターリスト

**作成日**: 2025年10月10日
**対象ページ**: VoiceAnalyticsPage (https://voicedrive-v100.vercel.app/voice-analytics)
**対象権限**: Level 14-17（人事部門専用）
**実装期間**: 4日間（DB構築1日 + Webhook実装1日 + サービス層移行1日 + UI統合+連携1日）

---

## 📋 概要

- **目的**: 集団分析ダッシュボードのDB基盤構築とWebhook連携実装
- **スコープ**: GroupAnalyticsテーブル + AnalyticsAlertテーブル + Webhook受信体制
- **前提条件**:
  - MySQL移行完了後の実装を想定
  - WebhookNotificationテーブル既存（拡張のみ）
  - 医療システムがバッチ分析を実施済み

---

## 🎯 実装フェーズ

### Phase 1: DB構築（1日）

#### タスク1-1: テーブル作成（3時間）
- [ ] `GroupAnalytics`テーブルをschema.prismaに追加
- [ ] `AnalyticsAlert`テーブルをschema.prismaに追加
- [ ] `WebhookNotification`にGroupAnalyticsリレーション追加
- [ ] インデックス設定（analysisDate, analysisType, isActive）

#### タスク1-2: マイグレーション実行（1時間）
- [ ] Prisma migrate実行
- [ ] マイグレーションファイル検証
- [ ] ロールバック手順確認

#### タスク1-3: 初期データ投入（2時間）
- [ ] デモデータ（2025年9月分析）をGroupAnalyticsにシード
- [ ] デモアラート（2件）をAnalyticsAlertにシード
- [ ] データ整合性チェック（JSON構造検証）

#### タスク1-4: DB動作確認（2時間）
- [ ] Prisma Studio で全フィールド確認
- [ ] リレーション動作確認（WebhookNotification ← GroupAnalytics ← AnalyticsAlert）
- [ ] クエリパフォーマンステスト（最新データ取得、期間フィルタ）
- [ ] JSON型フィールド確認（postingTrendsData, sentimentAnalysisData等）

---

### Phase 2: Webhook受信実装（1日）

#### タスク2-1: Webhookエンドポイント実装（3時間）
- [ ] `/api/webhooks/analytics-batch-completed`エンドポイント作成
- [ ] Webhook署名検証ロジック（HMAC-SHA256）
- [ ] リクエストボディバリデーション（Zod）
- [ ] エラーハンドリング（署名不一致、データ不正等）

#### タスク2-2: データ保存ロジック実装（3時間）
- [ ] WebhookNotificationテーブルに通知保存
- [ ] `details.dataUrl`からJSON取得（または`details`に直接含まれる場合はそのまま使用）
- [ ] GroupAnalyticsテーブルにデータ保存
- [ ] AnalyticsAlertテーブルにアラート保存（複数件）
- [ ] 古いデータの`isActive`をfalseに更新（同一analysisTypeの前回データ）

#### タスク2-3: リトライ機構実装（2時間）
- [ ] Webhook受信失敗時のリトライロジック
- [ ] データURL取得失敗時のリトライ（指数バックオフ）
- [ ] エラーログ記録（WebhookNotification.details内）
- [ ] 管理者通知（Slack/メール）

---

### Phase 3: サービス層移行（1日）

#### タスク3-1: VoiceAnalyticsService DB版実装（4時間）
- [ ] `getAnalyticsData()`メソッド：GroupAnalytics最新データ取得に変更
- [ ] `getSummary()`メソッド：GroupAnalyticsからサマリー計算に変更
- [ ] `getFilteredData()`メソッド：期間フィルタリング実装（analysisDate範囲検索）
- [ ] `getAlerts()`メソッド：AnalyticsAlert取得実装
- [ ] デモデータ削除（initializeDemoData()を廃止）

#### タスク3-2: キャッシュ戦略実装（2時間）
- [ ] 最新分析データのメモリキャッシュ（5分間）
- [ ] 過去データのキャッシュ（1時間）
- [ ] キャッシュ無効化ロジック（新規Webhook受信時）

#### タスク3-3: 統合テスト（2時間）
- [ ] 全メソッド動作確認（CRUD操作）
- [ ] エラーハンドリング確認（データなし、不正JSON等）
- [ ] パフォーマンステスト（大量データ想定）

---

### Phase 4: UI統合+医療システム連携（1日）

#### タスク4-1: UI統合（3時間）
- [ ] VoiceAnalyticsPage.tsxのservice呼び出しを維持（内部がDBに変更されているため）
- [ ] ローディング状態の適切な表示
- [ ] エラーハンドリング確認（データなし、ネットワークエラー）
- [ ] 期間選択機能追加（週次/月次/四半期切り替え）

#### タスク4-2: 医療システム連携テスト（3時間）
- [ ] 医療システムからWebhook送信テスト（テスト環境）
- [ ] GroupAnalytics自動保存確認
- [ ] AnalyticsAlert自動生成確認
- [ ] UI即時反映確認（キャッシュ無効化）

#### タスク4-3: E2Eテスト（2時間）
- [ ] Level 14-17ユーザーでの全操作確認
- [ ] サマリーカード4つ正確表示
- [ ] グラフエリア6つ正確表示
- [ ] アラートセクション表示・確認機能
- [ ] プライバシー保護情報表示
- [ ] 期間フィルタリング動作確認

---

## 🔗 依存関係

### 前提条件
1. ✅ WebhookNotificationテーブル既存（拡張のみ）
2. ✅ 医療システムがバッチ分析機能実装済み
3. ⏳ MySQL移行完了（医療システムチーム）

### 並行作業可能
- Phase 1とPhase 2は独立（Phase 1完了後にPhase 2開始）
- Phase 3はPhase 2完了後に開始
- Phase 4はPhase 3完了後に開始

---

## 📊 成功基準

### 機能要件
- [ ] Level 14-17ユーザーが全データを閲覧可能
- [ ] Webhook自動受信→DB保存が正常動作
- [ ] サマリーカード4つが正確表示
- [ ] グラフエリア6つが正確表示
- [ ] アラート表示・確認機能が動作
- [ ] 期間フィルタリングが高速動作（100件で1秒以内）

### 非機能要件
- [ ] 応答時間：全クエリ500ms以内
- [ ] Webhook処理時間：5秒以内
- [ ] データ整合性：医療システムと100%一致
- [ ] プライバシー保護：最小グループサイズ5名保証

---

## ⚠️ リスクと対策

### リスク1: 感情分析・トピック分析の実装複雑度

- **内容**: 感情分析（AI処理）とトピック分析（自然言語処理）は医療システム側の責任だが、実装が複雑
- **対策**: Phase 1ではsentimentAnalysisData/topicAnalysisDataをnull許可し、基本統計のみで先行実装
- **影響度**: 中（機能は動作するが、高度な分析は後回し）

### リスク2: Webhook失敗時の再送信

- **内容**: ネットワーク障害やVoiceDriveサーバーダウン時にWebhook失敗
- **対策**: 医療システム側でWebhook送信履歴を保存し、失敗時は自動リトライ（指数バックオフ）
- **影響度**: 低（リトライ機構で対応可能）

### リスク3: 大量データのJSON保存

- **内容**: GroupAnalytics.postingTrendsData等のJSON型フィールドが肥大化する可能性
- **対策**: MySQL 8.0のJSON型は効率的だが、必要に応じて正規化（部門別データを別テーブル化）
- **影響度**: 低（当面は月次データのみでサイズ問題なし）

---

## 📅 スケジュール

| フェーズ | 期間 | 開始条件 | 完了条件 |
|---------|------|----------|----------|
| Phase 1: DB構築 | 1日 | MySQL移行完了 | Prisma migrate成功、初期データ投入完了 |
| Phase 2: Webhook受信実装 | 1日 | Phase 1完了 | Webhook受信→DB保存自動化確認 |
| Phase 3: サービス層移行 | 1日 | Phase 2完了 | 全メソッドDB接続、キャッシュ動作確認 |
| Phase 4: UI統合+連携 | 1日 | Phase 3完了 | E2Eテスト全項目合格、医療システム連携確認 |

**合計**: 4日間

---

## 🎓 学習ポイント

### 新規実装項目
1. **Webhook受信体制**: 既存のWebhookNotificationを活用し、分析データ専用エンドポイント追加
2. **JSON型フィールド活用**: 複雑な集団分析データ（byCategory, byDepartment等）をJSON保存
3. **isActiveフラグ管理**: 最新データのみをアクティブにし、過去データは検索可能だが非表示

### 技術的チャレンジ
1. **プライバシー保護検証**: 最小グループサイズ5名のバリデーション実装
2. **期間フィルタリング**: analysisDateとanalysisTypeの複合インデックス活用
3. **大量JSON保存**: MySQL JSON型の効率的な活用

---

## 🔄 今後の拡張予定

### Phase 3以降の機能
1. **リアルタイムダッシュボード**: WebSocket接続で新規分析データ自動反映
2. **カスタムフィルタ**: 部門別、レベル別、カテゴリ別の詳細フィルタ
3. **比較分析**: 複数期間の比較表示（前月比、前年同月比）
4. **CSV/PDFエクスポート**: 分析結果のダウンロード機能
5. **アラート自動通知**: 重要度highまたはcriticalのアラートをSlack/メール通知

### 医療システムとの連携強化
1. **双方向API**: VoiceDriveから医療システムへのフィードバック（アラート確認状況）
2. **リアルタイム分析**: 週次バッチに加え、リアルタイム簡易分析（投稿数カウント等）
3. **AI分析強化**: 感情分析の精度向上、トピック自動分類

---

## 📞 問い合わせ先

### VoiceDriveチーム
- 実装相談: #voicedrive-dev
- DB設計相談: #database-design

### 医療システムチーム
- Webhook連携: #mcp-integration
- バッチ分析: #analytics-batch
- プライバシー保護: #data-privacy

---

**最終更新**: 2025年10月10日
**次回レビュー**: 医療システムチームからの質問回答受領時
