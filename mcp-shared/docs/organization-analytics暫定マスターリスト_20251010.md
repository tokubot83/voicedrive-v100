# 組織分析ページ 暫定マスターリスト

**作成日**: 2025年10月10日
**対象ページ**: OrganizationAnalyticsPage (`src/pages/OrganizationAnalyticsPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- 組織分析ページは**Level 15+（人事各部門長以上）専用**の戦略的ダッシュボード
- 議題化プロセスの分析と組織の声の可視化を提供
- 現在は**全データがダミーデータ**（35-81行目）
- 議題追跡システム（`Post.agendaLevel`, `ManagementCommitteeAgenda`）は実装済み

### 必要な対応
1. **医療システムからのAPI提供**: 2件
2. **VoiceDrive DB追加**: テーブル拡張1件、サービス新規作成1件
3. **VoiceDrive API実装**: 1件
4. **確認事項**: 2件

### 優先度
**Priority: HIGH（グループ1: 経営層向けコアページ）**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（2件）

#### API-1: 部門マスタ取得API

**エンドポイント**:
```
GET /api/v2/departments
```

**必要な理由**:
- 組織分析ページの「部門別活性度」表示（311-357行目）
- 部門名リストを取得し、各部門の投稿数・議題化数・活性度を集計
- VoiceDrive側は部門マスタを持たず、医療システムが真実の情報源

**レスポンス例**:
```json
{
  "departments": [
    {
      "id": "dept-001",
      "name": "医療療養病棟",
      "facilityId": "tategami-hospital",
      "facilityName": "立神リハビリテーション温泉病院",
      "employeeCount": 45,
      "departmentCode": "MTB",
      "isActive": true,
      "parentDepartmentId": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    },
    {
      "id": "dept-002",
      "name": "回復期リハ病棟",
      "facilityId": "tategami-hospital",
      "facilityName": "立神リハビリテーション温泉病院",
      "employeeCount": 38,
      "departmentCode": "RHB",
      "isActive": true,
      "parentDepartmentId": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    }
    // ... 他の部門
  ],
  "totalCount": 15,
  "activeCount": 14
}
```

**フィルタリング**:
```
GET /api/v2/departments?facilityId=tategami-hospital&isActive=true
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- Level 15以上のみアクセス可能

**キャッシュ戦略**:
- VoiceDrive側でキャッシュ（1日1回更新）
- 変更時はWebhook通知（将来実装）

---

#### API-2: 職員総数取得API

**エンドポイント**:
```
GET /api/v2/employees/count
```

**必要な理由**:
- 組織健康度指標の「声の活性度」「参加率」計算（152-186行目）
- 計算式: `(投稿数 ÷ 職員数) × 100`、`(投稿者数 ÷ 職員数) × 100`
- VoiceDrive側は全職員データを持たず、医療システムが真実の情報源

**レスポンス例**:
```json
{
  "totalEmployees": 245,
  "byFacility": {
    "tategami-hospital": 120,
    "obara-hospital": 100,
    "headquarters": 25
  },
  "byDepartment": {
    "医療療養病棟": 45,
    "回復期リハ病棟": 38,
    "外来・健診センター": 28,
    "訪問看護": 25,
    "事務部門": 18,
    "リハビリ部門": 22
  },
  "activeOnly": true,
  "excludeRetired": true,
  "calculatedAt": "2025-10-10T10:30:00Z"
}
```

**フィルタリング**:
```
GET /api/v2/employees/count?facilityId=tategami-hospital
GET /api/v2/employees/count?departmentId=dept-001
GET /api/v2/employees/count?isActive=true&excludeRetired=true
```

**セキュリティ**:
- JWT Bearer Token認証
- Rate Limit: 100 req/min/IP
- Level 15以上のみアクセス可能

**キャッシュ戦略**:
- VoiceDrive側でキャッシュ（1日1回更新）
- リアルタイム精度は不要（±数名の誤差は許容）

---

## 🛠 VoiceDrive側の実装内容

### B. DB変更（1件）

#### DB-1: ManagementCommitteeAgenda テーブルの拡張

**対象テーブル**: `ManagementCommitteeAgenda`

**追加フィールド**:
```prisma
model ManagementCommitteeAgenda {
  // ... 既存フィールド

  // 🆕 実装追跡フィールド
  implementationStatus    String?    @default("not_started") @map("implementation_status")
  // 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'

  implementationStartDate DateTime?  @map("implementation_start_date")  // 実装開始日
  implementationEndDate   DateTime?  @map("implementation_end_date")    // 実装完了日
  implementationProgress  Float?     @default(0) @map("implementation_progress") // 進捗率（0-100）
  implementationNotes     String?    @map("implementation_notes")       // 実装メモ

  @@index([implementationStatus])
  @@index([implementationEndDate])
}
```

**必要な理由**:
- 委員会活動の効果測定（220-258行目）で「実装済み数」「平均実装期間」を表示
- 現在は承認後の実装追跡機能がない
- 実装完了日を記録することで、平均実装期間（承認→完了）を計算可能

**マイグレーション**:
```bash
npx prisma migrate dev --name add_implementation_tracking_to_committee_agenda
```

**影響範囲**:
- OrganizationAnalyticsPage: 委員会効果測定
- CommitteeManagementPage: 実装ステータス更新UI追加

**推定工数**: 0.5日

---

### C. サービス新規作成（1件）

#### Service-1: OrganizationAnalyticsService

**ファイル**: `src/services/OrganizationAnalyticsService.ts`

**概要**:
組織レベルの統計集計サービス。Level 15+専用の戦略的分析機能を提供。

**主要メソッド**:

1. **`calculateOrganizationHealth(period)`**
   - 組織健康度指標を計算
   - 声の活性度、参加率、解決率、エンゲージメントスコア、部門間連携スコア

2. **`getAgendaProgress(period)`**
   - 議題化プロセスの進捗を集計
   - 部署内議題、施設議題、法人議題、委員会提出済み、決議済み

3. **`getCommitteeEffectiveness(period)`**
   - 委員会活動の効果測定
   - 提出数、審議完了数、承認数、実装済み数、平均審議期間、平均実装期間

4. **`getCategoryStatistics(period)`**
   - カテゴリ別議題統計
   - 人事・採用、教育・研修、業務改善、労働環境、医療安全、コミュニケーション

5. **`getDepartmentActivity(period)`**
   - 部門別活性度
   - 投稿数、議題化数、活性度スコア、トレンド

**使用テーブル**:
- `Post` (投稿データ)
- `Vote` (投票データ)
- `Comment` (コメントデータ)
- `ManagementCommitteeAgenda` (委員会議題)
- `User` (ユーザー情報)

**外部API呼び出し**:
- `GET /api/medical-system/departments` (部門マスタ)
- `GET /api/medical-system/employees/count` (職員総数)

**推定工数**: 2-3日

---

### D. API実装（1件）

#### API-1: 組織分析データ取得API

**エンドポイント**:
```
GET /api/organization-analytics
```

**クエリパラメータ**:
```
?period=month  // 'week' | 'month' | 'quarter'
```

**レスポンス例**:
```json
{
  "organizationHealth": {
    "voiceActivity": 82,
    "participationRate": 68,
    "resolutionRate": 55,
    "engagementScore": 74,
    "crossDeptCollaboration": 61
  },
  "agendaProgress": {
    "departmentLevel": 45,
    "facilityLevel": 23,
    "corporateLevel": 12,
    "committeeSubmitted": 8,
    "resolved": 15
  },
  "committeeEffectiveness": {
    "submitted": 32,
    "reviewed": 28,
    "approved": 21,
    "implemented": 15,
    "avgReviewDays": 12,
    "avgImplementDays": 45
  },
  "categoryData": [
    {
      "id": "hr",
      "name": "人事・採用",
      "count": 28,
      "resolved": 12
    }
    // ... 他のカテゴリ
  ],
  "departmentActivity": [
    {
      "name": "医療療養病棟",
      "posts": 42,
      "agenda": 8,
      "engagement": 85,
      "trend": "up"
    }
    // ... 他の部門
  ],
  "period": "month",
  "calculatedAt": "2025-10-10T10:30:00Z"
}
```

**認証・認可**:
- JWT Bearer Token認証必須
- Level 15以上のみアクセス可能
- Rate Limit: 50 req/min/user

**実装**:
```typescript
// src/api/routes/organization.routes.ts
router.get(
  '/organization-analytics',
  authenticateUser,
  authorizeLevel(15),
  async (req, res) => {
    const { period } = req.query;

    const service = new OrganizationAnalyticsService();

    const data = {
      organizationHealth: await service.calculateOrganizationHealth(period),
      agendaProgress: await service.getAgendaProgress(period),
      committeeEffectiveness: await service.getCommitteeEffectiveness(period),
      categoryData: await service.getCategoryStatistics(period),
      departmentActivity: await service.getDepartmentActivity(period),
      period,
      calculatedAt: new Date().toISOString()
    };

    res.json(data);
  }
);
```

**推定工数**: 1日

---

## 🔄 データフロー

### 現在の状態（Phase 0）

```
OrganizationAnalyticsPage
  ↓ 表示
ダミーデータ（35-81行目）
  - organizationHealth: 固定値
  - agendaProgress: 固定値
  - committeeEffectiveness: 固定値
  - categoryData: 固定値
  - departmentActivity: 固定値
```

### Phase 1完了後（基本統計実装）

```
OrganizationAnalyticsPage
  ↓ API呼び出し
GET /api/organization-analytics?period=month
  ↓
OrganizationAnalyticsService
  ├─ DB集計（VoiceDrive）
  │   ├─ Post, Vote, Comment
  │   ├─ ManagementCommitteeAgenda
  │   └─ User
  └─ 医療システムAPI呼び出し
      ├─ GET /api/medical-system/departments
      └─ GET /api/medical-system/employees/count
```

### Phase 2完了後（実装追跡強化）

```
OrganizationAnalyticsPage
  ↓ API呼び出し
GET /api/organization-analytics?period=month
  ↓
OrganizationAnalyticsService
  ├─ DB集計（VoiceDrive）
  │   ├─ Post, Vote, Comment
  │   ├─ ManagementCommitteeAgenda（拡張版）
  │   │   └─ implementationStatus, implementationEndDate等
  │   └─ User
  └─ 医療システムAPI呼び出し
      ├─ GET /api/medical-system/departments
      └─ GET /api/medical-system/employees/count
```

---

## 🎯 実装優先順位

### Phase 1: 基本統計の実装（2-3日）

**目標**: OrganizationAnalyticsPageが基本的に動作する

**VoiceDrive側**:
1. OrganizationAnalyticsService作成（2日）
2. API実装（GET /api/organization-analytics）（1日）
3. OrganizationAnalyticsPageの修正（0.5日）

**医療システム側**:
1. 部門マスタAPI実装（0.5日）
2. 職員総数取得API実装（0.5日）

**成果物**:
- ✅ 組織健康度指標（実データ）
- ✅ 議題化プロセス進捗（実データ）
- ⚠️ 委員会活動効果測定（一部ダミー）
- ✅ カテゴリ別分析（実データ）
- ✅ 部門別活性度（実データ）

---

### Phase 2: 委員会追跡の強化（1-2日）

**目標**: 委員会活動の効果測定が正確になる

**VoiceDrive側**:
1. ManagementCommitteeAgendaテーブル拡張（0.5日）
2. 委員会管理画面の拡張（1日）
3. 集計ロジック更新（0.5日）

**成果物**:
- ✅ 委員会活動効果測定（完全実データ）
- ✅ 実装追跡機能

---

### Phase 3: 戦略的インサイト（AI分析）（2-3日）

**目標**: AI分析によるインサイト提供

**VoiceDrive側**:
1. AI分析サービス実装（2日）
2. インサイト表示機能（1日）

**成果物**:
- ✅ 戦略的インサイト（AI分析）
- ✅ 自動アラート

---

## ❓ 確認事項

### 確認-1: 部門マスタのデータ構造

**質問**:
医療システムの`DepartmentMaster`テーブルには、以下のフィールドが存在しますか？

- `id` (部門ID)
- `name` (部門名)
- `facilityId` (施設ID)
- `employeeCount` (所属職員数)
- `isActive` (有効/無効フラグ)
- `parentDepartmentId` (親部門ID、階層構造用)

**理由**:
OrganizationAnalyticsServiceで部門別活性度を計算する際に、部門リストを取得する必要があります。

**影響**:
- API-1の実装
- 部門別活性度の集計

---

### 確認-2: 職員総数の計算方法

**質問**:
職員総数の計算において、以下の職員を**含めるか/除外するか**を確認させてください：

| 職員区分 | 含める？ | 備考 |
|---------|---------|------|
| 退職済み職員 | ❌ 除外 | `isRetired=true` |
| 休職中職員 | ✅ 含める | 一時的な休職 |
| 試用期間中職員 | ✅ 含める | 正式採用前 |
| パート・アルバイト | ✅ 含める | 雇用形態問わず |
| 派遣職員 | ❓ 確認必要 | 派遣元との契約形態による |
| 外部委託職員 | ❌ 除外 | 外部業者 |

**理由**:
組織健康度指標の「声の活性度」「参加率」の分母となる職員数の定義を明確化する必要があります。

**影響**:
- API-2の実装
- 組織健康度指標の精度

---

## ✅ チェックリスト

### 医療システム側の実装

- [ ] 部門マスタAPI実装（GET /api/v2/departments）
- [ ] 職員総数取得API実装（GET /api/v2/employees/count）
- [ ] API仕様書更新
- [ ] 単体テスト作成
- [ ] 確認-1の回答（部門マスタのデータ構造）
- [ ] 確認-2の回答（職員総数の計算方法）

### VoiceDrive側の実装

#### Phase 1
- [ ] OrganizationAnalyticsService作成
- [ ] 組織健康度指標の計算実装
- [ ] 議題化プロセス進捗の集計実装
- [ ] カテゴリ別統計の実装
- [ ] 部門別活性度の実装
- [ ] API実装（/api/organization-analytics）
- [ ] OrganizationAnalyticsPageの修正
- [ ] ローディング状態の追加
- [ ] エラーハンドリング

#### Phase 2
- [ ] ManagementCommitteeAgendaテーブルに実装追跡フィールド追加
- [ ] マイグレーション実行
- [ ] 委員会効果測定の完全実装
- [ ] 実装ステータス更新UI

#### Phase 3
- [ ] AI分析サービス実装
- [ ] インサイト生成ロジック
- [ ] アラート機能

### テスト

- [ ] OrganizationAnalyticsServiceの単体テスト
- [ ] 統計集計の精度テスト
- [ ] パフォーマンステスト（大量データ）
- [ ] E2Eテスト（OrganizationAnalyticsPage全機能）

---

## 📊 データ管理責任サマリー

| データカテゴリ | VoiceDrive | 医療システム | 提供方法 |
|--------------|-----------|-------------|---------|
| **投稿データ** | ✅ マスタ | ❌ | - |
| **議題レベル** | ✅ マスタ | ❌ | - |
| **委員会議題** | ✅ マスタ | ❌ | - |
| **実装追跡** | 🔴 追加予定 | ❌ | - |
| **部門マスタ** | キャッシュ | ✅ マスタ | API |
| **職員総数** | ❌ | ✅ マスタ | API |

---

## 📞 連絡体制

### VoiceDriveチーム
- Slack: #voicedrive-integration
- 担当: システム開発チーム

### 医療システムチーム
- Slack: #medical-system-integration
- 担当: システム開発チーム

### 共通
- MCPサーバー共有フォルダ: `mcp-shared/docs/`
- 定例会議: 毎週月曜 10:00-11:00

---

## 🔗 関連ドキュメント

- [organization-analytics_DB要件分析_20251010.md](./organization-analytics_DB要件分析_20251010.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md)
- [共通DB構築後統合作業再開計画書_20251008.md](./共通DB構築後統合作業再開計画書_20251008.md)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
承認: 未承認（レビュー待ち）
