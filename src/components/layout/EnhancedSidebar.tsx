import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';
import { useUserPermission } from '../../hooks/useUserPermission';
import { MENU_STRUCTURE, MENU_VISIBILITY } from '../../config/menuConfig';
import { MenuItem, MenuCategory } from '../../types/menuTypes';
import { PermissionLevel, SpecialPermissionLevel } from '../../permissions/types/PermissionTypes';
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
  const { userLevel: oldPermissionLevel } = usePermissions();
  const { isDemoMode, currentUser } = useDemoMode();
  const [expandedCategories, setExpandedCategories] = useState<Set<MenuCategory>>(() => new Set(['station']));
  const [ideaVoiceExpanded, setIdeaVoiceExpanded] = useState(false);

  // UserPermissionフックを安全に使用
  let permission = {
    level: null as any,
    calculatedLevel: 1,
    levelDescription: ''
  };

  try {
    const userPermission = useUserPermission();
    permission = { ...permission, ...userPermission };
  } catch (error) {
    // UserProviderが存在しない場合はデフォルト値を使用
  }

  // 旧13段階から新18段階へのマッピング
  const mapOldLevelToNew = (oldLevel: number): PermissionLevel | SpecialPermissionLevel => {
    const mapping: { [key: number]: PermissionLevel | SpecialPermissionLevel } = {
      1: PermissionLevel.LEVEL_2,    // 一般職員 → 若手
      2: PermissionLevel.LEVEL_6,    // 主任
      3: PermissionLevel.LEVEL_8,    // 師長
      4: PermissionLevel.LEVEL_10,   // 部長・課長
      5: PermissionLevel.LEVEL_11,   // 事務長
      6: PermissionLevel.LEVEL_12,   // 副院長
      7: PermissionLevel.LEVEL_13,   // 院長
      8: PermissionLevel.LEVEL_14,   // 人事部門員
      9: PermissionLevel.LEVEL_15,   // キャリア支援
      10: PermissionLevel.LEVEL_16,  // 各部門長
      11: PermissionLevel.LEVEL_17,  // 統括管理部門長
      12: PermissionLevel.LEVEL_18,  // 理事長
      13: SpecialPermissionLevel.LEVEL_X // システム管理者
    };
    return mapping[oldLevel] || PermissionLevel.LEVEL_1;
  };

  const userPermissionLevel = permission.level || mapOldLevelToNew(oldPermissionLevel);

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
    if (permission.levelDescription) {
      return permission.levelDescription;
    }

    const levelNames: { [key: number | string]: string } = {
      1: '新人（1年目）',
      1.5: '新人看護師（リーダー可）',
      2: '若手（2-3年目）',
      2.5: '若手看護師（リーダー可）',
      3: '中堅（4-10年目）',
      3.5: '中堅看護師（リーダー可）',
      4: 'ベテラン（11年以上）',
      4.5: 'ベテラン看護師（リーダー可）',
      5: '副主任',
      6: '主任',
      7: '副師長・副科長・副課長',
      8: '師長・科長・課長・室長',
      9: '副部長',
      10: '部長・医局長',
      11: '事務長',
      12: '副院長',
      13: '院長・施設長',
      14: '人事部門員',
      15: '人事各部門長',
      16: '戦略企画・統括管理部門員',
      17: '戦略企画・統括管理部門長',
      18: '理事長・法人事務局長',
      'X': 'システム管理者'
    };

    return levelNames[userPermissionLevel as keyof typeof levelNames] || `レベル${userPermissionLevel}`;
  };

  return (
    <div className="w-80 bg-slate-800/95 backdrop-blur-xl shadow-lg h-full flex flex-col border-r border-slate-700/50 relative">
      {/* ユーザー情報（上部） */}
      <div 
        className="p-4 hover:bg-slate-700/30 transition-colors cursor-pointer border-b border-slate-700/50"
        onClick={() => onNavigate('/profile')}
      >
        {isDemoMode ? (
          <div className="flex items-center gap-3">
            <Avatar 
              avatarData={generatePersonalAvatar(currentUser)}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
                <span className="text-xs text-slate-500">Lv.{currentUser.permissionLevel}</span>
              </div>
              <div className="text-xs text-slate-400 truncate">@{currentUser.position.replace(/\s+/g, '_').toLowerCase()}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">VoiceDrive User</div>
              <div className="text-xs text-slate-400">@voicedrive_user</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>


      {/* ステーション系メニュー（上部） */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="space-y-1">
          {/* パーソナルステーション */}
          <button
            onClick={() => onNavigate('/personal-station')}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
              transition-all duration-150
              ${currentPath === '/personal-station'
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }
            `}
          >
            <span className="text-base">🏠</span>
            <span>パーソナルステーション</span>
          </button>

          {/* 面談ステーション（変更不可） */}
          <button
            onClick={() => onNavigate('/interview-station')}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
              transition-all duration-150
              ${currentPath.startsWith('/interview-station')
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }
            `}
          >
            <span className="text-base">📅</span>
            <span>面談ステーション</span>
          </button>

          {/* 評価ステーション（変更不可） */}
          <button
            onClick={() => onNavigate('/evaluation-station')}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
              transition-all duration-150
              ${currentPath.startsWith('/evaluation-station')
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }
            `}
          >
            <span className="text-base">⭐</span>
            <span>評価ステーション</span>
          </button>

          {/* アイデアボイスハブ（新規追加） */}
          <div>
            <button
              onClick={() => setIdeaVoiceExpanded(!ideaVoiceExpanded)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-md text-sm
                transition-all duration-150
                ${currentPath.startsWith('/idea-voice')
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">💡</span>
                <span>アイデアボイスハブ</span>
              </div>
              {ideaVoiceExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {ideaVoiceExpanded && (
              <div className="ml-8 mt-1 space-y-1">
                <button
                  onClick={() => onNavigate('/idea-voice/new')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded flex items-center gap-2"
                >
                  <span>📝</span> 新規投稿
                </button>
                <button
                  onClick={() => onNavigate('/idea-voice/vote')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded flex items-center gap-2"
                >
                  <span>🗳️</span> 投票
                </button>
                <button
                  onClick={() => onNavigate('/idea-voice/progress')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded flex items-center gap-2"
                >
                  <span>📊</span> 議題進捗
                </button>

                {/* レベル5以上：議題提案書作成 */}
                {(permission.calculatedLevel >= 5 || oldPermissionLevel >= 2) && (
                  <button
                    onClick={() => onNavigate('/idea-voice/proposal')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded flex items-center gap-2"
                  >
                    <span>📄</span> 議題提案書作成
                  </button>
                )}

                {/* レベル3.5以上：投票分析 */}
                {(permission.calculatedLevel >= 3.5 || oldPermissionLevel >= 2) && (
                  <button
                    onClick={() => onNavigate('/idea-voice/analytics')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded flex items-center gap-2"
                  >
                    <span>📈</span> 投票分析
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メニューセクション */}
      <div className="flex-1 overflow-y-auto p-4 pb-40 space-y-2">
        {/* その他のカテゴリメニュー（ステーション系は上部に移動済み） */}

        {/* 管理機能 - レベル5以上（副主任以上） */}
        {((typeof userPermissionLevel === 'number' && userPermissionLevel >= 5) ||
          oldPermissionLevel >= 2) && renderCategory('management')}

        {/* 人事機能 - レベル14以上（人事部門員以上） */}
        {((typeof userPermissionLevel === 'number' && userPermissionLevel >= 14) ||
          oldPermissionLevel >= 8) && renderCategory('hr')}

        {/* 戦略的人事機能 - レベル16以上（戦略企画部門員以上） */}
        {((typeof userPermissionLevel === 'number' && userPermissionLevel >= 16) ||
          oldPermissionLevel >= 10) && renderCategory('strategic_hr')}

        {/* 施設管理機能 - レベル9以上（副部長以上） */}
        {((typeof userPermissionLevel === 'number' && userPermissionLevel >= 9) ||
          oldPermissionLevel >= 4) && renderCategory('facility')}

        {/* 分析機能 - レベル5以上（副主任以上の管理職） */}
        {((typeof userPermissionLevel === 'number' && userPermissionLevel >= 5) ||
          oldPermissionLevel >= 2) && renderCategory('analytics')}

        {/* 経営機能 - レベル12以上（副院長以上） */}
        {((typeof userPermissionLevel === 'number' && userPermissionLevel >= 12) ||
          oldPermissionLevel >= 6) && renderCategory('executive')}
      </div>

      {/* システム機能（下部固定） */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1 border-t border-slate-700/50 bg-slate-800/95 backdrop-blur-xl">
        <button
          onClick={() => onNavigate('/interview-guide')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
            transition-all duration-150
            ${currentPath === '/interview-guide'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }
          `}
        >
          <span className="text-base">📅</span>
          <span>面談予約ガイド</span>
        </button>
        <button
          onClick={() => onNavigate('/compliance-guide')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
            transition-all duration-150
            ${currentPath === '/compliance-guide'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }
          `}
        >
          <span className="text-base">🛡️</span>
          <span>コンプライアンス窓口</span>
        </button>
        <button
          onClick={() => onNavigate('/idea-voice-guide')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
            transition-all duration-150
            ${currentPath === '/idea-voice-guide'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }
          `}
        >
          <span className="text-base">💡</span>
          <span>アイデアボイスガイド</span>
        </button>
        <button
          onClick={() => onNavigate('/free-voice-guide')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
            transition-all duration-150
            ${currentPath === '/free-voice-guide'
              ? 'bg-green-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }
          `}
        >
          <span className="text-base">💬</span>
          <span>フリーボイスガイド</span>
        </button>
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

    </div>
  );
};