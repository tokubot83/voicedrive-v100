import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOSデバイスの検出
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // スタンドアロンモードの確認
    const checkStandalone = () => {
      if ('standalone' in window.navigator) {
        return (window.navigator as any).standalone;
      }
      return window.matchMedia('(display-mode: standalone)').matches;
    };

    setIsIOS(checkIOS());
    setIsStandalone(checkStandalone());

    // インストール済みかチェック
    if (checkStandalone() || document.referrer.includes('android-app://')) {
      setIsInstalled(true);
    }

    // インストールプロンプトのキャプチャ
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // アプリインストール成功時
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('インストールプロンプトエラー:', error);
      return false;
    }
  };

  return {
    canInstall: !!installPrompt,
    isInstalled,
    isIOS,
    isStandalone,
    promptInstall,
  };
};