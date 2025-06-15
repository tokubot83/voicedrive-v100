// 4カテゴリ対応通知サービス拡張
import { NotificationService, NotificationUrgency, NotificationType } from './NotificationService';

export type ProposalCategory = 'operational' | 'communication' | 'innovation' | 'strategic';

export interface CategoryNotificationData {
  category: ProposalCategory;
  title: string;
  deadline: Date;
  postId?: string;
  projectId?: string;
}

export class CategoryNotificationService extends NotificationService {
  private static categoryInstance: CategoryNotificationService;

  public static getInstance(): CategoryNotificationService {
    if (!CategoryNotificationService.categoryInstance) {
      CategoryNotificationService.categoryInstance = new CategoryNotificationService();
    }
    return CategoryNotificationService.categoryInstance;
  }

  // カテゴリ別投票通知を作成
  async createCategoryVoteNotification(
    userId: string,
    data: CategoryNotificationData
  ): Promise<void> {
    const templateName = `${data.category}_vote`;
    const urgency = this.determineCategoryUrgency(data.category, data.deadline);
    
    await this.createActionableNotification(userId, 'VOTE_REQUIRED', {
      title: this.getCategoryNotificationTitle(data.category, 'vote'),
      message: `${data.title}への投票をお願いします`,
      dueDate: data.deadline,
      actions: [
        {
          id: 'vote',
          label: '投票する',
          type: 'primary',
          action: 'vote'
        }
      ],
      metadata: {
        postId: data.postId,
        category: data.category
      }
    });
  }

  // カテゴリ別承認通知を作成
  async createCategoryApprovalNotification(
    userId: string,
    data: CategoryNotificationData
  ): Promise<void> {
    const urgency = this.determineCategoryUrgency(data.category, data.deadline);
    
    await this.createActionableNotification(userId, 'APPROVAL_REQUIRED', {
      title: this.getCategoryNotificationTitle(data.category, 'approval'),
      message: `${data.title}の承認が必要です`,
      dueDate: data.deadline,
      actions: [
        {
          id: 'approve',
          label: '承認',
          type: 'primary',
          action: 'approve'
        },
        {
          id: 'reject',
          label: '却下',
          type: 'danger',
          action: 'reject',
          requiresComment: true
        }
      ],
      metadata: {
        projectId: data.projectId,
        category: data.category
      }
    });
  }

  // カテゴリ別メンバー選定通知を作成
  async createCategoryMemberSelectionNotification(
    userId: string,
    data: CategoryNotificationData & { role: string }
  ): Promise<void> {
    const urgency = this.determineCategoryUrgency(data.category, data.deadline);
    
    await this.createActionableNotification(userId, 'MEMBER_SELECTION', {
      title: this.getCategoryNotificationTitle(data.category, 'selection'),
      message: `${data.title}のメンバーとして${data.role}への参加が求められています`,
      dueDate: data.deadline,
      actions: [
        {
          id: 'participate',
          label: '参加する',
          type: 'primary',
          action: 'participate'
        },
        {
          id: 'decline',
          label: '辞退する',
          type: 'secondary',
          action: 'decline',
          requiresComment: true
        }
      ],
      metadata: {
        projectId: data.projectId,
        category: data.category
      }
    });
  }

  // カテゴリ別の緊急度判定
  private determineCategoryUrgency(category: ProposalCategory, dueDate: Date): NotificationUrgency {
    const hoursUntilDue = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60);
    
    // カテゴリ別の緊急度しきい値
    const urgencyThresholds = {
      operational: { urgent: 6, high: 24 },     // 業務改善：迅速対応
      communication: { urgent: 4, high: 48 },  // コミュニケーション：調整時間考慮
      innovation: { urgent: 24, high: 72 },    // イノベーション：検討時間重視
      strategic: { urgent: 72, high: 168 }     // 戦略：十分な検討時間
    };
    
    const thresholds = urgencyThresholds[category];
    
    if (hoursUntilDue < thresholds.urgent) return 'URGENT';
    if (hoursUntilDue < thresholds.high) return 'HIGH';
    return 'NORMAL';
  }

  // カテゴリ別通知タイトル生成
  private getCategoryNotificationTitle(
    category: ProposalCategory, 
    type: 'vote' | 'approval' | 'selection'
  ): string {
    const categoryTitles = {
      operational: {
        vote: '🏥 業務改善の投票依頼',
        approval: '🏥 業務改善の承認依頼',
        selection: '🏥 業務改善メンバー募集'
      },
      communication: {
        vote: '👥 コミュニケーション改善の投票依頼',
        approval: '👥 コミュニケーション改善の承認依頼',
        selection: '👥 コミュニケーション改善メンバー募集'
      },
      innovation: {
        vote: '💡 イノベーション提案の投票依頼',
        approval: '💡 イノベーション提案の承認依頼',
        selection: '💡 イノベーション提案メンバー募集'
      },
      strategic: {
        vote: '🎯 戦略提案の投票依頼（管理職向け）',
        approval: '🎯 戦略提案の承認依頼（管理職向け）',
        selection: '🎯 戦略提案メンバー募集（管理職向け）'
      }
    };
    
    return categoryTitles[category][type];
  }

  // 通知テンプレート拡張（4カテゴリ対応）
  getCategoryNotificationTemplate(category: ProposalCategory, type: string, data: any): {
    subject: string;
    body: string;
  } {
    const templates: Record<string, (data: any) => { subject: string; body: string }> = {
      // 業務改善
      operational_vote: (data) => ({
        subject: '🏥 業務改善の投票依頼',
        body: `業務改善案「${data.title}」への投票をお願いします。\n期限: ${data.deadline}\n\n診療・介護業務の改善により、患者様・利用者様のサービス向上を目指します。`
      }),
      operational_approval: (data) => ({
        subject: '🏥 業務改善の承認依頼',
        body: `業務改善案「${data.title}」の承認をお願いします。\n期限: ${data.deadline}`
      }),
      
      // コミュニケーション
      communication_vote: (data) => ({
        subject: '👥 コミュニケーション改善の投票依頼',
        body: `職場環境改善案「${data.title}」への投票をお願いします。\n期限: ${data.deadline}\n\n職場環境・福利厚生・人間関係の改善を通じて、より良い職場づくりを目指します。`
      }),
      communication_approval: (data) => ({
        subject: '👥 コミュニケーション改善の承認依頼',
        body: `職場環境改善案「${data.title}」の承認をお願いします。\n期限: ${data.deadline}`
      }),
      
      // イノベーション
      innovation_vote: (data) => ({
        subject: '💡 イノベーション提案の投票依頼',
        body: `革新的提案「${data.title}」への投票をお願いします。\n期限: ${data.deadline}\n\n新技術導入・新サービス開発・制度改革などの革新的な取り組みです。`
      }),
      innovation_approval: (data) => ({
        subject: '💡 イノベーション提案の承認依頼',
        body: `革新的提案「${data.title}」の承認をお願いします。\n期限: ${data.deadline}`
      }),
      
      // 戦略提案
      strategic_vote: (data) => ({
        subject: '🎯 戦略提案の投票依頼（管理職向け）',
        body: `戦略提案「${data.title}」への投票をお願いします。\n期限: ${data.deadline}\n\n組織運営・経営戦略・事業展開に関する管理職向けの重要な提案です。`
      }),
      strategic_approval: (data) => ({
        subject: '🎯 戦略提案の承認依頼（管理職向け）',
        body: `戦略提案「${data.title}」の承認をお願いします。\n期限: ${data.deadline}`
      })
    };
    
    const templateKey = `${category}_${type}`;
    const template = templates[templateKey];
    return template ? template(data) : { subject: '', body: '' };
  }
}

export default CategoryNotificationService;