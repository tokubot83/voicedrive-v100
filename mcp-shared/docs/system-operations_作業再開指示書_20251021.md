# system-operations 作業再開指示書（Phase 2実施用）

**文書番号**: SO-RESTART-2025-1021-001
**作成日**: 2025年10月21日
**作成者**: VoiceDrive開発チーム
**対象Phase**: Phase 2（フロントエンド実装）
**前提条件**: 本番DB（MySQL on AWS Lightsail）が構築済み

---

## 📋 この文書の目的

この文書は、**本番DBが構築された後に、system-operationsページのPhase 2（フロントエンド実装）を再開する際の手順書**です。

---

## ⏸️ 現在の状態（2025-10-21時点）

### 完了しているPhase

- ✅ **Phase 1**: バックエンド実装（API、サービス、DB）完了
- ✅ **Phase 1.5**: 初期データ作成完了
- ⏸️ **Phase 2**: フロントエンド実装（保留中）

### SystemOperationsPageの現状

**ファイル**: `src/pages/admin/SystemOperationsPage.tsx`

**現在の表示方法**: ハードコードされたダミーデータ

```typescript
// 現在の実装（175-195行目）
<div className="text-2xl font-bold text-green-400">正常</div>  // ← ハードコード
<div className="text-2xl font-bold text-white">28日</div>      // ← ハードコード
<div className="text-2xl font-bold text-white">342名</div>     // ← ハードコード
<div className="text-2xl font-bold text-green-400">議題</div> // ← ハードコード
```

**問題点**:
- Phase 2でAPIに切り替えると、デモが見れなくなる可能性がある
- 本番DBにデータが存在するまで、ダミーデータで運用

---

## 🎯 Phase 2実施の前提条件

### 必須条件

- [ ] **本番DB（MySQL on AWS Lightsail）が構築済み**
- [ ] **VoiceDriveアプリケーションが本番DBに接続済み**
- [ ] **SystemHealthテーブルにデータが存在**（Cronジョブで自動記録）
- [ ] **VotingConfigテーブルにデータが存在**
- [ ] **MenuConfigテーブルにデータが存在**（11項目）

### 確認方法

```bash
# 本番DBに接続してデータ確認
npx prisma studio

# SystemHealthテーブルを確認
# → 1件以上のレコードが存在すること

# VotingConfigテーブルを確認
# → 1件のレコード（configKey: "default"）が存在すること

# MenuConfigテーブルを確認
# → 11件のレコードが存在すること
```

---

## 📦 Phase 2実施手順

### ステップ1: 環境確認

```bash
# 1. プロジェクトディレクトリに移動
cd C:\projects\voicedrive-v100

# 2. 最新のコードを取得（git pullなど）
git pull origin main

# 3. 依存関係をインストール
npm install

# 4. Prismaクライアントを生成
npx prisma generate

# 5. 本番DB接続確認
npx prisma studio
```

---

### ステップ2: API動作確認

#### 2-1. APIサーバー起動

```bash
npm run dev:api
```

**期待される起動ログ**:
```
✅ Server: http://localhost:3003
⏰ Health check job started (runs every 1 minute)
⏰ Health cleanup job started (runs daily at 2:00 AM)
```

#### 2-2. APIエンドポイント動作確認

**テスト1: システム概要取得**

```bash
curl -X GET http://localhost:3003/api/system/overview \
  -H "Authorization: Bearer {Level99のJWTトークン}"
```

**期待されるレスポンス**:
```json
{
  "status": "healthy",
  "statusDisplay": "正常",
  "uptime": "28日",
  "totalUsers": 342,
  "currentMode": "AGENDA_MODE",
  "currentModeDisplay": "議題",
  "metrics": {
    "cpuUsage": 45.2,
    "memoryUsage": 62.8
  }
}
```

**テスト2: 管理機能統計取得**

```bash
curl -X GET http://localhost:3003/api/system/operations-stats \
  -H "Authorization: Bearer {Level99のJWTトークン}"
```

**期待されるレスポンス**:
```json
{
  "systemMonitor": {
    "uptimePercentage": 99.8,
    "status": "healthy"
  },
  "modeSwitcher": {
    "currentMode": "AGENDA_MODE",
    "currentModeDisplay": "議題モード"
  },
  "votingSettings": {
    "lastUpdated": "2025/10/21"
  },
  ...
}
```

---

### ステップ3: フロントエンド修正

#### 3-1. カスタムフックの作成

**ファイル**: `src/hooks/useSystemOperations.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * システム概要を取得
 */
export function useSystemOverview() {
  return useQuery({
    queryKey: ['system', 'overview'],
    queryFn: async () => {
      const response = await axios.get('/api/system/overview');
      return response.data;
    },
    refetchInterval: 60000, // 1分毎に自動更新
  });
}

/**
 * 管理機能統計を取得
 */
export function useOperationsStats() {
  return useQuery({
    queryKey: ['system', 'operations-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/system/operations-stats');
      return response.data;
    },
    refetchInterval: 60000, // 1分毎に自動更新
  });
}
```

#### 3-2. SystemOperationsPageの修正

**ファイル**: `src/pages/admin/SystemOperationsPage.tsx`

**修正箇所1: インポート追加**

```typescript
import { useSystemOverview, useOperationsStats } from '../../hooks/useSystemOperations';
```

**修正箇所2: データ取得**

```typescript
export const SystemOperationsPage: React.FC = () => {
  const navigate = useNavigate();

  // 🆕 APIからデータ取得
  const { data: overview, isLoading: overviewLoading } = useSystemOverview();
  const { data: stats, isLoading: statsLoading } = useOperationsStats();

  // ローディング中の表示
  if (overviewLoading || statsLoading) {
    return <div>読み込み中...</div>;
  }

  // ... 以下、既存のコード
```

**修正箇所3: システムステータス概要（175-195行目）**

```typescript
// 🔴 削除（ハードコード）
// const status = "正常";
// const uptime = "28日";
// const totalUsers = 342;
// const currentMode = "議題";

// 🆕 追加（APIデータ）
const status = overview?.statusDisplay || "不明";
const uptime = overview?.uptime || "0日";
const totalUsers = overview?.totalUsers || 0;
const currentMode = overview?.currentModeDisplay || "議題";
```

**修正箇所4: 管理機能カード統計（197-257行目）**

```typescript
const operationCards = [
  {
    id: 'system-monitor',
    icon: '📊',
    title: 'システム監視',
    description: 'サーバー状態、パフォーマンス、エラーログの監視',
    path: '/admin/system-monitor',
    // 🔴 削除: stats: 'サーバー稼働率: 99.8%',
    // 🆕 追加:
    stats: `サーバー稼働率: ${stats?.systemMonitor?.uptimePercentage || 0}%`,
    color: 'blue',
    badge: null
  },
  {
    id: 'mode-switcher',
    icon: '🔄',
    title: 'モード切替',
    description: '議題モード ⇄ プロジェクトモード切替',
    path: '/admin/mode-switcher',
    // 🔴 削除: stats: '現在: 議題モード',
    // 🆕 追加:
    stats: `現在: ${stats?.modeSwitcher?.currentModeDisplay || '不明'}`,
    color: 'green',
    badge: '重要'
  },
  {
    id: 'voting-settings',
    icon: '⚙️',
    title: '投票設定',
    description: '議題/プロジェクトモードの投票ルール設定',
    path: '/admin/voting-settings',
    // 🔴 削除: stats: '最終更新: 2025/10/13',
    // 🆕 追加:
    stats: `最終更新: ${stats?.votingSettings?.lastUpdated || '未設定'}`,
    color: 'purple',
    badge: null
  },
  {
    id: 'user-management',
    icon: '👥',
    title: 'ユーザー管理',
    description: 'アカウント管理、権限レベル設定',
    path: '/admin/user-management',
    // 🔴 削除: stats: 'アクティブユーザー: 342名',
    // 🆕 追加:
    stats: `アクティブユーザー: ${stats?.userManagement?.activeUsers || 0}名`,
    color: 'cyan',
    badge: null
  },
  {
    id: 'system-settings',
    icon: '🛠️',
    title: 'システム設定',
    description: 'グローバル設定、機能ON/OFF切替',
    path: '/admin/system-settings',
    // 🔴 削除: stats: '設定項目: 28件',
    // 🆕 追加:
    stats: `設定項目: ${stats?.systemSettings?.totalSettings || 0}件`,
    color: 'orange',
    badge: null
  },
  {
    id: 'audit-logs',
    icon: '📜',
    title: '監査ログ',
    description: 'システム変更履歴、操作ログの確認',
    path: '/admin/audit-logs',
    // 🔴 削除: stats: '本日のログ: 127件',
    // 🆕 追加:
    stats: `本日のログ: ${stats?.auditLogs?.todayCount || 0}件`,
    color: 'slate',
    badge: null
  },
  {
    id: 'sidebar-menu-management',
    icon: '🎛️',
    title: 'サイドバーメニュー管理',
    description: '議題/プロジェクト/共通メニューの表示設定',
    path: '/admin/sidebar-menu-management',
    // 🔴 削除: stats: '管理項目: 11件',
    // 🆕 追加:
    stats: `管理項目: ${stats?.sidebarMenuManagement?.totalMenuItems || 0}件`,
    color: 'pink',
    badge: 'NEW'
  }
];
```

---

### ステップ4: 動作確認

#### 4-1. フロントエンド起動

```bash
npm run dev
```

#### 4-2. ブラウザで確認

**URL**: http://localhost:3000/admin/system-operations

**確認項目**:
- [ ] システムステータスが表示される（正常/警告/異常）
- [ ] 稼働時間が表示される（X日）
- [ ] 総ユーザー数が表示される
- [ ] 現在のモードが表示される（議題/プロジェクト）
- [ ] 7つの管理機能カードの統計が表示される
- [ ] データが1分毎に自動更新される

#### 4-3. エラーハンドリング確認

**APIエラー時の動作確認**:
```typescript
// APIエラー時のフォールバック表示を確認
if (error) {
  return <div>データの取得に失敗しました</div>;
}
```

---

### ステップ5: テスト

#### 5-1. 単体テスト

```bash
# カスタムフックのテスト
npm run test src/hooks/useSystemOperations.test.ts
```

#### 5-2. 統合テスト

```bash
# SystemOperationsPageの統合テスト
npm run test src/pages/admin/SystemOperationsPage.test.tsx
```

#### 5-3. E2Eテスト

```bash
# Cypressでブラウザテスト
npm run cypress:run
```

---

### ステップ6: デプロイ

#### 6-1. ビルド確認

```bash
npm run build
```

**期待される出力**:
```
✓ built in XXXms
```

#### 6-2. 本番環境デプロイ

```bash
# Vercelの場合
vercel --prod

# または他のデプロイツール
npm run deploy
```

---

## 🔧 トラブルシューティング

### 問題1: APIが404エラーを返す

**原因**: APIサーバーが起動していない

**解決策**:
```bash
npm run dev:api
```

---

### 問題2: データが表示されない

**原因**: SystemHealthテーブルにデータがない

**解決策**:
```bash
# 初期データを作成
npx tsx prisma/seed-system-health.ts

# または、Cronジョブが動くまで1分待つ
```

---

### 問題3: 認証エラー（403 Forbidden）

**原因**: Level 99のユーザーでログインしていない

**解決策**:
```bash
# システム管理者ユーザーでログイン
# employeeId: SYSTEM-ADMIN
# email: system@voicedrive.local
```

---

### 問題4: データが古い

**原因**: キャッシュが効いている

**解決策**:
```typescript
// useSystemOverviewフックでrefetchを実行
const { data, refetch } = useSystemOverview();

// ボタンクリックで手動更新
<button onClick={() => refetch()}>更新</button>
```

---

## 📋 Phase 2完了チェックリスト

### 実装

- [ ] useSystemOverviewフック作成
- [ ] useOperationsStatsフック作成
- [ ] SystemOperationsPage修正（システムステータス）
- [ ] SystemOperationsPage修正（管理機能カード）
- [ ] ローディング表示実装
- [ ] エラーハンドリング実装
- [ ] 自動更新機能実装（1分毎）

### テスト

- [ ] APIエンドポイント動作確認
- [ ] フロントエンド表示確認
- [ ] データ自動更新確認
- [ ] エラーハンドリング確認
- [ ] 単体テスト実行
- [ ] 統合テスト実行
- [ ] E2Eテスト実行

### デプロイ

- [ ] ビルド成功確認
- [ ] 本番環境デプロイ
- [ ] 本番環境動作確認

---

## 📊 推定工数

| タスク | 工数 | 担当 |
|--------|------|------|
| 環境確認 | 0.5時間 | 開発者 |
| API動作確認 | 0.5時間 | 開発者 |
| カスタムフック作成 | 1時間 | 開発者 |
| SystemOperationsPage修正 | 2時間 | 開発者 |
| 動作確認・テスト | 2時間 | 開発者 |
| デプロイ | 1時間 | 開発者 |
| **合計** | **7時間** | **1名** |

**推定期間**: 1日

---

## 📞 問い合わせ先

### 技術的な質問

- **VoiceDrive開発チーム**
- Slack: `#voicedrive-dev`
- メール: `voicedrive-dev@example.com`

### 緊急時の連絡

- **プロジェクトリード**
- 電話: XXX-XXXX-XXXX

---

## 🔗 関連ドキュメント

1. [system-operations_DB要件分析_20251021.md](./system-operations_DB要件分析_20251021.md) - DB要件分析
2. [system-operations暫定マスターリスト_20251021.md](./system-operations暫定マスターリスト_20251021.md) - 実装マスタープラン
3. [system-operations_作業完了報告書_20251021.md](./system-operations_作業完了報告書_20251021.md) - Phase 1完了報告

---

## ✅ Phase 2完了後の状態

### 期待される動作

- ✅ システムステータスが実データで表示される
- ✅ 管理機能カードの統計が実データで表示される
- ✅ データが1分毎に自動更新される
- ✅ エラー時に適切なメッセージが表示される
- ✅ ローディング中の表示がある

### 完了宣言

Phase 2実装が完了したら、以下のドキュメントを作成:

**system-operations_Phase2完了報告書_YYYYMMDD.md**

---

**文書終了**

最終更新: 2025年10月21日 23:30
バージョン: 1.0
ステータス: Phase 2実施待ち
次回レビュー: 本番DB構築後
