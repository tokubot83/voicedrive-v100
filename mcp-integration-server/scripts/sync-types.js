#!/usr/bin/env node

/**
 * 型定義同期スクリプト
 * 医療職員管理システムとVoiceDriveの型定義を自動同期
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// 設定
const config = {
  sources: [
    {
      name: 'medical',
      path: path.join(__dirname, '../../staff-medical-system/src/types'),
      pattern: '**/*.ts'
    },
    {
      name: 'voicedrive',
      path: path.join(__dirname, '../../src/types'),
      pattern: '**/*.ts'
    }
  ],
  output: path.join(__dirname, '../shared/types'),
  watch: process.argv.includes('--watch')
};

// 出力ディレクトリの作成
function ensureOutputDir() {
  if (!fs.existsSync(config.output)) {
    fs.mkdirSync(config.output, { recursive: true });
    console.log(`✅ Created output directory: ${config.output}`);
  }
}

// 型定義ファイルのコピー
function copyTypeFile(source, destination, sourceName) {
  try {
    const content = fs.readFileSync(source, 'utf8');
    
    // ヘッダーコメントを追加
    const enhancedContent = `/**
 * Auto-synced from ${sourceName}
 * Generated: ${new Date().toISOString()}
 * Source: ${source}
 */

${content}`;

    fs.writeFileSync(destination, enhancedContent);
    console.log(`✅ Synced: ${path.basename(source)} from ${sourceName}`);
  } catch (error) {
    console.error(`❌ Failed to sync ${source}: ${error.message}`);
  }
}

// 型定義の同期
function syncTypes() {
  console.log('🔄 Starting type synchronization...');
  ensureOutputDir();

  config.sources.forEach(source => {
    if (!fs.existsSync(source.path)) {
      console.warn(`⚠️ Source path not found: ${source.path}`);
      return;
    }

    // ソース別のサブディレクトリを作成
    const sourceOutputDir = path.join(config.output, source.name);
    if (!fs.existsSync(sourceOutputDir)) {
      fs.mkdirSync(sourceOutputDir, { recursive: true });
    }

    // 型定義ファイルを検索してコピー
    const files = getAllFiles(source.path, '.ts');
    files.forEach(file => {
      const relativePath = path.relative(source.path, file);
      const destination = path.join(sourceOutputDir, relativePath);
      const destDir = path.dirname(destination);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      copyTypeFile(file, destination, source.name);
    });
  });

  // 統合インデックスファイルの生成
  generateIndex();
  console.log('✅ Type synchronization completed!');
}

// 再帰的にファイルを取得
function getAllFiles(dirPath, extension, files = []) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, extension, files);
    } else if (fullPath.endsWith(extension)) {
      files.push(fullPath);
    }
  });

  return files;
}

// インデックスファイルの生成
function generateIndex() {
  const indexContent = `/**
 * Unified Type Definitions
 * Auto-generated index file
 * Generated: ${new Date().toISOString()}
 */

// Medical System Types
export * from './medical/interview';
export * from './medical/employee';
export * from './medical/booking';

// VoiceDrive Types
export * from './voicedrive/interview';
export * from './voicedrive/calendar';
export * from './voicedrive/notification';

// Type aliases for compatibility
export type UnifiedInterviewType = import('./medical/interview').InterviewType | import('./voicedrive/interview').InterviewType;
export type UnifiedBookingRequest = import('./medical/booking').BookingRequest | import('./voicedrive/booking').BookingRequest;
`;

  fs.writeFileSync(path.join(config.output, 'index.ts'), indexContent);
  console.log('✅ Generated unified index.ts');
}

// ファイル監視
function watchTypes() {
  console.log('👀 Watching for type definition changes...');

  config.sources.forEach(source => {
    if (!fs.existsSync(source.path)) {
      console.warn(`⚠️ Cannot watch non-existent path: ${source.path}`);
      return;
    }

    const watcher = chokidar.watch(path.join(source.path, source.pattern), {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    watcher
      .on('change', filePath => {
        console.log(`📝 File changed: ${filePath}`);
        syncTypes();
      })
      .on('add', filePath => {
        console.log(`➕ File added: ${filePath}`);
        syncTypes();
      })
      .on('unlink', filePath => {
        console.log(`➖ File removed: ${filePath}`);
        syncTypes();
      });
  });
}

// メイン処理
function main() {
  console.log(`
┌─────────────────────────────────────────────┐
│        Type Definition Sync Tool            │
├─────────────────────────────────────────────┤
│ Syncing types between:                      │
│ • Medical System                            │
│ • VoiceDrive                                │
│                                             │
│ Output: ${config.output}
│ Watch mode: ${config.watch ? 'Enabled' : 'Disabled'}
└─────────────────────────────────────────────┘
  `);

  // 初回同期
  syncTypes();

  // ウォッチモード
  if (config.watch) {
    watchTypes();
    
    // プロセス終了時のクリーンアップ
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping type sync watcher...');
      process.exit(0);
    });
  }
}

// chokidarがインストールされていない場合の処理
try {
  require('chokidar');
} catch (error) {
  if (config.watch) {
    console.error('❌ chokidar is required for watch mode. Installing...');
    require('child_process').execSync('npm install chokidar', { stdio: 'inherit' });
  }
}

// 実行
main();