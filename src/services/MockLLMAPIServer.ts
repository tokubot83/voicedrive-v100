// Mock LLM API Server
// 開発・テスト用のモックLLM APIサーバー（Medical Team実装前に使用）

import {
  LLMModerationRequest,
  LLMModerationResult,
  LLMViolation,
  LLMViolationType
} from '../types/llmModeration';

/**
 * モックLLM APIサーバー
 * 実際のLlama 3.2 8B APIの動作をシミュレート
 */
export class MockLLMAPIServer {
  private static instance: MockLLMAPIServer;

  // モック検出パターン（Llama動作をシミュレート）
  private readonly MOCK_PATTERNS = {
    personal_attack: [
      /バカ|馬鹿|アホ|無能|役立たず/gi,
      /使えない|ダメ人間|クズ/gi
    ],
    defamation: [
      /悪口|中傷|嘘つき|詐欺師/gi,
      /信用できない|疑わしい/gi
    ],
    harassment: [
      /パワハラ|セクハラ|いじめ/gi,
      /辞めろ|クビ|追い出す/gi
    ],
    discrimination: [
      /差別|偏見|見下す/gi
    ],
    threatening: [
      /脅迫|脅す|覚悟しろ/gi
    ],
    hate_speech: [
      /ヘイト|憎悪|敵意/gi
    ]
  };

  // 建設的表現パターン
  private readonly CONSTRUCTIVE_PATTERNS = [
    /改善|向上|効率化|最適化/gi,
    /提案|アイデア|工夫|検討/gi,
    /協力|サポート|支援|助け合/gi,
    /感謝|ありがとう|助かる/gi
  ];

  private constructor() {}

  static getInstance(): MockLLMAPIServer {
    if (!MockLLMAPIServer.instance) {
      MockLLMAPIServer.instance = new MockLLMAPIServer();
    }
    return MockLLMAPIServer.instance;
  }

  /**
   * モックLLMモデレーション実行
   * @param request リクエスト
   * @returns モック結果（Llama 3.2 8Bの動作をシミュレート）
   */
  public async moderate(request: LLMModerationRequest): Promise<LLMModerationResult> {
    const startTime = Date.now();

    // リアルなレスポンス時間をシミュレート（300-800ms）
    await this.simulateProcessingTime();

    const violations = this.detectViolations(request.content);
    const constructiveScore = this.calculateConstructiveScore(request.content);

    // 重大度の計算
    const severity = this.calculateSeverity(violations, constructiveScore);

    // 信頼度の計算（モックなので70-95%の範囲）
    const confidence = this.calculateConfidence(violations, request.content);

    // 投稿可否の判定
    const allowed = violations.length === 0 || severity === 'low';

    // 修正提案の生成
    const suggestedEdits = violations.length > 0
      ? this.generateSuggestedEdits(request.content, violations)
      : [];

    const processingTime = Date.now() - startTime;

    return {
      allowed,
      severity,
      confidence,
      violations,
      explanation: this.generateExplanation(violations, constructiveScore, allowed),
      suggestedEdits,
      metadata: {
        modelVersion: 'mock-llama-3.2-8b-v1.0',
        processingTime,
        timestamp: new Date()
      }
    };
  }

  /**
   * 違反を検出
   * @param content コンテンツ
   * @returns 検出された違反リスト
   */
  private detectViolations(content: string): LLMViolation[] {
    const violations: LLMViolation[] = [];

    // 各パターンでチェック
    Object.entries(this.MOCK_PATTERNS).forEach(([type, patterns]) => {
      patterns.forEach(pattern => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          if (match.index !== undefined) {
            violations.push({
              type: type as LLMViolationType,
              severity: this.getViolationSeverity(type as LLMViolationType),
              description: this.getViolationDescription(type as LLMViolationType),
              extractedText: match[0],
              startIndex: match.index,
              endIndex: match.index + match[0].length,
              confidence: this.getPatternConfidence(match[0])
            });
          }
        }
      });
    });

    return violations;
  }

  /**
   * 建設性スコアを計算
   * @param content コンテンツ
   * @returns スコア（0-100）
   */
  private calculateConstructiveScore(content: string): number {
    let score = 50;

    // ポジティブパターンでスコアアップ
    this.CONSTRUCTIVE_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        score += matches.length * 10;
      }
    });

    // 違反パターンでスコアダウン
    Object.values(this.MOCK_PATTERNS).forEach(patterns => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          score -= matches.length * 15;
        }
      });
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 重大度を計算
   * @param violations 違反リスト
   * @param constructiveScore 建設性スコア
   * @returns 重大度
   */
  private calculateSeverity(
    violations: LLMViolation[],
    constructiveScore: number
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (violations.length === 0 && constructiveScore >= 60) {
      return 'none';
    }

    if (violations.length === 0 && constructiveScore >= 40) {
      return 'low';
    }

    const hasCritical = violations.some(v => v.severity === 'critical');
    if (hasCritical) return 'critical';

    const hasHigh = violations.some(v => v.severity === 'high');
    if (hasHigh || violations.length >= 3) return 'high';

    const hasMedium = violations.some(v => v.severity === 'medium');
    if (hasMedium || violations.length >= 2) return 'medium';

    return 'low';
  }

  /**
   * 信頼度を計算
   * @param violations 違反リスト
   * @param content コンテンツ
   * @returns 信頼度（0-100）
   */
  private calculateConfidence(violations: LLMViolation[], content: string): number {
    if (violations.length === 0) {
      // 違反なしの場合、テキストが長いほど信頼度が高い
      return Math.min(95, 70 + Math.floor(content.length / 50) * 5);
    }

    // 違反ありの場合、違反の平均信頼度
    const avgConfidence = violations.reduce((sum, v) => sum + v.confidence, 0) / violations.length;
    return Math.round(avgConfidence);
  }

  /**
   * 違反タイプごとの重大度を取得
   * @param type 違反タイプ
   * @returns 重大度
   */
  private getViolationSeverity(type: LLMViolationType): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'personal_attack':
      case 'harassment':
      case 'threatening':
        return 'high';
      case 'defamation':
      case 'hate_speech':
        return 'medium';
      case 'discrimination':
        return 'critical';
      default:
        return 'low';
    }
  }

  /**
   * 違反タイプごとの説明を取得
   * @param type 違反タイプ
   * @returns 説明
   */
  private getViolationDescription(type: LLMViolationType): string {
    const descriptions: Record<LLMViolationType, string> = {
      personal_attack: '特定の個人への攻撃的な表現が検出されました',
      defamation: '誹謗中傷の可能性がある表現が検出されました',
      harassment: 'ハラスメントに該当する可能性がある表現が検出されました',
      discrimination: '差別的な表現が検出されました',
      privacy_violation: 'プライバシー侵害の可能性がある内容が検出されました',
      inappropriate_content: '不適切なコンテンツが検出されました',
      threatening: '脅迫的な表現が検出されました',
      hate_speech: 'ヘイトスピーチに該当する可能性がある表現が検出されました',
      misinformation: '誤情報の可能性がある内容が検出されました',
      spam: 'スパムの可能性がある内容が検出されました',
      other: 'その他の問題が検出されました'
    };

    return descriptions[type] || '問題が検出されました';
  }

  /**
   * パターンマッチの信頼度を取得
   * @param matched マッチした文字列
   * @returns 信頼度（0-100）
   */
  private getPatternConfidence(matched: string): number {
    // マッチした文字列が長いほど信頼度が高い
    const baseConfidence = 75;
    const lengthBonus = Math.min(20, matched.length * 2);
    return Math.min(95, baseConfidence + lengthBonus);
  }

  /**
   * 判定理由の説明を生成
   * @param violations 違反リスト
   * @param constructiveScore 建設性スコア
   * @param allowed 投稿可否
   * @returns 説明文
   */
  private generateExplanation(
    violations: LLMViolation[],
    constructiveScore: number,
    allowed: boolean
  ): string {
    if (violations.length === 0) {
      if (constructiveScore >= 70) {
        return '建設的で適切な内容です。組織の改善に貢献する提案が含まれています。';
      }
      return '特に問題は検出されませんでしたが、より建設的な表現を心がけることを推奨します。';
    }

    const violationTypes = [...new Set(violations.map(v => v.type))];
    const typeDescriptions = violationTypes.map(type => this.getViolationDescription(type));

    if (!allowed) {
      return `以下の理由により投稿をブロックしました：${typeDescriptions.join('、')}。より建設的で尊重的な表現に修正してください。`;
    }

    return `軽微な問題が検出されました：${typeDescriptions.join('、')}。投稿は可能ですが、表現の見直しを推奨します。`;
  }

  /**
   * 修正提案を生成
   * @param content 元のコンテンツ
   * @param violations 違反リスト
   * @returns 修正提案リスト
   */
  private generateSuggestedEdits(content: string, violations: LLMViolation[]): string[] {
    const suggestions: string[] = [];

    // 違反箇所を建設的な表現に置き換える提案
    const replacements: Record<string, string> = {
      'バカ': '改善の余地がある',
      '馬鹿': '検討が必要',
      'アホ': '再考が必要',
      '無能': '能力向上の機会がある',
      '役立たず': 'スキルアップが期待される',
      '使えない': '改善が必要',
      'ダメ人間': '成長の余地がある',
      'クズ': '改善が必要な点がある'
    };

    violations.forEach(violation => {
      if (violation.extractedText) {
        const replacement = replacements[violation.extractedText];
        if (replacement) {
          const newContent = content.replace(violation.extractedText, replacement);
          if (!suggestions.includes(newContent)) {
            suggestions.push(newContent);
          }
        }
      }
    });

    return suggestions.slice(0, 3);  // 最大3つの提案
  }

  /**
   * 処理時間をシミュレート（300-800ms）
   */
  private async simulateProcessingTime(): Promise<void> {
    const delay = 300 + Math.random() * 500;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * モックAPIエンドポイント（Express等のサーバーで使用）
   * @param req リクエスト
   * @returns レスポンス
   */
  public async handleRequest(req: LLMModerationRequest): Promise<LLMModerationResult> {
    console.log('🤖 Mock LLM API リクエスト受信:', {
      contentLength: req.content.length,
      context: req.context
    });

    const result = await this.moderate(req);

    console.log('🤖 Mock LLM API レスポンス:', {
      allowed: result.allowed,
      severity: result.severity,
      violations: result.violations.length,
      processingTime: result.metadata.processingTime
    });

    return result;
  }
}
