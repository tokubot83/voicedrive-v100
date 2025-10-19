import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.sidebarMenuConfig.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  console.log(`\n📋 サイドバーメニュー設定 (${configs.length}件)\n`);
  console.log('順序 | ID | ラベル | 表示 | デバイス');
  console.log(''.padEnd(70, '-'));

  for (const config of configs) {
    const devices = [];
    if (config.showOnDesktop) devices.push('PC');
    if (config.showOnMobile) devices.push('スマホ');
    if (config.showOnTablet) devices.push('タブレット');

    console.log(
      `${String(config.displayOrder).padStart(4)} | ` +
      `${config.menuItemId.padEnd(24)} | ` +
      `${config.label.padEnd(20)} | ` +
      `${config.isVisible ? '✅' : '❌'} | ` +
      `${devices.join(', ')}`
    );
  }

  console.log('\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
