# BoardDecisionFollow ページ DB要件分析

**作成日**: 2025年10月13日
**ページURL**: https://voicedrive-v100.vercel.app/board-decision-follow
**対象ユーザー**: Level 18（理事長・法人事務局長）

---

## 1. ページ概要

### 1.1 機能概要
理事会で決定された事項の進捗状況を一覧表示し、各決定事項のマイルストーン進捗と施設別実施状況を追跡・管理するページ。

### 1.2 主要機能
- 理事会決定事項一覧の表示
- 進捗状況のビジュアル表示（プログレスバー、ステータスバッジ）
- カテゴリー別フィルタリング（全て、人事制度、経営方針、施設整備、システム導入、その他）
- ステータス別フィルタリング（全て、完了、順調、要注意、遅延）
- マイルストーンの進捗管理
- 施設別実施状況の確認
- 詳細情報の展開・折りたたみ表示

### 1.3 権限レベル
- **Level 18**: 理事長・法人事務局長（全決定事項へのアクセス）

---

## 2. 現在の実装状況

### 2.1 フロントエンド実装
**ファイル**: [src/pages/BoardDecisionFollowPage.tsx](../../src/pages/BoardDecisionFollowPage.tsx)

**実装状況**: ✅ 完全実装済み（552行）

**使用中のデータ構造**:
```typescript
interface BoardDecision {
  id: string;
  meetingDate: string;                    // 理事会開催日
  title: string;                          // 決定事項タイトル
  category: string;                       // カテゴリー
  description: string;                    // 詳細説明
  decision: string;                       // 決定内容
  implementationDeadline: string;         // 実施期限
  responsibleDept: string;                // 責任部署
  affectedFacilities: string[];           // 対象施設
  status: 'completed' | 'on_track' | 'at_risk' | 'delayed';
  progress: number;                       // 進捗率 (0-100)
  milestones: Milestone[];
  lastUpdate: string;                     // 最終更新日時
}

interface Milestone {
  id: string;
  title: string;
  deadline: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
  assignee: string;
}

interface FacilityImplementation {
  facilityId: string;
  facilityName: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number;
  note?: string;
}
```

**現在のデータソース**: ハードコードされたモックデータ（47-275行目）
- サンプル決定事項: 5件
- サンプル施設実施状況: 10施設分

### 2.2 データベース実装
**ファイル**: [prisma/schema.prisma](../../prisma/schema.prisma:1693-1761)

**実装状況**: ✅ 完全実装済み

#### テーブル1: BoardDecision（理事会決定事項）
```prisma
model BoardDecision {
  id                      String    @id @default(cuid())
  boardMeetingId          String    // 理事会会議ID
  meetingDate             DateTime  // 理事会開催日
  title                   String    // 決定事項タイトル
  category                String    // カテゴリー
  description             String    // 詳細説明
  decision                String    // 決定内容
  implementationDeadline  DateTime  // 実施期限
  responsibleDept         String    // 責任部署名
  responsibleDeptId       String?   // 責任部署ID
  affectedFacilities      Json      // 対象施設（JSON配列）
  status                  String    @default("on_track")  // ステータス
  progress                Int       @default(0)           // 進捗率 (0-100)
  lastUpdate              DateTime  @default(now()) @updatedAt
  createdAt               DateTime  @default(now())

  // リレーション
  milestones              BoardDecisionMilestone[]
  facilityImplementations BoardDecisionFacilityImplementation[]

  @@index([boardMeetingId])
  @@index([status])
  @@index([implementationDeadline])
  @@index([category])
}
```

#### テーブル2: BoardDecisionMilestone（マイルストーン）
```prisma
model BoardDecisionMilestone {
  id              String    @id @default(cuid())
  boardDecisionId String    // 親決定事項ID
  title           String    // マイルストーンタイトル
  deadline        DateTime  // 期限
  status          String    @default("pending")  // ステータス
  assignee        String    // 担当者名
  assigneeId      String?   // 担当者ID
  sortOrder       Int       @default(0)          // 表示順序
  completedAt     DateTime? // 完了日時
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // リレーション
  boardDecision   BoardDecision @relation(fields: [boardDecisionId], references: [id], onDelete: Cascade)

  @@index([boardDecisionId])
  @@index([status])
  @@index([deadline])
}
```

