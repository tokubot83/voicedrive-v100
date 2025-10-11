# ProjectTracking（プロジェクト追跡）暫定マスターリスト

**文書番号**: VD-MASTER-PROJECT-TRACKING-20251011
**作成日**: 2025年10月11日
**対象ページ**: https://voicedrive-v100.vercel.app/project-tracking
**前提**: DB要件分析書（project-tracking_DB要件分析_20251011.md）に基づく

---

## 📋 エグゼクティブサマリー

### システム間責任分担

| 項目 | 医療システム | VoiceDrive | 備考 |
|------|------------|-----------|------|
| プロジェクト投稿管理 | ❌ | ✅ | VoiceDrive管轄（Post テーブル） |
| 投票管理 | ❌ | ✅ | VoiceDrive管轄（Vote テーブル） |
| コメント管理 | ❌ | ✅ | VoiceDrive管轄（Comment テーブル） |
| スコア計算 | ❌ | ✅ | フロントエンドで動的計算 |
| 職員情報 | ✅ | キャッシュ | 医療システムが管理 |

### 実装サマリー

- **医療システムAPI**: 0個（追加実装不要）
- **VoiceDrive新規テーブル**: 0個（既存テーブルで対応）
- **VoiceDrive新規API**: 4個
- **インデックス追加**: 2個（パフォーマンス最適化）

---

## 🏥 医療システム側の対応

### API要件

#### ✅ 既存API（追加実装不要）

**結論**: ProjectTrackingページは **医療システムAPIを使用しません**。

**理由**:
- プロジェクトデータは VoiceDrive 内部で完結
- 投票・コメントデータも VoiceDrive 管轄
- 職員情報は既に Post/Comment テーブルにキャッシュ済み

---

### 結論: 医療システム側の追加実装不要 ✅

ProjectTrackingページは **100% VoiceDrive内部で完結** します。

---

## 🗄️ VoiceDrive側のDB実装

### 既存テーブルの活用

ProjectTrackingページは **新規テーブル不要** です。既存の Post, Vote, Comment テーブルをそのまま使用します。

#### テーブル1: Post（既存）

```prisma
model Post {
  id                    String    @id @default(cuid())
  type                  String    // 'improvement' = プロジェクト
  content               String
  authorId              String
  anonymityLevel        String
  status                String    @default("active")
  proposalType          String?   // 'operational' | 'communication' | 'innovation' | 'strategic'
  priority              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  author                User      @relation("PostAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  votes                 Vote[]
  comments              Comment[]

  @@index([authorId])
  @@index([type])
  @@index([status])
  @@index([createdAt])

  // 🆕 パフォーマンス最適化用複合インデックス
  @@index([authorId, type, createdAt])  // 提案したプロジェクト高速取得用
}
```

**追加データ不要** - 既存フィールドで対応可能。

---

#### テーブル2: Vote（既存）

```prisma
model Vote {
  id        String    @id @default(cuid())
  postId    String
  userId    String
  option    String    // 'strongly-oppose' | 'oppose' | 'neutral' | 'support' | 'strongly-support'
  timestamp DateTime  @default(now())

  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User      @relation("PostVote", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])

  // 🆕 パフォーマンス最適化用複合インデックス
  @@index([userId, timestamp])  // 投票したプロジェクト高速取得用
}
```

**追加データ不要** - 既存フィールドで対応可能。

---

#### テーブル3: Comment（既存）

```prisma
model Comment {
  id              String    @id @default(cuid())
  postId          String
  parentId        String?
  authorId        String
  content         String
  commentType     String    // 'proposal' | 'question' | 'support' | 'concern'
  anonymityLevel  String
  privacyLevel    String?
  likes           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  post            Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent          Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies         Comment[] @relation("CommentReplies")
  author          User      @relation("CommentAuthor", fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([parentId])
  @@index([authorId])
}
```

**追加データ不要** - 既存フィールドで対応可能。

---

### パフォーマンス最適化: インデックス追加

#### インデックス1: Post複合インデックス

**目的**: 「提案したプロジェクト」タブのクエリ高速化

**追加インデックス**:
```prisma
@@index([authorId, type, createdAt])
```

**対象クエリ**:
```sql
SELECT * FROM posts
WHERE author_id = ? AND type = 'improvement' AND status = 'active'
ORDER BY created_at DESC
```

**効果**:
- クエリ実行時間を 80% 削減（推定）
- インデックスサイズ: 約 5MB（10万件の投稿想定）

---

#### インデックス2: Vote複合インデックス

**目的**: 「投票したプロジェクト」タブのクエリ高速化

**追加インデックス**:
```prisma
@@index([userId, timestamp])
```

**対象クエリ**:
```sql
SELECT DISTINCT post_id FROM votes
WHERE user_id = ?
ORDER BY timestamp DESC
```

**効果**:
- クエリ実行時間を 75% 削減（推定）
- インデックスサイズ: 約 3MB（50万件の投票想定）

---

## 🔄 Prismaマイグレーション

### マイグレーションファイル

```bash
# マイグレーション作成
npx prisma migrate dev --name add_project_tracking_indexes
```

**生成されるSQL** (`migrations/xxxxx_add_project_tracking_indexes/migration.sql`):

```sql
-- Post テーブルの複合インデックス追加
CREATE INDEX "Post_authorId_type_createdAt_idx" ON "posts"("author_id", "type", "created_at");

-- Vote テーブルの複合インデックス追加
CREATE INDEX "Vote_userId_timestamp_idx" ON "votes"("user_id", "timestamp");
```

**実行時間**: 約 5-10秒（データ量により変動）

---

## 🌐 VoiceDrive API実装

### API 1: GET /api/project-tracking/my-projects

**実装ファイル**: `src/app/api/project-tracking/my-projects/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 提案したプロジェクト取得
    const projects = await prisma.post.findMany({
      where: {
        authorId: userId,
        type: 'improvement',
        status: 'active'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true,
            permissionLevel: true
          }
        },
        votes: true,
        comments: {
          select: { id: true }  // コメント数のみ
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 投票集計
    const projectsWithVoteCounts = projects.map(project => ({
      ...project,
      votes: project.votes.reduce((acc, vote) => {
        acc[vote.option] = (acc[vote.option] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      commentCount: project.comments.length
    }));

    return NextResponse.json({
      projects: projectsWithVoteCounts,
      meta: {
        count: projectsWithVoteCounts.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API] Error fetching my projects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
```

---

### API 2: GET /api/project-tracking/voted-projects

**実装ファイル**: `src/app/api/project-tracking/voted-projects/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // ステップ1: 投票したプロジェクトIDを取得
    const votes = await prisma.vote.findMany({
      where: { userId },
      select: {
        postId: true,
        option: true  // 自分の投票オプション
      },
      distinct: ['postId'],
      orderBy: { timestamp: 'desc' }
    });

    if (votes.length === 0) {
      return NextResponse.json({ projects: [], meta: { count: 0 } });
    }

    const postIds = votes.map(v => v.postId);
    const myVoteMap = new Map(votes.map(v => [v.postId, v.option]));

    // ステップ2: プロジェクト情報を取得
    const projects = await prisma.post.findMany({
      where: {
        id: { in: postIds },
        type: 'improvement',
        status: 'active'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true,
            permissionLevel: true
          }
        },
        votes: true,
        comments: {
          select: { id: true }
        }
      }
    });

    // 投票集計 + 自分の投票を追加
    const projectsWithVoteCounts = projects.map(project => ({
      ...project,
      votes: project.votes.reduce((acc, vote) => {
        acc[vote.option] = (acc[vote.option] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      myVote: myVoteMap.get(project.id),  // 自分の投票
      commentCount: project.comments.length
    }));

    return NextResponse.json({
      projects: projectsWithVoteCounts,
      meta: {
        count: projectsWithVoteCounts.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API] Error fetching voted projects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
```

---

### API 3: GET /api/project-tracking/joined-projects

**実装ファイル**: `src/app/api/project-tracking/joined-projects/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // ステップ1: コメントしたプロジェクトIDを取得
    const comments = await prisma.comment.findMany({
      where: { authorId: userId },
      select: { postId: true },
      distinct: ['postId'],
      orderBy: { createdAt: 'desc' }
    });

    if (comments.length === 0) {
      return NextResponse.json({ projects: [], meta: { count: 0 } });
    }

    const postIds = comments.map(c => c.postId);

    // ステップ2: プロジェクト情報を取得
    const projects = await prisma.post.findMany({
      where: {
        id: { in: postIds },
        type: 'improvement',
        status: 'active'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true,
            permissionLevel: true
          }
        },
        votes: true,
        comments: {
          where: { authorId: userId },  // 自分のコメントのみ
          take: 1,  // 最新1件
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { comments: true }  // 全コメント数
        }
      }
    });

    // 投票集計 + コメント情報
    const projectsWithData = projects.map(project => ({
      ...project,
      votes: project.votes.reduce((acc, vote) => {
        acc[vote.option] = (acc[vote.option] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      myComments: project.comments,  // 自分のコメント
      commentCount: project._count.comments  // 全コメント数
    }));

    return NextResponse.json({
      projects: projectsWithData,
      meta: {
        count: projectsWithData.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API] Error fetching joined projects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
```

