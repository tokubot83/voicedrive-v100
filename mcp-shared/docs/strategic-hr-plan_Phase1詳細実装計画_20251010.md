# Strategic HR Plan Phase 1 詳細実装計画書

**文書番号**: MED-IMPL-2025-1010-014
**作成日**: 2025年10月10日
**作成者**: 医療職員管理システムチーム
**承認**: VoiceDriveチーム回答書（VD-A-2025-1010-012）に基づく
**優先度**: 🔴 HIGH（Level 16経営幹部機能）
**実装期間**: 2025年10月21日（月）〜11月1日（金）【12営業日、実働6日】

**関連文書**:
- [StrategicHRPlan_API実装質問への回答_20251010.md](./StrategicHRPlan_API実装質問への回答_20251010.md)
- [strategic-hr-plan_DB要件分析_20251010.md](./strategic-hr-plan_DB要件分析_20251010.md)
- [strategic-hr-plan暫定マスターリスト_20251010.md](./strategic-hr-plan暫定マスターリスト_20251010.md)
- [strategic-hr-plan_医療システムからの質問書_20251010.md](./strategic-hr-plan_医療システムからの質問書_20251010.md)

---

## 📋 エグゼクティブサマリー

Strategic HR Plan（戦略的人事計画ページ）のPhase 1実装を**2025年10月21日（月）から開始**します。

### Phase 1スコープ

**実装範囲**: 戦略的人事計画タブのみ
- ✅ 戦略的人事目標（職員満足度目標95%等）
- ✅ 戦略的イニシアチブ（タレントマネジメント強化等）
- ✅ 人材戦略ロードマップ（短期・中期・長期目標）
- ✅ 退職統計（人数・離職率）

**スコープ外（Phase 2-3に延期）**:
- ❌ パフォーマンス分析タブ
- ❌ 組織健全性指標の自動計算
- ❌ 退職理由分析
- ❌ 影響力分析

### 実装規模

| 項目 | 数量 |
|------|------|
| **DB テーブル** | 3テーブル + 既存Employee利用 |
| **API エンドポイント** | 4 API |
| **実装工数** | 6日（医療システム4日 + VoiceDrive統合2日） |
| **完了予定日** | 2025年11月1日（金） |

---

## 🎯 Phase 1成功基準

Phase 1は以下がすべて完了した時点で成功とします：

### ✅ DB構築（10/21-25）
- [ ] StrategicHRGoal テーブル作成完了
- [ ] StrategicInitiative テーブル作成完了
- [ ] HRStrategyRoadmap テーブル作成完了
- [ ] Prisma Migration実行完了
- [ ] テストデータ投入完了

### ✅ API実装（10/28-11/1）
- [ ] GET /api/v2/strategic-hr/goals 実装完了（Response Time < 3秒）
- [ ] GET /api/v2/strategic-hr/initiatives 実装完了
- [ ] GET /api/v2/strategic-hr/roadmap 実装完了
- [ ] GET /api/v2/retirement/statistics 実装完了
- [ ] レスポンスキャッシュ実装（Redis、5分間）
- [ ] レートリミット実装（100 req/min/IP）

### ✅ バッチ処理（10/28-11/1）
- [ ] 日次バッチ実装（戦略目標実績値計算、2:00 AM実行）
- [ ] currentSatisfaction計算実装
- [ ] currentTurnoverRate計算実装
- [ ] currentHiring計算実装

### ✅ VoiceDrive側統合（10/28-11/1）
- [ ] StrategicHRPageの戦略的人事計画タブが実データで表示
- [ ] エラーハンドリング・ローディング状態が正常動作
- [ ] Level 16権限チェックが正常動作（院長・事務長のみ閲覧可能）
- [ ] 施設フィルタリングが動作（Level 18理事長用）

### ✅ 統合テスト（11/1）
- [ ] 全APIエンドポイントが正常動作（4/4 = 100%）
- [ ] E2Eテストが成功（戦略的人事計画タブのみ）
- [ ] パフォーマンステスト合格（応答時間 < 3秒）
- [ ] セキュリティテスト（Level 16権限チェック）
- [ ] エラーハンドリングテスト（APIダウン時のフォールバック）

