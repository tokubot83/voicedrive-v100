import React from 'react';
import { BarChart3, Clock, TrendingUp, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Post } from '../../types';

interface FreevoiceAnalysisPanelProps {
  post: Post;
}

interface VotingAnalysisProps {
  post: Post;
}

interface EventAnalysisProps {
  post: Post;
}

// 投票分析コンポーネント
const VotingAnalysis: React.FC<VotingAnalysisProps> = ({ post }) => {
  // 投票データの取得
  const pollOptions = post.pollOptions || [];
  const pollResult = post.pollResult;
  const votingDeadline = post.votingDeadline;
  const isExpired = votingDeadline && new Date() > new Date(votingDeadline);

  // 基本統計の計算
  const totalVotes = pollResult?.totalVotes || 0;
  const participationRate = pollResult?.participationRate || 0;
  const targetParticipants = Math.round(totalVotes / (participationRate / 100)) || 500; // 推定対象者数

  // 残り時間の計算
  const timeRemaining = votingDeadline ? new Date(votingDeadline).getTime() - new Date().getTime() : 0;
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));

  // 選択肢分析
  const getOptionAnalysis = () => {
    if (!pollResult?.results) return null;

    const results = pollResult.results;
    const sortedResults = [...results].sort((a, b) => b.votes - a.votes);
    const winner = sortedResults[0];
    const runnerUp = sortedResults[1];
    
    // 僅差判定（5%以内）
    const isCloseRace = runnerUp && Math.abs(winner.percentage - runnerUp.percentage) <= 5;
    
    // 意外な結果判定（1位と最下位の差が15%以内）
    const lastPlace = sortedResults[sortedResults.length - 1];
    const isSurprising = lastPlace && Math.abs(winner.percentage - lastPlace.percentage) <= 15;

    return {
      winner,
      runnerUp,
      isCloseRace,
      isSurprising,
      sortedResults
    };
  };

  const analysis = getOptionAnalysis();

  // 投票促進メッセージ
  const getPromotionMessage = () => {
    if (isExpired) return null;
    
    if (participationRate < 30) {
      return {
        type: 'urgent',
        message: `参加率が${participationRate.toFixed(1)}%と低めです。より多くの意見を集めるため、積極的な投票を呼びかけてみませんか？`,
        icon: <AlertCircle className="w-4 h-4" />
      };
    } else if (participationRate < 50) {
      return {
        type: 'moderate',
        message: `現在の参加率は${participationRate.toFixed(1)}%です。目標の60%に向けて、もう少し参加を促してみましょう。`,
        icon: <TrendingUp className="w-4 h-4" />
      };
    } else {
      return {
        type: 'good',
        message: `参加率${participationRate.toFixed(1)}%！多くの方に参加いただいています。`,
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
  };

  const promotionMessage = getPromotionMessage();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg text-blue-900">投票分析</h3>
      </div>

      {/* 基本統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
          <div className="text-sm text-gray-600">総投票数</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="text-2xl font-bold text-green-600">{participationRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">参加率</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="text-2xl font-bold text-purple-600">{pollOptions.length}</div>
          <div className="text-sm text-gray-600">選択肢数</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          {isExpired ? (
            <>
              <div className="text-2xl font-bold text-gray-600">終了</div>
              <div className="text-sm text-gray-600">投票期間</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-orange-600">
                {daysRemaining > 0 ? `${daysRemaining}日` : `${hoursRemaining}時間`}
              </div>
              <div className="text-sm text-gray-600">残り時間</div>
            </>
          )}
        </div>
      </div>

      {/* 選択肢分析 */}
      {analysis && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            選択肢分析
          </h4>
          
          <div className="space-y-3">
            {/* 最人気選択肢 */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">🏆 最人気</span>
                <span className="text-lg font-bold text-blue-600">
                  {analysis.winner.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="text-gray-800">{analysis.winner.option.text}</div>
              <div className="text-sm text-gray-500 mt-1">
                {analysis.winner.votes}票獲得
              </div>
            </div>

            {/* 接戦・意外な結果の洞察 */}
            {analysis.isCloseRace && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">接戦の展開</span>
                </div>
                <div className="text-sm text-yellow-700 mt-1">
                  1位と2位の差が{Math.abs(analysis.winner.percentage - analysis.runnerUp.percentage).toFixed(1)}%と僅差です。
                  最終結果まで予断を許さない状況です。
                </div>
              </div>
            )}

            {analysis.isSurprising && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-800">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">意外な結果</span>
                </div>
                <div className="text-sm text-purple-700 mt-1">
                  選択肢間の差が小さく、意見が分散しています。
                  多様な視点があることを示す結果と言えるでしょう。
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 投票促進メッセージ */}
      {promotionMessage && (
        <div className={`rounded-lg p-4 border ${
          promotionMessage.type === 'urgent' 
            ? 'bg-red-50 border-red-200 text-red-800'
            : promotionMessage.type === 'moderate'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-center gap-2">
            {promotionMessage.icon}
            <span className="font-medium">参加促進</span>
          </div>
          <div className="text-sm mt-1">{promotionMessage.message}</div>
          
          {!isExpired && daysRemaining <= 1 && (
            <div className="mt-2 text-sm font-medium">
              ⏰ 投票締切まで残り{daysRemaining > 0 ? `${daysRemaining}日` : `${hoursRemaining}時間`}です！
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// イベント分析コンポーネント（プライバシー配慮）
const EventAnalysis: React.FC<EventAnalysisProps> = ({ post }) => {
  const eventDetails = post.eventDetails;
  
  if (!eventDetails) return null;

  // プライバシー配慮した申込状況の表示
  const maxCapacity = eventDetails.maxParticipants || 50;
  const currentParticipants = eventDetails.currentParticipants || 0;
  const occupancyRate = maxCapacity > 0 ? (currentParticipants / maxCapacity) * 100 : 0;
  
  // 申込状況をざっくりとした表現で表示（個人特定を避ける）
  const getOccupancyStatus = () => {
    if (occupancyRate >= 90) return { status: '満席間近', color: 'red', icon: '🔥' };
    if (occupancyRate >= 70) return { status: '人気開催', color: 'orange', icon: '👥' };
    if (occupancyRate >= 40) return { status: '順調', color: 'green', icon: '✅' };
    if (occupancyRate >= 20) return { status: 'まだ余裕あり', color: 'blue', icon: '📝' };
    return { status: '申込受付中', color: 'gray', icon: '📅' };
  };

  const statusInfo = getOccupancyStatus();
  const eventDate = eventDetails.eventDate ? new Date(eventDetails.eventDate) : null;
  const isUpcoming = eventDate && eventDate > new Date();
  const daysUntilEvent = eventDate ? Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-lg text-green-900">イベント状況</h3>
      </div>

      {/* 開催情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 border border-green-100">
          <div className="text-2xl font-bold text-green-600">{statusInfo.icon}</div>
          <div className="text-sm font-medium text-gray-800 mt-1">{statusInfo.status}</div>
          <div className="text-xs text-gray-600">申込状況</div>
        </div>
        
        {eventDate && (
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="text-2xl font-bold text-blue-600">
              {isUpcoming ? `${daysUntilEvent}日後` : '開催済み'}
            </div>
            <div className="text-sm text-gray-600">
              {eventDate.toLocaleDateString('ja-JP')}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg p-3 border border-green-100">
          <div className="text-2xl font-bold text-purple-600">{maxCapacity}名</div>
          <div className="text-sm text-gray-600">定員</div>
        </div>
      </div>

      {/* 申込状況バー（具体的な数字は表示しない） */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">申込状況</span>
          <span className="text-sm text-gray-600">
            {occupancyRate >= 90 ? '満席間近' : 
             occupancyRate >= 50 ? '半分以上' : 
             occupancyRate >= 25 ? '1/4以上' : '受付開始'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              occupancyRate >= 90 ? 'bg-red-500' :
              occupancyRate >= 70 ? 'bg-orange-500' :
              occupancyRate >= 40 ? 'bg-green-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          />
        </div>
      </div>

      {/* 注意事項・お知らせ */}
      {isUpcoming && (
        <div className="space-y-3">
          {occupancyRate >= 85 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">満席間近</span>
              </div>
              <div className="text-sm text-red-700 mt-1">
                参加をご検討中の方は、お早めにお申し込みください。
              </div>
            </div>
          )}
          
          {daysUntilEvent <= 3 && daysUntilEvent > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="w-4 h-4" />
                <span className="font-medium">開催間近</span>
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                イベント開催まで{daysUntilEvent}日です。参加予定の方は準備をお忘れなく！
              </div>
            </div>
          )}
          
          {occupancyRate < 30 && daysUntilEvent <= 7 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="w-4 h-4" />
                <span className="font-medium">参加者募集中</span>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                まだ余裕があります。ぜひお気軽にご参加ください！
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// メインコンポーネント
const FreevoiceAnalysisPanel: React.FC<FreevoiceAnalysisPanelProps> = ({ post }) => {
  // フリーボイス以外は表示しない
  if (post.type !== 'community') {
    return null;
  }

  // 投票投稿かイベント投稿かを判定
  const isVotingPost = post.pollOptions || post.pollResult || post.votingDeadline;
  const isEventPost = post.eventDetails;

  // どちらでもない場合（通常のコミュニティ投稿）は表示しない
  if (!isVotingPost && !isEventPost) {
    return null;
  }

  return (
    <div className="mt-6">
      {isVotingPost && <VotingAnalysis post={post} />}
      {isEventPost && <EventAnalysis post={post} />}
    </div>
  );
};

export default FreevoiceAnalysisPanel;