// ROI分析エンジン - Phase 3 実装
export interface ProjectCosts {
  implementation: number;
  maintenance: number;
  training: number;
  opportunity: number;
  total: number;
  breakdown: CostBreakdown;
  monthly: number[];
}

export interface ProjectBenefits {
  efficiency: number;
  costReduction: number;
  qualityImprovement: number;
  riskMitigation: number;
  total: number;
  breakdown: BenefitBreakdown;
  monthly: number[];
}

export interface CostBreakdown {
  base: number;
  complexity: number;
  technology: number;
  consulting: number;
  training: number;
  maintenance: number;
}

export interface BenefitBreakdown {
  timeSavings: {
    hoursPerMonth: number;
    hourlyRate: number;
    monthlyBenefit: number;
  };
  qualityImprovements: {
    errorReduction: number;
    errorCostPerIncident: number;
    monthlyBenefit: number;
  };
  costReductions: {
    materials: number;
    operations: number;
    monthlyBenefit: number;
  };
}

export interface ProjectROI {
  totalInvestment: number;
  totalBenefits: number;
  netBenefit: number;
  roiPercentage: number;
  paybackPeriod: number;
  breakEvenPoint: Date;
  costBreakdown: CostBreakdown;
  benefitBreakdown: BenefitBreakdown;
  riskAdjustedROI: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface ProjectData {
  id: string;
  name: string;
  scope: 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION';
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  technologyCosts?: number;
  consultingCosts?: number;
  metrics?: {
    efficiency?: {
      timeSavingHours: number;
      averageHourlyRate: number;
      errorReductionPercent: number;
      errorCost: number;
      monthlyErrors: number;
    };
    cost?: {
      materialsSaving: number;
      operationsSaving: number;
    };
  };
  historicalData?: any[];
}

export class ROIAnalysisEngine {
  private baseCosts = {
    DEPARTMENT: 500000,    // 50万円
    FACILITY: 2000000,     // 200万円
    ORGANIZATION: 10000000 // 1000万円
  };
  
  private complexityMultipliers = {
    LOW: 0.8,
    MEDIUM: 1.0,
    HIGH: 1.5,
    VERY_HIGH: 2.2
  };
  
  private riskAdjustments = {
    LOW: 0.95,    // 5%リスク調整
    MEDIUM: 0.85, // 15%リスク調整
    HIGH: 0.70    // 30%リスク調整
  };

  async calculateProjectROI(project: ProjectData, timeframe: number = 12): Promise<ProjectROI> {
    const costs = await this.calculateTotalCosts(project, timeframe);
    const benefits = await this.calculateTotalBenefits(project, timeframe);
    
    const netBenefit = benefits.total - costs.total;
    const roiPercentage = (netBenefit / costs.total) * 100;
    
    const roi: ProjectROI = {
      totalInvestment: costs.total,
      totalBenefits: benefits.total,
      netBenefit,
      roiPercentage,
      paybackPeriod: this.calculatePaybackPeriod(costs.monthly, benefits.monthly),
      breakEvenPoint: this.calculateBreakEvenPoint(costs, benefits),
      costBreakdown: costs.breakdown,
      benefitBreakdown: benefits.breakdown,
      riskAdjustedROI: this.calculateRiskAdjustedROI(roiPercentage, project.riskLevel),
      confidenceInterval: this.calculateConfidenceInterval(project.historicalData)
    };
    
    return roi;
  }
  
  private async calculateTotalCosts(project: ProjectData, timeframe: number): Promise<ProjectCosts> {
    const implementationCosts = this.calculateImplementationCosts(project);
    const maintenanceCosts = this.calculateMaintenanceCosts(project, timeframe);
    const trainingCosts = this.calculateTrainingCosts(project);
    const opportunityCosts = this.calculateOpportunityCosts(project, timeframe);
    
    const breakdown: CostBreakdown = {
      base: implementationCosts.base,
      complexity: implementationCosts.complexity,
      technology: implementationCosts.technology,
      consulting: implementationCosts.consulting,
      training: trainingCosts,
      maintenance: maintenanceCosts
    };
    
    const total = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0) + opportunityCosts;
    
