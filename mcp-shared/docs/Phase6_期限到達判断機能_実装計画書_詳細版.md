# Phase 6: 期限到達判断機能 実装計画書（詳細版）

**作成日**: 2025年10月20日
**対象**: VoiceDrive Phase 6 - 期限到達判断機能
**ステータス**: 一部完了、バックエンドAPI実装待ち

---

## 📊 現在の進捗状況

### ✅ 完了済み（2025年8月10日）

#### 1. Cron Job実装 (commit: 297978f)
**ファイル**: `src/jobs/expiredEscalationCheckJob.ts`

**機能**:
- 日次9AM自動チェック（node-cron使用）
- 期限到達提案の検出
- マネージャーごとにグルーピング
- アプリ内通知送信
- 手動実行機能（テスト用）

**実装内容**:
```typescript
// 主要機能
- checkExpiredEscalations(): 期限到達提案を検出
- groupByManager(): マネージャーごとにグルーピング
- generateNotificationMessage(): 通知メッセージ生成
- startExpiredEscalationJob(): Cron Job開始
- runExpiredEscalationCheckNow(): 手動実行
```

#### 2. 判断履歴ページUI実装 (commit: 5b4cdc9)
**ファイル**: `src/components/agenda-mode/ExpiredEscalationHistoryPage.tsx`

**機能**:
- 権限レベル別の判断履歴表示
- サマリー統計カード（総件数、承認率、平均判断日数等）
- 判断履歴一覧（詳細情報付き）
- レスポンシブデザイン

**表示範囲**:
- LEVEL_1-4: 自分の提案履歴
- LEVEL_5-6: 自分の判断履歴+チーム統計
- LEVEL_7-8: 部署統計
- LEVEL_9-13: 施設全体統計
- LEVEL_14-18: 法人全体統計

#### 3. モックデータ実装 (commit: 297978f)
**ファイル**: `src/data/mockExpiredEscalationHistory.ts`

**内容**:
- TypeScript型定義（ExpiredEscalationHistoryItem, Summary等）
- 全権限レベル対応のサンプルデータ
- getMockExpiredEscalationHistory()関数

#### 4. ルーティング・サイドバー統合 (commit: 5b4cdc9)
**変更ファイル**:
- `src/router/AppRouter.tsx`: `/expired-escalation-history`ルート追加
- `src/components/sidebar/AgendaModeSidebar.tsx`: 判断履歴ボタン追加

#### 5. ドキュメント整備 (commit: f147d6e)
**作成ファイル**:
- `docs/cron-job-setup.md`: Cron Job設定ガイド
- `docs/expired-escalation-report-access-levels.md`: 権限レベル定義
- `docs/phase6-expired-escalation-history-integration-request.md`: 医療チーム向けAPI仕様
- `docs/phase6-voicedrive-remaining-tasks.md`: 残作業計画

---

## 🚧 残りの実装作業

### Phase 1: バックエンドAPI実装（見積もり: 3.5日）

#### 1.1 Prisma Schema拡張（見積もり: 0.5日）

**ファイル**: `prisma/schema.prisma`

**追加内容**:
```prisma
// 期限到達判断履歴モデル
model ExpiredEscalationDecision {
  id                String   @id @default(uuid())

  // 関連
  postId            String
  post              Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  deciderId         String
  decider           User     @relation(name: "ExpiredDecisions", fields: [deciderId], references: [id])

  // 判断内容
  decision          String   // 'approve_at_current_level' | 'downgrade' | 'reject'
  decisionReason    String   @db.Text

  // スコア情報
  currentScore      Int
  targetScore       Int
  achievementRate   Float
  daysOverdue       Int

  // メタデータ
  agendaLevel       String
  proposalType      String?
  department        String?
  facilityId        String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([postId])
  @@index([deciderId])
  @@index([facilityId])
  @@index([createdAt])
  @@index([decision])
  @@map("expired_escalation_decisions")
}
```

**Postモデルへの追加**:
```prisma
model Post {
  // ... 既存フィールド

  // 期限到達判断履歴
  expiredEscalationDecisions ExpiredEscalationDecision[]
}
```

**Userモデルへの追加**:
```prisma
model User {
  // ... 既存フィールド

  // 期限到達判断履歴（判断者として）
  expiredDecisions ExpiredEscalationDecision[] @relation("ExpiredDecisions")
}
```

**実装手順**:
1. `prisma/schema.prisma`を編集
2. マイグレーション作成: `npx prisma migrate dev --name add_expired_escalation_decision`
3. Prisma Client再生成: `npx prisma generate`
4. 型定義の確認

**テスト**:
- [ ] マイグレーション成功確認
- [ ] Prisma Studioでテーブル確認
- [ ] TypeScript型エラーがないか確認

---

#### 1.2 期限到達判断API関数作成（見積もり: 2日）

**ファイル**: `src/api/expiredEscalationDecision.ts`（新規作成）

**実装内容**:

##### A. 判断記録API
```typescript
/**
 * 期限到達提案の判断を記録
 */
export async function recordExpiredEscalationDecision(params: {
  postId: string;
  decision: 'approve_at_current_level' | 'downgrade' | 'reject';
  deciderId: string;
  decisionReason: string;
  currentScore: number;
  targetScore: number;
  agendaLevel: string;
  daysOverdue: number;
}): Promise<{
  success: boolean;
  decisionId?: string;
  error?: string;
}> {
  try {
    // 1. 権限チェック: deciderId が実際の管理者か確認
    const decider = await prisma.user.findUnique({
      where: { id: params.deciderId },
      select: { permissionLevel: true, department: true }
    });

    if (!decider || decider.permissionLevel < 5) {
      return { success: false, error: '判断権限がありません' };
    }

    // 2. 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: {
        id: true,
        agendaLevel: true,
        department: true,
        facilityId: true,
        proposalType: true
      }
    });

    if (!post) {
      return { success: false, error: '投稿が見つかりません' };
    }

    // 3. 到達率計算
    const achievementRate = (params.currentScore / params.targetScore) * 100;

    // 4. 判断記録をDB保存
    const decision = await prisma.expiredEscalationDecision.create({
      data: {
        postId: params.postId,
        deciderId: params.deciderId,
        decision: params.decision,
        decisionReason: params.decisionReason,
        currentScore: params.currentScore,
        targetScore: params.targetScore,
        achievementRate: achievementRate,
        daysOverdue: params.daysOverdue,
        agendaLevel: params.agendaLevel,
        proposalType: post.proposalType,
        department: post.department,
        facilityId: post.facilityId
      }
    });

    // 5. 投稿ステータスの更新
    await updatePostStatusAfterDecision({
      postId: params.postId,
      decision: params.decision,
      agendaLevel: params.agendaLevel
    });

    // 6. 通知送信
    await sendDecisionNotifications({
      postId: params.postId,
      decision: params.decision,
      deciderId: params.deciderId,
      decisionReason: params.decisionReason
    });

    return {
      success: true,
      decisionId: decision.id
    };

  } catch (error) {
    console.error('Error recording decision:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '判断記録に失敗しました'
    };
  }
}
```

##### B. 判断履歴取得API（暫定版）
```typescript
/**
 * 期限到達判断履歴を取得（職員カルテシステム連携前の暫定版）
 */
export async function getExpiredEscalationHistory(params: {
  userId: string;
  permissionLevel: number;
  facilityId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: ExpiredEscalationHistoryResponse;
  error?: string;
}> {
  try {
    // 1. 権限チェック
    if (params.permissionLevel < 1) {
      return { success: false, error: '権限がありません' };
    }

    // 2. フィルタ条件構築
    const where = buildWhereClause(params);

    // 3. データ取得
    const decisions = await prisma.expiredEscalationDecision.findMany({
      where,
      include: {
        post: {
          select: {
            content: true,
            author: { select: { name: true } }
          }
        },
        decider: {
          select: {
            name: true,
            permissionLevel: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 100,
      skip: params.offset || 0
    });

    // 4. 統計計算
    const summary = calculateSummary(decisions);

    // 5. レスポンス整形
    const items = decisions.map(d => ({
      id: d.id,
      postId: d.postId,
      postContent: d.post.content.substring(0, 100) + '...',
      proposalType: d.proposalType || '',
      agendaLevel: d.agendaLevel,
      currentScore: d.currentScore,
      targetScore: d.targetScore,
      achievementRate: d.achievementRate,
      daysOverdue: d.daysOverdue,
      decision: d.decision as 'approve_at_current_level' | 'downgrade' | 'reject',
      deciderId: d.deciderId,
      deciderName: d.decider.name,
      deciderLevel: d.decider.permissionLevel,
      decisionReason: d.decisionReason,
      decisionAt: d.createdAt.toISOString(),
      department: d.department || '',
      facilityId: d.facilityId || '',
      createdAt: d.createdAt.toISOString()
    }));

    return {
      success: true,
      data: {
        period: {
          startDate: params.startDate || '',
          endDate: params.endDate || ''
        },
        summary,
        items,
        pagination: {
          total: decisions.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
          hasMore: decisions.length === (params.limit || 100)
        }
      }
    };

  } catch (error) {
    console.error('Error fetching history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '履歴取得に失敗しました'
    };
  }
}

// ヘルパー関数
function buildWhereClause(params: any) {
  const where: any = {};

  // 権限レベル別フィルタリング
  if (params.permissionLevel >= 14) {
    // 法人全体: フィルタなし
  } else if (params.permissionLevel >= 9) {
    // 施設全体
    where.facilityId = params.facilityId;
  } else if (params.permissionLevel >= 7) {
    // 部署全体
    where.department = params.departmentId;
  } else if (params.permissionLevel >= 5) {
    // 自分が判断した案件のみ
    where.deciderId = params.userId;
  } else {
    // 自分が提案した案件のみ
    where.post = {
      authorId: params.userId
    };
  }

  // 日付範囲フィルタ
  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) {
      where.createdAt.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.createdAt.lte = new Date(params.endDate);
    }
  }

  return where;
}

function calculateSummary(decisions: any[]): ExpiredEscalationSummary {
  const totalCount = decisions.length;
  const approvedCount = decisions.filter(d => d.decision === 'approve_at_current_level').length;
  const downgradedCount = decisions.filter(d => d.decision === 'downgrade').length;
  const rejectedCount = decisions.filter(d => d.decision === 'reject').length;

  const approvalRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  const avgDaysToDecision = totalCount > 0
    ? decisions.reduce((sum, d) => sum + d.daysOverdue, 0) / totalCount
    : 0;

  const avgAchievementRate = totalCount > 0
    ? decisions.reduce((sum, d) => sum + d.achievementRate, 0) / totalCount
    : 0;

  return {
    totalCount,
    approvedCount,
    downgradedCount,
    rejectedCount,
    approvalRate: Math.round(approvalRate),
    averageDaysToDecision: Math.round(avgDaysToDecision * 10) / 10,
    averageAchievementRate: Math.round(avgAchievementRate)
  };
}
```

##### C. 補助関数
```typescript
/**
 * 判断後の投稿ステータス更新
 */
async function updatePostStatusAfterDecision(params: {
  postId: string;
  decision: string;
  agendaLevel: string;
}): Promise<void> {
  let newStatus: string;
  let newAgendaLevel: string | undefined;

  switch (params.decision) {
    case 'approve_at_current_level':
      newStatus = 'approved_at_current_level';
      break;
    case 'downgrade':
      newStatus = 'downgraded';
      newAgendaLevel = getDowngradedAgendaLevel(params.agendaLevel);
      break;
    case 'reject':
      newStatus = 'rejected_by_expired_escalation';
      break;
    default:
      newStatus = 'active';
  }

  await prisma.post.update({
    where: { id: params.postId },
    data: {
      status: newStatus,
      agendaLevel: newAgendaLevel || params.agendaLevel
    }
  });
}

/**
 * ダウングレード後の議題レベルを取得
 */
function getDowngradedAgendaLevel(currentLevel: string): string {
  const levelMap: Record<string, string> = {
    'FACILITY_AGENDA': 'DEPT_AGENDA',
    'CORP_REVIEW': 'FACILITY_AGENDA',
    'DEPT_AGENDA': 'DEPT_REVIEW'
  };
  return levelMap[currentLevel] || 'DEPT_REVIEW';
}

/**
 * 判断通知を送信
 */
async function sendDecisionNotifications(params: {
  postId: string;
  decision: string;
  deciderId: string;
  decisionReason: string;
}): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      author: { select: { id: true, name: true } }
    }
  });

  if (!post) return;

  const decisionText = {
    'approve_at_current_level': '現在のレベルで承認',
    'downgrade': 'ダウングレード',
    'reject': '不採用'
  }[params.decision] || '判断完了';

  // 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'expired_escalation_decision',
      title: `期限到達提案が判断されました`,
      message: `あなたの提案「${post.content.substring(0, 50)}...」が${decisionText}されました。\n\n理由: ${params.decisionReason}`,
      relatedPostId: params.postId,
      senderId: params.deciderId
    }
  });
}
```

