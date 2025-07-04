import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useDemoMode } from './demo/DemoModeController';

interface BreadcrumbItem {
  path: string;
  label: string;
}

const pathNameMap: Record<string, string> = {
  '/': 'ホーム',
  '/profile': 'プロフィール',
  '/projects': 'プロジェクト一覧',
  '/dashboard/personal': 'マイダッシュボード',
  '/dashboard/team-leader': '現場リーダーダッシュボード',
  '/dashboard/department': '部門管理ダッシュボード',
  '/dashboard/facility': '施設管理ダッシュボード',
  '/dashboard/hr-management': '人事統括ダッシュボード',
  '/dashboard/strategic': '戦略企画ダッシュボード',
  '/dashboard/corporate': '法人統括ダッシュボード',
  '/dashboard/executive': '経営ダッシュボード',
  '/team-management': 'チーム管理',
  '/department-overview': '部門概要',
  '/budget': '予算管理',
  '/authority': '権限管理',
  '/hr-dashboard': '人事ダッシュボード',
  '/policy': 'ポリシー管理',
  '/talent': 'タレント分析',
  '/strategic-planning': '戦略的人事計画',
  '/org-development': '組織開発',
  '/performance': 'パフォーマンス分析',
  '/facility-management': '施設管理',
  '/strategic-overview': '戦略概要',
  '/budget-planning': '予算計画',
  '/analytics': '分析',
  '/executive-reports': 'エグゼクティブレポート',
  '/executive-overview': '経営概要',
  '/strategic-initiatives': '戦略イニシアチブ',
  '/organization-analytics': '組織分析',
  '/board-reports': '理事会レポート',
  '/governance': 'ガバナンス',
  '/notifications': '通知',
  '/settings': '設定',
  '/demo/time-axis': '時間管理',
  '/demo/hierarchy': '階層デモ',
  '/demo/unified-status': '統一ステータス',
};

const Breadcrumb = () => {
  const location = useLocation();
  const { isDemoMode } = useDemoMode();
  
  // Don't show breadcrumb on home page
  if (location.pathname === '/') {
    return null;
  }
  
  // Generate breadcrumb items from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems: BreadcrumbItem[] = [
    { path: '/', label: 'ホーム' }
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = pathNameMap[currentPath] || segment;
    breadcrumbItems.push({ path: currentPath, label });
  });
  
  return (
    <nav className={`px-6 py-3 text-sm border-b border-slate-700/50 ${isDemoMode ? 'mt-[120px] md:mt-[60px]' : 'mt-8 md:mt-0'}`}>
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-gray-500" />
            )}
            {index === breadcrumbItems.length - 1 ? (
              <span className="text-gray-400">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;