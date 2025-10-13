# Project Portfolio Management VoiceDrive了承書

**文書番号**: VOICEDRIVE-ACCEPTANCE-2025-1013-001
**作成日**: 2025年10月13日
**送付先**: 医療職員管理システム 開発チーム
**送付元**: VoiceDrive 開発チーム
**件名**: Project Portfolio Management機能 医療システム回答書の受領・了承

---

## 📋 エグゼクティブサマリー

医療システムチームからの「Project Portfolio Management機能 追加要望5件への回答書（文書番号: MEDICAL-RESPONSE-2025-1013-002）」を受領しました。回答内容について確認し、以下の通り了承いたします。

### ✅ 了承内容サマリー

| 追加要望 | 医療システム回答 | VoiceDrive了承 |
|---------|----------------|---------------|
| **要望-1: hireDate/experienceYears** | ✅ Phase 15.1実装 | ✅ 了承 |
| **要望-2: employmentType** | ✅ Phase 15.1実装 | ✅ 了承 |
| **要望-3: teamIds/teams** | ⚠️ Phase 16実装 | ✅ 了承（延期受入） |
| **要望-4: nursing_assistant** | ✅ Phase 15.1実装 | ✅ 了承 |
| **要望-5: リアルタイム取得** | ✅ Phase 15.1実装 | ✅ 了承 |

### 🎯 結論

医療システムチームの回答内容について、**全て了承**いたします。
- ✅ Phase 15.1での4つの要望実装（12月16-19日）
- ✅ Phase 16への要望3延期（2026年1月）
- ✅ データ還流方式の優先順位（Option B > A > C）

---

## 🔍 回答内容の確認と了承

### 要望-1: hireDate（入社日）/ experienceYears（経験年数）

#### 医療システム側の回答
- ✅ **実装可能**: Phase 15.1（2025年12月16-19日）
- ✅ **hireDate**: 既存フィールド、APIレスポンスに含めるのみ
- ✅ **experienceYears**: サーバー側で計算して返却（計算式: `(現在日時 - hireDate) / 365日`）
- ✅ **追加作業時間**: 1時間

#### VoiceDrive側の了承
✅ **了承いたします**

**確認事項**:
- 小数点第1位まで返却（例: 4.5年）→ ✅ 問題なし
- User.experienceYearsフィールドで受信 → ✅ 準備済み
- Webhook-2で日次更新受信 → ✅ 対応可能

**VoiceDrive側の準備状況**:
```prisma
model User {
  experienceYears          Float?    @map("experience_years")
  experienceLastUpdatedAt  DateTime? @map("experience_last_updated_at")
}
```
✅ スキーマ準備完了

---

### 要望-2: employmentType（雇用形態）

#### 医療システム側の回答
- ✅ **実装可能**: Phase 15.1（2025年12月16-19日）
- ✅ **DB設計変更**: `employmentType`フィールド追加
- ✅ **想定値**: `full_time`, `contract`, `part_time`, `temporary`, `other`
- ✅ **既存データ**: 全て`full_time`（正職員）として初期設定
- ✅ **追加作業時間**: 3時間

#### VoiceDrive側の了承
✅ **了承いたします**

**確認事項**:
- 5つの雇用形態分類 → ✅ 十分な粒度
- 既存データの初期値`full_time` → ✅ 問題なし
- 後日人事担当者が更新 → ✅ 了解

**VoiceDrive側の対応**:
- ProjectResourceSummaryで雇用形態別集計に使用
- Portfolio ROI分析で雇用形態別コスト計算に使用

---

### 要望-3: teamIds/teams（所属チーム・委員会ID配列）

#### 医療システム側の回答
- ⚠️ **Phase 16以降で実装**: 2026年1月6-20日（15日間）
- ❌ **Phase 15.1では実装困難**: 横断組織マスターデータが一元管理されていない
- ✅ **代替案提供**: VoiceDrive側で独自管理（推奨）

#### VoiceDrive側の了承
✅ **了承いたします（延期を受け入れます）**

**理由**:
1. **データ整備に1-2ヶ月必要** → 合理的な判断
2. **Phase 15.1のスコープを超える** → 新規機能のため別Phase実装が適切
3. **代替案が明確** → VoiceDrive側で独自管理可能

**VoiceDrive側の対応**:
- **Phase 15.1-15.4**: VoiceDrive側で「プロジェクトチーム」テーブルを独自管理
- **Phase 16**: 医療システム側の実装完了後に連携
- **2026年1月**: Phase 16での統合実装に協力

**Phase 16での要件提供スケジュール**:
- **2025年11月中**: 横断組織の想定種類、分析項目、UI/UX要件を提供

---

### 要望-4: nursing_assistant（看護補助者）職種カテゴリー追加

#### 医療システム側の回答
- ✅ **実装可能**: Phase 15.1（2025年12月16-19日）
- ✅ **職種カテゴリー拡張**: 22種類 → 23種類
- ✅ **看護職の3分類**: nurse, assistant_nurse, **nursing_assistant**
- ✅ **追加作業時間**: 1時間

#### VoiceDrive側の了承
✅ **了承いたします**

**確認事項**:
- 看護職の3分類（正看護師、准看護師、看護補助者）→ ✅ 医療現場の実態に即している
- 職種カテゴリー23種類 → ✅ VoiceDrive側の集計ロジックで対応可能

**VoiceDrive側の対応**:
- ProjectResourceSummaryで看護職3分類を集計
- UI表示で「看護補助者」を明確に表示

---

### 要望-5: 投票時の権限確認（リアルタイム取得）

#### 医療システム側の回答
- ✅ **実装可能**: Phase 15.1（2025年12月16-19日）
- ✅ **APIクエリパラメータ**: `?skipCache=true`追加
- ✅ **レート制限**: VoiceDrive専用5,000 req/h で十分対応可能
- ✅ **追加作業時間**: 2時間

#### VoiceDrive側の了承
✅ **了承いたします**

**確認事項**:
- ピーク時でも40 req/h なので余裕あり → ✅ 問題なし
- skipCache=trueでリアルタイム取得 → ✅ 実装方法明確

**VoiceDrive側の実装**:
```typescript
// 投票実行時のみ、最新情報を取得
async function executeVote(userId: string, proposalId: string) {
  const employee = await fetchEmployeeInfo(userId, { skipCache: true });

  if (employee.permissionLevel < proposal.requiredLevel) {
    throw new Error('権限不足のため投票できません');
  }

  await saveVote({ userId, proposalId, permissionLevel: employee.permissionLevel });
}
```
✅ 実装準備完了

---

## 📊 実装スケジュールの確認

### Phase 15.1: 医療システムAPI実装（2025年12月16-19日、4日間）

#### 医療システム側の作業
| 日付 | 作業内容 | VoiceDrive側確認 |
|------|---------|-----------------|
| 12月16日（月） | DB設計変更（professionCategory, employmentType） | ✅ 了承 |
| 12月17日（火） | API実装（GET /api/v2/employees/{employeeId}） | ✅ 了承 |
| 12月18日（水） | API実装完了、単体テスト | ✅ 了承 |
| 12月19日（木） | レート制限更新、統合テスト準備 | ✅ 協力予定 |

**作業時間**:
- 当初見積: 22時間
- 追加作業: 8時間
- **合計: 30時間**（4日間で完了可能）

✅ **スケジュール了承**

---

### Phase 15.2: VoiceDrive ProjectResourceSummary実装（2025年12月20-27日、8日間）

#### VoiceDrive側の作業
| 日付 | 作業内容 | 状態 |
|------|---------|------|
| 12月20日（金） | DB設計・マイグレーション（ProjectResourceSummary追加） | ✅ 準備完了 |
| 12月21-23日 | サービス層実装（ProjectResourceService, MedicalSystemApiClient拡張） | ✅ 設計完了 |
| 12月24日（火） | API実装（GET /projects/:projectId/resource-summary） | ✅ 設計完了 |
| 12月25日（水） | 統合テスト | ✅ テストシナリオ準備済み |
| 12月26-27日 | バッチ処理実装（毎日深夜3:00実行） | ✅ cron設計完了 |

**実装準備状況**:
- ✅ ProjectResourceSummaryテーブル設計完了
- ✅ ProjectResourceService設計完了
- ✅ MedicalSystemApiClient拡張設計完了
- ✅ 医療システムAPI仕様理解完了

✅ **Phase 15.2開始準備完了**

---

### Phase 15.3: データ還流実装（2025年12月28日〜2026年1月3日、7日間）

