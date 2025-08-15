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
    // 実際の実装では、メール送信やプッシュ通知を行う
    console.log(`新しい異議申し立て: ${appeal.appealId}`);
    console.log(`従業員: ${appeal.employeeName} (${appeal.employeeId})`);
    console.log(`評価期間: ${appeal.evaluationPeriod}`);
    console.log(`カテゴリー: ${appeal.appealCategory}`);
    
    // 通知ログを記録
    await logAppealAction({
      timestamp: new Date().toISOString(),
      appealId: appeal.appealId,
      action: 'notify' as any,
      userId: 'system',
      details: { notificationType: 'new_appeal' }
    });
  } catch (error) {
    console.error('通知エラー:', error);
  }
};

// 優先度計算
export const calculatePriority = (request: AppealRequest): 'high' | 'medium' | 'low' => {
  // スコア差が大きい場合は高優先度
  if (request.originalScore && request.requestedScore) {
    const scoreDiff = request.requestedScore - request.originalScore;
    if (scoreDiff >= 10) return 'high';
    if (scoreDiff >= 5) return 'medium';
  }
  
  // カテゴリーによる優先度
  if (request.appealCategory === 'calculation_error') return 'high';
  if (request.appealCategory === 'period_error') return 'high';
  
  return 'low';
};

// 申し立て期限確認
export const checkEligibilityPeriod = async (evaluationPeriod: string): Promise<boolean> => {
  // 実際の実装では、評価開示日をデータベースから取得して14日以内か確認
  // ここでは簡易的に実装
  const periodMap: Record<string, Date> = {
    '2025年度上期': new Date('2025-01-10'),
    '2024年度下期': new Date('2024-07-10'),
    '2024年度上期': new Date('2024-01-10')
  };
  
  const disclosureDate = periodMap[evaluationPeriod];
  if (!disclosureDate) return true; // 不明な期間はデフォルトで許可
  
  const daysSinceDisclosure = Math.floor((Date.now() - disclosureDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceDisclosure <= 14;
};

// 利用可能な評価期間取得
export const getAvailableEvaluationPeriods = async (): Promise<string[]> => {
  // 実際の実装では、データベースから取得
  return ['2025年度上期', '2024年度下期', '2024年度上期'];
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