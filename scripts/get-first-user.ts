import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getFirstUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        isRetired: false
      }
    });

    if (user) {
      console.log('✅ ユーザーID:', user.id);
      console.log('   名前:', user.name);
      console.log('   職員ID:', user.employeeId);
    } else {
      console.log('❌ ユーザーが見つかりませんでした');
    }
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getFirstUser();
