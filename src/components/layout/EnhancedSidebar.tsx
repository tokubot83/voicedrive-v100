import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../demo/DemoModeController';
import { useUserPermission } from '../../hooks/useUserPermission';
import { MenuItem } from '../../types/sidebar';
import { EnhancedSidebarMenuItem } from './EnhancedSidebarMenuItem';
import Avatar from '../common/Avatar';
import { generatePersonalAvatar } from '../../utils/avatarGenerator';
import { systemModeManager, SystemMode } from '../../config/systemMode';
import { getAgendaMenuItems } from '../../config/agendaMenuConfig';
import { getProjectMenuItems } from '../../config/projectMenuConfig';
import { useSidebarMenuConfigs, useDeviceType, filterConfigsByDevice } from '../../hooks/useSidebarMenuConfigs';
import { ChevronRight } from 'lucide-react';

interface EnhancedSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ currentPath, onNavigate }) => {
  const { isDemoMode, currentUser } = useDemoMode();
  const [currentMode, setCurrentMode] = useState<SystemMode>(systemModeManager.getCurrentMode());
  const [modeMenuItems, setModeMenuItems] = useState<MenuItem[]>([]);

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

  // ユーザーの権限レベルを決定
  const userPermissionLevel = permission.calculatedLevel || currentUser?.permissionLevel || 1;

  // デバイスタイプ取得
  const deviceType = useDeviceType();

  // 共通メニュー設定をDBから取得
  const { configs: commonMenuConfigs, loading: commonMenuLoading } = useSidebarMenuConfigs({
    category: 'common',
    permissionLevel: userPermissionLevel,
  });

  // デバイスタイプでフィルタリング
  const filteredCommonMenus = filterConfigsByDevice(commonMenuConfigs, deviceType);

  // モード変更を監視してメニュー項目を更新
  useEffect(() => {
    const updateMenuItems = (mode: SystemMode) => {
      console.log('[EnhancedSidebar] メニュー更新: mode=', mode);

      // モード別メニュー項目を取得
      const modeItems = mode === SystemMode.AGENDA
        ? getAgendaMenuItems(userPermissionLevel)
        : getProjectMenuItems(userPermissionLevel);

      setModeMenuItems(modeItems);
    };

    // 初回実行
    const initialMode = systemModeManager.getCurrentMode();
    setCurrentMode(initialMode);
    updateMenuItems(initialMode);

    // モード変更リスナーを登録
    const handleModeChange = (newMode: SystemMode) => {
      console.log('[EnhancedSidebar] モード変更検出:', currentMode, '→', newMode);
      setCurrentMode(newMode);
      updateMenuItems(newMode);
    };

    systemModeManager.addModeChangeListener(handleModeChange);

    // クリーンアップ時にリスナーを削除
    return () => {
      systemModeManager.removeModeChangeListener(handleModeChange);
    };
  }, [userPermissionLevel, currentMode]);

  // モード表示名
  const getModeLabel = () => {
    return currentMode === SystemMode.AGENDA ? '📋 議題モード' : '🚀 プロジェクト化モード';
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

  // モバイル判定
  const isMobile = deviceType === 'mobile';

  return (
    <div className={`
      w-80 bg-slate-800/95 backdrop-blur-xl shadow-lg flex flex-col border-r border-slate-700/50
      ${isMobile ? 'h-[calc(100vh-64px)]' : 'h-full'}
    `}>
      {/* ユーザー情報（上部） */}
      <div
        className="p-4 hover:bg-slate-700/30 transition-colors cursor-pointer border-b border-slate-700/50 flex-shrink-0"
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

      {/* モード表示（上部） */}
      <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-900/50 flex-shrink-0">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {getModeLabel()}
        </div>
      </div>

      {/* メニューセクション */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {/* モード別メニュー */}
        {modeMenuItems.map(item => (
          <EnhancedSidebarMenuItem
            key={item.id}
            item={item}
            depth={0}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {/* 共通メニュー（下部） - DB駆動 */}
      <div className="border-t border-slate-700/50 bg-slate-800/95 backdrop-blur-xl flex-shrink-0 max-h-[40vh] overflow-y-auto">
        <div className="p-4 space-y-1">
          {!commonMenuLoading && filteredCommonMenus.map((config) => (
          <button
            key={config.id}
            onClick={() => onNavigate(config.path)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
              transition-all duration-150
              ${currentPath === config.path
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }
            `}
            title={config.description || config.label}
          >
            <span className="text-base">{config.icon}</span>
            <span className="flex-1 text-left">{config.label}</span>
            {config.showNewBadge && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">NEW</span>
            )}
            {config.showBadge && config.badgeType === 'count' && (
              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                3
              </span>
            )}
          </button>
        ))}
        </div>
      </div>

    </div>
  );
};