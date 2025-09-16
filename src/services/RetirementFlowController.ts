import { 
  RetirementProcessState, 
  RetirementStepStatus, 
  RetirementOperationLog,
  Step1AccountDeactivationData,
  Step2PermissionRevocationData,
  Step3PostAnonymizationData,
  Step4CompletionNotificationData
} from '../types/retirementFlow';
import { User } from '../types';
import { AuditService } from './AuditService';
import NotificationService from './NotificationService';

export class RetirementFlowController {
  private static instance: RetirementFlowController;
  private activeProcesses: Map<string, RetirementProcessState> = new Map();
  private operationLogs: RetirementOperationLog[] = [];

  private constructor(
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  static getInstance(
    auditService: AuditService,
    notificationService: NotificationService
  ): RetirementFlowController {
    if (!RetirementFlowController.instance) {
      RetirementFlowController.instance = new RetirementFlowController(
        auditService,
        notificationService
      );
    }
    return RetirementFlowController.instance;
  }

  /**
   * 新しい退職処理プロセスを開始
   */
  async startRetirementProcess(
    targetEmployee: User,
    initiator: User
  ): Promise<string> {
    // 権限チェック
    if (initiator.hierarchyLevel < 6) {
      throw new Error('退職処理を開始するにはレベル6以上の権限が必要です');
    }

    // プロセスIDを生成
    const processId = `retirement_${targetEmployee.id}_${Date.now()}`;

    // 初期状態を作成
    const processState: RetirementProcessState = {
      employeeId: targetEmployee.id,
      employeeName: targetEmployee.name,
      employeeDepartment: targetEmployee.department,
      employeeRole: targetEmployee.role,
      currentStep: 1,
      steps: {
        1: { status: 'pending' },
        2: { status: 'blocked' },
        3: { status: 'blocked' },
        4: { status: 'blocked' }
      },
      startedAt: new Date(),
      initiatedBy: initiator.id,
      processId
    };

    // プロセスを登録
    this.activeProcesses.set(processId, processState);

    // 監査ログに記録
    await this.logOperation(
      processId,
      0,
      targetEmployee.id,
      initiator.id,
      initiator.name,
      'PROCESS_STARTED',
      { targetEmployee, initiator }
    );

    // 開始通知
    await this.notificationService.sendNotification({
      recipientId: 'HR_DEPARTMENT',
      type: 'RETIREMENT_PROCESS_STARTED',
      title: '退職処理プロセス開始',
      message: `${targetEmployee.name}の退職処理が開始されました`,
      data: { processId, targetEmployee: targetEmployee.name, initiator: initiator.name },
      priority: 'HIGH'
    });

    return processId;
  }

  /**
   * プロセス状態を取得
   */
  getProcessState(processId: string): RetirementProcessState | null {
    return this.activeProcesses.get(processId) || null;
  }

  /**
   * ステップを実行
   */
  async executeStep(
    processId: string,
    stepNumber: number,
    executor: User,
    stepData: any
  ): Promise<void> {
    const processState = this.activeProcesses.get(processId);
    if (!processState) {
      throw new Error('プロセスが見つかりません');
    }

    // 権限チェック
    if (executor.hierarchyLevel < 6) {
      throw new Error('ステップを実行するにはレベル6以上の権限が必要です');
    }

    // ステップの実行可能性をチェック
    if (!this.canExecuteStep(processState, stepNumber)) {
      throw new Error('このステップは実行できません（前のステップが未完了）');
    }

    try {
      // ステップを進行中に設定
      processState.steps[stepNumber].status = 'in_progress';
      processState.currentStep = stepNumber;

      // ステップ固有の処理を実行
      await this.performStepExecution(processId, stepNumber, stepData, executor);

      // ステップを完了に設定
      processState.steps[stepNumber] = {
        status: 'completed',
        completedAt: new Date(),
        completedBy: executor.id,
        data: stepData
      };

      // 次のステップのブロックを解除
      if (stepNumber < 4) {
        processState.steps[stepNumber + 1].status = 'pending';
        processState.currentStep = stepNumber + 1;
      } else {
        // 全ステップ完了
        processState.completedAt = new Date();
        processState.currentStep = 5; // 完了状態
      }

      // 操作ログに記録
      await this.logOperation(
        processId,
        stepNumber,
        processState.employeeId,
        executor.id,
        executor.name,
        `STEP_${stepNumber}_COMPLETED`,
        stepData
      );

      // ステップ完了通知
      await this.notificationService.sendNotification({
        recipientId: processState.initiatedBy,
        type: 'RETIREMENT_STEP_COMPLETED',
        title: `退職処理ステップ${stepNumber}完了`,
        message: `${processState.employeeName}のステップ${stepNumber}が完了しました`,
        data: { processId, stepNumber, executor: executor.name },
        priority: 'MEDIUM'
      });

    } catch (error) {
      // エラー状態に設定
      processState.steps[stepNumber].status = 'error';
      processState.steps[stepNumber].errors = [error.message];

      // エラーログ
      await this.logOperation(
        processId,
        stepNumber,
        processState.employeeId,
        executor.id,
        executor.name,
        `STEP_${stepNumber}_ERROR`,
        { error: error.message }
      );

      throw error;
    }
  }

  /**
   * ステップが実行可能かチェック
   */
  private canExecuteStep(processState: RetirementProcessState, stepNumber: number): boolean {
    // ステップ1は常に実行可能
    if (stepNumber === 1) {
      return processState.steps[1].status !== 'completed';
    }

    // その他のステップは前のステップが完了している必要がある
    return processState.steps[stepNumber - 1]?.status === 'completed' &&
           processState.steps[stepNumber]?.status !== 'completed';
  }

  /**
   * ステップ固有の処理を実行
   */
  private async performStepExecution(
    processId: string,
    stepNumber: number,
    stepData: any,
    executor: User
  ): Promise<void> {
    switch (stepNumber) {
      case 1:
        await this.executeStep1(processId, stepData as Step1AccountDeactivationData, executor);
        break;
      case 2:
        await this.executeStep2(processId, stepData as Step2PermissionRevocationData, executor);
        break;
      case 3:
        await this.executeStep3(processId, stepData as Step3PostAnonymizationData, executor);
        break;
      case 4:
        await this.executeStep4(processId, stepData as Step4CompletionNotificationData, executor);
        break;
      default:
        throw new Error('無効なステップ番号');
    }
  }

  /**
   * ステップ1: アカウント無効化
   */
  private async executeStep1(
    processId: string,
    data: Step1AccountDeactivationData,
    executor: User
  ): Promise<void> {
    const processState = this.activeProcesses.get(processId)!;

    // アカウント無効化処理
    if (data.timing === 'immediate') {
      // 即座に無効化
      await this.deactivateAccount(processState.employeeId);
    } else if (data.timing === 'scheduled' && data.scheduledDate) {
      // スケジュール無効化
      await this.scheduleAccountDeactivation(processState.employeeId, data.scheduledDate);
    }

    // 強制ログアウト
    if (data.forceLogout) {
      await this.forceLogoutUser(processState.employeeId);
    }

    // バックアップ作成
    if (data.backupCreated) {
      await this.createUserDataBackup(processState.employeeId);
    }

    // ユーザー通知
    if (data.notifyUser) {
      await this.notifyUserAccountDeactivation(processState.employeeId);
    }
  }

  /**
   * ステップ2: 権限取り消し
   */
  private async executeStep2(
    processId: string,
    data: Step2PermissionRevocationData,
    executor: User
  ): Promise<void> {
    const processState = this.activeProcesses.get(processId)!;

    // 権限取り消し
    for (const permission of data.revokedPermissions) {
      await this.revokePermission(processState.employeeId, permission);
    }

    // 権限引き継ぎ
    for (const [permission, newAssignee] of Object.entries(data.handoverAssignments)) {
      await this.transferPermission(permission, processState.employeeId, newAssignee);
    }

    // プロジェクト引き継ぎ
    for (const handover of data.projectHandovers) {
      await this.transferProjectOwnership(handover.projectId, handover.newOwnerId);
    }

    // 緊急連絡先への通知
    for (const contactId of data.emergencyContacts) {
      await this.notificationService.sendNotification({
        recipientId: contactId,
        type: 'PERMISSION_TRANSFER',
        title: '権限移譲通知',
        message: `${processState.employeeName}からの権限移譲が完了しました`,
        data: { processId, transferredPermissions: data.revokedPermissions },
        priority: 'HIGH'
      });
    }
  }

  /**
   * ステップ3: 投稿匿名化
   */
  private async executeStep3(
    processId: string,
    data: Step3PostAnonymizationData,
    executor: User
  ): Promise<void> {
    const processState = this.activeProcesses.get(processId)!;

    // 各投稿の匿名化
    for (const post of data.targetPosts) {
      await this.anonymizePost(post.id, post.anonymizationLevel);
    }

    // 個人情報の削除
    for (const info of data.personalInfoRemoved) {
      await this.removePersonalInfo(processState.employeeId, info);
    }

    // 関連コメントの処理
    if (data.affectedComments > 0) {
      await this.anonymizeRelatedComments(processState.employeeId);
    }
  }

  /**
   * ステップ4: 完了通知
   */
  private async executeStep4(
    processId: string,
    data: Step4CompletionNotificationData,
    executor: User
  ): Promise<void> {
    const processState = this.activeProcesses.get(processId)!;

    // 各受信者への通知
    for (const recipient of data.notificationRecipients) {
      await this.notificationService.sendNotification({
        recipientId: recipient.id,
        type: 'RETIREMENT_PROCESS_COMPLETED',
        title: '退職処理完了通知',
        message: `${processState.employeeName}の退職処理が完了しました`,
        data: { 
          processId, 
          completedAt: new Date(),
          executor: executor.name,
          finalNotes: data.finalNotes
        },
        priority: 'HIGH'
      });
    }

    // レポート生成
    if (data.reportGenerated) {
      await this.generateCompletionReport(processId);
    }

    // コンプライアンスチェック記録
    for (const [item, checked] of Object.entries(data.complianceChecklist)) {
      if (!checked) {
        console.warn(`コンプライアンス項目が未チェック: ${item}`);
      }
    }
  }

  /**
   * 操作ログを記録
   */
  private async logOperation(
    processId: string,
    stepNumber: number,
    employeeId: string,
    executorId: string,
    executorName: string,
    operation: string,
    data: any
  ): Promise<void> {
    const log: RetirementOperationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processId,
      stepNumber,
      employeeId,
      executorId,
      executorName,
      timestamp: new Date(),
      operation,
      data,
      success: true
    };

    this.operationLogs.push(log);

    // 監査サービスにも記録
    await this.auditService.logAction({
      userId: executorId,
      action: operation,
      targetId: employeeId,
      details: { processId, stepNumber, data },
      risk: 'HIGH'
    });
  }

  // 以下は実際の実装で必要となるプライベートメソッド（ダミー実装）
  private async deactivateAccount(employeeId: string): Promise<void> {
    console.log(`アカウント無効化: ${employeeId}`);
  }

  private async scheduleAccountDeactivation(employeeId: string, date: Date): Promise<void> {
    console.log(`アカウント無効化スケジュール: ${employeeId} at ${date}`);
  }

  private async forceLogoutUser(employeeId: string): Promise<void> {
    console.log(`強制ログアウト: ${employeeId}`);
  }

  private async createUserDataBackup(employeeId: string): Promise<void> {
    console.log(`データバックアップ作成: ${employeeId}`);
  }

  private async notifyUserAccountDeactivation(employeeId: string): Promise<void> {
    console.log(`ユーザー通知: ${employeeId}`);
  }

  private async revokePermission(employeeId: string, permission: string): Promise<void> {
    console.log(`権限取り消し: ${employeeId} - ${permission}`);
  }

  private async transferPermission(permission: string, fromId: string, toId: string): Promise<void> {
    console.log(`権限移譲: ${permission} from ${fromId} to ${toId}`);
  }

  private async transferProjectOwnership(projectId: string, newOwnerId: string): Promise<void> {
    console.log(`プロジェクト移譲: ${projectId} to ${newOwnerId}`);
  }

  private async anonymizePost(postId: string, level: string): Promise<void> {
    console.log(`投稿匿名化: ${postId} level ${level}`);
  }

  private async removePersonalInfo(employeeId: string, info: string): Promise<void> {
    console.log(`個人情報削除: ${employeeId} - ${info}`);
  }

  private async anonymizeRelatedComments(employeeId: string): Promise<void> {
    console.log(`関連コメント匿名化: ${employeeId}`);
  }

  private async generateCompletionReport(processId: string): Promise<void> {
    console.log(`完了レポート生成: ${processId}`);
  }

  /**
   * プロセス一覧を取得
   */
  getAllProcesses(): RetirementProcessState[] {
    return Array.from(this.activeProcesses.values());
  }

  /**
   * 操作ログを取得
   */
  getOperationLogs(processId?: string): RetirementOperationLog[] {
    if (processId) {
      return this.operationLogs.filter(log => log.processId === processId);
    }
    return this.operationLogs;
  }
}