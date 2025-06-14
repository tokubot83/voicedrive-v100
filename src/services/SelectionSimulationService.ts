// SelectionSimulationService - 選定効果予測・シミュレーションサービス
// Phase 5: 様々な選定シナリオの効果予測・リスク分析・最適解探索

import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { HierarchicalUser } from '../types';
import { 
  MemberSelection, 
  MemberCandidate, 
  SelectionCriteria, 
  SelectionResult 
} from '../types/memberSelection';

// シミュレーション関連の型定義
export interface SelectionSimulation {
  simulation_id: string;
  simulation_name: string;
  simulation_type: SimulationType;
  scenario_definition: ScenarioDefinition;
  prediction_model: PredictionModel;
  simulation_results: SimulationResult[];
  confidence_metrics: ConfidenceMetrics;
  sensitivity_analysis: SensitivityAnalysis;
  optimization_recommendations: OptimizationRecommendation[];
  created_by: string;
  created_at: Date;
  last_updated: Date;
  simulation_status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'ERROR';
}

export type SimulationType = 
  | 'SCENARIO_COMPARISON'      // シナリオ比較
  | 'MONTE_CARLO'             // モンテカルロシミュレーション  
  | 'SENSITIVITY_ANALYSIS'     // 感度分析
  | 'OPTIMIZATION_SEARCH'      // 最適化探索
  | 'RISK_ASSESSMENT'         // リスク評価
  | 'WHAT_IF_ANALYSIS'        // What-if分析
  | 'STRESS_TESTING'          // ストレステスト
  | 'PORTFOLIO_OPTIMIZATION'; // ポートフォリオ最適化

export interface ScenarioDefinition {
  base_scenario: BaseScenario;
  alternative_scenarios: AlternativeScenario[];
  variable_parameters: VariableParameter[];
  constraint_definitions: ConstraintDefinition[];
  success_criteria: SuccessCriteria[];
}

export interface BaseScenario {
  scenario_name: string;
  description: string;
  project_characteristics: ProjectCharacteristics;
  team_requirements: TeamRequirements;
  resource_constraints: ResourceConstraints;
  timeline_constraints: TimelineConstraints;
  external_factors: ExternalFactor[];
}

export interface ProjectCharacteristics {
  project_type: string;
  complexity_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  required_skills: SkillRequirement[];
  budget_range: BudgetRange;
  risk_tolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  innovation_level: 'INCREMENTAL' | 'RADICAL' | 'BREAKTHROUGH';
  market_impact: 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'GLOBAL';
}

export interface SkillRequirement {
  skill_category: string;
  required_level: number; // 1-10
  criticality: 'ESSENTIAL' | 'IMPORTANT' | 'PREFERRED' | 'OPTIONAL';
  rarity_factor: number; // 希少性 0-1
}

export interface BudgetRange {
  min_budget: number;
  max_budget: number;
  preferred_budget: number;
  cost_flexibility: number; // 0-1
}

export interface TeamRequirements {
  team_size_range: TeamSizeRange;
  composition_requirements: CompositionRequirement[];
  collaboration_style: 'HIERARCHICAL' | 'COLLABORATIVE' | 'AGILE' | 'HYBRID';
  communication_frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  decision_making_style: 'CENTRALIZED' | 'DISTRIBUTED' | 'CONSENSUS';
}

export interface TeamSizeRange {
  min_size: number;
  max_size: number;
  optimal_size: number;
  size_flexibility: number; // 0-1
}

export interface CompositionRequirement {
  role_type: string;
  required_count: number;
  min_experience: number; // 年
  diversity_weight: number; // 0-1
  location_constraint?: string;
}

export interface ResourceConstraints {
  financial_constraints: FinancialConstraints;
  time_constraints: TimeConstraints;
  infrastructure_constraints: InfrastructureConstraints;
  regulatory_constraints: RegulatoryConstraints;
}

export interface FinancialConstraints {
  total_budget: number;
  monthly_budget_limit: number;
  cost_per_member_limit: number;
  overhead_allowance: number;
  contingency_fund: number;
}

export interface TimeConstraints {
  project_duration: number; // 月数
  selection_deadline: Date;
  key_milestones: Milestone[];
  critical_path_constraints: string[];
}

export interface Milestone {
  milestone_name: string;
  target_date: Date;
  completion_criteria: string[];
  penalty_for_delay: number;
}

export interface InfrastructureConstraints {
  required_tools: string[];
  workspace_requirements: string[];
  technology_stack: string[];
  security_clearance_needed: boolean;
}

export interface RegulatoryConstraints {
  compliance_requirements: string[];
  certification_needed: string[];
  audit_requirements: string[];
  geographical_restrictions: string[];
}

export interface TimelineConstraints {
  start_date: Date;
  end_date: Date;
  phase_definitions: PhaseDefinition[];
  dependency_constraints: DependencyConstraint[];
}

export interface PhaseDefinition {
  phase_name: string;
  start_date: Date;
  end_date: Date;
  required_roles: string[];
  deliverables: string[];
  success_metrics: string[];
}

export interface DependencyConstraint {
  dependent_phase: string;
  prerequisite_phase: string;
  dependency_type: 'FINISH_TO_START' | 'START_TO_START' | 'FINISH_TO_FINISH' | 'START_TO_FINISH';
  lag_time: number; // 日数
}

export interface ExternalFactor {
  factor_name: string;
  factor_type: 'MARKET' | 'TECHNOLOGY' | 'REGULATORY' | 'COMPETITIVE' | 'ECONOMIC';
  impact_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number; // 0-1
  impact_description: string;
  mitigation_strategies: string[];
}

