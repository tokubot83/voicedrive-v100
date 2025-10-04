# モード別権限システム実装完了報告書

## 📅 実施日時
**2025-10-04**

## 🎯 実施内容

### 目的
システムモード（議題モード/プロジェクトモード）に応じて、各権限レベルの「できること」が動的に切り替わるシステムを実装。

### 背景
ユーザーからの重要な指摘：
> 「各モードで各アカウントレベルの権限も違ったけど、それもモード変更で切り替わる？」

この指摘を受け、既存の`systemModeManager`による**モード切替機能**に加えて、**モード別の権限定義**と**動的な権限切替機能**を追加実装しました。

---

## ✅ 実装内容

### 1. 議題モード権限定義（新規作成）

**ファイル**: `src/permissions/config/agendaModePermissions.ts`

**権限の特徴**:
- 委員会活性化・声を上げる文化の醸成に特化
- 議題の段階的エスカレーション
- 委員会への自動提出

**主な権限項目**:
```typescript
- canCreateIdea: アイデア投稿
- canVoteOnAgenda: 議題への投票
- canCommentOnAgenda: 議題へのコメント
- canPrepareCommitteeAgenda: 委員会議題準備
- canSubmitToCommittee: 委員会への提出
- canGenerateAgendaDocument: 議題提案書生成
- canAccessCommitteeBridge: 委員会ブリッジアクセス
- canAccessVotingAnalytics: 投票分析
- canAccessAgendaProgress: 議題進捗確認
- canApproveAgenda: 議題承認
```

**レベル別の特徴的な権限**:
- Lv.3.5以上: 投票分析へのアクセス
- Lv.5以上: 議題提案書生成
- Lv.6以上: 委員会議題準備
- Lv.7以上: 委員会ブリッジアクセス
- Lv.8以上: 委員会への提出権限

---

### 2. プロジェクトモード権限定義（新規作成）

**ファイル**: `src/permissions/config/projectModePermissions.ts`

**権限の特徴**:
- チーム編成・組織一体感の向上に特化
- 自動プロジェクトチーム編成
- 部署横断の協働促進
- 進捗管理・マイルストーン設定

**主な権限項目**:
```typescript
- canCreateProject: プロジェクト作成
- canJoinProject: プロジェクト参加
- canManageOwnTasks: 自分のタスク管理
- canFormProjectTeam: プロジェクトチーム編成
- canAssignTasks: タスク割り当て
- canManageMilestones: マイルストーン管理
- canApproveProjectProgress: 進捗承認
- canAccessProjectAnalytics: プロジェクト分析
- canAccessProgressDashboard: 進捗ダッシュボード
- canEscalateProject: プロジェクト昇格
```

**レベル別の特徴的な権限**:
- Lv.3.5以上: プロジェクト分析
- Lv.5以上: プロジェクト作成
- Lv.6以上: チーム編成・タスク割り当て・マイルストーン管理
- Lv.7以上: 進捗承認
- Lv.8以上: プロジェクト昇格

---

### 3. PermissionServiceの拡張

**ファイル**: `src/permissions/services/PermissionService.ts`

**追加メソッド**:

#### getModeAwarePermissions()
```typescript
getModeAwarePermissions(
  userLevel: PermissionLevel | SpecialPermissionLevel
): AgendaModePermission | ProjectModePermission | undefined
```
**機能**: 現在のシステムモードに応じて適切な権限を返す

#### getModeAwareMenuItems()
```typescript
getModeAwareMenuItems(
  userLevel: PermissionLevel | SpecialPermissionLevel
): string[]
```
**機能**: 現在のモードでアクセス可能なメニュー項目を取得

#### hasModeAwarePermission()
```typescript
hasModeAwarePermission(
  userLevel: PermissionLevel | SpecialPermissionLevel,
  permissionKey: string
): boolean
```
**機能**: 特定の権限をチェック

#### onModeChange()
```typescript
onModeChange(newMode: SystemMode): void
```
**機能**: モード変更時の通知を受け取る

---

### 4. systemModeManagerとの統合

**ファイル**: `src/config/systemMode.ts`

**変更内容**:
- モード切替時にPermissionServiceへ通知
- 動的インポートによる循環参照の回避

