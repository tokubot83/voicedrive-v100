interface ComposeCardProps {
  type: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  gradient?: string;
  shadow?: string;
  hover?: string;
  ring?: string;
  color?: string; // 後方互換性のため残す
  isSelected: boolean;
  onClick: () => void;
  index?: number;
  totalCards?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ComposeCard = ({ 
  type, 
  icon, 
  title, 
  description, 
  features, 
  gradient, 
  shadow, 
  hover, 
  ring,
  color, 
  isSelected, 
  onClick, 
  index, 
  onKeyDown 
}: ComposeCardProps) => {
  const getSelectedStyle = (cardType: string) => {
    switch (cardType) {
      case 'improvement':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400 shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-500/30';
      case 'community':
        return 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500/30';
      case 'report':
        return 'border-red-500 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/20 ring-1 ring-red-500/30';
      default:
        return 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30';
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className={`
        relative overflow-hidden group
        w-full p-5 rounded-2xl
        bg-gradient-to-br ${gradient || color || 'from-gray-500 to-gray-600'}
        ${shadow} shadow-lg
        ${hover}
        transform transition-all duration-300
        hover:scale-[1.02] hover:-translate-y-0.5
        cursor-pointer
        border border-white/10
        focus:outline-none focus:ring-2 focus:${ring || 'ring-blue-500'} focus:ring-offset-2 focus:ring-offset-gray-900
      `}
    >
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* パーティクルエフェクト */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
      </div>

      <div className="relative z-10 flex items-center gap-4">
        {/* アイコンコンテナ */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        
        {/* テキストコンテンツ */}
        <div className="flex-1 text-left">
          <div className="font-bold text-lg text-white mb-1 group-hover:text-white/90 transition-colors">
            {title}
          </div>
          <div className="text-sm text-white/70 leading-tight group-hover:text-white/80 transition-colors">
            {description}
          </div>
          {features.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* 矢印アイコン */}
        <div className="flex-shrink-0 text-white/50 group-hover:text-white/80 transition-colors">
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default ComposeCard;