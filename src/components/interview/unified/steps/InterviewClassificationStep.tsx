import React from 'react';
import { InterviewClassification } from '../../../../types/unifiedInterview';
import { Calendar, MessageCircle, AlertCircle } from 'lucide-react';

interface InterviewClassificationStepProps {
  selected?: InterviewClassification;
  onSelect: (value: InterviewClassification) => void;
}

const InterviewClassificationStep: React.FC<InterviewClassificationStepProps> = ({
  selected,
  onSelect
}) => {
  const classifications = [
    {
      value: 'regular' as InterviewClassification,
      icon: <Calendar className="w-12 h-12" />,
      emoji: '📅',
      title: '定期面談',
      description: '定期的な面談',
      color: 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
    },
    {
      value: 'support' as InterviewClassification,
      icon: <MessageCircle className="w-12 h-12" />,
      emoji: '💬',
      title: 'サポート面談',
      description: '相談・支援',
      color: 'border-green-300 hover:border-green-500 hover:bg-green-50'
    },
    {
      value: 'special' as InterviewClassification,
      icon: <AlertCircle className="w-12 h-12" />,
      emoji: '🆘',
      title: '特別面談',
      description: '復職・退職等',
      color: 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">どのような面談をご希望ですか？</p>

      {/* モバイル用：縦並び */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {classifications.map((item) => (
          <button
            key={item.value}
            onClick={() => onSelect(item.value)}
            className={`
              p-6 rounded-lg border-2 transition-all text-left
              ${selected === item.value ? 'ring-2 ring-indigo-500' : ''}
              ${item.color}
            `}
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{item.emoji}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* タブレット以上：グリッド表示 */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6">
        {classifications.map((item) => (
          <button
            key={item.value}
            onClick={() => onSelect(item.value)}
            className={`
              p-8 rounded-lg border-2 transition-all
              ${selected === item.value ? 'ring-2 ring-indigo-500' : ''}
              ${item.color}
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="text-5xl">{item.emoji}</div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InterviewClassificationStep;