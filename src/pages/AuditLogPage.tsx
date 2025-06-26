import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search, Download, AlertCircle, Shield, User, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { AuditService, AuditLog } from '../services/AuditService';

export const AuditLogPage: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // 監査ログの取得
  useEffect(() => {
    const fetchLogs = async () => {
      // 実際の実装では、APIから取得
      const recentLogs = AuditService.getRecentLogs(100);
      setLogs(recentLogs);
      setFilteredLogs(recentLogs);
    };
    
    fetchLogs();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    let filtered = [...logs];

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 重要度フィルター
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }

    // アクションタイプフィルター
    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action.startsWith(selectedAction));
    }

    // 日付範囲フィルター
    const now = new Date();
    const filterDate = new Date();
    switch (dateRange) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    if (dateRange !== 'all') {
      filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedSeverity, selectedAction, dateRange]);

  // アクションタイプの取得
  const actionTypes = Array.from(new Set(logs.map(log => log.action.split('_')[0]))).sort();

  const getSeverityBadge = (severity?: 'low' | 'medium' | 'high' | 'critical') => {
    const severityConfig = {
      low: { color: 'bg-blue-500/20 text-blue-400', label: '低' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400', label: '中' },
      high: { color: 'bg-orange-500/20 text-orange-400', label: '高' },
      critical: { color: 'bg-red-500/20 text-red-400', label: '重大' }
    };

    const config = severityConfig[severity || 'low'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return <User className="w-4 h-4" />;
    if (action.includes('AUTHORITY')) return <Shield className="w-4 h-4" />;
    if (action.includes('SYSTEM')) return <Activity className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExport = () => {
    // CSV形式でエクスポート
    const csv = [
      ['タイムスタンプ', 'ユーザーID', 'アクション', '対象ID', '重要度', '詳細'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.userId,
        log.action,
        log.targetId || '',
        log.severity || 'low',
        log.details ? JSON.stringify(log.details) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 統計情報の計算
  const stats = {
    total: filteredLogs.length,
    critical: filteredLogs.filter(log => log.severity === 'critical').length,
    high: filteredLogs.filter(log => log.severity === 'high').length,
    users: new Set(filteredLogs.map(log => log.userId)).size
  };

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            監査ログ
          </h1>
          <p className="text-gray-300">
            システムアクティビティの監視と分析
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">総ログ数</span>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">重大イベント</span>
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.critical}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">高重要度</span>
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.high}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">アクティブユーザー</span>
              <User className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.users}</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ユーザーID、アクション、詳細で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべての重要度</option>
                <option value="critical">重大</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
              
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのアクション</option>
                {actionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-3 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">今日</option>
                <option value="week">過去7日間</option>
                <option value="month">過去30日間</option>
                <option value="all">すべて</option>
              </select>
              
              <button
                onClick={handleExport}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                エクスポート
              </button>
            </div>
          </div>
        </div>

        {/* ログテーブル */}
        <div className="bg-gray-800/50 rounded-xl backdrop-blur border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    タイムスタンプ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    アクション
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    対象
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    重要度
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    詳細
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      ログが見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-white">{log.userId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm text-white">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {log.targetId || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {log.details ? (
                          <details className="cursor-pointer">
                            <summary className="text-blue-400 hover:text-blue-300">
                              詳細を表示
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-700/50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};