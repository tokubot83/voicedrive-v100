// 医療システムからの受信API処理
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import {
  ProposalResponse,
  BookingConfirmedResponse,
  RevisedProposalResponse,
  RescheduleApprovalResponse,
  CancellationConfirmedResponse,
  NotificationMessage
} from '../types/medicalSystemIntegration';
import { InterviewSummary, ReceiveSummaryResponse } from '../types/interviewSummary';

// Express Routerを使用（実際のNext.js APIルートとして使用）
const router = express.Router();

// 通知システムとの連携用
import NotificationService from '../services/NotificationService';
import WebSocketNotificationService from '../services/WebSocketNotificationService';

// データ保存パス設定
const DATA_DIR = path.join(process.cwd(), 'data', 'interview-summaries');
const SUMMARIES_FILE = path.join(DATA_DIR, 'summaries.json');

// 1. AI提案3パターン受信
export async function handleProposalReceived(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const proposalData: ProposalResponse = req.body;

    // バリデーション
    if (!proposalData.voicedriveRequestId || !proposalData.proposals) {
      res.status(400).json({
        success: false,
        error: 'Invalid proposal data'
      });
      return;
    }

    if (proposalData.proposals.length !== 3) {
      res.status(400).json({
        success: false,
        error: 'Expected exactly 3 proposals'
      });
      return;
    }

    // データ保存（状態管理に反映）
    await saveProposalData(proposalData);

    // リアルタイム通知送信
    await NotificationService.getInstance().sendNotification({
      type: 'proposal_received',
      title: 'AI最適化完了',
      message: '面談候補3つの提案が届きました',
      timestamp: new Date().toISOString(),
      data: {
        requestId: proposalData.requestId,
        proposalCount: proposalData.proposals.length,
        expiresAt: proposalData.expiresAt
      },
      priority: 'high',
      actionRequired: true
    });

    // WebSocket通知
    WebSocketNotificationService.getInstance().notifyProposalReceived(
      proposalData.voicedriveRequestId,
      proposalData
    );

    // ログ記録
    console.log(`✅ Proposals received for request ${proposalData.voicedriveRequestId}`);

    res.status(200).json({
      success: true,
      message: 'Proposals received successfully',
      receivedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling proposal received:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// 2. 本予約確定通知受信
export async function handleBookingConfirmed(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const confirmationData: BookingConfirmedResponse = req.body;

    // バリデーション
    if (!confirmationData.voicedriveRequestId || !confirmationData.bookingId) {
      res.status(400).json({
        success: false,
        error: 'Invalid confirmation data'
      });
      return;
    }

    // データ保存
    await saveBookingConfirmation(confirmationData);

    // 成功通知送信
    await NotificationService.getInstance().sendNotification({
      type: 'booking_confirmed',
      title: '面談予約確定！',
      message: `${confirmationData.finalReservation.scheduledDate} ${confirmationData.finalReservation.scheduledTime}から${confirmationData.finalReservation.interviewerName}との面談が確定しました`,
      timestamp: new Date().toISOString(),
      data: confirmationData,
      priority: 'high',
      actionRequired: false
    });

    // WebSocket通知
    WebSocketNotificationService.getInstance().notifyBookingConfirmed(
      confirmationData.voicedriveRequestId,
      confirmationData
    );

    // カレンダー連携準備
    await prepareCalendarIntegration(confirmationData);

    console.log(`✅ Booking confirmed for request ${confirmationData.voicedriveRequestId}`);

    res.status(200).json({
      success: true,
      message: 'Booking confirmation received successfully'
    });

  } catch (error) {
    console.error('Error handling booking confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// 3. 再提案受信
export async function handleRevisedProposal(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const revisedData: RevisedProposalResponse = req.body;

    // バリデーション
    if (!revisedData.voicedriveRequestId || !revisedData.revisedProposals) {
      res.status(400).json({
        success: false,
        error: 'Invalid revised proposal data'
      });
      return;
    }

    // データ保存
    await saveRevisedProposal(revisedData);

    // 再提案通知送信
    await NotificationService.getInstance().sendNotification({
      type: 'proposal_received',
      title: '調整後の新提案',
      message: `ご要望に合わせて新しい候補を用意しました`,
      timestamp: new Date().toISOString(),
      data: {
        adjustmentId: revisedData.adjustmentId,
        adjustmentSummary: revisedData.adjustmentSummary,
        proposalCount: revisedData.revisedProposals.length
      },
      priority: 'high',
      actionRequired: true
    });

    // WebSocket通知
    WebSocketNotificationService.getInstance().notifyRevisedProposal(
      revisedData.voicedriveRequestId,
      revisedData
    );

    console.log(`✅ Revised proposals received for request ${revisedData.voicedriveRequestId}`);

    res.status(200).json({
      success: true,
      message: 'Revised proposals received successfully'
    });

  } catch (error) {
    console.error('Error handling revised proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// 4. 変更承認・拒否通知受信
export async function handleRescheduleApproval(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const approvalData: RescheduleApprovalResponse = req.body;

    // バリデーション
    if (!approvalData.voicedriveRequestId || !approvalData.approvalStatus) {
      res.status(400).json({
        success: false,
        error: 'Invalid approval data'
      });
      return;
    }

    // データ保存
    await saveRescheduleApproval(approvalData);

    // 通知送信
    const notificationType = approvalData.approvalStatus === 'approved'
      ? 'reschedule_approved'
      : 'reschedule_rejected';

    const title = approvalData.approvalStatus === 'approved'
      ? '日時変更承認'
      : '日時変更拒否';

    await NotificationService.getInstance().sendNotification({
      type: notificationType,
      title,
      message: approvalData.message,
      timestamp: new Date().toISOString(),
      data: approvalData,
      priority: 'high',
      actionRequired: approvalData.approvalStatus === 'rejected'
    });

    // WebSocket通知
    WebSocketNotificationService.getInstance().notifyRescheduleDecision(
      approvalData.voicedriveRequestId,
      approvalData
    );

    console.log(`✅ Reschedule ${approvalData.approvalStatus} for request ${approvalData.voicedriveRequestId}`);

    res.status(200).json({
      success: true,
      message: `Reschedule ${approvalData.approvalStatus} received successfully`
    });

  } catch (error) {
    console.error('Error handling reschedule approval:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// 5. キャンセル受付完了通知受信
export async function handleCancellationConfirmed(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const cancellationData: CancellationConfirmedResponse = req.body;

    // バリデーション
    if (!cancellationData.voicedriveRequestId || !cancellationData.bookingId) {
      res.status(400).json({
        success: false,
        error: 'Invalid cancellation data'
      });
      return;
    }

    // データ保存
    await saveCancellationConfirmation(cancellationData);

    // キャンセル確認通知送信
    await NotificationService.getInstance().sendNotification({
      type: 'cancellation_confirmed',
      title: 'キャンセル受付完了',
      message: cancellationData.message,
      timestamp: new Date().toISOString(),
      data: {
        bookingId: cancellationData.bookingId,
        cancellationType: cancellationData.cancellationType,
        refundEligible: cancellationData.refundEligible,
        alternativeSuggestions: cancellationData.alternativeSuggestions
      },
      priority: 'medium',
      actionRequired: false
    });

    console.log(`✅ Cancellation confirmed for booking ${cancellationData.bookingId}`);

    res.status(200).json({
      success: true,
      message: 'Cancellation confirmation received successfully'
    });

  } catch (error) {
    console.error('Error handling cancellation confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// 6. 面談サマリ受信
export async function handleSummaryReceived(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const summaryData: InterviewSummary = req.body;

    // バリデーション
    if (!summaryData.summaryId || !summaryData.interviewId || !summaryData.staffId) {
      res.status(400).json({
        success: false,
        error: 'Invalid summary data: missing required fields'
      });
      return;
    }

    // 面談種類のバリデーション
    if (!['regular', 'support', 'special'].includes(summaryData.interviewType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid interviewType: must be regular, support, or special'
      });
      return;
    }

    // データ保存（共通DB構築前はファイルシステムに保存）
    await saveInterviewSummary(summaryData);

    // 通知送信（共通DB構築後に有効化）
    // const typeLabels = {
    //   regular: '定期面談',
    //   support: 'サポート面談',
    //   special: '特別面談'
    // };

    // await NotificationService.getInstance().sendNotification({
    //   type: 'summary_received',
    //   title: '面談サマリ受信',
    //   message: `${typeLabels[summaryData.interviewType as keyof typeof typeLabels]}のサマリが届きました`,
    //   timestamp: new Date().toISOString(),
    //   data: {
    //     summaryId: summaryData.summaryId,
    //     interviewDate: summaryData.interviewDate,
    //     createdBy: summaryData.createdBy
    //   },
    //   priority: 'medium',
    //   actionRequired: false
    // });

    console.log(`✅ Interview summary received: ${summaryData.summaryId}`);

    const response: ReceiveSummaryResponse = {
      success: true,
      message: 'サマリを受信しました',
      receivedAt: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('[VoiceDrive] Error handling summary received:', error);
    console.error('[VoiceDrive] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// ヘルスチェックエンドポイント
export async function handleHealthCheck(
  req: express.Request,
  res: express.Response
): Promise<void> {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'voicedrive-medical-integration'
  });
}

// データ保存関数群
async function saveProposalData(data: ProposalResponse): Promise<void> {
  // 実装: ReduxやZustandなどの状態管理に保存
  // localStorage.setItem(`proposals_${data.voicedriveRequestId}`, JSON.stringify(data));
  console.log('Saving proposal data:', data.voicedriveRequestId);
}

async function saveBookingConfirmation(data: BookingConfirmedResponse): Promise<void> {
  // 実装: 予約確定データの保存
  console.log('Saving booking confirmation:', data.bookingId);
}

async function saveRevisedProposal(data: RevisedProposalResponse): Promise<void> {
  // 実装: 再提案データの保存
  console.log('Saving revised proposal:', data.adjustmentId);
}

async function saveRescheduleApproval(data: RescheduleApprovalResponse): Promise<void> {
  // 実装: 変更承認データの保存
  console.log('Saving reschedule approval:', data.approvalStatus);
}

async function saveCancellationConfirmation(data: CancellationConfirmedResponse): Promise<void> {
  // 実装: キャンセル確認データの保存
  console.log('Saving cancellation confirmation:', data.bookingId);
}

async function saveInterviewSummary(data: InterviewSummary): Promise<void> {
  // 共通DB構築前はファイルシステムに保存
  try {
    // データディレクトリが存在しない場合は作成
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('[VoiceDrive] データディレクトリ作成:', DATA_DIR);
    }

    // 既存データを読み込み
    let summaries: InterviewSummary[] = [];
    try {
      const fileContent = await fs.readFile(SUMMARIES_FILE, 'utf-8');
      summaries = JSON.parse(fileContent);
    } catch (error) {
      // ファイルが存在しない場合は空配列で開始
      summaries = [];
    }

    // 既存のサマリIDがあれば上書き、なければ追加
    const index = summaries.findIndex(s => s.summaryId === data.summaryId);
    if (index >= 0) {
      summaries[index] = data;
      console.log(`[VoiceDrive] 面談サマリ更新: ${data.summaryId}`);
    } else {
      summaries.push(data);
      console.log(`[VoiceDrive] 面談サマリ新規保存: ${data.summaryId}`);
    }

    // ファイルに保存
    await fs.writeFile(
      SUMMARIES_FILE,
      JSON.stringify(summaries, null, 2),
      'utf-8'
    );

    console.log(`[VoiceDrive] 面談サマリ保存成功 (合計: ${summaries.length}件)`);
    console.log(`[VoiceDrive] 保存先: ${SUMMARIES_FILE}`);
  } catch (error) {
    console.error('[VoiceDrive] 面談サマリ保存エラー:', error);
    throw error;
  }
}

async function prepareCalendarIntegration(data: BookingConfirmedResponse): Promise<void> {
  // 実装: カレンダー連携データの準備
  const calendarEvent = {
    title: `面談 - ${data.finalReservation.interviewerName}`,
    start: `${data.finalReservation.scheduledDate}T${data.finalReservation.scheduledTime}`,
    duration: data.finalReservation.duration,
    location: data.finalReservation.location,
    description: `面談ID: ${data.bookingId}\n担当者: ${data.finalReservation.interviewerTitle}`
  };

  console.log('Calendar event prepared:', calendarEvent);
}

// Express.js APIルート設定（参考用）
export function setupMedicalSystemRoutes(app: express.Application): void {
  // 医療システムからの受信エンドポイント
  app.post('/api/voicedrive/proposals', handleProposalReceived);
  app.post('/api/voicedrive/booking-confirmed', handleBookingConfirmed);
  app.post('/api/voicedrive/reschedule-proposals', handleRevisedProposal);
  app.post('/api/voicedrive/reschedule-approved', handleRescheduleApproval);
  app.post('/api/voicedrive/reschedule-rejected', handleRescheduleApproval);
  app.post('/api/voicedrive/cancellation-confirmed', handleCancellationConfirmed);
  app.post('/api/summaries/receive', handleSummaryReceived);

  // ヘルスチェック
  app.get('/api/voicedrive/health', handleHealthCheck);
}