/**
 * VoiceDrive × 医療職員管理システム 統合テスト
 * 実施指示書に基づくテストシナリオ
 */

import { IntegrationTestClient, BookingRequest } from './apiClient';
import { normalizeInterviewType, shouldShowCategorySelection } from '../../utils/interviewMappingUtils';

describe('VoiceDrive統合テスト', () => {
  let client: IntegrationTestClient;
  const createdBookingIds: string[] = [];
  
  beforeAll(() => {
    client = new IntegrationTestClient('http://localhost:3000');
  });
  
  afterAll(async () => {
    // クリーンアップ：作成した予約を削除
    for (const bookingId of createdBookingIds) {
      await client.deleteBooking(bookingId);
    }
  });
  
  describe('シナリオ1: カテゴリ不要な面談の予約', () => {
    
    test('1.1 定期面談の予約テスト（regular_annual）', async () => {
      const request: BookingRequest = {
        employeeId: 'E001',
        employeeName: '山田太郎',
        employeeEmail: 'yamada@example.com',
        facility: '小原病院',
        department: '内科',
        position: '看護師',
        interviewType: 'regular_annual',
        bookingDate: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00',
        requestedTopics: ['年間振り返り', '来年度目標'],
        urgencyLevel: 'medium'
      };
      
      // カテゴリ不要の確認
      expect(shouldShowCategorySelection('regular_annual')).toBe(false);
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(true);
      expect(response.bookingId).toBeDefined();
      
      if (response.bookingId) {
        createdBookingIds.push(response.bookingId);
      }
    });
    
    test('1.2 特別面談の予約テスト（return_to_work）', async () => {
      const request: BookingRequest = {
        employeeId: 'E002',
        employeeName: '佐藤花子',
        employeeEmail: 'sato@example.com',
        facility: '小原病院',
        department: '外科',
        position: '医師',
        interviewType: 'return_to_work',
        bookingDate: '2024-12-26',
        startTime: '14:00',
        endTime: '15:00',
        requestedTopics: ['復職準備', '業務調整'],
        urgencyLevel: 'high'
      };
      
      expect(shouldShowCategorySelection('return_to_work')).toBe(false);
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(true);
      expect(response.bookingId).toBeDefined();
      
      if (response.bookingId) {
        createdBookingIds.push(response.bookingId);
      }
    });
    
    test('1.3 フィードバック面談の予約テスト（feedback）', async () => {
      const request: BookingRequest = {
        employeeId: 'E003',
        employeeName: '鈴木一郎',
        employeeEmail: 'suzuki@example.com',
        facility: '小原病院',
        department: '管理部',
        position: '事務員',
        interviewType: 'feedback',
        bookingDate: '2024-12-27',
        startTime: '16:00',
        endTime: '16:30',
        requestedTopics: ['業務改善提案'],
        urgencyLevel: 'low'
      };
      
      // feedbackはサポート面談だがカテゴリ不要
      expect(shouldShowCategorySelection('feedback')).toBe(false);
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(true);
      expect(response.bookingId).toBeDefined();
      
      if (response.bookingId) {
        createdBookingIds.push(response.bookingId);
      }
    });
    
    test('全てのカテゴリ不要な面談種別の確認', async () => {
      const categoriesNotRequired = [
        'new_employee_monthly',
        'regular_annual',
        'management_biannual',
        'return_to_work',
        'incident_followup',
        'exit_interview',
        'feedback'
      ];
      
      for (const type of categoriesNotRequired) {
        expect(shouldShowCategorySelection(type)).toBe(false);
      }
    });
  });
  
  describe('シナリオ2: カテゴリ必須な面談の予約', () => {
    
    test('2.1 キャリア系面談の予約テスト（career_support）', async () => {
      const request: BookingRequest = {
        employeeId: 'E004',
        employeeName: '田中美香',
        employeeEmail: 'tanaka@example.com',
        facility: '小原病院',
        department: '看護部',
        position: '主任看護師',
        interviewType: 'career_support',
        interviewCategory: 'career_path',
        bookingDate: '2024-12-28',
        startTime: '13:00',
        endTime: '14:00',
        requestedTopics: ['キャリアプラン', '昇進準備'],
        urgencyLevel: 'medium'
      };
      
      expect(shouldShowCategorySelection('career_support')).toBe(true);
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(true);
      expect(response.bookingId).toBeDefined();
      
      if (response.bookingId) {
        createdBookingIds.push(response.bookingId);
      }
    });
    
    test('2.2 職場環境系面談の予約テスト（workplace_support）', async () => {
      const request: BookingRequest = {
        employeeId: 'E005',
        employeeName: '高橋健太',
        employeeEmail: 'takahashi@example.com',
        facility: '小原病院',
        department: 'リハビリ科',
        position: '理学療法士',
        interviewType: 'workplace_support',
        interviewCategory: 'work_environment',
        bookingDate: '2024-12-29',
        startTime: '11:00',
        endTime: '12:00',
        requestedTopics: ['職場環境改善', '設備要望'],
        urgencyLevel: 'medium'
      };
      
      expect(shouldShowCategorySelection('workplace_support')).toBe(true);
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(true);
      expect(response.bookingId).toBeDefined();
      
      if (response.bookingId) {
        createdBookingIds.push(response.bookingId);
      }
    });
    
    test('2.3 個別相談面談の予約テスト（individual_consultation）', async () => {
      const request: BookingRequest = {
        employeeId: 'E006',
        employeeName: '渡辺由美',
        employeeEmail: 'watanabe@example.com',
        facility: '小原病院',
        department: '薬剤部',
        position: '薬剤師',
        interviewType: 'individual_consultation',
        interviewCategory: 'other',
        bookingDate: '2024-12-30',
        startTime: '15:00',
        endTime: '16:00',
        requestedTopics: ['個人的な相談'],
        urgencyLevel: 'high'
      };
      
      expect(shouldShowCategorySelection('individual_consultation')).toBe(true);
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(true);
      expect(response.bookingId).toBeDefined();
      
      if (response.bookingId) {
        createdBookingIds.push(response.bookingId);
      }
    });
  });
  
  describe('シナリオ3: エラーケースのテスト', () => {
    
    test('3.1 カテゴリが必須なのに未提供', async () => {
      const request: BookingRequest = {
        employeeId: 'E007',
        employeeName: '中村太一',
        employeeEmail: 'nakamura@example.com',
        facility: '小原病院',
        department: '検査部',
        position: '臨床検査技師',
        interviewType: 'career_support',
        // interviewCategory を意図的に省略
        bookingDate: '2024-12-31',
        startTime: '10:00',
        endTime: '11:00',
        requestedTopics: ['スキル開発'],
        urgencyLevel: 'medium'
      };
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(false);
      expect(response.code).toBe(400);
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0]).toContain('interviewCategory');
    });
    
    test('3.2 必須項目の欠落', async () => {
      const request = {
        employeeName: '山田太郎',
        interviewType: 'regular_annual'
      } as BookingRequest;
      
      const response = await client.createBooking(request);
      
      expect(response.success).toBe(false);
      expect(response.code).toBe(400);
      expect(response.errors).toBeDefined();
      expect(response.errors?.length).toBeGreaterThan(0);
    });
  });
  
  describe('シナリオ4: 予約一覧取得テスト', () => {
    
    test('4.1 指定日付の予約一覧を取得', async () => {
      const bookings = await client.getBookings('2024-12-25');
      
      expect(Array.isArray(bookings)).toBe(true);
      
      // カテゴリありなしの面談が混在していることを確認
      if (bookings.length > 0) {
        const hasWithCategory = bookings.some((b: any) => b.interviewCategory);
        const hasWithoutCategory = bookings.some((b: any) => !b.interviewCategory);
        
        console.log('カテゴリあり:', hasWithCategory);
        console.log('カテゴリなし:', hasWithoutCategory);
      }
    });
  });
  
  describe('シナリオ5: 予約削除テスト', () => {
    
    test('5.1 予約の削除', async () => {
      // テスト用の予約を作成
      const createRequest: BookingRequest = {
        employeeId: 'E999',
        employeeName: 'テストユーザー',
        employeeEmail: 'test@example.com',
        facility: '小原病院',
        department: 'テスト部',
        position: 'テスト職',
        interviewType: 'feedback',
        bookingDate: '2024-12-31',
        startTime: '09:00',
        endTime: '09:30',
        requestedTopics: ['テスト'],
        urgencyLevel: 'low'
      };
      
      const createResponse = await client.createBooking(createRequest);
      expect(createResponse.success).toBe(true);
      
      if (createResponse.bookingId) {
        // 作成した予約を削除
        const deleteResponse = await client.deleteBooking(createResponse.bookingId);
        
        expect(deleteResponse.success).toBe(true);
        expect(deleteResponse.message).toBeDefined();
      }
    });
  });
  
  describe('名称マッピングの確認', () => {
    
    test('旧名称でのリクエストも受け付けられること', async () => {
      const oldNameMappings = [
        { old: 'performance_review', new: 'feedback' },
        { old: 'career_development', new: 'career_support' },
        { old: 'stress_care', new: 'workplace_support' },
        { old: 'ad_hoc', new: 'individual_consultation' }
      ];
      
      for (const mapping of oldNameMappings) {
        const normalized = normalizeInterviewType(mapping.old);
        expect(normalized).toBe(mapping.new);
      }
    });
    
    test('旧名称（performance_review）での予約テスト', async () => {
      const request: BookingRequest = {
        employeeId: 'E008',
        employeeName: '旧名称テスト',
        employeeEmail: 'old@example.com',
        facility: '小原病院',
        department: 'テスト部',
        position: 'テスト職',
        interviewType: 'performance_review', // 旧名称を使用
        bookingDate: '2024-12-31',
        startTime: '17:00',
        endTime: '17:30',
        requestedTopics: ['旧名称テスト'],
        urgencyLevel: 'low'
      };
      
      // 内部的にfeedbackに変換されることを確認
      const normalizedType = normalizeInterviewType(request.interviewType);
      expect(normalizedType).toBe('feedback');
      expect(shouldShowCategorySelection(normalizedType)).toBe(false);
      
      const response = await client.createBooking(request);
      
      // APIが旧名称を受け付けるか、または変換して処理するか
      // （実装によって異なる）
      if (response.bookingId) {
        createdBookingIds.push(response.bookingId);
      }
    });
  });
});