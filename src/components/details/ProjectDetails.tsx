import React from 'react';
import { Calendar, Users, Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { EnhancedProjectStatus, ApprovalFlow } from '../../types';

interface ProjectDetailsProps {
  data: any & {
    projectStatus?: EnhancedProjectStatus;
    approvalFlow?: ApprovalFlow;
    tags?: string[];
  };
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ data }) => {
  const { projectStatus, approvalFlow, tags } = data;

  // Default milestones for backward compatibility
  const defaultMilestones = [
    { name: '要件定義', status: 'completed', date: '2024/04/15' },
    { name: '設計フェーズ', status: 'completed', date: '2024/05/01' },
    { name: '第1次実装', status: 'completed', date: '2024/05/20' },
    { name: '第2次実装', status: 'active', date: '2024/06/15' },
    { name: 'テスト・検証', status: 'upcoming', date: '2024/07/01' },
    { name: '本番導入', status: 'upcoming', date: '2024/07/15' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
      case 'active':
        return <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />;
      case 'pending':
      case 'upcoming':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getProjectLevelBadge = (level: string) => {
    switch (level) {
      case 'DEPARTMENT':
        return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">🏢 部署内プロジェクト</span>;
      case 'FACILITY':
        return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">🏥 施設内プロジェクト</span>;
      case 'CORPORATE':
        return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">🏛️ 法人プロジェクト</span>;
      default:
        return null;
    }
  };


  // Use enhanced project status if available, otherwise use defaults
  if (projectStatus) {
    return (
      <div className="space-y-6">
        {/* Project Level Badge */}
        <div className="flex justify-center">
          {getProjectLevelBadge(projectStatus.level)}
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span className="text-sm text-gray-600">チーム</span>
            </div>
            <div className="text-lg font-bold text-emerald-800">
              {projectStatus.resources.team_size}名
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span className="text-sm text-gray-600">期間</span>
            </div>
            <div className="text-lg font-bold text-emerald-800">
              {projectStatus.timeline}
            </div>
          </div>
        </div>

        {/* Project Completion Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">プロジェクト進捗</span>
            <span className="text-emerald-800">{projectStatus.resources.completion}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
              style={{ width: `${projectStatus.resources.completion}%` }}
            ></div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h4 className="font-semibold text-emerald-700 flex items-center gap-2">
            <Target className="w-4 h-4" />
            マイルストーン
          </h4>
          {projectStatus.milestones.map((milestone, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              {getStatusIcon(milestone.status)}
              <div className="flex-1">
                <div className="font-medium text-emerald-800">{milestone.name}</div>
                <div className="text-sm text-gray-600">{milestone.date}</div>
              </div>
              {milestone.progress && (
                <div className="text-sm text-emerald-700 font-medium">
                  {milestone.progress}%
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Approval Flow */}
        {approvalFlow && (
          <div className="space-y-3">
            <h4 className="font-semibold text-emerald-700">承認フロー</h4>
            {approvalFlow.history.map((approval, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                {getStatusIcon(approval.status)}
                <div className="flex-1">
                  <div className="font-medium text-emerald-800">{approval.approver}</div>
                  <div className="text-sm text-gray-600">{approval.level}</div>
                </div>
                {approval.date && (
                  <div className="text-sm text-gray-600">
                    {approval.date}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-emerald-700 text-sm">タグ</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs border border-emerald-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to default display for backward compatibility
  return (
    <div className="space-y-4">
      {/* プロジェクト概要 */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Calendar className="w-3 h-3" />
            期間
          </div>
          <div className="text-emerald-800 font-medium">3/6ヶ月</div>
          <div className="text-xs text-gray-600">50%経過</div>
        </div>
      </div>

      {/* マイルストーン */}
      <div className="space-y-2">
        <h4 className="font-medium text-emerald-700 text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          マイルストーン
        </h4>
        {defaultMilestones.map((milestone, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {getStatusIcon(milestone.status)}
            <span className="flex-1 text-emerald-800">{milestone.name}</span>
            <span className="text-gray-600 text-xs">{milestone.date}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProjectDetails;