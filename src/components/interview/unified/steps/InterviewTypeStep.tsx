import React, { useState } from 'react';
import { InterviewClassification, REGULAR_TYPES, SPECIAL_TYPES, SUPPORT_CATEGORIES } from '../../../../types/unifiedInterview';
import { ChevronDown } from 'lucide-react';

interface InterviewTypeStepProps {
  classification: InterviewClassification;
  selected?: string;
  selectedCategory?: string;
  onSelect: (type: string, category?: string) => void;
}

const InterviewTypeStep: React.FC<InterviewTypeStepProps> = ({
  classification,
  selected,
  selectedCategory,
  onSelect
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 定期面談・特別面談の場合（従来通り）
  if (classification === 'regular' || classification === 'special') {
    const typeOptions = classification === 'regular'
      ? REGULAR_TYPES.map(type => ({
          ...type,
          color: 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
        }))
      : SPECIAL_TYPES.map(type => ({
          ...type,
          color: 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
        }));

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700">{getTitle(classification)}</h3>
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
  }

  // サポート面談の場合：プルダウン選択
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

  const selectedCategoryInfo = SUPPORT_CATEGORIES.find(c => c.id === selectedCategory);
  const selectedGroupInfo = categoryGroups.find(g =>
    g.categories.some(c => c.id === selectedCategory)
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700">サポート面談</h3>
        <p className="text-gray-600 mt-1">相談内容を選択してください</p>
      </div>

      {/* プルダウン選択 */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            w-full p-4 border-2 rounded-lg text-left transition-all
            flex items-center justify-between
            ${selectedCategory
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            {selectedGroupInfo && (
              <span className="text-2xl">{selectedGroupInfo.icon}</span>
            )}
            <div>
              {selectedCategory ? (
                <>
                  <div className="font-semibold text-gray-800">
                    {selectedCategoryInfo?.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedGroupInfo?.label}
                    {selectedCategoryInfo?.description && ` - ${selectedCategoryInfo.description}`}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">相談内容を選択してください</div>
              )}
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* ドロップダウンメニュー */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {categoryGroups.map((group) => (
              <div key={group.id} className="border-b border-gray-100 last:border-b-0">
                {/* グループヘッダー */}
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-800 flex items-center space-x-2">
                  <span className="text-xl">{group.icon}</span>
                  <span>{group.label}</span>
                </div>

                {/* カテゴリ一覧 */}
                {group.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onSelect('support', category.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors
                      border-l-4
                      ${selectedCategory === category.id
                        ? 'border-l-indigo-500 bg-indigo-50'
                        : 'border-l-transparent'
                      }
                    `}
                  >
                    <div className="font-medium text-gray-800">
                      {category.label}
                    </div>
                    {category.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 選択状態の確認 */}
      {selectedCategory && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <span className="text-green-600">✓</span>
            <span className="font-medium">選択完了</span>
          </div>
          <div className="text-green-700 mt-1">
            {selectedGroupInfo?.label} - {selectedCategoryInfo?.label}
          </div>
        </div>
      )}
    </div>
  );
};

// ヘルパー関数
function getTitle(classification: InterviewClassification): string {
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
}

export default InterviewTypeStep;