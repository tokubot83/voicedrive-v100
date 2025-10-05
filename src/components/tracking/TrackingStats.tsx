import React from 'react';
import {
  FileText,
  ThumbsUp,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

interface TrackingStatsProps {
  myPostsCount: number;
  votedPostsCount: number;
  commentedPostsCount: number;
  achievedCount: number;
}

export const TrackingStats: React.FC<TrackingStatsProps> = ({
  myPostsCount,
  votedPostsCount,
  commentedPostsCount,
  achievedCount
}) => {
  const stats = [
    {
      icon: <FileText className="w-6 h-6" />,
      label: '投稿数',
      value: myPostsCount,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: <ThumbsUp className="w-6 h-6" />,
      label: '投票数',
      value: votedPostsCount,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'コメント数',
      value: commentedPostsCount,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: '昇格済み',
      value: achievedCount,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-2 ${stat.color}`}>
            {stat.icon}
          </div>
          <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
          <div className="text-2xl font-bold text-white">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackingStats;
