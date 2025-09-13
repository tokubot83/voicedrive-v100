import fs from 'fs/promises';
import path from 'path';
import { 
  AppealRecord, 
  AppealStatus,
  AppealLog,
  AppealCommunication,
  AppealRequest
} from '../../../mcp-shared/interfaces/appeal.interface';

const MCP_APPEALS_DIR = path.join(process.cwd(), 'mcp-shared', 'appeals');
const LOGS_DIR = path.join(MCP_APPEALS_DIR, 'logs');

// MCP共有フォルダに異議申し立てを保存
export const saveAppealToMCP = async (appeal: AppealRecord): Promise<void> => {
  try {
    const pendingDir = path.join(MCP_APPEALS_DIR, 'pending');
    await fs.mkdir(pendingDir, { recursive: true });
    
    const filePath = path.join(pendingDir, `${appeal.appealId}.json`);
    await fs.writeFile(filePath, JSON.stringify(appeal, null, 2), 'utf-8');
  } catch (error) {
    console.error('MCP保存エラー:', error);
    throw error;
  }
};

// 異議申し立てIDで取得
export const getAppealById = async (appealId: string): Promise<AppealRecord | null> => {
  try {
    // 各フォルダから検索
    const folders = ['pending', 'in-progress', 'resolved'];
    
    for (const folder of folders) {
      const filePath = path.join(MCP_APPEALS_DIR, folder, `${appealId}.json`);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
      } catch (err) {
        // ファイルが見つからない場合は次のフォルダへ
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('取得エラー:', error);
    return null;
  }
};

// 従業員IDで異議申し立て一覧を取得
export const getAppealsByEmployeeId = async (employeeId: string): Promise<AppealRecord[]> => {
  try {
    const appeals: AppealRecord[] = [];
    const folders = ['pending', 'in-progress', 'resolved'];
    
    for (const folder of folders) {
      const dirPath = path.join(MCP_APPEALS_DIR, folder);
      try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(dirPath, file);
            const data = await fs.readFile(filePath, 'utf-8');
            const appeal: AppealRecord = JSON.parse(data);
            
            if (appeal.employeeId === employeeId) {
              appeals.push(appeal);
            }
          }
        }
      } catch (err) {
        // フォルダが存在しない場合はスキップ
        continue;
      }
    }
    
    // 作成日時で降順ソート
    appeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return appeals;
  } catch (error) {
    console.error('一覧取得エラー:', error);
    return [];
  }
};

// 異議申し立て更新
export const updateAppeal = async (appealId: string, updateData: Partial<AppealRecord>): Promise<AppealRecord | null> => {
  try {
    const appeal = await getAppealById(appealId);
    if (!appeal) return null;
    
    const updatedAppeal = {
      ...appeal,
      ...updateData,
      updatedAt: new Date()
    };
    
    // 現在のステータスに応じたフォルダを決定
    const folder = getAppealFolder(updatedAppeal.status);
    const filePath = path.join(MCP_APPEALS_DIR, folder, `${appealId}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(updatedAppeal, null, 2), 'utf-8');
    
    return updatedAppeal;
  } catch (error) {
    console.error('更新エラー:', error);
    return null;
  }
};

// ステータス更新
export const updateAppealStatus = async (appealId: string, newStatus: AppealStatus, reason?: string): Promise<void> => {
  try {
    const appeal = await getAppealById(appealId);
    if (!appeal) throw new Error('異議申し立てが見つかりません');
    
    const oldFolder = getAppealFolder(appeal.status);
    const newFolder = getAppealFolder(newStatus);
    
    // 古いファイルを削除
    const oldPath = path.join(MCP_APPEALS_DIR, oldFolder, `${appealId}.json`);
    await fs.unlink(oldPath);
    
    // ステータスを更新
    appeal.status = newStatus;
    appeal.updatedAt = new Date();
    
    if (newStatus === AppealStatus.UNDER_REVIEW) {
      appeal.reviewStartDate = new Date();
    } else if ([AppealStatus.RESOLVED, AppealStatus.WITHDRAWN, AppealStatus.REJECTED].includes(newStatus)) {
      appeal.reviewEndDate = new Date();
      if (reason) {
        appeal.reviewerComments = reason;
      }
    }
    
    // 新しいフォルダに保存
    const newPath = path.join(MCP_APPEALS_DIR, newFolder, `${appealId}.json`);
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.writeFile(newPath, JSON.stringify(appeal, null, 2), 'utf-8');
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    throw error;
  }
};

// コミュニケーションログ追加
export const addCommunicationLog = async (appealId: string, communication: AppealCommunication): Promise<void> => {
  try {
    const appeal = await getAppealById(appealId);
    if (!appeal) throw new Error('異議申し立てが見つかりません');
    
    if (!appeal.communicationLog) {
      appeal.communicationLog = [];
    }
    
    appeal.communicationLog.push(communication);
    await updateAppeal(appealId, { communicationLog: appeal.communicationLog });
  } catch (error) {
    console.error('コミュニケーションログ追加エラー:', error);
    throw error;
  }
};

// ログ記録
export const logAppealAction = async (log: AppealLog): Promise<void> => {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    
    const logFile = path.join(LOGS_DIR, `appeal-${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = JSON.stringify(log) + '\n';
    
    await fs.appendFile(logFile, logEntry, 'utf-8');
  } catch (error) {
    console.error('ログ記録エラー:', error);
  }
};

// 管理者への通知
export const notifyAdministrators = async (appeal: AppealRecord): Promise<void> => {
  try {
    const priority = calculatePriority(appeal as any);
    
    // 優先度に応じた通知
    console.log(`新しい異議申し立て: ${appeal.appealId}`);
    console.log(`優先度: ${priority}`);
    console.log(`従業員: ${appeal.employeeName} (${appeal.employeeId})`);
    console.log(`評価期間: ${appeal.evaluationPeriod}`);
    console.log(`カテゴリー: ${appeal.appealCategory}`);
    
    // 高優先度の場合は緊急通知
    if (priority === 'high') {
      await sendUrgentNotification(appeal);
    }
    
    // 審査者自動割り当て
    await assignReviewer(appeal, priority);
    
    // 通知ログを記録
    await logAppealAction({
      timestamp: new Date().toISOString(),
      appealId: appeal.appealId,
      action: 'notify' as any,
      userId: 'system',
      details: { 
        notificationType: 'new_appeal',
        priority,
        autoAssigned: true
      }
    });
  } catch (error) {
    console.error('通知エラー:', error);
  }
};

// 緊急通知送信
const sendUrgentNotification = async (appeal: AppealRecord): Promise<void> => {
  console.log(`[緊急] 高優先度の異議申し立て: ${appeal.appealId}`);
  // 実際の実装ではメール、SMS、プッシュ通知等を送信
};

// 審査者自動割り当て
const assignReviewer = async (appeal: AppealRecord, priority: string): Promise<string> => {
  try {
    // 医療システムの審査者割り当てAPIを呼び出す
    // const response = await axios.put(`${MEDICAL_SYSTEM_URL}/api/v1/appeals/${appeal.appealId}/assign`);
    
    // 現在はローカルでシミュレート
    let assignedReviewer = '';
    
    if (priority === 'high') {
      assignedReviewer = 'DEPT_HEAD_001'; // 部門長
    } else if (priority === 'medium') {
      assignedReviewer = 'SECTION_CHIEF_001'; // 課長
    } else {
      assignedReviewer = 'TEAM_LEADER_001'; // リーダー
    }
    
    console.log(`審査者割り当て: ${assignedReviewer} (優先度: ${priority})`);
    return assignedReviewer;
  } catch (error) {
    console.error('審査者割り当てエラー:', error);
    // フォールバック：デフォルト審査者に割り当て
    return 'DEFAULT_REVIEWER';
  }
};

// 優先度計算（医療チームの基準に準拠）
export const calculatePriority = (request: AppealRequest): 'high' | 'medium' | 'low' => {
  // 計算誤りは最優先
  if (request.appealCategory === 'calculation_error') {
    return 'high';
  }
  
  // スコア差による判定
  if (request.originalScore && request.requestedScore) {
    const diff = request.requestedScore - request.originalScore;
    if (diff >= 10) return 'high';
    if (diff >= 5) return 'medium';
  }
  
  // 期間誤りも高優先度
  if (request.appealCategory === 'period_error') {
    return 'high';
  }
  
  // 成果見落としは中優先度
  if (request.appealCategory === 'achievement_oversight') {
    return 'medium';
  }
  
  // 証拠書類が複数ある場合は優先度を上げる
  if (request.evidenceDocuments && request.evidenceDocuments.length > 2) {
    return 'medium';
  }
  
  // 管理職からの申し立て（jobCategoryで判定）
  if (request.jobCategory && ['manager', 'director', 'chief'].includes(request.jobCategory)) {
    return 'high';
  }
  
  return 'low';
};

// 申し立て期限確認
export const checkEligibilityPeriod = async (evaluationPeriodId: string): Promise<boolean> => {
  try {
    // 医療システムAPIから評価期間情報を取得
    // const response = await axios.get(`${MEDICAL_SYSTEM_URL}/api/v1/evaluation/periods`);
    
    // 現在はローカルデータを使用
    const periodMap: Record<string, { deadline: Date; status: string }> = {
      '2025-H1': { deadline: new Date('2025-11-03'), status: 'active' },
      '2024-H2': { deadline: new Date('2025-05-04'), status: 'active' },
      '2024-H1': { deadline: new Date('2024-11-03'), status: 'closed' }
    };
    
    const period = periodMap[evaluationPeriodId];
    if (!period) {
      console.error(`E002: 有効な評価期間が見つかりません: ${evaluationPeriodId}`);
      return false;
    }
    
    // ステータスチェック
    if (period.status !== 'active') {
      return false;
    }
    
    // 期限チェック
    const now = new Date();
    return now <= period.deadline;
  } catch (error) {
    console.error('期限確認エラー:', error);
    return false;
  }
};

// 利用可能な評価期間取得
export const getAvailableEvaluationPeriods = async (): Promise<any[]> => {
  try {
    // 医療システムAPIから取得
    // const response = await axios.get(`${MEDICAL_SYSTEM_URL}/api/v1/evaluation/periods`);
    
    // 現在はローカルデータを使用
    const periods = [
      {
        id: '2025-H1',
        name: '2025年度上期',
        startDate: '2025-04-01',
        endDate: '2025-09-30',
        disclosureDate: '2025-10-20',
        appealDeadline: '2025-11-03',
        status: 'active'
      },
      {
        id: '2024-H2',
        name: '2024年度下期',
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        disclosureDate: '2025-04-20',
        appealDeadline: '2025-05-04',
        status: 'active'
      },
      {
        id: 'TEST-2025',
        name: 'テスト評価期間',
        appealDeadline: '2025-12-31',
        status: 'active'
      }
    ];
    
    // appealDeadlineが未来日付のものだけフィルター
    const now = new Date();
    return periods.filter(p => 
      new Date(p.appealDeadline) > now && p.status === 'active'
    );
  } catch (error) {
    console.error('評価期間取得エラー:', error);
    return [];
  }
};

// ステータスに応じたフォルダを返す
const getAppealFolder = (status: AppealStatus): string => {
  switch (status) {
    case AppealStatus.RECEIVED:
      return 'pending';
    case AppealStatus.UNDER_REVIEW:
    case AppealStatus.ADDITIONAL_INFO:
      return 'in-progress';
    case AppealStatus.RESOLVED:
    case AppealStatus.WITHDRAWN:
    case AppealStatus.REJECTED:
      return 'resolved';
    default:
      return 'pending';
  }
};