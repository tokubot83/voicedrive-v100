# アカウント無効化機能 連携要件確認書（改訂版）

**文書番号**: RES-2025-1010-001-R1
**作成日**: 2025年10月10日
**改訂日**: 2025年10月10日
**送信元**: VoiceDriveチーム（職員カルテシステム）
**送信先**: 医療職員管理システムチーム
**件名**: アカウント緊急無効化機能の連携要件確認と実装依頼
**回答期限**: 2025年10月24日（2週間以内）

---

## 📋 30秒サマリー

**何を**: アカウント緊急停止機能の医療システム連携
**なぜ**: 医療システム障害時の業務継続性確保、監査要件
**誰が**: 人事部門（レベル14-17）のみ使用
**いつまでに**: 2週間以内に仕様確認、4週間以内に実装完了

**医療チームへの依頼**:
- ✅ Webhook受信エンドポイント実装（2-3日）
- ✅ Webhook送信機能実装（1-2日）
- ✅ ヘルスチェックAPI実装（1日）

**総所要時間**: 約1-2週間（推定）

---

## 📋 エグゼクティブサマリー

VoiceDriveチームでは、医療職員管理システム障害時の応急措置として**アカウント緊急無効化機能**を実装中です。この機能は人事部門（レベル14-17）専用であり、監査要件を満たすため医療システムとの連携が必須となります。

### ✅ VoiceDrive側で対応済み・対応予定

| 項目 | 状態 | 期間 |
|------|------|------|
| DB実装移行（LocalStorage→Prisma） | ⏳ Phase 1 | 2-3日 |
| テーブル追加（3件） | ✅ 設計完了 | - |
| Webhook送信実装 | ⏳ Phase 2 | 3-5日 |
| Webhook受信実装 | ⏳ Phase 2 | 3-5日 |
| 自動同期機能 | ⏳ Phase 3 | 2-3日 |

### ❓ 医療システムチームへの依頼・確認事項

#### 🔴 **必須依頼事項（3件）**
1. **Webhook受信エンドポイント**: アカウント停止通知の受信
2. **Webhook送信機能**: 停止完了確認の送信
3. **ヘルスチェックAPI**: システム稼働状態の提供

#### ❓ **確認事項（3件）**
1. アカウント無効化の処理方針（Option A/B/C）
2. Webhookリトライポリシー
3. HMAC署名仕様の確認

---

## 🎯 プロジェクト背景

### 機能の目的
**アカウント緊急無効化機能**は、医療職員管理システム障害時に人事部門が緊急対応としてアカウントを即座に停止できる機能です。

### 利用シーン例
1. **退職者のアカウント即時停止**: 医療システム障害中に退職者が発生
2. **セキュリティインシデント対応**: 不正アクセスの疑い
3. **コンプライアンス対応**: 懲戒処分等で即座にアクセス遮断

### 権限制限
- **レベル14-17**（人事部長、事務局長、理事、理事長）のみ
- 全操作は監査ログに記録

### 現在の実装状況

| 項目 | 状態 | 備考 |
|------|------|------|
| UI実装 | ✅ 完了 | EmergencyAccountDeactivation.tsx |
| 権限チェック | ✅ 完了 | レベル14-17のみ |
| データ永続化 | ⚠️ LocalStorage | Phase 1でDB移行 |
| 医療システム連携 | ❌ 未実装 | 本件の対象 |

---

## 🔗 医療システムへの依頼内容

### 📌 依頼1: Webhook受信エンドポイント実装

#### 概要
VoiceDriveからアカウント緊急停止通知を受信するエンドポイント

#### エンドポイント仕様

**URL**: `POST /api/webhooks/voicedrive-emergency-deactivation`

**認証**: HMAC-SHA256署名検証

**タイムアウト**: 30秒

**ペイロード例**:
```json
{
  "eventType": "account.emergency_deactivation",
  "timestamp": "2025-10-10T15:30:00Z",
  "deactivationId": "deact_abc123",
  "employeeId": "EMP2024001",
  "targetUserId": "user_level1_staff",
  "reason": "退職処理・医療システム障害中のため緊急停止",
  "executedBy": {
    "userId": "user_admin",
    "employeeId": "EMP2020001",
    "name": "人事部長",
    "permissionLevel": 15
  },
  "signature": "abc123..."
}
```

**フィールド説明**:

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `eventType` | string | ✅ | 固定値: `"account.emergency_deactivation"` |
| `timestamp` | ISO 8601 | ✅ | 停止実行日時（UTC） |
| `deactivationId` | string | ✅ | VoiceDrive側の停止記録ID |
| `employeeId` | string | ✅ | 対象職員の職員コード |
| `targetUserId` | string | ✅ | VoiceDrive側のユーザーID |
| `reason` | string | ✅ | 停止理由（監査用） |
| `executedBy.employeeId` | string | ✅ | 実行者の職員コード |
| `executedBy.name` | string | ✅ | 実行者の氏名 |
| `executedBy.permissionLevel` | number | ✅ | 実行者の権限レベル（14-17） |

#### 期待される処理

**最小実装（必須）**:
```typescript
// 1. 署名検証
const isValid = verifyHMAC(payload, signature);
if (!isValid) return { error: 'Invalid signature', status: 401 };

// 2. Employee.accountStatus更新
await prisma.employee.update({
  where: { employeeId: payload.employeeId },
  data: {
    accountStatus: 'inactive',
    lastModifiedBy: payload.executedBy.employeeId,
    lastModifiedAt: new Date()
  }
});

// 3. 確認Webhook送信（依頼2参照）
await sendConfirmationToVoiceDrive(payload.deactivationId);

return { status: 'ok' };
```

**推奨実装（履歴記録）**:
```typescript
// EmployeeAccountStatusHistory記録
await prisma.employeeAccountStatusHistory.create({
  data: {
    employeeId: payload.employeeId,
    previousStatus: 'active',
    newStatus: 'inactive',
    reason: payload.reason,
    changedBy: payload.executedBy.employeeId,
    changedByName: payload.executedBy.name,
    isEmergencyChange: true,
    sourceSystem: 'voicedrive',
    voiceDriveDeactivationId: payload.deactivationId
  }
});
```

#### レスポンス仕様

**成功時（200 OK）**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-10T15:30:05Z"
}
```

**エラー時（401/500）**:
```json
{
  "error": "Invalid signature",
  "timestamp": "2025-10-10T15:30:05Z"
}
```

---

### 📌 依頼2: 確認Webhook送信機能実装

#### 概要
医療システム側でアカウント無効化処理完了後、VoiceDriveへ確認通知を送信

#### エンドポイント仕様（VoiceDrive側）

**URL**: `POST https://voicedrive.ai/api/webhooks/account-deactivation-confirmed`

**認証**: HMAC-SHA256署名

**タイムアウト**: 30秒

**ペイロード例**:
```json
{
  "eventType": "account.deactivation_confirmed",
  "timestamp": "2025-10-10T15:30:45Z",
  "deactivationId": "deact_abc123",
  "employeeId": "EMP2024001",
  "status": "completed",
  "medicalSystemConfirmedAt": "2025-10-10T15:30:40Z",
  "signature": "xyz789..."
}
```

**フィールド説明**:

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `eventType` | string | ✅ | 固定値: `"account.deactivation_confirmed"` |
| `timestamp` | ISO 8601 | ✅ | Webhook送信日時 |
| `deactivationId` | string | ✅ | VoiceDrive側の停止記録ID（依頼1で受信） |
| `employeeId` | string | ✅ | 対象職員の職員コード |
| `status` | string | ✅ | 処理結果: `"completed"` or `"failed"` |
| `medicalSystemConfirmedAt` | ISO 8601 | ✅ | 医療システム側の処理完了日時 |

#### 医療システム側の実装例

```typescript
// 医療システム: src/services/VoiceDriveWebhookService.ts
export async function sendConfirmationToVoiceDrive(deactivationId: string) {
  const payload = {
    eventType: 'account.deactivation_confirmed',
    timestamp: new Date().toISOString(),
    deactivationId: deactivationId,
    employeeId: employee.employeeId,
    status: 'completed',
    medicalSystemConfirmedAt: new Date().toISOString()
  };

  const signature = generateHMAC(payload, process.env.VOICEDRIVE_WEBHOOK_SECRET);

  await fetch('https://voicedrive.ai/api/webhooks/account-deactivation-confirmed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Medical-System-Signature': signature
    },
    body: JSON.stringify(payload),
    timeout: 30000
  });
}
```

---

### 📌 依頼3: ヘルスチェックAPI実装

#### 概要
医療システムの稼働状態を確認するヘルスチェックAPI

#### 用途
- VoiceDrive側で医療システムの復旧を自動検知
- 同期キューに蓄積された操作を自動送信

#### エンドポイント仕様

**URL**: `GET /api/health/status`

**認証**: 不要（パブリックエンドポイント）

**Rate Limit**: 10 req/min/IP（推奨）

**レスポンス例（正常時）**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-10T15:30:00Z",
  "services": {
    "database": "healthy",
    "api": "healthy",
    "webhooks": "healthy"
  },
  "uptime": 86400,
  "version": "1.0.0"
}
```

**レスポンス例（障害時）**:
```json
{
  "status": "unhealthy",
  "timestamp": "2025-10-10T15:30:00Z",
  "services": {
    "database": "healthy",
    "api": "degraded",
    "webhooks": "unhealthy"
  }
}
```

**フィールド説明**:

| フィールド | 型 | 説明 |
|-----------|------|------|
| `status` | string | 全体ステータス: `"healthy"` or `"unhealthy"` |
| `timestamp` | ISO 8601 | レスポンス生成日時 |
| `services.database` | string | DB状態 |
| `services.api` | string | API状態 |
| `services.webhooks` | string | Webhook受信状態 |

#### VoiceDrive側の使用方法

```typescript
// 5分ごとにヘルスチェック
cron.schedule('*/5 * * * *', async () => {
  const response = await fetch('https://medical-system.local/api/health/status');

  if (response.ok) {
    const health = await response.json();

    if (health.status === 'healthy') {
      console.log('医療システム復旧検知 → 同期キュー処理開始');
      await processSyncQueue();
    }
  }
});
```

---

## ❓ 医療システムチームへの確認事項

### 確認1: アカウント無効化の処理方針

VoiceDriveから緊急アカウント停止通知を受けた場合、医療システム側ではどの処理を行いますか？

#### Option A: `Employee.accountStatus`のみ更新 🟢 **VoiceDrive推奨**

```typescript
await prisma.employee.update({
  where: { employeeId: payload.employeeId },
  data: {
    accountStatus: 'inactive'
    // isRetiredは手動確認後に更新
  }
});
```

**メリット**:
- 緊急停止≠退職を明確化
- 人事部門が後から正式な退職処理可能
- データ不整合リスクが低い

---

#### Option B: `Employee.accountStatus`と`isRetired`を両方更新

```typescript
await prisma.employee.update({
  where: { employeeId: payload.employeeId },
  data: {
    accountStatus: 'inactive',
    isRetired: true,
    retiredAt: new Date()
  }
});
```

**メリット**:
- 緊急停止 = 退職とみなす
- データ整合性がシンプル

**デメリット**:
- 誤停止時の復旧が複雑

---

#### Option C: カスタム処理

貴チームの業務ロジックに基づいた独自処理

---

### 確認2: Webhookリトライポリシー

#### VoiceDrive側の方針

**VoiceDrive → 医療システム**:
- リトライ回数: **3回**
- リトライ間隔: **1分、5分、15分**
- タイムアウト: **30秒**
- 失敗時: StaffSystemSyncQueueに蓄積、医療システム復旧後に自動送信

**質問1**: 医療システム側のリトライ方針（医療システム → VoiceDrive）はどうしますか？

---

### 確認3: セキュリティ（HMAC署名）

#### VoiceDrive側の実装

**署名生成**:
```typescript
import crypto from 'crypto';

function generateHMAC(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}
```

**署名検証**:
```typescript
function verifyHMAC(payload: any, signature: string, secret: string): boolean {
  const expectedSignature = generateHMAC(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**シークレットキー管理**:
- 環境変数で管理: `MEDICAL_SYSTEM_WEBHOOK_SECRET`
- AWS Secrets Manager使用（本番環境）

**質問2**: 医療システム側も同様の実装で問題ありませんか？

**質問3**: シークレットキーの共有方法はどうしますか？
- [ ] Slackで暗号化して送信
- [ ] AWS Secrets Manager経由
- [ ] その他（              ）

---

## 📝 回答用テンプレート

以下をコピーしてご回答ください：

```markdown
---
## 医療システムチームからの回答

**回答者**: ___________
**回答日**: ___________

### 確認1: アカウント無効化の処理方針
- [ ] Option A: accountStatusのみ更新（VoiceDrive推奨）
- [ ] Option B: accountStatusとisRetired両方更新
- [ ] Option C: カスタム処理（詳細: _________________）

**理由・備考**:
_________________________________________________________________

---

### 確認2: Webhookリトライポリシー
**医療システム → VoiceDrive**:
- リトライ回数: ___回
- リトライ間隔: ___, ___, ___分
- タイムアウト: ___秒
- 失敗時の処理: _______________________________________

---

### 確認3: セキュリティ（HMAC署名）
- HMAC-SHA256: [ ] OK / [ ] 別方式（詳細: __________）
- シークレット管理: [ ] 環境変数 / [ ] AWS Secrets Manager / [ ] その他（_______）
- シークレット共有方法: [ ] Slack暗号化 / [ ] AWS / [ ] その他（_______）

---

### 依頼1-3の実装可否
- [ ] すべて対応可能
  - 完了予定日: ___/___/___
  - 担当者: ___________
- [ ] 一部対応不可
  - 対応不可の項目: _______________________
  - 理由: _________________________________

---

### 追加の質問・懸念事項
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---
```

---

## ⚠️ リスク分析と対策

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|---------|------|
| 医療システム障害中にWebhook送信失敗 | 🔴 HIGH | 🟡 MEDIUM | StaffSystemSyncQueueに蓄積、復旧後自動送信（依頼3） |
| Webhook受信時のDB更新失敗 | 🔴 HIGH | 🟢 LOW | トランザクション管理、エラー時ロールバック、リトライ |
| 署名検証失敗（鍵の不一致） | 🟡 MEDIUM | 🟢 LOW | 事前テスト環境での検証、キー管理手順書作成 |
| ヘルスチェックタイムアウト | 🟢 LOW | 🟡 MEDIUM | 10秒タイムアウト、次回リトライ（5分後） |
| データ不整合（VD/医療で異なる状態） | 🟡 MEDIUM | 🟢 LOW | 定期的な整合性チェックバッチ（日次） |
| Webhook送信順序の逆転 | 🟢 LOW | 🟢 LOW | タイムスタンプ検証、古いイベントは無視 |

---

## ❓ よくある質問（FAQ）

### Q1: 緊急停止したアカウントの復活は可能ですか？
**A**: はい。人事部門が `reactivateAccount()` で復活可能です。ただし、医療システム側でも `accountStatus: 'active'` への更新が必要です。復活時も同様のWebhook連携を実装予定です（Phase 4）。

### Q2: Webhook送信失敗時のデータ不整合をどう防ぎますか？
**A**: VoiceDrive側で `StaffSystemSyncQueue` テーブルで管理し、医療システム復旧後に自動再送信します。最大3回リトライ後も失敗する場合はアラート通知（Slack）を送信し、手動対応を促します。

### Q3: 本番環境での署名検証キーはどう共有しますか？
**A**: AWS Secrets Managerで管理し、デプロイ時に環境変数として注入します。キーのローテーションも可能です。初期キーは暗号化Slackメッセージで共有します。

### Q4: テスト環境で事前検証できますか？
**A**: はい。ステージング環境で完全な統合テストを実施します（Week 3予定）。医療システム側のステージング環境エンドポイントを事前にご共有ください。

### Q5: Webhookの順序保証は必要ですか？
**A**: 基本的には不要です。`deactivationId` で重複チェックを行い、タイムスタンプで新しいイベントを優先します。ただし、短時間に大量のWebhookが発生する可能性は低いです。

### Q6: 医療システム障害が長期化した場合は？
**A**: VoiceDrive側で最大1週間分の同期キューを保持します。1週間以上の障害時は手動での整合性確認を推奨します。

### Q7: 監査ログの保持期間は？
**A**: VoiceDrive側は最低7年間保持します（医療法準拠）。医療システム側の保持期間をご教示ください。

### Q8: Webhookの送信頻度制限はありますか？
**A**: VoiceDrive側からは最大10 req/min程度を想定しています（人事部門の手動操作のため）。医療システム側のRate Limitがあればご教示ください。

---

## 📊 成功指標（KPI）

### 機能要件
- [ ] レベル14-17のみアクセス可能（権限チェック100%動作）
- [ ] 全操作が監査ログに記録（記録率100%）
- [ ] Webhook送信成功率 99%以上（リトライ含む）
- [ ] 同期キュー処理遅延 5分以内（医療システム復旧後）

### 非機能要件
- [ ] Webhook応答時間 30秒以内（95%ile）
- [ ] ヘルスチェック応答時間 10秒以内（95%ile）
- [ ] データ不整合 0件/月
- [ ] 監査証跡の完全性 100%

### セキュリティ要件
- [ ] HMAC署名検証 100%実施
- [ ] 署名検証失敗時のアラート通知 100%
- [ ] 不正アクセス試行 0件/月
- [ ] キーローテーション 6ヶ月ごと

### 運用要件
- [ ] エラー発生時のアラート通知 5分以内
- [ ] 障害復旧時間（MTTR） 30分以内
- [ ] ドキュメント整備率 100%
- [ ] 運用手順書の定期更新 3ヶ月ごと

---

## 📅 想定スケジュール

### 全体スケジュール（4週間）

```
Week 1: 要件確認・仕様合意
├─ Day 1-2: 医療チームからの回答受領
├─ Day 3-4: 仕様詳細化・疑問点解消
└─ Day 5: Phase 1開始（VoiceDrive DB実装）

Week 2: 並行実装
├─ VoiceDrive: Phase 1完了、Phase 2開始
└─ 医療システム: 依頼1-3実装

Week 3: 統合テスト
├─ Day 1-2: ステージング環境統合テスト
├─ Day 3-4: バグ修正・再テスト
└─ Day 5: 本番環境デプロイ準備

Week 4: 本番リリース
├─ Day 1: 本番環境デプロイ（段階的）
├─ Day 2-3: 監視・動作確認
└─ Day 4-5: ドキュメント整備・運用引継ぎ
```

---

### VoiceDrive側の実装スケジュール

| Phase | 内容 | 期間 | 状態 | 依存 |
|-------|------|------|------|------|
| **Phase 1** | DB実装移行 | 2-3日 | ⏳ 準備中 | なし |
| **Phase 2** | Webhook連携 | 3-5日 | ⏳ 医療実装待ち | Phase 1完了 |
| **Phase 3** | 自動同期機能 | 2-3日 | ⏳ Phase 2後 | Phase 2完了 |
| **Phase 4** | 統合テスト | 1週間 | ⏳ Phase 3後 | 医療実装完了 |

**総所要時間**: 約2-3週間（医療システム側の実装と並行）

---

### 医療システム側の実装依頼スケジュール

| 項目 | 所要時間（推定） | 優先度 | 依存 |
|------|----------------|--------|------|
| **依頼1**: Webhook受信 | 2-3日 | 🔴 HIGH | なし |
| **依頼2**: Webhook送信 | 1-2日 | 🔴 HIGH | 依頼1完了 |
| **依頼3**: ヘルスチェックAPI | 1日 | 🟡 MEDIUM | なし |
| **推奨**: AccountStatusHistory | 1日 | 🟢 LOW | なし |
| **統合テスト** | 2-3日 | 🔴 HIGH | 全依頼完了 |

**総所要時間**: 約1-2週間

---

### マイルストーン

| 日程 | マイルストーン | VoiceDrive | 医療システム | ゲート条件 |
|------|--------------|-----------|-------------|----------|
| **Week 1** | 要件確定 | 仕様確認 | 🔴 回答・承認 | 確認事項への回答完了 |
| **Week 2** | 実装完了 | Phase 1-2実装 | 🔴 依頼1-3実装 | 両システム実装完了 |
| **Week 3** | 統合テスト合格 | テスト実施 | テスト実施 | 全テスト項目合格 |
| **Week 4** | 本番リリース | デプロイ | デプロイ | 段階的ロールアウト完了 |

---

## 📊 データフロー図

### 正常時のフロー

```
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ①人事部門が緊急停止実行                                      │
│  ②EmergencyDeactivation + AuditLog + SyncQueue保存           │
│  ③Webhook送信（依頼1）                                        │
│    └─ POST /api/webhooks/voicedrive-emergency-deactivation  │
└─────────────────────────────────────────────────────────────┘
               │ HTTPS + HMAC-SHA256
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  医療職員管理システム                         │
│                                                               │
│  ④Webhook受信・署名検証                                       │
│  ⑤Employee.accountStatus = 'inactive' 更新                   │
│  ⑥EmployeeAccountStatusHistory記録（推奨）                   │
│  ⑦確認Webhook送信（依頼2）                                    │
│    └─ POST /api/webhooks/account-deactivation-confirmed    │
└─────────────────────────────────────────────────────────────┘
               │ HTTPS + HMAC-SHA256
               ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ⑧確認Webhook受信・署名検証                                   │
│  ⑨EmergencyDeactivation.syncToStaffSystem = true 更新        │
│  ⑩SyncQueue.status = 'completed' 更新                        │
│  ⑪User.isRetired = true 更新（キャッシュ）                    │
└─────────────────────────────────────────────────────────────┘
```

### 医療システム障害時のフロー

```
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ①人事部門が緊急停止実行                                      │
│  ②DB保存（EmergencyDeactivation + AuditLog + SyncQueue）     │
│  ③Webhook送信失敗（医療システム障害中）                      │
│  ④SyncQueue.status = 'queued' のまま保持                     │
│  ⑤5分ごとにヘルスチェック（依頼3）                           │
│    └─ GET /api/health/status                                │
│  ⑥医療システム復旧検知（status: 'healthy'）                  │
│  ⑦SyncQueue処理開始                                          │
│  ⑧Webhook再送信成功                                          │
│  ⑨確認Webhook受信                                            │
│  ⑩同期完了                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 VoiceDrive側のDB実装詳細

### Table 1: EmergencyDeactivation

**優先度**: 🔴 CRITICAL

```prisma
model EmergencyDeactivation {
  id                  String    @id @default(cuid())
  targetUserId        String    @map("target_user_id")
  targetEmployeeId    String?   @map("target_employee_id")
  executedBy          String    @map("executed_by")
  executorEmployeeId  String?   @map("executor_employee_id")
  executorName        String?   @map("executor_name")
  executorLevel       Float     @map("executor_level")
  reason              String    @db.Text
  timestamp           DateTime  @default(now())
  isEmergency         Boolean   @default(true) @map("is_emergency")
  syncToStaffSystem   Boolean   @default(false) @map("sync_to_staff_system")
  syncedAt            DateTime? @map("synced_at")
  status              String    @default("pending")
  errorMessage        String?   @map("error_message")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  @@index([targetUserId])
  @@index([executedBy])
  @@index([status])
  @@map("emergency_deactivations")
}
```

---

### Table 2: StaffSystemSyncQueue

**優先度**: 🔴 CRITICAL

```prisma
model StaffSystemSyncQueue {
  id                    String    @id @default(cuid())
  type                  String
  targetUserId          String?   @map("target_user_id")
  targetEmployeeId      String?   @map("target_employee_id")
  payload               Json
  status                String    @default("queued")
  retryCount            Int       @default(0) @map("retry_count")
  maxRetries            Int       @default(3) @map("max_retries")
  queuedAt              DateTime  @default(now()) @map("queued_at")
  processedAt           DateTime? @map("processed_at")
  completedAt           DateTime? @map("completed_at")
  nextRetryAt           DateTime? @map("next_retry_at")
  errorMessage          String?   @map("error_message")
  relatedDeactivationId String?   @map("related_deactivation_id")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@index([status])
  @@index([type])
  @@map("staff_system_sync_queue")
}
```

---

### Table 3: AuditLog拡張

**優先度**: 🟡 RECOMMENDED

**追加フィールド**:
- `executorLevel`: 実行者の権限レベル
- `targetUserId`: 対象ユーザーID
- `reason`: 理由
- `isEmergencyAction`: 緊急操作フラグ
- `syncPending`: 同期待ちフラグ

---

## 📋 医療システム側の推奨DB実装

### 推奨Table: EmployeeAccountStatusHistory

**優先度**: 🟡 RECOMMENDED

```prisma
model EmployeeAccountStatusHistory {
  id                       String    @id @default(cuid())
  employeeId               String    @map("employee_id")
  previousStatus           String    @map("previous_status")
  newStatus                String    @map("new_status")
  reason                   String    @db.Text
  changedBy                String    @map("changed_by")
  changedByName            String?   @map("changed_by_name")
  isEmergencyChange        Boolean   @default(false) @map("is_emergency_change")
  sourceSystem             String    @default("medical_system")
  voiceDriveDeactivationId String?   @map("voicedrive_deactivation_id")
  changedAt                DateTime  @default(now()) @map("changed_at")
  createdAt                DateTime  @default(now()) @map("created_at")

  employee Employee @relation(fields: [employeeId], references: [id])

  @@index([employeeId])
  @@index([changedAt])
  @@index([sourceSystem])
  @@map("employee_account_status_history")
}
```

**メリット**:
- アカウント状態変更の完全な監査証跡
- VoiceDriveからの緊急停止を識別可能
- コンプライアンス要件を満たす

---

## ✅ アクションアイテム

### 医療システムチーム様へのお願い（2週間以内: 2025/10/24まで）

#### 🔴 必須（実装依頼）

- [ ] **依頼1**: Webhook受信エンドポイント実装
  - 実装担当者: ___________
  - 完了予定日: ___/___/___

- [ ] **依頼2**: 確認Webhook送信実装
  - 実装担当者: ___________
  - 完了予定日: ___/___/___

- [ ] **依頼3**: ヘルスチェックAPI実装
  - 実装担当者: ___________
  - 完了予定日: ___/___/___

#### ❓ 確認事項（1週間以内: 2025/10/17まで）

- [ ] **確認1**: アカウント無効化の処理方針（Option A/B/C）
- [ ] **確認2**: Webhookリトライポリシー
- [ ] **確認3**: HMAC署名仕様の確認

#### 🟡 推奨

- [ ] **推奨**: EmployeeAccountStatusHistory実装
  - 実装担当者: ___________
  - 完了予定日: ___/___/___

---

### VoiceDriveチーム（参考情報）

#### Phase 1: DB実装（今週中）
- [ ] EmergencyDeactivationテーブル追加
- [ ] StaffSystemSyncQueueテーブル追加
- [ ] AuditLog拡張
- [ ] EmergencyAccountService.ts修正

#### Phase 2: Webhook連携（来週）
- [ ] MedicalSystemWebhookService.ts実装
- [ ] /api/webhooks/account-deactivation-confirmed.ts実装
- [ ] HMAC署名実装

#### Phase 3: 自動同期（再来週）
- [ ] checkMedicalSystemHealth.ts実装
- [ ] processSyncQueue.ts実装
- [ ] cronジョブ設定

---

## 📝 テスト計画

### 単体テスト

#### VoiceDrive側
- [ ] EmergencyAccountService.deactivateAccount()
- [ ] MedicalSystemWebhookService.sendNotification()
- [ ] HMAC署名生成・検証
- [ ] SyncQueue処理ロジック

#### 医療システム側
- [ ] Webhook受信・署名検証
- [ ] Employee.accountStatus更新
- [ ] EmployeeAccountStatusHistory記録
- [ ] 確認Webhook送信

---

### 統合テスト

| テストケース | 期待結果 | 担当 |
|------------|---------|------|
| 正常フロー（障害なし） | Webhook送受信成功、DB更新成功 | 両チーム |
| 医療システム障害時 | SyncQueueに蓄積 | VD |
| 医療システム復旧後 | 自動同期成功 | 両チーム |
| Webhook署名検証失敗 | 401エラー、アラート通知 | 両チーム |
| Webhook送信失敗（ネットワークエラー） | リトライ成功 | VD |
| DB更新失敗 | ロールバック、エラーログ | 医療 |
| 重複Webhook受信 | 重複検出、処理スキップ | 医療 |
| タイムアウト | 30秒でタイムアウト、リトライ | 両チーム |

---

### 負荷テスト

| シナリオ | 想定負荷 | 目標 |
|---------|---------|------|
| Webhook同時送信 | 10 req/min | 全て30秒以内に処理 |
| ヘルスチェック | 12 req/hour | 全て10秒以内に応答 |
| SyncQueue処理 | 100件/バッチ | 5分以内に全件処理 |

---

## 📝 ドキュメント整備計画

### VoiceDrive側
- [ ] API仕様書（OpenAPI 3.0）
- [ ] Webhook実装ガイド
- [ ] 運用手順書
- [ ] トラブルシューティングガイド
- [ ] HMAC署名検証マニュアル

### 医療システム側
- [ ] Webhook受信エンドポイント仕様書
- [ ] ヘルスチェックAPI仕様書
- [ ] エラーコード一覧
- [ ] 運用手順書

---

## 📞 連絡先

### VoiceDriveチーム

**Slack**: `#voicedrive-medical-system-integration`
**Email**: voicedrive-dev@example.com
**MCP共有フォルダ**: `mcp-shared/docs/`

**プロジェクトリード**: ___________
**技術リード**: ___________
**緊急連絡先**: DM（24時間対応）

---

### 医療システムチーム

**Slack**: `#medical-system-integration`
**Email**: medical-system-dev@example.com

**プロジェクトリード**: ___________（ご記入ください）
**技術リード**: ___________（ご記入ください）
**緊急連絡先**: ___________（ご記入ください）

---

## 🙏 謝辞

日頃より医療職員管理システムの開発にご尽力いただき、誠にありがとうございます。

本件は**アカウント緊急無効化機能**という医療現場の業務継続性に直結する重要な機能です。貴チームのご協力により、より安全で信頼性の高いシステムを実現できると確信しております。

ご多忙のところ恐縮ですが、上記依頼事項および確認事項につきまして、**2週間以内（2025年10月24日まで）**にご回答いただけますと幸いです。

特に**確認事項（1-3）**については、実装に着手する前に方針を確定したいため、**1週間以内（2025年10月17日まで）**にご回答いただけますと大変助かります。

ご不明点やご質問がございましたら、いつでもお気軽にお問い合わせください。

引き続きよろしくお願いいたします。

---

**VoiceDriveチーム（職員カルテシステム）**

**作成日**: 2025年10月10日
**改訂日**: 2025年10月10日
**文書番号**: RES-2025-1010-001-R1
**バージョン**: 1.1（改訂版）

---

## 📎 添付資料

1. **データ管理責任分界点定義書** (`mcp-shared/docs/データ管理責任分界点定義書_20251008.md`)
2. **アカウント無効化 DB要件分析** (`mcp-shared/docs/account-deactivation_DB要件分析_20251010.md`)
3. **アカウント無効化 暫定マスターリスト** (`mcp-shared/docs/account-deactivation暫定マスターリスト_20251010.md`)
4. **PersonalStation DB要件分析**（参考）

---

**文書終了**
