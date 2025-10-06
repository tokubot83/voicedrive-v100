/**
 * 議題提案書ジェネレーター
 * 投稿データから客観的な議題提案書を自動生成
 */

import { Post, User } from '../types';
import { ProposalDocument, ProposalDocumentStatus } from '../types/proposalDocument';
import { AgendaLevel } from '../types/committee';
import {
  analyzeVotes,
  analyzeComments,
  analyzeRelatedInfo,
  generateProposalSummary,
  generateBackground,
  generateExpectedEffects,
  generateConcerns,
  generateCounterMeasures
} from '../utils/proposalAnalyzer';
import { proposalAuditService } from './ProposalAuditService';
import { proposalPermissionService } from './ProposalPermissionService';

export class ProposalDocumentGenerator {
  private static instance: ProposalDocumentGenerator;
  private documents: Map<string, ProposalDocument> = new Map();

  private constructor() {}

  public static getInstance(): ProposalDocumentGenerator {
    if (!ProposalDocumentGenerator.instance) {
      ProposalDocumentGenerator.instance = new ProposalDocumentGenerator();
    }
    return ProposalDocumentGenerator.instance;
  }

  /**
   * 投稿から議題提案書を自動生成
   */
  public generateDocument(
    post: Post,
    agendaLevel: AgendaLevel,
    createdBy: User
  ): ProposalDocument {
    // データ分析
    const voteAnalysis = analyzeVotes(post);
    const commentAnalysis = analyzeComments(post);
    const relatedInfo = analyzeRelatedInfo(post);

    // 議題レベルに応じた提出先委員会を取得
    const responsibility = proposalPermissionService.getResponsibility(agendaLevel);
    const targetCommittee = responsibility?.targetCommittee || '未定';

    // 提案書作成
    const documentId = `doc-${post.id}-${Date.now()}`;
    const now = new Date();

    const document: ProposalDocument = {
      id: documentId,
      postId: post.id,
      post,

      // 基本情報
      title: this.generateTitle(post),
      agendaLevel,
      targetCommittee,  // 議題レベルに応じた委員会を自動設定
      createdBy,
      createdDate: now,
      lastModifiedDate: now,
      status: 'draft',

      // 提案内容（自動生成）
      summary: generateProposalSummary(post),
      background: generateBackground(post, voteAnalysis),
      objectives: this.generateObjectives(post),
      expectedEffects: generateExpectedEffects(post, commentAnalysis),
      concerns: generateConcerns(commentAnalysis),
      counterMeasures: generateCounterMeasures(commentAnalysis),

      // データ分析
      voteAnalysis,
      commentAnalysis,
      relatedInfo,

      // 透明性ログ
      auditLog: []
    };

    // ドキュメントを保存
    this.documents.set(documentId, document);

    // 監査ログ記録
    proposalAuditService.logCreated(documentId, createdBy, post.id);
    document.auditLog.push(proposalAuditService.getLogs(documentId)[0]);

    console.log(`[ProposalDocument] 議題提案書生成完了: ${documentId}`, {
      title: document.title,
      agendaLevel,
      createdBy: createdBy.name
    });

    return document;
  }

  /**
   * タイトル生成
   */
  private generateTitle(post: Post): string {
    const content = post.content;
    const proposalTypeLabels = {
      operational: '業務改善',
      communication: 'コミュニケーション改善',
      innovation: '革新的提案',
      strategic: '戦略的提案'
    };

    const typeLabel = post.proposalType
      ? proposalTypeLabels[post.proposalType]
      : '提案';

    // 内容の最初の30文字をタイトルに
    const summary = content.length > 30
      ? content.substring(0, 30) + '...'
      : content;

    return `【${typeLabel}】${summary}`;
  }

  /**
   * 目的を生成
   */
  private generateObjectives(post: Post): string {
    const proposalTypeObjectives = {
      operational: '業務効率化と職員の負担軽減',
      communication: '部署間の情報共有の円滑化',
      innovation: '新しいサービスや取り組みの創出',
      strategic: '組織の戦略的目標の達成'
    };

    return post.proposalType
      ? proposalTypeObjectives[post.proposalType]
      : '組織の改善と職員の働きやすさ向上';
  }

