/**
 * 最小限のPOST /api/posts テスト
 * 外部キー制約エラーのデバッグ用
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function simplePostTest() {
  try {
    console.log('🔍 Step 1: ユーザーを確認');
    const user = await prisma.user.findFirst({
      where: { isRetired: false }
    });

    if (!user) {
      console.error('❌ ユーザーが見つかりません');
      return;
    }

    console.log('✅ ユーザー発見:', user.id, user.name);

    console.log('\n🔍 Step 2: 最小限のPost作成を試行');
    const post = await prisma.post.create({
      data: {
        type: 'improvement',
        content: 'テスト投稿 - 外部キー制約デバッグ用',
        authorId: user.id,
        anonymityLevel: 'real_name',
        status: 'active',
        moderationStatus: 'pending'
      }
    });

    console.log('✅ 投稿作成成功!');
    console.log('   投稿ID:', post.id);
    console.log('   コンテンツ:', post.content);

    // クリーンアップ
    console.log('\n🧹 クリーンアップ: テスト投稿を削除');
    await prisma.post.delete({ where: { id: post.id } });
    console.log('✅ 削除完了');

  } catch (error) {
    console.error('❌ エラー発生:', error);

    // Prismaエラーの詳細を表示
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('   Prismaエラーコード:', (error as any).code);
      console.error('   Meta情報:', JSON.stringify((error as any).meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

simplePostTest();
