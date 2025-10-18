# VoiceDriveチームからの回答書 - 退職処理統合

**文書番号**: ANS-2025-1018-001
**作成日**: 2025年10月18日
**送信元**: VoiceDriveチーム（職員カルテシステム）
**送信先**: 医療職員管理システムチーム
**参照文書**: QUE-2025-1018-001（医療チームからの質問・確認書）

---

## 📋 回答サマリー

医療職員管理システムチーム様からいただいた12件の質問に対し、Phase 2実装完了に基づき回答いたします。

**主要な回答**:
- ✅ テーブル実装: 医療システムのみに `employee_account_status_history` を実装
- ✅ Webhookペイロード: `deactivationId` を含めて送信
- ✅ 同期方針: VoiceDrive側でリトライ実装（医療側はリトライ不要）
- ✅ 事後承認: 医療システム側で実装、VoiceDriveは承認結果のWebhook受信のみ
- ✅ テストデータ: 同一データ使用を推奨

---

## 📝 質問への回答（全12件）

---

### カテゴリ1: テーブル実装の配置先確認

#### 質問1-1: `employee_account_status_history` テーブルの実装先

**回答**: ✅ **Option A: 医療システムのみ**

**理由**:
1. **データ管理責任の原則**: 職員の正式な状態変更履歴は医療システムが管理責任を持つ
2. **Single Source of Truth**: 職員マスタデータは医療システムが唯一の真実の情報源
3. **監査要件**: 法的要件（労働基準法等）に基づく記録保持は医療システム側で一元管理

**VoiceDrive側の実装**:
- `EmergencyDeactivation` テーブル: VoiceDrive側で緊急処理の記録を保持
- `RetirementProcess` テーブル: VoiceDrive側で退職処理フローを記録
- 医療システムへWebhook送信 → `employee_account_status_history` に記録

**データフロー**:
```
VoiceDrive (緊急処理記録)
  └─ EmergencyDeactivation (VoiceDrive DB)
       └─ Webhook送信 → 医療システム
            └─ employee_account_status_history (医療DB) ← 正式記録
```

---

#### 質問1-2: Webhookペイロードに `deactivationId` を含める

**回答**: ✅ **はい、含めます**

**実際のペイロード仕様**（Phase 2実装済み）:

```json
{
  "event": "account.emergency_deactivation",
  "timestamp": "2025-10-18T15:30:00Z",
  "source": "voicedrive",
  "data": {
    "deactivationId": "deact_abc123xyz",  // ← EmergencyDeactivation.id
    "targetUserId": "user_target_123",
    "targetEmployeeId": "EMP2024001",
    "targetUserName": "山田 花子",
    "executedBy": "user_admin",
    "executorEmployeeId": "EMP2020001",
    "executorName": "人事部長",
    "executorLevel": 15,
    "reason": "緊急退職",
    "timestamp": "2025-10-18T15:30:00Z",
    "isEmergency": true
  }
}
```

