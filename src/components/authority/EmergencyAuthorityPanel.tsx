// Emergency Authority Panel Component

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { EmergencyAuthorityService } from '../../services/EmergencyAuthorityService';
import { EmergencyLevel, EmergencyAction } from '../../types/authority';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

const EmergencyAuthorityPanel: React.FC = () => {
  const { currentUser } = usePermissions();
  const emergencyService = EmergencyAuthorityService.getInstance();

  const [activeTab, setActiveTab] = useState<'declare' | 'active' | 'history'>('declare');
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>('FACILITY');
  const [scenario, setScenario] = useState('');
  const [actionType, setActionType] = useState('');
  const [affectedResources, setAffectedResources] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyAction[]>([]);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyAction[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // Emergency scenarios by level
  const SCENARIOS = {
    FACILITY: [
      { value: 'natural_disaster', label: 'Natural Disaster' },
      { value: 'facility_accident', label: 'Facility Accident' },
      { value: 'critical_staffing_shortage', label: 'Critical Staffing Shortage' },
      { value: 'equipment_failure', label: 'Equipment Failure' },
      { value: 'security_breach', label: 'Security Breach' }
    ],
    CORPORATE: [
      { value: 'data_breach', label: 'Data Breach' },
      { value: 'financial_crisis', label: 'Financial Crisis' },
      { value: 'regulatory_violation', label: 'Regulatory Violation' },
      { value: 'major_system_failure', label: 'Major System Failure' },
      { value: 'reputation_crisis', label: 'Reputation Crisis' }
    ],
    SYSTEM: [
      { value: 'complete_system_failure', label: 'Complete System Failure' },
      { value: 'cyber_attack', label: 'Cyber Attack' },
      { value: 'pandemic_response', label: 'Pandemic Response' },
      { value: 'executive_incapacitation', label: 'Executive Incapacitation' },
      { value: 'hostile_takeover', label: 'Hostile Takeover' }
    ]
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = () => {
    if (!currentUser) return;

    // Load active emergencies
    const active = emergencyService.getEmergencyActions({ pendingReports: true });
    setActiveEmergencies(active);

    // Load history
    const history = emergencyService.getEmergencyActions();
    setEmergencyHistory(history);

    // Load metrics
    const emergencyMetrics = emergencyService.getEmergencyMetrics();
    setMetrics(emergencyMetrics);
  };

  const handleDeclareEmergency = async () => {
    if (!currentUser || !scenario || !actionType || !reason) return;

    const result = await emergencyService.declareEmergency(
      currentUser,
      emergencyLevel,
      scenario,
      actionType,
      affectedResources,
      reason
    );

    if (result.success) {
      // Reset form
      setScenario('');
      setActionType('');
      setAffectedResources([]);
      setReason('');
      loadData();
      alert(result.message);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const canDeclareEmergency = (level: EmergencyLevel): boolean => {
    if (!currentUser) return false;
    
    const requiredLevels: Record<EmergencyLevel, PermissionLevel> = {
      FACILITY: PermissionLevel.LEVEL_7,  // 人財統括本部 各部門長
      CORPORATE: PermissionLevel.LEVEL_9, // 部長・本部長級
      SYSTEM: PermissionLevel.LEVEL_10    // 役員・経営層
    };

    return currentUser.permissionLevel >= requiredLevels[level];
  };

  const getEmergencyLevelColor = (level: EmergencyLevel) => {
    switch (level) {
      case 'FACILITY': return 'text-yellow-400';
      case 'CORPORATE': return 'text-orange-400';
      case 'SYSTEM': return 'text-red-400';
    }
  };

  const getEmergencyLevelBg = (level: EmergencyLevel) => {
    switch (level) {
      case 'FACILITY': return 'bg-yellow-900/20 border-yellow-800';
      case 'CORPORATE': return 'bg-orange-900/20 border-orange-800';
      case 'SYSTEM': return 'bg-red-900/20 border-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Total Emergencies</span>
              <AlertTriangle className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-white">{metrics.totalEmergencies}</div>
          </div>
          
          {Object.entries(metrics.byLevel).map(([level, count]) => (
            <div key={level} className={`${getEmergencyLevelBg(level as EmergencyLevel)} border rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">{level}</span>
                <Shield className={`w-4 h-4 ${getEmergencyLevelColor(level as EmergencyLevel)}`} />
              </div>
              <div className="text-2xl font-bold">{String(count)}</div>
            </div>
          ))}
          
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Pending Reports</span>
              <FileText className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-400">{metrics.pendingReports}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg">
        <div className="border-b border-gray-700">
          <div className="flex space-x-6 px-6">
            <button
              onClick={() => setActiveTab('declare')}
              className={`
                py-3 border-b-2 transition-colors
                ${activeTab === 'declare'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              Declare Emergency
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`
                py-3 border-b-2 transition-colors flex items-center
                ${activeTab === 'active'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              Active Emergencies
              {activeEmergencies.length > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeEmergencies.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`
                py-3 border-b-2 transition-colors
                ${activeTab === 'history'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              History
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'declare' && (
            <div className="space-y-6">
              {/* Emergency Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Emergency Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['FACILITY', 'CORPORATE', 'SYSTEM'] as EmergencyLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setEmergencyLevel(level)}
                      disabled={!canDeclareEmergency(level)}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${emergencyLevel === level
                          ? getEmergencyLevelBg(level) + ' border-current'
                          : 'bg-gray-700 border-gray-600'
                        }
                        ${!canDeclareEmergency(level) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className={`font-medium ${getEmergencyLevelColor(level)}`}>
                        {level}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Level {level === 'FACILITY' ? '4+' : level === 'CORPORATE' ? '7+' : '8'} Required
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Emergency Scenario
                </label>
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="">Select scenario...</option>
                  {SCENARIOS[emergencyLevel].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Action Type
                </label>
                <input
                  type="text"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  placeholder="e.g., Resource reallocation, Policy override..."
                />
              </div>

              {/* Affected Resources */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Affected Resources
                </label>
                <textarea
                  value={affectedResources.join('\n')}
                  onChange={(e) => setAffectedResources(e.target.value.split('\n').filter(r => r))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 h-20"
                  placeholder="List affected resources (one per line)..."
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Justification
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 h-32"
                  placeholder="Provide detailed justification for emergency declaration..."
                />
              </div>

              {/* Warning */}
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-red-300">
                    <p className="font-medium mb-1">Emergency Declaration Warning</p>
                    <p>This action will be immediately logged and notifications sent to senior management.</p>
                    <p className="mt-1">Post-action report required within {
                      emergencyLevel === 'FACILITY' ? '24' :
                      emergencyLevel === 'CORPORATE' ? '12' : '48'
                    } hours.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleDeclareEmergency}
                disabled={!scenario || !actionType || !reason || !canDeclareEmergency(emergencyLevel)}
                className={`
                  w-full py-3 rounded-lg font-medium transition-colors
                  ${scenario && actionType && reason && canDeclareEmergency(emergencyLevel)
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <AlertTriangle className="w-5 h-5 inline-block mr-2" />
                Declare {emergencyLevel} Emergency
              </button>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeEmergencies.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>No active emergencies</p>
                </div>
              ) : (
                activeEmergencies.map((emergency) => (
                  <EmergencyCard key={emergency.id} emergency={emergency} showReportButton />
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {emergencyHistory.slice(0, 10).map((emergency) => (
                <EmergencyCard key={emergency.id} emergency={emergency} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Emergency Card Component
const EmergencyCard: React.FC<{
  emergency: EmergencyAction;
  showReportButton?: boolean;
}> = ({ emergency, showReportButton }) => {
  const levelColor = {
    FACILITY: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
    CORPORATE: 'bg-orange-900/20 text-orange-400 border-orange-800',
    SYSTEM: 'bg-red-900/20 text-red-400 border-red-800'
  };

  const timeSinceExecution = Date.now() - new Date(emergency.executedAt).getTime();
  const hoursSinceExecution = Math.floor(timeSinceExecution / (1000 * 60 * 60));

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className={`
              px-2 py-1 rounded text-xs font-medium
              ${levelColor[emergency.emergencyLevel]}
            `}>
              {emergency.emergencyLevel}
            </span>
            <span className="text-white font-medium">{emergency.actionType}</span>
          </div>
          <p className="text-gray-400 text-sm">
            Executed {hoursSinceExecution}h ago by {emergency.actorId}
          </p>
        </div>
        {!emergency.postActionReport && (
          <div className="text-red-400 text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Report pending
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-gray-300 text-sm mb-1">Reason: {emergency.reason}</p>
        {emergency.affectedResources.length > 0 && (
          <p className="text-gray-400 text-sm">
            Affected: {emergency.affectedResources.join(', ')}
          </p>
        )}
      </div>

      {emergency.postActionReport && (
        <div className="bg-gray-600 rounded p-3 text-sm">
          <p className="text-green-400 font-medium mb-1">
            Report submitted {new Date(emergency.postActionReport.submittedAt).toLocaleDateString()}
          </p>
          <p className="text-gray-300">{emergency.postActionReport.outcomes}</p>
        </div>
      )}

      {showReportButton && !emergency.postActionReport && (
        <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
          Submit Post-Action Report
        </button>
      )}
    </div>
  );
};

export default EmergencyAuthorityPanel;