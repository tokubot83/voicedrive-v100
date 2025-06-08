import { Post } from '../types';

interface ActiveProjectCardProps {
  project: Post;
}

const ActiveProjectCard = ({ project }: ActiveProjectCardProps) => {
  // サンプルのマイルストーンデータ
  const milestones = [
    { id: 1, name: '要件定義', completed: true, current: false },
    { id: 2, name: 'システム設計', completed: true, current: false },
    { id: 3, name: '実装・開発', completed: false, current: true },
    { id: 4, name: 'テスト・検証', completed: false, current: false },
    { id: 5, name: '導入・運用開始', completed: false, current: false }
  ];

  // サンプルのプロジェクトデータ
  const projectData = {
    manager: project.author.name,
    team: ['佐藤薬剤師', '田中SE', '鈴木看護師'],
    startDate: '2024年3月1日',
    expectedEndDate: '2024年6月30日',
    budget: 2500000,
    currentSpend: 850000,
    roi: {
      investment: 2500000,
      expectedSavings: 8500000
    }
  };

  const completedMilestones = milestones.filter(m => m.completed).length;
  const progress = (completedMilestones / milestones.length) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(29,155,240,0.1)] transition-all duration-300">
      {/* プロジェクトヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">
            {project.content.substring(0, 50)}...
          </h3>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full">
              🚀 実装フェーズ
            </span>
            <span className="text-sm text-gray-400">
              開始日: {projectData.startDate}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{progress.toFixed(0)}%</div>
          <div className="text-xs text-gray-400">完了</div>
        </div>
      </div>

      {/* マイルストーン進捗 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">マイルストーン進捗</h4>
        <div className="space-y-2">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center gap-3">
              <div className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${milestone.completed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                 milestone.current ? 'bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 
                 'bg-gray-600'}
              `}></div>
              <span className={`text-sm ${
                milestone.completed ? 'text-gray-300 line-through' :
                milestone.current ? 'text-blue-400 font-semibold' :
                'text-gray-500'
              }`}>
                {milestone.name}
              </span>
              {milestone.current && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  進行中
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* プロジェクト詳細 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">予算執行率</div>
          <div className="text-lg font-bold text-orange-400">
            {((projectData.currentSpend / projectData.budget) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">
            ¥{projectData.currentSpend.toLocaleString()} / ¥{projectData.budget.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">期待ROI</div>
          <div className="text-lg font-bold text-green-400">
            {((projectData.roi.expectedSavings / projectData.roi.investment - 1) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">
            ¥{projectData.roi.expectedSavings.toLocaleString()}の削減見込み
          </div>
        </div>
      </div>

      {/* チームメンバー */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">プロジェクトチーム</h4>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {projectData.team.map((member, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800"
                title={member}
              >
                {member.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-400 ml-2">
            {projectData.manager} (PM) + {projectData.team.length}名
          </span>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300">
          📊 詳細レポート
        </button>
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300">
          💬 進捗確認
        </button>
      </div>
    </div>
  );
};

export default ActiveProjectCard;