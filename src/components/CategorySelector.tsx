import React, { useState } from 'react';
import { PostCategory, POST_CATEGORIES, CATEGORY_GROUPS } from '../types/categories';
import { AlertCircle, Clock } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory?: PostCategory;
  onCategorySelect: (category: PostCategory) => void;
  showDeadlinePreview?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  showDeadlinePreview = true,
  urgencyLevel = 'medium'
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const getDeadlinePreview = (category: PostCategory): string => {
    const deadlines = {
      // 改善提案（医療・介護系法人向け）
      business_improvement: { low: '7日', medium: '3日', high: '1日', critical: '6時間' },
      communication: { low: '5日', medium: '2日', high: '1日', critical: '4時間' },
      innovation: { low: '14日', medium: '7日', high: '3日', critical: '1日' },
      // 戦略提案
      new_business: { low: '30日', medium: '21日', high: '14日', critical: '7日' },
      market_strategy: { low: '21日', medium: '14日', high: '7日', critical: '3日' },
      organizational_change: { low: '30日', medium: '21日', high: '14日', critical: '7日' },
      long_term_planning: { low: '45日', medium: '30日', high: '21日', critical: '14日' },
      // コミュニケーション
      recruitment_placement: { low: '21日', medium: '14日', high: '7日', critical: '3日' },
      evaluation_promotion: { low: '30日', medium: '21日', high: '14日', critical: '7日' },
      welfare_benefits: { low: '21日', medium: '14日', high: '7日', critical: '3日' },
      labor_issues: { low: '14日', medium: '7日', high: '3日', critical: '1日' },
      team_building: { low: '10日', medium: '5日', high: '3日', critical: '1日' },
      // フリースペース
      idea_sharing: { low: '14日', medium: '7日', high: '3日', critical: '1日' },
      casual_discussion: { low: '7日', medium: '3日', high: '1日', critical: '12時間' },
      event_planning: { low: '14日', medium: '7日', high: '3日', critical: '1日' },
      // 緊急
      emergency: { low: '12時間', medium: '6時間', high: '3時間', critical: '1時間' }
    };

    return deadlines[category]?.[urgencyLevel] || '3日';
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-2">
        投稿カテゴリを選択してください
      </div>

      {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => (
        <div key={groupKey} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedGroup(expandedGroup === groupKey ? null : groupKey)}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
              group.name.includes('慎重検討') ? 'bg-orange-50' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{group.name}</span>
              {group.name.includes('慎重検討') && (
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>長期検討</span>
                </div>
              )}
            </div>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expandedGroup === groupKey ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedGroup === groupKey && (
            <div className="border-t">
              {group.categories.map(categoryId => {
                const category = POST_CATEGORIES[categoryId as PostCategory];
                const isSelected = selectedCategory === categoryId;
                const deadline = getDeadlinePreview(categoryId as PostCategory);

                return (
                  <button
                    key={categoryId}
                    onClick={() => onCategorySelect(categoryId as PostCategory)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-600">{category.description}</div>
                      </div>
                    </div>
                    
                    {showDeadlinePreview && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>期限: {deadline}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {selectedCategory && POST_CATEGORIES[selectedCategory].requiresCarefulConsideration && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-orange-800 mb-1">
                このカテゴリは慎重な検討が必要です
              </div>
              <div className="text-orange-700">
                組織への影響が大きいため、通常より長い投票期限が設定されます。
                十分な議論と検討の時間を確保してください。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};