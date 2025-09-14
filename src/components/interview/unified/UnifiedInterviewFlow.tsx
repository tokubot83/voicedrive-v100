import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import {
  UnifiedInterviewFlowState,
  InterviewClassification,
  InterviewPreferences
} from '../../../types/unifiedInterview';
import InterviewClassificationStep from './steps/InterviewClassificationStep';
import InterviewTypeStep from './steps/InterviewTypeStep';
import InterviewConfirmStep from './steps/InterviewConfirmStep';
import InterviewCompleteStep from './steps/InterviewCompleteStep';
import UnifiedProgressIndicator from './UnifiedProgressIndicator';

interface UnifiedInterviewFlowProps {
  onComplete?: (state: UnifiedInterviewFlowState) => void;
  employeeId?: string;
}

const UnifiedInterviewFlow: React.FC<UnifiedInterviewFlowProps> = ({
  onComplete,
  employeeId
}) => {
  const [flowState, setFlowState] = useState<UnifiedInterviewFlowState>({
    currentStep: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ステップタイトルの取得
  const getStepTitle = () => {
    switch (flowState.currentStep) {
      case 1:
        return '面談分類を選択';
      case 2:
        return '面談種別を選択';
      case 3:
        return '申込内容の確認';
      default:
        return '';
    }
  };

  // 次のステップへ進む
  const handleNext = () => {
    if (flowState.currentStep === 1 && flowState.classification) {
      setFlowState({ ...flowState, currentStep: 2 });
    } else if (flowState.currentStep === 2 && flowState.type) {
      setFlowState({ ...flowState, currentStep: 3 });
    }
  };

  // 前のステップへ戻る
  const handleBack = () => {
    if (flowState.currentStep === 2) {
      setFlowState({
        ...flowState,
        currentStep: 1,
        type: undefined,
        category: undefined
      });
    } else if (flowState.currentStep === 3) {
      setFlowState({
        ...flowState,
        currentStep: 2,
        preferences: undefined
      });
    }
  };

  // 申込を送信
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // APIコール（仮実装）
      const response = await fetch('/api/v1/interviews/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId,
          classification: flowState.classification,
          type: flowState.type,
          category: flowState.category,
          preferences: flowState.preferences
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFlowState({
          ...flowState,
          requestId: data.data.requestId,
          currentStep: 5 as any // 完了画面
        });

        if (onComplete) {
          onComplete(flowState);
        }
      }
    } catch (error) {
      console.error('申込エラー:', error);
      alert('申込処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 完了画面の場合
  if ((flowState.currentStep as any) === 5) {
    return <InterviewCompleteStep requestId={flowState.requestId} />;
  }

  // 次へボタンの有効/無効判定
  const isNextDisabled = () => {
    switch (flowState.currentStep) {
      case 1:
        return !flowState.classification;
      case 2:
        return !flowState.type || (flowState.classification === 'support' && !flowState.category);
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">面談予約</h1>
            <div className="text-xs sm:text-sm text-gray-500">VoiceDrive</div>
          </div>
        </div>
      </div>

      {/* 進捗インジケーター */}
      <div className="bg-white border-b border-gray-100 progress-mobile">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6">
          <UnifiedProgressIndicator
            currentStep={flowState.currentStep}
            totalSteps={3}
          />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto mobile-scroll-container">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 content-mobile">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            {getStepTitle()}
          </h2>

          {/* 各ステップのコンポーネント */}
          {flowState.currentStep === 1 && (
            <InterviewClassificationStep
              selected={flowState.classification}
              onSelect={(value) => setFlowState({ ...flowState, classification: value })}
            />
          )}

          {flowState.currentStep === 2 && (
            <InterviewTypeStep
              classification={flowState.classification!}
              selected={flowState.type}
              selectedCategory={flowState.category}
              onSelect={(type, category) => setFlowState({ ...flowState, type, category })}
            />
          )}

          {flowState.currentStep === 3 && (
            <InterviewConfirmStep
              flowState={flowState}
              onEdit={(step) => setFlowState({ ...flowState, currentStep: step })}
            />
          )}
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 nav-buttons-mobile">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex justify-between items-center gap-3">
            {flowState.currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-4 sm:px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors nav-button-mobile haptic-feedback"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">戻る</span>
              </button>
            ) : (
              <div />
            )}

            {flowState.currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all nav-button-mobile haptic-feedback ${
                  isNextDisabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <span className="text-sm sm:text-base">次へ</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all nav-button-mobile haptic-feedback ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <span className="text-sm sm:text-base">
                  {isSubmitting ? '送信中...' : '申込を確定'}
                </span>
                {!isSubmitting && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedInterviewFlow;