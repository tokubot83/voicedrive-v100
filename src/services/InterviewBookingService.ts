// 面談予約サービス - 人財統括本部運用システム
import {
  InterviewBooking,
  TimeSlot,
  BookingRequest,
  BookingResponse,
  InterviewStats,
  InterviewScheduleConfig,
  Interviewer,
  BookingManagementData,
  BookingFilter,
  InterviewNotification,
  NotificationType,
  MedicalEmployeeProfile,
  InterviewReminderConfig,
  EmploymentStatus,
  InterviewType,
  CancellationRequest,
  CancellationReason,
  RescheduleRequest,
  BookingCancellationResponse,
  BookingRescheduleResponse
} from '../types/interview';
import InterviewReminderService from './InterviewReminderService';
import NotificationService from './NotificationService';
import { PermissionLevel } from '../permissions/types/PermissionTypes';

export class InterviewBookingService {
  private static instance: InterviewBookingService;
  
  // デモ用データ保存
  private bookings: Map<string, InterviewBooking> = new Map();
  private timeSlots: Map<string, TimeSlot[]> = new Map(); // date -> slots
  private interviewers: Map<string, Interviewer> = new Map();
  private scheduleConfig: InterviewScheduleConfig;
  
  // 新機能：リマインダーサービスとの連携
  private reminderService: InterviewReminderService;
  private notificationService: NotificationService;
  
  private constructor() {
    this.initializeDefaultConfig();
    this.initializeDefaultInterviewers();
    this.generateDefaultTimeSlots();
    this.generateDemoBookings();

    // 新機能サービスを初期化
    this.reminderService = InterviewReminderService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }
  
  public static getInstance(): InterviewBookingService {
    if (!InterviewBookingService.instance) {
      InterviewBookingService.instance = new InterviewBookingService();
    }
    return InterviewBookingService.instance;
  }
  
  // === 予約申請（一般ユーザー用） ===
  async requestBooking(employeeId: string, request: BookingRequest): Promise<BookingResponse> {
    try {
      // 1. 権限チェック
      if (!this.canRequestBooking(employeeId)) {
        return {
          success: false,
          message: '面談予約の権限がありません'
        };
      }
      
      // 2. 予約制限チェック
      const limitCheck = await this.checkBookingLimits(employeeId, request);
      if (!limitCheck.allowed) {
        return {
          success: false,
          message: limitCheck.reason || '予約制限に達しています',
          suggestedAlternatives: await this.getSuggestedAlternatives(request)
        };
      }
      
      // 3. 最適な時間枠を検索
      const availableSlot = await this.findBestAvailableSlot(request);
      if (!availableSlot) {
        return {
          success: false,
          message: '希望の日時に空きがありません',
          suggestedAlternatives: await this.getSuggestedAlternatives(request)
        };
      }
      
      // 4. 面談者を自動割り当て
      const interviewer = await this.assignInterviewer(request, availableSlot);
      
      // 5. 予約を作成
      const booking: InterviewBooking = {
        id: this.generateBookingId(),
        employeeId,
        employeeName: await this.getEmployeeName(employeeId),
        employeeEmail: await this.getEmployeeEmail(employeeId),
        employeePhone: await this.getEmployeePhone(employeeId),
        facility: await this.getEmployeeFacility(employeeId),
        department: await this.getEmployeeDepartment(employeeId),
        position: await this.getEmployeePosition(employeeId),
        bookingDate: availableSlot.date,
        timeSlot: availableSlot,
        interviewType: request.interviewType,
        interviewCategory: request.interviewCategory,
        requestedTopics: request.requestedTopics,
        description: request.description,
        urgencyLevel: request.urgencyLevel,
        interviewerId: interviewer?.id,
        interviewerName: interviewer?.name,
        interviewerLevel: interviewer?.permissionLevel,
        status: 'pending',
        createdAt: new Date(),
        createdBy: employeeId
      };
      
      // 6. 予約を保存
      this.bookings.set(booking.id, booking);
      
      // 7. 時間枠を予約済みに更新
      availableSlot.isAvailable = false;
      availableSlot.bookedBy = employeeId;
      availableSlot.bookingId = booking.id;
      
      // 8. 通知送信
      await this.sendBookingNotification(booking, 'booking_confirmed');
      
      return {
        success: true,
        message: '面談予約が申請されました。確認後、確定通知をお送りします。',
        bookingId: booking.id
      };
      
    } catch (error) {
      console.error('Booking request failed:', error);
      return {
        success: false,
        message: 'システムエラーが発生しました。しばらく後に再試行してください。'
      };
    }
  }
  
  // === 管理機能（LEVEL 5-7用） ===
  async getManagementData(adminId: string, permissionLevel: PermissionLevel): Promise<BookingManagementData> {
    // 権限チェック
    if (permissionLevel < PermissionLevel.LEVEL_5) {
      throw new Error('管理画面へのアクセス権限がありません');
    }
    
    const today = new Date();
    const weekStart = this.getWeekStart(today);
    const weekEnd = this.getWeekEnd(today);
    
    const allBookings = Array.from(this.bookings.values());
    
    return {
      todaysBookings: this.filterBookingsByDate(allBookings, today),
      weeklyBookings: this.filterBookingsByDateRange(allBookings, weekStart, weekEnd),
      pendingRequests: allBookings.filter(b => b.status === 'pending'),
      availableSlots: await this.getAvailableSlots(today, 7), // 7日分
      blockedSlots: await this.getBlockedSlots(today, 7),
      interviewerAvailability: await this.getInterviewerAvailability(),
      stats: await this.calculateStats()
    };
  }
  
  // 予約確定（LEVEL 5以上）
  async confirmBooking(bookingId: string, adminId: string, adminLevel: PermissionLevel): Promise<BookingResponse> {
    if (adminLevel < PermissionLevel.LEVEL_5) {
      return { success: false, message: '予約確定の権限がありません' };
    }
    
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return { success: false, message: '予約が見つかりません' };
    }
    
    booking.status = 'confirmed';
    booking.lastModified = new Date();
    booking.modifiedBy = adminId;
    
    await this.sendBookingNotification(booking, 'booking_confirmed');
    