  /**
   * 議題提案書を取得
   */
  public getDocument(documentId: string): ProposalDocument | undefined {
    return this.documents.get(documentId);
  }

  /**
   * 投稿IDから議題提案書を検索
   */
  public findDocumentByPostId(postId: string): ProposalDocument | undefined {
    return Array.from(this.documents.values()).find(doc => doc.postId === postId);
  }

  /**
   * 議題提案書を更新
   */
  public updateDocument(
    documentId: string,
    updates: Partial<ProposalDocument>,
    updatedBy: User
  ): ProposalDocument | undefined {
    const document = this.documents.get(documentId);
    if (!document) return undefined;

    // 変更されたフィールドを記録
    const changedFields = Object.keys(updates).filter(
      key => key !== 'lastModifiedDate' && key !== 'auditLog'
    );

    // 更新
    const updatedDocument: ProposalDocument = {
      ...document,
      ...updates,
      lastModifiedDate: new Date()
    };

    this.documents.set(documentId, updatedDocument);

    // 監査ログ記録
    proposalAuditService.logEdited(documentId, updatedBy, changedFields);
    updatedDocument.auditLog = proposalAuditService.getLogs(documentId);

    return updatedDocument;
  }

  /**
   * ステータスを更新
   */
  public updateStatus(
    documentId: string,
    status: ProposalDocumentStatus,
    user: User
  ): ProposalDocument | undefined {
    return this.updateDocument(documentId, { status }, user);
  }

  /**
   * 管理職による補足を追加
   */
  public addManagerNotes(
    documentId: string,
    notes: string,
    user: User
  ): ProposalDocument | undefined {
    return this.updateDocument(documentId, { managerNotes: notes }, user);
  }

  /**
   * 推奨レベルを設定
   */
  public setRecommendationLevel(
    documentId: string,
    level: ProposalDocument['recommendationLevel'],
    user: User
  ): ProposalDocument | undefined {
    return this.updateDocument(documentId, { recommendationLevel: level }, user);
  }

  /**
   * 委員会に提出
   */
  public submitToCommittee(
    documentId: string,
    targetCommittee: string,
    submittedBy: User
  ): ProposalDocument | undefined {
    const document = this.documents.get(documentId);
    if (!document) return undefined;

    const updated = this.updateDocument(
      documentId,
      {
        status: 'submitted',
        targetCommittee,
        submittedDate: new Date(),
        submittedBy
      },
      submittedBy
    );

    // 監査ログ記録
    proposalAuditService.logSubmitted(documentId, submittedBy, targetCommittee);
    if (updated) {
      updated.auditLog = proposalAuditService.getLogs(documentId);
    }

    return updated;
  }

  /**
   * レビュー完了
   */
  public markAsReviewed(
    documentId: string,
    reviewer: User,
    notes?: string
  ): ProposalDocument | undefined {
    const updated = this.updateDocument(
      documentId,
      { status: 'under_review' },
      reviewer
    );

    // 監査ログ記録
    proposalAuditService.logReviewed(documentId, reviewer, notes);
    if (updated) {
      updated.auditLog = proposalAuditService.getLogs(documentId);
    }

    return updated;
  }

  /**
   * 提出準備完了
   */
  public markAsReady(
    documentId: string,
    user: User
  ): ProposalDocument | undefined {
    return this.updateDocument(
      documentId,
      { status: 'ready' },
      user
    );
  }

  /**
   * 全ドキュメントを取得
   */
  public getAllDocuments(): ProposalDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * ユーザーが作成したドキュメントを取得
   */
  public getDocumentsByUser(userId: string): ProposalDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.createdBy.id === userId)
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  /**
   * 議題レベル別にドキュメントを取得
   */
  public getDocumentsByAgendaLevel(level: AgendaLevel): ProposalDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.agendaLevel === level)
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  /**
   * ステータス別にドキュメントを取得
   */
  public getDocumentsByStatus(status: ProposalDocumentStatus): ProposalDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.status === status)
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  /**
   * ドキュメントをクリア（テスト用）
   */
  public clearDocuments(): void {
    this.documents.clear();
  }
}

export const proposalDocumentGenerator = ProposalDocumentGenerator.getInstance();
