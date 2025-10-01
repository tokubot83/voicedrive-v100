/**
 * 健康ステーション
 * 医療職員管理システムから受信した健康データを表示
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MobileFooter } from '../components/layout/MobileFooter';
import {
  Heart,
  Activity,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface HealthNotification {
  id: string;
  type: string;
  staffId: string;
  timestamp: string;
  overallScore?: number;
  overallLevel?: 'low' | 'medium' | 'high' | 'very-high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priorityActions?: string[];
  nextCheckup?: string;
}

interface HealthStats {
  total: number;
  processed: number;
  pending: number;
  urgentCount: number;
  highCount: number;
}

const HealthStation: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'reports'>('dashboard');
  const [notifications, setNotifications] = useState<HealthNotification[]>([]);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);

  // デモモード対応
  let demoUser = null;
  try {
    const demoMode = useDemoMode();
    demoUser = demoMode?.currentUser;
  } catch (error) {
    console.log('Demo mode not available');
  }

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);

      // 統計情報を取得
      const statsResponse = await fetch('http://localhost:4000/api/health/notifications/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      // 通知一覧を取得（未処理のみ、上限10件）
      const notificationsResponse = await fetch('http://localhost:4000/api/health/notifications?limit=10');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        if (notificationsData.success) {
          // ファイルから実際のデータを読み込み
          const notificationDetails = await Promise.all(
            notificationsData.notifications.slice(0, 10).map(async (notif: any) => {
              try {
                const detailResponse = await fetch(`http://localhost:4000/api/health/notifications/${notif.filename}`);
                if (detailResponse.ok) {
                  const detailData = await detailResponse.json();
                  if (detailData.success) {
                    return {
                      id: notif.filename,
                      ...detailData.notification
                    };
                  }
                }
              } catch (error) {
                console.error('通知詳細の取得エラー:', error);
              }
              return null;
            })
          );

          setNotifications(notificationDetails.filter(n => n !== null) as HealthNotification[]);
        }
      }
    } catch (error) {
      console.error('健康データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return '緊急';
      case 'high': return '重要';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '不明';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Bell className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getRiskLevelLabel = (level?: string) => {
    switch (level) {
      case 'very-high': return '要緊急対応';
      case 'high': return '要注意';
      case 'medium': return '経過観察';
      case 'low': return '良好';
      default: return '不明';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>健康データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
        {/* 固定ヘッダーコンテナ */}
        <div className="sticky top-0 z-30">
          {/* ヘッダー */}
          <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3 text-3xl">❤️</span>
                  健康ステーション
                </h1>
                <p className="text-gray-400 text-sm">あなたの健康データと推奨事項を確認できます</p>
              </div>
            </div>
          </header>

          {/* タブナビゲーション */}
          <div className="bg-slate-900 border-b border-gray-700">
            <div className="px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>ダッシュボード</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'notifications'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>健康通知</span>
                    {stats && stats.pending > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {stats.pending}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reports'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>レポート</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">

        {/* ダッシュボード */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">総通知数</span>
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">未処理</span>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400">{stats?.pending || 0}</div>
              </div>

              <div className="bg-red-500/10 backdrop-blur-xl rounded-lg p-6 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 text-sm">緊急対応</span>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-3xl font-bold text-red-400">{stats?.urgentCount || 0}</div>
              </div>

              <div className="bg-orange-500/10 backdrop-blur-xl rounded-lg p-6 border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 text-sm">要注意</span>
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-orange-400">{stats?.highCount || 0}</div>
              </div>
            </div>

            {/* 最新通知（上位3件） */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-400" />
                  最新の健康通知
                </h2>
              </div>
              <div className="divide-y divide-slate-700">
                {notifications.slice(0, 3).length > 0 ? (
                  notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                            {getPriorityIcon(notification.priority)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                {getPriorityLabel(notification.priority)}
                              </span>
                              {notification.overallScore && (
                                <span className="text-white font-semibold">
                                  スコア: {notification.overallScore}点
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-sm mt-1">
                              {new Date(notification.timestamp).toLocaleString('ja-JP')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {notification.overallLevel && (
                        <div className="mb-3">
                          <span className="text-slate-300">
                            健康状態: <span className="font-semibold">{getRiskLevelLabel(notification.overallLevel)}</span>
                          </span>
                        </div>
                      )}

                      {notification.priorityActions && notification.priorityActions.length > 0 && (
                        <div className="bg-slate-900/50 rounded-lg p-4">
                          <div className="text-sm font-medium text-slate-300 mb-2">推奨アクション:</div>
                          <ul className="space-y-1">
                            {notification.priorityActions.map((action, index) => (
                              <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                                <span className="text-red-400">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {notification.nextCheckup && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>次回検診推奨日: {new Date(notification.nextCheckup).toLocaleDateString('ja-JP')}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>現在、健康通知はありません</p>
                  </div>
                )}
              </div>
              {notifications.length > 3 && (
                <div className="p-4 bg-slate-900/30 border-t border-slate-700">
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="w-full text-center text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    すべての通知を表示 ({notifications.length}件)
                  </button>
                </div>
              )}
            </div>

            {/* 健康管理のヒント */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-lg border border-blue-500/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                健康管理のポイント
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">定期的な運動</div>
                    <div className="text-slate-400 text-sm">週3回、30分以上の有酸素運動を心がけましょう</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">バランスの良い食事</div>
                    <div className="text-slate-400 text-sm">野菜を多く、塩分は控えめに</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">定期検診</div>
                    <div className="text-slate-400 text-sm">年に1回は健康診断を受けましょう</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 通知一覧 */}
        {activeTab === 'notifications' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">すべての健康通知</h2>
            </div>
            <div className="divide-y divide-slate-700">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          {getPriorityIcon(notification.priority)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {getPriorityLabel(notification.priority)}
                            </span>
                            {notification.overallScore && (
                              <span className="text-white font-semibold">
                                スコア: {notification.overallScore}点
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-sm mt-1">
                            {new Date(notification.timestamp).toLocaleString('ja-JP')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {notification.overallLevel && (
                      <div className="mb-3">
                        <span className="text-slate-300">
                          健康状態: <span className="font-semibold">{getRiskLevelLabel(notification.overallLevel)}</span>
                        </span>
                      </div>
                    )}

                    {notification.priorityActions && notification.priorityActions.length > 0 && (
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="text-sm font-medium text-slate-300 mb-2">推奨アクション:</div>
                        <ul className="space-y-1">
                          {notification.priorityActions.map((action, index) => (
                            <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {notification.nextCheckup && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>次回検診推奨日: {new Date(notification.nextCheckup).toLocaleDateString('ja-JP')}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>現在、健康通知はありません</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* レポート */}
        {activeTab === 'reports' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">健康レポート</h2>
            </div>
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>レポート機能は準備中です</p>
              <p className="text-sm mt-2">近日中に健康トレンドや詳細レポートを確認できるようになります</p>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
      <MobileFooter />
    </>
  );
};

export default HealthStation;