---

### API 4: GET /api/project-tracking/stats

**実装ファイル**: `src/app/api/project-tracking/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 並列実行で高速化
    const [myPostsCount, votedProjects, commentedProjects, myProjects] = await Promise.all([
      // 提案数
      prisma.post.count({
        where: {
          authorId: userId,
          type: 'improvement',
          status: 'active'
        }
      }),

      // 投票数（ユニークなプロジェクト）
      prisma.vote.findMany({
        where: { userId },
        select: { postId: true },
        distinct: ['postId']
      }),

      // コメント数（ユニークなプロジェクト）
      prisma.comment.findMany({
        where: { authorId: userId },
        select: { postId: true },
        distinct: ['postId']
      }),

      // 達成数計算用（自分が提案したプロジェクト）
      prisma.post.findMany({
        where: {
          authorId: userId,
          type: 'improvement',
          status: 'active'
        },
        include: {
          votes: true
        }
      })
    ]);

    // 達成数計算（スコア100以上）
    const achievedCount = myProjects.filter(project => {
      const score = calculateProjectScore(project.votes);
      return score >= 100;
    }).length;

    return NextResponse.json({
      myPostsCount,
      votedPostsCount: votedProjects.length,
      commentedPostsCount: commentedProjects.length,
      achievedCount,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

// スコア計算ヘルパー
function calculateProjectScore(votes: any[]): number {
  const voteWeights = {
    'strongly-support': 2,
    'support': 1,
    'neutral': 0,
    'oppose': -1,
    'strongly-oppose': -2
  };

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.option] = (acc[vote.option] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalScore = Object.entries(voteCounts).reduce((sum, [option, count]) => {
    return sum + (voteWeights[option] || 0) * count;
  }, 0);

  return Math.max(0, totalScore);
}
```

---

## 📅 実装スケジュール

### Week 1: DB最適化・API実装（3日間）

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| Day 1 | 複合インデックス追加 | Backend | ⏳ |
| Day 1 | マイグレーション実行 | Backend | ⏳ |
| Day 2 | API実装（4エンドポイント） | Backend | ⏳ |
| Day 3 | APIテスト | Backend | ⏳ |

### Week 2: フロントエンド統合（1日間）

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| Day 4 | ページ修正・API統合 | Frontend | ⏳ |
| Day 4 | E2Eテスト | Full Stack | ⏳ |

---

## ✅ 統合チェックリスト

### データベース
- [ ] Post複合インデックス追加（authorId, type, createdAt）
- [ ] Vote複合インデックス追加（userId, timestamp）
- [ ] マイグレーション実行成功
- [ ] インデックス効果測定

### API
- [ ] GET /api/project-tracking/my-projects 実装完了
- [ ] GET /api/project-tracking/voted-projects 実装完了
- [ ] GET /api/project-tracking/joined-projects 実装完了
- [ ] GET /api/project-tracking/stats 実装完了
- [ ] 認証ミドルウェア実装
- [ ] エラーハンドリング実装

### フロントエンド
- [ ] useProjectTracking() カスタムフック実装
- [ ] デモデータ削除
- [ ] API呼び出し統合
- [ ] ローディング状態実装
- [ ] エラー表示実装

### テスト
- [ ] ユニットテスト完了
- [ ] API統合テスト完了
- [ ] E2Eテスト完了
- [ ] パフォーマンステスト完了

---

## 🔗 関連ドキュメント

1. **DB要件分析書**: `project-tracking_DB要件分析_20251011.md`
2. **データ管理責任分界点定義書**: `データ管理責任分界点定義書_20251008.md`
3. **既存Post/Vote/Commentスキーマ**: `prisma/schema.prisma`

