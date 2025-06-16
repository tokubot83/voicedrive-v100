import { useState } from 'react';
import { StakeholderGroup } from '../types/visibility';
import { CreatePollData } from '../types/poll';
import PollCreator from './PollCreator';

// フリースペースカテゴリ定義
export enum FreespaceCategory {
  IDEA_SHARING = 'idea_sharing',
  CASUAL_DISCUSSION = 'casual_discussion', 
  EVENT_PLANNING = 'event_planning'
}

interface FreespaceOptionsProps {
  selectedCategory: FreespaceCategory;
  selectedScope: StakeholderGroup;
  onCategoryChange: (category: FreespaceCategory) => void;
  onScopeChange: (scope: StakeholderGroup) => void;
  showPollOption?: boolean;
  onCreatePoll?: (pollData: CreatePollData) => void;
}

const FreespaceOptions = ({
  selectedCategory,
  selectedScope,
  onCategoryChange,
  onScopeChange,
  showPollOption = false,
  onCreatePoll
}: FreespaceOptionsProps) => {
  const [showPollCreator, setShowPollCreator] = useState(false);
  
  // カテゴリ定義
  const categories = [
    {
      id: FreespaceCategory.IDEA_SHARING,
      icon: '💡',
      title: 'アイデア共有',
      description: '改善案や新しいアイデアを共有',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: FreespaceCategory.CASUAL_DISCUSSION,
      icon: '💬',
      title: '雑談',
      description: 'カジュアルな話題や相談',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: FreespaceCategory.EVENT_PLANNING,
      icon: '🎉',
      title: 'イベント企画',
      description: '懇親会や勉強会の企画',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  // 公開範囲定義
  const scopes = [
    {
      id: StakeholderGroup.SAME_TEAM,
      icon: '👥',
      title: 'チーム内',
      description: '同じチームのメンバーのみ'
    },
    {
      id: StakeholderGroup.SAME_DEPARTMENT,
      icon: '🏢',
      title: '部署内',
      description: '同じ部署のメンバーのみ'
    },
    {
      id: StakeholderGroup.SAME_FACILITY,
      icon: '🏥',
      title: '施設内',
      description: '同じ施設のメンバーのみ'
    },
    {
      id: StakeholderGroup.SAME_ORGANIZATION,
      icon: '🌐',
      title: '法人内',
      description: '法人全体のメンバー'
    }
  ];

  // カテゴリ別のおすすめ公開範囲
  const getRecommendedScopes = (category: FreespaceCategory): StakeholderGroup[] => {
    switch (category) {
      case FreespaceCategory.IDEA_SHARING:
        return [StakeholderGroup.SAME_DEPARTMENT, StakeholderGroup.SAME_FACILITY, StakeholderGroup.SAME_ORGANIZATION];
      case FreespaceCategory.CASUAL_DISCUSSION:
        return [StakeholderGroup.SAME_TEAM, StakeholderGroup.SAME_DEPARTMENT, StakeholderGroup.SAME_FACILITY];
      case FreespaceCategory.EVENT_PLANNING:
        return [StakeholderGroup.SAME_DEPARTMENT, StakeholderGroup.SAME_FACILITY, StakeholderGroup.SAME_ORGANIZATION];
      default:
        return [StakeholderGroup.SAME_DEPARTMENT];
    }
  };

  const recommendedScopes = getRecommendedScopes(selectedCategory);

  return (
    <div className="space-y-6">
      {/* カテゴリ選択 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📝 投稿カテゴリを選択
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-lg`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{category.title}</h4>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                {selectedCategory === category.id && (
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 公開範囲選択 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          👁️ 公開範囲を選択
        </h3>
        <div className="space-y-2">
          {scopes.map((scope) => {
            const isRecommended = recommendedScopes.includes(scope.id);
            const isSelected = selectedScope === scope.id;
            
            return (
              <div
                key={scope.id}
                onClick={() => onScopeChange(scope.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isRecommended
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{scope.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-800 flex items-center space-x-1">
                        <span>{scope.title}</span>
                        {isRecommended && !isSelected && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            おすすめ
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{scope.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-blue-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 投票機能オプション */}
      {showPollOption && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📊 投票機能
          </h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📊</span>
                  <div>
                    <h4 className="font-medium text-gray-800">投票を追加</h4>
                    <p className="text-sm text-gray-600">選択肢から選んでもらう投票を作成</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPollCreator(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  投票を作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 投票作成モーダル */}
      {showPollCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PollCreator
              category={selectedCategory}
              scope={selectedScope as any}
              onCreatePoll={(pollData) => {
                onCreatePoll?.(pollData);
                setShowPollCreator(false);
              }}
              onCancel={() => setShowPollCreator(false)}
            />
          </div>
        </div>
      )}

      {/* 選択内容の確認 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">📋 選択内容の確認</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span>カテゴリ:</span>
            <span className="font-medium">
              {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.title}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>公開範囲:</span>
            <span className="font-medium">
              {scopes.find(s => s.id === selectedScope)?.icon} {scopes.find(s => s.id === selectedScope)?.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreespaceOptions;