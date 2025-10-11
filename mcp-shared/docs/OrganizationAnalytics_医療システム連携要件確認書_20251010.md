# 組織分析ページ 医療システム連携要件確認書

**文書番号**: MED-REQ-2025-1010-003
**作成日**: 2025年10月10日
**差出人**: VoiceDriveチーム
**宛先**: 医療職員管理システムチーム
**件名**: 組織分析ページ（OrganizationAnalytics）の医療システム連携要件について
**優先度**: 🔴 HIGH（経営層向けコアページ）

---

## 📋 エグゼクティブサマリー

VoiceDrive側で組織分析ページ（OrganizationAnalyticsPage）のDB要件分析を完了しました。
本ドキュメントは、医療システム側で実装が必要なAPI（2件）と、確認が必要な事項（2件）をまとめたものです。

### 対象ページ
- **URL**: https://voicedrive-v100.vercel.app/organization-analytics
- **対象ユーザー**: Level 15+（人事各部門長以上）専用
- **機能**: 議題化プロセスの分析、組織の声の可視化、委員会活動の効果測定

### VoiceDrive側の分析状況
- ✅ DB要件分析完了（[organization-analytics_DB要件分析_20251010.md](./organization-analytics_DB要件分析_20251010.md)）
- ✅ 暫定マスターリスト作成（[organization-analytics暫定マスターリスト_20251010.md](./organization-analytics暫定マスターリスト_20251010.md)）
- ✅ schema.prisma更新完了（実装追跡フィールド追加）

### 医療システム側への依頼内容
1. **API提供**: 2件（部門マスタ、職員総数）
2. **確認事項**: 2件（データ構造、計算方法）
3. **推定工数**: API実装 1日、確認対応 0.5日

---

## 🔗 医療システム側で実装が必要なAPI（2件）

### API-1: 部門マスタ取得API 🔴 必須

#### 概要
VoiceDrive組織分析ページの「部門別活性度」表示に使用する部門リストを提供するAPI。

#### エンドポイント
```
GET /api/v2/departments
```

#### 必要な理由
- 組織分析ページで「部門別の声の活性度」を表示（OrganizationAnalyticsPage.tsx 311-357行目）
- 各部門の投稿数・議題化数・活性度スコアを集計するために部門リストが必要
- VoiceDrive側は部門マスタを持たず、医療システムが真実の情報源（データ管理責任分界点定義書に基づく）

#### リクエスト仕様

**基本リクエスト**:
```http
GET /api/v2/departments
Authorization: Bearer {jwt_token}
```

**フィルタリング（オプション）**:
```http
GET /api/v2/departments?facilityId=tategami-hospital
GET /api/v2/departments?isActive=true
GET /api/v2/departments?facilityId=tategami-hospital&isActive=true
```

#### レスポンス仕様

**成功時（200 OK）**:
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
    },
    {
      "id": "dept-003",
      "name": "外来・健診センター",
      "facilityId": "tategami-hospital",
      "facilityName": "立神リハビリテーション温泉病院",
      "employeeCount": 28,
      "departmentCode": "OPD",
      "isActive": true,
      "parentDepartmentId": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    }
    // ... 他の部門
  ],
  "totalCount": 15,
  "activeCount": 14,
  "retrievedAt": "2025-10-10T10:30:00Z"
}
```

**エラー時（401 Unauthorized）**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証トークンが無効です"
  }
}
```

