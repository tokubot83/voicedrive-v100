# 退職処理・緊急アカウント停止 - 暫定マスターリスト

**作成日**: 2025年10月18日
**送付先**: 医療職員管理システムチーム
**目的**: VoiceDrive緊急退職処理機能の統合に必要な実装内容の共有

---

## 📋 概要

VoiceDriveには以下の2つの緊急処理機能があります：

| 機能 | URL | 目的 | 現状 |
|------|-----|------|------|
| 緊急退職処理 | `/retirement-processing` | 職員退職時の4ステップ処理 | ⚠️ LocalStorage実装（DB永続化必要） |
| 緊急アカウント停止 | `/emergency/account-deactivation` | 職員カルテシステム障害時の応急措置 | ⚠️ LocalStorage実装（DB永続化必要） |

### 🔴 現在の問題点

1. **データ永続化なし**: ブラウザLocalStorage依存、サーバー側で確認不可
2. **システム間同期なし**: 職員カルテシステムとの連携未実装
3. **監査要件を満たさない**: 法的要件を満たさない仮実装
4. **本番運用不可**: 緊急措置として機能しない

### ✅ 解決策

**Phase 1: DB永続化** → VoiceDrive側で完了（マイグレーション実行待ち）
**Phase 2: Webhook連携** → 両システムで実装必要
**Phase 3: 自動同期機能** → VoiceDrive側で実装必要

---

## 🗄️ 医療システム側で必要な実装

### 1. 新規テーブル作成

#### EmployeeAccountStatusHistory（アカウント状態履歴）

**目的**: VoiceDriveからの緊急処理を記録し、正式退職処理と紐付け

```sql
CREATE TABLE employee_account_status_history (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL COMMENT '職員ID',

  -- 変更内容
  previous_status VARCHAR(50) COMMENT '変更前ステータス',
  new_status VARCHAR(50) NOT NULL COMMENT '変更後ステータス',
  -- 'active' | 'emergency_deactivated' | 'retired' | 'suspended'

  -- 変更元システム
  source_system VARCHAR(50) NOT NULL COMMENT '変更元システム',
  -- 'staff_medical_system' | 'voicedrive_emergency'

  is_emergency_change BOOLEAN DEFAULT FALSE COMMENT '緊急変更フラグ',

  -- VoiceDrive緊急処理との紐付け
  voicedrive_deactivation_id VARCHAR(36) COMMENT 'VoiceDrive EmergencyDeactivation.id',
  voicedrive_retirement_process_id VARCHAR(36) COMMENT 'VoiceDrive RetirementProcess.id',

  -- 実行者
  changed_by VARCHAR(50) COMMENT '変更実行者ID',
  changed_by_name VARCHAR(100) COMMENT '変更実行者名',

  -- 理由
  reason TEXT COMMENT '変更理由',

  -- タイムスタンプ
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  synced_from_voicedrive_at TIMESTAMP COMMENT 'VoiceDriveから同期された日時',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_employee_id (employee_id),
  INDEX idx_source_system (source_system),
  INDEX idx_is_emergency_change (is_emergency_change),
  INDEX idx_voicedrive_deactivation_id (voicedrive_deactivation_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**重要なポイント**:
- `voicedrive_deactivation_id`でVoiceDrive側の緊急処理と紐付け
- `is_emergency_change=true`でフィルタリング可能
- 正式退職処理時にこのテーブルを確認し、二重処理を回避

---

### 2. Webhook受信エンドポイント実装

#### Endpoint 1: 緊急退職処理通知

**URL**: `POST /api/webhooks/voicedrive-emergency-retirement`

**用途**: VoiceDriveで緊急退職処理が実行された際の通知受信

**リクエスト例**:
```json
{
  "eventType": "retirement.emergency_processed",
  "timestamp": "2025-10-18T16:00:00Z",
  "data": {
    "retirementProcessId": "rp-001",
    "deactivationId": "ed-001",
    "employeeId": "OH-NS-2024-001",
    "employeeName": "山田 花子",
    "processedBy": "HR-001",
    "processorName": "人事部長",
    "processorLevel": 15,
    "reason": "職員カルテシステム障害のため緊急対応",
    "steps": {
      "step1CompletedAt": "2025-10-18T16:05:00Z",
      "step2CompletedAt": "2025-10-18T16:06:00Z",
      "step3CompletedAt": "2025-10-18T16:10:00Z",
      "step4CompletedAt": "2025-10-18T16:11:00Z"
    },
    "anonymizationLevel": "department",
    "retentionPeriod": 24
  }
}
```

**実装内容**:
```typescript
// 1. 緊急処理記録を保存
await prisma.employeeAccountStatusHistory.create({
  data: {
    employeeId: data.employeeId,
    previousStatus: 'active',
    newStatus: 'emergency_deactivated',
    sourceSystem: 'voicedrive_emergency',
    isEmergencyChange: true,
    voicedrive_deactivation_id: data.deactivationId,
    voicedrive_retirement_process_id: data.retirementProcessId,
    changedBy: data.processedBy,
    changedByName: data.processorName,
    reason: data.reason,
    syncedFromVoicedriveAt: new Date()
  }
});

// 2. Employee.accountStatusを更新
await prisma.employee.update({
  where: { employeeId: data.employeeId },
  data: { accountStatus: 'emergency_deactivated' }
});

// 3. VoiceDriveに確認Webhookを送信
await sendWebhook({
  url: 'https://voicedrive.ai/api/webhooks/emergency-retirement-confirmed',
  data: {
    retirementProcessId: data.retirementProcessId,
    syncedAt: new Date().toISOString(),
    status: 'synced'
  }
});
```

---

#### Endpoint 2: 緊急アカウント停止通知

**URL**: `POST /api/webhooks/voicedrive-emergency-deactivation`

**用途**: VoiceDriveで緊急アカウント停止が実行された際の通知受信

**リクエスト例**:
```json
{
  "eventType": "account.emergency_deactivated",
  "timestamp": "2025-10-18T16:00:00Z",
  "data": {
    "deactivationId": "ed-002",
    "employeeId": "OH-NS-2024-001",
    "employeeName": "山田 花子",
    "executedBy": "HR-001",
    "executorName": "人事部長",
    "executorLevel": 15,
    "reason": "セキュリティインシデント対応のため緊急停止"
  }
}
```

**実装内容**:
```typescript
// 緊急停止記録を保存
await prisma.employeeAccountStatusHistory.create({
  data: {
    employeeId: data.employeeId,
    previousStatus: 'active',
    newStatus: 'suspended',
    sourceSystem: 'voicedrive_emergency',
    isEmergencyChange: true,
    voicedrive_deactivation_id: data.deactivationId,
    changedBy: data.executedBy,
    changedByName: data.executorName,
    reason: data.reason,
    syncedFromVoicedriveAt: new Date()
  }
});

// Employee.accountStatusを更新
await prisma.employee.update({
  where: { employeeId: data.employeeId },
  data: { accountStatus: 'suspended' }
});
```

---

### 3. Webhook送信機能実装

#### Webhook 1: 正式退職処理完了通知

**送信先**: `POST https://voicedrive.ai/api/webhooks/employee-retired`

**タイミング**: 職員カルテシステムで正式退職処理が完了した時

**ペイロード**:
```json
{
  "eventType": "employee.retired",
  "timestamp": "2025-10-20T10:00:00Z",
  "data": {
    "employeeId": "OH-NS-2024-001",
    "employeeName": "山田 花子",
    "retirementDate": "2025-10-31",
    "hasEmergencyProcess": true,
    "emergencyDeactivationId": "ed-001",
    "emergencyRetirementProcessId": "rp-001",
    "processedBy": "HR-002",
    "processorName": "人事課長",
    "note": "緊急処理を正式退職にアップグレードしました。"
  }
}
```

**実装のポイント**:
```typescript
// 正式退職処理時に緊急処理記録を確認
const emergencyRecord = await prisma.employeeAccountStatusHistory.findFirst({
  where: {
    employeeId: employeeId,
    isEmergencyChange: true,
    sourceSystem: 'voicedrive_emergency'
  },
  orderBy: { createdAt: 'desc' }
});

if (emergencyRecord) {
  // 緊急処理が既にある場合
  await sendWebhook({
    url: 'https://voicedrive.ai/api/webhooks/employee-retired',
    data: {
      // ...
      hasEmergencyProcess: true,
      emergencyDeactivationId: emergencyRecord.voicedrive_deactivation_id,
      emergencyRetirementProcessId: emergencyRecord.voicedrive_retirement_process_id
    }
  });
} else {
  // 通常の退職処理
  await sendWebhook({
    url: 'https://voicedrive.ai/api/webhooks/employee-retired',
    data: {
      // ...
      hasEmergencyProcess: false
    }
  });
}
```

---

### 4. 正式退職処理の拡張

**既存の退職処理に追加が必要な処理**:

```typescript
async function processEmployeeRetirement(employeeId: string) {
  // 1. 緊急処理記録を確認
  const emergencyRecord = await prisma.employeeAccountStatusHistory.findFirst({
    where: {
      employeeId: employeeId,
      isEmergencyChange: true,
      sourceSystem: 'voicedrive_emergency'
    }
  });

  if (emergencyRecord) {
    // 2. 緊急処理が既にある場合、アップグレード処理
    console.log('VoiceDriveで緊急処理済み。正式退職にアップグレードします。');

    // 2-1. Employee.retirementDateを設定（緊急処理時は未設定）
    await prisma.employee.update({
      where: { employeeId },
      data: {
        retirementDate: new Date(), // 正式な退職日
        accountStatus: 'retired'    // 'emergency_deactivated' → 'retired'
      }
    });

    // 2-2. EmployeeAccountStatusHistory に正式退職記録を追加
    await prisma.employeeAccountStatusHistory.create({
      data: {
        employeeId,
        previousStatus: 'emergency_deactivated',
        newStatus: 'retired',
        sourceSystem: 'staff_medical_system',
        isEmergencyChange: false,
        changedBy: currentUserId,
        changedByName: currentUserName,
        reason: `緊急処理（ID: ${emergencyRecord.voicedrive_deactivation_id}）を正式退職にアップグレード`
      }
    });

    // 2-3. VoiceDriveに通知（hasEmergencyProcess=true）
    await sendWebhook({
      url: 'https://voicedrive.ai/api/webhooks/employee-retired',
      data: {
        employeeId,
        retirementDate: new Date().toISOString(),
        hasEmergencyProcess: true,
        emergencyDeactivationId: emergencyRecord.voicedrive_deactivation_id,
        emergencyRetirementProcessId: emergencyRecord.voicedrive_retirement_process_id,
        // ...
      }
    });
  } else {
    // 3. 通常の退職処理（緊急処理なし）
    await prisma.employee.update({
      where: { employeeId },
      data: {
        retirementDate: new Date(),
        accountStatus: 'retired'
      }
    });

    await sendWebhook({
      url: 'https://voicedrive.ai/api/webhooks/employee-retired',
      data: {
        employeeId,
        retirementDate: new Date().toISOString(),
        hasEmergencyProcess: false,
        // ...
      }
    });
  }
}
```

---

## 🔗 VoiceDrive側の実装内容（参考）

### 追加したテーブル

#### 1. EmergencyDeactivation（拡張）

既存テーブルを拡張し、以下のフィールドを追加：
- `targetUserName`: 対象職員名
- `deactivationType`: 'emergency' | 'retirement'
- `formalRetirementDate`: 正式退職日
- `retryCount`: リトライ回数

#### 2. RetirementProcess（新規）

緊急退職処理の4ステップを記録：
- Step 1: アカウント無効化
- Step 2: 権限剥奪
- Step 3: 投稿匿名化
- Step 4: 完了通知

#### 3. StaffSystemSyncQueue（拡張）

職員カルテシステム復旧後の自動同期用キュー：
- `eventType`, `eventId`: イベント情報
- `targetEndpoint`, `httpMethod`: HTTP送信先
- `priority`: 優先度（1-10）
- `responseStatus`, `responseBody`: HTTP応答記録

### Webhook受信エンドポイント

- `POST /api/webhooks/employee-retired`: 正式退職通知受信
- `POST /api/webhooks/emergency-retirement-confirmed`: 緊急処理確認受信

---

## 📊 統合フロー図

```
┌─────────────────────────────────────────────┐
│     職員カルテシステム（正常時）             │
│                                             │
│  職員退職登録 → Webhook → VoiceDrive自動処理 │
│  （正規フロー・Phase 4実装予定）             │
└─────────────────────────────────────────────┘
                    │
                    │ システム障害
                    ▼
┌─────────────────────────────────────────────┐
│     VoiceDrive（緊急対応）                   │
│                                             │
│  緊急退職処理実行                            │
│  ├─ RetirementProcess記録                  │
│  ├─ EmergencyDeactivation記録              │
│  └─ SyncQueue登録                          │
│                                             │
│  システム復旧後                              │
│  └─ POST /api/webhooks/voicedrive-emergency-retirement │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│     職員カルテシステム（復旧後）             │
│                                             │
│  EmployeeAccountStatusHistory.create()      │
│  ├─ source_system: 'voicedrive_emergency'  │
│  ├─ is_emergency_change: true              │
│  └─ voicedrive_deactivation_id保存         │
│                                             │
│  人事部が正式退職処理実行                    │
│  ├─ 緊急処理記録を検索                      │
│  ├─ 既存処理を「正式退職」にアップグレード   │
│  └─ POST /api/webhooks/employee-retired    │
│     (hasEmergencyProcess: true)             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│     VoiceDrive（最終更新）                   │
│                                             │
│  EmergencyDeactivation.status =             │
│    'upgraded_to_formal_retirement'          │
│  formalRetirementDate設定                   │
│  RetirementProcess.syncToStaffSystem = true │
└─────────────────────────────────────────────┘
```

---

## ✅ 実装チェックリスト

### 医療職員管理システム側

#### データベース
- [ ] `EmployeeAccountStatusHistory`テーブル作成
- [ ] インデックス作成
- [ ] テーブル動作確認

#### API・Webhook
- [ ] Webhook受信エンドポイント実装
  - [ ] `POST /api/webhooks/voicedrive-emergency-retirement`
  - [ ] `POST /api/webhooks/voicedrive-emergency-deactivation`
  - [ ] HMAC-SHA256署名検証実装

- [ ] Webhook送信機能実装
  - [ ] `POST https://voicedrive.ai/api/webhooks/employee-retired`
  - [ ] `POST https://voicedrive.ai/api/webhooks/emergency-retirement-confirmed`
  - [ ] HMAC-SHA256署名生成

#### 正式退職処理の拡張
- [ ] 緊急処理記録検索ロジック追加
- [ ] 既存処理のアップグレード機能実装
- [ ] 二重処理回避ロジック実装

#### テスト
- [ ] 単体テスト作成
- [ ] Webhook受信テスト
- [ ] Webhook送信テスト
- [ ] 統合テスト（VoiceDriveと連携）

### VoiceDrive側

#### データベース
- [x] Prismaスキーマ更新完了
- [ ] マイグレーション実行（統合時）

#### サービス層
- [ ] `RetirementProcessingService.ts` → Prisma対応
- [ ] `EmergencyAccountService.ts` → Prisma対応
- [ ] LocalStorage削除

#### Webhook
- [ ] Webhook送信機能実装
- [ ] Webhook受信機能実装
- [ ] 署名検証実装

#### 自動同期
- [ ] SyncQueueワーカー実装
- [ ] ヘルスチェック機能
- [ ] 自動リトライ機能

---

## 📅 実装スケジュール案

| フェーズ | 期間 | 担当 | 内容 |
|---------|------|------|------|
| **Phase 1: DB準備** | 2-3日 | 両チーム | テーブル作成、マイグレーション |
| **Phase 2: Webhook実装** | 3-5日 | 両チーム | API・Webhook実装 |
| **Phase 3: 統合テスト** | 2-3日 | 両チーム | 結合テスト、修正 |
| **Phase 4: 本番デプロイ** | 1日 | 両チーム | 本番環境適用 |

**合計**: 約2週間

---

## 🔐 セキュリティ要件

### Webhook署名検証

**VoiceDrive → 医療システム**:
```typescript
// HMAC-SHA256署名生成（VoiceDrive側）
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

headers['X-VoiceDrive-Signature'] = `sha256=${signature}`;
```

**医療システム → VoiceDrive**:
```typescript
// HMAC-SHA256署名生成（医療システム側）
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

headers['X-Medical-System-Signature'] = `sha256=${signature}`;
```

### アクセス制御

- 緊急処理実行: Level 14-17（人事部門のみ）
- 監査ログ閲覧: Level 16+（統括管理部門以上）

---

## 📞 連絡先

### VoiceDriveチーム
- Slack: `#voicedrive-integration`
- 担当: システム開発チーム

### 医療システムチーム
- Slack: `#medical-system-integration`
- 担当: システム開発チーム

### 共有フォルダ
- MCPサーバー: `mcp-shared/docs/`

---

## 📎 関連ドキュメント

1. **DB要件分析書**: `retirement-emergency-deactivation_DB要件分析_20251018.md`
2. **データ管理責任分界点定義書**: `データ管理責任分界点定義書_20251008.md`
3. **既存実装**:
   - `src/pages/RetirementProcessingPage.tsx`
   - `src/pages/emergency/EmergencyAccountDeactivation.tsx`

---

**作成者**: VoiceDriveチーム (AI - Claude Code)
**作成日**: 2025年10月18日
**次のアクション**: 医療チームレビュー → 実装開始日程調整

---

## 質問・確認事項

### 医療チームへの質問

1. **テーブル設計**: `EmployeeAccountStatusHistory`の設計は問題ないでしょうか？
2. **Webhook仕様**: 提案したWebhook仕様で実装可能でしょうか？
3. **統合テスト**: いつ頃統合テスト環境をセットアップできますか？
4. **マイグレーション**: いつ頃本番環境にマイグレーションを実施できますか？

### ご確認いただきたい点

- [ ] テーブル設計の承認
- [ ] Webhook仕様の承認
- [ ] 実装スケジュールの調整
- [ ] 統合テスト環境の準備

---

**ご不明な点がありましたら、Slackでご連絡ください。**
