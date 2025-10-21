/**
 * システムモード移行準備状況の統計サービス
 * 議題モード → プロジェクト化モードへの移行判断に必要な統計を取得
 */

export interface MigrationStats {
  monthlyPosts: number;         // 月間投稿数
  committeeSubmissions: number; // 委員会提出数（月間）
  participationRate: number;    // 参加率（%）
  activeUsers: number;          // アクティブユーザー数
  totalUsers: number;           // 総ユーザー数
}

export interface MigrationReadiness {
  isReady: boolean;
  progress: number;  // 0-100%
  message: string;
  details: {
    postsStatus: 'ready' | 'in_progress' | 'not_started';
    submissionsStatus: 'ready' | 'in_progress' | 'not_started';
    participationStatus: 'ready' | 'in_progress' | 'not_started';
  };
}

class SystemModeStatsService {
  private static instance: SystemModeStatsService;

  // 移行推奨閾値
  private readonly THRESHOLDS = {
    monthlyPosts: 30,          // 月間30件以上
    committeeSubmissions: 10,  // 月間10件以上
    participationRate: 60      // 60%以上
  };

  private constructor() {}

  static getInstance(): SystemModeStatsService {
    if (!this.instance) {
      this.instance = new SystemModeStatsService();
    }
    return this.instance;
  }

  /**
   * 移行準備状況の統計を取得
   */
  async getMigrationStats(): Promise<MigrationStats> {
    try {
      const response = await fetch('/api/system/mode/migration-stats');
      if (!response.ok) {
        throw new Error('統計取得に失敗しました');
      }
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('統計取得エラー:', error);
      // エラー時はデモデータを返す
      return this.getDemoStats();
    }
  }

  /**
   * デモ用の統計データ
   */
  private getDemoStats(): MigrationStats {
    // LocalStorageから進捗を取得（デモ用）
    const savedProgress = localStorage.getItem('voicedrive_demo_migration_progress');

    if (savedProgress) {
      return JSON.parse(savedProgress);
    }

    // デフォルト値（移行準備50%程度）
    return {
      monthlyPosts: 15,           // 30件中15件（50%）
      committeeSubmissions: 5,    // 10件中5件（50%）
      participationRate: 30,      // 60%中30%（50%）
      activeUsers: 30,
      totalUsers: 100
    };
  }

  /**
   * 移行準備状況を判定
   */
  async checkMigrationReadiness(): Promise<MigrationReadiness> {
    try {
      const response = await fetch('/api/system/mode/migration-stats');
      if (!response.ok) {
        throw new Error('移行準備状況の取得に失敗しました');
      }
      const data = await response.json();
      return data.readiness;
    } catch (error) {
      console.error('移行準備状況取得エラー:', error);
      // エラー時はローカル計算にフォールバック
      const stats = await this.getMigrationStats();

      const postsProgress = Math.min(
        (stats.monthlyPosts / this.THRESHOLDS.monthlyPosts) * 100,
        100
      );

      const submissionsProgress = Math.min(
        (stats.committeeSubmissions / this.THRESHOLDS.committeeSubmissions) * 100,
        100
      );

      const participationProgress = Math.min(
        (stats.participationRate / this.THRESHOLDS.participationRate) * 100,
        100
      );

      const overallProgress = Math.round(
        (postsProgress * 0.4 + submissionsProgress * 0.3 + participationProgress * 0.3)
      );

      const isReady =
        stats.monthlyPosts >= this.THRESHOLDS.monthlyPosts &&
        stats.committeeSubmissions >= this.THRESHOLDS.committeeSubmissions &&
        stats.participationRate >= this.THRESHOLDS.participationRate;

      const getStatus = (current: number, threshold: number): 'ready' | 'in_progress' | 'not_started' => {
        if (current >= threshold) return 'ready';
        if (current >= threshold * 0.3) return 'in_progress';
        return 'not_started';
      };

      return {
        isReady,
        progress: overallProgress,
        message: isReady
          ? '✅ プロジェクト化モードへの移行準備が整っています'
          : overallProgress >= 70
          ? '⏳ まもなく移行準備が整います（70%以上達成）'
          : overallProgress >= 40
          ? '📊 移行準備が順調に進んでいます（40%以上達成）'
          : '🌱 議題モードでの実績を積み重ねましょう（40%未満）',
        details: {
          postsStatus: getStatus(stats.monthlyPosts, this.THRESHOLDS.monthlyPosts),
          submissionsStatus: getStatus(stats.committeeSubmissions, this.THRESHOLDS.committeeSubmissions),
          participationStatus: getStatus(stats.participationRate, this.THRESHOLDS.participationRate)
        }
      };
    }
  }

  /**
   * 統計の詳細説明を取得
   */
  getStatDetails(stats: MigrationStats) {
    return [
      {
        label: '月間投稿数',
        current: stats.monthlyPosts,
        target: this.THRESHOLDS.monthlyPosts,
        unit: '件',
        description: '組織全体での月間投稿数',
        percentage: Math.min((stats.monthlyPosts / this.THRESHOLDS.monthlyPosts) * 100, 100)
      },
      {
        label: '委員会提出数',
        current: stats.committeeSubmissions,
        target: this.THRESHOLDS.committeeSubmissions,
        unit: '件',
        description: '月間で委員会に提出された投稿数（100点以上）',
        percentage: Math.min((stats.committeeSubmissions / this.THRESHOLDS.committeeSubmissions) * 100, 100)
      },
      {
        label: '職員参加率',
        current: Math.round(stats.participationRate),
        target: this.THRESHOLDS.participationRate,
        unit: '%',
        description: '月間アクティブユーザーの割合',
        percentage: Math.min((stats.participationRate / this.THRESHOLDS.participationRate) * 100, 100)
      }
    ];
  }

  /**
   * デモ用: 統計を手動更新
   */
  updateDemoStats(stats: Partial<MigrationStats>): void {
    const current = this.getDemoStats();
    const updated = { ...current, ...stats };
    localStorage.setItem('voicedrive_demo_migration_progress', JSON.stringify(updated));
  }
}

export const systemModeStatsService = SystemModeStatsService.getInstance();
export default systemModeStatsService;
