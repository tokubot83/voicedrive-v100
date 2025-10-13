# Project Portfolio Management 追加要望への回答書

**文書番号**: MEDICAL-RESPONSE-2025-1013-002
**作成日**: 2025年10月13日
**送付先**: VoiceDrive 開発チーム
**送付元**: 医療職員管理システム 開発チーム
**件名**: Project Portfolio Management機能 追加要望5件への回答

---

## 📋 エグゼクティブサマリー

VoiceDriveチームからの「Project Portfolio Management機能のDB連携確認依頼への回答（文書番号: VOICEDRIVE-RESPONSE-2025-1013-001）」を受領しました。5つの追加要望について、以下の通り回答いたします。

### ✅ 回答サマリー

| 追加要望 | 優先度 | 結論 | 実装時期 |
|---------|-------|------|---------|
| **要望-1: hireDate/experienceYears** | 🔴 高 | ✅ 実装可能 | Phase 15.1（12月16-19日） |
| **要望-2: employmentType** | 🔴 高 | ✅ 実装可能 | Phase 15.1（12月16-19日） |
| **要望-3: teamIds/teams** | 🟡 中 | ⚠️ Phase 16以降 | 2026年1月以降 |
| **要望-4: nursing_assistant** | 🟡 中 | ✅ 実装可能 | Phase 15.1（12月16-19日） |
| **要望-5: 投票時リアルタイム取得** | 🔴 高 | ✅ 実装可能 | Phase 15.1（12月16-19日） |

### 🎯 結論

**5つの追加要望のうち、4つをPhase 15.1で実装します。**

- ✅ **即時実装可能（Phase 15.1）**: 要望1, 2, 4, 5
- ⚠️ **段階的実装（Phase 16以降）**: 要望3（チーム・委員会管理）

---

## 🔍 各要望への詳細回答

### 要望-1: `hireDate`（入社日）/ `experienceYears`（経験年数）

#### ✅ 実装可能

**現状**: 既にDBに`hireDate`フィールドが存在します。

```prisma
model Employee {
  id         String   @id @default(cuid())
  hireDate   DateTime  // ✅ 既に存在
  // ...
}
```

**実装内容**:

1. **`hireDate`フィールドの提供**
   - 既存フィールドのため、追加実装不要
   - API レスポンスに含めるのみ

2. **`experienceYears`フィールドの計算**
   - サーバー側で計算して返却
   - 計算式: `(現在日時 - hireDate) / 365日`
   - 小数点第1位まで返却（例: 4.5年）

**APIレスポンス例**:
```json
{
  "data": {
    "employee": {
      "employeeId": "EMP12345",
      "hireDate": "2021-04-01",
      "experienceYears": 4.5,
      // ...既存フィールド
    }
  }
}
```

**実装時期**: Phase 15.1（2025年12月16-19日）

**追加作業時間**: 1時間（API レスポンス追加のみ）

---

### 要望-2: `employmentType`（雇用形態）

#### ✅ 実装可能

**現状**: DBに`employmentType`フィールドは存在しませんが、追加可能です。

**実装内容**:

1. **DB設計変更**
   ```prisma
   model Employee {
     id             String   @id @default(cuid())
     hireDate       DateTime
     employmentType String   @default("full_time") @map("employment_type")
     // full_time, contract, part_time, temporary, other
     // ...
   }
   ```

2. **マイグレーション実行**
   ```bash
   npx prisma migrate dev --name add_employment_type
   ```

3. **既存データの初期値設定**
   - 既存職員は全て`full_time`（正職員）として設定
   - 後日、人事担当者が正しい雇用形態に更新

**想定される値**:
```typescript
type EmploymentType =
  | 'full_time'      // 正職員
  | 'contract'       // 契約職員
  | 'part_time'      // パート・アルバイト
  | 'temporary'      // 派遣・臨時職員
  | 'other';         // その他
```