#### テーブル3: BoardDecisionFacilityImplementation（施設別実施状況）
```prisma
model BoardDecisionFacilityImplementation {
  id              String    @id @default(cuid())
  boardDecisionId String    // 親決定事項ID
  facilityId      String    // 施設ID
  facilityName    String    // 施設名（キャッシュ）
  status          String    @default("not_started")  // ステータス
  progress        Int       @default(0)              // 進捗率 (0-100)
  note            String?   // 備考
  lastUpdate      DateTime  @default(now()) @updatedAt
  createdAt       DateTime  @default(now())

  // リレーション
  boardDecision   BoardDecision @relation(fields: [boardDecisionId], references: [id], onDelete: Cascade)

  @@unique([boardDecisionId, facilityId])
  @@index([boardDecisionId])
  @@index([facilityId])
  @@index([status])
}
```

### 2.3 API実装
**実装状況**: ❌ 未実装

---

## 3. データ管理境界の明確化

### 3.1 医療職員管理システムが管理するデータ
- ❌ なし（理事会決定事項は法人レベルのVoiceDrive固有データ）

### 3.2 VoiceDriveが管理するデータ
- ✅ 理事会決定事項（BoardDecision）
- ✅ マイルストーン（BoardDecisionMilestone）
- ✅ 施設別実施状況（BoardDecisionFacilityImplementation）
- ✅ 進捗率の自動計算ロジック
- ✅ ステータスの自動更新ロジック

### 3.3 医療職員管理システムから取得するマスターデータ
- 施設マスター（facilityId, facilityName）
- 部署マスター（departmentId, departmentName）
- ユーザーマスター（userId, userName）- 担当者情報用

**取得方法**: MCPサーバー経由でキャッシュ済みデータを参照

---

## 4. 必要なAPI一覧

### 4.1 理事会決定事項一覧取得API
**エンドポイント**: `GET /api/board-decisions`

**クエリパラメータ**:
```typescript
{
  category?: string;        // カテゴリーフィルター
  status?: string;          // ステータスフィルター
  limit?: number;           // 取得件数
  offset?: number;          // オフセット
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    decisions: BoardDecision[],
    pagination: {
      total: number,
      limit: number,
      offset: number,
      hasMore: boolean
    }
  }
}
```

**実装ファイル**: `src/api/routes/board-decisions.routes.ts` (未作成)

### 4.2 施設別実施状況一覧取得API
**エンドポイント**: `GET /api/board-decisions/:decisionId/facility-implementations`

**レスポンス**:
```typescript
{
  success: true,
  data: {
    implementations: FacilityImplementation[]
  }
}
```

**実装ファイル**: `src/api/routes/board-decisions.routes.ts` (未作成)

### 4.3 マイルストーン更新API
**エンドポイント**: `PUT /api/board-decision-milestones/:milestoneId`

**リクエストボディ**:
```typescript
{
  status: 'completed' | 'in_progress' | 'pending' | 'delayed'
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    milestone: BoardDecisionMilestone,
    parentDecision: {
      id: string,
      progress: number,
      status: string
    }
  }
}
```

**自動処理**:
- マイルストーンのステータス更新
- 親決定事項の進捗率を再計算（完了マイルストーン数 ÷ 総マイルストーン数 × 100）
- 親決定事項のステータスを自動更新

**実装ファイル**: `src/api/routes/board-decision-milestones.routes.ts` (未作成)

### 4.4 施設別実施状況更新API
**エンドポイント**: `PUT /api/board-decision-facility-implementations/:implementationId`

**リクエストボディ**:
```typescript
{
  status: 'completed' | 'in_progress' | 'not_started',
  progress: number,    // 0-100
  note?: string
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    implementation: BoardDecisionFacilityImplementation,
    parentDecision: {
      id: string,
      progress: number,
      status: string
    }
  }
}
```

**自動処理**:
- 施設実施状況の更新
- 親決定事項の進捗率を再計算（全施設の平均進捗率）
- 親決定事項のステータスを自動更新

**実装ファイル**: `src/api/routes/board-decision-facility-implementations.routes.ts` (未作成)

### 4.5 理事会決定事項作成API
**エンドポイント**: `POST /api/board-decisions`

**リクエストボディ**:
```typescript
{
  boardMeetingId: string,
  meetingDate: string,           // ISO 8601
  title: string,
  category: string,
  description: string,
  decision: string,
  implementationDeadline: string, // ISO 8601
  responsibleDept: string,
  responsibleDeptId?: string,
  affectedFacilities: string[],
  milestones: {
    title: string,
    deadline: string,            // ISO 8601
    assignee: string,
    assigneeId?: string,
    sortOrder: number
  }[]
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    decision: BoardDecision
  }
}
```

**自動処理**:
- 決定事項レコード作成
- マイルストーンレコードの一括作成
- 対象施設分の実施状況レコードを自動生成（初期ステータス: not_started）

**実装ファイル**: `src/api/routes/board-decisions.routes.ts` (未作成)

---

## 5. 進捗率とステータスの自動計算ロジック

### 5.1 進捗率の計算方法

#### パターンA: マイルストーンベースの進捗率
```typescript
const calculateProgressByMilestones = (milestones: Milestone[]): number => {
  if (milestones.length === 0) return 0;

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  return Math.round((completedCount / milestones.length) * 100);
};
```

#### パターンB: 施設実施状況ベースの進捗率
```typescript
const calculateProgressByFacilities = (implementations: FacilityImplementation[]): number => {
  if (implementations.length === 0) return 0;

  const totalProgress = implementations.reduce((sum, impl) => sum + impl.progress, 0);
  return Math.round(totalProgress / implementations.length);
};
```

#### 採用方針
- **両方を計算**し、より低い値を採用（悲観的計算）
- ただし、施設実施状況が0件の場合はマイルストーンベースのみ使用

### 5.2 ステータスの自動決定ロジック

```typescript
const determineStatus = (
  progress: number,
  deadline: Date,
  milestones: Milestone[]
): 'completed' | 'on_track' | 'at_risk' | 'delayed' => {
  const now = new Date();
  const daysUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // 完了判定
  if (progress === 100) {
    return 'completed';
  }

  // 期限超過判定
  if (daysUntilDeadline < 0) {
    return 'delayed';
  }

  // 遅延マイルストーンの存在チェック
  const hasDelayedMilestone = milestones.some(m => m.status === 'delayed');
  if (hasDelayedMilestone) {
    return 'at_risk';
  }

  // 進捗度と残り日数から判定
  const expectedProgress = Math.max(0, 100 - (daysUntilDeadline / 30) * 100);

  if (progress < expectedProgress - 20) {
    return 'at_risk';
  }

  return 'on_track';
};
```

---

## 6. 不足している項目の特定

### 6.1 データベーステーブル
✅ **不足なし** - 必要な3テーブルすべて実装済み
- BoardDecision ✅
- BoardDecisionMilestone ✅
- BoardDecisionFacilityImplementation ✅

### 6.2 フィールド
✅ **不足なし** - 必要なフィールドすべて実装済み

### 6.3 API
❌ **5つのAPIすべてが未実装**
1. GET /api/board-decisions
2. GET /api/board-decisions/:decisionId/facility-implementations
3. PUT /api/board-decision-milestones/:milestoneId
4. PUT /api/board-decision-facility-implementations/:implementationId
5. POST /api/board-decisions

### 6.4 サービス層
❌ **未実装**
- `src/services/boardDecisionService.ts`
- 進捗率計算ロジック
- ステータス自動更新ロジック
- マイルストーン更新時の親レコード更新処理
- 施設実施状況更新時の親レコード更新処理

---

## 7. 実装計画

### Phase 1: サービス層実装（1-2日）
**ファイル**: `src/services/boardDecisionService.ts`

**実装内容**:
```typescript
// 進捗率計算
export function calculateDecisionProgress(
  milestones: BoardDecisionMilestone[],
  facilityImplementations: BoardDecisionFacilityImplementation[]
): number;

// ステータス自動決定
export function determineDecisionStatus(
  progress: number,
  deadline: Date,
  milestones: BoardDecisionMilestone[]
): 'completed' | 'on_track' | 'at_risk' | 'delayed';

// マイルストーン更新と親レコード更新
export async function updateMilestoneAndParent(
  milestoneId: string,
  status: string
): Promise<{ milestone: BoardDecisionMilestone; parentDecision: BoardDecision }>;

// 施設実施状況更新と親レコード更新
export async function updateFacilityImplementationAndParent(
  implementationId: string,
  updateData: { status?: string; progress?: number; note?: string }
): Promise<{ implementation: BoardDecisionFacilityImplementation; parentDecision: BoardDecision }>;
```

### Phase 2: API実装（2-3日）

