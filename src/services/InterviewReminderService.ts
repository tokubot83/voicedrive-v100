// 医療介護系法人向け面談リマインダーサービス

import { 
  MedicalEmployeeProfile, 
  InterviewReminderConfig, 
  ReminderSchedule, 
  NotificationType, 
  EmploymentStatus,
  InterviewType,
  WorkPattern,
  InterviewBooking 
} from '../types/interview';

export class InterviewReminderService {
  private static instance: InterviewReminderService;
  private employeeProfiles: Map<string, MedicalEmployeeProfile> = new Map();
  private reminderConfigs: Map<string, InterviewReminderConfig> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
  }

  public static getInstance(): InterviewReminderService {
    if (!InterviewReminderService.instance) {
      InterviewReminderService.instance = new InterviewReminderService();
    }
    return InterviewReminderService.instance;
  }

  // デフォルトのリマインダー設定を初期化
  private initializeDefaultConfigs(): void {
    // 新入職員（月次面談）
    this.reminderConfigs.set('new_employee', {
      employmentStatus: 'new_employee',
      department: '',
      workPattern: 'day_shift',
      frequencyRules: {
        mandatoryInterviewType: 'new_employee_monthly',
        intervalDays: 30, // 30日間隔
        reminderSchedule: [14, 7, 3], // 2週間前、1週間前、3日前
        overdueReminderSchedule: [1, 3, 7], // 1日後、3日後、1週間後
        maxOverdueReminders: 3
      },
      excludeFromReminders: false
    });

    // 一般職員（年次面談）
    this.reminderConfigs.set('regular_employee', {
      employmentStatus: 'regular_employee',
      department: '',
      workPattern: 'day_shift',
      frequencyRules: {
        mandatoryInterviewType: 'regular_annual',
        intervalDays: 365, // 365日間隔
        reminderSchedule: [30, 14, 7], // 1ヶ月前、2週間前、1週間前
        overdueReminderSchedule: [7, 14, 30], // 1週間後、2週間後、1ヶ月後
        maxOverdueReminders: 3
      },
      excludeFromReminders: false
    });

    // 管理職（半年面談）
    this.reminderConfigs.set('management', {
      employmentStatus: 'management',
      department: '',
      workPattern: 'day_shift',
      frequencyRules: {
        mandatoryInterviewType: 'management_biannual',
        intervalDays: 182, // 182日間隔（半年）
        reminderSchedule: [14, 7, 3], // 2週間前、1週間前、3日前
        overdueReminderSchedule: [3, 7, 14], // 3日後、1週間後、2週間後
        maxOverdueReminders: 3
      },
      excludeFromReminders: false
    });
  }

  // 職員の雇用状況を更新
  async updateEmployeeProfile(profile: MedicalEmployeeProfile): Promise<void> {
    this.employeeProfiles.set(profile.employeeId, profile);
    
    // 雇用状況が変更された場合、次回面談日を再計算
    await this.recalculateNextInterviewDate(profile.employeeId);
  }

  // 職員の雇用状況を取得
  getEmployeeProfile(employeeId: string): MedicalEmployeeProfile | null {
    return this.employeeProfiles.get(employeeId) || null;
  }

  // 職員の雇用状況を判定（入職日から自動計算）
  async determineEmploymentStatus(employeeId: string, hireDate: Date): Promise<EmploymentStatus> {
    const profile = this.getEmployeeProfile(employeeId);
    
    // 特別な状況をチェック
    if (profile?.specialCircumstances.isOnLeave) return 'on_leave';
    if (profile?.specialCircumstances.isRetiring) return 'retiring';
    
    // 入職からの経過日数を計算
    const daysSinceHire = Math.floor((Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceHire < 365) {
      return 'new_employee';
    } else {
      // 管理職判定は別途必要（権限レベルや職位から判定）
      return 'regular_employee';
    }
  }

  // 次回面談予定日を計算
  async calculateNextInterviewDate(employeeId: string): Promise<Date | null> {
    const profile = this.getEmployeeProfile(employeeId);
    if (!profile) return null;

    // リマインダー除外条件をチェック
    if (this.shouldExcludeFromReminders(profile)) {
      return null;
    }

    const config = this.reminderConfigs.get(profile.employmentStatus);
    if (!config) return null;

    const now = new Date();
    let baseDate: Date;

    if (profile.employmentStatus === 'new_employee') {
      // 新入職員の場合
      if (profile.interviewHistory.lastInterviewDate) {
        // 前回面談日を基準
        baseDate = profile.interviewHistory.lastInterviewDate;
      } else {
        // 入職日を基準
        baseDate = profile.hireDate;
      }
    } else {
      // 一般職員・管理職の場合
      if (profile.interviewHistory.firstInterviewDate) {
        // 初回面談日を基準
        baseDate = profile.interviewHistory.firstInterviewDate;
      } else {
        // まだ面談を受けていない場合は入職日を基準
        baseDate = profile.hireDate;
      }
    }

    // 次回面談日を計算
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + config.frequencyRules.intervalDays);

    return nextDate;
  }

  // 次回面談予定日を再計算
  private async recalculateNextInterviewDate(employeeId: string): Promise<void> {
    const profile = this.employeeProfiles.get(employeeId);
    if (!profile) return;

    const nextDate = await this.calculateNextInterviewDate(employeeId);
    
    // プロフィールを更新
    profile.interviewHistory.nextScheduledDate = nextDate;
    this.employeeProfiles.set(employeeId, profile);
  }

  // リマインダースケジュールを生成
  async generateReminderSchedule(employeeId: string): Promise<ReminderSchedule | null> {
    const profile = this.getEmployeeProfile(employeeId);
    if (!profile) return null;

    const nextInterviewDate = await this.calculateNextInterviewDate(employeeId);
    if (!nextInterviewDate) return null;

    const config = this.reminderConfigs.get(profile.employmentStatus);
    if (!config) return null;

    const now = new Date();
    const isOverdue = nextInterviewDate < now;
    const daysSinceOverdue = isOverdue ? 
      Math.floor((now.getTime() - nextInterviewDate.getTime()) / (1000 * 60 * 60 * 24)) : 
      undefined;

    const reminderDates: Array<{
      date: Date;
      type: NotificationType;
      message: string;
    }> = [];

    if (isOverdue) {
      // 期限超過の場合、督促リマインダーを設定
      config.frequencyRules.overdueReminderSchedule.forEach((daysAfter, index) => {
        const reminderDate = new Date(nextInterviewDate);
        reminderDate.setDate(reminderDate.getDate() + daysAfter);
        
        if (reminderDate <= now && index < config.frequencyRules.maxOverdueReminders) {
          reminderDates.push({
            date: reminderDate,
            type: 'interview_overdue',
            message: this.generateOverdueMessage(profile.employmentStatus, daysAfter)
          });
        }
      });
    } else {
      // 通常のリマインダーを設定
      config.frequencyRules.reminderSchedule.forEach((daysBefore, index) => {
        const reminderDate = new Date(nextInterviewDate);
        reminderDate.setDate(reminderDate.getDate() - daysBefore);
        
        if (reminderDate >= now) {
          reminderDates.push({
            date: reminderDate,
            type: this.getReminderType(profile.employmentStatus, index),
            message: this.generateReminderMessage(profile.employmentStatus, daysBefore)
          });
        }
      });
    }

    return {
      employeeId,
      nextInterviewDue: nextInterviewDate,
      reminderDates,
      isOverdue,
      daysSinceOverdue
    };
  }

  // 面談完了時の処理
  async onInterviewCompleted(employeeId: string, interviewType: InterviewType, completedDate: Date): Promise<void> {
    const profile = this.getEmployeeProfile(employeeId);
    if (!profile) return;

    // 面談履歴を更新
    profile.interviewHistory.lastInterviewDate = completedDate;
    profile.interviewHistory.totalInterviews += 1;

    // 初回面談の場合、記録
    if (!profile.interviewHistory.firstInterviewDate) {
      profile.interviewHistory.firstInterviewDate = completedDate;
    }

    // 必須面談の場合、完了数をカウント
    const config = this.reminderConfigs.get(profile.employmentStatus);
    if (config && interviewType === config.frequencyRules.mandatoryInterviewType) {
      profile.interviewHistory.mandatoryInterviewsCompleted += 1;
    }

    // 期限超過回数をリセット
    profile.interviewHistory.overdueCount = 0;

    // プロフィールを更新
    this.employeeProfiles.set(employeeId, profile);

    // 次回面談日を再計算
    await this.recalculateNextInterviewDate(employeeId);
  }

  // 全職員のリマインダーをチェック
  async checkAllPendingReminders(): Promise<ReminderSchedule[]> {
    const pendingReminders: ReminderSchedule[] = [];
    
    for (const [employeeId, profile] of this.employeeProfiles) {
      if (this.shouldExcludeFromReminders(profile)) continue;
      
      const reminderSchedule = await this.generateReminderSchedule(employeeId);
      if (reminderSchedule) {
        pendingReminders.push(reminderSchedule);
      }
    }
    
    return pendingReminders;
  }

  // 今日送信すべきリマインダーを取得
  async getTodaysReminders(): Promise<ReminderSchedule[]> {
    const allReminders = await this.checkAllPendingReminders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    return allReminders.filter(reminder => 
      reminder.reminderDates.some(r => 
        r.date >= today && r.date <= todayEnd
      )
    );
  }

  // リマインダー除外条件をチェック
  private shouldExcludeFromReminders(profile: MedicalEmployeeProfile): boolean {
    // 休職中、退職手続き中、産休・育休中は除外
    if (profile.specialCircumstances.isOnLeave) return true;
    if (profile.specialCircumstances.isRetiring) return true;
    
    // 産休・育休中は復職1ヶ月前まで除外
    if (profile.specialCircumstances.isOnMaternityLeave) {
      if (profile.specialCircumstances.returnToWorkDate) {
        const oneMonthBeforeReturn = new Date(profile.specialCircumstances.returnToWorkDate);
        oneMonthBeforeReturn.setMonth(oneMonthBeforeReturn.getMonth() - 1);
        return new Date() < oneMonthBeforeReturn;
      }
      return true;
    }
    
    return false;
  }

  // リマインダーの種類を取得
  private getReminderType(status: EmploymentStatus, index: number): NotificationType {
    switch (status) {
      case 'new_employee':
        return index === 0 ? 'interview_reminder_first' : 'interview_reminder_monthly';
      case 'regular_employee':
      case 'management':
        return 'interview_reminder_annual';
      default:
        return 'interview_reminder_monthly';
    }
  }

  // リマインダーメッセージを生成
  private generateReminderMessage(status: EmploymentStatus, daysBefore: number): string {
    const dayText = daysBefore === 1 ? '明日' : `${daysBefore}日後`;
    
    switch (status) {
      case 'new_employee':
        return `新入職員月次面談が${dayText}に予定されています。忘れずに予約してください。`;
      case 'regular_employee':
        return `年次定期面談が${dayText}に予定されています。人事部までご連絡ください。`;
      case 'management':
        return `管理職面談が${dayText}に予定されています。スケジュール調整をお願いします。`;
      default:
        return `面談が${dayText}に予定されています。`;
    }
  }

  // 期限超過メッセージを生成
  private generateOverdueMessage(status: EmploymentStatus, daysAfter: number): string {
    switch (status) {
      case 'new_employee':
        return `新入職員月次面談の期限が${daysAfter}日過ぎています。至急予約してください。`;
      case 'regular_employee':
        return `年次定期面談の期限が${daysAfter}日過ぎています。人事部までご連絡ください。`;
      case 'management':
        return `管理職面談の期限が${daysAfter}日過ぎています。至急スケジュール調整をお願いします。`;
      default:
        return `面談の期限が${daysAfter}日過ぎています。`;
    }
  }

  // 特定の部署向けカスタム設定を適用
  applyDepartmentCustomizations(department: string): void {
    // 高ストレス部署（ICU、救急科等）の特別ルール
    const highStressDepartments = ['ICU', '救急科', '手術室', '透析室'];
    
    if (highStressDepartments.includes(department)) {
      // 新入職員の面談頻度を増加（月2回）
      const newEmployeeConfig = this.reminderConfigs.get('new_employee');
      if (newEmployeeConfig) {
        newEmployeeConfig.frequencyRules.intervalDays = 15; // 2週間間隔
        this.reminderConfigs.set(`new_employee_${department}`, newEmployeeConfig);
      }
      
      // 一般職員も半年に1回に変更
      const regularConfig = this.reminderConfigs.get('regular_employee');
      if (regularConfig) {
        regularConfig.frequencyRules.intervalDays = 182; // 半年間隔
        this.reminderConfigs.set(`regular_employee_${department}`, regularConfig);
      }
    }
  }

  // 夜勤者向けの時間調整
  adjustForNightShiftWorkers(workPattern: WorkPattern): InterviewReminderConfig | null {
    if (workPattern === 'night_shift') {
      const config = this.reminderConfigs.get('regular_employee');
      if (config) {
        // 夜勤者用の設定をコピーして調整
        const nightShiftConfig = { ...config };
        nightShiftConfig.workPattern = 'night_shift';
        // 夜勤者は午前中の面談を推奨するため、異なるリマインダーメッセージを使用
        return nightShiftConfig;
      }
    }
    return null;
  }
}

export default InterviewReminderService;