**APIレスポンス例**:
```json
{
  "data": {
    "employee": {
      "employeeId": "EMP12345",
      "employmentType": "full_time",
      // ...既存フィールド
    }
  }
}
```

**実装時期**: Phase 15.1（2025年12月16-19日）

**追加作業時間**: 3時間
- DB設計変更: 1時間
- マイグレーション: 1時間
- API実装: 1時間

---

### 要望-3: `teamIds`/`teams`（所属チーム・委員会ID配列）

#### ⚠️ Phase 16以降で実装（段階的対応）

**現状**: DBに横断組織（チーム・委員会）の管理テーブルが存在しません。

**実装が必要な内容**:

1. **新規テーブル設計**
   ```prisma
   // 横断組織マスター
   model CrossFunctionalTeam {
     id           String   @id @default(cuid())
     teamCode     String   @unique
     teamName     String
     teamType     String   // committee, project_team, task_force
     facilityId   String?  // 施設固有 or 法人全体
     isActive     Boolean  @default(true)
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt

     members      TeamMember[]
   }

   // チームメンバー（中間テーブル）
   model TeamMember {
     id           String   @id @default(cuid())
     teamId       String
     employeeId   String
     role         String   // member, leader, advisor
     startDate    DateTime
     endDate      DateTime?
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt

     team         CrossFunctionalTeam @relation(fields: [teamId], references: [id])
     employee     Employee @relation(fields: [employeeId], references: [id])

     @@unique([teamId, employeeId])
   }
   ```

2. **既存データの移行**
   - 現在、横断組織のデータは別システムまたは紙ベースで管理
   - データベースへの移行作業が必要

3. **API実装**
   ```json
   {
     "data": {
       "employee": {
         "employeeId": "EMP12345",
         "teamIds": [
           "infection-control-team",
           "patient-safety-committee"
         ],
         "teams": [
           {
             "teamId": "infection-control-team",
             "teamName": "感染対策チーム",
             "role": "member"
           },
           {
             "teamId": "patient-safety-committee",
             "teamName": "医療安全委員会",
             "role": "leader"
           }
         ]
       }
     }
   }
   ```

**実装が困難な理由**:

1. **データ整備が必要**
   - 現在、横断組織のマスターデータが一元管理されていない
   - 各施設ごとに委員会・チームの名称・構成が異なる
   - データ整備に1-2ヶ月かかる見込み

2. **Phase 15.1のスコープを超える**
   - Phase 15.1は「職員カルテ個人ページの既存情報をAPI化」
   - 横断組織管理は新規機能のため、別Phaseでの実装が適切

**代替案（Phase 15.1〜15.4で運用）**:

VoiceDriveチームから提案いただいた通り、以下の方法で対応します：

**Option A: VoiceDrive側で独自管理（推奨）**
- VoiceDrive側で「プロジェクトチーム」テーブルを管理
- 医療システムの正式な横断組織とは別管理
- Phase 16で医療システム側の実装が完了したら連携

**Option B: Phase 2で追加実装**
- Phase 1では部署情報のみで運用
- 2026年1月以降（Phase 16）で追加実装

**実装時期**: Phase 16（2026年1月以降）

**追加作業時間**: 40-60時間（3-5日間）
- DB設計: 8時間
- データ整備: 16-24時間
- API実装: 8時間
- テスト: 8-16時間

---

### 要望-4: `nursing_assistant`（看護補助者）職種カテゴリー追加

#### ✅ 実装可能

**現状**: 職種カテゴリー22種類に看護補助者が含まれていません。

**実装内容**:

1. **職種カテゴリーを23種類に拡張**

**医療職14種類**（1種類追加）:
- nurse（看護師）
- assistant_nurse（准看護師）
- **nursing_assistant（看護補助者）** ⭐ 追加
- doctor（医師）
- pt（理学療法士）
- ot（作業療法士）
- st（言語聴覚士）
- pharmacist（薬剤師）
- nutritionist（管理栄養士）
- radiologist（診療放射線技師）
- clinical_engineer（臨床工学技士）
- care_worker（介護福祉士）
- care_manager（ケアマネージャー）
- social_worker（医療ソーシャルワーカー）

