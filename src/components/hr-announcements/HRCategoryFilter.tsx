import React, { useState } from 'react';
import { CategoryConfig, HRAnnouncement } from '../../types/hr-announcements';

interface HRCategoryFilterProps {
  categories: CategoryConfig[];
  onFilter: (categories: HRAnnouncement['category'][]) => void;
}

const HRCategoryFilter: React.FC<HRCategoryFilterProps> = ({
  categories,
  onFilter
}) => {
  const [activeCategories, setActiveCategories] = useState<HRAnnouncement['category'][]>([]);

  const handleCategoryClick = (categoryKey: HRAnnouncement['category']) => {
    let newActiveCategories: HRAnnouncement['category'][];

    if (categoryKey === 'ALL' as any) {
      // 「すべて」がクリックされた場合
      newActiveCategories = [];
    } else {
      if (activeCategories.includes(categoryKey)) {
        // 既に選択されているカテゴリをクリックした場合、除外
        newActiveCategories = activeCategories.filter(cat => cat !== categoryKey);
      } else {
        // 新しいカテゴリを追加
        newActiveCategories = [...activeCategories, categoryKey];
      }
    }

    setActiveCategories(newActiveCategories);
    onFilter(newActiveCategories.length === 0 ? [] : newActiveCategories);
  };

  const isActive = (categoryKey: string) => {
    if (categoryKey === 'ALL') {
      return activeCategories.length === 0;
    }
    return activeCategories.includes(categoryKey as HRAnnouncement['category']);
  };

  return (
    <div className="hr-category-filter">
      <div className="hr-category-container">
        {/* すべてボタン */}
        <button
          className={`hr-category-btn ${isActive('ALL') ? 'active' : ''}`}
          onClick={() => handleCategoryClick('ALL' as any)}
        >
          📋 すべて
        </button>

        {/* カテゴリボタン */}
        {categories.map((category) => (
          <button
            key={category.key}
            className={`hr-category-btn ${isActive(category.key) ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.key)}
          >
            {category.icon} {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HRCategoryFilter;