import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const { canInstall, isInstalled, isIOS, isStandalone, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // localStorage から dismiss 状態を確認
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // インストール可能で、まだインストールされていない場合、3秒後に表示
    if (!isInstalled && !isStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, isStandalone]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isDismissed || isInstalled || isStandalone || !isVisible) {
    return null;
  }

  // iOS用のインストール案内
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:max-w-sm z-50 animate-slide-up">
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white">アプリとして追加</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-slate-300 mb-4">
            ホーム画面に追加してアプリのように使用できます
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Share className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300">下の共有ボタンをタップ</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">→「ホーム画面に追加」を選択</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/デスクトップ用のインストールプロンプト
  if (canInstall) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:max-w-sm z-50 animate-slide-up">
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <Download className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white">アプリをインストール</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-slate-300 mb-4">
            VoiceDriveをインストールして、より快適にご利用いただけます
          </p>

          <div className="flex space-x-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              インストール
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              後で
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};