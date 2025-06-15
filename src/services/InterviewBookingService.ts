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
  NotificationType
} from '../types/interview';
import { PermissionLevel } from '../permissions/types/PermissionTypes';

export class InterviewBookingService {
  private static instance: InterviewBookingService;
  
  // デモ用データ保存
  private bookings: Map<string, InterviewBooking> = new Map();
  private timeSlots: Map<string, TimeSlot[]> = new Map(); // date -> slots
  private interviewers: Map<string, Interviewer> = new Map();
  private scheduleConfig: InterviewScheduleConfig;
  
  private constructor() {
    this.initializeDefaultConfig();
    this.initializeDefaultInterviewers();
    this.generateDefaultTimeSlots();
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
  
  async completeInterview(
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
  
  private async checkBookingLimits(employeeId: string, request: BookingRequest): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const userBookings = Array.from(this.bookings.values()).filter(
      b => b.employeeId === employeeId
    );
    
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
}