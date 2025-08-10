import React from 'react';
import { InterviewFlowState } from './InterviewFlowContainer';
import { 
  getInterviewTypeDisplayName,
  INTERVIEW_CLASSIFICATIONS 
} from '../../utils/interviewMappingUtils';
import { Clock, User, Tag, FileText } from 'lucide-react';

interface SelectionSummaryProps {
  flowState: InterviewFlowState;
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({ flowState }) => {
  const getClassificationName = () => {
    if (!flowState.selectedClassification) return null;
    const classification = INTERVIEW_CLASSIFICATIONS.find(
      c => c.id === flowState.selectedClassification
    );
    return classification?.name;
  };

  const getCategoryName = () => {
    if (!flowState.selectedCategory) return null;
    const categoryNames: Record<string, string> = {
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
    return categoryNames[flowState.selectedCategory];
  };

  const hasSelections = flowState.selectedClassification || 
                        flowState.selectedType || 
                        flowState.selectedCategory || 
                        flowState.selectedDateTime;

  if (!hasSelections) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
        選択内容のサマリー
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 面談分類 */}
        {flowState.selectedClassification && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">面談分類</p>
              <p className="font-medium text-gray-800">{getClassificationName()}</p>
            </div>
          </div>
        )}

        {/* 面談種別 */}
        {flowState.selectedType && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">面談種別</p>
              <p className="font-medium text-gray-800">
                {getInterviewTypeDisplayName(flowState.selectedType)}
              </p>
            </div>
          </div>
        )}

        {/* カテゴリ */}
        {flowState.selectedCategory && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">相談カテゴリ</p>
              <p className="font-medium text-gray-800">{getCategoryName()}</p>
            </div>
          </div>
        )}

        {/* 日時 */}
        {flowState.selectedDateTime && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">予約日時</p>
              <p className="font-medium text-gray-800">
                {flowState.selectedDateTime.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}

        {/* 担当者 */}
        {flowState.selectedStaff && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">担当者</p>
              <p className="font-medium text-gray-800">{flowState.selectedStaff}</p>
            </div>
          </div>
        )}
      </div>

      {/* ステータスメッセージ */}
      {flowState.currentStep < 4 && (
        <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
          <p className="text-sm text-gray-600">
            {flowState.currentStep === 1 && '面談分類を選択してください'}
            {flowState.currentStep === 2 && '面談種別を選択してください'}
            {flowState.currentStep === 3 && '相談したい内容のカテゴリを選択してください'}
          </p>
        </div>
      )}

      {/* 完了メッセージ */}
      {flowState.currentStep === 4 && flowState.selectedDateTime && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
          <p className="text-sm text-green-800 font-medium">
            ✅ すべての項目が選択されました。「予約を確定」ボタンをクリックしてください。
          </p>
        </div>
      )}
    </div>
  );
};

export default SelectionSummary;