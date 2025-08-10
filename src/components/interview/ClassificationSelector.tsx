import React from 'react';
import { INTERVIEW_CLASSIFICATIONS } from '../../utils/interviewMappingUtils';
import { Calendar, AlertCircle, HeartHandshake } from 'lucide-react';

interface ClassificationSelectorProps {
  onSelect: (classification: 'regular' | 'special' | 'support') => void;
  selectedClassification?: 'regular' | 'special' | 'support';
}

const ClassificationSelector: React.FC<ClassificationSelectorProps> = ({
  onSelect,
  selectedClassification
}) => {
  const classificationIcons = {
    regular: <Calendar className="w-12 h-12" />,
    special: <AlertCircle className="w-12 h-12" />,
    support: <HeartHandshake className="w-12 h-12" />
  };

  const classificationColors = {
    regular: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      hover: 'hover:border-green-400',
      selected: 'border-green-500 bg-green-100',
      icon: 'text-green-500'
    },
    special: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      hover: 'hover:border-orange-400',
      selected: 'border-orange-500 bg-orange-100',
      icon: 'text-orange-500'
    },
    support: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:border-blue-400',
      selected: 'border-blue-500 bg-blue-100',
      icon: 'text-blue-500'
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          面談分類を選択してください
        </h2>
        <p className="text-gray-600">
          実施したい面談の種類に応じて、適切な分類を選択してください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INTERVIEW_CLASSIFICATIONS.map((classification) => {
          const colors = classificationColors[classification.id as keyof typeof classificationColors];
          const isSelected = selectedClassification === classification.id;
          
          return (
            <button
              key={classification.id}
              onClick={() => onSelect(classification.id as 'regular' | 'special' | 'support')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:-translate-y-1 ${
                isSelected
                  ? colors.selected
                  : `${colors.bg} ${colors.border} ${colors.hover}`
              }`}
            >
              {/* アイコン */}
              <div className={`${colors.icon} mb-4`}>
                {classificationIcons[classification.id as keyof typeof classificationIcons]}
              </div>

              {/* タイトル */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {classification.name}
              </h3>

              {/* 説明 */}
              <p className="text-sm text-gray-600 mb-4">
                {classification.description}
              </p>

              {/* 含まれる面談種別 */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  含まれる面談種別:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {classification.types.slice(0, 3).map((type, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{getShortTypeName(type)}</span>
                    </li>
                  ))}
                  {classification.types.length > 3 && (
                    <li className="text-xs text-gray-500 italic">
                      他 {classification.types.length - 3} 種類
                    </li>
                  )}
                </ul>
              </div>

              {/* 選択状態インジケーター */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ヘルプテキスト */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">💡 ヒント:</span> 不明な場合は「サポート面談」を選択してください。
          面談の中で適切な分類に変更することも可能です。
        </p>
      </div>
    </div>
  );
};

// 面談種別の短縮名を取得
const getShortTypeName = (type: string): string => {
  const shortNames: Record<string, string> = {
    new_employee_monthly: '新入職員月次',
    regular_annual: '年次面談',
    management_biannual: '管理職半年',
    return_to_work: '復職面談',
    incident_followup: 'インシデント後',
    exit_interview: '退職面談',
    feedback: 'フィードバック',
    career_support: 'キャリア支援',
    workplace_support: '職場環境',
    individual_consultation: '個別相談'
  };
  return shortNames[type] || type;
};

export default ClassificationSelector;