# Project Portfolio Management VoiceDrive回答書

**文書番号**: VOICEDRIVE-RESPONSE-2025-1013-001
**作成日**: 2025年10月13日
**送付先**: 医療職員管理システム 開発チーム
**送付元**: VoiceDrive 開発チーム
**件名**: Project Portfolio Management機能のDB連携確認依頼への回答

---

## 📋 エグゼクティブサマリー

医療システムチームからの「Project Portfolio Management機能のDB連携確認完了通知（文書番号: MEDICAL-NOTIFICATION-2025-1013-001）」を受領しました。確認事項-1〜4について、以下の通り回答いたします。

### ✅ 回答サマリー

| 確認事項 | 結論 | 追加要望 |
|---------|------|---------|
| **確認-1: API仕様** | ✅ 承認 | ✅ あり（3項目） |
| **確認-2: 職種カテゴリー** | ✅ 承認 | ✅ あり（1項目） |
| **確認-3: APIアクセス頻度** | ✅ 承認 | ✅ あり（1項目） |
| **確認-4: データ還流方式** | ✅ 決定 | - |

### 🎯 実装準備状況

- **Phase 15.2準備**: 完了（2025年12月20日開始可能）
- **統合テスト協力**: 承諾（2025年12月19日〜20日）
- **DB要件分析**: 完了（ProjectResourceSummary等5テーブル設計済み）
- **暫定マスターリスト**: 完了（7-11日間の実装計画策定済み）

---

## 🔍 確認事項への回答

### 確認-1: API仕様の確認

#### ✅ 基本仕様の承認

提示いただいたAPI仕様について、**全て承認**いたします。

**エンドポイント**: `GET /api/v2/employees/{employeeId}`

**レスポンスフィールド**:
```json
{
  "data": {
    "employee": {
      // ✅ 基本情報
      "employeeId": "EMP12345",
      "employeeCode": "OH-NS-2021-001",
      "name": "山田太郎",

      // ✅ 組織階層情報
      "facility": "小原病院",
      "facilityId": "obara-hospital",
      "department": "看護部",
      "departmentId": "dept-001",
      "unit": "3階病棟",
      "unitId": "unit-301",

      // ✅ 職種・役職情報
      "profession": "看護師",
      "professionCategory": "nurse",
      "position": "主任",
      "positionId": "pos-001",
      "permissionLevel": 7,
      "status": "active"
    }
  }
}
```

この仕様で、VoiceDrive側の以下の機能を実現できます：
- 職種別リソース集計（看護師5名、医師2名、PT3名等）
- 部署別投票分析
- 施設横断分析
- 権限レベルに基づくアクセス制御

---

#### ⚠️ 追加要望: 3項目のフィールド追加

Project Portfolio Management機能の完全実装のため、以下3項目の追加をご検討いただけますでしょうか：

##### 追加要望-1: `hireDate`（入社日）

**追加理由**:
- **経験年数の正確な計算**に必要
- VoiceDrive側で独自計算すると、医療システムの正式な経験年数と齟齬が生じるリスク

**使用箇所**:
- ProjectResourceSummary: 経験年数別リソース配分分析
  - 例: 「新人（1年未満）3名、中堅（5-10年）8名、ベテラン（10年以上）5名」
- Leadership Development: リーダー育成分析
  - 例: 「入社3年目でプロジェクトリーダー抜擢」

**追加後のレスポンス例**:
```json
{
  "employee": {
    "employeeId": "EMP12345",
    "hireDate": "2021-04-01",  // ⭐ 追加
    "experienceYears": 4.5,    // ⭐ 追加（医療システム側で計算済み）
    // ...既存フィールド
  }
}
```

**代替案**:
もし`hireDate`の提供が難しい場合、`experienceYears`（経験年数）のみの提供でも対応可能です。

---

##### 追加要望-2: `employmentType`（雇用形態）

**追加理由**:
- **正職員・契約職員・パート・派遣等の区別**が必要
- リソース配分計画において、雇用形態別の労働時間・コスト計算が必須

**使用箇所**:
- ProjectResourceSummary: 雇用形態別リソース配分
  - 例: 「正職員: 8名（640人日）、契約職員: 2名（120人日）、パート: 2名（60人日）」
- Portfolio ROI分析: 雇用形態別コスト計算
  - 例: 「正職員の人件費単価 5万円/日、契約職員 3万円/日」

