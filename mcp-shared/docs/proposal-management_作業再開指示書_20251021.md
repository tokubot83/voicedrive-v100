# proposal-management 作業再開指示書

**文書番号**: VD-RESTART-PM-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDriveチーム
**対象機能**: ProposalManagement（議題提案管理）
**対象フェーズ**: Phase 2（フロントエンド統合 + テスト）

---

## 📋 この文書の目的

本文書は、**本番データベース構築完了後**にProposalManagement機能のPhase 2作業を再開する際の手順書です。Phase 1（バックエンド実装）で中断した作業を迅速に再開できるよう、必要な情報をすべて記載しています。

---

## ⚠️ 作業再開の前提条件

### 必須条件

- [ ] **本番データベース構築完了**
- [ ] **医療システムとの統合DB環境準備完了**
- [ ] **Phase 1完了報告書を確認済み**
  - パス: `mcp-shared/docs/proposal-management_作業完了報告書_20251021.md`

### 推奨事項

- [ ] DB要件分析書を再読（`proposal-management_DB要件分析_20251021.md`）
- [ ] 暫定マスターリストを再読（`proposal-management暫定マスターリスト_20251021.md`）
- [ ] APIサーバーが正常に起動することを確認

---

## 🔍 Phase 1完了内容の確認

### Phase 1で実装済みの項目

| カテゴリ | 実装項目 | ファイルパス |
|---------|---------|------------|
| **データベース** | ProposalDecisionテーブル | `prisma/schema.prisma` |
| **API** | 却下API | `src/api/routes/proposal-decision.routes.ts` |
| **API** | 保留API | `src/api/routes/proposal-decision.routes.ts` |
| **API** | 部署案件化API | `src/api/routes/proposal-decision.routes.ts` |
| **サーバー** | ルート登録 | `src/api/server.ts` |

### データベース確認

**確認コマンド**:
```bash
cd C:\projects\voicedrive-v100
npx prisma studio --port 5556
```

**確認項目**:
- [ ] `proposal_decisions`テーブルが存在する
- [ ] 以下のフィールドが正しく作成されている:
  - `id`, `postId`, `decisionType`, `agendaLevel`
  - `decidedBy`, `decidedAt`, `reason`
  - `reviewDate`, `targetDepartment`, `assignedTo` 等

### API確認

**確認コマンド**:
```bash
cd C:\projects\voicedrive-v100
npm run dev:api
```

**確認項目**:
- [ ] APIサーバーが `http://localhost:3003` で起動する
- [ ] 以下のログが表示される:
  ```
  📋 Registering Agenda API routes at /api/agenda
  ```

**利用可能エンドポイント**:
- `POST http://localhost:3003/api/agenda/:postId/reject`
- `POST http://localhost:3003/api/agenda/:postId/hold`
- `POST http://localhost:3003/api/agenda/:postId/department-matter`

---

## 🎯 Phase 2作業スコープ

### 実装項目（優先度順）

| # | 項目 | 説明 | 優先度 | 推定工数 |
|---|------|------|--------|---------|
| 1 | フロントエンド統合 | ProposalManagementPage.tsxのAPI連携 | 🔴 HIGH | 3-4時間 |
| 2 | エラーハンドリング | ローディング・エラー表示の実装 | 🔴 HIGH | 1-2時間 |
| 3 | API単体テスト | 3つのエンドポイントのテスト | 🟡 MEDIUM | 2-3時間 |
| 4 | 統合テスト | フロントエンド↔バックエンド | 🟡 MEDIUM | 2-3時間 |
| 5 | 決定履歴コンポーネント | ProposalDecisionHistory.tsx | 🟢 LOW | 2時間 |
| 6 | 通知スケジュール | 保留期限通知機能 | 🟢 LOW | 3時間 |

**合計推定工数**: 13-17時間

---

## 🛠️ Step 1: フロントエンド統合

### 1.1 ProposalManagementPage.tsx修正

**ファイル**: `src/pages/ProposalManagementPage.tsx`

**修正箇所**: Line 259-296（3つのハンドラ）

#### handleReject修正

**修正前（Line 259-270）**:
```typescript
const handleReject = (post: Post, feedback: string) => {
  if (!activeUser) return;
  console.log('❌ [ProposalManagement] 却下:', {
    postId: post.id, feedback, userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`却下しました。\n理由: ${feedback}`);
};
```

**修正後**:
```typescript
const handleReject = async (post: Post, feedback: string) => {
  if (!activeUser) return;

  setLoading(true);
  try {
    const response = await fetch(`http://localhost:3003/api/agenda/${post.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: JWT認証実装後にAuthorizationヘッダー追加
        // 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify({
        feedback,
        userId: activeUser.id,
        agendaLevel: post.agendaLevel
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '却下処理に失敗しました');
    }

    const data = await response.json();

    console.log('✅ [ProposalManagement] 却下成功:', data.decision);

    // 成功通知
    alert(`却下しました。\n理由: ${feedback}`);

    // 投稿リストから削除（UI更新）
    setPosts(prev => prev.filter(p => p.id !== post.id));

  } catch (error) {
    console.error('❌ [ProposalManagement] 却下エラー:', error);
    alert(error instanceof Error ? error.message : '却下処理に失敗しました');
  } finally {
    setLoading(false);
  }
};
```

#### handleHold修正

**修正前（Line 272-283）**:
```typescript
const handleHold = (post: Post, feedback: string) => {
  if (!activeUser) return;
  console.log('⏸️ [ProposalManagement] 保留:', {
    postId: post.id, feedback, userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`保留しました。\n理由: ${feedback}`);
};
```

**修正後**:
```typescript
const handleHold = async (post: Post, feedback: string) => {
  if (!activeUser) return;

  setLoading(true);
  try {
    const response = await fetch(`http://localhost:3003/api/agenda/${post.id}/hold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedback,
        userId: activeUser.id,
        agendaLevel: post.agendaLevel,
        // reviewDate: '2025-11-15T00:00:00Z'  // オプション: 再検討予定日
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '保留処理に失敗しました');
    }

    const data = await response.json();

    console.log('✅ [ProposalManagement] 保留成功:', data.decision);

    alert(`保留しました。\n理由: ${feedback}`);

    // 投稿のステータスを更新（UI反映）
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, status: 'on_hold' }  // ステータスフィールドがあれば更新
        : p
    ));

  } catch (error) {
    console.error('❌ [ProposalManagement] 保留エラー:', error);
    alert(error instanceof Error ? error.message : '保留処理に失敗しました');
  } finally {
    setLoading(false);
  }
};
```

#### handleDepartmentMatter修正

**修正前（Line 285-296）**:
```typescript
const handleDepartmentMatter = (post: Post, feedback: string) => {
  if (!activeUser) return;
  console.log('🏢 [ProposalManagement] 部署案件化:', {
    postId: post.id, feedback, userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`部署ミーティング案件として処理します。\n理由: ${feedback}`);
};
```

**修正後**:
```typescript
const handleDepartmentMatter = async (post: Post, feedback: string) => {
  if (!activeUser) return;

  // レベルチェック（クライアント側でも確認）
  if (post.agendaLevel !== 'DEPT_REVIEW' && post.agendaLevel !== 'DEPT_AGENDA') {
    alert('部署案件化は部署レベル（DEPT_REVIEW/DEPT_AGENDA）でのみ可能です');
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(`http://localhost:3003/api/agenda/${post.id}/department-matter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedback,
        userId: activeUser.id,
        agendaLevel: post.agendaLevel,
        targetDepartment: activeUser.department,  // 現在のユーザーの部署
        // assignedTo: 'dept_leader_id'  // オプション: 担当リーダーID
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '部署案件化処理に失敗しました');
    }

    const data = await response.json();

    console.log('✅ [ProposalManagement] 部署案件化成功:', data.decision);

    alert(`部署ミーティング案件として処理します。\n理由: ${feedback}`);

    // 投稿のステータスを更新
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, status: 'department_matter' }
        : p
    ));

  } catch (error) {
    console.error('❌ [ProposalManagement] 部署案件化エラー:', error);
    alert(error instanceof Error ? error.message : '部署案件化処理に失敗しました');
  } finally {
    setLoading(false);
  }
};
```

#### loading状態の追加

**ファイル先頭に追加**:
```typescript
const [loading, setLoading] = useState(false);
```

---

### 1.2 ProposalAnalysisCard.tsx修正

**ファイル**: `src/components/proposal/ProposalAnalysisCard.tsx`

**修正箇所**: Line 708-714（アクション実行部分）

**修正前**:
```typescript
onClick={() => {
  if (showActionModal === 'reject' && onReject) {
    onReject(actionFeedback);
  } else if (showActionModal === 'hold' && onHold) {
    onHold(actionFeedback);
  } else if (showActionModal === 'department_matter' && onDepartmentMatter) {
    onDepartmentMatter(actionFeedback);
  }
  setShowActionModal(null);
  setActionFeedback('');
}}
```

**修正後**:
```typescript
onClick={async () => {
  setIsSubmitting(true);
  try {
    if (showActionModal === 'reject' && onReject) {
      await onReject(post, actionFeedback);
    } else if (showActionModal === 'hold' && onHold) {
      await onHold(post, actionFeedback);
    } else if (showActionModal === 'department_matter' && onDepartmentMatter) {
      await onDepartmentMatter(post, actionFeedback);
    }
    setShowActionModal(null);
    setActionFeedback('');
  } catch (error) {
    console.error('Action failed:', error);
    // エラーはハンドラ内で処理されるため、ここではログのみ
  } finally {
    setIsSubmitting(false);
  }
}}
disabled={!actionFeedback.trim() || isSubmitting}
```

**isSubmitting状態の追加（ファイル先頭）**:
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
```

**ボタンのローディング表示**:
```typescript
<button
  onClick={...}
  disabled={!actionFeedback.trim() || isSubmitting}
  className={`flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {isSubmitting ? '処理中...' : '実行'}
</button>
```

---

## 🛠️ Step 2: エラーハンドリング強化

### 2.1 トースト通知の導入（推奨）

**インストール**:
```bash
npm install react-hot-toast
```

**ProposalManagementPage.tsx修正**:
```typescript
import toast, { Toaster } from 'react-hot-toast';

// alert()の代わりにtoast使用
toast.success('却下しました');
toast.error('却下処理に失敗しました');

// JSX内に追加
<Toaster position="top-right" />
```

### 2.2 エラーメッセージのユーザーフレンドリー化

**エラーマッピング**:
```typescript
const getErrorMessage = (error: any): string => {
  const errorMap: Record<string, string> = {
    '投票期限が切れていません': '投票期限後に実行できます。現在は投票受付中です。',
    '権限がありません': 'この操作を行う権限がありません。上位の管理職にご確認ください。',
    'DEPT_REVIEW/DEPT_AGENDAでのみ可能': '部署案件化は部署レベルの提案でのみ可能です。',
  };

  const message = error?.error || error?.message || '不明なエラー';
  return errorMap[message] || message;
};

// 使用例
toast.error(getErrorMessage(error));
```

---

## 🛠️ Step 3: API単体テスト実装

### 3.1 テスト環境セットアップ

**インストール**:
```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

**jest.config.js作成**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### 3.2 却下APIテスト

**ファイル**: `src/api/routes/__tests__/proposal-decision.test.ts`

```typescript
import request from 'supertest';
import express from 'express';
import proposalDecisionRoutes from '../proposal-decision.routes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/api/agenda', proposalDecisionRoutes);

describe('POST /api/agenda/:postId/reject', () => {
  let testPost: any;
  let testUser: any;

  beforeAll(async () => {
    // テストデータ作成
    testUser = await prisma.user.create({
      data: {
        employeeId: 'TEST-001',
        email: 'test@example.com',
        name: 'テストユーザー',
        department: '内科',
        permissionLevel: 10  // 部長レベル
      }
    });

    testPost = await prisma.post.create({
      data: {
        type: 'improvement',
        content: 'テスト投稿',
        authorId: testUser.id,
        anonymityLevel: 'public',
        agendaLevel: 'FACILITY_AGENDA',
        agendaVotingDeadline: new Date(Date.now() - 86400000)  // 1日前（期限切れ）
      }
    });
  });

  afterAll(async () => {
    // テストデータ削除
    await prisma.proposalDecision.deleteMany({});
    await prisma.post.deleteMany({ where: { id: testPost.id } });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  it('期限切れ投稿を正常に却下できる', async () => {
    const response = await request(app)
      .post(`/api/agenda/${testPost.id}/reject`)
      .send({
        feedback: 'テスト却下理由',
        userId: testUser.id,
        agendaLevel: 'FACILITY_AGENDA'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.decision.decisionType).toBe('reject');
  });

  it('期限内投稿は却下できない（400エラー）', async () => {
    // 期限内の投稿を作成
    const futurePost = await prisma.post.create({
      data: {
        type: 'improvement',
        content: 'テスト投稿2',
        authorId: testUser.id,
        anonymityLevel: 'public',
        agendaLevel: 'FACILITY_AGENDA',
        agendaVotingDeadline: new Date(Date.now() + 86400000)  // 1日後（期限内）
      }
    });

    const response = await request(app)
      .post(`/api/agenda/${futurePost.id}/reject`)
      .send({
        feedback: 'テスト却下理由',
        userId: testUser.id,
        agendaLevel: 'FACILITY_AGENDA'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    await prisma.post.delete({ where: { id: futurePost.id } });
  });

  it('権限不足ユーザーは却下できない（403エラー）', async () => {
    const lowLevelUser = await prisma.user.create({
      data: {
        employeeId: 'TEST-002',
        email: 'test2@example.com',
        name: 'テストユーザー2',
        department: '内科',
        permissionLevel: 5  // 副主任レベル（FACILITY_AGENDAには権限不足）
      }
    });

    const response = await request(app)
      .post(`/api/agenda/${testPost.id}/reject`)
      .send({
        feedback: 'テスト却下理由',
        userId: lowLevelUser.id,
        agendaLevel: 'FACILITY_AGENDA'
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    await prisma.user.delete({ where: { id: lowLevelUser.id } });
  });
});
```

### 3.3 テスト実行

**package.json修正**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**実行**:
```bash
npm test
```

---

## 🛠️ Step 4: 統合テスト実装

### 4.1 E2Eテスト（Playwright推奨）

**インストール**:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**テスト作成**: `tests/proposal-management.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('ProposalManagement - 却下機能', () => {
  test('管理職が期限切れ投稿を却下できる', async ({ page }) => {
    // 1. ログイン（管理職アカウント）
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'manager@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. ProposalManagementページに移動
    await page.goto('http://localhost:3001/proposal-management');

    // 3. 期限切れ投稿を探す
    await page.waitForSelector('.proposal-card');

    // 4. 却下ボタンをクリック
    await page.click('button:has-text("却下")');

    // 5. モーダルに理由を入力
    await page.fill('textarea[placeholder="理由を入力してください..."]', 'テスト却下理由');

    // 6. 実行ボタンをクリック
    await page.click('button:has-text("実行")');

    // 7. 成功メッセージを確認
    await expect(page.locator('text=却下しました')).toBeVisible();
  });
});
```

**実行**:
```bash
npx playwright test
```

---

## 🛠️ Step 5: 決定履歴コンポーネント実装

### 5.1 ProposalDecisionHistory.tsx作成

**ファイル**: `src/components/proposal/ProposalDecisionHistory.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Pause, FileText } from 'lucide-react';

interface ProposalDecision {
  id: string;
  decisionType: 'reject' | 'hold' | 'department_matter' | 'level_up_approved';
  decidedAt: Date;
  reason: string;
  targetDepartment?: string;
  reviewDate?: Date;
}

interface Props {
  postId: string;
}

export const ProposalDecisionHistory: React.FC<Props> = ({ postId }) => {
  const [decisions, setDecisions] = useState<ProposalDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
  }, [postId]);

  const fetchDecisions = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/proposal-decisions/${postId}`);
      const data = await response.json();
      setDecisions(data.decisions || []);
    } catch (error) {
      console.error('Failed to fetch decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-400">読み込み中...</div>;
  if (decisions.length === 0) return <div className="text-gray-500">決定履歴はありません</div>;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white">決定履歴</h3>
      {decisions.map((decision) => (
        <DecisionCard key={decision.id} decision={decision} />
      ))}
    </div>
  );
};

const DecisionCard: React.FC<{ decision: ProposalDecision }> = ({ decision }) => {
  const getIcon = () => {
    switch (decision.decisionType) {
      case 'reject': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'hold': return <Pause className="w-5 h-5 text-orange-400" />;
      case 'department_matter': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'level_up_approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getLabel = () => {
    switch (decision.decisionType) {
      case 'reject': return '却下';
      case 'hold': return '保留';
      case 'department_matter': return '部署案件化';
      case 'level_up_approved': return 'レベルアップ承認';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{getLabel()}</span>
            <span className="text-xs text-gray-500">
              {new Date(decision.decidedAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <p className="text-sm text-gray-300">{decision.reason}</p>
          {decision.targetDepartment && (
            <p className="text-xs text-gray-400 mt-1">
              対象部署: {decision.targetDepartment}
            </p>
          )}
          {decision.reviewDate && (
            <p className="text-xs text-gray-400 mt-1">
              再検討予定: {new Date(decision.reviewDate).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDecisionHistory;
```

### 5.2 決定履歴取得API追加

**ファイル**: `src/api/routes/proposal-decision.routes.ts` に追加

```typescript
/**
 * GET /api/proposal-decisions/:postId
 * 投稿の決定履歴を取得
 */
router.get('/proposal-decisions/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const decisions = await prisma.proposalDecision.findMany({
      where: { postId },
      orderBy: { decidedAt: 'desc' },
      include: {
        decidedByUser: {
          select: {
            id: true,
            name: true,
            department: true,
            permissionLevel: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      decisions: decisions.map(d => ({
        id: d.id,
        decisionType: d.decisionType,
        decidedAt: d.decidedAt.toISOString(),
        reason: d.reason,
        targetDepartment: d.targetDepartment,
        reviewDate: d.reviewDate?.toISOString(),
        decidedBy: {
          name: d.decidedByUser.name,
          department: d.decidedByUser.department
        }
      }))
    });

  } catch (error: any) {
    console.error('[GET /api/proposal-decisions/:postId] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '決定履歴の取得に失敗しました'
    });
  }
});
```

---

## 🛠️ Step 6: 保留期限通知スケジュール実装（オプション）

### 6.1 NotificationScheduleテーブル追加

**schema.prisma修正**:
```prisma
model NotificationSchedule {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])

  scheduledFor  DateTime  // 通知予定日時
  type          String    // 'review_reminder'
  title         String
  message       String

  relatedPostId String?
  relatedPost   Post?     @relation(fields: [relatedPostId], references: [id])

  executed      Boolean   @default(false)
  executedAt    DateTime?

  createdAt     DateTime  @default(now())

  @@index([scheduledFor, executed])
  @@map("notification_schedules")
}
```

### 6.2 Cron Job追加

**ファイル**: `src/jobs/notificationScheduleJob.ts`

```typescript
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function startNotificationScheduleJob() {
  // 毎時0分に実行
  cron.schedule('0 * * * *', async () => {
    const now = new Date();

    // 実行予定の通知を取得
    const pendingNotifications = await prisma.notificationSchedule.findMany({
      where: {
        scheduledFor: { lte: now },
        executed: false
      },
      include: {
        user: true,
        relatedPost: true
      }
    });

    for (const schedule of pendingNotifications) {
      // 通知作成
      await prisma.notification.create({
        data: {
          category: 'proposal',
          subcategory: schedule.type,
          priority: 'medium',
          title: schedule.title,
          content: schedule.message,
          target: schedule.userId,
          senderId: 'SYSTEM',
          status: 'pending'
        }
      });

      // 実行済みフラグ更新
      await prisma.notificationSchedule.update({
        where: { id: schedule.id },
        data: {
          executed: true,
          executedAt: new Date()
        }
      });
    }

    console.log(`[NotificationSchedule] ${pendingNotifications.length}件の通知を送信しました`);
  });

  console.log('[NotificationSchedule] Cron Job起動完了（毎時0分）');
}
```

**server.tsに追加**:
```typescript
import { startNotificationScheduleJob } from './jobs/notificationScheduleJob';

// サーバー起動後
startNotificationScheduleJob();
```

---

## ✅ 作業再開チェックリスト

### 開始前の確認

- [ ] 本番データベースが構築完了している
- [ ] Phase 1完了報告書を読んだ
- [ ] DB要件分析書・暫定マスターリストを読んだ
- [ ] APIサーバーが正常に起動する
- [ ] proposal_decisionsテーブルが存在する

### Phase 2実装

#### 🔴 HIGH Priority（必須）

- [ ] ProposalManagementPage.tsxのhandleReject修正
- [ ] ProposalManagementPage.tsxのhandleHold修正
- [ ] ProposalManagementPage.tsxのhandleDepartmentMatter修正
- [ ] ProposalAnalysisCard.tsxのasync/await対応
- [ ] ローディング状態の実装
- [ ] エラーハンドリングの実装

#### 🟡 MEDIUM Priority（推奨）

- [ ] react-hot-toastの導入
- [ ] API単体テスト実装（3エンドポイント）
- [ ] 統合テスト実装（Playwright）
- [ ] エラーメッセージのユーザーフレンドリー化

#### 🟢 LOW Priority（オプション）

- [ ] ProposalDecisionHistory.tsx実装
- [ ] 決定履歴取得API追加
- [ ] NotificationScheduleテーブル追加
- [ ] 通知スケジュールCron Job実装

---

## 📝 トラブルシューティング

### 問題1: APIサーバーが起動しない

**原因**: Prismaクライアントが最新でない

**解決策**:
```bash
npx prisma generate
npm run dev:api
```

### 問題2: proposal_decisionsテーブルが見つからない

**原因**: マイグレーションが未実行

**解決策**:
```bash
npx prisma db push
```

### 問題3: CORS エラー

**原因**: フロントエンド（localhost:3001）からAPIサーバー（localhost:3003）へのリクエストがブロックされる

**解決策**: `src/api/server.ts`のCORS設定を確認
```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',  // VoiceDrive開発環境
    'http://localhost:3003',  // VoiceDrive API開発環境
  ],
  credentials: true
}));
```

### 問題4: 認証エラー（401 Unauthorized）

**原因**: JWT認証がまだ実装されていない

**暫定対応**: APIルートで認証チェックをスキップ（開発環境のみ）

**本番対応**: JWT認証ミドルウェア実装後、リクエストヘッダーに追加
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
}
```

---

## 📞 サポート・質問

### ドキュメント参照

| 項目 | ドキュメント |
|------|------------|
| **Phase 1完了内容** | `proposal-management_作業完了報告書_20251021.md` |
| **DB要件分析** | `proposal-management_DB要件分析_20251021.md` |
| **実装詳細** | `proposal-management暫定マスターリスト_20251021.md` |

### コード参照

| 項目 | ファイルパス |
|------|------------|
| **API実装** | `src/api/routes/proposal-decision.routes.ts` |
| **DBスキーマ** | `prisma/schema.prisma` |
| **フロントエンド** | `src/pages/ProposalManagementPage.tsx` |
| **分析カード** | `src/components/proposal/ProposalAnalysisCard.tsx` |

---

## 🎯 Phase 2完了後の確認事項

### 機能テスト

- [ ] 却下機能が正常に動作する
- [ ] 保留機能が正常に動作する
- [ ] 部署案件化機能が正常に動作する
- [ ] 通知が正しく送信される
- [ ] エラーケースで適切なメッセージが表示される

### コード品質

- [ ] TypeScriptのコンパイルエラーがない
- [ ] ESLintの警告がない
- [ ] テストがすべてパスする
- [ ] コードレビュー完了

### ドキュメント

- [ ] Phase 2完了報告書作成
- [ ] APIドキュメント更新（OpenAPI/Swagger）
- [ ] ユーザーマニュアル更新（該当する場合）

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
ステータス: Phase 2作業再開待ち
次のアクション: 本番DB構築完了後、この指示書に従ってPhase 2を開始
