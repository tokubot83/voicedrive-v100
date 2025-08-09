/**
 * 面談データ移行サービス
 * 旧体系から新体系への安全な移行を提供
 */
import { InterviewBooking, InterviewType } from '../types/interview';
import { normalizeInterviewType, validateMigration } from '../utils/interviewMappingUtils';

export class InterviewDataMigrationService {
  private static instance: InterviewDataMigrationService;
  private migrationLog: any[] = [];
  
  private constructor() {}
  
  public static getInstance(): InterviewDataMigrationService {
    if (!InterviewDataMigrationService.instance) {
      InterviewDataMigrationService.instance = new InterviewDataMigrationService();
    }
    return InterviewDataMigrationService.instance;
  }
  
  /**
   * 既存の予約データを新体系に移行
   */
  async migrateBookingData(bookings: InterviewBooking[]): Promise<{
    success: boolean;
    migratedCount: number;
    backup: InterviewBooking[];
    errors: string[];
  }> {
    console.log('🔄 面談データ移行を開始します...');
    
    // バックアップ作成
    const backup = this.createBackup(bookings);
    console.log(`📦 ${bookings.length}件のデータをバックアップしました`);
    
    let migratedCount = 0;
    const errors: string[] = [];
    
    try {
      for (const booking of bookings) {
        const oldType = booking.interviewType;
        const newType = normalizeInterviewType(oldType);
        
        if (oldType !== newType) {
          // 移行ログを記録
          this.logMigration({
            bookingId: booking.id,
            oldType,
            newType,
            timestamp: new Date().toISOString()
          });
          
          // データを更新
          booking.interviewType = newType;
          
          // 特殊ケース：grievanceはworkplace_supportに統合
          if (oldType === 'grievance' || oldType === 'stress_care') {
            booking.interviewType = 'workplace_support';
            // カテゴリが未設定の場合はデフォルト値を設定
            if (!booking.interviewCategory) {
              booking.interviewCategory = 'work_environment';
            }
          }
          
          // performance_reviewはfeedbackに移行（カテゴリ不要）
          if (oldType === 'performance_review') {
            booking.interviewType = 'feedback';
            // feedbackはカテゴリ不要なので削除
            delete (booking as any).interviewCategory;
          }
          
          migratedCount++;
        }
      }
      
      // 移行後の検証
      const validation = validateMigration(bookings);
      if (!validation.isValid) {
        errors.push(...validation.issues);
      }
      
      console.log(`✅ ${migratedCount}件のデータを正常に移行しました`);
      
      return {
        success: errors.length === 0,
        migratedCount,
        backup,
        errors
      };
      
    } catch (error) {
      console.error('❌ データ移行中にエラーが発生しました:', error);
      
      // エラー時はバックアップから復元
      this.restoreFromBackup(bookings, backup);
      
      return {
        success: false,
        migratedCount: 0,
        backup,
        errors: [`移行エラー: ${error}`]
      };
    }
  }
  
  /**
   * バックアップの作成
   */
  private createBackup(data: InterviewBooking[]): InterviewBooking[] {
    return JSON.parse(JSON.stringify(data));
  }
  
  /**
   * バックアップからの復元
   */
  private restoreFromBackup(target: InterviewBooking[], backup: InterviewBooking[]): void {
    console.log('🔙 バックアップからデータを復元しています...');
    
    // 配列の内容を完全に置き換え
    target.length = 0;
    target.push(...backup);
    
    console.log('✅ データの復元が完了しました');
  }
  
  /**
   * 移行ログの記録
   */
  private logMigration(entry: any): void {
    this.migrationLog.push(entry);
  }
  
  /**
   * 移行ログの取得
   */
  getMigrationLog(): any[] {
    return [...this.migrationLog];
  }
  
  /**
   * 移行レポートの生成
   */
  generateMigrationReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalMigrations: this.migrationLog.length,
      migrations: this.migrationLog,
      mappingSummary: this.getMappingSummary()
    };
    
    return JSON.stringify(report, null, 2);
  }
  
  /**
   * マッピングサマリーの生成
   */
  private getMappingSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    
    for (const log of this.migrationLog) {
      const key = `${log.oldType} → ${log.newType}`;
      summary[key] = (summary[key] || 0) + 1;
    }
    
    return summary;
  }
  
  /**
   * 単一予約データの移行
   */
  migrateSingleBooking(booking: InterviewBooking): InterviewBooking {
    const migrated = { ...booking };
    const oldType = migrated.interviewType;
    const newType = normalizeInterviewType(oldType);
    
    if (oldType !== newType) {
      migrated.interviewType = newType;
      
      // 特殊ケースの処理
      if (oldType === 'grievance' || oldType === 'stress_care') {
        migrated.interviewType = 'workplace_support';
        if (!migrated.interviewCategory) {
          migrated.interviewCategory = 'work_environment';
        }
      }
      
      if (oldType === 'performance_review') {
        migrated.interviewType = 'feedback';
        delete (migrated as any).interviewCategory;
      }
    }
    
    return migrated;
  }
  
  /**
   * 移行が必要かチェック
   */
  needsMigration(bookings: InterviewBooking[]): boolean {
    const oldTypes = [
      'performance_review',
      'career_development',
      'stress_care',
      'ad_hoc',
      'grievance'
    ];
    
    return bookings.some(booking => 
      oldTypes.includes(booking.interviewType)
    );
  }
}