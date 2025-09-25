import { useState, useCallback, useEffect } from 'react';
import { agendaDocumentService, AgendaDocumentData, DocumentSection } from '../services/AgendaDocumentService';
import { proposalEscalationEngine } from '../services/ProposalEscalationEngine';

interface UseAgendaDocumentProps {
  proposalId: string;
  proposalData: any;
  committeeId: string;
}

export const useAgendaDocument = ({ proposalId, proposalData, committeeId }: UseAgendaDocumentProps) => {
  const [document, setDocument] = useState<AgendaDocumentData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ドキュメント初期化
  useEffect(() => {
    const initDocument = async () => {
      setIsLoading(true);
      try {
        // 既存ドキュメントを確認
        let doc = agendaDocumentService.getDocument(proposalId);

        if (!doc) {
          // 新規生成
          const committee = proposalEscalationEngine.determineTargetCommittee(
            proposalData.votingScore || 0,
            proposalData.category || '業務改善',
            proposalData.facility || '小原病院'
          );

          if (!committee) {
            throw new Error('委員会が見つかりません');
          }

          const generatedDoc = await proposalEscalationEngine.generateAgendaDocument(
            proposalId,
            proposalData,
            committee
          );

          // セクション分割
          const sections: DocumentSection[] = [
            {
              id: 'title',
              label: '議題名',
              content: proposalData.title,
              isEdited: false,
              isRequired: true
            },
            {
              id: 'background',
              label: '背景・現状の課題',
              content: proposalData.background || '',
              isEdited: false,
              isRequired: false
            },
            {
              id: 'content',
              label: '提案内容',
              content: proposalData.content,
              isEdited: false,
              isRequired: true
            },
            {
              id: 'expectedEffect',
              label: '期待される効果',
              content: proposalData.expectedEffect || '',
              isEdited: false,
              isRequired: false
            },
            {
              id: 'budget',
              label: '必要予算',
              content: proposalData.budget || '未定',
              isEdited: false,
              isRequired: false
            }
          ];

          doc = {
            proposalId,
            committeeId: committee.name,
            documentType: '議題提案書',
            content: generatedDoc.content,
            sections,
            metadata: {
              proposer: proposalData.proposer,
              department: proposalData.department,
              facility: proposalData.facility || '小原病院',
              votingScore: proposalData.votingScore || 0,
              agreementRate: proposalData.agreementRate || 0,
              totalVotes: proposalData.totalVotes || 0
            },
            editHistory: [],
            generatedAt: new Date(),
            lastEditedAt: undefined
          };

          agendaDocumentService.saveDocument(doc);
        }

        setDocument(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : '初期化エラー');
      } finally {
        setIsLoading(false);
      }
    };

    initDocument();
  }, [proposalId, proposalData, committeeId]);

  // セクション編集
  const editSection = useCallback((sectionId: string, newContent: string) => {
    if (!document) return;

    const section = document.sections.find(s => s.id === sectionId);
    if (!section || section.content === newContent) return;

    // サービスに保存
    agendaDocumentService.editSection(
      proposalId,
      sectionId,
      newContent,
      'current_user' // TODO: 実際のユーザーID
    );

    // ローカル状態更新
    const updatedDoc = agendaDocumentService.getDocument(proposalId);
    if (updatedDoc) {
      setDocument(updatedDoc);
      setHasUnsavedChanges(true);
    }
  }, [document, proposalId]);

  // 保存
  const save = useCallback(() => {
    if (!document) return;

    agendaDocumentService.saveDocument(document);
    setHasUnsavedChanges(false);
  }, [document]);

  // PDFエクスポート
  const exportToPDF = useCallback(async () => {
    if (!document) return;

    try {
      const blob = await agendaDocumentService.exportToPDF(proposalId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `議題提案書_${proposalId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('PDFエクスポートに失敗しました');
    }
  }, [document, proposalId]);

  // Wordエクスポート
  const exportToWord = useCallback(() => {
    if (!document) return;

    try {
      const html = agendaDocumentService.exportToWord(proposalId);
      const blob = new Blob([html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `議題提案書_${proposalId}.doc`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Wordエクスポートに失敗しました');
    }
  }, [document, proposalId]);

  // 編集履歴取得
  const getEditHistory = useCallback(() => {
    return agendaDocumentService.getEditHistory(proposalId);
  }, [proposalId]);

  // ロールバック
  const rollback = useCallback((timestamp: Date) => {
    agendaDocumentService.rollbackToVersion(proposalId, timestamp);
    const updatedDoc = agendaDocumentService.getDocument(proposalId);
    if (updatedDoc) {
      setDocument(updatedDoc);
    }
  }, [proposalId]);

  return {
    document,
    isEditing,
    setIsEditing,
    hasUnsavedChanges,
    isLoading,
    error,
    editSection,
    save,
    exportToPDF,
    exportToWord,
    getEditHistory,
    rollback
  };
};