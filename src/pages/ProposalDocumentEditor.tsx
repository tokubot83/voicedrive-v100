/**
 * 議題提案書編集ページ
 * 自動生成された提案書を管理職が補足・編集
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { ProposalDocument } from '../types/proposalDocument';
import { proposalDocumentGenerator } from '../services/ProposalDocumentGenerator';
import { committeeSubmissionService } from '../services/CommitteeSubmissionService';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import {
  FileText, Save, Send, ChevronLeft, AlertCircle,
  BarChart3, MessageSquare, Users, Calendar, Shield, CheckCircle
} from 'lucide-react';

export const ProposalDocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [document, setDocument] = useState<ProposalDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({
    managerNotes: '',
    additionalContext: '',
    recommendationLevel: 'recommend' as ProposalDocument['recommendationLevel']
  });

  useEffect(() => {
    if (documentId) {
      const doc = proposalDocumentGenerator.getDocument(documentId);
      if (doc) {
        setDocument(doc);
        setEditedFields({
          managerNotes: doc.managerNotes || '',
          additionalContext: doc.additionalContext || '',
          recommendationLevel: doc.recommendationLevel || 'recommend'
        });
      }
    }
  }, [documentId]);

  if (!activeUser || !document) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">読み込み中...</div>
    </div>;
  }

  const handleSave = () => {
    if (!documentId) return;

    proposalDocumentGenerator.updateDocument(
      documentId,
      editedFields,
      activeUser
    );

    const updated = proposalDocumentGenerator.getDocument(documentId);
    if (updated) {
      setDocument(updated);
    }

    setIsEditing(false);
    alert('保存しました');
  };

  const handleMarkAsReady = () => {
    if (!documentId) return;

    proposalDocumentGenerator.markAsReady(documentId, activeUser);
    const updated = proposalDocumentGenerator.getDocument(documentId);
    if (updated) {
      setDocument(updated);
    }

    alert('提出準備完了としてマークしました');
  };

  const handleSubmitRequest = () => {
    if (!documentId) return;

    // Level 7+ のみ
    if (!activeUser.permissionLevel || activeUser.permissionLevel < 7) {
      alert('委員会提出リクエストには Level 7 以上の権限が必要です');
      return;
    }

    const targetCommittee = prompt('提出先の委員会を入力してください（例: 運営委員会）');
    if (!targetCommittee) return;

    const request = committeeSubmissionService.createSubmissionRequest(
      documentId,
      targetCommittee,
      activeUser
    );

    if (request) {
      alert(`委員会提出リクエストを作成しました\n提出先: ${targetCommittee}\nレビュー待ち`);
    }
  };

  // 議題レベルの表示設定
  const levelConfig = {
    PENDING: { label: '投票中', color: 'text-gray-400', bg: 'bg-gray-800/30' },
    DEPT_REVIEW: { label: '部署レビュー', color: 'text-blue-400', bg: 'bg-blue-900/30' },
    DEPT_AGENDA: { label: '部署議題', color: 'text-blue-500', bg: 'bg-blue-900/50' },
    FACILITY_AGENDA: { label: '施設議題', color: 'text-purple-400', bg: 'bg-purple-900/50' },
    CORP_REVIEW: { label: '法人レビュー', color: 'text-orange-400', bg: 'bg-orange-900/50' },
    CORP_AGENDA: { label: '法人議題', color: 'text-red-400', bg: 'bg-red-900/50' }
  };

  const config = levelConfig[document.agendaLevel];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6 m-6">
        <button
          onClick={() => navigate('/proposal-management')}
          className="mb-4 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          投稿管理に戻る
        </button>

        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          議題提案書
        </h1>
        <p className="text-gray-300 mb-4">{document.title}</p>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded text-sm font-medium ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            document.status === 'ready' ? 'bg-green-900/30 text-green-400' :
            document.status === 'submitted' ? 'bg-blue-900/30 text-blue-400' :
            'bg-gray-800/30 text-gray-400'
          }`}>
            {document.status === 'draft' ? '下書き' :
             document.status === 'under_review' ? 'レビュー中' :
             document.status === 'ready' ? '提出準備完了' :
             document.status === 'submitted' ? '委員会提出済み' :
             document.status}
          </span>
          {document.targetCommittee && (
            <span className="px-3 py-1 rounded text-sm font-medium bg-purple-900/30 text-purple-400 flex items-center gap-1">
              <Send className="w-3 h-3" />
              提出先: {document.targetCommittee}
            </span>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            作成: {new Date(document.createdDate).toLocaleDateString('ja-JP')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            作成者: {document.createdBy.name}
          </div>
        </div>
      </div>

      <div className="mx-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 提案内容（自動生成） */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              提案内容（自動生成）
            </h2>

            <div className="space-y-4">
              <Section title="要約" content={document.summary} />
              <Section title="背景・経緯" content={document.background} />
              <Section title="目的" content={document.objectives} />
              <Section title="期待される効果" content={document.expectedEffects} />
              <Section title="懸念点" content={document.concerns} />
              <Section title="対応策" content={document.counterMeasures} />
            </div>
          </div>

          {/* 管理職による補足（編集可能） */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                管理職による補足
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  編集
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    補足説明
                  </label>
                  <textarea
                    value={editedFields.managerNotes}
                    onChange={(e) => setEditedFields({ ...editedFields, managerNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="現場の状況や追加の背景情報を記入してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    追加の文脈
                  </label>
                  <textarea
                    value={editedFields.additionalContext}
                    onChange={(e) => setEditedFields({ ...editedFields, additionalContext: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="委員会に伝えたい追加情報を記入してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    推奨レベル
                  </label>
                  <select
                    value={editedFields.recommendationLevel}
                    onChange={(e) => setEditedFields({ ...editedFields, recommendationLevel: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="strongly_recommend">強く推奨</option>
                    <option value="recommend">推奨</option>
                    <option value="neutral">中立</option>
                    <option value="not_recommend">推奨しない</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedFields({
                        managerNotes: document.managerNotes || '',
                        additionalContext: document.additionalContext || '',
                        recommendationLevel: document.recommendationLevel || 'recommend'
                      });
                    }}
                    className="px-6 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {document.managerNotes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">補足説明</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{document.managerNotes}</p>
                  </div>
                )}
                {document.additionalContext && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">追加の文脈</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{document.additionalContext}</p>
                  </div>
                )}
                {document.recommendationLevel && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">推奨レベル</h3>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      document.recommendationLevel === 'strongly_recommend' ? 'bg-green-900/30 text-green-400' :
                      document.recommendationLevel === 'recommend' ? 'bg-blue-900/30 text-blue-400' :
                      document.recommendationLevel === 'neutral' ? 'bg-gray-800/30 text-gray-400' :
                      'bg-orange-900/30 text-orange-400'
                    }`}>
                      {document.recommendationLevel === 'strongly_recommend' ? '強く推奨' :
                       document.recommendationLevel === 'recommend' ? '推奨' :
                       document.recommendationLevel === 'neutral' ? '中立' :
                       '推奨しない'}
                    </span>
                  </div>
                )}
                {!document.managerNotes && !document.additionalContext && (
                  <p className="text-gray-500 text-sm">まだ補足情報が追加されていません</p>
                )}
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            {document.status === 'draft' && (
              <button
                onClick={handleMarkAsReady}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                提出準備完了としてマーク
              </button>
            )}

            {document.status === 'ready' && activeUser.permissionLevel && activeUser.permissionLevel >= 7 && (
              <button
                onClick={handleSubmitRequest}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                委員会提出リクエスト
              </button>
            )}
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 投票データ */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              投票データ
            </h3>
            <div className="space-y-2 text-sm">
              <DataRow label="総投票数" value={`${document.voteAnalysis.totalVotes}票`} />
              <DataRow label="支持率" value={`${document.voteAnalysis.supportRate}%`} color="text-green-400" />
              <DataRow label="反対率" value={`${document.voteAnalysis.oppositionRate}%`} color="text-red-400" />
            </div>
          </div>

          {/* コメント統計 */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              コメント統計
            </h3>
            <div className="space-y-2 text-sm">
              <DataRow label="総コメント数" value={`${document.commentAnalysis.totalComments}件`} />
              <DataRow label="賛成意見" value={`${document.commentAnalysis.supportComments}件`} />
              <DataRow label="懸念点" value={`${document.commentAnalysis.concernComments}件`} />
              <DataRow label="建設的提案" value={`${document.commentAnalysis.proposalComments}件`} />
            </div>
          </div>

          {/* 透明性ログ */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              透明性ログ
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {document.auditLog.map((log, idx) => (
                <div key={idx} className="text-xs bg-gray-900/50 p-2 rounded">
                  <div className="text-gray-400">
                    {new Date(log.timestamp).toLocaleString('ja-JP')}
                  </div>
                  <div className="text-white font-medium">{log.userName} (Lv.{log.userLevel})</div>
                  <div className="text-gray-300">{log.action}</div>
                  {log.details && <div className="text-gray-500 text-xs mt-1">{log.details}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

// セクションコンポーネント
const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-400 mb-1">{title}</h3>
    <p className="text-gray-200 whitespace-pre-wrap">{content}</p>
  </div>
);

// データ行コンポーネント
const DataRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'text-white' }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400">{label}</span>
    <span className={`font-medium ${color}`}>{value}</span>
  </div>
);

export default ProposalDocumentEditor;
