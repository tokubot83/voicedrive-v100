import React from 'react';
import { TrendingUp, Users, BarChart, MessageCircle } from 'lucide-react';
import { Post, VoteOption } from '../../types';
import { useProjectScoring } from '../../hooks/projects/useProjectScoring';
import { ConsensusInsightGenerator } from '../../utils/consensusInsights';

interface SituationAnalysisPanelProps {
  post: Post;
}

const SituationAnalysisPanel: React.FC<SituationAnalysisPanelProps> = ({ post }) => {
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();
  
  // 投票の詳細分析（nullチェック付き）
  const totalVotes = Object.values(post.votes || {}).reduce((sum, count) => sum + count, 0);
  
  // フリーボイス投稿の場合は専用パネルを使用するため表示しない
  if (post.type === 'community') {
    return null;
  }
  
  // プロジェクトスコア計算
  const engagements = convertVotesToEngagements(post.votes);
  const currentScore = post.type === 'improvement' 
    ? calculateScore(engagements, post.proposalType)
    : 0;

  // 合意形成データの計算
  const consensusData = ConsensusInsightGenerator.calculateSimpleConsensus(post.votes);
  const supportPercentage = totalVotes > 0 
    ? Math.round(((post.votes['strongly-support'] + post.votes.support) / totalVotes) * 100)
    : 0;
  const opposePercentage = totalVotes > 0 
    ? Math.round(((post.votes['strongly-oppose'] + post.votes.oppose) / totalVotes) * 100)
    : 0;

  // プロジェクトレベルの判定
  const getProjectLevel = (score: number) => {
    if (score >= 600) return { level: '法人レベル', icon: '🏢', color: 'text-purple-400' };
    if (score >= 300) return { level: '施設レベル', icon: '🏥', color: 'text-blue-400' };
    if (score >= 100) return { level: '部署レベル', icon: '🏢', color: 'text-green-400' };
    if (score >= 50) return { level: 'チームレベル', icon: '👥', color: 'text-yellow-400' };
    return { level: '議論段階', icon: '💭', color: 'text-gray-400' };
  };

  const projectLevel = getProjectLevel(currentScore);

  // 自動コメント生成
  const generateAutoComment = () => {
    const insights: string[] = [];
    
    // スコア関連の分析（アイデアボイス用）
    if (post.type === 'improvement') {
      if (currentScore >= 100) {
        insights.push(`スコア${Math.round(currentScore)}点により${projectLevel.level}の取り組みとして実現可能性があります`);
      } else if (currentScore >= 50) {
        insights.push(`スコア${Math.round(currentScore)}点でチームレベルの検討段階です。より多くの支持を得ることで部署レベルの取り組みに発展する可能性があります`);
      } else {
        insights.push(`現在は議論段階です。具体的な実装案や効果の説明により、さらなる支持を得ることが期待できます`);
      }
    }
    
    // フリーボイス用の分析
    if (post.type === 'community') {
      if (totalVotes >= 50) {
        insights.push(`投票数${totalVotes}票で活発な議論が行われています`);
      } else if (totalVotes >= 20) {
        insights.push(`投票数${totalVotes}票で関心を集めています。さらに多くの職員の参加で議論が深まる可能性があります`);
      } else if (totalVotes >= 5) {
        insights.push(`初期段階の議論です。より多くの職員の参加により多様な視点が期待できます`);
      } else {
        insights.push(`まだ参加者が少ない状況です。関心のある職員の参加をお待ちしています`);
      }
    }

    // 合意形成の分析
    if (consensusData.percentage >= 70) {
      insights.push(`納得率${consensusData.percentage}%で高い合意が形成されています`);
    } else if (consensusData.percentage >= 50) {
      insights.push(`納得率${consensusData.percentage}%で一定の合意が得られていますが、より幅広い意見収集が有効かもしれません`);
    } else {
      insights.push(`納得率${consensusData.percentage}%で意見が分かれています。懸念事項の明確化と対策が重要です`);
    }

    // 反対意見の分析
    if (opposePercentage > 20) {
      insights.push(`反対意見(${opposePercentage}%)の具体的な課題を明確にすることで、さらなる改善案が期待できます`);
    }

    // 参加率の分析
    if (totalVotes < 10) {
      insights.push(`投票数が少ないため、より多くの関係者からの意見収集が推奨されます`);
    }

    return insights;
  };

  const autoInsights = generateAutoComment();

  // 議論のポイント生成
  const getDiscussionPoints = () => {
    const points: string[] = [];
    
    if (post.type === 'improvement') {
      points.push('実装時の具体的な課題や懸念は何か？');
      points.push('より良い代替案や改善アイデアはあるか？');
      
      if (currentScore >= 100) {
        points.push('導入スケジュールや予算についての現実的な提案は？');
      }
    }
    
    if (post.type === 'community') {
      points.push('この話題についてあなたの経験や意見は？');
      points.push('他の職員にとって参考になる情報はありますか？');
      
      if (totalVotes >= 20) {
        points.push('議論を発展させるための具体的な提案は？');
      }
      
      if (supportPercentage > 60) {
        points.push('この考えを実際の職場で活かすにはどうすれば良いか？');
      }
    }
    
    if (opposePercentage > 15) {
      points.push('反対意見の背景にある具体的な問題点は何か？');
    }
    
    if (consensusData.percentage < 60) {
      points.push('合意形成のために必要な追加情報や説明は何か？');
    }

    return points;
  };

  const discussionPoints = getDiscussionPoints();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-blue-800">現在の状況分析</h3>
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
          自動生成
        </span>
      </div>

      {/* メトリクス表示 */}
      <div className={`grid grid-cols-1 ${post.type === 'improvement' ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-4 mb-4`}>
        {/* プロジェクトスコア（アイデアボイス専用） */}
        {post.type === 'improvement' && (
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">みんなの投票スコア</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{Math.round(currentScore)}点</span>
              <span className={`text-sm ${projectLevel.color} flex items-center gap-1`}>
                <span>{projectLevel.icon}</span>
                {projectLevel.level}
              </span>
            </div>
          </div>
        )}

        {/* 参加度（フリーボイス専用） */}
        {post.type && (
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">参加度</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{totalVotes}票</span>
              <span className="text-sm text-gray-600">
                {totalVotes >= 50 ? '活発' : totalVotes >= 20 ? '活動中' : totalVotes >= 5 ? '初期段階' : '開始'}
              </span>
            </div>
          </div>
        )}

        {/* 納得率 */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">みんなの納得率</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-800">{consensusData.percentage}%</span>
            <span className="text-sm text-gray-600">({totalVotes}票)</span>
          </div>
          {/* 簡易プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${consensusData.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* データ分析 */}
      <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">データから見た状況</span>
        </div>
        <ul className="text-sm text-gray-700 space-y-1">
          {autoInsights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 議論のポイント */}
      {discussionPoints.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💡</span>
            <span className="text-sm font-medium text-blue-800">議論のポイント</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            {discussionPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 但し書き */}
      <div className="mt-3 pt-2 border-t border-blue-100">
        <p className="text-xs text-blue-600">
          ※ あくまでもコメント時点での状況分析です。投票や議論の進展により状況は変化する可能性があります。
        </p>
      </div>
    </div>
  );
};

export default SituationAnalysisPanel;