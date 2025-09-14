import React from 'react';
import { InterviewClassification, REGULAR_TYPES, SPECIAL_TYPES } from '../../../../types/unifiedInterview';
import { User, Users, Briefcase, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

interface InterviewTypeStepProps {
  classification: InterviewClassification;
  selected?: string;
  onSelect: (value: string) => void;
}

const InterviewTypeStep: React.FC<InterviewTypeStepProps> = ({
  classification,
  selected,
  onSelect
}) => {
  // 分類に応じた選択肢を取得
  const getTypeOptions = () => {
    if (classification === 'regular') {
      return REGULAR_TYPES.map(type => ({
        ...type,
        color: 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
      }));
    } else if (classification === 'special') {
      return SPECIAL_TYPES.map(type => ({
        ...type,
        color: 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
      }));
    } else {
      // サポート面談の場合は、次のステップでカテゴリを選択するので、ここでは大分類のみ
      return [
        {
          id: 'career',
          label: 'キャリア系面談',
          description: 'キャリアパス・スキル開発・昇進昇格',
          icon: '🎯',
          color: 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
        },
        {
          id: 'workplace',
          label: '職場環境系面談',
          description: '職場環境・人間関係・業務負荷など',
          icon: '🏢',
          color: 'border-green-300 hover:border-green-500 hover:bg-green-50'
        },
        {
          id: 'consultation',
          label: '個別相談面談',
          description: 'パフォーマンス・研修・コンプライアンス',
          icon: '💼',
          color: 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50'
        }
      ];
    }
  };

  const typeOptions = getTypeOptions();

  const getTitle = () => {
    switch (classification) {
      case 'regular':
        return '定期面談';
      case 'support':
        return 'サポート面談';
      case 'special':
        return '特別面談';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700">{getTitle()}</h3>
        <p className="text-gray-600 mt-1">該当する種別を選択してください</p>
      </div>

      {/* モバイル用：縦並び */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {typeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              p-5 rounded-lg border-2 transition-all text-left
              ${selected === option.id ? 'ring-2 ring-indigo-500' : ''}
              ${option.color}
            `}
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {option.label}
                </h4>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* タブレット以上：グリッド表示 */}
      <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-3 gap-6">
        {typeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              p-6 rounded-lg border-2 transition-all
              ${selected === option.id ? 'ring-2 ring-indigo-500' : ''}
              ${option.color}
            `}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="text-4xl">{option.icon}</div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-800">
                  {option.label}
                </h4>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InterviewTypeStep;