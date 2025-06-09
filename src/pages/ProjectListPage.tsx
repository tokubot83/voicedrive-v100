import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useDemoMode } from '../components/demo/DemoModeController';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  endDate?: string;
  participants: number;
  department: string;
  category: 'improvement' | 'community' | 'facility' | 'system';
  priority: 'high' | 'medium' | 'low';
  myRole?: 'owner' | 'participant' | 'viewer';
}

const ProjectListPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { currentUser } = useDemoMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'proposed'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'improvement' | 'community' | 'facility' | 'system'>('all');

  // Mock projects data
  const projects: Project[] = [
    {
      id: '1',
      title: 'リハビリ室業務効率化プロジェクト',
      description: 'リハビリテーション室の業務フローを見直し、患者対応時間を20%増加させる',
      status: 'active',
      progress: 65,
      startDate: '2024-05-01',
      participants: 12,
      department: 'リハビリテーション科',
      category: 'improvement',
      priority: 'high',
      myRole: 'participant'
    },
    {
      id: '2',
      title: '新人教育プログラム標準化',
      description: '全部門共通の新人教育カリキュラムを作成し、教育の質を均一化',
      status: 'active',
      progress: 40,
      startDate: '2024-06-15',
      participants: 8,
      department: '人事部',
      category: 'system',
      priority: 'medium',
      myRole: 'owner'
    },
    {
      id: '3',
      title: '患者満足度向上キャンペーン',
      description: '患者アンケート結果を基に、サービス改善策を実施',
      status: 'completed',
      progress: 100,
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      participants: 25,
      department: '全部門',
      category: 'community',
      priority: 'high',
      myRole: 'participant'
    },
    {
      id: '4',
      title: '電子カルテシステム更新',
      description: '最新の電子カルテシステムへの移行と職員教育',
      status: 'proposed',
      progress: 0,
      startDate: '2024-08-01',
      participants: 5,
      department: '情報システム部',
      category: 'system',
      priority: 'high',
      myRole: 'viewer'
    },
    {
      id: '5',
      title: '省エネルギー推進プロジェクト',
      description: '施設全体のエネルギー使用量を15%削減する取り組み',
      status: 'active',
      progress: 30,
      startDate: '2024-04-01',
      participants: 10,
      department: '施設管理部',
      category: 'facility',
      priority: 'medium',
      myRole: 'participant'
    }
  ];

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status: Project['status']) => {
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

  const getStatusLabel = (status: Project['status']) => {
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

  const getCategoryColor = (category: Project['category']) => {
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

  const getCategoryLabel = (category: Project['category']) => {
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

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">プロジェクト一覧</h1>
          <p className="text-gray-400 mt-1">参加中のプロジェクトを管理</p>
        </div>
        {hasPermission(3) && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors">
            <Plus className="w-5 h-5" />
            新規プロジェクト
          </button>
        )}
      </div>

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
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm">参加中</p>
          <p className="text-2xl font-bold text-yellow-400">{projects.filter(p => p.status === 'active' && p.myRole).length}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm">完了済み</p>
          <p className="text-2xl font-bold text-green-400">{projects.filter(p => p.status === 'completed').length}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm">提案中</p>
          <p className="text-2xl font-bold text-blue-400">{projects.filter(p => p.status === 'proposed').length}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm">オーナー</p>
          <p className="text-2xl font-bold text-purple-400">{projects.filter(p => p.myRole === 'owner').length}</p>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(project.category)}`}>
                    {getCategoryLabel(project.category)}
                  </span>
                  {project.myRole === 'owner' && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                      オーナー
                    </span>
                  )}
                </div>
                <p className="text-gray-400">{project.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(project.status)}
                <span className="text-sm text-gray-300">{getStatusLabel(project.status)}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.startDate).toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{project.participants}名</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-4 h-4 ${getPriorityColor(project.priority)}`} />
                <span className={getPriorityColor(project.priority)}>
                  {project.priority === 'high' ? '高' : project.priority === 'medium' ? '中' : '低'}優先度
                </span>
              </div>
              <div className="flex-1" />
              <span>{project.department}</span>
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

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">該当するプロジェクトが見つかりません</p>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;