    return {
      success: true,
      message: '予約が確定されました',
      bookingId
    };
  }
  
  // 時間枠ブロック（LEVEL 5以上）
  async blockTimeSlot(
    date: Date, 
    slotId: string, 
    reason: string, 
    adminId: string, 
    adminLevel: PermissionLevel
  ): Promise<{ success: boolean; message: string }> {
    if (adminLevel < PermissionLevel.LEVEL_5) {
      return { success: false, message: '時間枠管理の権限がありません' };
    }
    
    const dateKey = this.getDateKey(date);
    const slots = this.timeSlots.get(dateKey) || [];
    const slot = slots.find(s => s.id === slotId);
    
    if (!slot) {
      return { success: false, message: '指定の時間枠が見つかりません' };
    }
    
    if (!slot.isAvailable) {
      return { success: false, message: 'この時間枠は既に予約済みです' };
    }
    
    slot.isBlocked = true;
    slot.isAvailable = false;
    slot.blockedBy = adminId;
    slot.blockedReason = reason;
    
    return {
      success: true,
      message: '時間枠をブロックしました'
    };
  }
  
  // 予約変更（LEVEL 5以上）
  async rescheduleBooking(
    bookingId: string,
    newSlot: TimeSlot,
    adminId: string,
    adminLevel: PermissionLevel,
    reason?: string
  ): Promise<BookingResponse> {
    if (adminLevel < PermissionLevel.LEVEL_5) {
      return { success: false, message: '予約変更の権限がありません' };
    }
    
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return { success: false, message: '予約が見つかりません' };
    }
    
    // 元の時間枠を解放
    const oldSlot = booking.timeSlot;
    oldSlot.isAvailable = true;
    oldSlot.bookedBy = undefined;
    oldSlot.bookingId = undefined;
    
    // 新しい時間枠を予約
    newSlot.isAvailable = false;
    newSlot.bookedBy = booking.employeeId;
    newSlot.bookingId = bookingId;
    
    // 予約情報を更新
    booking.timeSlot = newSlot;
    booking.bookingDate = newSlot.date;
    booking.status = 'rescheduled';
    booking.lastModified = new Date();
    booking.modifiedBy = adminId;
    booking.adminNotes = (booking.adminNotes || '') + `\n変更理由: ${reason || '管理者による変更'}`;
    
    await this.sendBookingNotification(booking, 'booking_rescheduled');
    
    return {
      success: true,
      message: '予約が変更されました',
      bookingId
    };
  }
  
  // === 面談実施機能（LEVEL 6-7用） ===
  async getInterviewerSchedule(interviewerId: string, dateRange: { start: Date; end: Date }) {
    const interviewer = this.interviewers.get(interviewerId);
    if (!interviewer) {
      throw new Error('面談者が見つかりません');
    }
    
    const allBookings = Array.from(this.bookings.values());
    const interviewerBookings = allBookings.filter(
      b => b.interviewerId === interviewerId &&
      b.bookingDate >= dateRange.start &&
      b.bookingDate <= dateRange.end
    );
    
    return {
      interviewer,
      bookings: interviewerBookings,
      availableSlots: await this.getInterviewerAvailableSlots(interviewerId, dateRange)
    };
  }
  
  async conductInterview(
    bookingId: string,
    interviewerId: string,
    outcome: any,
    interviewerLevel: PermissionLevel
  ): Promise<{ success: boolean; message: string }> {
    if (interviewerLevel < PermissionLevel.LEVEL_6) {
      return { success: false, message: '面談実施の権限がありません' };
    }
    
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return { success: false, message: '予約が見つかりません' };
    }
    
    if (booking.interviewerId !== interviewerId) {
      return { success: false, message: 'この面談の担当者ではありません' };
    }
    
    booking.status = 'completed';
    booking.conductedAt = new Date();
    booking.outcome = outcome;
    booking.lastModified = new Date();
    booking.modifiedBy = interviewerId;
    
    // フォローアップが必要な場合、リマインダーを設定
    if (outcome.followUpRequired && outcome.followUpDate) {
      await this.scheduleFollowUpReminder(booking, outcome.followUpDate);
    }
    
    return {
      success: true,
      message: '面談記録が保存されました'
    };
  }
  
  // === ユーティリティメソッド ===
  private async getSuggestedAlternatives(request: BookingRequest): Promise<TimeSlot[]> {
    // 希望日の前後3日で空きスロットを検索
    const alternatives: TimeSlot[] = [];
    
    for (const preferredDate of request.preferredDates) {
      for (let i = -3; i <= 3; i++) {
        const checkDate = new Date(preferredDate);
        checkDate.setDate(checkDate.getDate() + i);
        
        const availableSlots = await this.getAvailableSlotsForDate(checkDate);
        alternatives.push(...availableSlots.slice(0, 2)); // 各日2枠まで
      }
    }
    
    return alternatives.slice(0, 6); // 最大6つの代替案
  }
  
  private async findBestAvailableSlot(request: BookingRequest): Promise<TimeSlot | null> {
    // 希望日を優先順位順にチェック
    for (const preferredDate of request.preferredDates) {
      const availableSlots = await this.getAvailableSlotsForDate(preferredDate);
      
      // 希望時間に一致するスロットを検索
      for (const preferredTime of request.preferredTimes) {
        const matchingSlot = availableSlots.find(
          slot => slot.startTime === preferredTime
        );
        if (matchingSlot) {
          return matchingSlot;
        }
      }
      
      // 希望時間が空いていない場合、その日の最初の空きスロットを返す
      if (availableSlots.length > 0) {
        return availableSlots[0];
      }
    }
    
    return null;
  }
  
  private async assignInterviewer(request: BookingRequest, slot: TimeSlot): Promise<Interviewer | null> {
    const availableInterviewers = Array.from(this.interviewers.values()).filter(
      interviewer => interviewer.isActive &&
      interviewer.specialties.includes(request.interviewCategory) &&
      this.isInterviewerAvailable(interviewer, slot)
    );
    
    if (availableInterviewers.length === 0) {
      return null;
    }
    
    // 負荷分散：予約数が最も少ない面談者を選択
    return availableInterviewers.reduce((prev, curr) =>
      prev.currentBookings < curr.currentBookings ? prev : curr
    );
  }
  
  // 予約制限チェック（医療従事者向け拡張版）
  private async checkBookingLimits(employeeId: string, request: BookingRequest): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // 職員プロフィールを取得
    const employeeProfile = this.reminderService.getEmployeeProfile(employeeId);
    
    const userBookings = Array.from(this.bookings.values()).filter(
      booking => booking.employeeId === employeeId
    );
    
    if (employeeProfile) {
      // 医療従事者向けの詳細なルールチェック
      return this.checkMedicalStaffBookingLimits(employeeProfile, request, userBookings);
    } else {
      // 従来のルールチェック（後方互換性）
      return this.checkLegacyBookingLimits(userBookings, request);
    }
  }

  // 医療従事者向けの予約制限チェック
  private async checkMedicalStaffBookingLimits(
    profile: MedicalEmployeeProfile, 
    request: BookingRequest, 
    userBookings: InterviewBooking[]
  ): Promise<{ allowed: boolean; reason?: string }> {
    // 除外条件チェック
    if (profile.specialCircumstances.isOnLeave) {
      return { allowed: false, reason: '休職中のため面談予約はできません' };
    }
    
    if (profile.specialCircumstances.isRetiring) {
      return { allowed: false, reason: '退職手続き中のため新たな面談予約はできません' };
    }
    
    // 産休・育休中のチェック
    if (profile.specialCircumstances.isOnMaternityLeave) {
      if (profile.specialCircumstances.returnToWorkDate) {
        const oneMonthBeforeReturn = new Date(profile.specialCircumstances.returnToWorkDate);
        oneMonthBeforeReturn.setMonth(oneMonthBeforeReturn.getMonth() - 1);
        if (new Date() < oneMonthBeforeReturn) {
          return { allowed: false, reason: '復職1ヶ月前まで面談予約はできません' };
        }
      } else {
        return { allowed: false, reason: '産休・育休中のため面談予約はできません' };
      }
    }

    // 雇用状況別のルールチェック
    const now = new Date();
    
    if (profile.employmentStatus === 'new_employee') {
      // 新入職員のルール
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const thisMonthBookings = userBookings.filter(booking => {
        const bookingMonth = booking.bookingDate.getMonth();
        const bookingYear = booking.bookingDate.getFullYear();
        return bookingMonth === thisMonth && bookingYear === thisYear;
      });
      
      // 必須面談タイプかチェック
      if (request.interviewType === 'new_employee_monthly') {
        if (thisMonthBookings.some(b => b.interviewType === 'new_employee_monthly')) {
          return { allowed: false, reason: '今月の必須面談は既に予約済みです' };
        }
      } else {
        // 随時面談の制限
        const adhocBookings = thisMonthBookings.filter(b => b.interviewType === 'ad_hoc');
        if (adhocBookings.length >= 1) {
          return { allowed: false, reason: '新入職員の随時面談は月1回までです' };
        }
      }
    } else if (profile.employmentStatus === 'regular_employee') {
      // 一般職員のルール
      if (request.interviewType === 'regular_annual') {
        const thisYear = now.getFullYear();
        const thisYearBookings = userBookings.filter(booking => 
          booking.bookingDate.getFullYear() === thisYear && 
          booking.interviewType === 'regular_annual'
        );
        
        if (thisYearBookings.length >= 1) {
          return { allowed: false, reason: '年次定期面談は年1回までです' };
        }
      } else {
        // 随時面談の制限（四半期2回まで）
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const recentAdhocBookings = userBookings.filter(booking => 
          booking.bookingDate >= threeMonthsAgo && 
          booking.interviewType === 'ad_hoc'
        );
        
        if (recentAdhocBookings.length >= 2) {
          return { allowed: false, reason: '随時面談は四半期2回までです' };
        }
      }
    } else if (profile.employmentStatus === 'management') {
      // 管理職のルール（半年に1回）
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentManagementBookings = userBookings.filter(booking => 
        booking.bookingDate >= sixMonthsAgo && 
        booking.interviewType === 'management_biannual'
      );
      
      if (request.interviewType === 'management_biannual' && recentManagementBookings.length >= 1) {
        return { allowed: false, reason: '管理職面談は半年に1回までです' };
      }
    }
    
    return { allowed: true };
  }

  // 従来の予約制限チェック（後方互換性）
  private async checkLegacyBookingLimits(
    userBookings: InterviewBooking[], 
    request: BookingRequest
  ): Promise<{ allowed: boolean; reason?: string }> {
    // 月の予約上限チェック
    const thisMonthBookings = userBookings.filter(b => 
      this.isSameMonth(b.createdAt, new Date())
    );
    
    if (thisMonthBookings.length >= this.scheduleConfig.maxBookingsPerMonth) {
      return {
        allowed: false,
        reason: `月の予約上限（${this.scheduleConfig.maxBookingsPerMonth}回）に達しています`
      };
    }
    
    // 最後の予約からの間隔チェック
    const lastBooking = userBookings
      .filter(b => b.status === 'completed')
      .sort((a, b) => b.conductedAt!.getTime() - a.conductedAt!.getTime())[0];
    
    if (lastBooking && lastBooking.conductedAt) {
      const daysSinceLastBooking = Math.floor(
        (Date.now() - lastBooking.conductedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastBooking < this.scheduleConfig.minIntervalBetweenBookings) {
        return {
          allowed: false,
          reason: `前回の面談から${this.scheduleConfig.minIntervalBetweenBookings}日経過してから予約してください`
        };
      }
    }
    
    return { allowed: true };
  }
  
  // === データ初期化 ===
  private initializeDefaultConfig(): void {
    this.scheduleConfig = {
      slotDuration: 30,
      breakDuration: 10,
      workingHours: {
        start: "13:40",
        end: "17:00"
      },
      workingDays: ['月', '火', '水', '木', '金'],
      holidays: [],
      closedDates: [],
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 24,
      maxBookingsPerMonth: 2,
      minIntervalBetweenBookings: 30
    };
  }
  
  private initializeDefaultInterviewers(): void {
    const defaultInterviewers: Interviewer[] = [
      {
        id: 'interviewer_001',
        name: '田中 キャリア支援部門長',
        title: 'キャリア支援部門長',
        department: '人財統括本部',
        permissionLevel: PermissionLevel.LEVEL_7,
        specialties: ['career_path', 'skill_development', 'promotion'],
        isActive: true,
        workingDays: ['月', '火', '水', '木', '金'],
        workingHours: { start: "13:40", end: "17:00" },
        currentBookings: 0,
        maxBookingsPerDay: 4,
        maxBookingsPerWeek: 15,
        email: 'tanaka.career@hospital.com',
        totalInterviews: 150,
        averageRating: 4.8,
        bio: 'キャリア支援の専門家として10年の経験'
      },
      {
        id: 'interviewer_002',
        name: '佐藤 キャリア相談員',
        title: 'キャリア支援部門員',
        department: '人財統括本部',
        permissionLevel: PermissionLevel.LEVEL_6,
        specialties: ['work_environment', 'interpersonal', 'training'],
        isActive: true,
        workingDays: ['月', '火', '水', '木', '金'],
        workingHours: { start: "13:40", end: "16:10" },
        currentBookings: 0,
        maxBookingsPerDay: 3,
        maxBookingsPerWeek: 12,
        email: 'sato.counselor@hospital.com',
        totalInterviews: 89,
        averageRating: 4.6,
        bio: '職場環境改善とコミュニケーション支援が専門'
      }
    ];
    
    defaultInterviewers.forEach(interviewer => {
      this.interviewers.set(interviewer.id, interviewer);
    });
  }
  
  private generateDefaultTimeSlots(): void {
    // 今日から30日分の時間枠を生成
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      if (this.isWorkingDay(date)) {
        const slots = this.generateSlotsForDate(date);
        this.timeSlots.set(this.getDateKey(date), slots);
      }
    }
  }
  
  private generateSlotsForDate(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const slotTimes = [
      { start: "13:40", end: "14:10" },
      { start: "14:20", end: "14:50" },
      { start: "15:00", end: "15:30" },
      { start: "15:40", end: "16:10" },
      { start: "16:20", end: "16:50" }
    ];
    
    slotTimes.forEach((time, index) => {
      slots.push({
        id: `slot_${this.getDateKey(date)}_${index}`,
        date: new Date(date),
        startTime: time.start,
        endTime: time.end,
        isAvailable: true,
        isBlocked: false
      });
    });
    
    return slots;
  }
  
  // === ヘルパーメソッド ===
  private generateBookingId(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  private isWorkingDay(date: Date): boolean {
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return this.scheduleConfig.workingDays.includes(dayOfWeek);
  }
  
  private isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
  }
  
  private canRequestBooking(employeeId: string): boolean {
    // 基本的にすべてのユーザーが面談予約可能
    return true;
  }
  
  private async getEmployeeName(employeeId: string): Promise<string> {
    // 実装では、ユーザーサービスから取得
    return `従業員${employeeId}`;
  }
  
  private async getEmployeeEmail(employeeId: string): Promise<string> {
    return `${employeeId}@hospital.com`;
  }
  
  private async getEmployeePhone(employeeId: string): Promise<string> {
    return '090-0000-0000';
  }
  
  private async getEmployeeFacility(employeeId: string): Promise<string> {
    return '本院';
  }
  
  private async getEmployeeDepartment(employeeId: string): Promise<string> {
    return '内科';
  }
  
  private async getEmployeePosition(employeeId: string): Promise<string> {
    return '看護師';
  }
  
  private async getAvailableSlotsForDate(date: Date): Promise<TimeSlot[]> {
    const dateKey = this.getDateKey(date);
    const slots = this.timeSlots.get(dateKey) || [];
    return slots.filter(slot => slot.isAvailable && !slot.isBlocked);
  }
  
  private async getAvailableSlots(startDate: Date, days: number): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const daySlots = await this.getAvailableSlotsForDate(date);
      slots.push(...daySlots);
    }
    
    return slots;
  }
  
  private async getBlockedSlots(startDate: Date, days: number): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dateKey = this.getDateKey(date);
      const daySlots = this.timeSlots.get(dateKey) || [];
      const blockedSlots = daySlots.filter(slot => slot.isBlocked);
      slots.push(...blockedSlots);
    }
    
    return slots;
  }
  
  private async getInterviewerAvailability() {
    const interviewers = Array.from(this.interviewers.values());
    
    return Promise.all(interviewers.map(async interviewer => ({
      interviewer,
      availableSlots: await this.getInterviewerAvailableSlots(interviewer.id, {
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
    })));
  }
  
  private async getInterviewerAvailableSlots(interviewerId: string, dateRange: { start: Date; end: Date }): Promise<TimeSlot[]> {
    // 面談者の利用可能スロットを取得（実装は簡略化）
    return this.getAvailableSlots(dateRange.start, 7);
  }
  
  private isInterviewerAvailable(interviewer: Interviewer, slot: TimeSlot): boolean {
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][slot.date.getDay()];
    return interviewer.workingDays.includes(dayOfWeek) &&
           slot.startTime >= interviewer.workingHours.start &&
           slot.endTime <= interviewer.workingHours.end;
  }
  
  private async calculateStats(): Promise<InterviewStats> {
    const allBookings = Array.from(this.bookings.values());
    
    // 基本統計の計算（簡略化）
    return {
      totalBookings: allBookings.length,
      completedInterviews: allBookings.filter(b => b.status === 'completed').length,
      pendingBookings: allBookings.filter(b => b.status === 'pending').length,
      cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
      noShowCount: allBookings.filter(b => b.status === 'no_show').length,
      byType: {} as any,
      byCategory: {} as any,
      byStatus: {} as any,
      thisMonth: 0,
      lastMonth: 0,
      thisQuarter: 0,
      popularTimeSlots: [],
      byInterviewer: []
    };
  }
  
  private filterBookingsByDate(bookings: InterviewBooking[], date: Date): InterviewBooking[] {
    return bookings.filter(booking => 
      this.getDateKey(booking.bookingDate) === this.getDateKey(date)
    );
  }
  
  private filterBookingsByDateRange(bookings: InterviewBooking[], start: Date, end: Date): InterviewBooking[] {
    return bookings.filter(booking => 
      booking.bookingDate >= start && booking.bookingDate <= end
    );
  }
  
  private getWeekStart(date: Date): Date {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // 月曜日
    return start;
  }
  
  private getWeekEnd(date: Date): Date {
    const end = new Date(date);
    end.setDate(end.getDate() - end.getDay() + 7); // 日曜日
    return end;
  }
  
  private async sendBookingNotification(booking: InterviewBooking, type: NotificationType): Promise<void> {
    // 通知送信の実装（簡略化）
    console.log(`Sending ${type} notification for booking ${booking.id}`);
  }
  
  private async scheduleFollowUpReminder(booking: InterviewBooking, followUpDate: Date): Promise<void> {
    // フォローアップリマインダーの実装（簡略化）
    console.log(`Scheduling follow-up reminder for booking ${booking.id} on ${followUpDate}`);
  }

  // === 新機能：医療従事者向け面談管理 ===
  
  // 面談完了処理（拡張版）
  async completeInterview(
    bookingId: string, 
    outcome: any, 
    adminId: string, 
    adminLevel: PermissionLevel
  ): Promise<BookingResponse> {
    if (adminLevel < PermissionLevel.LEVEL_6) {
      return { success: false, message: '面談完了処理の権限がありません' };
    }
    
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return { success: false, message: '予約が見つかりません' };
    }
    
    // 面談完了処理
    booking.status = 'completed';
    booking.conductedAt = new Date();
    booking.outcome = outcome;
    booking.lastModified = new Date();
    booking.modifiedBy = adminId;
    
    // リマインダーサービスに面談完了を通知
    await this.reminderService.onInterviewCompleted(
      booking.employeeId, 
      booking.interviewType, 
      booking.conductedAt
    );
    
    return {
      success: true,
      message: '面談が完了しました',
      bookingId
    };
  }

  // 職員プロフィール管理
  async updateEmployeeProfile(profile: MedicalEmployeeProfile): Promise<void> {
    await this.reminderService.updateEmployeeProfile(profile);
  }

  // 職員の面談履歴取得
  async getEmployeeInterviewHistory(employeeId: string): Promise<InterviewBooking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.employeeId === employeeId)
      .sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime());
  }

  // 職員の次回面談予定日取得
  async getNextInterviewSchedule(employeeId: string): Promise<Date | null> {
    return this.reminderService.calculateNextInterviewDate(employeeId);
  }

  // リマインダー状況取得
  async getReminderStatus(employeeId: string): Promise<any> {
    const reminderSchedule = await this.reminderService.generateReminderSchedule(employeeId);
    const profile = this.reminderService.getEmployeeProfile(employeeId);
    
    return {
      profile,
      reminderSchedule,
      nextInterviewDue: reminderSchedule?.nextInterviewDue,
      isOverdue: reminderSchedule?.isOverdue
    };
  }

  // 今日送信すべきリマインダー取得
  async getTodaysReminders(): Promise<any[]> {
    const reminders = await this.reminderService.getTodaysReminders();
    
    // 通知サービスに送信
    const notificationPromises = reminders.map(async (reminder) => {
      const profile = this.reminderService.getEmployeeProfile(reminder.employeeId);
      if (!profile) return;

      for (const reminderDate of reminder.reminderDates) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        if (reminderDate.date >= today && reminderDate.date <= todayEnd) {
          await this.notificationService.sendInterviewReminder(
            reminder.employeeId,
            reminderDate.type as any,
            {
              employeeName: profile.employeeName,
              interviewType: this.getInterviewTypeDisplayName(reminderDate.type),
              dueDate: reminder.nextInterviewDue,
              daysBefore: Math.ceil((reminder.nextInterviewDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
              daysOverdue: reminder.daysSinceOverdue
            }
          );
        }
      }
    });

    await Promise.all(notificationPromises);
    return reminders;
  }

  // 面談タイプの表示名を取得
  private getInterviewTypeDisplayName(type: string): string {
    const typeNames: Record<string, string> = {
      'INTERVIEW_REMINDER_FIRST': '初回面談',
      'INTERVIEW_REMINDER_MONTHLY': '月次面談', 
      'INTERVIEW_REMINDER_ANNUAL': '年次面談',
      'INTERVIEW_OVERDUE': '期限超過面談'
    };
    return typeNames[type] || '面談';
  }

  // 部署別カスタマイズ適用
  async applyDepartmentCustomizations(department: string): Promise<void> {
    this.reminderService.applyDepartmentCustomizations(department);
  }

  // 一括リマインダー送信（日次バッチ処理）
  async runDailyReminderBatch(): Promise<void> {
    console.log('🔄 日次リマインダーバッチ処理を開始...');

    try {
      const todaysReminders = await this.getTodaysReminders();
      console.log(`✅ 本日のリマインダー処理完了: ${todaysReminders.length}件`);
    } catch (error) {
      console.error('❌ 日次リマインダーバッチ処理でエラーが発生:', error);
    }
  }

  // === キャンセル・変更機能 ===

  // 予約キャンセル
  async cancelBooking(
    bookingId: string,
    reason: CancellationReason,
    customReason: string | undefined,
    cancelledBy: string
  ): Promise<BookingCancellationResponse> {
    try {
      const booking = this.bookings.get(bookingId);
      if (!booking) {
        return {
          success: false,
          message: '予約が見つかりません'
        };
      }

      // キャンセル可能かチェック
      const canCancel = this.canCancelBooking(booking);
      if (!canCancel.allowed) {
        return {
          success: false,
          message: canCancel.reason || 'この予約はキャンセルできません'
        };
      }

      // 時間枠を解放
      const timeSlot = booking.timeSlot;
      timeSlot.isAvailable = true;
      timeSlot.bookedBy = undefined;
      timeSlot.bookingId = undefined;

      // 予約をキャンセル状態に更新
      booking.status = 'cancelled';
      booking.cancellationReason = customReason || this.getCancellationReasonText(reason);
      booking.cancelledAt = new Date();
      booking.cancelledBy = cancelledBy;
      booking.lastModified = new Date();
      booking.modifiedBy = cancelledBy;

      // MCP連携：職員カルテシステムに通知
      await this.notifyMCPCancellation(booking);

      // 関係者への通知
      await this.sendCancellationNotifications(booking);

      // 代替案の提案
      const alternatives = await this.getSuggestedAlternatives({
        employeeId: booking.employeeId,
        preferredDates: [booking.bookingDate],
        preferredTimes: [booking.timeSlot.startTime],
        interviewType: booking.interviewType,
        interviewCategory: booking.interviewCategory,
        requestedTopics: booking.requestedTopics,
        urgencyLevel: booking.urgencyLevel
      });

      return {
        success: true,
        message: '面談をキャンセルしました',
        refundEligible: this.isRefundEligible(booking),
        alternativeSuggestions: alternatives
      };

    } catch (error) {
      console.error('Booking cancellation failed:', error);
      return {
        success: false,
        message: 'キャンセル処理中にエラーが発生しました'
      };
    }
  }

  // 日時変更リクエスト
  async requestReschedule(
    bookingId: string,
    preferredDates: Date[],
    reason: string,
    requestedBy: string
  ): Promise<BookingRescheduleResponse> {
    try {
      const booking = this.bookings.get(bookingId);
      if (!booking) {
        return {
          success: false,
          message: '予約が見つかりません',
          requiresApproval: false
        };
      }

      // 変更可能かチェック
      const canReschedule = this.canRescheduleBooking(booking);
      if (!canReschedule.allowed) {
        return {
          success: false,
          message: canReschedule.reason || 'この予約は変更できません',
          requiresApproval: false
        };
      }

      // 変更リクエストを作成
      const rescheduleRequest: RescheduleRequest = {
        id: this.generateRescheduleRequestId(),
        bookingId,
        requestedBy,
        requestedAt: new Date(),
        currentDateTime: booking.bookingDate,
        preferredDates,
        reason,
        status: 'pending'
      };

      // 予約に変更リクエストを追加
      if (!booking.rescheduleRequests) {
        booking.rescheduleRequests = [];
      }
      booking.rescheduleRequests.push(rescheduleRequest);
      booking.status = 'reschedule_pending';
      booking.lastModified = new Date();
      booking.modifiedBy = requestedBy;

      // MCP連携：職員カルテシステムに通知
      await this.notifyMCPRescheduleRequest(booking, rescheduleRequest);

      // 管理者への承認依頼通知
      await this.sendRescheduleApprovalRequest(booking, rescheduleRequest);

      // 代替案の提案
      const alternatives = await this.getSuggestedAlternatives({
        employeeId: booking.employeeId,
        preferredDates,
        preferredTimes: [booking.timeSlot.startTime],
        interviewType: booking.interviewType,
        interviewCategory: booking.interviewCategory,
        requestedTopics: booking.requestedTopics,
        urgencyLevel: booking.urgencyLevel
      });

      return {
        success: true,
        message: '日時変更リクエストを送信しました。承認をお待ちください。',
        requestId: rescheduleRequest.id,
        requiresApproval: true,
        suggestedAlternatives: alternatives
      };

    } catch (error) {
      console.error('Reschedule request failed:', error);
      return {
        success: false,
        message: '変更リクエスト処理中にエラーが発生しました',
        requiresApproval: false
      };
    }
  }

  // 日時変更承認（管理者用）
  async approveReschedule(
    requestId: string,
    approvedDateTime: Date,
    reviewedBy: string,
    adminLevel: PermissionLevel
  ): Promise<BookingResponse> {
    if (adminLevel < PermissionLevel.LEVEL_5) {
      return { success: false, message: '変更承認の権限がありません' };
    }

    try {
      // リクエストを見つける
      let targetBooking: InterviewBooking | null = null;
      let targetRequest: RescheduleRequest | null = null;

      for (const booking of this.bookings.values()) {
        const request = booking.rescheduleRequests?.find(r => r.id === requestId);
        if (request) {
          targetBooking = booking;
          targetRequest = request;
          break;
        }
      }

      if (!targetBooking || !targetRequest) {
        return { success: false, message: '変更リクエストが見つかりません' };
      }

      // 新しい時間枠を確保
      const newSlot = await this.findAvailableSlotForDateTime(approvedDateTime);
      if (!newSlot) {
        return { success: false, message: '指定された日時は利用できません' };
      }

      // 元の時間枠を解放
      const oldSlot = targetBooking.timeSlot;
      oldSlot.isAvailable = true;
      oldSlot.bookedBy = undefined;
      oldSlot.bookingId = undefined;

      // 新しい時間枠を予約
      newSlot.isAvailable = false;
      newSlot.bookedBy = targetBooking.employeeId;
      newSlot.bookingId = targetBooking.id;

      // 予約を更新
      targetBooking.bookingDate = approvedDateTime;
      targetBooking.timeSlot = newSlot;
      targetBooking.status = 'confirmed';
      targetBooking.lastModified = new Date();
      targetBooking.modifiedBy = reviewedBy;

      // リクエストを承認済みに更新
      targetRequest.status = 'approved';
      targetRequest.approvedDateTime = approvedDateTime;
      targetRequest.reviewedBy = reviewedBy;
      targetRequest.reviewedAt = new Date();

      // MCP連携：職員カルテシステムに通知
      await this.notifyMCPRescheduleApproval(targetBooking, targetRequest);

      // 職員への承認通知
      await this.sendRescheduleApprovalNotification(targetBooking, targetRequest);

      return {
        success: true,
        message: '日時変更を承認しました',
        bookingId: targetBooking.id
      };

    } catch (error) {
      console.error('Reschedule approval failed:', error);
      return {
        success: false,
        message: '承認処理中にエラーが発生しました'
      };
    }
  }

  // 日時変更拒否（管理者用）
  async rejectReschedule(
    requestId: string,
    rejectionReason: string,
    reviewedBy: string,
    adminLevel: PermissionLevel
  ): Promise<BookingResponse> {
    if (adminLevel < PermissionLevel.LEVEL_5) {
      return { success: false, message: '変更承認の権限がありません' };
    }

    try {
      // リクエストを見つける
      let targetBooking: InterviewBooking | null = null;
      let targetRequest: RescheduleRequest | null = null;

      for (const booking of this.bookings.values()) {
        const request = booking.rescheduleRequests?.find(r => r.id === requestId);
        if (request) {
          targetBooking = booking;
          targetRequest = request;
          break;
        }
      }

      if (!targetBooking || !targetRequest) {
        return { success: false, message: '変更リクエストが見つかりません' };
      }

      // リクエストを拒否済みに更新
      targetRequest.status = 'rejected';
      targetRequest.rejectionReason = rejectionReason;
      targetRequest.reviewedBy = reviewedBy;
      targetRequest.reviewedAt = new Date();

      // 予約ステータスを元に戻す
      targetBooking.status = 'confirmed';
      targetBooking.lastModified = new Date();
      targetBooking.modifiedBy = reviewedBy;

      // 職員への拒否通知
      await this.sendRescheduleRejectionNotification(targetBooking, targetRequest);

      return {
        success: true,
        message: '日時変更リクエストを拒否しました',
        bookingId: targetBooking.id
      };

    } catch (error) {
      console.error('Reschedule rejection failed:', error);
      return {
        success: false,
        message: '拒否処理中にエラーが発生しました'
      };
    }
  }

  // === プライベートメソッド ===

  // キャンセル可能かチェック
  private canCancelBooking(booking: InterviewBooking): { allowed: boolean; reason?: string } {
    if (booking.status === 'cancelled') {
      return { allowed: false, reason: '既にキャンセル済みです' };
    }

    if (booking.status === 'completed') {
      return { allowed: false, reason: '完了した面談はキャンセルできません' };
    }

    // キャンセル期限チェック（面談2時間前まで）
    const now = new Date();
    const bookingTime = new Date(booking.bookingDate);
    const [hours, minutes] = booking.timeSlot.startTime.split(':').map(Number);
    bookingTime.setHours(hours, minutes, 0, 0);

    const timeDiff = bookingTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDiff / (1000 * 60 * 60);

    if (hoursUntilBooking < 2) {
      return { allowed: false, reason: '面談開始2時間前以降はキャンセルできません' };
    }

    return { allowed: true };
  }

  // 変更可能かチェック
  private canRescheduleBooking(booking: InterviewBooking): { allowed: boolean; reason?: string } {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return { allowed: false, reason: 'この予約は変更できません' };
    }

    if (booking.status === 'reschedule_pending') {
      return { allowed: false, reason: '既に変更申請中です' };
    }

    // 変更期限チェック（面談1日前まで）
    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);
    const timeDiff = bookingDate.getTime() - now.getTime();
    const daysUntilBooking = timeDiff / (1000 * 60 * 60 * 24);

    if (daysUntilBooking < 1) {
      return { allowed: false, reason: '面談前日以降は変更できません' };
    }

    return { allowed: true };
  }

  // MCP連携通知
  private async notifyMCPCancellation(booking: InterviewBooking): Promise<void> {
    // 職員カルテシステムへのキャンセル通知
    console.log(`MCP通知: 面談キャンセル - ${booking.employeeId} - ${booking.id}`);
    // TODO: 実際のMCP連携実装
  }

  private async notifyMCPRescheduleRequest(booking: InterviewBooking, request: RescheduleRequest): Promise<void> {
    // 職員カルテシステムへの変更リクエスト通知
    console.log(`MCP通知: 日時変更リクエスト - ${booking.employeeId} - ${request.id}`);
    // TODO: 実際のMCP連携実装
  }

  private async notifyMCPRescheduleApproval(booking: InterviewBooking, request: RescheduleRequest): Promise<void> {
    // 職員カルテシステムへの変更承認通知
    console.log(`MCP通知: 日時変更承認 - ${booking.employeeId} - ${request.id}`);
    // TODO: 実際のMCP連携実装
  }

  // 通知送信
  private async sendCancellationNotifications(booking: InterviewBooking): Promise<void> {
    await this.sendBookingNotification(booking, 'booking_cancelled');
    // 面談者への通知
    if (booking.interviewerId) {
      console.log(`面談者通知: キャンセル - ${booking.interviewerName}`);
    }
  }

  private async sendRescheduleApprovalRequest(booking: InterviewBooking, request: RescheduleRequest): Promise<void> {
    console.log(`承認依頼通知: 日時変更 - ${booking.id} - ${request.id}`);
    // TODO: 管理者への承認依頼通知実装
  }

  private async sendRescheduleApprovalNotification(booking: InterviewBooking, request: RescheduleRequest): Promise<void> {
    await this.sendBookingNotification(booking, 'booking_rescheduled');
  }

  private async sendRescheduleRejectionNotification(booking: InterviewBooking, request: RescheduleRequest): Promise<void> {
    console.log(`変更拒否通知: ${booking.employeeId} - ${request.rejectionReason}`);
    // TODO: 拒否通知実装
  }

  // ユーティリティ
  private getCancellationReasonText(reason: CancellationReason): string {
    const reasons = {
      emergency: '緊急事態のため',
      illness: '体調不良のため',
      work_conflict: '業務都合のため',
      schedule_change: 'スケジュール変更のため',
      personal: '個人的事情のため',
      other: 'その他の理由'
    };
    return reasons[reason];
  }

  private isRefundEligible(booking: InterviewBooking): boolean {
    // 面談24時間前までならrefund eligible
    const now = new Date();
    const bookingTime = new Date(booking.bookingDate);
    const timeDiff = bookingTime.getTime() - now.getTime();
    return timeDiff > (24 * 60 * 60 * 1000);
  }

  private generateRescheduleRequestId(): string {
    return `reschedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async findAvailableSlotForDateTime(dateTime: Date): Promise<TimeSlot | null> {
    const dateKey = this.getDateKey(dateTime);
    const slots = this.timeSlots.get(dateKey) || [];
    const targetHour = dateTime.getHours();
    const targetMinute = dateTime.getMinutes();
    const targetTime = `${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`;

    return slots.find(slot => slot.startTime === targetTime && slot.isAvailable) || null;
  }

  // === デモデータ生成 ===
  private generateDemoBookings(): void {
    const demoUsers = [
      {
        id: 'demo-user-1',
        name: '田中 花子',
        email: 'tanaka.hanako@hospital.com',
        phone: '090-1234-5678',
        facility: '本院',
        department: '内科病棟',
        position: '看護師'
      },
      {
        id: 'demo-user-2',
        name: '佐藤 太郎',
        email: 'sato.taro@hospital.com',
        phone: '090-2345-6789',
        facility: '本院',
        department: '外科病棟',
        position: '看護師'
      },
      {
        id: 'demo-user-3',
        name: '鈴木 美咲',
        email: 'suzuki.misaki@hospital.com',
        phone: '090-3456-7890',
        facility: '本院',
        department: '小児科',
        position: '看護師'
      },
      {
        id: 'user-8', // デモモードのデフォルトユーザー
        name: '森本 恵理香',
        email: 'morimoto.erika@hospital.com',
        phone: '090-4567-8901',
        facility: '本院',
        department: '人事部',
        position: '人事部門長'
      }
    ];

    // 今日から1週間の期間で予約データを生成
    const today = new Date();
    const demoBookings: InterviewBooking[] = [];

    // 1. 今日の午後（キャンセル不可）
    const todayBooking = this.createDemoBooking({
      user: demoUsers[3], // user-8 (デフォルトユーザー)
      dateOffset: 0,
      timeSlot: { startTime: "14:20", endTime: "14:50" },
      interviewType: 'regular_annual',
      status: 'confirmed',
      description: 'パフォーマンス評価について相談'
    });
    if (todayBooking) demoBookings.push(todayBooking);

    // 2. 明日（キャンセル可能）
    const tomorrowBooking = this.createDemoBooking({
      user: demoUsers[3],
      dateOffset: 1,
      timeSlot: { startTime: "15:00", endTime: "15:30" },
      interviewType: 'career_support',
      status: 'confirmed',
      description: 'キャリア開発計画について'
    });
    if (tomorrowBooking) demoBookings.push(tomorrowBooking);

    // 3. 3日後（キャンセル・変更可能）
    const futureBooking = this.createDemoBooking({
      user: demoUsers[3],
      dateOffset: 3,
      timeSlot: { startTime: "13:40", endTime: "14:10" },
      interviewType: 'workplace_support',
      status: 'confirmed',
      description: '職場環境改善についての相談'
    });
    if (futureBooking) demoBookings.push(futureBooking);

    // 4. 1週間後（変更可能）
    const weekLaterBooking = this.createDemoBooking({
      user: demoUsers[3],
      dateOffset: 7,
      timeSlot: { startTime: "16:20", endTime: "16:50" },
      interviewType: 'individual_consultation',
      status: 'pending',
      description: '個別相談事項について'
    });
    if (weekLaterBooking) demoBookings.push(weekLaterBooking);

    // 5. 過去の面談（履歴）
    const pastBooking = this.createDemoBooking({
      user: demoUsers[3],
      dateOffset: -7,
      timeSlot: { startTime: "14:20", endTime: "14:50" },
      interviewType: 'feedback',
      status: 'completed',
      description: '前回のフォローアップ面談'
    });
    if (pastBooking) {
      pastBooking.conductedAt = new Date(pastBooking.bookingDate);
      pastBooking.outcome = {
        summary: 'チーム内のコミュニケーション向上について話し合った',
        actionItems: ['チームミーティングの改善', '報告書の簡素化'],
        followUpRequired: false,
        confidentialityLevel: 'open'
      };
      demoBookings.push(pastBooking);
    }

    // 6. キャンセル済み面談
    const cancelledBooking = this.createDemoBooking({
      user: demoUsers[3],
      dateOffset: 5,
      timeSlot: { startTime: "15:40", endTime: "16:10" },
      interviewType: 'career_support',
      status: 'cancelled',
      description: '元々予定していたキャリア面談'
    });
    if (cancelledBooking) {
      cancelledBooking.cancellationReason = '業務都合のため';
      cancelledBooking.cancelledAt = new Date();
      cancelledBooking.cancelledBy = demoUsers[3].id;
      demoBookings.push(cancelledBooking);
    }

    // 他のユーザーの予約も追加
    demoBookings.push(...this.createOtherUsersDemoBookings(demoUsers.slice(0, 3)));

    // 予約データを保存
    demoBookings.forEach(booking => {
      this.bookings.set(booking.id, booking);
    });

    console.log(`✅ デモ面談予約データ ${demoBookings.length}件を生成しました`);
  }

  private createDemoBooking(config: {
    user: any;
    dateOffset: number;
    timeSlot: { startTime: string; endTime: string };
    interviewType: any;
    status: any;
    description: string;
  }): InterviewBooking | null {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + config.dateOffset);

    // 平日のみ（土日はスキップ）
    if (bookingDate.getDay() === 0 || bookingDate.getDay() === 6) {
      return null;
    }

    const dateKey = this.getDateKey(bookingDate);
    const slots = this.timeSlots.get(dateKey) || [];
    const slot = slots.find(s => s.startTime === config.timeSlot.startTime);

    if (!slot) return null;

    // 時間枠を予約済みに設定（キャンセル済み以外）
    if (config.status !== 'cancelled') {
      slot.isAvailable = false;
      slot.bookedBy = config.user.id;
    }

    const booking: InterviewBooking = {
      id: `demo-booking-${config.user.id}-${config.dateOffset}`,
      employeeId: config.user.id,
      employeeName: config.user.name,
      employeeEmail: config.user.email,
      employeePhone: config.user.phone,
      facility: config.user.facility,
      department: config.user.department,
      position: config.user.position,
      bookingDate: bookingDate,
      timeSlot: {
        ...slot,
        bookingId: `demo-booking-${config.user.id}-${config.dateOffset}`
      },
      interviewType: config.interviewType,
      interviewCategory: this.getDefaultCategory(config.interviewType),
      requestedTopics: this.getDefaultTopics(config.interviewType),
      description: config.description,
      urgencyLevel: 'medium',
      interviewerId: 'interviewer_001',
      interviewerName: '田中 キャリア支援部門長',
      interviewerLevel: 7,
      status: config.status,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      createdBy: config.user.id
    };

    return booking;
  }

  private createOtherUsersDemoBookings(users: any[]): InterviewBooking[] {
    const bookings: InterviewBooking[] = [];

    users.forEach((user, index) => {
      // 各ユーザーに1-2件の予約を追加
      const booking1 = this.createDemoBooking({
        user,
        dateOffset: index + 2,
        timeSlot: { startTime: "14:20", endTime: "14:50" },
        interviewType: 'new_employee_monthly',
        status: 'confirmed',
        description: '新入職員定期面談'
      });
      if (booking1) bookings.push(booking1);

      if (index === 0) {
        // 田中さんにもう1件追加
        const booking2 = this.createDemoBooking({
          user,
          dateOffset: 6,
          timeSlot: { startTime: "16:20", endTime: "16:50" },
          interviewType: 'workplace_support',
          status: 'pending',
          description: '職場適応について'
        });
        if (booking2) bookings.push(booking2);
      }
    });

    return bookings;
  }

  private getDefaultCategory(interviewType: string): any {
    const categoryMap: any = {
      'career_support': 'career_path',
      'workplace_support': 'work_environment',
      'individual_consultation': 'interpersonal',
      'feedback': 'performance',
      'regular_annual': 'performance',
      'new_employee_monthly': 'skill_development'
    };
    return categoryMap[interviewType] || 'other';
  }

  private getDefaultTopics(interviewType: string): string[] {
    const topicMap: any = {
      'career_support': ['キャリアプラン', 'スキルアップ', '昇進について'],
      'workplace_support': ['職場環境', 'チームワーク', 'ワークライフバランス'],
      'individual_consultation': ['個別相談', 'サポートが必要な事項'],
      'feedback': ['パフォーマンス評価', '改善点', '今後の目標'],
      'regular_annual': ['年次評価', '目標設定', '成果確認'],
      'new_employee_monthly': ['適応状況', '研修進捗', '不安な点']
    };
    return topicMap[interviewType] || ['その他'];
  }
}