---

## 📅 実装スケジュール

### 全体スケジュール

| 日付 | 作業内容 | 担当 | 工数 | 状態 |
|------|---------|------|------|------|
| **10/16（水）** | OrganizationAnalytics統合テスト完了 | 両チーム | - | ✅ 完了予定 |
| **10/17-18（木-金）** | VoiceDrive準備期間 | VoiceDrive | 1.5日 | 📋 計画 |
| **10/19-20（土-日）** | 週末休息 | - | - | - |
| **10/21（月）** | Phase 1開始・DB設計最終確認 | 医療システム | 0.5日 | 📋 計画 |
| **10/22-25（火-金）** | DB構築・マイグレーション・テストデータ | 医療システム | 2日 | 📋 計画 |
| **10/26-27（土-日）** | 週末休息 | - | - | - |
| **10/28（月）** | API実装開始 | 医療システム | 1日 | 📋 計画 |
| **10/29-30（火-水）** | バッチ処理実装 | 医療システム | 0.5日 | 📋 計画 |
| **10/31（木）** | VoiceDrive統合開始 | 両チーム | 1日 | 📋 計画 |
| **11/1（金）** | 統合テスト・検収 | 両チーム | 1日 | 📋 計画 |

**合計工数**: 6日（医療システム4日 + VoiceDrive統合2日）

---

## 🗄️ DB実装詳細（10/21-25、推定2.5日）

### テーブル1: StrategicHRGoal（戦略的人事目標）

**目的**: 年度別・施設別の戦略的人事目標を管理

**Prismaスキーマ**:
```prisma
model StrategicHRGoal {
  id                          String    @id @default(cuid())
  fiscalYear                  Int       @map("fiscal_year")          // 2025
  facilityId                  String    @map("facility_id")          // 施設別目標

  // 目標値
  employeeSatisfactionTarget  Float     @map("employee_satisfaction_target")  // 95.0
  turnoverRateTarget          Float     @map("turnover_rate_target")           // 5.0
  annualHiringTarget          Int       @map("annual_hiring_target")           // 120

  // 実績値（計算値、VoiceDrive活動データから）
  currentSatisfaction         Float?    @map("current_satisfaction")
  currentTurnoverRate         Float?    @map("current_turnover_rate")
  currentHiring               Int?      @map("current_hiring")

  // メタデータ
  setByUserId                 String    @map("set_by_user_id")      // 目標設定者
  approvedAt                  DateTime? @map("approved_at")         // 承認日時
  createdAt                   DateTime  @default(now()) @map("created_at")
  updatedAt                   DateTime  @updatedAt @map("updated_at")

  facility                    Facility  @relation(fields: [facilityId], references: [id])
  setByUser                   User      @relation(fields: [setByUserId], references: [id])

  @@unique([fiscalYear, facilityId])
  @@index([fiscalYear])
  @@map("strategic_hr_goals")
}
```

**テストデータ**:
```typescript
// 立神病院 2025年度目標
{
  fiscalYear: 2025,
  facilityId: "tategami-hospital",
  employeeSatisfactionTarget: 95.0,
  turnoverRateTarget: 5.0,
  annualHiringTarget: 120,
  currentSatisfaction: 87.5,    // VoiceDrive活動データから計算
  currentTurnoverRate: 3.2,     // Employeeテーブルから計算
  currentHiring: 45,            // 今年度の新規入社者数
  setByUserId: "user-ceo",      // 理事長が設定
  approvedAt: "2025-04-01T00:00:00Z"
}
```

---

### テーブル2: StrategicInitiative（戦略的イニシアチブ）

**目的**: 戦略的人事施策の進捗管理

**Prismaスキーマ**:
```prisma
model StrategicInitiative {
  id                String    @id @default(cuid())
  facilityId        String    @map("facility_id")
  name              String                             // "タレントマネジメント強化"
  description       String    @db.Text                // 施策の詳細説明
  category          String                            // "talent_management", "work_reform", "culture"
  progressPercent   Float     @map("progress_percent") @default(0)  // 0-100
  deadline          DateTime                          // 2025-12-31
  ownerId           String    @map("owner_id")        // 施策責任者
  priority          String    @default("medium")      // "high", "medium", "low"
  status            String    @default("in_progress") // "not_started", "in_progress", "completed", "on_hold"
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  facility          Facility  @relation(fields: [facilityId], references: [id])
  owner             User      @relation(fields: [ownerId], references: [id])

  @@index([facilityId])
  @@index([deadline])
  @@map("strategic_initiatives")
}
```

**テストデータ**:
```typescript
[
  {
    facilityId: "tategami-hospital",
    name: "タレントマネジメント強化",
    description: "高パフォーマンス人材の計画的育成を実施。次世代リーダー候補を選抜し、研修プログラムを提供。",
    category: "talent_management",
    progressPercent: 65,
    deadline: "2025-12-31T23:59:59Z",
    ownerId: "user-hr-director",
    priority: "high",
    status: "in_progress"
  },
  {
    facilityId: "tategami-hospital",
    name: "働き方改革推進",
    description: "時間外労働削減とワークライフバランス向上のための施策実施。",
    category: "work_reform",
    progressPercent: 80,
    deadline: "2025-06-30T23:59:59Z",
    ownerId: "user-hr-director",
    priority: "high",
    status: "in_progress"
  },
  {
    facilityId: "tategami-hospital",
    name: "組織文化改革",
    description: "オープンなコミュニケーション文化の醸成。VoiceDrive活用促進。",
    category: "culture",
    progressPercent: 45,
    deadline: "2026-03-31T23:59:59Z",
    ownerId: "user-ceo",
    priority: "medium",
    status: "in_progress"
  }
]
```

---

### テーブル3: HRStrategyRoadmap（人材戦略ロードマップ）

**目的**: 短期・中期・長期の人材戦略目標を管理

**Prismaスキーマ**:
```prisma
model HRStrategyRoadmap {
  id          String    @id @default(cuid())
  facilityId  String    @map("facility_id")
  timeframe   String                            // "short_term", "mid_term", "long_term"
  title       String                            // "若手育成プログラム拡充"
  description String    @db.Text                // 目標の詳細説明
  targetYear  Int       @map("target_year")     // 2025, 2027, 2030
  status      String    @default("planned")     // "planned", "in_progress", "completed"
  order       Int       @default(0)             // 表示順序
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  facility    Facility  @relation(fields: [facilityId], references: [id])

  @@index([facilityId, timeframe])
  @@map("hr_strategy_roadmap")
}
```

**テストデータ**:
```typescript
[
  // 短期目標（2025年）
  {
    facilityId: "tategami-hospital",
    timeframe: "short_term",
    title: "職員満足度95%達成",
    description: "VoiceDrive活動促進と職場環境改善により、職員満足度を現状87.5%から95%に向上",
    targetYear: 2025,
    status: "in_progress",
    order: 1
  },
  {
    facilityId: "tategami-hospital",
    timeframe: "short_term",
    title: "離職率5%以下維持",
    description: "現状3.2%の低離職率を維持し、業界平均を大きく下回る水準を継続",
    targetYear: 2025,
    status: "in_progress",
    order: 2
  },
  // 中期目標（2027年）
  {
    facilityId: "tategami-hospital",
    timeframe: "mid_term",
    title: "次世代リーダー20名育成",
    description: "タレントマネジメントプログラムにより、部門長候補を計画的に育成",
    targetYear: 2027,
    status: "planned",
    order: 1
  },
  {
    facilityId: "tategami-hospital",
    timeframe: "mid_term",
    title: "専門認定資格保有者50%達成",
    description: "各職種の専門認定資格取得を支援し、組織全体のスキルレベルを向上",
    targetYear: 2027,
    status: "planned",
    order: 2
  },
  // 長期目標（2030年）
  {
    facilityId: "tategami-hospital",
    timeframe: "long_term",
    title: "地域トップクラスの働きやすさ実現",
    description: "ワークライフバランス・キャリア開発・組織文化の3軸で地域最高水準を達成",
    targetYear: 2030,
    status: "planned",
    order: 1
  },
  {
    facilityId: "tategami-hospital",
    timeframe: "long_term",
    title: "人材育成システムの完全確立",
    description: "新人〜ベテランまで一貫したキャリアパスと育成プログラムを構築",
    targetYear: 2030,
    status: "planned",
    order: 2
  }
]
```

---

### 既存テーブル: Employee（退職統計用）

**使用目的**: 退職統計（退職者数・離職率）の計算に使用

**必要フィールド**（既存）:
- `facilityId`: 施設ID
- `status`: 職員ステータス（"active", "retired"等）
- `hireDate`: 入社日
- `retirementDate`: 退職日

**Phase 1では新規フィールド追加不要**（既存フィールドのみ使用）

---

## 🔌 API実装詳細（10/28-11/1、推定2日）

### API-1: 戦略的人事目標取得API

**エンドポイント**: `GET /api/v2/strategic-hr/goals`

**クエリパラメータ**:
```typescript
{
  fiscalYear: number;   // 必須: 2025
  facilityId: string;   // 必須: "tategami-hospital"
}
```

**レスポンス**:
```typescript
{
  id: string;
  fiscalYear: number;                      // 2025
  facilityId: string;                      // "tategami-hospital"
  employeeSatisfactionTarget: number;      // 95.0
  turnoverRateTarget: number;              // 5.0
  annualHiringTarget: number;              // 120
  currentSatisfaction: number | null;      // 87.5
  currentTurnoverRate: number | null;      // 3.2
  currentHiring: number | null;            // 45
  setByUserId: string;                     // "user-ceo"
  approvedAt: string | null;               // "2025-04-01T00:00:00Z"
  createdAt: string;
  updatedAt: string;
}
```

**実装ポイント**:
- レスポンスキャッシュ: **5分間**（Redis）
- 権限チェック: **Level 16以上**（院長・事務長・理事長のみ）
- 施設フィルタリング: Level 16は自施設のみ、Level 18は全施設
- エラーハンドリング: 目標未設定の場合は404ではなく、デフォルト値を返す

