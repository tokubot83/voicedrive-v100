# TeamLeaderService.ts 実装計画

**文書番号**: VD-IMPL-TEAMLEADER-SERVICE-2025-1009-001
**作成日**: 2025年10月9日
**対象**: VoiceDriveチーム
**目的**: TeamLeaderDashboard用サービスレイヤー実装計画
**Phase**: 8.5（2025年11月18日〜26日）
**参照文書**:
- [TeamLeaderDashboard_DB要件分析_20251009.md](./TeamLeaderDashboard_DB要件分析_20251009.md)
- [TeamLeaderDashboard暫定マスターリスト_20251009.md](./TeamLeaderDashboard暫定マスターリスト_20251009.md)

---

## 📋 概要

TeamLeaderDashboardページのバックエンドロジックを担当するサービスクラス。

**主要機能**:
1. 承認待ちタスク取得・管理
2. チームメンバー情報取得（DepartmentStation API-3流用）
3. 最近の活動集計
4. チーム統計算出

**データソース**:
- 🔵 医療システム: DepartmentStation API-3（チームメンバー情報）
- 🟢 VoiceDrive: ApprovalTask、Post、Vote、UserActivity

---

## 🎯 実装対象メソッド

### 1. getTeamMembers() - チームメンバー情報取得

**目的**: リーダーの部門メンバーを"チーム"として取得

**実装方針**: Option B採用（Team = Department）

```typescript
/**
 * チームメンバー情報を取得
 * @param leaderId - リーダーのemployeeId
 * @returns チームメンバー情報
 */
async getTeamMembers(leaderId: string): Promise<TeamMember[]> {
  // 1. 医療システムAPIからリーダーのdepartmentを取得
  const leaderInfo = await medicalSystemAPI.getEmployeeInfo(leaderId);

  // 2. DepartmentStation API-3を呼び出し
  const departmentData = await medicalSystemAPI.getDepartmentMembers(leaderInfo.department);

  // 3. VoiceDrive形式に変換
  const teamMembers = departmentData.members.map(member => ({
    id: member.employeeId,
    name: member.name,
    role: member.position,  // positionをroleとして表示
    status: member.status,
    performance: this.calculatePerformance(member)
  }));

  return teamMembers;
}

/**
 * パフォーマンススコアを算出（暫定実装）
 * Phase 8.6でV3Assessmentデータを統合予定
 */
private calculatePerformance(member: any): number {
  // 暫定的にpermissionLevelから算出
  return Math.min(member.permissionLevel * 30 + 50, 100);
}
```

**データソース**:
- API-1: `GET /api/employees/{employeeId}` - リーダー情報取得
- API-3: `GET /api/employees/department/{departmentId}` - 部門メンバー取得

**戻り値型**:
```typescript
interface TeamMember {
  id: string;           // employeeId
  name: string;         // 氏名
  role: string;         // 役職（position）
  status: string;       // ステータス（active, vacation等）
  performance: number;  // パフォーマンススコア（0-100）
}
```

---

### 2. getPendingApprovals() - 承認待ちタスク取得

**目的**: リーダーが承認すべきタスク一覧を取得

**実装方針**: ApprovalTaskテーブルからステータス「PENDING」を抽出

```typescript
/**
 * 承認待ちタスクを取得
 * @param leaderId - リーダーのemployeeId
 * @returns 承認待ちタスク一覧
 */
async getPendingApprovals(leaderId: string): Promise<ApprovalTask[]> {
  // 1. ApprovalTaskテーブルから「PENDING」タスクを検索
  const pendingTasks = await prisma.approvalTask.findMany({
    where: {
      approverId: leaderId,
      status: 'PENDING'
    },
    include: {
      submitter: true  // 申請者情報を含める
    },
    orderBy: {
      submittedAt: 'desc'
    }
  });

  return pendingTasks;
}
```

**データソース**:
- VoiceDrive `ApprovalTask` テーブル

**戻り値型**:
```typescript
interface ApprovalTask {
  id: string;
  taskType: string;      // BUDGET_REQUEST, TRAINING_REQUEST等
  title: string;
  description: string;
  amount: number | null;
  submitterId: string;
  submitter: {
    employeeId: string;
    name: string;
  };
  approverId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: Date;
}
```

---

### 3. respondToApproval() - 承認/却下操作

**目的**: リーダーが承認待ちタスクに回答

**実装方針**: ApprovalTaskテーブルのステータス更新

```typescript
/**
 * 承認タスクに回答
 * @param taskId - タスクID
 * @param decision - 承認/却下
 * @param comment - コメント（任意）
 */
async respondToApproval(
  taskId: string,
  decision: 'APPROVED' | 'REJECTED',
  comment?: string
): Promise<ApprovalTask> {
  // 1. ApprovalTaskのステータスを更新
  const updatedTask = await prisma.approvalTask.update({
    where: { id: taskId },
    data: {
      status: decision,
      approvedAt: new Date(),
      approverComment: comment
    }
  });

  // 2. UserActivityに記録
  await prisma.userActivity.create({
    data: {
      userId: updatedTask.approverId,
      activityType: `APPROVAL_${decision}`,
      targetId: taskId,
      targetType: 'APPROVAL_TASK'
    }
  });

  return updatedTask;
}
```

**データソース**:
- VoiceDrive `ApprovalTask` テーブル（更新）
- VoiceDrive `UserActivity` テーブル（記録）

---

### 4. getRecentActivities() - 最近の活動取得

**目的**: チーム内の最新活動を集計

**実装方針**: Post、Vote、ApprovalTaskから最新活動を取得

```typescript
/**
 * チーム内の最近の活動を取得
 * @param leaderId - リーダーのemployeeId
 * @param limit - 取得件数（デフォルト10件）
 */
async getRecentActivities(leaderId: string, limit = 10): Promise<Activity[]> {
  // 1. リーダーのチームメンバーIDを取得
  const teamMembers = await this.getTeamMembers(leaderId);
  const memberIds = teamMembers.map(m => m.id);

  // 2. 最新のPost、Vote、ApprovalTaskを取得
  const activities: Activity[] = [];

  // 2a. 最新の投稿
  const recentPosts = await prisma.post.findMany({
    where: { userId: { in: memberIds } },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  activities.push(...recentPosts.map(post => ({
    id: post.id,
    type: 'post' as const,
    message: `${post.user.name}さんが投稿しました`,
    time: this.formatRelativeTime(post.createdAt)
  })));

  // 2b. 最新の投票
  const recentVotes = await prisma.vote.findMany({
    where: { userId: { in: memberIds } },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: true, post: true }
  });

  activities.push(...recentVotes.map(vote => ({
    id: vote.id,
    type: 'vote' as const,
    message: `${vote.user.name}さんが投票しました`,
    time: this.formatRelativeTime(vote.createdAt)
  })));

  // 2c. 最新の承認タスク
  const recentApprovals = await prisma.approvalTask.findMany({
    where: {
      OR: [
        { submitterId: { in: memberIds } },
        { approverId: leaderId }
      ]
    },
    take: limit,
    orderBy: { submittedAt: 'desc' },
    include: { submitter: true }
  });

  activities.push(...recentApprovals.map(approval => ({
    id: approval.id,
    type: 'approval' as const,
    message: approval.status === 'APPROVED'
      ? `${approval.title}が承認されました`
      : `新しい${approval.title}が提出されました`,
    time: this.formatRelativeTime(approval.submittedAt)
  })));

  // 3. 時系列順にソートして上位limit件を返す
  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit);
}

/**
 * 相対時間フォーマット（例: "30分前"）
 */
private formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  return `${days}日前`;
}
```

**データソース**:
- VoiceDrive `Post` テーブル
- VoiceDrive `Vote` テーブル
- VoiceDrive `ApprovalTask` テーブル

**戻り値型**:
```typescript
interface Activity {
  id: string;
  type: 'post' | 'vote' | 'approval';
  message: string;
  time: string;  // 相対時間（例: "30分前"）
}
```

---

### 5. getTeamMetrics() - チーム統計算出

**目的**: チームの主要指標を算出

**実装方針**: VoiceDriveデータから集計

```typescript
/**
 * チーム統計を算出
 * @param leaderId - リーダーのemployeeId
 */
async getTeamMetrics(leaderId: string): Promise<TeamMetrics> {
  // 1. チームメンバー数を取得
  const teamMembers = await this.getTeamMembers(leaderId);
  const memberCount = teamMembers.length;

  // 2. 承認待ち件数を取得
  const pendingApprovals = await this.getPendingApprovals(leaderId);
  const pendingCount = pendingApprovals.length;

  // 3. チーム効率を算出（承認タスク完了率）
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const approvalTasks = await prisma.approvalTask.findMany({
    where: {
      approverId: leaderId,
      submittedAt: { gte: last30Days }
    }
  });

  const approvedTasks = approvalTasks.filter(t => t.status === 'APPROVED').length;
  const teamEfficiency = approvalTasks.length > 0
    ? Math.round((approvedTasks / approvalTasks.length) * 100)
    : 0;

  return {
    memberCount,
    pendingApprovals: pendingCount,
    teamEfficiency
  };
}
```

**データソース**:
- 🔵 医療システム: API-3（メンバー数）
- 🟢 VoiceDrive: ApprovalTask（効率、承認待ち件数）

**戻り値型**:
```typescript
interface TeamMetrics {
  memberCount: number;       // チームメンバー数
  pendingApprovals: number;  // 承認待ち件数
  teamEfficiency: number;    // チーム効率（承認タスク完了率 0-100）
}
```

---

## 📦 ファイル構成

### 新規作成ファイル

```
src/services/TeamLeaderService.ts
```

### 依存ファイル

```typescript
// 既存ファイル
import { MedicalSystemAPI } from './MedicalSystemAPI';
import { prisma } from '../lib/prisma';

// 既存モデル（Prisma Schema）
// - ApprovalTask
// - Post
// - Vote
// - UserActivity
```

---

## 🔧 実装手順

### Step 1: TeamLeaderService.tsの作成

```typescript
// src/services/TeamLeaderService.ts

import { MedicalSystemAPI } from './MedicalSystemAPI';
import { prisma } from '../lib/prisma';

class TeamLeaderService {
  private medicalAPI: MedicalSystemAPI;

  constructor() {
    this.medicalAPI = new MedicalSystemAPI();
  }

  // メソッド実装（上記参照）
  async getTeamMembers(leaderId: string) { /* ... */ }
  async getPendingApprovals(leaderId: string) { /* ... */ }
  async respondToApproval(taskId: string, decision: 'APPROVED' | 'REJECTED', comment?: string) { /* ... */ }
  async getRecentActivities(leaderId: string, limit = 10) { /* ... */ }
  async getTeamMetrics(leaderId: string) { /* ... */ }

  // ヘルパーメソッド
  private calculatePerformance(member: any): number { /* ... */ }
  private formatRelativeTime(date: Date): string { /* ... */ }
}

export const teamLeaderService = new TeamLeaderService();
```

### Step 2: TeamLeaderDashboard.tsxの修正

```typescript
// src/components/dashboards/TeamLeaderDashboard.tsx

import { teamLeaderService } from '../../services/TeamLeaderService';

const TeamLeaderDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalTask[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!currentUser?.employeeId) return;

    const loadData = async () => {
      try {
        // 並列データ取得
        const [metrics, members, approvals, activities] = await Promise.all([
          teamLeaderService.getTeamMetrics(currentUser.employeeId),
          teamLeaderService.getTeamMembers(currentUser.employeeId),
          teamLeaderService.getPendingApprovals(currentUser.employeeId),
          teamLeaderService.getRecentActivities(currentUser.employeeId)
        ]);

        setTeamMetrics(metrics);
        setTeamMembers(members);
        setPendingApprovals(approvals);
        setRecentActivities(activities);
      } catch (error) {
        console.error('チームデータ取得エラー:', error);
      }
    };

    loadData();
  }, [currentUser?.employeeId]);

  // 承認/却下ハンドラー
  const handleApproval = async (taskId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await teamLeaderService.respondToApproval(taskId, decision);
      // データ再取得
      const updatedApprovals = await teamLeaderService.getPendingApprovals(currentUser.employeeId);
      setPendingApprovals(updatedApprovals);
    } catch (error) {
      console.error('承認操作エラー:', error);
    }
  };

  // UIレンダリング（既存コードを維持、ダミーデータをstateに置き換え）
  // ...
};
```

### Step 3: チームモラルセクションのコメントアウト

```typescript
// TeamLeaderDashboard.tsx:224-246

{/* Phase 8.6まで非表示
<div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
    <span className="text-2xl">😊</span>
    チームモラル
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-4xl mb-2">😊</div>
      <p className="text-gray-400">満足度</p>
      <p className="text-2xl font-bold text-white">{teamMetrics.moraleScore}%</p>
    </div>
    <div className="text-center">
      <div className="text-4xl mb-2">🎯</div>
      <p className="text-gray-400">目標達成率</p>
      <p className="text-2xl font-bold text-white">92%</p>
    </div>
    <div className="text-center">
      <div className="text-4xl mb-2">💬</div>
      <p className="text-gray-400">コミュニケーション</p>
      <p className="text-2xl font-bold text-white">良好</p>
    </div>
  </div>
</div>
*/}
```

---

## 🧪 テスト計画

### ユニットテスト

```typescript
// src/services/__tests__/TeamLeaderService.test.ts

describe('TeamLeaderService', () => {
  describe('getTeamMembers', () => {
    it('should fetch team members using API-3', async () => {
      // モックAPI応答
      // アサーション
    });
  });

  describe('getPendingApprovals', () => {
    it('should fetch PENDING approval tasks', async () => {
      // モックDB応答
      // アサーション
    });
  });

  describe('respondToApproval', () => {
    it('should update approval task status', async () => {
      // モックDB更新
      // アサーション
    });
  });

  describe('getRecentActivities', () => {
    it('should aggregate activities from Post, Vote, ApprovalTask', async () => {
      // モックDB応答
      // アサーション
    });
  });

  describe('getTeamMetrics', () => {
    it('should calculate team metrics correctly', async () => {
      // モックデータ
      // アサーション
    });
  });
});
```

### 統合テスト

```typescript
// src/__tests__/integration/TeamLeaderDashboard.integration.test.ts

describe('TeamLeaderDashboard Integration', () => {
  it('should load team data on mount', async () => {
    render(<TeamLeaderDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/チームメンバー/)).toBeInTheDocument();
    });
  });

  it('should handle approval/rejection actions', async () => {
    render(<TeamLeaderDashboard />);
    const approveButton = screen.getByText('承認');
    fireEvent.click(approveButton);
    await waitFor(() => {
      expect(screen.queryByText('承認待ち')).not.toBeInTheDocument();
    });
  });
});
```

---

## 📅 実装スケジュール（Phase 8.5）

| 日付 | タスク | 担当 |
|------|--------|------|
| 11/18（月） | TeamLeaderService.ts実装開始 | Backend |
| 11/19（火） | getTeamMembers、getPendingApprovals実装 | Backend |
| 11/20（水） | respondToApproval、getRecentActivities実装 | Backend |
| 11/21（木） | getTeamMetrics実装、ユニットテスト | Backend |
| 11/22（金） | TeamLeaderDashboard.tsx修正開始 | Frontend |
| 11/25（月） | UI統合、統合テスト | Frontend + Backend |
| 11/26（火） | 最終確認、Phase 8.5完了 | 全員 |

---

## 📝 注意事項

### Option B採用による影響

- ✅ **Team = Department**: 医療システムの「部門」を「チーム」として扱う
- ✅ **API-3流用**: DepartmentStationの既存APIを使用（追加コストなし）
- ⏸️ **チームモラル機能**: Phase 8.6まで非表示（API-6未実装）

### Phase 8.6への引き継ぎ事項

- チームモラルセクションの実装準備（コメントアウト箇所）
- API-6統合時の修正ポイント
- パフォーマンススコア算出ロジックの改善（V3Assessmentデータ統合）

---

**文書終了**

最終更新: 2025年10月9日
次回更新予定: Phase 8.5開始時（2025年11月18日）
