/**
 * VoiceDrive システムモード管理
 *
 * 議題システムモードとプロジェクト化モードを管理
 */

import { User } from '../types';

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

/**
 * システムモード管理マネージャー（シングルトン）
 */
class SystemModeManager {
  private static instance: SystemModeManager;
  private currentMode: SystemMode = SystemMode.AGENDA; // デフォルトは議題モード
  private modeConfig: SystemModeConfig | null = null;
  private listeners: Set<(mode: SystemMode) => void> = new Set();

  private constructor() {
    // 初期化時にlocalStorageから設定を読み込む
    this.loadModeConfig();

    // localStorage の変更を監視（他のタブでの変更も検出）
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'voicedrive_system_mode' && e.newValue) {
          try {
            const config: SystemModeConfig = JSON.parse(e.newValue);
            const previousMode = this.currentMode;
            this.currentMode = config.mode;
            this.modeConfig = config;
            if (previousMode !== this.currentMode) {
              console.log('[SystemMode] 他タブでのモード変更を検出:', previousMode, '→', this.currentMode);
              this.notifyListeners(this.currentMode);
            }
          } catch (error) {
            console.error('[SystemMode] storage event parse error:', error);
          }
        }
      });
    }
  }

  static getInstance(): SystemModeManager {
    if (!this.instance) {
      this.instance = new SystemModeManager();
    }
    return this.instance;
  }

  /**
   * 現在のシステムモードを取得
   * 毎回LocalStorageから最新の状態を読み込む
   */
  getCurrentMode(): SystemMode {
    try {
      const savedConfig = localStorage.getItem('voicedrive_system_mode');
      console.log('[SystemMode] getCurrentMode呼び出し: localStorage=', savedConfig);
      if (savedConfig) {
        const config: SystemModeConfig = JSON.parse(savedConfig);
        this.currentMode = config.mode;
        this.modeConfig = config;
        console.log('[SystemMode] モード更新:', config.mode);
      }
    } catch (error) {
      console.error('[SystemMode] getCurrentMode: 読み込みエラー:', error);
    }
    console.log('[SystemMode] getCurrentMode返却値:', this.currentMode);
    return this.currentMode;
  }

  /**
   * システムモードが議題モードかチェック
   */
  isAgendaMode(): boolean {
    return this.currentMode === SystemMode.AGENDA;
  }

  /**
   * システムモードがプロジェクトモードかチェック
   */
  isProjectMode(): boolean {
    return this.currentMode === SystemMode.PROJECT;
  }

  /**
   * モード変更リスナーを追加
   */
  addModeChangeListener(listener: (mode: SystemMode) => void): void {
    this.listeners.add(listener);
    console.log('[SystemMode] リスナー追加、合計:', this.listeners.size);
  }

  /**
   * モード変更リスナーを削除
   */
  removeModeChangeListener(listener: (mode: SystemMode) => void): void {
    this.listeners.delete(listener);
    console.log('[SystemMode] リスナー削除、残り:', this.listeners.size);
  }

  /**
   * 全リスナーに通知
   */
  private notifyListeners(mode: SystemMode): void {
    console.log('[SystemMode] リスナーに通知中、リスナー数:', this.listeners.size);
    this.listeners.forEach(listener => {
      try {
        listener(mode);
      } catch (error) {
        console.error('[SystemMode] リスナー通知エラー:', error);
      }
    });
  }

  /**
   * システムモードを変更（レベルX管理者のみ）
   */
  async setMode(mode: SystemMode, adminUser: User): Promise<void> {
    // システム管理者権限チェック（LEVEL_99 = 99）
    if (Number(adminUser.permissionLevel) !== 99) {
      throw new Error('システム管理者（レベル99）のみモード変更可能です');
    }

    const previousMode = this.currentMode;

    // APIを使用してモードを変更
    try {
      const response = await fetch('/api/system/mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, userId: adminUser.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'モード変更に失敗しました');
      }

      const result = await response.json();
      this.currentMode = mode;

      const config: SystemModeConfig = {
        mode,
        enabledAt: new Date(),
        enabledBy: adminUser.id,
        description: mode === SystemMode.AGENDA
          ? '議題システムモード - 委員会活性化・声を上げる文化の醸成'
          : 'プロジェクト化モード - チーム編成・組織一体感の向上',
        migrationStatus: previousMode !== mode ? 'in_progress' : 'completed'
      };

      this.modeConfig = config;

      // LocalStorageにもキャッシュ
      await this.saveModeConfig(config);

      // PermissionServiceに通知（循環参照を避けるため動的インポート）
      try {
        const { PermissionService } = await import('../permissions/services/PermissionService');
        const permissionService = PermissionService.getInstance();
        permissionService.onModeChange(mode);
      } catch (error) {
        console.warn('[SystemMode] PermissionServiceへの通知失敗:', error);
      }

      console.log(`[SystemMode] ${previousMode} → ${mode} に変更しました`);
      console.log(`[SystemMode] 権限システムが ${mode} に対応しました`);

      // リスナーに通知（同一タブ内の変更）
      if (previousMode !== mode) {
        this.notifyListeners(mode);
      }
    } catch (error) {
      console.error('[SystemMode] モード変更エラー:', error);
      throw error;
    }
  }

  /**
   * モード設定を取得
   */
  getModeConfig(): SystemModeConfig | null {
    return this.modeConfig;
  }

  /**
   * モード設定を読み込み
   */
  private loadModeConfig(): void {
    try {
      const savedConfig = localStorage.getItem('voicedrive_system_mode');
      if (savedConfig) {
        const config: SystemModeConfig = JSON.parse(savedConfig);
        this.currentMode = config.mode;
        this.modeConfig = config;
        console.log(`[SystemMode] 設定を読み込みました: ${config.mode}`);
      } else {
        console.log('[SystemMode] デフォルト設定を使用: AGENDA_MODE');
      }
    } catch (error) {
      console.error('[SystemMode] 設定読み込みエラー:', error);
    }
  }

  /**
   * モード設定を保存
   */
  private async saveModeConfig(config: SystemModeConfig): Promise<void> {
    try {
      // LocalStorageに保存（将来的にはDBに保存）
      localStorage.setItem('voicedrive_system_mode', JSON.stringify(config));
      console.log('[SystemMode] 設定を保存しました');

      // TODO: Prismaでsystem_configテーブルに保存
      // await prisma.systemConfig.upsert({
      //   where: { configKey: 'system_mode' },
      //   update: { configValue: JSON.stringify(config) },
      //   create: { configKey: 'system_mode', configValue: JSON.stringify(config) }
      // });
    } catch (error) {
      console.error('[SystemMode] 設定保存エラー:', error);
      throw error;
    }
  }

  /**
   * システムモードの説明を取得
   */
  getModeDescription(): string {
    const descriptions = {
      [SystemMode.AGENDA]: '📋 議題システムモード\n委員会活性化・声を上げる文化の醸成に特化したシステム',
      [SystemMode.PROJECT]: '🚀 プロジェクト化モード\nチーム編成・組織一体感の向上に特化したシステム'
    };
    return descriptions[this.currentMode];
  }

  /**
   * モード移行の推奨条件をチェック
   */
  checkMigrationReadiness(stats: {
    monthlyPosts: number;
    committeeSubmissions: number;
    participationRate: number;
  }): {
    isReady: boolean;
    message: string;
    progress: number;
  } {
    const targets = {
      monthlyPosts: 30,
      committeeSubmissions: 10,
      participationRate: 60
    };

    const progress = Math.round(
      ((Math.min(stats.monthlyPosts, targets.monthlyPosts) / targets.monthlyPosts) * 33 +
       (Math.min(stats.committeeSubmissions, targets.committeeSubmissions) / targets.committeeSubmissions) * 33 +
       (Math.min(stats.participationRate, targets.participationRate) / targets.participationRate) * 34)
    );

    const isReady =
      stats.monthlyPosts >= targets.monthlyPosts &&
      stats.committeeSubmissions >= targets.committeeSubmissions &&
      stats.participationRate >= targets.participationRate;

    const message = isReady
      ? '✅ プロジェクト化モードへの移行準備が整っています'
      : `⏳ 移行準備中（${progress}%）- 議題モードでの実績を積み重ねましょう`;

    return { isReady, message, progress };
  }
}

// シングルトンインスタンスをエクスポート
export const systemModeManager = SystemModeManager.getInstance();

// デフォルトエクスポート
export default systemModeManager;
