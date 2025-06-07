interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentFilter: string;
  setCurrentFilter: (filter: string) => void;
  toggleSidebar: () => void;
}

const Header = ({ currentTab, setCurrentTab, currentFilter, setCurrentFilter, toggleSidebar }: HeaderProps) => {
  const tabs = [
    { id: 'home', label: '🏠 ホーム' },
    { id: 'improvement', label: '💡 改善提案' },
    { id: 'community', label: '👥 コミュニティ' },
    { id: 'report', label: '🚨 公益通報' },
  ];

  const filters = {
    home: [
      { id: 'latest', label: '最新' },
      { id: 'hot', label: '🔥 話題' },
      { id: 'consensus', label: '✅ 合意形成中' },
    ],
    improvement: [
      { id: 'new', label: '新着' },
      { id: 'voting', label: '投票中' },
      { id: 'project', label: 'プロジェクト化' },
    ],
    community: [
      { id: 'all', label: 'すべて' },
      { id: 'questions', label: '質問' },
      { id: 'info', label: '情報共有' },
    ],
    report: [
      { id: 'active', label: '対応中' },
      { id: 'resolved', label: '解決済み' },
    ],
  };

  return (
    <header className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 p-4 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
      <div className="flex items-center mb-4 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-4 text-xl font-bold gradient-text">VoiceDrive</span>
      </div>
      
      <div className="flex gap-4 mb-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`
              px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap
              transition-all duration-300
              ${currentTab === tab.id
                ? 'text-blue-500 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {filters[currentTab as keyof typeof filters] && (
        <div className="flex gap-2 pt-3 border-t border-gray-800/30">
          {filters[currentTab as keyof typeof filters].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCurrentFilter(filter.id)}
              className={`
                px-3 py-1.5 rounded-2xl text-xs font-medium
                transition-all duration-300
                ${currentFilter === filter.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_2px_8px_rgba(29,155,240,0.3)]'
                  : 'bg-white/5 border border-gray-800/50 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;