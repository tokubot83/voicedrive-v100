// Audit Log Panel Component

import React, { useState, useEffect } from 'react';
import { FileText, Shield, AlertTriangle, Search, Filter, Download, Eye } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { AuditService } from '../../services/AuditService';
import { AuditLogEntry, AuthorityType } from '../../types/authority';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

const AuditLogPanel: React.FC = () => {
  const { currentUser } = usePermissions();
  const auditService = AuditService.getInstance();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [filters, setFilters] = useState({
    actorId: '',
    actionType: '' as AuthorityType | '',
    resourceType: '',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
    searchTerm: ''
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (currentUser && currentUser.permissionLevel >= PermissionLevel.LEVEL_5) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadData = () => {
    // Load audit logs
    const auditLogs = auditService.getAuditLogs({ limit: 1000 });
    setLogs(auditLogs);

    // Load alerts
    const auditAlerts = auditService.getAuditAlerts({ investigationStatus: 'pending' });
    setAlerts(auditAlerts);

    // Generate report for last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const auditReport = auditService.generateAuditReport(startDate, new Date());
    setReport(auditReport);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(log => log.timestamp >= startDate);
    }

    // Apply other filters
    if (filters.actorId) {
      filtered = filtered.filter(log => 
        log.actorId.toLowerCase().includes(filters.actorId.toLowerCase())
      );
    }

    if (filters.actionType) {
      filtered = filtered.filter(log => log.actionType === filters.actionType);
    }

    if (filters.resourceType) {
      filtered = filtered.filter(log => 
        log.resourceType.toLowerCase().includes(filters.resourceType.toLowerCase())
      );
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(log => 
        log.reason.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.resourceId.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const verifyLogIntegrity = async (logId: string) => {
    const isValid = await auditService.verifyAuditIntegrity(logId);
    alert(`Log integrity: ${isValid ? 'Valid ✓' : 'COMPROMISED ✗'}`);
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Actor', 'Action', 'Resource Type', 'Resource ID', 'Reason', 'Integrity'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.actorId,
        log.actionType,
        log.resourceType,
        log.resourceId,
        log.reason,
        log.checksum ? 'Valid' : 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getActionTypeColor = (actionType: AuthorityType) => {
    const colors = {
      WEIGHT_ADJUSTMENT: 'text-blue-400',
      BUDGET_APPROVAL: 'text-green-400',
      EMERGENCY_ACTION: 'text-red-400',
      CROSS_DEPARTMENT_REVIEW: 'text-yellow-400',
      SYSTEM_OVERRIDE: 'text-purple-400'
    };
    return colors[actionType] || 'text-gray-400';
  };

  if (!currentUser || currentUser.permissionLevel < PermissionLevel.LEVEL_5) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p>Audit log access requires HR Department Head level or higher.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audit Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <h3 className="text-red-400 font-medium">Active Audit Alerts ({alerts.length})</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="bg-red-900/30 rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-red-300 text-sm font-medium">{alert.type}</p>
                    <p className="text-gray-300 text-sm">{alert.description}</p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded text-xs
                    ${alert.severity === 'critical' ? 'bg-red-600 text-white' :
                      alert.severity === 'high' ? 'bg-orange-600 text-white' :
                      alert.severity === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'}
                  `}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Summary */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Actions (30d)</p>
            <p className="text-2xl font-bold text-white">{report.totalActions}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Grievances</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-white">{report.grievances.total}</p>
              <p className="text-sm text-gray-400">
                ({report.grievances.pending} pending)
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Integrity Issues</p>
            <p className={`text-2xl font-bold ${report.integrityIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {report.integrityIssues}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Top Actor</p>
            <p className="text-lg font-medium text-white truncate">
              {report.topActors[0]?.actorId || 'N/A'}
            </p>
            <p className="text-sm text-gray-400">
              {report.topActors[0]?.count || 0} actions
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </h3>
          <button
            onClick={exportLogs}
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Search logs..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm"
          />
          
          <input
            type="text"
            placeholder="Actor ID..."
            value={filters.actorId}
            onChange={(e) => setFilters({ ...filters, actorId: e.target.value })}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm"
          />

          <select
            value={filters.actionType}
            onChange={(e) => setFilters({ ...filters, actionType: e.target.value as any })}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm"
          >
            <option value="">All Actions</option>
            <option value="WEIGHT_ADJUSTMENT">Weight Adjustment</option>
            <option value="BUDGET_APPROVAL">Budget Approval</option>
            <option value="EMERGENCY_ACTION">Emergency Action</option>
            <option value="CROSS_DEPARTMENT_REVIEW">Cross-Dept Review</option>
            <option value="SYSTEM_OVERRIDE">System Override</option>
          </select>

          <input
            type="text"
            placeholder="Resource type..."
            value={filters.resourceType}
            onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm"
          />

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-white font-medium">
            Audit Logs ({filteredLogs.length} entries)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Actor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Resource
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLogs.slice(0, 50).map((log) => (
                <tr key={log.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {log.actorId}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={getActionTypeColor(log.actionType)}>
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div>
                      <p>{log.resourceType}</p>
                      <p className="text-xs text-gray-500">{log.resourceId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">
                    {log.reason}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-400 hover:text-blue-300"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => verifyLogIntegrity(log.id)}
                        className="text-green-400 hover:text-green-300"
                        title="Verify integrity"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-white mb-4">Audit Log Details</h3>
            
            <div className="space-y-3">
              <DetailRow label="Log ID" value={selectedLog.id} />
              <DetailRow label="Timestamp" value={new Date(selectedLog.timestamp).toLocaleString()} />
              <DetailRow label="Actor ID" value={selectedLog.actorId} />
              <DetailRow label="Action Type" value={selectedLog.actionType} />
              <DetailRow label="Resource Type" value={selectedLog.resourceType} />
              <DetailRow label="Resource ID" value={selectedLog.resourceId} />
              <DetailRow label="Reason" value={selectedLog.reason} />
              
              {selectedLog.previousState && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Previous State</p>
                  <pre className="bg-gray-700 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.previousState, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.newState && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">New State</p>
                  <pre className="bg-gray-700 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.newState, null, 2)}
                  </pre>
                </div>
              )}
              
              <DetailRow label="Checksum" value={selectedLog.checksum || 'N/A'} mono />
              <DetailRow label="IP Address" value={selectedLog.ipAddress || 'N/A'} />
              <DetailRow label="User Agent" value={selectedLog.userAgent || 'N/A'} />
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="mt-6 w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Detail Row Component
const DetailRow: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div>
    <p className="text-sm font-medium text-gray-300 mb-1">{label}</p>
    <p className={`text-sm text-gray-400 ${mono ? 'font-mono' : ''} break-all`}>
      {value}
    </p>
  </div>
);

export default AuditLogPanel;