import React from 'react';
import { Calendar, DollarSign, Users, Target, AlertTriangle, TrendingUp } from 'lucide-react';

interface ProjectDetailsProps {
  data: any;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ data }) => {
  const milestones = [
    { name: '要件定義', status: 'completed', date: '2024/04/15' },
    { name: '設計フェーズ', status: 'completed', date: '2024/05/01' },
    { name: '第1次実装', status: 'completed', date: '2024/05/20' },
    { name: '第2次実装', status: 'active', date: '2024/06/15' },
    { name: 'テスト・検証', status: 'upcoming', date: '2024/07/01' },
    { name: '本番導入', status: 'upcoming', date: '2024/07/15' }
  ];

  return (
    <div className="space-y-4">
      {/* プロジェクト概要 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Calendar className="w-3 h-3" />
            期間
          </div>
          <div className="text-white font-medium">3/6ヶ月</div>
          <div className="text-xs text-gray-500">50%経過</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            予算
          </div>
          <div className="text-white font-medium">¥450K/¥800K</div>
          <div className="text-xs text-gray-500">56%執行</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Users className="w-3 h-3" />
            チーム
          </div>
          <div className="text-white font-medium">12名</div>
          <div className="text-xs text-gray-500">3部門</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Target className="w-3 h-3" />
            KPI達成率
          </div>
          <div className="text-white font-medium">82%</div>
          <div className="text-xs text-green-400">+5%↑</div>
        </div>
      </div>

      {/* マイルストーン */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">マイルストーン</h4>
        <div className="space-y-2">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  milestone.status === 'completed' ? 'bg-green-400' :
                  milestone.status === 'active' ? 'bg-yellow-400 animate-pulse' :
                  'bg-gray-600'
                }`} />
                <span className={`text-sm ${
                  milestone.status === 'completed' ? 'text-gray-400' :
                  milestone.status === 'active' ? 'text-white' :
                  'text-gray-500'
                }`}>
                  {milestone.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">{milestone.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* リスク・課題 */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          現在の課題
        </h4>
        <ul className="space-y-1 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>第2次実装の一部機能で遅延リスクあり（対策検討中）</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>追加要望により予算超過の可能性（調整中）</span>
          </li>
        </ul>
      </div>

      {/* 成果指標 */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          期待される成果
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">業務効率</span>
            <span className="text-green-400 ml-2">+25%</span>
          </div>
          <div>
            <span className="text-gray-400">コスト削減</span>
            <span className="text-green-400 ml-2">-15%</span>
          </div>
          <div>
            <span className="text-gray-400">満足度向上</span>
            <span className="text-green-400 ml-2">+30pt</span>
          </div>
          <div>
            <span className="text-gray-400">エラー率</span>
            <span className="text-green-400 ml-2">-40%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;