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
import {
  VoiceDriveCategory,
  MedicalTeamCategory,
  SurveySubCategory,
  convertToMedicalTeamCategory,
  convertFromMedicalTeamCategory,
  validateCategorySettings
} from '../utils/categoryMapping';
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

export interface StatsWebhookPayload {
  event: 'stats.updated' | 'stats.hourly' | 'stats.daily';
  timestamp: string;
  announcement: {
    id: string;
    title: string;
    category: string;
    priority: string;
    publishedAt: string;
  };
  stats: {
    delivered: number;
    actions: number;
    completions: number;
    details?: {
      viewCount?: number;
      uniqueViewers?: number;
      averageReadTime?: number;
      actionsByDepartment?: { [department: string]: number };
    };
  };
  metadata: {
    source: 'voicedrive';
    version: '1.0.0';
    environment: 'production' | 'staging' | 'development';
  };
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

      // カテゴリを医療チーム形式に変換
      const medicalCategory = convertToMedicalTeamCategory(announcement.category as VoiceDriveCategory);

      // アンケートカテゴリの場合、サブカテゴリの検証
      if (announcement.category === 'SURVEY') {
        const validation = validateCategorySettings(medicalCategory, announcement.surveySubCategory as SurveySubCategory);
        if (!validation.valid) {
          console.warn('カテゴリ設定エラー:', validation.message);
        }
      }

      const payload: any = {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: medicalPriority,
        category: medicalCategory,
        publishAt: announcement.publishAt.toISOString(),
        targetDepartments: announcement.targetAudience.departments || [],
        requireResponse: announcement.requireResponse,
        actionType: announcement.actionButton?.type === 'medical_system'
          ? announcement.actionButton.url
          : null
      };

      // アンケートのサブカテゴリ情報を追加
      if (medicalCategory === 'survey' && announcement.surveySubCategory) {
        payload.surveyType = announcement.surveySubCategory;
      }

      console.log('📤 医療チームへのお知らせ送信:', {
        originalPriority: announcement.priority,
        convertedPriority: medicalPriority,
        originalCategory: announcement.category,
        convertedCategory: medicalCategory,
        surveyType: payload.surveyType,
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
   * 統計情報を職員カルテシステムに送信（Webhook）
   */
  public async sendStatsToMedicalTeam(
    announcement: HRAnnouncement,
    event: 'stats.updated' | 'stats.hourly' | 'stats.daily' = 'stats.updated'
  ): Promise<boolean> {
    try {
      const payload: StatsWebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        announcement: {
          id: announcement.id,
          title: announcement.title,
          category: convertToMedicalTeamCategory(announcement.category as VoiceDriveCategory),
          priority: convertToMedicalTeamPriority(announcement.priority),
          publishedAt: announcement.publishAt.toISOString()
        },
        stats: {
          delivered: announcement.stats?.delivered || 0,
          actions: announcement.stats?.responses || 0,  // 旧: responses
          completions: announcement.stats?.completions || 0
        },
        metadata: {
          source: 'voicedrive',
          version: '1.0.0',
          environment: (process.env.NODE_ENV as any) || 'development'
        }
      };

      console.log('📊 職員カルテシステムへ統計送信:', {
        event,
        announcementId: announcement.id,
        stats: payload.stats
      });

      // Webhook送信（HMAC署名付き）
      const webhookUrl = process.env.REACT_APP_MEDICAL_STATS_WEBHOOK_URL;
      if (!webhookUrl) {
        console.warn('⚠️ Webhook URLが設定されていません');
        return false;
      }

      const response = await this.sendWebhookWithSignature(webhookUrl, payload);
      return response.success;

    } catch (error) {
      console.error('統計送信エラー:', error);
      return false;
    }
  }

  /**
   * HMAC署名付きWebhook送信
   */
  private async sendWebhookWithSignature(
    url: string,
    payload: StatsWebhookPayload
  ): Promise<{ success: boolean; data?: any }> {
    try {
      const payloadString = JSON.stringify(payload);
      const secret = process.env.REACT_APP_MEDICAL_WEBHOOK_SECRET || '';

      // HMAC-SHA256署名生成（ブラウザ環境ではSubtle Crypto APIを使用）
      const signature = await this.generateHmacSignature(payloadString, secret);

      console.log('🔐 Webhook送信:', {
        url,
        hasSignature: !!signature,
        payloadSize: payloadString.length
      });

      // 本番環境では実際のfetch
      // const response = await fetch(url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.REACT_APP_MEDICAL_API_TOKEN}`,
      //     'X-VoiceDrive-Signature': signature
      //   },
      //   body: payloadString
      // });

      // モック実装
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        success: true,
        data: {
          receivedAt: new Date().toISOString(),
          processed: true
        }
      };

    } catch (error) {
      console.error('Webhook送信エラー:', error);
      throw error;
    }
  }

  /**
   * HMAC-SHA256署名生成（ブラウザ対応）
   */
  private async generateHmacSignature(message: string, secret: string): Promise<string> {
    try {
      // Web Crypto API（ブラウザ環境）
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(message);

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', key, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex;
    } catch (error) {
      console.error('HMAC署名生成エラー:', error);
      return '';
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