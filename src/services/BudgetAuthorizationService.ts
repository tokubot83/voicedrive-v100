// 予算上限と承認権限の連動サービス - 新マッピング対応
import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';

export interface BudgetApprovalRequirement {
  projectScope: ProjectScope;
  budgetLimit: number;
  requiredApprovalLevel: PermissionLevel;
  approvalChain: PermissionLevel[];
  description: string;
}

export interface BudgetValidationResult {
  isValid: boolean;
  requiredLevel: PermissionLevel;
  budgetLimit: number;
  errorMessage?: string;
}

export class BudgetAuthorizationService {
  // 新マッピングに基づく予算承認要件定義
  private readonly budgetApprovalRequirements: BudgetApprovalRequirement[] = [
    {
      projectScope: ProjectScope.TEAM,
      budgetLimit: 50000, // 5万円
      requiredApprovalLevel: PermissionLevel.LEVEL_2,
      approvalChain: [PermissionLevel.LEVEL_2, PermissionLevel.LEVEL_3, PermissionLevel.LEVEL_5],
      description: 'チームレベルプロジェクト（部門内改善提案、業務効率化）'
    },
    {
      projectScope: ProjectScope.DEPARTMENT,
      budgetLimit: 200000, // 20万円
      requiredApprovalLevel: PermissionLevel.LEVEL_3,
      approvalChain: [PermissionLevel.LEVEL_3, PermissionLevel.LEVEL_4, PermissionLevel.LEVEL_5],
      description: '部門レベルプロジェクト（部門横断的改善、設備導入）'
    },
    {
      projectScope: ProjectScope.FACILITY,
      budgetLimit: 10000000, // 1000万円
      requiredApprovalLevel: PermissionLevel.LEVEL_4,
      approvalChain: [
        PermissionLevel.LEVEL_4, // 所属施設のレベル4全員
        PermissionLevel.LEVEL_5,
        PermissionLevel.LEVEL_6,
        PermissionLevel.LEVEL_7,
        PermissionLevel.LEVEL_12
      ],
      description: '施設レベルプロジェクト（施設全体の改善、システム導入）'
    },
    {
      projectScope: ProjectScope.ORGANIZATION,
      budgetLimit: 20000000, // 2000万円
      requiredApprovalLevel: PermissionLevel.LEVEL_5,
      approvalChain: [
        PermissionLevel.LEVEL_5, // 各施設のレベル5全員
        PermissionLevel.LEVEL_6, // 各施設のレベル6全員
        PermissionLevel.LEVEL_7, // 各施設のレベル7全員
        PermissionLevel.LEVEL_12,
        PermissionLevel.LEVEL_13
      ],
      description: '法人レベルプロジェクト（複数施設にわたる戦略的プロジェクト）'
    },
    {
      projectScope: ProjectScope.STRATEGIC,
      budgetLimit: -1, // 無制限
      requiredApprovalLevel: PermissionLevel.LEVEL_13,
      approvalChain: [
        PermissionLevel.LEVEL_12, // レビュー
        PermissionLevel.LEVEL_13, // レベル承認
        PermissionLevel.LEVEL_13  // 最終承認
      ],
      description: '法人戦略的プロジェクト（経営戦略、M&A、大規模投資）'
    }
  ];

  // 人財統括本部特別カテゴリの予算要件
  private readonly hrSpecialBudgetRequirements: Record<string, BudgetApprovalRequirement> = {
    'interview-system': {
      projectScope: ProjectScope.ORGANIZATION, // 特別扱い
      budgetLimit: 5000000, // 500万円（面談システム関連）
      requiredApprovalLevel: PermissionLevel.LEVEL_10,
      approvalChain: [
        PermissionLevel.LEVEL_10, // 各部門長全員
        PermissionLevel.LEVEL_11, // レビュー
        PermissionLevel.LEVEL_12  // 最終承認
      ],
      description: '人財統括本部：面談システム関連プロジェクト'
    },
    'training-career': {
      projectScope: ProjectScope.ORGANIZATION,
      budgetLimit: 3000000, // 300万円（研修・キャリア支援）
      requiredApprovalLevel: PermissionLevel.LEVEL_10,
      approvalChain: [
        PermissionLevel.LEVEL_10,
        PermissionLevel.LEVEL_11,
        PermissionLevel.LEVEL_12
      ],
      description: '人財統括本部：研修・キャリア支援プロジェクト'
    },
    'hr-policy': {
      projectScope: ProjectScope.ORGANIZATION,
      budgetLimit: 2000000, // 200万円（人事政策）
      requiredApprovalLevel: PermissionLevel.LEVEL_10,
      approvalChain: [
        PermissionLevel.LEVEL_10,
        PermissionLevel.LEVEL_11,
        PermissionLevel.LEVEL_12
      ],
      description: '人財統括本部：人事政策プロジェクト'
    },
    'strategic-hr': {
      projectScope: ProjectScope.STRATEGIC,
      budgetLimit: -1, // 無制限（戦略的人事企画）
      requiredApprovalLevel: PermissionLevel.LEVEL_10,
      approvalChain: [
        PermissionLevel.LEVEL_10,
        PermissionLevel.LEVEL_11,
        PermissionLevel.LEVEL_12
      ],
      description: '人財統括本部：戦略的人事企画プロジェクト'
    }
  };

