# MCPサーバー自動共有ガイド

## 自動共有される内容

### 1. ドキュメント（docs/）
```bash
# 医療システム側で作成
echo "作業報告" > docs/daily-report.md

# 自動的にVoiceDrive側に同期
[MCP] New file detected: daily-report.md
[MCP] Syncing to VoiceDrive... ✓
[VoiceDrive] File received: mcp-shared/docs/daily-report.md
```

### 2. 設定ファイル（config/）
```javascript
// interview-types.json を編集すると
{
  "newType": "緊急面談"  // 追加
}

// 両システムに即座に反映
[MCP] Config updated → Broadcasting to all systems
```

### 3. ステータス更新
```typescript
// 作業完了を記録
updateStatus({
  task: "API統合",
  status: "completed",
  team: "medical"
});

// VoiceDriveのダッシュボードに自動表示
```

## リアルタイム通知

### Slack通知（設定済み）
```
#phase2-integration チャンネル
━━━━━━━━━━━━━━━━━━━━
🔔 MCPサーバー通知
医療システムチームが新しいドキュメントを共有しました：
📄 Phase2_完了報告.md
🔗 http://localhost:8080/shared/docs/Phase2_完了報告.md
━━━━━━━━━━━━━━━━━━━━
```

### ダッシュボード通知
```
http://localhost:8080/dashboard

[新着] 医療システムから3件の更新
 • daily-report.md (5分前)
 • test-results.json (10分前)
 • api-changes.md (15分前)
```

## 具体例：月曜日の作業

### 朝のスタンドアップ
```bash
# 医療システムチーム
echo "本日の作業予定：API統合テスト" > mcp-shared/docs/monday-plan.md

# VoiceDrive側で自動受信
[09:00] 📥 新着: monday-plan.md
```

### 進捗報告
```javascript
// 進捗を更新
mcpClient.updateProgress({
  task: "API統合",
  progress: 50,
  blockers: []
});

// 両チームのダッシュボードに表示
Progress: API統合 [████████░░] 50%
```

### テスト結果共有
```bash
# テスト実行
npm test > mcp-shared/logs/test-results.log

# 自動的に共有・解析
[MCP] Test results detected
[MCP] Success rate: 95%
[MCP] Broadcasting to all teams...
```

## もう不要になること

### ❌ 以下は不要に
- 「ドキュメントを○○に保存しました」という連絡
- 「最新版は○○フォルダにあります」という案内
- 「見てください」「確認しました」のやり取り
- ファイルパスのコピペ
- バージョン番号の管理

### ✅ 代わりにできること
- 作成したら自動共有
- 更新したら自動通知
- 既読/未読の自動管理
- バージョン自動管理
- 競合の自動検出

## セットアップ（1回だけ）

```bash
# 自動同期を有効化
npm run mcp:enable-auto-sync

# 通知設定
npm run mcp:setup-notifications

# 完了！
```

これで、ドキュメントのパスを送る必要は永久になくなります！