import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Users, TrendingUp, CheckCircle, Clock, AlertCircle, AlertTriangle, Shield } from 'lucide-react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { getProjectList, getProjectStats, type ProjectListItem, type ProjectStats } from '../services/ProjectListService';
import { getLevelLabel, getLevelIcon } from '../services/ProjectLevelEngine';
import { getApprovalStatusLabel } from '../services/ProjectApprovalService';

const ProjectListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useDemoMode();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'proposed'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'improvement' | 'community' | 'facility' | 'system'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'DEPARTMENT' | 'FACILITY' | 'CORPORATE' | 'EMERGENCY'>('all');
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [stats, setStats] = useState<ProjectStats>({ active: 0, completed: 0, proposed: 0, owned: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータから初期フィルターを設定
  useEffect(() => {
    const filter = searchParams.get('filter');

    if (filter === 'active') {
      setFilterStatus('active');
    } else if (filter === 'completed') {
      setFilterStatus('completed');
    } else if (filter === 'department') {
      setFilterCategory('improvement');
    } else if (filter === 'facility') {
      setFilterCategory('facility');
    } else if (filter === 'corporate') {
      setFilterCategory('system');
    }
  }, [searchParams]);

  // プロジェクト一覧と統計を取得
  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectList, projectStats] = await Promise.all([
          getProjectList(
            {
              searchTerm: searchTerm || undefined,
              status: filterStatus !== 'all' ? filterStatus : undefined,
              category: filterCategory !== 'all' ? filterCategory : undefined,
              level: filterLevel !== 'all' ? filterLevel : undefined
            },
            currentUser.id
          ),
          getProjectStats(currentUser.id)
        ]);

        setProjects(projectList);
        setStats(projectStats);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('プロジェクト一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id, searchTerm, filterStatus, filterCategory, filterLevel]);

  const getStatusIcon = (status: ProjectListItem['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'proposed':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: ProjectListItem['status']) => {
    switch (status) {
      case 'active':
        return '進行中';
      case 'completed':
        return '完了';
      case 'proposed':
        return '提案中';
      case 'paused':
        return '一時停止';
    }
  };

  const getCategoryColor = (category: ProjectListItem['category']) => {
    switch (category) {
      case 'improvement':
        return 'bg-blue-500/20 text-blue-400';
      case 'community':
        return 'bg-green-500/20 text-green-400';
      case 'facility':
        return 'bg-purple-500/20 text-purple-400';
      case 'system':
        return 'bg-orange-500/20 text-orange-400';
    }
  };

  const getCategoryLabel = (category: ProjectListItem['category']) => {
    switch (category) {
      case 'improvement':
        return '業務改善';
      case 'community':
        return 'コミュニティ';
      case 'facility':
        return '施設管理';
      case 'system':
        return 'システム';
    }
  };

  const getPriorityColor = (priority: ProjectListItem['priority']) => {
    if (!priority) return 'text-gray-400';
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-gray-400';
    }
  };

  const getPriorityLabel = (priority: ProjectListItem['priority']) => {
    if (!priority) return '未設定';
    switch (priority) {
      case 'urgent':
        return '緊急';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Custom Header */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">プロジェクト一覧</h1>
            <p className="text-gray-400 text-sm">参加中のプロジェクトを管理</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
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

          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">フィルター:</span>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">すべての状態</option>
              <option value="active">進行中</option>
              <option value="completed">完了</option>
              <option value="proposed">提案中</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">すべてのカテゴリー</option>
              <option value="improvement">業務改善</option>
              <option value="community">コミュニティ</option>
              <option value="facility">施設管理</option>
              <option value="system">システム</option>
            </select>

            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="px-4 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">すべてのレベル</option>
              <option value="DEPARTMENT">部署レベル</option>
              <option value="FACILITY">施設レベル</option>
              <option value="CORPORATE">法人レベル</option>
              <option value="EMERGENCY">緊急</option>
            </select>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">参加中</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.active}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">完了済み</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">提案中</p>
            <p className="text-2xl font-bold text-blue-400">{stats.proposed}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">オーナー</p>
            <p className="text-2xl font-bold text-purple-400">{stats.owned}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">読み込み中...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Project List */}
        {!loading && !error && (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer"
              >
                {/* Emergency Escalation Badge */}
                {project.isEmergencyEscalated && (
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-red-500 text-sm font-semibold">緊急エスカレーション</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(project.category)}`}>
                        {getCategoryLabel(project.category)}
                      </span>
                      {project.myRole === 'owner' && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                          オーナー
                        </span>
                      )}
                      {project.projectLevel && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs flex items-center gap-1">
                          <span>{getLevelIcon(project.projectLevel as any)}</span>
                          <span>{getLevelLabel(project.projectLevel as any)}</span>
                        </span>
                      )}
                      {project.approvalStatus && project.approvalStatus !== 'pending' && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>{getApprovalStatusLabel(project.approvalStatus as any)}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusIcon(project.status)}
                    <span className="text-sm text-gray-300">{getStatusLabel(project.status)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
                  {project.startDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.startDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.participants}名</span>
                  </div>
                  {project.priority && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-4 h-4 ${getPriorityColor(project.priority)}`} />
                      <span className={getPriorityColor(project.priority)}>
                        {getPriorityLabel(project.priority)}優先度
                      </span>
                    </div>
                  )}
                  <div className="flex-1" />
                  <span>{project.department}</span>
                  {project.facility && project.facility !== '未設定' && (
                    <span className="text-blue-400">• {project.facility}</span>
                  )}
                </div>

                {project.status === 'active' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">進捗</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当するプロジェクトが見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListPage;
