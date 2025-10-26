/**
 * システム監視ダッシュボード（Phase 1拡張版）
 * レベル99専用 - システム全体の詳細監視
 *
 * Phase 1: VoiceDrive単独で実装可能な監視項目
 * - リソース監視（既存）
 * - データベース監視
 * - セキュリティ監視
 * - ビジネスKPI監視
 * - API監視
 * - スケジューラー監視
 * - 通知システム監視
 */

import React, { useState, useEffect } from 'react';
import {
  Activity, Cpu, HardDrive, Users, TrendingUp, AlertTriangle, CheckCircle,
  Clock, Database, Shield, BarChart3, Bell, Calendar, Zap, Server, Link
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';
import { MonitoringService } from '../../services/MonitoringService';
import type {
  DatabaseMetrics,
  SecurityMetrics,
  BusinessMetrics,
  NotificationMetrics,
  SchedulerMetrics,
  APIMetrics,
  IntegrationMetrics
} from '../../services/MonitoringService';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  activeUsers: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  errorRate: number;
  dbConnections: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  lastCheck: Date;
}

export const SystemMonitorPageEnhanced: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 既存のリソースメトリクス
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    activeUsers: 0,
    requestsPerMinute: 0,
    avgResponseTime: 0,
    errorRate: 0,
    dbConnections: 0
  });

  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    issues: [],
    lastCheck: new Date()
  });

  // Phase 1拡張メトリクス
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [notificationMetrics, setNotificationMetrics] = useState<NotificationMetrics | null>(null);
  const [schedulerMetrics, setSchedulerMetrics] = useState<SchedulerMetrics | null>(null);
  const [apiMetrics, setAPIMetrics] = useState<APIMetrics | null>(null);

  // Phase 2拡張メトリクス
  const [integrationMetrics, setIntegrationMetrics] = useState<IntegrationMetrics | null>(null);

  // 権限チェック（レベル99のみアクセス可能）
  useEffect(() => {
    if (!user || user.permissionLevel !== 99) {
      navigate('/');
      return;
    }

    loadAllMetrics();

    // 自動更新
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadAllMetrics();
      }
    }, 5000); // 5秒ごと

    return () => clearInterval(interval);
  }, [user, navigate, autoRefresh]);

  const loadAllMetrics = async () => {
    await loadResourceMetrics();
    await loadEnhancedMetrics();
  };

  const loadResourceMetrics = async () => {
    // リソースメトリクス（既存のデモデータ - 後でNode.js APIに置き換え）
    const newMetrics: SystemMetrics = {
      cpu: Math.random() * 40 + 30,
      memory: Math.random() * 30 + 50,
      disk: Math.random() * 10 + 60,
      activeUsers: Math.floor(Math.random() * 20 + 80),
      requestsPerMinute: Math.floor(Math.random() * 500 + 1000),
      avgResponseTime: Math.random() * 100 + 50,
      errorRate: Math.random() * 0.5,
      dbConnections: Math.floor(Math.random() * 10 + 40)
    };

    setMetrics(newMetrics);

    // 健全性チェック
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (newMetrics.cpu > 80) {
      issues.push('CPU使用率が高い');
      status = 'warning';
    }
    if (newMetrics.memory > 85) {
      issues.push('メモリ使用率が高い');
      status = 'critical';
    }
    if (newMetrics.errorRate > 1) {
      issues.push('エラー率が高い');
      status = 'warning';
    }
    if (newMetrics.avgResponseTime > 200) {
      issues.push('レスポンス時間が遅い');
      status = 'warning';
    }

    setHealth({
      status,
      issues,
      lastCheck: new Date()
    });
  };

  const loadEnhancedMetrics = async () => {
    try {
      const [
        database,
        security,
        business,
        notifications,
        schedulers,
        api,
        integration
      ] = await Promise.all([
        MonitoringService.getDatabaseMetrics(),
        MonitoringService.getSecurityMetrics(),
        MonitoringService.getBusinessMetrics(),
        MonitoringService.getNotificationMetrics(),
        MonitoringService.getSchedulerMetrics(),
        MonitoringService.getAPIMetrics(),
        MonitoringService.getIntegrationMetrics()
      ]);

      setDatabaseMetrics(database);
      setSecurityMetrics(security);
      setBusinessMetrics(business);
      setNotificationMetrics(notifications);
      setSchedulerMetrics(schedulers);
      setAPIMetrics(api);
      setIntegrationMetrics(integration);
    } catch (error) {
      console.error('監視メトリクスの取得に失敗:', error);
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'critical') => {
    const config = {
      healthy: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle, label: '正常' },
      warning: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: AlertTriangle, label: '警告' },
      critical: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: AlertTriangle, label: '重大' }
    };

    const { color, icon: Icon, label } = config[status];
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="font-semibold">{label}</span>
      </div>
    );
  };

  const getMetricColor = (value: number, threshold: { warning: number; critical: number }) => {
    if (value >= threshold.critical) return 'text-red-400';
    if (value >= threshold.warning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressBarColor = (value: number, threshold: { warning: number; critical: number }) => {
    if (value >= threshold.critical) return 'bg-red-500';
    if (value >= threshold.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const tabs = [
    { id: 'overview', label: '概要', icon: Activity },
    { id: 'database', label: 'データベース', icon: Database },
    { id: 'security', label: 'セキュリティ', icon: Shield },
    { id: 'business', label: 'ビジネスKPI', icon: BarChart3 },
    { id: 'api', label: 'API', icon: Server },
    { id: 'scheduler', label: 'スケジューラー', icon: Calendar },
    { id: 'notifications', label: '通知', icon: Bell },
    { id: 'integration', label: '医療システム連携', icon: Link }
  ];

  return (
    <div className="min-h-screen bg-gray-900 w-full pb-32">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-green-500/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                システム監視ダッシュボード（Phase 1）
              </h1>
              <p className="text-gray-300">
                Level 99専用 - VoiceDrive全体の詳細監視（Phase 1: 50項目 | Phase 2: +20項目）
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">自動更新（5秒）</span>
              </label>
              <div className="text-sm text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {health.lastCheck.toLocaleTimeString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* システム健全性 */}
        <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              システム健全性
            </h2>
            {getStatusBadge(health.status)}
          </div>

          {health.issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">検出された問題:</p>
              {health.issues.map((issue, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-yellow-200 bg-yellow-500/10 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  {issue}
                </div>
              ))}
            </div>
          )}

          {health.issues.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-200 bg-green-500/10 p-2 rounded">
              <CheckCircle className="w-4 h-4" />
              すべてのシステムが正常に動作しています
            </div>
          )}
        </Card>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 rounded-xl p-1 backdrop-blur border border-gray-700/50 mb-6">
          <nav className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div>
          {/* 概要タブ（既存のリソース監視） */}
          {activeTab === 'overview' && (
            <div>
              {/* リソース使用状況 */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">CPU使用率</h3>
                    </div>
                    <span className={`text-2xl font-bold ${getMetricColor(metrics.cpu, { warning: 70, critical: 85 })}`}>
                      {metrics.cpu.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressBarColor(metrics.cpu, { warning: 70, critical: 85 })}`}
                      style={{ width: `${metrics.cpu}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">警告: 70% | 重大: 85%</p>
                </Card>

                <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white">メモリ使用率</h3>
                    </div>
                    <span className={`text-2xl font-bold ${getMetricColor(metrics.memory, { warning: 75, critical: 85 })}`}>
                      {metrics.memory.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressBarColor(metrics.memory, { warning: 75, critical: 85 })}`}
                      style={{ width: `${metrics.memory}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">警告: 75% | 重大: 85%</p>
                </Card>

                <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">ディスク使用率</h3>
                    </div>
                    <span className={`text-2xl font-bold ${getMetricColor(metrics.disk, { warning: 80, critical: 90 })}`}>
                      {metrics.disk.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressBarColor(metrics.disk, { warning: 80, critical: 90 })}`}
                      style={{ width: `${metrics.disk}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">警告: 80% | 重大: 90%</p>
                </Card>
              </div>

              {/* パフォーマンス指標 */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">アクティブユーザー</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{metrics.activeUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">現在オンライン</p>
                </Card>

                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">リクエスト/分</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{metrics.requestsPerMinute}</p>
                  <p className="text-xs text-gray-500 mt-1">過去1分間の平均</p>
                </Card>

                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-gray-400">応答時間</span>
                  </div>
                  <p className={`text-2xl font-bold ${getMetricColor(metrics.avgResponseTime, { warning: 150, critical: 200 })}`}>
                    {metrics.avgResponseTime.toFixed(0)}ms
                  </p>
                  <p className="text-xs text-gray-500 mt-1">平均レスポンス</p>
                </Card>

                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-gray-400">エラー率</span>
                  </div>
                  <p className={`text-2xl font-bold ${getMetricColor(metrics.errorRate, { warning: 0.5, critical: 1 })}`}>
                    {metrics.errorRate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">過去1時間</p>
                </Card>
              </div>
            </div>
          )}

          {/* データベースタブ */}
          {activeTab === 'database' && databaseMetrics && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Database className="w-6 h-6" />
                データベース監視（10項目）
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {Object.entries(databaseMetrics.tables).map(([tableName, data]) => (
                  <Card key={tableName} className="bg-gray-800/50 p-4 border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-2">{tableName}</p>
                    <p className="text-2xl font-bold text-white">{data.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">レコード数</p>
                  </Card>
                ))}
              </div>

              <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4">データベース統計</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総レコード数</p>
                    <p className="text-3xl font-bold text-white">{databaseMetrics.totalRecords.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">遅いクエリ</p>
                    <p className="text-3xl font-bold text-white">{databaseMetrics.slowQueries}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">アクティブ接続</p>
                    <p className="text-3xl font-bold text-white">{databaseMetrics.activeConnections}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">接続上限</p>
                    <p className="text-3xl font-bold text-gray-500">100</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* セキュリティタブ */}
          {activeTab === 'security' && securityMetrics && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                セキュリティ監視（12項目）
              </h2>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">急速アクション</p>
                  <p className={`text-2xl font-bold ${securityMetrics.suspiciousActivities.rapidActions > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {securityMetrics.suspiciousActivities.rapidActions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5分間に10回以上</p>
                </Card>

                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">夜間アクティビティ</p>
                  <p className={`text-2xl font-bold ${securityMetrics.suspiciousActivities.nightActivity > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {securityMetrics.suspiciousActivities.nightActivity}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">22時-6時</p>
                </Card>

                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">繰り返し失敗</p>
                  <p className={`text-2xl font-bold ${securityMetrics.suspiciousActivities.repeatedFailures > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {securityMetrics.suspiciousActivities.repeatedFailures}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">10分間に5回以上</p>
                </Card>

                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">権限昇格操作</p>
                  <p className={`text-2xl font-bold ${securityMetrics.suspiciousActivities.permissionEscalation > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {securityMetrics.suspiciousActivities.permissionEscalation}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">最重要監視</p>
                </Card>
              </div>

              <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">監査ログ統計</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">24時間のログ</p>
                    <p className="text-3xl font-bold text-white">{securityMetrics.auditLog.total24h.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">高重要度</p>
                    <p className="text-3xl font-bold text-yellow-400">{securityMetrics.auditLog.highSeverity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">重大アクション</p>
                    <p className="text-3xl font-bold text-red-400">{securityMetrics.auditLog.criticalActions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">整合性チェック</p>
                    <p className={`text-3xl font-bold ${securityMetrics.auditLog.integrityChecksPassed ? 'text-green-400' : 'text-red-400'}`}>
                      {securityMetrics.auditLog.integrityChecksPassed ? '✓' : '✗'}
                    </p>
                  </div>
                </div>
              </Card>

              {securityMetrics.recentCriticalActions.length > 0 && (
                <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">最近の重大アクション</h3>
                  <div className="space-y-2">
                    {securityMetrics.recentCriticalActions.map((action, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{action.action}</p>
                          <p className="text-xs text-gray-400">ユーザー: {action.userId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{new Date(action.timestamp).toLocaleString('ja-JP')}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            action.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {action.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ビジネスKPIタブ - 続きは次のメッセージで */}
          {activeTab === 'business' && businessMetrics && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                ビジネスKPI監視（10項目）
              </h2>

              {/* 投票KPI */}
              <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">投票システム</h3>
                <div className="grid md:grid-cols-5 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総投票数</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.voting.totalVotes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">完了率</p>
                    <p className={`text-3xl font-bold ${businessMetrics.voting.completionRate >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {businessMetrics.voting.completionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">目標: 60%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">参加率</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.voting.participationRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">エスカレーション</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.voting.escalationCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">期限延長</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.voting.deadlineExtensions}</p>
                  </div>
                </div>
              </Card>

              {/* 提案KPI */}
              <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">提案システム</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総提案数</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.proposals.totalProposals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">承認率</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.proposals.approvalRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">50点到達率</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">平均レビュー時間</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.proposals.avgReviewTime.toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">保留中</p>
                    <p className="text-3xl font-bold text-yellow-400">{businessMetrics.proposals.pendingReviews}</p>
                  </div>
                </div>
              </Card>

              {/* 面談KPI */}
              <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4">面談システム</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総予約数</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.interviews.totalBookings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">確定率</p>
                    <p className={`text-3xl font-bold ${businessMetrics.interviews.confirmationRate >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {businessMetrics.interviews.confirmationRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">目標: 90%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">キャンセル率</p>
                    <p className="text-3xl font-bold text-white">{businessMetrics.interviews.cancellationRate.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* APIタブ */}
          {activeTab === 'api' && apiMetrics && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Server className="w-6 h-6" />
                API監視（8項目）
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">総リクエスト数（24時間）</p>
                  <p className="text-3xl font-bold text-white">{apiMetrics.totalRequests24h.toLocaleString()}</p>
                </Card>
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">全体エラー率</p>
                  <p className={`text-3xl font-bold ${apiMetrics.overallErrorRate < 1 ? 'text-green-400' : apiMetrics.overallErrorRate < 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {apiMetrics.overallErrorRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">目標: &lt;1%</p>
                </Card>
              </div>

              <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4">エンドポイント別統計</h3>
                <div className="space-y-3">
                  {Object.entries(apiMetrics.endpoints).map(([endpoint, stats]) => (
                    <div key={endpoint} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-mono text-sm">{endpoint}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          stats.errorRate < 1 ? 'bg-green-500/20 text-green-400' :
                          stats.errorRate < 2 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          エラー率: {stats.errorRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">リクエスト数</p>
                          <p className="text-white font-semibold">{stats.requests24h.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">平均応答時間</p>
                          <p className={`font-semibold ${
                            stats.avgResponseTime < 200 ? 'text-green-400' :
                            stats.avgResponseTime < 500 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {stats.avgResponseTime.toFixed(0)}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">ステータス</p>
                          <p className="text-white font-semibold">
                            {stats.errorRate < 1 ? '✓ 正常' : stats.errorRate < 2 ? '⚠ 警告' : '✗ 要対応'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* スケジューラータブ */}
          {activeTab === 'scheduler' && schedulerMetrics && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                スケジューラー監視（6項目）
              </h2>

              <div className="space-y-4">
                {Object.entries(schedulerMetrics.schedulers).map(([name, scheduler]) => (
                  <Card key={name} className="bg-gray-800/50 p-6 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{name}</h3>
                      <span className={`px-3 py-1 rounded text-sm ${
                        scheduler.status === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                        scheduler.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {scheduler.status === 'success' ? '✓ 成功' :
                         scheduler.status === 'failed' ? '✗ 失敗' :
                         '⏳ 保留中'}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">最終実行</p>
                        <p className="text-white text-sm">
                          {new Date(scheduler.lastRun).toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">処理件数</p>
                        <p className="text-white text-lg font-semibold">{scheduler.processedCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">実行時間</p>
                        <p className="text-white text-lg font-semibold">{scheduler.duration.toFixed(1)}秒</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">次回実行</p>
                        <p className="text-white text-sm">
                          {scheduler.nextRun ?
                            new Date(scheduler.nextRun).toLocaleString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) :
                            '未定'
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mt-6">
                <h3 className="text-lg font-bold text-white mb-4">スケジューラー概要</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総スケジューラー数</p>
                    <p className="text-3xl font-bold text-white">{Object.keys(schedulerMetrics.schedulers).length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">成功率</p>
                    <p className="text-3xl font-bold text-green-400">
                      {(Object.values(schedulerMetrics.schedulers).filter(s => s.status === 'success').length /
                        Object.keys(schedulerMetrics.schedulers).length * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総処理件数</p>
                    <p className="text-3xl font-bold text-white">
                      {Object.values(schedulerMetrics.schedulers).reduce((sum, s) => sum + s.processedCount, 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Phase 2: 医療システム連携監視タブ */}
          {activeTab === 'integration' && integrationMetrics && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Link className="w-6 h-6" />
                医療システム連携監視（Phase 2 - 20項目）
              </h2>

              {/* 接続性ステータス */}
              <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">連携健全性</h3>
                  {getStatusBadge(integrationMetrics.connectivity.webhookEndpointStatus)}
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">最終Webhook受信</p>
                    <p className="text-white text-lg">
                      {integrationMetrics.connectivity.lastWebhookReceived
                        ? new Date(integrationMetrics.connectivity.lastWebhookReceived).toLocaleString('ja-JP')
                        : 'データなし'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">経過時間</p>
                    <p className="text-white text-lg">
                      {integrationMetrics.connectivity.timeSinceLastWebhook !== null
                        ? `${Math.floor(integrationMetrics.connectivity.timeSinceLastWebhook)} 分`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">エラー率トレンド</p>
                    <p className={`text-lg font-semibold ${
                      integrationMetrics.connectivity.errorRateTrend === 'improving' ? 'text-green-400' :
                      integrationMetrics.connectivity.errorRateTrend === 'degrading' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {integrationMetrics.connectivity.errorRateTrend === 'improving' ? '↓ 改善中' :
                       integrationMetrics.connectivity.errorRateTrend === 'degrading' ? '↑ 悪化中' :
                       '→ 安定'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Webhook受信統計 */}
              <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Webhook受信統計（24時間）</h3>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総受信数</p>
                    <p className="text-3xl font-bold text-white">{integrationMetrics.webhook.received24h}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">署名検証失敗</p>
                    <p className={`text-3xl font-bold ${integrationMetrics.webhook.signatureFailures > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {integrationMetrics.webhook.signatureFailures}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">処理エラー</p>
                    <p className={`text-3xl font-bold ${integrationMetrics.webhook.processingErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {integrationMetrics.webhook.processingErrors}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">重複イベント</p>
                    <p className="text-3xl font-bold text-yellow-400">{integrationMetrics.webhook.duplicateEvents}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <h4 className="text-white font-semibold">イベントタイプ別</h4>
                  {Object.entries(integrationMetrics.webhook.byEventType).map(([eventType, stats]) => (
                    <div key={eventType} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-mono text-sm">{eventType}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          stats.successRate >= 95 ? 'bg-green-500/20 text-green-400' :
                          stats.successRate >= 80 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          成功率: {stats.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">受信数</p>
                          <p className="text-white font-semibold">{stats.count}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">平均処理時間</p>
                          <p className="text-white font-semibold">{stats.avgProcessingTime.toFixed(0)}ms</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* データ同期統計 */}
              <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">データ同期統計</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">総職員数</p>
                    <p className="text-3xl font-bold text-white">{integrationMetrics.dataSync.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">写真保有数</p>
                    <p className="text-3xl font-bold text-white">{integrationMetrics.dataSync.usersWithPhoto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">写真同期率</p>
                    <p className={`text-3xl font-bold ${
                      integrationMetrics.dataSync.photoSyncRate >= 80 ? 'text-green-400' :
                      integrationMetrics.dataSync.photoSyncRate >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {integrationMetrics.dataSync.photoSyncRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">24h同期数</p>
                    <p className="text-3xl font-bold text-white">{integrationMetrics.dataSync.syncedLast24h}</p>
                  </div>
                </div>
              </Card>

              {/* 最近のエラー */}
              {integrationMetrics.connectivity.recentErrors.length > 0 && (
                <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">最近のエラー（最大5件）</h3>
                  <div className="space-y-2">
                    {integrationMetrics.connectivity.recentErrors.map((error, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{error.eventType}</p>
                          <p className="text-sm text-gray-400">{error.errorMessage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{new Date(error.timestamp).toLocaleString('ja-JP')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* 通知タブ */}
          {activeTab === 'notifications' && notificationMetrics && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                通知システム監視（4項目）
              </h2>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">送信数（24時間）</p>
                  <p className="text-3xl font-bold text-white">{notificationMetrics.sent24h.toLocaleString()}</p>
                </Card>
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">配信成功率</p>
                  <p className={`text-3xl font-bold ${notificationMetrics.deliveryRate >= 95 ? 'text-green-400' : notificationMetrics.deliveryRate >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {notificationMetrics.deliveryRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">目標: &gt;95%</p>
                </Card>
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">開封率</p>
                  <p className="text-3xl font-bold text-white">{notificationMetrics.openRate.toFixed(1)}%</p>
                </Card>
                <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">配信失敗</p>
                  <p className="text-3xl font-bold text-red-400">{notificationMetrics.failedDeliveries}</p>
                </Card>
              </div>

              <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4">カテゴリ別統計</h3>
                <div className="space-y-3">
                  {Object.entries(notificationMetrics.byCategory).map(([category, stats]) => (
                    <div key={category} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold">{category}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          stats.openRate >= 50 ? 'bg-green-500/20 text-green-400' :
                          stats.openRate >= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          開封率: {stats.openRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">送信数</p>
                          <p className="text-white font-semibold">{stats.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">開封数</p>
                          <p className="text-white font-semibold">{stats.opened.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">未開封</p>
                          <p className="text-gray-400 font-semibold">{(stats.sent - stats.opened).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${stats.openRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};
