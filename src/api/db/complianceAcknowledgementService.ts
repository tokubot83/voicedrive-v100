/**
 * コンプライアンス通報 受付確認通知サービス
 *
 * 医療システムからのWebhook通知を受信・保存する
 */

import { prisma } from '../../lib/prisma';
import type { AcknowledgementNotification } from '../../types/whistleblowing';

interface CreateAcknowledgementInput {
  reportId: string;
  anonymousId: string;
  medicalSystemCaseNumber: string;
  severity: string;
  category: string;
  receivedAt: Date;
  estimatedResponseTime: string;
  requiresImmediateAction?: boolean;
  currentStatus?: string;
  nextSteps?: string;
}

interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ComplianceAcknowledgementService {
  /**
   * 受付確認通知を保存
   */
  static async create(input: CreateAcknowledgementInput): Promise<ServiceResult> {
    try {
      const acknowledgement = await prisma.complianceAcknowledgement.create({
        data: {
          reportId: input.reportId,
          anonymousId: input.anonymousId,
          medicalSystemCaseNumber: input.medicalSystemCaseNumber,
          severity: input.severity,
          category: input.category,
          receivedAt: input.receivedAt,
          estimatedResponseTime: input.estimatedResponseTime,
          requiresImmediateAction: input.requiresImmediateAction || false,
          currentStatus: input.currentStatus || 'received',
          nextSteps: input.nextSteps || null,
          processed: true,
          processedAt: new Date()
        }
      });

      return {
        success: true,
        data: acknowledgement
      };
    } catch (error) {
      console.error('[ComplianceAcknowledgementService] Create error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create acknowledgement'
      };
    }
  }

  /**
   * reportIdで受付確認通知を取得
   */
  static async getByReportId(reportId: string): Promise<ServiceResult> {
    try {
      const acknowledgement = await prisma.complianceAcknowledgement.findUnique({
        where: { reportId }
      });

      if (!acknowledgement) {
        return {
          success: false,
          error: 'Acknowledgement not found'
        };
      }

      return {
        success: true,
        data: acknowledgement
      };
    } catch (error) {
      console.error('[ComplianceAcknowledgementService] GetByReportId error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get acknowledgement'
      };
    }
  }

  /**
   * 匿名IDで受付確認通知を取得
   */
  static async getByAnonymousId(anonymousId: string): Promise<ServiceResult> {
    try {
      const acknowledgements = await prisma.complianceAcknowledgement.findMany({
        where: { anonymousId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: acknowledgements
      };
    } catch (error) {
      console.error('[ComplianceAcknowledgementService] GetByAnonymousId error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get acknowledgements'
      };
    }
  }

  /**
   * ケース番号で受付確認通知を取得
   */
  static async getByCaseNumber(caseNumber: string): Promise<ServiceResult> {
    try {
      const acknowledgement = await prisma.complianceAcknowledgement.findUnique({
        where: { medicalSystemCaseNumber: caseNumber }
      });

      if (!acknowledgement) {
        return {
          success: false,
          error: 'Acknowledgement not found'
        };
      }

      return {
        success: true,
        data: acknowledgement
      };
    } catch (error) {
      console.error('[ComplianceAcknowledgementService] GetByCaseNumber error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get acknowledgement'
      };
    }
  }

  /**
   * すべての受付確認通知を取得（ページネーション対応）
   */
  static async list(options?: {
    severity?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ServiceResult> {
    try {
      const where: any = {};

      if (options?.severity) {
        where.severity = options.severity;
      }

      if (options?.status) {
        where.currentStatus = options.status;
      }

      const acknowledgements = await prisma.complianceAcknowledgement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0
      });

      const total = await prisma.complianceAcknowledgement.count({ where });

      return {
        success: true,
        data: {
          items: acknowledgements,
          total,
          limit: options?.limit || 50,
          offset: options?.offset || 0
        }
      };
    } catch (error) {
      console.error('[ComplianceAcknowledgementService] List error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list acknowledgements'
      };
    }
  }

  /**
   * 統計情報を取得
   */
  static async getStatistics(): Promise<ServiceResult> {
    try {
      const total = await prisma.complianceAcknowledgement.count();

      const bySeverity = await prisma.complianceAcknowledgement.groupBy({
        by: ['severity'],
        _count: true
      });

      const byStatus = await prisma.complianceAcknowledgement.groupBy({
        by: ['currentStatus'],
        _count: true
      });

      const byCategory = await prisma.complianceAcknowledgement.groupBy({
        by: ['category'],
        _count: true
      });

      return {
        success: true,
        data: {
          total,
          bySeverity,
          byStatus,
          byCategory
        }
      };
    } catch (error) {
      console.error('[ComplianceAcknowledgementService] GetStatistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get statistics'
      };
    }
  }
}