---

## 📞 医療システムチームへの確認依頼事項

### ✅ 確認事項

1. **医療システムAPI不要の確認**
   - ProjectTrackingページは VoiceDrive内部で完結
   - 医療システムからの新規API提供は不要で問題ないか？

2. **既存データ活用の確認**
   - Post/Vote/Commentテーブルのみで実装
   - 医療システム側のデータ連携は不要で問題ないか？

3. **追加実装不要の確認**
   - ProjectTrackingページは **VoiceDrive単独で完結** で問題ないか？

---

## 🎨 フロントエンド実装推奨事項

### useProjectTracking カスタムフック

```typescript
// VoiceDrive: hooks/useProjectTracking.ts
import useSWR from 'swr';

interface UseProjectTrackingOptions {
  tab: 'posted' | 'voted' | 'joined';
}

export const useProjectTracking = (options: UseProjectTrackingOptions) => {
  const endpoint = {
    posted: '/api/project-tracking/my-projects',
    voted: '/api/project-tracking/voted-projects',
    joined: '/api/project-tracking/joined-projects'
  }[options.tab];

  const { data, error, mutate, isLoading } = useSWR(
    endpoint,
    fetcher,
    {
      refreshInterval: 30000,  // 30秒ごとに自動更新
      revalidateOnFocus: true
    }
  );

  // 統計データも取得
  const { data: stats } = useSWR('/api/project-tracking/stats', fetcher, {
    refreshInterval: 60000  // 1分ごとに自動更新
  });

  return {
    projects: data?.projects || [],
    stats: stats || {
      myPostsCount: 0,
      votedPostsCount: 0,
      commentedPostsCount: 0,
      achievedCount: 0
    },
    isLoading,
    isError: error,
    refresh: mutate
  };
};
```

### ProjectTracking.tsx修正例

```typescript
// VoiceDrive: pages/ProjectTracking.tsx
import { useProjectTracking } from '../hooks/useProjectTracking';

export const ProjectTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posted' | 'voted' | 'joined'>('posted');

  const { projects, stats, isLoading, isError, refresh } = useProjectTracking({
    tab: activeTab
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorMessage onRetry={refresh} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Rocket className="w-10 h-10" />
          プロジェクトの追跡
        </h1>
        <p className="text-gray-300">
          プロジェクト化モードでの活動状況
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="mx-6 mb-6">
        <TrackingStats
          myPostsCount={stats.myPostsCount}
          votedPostsCount={stats.votedPostsCount}
          commentedPostsCount={stats.commentedPostsCount}
          achievedCount={stats.achievedCount}
        />
      </div>

      {/* タブナビゲーション */}
      <div className="mx-6 mb-6">
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-2">
          <button
            onClick={() => setActiveTab('posted')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'posted'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            🚀 提案したプロジェクト
          </button>
          <button
            onClick={() => setActiveTab('voted')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'voted'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            🗳️ 投票したプロジェクト
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base
              ${activeTab === 'joined'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
              }
            `}
          >
            👥 参加したプロジェクト
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="mx-6 pb-24">
        <div className="space-y-4">
          {projects.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            projects.map(project => (
              <TrackingPostCard
                key={project.id}
                post={project}
                postData={getPostData(project)}
                viewType={activeTab === 'posted' ? 'posted' : activeTab === 'voted' ? 'voted' : 'commented'}
              />
            ))
          )}
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};
```

---

## 📝 パフォーマンステスト計画

### テストケース1: 提案したプロジェクト取得

**条件**:
- ユーザーが100件のプロジェクトを提案済み
- 各プロジェクトに平均50件の投票

**目標**:
- API応答時間: < 500ms
- フロントエンド表示完了: < 1秒

**測定方法**:
```bash
# Apache Bench
ab -n 100 -c 10 http://localhost:3001/api/project-tracking/my-projects
```

---

### テストケース2: 投票したプロジェクト取得

**条件**:
- ユーザーが500件のプロジェクトに投票済み

**目標**:
- API応答時間: < 800ms
- フロントエンド表示完了: < 1.5秒

---

### テストケース3: 統計サマリー取得

**条件**:
- ユーザーが100件提案、500件投票、200件コメント

**目標**:
- API応答時間: < 300ms

---

**文書終了**

最終更新: 2025年10月11日
次のステップ: schema.prisma更新（インデックス追加）
