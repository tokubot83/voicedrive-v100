import { UserRole } from '../types';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { PermissionLevel, PERMISSION_METADATA } from '../permissions/types/PermissionTypes';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  closeSidebar: () => void;
  userRole?: UserRole;
  userId?: string;
}

const Sidebar = ({ currentPage, setCurrentPage, isOpen, closeSidebar, userRole = 'employee', userId }: SidebarProps) => {
  const { accessibleMenuItems, metadata } = usePermissions(userId);
  const allNavItems: any[] = [
    // 基本機能（全レベルでアクセス可能）
    { id: 'home', icon: '🏠', label: 'ホーム', section: 'main', menuKey: 'home' },
    { id: 'voice', icon: '📣', label: 'ボイス', section: 'main', menuKey: 'voice' },
    { id: 'my_posts', icon: '📝', label: 'マイ投稿', section: 'main', menuKey: 'my_posts' },
    
    // チーム管理機能（レベル2以上）
    { id: 'team_management', icon: '👥', label: 'チーム管理', section: 'team', menuKey: 'team_management' },
    
    // 部門管理機能（レベル3以上）
    { id: 'department_dashboard', icon: '📊', label: '部門ダッシュボード', section: 'department', menuKey: 'department_dashboard' },
    
    // 予算管理（レベル4以上）
    { id: 'budget_control', icon: '💰', label: '予算管理', section: 'management', menuKey: 'budget_control' },
    
    // HR関連機能（レベル5以上）
    { id: 'hr_dashboard', icon: '👨‍💼', label: '人事ダッシュボード', section: 'hr', menuKey: 'hr_dashboard' },
    { id: 'policy_management', icon: '📑', label: 'ポリシー管理', section: 'hr', menuKey: 'policy_management' },
    { id: 'talent_analytics', icon: '🔍', label: 'タレント分析', section: 'hr', menuKey: 'talent_analytics' },
    
    // HR戦略機能（レベル6以上）
    { id: 'strategic_planning', icon: '🎯', label: '戦略的人事計画', section: 'hr_strategic', menuKey: 'strategic_planning' },
    { id: 'org_development', icon: '🏗️', label: '組織開発', section: 'hr_strategic', menuKey: 'org_development' },
    { id: 'performance_analytics', icon: '📈', label: 'パフォーマンス分析', section: 'hr_strategic', menuKey: 'performance_analytics' },
    
    // 施設管理機能（レベル7以上）
    { id: 'facility_management', icon: '🏭', label: '施設管理', section: 'facility', menuKey: 'facility_management' },
    { id: 'strategic_dashboard', icon: '🏛️', label: '戦略ダッシュボード', section: 'facility', menuKey: 'strategic_dashboard' },
    { id: 'budget_planning', icon: '💸', label: '予算計画', section: 'facility', menuKey: 'budget_planning' },
    { id: 'analytics', icon: '📊', label: '分析', section: 'facility', menuKey: 'analytics' },
    { id: 'executive_reports', icon: '📄', label: 'エグゼクティブレポート', section: 'facility', menuKey: 'executive_reports' },
    
    // 経営層機能（レベル8）
    { id: 'executive_dashboard', icon: '👑', label: '経営ダッシュボード', section: 'executive', menuKey: 'executive_dashboard' },
    { id: 'strategic_initiatives', icon: '🚀', label: '戦略イニシアチブ', section: 'executive', menuKey: 'strategic_initiatives' },
    { id: 'organization_analytics', icon: '🌐', label: '組織分析', section: 'executive', menuKey: 'organization_analytics' },
    { id: 'board_reports', icon: '📊', label: '理事会レポート', section: 'executive', menuKey: 'board_reports' },
    { id: 'governance', icon: '⚖️', label: 'ガバナンス', section: 'executive', menuKey: 'governance' },
    
    { id: 'divider1', isDivider: true },
    
    // 設定機能（全レベルでアクセス可能）
    { id: 'notifications', icon: '🔔', label: '通知', section: 'settings' },
    { id: 'settings', icon: '⚙️', label: '設定', section: 'settings' },
    
    { id: 'divider2', isDivider: true },
    
    // デモ機能
    { id: 'medical-profile', icon: '🏥', label: '医療プロフィール', section: 'demo' },
  ];

  // アクセス可能なメニュー項目をフィルタリング
  const filteredNavItems = allNavItems.filter(item => {
    if (item.isDivider) {
      // 設定セクションの区切り線は常に表示
      if (item.id === 'divider1') {
        return true;
      }
      return false;
    }
    
    // menuKeyが指定されている場合は、アクセス可能なメニューかチェック
    if (item.menuKey) {
      return accessibleMenuItems.includes(item.menuKey);
    }
    
    // menuKeyがない項目（設定等）は全員アクセス可能
    return true;
  });

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
        {filteredNavItems.map((item) => {
          if (item.isDivider) {
            return (
              <div key={item.id} className="my-4 border-t border-gray-800/50" />
            );
          }
          
          return (
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
                ${['team', 'department', 'management', 'hr', 'hr_strategic', 'facility', 'executive'].includes(item.section) ? 'text-gray-300/80' : ''}
              `}
            >
              <span className="mr-4 text-xl drop-shadow-[0_0_5px_rgba(29,155,240,0.5)]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="text-xs text-gray-500">
          {metadata.displayName}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;