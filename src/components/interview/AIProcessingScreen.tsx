import React, { useState, useEffect } from 'react';
import { Clock, Users, Brain, Phone, AlertTriangle } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending';
  estimatedTime: number; // 秒
}

interface AIProcessingScreenProps {
  requestId: string;
  onComplete?: () => void;
  onTimeout?: () => void;
  onError?: (error: string) => void;
}

const AIProcessingScreen: React.FC<AIProcessingScreenProps> = ({
  requestId,
  onComplete,
  onTimeout,
  onError
}) => {
  // 医療システム仕様に基づく処理ステップ
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'validation', label: '申込内容確認完了', status: 'completed', estimatedTime: 10 },
    { id: 'extraction', label: '担当者候補抽出完了', status: 'completed', estimatedTime: 30 },
    { id: 'optimization', label: 'スケジュール最適化中', status: 'active', estimatedTime: 60 },
    { id: 'generation', label: '推薦候補生成中', status: 'pending', estimatedTime: 30 },
    { id: 'verification', label: '品質検証', status: 'pending', estimatedTime: 15 }
  ]);

  const [progress, setProgress] = useState(65); // 初期進捗65%
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState(30); // 秒
  const [showWarning, setShowWarning] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);

  // タイマー管理
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const newElapsed = prev + 1;

        // 3分経過で警告表示
        if (newElapsed === 180) {
          setShowWarning(true);
        }

        // 5分経過でタイムアウト
        if (newElapsed >= 300) {
          setShowTimeout(true);
          onTimeout?.();
          clearInterval(timer);
          return newElapsed;
        }

        // 進捗とステップを動的更新
        updateProgressAndSteps(newElapsed);

        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  // 進捗とステップの動的更新
  const updateProgressAndSteps = (elapsed: number) => {
    let newProgress = 65;
    let newRemaining = 30;

    if (elapsed < 60) {
      // 1分未満: 65-80%
      newProgress = 65 + (elapsed / 60) * 15;
      newRemaining = 60 - elapsed;
    } else if (elapsed < 120) {
      // 1-2分: 80-95%
      newProgress = 80 + ((elapsed - 60) / 60) * 15;
      newRemaining = 120 - elapsed;

      // ステップ更新
      setSteps(prev => prev.map(step => {
        if (step.id === 'optimization') return { ...step, status: 'completed' };
        if (step.id === 'generation') return { ...step, status: 'active' };
        return step;
      }));
    } else {
      // 2分以降: 95-100%
      newProgress = 95 + ((elapsed - 120) / 60) * 5;
      newRemaining = Math.max(0, 180 - elapsed);

      // 最終ステップ
      setSteps(prev => prev.map(step => {
        if (step.id === 'generation') return { ...step, status: 'completed' };
        if (step.id === 'verification') return { ...step, status: 'active' };
        return step;
      }));
    }

    setProgress(Math.min(100, newProgress));
    setEstimatedRemaining(Math.max(0, newRemaining));

    // 完了シミュレーション（実際は医療システムからの通知で制御）
    if (elapsed >= 90 && Math.random() > 0.98) { // 1.5分後からランダムで完了
      onComplete?.();
    }
  };

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">処理タイムアウト</h2>
            <p className="text-gray-600 mb-6">
              AI最適化処理が予想以上に時間がかかっています。
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                再試行
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                即時予約に切り替え
              </button>
            </div>

            <div className="text-sm text-gray-500">
              <p>お急ぎの場合: <a href="tel:1234" className="text-blue-600">内線1234</a></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Brain className="w-16 h-16 text-indigo-600 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">AI最適化処理中...</h2>
          <p className="text-gray-600">あなたに最適な担当者・日程を提案します</p>
        </div>

        {/* 進捗バー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">処理進捗</span>
            <span className="text-sm font-medium text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 処理ステップ */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">処理状況</h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'active'
                    ? 'bg-indigo-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                <span className={`
                  flex-1 text-sm font-medium
                  ${step.status === 'completed'
                    ? 'text-green-700'
                    : step.status === 'active'
                    ? 'text-indigo-700'
                    : 'text-gray-500'
                  }
                `}>
                  {step.label}
                </span>
                {step.status === 'active' && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 時間表示 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{formatTime(elapsedTime)}</div>
            <div className="text-sm text-gray-600">経過時間</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-800">約{estimatedRemaining}秒</div>
            <div className="text-sm text-indigo-600">残り時間</div>
          </div>
        </div>

        {/* 警告表示 */}
        {showWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-medium">処理時間延長</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  処理時間が通常より長くかかっています。もうしばらくお待ちください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 緊急連絡先 */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Phone className="w-5 h-5 text-blue-600 mx-auto mb-2" />
          <p className="text-blue-800 text-sm">
            緊急の場合: <a href="tel:1234" className="font-medium hover:underline">内線1234</a>
          </p>
        </div>

        {/* デバッグ情報（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            Request ID: {requestId} | Elapsed: {elapsedTime}s | Progress: {Math.round(progress)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProcessingScreen;