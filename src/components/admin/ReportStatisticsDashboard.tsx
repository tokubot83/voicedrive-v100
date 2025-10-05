// Report Statistics Dashboard
// 通報統計ダッシュボード（管理者用）
// 注意: 開発環境向け暫定実装

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Chart.js登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Statistics {
  totalReports: number;
  reportsByType: Record<string, number>;
  reportsByStatus: Record<string, number>;
  pendingReports: number;
  averageResponseTime: number;
  topReportedPosts: Array<{
    postId: string;
    reportCount: number;
    severity: string;
  }>;
}

interface Alert {
  id: string;
  postId: string;
  severity: string;
  reportCount: number;
  dominantReportType: string;
  message: string;
  acknowledged: boolean;
  createdAt: Date;
}

interface ReportStatisticsDashboardProps {
  currentUserId: string;
  userLevel: number;
}

const ReportStatisticsDashboard: React.FC<ReportStatisticsDashboardProps> = ({
  currentUserId,
  userLevel
}) => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  // 権限チェック（Level 14以上のみアクセス可能）
  const hasAccess = userLevel >= 14;

  const reportTypeLabels: Record<string, { label: string; color: string }> = {
    personal_attack: { label: '個人攻撃', color: '#FF6B6B' },
    defamation: { label: '誹謗中傷', color: '#4ECDC4' },
    harassment: { label: 'ハラスメント', color: '#45B7D1' },
    privacy_violation: { label: 'プライバシー侵害', color: '#96CEB4' },
    inappropriate_content: { label: '不適切なコンテンツ', color: '#FECA57' },
    spam: { label: 'スパム', color: '#A8E6CF' },
    other: { label: 'その他', color: '#C7CEEA' }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: '確認待ち', color: '#FFA500' },
    reviewing: { label: '確認中', color: '#4169E1' },
    actioned: { label: '対応済み', color: '#32CD32' },
    dismissed: { label: '却下', color: '#808080' }
  };

  useEffect(() => {
    if (!hasAccess) return;

    fetchStatistics();
    fetchAlerts();

    // 定期的に更新（1分ごと）
    const interval = setInterval(() => {
      fetchStatistics();
      fetchAlerts();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/reports/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('統計取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/alerts/unacknowledged', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('アラート取得エラー:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          acknowledgedBy: currentUserId
        })
      });

      if (response.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('アラート確認エラー:', error);
    }
  };

  if (!hasAccess) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <span className="text-4xl">🚫</span>
        <h2 className="text-xl font-bold text-red-700 mt-4">アクセス権限がありません</h2>
        <p className="text-red-600 mt-2">この機能はレベル14以上の管理者のみ利用可能です</p>
      </div>
    );
  }

  if (loading || !statistics) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-gray-600 mt-4">統計データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // チャートデータの準備
  const reportTypeChartData = {
    labels: Object.keys(statistics.reportsByType).map(
      type => reportTypeLabels[type]?.label || type
    ),
    datasets: [{
      label: '通報件数',
      data: Object.values(statistics.reportsByType),
      backgroundColor: Object.keys(statistics.reportsByType).map(
        type => reportTypeLabels[type]?.color || '#999'
      ),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const statusChartData = {
    labels: Object.keys(statistics.reportsByStatus).map(
      status => statusLabels[status]?.label || status
    ),
    datasets: [{
      label: '件数',
      data: Object.values(statistics.reportsByStatus),
      backgroundColor: Object.keys(statistics.reportsByStatus).map(
        status => statusLabels[status]?.color || '#999'
      )
    }]
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📊</span> 通報統計ダッシュボード
        </h1>
        <p className="text-gray-600 mt-2">
          {format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })} 現在
        </p>
      </div>

      {/* アクティブアラート */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
            <span>🚨</span> アクティブアラート（{alerts.length}件）
          </h2>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white border border-red-300 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    投稿ID: {alert.postId.slice(0, 8)}... |
                    {format(new Date(alert.createdAt), 'MM/dd HH:mm', { locale: ja })}
                  </p>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  確認
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総通報数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {statistics.totalReports}
              </p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">確認待ち</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {statistics.pendingReports}
              </p>
            </div>
            <span className="text-3xl">⏰</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均対応時間</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {statistics.averageResponseTime.toFixed(1)}h
              </p>
            </div>
            <span className="text-3xl">⏱️</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">対応率</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {statistics.totalReports > 0
                  ? Math.round(((statistics.reportsByStatus.actioned || 0) / statistics.totalReports) * 100)
                  : 0}%
              </p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 通報理由別グラフ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">通報理由別統計</h2>
          {Object.keys(statistics.reportsByType).length > 0 ? (
            <Bar data={reportTypeChartData} options={chartOptions} />
          ) : (
            <p className="text-gray-500 text-center py-8">データがありません</p>
          )}
        </div>

        {/* ステータス別グラフ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">ステータス別統計</h2>
          {Object.keys(statistics.reportsByStatus).length > 0 ? (
            <Doughnut data={statusChartData} options={doughnutOptions} />
          ) : (
            <p className="text-gray-500 text-center py-8">データがありません</p>
          )}
        </div>
      </div>

      {/* 最も通報が多い投稿 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          最も通報が多い投稿 TOP5
        </h2>
        {statistics.topReportedPosts.length > 0 ? (
          <div className="space-y-3">
            {statistics.topReportedPosts.map((post, index) => (
              <div
                key={post.postId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      投稿ID: {post.postId.slice(0, 12)}...
                    </p>
                    <p className="text-sm text-gray-500">
                      通報数: {post.reportCount}件
                    </p>
                  </div>
                </div>
                <span className={`
                  px-3 py-1 text-sm font-medium rounded-full
                  ${post.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    post.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    post.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'}
                `}>
                  {post.severity === 'critical' ? '🚨 重大' :
                   post.severity === 'high' ? '⚠️ 緊急' :
                   post.severity === 'medium' ? '⚡ 警告' :
                   '📌 注意'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">通報された投稿はありません</p>
        )}
      </div>

      {/* 更新ボタン */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setLoading(true);
            fetchStatistics();
            fetchAlerts();
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">🔄</span>
          統計を更新
        </button>
      </div>
    </div>
  );
};

export default ReportStatisticsDashboard;