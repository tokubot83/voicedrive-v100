/**
 * 文書エクスポートサービス
 * 作成日: 2025年10月13日
 *
 * 機能:
 * - PDF生成
 * - Word生成
 * - 一時ファイル管理
 *
 * 注: PDF/Word生成ライブラリ（pdfkit, docx）は未インストール
 * 現時点ではモック実装を提供
 */

import { ProposalDocument } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// ===========================
// 型定義
// ===========================

export type ExportFormat = 'pdf' | 'word';

interface ExportResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  expiresAt: Date;
}

// ===========================
// 設定
// ===========================

const TEMP_DIR = path.join(process.cwd(), 'temp', 'exports');
const FILE_EXPIRY_HOURS = 24;

// ===========================
// ファイル名生成
// ===========================

/**
 * エクスポートファイル名を生成
 *
 * フォーマット: 議題提案書_{委員会名}_{提案ID}_{YYYYMMDD}.{pdf|docx}
 *
 * @param document 提案書類
 * @param format エクスポート形式
 * @returns ファイル名
 */
function generateFileName(document: ProposalDocument, format: ExportFormat): string {
  const committeeNameSafe = (document.targetCommittee || '未定')
    .replace(/[^\w\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/g, '_');

  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const shortId = document.id.substring(0, 8);
  const extension = format === 'pdf' ? 'pdf' : 'docx';

  return `議題提案書_${committeeNameSafe}_${shortId}_${date}.${extension}`;
}

// ===========================
// 一時ディレクトリ管理
// ===========================

/**
 * 一時ディレクトリを作成
 */
async function ensureTempDir(): Promise<void> {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    console.log('[ensureTempDir] 一時ディレクトリ作成完了:', TEMP_DIR);
  } catch (error) {
    console.error('[ensureTempDir] 一時ディレクトリ作成エラー:', error);
    throw error;
  }
}

/**
 * 期限切れファイルを削除
 */
export async function cleanupExpiredFiles(): Promise<void> {
  try {
    await ensureTempDir();

    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const expiryMs = FILE_EXPIRY_HOURS * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);

      // ファイルが期限切れの場合、削除
      if (now - stats.mtimeMs > expiryMs) {
        await fs.unlink(filePath);
        deletedCount++;
        console.log('[cleanupExpiredFiles] 期限切れファイル削除:', file);
      }
    }

    console.log('[cleanupExpiredFiles] クリーンアップ完了:', {
      totalFiles: files.length,
      deletedCount
    });
  } catch (error) {
    console.error('[cleanupExpiredFiles] クリーンアップエラー:', error);
  }
}

// ===========================
// PDF生成（モック実装）
// ===========================

/**
 * PDFを生成
 *
 * 注: 実際のPDF生成には pdfkit ライブラリが必要
 * npm install pdfkit @types/pdfkit
 *
 * @param document 提案書類
 * @returns エクスポート結果
 */
export async function generatePDF(document: ProposalDocument): Promise<ExportResult> {
  console.log('[generatePDF] PDF生成開始:', document.id);

  await ensureTempDir();

  const fileName = generateFileName(document, 'pdf');
  const filePath = path.join(TEMP_DIR, fileName);

  // モック実装: 実際のPDF内容を生成
  const pdfContent = generateMockPDFContent(document);

  // ファイルに書き込み
  await fs.writeFile(filePath, pdfContent, 'utf-8');

  const stats = await fs.stat(filePath);
  const expiresAt = new Date(Date.now() + FILE_EXPIRY_HOURS * 60 * 60 * 1000);

  console.log('[generatePDF] PDF生成完了:', {
    fileName,
    fileSize: stats.size,
    expiresAt
  });

  return {
    filePath,
    fileName,
    fileSize: stats.size,
    downloadUrl: `/api/proposal-documents/download/${fileName}`,
    expiresAt
  };
}

/**
 * モックPDFコンテンツを生成
 *
 * 注: 実際の実装では pdfkit を使用してPDFバイナリを生成
 */
