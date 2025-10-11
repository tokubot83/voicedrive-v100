import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { TrendingUp, Calendar, Users, Target, CheckCircle, AlertCircle, Clock } from 'lucide-react';

/**
 * 進捗ダッシュボードページ（レベル5+）
 * プロジェクトの進捗状況を可視化
 */
export const ProgressDashboardPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'delayed'>('all');

  useEffect(() => {
    if (activeUser) {
      loadProjects();
    }
  }, [activeUser]);

  const loadProjects = () => {
    // TODO: 実際のAPI実装
    setProjects(getDemoProjects());
  };

  const getFilteredProjects = () => {
    if (filter === 'all') return projects;
    return projects.filter(p => {
      if (filter === 'active') return p.status === 'active';
      if (filter === 'completed') return p.status === 'completed';
      if (filter === 'delayed') return p.isDelayed;
      return true;
    });
  };

  const filteredProjects = getFilteredProjects();

  // 統計計算
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    delayed: projects.filter(p => p.isDelayed).length,
    avgProgress: projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl border border-blue-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-10 h-10" />
          進捗ダッシュボード
        </h1>
        <p className="text-gray-300">
          プロジェクトの進捗状況を確認
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="mx-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-1">総プロジェクト数</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700/50">
            <div className="text-sm text-blue-400 mb-1">進行中</div>
            <div className="text-3xl font-bold text-blue-400">{stats.active}</div>
          </div>
          <div className="bg-green-900/30 rounded-xl p-4 border border-green-700/50">
            <div className="text-sm text-green-400 mb-1">完了</div>
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
          </div>
          <div className="bg-red-900/30 rounded-xl p-4 border border-red-700/50">
            <div className="text-sm text-red-400 mb-1">遅延</div>
            <div className="text-3xl font-bold text-red-400">{stats.delayed}</div>
          </div>
          <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-700/50">
            <div className="text-sm text-purple-400 mb-1">平均進捗</div>
            <div className="text-3xl font-bold text-purple-400">{stats.avgProgress}%</div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="mx-6 mb-6">
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            進行中
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            完了
          </button>
          <button
            onClick={() => setFilter('delayed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'delayed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            遅延
          </button>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      <div className="mx-6 pb-24">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-400">該当するプロジェクトがありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all"
              >
                {/* ヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {project.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {project.status === 'active' && !project.isDelayed && (
                        <Clock className="w-5 h-5 text-blue-400" />
                      )}
                      {project.isDelayed && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    </div>
                    <p className="text-gray-400">{project.description}</p>
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>進捗状況</span>
                    <span className="font-bold text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.status === 'completed'
                          ? 'bg-green-500'
                          : project.isDelayed
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* メトリクス */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <Users className="w-4 h-4" />
                      チーム
                    </div>
                    <div className="text-lg font-bold text-white">{project.teamSize}名</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <Target className="w-4 h-4" />
                      マイルストーン
                    </div>
                    <div className="text-lg font-bold text-white">
                      {project.completedMilestones}/{project.totalMilestones}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      期限
                    </div>
                    <div className={`text-lg font-bold ${
                      project.isDelayed ? 'text-red-400' : 'text-white'
                    }`}>
                      {project.dueDate}
                    </div>
                  </div>
                </div>

                {/* ステータスバッジ */}
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    project.status === 'completed'
                      ? 'bg-green-900/30 text-green-400 border border-green-700'
                      : 'bg-blue-900/30 text-blue-400 border border-blue-700'
                  }`}>
                    {project.status === 'completed' ? '完了' : '進行中'}
                  </span>
                  {project.isDelayed && (
                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-red-900/30 text-red-400 border border-red-700">
                      遅延
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-900/30 text-purple-400 border border-purple-700">
                    {project.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

// デモデータ
const getDemoProjects = () => {
  return [
    {
      id: 'project-1',
      title: '新人教育プログラム改善プロジェクト',
      description: '新人看護師の教育体系を整備し、メンター制度を導入',
      status: 'active',
      progress: 65,
      teamSize: 12,
      completedMilestones: 3,
      totalMilestones: 5,
      dueDate: '2025-12-31',
      isDelayed: false,
      level: 'チームプロジェクト'
    },
    {
      id: 'project-2',
      title: '電子カルテシステム刷新',
      description: '次世代電子カルテシステムの導入と運用改善',
      status: 'active',
      progress: 40,
      teamSize: 25,
      completedMilestones: 2,
      totalMilestones: 8,
      dueDate: '2026-03-31',
      isDelayed: true,
      level: '施設プロジェクト'
    },
    {
      id: 'project-3',
      title: '多職種カンファレンス定期開催',
      description: '週1回の多職種カンファレンスを定例化',
      status: 'completed',
      progress: 100,
      teamSize: 8,
      completedMilestones: 4,
      totalMilestones: 4,
      dueDate: '2025-10-01',
      isDelayed: false,
      level: 'チームプロジェクト'
    },
    {
      id: 'project-4',
      title: '勤務シフト最適化システム導入',
      description: 'AIを活用した勤務シフト作成支援ツールの導入',
      status: 'active',
      progress: 25,
      teamSize: 15,
      completedMilestones: 1,
      totalMilestones: 6,
      dueDate: '2025-11-30',
      isDelayed: false,
      level: '部署プロジェクト'
    }
  ];
};

export default ProgressDashboardPage;
