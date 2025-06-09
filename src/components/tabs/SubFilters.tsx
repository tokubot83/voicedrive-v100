import React from 'react';
import { SubFilter } from '../../types/tabs';

interface SubFiltersProps {
  parentTab: string;
  activeFilter: string | null;
  onFilterChange: (filterId: string) => void;
}

// サブフィルターの定義
export const subFilters: SubFilter[] = [
  // 改善提案サブフィルター
  { id: 'new', label: '新着', parentTab: 'improvement' },
  { id: 'trending', label: '注目', parentTab: 'improvement' },
  { id: 'near-project', label: 'プロジェクト化間近', parentTab: 'improvement' },
  { id: 'urgent-improvement', label: '緊急', parentTab: 'improvement' },
  
  // コミュニティサブフィルター
  { id: 'new', label: '新着', parentTab: 'community' },
  { id: 'trending', label: '注目', parentTab: 'community' },
  { id: 'urgent-community', label: '緊急', parentTab: 'community' },
  
  // 公益通報サブフィルター
  { id: 'new', label: '新着', parentTab: 'whistleblowing' },
  { id: 'trending', label: '注目', parentTab: 'whistleblowing' },
  { id: 'urgent-whistleblowing', label: '緊急', parentTab: 'whistleblowing' }
];

export const SubFilters: React.FC<SubFiltersProps> = ({ 
  parentTab, 
  activeFilter, 
  onFilterChange 
}) => {
  // 現在のタブに対応するサブフィルターを取得
  const currentFilters = subFilters.filter(filter => filter.parentTab === parentTab);
  
  if (currentFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center py-2 px-4 border-t border-gray-800 animate-slideDown">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {currentFilters.map((filter, index) => {
          // 同じparentTabで同じIDのフィルターを区別するためのユニークキー
          const uniqueKey = `${filter.parentTab}-${filter.id}-${index}`;
          
          return (
            <button
              key={uniqueKey}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 transform hover:scale-105
                ${activeFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }
              `}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};