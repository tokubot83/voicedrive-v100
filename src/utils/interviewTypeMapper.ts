/**
 * Phase 6: 面談タイプ表示名マッピング（修正版）
 *
 * データベース/APIのコード値をユーザー向け表示名に変換
 * データ保存は元のコード値のまま、表示のみ変更
 *
 * 面談予約ガイドページに基づく正式な面談タイプ:
 * - 3つの分類: regular(定期面談), special(特別面談), support(サポート面談)
 * - 10種類の詳細タイプ: newcomer, general, manager, return, incident, resignation,
 *                      feedback, career, workplace, consultation
 */

/**
 * 面談タイプ分類コードから表示名を取得
 */
export const getInterviewTypeLabel = (typeCode: string): string => {
  const mapping: Record<string, string> = {
    // 3つの主要分類（面談予約ガイドページに記載）
    'regular': '定期面談',
    'special': '特別面談',
    'support': 'サポート面談',

    // 定期面談の詳細タイプ（3種類）
    'newcomer': '新入職員月次面談',
    'general': '一般職員年次面談',
    'manager': '管理職半年面談',

    // 特別面談の詳細タイプ（3種類）
    'return': '復職面談',
    'incident': 'インシデント後面談',
    'resignation': '退職面談',

    // サポート面談の詳細タイプ（4種類）
    'feedback': 'フィードバック面談',
    'career': 'キャリア系面談',
    'workplace': '職場環境系面談',
    'consultation': '個別相談面談'
  };

  return mapping[typeCode] || typeCode; // マッピングにない場合は元の値を返す
};

/**
 * 面談タイプコードからアイコンを取得
 */
export const getInterviewTypeIcon = (typeCode: string): string => {
  const iconMap: Record<string, string> = {
    // 3つの主要分類
    'regular': '📅',
    'special': '⚠️',
    'support': '💬',

    // 定期面談の詳細タイプ（3種類）
    'newcomer': '🌱',
    'general': '📊',
    'manager': '👔',

    // 特別面談の詳細タイプ（3種類）
    'return': '🔄',
    'incident': '⚠️',
    'resignation': '🚪',

    // サポート面談の詳細タイプ（4種類）
    'feedback': '📈',
    'career': '🚀',
    'workplace': '🏢',
    'consultation': '👤'
  };

  return iconMap[typeCode] || '💼'; // デフォルトアイコン
};

/**
 * 面談タイプコードのカテゴリを取得（3つの公式分類に統一）
 */
export const getInterviewTypeCategory = (typeCode: string): 'regular' | 'special' | 'support' => {
  const categoryMap: Record<string, 'regular' | 'special' | 'support'> = {
    // 3つの主要分類
    'regular': 'regular',
    'special': 'special',
    'support': 'support',

    // 定期面談の詳細タイプ
    'newcomer': 'regular',
    'general': 'regular',
    'manager': 'regular',

    // 特別面談の詳細タイプ
    'return': 'special',
    'incident': 'special',
    'resignation': 'special',

    // サポート面談の詳細タイプ
    'feedback': 'support',
    'career': 'support',
    'workplace': 'support',
    'consultation': 'support'
  };

  return categoryMap[typeCode] || 'support'; // デフォルトはサポート面談
};

/**
 * すべての面談タイプコードを取得（面談予約ガイドページの公式10種類）
 */
export const getAllInterviewTypeCodes = (): string[] => {
  return [
    // 定期面談（3種類）
    'newcomer',
    'general',
    'manager',
    // 特別面談（3種類）
    'return',
    'incident',
    'resignation',
    // サポート面談（4種類）
    'feedback',
    'career',
    'workplace',
    'consultation'
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
