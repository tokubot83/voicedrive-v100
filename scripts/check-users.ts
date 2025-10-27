import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

prisma.user.findFirst()
  .then(user => {
    console.log('Sample user:', user?.id || 'No users found');
  })
  .finally(() => prisma.$disconnect());
