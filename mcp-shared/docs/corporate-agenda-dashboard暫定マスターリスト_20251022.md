# CorporateAgendaDashboard 暫定マスターリスト

**作成日**: 2025年10月22日
**対象ページ**: CorporateAgendaDashboardPage (`src/pages/CorporateAgendaDashboardPage.tsx`)
**対象ユーザー**: レベル18（理事長・法人事務局長）
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- CorporateAgendaDashboardページは全10施設の議題化プロセス稼働状況を統合的に表示
- 現在は完全にダミーデータで動作（施設マスタ、KPI、統計データすべてハードコード）
- 医療システムからの施設マスタデータ受信とVoiceDrive側の統計集計機能が必要

### 必要な対応
1. **医療システムからのAPI提供**: 2件
2. **医療システムからのWebhook通知**: 2件
3. **VoiceDrive DB追加**: テーブル5件
4. **確認事項**: 2件

### 優先度
**Priority: MEDIUM-HIGH（グループ2: 管理者ダッシュボード）**
- レベル18ユーザー専用（理事長・法人事務局長）
- 法人全体の健全性監視に必須

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（2件）

#### API-1: 施設マスタ取得API

**エンドポイント**:
```
GET /api/v2/facilities
```

**必要な理由**:
- CorporateAgendaDashboardPage.tsx 69-200行目でハードコードされた10施設を削除
- VoiceDriveの`Facility`テーブルはキャッシュ専用、真実の情報源は医療システム
- 施設タイプ（総合病院、クリニック等）による統計集計に必須

**レスポンス例**:
```json
{
  "facilities": [
    {
      "id": "facility-001",
      "code": "OH",
      "name": "小原病院",
      "type": "総合病院",
      "address": "岡山県倉敷市...",
      "totalEmployees": 450,
      "establishedDate": "1985-04-01",
      "isActive": true,
      "metadata": {
        "bedsCount": 300,
        "departmentCount": 15
      }
    },
    {
      "id": "facility-002",
      "code": "KHC",
      "name": "北部医療センター",
      "type": "地域医療センター",
      "address": "岡山県岡山市北区...",
      "totalEmployees": 280,
      "establishedDate": "1992-11-01",
      "isActive": true,
      "metadata": {
        "bedsCount": 150,
        "departmentCount": 10
      }
    }
    // ... 全10施設
  ],
  "totalCount": 10,
  "activeFacilitiesCount": 10
}
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- 施設の財務情報、経営情報は含めない

---

#### API-2: 施設別職員数取得API

**エンドポイント**:
```
GET /api/v2/facilities/{facilityId}/employee-count
```

**必要な理由**:
- CorporateAgendaDashboard参加率計算に必須（activeUsers / totalEmployees）
- 施設ごとの総職員数がリアルタイムで必要

**レスポンス例**:
```json
{
  "facilityId": "facility-001",
  "facilityCode": "OH",
  "totalEmployees": 450,
  "activeEmployees": 420,
  "onLeaveEmployees": 15,
  "retiredEmployees": 15,
  "metadata": {
    "nursingStaff": 280,
    "medicalStaff": 85,
    "administrativeStaff": 85
  },
  "calculatedAt": "2025-10-22T10:00:00Z"
}
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP

---

### B. Webhook通知依頼（2件）

#### Webhook-1: 施設マスタ更新通知

**トリガー**:
- 医療システムの`FacilityMaster`テーブル更新時（名称変更、職員数変更等）

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/facility-updated
```

**ペイロード例**:
```json
{
  "eventType": "facility.updated",
  "timestamp": "2025-10-22T10:30:00Z",
  "facilityId": "facility-001",
  "changes": {
    "name": {
      "old": "小原病院",
      "new": "小原記念総合病院"
    },
    "totalEmployees": {
      "old": 445,
      "new": 450
    }
  },
  "signature": "abc123..."  // HMAC-SHA256署名
}
```

**VoiceDrive側の処理**:
```typescript
// Facilityテーブルのキャッシュを更新
await prisma.facility.update({
  where: { facilityCode: changes.code },
  data: {
    facilityName: changes.name.new,
    totalEmployees: changes.totalEmployees.new,
    syncedAt: new Date()
  }
});
```

---

#### Webhook-2: 施設新規追加/削除通知

**トリガー**:
- 施設の新規開設または閉鎖

**送信先**:
```
POST https://voicedrive.ai/api/webhooks/facility-lifecycle
```

**ペイロード例**:
```json
{
  "eventType": "facility.created",  // or "facility.deactivated"
  "timestamp": "2025-10-22T10:30:00Z",
  "facility": {
    "id": "facility-011",
    "code": "NEW",
    "name": "新規クリニック",
    "type": "クリニック",
    "totalEmployees": 30,
    "isActive": true
  },
  "signature": "abc123..."
}
```

**VoiceDrive側の処理**:
```typescript
if (eventType === 'facility.created') {
  await prisma.facility.create({
    data: {
      facilityCode: facility.code,
      facilityName: facility.name,
      facilityType: facility.type,
      totalEmployees: facility.totalEmployees,
      isActive: facility.isActive,
      syncedAt: new Date()
    }
  });
} else if (eventType === 'facility.deactivated') {
  await prisma.facility.update({
    where: { facilityCode: facility.code },
    data: { isActive: false }
  });
}
```

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### C. 新規テーブル追加（5件）

#### Table-1: Facility（施設マスタキャッシュ）

**優先度**: 🔴 **CRITICAL**

**理由**:
- CorporateAgendaDashboardPage.tsx 69-200行目のハードコードデータを削除
- 医療システムの施設マスタをキャッシュ
- 施設タイプ別統計の基盤データ

**スキーマ定義**:
```prisma
model Facility {
  id              String    @id @default(cuid())
  facilityCode    String    @unique @map("facility_code")
  facilityName    String    @map("facility_name")
  facilityType    String    @map("facility_type")
  // "総合病院", "地域医療センター", "リハビリ病院", "クリニック", "介護施設"

  totalEmployees  Int       @default(0) @map("total_employees")
  isActive        Boolean   @default(true) @map("is_active")

  // 医療システムとの同期
  syncedAt        DateTime  @default(now()) @map("synced_at")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([facilityCode])
  @@index([facilityType])
  @@index([isActive])
  @@map("facilities")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_facility_master
```

---

#### Table-2: FacilityStatistics（施設別統計）

**優先度**: 🔴 **CRITICAL**

**理由**:
- CorporateAgendaDashboardのメイン表示データ
- リアルタイム集計では重すぎる（全施設×全投稿の集計）
- 日次バッチで事前集計

**スキーマ定義**:
```prisma
model FacilityStatistics {
  id                  String    @id @default(cuid())
  facilityId          String    @map("facility_id")

  // 期間
  periodStart         DateTime  @map("period_start")
  periodEnd           DateTime  @map("period_end")
  periodType          String    @map("period_type")
  // "daily", "weekly", "monthly"

  // 投稿統計
  totalPosts          Int       @default(0) @map("total_posts")
  activePosts         Int       @default(0) @map("active_posts")
  resolvedPosts       Int       @default(0) @map("resolved_posts")

  // 参加統計
  totalEmployees      Int       @default(0) @map("total_employees")
  activeUsers         Int       @default(0) @map("active_users")
  participationRate   Float     @default(0) @map("participation_rate")

  // 処理統計
  avgProcessDays      Float     @default(0) @map("avg_process_days")
  medianProcessDays   Float     @default(0) @map("median_process_days")
  maxProcessDays      Int       @default(0) @map("max_process_days")

  // ヘルススコア（0-100）
  healthScore         Float     @default(0) @map("health_score")
  healthScorePrevious Float     @default(0) @map("health_score_previous")

  // トレンド
  trend               String    @default("stable") @map("trend")
  // "up", "down", "stable"

  // メタデータ
  calculatedAt        DateTime  @default(now()) @map("calculated_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  @@unique([facilityId, periodStart, periodEnd, periodType])
  @@index([facilityId])
  @@index([periodStart])
  @@index([healthScore])
  @@index([calculatedAt])
  @@map("facility_statistics")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_facility_statistics
```

---

#### Table-3: CorporateKPI（法人全体KPI）

**優先度**: 🔴 **CRITICAL**

**理由**:
- CorporateAgendaDashboardPage.tsx 37-66行目の法人全体KPI表示
- 前月比較計算に必須

**スキーマ定義**:
```prisma
model CorporateKPI {
  id                    String    @id @default(cuid())

  // 期間
  periodStart           DateTime  @map("period_start")
  periodEnd             DateTime  @map("period_end")
  periodType            String    @map("period_type")
  // "daily", "weekly", "monthly", "quarterly", "yearly"

  // 投稿統計
  totalPosts            Int       @default(0) @map("total_posts")
  totalPostsPrevious    Int       @default(0) @map("total_posts_previous")
  totalPostsChange      Float     @default(0) @map("total_posts_change")

  // 参加率統計
  avgParticipationRate  Float     @default(0) @map("avg_participation_rate")
  avgParticipationPrev  Float     @default(0) @map("avg_participation_prev")
  participationChange   Float     @default(0) @map("participation_change")

  // 解決率統計
  avgResolutionRate     Float     @default(0) @map("avg_resolution_rate")
  avgResolutionPrev     Float     @default(0) @map("avg_resolution_prev")
  resolutionChange      Float     @default(0) @map("resolution_change")

  // 処理日数統計
  avgProcessDays        Float     @default(0) @map("avg_process_days")
  avgProcessDaysPrev    Float     @default(0) @map("avg_process_days_prev")
  processDaysChange     Float     @default(0) @map("process_days_change")

  // メタデータ
  calculatedAt          DateTime  @default(now()) @map("calculated_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@unique([periodStart, periodEnd, periodType])
  @@index([periodStart])
  @@index([periodType])
  @@index([calculatedAt])
  @@map("corporate_kpi")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_corporate_kpi
```

---

#### Table-4: FacilityAlert（施設アラート）

**優先度**: 🔴 **CRITICAL**

**理由**:
- CorporateAgendaDashboardPage.tsx 242-264行目のアラート表示
- 参加率低下、処理日数増加、ヘルススコア低下の監視

**スキーマ定義**:
```prisma
model FacilityAlert {
  id              String    @id @default(cuid())
  facilityId      String    @map("facility_id")

  // アラートタイプ
  alertType       String    @map("alert_type")
  // "participation_low", "process_time_high", "health_score_low", "resolution_rate_low"

  // 重要度
  severity        String    @map("severity")
  // "info", "warning", "critical"

  // 内容
  message         String    @db.Text
  currentValue    Float     @map("current_value")
  thresholdValue  Float     @map("threshold_value")

  // ステータス
  isAcknowledged  Boolean   @default(false) @map("is_acknowledged")
  acknowledgedBy  String?   @map("acknowledged_by")
  acknowledgedAt  DateTime? @map("acknowledged_at")

  // メタデータ
  detectedAt      DateTime  @default(now()) @map("detected_at")
  createdAt       DateTime  @default(now()) @map("created_at")

  @@index([facilityId])
  @@index([alertType])
  @@index([severity])
  @@index([isAcknowledged])
  @@index([detectedAt])
  @@map("facility_alerts")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_facility_alerts
```

---

#### Table-5: AlertThreshold（アラートしきい値）

**優先度**: 🟡 **RECOMMENDED**

**理由**:
- アラート検知ロジックの設定管理
- 施設タイプ別のしきい値設定が可能

**スキーマ定義**:
```prisma
model AlertThreshold {
  id                        String    @id @default(cuid())

  // しきい値設定
  participationRateMin      Float     @default(60) @map("participation_rate_min")
  processTimeDaysMax        Int       @default(30) @map("process_time_days_max")
  healthScoreMin            Float     @default(60) @map("health_score_min")
  resolutionRateMin         Float     @default(50) @map("resolution_rate_min")

  // 適用範囲
  applicableScope           String    @default("all") @map("applicable_scope")
  // "all", "hospital", "clinic", "nursing_home", "rehab_facility"

  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  @@index([applicableScope])
  @@map("alert_thresholds")
}
```

**マイグレーション**:
```bash
npx prisma migrate dev --name add_alert_thresholds
```

---

## ❓ 医療システムチームへの確認事項

### 確認-1: FacilityMasterテーブルの存在確認

**質問**:
> DB構築計画書に`FacilityMaster`テーブルが記載されていると認識していますが、以下を確認させてください：
>
> 1. `FacilityMaster`テーブルは確実に実装予定ですか？
> 2. 以下のフィールドは含まれますか？
>    - `facilityCode` (施設コード、例: "OH")
>    - `facilityName` (施設名、例: "小原病院")
>    - `facilityType` (施設タイプ、例: "総合病院")
>    - `totalEmployees` (総職員数)
>    - `isActive` (稼働状況)
> 3. API-1（施設マスタ取得API）の実装は可能ですか？
> 4. 現在、何施設が登録予定ですか？（VoiceDriveは10施設を想定）

**期待回答**:
- ✅ FacilityMasterテーブル実装確定
- ✅ 必要フィールド全て含まれる
- ✅ API-1実装可能
- ✅ 登録予定施設数: 10施設

---

### 確認-2: Webhook送信頻度とバッチ処理

**質問**:
> Webhook-1（施設マスタ更新通知）とWebhook-2（施設新規追加/削除通知）について：
>
> 1. 施設マスタの更新頻度はどの程度を想定していますか？
>    - 月次（例: 職員数の月次更新）
>    - リアルタイム（例: 施設名変更時に即座にWebhook）
>
> 2. VoiceDrive側では**リアルタイム送信**を推奨しますが、施設数が少ない（10施設）ため負荷は軽微です。
>
> 3. 職員数の変動は頻繁でしょうか？それとも月次/四半期での変更でしょうか？

**推奨回答**:
- リアルタイム送信（施設マスタ更新時に即座にWebhook）
- 職員数は月次バッチで更新（毎月1日）

---

## 📅 想定スケジュール

### Phase 1: 要件確認（1週間）
- **Week 1**: 医療システムチームからの回答受領、仕様確定

### Phase 2: 医療システム側実装（1週間）
- **Week 2**: API-1, API-2実装、Webhook-1, 2実装

### Phase 3: VoiceDrive側実装（2週間）
- **Week 3**: Facility, FacilityStatistics, CorporateKPI, FacilityAlertテーブル追加
- **Week 4**: 統計計算サービス、日次バッチ、アラート検知実装

### Phase 4: 統合テスト（1週間）
- **Week 5**: E2Eテスト、パフォーマンステスト、アラート検証

### Phase 5: 本番リリース
- **Week 6**: 段階的ロールアウト（管理者レビュー → 本番展開）

---

## 📊 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────┐                                           │
│  │FacilityMaster│  ① 施設マスタ管理                        │
│  │  (10施設)    │                                           │
│  └──────────────┘                                           │
│         │                                                     │
│         │ ②API提供                                           │
│         ▼                                                     │
│  ┌─────────────────────────────────────┐                   │
│  │  API-1: 施設マスタ取得               │                   │
│  │  API-2: 施設別職員数                 │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                     │
│         │ ③Webhook通知（変更時）                            │
│         ▼                                                     │
└─────────────────────────────────────────────────────────────┘
         │
         │ HTTPS + JWT Auth
         │ HMAC-SHA256 Signature
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  Webhook受信: /api/webhooks/facility-*   │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ④キャッシュ更新                                    │
│         ▼                                                     │
│  ┌──────────────┐                                           │
│  │   Facility   │  (医療システムからキャッシュ)            │
│  │ (キャッシュ)  │                                           │
│  └──────────────┘                                           │
│         │                                                     │
│         │ ⑤日次バッチ（統計計算）                           │
│         ▼                                                     │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │FacilityStatistics  │  │   CorporateKPI     │           │
│  │  (施設別統計)       │  │  (法人全体KPI)      │           │
│  └────────────────────┘  └────────────────────┘           │
│         │                         │                          │
│         │ ⑥アラート検知            │                          │
│         ▼                         │                          │
│  ┌────────────────────┐           │                          │
│  │  FacilityAlert     │           │                          │
│  │  (アラート)         │           │                          │
│  └────────────────────┘           │                          │
│         │                         │                          │
│         └─────────────────────────┘                          │
│                           │                                   │
│                           │ ⑦ダッシュボード表示              │
│                           ▼                                   │
│              ┌─────────────────────────────┐                │
│              │CorporateAgendaDashboardPage │                │
│              │  - 法人全体KPI               │                │
│              │  - 施設別統計               │                │
│              │  - アラート一覧             │                │
│              │  - ヘルススコアランキング   │                │
│              └─────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### 医療システム側作業

- [ ] **確認-1**: FacilityMasterテーブル仕様確認
- [ ] **確認-2**: Webhook送信頻度決定
- [ ] **API-1**: 施設マスタ取得API実装
- [ ] **API-2**: 施設別職員数取得API実装
- [ ] **Webhook-1**: 施設マスタ更新通知実装
- [ ] **Webhook-2**: 施設新規追加/削除通知実装
- [ ] テスト環境でのAPI動作確認
- [ ] Webhook署名検証テスト

### VoiceDrive側作業

#### Phase 1: 基盤構築
- [ ] **Table-1**: Facilityテーブル追加
- [ ] 施設マスタ同期機能実装
- [ ] Webhook受信エンドポイント実装（2件）
- [ ] HMAC-SHA256署名検証実装
- [ ] API呼び出しクライアント実装（2件）

#### Phase 2: 統計機能実装
- [ ] **Table-2**: FacilityStatisticsテーブル追加
- [ ] **Table-3**: CorporateKPIテーブル追加
- [ ] 施設別統計計算サービス実装
- [ ] 法人全体KPI計算サービス実装
- [ ] ヘルススコア計算ロジック実装
- [ ] 日次バッチ実装（統計計算）

#### Phase 3: アラート機能実装
- [ ] **Table-4**: FacilityAlertテーブル追加
- [ ] **Table-5**: AlertThresholdテーブル追加
- [ ] アラート検知ロジック実装
- [ ] アラート通知機能実装（管理者向け）

#### Phase 4: UI統合
- [ ] CorporateAgendaDashboardPageのダミーデータ削除
- [ ] Facilityテーブルから施設一覧取得
- [ ] FacilityStatisticsから施設別統計表示
- [ ] CorporateKPIから法人全体KPI表示
- [ ] FacilityAlertからアラート表示

#### Phase 5: テスト
- [ ] 施設マスタ同期テスト
- [ ] 統計計算精度テスト
- [ ] ヘルススコア計算テスト
- [ ] アラート検知テスト
- [ ] パフォーマンステスト（10施設×1年分データ）
- [ ] E2Eテスト（CorporateAgendaDashboard全機能）

---

## 📝 補足資料

### 参照ドキュメント

1. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

2. **CorporateAgendaDashboard DB要件分析**
   `mcp-shared/docs/corporate-agenda-dashboard_DB要件分析_20251022.md`

3. **医療システムDB構築計画書**
   `C:\projects\staff-medical-system\docs\DB構築計画書前準備_不足項目整理_20251008.md`

4. **共通DB構築後統合作業再開計画書**
   `mcp-shared/docs/共通DB構築後統合作業再開計画書_20251008.md`

### 技術スタック

**VoiceDrive**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + React
- Express.js (API Server)

**医療システム**:
- MySQL 8.0 (AWS Lightsail 16GB)
- Prisma ORM
- TypeScript + Next.js
- NestJS (API Server)

---

**作成者**: AI (Claude Code)
**承認待ち**: 医療システムチームからの確認事項回答
**次のステップ**: VoiceDrive schema.prisma更新 → 医療チームへ送付

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-22 | 初版作成 | AI (Claude Code) |
