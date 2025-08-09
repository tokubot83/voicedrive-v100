/**
 * 面談システム移行テストケース
 * 第1段階実装の検証
 */
import { 
  normalizeInterviewType, 
  shouldShowCategorySelection,
  getAvailableCategories,
  validateMigration 
} from '../utils/interviewMappingUtils';
import { InterviewDataMigrationService } from '../services/InterviewDataMigrationService';
import { InterviewBooking } from '../types/interview';

describe('面談種別名称統一テスト', () => {
  
  describe('normalizeInterviewType', () => {
    test('旧名称を新名称に正しく変換する', () => {
      expect(normalizeInterviewType('performance_review')).toBe('feedback');
      expect(normalizeInterviewType('career_development')).toBe('career_support');
      expect(normalizeInterviewType('stress_care')).toBe('workplace_support');
      expect(normalizeInterviewType('ad_hoc')).toBe('individual_consultation');
      expect(normalizeInterviewType('grievance')).toBe('workplace_support');
    });
    
    test('新名称はそのまま返す', () => {
      expect(normalizeInterviewType('feedback')).toBe('feedback');
      expect(normalizeInterviewType('career_support')).toBe('career_support');
      expect(normalizeInterviewType('workplace_support')).toBe('workplace_support');
      expect(normalizeInterviewType('individual_consultation')).toBe('individual_consultation');
    });
    
    test('定期面談・特別面談は変更されない', () => {
      expect(normalizeInterviewType('new_employee_monthly')).toBe('new_employee_monthly');
      expect(normalizeInterviewType('regular_annual')).toBe('regular_annual');
      expect(normalizeInterviewType('management_biannual')).toBe('management_biannual');
      expect(normalizeInterviewType('return_to_work')).toBe('return_to_work');
      expect(normalizeInterviewType('incident_followup')).toBe('incident_followup');
      expect(normalizeInterviewType('exit_interview')).toBe('exit_interview');
    });
  });
  
  describe('カテゴリ選択条件テスト', () => {
    
    test('カテゴリ選択が不要な面談種別', () => {
      // 定期面談
      expect(shouldShowCategorySelection('new_employee_monthly')).toBe(false);
      expect(shouldShowCategorySelection('regular_annual')).toBe(false);
      expect(shouldShowCategorySelection('management_biannual')).toBe(false);
      
      // 特別面談
      expect(shouldShowCategorySelection('return_to_work')).toBe(false);
      expect(shouldShowCategorySelection('incident_followup')).toBe(false);
      expect(shouldShowCategorySelection('exit_interview')).toBe(false);
      
      // フィードバック面談
      expect(shouldShowCategorySelection('feedback')).toBe(false);
    });
    
    test('カテゴリ選択が必要な面談種別', () => {
      expect(shouldShowCategorySelection('career_support')).toBe(true);
      expect(shouldShowCategorySelection('workplace_support')).toBe(true);
      expect(shouldShowCategorySelection('individual_consultation')).toBe(true);
    });
    
    test('旧名称でもカテゴリ判定が正しく動作する', () => {
      // performance_review → feedback（カテゴリ不要）
      expect(shouldShowCategorySelection('performance_review')).toBe(false);
      
      // career_development → career_support（カテゴリ必要）
      expect(shouldShowCategorySelection('career_development')).toBe(true);
      
      // stress_care → workplace_support（カテゴリ必要）
      expect(shouldShowCategorySelection('stress_care')).toBe(true);
    });
  });
  
  describe('利用可能カテゴリ取得テスト', () => {
    
    test('キャリア系面談のカテゴリ', () => {
      const categories = getAvailableCategories('career_support');
      expect(categories).toContain('career_path');
      expect(categories).toContain('skill_development');
      expect(categories).toContain('promotion');
      expect(categories).toContain('transfer');
      expect(categories.length).toBe(4);
    });
    
    test('職場環境系面談のカテゴリ', () => {
      const categories = getAvailableCategories('workplace_support');
      expect(categories).toContain('work_environment');
      expect(categories).toContain('interpersonal');
      expect(categories).toContain('workload_balance');
      expect(categories).toContain('health_safety');
      expect(categories.length).toBe(4);
    });
    
    test('個別相談面談のカテゴリ', () => {
      const categories = getAvailableCategories('individual_consultation');
      expect(categories).toContain('performance');
      expect(categories).toContain('compensation');
      expect(categories).toContain('training');
      expect(categories).toContain('compliance');
      expect(categories).toContain('other');
      expect(categories.length).toBe(5);
    });
    
    test('カテゴリ不要な面談は空配列を返す', () => {
      expect(getAvailableCategories('feedback')).toEqual([]);
      expect(getAvailableCategories('new_employee_monthly')).toEqual([]);
    });
  });
});

describe('データ移行サービステスト', () => {
  let migrationService: InterviewDataMigrationService;
  
  beforeEach(() => {
    migrationService = InterviewDataMigrationService.getInstance();
  });
  
  describe('単一予約データの移行', () => {
    
    test('performance_reviewをfeedbackに移行', () => {
      const oldBooking = {
        id: 'test-1',
        interviewType: 'performance_review',
        interviewCategory: 'performance'
      } as InterviewBooking;
      
      const migrated = migrationService.migrateSingleBooking(oldBooking);
      
      expect(migrated.interviewType).toBe('feedback');
      expect(migrated.interviewCategory).toBeUndefined();
    });
    
    test('grievanceをworkplace_supportに移行', () => {
      const oldBooking = {
        id: 'test-2',
        interviewType: 'grievance'
      } as InterviewBooking;
      
      const migrated = migrationService.migrateSingleBooking(oldBooking);
      
      expect(migrated.interviewType).toBe('workplace_support');
      expect(migrated.interviewCategory).toBe('work_environment');
    });
  });
  
  describe('バッチ移行テスト', () => {
    
    test('複数データの一括移行', async () => {
      const bookings: InterviewBooking[] = [
        { id: '1', interviewType: 'performance_review' } as InterviewBooking,
        { id: '2', interviewType: 'career_development' } as InterviewBooking,
        { id: '3', interviewType: 'new_employee_monthly' } as InterviewBooking,
      ];
      
      const result = await migrationService.migrateBookingData(bookings);
      
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(2); // 2件が移行対象
      expect(result.backup.length).toBe(3);
      expect(bookings[0].interviewType).toBe('feedback');
      expect(bookings[1].interviewType).toBe('career_support');
      expect(bookings[2].interviewType).toBe('new_employee_monthly'); // 変更なし
    });
    
    test('移行が必要かチェック', () => {
      const needsMigration1 = [
        { interviewType: 'performance_review' } as InterviewBooking
      ];
      const needsMigration2 = [
        { interviewType: 'feedback' } as InterviewBooking
      ];
      
      expect(migrationService.needsMigration(needsMigration1)).toBe(true);
      expect(migrationService.needsMigration(needsMigration2)).toBe(false);
    });
  });
  
  describe('バリデーションテスト', () => {
    
    test('カテゴリ必須チェック', () => {
      const data = [
        { id: '1', interviewType: 'career_support' }, // カテゴリなし
        { id: '2', interviewType: 'feedback' } // カテゴリ不要
      ];
      
      const validation = validateMigration(data);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Missing required category for career_support in item 1');
      expect(validation.issues).not.toContain('Missing required category for feedback in item 2');
    });
  });
});

// 統合テスト
describe('エンドツーエンド統合テスト', () => {
  
  test('予約フロー全体のテスト', () => {
    // Step 1: 面談種別選択
    const selectedType = 'career_support';
    
    // Step 2: カテゴリ選択判定
    const needsCategory = shouldShowCategorySelection(selectedType);
    expect(needsCategory).toBe(true);
    
    // Step 3: 利用可能カテゴリ取得
    const categories = getAvailableCategories(selectedType);
    expect(categories.length).toBeGreaterThan(0);
    
    // Step 4: カテゴリ選択
    const selectedCategory = categories[0]; // 'career_path'
    
    // Step 5: 予約データ作成
    const bookingData = {
      interviewType: selectedType,
      interviewCategory: selectedCategory
    };
    
    // Step 6: バリデーション
    const validation = validateMigration([bookingData]);
    expect(validation.isValid).toBe(true);
  });
  
  test('カテゴリ不要な面談の予約フロー', () => {
    // フィードバック面談を選択
    const selectedType = 'feedback';
    
    // カテゴリ選択不要
    const needsCategory = shouldShowCategorySelection(selectedType);
    expect(needsCategory).toBe(false);
    
    // 予約データ作成（カテゴリなし）
    const bookingData = {
      interviewType: selectedType
    };
    
    // バリデーション
    const validation = validateMigration([bookingData]);
    expect(validation.isValid).toBe(true);
  });
});