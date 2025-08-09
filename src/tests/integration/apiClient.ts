/**
 * 統合テスト用APIクライアント
 * 医療職員管理システムとの連携テスト用
 */

export interface BookingRequest {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  facility: string;
  department: string;
  position: string;
  interviewType: string;
  interviewCategory?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  requestedTopics: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  message?: string;
  errors?: string[];
  code?: number;
}

export class IntegrationTestClient {
  private baseURL: string;
  
  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }
  
  /**
   * 予約作成API
   */
  async createBooking(data: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/interviews/bookings/mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          errors: result.errors || [result.message],
          code: response.status
        };
      }
      
      return {
        success: true,
        bookingId: result.bookingId,
        message: result.message
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Network error: ${error}`],
        code: 0
      };
    }
  }
  
  /**
   * 予約一覧取得API
   */
  async getBookings(date: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/v1/interviews/bookings/mock?date=${date}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get bookings:', error);
      throw error;
    }
  }
  
  /**
   * 予約削除API
   */
  async deleteBooking(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/v1/interviews/bookings/mock?bookingId=${bookingId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          errors: result.errors || [result.message],
          code: response.status
        };
      }
      
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Network error: ${error}`],
        code: 0
      };
    }
  }
  
  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}