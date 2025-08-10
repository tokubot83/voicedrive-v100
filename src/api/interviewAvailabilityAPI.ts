import { InterviewType } from '../types/interview';

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailabilityHeatmap {
  date: string;
  availability: 'high' | 'medium' | 'low';
}

export interface SuggestedSlot {
  date: string;
  time: string;
  reason: string;
}

export interface AvailabilityResponse {
  availableSlots: TimeSlot[];
}

export interface CalendarOptimizationResponse {
  heatmap: AvailabilityHeatmap[];
  suggestedSlots: SuggestedSlot[];
}

export interface BookingConfirmRequest {
  staffId: string;
  interviewType: InterviewType;
  category?: string;
  date: string;
  time: string;
}

export interface BookingConfirmResponse {
  bookingId: string;
  status: 'confirmed' | 'pending';
  notificationSent: boolean;
}

class InterviewAvailabilityAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * 予約可能時間を取得
   */
  async getAvailability(
    staffId: string,
    date: string,
    interviewType: string
  ): Promise<AvailabilityResponse> {
    try {
      const params = new URLSearchParams({
        staffId,
        date,
        interviewType
      });

      const response = await fetch(`${this.baseUrl}/availability?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching availability:', error);
      // モックデータを返す（開発中）
      return this.getMockAvailability(date);
    }
  }

  /**
   * カレンダー最適化情報を取得
   */
  async getCalendarOptimization(
    staffId: string,
    month: string
  ): Promise<CalendarOptimizationResponse> {
    try {
      const params = new URLSearchParams({
        staffId,
        month
      });

      const response = await fetch(`${this.baseUrl}/calendar/optimization?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar optimization: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching calendar optimization:', error);
      // モックデータを返す（開発中）
      return this.getMockCalendarOptimization(month);
    }
  }

  /**
   * 予約を確定
   */
  async confirmBooking(request: BookingConfirmRequest): Promise<BookingConfirmResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to confirm booking: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming booking:', error);
      // モックデータを返す（開発中）
      return {
        bookingId: `BK-${Date.now()}`,
        status: 'confirmed',
        notificationSent: true
      };
    }
  }

  /**
   * 開発用モックデータ: 予約可能時間
   */
  private getMockAvailability(date: string): AvailabilityResponse {
    const baseSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00'
    ];

    const availableSlots = baseSlots.map(time => ({
      time,
      available: Math.random() > 0.3 // 70%の確率で利用可能
    }));

    return { availableSlots };
  }

  /**
   * 開発用モックデータ: カレンダー最適化
   */
  private getMockCalendarOptimization(month: string): CalendarOptimizationResponse {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    
    const heatmap: AvailabilityHeatmap[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const rand = Math.random();
      const availability = rand > 0.7 ? 'high' : rand > 0.3 ? 'medium' : 'low';
      heatmap.push({ date, availability });
    }

    const suggestedSlots: SuggestedSlot[] = [
      {
        date: `${month}-15`,
        time: '14:00',
        reason: '前回の面談から適切な期間が経過しています'
      },
      {
        date: `${month}-20`,
        time: '10:00',
        reason: '午前中の時間帯は集中しやすくおすすめです'
      },
      {
        date: `${month}-25`,
        time: '15:30',
        reason: '他の予約が少なく、ゆったりと面談できます'
      }
    ];

    return { heatmap, suggestedSlots };
  }
}

export default new InterviewAvailabilityAPI();