**テスト項目**:
- [ ] 判断記録の正常系テスト
- [ ] 権限チェックのテスト
- [ ] 存在しない投稿IDでのエラーハンドリング
- [ ] 履歴取得の権限別フィルタリング確認
- [ ] 統計計算の正確性確認

---

#### 1.3 Express APIルート実装（見積もり: 1日）

**ファイル**: `src/server.ts`（既存ファイルに追加）

**追加ルート**:

```typescript
// 期限到達判断記録API
app.post('/api/expired-escalation-decision',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      // リクエストバリデーション
      const {
        postId,
        decision,
        decisionReason,
        currentScore,
        targetScore,
        agendaLevel,
        daysOverdue
      } = req.body;

      if (!postId || !decision || !decisionReason) {
        return res.status(400).json({
          success: false,
          error: '必須パラメータが不足しています'
        });
      }

      if (!['approve_at_current_level', 'downgrade', 'reject'].includes(decision)) {
        return res.status(400).json({
          success: false,
          error: '不正な判断タイプです'
        });
      }

      // 判断記録
      const result = await recordExpiredEscalationDecision({
        postId,
        decision,
        deciderId: req.user!.userId,
        decisionReason,
        currentScore: parseInt(currentScore),
        targetScore: parseInt(targetScore),
        agendaLevel,
        daysOverdue: parseInt(daysOverdue)
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('Error in expired-escalation-decision API:', error);
      res.status(500).json({
        success: false,
        error: 'サーバーエラーが発生しました'
      });
    }
  }
);

// 期限到達判断履歴取得API（暫定版）
app.get('/api/expired-escalation-history',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      // ユーザー情報取得
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          permissionLevel: true,
          facilityId: true,
          department: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません'
        });
      }

      // クエリパラメータ取得
      const {
        startDate,
        endDate,
        limit,
        offset
      } = req.query;

      // 履歴取得
      const result = await getExpiredEscalationHistory({
        userId,
        permissionLevel: user.permissionLevel,
        facilityId: user.facilityId || undefined,
        departmentId: user.department || undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : 100,
        offset: offset ? parseInt(offset as string) : 0
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('Error in expired-escalation-history API:', error);
      res.status(500).json({
        success: false,
        error: 'サーバーエラーが発生しました'
      });
    }
  }
);
```

**テスト項目**:
- [ ] POST /api/expired-escalation-decision の動作確認
- [ ] GET /api/expired-escalation-history の動作確認
- [ ] 認証トークンなしでのアクセス拒否確認
- [ ] 不正なパラメータでのバリデーションエラー確認
- [ ] 権限レベル別のフィルタリング確認

---

### Phase 2: 判断UI実装（見積もり: 4.5日）

#### 2.1 期限到達判断モーダル作成（見積もり: 2日）

**ファイル**: `src/components/agenda-mode/ExpiredEscalationDecisionModal.tsx`（新規作成）

**機能**:
- 期限到達提案の詳細表示
- スコア・到達率の視覚化
- 3つの判断選択（承認/ダウングレード/不採用）
- 判断理由入力欄（必須）
- 確認ダイアログ

**実装内容**:
```typescript
interface ExpiredEscalationDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    authorName: string;
    department: string;
    agendaLevel: string;
    currentScore: number;
    targetScore: number;
    daysOverdue: number;
    votingDeadline: string;
  };
  onDecision: (decision: {
    decision: 'approve_at_current_level' | 'downgrade' | 'reject';
    reason: string;
  }) => Promise<void>;
}

export const ExpiredEscalationDecisionModal: React.FC<ExpiredEscalationDecisionModalProps> = ({
  isOpen,
  onClose,
  post,
  onDecision
}) => {
  const [selectedDecision, setSelectedDecision] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const achievementRate = (post.currentScore / post.targetScore) * 100;

  const handleSubmit = async () => {
    if (!selectedDecision || !reason.trim()) {
      alert('判断と理由を入力してください');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onDecision({
        decision: selectedDecision as any,
        reason: reason.trim()
      });
      onClose();
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('判断の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* メインモーダル */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                期限到達提案の判断
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 提案詳細 */}
          <div className="p-6 space-y-6">
            {/* スコア表示 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">現在スコア</p>
                  <p className="text-3xl font-bold text-blue-600">{post.currentScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">目標スコア</p>
                  <p className="text-3xl font-bold text-gray-900">{post.targetScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">到達率</p>
                  <p className="text-3xl font-bold text-green-600">{achievementRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* プログレスバー */}
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(achievementRate, 100)}%` }}
                />
              </div>
            </div>

            {/* 期限超過情報 */}
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">期限超過</p>
                  <p className="text-sm text-orange-700">
                    投票期限から<span className="font-bold">{post.daysOverdue}日</span>経過しています
                  </p>
                </div>
              </div>
            </div>

            {/* 提案内容 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">提案内容</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>提案者: {post.authorName}</span>
                <span>部署: {post.department}</span>
                <span>レベル: {post.agendaLevel}</span>
              </div>
            </div>

            {/* 判断選択 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">判断を選択</h3>
              <div className="space-y-3">
                {/* 承認 */}
                <button
                  onClick={() => setSelectedDecision('approve_at_current_level')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDecision === 'approve_at_current_level'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-6 h-6 ${
                      selectedDecision === 'approve_at_current_level' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">現在のレベルで承認</p>
                      <p className="text-sm text-gray-600">
                        このスコアで承認し、議題として進める
                      </p>
                    </div>
                  </div>
                </button>

                {/* ダウングレード */}
                <button
                  onClick={() => setSelectedDecision('downgrade')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDecision === 'downgrade'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingDown className={`w-6 h-6 ${
                      selectedDecision === 'downgrade' ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">ダウングレード</p>
                      <p className="text-sm text-gray-600">
                        下位レベルの議題として継続検討
                      </p>
                    </div>
                  </div>
                </button>

                {/* 不採用 */}
                <button
                  onClick={() => setSelectedDecision('reject')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDecision === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <XCircle className={`w-6 h-6 ${
                      selectedDecision === 'reject' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">不採用</p>
                      <p className="text-sm text-gray-600">
                        この提案を採用しない
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 理由入力 */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                判断理由 <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="判断理由を入力してください（必須）"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {reason.length} / 500文字
              </p>
            </div>
          </div>

          {/* フッター */}
          <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedDecision || !reason.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              判断を送信
            </button>
          </div>
        </div>
      </div>

      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">判断を確定しますか？</h3>
            <p className="text-gray-600 mb-6">
              この判断は記録され、関係者に通知されます。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                戻る
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isSubmitting ? '送信中...' : '確定する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
```

**テスト項目**:
- [ ] モーダルの開閉動作
- [ ] 判断選択のUIフィードバック
- [ ] 理由入力のバリデーション
- [ ] 確認ダイアログの表示
- [ ] API送信の正常系/異常系

---

#### 2.2 期限到達提案一覧ページ作成（見積もり: 2日）

**ファイル**: `src/components/agenda-mode/ExpiredEscalationListPage.tsx`（新規作成）

**機能**:
- 判断待ち提案の一覧表示
- フィルタ機能（部署、施設、期限超過日数）
- ソート機能（到達率、期限超過日数）
- ページネーション
- 判断モーダルの統合

**実装概要** (コードは長いため概要のみ):
```typescript
// 主要機能
- useState: フィルタ、ソート、ページネーション状態管理
- useEffect: データフェッチ
- フィルタUI: 部署選択、期限超過日数範囲
- ソートUI: ドロップダウン
- 一覧カード: スコア、到達率、期限超過日数表示
- 判断ボタン: クリックでモーダル表示
- ページネーション: 前へ/次へボタン
```

**テスト項目**:
- [ ] 一覧の表示確認
- [ ] フィルタの動作確認
- [ ] ソートの動作確認
- [ ] ページネーションの動作確認
- [ ] 判断モーダルとの連携確認

---

#### 2.3 通知からのアクション統合（見積もり: 0.5日）

**ファイル**: `src/components/notifications/NotificationItem.tsx`（既存ファイル修正）

**変更内容**:
- 期限到達通知タイプの判定追加
- 判断ページへの遷移ボタン追加
- クイック判断ボタン追加（オプション）

**実装概要**:
```typescript
// 期限到達通知の場合の処理追加
if (notification.type === 'expired_escalation') {
  // 判断ページへ遷移
  <button onClick={() => navigate(`/expired-escalation-list`)}>
    判断する
  </button>
}
```

**テスト項目**:
- [ ] 通知からの遷移確認
- [ ] 通知タイプの判定確認

---

### Phase 3: データ連携実装（見積もり: 3日）

#### 3.1 MCPサーバー連携実装（見積もり: 2日）

**前提条件**: 医療職員カルテシステム側API完成

**ファイル**: `src/services/mcpExpiredEscalationService.ts`（新規作成）

**実装内容**:
```typescript
/**
 * MCPサーバー経由で職員カルテシステムから判断履歴を取得
 */
export async function fetchExpiredEscalationHistoryFromMCP(params: {
  userId: string;
  permissionLevel: number;
  facilityId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ExpiredEscalationHistoryResponse> {
  try {
    const response = await fetch('http://localhost:8080/api/mcp/expired-escalation-history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      params: new URLSearchParams(params as any)
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching from MCP:', error);

    // フォールバック: ローカルDBから取得
    return await getExpiredEscalationHistory(params);
  }
}

// キャッシュ機構（Redis推奨）
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

export async function getCachedExpiredEscalationHistory(
  cacheKey: string
): Promise<ExpiredEscalationHistoryResponse | null> {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export async function setCachedExpiredEscalationHistory(
  cacheKey: string,
  data: ExpiredEscalationHistoryResponse
): Promise<void> {
  cache.set(cacheKey, { data, timestamp: Date.now() });
}
```

**テスト項目**:
- [ ] MCP連携の正常系テスト
- [ ] エラー時のフォールバック確認
- [ ] キャッシュ機構の動作確認
- [ ] レスポンス変換の確認

---

#### 3.2 ExpiredEscalationHistoryPage のAPI連携（見積もり: 1日）

**ファイル**: `src/components/agenda-mode/ExpiredEscalationHistoryPage.tsx`（既存ファイル修正）

**変更内容**:
```typescript
// Before (モックデータ)
const data = getMockExpiredEscalationHistory(user.permissionLevel);

// After (API連携)
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `expired-escalation-history-${user.id}-${user.permissionLevel}`;

      // キャッシュ確認
      let data = await getCachedExpiredEscalationHistory(cacheKey);

      if (!data) {
        // MCP経由でデータ取得
        data = await fetchExpiredEscalationHistoryFromMCP({
          userId: user.id,
          permissionLevel: user.permissionLevel,
          facilityId: user.facilityId,
          departmentId: user.department,
          startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd')
        });

        // キャッシュ保存
        await setCachedExpiredEscalationHistory(cacheKey, data);
      }

      setHistoryData(data);

    } catch (error) {
      console.error('Error fetching history:', error);
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [user]);

// リトライボタン
{error && (
  <button onClick={() => fetchData()}>再試行</button>
)}
```

**テスト項目**:
- [ ] API呼び出しの確認
- [ ] ローディング状態の表示確認
- [ ] エラー表示の確認
- [ ] リトライ機能の確認

---

## 📅 実装スケジュール

### Week 1: バックエンド基盤（3.5日）
| 日 | タスク | 担当 | 見積 |
|----|--------|------|------|
| Day 1 | Prisma Schema拡張 + マイグレーション | Backend | 0.5日 |
| Day 2-3 | 期限到達判断API作成 | Backend | 2日 |
| Day 4 | Express APIルート実装 | Backend | 1日 |

### Week 2: フロントエンド実装（4.5日）
| 日 | タスク | 担当 | 見積 |
|----|--------|------|------|
| Day 5-6 | 期限到達判断モーダル実装 | Frontend | 2日 |
| Day 7-8 | 期限到達提案一覧ページ実装 | Frontend | 2日 |
| Day 9 | 通知統合 + UI調整 | Frontend | 0.5日 |

### Week 3: データ連携（3日）
| 日 | タスク | 担当 | 見積 |
|----|--------|------|------|
| Day 10-11 | MCPサーバー連携実装 | Backend | 2日 |
| Day 12 | ExpiredEscalationHistoryPage API統合 | Frontend | 1日 |

**合計見積もり**: 11日

---

## ✅ 完了条件

- [ ] 全APIエンドポイント実装完了
- [ ] 全UIコンポーネント実装完了
- [ ] MCPサーバー連携完了
- [ ] ユニットテストカバレッジ > 80%
- [ ] 統合テスト全パス
- [ ] パフォーマンステスト合格（API応答 < 500ms）
- [ ] セキュリティレビュー完了
- [ ] ドキュメント整備完了

---

**最終更新**: 2025年10月20日
**バージョン**: 2.0
**ステータス**: 実装待ち
