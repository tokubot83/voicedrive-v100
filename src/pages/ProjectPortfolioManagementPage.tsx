/**
 * プロジェクトポートフォリオ管理ページ（Level 18：理事会）
 *
 * 全プロジェクトの戦略的管理と意思決定支援
 * - 戦略的優先度マトリクス（影響度×緊急度）
 * - 投資対効果（ROI）分析
 * - リソース配分の最適化提案
 * - 経営戦略との整合性評価
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, TrendingUp, DollarSign, Target, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

type TabType = 'matrix' | 'roi' | 'resources' | 'strategic_alignment';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'suspended';
  strategicImpact: number; // 1-5
  urgency: number; // 1-5
  investment: number; // 万円
  expectedReturn: number; // 万円
  roi: number; // %
  resourceAllocation: number; // 人日
  strategicAlignment: number; // 0-100
  category: string;
}

const ProjectPortfolioManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('matrix');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // デモデータ：プロジェクト一覧
  const projects: Project[] = [
    {
      id: 'P001',
      name: '電子カルテシステム刷新',
      status: 'in_progress',
      strategicImpact: 5,
      urgency: 5,
      investment: 8500,
      expectedReturn: 15000,
      roi: 76.5,
      resourceAllocation: 450,
      strategicAlignment: 95,
      category: 'DX推進'
    },
    {
      id: 'P002',
      name: '夜勤シフト最適化',
      status: 'in_progress',
      strategicImpact: 4,
      urgency: 5,
      investment: 200,
      expectedReturn: 800,
      roi: 300,
      resourceAllocation: 80,
      strategicAlignment: 88,
      category: '働き方改革'
    },
    {
      id: 'P003',
      name: '地域連携強化プロジェクト',
      status: 'planning',
      strategicImpact: 5,
      urgency: 3,
      investment: 1200,
      expectedReturn: 3500,
      roi: 191.7,
      resourceAllocation: 120,
      strategicAlignment: 92,
      category: '医療連携'
    },
    {
      id: 'P004',
      name: '新人教育プログラム改善',
      status: 'in_progress',
      strategicImpact: 3,
      urgency: 4,
      investment: 150,
      expectedReturn: 500,
      roi: 233.3,
      resourceAllocation: 60,
      strategicAlignment: 75,
      category: '人材育成'
    },
    {
      id: 'P005',
      name: '外来待ち時間改善',
      status: 'in_progress',
      strategicImpact: 3,
      urgency: 5,
      investment: 300,
      expectedReturn: 700,
      roi: 133.3,
      resourceAllocation: 100,
      strategicAlignment: 82,
      category: '患者サービス'
    },
    {
      id: 'P006',
      name: '医療機器更新計画',
      status: 'planning',
      strategicImpact: 4,
      urgency: 2,
      investment: 5000,
      expectedReturn: 8000,
      roi: 60,
      resourceAllocation: 200,
      strategicAlignment: 85,
      category: '設備投資'
    },
    {
      id: 'P007',
      name: '業務マニュアル標準化',
      status: 'in_progress',
      strategicImpact: 2,
      urgency: 3,
      investment: 80,
      expectedReturn: 250,
      roi: 212.5,
      resourceAllocation: 40,
      strategicAlignment: 68,
      category: '業務効率化'
    },
    {
      id: 'P008',
      name: '感染対策強化プロジェクト',
      status: 'completed',
      strategicImpact: 5,
      urgency: 4,
      investment: 600,
      expectedReturn: 2000,
      roi: 233.3,
      resourceAllocation: 150,
      strategicAlignment: 98,
      category: '医療安全'
    }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return '計画中';
      case 'in_progress': return '進行中';
      case 'completed': return '完了';
      case 'suspended': return '中断';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-400 bg-blue-500/20';
      case 'in_progress': return 'text-green-400 bg-green-500/20';
      case 'completed': return 'text-slate-400 bg-slate-500/20';
      case 'suspended': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getPriorityQuadrant = (impact: number, urgency: number): { label: string; color: string } => {
    if (impact >= 4 && urgency >= 4) return { label: '最優先', color: 'bg-red-500' };
    if (impact >= 4 && urgency < 4) return { label: '重要', color: 'bg-yellow-500' };
    if (impact < 4 && urgency >= 4) return { label: '緊急', color: 'bg-orange-500' };
    return { label: '通常', color: 'bg-blue-500' };
  };

  // 統計計算
  const totalInvestment = projects.reduce((sum, p) => sum + p.investment, 0);
  const totalExpectedReturn = projects.reduce((sum, p) => sum + p.expectedReturn, 0);
  const averageROI = projects.reduce((sum, p) => sum + p.roi, 0) / projects.length;
  const totalResourceAllocation = projects.reduce((sum, p) => sum + p.resourceAllocation, 0);
  const highPriorityCount = projects.filter(p => p.strategicImpact >= 4 && p.urgency >= 4).length;

  const renderMatrixTab = () => (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">総プロジェクト数</span>
          </div>
          <div className="text-3xl font-bold text-white">{projects.length}</div>
          <div className="text-xs text-green-400 mt-1">進行中: {projects.filter(p => p.status === 'in_progress').length}件</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm text-slate-400">最優先プロジェクト</span>
          </div>
          <div className="text-3xl font-bold text-white">{highPriorityCount}</div>
          <div className="text-xs text-slate-400 mt-1">影響度・緊急度が高</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">総投資額</span>
          </div>
          <div className="text-3xl font-bold text-white">{(totalInvestment / 10000).toFixed(1)}</div>
          <div className="text-xs text-slate-400 mt-1">億円</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">平均ROI</span>
          </div>
          <div className="text-3xl font-bold text-white">{averageROI.toFixed(0)}%</div>
          <div className="text-xs text-green-400 mt-1">期待リターン: {(totalExpectedReturn / 10000).toFixed(1)}億円</div>
        </div>
      </div>

      {/* 戦略的優先度マトリクス */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          戦略的優先度マトリクス（影響度 × 緊急度）
        </h3>

        {/* マトリクスグリッド */}
        <div className="relative bg-slate-900/50 rounded-lg p-8" style={{ height: '500px' }}>
          {/* 軸ラベル */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-slate-400 font-medium">
            戦略的影響度（高 ← → 低）
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-slate-400 font-medium">
            緊急度（低 ← → 高）
          </div>

          {/* グリッドライン */}
          <div className="absolute inset-8 border border-slate-700">
            <div className="absolute top-0 left-1/2 h-full w-px bg-slate-700" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700" />
          </div>

          {/* 象限ラベル */}
          <div className="absolute top-12 right-12 text-red-400 font-medium text-sm">最優先</div>
          <div className="absolute top-12 left-12 text-yellow-400 font-medium text-sm">重要</div>
          <div className="absolute bottom-12 right-12 text-orange-400 font-medium text-sm">緊急</div>
          <div className="absolute bottom-12 left-12 text-blue-400 font-medium text-sm">通常</div>

          {/* プロジェクトプロット */}
          {projects.map((project) => {
            const x = (project.urgency / 5) * 80 + 10; // 10-90%
            const y = 90 - (project.strategicImpact / 5) * 80; // 反転（上が高い）
            const quadrant = getPriorityQuadrant(project.strategicImpact, project.urgency);

            return (
              <div
                key={project.id}
                className="absolute group cursor-pointer"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className={`w-4 h-4 ${quadrant.color} rounded-full border-2 border-white shadow-lg group-hover:scale-150 transition-transform`} />
                <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-slate-300 mt-1">
                    影響度: {project.strategicImpact}/5 | 緊急度: {project.urgency}/5
                  </div>
                  <div className="text-slate-300">
                    優先度: <span className={`${quadrant.color} px-1 rounded text-white`}>{quadrant.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 優先度別プロジェクト一覧 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">優先度別プロジェクト一覧</h3>
        <div className="space-y-2">
          {projects
            .sort((a, b) => (b.strategicImpact + b.urgency) - (a.strategicImpact + a.urgency))
            .map((project) => {
              const quadrant = getPriorityQuadrant(project.strategicImpact, project.urgency);
              return (
                <div key={project.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 ${quadrant.color} rounded-full`} />
                    <div>
                      <div className="text-white font-medium">{project.name}</div>
                      <div className="text-sm text-slate-400">{project.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm">
                      <span className="text-slate-400">影響度: </span>
                      <span className="text-white font-medium">{project.strategicImpact}/5</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-400">緊急度: </span>
                      <span className="text-white font-medium">{project.urgency}/5</span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  const renderROITab = () => (
    <div className="space-y-6">
      {/* ROIサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">総投資額</div>
          <div className="text-3xl font-bold text-white">{(totalInvestment / 10000).toFixed(2)}億円</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">期待リターン</div>
          <div className="text-3xl font-bold text-green-400">{(totalExpectedReturn / 10000).toFixed(2)}億円</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">ポートフォリオROI</div>
          <div className="text-3xl font-bold text-cyan-400">{((totalExpectedReturn / totalInvestment - 1) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* プロジェクト別ROI */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          投資対効果（ROI）分析
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">プロジェクト</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">投資額</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">期待リターン</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">ROI</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {projects
                .sort((a, b) => b.roi - a.roi)
                .map((project) => (
                  <tr key={project.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{project.name}</div>
                      <div className="text-xs text-slate-400">{project.category}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{project.investment.toLocaleString()}万円</td>
                    <td className="py-3 px-4 text-right text-green-400">{project.expectedReturn.toLocaleString()}万円</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${project.roi >= 150 ? 'text-green-400' : project.roi >= 100 ? 'text-yellow-400' : 'text-orange-400'}`}>
                        {project.roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROI分布 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">ROI分布</h3>
        <div className="space-y-3">
          {[
            { range: '300%以上', count: projects.filter(p => p.roi >= 300).length, color: 'bg-green-500' },
            { range: '200-299%', count: projects.filter(p => p.roi >= 200 && p.roi < 300).length, color: 'bg-lime-500' },
            { range: '100-199%', count: projects.filter(p => p.roi >= 100 && p.roi < 200).length, color: 'bg-yellow-500' },
            { range: '50-99%', count: projects.filter(p => p.roi >= 50 && p.roi < 100).length, color: 'bg-orange-500' },
            { range: '50%未満', count: projects.filter(p => p.roi < 50).length, color: 'bg-red-500' }
          ].map((item) => (
            <div key={item.range} className="flex items-center gap-4">
              <div className="w-32 text-sm text-slate-300">{item.range}</div>
              <div className="flex-1 h-8 bg-slate-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${item.color} flex items-center justify-end px-3 text-white text-sm font-medium`}
                  style={{ width: `${(item.count / projects.length) * 100}%` }}
                >
                  {item.count > 0 && `${item.count}件`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {/* リソースサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">総リソース配分</div>
          <div className="text-3xl font-bold text-white">{totalResourceAllocation}</div>
          <div className="text-xs text-slate-400 mt-1">人日</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">プロジェクト平均</div>
          <div className="text-3xl font-bold text-cyan-400">{(totalResourceAllocation / projects.length).toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-1">人日/プロジェクト</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">最大リソースPJ</div>
          <div className="text-3xl font-bold text-purple-400">{Math.max(...projects.map(p => p.resourceAllocation))}</div>
          <div className="text-xs text-slate-400 mt-1">人日</div>
        </div>
      </div>

      {/* リソース配分詳細 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">プロジェクト別リソース配分</h3>
        <div className="space-y-3">
          {projects
            .sort((a, b) => b.resourceAllocation - a.resourceAllocation)
            .map((project) => (
              <div key={project.id} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-medium">{project.name}</div>
                    <div className="text-sm text-slate-400">{project.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{project.resourceAllocation}人日</div>
                    <div className="text-xs text-slate-400">
                      {((project.resourceAllocation / totalResourceAllocation) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${(project.resourceAllocation / Math.max(...projects.map(p => p.resourceAllocation))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 最適化提案 */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="text-blue-300 font-medium mb-1">リソース配分最適化提案</div>
            <div className="text-sm text-blue-200/80 space-y-1">
              <p>• 電子カルテシステム刷新（ROI 76.5%）へのリソース集中を推奨</p>
              <p>• 夜勤シフト最適化（ROI 300%）は少リソースで高効果 - 優先推進</p>
              <p>• 業務マニュアル標準化は他プロジェクトへのリソース再配分を検討</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategicAlignmentTab = () => (
    <div className="space-y-6">
      {/* 整合性サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">平均整合性スコア</div>
          <div className="text-3xl font-bold text-white">
            {(projects.reduce((sum, p) => sum + p.strategicAlignment, 0) / projects.length).toFixed(0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">/ 100点</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">高整合性PJ（80点以上）</div>
          <div className="text-3xl font-bold text-green-400">
            {projects.filter(p => p.strategicAlignment >= 80).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">/ {projects.length}件</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-2">要再評価PJ（70点未満）</div>
          <div className="text-3xl font-bold text-yellow-400">
            {projects.filter(p => p.strategicAlignment < 70).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">/ {projects.length}件</div>
        </div>
      </div>

      {/* 経営戦略との整合性 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">経営戦略との整合性評価</h3>
        <div className="space-y-3">
          {projects
            .sort((a, b) => b.strategicAlignment - a.strategicAlignment)
            .map((project) => (
              <div key={project.id} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{project.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{project.category}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      project.strategicAlignment >= 90 ? 'text-green-400' :
                      project.strategicAlignment >= 80 ? 'text-cyan-400' :
                      project.strategicAlignment >= 70 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {project.strategicAlignment}
                    </div>
                    <div className="text-xs text-slate-400">/ 100点</div>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      project.strategicAlignment >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      project.strategicAlignment >= 80 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      project.strategicAlignment >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                    style={{ width: `${project.strategicAlignment}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 戦略的提言 */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <div className="text-purple-300 font-medium mb-1">経営戦略整合性評価</div>
            <div className="text-sm text-purple-200/80 space-y-1">
              <p>✓ DX推進・医療安全関連プロジェクトは戦略との整合性が高く、継続推進を推奨</p>
              <p>✓ 業務効率化プロジェクトは整合性スコアが低め - 経営戦略との関連性を再確認</p>
              <p>✓ 全体的に戦略整合性は良好（平均{(projects.reduce((sum, p) => sum + p.strategicAlignment, 0) / projects.length).toFixed(0)}点）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-6 h-6 text-purple-400" />
                プロジェクトポートフォリオ管理
              </h1>
              <p className="text-sm text-slate-400">戦略的意思決定のための全プロジェクト俯瞰と分析</p>
            </div>
          </div>

          {/* カテゴリーフィルター */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600 focus:outline-none focus:border-purple-500"
          >
            <option value="all">全カテゴリー</option>
            <option value="DX推進">DX推進</option>
            <option value="働き方改革">働き方改革</option>
            <option value="医療連携">医療連携</option>
            <option value="人材育成">人材育成</option>
            <option value="患者サービス">患者サービス</option>
            <option value="設備投資">設備投資</option>
            <option value="業務効率化">業務効率化</option>
            <option value="医療安全">医療安全</option>
          </select>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="p-6">
        {/* タブナビゲーション */}
        <div className="flex gap-2 mb-6 border-b border-slate-700/50">
          {[
            { id: 'matrix', label: '優先度マトリクス', icon: LayoutGrid },
            { id: 'roi', label: 'ROI分析', icon: DollarSign },
            { id: 'resources', label: 'リソース配分', icon: Target },
            { id: 'strategic_alignment', label: '戦略整合性', icon: CheckCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === id
                  ? 'text-purple-400 border-purple-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'matrix' && renderMatrixTab()}
        {activeTab === 'roi' && renderROITab()}
        {activeTab === 'resources' && renderResourcesTab()}
        {activeTab === 'strategic_alignment' && renderStrategicAlignmentTab()}
      </div>
    </div>
  );
};

export default ProjectPortfolioManagementPage;
