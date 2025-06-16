// Weight Adjustment Panel Component

import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, TrendingDown, Clock, Check, X } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { WeightAdjustmentService } from '../../services/WeightAdjustmentService';
import { 
  WeightAdjustment, 
  DepartmentSpecialty,
  WEIGHT_ADJUSTMENT_AUTHORITIES,
  CrossDepartmentReview
} from '../../types/authority';
import { ProposalType, StakeholderCategory } from '../../types';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

const WeightAdjustmentPanel: React.FC = () => {
  const { currentUser } = usePermissions();
  const weightService = WeightAdjustmentService.getInstance();

  const [selectedSpecialty, setSelectedSpecialty] = useState<DepartmentSpecialty>('humanDevelopment');
  const [selectedProposal, setSelectedProposal] = useState<ProposalType>('operational');
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderCategory>('frontline');
  const [newWeight, setNewWeight] = useState<number>(1.0);
  const [reason, setReason] = useState('');
  const [pendingAdjustments, setPendingAdjustments] = useState<WeightAdjustment[]>([]);
  const [pendingReviews, setPendingReviews] = useState<CrossDepartmentReview[]>([]);
  const [history, setHistory] = useState<WeightAdjustment[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    // Update current weight when selection changes
    const currentWeight = weightService.getCurrentWeight(selectedProposal, selectedStakeholder);
    setNewWeight(currentWeight);
  }, [selectedProposal, selectedStakeholder]);

  const loadData = () => {
    if (!currentUser) return;

    // Load pending adjustments for HR Director
    if (currentUser.permissionLevel === PermissionLevel.LEVEL_6) {
      setPendingAdjustments(weightService.getPendingAdjustments(currentUser.id));
    }

    // Load pending reviews for department heads
    if (currentUser.permissionLevel >= PermissionLevel.LEVEL_3) {
      setPendingReviews(weightService.getPendingReviews(currentUser.id));
    }

    // Load history
    setHistory(weightService.getWeightHistory());
  };

  const handleSubmitAdjustment = async () => {
    if (!currentUser || !reason) return;

    const result = await weightService.requestWeightAdjustment(
      currentUser,
      selectedSpecialty,
      selectedProposal,
      selectedStakeholder,
      newWeight,
      reason
    );

    if (result.success) {
      setReason('');
      loadData();
      alert(result.message);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleReviewDecision = async (reviewId: string, decision: 'approve' | 'veto', reviewReason: string) => {
    if (!currentUser) return;

    const result = await weightService.processCrossDepartmentReview(
      currentUser,
      reviewId,
      decision,
      reviewReason
    );

    if (result.success) {
      loadData();
      alert('Review submitted successfully');
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const currentWeight = weightService.getCurrentWeight(selectedProposal, selectedStakeholder);
  const adjustment = newWeight - currentWeight;
  const config = WEIGHT_ADJUSTMENT_AUTHORITIES[selectedSpecialty];
  const isWithinRange = Math.abs(adjustment) <= config.adjustmentRange;

  // Check user's authority
  const canAdjustWeights = currentUser && (
    currentUser.permissionLevel === PermissionLevel.LEVEL_6 || // HR Director
    (currentUser.permissionLevel >= PermissionLevel.LEVEL_3 && currentUser.permissionLevel <= PermissionLevel.LEVEL_5)
  );

  return (
    <div className="space-y-6">
      {/* Weight Adjustment Form */}
      {canAdjustWeights && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Scale className="w-5 h-5 mr-2 text-blue-400" />
            Request Weight Adjustment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Department Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value as DepartmentSpecialty)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value="humanDevelopment">Human Development (±0.3)</option>
                <option value="careerSupport">Career Support (±0.4)</option>
                <option value="businessInnovation">Business Innovation (±0.3)</option>
              </select>
            </div>

            {/* Proposal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proposal Type
              </label>
              <select
                value={selectedProposal}
                onChange={(e) => setSelectedProposal(e.target.value as ProposalType)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value="operational">Operational</option>
                <option value="strategic">Strategic</option>
                <option value="innovation">Innovation</option>
                <option value="strategic">Strategic</option>
                <option value="communication">Communication</option>
              </select>
            </div>

            {/* Stakeholder Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stakeholder Category
              </label>
              <select
                value={selectedStakeholder}
                onChange={(e) => setSelectedStakeholder(e.target.value as StakeholderCategory)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value="frontline">Frontline Staff</option>
                <option value="management">Management</option>
                <option value="veteran">Veteran</option>
                <option value="zGen">Z Generation</option>
              </select>
            </div>
          </div>

          {/* Weight Adjustment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Weight Adjustment
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="text-white font-mono bg-gray-700 px-3 py-1 rounded">
                {newWeight.toFixed(1)}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Current: {currentWeight.toFixed(1)}</span>
              <span className={`${adjustment > 0 ? 'text-green-400' : adjustment < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {adjustment > 0 ? '+' : ''}{adjustment.toFixed(1)}
                {!isWithinRange && <span className="text-red-500 ml-2">Exceeds limit!</span>}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Adjustment
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 h-24"
              placeholder="Provide detailed justification for this weight adjustment..."
            />
          </div>

          <button
            onClick={handleSubmitAdjustment}
            disabled={!reason || !isWithinRange || adjustment === 0}
            className={`
              px-4 py-2 rounded font-medium transition-colors
              ${reason && isWithinRange && adjustment !== 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Submit Adjustment Request
          </button>
        </div>
      )}

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Pending Cross-Department Reviews
          </h3>
          <div className="space-y-3">
            {pendingReviews.map((review) => (
              <PendingReviewCard
                key={review.id}
                review={review}
                onDecision={handleReviewDecision}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Adjustments (HR Director) */}
      {currentUser?.permissionLevel === PermissionLevel.LEVEL_6 && pendingAdjustments.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Pending Adjustment Approvals
          </h3>
          <div className="space-y-3">
            {pendingAdjustments.map((adjustment) => (
              <PendingAdjustmentCard
                key={adjustment.id}
                adjustment={adjustment}
                onApprove={() => {/* Handle approval */}}
                onReject={() => {/* Handle rejection */}}
              />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Weight Adjustment History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-2 text-sm font-medium text-gray-400">Date</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Type</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Category</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Change</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Status</th>
                <th className="pb-2 text-sm font-medium text-gray-400">Requester</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((item) => (
                <tr key={item.id} className="border-b border-gray-700">
                  <td className="py-3 text-sm text-gray-300">
                    {new Date(item.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-sm text-gray-300">{item.proposalType}</td>
                  <td className="py-3 text-sm text-gray-300">{item.stakeholderCategory}</td>
                  <td className="py-3 text-sm">
                    <span className={`${item.adjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.adjustment > 0 ? '+' : ''}{item.adjustment.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 text-sm">
                    <span className={`
                      px-2 py-1 rounded text-xs
                      ${item.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                        item.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                        'bg-yellow-900/50 text-yellow-400'}
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-300">{item.requesterId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Pending Review Card Component
const PendingReviewCard: React.FC<{
  review: CrossDepartmentReview;
  onDecision: (reviewId: string, decision: 'approve' | 'veto', reason: string) => void;
}> = ({ review, onDecision }) => {
  const [reviewReason, setReviewReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<'approve' | 'veto' | null>(null);

  const handleDecision = (decision: 'approve' | 'veto') => {
    setSelectedDecision(decision);
    if (decision === 'veto') {
      setShowReasonInput(true);
    } else {
      onDecision(review.id, decision, '');
    }
  };

  const submitDecision = () => {
    if (selectedDecision && (selectedDecision === 'approve' || reviewReason)) {
      onDecision(review.id, selectedDecision, reviewReason);
    }
  };

  const timeRemaining = Math.max(0, review.vetoDeadline.getTime() - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  return (
    <div className="bg-gray-700 rounded p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-white font-medium">Weight Adjustment Review</p>
          <p className="text-gray-400 text-sm">Department: {review.departmentId}</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-400 text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {hoursRemaining}h remaining
          </p>
        </div>
      </div>

      {!showReasonInput ? (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDecision('approve')}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </button>
          <button
            onClick={() => handleDecision('veto')}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-1" />
            Veto
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={reviewReason}
            onChange={(e) => setReviewReason(e.target.value)}
            className="w-full bg-gray-600 text-white rounded px-3 py-2 h-20"
            placeholder="Reason for veto (required)..."
          />
          <div className="flex space-x-2">
            <button
              onClick={submitDecision}
              disabled={!reviewReason}
              className={`
                flex-1 py-2 rounded transition-colors
                ${reviewReason
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Submit Veto
            </button>
            <button
              onClick={() => {
                setShowReasonInput(false);
                setSelectedDecision(null);
                setReviewReason('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Pending Adjustment Card Component
const PendingAdjustmentCard: React.FC<{
  adjustment: WeightAdjustment;
  onApprove: () => void;
  onReject: () => void;
}> = ({ adjustment, onApprove, onReject }) => {
  return (
    <div className="bg-gray-700 rounded p-4">
      <div className="mb-3">
        <p className="text-white font-medium">
          {adjustment.proposalType} - {adjustment.stakeholderCategory}
        </p>
        <p className="text-gray-400 text-sm">
          Weight: {adjustment.previousWeight.toFixed(1)} → {adjustment.newWeight.toFixed(1)}
          <span className={`ml-2 ${adjustment.adjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ({adjustment.adjustment > 0 ? '+' : ''}{adjustment.adjustment.toFixed(1)})
          </span>
        </p>
        <p className="text-gray-400 text-sm mt-1">Reason: {adjustment.reason}</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default WeightAdjustmentPanel;