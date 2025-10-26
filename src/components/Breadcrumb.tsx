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
  '/dashboard/executive': '経営ダッシュボード',
  '/team-management': 'チーム管理',
  '/authority': '権限管理',
  '/hr-dashboard': '人事ダッシュボード',
  '/strategic-planning': '戦略的人事計画',
  '/org-development': '組織開発',
  '/strategic-overview': '戦略概要',
  '/analytics': '分析',
  '/strategic-hr-plan': '戦略HR計画',
  '/executive-reports': 'エグゼクティブレポート',
  '/board-preparation': '理事会準備',
  '/corporate-agenda-dashboard': '法人全体議題化ダッシュボード',
  '/cross-facility-analysis': '施設横断課題分析',
  '/board-agenda-review': '理事会議題確認',
  '/board-decision-follow': '理事会決定事項フォロー',
  '/strategic-initiatives': '戦略イニシアチブ',
  '/organization-analytics': '組織分析',
  '/notifications': '通知',
  '/settings': '設定',
  '/demo/time-axis': '時間管理',
  '/demo/hierarchy': '階層デモ',
  '/demo/unified-status': '統一ステータス',
};

const Breadcrumb = () => {
  const location = useLocation();
  const { isDemoMode } = useDemoMode();

  // Don't show breadcrumb on home page, hr-announcements page, stress-check-demo page, and settings page
  if (location.pathname === '/' || location.pathname === '/hr-announcements' || location.pathname === '/stress-check-demo' || location.pathname === '/settings') {
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
    <nav className={`px-6 py-3 text-sm border-b border-slate-700/50 ${isDemoMode ? 'mt-4' : 'mt-4'}`}>
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