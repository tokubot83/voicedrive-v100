/**
 * 面談サマリ管理サービス
 * 医療システムから受信した面談サマリの管理を行う
 */

import { InterviewSummary, InterviewType } from '../types/interviewSummary';

export class InterviewSummaryService {
  private static instance: InterviewSummaryService;
  private readonly STORAGE_KEY = 'interviewSummaries';

  private constructor() {}

  public static getInstance(): InterviewSummaryService {
    if (!InterviewSummaryService.instance) {
      InterviewSummaryService.instance = new InterviewSummaryService();
    }
    return InterviewSummaryService.instance;
  }

  /**
   * 職員IDに紐づく面談サマリ一覧を取得
   */
  public getSummariesByStaffId(staffId: string): InterviewSummary[] {
    try {
      const allSummaries = this.getAllSummaries();
      return allSummaries
        .filter(summary => summary.staffId === staffId)
        .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
    } catch (error) {
      console.error('Error getting summaries by staff ID:', error);
      return [];
    }
  }

  /**
   * 面談IDに紐づくサマリを取得
   */
  public getSummaryByInterviewId(interviewId: string): InterviewSummary | null {
    try {
      const allSummaries = this.getAllSummaries();
      return allSummaries.find(summary => summary.interviewId === interviewId) || null;
    } catch (error) {
      console.error('Error getting summary by interview ID:', error);
      return null;
    }
  }

  /**
   * サマリIDで特定のサマリを取得
   */
  public getSummaryById(summaryId: string): InterviewSummary | null {
    try {
      const allSummaries = this.getAllSummaries();
      return allSummaries.find(summary => summary.summaryId === summaryId) || null;
    } catch (error) {
      console.error('Error getting summary by ID:', error);
      return null;
    }
  }

  /**
   * 面談種類でフィルタリング
   */
  public getSummariesByType(staffId: string, type: InterviewType): InterviewSummary[] {
    try {
      const staffSummaries = this.getSummariesByStaffId(staffId);
      return staffSummaries.filter(summary => summary.interviewType === type);
    } catch (error) {
      console.error('Error getting summaries by type:', error);
      return [];
    }
  }

  /**
   * 期間でフィルタリング
   */
  public getSummariesByDateRange(
    staffId: string,
    startDate: string,
    endDate: string
  ): InterviewSummary[] {
    try {
      const staffSummaries = this.getSummariesByStaffId(staffId);
      return staffSummaries.filter(summary => {
        const interviewDate = new Date(summary.interviewDate);
        return interviewDate >= new Date(startDate) && interviewDate <= new Date(endDate);
      });
    } catch (error) {
      console.error('Error getting summaries by date range:', error);
      return [];
    }
  }

  /**
   * 全サマリを取得（内部用）
   */
  private getAllSummaries(): InterviewSummary[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading summaries from localStorage:', error);
      return [];
    }
  }

  /**
   * サマリを保存（受信API経由で呼ばれる想定）
   */
  public saveSummary(summary: InterviewSummary): void {
    try {
      const allSummaries = this.getAllSummaries();

      // 既存のサマリIDがあれば上書き、なければ追加
      const index = allSummaries.findIndex(s => s.summaryId === summary.summaryId);
      if (index >= 0) {
        allSummaries[index] = summary;
      } else {
        allSummaries.push(summary);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSummaries));
      console.log('Summary saved:', summary.summaryId);
    } catch (error) {
      console.error('Error saving summary:', error);
      throw error;
    }
  }

  /**
   * サマリを削除
   */
  public deleteSummary(summaryId: string): boolean {
    try {
      const allSummaries = this.getAllSummaries();
      const filtered = allSummaries.filter(s => s.summaryId !== summaryId);

      if (filtered.length === allSummaries.length) {
        return false; // 削除対象が見つからなかった
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('Summary deleted:', summaryId);
      return true;
    } catch (error) {
      console.error('Error deleting summary:', error);
      return false;
    }
  }

  /**
   * 全サマリをクリア（テスト用）
   */
  public clearAllSummaries(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('All summaries cleared');
    } catch (error) {
      console.error('Error clearing summaries:', error);
    }
  }

  /**
   * サマリ統計情報を取得
   */
  public getStatistics(staffId: string): {
    total: number;
    regular: number;
    support: number;
    special: number;
    thisYear: number;
  } {
    try {
      const summaries = this.getSummariesByStaffId(staffId);
      const currentYear = new Date().getFullYear();

      return {
        total: summaries.length,
        regular: summaries.filter(s => s.interviewType === 'regular').length,
        support: summaries.filter(s => s.interviewType === 'support').length,
        special: summaries.filter(s => s.interviewType === 'special').length,
        thisYear: summaries.filter(s =>
          new Date(s.interviewDate).getFullYear() === currentYear
        ).length
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total: 0,
        regular: 0,
        support: 0,
        special: 0,
        thisYear: 0
      };
    }
  }
}

export default InterviewSummaryService;
