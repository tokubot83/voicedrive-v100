# MyReportDetailPage VoiceDrive実装完了報告

**作成日**: 2025年10月26日
**Phase**: Phase 2.9（内部通報システム統合）
**担当**: VoiceDriveチーム
**宛先**: 医療システムチーム

---

## 📋 エグゼクティブサマリー

医療システムチームからのPhase 2.9確認結果（6つの質問）を受け、VoiceDrive側の実装を完了しました。

### 実装完了項目
- ✅ 不足していたWebhookエンドポイント (`/acknowledged`) を追加実装
- ✅ Webhookルートをserver.tsに登録
- ✅ 医療システムからの6つの質問に対する回答を準備

---

## 🔧 VoiceDrive側実装内容

### 1. Webhookエンドポイント実装

**ファイル**: `src/routes/whistleblowingWebhookRoutes.ts`

医療システムから要求された3つのWebhookエンドポイントを実装済み：

| エンドポイント | メソッド | 機能 | 実装状況 |
|--------------|---------|------|---------|
| `/acknowledged` | POST | 受付確認受信 | ✅ **新規追加** |
| `/status-update` | POST | ステータス更新受信 | ✅ 既存 |
| `/resolution` | POST | 調査完了通知受信 | ✅ 既存 |

**Base URL**: `http://localhost:3003/api/webhooks/medical-system/whistleblowing`

#### 新規追加: `/acknowledged` エンドポイント

```typescript
/**
 * POST /api/webhooks/medical-system/whistleblowing/acknowledged
 * 医療システムからの受付確認を受信
 */
router.post('/acknowledged', async (req: Request, res: Response) => {
  // 1. 署名検証（HMAC-SHA256）
  // 2. タイムスタンプ検証（5分以内）
  // 3. 必須フィールド検証（reportId, caseNumber, estimatedResponseTime, acknowledgedAt）
  // 4. WhistleblowingReport更新
  //    - medicalSystemCaseNumber
  //    - acknowledgementReceived = true
  //    - acknowledgementDate
  //    - estimatedResponseTime
});
```

**更新されるフィールド**:
- `medicalSystemCaseNumber`: 医療システムのケース番号（例: `MED-WB-2025-001`）
- `acknowledgementReceived`: `true`
- `acknowledgementDate`: 受付確認日時
- `estimatedResponseTime`: 回答予定期間（例: `7営業日以内`）

### 2. サーバー登録

**ファイル**: `src/server.ts`

Webhookルートをサーバーに登録：

```typescript
import whistleblowingWebhookRoutes from './routes/whistleblowingWebhookRoutes';

// Webhook API（Phase 2.9: 医療システム連携）
console.log('🔔 Registering Whistleblowing Webhook routes at /api/webhooks/medical-system/whistleblowing');
app.use('/api/webhooks/medical-system/whistleblowing', whistleblowingWebhookRoutes);
```

---

## ❓ 医療システムからの6つの質問への回答

### 質問1: Webhook署名方式の確認

> Phase 2.5と同じHMAC-SHA256署名方式を使用しますか？

**回答**: ✅ **はい、Phase 2.5と同じ方式を使用します**

- **署名アルゴリズム**: HMAC-SHA256
- **署名対象**: `${timestamp}.${JSON.stringify(payload)}`
- **ヘッダー名**: `x-medical-system-signature`, `x-webhook-timestamp`
- **共有シークレット**: 環境変数 `MEDICAL_SYSTEM_WEBHOOK_SECRET` で管理
- **タイムスタンプ有効期限**: 5分以内

**実装済みの検証関数**:
```typescript
function verifyWebhookSignature(
  signature: string,
  payload: any,
  timestamp: string,
  secret: string
): boolean {
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

### 質問2: リトライポリシーの確認

> Webhook送信失敗時のリトライポリシーはPhase 2.5と同じですか？

**回答**: ✅ **はい、Phase 2.5と同じリトライポリシーを想定しています**

VoiceDrive側の受信エンドポイントは以下のリトライポリシーに対応可能：

| リトライ回数 | 遅延時間 | 累計時間 |
|------------|---------|---------|
| 1回目 | 1分後 | 1分 |
| 2回目 | 5分後 | 6分 |
| 3回目（最終） | 30分後 | 36分 |

**冪等性保証**:
- すべてのWebhookエンドポイントは冪等性を保証
- `reportId`による重複検知
- 同じペイロードを複数回受信しても安全

---

### 質問3: ステータス遷移フローの確認

> 提案されたステータス遷移フローは以下で良いですか？
>
> `received` → `triaging` → `investigating` → `escalated` → `resolved` → `closed`

**回答**: ✅ **承認します（1点の補足あり）**

基本的に提案されたフローで問題ありませんが、実運用では以下の最適化を推奨：

```
received → triaging → investigating → escalated → resolved → closed
         ↓           ↓                ↓
         └─→ investigating (直接)     └─→ resolved (軽微な案件)
                     └─→ resolved (VoiceDrive内完結)
