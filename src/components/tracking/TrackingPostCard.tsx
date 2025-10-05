import React, { useState } from 'react';
import { Post } from '../../types';
import { AgendaLevel } from '../../types/committee';
import { VisibilityPermissions } from '../../services/AgendaVisibilityEngine';
import TrackingTimeline from './TrackingTimeline';
import TrackingProgressBar from './TrackingProgressBar';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PostData {
  currentScore: number;
  agendaLevel: AgendaLevel;
  permissions: VisibilityPermissions;
  totalVotes: number;
  supportRate: number;
}

interface TrackingPostCardProps {
  post: Post;
  postData: PostData;
  viewType: 'posted' | 'voted' | 'commented';
}

const TrackingPostCard: React.FC<TrackingPostCardProps> = ({
  post,
  postData,
  viewType
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 議題レベル設定
  const levelConfig = {
    'PENDING': { label: '検討中', icon: '💭', color: 'gray', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' },
    'DEPT_REVIEW': { label: '部署検討', icon: '📋', color: 'blue', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    'DEPT_AGENDA': { label: '部署議題', icon: '👥', color: 'green', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
    'FACILITY_AGENDA': { label: '施設議題', icon: '🏥', color: 'yellow', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
    'CORP_REVIEW': { label: '法人検討', icon: '🏢', color: 'orange', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' },
    'CORP_AGENDA': { label: '法人議題', icon: '🏛️', color: 'pink', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30' }
  }[postData.agendaLevel] || { label: '検討中', icon: '💭', color: 'gray', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };

  // 次のレベルまでの点数
  const getNextLevel = () => {
    const { currentScore } = postData;
    if (currentScore >= 600) return null;
    if (currentScore < 30) return { level: '部署検討', points: 30 - currentScore };
    if (currentScore < 50) return { level: '部署議題', points: 50 - currentScore };
    if (currentScore < 100) return { level: '施設議題', points: 100 - currentScore };
    if (currentScore < 300) return { level: '法人検討', points: 300 - currentScore };
    return { level: '法人議題', points: 600 - currentScore };
  };

  const nextLevel = getNextLevel();

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-colors">
      {/* カードヘッダー */}
      <div className="p-4">
        {/* タイトル */}
        <h3 className="text-lg font-bold text-white mb-3">
          {post.content.length > 60
            ? post.content.substring(0, 60) + '...'
            : post.content
          }
        </h3>

        {/* 現在地バッジ（大きく目立つ） */}
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3
          ${levelConfig.bgColor} border ${levelConfig.borderColor}
        `}>
          <span className="text-2xl">{levelConfig.icon}</span>
          <div>
            <div className="text-white font-bold">{levelConfig.label}</div>
            <div className="text-sm text-gray-300">{postData.currentScore}点</div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-3">
          <TrackingProgressBar
            currentScore={postData.currentScore}
            nextLevelName={nextLevel?.level}
            pointsToNext={nextLevel?.points}
          />
        </div>

        {/* 活動サマリー */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1 text-gray-300">
            <span>👍</span>
            <span>{postData.totalVotes}人</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span>📊</span>
            <span>支持率{postData.supportRate}%</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span>💬</span>
            <span>{(post.comments || []).length}件</span>
          </div>
        </div>

        {/* 最新の動き（3件） */}
        <div className="bg-gray-700/30 rounded-lg p-3 mb-3">
          <div className="text-sm font-medium text-gray-300 mb-2">⚡ 最新の動き</div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">
              💬 2時間前：田中さんがコメント
            </div>
            <div className="text-sm text-gray-400">
              👍 昨日：5人が新たに賛成
            </div>
            <div className="text-sm text-gray-400">
              📊 3日前：部署議題に昇格
            </div>
          </div>
        </div>

        {/* 詳細ボタン */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>閉じる</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>📖 全ての動きを見る</span>
            </>
          )}
        </button>
      </div>

      {/* 展開エリア（完全なタイムライン） */}
      {isExpanded && (
        <div className="border-t border-gray-700/50 p-4 bg-gray-900/50">
          <TrackingTimeline postId={post.id} />
        </div>
      )}
    </div>
  );
};

export default TrackingPostCard;
