interface ComposeCardProps {
  type: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

const ComposeCard = ({ icon, title, description, features, color, isSelected, onClick }: ComposeCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-pointer
        bg-gradient-to-br from-white/8 to-white/4
        border-2 rounded-2xl p-5
        transition-all duration-400 group
        ${isSelected 
          ? 'border-blue-500 bg-gradient-to-br from-blue-500/15 to-purple-500/15 transform -translate-y-0.5 shadow-[0_8px_30px_rgba(29,155,240,0.3)]' 
          : 'border-gray-800/50 hover:border-blue-500/50 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(29,155,240,0.2)]'
        }
      `}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      
      <div className="relative z-10 flex items-center gap-4">
        <div className="text-5xl drop-shadow-[0_0_10px_currentColor] group-hover:animate-float">
          {icon}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm mb-3 leading-relaxed">
            {description}
          </p>
          <div className="flex gap-2 flex-wrap">
            {features.map((feature, index) => (
              <span
                key={index}
                className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <div className={`text-2xl text-blue-500 transition-transform duration-300 group-hover:translate-x-1`}>
          →
        </div>
      </div>
    </div>
  );
};

export default ComposeCard;