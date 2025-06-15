// 成果測定カードコンポーネント - Phase 3 実装
import React from 'react';

interface ImpactMeasurementCardProps {
  data: {
    efficiencyGain: number;
    successRate: number;
    annualSavings: number;
    qualityImprovement: number;
    timeToValue: number;
    employeeSatisfaction: number;
  };
}

const ImpactMeasurementCard: React.FC<ImpactMeasurementCardProps> = ({ data }) => {
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M円`;
    }
    return `${(amount / 1000).toFixed(0)}K円`;
  };
  
  const metrics = [
    {
      label: '効率向上',
      value: formatPercentage(data.efficiencyGain),
      icon: '⚡',
      trend: data.efficiencyGain > 10 ? 'positive' : 'neutral'
    },
    {
      label: '実装成功率',
      value: formatPercentage(data.successRate),
      icon: '✅',
      trend: data.successRate > 90 ? 'positive' : 'neutral'
    },
    {
      label: '年間削減効果',
      value: formatCurrency(data.annualSavings),
      icon: '💴',
      trend: 'positive'
    },
    {
      label: '品質改善',
      value: formatPercentage(data.qualityImprovement),
      icon: '📊',
      trend: data.qualityImprovement > 15 ? 'positive' : 'neutral'
    },
    {
      label: '価値実現期間',
      value: `${data.timeToValue}ヶ月`,
      icon: '⏱️',
      trend: data.timeToValue < 6 ? 'positive' : 'neutral'
    },
    {
      label: '従業員満足度',
      value: formatPercentage(data.employeeSatisfaction),
      icon: '😊',
      trend: data.employeeSatisfaction > 80 ? 'positive' : 'neutral'
    }
  ];
  
  return (
    <div className="analytics-card impact-measurement">
      <div className="card-header">
        <span className="card-icon">📈</span>
        <span className="card-title">成果測定</span>
      </div>
      
      <div className="card-content">
        <div className="impact-metrics">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-item">
              <div className="metric-icon">{metric?.icon}</div>
              <div className="metric-content">
                <span className={`metric-value ${metric.trend}`}>
                  {metric.value}
                </span>
                <span className="metric-label">{metric.label}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="impact-summary">
          <div className="summary-item">
            <span className="summary-icon">🎯</span>
            <span className="summary-text">
              全体的に目標を上回るパフォーマンス
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-icon">📊</span>
            <span className="summary-text">
              特に効率化と品質改善で高い成果
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactMeasurementCard;