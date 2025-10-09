# PostMode と AgendaLevel 統合ガイド

**作成日**: 2025年10月9日
**目的**: 議題モード/プロジェクト化モード表示と6段階議題レベルシステムの統合
**対象**: VoiceDrive開発チーム

---

## 📊 現状の実装レビュー

### ✅ 完璧な点

1. **モード判定ロジック** (`usePostMode.ts`)
   - projectId, projectStatus, enhancedProjectStatus, projectDetails による判定が正確
   - Prisma Schema の Post テーブル設計と完全一致

2. **パネル表示** (`PostAnalysisPanel.tsx`)
   - 議題モード: `DiscussionAnalysisPanel` → 投票分布・議論促進
   - プロジェクト化モード: `ProjectProgressPanel` → 進捗管理・課題追跡

3. **データ生成** (`generateDiscussionData`, `generateProjectData`)
   - 投票スコア計算ロジックが適切
   - レベル判定が実装済み

---

## 🔄 推奨統合ポイント

### 1. `agendaLevel` フィールドの活用

**現状**: `PostAnalysisPanel` は `agendaScore` からレベルを計算していますが、DB に保存された `agendaLevel` を直接使用していません。

#### 推奨実装

**A. `usePostMode.ts` に agendaLevel 情報を追加**

```typescript
// src/hooks/usePostMode.ts

export interface PostModeInfo {
  mode: PostMode;
  isProject: boolean;
  isDiscussion: boolean;
  projectProgress?: number;
  projectStage?: string;

  // 🆕 議題レベル情報を追加
  agendaLevel?: 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';
  agendaScore?: number;
}

export function detectPostMode(post: Post): PostModeInfo {
  // ... 既存のプロジェクト判定 ...

  // デフォルトは議題モード
  return {
    mode: 'discussion',
    isProject: false,
    isDiscussion: true,
    agendaLevel: post.agendaLevel as any, // 🆕 DB の agendaLevel を返す
    agendaScore: post.agendaScore || 0,   // 🆕 スコアも返す
  };
}
```

**B. `PostAnalysisPanel.tsx` で agendaLevel を使用**

```typescript
// src/components/post/PostAnalysisPanel.tsx

function generateDiscussionData(post: Post): DiscussionAnalysisData {
  // 投票データの集計
  const votes = post.votes;
  const totalScore = post.agendaScore || 0; // 🆕 DB のスコアを使用

  // レベル判定（DB の agendaLevel を優先）
  let level = post.agendaLevel || 'PENDING'; // 🆕 DB のレベルを使用
  let levelDisplay = '';
  let icon = '';

  switch (level) {
    case 'PENDING':
      levelDisplay = '検討中';
      icon = '👤';
      break;
    case 'DEPT_REVIEW':
      levelDisplay = '部署検討';
      icon = '🏢';
      break;
    case 'DEPT_AGENDA':
      levelDisplay = '部署議題';
      icon = '🏢🏢';
      break;
    case 'FACILITY_AGENDA':
      levelDisplay = '施設議題';
      icon = '🏢🏢🏢';
      break;
    case 'CORP_REVIEW':
      levelDisplay = '法人検討';
      icon = '🏢🏢🏢🏢';
      break;
    case 'CORP_AGENDA':
      levelDisplay = '法人議題';
      icon = '🏢🏢🏢🏢🏢';
      break;
  }

  return {
    voteDistribution: { /* ... */ },
    scoreInfo: {
      totalScore,
      level: levelDisplay,
      icon,
      agendaLevel: level, // 🆕 議題レベルを明示
    },
    // ...
  };
}
```

---

### 2. 責任者表示の追加

**目的**: 各議題レベルの責任者を表示し、ユーザーに「誰が管理しているか」を明示

#### 推奨実装

```typescript
// src/utils/agendaLevelHelpers.ts (新規作成)

export interface AgendaLevelInfo {
  level: string;
  display: string;
  icon: string;
  scoreRange: string;
  responsible: {
    level: number;
    role: string;
  };
  nextAction: string;
}

export const AGENDA_LEVEL_INFO: Record<string, AgendaLevelInfo> = {
  PENDING: {
    level: 'PENDING',
    display: '検討中',
    icon: '👤',
    scoreRange: '0-29点',
    responsible: {
      level: 5,
      role: '副主任',
    },
    nextAction: '投票継続中',
  },
  DEPT_REVIEW: {
    level: 'DEPT_REVIEW',
    display: '部署検討',
    icon: '🏢',
    scoreRange: '30-49点',
    responsible: {
      level: 6,
      role: '主任',
    },
    nextAction: '部署ミーティング検討',
  },
  DEPT_AGENDA: {
    level: 'DEPT_AGENDA',
    display: '部署議題',
    icon: '🏢🏢',
    scoreRange: '50-99点',
    responsible: {
      level: 8,
      role: '師長・科長・課長',
    },
    nextAction: '施設運営委員会への提出判断',
  },
  FACILITY_AGENDA: {
    level: 'FACILITY_AGENDA',
    display: '施設議題',
    icon: '🏢🏢🏢',
    scoreRange: '100-299点',
    responsible: {
      level: 10,
      role: '部長・医局長',
    },
    nextAction: '法人運営委員会への提出判断',
  },
  CORP_REVIEW: {
    level: 'CORP_REVIEW',
    display: '法人検討',
    icon: '🏢🏢🏢🏢',
    scoreRange: '300-599点',
    responsible: {
      level: 12,
      role: '副院長',
    },
    nextAction: '理事会への提出判断',
  },
  CORP_AGENDA: {
    level: 'CORP_AGENDA',
    display: '法人議題',
    icon: '🏢🏢🏢🏢🏢',
    scoreRange: '600点以上',
    responsible: {
      level: 13,
      role: '院長',
    },
    nextAction: '理事会での最終決定',
  },
};

export function getAgendaLevelInfo(level: string): AgendaLevelInfo {
  return AGENDA_LEVEL_INFO[level] || AGENDA_LEVEL_INFO.PENDING;
}
```

**DiscussionAnalysisPanel での使用例**:

```tsx
// src/components/post/DiscussionAnalysisPanel.tsx

import { getAgendaLevelInfo } from '../../utils/agendaLevelHelpers';

export const DiscussionAnalysisPanel: React.FC<Props> = ({ post, data }) => {
  const levelInfo = getAgendaLevelInfo(post.agendaLevel || 'PENDING');

  return (
    <div className="space-y-4">
      {/* 現在のレベル表示 */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl p-4 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-400 mb-1">現在の議題レベル</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <span>{levelInfo.icon}</span>
              <span>{levelInfo.display}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              スコア: {data.scoreInfo.totalScore}点 ({levelInfo.scoreRange})
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-400 mb-1">責任者</div>
            <div className="text-lg font-bold text-white">{levelInfo.responsible.role}</div>
            <div className="text-xs text-gray-400">Level {levelInfo.responsible.level}</div>
          </div>
        </div>

        {/* 次のアクション */}
        <div className="mt-3 pt-3 border-t border-blue-500/20">
          <div className="text-sm text-blue-400 mb-1">次のステップ</div>
          <div className="text-sm text-gray-300">{levelInfo.nextAction}</div>
        </div>
      </div>

      {/* 既存の投票分布・反対意見・議論促進セクション */}
      {/* ... */}
    </div>
  );
};
```

---

### 3. 委員会提出フローとの連携

**目的**: `DEPT_AGENDA` 以上のレベルで、委員会への提出状況を表示

#### 推奨実装

**A. 型定義の拡張**

```typescript
// src/types/postMode.ts

export interface DiscussionAnalysisData {
  // ... 既存のフィールド ...

  // 🆕 委員会提出情報
  committeeSubmission?: {
    isSubmittable: boolean;           // 提出可能か
    submittedToCommittee?: string;    // 提出先委員会名
    submissionStatus?: 'pending' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
    submittedBy?: string;             // 提出者
    submittedDate?: Date;             // 提出日
    reviewedBy?: string;              // 審査者
    reviewedDate?: Date;              // 審査日
  };
}
```

**B. データ生成時に委員会情報を含める**

```typescript
// src/components/post/PostAnalysisPanel.tsx

function generateDiscussionData(post: Post): DiscussionAnalysisData {
  // ... 既存のコード ...

  // 🆕 委員会提出情報の生成
  let committeeSubmission: DiscussionAnalysisData['committeeSubmission'];

  if (post.agendaLevel && ['DEPT_AGENDA', 'FACILITY_AGENDA', 'CORP_REVIEW', 'CORP_AGENDA'].includes(post.agendaLevel)) {
    committeeSubmission = {
      isSubmittable: true,
      // TODO: 実際のプロジェクトでは、CommitteeSubmissionService から取得
      submittedToCommittee: post.agendaLevel === 'DEPT_AGENDA' ? '施設運営委員会' : '法人運営委員会',
      submissionStatus: 'pending', // デフォルト
    };
  }

  return {
    voteDistribution: { /* ... */ },
    scoreInfo: { /* ... */ },
    participation: { /* ... */ },
    oppositionSummary,
    discussionPrompts,
    nextMilestone: { /* ... */ },
    committeeSubmission, // 🆕 追加
  };
}
```

**C. DiscussionAnalysisPanel で委員会情報を表示**

```tsx
// src/components/post/DiscussionAnalysisPanel.tsx

{data.committeeSubmission && (
  <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
    <div className="flex items-center gap-2 mb-3">
      <Building2 className="w-5 h-5 text-purple-400" />
      <h3 className="text-lg font-bold text-white">委員会提出</h3>
    </div>

    {data.committeeSubmission.isSubmittable && !data.committeeSubmission.submittedToCommittee && (
      <div className="text-sm text-gray-300">
        このレベルは委員会への提出が可能です
      </div>
    )}

    {data.committeeSubmission.submittedToCommittee && (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-400">提出先</span>
          <span className="text-sm font-medium text-white">
            {data.committeeSubmission.submittedToCommittee}
          </span>
        </div>

        {data.committeeSubmission.submissionStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-400">ステータス</span>
            <span className={`text-sm font-medium ${
              data.committeeSubmission.submissionStatus === 'approved' ? 'text-green-400' :
              data.committeeSubmission.submissionStatus === 'rejected' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {data.committeeSubmission.submissionStatus === 'pending' ? '承認待ち' :
               data.committeeSubmission.submissionStatus === 'submitted' ? '提出済み' :
               data.committeeSubmission.submissionStatus === 'reviewing' ? '審査中' :
               data.committeeSubmission.submissionStatus === 'approved' ? '承認' : '却下'}
            </span>
          </div>
        )}

        {data.committeeSubmission.submittedBy && (
          <div className="text-xs text-gray-400">
            提出者: {data.committeeSubmission.submittedBy}
            {data.committeeSubmission.submittedDate &&
              ` (${data.committeeSubmission.submittedDate.toLocaleDateString('ja-JP')})`}
          </div>
        )}
      </div>
    )}
  </div>
)}
```

---

### 4. 医療システム連携への準備

**目的**: 将来的に医療職員管理システムと連携する際の準備

#### 連携ポイント

**A. 責任者情報の取得**

```typescript
// src/services/PostManagementService.ts (新規)

import { apiVersionManager } from '../mcp-shared/api/api-version-manager';

export class PostManagementService {
  /**
   * 議題レベルの責任者情報を取得
   * 将来的に医療システムAPIから取得
   */
  async getResponsiblePerson(agendaLevel: string, facilityId: string) {
    // 🔄 MySQL移行後は医療システムAPIを呼び出し
    // const endpoint = apiVersionManager.getEndpoint('post-management', 'getResponsible');
    // const response = await fetch(`${endpoint}?agendaLevel=${agendaLevel}&facilityId=${facilityId}`);

    // 現在はローカルデータを返す
    const levelInfo = getAgendaLevelInfo(agendaLevel);
    return {
      level: levelInfo.responsible.level,
      role: levelInfo.responsible.role,
      name: 'サンプル責任者', // 🔄 医療システムから取得予定
      department: 'サンプル部署', // 🔄 医療システムから取得予定
    };
  }

  /**
   * 委員会メンバー情報を取得
   * 将来的に医療システムAPIから取得
   */
  async getCommitteeMembers(committeeName: string) {
    // 🔄 MySQL移行後は医療システムAPIを呼び出し
    // const endpoint = apiVersionManager.getEndpoint('post-management', 'getCommitteeMembers');
    // const response = await fetch(`${endpoint}?committee=${committeeName}`);

    // 現在はローカルデータを返す
    return [
      { name: 'サンプル委員長', role: 'chairman' },
      { name: 'サンプル委員1', role: 'member' },
      { name: 'サンプル委員2', role: 'member' },
    ];
  }
}
```

**B. API Version Manager への登録**

```typescript
// mcp-shared/api/api-version-manager.ts

const API_ENDPOINTS = {
  // ... 既存のエンドポイント ...

  'post-management': {
    version: '1.0.0',
    endpoints: {
      getResponsible: {
        path: '/api/medical-system/post-management/responsible',
        method: 'GET',
        description: '議題レベルの責任者情報取得',
        implementedIn: 'Phase 15.x', // 🔄 共通DB構築後
      },
      getCommitteeMembers: {
        path: '/api/medical-system/post-management/committee-members',
        method: 'GET',
        description: '委員会メンバー情報取得',
        implementedIn: 'Phase 15.x', // 🔄 共通DB構築後
      },
    },
  },
};
```

---

## 📋 実装チェックリスト

### Phase 1: 基本統合（すぐ実装可能）

- [ ] `usePostMode.ts` に `agendaLevel`, `agendaScore` を追加
- [ ] `PostAnalysisPanel.tsx` で DB の `agendaLevel` を使用
- [ ] `agendaLevelHelpers.ts` を作成（責任者情報定義）
- [ ] `DiscussionAnalysisPanel.tsx` に責任者表示を追加

### Phase 2: 委員会連携（すぐ実装可能）

- [ ] `DiscussionAnalysisData` に `committeeSubmission` フィールド追加
- [ ] `generateDiscussionData()` で委員会情報を生成
- [ ] `DiscussionAnalysisPanel.tsx` に委員会情報セクション追加
- [ ] `CommitteeSubmissionService` との連携実装

### Phase 3: 医療システム連携（MySQL移行後）

- [ ] `PostManagementService.ts` 作成
- [ ] `getResponsiblePerson()` API実装
- [ ] `getCommitteeMembers()` API実装
- [ ] 医療システムチームとの連携テスト

---

## 🔗 関連ドキュメント

| ドキュメント | 作成日 | 関連箇所 |
|------------|--------|---------|
| [PostManagement_DB要件分析_20251009.md](./PostManagement_DB要件分析_20251009.md) | 10/9 | 6段階議題化レベル定義 |
| [PostTracking_DB要件分析_20251009.md](./PostTracking_DB要件分析_20251009.md) | 10/9 | 投稿追跡システム |
| [ManagementCommittee_DB要件分析_20251009.md](./ManagementCommittee_DB要件分析_20251009.md) | 10/9 | 運営委員会との連携 |
| [ComposeForm_DB要件分析_20251009.md](./ComposeForm_DB要件分析_20251009.md) | 10/9 | 投稿作成フォーム |

---

## 🎉 まとめ

### ✅ 現状の実装は完璧

- モード判定ロジックが正確
- Prisma Schema との整合性が取れている
- パネル表示が適切に分離されている

### 📝 推奨追加実装

1. **`agendaLevel` の直接使用** → DB の値を信頼して使用
2. **責任者情報の表示** → ユーザーに「誰が管理しているか」を明示
3. **委員会提出情報の追加** → 提出先・ステータスを表示
4. **医療システム連携の準備** → API Version Manager への登録

### 🚀 実装タイミング

- **Phase 1-2**: 今すぐ実装可能（VoiceDrive内部のみ）
- **Phase 3**: MySQL移行後（医療システム連携）

---

**最終更新**: 2025年10月9日
**作成者**: Claude (AI Assistant)
**レビュー**: VoiceDrive開発チーム
