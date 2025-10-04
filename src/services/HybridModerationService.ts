// Hybrid Moderation Service
// クライアント側チェック + LLM AIチェックの統合サービス

import { ClientModerationService } from './ClientModerationService';
import { LLMModerationService } from './LLMModerationService';
import { ModerationResult } from '../types/moderation';
import {
  HybridModerationResult,
  LLMModerationRequest,
  LLMModerationResult
} from '../types/llmModeration';

export class HybridModerationService {
  private static instance: HybridModerationService;

  private clientService: ClientModerationService;
  private llmService: LLMModerationService;
  private llmEnabled: boolean = true;  // LLMチェック有効/無効

  private constructor() {
    this.clientService = ClientModerationService.getInstance();
    this.llmService = LLMModerationService.getInstance();

    // 環境変数でLLM無効化可能
    if (process.env.REACT_APP_DISABLE_LLM === 'true') {
      this.llmEnabled = false;
      console.log('⚠️ LLMモデレーション無効化（クライアント側のみ）');
    }
  }

  static getInstance(): HybridModerationService {
    if (!HybridModerationService.instance) {
      HybridModerationService.instance = new HybridModerationService();
    }
    return HybridModerationService.instance;
  }

  /**
   * ハイブリッドモデレーションチェック
   * 1. クライアント側で即座にチェック
   * 2. LLM APIで詳細チェック（非同期）
   * 3. 両結果を統合して最終判定
   *
   * @param content チェック対象テキスト
   * @param context コンテキスト情報
   * @returns ハイブリッドモデレーション結果
   */
  public async checkContent(
    content: string,
    context?: {
      postType?: 'improvement' | 'community' | 'report';
      authorLevel?: number;
      department?: string;
    }
  ): Promise<HybridModerationResult> {
    // Step 1: クライアント側チェック（即座）
    const clientResult = this.clientService.checkContent(content);

    // クライアント側でブロック判定の場合、LLMチェック不要
    if (!clientResult.allowed) {
      console.log('🚫 クライアント側でブロック:', {
        severity: clientResult.severity,
        violations: clientResult.violations.map(v => v.phrase)
      });

      return {
        finalDecision: false,
        clientResult: {
          allowed: clientResult.allowed,
          severity: clientResult.severity,
          violations: clientResult.violations.map(v => v.phrase)
        },
        usedLLM: false,
        fallbackReason: 'client_blocked',
        combinedSeverity: clientResult.severity,
        recommendedAction: this.getRecommendedAction(clientResult.severity)
      };
    }

    // LLM無効時はクライアント結果のみ
    if (!this.llmEnabled) {
      return {
        finalDecision: clientResult.allowed,
        clientResult: {
          allowed: clientResult.allowed,
          severity: clientResult.severity,
          violations: clientResult.violations.map(v => v.phrase)
        },
        usedLLM: false,
        fallbackReason: 'llm_disabled',
        combinedSeverity: clientResult.severity,
        recommendedAction: this.getRecommendedAction(clientResult.severity)
      };
    }

    // Step 2: LLM APIチェック（詳細分析）
    try {
      const llmRequest: LLMModerationRequest = {
        content,
        context,
        options: {
          checkSensitivity: this.getSensitivityFromClientResult(clientResult),
          language: 'ja',
          includeExplanation: true
        }
      };

      const llmResult = await this.llmService.moderateContent(llmRequest);

      // LLM結果が取得できた場合、統合判定
      if (llmResult) {
        return this.combineResults(clientResult, llmResult);
      }

      // LLM失敗（nullが返ってきた）、クライアント結果のみ使用
      return {
        finalDecision: clientResult.allowed,
        clientResult: {
          allowed: clientResult.allowed,
          severity: clientResult.severity,
          violations: clientResult.violations.map(v => v.phrase)
        },
        usedLLM: false,
        fallbackReason: 'llm_api_failed',
        combinedSeverity: clientResult.severity,
        recommendedAction: this.getRecommendedAction(clientResult.severity)
      };

    } catch (error) {
      console.error('❌ LLMチェックエラー:', error);

      // エラー時はクライアント結果のみ使用
      return {
        finalDecision: clientResult.allowed,
        clientResult: {
          allowed: clientResult.allowed,
          severity: clientResult.severity,
          violations: clientResult.violations.map(v => v.phrase)
        },
        usedLLM: false,
        fallbackReason: `llm_error: ${error instanceof Error ? error.message : 'unknown'}`,
        combinedSeverity: clientResult.severity,
        recommendedAction: this.getRecommendedAction(clientResult.severity)
      };
    }
  }

  /**
   * クライアント結果とLLM結果を統合
   * @param clientResult クライアント側結果
   * @param llmResult LLM結果
   * @returns 統合結果
   */
  private combineResults(
    clientResult: ModerationResult,
    llmResult: LLMModerationResult
  ): HybridModerationResult {
    // 重大度の統合（より厳しい方を採用）
    const combinedSeverity = this.getMostSevereSeverity(
      clientResult.severity,
      llmResult.severity
    );

    // 最終判定（どちらかがブロックならブロック）
    const finalDecision = clientResult.allowed && llmResult.allowed;

    console.log('✅ ハイブリッドモデレーション結果:', {
      client: { allowed: clientResult.allowed, severity: clientResult.severity },
      llm: { allowed: llmResult.allowed, severity: llmResult.severity, confidence: llmResult.confidence },
      final: { decision: finalDecision, severity: combinedSeverity }
    });

    return {
      finalDecision,
      clientResult: {
        allowed: clientResult.allowed,
        severity: clientResult.severity,
        violations: clientResult.violations.map(v => v.phrase)
      },
      llmResult,
      usedLLM: true,
      combinedSeverity,
      recommendedAction: this.getRecommendedAction(combinedSeverity)
    };
  }

  /**
   * クライアント結果から適切なLLM感度を決定
   * @param clientResult クライアント結果
   * @returns LLM検出感度
   */
  private getSensitivityFromClientResult(
    clientResult: ModerationResult
  ): 'low' | 'medium' | 'high' {
    // クライアント側で違反検出された場合は高感度
    if (clientResult.violations.length > 0) {
      return 'high';
    }

    // 建設性スコアが低い場合は中感度
    const constructiveness = this.clientService.assessConstructiveness(clientResult.content || '');
    if (constructiveness < 40) {
      return 'medium';
    }

    // 問題なさそうな場合は低感度（誤検出を減らす）
    return 'low';
  }

  /**
   * 最も厳しい重大度を取得
   * @param severity1 重大度1
   * @param severity2 重大度2
   * @returns より厳しい重大度
   */
  private getMostSevereSeverity(
    severity1: 'none' | 'low' | 'medium' | 'high' | 'critical',
    severity2: 'none' | 'low' | 'medium' | 'high' | 'critical'
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const severityOrder = {
      'none': 0,
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };

    return severityOrder[severity1] > severityOrder[severity2] ? severity1 : severity2;
  }

  /**
   * 重大度から推奨アクションを決定
   * @param severity 重大度
   * @returns 推奨アクション
   */
  private getRecommendedAction(
    severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  ): 'allow' | 'warn' | 'block' {
    switch (severity) {
      case 'none':
        return 'allow';
      case 'low':
      case 'medium':
        return 'warn';
      case 'high':
      case 'critical':
        return 'block';
      default:
        return 'allow';
    }
  }

  /**
   * リアルタイムチェック（debounce付き）
   * クライアント側のみで即座にチェック、LLMは別途非同期実行
   *
   * @param content チェック対象テキスト
   * @param callback 結果コールバック
   * @param debounceMs デバウンス時間（デフォルト: 300ms）
   */
  public checkContentRealtime(
    content: string,
    callback: (result: ModerationResult) => void,
    debounceMs: number = 300
  ): void {
    // クライアント側チェック（即座）
    this.clientService.checkContentRealtime(content, callback, debounceMs);

    // LLMチェックは非同期で実行（結果は別途通知）
    if (this.llmEnabled && content.length > 20) {
      this.checkContentAsync(content);
    }
  }

  /**
   * 非同期LLMチェック（結果は内部で処理、UIには影響しない）
   * @param content チェック対象テキスト
   */
  private async checkContentAsync(content: string): Promise<void> {
    try {
      const llmRequest: LLMModerationRequest = {
        content,
        options: {
          checkSensitivity: 'medium',
          language: 'ja',
          includeExplanation: false  // リアルタイムチェックでは説明不要
        }
      };

      await this.llmService.moderateContent(llmRequest);
      // 結果は統計情報として蓄積されるのみ

    } catch (error) {
      // 非同期チェックの失敗は無視（クライアント側チェックがあるため）
      console.debug('非同期LLMチェック失敗（問題なし）:', error);
    }
  }

  /**
   * LLMチェック有効/無効を切り替え
   * @param enabled 有効化するか
   */
  public setLLMEnabled(enabled: boolean): void {
    this.llmEnabled = enabled;
    console.log(`🔧 LLMチェック: ${enabled ? '有効化' : '無効化'}`);
  }

  /**
   * LLM統計情報を取得
   */
  public getLLMStats() {
    return this.llmService.getStats();
  }

  /**
   * LLMヘルスチェック
   */
  public async checkLLMHealth() {
    return await this.llmService.healthCheck();
  }

  /**
   * 代替表現を提案（クライアントサービスを利用）
   */
  public suggestAlternatives(phrase: string) {
    return this.clientService.suggestAlternatives(phrase);
  }

  /**
   * 代替表現で置換（クライアントサービスを利用）
   */
  public replaceWithAlternative(
    content: string,
    violatedPhrase: string,
    alternative: string
  ): string {
    return this.clientService.replaceWithAlternative(content, violatedPhrase, alternative);
  }

  /**
   * 建設性スコア評価（クライアントサービスを利用）
   */
  public assessConstructiveness(content: string): number {
    return this.clientService.assessConstructiveness(content);
  }
}