**事務職・その他9種類**（変更なし）:
- admin（事務職）
- medical_clerk（医療事務）
- it_staff（情報システム）
- facility_staff（施設管理）
- cooking_staff（調理師）
- driver（運転手）
- security（警備員）
- cleaning_staff（清掃員）
- other（その他）

**看護職の3分類**:
```typescript
type NursingProfession =
  | 'nurse'              // 正看護師（国家資格）
  | 'assistant_nurse'    // 准看護師（都道府県知事免許）
  | 'nursing_assistant'; // 看護補助者（無資格 or 介護福祉士）
```

**DB実装**:
```prisma
model Employee {
  id                 String   @id @default(cuid())
  professionCategory String?  @map("profession_category")
  // 値: nurse, assistant_nurse, nursing_assistant, doctor, pt, ot, ... (23種類)
  // ...
}
```

**APIレスポンス例**:
```json
{
  "data": {
    "employee": {
      "employeeId": "EMP12345",
      "profession": "看護補助者",
      "professionCategory": "nursing_assistant",
      // ...既存フィールド
    }
  }
}
```

**実装時期**: Phase 15.1（2025年12月16-19日）

**追加作業時間**: 1時間（カテゴリー追加のみ）

---

### 要望-5: 投票時の権限確認（リアルタイム取得）

#### ✅ 実装可能

**現状**: 日次バッチ + Redis 24時間キャッシュの想定でしたが、リアルタイム取得にも対応可能です。

**実装内容**:

1. **APIクエリパラメータで制御**
   ```typescript
   GET /api/v2/employees/{employeeId}?skipCache=true
   ```

2. **VoiceDrive側の実装イメージ**
   ```typescript
   // 投票実行時のみ、最新情報を取得
   async function executeVote(userId: string, proposalId: string) {
     // skipCache=true でリアルタイム取得
     const employee = await fetchEmployeeInfo(userId, { skipCache: true });

     // 権限レベルを確認
     if (employee.permissionLevel < proposal.requiredLevel) {
       throw new Error('権限不足のため投票できません');
     }

     // 投票を記録
     await saveVote({ userId, proposalId, permissionLevel: employee.permissionLevel });
   }
   ```

3. **APIレート制限の確認**

**想定アクセス頻度**:
- 通常時: 100-500リクエスト/日 ≒ 4-20リクエスト/時
- ピーク時（重要投票の締切日）: 1,000リクエスト/日 ≒ 40リクエスト/時

**VoiceDrive専用レート制限**:
- 5,000リクエスト/時

**結論**: ピーク時でも40リクエスト/時なので、十分対応可能

**実装時期**: Phase 15.1（2025年12月16-19日）

**追加作業時間**: 2時間
- クエリパラメータ追加: 1時間
- テスト: 1時間

---

## 📊 実装スケジュールの更新

### Phase 15.1: 医療システムAPI実装（2025年12月16-19日、4日間）

#### 実装内容の追加

**既存の実装内容**:
1. ✅ DB設計変更（`professionCategory`フィールド追加）
2. ✅ Prismaマイグレーション実行
3. ✅ GET /api/v2/employees/{employeeId} API実装
4. ✅ レート制限設定（VoiceDrive専用5,000 req/h）

**追加実装内容**（今回の追加要望対応）:
5. ⭐ **`hireDate`フィールドの追加**（既存フィールド、レスポンスに含めるのみ）
6. ⭐ **`experienceYears`の計算・返却**
7. ⭐ **`employmentType`フィールドの追加**（DB設計変更 + マイグレーション）
8. ⭐ **`nursing_assistant`職種カテゴリーの追加**（23種類に拡張）
9. ⭐ **`skipCache`クエリパラメータの実装**（リアルタイム取得対応）

#### 作業時間の見積もり