export interface AlternativeScenario {
  scenario_id: string;
  scenario_name: string;
  description: string;
  parameter_variations: ParameterVariation[];
  expected_outcomes: ExpectedOutcome[];
  risk_factors: RiskFactor[];
}

export interface ParameterVariation {
  parameter_name: string;
  base_value: any;
  alternative_value: any;
  variation_type: 'ABSOLUTE' | 'PERCENTAGE' | 'RANGE';
  confidence_level: number; // 0-1
}

export interface ExpectedOutcome {
  outcome_metric: string;
  predicted_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  impact_assessment: ImpactAssessment;
}

export interface ImpactAssessment {
  financial_impact: number;
  timeline_impact: number; // 日数
  quality_impact: number; // 0-1
  risk_impact: number; // 0-1
  stakeholder_satisfaction_impact: number; // 0-1
}

export interface RiskFactor {
  risk_id: string;
  risk_name: string;
  risk_category: 'TECHNICAL' | 'FINANCIAL' | 'ORGANIZATIONAL' | 'EXTERNAL' | 'OPERATIONAL';
  probability: number; // 0-1
  impact_severity: number; // 0-1
  risk_score: number; // probability * impact
  mitigation_strategies: MitigationStrategy[];
  contingency_plans: ContingencyPlan[];
}

export interface MitigationStrategy {
  strategy_name: string;
  description: string;
  implementation_cost: number;
  effectiveness: number; // 0-1
  implementation_time: number; // 日数
}

export interface ContingencyPlan {
  plan_name: string;
  trigger_conditions: string[];
  action_steps: string[];
  resource_requirements: string[];
  recovery_time: number; // 日数
}

export interface VariableParameter {
  parameter_id: string;
  parameter_name: string;
  parameter_type: 'CONTINUOUS' | 'DISCRETE' | 'CATEGORICAL' | 'BOOLEAN';
  value_range: ValueRange;
  default_value: any;
  sensitivity_weight: number; // 0-1
  constraints: ParameterConstraint[];
}

export interface ValueRange {
  min_value?: number;
  max_value?: number;
  discrete_values?: any[];
  distribution_type?: 'UNIFORM' | 'NORMAL' | 'EXPONENTIAL' | 'BETA';
  distribution_parameters?: Record<string, number>;
}

export interface ParameterConstraint {
  constraint_type: 'RANGE' | 'DEPENDENCY' | 'EXCLUSION' | 'REQUIREMENT';
  constraint_definition: any;
  violation_penalty: number;
}

export interface ConstraintDefinition {
  constraint_id: string;
  constraint_name: string;
  constraint_type: 'HARD' | 'SOFT' | 'PREFERENCE';
  constraint_expression: string;
  violation_penalty: number;
  constraint_priority: number; // 1-10
}

export interface SuccessCriteria {
  criteria_id: string;
  criteria_name: string;
  measurement_metric: string;
  target_value: number;
  measurement_unit: string;
  weight: number; // 0-1
  evaluation_method: 'OBJECTIVE' | 'SUBJECTIVE' | 'HYBRID';
}

export interface PredictionModel {
  model_id: string;
  model_type: 'STATISTICAL' | 'MACHINE_LEARNING' | 'SIMULATION' | 'HYBRID';
  model_configuration: ModelConfiguration;
  training_data: TrainingDataset[];
  model_accuracy: ModelAccuracyMetrics;
  model_assumptions: ModelAssumption[];
  uncertainty_quantification: UncertaintyQuantification;
}

export interface ModelConfiguration {
  algorithm_type: string;
  hyperparameters: Record<string, any>;
  feature_selection: FeatureSelection;
  cross_validation: CrossValidationConfig;
  ensemble_methods?: EnsembleMethod[];
}

export interface FeatureSelection {
  selection_method: 'CORRELATION' | 'MUTUAL_INFO' | 'RECURSIVE' | 'LASSO' | 'MANUAL';
  selected_features: string[];
  feature_importance: Record<string, number>;
}

export interface CrossValidationConfig {
  cv_method: 'K_FOLD' | 'STRATIFIED' | 'TIME_SERIES' | 'LEAVE_ONE_OUT';
  cv_folds: number;
  test_size: number; // 0-1
  random_state: number;
}

export interface EnsembleMethod {
  method_type: 'VOTING' | 'BAGGING' | 'BOOSTING' | 'STACKING';
  base_models: string[];
  combination_strategy: string;
  weight_optimization: boolean;
}

export interface TrainingDataset {
  dataset_id: string;
  dataset_name: string;
  data_source: string;
  record_count: number;
  feature_count: number;
  data_quality_score: number; // 0-1
  temporal_coverage: TemporalCoverage;
}

export interface TemporalCoverage {
  start_date: Date;
  end_date: Date;
  data_frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  seasonal_patterns: SeasonalPattern[];
}

export interface SeasonalPattern {
  pattern_type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  pattern_strength: number; // 0-1
  peak_periods: string[];
  trough_periods: string[];
}

export interface ModelAccuracyMetrics {
  r_squared: number;
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
  cross_validation_score: number;
  out_of_sample_accuracy: number;
  prediction_interval_coverage: number; // 0-1
}

export interface ModelAssumption {
  assumption_id: string;
  assumption_description: string;
  validity_check: ValidityCheck;
  impact_if_violated: ImpactIfViolated;
}

export interface ValidityCheck {
  check_method: string;
  check_result: 'VALID' | 'QUESTIONABLE' | 'INVALID';
  confidence_level: number; // 0-1
  last_checked: Date;
}

export interface ImpactIfViolated {
  accuracy_degradation: number; // 0-1
  bias_introduction: number; // 0-1
  uncertainty_increase: number; // 0-1
  mitigation_strategies: string[];
}

export interface UncertaintyQuantification {
  uncertainty_sources: UncertaintySource[];
  confidence_intervals: ConfidenceInterval[];
  prediction_intervals: PredictionInterval[];
  sensitivity_to_assumptions: SensitivityToAssumptions[];
}

export interface UncertaintySource {
  source_name: string;
  source_type: 'ALEATORY' | 'EPISTEMIC' | 'MODEL' | 'DATA';
  contribution_to_uncertainty: number; // 0-1
  quantification_method: string;
}

export interface ConfidenceInterval {
  metric_name: string;
  confidence_level: number; // 0-1
  lower_bound: number;
  upper_bound: number;
  interval_width: number;
}

export interface PredictionInterval {
  prediction_metric: string;
  prediction_horizon: number; // 日数
  interval_bounds: IntervalBounds[];
  coverage_probability: number; // 0-1
}

export interface IntervalBounds {
  time_point: Date;
  lower_bound: number;
  upper_bound: number;
  point_estimate: number;
}

export interface SensitivityToAssumptions {
  assumption_id: string;
  sensitivity_coefficient: number;
  impact_range: {
    min_impact: number;
    max_impact: number;
  };
}

export interface SimulationResult {
  result_id: string;
  scenario_id: string;
  iteration_number?: number;
  simulation_outputs: SimulationOutput[];
  performance_metrics: PerformanceMetric[];
  risk_assessment: RiskAssessmentResult;
  optimization_scores: OptimizationScore[];
  detailed_analysis: DetailedAnalysis;
}

export interface SimulationOutput {
  output_name: string;
  output_value: number;
  output_unit: string;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  percentile_values: Record<string, number>; // 10th, 25th, 50th, 75th, 90th
}

export interface PerformanceMetric {
  metric_name: string;
  metric_category: 'EFFICIENCY' | 'EFFECTIVENESS' | 'QUALITY' | 'COST' | 'TIME' | 'RISK';
  baseline_value: number;
  predicted_value: number;
  improvement_percentage: number;
  confidence_level: number; // 0-1
}

export interface RiskAssessmentResult {
  overall_risk_score: number; // 0-1
  risk_breakdown: RiskBreakdown[];
  critical_risk_factors: CriticalRiskFactor[];
  risk_mitigation_effectiveness: RiskMitigationEffectiveness[];
  risk_tolerance_alignment: number; // 0-1
}

export interface RiskBreakdown {
  risk_category: string;
  risk_contribution: number; // 0-1
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  key_risk_drivers: string[];
}

export interface CriticalRiskFactor {
  factor_name: string;
  probability: number; // 0-1
  impact: number; // 0-1
  risk_score: number;
  time_to_impact: number; // 日数
  early_warning_indicators: string[];
}

export interface RiskMitigationEffectiveness {
  mitigation_strategy: string;
  effectiveness_score: number; // 0-1
  implementation_cost: number;
  roi_of_mitigation: number;
  implementation_complexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface OptimizationScore {
  optimization_dimension: string;
  score: number; // 0-100
  weight: number; // 0-1
  weighted_score: number;
  benchmark_comparison: BenchmarkComparison;
}

export interface BenchmarkComparison {
  benchmark_type: 'HISTORICAL' | 'INDUSTRY' | 'BEST_PRACTICE' | 'THEORETICAL';
  benchmark_value: number;
  performance_percentile: number; // 0-1
  gap_analysis: GapAnalysis;
}

export interface GapAnalysis {
  gap_size: number;
  gap_significance: 'MINOR' | 'MODERATE' | 'SIGNIFICANT' | 'CRITICAL';
  improvement_potential: number; // 0-1
  effort_required: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

export interface DetailedAnalysis {
  sensitivity_analysis: SensitivityAnalysisResult[];
  scenario_comparison: ScenarioComparisonResult[];
  optimization_insights: OptimizationInsight[];
  trade_off_analysis: TradeOffAnalysis[];
  recommendation_ranking: RecommendationRanking[];
}

export interface SensitivityAnalysisResult {
  parameter_name: string;
  sensitivity_coefficient: number;
  impact_on_outcomes: ImpactOnOutcomes[];
  critical_thresholds: CriticalThreshold[];
}

export interface ImpactOnOutcomes {
  outcome_metric: string;
  impact_magnitude: number;
  impact_direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  non_linear_effects: boolean;
}

export interface CriticalThreshold {
  threshold_value: number;
  threshold_type: 'MINIMUM' | 'MAXIMUM' | 'OPTIMAL' | 'BREAKEVEN';
  consequences_if_exceeded: string[];
}

export interface ScenarioComparisonResult {
  base_scenario_performance: number;
  alternative_scenario_performance: number;
  performance_difference: number;
  statistical_significance: number; // 0-1
  practical_significance: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: 'PREFER_BASE' | 'PREFER_ALTERNATIVE' | 'EQUIVALENT' | 'DEPENDS_ON_CONTEXT';
}

export interface OptimizationInsight {
  insight_type: 'OPPORTUNITY' | 'BOTTLENECK' | 'TRADE_OFF' | 'SYNERGY' | 'RISK';
  description: string;
  quantified_impact: number;
  actionability: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM' | 'STRATEGIC';
  implementation_effort: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

export interface TradeOffAnalysis {
  dimension_1: string;
  dimension_2: string;
  trade_off_coefficient: number;
  pareto_frontier_position: number; // 0-1
  optimization_recommendations: string[];
}

export interface RecommendationRanking {
  recommendation_id: string;
  recommendation_title: string;
  overall_score: number; // 0-100
  scoring_breakdown: ScoringBreakdown[];
  implementation_priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  resource_requirements: ResourceRequirement[];
}

export interface ScoringBreakdown {
  criterion: string;
  weight: number; // 0-1
  score: number; // 0-100
  weighted_score: number;
  justification: string;
}

export interface ResourceRequirement {
  resource_type: 'FINANCIAL' | 'HUMAN' | 'TECHNICAL' | 'TIME';
  required_amount: number;
  unit: string;
  availability: 'AVAILABLE' | 'NEEDS_APPROVAL' | 'NEEDS_PROCUREMENT';
}

export interface ConfidenceMetrics {
  overall_confidence: number; // 0-1
  model_confidence: number; // 0-1
  data_confidence: number; // 0-1
  assumption_confidence: number; // 0-1
  scenario_confidence: number; // 0-1
  prediction_stability: PredictionStability;
}

export interface PredictionStability {
  stability_score: number; // 0-1
  variance_across_runs: number;
  convergence_assessment: ConvergenceAssessment;
  robustness_metrics: RobustnessMetric[];
}

export interface ConvergenceAssessment {
  has_converged: boolean;
  convergence_rate: number;
  required_iterations: number;
  convergence_criteria: string[];
}

export interface RobustnessMetric {
  metric_name: string;
  robustness_score: number; // 0-1
  sensitivity_to_outliers: number; // 0-1
  stability_across_scenarios: number; // 0-1
}

export interface SensitivityAnalysis {
  analysis_id: string;
  analyzed_parameters: AnalyzedParameter[];
  sensitivity_matrix: SensitivityMatrix;
  tornado_analysis: TornadoAnalysis;
  spider_analysis: SpiderAnalysis;
}

export interface AnalyzedParameter {
  parameter_name: string;
  base_value: number;
  variation_range: {
    min_variation: number;
    max_variation: number;
  };
  sensitivity_score: number; // 0-1
  influence_ranking: number;
}

export interface SensitivityMatrix {
  parameters: string[];
  outcomes: string[];
  sensitivity_coefficients: number[][]; // parameters x outcomes matrix
  correlation_matrix: number[][];
}

export interface TornadoAnalysis {
  outcome_metric: string;
  parameter_impacts: ParameterImpact[];
  cumulative_impact: number;
  uncertainty_range: {
    lower_bound: number;
    upper_bound: number;
  };
}

export interface ParameterImpact {
  parameter_name: string;
  positive_impact: number;
  negative_impact: number;
  impact_range: number;
  contribution_to_uncertainty: number; // 0-1
}

export interface SpiderAnalysis {
  base_case_outcomes: Record<string, number>;
  scenario_variations: ScenarioVariation[];
  parameter_sensitivity_curves: SensitivityCurve[];
}

export interface ScenarioVariation {
  variation_name: string;
  parameter_changes: ParameterChange[];
  outcome_changes: OutcomeChange[];
}

export interface ParameterChange {
  parameter_name: string;
  percentage_change: number;
}

export interface OutcomeChange {
  outcome_name: string;
  percentage_change: number;
  absolute_change: number;
}

export interface SensitivityCurve {
  parameter_name: string;
  curve_points: CurvePoint[];
  curve_shape: 'LINEAR' | 'EXPONENTIAL' | 'LOGARITHMIC' | 'S_CURVE' | 'IRREGULAR';
  critical_points: CriticalPoint[];
}

export interface CurvePoint {
  parameter_value: number;
  outcome_value: number;
}

export interface CriticalPoint {
  point_type: 'INFLECTION' | 'MAXIMUM' | 'MINIMUM' | 'THRESHOLD';
  parameter_value: number;
  outcome_value: number;
  significance: string;
}

export interface OptimizationRecommendation {
  recommendation_id: string;
  recommendation_type: 'PARAMETER_OPTIMIZATION' | 'SCENARIO_SELECTION' | 'RISK_MITIGATION' | 'PROCESS_IMPROVEMENT';
  title: string;
  description: string;
  expected_benefit: ExpectedBenefit;
  implementation_plan: ImplementationPlan;
  risk_assessment: OptimizationRiskAssessment;
  success_probability: number; // 0-1
  priority_score: number; // 0-100
}

export interface ExpectedBenefit {
  primary_benefits: PrimaryBenefit[];
  secondary_benefits: SecondaryBenefit[];
  quantified_roi: QuantifiedROI;
  payback_period: number; // 月数
}

export interface PrimaryBenefit {
  benefit_category: string;
  benefit_description: string;
  quantified_value: number;
  measurement_unit: string;
  confidence_level: number; // 0-1
}

export interface SecondaryBenefit {
  benefit_description: string;
  estimated_value: number;
  value_realization_timeline: string;
}

export interface QuantifiedROI {
  initial_investment: number;
  annual_benefits: number;
  roi_percentage: number;
  net_present_value: number;
  internal_rate_of_return: number;
}

export interface ImplementationPlan {
  implementation_phases: ImplementationPhase[];
  resource_allocation: ResourceAllocation;
  timeline: ImplementationTimeline;
  success_metrics: SuccessMetric[];
  risk_mitigation: ImplementationRiskMitigation[];
}

export interface ImplementationPhase {
  phase_name: string;
  phase_duration: number; // 日数
  key_activities: string[];
  deliverables: string[];
  required_resources: string[];
  success_criteria: string[];
}

export interface ResourceAllocation {
  human_resources: HumanResource[];
  financial_resources: FinancialResource[];
  technical_resources: TechnicalResource[];
  external_resources: ExternalResource[];
}

export interface HumanResource {
  role_type: string;
  fte_required: number;
  skill_requirements: string[];
  experience_level: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';
  duration: number; // 日数
}

export interface FinancialResource {
  cost_category: string;
  estimated_cost: number;
  cost_timing: string;
  cost_certainty: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TechnicalResource {
  resource_type: string;
  specification: string;
  quantity_needed: number;
  procurement_timeline: number; // 日数
}

export interface ExternalResource {
  resource_description: string;
  vendor_requirements: string[];
  estimated_cost: number;
  availability_risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ImplementationTimeline {
  total_duration: number; // 日数
  critical_path: string[];
  key_milestones: ImplementationMilestone[];
  dependencies: ImplementationDependency[];
}

export interface ImplementationMilestone {
  milestone_name: string;
  target_date: Date;
  completion_criteria: string[];
  stakeholders: string[];
}

export interface ImplementationDependency {
  dependent_activity: string;
  prerequisite_activity: string;
  dependency_type: string;
  lead_lag_time: number; // 日数
}

export interface SuccessMetric {
  metric_name: string;
  target_value: number;
  measurement_method: string;
  measurement_frequency: string;
  responsible_party: string;
}

export interface ImplementationRiskMitigation {
  risk_description: string;
  mitigation_strategy: string;
  contingency_plan: string;
  monitoring_approach: string;
}

export interface OptimizationRiskAssessment {
  implementation_risks: ImplementationRisk[];
  performance_risks: PerformanceRisk[];
  financial_risks: FinancialRisk[];
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ImplementationRisk {
  risk_description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  risk_score: number;
  mitigation_strategies: string[];
}

export interface PerformanceRisk {
  performance_metric: string;
  downside_scenario: DownsideScenario;
  mitigation_approaches: string[];
  monitoring_indicators: string[];
}

export interface DownsideScenario {
  scenario_description: string;
  probability: number; // 0-1
  impact_magnitude: number;
  recovery_strategies: string[];
}

export interface FinancialRisk {
  cost_overrun_probability: number; // 0-1
  potential_cost_increase: number;
  benefit_shortfall_risk: number; // 0-1
  financial_mitigation: string[];
}

/**
 * SelectionSimulationService
 * Phase 5: 選定効果予測・シミュレーションサービス
 */
export class SelectionSimulationService {
  private simulations: Map<string, SelectionSimulation> = new Map();
  private prediction_models: Map<string, PredictionModel> = new Map();

  /**
   * 新しいシミュレーションの作成
   */
  async createSimulation(
    simulation_name: string,
    simulation_type: SimulationType,
    scenario_definition: ScenarioDefinition,
    created_by: string
  ): Promise<SelectionSimulation> {
    const simulation_id = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 予測モデルの構築
      const prediction_model = await this.buildPredictionModel(scenario_definition, simulation_type);
      
      const simulation: SelectionSimulation = {
        simulation_id,
        simulation_name,
        simulation_type,
        scenario_definition,
        prediction_model,
        simulation_results: [],
        confidence_metrics: this.calculateInitialConfidenceMetrics(),
        sensitivity_analysis: await this.performSensitivityAnalysis(scenario_definition),
        optimization_recommendations: [],
        created_by,
        created_at: new Date(),
        last_updated: new Date(),
        simulation_status: 'DRAFT'
      };

      this.simulations.set(simulation_id, simulation);
      return simulation;

    } catch (error) {
      throw new Error(`シミュレーション作成エラー: ${error}`);
    }
  }

  /**
   * シミュレーションの実行
   */
  async runSimulation(simulation_id: string, iterations: number = 1000): Promise<SimulationResult[]> {
    const simulation = this.simulations.get(simulation_id);
    if (!simulation) {
      throw new Error('シミュレーションが見つかりません');
    }

    // シミュレーションステータスを「実行中」に更新
    simulation.simulation_status = 'RUNNING';
    simulation.last_updated = new Date();

    try {
      const results: SimulationResult[] = [];

      // ベースシナリオの実行
      const base_result = await this.executeScenario(
        simulation.scenario_definition.base_scenario,
        simulation.prediction_model,
        'base_scenario'
      );
      results.push(base_result);

      // 代替シナリオの実行
      for (const alt_scenario of simulation.scenario_definition.alternative_scenarios) {
        const alt_result = await this.executeAlternativeScenario(
          alt_scenario,
          simulation.scenario_definition.base_scenario,
          simulation.prediction_model
        );
        results.push(alt_result);
      }

      // モンテカルロシミュレーションの実行（該当する場合）
      if (simulation.simulation_type === 'MONTE_CARLO') {
        const monte_carlo_results = await this.runMonteCarloSimulation(
          simulation.scenario_definition,
          simulation.prediction_model,
          iterations
        );
        results.push(...monte_carlo_results);
      }

      // 最適化推奨事項の生成
      const optimization_recommendations = await this.generateOptimizationRecommendations(results);

      // シミュレーション結果の更新
      simulation.simulation_results = results;
      simulation.optimization_recommendations = optimization_recommendations;
      simulation.confidence_metrics = await this.updateConfidenceMetrics(results);
      simulation.simulation_status = 'COMPLETED';
      simulation.last_updated = new Date();

      return results;

    } catch (error) {
      simulation.simulation_status = 'ERROR';
      throw new Error(`シミュレーション実行エラー: ${error}`);
    }
  }

  /**
   * What-if分析の実行
   */
  async performWhatIfAnalysis(
    simulation_id: string,
    parameter_changes: ParameterChange[]
  ): Promise<WhatIfAnalysisResult> {
    const simulation = this.simulations.get(simulation_id);
    if (!simulation) {
      throw new Error('シミュレーションが見つかりません');
    }

    // ベースケースの結果
    const base_case = simulation.simulation_results.find(r => r.scenario_id === 'base_scenario');
    if (!base_case) {
      throw new Error('ベースケースの結果が見つかりません');
    }

    // パラメータ変更を適用したシナリオの作成
    const modified_scenario = await this.applyParameterChanges(
      simulation.scenario_definition.base_scenario,
      parameter_changes
    );

    // 変更されたシナリオの実行
    const what_if_result = await this.executeScenario(
      modified_scenario,
      simulation.prediction_model,
      'what_if_scenario'
    );

    // 結果の比較分析
    const comparison_analysis = await this.compareScenarioResults(base_case, what_if_result);

    return {
      analysis_id: `whatif_${Date.now()}`,
      base_case_results: base_case,
      what_if_results: what_if_result,
      parameter_changes,
      impact_analysis: comparison_analysis,
      recommendations: await this.generateWhatIfRecommendations(comparison_analysis),
      created_at: new Date()
    };
  }

  /**
   * 最適化探索の実行
   */
  async performOptimizationSearch(
    simulation_id: string,
    optimization_objectives: OptimizationObjective[],
    search_constraints: SearchConstraint[]
  ): Promise<OptimizationSearchResult> {
    const simulation = this.simulations.get(simulation_id);
    if (!simulation) {
      throw new Error('シミュレーションが見つかりません');
    }

    // 遺伝的アルゴリズムによる最適化探索
    const ga_results = await this.runGeneticAlgorithmOptimization(
      simulation.scenario_definition,
      optimization_objectives,
      search_constraints
    );

    // 勾配ベース最適化
    const gradient_results = await this.runGradientBasedOptimization(
      simulation.scenario_definition,
      optimization_objectives,
      search_constraints
    );

    // パレート最適解の特定
    const pareto_solutions = await this.identifyParetoOptimalSolutions(
      [...ga_results.solutions, ...gradient_results.solutions],
      optimization_objectives
    );

    return {
      search_id: `optsearch_${Date.now()}`,
      optimization_objectives,
      search_constraints,
      genetic_algorithm_results: ga_results,
      gradient_optimization_results: gradient_results,
      pareto_optimal_solutions: pareto_solutions,
      recommended_solution: await this.selectRecommendedSolution(pareto_solutions),
      convergence_analysis: await this.analyzeConvergence([ga_results, gradient_results]),
      created_at: new Date()
    };
  }

  /**
   * リスク評価シミュレーション
   */
  async performRiskAssessmentSimulation(
    simulation_id: string,
    risk_scenarios: RiskScenario[]
  ): Promise<RiskAssessmentSimulationResult> {
    const simulation = this.simulations.get(simulation_id);
    if (!simulation) {
      throw new Error('シミュレーションが見つかりません');
    }

    const risk_simulation_results: RiskSimulationResult[] = [];

    for (const risk_scenario of risk_scenarios) {
      // リスクシナリオの実行
      const scenario_result = await this.executeRiskScenario(
        simulation.scenario_definition.base_scenario,
        risk_scenario,
        simulation.prediction_model
      );

      risk_simulation_results.push(scenario_result);
    }

    // リスク統合分析
    const integrated_risk_analysis = await this.performIntegratedRiskAnalysis(risk_simulation_results);

    // リスク緩和策の評価
    const mitigation_analysis = await this.evaluateRiskMitigationStrategies(
      risk_simulation_results,
      integrated_risk_analysis
    );

    return {
      assessment_id: `riskassess_${Date.now()}`,
      risk_scenarios,
      simulation_results: risk_simulation_results,
      integrated_risk_analysis,
      mitigation_strategy_analysis: mitigation_analysis,
      risk_recommendations: await this.generateRiskRecommendations(integrated_risk_analysis),
      created_at: new Date()
    };
  }

  // プライベートヘルパーメソッド群

  private async buildPredictionModel(
    scenario_definition: ScenarioDefinition,
    simulation_type: SimulationType
  ): Promise<PredictionModel> {
    // デモ実装 - 実際の実装では機械学習モデルを構築
    const model: PredictionModel = {
      model_id: `model_${Date.now()}`,
      model_type: 'MACHINE_LEARNING',
      model_configuration: {
        algorithm_type: 'ENSEMBLE_RANDOM_FOREST',
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 2
        },
        feature_selection: {
          selection_method: 'CORRELATION',
          selected_features: ['team_size', 'skill_match', 'experience_level', 'budget', 'timeline'],
          feature_importance: {
            'team_size': 0.15,
            'skill_match': 0.25,
            'experience_level': 0.20,
            'budget': 0.18,
            'timeline': 0.22
          }
        },
        cross_validation: {
          cv_method: 'K_FOLD',
          cv_folds: 5,
          test_size: 0.2,
          random_state: 42
        }
      },
      training_data: [
        {
          dataset_id: 'historical_selection_data',
          dataset_name: '過去の選定データ',
          data_source: 'internal_database',
          record_count: 5000,
          feature_count: 25,
          data_quality_score: 0.92,
          temporal_coverage: {
            start_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2年前
            end_date: new Date(),
            data_frequency: 'DAILY',
            seasonal_patterns: []
          }
        }
      ],
      model_accuracy: {
        r_squared: 0.87,
        mae: 0.12,
        mse: 0.02,
        mape: 8.5,
        cross_validation_score: 0.85,
        out_of_sample_accuracy: 0.83,
        prediction_interval_coverage: 0.95
      },
      model_assumptions: [
        {
          assumption_id: 'linear_relationships',
          assumption_description: '変数間の関係は主に線形である',
          validity_check: {
            check_method: 'residual_analysis',
            check_result: 'VALID',
            confidence_level: 0.9,
            last_checked: new Date()
          },
          impact_if_violated: {
            accuracy_degradation: 0.1,
            bias_introduction: 0.05,
            uncertainty_increase: 0.15,
            mitigation_strategies: ['非線形変換の適用', 'より複雑なモデルの使用']
          }
        }
      ],
      uncertainty_quantification: {
        uncertainty_sources: [
          {
            source_name: 'データ不確実性',
            source_type: 'DATA',
            contribution_to_uncertainty: 0.3,
            quantification_method: 'bootstrap_sampling'
          },
          {
            source_name: 'モデル不確実性',
            source_type: 'MODEL',
            contribution_to_uncertainty: 0.4,
            quantification_method: 'ensemble_variance'
          }
        ],
        confidence_intervals: [],
        prediction_intervals: [],
        sensitivity_to_assumptions: []
      }
    };

    this.prediction_models.set(model.model_id, model);
    return model;
  }

  private calculateInitialConfidenceMetrics(): ConfidenceMetrics {
    return {
      overall_confidence: 0.85,
      model_confidence: 0.87,
      data_confidence: 0.92,
      assumption_confidence: 0.80,
      scenario_confidence: 0.85,
      prediction_stability: {
        stability_score: 0.88,
        variance_across_runs: 0.05,
        convergence_assessment: {
          has_converged: true,
          convergence_rate: 0.95,
          required_iterations: 500,
          convergence_criteria: ['relative_error < 0.01', 'parameter_stability > 0.99']
        },
        robustness_metrics: [
          {
            metric_name: 'outlier_sensitivity',
            robustness_score: 0.92,
            sensitivity_to_outliers: 0.08,
            stability_across_scenarios: 0.89
          }
        ]
      }
    };
  }

  private async performSensitivityAnalysis(scenario_definition: ScenarioDefinition): Promise<SensitivityAnalysis> {
    // デモ実装
    return {
      analysis_id: `sensitivity_${Date.now()}`,
      analyzed_parameters: [
        {
          parameter_name: 'team_size',
          base_value: 8,
          variation_range: { min_variation: -3, max_variation: 5 },
          sensitivity_score: 0.75,
          influence_ranking: 1
        },
        {
          parameter_name: 'budget',
          base_value: 1000000,
          variation_range: { min_variation: -200000, max_variation: 500000 },
          sensitivity_score: 0.68,
          influence_ranking: 2
        }
      ],
      sensitivity_matrix: {
        parameters: ['team_size', 'budget', 'timeline'],
        outcomes: ['success_rate', 'cost_efficiency', 'time_to_completion'],
        sensitivity_coefficients: [[0.75, 0.6, 0.8], [0.68, 0.9, 0.4], [0.5, 0.3, 0.95]],
        correlation_matrix: [[1.0, 0.3, 0.2], [0.3, 1.0, 0.6], [0.2, 0.6, 1.0]]
      },
      tornado_analysis: {
        outcome_metric: 'project_success_rate',
        parameter_impacts: [
          {
            parameter_name: 'team_size',
            positive_impact: 0.15,
            negative_impact: -0.12,
            impact_range: 0.27,
            contribution_to_uncertainty: 0.35
          }
        ],
        cumulative_impact: 0.45,
        uncertainty_range: { lower_bound: 0.65, upper_bound: 0.95 }
      },
      spider_analysis: {
        base_case_outcomes: {
          'success_rate': 0.85,
          'cost_efficiency': 0.78,
          'time_to_completion': 180
        },
        scenario_variations: [],
        parameter_sensitivity_curves: []
      }
    };
  }

