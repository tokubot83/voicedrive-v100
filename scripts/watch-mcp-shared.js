#!/usr/bin/env node

/**
 * MCPサーバー共有ファイル監視スクリプト
 * 新しいファイルが共有されたら通知を生成
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const MCP_SHARED_DIR = path.join(__dirname, '..', 'mcp-shared');
const CLAUDE_NOTICE_FILE = path.join(__dirname, '..', 'CLAUDE_NOTIFICATIONS.md');

// ファイル監視
function watchSharedFiles() {
  console.log('👀 MCPサーバー共有ファイルを監視中...');
  
  // 既存ファイルのリスト
  let knownFiles = new Set();
  
  // 初期スキャン
  scanDirectory(MCP_SHARED_DIR, knownFiles);
  
  // 監視開始
  fs.watch(MCP_SHARED_DIR, { recursive: true }, (eventType, filename) => {
    if (eventType === 'rename' || eventType === 'change') {
      const fullPath = path.join(MCP_SHARED_DIR, filename);
      
      if (!knownFiles.has(fullPath)) {
        // 新しいファイルを検出
        knownFiles.add(fullPath);
        notifyClaude(filename);
      }
    }
  });
}

// ディレクトリスキャン
function scanDirectory(dir, fileSet) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      scanDirectory(fullPath, fileSet);
    } else {
      fileSet.add(fullPath);
    }
  }
}

// Claude Codeに通知
function notifyClaude(filename) {
  const timestamp = new Date().toISOString();
  const notification = `
## 🔔 新しい共有ファイル検出 - ${timestamp}

**ファイル**: mcp-shared/${filename}
**送信元**: 医療職員管理システム
**アクション**: 内容を確認してください

\`\`\`bash
# 確認コマンド
cat mcp-shared/${filename}
\`\`\`

---
`;

  // 通知をファイルに追記
  fs.appendFileSync(CLAUDE_NOTICE_FILE, notification);
  
  console.log(`✅ 新しいファイルを検出: ${filename}`);
  console.log(`📝 CLAUDE_NOTIFICATIONS.mdに記録しました`);
  
  // デスクトップ通知（オプション）
  if (process.platform === 'darwin') {
    exec(`osascript -e 'display notification "新しいファイル: ${filename}" with title "MCPサーバー"'`);
  } else if (process.platform === 'win32') {
    exec(`msg * "MCPサーバー: 新しいファイル ${filename}"`);
  }
}

// メイン実行
watchSharedFiles();

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
  console.log('\n監視を終了します');
  process.exit(0);
});