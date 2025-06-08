import React from 'react';
import { Post } from '../types';

interface ActiveProjectCardProps {
  project: Post;
}

const ActiveProjectCard: React.FC<ActiveProjectCardProps> = ({ project }) => {
  const { projectDetails } = project;
  
  if (!projectDetails) return null;
  
  // マイルストーンの進捗を計算
  const completedMilestones = projectDetails.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = projectDetails.milestones?.length || 0;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  return (
    <article className="border-b border-gray-800/50 p-5 hover:bg-white/[0.02] transition-all duration-300">
      {/* プロジェクトヘッダー */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_15px_rgba(16,185,129,0.4)]">
          🚀
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              アクティブプロジェクト
            </span>
            <span className="text-sm text-gray-500">
              • {new Date(project.timestamp).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{project.content}</h3>
          
          {/* プロジェクト情報 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">👤</span>
              マネージャー: {projectDetails.manager || '未定'}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-400">👥</span>
              チーム: {projectDetails.team?.length || 0}名
            </span>
            {projectDetails.roi && (
              <span className="flex items-center gap-1">
                <span className="text-green-400">💰</span>
                期待ROI: {((projectDetails.roi.expectedSavings / projectDetails.roi.investment - 1) * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* プロジェクトカード本体 */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-6 border border-green-500/20">
        {/* 進捗バー */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">全体進捗</span>
            <span className="text-sm font-bold text-green-400">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* マイルストーン */}
        {projectDetails.milestones && projectDetails.milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-300 mb-3">マイルストーン</h4>
            {projectDetails.milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  milestone.completed ? 'bg-green-500' : 
                  milestone.current ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                }`}></div>
                <span className={`text-sm flex-1 ${
                  milestone.completed ? 'text-gray-400 line-through' : 
                  milestone.current ? 'text-white font-medium' : 'text-gray-500'
                }`}>
                  {milestone.name}
                </span>
                {milestone.targetDate && (
                  <span className="text-xs text-gray-500">
                    {new Date(milestone.targetDate).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ROI情報 */}
        {projectDetails.roi && (
          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-around text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">投資額</p>
              <p className="text-lg font-bold text-orange-400">
                ¥{(projectDetails.roi.investment / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">期待削減額</p>
              <p className="text-lg font-bold text-green-400">
                ¥{(projectDetails.roi.expectedSavings / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">ROI</p>
              <p className="text-lg font-bold text-blue-400">
                {((projectDetails.roi.expectedSavings / projectDetails.roi.investment - 1) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 mt-4">
        <button className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-sm font-medium">
          <span className="mr-2">📊</span>
          詳細を見る
        </button>
        <button className="flex-1 py-2 px-4 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 rounded-xl transition-colors text-sm font-medium text-green-400">
          <span className="mr-2">💬</span>
          進捗を共有
        </button>
      </div>
    </article>
  );
};

export default ActiveProjectCard;