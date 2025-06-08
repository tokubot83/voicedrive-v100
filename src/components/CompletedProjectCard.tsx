import { Post } from '../types';

interface CompletedProjectCardProps {
  project: Post;
}

const CompletedProjectCard = ({ project }: CompletedProjectCardProps) => {
  // サンプルの完了プロジェクトデータ
  const completedData = {
    completionDate: '2024年2月28日',
    duration: '4ヶ月',
    finalBudget: 2350000,
    actualSavings: 9200000,
    achievements: [
      '夜勤職員の満足度が85%向上',
      '患者ケアの質スコアが15ポイント改善',
      '年間残業時間を40%削減',
      '離職率が前年比で30%減少'
    ],
    lessons: [
      '段階的な移行が効果的だった',
      '職員の声を継続的に聞くことが重要',
      'シミュレーション期間の設定が成功の鍵'
    ]
  };

  const roi = ((completedData.actualSavings / completedData.finalBudget - 1) * 100).toFixed(0);
  const efficiencyRate = ((completedData.actualSavings / 8500000) * 100).toFixed(0);

  return (
    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30 rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(34,197,94,0.1)] transition-all duration-300">
      {/* プロジェクトヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">
            {project.content.substring(0, 50)}...
          </h3>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-[0_2px_10px_rgba(34,197,94,0.3)]">
              ✅ 完了済み
            </span>
            <span className="text-sm text-gray-400">
              完了日: {completedData.completionDate}
            </span>
            <span className="text-sm text-gray-400">
              期間: {completedData.duration}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{roi}%</div>
          <div className="text-xs text-gray-400">ROI達成</div>
        </div>
      </div>

      {/* 成果サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            ¥{completedData.actualSavings.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">実際の削減額</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {efficiencyRate}%
          </div>
          <div className="text-xs text-gray-400">目標達成率</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            A+
          </div>
          <div className="text-xs text-gray-400">評価スコア</div>
        </div>
      </div>

      {/* 主な成果 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">🎯 主な成果</h4>
        <div className="space-y-2">
          {completedData.achievements.map((achievement, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-sm text-gray-300">{achievement}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 学んだこと */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">💡 得られた知見</h4>
        <div className="space-y-2">
          {completedData.lessons.map((lesson, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span className="text-sm text-gray-400">{lesson}</span>
            </div>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300">
          📄 完了レポート
        </button>
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300">
          🔄 類似プロジェクト
        </button>
      </div>
    </div>
  );
};

export default CompletedProjectCard;