// MLPipelineService - 多次元データ分析・機械学習パイプラインサービス
// Phase 5: 高度な選定データ分析・予測モデル・パターン発見のための機械学習基盤

import { PermissionLevel } from '../permissions/types/PermissionTypes';
import { HierarchicalUser } from '../types';

// 機械学習パイプライン関連の型定義
export interface MLPipeline {
  pipeline_id: string;
  pipeline_name: string;
  pipeline_type: PipelineType;
  data_sources: DataSource[];
  preprocessing_steps: PreprocessingStep[];
  feature_engineering: FeatureEngineering;
  model_configuration: ModelConfiguration;
  training_configuration: TrainingConfiguration;
  evaluation_metrics: EvaluationMetrics;
  deployment_config: DeploymentConfiguration;
  pipeline_status: PipelineStatus;
  created_by: string;
  created_at: Date;
  last_updated: Date;
  execution_history: ExecutionHistory[];
}

export type PipelineType = 
  | 'SUPERVISED_LEARNING'       // 教師あり学習
  | 'UNSUPERVISED_LEARNING'     // 教師なし学習
  | 'REINFORCEMENT_LEARNING'    // 強化学習
  | 'SEMI_SUPERVISED_LEARNING'  // 半教師あり学習
  | 'DEEP_LEARNING'             // 深層学習
  | 'ENSEMBLE_LEARNING'         // アンサンブル学習
  | 'TIME_SERIES_ANALYSIS'      // 時系列分析
  | 'ANOMALY_DETECTION'         // 異常検知
  | 'CLUSTERING_ANALYSIS'       // クラスタリング分析
  | 'ASSOCIATION_MINING'        // 関連ルール分析
  | 'DIMENSIONALITY_REDUCTION'  // 次元削減
  | 'PATTERN_RECOGNITION';      // パターン認識

export interface DataSource {
  source_id: string;
  source_name: string;
  source_type: 'DATABASE' | 'FILE' | 'API' | 'STREAM' | 'MANUAL';
  connection_config: ConnectionConfiguration;
  data_schema: DataSchema;
  data_quality: DataQuality;
  update_frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MANUAL';
  access_permissions: AccessPermission[];
}

export interface ConnectionConfiguration {
  connection_type: string;
  endpoint: string;
  authentication: AuthenticationConfig;
  timeout_settings: TimeoutSettings;
  retry_policy: RetryPolicy;
}

export interface AuthenticationConfig {
  auth_method: 'NONE' | 'BASIC' | 'TOKEN' | 'OAUTH2' | 'CERTIFICATE';
  credentials: Record<string, string>;
  token_refresh_config?: TokenRefreshConfig;
}

export interface TokenRefreshConfig {
  refresh_endpoint: string;
  refresh_interval: number; // 秒
  refresh_buffer: number; // 秒
}

export interface TimeoutSettings {
  connection_timeout: number; // 秒
  read_timeout: number; // 秒
  write_timeout: number; // 秒
}

export interface RetryPolicy {
  max_retries: number;
  retry_delay: number; // 秒
  backoff_multiplier: number;
  retry_on_conditions: string[];
}

export interface DataSchema {
  schema_version: string;
  fields: FieldDefinition[];
  relationships: RelationshipDefinition[];
  constraints: SchemaConstraint[];
  metadata: SchemaMetadata;
}

export interface FieldDefinition {
  field_name: string;
  field_type: 'CATEGORICAL' | 'NUMERICAL' | 'TEXT' | 'DATETIME' | 'BOOLEAN' | 'JSON' | 'BINARY';
  data_type: string;
  nullable: boolean;
  default_value?: any;
  validation_rules: ValidationRule[];
  transformation_hints: TransformationHint[];
}

export interface ValidationRule {
  rule_type: 'RANGE' | 'PATTERN' | 'ENUM' | 'CUSTOM';
  rule_definition: any;
  error_message: string;
}

export interface TransformationHint {
  transformation_type: 'NORMALIZE' | 'STANDARDIZE' | 'ENCODE' | 'DISCRETIZE' | 'AGGREGATE';
  parameters: Record<string, any>;
  priority: number;
}

export interface RelationshipDefinition {
  relationship_type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
  source_field: string;
  target_field: string;
  relationship_strength: number; // 0-1
}

export interface SchemaConstraint {
  constraint_type: 'UNIQUE' | 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'CHECK' | 'NOT_NULL';
  constraint_definition: any;
  enforcement_level: 'STRICT' | 'WARNING' | 'IGNORE';
}

export interface SchemaMetadata {
  created_at: Date;
  last_modified: Date;
  version_history: SchemaVersion[];
  documentation: string;
  tags: string[];
}

export interface SchemaVersion {
  version: string;
  changes: SchemaChange[];
  migration_script?: string;
  backward_compatible: boolean;
}

export interface SchemaChange {
  change_type: 'ADD_FIELD' | 'REMOVE_FIELD' | 'MODIFY_FIELD' | 'ADD_CONSTRAINT' | 'REMOVE_CONSTRAINT';
  change_description: string;
  impact_assessment: string;
}

export interface DataQuality {
  overall_score: number; // 0-100
  quality_dimensions: QualityDimension[];
  quality_issues: QualityIssue[];
  quality_trends: QualityTrend[];
  last_assessment: Date;
}

export interface QualityDimension {
  dimension_name: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'TIMELINESS' | 'VALIDITY' | 'UNIQUENESS';
  score: number; // 0-100
  measurement_method: string;
  benchmark_comparison: number; // 0-100
}

export interface QualityIssue {
  issue_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_records: number;
  affected_fields: string[];
  detection_timestamp: Date;
  resolution_status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DEFERRED';
}

export interface QualityTrend {
  dimension: string;
  trend_direction: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  trend_rate: number; // per time unit
  confidence_level: number; // 0-1
}

export interface AccessPermission {
  permission_type: 'READ' | 'WRITE' | 'ADMIN';
  granted_to: string; // user or role
  granted_at: Date;
  expires_at?: Date;
  conditions: PermissionCondition[];
}

export interface PermissionCondition {
  condition_type: 'TIME_BASED' | 'LOCATION_BASED' | 'DATA_SUBSET' | 'PURPOSE_BASED';
  condition_definition: any;
}

export interface PreprocessingStep {
  step_id: string;
  step_name: string;
  step_type: PreprocessingType;
  step_order: number;
  input_fields: string[];
  output_fields: string[];
  parameters: PreprocessingParameters;
  execution_config: StepExecutionConfig;
  validation_rules: StepValidationRule[];
}

export type PreprocessingType = 
  | 'DATA_CLEANING'           // データクリーニング
  | 'MISSING_VALUE_HANDLING'  // 欠損値処理
  | 'OUTLIER_DETECTION'       // 外れ値検出
  | 'DATA_TRANSFORMATION'     // データ変換
  | 'FEATURE_SCALING'         // 特徴量スケーリング
  | 'ENCODING'                // エンコーディング
  | 'DISCRETIZATION'          // 離散化
  | 'AGGREGATION'             // 集約
  | 'SAMPLING'                // サンプリング
  | 'DATA_INTEGRATION'        // データ統合
  | 'DATA_REDUCTION'          // データ削減
  | 'DATA_VALIDATION';        // データ検証

export interface PreprocessingParameters {
  algorithm: string;
  hyperparameters: Record<string, any>;
  configuration_options: ConfigurationOption[];
  performance_settings: PerformanceSettings;
}

export interface ConfigurationOption {
  option_name: string;
  option_value: any;
  option_type: 'REQUIRED' | 'OPTIONAL' | 'CONDITIONAL';
  dependencies: string[];
}

export interface PerformanceSettings {
  parallel_processing: boolean;
  max_workers: number;
  memory_limit: number; // MB
  timeout: number; // 秒
  optimization_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'AGGRESSIVE';
}

export interface StepExecutionConfig {
  execution_mode: 'SEQUENTIAL' | 'PARALLEL' | 'DISTRIBUTED';
  resource_allocation: ResourceAllocation;
  error_handling: ErrorHandling;
  monitoring_config: MonitoringConfig;
}

export interface ResourceAllocation {
  cpu_cores: number;
  memory_gb: number;
  gpu_units?: number;
  storage_gb: number;
  network_bandwidth?: number; // Mbps
}

export interface ErrorHandling {
  error_strategy: 'FAIL_FAST' | 'CONTINUE_ON_ERROR' | 'RETRY' | 'FALLBACK';
  max_error_rate: number; // 0-1
  retry_config?: RetryConfig;
  fallback_action?: string;
}

export interface RetryConfig {
  max_attempts: number;
  delay_seconds: number;
  exponential_backoff: boolean;
  retry_conditions: string[];
}

