# Phase 6 設計書: 不採用救済フロー（Rejection Rescue Flow）

**作成日**: 2025年10月19日
**前提**: Phase 1-5完了、議題モードシステム調査完了

---

## 📋 目次
1. [現状分析](#現状分析)
2. [Phase 6の目的](#phase-6の目的)
3. [既存システムとの関係](#既存システムとの関係)
4. [Phase 6の実装方針](#phase-6の実装方針)
5. [実装詳細](#実装詳細)
6. [API設計](#api設計)
7. [UI設計](#ui設計)
8. [テスト計画](#テスト計画)

---

## 🔍 現状分析

### 既存の救済機能（AgendaDecisionService）

調査の結果、**救済機能は既に実装されている**ことが判明しました：

#### 実装済みの救済パターン

**パターン1: Level 7（師長）による救済**
```typescript
// Level 8（副看護部長）が却下 → Level 7（師長）が救済
decisionType: 'rescue_as_dept_agenda'
agendaStatus: 'pending_rescue_by_manager' → 'approved_as_dept_agenda'
agendaRescueLevel: 7
```

**パターン2: Level 11（事務長）による救済**
```typescript
// Level 18（法人統括事務局長）が却下 → Level 11（事務長）が救済
decisionType: 'rescue_as_facility_agenda'
agendaStatus: 'pending_rescue_by_deputy_director' → 'approved_for_committee'
agendaRescueLevel: 11
```

### 既存システムの制約

1. **救済は却下後のみ発動** - 上位レベルの管理職が明示的に却下した場合のみ
2. **スコアベースの自動救済はない** - マイナススコアによる自動検知機能なし
3. **救済対象は限定的** - Level 8却下 or Level 18却下の2パターンのみ
4. **UI未実装** - APIは存在するが、専用UIがない

### Phase 6で補完すべき機能

既存の救済機能は「却下ベース」ですが、Phase 6では以下を追加します：

| 既存機能 | Phase 6で追加 |
|---------|-------------|
| 却下後に救済可能 | **マイナススコアで自動検知** |
| 2パターンのみ（L8/L18却下） | **全レベルでスコアベース救済** |
| APIのみ実装 | **専用UI・ダッシュボード** |
| 手動通知 | **自動通知・アラート** |

---

## 🎯 Phase 6の目的

### 主要目標

1. **スコアベース自動検知**: マイナススコア（-30点以下）を自動で検知
2. **救済候補ダッシュボード**: 管理職が救済すべき提案を一覧表示
3. **多様な救済オプション**: 昇格・改善依頼・アーカイブの3択
4. **透明性の確保**: 救済理由・履歴を記録・公開

### 対象ユーザー

- **Level 7（師長）**: 部署レベルの救済判断
- **Level 8（副看護部長）**: 施設レベルの救済判断
- **Level 11（事務長）**: 法人レベルの救済判断

### 解決する課題

- ❌ **現状**: 良い提案でもマイナス投票で埋もれる
- ✅ **改善後**: スコアが低くても価値ある提案を救済

---

## 🔗 既存システムとの関係

### Phase 5（昇格）との違い

| 項目 | Phase 5: 昇格 | Phase 6: 救済 |
|-----|------------|------------|
| トリガー | **高スコア**（30, 50, 100点到達） | **低スコア**（-30点以下） |
| 目的 | ポジティブな押し上げ | ネガティブからの復活 |
| 対象 | スコアが閾値に達した提案 | スコアがマイナスの提案 |
| API | `POST /api/agenda/:postId/escalate` | `POST /api/agenda/:postId/rescue` |

### AgendaDecisionServiceとの統合

Phase 6は既存の`AgendaDecisionService`を**拡張**します：

```typescript
// 既存の救済メソッド（却下ベース）
handleRescueAsDeptAgenda()      // Level 7救済
handleRescueAsFacilityAgenda()  // Level 11救済

// Phase 6で追加する救済メソッド（スコアベース）
handleRescueFromNegativeScore() // 新規: マイナススコアからの救済
```

### データベーススキーマ

**既存フィールドを活用**:
```prisma
model Post {
  agendaRescueLevel      Int?      // 救済レベル（7, 11）
  agendaStatus           String?   // ステータス
  agendaScore            Int?      // スコア
  agendaLevel            String?   // レベル
}
```

**Phase 6で追加するフィールド（検討中）**:
```prisma
model Post {
  agendaRescueReason     String?   // 救済理由（詳細）
  agendaRescueAt         DateTime? // 救済日時
  agendaRescueType       String?   // 'score_based' | 'rejection_based'
}
```

---

## 📐 Phase 6の実装方針

### アプローチ

**最小侵襲・最大活用**:
- 既存のAgendaDecisionServiceを拡張
- 既存のagendaRescueLevelフィールドを再利用
- 新規テーブル追加は最小限に

### 実装の3ステップ

#### Step 1: スコア監視・検知システム
- マイナススコア（-30点以下）を自動検知
- 管理職に通知を送信
- 救済候補リストに追加

#### Step 2: 救済候補ダッシュボード（UI）
- ProposalManagementPageに「救済候補」タブを追加
- 救済すべき提案を一覧表示
- 各提案の詳細（スコア、反対理由、投票状況）を表示

#### Step 3: 救済実行API
- 既存のAgendaDecisionServiceを拡張
- 3つの救済オプション実装:
  1. 上位レベルに救済昇格
  2. 改善提案として差し戻し
  3. アーカイブ（確定不採用）

---

## 🛠️ 実装詳細

### 1. マイナススコア検知システム

#### 1.1 検知ロジック

**ファイル**: `src/services/AgendaRescueDetectionService.ts` (新規)

```typescript
export class AgendaRescueDetectionService {
  private readonly RESCUE_THRESHOLD = -30; // マイナス30点で救済候補

  /**
   * マイナススコアの投稿を検知
   */
  async detectRescueCandidates(): Promise<Post[]> {
    const candidates = await prisma.post.findMany({
      where: {
        type: 'proposal',
        status: 'active',
        agendaScore: {
          lte: this.RESCUE_THRESHOLD,
        },
        agendaRescueLevel: null, // まだ救済されていない
      },
      include: {
        author: true,
        votes: true,
      },
    });

    return candidates;
  }

  /**
   * 救済候補を管理職に通知
   */
  async notifyRescueCandidates(candidates: Post[]): Promise<void> {
    for (const post of candidates) {
      const managers = await this.getResponsibleManagers(post);

      for (const manager of managers) {
        await notificationService.sendSimpleNotification({
          userId: manager.id,
          title: '🆘 救済候補があります',
          message: `スコアがマイナス${Math.abs(post.agendaScore || 0)}点になった提案があります。救済判断をお願いします。`,
          urgency: 'high',
          postId: post.id,
          actionUrl: `/proposal-management/rescue`,
          actionRequired: true,
        });
      }
    }
  }

  /**
   * 責任者を取得（レベルに応じて）
   */
  private async getResponsibleManagers(post: Post): Promise<User[]> {
    const currentLevel = agendaLevelEngine.getAgendaLevel(post.agendaScore || 0);

    // レベルに応じた責任者を返す
    switch (currentLevel) {
      case 'PENDING':
      case 'DEPT_REVIEW':
      case 'DEPT_AGENDA':
        return await this.getManagersByLevel(7); // 師長

      case 'FACILITY_AGENDA':
        return await this.getManagersByLevel(8); // 副看護部長

      case 'CORP_REVIEW':
      case 'CORP_AGENDA':
        return await this.getManagersByLevel(11); // 事務長

      default:
        return [];
    }
  }
}
```

#### 1.2 定期実行（Cron Job）

**ファイル**: `src/jobs/rescueDetectionJob.ts` (新規)

```typescript
import cron from 'node-cron';

/**
 * 1日1回、マイナススコアの提案を検知
 * 毎朝9時に実行
 */
export function startRescueDetectionJob() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[RescueDetection] 救済候補検知ジョブ開始...');

    const service = new AgendaRescueDetectionService();
    const candidates = await service.detectRescueCandidates();

    console.log(`[RescueDetection] 救済候補: ${candidates.length}件`);

    if (candidates.length > 0) {
      await service.notifyRescueCandidates(candidates);
    }

    console.log('[RescueDetection] 救済候補検知ジョブ完了');
  });
}
```

---

### 2. 救済候補ダッシュボード（UI）

#### 2.1 ProposalManagementPageに「救済候補」タブを追加

**ファイル**: `src/pages/ProposalManagementPage.tsx` (修正)

```typescript
const [viewMode, setViewMode] = useState<'analysis' | 'documents' | 'rescue'>('analysis');

// 救済候補を取得
const rescueCandidates = posts.filter(post => {
  const postData = getPostData(post);
  return postData.currentScore <= -30 && !post.agendaRescueLevel;
});
```

**タブUI**:
```tsx
<div className="flex gap-4 mb-6">
  <button
    onClick={() => setViewMode('analysis')}
    className={viewMode === 'analysis' ? 'tab-active' : 'tab-inactive'}
  >
    📊 データ分析モード
  </button>

  <button
    onClick={() => setViewMode('documents')}
    className={viewMode === 'documents' ? 'tab-active' : 'tab-inactive'}
  >
    📄 議題提案書モード
  </button>

  <button
    onClick={() => setViewMode('rescue')}
    className={viewMode === 'rescue' ? 'tab-active' : 'tab-inactive'}
  >
    🆘 救済候補 ({rescueCandidates.length})
  </button>
</div>

{viewMode === 'rescue' && (
  <RescueCandidateList
    candidates={rescueCandidates}
    onRescue={handleRescue}
  />
)}
```

#### 2.2 救済候補カードコンポーネント

**ファイル**: `src/components/voting/RescueCandidateCard.tsx` (新規)

```typescript
export function RescueCandidateCard({
  post,
  onRescue,
}: RescueCandidateCardProps) {
  const postData = getPostData(post);

  return (
    <div className="rescue-card border-l-4 border-red-500 bg-red-50 p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{post.content.substring(0, 50)}...</h3>
          <p className="text-sm text-gray-600">
            投稿者: {post.author.name} | 部署: {post.author.department}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">
            {postData.currentScore}点
          </div>
          <div className="text-xs text-gray-500">
            {postData.agendaLevel}
          </div>
        </div>
      </div>

      {/* 投票状況 */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">投票状況</h4>
        <div className="grid grid-cols-5 gap-2 text-sm">
          <div className="text-center">
            <div className="text-green-600 font-bold">{post.stronglySupportCount}</div>
            <div className="text-xs">強く賛成</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">{post.supportCount}</div>
            <div className="text-xs">賛成</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 font-bold">{post.neutralCount}</div>
            <div className="text-xs">中立</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold">{post.opposeCount}</div>
            <div className="text-xs">反対</div>
          </div>
          <div className="text-center">
            <div className="text-red-600 font-bold">{post.stronglyOpposeCount}</div>
            <div className="text-xs">強く反対</div>
          </div>
        </div>
      </div>

      {/* 救済オプション */}
      <div className="flex gap-2">
        <button
          onClick={() => onRescue(post.id, 'escalate')}
          className="flex-1 btn btn-success"
        >
          ↗️ 上位レベルに昇格
        </button>

        <button
          onClick={() => onRescue(post.id, 'revise')}
          className="flex-1 btn btn-warning"
        >
          📝 改善依頼
        </button>

        <button
          onClick={() => onRescue(post.id, 'archive')}
          className="flex-1 btn btn-error"
        >
          📦 アーカイブ
        </button>
      </div>
    </div>
  );
}
```

---

### 3. 救済実行API

#### 3.1 AgendaRescueServiceの拡張

**ファイル**: `src/services/AgendaRescueService.ts` (新規)

```typescript
export type RescueAction = 'escalate' | 'revise' | 'archive';

export interface RescueRequest {
  postId: string;
  action: RescueAction;
  rescuerId: string;
  reason: string;
  targetLevel?: AgendaLevel; // escalateの場合のみ
}

export class AgendaRescueService {
  /**
   * 救済処理を実行
   */
  async executeRescue(request: RescueRequest): Promise<RescueResult> {
    const { postId, action, rescuerId, reason, targetLevel } = request;

    // 投稿とユーザー取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true, votes: true },
    });

    if (!post) {
      throw new Error(`投稿が見つかりません: ${postId}`);
    }

    const rescuer = await prisma.user.findUnique({
      where: { id: rescuerId },
    });

    if (!rescuer) {
      throw new Error(`救済者が見つかりません: ${rescuerId}`);
    }

    // 権限チェック
    this.validateRescuePermission(rescuer, post);

    // アクションに応じて処理
    switch (action) {
      case 'escalate':
        return await this.rescueByEscalation(post, rescuer, reason, targetLevel!);

      case 'revise':
        return await this.rescueByRevision(post, rescuer, reason);

      case 'archive':
        return await this.rescueByArchive(post, rescuer, reason);

      default:
        throw new Error(`無効な救済アクション: ${action}`);
    }
  }

  /**
   * 上位レベルに昇格させる救済
   */
  private async rescueByEscalation(
    post: any,
    rescuer: any,
    reason: string,
    targetLevel: AgendaLevel
  ): Promise<RescueResult> {
    // Phase 5の昇格サービスを再利用
    const escalationService = new AgendaEscalationService();

    const result = await escalationService.escalateAgenda({
      postId: post.id,
      targetLevel,
      deciderId: rescuer.id,
      reason: `【救済昇格】${reason}`,
    });

    // 救済レベルを記録
    await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaRescueLevel: rescuer.permissionLevel,
        agendaRescueReason: reason,
        agendaRescueAt: new Date(),
        agendaRescueType: 'score_based_escalation',
      },
    });

    // 通知送信
    await this.sendRescueNotification(post, rescuer, 'escalate', targetLevel);

    return {
      success: true,
      action: 'escalate',
      previousScore: post.agendaScore || 0,
      newLevel: targetLevel,
      message: `救済昇格が完了しました（${targetLevel}）`,
    };
  }

  /**
   * 改善依頼として差し戻す救済
   */
  private async rescueByRevision(
    post: any,
    rescuer: any,
    reason: string
  ): Promise<RescueResult> {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        agendaStatus: 'pending_revision',
        agendaRescueLevel: rescuer.permissionLevel,
        agendaRescueReason: reason,
        agendaRescueAt: new Date(),
        agendaRescueType: 'revision_request',
      },
    });

    // 投稿者に改善依頼通知
    await notificationService.sendSimpleNotification({
      userId: post.authorId,
      title: '📝 改善依頼（救済）',
      message: `あなたの提案が改善依頼として救済されました。\n\n改善理由: ${reason}\n\n修正後、再度投票が開始されます。`,
      urgency: 'normal',
      postId: post.id,
      actionUrl: `/posts/${post.id}/edit`,
      actionRequired: true,
    });

    return {
      success: true,
      action: 'revise',
      message: '改善依頼として差し戻しました',
    };
  }

  /**
   * アーカイブ（確定不採用）
   */
  private async rescueByArchive(
    post: any,
    rescuer: any,
    reason: string
  ): Promise<RescueResult> {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'archived',
        agendaStatus: 'rejected_by_manager',
        agendaDecisionBy: rescuer.id,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        agendaRescueLevel: null, // アーカイブは救済ではない
      },
    });

    // 投稿者に通知
    await notificationService.sendSimpleNotification({
      userId: post.authorId,
      title: '📦 提案がアーカイブされました',
      message: `あなたの提案は現時点では採用されませんでしたが、アーカイブに保存されます。\n\n理由: ${reason}`,
      urgency: 'normal',
      postId: post.id,
    });

    return {
      success: true,
      action: 'archive',
      message: 'アーカイブに移動しました',
    };
  }
}
```

---

## 📡 API設計

### エンドポイント

#### 1. 救済候補取得

```
GET /api/agenda/rescue/candidates
```

**レスポンス**:
```json
{
  "success": true,
  "candidates": [
    {
      "id": "post-123",
      "content": "...",
      "agendaScore": -35,
      "agendaLevel": "DEPT_AGENDA",
      "author": {
        "id": "user-456",
        "name": "田中太郎",
        "department": "看護部A病棟"
      },
      "votes": {
        "stronglySupport": 2,
        "support": 3,
        "neutral": 5,
        "oppose": 8,
        "stronglyOppose": 10
      },
      "rescueDeadline": "2025-10-25T23:59:59Z"
    }
  ]
}
```

#### 2. 救済実行

```
POST /api/agenda/rescue
```

**リクエストボディ**:
```json
{
  "postId": "post-123",
  "action": "escalate",
  "reason": "部署では反対が多いが、施設全体で検討する価値がある",
  "targetLevel": "FACILITY_AGENDA"
}
```

**レスポンス**:
```json
{
  "success": true,
  "action": "escalate",
  "previousScore": -35,
  "newLevel": "FACILITY_AGENDA",
  "newScore": 100,
  "message": "救済昇格が完了しました（FACILITY_AGENDA）"
}
```

---

## 🎨 UI設計

### ProposalManagementPage - 救済候補タブ

```
┌─────────────────────────────────────────────────────────────┐
│ 投稿管理 - 現場の声をサポート                                    │
├─────────────────────────────────────────────────────────────┤
│ 管轄範囲: レベル7 - 看護、2レベル、閲覧可能: 3レベル              │
│                                                             │
│ ┌─────────┬─────────────┬─────────────┐                     │
│ │📊データ分析│📄議題提案書    │🆘救済候補(3)│ ← 選択中         │
│ └─────────┴─────────────┴─────────────┘                     │
│                                                             │
│ フィルター: [すべて▼] [議題レベル: すべて▼]                    │
│                                                             │
│ ┌────────────────────────────────────────────────────┐      │
│ │ 🚨 スコア: -35点 | 部署議題 (DEPT_AGENDA)             │      │
│ │                                                    │      │
│ │ テスト投稿：業務効率化のための新システム導入提案...      │      │
│ │ 投稿者: 田中太郎 | 部署: 看護部A病棟                   │      │
│ │                                                    │      │
│ │ 投票状況:                                           │      │
│ │ [強く賛成: 2] [賛成: 3] [中立: 5] [反対: 8] [強く反対: 10] │
│ │                                                    │      │
│ │ [↗️ 上位レベルに昇格] [📝 改善依頼] [📦 アーカイブ]     │      │
│ └────────────────────────────────────────────────────┘      │
│                                                             │
│ ┌────────────────────────────────────────────────────┐      │
│ │ 🚨 スコア: -42点 | 施設議題 (FACILITY_AGENDA)         │      │
│ │                                                    │      │
│ │ 休憩室の環境改善提案...                              │      │
│ │ 投稿者: 佐藤花子 | 部署: 看護部B病棟                   │      │
│ │                                                    │      │
│ │ [↗️ 上位レベルに昇格] [📝 改善依頼] [📦 アーカイブ]     │      │
│ └────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 テスト計画

### 単体テスト

**ファイル**: `tests/services/AgendaRescueService.test.ts`

```typescript
describe('AgendaRescueService', () => {
  describe('executeRescue', () => {
    it('escalate: スコア-30点の提案を上位レベルに救済昇格できる', async () => {
      const result = await service.executeRescue({
        postId: 'test-post-negative',
        action: 'escalate',
        rescuerId: 'test-manager-1',
        reason: '施設全体で検討する価値がある',
        targetLevel: 'FACILITY_AGENDA',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('escalate');
      expect(result.newLevel).toBe('FACILITY_AGENDA');
    });

    it('revise: 改善依頼として差し戻しできる', async () => {
      const result = await service.executeRescue({
        postId: 'test-post-negative',
        action: 'revise',
        rescuerId: 'test-manager-1',
        reason: '内容を改善すれば採用可能',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('revise');
    });
  });
});
```

### 統合テスト

**ファイル**: `tests/integration/phase6-rescue-flow.test.ts`

```typescript
describe('Phase 6: Rescue Flow', () => {
  it('マイナススコアの提案が救済候補リストに表示される', async () => {
    // 1. スコア-30点の提案を作成
    const post = await createTestPost({ agendaScore: -35 });

    // 2. 救済候補APIを呼び出す
    const response = await fetch('/api/agenda/rescue/candidates');
    const data = await response.json();

    // 3. 救済候補に含まれることを確認
    expect(data.candidates).toContainEqual(
      expect.objectContaining({ id: post.id })
    );
  });

  it('師長が救済昇格を実行できる', async () => {
    // 1. スコア-30点の提案を作成
    const post = await createTestPost({ agendaScore: -35, agendaLevel: 'DEPT_AGENDA' });

    // 2. 師長が救済昇格を実行
    const response = await fetch('/api/agenda/rescue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        postId: post.id,
        action: 'escalate',
        reason: '施設全体で検討する価値がある',
        targetLevel: 'FACILITY_AGENDA',
      }),
    });

    const data = await response.json();

    // 3. 救済成功を確認
    expect(data.success).toBe(true);
    expect(data.newLevel).toBe('FACILITY_AGENDA');

    // 4. DBの更新を確認
    const updatedPost = await prisma.post.findUnique({ where: { id: post.id } });
    expect(updatedPost.agendaRescueLevel).toBe(7);
    expect(updatedPost.agendaLevel).toBe('FACILITY_AGENDA');
  });
});
```

---

## 📊 実装規模見積もり

| カテゴリ | ファイル | 見積行数 |
|---------|---------|---------|
| サービス | `AgendaRescueDetectionService.ts` | 150行 |
| サービス | `AgendaRescueService.ts` | 300行 |
| API | `agendaRescueRoutes.ts` | 150行 |
| UI | `RescueCandidateCard.tsx` | 200行 |
| UI | `ProposalManagementPage.tsx`（修正） | +100行 |
| ジョブ | `rescueDetectionJob.ts` | 50行 |
| テスト | `AgendaRescueService.test.ts` | 200行 |
| テスト | `phase6-rescue-flow.test.ts` | 150行 |
| **合計** | | **約1,300行** |

---

## ✅ 完了定義

Phase 6は以下が完了した時点で完了とします：

- [ ] `AgendaRescueDetectionService` 実装完了
- [ ] `AgendaRescueService` 実装完了
- [ ] `agendaRescueRoutes` API実装完了
- [ ] `RescueCandidateCard` UI実装完了
- [ ] ProposalManagementPageに救済候補タブ追加完了
- [ ] 救済検知ジョブ実装完了
- [ ] 単体テスト・統合テスト完了
- [ ] APIテスト（curl）で動作確認完了
- [ ] Phase 6実装完了報告書作成完了

---

## 📝 注意事項

### 既存機能との整合性

- **AgendaDecisionService**: 既存の却下ベース救済と共存させる
- **Phase 5（昇格）**: スコアベース昇格と区別する（救済昇格はagendaRescueLevelを設定）
- **通知システム**: 既存のAgendaLevelNotificationServiceを活用

### データ整合性

- `agendaRescueLevel`: NULL（救済なし）/ 7（師長）/ 11（事務長）
- `agendaRescueType`: 新規フィールド（オプション）で救済タイプを記録

### UI/UX

- 救済候補は「緊急度」を視覚的に表現（赤色、⚠️アイコン）
- 救済理由は必須入力（透明性確保）
- 救済履歴を表示可能にする

---

**作成者**: Claude Code
**最終更新**: 2025年10月19日
