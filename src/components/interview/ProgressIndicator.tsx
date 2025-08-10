import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: '面談分類', description: '大まかな分類を選択' },
    { number: 2, label: '面談種別', description: '具体的な種別を選択' },
    { number: 3, label: 'カテゴリ', description: '相談内容を選択' },
    { number: 4, label: '日時・担当者', description: '予約情報を入力' }
  ];

  return (
    <div className="w-full">
      {/* デスクトップビュー */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center relative">
                {/* ステップサークル */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                    transition-all duration-300 relative z-10
                    ${
                      step.number < currentStep
                        ? 'bg-green-500 shadow-lg'
                        : step.number === currentStep
                        ? 'bg-indigo-600 shadow-xl ring-4 ring-indigo-200'
                        : 'bg-gray-300'
                    }
                  `}
                >
                  {step.number < currentStep ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* ラベルと説明 */}
                <div className="mt-3 text-center">
                  <p
                    className={`font-semibold text-sm ${
                      step.number <= currentStep ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      step.number <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* パルスアニメーション（現在のステップ） */}
                {step.number === currentStep && (
                  <div className="absolute top-0 w-12 h-12 rounded-full bg-indigo-400 animate-ping opacity-20"></div>
                )}
              </div>

              {/* コネクティングライン */}
              {index < steps.length - 1 && (
                <div className="flex-1 relative top-[-28px]">
                  <div className="h-1 bg-gray-200 mx-4">
                    <div
                      className={`h-full bg-gradient-to-r from-green-500 to-indigo-600 transition-all duration-500`}
                      style={{
                        width: step.number < currentStep ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* モバイルビュー */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                ${
                  step.number < currentStep
                    ? 'bg-green-500'
                    : step.number === currentStep
                    ? 'bg-indigo-600'
                    : 'bg-gray-300'
                }
              `}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
          ))}
        </div>
        
        {/* プログレスバー */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
        </div>

        {/* 現在のステップ情報 */}
        <div className="mt-4 text-center">
          <p className="font-semibold text-gray-800">
            Step {currentStep}: {steps[currentStep - 1].label}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;