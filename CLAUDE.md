# CLAUDE.md - VoiceDrive プロジェクト設定

## プロジェクト概要
VoiceDriveは医療職員の声を集め、組織改善につなげるシステムです。
医療職員管理システムとMCPサーバーを通じて統合されています。

## MCPサーバー共有ファイル自動確認設定

### 作業開始時の確認事項
Claude Codeは作業開始時に必ず以下を実行してください：

1. **最新の要約を確認**
   ```bash
   cat mcp-shared/docs/AI_SUMMARY.md
   ```

2. **新しい共有ファイルをチェック**
   ```bash
   ls -la mcp-shared/docs/ | head -10
   cat mcp-shared/sync-status.json | grep lastSync
   ```

### 監視対象フォルダ
以下のフォルダは医療職員管理システムと自動同期されています：
- `mcp-shared/docs/` - 報告書、設計書
- `mcp-shared/config/` - 設定ファイル（interview-types.json等）
- `mcp-shared/interfaces/` - TypeScript型定義
- `mcp-shared/logs/` - テスト結果

### 重要ファイル
- `mcp-shared/docs/AI_SUMMARY.md` - **最初に必ず読む**（重要更新の要約）
- `mcp-shared/docs/daily-report.md` - 日次報告
- `mcp-shared/config/interview-types.json` - 面談タイプ設定
- `mcp-shared/interfaces/interview.interface.ts` - 型定義
- `mcp-shared/api/api-version-manager.ts` - APIバージョン管理

## 開発サーバー

### 起動コマンド
```bash
# VoiceDrive開発サーバー
npm run dev

# MCPサーバー
cd mcp-integration-server && npm run dev
```

### エンドポイント
- VoiceDrive: http://localhost:3001
- MCPサーバー: http://localhost:8080
- MCPダッシュボード: http://localhost:8080/dashboard

## テスト実行

### 統合テスト
```bash
npm run test:integration
```

### MCPサーバー同期確認
```bash
node mcp-integration-server/scripts/check-mcp-sync.js
```

## 型定義の使用

医療システムと共有された型定義を使用する場合：

```typescript
import { IInterviewType } from './mcp-shared/interfaces/interview.interface';
import interviewConfig from './mcp-shared/config/interview-types.json';
import { apiVersionManager } from './mcp-shared/api/api-version-manager';
```

## Phase 2 統合作業

### 現在の進捗
- ✅ Phase 1: 基本機能実装完了
- ✅ Phase 2: 3段階面談選択フロー実装完了
- ✅ MCPサーバー: 統合プラットフォーム稼働中
- 🔄 統合テスト: 8/12(月)開始予定

### 主要コンポーネント
- `src/components/interview/InterviewFlowContainer.tsx` - 面談フロー管理
- `src/components/interview/ClassificationSelector.tsx` - 分類選択
- `src/components/interview/ProgressIndicator.tsx` - 進捗表示
- `src/hooks/useInterviewFlow.ts` - フロー状態管理

## コード規約

### TypeScript/React
- 関数コンポーネントを使用
- TypeScriptの型定義を必須とする
- カスタムフックは`use`プレフィックスを付ける

### エラーハンドリング
- 日本語エラーメッセージを使用（`src/utils/errorMessages.ts`）
- try-catchでAPIエラーを適切に処理
- ユーザーフレンドリーなフィードバックを提供

### アクセシビリティ
- ARIA属性を適切に使用
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 連絡先

- Slack: #phase2-integration
- 医療システムチーム連携: MCPサーバー経由
- 技術的な質問: プロジェクトリードまで

---

最終更新: 2025年8月10日