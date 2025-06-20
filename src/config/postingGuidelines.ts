// VoiceDrive 投稿ガイドライン・ポリシー定義

export interface GuidelineSection {
  id: string;
  title: string;
  description: string;
  examples?: string[];
  severity: 'info' | 'warning' | 'danger';
  icon: string;
}

export interface ViolationPolicy {
  violationType: string;
  firstOffense: string;
  secondOffense: string;
  thirdOffense: string;
  emergencyAction: string;
}

// 投稿ガイドライン
export const POSTING_GUIDELINES: GuidelineSection[] = [
  {
    id: 'respect',
    title: '相互尊重の原則',
    description: 'すべての投稿は同僚の人格と尊厳を尊重し、建設的な議論を心がけてください。',
    examples: [
      '✅ 「この提案について、○○の観点から改善案を検討してみました」',
      '❌ 「○○さんは管理職に向いていない」',
      '❌ 「△△部門の人たちは理解力が足りない」'
    ],
    severity: 'danger',
    icon: '🤝'
  },
  {
    id: 'personal_attacks',
    title: '個人攻撃の禁止',
    description: '特定の個人の能力、性格、適性に対する否定的な評価や攻撃的な表現は禁止です。',
    examples: [
      '❌ 「無能」「やめろ」「向いてない」「役に立たない」',
      '❌ 「バカ」「アホ」「クズ」などの侮辱的表現',
      '❌ 「○○さんは××職に向いていない」',
      '✅ 代わりに具体的な改善提案や建設的な意見を述べる'
    ],
    severity: 'danger',
    icon: '🚫'
  },
  {
    id: 'harassment',
    title: 'ハラスメントの防止',
    description: 'あらゆる形態のハラスメント（パワハラ、セクハラ、いじめ等）は厳禁です。',
    examples: [
      '❌ 退職や配置転換を強要する表現',
      '❌ 脅迫的な言動や威圧的な表現',
      '❌ 個人の外見、性別、年齢に関する不適切な言及',
      '❌ 継続的な否定的言及や執拗な批判'
    ],
    severity: 'danger',
    icon: '⚠️'
  },
  {
    id: 'privacy',
    title: '個人情報の保護',
    description: '個人のプライバシーに関わる情報の投稿は禁止です。',
    examples: [
      '❌ 住所、電話番号、メールアドレスの公開',
      '❌ 個人の病歴、家族情報、財務状況',
      '❌ 給与、人事評価、個人的な問題',
      '❌ 患者情報や機密医療データ'
    ],
    severity: 'danger',
    icon: '🔒'
  },
  {
    id: 'confidentiality',
    title: '機密情報の管理',
    description: '組織の機密情報や外部秘匿情報の投稿は禁止です。',
    examples: [
      '❌ 未発表の経営方針や戦略情報',
      '❌ 財務データや契約情報',
      '❌ 人事異動や組織変更の内部情報',
      '❌ 法的問題や係争中の案件'
    ],
    severity: 'danger',
    icon: '🔐'
  },
  {
    id: 'constructive',
    title: '建設的な議論',
    description: '批判よりも改善提案を、問題指摘と共に解決策を提示してください。',
    examples: [
      '✅ 「現状の課題を踏まえ、○○という改善案はいかがでしょうか」',
      '✅ 「この方法では△△のリスクがあるため、××という代替案を提案します」',
      '❌ 「この案はダメ」「意味がない」などの否定のみ',
      '❌ 具体的な根拠や代替案のない批判'
    ],
    severity: 'warning',
    icon: '💡'
  },
  {
    id: 'accuracy',
    title: '情報の正確性',
    description: '事実に基づいた正確な情報を投稿し、推測や憶測は明確に区別してください。',
    examples: [
      '✅ 「データによると○○です」',
      '✅ 「私の経験では△△でしたが、確認が必要かもしれません」',
      '❌ 未確認情報を事実として投稿',
      '❌ 根拠のない噂や憶測の拡散'
    ],
    severity: 'warning',
    icon: '📊'
  },
  {
    id: 'professional',
    title: '職場としての品位',
    description: '職場環境にふさわしい言葉遣いと内容を心がけてください。',
    examples: [
      '✅ 丁寧語・尊敬語を適切に使用',
      '✅ 専門的で建設的な議論',
      '❌ 過度にカジュアルな表現',
      '❌ 不適切なジョークや中傷的な表現'
    ],
    severity: 'info',
    icon: '👔'
  },
  {
    id: 'scope',
    title: '投稿範囲の理解',
    description: '投稿の可視範囲を理解し、適切なレベルで議論してください。',
    examples: [
      '✅ チーム内の課題はチームレベルで投稿',
      '✅ 施設全体に関わる提案は適切なレベルで投稿',
      '❌ 個人的な問題を組織レベルで投稿',
      '❌ 機密度の高い内容を広範囲に投稿'
    ],
    severity: 'info',
    icon: '🎯'
  }
];

// 違反時の対応ポリシー
export const VIOLATION_POLICIES: ViolationPolicy[] = [
  {
    violationType: 'personal_attack',
    firstOffense: '警告と投稿削除、ガイドライン再教育',
    secondOffense: '一定期間の投稿停止（7日間）、上司との面談',
    thirdOffense: '長期投稿停止（30日間）、人事部面談、懲戒検討',
    emergencyAction: '即座削除、緊急面談、コンプライアンス調査'
  },
  {
    violationType: 'harassment',
    firstOffense: '即座削除、緊急面談、ハラスメント調査開始',
    secondOffense: '投稿禁止、懲戒処分、再発防止研修',
    thirdOffense: '重篤な懲戒処分、組織的対応',
    emergencyAction: '即座削除、緊急隔離、法的対応検討'
  },
  {
    violationType: 'privacy_violation',
    firstOffense: '即座削除、個人情報保護研修、始末書',
    secondOffense: '投稿停止、セキュリティクリアランス見直し',
    thirdOffense: '長期停止、情報取扱資格剥奪',
    emergencyAction: '即座削除、情報漏洩調査、法務相談'
  },
  {
    violationType: 'confidentiality_breach',
    firstOffense: '即座削除、機密保持研修、警告書',
    secondOffense: '投稿停止、アクセス権限見直し、懲戒検討',
    thirdOffense: '重大な懲戒処分、法的責任追及',
    emergencyAction: '即座削除、緊急調査、危機管理対応'
  },
  {
    violationType: 'misinformation',
    firstOffense: '投稿修正または削除、正確な情報の再投稿要求',
    secondOffense: '警告、情報リテラシー研修',
    thirdOffense: '投稿停止、信頼性審査',
    emergencyAction: '即座削除、訂正情報の公開、影響調査'
  },
  {
    violationType: 'inappropriate_language',
    firstOffense: '警告、投稿修正要求',
    secondOffense: '一時投稿停止（3日間）、ビジネスマナー研修',
    thirdOffense: '長期停止（14日間）、行動改善計画',
    emergencyAction: '即座削除、緊急面談'
  }
];

// 緊急削除の基準
export const EMERGENCY_DELETION_CRITERIA = {
  immediate: [
    '他者への直接的な攻撃や脅迫',
    '個人情報の公開または漏洩',
    '機密情報の漏洩',
    '法的リスクを伴う内容',
    '組織の信用を著しく損なう内容'
  ],
  expedited: [
    '継続的なハラスメント行為',
    '職場環境を悪化させる内容',
    '誤情報の拡散',
    '不適切な個人批判'
  ],
  standard: [
    'ガイドライン違反の一般的な内容',
    '建設性に欠ける批判',
    '不適切な言葉遣い'
  ]
};

// 緊急削除後の必須フォローアップ
export const EMERGENCY_DELETION_FOLLOWUP = {
  within_1_hour: [
    '削除者による初期報告',
    '関係部署への通知',
    '緊急性評価'
  ],
  within_24_hours: [
    '詳細調査の開始',
    '関係者面談の実施',
    'コンプライアンス窓口への正式報告'
  ],
  within_48_hours: [
    '削除の妥当性最終確認',
    '再発防止策の検討',
    '必要に応じた懲戒手続きの開始'
  ],
  within_1_week: [
    '全関係者への結果報告',
    '改善策の実装',
    'ポリシー見直しの検討'
  ]
};

// 異議申し立て制度
export const APPEALS_PROCESS = {
  eligibility: [
    '削除された投稿の投稿者',
    '削除の影響を受けた関係者',
    '公正性を疑問視する第三者（匿名可）'
  ],
  procedure: [
    '削除から48時間以内に異議申し立て',
    'コンプライアンス窓口への正式申請',
    '独立した審査委員会による検討',
    '7営業日以内の審査結果通知'
  ],
  review_criteria: [
    '削除の必要性と妥当性',
    'ガイドライン適用の適切性',
    '手続きの公正性',
    '比例原則の遵守'
  ],
  possible_outcomes: [
    '削除維持（元の判断を支持）',
    '削除取り消し（投稿復活）',
    '部分修正（一部内容の復活）',
    '代替措置（警告のみなど）'
  ]
};

// ガイドライン教育プログラム
export const EDUCATION_PROGRAM = {
  mandatory_training: [
    '新入職員向け基礎研修',
    '管理職向け削除権限研修',
    '年次ガイドライン更新研修'
  ],
  violation_based_training: [
    'ハラスメント防止研修',
    '個人情報保護研修',
    '建設的コミュニケーション研修',
    'デジタルエチケット研修'
  ],
  assessment_methods: [
    '理解度テスト',
    'ケーススタディ演習',
    '実践シミュレーション',
    'ピアレビュー活動'
  ]
};

// ガイドライン遵守のメリット
export const COMPLIANCE_BENEFITS = {
  individual: [
    '信頼性の向上',
    'コミュニケーション能力の向上',
    'キャリア発展への好影響',
    'ストレスフリーな職場環境'
  ],
  organizational: [
    '建設的な議論文化の醸成',
    '革新的なアイデアの創出',
    '職場満足度の向上',
    'ブランド価値の向上'
  ],
  system: [
    '高品質な提案の増加',
    '効率的な意思決定',
    'リスクの最小化',
    '持続可能な成長'
  ]
};

// 定期的なガイドライン見直し
export const GUIDELINE_REVIEW_SCHEDULE = {
  quarterly: [
    '違反件数と傾向の分析',
    'ガイドライン有効性の評価',
    '新しいリスクの特定'
  ],
  annually: [
    '全体的なポリシー見直し',
    '法的要件の更新確認',
    'ベストプラクティスの更新'
  ],
  as_needed: [
    '重大インシデント後の緊急見直し',
    '法規制変更への対応',
    '組織構造変更への対応'
  ]
};