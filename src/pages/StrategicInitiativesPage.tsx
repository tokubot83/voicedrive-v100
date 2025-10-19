/**
 * 戦略イニシアチブページ（プロジェクト化モード専用）
 * 院長主導の戦略プロジェクト管理
 *
 * レベル13（院長・施設長）専用機能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { strategicProjectService } from '../services/StrategicProjectService';
import { StrategicProject, StrategicInitiativeStats } from '../types/strategicInitiatives';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { Card } from '../components/ui/Card';
import {
  Target, TrendingUp, AlertTriangle, Clock, Users, DollarSign,
  CheckCircle, Calendar, Award, Activity, ArrowRight, Plus,
  FileText, BarChart3, Zap
} from 'lucide-react';

type TabType = 'overview' | 'active' | 'planning' | 'completed';

const StrategicInitiativesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [projects, setProjects] = useState<StrategicProject[]>([]);
  const [stats, setStats] = useState<StrategicInitiativeStats | null>(null);
  const [selectedProject, setSelectedProject] = useState<StrategicProject | null>(null);

  useEffect(() => {
    // デモデータ初期化
    strategicProjectService.initializeDemoProjects();
    loadData();
  }, []);

  const loadData = () => {
    setProjects(strategicProjectService.getAllProjects());
    setStats(strategicProjectService.getStats());
  };

  const getStatusColor = (status: StrategicProject['status']) => {
    const colors = {
      'planning': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'in_progress': 'bg-green-500/20 text-green-400 border-green-500/30',
      'at_risk': 'bg-red-500/20 text-red-400 border-red-500/30',
      'on_hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'completed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'cancelled': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status];
  };

  const getStatusLabel = (status: StrategicProject['status']) => {
    const labels = {
      'planning': '計画中',
      'in_progress': '進行中',
      'at_risk': 'リスクあり',
      'on_hold': '保留中',
      'completed': '完了',
      'cancelled': 'キャンセル'
    };
    return labels[status];
  };

  const getPriorityIcon = (priority: StrategicProject['priority']) => {
    const icons = {
      'critical': <Zap className="w-4 h-4 text-red-400" />,
      'high': <ArrowRight className="w-4 h-4 text-orange-400" />,
      'medium': <Activity className="w-4 h-4 text-yellow-400" />,
      'low': <Activity className="w-4 h-4 text-gray-400" />
    };
    return icons[priority];
  };

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 1000000).toFixed(1)}M`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
  };

  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'active':
        return projects.filter(p => p.status === 'in_progress' || p.status === 'at_risk');
      case 'planning':
        return projects.filter(p => p.status === 'planning');
      case 'completed':
        return projects.filter(p => p.status === 'completed');
      default:
        return projects;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-32">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🎯</span>
          戦略イニシアチブ
        </h1>
        <p className="text-gray-300">
          院長主導の戦略プロジェクト管理（プロジェクト化モード専用）
        </p>
      </div>

      {/* 統計サマリー */}
      {stats && (
        <div className="mx-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">総プロジェクト数</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalProjects}</div>
              <div className="text-xs text-gray-400 mt-1">
                進行中: {stats.activeProjects}件
              </div>
            </Card>

            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-semibold text-white">平均進捗率</h3>
              </div>
              <div className="text-3xl font-bold text-white">{Math.round(stats.averageProgress)}%</div>
              <div className="text-xs text-green-400 mt-1">
                期限内完了率: {Math.round(stats.onTimeRate)}%
              </div>
            </Card>

            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">総予算</h3>
              </div>
              <div className="text-3xl font-bold text-white">{formatCurrency(stats.totalBudget)}</div>
              <div className="text-xs text-gray-400 mt-1">
                消化率: {Math.round(stats.budgetUtilization)}%
              </div>
            </Card>

            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-semibold text-white">リスクあり</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.atRiskProjects}</div>
              <div className="text-xs text-red-400 mt-1">
                {stats.atRiskProjects > 0 ? '要対応' : '問題なし'}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* タブ */}
      <div className="mx-6 mb-6">
        <div className="flex gap-2 border-b border-gray-700/50">
          {[
            { id: 'overview', label: '全プロジェクト', count: projects.length },
            { id: 'active', label: '進行中', count: projects.filter(p => p.status === 'in_progress' || p.status === 'at_risk').length },
            { id: 'planning', label: '計画中', count: projects.filter(p => p.status === 'planning').length },
            { id: 'completed', label: '完了', count: projects.filter(p => p.status === 'completed').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors border-b-2
                ${activeTab === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* プロジェクト一覧 */}
      <div className="mx-6 mb-6 space-y-4">
        {getFilteredProjects().map(project => (
          <Card
            key={project.id}
            className="bg-gray-800/50 p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPriorityIcon(project.priority)}
                  <h3 className="text-xl font-bold text-white">{project.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.teamSize}名
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(project.budget.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* 進捗バー */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">全体進捗</span>
                <span className="text-sm font-bold text-white">{Math.round(project.overallProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    project.status === 'at_risk' ? 'bg-red-500' :
                    project.status === 'completed' ? 'bg-purple-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${project.overallProgress}%` }}
                />
              </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {project.kpis.slice(0, 3).map(kpi => (
                <div key={kpi.id} className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">{kpi.name}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">{kpi.current}</span>
                    <span className="text-xs text-gray-500">/ {kpi.target}{kpi.unit}</span>
                  </div>
                  <div className={`text-xs mt-1 ${
                    kpi.trend === 'up' ? 'text-green-400' :
                    kpi.trend === 'down' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {kpi.trend === 'up' ? '↗ 改善中' : kpi.trend === 'down' ? '↘ 悪化' : '→ 横ばい'}
                  </div>
                </div>
              ))}
            </div>

            {/* リスク表示 */}
            {project.risks.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  リスク ({project.risks.length}件)
                </div>
                {project.risks.slice(0, 2).map(risk => (
                  <div key={risk.id} className="text-xs text-red-300 mb-1">
                    • {risk.title}
                  </div>
                ))}
              </div>
            )}

            {/* 次のマイルストーン */}
            {project.milestones.find(m => m.status === 'in_progress' || m.status === 'pending') && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-400">
                <Clock className="w-4 h-4" />
                <span>次のマイルストーン: </span>
                <span className="font-medium">
                  {project.milestones.find(m => m.status === 'in_progress' || m.status === 'pending')?.title}
                </span>
                <span className="text-gray-500">
                  ({formatDate(project.milestones.find(m => m.status === 'in_progress' || m.status === 'pending')!.targetDate)})
                </span>
              </div>
            )}
          </Card>
        ))}

        {getFilteredProjects().length === 0 && (
          <Card className="bg-gray-800/50 p-12 border border-gray-700/50 text-center">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">プロジェクトがありません</h3>
            <p className="text-gray-500">新規プロジェクトを立案してください</p>
          </Card>
        )}
      </div>

      {/* 新規プロジェクト立案ボタン */}
      <div className="mx-6 mb-6">
        <button
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
          onClick={() => alert('新規プロジェクト立案機能は開発中です')}
        >
          <Plus className="w-5 h-5" />
          新規戦略プロジェクトを立案
        </button>
      </div>

      {/* プロジェクト詳細モーダル */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProject(null)}
        >
          <Card
            className="bg-gray-800 p-6 border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.title}</h2>
                <p className="text-gray-400">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* 目標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                プロジェクト目標
              </h3>
              <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{selectedProject.objective}</p>
            </div>

            {/* マイルストーン */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                マイルストーン
              </h3>
              <div className="space-y-3">
                {selectedProject.milestones.map((milestone, idx) => (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg border ${
                      milestone.status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30'
                        : milestone.status === 'in_progress'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : milestone.status === 'delayed'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-gray-900/50 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-500">#{idx + 1}</span>
                        <h4 className="font-semibold text-white">{milestone.title}</h4>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        milestone.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        milestone.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        milestone.status === 'delayed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {milestone.status === 'completed' ? '完了' :
                         milestone.status === 'in_progress' ? '進行中' :
                         milestone.status === 'delayed' ? '遅延' : '未着手'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        目標: {formatDate(milestone.targetDate)}
                        {milestone.completedDate && ` / 完了: ${formatDate(milestone.completedDate)}`}
                      </span>
                      <span className="text-white font-medium">{milestone.completionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* チームメンバー */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                プロジェクトチーム ({selectedProject.teamSize}名)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedProject.teamMembers.map(member => (
                  <div key={member.userId} className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-xs text-gray-400">{member.role} • {member.department}</div>
                    <div className="text-xs text-blue-400 mt-1">稼働率: {member.commitment}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 予算 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                予算管理
              </h3>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">総予算</div>
                    <div className="text-lg font-bold text-white">{formatCurrency(selectedProject.budget.total)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">支出済み</div>
                    <div className="text-lg font-bold text-yellow-400">{formatCurrency(selectedProject.budget.spent)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">残額</div>
                    <div className="text-lg font-bold text-green-400">{formatCurrency(selectedProject.budget.remaining)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">消化率</div>
                    <div className="text-lg font-bold text-white">{Math.round(selectedProject.budget.utilizationRate)}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${selectedProject.budget.utilizationRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* リスク */}
            {selectedProject.risks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  リスク管理 ({selectedProject.risks.length}件)
                </h3>
                <div className="space-y-3">
                  {selectedProject.risks.map(risk => (
                    <div
                      key={risk.id}
                      className={`p-4 rounded-lg border ${
                        risk.level === 'high'
                          ? 'bg-red-500/10 border-red-500/30'
                          : risk.level === 'medium'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-gray-900/50 border-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{risk.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          risk.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          risk.status === 'mitigating' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {risk.status === 'resolved' ? '解決済み' :
                           risk.status === 'mitigating' ? '対応中' : '対応必要'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{risk.description}</p>
                      <div className="text-xs text-gray-500 mb-2">
                        <span>発生確率: {risk.probability === 'high' ? '高' : risk.probability === 'medium' ? '中' : '低'}</span>
                        <span className="mx-2">•</span>
                        <span>影響度: {risk.impact === 'high' ? '高' : risk.impact === 'medium' ? '中' : '低'}</span>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded text-sm">
                        <div className="text-gray-400 mb-1">対策:</div>
                        <div className="text-white">{risk.mitigation}</div>
                        <div className="text-xs text-gray-500 mt-2">担当: {risk.owner}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default StrategicInitiativesPage;
