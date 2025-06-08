// ROI分析カードコンポーネント - Phase 3 実装
import React, { useState } from 'react';

interface ROIAnalyticsCardProps {
  data: {
    averageROI: number;
    totalProjects: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    projects: Array<{
      id: string;
      name: string;
      roi: number;
      investment: number;
      returns: number;
      status: string;
    }>;
  };
}

const ROIAnalyticsCard: React.FC<ROIAnalyticsCardProps> = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const topPerformers = data.projects
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);
  
  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    switch (trend) {
      case 'UP': return '📈';
      case 'DOWN': return '📉';
      case 'STABLE': return '➡️';
    }
  };
  
  const formatCurrency = (amount: number): string => {
    return `${(amount / 1000000).toFixed(1)}M円`;
  };
  
  return (
    <div className="analytics-card roi-analysis">
      <div className="card-header">
        <div className="header-left">
          <span className="card-icon">💰</span>
          <span className="card-title">ROI分析</span>
        </div>
        <ROITrendIndicator trend={data.trend} />
      </div>
      
      <div className="card-content">
        <div className="roi-metric">
          <span className="roi-value">{data.averageROI.toFixed(0)}%</span>
          <span className="roi-label">平均ROI</span>
        </div>
        
        <div className="roi-summary">
          <span className="summary-text">
            {data.totalProjects}件のプロジェクトを分析
          </span>
        </div>
        
        <div className="roi-breakdown">
          <h4 className="breakdown-title">トップパフォーマー</h4>
          {topPerformers.map(project => (
            <div key={project.id} className="roi-item">
              <div className="project-info">
                <span className="project-name">{project.name}</span>
                <span className="project-investment">
                  投資: {formatCurrency(project.investment)}
                </span>
              </div>
              <div className="project-metrics">
                <span className={`project-roi ${project.roi > 100 ? 'positive' : 'neutral'}`}>
                  +{project.roi.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="card-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '簡易表示' : '詳細分析'}
          </button>
        </div>
        
        {showDetails && (
          <div className="detailed-metrics">
            <div className="metric-row">
              <span className="metric-label">総投資額</span>
              <span className="metric-value">
                {formatCurrency(data.projects.reduce((sum, p) => sum + p.investment, 0))}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">総リターン</span>
              <span className="metric-value">
                {formatCurrency(data.projects.reduce((sum, p) => sum + p.returns, 0))}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">成功率</span>
              <span className="metric-value">
                {((data.projects.filter(p => p.roi > 100).length / data.projects.length) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ROITrendIndicatorProps {
  trend: 'UP' | 'DOWN' | 'STABLE';
}

const ROITrendIndicator: React.FC<ROITrendIndicatorProps> = ({ trend }) => {
  const getTrendConfig = () => {
    switch (trend) {
      case 'UP':
        return { icon: '📈', text: '上昇傾向', className: 'trend-up' };
      case 'DOWN':
        return { icon: '📉', text: '下降傾向', className: 'trend-down' };
      case 'STABLE':
        return { icon: '➡️', text: '横ばい', className: 'trend-stable' };
    }
  };
  
  const config = getTrendConfig();
  
  return (
    <div className={`trend-indicator ${config.className}`}>
      <span className="trend-icon">{config.icon}</span>
      <span className="trend-text">{config.text}</span>
    </div>
  );
};

export default ROIAnalyticsCard;