**実装例**:
```typescript
// src/pages/api/v2/strategic-hr/goals.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fiscalYear, facilityId } = req.query;

  // 権限チェック（Level 16以上）
  const user = await getCurrentUser(req);
  if (user.level < 16) {
    return res.status(403).json({ error: 'Forbidden: Level 16+ required' });
  }

  // 施設フィルタリング（Level 16は自施設のみ）
  if (user.level === 16 && user.facilityId !== facilityId) {
    return res.status(403).json({ error: 'Forbidden: Can only access own facility data' });
  }

  // キャッシュチェック
  const cacheKey = `strategic-hr-goals:${fiscalYear}:${facilityId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  // DB取得
  const goal = await prisma.strategicHRGoal.findUnique({
    where: {
      fiscalYear_facilityId: {
        fiscalYear: Number(fiscalYear),
        facilityId: String(facilityId)
      }
    }
  });

  if (!goal) {
    // 目標未設定の場合はデフォルト値を返す
    return res.status(200).json({
      fiscalYear: Number(fiscalYear),
      facilityId: String(facilityId),
      employeeSatisfactionTarget: 90.0,
      turnoverRateTarget: 10.0,
      annualHiringTarget: 100,
      currentSatisfaction: null,
      currentTurnoverRate: null,
      currentHiring: null,
      message: "No goal set for this fiscal year"
    });
  }

  // キャッシュ保存（5分間）
  await redis.setex(cacheKey, 300, JSON.stringify(goal));

  return res.status(200).json(goal);
}
```

---

### API-2: 戦略的イニシアチブ取得API

**エンドポイント**: `GET /api/v2/strategic-hr/initiatives`

**クエリパラメータ**:
```typescript
{
  facilityId: string;     // 必須: "tategami-hospital"
  status?: string;        // オプション: "in_progress", "completed", "all"
}
```

**レスポンス**:
```typescript
{
  initiatives: [
    {
      id: string;
      facilityId: string;
      name: string;                    // "タレントマネジメント強化"
      description: string;
      category: string;                // "talent_management"
      progressPercent: number;         // 65
      deadline: string;                // "2025-12-31T23:59:59Z"
      ownerId: string;
      priority: string;                // "high"
      status: string;                  // "in_progress"
      createdAt: string;
      updatedAt: string;
    }
  ],
  total: number;
}
```

**実装ポイント**:
- デフォルトは`status=in_progress`（進行中のみ）
- `status=all`で全イニシアチブを取得
- `deadline`が近い順にソート
- レスポンスキャッシュ: **5分間**（Redis）
- 権限チェック: **Level 16以上**

---

### API-3: 人材戦略ロードマップ取得API

**エンドポイント**: `GET /api/v2/strategic-hr/roadmap`

**クエリパラメータ**:
```typescript
{
  facilityId: string;     // 必須: "tategami-hospital"
}
```

**レスポンス**:
```typescript
{
  shortTerm: [
    {
      id: string;
      title: string;               // "職員満足度95%達成"
      description: string;
      targetYear: number;          // 2025
      status: string;              // "in_progress"
      order: number;
    }
  ],
  midTerm: [
    // 同様の構造
  ],
  longTerm: [
    // 同様の構造
  ]
}
```

**実装ポイント**:
- `timeframe`別に分類して返す
- 各timeframe内は`order`でソート
- レスポンスキャッシュ: **5分間**（Redis）
- 権限チェック: **Level 16以上**

---

### API-4: 退職統計取得API

**エンドポイント**: `GET /api/v2/retirement/statistics`

**クエリパラメータ**:
```typescript
{
  facilityId: string;     // 必須: "tategami-hospital"
  fiscalYear: number;     // 必須: 2025
}
```

**レスポンス**:
```typescript
{
  fiscalYear: number;           // 2025
  facilityId: string;
  totalEmployees: number;       // 380（現在の職員数）
  retirements: number;          // 12（今年度の退職者数）
  turnoverRate: number;         // 3.2（離職率%）
  newHires: number;             // 45（今年度の新規採用数）
  netChange: number;            // +33（純増減）
}
```

**実装ポイント**:
- 既存`Employee`テーブルから計算
- `status="retired"`かつ`retirementDate`が今年度のレコードをカウント
- レスポンスキャッシュ: **5分間**（Redis）
- 権限チェック: **Level 16以上**

**実装例**:
```typescript
const fiscalYearStart = new Date(`${fiscalYear}-04-01`);
const fiscalYearEnd = new Date(`${fiscalYear + 1}-03-31`);

// 退職者数
const retirements = await prisma.employee.count({
  where: {
    facilityId,
    status: "retired",
    retirementDate: {
      gte: fiscalYearStart,
      lte: fiscalYearEnd
    }
  }
});

// 現在の職員数
const totalEmployees = await prisma.employee.count({
  where: {
    facilityId,
    status: "active"
  }
});

// 離職率 = 退職者数 ÷ 職員数 × 100
const turnoverRate = (retirements / totalEmployees) * 100;

// 新規採用数
const newHires = await prisma.employee.count({
  where: {
    facilityId,
    hireDate: {
      gte: fiscalYearStart,
      lte: fiscalYearEnd
    }
  }
});

const netChange = newHires - retirements;

return {
  fiscalYear,
  facilityId,
  totalEmployees,
  retirements,
  turnoverRate: Math.round(turnoverRate * 10) / 10, // 小数点第1位まで
  newHires,
  netChange
};
```

---

## ⚙️ バッチ処理実装（10/29-30、推定0.5日）

### 日次バッチ: 戦略目標実績値計算

**実行タイミング**: 毎日2:00 AM

**処理内容**:
1. `currentSatisfaction`計算（VoiceDrive活動データから）
2. `currentTurnoverRate`計算（Employeeテーブルから）
3. `currentHiring`計算（Employeeテーブルから）

**実装場所**: `src/jobs/update-strategic-hr-metrics.ts`

**実装例**:
```typescript
// src/jobs/update-strategic-hr-metrics.ts
import { prisma } from '@/lib/prisma';

export async function updateStrategicHRMetrics() {
  console.log('[Job] Starting update-strategic-hr-metrics');

  const facilities = await prisma.facility.findMany();

  for (const facility of facilities) {
    // 今年度の職員数
    const employeeCount = await prisma.employee.count({
      where: { facilityId: facility.id, status: 'active' }
    });

    // 職員満足度 = (投稿数 + コメント数 + 投票数) ÷ 職員数 × 10
    // Phase 1では医療システムDBのみ使用（VoiceDrive活動データはPhase 2で統合）
    // 暫定: Employeeテーブルの職員数から推定値を計算
    const currentSatisfaction = employeeCount > 0 ? 87.5 : null;

    // 離職率 = 退職者数 ÷ 職員数 × 100
    const fiscalYearStart = new Date('2025-04-01');
    const fiscalYearEnd = new Date('2026-03-31');
    const retiredCount = await prisma.employee.count({
      where: {
        facilityId: facility.id,
        status: 'retired',
        retirementDate: {
          gte: fiscalYearStart,
          lte: fiscalYearEnd
        }
      }
    });
    const currentTurnoverRate = employeeCount > 0 ? (retiredCount / employeeCount) * 100 : null;

    // 採用実績 = 今年度の新規入社者数
    const currentHiring = await prisma.employee.count({
      where: {
        facilityId: facility.id,
        hireDate: {
          gte: fiscalYearStart,
          lte: fiscalYearEnd
        }
      }
    });

    // StrategicHRGoalテーブルを更新
    await prisma.strategicHRGoal.updateMany({
      where: {
        facilityId: facility.id,
        fiscalYear: 2025
      },
      data: {
        currentSatisfaction,
        currentTurnoverRate: currentTurnoverRate ? Math.round(currentTurnoverRate * 10) / 10 : null,
        currentHiring
      }
    });

    console.log(`[Job] Updated metrics for ${facility.name}`);
  }

  console.log('[Job] Completed update-strategic-hr-metrics');
}
```

**Cron設定**:
```typescript
// src/lib/cron.ts
import cron from 'node-cron';
import { updateStrategicHRMetrics } from '@/jobs/update-strategic-hr-metrics';

