/**
 * Phase 6: 面談タイプ表示名マッピング（人事システム統合仕様書準拠版）
 *
 * データベース/APIのコード値をユーザー向け表示名に変換
 * データ保存は元のコード値のまま、表示のみ変更
 *
 * 正式な面談タイプ（VoiceDrive面談制度_人事システム統合仕様書.md より）:
 * 11種類の面談タイプ + 3つの分類（UI表示用）
 */

/**
 * 面談タイプコードから表示名を取得
 *
 * @param typeCode - データベースに保存されている面談タイプコード
 * @returns ユーザー向け表示名（日本語）
 */
export const getInterviewTypeLabel = (typeCode: string): string => {
  const mapping: Record<string, string> = {
    // 【定期面談】3種類
    'new_employee_monthly': '新入職員月次面談',     // 入職1年未満の職員向け月次面談
    'regular_annual': '一般職員年次面談',           // 全職員向け年次面談
    'management_biannual': '管理職半年面談',        // 管理職向け半年面談

    // 【特別面談】3種類
    'incident_followup': 'インシデント後面談',      // インシデント発生後のフォローアップ
    'return_to_work': '復職面談',                   // 休職から復職する職員向け
    'exit_interview': '退職面談',                   // 退職予定者向け

    // 【サポート面談】5種類
    'career_development': 'キャリア開発面談',       // キャリアパス・スキル開発相談
    'stress_care': 'ストレスケア面談',              // メンタルヘルス・ストレス相談
    'performance_review': '人事評価面談',           // 人事評価結果のフィードバック
    'grievance': '苦情・相談面談',                  // 職場環境・人間関係等の相談
    'ad_hoc': '随時面談',                           // その他の個別相談

    // 【UI表示用の分類】（面談予約ガイドページに記載）
    'regular': '定期面談',
    'special': '特別面談',
    'support': 'サポート面談',

    // 【旧コード（互換性のため残す）】
    'career_support': 'キャリア開発面談',           // career_development の旧名称
    'workplace_support': '苦情・相談面談'           // grievance の旧名称
  };

  return mapping[typeCode] || typeCode; // マッピングにない場合は元の値を返す
};

/**
 * 面談タイプコードからアイコンを取得
 */
export const getInterviewTypeIcon = (typeCode: string): string => {
  const iconMap: Record<string, string> = {
    // 【定期面談】3種類
    'new_employee_monthly': '🌱',    // 新入職員
    'regular_annual': '📊',          // 一般職員
    'management_biannual': '👔',     // 管理職

    // 【特別面談】3種類
    'incident_followup': '⚠️',       // インシデント
    'return_to_work': '🔄',          // 復職
    'exit_interview': '🚪',          // 退職

    // 【サポート面談】5種類
    'career_development': '🚀',      // キャリア開発
    'stress_care': '💚',             // ストレスケア
    'performance_review': '📈',      // 人事評価
    'grievance': '💬',               // 苦情・相談
    'ad_hoc': '📋',                  // 随時

    // 【UI表示用の分類】
    'regular': '📅',
    'special': '⚠️',
    'support': '💬',

    // 【旧コード（互換性）】
    'career_support': '🚀',
    'workplace_support': '💬'
  };

  return iconMap[typeCode] || '💼'; // デフォルトアイコン
};

/**
 * 面談タイプコードのカテゴリを取得（3つの公式分類）
 */
export const getInterviewTypeCategory = (typeCode: string): 'regular' | 'special' | 'support' => {
  const categoryMap: Record<string, 'regular' | 'special' | 'support'> = {
    // 【定期面談】3種類
    'new_employee_monthly': 'regular',
    'regular_annual': 'regular',
    'management_biannual': 'regular',

    // 【特別面談】3種類
    'incident_followup': 'special',
    'return_to_work': 'special',
    'exit_interview': 'special',

    // 【サポート面談】5種類
    'career_development': 'support',
    'stress_care': 'support',
    'performance_review': 'support',
    'grievance': 'support',
    'ad_hoc': 'support',

    // 【UI表示用の分類】
    'regular': 'regular',
    'special': 'special',
    'support': 'support',

    // 【旧コード（互換性）】
    'career_support': 'support',
    'workplace_support': 'support'
  };

  return categoryMap[typeCode] || 'support'; // デフォルトはサポート面談
};

/**
 * すべての面談タイプコードを取得（人事システム統合仕様書の公式11種類）
 */
export const getAllInterviewTypeCodes = (): string[] => {
  return [
    // 定期面談（3種類）
    'new_employee_monthly',
    'regular_annual',
    'management_biannual',
    // 特別面談（3種類）
    'incident_followup',
    'return_to_work',
    'exit_interview',
    // サポート面談（5種類）
    'career_development',
    'stress_care',
    'performance_review',
    'grievance',
    'ad_hoc'
  ];
};

/**
 * 面談分類コードを取得（3つの主要分類）
 */
export const getInterviewClassifications = (): string[] => {
  return ['regular', 'special', 'support'];
};

/**
 * すべての面談タイプ表示名を取得
 */
export const getAllInterviewTypeLabels = (): string[] => {
  return getAllInterviewTypeCodes().map(code => getInterviewTypeLabel(code));
};
