import React from 'react';

interface UnifiedProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const UnifiedProgressIndicator: React.FC<UnifiedProgressIndicatorProps> = ({
  currentStep,
  totalSteps
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <React.Fragment key={stepNumber}>
                {/* ステップ円 */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white scale-110'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>

                {/* 接続線 */}
                {stepNumber < totalSteps && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 transition-all duration-300
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ステップ表示 */}
      <div className="ml-4 text-sm text-gray-600">
        Step {currentStep}/{totalSteps}
      </div>
    </div>
  );
};

export default UnifiedProgressIndicator;