**エラー時（403 Forbidden）**:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "このAPIへのアクセス権限がありません（Level 15以上が必要）"
  }
}
```

#### セキュリティ要件
- **認証**: JWT Bearer Token認証必須
- **認可**: Level 15以上のみアクセス可能
- **Rate Limit**: 100 req/min/IP
- **HTTPS**: 本番環境では必須

#### VoiceDrive側の利用方法

```typescript
// src/services/OrganizationAnalyticsService.ts
private async getDepartments() {
  const response = await fetch('/api/medical-system/departments', {
    headers: {
      'Authorization': `Bearer ${process.env.MEDICAL_SYSTEM_API_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`部門マスタ取得エラー: ${response.statusText}`);
  }

  const data = await response.json();
  return data.departments;
}
```

#### キャッシュ戦略
- VoiceDrive側でキャッシュ（1日1回更新）
- 部門マスタは頻繁に変更されないため、リアルタイム性は不要
- 将来的にはWebhook通知で変更時に即時更新を検討

#### 推定実装時間
**0.5日**（4時間）

---

### API-2: 職員総数取得API 🔴 必須

#### 概要
VoiceDrive組織分析ページの「組織健康度指標」計算に使用する職員総数を提供するAPI。

#### エンドポイント
```
GET /api/v2/employees/count
```

#### 必要な理由
- 組織健康度指標の「声の活性度」「参加率」計算（OrganizationAnalyticsPage.tsx 152-186行目）
- 計算式:
  - 声の活性度 = (投稿数 ÷ 職員数) × 100
  - 参加率 = (投稿者数 ÷ 職員数) × 100
- VoiceDrive側は全職員データを持たず、医療システムが真実の情報源

#### リクエスト仕様

**基本リクエスト**:
```http
GET /api/v2/employees/count
Authorization: Bearer {jwt_token}
```

**フィルタリング（オプション）**:
```http
GET /api/v2/employees/count?facilityId=tategami-hospital
GET /api/v2/employees/count?departmentId=dept-001
GET /api/v2/employees/count?isActive=true&excludeRetired=true
```

#### レスポンス仕様

**成功時（200 OK）**:
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
    "リハビリ部門": 22,
    "その他": 69
  },
  "activeOnly": true,
  "excludeRetired": true,
  "includePartTime": true,
  "includeDispatch": false,
  "calculatedAt": "2025-10-10T10:30:00Z"
}
```

**エラー時（401 Unauthorized）**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証トークンが無効です"
  }
}
```

**エラー時（403 Forbidden）**:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "このAPIへのアクセス権限がありません（Level 15以上が必要）"
  }
}
```

#### セキュリティ要件
- **認証**: JWT Bearer Token認証必須
- **認可**: Level 15以上のみアクセス可能
- **Rate Limit**: 100 req/min/IP
- **HTTPS**: 本番環境では必須
- **データマスキング**: 個人情報は含めない（集計値のみ）

#### VoiceDrive側の利用方法

```typescript
// src/services/OrganizationAnalyticsService.ts
private async getTotalEmployees(): Promise<number> {
  const response = await fetch('/api/medical-system/employees/count', {
    headers: {
      'Authorization': `Bearer ${process.env.MEDICAL_SYSTEM_API_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`職員総数取得エラー: ${response.statusText}`);
  }

  const data = await response.json();
  return data.totalEmployees;
}
```

#### キャッシュ戦略
- VoiceDrive側でキャッシュ（1日1回更新）
- リアルタイム精度は不要（±数名の誤差は許容）
- 深夜バッチで更新（AM 2:00）

#### 推定実装時間
**0.5日**（4時間）

---

## ❓ 確認が必要な事項（2件）

### 確認-1: 部門マスタのデータ構造 🟡 確認必須

#### 質問
医療システムの`DepartmentMaster`テーブルには、以下のフィールドが存在しますか？

| フィールド名 | 型 | 必須 | 説明 | VoiceDrive使用目的 |
|------------|-----|-----|------|------------------|
| `id` | String | ✅ | 部門ID（一意識別子） | 部門の一意識別 |
| `name` | String | ✅ | 部門名 | 画面表示 |
| `facilityId` | String | ✅ | 施設ID | 施設別フィルタリング |
| `facilityName` | String | 🟡 | 施設名 | 画面表示（オプション） |
| `employeeCount` | Number | 🟡 | 所属職員数 | 統計表示（オプション） |
| `departmentCode` | String | 🟡 | 部門コード | ソート・検索（オプション） |
| `isActive` | Boolean | ✅ | 有効/無効フラグ | 無効部門の除外 |
| `parentDepartmentId` | String | 🟡 | 親部門ID | 階層構造表示（将来） |
| `createdAt` | DateTime | 🟡 | 作成日時 | 監査ログ（オプション） |
| `updatedAt` | DateTime | 🟡 | 更新日時 | キャッシュ更新判定 |

#### 期待する回答
以下のいずれかの形式でご回答ください：

**パターンA: すべて存在する場合**
```
✅ すべて存在します。
追加情報: employeeCountは日次バッチで更新されます。
```

**パターンB: 一部不足がある場合**
```
⚠️ 以下のフィールドが不足しています：
- employeeCount: 現在未実装。将来実装予定。
- departmentCode: 現在未実装。必要であれば追加可能。

代替案:
- employeeCountはEmployeeテーブルから動的に集計可能です。
```

**パターンC: 大幅に異なる場合**
```
❌ 現在のテーブル構造は以下の通りです：
[実際のテーブル構造を記載]

VoiceDriveの要件に合わせて調整が必要です。
```

#### 影響範囲
- API-1の実装
- 部門別活性度の集計
- 画面表示項目

#### 回答期限
**2025年10月17日（木）まで**

---

### 確認-2: 職員総数の計算方法 🟡 確認必須

#### 質問
職員総数の計算において、以下の職員区分を**含めるか/除外するか**を確認させてください：

| 職員区分 | 推奨 | 理由 | 確認必要 |
|---------|------|------|---------|
| **退職済み職員** | ❌ 除外 | VoiceDriveアカウント無効 | ✅ |
| **休職中職員** | ✅ 含める | 一時的な休職、復職予定 | ✅ |
| **試用期間中職員** | ✅ 含める | 正式採用前でもVoiceDrive利用可能 | ✅ |
| **パート・アルバイト** | ✅ 含める | 雇用形態問わずカウント | ✅ |
| **派遣職員** | ❓ 要確認 | 派遣元との契約形態による | 🔴 **重要** |
| **外部委託職員** | ❌ 除外 | 外部業者、VoiceDrive利用不可 | ✅ |
| **役員** | ✅ 含める | 経営層もVoiceDrive利用 | ✅ |
| **研修生・実習生** | ❓ 要確認 | 一時的な在籍 | 🟡 |

#### 期待する回答
以下のような形式でご回答ください：

```
✅ 職員総数の計算方法:

含める職員:
- 正社員（退職者除く）
- パート・アルバイト
- 休職中職員
- 試用期間中職員
- 役員
- 派遣職員（常駐型のみ）

除外する職員:
- 退職済み職員（isRetired=true）
- 外部委託職員
- 派遣職員（短期・スポット型）
- 研修生・実習生（3ヶ月未満）

SQL例:
SELECT COUNT(*) FROM Employee
WHERE isRetired = false
  AND employmentType NOT IN ('external_contractor', 'intern_short_term')
  AND (employmentType != 'dispatch' OR dispatchType = 'permanent')
```

#### 影響範囲
- API-2の実装
- 組織健康度指標の精度
- 声の活性度・参加率の計算

#### 重要度
🔴 **非常に重要** - この定義により組織分析の精度が大きく変わります

#### 回答期限
**2025年10月17日（木）まで**

---

## 📅 実装スケジュール（提案）

### フェーズ1: 確認・準備（1週間）
**期間**: 2025年10月10日（木）〜 10月17日（木）

| 日付 | 作業内容 | 担当 |
|------|---------|------|
| 10/10（木） | 本要件確認書の送付 | VoiceDrive |
| 10/10-10/17 | 確認-1、確認-2への回答準備 | 医療システム |
| 10/17（木） | 回答期限 | 医療システム |

### フェーズ2: API実装（1週間）
**期間**: 2025年10月18日（金）〜 10月25日（金）

| 日付 | 作業内容 | 担当 | 工数 |
|------|---------|------|------|
| 10/18-10/21 | API-1: 部門マスタAPI実装 | 医療システム | 0.5日 |
| 10/18-10/21 | API-2: 職員総数API実装 | 医療システム | 0.5日 |
| 10/22-10/24 | 単体テスト作成 | 医療システム | 0.5日 |
| 10/25（金） | API仕様書更新・共有 | 医療システム | 0.5日 |

### フェーズ3: VoiceDrive側実装（2-3日）
**期間**: 2025年10月28日（月）〜 10月30日（水）

| 日付 | 作業内容 | 担当 | 工数 |
|------|---------|------|------|
| 10/28-10/29 | OrganizationAnalyticsService実装 | VoiceDrive | 2日 |
| 10/29-10/30 | API実装（GET /api/organization-analytics） | VoiceDrive | 1日 |
| 10/30 | OrganizationAnalyticsPage修正 | VoiceDrive | 0.5日 |

### フェーズ4: 統合テスト（1週間）
**期間**: 2025年10月31日（木）〜 11月7日（木）

| 日付 | 作業内容 | 担当 |
|------|---------|------|
| 10/31-11/1 | 統合テスト（基本機能） | 両チーム |
| 11/4-11/5 | 統合テスト（エラーケース） | 両チーム |
| 11/6-11/7 | パフォーマンステスト | 両チーム |

### フェーズ5: 本番リリース
**期間**: 2025年11月11日（月）

| 日付 | 作業内容 | 担当 |
|------|---------|------|
| 11/11（月） | 本番環境デプロイ | 両チーム |
| 11/12-11/14 | モニタリング | 両チーム |

---

## 📊 工数サマリー

### 医療システム側
| 作業項目 | 工数 |
|---------|------|
| 確認-1、確認-2の回答準備 | 0.5日 |
| API-1: 部門マスタAPI実装 | 0.5日 |
| API-2: 職員総数API実装 | 0.5日 |
| 単体テスト作成 | 0.5日 |
| API仕様書更新 | 0.5日 |
| **合計** | **2.5日** |

### VoiceDrive側
| 作業項目 | 工数 |
|---------|------|
| OrganizationAnalyticsService実装 | 2日 |
| API実装 | 1日 |
| OrganizationAnalyticsPage修正 | 0.5日 |
| **合計** | **3.5日** |

### 両チーム合計
**6日（統合テスト含まず）**

---

## ✅ チェックリスト

### 医療システム側の実装

#### Phase 1: 確認・準備
- [ ] 確認-1への回答（部門マスタのデータ構造）
- [ ] 確認-2への回答（職員総数の計算方法）
- [ ] VoiceDriveチームへの回答送付（10/17まで）

#### Phase 2: API実装
- [ ] API-1実装（GET /api/v2/departments）
- [ ] API-2実装（GET /api/v2/employees/count）
- [ ] 認証・認可機能の実装
- [ ] Rate Limit機能の実装
- [ ] エラーハンドリング実装

#### Phase 3: テスト
- [ ] API-1の単体テスト作成
- [ ] API-2の単体テスト作成
- [ ] API仕様書更新（OpenAPI 3.0形式）
- [ ] VoiceDriveチームへの仕様書共有

#### Phase 4: 統合テスト
- [ ] VoiceDriveチームとの統合テスト参加
- [ ] エラーケーステスト
- [ ] パフォーマンステスト

---

## 🔗 関連ドキュメント

### VoiceDrive側作成済み
1. [organization-analytics_DB要件分析_20251010.md](./organization-analytics_DB要件分析_20251010.md) - 技術的詳細分析
2. [organization-analytics暫定マスターリスト_20251010.md](./organization-analytics暫定マスターリスト_20251010.md) - 実装チェックリスト
3. [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ責任の明確化

### 参考: PersonalStationの連携事例
4. [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md) - 類似ページの実装例

---

## 📞 連絡体制

### VoiceDriveチーム
- **Slack**: #voicedrive-integration
- **担当**: システム開発チーム
- **質問対応**: 平日 9:00-18:00

### 医療システムチーム
- **Slack**: #medical-system-integration
- **担当**: システム開発チーム

### 共通
- **MCPサーバー共有フォルダ**: `mcp-shared/docs/`
- **定例会議**: 毎週月曜 10:00-11:00
- **緊急連絡**: Slack DM

---

## 🎯 期待する成果物

### 医療システムチームからの回答

#### 10月17日（木）までに必要な回答
1. **確認-1の回答**: 部門マスタのデータ構造確認
2. **確認-2の回答**: 職員総数の計算方法確認

#### 10月25日（金）までに必要な成果物
1. **API-1**: GET /api/v2/departments（実装完了・テスト済み）
2. **API-2**: GET /api/v2/employees/count（実装完了・テスト済み）
3. **API仕様書**: OpenAPI 3.0形式
4. **単体テスト**: カバレッジ80%以上

---

## 💡 補足情報

### VoiceDrive側の実装状況
- ✅ DB要件分析完了
- ✅ 暫定マスターリスト作成
- ✅ schema.prisma更新（ManagementCommitteeAgendaに実装追跡フィールド追加）
- ⏳ OrganizationAnalyticsService実装待ち（医療システムAPI完成後）
- ⏳ API実装待ち（医療システムAPI完成後）

### データフロー
```
OrganizationAnalyticsPage（ブラウザ）
  ↓ APIリクエスト
GET /api/organization-analytics
  ↓
OrganizationAnalyticsService（VoiceDrive）
  ├─ VoiceDrive DB集計（Post, Vote, Comment等）
  └─ 医療システムAPI呼び出し
      ├─ GET /api/v2/departments（部門マスタ）
      └─ GET /api/v2/employees/count（職員総数）
```

### セキュリティ考慮事項
- 医療システムAPIは**Level 15以上のみアクセス可能**
- 個人情報は一切含めない（集計値のみ）
- JWT Bearer Token認証必須
- Rate Limit実装必須（DoS攻撃対策）

---

## 📝 質問・不明点がある場合

本要件確認書について質問や不明点がある場合は、以下の方法でご連絡ください：

1. **Slack**: #voicedrive-integration チャンネルで質問
2. **MCPサーバー**: `mcp-shared/docs/` に質問ドキュメントを配置
3. **定例会議**: 毎週月曜 10:00-11:00 で直接質問

**回答期限**: 2025年10月17日（木）17:00

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
承認: 未承認（レビュー待ち）
次回レビュー: 医療システムチームからの回答受領後
