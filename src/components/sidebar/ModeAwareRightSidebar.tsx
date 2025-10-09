import React, { useState, useEffect } from 'react';
import { systemModeManager, SystemMode } from '../../config/systemMode';
import AgendaModeSidebar from './AgendaModeSidebar';
import ProjectModeSidebar from './ProjectModeSidebar';
import { ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

/**
 * システムモードに応じて適切なサイドバーを表示する統合コンポーネント
 */
const ModeAwareRightSidebar: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<SystemMode>(systemModeManager.getCurrentMode());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modeDescription, setModeDescription] = useState('');

  useEffect(() => {
    // 初期モードの説明を設定
    const description = systemModeManager.getModeDescription();
    setModeDescription(description);

    // モード変更リスナーを登録
    const handleModeChange = (newMode: SystemMode) => {
      console.log('[ModeAwareRightSidebar] モード変更検出:', currentMode, '→', newMode);
      setCurrentMode(newMode);
      setModeDescription(systemModeManager.getModeDescription());
    };

    systemModeManager.addModeChangeListener(handleModeChange);

    // クリーンアップ時にリスナーを削除
    return () => {
      systemModeManager.removeModeChangeListener(handleModeChange);
    };
  }, []);

  // サイドバーの折りたたみ切り替え
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // モードインジケーター
  const ModeIndicator = () => (
    <div className="mb-4 p-3 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {currentMode === SystemMode.AGENDA ? (
            <ToggleLeft className="w-5 h-5 text-indigo-400" />
          ) : (
            <ToggleRight className="w-5 h-5 text-orange-400" />
          )}
          <span className="text-xs font-bold text-white">
            {currentMode === SystemMode.AGENDA ? '議題モード' : 'プロジェクトモード'}
          </span>
        </div>
        <button
          onClick={toggleCollapse}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">
        {currentMode === SystemMode.AGENDA
          ? '委員会活性化・声を上げる文化'
          : 'チーム編成・組織一体感の向上'}
      </p>
    </div>
  );

  // 折りたたみ状態の表示
  if (isCollapsed) {
    return (
      <div className="w-16 h-full p-2 flex flex-col items-center">
        <button
          onClick={toggleCollapse}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors mb-4"
          aria-label="サイドバーを展開"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex flex-col gap-4 items-center">
          {currentMode === SystemMode.AGENDA ? (
            <>
              <div className="relative group">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-400">議</span>
                </div>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    議題モード
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative group">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-400">PJ</span>
                </div>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    プロジェクトモード
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 通常表示
  return (
    <div className="w-full h-full flex flex-col">
      {/* モードインジケーター */}
      <div className="px-4 pt-4">
        <ModeIndicator />
      </div>

      {/* モードに応じたサイドバーコンテンツ */}
      <div className="flex-1 overflow-hidden">
        {currentMode === SystemMode.AGENDA ? (
          <AgendaModeSidebar />
        ) : (
          <ProjectModeSidebar />
        )}
      </div>

      {/* モード切り替えヒント（管理者のみ表示する場合） */}
      {/* TODO: ユーザーの権限レベルをチェックして、レベルXのみに表示 */}
      {false && (
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-gray-500 text-center">
            モード切り替えは管理者設定から
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeAwareRightSidebar;