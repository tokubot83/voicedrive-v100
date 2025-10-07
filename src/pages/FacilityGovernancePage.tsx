/**
 * 施設ガバナンスページ（レベル10+：部長以上）
 * 施設全体のガバナンス管理
 * - 施設方針・規則管理
 * - コンプライアンスチェック
 * - リスク管理
 * - 監査ログ・透明性レポート
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import {
  Shield, FileText, AlertTriangle, TrendingUp, CheckCircle,
  AlertCircle, XCircle, Activity, BarChart3, Download, Eye
} from 'lucide-react';

type TabType = 'policies' | 'compliance' | 'risks' | 'transparency';

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: Date;
  status: 'active' | 'draft' | 'review';
  compliance: number; // %
}

interface ComplianceCheck {
  id: string;
  area: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  score: number;
  lastCheck: Date;
  issues: number;
}

interface Risk {
  id: string;
  title: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  status: 'identified' | 'mitigating' | 'resolved';
  owner: string;
}

export const FacilityGovernancePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<TabType>('policies');

  // デモデータ
  const demoPolicies: Policy[] = [
    {
      id: 'policy-1',
      title: '個人情報保護方針',
      category: 'コンプライアンス',
      version: 'v2.1',
      lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      compliance: 98
    },
    {
      id: 'policy-2',
      title: '労働安全衛生規則',
      category: '安全管理',
      version: 'v1.5',
      lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'active',
      compliance: 95
    },
    {
      id: 'policy-3',
      title: 'ハラスメント防止規定',
      category: '人事',
      version: 'v3.0',
      lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'review',
      compliance: 92
    }
  ];

  const demoCompliance: ComplianceCheck[] = [
    {
      id: 'comp-1',
      area: '医療安全管理',
      status: 'compliant',
      score: 96,
      lastCheck: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      issues: 0
    },
    {
      id: 'comp-2',
      area: '個人情報保護',
      status: 'warning',
      score: 88,
      lastCheck: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      issues: 2
    },
    {
      id: 'comp-3',
      area: '労働基準',
      status: 'compliant',
      score: 94,
      lastCheck: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      issues: 0
    }
  ];

  const demoRisks: Risk[] = [
    {
      id: 'risk-1',
      title: '夜勤シフト人員不足による医療安全リスク',
      category: '医療安全',
      severity: 'high',
      probability: 'medium',
      status: 'mitigating',
      owner: '看護部'
    },
    {
      id: 'risk-2',
      title: '情報セキュリティインシデント',
      category: '情報セキュリティ',
      severity: 'medium',
      probability: 'low',
      status: 'identified',
      owner: '情報システム部'
    },
    {
      id: 'risk-3',
      title: '職員の離職率上昇',
      category: '人事',
      severity: 'medium',
      probability: 'medium',
      status: 'mitigating',
      owner: '人事部'
    }
  ];

  if (!activeUser) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">読み込み中...</div>
    </div>;
  }

  // Level 10 未満はアクセス不可
  if (!activeUser.permissionLevel || activeUser.permissionLevel < 10) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 max-w-md">
        <div className="flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">アクセス権限がありません</h2>
        <p className="text-gray-400 text-center">
          施設ガバナンスには Level 10 以上（部長職以上）の権限が必要です
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>;
  }

  const stats = {
    activePolicies: demoPolicies.filter(p => p.status === 'active').length,
    avgCompliance: Math.round(demoCompliance.reduce((sum, c) => sum + c.score, 0) / demoCompliance.length),
    activeRisks: demoRisks.filter(r => r.status !== 'resolved').length,
    complianceIssues: demoCompliance.reduce((sum, c) => sum + c.issues, 0)
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-cyan-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">⚖️</span>
          施設ガバナンス
        </h1>
        <p className="text-gray-300 mb-4">
          施設全体の統制管理 - 方針・コンプライアンス・リスク・透明性
        </p>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{stats.activePolicies}</div>
            <div className="text-xs text-blue-300">運用中の方針</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{stats.avgCompliance}%</div>
            <div className="text-xs text-green-300">平均遵守率</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{stats.activeRisks}</div>
            <div className="text-xs text-yellow-300">管理中リスク</div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{stats.complianceIssues}</div>
            <div className="text-xs text-red-300">コンプライアンス課題</div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="mx-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-800/50 rounded-xl p-2">
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'policies'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            方針・規則
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'compliance'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            コンプライアンス
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'risks'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            リスク管理
          </button>
          <button
            onClick={() => setActiveTab('transparency')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'transparency'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Eye className="w-4 h-4" />
            透明性レポート
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="mx-6 pb-24">
        {/* 方針・規則タブ */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            {demoPolicies.map(policy => (
              <div
                key={policy.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{policy.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        policy.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        policy.status === 'draft' ? 'bg-gray-900/30 text-gray-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {policy.status === 'active' ? '運用中' :
                         policy.status === 'draft' ? '草案' : '審査中'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div className="flex items-center gap-4">
                        <span>カテゴリ: {policy.category}</span>
                        <span>バージョン: {policy.version}</span>
                      </div>
                      <div>更新日: {policy.lastUpdated.toLocaleDateString('ja-JP')}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 rounded-full h-2"
                            style={{ width: `${policy.compliance}%` }}
                          />
                        </div>
                        <span className="text-green-400 font-medium">{policy.compliance}%</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    取得
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* コンプライアンスタブ */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            {demoCompliance.map(check => (
              <div
                key={check.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{check.area}</h3>
                      {check.status === 'compliant' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                      {check.status === 'non_compliant' && <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="text-sm text-gray-400 space-y-2">
                      <div>
                        最終チェック: {check.lastCheck.toLocaleDateString('ja-JP')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>スコア:</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={`rounded-full h-2 ${
                              check.score >= 90 ? 'bg-green-500' :
                              check.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${check.score}%` }}
                          />
                        </div>
                        <span className={`font-medium ${
                          check.score >= 90 ? 'text-green-400' :
                          check.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{check.score}%</span>
                      </div>
                      {check.issues > 0 && (
                        <div className="text-yellow-400">
                          {check.issues}件の課題を検出
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* リスク管理タブ */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            {demoRisks.map(risk => (
              <div
                key={risk.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{risk.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                        risk.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {risk.severity === 'high' ? '高' :
                         risk.severity === 'medium' ? '中' : '低'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.status === 'identified' ? 'bg-yellow-900/30 text-yellow-400' :
                        risk.status === 'mitigating' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {risk.status === 'identified' ? '特定済' :
                         risk.status === 'mitigating' ? '対策中' : '解決済'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>カテゴリ: {risk.category}</div>
                      <div>発生確率: {
                        risk.probability === 'high' ? '高' :
                        risk.probability === 'medium' ? '中' : '低'
                      }</div>
                      <div>担当: {risk.owner}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 透明性レポートタブ */}
        {activeTab === 'transparency' && (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-400">透明性レポート機能は開発中です</p>
            <p className="text-sm text-gray-500 mt-2">
              監査ログ、意思決定履歴、透明性スコアレポート機能を実装予定
            </p>
          </div>
        )}
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default FacilityGovernancePage;