  private async executeScenario(
    scenario: BaseScenario,
    model: PredictionModel,
    scenario_id: string
  ): Promise<SimulationResult> {
    // デモ実装 - 実際の実装では予測モデルを使用
    const simulation_outputs: SimulationOutput[] = [
      {
        output_name: 'project_success_rate',
        output_value: 0.85 + (Math.random() - 0.5) * 0.2,
        output_unit: 'percentage',
        confidence_interval: { lower: 0.75, upper: 0.95 },
        percentile_values: { '10th': 0.72, '25th': 0.78, '50th': 0.85, '75th': 0.92, '90th': 0.98 }
      },
      {
        output_name: 'cost_efficiency',
        output_value: 0.78 + (Math.random() - 0.5) * 0.15,
        output_unit: 'score',
        confidence_interval: { lower: 0.68, upper: 0.88 },
        percentile_values: { '10th': 0.65, '25th': 0.72, '50th': 0.78, '75th': 0.84, '90th': 0.91 }
      }
    ];

    const performance_metrics: PerformanceMetric[] = [
      {
        metric_name: 'team_productivity',
        metric_category: 'EFFICIENCY',
        baseline_value: 100,
        predicted_value: 115 + Math.random() * 20,
        improvement_percentage: 15 + Math.random() * 20,
        confidence_level: 0.85
      }
    ];

    return {
      result_id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      scenario_id,
      simulation_outputs,
      performance_metrics,
      risk_assessment: {
        overall_risk_score: 0.25 + Math.random() * 0.3,
        risk_breakdown: [
          {
            risk_category: 'technical',
            risk_contribution: 0.4,
            risk_level: 'MEDIUM',
            key_risk_drivers: ['技術的複雑性', 'スキルギャップ']
          }
        ],
        critical_risk_factors: [],
        risk_mitigation_effectiveness: [],
        risk_tolerance_alignment: 0.8
      },
      optimization_scores: [
        {
          optimization_dimension: 'overall_performance',
          score: 78 + Math.random() * 20,
          weight: 1.0,
          weighted_score: 78 + Math.random() * 20,
          benchmark_comparison: {
            benchmark_type: 'HISTORICAL',
            benchmark_value: 75,
            performance_percentile: 0.75,
            gap_analysis: {
              gap_size: 5,
              gap_significance: 'MODERATE',
              improvement_potential: 0.2,
              effort_required: 'MEDIUM'
            }
          }
        }
      ],
      detailed_analysis: {
        sensitivity_analysis: [],
        scenario_comparison: [],
        optimization_insights: [],
        trade_off_analysis: [],
        recommendation_ranking: []
      }
    };
  }

  // その他のヘルパーメソッドは実装省略...
  private async executeAlternativeScenario(alt: AlternativeScenario, base: BaseScenario, model: PredictionModel): Promise<SimulationResult> { return {} as SimulationResult; }
  private async runMonteCarloSimulation(scenario: ScenarioDefinition, model: PredictionModel, iterations: number): Promise<SimulationResult[]> { return []; }
  private async generateOptimizationRecommendations(results: SimulationResult[]): Promise<OptimizationRecommendation[]> { return []; }
  private async updateConfidenceMetrics(results: SimulationResult[]): Promise<ConfidenceMetrics> { return {} as ConfidenceMetrics; }
  private async applyParameterChanges(scenario: BaseScenario, changes: ParameterChange[]): Promise<BaseScenario> { return scenario; }
  private async compareScenarioResults(base: SimulationResult, whatIf: SimulationResult): Promise<any> { return {}; }
  private async generateWhatIfRecommendations(analysis: any): Promise<any[]> { return []; }
  private async runGeneticAlgorithmOptimization(scenario: ScenarioDefinition, objectives: any[], constraints: any[]): Promise<any> { return {}; }
  private async runGradientBasedOptimization(scenario: ScenarioDefinition, objectives: any[], constraints: any[]): Promise<any> { return {}; }
  private async identifyParetoOptimalSolutions(solutions: any[], objectives: any[]): Promise<any[]> { return []; }
  private async selectRecommendedSolution(solutions: any[]): Promise<any> { return {}; }
  private async analyzeConvergence(results: any[]): Promise<any> { return {}; }
  private async executeRiskScenario(base: BaseScenario, risk: any, model: PredictionModel): Promise<any> { return {}; }
  private async performIntegratedRiskAnalysis(results: any[]): Promise<any> { return {}; }
  private async evaluateRiskMitigationStrategies(results: any[], analysis: any): Promise<any> { return {}; }
  private async generateRiskRecommendations(analysis: any): Promise<any[]> { return []; }
}

// 追加の型定義
interface WhatIfAnalysisResult {
  analysis_id: string;
  base_case_results: SimulationResult;
  what_if_results: SimulationResult;
  parameter_changes: ParameterChange[];
  impact_analysis: any;
  recommendations: any[];
  created_at: Date;
}

interface OptimizationObjective {
  objective_name: string;
  optimization_direction: 'MAXIMIZE' | 'MINIMIZE';
  weight: number;
  target_value?: number;
}

interface SearchConstraint {
  constraint_name: string;
  constraint_type: 'EQUALITY' | 'INEQUALITY' | 'RANGE';
  constraint_expression: string;
  penalty_weight: number;
}

interface OptimizationSearchResult {
  search_id: string;
  optimization_objectives: OptimizationObjective[];
  search_constraints: SearchConstraint[];
  genetic_algorithm_results: any;
  gradient_optimization_results: any;
  pareto_optimal_solutions: any[];
  recommended_solution: any;
  convergence_analysis: any;
  created_at: Date;
}

interface RiskScenario {
  scenario_name: string;
  risk_events: RiskEvent[];
  probability: number;
  impact_magnitude: number;
}

interface RiskEvent {
  event_name: string;
  event_type: string;
  probability: number;
  impact: number;
  duration: number;
}

interface RiskAssessmentSimulationResult {
  assessment_id: string;
  risk_scenarios: RiskScenario[];
  simulation_results: RiskSimulationResult[];
  integrated_risk_analysis: any;
  mitigation_strategy_analysis: any;
  risk_recommendations: any[];
  created_at: Date;
}

interface RiskSimulationResult {
  scenario_name: string;
  risk_impact: number;
  mitigation_effectiveness: number;
  residual_risk: number;
}

export default SelectionSimulationService;