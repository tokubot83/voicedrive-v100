// Client-side Content Moderation Service
// リアルタイム禁止語句チェックと代替表現提案

import { ContentModerationService, ModerationResult } from './ContentModerationService';

// 代替表現の提案データベース
interface AlternativeSuggestion {
  original: string;
  alternatives: string[];
  category: 'attack' | 'harassment' | 'privacy' | 'general';
}

export class ClientModerationService {
  private static instance: ClientModerationService;
  private moderationService: ContentModerationService;
  private debounceTimer: NodeJS.Timeout | null = null;

  // 代替表現データベース
  private readonly ALTERNATIVE_SUGGESTIONS: AlternativeSuggestion[] = [
    // 個人攻撃系
    {
      original: '無能',
      alternatives: [
        '能力向上の余地がある',
        '改善の必要がある',
        'スキルアップが期待される'
      ],
      category: 'attack'
    },
    {
      original: 'バカ',
      alternatives: [
        '理解が不足している',
        '説明が必要',
        '認識の相違がある'
      ],
      category: 'attack'
    },
    {
      original: 'アホ',
      alternatives: [
        '判断に課題がある',
        '見直しが必要',
        '再考の余地がある'
      ],
      category: 'attack'
    },
    {
      original: '役に立たない',
      alternatives: [
        '貢献方法の見直しが必要',
        '役割の再定義が求められる',
        '適材適所の検討が必要'
      ],
      category: 'attack'
    },

    // ハラスメント系
    {
      original: 'やめろ',
      alternatives: [
        '見直しを検討すべき',
        '改善が必要',
        '方針の変更を提案'
      ],
      category: 'harassment'
    },
    {
      original: 'クビ',
      alternatives: [
        '配置転換の検討',
        '役割の見直し',
        '適性の再評価'
      ],
      category: 'harassment'
    },
    {
      original: '向いてない',
      alternatives: [
        '適性の再検討が必要',
        '別の役割が向いている可能性',
        '強みを活かせる配置の検討'
      ],
      category: 'harassment'
    },

    // プライバシー系
    {
      original: '住所',
      alternatives: [
        '連絡先情報',
        '所在地（詳細は控える）'
      ],
      category: 'privacy'
    },
    {
      original: '電話番号',
      alternatives: [
        '連絡手段',
        '問い合わせ窓口'
      ],
      category: 'privacy'
    },
    {
      original: '給与',
      alternatives: [
        '報酬体系',
        '待遇面',
        '処遇条件'
      ],
      category: 'privacy'
    }
  ];

  private constructor() {
    this.moderationService = ContentModerationService.getInstance();
  }

  static getInstance(): ClientModerationService {
    if (!ClientModerationService.instance) {
      ClientModerationService.instance = new ClientModerationService();
    }
    return ClientModerationService.instance;
  }

  /**
   * リアルタイムコンテンツチェック（debounce付き）
   * @param content チェック対象のテキスト
   * @param callback チェック結果のコールバック
   * @param debounceMs debounce時間（デフォルト300ms）
   */
  public checkContentRealtime(
    content: string,
    callback: (result: ModerationResult) => void,
    debounceMs: number = 300
  ): void {
    // 既存のタイマーをクリア
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 新しいタイマーを設定
    this.debounceTimer = setTimeout(() => {
      const result = this.moderationService.moderateContent(content);
      callback(result);
    }, debounceMs);
  }

  /**
   * 即座にコンテンツをチェック（debounceなし）
   * @param content チェック対象のテキスト
   * @returns チェック結果
   */
  public checkContentImmediate(content: string): ModerationResult {
    return this.moderationService.moderateContent(content);
  }

  /**
   * 違反した語句に対する代替表現を提案
   * @param violatedPhrase 違反した語句
   * @returns 代替表現の配列
   */
  public suggestAlternatives(violatedPhrase: string): string[] {
    // 完全一致で検索
    const exactMatch = this.ALTERNATIVE_SUGGESTIONS.find(
      s => s.original.toLowerCase() === violatedPhrase.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch.alternatives;
    }

    // 部分一致で検索
    const partialMatch = this.ALTERNATIVE_SUGGESTIONS.find(
      s => violatedPhrase.toLowerCase().includes(s.original.toLowerCase())
    );

    if (partialMatch) {
      return partialMatch.alternatives;
    }

    // デフォルトの提案
    return [
      'より建設的な表現を検討してください',
      '具体的な改善提案を含めてください',
      '事実に基づいた客観的な記述を心がけてください'
    ];
  }

  /**
   * 投稿内容に建設的な要素が含まれているかチェック
   * @param content 投稿内容
   * @returns 建設性スコア（0-100）
   */
  public assessConstructiveness(content: string): number {
    let score = 50; // ベーススコア

    // ポジティブ要素のチェック
    const positivePatterns = [
      /改善|向上|効率化|最適化/,
      /提案|アイデア|工夫|検討/,
      /解決|対策|方法|手段/,
      /具体的|詳細|明確/,
      /～すべき|～してはどうか|～を検討/
    ];

    positivePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        score += 10;
      }
    });

    // ネガティブ要素のチェック
    const negativePatterns = [
      /ダメ|無理|不可能/,
      /意味がない|無駄/,
      /できない|やらない/
    ];

    negativePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        score -= 15;
      }
    });

    // スコアを0-100の範囲に収める
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 投稿内容の改善提案を生成
   * @param content 投稿内容
   * @param violations 違反項目
   * @returns 改善提案テキスト
   */
  public generateImprovementSuggestions(
    content: string,
    violations: any[]
  ): string[] {
    const suggestions: string[] = [];

    // 個人攻撃が検出された場合
    if (violations.some(v => v.violationType === 'personal_attack')) {
      suggestions.push('個人ではなく、業務プロセスや制度の課題として記述してください');
    }

    // ハラスメント表現が検出された場合
    if (violations.some(v => v.violationType === 'harassment')) {
      suggestions.push('強制的な表現を避け、改善提案の形で記述してください');
    }

    // プライバシー侵害が検出された場合
    if (violations.some(v => v.violationType === 'privacy_violation')) {
      suggestions.push('個人を特定できる情報は記載しないでください');
    }

    // 建設性が低い場合
    const constructiveness = this.assessConstructiveness(content);
    if (constructiveness < 40) {
      suggestions.push('具体的な改善案や解決策を含めてください');
      suggestions.push('現状の問題点だけでなく、望ましい状態も記述してください');
    }

    return suggestions;
  }

  /**
   * 違反語句を代替表現に自動置換
   * @param content 元のテキスト
   * @param violatedPhrase 違反語句
   * @param alternative 代替表現
   * @returns 置換後のテキスト
   */
  public replaceWithAlternative(
    content: string,
    violatedPhrase: string,
    alternative: string
  ): string {
    const regex = new RegExp(violatedPhrase, 'gi');
    return content.replace(regex, alternative);
  }

  /**
   * デバウンスタイマーをキャンセル
   */
  public cancelDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
