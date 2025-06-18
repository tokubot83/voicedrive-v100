import React from 'react';
import { RetirementProcessState, RETIREMENT_STEP_TITLES, RETIREMENT_STEP_DESCRIPTIONS, RETIREMENT_STEP_ICONS } from '../../types/retirementFlow';

interface RetirementProgressIndicatorProps {
  processState: RetirementProcessState;
  compact?: boolean;
}

const RetirementProgressIndicator: React.FC<RetirementProgressIndicatorProps> = ({
  processState,
  compact = false
}) => {
  const getStepStatusColor = (stepNum: number) => {
    const step = processState.steps[stepNum];
    const isActive = processState.currentStep === stepNum;
    
    switch (step?.status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'pending':
        return isActive 
          ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
          : 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'blocked':
      default:
        return 'text-gray-600 bg-gray-800/20 border-gray-700/30';
    }
  };

  const getStepStatusIcon = (stepNum: number) => {
    const step = processState.steps[stepNum];
    
    switch (step?.status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '🔄';
      case 'error':
        return '❌';
      case 'pending':
        return processState.currentStep === stepNum ? '⏳' : '⏸️';
      case 'blocked':
      default:
        return '🔒';
    }
  };

  const getStepStatusText = (stepNum: number) => {
    const step = processState.steps[stepNum];
    const isActive = processState.currentStep === stepNum;
    
    switch (step?.status) {
      case 'completed':
        return `完了 (${step.completedAt?.toLocaleDateString()})`;
      case 'in_progress':
        return '進行中';
      case 'error':
        return 'エラー';
      case 'pending':
        return isActive ? '実行可能' : '待機中';
      case 'blocked':
      default:
        return '前ステップ完了待ち';
    }
  };

  const calculateProgress = () => {
    const completedSteps = Object.values(processState.steps).filter(step => step.status === 'completed').length;
    return (completedSteps / 4) * 100;
  };

  if (compact) {
    return (
      <div className="bg-gray-900/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">進行状況</span>
          <span className="text-sm text-gray-400">{Math.round(calculateProgress())}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-8 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(stepNum => (
            <div
              key={stepNum}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold ${getStepStatusColor(stepNum)}`}
            >
              {stepNum}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">退職処理進行状況</h3>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>対象: {processState.employeeName}</span>
          <span>開始: {processState.startedAt.toLocaleDateString()}</span>
          <span>プロセスID: {processState.processId}</span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">全体進捗</span>
          <span className="text-sm text-gray-400">{Math.round(calculateProgress())}% 完了</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full transition-all duration-500 relative"
            style={{ width: `${calculateProgress()}%` }}
          >
            <div className="absolute right-0 top-0 w-8 h-8 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* ステップ詳細 */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map(stepNum => {
          const step = processState.steps[stepNum];
          const isActive = processState.currentStep === stepNum;
          const isCompleted = step?.status === 'completed';
          const isBlocked = step?.status === 'blocked';
          const isError = step?.status === 'error';
          
          return (
            <div
              key={stepNum}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : isCompleted 
                    ? 'bg-green-500/10 border-green-500/30'
                    : isError
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-800/30 border-gray-700/30'
              }`}
            >
              {/* ステップ番号とアイコン */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${getStepStatusColor(stepNum)}`}>
                  {stepNum}
                </div>
                <div className="text-2xl">
                  {RETIREMENT_STEP_ICONS[stepNum as keyof typeof RETIREMENT_STEP_ICONS]}
                </div>
              </div>

              {/* ステップ情報 */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white">
                    {RETIREMENT_STEP_TITLES[stepNum as keyof typeof RETIREMENT_STEP_TITLES]}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getStepStatusIcon(stepNum)}
                    </span>
                    <span className={`text-sm font-medium ${
                      isCompleted ? 'text-green-400' : 
                      isActive ? 'text-blue-400' : 
                      isError ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {getStepStatusText(stepNum)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">
                  {RETIREMENT_STEP_DESCRIPTIONS[stepNum as keyof typeof RETIREMENT_STEP_DESCRIPTIONS]}
                </p>

                {/* 完了情報 */}
                {step?.completedAt && step?.completedBy && (
                  <div className="text-xs text-gray-500">
                    完了者: {step.completedBy} | 完了日時: {step.completedAt.toLocaleString()}
                  </div>
                )}

                {/* エラー情報 */}
                {step?.errors && step.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="text-red-400 text-sm font-medium mb-1">エラー:</div>
                    {step.errors.map((error, index) => (
                      <div key={index} className="text-red-300 text-xs">• {error}</div>
                    ))}
                  </div>
                )}

                {/* 警告情報 */}
                {step?.warnings && step.warnings.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="text-yellow-400 text-sm font-medium mb-1">警告:</div>
                    {step.warnings.map((warning, index) => (
                      <div key={index} className="text-yellow-300 text-xs">• {warning}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 完了情報 */}
      {processState.completedAt && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <span className="text-xl">🎉</span>
            <span>退職処理完了</span>
          </div>
          <div className="text-sm text-gray-300">
            完了日時: {processState.completedAt.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetirementProgressIndicator;