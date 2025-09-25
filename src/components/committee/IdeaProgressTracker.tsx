import React from 'react';
import { CheckCircle, Circle, Clock, ArrowRight, MapPin } from 'lucide-react';
import { IdeaProgress, AgendaLevel } from '../../types/committee';

interface IdeaProgressTrackerProps {
  progress: IdeaProgress;
}

export const IdeaProgressTracker: React.FC<IdeaProgressTrackerProps> = ({ progress }) => {
  // 議題レベルのマッピング
  const levelSteps: { level: AgendaLevel; label: string; scoreRange: string; icon: string }[] = [
    { level: 'PENDING', label: '検討中', scoreRange: '0-29', icon: '💭' },
    { level: 'DEPT_REVIEW', label: '部署検討', scoreRange: '30-49', icon: '📋' },
    { level: 'DEPT_AGENDA', label: '部署議題', scoreRange: '50-99', icon: '👥' },
    { level: 'FACILITY_AGENDA', label: '施設議題', scoreRange: '100-299', icon: '🏥' },
    { level: 'CORP_REVIEW', label: '法人検討', scoreRange: '300-599', icon: '🏢' },
    { level: 'CORP_AGENDA', label: '法人議題', scoreRange: '600+', icon: '🏛️' },
  ];

  // 現在のレベルインデックスを取得
  const currentLevelIndex = levelSteps.findIndex(step => step.level === progress.currentLevel);

  // プロセスステップ（委員会提出後）
  const processSteps = [
    { key: 'posted', label: '投稿', completed: true },
    { key: 'dept_review', label: '部署検討', completed: currentLevelIndex >= 1 },
    { key: 'facility_agenda', label: '施設議題', completed: currentLevelIndex >= 3 },
    { key: 'committee', label: '委員会提出', completed: progress.committeeInfo !== undefined },
    { key: 'reviewing', label: '審議中', completed: progress.currentStatus === 'committee_reviewing' },
    { key: 'decided', label: '実施決定', completed: progress.currentStatus === 'implementation_decided' }
  ];

  // 経過日数の計算
  const startDate = progress.statusHistory[0]?.timestamp || new Date();
  const daysPassed = Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          改善提案の旅
        </h3>

        {/* 現在のスコアと支持率 */}
        <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
          <div>
            <span className="font-medium">現在スコア：</span>
            <span className="text-lg font-bold text-blue-600 ml-1">{progress.currentScore}点</span>
          </div>
          <div>
            <span className="font-medium">支持率：</span>
            <span className="text-lg font-bold text-green-600 ml-1">{progress.supportRate}%</span>
            <span className="text-gray-500 ml-1">（{progress.totalVotes}票）</span>
          </div>
          <div>
            <span className="font-medium">経過日数：</span>
            <span className="font-bold ml-1">{daysPassed}日</span>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${step.completed
                    ? 'bg-green-500 text-white'
                    : index === processSteps.findIndex(s => !s.completed)
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <span className={`
                  text-xs mt-1 font-medium
                  ${step.completed ? 'text-gray-700' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
              </div>
              {index < processSteps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-2
                  ${step.completed ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 現在地インジケーター */}
        <div className="mt-4 text-center">
          {processSteps.find(s => !s.completed) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                現在：{processSteps.find(s => !s.completed)?.label}
              </span>
            </div>
          )}
          {processSteps.every(s => s.completed) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">完了</span>
            </div>
          )}
        </div>
      </div>

      {/* 議題レベル表示 */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">議題提出レベル</h4>
        <div className="flex items-center gap-2 flex-wrap">
          {levelSteps.map((step, index) => (
            <div
              key={step.level}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                ${index <= currentLevelIndex
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-400 border border-gray-200'
                }
              `}
            >
              <span className="text-lg">{step.icon}</span>
              <span>{step.label}</span>
              <span className="text-xs opacity-75">({step.scoreRange}点)</span>
            </div>
          ))}
        </div>

        {/* 次のレベルまでの情報 */}
        {currentLevelIndex < levelSteps.length - 1 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <ArrowRight className="w-4 h-4" />
              <span>
                次の「{levelSteps[currentLevelIndex + 1].label}」まで
                あと
                <span className="font-bold mx-1">
                  {parseInt(levelSteps[currentLevelIndex + 1].scoreRange.split('-')[0]) - progress.currentScore}
                </span>
                点
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 委員会情報 */}
      {progress.committeeInfo && (
        <div className="border-t mt-4 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">委員会提出情報</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>
              <span className="font-medium">提出先：</span>
              <span className="ml-1">{progress.committeeInfo.committees.join('、')}</span>
            </div>
            <div>
              <span className="font-medium">提出日：</span>
              <span className="ml-1">
                {new Date(progress.committeeInfo.submissionDate).toLocaleDateString('ja-JP')}
              </span>
            </div>
            {progress.committeeDecision && (
              <div className="mt-2 p-2 bg-green-50 rounded">
                <span className="font-medium text-green-700">
                  決定事項：{progress.committeeDecision.nextAction}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaProgressTracker;