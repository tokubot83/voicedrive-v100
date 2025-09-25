/**
 * 議題提案書サービス
 * 編集、履歴管理、エクスポート機能を提供
 */

import { jsPDF } from 'jspdf';

export interface AgendaDocumentData {
  proposalId: string;
  committeeId: string;
  documentType: string;
  content: string;
  sections: DocumentSection[];
  metadata: DocumentMetadata;
  editHistory: EditHistoryEntry[];
  generatedAt: Date;
  lastEditedAt?: Date;
}

export interface DocumentSection {
  id: string;
  label: string;
  content: string;
  isEdited: boolean;
  isRequired: boolean;
}

export interface DocumentMetadata {
  proposer: string;
  department: string;
  facility: string;
  votingScore: number;
  agreementRate: number;
  totalVotes: number;
}

export interface EditHistoryEntry {
  sectionId: string;
  editedBy: string;
  editedAt: Date;
  previousContent: string;
  newContent: string;
  changeType: 'edit' | 'add' | 'delete';
}

export class AgendaDocumentService {
  private documents: Map<string, AgendaDocumentData> = new Map();
  private editHistories: Map<string, EditHistoryEntry[]> = new Map();

  /**
   * ドキュメント保存
   */
  saveDocument(document: AgendaDocumentData): void {
    this.documents.set(document.proposalId, {
      ...document,
      lastEditedAt: new Date()
    });
  }

  /**
   * ドキュメント取得
   */
  getDocument(proposalId: string): AgendaDocumentData | null {
    return this.documents.get(proposalId) || null;
  }

  /**
   * セクション編集
   */
  editSection(
    proposalId: string,
    sectionId: string,
    newContent: string,
    editedBy: string
  ): void {
    const document = this.documents.get(proposalId);
    if (!document) return;

    const section = document.sections.find(s => s.id === sectionId);
    if (!section) return;

    // 編集履歴に追加
    const historyEntry: EditHistoryEntry = {
      sectionId,
      editedBy,
      editedAt: new Date(),
      previousContent: section.content,
      newContent,
      changeType: 'edit'
    };

    this.addToHistory(proposalId, historyEntry);

    // セクション更新
    section.content = newContent;
    section.isEdited = true;

    // ドキュメント更新
    document.lastEditedAt = new Date();
    this.documents.set(proposalId, document);
  }

  /**
   * 編集履歴追加
   */
  private addToHistory(proposalId: string, entry: EditHistoryEntry): void {
    const history = this.editHistories.get(proposalId) || [];
    history.push(entry);
    this.editHistories.set(proposalId, history);

    // ドキュメントの履歴も更新
    const document = this.documents.get(proposalId);
    if (document) {
      document.editHistory.push(entry);
    }
  }

  /**
   * 編集履歴取得
   */
  getEditHistory(proposalId: string): EditHistoryEntry[] {
    return this.editHistories.get(proposalId) || [];
  }

  /**
   * 特定時点へのロールバック
   */
  rollbackToVersion(proposalId: string, timestamp: Date): void {
    const history = this.getEditHistory(proposalId);
    const document = this.documents.get(proposalId);
    if (!document) return;

    // 指定時点以降の編集を逆順に取り消し
    const editsToRevert = history.filter(h => h.editedAt > timestamp);
    editsToRevert.reverse().forEach(edit => {
      const section = document.sections.find(s => s.id === edit.sectionId);
      if (section) {
        section.content = edit.previousContent;
        section.isEdited = false;
      }
    });

    this.saveDocument(document);
  }

  /**
   * PDFエクスポート
   */
  async exportToPDF(proposalId: string): Promise<Blob> {
    const document = this.documents.get(proposalId);
    if (!document) throw new Error('Document not found');

    // 日本語フォント対応の設定が必要
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ヘッダー
    pdf.setFontSize(16);
    pdf.text(`議題提案書`, 105, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`提案ID: ${document.proposalId}`, 20, 35);
    pdf.text(`委員会: ${document.committeeId}`, 20, 40);
    pdf.text(`作成日: ${document.generatedAt.toLocaleDateString('ja-JP')}`, 20, 45);

    // セクションごとに内容を追加
    let yPosition = 60;
    document.sections.forEach(section => {
      pdf.setFontSize(12);
      pdf.text(section.label, 20, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      const lines = this.splitTextToLines(section.content, 170);
      lines.forEach(line => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 20, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    });

    // 編集履歴（最後のページ）
    if (document.editHistory.length > 0) {
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text('編集履歴', 20, 20);

      let historyY = 30;
      document.editHistory.slice(-5).forEach(entry => {
        pdf.setFontSize(9);
        pdf.text(
          `${entry.editedAt.toLocaleString('ja-JP')} - ${entry.editedBy}`,
          20,
          historyY
        );
        historyY += 5;
      });
    }

    return pdf.output('blob');
  }

  /**
   * Wordエクスポート（HTML形式）
   */
  exportToWord(proposalId: string): string {
    const document = this.documents.get(proposalId);
    if (!document) throw new Error('Document not found');

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: "メイリオ", "Meiryo", sans-serif; }
          h1 { text-align: center; border-bottom: 2px solid #333; }
          h2 { color: #333; margin-top: 20px; }
          .metadata { background: #f5f5f5; padding: 10px; margin: 10px 0; }
          .section { margin: 20px 0; }
          .edited { background-color: #fffacd; }
        </style>
      </head>
      <body>
        <h1>議題提案書</h1>

        <div class="metadata">
          <p><strong>提案ID:</strong> ${document.proposalId}</p>
          <p><strong>委員会:</strong> ${document.committeeId}</p>
          <p><strong>作成日:</strong> ${document.generatedAt.toLocaleDateString('ja-JP')}</p>
          ${document.lastEditedAt ? `<p><strong>最終編集:</strong> ${document.lastEditedAt.toLocaleDateString('ja-JP')}</p>` : ''}
        </div>
    `;

    document.sections.forEach(section => {
      html += `
        <div class="section ${section.isEdited ? 'edited' : ''}">
          <h2>${section.label}</h2>
          <p>${section.content.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    });

    // メタデータ追加
    html += `
        <div class="section">
          <h2>投票結果</h2>
          <ul>
            <li>総投票スコア: ${document.metadata.votingScore}点</li>
            <li>賛成率: ${document.metadata.agreementRate}%</li>
            <li>総投票数: ${document.metadata.totalVotes}票</li>
          </ul>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * テキストを行に分割（PDF用）
   */
  private splitTextToLines(text: string, maxWidth: number): string[] {
    // 簡易的な実装（実際は文字幅計算が必要）
    const words = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if (currentLine.length + word.length > maxWidth / 3) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 変更差分の計算
   */
  calculateDiff(
    proposalId: string,
    fromDate?: Date,
    toDate?: Date
  ): Array<{
    sectionId: string;
    changes: number;
    addedChars: number;
    deletedChars: number;
  }> {
    const history = this.getEditHistory(proposalId);
    const filtered = history.filter(h => {
      if (fromDate && h.editedAt < fromDate) return false;
      if (toDate && h.editedAt > toDate) return false;
      return true;
    });

    const sectionChanges = new Map<string, {
      changes: number;
      addedChars: number;
      deletedChars: number;
    }>();

    filtered.forEach(entry => {
      const existing = sectionChanges.get(entry.sectionId) || {
        changes: 0,
        addedChars: 0,
        deletedChars: 0
      };

      existing.changes++;
      const lengthDiff = entry.newContent.length - entry.previousContent.length;
      if (lengthDiff > 0) {
        existing.addedChars += lengthDiff;
      } else {
        existing.deletedChars += Math.abs(lengthDiff);
      }

      sectionChanges.set(entry.sectionId, existing);
    });

    return Array.from(sectionChanges.entries()).map(([sectionId, stats]) => ({
      sectionId,
      ...stats
    }));
  }
}

export const agendaDocumentService = new AgendaDocumentService();