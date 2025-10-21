# 提案レビューページ 暫定マスターリスト

**文書番号**: API-SPEC-2025-1021-006
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**対象ページ**: 提案レビューページ（ProposalReviewPage.tsx）
**関連文書**: ProposalReviewPage_DB要件分析_20251021.md

---

## 📋 目次

1. [API一覧](#1-api一覧)
2. [API詳細仕様](#2-api詳細仕様)
3. [データモデル](#3-データモデル)
4. [エラーコード](#4-エラーコード)
5. [認証・認可](#5-認証認可)
6. [実装例](#6-実装例)

---

## 1. API一覧

| No | メソッド | エンドポイント | 説明 | 優先度 | 実装状況 |
|----|---------|--------------|------|--------|---------|
| 1 | POST | `/api/proposal-review/:postId` | 提案レビュー判断を送信 | 🔴 高 | ⏳ 未実装 |
| 2 | GET | `/api/proposal-review/:postId/history` | レビュー履歴を取得 | 🟡 中 | ⏳ 未実装 |
| 3 | GET | `/api/proposal-review/pending` | レビュー待ち提案一覧を取得 | 🟡 中 | ⏳ 未実装 |
| 4 | GET | `/api/posts/:postId` | 提案詳細を取得（拡張） | 🔴 高 | ⚠️ 拡張必要 |

---

## 2. API詳細仕様

### API 1: 提案レビュー判断送信

#### 基本情報

- **エンドポイント**: `POST /api/proposal-review/:postId`
- **説明**: 部署議題（50点到達）に対する判断を記録する
- **認証**: 必須（Bearer Token）
- **権限**: permissionLevel >= 5.0（主任以上）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|----|----|------|
| `postId` | string | ✅ | 対象提案のID |

#### リクエストボディ

```typescript
interface ProposalReviewRequest {
  action: 'approve_as_dept_agenda' | 'escalate_to_facility' | 'reject';
  reason: string;      // 10-500文字
  comment?: string;    // 0-300文字（承認時のみ使用）
  reviewerId: string;  // レビュー実施者のユーザーID
}
```

**フィールド詳細**:

| フィールド | 型 | 必須 | 制約 | 説明 |
|-----------|----|----|------|------|
| `action` | string | ✅ | enum値 | 判断内容 |
| `reason` | string | ✅ | 10-500文字 | 判断理由 |
| `comment` | string | ❌ | 0-300文字 | 承認コメント（承認時のみ） |
| `reviewerId` | string | ✅ | - | レビュー実施者ID |

**action値の定義**:

| 値 | 説明 | 後続処理 |
|----|------|---------|
| `approve_as_dept_agenda` | 部署議題として承認 | Post.agendaStatus = "APPROVED_AS_DEPT_AGENDA" |
| `escalate_to_facility` | 施設議題に昇格 | Post.agendaStatus = "ESCALATED_TO_FACILITY"<br/>Post.agendaLevel = "facility" |
| `reject` | 却下 | Post.agendaStatus = "REJECTED"<br/>Post.status = "archived" |

#### リクエスト例

```json
{
  "action": "approve_as_dept_agenda",
  "reason": "職員の多くが賛成しており、部署で議論する価値があると判断しました。投票結果も賛成が15票と多数を占めています。",
  "comment": "次回の部署ミーティングで前向きに検討しましょう。",
  "reviewerId": "user_clh123456"
}
```

#### レスポンス（成功時）

**ステータスコード**: `200 OK`

```typescript
interface ProposalReviewResponse {
  success: boolean;
  review: {
    id: string;
    postId: string;
    action: string;
    reason: string;
    comment?: string;
    reviewedAt: string;  // ISO 8601形式
    reviewer: {
      id: string;
      name: string;
      permissionLevel: number;
      department: string;
    };
  };
  post: {
    id: string;
    agendaStatus: string;
    agendaDecisionBy: string;
    agendaDecisionAt: string;
    agendaDecisionReason: string;
  };
  message: string;
}
```

**レスポンス例**:

```json
{
  "success": true,
  "review": {
    "id": "review_clh789012",
    "postId": "post_clh345678",
    "action": "approve_as_dept_agenda",
    "reason": "職員の多くが賛成しており、部署で議論する価値があると判断しました。",
    "comment": "次回の部署ミーティングで前向きに検討しましょう。",
    "reviewedAt": "2025-10-21T10:30:00.000Z",
    "reviewer": {
      "id": "user_clh123456",
      "name": "山田太郎",
      "permissionLevel": 7.0,
      "department": "看護部-看護科"
    }
  },
  "post": {
    "id": "post_clh345678",
    "agendaStatus": "APPROVED_AS_DEPT_AGENDA",
    "agendaDecisionBy": "user_clh123456",
    "agendaDecisionAt": "2025-10-21T10:30:00.000Z",
    "agendaDecisionReason": "職員の多くが賛成しており、部署で議論する価値があると判断しました。"
  },
  "message": "判断を記録しました"
}
```

#### レスポンス（エラー時）

**ステータスコード**: `400 Bad Request`

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "判断理由は10文字以上入力してください",
  "details": {
    "field": "reason",
    "minLength": 10,
    "currentLength": 5
  }
}
```

**その他のエラー**:

| ステータス | エラーコード | メッセージ | 原因 |
|-----------|------------|-----------|------|
| 400 | `VALIDATION_ERROR` | 入力値が不正です | バリデーション失敗 |
| 401 | `UNAUTHORIZED` | 認証が必要です | トークンなし・無効 |
| 403 | `FORBIDDEN` | この操作の権限がありません | permissionLevel < 5.0 |
| 404 | `POST_NOT_FOUND` | 提案が見つかりません | postIdが存在しない |
| 409 | `ALREADY_REVIEWED` | この提案は既にレビュー済みです | 重複レビュー |
| 500 | `INTERNAL_ERROR` | サーバーエラーが発生しました | サーバー側エラー |

#### 処理フロー

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB
    participant Notification

    Client->>API: POST /api/proposal-review/:postId
    API->>Auth: トークン検証
    Auth->>API: ユーザー情報
    API->>API: 権限チェック (permissionLevel >= 5.0)
    API->>API: バリデーション
    API->>DB: Post取得（存在確認）
    API->>DB: ProposalReview作成
    API->>DB: Post更新（agendaStatus等）
    DB->>API: 更新完了
    API->>Notification: 通知送信（投稿者、関係者）
    API->>Client: レスポンス返却
```

#### バリデーションルール

| フィールド | ルール | エラーメッセージ |
|-----------|-------|----------------|
| `action` | 必須、enum値 | "判断を選択してください" |
| `reason` | 必須、10-500文字 | "判断理由は10文字以上500文字以内で入力してください" |
| `comment` | 任意、0-300文字 | "コメントは300文字以内で入力してください" |
| `reviewerId` | 必須、存在するユーザーID | "レビュー実施者が不正です" |
| `postId` | 必須、存在するPost | "提案が見つかりません" |
| `user.permissionLevel` | >= 5.0 | "この操作には主任以上の権限が必要です" |

---

### API 2: レビュー履歴取得

#### 基本情報

- **エンドポイント**: `GET /api/proposal-review/:postId/history`
- **説明**: 特定の提案に対するレビュー履歴を取得
- **認証**: 必須（Bearer Token）
- **権限**: 認証済みユーザー

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|----|----|------|
| `postId` | string | ✅ | 対象提案のID |

#### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|----|----|----------|------|
| `limit` | number | ❌ | 10 | 取得件数 |
| `offset` | number | ❌ | 0 | オフセット |

#### レスポンス（成功時）

**ステータスコード**: `200 OK`

```typescript
interface ProposalReviewHistoryResponse {
  postId: string;
  reviews: Array<{
    id: string;
    action: string;
    reason: string;
    comment?: string;
    reviewedAt: string;
    agendaScoreAtReview: number;
    voteCountAtReview: {
      approve: number;
      neutral: number;
      oppose: number;
    };
    reviewer: {
      id: string;
      name: string;
      permissionLevel: number;
      department: string;
    };
    status: string;  // 'active' | 'superseded'
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

**レスポンス例**:

```json
{
  "postId": "post_clh345678",
  "reviews": [
    {
      "id": "review_clh789012",
      "action": "approve_as_dept_agenda",
      "reason": "職員の多くが賛成しており、部署で議論する価値があると判断しました。",
      "comment": "次回の部署ミーティングで前向きに検討しましょう。",
      "reviewedAt": "2025-10-21T10:30:00.000Z",
      "agendaScoreAtReview": 52,
      "voteCountAtReview": {
        "approve": 15,
        "neutral": 3,
        "oppose": 2
      },
      "reviewer": {
        "id": "user_clh123456",
        "name": "山田太郎",
        "permissionLevel": 7.0,
        "department": "看護部-看護科"
      },
      "status": "active"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### API 3: レビュー待ち提案一覧取得

#### 基本情報

- **エンドポイント**: `GET /api/proposal-review/pending`
- **説明**: レビューが必要な提案（50点到達済み、未レビュー）の一覧を取得
- **認証**: 必須（Bearer Token）
- **権限**: permissionLevel >= 5.0（主任以上）

#### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|----|----|----------|------|
| `department` | string | ❌ | - | 部署フィルター |
| `page` | number | ❌ | 1 | ページ番号 |
| `limit` | number | ❌ | 20 | 1ページあたりの件数 |
| `sortBy` | string | ❌ | 'agendaScore' | ソート基準 |
| `order` | string | ❌ | 'desc' | ソート順（asc/desc） |

#### レスポンス（成功時）

**ステータスコード**: `200 OK`

```typescript
interface PendingProposalsResponse {
  posts: Array<{
    id: string;
    content: string;
    agendaScore: number;
    author: {
      id: string;
      name: string;
      department: string;
    };
    createdAt: string;
    requiresReview: boolean;
    reviewDeadline?: string;
    voteCount: {
      approve: number;
      neutral: number;
      oppose: number;
    };
    latestReview?: {
      action: string;
      reviewedAt: string;
      reviewerName: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

**レスポンス例**:

```json
{
  "posts": [
    {
      "id": "post_clh345678",
      "content": "勤務シフトの改善について提案します",
      "agendaScore": 52,
      "author": {
        "id": "user_clh999999",
        "name": "佐藤花子",
        "department": "看護部-看護科"
      },
      "createdAt": "2025-10-15T08:00:00.000Z",
      "requiresReview": true,
      "reviewDeadline": "2025-10-25T23:59:59.000Z",
      "voteCount": {
        "approve": 15,
        "neutral": 3,
        "oppose": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

### API 4: 提案詳細取得（拡張）

#### 基本情報

- **エンドポイント**: `GET /api/posts/:postId`
- **説明**: 提案の詳細情報を取得（既存APIを拡張）
- **認証**: 必須（Bearer Token）
- **権限**: 認証済みユーザー

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|----|----|------|
| `postId` | string | ✅ | 提案ID |

#### レスポンス（成功時）

**ステータスコード**: `200 OK`

**拡張フィールド**:

```typescript
interface PostDetailResponse {
  // ... 既存フィールド

  // 🆕 追加フィールド
  latestReview?: {
    id: string;
    action: string;
    reason: string;
    comment?: string;
    reviewedAt: string;
    reviewer: {
      id: string;
      name: string;
      permissionLevel: number;
      department: string;
    };
  };
  reviewHistory: Array<{
    action: string;
    reviewedAt: string;
    reviewerName: string;
  }>;
}
```

**レスポンス例**:

```json
{
  "id": "post_clh345678",
  "content": "勤務シフトの改善について提案します",
  "agendaScore": 52,
  "author": {
    "id": "user_clh999999",
    "name": "佐藤花子",
    "department": "看護部-看護科"
  },
  "pollResult": {
    "results": [
      { "option": { "text": "賛成" }, "votes": 15 },
      { "option": { "text": "中立" }, "votes": 3 },
      { "option": { "text": "反対" }, "votes": 2 }
    ]
  },
  "latestReview": {
    "id": "review_clh789012",
    "action": "approve_as_dept_agenda",
    "reason": "職員の多くが賛成しており、部署で議論する価値があると判断しました。",
    "comment": "次回の部署ミーティングで前向きに検討しましょう。",
    "reviewedAt": "2025-10-21T10:30:00.000Z",
    "reviewer": {
      "id": "user_clh123456",
      "name": "山田太郎",
      "permissionLevel": 7.0,
      "department": "看護部-看護科"
    }
  },
  "reviewHistory": [
    {
      "action": "approve_as_dept_agenda",
      "reviewedAt": "2025-10-21T10:30:00.000Z",
      "reviewerName": "山田太郎"
    }
  ]
}
```

---

## 3. データモデル

### ProposalReview

```typescript
interface ProposalReview {
  id: string;
  postId: string;
  reviewerId: string;
  action: 'approve_as_dept_agenda' | 'escalate_to_facility' | 'reject';
  reason: string;
  comment?: string;
  reviewedAt: Date;
  agendaScoreAtReview: number;
  voteCountAtReview: {
    approve: number;
    neutral: number;
    oppose: number;
  };
  reviewerPermissionLevel: number;
  reviewerDepartment: string;
  status: 'active' | 'superseded';
  createdAt: Date;
  updatedAt: Date;

  // Relations
  post: Post;
  reviewer: User;
}
```

---

## 4. エラーコード

### 4.1 クライアントエラー（4xx）

| コード | HTTPステータス | エラーコード | 説明 | 対処方法 |
|-------|--------------|------------|------|---------|
| 400 | Bad Request | `VALIDATION_ERROR` | 入力値が不正 | 入力値を確認して再送信 |
| 400 | Bad Request | `INVALID_ACTION` | 判断内容が不正 | 正しいaction値を使用 |
| 400 | Bad Request | `REASON_TOO_SHORT` | 理由が短すぎる | 10文字以上入力 |
| 400 | Bad Request | `REASON_TOO_LONG` | 理由が長すぎる | 500文字以内に収める |
| 401 | Unauthorized | `UNAUTHORIZED` | 認証が必要 | ログインして再試行 |
| 401 | Unauthorized | `TOKEN_EXPIRED` | トークンの有効期限切れ | 再ログインしてトークン取得 |
| 403 | Forbidden | `FORBIDDEN` | 権限不足 | 主任以上の権限が必要 |
| 403 | Forbidden | `INSUFFICIENT_PERMISSION` | 権限レベル不足 | permissionLevel >= 5.0が必要 |
| 404 | Not Found | `POST_NOT_FOUND` | 提案が見つからない | postIdを確認 |
| 404 | Not Found | `USER_NOT_FOUND` | ユーザーが見つからない | reviewerIdを確認 |
| 409 | Conflict | `ALREADY_REVIEWED` | 既にレビュー済み | 重複レビュー不可 |
| 409 | Conflict | `SCORE_NOT_REACHED` | スコア未到達 | 50点到達後にレビュー可能 |

### 4.2 サーバーエラー（5xx）

| コード | HTTPステータス | エラーコード | 説明 |
|-------|--------------|------------|------|
| 500 | Internal Server Error | `INTERNAL_ERROR` | サーバー内部エラー |
| 500 | Internal Server Error | `DATABASE_ERROR` | データベースエラー |
| 503 | Service Unavailable | `SERVICE_UNAVAILABLE` | サービス一時停止中 |

---

## 5. 認証・認可

### 5.1 認証方式

**Bearer Token認証**:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 権限レベル

| 機能 | 必要な権限レベル | 対象ユーザー |
|------|----------------|-------------|
| レビュー実施 | permissionLevel >= 5.0 | 主任、師長、部長以上 |
| レビュー履歴閲覧 | 認証済み | 全ユーザー |
| レビュー待ち一覧 | permissionLevel >= 5.0 | 主任、師長、部長以上 |

---

## 6. 実装例

### 6.1 フロントエンド実装例

```typescript
// 提案レビュー送信
async function submitProposalReview(
  postId: string,
  action: string,
  reason: string,
  comment?: string
) {
  const response = await fetch(`/api/proposal-review/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      action,
      reason,
      comment,
      reviewerId: user.id
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

### 6.2 バックエンド実装例（Next.js API Route）

```typescript
// pages/api/proposal-review/[postId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postId } = req.query;
    const { action, reason, comment, reviewerId } = req.body;

    // 権限チェック
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId }
    });

    if (!reviewer || reviewer.permissionLevel < 5.0) {
      return res.status(403).json({
        error: 'INSUFFICIENT_PERMISSION',
        message: 'この操作には主任以上の権限が必要です'
      });
    }

    // バリデーション
    if (!action || !reason) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '判断と理由を入力してください'
      });
    }

    if (reason.length < 10 || reason.length > 500) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: '判断理由は10文字以上500文字以内で入力してください'
      });
    }

    // Post取得
    const post = await prisma.post.findUnique({
      where: { id: postId as string },
      include: { poll: true }
    });

    if (!post) {
      return res.status(404).json({
        error: 'POST_NOT_FOUND',
        message: '提案が見つかりません'
      });
    }

    // 投票数集計
    const voteCount = {
      approve: post.poll?.results?.find((r: any) => r.option.text === '賛成')?.votes || 0,
      neutral: post.poll?.results?.find((r: any) => r.option.text === '中立')?.votes || 0,
      oppose: post.poll?.results?.find((r: any) => r.option.text === '反対')?.votes || 0
    };

    // ProposalReview作成
    const review = await prisma.proposalReview.create({
      data: {
        postId: postId as string,
        reviewerId,
        action,
        reason,
        comment,
        agendaScoreAtReview: post.agendaScore || 0,
        voteCountAtReview: voteCount,
        reviewerPermissionLevel: reviewer.permissionLevel,
        reviewerDepartment: reviewer.department || '',
        status: 'active'
      }
    });

    // Post更新
    const agendaStatusMap = {
      'approve_as_dept_agenda': 'APPROVED_AS_DEPT_AGENDA',
      'escalate_to_facility': 'ESCALATED_TO_FACILITY',
      'reject': 'REJECTED'
    };

    const updatedPost = await prisma.post.update({
      where: { id: postId as string },
      data: {
        agendaStatus: agendaStatusMap[action],
        agendaDecisionBy: reviewerId,
        agendaDecisionAt: new Date(),
        agendaDecisionReason: reason,
        ...(action === 'escalate_to_facility' && { agendaLevel: 'facility' }),
        ...(action === 'reject' && {
          status: 'archived',
          rejectedAt: new Date(),
          rejectedBy: reviewerId,
          rejectionReason: reason
        })
      }
    });

    return res.status(200).json({
      success: true,
      review: {
        id: review.id,
        postId: review.postId,
        action: review.action,
        reviewedAt: review.reviewedAt,
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          permissionLevel: reviewer.permissionLevel,
          department: reviewer.department
        }
      },
      post: {
        id: updatedPost.id,
        agendaStatus: updatedPost.agendaStatus,
        agendaDecisionBy: updatedPost.agendaDecisionBy,
        agendaDecisionAt: updatedPost.agendaDecisionAt
      },
      message: '判断を記録しました'
    });

  } catch (error) {
    console.error('Error in proposal review:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました'
    });
  }
}
```

---

## 7. テストケース

### 7.1 正常系テスト

| No | テストケース | 期待結果 |
|----|-----------|---------|
| 1 | 部署議題として承認 | ProposalReview作成、Post.agendaStatus更新 |
| 2 | 施設議題に昇格 | ProposalReview作成、Post.agendaLevel更新 |
| 3 | 却下 | ProposalReview作成、Post.status = archived |
| 4 | レビュー履歴取得 | レビュー履歴を正しく取得 |
| 5 | レビュー待ち一覧取得 | 50点以上の未レビュー提案を取得 |

### 7.2 異常系テスト

| No | テストケース | 期待エラー |
|----|-----------|-----------|
| 1 | 理由が9文字 | VALIDATION_ERROR |
| 2 | actionが不正 | INVALID_ACTION |
| 3 | 権限不足（Level 4） | INSUFFICIENT_PERMISSION |
| 4 | 存在しないpostId | POST_NOT_FOUND |
| 5 | 認証なし | UNAUTHORIZED |

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