    // 月次コスト配列の生成
    const monthly = this.distributeCostsMonthly(breakdown, timeframe);
    
    return {
      implementation: implementationCosts.total,
      maintenance: maintenanceCosts,
      training: trainingCosts,
      opportunity: opportunityCosts,
      total,
      breakdown,
      monthly
    };
  }
  
  private calculateImplementationCosts(project: ProjectData) {
    const baseCost = this.baseCosts[project.scope];
    const complexityMultiplier = this.complexityMultipliers[project.complexity];
    const complexityCost = baseCost * (complexityMultiplier - 1);
    
    return {
      base: baseCost,
      complexity: complexityCost,
      technology: project.technologyCosts || 0,
      consulting: project.consultingCosts || 0,
      total: baseCost * complexityMultiplier + (project.technologyCosts || 0) + (project.consultingCosts || 0)
    };
  }
  
  private calculateMaintenanceCosts(project: ProjectData, timeframe: number): number {
    const baseMaintenance = this.baseCosts[project.scope] * 0.15; // 年間15%
    return (baseMaintenance / 12) * timeframe;
  }
  
  private calculateTrainingCosts(project: ProjectData): number {
    const trainingCostPerPerson = 50000; // 5万円/人
    const estimatedTrainees = {
      DEPARTMENT: 20,
      FACILITY: 100,
      ORGANIZATION: 500
    };
    
    return trainingCostPerPerson * estimatedTrainees[project.scope];
  }
  
  private calculateOpportunityCosts(project: ProjectData, timeframe: number): number {
    // 実装期間中の機会損失を計算
    const monthlyOpportunityCost = this.baseCosts[project.scope] * 0.05;
    const implementationMonths = this.getImplementationDuration(project);
    return monthlyOpportunityCost * Math.min(implementationMonths, timeframe);
  }
  
  private async calculateTotalBenefits(project: ProjectData, timeframe: number): Promise<ProjectBenefits> {
    const efficiencyBenefits = this.calculateEfficiencyBenefits(project, timeframe);
    const costReductions = this.calculateCostReductions(project, timeframe);
    const qualityBenefits = this.calculateQualityBenefits(project, timeframe);
    const riskBenefits = this.calculateRiskBenefits(project, timeframe);
    
    const breakdown: BenefitBreakdown = {
      timeSavings: efficiencyBenefits.timeSavings,
      qualityImprovements: qualityBenefits.qualityImprovements,
      costReductions: costReductions.breakdown
    };
    
    const total = efficiencyBenefits.total + 
                  costReductions.total + 
                  qualityBenefits.total + 
                  riskBenefits.total;
    
    const monthly = this.distributeBenefitsMonthly(breakdown, timeframe);
    
    return {
      efficiency: efficiencyBenefits.total,
      costReduction: costReductions.total,
      qualityImprovement: qualityBenefits.total,
      riskMitigation: riskBenefits.total,
      total,
      breakdown,
      monthly
    };
  }
  
  private calculateEfficiencyBenefits(project: ProjectData, timeframe: number) {
    const efficiency = project.metrics?.efficiency;
    
    const timeSavings = {
      hoursPerMonth: efficiency?.timeSavingHours || 0,
      hourlyRate: efficiency?.averageHourlyRate || 3000,
      monthlyBenefit: (efficiency?.timeSavingHours || 0) * (efficiency?.averageHourlyRate || 3000)
    };
    
    return {
      timeSavings,
      total: timeSavings.monthlyBenefit * timeframe
    };
  }
  
  private calculateQualityBenefits(project: ProjectData, timeframe: number) {
    const efficiency = project.metrics?.efficiency;
    
    const qualityImprovements = {
      errorReduction: efficiency?.errorReductionPercent || 0,
      errorCostPerIncident: efficiency?.errorCost || 50000,
      monthlyBenefit: ((efficiency?.errorReductionPercent || 0) / 100) * 
                     (efficiency?.monthlyErrors || 10) * 
                     (efficiency?.errorCost || 50000)
    };
    
    return {
      qualityImprovements,
      total: qualityImprovements.monthlyBenefit * timeframe
    };
  }
  