| 作業項目 | 当初見積 | 追加作業 | 合計 |
|---------|---------|---------|------|
| DB設計変更 | 4時間 | 3時間 | 7時間 |
| Prismaマイグレーション | 2時間 | 1時間 | 3時間 |
| API実装 | 8時間 | 3時間 | 11時間 |
| テスト | 8時間 | 1時間 | 9時間 |
| **合計** | **22時間** | **8時間** | **30時間** |

**結論**: 4日間のスケジュール内で実装可能（1日7.5時間 × 4日 = 30時間）

---

### 更新後のAPIレスポンス仕様

```typescript
// GET /api/v2/employees/{employeeId}
// クエリパラメータ: ?skipCache=true (オプション)

{
  "data": {
    "employee": {
      // 基本情報
      "employeeId": "EMP12345",
      "employeeCode": "OH-NS-2021-001",
      "name": "山田太郎",
      "nameKana": "やまだたろう",
      "email": "yamada@obara-hospital.jp",

      // 組織階層情報
      "facility": "小原病院",
      "facilityId": "obara-hospital",
      "department": "看護部",
      "departmentId": "dept-001",
      "unit": "3階病棟",
      "unitId": "unit-301",

      // 職種・役職情報
      "profession": "看護師",
      "professionCategory": "nurse",  // 23種類に拡張
      "position": "主任",
      "positionId": "pos-001",
      "permissionLevel": 7,
      "status": "active",

      // ⭐ 追加フィールド（要望-1）
      "hireDate": "2021-04-01",
      "experienceYears": 4.5,

      // ⭐ 追加フィールド（要望-2）
      "employmentType": "full_time"  // full_time, contract, part_time, temporary, other
    }
  },
  "meta": {
    "timestamp": "2025-12-20T10:30:00+09:00",
    "cached": false  // skipCache=true の場合は false
  }
}
```

---

## 📅 データ還流方式の確認

### 優先順位の承認

VoiceDriveチームから提案いただいた優先順位について、**承認**いたします。

**実装順序**:
1. ✅ **Option B: 日次バッチ（定期通知）** - Phase 15.3（2025年12月28日〜2026年1月3日）
2. ✅ **Option A: Webhook通知（リアルタイム）** - Phase 15.4（2026年1月上旬）
3. ✅ **Option C: ファイルベース連携** - Phase 15.5以降（2026年2月以降、必要に応じて）

### 医療システム側の受信エンドポイント

**日次バッチレポート受信エンドポイント**:
```
POST https://medical-system.example.com/api/v2/voicedrive/reports
```

**Webhook受信エンドポイント**:
```
POST https://medical-system.example.com/api/v2/webhooks/voicedrive
```

**認証方式**:
- JWT Bearer Token（医療システムから発行）
- APIトークンは2025年12月15日までに発行します

---

## 🤝 統合テストの準備

### テスト期間: 2025年12月19日〜20日

#### 医療システム側の準備内容

**12月19日（木）**:
1. ✅ 開発環境APIの稼働確認
2. ✅ APIトークン発行（VoiceDriveチーム用）
3. ✅ テストデータの準備（職員情報20件）
   - 正職員: 10件
   - 契約職員: 5件
   - パート: 3件
   - 派遣: 2件
4. ✅ 職種カテゴリー23種類の確認
   - 看護師: 5件
   - 准看護師: 2件
   - **看護補助者: 3件** ⭐追加
   - 医師: 2件
   - PT: 2件
   - その他: 6件

**12月20日（金）**:
1. ✅ E2Eテストへの協力
2. ✅ APIの安定稼働
3. ✅ 問題発生時の迅速な対応

---

## 📌 要望-3（横断組織管理）の今後の方針

### Phase 16での実装計画（2026年1月以降）

#### 実装時期: 2026年1月6日〜20日（15日間）

**Phase 16.1: 横断組織マスター整備**（5日間）
- 各施設の委員会・チーム一覧のデータ整備
- CrossFunctionalTeamテーブルの設計・実装
- マスターデータの登録

**Phase 16.2: メンバー管理実装**（5日間）
- TeamMemberテーブルの設計・実装
- 職員カルテ個人ページへの「所属チーム」表示追加
- 管理画面での編集機能追加

**Phase 16.3: API実装**（3日間）
- GET /api/v2/employees/{employeeId} に`teamIds`/`teams`フィールド追加
- VoiceDriveチームとの統合テスト

**Phase 16.4: VoiceDrive側対応**（2日間）
- ProjectPortfolioManagement画面への横断組織分析機能追加
- 部署横断プロジェクト分析の実装

#### VoiceDriveチームへのお願い

2025年11月中に、以下の情報をご提供いただけますでしょうか：

1. **横断組織の想定種類**
   - 例: 感染対策チーム、医療安全委員会、教育委員会、等
   - どの程度の粒度で管理すべきか

2. **横断組織の分析項目**
   - どのような分析を行いたいか
   - 表示したいデータの具体例

3. **UI/UX要件**
   - ProjectPortfolioManagement画面でどのように表示するか
   - フィルタリング・ソート条件

この情報を元に、Phase 16の詳細設計を行います。

---

## ✅ まとめ

### 追加要望5件への回答

| 追加要望 | 結論 | 実装時期 | 追加作業時間 |
|---------|------|---------|------------|
| **要望-1: hireDate/experienceYears** | ✅ 実装可能 | Phase 15.1 | 1時間 |
| **要望-2: employmentType** | ✅ 実装可能 | Phase 15.1 | 3時間 |
| **要望-3: teamIds/teams** | ⚠️ Phase 16以降 | 2026年1月 | 40-60時間 |
| **要望-4: nursing_assistant** | ✅ 実装可能 | Phase 15.1 | 1時間 |
| **要望-5: リアルタイム取得** | ✅ 実装可能 | Phase 15.1 | 2時間 |

### Phase 15.1の実装内容（更新版）

**実装期間**: 2025年12月16-19日（4日間、30時間）

**実装内容**:
1. ✅ DB設計変更（`professionCategory`, `employmentType`追加）
2. ✅ 職種カテゴリー23種類対応（`nursing_assistant`追加）
3. ✅ GET /api/v2/employees/{employeeId} API実装
4. ✅ `hireDate`, `experienceYears`, `employmentType`フィールド追加
5. ✅ `skipCache`クエリパラメータ実装（リアルタイム取得対応）
6. ✅ レート制限設定（VoiceDrive専用5,000 req/h）
7. ✅ 統合テスト

### 次のステップ

#### 医療システムチームの作業

1. **Phase 15.1の実装**（2025年12月16-19日）
   - 追加要望1, 2, 4, 5の実装
   - 統合テスト

2. **統合テストの協力**（2025年12月19-20日）
   - テストデータの提供
   - APIの安定稼働

3. **Phase 16の準備**（2025年11月〜12月）
   - 横断組織マスターデータの整備
   - VoiceDriveチームとの要件確認

#### VoiceDriveチームにお願いしたいこと

1. **Phase 15.2の実装**（2025年12月20-27日）
   - ProjectResourceSummary実装
   - 更新後のAPI仕様への対応

2. **統合テスト**（2025年12月19-20日）
   - E2Eテストの実施

3. **Phase 16の要件提供**（2025年11月中）
   - 横断組織管理の要件定義
   - UI/UX要件の共有

---

**回答作成日**: 2025年10月13日
**次回フォローアップ**: Phase 15.1実装開始（2025年12月16日）

ご確認のほど、よろしくお願いいたします。

---

**承認**:
- 医療システム 技術責任者: （承認待ち）
- 医療システム プロジェクトマネージャー: （承認待ち）

---

**添付資料**:
1. Phase 15.1 実装計画書（詳細版）
2. Phase 16 横断組織管理 要件定義書（ドラフト）

---

**文書終了**
