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
  currentStep: 1 | 2 | 3 | 4 | 5;
  selectedClassification?: 'regular' | 'special' | 'support';
  selectedType?: InterviewType;
  selectedCategory?: InterviewCategory;
  bookingMode?: 'instant' | 'assisted'; // 予約方式の追加
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
        bookingMode: undefined
      });
    } else if (flowState.currentStep === 5) {
      setFlowState({
        ...flowState,
        currentStep: 4,
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

            {/* Step 4: 予約方式選択 */}
            {flowState.currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  予約方式を選択してください
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => {
                      setFlowState({
                        ...flowState,
                        bookingMode: 'instant',
                        currentStep: 5
                      });
                    }}
                    className="p-6 rounded-lg border-2 transition-all hover:shadow-lg border-gray-200 hover:border-green-300"
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-4">⚡</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">即時予約</h3>
                      <p className="text-gray-600 text-sm">空いている時間からすぐに予約確定</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center text-green-600 text-sm">
                          <span className="mr-1">✓</span>
                          すぐに完了
                        </div>
                        <div className="flex items-center justify-center text-green-600 text-sm">
                          <span className="mr-1">✓</span>
                          シンプルな手続き
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFlowState({
                        ...flowState,
                        bookingMode: 'assisted',
                        currentStep: 5
                      });
                    }}
                    className="p-6 rounded-lg border-2 transition-all hover:shadow-lg border-gray-200 hover:border-purple-300 relative"
                  >
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                        おすすめ
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl mb-4">🎯</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">おまかせ予約</h3>
                      <p className="text-gray-600 text-sm">あなたの希望をお聞きして人事部が最適な候補を提案</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center text-purple-600 text-sm">
                          <span className="mr-1">⭐</span>
                          より良いマッチング
                        </div>
                        <div className="flex items-center justify-center text-purple-600 text-sm">
                          <span className="mr-1">⭐</span>
                          詳細な希望を考慮
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: 日時・担当者選択（即時予約）または詳細要望入力（おまかせ予約） */}
            {flowState.currentStep === 5 && (
              <div className="space-y-6">
                {flowState.bookingMode === 'instant' ? (
                  // 即時予約: カレンダーと担当者選択
                  <>
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
                  </>
                ) : (
                  // おまかせ予約: 詳細要望フォーム
                  <>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      詳細な希望をお聞かせください
                    </h2>
                    <div className="space-y-4">
                      {/* 希望時期 */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">希望時期</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { value: 'urgent', label: '緊急', icon: '🚨' },
                            { value: 'this_week', label: '今週中', icon: '📅' },
                            { value: 'next_week', label: '来週', icon: '📆' },
                            { value: 'this_month', label: '今月中', icon: '🗓️' }
                          ].map(option => (
                            <button
                              key={option.value}
                              className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all"
                            >
                              <div className="text-2xl mb-1">{option.icon}</div>
                              <div className="text-sm font-medium">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 時間帯希望 */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">希望時間帯</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { value: 'morning', label: '午前', time: '9:00-12:00' },
                            { value: 'afternoon', label: '午後', time: '13:00-17:00' },
                            { value: 'evening', label: '夕方', time: '17:30-19:00' },
                            { value: 'anytime', label: 'いつでも', time: '' }
                          ].map(option => (
                            <button
                              key={option.value}
                              className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all"
                            >
                              <div className="text-sm font-medium">{option.label}</div>
                              {option.time && (
                                <div className="text-xs text-gray-500 mt-1">{option.time}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 担当者希望 */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">担当者の希望</h3>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input type="radio" name="interviewer" className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">誰でも良い</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input type="radio" name="interviewer" className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">同性の担当者を希望</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input type="radio" name="interviewer" className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">特定の担当者を希望</span>
                          </label>
                        </div>
                      </div>

                      {/* その他の要望 */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">その他の要望</h3>
                        <textarea
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          rows={4}
                          placeholder="面談に関する特別な要望があればお書きください..."
                        />
                      </div>
                    </div>
                  </>
                )}
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

            {flowState.currentStep === 5 && (
              <button
                onClick={() => {
                  if (flowState.bookingMode === 'instant') {
                    // 即時予約の確定
                    handleDateTimeSelect(new Date(), 'STAFF001');
                  } else {
                    // おまかせ予約の申込
                    console.log('おまかせ予約申込');
                    alert('おまかせ予約の申込を受け付けました。人事部にて調整後、ご連絡いたします。');
                  }
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-white transition-all ${
                  flowState.bookingMode === 'instant'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                <span>
                  {flowState.bookingMode === 'instant' ? '予約を確定' : '申込を送信'}
                </span>
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