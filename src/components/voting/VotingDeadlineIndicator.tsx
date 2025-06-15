import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, TrendingUp, Users, Calendar } from 'lucide-react';
// Simple date utility functions (replacing date-fns)
const formatDate = (date: Date, pattern: string): string => {
  if (pattern === 'yyyy年MM月dd日 HH:mm') {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}日`;
  } else if (diffHours > 0) {
    return `${diffHours}時間`;
  } else {
    return '1時間未満';
  }
};

const differenceInHours = (dateLeft: Date, dateRight: Date): number => {
  return Math.abs(dateLeft.getTime() - dateRight.getTime()) / (1000 * 60 * 60);
};
import { VotingPost } from '../../types';
import { VotingDeadlineService } from '../../services/VotingDeadlineService';

interface VotingDeadlineIndicatorProps {
  post: VotingPost;
  onExtendDeadline?: (newDeadline: Date) => void;
  showExtendButton?: boolean;
}

export const VotingDeadlineIndicator: React.FC<VotingDeadlineIndicatorProps> = ({
  post,
  onExtendDeadline,
  showExtendButton = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extensionReason, setExtensionReason] = useState('');
  const deadlineService = VotingDeadlineService.getInstance();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // 1分ごと更新
    return () => clearInterval(timer);
  }, []);

  const deadline = new Date(post.votingDeadline);
  const hoursRemaining = differenceInHours(deadline, currentTime);
  const isOverdue = deadline < currentTime;
  const totalVoters = post.eligibleVoters || 100;
  const currentVotes = post.voteBreakdown.agree + post.voteBreakdown.disagree + post.voteBreakdown.hold;
  const participationRate = (currentVotes / totalVoters) * 100;

  // 自動延長の判定
  const extensionRecommendation = deadlineService.shouldExtendDeadline(post);

  // 期限の状態に応じた色分け
  const getDeadlineColor = () => {
    if (isOverdue) return 'text-red-600 bg-red-50';
    if (hoursRemaining <= 6) return 'text-orange-600 bg-orange-50';
    if (hoursRemaining <= 24) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // 参加率に応じた色分け
  const getParticipationColor = () => {
    if (participationRate < 30) return 'text-red-600';
    if (participationRate < 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleExtendDeadline = () => {
    if (extensionRecommendation.extend && extensionRecommendation.newDeadline) {
      onExtendDeadline?.(extensionRecommendation.newDeadline);
      setShowExtendDialog(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* メイン期限表示 */}
      <div className={`rounded-lg p-4 ${getDeadlineColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <div>
              <div className="font-semibold">
                投票期限: {formatDate(deadline, 'yyyy年MM月dd日 HH:mm')}
              </div>
              <div className="text-sm">
                {isOverdue ? (
                  <span className="font-bold">期限切れ</span>
                ) : (
                  <>残り {formatDistanceToNow(deadline)}</>
                )}
              </div>
            </div>
          </div>
          
          {showExtendButton && !isOverdue && extensionRecommendation.extend && (
            <button
              onClick={() => setShowExtendDialog(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center gap-1"
            >
              <TrendingUp className="w-4 h-4" />
              期限延長を推奨
            </button>
          )}
        </div>
      </div>

      {/* 参加率表示 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">投票参加率</span>
          </div>
          <div className={`text-sm font-semibold ${getParticipationColor()}`}>
            {participationRate.toFixed(1)}% ({currentVotes}/{totalVoters}人)
          </div>
        </div>
        
        {/* 参加率プログレスバー */}
        <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all ${
              participationRate < 30 ? 'bg-red-500' :
              participationRate < 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(participationRate, 100)}%` }}
          />
        </div>
      </div>

      {/* 自動延長の推奨 */}
      {extensionRecommendation.extend && !isOverdue && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-blue-800 mb-1">
                期限延長が推奨されています
              </div>
              <div className="text-blue-700">
                {extensionRecommendation.reason}
              </div>
              {extensionRecommendation.newDeadline && (
                <div className="mt-1 text-blue-600">
                  新期限: {format(extensionRecommendation.newDeadline, 'MM/dd HH:mm', { locale: ja })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 期限延長ダイアログ */}
      {showExtendDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">投票期限の延長</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">現在の期限</div>
                <div className="font-semibold">
                  {formatDate(deadline, 'yyyy年MM月dd日 HH:mm')}
                </div>
              </div>
              
              {extensionRecommendation.newDeadline && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-600">新しい期限</div>
                  <div className="font-semibold text-blue-800">
                    {formatDate(extensionRecommendation.newDeadline, 'yyyy年MM月dd日 HH:mm')}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">延長理由</label>
                <textarea
                  value={extensionReason || extensionRecommendation.reason || ''}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full h-24 p-3 border rounded-lg resize-none"
                  placeholder="延長の理由を入力..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExtendDeadline}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                延長する
              </button>
              <button
                onClick={() => setShowExtendDialog(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};