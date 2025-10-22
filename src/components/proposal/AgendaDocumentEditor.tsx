import React, { useState, useEffect, useCallback } from 'react';
import { Save, Download, History, Edit3, FileText, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AgendaDocumentEditorProps {
  documentId: string;
  userId: string;
  userLevel: number;
  onSaveSuccess?: (document: any) => void;
  onExportSuccess?: (url: string) => void;
}

interface EditableSection {
  id: string;
  label: string;
  value: string;
  multiline?: boolean;
  required?: boolean;
}

export const AgendaDocumentEditor: React.FC<AgendaDocumentEditorProps> = ({
  documentId,
  userId,
  userLevel,
  onSaveSuccess,
  onExportSuccess
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // ドキュメントを読み込む
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `/api/proposal-documents/${documentId}`,
          {
            params: { userId, userLevel }
          }
        );

        const { document: doc, canEdit: editPermission, editHistory } = response.data;

        setDocument(doc);
        setCanEdit(editPermission);
        setAuditLogs(editHistory || []);

        // セクション分割
        setSections([
          {
            id: 'title',
            label: '議題名',
            value: doc.title || '',
            multiline: false,
            required: true
          },
          {
            id: 'background',
            label: '背景・現状の課題',
            value: doc.background || '',
            multiline: true,
            required: false
          },
          {
            id: 'objectives',
            label: '提案内容',
            value: doc.objectives || '',
            multiline: true,
            required: true
          },
          {
            id: 'expectedEffects',
            label: '期待される効果',
            value: doc.expectedEffects || '',
            multiline: true,
            required: false
          },
          {
            id: 'concerns',
            label: '懸念事項',
            value: doc.concerns || '',
            multiline: true,
            required: false
          },
          {
            id: 'counterMeasures',
            label: '対応策',
            value: doc.counterMeasures || '',
            multiline: true,
            required: false
          },
          {
            id: 'managerNotes',
            label: '管理者メモ',
            value: doc.managerNotes || '',
            multiline: true,
            required: false
          }
        ]);

        setLoading(false);
      } catch (err: any) {
        console.error('ドキュメント読み込みエラー:', err);
        setError(err.response?.data?.message || 'ドキュメントの読み込みに失敗しました');
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId, userId, userLevel]);

  // セクション編集
  const handleSectionEdit = (sectionId: string, newValue: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, value: newValue }
          : section
      )
    );
    setHasUnsavedChanges(true);
  };

  // ドキュメント保存
  const handleSave = useCallback(async () => {
    if (!document) return;

    try {
      setLoading(true);
      setError(null);

      // セクションデータを更新データに変換
      const updateData: any = {
        userId
      };

      sections.forEach(section => {
        updateData[section.id] = section.value;
      });

      const response = await axios.put(
        `/api/proposal-documents/${documentId}`,
        updateData
      );

      const { document: updatedDoc } = response.data;
      setDocument(updatedDoc);
      setHasUnsavedChanges(false);

      if (onSaveSuccess) {
        onSaveSuccess(updatedDoc);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('保存エラー:', err);
      setError(err.response?.data?.message || '保存に失敗しました');
      setLoading(false);
    }
  }, [document, documentId, userId, sections, onSaveSuccess]);

  // エクスポート処理
  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `/api/proposal-documents/${documentId}/export`,
        { format, userId }
      );

      const { downloadUrl } = response.data;

      // ダウンロードリンクを開く
      window.open(downloadUrl, '_blank');

      if (onExportSuccess) {
        onExportSuccess(downloadUrl);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('エクスポートエラー:', err);
      setError(err.response?.data?.message || 'エクスポートに失敗しました');
      setLoading(false);
    }
  };

  // 編集履歴の表示
  const renderEditHistory = () => {
    if (!auditLogs || auditLogs.length === 0) {
      return <div className="text-gray-500 text-sm">編集履歴はありません</div>;
    }

    return (
      <div className="space-y-2">
        {auditLogs.map((log: any) => (
          <div key={log.id} className="border-l-2 border-blue-500 pl-4">
            <div className="font-semibold text-sm">{log.action}</div>
            <div className="text-xs text-gray-600">
              {new Date(log.timestamp).toLocaleString('ja-JP')} - {log.userName}
            </div>
            {log.changedFields && (
              <div className="text-sm text-gray-700">
                変更フィールド: {log.changedFields.fields?.join(', ') || ''}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ローディング表示
  if (loading && !document) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">ドキュメントを読み込み中...</span>
      </div>
    );
  }

  // エラー表示
  if (error && !document) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-700">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span className="font-semibold">エラー</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!document) {
    return <div>ドキュメントが見つかりません</div>;
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
            disabled={!canEdit}
            className={`p-2 rounded-lg transition-colors ${
              !canEdit
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isEditing
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
            }`}
            title={!canEdit ? '編集権限がありません' : isEditing ? '編集終了' : '編集開始'}
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
            <span className="font-semibold">提案ID:</span> {document.id}
          </div>
          <div>
            <span className="font-semibold">委員会:</span> {document.targetCommittee || '未定'}
          </div>
          <div>
            <span className="font-semibold">作成日:</span> {new Date(document.createdAt).toLocaleDateString('ja-JP')}
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
          {document.updatedAt && (
            <span>最終編集: {new Date(document.updatedAt).toLocaleString('ja-JP')}</span>
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