export interface MonitoringConfig {
  enable_monitoring: boolean;
  metrics_to_track: string[];
  alert_thresholds: AlertThreshold[];
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
}

export interface AlertThreshold {
  metric_name: string;
  threshold_value: number;
  comparison_operator: 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE';
  alert_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface StepValidationRule {
  validation_type: 'INPUT_VALIDATION' | 'OUTPUT_VALIDATION' | 'PERFORMANCE_VALIDATION';
  validation_criteria: ValidationCriteria;
  failure_action: 'STOP_PIPELINE' | 'LOG_WARNING' | 'APPLY_FIX' | 'SKIP_STEP';
}

export interface ValidationCriteria {
  criteria_expression: string;
  expected_result: any;
  tolerance: number;
  validation_method: string;
}

export interface FeatureEngineering {
  feature_selection: FeatureSelection;
  feature_extraction: FeatureExtraction;
  feature_construction: FeatureConstruction;
  feature_transformation: FeatureTransformation;
  feature_validation: FeatureValidation;
}

export interface FeatureSelection {
  selection_methods: SelectionMethod[];
  selection_criteria: SelectionCriteria;
  target_feature_count?: number;
  feature_importance_threshold?: number;
  cross_validation_config: CrossValidationConfig;
}

export interface SelectionMethod {
  method_name: string;
  method_type: 'FILTER' | 'WRAPPER' | 'EMBEDDED' | 'HYBRID';
  algorithm: string;
  parameters: Record<string, any>;
  weight: number; // 0-1
}

export interface SelectionCriteria {
  primary_criterion: 'IMPORTANCE' | 'CORRELATION' | 'MUTUAL_INFO' | 'STATISTICAL_TEST' | 'MODEL_PERFORMANCE';
  secondary_criteria: string[];
  optimization_objective: 'MAXIMIZE_PERFORMANCE' | 'MINIMIZE_FEATURES' | 'BALANCE';
  constraints: SelectionConstraint[];
}

export interface SelectionConstraint {
  constraint_type: 'MANDATORY_FEATURES' | 'FORBIDDEN_FEATURES' | 'FEATURE_GROUPS' | 'CORRELATION_LIMIT';
  constraint_definition: any;
}

export interface CrossValidationConfig {
  cv_strategy: 'K_FOLD' | 'STRATIFIED_K_FOLD' | 'TIME_SERIES_SPLIT' | 'LEAVE_ONE_OUT';
  cv_folds: number;
  shuffle: boolean;
  random_state: number;
  scoring_metric: string;
}

export interface FeatureExtraction {
  extraction_methods: ExtractionMethod[];
  dimensionality_reduction: DimensionalityReduction;
  text_processing: TextProcessing;
  image_processing?: ImageProcessing;
  time_series_features?: TimeSeriesFeatures;
}

export interface ExtractionMethod {
  method_name: string;
  method_type: 'PCA' | 'ICA' | 'LDA' | 'AUTOENCODER' | 'MANIFOLD_LEARNING' | 'CUSTOM';
  algorithm: string;
  parameters: Record<string, any>;
  target_dimensions?: number;
}

export interface DimensionalityReduction {
  reduction_algorithm: string;
  target_dimensions: number;
  variance_explained_threshold?: number;
  regularization_parameters: Record<string, number>;
}

export interface TextProcessing {
  tokenization: TokenizationConfig;
  vectorization: VectorizationConfig;
  language_processing: LanguageProcessingConfig;
  semantic_analysis: SemanticAnalysisConfig;
}

export interface TokenizationConfig {
  tokenizer_type: 'SIMPLE' | 'REGEX' | 'SPACY' | 'BERT' | 'CUSTOM';
  language: string;
  lowercase: boolean;
  remove_punctuation: boolean;
  remove_stopwords: boolean;
  stemming: boolean;
  lemmatization: boolean;
}

export interface VectorizationConfig {
  vectorization_method: 'BAG_OF_WORDS' | 'TF_IDF' | 'WORD2VEC' | 'FASTTEXT' | 'BERT_EMBEDDINGS';
  max_features: number;
  ngram_range: [number, number];
  min_document_frequency: number;
  max_document_frequency: number;
}

export interface LanguageProcessingConfig {
  named_entity_recognition: boolean;
  part_of_speech_tagging: boolean;
  dependency_parsing: boolean;
  sentiment_analysis: boolean;
  topic_modeling: TopicModelingConfig;
}

export interface TopicModelingConfig {
  algorithm: 'LDA' | 'NMF' | 'LSI' | 'BERT_TOPIC';
  num_topics: number;
  alpha: number;
  beta: number;
  iterations: number;
}

export interface SemanticAnalysisConfig {
  similarity_metric: 'COSINE' | 'EUCLIDEAN' | 'MANHATTAN' | 'JACCARD';
  embedding_model: string;
  semantic_clustering: boolean;
  concept_extraction: boolean;
}

export interface ImageProcessing {
  preprocessing: ImagePreprocessing;
  feature_extraction: ImageFeatureExtraction;
  augmentation: ImageAugmentation;
}

export interface ImagePreprocessing {
  resize_dimensions: [number, number];
  normalization: boolean;
  color_space_conversion: string;
  noise_reduction: boolean;
}

export interface ImageFeatureExtraction {
  extraction_method: 'CNN_FEATURES' | 'HISTOGRAM' | 'TEXTURE' | 'SHAPE' | 'SIFT' | 'ORB';
  pretrained_model?: string;
  feature_layers: string[];
}

export interface ImageAugmentation {
  rotation_range: number;
  width_shift_range: number;
  height_shift_range: number;
  zoom_range: number;
  horizontal_flip: boolean;
  vertical_flip: boolean;
}

export interface TimeSeriesFeatures {
  lag_features: LagFeatures;
  rolling_statistics: RollingStatistics;
  seasonal_decomposition: SeasonalDecomposition;
  fourier_features: FourierFeatures;
}

export interface LagFeatures {
  max_lag: number;
  lag_intervals: number[];
  target_variables: string[];
}

export interface RollingStatistics {
  window_sizes: number[];
  statistics: ('mean' | 'std' | 'min' | 'max' | 'median' | 'skew' | 'kurt')[];
  center: boolean;
}

export interface SeasonalDecomposition {
  decomposition_method: 'ADDITIVE' | 'MULTIPLICATIVE' | 'STL';
  seasonal_periods: number[];
  extract_trend: boolean;
  extract_seasonal: boolean;
  extract_residual: boolean;
}

export interface FourierFeatures {
  num_fourier_terms: number;
  seasonal_periods: number[];
  normalize: boolean;
}

export interface FeatureConstruction {
  construction_rules: ConstructionRule[];
  interaction_features: InteractionFeatures;
  polynomial_features: PolynomialFeatures;
  domain_specific_features: DomainSpecificFeatures;
}

export interface ConstructionRule {
  rule_id: string;
  rule_name: string;
  rule_expression: string;
  input_features: string[];
  output_feature_name: string;
  rule_type: 'ARITHMETIC' | 'LOGICAL' | 'CONDITIONAL' | 'AGGREGATION';
}

export interface InteractionFeatures {
  interaction_depth: number;
  feature_pairs: [string, string][];
  interaction_types: ('multiply' | 'add' | 'subtract' | 'divide' | 'min' | 'max')[];
  include_bias: boolean;
}

export interface PolynomialFeatures {
  degree: number;
  include_bias: boolean;
  interaction_only: boolean;
  feature_subset?: string[];
}

export interface DomainSpecificFeatures {
  domain: string;
  feature_templates: FeatureTemplate[];
  business_rules: BusinessRule[];
  expert_knowledge: ExpertKnowledge[];
}

export interface FeatureTemplate {
  template_name: string;
  template_expression: string;
  required_inputs: string[];
  optional_inputs: string[];
  validation_criteria: string[];
}

export interface BusinessRule {
  rule_name: string;
  rule_logic: string;
  applicability_conditions: string[];
  business_impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ExpertKnowledge {
  knowledge_type: 'FEATURE_IMPORTANCE' | 'FEATURE_INTERACTION' | 'DOMAIN_CONSTRAINT' | 'BUSINESS_LOGIC';
  knowledge_description: string;
  confidence_level: number; // 0-1
  source: string;
}

export interface FeatureTransformation {
  scaling_methods: ScalingMethod[];
  encoding_methods: EncodingMethod[];
  binning_strategies: BinningStrategy[];
  normalization_techniques: NormalizationTechnique[];
}

export interface ScalingMethod {
  method_name: string;
  algorithm: 'STANDARD_SCALER' | 'MIN_MAX_SCALER' | 'ROBUST_SCALER' | 'QUANTILE_TRANSFORMER' | 'POWER_TRANSFORMER';
  parameters: Record<string, any>;
  applicable_features: string[];
}

export interface EncodingMethod {
  method_name: string;
  algorithm: 'ONE_HOT' | 'LABEL_ENCODING' | 'TARGET_ENCODING' | 'BINARY_ENCODING' | 'FREQUENCY_ENCODING';
  parameters: Record<string, any>;
  applicable_features: string[];
}

export interface BinningStrategy {
  strategy_name: string;
  binning_method: 'EQUAL_WIDTH' | 'EQUAL_FREQUENCY' | 'K_MEANS' | 'DECISION_TREE' | 'CUSTOM_BOUNDARIES';
  num_bins: number;
  boundaries?: number[];
  applicable_features: string[];
}

export interface NormalizationTechnique {
  technique_name: string;
  normalization_type: 'L1' | 'L2' | 'MAX' | 'UNIT_VECTOR' | 'CUSTOM';
  parameters: Record<string, any>;
  applicable_features: string[];
}

export interface FeatureValidation {
  validation_tests: ValidationTest[];
  quality_checks: QualityCheck[];
  consistency_checks: ConsistencyCheck[];
  statistical_tests: StatisticalTest[];
}

export interface ValidationTest {
  test_name: string;
  test_type: 'DISTRIBUTION_TEST' | 'CORRELATION_TEST' | 'STABILITY_TEST' | 'DRIFT_DETECTION';
  test_parameters: Record<string, any>;
  pass_criteria: any;
  failure_action: 'FAIL_PIPELINE' | 'LOG_WARNING' | 'AUTO_FIX';
}

export interface QualityCheck {
  check_name: string;
  quality_metric: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'VALIDITY' | 'UNIQUENESS';
  threshold: number;
  measurement_method: string;
}

export interface ConsistencyCheck {
  check_name: string;
  consistency_rule: string;
  reference_dataset?: string;
  tolerance: number;
}

export interface StatisticalTest {
  test_name: string;
  test_type: 'NORMALITY_TEST' | 'STATIONARITY_TEST' | 'INDEPENDENCE_TEST' | 'HOMOSCEDASTICITY_TEST';
  significance_level: number;
  test_statistic: string;
}

export interface ModelConfiguration {
  model_type: ModelType;
  algorithm_family: AlgorithmFamily;
  specific_algorithms: SpecificAlgorithm[];
  hyperparameter_space: HyperparameterSpace;
  ensemble_config?: EnsembleConfiguration;
  model_selection_strategy: ModelSelectionStrategy;
}

export type ModelType = 
  | 'CLASSIFICATION'
  | 'REGRESSION'
  | 'CLUSTERING'
  | 'ASSOCIATION'
  | 'REINFORCEMENT'
  | 'DEEP_LEARNING'
  | 'TIME_SERIES'
  | 'ANOMALY_DETECTION'
  | 'RANKING'
  | 'RECOMMENDATION';

export type AlgorithmFamily = 
  | 'LINEAR_MODELS'
  | 'TREE_BASED'
  | 'NEURAL_NETWORKS'
  | 'ENSEMBLE_METHODS'
  | 'KERNEL_METHODS'
  | 'BAYESIAN_METHODS'
  | 'INSTANCE_BASED'
  | 'CLUSTERING_ALGORITHMS'
  | 'DIMENSIONALITY_REDUCTION'
  | 'DEEP_LEARNING_ARCHITECTURES';

export interface SpecificAlgorithm {
  algorithm_name: string;
  algorithm_class: string;
  default_parameters: Record<string, any>;
  parameter_ranges: ParameterRange[];
  computational_complexity: ComputationalComplexity;
  interpretability_score: number; // 0-1
  scalability_profile: ScalabilityProfile;
}

export interface ParameterRange {
  parameter_name: string;
  parameter_type: 'CONTINUOUS' | 'DISCRETE' | 'CATEGORICAL' | 'BOOLEAN';
  min_value?: number;
  max_value?: number;
  discrete_values?: any[];
  categorical_values?: string[];
  distribution_hint?: 'UNIFORM' | 'LOG_UNIFORM' | 'NORMAL' | 'LOG_NORMAL';
}

export interface ComputationalComplexity {
  time_complexity: string;
  space_complexity: string;
  training_complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  prediction_complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

export interface ScalabilityProfile {
  data_size_scalability: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  feature_scalability: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  parallel_training_support: boolean;
  distributed_training_support: boolean;
  incremental_learning_support: boolean;
}

export interface HyperparameterSpace {
  optimization_method: 'GRID_SEARCH' | 'RANDOM_SEARCH' | 'BAYESIAN_OPTIMIZATION' | 'EVOLUTIONARY' | 'HYPERBAND';
  search_space_definition: SearchSpaceDefinition[];
  optimization_objective: OptimizationObjective;
  search_budget: SearchBudget;
  early_stopping_config?: EarlyStoppingConfig;
}

export interface SearchSpaceDefinition {
  parameter_name: string;
  search_space: SearchSpace;
  importance_weight: number; // 0-1
  conditional_dependencies: ConditionalDependency[];
}

export interface SearchSpace {
  space_type: 'CONTINUOUS' | 'DISCRETE' | 'CATEGORICAL' | 'ORDINAL';
  bounds?: [number, number];
  choices?: any[];
  distribution?: 'UNIFORM' | 'LOG_UNIFORM' | 'NORMAL' | 'LOG_NORMAL';
  prior_knowledge?: PriorKnowledge;
}

export interface PriorKnowledge {
  expected_value?: any;
  confidence: number; // 0-1
  source: 'DOMAIN_EXPERT' | 'LITERATURE' | 'PREVIOUS_EXPERIMENTS' | 'BASELINE';
}

export interface ConditionalDependency {
  condition: string;
  dependent_parameters: string[];
  dependency_type: 'ACTIVATION' | 'CONSTRAINT' | 'PREFERENCE';
}

export interface OptimizationObjective {
  primary_metric: string;
  optimization_direction: 'MAXIMIZE' | 'MINIMIZE';
  secondary_metrics: SecondaryMetric[];
  multi_objective_strategy?: 'WEIGHTED_SUM' | 'PARETO_OPTIMIZATION' | 'LEXICOGRAPHIC';
}

export interface SecondaryMetric {
  metric_name: string;
  weight: number; // 0-1
  optimization_direction: 'MAXIMIZE' | 'MINIMIZE';
  constraint_type?: 'THRESHOLD' | 'RELATIVE' | 'ABSOLUTE';
  constraint_value?: number;
}

export interface SearchBudget {
  max_evaluations: number;
  max_time_minutes: number;
  max_cost?: number;
  resource_constraints: ResourceConstraints;
}

export interface ResourceConstraints {
  max_parallel_trials: number;
  cpu_cores_per_trial: number;
  memory_gb_per_trial: number;
  gpu_units_per_trial?: number;
}

export interface EarlyStoppingConfig {
  stopping_criterion: 'PERFORMANCE_PLATEAU' | 'TIME_LIMIT' | 'COST_LIMIT' | 'CONVERGENCE';
  patience: number;
  min_improvement: number;
  evaluation_frequency: number;
}

export interface EnsembleConfiguration {
  ensemble_method: 'VOTING' | 'BAGGING' | 'BOOSTING' | 'STACKING' | 'BLENDING';
  base_models: BaseModelConfig[];
  combination_strategy: CombinationStrategy;
  diversity_promotion: DiversityPromotion;
  ensemble_size_strategy: EnsembleSizeStrategy;
}

export interface BaseModelConfig {
  model_class: string;
  model_parameters: Record<string, any>;
  weight: number; // 0-1
  selection_probability: number; // 0-1
}

export interface CombinationStrategy {
  combination_method: 'SIMPLE_AVERAGE' | 'WEIGHTED_AVERAGE' | 'MEDIAN' | 'META_LEARNING';
  weight_optimization: 'EQUAL_WEIGHTS' | 'PERFORMANCE_BASED' | 'DIVERSITY_BASED' | 'LEARNED_WEIGHTS';
  meta_learner_config?: MetaLearnerConfig;
}

export interface MetaLearnerConfig {
  meta_learner_algorithm: string;
  meta_features: 'PREDICTIONS' | 'PROBABILITIES' | 'FEATURES' | 'HYBRID';
  cross_validation_strategy: string;
}

export interface DiversityPromotion {
  diversity_metric: 'PREDICTION_DIVERSITY' | 'PARAMETER_DIVERSITY' | 'ALGORITHM_DIVERSITY';
  diversity_weight: number; // 0-1
  minimum_diversity_threshold: number;
}

export interface EnsembleSizeStrategy {
  size_determination: 'FIXED' | 'DYNAMIC' | 'ADAPTIVE';
  min_ensemble_size: number;
  max_ensemble_size: number;
  size_optimization_metric: string;
}

export interface ModelSelectionStrategy {
  selection_method: 'CROSS_VALIDATION' | 'HOLDOUT' | 'BOOTSTRAP' | 'TIME_SERIES_SPLIT' | 'NESTED_CV';
  validation_strategy: ValidationStrategy;
  model_comparison: ModelComparison;
  selection_criteria: ModelSelectionCriteria;
}

export interface ValidationStrategy {
  validation_type: string;
  validation_parameters: Record<string, any>;
  stratification: boolean;
  shuffle: boolean;
  random_state: number;
}

export interface ModelComparison {
  comparison_metrics: string[];
  statistical_tests: ComparisonTest[];
  significance_level: number;
  multiple_comparison_correction: 'BONFERRONI' | 'HOLM' | 'FDR' | 'NONE';
}

export interface ComparisonTest {
  test_name: string;
  test_type: 'PAIRED_T_TEST' | 'WILCOXON' | 'MCNEMAR' | 'FRIEDMAN' | 'NEMENYI';
  test_parameters: Record<string, any>;
}

export interface ModelSelectionCriteria {
  primary_criterion: string;
  tie_breaking_criteria: string[];
  performance_thresholds: PerformanceThreshold[];
  business_constraints: BusinessConstraint[];
}

export interface PerformanceThreshold {
  metric_name: string;
  minimum_value?: number;
  maximum_value?: number;
  target_value?: number;
}

export interface BusinessConstraint {
  constraint_name: string;
  constraint_type: 'INTERPRETABILITY' | 'PREDICTION_TIME' | 'MODEL_SIZE' | 'FAIRNESS' | 'ROBUSTNESS';
  constraint_value: any;
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TrainingConfiguration {
  training_strategy: TrainingStrategy;
  optimization_config: OptimizationConfig;
  regularization: RegularizationConfig;
  data_handling: DataHandlingConfig;
  computational_config: ComputationalConfig;
  monitoring_config: TrainingMonitoringConfig;
}

export interface TrainingStrategy {
  training_mode: 'BATCH' | 'ONLINE' | 'MINI_BATCH' | 'INCREMENTAL';
  training_schedule: TrainingSchedule;
  curriculum_learning?: CurriculumLearning;
  transfer_learning?: TransferLearning;
}

export interface TrainingSchedule {
  max_epochs: number;
  batch_size: number;
  learning_rate_schedule: LearningRateSchedule;
  checkpoint_frequency: number;
  validation_frequency: number;
}

export interface LearningRateSchedule {
  schedule_type: 'CONSTANT' | 'EXPONENTIAL_DECAY' | 'POLYNOMIAL_DECAY' | 'COSINE_ANNEALING' | 'CUSTOM';
  initial_learning_rate: number;
  schedule_parameters: Record<string, number>;
}

export interface CurriculumLearning {
  curriculum_strategy: 'DIFFICULTY_BASED' | 'CONFIDENCE_BASED' | 'DIVERSITY_BASED';
  curriculum_schedule: CurriculumSchedule[];
  difficulty_metric: string;
}

export interface CurriculumSchedule {
  epoch_range: [number, number];
  data_subset_criteria: string;
  subset_percentage: number; // 0-1
}

export interface TransferLearning {
  source_model: SourceModel;
  transfer_strategy: 'FEATURE_EXTRACTION' | 'FINE_TUNING' | 'DOMAIN_ADAPTATION';
  layer_freezing: LayerFreezingConfig;
  adaptation_config: AdaptationConfig;
}

export interface SourceModel {
  model_id: string;
  model_path: string;
  model_metadata: ModelMetadata;
  compatibility_check: CompatibilityCheck;
}

export interface ModelMetadata {
  model_architecture: string;
  training_dataset: string;
  performance_metrics: Record<string, number>;
  model_version: string;
  created_at: Date;
}

export interface CompatibilityCheck {
  input_compatibility: boolean;
  output_compatibility: boolean;
  architecture_compatibility: boolean;
  framework_compatibility: boolean;
}

export interface LayerFreezingConfig {
  freeze_strategy: 'FREEZE_ALL' | 'FREEZE_EARLY' | 'FREEZE_LATE' | 'SELECTIVE_FREEZE';
  layers_to_freeze: string[];
  unfreezing_schedule?: UnfreezingSchedule[];
}

export interface UnfreezingSchedule {
  epoch: number;
  layers_to_unfreeze: string[];
  learning_rate_adjustment: number;
}

export interface AdaptationConfig {
  adaptation_method: 'GRADUAL_UNFREEZING' | 'DISCRIMINATIVE_LEARNING' | 'KNOWLEDGE_DISTILLATION';
  adaptation_parameters: Record<string, any>;
}

export interface OptimizationConfig {
  optimizer: OptimizerConfig;
  loss_function: LossFunctionConfig;
  gradient_config: GradientConfig;
  convergence_criteria: ConvergenceCriteria;
}

export interface OptimizerConfig {
  optimizer_name: string;
  optimizer_parameters: Record<string, number>;
  learning_rate: number;
  momentum?: number;
  weight_decay?: number;
}

export interface LossFunctionConfig {
  loss_function_name: string;
  loss_parameters: Record<string, any>;
  class_weights?: Record<string, number>;
  focal_loss_config?: FocalLossConfig;
}

export interface FocalLossConfig {
  alpha: number;
  gamma: number;
  reduction: 'MEAN' | 'SUM' | 'NONE';
}

export interface GradientConfig {
  gradient_clipping: GradientClipping;
  gradient_accumulation: GradientAccumulation;
  gradient_noise?: GradientNoise;
}

export interface GradientClipping {
  enable_clipping: boolean;
  clipping_method: 'VALUE' | 'NORM' | 'GLOBAL_NORM';
  clipping_value: number;
}

export interface GradientAccumulation {
  accumulation_steps: number;
  normalize_by_steps: boolean;
}

export interface GradientNoise {
  noise_type: 'GAUSSIAN' | 'UNIFORM';
  noise_parameters: Record<string, number>;
  annealing_schedule?: NoiseAnnealingSchedule;
}

export interface NoiseAnnealingSchedule {
  initial_noise: number;
  final_noise: number;
  annealing_epochs: number;
  annealing_strategy: 'LINEAR' | 'EXPONENTIAL' | 'COSINE';
}

export interface ConvergenceCriteria {
  max_iterations: number;
  tolerance: number;
  patience: number;
  min_improvement: number;
  convergence_window: number;
}

export interface RegularizationConfig {
  l1_regularization: number;
  l2_regularization: number;
  dropout_config?: DropoutConfig;
  batch_normalization?: BatchNormalizationConfig;
  data_augmentation?: DataAugmentationConfig;
}

export interface DropoutConfig {
  dropout_rate: number;
  layer_specific_rates: Record<string, number>;
  scheduled_dropout?: ScheduledDropout;
}

export interface ScheduledDropout {
  initial_rate: number;
  final_rate: number;
  schedule_type: 'LINEAR' | 'EXPONENTIAL' | 'STEP';
  schedule_parameters: Record<string, number>;
}

export interface BatchNormalizationConfig {
  momentum: number;
  epsilon: number;
  affine: boolean;
  track_running_stats: boolean;
}

export interface DataAugmentationConfig {
  augmentation_probability: number;
  augmentation_techniques: AugmentationTechnique[];
  augmentation_intensity: number; // 0-1
}

export interface AugmentationTechnique {
  technique_name: string;
  technique_parameters: Record<string, any>;
  application_probability: number; // 0-1
}

export interface DataHandlingConfig {
  data_loading: DataLoadingConfig;
  data_splitting: DataSplittingConfig;
  class_balancing?: ClassBalancingConfig;
  missing_data_strategy: MissingDataStrategy;
}

export interface DataLoadingConfig {
  batch_loading: boolean;
  prefetch_batches: number;
  shuffle_data: boolean;
  parallel_loading: boolean;
  num_workers: number;
}

export interface DataSplittingConfig {
  train_ratio: number;
  validation_ratio: number;
  test_ratio: number;
  splitting_strategy: 'RANDOM' | 'STRATIFIED' | 'TIME_BASED' | 'GROUP_BASED';
  random_seed: number;
}

export interface ClassBalancingConfig {
  balancing_method: 'OVERSAMPLING' | 'UNDERSAMPLING' | 'SYNTHETIC' | 'COST_SENSITIVE';
  target_distribution: 'UNIFORM' | 'WEIGHTED' | 'CUSTOM';
  balancing_parameters: Record<string, any>;
}

export interface MissingDataStrategy {
  detection_method: string;
  imputation_method: 'MEAN' | 'MEDIAN' | 'MODE' | 'KNN' | 'ITERATIVE' | 'LEARNED';
  imputation_parameters: Record<string, any>;
}

export interface ComputationalConfig {
  hardware_config: HardwareConfig;
  parallel_config: ParallelConfig;
  memory_config: MemoryConfig;
  optimization_config: ComputationalOptimizationConfig;
}

export interface HardwareConfig {
  device_type: 'CPU' | 'GPU' | 'TPU' | 'MIXED';
  device_ids: number[];
  mixed_precision: boolean;
  automatic_mixed_precision: boolean;
}

export interface ParallelConfig {
  data_parallel: boolean;
  model_parallel: boolean;
  pipeline_parallel: boolean;
  distributed_training: DistributedTrainingConfig;
}

export interface DistributedTrainingConfig {
  backend: 'NCCL' | 'GLOO' | 'MPI';
  num_nodes: number;
  num_processes_per_node: number;
  communication_strategy: 'ALL_REDUCE' | 'PARAMETER_SERVER' | 'RING_ALL_REDUCE';
}

export interface MemoryConfig {
  memory_limit: number; // GB
  gradient_checkpointing: boolean;
  memory_efficient_attention: boolean;
  swap_memory: boolean;
}

export interface ComputationalOptimizationConfig {
  jit_compilation: boolean;
  graph_optimization: boolean;
  operator_fusion: boolean;
  memory_optimization: boolean;
}

export interface TrainingMonitoringConfig {
  metrics_to_track: string[];
  logging_frequency: number;
  checkpoint_config: CheckpointConfig;
  visualization_config: VisualizationConfig;
  alert_config: TrainingAlertConfig;
}

export interface CheckpointConfig {
  save_frequency: number;
  save_best_only: boolean;
  save_last: boolean;
  checkpoint_metric: string;
  max_checkpoints_to_keep: number;
}

export interface VisualizationConfig {
  enable_tensorboard: boolean;
  enable_wandb: boolean;
  custom_visualizations: CustomVisualization[];
  update_frequency: number;
}

export interface CustomVisualization {
  visualization_name: string;
  visualization_type: 'LINE_PLOT' | 'HISTOGRAM' | 'HEATMAP' | 'SCATTER_PLOT' | 'BAR_CHART';
  data_source: string;
  update_frequency: number;
}

export interface TrainingAlertConfig {
  alert_conditions: AlertCondition[];
  notification_channels: NotificationChannel[];
  alert_frequency_limit: number;
}

export interface AlertCondition {
  condition_name: string;
  metric_name: string;
  condition_type: 'THRESHOLD' | 'TREND' | 'ANOMALY' | 'STAGNATION';
  condition_parameters: Record<string, any>;
}

export interface NotificationChannel {
  channel_type: 'EMAIL' | 'SLACK' | 'WEBHOOK' | 'SMS';
  channel_config: Record<string, string>;
  severity_filter: 'ALL' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export interface EvaluationMetrics {
  primary_metrics: PrimaryMetric[];
  secondary_metrics: SecondaryMetric[];
  custom_metrics: CustomMetric[];
  evaluation_protocols: EvaluationProtocol[];
  benchmark_comparisons: BenchmarkComparison[];
}

export interface PrimaryMetric {
  metric_name: string;
  metric_type: 'CLASSIFICATION' | 'REGRESSION' | 'RANKING' | 'CLUSTERING' | 'CUSTOM';
  calculation_method: string;
  aggregation_strategy: 'MEAN' | 'WEIGHTED_MEAN' | 'MEDIAN' | 'MAX' | 'MIN';
  threshold_for_success?: number;
}

export interface CustomMetric {
  metric_name: string;
  metric_definition: string;
  calculation_function: string;
  dependencies: string[];
  business_relevance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface EvaluationProtocol {
  protocol_name: string;
  evaluation_methodology: 'CROSS_VALIDATION' | 'HOLDOUT' | 'BOOTSTRAP' | 'TIME_SERIES_VALIDATION';
  protocol_parameters: Record<string, any>;
  statistical_significance_testing: StatisticalSignificanceConfig;
}

export interface StatisticalSignificanceConfig {
  enable_testing: boolean;
  significance_level: number;
  test_type: 'PARAMETRIC' | 'NON_PARAMETRIC' | 'PERMUTATION';
  multiple_comparison_correction: boolean;
}

export interface BenchmarkComparison {
  benchmark_name: string;
  benchmark_dataset: string;
  baseline_models: BaselineModel[];
  comparison_metrics: string[];
  statistical_tests: string[];
}

export interface BaselineModel {
  model_name: string;
  model_description: string;
  baseline_performance: Record<string, number>;
  implementation_reference: string;
}

export interface DeploymentConfiguration {
  deployment_target: DeploymentTarget;
  serving_config: ServingConfig;
  monitoring_config: DeploymentMonitoringConfig;
  scalability_config: ScalabilityConfig;
  security_config: SecurityConfig;
}

export interface DeploymentTarget {
  target_environment: 'CLOUD' | 'ON_PREMISE' | 'EDGE' | 'HYBRID';
  platform: string;
  resource_requirements: DeploymentResourceRequirements;
  availability_requirements: AvailabilityRequirements;
}

export interface DeploymentResourceRequirements {
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  gpu_units?: number;
  network_bandwidth_mbps: number;
}

export interface AvailabilityRequirements {
  uptime_sla: number; // 0-1
  max_response_time_ms: number;
  max_concurrent_requests: number;
  disaster_recovery: boolean;
}

export interface ServingConfig {
  serving_framework: string;
  api_configuration: APIConfiguration;
  batch_serving_config?: BatchServingConfig;
  real_time_serving_config?: RealTimeServingConfig;
}

export interface APIConfiguration {
  api_version: string;
  authentication_method: string;
  rate_limiting: RateLimitingConfig;
  request_validation: RequestValidationConfig;
  response_format: ResponseFormatConfig;
}

export interface RateLimitingConfig {
  requests_per_minute: number;
  burst_capacity: number;
  rate_limiting_strategy: 'TOKEN_BUCKET' | 'SLIDING_WINDOW' | 'FIXED_WINDOW';
}

export interface RequestValidationConfig {
  input_schema_validation: boolean;
  data_type_validation: boolean;
  range_validation: boolean;
  custom_validation_rules: string[];
}

export interface ResponseFormatConfig {
  response_format: 'JSON' | 'XML' | 'PROTOBUF' | 'CUSTOM';
  include_confidence_scores: boolean;
  include_explanation: boolean;
  include_metadata: boolean;
}

export interface BatchServingConfig {
  batch_size: number;
  processing_schedule: string;
  input_data_format: string;
  output_data_format: string;
  error_handling_strategy: string;
}

export interface RealTimeServingConfig {
  max_latency_ms: number;
  auto_scaling_config: AutoScalingConfig;
  caching_config: CachingConfig;
  load_balancing_strategy: string;
}

export interface AutoScalingConfig {
  enable_auto_scaling: boolean;
  min_instances: number;
  max_instances: number;
  scaling_metrics: ScalingMetric[];
  scaling_policies: ScalingPolicy[];
}

export interface ScalingMetric {
  metric_name: string;
  target_value: number;
  aggregation_period: number; // seconds
}

export interface ScalingPolicy {
  scaling_direction: 'UP' | 'DOWN';
  scaling_trigger: string;
  scaling_increment: number;
  cooldown_period: number; // seconds
}

export interface CachingConfig {
  enable_caching: boolean;
  cache_strategy: 'LRU' | 'LFU' | 'TTL' | 'CUSTOM';
  cache_size_mb: number;
  cache_ttl_seconds: number;
}

export interface DeploymentMonitoringConfig {
  performance_monitoring: PerformanceMonitoringConfig;
  model_drift_detection: ModelDriftDetectionConfig;
  data_quality_monitoring: DataQualityMonitoringConfig;
  business_metrics_monitoring: BusinessMetricsMonitoringConfig;
}

export interface PerformanceMonitoringConfig {
  latency_monitoring: boolean;
  throughput_monitoring: boolean;
  error_rate_monitoring: boolean;
  resource_utilization_monitoring: boolean;
  alert_thresholds: PerformanceAlertThreshold[];
}

export interface PerformanceAlertThreshold {
  metric_name: string;
  warning_threshold: number;
  critical_threshold: number;
  evaluation_window: number; // seconds
}

export interface ModelDriftDetectionConfig {
  enable_drift_detection: boolean;
  drift_detection_methods: DriftDetectionMethod[];
  drift_threshold: number;
  drift_evaluation_frequency: number; // hours
}

export interface DriftDetectionMethod {
  method_name: string;
  method_type: 'STATISTICAL' | 'DISTANCE_BASED' | 'MODEL_BASED' | 'ENSEMBLE';
  method_parameters: Record<string, any>;
  sensitivity: number; // 0-1
}

export interface DataQualityMonitoringConfig {
  quality_checks: DataQualityCheck[];
  quality_threshold: number;
  quality_evaluation_frequency: number; // hours
}

export interface DataQualityCheck {
  check_name: string;
  check_type: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'TIMELINESS' | 'VALIDITY';
  check_parameters: Record<string, any>;
}

export interface BusinessMetricsMonitoringConfig {
  business_metrics: BusinessMetric[];
  monitoring_frequency: number; // hours
  alert_configurations: BusinessMetricAlert[];
}

export interface BusinessMetric {
  metric_name: string;
  metric_calculation: string;
  target_value?: number;
  acceptable_range?: [number, number];
}

export interface BusinessMetricAlert {
  metric_name: string;
  alert_condition: string;
  alert_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notification_channels: string[];
}

export interface ScalabilityConfig {
  horizontal_scaling: HorizontalScalingConfig;
  vertical_scaling: VerticalScalingConfig;
  load_distribution: LoadDistributionConfig;
}

export interface HorizontalScalingConfig {
  enable_horizontal_scaling: boolean;
  scaling_strategy: 'REACTIVE' | 'PREDICTIVE' | 'SCHEDULED';
  min_replicas: number;
  max_replicas: number;
  scaling_triggers: HorizontalScalingTrigger[];
}

export interface HorizontalScalingTrigger {
  trigger_metric: string;
  scale_up_threshold: number;
  scale_down_threshold: number;
  evaluation_period: number; // seconds
}

export interface VerticalScalingConfig {
  enable_vertical_scaling: boolean;
  resource_adjustment_strategy: 'AUTOMATIC' | 'MANUAL' | 'SCHEDULED';
  scaling_limits: VerticalScalingLimits;
}

export interface VerticalScalingLimits {
  max_cpu_cores: number;
  max_memory_gb: number;
  max_gpu_units?: number;
}

export interface LoadDistributionConfig {
  load_balancing_algorithm: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'WEIGHTED_RANDOM' | 'CONSISTENT_HASHING';
  health_check_config: HealthCheckConfig;
  failover_strategy: 'IMMEDIATE' | 'GRADUAL' | 'MANUAL';
}

export interface HealthCheckConfig {
  health_check_endpoint: string;
  check_interval: number; // seconds
  timeout: number; // seconds
  failure_threshold: number;
  success_threshold: number;
}

export interface SecurityConfig {
  authentication: AuthenticationSecurityConfig;
  authorization: AuthorizationConfig;
  encryption: EncryptionConfig;
  audit_logging: AuditLoggingConfig;
  threat_protection: ThreatProtectionConfig;
}

export interface AuthenticationSecurityConfig {
  authentication_required: boolean;
  authentication_methods: string[];
  session_management: SessionManagementConfig;
  multi_factor_authentication: boolean;
}

export interface SessionManagementConfig {
  session_timeout: number; // minutes
  session_refresh: boolean;
  concurrent_session_limit: number;
}

export interface AuthorizationConfig {
  authorization_model: 'RBAC' | 'ABAC' | 'ACL' | 'CUSTOM';
  default_permissions: string[];
  permission_inheritance: boolean;
  fine_grained_permissions: boolean;
}

export interface EncryptionConfig {
  data_encryption_at_rest: boolean;
  data_encryption_in_transit: boolean;
  encryption_algorithm: string;
  key_management: KeyManagementConfig;
}

export interface KeyManagementConfig {
  key_storage: 'HSM' | 'KMS' | 'LOCAL' | 'EXTERNAL';
  key_rotation_frequency: number; // days
  key_backup_strategy: string;
}

export interface AuditLoggingConfig {
  enable_audit_logging: boolean;
  log_level: 'MINIMAL' | 'STANDARD' | 'DETAILED' | 'COMPREHENSIVE';
  log_retention_period: number; // days
  log_encryption: boolean;
}

export interface ThreatProtectionConfig {
  ddos_protection: boolean;
  sql_injection_protection: boolean;
  xss_protection: boolean;
  rate_limiting_for_security: boolean;
  anomaly_detection: boolean;
}

export interface PipelineStatus {
  current_stage: PipelineStage;
  overall_progress: number; // 0-100
  stage_progress: Record<string, number>;
  execution_state: 'CREATED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  error_details?: ErrorDetails;
  performance_metrics: PipelinePerformanceMetrics;
}

export type PipelineStage = 
  | 'DATA_INGESTION'
  | 'DATA_PREPROCESSING'
  | 'FEATURE_ENGINEERING'
  | 'MODEL_TRAINING'
  | 'MODEL_EVALUATION'
  | 'MODEL_DEPLOYMENT'
  | 'MONITORING';

export interface ErrorDetails {
  error_code: string;
  error_message: string;
  error_stage: PipelineStage;
  error_timestamp: Date;
  stack_trace?: string;
  recovery_suggestions: string[];
}

export interface PipelinePerformanceMetrics {
  total_execution_time: number; // seconds
  stage_execution_times: Record<string, number>;
  resource_utilization: ResourceUtilizationMetrics;
  data_processing_stats: DataProcessingStats;
  model_performance_stats: ModelPerformanceStats;
}

export interface ResourceUtilizationMetrics {
  peak_cpu_usage: number; // 0-100
  peak_memory_usage: number; // 0-100
  peak_gpu_usage?: number; // 0-100
  total_cpu_hours: number;
  total_memory_gb_hours: number;
  total_gpu_hours?: number;
}

export interface DataProcessingStats {
  total_records_processed: number;
  records_per_second: number;
  data_quality_score: number; // 0-100
  preprocessing_efficiency: number; // 0-100
}

export interface ModelPerformanceStats {
  training_accuracy: number;
  validation_accuracy: number;
  test_accuracy?: number;
  training_loss: number;
  validation_loss: number;
  convergence_epoch: number;
}

export interface ExecutionHistory {
  execution_id: string;
  execution_start: Date;
  execution_end?: Date;
  execution_status: 'SUCCESS' | 'FAILURE' | 'CANCELLED' | 'TIMEOUT';
  configuration_snapshot: any;
  results_summary: ExecutionResultsSummary;
  execution_logs: ExecutionLog[];
}

export interface ExecutionResultsSummary {
  model_performance: Record<string, number>;
  execution_metrics: Record<string, number>;
  data_insights: DataInsight[];
  recommendations: ExecutionRecommendation[];
}

export interface DataInsight {
  insight_type: 'DATA_QUALITY' | 'FEATURE_IMPORTANCE' | 'PATTERN_DISCOVERY' | 'ANOMALY_DETECTION';
  insight_description: string;
  confidence_score: number; // 0-1
  actionable: boolean;
}

export interface ExecutionRecommendation {
  recommendation_type: 'HYPERPARAMETER_TUNING' | 'FEATURE_ENGINEERING' | 'MODEL_SELECTION' | 'DATA_IMPROVEMENT';
  recommendation_description: string;
  expected_improvement: number; // 0-1
  implementation_effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ExecutionLog {
  timestamp: Date;
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  component: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * MLPipelineService
 * Phase 5: 多次元データ分析・機械学習パイプラインサービス
 */
export class MLPipelineService {
  private pipelines: Map<string, MLPipeline> = new Map();
  private execution_queue: ExecutionQueueItem[] = [];
  private active_executions: Map<string, PipelineExecution> = new Map();

  /**
   * 新しいMLパイプラインの作成
   */
  async createPipeline(
    pipeline_name: string,
    pipeline_type: PipelineType,
    configuration: PipelineConfiguration,
    created_by: string
  ): Promise<MLPipeline> {
    const pipeline_id = `mlpipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // データソースの検証
      await this.validateDataSources(configuration.data_sources);
      
      // パイプライン設定の最適化
      const optimized_config = await this.optimizePipelineConfiguration(configuration, pipeline_type);
      
      const pipeline: MLPipeline = {
        pipeline_id,
        pipeline_name,
        pipeline_type,
        data_sources: optimized_config.data_sources,
        preprocessing_steps: optimized_config.preprocessing_steps,
        feature_engineering: optimized_config.feature_engineering,
        model_configuration: optimized_config.model_configuration,
        training_configuration: optimized_config.training_configuration,
        evaluation_metrics: optimized_config.evaluation_metrics,
        deployment_config: optimized_config.deployment_config,
        pipeline_status: {
          current_stage: 'DATA_INGESTION',
          overall_progress: 0,
          stage_progress: {},
          execution_state: 'CREATED',
          performance_metrics: {
            total_execution_time: 0,
            stage_execution_times: {},
            resource_utilization: {
              peak_cpu_usage: 0,
              peak_memory_usage: 0,
              total_cpu_hours: 0,
              total_memory_gb_hours: 0
            },
            data_processing_stats: {
              total_records_processed: 0,
              records_per_second: 0,
              data_quality_score: 0,
              preprocessing_efficiency: 0
            },
            model_performance_stats: {
              training_accuracy: 0,
              validation_accuracy: 0,
              training_loss: 0,
              validation_loss: 0,
              convergence_epoch: 0
            }
          }
        },
        created_by,
        created_at: new Date(),
        last_updated: new Date(),
        execution_history: []
      };

      this.pipelines.set(pipeline_id, pipeline);
      return pipeline;

    } catch (error) {
      throw new Error(`MLパイプライン作成エラー: ${error}`);
    }
  }

  /**
   * パイプラインの実行
   */
  async executePipeline(
    pipeline_id: string,
    execution_options?: PipelineExecutionOptions
  ): Promise<PipelineExecutionResult> {
    const pipeline = this.pipelines.get(pipeline_id);
    if (!pipeline) {
      throw new Error('パイプラインが見つかりません');
    }

    const execution_id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    try {
      // 実行前チェック
      await this.preExecutionValidation(pipeline);
      
      // パイプライン実行の開始
      pipeline.pipeline_status.execution_state = 'RUNNING';
      pipeline.pipeline_status.overall_progress = 0;
      pipeline.last_updated = new Date();

      const execution_start = new Date();
      
      // 段階的実行
      const execution_result = await this.executeStages(pipeline, execution_options);
      
      const execution_end = new Date();
      
      // 実行履歴の更新
      const execution_record: ExecutionHistory = {
        execution_id,
        execution_start,
        execution_end,
        execution_status: execution_result.success ? 'SUCCESS' : 'FAILURE',
        configuration_snapshot: this.createConfigurationSnapshot(pipeline),
        results_summary: execution_result.results_summary,
        execution_logs: execution_result.execution_logs
      };
      
      pipeline.execution_history.push(execution_record);
      pipeline.pipeline_status.execution_state = execution_result.success ? 'COMPLETED' : 'FAILED';
      pipeline.last_updated = new Date();

      return execution_result;

    } catch (error) {
      pipeline.pipeline_status.execution_state = 'FAILED';
      pipeline.pipeline_status.error_details = {
        error_code: 'EXECUTION_ERROR',
        error_message: error.toString(),
        error_stage: pipeline.pipeline_status.current_stage,
        error_timestamp: new Date(),
        recovery_suggestions: await this.generateRecoverySuggestions(error, pipeline)
      };
      
      throw new Error(`パイプライン実行エラー: ${error}`);
    }
  }

  /**
   * ハイパーパラメータの自動最適化
   */
  async autoTuneHyperparameters(
    pipeline_id: string,
    optimization_config: HyperparameterOptimizationConfig
  ): Promise<HyperparameterOptimizationResult> {
    const pipeline = this.pipelines.get(pipeline_id);
    if (!pipeline) {
      throw new Error('パイプラインが見つかりません');
    }

    try {
      // 最適化空間の定義
      const search_space = await this.defineSearchSpace(pipeline, optimization_config);
      
      // 最適化アルゴリズムの選択と実行
      const optimization_result = await this.executeHyperparameterOptimization(
        pipeline,
        search_space,
        optimization_config
      );
      
      // 最適パラメータでパイプライン設定を更新
      await this.updatePipelineWithOptimalParameters(pipeline, optimization_result.optimal_parameters);
      
      return optimization_result;

    } catch (error) {
      throw new Error(`ハイパーパラメータ最適化エラー: ${error}`);
    }
  }

  /**
   * モデルの自動選択
   */
  async autoSelectModel(
    pipeline_id: string,
    model_selection_config: ModelSelectionConfig
  ): Promise<ModelSelectionResult> {
    const pipeline = this.pipelines.get(pipeline_id);
    if (!pipeline) {
      throw new Error('パイプラインが見つかりません');
    }

    try {
      // 候補モデルの生成
      const candidate_models = await this.generateCandidateModels(pipeline, model_selection_config);
      
      // モデルの評価と比較
      const evaluation_results = await this.evaluateCandidateModels(
        pipeline,
        candidate_models,
        model_selection_config
      );
      
      // 最適モデルの選択
      const selected_model = await this.selectOptimalModel(evaluation_results, model_selection_config);
      
      // パイプライン設定の更新
      await this.updatePipelineWithSelectedModel(pipeline, selected_model);
      
      return {
        selection_id: `selection_${Date.now()}`,
        selected_model,
        evaluation_results,
        selection_rationale: await this.generateSelectionRationale(selected_model, evaluation_results),
        confidence_score: await this.calculateSelectionConfidence(evaluation_results)
      };

    } catch (error) {
      throw new Error(`モデル自動選択エラー: ${error}`);
    }
  }

  /**
   * 特徴量の自動エンジニアリング
   */
  async autoFeatureEngineering(
    pipeline_id: string,
    feature_engineering_config: AutoFeatureEngineeringConfig
  ): Promise<FeatureEngineeringResult> {
    const pipeline = this.pipelines.get(pipeline_id);
    if (!pipeline) {
      throw new Error('パイプラインが見つかりません');
    }

    try {
      // データの探索的分析
      const data_analysis = await this.performExploratoryDataAnalysis(pipeline);
      
      // 特徴量生成戦略の決定
      const generation_strategies = await this.determineFeatureGenerationStrategies(
        data_analysis,
        feature_engineering_config
      );
      
      // 特徴量の自動生成
      const generated_features = await this.generateFeatures(pipeline, generation_strategies);
      
      // 特徴量の評価と選択
      const selected_features = await this.evaluateAndSelectFeatures(
        pipeline,
        generated_features,
        feature_engineering_config
      );
      
      // パイプライン設定の更新
      await this.updatePipelineWithNewFeatures(pipeline, selected_features);
      
      return {
        engineering_id: `feateng_${Date.now()}`,
        original_feature_count: data_analysis.original_feature_count,
        generated_feature_count: generated_features.length,
        selected_feature_count: selected_features.length,
        feature_importance_scores: await this.calculateFeatureImportance(selected_features),
        performance_improvement: await this.measurePerformanceImprovement(pipeline),
        execution_time: 0 // 実際の実行時間を設定
      };

    } catch (error) {
      throw new Error(`特徴量自動エンジニアリングエラー: ${error}`);
    }
  }

  /**
   * パイプラインの監視とアラート
   */
  async monitorPipeline(
    pipeline_id: string,
    monitoring_config: PipelineMonitoringConfig
  ): Promise<MonitoringSession> {
    const pipeline = this.pipelines.get(pipeline_id);
    if (!pipeline) {
      throw new Error('パイプラインが見つかりません');
    }

    try {
      const monitoring_session: MonitoringSession = {
        session_id: `monitor_${Date.now()}`,
        pipeline_id,
        monitoring_config,
        start_time: new Date(),
        monitoring_status: 'ACTIVE',
        collected_metrics: [],
        detected_anomalies: [],
        generated_alerts: [],
        performance_trends: []
      };

      // 監視メトリクスの収集開始
      await this.startMetricsCollection(monitoring_session);
      
      // 異常検知アルゴリズムの起動
      await this.startAnomalyDetection(monitoring_session);
      
      // アラートシステムの設定
      await this.configureAlerts(monitoring_session);
      
      return monitoring_session;

    } catch (error) {
      throw new Error(`パイプライン監視エラー: ${error}`);
    }
  }

  // プライベートヘルパーメソッド群

  private async validateDataSources(data_sources: DataSource[]): Promise<void> {
    for (const source of data_sources) {
      // データソースの接続テスト
      await this.testDataSourceConnection(source);
      
      // データ品質の評価
      await this.assessDataQuality(source);
      
      // スキーマの検証
      await this.validateDataSchema(source);
    }
  }

  private async optimizePipelineConfiguration(
    config: PipelineConfiguration,
    pipeline_type: PipelineType
  ): Promise<PipelineConfiguration> {
    // パイプラインタイプに基づく最適化
    const optimized_config = { ...config };
    
    // リソース配分の最適化
    optimized_config.resource_allocation = await this.optimizeResourceAllocation(config, pipeline_type);
    
    // 並列処理の設定
    optimized_config.parallel_processing = await this.configureParallelProcessing(config);
    
    return optimized_config;
  }

  private async executeStages(
    pipeline: MLPipeline,
    options?: PipelineExecutionOptions
  ): Promise<PipelineExecutionResult> {
    const execution_logs: ExecutionLog[] = [];
    let current_data: any = null;
    
    try {
      // データ取得
      pipeline.pipeline_status.current_stage = 'DATA_INGESTION';
      current_data = await this.executeDataIngestion(pipeline, execution_logs);
      pipeline.pipeline_status.stage_progress['DATA_INGESTION'] = 100;
      pipeline.pipeline_status.overall_progress = 15;

      // データ前処理
      pipeline.pipeline_status.current_stage = 'DATA_PREPROCESSING';
      current_data = await this.executeDataPreprocessing(pipeline, current_data, execution_logs);
      pipeline.pipeline_status.stage_progress['DATA_PREPROCESSING'] = 100;
      pipeline.pipeline_status.overall_progress = 30;

      // 特徴量エンジニアリング
      pipeline.pipeline_status.current_stage = 'FEATURE_ENGINEERING';
      current_data = await this.executeFeatureEngineering(pipeline, current_data, execution_logs);
      pipeline.pipeline_status.stage_progress['FEATURE_ENGINEERING'] = 100;
      pipeline.pipeline_status.overall_progress = 50;

      // モデル訓練
      pipeline.pipeline_status.current_stage = 'MODEL_TRAINING';
      const trained_model = await this.executeModelTraining(pipeline, current_data, execution_logs);
      pipeline.pipeline_status.stage_progress['MODEL_TRAINING'] = 100;
      pipeline.pipeline_status.overall_progress = 75;

      // モデル評価
      pipeline.pipeline_status.current_stage = 'MODEL_EVALUATION';
      const evaluation_results = await this.executeModelEvaluation(pipeline, trained_model, current_data, execution_logs);
      pipeline.pipeline_status.stage_progress['MODEL_EVALUATION'] = 100;
      pipeline.pipeline_status.overall_progress = 90;

      // デプロイメント（オプション）
      if (options?.deploy_model) {
        pipeline.pipeline_status.current_stage = 'MODEL_DEPLOYMENT';
        await this.executeModelDeployment(pipeline, trained_model, execution_logs);
        pipeline.pipeline_status.stage_progress['MODEL_DEPLOYMENT'] = 100;
      }

      pipeline.pipeline_status.overall_progress = 100;

      return {
        success: true,
        trained_model,
        evaluation_results,
        execution_logs,
        results_summary: {
          model_performance: evaluation_results.metrics,
          execution_metrics: {
            total_time: pipeline.pipeline_status.performance_metrics.total_execution_time,
            data_processed: pipeline.pipeline_status.performance_metrics.data_processing_stats.total_records_processed
          },
          data_insights: await this.extractDataInsights(current_data),
          recommendations: await this.generateExecutionRecommendations(evaluation_results)
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.toString(),
        execution_logs,
        results_summary: {
          model_performance: {},
          execution_metrics: {},
          data_insights: [],
          recommendations: []
        }
      };
    }
  }

  // その他のヘルパーメソッドは実装省略...
  private async testDataSourceConnection(source: DataSource): Promise<void> { }
  private async assessDataQuality(source: DataSource): Promise<void> { }
  private async validateDataSchema(source: DataSource): Promise<void> { }
  private async optimizeResourceAllocation(config: any, type: PipelineType): Promise<any> { return {}; }
  private async configureParallelProcessing(config: any): Promise<any> { return {}; }
  private async executeDataIngestion(pipeline: MLPipeline, logs: ExecutionLog[]): Promise<any> { return {}; }
  private async executeDataPreprocessing(pipeline: MLPipeline, data: any, logs: ExecutionLog[]): Promise<any> { return data; }
  private async executeFeatureEngineering(pipeline: MLPipeline, data: any, logs: ExecutionLog[]): Promise<any> { return data; }
  private async executeModelTraining(pipeline: MLPipeline, data: any, logs: ExecutionLog[]): Promise<any> { return {}; }
  private async executeModelEvaluation(pipeline: MLPipeline, model: any, data: any, logs: ExecutionLog[]): Promise<any> { return { metrics: {} }; }
  private async executeModelDeployment(pipeline: MLPipeline, model: any, logs: ExecutionLog[]): Promise<void> { }
  private async extractDataInsights(data: any): Promise<DataInsight[]> { return []; }
  private async generateExecutionRecommendations(results: any): Promise<ExecutionRecommendation[]> { return []; }
  private async preExecutionValidation(pipeline: MLPipeline): Promise<void> { }
  private createConfigurationSnapshot(pipeline: MLPipeline): any { return {}; }
  private async generateRecoverySuggestions(error: any, pipeline: MLPipeline): Promise<string[]> { return []; }
  private async defineSearchSpace(pipeline: MLPipeline, config: any): Promise<any> { return {}; }
  private async executeHyperparameterOptimization(pipeline: MLPipeline, space: any, config: any): Promise<any> { return {}; }
  private async updatePipelineWithOptimalParameters(pipeline: MLPipeline, params: any): Promise<void> { }
  private async generateCandidateModels(pipeline: MLPipeline, config: any): Promise<any[]> { return []; }
  private async evaluateCandidateModels(pipeline: MLPipeline, models: any[], config: any): Promise<any> { return {}; }
  private async selectOptimalModel(results: any, config: any): Promise<any> { return {}; }
  private async updatePipelineWithSelectedModel(pipeline: MLPipeline, model: any): Promise<void> { }
  private async generateSelectionRationale(model: any, results: any): Promise<string> { return ''; }
  private async calculateSelectionConfidence(results: any): Promise<number> { return 0.9; }
  private async performExploratoryDataAnalysis(pipeline: MLPipeline): Promise<any> { return {}; }
  private async determineFeatureGenerationStrategies(analysis: any, config: any): Promise<any[]> { return []; }
  private async generateFeatures(pipeline: MLPipeline, strategies: any[]): Promise<any[]> { return []; }
  private async evaluateAndSelectFeatures(pipeline: MLPipeline, features: any[], config: any): Promise<any[]> { return features; }
  private async updatePipelineWithNewFeatures(pipeline: MLPipeline, features: any[]): Promise<void> { }
  private async calculateFeatureImportance(features: any[]): Promise<any> { return {}; }
  private async measurePerformanceImprovement(pipeline: MLPipeline): Promise<number> { return 0.1; }
  private async startMetricsCollection(session: any): Promise<void> { }
  private async startAnomalyDetection(session: any): Promise<void> { }
  private async configureAlerts(session: any): Promise<void> { }
}

// 追加の型定義
interface PipelineConfiguration {
  data_sources: DataSource[];
  preprocessing_steps: PreprocessingStep[];
  feature_engineering: FeatureEngineering;
  model_configuration: ModelConfiguration;
  training_configuration: TrainingConfiguration;
  evaluation_metrics: EvaluationMetrics;
  deployment_config: DeploymentConfiguration;
  resource_allocation?: any;
  parallel_processing?: any;
}

interface PipelineExecutionOptions {
  deploy_model?: boolean;
  save_intermediate_results?: boolean;
  parallel_execution?: boolean;
  resource_limits?: ResourceConstraints;
}

interface PipelineExecutionResult {
  success: boolean;
  trained_model?: any;
  evaluation_results?: any;
  execution_logs: ExecutionLog[];
  results_summary: ExecutionResultsSummary;
  error?: string;
}

interface PipelineExecution {
  execution_id: string;
  pipeline_id: string;
  start_time: Date;
  current_stage: PipelineStage;
  progress: number;
}

interface ExecutionQueueItem {
  pipeline_id: string;
  priority: number;
  scheduled_time: Date;
  execution_options: PipelineExecutionOptions;
}

interface HyperparameterOptimizationConfig {
  optimization_budget: number;
  optimization_metric: string;
  search_algorithm: string;
  parallel_trials: number;
}

interface HyperparameterOptimizationResult {
  optimal_parameters: Record<string, any>;
  best_score: number;
  optimization_history: any[];
  convergence_analysis: any;
}

interface ModelSelectionConfig {
  candidate_algorithms: string[];
  evaluation_protocol: string;
  selection_criteria: string[];
  resource_constraints: ResourceConstraints;
}

interface ModelSelectionResult {
  selection_id: string;
  selected_model: any;
  evaluation_results: any;
  selection_rationale: string;
  confidence_score: number;
}

interface AutoFeatureEngineeringConfig {
  max_features: number;
  generation_strategies: string[];
  evaluation_metric: string;
  computation_budget: number;
}

interface FeatureEngineeringResult {
  engineering_id: string;
  original_feature_count: number;
  generated_feature_count: number;
  selected_feature_count: number;
  feature_importance_scores: any;
  performance_improvement: number;
  execution_time: number;
}

interface PipelineMonitoringConfig {
  monitoring_frequency: number;
  alert_thresholds: Record<string, number>;
  anomaly_detection_config: any;
  notification_settings: any;
}

interface MonitoringSession {
  session_id: string;
  pipeline_id: string;
  monitoring_config: PipelineMonitoringConfig;
  start_time: Date;
  monitoring_status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  collected_metrics: any[];
  detected_anomalies: any[];
  generated_alerts: any[];
  performance_trends: any[];
}

export default MLPipelineService;