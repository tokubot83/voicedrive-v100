const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class SyncService {
  constructor() {
    this.medicalDir = path.join(__dirname, '..', '..', 'staff-medical-system', 'mcp-shared');
    this.voicedriveDir = path.join(__dirname, '..', 'mcp-shared');
    this.isWatching = false;
    this.syncQueue = [];
    this.lastSync = null;
  }

  // 同期サービス開始
  start() {
    if (this.isWatching) return;

    console.log('🔄 Starting MCP Sync Service...');
    console.log(`📁 Medical Dir: ${this.medicalDir}`);
    console.log(`📁 VoiceDrive Dir: ${this.voicedriveDir}`);

    // 初回全体同期
    this.performFullSync();

    // ファイル監視開始
    this.startWatching();

    this.isWatching = true;
    console.log('✅ MCP Sync Service started');
  }

  // 全体同期
  async performFullSync() {
    try {
      console.log('🔄 Performing full sync...');

      // docs フォルダの同期
      await this.syncDirectory(
        path.join(this.medicalDir, 'docs'),
        path.join(this.voicedriveDir, 'docs')
      );

      // config フォルダの同期
      await this.syncDirectory(
        path.join(this.medicalDir, 'config'),
        path.join(this.voicedriveDir, 'config')
      );

      // interfaces フォルダの同期
      await this.syncDirectory(
        path.join(this.medicalDir, 'interfaces'),
        path.join(this.voicedriveDir, 'interfaces')
      );

      this.lastSync = new Date();
      console.log('✅ Full sync completed');

      return { success: true, syncedAt: this.lastSync };
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ディレクトリ同期
  async syncDirectory(sourceDir, targetDir) {
    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️  Source directory not found: ${sourceDir}`);
      return;
    }

    // ターゲットディレクトリを作成
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);

    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        // サブディレクトリを再帰的に同期
        await this.syncDirectory(sourcePath, targetPath);
      } else {
        // ファイルを同期
        await this.syncFile(sourcePath, targetPath);
      }
    }
  }

  // ファイル同期
  async syncFile(sourcePath, targetPath) {
    try {
      // ファイルの存在確認と更新日時比較
      let shouldCopy = true;

      if (fs.existsSync(targetPath)) {
        const sourceStats = fs.statSync(sourcePath);
        const targetStats = fs.statSync(targetPath);

        // ソースファイルが新しい場合のみコピー
        shouldCopy = sourceStats.mtime > targetStats.mtime;
      }

      if (shouldCopy) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`📄 Synced: ${path.basename(sourcePath)}`);

        // 同期通知をキューに追加
        this.syncQueue.push({
          file: path.basename(sourcePath),
          action: 'synced',
          timestamp: new Date(),
          size: fs.statSync(sourcePath).size
        });
      }
    } catch (error) {
      console.error(`❌ Failed to sync file ${sourcePath}:`, error);
    }
  }

  // ファイル監視開始
  startWatching() {
    const watcher = chokidar.watch(this.medicalDir, {
      ignored: /(^|[\/\\])\../, // hidden files
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (filePath) => this.handleFileChange('add', filePath))
      .on('change', (filePath) => this.handleFileChange('change', filePath))
      .on('unlink', (filePath) => this.handleFileChange('delete', filePath));

    console.log('👀 File watcher started');
  }

  // ファイル変更ハンドラ
  async handleFileChange(action, filePath) {
    try {
      const relativePath = path.relative(this.medicalDir, filePath);
      const targetPath = path.join(this.voicedriveDir, relativePath);

      console.log(`📝 File ${action}: ${relativePath}`);

      switch (action) {
        case 'add':
        case 'change':
          // ターゲットディレクトリを作成
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          await this.syncFile(filePath, targetPath);
          break;

        case 'delete':
          if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
            console.log(`🗑️  Deleted: ${relativePath}`);
          }
          break;
      }

      this.lastSync = new Date();

    } catch (error) {
      console.error(`❌ Failed to handle file change:`, error);
    }
  }

  // 同期状態取得
  getStatus() {
    return {
      isRunning: this.isWatching,
      lastSync: this.lastSync,
      queueLength: this.syncQueue.length,
      recentSyncs: this.syncQueue.slice(-10)
    };
  }

  // 手動同期トリガー
  async triggerSync() {
    console.log('🔄 Manual sync triggered');
    return await this.performFullSync();
  }

  // 同期キューをクリア
  clearQueue() {
    this.syncQueue = [];
    console.log('🧹 Sync queue cleared');
  }
}

module.exports = SyncService;