```

**補足説明**:
- **`triaging` → `investigating`**: 軽微な案件は迅速に調査開始可能
- **`investigating` → `escalated`**: 重大案件は医療システムへエスカレーション
- **`investigating` → `resolved`**: VoiceDrive内で完結可能な案件

**実装済みのステータス遷移検証**:
```typescript
const validTransitions: Record<string, string[]> = {
  received: ['triaging'],
  triaging: ['investigating', 'escalated', 'resolved'],
  investigating: ['escalated', 'resolved', 'closed'],
  escalated: ['investigating', 'resolved', 'closed'],
  resolved: ['closed'],
  closed: []
};
```

---

### 質問4: Severity（重要度）の再評価について

> エスカレーション後、医療システム側でSeverityを再評価して良いですか？

**回答**: ✅ **許可します（通知付き）**

医療システム側でのSeverity再評価を許可しますが、以下の条件を推奨：

**条件**:
1. **Webhook通知**: Severity変更時は`/status-update` Webhookで通知
2. **変更履歴**: 変更理由をInvestigationNoteに記録
3. **通報者への通知**: VoiceDrive側で通報者に変更を通知

**Severityレベル**:
| レベル | 説明 | エスカレーション判断 |
|--------|------|-------------------|
| `critical` | 生命・安全に関わる | 即時エスカレーション |
| `high` | 法的リスク、重大な倫理違反 | 24時間以内にエスカレーション |
| `medium` | 職場環境問題 | VoiceDrive内で対応、必要時エスカレーション |
| `low` | 軽微な改善提案 | VoiceDrive内完結 |

**実装済みのペイロード受信**:
```typescript
const { reportId, caseNumber, status, priority } = req.body;
await prisma.whistleblowingReport.update({
  where: { id: reportId },
  data: {
    priority: priority || report.priority, // 医療システムからの再評価を反映
    updatedAt: new Date()
  }
});
```

---

### 質問5: InvestigationNote（調査メモ）のAPI仕様

> InvestigationNoteのCRUD APIはVoiceDrive側で提供しますか？

**回答**: ✅ **Phase 2.10で提供予定（医療システムチームと調整中）**

InvestigationNoteは以下の2つのユースケースで使用：

#### ユースケース1: VoiceDrive内部調査メモ
- **用途**: VoiceDrive管理者がトリアージ・初期調査で使用
- **アクセス**: VoiceDrive内部のみ
- **API不要**: 医療システムからのアクセス不要

#### ユースケース2: 医療システム調査メモ（エスカレーション後）
- **用途**: 医療システム調査員が調査過程を記録
- **アクセス**: 医療システムが記録、VoiceDriveが参照
- **API必要**: Phase 2.10で以下のエンドポイント提供を検討

**提案するAPI仕様（Phase 2.10）**:

| エンドポイント | メソッド | 機能 | 認証 |
|--------------|---------|------|------|
| `/api/whistleblowing/:reportId/notes` | GET | 調査メモ一覧取得 | JWT Bearer |
| `/api/whistleblowing/:reportId/notes` | POST | 調査メモ作成 | JWT Bearer |
| `/api/whistleblowing/:reportId/notes/:noteId` | PUT | 調査メモ更新 | JWT Bearer |
| `/api/whistleblowing/:reportId/notes/:noteId` | DELETE | 調査メモ削除 | JWT Bearer |

**InvestigationNoteモデル（既存）**:
```prisma
model InvestigationNote {
  id                      String                 @id @default(cuid())
  whistleblowingReportId  String
  investigatorId          String
  content                 String
  createdAt               DateTime               @default(now())
  updatedAt               DateTime               @updatedAt
  isPrivate               Boolean                @default(false)

  whistleblowingReport    WhistleblowingReport   @relation("ReportInvestigationNotes", fields: [whistleblowingReportId], references: [id])
  investigator            User                   @relation("InvestigatorNotes", fields: [investigatorId], references: [id])
}
```

**次のステップ**:
- 医療システムチームとPhase 2.10のスコープ確認
- InvestigationNote API仕様の詳細化
- 実装スケジュール調整

---

### 質問6: 統合テストスケジュールの確認

> 統合テストは11/21（木）〜11/22（金）で良いですか？

**回答**: ✅ **承認します**

**統合テストスケジュール**:

| 日時 | 内容 | 担当 |
|------|------|------|
| **11/21（木） 10:00-12:00** | 環境セットアップ確認 | 両チーム |
| **11/21（木） 13:00-17:00** | Webhook送受信テスト | 両チーム |
| **11/22（金） 10:00-12:00** | ステータス遷移フローテスト | 両チーム |
| **11/22（金） 13:00-15:00** | エラーハンドリング・リトライテスト | 両チーム |
| **11/22（金） 15:00-17:00** | 総合動作確認・問題解決 | 両チーム |

**テスト環境**:
- **VoiceDrive**: `http://localhost:3003`
- **医療システム**: `http://localhost:3000`
- **共有シークレット**: 開発環境用（`.env.local`で管理）

**テストケース準備状況**:
- ✅ Webhook署名検証テスト
- ✅ タイムスタンプ有効期限テスト
- ✅ ステータス遷移検証テスト
- ✅ 冪等性テスト
- ✅ エラーレスポンステスト

---

## 📊 実装完了チェックリスト

### Phase 2.9 VoiceDrive側実装

| 項目 | 状態 | 備考 |
|------|------|------|
| Prismaスキーマ確認 | ✅ 完了 | WhistleblowingReportモデル既存、変更不要 |
| `/acknowledged` Webhookエンドポイント | ✅ 完了 | 新規追加実装 |
| `/status-update` Webhookエンドポイント | ✅ 完了 | 既存実装確認済み |
| `/resolution` Webhookエンドポイント | ✅ 完了 | 既存実装確認済み |
| Webhook署名検証（HMAC-SHA256） | ✅ 完了 | Phase 2.5と同じ方式 |
| タイムスタンプ検証（5分） | ✅ 完了 | Phase 2.5と同じ方式 |
| ステータス遷移検証ロジック | ✅ 完了 | validTransitions実装 |
| 冪等性保証 | ✅ 完了 | reportIdベースの更新 |
| server.ts登録 | ✅ 完了 | `/api/webhooks/medical-system/whistleblowing` |
| 環境変数設定 | ✅ 完了 | `MEDICAL_SYSTEM_WEBHOOK_SECRET` |
| エラーハンドリング | ✅ 完了 | 400/401/404/500レスポンス |
| ログ出力 | ✅ 完了 | Webhook受信・処理ログ |

---

## 🔐 セキュリティ要件

### 実装済みセキュリティ対策

1. **署名検証**
   - HMAC-SHA256による改ざん検知
   - タイミングセーフな比較（`crypto.timingSafeEqual`）

2. **タイムスタンプ検証**
   - 5分以内のリクエストのみ受付
   - リプレイアタック防止

3. **入力検証**
   - 必須フィールドの存在確認
   - データ型検証

4. **匿名性保護**
   - `userId`がnullの場合、匿名通報として扱う
   - `anonymousId`のみで識別

5. **エラー情報制御**
   - 内部エラー詳細は非公開
   - 汎用的なエラーメッセージのみ返却

---

## 📁 関連ドキュメント

- [MyReportDetailPage_DB要件分析_20251026.md](./MyReportDetailPage_DB要件分析_20251026.md)
- [MyReportDetailPage暫定マスターリスト_20251026.md](./MyReportDetailPage暫定マスターリスト_20251026.md)
- [MyReportsPage_実装完了報告_20251026.md](./MyReportsPage_実装完了報告_20251026.md)

---

## 🚀 次のステップ

### VoiceDrive側

1. **統合テスト準備**（11/21-11/22）
   - テストデータ準備
   - Webhook受信ログ監視環境構築
   - エラーケーステスト準備

2. **Phase 2.10検討**（11月下旬〜）
   - InvestigationNote API仕様確定
   - 医療システムチームとの調整

### 医療システム側への依頼事項

1. **Webhook送信実装**
   - `/acknowledged` エンドポイントへの送信実装
   - 署名生成ロジックの実装確認

2. **統合テスト準備**
   - テスト環境のエンドポイント共有
   - テストケース確認

3. **Phase 2.10スコープ確認**
   - InvestigationNote APIの必要性確認
   - 優先度・スケジュール調整

---

## 📞 連絡先

- **VoiceDriveチーム**: Slack #phase2-integration
- **技術的な質問**: mcp-shared経由でドキュメント共有
- **緊急連絡**: プロジェクトリード

---

**報告書作成日**: 2025年10月26日
**次回レビュー**: 統合テスト前日（11/20）
