import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Monitor, Check, X, Share, ChevronRight, Loader2 } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const PWAInstallSettings: React.FC = () => {
  const { canInstall, isInstalled, isIOS, isStandalone, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installStatus, setInstallStatus] = useState<'not-installed' | 'installed' | 'installing'>('not-installed');
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // デバイスタイプの判定
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // インストール状態の確認
    if (isInstalled || isStandalone) {
      setInstallStatus('installed');
    }
  }, [isInstalled, isStandalone]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS: ガイドを表示
      setShowIOSGuide(true);
      // localStorageのリセット（再表示可能にする）
      localStorage.removeItem('pwa-prompt-dismissed');
    } else if (canInstall) {
      // Android/Desktop: 直接インストール
      setIsInstalling(true);
      setInstallStatus('installing');
      try {
        const success = await promptInstall();
        if (success) {
          setInstallStatus('installed');
        } else {
          setInstallStatus('not-installed');
        }
      } catch (error) {
        console.error('インストールエラー:', error);
        setInstallStatus('not-installed');
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'ios':
        return <Smartphone className="w-5 h-5" />;
      case 'android':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getDeviceName = () => {
    switch (deviceType) {
      case 'ios':
        return 'iPhone/iPad';
      case 'android':
        return 'Android';
      default:
        return 'PC/Mac';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <h2 className="text-xl font-semibold mb-4 text-white">アプリインストール設定</h2>

      {/* デバイス情報 */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
              {getDeviceIcon()}
            </div>
            <div>
              <p className="text-sm text-gray-400">お使いのデバイス</p>
              <p className="text-white font-medium">{getDeviceName()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">ステータス</p>
            <div className="flex items-center space-x-2">
              {installStatus === 'installed' ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">インストール済み</span>
                </>
              ) : installStatus === 'installing' ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-blue-400 font-medium">インストール中...</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">未インストール</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* インストールボタン・ガイド */}
      {installStatus !== 'installed' && (
        <div className="space-y-4">
          {/* メインアクションボタン */}
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
              isInstalling ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isInstalling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>インストール中...</span>
              </>
            ) : isIOS ? (
              <>
                <Share className="w-5 h-5" />
                <span>インストール手順を表示</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>今すぐインストール</span>
              </>
            )}
          </button>

          {/* iOS用ガイド */}
          {showIOSGuide && (
            <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-white">iOSインストール手順</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium">Safariで開く</p>
                    <p className="text-gray-400 text-sm">このページをSafariブラウザで開いてください</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium">共有ボタンをタップ</p>
                    <p className="text-gray-400 text-sm">画面下部の「共有」アイコンをタップ</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium">「ホーム画面に追加」を選択</p>
                    <p className="text-gray-400 text-sm">メニューから「ホーム画面に追加」を選択</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="text-white font-medium">「追加」をタップ</p>
                    <p className="text-gray-400 text-sm">右上の「追加」ボタンをタップして完了</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
                <p className="text-yellow-400 text-sm">
                  💡 ヒント: ホーム画面から起動することで、フルスクリーンでアプリのように使用できます
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* インストール済みの場合 */}
      {installStatus === 'installed' && (
        <div className="bg-green-900/20 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">インストール完了</h3>
              <p className="text-gray-400 text-sm">VoiceDriveがアプリとして使用できます</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-300 text-sm">✅ オフライン対応</p>
            <p className="text-gray-300 text-sm">✅ ホーム画面から起動可能</p>
            {deviceType === 'android' && (
              <p className="text-gray-300 text-sm">✅ プッシュ通知対応</p>
            )}
          </div>
        </div>
      )}

      {/* PWAの利点説明 */}
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">アプリとして使うメリット</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <p className="text-white font-medium">高速起動</p>
            </div>
            <p className="text-gray-400 text-sm">ホーム画面からワンタップで起動</p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <p className="text-white font-medium">フルスクリーン</p>
            </div>
            <p className="text-gray-400 text-sm">ブラウザUIなしで快適操作</p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <p className="text-white font-medium">オフライン対応</p>
            </div>
            <p className="text-gray-400 text-sm">ネット接続なしでも基本機能が使用可能</p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="w-4 h-4 text-indigo-400" />
              <p className="text-white font-medium">容量節約</p>
            </div>
            <p className="text-gray-400 text-sm">アプリストア不要で軽量</p>
          </div>
        </div>
      </div>

      {/* 再インストール案内のリセットボタン */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <button
          onClick={() => {
            localStorage.removeItem('pwa-prompt-dismissed');
            window.location.reload();
          }}
          className="text-indigo-400 hover:text-indigo-300 text-sm underline"
        >
          インストール案内を再表示する
        </button>
      </div>
    </div>
  );
};