  private calculateCostReductions(project: ProjectData, timeframe: number) {
    const cost = project.metrics?.cost;
    
    const breakdown = {
      materials: cost?.materialsSaving || 0,
      operations: cost?.operationsSaving || 0,
      monthlyBenefit: (cost?.materialsSaving || 0) + (cost?.operationsSaving || 0)
    };
    
    return {
      breakdown,
      total: breakdown.monthlyBenefit * timeframe
    };
  }
  
  private calculateRiskBenefits(project: ProjectData, timeframe: number) {
    // リスク軽減による期待価値を計算
    const riskReductionValue = this.baseCosts[project.scope] * 0.1; // 10%のリスク軽減
    return {
      total: (riskReductionValue / 12) * timeframe
    };
  }
  
  private calculatePaybackPeriod(monthlyCosts: number[], monthlyBenefits: number[]): number {
    let cumulativeCosts = 0;
    let cumulativeBenefits = 0;
    
    for (let month = 0; month < monthlyCosts.length; month++) {
      cumulativeCosts += monthlyCosts[month];
      cumulativeBenefits += monthlyBenefits[month];
      
      if (cumulativeBenefits >= cumulativeCosts) {
        return month + 1;
      }
    }
    
    return monthlyCosts.length + 1; // 期間内に回収できない場合
  }
  
  private calculateBreakEvenPoint(costs: ProjectCosts, benefits: ProjectBenefits): Date {
    const paybackMonths = this.calculatePaybackPeriod(costs.monthly, benefits.monthly);
    const breakEvenDate = new Date();
    breakEvenDate.setMonth(breakEvenDate.getMonth() + paybackMonths);
    return breakEvenDate;
  }
  
  private calculateRiskAdjustedROI(baseROI: number, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    return baseROI * this.riskAdjustments[riskLevel];
  }
  
  private calculateConfidenceInterval(historicalData?: any[]): { lower: number; upper: number } {
    // 簡易的な信頼区間計算
    const confidenceLevel = historicalData && historicalData.length > 10 ? 0.9 : 0.7;
    return {
      lower: confidenceLevel * 0.8,
      upper: confidenceLevel * 1.2
    };
  }
  
  private getImplementationDuration(project: ProjectData): number {
    const durations = {
      DEPARTMENT: { LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4 },
      FACILITY: { LOW: 2, MEDIUM: 3, HIGH: 6, VERY_HIGH: 9 },
      ORGANIZATION: { LOW: 3, MEDIUM: 6, HIGH: 12, VERY_HIGH: 18 }
    };
    
    return durations[project.scope][project.complexity];
  }
  
  private distributeCostsMonthly(breakdown: CostBreakdown, timeframe: number): number[] {
    const monthly: number[] = new Array(timeframe).fill(0);
    
    // 実装コストは最初の3ヶ月に配分
    const implementationTotal = breakdown.base + breakdown.complexity + 
                               breakdown.technology + breakdown.consulting;
    for (let i = 0; i < Math.min(3, timeframe); i++) {
      monthly[i] += implementationTotal / 3;
    }
    
    // トレーニングコストは2-4ヶ月目
    for (let i = 1; i < Math.min(4, timeframe); i++) {
      monthly[i] += breakdown.training / 3;
    }
    
    // メンテナンスコストは毎月
    const monthlyMaintenance = breakdown.maintenance / timeframe;
    for (let i = 0; i < timeframe; i++) {
      monthly[i] += monthlyMaintenance;
    }
    
    return monthly;
  }
  
  private distributeBenefitsMonthly(breakdown: BenefitBreakdown, timeframe: number): number[] {
    const monthly: number[] = new Array(timeframe).fill(0);
    
    // 効果は3ヶ月目から徐々に発現
    const monthlyBenefit = (breakdown.timeSavings.monthlyBenefit + 
                           breakdown.qualityImprovements.monthlyBenefit + 
                           breakdown.costReductions.monthlyBenefit);
    
    for (let i = 2; i < timeframe; i++) {
      const rampUp = Math.min(1, (i - 2) / 3); // 3ヶ月でフル効果
      monthly[i] = monthlyBenefit * rampUp;
    }
    
    return monthly;
  }
}

export default ROIAnalysisEngine;