#### 実装内容
1. **日次バッチレポート送信**（Option B）
   - 実行時刻: 毎日深夜4:00 JST
   - 投票結果集計レポート
   - プロジェクト進捗レポート

2. **医療システム受信エンドポイント確認**
   - POST https://medical-system.example.com/api/v2/voicedrive/reports

3. **リトライロジック実装**
   - 送信失敗時: 5分後、10分後、30分後に再試行（最大3回）

✅ **Phase 15.3実装計画了承**

---

## 🤝 統合テストの協力体制

### テスト期間: 2025年12月19日〜20日

#### 12月19日（木）: 医療システムAPI接続テスト

**VoiceDrive側の準備**:
- ✅ 開発環境でのAPI接続確認スクリプト準備完了
- ✅ JWT Bearer Token認証テスト準備完了
- ✅ レスポンスデータ整合性確認ツール準備完了

**医療システム側へのお願い**:
- APIトークン発行（開発環境用）
- テストデータの準備（職員情報10件程度）
  - 正職員: 5件
  - 契約職員: 3件
  - パート: 2件
- professionCategoryフィールド23種類の確認
  - 看護師、准看護師、**看護補助者**を含む

---

#### 12月20日（金）: E2Eテスト

**テストシナリオ**:
1. ProjectPortfolioManagementページにアクセス
2. 職種別リソース集計が正しく表示される（23種類対応）
3. 雇用形態別リソース配分が正しく表示される（5種類対応）
4. 投票時の権限確認がリアルタイム取得される（skipCache=true）
5. Redisキャッシュが正しく動作する

**VoiceDrive側の作業**:
- ✅ フロントエンド実装（ProjectResourceSummary表示）準備完了
- ✅ E2Eテストコード作成準備完了
- ✅ パフォーマンステスト準備完了

---

## 📅 データ還流方式の了承

### 優先順位の確認

医療システムチームから提案いただいた優先順位について、**全て了承**いたします。

**実装順序**:
1. ✅ **Option B: 日次バッチ（定期通知）** - Phase 15.3（2025年12月28日〜2026年1月3日）
2. ✅ **Option A: Webhook通知（リアルタイム）** - Phase 15.4（2026年1月上旬）
3. ✅ **Option C: ファイルベース連携** - Phase 15.5以降（2026年2月以降、必要に応じて）

**理由**:
- Option Bで大部分のデータ還流が実現できる → ✅ 合理的
- Option Aは重要イベントのみ → ✅ 効率的
- Option Cは必要に応じて後から追加 → ✅ 柔軟性確保

---

## ✅ VoiceDrive側の準備完了確認

### DB設計

```prisma
model ProjectResourceSummary {
  id                      String    @id @default(cuid())
  projectId               String    @unique @map("project_id")
  totalPersonDays         Int       @default(0) @map("total_person_days")

  // 23種類の職種カウント
  nurseCount              Int       @default(0) @map("nurse_count")
  assistantNurseCount     Int       @default(0) @map("assistant_nurse_count")
  nursingAssistantCount   Int       @default(0) @map("nursing_assistant_count")  // ⭐ 追加
  doctorCount             Int       @default(0) @map("doctor_count")
  ptCount                 Int       @default(0) @map("pt_count")
  // ... 残り18種類

  // 雇用形態別カウント
  fullTimeCount           Int       @default(0) @map("full_time_count")
  contractCount           Int       @default(0) @map("contract_count")
  partTimeCount           Int       @default(0) @map("part_time_count")
  temporaryCount          Int       @default(0) @map("temporary_count")
  otherEmploymentCount    Int       @default(0) @map("other_employment_count")

  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")
  calculatedAt            DateTime? @map("calculated_at")

  project                 Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("project_resource_summary")
}
```
✅ **スキーマ設計完了**

---

### サービス層設計

```typescript
// src/services/ProjectResourceService.ts
export class ProjectResourceService {
  async calculateResourceSummary(projectId: string): Promise<ProjectResourceSummary> {
    const members = await prisma.projectTeamMember.findMany({ where: { projectId } });

    const professionCounts = {
      nurse: 0,
      assistant_nurse: 0,
      nursing_assistant: 0,  // ⭐ 追加
      doctor: 0,
      pt: 0,
      // ... 残り18種類
    };

    const employmentCounts = {
      full_time: 0,
      contract: 0,
      part_time: 0,
      temporary: 0,
      other: 0
    };

    for (const member of members) {
      // 医療システムAPIから職員情報取得（Redisキャッシュ利用）
      const employee = await fetchEmployeeInfo(member.userId);

      professionCounts[employee.professionCategory]++;
      employmentCounts[employee.employmentType]++;
    }

    return await prisma.projectResourceSummary.upsert({
      where: { projectId },
      create: { projectId, ...professionCounts, ...employmentCounts },
      update: { ...professionCounts, ...employmentCounts }
    });
  }
}
```
✅ **サービス層設計完了**

---

### 医療システムAPI連携

```typescript
// src/services/MedicalSystemApiClient.ts
export async function fetchEmployeeInfo(
  userId: string,
  options: { skipCache?: boolean } = {}
): Promise<EmployeeInfo> {
  // ステップ1: Redisキャッシュ確認（skipCache=falseの場合）
  if (!options.skipCache) {
    const cached = await redis.get(`employee:${userId}`);
    if (cached) return JSON.parse(cached);
  }

  // ステップ2: 医療システムAPIから取得
  const response = await fetch(
    `https://medical-system.example.com/api/v2/employees/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.MEDICAL_SYSTEM_API_KEY}`,
        'X-API-Key': process.env.MEDICAL_SYSTEM_API_KEY
      }
    }
  );
  const data = await response.json();

  // ステップ3: Redisキャッシュに保存（24時間TTL）
  await redis.setex(`employee:${userId}`, 86400, JSON.stringify(data.employee));

  return data.employee;
}

interface EmployeeInfo {
  employeeId: string;
  name: string;
  professionCategory: string;  // 23種類に対応
  employmentType: string;       // 5種類に対応
  hireDate: string;
  experienceYears: number;      // ⭐ 追加
  permissionLevel: number;
  // ...
}
```
✅ **API連携実装準備完了**

---

## 📞 連絡体制の確認

### VoiceDriveチーム連絡先

**開発チーム**:
- **Slack**: #voicedrive-dev
- **Email**: voicedrive-dev@example.com

**技術責任者**:
- **担当**: VoiceDrive テックリード
- **Slack**: @voicedrive-lead

**バックエンド担当**:
- **担当**: バックエンドエンジニア
- **Slack**: @backend-lead

### 質問・確認事項の送付先

- **優先**: Slack #medical-voicedrive-integration
- **メール**: voicedrive-dev@example.com
- **緊急**: @voicedrive-lead（Slack DM）

---

## 📌 Phase 16（横断組織管理）への準備

### 2025年11月中に提供する情報

医療システムチームからのお願いに対して、以下の情報を**2025年11月30日までに提供**いたします。

#### 1. 横断組織の想定種類

**想定する横断組織（12種類）**:
1. 感染対策チーム（ICT: Infection Control Team）
2. 医療安全委員会（Patient Safety Committee）
3. 褥瘡対策委員会（Pressure Ulcer Committee）
4. 栄養サポートチーム（NST: Nutrition Support Team）
5. 緩和ケアチーム（Palliative Care Team）
6. 認知症ケアチーム（Dementia Care Team）
7. 摂食嚥下チーム（Dysphagia Team）
8. 呼吸ケアチーム（Respiratory Care Team）
9. 転倒転落防止委員会（Fall Prevention Committee）
10. 災害対策委員会（Disaster Preparedness Committee）
11. 倫理委員会（Ethics Committee）
12. 教育委員会（Education Committee）

**粒度**:
- 法人全体で活動する横断組織のみ
- 部門内の小規模チームは除外
- 公式に承認された委員会・チームのみ

#### 2. 横断組織の分析項目

**表示したいデータ**:
- チーム別プロジェクト参加状況
  - 例: 「感染対策チーム6名が、COVID-19対策プロジェクトに参加」
- チームメンバーのリーダーシップ分析
  - 例: 「医療安全委員会メンバーが、複数のプロジェクトでリーダーシップを発揮」
- チーム横断コラボレーション
  - 例: 「感染対策チーム × 医療安全委員会のコラボプロジェクト3件」

**分析の目的**:
- 横断組織メンバーの活動量可視化
- 組織横断的な問題解決の推進
- 専門性の高い職員のネットワーク把握

#### 3. UI/UX要件

**表示場所**:
- ProjectPortfolioManagement画面「リソース配分タブ」に追加
- 新規タブ「横断組織分析」を作成

**表示内容**:
```
横断組織分析タブ
├── チーム別メンバー数
│   └── 感染対策チーム: 12名、医療安全委員会: 15名、...
├── チーム別プロジェクト参加状況
│   └── プロジェクト名、参加メンバー数、チーム名
└── チーム横断コラボレーション
    └── 複数チームが参加するプロジェクト一覧
```

**フィルタリング・ソート条件**:
- チーム種別でフィルタ
- プロジェクト参加人数でソート
- 活動期間でフィルタ

---

## ✅ 最終確認事項

### 了承事項の再確認

| 項目 | 医療システム側 | VoiceDrive側 | 状態 |
|------|--------------|-------------|------|
| **Phase 15.1実装** | 12月16-19日（4日間、30時間） | Phase 15.2準備完了 | ✅ 了承 |
| **要望1-2-4-5** | Phase 15.1で実装 | 受信準備完了 | ✅ 了承 |
| **要望3延期** | Phase 16で実装（2026年1月） | 代替案で対応 | ✅ 了承 |
| **統合テスト** | 12月19-20日 | 協力体制確認 | ✅ 了承 |
| **データ還流** | Option B > A > C | 実装準備完了 | ✅ 了承 |
| **Phase 16準備** | 2025年11月中に要件提供依頼 | 11月30日までに提供 | ✅ 了承 |

### 次のステップ

#### VoiceDriveチームの作業

1. **Phase 15.2の準備**（2025年11月〜12月上旬）
   - DB設計の最終確認
   - サービス層のコード設計
   - テストケースの準備

2. **Phase 15.2の実装**（2025年12月20-27日）
   - ProjectResourceSummary実装
   - 医療システムAPI連携実装
   - 統合テスト

3. **Phase 16の要件提供**（2025年11月中）
   - 横断組織管理の要件定義書作成
   - UI/UX要件書作成
   - 2025年11月30日までに医療システムチームへ送付

---

## 🎯 まとめ

### 了承内容の総括

医療システムチームからの回答書について、以下の通り**全て了承**いたします。

**Phase 15.1実装内容（2025年12月16-19日）**:
1. ✅ hireDate / experienceYears実装（1時間）
2. ✅ employmentType実装（3時間）
3. ✅ nursing_assistant追加（1時間）
4. ✅ skipCache対応（2時間）
5. ⚠️ teamIds/teams → Phase 16へ延期（了承）

**実装スケジュール**:
- ✅ Phase 15.1: 医療システムAPI実装（12月16-19日、4日間）
- ✅ Phase 15.2: VoiceDrive実装（12月20-27日、8日間）
- ✅ Phase 15.3: データ還流実装（12月28日〜1月3日、7日間）
- ⚠️ Phase 16: 横断組織管理（2026年1月6-20日、15日間）

**VoiceDrive側の準備状況**:
- ✅ DB設計完了（ProjectResourceSummary、23職種+5雇用形態対応）
- ✅ サービス層設計完了（ProjectResourceService、MedicalSystemApiClient）
- ✅ API連携設計完了（skipCache対応、Redisキャッシュ）
- ✅ 統合テスト準備完了（テストシナリオ、E2Eテストコード）

### 期待される成果

**Phase 15完了時（2026年1月3日）**:
- ✅ 職種別リソース集計（23種類対応、看護補助者含む）
- ✅ 雇用形態別リソース配分（5種類対応）
- ✅ 経験年数別分析（医療システムの正確な計算値）
- ✅ 投票時の権限確認（リアルタイム取得）
- ✅ データ還流（日次バッチ + Webhook）

**Phase 16完了時（2026年1月20日）**:
- ✅ 横断組織メンバー管理
- ✅ チーム別プロジェクト参加分析
- ✅ チーム横断コラボレーション分析

---

**了承作成日**: 2025年10月13日
**次回フォローアップ**: Phase 15.1実装開始（2025年12月16日）

医療システムチームの迅速かつ的確な回答に感謝いたします。
Phase 15-16の実装を成功させるため、引き続き協力してまいります。

---

**承認**:
- VoiceDrive 技術責任者: （承認待ち）
- VoiceDrive プロジェクトマネージャー: （承認待ち）

---

**文書終了**
