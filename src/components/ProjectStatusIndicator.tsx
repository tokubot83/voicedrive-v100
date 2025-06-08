import { useEffect, useState } from 'react';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { Post } from '../types';

interface ProjectStatusIndicatorProps {
  post: Post;
}

const ProjectStatusIndicator = ({ post }: ProjectStatusIndicatorProps) => {
  const { calculateScore, getStatusConfig, convertVotesToEngagements } = useProjectScoring();
  const [score, setScore] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [progress, setProgress] = useState(0);
  const [displayCondition, setDisplayCondition] = useState<'hidden' | 'early' | 'progressing' | 'approaching' | 'achieved'>('hidden');

  useEffect(() => {
    if (post.type !== 'improvement') return;

    const engagements = convertVotesToEngagements(post.votes);
    const calculatedScore = calculateScore(engagements, post.id);
    const statusConfig = getStatusConfig(calculatedScore, post.type);
    
    setScore(calculatedScore);
    setThreshold(statusConfig.threshold);
    setProgress((calculatedScore / statusConfig.threshold) * 100);

    // 表示条件の判定
    const totalVotes = Object.values(post.votes).reduce((sum, count) => sum + count, 0);
    const positiveVotes = post.votes.support + post.votes['strongly-support'];
    const positiveRatio = totalVotes > 0 ? positiveVotes / totalVotes : 0;

    if (totalVotes === 0) {
      setDisplayCondition('hidden');
    } else if (statusConfig.achieved) {
      setDisplayCondition('achieved');
    } else if (totalVotes >= 5 && positiveRatio >= 0.6) {
      if (progress >= 90) {
        setDisplayCondition('approaching');
      } else if (progress >= 70) {
        setDisplayCondition('progressing');
      } else {
        setDisplayCondition('early');
      }
    } else {
      setDisplayCondition('hidden');
    }
  }, [post, calculateScore, getStatusConfig, convertVotesToEngagements]);

  if (displayCondition === 'hidden') return null;

  // プロジェクト化達成時の表示
  if (displayCondition === 'achieved') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-2xl p-5 mt-5">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-shimmer" />
        </div>
        
        <div className="relative z-10">
          <div className="font-bold text-green-400 mb-3 text-lg">
            ✅ プロジェクト化完了
          </div>
          <div className="text-gray-100 text-sm leading-relaxed">
            <strong>最終スコア: {score.toFixed(1)}点</strong> ({getThresholdTypeLabel(threshold)}閾値: {threshold}点達成)<br />
            ステータス: {getApproverLabel(post.approver)}承認待ち<br />
            <span className="text-xs text-gray-400">
              この提案は自動的にプロジェクト化され、承認プロセスに進んでいます
            </span>
          </div>
          {post.projectId && (
            <button 
              onClick={() => console.log('Show project:', post.projectId)}
              className="mt-3 px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 rounded-lg text-sm cursor-pointer hover:bg-green-500/30 transition-all duration-300"
            >
              🏗️ 関連プロジェクトを確認
            </button>
          )}
        </div>
      </div>
    );
  }

  // プロジェクト化進行中の表示
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/30 rounded-2xl p-5 mt-5">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-shimmer" />
      </div>
      
      <div className="relative z-10">
        <div className="font-bold text-orange-400 mb-3 text-lg">
          🚀 プロジェクト化状況
        </div>
        
        {displayCondition === 'early' && (
          <div className="text-gray-100 text-sm mb-3">
            💡 この提案に注目が集まっています！さらに支持が集まればプロジェクト化の可能性があります。
          </div>
        )}
        
        {(displayCondition === 'progressing' || displayCondition === 'approaching') && (
          <>
            <div className="text-gray-100 text-sm mb-3">
              <strong>現在のスコア: {score.toFixed(1)}点</strong> ({getThresholdTypeLabel(threshold)}プロジェクト閾値: {threshold}点)<br />
              <div className="w-full h-2 bg-gray-700 rounded-full mt-3 mb-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shine" />
                </div>
              </div>
              進捗: {progress.toFixed(1)}% 
              {displayCondition === 'approaching' && (
                <span className="text-orange-400 font-bold ml-2">
                  あと{(threshold - score).toFixed(1)}点!
                </span>
              )}
              <br />
              <span className="text-xs text-gray-400">
                達成時: 自動で{getThresholdTypeLabel(threshold)}プロジェクトとして発動されます
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 閾値タイプのラベル取得
const getThresholdTypeLabel = (threshold: number): string => {
  if (threshold >= 1000) return '組織全体';
  if (threshold >= 400) return '施設内';
  return '部署内';
};

// 承認者ラベルの取得
const getApproverLabel = (approver?: { name: string; role: string }): string => {
  if (!approver) return '担当者';
  return approver.name;
};

export default ProjectStatusIndicator;