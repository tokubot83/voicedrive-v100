/**
 * 医療チームシステム統合サービス
 * VoiceDriveと医療チームシステム間のデータ連携を管理
 */

import {
  VoiceDrivePriority,
  MedicalTeamPriority,
  convertToMedicalTeamPriority,
  convertFromMedicalTeamPriority,
  prepareMedicalTeamApiRequest
} from '../utils/priorityMapping';
import { HRAnnouncement } from '../types/hr-announcements';
import { InterviewBooking } from '../types/interview';
import NotificationService from './NotificationService';

export interface MedicalTeamNotification {
  id: string;
  title: string;
  message: string;
  priority: MedicalTeamPriority;
  category: string;
  timestamp: string;
  data?: any;
}

export interface MedicalTeamBookingRequest {
  employeeId: string;
  requestDate: string;
  priority: MedicalTeamPriority;
  category: string;
  preferredTimes?: string[];
  notes?: string;
}

class MedicalIntegrationService {
  private static instance: MedicalIntegrationService;
  private apiBaseUrl: string;
  private notificationService: NotificationService;

  private constructor() {
    // 医療チームAPIのベースURL（環境変数から取得）
    this.apiBaseUrl = process.env.REACT_APP_MEDICAL_API_URL || 'https://api.medical-team.example.com';
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): MedicalIntegrationService {
    if (!MedicalIntegrationService.instance) {
      MedicalIntegrationService.instance = new MedicalIntegrationService();
    }
    return MedicalIntegrationService.instance;
  }

  /**
   * VoiceDriveのお知らせを医療チームシステムに送信
   */
  public async sendAnnouncementToMedicalTeam(announcement: HRAnnouncement): Promise<boolean> {
    try {
      // 優先度を医療チーム形式に変換
      const medicalPriority = convertToMedicalTeamPriority(announcement.priority);

      const payload = {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: medicalPriority,
        category: announcement.category,
        publishAt: announcement.publishAt.toISOString(),
        targetDepartments: announcement.targetAudience.departments || [],
        requireResponse: announcement.requireResponse,
        actionType: announcement.actionButton?.type === 'medical_system'
          ? announcement.actionButton.url
          : null
      };

      console.log('📤 医療チームへのお知らせ送信:', {
        originalPriority: announcement.priority,
        convertedPriority: medicalPriority,
        payload
      });

      // 実際のAPI呼び出し（現在はモック）
      const response = await this.mockApiCall('/announcements', 'POST', payload);

      return response.success;
    } catch (error) {
      console.error('医療チームへのお知らせ送信エラー:', error);
      return false;
    }
  }

  /**
   * 医療チームからの通知を受信してVoiceDriveに取り込む
   */
  public async receiveMedicalTeamNotification(notification: MedicalTeamNotification): Promise<void> {
    try {
      // 優先度をVoiceDrive形式に変換
      const voiceDrivePriority = convertFromMedicalTeamPriority(notification.priority);

      console.log('📥 医療チームからの通知受信:', {
        originalPriority: notification.priority,
        convertedPriority: voiceDrivePriority,
        notification
      });

      // NotificationServiceを使用して通知を作成
      this.notificationService.send({
        type: 'medical_team_message',
        title: notification.title,
        message: notification.message,
        urgency: this.convertPriorityToUrgency(voiceDrivePriority),
        channels: ['browser', 'storage'],
        timestamp: notification.timestamp,
        data: {
          ...notification.data,
          originalPriority: notification.priority,
          source: 'medical_team'
        }
      });
    } catch (error) {
      console.error('医療チーム通知の処理エラー:', error);
    }
  }

  /**
   * 面談予約リクエストを医療チームに送信
   */
  public async sendBookingRequestToMedicalTeam(booking: InterviewBooking): Promise<boolean> {
    try {
      // 優先度を医療チーム形式に変換
      const medicalPriority = convertToMedicalTeamPriority(
        this.convertUrgencyLevelToPriority(booking.urgencyLevel)
      );

      const request: MedicalTeamBookingRequest = {
        employeeId: booking.employeeId,
        requestDate: booking.bookingDate.toISOString(),
        priority: medicalPriority,
        category: booking.interviewCategory,
        preferredTimes: [booking.timeSlot.startTime],
        notes: booking.description
      };

      console.log('📤 医療チームへの面談予約リクエスト:', {
        originalUrgency: booking.urgencyLevel,
        convertedPriority: medicalPriority,
        request
      });

      // 実際のAPI呼び出し（現在はモック）
      const response = await this.mockApiCall('/bookings', 'POST', request);

      return response.success;
    } catch (error) {
      console.error('医療チームへの予約リクエスト送信エラー:', error);
      return false;
    }
  }

  /**
   * 優先度検証テスト
   */
  public runPriorityMappingTest(): void {
    console.log('🧪 優先度マッピングテスト開始');

    const testCases: Array<{ input: VoiceDrivePriority; expected: MedicalTeamPriority }> = [
      { input: 'URGENT', expected: 'high' },
      { input: 'HIGH', expected: 'high' },
      { input: 'NORMAL', expected: 'medium' },
      { input: 'LOW', expected: 'low' }
    ];

    testCases.forEach(test => {
      const result = convertToMedicalTeamPriority(test.input);
      const passed = result === test.expected;
      console.log(
        `  ${passed ? '✅' : '❌'} ${test.input} → ${result} (期待値: ${test.expected})`
      );
    });

    // 逆方向のマッピングテスト
    console.log('\n🔄 逆マッピングテスト:');
    const reverseTests: Array<{ input: MedicalTeamPriority; expected: VoiceDrivePriority }> = [
      { input: 'high', expected: 'HIGH' },
      { input: 'medium', expected: 'NORMAL' },
      { input: 'low', expected: 'LOW' }
    ];

    reverseTests.forEach(test => {
      const result = convertFromMedicalTeamPriority(test.input);
      const passed = result === test.expected;
      console.log(
        `  ${passed ? '✅' : '❌'} ${test.input} → ${result} (期待値: ${test.expected})`
      );
    });

    console.log('\n✨ 優先度マッピングテスト完了');
  }

  // ヘルパーメソッド

  private convertUrgencyLevelToPriority(urgencyLevel: string): VoiceDrivePriority {
    switch (urgencyLevel) {
      case 'urgent':
        return 'URGENT';
      case 'high':
        return 'HIGH';
      case 'medium':
        return 'NORMAL';
      case 'low':
        return 'LOW';
      default:
        return 'NORMAL';
    }
  }

  private convertPriorityToUrgency(priority: VoiceDrivePriority): 'urgent' | 'high' | 'normal' {
    switch (priority) {
      case 'URGENT':
        return 'urgent';
      case 'HIGH':
        return 'high';
      case 'NORMAL':
      case 'LOW':
        return 'normal';
      default:
        return 'normal';
    }
  }

  /**
   * モックAPI呼び出し（実装時は実際のAPIに置き換え）
   */
  private async mockApiCall(
    endpoint: string,
    method: string,
    data: any
  ): Promise<{ success: boolean; data?: any }> {
    // 実際の実装では、fetchやaxiosを使用
    console.log(`🔄 Mock API Call: ${method} ${endpoint}`, data);

    // シミュレーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        id: `mock_${Date.now()}`,
        status: 'accepted',
        message: '医療チームシステムが正常に処理しました'
      }
    };
  }
}

export default MedicalIntegrationService;