#### ファイル1: `src/api/routes/board-decisions.routes.ts`
```typescript
import { Router } from 'express';

const router = Router();

// GET /api/board-decisions
router.get('/', async (req, res) => {
  // 理事会決定事項一覧取得
});

// GET /api/board-decisions/:decisionId/facility-implementations
router.get('/:decisionId/facility-implementations', async (req, res) => {
  // 施設別実施状況一覧取得
});

// POST /api/board-decisions
router.post('/', async (req, res) => {
  // 理事会決定事項作成
});

export default router;
```

#### ファイル2: `src/api/routes/board-decision-milestones.routes.ts`
```typescript
import { Router } from 'express';
import { updateMilestoneAndParent } from '../../services/boardDecisionService';

const router = Router();

// PUT /api/board-decision-milestones/:milestoneId
router.put('/:milestoneId', async (req, res) => {
  const { milestoneId } = req.params;
  const { status } = req.body;

  const result = await updateMilestoneAndParent(milestoneId, status);

  res.json({ success: true, data: result });
});

export default router;
```

#### ファイル3: `src/api/routes/board-decision-facility-implementations.routes.ts`
```typescript
import { Router } from 'express';
import { updateFacilityImplementationAndParent } from '../../services/boardDecisionService';

const router = Router();

// PUT /api/board-decision-facility-implementations/:implementationId
router.put('/:implementationId', async (req, res) => {
  const { implementationId } = req.params;
  const { status, progress, note } = req.body;

  const result = await updateFacilityImplementationAndParent(implementationId, {
    status,
    progress,
    note
  });

  res.json({ success: true, data: result });
});

export default router;
```

### Phase 3: フロントエンド統合（1-2日）
**ファイル**: `src/pages/BoardDecisionFollowPage.tsx`

**変更内容**:
- ハードコードされたモックデータを削除
- API呼び出しに置き換え
- ローディング状態の追加
- エラーハンドリングの追加

**実装例**:
```typescript
const [decisions, setDecisions] = useState<BoardDecision[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/board-decisions');
      const data = await response.json();

      if (data.success) {
        setDecisions(data.data.decisions);
      } else {
        setError('データの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  fetchDecisions();
}, []);
```

### Phase 4: テスト実装（1-2日）
**ファイル**: `src/tests/board-decision-api.test.ts`

**テストケース**:
1. 理事会決定事項一覧取得
2. 施設別実施状況取得
3. マイルストーン更新と進捗率自動計算
4. 施設実施状況更新と進捗率自動計算
5. ステータス自動更新ロジック
6. 新規決定事項作成と関連レコード生成

---

## 8. スキーマ更新の必要性

### 結論: ❌ **スキーマ更新不要**

**理由**:
- 必要な3テーブル（BoardDecision, BoardDecisionMilestone, BoardDecisionFacilityImplementation）がすべて実装済み
- 必要なフィールドがすべて定義済み
- インデックスが適切に設定済み
- リレーションが正しく定義済み

---

## 9. まとめ

### 9.1 実装完了項目
✅ データベーススキーマ（3テーブル、すべてのフィールド）
✅ フロントエンドUI（完全実装、モックデータで動作確認済み）

### 9.2 実装必要項目
❌ サービス層（進捗率計算、ステータス自動更新ロジック）
❌ API層（5つのエンドポイント）
❌ フロントエンド統合（モックデータからAPI呼び出しへの置き換え）
❌ テストコード

### 9.3 推定実装工数
- **サービス層**: 1-2日
- **API層**: 2-3日
- **フロントエンド統合**: 1-2日
- **テスト実装**: 1-2日
- **合計**: 5-9日

### 9.4 優先度
**高**: 理事長・法人事務局長レベルの重要機能であり、法人全体の意思決定の進捗を可視化するため、早期の実装が推奨される。

---

## 10. 付録

### 10.1 カテゴリーマスター（想定値）
- 人事制度
- 経営方針
- 施設整備
- システム導入
- その他

### 10.2 ステータス定義
- `completed`: 完了（progress = 100%）
- `on_track`: 順調（期限内、進捗良好）
- `at_risk`: 要注意（遅延マイルストーンあり、または進捗遅れ）
- `delayed`: 遅延（期限超過）

### 10.3 施設実施状況ステータス
- `completed`: 完了
- `in_progress`: 実施中
- `not_started`: 未着手

### 10.4 マイルストーンステータス
- `completed`: 完了
- `in_progress`: 進行中
- `pending`: 未着手
- `delayed`: 遅延

---

**文書作成者**: Claude (VoiceDrive開発AI)
**最終更新**: 2025年10月13日
