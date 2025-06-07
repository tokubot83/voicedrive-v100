interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ currentPage, setCurrentPage, isOpen, closeSidebar }: SidebarProps) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'ホーム' },
    { id: 'improvement', icon: '💡', label: '改善提案' },
    { id: 'community', icon: '👥', label: 'コミュニティ' },
    { id: 'report', icon: '🚨', label: '公益通報' },
    { id: 'projects', icon: '🚀', label: 'プロジェクト' },
    { id: 'analytics', icon: '📊', label: '分析' },
    { id: 'notifications', icon: '🔔', label: '通知' },
    { id: 'profile', icon: '👤', label: 'プロフィール' },
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <aside 
      className={`
        w-[275px] p-5 border-r border-gray-800/50 sticky top-0 h-screen
        bg-black/30 backdrop-blur-xl
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:relative z-[1000]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex items-center text-2xl font-bold mb-5 text-white animate-pulse">
        <span className="mr-3 text-3xl drop-shadow-[0_0_10px_rgba(29,155,240,0.8)] animate-float">
          🚀
        </span>
        <span className="gradient-text">VoiceDrive</span>
      </div>
      
      <div className="text-sm text-gray-500 mb-6 text-center opacity-80">
        革新的合意形成システム
      </div>
      
      <nav>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`
              flex items-center w-full p-3 mb-1 rounded-full text-gray-200
              transition-all duration-300 relative overflow-hidden
              hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10
              hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(29,155,240,0.2)]
              ${currentPage === item.id ? 
                'font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' : 
                ''}
            `}
          >
            <span className="mr-4 text-xl drop-shadow-[0_0_5px_rgba(29,155,240,0.5)]">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;