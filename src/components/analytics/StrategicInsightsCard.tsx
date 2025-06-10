// 戦略的インサイトカードコンポーネント - Phase 3 実装
import React, { useState } from 'react';
import { StrategicRecommendation } from '../../analytics/engines/StrategicInsightsEngine';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

interface StrategicInsightsCardProps {
  data: {
    opportunityValue: string;
    recommendations: StrategicRecommendation[];
    keyFindings: string[];
    actionItems: number;
  };
}

const StrategicInsightsCard: React.FC<StrategicInsightsCardProps> = ({ data }) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const { userLevel } = usePermissions();
  
  // レベル6以上のアカウントのみアクセス可能
  if (userLevel < PermissionLevel.LEVEL_6) {
    return (
      <div className="analytics-card strategic-insights">
        <div className="card-header">
          <span className="card-icon">🔒</span>
          <span className="card-title">戦略的インサイト</span>
        </div>
        <div className="card-content">
          <div className="permission-notice">
            <p className="notice-text">この機能はレベル6以上のアカウントでご利用いただけます</p>
            <p className="notice-subtext">人財統括本部統括管理部門長以上の権限が必要です</p>
          </div>
        </div>
      </div>
    );
  }
  
  const highPriorityInsights = data.recommendations
    .filter(r => r.priority === 'HIGH')
    .slice(0, 3);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SCALING_OPPORTUNITY': return '📈';
      case 'INVESTMENT_OPTIMIZATION': return '💰';
      case 'RISK_MITIGATION': return '🛡️';
      case 'INNOVATION_FOCUS': return '💡';
      default: return '📊';
    }
  };
  
  return (
    <div className="analytics-card strategic-insights">
      <div className="card-header">
        <span className="card-icon">🎯</span>
        <span className="card-title">戦略的インサイト</span>
        {data.actionItems > 0 && (
          <span className="action-badge">{data.actionItems}件のアクション</span>
        )}
      </div>
      
      <div className="card-content">
        <div className="insights-summary">
          <div className="insight-metric">
            <span className="metric-value">{data.opportunityValue}</span>
            <span className="metric-label">機会価値</span>
          </div>
        </div>
        
        {data.keyFindings.length > 0 && (
          <div className="key-findings">
            <h4 className="findings-title">主要な発見</h4>
            <ul className="findings-list">
              {data.keyFindings.slice(0, 2).map((finding, index) => (
                <li key={index} className="finding-item">
                  <span className="finding-icon">💡</span>
                  <span className="finding-text">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="recommendations-list">
          <h4 className="recommendations-title">戦略的推奨事項</h4>
          {highPriorityInsights.map((insight, index) => (
            <div 
              key={index} 
              className={`recommendation-item ${expandedRecommendation === insight.title ? 'expanded' : ''}`}
            >
              <div 
                className="recommendation-header"
                onClick={() => setExpandedRecommendation(
                  expandedRecommendation === insight.title ? null : insight.title
                )}
              >
                <div className="header-left">
                  <span className="type-icon">{getTypeIcon(insight.type)}</span>
                  <span className="recommendation-title">{insight.title}</span>
                </div>
                <span className={`priority-badge ${getPriorityColor(insight.priority)}`}>
                  {insight.priority}
                </span>
              </div>
              
              {expandedRecommendation === insight.title && (
                <div className="recommendation-details">
                  <p className="recommendation-description">{insight.description}</p>
                  <div className="recommendation-meta">
                    <div className="meta-item">
                      <span className="meta-label">期待効果:</span>
                      <span className="meta-value">{insight.expectedImpact}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">実装コスト:</span>
                      <span className={`meta-value cost-${insight.implementationCost.toLowerCase()}`}>
                        {insight.implementationCost}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">実施期間:</span>
                      <span className="meta-value">{insight.timeframe}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="card-actions">
          <button className="btn-secondary">
            全ての推奨事項を表示
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategicInsightsCard;