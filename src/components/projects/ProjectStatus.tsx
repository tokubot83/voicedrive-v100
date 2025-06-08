import React from 'react';
import { useProjectScoring } from '../../hooks/projects/useProjectScoring';
import { PostType } from '../../types';

interface ProjectStatusProps {
  postId: string;
  postType: PostType;
  votes: Record<string, number>;
  projectId?: string;
  approver?: string;
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ 
  postId, 
  postType, 
  votes,
  projectId,
  approver 
}) => {
  const { calculateScore, getStatusConfig, getThresholdName, convertVotesToEngagements } = useProjectScoring();
  
  // 投票データをエンゲージメントデータに変換
  const engagements = convertVotesToEngagements(votes);
  const score = calculateScore(engagements, postId);
  const status = getStatusConfig(score, postType);
  
  // 段階1: スコア50点未満の場合は表示しない
  if (status.displayStage === 1) {
    return null;
  }
  
  // プロジェクト化完了の場合
  if (status.achieved) {
    return <ProjectStatusCompleted 
      score={score} 
      status={status}
      thresholdName={getThresholdName(status.threshold!)}
      projectId={projectId}
      approver={approver}
    />;
  }
  
  // プロジェクト化進行中の場合
  return <ProjectStatusPending 
    score={score} 
    status={status}
    thresholdName={getThresholdName(status.nextThreshold!)}
  />;
};

interface ProjectStatusPendingProps {
  score: number;
  status: any;
  thresholdName: string;
}

const ProjectStatusPending: React.FC<ProjectStatusPendingProps> = ({ score, status, thresholdName }) => {
  // 段階に応じたクラス名を取得
  const getStageClass = () => {
    switch (status.displayStage) {
      case 2:
        return 'project-status-stage2'; // 部署内向け
      case 3:
        return 'project-status-stage3'; // 施設内向け
      case 4:
        return 'project-status-stage4'; // 90%以上
      default:
        return '';
    }
  };
  
  return (
    <div className={`project-status ${getStageClass()}`}>
      <div className="project-status-title">🚀 プロジェクト化状況</div>
      <div className="project-status-content">
        <strong>現在のスコア: {score}点</strong> ({thresholdName}プロジェクト閾値: {status.nextThreshold}点)
        <br />
        
        <div className="progress-bar">
          <div 
            className={`progress-fill ${status.displayStage === 4 ? 'progress-fill-near-complete' : ''}`}
            style={{ width: `${Math.min(status.progressPercentage, 100)}%` }}
          />
        </div>
        
        進捗: {status.progressPercentage}% 
        {status.isNearComplete ? (
          <span className="remaining-points pulse-text"> あとわずか!</span>
        ) : (
          <span className="remaining-points"> あと{status.remainingPoints}点!</span>
        )}
        <br />
        
        <span className="status-note">
          達成時: 自動で{thresholdName}プロジェクトとして発動されます
        </span>
      </div>
    </div>
  );
};

interface ProjectStatusCompletedProps {
  score: number;
  status: any;
  thresholdName: string;
  projectId?: string;
  approver?: string;
}

const ProjectStatusCompleted: React.FC<ProjectStatusCompletedProps> = ({ 
  score, 
  status, 
  thresholdName,
  projectId,
  approver = '薬剤部長'
}) => {
  const handleShowProject = () => {
    // プロジェクト詳細を表示する処理
    console.log('Show project:', projectId);
  };
  
  return (
    <div 
      className="project-status project-status-completed"
    >
      <div className="project-status-title project-status-title-completed">
        ✅ プロジェクト化完了
      </div>
      <div className="project-status-content">
        <strong>最終スコア: {score}点</strong> ({thresholdName}プロジェクト閾値: {status.threshold}点達成)
        <br />
        ステータス: {approver}承認待ち
        <br />
        <span className="status-note">
          この提案は自動的にプロジェクト化され、承認プロセスに進んでいます
        </span>
        <br />
        
        {projectId && (
          <button 
            onClick={handleShowProject}
            className="project-link-button"
          >
            🏗️ 関連プロジェクトを確認
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectStatus;