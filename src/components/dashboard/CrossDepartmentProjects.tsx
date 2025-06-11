import React, { useState } from 'react';
import { Network, Users, Calendar, TrendingUp, Target, Clock } from 'lucide-react';
import { CrossDepartmentProject } from '../../types/staffDashboard';

interface CrossDepartmentProjectsProps {
  projects: CrossDepartmentProject[];
}

const CrossDepartmentProjects: React.FC<CrossDepartmentProjectsProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400 bg-green-500/20';
    if (progress >= 60) return 'text-blue-400 bg-blue-500/20';
    if (progress >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-orange-400 bg-orange-500/20';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (progress >= 60) return 'bg-gradient-to-r from-blue-500 to-blue-400';
    if (progress >= 40) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-orange-500 to-orange-400';
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 3.0) return 'text-green-400';
    if (roi >= 2.0) return 'text-blue-400';
    if (roi >= 1.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getDaysUntilCompletion = (completionDate: string) => {
    const today = new Date();
    const completion = new Date(completionDate);
    const diffTime = completion.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Network className="w-6 h-6 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">クロス部門プロジェクト</h3>
        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
          {projects.length}件
        </span>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">平均進捗</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">総参加者</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {projects.reduce((sum, p) => sum + p.participantCount, 0)}名
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">平均ROI</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {projects.length > 0 ? (projects.reduce((sum, p) => sum + p.roiProjection, 0) / projects.length).toFixed(1) : 0}x
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400 text-sm">完了予定</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {projects.filter(p => getDaysUntilCompletion(p.expectedCompletion) <= 30).length}件
          </div>
          <div className="text-xs text-gray-400">30日以内</div>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">進行中プロジェクト</h4>
        
        <div className="space-y-4">
          {projects.map((project) => {
            const daysUntilCompletion = getDaysUntilCompletion(project.expectedCompletion);
            const isExpanded = selectedProject === project.projectId;
            
            return (
              <div
                key={project.projectId}
                className="bg-slate-700/30 rounded-lg overflow-hidden transition-all duration-300 hover:bg-slate-700/50"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedProject(isExpanded ? null : project.projectId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="text-white font-medium">{project.projectName}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.progress)}`}>
                          {project.progress}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.participantCount}名</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{daysUntilCompletion}日後完了予定</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className={getRoiColor(project.roiProjection)}>
                            ROI {project.roiProjection}x
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">リード部署</div>
                        <div className="text-white font-medium">{project.leadDepartment}</div>
                      </div>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <svg
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* プログレスバー */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 展開コンテンツ */}
                {isExpanded && (
                  <div className="border-t border-slate-600/50 p-4 bg-slate-800/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 参加部署 */}
                      <div>
                        <h6 className="text-sm font-medium text-gray-400 mb-3">参加部署</h6>
                        <div className="space-y-2">
                          {project.involvedDepartments.map((dept, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                dept === project.leadDepartment ? 'bg-yellow-400' : 'bg-blue-400'
                              }`} />
                              <span className="text-gray-300 text-sm">{dept}</span>
                              {dept === project.leadDepartment && (
                                <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
                                  リード
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* プロジェクト詳細 */}
                      <div>
                        <h6 className="text-sm font-medium text-gray-400 mb-3">プロジェクト詳細</h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">完了予定日</span>
                            <span className="text-white">{new Date(project.expectedCompletion).toLocaleDateString('ja-JP')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">予想ROI</span>
                            <span className={getRoiColor(project.roiProjection)}>
                              {project.roiProjection}倍
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">残り日数</span>
                            <span className={`${daysUntilCompletion <= 30 ? 'text-orange-400' : 'text-gray-300'}`}>
                              {daysUntilCompletion}日
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors">
                        詳細を見る
                      </button>
                      <button className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors">
                        進捗を更新
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 部門間連携指標 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">部門間連携指標</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <div className="text-2xl font-bold text-indigo-400">
              {new Set(projects.flatMap(p => p.involvedDepartments)).size}
            </div>
            <div className="text-sm text-indigo-300">連携部署数</div>
            <div className="text-xs text-gray-400">プロジェクト参加</div>
          </div>
          
          <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {(projects.reduce((sum, p) => sum + p.involvedDepartments.length, 0) / projects.length || 0).toFixed(1)}
            </div>
            <div className="text-sm text-purple-300">平均連携数</div>
            <div className="text-xs text-gray-400">プロジェクト当たり</div>
          </div>
          
          <div className="text-center p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">
              {projects.filter(p => p.progress >= 60).length}
            </div>
            <div className="text-sm text-cyan-300">順調プロジェクト</div>
            <div className="text-xs text-gray-400">進捗60%以上</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossDepartmentProjects;