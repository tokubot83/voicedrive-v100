import React from 'react';
import { ProjectLevel } from '../../types/visibility';

/**
 * アイデア進捗タイムライン表示コンポーネント
 * IdeaVoiceTrackingPage Phase 3実装
 */

interface TimelineEvent {
  date: Date;
  level: ProjectLevel;
  score: number;
  label: string;
  icon: string;
  color: string;
}

interface IdeaProgressTimelineProps {
  /** 投稿作成日 */
  createdAt: Date;
  /** 現在のプロジェクトレベル */
  currentLevel: ProjectLevel;
  /** 現在のスコア */
  currentScore: number;
  /** レベル遷移履歴 */
  levelTransitions?: Array<{
    fromLevel: string | null;
    toLevel: string;
    fromScore: number | null;
    toScore: number;
    upgradedAt: Date;
  }>;
  /** プロジェクト化達成履歴 */
  projectizedHistory?: {
    projectizedAt: Date;
    projectizedScore: number;
    projectLevel: string;
  } | null;
}

const levelConfig: Record<ProjectLevel, { label: string; icon: string; color: string }> = {
  'PENDING': {
    label: 'アイデア検討中',
    icon: '💡',
    color: 'text-gray-400 bg-gray-800/50 border-gray-700'
  },
  'TEAM': {
    label: 'チームプロジェクト',
    icon: '👥',
    color: 'text-blue-400 bg-blue-900/30 border-blue-700'
  },
  'DEPARTMENT': {
    label: '部署プロジェクト',
    icon: '🏢',
    color: 'text-green-400 bg-green-900/30 border-green-700'
  },
  'FACILITY': {
    label: '施設プロジェクト',
    icon: '🏥',
    color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700'
  },
  'ORGANIZATION': {
    label: '法人プロジェクト',
    icon: '🏛️',
    color: 'text-purple-400 bg-purple-900/30 border-purple-700'
  },
  'STRATEGIC': {
    label: '戦略プロジェクト',
    icon: '⭐',
    color: 'text-pink-400 bg-pink-900/30 border-pink-700'
  }
};

export const IdeaProgressTimeline: React.FC<IdeaProgressTimelineProps> = ({
  createdAt,
  currentLevel,
  currentScore,
  levelTransitions = [],
  projectizedHistory
}) => {
  // タイムラインイベントを構築
  const events: TimelineEvent[] = [];

  // 1. 投稿作成イベント
  events.push({
    date: createdAt,
    level: 'PENDING',
    score: 0,
    label: 'アイデア投稿',
    icon: '📝',
    color: 'text-gray-400'
  });

  // 2. レベル遷移イベント
  levelTransitions.forEach(transition => {
    const level = transition.toLevel as ProjectLevel;
    const config = levelConfig[level];
    events.push({
      date: transition.upgradedAt,
      level,
      score: transition.toScore,
      label: `${config.label}に到達`,
      icon: config.icon,
      color: config.color.split(' ')[0] // 最初のクラス（text-xxx）を取得
    });
  });

  // 3. プロジェクト化達成イベント
  if (projectizedHistory) {
    events.push({
      date: projectizedHistory.projectizedAt,
      level: projectizedHistory.projectLevel as ProjectLevel,
      score: projectizedHistory.projectizedScore,
      label: 'プロジェクト化達成！',
      icon: '✅',
      color: 'text-blue-400'
    });
  }

  // 日付でソート
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // 各イベント間の日数を計算
  const getDaysSince = (date: Date): number => {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📊 進捗タイムライン
      </h3>

      <div className="relative">
        {/* タイムラインライン */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>

        {/* イベント一覧 */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={index} className="relative pl-12">
              {/* タイムラインドット */}
              <div className={`absolute left-0 w-8 h-8 rounded-full border-2 border-gray-700 bg-gray-900 flex items-center justify-center ${event.color}`}>
                <span className="text-lg">{event.icon}</span>
              </div>

              {/* イベント内容 */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold ${event.color}`}>{event.label}</h4>
                  <span className="text-xs text-gray-500">
                    {getDaysSince(event.date)}日前
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>
                    {event.date.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-white font-mono">
                    スコア: {event.score}
                  </span>
                </div>

                {/* レベル遷移の場合、増加量を表示 */}
                {index > 0 && events[index - 1] && (
                  <div className="mt-2 text-xs text-gray-500">
                    +{event.score - events[index - 1].score} 点増加
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 現在の状態 */}
          <div className="relative pl-12">
            <div className="absolute left-0 w-8 h-8 rounded-full border-2 border-purple-500 bg-purple-900 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>

            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-purple-400">現在</h4>
                <span className="text-xs text-gray-500">今</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className={levelConfig[currentLevel].color.split(' ')[0]}>
                  {levelConfig[currentLevel].icon} {levelConfig[currentLevel].label}
                </span>
                <span className="text-white font-mono">
                  スコア: {currentScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* サマリー統計 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">経過日数</div>
          <div className="text-lg font-bold text-white">{getDaysSince(createdAt)}日</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">レベル遷移</div>
          <div className="text-lg font-bold text-white">{levelTransitions.length}回</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">平均成長速度</div>
          <div className="text-lg font-bold text-white">
            {getDaysSince(createdAt) > 0
              ? Math.round((currentScore / getDaysSince(createdAt)) * 10) / 10
              : 0}
            pt/日
          </div>
        </div>
      </div>
    </div>
  );
};
