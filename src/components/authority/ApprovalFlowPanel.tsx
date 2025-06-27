// Approval Flow Panel Component

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { ApprovalFlowService } from '../../services/ApprovalFlowService';
import { ApprovalRequest, ApprovalNode } from '../../types/authority';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';
import CurrentApprovalCard from '../approval/CurrentApprovalCard';

const ApprovalFlowPanel: React.FC = () => {
  const { currentUser } = usePermissions();
  const approvalService = ApprovalFlowService.getInstance();

  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRequest[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvalReason, setApprovalReason] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = () => {
    if (!currentUser) return;

    // Load pending approvals
    const pending = approvalService.getPendingApprovals(currentUser.id);
    setPendingApprovals(pending);

    // Load history
    const history = approvalService.getApprovalHistory({ approverId: currentUser.id });
    setApprovalHistory(history);

    // Load metrics
    const approvalMetrics = approvalService.getApprovalMetrics();
    setMetrics(approvalMetrics);
  };

  const handleApprovalDecision = async (
    requestId: string, 
    decision: 'approved' | 'rejected',
    reason: string
  ) => {
    if (!currentUser || !reason) return;

    const result = await approvalService.processApproval(
      currentUser,
      requestId,
      decision,
      reason
    );

    if (result.success) {
      setApprovalReason('');
      setSelectedRequest(null);
      loadData();
      alert(result.message);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getTimeRemaining = (deadline: Date) => {
    const remaining = deadline.getTime() - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    
    if (hours < 0) return 'Overdue';
    if (hours < 24) return `${hours}h remaining`;
    return `${Math.floor(hours / 24)}d remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      case 'escalated': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Total Requests"
            value={metrics.totalRequests}
            icon={Clock}
          />
          <MetricCard
            label="Pending"
            value={metrics.pendingRequests}
            icon={Clock}
            highlight="yellow"
          />
          <MetricCard
            label="Approved"
            value={metrics.approvedRequests}
            icon={CheckCircle}
            highlight="green"
          />
          <MetricCard
            label="Rejected"
            value={metrics.rejectedRequests}
            icon={XCircle}
            highlight="red"
          />
          <MetricCard
            label="Escalated"
            value={metrics.escalatedRequests}
            icon={AlertTriangle}
            highlight="orange"
          />
          <MetricCard
            label="Avg Time"
            value={`${metrics.averageApprovalTime.toFixed(1)}h`}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Current Approval Card */}
      {pendingApprovals.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-400" />
            承認待ち
          </h3>
          
          <CurrentApprovalCard
            request={pendingApprovals[0]}
            onApprove={(requestId, reason) => handleApprovalDecision(requestId, 'approved', reason)}
            onReject={(requestId, reason) => handleApprovalDecision(requestId, 'rejected', reason)}
            isActionable={true}
          />

          {/* 複数の承認待ちがある場合の表示 */}
          {pendingApprovals.length > 1 && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-gray-300 text-sm">
                他に {pendingApprovals.length - 1} 件の承認待ちがあります
              </p>
            </div>
          )}
        </div>
      )}

      {/* Approval History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Approval History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-2 text-sm font-medium text-gray-400">Date</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Project</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Budget</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Status</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Your Decision</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Chain</th>
              </tr>
            </thead>
            <tbody>
              {approvalHistory.slice(0, 10).map((request) => {
                const userNode = request.approvalChain.find(
                  node => node.approverId === currentUser?.id
                );
                
                return (
                  <tr key={request.id} className="border-b border-gray-700">
                    <td className="py-3 text-sm text-gray-300">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {request.projectId}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {formatCurrency(request.budgetAmount)}
                    </td>
                    <td className="py-3 text-sm">
                      <span className={getStatusColor(request.status)}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {userNode && (
                        <span className={`
                          px-2 py-1 rounded text-xs
                          ${userNode.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                            userNode.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                            userNode.status === 'skipped' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-gray-700 text-gray-400'}
                        `}>
                          {userNode.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      <ApprovalChainIndicator chain={request.approvalChain} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.FC<any>;
  highlight?: 'yellow' | 'green' | 'red' | 'orange';
}> = ({ label, value, icon: Icon, highlight }) => {
  const highlightColors = {
    yellow: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
    green: 'bg-green-900/20 text-green-400 border-green-800',
    red: 'bg-red-900/20 text-red-400 border-red-800',
    orange: 'bg-orange-900/20 text-orange-400 border-orange-800'
  };

  return (
    <div className={`
      ${highlight ? highlightColors[highlight] : 'bg-gray-700'}
      border rounded-lg p-4
    `}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
};

// Approval Request Card Component
const ApprovalRequestCard: React.FC<{
  request: ApprovalRequest;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ request, isSelected, onSelect }) => {
  const timeRemaining = getTimeRemaining(request.deadline);
  const isOverdue = timeRemaining === 'Overdue';

  return (
    <div
      onClick={onSelect}
      className={`
        bg-gray-700 rounded-lg p-4 cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-white font-medium">Project {request.projectId}</h4>
          <p className="text-gray-400 text-sm">
            Budget: {formatCurrency(request.budgetAmount)}
          </p>
        </div>
        <div className={`
          text-sm px-2 py-1 rounded
          ${isOverdue ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}
        `}>
          {timeRemaining}
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-3">{request.reason}</p>

      <div className="flex items-center justify-between">
        <ApprovalChainIndicator 
          chain={request.approvalChain} 
          currentApproverId={request.currentApproverId}
        />
        {request.escalatedAt && (
          <span className="text-xs text-yellow-400 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Escalated
          </span>
        )}
      </div>
    </div>
  );
};

// Approval Chain Indicator Component
const ApprovalChainIndicator: React.FC<{
  chain: ApprovalNode[];
  currentApproverId?: string;
}> = ({ chain, currentApproverId }) => {
  return (
    <div className="flex items-center space-x-1">
      {chain.map((node, index) => {
        const isCurrent = currentApproverId === node.approverId;
        const statusColors = {
          approved: 'bg-green-500',
          rejected: 'bg-red-500',
          skipped: 'bg-yellow-500',
          pending: isCurrent ? 'bg-blue-500' : 'bg-gray-600'
        };

        return (
          <React.Fragment key={node.approverId}>
            <div
              className={`
                w-2 h-2 rounded-full ${statusColors[node.status]}
                ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-700' : ''}
              `}
              title={`${node.role} - ${node.status}`}
            />
            {index < chain.length - 1 && (
              <div className="w-2 h-0.5 bg-gray-600" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

function getTimeRemaining(deadline: Date): string {
  const remaining = deadline.getTime() - Date.now();
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  
  if (hours < 0) return 'Overdue';
  if (hours < 24) return `${hours}h remaining`;
  return `${Math.floor(hours / 24)}d remaining`;
}

export default ApprovalFlowPanel;