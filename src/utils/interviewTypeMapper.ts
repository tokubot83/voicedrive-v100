/**
 * Phase 6: 面談タイプ表示名マッピング
 *
 * データベース/APIのコード値をユーザー向け表示名に変換
 * データ保存は元のコード値のまま、表示のみ変更
 */

/**
 * 面談タイプコードから表示名を取得
 */
export const getInterviewTypeLabel = (typeCode: string): string => {
  const mapping: Record<string, string> = {
    // 定期面談系
    'regular': '定期面談',
    'career_support': '定期面談',

    // 特別面談系
    'special': '特別面談',
    'individual_consultation': '個別相談',

    // サポート面談系
    'workplace_support': '職場サポート面談',
    'mental_health': 'メンタルヘルス面談',
    'stress_check': 'ストレスチェック面談',

    // ライフイベント系
    'exit': '退職面談',
    'return': '復職面談',
    'maternity': '産休・育休面談',

    // その他
    'emergency': '緊急面談',
    'follow_up': 'フォローアップ面談'
  };

  return mapping[typeCode] || typeCode; // マッピングにない場合は元の値を返す
};

/**
 * 面談タイプコードからアイコンを取得
 */
export const getInterviewTypeIcon = (typeCode: string): string => {
  const iconMap: Record<string, string> = {
    // 定期面談系
    'regular': '📝',
    'career_support': '📝',

    // 特別面談系
    'special': '⭐',
    'individual_consultation': '💬',

    // サポート面談系
    'workplace_support': '🤝',
    'mental_health': '💚',
    'stress_check': '🧘',

    // ライフイベント系
    'exit': '👋',
    'return': '🔄',
    'maternity': '👶',

    // その他
    'emergency': '🚨',
    'follow_up': '📋'
  };

  return iconMap[typeCode] || '💼'; // デフォルトアイコン
};

/**
 * 面談タイプコードのカテゴリを取得
 */
export const getInterviewTypeCategory = (typeCode: string): 'regular' | 'special' | 'support' | 'life_event' | 'other' => {
  const categoryMap: Record<string, 'regular' | 'special' | 'support' | 'life_event' | 'other'> = {
    'regular': 'regular',
    'career_support': 'regular',
    'special': 'special',
    'individual_consultation': 'special',
    'workplace_support': 'support',
    'mental_health': 'support',
    'stress_check': 'support',
    'exit': 'life_event',
    'return': 'life_event',
    'maternity': 'life_event',
    'emergency': 'other',
    'follow_up': 'other'
  };

  return categoryMap[typeCode] || 'other';
};

/**
 * すべての面談タイプコードを取得
 */
export const getAllInterviewTypeCodes = (): string[] => {
  return [
    'regular',
    'career_support',
    'special',
    'individual_consultation',
    'workplace_support',
    'mental_health',
    'stress_check',
    'exit',
    'return',
    'maternity',
    'emergency',
    'follow_up'
  ];
};

/**
 * すべての面談タイプ表示名を取得
 */
export const getAllInterviewTypeLabels = (): string[] => {
  return getAllInterviewTypeCodes().map(code => getInterviewTypeLabel(code));
};