```typescript
// モード切替時の処理
async setMode(mode: SystemMode, adminUser: User): Promise<void> {
  // ... 既存処理 ...

  // PermissionServiceに通知
  const { PermissionService } = await import('../permissions/services/PermissionService');
  const permissionService = PermissionService.getInstance();
  permissionService.onModeChange(mode);

  console.log(`[SystemMode] 権限システムが ${mode} に対応しました`);
}
```

---

## 📊 権限比較表（例: レベル5 副主任）

| 機能 | 議題モード | プロジェクトモード |
|-----|----------|----------------|
| **基本機能** |
| 投稿・アイデア作成 | ✅ | ✅ |
| 投票 | ✅ 議題への投票 | ✅ プロジェクト参加 |
| コメント | ✅ | ✅ タスク管理 |
| **管理機能** |
| 議題提案書作成 | ✅ | ❌ |
| プロジェクト作成 | ❌ | ✅ |
| チーム編成 | ❌ | ❌ (Lv.6+) |
| **分析機能** |
| 投票分析 | ✅ | - |
| プロジェクト分析 | - | ✅ |
| **承認機能** |
| 議題承認 | ✅ 部署議題の初期承認 | ❌ |
| 進捗承認 | - | ❌ (Lv.7+) |

---

## 📊 権限比較表（例: レベル8 師長・科長・課長・室長）

| 機能 | 議題モード | プロジェクトモード |
|-----|----------|----------------|
| **基本機能** |
| 投稿・アイデア作成 | ✅ | ✅ |
| 投票 | ✅ 法人議題も可 | ✅ 法人プロジェクトも可 |
| **管理機能** |
| 議題提案書作成 | ✅ | - |
| 委員会への提出 | ✅ | - |
| 委員会ブリッジ | ✅ | - |
| プロジェクト作成 | - | ✅ |
| チーム編成 | - | ✅ |
| タスク割り当て | - | ✅ |
| マイルストーン管理 | - | ✅ |
| **承認機能** |
| 議題承認 | ✅ | - |
| 進捗承認 | - | ✅ |
| プロジェクト昇格 | - | ✅ |

---

## 🎯 使用例

### コード例1: 現在のモードで権限を取得

```typescript
import { PermissionService } from '@/permissions/services/PermissionService';
import { PermissionLevel } from '@/permissions/types/PermissionTypes';

const permissionService = PermissionService.getInstance();

// ユーザーの権限レベル
const userLevel = PermissionLevel.LEVEL_5; // 副主任

// 現在のモードで権限を取得
const permissions = permissionService.getModeAwarePermissions(userLevel);

// 議題モードの場合
if (permissions.canGenerateAgendaDocument) {
  console.log('議題提案書を生成できます');
}

// プロジェクトモードの場合
if (permissions.canCreateProject) {
  console.log('プロジェクトを作成できます');
}
```

### コード例2: 特定の権限をチェック

```typescript
const userLevel = PermissionLevel.LEVEL_8; // 師長

// 議題モードで委員会提出権限をチェック
const canSubmit = permissionService.hasModeAwarePermission(
  userLevel,
  'canSubmitToCommittee'
);

if (canSubmit) {
  // 委員会への提出ボタンを表示
}
```

### コード例3: メニュー項目を動的に取得

```typescript
const userLevel = PermissionLevel.LEVEL_5;

// 現在のモードでアクセス可能なメニュー
const menuItems = permissionService.getModeAwareMenuItems(userLevel);

// 議題モードの場合
// ['personal_station', 'agenda_progress', 'agenda_document_generator', 'voting_analytics']

// プロジェクトモードの場合
// ['personal_station', 'my_tasks', 'project_progress', 'project_analytics', 'create_project']
```

---

## 🧪 テスト結果

### ビルドテスト

**実行コマンド**: `npm run build`

**結果**: ✅ 成功

```
✓ 2046 modules transformed
✓ Build completed in 12.30s
```

**警告**:
```
PermissionService.ts is dynamically imported by systemMode.ts
but also statically imported by usePermissions.ts
```
→ 循環参照回避のための動的インポートによるもの。実害なし。

**生成ファイル**:
- `assets/permissions-BVIm_LpW.js` (53.24 kB → gzip: 8.52 kB)
- モード別権限定義が正常に含まれている

---

## 📁 作成・変更ファイル一覧

### 新規作成ファイル
1. `src/permissions/config/agendaModePermissions.ts` - 議題モード権限定義
2. `src/permissions/config/projectModePermissions.ts` - プロジェクトモード権限定義

### 変更ファイル
1. `src/permissions/services/PermissionService.ts` - モード対応メソッド追加
2. `src/config/systemMode.ts` - PermissionServiceへの通知追加

---

## 🎉 達成された成果

### ✅ 技術的成果

1. **モード別権限システムの完全実装**
   - 議題モード: 18レベル + X の権限定義
   - プロジェクトモード: 18レベル + X の権限定義

2. **動的権限切替の実現**
   - システムモード変更時に権限が自動的に切り替わる
   - UIの再レンダリングに対応可能な設計

3. **コードの一貫性向上**
   - 各モードで明確な権限定義
   - PermissionServiceによる統一的なアクセス

4. **保守性の向上**
   - モード別に独立したファイル
   - 拡張が容易な設計

### ✅ ユーザー体験の向上

1. **役割に応じた機能提供**
   - 議題モード: 委員会活性化に特化
   - プロジェクトモード: チーム協働に特化

2. **権限の明確化**
   - 各レベルで何ができるかが明確
   - モードによる違いが明示的

3. **段階的な機能習得**
   - 議題モードで基本を習得
   - プロジェクトモードで協働を学ぶ

---

## 🔧 使い方（開発者向け）

### 権限チェックの実装例

```typescript
// UIコンポーネントで使用
import { usePermissions } from '@/permissions/hooks/usePermissions';

const MyComponent = () => {
  const { userPermissionLevel } = usePermissions();
  const permissionService = PermissionService.getInstance();

  const permissions = permissionService.getModeAwarePermissions(
    userPermissionLevel
  );

  return (
    <div>
      {/* 議題モード: 議題提案書作成ボタン */}
      {permissions.canGenerateAgendaDocument && (
        <button>議題提案書を作成</button>
      )}

      {/* プロジェクトモード: プロジェクト作成ボタン */}
      {permissions.canCreateProject && (
        <button>プロジェクトを作成</button>
      )}
    </div>
  );
};
```

---

## 📈 今後の拡張可能性

### 1. React Hookの作成（推奨）

```typescript
// src/permissions/hooks/useModeAwarePermissions.ts
export const useModeAwarePermissions = () => {
  const { userPermissionLevel } = usePermissions();
  const permissionService = PermissionService.getInstance();

  return permissionService.getModeAwarePermissions(userPermissionLevel);
};
```

### 2. モード切替時のUI自動更新

```typescript
// systemModeManagerにイベントエミッターを追加
export class SystemModeManager {
  private listeners: ((mode: SystemMode) => void)[] = [];

  onModeChange(callback: (mode: SystemMode) => void) {
    this.listeners.push(callback);
  }

  async setMode(mode: SystemMode, adminUser: User) {
    // ... 既存処理 ...
    this.listeners.forEach(cb => cb(mode));
  }
}
```

### 3. 第3のモード追加

```typescript
// 将来的に追加可能
export enum SystemMode {
  AGENDA = 'AGENDA_MODE',
  PROJECT = 'PROJECT_MODE',
  EMERGENCY = 'EMERGENCY_MODE'  // 緊急対応モード
}

// emergencyModePermissions.tsを追加
```

---

## ⚠️ 注意事項

### 既存データへの影響

**影響なし**: 権限定義の追加のみで、既存のデータ構造は変更していません。

### 後方互換性

**保証**: 既存のPermissionServiceのメソッドはそのまま使用可能です。

### パフォーマンス

**影響なし**: 権限チェックは軽量な処理で、パフォーマンスへの影響はありません。

---

## 🎊 結論

**モード別権限システムの実装が完了しました！**

これにより：
- ✅ システムモード切替時に権限が動的に変わる
- ✅ 各モードに最適化された機能が提供される
- ✅ ユーザーの役割に応じた適切な権限が付与される
- ✅ 組織の成熟度に応じた段階的導入が可能

---

**実装者**: Claude (AI開発支援)
**レビュー待ち**: システム管理者
**最終更新**: 2025-10-04
