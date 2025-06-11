import React, { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Award, MessageSquare, Heart, Lightbulb, Users } from 'lucide-react';
import { Rankings, RankingData } from '../../types/staffDashboard';

interface StaffRankingsProps {
  rankings: Rankings;
  scope: 'department' | 'facility' | 'corporate';
}

const StaffRankings: React.FC<StaffRankingsProps> = ({ rankings, scope }) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'participation' | 'comments' | 'likes' | 'overall'>('overall');

  const getRankingIcon = (type: string) => {
    switch (type) {
      case 'proposals': return Lightbulb;
      case 'participation': return Users;
      case 'comments': return MessageSquare;
      case 'likes': return Heart;
      case 'overall': return Trophy;
      default: return Trophy;
    }
  };

  const getRankingTitle = (type: string) => {
    switch (type) {
      case 'proposals': return '提案数ランキング';
      case 'participation': return 'プロジェクト参加';
      case 'comments': return 'コメント数';
      case 'likes': return 'いいね獲得数';
      case 'overall': return '総合ランキング';
      default: return 'ランキング';
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'silver': return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
      case 'bronze': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
    return null;
  };

  const currentRankings = rankings[activeTab] || [];

  const tabs = [
    { key: 'overall', label: '総合', icon: Trophy },
    { key: 'proposals', label: '提案', icon: Lightbulb },
    { key: 'participation', label: '参加', icon: Users },
    { key: 'comments', label: 'コメント', icon: MessageSquare },
    { key: 'likes', label: 'いいね', icon: Heart }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">職員活動ランキング</h3>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
          {scope === 'department' ? '部門内' : scope === 'facility' ? '施設内' : '法人内'}
        </span>
      </div>

      {/* タブナビゲーション */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ランキングリスト */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-400 border-b border-slate-700/50 pb-2">
          <span>順位</span>
          <span>職員名</span>
          <span>部署</span>
          <span>{getRankingTitle(activeTab)}</span>
          <span>変化</span>
        </div>

        {currentRankings.slice(0, 10).map((item: RankingData) => (
          <div
            key={item.userId}
            className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getBadgeColor(item.badge)}`}>
                {item.rank}
              </div>
              <div>
                <p className="text-white font-medium">{item.userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400 min-w-[80px]">{item.department}</span>
              <span className="text-white font-medium min-w-[60px] text-right">{item.value}</span>
              <div className="flex items-center gap-1 min-w-[60px] justify-end">
                {getChangeIcon(item.change)}
                <span className={`text-sm ${item.change > 0 ? 'text-green-400' : item.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {item.change > 0 ? '+' : ''}{(item.change * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター統計 */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-yellow-400">{currentRankings.length}</p>
            <p className="text-sm text-gray-400">参加者数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {currentRankings.length > 0 ? Math.round(currentRankings.reduce((sum, item) => sum + item.value, 0) / currentRankings.length) : 0}
            </p>
            <p className="text-sm text-gray-400">平均値</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {currentRankings.length > 0 ? Math.max(...currentRankings.map(item => item.value)) : 0}
            </p>
            <p className="text-sm text-gray-400">最高値</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffRankings;