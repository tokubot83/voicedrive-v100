/**
 * 安全なサービスローダー - getInstance呼び出しを安全に処理
 */
export class SafeServiceLoader {
  static safeGetInstance<T>(serviceClass: any, fallback?: T): T | null {
    try {
      if (serviceClass && typeof serviceClass.getInstance === 'function') {
        return serviceClass.getInstance();
      }
    } catch (error) {
      console.warn(`Failed to get instance for service:`, error);
    }
    return fallback || null;
  }

  static safeCall<T>(fn: () => T, fallback?: T): T | undefined {
    try {
      return fn();
    } catch (error) {
      console.warn(`Safe call failed:`, error);
      return fallback;
    }
  }
}

export default SafeServiceLoader;