# DecisionMeeting 暫定マスターリスト

**作成日**: 2025年10月10日
**対象ページ**: DecisionMeetingPage (https://voicedrive-v100.vercel.app/decision-meeting)
**対象権限**: Level 13（院長・施設長専用）
**実装期間**: 3日間（DB構築1日 + サービス層移行1日 + UI統合1日）

---

## 📋 概要

- **目的**: 経営会議で使用する最終決裁システムのDB基盤構築
- **スコープ**: DecisionMeetingAgendaテーブル1つ + サービス層のDB移行
- **前提条件**:
  - MySQL移行完了後の実装を想定
  - PersonalStation、CommitteeManagementのAPI実装済み
  - 全API再利用可能（新規API不要）

---

## 🎯 実装フェーズ

### Phase 1: DB構築（1日）

#### タスク1-1: テーブル作成（2時間）
- [ ] `DecisionMeetingAgenda`テーブルをschema.prismaに追加
- [ ] User modelとのリレーション設定（proposer, decider）
- [ ] ManagementCommitteeAgendaとのリレーション設定（escalation flow）
- [ ] インデックス設定（status, priority, decidedDate）

#### タスク1-2: マイグレーション実行（1時間）
- [ ] Prisma migrate実行
- [ ] マイグレーションファイル検証
- [ ] ロールバック手順確認

#### タスク1-3: 初期データ投入（2時間）
- [ ] 医療システムから提供された歴史的データをインポート
- [ ] デモデータ（6件）をシードデータとして準備
- [ ] データ整合性チェック（proposerId, deciderId存在確認）

#### タスク1-4: DB動作確認（3時間）
- [ ] Prisma Studio で全フィールド確認
- [ ] リレーション動作確認（User, ManagementCommitteeAgenda）
- [ ] クエリパフォーマンステスト（status別、priority別、月別）
- [ ] JSON型フィールド確認（impactDepartments, meetingAttendees等）

---

### Phase 2: サービス層移行（1日）

#### タスク2-1: PrismaClient統合（3時間）
- [ ] `src/services/DecisionMeetingService.ts`の全メソッドをDB接続に変更
- [ ] `getAgendas()`メソッド：フィルタリングロジックをPrismaクエリに変換
- [ ] `approveAgenda()`メソッド：DB更新処理に変更
- [ ] `rejectAgenda()`メソッド：DB更新処理に変更
- [ ] `deferAgenda()`メソッド：DB更新処理に変更
- [ ] `getStats()`メソッド：集計クエリをPrismaに変換

#### タスク2-2: トランザクション処理実装（2時間）
- [ ] 決裁処理のトランザクション化（approve/reject/defer）
- [ ] ManagementCommitteeAgenda更新との同時実行制御
- [ ] エラーハンドリング強化（楽観的ロック検討）

#### タスク2-3: キャッシュ戦略実装（3時間）
- [ ] 統計情報のキャッシュ実装（5分間）
- [ ] ユーザー情報キャッシュ（PersonalStation API）
- [ ] 部署マスターキャッシュ（DepartmentStation API）
- [ ] キャッシュ無効化ロジック（決裁実行時）

---

### Phase 3: UI統合（1日）

#### タスク3-1: API接続切り替え（2時間）
- [ ] DecisionMeetingPage.tsxのservice呼び出しを維持（内部がDBに変更されているため）
- [ ] エラーハンドリング確認（ネットワークエラー、権限エラー）
- [ ] ローディング状態の適切な表示

#### タスク3-2: リアルタイム更新実装（3時間）
- [ ] 決裁実行後の自動リフレッシュ
- [ ] 統計情報の即時反映
- [ ] 他ユーザーの決裁通知（WebSocket検討、Phase 3以降）

#### タスク3-3: 統合テスト（3時間）
- [ ] Level 13ユーザーでの全操作確認
- [ ] 決裁フロー全体テスト（承認/却下/保留）
- [ ] フィルタリング・検索機能確認
- [ ] 統計情報表示確認
- [ ] エスカレーションフロー確認（CommitteeManagement → DecisionMeeting）
- [ ] エッジケーステスト（同時実行、権限外アクセス等）

---

## 🔗 依存関係

### 前提条件
1. ✅ PersonalStation API実装済み（User情報取得）
2. ✅ DepartmentStation API実装済み（部署マスター）
3. ✅ CommitteeManagement実装済み（エスカレーション元）
4. ⏳ MySQL移行完了（医療システムチーム）

### 並行作業可能
- Phase 1とPhase 2は独立（Phase 1完了後にPhase 2開始）
- Phase 3はPhase 2完了後に開始

---

## 📊 成功基準

### 機能要件
- [ ] Level 13ユーザーが全議題を閲覧可能
- [ ] 決裁処理（承認/却下/保留）が正常動作
- [ ] フィルタリング・検索が高速動作（100件で1秒以内）
- [ ] 統計情報が正確に表示
- [ ] エスカレーションフロー動作（委員会議題→経営会議議題）

### 非機能要件
- [ ] 応答時間：全クエリ500ms以内
- [ ] データ整合性：トランザクション保証
- [ ] セキュリティ：Level 13以外アクセス不可
- [ ] 可用性：エラー時の適切なフォールバック

---

## ⚠️ リスクと対策

### リスク1: ManagementCommitteeAgendaとの連携タイミング
- **内容**: CommitteeManagementもMySQL移行待ちのため、エスカレーションフローが未実装
- **対策**: Phase 1ではDecisionMeetingAgenda単体で実装、Phase 2でリレーション追加
- **影響度**: 中（機能は動作するが、エスカレーション自動化は後回し）

### リスク2: 歴史的データの品質
- **内容**: 過去の決裁記録に不整合データが含まれる可能性
- **対策**: データインポート前にバリデーションスクリプト実行
- **影響度**: 低（初期データ提供は医療システムチームが品質保証）

### リスク3: Level 13ユーザーの少なさ
- **内容**: テストユーザーが限定的（院長・施設長のみ）
- **対策**: テスト環境で権限レベルを一時的に変更可能にする
- **影響度**: 低（開発環境での対応可能）

---

## 📅 スケジュール

| フェーズ | 期間 | 開始条件 | 完了条件 |
|---------|------|----------|----------|
| Phase 1: DB構築 | 1日 | MySQL移行完了 | Prisma migrate成功、初期データ投入完了 |
| Phase 2: サービス層移行 | 1日 | Phase 1完了 | 全メソッドDB接続、トランザクション動作確認 |
| Phase 3: UI統合 | 1日 | Phase 2完了 | 統合テスト全項目合格 |

**合計**: 3日間

---

## 🎓 学習ポイント

### 新規実装項目
- **なし**（全API再利用、UI完成済み）

### 技術的チャレンジ
1. **エスカレーションフロー設計**: ManagementCommitteeAgendaとの双方向リレーション
2. **JSON型フィールド活用**: impactDepartments、meetingAttendeesの柔軟な構造
3. **権限レベル13の厳格な制御**: 最高レベル権限の実装

---

## 🔄 今後の拡張予定

### Phase 3以降の機能
1. **WebSocketによるリアルタイム通知**: 他ユーザーの決裁を即座に反映
2. **決裁履歴の詳細分析**: 決裁傾向、平均決裁日数のトレンド分析
3. **委員会議題との自動連携**: 委員会承認→経営会議提出の自動化
4. **電子署名機能**: 決裁の法的効力を持たせる

### 医療システムとの連携強化
1. **決裁結果の自動通知**: 人事システム、経理システムへの自動連携
2. **予算管理システム統合**: estimatedCostと予算執行の連携
3. **稟議システム統合**: 法人レベル決裁への自動エスカレーション

---

## 📞 問い合わせ先

### VoiceDriveチーム
- 実装相談: #voicedrive-dev
- DB設計相談: #database-design

### 医療システムチーム
- API連携: #mcp-integration
- マスタープラン統合: #master-plan-integration

---

**最終更新**: 2025年10月10日
**次回レビュー**: MySQL移行完了時
