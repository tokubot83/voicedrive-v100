// 職員カルテシステムとのMCP連携サービス（モバイル対応強化版）
import { InterviewBooking } from '../types/interview';
import { MobileNotificationType } from './MobilePushNotificationService';

// 職員プロファイル情報（MCP経由で取得）
interface EmployeeProfile {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  hireDate: string;
  workPattern: 'day_shift' | 'night_shift' | 'rotating_shift' | 'on_call';
  contactPreferences: {
    email: string;
    phone?: string;
    preferredNotificationTime: string; // "09:00" など
    allowNightNotifications: boolean;
    preferredLanguage: 'ja' | 'en';
  };
  deviceInfo: {
    registeredDevices: Array<{
      deviceType: 'mobile' | 'desktop' | 'tablet';
      platform: 'iOS' | 'Android' | 'Windows' | 'macOS';
      lastUsed: string;
      isActive: boolean;
      pushEndpoint?: string;
    }>;
    notificationSettings: {
      pushEnabled: boolean;
      emailEnabled: boolean;
      smsEnabled: boolean;
      quietHoursStart?: string; // "22:00"
      quietHoursEnd?: string;   // "07:00"
    };
  };
  interviewHistory: {
    totalInterviews: number;
    lastInterviewDate?: string;
    nextMandatoryDate?: string;
    overdueCount: number;
    preferredInterviewTimes: string[]; // ["13:40", "14:10"]
    frequentInterviewTypes: string[];
  };
}

// モバイル使用統計
interface MobileUsageStats {
  employeeId: string;
  lastAppAccess: string;
  totalNotificationsSent: number;
  notificationOpenRate: number; // 開封率
  averageResponseTime: number; // 平均応答時間（分）
  preferredDeviceType: 'mobile' | 'desktop';
  offlineUsageFrequency: number; // オフライン使用頻度
  mostActiveTimeSlots: Array<{
    timeSlot: string;
    usageCount: number;
  }>;
}

// 通知配信結果
interface NotificationDeliveryResult {
  employeeId: string;
  notificationType: MobileNotificationType;
  deliveryMethod: 'push' | 'email' | 'sms';
  success: boolean;
  deliveredAt?: string;
  failureReason?: string;
  deviceType?: string;
  responseTime?: number; // ユーザーの反応時間
}

class EmployeeProfileMCPService {
  private baseUrl: string;
  private mcpEndpoint: string;
  private apiKey: string;
  private retryAttempts: number = 3;
  private timeoutMs: number = 10000;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.mcpEndpoint = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:8080';
    this.apiKey = import.meta.env.VITE_MCP_API_KEY || '';
  }

  // 職員プロファイル取得（モバイル対応情報含む）
  async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null> {
    try {
      const response = await this.mcpRequest('/api/employee-profile', {
        action: 'get_profile',
        employeeId,
        includeDeviceInfo: true,
        includeMobileSettings: true
      });

      if (response.success) {
        return response.data as EmployeeProfile;
      }

      return null;
    } catch (error) {
      console.error('職員プロファイル取得エラー:', error);
      return null;
    }
  }

  // モバイルデバイス情報更新
  async updateMobileDeviceInfo(
    employeeId: string,
    deviceInfo: {
      deviceType: 'mobile' | 'desktop' | 'tablet';
      platform: string;
      userAgent: string;
      pushEndpoint?: string;
      appVersion: string;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mcpRequest('/api/employee-devices', {
        action: 'update_device',
        employeeId,
        deviceInfo: {
          ...deviceInfo,
          lastUsed: new Date().toISOString(),
          isActive: true
        }
      });

      return response.success;
    } catch (error) {
      console.error('モバイルデバイス情報更新エラー:', error);
      return false;
    }
  }

  // 通知設定更新
  async updateNotificationPreferences(
    employeeId: string,
    preferences: {
      pushEnabled: boolean;
      emailEnabled: boolean;
      smsEnabled: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      preferredNotificationTime?: string;
      allowNightNotifications: boolean;
    }
  ): Promise<boolean> {
    try {
      const response = await this.mcpRequest('/api/employee-notifications', {
        action: 'update_preferences',
        employeeId,
        preferences
      });

      return response.success;
    } catch (error) {
      console.error('通知設定更新エラー:', error);
      return false;
    }
  }

  // 面談予約時のMCP連携（モバイル考慮）
  async syncInterviewBookingWithMCP(booking: InterviewBooking): Promise<boolean> {
    try {
      // 職員プロファイル取得
      const profile = await this.getEmployeeProfile(booking.employeeId);
      if (!profile) {
        console.warn('職員プロファイルが取得できませんでした:', booking.employeeId);
        return false;
      }

      // 面談予約をMCPに同期
      const response = await this.mcpRequest('/api/interview-sync', {
        action: 'sync_booking',
        bookingData: {
          ...booking,
          employeeProfile: {
            department: profile.department,
            workPattern: profile.workPattern,
            contactPreferences: profile.contactPreferences
          },
          mobileSync: {
            requiresPushNotification: profile.deviceInfo.notificationSettings.pushEnabled,
            preferredNotificationTime: profile.contactPreferences.preferredNotificationTime,
            quietHours: {
              start: profile.deviceInfo.notificationSettings.quietHoursStart,
              end: profile.deviceInfo.notificationSettings.quietHoursEnd
            }
          }
        }
      });

      if (response.success) {
        // 面談履歴更新
        await this.updateInterviewHistory(booking.employeeId, booking);
        return true;
      }

      return false;
    } catch (error) {
      console.error('面談予約MCP同期エラー:', error);
      return false;
    }
  }

  // モバイル使用統計取得
  async getMobileUsageStats(employeeId: string): Promise<MobileUsageStats | null> {
    try {
      const response = await this.mcpRequest('/api/mobile-analytics', {
        action: 'get_usage_stats',
        employeeId,
        period: '30days'
      });

      if (response.success) {
        return response.data as MobileUsageStats;
      }

      return null;
    } catch (error) {
      console.error('モバイル使用統計取得エラー:', error);
      return null;
    }
  }

  // 通知配信結果記録
  async recordNotificationDelivery(result: NotificationDeliveryResult): Promise<void> {
    try {
      await this.mcpRequest('/api/notification-analytics', {
        action: 'record_delivery',
        deliveryResult: {
          ...result,
          recordedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('通知配信結果記録エラー:', error);
      // 統計記録エラーは致命的ではないため継続
    }
  }

  // 最適な通知タイミング計算
  async calculateOptimalNotificationTime(
    employeeId: string,
    baseTime: Date,
    notificationType: MobileNotificationType
  ): Promise<Date> {
    try {
      const profile = await this.getEmployeeProfile(employeeId);
      const usageStats = await this.getMobileUsageStats(employeeId);

      if (!profile || !usageStats) {
        return baseTime; // フォールバック
      }

      const response = await this.mcpRequest('/api/notification-optimization', {
        action: 'calculate_optimal_time',
        employeeId,
        baseTime: baseTime.toISOString(),
        notificationType,
        profileData: {
          workPattern: profile.workPattern,
          quietHours: profile.deviceInfo.notificationSettings,
          preferredTime: profile.contactPreferences.preferredNotificationTime,
          mostActiveTimeSlots: usageStats.mostActiveTimeSlots
        }
      });

      if (response.success && response.data.optimalTime) {
        return new Date(response.data.optimalTime);
      }

      return baseTime;
    } catch (error) {
      console.error('最適通知タイミング計算エラー:', error);
      return baseTime;
    }
  }

  // 面談傾向分析（AI分析）
  async analyzeInterviewPatterns(employeeId: string): Promise<{
    recommendedTypes: string[];
    suggestedFrequency: number; // 日数
    riskFactors: string[];
    interventionRequired: boolean;
  } | null> {
    try {
      const response = await this.mcpRequest('/api/interview-analytics', {
        action: 'analyze_patterns',
        employeeId,
        analysisType: 'comprehensive'
      });

      if (response.success) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('面談傾向分析エラー:', error);
      return null;
    }
  }

  // 緊急通知判定
  async shouldSendUrgentNotification(
    employeeId: string,
    notificationType: MobileNotificationType,
    context: any
  ): Promise<boolean> {
    try {
      const profile = await this.getEmployeeProfile(employeeId);
      if (!profile) return false;

      // 勤務パターンチェック
      const now = new Date();
      const currentHour = now.getHours();

      // 夜勤職員の場合は通知タイミングを調整
      if (profile.workPattern === 'night_shift') {
        if (currentHour >= 7 && currentHour <= 15) {
          // 夜勤職員の休息時間は緊急通知を控える
          return false;
        }
      }

      // 静穏時間チェック
      const quietStart = profile.deviceInfo.notificationSettings.quietHoursStart;
      const quietEnd = profile.deviceInfo.notificationSettings.quietHoursEnd;

      if (quietStart && quietEnd) {
        const quietStartHour = parseInt(quietStart.split(':')[0]);
        const quietEndHour = parseInt(quietEnd.split(':')[0]);

        if (currentHour >= quietStartHour || currentHour <= quietEndHour) {
          // 緊急度が最高レベルの場合のみ送信
          return notificationType === 'URGENT_SCHEDULE_CHANGE';
        }
      }

      return true;
    } catch (error) {
      console.error('緊急通知判定エラー:', error);
      return true; // エラー時は送信を許可
    }
  }

  // 職員グループ向け一括通知最適化
  async optimizeBatchNotification(
    employeeIds: string[],
    notificationType: MobileNotificationType,
    baseTime: Date
  ): Promise<Array<{
    employeeId: string;
    optimizedTime: Date;
    deliveryMethod: 'push' | 'email' | 'sms';
    priority: 'low' | 'normal' | 'high' | 'urgent';
  }>> {
    try {
      const response = await this.mcpRequest('/api/batch-notification-optimization', {
        action: 'optimize_batch',
        employeeIds,
        notificationType,
        baseTime: baseTime.toISOString()
      });

      if (response.success) {
        return response.data.optimizedDeliveries;
      }

      // フォールバック：全員に基本時刻で送信
      return employeeIds.map(employeeId => ({
        employeeId,
        optimizedTime: baseTime,
        deliveryMethod: 'push' as const,
        priority: 'normal' as const
      }));
    } catch (error) {
      console.error('一括通知最適化エラー:', error);
      return employeeIds.map(employeeId => ({
        employeeId,
        optimizedTime: baseTime,
        deliveryMethod: 'push' as const,
        priority: 'normal' as const
      }));
    }
  }

  // プライベートメソッド
  private async mcpRequest(endpoint: string, data: any, attempt = 1): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.mcpEndpoint}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-Type': 'voicedrive-mobile',
          'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`MCP API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.warn(`MCP Request failed, retrying... (${attempt}/${this.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.mcpRequest(endpoint, data, attempt + 1);
      }

      throw error;
    }
  }

  private async updateInterviewHistory(employeeId: string, booking: InterviewBooking): Promise<void> {
    try {
      await this.mcpRequest('/api/interview-history', {
        action: 'update_history',
        employeeId,
        interviewData: {
          bookingId: booking.id,
          interviewType: booking.interviewType,
          scheduledDate: booking.bookingDate,
          status: booking.status,
          createdAt: booking.createdAt
        }
      });
    } catch (error) {
      console.error('面談履歴更新エラー:', error);
    }
  }

  // 健康状態モニタリング（MCP連携）
  async checkEmployeeWellbeing(employeeId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    recommendedActions: string[];
    urgentInterventionRequired: boolean;
  } | null> {
    try {
      const response = await this.mcpRequest('/api/wellbeing-assessment', {
        action: 'assess_employee',
        employeeId,
        includeInterviewData: true,
        includeMobileUsagePatterns: true
      });

      if (response.success) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('職員健康状態確認エラー:', error);
      return null;
    }
  }
}

export const employeeProfileMCPService = new EmployeeProfileMCPService();
export default employeeProfileMCPService;