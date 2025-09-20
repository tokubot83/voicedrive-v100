/**
 * 優先度マッピングユーティリティ
 * 医療チームシステム（3段階）との連携用
 *
 * VoiceDrive: URGENT/HIGH/NORMAL/LOW (4段階)
 * 医療チーム: high/medium/low (3段階)
 */

// VoiceDrive側の優先度タイプ（4段階）
export type VoiceDrivePriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

// 医療チームシステムの優先度タイプ（3段階）
export type MedicalTeamPriority = 'high' | 'medium' | 'low';

/**
 * VoiceDriveの優先度を医療チームシステムの優先度に変換
 *
 * マッピングルール：
 * - URGENT → high（緊急・重要は同じ扱い）
 * - HIGH   → high（緊急・重要は同じ扱い）
 * - NORMAL → medium（通常）
 * - LOW    → low（低優先度）
 *
 * @param voiceDrivePriority VoiceDrive側の優先度
 * @returns 医療チームシステムの優先度
 */
export const convertToMedicalTeamPriority = (
  voiceDrivePriority: VoiceDrivePriority
): MedicalTeamPriority => {
  switch (voiceDrivePriority) {
    case 'URGENT':
    case 'HIGH':
      return 'high';
    case 'NORMAL':
      return 'medium';
    case 'LOW':
      return 'low';
    default:
      // 未知の値の場合は安全側に倒してmediumを返す
      console.warn(`Unknown priority: ${voiceDrivePriority}, defaulting to 'medium'`);
      return 'medium';
  }
};

/**
 * 医療チームシステムの優先度をVoiceDriveの優先度に変換
 *
 * 逆マッピングルール：
 * - high   → HIGH（URGENTではなくHIGHにマップ）
 * - medium → NORMAL
 * - low    → LOW
 *
 * @param medicalTeamPriority 医療チームシステムの優先度
 * @returns VoiceDrive側の優先度
 */
export const convertFromMedicalTeamPriority = (
  medicalTeamPriority: MedicalTeamPriority
): VoiceDrivePriority => {
  switch (medicalTeamPriority) {
    case 'high':
      // highはHIGHにマップ（URGENTは内部的な特別な状態に残す）
      return 'HIGH';
    case 'medium':
      return 'NORMAL';
    case 'low':
      return 'LOW';
    default:
      // 未知の値の場合は安全側に倒してNORMALを返す
      console.warn(`Unknown priority: ${medicalTeamPriority}, defaulting to 'NORMAL'`);
      return 'NORMAL';
  }
};

/**
 * 優先度レベルに基づく表示色を取得
 *
 * @param priority 医療チームシステムの優先度
 * @returns 表示用のカラーコード
 */
export const getMedicalPriorityColor = (priority: MedicalTeamPriority): string => {
  switch (priority) {
    case 'high':
      return '#ef4444'; // 赤（緊急・重要）
    case 'medium':
      return '#f59e0b'; // オレンジ（通常）
    case 'low':
      return '#6b7280'; // グレー（低優先度）
    default:
      return '#6b7280';
  }
};

/**
 * 優先度レベルに基づく表示アイコンを取得
 *
 * @param priority 医療チームシステムの優先度
 * @returns 表示用のアイコン
 */
export const getMedicalPriorityIcon = (priority: MedicalTeamPriority): string => {
  switch (priority) {
    case 'high':
      return '🔴'; // 赤丸（緊急・重要）
    case 'medium':
      return '🟡'; // 黄丸（通常）
    case 'low':
      return '⚪'; // 白丸（低優先度）
    default:
      return '⚪';
  }
};

/**
 * 優先度レベルに基づく日本語ラベルを取得
 *
 * @param priority 医療チームシステムの優先度
 * @returns 日本語のラベル
 */
export const getMedicalPriorityLabel = (priority: MedicalTeamPriority): string => {
  switch (priority) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '中';
  }
};

// 統合テスト用のサンプルデータ
export const priorityMappingTestCases = [
  {
    voiceDrive: 'URGENT' as VoiceDrivePriority,
    expected: 'high' as MedicalTeamPriority,
    description: '緊急は高優先度にマップ'
  },
  {
    voiceDrive: 'HIGH' as VoiceDrivePriority,
    expected: 'high' as MedicalTeamPriority,
    description: '高優先度は高優先度にマップ'
  },
  {
    voiceDrive: 'NORMAL' as VoiceDrivePriority,
    expected: 'medium' as MedicalTeamPriority,
    description: '通常は中優先度にマップ'
  },
  {
    voiceDrive: 'LOW' as VoiceDrivePriority,
    expected: 'low' as MedicalTeamPriority,
    description: '低優先度は低優先度にマップ'
  }
];

// 医療チームAPI連携用のインターフェース
export interface MedicalTeamApiRequest {
  priority: MedicalTeamPriority;
  // その他の医療チームAPI用フィールド
  [key: string]: any;
}

/**
 * VoiceDriveのデータを医療チームAPI用に変換
 *
 * @param data VoiceDrive側のデータ
 * @returns 医療チームAPI用のリクエストデータ
 */
export const prepareMedicalTeamApiRequest = (data: {
  priority: VoiceDrivePriority;
  [key: string]: any;
}): MedicalTeamApiRequest => {
  return {
    ...data,
    priority: convertToMedicalTeamPriority(data.priority)
  };
};