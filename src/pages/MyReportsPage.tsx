import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Filter,
  Calendar,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { WhistleblowingReport, ReportStatus, ReportCategory } from '../types/whistleblowing';

const MyReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');

  useEffect(() => {
    // デモデータ読み込み
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);

    // デモデータ（実際にはAPIから取得）
    const demoReports: WhistleblowingReport[] = [
      {
        id: 'RPT-2025-001',
        anonymousId: 'ANON-8F3A2B',
        category: 'harassment',
        severity: 'high',
        title: 'パワーハラスメントの相談',
        content: '上司からの不適切な発言が続いています...',
        submittedAt: new Date('2025-10-01T10:30:00'),
        updatedAt: new Date('2025-10-02T14:20:00'),
        status: 'investigating',
        assignedInvestigators: ['hr_specialist', 'management'],
        followUpRequired: true,
        isAnonymous: true,
        priority: 8
      },
      {
        id: 'RPT-2025-002',
        anonymousId: 'ANON-5C9D1E',
        category: 'safety',
        severity: 'medium',
        title: '安全管理体制の改善要望',
        content: '夜勤時の安全対策について...',
        submittedAt: new Date('2025-09-28T16:45:00'),
        updatedAt: new Date('2025-09-30T09:15:00'),
        status: 'resolved',
        assignedInvestigators: ['safety_officer'],
        resolutionSummary: '安全対策を強化しました。ご報告ありがとうございました。',
        followUpRequired: false,
        isAnonymous: false,
        priority: 5
      },
      {
        id: 'RPT-2025-003',
        anonymousId: 'ANON-2A7F4C',
        category: 'compliance',
        severity: 'critical',
        title: '重大なコンプライアンス違反の疑い',
        content: '医療記録の不適切な取り扱いを目撃しました...',
        submittedAt: new Date('2025-10-03T08:15:00'),
        updatedAt: new Date('2025-10-03T08:20:00'),
        status: 'triaging',
        assignedInvestigators: ['legal_counsel', 'management'],
        followUpRequired: true,
        isAnonymous: true,
        priority: 10
      }
    ];

    setTimeout(() => {
      setReports(demoReports);
      setLoading(false);
    }, 500);
  };

  const getStatusLabel = (status: ReportStatus): { label: string; color: string; icon: React.ReactNode } => {
    switch (status) {
      case 'received':
        return {
          label: '受付完了',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'triaging':
        return {
          label: '分類中',
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          icon: <Clock className="w-4 h-4" />
        };
      case 'investigating':
        return {
          label: '調査中',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          icon: <Eye className="w-4 h-4" />
        };
      case 'escalated':
        return {
          label: 'エスカレーション',
          color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          icon: <AlertCircle className="w-4 h-4" />
        };
      case 'resolved':
        return {
          label: '対応完了',
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'closed':
        return {
          label: '案件終了',
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: <CheckCircle className="w-4 h-4" />
        };
    }
  };

  const getCategoryLabel = (category: ReportCategory): string => {
    switch (category) {
      case 'harassment': return 'ハラスメント';
      case 'safety': return '安全管理';
      case 'financial': return '財務・会計';
      case 'compliance': return 'コンプライアンス';
      case 'discrimination': return '差別・不公正';
      case 'other': return 'その他';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const filteredReports = reports.filter(report => {
    if (selectedStatus !== 'all' && report.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && report.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-2xl p-6 backdrop-blur-xl border border-red-500/20 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            マイ通報履歴
          </h1>
          <p className="text-gray-300">
            あなたが送信したコンプライアンス通報の状況を確認できます
          </p>
        </div>

        {/* フィルター */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">フィルター</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ステータスフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">ステータス</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'all')}
                className="w-full px-4 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">すべて</option>
                <option value="received">受付完了</option>
                <option value="triaging">分類中</option>
                <option value="investigating">調査中</option>
                <option value="escalated">エスカレーション</option>
                <option value="resolved">対応完了</option>
                <option value="closed">案件終了</option>
              </select>
            </div>

            {/* カテゴリーフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">カテゴリー</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ReportCategory | 'all')}
                className="w-full px-4 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">すべて</option>
                <option value="harassment">ハラスメント</option>
                <option value="safety">安全管理</option>
                <option value="financial">財務・会計</option>
                <option value="compliance">コンプライアンス</option>
                <option value="discrimination">差別・不公正</option>
                <option value="other">その他</option>
              </select>
            </div>
          </div>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総通報数</p>
                <p className="text-2xl font-bold text-white">{reports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">調査中</p>
                <p className="text-2xl font-bold text-white">
                  {reports.filter(r => r.status === 'investigating').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">対応完了</p>
                <p className="text-2xl font-bold text-white">
                  {reports.filter(r => r.status === 'resolved' || r.status === 'closed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">緊急案件</p>
                <p className="text-2xl font-bold text-white">
                  {reports.filter(r => r.severity === 'critical' || r.severity === 'high').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* 通報履歴一覧 */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-12 border border-gray-700/30 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">読み込み中...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-12 border border-gray-700/30 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">通報履歴がありません</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const statusInfo = getStatusLabel(report.status);

              return (
                <div
                  key={report.id}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30 hover:border-red-500/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/my-reports/${report.id}`)}
                >
                  {/* ヘッダー行 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color} flex items-center gap-1`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {report.id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          匿名ID: {report.anonymousId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.submittedAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getSeverityColor(report.severity)}`}>
                      {report.severity === 'critical' ? '🔴' :
                       report.severity === 'high' ? '🟠' :
                       report.severity === 'medium' ? '🟡' : '🟢'}
                    </div>
                  </div>

                  {/* カテゴリー */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm text-gray-300">
                      {getCategoryLabel(report.category)}
                    </span>
                    {report.isAnonymous && (
                      <span className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                        匿名通報
                      </span>
                    )}
                    {report.followUpRequired && (
                      <span className="px-3 py-1 bg-orange-900/30 border border-orange-500/30 rounded-lg text-sm text-orange-300">
                        フォローアップ必要
                      </span>
                    )}
                  </div>

                  {/* 内容プレビュー */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {report.content}
                  </p>

                  {/* 対応完了の場合、解決サマリー表示 */}
                  {report.resolutionSummary && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-green-300 mb-1">対応結果</p>
                      <p className="text-sm text-gray-300">{report.resolutionSummary}</p>
                    </div>
                  )}

                  {/* 更新日時 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>最終更新: {new Date(report.updatedAt).toLocaleString('ja-JP')}</span>
                    <span className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                      詳細を見る
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 新規通報ボタン */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/compliance-guide')}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
          >
            新規通報を送信
          </button>
        </div>
      </div>

      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default MyReportsPage;
