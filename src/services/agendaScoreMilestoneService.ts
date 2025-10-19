/**
 * 議題スコアマイルストーン通知サービス
 * 30点/50点/100点到達時の自動通知
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 30点到達時の通知
 */
export async function notify30PointsReached(post: any): Promise<void> {
  console.log(`[notify30PointsReached] postId=${post.id}, score=${post.agendaScore}`);

  // 投稿ステータス更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaLevel: 'dept_review',
      agendaStatus: 'UNDER_DEPT_REVIEW',
      updatedAt: new Date()
    }
  });

  // 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'score_milestone',
      title: '投稿が30点に到達しました',
      message: `あなたの投稿が30点を突破し、部署内で本格的な検討が始まりました。50点に達すると主任の判断対象になります。`,
      relatedPostId: post.id
    }
  });

  // 主任への通知（事前アラート）
  const supervisors = await prisma.user.findMany({
    where: {
      department: post.department,
      permissionLevel: { gte: 5, lt: 7 },
      isRetired: false
    }
  });

  await Promise.all(supervisors.map(supervisor =>
    prisma.notification.create({
      data: {
        userId: supervisor.id,
        type: 'dept_review_alert',
        title: '部署内で注目されている投稿があります',
        message: `「${post.content.substring(0, 50)}...」が30点を突破しました。50点に達すると、あなたの承認/却下判断が必要になります。事前に内容を確認しておくことをお勧めします。`,
        relatedPostId: post.id
      }
    })
  ));

  // 師長への通知（情報共有）
  const managers = await prisma.user.findMany({
    where: {
      department: post.department,
      permissionLevel: { gte: 7, lt: 9 },
      isRetired: false
    }
  });

  await Promise.all(managers.map(manager =>
    prisma.notification.create({
      data: {
        userId: manager.id,
        type: 'dept_review_alert',
        title: '部署内で注目されている投稿があります',
        message: `「${post.content.substring(0, 50)}...」が30点を突破しました。50点に達すると主任の推薦対象になり、その後あなたの最終判断が必要になります。`,
        relatedPostId: post.id
      }
    })
  ));

  console.log(`[notify30PointsReached] 完了: 主任=${supervisors.length}件, 師長=${managers.length}件`);
}

/**
 * 50点到達時の通知
 */
export async function notify50PointsReached(post: any): Promise<void> {
  console.log(`[notify50PointsReached] postId=${post.id}, score=${post.agendaScore}`);

  // 投稿ステータス更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaLevel: 'dept_agenda',
      agendaStatus: 'PENDING_SUPERVISOR_REVIEW',
      updatedAt: new Date()
    }
  });

  // 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'score_milestone',
      title: '投稿が50点に到達しました',
      message: `あなたの投稿が50点を突破し、部署議題候補になりました。主任の判断をお待ちください。`,
      relatedPostId: post.id
    }
  });

  // 主任への通知（判断要求）
  const supervisors = await prisma.user.findMany({
    where: {
      department: post.department,
      permissionLevel: { gte: 5, lt: 7 },
      isRetired: false
    }
  });

  await Promise.all(supervisors.map(supervisor =>
    prisma.notification.create({
      data: {
        userId: supervisor.id,
        type: 'review_required',
        title: '部署議題の承認/却下をお願いします',
        message: `「${post.content.substring(0, 50)}...」が50点を突破しました。部署議題として師長に推薦するか、却下するかを判断してください。`,
        relatedPostId: post.id,
        actionUrl: `/proposal-management/review/${post.id}`
      }
    })
  ));

  // 師長への通知（情報共有）
  const managers = await prisma.user.findMany({
    where: {
      department: post.department,
      permissionLevel: { gte: 7, lt: 9 },
      isRetired: false
    }
  });

  await Promise.all(managers.map(manager =>
    prisma.notification.create({
      data: {
        userId: manager.id,
        type: 'dept_review_alert',
        title: '部署議題候補が発生しました',
        message: `「${post.content.substring(0, 50)}...」が50点を突破しました。主任の判断後、必要に応じてあなたの最終判断が必要になります。`,
        relatedPostId: post.id
      }
    })
  ));

  console.log(`[notify50PointsReached] 完了: 主任=${supervisors.length}件, 師長=${managers.length}件`);
}

/**
 * 100点到達時の通知
 */
export async function notify100PointsReached(post: any): Promise<void> {
  console.log(`[notify100PointsReached] postId=${post.id}, score=${post.agendaScore}`);

  // 投稿ステータス更新
  await prisma.post.update({
    where: { id: post.id },
    data: {
      agendaLevel: 'facility_agenda',
      agendaStatus: 'PENDING_DEPUTY_DIRECTOR_REVIEW',
      visibility: 'facility', // 施設内全職員に公開
      updatedAt: new Date()
    }
  });

  // ProposalDocument自動生成
  const document = await prisma.proposalDocument.create({
    data: {
      postId: post.id,
      title: post.content.substring(0, 100),
      background: `この提案は施設内で100点を突破し、施設議題候補になりました。`,
      objectives: '（記入してください）',
      expectedEffects: '（記入してください）',
      implementationPlan: '（記入してください）',
      status: 'draft',
      creatorId: post.authorId
    }
  });

  // 投稿者への通知
  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: 'score_milestone',
      title: '投稿が100点に到達しました',
      message: `あなたの投稿が100点を突破し、施設議題になりました。副看護部長/看護部長の判断をお待ちください。`,
      relatedPostId: post.id
    }
  });

  // 副看護部長/看護部長への通知（判断要求）
  const deputyDirectors = await prisma.user.findMany({
    where: {
      permissionLevel: { gte: 8, lt: 10 },
      facilityId: post.facilityId,
      isRetired: false
    }
  });

  await Promise.all(deputyDirectors.map(director =>
    prisma.notification.create({
      data: {
        userId: director.id,
        type: 'review_required',
        title: '施設議題の承認/却下をお願いします',
        message: `「${post.content.substring(0, 50)}...」が100点を突破しました。委員会提出の承認/却下を判断してください。`,
        relatedPostId: post.id,
        actionUrl: `/proposal-management/review/${post.id}`
      }
    })
  ));

  // 施設内全職員への通知
  const facilityUsers = await prisma.user.findMany({
    where: {
      facilityId: post.facilityId,
      isRetired: false
    },
    select: { id: true }
  });

  await Promise.all(facilityUsers.map(user =>
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'facility_agenda_announced',
        title: '施設議題到達のお知らせ',
        message: `「${post.content.substring(0, 50)}...」が施設議題になりました。`,
        relatedPostId: post.id
      }
    })
  ));

  console.log(`[notify100PointsReached] 完了: documentId=${document.id}, 管理者=${deputyDirectors.length}件, 全体=${facilityUsers.length}件`);
}

/**
 * スコア更新時のチェック
 * 投票処理から呼び出される
 */
export async function checkScoreMilestones(postId: string, oldScore: number, newScore: number): Promise<void> {
  console.log(`[checkScoreMilestones] postId=${postId}, ${oldScore} → ${newScore}`);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true } }
    }
  });

  if (!post) {
    console.warn(`[checkScoreMilestones] 投稿が見つかりません: postId=${postId}`);
    return;
  }

  // 100点到達
  if (newScore >= 100 && oldScore < 100) {
    await notify100PointsReached(post);
  }
  // 50点到達
  else if (newScore >= 50 && oldScore < 50) {
    await notify50PointsReached(post);
  }
  // 30点到達
  else if (newScore >= 30 && oldScore < 30) {
    await notify30PointsReached(post);
  }
}
