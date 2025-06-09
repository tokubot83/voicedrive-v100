// 経営ダッシュボードコンポーネント - Phase 3 実装
import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/analytics/useAnalytics';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';
import ROIAnalyticsCard from './ROIAnalyticsCard';
import ImpactMeasurementCard from './ImpactMeasurementCard';
import StrategicInsightsCard from './StrategicInsightsCard';
import ProjectPipelineCard from './ProjectPipelineCard';
import ROITrendChart from '../visualization/ROITrendChart';
import BenchmarkComparison from './BenchmarkComparison';
import RiskAssessmentMatrix from '../visualization/RiskMatrix';

interface ExecutiveDashboardProps {
  initialTimeframe?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ 
  initialTimeframe = 'QUARTERLY' 
}) => {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const { 
    roiAnalytics, 
    strategicInsights, 
    performanceMetrics,
    projectPipeline,
    loading,
    error 
  } = useAnalytics(timeframe);
  
  const { checkFeatureAccess } = usePermissions();
  
  // エグゼクティブ分析機能へのアクセス権限をチェック
  const analyticsAccess = checkFeatureAccess('VIEW_EXECUTIVE_ANALYTICS');
  
  if (!analyticsAccess.hasPermission) {
    return (
      <div className="permission-gate">
        <div className="permission-icon">🔒</div>
        <h3>アクセス権限が必要です</h3>
        <p>{analyticsAccess.reason}</p>
        <button className="btn-primary">権限申請</button>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">📊</div>
        <p>分析データを読み込んでいます...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-error">
        <p>データの読み込みに失敗しました</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    );
  }
  
  return (
    <div className="executive-dashboard">
      <DashboardHeader 
        timeframe={timeframe} 
        onTimeframeChange={setTimeframe}
      />
      
      <div className="analytics-grid">
        <ROIAnalyticsCard data={roiAnalytics} />
        <ImpactMeasurementCard data={performanceMetrics} />
        <StrategicInsightsCard data={{
          opportunityValue: strategicInsights.executiveSummary || '戦略的機会を分析中',
          recommendations: strategicInsights.strategicRecommendations || [],
          keyFindings: strategicInsights.actionableInsights?.map(ai => ai.insight) || [],
          actionItems: strategicInsights.actionableInsights?.length || 0
        }} />
        <ProjectPipelineCard data={projectPipeline} />
      </div>
      
      <div className="detailed-analytics">
        <div className="analytics-section">
          <h3 className="section-title">📈 ROIトレンド分析</h3>
          <ROITrendChart data={roiAnalytics.historical} />
        </div>
        
        <div className="analytics-section">
          <h3 className="section-title">🎯 ベンチマーク比較</h3>
          <BenchmarkComparison data={strategicInsights.benchmarkComparison || []} />
        </div>
        
        <div className="analytics-section">
          <h3 className="section-title">⚠️ リスク評価マトリックス</h3>
          <RiskAssessmentMatrix risks={[
            ...(strategicInsights.riskAssessment?.riskBreakdown?.implementationRisks || []),
            ...(strategicInsights.riskAssessment?.riskBreakdown?.financialRisks || []),
            ...(strategicInsights.riskAssessment?.riskBreakdown?.operationalRisks || []),
            ...(strategicInsights.riskAssessment?.riskBreakdown?.strategicRisks || [])
          ]} />
        </div>
      </div>
      
      <QuickActions />
    </div>
  );
};

interface DashboardHeaderProps {
  timeframe: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  onTimeframeChange: (timeframe: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  timeframe, 
  onTimeframeChange 
}) => {
  return (
    <div className="analytics-header">
      <div className="header-content">
        <h2 className="analytics-title">
          <span className="title-icon">📊</span>
          プロジェクト分析センター
        </h2>
        <p className="analytics-subtitle">
          組織全体のプロジェクト効果を可視化・分析
        </p>
      </div>
      
      <div className="analytics-period-selector">
        <button 
          className={`period-btn ${timeframe === 'MONTHLY' ? 'active' : ''}`}
          onClick={() => onTimeframeChange('MONTHLY')}
        >
          今月
        </button>
        <button 
          className={`period-btn ${timeframe === 'QUARTERLY' ? 'active' : ''}`}
          onClick={() => onTimeframeChange('QUARTERLY')}
        >
          今四半期
        </button>
        <button 
          className={`period-btn ${timeframe === 'YEARLY' ? 'active' : ''}`}
          onClick={() => onTimeframeChange('YEARLY')}
        >
          今年度
        </button>
      </div>
    </div>
  );
};

const QuickActions: React.FC = () => {
  const { userLevel } = usePermissions();
  
  return (
    <div className="quick-actions">
      <h3 className="section-title">⚡ クイックアクション</h3>
      <div className="action-buttons">
        <button className="action-btn">
          <span className="btn-icon">📄</span>
          レポート出力
        </button>
        <button className="action-btn">
          <span className="btn-icon">📧</span>
          インサイト共有
        </button>
        {userLevel >= PermissionLevel.LEVEL_5 && (
          <button className="action-btn">
            <span className="btn-icon">⚙️</span>
            分析設定
          </button>
        )}
        <button className="action-btn">
          <span className="btn-icon">💡</span>
          改善提案作成
        </button>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;