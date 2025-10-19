import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  Shield,
  ArrowLeft,
  User,
  MessageSquare,
  FileCheck,
  CheckSquare
} from 'lucide-react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { WhistleblowingReport, ReportStatus, ReportCategory } from '../types/whistleblowing';

const MyReportDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<WhistleblowingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportDetail();
  }, [id]);

  const loadReportDetail = async () => {
    setLoading(true);

    // デモデータ（実際にはAPIから取得）
    const demoReports: WhistleblowingReport[] = [
      {
        id: 'RPT-2025-001',
        anonymousId: 'ANON-8F3A2B',
        category: 'harassment',
        severity: 'high',
        title: 'パワーハラスメントの相談',
        content: '上司からの不適切な発言が続いています。具体的には、業務上のミスに対して人格を否定するような言葉を使われたり、他の職員の前で大声で叱責されることがあります。このような状況が数ヶ月続いており、精神的にも辛い状況です。',
        submittedAt: new Date('2025-10-01T10:30:00'),
        updatedAt: new Date('2025-10-02T14:20:00'),
        status: 'investigating',
        assignedInvestigators: ['hr_specialist', 'management'],
        followUpRequired: true,
        isAnonymous: true,
        priority: 8,
        medicalSystemCaseNumber: 'MED-2025-0001',
        acknowledgementReceived: true,
        acknowledgementDate: new Date('2025-10-01T11:00:00'),
        estimatedResponseTime: '当日中'
      },
      {
        id: 'RPT-2025-002',
        anonymousId: 'ANON-5C9D1E',
        category: 'safety',
        severity: 'medium',
        title: '安全管理体制の改善要望',
        content: '夜勤時の安全対策について改善をお願いしたいです。現在、夜勤帯の職員数が少なく、緊急時の対応が不十分と感じています。また、防犯カメラの死角が多く、セキュリティ面でも不安があります。',
        submittedAt: new Date('2025-09-28T16:45:00'),
        updatedAt: new Date('2025-09-30T09:15:00'),
        status: 'resolved',
        assignedInvestigators: ['safety_officer'],
        resolutionSummary: '安全対策を強化しました。夜勤職員の増員と防犯カメラの増設を実施いたしました。ご報告ありがとうございました。',
        followUpRequired: false,
        isAnonymous: false,
        priority: 5,
        medicalSystemCaseNumber: 'MED-2025-0002',
        acknowledgementReceived: true,
        acknowledgementDate: new Date('2025-09-28T17:15:00'),
        estimatedResponseTime: '3営業日以内'
      },
      {
        id: 'RPT-2025-003',
        anonymousId: 'ANON-2A7F4C',
        category: 'compliance',
        severity: 'critical',
        title: '重大なコンプライアンス違反の疑い',
        content: '医療記録の不適切な取り扱いを目撃しました。個人情報が含まれる書類が施錠されていない場所に放置されていたり、関係者以外が閲覧できる状態になっていることがあります。',
        submittedAt: new Date('2025-10-03T08:15:00'),
        updatedAt: new Date('2025-10-03T08:20:00'),
        status: 'triaging',
        assignedInvestigators: ['legal_counsel', 'management'],
        followUpRequired: true,
        isAnonymous: true,
        priority: 10,
        medicalSystemCaseNumber: 'MED-2025-0003',
        acknowledgementReceived: true,
        acknowledgementDate: new Date('2025-10-03T08:30:00'),
        estimatedResponseTime: '1時間以内'
      }
    ];

    setTimeout(() => {
      const foundReport = demoReports.find(r => r.id === id);
      setReport(foundReport || null);
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

  const getSeverityLabel = (severity: string): string => {
    switch (severity) {
      case 'critical': return '緊急';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '不明';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
        <MobileFooter />
      </div>
    );
  }

  if (!report) {
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
                    <span className="mr-3 text-3xl">🛡️</span>
                    通報詳細
                  </h1>
                  <p className="text-gray-400 text-sm">通報内容と対応状況の詳細</p>
                </div>
              </div>
            </header>
          </div>

          <div className="px-6 py-8">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-12 border border-gray-700/30 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">通報が見つかりません</p>
              <button
                onClick={() => navigate('/my-reports')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                一覧に戻る
              </button>
            </div>
          </div>
        </div>
        <MobileFooter />
      </>
    );
  }

  const statusInfo = getStatusLabel(report.status);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
        {/* 固定ヘッダーコンテナ */}
        <div className="sticky top-0 z-30">
          {/* ヘッダー */}
          <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate('/my-reports')}
                  className="mb-2 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  通報履歴に戻る
                </button>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3 text-3xl">🛡️</span>
                  通報詳細
                </h1>
                <p className="text-gray-400 text-sm">通報内容と対応状況の詳細</p>
              </div>
            </div>
          </header>
        </div>

        {/* メインコンテンツ */}
        <div className="px-6 py-8">
          {/* 基本情報 */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">{report.title}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color} flex items-center gap-1`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                  <span className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm text-gray-300">
                    {getCategoryLabel(report.category)}
                  </span>
                  {report.isAnonymous && (
                    <span className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                      匿名通報
                    </span>
                  )}
                  {report.acknowledgementReceived && (
                    <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-xs text-green-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      受付確認済み
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-3xl ${getSeverityColor(report.severity)}`}>
                {report.severity === 'critical' ? '🔴' :
                 report.severity === 'high' ? '🟠' :
                 report.severity === 'medium' ? '🟡' : '🟢'}
              </div>
            </div>

            {/* メタ情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">通報ID:</span>
                <span className="text-white font-mono">{report.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">匿名ID:</span>
                <span className="text-white font-mono">{report.anonymousId}</span>
              </div>
              {report.medicalSystemCaseNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckSquare className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">医療システムID:</span>
                  <span className="text-green-400 font-mono">{report.medicalSystemCaseNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">優先度:</span>
                <span className="text-white">{report.priority}/10</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">通報日時:</span>
                <span className="text-white">{new Date(report.submittedAt).toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">最終更新:</span>
                <span className="text-white">{new Date(report.updatedAt).toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileCheck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">重要度:</span>
                <span className={`font-semibold ${getSeverityColor(report.severity)}`}>
                  {getSeverityLabel(report.severity)}
                </span>
              </div>
            </div>

            {/* 受付確認情報 */}
            {report.acknowledgementReceived && report.estimatedResponseTime && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-green-300 font-semibold mb-2">医療システムで受付確認済み</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">対応予定: {report.estimatedResponseTime}</span>
                      </div>
                      {report.acknowledgementDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400">
                            受付日時: {new Date(report.acknowledgementDate).toLocaleString('ja-JP')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 通報内容 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                通報内容
              </h3>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.content}</p>
              </div>
            </div>

            {/* 担当者情報 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                担当調査員
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.assignedInvestigators.map((investigator, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-lg text-sm text-blue-300"
                  >
                    {investigator === 'hr_specialist' ? '人事担当' :
                     investigator === 'management' ? '管理職' :
                     investigator === 'legal_counsel' ? '法務担当' :
                     investigator === 'safety_officer' ? '安全管理責任者' : investigator}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 対応完了の場合、解決サマリー表示 */}
          {report.resolutionSummary && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                対応結果
              </h3>
              <p className="text-gray-300 leading-relaxed">{report.resolutionSummary}</p>
            </div>
          )}

          {/* フォローアップ必要の場合 */}
          {report.followUpRequired && (
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-orange-300 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                フォローアップが必要です
              </h3>
              <p className="text-gray-300">
                追加の情報や確認が必要な場合があります。担当者から連絡がある可能性があります。
              </p>
            </div>
          )}

          {/* タイムライン */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              対応履歴
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-full bg-gray-700"></div>
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-sm text-gray-400">{new Date(report.updatedAt).toLocaleString('ja-JP')}</p>
                  <p className="text-white font-medium">ステータス更新: {statusInfo.label}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-full bg-gray-700"></div>
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-sm text-gray-400">{new Date(report.submittedAt).toLocaleString('ja-JP')}</p>
                  <p className="text-white font-medium">通報を受付</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileFooter />
    </>
  );
};

export default MyReportDetailPage;
