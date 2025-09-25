import React, { useState, useEffect, useCallback } from 'react';
import { Save, Download, History, Edit3, FileText, AlertCircle } from 'lucide-react';
import { proposalEscalationEngine } from '../../services/ProposalEscalationEngine';

interface AgendaDocumentEditorProps {
  proposalId: string;
  proposalData: {
    title: string;
    background?: string;
    content: string;
    expectedEffect?: string;
    budget?: string;
    proposer: string;
    department: string;
    votingScore?: number;
    agreementRate?: number;
    supportComments?: string[];
    concerns?: string[];
  };
  committeeName: string;
  onSave?: (document: EditableAgendaDocument) => void;
  onExport?: (format: 'pdf' | 'word') => void;
}

interface EditableAgendaDocument {
  proposalId: string;
  committeeId: string;
  documentType: string;
  content: string;
  editedSections: {
    [key: string]: {
      original: string;
      edited: string;
      editedAt: Date;
      editedBy?: string;
    };
  };
  generatedAt: Date;
  lastEditedAt?: Date;
}

interface EditableSection {
  id: string;
  label: string;
  value: string;
  multiline?: boolean;
  required?: boolean;
}

export const AgendaDocumentEditor: React.FC<AgendaDocumentEditorProps> = ({
  proposalId,
  proposalData,
  committeeName,
  onSave,
  onExport
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocument, setEditedDocument] = useState<EditableAgendaDocument | null>(null);
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 初期ドキュメント生成
  useEffect(() => {
    const initializeDocument = async () => {
      const committee = proposalEscalationEngine.determineTargetCommittee(
        proposalData.votingScore || 0,
        '業務改善',
        '小原病院'
      );

      if (committee) {
        const doc = await proposalEscalationEngine.generateAgendaDocument(
          proposalId,
          proposalData,
          committee
        );

        setEditedDocument({
          ...doc,
          editedSections: {},
          lastEditedAt: undefined
        });

        // セクション分割
        setSections([
          {
            id: 'title',
            label: '議題名',
            value: proposalData.title,
            multiline: false,
            required: true
          },
          {
            id: 'background',
            label: '背景・現状の課題',
            value: proposalData.background || '',
            multiline: true,
            required: false
          },
          {
            id: 'content',
            label: '提案内容',
            value: proposalData.content,
            multiline: true,
            required: true
          },
          {
            id: 'expectedEffect',
            label: '期待される効果',
            value: proposalData.expectedEffect || '',
            multiline: true,
            required: false
          },
          {
            id: 'budget',
            label: '必要予算',
            value: proposalData.budget || '未定',
            multiline: false,
            required: false
          },
          {
            id: 'votingSummary',
            label: '投票結果サマリー',
            value: generateVotingSummary(proposalData),
            multiline: true,
            required: false
          }
        ]);
      }
    };

    initializeDocument();
  }, [proposalId, proposalData, committeeName]);

  // 投票サマリー生成
  const generateVotingSummary = (data: typeof proposalData): string => {
    const score = data.votingScore || 0;
    const rate = data.agreementRate || 0;
    const supports = data.supportComments?.join('\n- ') || 'なし';
    const concerns = data.concerns?.join('\n- ') || 'なし';

    return `総投票スコア: ${score}点
賛成率: ${rate}%
主な賛成意見:
- ${supports}
主な懸念事項:
- ${concerns}`;
  };

  // セクション編集
  const handleSectionEdit = (sectionId: string, newValue: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, value: newValue }
          : section
      )
    );

    if (editedDocument) {
      const originalSection = sections.find(s => s.id === sectionId);
      if (originalSection && originalSection.value !== newValue) {
        setEditedDocument(prev => ({
          ...prev!,
          editedSections: {
            ...prev!.editedSections,
            [sectionId]: {
              original: originalSection.value,
              edited: newValue,
              editedAt: new Date(),
              editedBy: 'current_user'
            }
          },
          lastEditedAt: new Date()
        }));
        setHasUnsavedChanges(true);
      }
    }
  };

  // ドキュメント保存
  const handleSave = useCallback(() => {
    if (!editedDocument) return;

    // 編集内容をコンテンツに反映
    let updatedContent = editedDocument.content;
    sections.forEach(section => {
      const placeholder = `{{${section.id}}}`;
      updatedContent = updatedContent.replace(placeholder, section.value);
    });

    const documentToSave = {
      ...editedDocument,
      content: updatedContent
    };

    onSave?.(documentToSave);
    setHasUnsavedChanges(false);
  }, [editedDocument, sections, onSave]);

  // エクスポート処理
  const handleExport = (format: 'pdf' | 'word') => {
    handleSave();
    onExport?.(format);
  };

  // 編集履歴の表示
  const renderEditHistory = () => {
    if (!editedDocument || Object.keys(editedDocument.editedSections).length === 0) {
      return <div className="text-gray-500 text-sm">編集履歴はありません</div>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(editedDocument.editedSections).map(([sectionId, history]) => {
          const section = sections.find(s => s.id === sectionId);
          return (
            <div key={sectionId} className="border-l-2 border-blue-500 pl-4">
              <div className="font-semibold text-sm">{section?.label}</div>
              <div className="text-xs text-gray-600">
                {new Date(history.editedAt).toLocaleString('ja-JP')}
              </div>
              <div className="text-sm">
                <span className="line-through text-red-500">{history.original}</span>
                <span className="text-green-600 ml-2">{history.edited}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!editedDocument) {
    return <div>ドキュメントを生成中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">議題提案書エディター</h2>
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              未保存の変更
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="編集履歴"
          >
            <History className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg transition-colors ${
              isEditing ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            title={isEditing ? '編集終了' : '編集開始'}
          >
            <Edit3 className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`p-2 rounded-lg transition-colors ${
              hasUnsavedChanges
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="保存"
          >
            <Save className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="PDFエクスポート"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* メタ情報 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">提案ID:</span> {proposalId}
          </div>
          <div>
            <span className="font-semibold">委員会:</span> {committeeName}
          </div>
          <div>
            <span className="font-semibold">作成日:</span> {new Date(editedDocument.generatedAt).toLocaleDateString('ja-JP')}
          </div>
        </div>
      </div>

      {/* 編集履歴パネル */}
      {showHistory && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">編集履歴</h3>
          {renderEditHistory()}
        </div>
      )}

      {/* セクション編集フォーム */}
      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="border-b pb-4">
            <label className="block mb-2">
              <span className="font-semibold text-gray-700">
                {section.label}
                {section.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>

            {section.multiline ? (
              <textarea
                value={section.value}
                onChange={(e) => handleSectionEdit(section.id, e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isEditing
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
                rows={6}
              />
            ) : (
              <input
                type="text"
                value={section.value}
                onChange={(e) => handleSectionEdit(section.id, e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isEditing
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* フッター */}
      <div className="mt-6 pt-4 border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {editedDocument.lastEditedAt && (
            <span>最終編集: {new Date(editedDocument.lastEditedAt).toLocaleString('ja-JP')}</span>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('word')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Wordでエクスポート
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            PDFでエクスポート
          </button>
        </div>
      </div>
    </div>
  );
};