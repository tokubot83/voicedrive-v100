import { useState } from 'react';
import ComposeCard from './ComposeCard';
import ComposeForm from './ComposeForm';
import { PostType } from '../types';

interface ComposeSectionProps {
  selectedPostType: PostType;
  setSelectedPostType: (type: PostType) => void;
}

const ComposeSection = ({ selectedPostType, setSelectedPostType }: ComposeSectionProps) => {
  const [showForm, setShowForm] = useState(false);

  const cards = [
    {
      type: 'improvement' as PostType,
      icon: '💡',
      title: '改善提案',
      description: '業務効率化・品質向上の アイデアを提案',
      features: ['優先順位設定', '進捗管理', 'ROI分析'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      type: 'community' as PostType,
      icon: '👥',
      title: 'コミュニティ',
      description: '情報共有・相談・雑談で チームの絆を深める',
      features: ['カジュアル', '双方向性', 'リアルタイム'],
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: 'report' as PostType,
      icon: '🚨',
      title: '公益通報',
      description: '安全・法令・倫理の問題を 匿名で報告',
      features: ['完全匿名', '機密保持', '迅速対応'],
      color: 'from-red-500 to-red-600',
    },
  ];

  const handleCardClick = (type: PostType) => {
    setSelectedPostType(type);
    setShowForm(true);
  };

  return (
    <div className="border-b border-gray-800/50 p-6 bg-gradient-to-b from-black/20 to-black/10 backdrop-blur-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          VoiceDrive
        </h1>
        <p className="text-gray-400">
          あなたの声で組織を変える
        </p>
      </div>

      <div 
        className="space-y-3 mb-8"
        role="radiogroup"
        aria-label="投稿タイプを選択"
      >
        {cards.map((card, index) => (
          <ComposeCard
            key={card.type}
            type={card.type}
            icon={card.icon}
            title={card.title}
            description={card.description}
            features={card.features}
            color={card.color}
            isSelected={selectedPostType === card.type && showForm}
            onClick={() => handleCardClick(card.type)}
            index={index}
            totalCards={cards.length}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (index + 1) % cards.length;
                handleCardClick(cards[nextIndex].type);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (index - 1 + cards.length) % cards.length;
                handleCardClick(cards[prevIndex].type);
              }
            }}
          />
        ))}
      </div>

      {showForm && (
        <ComposeForm
          selectedType={selectedPostType}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ComposeSection;