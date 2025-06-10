import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, CheckCircle, Briefcase, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import CircularProgress from './CircularProgress';
import ConsensusDetails from './details/ConsensusDetails';
import ProjectDetails from './details/ProjectDetails';
import ApprovalProcessInlineDetails from './approval/ApprovalProcessInlineDetails';

interface ProgressDetail {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
}

interface UnifiedProgressBarProps {
  type: 'consensus' | 'approval' | 'project';
  title: string;
  percentage: number;
  status?: 'active' | 'pending' | 'completed' | 'critical';
  quickInsights: string[];
  details?: ProgressDetail[];
  detailsData?: any;
  lastUpdated?: Date;
  description?: string;
  onDetailClick?: () => void;
}

const UnifiedProgressBar: React.FC<UnifiedProgressBarProps> = ({
  type,
  title,
  percentage,
  status = 'active',
  quickInsights,
  details = [],
  detailsData,
  lastUpdated,
  description,
  onDetailClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (type) {
      case 'consensus':
        return <Users className="w-5 h-5" />;
      case 'approval':
        return <CheckCircle className="w-5 h-5" />;
      case 'project':
        return <Briefcase className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'consensus':
        return 'text-blue-400 border-blue-400/20';
      case 'approval':
        return 'text-green-400 border-green-400/20';
      case 'project':
        return 'text-purple-400 border-purple-400/20';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'critical':
        return 'bg-red-500';
    }
  };


  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-sm text-gray-400 capitalize">{status}</span>
              {lastUpdated && (
                <>
                  <span className="text-gray-600">•</span>
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {new Date(lastUpdated).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <CircularProgress
          value={percentage}
          size={80}
          strokeWidth={5}
          color={type === 'consensus' ? 'blue' : type === 'approval' ? 'green' : 'purple'}
          showPercentage={true}
          className="flex-shrink-0"
        />
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-400 text-sm mb-4">{description}</p>
      )}

      {/* Quick Insights Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickInsights.map((insight, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600"
          >
            {insight}
          </span>
        ))}
      </div>

      {/* Expandable Details Section */}
      {(details.length > 0 || detailsData) && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                詳細を隠す
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                詳細を見る
              </>
            )}
          </button>

          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="mt-4 pt-4 border-t border-gray-700">
              {detailsData ? (
                <>
                  {type === 'consensus' && <ConsensusDetails data={detailsData} />}
                  {type === 'approval' && <ApprovalProcessInlineDetails post={detailsData.post || detailsData} />}
                  {type === 'project' && <ProjectDetails data={detailsData} />}
                </>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {details.map((detail, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-sm text-gray-500">{detail.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {detail.value}
                        </span>
                        {detail.trend && (
                          <TrendingUp
                            className={`w-4 h-4 ${
                              detail.trend === 'up'
                                ? 'text-green-400'
                                : detail.trend === 'down'
                                ? 'text-red-400 rotate-180'
                                : 'text-gray-400'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Critical Status Alert */}
      {status === 'critical' && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">Requires immediate attention</span>
        </div>
      )}
    </div>
  );
};

export default UnifiedProgressBar;