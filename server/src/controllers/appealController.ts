import { Request, Response } from 'express';
import { 
  AppealRequest, 
  AppealResponse, 
  AppealStatus,
  AppealRecord,
  AppealAction
} from '../../../mcp-shared/interfaces/appeal.interface';
import * as appealService from '../services/appealService';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// 異議申し立て送信
export const submitAppeal = async (req: Request, res: Response) => {
  try {
    const appealRequest: AppealRequest = req.body;
    const userId = (req as any).user?.employeeId || appealRequest.employeeId;

    // バリデーション
    if (!appealRequest.appealReason || appealRequest.appealReason.length < 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REASON',
          message: '申し立て理由は100文字以上入力してください'
        }
      });
    }
    
    // 評価期間の有効性チェック
    const eligibilityCheck = await appealService.checkEligibilityPeriod(appealRequest.evaluationPeriod);
    if (!eligibilityCheck) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'E002',
          message: '有効な評価期間が見つかりません、または申し立て期限を過ぎています'
        }
      });
    }

    // 申し立てIDを生成
    const appealId = `AP-2025-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // 期待される応答日を計算（3週間後）
    const expectedResponseDate = new Date();
    expectedResponseDate.setDate(expectedResponseDate.getDate() + 21);

    // 異議申し立てレコードを作成
    const appealRecord: AppealRecord = {
      appealId,
      employeeId: appealRequest.employeeId,
      employeeName: appealRequest.employeeName,
      departmentId: appealRequest.departmentId,
      evaluationPeriod: appealRequest.evaluationPeriod,
      appealCategory: appealRequest.appealCategory,
      appealReason: appealRequest.appealReason,
      originalScore: appealRequest.originalScore,
      requestedScore: appealRequest.requestedScore,
      status: AppealStatus.RECEIVED,
      evidenceDocuments: appealRequest.evidenceDocuments,
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedVia: 'voicedrive',
      communicationLog: []
    };

    // MCP共有フォルダに保存
    await appealService.saveAppealToMCP(appealRecord);

    // ログ記録
    await appealService.logAppealAction({
      timestamp: new Date().toISOString(),
      appealId,
      action: AppealAction.SUBMIT,
      userId,
      details: { appealRequest }
    });

    // 管理者への通知
    await appealService.notifyAdministrators(appealRecord);

    const response: AppealResponse = {
      success: true,
      appealId,
      message: '異議申し立てを受け付けました',
      expectedResponseDate: expectedResponseDate.toISOString().split('T')[0],
      details: {
        status: AppealStatus.RECEIVED,
        processedAt: new Date().toISOString(),
        priority: appealService.calculatePriority(appealRequest)
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('異議申し立て送信エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMIT_ERROR',
        message: '異議申し立ての送信に失敗しました',
        details: error.message
      }
    });
  }
};

// 異議申し立て一覧取得
export const getAppeals = async (req: Request, res: Response) => {
  try {
    const employeeId = req.query.employeeId as string || (req as any).user?.employeeId;
    
    const appeals = await appealService.getAppealsByEmployeeId(employeeId);
    
    res.json({
      success: true,
      data: appeals
    });
  } catch (error: any) {
    console.error('一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: '異議申し立て一覧の取得に失敗しました'
      }
    });
  }
};

// 特定の異議申し立てステータス取得
export const getAppealStatus = async (req: Request, res: Response) => {
  try {
    const { appealId } = req.params;
    
    const appeal = await appealService.getAppealById(appealId);
    
    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '異議申し立てが見つかりません'
        }
      });
    }

    res.json({
      success: true,
      data: appeal
    });
  } catch (error: any) {
    console.error('ステータス取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'ステータスの取得に失敗しました'
      }
    });
  }
};

// 異議申し立て更新（追加情報提出）
export const updateAppeal = async (req: Request, res: Response) => {
  try {
    const { appealId, ...updateData } = req.body;
    const userId = (req as any).user?.employeeId;

    const appeal = await appealService.getAppealById(appealId);
    
    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '異議申し立てが見つかりません'
        }
      });
    }

    // 更新可能なステータスか確認
    if (![AppealStatus.RECEIVED, AppealStatus.UNDER_REVIEW, AppealStatus.ADDITIONAL_INFO].includes(appeal.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '現在のステータスでは更新できません'
        }
      });
    }

    // 更新実行
    const updatedAppeal = await appealService.updateAppeal(appealId, updateData);

    // ログ記録
    await appealService.logAppealAction({
      timestamp: new Date().toISOString(),
      appealId,
      action: AppealAction.PROVIDE_INFO,
      userId,
      details: { updateData }
    });

    res.json({
      success: true,
      appealId,
      message: '追加情報を提出しました'
    });
  } catch (error: any) {
    console.error('更新エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: '更新に失敗しました'
      }
    });
  }
};

// 異議申し立て取り下げ
export const withdrawAppeal = async (req: Request, res: Response) => {
  try {
    const { appealId, reason } = req.body;
    const userId = (req as any).user?.employeeId;

    const appeal = await appealService.getAppealById(appealId);
    
    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '異議申し立てが見つかりません'
        }
      });
    }

    // 取り下げ可能なステータスか確認
    if (appeal.status === AppealStatus.RESOLVED || appeal.status === AppealStatus.WITHDRAWN) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'すでに完了または取り下げ済みです'
        }
      });
    }

    // ステータスを取り下げに更新
    await appealService.updateAppealStatus(appealId, AppealStatus.WITHDRAWN, reason);

    // ログ記録
    await appealService.logAppealAction({
      timestamp: new Date().toISOString(),
      appealId,
      action: AppealAction.WITHDRAW,
      userId,
      details: { reason }
    });

    res.json({
      success: true,
      appealId,
      message: '異議申し立てを取り下げました'
    });
  } catch (error: any) {
    console.error('取り下げエラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WITHDRAW_ERROR',
        message: '取り下げに失敗しました'
      }
    });
  }
};

// ステータス更新（管理者用）
export const updateAppealStatus = async (req: Request, res: Response) => {
  try {
    const { appealId } = req.params;
    const { status, reason, userId, reviewerId } = req.body;

    const appeal = await appealService.getAppealById(appealId);
    
    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '異議申し立てが見つかりません'
        }
      });
    }
    
    // 審査者が指定されていない場合はフォールバック
    let assignedReviewer = reviewerId;
    if (!assignedReviewer && status === AppealStatus.UNDER_REVIEW) {
      // デフォルト審査者に割り当て
      assignedReviewer = 'DEFAULT_REVIEWER';
      console.warn(`審査者割り当て失敗: ${appealId} - デフォルト審査者を使用`);
      
      // 管理者に手動割り当てを依頼
      await appealService.notifyAdministrators(appeal);
    }

    // ステータス更新
    await appealService.updateAppealStatus(appealId, status, reason);

    // アクションタイプを決定
    let action: AppealAction;
    switch (status) {
      case AppealStatus.UNDER_REVIEW:
        action = AppealAction.START_REVIEW;
        break;
      case AppealStatus.RESOLVED:
        action = AppealAction.COMPLETE_REVIEW;
        break;
      case AppealStatus.REJECTED:
        action = AppealAction.REJECT;
        break;
      default:
        action = AppealAction.COMMENT;
    }

    // ログ記録
    await appealService.logAppealAction({
      timestamp: new Date().toISOString(),
      appealId,
      action,
      userId,
      details: { status, reason }
    });

    res.json({
      success: true,
      message: 'ステータスを更新しました'
    });
  } catch (error: any) {
    console.error('ステータス更新エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'ステータス更新に失敗しました'
      }
    });
  }
};

// コメント追加
export const addComment = async (req: Request, res: Response) => {
  try {
    const { appealId } = req.params;
    const { message } = req.body;
    const userId = (req as any).user?.employeeId || 'user';

    const appeal = await appealService.getAppealById(appealId);
    
    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '異議申し立てが見つかりません'
        }
      });
    }

    // コメント追加
    await appealService.addCommunicationLog(appealId, {
      id: uuidv4(),
      timestamp: new Date(),
      type: 'request',
      from: userId,
      to: 'administrator',
      message,
      read: false
    });

    // ログ記録
    await appealService.logAppealAction({
      timestamp: new Date().toISOString(),
      appealId,
      action: AppealAction.COMMENT,
      userId,
      details: { message }
    });

    res.json({
      success: true,
      message: 'コメントを追加しました'
    });
  } catch (error: any) {
    console.error('コメント追加エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_ERROR',
        message: 'コメントの追加に失敗しました'
      }
    });
  }
};

// ファイルアップロード
export const uploadEvidence = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'ファイルが選択されていません'
        }
      });
    }

    const fileUrl = `/uploads/appeals/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl
    });
  } catch (error: any) {
    console.error('アップロードエラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'ファイルのアップロードに失敗しました'
      }
    });
  }
};

// 申し立て資格確認
export const checkEligibility = async (req: Request, res: Response) => {
  try {
    const { evaluationPeriod } = req.body;
    
    // 評価開示日から14日以内かチェック（実際の実装では日付を確認）
    const eligible = await appealService.checkEligibilityPeriod(evaluationPeriod);
    
    res.json({
      eligible,
      reason: eligible ? undefined : '申し立て期限を過ぎています（評価開示から14日以内）'
    });
  } catch (error: any) {
    res.status(500).json({
      eligible: true // エラー時はデフォルトで可能とする
    });
  }
};

// 評価期間リスト取得
export const getEvaluationPeriods = async (req: Request, res: Response) => {
  try {
    const periods = await appealService.getAvailableEvaluationPeriods();
    
    if (!periods || periods.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'E002',
          message: '有効な評価期間が見つかりません'
        }
      });
    }
    
    res.json({
      success: true,
      periods
    });
  } catch (error: any) {
    console.error('評価期間取得エラー:', error);
    
    // エラーハンドリング：テスト用データを返す
    res.json({
      success: true,
      periods: [
        {
          id: 'TEST-2025',
          name: 'テスト評価期間',
          appealDeadline: '2025-12-31',
          status: 'active'
        }
      ]
    });
  }
};