**想定される値**:
```typescript
type EmploymentType =
  | 'full_time'      // 正職員
  | 'contract'       // 契約職員
  | 'part_time'      // パート・アルバイト
  | 'temporary'      // 派遣・臨時職員
  | 'other';         // その他
```

**追加後のレスポンス例**:
```json
{
  "employee": {
    "employeeId": "EMP12345",
    "employmentType": "full_time",  // ⭐ 追加
    // ...既存フィールド
  }
}
```

---

##### 追加要望-3: `teamIds`（所属チーム・委員会ID配列）

**追加理由**:
- **部署横断プロジェクトの分析**に必要
- 医療現場では「配属部署」とは別に、「感染対策チーム」「医療安全委員会」等の横断組織に所属するケースが多い

**使用箇所**:
- Project Team Member分析: 横断組織メンバーの把握
  - 例: 「感染対策チーム6名が、COVID-19対策プロジェクトに参加」
- Organization Development: 部署横断コラボレーション分析
  - 例: 「医療安全委員会メンバーが、複数のプロジェクトでリーダーシップを発揮」

**追加後のレスポンス例**:
```json
{
  "employee": {
    "employeeId": "EMP12345",
    "teamIds": [  // ⭐ 追加
      "infection-control-team",
      "patient-safety-committee"
    ],
    "teams": [  // ⭐ 追加（オプション：チーム名も取得できると理想的）
      {
        "teamId": "infection-control-team",
        "teamName": "感染対策チーム",
        "role": "member"  // member, leader, advisor等
      },
      {
        "teamId": "patient-safety-committee",
        "teamName": "医療安全委員会",
        "role": "leader"
      }
    ],
    // ...既存フィールド
  }
}
```

**代替案**:
もし実装が難しい場合、以下の代替案で対応可能です：
- **Option A**: VoiceDrive側で独自に「プロジェクトチーム」テーブルを管理（医療システムの正式な横断組織とは別管理）
- **Option B**: Phase 2で追加実装（Phase 1では部署情報のみで運用）

---

#### 📊 追加要望のまとめ

| 項目 | 優先度 | 理由 | 代替案の有無 |
|------|-------|------|------------|
| `hireDate` / `experienceYears` | 🔴 高 | 経験年数別分析に必須 | ✅ あり |
| `employmentType` | 🔴 高 | コスト計算に必須 | ❌ なし |
| `teamIds` / `teams` | 🟡 中 | 部署横断分析に有用 | ✅ あり（Phase 2で対応） |

**対応期限について**:
- 上記3項目は、Phase 15.2（2025年12月20日〜）の開始前に仕様確定できれば理想的です
- ただし、実装が間に合わない場合は、Phase 15.3（2026年1月以降）での追加実装でも対応可能です

---

### 確認-2: 職種カテゴリー22種類の確認

#### ✅ 基本22種類の承認

提示いただいた職種カテゴリー22種類について、**全て承認**いたします。

**医療職13種類**:
- nurse（看護師）
- assistant_nurse（准看護師）
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

**事務職・その他9種類**:
- admin（事務職）
- medical_clerk（医療事務）
- it_staff（情報システム）
- facility_staff（施設管理）
- cooking_staff（調理師）
- driver（運転手）
- security（警備員）
- cleaning_staff（清掃員）
- other（その他）

この分類で、VoiceDrive側の職種別分析を実装できます。

---

#### ⚠️ 追加要望: 1種類の職種カテゴリー追加

##### 追加要望-4: `nursing_assistant`（看護補助者）

**追加理由**:
- 医療現場では「看護師・准看護師」とは別に、「看護補助者」が重要な役割を担っています
- 現在の分類では、看護補助者が「other（その他）」に分類されてしまい、正確な職種別分析ができません

**看護職の3分類**:
1. **nurse（看護師）**: 正看護師資格保有者
2. **assistant_nurse（准看護師）**: 准看護師資格保有者
3. **nursing_assistant（看護補助者）** ⭐追加: 無資格または介護福祉士資格で看護業務を補助

**使用箇所**:
- 看護部のリソース配分分析
  - 例: 「看護師10名、准看護師3名、看護補助者5名」
- 夜勤シフト最適化プロジェクト
  - 例: 「看護師と看護補助者の適切な配置比率の分析」

**追加後の医療職14種類**:
```typescript
type ProfessionCategory =
  | 'nurse'              // 看護師
  | 'assistant_nurse'    // 准看護師
  | 'nursing_assistant'  // ⭐ 看護補助者（追加）
  | 'doctor'
  | 'pt'
  // ...残り11種類
```

**代替案**:
もし追加が難しい場合、以下の対応で運用します：
- `care_worker`（介護福祉士）を拡張解釈し、看護補助者も含める
- VoiceDrive側のUI表示で「看護補助者」と表示する

---

### 確認-3: APIアクセス頻度の確認

#### ✅ 基本想定の承認

提示いただいたAPIアクセス頻度の想定について、**承認**いたします。

**想定**:
- **日次バッチ（深夜3:00）**: 1,000-2,000リクエスト
- **Redis 24時間キャッシュ**: キャッシュヒット率 95%以上を目標

この設定で、VoiceDrive側の負荷を最小限に抑えながら、最新の職員情報を取得できます。

---

#### ⚠️ 追加要望: リアルタイム取得が必要な1ケース

##### 追加要望-5: 投票時の権限確認（リアルタイム）

**シナリオ**:
ユーザーが投票を実行する際、最新の`permissionLevel`を確認する必要があります。

**理由**:
- 投票実行時に権限レベルが変更されている可能性がある
  - 例: 昨日までLevel 5だったユーザーが、今朝Level 10に昇格
- 不正投票を防ぐため、Redisキャッシュではなく、医療システムAPIから最新情報を取得したい

**アクセス頻度**:
- **リアルタイム取得**: 投票実行時のみ
- **想定頻度**: 1日あたり100-500リクエスト
  - ピーク時（重要投票の締切日）: 1,000リクエスト/日

**APIレート制限への影響**:
- VoiceDrive専用5,000 req/h で十分対応可能
- ピーク時でも1,000 req/日 ≒ 40 req/h なので、余裕あり

**実装方法**:
```typescript
// VoiceDrive側の実装イメージ
async function executeVote(userId: string, proposalId: string, voteType: 'approve' | 'reject') {
  // ステップ1: 最新の職員情報を取得（Redisキャッシュをスキップ）
  const employee = await fetchEmployeeInfo(userId, { skipCache: true });

  // ステップ2: 権限レベルを確認
  if (employee.permissionLevel < proposal.requiredLevel) {
    throw new Error('権限不足のため投票できません');
  }

  // ステップ3: 投票を記録
  await saveVote({ userId, proposalId, voteType, permissionLevel: employee.permissionLevel });
}
```

**確認事項**:
このリアルタイム取得の実装で問題ないでしょうか？
もし負荷が懸念される場合、以下の代替案で対応します：
- **代替案A**: Redisキャッシュ + 5分間のTTL（短期キャッシュ）
- **代替案B**: 投票実行時のみ、医療システムにWebhookで確認リクエスト送信

---

### 確認-4: データ還流の方式

#### ✅ 優先順位の決定

3つの還流方式について、以下の**優先順位**で実装することを提案します。

---

#### 優先度1: Option B - 日次バッチ（定期通知）⭐ 最優先

**実装時期**: Phase 15.3（2025年12月下旬）

**実行時刻**: 毎日深夜4:00 JST（医療システムの日次バッチ終了後）

**還流データ**:
1. **投票結果集計レポート**
   ```json
   {
     "reportType": "daily_voting_summary",
     "date": "2025-12-20",
     "totalVotes": 120,
     "byDepartment": {
       "看護部": { "votes": 60, "approvalRate": 75.5 },
       "リハビリテーション部": { "votes": 30, "approvalRate": 83.3 }
     },
     "byProfession": {
       "nurse": { "votes": 50, "approvalRate": 76.0 },
       "doctor": { "votes": 15, "approvalRate": 80.0 }
     }
   }
   ```

2. **プロジェクト進捗レポート**
   ```json
   {
     "reportType": "project_progress_summary",
     "date": "2025-12-20",
     "totalProjects": 8,
     "byStatus": {
       "in_progress": 5,
       "completed": 2,
       "planning": 1
     },
     "resourceUtilization": {
       "totalPersonDays": 360,
       "byProfession": {
         "nurse": 180,
         "doctor": 60
       }
     }
   }
   ```

**送信方式**:
- **HTTP POST**: 医療システムの受信エンドポイントにJSON送信
- **エンドポイント例**: `POST https://medical-system.example.com/api/v2/voicedrive/reports`
- **認証**: JWT Bearer Token（医療システムから発行）

