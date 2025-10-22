# 決定会議 暫定マスターリスト

**作成日**: 2025年10月22日
**対象ページ**: DecisionMeetingPage (`src/pages/DecisionMeetingPage.tsx`)
**対象ユーザー**: レベル13（院長・施設長）
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- 決定会議ページは院長・施設長が運営委員会からの議題を最終決定する機能
- 現在はDecisionMeetingServiceでダミーデータ管理
- 既存の`DecisionMeetingAgenda`テーブルで全機能対応可能
- **医療システムとの連携は不要**（VoiceDrive独自機能）

### 必要な対応
1. **VoiceDrive DB修正**: 0件（不要）
2. **API実装**: 4件
3. **確認事項**: 0件（医療システム連携不要）

### 優先度
**Priority: MEDIUM（グループ2: レベル13専用機能）**

---

## 📊 主な発見事項

### ✅ 完璧なテーブル設計

`DecisionMeetingAgenda`テーブルは以下すべてに対応:
- ✅ 基本情報（タイトル、タイプ、説明、背景）
- ✅ 提案元情報（提案者、部署、日時）
- ✅ ステータス管理（pending, in_review, approved, rejected, deferred）
- ✅ 優先度管理（urgent, high, normal, low）
- ✅ 影響分析（部署リスト、予算、期間、効果）
- ✅ 議事録（出席者、議論内容、懸念事項、承認条件）
- ✅ 決定情報（決定者、決定日、決定理由）
- ✅ 運営委員会連携（relatedCommitteeAgendaId）

### 🎯 JSON型の効果的活用

配列データをJSON型で柔軟に格納:
- `impactDepartments`: 影響部署リスト
- `meetingAttendees`: 出席者リスト
- `meetingConcerns`: 懸念事項リスト
- `meetingConditions`: 承認条件リスト
- `tags`: タグ

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### 結論: **追加なし**

既存の`DecisionMeetingAgenda`テーブルで完全対応。schema.prismaの修正は不要。

---

## 🔌 VoiceDrive API実装計画

### API-1: 決定会議議題一覧取得

**エンドポイント**:
```
GET /api/decision-agendas
```

**クエリパラメータ**:
- `status?`: string (pending, in_review, approved, rejected, deferred)
- `priority?`: string (urgent, high, normal, low)
- `month?`: string (YYYY-MM形式、今月決定フィルタ用)

**必要な理由**:
- DecisionMeetingPage 38-41行目で議題一覧とstatsを取得
- タブフィルタ（審議待ち、審議中、今月決定、全議題）対応

**レスポンス例**:
```json
{
  "success": true,
  "agendas": [
    {
      "id": "agenda-1",
      "title": "夜勤帯人員配置最適化計画",
      "type": "committee_proposal",
      "description": "全10施設の人材配置分析の結果、夜勤帯の人員偏在が判明",
      "background": "6施設で夜勤時の人手不足が共通課題として挙がっており...",
      "proposedBy": "田中太郎",
      "proposedDate": "2025-10-01T00:00:00Z",
      "proposerDepartment": "看護部",
      "proposerId": "user-001",
      "status": "pending",
      "priority": "high",
      "scheduledDate": "2025-10-15T14:00:00Z",
      "impact": {
        "departments": ["看護部", "医事課", "総務課"],
        "estimatedCost": 5000000,
        "implementationPeriod": "2026年4月〜2026年9月",
        "expectedEffect": "夜勤時の残業時間40%削減見込み"
      }
    }
  ],
  "stats": {
    "totalAgendas": 25,
    "pendingCount": 5,
    "approvedCount": 15,
    "rejectedCount": 3,
    "deferredCount": 2,
    "urgentCount": 2,
    "thisMonthDecisions": 8,
    "approvalRate": 60,
    "averageDecisionDays": 7
  }
}
```