  /**
   * プロジェクトスコープに基づく予算上限を取得
   */
  getBudgetLimit(scope: ProjectScope): number {
    const requirement = this.budgetApprovalRequirements.find(
      req => req.projectScope === scope
    );
    return requirement?.budgetLimit || 0;
  }

  /**
   * プロジェクトスコープに基づく必要承認レベルを取得
   */
  getRequiredApprovalLevel(scope: ProjectScope): PermissionLevel {
    const requirement = this.budgetApprovalRequirements.find(
      req => req.projectScope === scope
    );
    return requirement?.requiredApprovalLevel || PermissionLevel.LEVEL_1;
  }

  /**
   * プロジェクトスコープに基づく承認チェーンを取得
   */
  getApprovalChain(scope: ProjectScope): PermissionLevel[] {
    const requirement = this.budgetApprovalRequirements.find(
      req => req.projectScope === scope
    );
    return requirement?.approvalChain || [];
  }

  /**
   * 人財統括本部特別カテゴリの予算要件を取得
   */
  getHRSpecialBudgetRequirement(category: string): BudgetApprovalRequirement | null {
    return this.hrSpecialBudgetRequirements[category] || null;
  }

  /**
   * 予算額とユーザー権限の妥当性をチェック
   */
  validateBudgetAuthorization(
    requestedBudget: number,
    userPermissionLevel: PermissionLevel,
    projectScope: ProjectScope,
    isHRSpecial?: boolean,
    hrCategory?: string
  ): BudgetValidationResult {
    let requirement: BudgetApprovalRequirement | null = null;

    // 人財統括本部特別カテゴリの場合
    if (isHRSpecial && hrCategory) {
      requirement = this.getHRSpecialBudgetRequirement(hrCategory);
      if (!requirement) {
        return {
          isValid: false,
          requiredLevel: PermissionLevel.LEVEL_1,
          budgetLimit: 0,
          errorMessage: `無効な人財統括本部カテゴリ: ${hrCategory}`
        };
      }
    } else {
      // 通常のプロジェクトスコープの場合
      requirement = this.budgetApprovalRequirements.find(
        req => req.projectScope === projectScope
      );
      if (!requirement) {
        return {
          isValid: false,
          requiredLevel: PermissionLevel.LEVEL_1,
          budgetLimit: 0,
          errorMessage: `無効なプロジェクトスコープ: ${projectScope}`
        };
      }
    }

    // 予算上限チェック（無制限の場合は-1）
    if (requirement.budgetLimit !== -1 && requestedBudget > requirement.budgetLimit) {
      return {
        isValid: false,
        requiredLevel: requirement.requiredApprovalLevel,
        budgetLimit: requirement.budgetLimit,
        errorMessage: `予算上限を超過しています。上限: ${requirement.budgetLimit.toLocaleString()}円, 要求: ${requestedBudget.toLocaleString()}円`
      };
    }

    // 権限レベルチェック
    if (userPermissionLevel < requirement.requiredApprovalLevel) {
      return {
        isValid: false,
        requiredLevel: requirement.requiredApprovalLevel,
        budgetLimit: requirement.budgetLimit,
        errorMessage: `承認権限が不足しています。必要レベル: ${requirement.requiredApprovalLevel}, 現在レベル: ${userPermissionLevel}`
      };
    }

    return {
      isValid: true,
      requiredLevel: requirement.requiredApprovalLevel,
      budgetLimit: requirement.budgetLimit
    };
  }

  /**
   * プロジェクトスコープから予算範囲の説明を取得
   */
  getBudgetDescription(scope: ProjectScope): string {
    const requirement = this.budgetApprovalRequirements.find(
      req => req.projectScope === scope
    );
    if (!requirement) return '不明なプロジェクトスコープ';

    const budgetText = requirement.budgetLimit === -1 
      ? '無制限' 
      : `${requirement.budgetLimit.toLocaleString()}円以下`;

    return `${requirement.description} (予算上限: ${budgetText})`;
  }

  /**
   * 緊急オーバーライド権限の確認
   */
  canExecuteEmergencyOverride(userPermissionLevel: PermissionLevel): boolean {
    // レベル12以上は緊急オーバーライド権限を持つ
    return userPermissionLevel >= PermissionLevel.LEVEL_12;
  }

  /**
   * 全承認要件の一覧を取得
   */
  getAllBudgetRequirements(): BudgetApprovalRequirement[] {
    return [...this.budgetApprovalRequirements];
  }

  /**
   * 人財統括本部特別カテゴリ一覧を取得
   */
  getHRSpecialCategories(): Record<string, BudgetApprovalRequirement> {
    return { ...this.hrSpecialBudgetRequirements };
  }
}

export default BudgetAuthorizationService;