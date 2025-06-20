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
    { id: 'interview-booking', path: '/interview-booking', icon: '🗣️', label: '面談情報', section: 'main' },
    { id: 'my-projects', path: '/my-projects', icon: '⭐', label: 'マイプロジェクト', section: 'main' },
    { id: 'projects', path: '/projects', icon: '📁', label: '全プロジェクト', section: 'main' },
    
    { id: 'divider0', isDivider: true },
    
    // 役職別ダッシュボード（権限レベルに応じて1つのみ表示）
    { id: 'dashboard-personal', path: '/dashboard/personal', icon: '💫', label: 'マイダッシュボード', section: 'dashboard', requiredLevel: 1, exactLevel: true },
    { id: 'dashboard-team-leader', path: '/dashboard/team-leader', icon: '⭐', label: '現場リーダーダッシュボード', section: 'dashboard', requiredLevel: 2, exactLevel: true },
    { id: 'dashboard-department', path: '/dashboard/department', icon: '📈', label: '部門管理ダッシュボード', section: 'dashboard', requiredLevel: 3, exactLevel: true },
    { id: 'dashboard-facility', path: '/dashboard/facility', icon: '🏥', label: '施設管理ダッシュボード', section: 'dashboard', requiredLevel: 4, exactLevel: true },
    // レベル5以上は統合ダッシュボードを使用
    { id: 'dashboard-integrated', path: '/dashboard/integrated-corporate', icon: '🏢', label: '法人統合ダッシュボード', section: 'dashboard', requiredLevel: 5 },
    
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
    { id: 'interview_management', path: '/interview-management', icon: '📅', label: '面談管理', section: 'hr', requiredLevel: 5 },
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
    { id: 'user_analysis', path: '/user-analysis', icon: '👤', label: 'ユーザー分析', section: 'facility', requiredLevel: 7 },
    { id: 'generational_analysis', path: '/generational-analysis', icon: '👥', label: '世代間分析（全体）', section: 'facility', requiredLevel: 7 },
    { id: 'hierarchical_analysis', path: '/hierarchical-analysis', icon: '🏢', label: '階層間分析（全体）', section: 'facility', requiredLevel: 7 },
    { id: 'professional_analysis', path: '/professional-analysis', icon: '👩‍⚕️', label: '職種間分析（全体）', section: 'facility', requiredLevel: 7 },
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
    { id: 'progressive-visibility', path: '/demo/progressive-visibility', icon: '👁️', label: '段階的公開デモ', section: 'tools' },
    
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
        const nextItems = array.slice(index + 1, index + 5); // 次の5項目（ダッシュボード）をチェック
        const userLevel = currentUser?.permissionLevel || 1;
        return nextItems.some(nextItem => {
          if (nextItem.section !== 'dashboard') return false;
          // exactLevelがある場合は完全一致
          if (nextItem.exactLevel) {
            return nextItem.requiredLevel === userLevel;
          }
          // それ以外は最低レベル以上
          return nextItem.requiredLevel && userLevel >= nextItem.requiredLevel;
        });
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
                {item?.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
    </div>
  );
};

export default Sidebar;