import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: 'user_123' },
    update: { permissionLevel: 7 },
    create: {
      id: 'user_123',
      employeeId: 'U123',
      email: 'user123@test.com',
      name: 'テストユーザー123',
      department: '看護部',
      facilityId: 'facility-1',
      permissionLevel: 7,
      accountType: 'staff',
      isRetired: false,
    },
  });
  console.log('✅ user_123 created');
}

main()
  .finally(() => prisma.$disconnect());
