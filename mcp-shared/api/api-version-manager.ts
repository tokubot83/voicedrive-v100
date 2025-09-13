/**
 * APIバージョン管理マネージャー
 * 医療システムとVoiceDriveの統合APIバージョン管理
 */

export interface APIVersionConfig {
  version: 'v2' | 'v3';
  endpoints: {
    medical: string;
    voicedrive: string;
  };
  features: string[];
}

export class APIVersionManager {
  private currentVersion: APIVersionConfig['version'] = 'v3';
  private versionConfigs: Map<APIVersionConfig['version'], APIVersionConfig>;

  constructor() {
    this.versionConfigs = new Map([
      ['v2', {
        version: 'v2',
        endpoints: {
          medical: 'http://localhost:3000/api/v2',
          voicedrive: 'http://localhost:3001/api/v2'
        },
        features: [
          'basic-interview-booking',
          'calendar-view',
          'staff-list',
          'advanced-filtering',
          'bulk-operations',
          'real-time-updates',
          'ai-suggestions'
        ]
      }],
      ['v3', {
        version: 'v3',
        endpoints: {
          medical: 'http://localhost:3000/api/v3',
          voicedrive: 'http://localhost:3001/api/v3'
        },
        features: [
          'basic-interview-booking',
          'calendar-view',
          'staff-list',
          'advanced-filtering',
          'bulk-operations',
          'real-time-updates',
          'ai-suggestions',
          'enhanced-security',
          'performance-optimizations',
          'modernized-architecture'
        ]
      }]
    ]);
  }

  /**
   * 現在のAPIバージョンを設定
   */
  setVersion(version: APIVersionConfig['version']): void {
    if (!this.versionConfigs.has(version)) {
      throw new Error(`Unsupported API version: ${version}`);
    }
    this.currentVersion = version;
    console.log(`API version switched to: ${version}`);
  }

  /**
   * 現在のAPIバージョンを取得
   */
  getVersion(): APIVersionConfig['version'] {
    return this.currentVersion;
  }

  /**
   * 現在のバージョンの設定を取得
   */
  getCurrentConfig(): APIVersionConfig {
    const config = this.versionConfigs.get(this.currentVersion);
    if (!config) {
      throw new Error(`Configuration not found for version: ${this.currentVersion}`);
    }
    return config;
  }

  /**
   * エンドポイントURLを取得
   */
  getEndpoint(system: 'medical' | 'voicedrive'): string {
    const config = this.getCurrentConfig();
    return config.endpoints[system];
  }

  /**
   * 機能が現在のバージョンで利用可能かチェック
   */
  isFeatureAvailable(feature: string): boolean {
    const config = this.getCurrentConfig();
    return config.features.includes(feature);
  }

  /**
   * バージョン間の機能差分を取得
   */
  getFeatureDiff(fromVersion: APIVersionConfig['version'], toVersion: APIVersionConfig['version']): {
    added: string[];
    removed: string[];
  } {
    const fromConfig = this.versionConfigs.get(fromVersion);
    const toConfig = this.versionConfigs.get(toVersion);

    if (!fromConfig || !toConfig) {
      throw new Error('Invalid version specified');
    }

    const fromFeatures = new Set(fromConfig.features);
    const toFeatures = new Set(toConfig.features);

    const added = Array.from(toFeatures).filter(f => !fromFeatures.has(f));
    const removed = Array.from(fromFeatures).filter(f => !toFeatures.has(f));

    return { added, removed };
  }

  /**
   * APIリクエストをプロキシ
   */
  async proxyRequest(
    system: 'medical' | 'voicedrive',
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const baseUrl = this.getEndpoint(system);
    const url = `${baseUrl}${path}`;

    // バージョンヘッダーを追加
    const headers = new Headers(options.headers);
    headers.set('X-API-Version', this.currentVersion);

    return fetch(url, {
      ...options,
      headers
    });
  }
}

// シングルトンインスタンスをエクスポート
export const apiVersionManager = new APIVersionManager();

// デフォルトエクスポート
export default apiVersionManager;