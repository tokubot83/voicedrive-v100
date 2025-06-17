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
  { id: 'home', label: 'ホーム', icon: '🏠', hasSubFilters: false },
  { id: 'improvement', label: 'アイデアボイス', icon: '💡', hasSubFilters: true },
  { id: 'community', label: 'フリーボイス', icon: '💬', hasSubFilters: true },
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
    } else if (tabId === 'home') {
      // ホームページに遷移
      navigate('/');
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
    <div className="flex justify-center items-center">
      <div className="flex overflow-x-auto scrollbar-hide">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 
              whitespace-nowrap transition-all duration-200
              relative group
              ${activeTab === tab.id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <span className="text-lg">{tab?.icon}</span>
            <span className="hidden sm:inline font-medium">
              {tab.label}
              {tab.id === 'approvals' && notificationStats?.pending && notificationStats.pending > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {notificationStats.pending}
                </span>
              )}
            </span>
            
            {/* アクティブインジケーター */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
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