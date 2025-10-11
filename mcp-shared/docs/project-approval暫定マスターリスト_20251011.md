# ProjectApproval 暫定マスターリスト

**文書番号**: VD-MASTER-PROJECT-APPROVAL-20251011
**作成日**: 2025年10月11日
**対象ページ**: https://voicedrive-v100.vercel.app/project-approval
**対象ユーザー**: 承認権限を持つリーダー・管理者（権限レベル 3.5+）
**前提**: DB要件分析書（VD-DB-ANALYSIS-PROJECT-APPROVAL-20251011）に基づく

---

## 📋 マスターリスト概要

### 目的
ProjectApprovalページの実装に必要な **全ての作業項目** を時系列・優先順位順にリストアップし、実装漏れを防ぐ。

### 対象範囲
- データベース設計・マイグレーション
- サービス層実装
- API実装
- フロントエンド統合
- テスト
- デプロイ

### 実装期間
**4日間**（10/11金 - 10/16水）

---

## 🗂️ Phase 1: データベース実装（Day 1: 10/11金）

### 1-1. Prisma Schema更新

**タスクID**: PA-DB-001
**優先度**: 🔴 最高
**所要時間**: 30分
**担当**: Backend
**依存関係**: なし

**作業内容**:
- [ ] `schema.prisma`に`ProjectApproval`テーブル追加
- [ ] `Post`テーブルに以下フィールド追加:
  - `approvalStatus` (String?, default: "pending")
  - `approvedAt` (DateTime?)
  - `approvedBy` (String?)
  - `rejectedAt` (DateTime?)
  - `rejectedBy` (String?)
  - `rejectionReason` (String?)
- [ ] `User`テーブルにリレーション追加:
  - `projectApprovals` (ProjectApproval[])
- [ ] `Post`テーブルにリレーション追加:
  - `approvals` (ProjectApproval[])
- [ ] インデックス追加:
  - `Post`: `@@index([approvalStatus, createdAt])`
  - `ProjectApproval`: `@@index([approverId, projectLevel])`

**検証方法**:
```bash
npx prisma format
npx prisma validate
```

---

### 1-2. マイグレーション実行

**タスクID**: PA-DB-002
**優先度**: 🔴 最高
**所要時間**: 15分
**担当**: Backend
**依存関係**: PA-DB-001

**作業内容**:
- [ ] マイグレーションファイル生成
- [ ] マイグレーション実行（開発環境）
- [ ] マイグレーション確認

**コマンド**:
```bash
npx prisma migrate dev --name add_project_approval
npx prisma generate
```

**検証方法**:
```bash
# DBを確認
npx prisma studio
# ProjectApprovalテーブルが存在するか確認
# Postテーブルに新フィールドが存在するか確認
```

---

### 1-3. サンプルデータ投入（開発用）

**タスクID**: PA-DB-003
**優先度**: 🟡 中
**所要時間**: 30分
**担当**: Backend
**依存関係**: PA-DB-002

**作業内容**:
- [ ] 承認待ちプロジェクト作成（5件）
- [ ] 承認済みプロジェクト作成（3件）
- [ ] 却下済みプロジェクト作成（2件）
- [ ] 各プロジェクトに投票データ追加

**スクリプト**:
```typescript
// prisma/seed/projectApprovalSeed.ts
async function seedProjectApprovals() {
  // 承認待ちプロジェクト
  const pendingProjects = await prisma.post.createMany({
    data: [
      {
        type: 'improvement',
        proposalType: 'operational',
        content: '電子カルテシステムの刷新プロジェクト',
        authorId: 'user-1',
        anonymityLevel: 'facility_all',
        approvalStatus: 'pending'
      },
      // ... 他4件
    ]
  });

  // 投票データ追加
  // ...
}
```

---

## 🎨 Phase 2: サービス層実装（Day 1-2: 10/11金-10/14月）

### 2-1. ProjectApprovalService基本実装

**タスクID**: PA-SVC-001
**優先度**: 🔴 最高
**所要時間**: 3時間
**担当**: Backend
**依存関係**: PA-DB-002

**作業内容**:
- [ ] `src/services/ProjectApprovalService.ts` 作成
- [ ] 以下メソッド実装:
  - `approveProject(postId, approverId, comment?)`
  - `rejectProject(postId, approverId, reason)`
  - `holdProject(postId, approverId, reason)`
  - `emergencyOverride(postId, approverId)`
  - `getApprovableProjects(userId, filter)`
  - `calculateScore(votes)` (private)
  - `getProjectLevel(score)` (private)

**実装例**:
```typescript
// src/services/ProjectApprovalService.ts
import { prisma } from '../lib/prisma';
import { projectPermissionService } from './ProjectPermissionService';

export class ProjectApprovalService {
  async approveProject(
    postId: string,
    approverId: string,
    comment?: string
  ) {
    // 1. 権限チェック
    // 2. プロジェクト取得
    // 3. スコア計算
    // 4. トランザクション処理
    //    - Post更新
    //    - ProjectApproval作成
    return { post, approval };
  }

  // ... 他メソッド
}

export const projectApprovalService = new ProjectApprovalService();
```

**検証方法**:
- [ ] ユニットテスト実行（後述）

---

### 2-2. ユニットテスト作成

**タスクID**: PA-SVC-002
**優先度**: 🟠 高
**所要時間**: 2時間
**担当**: Backend
**依存関係**: PA-SVC-001

**作業内容**:
- [ ] `src/services/__tests__/ProjectApprovalService.test.ts` 作成
- [ ] 以下テストケース実装:
  - 承認成功（権限あり）
  - 承認失敗（権限なし）
  - 却下成功（理由あり）
  - 保留成功
  - 緊急介入成功（上位者）
  - 緊急介入失敗（権限なし）
  - スコア計算（各投票パターン）
  - プロジェクトレベル判定

**実装例**:
```typescript
// src/services/__tests__/ProjectApprovalService.test.ts
describe('ProjectApprovalService', () => {
  describe('approveProject', () => {
    it('権限を持つユーザーがプロジェクトを承認できる', async () => {
      // Arrange
      const postId = 'post-1';
      const approverId = 'user-8'; // Level 8

      // Act
      const result = await projectApprovalService.approveProject(postId, approverId);

      // Assert
      expect(result.post.approvalStatus).toBe('approved');
      expect(result.approval.action).toBe('approved');
    });

    it('権限がないユーザーは承認できない', async () => {
      // Arrange
      const postId = 'post-1';
      const approverId = 'user-3'; // Level 3

      // Act & Assert
      await expect(
        projectApprovalService.approveProject(postId, approverId)
      ).rejects.toThrow('このプロジェクトを承認する権限がありません');
    });
  });

  // ... 他テストケース
});
```

**検証コマンド**:
```bash
npm test -- ProjectApprovalService.test.ts
```

---

### 2-3. エラーハンドリング実装

**タスクID**: PA-SVC-003
**優先度**: 🟠 高
**所要時間**: 1時間
**担当**: Backend
**依存関係**: PA-SVC-001

**作業内容**:
- [ ] カスタムエラークラス作成
- [ ] エラーメッセージ定義
- [ ] エラーログ記録

**実装例**:
```typescript
// src/errors/ProjectApprovalError.ts
export class ProjectApprovalError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ProjectApprovalError';
  }
}

// エラーコード定義
export const ProjectApprovalErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  APPROVER_NOT_FOUND: 'APPROVER_NOT_FOUND',
  INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION',
  ALREADY_APPROVED: 'ALREADY_APPROVED',
  ALREADY_REJECTED: 'ALREADY_REJECTED',
  INVALID_PROJECT_STATUS: 'INVALID_PROJECT_STATUS'
};
```

---

## 🌐 Phase 3: API実装（Day 2: 10/14月）

### 3-1. API認証・認可ミドルウェア

**タスクID**: PA-API-001
**優先度**: 🔴 最高
**所要時間**: 1時間
**担当**: Backend
**依存関係**: なし

**作業内容**:
- [ ] `src/middleware/authMiddleware.ts` 確認・拡張
- [ ] プロジェクト承認専用の権限チェック追加

**実装例**:
```typescript
// src/middleware/projectApprovalAuth.ts
export const requireProjectApprovalPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  // 権限レベルチェック（最低3.5必要）
  if (user.permissionLevel < 3.5) {
    return res.status(403).json({
      error: 'プロジェクト承認機能を利用する権限がありません'
    });
  }

  next();
};
```

---

### 3-2. POST /api/project-approval/approve

**タスクID**: PA-API-002
**優先度**: 🔴 最高
**所要時間**: 1時間
**担当**: Backend
**依存関係**: PA-SVC-001, PA-API-001

**作業内容**:
- [ ] `src/routes/projectApproval.ts` 作成
- [ ] エンドポイント実装
- [ ] リクエストバリデーション
- [ ] レスポンス形式定義

**実装例**:
```typescript
// src/routes/projectApproval.ts
import express from 'express';
import { projectApprovalService } from '../services/ProjectApprovalService';
import { requireProjectApprovalPermission } from '../middleware/projectApprovalAuth';

const router = express.Router();

// プロジェクト承認
router.post('/approve', requireProjectApprovalPermission, async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const approverId = req.user.id;

    // バリデーション
    if (!postId) {
      return res.status(400).json({ error: 'postIdが必要です' });
    }

    // サービス呼び出し
    const result = await projectApprovalService.approveProject(
      postId,
      approverId,
      comment
    );

    res.json({
      success: true,
      post: result.post,
      approval: result.approval
    });
  } catch (error) {
    console.error('プロジェクト承認エラー:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'プロジェクト承認に失敗しました'
    });
  }
});

export default router;
```

---

### 3-3. POST /api/project-approval/reject

**タスクID**: PA-API-003
**優先度**: 🔴 最高
**所要時間**: 45分
**担当**: Backend
**依存関係**: PA-SVC-001, PA-API-001

**作業内容**:
- [ ] エンドポイント実装
- [ ] 却下理由バリデーション（必須）

**実装例**:
```typescript
// プロジェクト却下
router.post('/reject', requireProjectApprovalPermission, async (req, res) => {
  try {
    const { postId, reason } = req.body;
    const approverId = req.user.id;

    // バリデーション
    if (!postId || !reason) {
      return res.status(400).json({
        error: 'postIdとreasonが必要です'
      });
    }

    const result = await projectApprovalService.rejectProject(
      postId,
      approverId,
      reason
    );

    res.json({
      success: true,
      post: result.post,
      approval: result.approval
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'プロジェクト却下に失敗しました'
    });
  }
});
```

---

### 3-4. POST /api/project-approval/hold

**タスクID**: PA-API-004
**優先度**: 🟠 高
**所要時間**: 45分
**担当**: Backend
**依存関係**: PA-SVC-001, PA-API-001

**作業内容**:
- [ ] エンドポイント実装
- [ ] 保留理由バリデーション（必須）

---

### 3-5. POST /api/project-approval/emergency-override

**タスクID**: PA-API-005
**優先度**: 🟠 高
**所要時間**: 1時間
**担当**: Backend
**依存関係**: PA-SVC-001, PA-API-001

**作業内容**:
- [ ] エンドポイント実装
- [ ] 上位者権限チェック（canEmergencyOverride）
- [ ] 監査ログ記録（severity: critical）

**実装例**:
```typescript
// 緊急介入
router.post('/emergency-override', requireProjectApprovalPermission, async (req, res) => {
  try {
    const { postId } = req.body;
    const approverId = req.user.id;

    if (!postId) {
      return res.status(400).json({ error: 'postIdが必要です' });
    }

    const result = await projectApprovalService.emergencyOverride(
      postId,
      approverId
    );

    res.json({
      success: true,
      post: result.post,
      approval: result.approval,
      warning: 'この操作は監査ログに記録されました（重要度: critical）'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || '緊急介入に失敗しました'
    });
  }
});
```

---

### 3-6. GET /api/project-approval/approvable

**タスクID**: PA-API-006
**優先度**: 🔴 最高
**所要時間**: 1.5時間
**担当**: Backend
**依存関係**: PA-SVC-001, PA-API-001

**作業内容**:
- [ ] エンドポイント実装
- [ ] クエリパラメータ処理（projectLevel, limit, offset）
- [ ] ページング実装
- [ ] レスポンス形式定義

**実装例**:
```typescript
// 承認可能なプロジェクト一覧
router.get('/approvable', requireProjectApprovalPermission, async (req, res) => {
  try {
    const userId = req.user.id;
    const projectLevel = req.query.projectLevel as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const projects = await projectApprovalService.getApprovableProjects(
      userId,
      { projectLevel, limit, offset }
    );

    res.json({
      projects,
      pagination: {
        limit,
        offset,
        totalCount: projects.length  // TODO: 正確なカウント実装
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'プロジェクト一覧取得に失敗しました'
    });
  }
});
```

---

### 3-7. GET /api/project-approval/history/:postId

**タスクID**: PA-API-007
**優先度**: 🟡 中
**所要時間**: 45分
**担当**: Backend
**依存関係**: PA-SVC-001, PA-API-001

**作業内容**:
- [ ] エンドポイント実装
- [ ] 承認履歴取得ロジック

**実装例**:
```typescript
// プロジェクト承認履歴
router.get('/history/:postId', requireProjectApprovalPermission, async (req, res) => {
  try {
    const { postId } = req.params;

    const history = await prisma.projectApproval.findMany({
      where: { postId },
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            permissionLevel: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      postId,
      history
    });
  } catch (error) {
    res.status(500).json({
      error: '承認履歴の取得に失敗しました'
    });
  }
});
```

---

### 3-8. APIテスト

**タスクID**: PA-API-008
**優先度**: 🟠 高
**所要時間**: 2時間
**担当**: Backend
**依存関係**: PA-API-002 ~ PA-API-007

**作業内容**:
- [ ] `src/routes/__tests__/projectApproval.test.ts` 作成
- [ ] 各エンドポイントのテストケース実装
  - 正常系
  - 異常系（バリデーションエラー）
  - 認証エラー
  - 認可エラー

**実装例**:
```typescript
// src/routes/__tests__/projectApproval.test.ts
import request from 'supertest';
import app from '../../app';

describe('POST /api/project-approval/approve', () => {
  it('承認に成功する', async () => {
    const response = await request(app)
      .post('/api/project-approval/approve')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        postId: 'post-1',
        comment: 'チーム編成を開始してください'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.post.approvalStatus).toBe('approved');
  });

  it('postIdがない場合はエラー', async () => {
    const response = await request(app)
      .post('/api/project-approval/approve')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('postId');
  });
});
```

---

## 🖥️ Phase 4: フロントエンド統合（Day 3: 10/15火）

### 4-1. useProjectApproval カスタムフック作成

**タスクID**: PA-FE-001
**優先度**: 🔴 最高
**所要時間**: 2時間
**担当**: Frontend
**依存関係**: PA-API-002 ~ PA-API-007

**作業内容**:
- [ ] `src/hooks/useProjectApproval.ts` 作成
- [ ] 以下関数実装:
  - `approveProject(postId, comment?)`
  - `rejectProject(postId, reason)`
  - `holdProject(postId, reason)`
  - `emergencyOverride(postId)`
  - `fetchApprovableProjects(filter)`
  - `fetchApprovalHistory(postId)`

**実装例**:
```typescript
// src/hooks/useProjectApproval.ts
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface UseProjectApprovalReturn {
  approveProject: (postId: string, comment?: string) => Promise<void>;
  rejectProject: (postId: string, reason: string) => Promise<void>;
  holdProject: (postId: string, reason: string) => Promise<void>;
  emergencyOverride: (postId: string) => Promise<void>;
  fetchApprovableProjects: (filter?: any) => Promise<Post[]>;
  isLoading: boolean;
  error: string | null;
}

export const useProjectApproval = (): UseProjectApprovalReturn => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveProject = useCallback(async (postId: string, comment?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/project-approval/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ postId, comment })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'プロジェクト承認に失敗しました');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... 他関数

  return {
    approveProject,
    rejectProject,
    holdProject,
    emergencyOverride,
    fetchApprovableProjects,
    isLoading,
    error
  };
};
```

---

### 4-2. ProjectApprovalPage API統合

**タスクID**: PA-FE-002
**優先度**: 🔴 最高
**所要時間**: 2時間
**担当**: Frontend
**依存関係**: PA-FE-001

**作業内容**:
- [ ] `src/pages/ProjectApprovalPage.tsx` 修正
- [ ] デモデータ削除（`getDemoPosts()` 削除）
- [ ] `useProjectApproval` フック導入
- [ ] API呼び出しに変更
- [ ] ローディング状態表示
- [ ] エラーハンドリング

**実装例**:
```typescript
// src/pages/ProjectApprovalPage.tsx
import { useProjectApproval } from '../hooks/useProjectApproval';

export const ProjectApprovalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    approveProject,
    rejectProject,
    holdProject,
    emergencyOverride,
    fetchApprovableProjects,
    isLoading,
    error
  } = useProjectApproval();

  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'approvable' | 'viewable'>('approvable');

  // データ取得
  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser, filter]);

  const loadProjects = async () => {
    try {
      const projects = await fetchApprovableProjects({ filter });
      setPosts(projects);
    } catch (err) {
      console.error('プロジェクト取得エラー:', err);
    }
  };

  // 承認ハンドラー
  const handleApprove = async (postId: string) => {
    try {
      await approveProject(postId);
      await loadProjects();  // 再読み込み
      // 成功通知表示
    } catch (err) {
      // エラー通知表示
    }
  };

  // ... 他ハンドラー

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      {/* ... */}

      {/* ローディング表示 */}
      {isLoading && <LoadingSpinner />}

      {/* エラー表示 */}
      {error && <ErrorAlert message={error} />}

      {/* プロジェクト一覧 */}
      {/* ... */}
    </div>
  );
};
```

---

### 4-3. 確認ダイアログ実装

**タスクID**: PA-FE-003
**優先度**: 🟠 高
**所要時間**: 2時間
**担当**: Frontend
**依存関係**: PA-FE-002

**作業内容**:
- [ ] 却下理由入力ダイアログ作成
- [ ] 保留理由入力ダイアログ作成
- [ ] 緊急介入警告ダイアログ作成

**実装例**:
```typescript
// src/components/project/RejectDialog.tsx
export const RejectDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('却下理由を入力してください');
      return;
    }
    onConfirm(reason);
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">
          プロジェクトを却下
        </h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="却下理由を入力してください"
          className="w-full p-3 bg-gray-700 text-white rounded-lg mb-4"
          rows={4}
        />
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            却下する
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 4-4. 通知・トースト実装

**タスクID**: PA-FE-004
**優先度**: 🟡 中
**所要時間**: 1時間
**担当**: Frontend
**依存関係**: PA-FE-002

**作業内容**:
- [ ] 成功通知コンポーネント作成
- [ ] エラー通知コンポーネント作成
- [ ] 通知表示ロジック実装

**実装例**:
```typescript
// src/components/common/Toast.tsx
export const Toast: React.FC<{
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600'
  };

  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
      <span className="text-xl">{icons[type]}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white">×</button>
    </div>
  );
};
```

---

## 🧪 Phase 5: テスト・品質保証（Day 4: 10/16水）

### 5-1. 統合テスト

**タスクID**: PA-TEST-001
**優先度**: 🔴 最高
**所要時間**: 2時間
**担当**: QA/Backend/Frontend
**依存関係**: PA-FE-004

**作業内容**:
- [ ] E2Eテストシナリオ作成
- [ ] Playwrightテスト実装
- [ ] 以下フロー検証:
  - ログイン → プロジェクト一覧 → 承認 → 成功通知
  - ログイン → プロジェクト一覧 → 却下（理由入力） → 成功通知
  - ログイン → プロジェクト一覧 → 緊急介入（確認） → 成功通知

**実装例**:
```typescript
// e2e/projectApproval.spec.ts
import { test, expect } from '@playwright/test';

test('プロジェクト承認フロー', async ({ page }) => {
  // ログイン（Level 8ユーザー）
  await page.goto('/login');
  await page.fill('input[name="email"]', 'level8@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // プロジェクト承認ページへ移動
  await page.goto('/project-approval');
  await expect(page.locator('h1')).toContainText('プロジェクト承認');

  // 承認可能フィルター選択
  await page.click('button:has-text("承認可能")');

  // 最初のプロジェクトを承認
  await page.click('button:has-text("プロジェクト開始を承認")').first();

  // 成功通知を確認
  await expect(page.locator('.toast-success')).toContainText('プロジェクトを承認しました');
});
```

---

### 5-2. 権限チェックテスト

**タスクID**: PA-TEST-002
**優先度**: 🔴 最高
**所要時間**: 2時間
**担当**: QA/Backend
**依存関係**: PA-TEST-001

**作業内容**:
- [ ] 各権限レベルでのテスト
  - Level 3.5: PENDING承認可能
  - Level 5: TEAM承認可能
  - Level 8: DEPARTMENT承認可能
  - Level 10: FACILITY承認可能
  - Level 13: ORGANIZATION承認可能
  - Level 18: 全て閲覧可能、緊急介入可能
- [ ] 権限外プロジェクトの非表示確認
- [ ] 緊急介入権限チェック

---

### 5-3. 監査ログ確認

**タスクID**: PA-TEST-003
**優先度**: 🟠 高
**所要時間**: 1時間
**担当**: QA/Backend
**依存関係**: PA-TEST-002

**作業内容**:
- [ ] 承認時の監査ログ記録確認（severity: high）
- [ ] 却下時の監査ログ記録確認（severity: medium）
- [ ] 保留時の監査ログ記録確認（severity: low）
- [ ] 緊急介入時の監査ログ記録確認（severity: critical）
- [ ] ログ内容の詳細確認（action, targetId, details）

**検証クエリ**:
```sql
SELECT * FROM audit_logs
WHERE action IN ('PROJECT_APPROVED', 'PROJECT_REJECTED', 'PROJECT_HELD', 'PROJECT_EMERGENCY_OVERRIDE')
ORDER BY created_at DESC
LIMIT 10;
```

---

### 5-4. パフォーマンステスト

**タスクID**: PA-TEST-004
**優先度**: 🟡 中
**所要時間**: 1.5時間
**担当**: Backend
**依存関係**: PA-TEST-002

**作業内容**:
- [ ] プロジェクト一覧取得の応答時間測定（目標: <500ms）
- [ ] 承認処理の応答時間測定（目標: <300ms）
- [ ] 複合インデックスの効果確認
- [ ] N+1クエリ問題のチェック

**測定ツール**:
```bash
# Apache Benchを使用
ab -n 100 -c 10 http://localhost:3001/api/project-approval/approvable
```

---

## 🚀 Phase 6: デプロイ（Day 4: 10/16水）

### 6-1. ステージング環境デプロイ

**タスクID**: PA-DEPLOY-001
**優先度**: 🟠 高
**所要時間**: 1時間
**担当**: DevOps/Backend
**依存関係**: PA-TEST-004

**作業内容**:
- [ ] マイグレーション実行（ステージング）
- [ ] アプリケーションデプロイ（ステージング）
- [ ] 動作確認

**コマンド**:
```bash
# ステージング環境へのデプロイ
npm run deploy:staging

# マイグレーション実行
DATABASE_URL=$STAGING_DATABASE_URL npx prisma migrate deploy
```

---

### 6-2. ステージング環境での動作確認

**タスクID**: PA-DEPLOY-002
**優先度**: 🟠 高
**所要時間**: 1時間
**担当**: QA/Frontend
**依存関係**: PA-DEPLOY-001

**作業内容**:
- [ ] 全機能の動作確認
- [ ] 各権限レベルでの表示確認
- [ ] エラー処理確認
- [ ] レスポンス速度確認

---

### 6-3. 本番環境デプロイ

**タスクID**: PA-DEPLOY-003
**優先度**: 🔴 最高
**所要時間**: 1時間
**担当**: DevOps/Backend
**依存関係**: PA-DEPLOY-002

**作業内容**:
- [ ] 本番環境バックアップ
- [ ] マイグレーション実行（本番）
- [ ] アプリケーションデプロイ（本番）
- [ ] 動作確認
- [ ] ロールバック手順確認

**コマンド**:
```bash
# 本番環境デプロイ
npm run deploy:production

# マイグレーション実行
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy
```

---

### 6-4. 本番環境での動作確認

**タスクID**: PA-DEPLOY-004
**優先度**: 🔴 最高
**所要時間**: 30分
**担当**: QA/Frontend/Backend
**依存関係**: PA-DEPLOY-003

**作業内容**:
- [ ] 主要機能の動作確認
- [ ] エラーログ監視
- [ ] パフォーマンス監視
- [ ] ユーザーフィードバック収集

---

## 📊 進捗管理

### タスク集計

| Phase | タスク数 | 所要時間（合計） | 優先度🔴 | 優先度🟠 | 優先度🟡 |
|-------|---------|----------------|---------|---------|---------|
| Phase 1: DB | 3 | 1.25時間 | 2 | 0 | 1 |
| Phase 2: サービス層 | 3 | 6時間 | 1 | 2 | 0 |
| Phase 3: API | 8 | 10.25時間 | 4 | 3 | 1 |
| Phase 4: フロントエンド | 4 | 7時間 | 2 | 1 | 1 |
| Phase 5: テスト | 4 | 6.5時間 | 2 | 2 | 1 |
| Phase 6: デプロイ | 4 | 3.5時間 | 2 | 2 | 0 |
| **合計** | **26** | **34.5時間** | **13** | **10** | **4** |

### 日別計画

| Day | 日付 | タスクID | 作業内容 | 所要時間 |
|-----|------|---------|---------|---------|
| Day 1 | 10/11金 | PA-DB-001 ~ PA-SVC-002 | DB実装 + サービス層基本実装 | 6.75時間 |
| Day 2 | 10/14月 | PA-SVC-003 ~ PA-API-008 | サービス層完成 + API実装 | 12時間 |
| Day 3 | 10/15火 | PA-FE-001 ~ PA-FE-004 | フロントエンド統合 | 7時間 |
| Day 4 | 10/16水 | PA-TEST-001 ~ PA-DEPLOY-004 | テスト + デプロイ | 10時間 |

---

## ✅ チェックリスト（最終確認）

### データベース
- [ ] ProjectApprovalテーブル作成完了
- [ ] Post拡張フィールド追加完了
- [ ] インデックス追加完了
- [ ] マイグレーション実行完了（開発・ステージング・本番）

### サービス層
- [ ] ProjectApprovalService実装完了
- [ ] 全メソッドのユニットテスト完了
- [ ] エラーハンドリング実装完了

### API
- [ ] 6つのエンドポイント実装完了
- [ ] APIテスト完了
- [ ] 認証・認可実装完了

### フロントエンド
- [ ] useProjectApprovalフック実装完了
- [ ] ProjectApprovalPageのAPI統合完了
- [ ] 確認ダイアログ実装完了
- [ ] 通知機能実装完了

### テスト
- [ ] 統合テスト完了
- [ ] 権限チェックテスト完了
- [ ] 監査ログ確認完了
- [ ] パフォーマンステスト完了

### デプロイ
- [ ] ステージング環境デプロイ完了
- [ ] 本番環境デプロイ完了
- [ ] 動作確認完了

---

## 📝 備考

### 注意事項
1. **権限チェックは厳密に**: 各レベルで正しく権限判定されることを確認
2. **監査ログは必須**: 全ての承認・却下・緊急介入を記録
3. **トランザクション処理**: Post更新とProjectApproval作成は必ずトランザクション内で実行
4. **エラーハンドリング**: ユーザーフレンドリーなエラーメッセージを表示
5. **パフォーマンス**: 複合インデックスを活用し、N+1クエリを防ぐ

### リスク管理
| リスク | 影響度 | 対策 |
|--------|--------|------|
| マイグレーション失敗 | 高 | バックアップ取得、ロールバック手順確認 |
| 権限チェック漏れ | 高 | 各レベルでの徹底テスト |
| パフォーマンス低下 | 中 | インデックス追加、クエリ最適化 |
| 監査ログ欠損 | 中 | AuditService統合テスト |

---

**文書終了**

最終更新: 2025年10月11日
次のステップ: schema.prisma更新
