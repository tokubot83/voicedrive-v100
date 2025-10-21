# proposal-management 暫定マスターリスト

**文書番号**: VD-MASTER-PM-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDriveチーム
**対象ページ**: ProposalManagementPage
**目的**: proposal-management機能の実装に必要な全項目を体系的に管理

---

## 📋 実装概要

### プロジェクト情報

| 項目 | 内容 |
|------|------|
| **機能名** | 議題提案管理（Proposal Management） |
| **対象ページ** | ProposalManagementPage |
| **URL** | /proposal-management |
| **実装フェーズ** | Phase 1（バックエンド） + Phase 2（フロントエンド統合） |
| **優先度** | HIGH 🔴 |
| **期限** | 2025年10月末 |

### 実装スコープ

| カテゴリ | 実装項目数 | ステータス |
|---------|----------|----------|
| **データベーステーブル** | 1（新規） | ⏳ 未実装 |
| **API エンドポイント** | 3（新規） | ⏳ 未実装 |
| **サービスクラス** | 1（新規） | ⏳ 未実装 |
| **型定義** | 2（新規） | ⏳ 未実装 |
| **フロントエンド統合** | 3箇所 | ⏳ 未実装 |
| **テスト** | 6シナリオ | ⏳ 未実装 |

---

## 🗂️ データベース設計

### 新規テーブル: ProposalDecision

**目的:** 議題提案に対する責任者の決定（却下・保留・部署案件化・レベルアップ承認）を記録

**Prismaスキーマ:**
```prisma
model ProposalDecision {
  id            String   @id @default(cuid())
  postId        String
  post          Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  // 決定情報
  decisionType  String   // 'reject' | 'hold' | 'department_matter' | 'level_up_approved'
  agendaLevel   String   // 決定時の議題レベル（'PENDING' | 'DEPT_REVIEW' | ...）

  // 決定者情報
  decidedBy     String
  decidedByUser User     @relation(fields: [decidedBy], references: [id])
  decidedAt     DateTime @default(now())

  // 決定理由
  reason        String   // 決定理由（必須）
  notes         String?  // 追加メモ

  // 保留固有フィールド
  reviewDate    DateTime?  // 再検討予定日
  isReviewed    Boolean?   @default(false)
  reviewedAt    DateTime?
  reviewedBy    String?
  reviewOutcome String?    // 'approved' | 'rejected' | 'extended'

  // 部署案件化固有フィールド
  targetDepartment  String?   // 対象部署
  assignedTo        String?   // 担当リーダーID
  meetingScheduled  DateTime? // ミーティング予定日
  meetingCompleted  Boolean?  @default(false)
  meetingOutcome    String?   // ミーティング結果

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([postId])
  @@index([decidedBy])
  @@index([decisionType])
  @@index([agendaLevel])
}
```

**フィールド一覧:**

| フィールド名 | 型 | 必須 | デフォルト値 | 説明 |
|------------|---|------|------------|------|
| `id` | String | ✅ | cuid() | プライマリーキー |
| `postId` | String | ✅ | - | 対象投稿ID（外部キー） |
| `decisionType` | String | ✅ | - | 決定タイプ |
| `agendaLevel` | String | ✅ | - | 決定時の議題レベル |
| `decidedBy` | String | ✅ | - | 決定者ID（外部キー） |
| `decidedAt` | DateTime | ✅ | now() | 決定日時 |
| `reason` | String | ✅ | - | 決定理由 |
| `notes` | String | ❌ | null | 追加メモ |
| `reviewDate` | DateTime | ❌ | null | 再検討予定日（保留時） |
| `isReviewed` | Boolean | ❌ | false | 再検討済みフラグ |
| `reviewedAt` | DateTime | ❌ | null | 再検討日時 |
| `reviewedBy` | String | ❌ | null | 再検討者ID |
| `reviewOutcome` | String | ❌ | null | 再検討結果 |
| `targetDepartment` | String | ❌ | null | 対象部署（部署案件化時） |
| `assignedTo` | String | ❌ | null | 担当リーダーID |
| `meetingScheduled` | DateTime | ❌ | null | ミーティング予定日 |
| `meetingCompleted` | Boolean | ❌ | false | ミーティング完了フラグ |
| `meetingOutcome` | String | ❌ | null | ミーティング結果 |
| `createdAt` | DateTime | ✅ | now() | レコード作成日時 |
| `updatedAt` | DateTime | ✅ | now() | レコード更新日時 |

**インデックス:**
- `postId` - 投稿IDでの検索用
- `decidedBy` - 決定者IDでの検索用
- `decisionType` - 決定タイプでのフィルタリング用
- `agendaLevel` - 議題レベルでのフィルタリング用

---

### Post テーブル追加修正

**追加リレーション:**
```prisma
model Post {
  // 既存フィールド...

  // 新規リレーション
  decisions     ProposalDecision[]  // この投稿に対する決定履歴
}
```

**説明:**
- 1つの投稿に対して複数の決定が記録される可能性があるため、1対多リレーション
- 例: 一度保留された後、再検討で承認される場合など

---

### User テーブル追加修正

**追加リレーション:**
```prisma
model User {
  // 既存フィールド...

  // 新規リレーション
  proposalDecisions  ProposalDecision[]  @relation("DecidedBy")  // この管理職が行った決定
}
```

**説明:**
- 管理職が行った決定履歴を逆引きできるようにする
- 監査・レポート機能で使用

---

## 🔌 API エンドポイント

### API 1: 却下API ❌ 未実装

**基本情報:**

| 項目 | 内容 |
|------|------|
| **メソッド** | POST |
| **パス** | `/api/agenda/{postId}/reject` |
| **認証** | JWT必須 |
| **権限** | targetPermissionLevel以上 + 期限切れ投稿のみ |
| **ファイル** | `src/pages/api/agenda/[postId]/reject.ts` |

**リクエスト:**
```typescript
// URL Parameter
postId: string

// Request Body
{
  feedback: string;      // 却下理由（必須）
  userId: string;        // 決定者ID（必須）
  agendaLevel: AgendaLevel;  // 現在の議題レベル（必須）
}
```

**レスポンス（成功）:**
```typescript
{
  success: true;
  decision: {
    id: string;
    postId: string;
    decisionType: 'reject';
    agendaLevel: string;
    decidedBy: string;
    decidedAt: string;  // ISO 8601
    reason: string;
  };
  notification: {
    id: string;
    recipientId: string;  // 投稿者ID
    message: string;
  };
}
```

**レスポンス（エラー）:**
```typescript
{
  success: false;
  error: string;  // エラーメッセージ
}
```

**エラーケース:**
- 401 Unauthorized - 認証トークンなし
- 403 Forbidden - 権限不足
- 404 Not Found - 投稿が存在しない
- 400 Bad Request - 期限が切れていない
- 400 Bad Request - 必須パラメータ不足

**実装ロジック:**
```typescript
// src/pages/api/agenda/[postId]/reject.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { AgendaResponsibilityService } from '@/systems/agenda/services/AgendaResponsibilityService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. 認証チェック
    const user = await verifyJWT(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. パラメータ取得
    const { postId } = req.query;
    const { feedback, userId, agendaLevel } = req.body;

    if (!feedback || !userId || !agendaLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 3. 投稿取得
    const post = await prisma.post.findUnique({
      where: { id: postId as string },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 4. 権限チェック
    const permission = AgendaResponsibilityService.canPerformAction(
      post,
      'reject',
      user.permissionLevel
    );

    if (!permission.allowed) {
      return res.status(403).json({ error: permission.reason || 'Permission denied' });
    }

    // 5. 決定レコード作成
    const decision = await prisma.proposalDecision.create({
      data: {
        postId: post.id,
        decisionType: 'reject',
        agendaLevel: agendaLevel,
        decidedBy: userId,
        reason: feedback
      }
    });

    // 6. 通知作成（投稿者へ）
    const notification = await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'proposal_rejected',
        title: '提案が却下されました',
        message: `あなたの提案「${post.content.substring(0, 30)}...」が却下されました。\n理由: ${feedback}`,
        relatedPostId: post.id
      }
    });

    // 7. レスポンス
    return res.status(200).json({
      success: true,
      decision: {
        id: decision.id,
        postId: decision.postId,
        decisionType: decision.decisionType,
        agendaLevel: decision.agendaLevel,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt.toISOString(),
        reason: decision.reason
      },
      notification: {
        id: notification.id,
        recipientId: notification.userId,
        message: notification.message
      }
    });

  } catch (error) {
    console.error('[API] Reject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### API 2: 保留API ❌ 未実装

**基本情報:**

| 項目 | 内容 |
|------|------|
| **メソッド** | POST |
| **パス** | `/api/agenda/{postId}/hold` |
| **認証** | JWT必須 |
| **権限** | targetPermissionLevel以上 + 期限切れ投稿のみ |
| **ファイル** | `src/pages/api/agenda/[postId]/hold.ts` |

**リクエスト:**
```typescript
// URL Parameter
postId: string

// Request Body
{
  feedback: string;       // 保留理由（必須）
  userId: string;         // 決定者ID（必須）
  agendaLevel: AgendaLevel;   // 現在の議題レベル（必須）
  reviewDate?: string;    // 再検討予定日（ISO 8601、オプション）
}
```

**レスポンス（成功）:**
```typescript
{
  success: true;
  decision: {
    id: string;
    postId: string;
    decisionType: 'hold';
    agendaLevel: string;
    decidedBy: string;
    decidedAt: string;
    reason: string;
    reviewDate?: string;  // 再検討予定日
  };
  notificationSchedule?: {
    id: string;
    scheduledFor: string;  // 通知予定日時
    message: string;
  };
}
```

**実装ロジック:**
```typescript
// src/pages/api/agenda/[postId]/hold.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyJWT(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId } = req.query;
    const { feedback, userId, agendaLevel, reviewDate } = req.body;

    if (!feedback || !userId || !agendaLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId as string },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 権限チェック（省略: reject APIと同様）

    // 決定レコード作成
    const decision = await prisma.proposalDecision.create({
      data: {
        postId: post.id,
        decisionType: 'hold',
        agendaLevel: agendaLevel,
        decidedBy: userId,
        reason: feedback,
        reviewDate: reviewDate ? new Date(reviewDate) : null
      }
    });

    // 投稿者へ通知
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'proposal_on_hold',
        title: '提案が保留されました',
        message: `あなたの提案「${post.content.substring(0, 30)}...」が一時保留されました。\n理由: ${feedback}${reviewDate ? `\n再検討予定日: ${new Date(reviewDate).toLocaleDateString('ja-JP')}` : ''}`,
        relatedPostId: post.id
      }
    });

    // 再検討期限通知スケジュール（reviewDateが指定されている場合）
    let notificationSchedule;
    if (reviewDate) {
      const reviewDeadline = new Date(reviewDate);
      reviewDeadline.setDate(reviewDeadline.getDate() - 1); // 1日前に通知

      notificationSchedule = await prisma.notificationSchedule.create({
        data: {
          userId: userId,
          scheduledFor: reviewDeadline,
          type: 'review_reminder',
          title: '保留中の提案の再検討期限',
          message: `保留中の提案「${post.content.substring(0, 30)}...」の再検討期限が明日です。`,
          relatedPostId: post.id
        }
      });
    }

    return res.status(200).json({
      success: true,
      decision: {
        id: decision.id,
        postId: decision.postId,
        decisionType: decision.decisionType,
        agendaLevel: decision.agendaLevel,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt.toISOString(),
        reason: decision.reason,
        reviewDate: decision.reviewDate?.toISOString()
      },
      notificationSchedule: notificationSchedule ? {
        id: notificationSchedule.id,
        scheduledFor: notificationSchedule.scheduledFor.toISOString(),
        message: notificationSchedule.message
      } : undefined
    });

  } catch (error) {
    console.error('[API] Hold error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### API 3: 部署案件化API ❌ 未実装

**基本情報:**

| 項目 | 内容 |
|------|------|
| **メソッド** | POST |
| **パス** | `/api/agenda/{postId}/department-matter` |
| **認証** | JWT必須 |
| **権限** | targetPermissionLevel以上 + DEPT_REVIEW/DEPT_AGENDAレベルのみ |
| **ファイル** | `src/pages/api/agenda/[postId]/department-matter.ts` |

**リクエスト:**
```typescript
// URL Parameter
postId: string

// Request Body
{
  feedback: string;           // 部署案件化理由（必須）
  userId: string;             // 決定者ID（必須）
  agendaLevel: AgendaLevel;   // 現在の議題レベル（必須）
  targetDepartment: string;   // 対象部署（必須）
  assignedTo?: string;        // 担当リーダーID（オプション）
}
```

**レスポンス（成功）:**
```typescript
{
  success: true;
  decision: {
    id: string;
    postId: string;
    decisionType: 'department_matter';
    agendaLevel: string;
    decidedBy: string;
    decidedAt: string;
    reason: string;
    targetDepartment: string;
    assignedTo?: string;
  };
  notification: {
    id: string;
    recipientId: string;  // 担当リーダーID
    message: string;
  };
}
```

**実装ロジック:**
```typescript
// src/pages/api/agenda/[postId]/department-matter.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyJWT(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId } = req.query;
    const { feedback, userId, agendaLevel, targetDepartment, assignedTo } = req.body;

    if (!feedback || !userId || !agendaLevel || !targetDepartment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // レベルチェック: DEPT_REVIEW または DEPT_AGENDA のみ許可
    if (agendaLevel !== 'DEPT_REVIEW' && agendaLevel !== 'DEPT_AGENDA') {
      return res.status(400).json({
        error: '部署案件化は部署レベル（DEPT_REVIEW/DEPT_AGENDA）でのみ可能です'
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId as string },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 権限チェック（省略: reject APIと同様）

    // 決定レコード作成
    const decision = await prisma.proposalDecision.create({
      data: {
        postId: post.id,
        decisionType: 'department_matter',
        agendaLevel: agendaLevel,
        decidedBy: userId,
        reason: feedback,
        targetDepartment: targetDepartment,
        assignedTo: assignedTo || null
      }
    });

    // 投稿者へ通知
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'proposal_department_matter',
        title: '提案が部署案件化されました',
        message: `あなたの提案「${post.content.substring(0, 30)}...」が部署ミーティング案件として処理されます。\n対象部署: ${targetDepartment}\n理由: ${feedback}`,
        relatedPostId: post.id
      }
    });

    // 担当リーダーへ通知（assignedToが指定されている場合）
    let leaderNotification;
    if (assignedTo) {
      leaderNotification = await prisma.notification.create({
        data: {
          userId: assignedTo,
          type: 'department_matter_assigned',
          title: '新しい部署ミーティング案件',
          message: `新しい部署ミーティング案件が割り当てられました。\n提案: ${post.content.substring(0, 50)}...\n提案者: ${post.author.name}`,
          relatedPostId: post.id
        }
      });
    }

    return res.status(200).json({
      success: true,
      decision: {
        id: decision.id,
        postId: decision.postId,
        decisionType: decision.decisionType,
        agendaLevel: decision.agendaLevel,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt.toISOString(),
        reason: decision.reason,
        targetDepartment: decision.targetDepartment,
        assignedTo: decision.assignedTo
      },
      notification: leaderNotification ? {
        id: leaderNotification.id,
        recipientId: leaderNotification.userId,
        message: leaderNotification.message
      } : undefined
    });

  } catch (error) {
    console.error('[API] Department matter error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## 📦 型定義

### TypeScript型定義ファイル

**ファイル:** `src/types/proposalDecision.ts`

```typescript
/**
 * 提案決定タイプ
 */
export type DecisionType = 'reject' | 'hold' | 'department_matter' | 'level_up_approved';

/**
 * 議題レベル（既存定義の再利用）
 */
export type AgendaLevel =
  | 'PENDING'
  | 'DEPT_REVIEW'
  | 'DEPT_AGENDA'
  | 'FACILITY_AGENDA'
  | 'CORP_REVIEW'
  | 'CORP_AGENDA';

/**
 * 提案決定レコード
 */
export interface ProposalDecision {
  id: string;
  postId: string;

  // 決定情報
  decisionType: DecisionType;
  agendaLevel: AgendaLevel;

  // 決定者情報
  decidedBy: string;
  decidedAt: Date;

  // 決定理由
  reason: string;
  notes?: string | null;

  // 保留固有フィールド
  reviewDate?: Date | null;
  isReviewed?: boolean | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  reviewOutcome?: 'approved' | 'rejected' | 'extended' | null;

  // 部署案件化固有フィールド
  targetDepartment?: string | null;
  assignedTo?: string | null;
  meetingScheduled?: Date | null;
  meetingCompleted?: boolean | null;
  meetingOutcome?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * 決定作成リクエスト（API用）
 */
export interface CreateDecisionRequest {
  feedback: string;
  userId: string;
  agendaLevel: AgendaLevel;
  reviewDate?: string;           // ISO 8601（保留時）
  targetDepartment?: string;     // 部署案件化時
  assignedTo?: string;           // 部署案件化時
}

/**
 * 決定作成レスポンス（API用）
 */
export interface CreateDecisionResponse {
  success: boolean;
  decision?: ProposalDecision;
  notification?: {
    id: string;
    recipientId: string;
    message: string;
  };
  notificationSchedule?: {
    id: string;
    scheduledFor: string;
    message: string;
  };
  error?: string;
}
```

---

## 🔧 サービスクラス

### ProposalDecisionService

**ファイル:** `src/services/ProposalDecisionService.ts`

**目的:** 提案決定に関するビジネスロジックを集約

```typescript
import { PrismaClient } from '@prisma/client';
import { ProposalDecision, DecisionType, AgendaLevel } from '@/types/proposalDecision';

const prisma = new PrismaClient();

export class ProposalDecisionService {
  private static instance: ProposalDecisionService;

  private constructor() {}

  public static getInstance(): ProposalDecisionService {
    if (!this.instance) {
      this.instance = new ProposalDecisionService();
    }
    return this.instance;
  }

  /**
   * 決定を作成
   */
  async createDecision(data: {
    postId: string;
    decisionType: DecisionType;
    agendaLevel: AgendaLevel;
    decidedBy: string;
    reason: string;
    notes?: string;
    reviewDate?: Date;
    targetDepartment?: string;
    assignedTo?: string;
  }): Promise<ProposalDecision> {
    return await prisma.proposalDecision.create({
      data: {
        postId: data.postId,
        decisionType: data.decisionType,
        agendaLevel: data.agendaLevel,
        decidedBy: data.decidedBy,
        reason: data.reason,
        notes: data.notes || null,
        reviewDate: data.reviewDate || null,
        targetDepartment: data.targetDepartment || null,
        assignedTo: data.assignedTo || null
      }
    });
  }

  /**
   * 投稿の決定履歴を取得
   */
  async getDecisionsByPost(postId: string): Promise<ProposalDecision[]> {
    return await prisma.proposalDecision.findMany({
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
  }

  /**
   * 決定タイプでフィルタ
   */
  async getDecisionsByType(decisionType: DecisionType): Promise<ProposalDecision[]> {
    return await prisma.proposalDecision.findMany({
      where: { decisionType },
      orderBy: { decidedAt: 'desc' }
    });
  }

  /**
   * 保留中の提案を取得
   */
  async getPendingHolds(): Promise<ProposalDecision[]> {
    return await prisma.proposalDecision.findMany({
      where: {
        decisionType: 'hold',
        isReviewed: false
      },
      orderBy: { reviewDate: 'asc' }
    });
  }

  /**
   * 部署案件（未完了）を取得
   */
  async getPendingDepartmentMatters(department?: string): Promise<ProposalDecision[]> {
    return await prisma.proposalDecision.findMany({
      where: {
        decisionType: 'department_matter',
        meetingCompleted: false,
        ...(department && { targetDepartment: department })
      },
      orderBy: { decidedAt: 'desc' }
    });
  }

  /**
   * 保留の再検討を記録
   */
  async reviewHold(
    decisionId: string,
    reviewedBy: string,
    outcome: 'approved' | 'rejected' | 'extended'
  ): Promise<ProposalDecision> {
    return await prisma.proposalDecision.update({
      where: { id: decisionId },
      data: {
        isReviewed: true,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy,
        reviewOutcome: outcome
      }
    });
  }

  /**
   * 部署案件のミーティング完了を記録
   */
  async completeDepartmentMeeting(
    decisionId: string,
    outcome: string
  ): Promise<ProposalDecision> {
    return await prisma.proposalDecision.update({
      where: { id: decisionId },
      data: {
        meetingCompleted: true,
        meetingOutcome: outcome
      }
    });
  }

  /**
   * 決定統計を取得
   */
  async getDecisionStats(agendaLevel?: AgendaLevel): Promise<{
    total: number;
    byType: Record<DecisionType, number>;
  }> {
    const decisions = await prisma.proposalDecision.findMany({
      where: agendaLevel ? { agendaLevel } : {},
      select: { decisionType: true }
    });

    const stats = {
      total: decisions.length,
      byType: {
        reject: 0,
        hold: 0,
        department_matter: 0,
        level_up_approved: 0
      } as Record<DecisionType, number>
    };

    decisions.forEach(d => {
      stats.byType[d.decisionType as DecisionType]++;
    });

    return stats;
  }
}

export const proposalDecisionService = ProposalDecisionService.getInstance();
```

---

## 🖼️ フロントエンド統合

### 統合箇所1: ProposalManagementPage.tsx

**ファイル:** `src/pages/ProposalManagementPage.tsx`

**修正箇所:** handleReject, handleHold, handleDepartmentMatter

**修正前（TODO実装）:**
```typescript
// Line 259-270
const handleReject = (post: Post, feedback: string) => {
  if (!activeUser) return;
  console.log('❌ [ProposalManagement] 却下:', {
    postId: post.id, feedback, userId: activeUser.id
  });
  // TODO: 実際のAPI実装
  alert(`却下しました。\n理由: ${feedback}`);
};
```

**修正後（API統合）:**
```typescript
const handleReject = async (post: Post, feedback: string) => {
  if (!activeUser) return;

  try {
    const response = await fetch(`/api/agenda/${post.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify({
        feedback,
        userId: activeUser.id,
        agendaLevel: post.agendaLevel
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '却下処理に失敗しました');
    }

    // 成功通知
    toast.success('提案を却下しました');

    // 投稿リストから削除（UI更新）
    setPosts(prev => prev.filter(p => p.id !== post.id));

    console.log('✅ [ProposalManagement] 却下完了:', data.decision);

  } catch (error) {
    console.error('❌ [ProposalManagement] 却下エラー:', error);
    toast.error(error instanceof Error ? error.message : '却下処理に失敗しました');
  }
};
```

**同様の修正を handleHold, handleDepartmentMatter にも適用**

---

### 統合箇所2: ProposalAnalysisCard.tsx

**ファイル:** `src/components/proposal/ProposalAnalysisCard.tsx`

**修正箇所:** onReject, onHold, onDepartmentMatter の呼び出し処理

**現在の実装（Line 708-714）:**
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

**修正後（ローディング状態追加）:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

// ...

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
  } finally {
    setIsSubmitting(false);
  }
}}
disabled={!actionFeedback.trim() || isSubmitting}
```

---

### 統合箇所3: 決定履歴表示コンポーネント（新規作成）

**ファイル:** `src/components/proposal/ProposalDecisionHistory.tsx`

**目的:** 投稿に対する決定履歴を表示

```typescript
import React, { useEffect, useState } from 'react';
import { ProposalDecision } from '@/types/proposalDecision';
import { Clock, CheckCircle, XCircle, Pause, FileText } from 'lucide-react';

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
      const response = await fetch(`/api/proposal-decisions/${postId}`);
      const data = await response.json();
      setDecisions(data.decisions || []);
    } catch (error) {
      console.error('Failed to fetch decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (decisions.length === 0) return <div>決定履歴はありません</div>;

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

---

## ✅ テストシナリオ

### テスト1: 却下機能

**テストケース:**
1. 期限切れ投稿を却下
2. 期限内投稿の却下を試みる（エラー）
3. 権限不足ユーザーの却下を試みる（エラー）
4. 却下後の通知確認
5. 却下後の投稿リスト更新確認

**期待結果:**
- ✅ 期限切れ投稿は正常に却下される
- ✅ ProposalDecisionレコードが作成される
- ✅ 投稿者へ通知が送信される
- ✅ 期限内投稿は却下できない（400エラー）
- ✅ 権限不足ユーザーは却下できない（403エラー）

---

### テスト2: 保留機能

**テストケース:**
1. 再検討日付ありで保留
2. 再検討日付なしで保留
3. 保留後の通知スケジュール確認
4. 再検討期限前日の通知確認

**期待結果:**
- ✅ 保留が正常に記録される
- ✅ reviewDate が設定される（指定時）
- ✅ 通知スケジュールが作成される
- ✅ 期限前日に通知が送信される

---

### テスト3: 部署案件化機能

**テストケース:**
1. DEPT_REVIEWレベルで部署案件化
2. FACILITY_AGENDAレベルで部署案件化を試みる（エラー）
3. 担当リーダー指定ありで部署案件化
4. 担当リーダーへの通知確認

**期待結果:**
- ✅ DEPT_REVIEW/DEPT_AGENDAレベルのみ可能
- ✅ targetDepartment が記録される
- ✅ 担当リーダーへ通知が送信される
- ✅ 他のレベルでは400エラー

---

### テスト4: 決定履歴表示

**テストケース:**
1. 複数の決定履歴を表示
2. 決定タイプごとのアイコン表示確認
3. 日時の正しいフォーマット確認

**期待結果:**
- ✅ 全決定履歴が時系列順に表示される
- ✅ 各決定タイプに対応したアイコンが表示される
- ✅ 日時が日本語形式で表示される

---

### テスト5: 権限チェック

**テストケース:**
1. Level 5ユーザーがPENDING投稿を却下
2. Level 6ユーザーがDEPT_REVIEW投稿を却下
3. Level 8ユーザーがDEPT_AGENDA投稿を却下
4. Level 5ユーザーがDEPT_REVIEW投稿を却下（エラー）

**期待結果:**
- ✅ 適切な権限レベルで却下可能
- ✅ 権限不足時は403エラー

---

### テスト6: エラーハンドリング

**テストケース:**
1. 存在しない投稿IDで却下を試みる
2. 必須パラメータ不足で却下を試みる
3. 無効なJWTトークンで却下を試みる

**期待結果:**
- ✅ 404 Not Found
- ✅ 400 Bad Request
- ✅ 401 Unauthorized

---

## 📊 実装進捗管理

### Phase 1: データベース実装

| タスク | 担当 | 期限 | ステータス |
|-------|------|------|----------|
| ProposalDecision テーブル設計 | - | - | ✅ 完了 |
| schema.prisma 更新 | - | - | ⏳ 未実施 |
| マイグレーション実行 | - | - | ⏳ 未実施 |
| Post/User リレーション追加 | - | - | ⏳ 未実施 |

---

### Phase 2: バックエンドAPI実装

| タスク | 担当 | 期限 | ステータス |
|-------|------|------|----------|
| 却下API実装 | - | - | ⏳ 未実施 |
| 保留API実装 | - | - | ⏳ 未実施 |
| 部署案件化API実装 | - | - | ⏳ 未実施 |
| ProposalDecisionService 実装 | - | - | ⏳ 未実施 |
| 型定義ファイル作成 | - | - | ⏳ 未実施 |

---

### Phase 3: フロントエンド統合

| タスク | 担当 | 期限 | ステータス |
|-------|------|------|----------|
| ProposalManagementPage 修正 | - | - | ⏳ 未実施 |
| ProposalAnalysisCard 修正 | - | - | ⏳ 未実施 |
| ProposalDecisionHistory 作成 | - | - | ⏳ 未実施 |
| エラーハンドリング追加 | - | - | ⏳ 未実施 |
| ローディング状態追加 | - | - | ⏳ 未実施 |

---

### Phase 4: テスト

| タスク | 担当 | 期限 | ステータス |
|-------|------|------|----------|
| 単体テスト（却下API） | - | - | ⏳ 未実施 |
| 単体テスト（保留API） | - | - | ⏳ 未実施 |
| 単体テスト（部署案件化API） | - | - | ⏳ 未実施 |
| 統合テスト | - | - | ⏳ 未実施 |
| 権限テスト | - | - | ⏳ 未実施 |
| エラーケーステスト | - | - | ⏳ 未実施 |

---

## 🎯 次のステップ

### 即座に実行（優先度 HIGH 🔴）

1. **schema.prisma 更新**
   ```bash
   # ProposalDecision テーブルを追加
   code prisma/schema.prisma
   ```

2. **マイグレーション実行**
   ```bash
   npx prisma db push
   # または
   npx prisma migrate dev --name add-proposal-decision-table
   ```

3. **型定義ファイル作成**
   ```bash
   touch src/types/proposalDecision.ts
   ```

4. **API実装開始**
   ```bash
   mkdir -p src/pages/api/agenda/[postId]
   touch src/pages/api/agenda/[postId]/reject.ts
   touch src/pages/api/agenda/[postId]/hold.ts
   touch src/pages/api/agenda/[postId]/department-matter.ts
   ```

5. **サービスクラス実装**
   ```bash
   touch src/services/ProposalDecisionService.ts
   ```

---

### 実装後の確認事項

- [ ] schema.prisma にProposalDecisionテーブルが追加されているか
- [ ] マイグレーションが成功したか
- [ ] Prisma Studioで新テーブルが確認できるか
- [ ] 3つのAPIエンドポイントが動作するか
- [ ] 通知が正しく送信されるか
- [ ] 権限チェックが正しく動作するか
- [ ] エラーハンドリングが適切か

---

## 📞 連絡先・質問

### VoiceDriveチーム内連絡

- Slack: #voicedrive-proposal-management
- 技術的な質問: プロジェクトリードまで
- DB設計レビュー: データベーススペシャリストまで

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
ステータス: 実装待ち（Phase 1準備完了）
