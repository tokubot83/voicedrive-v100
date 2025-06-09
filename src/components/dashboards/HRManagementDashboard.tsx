// 人事統括ダッシュボード - LEVEL_5 (人財統括本部部門長)
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useDemoMode } from '../demo/DemoModeController';

const HRManagementDashboard: React.FC = () => {
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();

  // ダミーデータ
  const hrMetrics = {
    totalEmployees: 1250,
    newHires: { thisMonth: 15, ytd: 120 },
    turnover: { rate: 8.5, target: 10 },
    training: { completed: 2850, scheduled: 420 },
    satisfaction: 82,
    diversity: { gender: 48, age: 'balanced' }
  };

  const talentPipeline = [
    { level: 'エグゼクティブ', current: 8, pipeline: 3, readiness: 85 },
    { level: 'シニアマネジメント', current: 24, pipeline: 12, readiness: 78 },
    { level: 'ミドルマネジメント', current: 86, pipeline: 45, readiness: 82 },
    { level: 'スペシャリスト', current: 156, pipeline: 89, readiness: 91 }
  ];

  const departments = [
    { name: '医療部門', employees: 450, satisfaction: 85, turnover: 6.2 },
    { name: '看護部門', employees: 380, satisfaction: 83, turnover: 7.8 },
    { name: '管理部門', employees: 220, satisfaction: 80, turnover: 9.5 },
    { name: '技術部門', employees: 200, satisfaction: 87, turnover: 5.3 }
  ];

  const recruitmentStatus = [
    { position: '看護師', openings: 12, applications: 85, interviews: 23, offers: 5 },
    { position: '医師', openings: 5, applications: 32, interviews: 12, offers: 2 },
    { position: 'エンジニア', openings: 8, applications: 156, interviews: 34, offers: 6 }
  ];

  const trainingPrograms = [
    { name: 'リーダーシップ研修', participants: 45, completion: 78, satisfaction: 92 },
    { name: '技術スキル向上', participants: 120, completion: 85, satisfaction: 88 },
    { name: 'コンプライアンス', participants: 1250, completion: 95, satisfaction: 75 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl p-6 backdrop-blur-xl border border-emerald-500/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">👥</span>
          人事統括ダッシュボード
        </h1>
        <p className="text-gray-300">
          人財統括本部 - 組織全体の人材戦略管理
        </p>
      </div>

      {/* 主要指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">総従業員数</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-white">{hrMetrics.totalEmployees.toLocaleString()}</div>
          <div className="text-sm text-green-400 mt-1">+{hrMetrics.newHires.thisMonth} 今月</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">離職率</span>
            <span className="text-2xl">📉</span>
          </div>
          <div className="text-3xl font-bold text-white">{hrMetrics.turnover.rate}%</div>
          <div className="text-sm text-green-400 mt-1">目標: {hrMetrics.turnover.target}%以下</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">従業員満足度</span>
            <span className="text-2xl">😊</span>
          </div>
          <div className="text-3xl font-bold text-white">{hrMetrics.satisfaction}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
              style={{ width: `${hrMetrics.satisfaction}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">研修完了</span>
            <span className="text-2xl">🎓</span>
          </div>
          <div className="text-3xl font-bold text-white">{hrMetrics.training.completed.toLocaleString()}</div>
          <div className="text-sm text-blue-400 mt-1">{hrMetrics.training.scheduled} 予定</div>
        </div>
      </div>

      {/* タレントパイプライン */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          タレントパイプライン
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-400">レベル</th>
                <th className="pb-3 text-gray-400 text-right">現在</th>
                <th className="pb-3 text-gray-400 text-right">候補者</th>
                <th className="pb-3 text-gray-400 text-right">準備度</th>
                <th className="pb-3 text-gray-400">進捗</th>
              </tr>
            </thead>
            <tbody>
              {talentPipeline.map((level, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 text-white">{level.level}</td>
                  <td className="py-3 text-white text-right">{level.current}</td>
                  <td className="py-3 text-blue-400 text-right">{level.pipeline}</td>
                  <td className="py-3 text-white text-right">{level.readiness}%</td>
                  <td className="py-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${level.readiness}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 部門別状況 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            部門別人材状況
          </h2>
          <div className="space-y-3">
            {departments.map((dept, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{dept.name}</h3>
                  <span className="text-gray-400">{dept.employees}名</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">満足度:</span>
                    <span className="text-white ml-2">{dept.satisfaction}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">離職率:</span>
                    <span className={`ml-2 ${dept.turnover < 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {dept.turnover}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 採用状況 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            採用パイプライン
          </h2>
          <div className="space-y-3">
            {recruitmentStatus.map((position, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">{position.position}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">募集: {position.openings}</span>
                  <span className="text-blue-400">応募: {position.applications}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-blue-500/30 rounded-full" style={{ width: '100%' }}></div>
                    <div className="absolute inset-y-0 left-0 bg-yellow-500/50 rounded-full" style={{ width: `${(position.interviews / position.applications) * 100}%` }}></div>
                    <div className="absolute inset-y-0 left-0 bg-green-500 rounded-full" style={{ width: `${(position.offers / position.applications) * 100}%` }}></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                      面接{position.interviews} → 内定{position.offers}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 研修プログラム */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          研修プログラム実施状況
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trainingPrograms.map((program, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-700/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
              <h3 className="text-white font-medium mb-3">{program.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">参加者</span>
                  <span className="text-white">{program.participants}名</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">完了率</span>
                  <span className="text-green-400">{program.completion}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">満足度</span>
                  <span className="text-blue-400">{program.satisfaction}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRManagementDashboard;