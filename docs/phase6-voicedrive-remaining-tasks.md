# Phase 6 VoiceDrive側 残り実装作業計画書

**作成日**: 2025年8月10日
**プロジェクト**: VoiceDrive Phase 6 - 期限到達判断機能
**担当チーム**: VoiceDriveチーム

---

## 📋 現在の実装状況

### ✅ 完了した作業

1. **Cron Job実装** (commit: 297978f)
   - `src/jobs/expiredEscalationCheckJob.ts` 作成
   - 日次9AM自動チェック機能
   - アプリ内通知送信機能
   - 手動実行機能（テスト用）

2. **判断履歴ページUI実装** (commit: 5b4cdc9)
   - `src/components/agenda-mode/ExpiredEscalationHistoryPage.tsx` 作成
   - 権限レベル別表示ロジック
   - サマリー統計表示
   - 判断履歴一覧表示
   - レスポンシブデザイン

3. **モックデータ実装** (commit: 297978f)
   - `src/data/mockExpiredEscalationHistory.ts` 作成
   - TypeScript型定義
   - 全権限レベル対応のサンプルデータ

4. **ルーティング設定** (commit: 5b4cdc9)
   - `/expired-escalation-history` ルート追加
   - ProtectedRoute設定（LEVEL_1以上）

5. **サイドバー統合** (commit: 5b4cdc9)
   - AgendaModeSidebarに「判断履歴を見る」ボタン追加

6. **ドキュメント整備**
   - Cron Job設定ガイド作成
   - 権限レベル定義書作成
   - 医療チームへの実装依頼書作成

---

## 🚧 残りの実装作業

### Phase 1: バックエンドAPI実装（優先度：高）

#### 1.1 期限到達判断API作成

**ファイル**: `src/api/expiredEscalationDecision.ts`（新規作成）

```typescript
/**
 * 期限到達提案の判断API
 */

// 判断を記録するAPI
export async function recordExpiredEscalationDecision(params: {
  postId: string;
  decision: 'approve_at_current_level' | 'downgrade' | 'reject';
  deciderId: string;
  decisionReason: string;
  currentScore: number;
  targetScore: number;
  agendaLevel: string;
}): Promise<{ success: boolean; decisionId?: string; error?: string }>;

// 判断履歴を取得するAPI（職員カルテシステム連携前の暫定版）
export async function getExpiredEscalationHistory(params: {
  userId: string;
  permissionLevel: number;
  facilityId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ExpiredEscalationHistoryResponse>;
```

**実装タスク**:
- [ ] Prisma Schemaに`ExpiredEscalationDecision`モデル追加
- [ ] マイグレーション作成・実行
- [ ] CRUD操作関数実装
- [ ] 権限チェックロジック実装
- [ ] エラーハンドリング実装

**見積もり**: 2日

---

#### 1.2 Prisma Schema拡張

**ファイル**: `prisma/schema.prisma`

```prisma
model ExpiredEscalationDecision {
  id                String   @id @default(uuid())
  postId            String
  post              Post     @relation(fields: [postId], references: [id])

  decision          String   // 'approve_at_current_level' | 'downgrade' | 'reject'
  deciderId         String
  decider           User     @relation(fields: [deciderId], references: [id])
  decisionReason    String   @db.Text

  currentScore      Int
  targetScore       Int
  achievementRate   Float
  daysOverdue       Int

  agendaLevel       String
  proposalType      String?
  department        String?
  facilityId        String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([postId])
  @@index([deciderId])
  @@index([facilityId])
  @@index([createdAt])
  @@map("expired_escalation_decisions")
}
```

**実装タスク**:
- [ ] Schema定義追加
- [ ] `npx prisma migrate dev --name add_expired_escalation_decision` 実行
- [ ] `npx prisma generate` 実行
- [ ] Postモデルにrelation追加

**見積もり**: 0.5日

---

#### 1.3 Express APIルート作成

**ファイル**: `src/server.ts`（既存ファイルに追加）

```typescript
// 期限到達判断記録API
app.post('/api/expired-escalation-decision',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    // 実装
  }
);

// 判断履歴取得API（暫定版）
app.get('/api/expired-escalation-history',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    // 実装
  }
);
```

**実装タスク**:
- [ ] POST /api/expired-escalation-decision 実装
- [ ] GET /api/expired-escalation-history 実装
- [ ] リクエストバリデーション実装
- [ ] 権限チェック実装

**見積もり**: 1日

---

### Phase 2: 判断UI実装（優先度：高）

#### 2.1 期限到達提案の判断モーダル作成

**ファイル**: `src/components/agenda-mode/ExpiredEscalationDecisionModal.tsx`（新規作成）

**機能**:
- 期限到達提案の詳細表示
- スコア・到達率の視覚化
- 判断選択（承認/ダウングレード/不採用）
- 判断理由入力欄
- 確認ダイアログ

**実装タスク**:
- [ ] モーダルコンポーネント作成
- [ ] フォームバリデーション実装
- [ ] API連携実装
- [ ] 楽観的UI更新実装
- [ ] エラーハンドリング実装

**見積もり**: 2日

---

#### 2.2 期限到達提案一覧ページ作成

**ファイル**: `src/components/agenda-mode/ExpiredEscalationListPage.tsx`（新規作成）

**機能**:
- 判断待ち提案の一覧表示
- フィルタ機能（部署、施設、期限超過日数）
- ソート機能（到達率、期限超過日数）
- 一括判断機能（オプション）
- ページネーション

**実装タスク**:
- [ ] 一覧ページコンポーネント作成
- [ ] フィルタ機能実装
- [ ] ソート機能実装
- [ ] ページネーション実装
- [ ] 判断モーダル統合

**見積もり**: 2日

---

#### 2.3 通知からのアクション統合

**ファイル**: `src/components/notifications/NotificationItem.tsx`（既存ファイル修正）

**機能**:
- 期限到達通知をクリックで判断ページへ遷移
- 通知内にクイック判断ボタン追加（オプション）

**実装タスク**:
- [ ] 通知タイプ判定ロジック追加
- [ ] 遷移処理実装
- [ ] クイック判断ボタン実装（オプション）

**見積もり**: 0.5日

---

### Phase 3: データ連携実装（優先度：中）

#### 3.1 MCPサーバー連携実装

**前提条件**: 医療職員カルテシステム側API完成

**ファイル**: `src/services/mcpExpiredEscalationService.ts`（新規作成）

```typescript
/**
 * MCPサーバー経由で職員カルテシステムから判断履歴を取得
 */

export async function fetchExpiredEscalationHistoryFromMCP(params: {
  userId: string;
  permissionLevel: number;
  facilityId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ExpiredEscalationHistoryResponse>;

// キャッシュ機構（Redis推奨）
export async function getCachedExpiredEscalationHistory(
  cacheKey: string
): Promise<ExpiredEscalationHistoryResponse | null>;

export async function setCachedExpiredEscalationHistory(
  cacheKey: string,
  data: ExpiredEscalationHistoryResponse,
  ttl: number = 300 // 5分
): Promise<void>;
```

**実装タスク**:
- [ ] MCPサーバー連携サービス作成
- [ ] エラーリトライロジック実装
- [ ] フォールバック処理実装（MCPエラー時はローカルDBから取得）
- [ ] キャッシュ機構実装
- [ ] レスポンス変換ロジック実装

**見積もり**: 2日

---

#### 3.2 ExpiredEscalationHistoryPage のAPI連携

**ファイル**: `src/components/agenda-mode/ExpiredEscalationHistoryPage.tsx`（既存ファイル修正）

**変更内容**:
- モックデータからAPI取得へ切り替え
- ローディング状態管理
- エラーハンドリング
- リトライ機構

```typescript
// 現在（モック）
const data = getMockExpiredEscalationHistory(user.permissionLevel);

// 変更後（API連携）
const data = await fetchExpiredEscalationHistoryFromMCP({
  userId: user.id,
  permissionLevel: user.permissionLevel,
  facilityId: user.facilityId,
  departmentId: user.departmentId,
  startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd')
});
```

**実装タスク**:
- [ ] API呼び出しロジック実装
- [ ] ローディングUI実装
- [ ] エラーUI実装
- [ ] リトライボタン実装
- [ ] データ更新ボタン追加

**見積もり**: 1日

---

### Phase 4: テスト実装（優先度：中）

#### 4.1 ユニットテスト

**ファイル**: `src/__tests__/expiredEscalation/`（新規ディレクトリ）

```
src/__tests__/expiredEscalation/
├── expiredEscalationCheckJob.test.ts
├── expiredEscalationDecisionAPI.test.ts
├── ExpiredEscalationHistoryPage.test.tsx
└── ExpiredEscalationDecisionModal.test.tsx
```

**実装タスク**:
- [ ] Cron Jobテスト作成
- [ ] API関数テスト作成
- [ ] コンポーネントテスト作成
- [ ] 権限チェックロジックテスト作成
- [ ] エッジケーステスト作成

**見積もり**: 2日

---

#### 4.2 統合テスト

**ファイル**: `src/__tests__/integration/expiredEscalation.integration.test.ts`（新規作成）

**テストシナリオ**:
1. 期限到達検出 → 通知送信
2. 通知受信 → 判断画面遷移
3. 判断実行 → 履歴記録
4. 履歴取得 → 権限フィルタリング確認

**実装タスク**:
- [ ] エンドツーエンドテストシナリオ作成
- [ ] テストデータ準備
- [ ] モックサーバー設定
- [ ] テスト実行スクリプト作成

**見積もり**: 1.5日

---

### Phase 5: パフォーマンス最適化（優先度：低）

#### 5.1 データベースインデックス最適化

**実装タスク**:
- [ ] スロークエリ分析
- [ ] 必要なインデックス追加
- [ ] クエリパフォーマンステスト

**見積もり**: 0.5日

---

#### 5.2 フロントエンド最適化

**実装タスク**:
- [ ] React.memo適用
- [ ] useMemoでの計算結果キャッシュ
- [ ] 仮想スクロール実装（一覧が長い場合）
- [ ] 画像遅延読み込み

**見積もり**: 1日

---

### Phase 6: ドキュメント整備（優先度：中）

#### 6.1 ユーザーガイド作成

**ファイル**: `docs/user-guides/expired-escalation-decision-guide.md`（新規作成）

**内容**:
- 期限到達判断機能の概要
- 判断方法の手順
- 判断基準のガイドライン
- よくある質問（FAQ）

**見積もり**: 0.5日

---

#### 6.2 開発者ドキュメント更新

**ファイル**: `docs/developer-guides/expired-escalation-api.md`（新規作成）

**内容**:
- API仕様詳細
- データモデル説明
- エラーハンドリング方法
- テスト方法

**見積もり**: 0.5日

---

## 📅 実装スケジュール

### Week 1: バックエンド基盤（8/12 - 8/16）

| 日付 | タスク | 担当者 | 見積もり |
|-----|--------|--------|---------|
| 8/12（月） | Prisma Schema拡張 + マイグレーション | Backend | 0.5日 |
| 8/12-13 | 期限到達判断API作成 | Backend | 2日 |
| 8/14 | Express APIルート実装 | Backend | 1日 |
| 8/15-16 | APIテスト + 修正 | Backend | 1.5日 |

**Week 1 完了条件**:
- ✅ 判断記録API動作確認
- ✅ 判断履歴取得API動作確認（ローカルDB版）
- ✅ 権限チェック動作確認

---

### Week 2: フロントエンド実装（8/19 - 8/23）

| 日付 | タスク | 担当者 | 見積もり |
|-----|--------|--------|---------|
| 8/19-20 | 期限到達判断モーダル実装 | Frontend | 2日 |
| 8/21-22 | 期限到達提案一覧ページ実装 | Frontend | 2日 |
| 8/23 | 通知統合 + UI調整 | Frontend | 1日 |

**Week 2 完了条件**:
- ✅ 判断モーダル動作確認
- ✅ 一覧ページ動作確認
- ✅ 通知から遷移確認

---

### Week 3: データ連携 + テスト（8/26 - 8/30）

| 日付 | タスク | 担当者 | 見積もり |
|-----|--------|--------|---------|
| 8/26-27 | MCPサーバー連携実装 | Backend | 2日 |
| 8/28 | ExpiredEscalationHistoryPage API統合 | Frontend | 1日 |
| 8/29-30 | ユニットテスト + 統合テスト | QA/Dev | 2日 |

**Week 3 完了条件**:
- ✅ MCPサーバー連携動作確認
- ✅ 履歴ページAPI連携確認
- ✅ 全テストパス

---

### Week 4: 最適化 + リリース準備（9/2 - 9/6）

| 日付 | タスク | 担当者 | 見積もり |
|-----|--------|--------|---------|
| 9/2 | パフォーマンス最適化 | Backend/Frontend | 1.5日 |
| 9/3-4 | ドキュメント整備 | Tech Writer | 1日 |
| 9/5 | リリース前総合テスト | All | 1日 |
| 9/6 | 本番リリース | DevOps | 0.5日 |

**Week 4 完了条件**:
- ✅ パフォーマンステスト合格
- ✅ ドキュメント完成
- ✅ 本番環境デプロイ成功

---

## 📊 進捗管理

### KPI

| 指標 | 目標値 | 測定方法 |
|-----|--------|---------|
| API応答時間 | < 500ms | Performance monitoring |
| テストカバレッジ | > 80% | Jest coverage report |
| バグ検出率 | < 5件/週 | Issue tracker |
| ユーザー満足度 | > 4.0/5.0 | User feedback survey |

### リスク管理

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 医療システムAPI遅延 | 高 | MCPキャッシュ + フォールバック実装 |
| 大量データ処理遅延 | 中 | ページネーション + インデックス最適化 |
| 権限チェック漏れ | 高 | 厳格なテスト + コードレビュー |
| UI/UXの使いづらさ | 中 | ユーザーテスト + フィードバック収集 |

---

## 🔧 技術スタック

### 新規導入検討

| 技術 | 用途 | 優先度 |
|-----|------|--------|
| Redis | キャッシュ（MCP連携レスポンス） | 高 |
| React Query | データフェッチング管理 | 中 |
| Zod | リクエストバリデーション | 中 |
| Sentry | エラー監視 | 低 |

---

## 📝 チェックリスト

### 開発完了基準

- [ ] 全APIエンドポイント実装完了
- [ ] 全UIコンポーネント実装完了
- [ ] MCPサーバー連携完了
- [ ] ユニットテストカバレッジ > 80%
- [ ] 統合テスト全パス
- [ ] パフォーマンステスト合格
- [ ] セキュリティレビュー完了
- [ ] ドキュメント整備完了
- [ ] ユーザーガイド作成完了
- [ ] 本番環境デプロイ成功

### リリース判定基準

- [ ] クリティカルバグゼロ
- [ ] 医療システムチームAPI提供完了
- [ ] MCPサーバー連携テスト完了
- [ ] 負荷テスト完了（同時接続100ユーザー）
- [ ] ロールバック手順確認完了
- [ ] 監視アラート設定完了

---

## 📞 連絡先

**プロジェクトマネージャー**: （担当者名）
**バックエンドリード**: （担当者名）
**フロントエンドリード**: （担当者名）
**QAリード**: （担当者名）

**Slack**: #phase6-development
**週次ミーティング**: 毎週月曜 10:00 AM

---

**最終更新**: 2025年8月10日
**バージョン**: 1.0
**ステータス**: 実装計画確定待ち
