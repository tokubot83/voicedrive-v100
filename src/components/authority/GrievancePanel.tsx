// Grievance Panel Component

import React, { useState, useEffect } from 'react';
import { Users, Shield, AlertCircle, Check, X, Eye, FileText, Lock } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { AuditService } from '../../services/AuditService';
import { Grievance, AuthorityType, QuarterlyReview } from '../../types/authority';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

const GrievancePanel: React.FC = () => {
  const { currentUser } = usePermissions();
  const auditService = AuditService.getInstance();

  const [activeTab, setActiveTab] = useState<'submit' | 'review' | 'quarterly'>('submit');
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [quarterlyReviews, setQuarterlyReviews] = useState<QuarterlyReview[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  
  // Grievance submission form
  const [grievanceForm, setGrievanceForm] = useState({
    targetActionId: '',
    targetActionType: '' as AuthorityType | '',
    description: '',
    evidence: [] as string[],
    isAnonymous: true
  });

  // Quarterly review form
  const [reviewForm, setReviewForm] = useState({
    findings: [] as string[],
    recommendations: [] as string[]
  });

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = () => {
    if (!currentUser) return;

    // Load grievances
    if (currentUser.permissionLevel >= PermissionLevel.LEVEL_6) {
      const allGrievances = auditService.getGrievances();
      setGrievances(allGrievances);
    } else {
      // Regular users can only see their own grievances
      const myGrievances = auditService.getGrievances({ submitterId: currentUser.id });
      setGrievances(myGrievances);
    }

    // Load quarterly reviews
    const reviews = auditService.getQuarterlyReviews({ reviewerId: currentUser.id });
    setQuarterlyReviews(reviews);
  };

  const handleSubmitGrievance = async () => {
    const { targetActionId, targetActionType, description, evidence, isAnonymous } = grievanceForm;
    
    if (!targetActionId || !targetActionType || !description) {
      alert('Please fill in all required fields');
      return;
    }

    const result = await auditService.submitGrievance(
      targetActionId,
      targetActionType as AuthorityType,
      description,
      evidence,
      isAnonymous ? undefined : currentUser?.id
    );

    if (result.success) {
      alert(result.message);
      setGrievanceForm({
        targetActionId: '',
        targetActionType: '',
        description: '',
        evidence: [],
        isAnonymous: true
      });
      loadData();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleProcessGrievance = async (
    grievanceId: string,
    outcome: 'resolved' | 'dismissed',
    resolution: string,
    actions: string[]
  ) => {
    if (!currentUser) return;

    const result = await auditService.processGrievance(
      currentUser,
      grievanceId,
      outcome,
      resolution,
      actions
    );

    if (result.success) {
      alert(result.message);
      setSelectedGrievance(null);
      loadData();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleSubmitQuarterlyReview = async (reviewId: string) => {
    if (!currentUser || reviewForm.findings.length === 0) return;

    const result = await auditService.submitQuarterlyReview(
      currentUser,
      reviewId,
      reviewForm.findings,
      reviewForm.recommendations
    );

    if (result.success) {
      alert('Quarterly review submitted successfully');
      setReviewForm({ findings: [], recommendations: [] });
      loadData();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const getGrievanceStatusColor = (status: Grievance['status']) => {
    switch (status) {
      case 'submitted': return 'text-yellow-400';
      case 'under_review': return 'text-blue-400';
      case 'resolved': return 'text-green-400';
      case 'dismissed': return 'text-red-400';
    }
  };

  const canReviewGrievances = currentUser && currentUser.permissionLevel >= PermissionLevel.LEVEL_6;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg">
        <div className="border-b border-gray-700">
          <div className="flex space-x-6 px-6">
            <button
              onClick={() => setActiveTab('submit')}
              className={`
                py-3 border-b-2 transition-colors
                ${activeTab === 'submit'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              Submit Grievance
            </button>
            {canReviewGrievances && (
              <button
                onClick={() => setActiveTab('review')}
                className={`
                  py-3 border-b-2 transition-colors flex items-center
                  ${activeTab === 'review'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                  }
                `}
              >
                Review Grievances
                {grievances.filter(g => g.status === 'under_review').length > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {grievances.filter(g => g.status === 'under_review').length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab('quarterly')}
              className={`
                py-3 border-b-2 transition-colors
                ${activeTab === 'quarterly'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              Quarterly Reviews
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'submit' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Submit a Grievance</h3>
                <p className="text-gray-400 text-sm">
                  Report concerns about authority actions. Your identity can be kept anonymous.
                </p>
              </div>

              {/* Anonymous Toggle */}
              <div className="mb-6 bg-gray-700 rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grievanceForm.isAnonymous}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, isAnonymous: e.target.checked })}
                    className="mr-3"
                  />
                  <div>
                    <p className="text-white font-medium flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Submit Anonymously
                    </p>
                    <p className="text-gray-400 text-sm">
                      Your identity will be protected. Only the grievance content will be visible to reviewers.
                    </p>
                  </div>
                </label>
              </div>

              {/* Target Action */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Action ID
                  </label>
                  <input
                    type="text"
                    value={grievanceForm.targetActionId}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, targetActionId: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="Enter the ID of the action you're reporting..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Action Type
                  </label>
                  <select
                    value={grievanceForm.targetActionType}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, targetActionType: e.target.value as any })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="">Select action type...</option>
                    <option value="WEIGHT_ADJUSTMENT">Weight Adjustment</option>
                    <option value="BUDGET_APPROVAL">Budget Approval</option>
                    <option value="EMERGENCY_ACTION">Emergency Action</option>
                    <option value="CROSS_DEPARTMENT_REVIEW">Cross-Department Review</option>
                    <option value="SYSTEM_OVERRIDE">System Override</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={grievanceForm.description}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 h-32"
                    placeholder="Describe your concern in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Evidence (Optional)
                  </label>
                  <textarea
                    value={grievanceForm.evidence.join('\n')}
                    onChange={(e) => setGrievanceForm({ 
                      ...grievanceForm, 
                      evidence: e.target.value.split('\n').filter(e => e.trim())
                    })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 h-20"
                    placeholder="List any supporting evidence (one per line)..."
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitGrievance}
                disabled={!grievanceForm.targetActionId || !grievanceForm.targetActionType || !grievanceForm.description}
                className={`
                  mt-6 w-full py-3 rounded-lg font-medium transition-colors
                  ${grievanceForm.targetActionId && grievanceForm.targetActionType && grievanceForm.description
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Submit Grievance
              </button>
            </div>
          )}

          {activeTab === 'review' && canReviewGrievances && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white">Grievance Review Queue</h3>
                <p className="text-gray-400 text-sm">
                  Review and process submitted grievances
                </p>
              </div>

              {grievances.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3" />
                  <p>No grievances to review</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grievances.map((grievance) => (
                    <GrievanceCard
                      key={grievance.id}
                      grievance={grievance}
                      onSelect={() => setSelectedGrievance(grievance)}
                      isSelected={selectedGrievance?.id === grievance.id}
                    />
                  ))}
                </div>
              )}

              {/* Grievance Processing Modal */}
              {selectedGrievance && (
                <GrievanceProcessingModal
                  grievance={selectedGrievance}
                  onProcess={handleProcessGrievance}
                  onClose={() => setSelectedGrievance(null)}
                />
              )}
            </div>
          )}

          {activeTab === 'quarterly' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white">Quarterly Cross-Department Reviews</h3>
                <p className="text-gray-400 text-sm">
                  Complete your assigned quarterly reviews
                </p>
              </div>

              {quarterlyReviews.filter(r => r.status !== 'completed').length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3" />
                  <p>No pending quarterly reviews</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quarterlyReviews.filter(r => r.status !== 'completed').map((review) => (
                    <QuarterlyReviewCard
                      key={review.id}
                      review={review}
                      onSubmit={() => handleSubmitQuarterlyReview(review.id)}
                      findings={reviewForm.findings}
                      recommendations={reviewForm.recommendations}
                      onUpdateFindings={(findings) => setReviewForm({ ...reviewForm, findings })}
                      onUpdateRecommendations={(recommendations) => setReviewForm({ ...reviewForm, recommendations })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* My Grievances History */}
      {activeTab === 'submit' && grievances.filter(g => g.submitterId === currentUser?.id).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">My Grievances</h3>
          <div className="space-y-3">
            {grievances
              .filter(g => g.submitterId === currentUser?.id)
              .map((grievance) => (
                <div key={grievance.id} className="bg-gray-700 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-300">
                      {grievance.targetActionType} - {grievance.targetActionId}
                    </p>
                    <span className={`text-sm ${getGrievanceStatusColor(grievance.status)}`}>
                      {grievance.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{grievance.description}</p>
                  {grievance.resolution && (
                    <div className="mt-3 bg-gray-600 rounded p-3">
                      <p className="text-green-400 text-sm font-medium mb-1">Resolution</p>
                      <p className="text-gray-300 text-sm">{grievance.resolution.outcome}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Grievance Card Component
const GrievanceCard: React.FC<{
  grievance: Grievance;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ grievance, onSelect, isSelected }) => {
  const statusColors = {
    submitted: 'bg-yellow-900/50 text-yellow-400',
    under_review: 'bg-blue-900/50 text-blue-400',
    resolved: 'bg-green-900/50 text-green-400',
    dismissed: 'bg-red-900/50 text-red-400'
  };

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
          <p className="text-white font-medium">
            {grievance.targetActionType} Grievance
          </p>
          <p className="text-gray-400 text-sm">
            Target: {grievance.targetActionId}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${statusColors[grievance.status]}`}>
          {grievance.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-gray-300 text-sm line-clamp-2">{grievance.description}</p>
      
      <div className="flex justify-between items-center mt-3">
        <p className="text-gray-500 text-xs">
          {new Date(grievance.submittedAt).toLocaleDateString()}
        </p>
        {grievance.isAnonymous && (
          <span className="text-gray-400 text-xs flex items-center">
            <Lock className="w-3 h-3 mr-1" />
            Anonymous
          </span>
        )}
      </div>
    </div>
  );
};

// Grievance Processing Modal Component
const GrievanceProcessingModal: React.FC<{
  grievance: Grievance;
  onProcess: (id: string, outcome: 'resolved' | 'dismissed', resolution: string, actions: string[]) => void;
  onClose: () => void;
}> = ({ grievance, onProcess, onClose }) => {
  const [outcome, setOutcome] = useState<'resolved' | 'dismissed'>('resolved');
  const [resolution, setResolution] = useState('');
  const [actions, setActions] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!resolution) {
      alert('Please provide a resolution');
      return;
    }
    onProcess(grievance.id, outcome, resolution, actions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-white mb-4">Process Grievance</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">Target Action</p>
            <p className="text-gray-400">
              {grievance.targetActionType} - {grievance.targetActionId}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">Description</p>
            <p className="text-gray-400">{grievance.description}</p>
          </div>

          {grievance.evidence && grievance.evidence.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">Evidence</p>
              <ul className="list-disc list-inside text-gray-400 text-sm">
                {grievance.evidence.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Outcome
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="resolved"
                  checked={outcome === 'resolved'}
                  onChange={(e) => setOutcome(e.target.value as 'resolved')}
                  className="mr-2"
                />
                <span className="text-green-400">Resolved</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="dismissed"
                  checked={outcome === 'dismissed'}
                  onChange={(e) => setOutcome(e.target.value as 'dismissed')}
                  className="mr-2"
                />
                <span className="text-red-400">Dismissed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resolution
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 h-24"
              placeholder="Explain the resolution or reason for dismissal..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Actions Taken (Optional)
            </label>
            <textarea
              value={actions.join('\n')}
              onChange={(e) => setActions(e.target.value.split('\n').filter(a => a.trim()))}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 h-20"
              placeholder="List any actions taken (one per line)..."
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!resolution}
            className={`
              flex-1 py-2 rounded font-medium transition-colors
              ${resolution
                ? outcome === 'resolved' 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {outcome === 'resolved' ? 'Resolve' : 'Dismiss'} Grievance
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Quarterly Review Card Component
const QuarterlyReviewCard: React.FC<{
  review: QuarterlyReview;
  onSubmit: () => void;
  findings: string[];
  recommendations: string[];
  onUpdateFindings: (findings: string[]) => void;
  onUpdateRecommendations: (recommendations: string[]) => void;
}> = ({ review, onSubmit, findings, recommendations, onUpdateFindings, onUpdateRecommendations }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <h4 className="text-white font-medium">{review.quarter} Review</h4>
        <p className="text-gray-400 text-sm">Department: {review.departmentId}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Findings
          </label>
          <textarea
            value={findings.join('\n')}
            onChange={(e) => onUpdateFindings(e.target.value.split('\n').filter(f => f.trim()))}
            className="w-full bg-gray-600 text-white rounded px-3 py-2 h-24"
            placeholder="List your findings (one per line)..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recommendations
          </label>
          <textarea
            value={recommendations.join('\n')}
            onChange={(e) => onUpdateRecommendations(e.target.value.split('\n').filter(r => r.trim()))}
            className="w-full bg-gray-600 text-white rounded px-3 py-2 h-24"
            placeholder="List your recommendations (one per line)..."
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={findings.length === 0}
          className={`
            w-full py-2 rounded font-medium transition-colors
            ${findings.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default GrievancePanel;