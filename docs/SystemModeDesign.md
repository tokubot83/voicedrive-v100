# VoiceDrive システムモード設計書

## 概要

VoiceDriveを「議題システムモード」と「プロジェクト化モード」に完全独立させ、
組織の成熟度に応じて切り替え可能にする設計。

## 目的

1. **開発者体験の向上**: シンプルで明確なシステム構造
2. **組織への段階的導入**: 組織の成熟度に応じた最適な運用
3. **バグの削減**: システム間の依存・矛盾を排除

---

## 1. システムモード定義

### 議題システムモード（AGENDA_MODE）

**目的**: 委員会活性化・声を上げる文化の醸成

**特徴**:
- 委員会・理事会への段階的議題化
- 匿名投票による心理的安全性
- シンプルな承認フロー
- 委員会への自動提出

**スコア閾値**:
```
0-29点   → 検討中（部署内）
30-49点  → 部署検討（部署内）
50-99点  → 部署議題（部署内）
100-299点 → 施設議題（委員会提出・施設内投票）
300-599点 → 法人検討（法人全体）
600点以上 → 法人議題（理事会提出・法人全体）
```

**権限制御**:
- 0-99点: 同一部署のみ投票・コメント可
- 100-299点: 同一施設のみ投票・コメント可（全員閲覧可）
- 300点以上: 法人全員が投票・コメント可

**推奨導入時期**:
- 導入初期（0-6ヶ月）
- 委員会が形骸化している組織
- 現場の声が届きにくい組織

---

### プロジェクト化モード（PROJECT_MODE）

**目的**: チーム編成・組織一体感の向上

**特徴**:
- 自動プロジェクトチーム編成
- 部署横断の協働促進
- 進捗管理・マイルストーン設定
- 実装重視のワークフロー

**スコア閾値**:
```
0-99点    → PENDING（検討中）
100-299点 → DEPARTMENT（部署プロジェクト）
300-599点 → FACILITY（施設プロジェクト）
600点以上 → ORGANIZATION（法人プロジェクト）
```

**権限制御**:
- PENDING: プロジェクトメンバーのみ
- DEPARTMENT: 部署メンバー + 関係者
- FACILITY: 施設内関係者
- ORGANIZATION: 法人内関係者

**推奨導入時期**:
- 組織成熟期（12ヶ月以降）
- 改善文化が定着後
- 部署間協働が必要な組織

---

## 2. 技術設計

### ディレクトリ構造

```
src/
  systems/
    agenda/                         # 議題システム（完全独立）
      engines/
        AgendaEscalationEngine.ts   # 議題エスカレーション
        AgendaVisibilityEngine.ts   # 議題権限制御
        AgendaVotingEngine.ts       # 議題投票システム
      services/
        CommitteeSubmissionService.ts
        AgendaDocumentService.ts
      types/
        agenda.types.ts

    project/                        # プロジェクトシステム（完全独立）
      engines/
        ProjectUpgradeEngine.ts     # プロジェクト昇格
        ProjectVisibilityEngine.ts  # プロジェクト権限制御
        ProjectVotingEngine.ts      # プロジェクト投票システム
      services/
        TeamFormationService.ts
        MilestoneManagementService.ts
      types/
        project.types.ts

    config/
      systemMode.ts                 # モード管理・切替
      modeConfig.ts                 # モード別設定
```

### システムモード管理

```typescript
// src/systems/config/systemMode.ts

export enum SystemMode {
  AGENDA = 'AGENDA_MODE',
  PROJECT = 'PROJECT_MODE'
}

export interface SystemModeConfig {
  mode: SystemMode;
  enabledAt: Date;
  enabledBy: string;
  description: string;
  migrationStatus?: 'planning' | 'in_progress' | 'completed';
}

// モード設定の永続化
class SystemModeManager {
  private static instance: SystemModeManager;
  private currentMode: SystemMode = SystemMode.AGENDA; // デフォルト

  static getInstance(): SystemModeManager {
    if (!this.instance) {
      this.instance = new SystemModeManager();
    }
    return this.instance;
  }

  getCurrentMode(): SystemMode {
    return this.currentMode;
  }

  async setMode(mode: SystemMode, adminUser: User): Promise<void> {
    // レベルX権限チェック
    if (adminUser.permissionLevel !== SpecialPermissionLevel.LEVEL_X) {
      throw new Error('システム管理者のみモード変更可能');
    }

    // モード切替
    this.currentMode = mode;

    // 設定をDBに保存
    await this.saveModeConfig({
      mode,
      enabledAt: new Date(),
      enabledBy: adminUser.id,
      description: mode === SystemMode.AGENDA ? '議題システムモード' : 'プロジェクト化モード'
    });

    // システム再構築
    await this.rebuildSystem(mode);
  }

  private async rebuildSystem(mode: SystemMode): Promise<void> {
    // UI・ルーティング・権限システムの再構築
    console.log(`[SystemMode] ${mode}で再構築中...`);
  }

  private async saveModeConfig(config: SystemModeConfig): Promise<void> {
    // TODO: Prismaでsystem_configテーブルに保存
    localStorage.setItem('voicedrive_system_mode', JSON.stringify(config));
  }
}

export const systemModeManager = SystemModeManager.getInstance();
```

---

## 3. 統合ポイント

### Post（投稿）の拡張

