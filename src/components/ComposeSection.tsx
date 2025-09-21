import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComposeCard from './ComposeCard';
import ComposeForm from './ComposeForm';
import { PostType } from '../types';

interface ComposeSectionProps {
  selectedPostType: PostType;
  setSelectedPostType: (type: PostType) => void;
}

const ComposeSection = ({ selectedPostType, setSelectedPostType }: ComposeSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const cards = [
    {
      type: 'interview' as any, // 面談予約用の特別なタイプ
      icon: '🗣️',
      title: '面談',
      description: '面談予約・相談申込み',
      features: [],
      gradient: 'from-violet-500 to-purple-500',
      shadow: 'shadow-violet-500/30',
      hover: 'hover:shadow-violet-500/50',
      ring: 'ring-purple-500/50',
    },
    {
      type: 'improvement' as PostType,
      icon: '💡',
      title: 'アイデアボイス',
      description: '職場の声を形に',
      features: [],
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/30',
      hover: 'hover:shadow-amber-500/50',
      ring: 'ring-amber-500/50',
    },
    {
      type: 'community' as PostType,
      icon: '💬',
      title: 'フリーボイス',
      description: '自由な交流の場',
      features: [],
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/30',
      hover: 'hover:shadow-blue-500/50',
      ring: 'ring-blue-500/50',
    },
    {
      type: 'report' as PostType,
      icon: '🚨',
      title: 'コンプライアンス窓口',
      description: '匿名で安全に報告',
      features: [],
      gradient: 'from-rose-500 to-pink-500',
      shadow: 'shadow-rose-500/30',
      hover: 'hover:shadow-rose-500/50',
      ring: 'ring-rose-500/50',
    },
  ];

  const handleCardClick = (type: PostType | 'interview') => {
    if (type === 'report') {
      // 公益通報の場合は専用ページに遷移
      navigate('/whistleblowing');
      return;
    }
    if (type === 'interview') {
      // 面談予約の場合は面談ステーションに遷移し、予約モーダルを自動開くパラメータを追加
      navigate('/interview-station?action=book');
      return;
    }
    // 改善提案とフリースペースは全幅レイアウトのページに遷移
    navigate(`/compose/${type}`);
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
            gradient={card.gradient}
            shadow={card.shadow}
            hover={card.hover}
            ring={card.ring}
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