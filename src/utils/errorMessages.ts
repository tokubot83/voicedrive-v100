/**
 * エラーメッセージの日本語定義
 */
export const errorMessages = {
  // 必須項目
  required: {
    staff: '職員を選択してください',
    date: '日付を選択してください',
    time: '時間を選択してください',
    classification: '面談分類を選択してください',
    type: '面談種別を選択してください',
    category: 'カテゴリを選択してください',
    evaluationPeriod: '評価期間を選択してください',
    appealCategory: '申し立てカテゴリを選択してください',
    appealReason: '申し立て理由を入力してください'
  },

  // バリデーション
  validation: {
    pastDate: '過去の日時は選択できません',
    invalidTarget: 'この職員は選択した面談の対象外です',
    duplicateBooking: '同じ日時に既に予約が入っています',
    maxBookingsExceeded: '予約可能な上限数を超えています',
    invalidTimeSlot: '選択された時間帯は利用できません'
  },

  // API関連
  api: {
    fetchFailed: 'データの取得に失敗しました',
    saveFailed: '保存に失敗しました',
    deleteFailed: '削除に失敗しました',
    updateFailed: '更新に失敗しました',
    networkError: 'ネットワークエラーが発生しました',
    serverError: 'サーバーエラーが発生しました',
    unauthorized: '認証が必要です',
    forbidden: 'アクセス権限がありません'
  },

  // 予約関連
  booking: {
    createFailed: '予約の作成に失敗しました',
    confirmFailed: '予約の確定に失敗しました',
    cancelFailed: '予約のキャンセルに失敗しました',
    modifyFailed: '予約の変更に失敗しました',
    notFound: '予約が見つかりません',
    expired: '予約期限が切れています',
    conflict: '他の予約と時間が重複しています'
  },

  // カレンダー関連
  calendar: {
    loadFailed: 'カレンダーの読み込みに失敗しました',
    noAvailableSlots: '利用可能な時間枠がありません',
    syncFailed: 'カレンダーの同期に失敗しました'
  },

  // 通知関連
  notification: {
    sendFailed: '通知の送信に失敗しました',
    emailFailed: 'メールの送信に失敗しました',
    reminderFailed: 'リマインダーの設定に失敗しました'
  },

  // システム関連
  system: {
    unexpectedError: '予期しないエラーが発生しました',
    maintenance: 'システムメンテナンス中です',
    sessionExpired: 'セッションの有効期限が切れました',
    reloadRequired: 'ページの再読み込みが必要です'
  },

  // 異議申し立て関連
  appeal: {
    invalidReason: '申し立て理由は100文字以上入力してください',
    invalidReasonMax: '申し立て理由は2000文字以内で入力してください',
    invalidScore: '評価点は0〜100の範囲で入力してください',
    fileTooLarge: 'ファイルサイズは10MBまでです',
    invalidFileType: '許可されていないファイル形式です（PDF、画像のみ）',
    tooManyFiles: 'ファイルは最大5個まで添付できます',
    submissionFailed: '異議申し立ての送信に失敗しました',
    updateFailed: '異議申し立ての更新に失敗しました',
    withdrawFailed: '異議申し立ての取り下げに失敗しました',
    notEligible: '申し立て期限を過ぎています',
    e002: '有効な評価期間が見つかりません',
    periodExpired: '申し立て期限を過ぎています（評価開示から14日以内）',
    alreadySubmitted: 'この評価期間の異議申し立ては既に提出されています',
    invalidStatus: '現在のステータスでは更新できません',
    alreadyResolved: 'すでに完了または取り下げ済みです',
    noReviewer: '審査者の割り当てに失敗しました。管理者に連絡してください',
    defaultReviewerAssigned: 'デフォルト審査者が割り当てられました'
  }
};

/**
 * エラーメッセージを取得
 */
export const getErrorMessage = (category: string, key: string): string => {
  const categoryMessages = errorMessages[category as keyof typeof errorMessages];
  if (categoryMessages && typeof categoryMessages === 'object') {
    return (categoryMessages as any)[key] || errorMessages.system.unexpectedError;
  }
  return errorMessages.system.unexpectedError;
};

/**
 * エラーコードからメッセージを取得
 */
export const getErrorMessageByCode = (errorCode: string): string => {
  const errorCodeMap: Record<string, string> = {
    'ERR_REQUIRED_FIELD': errorMessages.required.staff,
    'ERR_PAST_DATE': errorMessages.validation.pastDate,
    'ERR_DUPLICATE': errorMessages.validation.duplicateBooking,
    'ERR_NETWORK': errorMessages.api.networkError,
    'ERR_SERVER': errorMessages.api.serverError,
    'ERR_AUTH': errorMessages.api.unauthorized,
    'ERR_FORBIDDEN': errorMessages.api.forbidden,
    'ERR_NOT_FOUND': errorMessages.booking.notFound,
    'ERR_CONFLICT': errorMessages.booking.conflict,
    'ERR_EXPIRED': errorMessages.booking.expired,
    // 異議申し立て関連
    'INVALID_REASON': errorMessages.appeal.invalidReason,
    'E002': errorMessages.appeal.e002,
    'INVALID_STATUS': errorMessages.appeal.invalidStatus,
    'ALREADY_RESOLVED': errorMessages.appeal.alreadyResolved,
    'NO_REVIEWER': errorMessages.appeal.noReviewer,
    'DEFAULT_REVIEWER': errorMessages.appeal.defaultReviewerAssigned
  };

  return errorCodeMap[errorCode] || errorMessages.system.unexpectedError;
};

/**
 * バリデーションエラーメッセージを生成
 */
export const createValidationErrorMessage = (fieldName: string): string => {
  const fieldNameMap: Record<string, string> = {
    staff: '職員',
    date: '日付',
    time: '時間',
    classification: '面談分類',
    type: '面談種別',
    category: 'カテゴリ',
    description: '説明'
  };

  const displayName = fieldNameMap[fieldName] || fieldName;
  return `${displayName}は必須項目です`;
};

/**
 * 複数のエラーメッセージを結合
 */
export const combineErrorMessages = (messages: string[]): string => {
  if (messages.length === 0) return '';
  if (messages.length === 1) return messages[0];
  
  return messages.map((msg, index) => `${index + 1}. ${msg}`).join('\n');
};

/**
 * ユーザーフレンドリーなエラーメッセージに変換
 */
export const toUserFriendlyMessage = (error: Error | string): string => {
  if (typeof error === 'string') {
    return error;
  }

  // 特定のエラータイプの処理
  if (error.message.includes('Network')) {
    return errorMessages.api.networkError;
  }
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return errorMessages.api.unauthorized;
  }
  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    return errorMessages.api.forbidden;
  }
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    return errorMessages.booking.notFound;
  }
  if (error.message.includes('500') || error.message.includes('Internal Server')) {
    return errorMessages.api.serverError;
  }

  // デフォルト
  return errorMessages.system.unexpectedError;
};