**実装例**:
```typescript
// src/api/routes/decision-agendas.routes.ts
router.get('/', authenticateJWT, authorizeLevel(13), async (req, res) => {
  const { status, priority, month } = req.query;

  // フィルタ条件構築
  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (month) {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
    where.decidedDate = { gte: startDate, lte: endDate };
    where.status = { in: ['approved', 'rejected', 'deferred'] };
  }

  // 議題一覧取得
  const agendas = await prisma.decisionMeetingAgenda.findMany({
    where,
    include: {
      proposerUser: {
        select: { id: true, name: true, department: true }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { proposedDate: 'desc' }
    ]
  });

  // 統計計算
  const stats = await calculateStats();

  // JSON型フィールドの変換
  const formattedAgendas = agendas.map(agenda => ({
    ...agenda,
    impact: {
      departments: agenda.impactDepartments as string[],
      estimatedCost: agenda.impactEstimatedCost,
      implementationPeriod: agenda.impactImplementationPeriod,
      expectedEffect: agenda.impactExpectedEffect
    },
    meetingMinutes: agenda.meetingDiscussion ? {
      attendees: agenda.meetingAttendees as string[],
      discussion: agenda.meetingDiscussion,
      concerns: (agenda.meetingConcerns as string[]) || [],
      conditions: (agenda.meetingConditions as string[]) || []
    } : undefined
  }));

  res.json({
    success: true,
    agendas: formattedAgendas,
    stats
  });
});

async function calculateStats() {
  const totalAgendas = await prisma.decisionMeetingAgenda.count();
  const pendingCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'pending' }
  });
  const approvedCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'approved' }
  });
  const rejectedCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'rejected' }
  });
  const deferredCount = await prisma.decisionMeetingAgenda.count({
    where: { status: 'deferred' }
  });
  const urgentCount = await prisma.decisionMeetingAgenda.count({
    where: { priority: 'urgent' }
  });

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonthDecisions = await prisma.decisionMeetingAgenda.count({
    where: {
      decidedDate: { gte: thisMonthStart },
      status: { in: ['approved', 'rejected', 'deferred'] }
    }
  });

  const approvalRate = totalAgendas > 0 ? (approvedCount / totalAgendas) * 100 : 0;

  // 平均決定日数
  const decidedAgendas = await prisma.decisionMeetingAgenda.findMany({
    where: { decidedDate: { not: null } },
    select: { proposedDate: true, decidedDate: true }
  });

  const totalDays = decidedAgendas.reduce((sum, agenda) => {
    if (!agenda.decidedDate) return sum;
    const days = Math.floor(
      (agenda.decidedDate.getTime() - agenda.proposedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  const averageDecisionDays = decidedAgendas.length > 0
    ? Math.round(totalDays / decidedAgendas.length)
    : 0;

  return {
    totalAgendas,
    pendingCount,
    approvedCount,
    rejectedCount,
    deferredCount,
    urgentCount,
    thisMonthDecisions,
    approvalRate: Math.round(approvalRate),
    averageDecisionDays
  };
}
```

**セキュリティ**:
- JWT認証必須
- レベル13以上のみアクセス可能

---

### API-2: 決定会議議題詳細取得

**エンドポイント**:
```
GET /api/decision-agendas/:id
```

**必要な理由**:
- DecisionMeetingPage 371-557行目で詳細モーダル表示
- 全フィールド（議事録含む）の詳細情報取得

**レスポンス例**:
```json
{
  "success": true,
  "agenda": {
    "id": "agenda-1",
    "title": "夜勤帯人員配置最適化計画",
    "type": "committee_proposal",
    "description": "...",
    "background": "6施設で夜勤時の人手不足が共通課題として挙がっており...",
    "proposedBy": "田中太郎",
    "proposedDate": "2025-10-01T00:00:00Z",
    "proposerDepartment": "看護部",
    "proposerId": "user-001",
    "status": "in_review",
    "priority": "high",
    "scheduledDate": "2025-10-15T14:00:00Z",
    "decidedDate": null,
    "decidedBy": null,
    "decision": null,
    "decisionNotes": null,
    "impact": {
      "departments": ["看護部", "医事課", "総務課"],
      "estimatedCost": 5000000,
      "implementationPeriod": "2026年4月〜2026年9月",
      "expectedEffect": "夜勤時の残業時間40%削減見込み"
    },
    "meetingMinutes": {
      "attendees": ["山田院長", "佐藤看護部長", "鈴木事務部長"],
      "discussion": "施設間での人材融通の具体的な実施方法について議論...",
      "concerns": [
        "職員の移動負担増加の懸念",
        "施設間での業務手順の違いによる混乱"
      ],
      "conditions": [
        "交通費全額支給",
        "事前研修の実施",
        "3ヶ月間のトライアル期間設定"
      ]
    },
    "relatedCommitteeAgendaId": "committee-agenda-123"
  }
}
```

**実装例**:
```typescript
router.get('/:id', authenticateJWT, authorizeLevel(13), async (req, res) => {
  const { id } = req.params;

  const agenda = await prisma.decisionMeetingAgenda.findUnique({
    where: { id },
    include: {
      proposerUser: {
        select: { id: true, name: true, department: true }
      },
      deciderUser: {
        select: { id: true, name: true }
      },
      relatedCommitteeAgenda: {
        select: { id: true, agendaTitle: true }
      }
    }
  });

  if (!agenda) {
    return res.status(404).json({
      success: false,
      error: '議題が見つかりません'
    });
  }

  // JSON型フィールドの変換
  const formattedAgenda = {
    ...agenda,
    impact: {
      departments: agenda.impactDepartments as string[],
      estimatedCost: agenda.impactEstimatedCost,
      implementationPeriod: agenda.impactImplementationPeriod,
      expectedEffect: agenda.impactExpectedEffect
    },
    meetingMinutes: agenda.meetingDiscussion ? {
      attendees: agenda.meetingAttendees as string[],
      discussion: agenda.meetingDiscussion,
      concerns: (agenda.meetingConcerns as string[]) || [],
      conditions: (agenda.meetingConditions as string[]) || []
    } : undefined
  };

  res.json({
    success: true,
    agenda: formattedAgenda
  });
});
```

**セキュリティ**:
- JWT認証必須
- レベル13以上のみアクセス可能

---

### API-3: 決定アクション（承認/却下/保留）

**エンドポイント**:
```
POST /api/decision-agendas/:id/decide
```

**必要な理由**:
- DecisionMeetingPage 124-179行目で決定アクション実行
- 承認、却下、保留の3つのアクションに対応

**リクエスト例**:
```json
{
  "action": "approve",  // approve | reject | defer
  "userId": "user-chairman-001",
  "notes": "承認します。条件付きで実施してください。"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "agenda": {
    "id": "agenda-1",
    "status": "approved",
    "decision": "approved",
    "decidedDate": "2025-10-22T10:30:00Z",
    "decidedBy": "山田太郎",
    "deciderId": "user-chairman-001",
    "decisionNotes": "承認します。条件付きで実施してください。"
  },
  "notification": {
    "id": "notif-001",
    "recipientId": "user-001",
    "recipientName": "田中太郎"
  }
}
```

**実装例**:
```typescript
router.post('/:id/decide', authenticateJWT, authorizeLevel(13), async (req, res) => {
  const { id } = req.params;
  const { action, userId, notes } = req.body;

  // バリデーション
  const validActions = ['approve', 'reject', 'defer'];
  if (!validActions.includes(action)) {
    return res.status(400).json({
      success: false,
      error: 'actionは approve, reject, defer のいずれかである必要があります'
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userIdが必要です'
    });
  }

  // ユーザー取得・権限チェック
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'ユーザーが見つかりません'
    });
  }

  if (Number(user.permissionLevel) < 13) {
    return res.status(403).json({
      success: false,
      error: 'この操作にはレベル13以上の権限が必要です（院長・施設長）'
    });
  }

  // 議題取得
  const agenda = await prisma.decisionMeetingAgenda.findUnique({
    where: { id },
    include: {
      proposerUser: {
        select: { id: true, name: true }
      }
    }
  });

  if (!agenda) {
    return res.status(404).json({
      success: false,
      error: '議題が見つかりません'
    });
  }

  // ステータスマッピング
  const statusMap: Record<string, string> = {
    approve: 'approved',
    reject: 'rejected',
    defer: 'deferred'
  };

  console.log('[POST /api/decision-agendas/:id/decide] 決定処理開始:', {
    agendaId: id,
    agendaTitle: agenda.title.substring(0, 50),
    action,
    userId,
    notes: notes?.substring(0, 50)
  });

  // 議題更新
  const updatedAgenda = await prisma.decisionMeetingAgenda.update({
    where: { id },
    data: {
      status: statusMap[action],
      decision: action,
      decidedDate: new Date(),
      decidedBy: user.name,
      deciderId: userId,
      decisionNotes: notes || null
    }
  });

  console.log('[POST /api/decision-agendas/:id/decide] 議題更新完了:', updatedAgenda.id);

  // 通知作成（提案者に通知）
  const notificationTitles: Record<string, string> = {
    approve: '決定会議で議題が承認されました',
    reject: '決定会議で議題が却下されました',
    defer: '決定会議で議題が保留されました'
  };

  const notificationPriorities: Record<string, string> = {
    approve: 'normal',
    reject: 'high',
    defer: 'normal'
  };

  const notification = await prisma.notification.create({
    data: {
      category: 'decision_meeting',
      subcategory: 'decision_made',
      priority: notificationPriorities[action],
      title: notificationTitles[action],
      content: notes
        ? `議題「${agenda.title}」の決定:\n\n${notes}`
        : `議題「${agenda.title}」が${statusMap[action]}されました。`,
      target: 'individual',
      senderId: userId,
      status: 'pending',
      recipients: {
        create: {
          userId: agenda.proposerUser!.id,
          isRead: false
        }
      }
    }
  });

  console.log('[POST /api/decision-agendas/:id/decide] 通知作成完了:', notification.id);

  res.json({
    success: true,
    agenda: {
      id: updatedAgenda.id,
      title: updatedAgenda.title,
      status: updatedAgenda.status,
      decision: updatedAgenda.decision,
      decidedDate: updatedAgenda.decidedDate?.toISOString(),
      decidedBy: updatedAgenda.decidedBy,
      deciderId: updatedAgenda.deciderId,
      decisionNotes: updatedAgenda.decisionNotes
    },
    notification: {
      id: notification.id,
      recipientId: agenda.proposerUser!.id,
      recipientName: agenda.proposerUser!.name
    }
  });
});
```

**セキュリティ**:
- JWT認証必須
- レベル13以上のみアクセス可能
- CSRF保護必須
- 決定履歴の監査ログ記録

---

### API-4: 審議開始

**エンドポイント**:
```
POST /api/decision-agendas/:id/start-review
```

**必要な理由**:
- DecisionMeetingPage 181-187行目で審議開始処理
- ステータスをpending → in_reviewに変更

**リクエスト例**:
```json
{
  "userId": "user-chairman-001"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "agenda": {
    "id": "agenda-1",
    "status": "in_review"
  }
}
```

**実装例**:
```typescript
router.post('/:id/start-review', authenticateJWT, authorizeLevel(13), async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  // ユーザー取得・権限チェック
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'ユーザーが見つかりません'
    });
  }

  if (Number(user.permissionLevel) < 13) {
    return res.status(403).json({
      success: false,
      error: 'この操作にはレベル13以上の権限が必要です'
    });
  }

  // 議題更新
  const updatedAgenda = await prisma.decisionMeetingAgenda.update({
    where: { id },
    data: {
      status: 'in_review'
    }
  });

  console.log('[POST /api/decision-agendas/:id/start-review] 審議開始:', {
    agendaId: id,
    agendaTitle: updatedAgenda.title,
    userId
  });

  res.json({
    success: true,
    agenda: {
      id: updatedAgenda.id,
      status: updatedAgenda.status
    }
  });
});
```

**セキュリティ**:
- JWT認証必須
- レベル13以上のみアクセス可能

---

## ❌ 医療システム連携は不要

### 理由

1. **VoiceDrive独自機能**
   - 決定会議はVoiceDriveの組織意思決定プロセスの一部
   - 医療システムの人事評価・キャリア管理とは独立

2. **必要な職員情報は既に同期済み**
   - 院長・施設長の権限レベル（User.permissionLevel = 13）
   - 提案者の所属部署（User.department）
   - これらは既存の職員マスタ同期で取得済み

3. **議題データはVoiceDrive管轄**
   - 議題の提案、審議、決定はVoiceDrive内で完結
   - 医療システムに送信する必要なし

### 医療システムとの連携が必要になる場合

**将来的に以下の機能を追加する場合のみ連携検討**:
- 決定事項を医療システムの施設運営マスタに反映
- 決定内容を医療システムの文書管理システムに保存
- 予算承認を医療システムの予算管理システムに連携

---

## 📅 想定スケジュール

### Phase 1: API実装（2-3日）

**Day 1-2**: API実装
- [x] DecisionMeetingAgenda確認（完了）
- [ ] API-1実装（議題一覧取得）
- [ ] API-2実装（議題詳細取得）
- [ ] API-3実装（決定アクション）
- [ ] API-4実装（審議開始）

**Day 3**: フロントエンド統合
- [ ] DecisionMeetingPageのダミーデータ削除
- [ ] 実データ取得APIに接続
- [ ] アクションボタン実装
- [ ] エラーハンドリング実装

### Phase 2: テスト・デバッグ（1日）

**Day 4**: 統合テスト
- [ ] 議題一覧表示テスト
- [ ] 決定アクションテスト（承認/却下/保留）
- [ ] 通知機能テスト
- [ ] 権限チェックセキュリティテスト
- [ ] E2Eテスト

### Phase 3: リリース

**Day 5**: 本番デプロイ
- [ ] 本番環境デプロイ
- [ ] モニタリング設定
- [ ] ユーザーガイド作成

---

## ✅ チェックリスト

### VoiceDrive側作業

#### DB修正
- [x] **不要**: DecisionMeetingAgendaテーブルは完璧

#### API実装
- [ ] **API-1**: GET /api/decision-agendas 実装
- [ ] **API-2**: GET /api/decision-agendas/:id 実装
- [ ] **API-3**: POST /api/decision-agendas/:id/decide 実装
- [ ] **API-4**: POST /api/decision-agendas/:id/start-review 実装
- [ ] JWT認証ミドルウェア統合
- [ ] 権限チェックミドルウェア統合（Level 13）
- [ ] エラーハンドリング実装
- [ ] API仕様書作成（OpenAPI 3.0）

#### フロントエンド実装
- [ ] DecisionMeetingPageのダミーデータ削除
- [ ] API呼び出し実装
- [ ] ローディング状態表示
- [ ] エラー表示
- [ ] 権限チェック（Level 13のみアクセス）
- [ ] レスポンシブデザイン確認

#### テスト
- [ ] 単体テスト（API）
- [ ] 統合テスト（API + DB）
- [ ] E2Eテスト（フルフロー）
- [ ] セキュリティテスト（権限チェック）
- [ ] パフォーマンステスト（100議題想定）

---

## 📝 補足資料

### 参照ドキュメント

1. **decision-meeting_DB要件分析**
   `mcp-shared/docs/decision-meeting_DB要件分析_20251022.md`

2. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

3. **共通DB構築後統合作業再開計画書**
   `mcp-shared/docs/共通DB構築後統合作業再開計画書_20251008.md`

### JSON型フィールドの格納形式

**impactDepartments**（影響部署リスト）:
```json
["看護部", "医事課", "総務課", "栄養科"]
```

**meetingAttendees**（出席者リスト）:
```json
["山田院長", "佐藤看護部長", "鈴木事務部長", "高橋総務課長"]
```

**meetingConcerns**（懸念事項リスト）:
```json
[
  "職員の移動負担増加の懸念",
  "施設間での業務手順の違いによる混乱",
  "初期コストの負担"
]
```

**meetingConditions**（承認条件リスト）:
```json
[
  "交通費全額支給",
  "事前研修の実施",
  "3ヶ月間のトライアル期間設定",
  "月次レビュー会議の開催"
]
```

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-22 | 初版作成 | AI (Claude Code) |

---

**作成者**: AI (Claude Code)
**承認待ち**: VoiceDriveチームレビュー
**次のステップ**: API実装 → フロントエンド統合 → テスト

---

**文書終了**