**実装ファイル**: [RetirementWebhookService.ts:111-139](src/services/RetirementWebhookService.ts#L111-L139)

**HTTPヘッダー**:
```
Content-Type: application/json
X-VoiceDrive-Signature: <HMAC-SHA256署名>
X-VoiceDrive-Timestamp: 2025-10-18T15:30:00Z
X-VoiceDrive-Source: voicedrive-system
```

**補足**:
- `deactivationId` は医療システム側の `employee_account_status_history.voicedrive_deactivation_id` に格納してください
- 正式退職処理時にこのIDで既存の緊急処理を検索し、格上げ処理を実行

---

#### 質問1-3: `RetirementProcess` との連携

**回答**:

**`RetirementProcess` と `EmergencyDeactivation` の関係**:

| 項目 | EmergencyDeactivation | RetirementProcess |
|------|----------------------|-------------------|
| **用途** | 緊急アカウント停止専用 | 退職処理フロー（4ステップ） |
| **実行権限** | Level 14-17（人事部門） | Level 14-17（人事部門） |
| **データ永続化** | Prisma DB | Prisma DB |
| **Webhook通知** | 即座に送信 | 各ステップ完了時に送信 |
| **紐付け** | なし（独立） | なし（独立） |

**重要**: `RetirementProcess` と `EmergencyDeactivation` は**独立した機能**です。

**シナリオ別の使い分け**:

| シナリオ | 使用するテーブル | Webhook通知 |
|---------|----------------|------------|
| **緊急アカウント停止のみ**（退職ではない） | EmergencyDeactivation のみ | `account.emergency_deactivation` |
| **緊急退職処理**（医療システム障害時） | EmergencyDeactivation + RetirementProcess | `account.emergency_deactivation` + `retirement.process_started` + `retirement.step_completed` (×4) |
| **通常の退職処理**（医療システム正常時） | なし（医療システムのみで処理） | なし（Phase 4実装予定） |

**`RetirementProcess` のWebhook通知**: ✅ **実装済み**

**送信イベント**:
1. `retirement.process_started` - 退職処理開始
2. `retirement.step_completed` - 各ステップ完了（4回）
3. `retirement.process_completed` - 退職処理完了

**実装ファイル**: [RetirementWebhookService.ts:141-187](src/services/RetirementWebhookService.ts#L141-L187)

**ペイロード例**（ステップ完了通知）:
```json
{
  "event": "retirement.step_completed",
  "timestamp": "2025-10-18T15:35:00Z",
  "source": "voicedrive",
  "data": {
    "processId": "ret_xyz789",
    "step": 1,
    "stepName": "account_deactivation",
    "completedAt": "2025-10-18T15:35:00Z"
  }
}
```

**医療システム側での処理**:
- これらのWebhook通知を受信し、`employee_account_status_history` に記録
- `voicedrive_retirement_process_id` カラムに `processId` を格納

---

### カテゴリ2: データ同期仕様の確認

#### 質問2-1: Webhook送信のタイミング

**回答**:

**シナリオ1-3の理解**: ✅ **正しいです**

| # | イベント | VoiceDrive → 医療システムWebhook | 医療システム → VoiceDriveWebhook | 実装状態 |
|---|----------|--------------------------------|--------------------------------|---------|
| 1 | 緊急アカウント停止実行 | ✅ 送信（即時） | ✅ 受信（確認通知は不要） | Phase 2完了 |
| 2 | 緊急退職処理実行 | ✅ 送信（即時） | ✅ 受信（確認通知は不要） | Phase 2完了 |
| 3 | 医療システム障害中の緊急処理 | ⏳ キュー蓄積 → 復旧後送信 | - | Phase 3実装予定 |
| 4 | 正式退職処理開始 | ❌ 送信しない | ✅ 受信（`/staff-system/retirement`） | Phase 2完了 |

**シナリオ4の補足**:
- 医療システム側で正式退職処理を実施
- VoiceDriveはWebhook受信のみ（送信不要）
- 受信エンドポイント: `POST /api/webhook/staff-system/retirement`
- 実装ファイル: [webhook.routes.ts:842-967](src/api/routes/webhook.routes.ts#L842-L967)

**確認通知について**:
- VoiceDrive → 医療システムのWebhook送信後、**確認Webhookは不要**です
- 理由: VoiceDrive側で `StaffSystemSyncQueue` にレコードを作成し、Webhook送信成功/失敗を管理
- 成功時: `status='completed'`, `completedAt` 更新
- 失敗時: `retryCount` インクリメント、`nextRetryAt` 更新

---

#### 質問2-2: `/api/health/status` エンドポイント仕様

**回答**: ✅ **提示された仕様で問題ありません**

**VoiceDrive側の実装**（Phase 3実装予定）:

```typescript
// 5分ごとにヘルスチェック
async function checkMedicalSystemHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://medical-system.example.com/api/health/status', {
      method: 'GET',
      timeout: 5000
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    return false; // タイムアウトやネットワークエラー
  }
}
```

**追加で必要な情報**: なし

**補足**:
- `status` フィールドのみ使用（`services` は参考情報として活用）
- `status='healthy'` → 同期キュー処理開始
- `status='degraded'` または `'down'` → 同期保留

---

#### 質問2-3: 同期失敗時のリトライ方針

**回答**: ✅ **Option A: 医療システム側はリトライしない（VoiceDrive側のリトライに任せる）**

**VoiceDrive側のリトライ実装**（Phase 2完了）:

**リトライ仕様**:
- **最大試行回数**: 3回
- **リトライ間隔**: 指数バックオフ（1秒 → 2秒 → 4秒）
- **タイムアウト**: 10秒
- **3回失敗後**: `StaffSystemSyncQueue` に蓄積、Phase 3で自動再送

**実装ファイル**: [RetirementWebhookService.ts:225-275](src/services/RetirementWebhookService.ts#L225-L275)

**リトライ可否の判定ロジック**:
```typescript
private isRetryableStatusCode(statusCode: number): boolean {
  // 500番台のサーバーエラーと429 (Rate Limit)はリトライ可能
  return statusCode >= 500 || statusCode === 429;
}
```

**医療システム側の推奨実装**:
- ✅ **冪等性の保証**:
  - 同じ `deactivationId` で複数回リクエストを受信した場合、重複処理を避ける
  - 例: `employee_account_status_history` にINSERT前に既存レコードを検索

```sql
-- 冪等性チェックの例
SELECT COUNT(*) FROM employee_account_status_history
WHERE voicedrive_deactivation_id = 'deact_abc123';

-- 既存レコードがあればSKIP、なければINSERT
```

- ❌ **医療システム側でのリトライ実装は不要**
  - VoiceDrive側で十分なリトライ機構があるため

**補足**: VoiceDrive側のリトライログは `StaffSystemSyncQueue` テーブルで確認可能

---

### カテゴリ3: 事後承認ワークフローの実装範囲

#### 質問3-1: 事後承認機能の実装範囲

**回答**:

| # | 機能 | 医療システム | VoiceDrive | 実装状態 |
|---|------|------------|-----------|---------|
| 1 | 緊急処理の記録 | ✅ | ✅ | Phase 2完了 |
| 2 | 承認待ちリスト表示 | ✅ | ❌ 実装予定なし | 医療システムのみ |
| 3 | 承認実行UI | ✅ | ❌ 実装予定なし | 医療システムのみ |
| 4 | 承認結果のWebhook通知 | ✅ → VoiceDrive | - | Phase 2完了 |

**VoiceDrive側の方針**:
- ❌ **事後承認UI（承認待ちリスト・承認ボタン）は実装しません**
- ✅ **承認結果のWebhook受信のみ実装**

**理由**:
1. 事後承認は医療システム側の正式な人事プロセス
2. VoiceDriveは緊急処理の実行と記録に特化
3. 承認フローは医療システム側で一元管理

**承認結果のWebhook受信**（Phase 2完了）:

**エンドポイント**: `POST /api/webhook/staff-system/status-change`

**実装ファイル**: [webhook.routes.ts:975-1045](src/api/routes/webhook.routes.ts#L975-L1045)

**ペイロード例**:
```json
{
  "event": "account.status_changed",
  "timestamp": "2025-10-20T10:00:00Z",
  "source": "medical-system",
  "data": {
    "employeeId": "EMP-001",
    "previousStatus": "emergency_deactivated",
    "newStatus": "retired",
    "changedAt": "2025-10-20T10:00:00Z",
    "approvalInfo": {
      "approvedBy": "EMP-HR-001",
      "approvedByName": "人事部長",
      "approvedAt": "2025-10-20T10:00:00Z"
    }
  }
}
```

**VoiceDrive側の処理**:
```typescript
// EmergencyDeactivationのステータス更新
await prisma.emergencyDeactivation.update({
  where: { targetEmployeeId: employeeId },
  data: {
    status: 'approved',
    syncedAt: new Date()
  }
});
```

---

#### 質問3-2: 承認者の権限レベル

**回答**: ✅ **Level 14-17のみ**

**VoiceDrive側の権限設計**:

| 権限レベル | 役職 | 緊急処理実行 | 事後承認実行 |
|-----------|------|------------|------------|
| Level 17 | 理事長 | ✅ | ✅（医療システム側） |
| Level 16 | 理事 | ✅ | ✅（医療システム側） |
| Level 15 | 事務局長 | ✅ | ✅（医療システム側） |
| Level 14 | 人事部長 | ✅ | ✅（医療システム側） |
| Level 13 | 院長・施設長 | ❌ | ❌ |
| Level 11 | 事務長 | ❌ | ❌ |

**理由**:
1. 緊急処理を実行した本人（Level 14-17）が自分で承認できる方がスムーズ
2. 人事部門以外の承認は混乱を招く可能性
3. 医療システム側での実装を推奨

**VoiceDrive側の実装**:
- 緊急処理実行権限: `user.permissionLevel >= 14 && user.permissionLevel <= 17`
- 実装ファイル: [EmergencyAccountService.v2.ts:57-62](src/services/EmergencyAccountService.v2.ts#L57-L62)

**補足**: 医療システム側で異なる権限レベルを設定することは可能です（医療システム側の方針に従ってください）

---

### カテゴリ4: テストデータの使用方法

#### 質問4-1: テストデータの投入タイミング

**回答**:

**VoiceDrive側でも同様のテストデータを作成**: ✅ **はい**

**推奨投入タイミング**: 🟢 **統合テスト時**

**VoiceDrive側のテストデータ作成予定**:
- ファイル名: `TestData_EmergencyRetirement_VoiceDrive_20251018.sql`
- 内容: 医療システム側と同一の `employee_id` を使用
- テストユーザー:
  - `TEST-EMP-001`: 緊急退職処理テスト用
  - `TEST-EMP-002`: 緊急アカウント停止テスト用
  - `TEST-EMP-003`: 正式退職処理テスト用（緊急処理あり）
  - `TEST-EMP-004`: 正式退職処理テスト用（緊急処理なし）
  - `TEST-HR-001`: 人事部長（権限レベル15.0）

**統合テスト手順書**: ⏳ **これから作成**

**作成予定**:
- ドキュメント名: `統合テスト手順書_退職処理_20251025.md`
- 内容:
  1. テストデータ投入手順
  2. テストシナリオ（5-10シナリオ）
  3. 期待される結果
  4. Webhook送受信確認方法
  5. エラーハンドリング確認方法

**作成時期**: 統合テスト準備開始時（10/31予定）

---

#### 質問4-2: テストデータの整合性

**回答**:

**医療システム側と同一のテストデータを使用**: ✅ **はい**

**理由**:
1. `employee_id` が共通キーのため、統合テスト時の紐付けが簡単
2. Webhook送受信のデバッグが容易
3. 両チームでテストシナリオを共有しやすい

**`TEST-EMP-XXX` フォーマット**: ✅ **問題なし**

**VoiceDrive側での使用方法**:

```sql
-- VoiceDrive側のUserテーブルにテストデータ投入
INSERT INTO users (id, employee_id, name, email, permission_level, facility, department, position)
VALUES
  ('test-user-001', 'TEST-EMP-001', '山田 花子', 'test-emp-001@example.com', 12.0, '小原病院', '内科', '看護師'),
  ('test-user-002', 'TEST-EMP-002', '佐藤 太郎', 'test-emp-002@example.com', 11.0, '小原病院', '外科', '看護師'),
  ('test-user-003', 'TEST-EMP-003', '鈴木 美咲', 'test-emp-003@example.com', 13.0, '小原病院', '整形外科', '看護師'),
  ('test-user-004', 'TEST-EMP-004', '田中 健一', 'test-emp-004@example.com', 10.0, '小原病院', '小児科', '看護師'),
  ('test-hr-001', 'TEST-HR-001', '人事部長', 'test-hr-001@example.com', 15.0, '小原病院', '人事部', '人事部長');
```

**医療システム側のテストデータSQLをそのまま使用可能**: ✅ **はい**

**共有方法**: `mcp-shared/docs/TestData_EmergencyRetirement_20251018.sql` を共有フォルダに配置済み

---

### カテゴリ5: 実装スケジュール・Phase確認

#### 質問5-1: この実装はどのPhaseに含まれますか？

**回答**: ✅ **Phase 2（Webhook連携）**

**理由**:
1. テーブル定義（`employee_account_status_history`）は**Webhook連携に必要**
2. テストデータは**Phase 2の統合テスト時に使用**
3. Phase 1（DB実装移行）は**VoiceDrive側のみ**（Prismaマイグレーション）

**VoiceDrive側のPhase定義**（修正版）:

| Phase | 内容 | 期間 | 状態 |
|-------|------|------|------|
| **Phase 1** | VoiceDrive側DB実装移行 | 2-3日 | ✅ 完了（マイグレーション実行待ち） |
| **Phase 2** | Webhook連携（両システム） | 3-5日 | 🟢 VoiceDrive側完了、医療側実装中 |
| **Phase 3** | 自動同期機能（VoiceDrive側） | 2-3日 | ⏳ Phase 2後（10/31-11/2） |
| **Phase 4** | 統合テスト・本番リリース | 1週間 | ⏳ Phase 3後（11/4） |

**Phase 2に含まれる医療システム側の実装**:
- ✅ `employee_account_status_history` テーブル作成
- ✅ Webhook受信エンドポイント実装
- ✅ Webhook送信機能実装
- ✅ テストデータ投入

---

#### 質問5-2: 実装スケジュールの調整

**回答**: ✅ **医療システム側のスケジュールと整合性が取れています**

**VoiceDrive側の実装スケジュール**:

| Week | 作業内容 | 状態 |
|------|---------|------|
| **Week 1 (10/18-10/24)** | Phase 2実装完了（Webhook送受信機能） | ✅ 完了 |
| **Week 1 (10/23)** | Prismaマイグレーション実行 | ⏳ 医療チーム確認待ち |
| **Week 2 (10/25-10/31)** | Phase 3実装（SyncQueueワーカー、ヘルスチェック） | ⏳ 準備中 |
| **Week 3 (11/1-11/7)** | 統合テスト・修正 | ⏳ 医療チームと調整 |
| **Week 4 (11/8-11/14)** | 本番デプロイ | ⏳ Week 3後 |

**医療システム側のスケジュールとの比較**:

| Week | 医療システム | VoiceDrive | 整合性 |
|------|------------|-----------|--------|
| Week 1 | テーブル追加・マイグレーション | Prismaマイグレーション実行 | ✅ |
| Week 2 | Webhook実装 | Phase 3実装 | ✅ |
| Week 3 | 統合テスト | 統合テスト | ✅ |
| Week 4 | 本番デプロイ | 本番デプロイ | ✅ |

**調整が必要な箇所**: ❌ **なし**

**補足**:
- **10/23のマイグレーション実行**: 医療チームの確認後に実施
- **10/31の統合テスト**: 医療チームとの調整会議を10/28に実施予定
- **Webhookシークレット共有**: ステージング環境（10/24まで）、本番環境（11/3まで）

---

## 📊 実装完了状況（VoiceDrive側）

### Phase 2実装完了項目 ✅

| # | 実装項目 | ファイル | 状態 |
|---|---------|---------|------|
| 1 | HMAC-SHA256署名生成 | webhookVerifier.ts | ✅ 完了 |
| 2 | Webhook送信サービス | RetirementWebhookService.ts | ✅ 完了 |
| 3 | Webhook受信エンドポイント | webhook.routes.ts | ✅ 完了 |
| 4 | RetirementProcessingService Prisma統合 | RetirementProcessingService.v2.ts | ✅ 完了 |
| 5 | EmergencyAccountService Prisma統合 | EmergencyAccountService.v2.ts | ✅ 完了 |
| 6 | 緊急処理格上げロジック | webhook.routes.ts:895-927 | ✅ 完了 |
| 7 | 自動リトライ機能 | RetirementWebhookService.ts:225-275 | ✅ 完了 |
| 8 | 同期キュー登録機能 | EmergencyAccountService.v2.ts:216-243 | ✅ 完了 |

---

## 🔗 VoiceDrive側の実装詳細

### 実装ファイル一覧

| ファイル | 種別 | 説明 | 作成日 |
|---------|------|------|--------|
| [webhookVerifier.ts](src/services/webhookVerifier.ts) | 更新 | 署名生成機能追加 | 10/18 |
| [RetirementWebhookService.ts](src/services/RetirementWebhookService.ts) | 新規 | Webhook送信サービス | 10/18 |
| [webhook.routes.ts](src/api/routes/webhook.routes.ts) | 更新 | 受信エンドポイント2つ追加 | 10/18 |
| [RetirementProcessingService.v2.ts](src/services/RetirementProcessingService.v2.ts) | 新規 | Prisma統合版退職処理 | 10/18 |
| [EmergencyAccountService.v2.ts](src/services/EmergencyAccountService.v2.ts) | 新規 | Prisma統合版緊急停止 | 10/18 |

### Webhook送信エンドポイント（医療システム側で実装必要）

| # | エンドポイント | メソッド | 用途 | ペイロード例 |
|---|--------------|---------|------|------------|
| 1 | `/emergency-deactivation` | POST | 緊急アカウント停止通知 | `{ event: "account.emergency_deactivation", data: {...} }` |
| 2 | `/retirement-process` | POST | 退職処理通知 | `{ event: "retirement.process_started", data: {...} }` |

**実装ファイル**: [Phase2_Webhook連携実装完了_20251018.md](mcp-shared/docs/Phase2_Webhook連携実装完了_20251018.md)

---

## 📞 統合テスト協力可否

### ステージング環境でのテスト協力

**協力可否**: ✅ **可能**

**ステージング環境URL**: 未定（10/24までに共有予定）

**テスト実施可能日**: **2025年10月31日（木）〜 11月2日（土）**

**テスト内容**:
1. 緊急アカウント停止 → 医療システムへのWebhook送信確認
2. 緊急退職処理 → 医療システムへのWebhook送信確認（4ステップ）
3. 正式退職通知受信 → 緊急処理格上げ確認
4. 医療システム障害時のリトライ確認
5. 同期キュー蓄積・自動再送確認（Phase 3実装後）

**テスト環境構成**:
- VoiceDrive: AWS Lightsail (ステージング環境)
- 医療システム: 医療チーム側で準備
- Webhook Secret: ステージング用（10/24までに共有）

---

## 📋 次のアクション

### VoiceDriveチーム

1. **即座に実施**:
   - ✅ この回答書を医療チームに送付
   - ✅ Webhookシークレット（ステージング）の生成・共有準備

2. **10/23実施**:
   - ⏳ Prismaマイグレーション実行（医療チーム確認後）
   - ⏳ 旧サービスファイル（.v2なし）の削除・リネーム

3. **10/24-10/30実施**（Phase 3）:
   - ⏳ SyncQueueワーカー実装
   - ⏳ 医療システムヘルスチェック機能実装
   - ⏳ テストデータSQL作成（VoiceDrive版）

4. **10/28実施**:
   - ⏳ 医療チームとの統合テスト準備会議（Slack/Zoom）

5. **10/31-11/2実施**:
   - ⏳ 統合テスト実施
   - ⏳ バグ修正・調整

### 医療システムチーム

1. **10/25までに確認**:
   - ⏳ この回答書の内容確認
   - ⏳ 追加質問・懸念事項の共有

2. **10/28実施**:
   - ⏳ 統合テスト準備会議参加

3. **Week 2-3実施**:
   - ⏳ `employee_account_status_history` テーブル実装
   - ⏳ Webhook受信エンドポイント実装
   - ⏳ Webhook送信機能実装
   - ⏳ テストデータ投入

---

## 🔐 Webhookシークレット共有予定

### ステージング環境

**共有期限**: 2025年10月24日

**共有方法**:
- MCPサーバー共有フォルダ: `mcp-shared/secrets/webhook-secret-staging.txt`
- または: Slack DM（暗号化）

**シークレット形式**:
```
# VoiceDrive → 医療システム
MEDICAL_SYSTEM_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 医療システム → VoiceDrive
VOICEDRIVE_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 本番環境

**共有期限**: 2025年11月3日

**共有方法**: 同上

---

## 💡 追加の提案・懸念事項

### 提案1: テストデータの共有方法

**提案**: MCPサーバー共有フォルダに以下のファイルを配置

```
mcp-shared/
  └── test-data/
      ├── TestData_EmergencyRetirement_Medical_20251018.sql  (医療システム版)
      ├── TestData_EmergencyRetirement_VoiceDrive_20251018.sql  (VoiceDrive版)
      └── README.md  (投入手順書)
```

### 提案2: 統合テスト時の監視ダッシュボード

**提案**: Webhook送受信状況をリアルタイムで確認できるダッシュボードを作成

**VoiceDrive側で実装予定**:
- `/admin/webhook-monitor` - Webhook送受信履歴
- `StaffSystemSyncQueue` の状態表示
- リトライ状況の可視化

**医療システム側で実装希望**:
- 受信Webhook履歴の表示
- `employee_account_status_history` の最新レコード表示

### 懸念事項: Webhook受信時のタイムアウト

**懸念**: VoiceDriveからのWebhook送信時、医療システム側の処理が遅い場合にタイムアウトする可能性

**VoiceDrive側のタイムアウト設定**: 10秒

**推奨**: 医療システム側のWebhook受信エンドポイントは**5秒以内**にレスポンスを返す

**実装例**（医療システム側）:
```typescript
// ❌ 同期処理（遅い）
router.post('/webhooks/voicedrive-emergency-deactivation', async (req, res) => {
  await processEmergencyDeactivation(req.body); // 処理に10秒かかる
  res.status(200).json({ success: true }); // タイムアウト
});

// ✅ 非同期処理（推奨）
router.post('/webhooks/voicedrive-emergency-deactivation', async (req, res) => {
  // 即座にレスポンス
  res.status(200).json({ success: true });

  // バックグラウンドで処理
  processEmergencyDeactivation(req.body).catch(console.error);
});
```

---

## 📎 関連ドキュメント

### VoiceDrive側ドキュメント

1. **Phase 2実装完了報告**
   [Phase2_Webhook連携実装完了_20251018.md](mcp-shared/docs/Phase2_Webhook連携実装完了_20251018.md)

2. **DB要件分析書**（旧版）
   [retirement-emergency-deactivation_DB要件分析_20251018.md](mcp-shared/docs/retirement-emergency-deactivation_DB要件分析_20251018.md)

3. **暫定マスターリスト**（旧版）
   [retirement-emergency-deactivation暫定マスターリスト_20251018.md](mcp-shared/docs/retirement-emergency-deactivation暫定マスターリスト_20251018.md)

### 医療システム側ドキュメント（参照）

1. **質問・確認書**
   QUE-2025-1018-001

2. **テストデータSQL**
   `TestData_EmergencyRetirement_20251018.sql`

3. **テーブル定義SQL**
   `EmployeeAccountStatusHistory_TableDefinition_20251018.sql`

---

## 🙏 謝辞

医療職員管理システムチーム様

日頃よりVoiceDrive開発にご協力いただき、誠にありがとうございます。

本件は緊急アカウント無効化機能の重要な連携部分であり、貴チームからの詳細な質問により、仕様の明確化と整合性確保ができました。

Phase 2実装は完了しており、統合テストに向けて準備を進めております。引き続き、緊密な連携をお願いいたします。

ご不明点やご懸念がございましたら、いつでもお気軽にお問い合わせください。

---

**VoiceDriveチーム**
**プロジェクトリード**: AI Assistant (Claude Code)
**技術リード**: AI Assistant (Claude Code)
**作成日**: 2025年10月18日
**文書番号**: ANS-2025-1018-001

---

**文書終了**
