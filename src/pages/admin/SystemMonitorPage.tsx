/**
 * システム監視ダッシュボード（レベル99専用）
 * システム全体のパフォーマンスと健全性を監視
 */

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Database, Globe, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';

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

export const SystemMonitorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 権限チェック（レベル99のみアクセス可能）
  useEffect(() => {
    if (!user || user.permissionLevel !== 99) {
      navigate('/');
      return;
    }

    loadMetrics();

    // 自動更新
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadMetrics();
      }
    }, 5000); // 5秒ごと

    return () => clearInterval(interval);
  }, [user, navigate, autoRefresh]);

  const loadMetrics = async () => {
    // TODO: 実際の実装では、APIから取得
    // const response = await fetch('/api/admin/system/metrics');
    // const data = await response.json();

    // デモデータ（ランダムな値で変動をシミュレート）
    const newMetrics: SystemMetrics = {
      cpu: Math.random() * 40 + 30, // 30-70%
      memory: Math.random() * 30 + 50, // 50-80%
      disk: Math.random() * 10 + 60, // 60-70%
      activeUsers: Math.floor(Math.random() * 20 + 80), // 80-100人
      requestsPerMinute: Math.floor(Math.random() * 500 + 1000), // 1000-1500 req/min
      avgResponseTime: Math.random() * 100 + 50, // 50-150ms
      errorRate: Math.random() * 0.5, // 0-0.5%
      dbConnections: Math.floor(Math.random() * 10 + 40) // 40-50接続
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

  return (
    <div className="min-h-screen bg-gray-900 w-full pb-32">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-green-500/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                システム監視ダッシュボード
              </h1>
              <p className="text-gray-300">
                レベルX専用 - システムパフォーマンスと健全性をリアルタイム監視
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
                <span className="text-sm">自動更新</span>
              </label>
              <div className="text-sm text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                最終更新: {health.lastCheck.toLocaleTimeString('ja-JP')}
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

        {/* リソース使用状況 */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* CPU使用率 */}
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

          {/* メモリ使用率 */}
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

          {/* ディスク使用率 */}
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
        <div className="grid md:grid-cols-4 gap-4 mb-6">
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

        {/* データベース統計 */}
        <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            データベース統計
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">アクティブ接続</p>
              <p className="text-3xl font-bold text-white">{metrics.dbConnections}</p>
              <p className="text-xs text-gray-500 mt-1">最大100接続</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">クエリ/秒</p>
              <p className="text-3xl font-bold text-white">{Math.floor(metrics.requestsPerMinute / 60)}</p>
              <p className="text-xs text-gray-500 mt-1">過去1分間の平均</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">データベースサイズ</p>
              <p className="text-3xl font-bold text-white">2.4 GB</p>
              <p className="text-xs text-gray-500 mt-1">総データ量</p>
            </div>
          </div>
        </Card>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};
