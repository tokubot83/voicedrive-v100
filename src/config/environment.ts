/**
 * 環境設定
 * Vercel環境と開発環境を識別し、適切な設定を提供
 */

// Vercel環境の検出
export const isVercel = typeof window !== 'undefined' &&
  (window.location.hostname.includes('vercel.app') ||
   window.location.hostname.includes('vercel.com'));

// 本番環境の検出
export const isProduction = import.meta.env.PROD;

// 開発環境の検出
export const isDevelopment = import.meta.env.DEV;

// データベース利用可能かどうか
export const isDatabaseAvailable = !isVercel && !isProduction;

// APIベースURL
export const getApiBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3001';
  }
  // Vercel環境ではAPIを使用しない（モックデータを使用）
  if (isVercel) {
    return null;
  }
  return '';
};

// デモモードかどうか
export const isDemoMode = isVercel || !isDatabaseAvailable;

// 環境設定オブジェクト
export const environment = {
  isVercel,
  isProduction,
  isDevelopment,
  isDatabaseAvailable,
  isDemoMode,
  apiBaseUrl: getApiBaseUrl(),
  features: {
    // Vercel環境では無効化する機能
    dataConsent: !isVercel,
    postReporting: !isVercel,
    realTimeSync: !isVercel,
    notifications: !isVercel,
    // Vercel環境でも有効な機能
    demoMode: isVercel,
    staticContent: true,
  }
};

export default environment;