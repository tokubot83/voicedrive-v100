import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Calendar, Users, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowLeft, Building2, Building, Briefcase, AlertTriangle, Eye } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useDemoMode } from '../components/demo/DemoModeController';
import { projectDemoPosts } from '../data/demo/projectDemoData';
import { Post, ProjectLevel, ApprovalStatus } from '../types';

interface EnhancedProject {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  endDate?: string;
  participants: number;
  department: string;
  facility?: string;
  category: 'improvement' | 'community' | 'facility' | 'system';
  priority: 'high' | 'medium' | 'low' | 'urgent';
  myRole?: 'owner' | 'participant' | 'viewer';
  projectLevel?: ProjectLevel;
  isEmergencyEscalated?: boolean;
  escalatedBy?: string;
  escalatedDate?: string;
  approvalStatus?: ApprovalStatus;
  currentApprover?: string;
  budget?: number;
  budgetUsed?: number;
}

const EnhancedProjectListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermissions();
  const { currentUser } = useDemoMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'proposed'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'improvement' | 'community' | 'facility' | 'system'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'DEPARTMENT' | 'FACILITY' | 'CORPORATE' | 'EMERGENCY'>('all');

  // 施設マッピング
  const getFacilityFromDepartment = (department: string): string => {
    const facilityMap: Record<string, string> = {
      'リハビリテーション科': '立神リハ温泉病院',
      'リハビリテーション部': '立神リハ温泉病院',
      '温泉療法科': '立神リハ温泉病院',
      '看護部': '小原病院',
      '医療情報部': '小原病院',
      '外来': '小原病院',
      '病棟': '小原病院',
      '事務部': '小原病院',
      '薬剤部': '小原病院',
      '経営企画部': '本部',
      '人事部': '本部',
      '総務部': '本部'
    };
    return facilityMap[department] || '小原病院';
  };

  // プロジェクトデータの変換
  const convertPostToProject = (post: Post): EnhancedProject => {
    const progress = post.enhancedProjectStatus?.resources?.completion || 0;
    const startDate = post.enhancedProjectStatus?.milestones?.[0]?.date || post.timestamp.toISOString().split('T')[0];
    const participants = post.enhancedProjectStatus?.resources?.team_size || 0;
    const facility = getFacilityFromDepartment(post.author.department);
    
    // ステータスの判定
    let status: EnhancedProject['status'] = 'proposed';
    if (progress === 100) {
      status = 'completed';
    } else if (progress > 0) {
      status = 'active';
    } else if (post.approvalFlow?.status === 'in_progress') {
      status = 'proposed';
    }

    // 自分の役割の判定（デモ用）
    let myRole: EnhancedProject['myRole'] = 'viewer';
    if (currentUser?.department === post.author.department) {
      myRole = currentUser.id === post.author.id ? 'owner' : 'participant';
    }

    return {
      id: post.id,
      title: post.content.split('。')[0] + '...', // 最初の文をタイトルとして使用
      description: post.content,
      status,
      progress,
      startDate,
      participants,
      department: post.author.department,
      facility,
      category: post.proposalType === 'operational' ? 'improvement' : 
                post.proposalType === 'innovation' ? 'system' :
                post.proposalType === 'strategic' ? 'facility' : 'community',
      priority: post.priority || 'medium',
      myRole,
      projectLevel: post.enhancedProjectStatus?.level,
      approvalStatus: post.approvalFlow?.status,
      currentApprover: post.approvalFlow?.history?.find(h => h.status === 'pending')?.approver,
      budget: post.enhancedProjectStatus?.budget,
      budgetUsed: post.enhancedProjectStatus?.resources?.budget_used
    };
  };

  // デモプロジェクトデータ
  const enhancedProjects: EnhancedProject[] = [
    ...projectDemoPosts.map(convertPostToProject),
    // 緊急エスカレーションされたプロジェクトの例
    {
      id: 'emergency-001',
      title: '緊急医療体制強化プロジェクト',
      description: '災害時対応能力向上のための緊急体制整備。Level 7権限により緊急エスカレーション実施。',
      status: 'active',
      progress: 45,
      startDate: '2024-12-01',
      participants: 30,
      department: '医療部',
      facility: '小原病院',
      category: 'system',
      priority: 'urgent',
      myRole: 'participant',
      projectLevel: 'FACILITY',
      isEmergencyEscalated: true,
      escalatedBy: '執行役員秘書',
      escalatedDate: '2024-12-05',
      budget: 8000000,
      budgetUsed: 3600000
    }
  ];

  // URLパラメータから初期フィルターを設定
  useEffect(() => {
    const filter = searchParams.get('filter');
    
    if (filter === 'active') {
      setFilterStatus('active');
    } else if (filter === 'completed') {
      setFilterStatus('completed');
    } else if (filter === 'department') {
      setFilterLevel('DEPARTMENT');
    } else if (filter === 'facility') {
      setFilterLevel('FACILITY');
    } else if (filter === 'corporate') {
      setFilterLevel('CORPORATE');
    }
  }, [searchParams]);

  // フィルタリング
  const filteredProjects = enhancedProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    
    let matchesLevel = filterLevel === 'all';
    if (filterLevel === 'EMERGENCY') {
      matchesLevel = project.isEmergencyEscalated === true;
    } else if (filterLevel !== 'all') {
      matchesLevel = project.projectLevel === filterLevel;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLevel;
  });

  // ユーザーレベルに応じたソート
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const userLevel = currentUser?.hierarchyLevel || 1;
    
    // Level 7-8: 緊急エスカレーションを最上位に
    if (userLevel >= 7) {
      if (a.isEmergencyEscalated && !b.isEmergencyEscalated) return -1;
      if (!a.isEmergencyEscalated && b.isEmergencyEscalated) return 1;
    }
    
    // Level 1-4: 自部署・自施設を優先
    if (userLevel <= 4) {
      const userFacility = currentUser ? getFacilityFromDepartment(currentUser.department) : '';
      if (a.facility === userFacility && b.facility !== userFacility) return -1;
      if (a.facility !== userFacility && b.facility === userFacility) return 1;
      if (a.department === currentUser?.department && b.department !== currentUser?.department) return -1;
      if (a.department !== currentUser?.department && b.department === currentUser?.department) return 1;
    }
    
    // デフォルトは進捗順
    return b.progress - a.progress;
  });

  // ヘルパー関数
  const getStatusIcon = (status: EnhancedProject['status']) => {
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

  const getStatusLabel = (status: EnhancedProject['status']) => {
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

  const getCategoryColor = (category: EnhancedProject['category']) => {
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

  const getCategoryLabel = (category: EnhancedProject['category']) => {
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

  const getPriorityColor = (priority: EnhancedProject['priority']) => {
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

  const getProjectLevelIcon = (level?: ProjectLevel) => {
    switch (level) {
      case 'DEPARTMENT':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'FACILITY':
        return <Building className="w-4 h-4 text-purple-400" />;
      case 'CORPORATE':
        return <Briefcase className="w-4 h-4 text-orange-400" />;
      default:
        return null;
    }
  };

  const getProjectLevelLabel = (level?: ProjectLevel) => {
    switch (level) {
      case 'DEPARTMENT':
        return '部署プロジェクト';
      case 'FACILITY':
        return '施設プロジェクト';
      case 'CORPORATE':
        return '法人プロジェクト';
      default:
        return '';
    }
  };

  const getProjectLevelColor = (level?: ProjectLevel) => {
    switch (level) {
      case 'DEPARTMENT':
        return 'bg-blue-500/20 text-blue-400';
      case 'FACILITY':
        return 'bg-purple-500/20 text-purple-400';
      case 'CORPORATE':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

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
              <h1 className="text-2xl font-bold text-white">プロジェクト一覧</h1>
              <p className="text-gray-400 text-sm">プロジェクトレベル・施設・部署別で管理</p>
            </div>
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

            {/* Project Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="px-4 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">すべてのレベル</option>
              <option value="DEPARTMENT">部署プロジェクト</option>
              <option value="FACILITY">施設プロジェクト</option>
              <option value="CORPORATE">法人プロジェクト</option>
              {currentUser && currentUser.hierarchyLevel >= 7 && (
                <option value="EMERGENCY">緊急エスカレーション</option>
              )}
            </select>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">参加中</p>
            <p className="text-2xl font-bold text-yellow-400">{enhancedProjects.filter(p => p.status === 'active' && p.myRole !== 'viewer').length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">完了済み</p>
            <p className="text-2xl font-bold text-green-400">{enhancedProjects.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">部署レベル</p>
            <p className="text-2xl font-bold text-blue-400">{enhancedProjects.filter(p => p.projectLevel === 'DEPARTMENT').length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">施設レベル</p>
            <p className="text-2xl font-bold text-purple-400">{enhancedProjects.filter(p => p.projectLevel === 'FACILITY').length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm">緊急対応</p>
            <p className="text-2xl font-bold text-red-400">{enhancedProjects.filter(p => p.isEmergencyEscalated).length}</p>
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-4">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${
                project.myRole === 'viewer' ? 'border-slate-700/30 opacity-80' : 
                project.isEmergencyEscalated ? 'border-red-500/50 hover:border-red-400/50' :
                'border-slate-700/50 hover:border-slate-600/50'
              }`}>
              
              {/* 緊急エスカレーションバッジ */}
              {project.isEmergencyEscalated && (
                <div className="flex items-center gap-2 mb-3 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">緊急エスカレーション</span>
                  <span className="text-red-400/70">by {project.escalatedBy} ({project.escalatedDate})</span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                    
                    {/* プロジェクトレベルバッジ */}
                    {project.projectLevel && (
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getProjectLevelColor(project.projectLevel)}`}>
                        {getProjectLevelIcon(project.projectLevel)}
                        {getProjectLevelLabel(project.projectLevel)}
                      </span>
                    )}
                    
                    {/* カテゴリーバッジ */}
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(project.category)}`}>
                      {getCategoryLabel(project.category)}
                    </span>
                    
                    {/* 役割バッジ */}
                    {project.myRole === 'owner' && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                        オーナー
                      </span>
                    )}
                    {project.myRole === 'viewer' && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        閲覧のみ
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{project.description.slice(0, 150)}...</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(project.status)}
                  <span className="text-sm text-gray-300">{getStatusLabel(project.status)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
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
                    {project.priority === 'urgent' ? '緊急' : project.priority === 'high' ? '高' : project.priority === 'medium' ? '中' : '低'}優先度
                  </span>
                </div>
                
                <div className="flex-1" />
                
                <div className="flex flex-col items-end gap-1">
                  <span className="text-white">{project.department}</span>
                  {project.facility && (
                    <span className="text-xs text-gray-500">{project.facility}</span>
                  )}
                </div>
              </div>

              {/* 承認待ち表示 */}
              {project.approvalStatus === 'in_progress' && project.currentApprover && (
                <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {project.currentApprover}の承認待ち
                  </p>
                </div>
              )}

              {/* 予算情報 */}
              {project.budget && (
                <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-400">予算執行状況</span>
                    <span className="text-white">
                      {project.budgetUsed?.toLocaleString()}円 / {project.budget.toLocaleString()}円
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full"
                      style={{ width: `${((project.budgetUsed || 0) / project.budget) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 進捗バー */}
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

        {sortedProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当するプロジェクトが見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProjectListPage;