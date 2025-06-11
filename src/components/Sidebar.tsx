import { UserRole } from '../types';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { PermissionLevel, PERMISSION_METADATA } from '../permissions/types/PermissionTypes';
import { useDemoMode } from './demo/DemoModeController';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  currentPath?: string;
  isOpen: boolean;
  closeSidebar: () => void;
  userRole?: UserRole;
  userId?: string;
}

interface NavItem {
  id: string;
  path?: string;
  icon?: string;
  label?: string;
  section?: string;
  menuKey?: string;
  requiredLevel?: number;
  exactLevel?: boolean;
  isDivider?: boolean;
}

const Sidebar = ({ isOpen, closeSidebar, userRole = 'employee', userId }: SidebarProps) => {
  const { isDemoMode, currentUser } = useDemoMode();
  const demoUserId = isDemoMode ? currentUser.id : userId;
  const { accessibleMenuItems, metadata } = usePermissions(demoUserId);
  const location = useLocation();
  
  const allNavItems: NavItem[] = [
    // 基本機能（全レベルでアクセス可能）
    { id: 'home', path: '/', icon: '🏠', label: 'ホーム', section: 'main' },
    { id: 'profile', path: '/profile', icon: '👤', label: 'プロフィール', section: 'main' },
    { id: 'projects', path: '/projects', icon: '📁', label: 'プロジェクト一覧', section: 'main' },
    
    { id: 'divider0', isDivider: true },
    
    // 役職別ダッシュボード（権限レベルに応じて1つのみ表示）
    { id: 'dashboard-personal', path: '/dashboard/personal', icon: '💫', label: 'マイダッシュボード', section: 'dashboard', requiredLevel: 1, exactLevel: true },
    { id: 'dashboard-team-leader', path: '/dashboard/team-leader', icon: '⭐', label: '現場リーダーダッシュボード', section: 'dashboard', requiredLevel: 2, exactLevel: true },
    { id: 'dashboard-department', path: '/dashboard/department', icon: '📈', label: '部門管理ダッシュボード', section: 'dashboard', requiredLevel: 3, exactLevel: true },
    { id: 'dashboard-facility', path: '/dashboard/facility', icon: '🏥', label: '施設管理ダッシュボード', section: 'dashboard', requiredLevel: 4, exactLevel: true },
    { id: 'dashboard-hr-management', path: '/dashboard/hr-management', icon: '👥', label: '人事統括ダッシュボード', section: 'dashboard', requiredLevel: 5, exactLevel: true },
    { id: 'dashboard-strategic', path: '/dashboard/strategic', icon: '📊', label: '戦略企画ダッシュボード', section: 'dashboard', requiredLevel: 6, exactLevel: true },
    { id: 'dashboard-corporate', path: '/dashboard/corporate', icon: '🏢', label: '法人統括ダッシュボード', section: 'dashboard', requiredLevel: 7, exactLevel: true },
    { id: 'dashboard-executive', path: '/dashboard/executive', icon: '🏛️', label: '経営ダッシュボード', section: 'dashboard', requiredLevel: 8, exactLevel: true },
    
    // チーム管理機能（レベル2以上）
    { id: 'team_management', path: '/team-management', icon: '👥', label: 'チーム管理', section: 'team', menuKey: 'team_management' },
    
    // 部門管理機能（レベル3以上）
    { id: 'department_overview', path: '/department-overview', icon: '📊', label: '部門概要', section: 'department', menuKey: 'department_dashboard' },
    
    // 予算管理（レベル4以上）
    { id: 'budget_control', path: '/budget', icon: '💰', label: '予算管理', section: 'management', menuKey: 'budget_control' },
    
    // 権限管理（レベル3以上）
    { id: 'authority', path: '/authority', icon: '🛡️', label: '権限管理', section: 'management', menuKey: 'authority_management' },
    
    // HR関連機能（レベル5以上）
    { id: 'hr_dashboard', path: '/hr-dashboard', icon: '👨‍💼', label: '人事ダッシュボード', section: 'hr', menuKey: 'hr_dashboard' },
    { id: 'policy_management', path: '/policy', icon: '📑', label: 'ポリシー管理', section: 'hr', menuKey: 'policy_management' },
    { id: 'talent_analytics', path: '/talent', icon: '🔍', label: 'タレント分析', section: 'hr', menuKey: 'talent_analytics' },
    
    // HR戦略機能（レベル6以上）
    { id: 'strategic_planning', path: '/strategic-planning', icon: '🎯', label: '戦略的人事計画', section: 'hr_strategic', menuKey: 'strategic_planning' },
    { id: 'org_development', path: '/org-development', icon: '🏗️', label: '組織開発', section: 'hr_strategic', menuKey: 'org_development' },
    { id: 'performance_analytics', path: '/performance', icon: '📈', label: 'パフォーマンス分析', section: 'hr_strategic', menuKey: 'performance_analytics' },
    { id: 'retirement_processing', path: '/retirement-processing', icon: '👤', label: '退職処理管理', section: 'hr_strategic', requiredLevel: 6 },
    
    // 施設管理機能（レベル7以上）
    { id: 'facility_management', path: '/facility-management', icon: '🏭', label: '施設管理', section: 'facility', menuKey: 'facility_management' },
    { id: 'strategic_overview', path: '/strategic-overview', icon: '🏛️', label: '戦略概要', section: 'facility', menuKey: 'strategic_dashboard' },
    { id: 'budget_planning', path: '/budget-planning', icon: '💸', label: '予算計画', section: 'facility', menuKey: 'budget_planning' },
    { id: 'analytics', path: '/analytics', icon: '📊', label: '分析', section: 'facility', menuKey: 'analytics' },
    { id: 'executive_reports', path: '/executive-reports', icon: '📄', label: 'エグゼクティブレポート', section: 'facility', menuKey: 'executive_reports' },
    
    // 経営層機能（レベル8）
    { id: 'executive_overview', path: '/executive-overview', icon: '👑', label: '経営概要', section: 'executive', menuKey: 'executive_dashboard' },
    { id: 'strategic_initiatives', path: '/strategic-initiatives', icon: '🚀', label: '戦略イニシアチブ', section: 'executive', menuKey: 'strategic_initiatives' },
    { id: 'organization_analytics', path: '/organization-analytics', icon: '🌐', label: '組織分析', section: 'executive', menuKey: 'organization_analytics' },
    { id: 'board_reports', path: '/board-reports', icon: '📊', label: '理事会レポート', section: 'executive', menuKey: 'board_reports' },
    { id: 'governance', path: '/governance', icon: '⚖️', label: 'ガバナンス', section: 'executive', menuKey: 'governance' },
    
    { id: 'divider1', isDivider: true },
    
    // ツール機能（全レベルでアクセス可能）
    { id: 'time-axis', path: '/demo/time-axis', icon: '⏰', label: '時間管理', section: 'tools' },
    { id: 'hierarchy-demo', path: '/demo/hierarchy', icon: '🏢', label: '階層デモ', section: 'tools' },
    
    { id: 'divider2', isDivider: true },
    
    // システム機能（全レベルでアクセス可能）
    { id: 'notifications', path: '/notifications', icon: '🔔', label: '通知', section: 'system' },
    { id: 'settings', path: '/settings', icon: '⚙️', label: '設定', section: 'system' },
  ];

  // アクセス可能なメニュー項目をフィルタリング
  const filteredNavItems = allNavItems.filter((item, index, array) => {
    if (item.isDivider) {
      // ツールセクションの区切り線は常に表示
      if (item.id === 'divider1') {
        return true;
      }
      // システムセクションの区切り線は常に表示
      if (item.id === 'divider2') {
        return true;
      }
      // ダッシュボードの区切り線は、ダッシュボードが表示される場合のみ表示
      if (item.id === 'divider0') {
        // 次の項目がダッシュボードで、表示される場合のみ区切り線を表示
        const nextItems = array.slice(index + 1, index + 9); // 次の8項目（ダッシュボード）をチェック
        return nextItems.some(nextItem => 
          nextItem.section === 'dashboard' && 
          nextItem.requiredLevel === (currentUser?.permissionLevel || 1)
        );
      }
      return false;
    }
    
    // 役職別ダッシュボードの場合（exactLevelがtrueの項目）
    if (item.exactLevel && item.requiredLevel) {
      const userLevel = currentUser?.permissionLevel || 1;
      return userLevel === item.requiredLevel;
    }
    
    // requiredLevelが指定されている場合は、権限レベルをチェック
    if (item.requiredLevel && !item.exactLevel) {
      const userLevel = currentUser?.permissionLevel || 1;
      return userLevel >= item.requiredLevel;
    }
    
    // menuKeyが指定されている場合は、アクセス可能なメニューかチェック
    if (item.menuKey) {
      return accessibleMenuItems.includes(item.menuKey);
    }
    
    // menuKeyがない項目（設定等）は全員アクセス可能
    return true;
  });

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <div className="w-full h-full p-5 overflow-y-auto bg-black/30 backdrop-blur-xl">
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
          
          const isActive = item.path === location.pathname;
          
          return (
            <Link
              key={item.id}
              to={item.path || '#'}
              onClick={handleNavClick}
              className={`
                flex items-center w-full p-3 mb-1 rounded-full text-gray-200
                transition-all duration-300 relative overflow-hidden
                hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10
                hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(29,155,240,0.2)]
                ${isActive ? 
                  'font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' : 
                  ''}
                ${['team', 'department', 'management', 'hr', 'hr_strategic', 'facility', 'executive'].includes(item.section) ? 'text-gray-300/80' : ''}
              `}
            >
              <span className="mr-4 text-xl drop-shadow-[0_0_5px_rgba(29,155,240,0.5)]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        {isDemoMode ? (
          <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.svg';
                }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{currentUser.name}</div>
                <div className="text-xs text-gray-400">{currentUser.position}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{currentUser.department}</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                Lv.{currentUser.permissionLevel}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xs text-gray-500">
              {metadata.displayName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;