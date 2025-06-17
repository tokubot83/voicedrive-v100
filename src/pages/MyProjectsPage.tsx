import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Clock, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Project, ProjectStatus } from '../data/demo/projects';
import { demoProjects } from '../data/demo/projects';
import { getDemoUserById } from '../data/demo/users';
import { useDemoMode } from '../components/demo/DemoModeController';

interface ProjectGroup {
  title: string;
  description: string;
  projects: Project[];
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

const MyProjectsPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Safe demo mode hook usage
  let demoUser = null;
  try {
    const demoMode = useDemoMode();
    demoUser = demoMode?.currentUser;
  } catch (error) {
    // Demo mode provider not available, use auth user only
    console.log('Demo mode not available, using auth user');
  }
  
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'proposed' | 'approving' | 'participating' | 'provisional'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeUser = demoUser || currentUser;

  useEffect(() => {
    if (!activeUser) return;

    // 提案したプロジェクト
    const proposedProjects = demoProjects.filter(p => p.initiator === activeUser.id);
    
    // 承認待ちプロジェクト（自分が承認者）
    const approvingProjects = demoProjects.filter(p => 
      p.workflows.some(w => 
        w.approver === activeUser.id && 
        w.status === 'in-progress'
      )
    );
    
    // 参加中プロジェクト
    const participatingProjects = demoProjects.filter(p => 
      p.teamMembers.includes(activeUser.id) && 
      p.status !== 'completed' && 
      p.status !== 'rejected'
    );
    
    // 仮選出中プロジェクト
    const provisionalProjects = demoProjects.filter(p => 
      p.provisionalMembers?.includes(activeUser.id) && 
      p.memberSelectionStatus === 'in-progress'
    );

    const groups: ProjectGroup[] = [
      {
        title: '提案したプロジェクト',
        description: '自分が提案したプロジェクトの一覧',
        projects: proposedProjects,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ),
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        title: '承認待ちプロジェクト',
        description: '自分の承認が必要なプロジェクト',
        projects: approvingProjects,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      {
        title: '参加中プロジェクト',
        description: '正式メンバーとして参加しているプロジェクト',
        projects: participatingProjects,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        title: '仮選出中プロジェクト',
        description: 'メンバー候補として選出されているプロジェクト',
        projects: provisionalProjects,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      }
    ];

    setProjectGroups(groups);
  }, [activeUser]);

  const getStatusBadge = (status: ProjectStatus) => {
    const badges = {
      'draft': { text: '下書き', className: 'bg-gray-100 text-gray-700' },
      'submitted': { text: '申請中', className: 'bg-blue-100 text-blue-700' },
      'reviewing': { text: '審査中', className: 'bg-yellow-100 text-yellow-700' },
      'approved': { text: '承認済', className: 'bg-green-100 text-green-700' },
      'in-progress': { text: '進行中', className: 'bg-indigo-100 text-indigo-700' },
      'completed': { text: '完了', className: 'bg-gray-100 text-gray-700' },
      'rejected': { text: '却下', className: 'bg-red-100 text-red-700' },
      'member-selection': { text: 'メンバー選出中', className: 'bg-purple-100 text-purple-700' },
      'approval-pending': { text: '承認待ち', className: 'bg-orange-100 text-orange-700' }
    };

    const badge = badges[status] || badges.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const getFilteredGroups = () => {
    switch (selectedTab) {
      case 'proposed':
        return projectGroups.filter(g => g.title === '提案したプロジェクト');
      case 'approving':
        return projectGroups.filter(g => g.title === '承認待ちプロジェクト');
      case 'participating':
        return projectGroups.filter(g => g.title === '参加中プロジェクト');
      case 'provisional':
        return projectGroups.filter(g => g.title === '仮選出中プロジェクト');
      default:
        return projectGroups;
    }
  };

  const filteredGroups = getFilteredGroups();
  const totalProjects = projectGroups.reduce((sum, group) => sum + group.projects.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* Header */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">ホーム</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">マイプロジェクト</h1>
              <p className="text-gray-400 text-sm">あなたが関わっているプロジェクトの一覧です</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">提案済み</p>
                <p className="text-2xl font-bold text-white">{projectGroups.find(g => g.title === '提案したプロジェクト')?.projects.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-gray-400 text-sm">承認待ち</p>
                <p className="text-2xl font-bold text-white">{projectGroups.find(g => g.title === '承認待ちプロジェクト')?.projects.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">参加中</p>
                <p className="text-2xl font-bold text-white">{projectGroups.find(g => g.title === '参加中プロジェクト')?.projects.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">仮選出中</p>
                <p className="text-2xl font-bold text-white">{projectGroups.find(g => g.title === '仮選出中プロジェクト')?.projects.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="プロジェクトを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6 border-b border-slate-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              すべて ({totalProjects})
            </button>
          {projectGroups.map(group => (
            <button
              key={group.title}
              onClick={() => setSelectedTab(
                group.title === '提案したプロジェクト' ? 'proposed' :
                group.title === '承認待ちプロジェクト' ? 'approving' :
                group.title === '参加中プロジェクト' ? 'participating' :
                'provisional'
              )}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                (selectedTab === 'proposed' && group.title === '提案したプロジェクト') ||
                (selectedTab === 'approving' && group.title === '承認待ちプロジェクト') ||
                (selectedTab === 'participating' && group.title === '参加中プロジェクト') ||
                (selectedTab === 'provisional' && group.title === '仮選出中プロジェクト')
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {group.title} ({group.projects.length})
            </button>
          ))}
        </nav>
      </div>

        {/* プロジェクトグループ */}
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-3 flex items-center gap-2 text-gray-300">
                {group.icon}
                <h2 className="text-lg font-semibold">{group.title}</h2>
                <span className="text-sm text-gray-500">({group.projects.length}件)</span>
              </div>

              {group.projects.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 text-center">
                  <p className="text-gray-400">{group.description}はありません</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.projects.map((project) => {
                    const initiator = getDemoUserById(project.initiator);
                    const currentWorkflow = project.workflows.find(w => w.status === 'in-progress');
                    
                    return (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all"
                    >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white line-clamp-2">
                            {project.title}
                          </h3>
                          {getStatusBadge(project.status)}
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>提案者: {initiator?.name || '不明'}</p>
                          <p>作成日: {project.createdDate.toLocaleDateString('ja-JP')}</p>
                          
                          {currentWorkflow && (
                            <p className="text-orange-400 font-medium">
                              現在: {currentWorkflow.stage} 承認待ち
                            </p>
                          )}
                          
                          {project.memberSelectionStatus === 'in-progress' && (
                            <p className="text-purple-400 font-medium">
                              メンバー選出中（仮選出: {project.provisionalMembers?.length || 0}名）
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex justify-end">
                          <span className="text-sm text-blue-400 hover:text-blue-300">
                            詳細を見る →
                          </span>
                        </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

        {filteredGroups.length === 0 || filteredGroups.every(g => g.projects.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400">該当するプロジェクトはありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;