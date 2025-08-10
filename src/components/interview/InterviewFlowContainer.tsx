import React, { useState } from 'react';
import { InterviewType, InterviewCategory } from '../../types/interview';
import ClassificationSelector from './ClassificationSelector';
import ProgressIndicator from './ProgressIndicator';
import SelectionSummary from './SelectionSummary';
import { 
  INTERVIEW_CLASSIFICATIONS,
  getInterviewTypeDisplayName,
  shouldShowCategorySelection 
} from '../../utils/interviewMappingUtils';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';

export interface InterviewFlowState {
  currentStep: 1 | 2 | 3 | 4;
  selectedClassification?: 'regular' | 'special' | 'support';
  selectedType?: InterviewType;
  selectedCategory?: InterviewCategory;
  selectedDateTime?: Date;
  selectedStaff?: string;
}

interface InterviewFlowContainerProps {
  onComplete: (state: InterviewFlowState) => void;
  employeeId?: string;
}

const InterviewFlowContainer: React.FC<InterviewFlowContainerProps> = ({ 
  onComplete,
  employeeId 
}) => {
  const [flowState, setFlowState] = useState<InterviewFlowState>({
    currentStep: 1
  });

  const handleClassificationSelect = (classification: 'regular' | 'special' | 'support') => {
    setFlowState({
      ...flowState,
      selectedClassification: classification,
      currentStep: 2,
      selectedType: undefined,
      selectedCategory: undefined
    });
  };

  const handleTypeSelect = (type: InterviewType) => {
    const needsCategory = shouldShowCategorySelection(type);
    setFlowState({
      ...flowState,
      selectedType: type,
      currentStep: needsCategory ? 3 : 4,
      selectedCategory: undefined
    });
  };

  const handleCategorySelect = (category: InterviewCategory) => {
    setFlowState({
      ...flowState,
      selectedCategory: category,
      currentStep: 4
    });
  };

  const handleDateTimeSelect = (dateTime: Date, staff: string) => {
    const newState = {
      ...flowState,
      selectedDateTime: dateTime,
      selectedStaff: staff
    };
    setFlowState(newState);
    onComplete(newState);
  };

  const handleBack = () => {
    if (flowState.currentStep === 2) {
      setFlowState({
        ...flowState,
        currentStep: 1,
        selectedClassification: undefined,
        selectedType: undefined
      });
    } else if (flowState.currentStep === 3) {
      setFlowState({
        ...flowState,
        currentStep: 2,
        selectedCategory: undefined
      });
    } else if (flowState.currentStep === 4) {
      const needsCategory = flowState.selectedType && shouldShowCategorySelection(flowState.selectedType);
      setFlowState({
        ...flowState,
        currentStep: needsCategory ? 3 : 2,
        selectedDateTime: undefined,
        selectedStaff: undefined
      });
    }
  };

  const getAvailableTypes = () => {
    if (!flowState.selectedClassification) return [];
    const classification = INTERVIEW_CLASSIFICATIONS.find(c => c.id === flowState.selectedClassification);
    return classification?.types || [];
  };

  const categoryOptions: Record<InterviewCategory, string> = {
    career_path: 'キャリアパス',
    skill_development: 'スキル開発',
    work_environment: '職場環境',
    workload_balance: '業務量調整',
    interpersonal: '人間関係',
    performance: '業績改善',
    compensation: '待遇・処遇',
    training: '研修・教育',
    promotion: '昇進・昇格',
    transfer: '異動希望',
    health_safety: '健康・安全',
    other: 'その他'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">面談予約システム</h1>
            <p className="text-gray-600">以下のステップに従って面談の予約を行ってください</p>
          </div>

          {/* プログレスインジケーター */}
          <ProgressIndicator currentStep={flowState.currentStep} />

          {/* ステップコンテンツ */}
          <div className="mt-8 min-h-[400px]">
            {/* Step 1: 面談分類選択 */}
            {flowState.currentStep === 1 && (
              <div role="region" aria-label="面談分類選択">
                <ClassificationSelector 
                  onSelect={handleClassificationSelect}
                  selectedClassification={flowState.selectedClassification}
                />
              </div>
            )}

            {/* Step 2: 面談種別選択 */}
            {flowState.currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  面談種別を選択してください
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAvailableTypes().map((type) => {
                    const typeInfo = interviewTypeInfo[type];
                    return (
                      <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                          flowState.selectedType === type
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <span className="text-3xl">{typeInfo?.icon}</span>
                          <div className="text-left flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {getInterviewTypeDisplayName(type)}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {typeInfo?.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: カテゴリ選択 */}
            {flowState.currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  相談カテゴリを選択してください
                </h2>
                <p className="text-gray-600 mb-6">
                  面談で話したい内容に最も近いカテゴリを選択してください
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(categoryOptions).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleCategorySelect(key as InterviewCategory)}
                      aria-label={`${label}を選択`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCategorySelect(key as InterviewCategory);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        flowState.selectedCategory === key
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: 日時・担当者選択 */}
            {flowState.currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  日時と担当者を選択してください
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <Calendar className="w-16 h-16 text-indigo-500 mx-auto mb-2" />
                      <p className="text-gray-600">カレンダーから日時を選択</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-16 h-16 text-indigo-500 mx-auto mb-2" />
                      <p className="text-gray-600">担当者を選択</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    ※ この機能は現在開発中です。既存のカレンダーコンポーネントと統合予定です。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ナビゲーションボタン */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={flowState.currentStep === 1}
              aria-label="前のステップに戻る"
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                flowState.currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>戻る</span>
            </button>

            {flowState.currentStep === 4 && (
              <button
                onClick={() => handleDateTimeSelect(new Date(), 'STAFF001')}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                <span>予約を確定</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 選択内容サマリー */}
          <SelectionSummary flowState={flowState} />
        </div>
      </div>
    </div>
  );
};

// 面談タイプ情報
const interviewTypeInfo: Record<InterviewType, { icon: string; description: string }> = {
  new_employee_monthly: { icon: '🩺', description: '新入職員の月次フォローアップ面談' },
  regular_annual: { icon: '📅', description: '年1回の定期面談' },
  management_biannual: { icon: '👔', description: '管理職・リーダー向け半年面談' },
  return_to_work: { icon: '🔄', description: '長期休暇からの復職時面談' },
  incident_followup: { icon: '⚠️', description: '医療事故・インシデント後のフォローアップ' },
  exit_interview: { icon: '👋', description: '退職時の最終面談' },
  feedback: { icon: '📊', description: '人事評価後のフィードバック' },
  career_support: { icon: '🎯', description: 'キャリア形成・スキル開発相談' },
  workplace_support: { icon: '🧘', description: '職場環境・人間関係の相談' },
  individual_consultation: { icon: '💬', description: 'その他の個別相談' },
  // 旧体系との互換性保持
  performance_review: { icon: '📊', description: '人事評価後のフィードバック' },
  career_development: { icon: '🎯', description: 'キャリア形成・スキル開発相談' },
  workplace_issue: { icon: '🧘', description: '職場環境・人間関係の相談' },
  return_support: { icon: '🔄', description: '長期休暇からの復職時面談' },
  new_hire_followup: { icon: '🩺', description: '新入職員の月次フォローアップ面談' },
  regular_checkup: { icon: '📅', description: '年1回の定期面談' },
  exit_consultation: { icon: '👋', description: '退職時の最終面談' }
};

export default InterviewFlowContainer;