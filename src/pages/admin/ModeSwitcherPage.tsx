/**
 * モード管理ページ（レベルX専用）
 * 議題モード ↔ プロジェクト化モード の切り替えを管理
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Info, AlertTriangle, CheckCircle, ArrowRight, TrendingUp, Users, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';
import { systemModeManager, SystemMode } from '../../config/systemMode';
import { AuditService } from '../../services/AuditService';
import { systemModeStatsService, MigrationStats, MigrationReadiness } from '../../services/SystemModeStatsService';

export const ModeSwitcherPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState<SystemMode>(SystemMode.AGENDA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [readiness, setReadiness] = useState<MigrationReadiness | null>(null);

  // 権限チェック（レベル99のみアクセス可能）
  useEffect(() => {
    if (!user || user.permissionLevel !== 99) {
      navigate('/');
      return;
    }

    // 現在のモードを取得
    setCurrentMode(systemModeManager.getCurrentMode());

    // 移行準備状況を取得
    loadMigrationStats();
  }, [user, navigate]);

  /**
   * 移行準備状況の統計を読み込み
   */
  const loadMigrationStats = async () => {
    try {
      const [migrationStats, migrationReadiness] = await Promise.all([
        systemModeStatsService.getMigrationStats(),
        systemModeStatsService.checkMigrationReadiness()
      ]);

      setStats(migrationStats);
      setReadiness(migrationReadiness);
    } catch (err) {
      console.error('統計取得エラー:', err);
    }
  };

  /**
   * モード切り替えハンドラー
   */
  const handleModeSwitch = async (targetMode: SystemMode) => {
    if (!user) return;

    // 確認ダイアログ
    const modeNames = {
      [SystemMode.AGENDA]: '議題モード',
      [SystemMode.PROJECT]: 'プロジェクト化モード'
    };

    const confirmed = window.confirm(
      `⚠️ 【レベルX専用操作】\n\n` +
      `システムモードを「${modeNames[targetMode]}」に切り替えます。\n\n` +
      `この操作により、以下の影響があります：\n` +
      `・全ユーザーの表示内容が変更されます\n` +
      `・権限制御ルールが変更されます\n` +
      `・この操作は監査ログに記録されます\n\n` +
      `続行しますか？`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // モード切り替え実行
      await systemModeManager.setMode(targetMode, user);

      // 監査ログ記録（高優先度）
      AuditService.log({
        userId: user.id,
        action: 'SYSTEM_MODE_CHANGED',
        details: {
          previousMode: currentMode,
          newMode: targetMode,
          changedBy: user.name,
          timestamp: new Date().toISOString()
        },
        severity: 'high'
      });

      setCurrentMode(targetMode);
      setSuccess(`システムモードを「${modeNames[targetMode]}」に切り替えました`);

      // 3秒後にメッセージをクリア
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('モード切り替えエラー:', err);
      setError('モード切り替えに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * モード情報の取得
   */
  const getModeInfo = (mode: SystemMode) => {
    const modeInfo = {
      [SystemMode.AGENDA]: {
        name: '議題モード',
        icon: '📋',
        color: 'from-blue-600 to-cyan-600',
        description: '委員会活性化・声を上げる文化の醸成',
        features: [
          '委員会・理事会への段階的議題化',
          '匿名投票による心理的安全性',
          'シンプルな承認フロー',
          '施設内・法人全体での投票権限制御'
        ],
        levels: [
          '0-29点: 検討中（部署内）',
          '30-49点: 部署検討（部署内）',
          '50-99点: 部署議題（部署内）',
          '100-299点: 施設議題（委員会提出）',
          '300-599点: 法人検討',
          '600点以上: 法人議題（理事会提出）'
        ],
        recommended: '導入初期（0-6ヶ月）、委員会活性化が必要な組織'
      },
      [SystemMode.PROJECT]: {
        name: 'プロジェクト化モード',
        icon: '🚀',
        color: 'from-purple-600 to-pink-600',
        description: 'チーム編成・組織一体感の向上',
        features: [
          '自動プロジェクトチーム編成',
          '部署横断の協働促進',
          '進捗管理・マイルストーン設定',
          '実装重視のワークフロー'
        ],
        levels: [
          '0-99点: PENDING（検討中）',
          '100-299点: DEPARTMENT（部署プロジェクト）',
          '300-599点: FACILITY（施設プロジェクト）',
          '600点以上: ORGANIZATION（法人プロジェクト）'
        ],
        recommended: '組織成熟期（12ヶ月以降）、部署間協働が必要な組織'
      }
    };

    return modeInfo[mode];
  };

  const agendaInfo = getModeInfo(SystemMode.AGENDA);
  const projectInfo = getModeInfo(SystemMode.PROJECT);
  const currentInfo = getModeInfo(currentMode);

  return (
    <div className="min-h-screen bg-gray-900 w-full pb-32">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🔄</span>
            システムモード管理
          </h1>
          <p className="text-gray-300">
            レベルX専用 - 議題モードとプロジェクト化モードを切り替えます
          </p>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-200">{success}</span>
          </div>
        )}

        {/* 現在のモード表示 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            現在のシステムモード
          </h2>
          <Card className={`bg-gradient-to-r ${currentInfo.color} p-6 border-none`}>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{currentInfo.icon}</span>
              <div>
                <h3 className="text-2xl font-bold text-white">{currentInfo.name}</h3>
                <p className="text-white/80">{currentInfo.description}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 移行準備状況（議題モードの場合のみ表示） */}
        {currentMode === SystemMode.AGENDA && stats && readiness && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              プロジェクト化モード移行準備状況
            </h2>

            {/* 全体進捗 */}
            <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">全体進捗</h3>
                <span className="text-2xl font-bold text-white">{readiness.progress}%</span>
              </div>

              {/* 進捗バー */}
              <div className="w-full bg-gray-700 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    readiness.progress >= 100
                      ? 'bg-green-500'
                      : readiness.progress >= 70
                      ? 'bg-blue-500'
                      : readiness.progress >= 40
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }`}
                  style={{ width: `${readiness.progress}%` }}
                />
              </div>

              <p className={`text-sm ${
                readiness.isReady ? 'text-green-400' : 'text-gray-400'
              }`}>
                {readiness.message}
              </p>
            </Card>

            {/* 詳細統計 */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* 月間投稿数 */}
              <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white">月間投稿数</h4>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{stats.monthlyPosts}</span>
                  <span className="text-sm text-gray-400">/ 30件</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      readiness.details.postsStatus === 'ready'
                        ? 'bg-green-500'
                        : readiness.details.postsStatus === 'in_progress'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                    style={{ width: `${Math.min((stats.monthlyPosts / 30) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">組織全体での月間投稿数</p>
              </Card>

              {/* 委員会提出数 */}
              <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">委員会提出数</h4>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{stats.committeeSubmissions}</span>
                  <span className="text-sm text-gray-400">/ 10件</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      readiness.details.submissionsStatus === 'ready'
                        ? 'bg-green-500'
                        : readiness.details.submissionsStatus === 'in_progress'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                    style={{ width: `${Math.min((stats.committeeSubmissions / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">月間委員会提出数（100点以上）</p>
              </Card>

              {/* 職員参加率 */}
              <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-white">職員参加率</h4>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{Math.round(stats.participationRate)}%</span>
                  <span className="text-sm text-gray-400">/ 60%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      readiness.details.participationStatus === 'ready'
                        ? 'bg-green-500'
                        : readiness.details.participationStatus === 'in_progress'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                    style={{ width: `${Math.min((stats.participationRate / 60) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  月間アクティブ: {stats.activeUsers}/{stats.totalUsers}名
                </p>
              </Card>
            </div>

            {/* 推奨ガイド */}
            {!readiness.isReady && (
              <Card className="bg-blue-500/10 border border-blue-500/50 p-4 mt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-2">移行推奨タイミング</p>
                    <p>プロジェクト化モードは、以下の条件を満たした後の移行を推奨します：</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-blue-300/80">
                      <li>月間30件以上の投稿が安定して投稿されている</li>
                      <li>委員会への提出実績が月間10件以上ある</li>
                      <li>職員の60%以上が月間1回以上ログインしている</li>
                    </ul>
                    <p className="mt-2">
                      現在の進捗: <strong>{readiness.progress}%</strong> -
                      まずは議題モードで組織の改善文化を定着させましょう。
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* モード比較・切り替え */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 議題モード */}
          <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{agendaInfo.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{agendaInfo.name}</h3>
                <p className="text-sm text-gray-400">{agendaInfo.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">主な機能</h4>
              <ul className="space-y-1">
                {agendaInfo.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">スコア閾値</h4>
              <ul className="space-y-1">
                {agendaInfo.levels.map((level, idx) => (
                  <li key={idx} className="text-xs text-gray-500">{level}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">推奨導入時期</h4>
              <p className="text-sm text-gray-400">{agendaInfo.recommended}</p>
            </div>

            {currentMode !== SystemMode.AGENDA && (
              <button
                onClick={() => handleModeSwitch(SystemMode.AGENDA)}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    切り替え中...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    議題モードに切り替え
                  </>
                )}
              </button>
            )}

            {currentMode === SystemMode.AGENDA && (
              <div className="w-full py-3 bg-green-600/20 text-green-400 rounded-lg text-center font-semibold border border-green-600/50">
                ✓ 現在有効
              </div>
            )}
          </Card>

          {/* プロジェクト化モード */}
          <Card className="bg-gray-800/50 p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{projectInfo.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{projectInfo.name}</h3>
                <p className="text-sm text-gray-400">{projectInfo.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">主な機能</h4>
              <ul className="space-y-1">
                {projectInfo.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">スコア閾値</h4>
              <ul className="space-y-1">
                {projectInfo.levels.map((level, idx) => (
                  <li key={idx} className="text-xs text-gray-500">{level}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">推奨導入時期</h4>
              <p className="text-sm text-gray-400">{projectInfo.recommended}</p>
            </div>

            {currentMode !== SystemMode.PROJECT && (
              <button
                onClick={() => handleModeSwitch(SystemMode.PROJECT)}
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    切り替え中...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    プロジェクト化モードに切り替え
                  </>
                )}
              </button>
            )}

            {currentMode === SystemMode.PROJECT && (
              <div className="w-full py-3 bg-green-600/20 text-green-400 rounded-lg text-center font-semibold border border-green-600/50">
                ✓ 現在有効
              </div>
            )}
          </Card>
        </div>

        {/* 注意事項 */}
        <Card className="bg-yellow-500/10 border border-yellow-500/50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-yellow-200 mb-2">重要な注意事項</h3>
              <ul className="space-y-2 text-sm text-yellow-100/80">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>モード切り替えは全ユーザーに即座に影響します</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>既存データは保持されますが、表示方法が変更されます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>この操作は監査ログに記録され、追跡可能です</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>組織の成熟度に応じて慎重に選択してください</span>
                </li>
              </ul>
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