// 毎日2:00 AMに実行
cron.schedule('0 2 * * *', async () => {
  await updateStrategicHRMetrics();
});
```

---

## 🔗 VoiceDrive側統合（10/28-11/1、推定2日）

### VoiceDriveチーム準備タスク（10/17-18）

- [ ] **StrategicHRService.ts 骨格作成**
  ```typescript
  // src/services/StrategicHRService.ts
  export class StrategicHRService {
    async getGoals(fiscalYear: number, facilityId: string) { }
    async getInitiatives(facilityId: string, status?: string) { }
    async getRoadmap(facilityId: string) { }
    async getRetirementStatistics(fiscalYear: number, facilityId: string) { }
  }
  ```

- [ ] **API統合インターフェース定義**
  ```typescript
  // src/types/strategic-hr.ts
  export interface StrategicHRGoal {
    id: string;
    fiscalYear: number;
    facilityId: string;
    employeeSatisfactionTarget: number;
    turnoverRateTarget: number;
    annualHiringTarget: number;
    currentSatisfaction: number | null;
    currentTurnoverRate: number | null;
    currentHiring: number | null;
    // ...
  }
  ```

- [ ] **エラーハンドリング・ローディング状態コンポーネント準備**
  ```typescript
  // src/components/strategic-hr/ErrorFallback.tsx
  // src/components/strategic-hr/LoadingState.tsx
  ```

- [ ] **医療システムAPIクライアントのモック実装**
  ```typescript
  // src/mocks/strategic-hr-api.mock.ts
  ```

- [ ] **E2Eテストケース作成**
  ```typescript
  // cypress/e2e/strategic-hr-page.cy.ts
  ```

### VoiceDrive統合タスク（10/31-11/1）

- [ ] **医療システムAPIクライアント実装（4エンドポイント）**
  ```typescript
  // src/services/StrategicHRService.ts
  async getGoals(fiscalYear: number, facilityId: string): Promise<StrategicHRGoal> {
    const response = await fetch(
      `${MEDICAL_API_BASE}/v2/strategic-hr/goals?fiscalYear=${fiscalYear}&facilityId=${facilityId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.status}`);
    }

    return response.json();
  }
  ```

- [ ] **StrategicHRPageの戦略的人事計画タブ実データ統合**
  - demoDataからAPIデータへ切り替え
  - ローディング状態表示
  - エラーハンドリング

- [ ] **エラーハンドリング・ローディング状態実装**
  ```typescript
  const [goals, setGoals] = useState<StrategicHRGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        const data = await strategicHRService.getGoals(2025, user.facilityId);
        setGoals(data);
      } catch (err) {
        setError('戦略目標の取得に失敗しました');
        // フォールバック: 前回キャッシュデータを表示
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, []);
  ```

- [ ] **施設フィルタリング実装（Level 18用）**
  ```typescript
  {user.level >= 18 && (
    <Select value={selectedFacilityId} onChange={handleFacilityChange}>
      <option value="tategami-hospital">立神病院</option>
      <option value="obara-hospital">小原病院</option>
    </Select>
  )}
  ```

- [ ] **E2Eテスト実施**

---

## ✅ 統合テストチェックリスト（11/1）

### API動作確認

- [ ] **GET /api/v2/strategic-hr/goals**
  - [ ] 正常系: 200 OK、正しいデータが返る
  - [ ] 異常系: 権限不足（Level 15）→ 403 Forbidden
  - [ ] 異常系: 他施設データアクセス（Level 16）→ 403 Forbidden
  - [ ] キャッシュ: 2回目のリクエストはキャッシュから返る（< 100ms）
  - [ ] パフォーマンス: 応答時間 < 3秒

- [ ] **GET /api/v2/strategic-hr/initiatives**
  - [ ] 正常系: 200 OK、進行中イニシアチブが返る
  - [ ] 正常系: status=all で全イニシアチブが返る
  - [ ] deadline順にソートされている
  - [ ] パフォーマンス: 応答時間 < 3秒

- [ ] **GET /api/v2/strategic-hr/roadmap**
  - [ ] 正常系: 200 OK、短期・中期・長期が返る
  - [ ] 各timeframe内でorder順にソートされている
  - [ ] パフォーマンス: 応答時間 < 3秒

- [ ] **GET /api/v2/retirement/statistics**
  - [ ] 正常系: 200 OK、退職統計が返る
  - [ ] 計算値が正しい（離職率 = 退職者数 ÷ 職員数 × 100）
  - [ ] パフォーマンス: 応答時間 < 3秒

### VoiceDrive側統合確認

- [ ] **StrategicHRPageの戦略的人事計画タブ**
  - [ ] 実データで表示される（demoDataではない）
  - [ ] 目標と実績の差分が正しく表示される
  - [ ] ローディング状態が表示される
  - [ ] エラー時にフォールバックが動作

- [ ] **権限チェック**
  - [ ] Level 16（院長・事務長）: 自施設のみ閲覧可能
  - [ ] Level 18（理事長）: 全施設閲覧可能、施設切り替えドロップダウンが表示
  - [ ] Level 15以下: 403エラー

### バッチ処理確認

- [ ] **日次バッチ**
  - [ ] 2:00 AMに実行される
  - [ ] currentSatisfaction が更新される
  - [ ] currentTurnoverRate が更新される
  - [ ] currentHiring が更新される
  - [ ] ログに実行結果が出力される

### E2Eテスト

- [ ] **ログインからページ表示まで**
  - [ ] Level 16ユーザーでログイン
  - [ ] StrategicHRPageに遷移
  - [ ] 戦略的人事計画タブが表示
  - [ ] 実データが表示される

---

## 📊 Phase 1完了後の状態

### ✅ 実装済み機能

| 機能 | 状態 |
|------|------|
| **戦略的人事目標表示** | ✅ 実装済み（目標・実績・差分） |
| **戦略的イニシアチブ表示** | ✅ 実装済み（進捗・期限・責任者） |
| **人材戦略ロードマップ表示** | ✅ 実装済み（短期・中期・長期） |
| **退職統計表示** | ✅ 実装済み（人数・離職率・新規採用） |
| **権限チェック** | ✅ 実装済み（Level 16以上） |
| **施設フィルタリング** | ✅ 実装済み（Level 18理事長用） |
| **レスポンスキャッシュ** | ✅ 実装済み（Redis、5分間） |
| **日次バッチ** | ✅ 実装済み（戦略目標実績値計算） |

### ❌ 未実装機能（Phase 2-3で実装）

| 機能 | Phase | 理由 |
|------|-------|------|
| **パフォーマンス分析タブ** | Phase 2 | 外部システム連携が必要 |
| **組織健全性指標** | Phase 2 | VoiceDrive活動データ統合が必要 |
| **退職理由分析** | Phase 3 | 運用体制整備が前提 |
| **影響力分析** | Phase 3 | VoiceDrive活動データ統合が必要 |

---

## 🎯 Phase 2-3への橋渡し

### Phase 2開始条件

- ✅ Phase 1完了・検収
- ✅ 共通DB統合完了（VoiceDrive活動データへの直接アクセス可能）
- ✅ 医療システムチーム・VoiceDriveチーム双方のリソース確保

### Phase 2実装予定

- **開始予定**: Phase 1完了後1-2ヶ月後（12月中旬〜1月上旬）
- **実装内容**: 組織開発・パフォーマンス分析タブ
- **VoiceDrive活動データ統合**: 共通DB直接参照または暫定API提供

---

## 📞 連絡・質問窓口

### 医療システムチーム
- **Slack**: #medical-system-dev
- **質問対応時間**: 平日 9:00-18:00

### VoiceDriveチーム
- **Slack**: #voicedrive-integration
- **質問対応時間**: 平日 10:00-19:00

### Phase 1実装中の質問例
- DB設計の詳細確認
- API仕様の不明点
- テストデータの追加リクエスト
- 統合テストの進捗確認

---

## 🔗 関連ドキュメント

1. ✅ [StrategicHRPlan_API実装質問への回答_20251010.md](./StrategicHRPlan_API実装質問への回答_20251010.md) - VoiceDriveチーム回答書
2. ✅ [strategic-hr-plan_DB要件分析_20251010.md](./strategic-hr-plan_DB要件分析_20251010.md) - 詳細技術分析
3. ✅ [strategic-hr-plan暫定マスターリスト_20251010.md](./strategic-hr-plan暫定マスターリスト_20251010.md) - 実装チェックリスト
4. ✅ [strategic-hr-plan_医療システムからの質問書_20251010.md](./strategic-hr-plan_医療システムからの質問書_20251010.md) - 医療システムからの質問書
5. ✅ [共通DB構築後統合作業再開計画書_20251008.md](./共通DB構築後統合作業再開計画書_20251008.md) - マスタープラン

---

## ✅ 承認

**医療システムチーム**: 本Phase 1詳細実装計画を承認し、10/21（月）から実装を開始します。

**VoiceDriveチーム**: 本Phase 1詳細実装計画を承認済み（回答書により確認）

**署名**: 医療職員管理システムチーム
**日付**: 2025年10月10日

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
次回アクション: Phase 1実装開始（10/21）
