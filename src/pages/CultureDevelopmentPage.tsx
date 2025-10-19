/**
 * 組織文化開発ページ
 * Level 14-17（人事部門）専用
 *
 * 組織文化の診断、改善施策管理、効果測定
 */

import React, { useState, useEffect } from 'react';
import { cultureDevelopmentService } from '../services/CultureDevelopmentService';
import {
  CultureAssessment,
  CultureSummary,
  CultureInitiative,
  getCultureScoreInfo,
  getCultureTrendInfo,
  getInitiativeStatusInfo,
  getInitiativePriorityInfo,
} from '../types/cultureDevelopment';
import { Sparkles, TrendingUp, Target, CheckCircle } from 'lucide-react';

const CultureDevelopmentPage: React.FC = () => {
  const [assessment, setAssessment] = useState<CultureAssessment | null>(null);
  const [summary, setSummary] = useState<CultureSummary | null>(null);
  const [initiatives, setInitiatives] = useState<CultureInitiative[]>([]);
  const [selectedTab, setSelectedTab] = useState<'assessment' | 'initiatives'>('assessment');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const assessmentData = cultureDevelopmentService.getAssessment();
    const summaryData = cultureDevelopmentService.getSummary();
    const initiativesData = cultureDevelopmentService.getAllInitiatives();
    setAssessment(assessmentData);
    setSummary(summaryData);
    setInitiatives(initiativesData);
    setLoading(false);
  };

  if (loading || !assessment || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  const scoreInfo = getCultureScoreInfo(assessment.overallScore);
  const trendInfo = getCultureTrendInfo(assessment.trend);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">🌱 組織文化開発</h1>
              <p className="text-slate-400 mt-1">
                文化診断・施策管理・効果測定
              </p>
            </div>
          </div>

          {/* タブ */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('assessment')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedTab === 'assessment'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              📊 文化診断
            </button>
            <button
              onClick={() => setSelectedTab('initiatives')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedTab === 'initiatives'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              🎯 改善施策
            </button>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 総合スコア */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <span className={`text-sm ${scoreInfo.color} px-2 py-1 rounded`}>
                {scoreInfo.icon} {scoreInfo.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{assessment.overallScore}</div>
            <div className="text-sm text-slate-400">総合スコア</div>
            <div className="mt-2 text-sm flex items-center gap-2">
              <span className={trendInfo.color}>
                {trendInfo.icon} {trendInfo.label}
              </span>
              <span className="text-slate-500">
                ({summary.scoreChange >= 0 ? '+' : ''}{summary.scoreChange})
              </span>
            </div>
          </div>

          {/* 実施中施策 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-600/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{summary.activeInitiatives}</div>
            <div className="text-sm text-slate-400">実施中の施策</div>
            <div className="mt-2 text-sm text-slate-500">
              順調: {summary.initiativesOnTrack} / 遅延: {summary.initiativesDelayed}
            </div>
          </div>

          {/* 完了施策 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{summary.completedInitiatives}</div>
            <div className="text-sm text-slate-400">完了した施策</div>
            <div className="mt-2 text-sm text-slate-500">
              高影響: {summary.highImpactInitiatives}件
            </div>
          </div>

          {/* 平均改善率 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-600/20 rounded-lg">
                <Target className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {summary.averageImprovement.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">平均改善率</div>
            <div className="mt-2 text-sm text-slate-500">
              完了施策の効果
            </div>
          </div>
        </div>

        {/* タブコンテンツ */}
        {selectedTab === 'assessment' && (
          <>
            {/* 文化次元スコア */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700 mb-8">
              <h3 className="text-lg font-semibold text-white mb-6">文化次元別スコア</h3>
              <div className="space-y-6">
                {assessment.dimensions.map((dim, index) => {
                  const dimScoreInfo = getCultureScoreInfo(dim.score);
                  return (
                    <div key={index} className="border-b border-slate-700 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            {dim.name}
                            <span className={`text-xs ${dimScoreInfo.color} px-2 py-1 rounded`}>
                              {dim.score}点
                            </span>
                          </h4>
                          <p className="text-sm text-slate-400 mt-1">{dim.description}</p>
                        </div>
                        <div className="text-sm">
                          {dim.change > 0 && (
                            <span className="text-emerald-400">▲ +{dim.change}</span>
                          )}
                          {dim.change < 0 && (
                            <span className="text-red-400">▼ {dim.change}</span>
                          )}
                          {dim.change === 0 && (
                            <span className="text-slate-500">→ 0</span>
                          )}
                        </div>
                      </div>

                      {/* プログレスバー */}
                      <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            dim.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                            dim.score >= 70 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                            dim.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                            'bg-gradient-to-r from-yellow-500 to-yellow-400'
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>

                      {/* 指標 */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {dim.indicators.map((indicator, idx) => (
                          <div key={idx} className="bg-slate-700/50 rounded p-2">
                            <div className="text-xs text-slate-400 mb-1">{indicator.name}</div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white font-semibold">{indicator.value}</span>
                              <span className="text-xs text-slate-500">
                                目標: {indicator.target}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 推奨アクション */}
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3">
                        <div className="text-xs text-blue-300 font-semibold mb-2">💡 推奨アクション:</div>
                        <ul className="text-xs text-blue-200 space-y-1">
                          {dim.recommendedActions.map((action, idx) => (
                            <li key={idx}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 部門別スコア */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-6">部門別スコア</h3>
              <div className="space-y-4">
                {assessment.byDepartment.map((dept, index) => {
                  const deptScoreInfo = getCultureScoreInfo(dept.overallScore);
                  return (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-slate-500">#{dept.rank}</div>
                          <div>
                            <div className="text-white font-semibold">{dept.department}</div>
                            <div className="text-sm text-slate-400">
                              参加率: {dept.participationRate}%
                            </div>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${deptScoreInfo.color}`}>
                          {dept.overallScore}
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                          style={{ width: `${dept.overallScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {selectedTab === 'initiatives' && (
          <div className="space-y-4">
            {initiatives.map((initiative) => {
              const statusInfo = getInitiativeStatusInfo(initiative.status);
              const priorityInfo = getInitiativePriorityInfo(initiative.priority);

              return (
                <div
                  key={initiative.id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{initiative.title}</h3>
                        <span className={`text-xs ${statusInfo.color} px-2 py-1 rounded`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        <span className={`text-xs ${priorityInfo.color} px-2 py-1 rounded`}>
                          {priorityInfo.icon} {priorityInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{initiative.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>目標: {initiative.objective}</span>
                        <span>•</span>
                        <span>担当: {initiative.ownerName}</span>
                        <span>•</span>
                        <span>
                          {initiative.startDate.toLocaleDateString()} 〜 {initiative.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 進捗バー */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">進捗</span>
                      <span className="text-sm text-white font-semibold">{initiative.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                        style={{ width: `${initiative.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* KPI */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {initiative.kpis.map((kpi, idx) => (
                      <div key={idx} className="bg-slate-700/50 rounded p-3">
                        <div className="text-sm text-slate-400 mb-1">{kpi.name}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-white">{kpi.current}</span>
                          <span className="text-sm text-slate-400">{kpi.unit}</span>
                          <span className="text-xs text-slate-500 ml-auto">
                            目標: {kpi.target}{kpi.unit}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          達成率: {kpi.achievement}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 成果（完了施策のみ） */}
                  {initiative.outcomes && (
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded p-3">
                      <div className="text-sm text-emerald-300 font-semibold mb-2">
                        ✅ 成果
                      </div>
                      <p className="text-sm text-emerald-200 mb-2">{initiative.outcomes.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {initiative.outcomes.metrics.map((metric, idx) => (
                          <div key={idx} className="text-xs text-emerald-200">
                            {metric.name}: {metric.before} → {metric.after} (
                            <span className="text-emerald-400 font-semibold">
                              +{metric.improvement.toFixed(1)}%
                            </span>
                            )
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CultureDevelopmentPage;
