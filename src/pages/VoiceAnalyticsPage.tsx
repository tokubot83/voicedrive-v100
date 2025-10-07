/**
 * ボイス分析ページ
 * Level 14-17（人事部門）専用
 *
 * 職員カルテシステムから受信した集団分析データを表示
 */

import React, { useState, useEffect } from 'react';
import { voiceAnalyticsService } from '../services/VoiceAnalyticsService';
import {
  VoiceAnalyticsSummary,
  GroupAnalyticsData,
  getSentimentInfo,
  getEngagementLevel,
  getAlertSeverityInfo,
  getTrendInfo,
  getParticipationRateInfo,
} from '../types/voiceAnalytics';
import { BarChart3, TrendingUp, Users, MessageSquare, AlertTriangle, Shield } from 'lucide-react';

const VoiceAnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<VoiceAnalyticsSummary | null>(null);
  const [analyticsData, setAnalyticsData] = useState<GroupAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const summaryData = voiceAnalyticsService.getSummary();
    const fullData = voiceAnalyticsService.getAnalyticsData();
    setSummary(summaryData);
    setAnalyticsData(fullData);
    setLoading(false);
  };

  if (loading || !summary || !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  const trendInfo = getTrendInfo(summary.trendDirection);
  const participationInfo = getParticipationRateInfo(summary.participationRate);
  const sentimentInfo = getSentimentInfo(summary.positiveRate, 'positive');
  const engagementInfo = getEngagementLevel(summary.engagementScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">📊 ボイス分析</h1>
              <p className="text-slate-400 mt-1">
                組織の声を可視化 - 集団分析ダッシュボード
              </p>
            </div>
          </div>

          {/* 分析期間 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 inline-flex items-center gap-3">
            <span className="text-slate-400 text-sm">分析期間:</span>
            <span className="text-white font-semibold">
              {analyticsData.period.startDate} 〜 {analyticsData.period.endDate}
            </span>
            <span className="text-slate-500 text-sm">
              （{analyticsData.analysisDate} 更新）
            </span>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 総投稿数 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <span className={`text-sm ${trendInfo.color}`}>
                {trendInfo.icon} {trendInfo.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{summary.totalPosts}</div>
            <div className="text-sm text-slate-400">総投稿数</div>
            <div className="mt-2 text-sm text-slate-500">
              前月比: <span className={summary.monthOverMonthChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {summary.monthOverMonthChange >= 0 ? '+' : ''}{summary.monthOverMonthChange.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 参加率 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-600/20 rounded-lg">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <span className={`text-sm ${participationInfo.color} px-2 py-1 rounded`}>
                {participationInfo.icon} {participationInfo.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {summary.participationRate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">投稿参加率</div>
            <div className="mt-2 text-sm text-slate-500">
              {analyticsData.postingTrends.totalUsers} / {analyticsData.postingTrends.totalEligibleUsers} 名
            </div>
          </div>

          {/* ポジティブ率 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className={`text-sm ${sentimentInfo.color} px-2 py-1 rounded`}>
                {sentimentInfo.icon} {sentimentInfo.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {summary.positiveRate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">ポジティブ率</div>
            <div className="mt-2 text-sm text-slate-500">
              ネガティブ: {summary.negativeRate.toFixed(1)}%
            </div>
          </div>

          {/* エンゲージメント */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <span className={`text-sm ${engagementInfo.color} px-2 py-1 rounded`}>
                {engagementInfo.icon} {engagementInfo.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{summary.engagementScore}</div>
            <div className="text-sm text-slate-400">エンゲージメントスコア</div>
            <div className="mt-2 text-sm text-slate-500">
              コメント: {summary.totalComments} / 投票: {summary.totalVotes}
            </div>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 月次推移 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              月次推移
            </h3>
            <div className="space-y-3">
              {analyticsData.postingTrends.monthlyTrend.map((trend, index) => {
                const maxCount = Math.max(...analyticsData.postingTrends.monthlyTrend.map(t => t.count));
                const width = (trend.count / maxCount) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{trend.month}</span>
                      <span className="text-sm font-semibold text-white">{trend.count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* カテゴリ別投稿数 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              カテゴリ別投稿数
            </h3>
            <div className="space-y-3">
              {analyticsData.postingTrends.byCategory.map((cat, index) => {
                const colors = ['from-blue-500 to-blue-400', 'from-purple-500 to-purple-400', 'from-pink-500 to-pink-400', 'from-amber-500 to-amber-400'];
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{cat.category}</span>
                      <span className="text-sm font-semibold text-white">
                        {cat.count} <span className="text-slate-500">({cat.percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${colors[index % colors.length]} h-2 rounded-full transition-all`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 部門別投稿数 */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              部門別投稿数
            </h3>
            <div className="space-y-3">
              {analyticsData.postingTrends.byDepartment.map((dept, index) => {
                const colors = ['from-emerald-500 to-emerald-400', 'from-cyan-500 to-cyan-400', 'from-indigo-500 to-indigo-400', 'from-amber-500 to-amber-400', 'from-purple-500 to-purple-400'];
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{dept.department}</span>
                      <span className="text-sm font-semibold text-white">
                        {dept.count} <span className="text-slate-500">({dept.percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${colors[index % colors.length]} h-2 rounded-full transition-all`}
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 感情分析 */}
          {analyticsData.sentimentAnalysis && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">感情分析</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-emerald-400">😊 ポジティブ</span>
                    <span className="text-sm font-semibold text-white">{analyticsData.sentimentAnalysis.positive}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                      style={{ width: `${analyticsData.sentimentAnalysis.positiveRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">😐 中立</span>
                    <span className="text-sm font-semibold text-white">{analyticsData.sentimentAnalysis.neutral}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-gray-500 to-gray-400 h-2 rounded-full"
                      style={{ width: `${summary.neutralRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-red-400">😟 ネガティブ</span>
                    <span className="text-sm font-semibold text-white">{analyticsData.sentimentAnalysis.negative}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full"
                      style={{ width: `${analyticsData.sentimentAnalysis.negativeRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* トップキーワード */}
        {analyticsData.topicAnalysis && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">頻出キーワード TOP 10</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {analyticsData.topicAnalysis.topKeywords.slice(0, 10).map((kw, index) => (
                <div
                  key={index}
                  className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-600 hover:border-blue-500 transition-colors"
                >
                  <div className="text-white font-semibold mb-1">{kw.keyword}</div>
                  <div className="text-sm text-slate-400">{kw.count}回</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アラート */}
        {analyticsData.alerts && analyticsData.alerts.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-slate-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              アラート
            </h3>
            <div className="space-y-3">
              {analyticsData.alerts.map((alert) => {
                const severityInfo = getAlertSeverityInfo(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{severityInfo.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-semibold ${severityInfo.color} px-2 py-1 rounded`}>
                            {severityInfo.label}
                          </span>
                          <span className="text-white font-semibold">{alert.topic}</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{alert.description}</p>
                        <div className="text-sm text-slate-400 mb-2">
                          影響部門: {alert.affectedDepartments.join(', ')}
                        </div>
                        <div className="bg-blue-900/20 border border-blue-700/30 rounded p-2 text-sm text-blue-300">
                          💡 推奨アクション: {alert.recommendedAction}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* プライバシー情報 */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-6 border border-green-700/50">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                🔒 プライバシー保護について
              </h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>✅ 同意済み職員のみが分析対象（{analyticsData.privacyMetadata.totalConsentedUsers}名）</li>
                <li>✅ 最小グループサイズ: {analyticsData.privacyMetadata.minimumGroupSize}名（個人特定不可）</li>
                <li>✅ 除外された小規模グループ: {analyticsData.privacyMetadata.excludedSmallGroupsCount}件</li>
                <li>✅ すべての分析は集団統計データのみ（生データは職員カルテシステムで管理）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAnalyticsPage;
