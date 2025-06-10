interface ComposeCardProps {
  type: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  color: string;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
  totalCards?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ComposeCard = ({ type, icon, title, description, features, color, isSelected, onClick, index, onKeyDown }: ComposeCardProps) => {
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
        w-full p-4 rounded-lg border transition-all duration-200 text-left cursor-pointer
        transform hover:scale-[1.02] hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        ${isSelected 
          ? getSelectedStyle(type)
          : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <div className="font-medium mb-1">{title}</div>
          <div className="text-sm opacity-80 leading-tight mb-2">{description}</div>
          <div className="flex gap-2 flex-wrap">
            {features.map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-current/20 opacity-70"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-current opacity-60 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default ComposeCard;