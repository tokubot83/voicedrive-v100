import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubFilter } from '../../types/tabs';

interface SubFiltersProps {
  parentTab: string;
  activeFilter: string | null;
  onFilterChange: (filterId: string) => void;
}

// サブフィルターの定義
export const subFilters: SubFilter[] = [
  // 改善提案サブフィルター（アイデアボイス）
  { id: 'voting', label: '投票', parentTab: 'improvement' },
  { id: 'facility', label: '施設', parentTab: 'improvement' },
  { id: 'all', label: '全体', parentTab: 'improvement' },
  
  // フリーボイスサブフィルター
  { id: 'polls', label: '投票', parentTab: 'freevoice' },
  { id: 'events', label: 'イベント', parentTab: 'freevoice' },
  { id: 'others', label: 'その他', parentTab: 'freevoice' },
  
  // フリーボイスサブフィルター（廃止）
  // { id: 'voting', label: '投票', parentTab: 'freevoice' },
  // { id: 'facility', label: '施設', parentTab: 'freevoice' },
  // { id: 'all', label: '全体', parentTab: 'freevoice' },
  
  // 公益通報サブフィルター
  { id: 'new', label: '新着', parentTab: 'whistleblowing' },
  { id: 'trending', label: '注目', parentTab: 'whistleblowing' },
  { id: 'urgent-whistleblowing', label: '緊急', parentTab: 'whistleblowing' },
  
  // プロジェクトサブフィルター
  { id: 'active', label: '進行中', parentTab: 'projects' },
  { id: 'department', label: '部署内', parentTab: 'projects' },
  { id: 'facility', label: '施設内', parentTab: 'projects' },
  { id: 'corporate', label: '法人', parentTab: 'projects' },
  { id: 'completed', label: '完了', parentTab: 'projects' }
];

export const SubFilters: React.FC<SubFiltersProps> = ({ 
  parentTab, 
  activeFilter, 
  onFilterChange 
}) => {
  const navigate = useNavigate();
  
  // 現在のタブに対応するサブフィルターを取得
  const currentFilters = subFilters.filter(filter => filter.parentTab === parentTab);

  const handleFilterClick = (filterId: string) => {
    if (parentTab === 'projects') {
      // プロジェクトページの場合はプロジェクトページ内でフィルター
      navigate(`/projects?filter=${filterId}`);
    } else if (parentTab === 'whistleblowing') {
      // 公益通報の場合は専用ページに遷移
      navigate('/whistleblowing');
    } else {
      // その他はホームページでタブとフィルターを適用
      navigate(`/?tab=${parentTab}&filter=${filterId}`);
    }
    onFilterChange(filterId);
  };
  
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
              onClick={() => handleFilterClick(filter.id)}
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