function generateMockPDFContent(document: ProposalDocument): string {
  return `
========================================
議題提案書
========================================

提案ID: ${document.id}
作成日: ${new Date(document.createdAt).toLocaleString('ja-JP')}

----------------------------------------
1. 議題名
----------------------------------------
${document.title}

----------------------------------------
2. 議題レベル
----------------------------------------
${document.agendaLevel}

----------------------------------------
3. 対象委員会
----------------------------------------
${document.targetCommittee || '未定'}

----------------------------------------
4. 要約
----------------------------------------
${document.summary}

----------------------------------------
5. 背景・現状の課題
----------------------------------------
${document.background}

----------------------------------------
6. 目的
----------------------------------------
${document.objectives}

----------------------------------------
7. 期待される効果
----------------------------------------
${document.expectedEffects}

----------------------------------------
8. 懸念事項
----------------------------------------
${document.concerns}

----------------------------------------
9. 対策案
----------------------------------------
${document.counterMeasures}

----------------------------------------
10. 管理者メモ
----------------------------------------
${document.managerNotes || 'なし'}

----------------------------------------
11. 追加コンテキスト
----------------------------------------
${document.additionalContext || 'なし'}

----------------------------------------
12. 投票分析
----------------------------------------
${JSON.stringify(document.voteAnalysis, null, 2)}

----------------------------------------
13. コメント分析
----------------------------------------
${JSON.stringify(document.commentAnalysis, null, 2)}

========================================
このファイルは ${new Date(Date.now() + FILE_EXPIRY_HOURS * 60 * 60 * 1000).toLocaleString('ja-JP')} まで有効です。
========================================

注: これはモック実装です。実際のPDF生成には pdfkit ライブラリを使用してください。
`;
}

// ===========================
// Word生成（モック実装）
// ===========================

/**
 * Word文書を生成
 *
 * 注: 実際のWord生成には docx ライブラリが必要
 * npm install docx
 *
 * @param document 提案書類
 * @returns エクスポート結果
 */
export async function generateWord(document: ProposalDocument): Promise<ExportResult> {
  console.log('[generateWord] Word生成開始:', document.id);

  await ensureTempDir();

  const fileName = generateFileName(document, 'word');
  const filePath = path.join(TEMP_DIR, fileName);

  // モック実装: 実際のWord内容を生成
  const wordContent = generateMockWordContent(document);

  // ファイルに書き込み
  await fs.writeFile(filePath, wordContent, 'utf-8');

  const stats = await fs.stat(filePath);
  const expiresAt = new Date(Date.now() + FILE_EXPIRY_HOURS * 60 * 60 * 1000);

  console.log('[generateWord] Word生成完了:', {
    fileName,
    fileSize: stats.size,
    expiresAt
  });

  return {
    filePath,
    fileName,
    fileSize: stats.size,
    downloadUrl: `/api/proposal-documents/download/${fileName}`,
    expiresAt
  };
}

/**
 * モックWordコンテンツを生成
 *
 * 注: 実際の実装では docx ライブラリを使用してWord文書を生成
 */
function generateMockWordContent(document: ProposalDocument): string {
  return `
議題提案書

提案ID: ${document.id}
作成日: ${new Date(document.createdAt).toLocaleString('ja-JP')}

1. 議題名
${document.title}

2. 議題レベル
${document.agendaLevel}

3. 対象委員会
${document.targetCommittee || '未定'}

4. 要約
${document.summary}

5. 背景・現状の課題
${document.background}

6. 目的
${document.objectives}

7. 期待される効果
${document.expectedEffects}

8. 懸念事項
${document.concerns}

9. 対策案
${document.counterMeasures}

10. 管理者メモ
${document.managerNotes || 'なし'}

11. 追加コンテキスト
${document.additionalContext || 'なし'}

12. 投票分析
${JSON.stringify(document.voteAnalysis, null, 2)}

13. コメント分析
${JSON.stringify(document.commentAnalysis, null, 2)}

このファイルは ${new Date(Date.now() + FILE_EXPIRY_HOURS * 60 * 60 * 1000).toLocaleString('ja-JP')} まで有効です。

注: これはモック実装です。実際のWord生成には docx ライブラリを使用してください。
`;
}

// ===========================
// エクスポート
// ===========================

export const documentExportService = {
  generatePDF,
  generateWord,
  cleanupExpiredFiles
};

export default documentExportService;
