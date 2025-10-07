/**
 * 施設プロジェクト管理ページ
 * Level 10+（人財統括本部各部門長以上）専用
 *
 * ボトムアップ（自動プロジェクト化）プロジェクトの監督・調整
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { facilityProjectManagementService } from '../services/FacilityProjectManagementService';
import {
  FacilityProject,
  FacilityProjectStats,
  ProjectFilter,
  getHealthInfo,
  getStatusInfo,
  getOriginInfo,
  getProjectLevelLabel,
  formatBudget,
  getProgressColor
} from '../types/facilityProjectManagement';

type TabType = 'all' | 'active' | 'at_risk' | 'planning' | 'completed';

const FacilityProjectManagementPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [projects, setProjects] = useState<FacilityProject[]>([]);
  const [stats, setStats] = useState<FacilityProjectStats | null>(null);
  const [selectedProject, setSelectedProject] = useState<FacilityProject | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    facilityProjectManagementService.initializeDemoData();
    loadData();
  }, []);

  const loadData = () => {
    setStats(facilityProjectManagementService.getStats());
    filterProjects(activeTab);
  };

  const filterProjects = (tab: TabType) => {
    let filtered: FacilityProject[];

    switch (tab) {
      case 'active':
        filtered = facilityProjectManagementService.getActiveProjects();
        break;
      case 'at_risk':
        filtered = facilityProjectManagementService.getAtRiskProjects();
        break;
      case 'planning':
        filtered = facilityProjectManagementService.getProjectsByStatus('planning')
          .concat(facilityProjectManagementService.getProjectsByStatus('team_forming'));
        break;
      case 'completed':
        filtered = facilityProjectManagementService.getProjectsByStatus('completed');
        break;
      default:
        filtered = facilityProjectManagementService.getAllProjects();
    }

    setProjects(filtered);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    filterProjects(tab);
  };

  const handleOpenDetail = (project: FacilityProject) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl p-6 backdrop-blur-xl border border-emerald-500/20 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏥</span>
          施設プロジェクト管理
        </h1>
        <p className="text-gray-300">
          ボトムアップ・委員会プロジェクトの監督と部門間調整
        </p>
      </div>

      {/* 統計ダッシュボード */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 rounded-xl p-5 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 text-sm font-semibold">実行中</span>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.activeProjects}</div>
            <div className="text-xs text-gray-400 mt-1">プロジェクト</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 rounded-xl p-5 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 text-sm font-semibold">要注意</span>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.atRiskCount + stats.criticalCount}</div>
            <div className="text-xs text-gray-400 mt-1">
              リスク {stats.atRiskCount} / 危機 {stats.criticalCount}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-semibold">今月完了</span>
              <span className="text-2xl">🎉</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.thisMonthCompletions}</div>
            <div className="text-xs text-gray-400 mt-1">プロジェクト</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm font-semibold">平均進捗</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.averageProgress}%</div>
            <div className="text-xs text-gray-400 mt-1">
              予定通り {stats.onScheduleCount} / 遅延 {stats.delayedCount}
            </div>
          </div>
        </div>
      )}

      {/* タブフィルタ */}
      <div className="bg-gray-800/50 rounded-xl p-2 mb-6 flex gap-2 overflow-x-auto">
        {[
          { id: 'active' as TabType, label: '実行中', count: stats?.activeProjects },
          { id: 'at_risk' as TabType, label: '要注意', count: stats ? stats.atRiskCount + stats.criticalCount : 0 },
          { id: 'planning' as TabType, label: '計画中', count: stats?.byStatus.planning },
          { id: 'completed' as TabType, label: '完了', count: stats?.completedProjects },
          { id: 'all' as TabType, label: 'すべて', count: stats?.totalProjects }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* プロジェクトリスト */}
      {projects.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700/30">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">プロジェクトがありません</h3>
          <p className="text-gray-500">該当するプロジェクトは現在ありません。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => {
            const healthInfo = getHealthInfo(project.health);
            const statusInfo = getStatusInfo(project.executionStatus);
            const originInfo = getOriginInfo(project.origin);

            return (
              <div
                key={project.id}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all cursor-pointer"
                onClick={() => handleOpenDetail(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${healthInfo.color}`}>
                        {healthInfo.icon} {healthInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${originInfo.color}`}>
                        {originInfo.icon} {originInfo.label}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-300">
                        {getProjectLevelLabel(project.projectLevel)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>リーダー: {project.projectLeader.name}</span>
                      <span>•</span>
                      <span>{project.projectLeader.department}</span>
                      <span>•</span>
                      <span>チーム: {project.team.length + 1}名</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">
                      {project.overallProgress}%
                    </div>
                    <div className="text-xs text-gray-500">進捗率</div>
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(project.overallProgress)} transition-all`}
                      style={{ width: `${project.overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700/50">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">予算</div>
                    <div className="text-sm font-semibold text-white">
                      {formatBudget(project.estimatedBudget)}
                    </div>
                    <div className="text-xs text-gray-500">
                      使用 {formatBudget(project.actualSpending)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">期間</div>
                    <div className="text-sm font-semibold text-white">{project.duration}</div>
                    <div className="text-xs text-gray-500">
                      {project.actualEndDate ? '完了' : '実行中'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">課題</div>
                    <div className="text-sm font-semibold text-white">
                      {project.activeIssuesCount}件
                    </div>
                    {project.criticalIssuesCount > 0 && (
                      <div className="text-xs text-red-400">
                        緊急 {project.criticalIssuesCount}件
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">調整</div>
                    <div className="text-sm font-semibold text-white">
                      {project.pendingCoordinations}件
                    </div>
                    <div className="text-xs text-gray-500">保留中</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 詳細モーダル */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 backdrop-blur-xl p-6 border-b border-emerald-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const healthInfo = getHealthInfo(selectedProject.health);
                      const statusInfo = getStatusInfo(selectedProject.executionStatus);
                      const originInfo = getOriginInfo(selectedProject.origin);
                      return (
                        <>
                          <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${healthInfo.color}`}>
                            {healthInfo.icon} {healthInfo.label}
                          </span>
                          <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                          <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${originInfo.color}`}>
                            {originInfo.icon} {originInfo.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* プロジェクト概要 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📋</span> プロジェクト概要
                </h3>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-gray-300 mb-4">{selectedProject.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">目標：</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {selectedProject.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 進捗状況 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📊</span> 進捗状況
                </h3>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">全体進捗</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {selectedProject.overallProgress}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full ${getProgressColor(selectedProject.overallProgress)}`}
                      style={{ width: `${selectedProject.overallProgress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">開始日:</span>
                      <span className="ml-2 text-white">
                        {selectedProject.actualStartDate?.toLocaleDateString() || '未定'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">終了予定日:</span>
                      <span className="ml-2 text-white">
                        {selectedProject.plannedEndDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* チーム */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>👥</span> プロジェクトチーム
                </h3>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
                    <div className="text-2xl">👑</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{selectedProject.projectLeader.name}</div>
                      <div className="text-sm text-gray-400">
                        {selectedProject.projectLeader.department} • リーダー
                      </div>
                    </div>
                    <div className="text-sm text-emerald-400">
                      稼働率 {selectedProject.projectLeader.allocation}%
                    </div>
                  </div>

                  {selectedProject.team.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl">
                        {member.role === 'core' ? '⭐' : member.role === 'support' ? '🔧' : '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-sm text-gray-400">
                          {member.department} • {member.role === 'core' ? 'コアメンバー' : member.role === 'support' ? 'サポート' : 'メンバー'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        稼働率 {member.allocation}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* マイルストーン */}
              {selectedProject.milestones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🎯</span> マイルストーン
                  </h3>
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone, idx) => (
                      <div
                        key={milestone.id}
                        className={`p-4 rounded-xl border ${
                          milestone.status === 'completed'
                            ? 'bg-emerald-900/20 border-emerald-500/30'
                            : milestone.status === 'in_progress'
                            ? 'bg-blue-900/20 border-blue-500/30'
                            : 'bg-gray-800/50 border-gray-700/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-1">{milestone.name}</div>
                            <div className="text-sm text-gray-400">{milestone.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-white">
                              {milestone.progress}%
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          目標日: {milestone.targetDate.toLocaleDateString()}
                          {milestone.completedDate && (
                            <span className="ml-2 text-emerald-400">
                              ✓ 完了: {milestone.completedDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KPI */}
              {selectedProject.kpis.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>📈</span> KPI
                  </h3>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
                    {selectedProject.kpis.map((kpi, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">{kpi.name}</span>
                          <span className="text-emerald-400 font-semibold">
                            {kpi.achievement}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>目標: {kpi.target}</span>
                          <span>•</span>
                          <span>現状: {kpi.current}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${Math.min(kpi.achievement, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 課題 */}
              {selectedProject.issues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>⚠️</span> 課題・リスク
                  </h3>
                  <div className="space-y-3">
                    {selectedProject.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-4 rounded-xl border ${
                          issue.priority === 'critical'
                            ? 'bg-red-900/20 border-red-500/30'
                            : issue.priority === 'high'
                            ? 'bg-orange-900/20 border-orange-500/30'
                            : 'bg-gray-800/50 border-gray-700/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white">{issue.title}</div>
                            <div className="text-sm text-gray-400 mt-1">{issue.description}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            issue.priority === 'critical' ? 'bg-red-900/30 text-red-400' :
                            issue.priority === 'high' ? 'bg-orange-900/30 text-orange-400' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {issue.priority === 'critical' ? '🚨 緊急' :
                             issue.priority === 'high' ? '⚠️ 高' :
                             issue.priority === 'medium' ? '📋 中' : '📝 低'}
                          </span>
                        </div>
                        {issue.mitigation && (
                          <div className="mt-2 text-sm text-gray-400">
                            <span className="font-semibold">対策:</span> {issue.mitigation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityProjectManagementPage;
