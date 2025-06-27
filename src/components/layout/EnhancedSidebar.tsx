import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';
import { MENU_STRUCTURE, MENU_VISIBILITY } from '../../config/menuConfig';
import { MenuItem, MenuCategory } from '../../types/menuTypes';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';
import { EnhancedSidebarMenuItem } from './EnhancedSidebarMenuItem';
import Avatar from '../common/Avatar';
import { generatePersonalAvatar } from '../../utils/avatarGenerator';
import { 
  ChevronDown, 
  ChevronRight, 
  Home, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Heart,
  UserCheck,
  Target,
  Building,
  TrendingUp,
  Crown,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';

interface EnhancedSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const categoryIcons: Record<MenuCategory, React.ComponentType<any>> = {
  station: Home,
  management: Settings,
  hr: UserCheck,
  strategic_hr: Target,
  facility: Building,
  analytics: BarChart3,
  executive: Crown
};

const categoryLabels: Record<MenuCategory, string> = {
  station: 'ステーション',
  management: '管理機能',
  hr: '人事機能',
  strategic_hr: '戦略的人事',
  facility: '施設管理',
  analytics: '分析機能',
  executive: '経営機能'
};

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ currentPath, onNavigate }) => {
  console.log('🚨 EnhancedSidebar: コンポーネント初期化開始');
  console.log('🚨 EnhancedSidebar: currentPath =', currentPath);
  
  const { userLevel: userPermissionLevel } = usePermissions();
  const { isDemoMode, currentUser } = useDemoMode();
  const [expandedCategories, setExpandedCategories] = useState<Set<MenuCategory>>(() => new Set(['station']));
  
  console.log('🚨 EnhancedSidebar: userPermissionLevel =', userPermissionLevel);
  console.log('🚨 EnhancedSidebar: isDemoMode =', isDemoMode);
  console.log('🚨 EnhancedSidebar: currentUser =', currentUser);

  const toggleCategory = (category: MenuCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getVisibleMenuItems = (category: MenuCategory): MenuItem[] => {
    const visibility = MENU_VISIBILITY[userPermissionLevel];
    if (!visibility || !visibility[category]) return [];

    const visibleItemKeys = visibility[category];
    const categoryMenu = MENU_STRUCTURE[category];
    
    return visibleItemKeys
      .map(key => {
        const item = categoryMenu[key];
        if (!item) return null;
        // Ensure we have a title property for the sidebar menu item
        const mappedItem = {
          ...item,
          title: item.label // Use label as title for display
        };
        
        // Map children if they exist
        if (item.children) {
          mappedItem.children = item.children.map(child => ({
            ...child,
            title: child.label,
            icon: child.icon || '📄' // Default icon for children without icons
          }));
        }
        
        return mappedItem;
      })
      .filter(item => item && item.requiredLevel <= userPermissionLevel);
  };


  const renderCategory = (category: MenuCategory) => {
    const menuItems = getVisibleMenuItems(category);
    if (menuItems.length === 0) return null;

    const isExpanded = expandedCategories.has(category);
    const CategoryIcon = categoryIcons[category];

    return (
      <div key={category} className="mb-4">
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4" />
            <span>{categoryLabels[category]}</span>
          </div>
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {menuItems.map(item => (
              <EnhancedSidebarMenuItem
                key={item.id}
                item={item}
                depth={0}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const getPermissionLevelDisplay = () => {
    const levelNames = {
      1: '一般職員',
      2: '主任', 
      3: '師長',
      4: '部長・課長',
      5: '事務長',
      6: '副院長',
      7: '院長・施設長',
      8: '人財統括本部事務員',
      9: '人財統括本部キャリア支援部門員',
      10: '人財統括本部各部門長',
      11: '人財統括本部統括管理部門長',
      12: '厚生会本部統括事務局長',
      13: '理事長'
    };
    
    return levelNames[userPermissionLevel as keyof typeof levelNames] || `レベル${userPermissionLevel}`;
  };

  console.log('🚨 EnhancedSidebar: レンダリング開始');
  
  return (
    <div className="w-80 bg-slate-800/95 backdrop-blur-xl shadow-lg h-full flex flex-col border-r border-slate-700/50">
      {console.log('🚨 EnhancedSidebar: DOMレンダリング実行中')}
      {/* ヘッダー */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">VoiceDrive</h2>
            <p className="text-xs text-slate-400">{getPermissionLevelDisplay()}</p>
          </div>
        </div>
      </div>

      {/* メニューセクション */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* ステーション系 */}
        {renderCategory('station')}
        
        {/* 管理機能 */}
        {userPermissionLevel >= 2 && renderCategory('management')}
        
        {/* 人事機能 */}
        {userPermissionLevel >= 8 && renderCategory('hr')}
        
        {/* 戦略的人事機能 */}
        {userPermissionLevel >= 10 && renderCategory('strategic_hr')}
        
        {/* 施設管理機能 */}
        {userPermissionLevel >= 5 && renderCategory('facility')}
        
        {/* 分析機能 */}
        {userPermissionLevel >= 3 && renderCategory('analytics')}
        
        {/* 経営機能 */}
        {userPermissionLevel >= 11 && renderCategory('executive')}
      </div>

      {/* システム機能 */}
      <div className="p-4 space-y-1 border-t border-slate-700/50">
        <button
          onClick={() => onNavigate('/notifications')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
            transition-all duration-150
            ${currentPath === '/notifications' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }
          `}
        >
          <Bell className="w-4 h-4" />
          <span>通知</span>
        </button>
        <button
          onClick={() => onNavigate('/settings')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
            transition-all duration-150
            ${currentPath === '/settings' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }
          `}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>設定</span>
        </button>
      </div>

      {/* フッター情報 */}
      <div className="p-4 border-t border-slate-700/50 mt-auto">
        <div className="text-xs text-slate-400 space-y-1">
          <div>権限レベル: {userPermissionLevel}/13</div>
          <div>アクセス可能機能: {Object.values(MENU_STRUCTURE).flatMap(category => 
            Object.values(category).filter(item => item.requiredLevel <= userPermissionLevel)
          ).length}件</div>
        </div>
      </div>

      {/* ユーザー情報（最下部） */}
      <div className="p-4">
        {console.log('🔧 EnhancedSidebar: isDemoMode =', isDemoMode)}
        {console.log('🔧 EnhancedSidebar: currentUser =', currentUser)}
        <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur">
          {console.log('🚨 EnhancedSidebar: プロフィール表示判定 isDemoMode =', isDemoMode)}
          {console.log('🚨 EnhancedSidebar: currentUser詳細 =', JSON.stringify(currentUser, null, 2))}
          {isDemoMode ? (
            <>
              {console.log('🚨 EnhancedSidebar: デモモードプロフィール表示実行')}
              {currentUser ? (
                <>
                  {console.log('🚨 EnhancedSidebar: currentUser存在確認OK')}
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar 
                      avatarData={generatePersonalAvatar(currentUser)}
                      size="sm"
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
                </>
              ) : (
                <>
                  {console.log('🚨 EnhancedSidebar: currentUserが存在しません')}
                  <div className="text-white text-sm">デモユーザー読み込み中...</div>
                </>
              )}
            </>
          ) : (
            <>
              {console.log('🔧 EnhancedSidebar: 非デモモード表示実行')}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">V</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">VoiceDrive User</div>
                  <div className="text-xs text-gray-400">権限レベル {userPermissionLevel}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};