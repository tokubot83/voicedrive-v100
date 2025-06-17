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
      type: 'improvement' as PostType,
      icon: '💡',
      title: 'アイデアボイス',
      description: '業務効率化・品質向上の アイデアを提案',
      features: ['優先順位設定', '進捗管理', 'ROI分析'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      type: 'community' as PostType,
      icon: '💬',
      title: 'フリーボイス',
      description: '情報共有・相談・雑談で チームの絆を深める',
      features: ['カジュアル', '双方向性', 'リアルタイム'],
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: 'report' as PostType,
      icon: '🚨',
      title: 'コンプライアンス窓口',
      description: '安全・法令・倫理の問題を 匿名で報告',
      features: ['完全匿名', '機密保持', '迅速対応'],
      color: 'from-red-500 to-red-600',
    },
    {
      type: 'interview' as any, // 面談予約用の特別なタイプ
      icon: '🗣️',
      title: '面談予約',
      description: '人財統括本部との 個別面談を予約',
      features: ['キャリア相談', '悩み解決', '能力開発'],
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const handleCardClick = (type: PostType | 'interview') => {
    if (type === 'report') {
      // 公益通報の場合は専用ページに遷移
      navigate('/whistleblowing');
      return;
    }
    if (type === 'interview') {
      // 面談予約の場合は面談予約ページに遷移
      navigate('/interview-booking');
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
            color={card.color || 'from-gray-500 to-gray-600'}
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