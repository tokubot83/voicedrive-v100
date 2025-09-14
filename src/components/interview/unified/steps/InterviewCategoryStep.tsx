import React, { useState } from 'react';
import { SUPPORT_CATEGORIES } from '../../../../types/unifiedInterview';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InterviewCategoryStepProps {
  selected?: string;
  onSelect: (value: string) => void;
}

const InterviewCategoryStep: React.FC<InterviewCategoryStepProps> = ({
  selected,
  onSelect
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('career');

  const categoryGroups = [
    {
      id: 'career',
      label: 'キャリア系面談',
      icon: '🎯',
      categories: SUPPORT_CATEGORIES.filter(c => c.group === 'career')
    },
    {
      id: 'workplace',
      label: '職場環境系面談',
      icon: '🏢',
      categories: SUPPORT_CATEGORIES.filter(c => c.group === 'workplace')
    },
    {
      id: 'consultation',
      label: '個別相談面談',
      icon: '💼',
      categories: SUPPORT_CATEGORIES.filter(c => c.group === 'consultation')
    }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700">サポート面談</h3>
        <p className="text-gray-600 mt-1">相談内容を選択してください</p>
      </div>

      {/* アコーディオン形式のカテゴリ選択 */}
      <div className="space-y-3">
        {categoryGroups.map((group) => (
          <div
            key={group.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* グループヘッダー */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{group.icon}</span>
                <span className="font-medium text-gray-800">{group.label}</span>
              </div>
              {expandedGroup === group.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* カテゴリリスト */}
            {expandedGroup === group.id && (
              <div className="bg-white">
                {group.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onSelect(category.id)}
                    className={`
                      w-full px-6 py-3 text-left border-t border-gray-100
                      transition-colors hover:bg-gray-50
                      ${selected === category.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">
                          {category.label}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </div>
                        )}
                      </div>
                      {selected === category.id && (
                        <div className="text-indigo-600">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* モバイル用の説明 */}
      <div className="sm:hidden text-sm text-gray-500 text-center mt-4">
        カテゴリをタップして展開してください
      </div>
    </div>
  );
};

export default InterviewCategoryStep;