**リトライロジック**:
- 送信失敗時: 5分後、10分後、30分後に再試行（最大3回）
- 3回失敗した場合: Slack #medical-voicedrive-integration に通知

---

#### 優先度2: Option A - Webhook通知（リアルタイム）

**実装時期**: Phase 15.4（2026年1月上旬）

**対象イベント**:
1. **重要提案の承認**
   - 投資額1,000万円以上のプロジェクト承認
   - 組織構造変更に関する提案承認
   - 即座に医療システム側で確認が必要なケース

2. **プロジェクト完了**
   - プロジェクトが完了状態になった時
   - 完了レポートを即座に送信

3. **異常検知**
   - 投票参加率が極端に低い（10%未満）
   - プロジェクト予算超過アラート

**Webhook送信例**:
```json
{
  "eventType": "proposal_approved",
  "eventId": "EVT-2025-12-20-001",
  "timestamp": "2025-12-20T10:30:00+09:00",
  "data": {
    "proposalId": "PROP-456",
    "proposalTitle": "電子カルテシステム刷新",
    "investmentAmount": 85000000,
    "approvalRate": 87.5,
    "totalVotes": 120,
    "approvedVotes": 105
  }
}
```

**送信方式**:
- **HTTP POST**: 医療システムのWebhook受信エンドポイント
- **エンドポイント例**: `POST https://medical-system.example.com/api/v2/webhooks/voicedrive`
- **リトライロジック**: 5秒後、30秒後、5分後に再試行（最大3回）

---

#### 優先度3: Option C - ファイルベース連携（オプション）

**実装時期**: Phase 15.5以降（2026年2月以降、必要に応じて）

**対象データ**:
- 月次レポート（CSV/JSON）
- 四半期分析レポート（PDF）
- 年次統計データ（Excel）

**配置先**:
- 共有ストレージ: `s3://medical-voicedrive-shared/reports/`
- 医療システム側で毎日5:00に取得

**ファイル例**:
```
/reports/
  /monthly/
    2025-12-monthly-voting-report.json
    2025-12-monthly-voting-report.pdf
  /quarterly/
    2025-Q4-organization-analysis.json
    2025-Q4-organization-analysis.pdf
  /annual/
    2025-annual-statistics.xlsx
```

**優先度が低い理由**:
- Option B（日次バッチ）で大部分のデータ還流が実現できる
- ファイルベース連携は、レポート生成の手間がかかる
- 必要に応じて後から追加実装する方針

---

#### 📊 データ還流方式のまとめ

| 方式 | 実装時期 | 用途 | 頻度 |
|------|---------|------|------|
| **Option B: 日次バッチ** | Phase 15.3 | 定期レポート | 毎日4:00 |
| **Option A: Webhook** | Phase 15.4 | 重要イベント通知 | イベント発生時 |
| **Option C: ファイル** | Phase 15.5以降 | 月次・四半期レポート | 月1回・四半期1回 |

**推奨実装順序**:
1. Option B（日次バッチ）を最優先で実装
2. Option A（Webhook）を追加実装
3. Option C（ファイル）は必要に応じて検討

---

## 📅 VoiceDrive側の実装スケジュール

### Phase 15.2: ProjectResourceSummary実装（2025年12月20日〜27日、8日間）

医療システム側のPhase 15.1（2025年12月16日〜19日）完了後、VoiceDrive側の実装を開始します。

#### 12月20日（金）: DB設計・マイグレーション

**担当**: DBチーム、バックエンドエンジニア

**実装内容**:
1. **ProjectResourceSummaryテーブル追加**
   ```prisma
   model ProjectResourceSummary {
     id                      String    @id @default(cuid())
     projectId               String    @unique @map("project_id")
     totalPersonDays         Int       @default(0) @map("total_person_days")
     nurseCount              Int       @default(0) @map("nurse_count")
     doctorCount             Int       @default(0) @map("doctor_count")
     ptCount                 Int       @default(0) @map("pt_count")
     // ...他職種
     createdAt               DateTime  @default(now()) @map("created_at")
     updatedAt               DateTime  @updatedAt @map("updated_at")
   }
   ```

2. **Prismaマイグレーション実行**
   ```bash
   npx prisma migrate dev --name add_project_resource_summary
   ```

**成果物**:
- ✅ ProjectResourceSummaryテーブル追加完了
- ✅ マイグレーションファイル作成完了

---

#### 12月21日（月）〜23日（水）: サービス層実装（3日間）

**担当**: バックエンドエンジニア

**実装内容**:
1. **ProjectResourceService実装**
   ```typescript
   // src/services/ProjectResourceService.ts
   export class ProjectResourceService {
     async calculateResourceSummary(projectId: string): Promise<ProjectResourceSummary> {
       // ステップ1: プロジェクトメンバーを取得
       const members = await prisma.projectTeamMember.findMany({ where: { projectId } });

       // ステップ2: 各メンバーの職員情報を医療システムAPIから取得
       const professionCounts = { nurse: 0, doctor: 0, pt: 0, admin: 0 };
       for (const member of members) {
         const employee = await fetchEmployeeInfo(member.userId); // Redisキャッシュ利用
         professionCounts[employee.professionCategory]++;
       }

       // ステップ3: ProjectResourceSummaryテーブルに保存
       return await prisma.projectResourceSummary.upsert({
         where: { projectId },
         create: { projectId, ...professionCounts },
         update: professionCounts
       });
     }
   }
   ```

2. **医療システムAPI連携実装**
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
   ```

**成果物**:
- ✅ ProjectResourceService実装完了
- ✅ 医療システムAPI連携実装完了
- ✅ 単体テスト作成完了

---

#### 12月24日（木）: API実装

**担当**: バックエンドエンジニア

**実装内容**:
```typescript
// src/api/routes/project.routes.ts
router.get('/projects/:projectId/resource-summary', async (req, res) => {
  try {
    const { projectId } = req.params;
    const service = new ProjectResourceService();
    const summary = await service.calculateResourceSummary(projectId);
    res.json({ data: { resourceSummary: summary } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**成果物**:
- ✅ API実装完了
- ✅ APIドキュメント作成完了

---

#### 12月25日（金）: 統合テスト

**担当**: QAエンジニア、バックエンドエンジニア

**テスト内容**:
1. 医療システムAPI接続テスト
2. professionCategoryフィールド確認
3. Redisキャッシュ動作確認
4. 職種別集計の正確性確認

**テストケース例**:
```typescript
describe('ProjectResourceService', () => {
  it('職種別カウントが正確に計算される', async () => {
    const summary = await service.calculateResourceSummary('PROJ123');
    expect(summary.nurseCount).toBe(6);
    expect(summary.doctorCount).toBe(2);
    expect(summary.ptCount).toBe(2);
  });
});
```

**成果物**:
- ✅ 統合テスト完了
- ✅ テストレポート作成完了

---

#### 12月26日（土）〜27日（日）: バッチ処理実装

**担当**: バックエンドエンジニア

**実装内容**:
```typescript
// src/batch/projectResourceBatch.ts
import cron from 'node-cron';

// 毎日深夜3:00に実行
cron.schedule('0 3 * * *', async () => {
  console.log('プロジェクトリソース集計バッチ開始');

  const projects = await prisma.project.findMany({
    where: { status: { in: ['planning', 'in_progress'] } }
  });

  const service = new ProjectResourceService();
  for (const project of projects) {
    await service.calculateResourceSummary(project.id);
  }

  console.log('プロジェクトリソース集計バッチ完了');
});
```

**成果物**:
- ✅ バッチ処理実装完了
- ✅ バッチ処理ドキュメント作成完了

---

### Phase 15.3: データ還流実装（2025年12月28日〜2026年1月3日、7日間）

#### 実装内容

1. **日次バッチレポート送信**（Option B）
2. **医療システム受信エンドポイント確認**
3. **リトライロジック実装**
4. **統合テスト**

詳細スケジュールは、Phase 15.2完了後に調整します。

---

## ✅ 統合テストの協力体制

### テスト期間: 2025年12月19日〜20日

#### 12月19日（木）: 医療システムAPI接続テスト

**VoiceDrive側の準備**:
- ✅ 開発環境でのAPI接続確認
- ✅ JWT Bearer Token認証テスト
- ✅ レスポンスデータの整合性確認

**医療システム側へのお願い**:
- APIトークン発行（開発環境用）
- テストデータの準備（職員情報10件程度）
- professionCategoryフィールドの確認

---

#### 12月20日（金）: E2Eテスト

**テストシナリオ**:
1. ProjectPortfolioManagementページにアクセス
2. 職種別リソース集計が正しく表示される
3. 部署別投票分析が正しく動作する
4. Redisキャッシュが正しく動作する

**VoiceDrive側の作業**:
- フロントエンド実装（ProjectResourceSummary表示）
- E2Eテストコード作成

**医療システム側へのお願い**:
- APIの安定稼働
- テストデータの維持

---

## 📞 連絡体制

### VoiceDriveチーム連絡先

**開発チーム**:
- **Slack**: #voicedrive-dev
- **Email**: voicedrive-dev@example.com

**技術責任者**:
- **担当**: VoiceDrive テックリード
- **Slack**: @voicedrive-lead

**フロントエンド担当**:
- **担当**: フロントエンドエンジニア
- **Slack**: @frontend-lead

**バックエンド担当**:
- **担当**: バックエンドエンジニア
- **Slack**: @backend-lead

### 質問・確認事項の送付先

- **優先**: Slack #medical-voicedrive-integration
- **メール**: voicedrive-dev@example.com
- **緊急**: @voicedrive-lead（Slack DM）

---

## 📌 添付資料

1. **project-portfolio-management_DB要件分析_20251013.md**
   - VoiceDrive側のDB設計詳細
   - ProjectResourceSummary等5テーブルの設計
   - データフロー図

2. **project-portfolio-management暫定マスターリスト_20251013.md**
   - Phase 1-4の実装計画（7-11日間）
   - 21個の実装項目詳細
   - 検証チェックリスト

---

## 🎯 まとめ

### 確認事項への回答

| 確認事項 | 回答 | 追加要望 |
|---------|------|---------|
| **確認-1: API仕様** | ✅ 承認 | hireDate, employmentType, teamIds追加希望 |
| **確認-2: 職種カテゴリー** | ✅ 承認 | nursing_assistant追加希望 |
| **確認-3: APIアクセス頻度** | ✅ 承認 | 投票時のリアルタイム取得追加希望 |
| **確認-4: データ還流方式** | ✅ 決定 | 優先度: Option B > A > C |

### 追加要望のまとめ

| 要望 | 優先度 | 対応期限 |
|------|-------|---------|
| hireDate / experienceYears | 🔴 高 | Phase 15.2開始前（12月19日まで） |
| employmentType | 🔴 高 | Phase 15.2開始前（12月19日まで） |
| teamIds / teams | 🟡 中 | Phase 15.3以降でもOK |
| nursing_assistant | 🟡 中 | Phase 15.2開始前が理想 |
| 投票時リアルタイム取得 | 🔴 高 | Phase 15.2開始前（12月19日まで） |

### 実装準備状況

- ✅ DB要件分析完了
- ✅ 暫定マスターリスト完了
- ✅ Phase 15.2実装計画策定完了
- ✅ 統合テスト協力体制確認済み

### 次のステップ

#### 医療システムチームにお願いしたいこと

1. **追加要望への回答**（期限: 2025年10月27日、2週間後）
   - 5つの追加要望（hireDate, employmentType, teamIds, nursing_assistant, リアルタイム取得）への可否回答
   - 実装が難しい項目があれば、代替案を検討

2. **Phase 15.1の実装**（2025年12月16日〜19日）
   - DB設計変更（professionCategory追加）
   - API実装（GET /api/v2/employees/{employeeId}）
   - APIトークン発行（開発環境・本番環境）

3. **統合テストの協力**（2025年12月19日〜20日）
   - テストデータの準備
   - APIの安定稼働
   - 問題発生時の迅速な対応

#### VoiceDriveチームの作業

1. **追加要望の詳細化**（2025年10月20日〜27日）
   - 追加要望が却下された場合の代替案検討
   - API仕様書のドラフト作成

2. **Phase 15.2の準備**（2025年11月〜12月上旬）
   - DB設計の最終確認
   - サービス層のコード設計
   - テストケースの準備

3. **Phase 15.2の実装**（2025年12月20日〜27日）
   - ProjectResourceSummary実装
   - 医療システムAPI連携実装
   - 統合テスト

---

**回答作成日**: 2025年10月13日
**次回フォローアップ**: 医療システムチームからの回答受領後（2025年10月27日予定）

ご確認のほど、よろしくお願いいたします。

---

**承認**:
- VoiceDrive 技術責任者: （承認待ち）
- VoiceDrive プロジェクトマネージャー: （承認待ち）

---

**文書終了**
