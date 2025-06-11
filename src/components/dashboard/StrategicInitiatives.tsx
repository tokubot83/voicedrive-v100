import React, { useState } from 'react';
import { Rocket, Target, Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { StrategicInitiative } from '../../types/staffDashboard';

interface StrategicInitiativesProps {
  initiatives: StrategicInitiative[];
}

const StrategicInitiatives: React.FC<StrategicInitiativesProps> = ({ initiatives }) => {
  const [selectedInitiative, setSelectedInitiative] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in-progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'planned': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'on-hold': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '完了';
      case 'in-progress': return '進行中';
      case 'planned': return '計画中';
      case 'on-hold': return '保留中';
      default: return '不明';
    }
  };

  const getProgressColor = (progress: number) => {
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

  const getMetricColor = (value: number, threshold: number) => {
    if (value >= threshold * 0.9) return 'text-green-400';
    if (value >= threshold * 0.7) return 'text-blue-400';
    if (value >= threshold * 0.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Rocket className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">戦略的イニシアチブ</h3>
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
          {initiatives.length}件
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
            {initiatives.length > 0 ? Math.round(initiatives.reduce((sum, i) => sum + i.progress, 0) / initiatives.length) : 0}%
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">平均ROI</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {initiatives.length > 0 ? (initiatives.reduce((sum, i) => sum + i.expectedROI, 0) / initiatives.length).toFixed(1) : 0}x
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">参加施設</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {new Set(initiatives.flatMap(i => i.involvedFacilities)).size}
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400 text-sm">要注意</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {initiatives.filter(i => i.keyMetrics.participationRate < 0.7 || i.progress < 40).length}
          </div>
        </div>
      </div>

      {/* イニシアチブ一覧 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">進行中イニシアチブ</h4>
        
        <div className="space-y-4">
          {initiatives.map((initiative) => {
            const isExpanded = selectedInitiative === initiative.initiativeId;
            
            return (
              <div
                key={initiative.initiativeId}
                className="bg-slate-700/30 rounded-lg overflow-hidden transition-all duration-300 hover:bg-slate-700/50"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedInitiative(isExpanded ? null : initiative.initiativeId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="text-white font-medium">{initiative.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(initiative.status)}`}>
                          {getStatusLabel(initiative.status)}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {initiative.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{initiative.involvedFacilities.length}施設</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className={getRoiColor(initiative.expectedROI)}>
                            ROI {initiative.expectedROI}x
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>進捗 {initiative.progress}%</span>
                        </div>
                      </div>
                    </div>

                    <button className="text-gray-400 hover:text-white transition-colors ml-4">
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

                  {/* プログレスバー */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(initiative.progress)}`}
                        style={{ width: `${initiative.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 展開コンテンツ */}
                {isExpanded && (
                  <div className="border-t border-slate-600/50 p-4 bg-slate-800/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 参加施設 */}
                      <div>
                        <h6 className="text-sm font-medium text-gray-400 mb-3">参加施設</h6>
                        <div className="space-y-2">
                          {initiative.involvedFacilities.map((facility, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-cyan-400" />
                              <span className="text-gray-300 text-sm">{facility}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* キーメトリクス */}
                      <div>
                        <h6 className="text-sm font-medium text-gray-400 mb-3">キーメトリクス</h6>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">参加率</span>
                            <span className={`text-sm font-medium ${getMetricColor(initiative.keyMetrics.participationRate, 0.8)}`}>
                              {(initiative.keyMetrics.participationRate * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">完了率</span>
                            <span className={`text-sm font-medium ${getMetricColor(initiative.keyMetrics.completionRate, 0.8)}`}>
                              {(initiative.keyMetrics.completionRate * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">満足度</span>
                            <span className={`text-sm font-medium ${getMetricColor(initiative.keyMetrics.satisfactionScore, 4.0)}`}>
                              {initiative.keyMetrics.satisfactionScore.toFixed(1)}/5.0
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-colors">
                        詳細レポート
                      </button>
                      <button className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors">
                        進捗更新
                      </button>
                      {initiative.keyMetrics.participationRate < 0.7 && (
                        <button className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors">
                          改善策検討
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* イニシアチブステータス分析 */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">イニシアチブ分析</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {initiatives.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-sm text-green-300">完了済み</div>
          </div>
          
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {initiatives.filter(i => i.status === 'in-progress').length}
            </div>
            <div className="text-sm text-blue-300">進行中</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {initiatives.filter(i => i.status === 'planned').length}
            </div>
            <div className="text-sm text-yellow-300">計画中</div>
          </div>
          
          <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">
              {initiatives.filter(i => i.status === 'on-hold').length}
            </div>
            <div className="text-sm text-orange-300">保留中</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicInitiatives;