import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainTab } from '../../types/tabs';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { NotificationService } from '../../services/NotificationService';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// メインタブの定義（基本タブ）
const baseTabs: MainTab[] = [
  { id: 'improvement', label: 'アイデアボイス', icon: '💡', hasSubFilters: true },
  { id: 'freevoice', label: 'フリーボイス', icon: '💬', hasSubFilters: true },
  { id: 'whistleblowing', label: 'コンプライアンス窓口', icon: '🚨', hasSubFilters: true }
];

// 権限者向け専用タブ
const authorityTab: MainTab = {
  id: 'approvals',
  label: '承認・対応',
  icon: '📋',
  hasSubFilters: true,
  requiresPermission: true
};

export const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const notificationService = NotificationService.getInstance();
  
  // 権限を持っているかチェック
  const hasApprovalPermissions = hasAnyPermission([
    'APPROVAL_MANAGEMENT',
    'EMERGENCY_AUTHORITY',
    'WEIGHT_ADJUSTMENT',
    'PROJECT_MANAGEMENT',
    'MEMBER_SELECTION'
  ]);
  
  // 動的にタブを生成
  const mainTabs = React.useMemo(() => {
    const tabs = [...baseTabs];
    
    // 権限者のみ承認・対応タブを表示
    if (hasApprovalPermissions) {
      tabs.push(authorityTab);
    }
    
    return tabs;
  }, [hasApprovalPermissions]);
  
  // 通知統計を取得
  const [notificationStats, setNotificationStats] = React.useState<{ pending: number } | null>(null);
  
  React.useEffect(() => {
    if (!currentUser) return;
    
    const updateStats = () => {
      const stats = notificationService.getUserNotificationStats(currentUser.id);
      setNotificationStats({ pending: stats.pending });
    };
    
    updateStats();
    const unsubscribe = notificationService.subscribeToNotifications((userId) => {
      if (userId === currentUser.id) {
        updateStats();
      }
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  const handleTabClick = (tabId: string) => {
    if (tabId === 'whistleblowing') {
      // コンプライアンス窓口は専用ページに遷移
      navigate('/whistleblowing');
    } else if (tabId === 'approvals') {
      // 承認・対応ページに遷移
      navigate('/approvals');
    } else {
      // その他のタブはホームページのタブ切り替え
      navigate(`/?tab=${tabId}`);
    }
    onTabChange(tabId);
  };

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-700/50">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex-1 sm:flex-initial flex items-center justify-center gap-2 
              px-4 py-3 min-w-0
              whitespace-nowrap transition-all duration-200
              relative group
              ${activeTab === tab.id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <span className="text-lg sm:text-base">{tab?.icon}</span>
            <span className="text-sm sm:text-base font-medium">
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === 'improvement' ? 'アイデア' : 
                 tab.id === 'freevoice' ? 'フリー' : 
                 tab.id === 'whistleblowing' ? 'コンプラ' : 
                 tab.label}
              </span>
              {tab.id === 'approvals' && notificationStats?.pending && notificationStats.pending > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {notificationStats.pending}
                </span>
              )}
            </span>
            
            {/* アクティブインジケーター */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400" />
            )}
            
            {/* ホバーエフェクト */}
            <div className={`
              absolute bottom-0 left-0 right-0 h-0.5 
              bg-gray-600 transform scale-x-0 
              group-hover:scale-x-100 transition-transform duration-200
              ${activeTab === tab.id ? 'hidden' : ''}
            `} />
          </button>
        ))}
      </div>
    </div>
  );
};

// エクスポート用にmainTabsを生成（権限チェックなし版）
export { baseTabs as mainTabs };