```typescript
// src/types/index.ts

export interface Post {
  id: string;
  content: string;
  author: User;

  // システムモード別のステータス（どちらか一方のみ使用）
  agendaStatus?: {
    level: AgendaLevel;
    score: number;
    committeeSubmitted: boolean;
  };

  projectStatus?: {
    level: ProjectLevel;
    score: number;
    teamMembers: string[];
  };

  // 共通
  votes: Vote[];
  comments: Comment[];
  category: string;
  createdAt: Date;
}
```

### モード別エンジンの呼び出し

```typescript
// src/components/EnhancedPost.tsx

import { systemModeManager, SystemMode } from '../systems/config/systemMode';
import { agendaVisibilityEngine } from '../systems/agenda/engines/AgendaVisibilityEngine';
import { projectVisibilityEngine } from '../systems/project/engines/ProjectVisibilityEngine';

const EnhancedPost: React.FC<Props> = ({ post, currentUser }) => {
  const mode = systemModeManager.getCurrentMode();

  // モード別の権限取得
  const permissions = mode === SystemMode.AGENDA
    ? agendaVisibilityEngine.getPermissions(post, currentUser, post.agendaStatus?.score || 0)
    : projectVisibilityEngine.getPermissions(post, currentUser);

  // モード別のUI表示
  return (
    <div>
      {mode === SystemMode.AGENDA && <AgendaLevelIndicator {...post.agendaStatus} />}
      {mode === SystemMode.PROJECT && <ProjectLevelBadge {...post.projectStatus} />}

      {permissions.canVote && <VotingSection />}
      {permissions.canComment && <CommentSection />}
    </div>
  );
};
```

---

## 4. データベーススキーマ

### system_config テーブル

```sql
CREATE TABLE system_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  updated_by VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  description TEXT
);

-- 初期データ
INSERT INTO system_config (config_key, config_value, description)
VALUES ('system_mode', 'AGENDA_MODE', 'VoiceDriveの動作モード');
```

### posts テーブル拡張

```sql
ALTER TABLE posts
  ADD COLUMN agenda_level VARCHAR(50),
  ADD COLUMN agenda_score INT DEFAULT 0,
  ADD COLUMN project_level VARCHAR(50),
  ADD COLUMN project_score INT DEFAULT 0;
```

---

## 5. 移行戦略

### フェーズ1: 議題モードで運用開始
- 全ての投稿は議題システムで処理
- 委員会への提出を促進
- 投稿数・参加率を計測

### フェーズ2: ハイブリッド運用（オプション）
- 重要議題のみ手動でプロジェクト化
- 成功事例を蓄積

### フェーズ3: プロジェクトモードへ移行
- 組織が成熟したらプロジェクトモードに切替
- チーム協働を促進

---

## 6. 設定画面（レベルX専用）

### /system-config ページ

```tsx
const SystemConfigPage: React.FC = () => {
  const currentMode = systemModeManager.getCurrentMode();

  return (
    <div>
      <h1>🔧 システム設定</h1>

      <Card>
        <h2>動作モード</h2>

        <Radio value={SystemMode.AGENDA}>
          📋 議題システムモード
          <p>委員会活性化・声を上げる文化の醸成</p>
          <ul>
            <li>✓ 部署→施設→法人への段階的議題化</li>
            <li>✓ 委員会・理事会への自動提出</li>
            <li>✓ 匿名投票による心理的安全性</li>
          </ul>
        </Radio>

        <Radio value={SystemMode.PROJECT}>
          🚀 プロジェクト化モード
          <p>チーム編成・組織一体感の向上</p>
          <ul>
            <li>✓ 自動プロジェクトチーム編成</li>
            <li>✓ 部署横断の協働促進</li>
            <li>✓ 進捗管理・マイルストーン設定</li>
          </ul>
        </Radio>
      </Card>

      {/* 移行目安表示 */}
      <MigrationReadinessIndicator />
    </div>
  );
};
```

---

## 7. サイドバーメニューの整理

### 議題モード時のメニュー

```tsx
💡 アイデアボイスハブ
  📊 議題一覧・進捗
  📄 議題提案書作成（Lv.5+）
  📈 投票分析（Lv.3.5+）
  🏛️ 委員会ステータス
```

### プロジェクトモード時のメニュー

```tsx
🚀 プロジェクトハブ
  📊 プロジェクト一覧
  👥 チーム管理
  📈 進捗ダッシュボード
  🎯 マイルストーン管理
```

---

## 8. 実装チェックリスト

- [ ] システムモード管理機能の実装
- [ ] 議題システムの独立化（/systems/agenda/）
- [ ] プロジェクトシステムの独立化（/systems/project/）
- [ ] モード別ルーティングの実装
- [ ] モード切替UI（レベルX専用ページ）
- [ ] データベーススキーマ変更
- [ ] 既存コードのリファクタリング
- [ ] サイドバーメニューの整理
- [ ] ドキュメント作成
- [ ] テスト実装

---

## 9. 期待される効果

### 開発者
- ✅ シンプルで明確なコード構造
- ✅ バグの削減
- ✅ テストの容易化
- ✅ 拡張性の向上

### 組織
- ✅ 段階的な導入が可能
- ✅ 組織の成熟度に応じた最適運用
- ✅ 委員会活性化から協働促進へスムーズに移行

### ユーザー
- ✅ わかりやすいシステム
- ✅ 目的に応じた最適な機能
- ✅ 使いやすいUI

---

最終更新: 2025-10-04
作成者: Claude (システム管理者と協議)
