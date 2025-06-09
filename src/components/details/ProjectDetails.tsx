import React from 'react';
import { Calendar, DollarSign, Users, Target, AlertTriangle, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
      case 'active':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'pending':
      case 'upcoming':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getProjectLevelBadge = (level: string) => {
    switch (level) {
      case 'DEPARTMENT':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold">🏢 部署内プロジェクト</span>;
      case 'FACILITY':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold">🏥 施設内プロジェクト</span>;
      case 'CORPORATE':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold">🏛️ 法人プロジェクト</span>;
      default:
        return null;
    }
  };

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}千万円`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万円`;
    } else {
      return `${amount.toLocaleString()}円`;
    }
  };

  // Use enhanced project status if available, otherwise use defaults
  if (projectStatus) {
    const budgetUsagePercentage = (projectStatus.resources.budget_used / projectStatus.resources.budget_total) * 100;

    return (
      <div className="space-y-6">
        {/* Project Level Badge */}
        <div className="flex justify-center">
          {getProjectLevelBadge(projectStatus.level)}
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">予算</span>
            </div>
            <div className="text-lg font-bold text-white">
              {formatBudget(projectStatus.budget)}
            </div>
            <div className="text-xs text-gray-500">
              使用率: {budgetUsagePercentage.toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">チーム</span>
            </div>
            <div className="text-lg font-bold text-white">
              {projectStatus.resources.team_size}名
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">期間</span>
            </div>
            <div className="text-lg font-bold text-white">
              {projectStatus.timeline}
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">予算使用状況</span>
            <span className="text-white">{formatBudget(projectStatus.resources.budget_used)} / {formatBudget(projectStatus.resources.budget_total)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
              style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Project Completion Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">プロジェクト進捗</span>
            <span className="text-white">{projectStatus.resources.completion}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${projectStatus.resources.completion}%` }}
            ></div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4" />
            マイルストーン
          </h4>
          {projectStatus.milestones.map((milestone, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
              {getStatusIcon(milestone.status)}
              <div className="flex-1">
                <div className="font-medium text-gray-100">{milestone.name}</div>
                <div className="text-sm text-gray-400">{milestone.date}</div>
              </div>
              {milestone.progress && (
                <div className="text-sm text-blue-400 font-medium">
                  {milestone.progress}%
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Approval Flow */}
        {approvalFlow && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white">承認フロー</h4>
            {approvalFlow.history.map((approval, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                {getStatusIcon(approval.status)}
                <div className="flex-1">
                  <div className="font-medium text-gray-100">{approval.approver}</div>
                  <div className="text-sm text-gray-400">{approval.level}</div>
                </div>
                {approval.date && (
                  <div className="text-sm text-gray-400">
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
            <h4 className="font-semibold text-white text-sm">タグ</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs"
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
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Calendar className="w-3 h-3" />
            期間
          </div>
          <div className="text-white font-medium">3/6ヶ月</div>
          <div className="text-xs text-gray-500">50%経過</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            予算
          </div>
          <div className="text-white font-medium">280万円</div>
          <div className="text-xs text-gray-500">70万円使用</div>
        </div>
      </div>

      {/* マイルストーン */}
      <div className="space-y-2">
        <h4 className="font-medium text-white text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          マイルストーン
        </h4>
        {defaultMilestones.map((milestone, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {getStatusIcon(milestone.status)}
            <span className="flex-1 text-gray-200">{milestone.name}</span>
            <span className="text-gray-500 text-xs">{milestone.date}</span>
          </div>
        ))}
      </div>

      {/* 予算使用状況 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">予算使用率</span>
          <span className="text-white">25%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;