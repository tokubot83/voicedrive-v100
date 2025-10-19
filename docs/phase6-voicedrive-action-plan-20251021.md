# Phase 6 VoiceDriveチーム アクションプラン - 10/21（月）

**作成日**: 2025年10月20日
**対象**: Phase 6 期限到達判断履歴機能
**ステータス**: 実装完了 → データ準備・統合テスト準備

---

## 🎯 明日（10/21 月曜日）のタスク

### 1. データベースマイグレーション実行 ⏰ 09:00

**担当**: バックエンドチーム

**タスク**:
```bash
# 既存データを保持するため、手動SQLマイグレーションを実施

# 1. テーブル存在確認
sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE type='table' AND name='expired_escalation_decisions';"

# 2. テーブルが存在しない場合、手動でCREATE TABLE実行
sqlite3 prisma/dev.db < scripts/migrations/create_expired_escalation_decisions.sql

# 3. Prisma Clientの再生成
npx prisma generate

# 4. 動作確認
npm run test:db-connection
```

**成功条件**:
- ✅ `expired_escalation_decisions`テーブルが作成されている
- ✅ 既存データが保持されている
- ✅ Prisma Clientが正常に動作する

---

### 2. テストデータ生成・投入 ⏰ 10:00

**担当**: バックエンドチーム

**タスク**:

#### 2.1 テストデータ生成スクリプト作成

**ファイル**: `scripts/generate-expired-escalation-test-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function generateTestData() {
  console.log('🚀 期限到達判断テストデータ生成開始...');

  // 1. テスト用ユーザーの取得（LEVEL_5-18）
  const managers = await prisma.user.findMany({
    where: {
      permissionLevel: { gte: 5 }
    },
    take: 10
  });

  // 2. テスト用提案の取得（期限到達済み）
  const expiredProposals = await prisma.post.findMany({
    where: {
      agendaVotingDeadline: { lte: new Date() },
      agendaLevel: { in: ['escalated_to_dept', 'escalated_to_facility', 'escalated_to_corp'] }
    },
    take: 100
  });

  console.log(`📊 対象管理職: ${managers.length}名`);
  console.log(`📊 対象提案: ${expiredProposals.length}件`);

  // 3. テストデータ生成
  const testDecisions = [];
  const decisionTypes = [
    'approve_at_current_level', // 60%
    'downgrade',                 // 25%
    'reject'                     // 15%
  ];

  for (let i = 0; i < 100; i++) {
    const proposal = expiredProposals[i % expiredProposals.length];
    const manager = managers[i % managers.length];
    const decisionType =
      i < 60 ? decisionTypes[0] :
      i < 85 ? decisionTypes[1] :
      decisionTypes[2];

    const currentScore = proposal.agendaScore || 0;
    const targetScore =
      proposal.agendaLevel?.includes('CORP') ? 600 :
      proposal.agendaLevel?.includes('FACILITY') ? 300 :
      100;

    const achievementRate = (currentScore / targetScore) * 100;

    const deadline = new Date(proposal.agendaVotingDeadline || new Date());
    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));

    testDecisions.push({
      postId: proposal.id,
      deciderId: manager.id,
      decision: decisionType,
      decisionReason: generateDecisionReason(decisionType, achievementRate),
      currentScore,
      targetScore,
      achievementRate,
      daysOverdue: Math.max(0, daysOverdue),
      agendaLevel: proposal.agendaLevel || 'unknown',
      proposalType: proposal.proposalType,
      department: proposal.department,
      facilityId: proposal.facilityId,
      createdAt: subDays(new Date(), Math.floor(Math.random() * 30))
    });
  }

  // 4. データベースに投入
  console.log('💾 データベースに投入中...');

  for (const decision of testDecisions) {
    await prisma.expiredEscalationDecision.create({
      data: decision
    });
  }

  console.log('✅ テストデータ生成完了！');
  console.log(`📊 生成件数: ${testDecisions.length}件`);
  console.log(`   - 承認: ${testDecisions.filter(d => d.decision === 'approve_at_current_level').length}件`);
  console.log(`   - ダウングレード: ${testDecisions.filter(d => d.decision === 'downgrade').length}件`);
  console.log(`   - 不採用: ${testDecisions.filter(d => d.decision === 'reject').length}件`);

  return testDecisions;
}

function generateDecisionReason(decisionType: string, achievementRate: number): string {
  switch (decisionType) {
    case 'approve_at_current_level':
      return `到達率${achievementRate.toFixed(1)}%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。`;
    case 'downgrade':
      return `到達率${achievementRate.toFixed(1)}%で目標に届きませんでしたが、提案内容には価値があるため、下位レベルでの実施を検討します。`;
    case 'reject':
      return `到達率${achievementRate.toFixed(1)}%と低く、また期限を大幅に超過しているため、今回は不採用とします。別の形での提案を期待します。`;
    default:
      return '判断理由を記入してください。';
  }
}

generateTestData()
  .then(() => {
    console.log('✅ 全処理完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
```

#### 2.2 テストデータ実行

```bash
# スクリプト実行
npx tsx scripts/generate-expired-escalation-test-data.ts

# 結果確認
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM expired_escalation_decisions;"
sqlite3 prisma/dev.db "SELECT decision, COUNT(*) FROM expired_escalation_decisions GROUP BY decision;"
```

**成功条件**:
- ✅ 100件のテストデータが投入されている
- ✅ 承認: 60件、ダウングレード: 25件、不採用: 15件
- ✅ 権限レベル分布（LEVEL_5-18）
- ✅ 施設・部署分布が適切

---

### 3. テストデータ共有 ⏰ 11:00

**担当**: バックエンドチーム

**タスク**:

#### 3.1 JSON形式エクスポート

**ファイル**: `scripts/export-test-data-to-json.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportTestData() {
  console.log('📤 テストデータエクスポート開始...');

  const decisions = await prisma.expiredEscalationDecision.findMany({
    include: {
      post: {
        select: {
          id: true,
          content: true,
          agendaLevel: true,
          proposalType: true,
          department: true,
          agendaVotingDeadline: true,
          author: {
            select: {
              id: true,
              name: true,
              department: true
            }
          }
        }
      },
      decider: {
        select: {
          id: true,
          name: true,
          department: true,
          permissionLevel: true,
          facilityId: true
        }
      }
    },
    take: 100
  });

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalCount: decisions.length,
      version: '1.0.0'
    },
    decisions: decisions.map(d => ({
      id: d.id,
      postId: d.postId,
      postContent: d.post.content,
      deciderId: d.deciderId,
      deciderName: d.decider.name,
      deciderLevel: Number(d.decider.permissionLevel),
      decision: d.decision,
      decisionReason: d.decisionReason,
      currentScore: d.currentScore,
      targetScore: d.targetScore,
      achievementRate: d.achievementRate,
      daysOverdue: d.daysOverdue,
      agendaLevel: d.agendaLevel,
      proposalType: d.proposalType,
      department: d.department,
      facilityId: d.facilityId,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString()
    }))
  };

  // 保存
  const outputPath = path.join('mcp-shared', 'test-data', 'expired-escalation-history.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  console.log(`✅ JSONエクスポート完了: ${outputPath}`);
  console.log(`📊 件数: ${exportData.decisions.length}件`);

  return exportData;
}

exportTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });
```

#### 3.2 SQL形式エクスポート

**ファイル**: `mcp-shared/test-data/expired-escalation-history.sql`

```sql
-- 期限到達判断履歴テストデータ
-- 生成日: 2025-10-21

-- テーブル作成（存在しない場合）
CREATE TABLE IF NOT EXISTS expired_escalation_decisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  decider_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  decision_reason TEXT NOT NULL,
  current_score INTEGER NOT NULL,
  target_score INTEGER NOT NULL,
  achievement_rate REAL NOT NULL,
  days_overdue INTEGER NOT NULL,
  agenda_level TEXT NOT NULL,
  proposal_type TEXT,
  department TEXT,
  facility_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_expired_escalation_decisions_post_id ON expired_escalation_decisions(post_id);
CREATE INDEX IF NOT EXISTS idx_expired_escalation_decisions_decider_id ON expired_escalation_decisions(decider_id);
CREATE INDEX IF NOT EXISTS idx_expired_escalation_decisions_facility_id ON expired_escalation_decisions(facility_id);
CREATE INDEX IF NOT EXISTS idx_expired_escalation_decisions_created_at ON expired_escalation_decisions(created_at);
CREATE INDEX IF NOT EXISTS idx_expired_escalation_decisions_decision ON expired_escalation_decisions(decision);

-- データ投入
INSERT INTO expired_escalation_decisions (id, post_id, decider_id, decision, decision_reason, ...) VALUES
('decision-001', 'post-001', 'user-001', 'approve_at_current_level', '到達率85.5%で...', ...),
('decision-002', 'post-002', 'user-002', 'downgrade', '到達率72.3%で...', ...),
-- ... (100件)
```

#### 3.3 データ共有

```bash
# JSON/SQLファイルをMCP共有フォルダに配置
cp mcp-shared/test-data/expired-escalation-history.json /path/to/shared/folder/
cp mcp-shared/test-data/expired-escalation-history.sql /path/to/shared/folder/

# Slack通知
# チャンネル: #phase6-integration
# メッセージ: "テストデータ共有完了。mcp-shared/test-data/にJSON/SQLファイルを配置しました。"
```

**成功条件**:
- ✅ JSON形式ファイルが生成されている
- ✅ SQL INSERT文ファイルが生成されている
- ✅ 医療システムチームが受領可能な場所に配置

---

### 4. ローカル環境でAPI動作確認 ⏰ 14:00

**担当**: バックエンドチーム、フロントエンドチーム

**タスク**:

#### 4.1 APIサーバー起動

```bash
# APIサーバー起動
npm run dev:api

# 別ターミナルでフロントエンド起動
npm run dev
```

#### 4.2 API動作確認（curl/Postman）

```bash
# 1. 判断履歴取得API（LEVEL_14: 法人全体）
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?startDate=2025-09-20&endDate=2025-10-20&limit=100&offset=0" \
  -H "Authorization: Bearer test-token-level-14"

# 期待される結果:
# {
#   "success": true,
#   "data": {
#     "decisions": [...],  // 100件
#     "total": 100,
#     "summary": {
#       "totalDecisions": 100,
#       "approvalCount": 60,
#       "downgradeCount": 25,
#       "rejectCount": 15,
#       "averageAchievementRate": 82.5,
#       "averageDaysOverdue": 7.2
#     }
#   }
# }

# 2. 判断履歴取得API（LEVEL_7: 部署統計）
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?departmentId=nursing&limit=50&offset=0" \
  -H "Authorization: Bearer test-token-level-7"

# 期待される結果:
# 部署でフィルタリングされた判断履歴

# 3. 期限到達提案一覧API
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-proposals?limit=20&offset=0" \
  -H "Authorization: Bearer test-token-level-7"

# 期待される結果:
# 判断待ちの期限到達提案一覧
```

#### 4.3 フロントエンドUI動作確認

1. ブラウザで `http://localhost:3001` にアクセス
2. LEVEL_7以上のユーザーでログイン
3. サイドバーから「期限到達提案判断」をクリック
4. 提案一覧ページが表示されることを確認
5. 「判断する」ボタンをクリック
6. 判断モーダルが表示されることを確認
7. 判断を入力して「判断を確定」をクリック
8. 判断が記録されることを確認

**成功条件**:
- ✅ 全APIエンドポイントが200 OKを返す
- ✅ 権限レベル別フィルタリングが正しく動作
- ✅ フロントエンドUIが正常に表示される
- ✅ 判断モーダルが正常に動作する

---

### 5. 進捗報告（Slack） ⏰ 16:00

**担当**: プロジェクトリード

**報告内容**:

```markdown
# Phase 6進捗報告（10/21）

## ✅ 完了事項

1. **データベースマイグレーション** ✅
   - `expired_escalation_decisions`テーブル作成完了
   - 既存データ保持成功

2. **テストデータ生成・投入** ✅
   - 100件のテストデータ投入完了
   - 承認: 60件、ダウングレード: 25件、不採用: 15件
   - 権限レベル分布: LEVEL_5-18
   - 施設・部署分布: 適切

3. **テストデータ共有** ✅
   - JSON形式: `mcp-shared/test-data/expired-escalation-history.json`
   - SQL形式: `mcp-shared/test-data/expired-escalation-history.sql`

4. **API動作確認** ✅
   - 全エンドポイント正常動作
   - 権限レベル別フィルタリング確認済み
   - フロントエンドUI正常表示

## 📊 テストデータ統計

- 総件数: 100件
- 承認率: 60%
- ダウングレード率: 25%
- 不採用率: 15%
- 平均到達率: 82.5%
- 平均期限超過日数: 7.2日

## 🎯 明日（10/22）の予定

- MCPサーバーAPI実装開始
- エンドポイント: `/api/mcp/expired-escalation-history`
- 実装予定時間: 10:00-17:00

## 📎 添付ファイル

- テストデータJSON: [expired-escalation-history.json](link)
- テストデータSQL: [expired-escalation-history.sql](link)

---

**担当**: VoiceDriveチーム
**報告日時**: 2025-10-21 16:00
```

**成功条件**:
- ✅ Slackに進捗報告が投稿されている
- ✅ 医療システムチームからの確認返信がある

---

## 📅 今週のスケジュール

| 日付 | 主要タスク | 完了予定時刻 |
|------|-----------|-------------|
| **10/21（月）** | ✅ マイグレーション<br>✅ テストデータ生成<br>✅ テストデータ共有<br>✅ API動作確認 | 17:00 |
| **10/22（火）** | ⏳ MCPサーバーAPI実装開始 | 17:00 |
| **10/23（水）** | ⏳ MCPサーバーAPI実装完了<br>⏳ 統合テスト環境提供<br>⏳ キックオフミーティング（14:00） | 18:00 |
| **10/24（木）** | ⏳ 統合テスト実施 | 17:00 |
| **10/25（金）** | ⏳ パフォーマンステスト | 17:00 |

---

## 🚨 リスクと対応

### リスク1: マイグレーション失敗

**対応**:
- バックアップ取得済み（`prisma/dev.db.backup`）
- 手動SQLマイグレーションで安全に実施

### リスク2: テストデータ生成エラー

**対応**:
- 既存の提案・ユーザーデータを使用
- エラー時はモックデータで代替

### リスク3: API動作不良

**対応**:
- ローカル環境で十分なテスト実施
- エラーログの詳細記録

---

## ✅ チェックリスト

### 10/21（月）完了基準

- [ ] データベースマイグレーション実行完了
- [ ] テストデータ100件投入完了
- [ ] JSON/SQLファイル生成完了
- [ ] テストデータ共有完了（mcp-shared/test-data/）
- [ ] API動作確認完了（全エンドポイント）
- [ ] フロントエンドUI動作確認完了
- [ ] Slack進捗報告完了

---

**作成者**: VoiceDriveチーム プロジェクトリード
**最終更新**: 2025年10月20日
**次回更新予定**: 2025年10月21日 17:00
