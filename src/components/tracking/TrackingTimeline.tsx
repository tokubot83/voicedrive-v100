import React from 'react';
import {
  MessageSquare,
  ThumbsUp,
  FileText,
  ArrowUp,
  Clock
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'post_created' | 'comment_added' | 'vote_received' | 'level_upgraded';
  timestamp: string;
  description: string;
  details?: string;
  userName?: string;
  voteType?: string;
  points?: number;
  fromLevel?: string;
  toLevel?: string;
}

interface TrackingTimelineProps {
  postId: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ postId }) => {
  // TODO: 実際のAPIからイベントデータを取得
  // 現在はデモデータを使用
  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'level_upgraded',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: '部署議題に昇格しました',
      fromLevel: '部署検討',
      toLevel: '部署議題'
    },
    {
      id: '2',
      type: 'vote_received',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: '5人が新たに賛成',
      voteType: '賛成',
      points: 25
    },
    {
      id: '3',
      type: 'comment_added',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      description: 'コメントが追加されました',
      userName: '田中',
      details: '素晴らしい提案だと思います'
    }
  ];

  // イベントタイプごとのアイコンと色
  const getEventStyle = (type: TimelineEvent['type']) => {
    const styles = {
      post_created: {
        icon: <FileText className="w-4 h-4" />,
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-400',
        label: '投稿'
      },
      comment_added: {
        icon: <MessageSquare className="w-4 h-4" />,
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500',
        textColor: 'text-green-400',
        label: 'コメント'
      },
      vote_received: {
        icon: <ThumbsUp className="w-4 h-4" />,
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-400',
        label: '投票'
      },
      level_upgraded: {
        icon: <ArrowUp className="w-4 h-4" />,
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-400',
        label: 'レベル昇格'
      }
    };
    return styles[type];
  };

  // タイムスタンプのフォーマット
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">まだアクティビティがありません</p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
      {events.map((event, index) => {
        const style = getEventStyle(event.type);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative">
            {/* タイムライン線 */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-700" />
            )}

            {/* イベントカード */}
            <div className="flex gap-3">
              {/* アイコン */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full ${style.bgColor} border-2 ${style.borderColor} flex items-center justify-center ${style.textColor} z-10`}
              >
                {style.icon}
              </div>

              {/* 内容 */}
              <div className="flex-1 bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`text-xs font-bold ${style.textColor}`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>

                <p className="text-white text-sm mb-1">{event.description}</p>

                {/* 詳細情報 */}
                {event.type === 'comment_added' && event.userName && (
                  <p className="text-xs text-gray-400">
                    {event.userName}さんからのコメント
                  </p>
                )}

                {event.type === 'vote_received' && (
                  <div className="flex items-center gap-2 mt-1">
                    {event.voteType && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {event.voteType}
                      </span>
                    )}
                    {event.points && (
                      <span className="text-xs text-yellow-400 font-bold">
                        +{event.points}点
                      </span>
                    )}
                  </div>
                )}

                {event.type === 'level_upgraded' && event.fromLevel && event.toLevel && (
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                      {event.fromLevel}
                    </span>
                    <ArrowUp className="w-3 h-3 text-yellow-400" />
                    <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold">
                      {event.toLevel}
                    </span>
                  </div>
                )}

                {event.details && (
                  <p className="text-xs text-gray-400 mt-1">{event.details}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
