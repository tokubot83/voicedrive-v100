#!/usr/bin/env node

/**
 * MCPサーバー共有状況確認スクリプト
 * 使用方法: node scripts/check-mcp-sync.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// 色付きコンソール出力
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// 共有フォルダのパス
const sharedPath = path.join(__dirname, '../../mcp-shared');
const medicalPath = path.join(__dirname, '../../../staff-medical-system/mcp-shared');
const voicedrivePath = path.join(__dirname, '../../mcp-shared');

// ステータスアイコン
const icons = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  pending: '⏳',
  info: 'ℹ️'
};

function printHeader() {
  console.log('\n' + '═'.repeat(60));
  console.log('       MCPサーバー共有状況確認ツール');
  console.log('═'.repeat(60) + '\n');
}

function checkMCPServerStatus() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/status',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const status = JSON.parse(data);
          resolve(status);
        } catch (error) {
          resolve(null);
        }
      });
    });

    req.on('error', () => {
      resolve(null);
    });

    req.end();
  });
}

function checkSharedFiles() {
  const sharedFiles = [
    {
      name: 'interview-types.json',
      path: 'config/interview-types.json',
      description: '面談タイプ設定'
    },
    {
      name: 'interview.interface.ts',
      path: 'interfaces/interview.interface.ts',
      description: '型定義ファイル'
    },
    {
      name: 'api-version-manager.ts',
      path: 'api/api-version-manager.ts',
      description: 'APIバージョン管理'
    },
    {
      name: 'sync-status.json',
      path: 'sync-status.json',
      description: '同期ステータス'
    }
  ];

  const results = [];

  sharedFiles.forEach(file => {
    const medicalFilePath = path.join(medicalPath, file.path);
    const voicedriveFilePath = path.join(voicedrivePath, file.path);

    const medicalExists = fs.existsSync(medicalFilePath);
    const voicedriveExists = fs.existsSync(voicedriveFilePath);

    let status = 'missing';
    let icon = icons.error;

    if (medicalExists && voicedriveExists) {
      status = 'synced';
      icon = icons.success;
    } else if (medicalExists) {
      status = 'medical-only';
      icon = icons.warning;
    } else if (voicedriveExists) {
      status = 'voicedrive-only';
      icon = icons.warning;
    }

    results.push({
      name: file.name,
      description: file.description,
      status,
      icon,
      medical: medicalExists,
      voicedrive: voicedriveExists
    });
  });

  return results;
}

async function generateReport() {
  printHeader();

  // MCPサーバー状態確認
  console.log(`${colors.bold}1. MCPサーバー状態${colors.reset}`);
  console.log('-'.repeat(40));
  
  const serverStatus = await checkMCPServerStatus();
  if (serverStatus) {
    console.log(`${icons.success} MCPサーバー: ${colors.green}稼働中${colors.reset}`);
    console.log(`   URL: http://localhost:8080`);
    console.log(`   医療システム: ${serverStatus.services?.medical?.status || 'unknown'}`);
    console.log(`   VoiceDrive: ${serverStatus.services?.voicedrive?.status || 'unknown'}`);
  } else {
    console.log(`${icons.error} MCPサーバー: ${colors.red}停止中${colors.reset}`);
  }

  // 共有ファイル状態確認
  console.log(`\n${colors.bold}2. 共有ファイル状態${colors.reset}`);
  console.log('-'.repeat(40));

  const files = checkSharedFiles();
  const syncedCount = files.filter(f => f.status === 'synced').length;
  const totalCount = files.length;
  const syncRate = Math.round((syncedCount / totalCount) * 100);

  files.forEach(file => {
    console.log(`${file.icon} ${file.name}`);
    console.log(`   説明: ${file.description}`);
    console.log(`   医療側: ${file.medical ? '✅' : '❌'} | VoiceDrive側: ${file.voicedrive ? '✅' : '❌'}`);
  });

  // 同期統計
  console.log(`\n${colors.bold}3. 同期統計${colors.reset}`);
  console.log('-'.repeat(40));
  console.log(`総ファイル数: ${totalCount}`);
  console.log(`同期済み: ${syncedCount}`);
  console.log(`同期率: ${syncRate}%`);

  // プログレスバー
  const barLength = 30;
  const filledLength = Math.round(barLength * syncRate / 100);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  console.log(`\n[${bar}] ${syncRate}%`);

  // 推奨アクション
  console.log(`\n${colors.bold}4. 推奨アクション${colors.reset}`);
  console.log('-'.repeat(40));

  if (syncRate === 100) {
    console.log(`${icons.success} 全ファイルが同期されています！`);
  } else {
    console.log(`${icons.info} 同期を完了するには:`);
    console.log(`   1. npm run mcp:sync を実行`);
    console.log(`   2. または手動でファイルをコピー`);
    
    const missingFiles = files.filter(f => !f.voicedrive);
    if (missingFiles.length > 0) {
      console.log(`\n${icons.warning} VoiceDrive側に不足しているファイル:`);
      missingFiles.forEach(f => {
        console.log(`   - ${f.name}`);
      });
    }
  }

  // フッター
  console.log('\n' + '═'.repeat(60));
  console.log(`実行時刻: ${new Date().toLocaleString('ja-JP')}`);
  console.log('═'.repeat(60) + '\n');
}

// メイン実行
if (require.main === module) {
  generateReport().catch(console.error);
}

module.exports = { checkMCPServerStatus, checkSharedFiles };