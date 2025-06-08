export class SeasonalManager {
  private currentSeason: string;
  private capacityConfig: Record<string, any>;

  constructor() {
    this.currentSeason = this.detectCurrentSeason();
    this.capacityConfig = this.getSeasonalCapacity();
  }

  private detectCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private getSeasonalCapacity() {
    const seasonConfigs = {
      spring: {
        season: 'spring',
        label: '春',
        emoji: '🌸',
        maxCapacity: 10,
        warningThreshold: 8,
        peakPeriods: ['3月下旬', '4月上旬'],
        description: '新年度の始まり - 計画的な活動推奨',
        suggestedFocus: ['組織編成', '年度計画', '新人研修']
      },
      summer: {
        season: 'summer',
        label: '夏',
        emoji: '🌻',
        maxCapacity: 15,
        warningThreshold: 12,
        peakPeriods: ['7月', '8月'],
        description: '活動期 - 積極的な提案可能',
        suggestedFocus: ['改善活動', 'プロジェクト推進', 'スキルアップ']
      },
      autumn: {
        season: 'autumn',
        label: '秋',
        emoji: '🍁',
        maxCapacity: 12,
        warningThreshold: 10,
        peakPeriods: ['10月', '11月'],
        description: '収穫期 - 成果確認と調整',
        suggestedFocus: ['成果評価', '次年度準備', '知識共有']
      },
      winter: {
        season: 'winter',
        label: '冬',
        emoji: '❄️',
        maxCapacity: 8,
        warningThreshold: 6,
        peakPeriods: ['12月', '2月'],
        description: '振り返り期 - 質重視の活動',
        suggestedFocus: ['年度総括', '戦略見直し', '研修企画']
      }
    };

    return seasonConfigs[this.currentSeason];
  }

  getCurrentSeason() {
    return this.currentSeason;
  }

  getCapacityInfo() {
    return this.capacityConfig;
  }

  checkCapacityStatus(currentCount: number) {
    const { maxCapacity, warningThreshold } = this.capacityConfig;
    
    if (currentCount >= maxCapacity) {
      return {
        status: 'full',
        message: '今期の受付上限に達しました',
        canAccept: false,
        color: 'red'
      };
    }
    
    if (currentCount >= warningThreshold) {
      return {
        status: 'warning',
        message: `残り受付可能数: ${maxCapacity - currentCount}件`,
        canAccept: true,
        color: 'orange'
      };
    }
    
    return {
      status: 'available',
      message: `受付可能 (${currentCount}/${maxCapacity})`,
      canAccept: true,
      color: 'green'
    };
  }

  getSeasonalAdvice(activityType: string) {
    const { suggestedFocus } = this.capacityConfig;
    
    const adviceMap: Record<string, string[]> = {
      improvement: ['業務効率化', 'プロセス改善', 'ツール導入'],
      problem: ['課題整理', '原因分析', '対策立案'],
      idea: ['新サービス', 'イノベーション', '実験的取り組み'],
      discussion: ['方針協議', 'チーム連携', '意見交換'],
      announcement: ['情報共有', '進捗報告', '成果発表']
    };

    const seasonalAdvice = suggestedFocus;
    const typeAdvice = adviceMap[activityType] || [];
    
    return {
      seasonal: seasonalAdvice,
      typeSpecific: typeAdvice,
      combined: [...new Set([...seasonalAdvice, ...typeAdvice])]
    };
  }

  getNextSeasonInfo() {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(this.currentSeason);
    const nextIndex = (currentIndex + 1) % 4;
    const nextSeason = seasons[nextIndex];
    
    const monthsUntilNext = this.getMonthsUntilSeason(nextSeason);
    
    return {
      season: nextSeason,
      monthsAway: monthsUntilNext,
      capacityChange: this.getCapacityChange(this.currentSeason, nextSeason)
    };
  }

  private getMonthsUntilSeason(targetSeason: string): number {
    const currentMonth = new Date().getMonth() + 1;
    const seasonStartMonths: Record<string, number> = {
      spring: 3,
      summer: 6,
      autumn: 9,
      winter: 12
    };
    
    const targetMonth = seasonStartMonths[targetSeason];
    let monthsUntil = targetMonth - currentMonth;
    
    if (monthsUntil <= 0) {
      monthsUntil += 12;
    }
    
    return monthsUntil;
  }

  private getCapacityChange(fromSeason: string, toSeason: string): string {
    const capacities: Record<string, number> = {
      spring: 10,
      summer: 15,
      autumn: 12,
      winter: 8
    };
    
    const diff = capacities[toSeason] - capacities[fromSeason];
    
    if (diff > 0) {
      return `+${diff}件の余裕`;
    } else if (diff < 0) {
      return `${Math.abs(diff)}件の縮小`;
    }
    
    return '変更なし';
  }
}