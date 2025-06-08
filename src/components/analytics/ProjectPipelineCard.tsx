// プロジェクトパイプラインカードコンポーネント - Phase 3 実装
import React from 'react';

interface ProjectPipelineCardProps {
  data: {
    total: number;
    byStage: {
      proposal: number;
      approval: number;
      implementation: number;
      completed: number;
    };
    upcoming: Array<{
      id: string;
      name: string;
      stage: string;
      expectedROI: number;
      daysUntilStart: number;
    }>;
  };
}

const ProjectPipelineCard: React.FC<ProjectPipelineCardProps> = ({ data }) => {
  const getStageColor = (stage: string) => {
    const colors = {
      proposal: '#1d9bf0',
      approval: '#ff7a00',
      implementation: '#00ba7c',
      completed: '#7856ff'
    };
    return colors[stage as keyof typeof colors] || '#71767b';
  };
  
  const getStageLabel = (stage: string) => {
    const labels = {
      proposal: '提案中',
      approval: '承認中',
      implementation: '実行中',
      completed: '完了'
    };
    return labels[stage as keyof typeof labels] || stage;
  };
  
  const totalInPipeline = Object.values(data.byStage).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="analytics-card project-pipeline">
      <div className="card-header">
        <span className="card-icon">🚀</span>
        <span className="card-title">プロジェクトパイプライン</span>
      </div>
      
      <div className="card-content">
        <div className="pipeline-summary">
          <div className="summary-metric">
            <span className="metric-value">{totalInPipeline}</span>
            <span className="metric-label">進行中プロジェクト</span>
          </div>
        </div>
        
        <div className="pipeline-stages">
          {Object.entries(data.byStage).map(([stage, count]) => {
            const percentage = totalInPipeline > 0 ? (count / totalInPipeline) * 100 : 0;
            return (
              <div key={stage} className="stage-item">
                <div className="stage-header">
                  <span className="stage-label">{getStageLabel(stage)}</span>
                  <span className="stage-count">{count}</span>
                </div>
                <div className="stage-bar">
                  <div 
                    className="stage-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getStageColor(stage)
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="upcoming-projects">
          <h4 className="section-title">直近の開始予定</h4>
          {data.upcoming.slice(0, 3).map(project => (
            <div key={project.id} className="upcoming-item">
              <div className="project-info">
                <span className="project-name">{project.name}</span>
                <span className="project-stage">{getStageLabel(project.stage)}</span>
              </div>
              <div className="project-meta">
                <span className="expected-roi">ROI: {project.expectedROI}%</span>
                <span className="days-until">
                  {project.daysUntilStart > 0 
                    ? `${project.daysUntilStart}日後` 
                    : '開始済み'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectPipelineCard;