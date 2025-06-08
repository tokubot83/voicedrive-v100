import React from 'react';
import { Post } from '../types';

interface CompletedProjectCardProps {
  project: Post;
}

const CompletedProjectCard: React.FC<CompletedProjectCardProps> = ({ project }) => {
  const { projectDetails } = project;
  
  if (!projectDetails) return null;
  
  // 実際のROIを計算（仮のデータ）
  const actualROI = projectDetails.roi ? 
    ((projectDetails.roi.expectedSavings * 1.2) / projectDetails.roi.investment - 1) * 100 : 0;
  
  return (
    <article className="border-b border-gray-800/50 p-5 hover:bg-white/[0.02] transition-all duration-300">
      {/* プロジェクトヘッダー */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_15px_rgba(59,130,246,0.4)]">
          ✅
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              完了プロジェクト
            </span>
            <span className="text-sm text-gray-500">
              • 完了日: {projectDetails.completedDate ? 
                new Date(projectDetails.completedDate).toLocaleDateString('ja-JP') : 
                '2024年3月15日'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{project.content}</h3>
        </div>
      </div>

      {/* 成果サマリーカード */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-6 border border-blue-500/20">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          プロジェクト成果
        </h4>

        {/* 成果指標 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">実施期間</p>
            <p className="text-xl font-bold text-white">3ヶ月</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">参加メンバー</p>
            <p className="text-xl font-bold text-blue-400">
              {projectDetails.team?.length || 8}名
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">達成率</p>
            <p className="text-xl font-bold text-green-400">120%</p>
          </div>
        </div>

        {/* ROI実績 */}
        {projectDetails.roi && (
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30 mb-6">
            <h5 className="text-sm font-bold text-green-400 mb-3">💰 投資対効果（ROI）</h5>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400 mb-1">投資額</p>
                <p className="text-lg font-bold text-orange-400">
                  ¥{(projectDetails.roi.investment / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">実際の削減額</p>
                <p className="text-lg font-bold text-green-400">
                  ¥{(projectDetails.roi.expectedSavings * 1.2 / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">実績ROI</p>
                <p className="text-lg font-bold text-blue-400">
                  {actualROI.toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500">
                予想を20%上回る成果を達成！ 🎉
              </span>
            </div>
          </div>
        )}

        {/* 主な成果 */}
        <div className="space-y-2">
          <h5 className="text-sm font-bold text-gray-300 mb-2">📋 主な成果</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-gray-300">
                {projectDetails.outcomes || '夜勤シフトの負担を30%軽減、職員満足度が15%向上'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-gray-300">
                時間外労働を月平均10時間削減
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-gray-300">
                患者ケアの質向上（満足度スコア4.2→4.6）
              </span>
            </div>
          </div>
        </div>

        {/* 学びと展開 */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            💡 このプロジェクトの成功事例は他部署への展開が検討されています
          </p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 mt-4">
        <button className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-sm font-medium">
          <span className="mr-2">📄</span>
          詳細レポート
        </button>
        <button className="flex-1 py-2 px-4 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-xl transition-colors text-sm font-medium text-blue-400">
          <span className="mr-2">🔄</span>
          類似提案を探す
        </button>
      </div>
    </article>
  );
};

export default CompletedProjectCard;